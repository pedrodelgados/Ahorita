-- Fase 5B, Bloque 1: Eventos y Lugares migran a `interactions` como fuente
-- de verdad para "me gusta" y "guardado", cerrando la deuda explícitamente
-- dejada pendiente al cerrar el Bloque 4 de la Fase 1 (ver PROJECT.md,
-- sección "Fase 1 del ecosistema social — Bloque 4": esa migración solo
-- copió los datos, sin migrar quién los lee/escribe, y dejó como condición
-- explícita que un cambio real de fuente de verdad requeriría su propia
-- fase — esta es esa fase).
--
-- A diferencia de aquella migración (que partió de `interactions` vacía y
-- solo necesitó un backfill aditivo), `post_likes`/`saved_events`/
-- `saved_places` siguieron recibiendo escrituras reales todo este tiempo
-- porque el frontend nunca dejó de usarlas — la reconciliación debe ser
-- BIDIRECCIONAL: insertar en `interactions` lo que falta, y eliminar de
-- `interactions` lo que el usuario ya deshizo en la tabla legacy sin que
-- `interactions` se enterara (algo que no podía ocurrir en la migración
-- original, porque partía de una tabla vacía).
--
-- Comunidad (post_likes.target_type in ('status', 'question')) queda
-- completamente fuera de este bloque, por decisión explícita del Product
-- Owner — no se toca ni una fila de esos dos tipos, y `post_likes` sigue
-- siendo su fuente activa sin ningún cambio.

-- ---------------------------------------------------------------------------
-- 1) Reconciliación bidireccional: post_likes (event) <-> interactions
-- ---------------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id)
select a.id, 'me_gusta', 'event', pl.target_id
from public.post_likes pl
join public.actors a on a.profile_id = pl.user_id
where pl.target_type = 'event'
  and not exists (
    select 1 from public.interactions i
    where i.actor_id = a.id
      and i.type = 'me_gusta'
      and i.target_type = 'event'
      and i.target_id = pl.target_id
  );

delete from public.interactions i
using public.actors a
where i.actor_id = a.id
  and i.type = 'me_gusta'
  and i.target_type = 'event'
  and a.profile_id is not null
  and not exists (
    select 1 from public.post_likes pl
    where pl.user_id = a.profile_id
      and pl.target_type = 'event'
      and pl.target_id = i.target_id
  );

-- ---------------------------------------------------------------------------
-- 2) Reconciliación bidireccional: post_likes (place) <-> interactions
-- ---------------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id)
select a.id, 'me_gusta', 'place', pl.target_id
from public.post_likes pl
join public.actors a on a.profile_id = pl.user_id
where pl.target_type = 'place'
  and not exists (
    select 1 from public.interactions i
    where i.actor_id = a.id
      and i.type = 'me_gusta'
      and i.target_type = 'place'
      and i.target_id = pl.target_id
  );

delete from public.interactions i
using public.actors a
where i.actor_id = a.id
  and i.type = 'me_gusta'
  and i.target_type = 'place'
  and a.profile_id is not null
  and not exists (
    select 1 from public.post_likes pl
    where pl.user_id = a.profile_id
      and pl.target_type = 'place'
      and pl.target_id = i.target_id
  );

-- ---------------------------------------------------------------------------
-- 3) Reconciliación bidireccional: saved_events <-> interactions (guardado)
-- ---------------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id)
select a.id, 'guardado', 'event', se.event_id
from public.saved_events se
join public.actors a on a.profile_id = se.user_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = a.id
    and i.type = 'guardado'
    and i.target_type = 'event'
    and i.target_id = se.event_id
);

delete from public.interactions i
using public.actors a
where i.actor_id = a.id
  and i.type = 'guardado'
  and i.target_type = 'event'
  and a.profile_id is not null
  and not exists (
    select 1 from public.saved_events se
    where se.user_id = a.profile_id and se.event_id = i.target_id
  );

-- ---------------------------------------------------------------------------
-- 4) Reconciliación bidireccional: saved_places <-> interactions (guardado)
-- ---------------------------------------------------------------------------
insert into public.interactions (actor_id, type, target_type, target_id)
select a.id, 'guardado', 'place', sp.place_id
from public.saved_places sp
join public.actors a on a.profile_id = sp.user_id
where not exists (
  select 1 from public.interactions i
  where i.actor_id = a.id
    and i.type = 'guardado'
    and i.target_type = 'place'
    and i.target_id = sp.place_id
);

delete from public.interactions i
using public.actors a
where i.actor_id = a.id
  and i.type = 'guardado'
  and i.target_type = 'place'
  and a.profile_id is not null
  and not exists (
    select 1 from public.saved_places sp
    where sp.user_id = a.profile_id and sp.place_id = i.target_id
  );

