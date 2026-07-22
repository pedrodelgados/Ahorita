-- Fase 6 (ver MASTERPLAN.md), Bloque 4: Compositor del Feed.
--
-- Autoridad de diseño: FASE6_FILOSOFIA_DESCUBRIMIENTO.md,
-- FASE6_CONTRATO_ARQUITECTONICO.md (componente 6, con los cuatro
-- principios permanentes incorporados durante este diseño: el Compositor
-- nunca intenta ser inteligente; el anti-monopolio es transversal a las
-- seis entradas, nunca exclusivo de la composición final; Editorial
-- reclama por completo cupo/propiedad/explicación; las proporciones son
-- siempre relativas, nunca una cantidad fija de posiciones), y dos rondas
-- de diseño técnico (16 puntos + 7 puntos de revisión) aprobadas
-- explícitamente antes de esta migración.
--
-- Cierra la Fase 6: este es el último componente. Fusiona las seis
-- entradas ya elegibles (Afinidad, Novedad, Diversidad, Equidad,
-- Serendipia, Editorial), deduplica, decide orden mediante cupos
-- proporcionales (nunca una fórmula de puntuación única), aplica
-- anti-monopolio, resuelve la explicación final honesta, y pagina sin
-- romper nada de lo anterior. Componente puro: no aprende, no escribe
-- datos, no modifica afinidades, no registra señales, no crea contenido,
-- no modifica decisiones editoriales. Solo compone.

-- -----------------------------------------------------------------------
-- 1. discovery_calibration(): se extiende (no se crea una función nueva,
--    principio ya fijado desde el Bloque 3) con las constantes propias
--    del Compositor. Verificado que ningún objeto depende físicamente de
--    esta función a nivel de pg_depend -- las funciones que la consumen
--    (geo_eligible, candidatos_*) la referencian por nombre en tiempo de
--    ejecución, así que basta con recrearla; ninguna necesita
--    recrearse también.
-- -----------------------------------------------------------------------
drop function public.discovery_calibration();

create function public.discovery_calibration()
returns table (
  novelty_window_days integer,
  equity_frequency_days integer,
  equity_max_recent_count integer,
  diversity_max_per_actor integer,
  serendipity_confidence_threshold text,
  geo_radius_immediate_km double precision,
  geo_radius_planning_km double precision,
  geo_planning_threshold_days integer,
  composer_weight_afinidad double precision,
  composer_weight_novedad double precision,
  composer_weight_diversidad double precision,
  composer_weight_equidad double precision,
  composer_weight_serendipia double precision,
  composer_weight_editorial double precision,
  composer_stability_block_hours integer,
  composer_max_per_actor_window integer,
  composer_max_per_category_window integer,
  composer_max_per_zone_window integer,
  composer_max_per_type_window integer,
  composer_min_editorial_gap integer,
  composer_anti_monopoly_window integer
)
language sql
immutable
as $$
  select
    7,      -- novedad: contenido aparecido en los últimos N días
    30,     -- equidad: ventana de baja frecuencia
    1,      -- equidad: máximo de contenido reciente adicional para calificar
    3,      -- diversidad / tope de candidatos por actor -- reutilizado también
            -- como tope intra-carril de Afinidad y Editorial (principio de
            -- anti-monopolio transversal: mismo mecanismo, nunca uno nuevo).
    'alto', -- serendipia: confidence que excluye una categoría
    3.0,    -- geografía: radio inmediato
    15.0,   -- geografía: radio de planificación
    3,      -- geografía: días de antelación que activan el radio de planificación
    0.35,   -- Compositor: proporción de Afinidad (calibración inicial, ver adenda de revisión previa a la implementación -- 40% original bajado a 35%)
    0.15,   -- Compositor: proporción de Novedad
    0.20,   -- Compositor: proporción de Diversidad (recibe el 5% liberado por Afinidad -- refuerza directamente "mostrar variedad de la ciudad")
    0.10,   -- Compositor: proporción de Equidad
    0.10,   -- Compositor: proporción de Serendipia
    0.10,   -- Compositor: proporción de Editorial
    4,      -- Compositor: duración del bloque de estabilidad temporal, en horas (nunca un día completo -- ver adenda de revisión)
    2,      -- Compositor: máximo de ítems del mismo actor dentro de la ventana de anti-monopolio
    4,      -- Compositor: máximo de ítems de la misma categoría dentro de la ventana
    5,      -- Compositor: máximo de ítems de la misma zona dentro de la ventana
    7,      -- Compositor: máximo de ítems del mismo tipo de contenido dentro de la ventana
    3,      -- Compositor: separación mínima (en posiciones) entre dos ítems Editorial
    10;     -- Compositor: tamaño de la ventana deslizante de anti-monopolio
