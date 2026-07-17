-- Fase 1 del ecosistema social (ver MASTERPLAN.md) — Bloque 1: esquema
-- fundacional. Esta migración únicamente CREA tablas nuevas; no altera ni
-- una sola fila de ninguna tabla existente (profiles, businesses, places,
-- events, post_likes, saved_places, saved_events, follows, event_comments
-- quedan completamente intactas). La vinculación real de esas tablas con
-- las nuevas (Bloques 2-4) es deliberadamente una migración posterior,
-- separada y verificable por su cuenta.
--
-- Decisiones de arquitectura aplicadas aquí (ver ARCHITECTURE.md §9-11 y
-- MASTERPLAN.md, registro de decisiones 9, 12-16):
--   - Actor gana un tercer tipo, 'sistema', para identidades que no son
--     persona ni negocio (la Guía IA, la curaduría editorial de Ahorita).
--   - Publicación se prepara para el patrón "núcleo genérico + tabla de
--     detalle por subtipo": event_details es el primer caso, separando de
--     events los campos que solo un evento necesita. events en sí no se
--     toca todavía — eso ocurre en el Bloque 3.
--   - Interacción incluye 'compartir' desde ahora; 'reportar' NO vive aquí
--     a propósito (queda para su propia entidad de moderación, Fase 13).
--   - Ciudad gana una jerarquía territorial de un solo nivel (Zona), lista
--     para crecer sin comprometerse a más niveles todavía.
--   - Se adelanta una línea base de privacidad (consent_records).

-- ---------------------------------------------------------------------------
-- cities — dimensión de escopo geográfico. Un único valor poblado (Cuenca)
-- a propósito: el resto del ecosistema sigue siendo de una sola ciudad,
-- esto solo evita una migración estructural el día que se evalúe expandir.
-- ---------------------------------------------------------------------------
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.cities enable row level security;

create policy "Ciudades son públicas" on public.cities
  for select using (true);

create policy "Admins gestionan ciudades" on public.cities
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.cities (name) values ('Cuenca');

-- ---------------------------------------------------------------------------
-- zones — subdivisión territorial dentro de una ciudad (Centro Histórico,
-- Turi...). Reemplaza el campo de texto libre places.area (la migración de
-- places hacia esta tabla ocurre en el Bloque 4, no aquí). Un solo nivel de
-- profundidad por ahora: parent_zone_id existe para poder insertar un nivel
-- adicional en el futuro sin cambiar la forma de la tabla, pero no se puebla
-- ninguna jerarquía de varios niveles hoy porque no hay un caso de uso real
-- que la necesite.
-- ---------------------------------------------------------------------------
create table public.zones (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities (id) on delete cascade,
  name text not null,
  parent_zone_id uuid references public.zones (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (city_id, name)
);

alter table public.zones enable row level security;

create policy "Zonas son públicas" on public.zones
  for select using (true);

create policy "Admins gestionan zonas" on public.zones
  for all using (public.is_admin()) with check (public.is_admin());

-- Solo se pueblan las zonas realmente en uso hoy (places.area, sin migrar
-- todavía) — nunca zonas especulativas sin un lugar real que las use.
insert into public.zones (city_id, name)
select id, 'Centro Histórico' from public.cities where name = 'Cuenca'
union all
select id, 'Turi' from public.cities where name = 'Cuenca';

-- ---------------------------------------------------------------------------
-- actors — identidad unificada de Persona, Negocio/Organizador, y Sistema.
-- profile_id/business_id son nulos y únicos: un actor de tipo 'sistema' no
-- referencia ninguno de los dos. La vinculación real de cada profile/
-- business existente a un actor ocurre en el Bloque 2 (identidad); esta
-- migración solo deja la estructura lista y crea los dos actores de sistema
-- ya aprobados.
-- ---------------------------------------------------------------------------
create table public.actors (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('persona', 'negocio', 'organizador', 'sistema')),
  profile_id uuid unique references public.profiles (id) on delete cascade,
  business_id uuid unique references public.businesses (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  check (
    (type = 'persona' and profile_id is not null and business_id is null)
    or (type in ('negocio', 'organizador') and business_id is not null and profile_id is null)
    or (type = 'sistema' and profile_id is null and business_id is null)
  )
);

alter table public.actors enable row level security;

create policy "Actores son públicos" on public.actors
  for select using (true);

create policy "Admins gestionan actores de sistema" on public.actors
  for insert with check (type = 'sistema' and public.is_admin());

create policy "Admins actualizan actores de sistema" on public.actors
  for update using (type = 'sistema' and public.is_admin());

-- Los dos actores de tipo Sistema aprobados: la Guía IA (autora futura de
-- contenido persistente, ver AI_PHILOSOPHY.md §16) y Ahorita Editorial (la
-- identidad de la curaduría del equipo, hoy solo un booleano editor_pick).
insert into public.actors (type, display_name) values
  ('sistema', 'Guía IA'),
  ('sistema', 'Ahorita Editorial');

-- ---------------------------------------------------------------------------
-- interactions — generaliza post_likes/saved_places/saved_events/follows
-- (la migración de esos datos ocurre en el Bloque 4, esta tabla nace vacía).
-- Catálogo de tipos ya incluye 'compartir' desde ahora. 'reportar' queda
-- deliberadamente fuera — necesita motivo/estado/resolución, una forma de
-- dato distinta a la de una interacción simple, y vive en su propia entidad
-- de moderación (Fase 13).
-- ---------------------------------------------------------------------------
create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  type text not null check (
    type in ('me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir')
  ),
  target_type text not null,
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (actor_id, type, target_type, target_id)
);

