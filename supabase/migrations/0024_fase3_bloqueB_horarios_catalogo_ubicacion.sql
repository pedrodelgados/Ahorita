-- Fase 3 (ver MASTERPLAN.md), Bloque B: horarios, catálogo y ubicación
-- estructurada. Aditivo sobre las Fases 1-2 y el Bloque A de la Fase 3: no
-- toca ninguna tabla ni política existente.
--
-- Alcance acordado explícitamente antes de esta migración (ver PROJECT.md):
--   1. Horarios regulares (business_hours): múltiples intervalos por día,
--      turnos que cruzan medianoche, días cerrados, atención 24h, con
--      validaciones que impiden intervalos inválidos o superpuestos.
--   2. Horarios especiales (business_special_hours): excepciones por fecha
--      (feriados, cierres temporales, horario reducido/ampliado) con
--      prioridad sobre el horario regular del mismo día.
--   3. Estado operativo calculado centralizado en PostgreSQL
--      (business_open_status): abierto ahora / próxima apertura / próximo
--      cierre, zona horaria America/Guayaquil.
--   4. Catálogo (business_catalog_collections / business_catalog_items):
--      colecciones flexibles definidas por cada negocio, sin taxonomía
--      rígida por rubro.
--   5. Ubicación estructurada: businesses.zone_id, backfill únicamente con
--      coincidencias confiables.
--
-- Fuente de verdad (punto 6 del alcance aprobado): businesses.hours (texto
-- libre existente) NO se retira ni se sincroniza en este bloque. El
-- frontend no cambia. business_hours/business_special_hours serán la
-- fuente de verdad futura una vez que exista la interfaz del Bloque C.
--
-- Seguridad (punto 7): se agregan dos funciones auxiliares,
-- business_editable_by_current_user y business_visible_to_current_user,
-- construidas sobre actor_editable_by_current_user (Bloque A) para evitar
-- repetir la misma subconsulta en las cuatro tablas nuevas. "Un
-- administrador operativo no puede delegar permisos" ya está garantizado
-- por el diseño de actor_managers del Bloque A (solo el propietario legal o
-- un admin de plataforma insertan/actualizan actor_managers) — este bloque
-- no introduce ninguna vía nueva de delegación, por lo que no requiere
-- refuerzo adicional.
--
-- Hallazgo de ubicación (punto 5, documentado con honestidad en vez de
-- inventar una coincidencia): a diferencia de `places.area` (texto libre
-- que sí existía y se mapeó a `zones.name` en el Bloque 4 de la Fase 1),
-- `businesses` NO tiene ningún campo de texto libre de zona/área, y `zones`
-- no tiene geometría para cruzar contra lat/lng. No existe ninguna fuente
-- de datos confiable para backfilear `businesses.zone_id` hoy. Esta
-- migración agrega la columna (aditiva) pero el backfill no actualiza
-- ninguna fila — es un hallazgo real, no un defecto, y se documenta tal
-- cual en PROJECT.md.
--
-- Fuera de alcance de este bloque: interfaz visual (Bloque C), promociones,
-- publicaciones, historias, reels, sincronización automática con
-- businesses.hours/description.

-- ---------------------------------------------------------------------------
-- 0. Funciones auxiliares de seguridad, reutilizadas por las cuatro tablas
--    nuevas de este bloque.
-- ---------------------------------------------------------------------------
create function public.business_editable_by_current_user(check_business_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.actors a
    where a.business_id = check_business_id
      and (public.actor_editable_by_current_user(a.id) or public.is_admin())
  );
$$;

create function public.business_visible_to_current_user(check_business_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.businesses b
    where b.id = check_business_id
      and (b.status = 'aprobado' or public.business_editable_by_current_user(check_business_id))
  );
$$;

