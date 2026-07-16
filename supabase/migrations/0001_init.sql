-- Ahorita — esquema inicial (Fase 1)
-- Ejecutar en el SQL editor de Supabase, o vía `supabase db push` si usas la CLI.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles (extiende auth.users; Supabase Auth ya maneja email/password/OAuth)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  avatar_url text,
  usage_mode text check (
    usage_mode in ('vivo_en_cuenca', 'visitante', 'negocio', 'organizador')
  ),
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Perfiles son públicos" on public.profiles
  for select using (true);

create policy "El usuario crea su propio perfil" on public.profiles
  for insert with check (auth.uid() = id);

create policy "El usuario edita su propio perfil" on public.profiles
  for update using (auth.uid() = id);

-- Crea automáticamente un perfil vacío cuando alguien se registra en Supabase Auth.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- channels (catálogo fijo de categorías/canales)
-- ---------------------------------------------------------------------------
create table public.channels (
  id text primary key,
  label text not null,
  emoji text,
  color_hex text not null
);

alter table public.channels enable row level security;

create policy "Canales son públicos" on public.channels
  for select using (true);

insert into public.channels (id, label, emoji, color_hex) values
  ('gastronomia', 'Gastronomía', '🍽️', '#E8785C'),
  ('cultura', 'Cultura', '🎭', '#8B7CE0'),
  ('vida_nocturna', 'Vida nocturna', '🌙', '#E0669A'),
  ('deportes', 'Deportes', '⚽', '#4FA383'),
  ('naturaleza', 'Naturaleza', '🌿', '#4FA3A0'),
  ('glamping', 'Glamping', '⛺', '#B8875A'),
  ('hoteles', 'Hoteles', '🏨', '#5B94C9'),
  ('musica', 'Música', '🎵', '#D9A83F'),
  ('familiar', 'Familiar', '👨‍👩‍👧', '#E0966A'),
  ('pet_friendly', 'Pet friendly', '🐾', '#7BAE8C');

-- ---------------------------------------------------------------------------
-- places
-- ---------------------------------------------------------------------------
create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text,
  channel_default text references public.channels (id),
  image_url text,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "Lugares son públicos" on public.places
  for select using (true);

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text references public.channels (id),
  address text,
  lat double precision,
  lng double precision,
  whatsapp text,
  phone text,
  instagram text,
  website text,
  hours text,
  image_url text,
  description text,
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobado')),
  created_at timestamptz not null default now()
);

alter table public.businesses enable row level security;

create policy "Negocios aprobados son públicos, el dueño ve el suyo" on public.businesses
  for select using (status = 'aprobado' or owner_id = auth.uid());

create policy "El dueño crea su negocio" on public.businesses
  for insert with check (owner_id = auth.uid());

create policy "El dueño edita su negocio" on public.businesses
  for update using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- questions
-- ---------------------------------------------------------------------------
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  channel text references public.channels (id),
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.questions enable row level security;

create policy "Preguntas son públicas" on public.questions
  for select using (true);

create policy "Usuarios autenticados crean preguntas" on public.questions
  for insert with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- answers
-- ---------------------------------------------------------------------------
create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  likes_count integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.answers enable row level security;

create policy "Respuestas son públicas" on public.answers
  for select using (true);

create policy "Usuarios autenticados crean respuestas" on public.answers
  for insert with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- statuses (reportes en vivo)
-- ---------------------------------------------------------------------------
create table public.statuses (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  channel text references public.channels (id),
  text text,
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now()
);

alter table public.statuses enable row level security;

create policy "Estados son públicos" on public.statuses
  for select using (true);

create policy "Usuarios autenticados crean estados" on public.statuses
  for insert with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- editorial_posts (contenido curado por el equipo, ej. "Este fin de semana")
-- ---------------------------------------------------------------------------
create table public.editorial_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text,
  items text[] not null default '{}',
  published_at timestamptz
);

alter table public.editorial_posts enable row level security;

create policy "Editorial es público" on public.editorial_posts
  for select using (true);
