-- Fase 6 (ver MASTERPLAN.md), Bloque 2: Motor de Garantías.
--
-- Autoridad de diseño: FASE6_FILOSOFIA_DESCUBRIMIENTO.md,
-- FASE6_CONTRATO_ARQUITECTONICO.md (componente 4, con el principio
-- permanente "la elegibilidad siempre ocurre antes que las garantías",
-- incorporado durante el análisis de este bloque) y dos rondas de análisis
-- conceptual y técnico aprobadas antes de esta migración.
--
-- Este bloque construye ÚNICAMENTE el Motor de Garantías: produce, para
-- cada carril (novedad, diversidad, equidad, serendipia), un conjunto de
-- CANDIDATOS elegibles con su razón de explicabilidad — nunca decide el
-- Feed final, nunca ordena, nunca fusiona con afinidad. El Compositor
-- (Bloque 3, todavía sin construir) es quien decide composición,
-- deduplicación, interleaving y explicación final.
--
-- Principio permanente aplicado en cada función de este archivo:
-- elegibilidad primero (público, vigente, actor autorizado), garantías
-- después (novedad/diversidad/equidad/serendipia actúan únicamente dentro
-- de ese universo ya elegible, nunca lo amplían).
--
-- Sin estado nuevo persistido: igual que affinity_profile(), todo se
-- calcula en el momento de leer. Ninguna tabla nueva, ningún trigger,
-- ninguna escritura. `interactions` no se toca en absoluto — este bloque
-- ni siquiera lee esa tabla directamente, solo el resultado ya agregado
-- de `affinity_profile()` (Bloque 1), y únicamente para excluir de la
-- serendipia las categorías donde la persona ya muestra afinidad fuerte y
-- activa.
--
-- Alcance de contenido: solo Eventos, Publicaciones y Promociones — las
-- únicas "Fuentes de contenido" del Feed según el contrato (los Lugares
-- viven en Explorar, no en el Feed, y nunca fueron parte de las fuentes
-- de esta fase). El contenido autorado por el actor de sistema "Ahorita
-- Editorial" queda EXCLUIDO por completo del universo elegible de este
-- bloque: la Editorial tiene su propio mecanismo de inserción paralelo
-- (Motor Editorial, fuera de este bloque) y nunca debe competir ni
-- aparecer disfrazada de una selección de Garantías.

-- -----------------------------------------------------------------------
-- 1. Universo de contenido elegible (elegibilidad, antes que garantías).
-- -----------------------------------------------------------------------
create function public.discoverable_content()
returns table (
  out_target_type text,
  out_target_id uuid,
  out_category text,
  out_zone_id uuid,
  out_actor_id uuid,
  out_lat double precision,
  out_lng double precision,
  out_appeared_at timestamptz,
  out_event_start_at timestamptz
)
language sql
stable
security definer set search_path = public
as $$
  -- Eventos: públicos, vigentes (mismo criterio que listUpcomingEvents),
  -- categoría propia, zona/lat/lng propios o heredados del negocio
  -- organizador. Si el evento no tiene business_id (creado directamente
  -- por un admin, sin negocio detrás), no se exige verificación — solo un
  -- admin puede crearlo así, ya es una fuente confiable por diseño.
  select
    'event'::text as out_target_type,
    e.id as out_target_id,
    e.category as out_category,
    coalesce(b.zone_id, null) as out_zone_id,
    a.id as out_actor_id,
    e.lat as out_lat,
    e.lng as out_lng,
    e.created_at as out_appeared_at,
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

  -- Publicaciones y Promociones: siempre autoradas por un actor negocio u
  -- organizador (nunca persona) -- el actor de sistema "Ahorita
  -- Editorial" se excluye explícitamente aquí, a nivel de elegibilidad de
  -- base, para que ningún carril de este bloque tenga jamás que decidir
  -- sobre contenido editorial.
  select
    case p.subtype when 'publicacion' then 'publicacion' else 'promocion' end,
    p.id,
    pp.category,
    b.zone_id,
    a.id,
    b.lat,
    b.lng,
    p.published_at,
    null::timestamptz
  from public.publications p
  join public.actors a on a.id = p.actor_id
  join public.businesses b on b.id = a.business_id
  left join public.publication_posts pp on pp.publication_id = p.id
  where a.type in ('negocio', 'organizador')
    and public.actor_verification_badge(a.id) in ('vigente', 'en_gracia')
    and (
      (p.subtype = 'publicacion' and p.status = 'publicado')
      or (p.subtype = 'promocion' and public.promotion_status(p.id) in ('programada_proxima', 'vigente', 'finalizada_reciente'))
    );
$$;

comment on function public.discoverable_content() is
  'Fase 6, Bloque 2: universo de contenido elegible -- público, vigente, de un actor autorizado. Excluye por completo al actor de sistema "Ahorita Editorial" (su inserción pertenece al Motor Editorial, no a este bloque). Principio permanente: la elegibilidad ocurre antes que las garantías -- ningún carril de este bloque puede ampliar este universo, solo filtrar y limitar dentro de él.';

