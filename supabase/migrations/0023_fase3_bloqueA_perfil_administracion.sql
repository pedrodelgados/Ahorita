-- Fase 3 (ver MASTERPLAN.md), Bloque A: perfil unificado y administración.
-- Aditivo sobre las Fases 1-2: no toca ninguna tabla ni política existente
-- de `actors`/`businesses`/`profiles`/`verifications`/`actor_roles`.
--
-- Decisiones aprobadas explícitamente antes de esta migración (ver el
-- análisis completo y los cuatro ajustes de producto en PROJECT.md):
--   1. "Centro del Negocio" (visión de Bloque C, no implementada aquí): las
--      tablas de este bloque (`actor_profile_details`, `actor_media`,
--      `actor_search_index`) se diseñan colgando de `actor_id` — el mismo
--      eje unificador de toda la arquitectura — precisamente para que
--      publicaciones/promociones/historias/reels/eventos/catálogo puedan
--      integrarse en el futuro sin rediseñar esta base.
--   2. Estructura multimedia preparada: `actor_media` (galería) además de
--      `logo_url`/`cover_image_url` en `actor_profile_details` — la
--      interfaz para gestionarla es Bloque C, no este bloque.
--   3. Búsqueda básica: `actor_search_index` (tsvector nativo de Postgres,
--      sin motor externo) — Bloque A la puebla desde nombre/bio/categoría;
--      Bloque B la extenderá para incluir el catálogo una vez que exista.
--   4. Colecciones flexibles de catálogo: decisión que aplica al Bloque B
--      (`business_catalog_collections`), no a este bloque.
--
-- Separación de responsabilidad deliberada, distinta de "propiedad legal":
--   - `businesses.owner_id` (ya existente, Bloque 5 de la Fase 1) sigue
--     siendo el ÚNICO propietario legal — rige la orfandad de negocios y
--     sigue siendo, sin cambios, quien puede aprobar/rechazar/revocar/
--     solicitar verificaciones (Fase 2). Este bloque NO toca `verifications`
--     ni sus políticas — los administradores operativos nuevos no obtienen
--     ninguna capacidad sobre verificación, deliberadamente, para no
--     reabrir superficie de riesgo ya cerrada en la Fase 2.
--   - `actor_managers` (nueva) agrega administradores OPERATIVOS —
--     delegación de gestión del perfil/medios/horario/catálogo sin
--     transferir propiedad. Solo el propietario legal (o un admin de
--     plataforma) puede agregar o revocar administradores — un
--     administrador nunca puede agregar a otro, cerrando la cadena de
--     delegación sin control.
--
-- Fuera de alcance de este bloque (ver PROJECT.md): interfaz visual
-- (Bloque C), horarios/catálogo (Bloque B), promociones, publicaciones,
-- historias, reels, QR, IA nueva, Azu Taxi, monetización.

