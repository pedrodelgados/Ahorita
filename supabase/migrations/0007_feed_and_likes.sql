-- Campos para el feed vertical de Inicio y el Bottom Sheet enriquecido de Explorar.

alter table public.places
  add column tag text check (tag in ('nuevo', 'gratis', 'imperdible', 'hoy', 'evento', 'promocion')),
  add column hours text,
  add column website text,
  add column tickets_url text,
  add column menu_url text,
  add column description text;

-- ---------------------------------------------------------------------------
-- post_likes — "me gusta" genérico para cualquier tipo de contenido del feed
-- (lugares, estados, preguntas, posts editoriales), separado de
-- answers.likes_count que ya existía para respuestas.
-- ---------------------------------------------------------------------------
create table public.post_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('place', 'status', 'question', 'editorial_post')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

alter table public.post_likes enable row level security;

create policy "Los likes son públicos" on public.post_likes
  for select using (true);

create policy "El usuario da like" on public.post_likes
  for insert with check (auth.uid() = user_id);

create policy "El usuario quita su like" on public.post_likes
  for delete using (auth.uid() = user_id);

-- Vista de conteo agregado, consultable desde el cliente vía PostgREST.
create view public.post_like_counts
with (security_invoker = true) as
select target_type, target_id, count(*) as likes_count
from public.post_likes
group by target_type, target_id;