-- -----------------------------------------------------------------------
-- 2. Elegibilidad geográfica compartida (restricción dura, nunca una
--    señal de puntuación). Misma función que usará el futuro Compositor
--    para cualquier contenido que consuma directamente por afinidad, para
--    que nunca exista un radio distinto en dos componentes.
-- -----------------------------------------------------------------------
create function public.geo_eligible(
  p_content_lat double precision,
  p_content_lng double precision,
  p_content_zone_id uuid,
  p_event_start_at timestamptz,
  p_actor_lat double precision,
  p_actor_lng double precision,
  p_manual_zone_id uuid
)
returns boolean
language plpgsql
stable
security definer set search_path = public
as $$
declare
  -- Constantes de calibración -- explícitamente distintas de las cuatro
  -- ya fijadas en la adenda aprobada (ventana de novedad, ventana de
  -- equidad, umbral de serendipia, periodo de renovación). Estas dos son
  -- adicionales, necesarias para que esta función sea operativa, y quedan
  -- señaladas en el informe de implementación para revisión explícita.
  v_radius_km constant double precision := 5;
  v_future_planning_days constant numeric := 3;
  v_distance_km double precision;
begin
  -- 1. Preferencia explícita (zona elegida manualmente) siempre gana --
  --    principio ya permanente, aplicado aquí sin excepción. Ignora
  --    cualquier coordenada de geolocalización si existiera.
  if p_manual_zone_id is not null then
    return p_content_zone_id is not distinct from p_manual_zone_id;
  end if;

  -- 2. Sin geolocalización real y sin zona manual: no hay ninguna
  --    restricción geográfica que aplicar -- degradación honesta, nunca
  --    se infiere ubicación desde ninguna otra fuente (IP u otra).
  if p_actor_lat is null or p_actor_lng is null then
    return true;
  end if;

  -- 3. Planificación futura: un evento cuyo inicio está claramente más
  --    allá de una ventana cercana queda exento del radio estricto --
  --    excepción ya nombrada en la filosofía (deportista, planificación
  --    anticipada). La distancia se ignora para esta decisión, nunca se
  --    excluye un evento futuro solo por estar lejos hoy.
  if p_event_start_at is not null and p_event_start_at > now() + make_interval(days => v_future_planning_days::int) then
    return true;
  end if;

  -- 4. Sin coordenada propia del contenido (evento sin lat/lng, o negocio
  --    sin lat/lng registrado): no hay relación confiable que evaluar --
  --    nunca se excluye por una distancia que no puede calcularse.
  if p_content_lat is null or p_content_lng is null then
    return true;
  end if;

  -- 5. Distancia real (fórmula haversine, mismo radio terrestre ya usado
  --    en lib/directions.js para mantener una única definición de
  --    "distancia" en todo el proyecto).
  v_distance_km := 6371 * 2 * asin(sqrt(
    power(sin(radians(p_content_lat - p_actor_lat) / 2), 2)
    + cos(radians(p_actor_lat)) * cos(radians(p_content_lat))
      * power(sin(radians(p_content_lng - p_actor_lng) / 2), 2)
  ));

  return v_distance_km <= v_radius_km;
end;
$$;

comment on function public.geo_eligible(double precision, double precision, uuid, timestamptz, double precision, double precision, uuid) is
  'Fase 6, Bloque 2: restricción geográfica dura compartida -- nunca una señal de puntuación. Zona elegida manualmente siempre gana; sin ubicación disponible, degrada sin inferir; eventos de planificación futura quedan exentos del radio; contenido sin coordenada propia nunca se excluye por una distancia no calculable. Radio y ventana de planificación futura son constantes de calibración explícitamente señaladas para revisión.';

-- -----------------------------------------------------------------------
-- 3. Carril: Novedad. Contenido aparecido recientemente, sin exigir
--    ninguna interacción previa.
-- -----------------------------------------------------------------------
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
  reason text
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
    'Es nuevo y todavía no tiene historial.'::text
  from public.discoverable_content() dc
  where dc.out_appeared_at >= now() - interval '7 days'
    and public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id);
$$;

comment on function public.candidatos_novedad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de novedad -- contenido aparecido en los últimos 7 días (constante de calibración). Puede devolver cero filas sin relleno artificial. Nunca decide posición ni orden -- eso pertenece al Compositor.';

