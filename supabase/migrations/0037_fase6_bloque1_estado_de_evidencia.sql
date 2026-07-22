-- Fase 6, Bloque 1 (segunda adenda, aprobada 2026-07-22): precisión final
-- antes del cierre definitivo del bloque. Dos puntos registrados por el
-- Product Owner:
--
-- 1. Evidencia histórica frente a interés actual. Ya se aprobó (adenda
--    anterior, migración `0036`) que una interacción revocada conserve su
--    contribución histórica y que el peso calculado caiga hacia el piso.
--    Falta distinguir, en la LECTURA, una afinidad sostenida únicamente
--    por evidencia ya revocada de una sostenida por evidencia todavía
--    vigente -- para que la confianza y cualquier explicación futura
--    nunca describan en presente algo que ya dejó de ser cierto.
--
-- 2. Contribución multidimensional de seguimiento (ya implementada en
--    `0036`, re-auditada aquí). Se confirma por análisis de código y se
--    verifica empíricamente que seguir a un negocio/organizador produce
--    EXACTAMENTE una fila en la dimensión `actor_seguido` y EXACTAMENTE
--    una fila (condicional) en la dimensión `categoria` -- nunca dos
--    veces la misma dimensión por una sola acción. No requirió ningún
--    cambio de código: `record_affinity_contribution()` y
--    `record_affinity_revocation()` (rama `target_type = 'actor'`) ya
--    hacen exactamente un `insert` por dimensión, con un `return`
--    inmediato que evita cualquier segunda ruta de escritura. Ver
--    PROJECT.md para la verificación empírica que lo confirma.
--
-- Solución para el punto 1: se agrega `evidence_status` a la salida de
-- `affinity_profile()` -- 'activa' cuando el peso decaído SIN piso
-- (`decayed_weight`, ya calculado internamente) sigue siendo positivo, es
-- decir, cuando existe al menos una fracción de evidencia todavía viva
-- después de descontar cualquier compensación de revocación;
-- 'historica' cuando ese mismo valor ya cayó a cero o menos, es decir,
-- cuando el único motivo por el que la dimensión sigue apareciendo es el
-- piso mínimo (protección contra el olvido total, no un interés vigente).
-- Este criterio es puramente aditivo sobre el cálculo ya existente -- no
-- requiere rastrear qué contribución individual fue revocada (lo cual
-- violaría la privacidad ya garantizada: nunca se sabe ni se expone qué
-- objeto específico originó una contribución), y generaliza
-- correctamente a revocaciones parciales: si de tres "me gusta" en la
-- misma categoría se retira solo uno, el peso decaído de los otros dos
-- sigue siendo positivo, así que la dimensión correctamente permanece
-- 'activa' -- una revocación parcial nunca degrada de más.
--
-- La confianza (`confidence`) se degrada un nivel cuando `evidence_status
-- = 'historica'` (alto -> medio, medio -> bajo, bajo se mantiene) -- una
-- afinidad sin ninguna evidencia actualmente viva nunca debe mostrarse
-- con la misma confianza que una equivalente en bruto pero todavía
-- activa, aun cuando `raw_positive_strength` (que nunca se modifica, para
-- preservar la historia) sea idéntico en ambos casos.
--
-- No cambia nada del cálculo de `weight` (sigue aplicando el piso
-- exactamente igual que antes) ni de `correction_state` (ortogonal:
-- describe correcciones explícitas, no el estado implícito de la
-- evidencia). No se puede reconstruir desde `evidence_status` ni desde
-- ningún otro campo cuál fue el objeto específico revocado -- solo indica
-- si la dimensión, en conjunto, sigue teniendo respaldo vivo.

drop function public.affinity_profile(uuid);

create function public.affinity_profile(check_actor_id uuid)
returns table (
  target_kind text,
  category text,
  zone_id uuid,
  refined boolean,
  followed_actor_id uuid,
  weight numeric,
  confidence text,
  evidence_status text,
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
  -- sesión. Defecto real encontrado y corregido durante la verificación
  -- de `0035`, antes de cualquier commit.
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
      when c.decayed_weight > 0 and c.raw_positive_strength >= 8 then 'alto'
      when c.decayed_weight > 0 and c.raw_positive_strength >= 3 then 'medio'
      when c.decayed_weight <= 0 and c.raw_positive_strength >= 8 then 'medio'
      when c.decayed_weight <= 0 and c.raw_positive_strength >= 3 then 'bajo'
      else 'bajo'
    end as confidence,
    case when c.decayed_weight > 0 then 'activa' else 'historica' end as evidence_status,
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
  'Fase 6, Bloque 1: única función de lectura del Motor de Afinidad. Calcula peso, confianza, estado de evidencia y estado de corrección en el momento de la llamada a partir de affinity_contributions — nunca lee ni expone un valor precalculado. evidence_status distingue una afinidad con evidencia todavía viva ("activa") de una sostenida únicamente por el piso tras revocaciones ("historica") -- sin reconstruir jamás qué contribución individual fue revocada. Visible únicamente para la propia dueña del actor (auth.uid() debe coincidir con su profile_id) — sin excepción para administradores. Los parámetros de decaimiento, piso mínimo y umbrales de confianza/refinamiento son constantes de calibración, sujetas a ajuste futuro sin cambiar la arquitectura.';
