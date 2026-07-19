-- Fase 4 (ver FASE4_CONTRATO_ARQUITECTONICO.md), Bloque 3: Promociones
-- alimentan el Feed. Reutiliza el núcleo `publications` (Bloque 2) con un
-- segundo subtipo, "promocion" — ampliación aditiva del `check` existente,
-- sin tocar `publication_posts` ni ninguna publicación regular ya creada.
--
-- Incluye también el ajuste de seguridad aprobado junto con este bloque
-- (hallazgo del análisis previo): la verificación vigente/en_gracia ahora
-- se exige no solo al CREAR una publicación, sino también al transicionar
-- de borrador/oculto hacia publicado — antes solo se exigía al crear, lo
-- que permitía a un negocio sin verificación publicar un borrador existente
-- o reactivar contenido oculto. Aplica por igual a "publicacion" y
-- "promocion" (regla general, no específica de este bloque).
--
-- Ajustes de producto incorporados antes de implementar (ver aprobación
-- del Bloque 3 en PROJECT.md):
--   1. Ventana de anticipación de 24 horas antes de starts_at ("Empieza
--      hoy"/"Empieza mañana"), nunca semanas antes.
--   2. Un solo criterio de orden del Feed (distancia a "ahora") — cada fase
--      de la promoción decide su propio sortAt (starts_at si está por
--      empezar, ends_at si está vigente o recién finalizada), sin ningún
--      algoritmo nuevo en mergeFeedSources.
--   3. Solo me_gusta/guardado/compartir — sin "quiero_ir" (queda para
--      Eventos), sin comentarios, sin check-in, sin canje QR.
--   4. Restricciones siempre visibles en el frontend — sin campo oculto a
--      nivel de datos que lo impida técnicamente, la regla vive en la UI.
--   5. `benefit_description` con longitud mínima (evita valores como "50%"
--      o "2x1" sueltos) — regla de producto, no un parser de intención.
--   6. "Publicado hace…" (published_at, ya existente) y "Válido hasta…"
--      (ends_at) se muestran siempre juntos, nunca uno reemplaza al otro.
--   7. Ventana de 3 horas después de ends_at/ended_early_at ("Finalizó
--      hace…") antes de desaparecer del Feed público.
--
-- `events` y `publication_posts` (subtipo "publicacion") no se tocan.

-- ---------------------------------------------------------------------------
-- 1. Ampliar el núcleo para aceptar el subtipo "promocion".
-- ---------------------------------------------------------------------------
alter table public.publications drop constraint publications_subtype_check;
alter table public.publications add constraint publications_subtype_check
  check (subtype in ('publicacion', 'promocion'));

-- ---------------------------------------------------------------------------
-- 2. Detalle propio del subtipo "promocion". `benefit_description` y
--    `redemption_condition` son obligatorios y siempre visibles en el
--    frontend (ajustes 4 y 5); ningún campo de precio es obligatorio, para
--    no forzar un tipo de beneficio sobre otro (2x1, entrada gratis, etc.
--    no necesitan precio anterior/promocional).
-- ---------------------------------------------------------------------------
create table public.promotion_details (
  publication_id uuid primary key references public.publications (id) on delete cascade,
  title text not null check (char_length(title) > 0),
  benefit_description text not null check (char_length(benefit_description) >= 10),
  redemption_condition text not null check (char_length(redemption_condition) > 0),
  restrictions text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  ended_early_at timestamptz,
  image_url text,
  previous_price numeric(10, 2),
  promo_price numeric(10, 2),
  discount_percentage numeric(5, 2),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

alter table public.promotion_details enable row level security;

create function public.touch_promotion_details_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger touch_promotion_details_updated_at_before_update
  before update on public.promotion_details
  for each row execute function public.touch_promotion_details_updated_at();

-- ended_early_at nunca se revierte una vez fijado (ajuste de producto ya
-- aprobado en el análisis: finalizar anticipadamente es una decisión
-- permanente) — mismo principio de inmutabilidad que published_at.
create function public.protect_promotion_ended_early_at()
returns trigger
language plpgsql
as $$
begin
  if old.ended_early_at is not null then
    new.ended_early_at := old.ended_early_at;
  end if;
  return new;
end;
$$;

create trigger protect_promotion_ended_early_at_before_update
  before update on public.promotion_details
  for each row execute function public.protect_promotion_ended_early_at();

-- ---------------------------------------------------------------------------
-- 3. ¿Puede este actor autorar una Promoción? A diferencia de Publicación
--    regular, un actor de sistema ("Ahorita Editorial") NUNCA puede — una
--    Promoción es, por definición, un beneficio comercial propio de un
--    negocio; el equipo editorial no tiene nada que ofrecer como descuento.
-- ---------------------------------------------------------------------------
create function public.actor_can_author_promotion(check_actor_id uuid)
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
    return false;
  end if;
  return public.actor_can_author_publication(check_actor_id);
end;
$$;

-- Enruta a la función de autoría correcta según el subtipo — usada tanto al
-- insertar como en la transición de estado (punto 5).
create function public.actor_can_author_publication_of_subtype(check_actor_id uuid, check_subtype text)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select case
    when check_subtype = 'promocion' then public.actor_can_author_promotion(check_actor_id)
    else public.actor_can_author_publication(check_actor_id)
  end;
$$;

-- ---------------------------------------------------------------------------
-- 4. Reemplazar la política de inserción de `publications` para que
--    enrute por subtipo (Publicación sigue exactamente igual; Promoción
--    excluye al Actor de sistema).
-- ---------------------------------------------------------------------------
drop policy "Solo quien puede autorar en nombre del actor crea publicaciones" on public.publications;
create policy "Solo quien puede autorar en nombre del actor crea publicaciones" on public.publications
  for insert with check (public.actor_can_author_publication_of_subtype(actor_id, subtype));

drop policy "Solo quien puede crear la publicación crea su detalle" on public.publication_posts;
create policy "Solo quien puede crear la publicación crea su detalle" on public.publication_posts
  for insert with check (
    exists (select 1 from public.publications p where p.id = publication_id and public.actor_can_author_publication(p.actor_id))
  );

create policy "Solo quien puede crear la promoción crea su detalle" on public.promotion_details
  for insert with check (
    exists (select 1 from public.publications p where p.id = publication_id and public.actor_can_author_promotion(p.actor_id))
  );

-- ---------------------------------------------------------------------------
-- 5. Ajuste de seguridad aprobado junto con este bloque: exigir
--    verificación también al transicionar hacia "publicado" desde
--    "borrador" u "oculto" — no solo al crear. Se implementa como trigger
--    (no es expresable en una sola política RLS porque necesita comparar
--    el estado anterior contra el nuevo, algo que USING/WITH CHECK no
--    permiten combinar en una sola expresión).
-- ---------------------------------------------------------------------------
create function public.enforce_publication_publish_authorization()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('borrador', 'oculto') and new.status = 'publicado' then
    if not public.actor_can_author_publication_of_subtype(new.actor_id, new.subtype) then
      raise exception 'No tienes verificación vigente para publicar o reactivar este contenido'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_publication_publish_authorization_before_update
  before update on public.publications
  for each row execute function public.enforce_publication_publish_authorization();

-- Se mantienen las políticas de update/delete de `publications` y
-- `publication_posts` del Bloque 2 sin cambios — editar/ocultar/eliminar
-- contenido ya existente sigue sin exigir verificación (ajuste 4 del
-- Bloque 2), la excepción nueva es únicamente la transición hacia
-- "publicado", cubierta por el trigger anterior.

create policy "Quien administra el actor o un admin editan el detalle de promoción" on public.promotion_details
  for update using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id and (public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );

create policy "Quien administra el actor o un admin eliminan el detalle de promoción" on public.promotion_details
  for delete using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id and (public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );

create policy "Mismo criterio de visibilidad que su publicación (promoción)" on public.promotion_details
  for select using (
    exists (
      select 1 from public.publications p
      where p.id = publication_id
        and (p.status = 'publicado' or public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Estado calculado de una Promoción — única fuente de verdad, nunca un
--    campo almacenado. Ventanas de producto ya aprobadas: 24 horas de
--    anticipación antes de starts_at, 3 horas de gracia después de
--    ends_at/ended_early_at.
-- ---------------------------------------------------------------------------
create function public.promotion_status(p_publication_id uuid, p_at timestamptz default now())
returns text
language plpgsql
stable
security definer set search_path = public
as $$
declare
  pub_status text;
  det record;
  effective_end timestamptz;
begin
  select status into pub_status from public.publications where id = p_publication_id;
  if pub_status is null then
    return null;
  end if;
  if pub_status in ('borrador', 'oculto') then
    return pub_status;
  end if;

  select starts_at, ends_at, ended_early_at into det
  from public.promotion_details where publication_id = p_publication_id;

  effective_end := coalesce(det.ended_early_at, det.ends_at);

  if p_at >= effective_end then
    if p_at < effective_end + interval '3 hours' then
      return 'finalizada_reciente';
    end if;
    return 'finalizada';
  end if;

  if p_at >= det.starts_at then
    return 'vigente';
  end if;

  if p_at >= det.starts_at - interval '24 hours' then
    return 'programada_proxima';
  end if;

  return 'programada_lejana';
end;
$$;

-- ---------------------------------------------------------------------------
-- 7. Función pública estrecha para el Feed — evita que el frontend tenga
--    que traer todas las promociones y calcular su estado fila por fila
--    (N llamadas), mismo patrón que search_actors()/business_open_status().
--    Solo devuelve promociones publicadas cuyo estado calculado ya
--    corresponde mostrarse en el Feed público.
-- ---------------------------------------------------------------------------
create function public.list_feed_promotions()
returns table (
  publication_id uuid,
  actor_id uuid,
  computed_status text,
  title text,
  benefit_description text,
  redemption_condition text,
  restrictions text,
  starts_at timestamptz,
  ends_at timestamptz,
  ended_early_at timestamptz,
  image_url text,
  published_at timestamptz,
  display_name text,
  actor_type text
)
language sql
stable
security definer set search_path = public
as $$
  select
    p.id,
    p.actor_id,
    public.promotion_status(p.id),
    pd.title,
    pd.benefit_description,
    pd.redemption_condition,
    pd.restrictions,
    pd.starts_at,
    pd.ends_at,
    pd.ended_early_at,
    pd.image_url,
    p.published_at,
    a.display_name,
    a.type
  from public.publications p
  join public.promotion_details pd on pd.publication_id = p.id
  join public.actors a on a.id = p.actor_id
  where p.subtype = 'promocion'
    and p.status = 'publicado'
    and public.promotion_status(p.id) in ('programada_proxima', 'vigente', 'finalizada_reciente');
$$;
