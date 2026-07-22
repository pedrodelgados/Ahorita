-- Fase 6 (ver MASTERPLAN.md), Bloque 1: Motor de Afinidad.
--
-- Autoridad de diseño: FASE6_FILOSOFIA_DESCUBRIMIENTO.md y
-- FASE6_CONTRATO_ARQUITECTONICO.md (aprobados antes de esta migración).
-- Este bloque construye ÚNICAMENTE el Motor de Afinidad: produce una
-- descripción legible y corregible de qué le interesa a cada persona, a
-- partir de `interactions` (Registro de Señales, ya cerrado desde la Fase
-- 5B). No decide qué se muestra en ningún Feed — eso pertenece al Motor de
-- Garantías y al Compositor, ambos fuera de alcance de este bloque.
--
-- Reglas de pureza no negociables (ver el contrato):
--   1. El Registro de Señales (`interactions`) es pasivo: esta migración no
--      le agrega ninguna columna, ningún trigger que cambie su
--      comportamiento, ni ninguna responsabilidad nueva. El trigger que
--      agrega este bloque solo LEE `interactions` al insertarse una fila;
--      `interactions` en sí sigue siendo escrita exactamente por los mismos
--      llamadores de siempre, sin ningún cambio observable.
--   2. El Motor de Afinidad construye conocimiento, no decisiones: su única
--      salida es una descripción de la persona, nunca un veredicto sobre
--      contenido a mostrar.
--   3. (El Compositor, componente puro, no existe todavía en este bloque.)
--
-- Principios permanentes del Motor de Afinidad ya registrados en el
-- contrato: las afinidades describen personas, nunca las clasifican; el
-- perfil es siempre la mejor interpretación disponible, nunca una verdad
-- definitiva; cada afinidad registra su última actualización; las
-- afinidades nunca compiten entre sí.
--
-- Decisión de persistencia (aprobada tras el análisis comparativo): se
-- almacena un registro de CONTRIBUCIONES append-only (nunca se actualiza ni
-- se borra una fila ya escrita) como única fuente de verdad. El peso, la
-- confianza y el estado de cada afinidad se CALCULAN en el momento de
-- leer, nunca se guardan como un valor mutable — evita exactamente la
-- clase de defecto ya encontrada dos veces en este proyecto (el huérfano de
-- `reconcile_follows_to_interactions` en la Fase 3, y el doble conteo del
-- Bloque 3 de la Fase 5B), ambos originados en un contador que debía
-- mantenerse sincronizado con inserciones Y eliminaciones de otra tabla.
--
-- Principio permanente adicional (registrado en FASE6_CONTRATO_ARQUITECTONICO.md):
-- el registro de contribuciones existe EXCLUSIVAMENTE para preservar la
-- coherencia del aprendizaje del sistema. Nunca se expone como cronología
-- de actividad visible, nunca se usa para reconstruir qué hizo una persona
-- y cuándo de forma legible — por eso no se referencia aquí ninguna fila
-- concreta de `interactions`, solo la dimensión abstracta a la que
-- contribuye (categoría, categoría+zona, o actor seguido) y su fuerza. Por
-- el mismo motivo, esta tabla no tiene ninguna política de RLS que permita
-- leerla directamente — ni siquiera a su propia dueña: solo se lee a
-- través de la función `affinity_profile()`, que devuelve exclusivamente
-- la descripción ya agregada y decaída, nunca las filas crudas.
--
-- Límite de alcance conocido y aceptado: las Promociones no tienen ningún
-- campo de categoría en su esquema (`promotion_details` nunca lo tuvo,
-- Fase 4 Bloque 3) — una interacción sobre una Promoción no genera ninguna
-- contribución de categoría en este bloque. No es un defecto: es la
-- consecuencia honesta de que Promoción nunca fue diseñada como contenido
-- clasificable por categoría. Los Eventos tampoco tienen zona estructurada
-- (`events` nunca ganó `zone_id`, a diferencia de `places`/`businesses`),
-- así que una interacción sobre un Evento solo contribuye a nivel de
-- categoría, nunca a categoría+zona.
--
-- Comportamiento deliberado ante la eliminación de una interacción (dejar
-- de seguir, quitar un "me gusta"): la contribución ya registrada NO se
-- borra ni se decrementa — el registro de contribuciones es append-only
-- por diseño. Un "deshacer" no borra la evidencia histórica de que esa
-- señal existió alguna vez; su peso solo disminuye con el decaimiento
-- natural por el paso del tiempo, o mediante una acción explícita de
-- corrección (ver más abajo). Esto es intencional, no un descuido: es
-- exactamente la garantía que evita el patrón de error ya conocido en este
-- proyecto.