$$;

comment on function public.discovery_calibration() is
  'Fase 6: única fuente de verdad de las constantes de calibración de todo el sistema de descubrimiento -- Motor de Garantías (Bloque 2) y Compositor del Feed (Bloque 4). Las proporciones del Compositor son fracciones relativas, nunca una cantidad fija de posiciones -- se aplican sobre el tamaño real del universo elegible de cada solicitud. Calibración inicial, no una verdad permanente -- cualquier ajuste futuro es una migración nueva, auditable por el mismo historial de git.';

-- -----------------------------------------------------------------------
-- 2. candidatos_editorial(): ajuste aditivo de forma -- agrega category y
--    actor_id a la proyección final (los datos ya se resuelven en su CTE
--    interna). El Compositor los necesita para deduplicar y para el
--    anti-monopolio -- nunca se toca la lógica de elegibilidad de Bloque 3,
--    que permanece exactamente igual. Sin límite de cantidad, sin cambios:
--    el tope de anti-monopolio por actor de Editorial se aplica en el
--    propio Compositor (sección 4), nunca aquí -- reabrir esta función solo
--    para su forma de salida, no para su comportamiento, seguro el mismo
--    patrón ya usado en la adenda de calibración geográfica del Bloque 2.
-- -----------------------------------------------------------------------
drop function public.candidatos_editorial(double precision, double precision, uuid);

