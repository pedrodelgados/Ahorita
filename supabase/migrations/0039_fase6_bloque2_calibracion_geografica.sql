-- Fase 6, Bloque 2 (adenda, aprobada 2026-07-22): revisión de las dos
-- constantes geográficas introducidas en `0038` (radio único de 5 km,
-- exención total de radio para planificación futura), señaladas
-- explícitamente para revisión antes del cierre definitivo del bloque.
-- Corrige hacia adelante, sin reabrir `0038` (mismo patrón ya usado:
-- `0036`/`0037` sobre `0035`).
--
-- Hallazgo 1: un radio único aplicado por igual a Promoción, Evento y
-- Publicación no resiste el análisis -- 5 km ya cubre gran parte del área
-- urbana inmediata de Cuenca, debilitando el propósito de "cercanía para
-- ahorita" (VISION_MAESTRA.md §7). Se reemplaza por DOS radios según la
-- temporalidad del contenido, nunca según su categoría:
--   - Radio inmediato (3 km): Promociones y Publicaciones siempre (nunca
--     tienen un momento futuro único que planificar), y Eventos cuyo
--     inicio está dentro de la ventana cercana.
--   - Radio de planificación (15 km): EXCLUSIVAMENTE Eventos cuyo inicio
--     está más allá de la ventana cercana -- nunca Promociones ni
--     Publicaciones, que no tienen esa naturaleza de "ocurre una vez, en
--     un momento específico por venir". Esto ocurre estructuralmente
--     (p_event_start_at es NULL para Promoción/Publicación en
--     discoverable_content()), no por una validación adicional.
--
-- Hallazgo 2: la exención total de radio para planificación futura podía
-- anular por completo la restricción de cercanía -- exactamente el riesgo
-- señalado. Se reemplaza por un radio AMPLIADO (15 km), nunca una
-- exención completa. El umbral de 3 días se conserva -- ya resuelve, con
-- el radio ampliado, que un evento con 4-5 días de antelación no quede
-- excluido injustificadamente, sin necesidad de anular la cercanía por
-- completo.
--
-- Hallazgo 3: geo_eligible() solo devolvía un booleano, descartando la
-- razón por la que un contenido pasaba. El futuro Compositor necesitará
-- distinguir "cercanía confirmada" de "sin ninguna restricción evaluable"
-- para nunca mostrar "está cerca de ti" sobre contenido cuya proximidad
-- nunca se verificó. Se reemplaza el booleano por un estado textual,
-- expuesto también en cada función candidatos_*.
--
-- Hallazgo 4 (auditoría): las constantes de este bloque estaban repetidas
-- como literales dentro de cada función. Se centralizan todas (no solo
-- las dos geográficas) en discovery_calibration(), única fuente de
-- verdad -- cualquier ajuste futuro es una migración nueva, auditable por
-- el mismo historial de git que ya gobierna cada constante anterior.

-- -----------------------------------------------------------------------
-- 1. Calibración centralizada -- única fuente de verdad para todas las
--    constantes del Motor de Garantías.
-- -----------------------------------------------------------------------
create function public.discovery_calibration()
returns table (
  novelty_window_days integer,
  equity_frequency_days integer,
  equity_max_recent_count integer,
  diversity_max_per_actor integer,
  serendipity_confidence_threshold text,
  geo_radius_immediate_km double precision,
  geo_radius_planning_km double precision,
  geo_planning_threshold_days integer
)
language sql
immutable
as $$
  select
    7,      -- novedad: contenido aparecido en los últimos N días
    30,     -- equidad: ventana de baja frecuencia
    1,      -- equidad: máximo de contenido reciente adicional para calificar
    3,      -- diversidad: tope de candidatos por actor
    'alto', -- serendipia: confidence que excluye una categoría (junto con evidence_status = 'activa')
    3.0,    -- geografía: radio inmediato (Promociones, Publicaciones, Eventos cercanos en el tiempo)
    15.0,   -- geografía: radio de planificación (solo Eventos futuros más allá del umbral)
    3;      -- geografía: días de antelación que activan el radio de planificación
$$;

comment on function public.discovery_calibration() is
  'Fase 6, Bloque 2: única fuente de verdad de las constantes de calibración del Motor de Garantías -- ninguna función de este bloque debe declarar estos valores como literales propios. Cualquier ajuste futuro es una migración nueva, auditable por el mismo historial de git que ya gobierna cada constante de affinity_profile() (Bloque 1).';

