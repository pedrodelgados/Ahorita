-- Fase 6 (ver MASTERPLAN.md), Bloque 3: Motor Editorial.
--
-- Autoridad de diseño: FASE6_FILOSOFIA_DESCUBRIMIENTO.md,
-- FASE6_CONTRATO_ARQUITECTONICO.md (componente 5, con el principio
-- permanente "Editorial nunca existe para corregir al algoritmo; existe
-- para aportar criterio humano allí donde el algoritmo, por naturaleza,
-- nunca puede sustituirlo") y dos rondas de análisis (conceptual y
-- técnico) aprobadas antes de esta migración, incluyendo cuatro ajustes
-- arquitectónicos pedidos explícitamente antes de autorizar la
-- implementación: (1) fila única mutable en vez de ledger append-only,
-- (2) candidatos_editorial() sin límite de cantidad, (3) sin función de
-- calibración propia -- discovery_calibration() sigue siendo la única
-- fuente, (4) reason_code técnico separado de la redacción visible.
--
-- Este bloque construye ÚNICAMENTE el Motor Editorial: decide qué
-- contenido curado por el equipo está seleccionado y produce el universo
-- de candidatos editoriales elegibles -- nunca decide cantidad, posición
-- ni interleaving final (responsabilidad exclusiva del futuro Compositor,
-- Bloque 4, todavía sin construir).

-- -----------------------------------------------------------------------
-- 1. editorial_selections: una fila única y mutable por contenido, nunca
--    un ledger append-only -- no existe aquí el riesgo que sí justificó el
--    append-only en affinity_contributions (aprendizaje automático,
--    decaimiento) ni en verifications (ciclo de vida con transiciones
--    automáticas por cron): esto es una decisión humana, manual, una
--    acción a la vez, de un único rol (is_admin()).
-- -----------------------------------------------------------------------
create table public.editorial_selections (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('event', 'publicacion')),
  target_id uuid not null,
  reason_code text not null check (
    reason_code in ('seleccionado_equipo', 'informacion_util', 'relevante_fecha', 'historia_ciudad')
  ),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  decided_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz not null default now(),
  revoked_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  unique (target_type, target_id),
  check (ends_at is null or starts_at < ends_at),
  check ((revoked_at is null) = (revoked_by is null))
);

comment on table public.editorial_selections is
  'Fase 6, Bloque 3: una fila mutable por (target_type, target_id) -- nunca un historial de cada ciclo de selección/revocación. Reactivar una selección previa reutiliza la misma fila (created_at nunca se sobrescribe). No conserva el historial completo de decisiones pasadas -- solo el estado actual y el último ciclo -- una simplificación deliberada y documentada (ver PROJECT.md), aceptable porque no existe aquí ningún proceso automático ni concurrente que dependa de esa cronología.';

-- created_at es inmutable a nivel de base de datos, independientemente del
-- camino de escritura -- misma defensa ya usada en
-- protect_publication_published_at (0030).
create function public.protect_editorial_selection_created_at()
returns trigger
language plpgsql
as $$
begin
  new.created_at := old.created_at;
  return new;
end;
$$;

create trigger protect_editorial_selection_created_at_before_update
  before update on public.editorial_selections
  for each row execute function public.protect_editorial_selection_created_at();

