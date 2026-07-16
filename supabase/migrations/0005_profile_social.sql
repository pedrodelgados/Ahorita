-- Fase 5 — lugares guardados, seguir personas, y bandera de administrador.

alter table public.profiles
  add column is_admin boolean not null default false;

-- ---------------------------------------------------------------------------
-- saved_places
-- ---------------------------------------------------------------------------
create table public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

alter table public.saved_places enable row level security;

create policy "El usuario ve sus lugares guardados" on public.saved_places
  for select using (auth.uid() = user_id);

create policy "El usuario guarda lugares" on public.saved_places
  for insert with check (auth.uid() = user_id);

create policy "El usuario quita lugares guardados" on public.saved_places
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- follows (seguir personas)
-- ---------------------------------------------------------------------------
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  followed_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, followed_id),
  check (follower_id <> followed_id)
);

alter table public.follows enable row level security;

create policy "Los seguidores son públicos" on public.follows
  for select using (true);

create policy "El usuario sigue a otros" on public.follows
  for insert with check (auth.uid() = follower_id);

create policy "El usuario deja de seguir" on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------------------------------------------------------------------------
-- Permisos de administrador (panel de moderación)
-- ---------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "Admins aprueban o rechazan negocios" on public.businesses
  for update using (public.is_admin());

create policy "Admins crean lugares" on public.places
  for insert with check (public.is_admin());

create policy "Admins verifican respuestas" on public.answers
  for update using (public.is_admin());

create policy "Admins moderan preguntas" on public.questions
  for delete using (public.is_admin());

create policy "Admins moderan respuestas" on public.answers
  for delete using (public.is_admin());

create policy "Admins moderan estados" on public.statuses
  for delete using (public.is_admin());

create policy "Admins rechazan (eliminan) negocios" on public.businesses
  for delete using (public.is_admin());