create index interactions_target_idx on public.interactions (target_type, target_id);

alter table public.interactions enable row level security;

create policy "Interacciones son públicas" on public.interactions
  for select using (true);

create policy "El dueño del actor crea sus interacciones" on public.interactions
  for insert with check (
    exists (
      select 1 from public.actors a
      where a.id = actor_id and a.profile_id = auth.uid()
    )
  );

create policy "El dueño del actor quita sus interacciones" on public.interactions
  for delete using (
    exists (
      select 1 from public.actors a
      where a.id = actor_id and a.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- event_details — primer caso real del patrón "núcleo genérico + detalle
-- por subtipo" (ver ARCHITECTURE.md §9). Nace vacía: separar los datos que
-- ya existen en events hacia esta tabla es trabajo del Bloque 3, no de este
-- bloque de esquema. La visibilidad sigue las mismas reglas que ya rigen a
-- events (publicado o admin), consultadas mediante join.
-- ---------------------------------------------------------------------------
create table public.event_details (
  event_id uuid primary key references public.events (id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz,
  price numeric,
  ticket_url text,
  organizer text
);

alter table public.event_details enable row level security;

create policy "Detalle visible si el evento es visible" on public.event_details
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_id and (e.status = 'publicado' or public.is_admin())
    )
  );

create policy "Admins gestionan el detalle de eventos" on public.event_details
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- consent_records — línea base de privacidad adelantada a la Fase 1
-- (decisión 9): registro de consentimiento y de solicitudes de acceso o
-- eliminación de datos personales. El mecanismo que efectivamente exporta o
-- elimina datos es trabajo del Bloque 5 — esta tabla es el registro sobre el
-- que ese mecanismo se apoya, y nace vacía.
-- ---------------------------------------------------------------------------
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null check (
    event_type in ('consentimiento_otorgado', 'exportacion_solicitada', 'eliminacion_solicitada')
  ),
  detail text,
  created_at timestamptz not null default now()
);

alter table public.consent_records enable row level security;

create policy "El usuario ve su propio registro de privacidad" on public.consent_records
  for select using (auth.uid() = user_id or public.is_admin());

create policy "El usuario crea su propio registro de privacidad" on public.consent_records
  for insert with check (auth.uid() = user_id);