-- -----------------------------------------------------------------------
-- 4. Carril: Equidad. Oportunidad de competir para negocios con baja
--    frecuencia de publicación reciente -- nunca visibilidad garantizada,
--    nunca una condición sobre el tamaño del negocio.
-- -----------------------------------------------------------------------
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
  reason text
)
language sql
stable
security definer set search_path = public
as $$
  with recent_counts as (
    select out_actor_id, count(*) as recent_count
    from public.discoverable_content()
    where out_actor_id is not null
      and out_appeared_at >= now() - interval '30 days'
    group by out_actor_id
  )
  select
    dc.out_target_type,
    dc.out_target_id,
    dc.out_category,
    dc.out_zone_id,
    dc.out_actor_id,
    'Un negocio local con algo genuino que ofrecer.'::text
  from public.discoverable_content() dc
  left join recent_counts rc on rc.out_actor_id = dc.out_actor_id
  where dc.out_actor_id is not null
    and coalesce(rc.recent_count, 0) <= 1
    and public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id);
$$;

comment on function public.candidatos_equidad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de equidad -- actores con a lo sumo una publicación/evento elegible adicional en los últimos 30 días (constante de calibración). Nunca depende del tamaño del negocio ni de su volumen histórico total -- solo de la baja frecuencia reciente, medida sobre el propio universo ya elegible. Sigue exigiendo los mismos filtros base de calidad, vigencia y confianza que cualquier otro contenido.';

-- -----------------------------------------------------------------------
-- 5. Carril: Diversidad. Etiqueta y limita por dimensión -- nunca decide
--    orden ni posición final (responsabilidad exclusiva del Compositor).
-- -----------------------------------------------------------------------
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
  reason text
)
language sql
stable
security definer set search_path = public
as $$
  with eligible as (
    select
      dc.*,
      row_number() over (partition by dc.out_actor_id order by dc.out_appeared_at desc) as actor_rank
    from public.discoverable_content() dc
    where public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id)
  )
  select
    out_target_type,
    out_target_id,
    out_category,
    out_zone_id,
    out_actor_id,
    'Para mostrarte variedad de la ciudad.'::text
  from eligible
  where out_actor_id is null or actor_rank <= 3;
$$;

comment on function public.candidatos_diversidad(double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de diversidad -- todo el contenido elegible, etiquetado por categoría/zona/actor/tipo, con un tope de 3 candidatos por actor (constante de calibración) para evitar que un solo actor domine el conjunto entregado. No decide interleaving, posiciones consecutivas ni cuotas finales por categoría/zona/tipo -- esa decisión, con visión de la composición completa, pertenece exclusivamente al Compositor del Feed (Bloque 3).';

-- -----------------------------------------------------------------------
-- 6. Carril: Serendipia. Rotación determinística por actor + periodo --
--    nunca random() (incompatible con STABLE y con reproducibilidad),
--    nunca memoria persistida de qué se mostró antes.
-- -----------------------------------------------------------------------
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
  reason text
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_seed text;
begin
  -- Semilla determinística: actor + periodo de renovación (día calendario,
  -- constante de calibración). Mismo actor + mismo día -> mismo orden,
  -- siempre reproducible. Sin sesión (anónimo), la semilla usa solo el
  -- periodo -- una rotación pública compartida, sin ninguna
  -- personalización que inferir.
  v_seed := coalesce(check_actor_id::text, 'anon') || date_trunc('day', now())::text;

  return query
  select
    dc.out_target_type,
    dc.out_target_id,
    dc.out_category,
    dc.out_zone_id,
    dc.out_actor_id,
    'Algo distinto que puede interesarte.'::text
  from public.discoverable_content() dc
  where public.geo_eligible(dc.out_lat, dc.out_lng, dc.out_zone_id, dc.out_event_start_at, p_lat, p_lng, p_manual_zone_id)
    -- Excluye únicamente las categorías donde la propia afinidad de la
    -- persona ya es fuerte Y activa -- umbral conservador (constante de
    -- calibración): deja el resto del espectro (medio, bajo, histórica)
    -- disponible para serendipia. Si check_actor_id no es el propio
    -- llamador autenticado, affinity_profile() ya devuelve cero filas por
    -- su propia protección de privacidad -- esta consulta simplemente no
    -- excluye ninguna categoría en ese caso, degradando sin filtrar nada,
    -- nunca filtrando de más ni exponiendo nada.
    and (
      dc.out_category is null
      or check_actor_id is null
      or dc.out_category not in (
        select ap.category
        from public.affinity_profile(check_actor_id) ap
        where ap.target_kind = 'categoria'
          and ap.confidence = 'alto'
          and ap.evidence_status = 'activa'
      )
    )
  order by hashtext(v_seed || dc.out_target_type || dc.out_target_id::text);
end;
$$;

comment on function public.candidatos_serendipia(uuid, double precision, double precision, uuid) is
  'Fase 6, Bloque 2: candidatos del carril de serendipia -- excluye las categorías con afinidad alta y activa (constantes de calibración), y ordena el resto mediante una rotación determinística sembrada por actor + día calendario (nunca random(), nunca memoria de exposición persistida). Mismo actor y mismo día siempre producen el mismo orden; el día siguiente renueva la rotación automáticamente. No depende de relevancia inferida -- ese es precisamente su criterio distintivo frente a los demás carriles.';