-- -----------------------------------------------------------------------
-- 1. Registro de contribuciones (append-only, sin política de lectura).
-- -----------------------------------------------------------------------
create table public.affinity_contributions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  target_kind text not null check (target_kind in ('categoria', 'actor_seguido')),
  category text,
  zone_id uuid references public.zones (id) on delete set null,
  followed_actor_id uuid references public.actors (id) on delete cascade,
  signal_type text not null check (
    signal_type in (
      'me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir', 'comentario',
      'correccion_atenuar', 'correccion_reiniciar', 'correccion_desconocido'
    )
  ),
  strength numeric not null,
  rule_version integer not null default 1,
  created_at timestamptz not null default now(),
  constraint affinity_contributions_shape check (
    (target_kind = 'categoria' and category is not null and followed_actor_id is null)
    or (target_kind = 'actor_seguido' and category is null and zone_id is null and followed_actor_id is not null)
  )
);

comment on table public.affinity_contributions is
  'Fase 6, Bloque 1: registro append-only de evidencia para el Motor de Afinidad. Nunca se actualiza ni se borra una fila ya escrita — un "deshacer" en interactions no revierte la contribución histórica, solo el decaimiento natural o una corrección explícita reduce su influencia futura. Existe exclusivamente para preservar la coherencia y capacidad de recálculo del Motor de Afinidad — nunca debe usarse para reconstruir una cronología de actividad visible de una persona ni para ningún propósito de vigilancia. Sin políticas de RLS de lectura: se accede únicamente a través de affinity_profile(), que devuelve solo el resultado ya agregado.';

alter table public.affinity_contributions enable row level security;
-- Deliberadamente sin ninguna política: nadie, ni siquiera la propia
-- dueña del actor, puede leer esta tabla directamente. Solo funciones
-- `security definer` (el trigger que escribe, y affinity_profile() que
-- lee) pueden tocarla.

create index affinity_contributions_actor_dimension_idx
  on public.affinity_contributions (actor_id, target_kind, category, followed_actor_id, created_at);

-- -----------------------------------------------------------------------
-- 2. Trigger que registra contribuciones a partir de interactions.
--    Solo lee interactions (después de que la fila ya se insertó);
--    interactions en sí no cambia en nada.
-- -----------------------------------------------------------------------
create function public.record_affinity_contribution()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor_type text;
  v_target_kind text;
  v_category text;
  v_zone_id uuid;
  v_strength numeric;
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
    return new;
  end if;

  if new.target_type = 'event' then
    select category into v_category from public.events where id = new.target_id;
    v_zone_id := null; -- events no tiene zona estructurada todavía.
  elsif new.target_type = 'place' then
    select channel_default, zone_id into v_category, v_zone_id from public.places where id = new.target_id;
  elsif new.target_type = 'publicacion' then
    select pp.category, b.zone_id
      into v_category, v_zone_id
      from public.publications p
      join public.publication_posts pp on pp.publication_id = p.id
      left join public.actors a on a.id = p.actor_id
      left join public.businesses b on b.id = a.business_id
      where p.id = new.target_id;
  else
    -- 'promocion' (sin categoría en su esquema) y cualquier target_type
    -- futuro no contemplado: sin contribución, a propósito.
    return new;
  end if;

  if v_category is null then
    return new;
  end if;

  insert into public.affinity_contributions (actor_id, target_kind, category, zone_id, signal_type, strength)
  values (new.actor_id, 'categoria', v_category, v_zone_id, new.type, v_strength);

  return new;
end;
$$;

create trigger record_affinity_contribution_after_insert
  after insert on public.interactions
  for each row execute function public.record_affinity_contribution();

comment on trigger record_affinity_contribution_after_insert on public.interactions is
  'Fase 6, Bloque 1: única reacción de escritura hacia affinity_contributions. No modifica interactions — el Registro de Señales permanece pasivo, esta es maquinaria propia del Motor de Afinidad adjunta por necesidad técnica de Postgres (los triggers se declaran sobre la tabla que observan), no una responsabilidad nueva del registro.';