-- ---------------------------------------------------------------------------
-- 1. business_hours — horario regular. Varios intervalos por día
--    (day_of_week 0-6, igual que extract(dow) de Postgres: 0=domingo).
--    Exactamente uno de {cerrado, 24h, intervalo válido} por fila, exigido
--    por check constraint.
-- ---------------------------------------------------------------------------
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  is_closed boolean not null default false,
  is_24h boolean not null default false,
  opens_at time,
  closes_at time,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint business_hours_shape check (
    (is_closed and not is_24h and opens_at is null and closes_at is null)
    or (is_24h and not is_closed and opens_at is null and closes_at is null)
    or (not is_closed and not is_24h and opens_at is not null and closes_at is not null and opens_at <> closes_at)
  )
);

-- A lo sumo una fila "cerrado" y una fila "24h" por negocio/día (no tiene
-- sentido tener dos); los intervalos normales sí pueden repetirse y se
-- validan por superposición con el trigger de abajo, no con un índice.
create unique index business_hours_one_closed_per_day on public.business_hours (business_id, day_of_week)
  where is_closed;
create unique index business_hours_one_24h_per_day on public.business_hours (business_id, day_of_week)
  where is_24h;

alter table public.business_hours enable row level security;

create policy "Horario visible si el negocio es visible" on public.business_hours
  for select using (public.business_visible_to_current_user(business_id));

create policy "Dueño o administrador operativo gestionan horario" on public.business_hours
  for all using (public.business_editable_by_current_user(business_id))
  with check (public.business_editable_by_current_user(business_id));

-- Convierte un intervalo (posiblemente cruzando medianoche) en uno o dos
-- rangos de minutos [0, 1440) para poder detectar superposiciones reales
-- con el operador && de Postgres, incluso entre turnos que cruzan
-- medianoche y turnos normales.
create function public.time_interval_to_ranges(p_opens time, p_closes time)
returns int4range[]
language sql
immutable
as $$
  select case
    when p_closes < p_opens then array[
      int4range(extract(epoch from p_opens)::int / 60, 1440, '[)'),
      int4range(0, extract(epoch from p_closes)::int / 60, '[)')
    ]
    else array[
      int4range(extract(epoch from p_opens)::int / 60, extract(epoch from p_closes)::int / 60, '[)')
    ]
  end;
$$;

create function public.validate_business_hours_no_overlap()
returns trigger
language plpgsql
as $$
declare
  conflict_count integer;
begin
  if new.is_closed or new.is_24h then
    return new;
  end if;

  select count(*) into conflict_count
  from public.business_hours bh
  where bh.business_id = new.business_id
    and bh.day_of_week = new.day_of_week
    and bh.id is distinct from new.id
    and not bh.is_closed
    and not bh.is_24h
    and exists (
      select 1
      from unnest(public.time_interval_to_ranges(new.opens_at, new.closes_at)) as r1
      join unnest(public.time_interval_to_ranges(bh.opens_at, bh.closes_at)) as r2
        on r1 && r2
    );

  if conflict_count > 0 then
    raise exception 'El intervalo se superpone con otro horario ya definido para ese día';
  end if;

  return new;
end;
$$;

create trigger validate_business_hours_no_overlap
  before insert or update on public.business_hours
  for each row execute function public.validate_business_hours_no_overlap();

-- ---------------------------------------------------------------------------
-- 2. business_special_hours — excepciones por fecha (feriados, cierres
--    temporales, horario reducido/ampliado). Un único estado por fecha
--    (unique(business_id, special_date)) — no varios intervalos por
--    excepción, decisión deliberada de simplicidad de alcance, documentada
--    en PROJECT.md. Reemplaza por completo el horario regular de ese día
--    cuando existe.
-- ---------------------------------------------------------------------------
create table public.business_special_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  special_date date not null,
  is_closed boolean not null default false,
  is_24h boolean not null default false,
  opens_at time,
  closes_at time,
  reason text,
  created_at timestamptz not null default now(),
  unique (business_id, special_date),
  constraint business_special_hours_shape check (
    (is_closed and not is_24h and opens_at is null and closes_at is null)
    or (is_24h and not is_closed and opens_at is null and closes_at is null)
    or (not is_closed and not is_24h and opens_at is not null and closes_at is not null and opens_at <> closes_at)
  )
);

