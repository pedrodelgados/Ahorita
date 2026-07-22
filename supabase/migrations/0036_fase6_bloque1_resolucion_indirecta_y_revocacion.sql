-- Fase 6, Bloque 1 (adenda técnica, aprobada 2026-07-22): corrige dos brechas
-- encontradas en auditoría posterior a la migración `0035`, antes de aprobar
-- definitivamente el bloque. No reabre ni edita `0035` (ya aplicada) — se
-- corrige hacia adelante, mismo patrón ya usado en este proyecto (p. ej.
-- `0028` sobre `0027`).
--
-- ---------------------------------------------------------------------
-- Brecha 1: resolución indirecta de categoría/zona por autor.
-- ---------------------------------------------------------------------
-- `0035` excluía Promoción del aprendizaje, y a Publicación sin categoría
-- propia, únicamente porque el *detalle* no almacena categoría — ignorando
-- que el *autor* (siempre un actor negocio/organizador con `business_id`,
-- nunca una persona: ver `actor_can_author_publication`/
-- `actor_can_author_promotion`) sí tiene categoría y zona conocidas y
-- públicas en `businesses`. Del mismo modo, seguir a un negocio solo
-- alimentaba la dimensión `actor_seguido`, nunca la de categoría/zona de ese
-- negocio. Y un Evento solo usaba su categoría propia, ignorando que
-- `events.business_id` (existente desde la migración `0010`) resuelve su
-- zona de forma confiable cuando el evento pertenece a un negocio.
--
-- Se resuelve con `public.resolve_affinity_category_zone()`, función
-- compartida entre el trigger de inserción y el nuevo trigger de
-- revocación (evita que ambos diverjan con el tiempo). Reglas:
--   - event:       categoría propia; zona vía `business_id` (si existe).
--   - place:       categoría y zona propias (sin cambios).
--   - publicacion: categoría propia, con fallback a la categoría del
--                  negocio autor si la publicación no tiene una propia;
--                  zona siempre del negocio autor (sin cambios respecto a
--                  `0035`, la publicación nunca tuvo zona propia).
--   - promocion:   categoría y zona del negocio autor (nunca tuvo
--                  categoría propia) — antes excluida por completo, ahora
--                  aporta exactamente igual que una publicación.
--   - actor (seguir/interactuar con un negocio u organizador): además de
--                  la dimensión `actor_seguido` ya existente, aporta
--                  también a categoría/zona del negocio seguido — las dos
--                  dimensiones nunca compiten entre sí (principio ya
--                  registrado en el contrato), así que ambas se registran.
-- Ninguna relación nueva usa `lat`/`lng` para inventar una zona: `zones` no
-- tiene geometría, así que solo se usan claves foráneas ya existentes
-- (`events.business_id`, `actors.business_id`) — nunca una inferencia
-- geográfica no confiable. Seguir a una persona sigue sin aportar
-- categoría/zona (una persona no tiene ninguna).
--
-- Privacidad: ninguna de estas resoluciones almacena ni expone el objeto
-- específico interactuado — solo usa `businesses.category`/`zone_id`,
-- atributos públicos de la entidad autora, igual que ya hacía `0035` para
-- la zona de una publicación.
--
-- ---------------------------------------------------------------------
-- Brecha 2: evidencia histórica vs. señal activa.
-- ---------------------------------------------------------------------
-- `0035` dejaba una interacción deshecha (dejar de seguir, quitar un "me
-- gusta", retirar "quiero ir") con exactamente el mismo peso histórico que
-- una señal todavía activa, indefinidamente. Se preserva el registro
-- append-only (nunca se borra ni se muta la fila original) y se agrega una
-- fila de COMPENSACIÓN (`signal_type = 'revocacion'`, fuerza igual a la
-- fuerza original en negativo) cuando se elimina una interacción alternable
-- de `interactions` — nunca cuando se elimina un target de contenido, y
-- nunca para 'comentario' (su soft-delete jamás produce un `DELETE` real
-- sobre `interactions`, ver `protect_comment_soft_delete()` — no debe
-- confundirse con retirar una afinidad).
--
-- Por qué esto basta sin rediseñar el cálculo: `raw_positive_strength` usa
-- `greatest(strength, 0)`, así que la fila de compensación (negativa) nunca
-- cuenta ahí — el piso sigue reflejando que la evidencia positiva existió
-- alguna vez (no se borra la historia). El peso DECAÍDO neto, en cambio,
-- cae de inmediato hacia el piso apenas se revoca (la compensación, recién
-- creada, cancela casi por completo el valor decaído de la señal original
-- en ese instante) y permanece ahí — nunca vuelve a crecer, nunca se
-- vuelve negativo de forma visible (`greatest(decayed, floor)` lo evita).
-- Generaliza sin ningún caso especial a ciclos repetidos (seguir → dejar
-- de seguir → volver a seguir): cada evento es una fila más, la suma
-- ponderada por recencia siempre refleja el estado más reciente con más
-- peso. Sin impacto en las tres correcciones (operan por marca de agua
-- sobre la dimensión completa, ya activa constant o no); sin impacto en
-- privacidad (misma forma que cualquier otra fila, nunca referencia la
-- interacción original ni el objeto específico).
--
-- "Compartir" no tiene ningún "deshacer" expuesto en la interfaz
-- (`registerShare` es idempotente por diseño), pero la política de RLS de
-- `interactions` ("El dueño del actor quita sus interacciones", migración
-- `0015`) técnicamente permite borrar cualquier tipo, incluido `compartir`.
-- Se trata igual que los demás tipos alternables por coherencia
-- estructural y para no dejar una asimetría silenciosa si algún flujo
-- futuro sí lo borra.
--
-- Defecto real encontrado durante este mismo análisis, antes de escribir
-- código: `affinity_contributions.actor_id references actors(id) on
-- delete cascade`. Al eliminar una cuenta, Postgres cascada el borrado de
-- `interactions` de ese actor DENTRO de la misma transacción — si el
-- trigger de revocación intentara insertar una fila nueva referenciando
-- ese mismo `actor_id`, la fila padre en `actors` ya sería invisible por
-- las reglas de visibilidad MVCC dentro de la propia transacción, violando
-- la restricción de clave foránea y abortando la eliminación completa de
-- la cuenta. Se previene con una guarda explícita: si el actor propietario
-- ya no existe, no se inserta ninguna compensación (el resto de su ledger
-- se elimina de todas formas por la misma cascada).
--
-- Marca de regla (`rule_version = 2`): las contribuciones producidas por
-- la resolución ampliada (record_affinity_contribution ya corregido) y por
-- el nuevo trigger de revocación se etiquetan con `rule_version = 2`, para
-- distinguirlas de las producidas por la resolución original de `0035`
-- (`rule_version = 1`, sin cambios) — mismo mecanismo de calibración ya
-- aprobado en el contrato, usado aquí para su propósito original.

alter table public.affinity_contributions drop constraint affinity_contributions_signal_type_check;
alter table public.affinity_contributions add constraint affinity_contributions_signal_type_check check (
  signal_type in (
    'me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir', 'comentario',
    'correccion_atenuar', 'correccion_reiniciar', 'correccion_desconocido',
    'revocacion'
  )
);

-- -----------------------------------------------------------------------
-- 1. Resolución compartida de categoría/zona por target de contenido.
--    Usada por el trigger de inserción y por el nuevo trigger de
--    revocación — una sola fuente de verdad para ambos.
-- -----------------------------------------------------------------------
create function public.resolve_affinity_category_zone(
  p_target_type text,
  p_target_id uuid,
  out out_category text,
  out out_zone_id uuid
)
language plpgsql
security definer set search_path = public
stable
as $$
begin
  if p_target_type = 'event' then
    select e.category, b.zone_id
      into out_category, out_zone_id
      from public.events e
      left join public.businesses b on b.id = e.business_id
      where e.id = p_target_id;

  elsif p_target_type = 'place' then
    select channel_default, zone_id into out_category, out_zone_id
      from public.places where id = p_target_id;

  elsif p_target_type in ('publicacion', 'promocion') then
    -- Promoción nunca tiene fila en publication_posts, así que pp.category
    -- siempre es NULL para ella y coalesce cae directo a la categoría del
    -- negocio autor -- misma consulta sirve a ambos subtipos sin duplicar
    -- lógica. Publicación prefiere su categoría propia si la tiene.
    select
      coalesce(pp.category, b.category),
      b.zone_id
      into out_category, out_zone_id
      from public.publications p
      left join public.publication_posts pp on pp.publication_id = p.id
      left join public.actors a on a.id = p.actor_id
      left join public.businesses b on b.id = a.business_id
      where p.id = p_target_id;
  end if;
end;
$$;

comment on function public.resolve_affinity_category_zone(text, uuid) is
  'Fase 6, Bloque 1: resolución única de categoría/zona por tipo de contenido, compartida entre record_affinity_contribution() y record_affinity_revocation() para que nunca diverjan. Solo usa relaciones ya existentes y confiables (business_id de Evento/Publicación/Promoción) -- nunca infiere zona desde coordenadas.';

-- -----------------------------------------------------------------------
-- 2. record_affinity_contribution(): reemplazo que usa la resolución
--    compartida y agrega la contribución de categoría/zona al seguir un
--    negocio/organizador.
-- -----------------------------------------------------------------------
create or replace function public.record_affinity_contribution()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor_type text;
  v_category text;
  v_zone_id uuid;
  v_strength numeric;
  v_followed_category text;
  v_followed_zone_id uuid;
begin
  if new.type not in ('me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir', 'comentario') then
    return new;
  end if;

  -- Alcance de este bloque: solo actores de tipo persona navegan un Feed
  -- personalizable — un negocio u organizador no acumula afinidad propia
  -- en esta fase.
  select type into v_actor_type from public.actors where id = new.actor_id;
  if v_actor_type <> 'persona' then
    return new;
  end if;

  v_strength := case new.type
    when 'ya_fui' then 7
    when 'seguimiento' then 6
    when 'quiero_ir' then 5
    when 'guardado' then 4
    when 'comentario' then 3
    when 'me_gusta' then 2
    when 'compartir' then 1
  end;

  if new.target_type = 'actor' then
    insert into public.affinity_contributions (actor_id, target_kind, followed_actor_id, signal_type, strength)
    values (new.actor_id, 'actor_seguido', new.target_id, new.type, v_strength);

    -- Además de la dimensión nombrada, si el actor interactuado es un
    -- negocio/organizador, también aporta a su categoría/zona -- las dos
    -- dimensiones nunca compiten entre sí (principio ya registrado).
    select b.category, b.zone_id
      into v_followed_category, v_followed_zone_id
      from public.actors a
      join public.businesses b on b.id = a.business_id
      where a.id = new.target_id;

    if v_followed_category is not null then
      insert into public.affinity_contributions (actor_id, target_kind, category, zone_id, signal_type, strength, rule_version)
      values (new.actor_id, 'categoria', v_followed_category, v_followed_zone_id, new.type, v_strength, 2);
    end if;

    return new;
  end if;

  select r.out_category, r.out_zone_id into v_category, v_zone_id
    from public.resolve_affinity_category_zone(new.target_type, new.target_id) r;

  if v_category is null then
    return new;
  end if;

  insert into public.affinity_contributions (actor_id, target_kind, category, zone_id, signal_type, strength, rule_version)
  values (new.actor_id, 'categoria', v_category, v_zone_id, new.type, v_strength, 2);

  return new;
end;
$$;

comment on function public.record_affinity_contribution() is
  'Fase 6, Bloque 1 (corregido tras auditoría): resuelve categoría/zona vía resolve_affinity_category_zone() -- incluye fallback a la categoría/zona del negocio autor para Publicación sin categoría propia y para Promoción (antes excluida por completo), y zona de Evento vía su negocio organizador. Seguir/interactuar con un actor negocio/organizador aporta también a su categoría/zona, además de la dimensión actor_seguido. No modifica interactions -- el Registro de Señales permanece pasivo.';

-- -----------------------------------------------------------------------
-- 3. record_affinity_revocation(): nuevo trigger AFTER DELETE. Preserva la
--    fila original append-only; registra una fila de compensación para
--    que el peso calculado deje de tratar una señal revocada como activa.
-- -----------------------------------------------------------------------
create function public.record_affinity_revocation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor_type text;
  v_category text;
  v_zone_id uuid;
  v_strength numeric;
  v_followed_category text;
  v_followed_zone_id uuid;
begin
  -- 'comentario' nunca produce un DELETE real sobre interactions
  -- (protect_comment_soft_delete() solo permite UPDATE) -- se excluye aquí
  -- de todas formas por claridad: un soft-delete de comentario nunca debe
  -- confundirse con retirar una afinidad.
  if old.type not in ('me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir') then
    return old;
  end if;

  -- Guarda contra el borrado en cascada de cuentas: si el actor ya no
  -- existe (su cuenta se está eliminando e interactions cascadeó desde
  -- actors, dentro de la misma transacción), no se inserta ninguna
  -- compensación -- todo su ledger se elimina de todas formas por la
  -- misma cascada, y la inserción violaría la clave foránea.
  if not exists (select 1 from public.actors where id = old.actor_id) then
    return old;
  end if;

  select type into v_actor_type from public.actors where id = old.actor_id;
  if v_actor_type <> 'persona' then
    return old;
  end if;

  v_strength := case old.type
    when 'ya_fui' then 7
    when 'seguimiento' then 6
    when 'quiero_ir' then 5
    when 'guardado' then 4
    when 'me_gusta' then 2
    when 'compartir' then 1
  end;

  if old.target_type = 'actor' then
    insert into public.affinity_contributions (actor_id, target_kind, followed_actor_id, signal_type, strength, rule_version)
    values (old.actor_id, 'actor_seguido', old.target_id, 'revocacion', -v_strength, 2);

    select b.category, b.zone_id
      into v_followed_category, v_followed_zone_id
      from public.actors a
      join public.businesses b on b.id = a.business_id
      where a.id = old.target_id;

    if v_followed_category is not null then
      insert into public.affinity_contributions (actor_id, target_kind, category, zone_id, signal_type, strength, rule_version)
      values (old.actor_id, 'categoria', v_followed_category, v_followed_zone_id, 'revocacion', -v_strength, 2);
    end if;

    return old;
  end if;

  select r.out_category, r.out_zone_id into v_category, v_zone_id
    from public.resolve_affinity_category_zone(old.target_type, old.target_id) r;

  if v_category is null then
    return old;
  end if;

  insert into public.affinity_contributions (actor_id, target_kind, category, zone_id, signal_type, strength, rule_version)
  values (old.actor_id, 'categoria', v_category, v_zone_id, 'revocacion', -v_strength, 2);

  return old;
end;
$$;

create trigger record_affinity_revocation_after_delete
  after delete on public.interactions
  for each row execute function public.record_affinity_revocation();

comment on trigger record_affinity_revocation_after_delete on public.interactions is
  'Fase 6, Bloque 1 (adenda): registra una fila de compensación append-only cuando se elimina una interacción alternable, para que affinity_profile() deje de tratar una señal revocada como si siguiera activa -- nunca borra ni modifica la contribución original. No se dispara para "comentario" (nunca tiene DELETE real) ni cuando el propio actor ya dejó de existir (borrado en cascada de cuenta).';