-- -----------------------------------------------------------------------
-- 3. Función de corrección explícita (las tres acciones aprobadas).
--    Escribe una fila de corrección — nunca borra ni modifica una
--    contribución existente.
-- -----------------------------------------------------------------------
create function public.apply_affinity_correction(
  p_category text,
  p_followed_actor_id uuid,
  p_correction text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_actor_id uuid;
  v_target_kind text;
  v_strength numeric;
begin
  if p_correction not in ('atenuar', 'reiniciar', 'desconocido') then
    raise exception 'Corrección de afinidad no reconocida.' using errcode = '23514';
  end if;

  if (p_category is null) = (p_followed_actor_id is null) then
    raise exception 'Debe corregirse exactamente una categoría o un actor seguido, no ambos ni ninguno.' using errcode = '23514';
  end if;

  select id into v_actor_id from public.actors where profile_id = auth.uid();
  if v_actor_id is null then
    raise exception 'No se encontró un actor propio para aplicar esta corrección.' using errcode = '23514';
  end if;

  v_target_kind := case when p_category is not null then 'categoria' else 'actor_seguido' end;
  v_strength := case when p_correction = 'atenuar' then -2 else 0 end;

  insert into public.affinity_contributions (actor_id, target_kind, category, followed_actor_id, signal_type, strength)
  values (
    v_actor_id,
    v_target_kind,
    p_category,
    p_followed_actor_id,
    'correccion_' || p_correction,
    v_strength
  );
end;
$$;

comment on function public.apply_affinity_correction(text, uuid, text) is
  'Fase 6, Bloque 1: única vía de escritura de corrección explícita sobre el propio perfil de afinidad — "reducir influencia" (atenuar), "restablecer aprendizaje" (reiniciar) y "volver a estado desconocido" (desconocido). Siempre resuelve el actor propio desde auth.uid(); nunca permite corregir el perfil de otra persona.';

-- -----------------------------------------------------------------------
-- 4. Lectura: affinity_profile() calcula peso/confianza en el momento,
--    a partir del registro de contribuciones, sin ningún valor
--    precalculado y persistido como verdad.
-- -----------------------------------------------------------------------
create function public.affinity_profile(check_actor_id uuid)
returns table (
  target_kind text,
  category text,
  zone_id uuid,
  refined boolean,
  followed_actor_id uuid,
  weight numeric,
  confidence text,
  correction_state text,
  last_updated_at timestamptz
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_owner_profile_id uuid;
  -- Parámetros de calibración (ver PROJECT.md, Fase 6 Bloque 1, para el
  -- registro de que estos valores son ajustables y no arquitectura):
  v_half_life_days constant numeric := 90;
  v_floor_ratio constant numeric := 0.15;
  v_desconocido_threshold constant numeric := 3;
  v_reset_recency_days constant numeric := 30;
begin
  select profile_id into v_owner_profile_id from public.actors where id = check_actor_id;
  -- Privacidad estricta (ver el contrato): el perfil de afinidad es
  -- visible únicamente para su propia dueña — ni siquiera un
  -- administrador de plataforma tiene una excepción aquí.
  -- `is distinct from` (nunca `<>`) es obligatorio aquí: con `<>`, un
  -- llamador sin sesión real (auth.uid() = NULL, por ejemplo el rol
  -- `anon`) produce `v_owner_profile_id <> NULL` = NULL, no `true` — y
  -- `if NULL then` se comporta como falso, dejando pasar la lectura sin
  -- sesión. Defecto real encontrado y corregido durante esta misma
  -- verificación, antes de cualquier commit: un anónimo podía leer el
  -- perfil de afinidad de cualquier persona.
  if v_owner_profile_id is distinct from auth.uid() then
    return;
  end if;

  return query
  with watermarks as (
    select
      ac.target_kind as wm_target_kind,
      ac.category as wm_category,
      ac.followed_actor_id as wm_followed_actor_id,
      max(ac.created_at) as watermark_at,
      bool_or(ac.signal_type = 'correccion_desconocido') as has_desconocido
    from public.affinity_contributions ac
    where ac.actor_id = check_actor_id
      and ac.signal_type in ('correccion_reiniciar', 'correccion_desconocido')
    group by ac.target_kind, ac.category, ac.followed_actor_id
  ),
  relevant as (
    select
      ac.target_kind as r_target_kind,
      ac.category as r_category,
      ac.zone_id as r_zone_id,
      ac.followed_actor_id as r_followed_actor_id,
      ac.strength as r_strength,
      ac.created_at as r_created_at,
      -- El estado "recién reiniciado/desconocido" es informativo, no
      -- permanente: pasada una ventana razonable desde la corrección
      -- (v_reset_recency_days), el perfil vuelve a describirse como
      -- "activo" con normalidad — nunca debe quedar etiquetado para
      -- siempre como "recién corregido" mucho después de que eso haya
      -- dejado de ser cierto (principio: la mejor interpretación
      -- disponible ahora, nunca una etiqueta congelada).
      (coalesce(w.has_desconocido, false) and w.watermark_at > now() - make_interval(days => v_reset_recency_days::int)) as r_dimension_suppressed
    from public.affinity_contributions ac
    left join watermarks w
      on w.wm_target_kind = ac.target_kind
      and w.wm_category is not distinct from ac.category
      and w.wm_followed_actor_id is not distinct from ac.followed_actor_id
    where ac.actor_id = check_actor_id
      and ac.signal_type not in ('correccion_reiniciar', 'correccion_desconocido')
      and (w.watermark_at is null or ac.created_at > w.watermark_at)
  ),
  by_category as (
    select
      'categoria'::text as out_target_kind,
      r_category as out_category,
      null::uuid as out_zone_id,
      false as out_refined,
      null::uuid as out_followed_actor_id,
      sum(r_strength * power(0.5, extract(epoch from (now() - r_created_at)) / 86400.0 / v_half_life_days)) as decayed_weight,
      sum(greatest(r_strength, 0)) as raw_positive_strength,
      max(r_created_at) as out_last_updated_at,
      bool_or(r_dimension_suppressed) as out_suppressed
    from relevant
    where r_target_kind = 'categoria'
    group by r_category
  ),
  by_category_zone as (
    select
      'categoria'::text as out_target_kind,
      r_category as out_category,
      r_zone_id as out_zone_id,
      true as out_refined,
      null::uuid as out_followed_actor_id,
      sum(r_strength * power(0.5, extract(epoch from (now() - r_created_at)) / 86400.0 / v_half_life_days)) as decayed_weight,
      sum(greatest(r_strength, 0)) as raw_positive_strength,
      max(r_created_at) as out_last_updated_at,
      bool_or(r_dimension_suppressed) as out_suppressed
    from relevant
    where r_target_kind = 'categoria' and r_zone_id is not null
    group by r_category, r_zone_id
    having count(*) filter (where r_zone_id is not null) >= 3 -- concentración mínima para refinar, calibrable
  ),
  by_actor as (
    select
      'actor_seguido'::text as out_target_kind,
      null::text as out_category,
      null::uuid as out_zone_id,
      false as out_refined,
      r_followed_actor_id as out_followed_actor_id,
      sum(r_strength * power(0.5, extract(epoch from (now() - r_created_at)) / 86400.0 / v_half_life_days)) as decayed_weight,
      sum(greatest(r_strength, 0)) as raw_positive_strength,
      max(r_created_at) as out_last_updated_at,
      bool_or(r_dimension_suppressed) as out_suppressed
    from relevant
    where r_target_kind = 'actor_seguido'
    group by r_followed_actor_id
  ),
  combined as (
    select * from by_category
    union all
    select * from by_category_zone
    union all
    select * from by_actor
  )
  select
    c.out_target_kind,
    c.out_category,
    c.out_zone_id,
    c.out_refined,
    c.out_followed_actor_id,
    greatest(c.decayed_weight, v_floor_ratio * c.raw_positive_strength) as weight,
    case
      when c.raw_positive_strength >= 8 then 'alto'
      when c.raw_positive_strength >= 3 then 'medio'
      else 'bajo'
    end as confidence,
    case
      when c.out_suppressed and c.raw_positive_strength < v_desconocido_threshold then 'desconocido'
      when c.out_suppressed then 'reiniciado_recientemente'
      else 'activo'
    end as correction_state,
    c.out_last_updated_at
  from combined c
  where c.raw_positive_strength > 0
    and not (c.out_suppressed and c.raw_positive_strength < v_desconocido_threshold);
end;
$$;

comment on function public.affinity_profile(uuid) is
  'Fase 6, Bloque 1: única función de lectura del Motor de Afinidad. Calcula peso, confianza y estado en el momento de la llamada a partir de affinity_contributions — nunca lee ni expone un valor precalculado. Visible únicamente para la propia dueña del actor (auth.uid() debe coincidir con su profile_id) — sin excepción para administradores. Los parámetros de decaimiento, piso mínimo y umbrales de confianza/refinamiento son constantes de calibración, sujetas a ajuste futuro sin cambiar la arquitectura.';