create function public.candidatos_editorial(
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  category text,
  actor_id uuid,
  zone_id uuid,
  reason_code text,
  geo_status text
)
language sql
stable
security definer set search_path = public
as $$
  with editorial_eligible as (
    select
      'event'::text as out_target_type,
      e.id as out_target_id,
      e.category as out_category,
      a.id as out_actor_id,
      e.lat as out_lat,
      e.lng as out_lng,
      b.zone_id as out_zone_id,
      e.start_at as out_event_start_at
    from public.events e
    left join public.businesses b on b.id = e.business_id
    left join public.actors a on a.business_id = e.business_id
    where e.status = 'publicado'
      and coalesce(e.end_at, e.start_at) >= now()
      and (e.publish_at is null or e.publish_at <= now())
      and (e.expires_at is null or e.expires_at > now())
      and (a.id is null or public.actor_verification_badge(a.id) in ('vigente', 'en_gracia'))

    union all

    select
      'publicacion'::text,
      p.id,
      pp.category,
      a.id,
      b.lat,
      b.lng,
      b.zone_id,
      null::timestamptz
    from public.publications p
    join public.actors a on a.id = p.actor_id
    left join public.businesses b on b.id = a.business_id
    left join public.publication_posts pp on pp.publication_id = p.id
    where p.subtype = 'publicacion'
      and p.status = 'publicado'
      and (a.type = 'sistema' or public.actor_verification_badge(a.id) in ('vigente', 'en_gracia'))
  )
  select
    es.target_type,
    es.target_id,
    ee.out_category,
    ee.out_actor_id,
    ee.out_zone_id,
    es.reason_code,
    g.geo_status
  from public.editorial_selections es
  join editorial_eligible ee
    on ee.out_target_type = es.target_type and ee.out_target_id = es.target_id
  cross join lateral (
    select public.geo_eligible(ee.out_lat, ee.out_lng, ee.out_zone_id, ee.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as geo_status
  ) g
  where es.revoked_at is null
    and es.starts_at <= now()
    and (es.ends_at is null or es.ends_at > now())
    and g.geo_status is not null;
$$;

comment on function public.candidatos_editorial(double precision, double precision, uuid) is
  'Fase 6, Bloque 3 (forma extendida en el Bloque 4): TODOS los candidatos editoriales elegibles -- sin límite de cantidad. Agrega category/actor_id/zone_id (Bloque 4 los necesita para deduplicar y aplicar anti-monopolio) sin tocar ninguna regla de elegibilidad ya verificada.';

-- -----------------------------------------------------------------------
-- 3. candidatos_afinidad(): la pieza que faltaba -- Afinidad no tenía
--    todavía un generador de candidatos, solo una descripción de la
--    persona (affinity_profile(), Bloque 1). Mismo universo elegible que
--    Garantías (discoverable_content(), excluye a Editorial), cruzado
--    contra el perfil de afinidad -- nunca al revés. Aplica ya aquí el
--    tope de candidatos por actor (mismo mecanismo de Diversidad,
--    principio de anti-monopolio transversal) para que Afinidad nunca
--    pueda, por sí sola, saturarse con el volumen de un único actor antes
--    de llegar siquiera al entrelazado del Compositor.
-- -----------------------------------------------------------------------
create function public.candidatos_afinidad(
  check_actor_id uuid,
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
  v_actor_cap integer;
begin
  -- Invitado (sin sesión) o cualquier actor sin perfil propio: cero
  -- candidatos, nunca se fabrica personalización -- degradación honesta,
  -- mismo principio ya aplicado en geo_eligible() para la ubicación.
  if check_actor_id is null then
    return;
  end if;

  select diversity_max_per_actor into v_actor_cap from public.discovery_calibration();

  return query
  with matched as (
    select
      dc.out_target_type,
      dc.out_target_id,
      dc.out_category,
      dc.out_zone_id,
      dc.out_actor_id,
      dc.out_appeared_at,
      g.computed_geo_status
    from public.discoverable_content() dc
    cross join lateral (
      select public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id) as computed_geo_status
    ) g
    where g.computed_geo_status is not null
      and (
        (
          dc.out_category is not null
          and exists (
            select 1 from public.affinity_profile(check_actor_id) ap
            where ap.target_kind = 'categoria'
              and ap.category = dc.out_category
              and ap.confidence in ('medio', 'alto')
              and ap.evidence_status = 'activa'
          )
        )
        or (
          dc.out_actor_id is not null
          and exists (
            select 1 from public.affinity_profile(check_actor_id) ap
            where ap.target_kind = 'actor_seguido'
              and ap.followed_actor_id = dc.out_actor_id
              and ap.confidence in ('medio', 'alto')
              and ap.evidence_status = 'activa'
          )
        )
      )
  ),
  capped as (
    select
      m.*,
      row_number() over (partition by m.out_actor_id order by m.out_appeared_at desc) as actor_rank
    from matched m
  )
  select
    capped.out_target_type,
    capped.out_target_id,
    capped.out_category,
    capped.out_zone_id,
    capped.out_actor_id,
    'Coincide con lo que te interesa.'::text,
    capped.computed_geo_status
  from capped
  where capped.out_actor_id is null or capped.actor_rank <= v_actor_cap;
end;
$$;

comment on function public.candidatos_afinidad(uuid, double precision, double precision, uuid) is
  'Fase 6, Bloque 4: candidatos del carril de Afinidad -- universo de discoverable_content() (mismo de Garantías, excluye a Editorial) filtrado por affinity_profile() con confianza medio/alto y evidence_status activa, por categoría o por actor seguido. Sin actor_id (invitado o sin sesión): cero candidatos, nunca personalización fabricada. Tope de candidatos por actor ya aplicado aquí (anti-monopolio transversal) para que un único actor con mucho contenido afín no agote por sí solo el cupo de Afinidad.';

-- -----------------------------------------------------------------------
-- 4. compose_feed(): el Compositor. Fusiona las seis entradas, deduplica
--    (Editorial reclama siempre por completo: cupo, propiedad y
--    explicación), calcula el orden mediante colas justas ponderadas
--    (weighted fair queuing -- la posición k-ésima de un carril con peso W
--    recibe la clave k/W; ordenar todo por esa clave produce un
--    entrelazado proporcional determinista, sin ninguna fórmula de
--    puntuación y sin necesidad de "rellenar" un carril agotado), aplica
--    anti-monopolio en una sola pasada lineal, y pagina por clave de
--    identidad (target_type, target_id) -- nunca OFFSET.
-- -----------------------------------------------------------------------
create type public.compose_feed_item as (
  target_type text,
  target_id uuid,
  actor_id uuid,
  category text,
  zone_id uuid,
  geo_status text,
  owning_carril text,
  reason text,
  internal_carriles text[]
);

create function public.compose_feed(
  p_actor_id uuid default null,
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null,
  p_channel text default null,
  p_after_target_type text default null,
  p_after_target_id uuid default null,
  p_page_size integer default 20
)
returns table (
  target_type text,
  target_id uuid,
  owning_carril text,
  reason text,
  geo_status text,
  internal_carriles text[]
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  cal record;
  v_seed text;
  v_block_start timestamptz;
  v_items public.compose_feed_item[];
  v_output public.compose_feed_item[];
  v_deferred public.compose_feed_item[];
  ring_actor text[] := array[]::text[];
  ring_category text[] := array[]::text[];
  ring_zone text[] := array[]::text[];
  ring_type text[] := array[]::text[];
  v_last_actor uuid;
  v_last_editorial_position integer;
  v_current_position integer;
  n integer;
  i integer;
  item public.compose_feed_item;
  v_violates boolean;
  v_after_index integer;
begin
  select * into cal from public.discovery_calibration();

  -- Semilla determinística: actor (o 'anon') + bloque de estabilidad
  -- horario -- mismo mecanismo ya validado en Serendipia (Bloque 2),
  -- extendido a las seis entradas y con un grano más fino que el día
  -- completo (ver adenda de revisión previa a la implementación).
  v_block_start := date_trunc('day', now())
    + (floor(extract(hour from now()) / cal.composer_stability_block_hours) * cal.composer_stability_block_hours) * interval '1 hour';
  v_seed := coalesce(p_actor_id::text, 'anon') || v_block_start::text;

  with raw as (
    select 'editorial'::text as r_carril, ce.r_tt, ce.r_ti, ce.r_cat, ce.r_aid, ce.r_zone, ce.r_geo, ce.r_reason
      from public.candidatos_editorial(p_lat, p_lng, p_manual_zone_id) as ce(r_tt, r_ti, r_cat, r_aid, r_zone, r_reason, r_geo)
    union all
    select 'afinidad', af.r_tt, af.r_ti, af.r_cat, af.r_aid, af.r_zone, af.r_geo, af.r_reason
      from public.candidatos_afinidad(p_actor_id, p_lat, p_lng, p_manual_zone_id) as af(r_tt, r_ti, r_cat, r_zone, r_aid, r_reason, r_geo)
    union all
    select 'novedad', nv.r_tt, nv.r_ti, nv.r_cat, nv.r_aid, nv.r_zone, nv.r_geo, nv.r_reason
      from public.candidatos_novedad(p_lat, p_lng, p_manual_zone_id) as nv(r_tt, r_ti, r_cat, r_zone, r_aid, r_reason, r_geo)
    union all
    select 'diversidad', dv.r_tt, dv.r_ti, dv.r_cat, dv.r_aid, dv.r_zone, dv.r_geo, dv.r_reason
      from public.candidatos_diversidad(p_lat, p_lng, p_manual_zone_id) as dv(r_tt, r_ti, r_cat, r_zone, r_aid, r_reason, r_geo)
    union all
    select 'equidad', eq.r_tt, eq.r_ti, eq.r_cat, eq.r_aid, eq.r_zone, eq.r_geo, eq.r_reason
      from public.candidatos_equidad(p_lat, p_lng, p_manual_zone_id) as eq(r_tt, r_ti, r_cat, r_zone, r_aid, r_reason, r_geo)
    union all
    select 'serendipia', sr.r_tt, sr.r_ti, sr.r_cat, sr.r_aid, sr.r_zone, sr.r_geo, sr.r_reason
      from public.candidatos_serendipia(p_actor_id, p_lat, p_lng, p_manual_zone_id) as sr(r_tt, r_ti, r_cat, r_zone, r_aid, r_reason, r_geo)
  ),
  filtered as (
    select r.*, count(*) over (partition by r.r_carril) as r_carril_total
    from raw r
    where p_channel is null or r.r_cat = p_channel
  ),
  -- La prioridad de propiedad no es una lista fija: Editorial siempre
  -- reclama por completo (principio permanente, no negociable). Entre los
  -- cinco carriles restantes, decide primero la ESCASEZ -- el carril con
  -- MENOS candidatos totales se queda con el ítem compartido -- para que
  -- un carril abundante (p. ej. Novedad justo después de una ráfaga de
  -- contenido nuevo) nunca pueda, por su propio volumen, hacer desaparecer
  -- de la composición a un carril escaso con candidatos reales (Diversidad
  -- o Serendipia): exactamente el principio ya registrado en el contrato
  -- ("la ausencia real de candidatos es válida; la desaparición causada
  -- por la propia composición no lo es"). Entre carriles igual de escasos
  -- (empate exacto en total de candidatos, el caso más común: para un
  -- invitado sin afinidad, Novedad y Serendipia suelen compartir
  -- exactamente el mismo universo), el desempate final es la MISMA
  -- rotación determinística ya usada en Serendipia y en el resto del
  -- entrelazado (hash por semilla+carril+ítem) -- nunca una preferencia
  -- fija que sistemáticamente favorezca siempre al mismo carril entre dos
  -- igual de escasos.
  owned as (
    select distinct on (f.r_tt, f.r_ti)
      f.r_tt, f.r_ti, f.r_cat, f.r_aid, f.r_zone, f.r_geo,
      f.r_reason as owning_reason, f.r_carril as o_carril
    from filtered f
    order by f.r_tt, f.r_ti,
      case when f.r_carril = 'editorial' then 0 else 1 end,
      case when f.r_carril = 'editorial' then 0 else f.r_carril_total end,
      hashtext(v_seed || '|owner|' || f.r_carril || '|' || f.r_tt || f.r_ti::text)
  ),
  carriles_agg as (
    select r_tt, r_ti, array_agg(distinct r_carril) as o_internal
    from filtered
    group by r_tt, r_ti
  ),
  capped as (
    select
      o.r_tt, o.r_ti, o.r_cat, o.r_aid, o.r_zone, o.r_geo,
      o.owning_reason, o.o_carril, ca.o_internal,
      row_number() over (
        partition by o.o_carril, o.r_aid
        order by hashtext(v_seed || o.r_tt || o.r_ti::text)
      ) as actor_rank_in_carril
    from owned o
    join carriles_agg ca on ca.r_tt = o.r_tt and ca.r_ti = o.r_ti
  ),
  capped_filtered as (
    select * from capped
    where r_aid is null or actor_rank_in_carril <= cal.diversity_max_per_actor
  ),
  ranked as (
    select
      *,
      row_number() over (
        partition by o_carril
        order by hashtext(v_seed || r_tt || r_ti::text)
      ) as carril_rank
    from capped_filtered
  ),
  weighted as (
    select
      *,
      carril_rank / (case o_carril
        when 'afinidad' then cal.composer_weight_afinidad
        when 'novedad' then cal.composer_weight_novedad
        when 'diversidad' then cal.composer_weight_diversidad
        when 'equidad' then cal.composer_weight_equidad
        when 'serendipia' then cal.composer_weight_serendipia
        when 'editorial' then cal.composer_weight_editorial
      end) as base_key
    from ranked
  )
  select array_agg(
    row(r_tt, r_ti, r_aid, r_cat, r_zone, r_geo, o_carril, owning_reason, o_internal)::public.compose_feed_item
    order by base_key, r_tt, r_ti
  )
  into v_items
  from weighted;

  -- Pasada única de anti-monopolio: ventana deslizante (actor/categoría/
  -- zona/tipo) + regla dura de no-consecutivos-del-mismo-actor + brecha
  -- mínima entre piezas Editoriales. Lo que viola se difiere al final de
  -- la secuencia (nunca se descarta -- todo carril con candidatos
  -- conserva su oportunidad, solo puede reubicarse en el tiempo). Si al
  -- llegar al final un ítem diferido sigue violando, se acepta como
  -- último recurso documentado -- preferible a inventar relleno o a
  -- fallar cuando el universo elegible es demasiado pequeño para evitarlo.
  v_output := array[]::public.compose_feed_item[];
  v_deferred := array[]::public.compose_feed_item[];
  v_last_actor := null;
  v_last_editorial_position := null;

  if v_items is not null then
    n := array_length(v_items, 1);
    for i in 1 .. n loop
      item := v_items[i];
      v_current_position := cardinality(v_output) + 1;

      v_violates :=
        (v_last_actor is not null and item.actor_id is not null and item.actor_id = v_last_actor)
        or (item.actor_id is not null and cardinality(array_positions(ring_actor, item.actor_id::text)) >= cal.composer_max_per_actor_window)
        or (item.category is not null and cardinality(array_positions(ring_category, item.category)) >= cal.composer_max_per_category_window)
        or (item.zone_id is not null and cardinality(array_positions(ring_zone, item.zone_id::text)) >= cal.composer_max_per_zone_window)
        or (cardinality(array_positions(ring_type, item.target_type)) >= cal.composer_max_per_type_window)
        or (item.owning_carril = 'editorial' and v_last_editorial_position is not null and (v_current_position - v_last_editorial_position) < (cal.composer_min_editorial_gap + 1));

      if v_violates then
        v_deferred := array_append(v_deferred, item);
        continue;
      end if;

      v_output := array_append(v_output, item);
      v_last_actor := item.actor_id;
      if item.owning_carril = 'editorial' then
        v_last_editorial_position := v_current_position;
      end if;

      ring_actor := array_append(ring_actor, item.actor_id::text);
      ring_category := array_append(ring_category, item.category);
      ring_zone := array_append(ring_zone, item.zone_id::text);
      ring_type := array_append(ring_type, item.target_type);
      if array_length(ring_actor, 1) > cal.composer_anti_monopoly_window then
        ring_actor := ring_actor[2:array_length(ring_actor, 1)];
        ring_category := ring_category[2:array_length(ring_category, 1)];
        ring_zone := ring_zone[2:array_length(ring_zone, 1)];
        ring_type := ring_type[2:array_length(ring_type, 1)];
      end if;
    end loop;

    -- Segunda pasada: los diferidos no se colocan en su orden fijo
    -- original -- en cada paso se busca, entre TODOS los que aún quedan
    -- diferidos, el primero que ya no viole la regla contra lo último
    -- colocado (el propio conjunto de diferidos suele contener varios
    -- ítems del mismo actor consecutivos entre sí, precisamente porque
    -- fueron diferidos por el mismo motivo -- colocarlos en su orden
    -- original repetiría la misma violación entre ellos). Solo si
    -- NINGUNO de los diferidos restantes evita la violación se acepta el
    -- primero como último recurso -- nunca se descarta contenido real ya
    -- elegible.
    while array_length(v_deferred, 1) is not null loop
      v_current_position := cardinality(v_output) + 1;
      i := 1;
      n := array_length(v_deferred, 1);
      while i <= n loop
        item := v_deferred[i];
        v_violates :=
          (v_last_actor is not null and item.actor_id is not null and item.actor_id = v_last_actor)
          or (item.actor_id is not null and cardinality(array_positions(ring_actor, item.actor_id::text)) >= cal.composer_max_per_actor_window)
          or (item.category is not null and cardinality(array_positions(ring_category, item.category)) >= cal.composer_max_per_category_window)
          or (item.zone_id is not null and cardinality(array_positions(ring_zone, item.zone_id::text)) >= cal.composer_max_per_zone_window)
          or (cardinality(array_positions(ring_type, item.target_type)) >= cal.composer_max_per_type_window)
          or (item.owning_carril = 'editorial' and v_last_editorial_position is not null and (v_current_position - v_last_editorial_position) < (cal.composer_min_editorial_gap + 1));
        exit when not v_violates;
        i := i + 1;
      end loop;

      -- Ninguno evitó la violación: se acepta el primero como último
      -- recurso documentado.
      if i > n then
        i := 1;
        item := v_deferred[1];
      end if;

      v_output := array_append(v_output, item);
      v_deferred := v_deferred[1:i-1] || v_deferred[i+1:n];
      v_last_actor := item.actor_id;
      if item.owning_carril = 'editorial' then
        v_last_editorial_position := v_current_position;
      end if;

      ring_actor := array_append(ring_actor, item.actor_id::text);
      ring_category := array_append(ring_category, item.category);
      ring_zone := array_append(ring_zone, item.zone_id::text);
      ring_type := array_append(ring_type, item.target_type);
      if array_length(ring_actor, 1) > cal.composer_anti_monopoly_window then
        ring_actor := ring_actor[2:array_length(ring_actor, 1)];
        ring_category := ring_category[2:array_length(ring_category, 1)];
        ring_zone := ring_zone[2:array_length(ring_zone, 1)];
        ring_type := ring_type[2:array_length(ring_type, 1)];
      end if;
    end loop;
  end if;

  -- Paginación por clave de identidad (target_type, target_id) -- nunca
  -- OFFSET. Se recalcula la secuencia completa determinística en cada
  -- llamada (misma semilla/bloque -- mismo resultado) y se ubica el
  -- cursor dentro de ella.
  v_after_index := 0;
  if p_after_target_type is not null and p_after_target_id is not null and v_output is not null then
    for i in 1 .. cardinality(v_output) loop
      if v_output[i].target_type = p_after_target_type and v_output[i].target_id = p_after_target_id then
        v_after_index := i;
        exit;
      end if;
    end loop;
  end if;

  if v_output is null then
    return;
  end if;

  for i in (v_after_index + 1) .. least(v_after_index + greatest(p_page_size, 0), cardinality(v_output)) loop
    target_type := v_output[i].target_type;
    target_id := v_output[i].target_id;
    owning_carril := v_output[i].owning_carril;
    reason := v_output[i].reason;
    geo_status := v_output[i].geo_status;
    internal_carriles := v_output[i].internal_carriles;
    return next;
  end loop;
  return;
end;
$$;

comment on function public.compose_feed(uuid, double precision, double precision, uuid, text, text, uuid, integer) is
  'Fase 6, Bloque 4: el Compositor del Feed. Componente puro -- fusiona las seis entradas ya elegibles, deduplica (Editorial reclama siempre por completo cupo/propiedad/explicación), ordena mediante colas justas ponderadas mediante fracciones relativas de discovery_calibration() (nunca una cantidad fija de posiciones ni una fórmula de puntuación), aplica anti-monopolio transversal en una sola pasada, y pagina por clave de identidad. No aprende, no escribe datos, no modifica afinidades ni decisiones editoriales, no registra exposición -- toda esta función es de solo lectura y determinista dentro de su bloque de estabilidad.';
