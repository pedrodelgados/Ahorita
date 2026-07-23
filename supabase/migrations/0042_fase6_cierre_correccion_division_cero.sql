-- Fase 6 -- corrección puntual encontrada en la auditoría final de
-- liberación de la fase (ver PROJECT.md, sección "FASE 6 CERRADA",
-- hallazgo 3 de la auditoría). No reabre ninguna decisión arquitectónica
-- ya aprobada: compose_feed() conserva exactamente la misma firma, el
-- mismo algoritmo de colas justas ponderadas (weighted fair queuing) y el
-- mismo comportamiento para cualquier calibración ya vigente. El único
-- cambio es una guarda defensiva sobre la división que calcula la clave
-- de cada carril.
--
-- Hallazgo: `carril_rank / composer_weight_X` no tenía ninguna protección
-- contra un peso configurado en 0 en una futura recalibración de
-- discovery_calibration() -- eso rompería compose_feed() por completo
-- (para todas las personas, un error de división por cero de Postgres)
-- en vez de degradar con gracia. Se envuelve el divisor en
-- `greatest(peso, 0.0001)`: con cualquier peso ya vigente (todos > 0) el
-- comportamiento es idéntico bit a bit; solo si algún peso llegara a 0 en
-- el futuro, ese carril recibiría una clave extremadamente alta (al
-- final de la secuencia) en vez de tumbar la función -- mismo espíritu ya
-- usado en el resto del Compositor (nunca fallar, siempre degradar con
-- honestidad; ver la aceptación de último recurso del anti-monopolio).

create or replace function public.compose_feed(
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
      -- Corrección de la auditoría final (hallazgo 3): greatest(..., 0.0001)
      -- evita una división por cero si una futura recalibración dejara
      -- algún peso en 0 -- con cualquier peso ya vigente (todos > 0) el
      -- resultado es idéntico al de antes de esta corrección.
      carril_rank / greatest(case o_carril
        when 'afinidad' then cal.composer_weight_afinidad
        when 'novedad' then cal.composer_weight_novedad
        when 'diversidad' then cal.composer_weight_diversidad
        when 'equidad' then cal.composer_weight_equidad
        when 'serendipia' then cal.composer_weight_serendipia
        when 'editorial' then cal.composer_weight_editorial
      end, 0.0001) as base_key
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
  'Fase 6, Bloque 4 (corregida en el cierre de la fase): el Compositor del Feed. Componente puro -- fusiona las seis entradas ya elegibles, deduplica (Editorial reclama siempre por completo cupo/propiedad/explicación), ordena mediante colas justas ponderadas mediante fracciones relativas de discovery_calibration() (nunca una cantidad fija de posiciones ni una fórmula de puntuación, con una guarda greatest(peso, 0.0001) contra división por cero en una futura recalibración), aplica anti-monopolio transversal en una sola pasada, y pagina por clave de identidad. No aprende, no escribe datos, no modifica afinidades ni decisiones editoriales, no registra exposición -- toda esta función es de solo lectura y determinista dentro de su bloque de estabilidad.';
