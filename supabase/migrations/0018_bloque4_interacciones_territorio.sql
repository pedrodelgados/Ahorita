-- Fase 1 del ecosistema social (ver MASTERPLAN.md), Bloque 4: interacciones
-- y territorio. Puebla `interactions` (creada vacía en el Bloque 1, 0015)
-- con una copia fiel de post_likes/saved_places/saved_events/follows, y
-- agrega `places.zone_id` como equivalente estructurado de `places.area`
-- (texto libre).
--
-- Decisiones aprobadas explícitamente antes de escribir esta migración (ver
-- PROJECT.md para el análisis previo completo, presentado y aprobado antes
-- de implementar):
--   1. Separación ADITIVA, con convivencia temporal: ninguna tabla ni
--      columna de origen (post_likes, saved_places, saved_events, follows,
--      places.area) se modifica ni se elimina en este bloque. El frontend
--      sigue leyendo y escribiendo exclusivamente las tablas de siempre —
--      no se toca ni una línea de `src/`.
--   2. FOTOGRAFÍA puntual, sin sincronización en vivo: igual criterio que
--      actors.display_name (Bloque 2) y event_details (Bloque 3). No se
--      agrega ningún trigger que mantenga `interactions`/`places.zone_id`
--      sincronizadas ante nuevos likes/guardados/follows o ediciones de
--      zona — nada las lee todavía.
--   3. Privacidad de "guardado": se reemplaza la política de lectura
--      pública de `interactions` (creada en el Bloque 1 pensando en
--      me_gusta/quiero_ir/ya_fui/seguimiento/compartir, que sí son
--      públicos) por una que excluye explícitamente el tipo 'guardado' de
--      la lectura pública. Un guardado solo es visible para el actor dueño
--      o para un administrador — igual privacidad que ya tienen hoy
--      saved_places/saved_events. El acceso de administrador está
--      técnicamente disponible para necesidades administrativas, legales,
--      de soporte o de seguridad, pero su USO debe justificarse y
--      documentarse operativamente caso por caso — esta migración no
--      agrega una tabla de auditoría de accesos (sería una funcionalidad
--      nueva, fuera del alcance "sin agregar funcionalidades para el
--      usuario" de este bloque); si se decide que ese registro de acceso
--      es necesario, es una decisión de producto a proponer y aprobar
--      aparte.
--   4. places.zone_id se puebla ÚNICAMENTE cuando `places.area` coincide
--      exactamente (case-sensitive) con el nombre de una zona ya existente
--      en `zones` para la ciudad "Cuenca". Ningún valor ambiguo, vacío o
--      sin coincidencia se fuerza ni se corrige silenciosamente — queda en
--      NULL, y se reporta en la verificación de este bloque (ver
--      PROJECT.md) para decidir aparte si el dato de origen debe
--      corregirse o si corresponde crear una zona legítima nueva.
--
-- No se toca ninguna política RLS de post_likes/saved_places/saved_events/
-- follows/places (las que ya existen siguen rigiendo exactamente igual
-- mientras el frontend siga usando esas tablas), ni ningún otro bloque.

-- -----------------------------------------------------------------------
-- 1. Privacidad de "guardado" en `interactions`.
-- -----------------------------------------------------------------------
drop policy "Interacciones son públicas" on public.interactions;

create policy "Interacciones públicas excepto guardados" on public.interactions
  for select using (
    type <> 'guardado'
    or exists (
      select 1 from public.actors a
      where a.id = actor_id and a.profile_id = auth.uid()
    )
    or public.is_admin()
  );

-- -----------------------------------------------------------------------
-- 2. Backfill: post_likes -> interactions (type = 'me_gusta').
-- -----------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id, created_at)
select a.id, 'me_gusta', pl.target_type, pl.target_id, pl.created_at
from public.post_likes pl
join public.actors a on a.profile_id = pl.user_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = a.id
    and i.type = 'me_gusta'
    and i.target_type = pl.target_type
    and i.target_id = pl.target_id
);

-- -----------------------------------------------------------------------
-- 3. Backfill: saved_places -> interactions (type = 'guardado', 'place').
-- -----------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id, created_at)
select a.id, 'guardado', 'place', sp.place_id, sp.created_at
from public.saved_places sp
join public.actors a on a.profile_id = sp.user_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = a.id
    and i.type = 'guardado'
    and i.target_type = 'place'
    and i.target_id = sp.place_id
);

-- -----------------------------------------------------------------------
-- 4. Backfill: saved_events -> interactions (type = 'guardado', 'event').
-- -----------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id, created_at)
select a.id, 'guardado', 'event', se.event_id, se.created_at
from public.saved_events se
join public.actors a on a.profile_id = se.user_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = a.id
    and i.type = 'guardado'
    and i.target_type = 'event'
    and i.target_id = se.event_id
);

-- -----------------------------------------------------------------------
-- 5. Backfill: follows -> interactions (type = 'seguimiento', 'actor').
--    El destino es el Actor del perfil seguido, no el profile_id
--    directamente — coherente con que Actor ya es la entidad que se sigue
--    en la arquitectura (persona, negocio, y en el futuro organizador).
-- -----------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id, created_at)
select follower_actor.id, 'seguimiento', 'actor', followed_actor.id, f.created_at
from public.follows f
join public.actors follower_actor on follower_actor.profile_id = f.follower_id
join public.actors followed_actor on followed_actor.profile_id = f.followed_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = follower_actor.id
    and i.type = 'seguimiento'
    and i.target_type = 'actor'
    and i.target_id = followed_actor.id
);

-- -----------------------------------------------------------------------
-- 6. places.zone_id: equivalente estructurado de places.area.
-- -----------------------------------------------------------------------
alter table public.places add column zone_id uuid references public.zones (id) on delete set null;

update public.places p
set zone_id = z.id
from public.zones z
join public.cities c on c.id = z.city_id
where c.name = 'Cuenca'
  and z.name = p.area
  and p.zone_id is null;
