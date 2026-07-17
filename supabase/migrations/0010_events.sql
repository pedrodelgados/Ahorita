-- Corrección de producto: Inicio pasa a ser un feed exclusivamente de
-- EVENTOS (festivales, conciertos, ferias, funciones, carreras...), no una
-- mezcla de lugares/estados/preguntas/editorial. Esta tabla reemplaza
-- editorial_posts.

drop table public.editorial_posts;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses (id) on delete set null,
  title text not null,
  description text,
  category text references public.channels (id),
  image_url text,
  video_url text,
  location_name text,
  lat double precision,
  lng double precision,
  start_at timestamptz not null,
  end_at timestamptz,
  price numeric,
  ticket_url text,
  tag text check (tag in ('nuevo', 'gratis', 'hoy', 'imperdible', 'promocion')),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "Los eventos son públicos" on public.events
  for select using (true);

-- Solo admins, o el dueño de un negocio aprobado publicando a nombre de su
-- propio negocio — no es contenido abierto de cualquier usuario.
create policy "Admins y negocios aprobados crean eventos" on public.events
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_id = auth.uid() and b.status = 'aprobado'
    )
  );

create policy "Admins editan eventos" on public.events
  for update using (public.is_admin());

create policy "Admins eliminan eventos" on public.events
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- event_comments — comentarios de un evento (acción "💬 comentarios" del feed)
-- ---------------------------------------------------------------------------
create table public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.event_comments enable row level security;

create policy "Los comentarios de eventos son públicos" on public.event_comments
  for select using (true);

create policy "Usuarios autenticados comentan eventos" on public.event_comments
  for insert with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- saved_events — "🔖 guardar" en un evento del feed
-- ---------------------------------------------------------------------------
create table public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

alter table public.saved_events enable row level security;

create policy "El usuario ve sus eventos guardados" on public.saved_events
  for select using (auth.uid() = user_id);

create policy "El usuario guarda eventos" on public.saved_events
  for insert with check (auth.uid() = user_id);

create policy "El usuario quita eventos guardados" on public.saved_events
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Contadores desnormalizados (likes_count / comments_count en events),
-- mantenidos con triggers para que el feed no dependa de un count() en cada
-- carga.
-- ---------------------------------------------------------------------------
alter table public.post_likes drop constraint post_likes_target_type_check;
alter table public.post_likes
  add constraint post_likes_target_type_check
  check (target_type in ('place', 'status', 'question', 'event'));

create function public.sync_event_likes_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' and new.target_type = 'event' then
    update public.events set likes_count = likes_count + 1 where id = new.target_id;
  elsif TG_OP = 'DELETE' and old.target_type = 'event' then
    update public.events set likes_count = greatest(0, likes_count - 1) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger post_likes_sync_events
  after insert or delete on public.post_likes
  for each row execute function public.sync_event_likes_count();

create function public.sync_event_comments_count()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    update public.events set comments_count = comments_count + 1 where id = new.event_id;
  elsif TG_OP = 'DELETE' then
    update public.events set comments_count = greatest(0, comments_count - 1) where id = old.event_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger event_comments_sync_count
  after insert or delete on public.event_comments
  for each row execute function public.sync_event_comments_count();