-- ---------------------------------------------------------------------------
-- 1. actor_profile_details — perfil unificado. Un actor de CUALQUIER tipo
--    tiene exactamente una fila (incluidos los de sistema, por consistencia
--    estructural, aunque hoy no se editen desde ningún flujo de usuario).
--    `actor_id` es la propia llave primaria (1:1 real, no un id de fila
--    aparte).
-- ---------------------------------------------------------------------------
create table public.actor_profile_details (
  actor_id uuid primary key references public.actors (id) on delete cascade,
  bio text,
  logo_url text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.actor_profile_details enable row level security;

create policy "Perfil de actor es público" on public.actor_profile_details
  for select using (true);

create trigger actor_profile_details_set_updated_at
  before update on public.actor_profile_details
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. actor_managers — administración operativa, distinta de la propiedad
--    legal (`businesses.owner_id`). Nunca se borra una fila: se revoca con
--    `revoked_at`, mismo principio de auditoría inmutable que toda la
--    Fase 1/2.
-- ---------------------------------------------------------------------------
create table public.actor_managers (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  manager_profile_id uuid not null references public.profiles (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles (id) on delete set null,
  revocation_reason text
);

create unique index actor_managers_active_unique on public.actor_managers (actor_id, manager_profile_id)
  where revoked_at is null;

alter table public.actor_managers enable row level security;

-- Solo actores tipo negocio/organizador pueden tener administradores
-- operativos — una persona no se "administra", y un actor de sistema
-- tampoco (mismo principio ya aplicado en la Fase 2 para roles/verificación).
create function public.prevent_invalid_actor_manager_target()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.actors where id = new.actor_id and type in ('negocio', 'organizador')
  ) then
    raise exception 'Solo actores tipo negocio u organizador pueden tener administradores operativos';
  end if;
  return new;
end;
$$;

create trigger prevent_invalid_actor_manager
  before insert or update on public.actor_managers
  for each row execute function public.prevent_invalid_actor_manager_target();

create policy "Dueño, administradores o admin de plataforma ven la lista" on public.actor_managers
  for select using (
    public.actor_belongs_to_current_user(actor_id)
    or manager_profile_id = auth.uid()
    or public.is_admin()
  );

-- Únicamente el propietario legal (nunca un administrador operativo) o un
-- admin de plataforma pueden agregar administradores — cierra la escalada
-- de delegación sin control.
create policy "Solo el propietario legal o un admin agregan administradores" on public.actor_managers
  for insert with check (
    public.actor_belongs_to_current_user(actor_id) or public.is_admin()
  );

create policy "Solo el propietario legal o un admin revocan administradores" on public.actor_managers
  for update using (
    public.actor_belongs_to_current_user(actor_id) or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- 3. Función compuesta: ¿puede este usuario EDITAR el perfil operativo de
--    este actor? Dueño legal (Fase 2) O administrador operativo activo.
--    Deliberadamente NO se usa en ningún lugar de `verifications` — esa
--    tabla sigue exigiendo pertenencia real (dueño), nunca administración
--    operativa, sin cambios respecto a la Fase 2.
-- ---------------------------------------------------------------------------
create function public.actor_editable_by_current_user(check_actor_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.actor_belongs_to_current_user(check_actor_id)
    or exists (
      select 1 from public.actor_managers am
      where am.actor_id = check_actor_id
        and am.manager_profile_id = auth.uid()
        and am.revoked_at is null
    );
$$;

-- Ahora que actor_editable_by_current_user existe, se agregan las políticas
-- de escritura de actor_profile_details (dueño o administrador operativo).
create policy "Editable por dueño o administrador operativo" on public.actor_profile_details
  for update using (public.actor_editable_by_current_user(actor_id));

-- ---------------------------------------------------------------------------
-- 4. actor_media — galería preparada (logo/portada ya viven en
--    actor_profile_details; esta tabla es para recursos adicionales:
--    fotos de producto, video de presentación, etc.). La interfaz de carga
--    es Bloque C — esta migración solo prepara la estructura.
-- ---------------------------------------------------------------------------
create table public.actor_media (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('imagen', 'video')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.actor_media enable row level security;

create policy "Media activa es pública, dueño/admin ven también la inactiva" on public.actor_media
  for select using (
    is_active or public.actor_editable_by_current_user(actor_id) or public.is_admin()
  );

create policy "Dueño o administrador operativo suben media" on public.actor_media
  for insert with check (public.actor_editable_by_current_user(actor_id));

create policy "Dueño o administrador operativo editan media" on public.actor_media
  for update using (public.actor_editable_by_current_user(actor_id));

create policy "Dueño o administrador operativo eliminan media" on public.actor_media
  for delete using (public.actor_editable_by_current_user(actor_id));

-- ---------------------------------------------------------------------------
-- 5. actor_search_index — búsqueda básica con tsvector nativo de Postgres,
--    sin motor externo. Poblada por trigger a partir de nombre/bio/categoría;
--    el Bloque B la extenderá (CREATE OR REPLACE de la misma función) para
--    incluir el catálogo una vez que exista.
-- ---------------------------------------------------------------------------
create table public.actor_search_index (
  actor_id uuid primary key references public.actors (id) on delete cascade,
  search_vector tsvector not null default ''::tsvector,
  updated_at timestamptz not null default now()
);

alter table public.actor_search_index enable row level security;

create policy "Índice de búsqueda es público" on public.actor_search_index
  for select using (true);

-- Sin políticas de insert/update/delete para usuarios: se llena únicamente
-- vía la función de abajo (security definer), nunca directamente.

create function public.refresh_actor_search_index(target_actor_id uuid)
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

create function public.trigger_refresh_actor_search_index()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform public.refresh_actor_search_index(coalesce(new.actor_id, old.actor_id));
  return coalesce(new, old);
end;
$$;

create trigger on_actor_profile_details_change
  after insert or update on public.actor_profile_details
  for each row execute function public.trigger_refresh_actor_search_index();

create index actor_search_index_gin on public.actor_search_index using gin (search_vector);

-- ---------------------------------------------------------------------------
-- 6. Auto-creación de actor_profile_details para todo actor nuevo — mismo
--    patrón que handle_new_profile_actor/handle_new_business_actor (Bloque 2
--    de la Fase 1). Garantiza que "todo perfil se renderiza desde la misma
--    estructura de datos común" sea cierto también para actores futuros,
--    no solo para los backfileados ahora.
-- ---------------------------------------------------------------------------
create function public.handle_new_actor_profile_details()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.actor_profile_details (actor_id, bio)
  select new.id, b.description
  from public.businesses b
  where b.id = new.business_id
  union all
  select new.id, null
  where new.business_id is null
  on conflict (actor_id) do nothing;
  return new;
end;
$$;

create trigger on_actor_created_profile_details
  after insert on public.actors
  for each row execute function public.handle_new_actor_profile_details();

-- ---------------------------------------------------------------------------
-- 7. Backfill: una fila de actor_profile_details por cada actor ya
--    existente (fotografía puntual, sin sincronización posterior con
--    businesses.description — mismo criterio ya usado en toda la Fase 1/2).
--    El INSERT masivo dispara el trigger de la sección 5 fila por fila,
--    poblando también actor_search_index automáticamente, sin un paso
--    aparte.
-- ---------------------------------------------------------------------------
insert into public.actor_profile_details (actor_id, bio)
select a.id, b.description
from public.actors a
left join public.businesses b on b.id = a.business_id
where not exists (
  select 1 from public.actor_profile_details apd where apd.actor_id = a.id
);