alter table public.business_special_hours enable row level security;

create policy "Horario especial visible si el negocio es visible" on public.business_special_hours
  for select using (public.business_visible_to_current_user(business_id));

create policy "Dueño o administrador operativo gestionan horario especial" on public.business_special_hours
  for all using (public.business_editable_by_current_user(business_id))
  with check (public.business_editable_by_current_user(business_id));

-- ---------------------------------------------------------------------------
-- 3. Cálculo de estado operativo — abierto ahora / próxima apertura /
--    próximo cierre. Centralizado en PostgreSQL, zona horaria
--    America/Guayaquil.
-- ---------------------------------------------------------------------------

-- ¿Está p_time dentro de [p_opens, p_closes)? Maneja el caso en que el
-- intervalo cruza medianoche (p_closes < p_opens).
create function public.time_is_within(p_time time, p_opens time, p_closes time)
returns boolean
language sql
immutable
as $$
  select case
    when p_closes < p_opens then (p_time >= p_opens or p_time < p_closes)
    else (p_time >= p_opens and p_time < p_closes)
  end;
$$;

-- Intervalos efectivos de un negocio para una fecha dada: si existe una
-- fila de horario especial para esa fecha, tiene prioridad absoluta y
-- reemplaza el horario regular por completo; si no, se usan todas las filas
-- de horario regular de ese día de la semana.
create function public.business_effective_intervals(p_business_id uuid, p_date date)
returns table (is_closed boolean, is_24h boolean, opens_at time, closes_at time)
language sql
stable
as $$
  select bsh.is_closed, bsh.is_24h, bsh.opens_at, bsh.closes_at
  from public.business_special_hours bsh
  where bsh.business_id = p_business_id and bsh.special_date = p_date
  union all
  select bh.is_closed, bh.is_24h, bh.opens_at, bh.closes_at
  from public.business_hours bh
  where bh.business_id = p_business_id
    and bh.day_of_week = extract(dow from p_date)::smallint
    and not exists (
      select 1 from public.business_special_hours bsh2
      where bsh2.business_id = p_business_id and bsh2.special_date = p_date
    );
$$;

-- Estado operativo: abierto ahora, próxima apertura, próximo cierre.
-- Revisa hoy y ayer (para detectar un turno de ayer que cruza medianoche y
-- sigue abierto hoy temprano) para "abierto ahora", y los próximos 8 días
-- para encontrar la próxima transición real. Un día 24h no genera una
-- transición explícita de apertura/cierre en esta primera versión
-- (limitación conocida y documentada: un negocio 24h no tiene una
-- "próxima apertura" con sentido).
create function public.business_open_status(p_business_id uuid, p_at timestamptz default now())
returns table (is_open boolean, next_open_at timestamptz, next_close_at timestamptz)
language plpgsql
stable
as $$
declare
  local_at timestamp := p_at at time zone 'America/Guayaquil';
  local_date date := local_at::date;
  local_time time := local_at::time;
  is_currently_open boolean := false;
  found_next_open timestamptz;
  found_next_close timestamptz;
  rec record;
  d date;
  i integer;