-- El contenido referenciado debe existir de verdad, y una Publicación con
-- subtype = 'promocion' debe rechazarse aunque target_type = 'publicacion'
-- -- exclusión permanente de Promociones (Fase 4, Bloque 3: "un beneficio
-- comercial no es contenido editorial, sin excepción"). No puede
-- expresarse como un check constraint simple porque depende de otra
-- tabla.
create function public.validate_editorial_selection_target()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.target_type = 'event' then
    if not exists (select 1 from public.events where id = new.target_id) then
      raise exception 'El evento seleccionado no existe.';
    end if;
  elsif new.target_type = 'publicacion' then
    if not exists (select 1 from public.publications where id = new.target_id and subtype = 'publicacion') then
      raise exception 'El contenido seleccionado no existe o no es una Publicación -- las Promociones no pueden seleccionarse editorialmente.';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_editorial_selection_target_before_write
  before insert or update on public.editorial_selections
  for each row execute function public.validate_editorial_selection_target();

-- RLS: sin ninguna política de INSERT/UPDATE/DELETE -- por diseño, ni
-- siquiera is_admin() puede escribir directamente sobre la tabla cruda.
-- El único camino de escritura sancionado son las dos funciones
-- `security definer` de la sección 2, que garantizan por construcción la
-- trazabilidad mínima pedida (created_at preservado; decided_at/decided_by
-- representando siempre la decisión vigente; revoked_at/revoked_by
-- siempre limpiados juntos al reactivar). SELECT crudo (con
-- decided_by/revoked_by incluidos) queda reservado a is_admin() -- la
-- lectura pública pasa exclusivamente por editorial_selection_public()
-- (sección 3), que nunca proyecta esas dos columnas.
alter table public.editorial_selections enable row level security;

create policy "Solo admins leen la tabla cruda de selecciones editoriales" on public.editorial_selections
  for select using (public.is_admin());

-- -----------------------------------------------------------------------
-- 2. Escritura: dos funciones dedicadas en vez de INSERT/UPDATE directos
--    desde el cliente -- upsert sobre la fila única (crea, reactiva o
--    modifica una selección activa) y retiro explícito.
-- -----------------------------------------------------------------------
create function public.set_editorial_selection(
  p_target_type text,
  p_target_id uuid,
  p_reason_code text,
  p_starts_at timestamptz default now(),
  p_ends_at timestamptz default null
)
returns public.editorial_selections
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.editorial_selections;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede crear o modificar una selección editorial.';
  end if;

  insert into public.editorial_selections (
    target_type, target_id, reason_code, starts_at, ends_at, decided_by, decided_at
  )
  values (
    p_target_type, p_target_id, p_reason_code, coalesce(p_starts_at, now()), p_ends_at, auth.uid(), now()
  )
  on conflict (target_type, target_id) do update
    set reason_code = excluded.reason_code,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        decided_by = excluded.decided_by,
        decided_at = excluded.decided_at,
        revoked_by = null,
        revoked_at = null
  returning * into v_row;

  return v_row;
end;
$$;

comment on function public.set_editorial_selection(text, uuid, text, timestamptz, timestamptz) is
  'Fase 6, Bloque 3: crea, reactiva o modifica la selección editorial de un contenido. Reactivar (tras una revocación) reutiliza la misma fila -- limpia revoked_at/revoked_by, actualiza decided_at/decided_by a la decisión vigente, nunca toca created_at. Único camino de escritura junto con revoke_editorial_selection().';

create function public.revoke_editorial_selection(
  p_target_type text,
  p_target_id uuid
)
returns public.editorial_selections
language plpgsql
security definer set search_path = public
as $$
declare
  v_row public.editorial_selections;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede retirar una selección editorial.';
  end if;

  update public.editorial_selections
    set revoked_by = auth.uid(), revoked_at = now()
    where target_type = p_target_type and target_id = p_target_id and revoked_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No existe una selección editorial activa para ese contenido.';
  end if;

  return v_row;
end;
$$;

comment on function public.revoke_editorial_selection(text, uuid) is
  'Fase 6, Bloque 3: retira la selección editorial vigente de un contenido -- UPDATE en la misma fila (revoked_by/revoked_at), nunca DELETE.';

-- -----------------------------------------------------------------------
-- 3. Lectura pública segura: la existencia de una selección editorial es
--    pública (reason_code, ventana de vigencia, estado activo/revocado),
--    pero decided_by/revoked_by (identidad del administrador) nunca se
--    proyectan aquí -- misma técnica ya usada en actor_verification_badge
--    (0025): una función `security definer` estrecha que nunca devuelve
--    una fila cruda de la tabla protegida.
-- -----------------------------------------------------------------------
create function public.editorial_selection_public(p_target_type text, p_target_id uuid)
returns table (
  reason_code text,
  starts_at timestamptz,
  ends_at timestamptz,
  revoked_at timestamptz,
  active boolean
)
language sql
stable
security definer set search_path = public
as $$
  select
    es.reason_code,
    es.starts_at,
    es.ends_at,
    es.revoked_at,
    (es.revoked_at is null and es.starts_at <= now() and (es.ends_at is null or es.ends_at > now())) as active
  from public.editorial_selections es
  where es.target_type = p_target_type and es.target_id = p_target_id;
$$;

comment on function public.editorial_selection_public(text, uuid) is
  'Fase 6, Bloque 3: proyección pública de una selección editorial -- nunca incluye decided_by ni revoked_by. La identidad del administrador queda reservada a auditoría (SELECT directo sobre editorial_selections, is_admin() únicamente).';

-- -----------------------------------------------------------------------
-- 4. candidatos_editorial(): universo COMPLETO de candidatos editoriales
--    elegibles -- sin límite de cantidad (ajuste 2). Cantidad, posición e
--    interleaving quedan reservados por completo al futuro Compositor.
--    Devuelve reason_code crudo (ajuste 4) -- la redacción visible es una
--    capa de presentación separada, fuera de este bloque.
-- -----------------------------------------------------------------------
create function public.candidatos_editorial(
  p_lat double precision default null,
  p_lng double precision default null,
  p_manual_zone_id uuid default null
)
returns table (
  target_type text,
  target_id uuid,
  reason_code text,
  geo_status text
)
language sql
stable
security definer set search_path = public
as $$
  with editorial_eligible as (
    -- Eventos: publicados y vigentes. Sin actor de negocio/organizador
    -- detrás (evento creado directamente por un admin) se permite sin
    -- exigir verificación -- opuesto a discoverable_content(), porque aquí
    -- la confianza depende del propio criterio humano del admin al
    -- seleccionarlo, no de un actor externo. Un evento de un negocio/
    -- organizador real sí exige verificación vigente/en gracia, igual que
    -- cualquier otro contenido del Feed -- la bandera editorial nunca hace
    -- elegible a un autor no autorizado.
    select
      'event'::text as out_target_type,
      e.id as out_target_id,
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

    -- Publicaciones (nunca Promociones -- exclusión estructural por
    -- subtype, reforzada además por el trigger de validación al
    -- seleccionar). El actor de sistema "Ahorita Editorial" SÍ puede
    -- seleccionarse aquí -- a diferencia de discoverable_content(), que lo
    -- excluye por completo -- porque este es precisamente su mecanismo
    -- propio de inserción paralela.
    select
      'publicacion'::text,
      p.id,
      b.lat,
      b.lng,
      b.zone_id,
      null::timestamptz
    from public.publications p
    join public.actors a on a.id = p.actor_id
    left join public.businesses b on b.id = a.business_id
    where p.subtype = 'publicacion'
      and p.status = 'publicado'
      and (a.type = 'sistema' or public.actor_verification_badge(a.id) in ('vigente', 'en_gracia'))
  )
  select
    es.target_type,
    es.target_id,
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
  'Fase 6, Bloque 3: TODOS los candidatos editoriales actualmente elegibles -- sin límite de cantidad. La existencia de una fila en editorial_selections nunca hace elegible contenido oculto, vencido o de autor no autorizado -- editorial_eligible aplica siempre los mismos filtros base de vigencia/verificación. Expone geo_status (misma función compartida geo_eligible() del Bloque 2) y reason_code crudo -- la redacción visible final es responsabilidad de una capa de presentación posterior, nunca de este bloque.';

-- -----------------------------------------------------------------------
-- 5. events.editor_pick queda legacy, sin nuevas escrituras desde la
--    aplicación desde este bloque en adelante (mismo patrón ya usado con
--    saved_events/follows).
--
--    CORRECCIÓN PREPRODUCCIÓN (ver PROJECT.md / supabase/README.md):
--    esta migración fue corregida antes del primer despliegue remoto
--    para eliminar una dependencia operativa que impedía una aplicación
--    determinista desde una base de datos vacía -- el backfill original
--    de events.editor_pick exigía un administrador ya existente y
--    abortaba toda la secuencia de migraciones si no lo encontraba. El
--    backfill correspondiente fue trasladado a una herramienta operativa
--    separada (supabase/scripts/backfill_editorial_selections.sql),
--    ejecutada una vez, manualmente, después de bootstrap_admin.sql.
--    Ninguna migración posterior (0041-0046) depende de que esas filas
--    existan durante la propia secuencia de aplicación -- solo de que la
--    tabla y las funciones de esta sección existan (ver auditoría de
--    impacto en PROJECT.md).
-- -----------------------------------------------------------------------
comment on column public.events.editor_pick is
  'Legacy (Fase 6, Bloque 3): reemplazado por editorial_selections. Sin nuevas escrituras desde la aplicación -- se conserva sin eliminar, mismo patrón ya usado con columnas legacy anteriores (saved_events/follows), para que la reversión de este bloque sea completa y segura. El backfill de su contenido hacia editorial_selections no ocurre en esta migración -- ver supabase/scripts/backfill_editorial_selections.sql.';