-- ---------------------------------------------------------------------------
-- 5) events.likes_count pasa a mantenerse desde `interactions`, no desde
--    `post_likes` — mismo comportamiento observable para el usuario, fuente
--    distinta por debajo. El trigger viejo se deshabilita (no se elimina)
--    para permitir reversión sin pérdida de historial.
-- ---------------------------------------------------------------------------
-- `security definer`: a diferencia de `post_likes`, la política de `update`
-- de `events` solo permite escribir a administradores ("Admins editan
-- eventos"). El trigger viejo (`sync_event_likes_count`, sin `security
-- definer`) tenía exactamente esta misma limitación estructural — nunca se
-- había manifestado como defecto observable porque toda verificación previa
-- se hizo con el rol de servicio o con superusuario, que ignoran RLS.
-- Verificado aquí con un actor autenticado real, sin privilegios de
-- administrador: sin `security definer`, el `update` interno queda
-- bloqueado por RLS y `likes_count` no se mueve, un defecto silencioso que
-- este bloque corrige de una vez para la fuente nueva.
create function public.sync_event_likes_count_from_interactions()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' and new.type = 'me_gusta' and new.target_type = 'event' then
    update public.events set likes_count = likes_count + 1 where id = new.target_id;
  elsif TG_OP = 'DELETE' and old.type = 'me_gusta' and old.target_type = 'event' then
    update public.events set likes_count = greatest(0, likes_count - 1) where id = old.target_id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger interactions_sync_event_likes
  after insert or delete on public.interactions
  for each row execute function public.sync_event_likes_count_from_interactions();

alter table public.post_likes disable trigger post_likes_sync_events;

comment on trigger post_likes_sync_events on public.post_likes is
  'Deshabilitado a propósito desde la Fase 5B, Bloque 1: "me gusta" de Eventos ya no escribe aquí, la fuente de verdad pasó a interactions (ver sync_event_likes_count_from_interactions). No se elimina para conservar el historial del cambio y permitir reversión. Nunca debe rehabilitarse salvo una reversión explícita de este bloque.';

comment on function public.sync_event_likes_count() is
  'Superseded desde la Fase 5B, Bloque 1 por sync_event_likes_count_from_interactions(). Se conserva sin uso (su trigger post_likes_sync_events está deshabilitado) únicamente para permitir una reversión completa de ese bloque sin tener que reescribirla.';

-- ---------------------------------------------------------------------------
-- 6) post_likes deja de aceptar filas nuevas de 'event'/'place' — decisión
--    de arquitectura explícita del Product Owner: ninguna funcionalidad
--    nueva puede volver a escribir aquí para Eventos o Lugares. Comunidad
--    (status/question) sigue exactamente igual. Las filas históricas de
--    'event'/'place' no se tocan ni se eliminan (se conservan intactas para
--    permitir reversión) — por eso el nuevo check se agrega `not valid`: no
--    valida retroactivamente filas ya existentes, solo exige la nueva regla
--    para cualquier fila insertada o actualizada de ahora en adelante.
-- ---------------------------------------------------------------------------
alter table public.post_likes drop constraint post_likes_target_type_check;
alter table public.post_likes
  add constraint post_likes_target_type_check
  check (target_type in ('status', 'question'))
  not valid;

comment on table public.post_likes is
  'Parcialmente legacy desde la Fase 5B, Bloque 1: sigue siendo la fuente activa de "me gusta" para status/question (Comunidad) — el check constraint de target_type ya no admite filas nuevas de "event"/"place", esos dos tipos migraron a interactions. Las filas históricas de "event"/"place" se conservan intactas (para reversión), pero ya no se leen ni se escriben desde el frontend. Retiro definitivo condicionado: solo cuando Comunidad migre por completo a interactions, mediante su propia migración futura — hasta entonces esta tabla no debe eliminarse.';

comment on table public.saved_events is
  'Legacy de solo respaldo desde la Fase 5B, Bloque 1 (mismo tratamiento que follows desde la Fase 3, Entrega 6): el frontend ya no la usa, la fuente de verdad de "guardado" en Eventos es interactions. No se retira todavía — su eliminación física requiere su propia migración futura, tras un período de convivencia observado en producción.';

comment on table public.saved_places is
  'Legacy de solo respaldo desde la Fase 5B, Bloque 1 (mismo tratamiento que follows desde la Fase 3, Entrega 6): el frontend ya no la usa, la fuente de verdad de "guardado" en Lugares es interactions. No se retira todavía — su eliminación física requiere su propia migración futura, tras un período de convivencia observado en producción.';