begin
  -- ¿Abierto ahora? El horario de HOY y el de AYER se evalúan de forma
  -- asimétrica a propósito: un intervalo de hoy que cruza medianoche cubre
  -- desde su apertura hasta el final del día (su tramo posterior a
  -- medianoche pertenece al día siguiente, no a hoy); un intervalo de ayer
  -- solo puede "derramarse" sobre hoy si cruzaba medianoche, y únicamente
  -- en su tramo antes de su hora de cierre. Un intervalo normal (que no
  -- cruza medianoche) nunca se deriva del día anterior. Usar
  -- time_is_within() simétricamente para ambos días haría que la madrugada
  -- de HOY (antes de que empiece el turno de HOY) se marcara como abierta
  -- por error — de ahí la separación explícita en dos bucles.
  for rec in select * from public.business_effective_intervals(p_business_id, local_date) loop
    if rec.is_closed then
      continue;
    elsif rec.is_24h then
      is_currently_open := true;
    elsif rec.closes_at < rec.opens_at then
      if local_time >= rec.opens_at then
        is_currently_open := true;
      end if;
    elsif local_time >= rec.opens_at and local_time < rec.closes_at then
      is_currently_open := true;
    end if;
  end loop;

  for rec in select * from public.business_effective_intervals(p_business_id, local_date - 1) loop
    if rec.is_closed or rec.is_24h then
      continue;
    elsif rec.closes_at < rec.opens_at and local_time < rec.closes_at then
      is_currently_open := true;
    end if;
  end loop;

  -- Próxima apertura / próximo cierre: recorro desde ayer (i = -1, para
  -- capturar el cierre de un turno de ayer que cruza medianoche y todavía
  -- no ha terminado) hasta 8 días hacia adelante, generando eventos
  -- concretos, y me quedo con el primero estrictamente posterior a p_at en
  -- cada categoría.
  for i in -1..8 loop
    d := local_date + i;
    for rec in select * from public.business_effective_intervals(p_business_id, d) loop
      if rec.is_closed or rec.is_24h then
        continue;
      end if;

      -- Evento de apertura: d + rec.opens_at
      if (d + rec.opens_at) at time zone 'America/Guayaquil' > p_at
        and (found_next_open is null or (d + rec.opens_at) at time zone 'America/Guayaquil' < found_next_open)
      then
        found_next_open := (d + rec.opens_at) at time zone 'America/Guayaquil';
      end if;

      -- Evento de cierre: si el turno cruza medianoche, el cierre ocurre
      -- al día siguiente de d.
      if rec.closes_at < rec.opens_at then
        if (d + 1 + rec.closes_at) at time zone 'America/Guayaquil' > p_at
          and (found_next_close is null or (d + 1 + rec.closes_at) at time zone 'America/Guayaquil' < found_next_close)
        then
          found_next_close := (d + 1 + rec.closes_at) at time zone 'America/Guayaquil';
        end if;
      else
        if (d + rec.closes_at) at time zone 'America/Guayaquil' > p_at
          and (found_next_close is null or (d + rec.closes_at) at time zone 'America/Guayaquil' < found_next_close)
        then
          found_next_close := (d + rec.closes_at) at time zone 'America/Guayaquil';
        end if;
      end if;
    end loop;
  end loop;

  is_open := is_currently_open;
  next_open_at := found_next_open;
  next_close_at := found_next_close;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Catálogo — colecciones flexibles definidas por cada negocio, sin
--    taxonomía rígida (aplica por igual a restaurantes, barberías,
--    ferreterías, hoteles, tiendas, gimnasios, servicios profesionales).
-- ---------------------------------------------------------------------------
create table public.business_catalog_collections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.business_catalog_collections enable row level security;

create policy "Colección visible si el negocio es visible" on public.business_catalog_collections
  for select using (public.business_visible_to_current_user(business_id));

create policy "Dueño o administrador operativo gestionan colecciones" on public.business_catalog_collections
  for all using (public.business_editable_by_current_user(business_id))
  with check (public.business_editable_by_current_user(business_id));

create table public.business_catalog_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  collection_id uuid references public.business_catalog_collections (id) on delete set null,
  name text not null,
  description text,
  price_type text not null default 'fijo' check (price_type in ('fijo', 'desde', 'variable')),
  price numeric(12, 2),
  currency text not null default 'USD',
  availability text not null default 'disponible' check (availability in ('disponible', 'agotado', 'temporada')),
  image_url text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_catalog_items_price_shape check (
    (price_type = 'variable' and price is null) or (price_type <> 'variable')
  )
);

alter table public.business_catalog_items enable row level security;