-- -----------------------------------------------------------------------
-- 2. geo_eligible(): ahora devuelve un estado, no un booleano. Dos radios
--    según temporalidad -- nunca una exención total.
-- -----------------------------------------------------------------------
drop function public.geo_eligible(double precision, double precision, uuid, timestamptz, double precision, double precision, uuid);

create function public.geo_eligible(
  p_content_lat double precision,
  p_content_lng double precision,
  p_content_zone_id uuid,
  p_event_start_at timestamptz,
  p_actor_lat double precision,
  p_actor_lng double precision,
  p_manual_zone_id uuid
)
returns text
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_radius_immediate_km double precision;
  v_radius_planning_km double precision;
  v_planning_threshold_days integer;
  v_distance_km double precision;
begin
  select geo_radius_immediate_km, geo_radius_planning_km, geo_planning_threshold_days
    into v_radius_immediate_km, v_radius_planning_km, v_planning_threshold_days
    from public.discovery_calibration();

  -- 1. Preferencia explícita (zona elegida manualmente) siempre gana --
  --    ignora cualquier coordenada de geolocalización si existiera.
  if p_manual_zone_id is not null then
    if p_content_zone_id is not distinct from p_manual_zone_id then
      return 'zona_manual';
    else
      return null;
    end if;
  end if;

  -- 2. Sin geolocalización real y sin zona manual: no hay ninguna
  --    restricción que aplicar -- degradación honesta, nunca se infiere
  --    ubicación desde ninguna otra fuente (IP u otra).
  if p_actor_lat is null or p_actor_lng is null then
    return 'sin_restriccion';
  end if;

  -- 3. Sin coordenada propia del contenido: no hay relación confiable que
  --    evaluar -- nunca se excluye por una distancia que no puede
  --    calcularse, y nunca se etiqueta como "cercanía confirmada".
  if p_content_lat is null or p_content_lng is null then
    return 'sin_restriccion';
  end if;

  v_distance_km := 6371 * 2 * asin(sqrt(
    power(sin(radians(p_content_lat - p_actor_lat) / 2), 2)
    + cos(radians(p_actor_lat)) * cos(radians(p_content_lat))
      * power(sin(radians(p_content_lng - p_actor_lng) / 2), 2)
  ));

  -- 4. Planificación futura: EXCLUSIVAMENTE eventos (p_event_start_at no
  --    nulo -- nunca lo es para Promoción/Publicación) cuyo inicio supera
  --    el umbral. Usa el radio AMPLIADO, nunca una exención total.
  if p_event_start_at is not null and p_event_start_at > now() + make_interval(days => v_planning_threshold_days) then
    if v_distance_km <= v_radius_planning_km then
      return 'planificacion_futura';
    else
      return null;
    end if;
  end if;

  -- 5. Radio inmediato -- Promociones, Publicaciones, y Eventos dentro de
  --    la ventana cercana.
  if v_distance_km <= v_radius_immediate_km then
    return 'confirmada_cercana';
  else
    return null;
  end if;
end;
$$;

comment on function public.geo_eligible(double precision, double precision, uuid, timestamptz, double precision, double precision, uuid) is
  'Fase 6, Bloque 2 (corregido tras adenda): restricción geográfica dura compartida. Devuelve el ESTADO de elegibilidad (zona_manual/confirmada_cercana/planificacion_futura/sin_restriccion), nunca solo un booleano -- el futuro Compositor necesita distinguir cercanía confirmada de ausencia de restricción evaluable, para nunca mostrar "está cerca de ti" sobre contenido cuya proximidad nunca se verificó. NULL significa no elegible. Radio inmediato y radio de planificación (este último exclusivo de Eventos futuros) vienen de discovery_calibration() -- nunca una exención total de la restricción geográfica.';

-- -----------------------------------------------------------------------
-- 3. candidatos_novedad(): usa discovery_calibration(), expone geo_status.
-- -----------------------------------------------------------------------
drop function public.candidatos_novedad(double precision, double precision, uuid);

create function public.candidatos_novedad(
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  category text,
  zone_id uuid,
  actor_id uuid,
  reason text,
  geo_status text
)
language sql
stable
security definer set search_path = public
as $$
  select
    dc.out_target_type,
    dc.out_target_id,
    dc.out_category,
    dc.out_zone_id,
    dc.out_actor_id,
    'Es nuevo y todavía no tiene historial.'::text,
    g.geo_status
  from public.discovery_calibration() cal
  cross join public.discoverable_content() dc
  cross join lateral (select public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as geo_status) g
  where dc.out_appeared_at >= now() - make_interval(days => cal.novelty_window_days)
    and g.geo_status is not null;
$$;

