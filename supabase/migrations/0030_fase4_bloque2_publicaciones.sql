-- Fase 4 (ver FASE4_CONTRATO_ARQUITECTONICO.md), Bloque 2: Publicaciones
-- alimentan el Feed. Núcleo genérico de Publicación (pensado para acoger
-- también Promociones en el Bloque 3 sin rediseñarse) + detalle propio del
-- subtipo "publicacion". `events` no se toca en absoluto en esta migración.
--
-- Ajustes de producto incorporados antes de implementar (ver aprobación del
-- Bloque 2 en PROJECT.md):
--   1. Protección contra publicaciones accidentales: se resuelve en el
--      frontend (estado "busy", botón deshabilitado durante el guardado,
--      mismo patrón ya probado en la Entrega 6) — no requiere nada aquí.
--   2. Longitud máxima de contenido: 500 caracteres, exigido a nivel de
--      restricción de base de datos, no solo de frontend.
--   3. Edición transparente: published_at nunca se sobrescribe una vez
--      fijada — un trigger la protege a nivel de base de datos, no solo de
--      confianza en el código de la aplicación.
--   4. Pérdida de verificación: la verificación solo se exige al CREAR
--      (insert) una publicación nueva — nunca al editarla, ocultarla,
--      eliminarla ni verla. El contenido ya publicado permanece intacto y
--      visible aunque el negocio pierda la verificación después.
--   5. Preparación de permalink: el id (uuid, estable, nunca reutilizado)
--      ya es apto como identificador permanente — no requiere ningún campo
--      adicional en este bloque.

-- ---------------------------------------------------------------------------
-- 1. Núcleo genérico de Publicación.
-- ---------------------------------------------------------------------------
create table public.publications (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  subtype text not null check (subtype in ('publicacion')),
  status text not null default 'borrador' check (status in ('borrador', 'publicado', 'oculto')),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index publications_actor_idx on public.publications (actor_id);
create index publications_feed_idx on public.publications (status, published_at) where status = 'publicado';

alter table public.publications enable row level security;

-- published_at nunca se sobrescribe una vez fijada (ajuste 3 de producto) —
-- se fija automáticamente la primera vez que el estado pasa a "publicado" y
-- queda protegida de cualquier intento posterior de modificarla, incluso
-- por error de la aplicación.
create function public.protect_publication_published_at()
returns trigger
language plpgsql
as $$
begin
  if old.published_at is not null then
    new.published_at := old.published_at;
  elsif new.status = 'publicado' and new.published_at is null then
    new.published_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger protect_publication_published_at_before_update
  before update on public.publications
  for each row execute function public.protect_publication_published_at();

-- Mismo trigger de "primera publicación" aplica también al insertar ya
-- directamente en estado publicado (poco común pero válido).
create function public.set_publication_published_at_on_insert()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'publicado' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger set_publication_published_at_before_insert
  before insert on public.publications
  for each row execute function public.set_publication_published_at_on_insert();

-- ---------------------------------------------------------------------------
-- 2. ¿Puede este usuario crear una Publicación nueva en nombre de este
--    actor? Distinto de "editable": exige además verificación vigente o en
--    gracia para negocios/organizadores, o ser admin de plataforma para el
--    actor de sistema "Ahorita Editorial" (ningún actor de sistema tiene
--    propietario legal ni administrador operativo, ver 0023).
-- ---------------------------------------------------------------------------
create function public.actor_can_author_publication(check_actor_id uuid)
returns boolean
language plpgsql
stable
security definer set search_path = public
as $$
declare
  actor_type text;
begin
  select type into actor_type from public.actors where id = check_actor_id;

  if actor_type = 'sistema' then
    return public.is_admin();
  end if;

  if actor_type in ('negocio', 'organizador') then
    return public.actor_editable_by_current_user(check_actor_id)
      and public.actor_verification_badge(check_actor_id) in ('vigente', 'en_gracia');
  end if;

  return false;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Políticas de publications.
-- ---------------------------------------------------------------------------
create policy "Publicado es visible para cualquiera; el resto solo para quien administra o admin" on public.publications
  for select using (
    status = 'publicado'
    or public.actor_editable_by_current_user(actor_id)
    or public.is_admin()
  );

create policy "Solo quien puede autorar en nombre del actor crea publicaciones" on public.publications
  for insert with check (public.actor_can_author_publication(actor_id));

-- Editar/ocultar/eliminar NO exige verificación vigente (ajuste 4 de
-- producto) — solo edición del actor, para que el contenido ya publicado
-- siga siendo administrable aunque la verificación venza.
create policy "Quien administra el actor o un admin editan publicaciones" on public.publications
  for update using (public.actor_editable_by_current_user(actor_id) or public.is_admin());

create policy "Quien administra el actor o un admin eliminan publicaciones" on public.publications
  for delete using (public.actor_editable_by_current_user(actor_id) or public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Detalle propio del subtipo "publicacion". Límite de 500 caracteres
--    (ajuste 2 de producto) exigido en la base de datos, no solo en el
--    frontend. Categoría reutiliza la misma taxonomía de businesses.category
--    (channels) — nunca una clasificación nueva.
-- ---------------------------------------------------------------------------
create table public.publication_posts (
  publication_id uuid primary key references public.publications (id) on delete cascade,
  body text not null check (char_length(body) <= 500 and char_length(body) > 0),
  image_url text,
  category text,
  updated_at timestamptz not null default now()
);

alter table public.publication_posts enable row level security;

-- "Edición transparente" (ajuste 3 de producto): el detalle lleva su propio
-- updated_at, separado del ciclo de estado del núcleo. Como el detalle
-- siempre se crea ANTES de que la publicación pase a "publicado" (ver
-- lib/publications.js: createPublicationDraft siempre inserta en borrador,
-- publicar es un paso posterior explícito), el frontend puede mostrar
-- "Editado" comparando post.updated_at contra publications.published_at:
-- solo una edición real de contenido POSTERIOR a la primera publicación
-- adelanta este valor más allá de published_at.
create function public.touch_publication_post_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_publication_post_updated_at_before_update
  before update on public.publication_posts
  for each row execute function public.touch_publication_post_updated_at();

create policy "Mismo criterio de visibilidad que su publicación" on public.publication_posts
  for select using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id
        and (p.status = 'publicado' or public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );

create policy "Solo quien puede crear la publicación crea su detalle" on public.publication_posts
  for insert with check (
    exists (select 1 from public.publications p where p.id = publication_id and public.actor_can_author_publication(p.actor_id))
  );

create policy "Quien administra el actor o un admin editan el detalle" on public.publication_posts
  for update using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id and (public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );

create policy "Quien administra el actor o un admin eliminan el detalle" on public.publication_posts
  for delete using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id and (public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );
