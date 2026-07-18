-- Fase 3 (ver MASTERPLAN.md), Bloque C, Entrega 6: consolidación del
-- seguimiento bajo `interactions` como única fuente de verdad futura, más
-- protección de autointeracción a nivel de base de datos.
--
-- Decisión aprobada explícitamente antes de esta migración (ver el análisis
-- de la Entrega 6 en PROJECT.md): `follows` (Fase 1, persona→persona,
-- `auth.users` directo) deja de recibir escritura desde el frontend a
-- partir de esta migración — `FollowContext`/`AuthorTag` migran a leer y
-- escribir exclusivamente `interactions` (`type='seguimiento'`,
-- `target_type='actor'`), el mismo modelo ya usado para seguir negocios
-- desde la Entrega 2. `follows` NO se elimina ni se modifica: queda como
-- estructura legacy de solo respaldo hasta un retiro controlado en una
-- fase posterior (migración separada, no esta). Esta migración es aditiva
-- y reversible: ninguna columna ni tabla existente se destruye.
--
-- Dos piezas:
--   1. Reconciliación puntual (una sola vez, en esta migración): cualquier
--      fila de `follows` que todavía no tenga su equivalente en
--      `interactions` (drift acumulado desde el backfill original del
--      Bloque 4 de la Fase 1, ya que `follows` siguió recibiendo escritura
--      real desde entonces) se copia ahora. Cualquier fila de
--      `interactions` persona→persona que ya NO tenga un `follows`
--      correspondiente (alguien dejó de seguir usando el mecanismo viejo
--      después de aquel backfill) se elimina, para que `interactions`
--      refleje fielmente el estado real de seguimiento en el momento exacto
--      de este corte — a partir de aquí, y nunca antes, `interactions` es la
--      fuente de verdad. Se limita estrictamente a pares persona→persona
--      (`actors.type = 'persona'` en ambos lados): el seguimiento de
--      negocios, que ya vive únicamente en `interactions` desde la Entrega
--      2, no se toca.
--   2. `public.reconcile_follows_to_interactions()`: expone de forma
--      reutilizable (solo un administrador de plataforma) ÚNICAMENTE la
--      mitad segura de la reconciliación — copiar hacia `interactions`
--      cualquier fila de `follows` que todavía no tenga su equivalente —
--      por si `follows` recibiera alguna escritura fuera de banda durante
--      la convivencia (por ejemplo, una corrección manual vía SQL Editor).
--      Deliberadamente NO repite la eliminación de "huérfanos": una vez que
--      el frontend deja de escribir en `follows` (esta misma migración),
--      cualquier seguimiento nuevo creado directamente en `interactions`
--      es legítimo y nunca tendrá fila equivalente en `follows` — borrarlo
--      por "no tener respaldo en follows" destruiría datos reales. Esa
--      eliminación de huérfanos es seguro hacerla UNA SOLA VEZ, en el
--      instante exacto de este corte (sección 1 de abajo), nunca después.
--
-- Estrategia de reversión: si `interactions` presentara un problema real
-- después de desplegar, el frontend puede revertirse a leer/escribir
-- `follows` sin pérdida de datos (la tabla nunca se tocó), aceptando que
-- cualquier seguimiento nuevo hecho vía `interactions` durante la ventana
-- en que `follows` no la reflejaba tendría que reconciliarse manualmente
-- en sentido inverso — motivo por el cual el retiro definitivo de `follows`
-- se deja para una fase posterior, nunca esta.

-- ---------------------------------------------------------------------------
-- 1. Reconciliación puntual: follows -> interactions (mismo criterio que el
--    backfill original del Bloque 4, re-ejecutado para capturar el drift).
-- ---------------------------------------------------------------------------
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

-- Interacciones persona->persona ya sin respaldo real en `follows` (se dejó
-- de seguir usando el mecanismo viejo después del backfill del Bloque 4,
-- cuando `interactions` todavía no era la fuente de verdad y nadie la
-- mantenía sincronizada). Acotado estrictamente a pares persona->persona
-- para no rozar ningún seguimiento de negocio.
delete from public.interactions i
using public.actors follower_actor, public.actors followed_actor
where i.type = 'seguimiento'
  and i.target_type = 'actor'
  and i.actor_id = follower_actor.id
  and i.target_id = followed_actor.id
  and follower_actor.type = 'persona'
  and followed_actor.type = 'persona'
  and not exists (
    select 1 from public.follows f
    where f.follower_id = follower_actor.profile_id
      and f.followed_id = followed_actor.profile_id
  );

-- ---------------------------------------------------------------------------
-- 2. Función reutilizable para futuras reconciliaciones manuales (solo
--    administrador de plataforma) durante la convivencia con `follows`.
--    Solo copia hacia adelante (follows -> interactions); nunca elimina.
--    Ver la nota de diseño arriba sobre por qué eliminar "huérfanos" no es
--    seguro repetirlo después de esta migración.
-- ---------------------------------------------------------------------------
create function public.reconcile_follows_to_interactions()
returns table (rows_inserted integer)
language plpgsql
security definer set search_path = public
as $$
declare
  inserted_count integer;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador de plataforma puede ejecutar esta reconciliación';
  end if;

  with inserted as (
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
    )
    returning 1
  )
  select count(*) into inserted_count from inserted;

  return query select inserted_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. Autointeracción: proteger a nivel de base de datos, no solo ocultando
--    el botón. Aplica únicamente a seguir/guardar un actor (nunca a
--    me_gusta/quiero_ir/ya_fui/compartir, que tienen su propio dominio con
--    `target_type` distinto de 'actor' o no representan esta ambigüedad).
--    Una sola condición cubre los tres casos pedidos:
--      - seguirte a ti mismo: target_id = actor_id (mismo actor persona).
--      - seguir tu propio negocio: actor_editable_by_current_user(target_id)
--        es verdadero para el propietario legal.
--      - guardar tu propio negocio como propietario o administrador
--        operativo activo: misma función, ya compone ambos casos
--        (Fase 3, Bloque A).
-- ---------------------------------------------------------------------------
create function public.prevent_self_interaction()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.type in ('seguimiento', 'guardado') and new.target_type = 'actor' then
    if new.target_id = new.actor_id then
      raise exception 'No puedes seguir ni guardar tu propio perfil.' using errcode = '23514';
    elsif public.actor_editable_by_current_user(new.target_id) then
      raise exception 'No puedes seguir ni guardar un negocio que administras.' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create trigger prevent_self_interaction_before_insert
  before insert on public.interactions
  for each row execute function public.prevent_self_interaction();