comment on function public.candidatos_novedad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de novedad -- ventana de discovery_calibration(). Expone geo_status para que el futuro Compositor nunca confunda cercanía confirmada con ausencia de restricción evaluable. Puede devolver cero filas sin relleno artificial.';

-- -----------------------------------------------------------------------
-- 4. candidatos_equidad(): usa discovery_calibration(), expone geo_status.
-- -----------------------------------------------------------------------
drop function public.candidatos_equidad(double precision, double precision, uuid);

create function public.candidatos_equidad(
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  category text,
  zone_id uuid,
  actor_id uuid,
  reason text,
  geo_status text
)
language sql
stable
security definer set search_path = public
as $$
  with recent_counts as (
    select out_actor_id, count(*) as recent_count
    from public.discoverable_content(), public.discovery_calibration() cal
    where out_actor_id is not null
      and out_appeared_at >= now() - make_interval(days => cal.equity_frequency_days)
    group by out_actor_id
  )
  select
    dc.out_target_type,
    dc.out_target_id,
    dc.out_category,
    dc.out_zone_id,
    dc.out_actor_id,
    'Un negocio local con algo genuino que ofrecer.'::text,
    g.geo_status
  from public.discovery_calibration() cal
  cross join public.discoverable_content() dc
  left join recent_counts rc on rc.out_actor_id = dc.out_actor_id
  cross join lateral (select public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as geo_status) g
  where dc.out_actor_id is not null
    and coalesce(rc.recent_count, 0) <= cal.equity_max_recent_count
    and g.geo_status is not null;
$$;

comment on function public.candidatos_equidad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de equidad -- ventana y umbral de discovery_calibration(). Expone geo_status. Sigue exigiendo los mismos filtros base de calidad, vigencia y confianza que cualquier otro contenido.';

-- -----------------------------------------------------------------------
-- 5. candidatos_diversidad(): usa discovery_calibration(), expone geo_status.
-- -----------------------------------------------------------------------
drop function public.candidatos_diversidad(double precision, double precision, uuid);

create function public.candidatos_diversidad(
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  category text,
  zone_id uuid,
  actor_id uuid,
  reason text,
  geo_status text
)
language sql
stable
security definer set search_path = public
as $$
  with eligible as (
    select
      dc.*,
      g.geo_status,
      row_number() over (partition by dc.out_actor_id order by dc.out_appeared_at desc) as actor_rank
    from public.discoverable_content() dc
    cross join lateral (select public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as geo_status) g
    where g.geo_status is not null
  )
  select
    out_target_type,
    out_target_id,
    out_category,
    out_zone_id,
    out_actor_id,
    'Para mostrarte variedad de la ciudad.'::text,
    geo_status
  from eligible, public.discovery_calibration() cal
  where out_actor_id is null or actor_rank <= cal.diversity_max_per_actor;
$$;

comment on function public.candidatos_diversidad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de diversidad -- tope por actor de discovery_calibration(). Expone geo_status. No decide interleaving ni posiciones -- eso pertenece al Compositor (Bloque 3).';

-- -----------------------------------------------------------------------
-- 6. candidatos_serendipia(): usa discovery_calibration(), expone geo_status.
-- -----------------------------------------------------------------------
drop function public.candidatos_serendipia(uuid, double precision, double precision, uuid);

create function public.candidatos_serendipia(
  check_actor_id uuid default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  category text,
  zone_id uuid,
  actor_id uuid,
  reason text,
  geo_status text
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_seed text;
  v_confidence_threshold text;
begin
  select serendipity_confidence_threshold into v_confidence_threshold from public.discovery_calibration();

  v_seed := coalesce(check_actor_id::text, 'anon') || date_trunc('day', now())::text;

  return query
  select
    dc.out_target_type,
    dc.out_target_id,
    dc.out_category,
    dc.out_zone_id,
    dc.out_actor_id,
    'Algo distinto que puede interesarte.'::text,
    g.geo_status
  from public.discoverable_content() dc
  cross join lateral (select public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as geo_status) g
  where g.geo_status is not null
    and (
      dc.out_category is null
      or check_actor_id is null
      or dc.out_category not in (
        select ap.category
        from public.affinity_profile(check_actor_id) ap
        where ap.target_kind = 'categoria'
          and ap.confidence = v_confidence_threshold
          and ap.evidence_status = 'activa'
      )
    )
  order by hashtext(v_seed || dc.out_target_type || dc.out_target_id::text);
end;
$$;

comment on function public.candidatos_serendipia(uuid, double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de serendipia -- umbral de exclusión de discovery_calibration(). Expone geo_status. Rotación determinística por actor + día calendario, nunca random(), nunca memoria de exposición persistida.';