create policy "Ítem visible si es visible y el negocio es visible" on public.business_catalog_items
  for select using (
    (is_visible and public.business_visible_to_current_user(business_id))
    or public.business_editable_by_current_user(business_id)
  );

create policy "Dueño o administrador operativo gestionan ítems" on public.business_catalog_items
  for all using (public.business_editable_by_current_user(business_id))
  with check (public.business_editable_by_current_user(business_id));

create trigger business_catalog_items_set_updated_at
  before update on public.business_catalog_items
  for each row execute function public.set_updated_at();

-- Un ítem solo puede pertenecer a una colección del MISMO negocio — impide
-- que un administrador de un negocio A asigne su ítem a una colección de
-- un negocio B (aunque la política de RLS ya lo impediría al no poder ver
-- ni referenciar filas ajenas por FK cruzado, este trigger deja la regla
-- explícita e independiente de RLS).
create function public.validate_catalog_item_collection()
returns trigger
language plpgsql
as $$
begin
  if new.collection_id is not null and not exists (
    select 1 from public.business_catalog_collections c
    where c.id = new.collection_id and c.business_id = new.business_id
  ) then
    raise exception 'La colección debe pertenecer al mismo negocio que el ítem';
  end if;
  return new;
end;
$$;

create trigger validate_catalog_item_collection
  before insert or update on public.business_catalog_items
  for each row execute function public.validate_catalog_item_collection();

-- Extiende el índice de búsqueda del Bloque A para incluir el catálogo
-- (nombre y descripción de ítems visibles), sin cambiar su forma ni su
-- disparador — mismo patrón "CREATE OR REPLACE" ya anticipado en el
-- comentario del Bloque A.
create or replace function public.refresh_actor_search_index(target_actor_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  doc tsvector;
begin
  select
    setweight(to_tsvector('spanish', coalesce(a.display_name, '')), 'A')
    || setweight(to_tsvector('spanish', coalesce(apd.bio, '')), 'B')
    || setweight(to_tsvector('spanish', coalesce(b.category, '')), 'C')
    || setweight(to_tsvector('spanish', coalesce((
        select string_agg(ci.name || ' ' || coalesce(ci.description, ''), ' ')
        from public.business_catalog_items ci
        where ci.business_id = a.business_id and ci.is_visible
      ), '')), 'C')
  into doc
  from public.actors a
  left join public.actor_profile_details apd on apd.actor_id = a.id
  left join public.businesses b on b.id = a.business_id
  where a.id = target_actor_id;

  insert into public.actor_search_index (actor_id, search_vector, updated_at)
  values (target_actor_id, coalesce(doc, ''::tsvector), now())
  on conflict (actor_id) do update
    set search_vector = excluded.search_vector, updated_at = excluded.updated_at;
end;
$$;

-- Cambiar el catálogo de un negocio debe refrescar el índice de búsqueda
-- del actor de ese negocio.
create function public.trigger_refresh_actor_search_index_from_catalog()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target_business_id uuid := coalesce(new.business_id, old.business_id);
  target_actor_id uuid;
begin
  select id into target_actor_id from public.actors where business_id = target_business_id;
  if target_actor_id is not null then
    perform public.refresh_actor_search_index(target_actor_id);
  end if;
  return coalesce(new, old);
end;
$$;

create trigger on_catalog_item_change
  after insert or update or delete on public.business_catalog_items
  for each row execute function public.trigger_refresh_actor_search_index_from_catalog();

-- ---------------------------------------------------------------------------
-- 5. Ubicación estructurada — businesses.zone_id.
--
-- Hallazgo (ver cabecera de este archivo): no existe ninguna fuente de
-- datos confiable para backfilear esta columna hoy (a diferencia de
-- places.area en el Bloque 4, businesses no tiene ningún campo de texto
-- libre de zona/área). Se agrega la columna sin backfill — 0 filas
-- actualizadas es el resultado correcto y esperado, no un error.
-- ---------------------------------------------------------------------------
alter table public.businesses add column zone_id uuid references public.zones (id) on delete set null;
