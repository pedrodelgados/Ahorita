-- Fase 5B, Bloque 3: comentarios generalizados para Evento y Publicación
-- regular (Promoción queda excluida, decisión ya cerrada en la Fase 4,
-- Bloque 3). Cierra el catálogo de `interactions.type` con su séptimo y
-- último tipo, 'comentario', preparado desde la Fase 1 (decisión 14) con
-- una referencia de respuesta anidada que esta fase todavía no expone.
--
-- Orden exigido y aprobado: (1) ampliar el catálogo de tipos, (2) sustituir
-- la restricción única general por un índice único parcial que excluye
-- 'comentario', (3) recién entonces migrar `event_comments`.

-- ---------------------------------------------------------------------------
-- 1) Catálogo de interactions.type: se agrega 'comentario', catálogo cerrado
-- ---------------------------------------------------------------------------
alter table public.interactions drop constraint interactions_type_check;
alter table public.interactions
  add constraint interactions_type_check
  check (type in ('me_gusta', 'quiero_ir', 'ya_fui', 'guardado', 'seguimiento', 'compartir', 'comentario'));

-- ---------------------------------------------------------------------------
-- 2) Unicidad: índice único parcial. Los seis tipos de "toggle" (me_gusta,
--    quiero_ir, ya_fui, guardado, seguimiento, compartir) conservan
--    exactamente la misma unicidad de siempre. 'comentario' queda
--    explícitamente excluido — un actor puede comentar el mismo Evento o
--    Publicación tantas veces como quiera, porque un comentario es
--    contenido repetible, no un estado de "activo/inactivo" como los otros
--    seis. La prevención de spam/doble clic no depende de esta restricción
--    — depende del estado `busy` en la interfaz y del límite de tasa real
--    en base de datos (ver más abajo), la herramienta correcta para
--    contenido repetible, a diferencia de la unicidad por identidad.
-- ---------------------------------------------------------------------------
alter table public.interactions drop constraint interactions_actor_id_type_target_type_target_id_key;
create unique index interactions_unique_toggle_idx
  on public.interactions (actor_id, type, target_type, target_id)
  where type <> 'comentario';

comment on index public.interactions_unique_toggle_idx is
  'Fase 5B, Bloque 3: reemplaza la restricción única general de la Fase 1. Cubre los seis tipos de interacción "toggle" (todo salvo comentario) con la misma semántica de siempre: una sola fila por actor+tipo+objetivo. "comentario" queda deliberadamente fuera — es contenido repetible, no un estado binario.';

-- ---------------------------------------------------------------------------
-- 3) Actor de sistema "Cuenta eliminada" — receptor de comentarios cuando
--    su autor real elimina su cuenta (ver process-account-deletions).
--    Nunca tiene profile_id ni business_id: no puede iniciar sesión, no
--    puede crear publicaciones, no puede comentar, no puede interactuar
--    como un usuario normal — las políticas ya existentes de "el dueño del
--    actor crea/edita/elimina" ya lo excluyen estructuralmente, porque
--    ninguna de ellas puede encontrar un profile_id que coincida con
--    auth.uid() para este actor. Solo puede recibir comentarios reasignados
--    por el propio proceso administrativo de eliminación de cuenta.
--
--    Varios comentarios asociados a este Actor pueden pertenecer a personas
--    distintas cuyas cuentas fueron eliminadas en momentos distintos —
--    nunca implica que fueron escritos por la misma persona real. Es,
--    deliberadamente, una identidad genérica compartida, no una identidad
--    individual anonimizada uno-a-uno.
-- ---------------------------------------------------------------------------
insert into public.actors (type, display_name) values ('sistema', 'Cuenta eliminada');

comment on table public.actors is
  'Identidad unificada persona/negocio/organizador/sistema. Actores de sistema conocidos: "Guía IA", "Ahorita Editorial", y desde la Fase 5B "Cuenta eliminada" (receptor de comentarios de cuentas eliminadas — ver interaction_comments). Ninguno de los tres puede iniciar sesión, publicar, comentar ni interactuar como un usuario normal.';

-- ---------------------------------------------------------------------------
-- 4) interaction_comments — detalle 1:1 de una interacción tipo 'comentario'
-- ---------------------------------------------------------------------------
create table public.interaction_comments (
  interaction_id uuid primary key references public.interactions (id) on delete cascade,
  body text,
  parent_comment_id uuid references public.interaction_comments (interaction_id) on delete set null,
  deleted_at timestamptz,
  check (
    (deleted_at is null and coalesce(char_length(btrim(body)), 0) between 1 and 500)
    or (deleted_at is not null and body is null)
  )
);

comment on table public.interaction_comments is
  'Detalle de una interacción tipo comentario (Fase 5B, Bloque 3). parent_comment_id existe desde ahora para sostener respuestas anidadas futuras (decisión 14, Fase 1) pero no se expone en la interfaz todavía. Solo dos estados válidos, nunca uno intermedio: activo (deleted_at null, body con texto real) o eliminado (deleted_at fijado, body en null — el texto se borra de verdad, no solo se oculta).';

alter table public.interaction_comments enable row level security;

create policy "Comentarios visibles si su contenido es visible" on public.interaction_comments
  for select using (
    exists (
      select 1 from public.interactions i
      where i.id = interaction_id
        and (
          (i.target_type = 'event' and exists (
            select 1 from public.events e
            where e.id = i.target_id and (e.status = 'publicado' or public.is_admin())
          ))
          or (i.target_type = 'publicacion' and exists (
            select 1 from public.publications p
            where p.id = i.target_id
              and (p.status = 'publicado' or public.actor_editable_by_current_user(p.actor_id) or public.is_admin())
          ))
        )
    )
  );

create policy "El dueño del actor crea su comentario" on public.interaction_comments
  for insert with check (
    exists (
      select 1 from public.interactions i
      join public.actors a on a.id = i.actor_id
      where i.id = interaction_id and i.type = 'comentario' and a.profile_id = auth.uid()
    )
  );

-- Sin un `with check` explícito, Postgres reutiliza la cláusula `using`
-- también para validar la fila NUEVA — pero `deleted_at is null` deja de
-- cumplirse justo después de la transición (el trigger de más abajo fuerza
-- `deleted_at := now()`), así que el propio dueño no podría completar su
-- propia eliminación. Defecto real encontrado y corregido durante esta
-- misma verificación, antes de cualquier commit: el `with check` valida
-- identidad/rol sobre la fila ya existente (`interaction_id` no cambia),
-- no el estado de `deleted_at` de la fila resultante.
create policy "El dueño del actor o un admin eliminan (soft-delete)" on public.interaction_comments
  for update using (
    deleted_at is null
    and (
      public.is_admin()
      or exists (
        select 1 from public.interactions i
        join public.actors a on a.id = i.actor_id
        where i.id = interaction_id and a.profile_id = auth.uid()
      )
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.interactions i
      join public.actors a on a.id = i.actor_id
      where i.id = interaction_id and a.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5) Reglas de negocio de 'comentario': exclusividad de Evento/Publicación,
--    visibilidad del contenido de destino, y límite de tasa (10s / 20 por
--    hora, global por actor). Mismo patrón `enforce_...` ya usado dos veces
--    en esta fase.
-- ---------------------------------------------------------------------------
create function public.enforce_comment_rules()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_event_status text;
  v_pub_status text;
  v_pub_actor uuid;
  v_pub_subtype text;
  v_recent_count integer;
  v_hourly_count integer;
begin
  if new.type <> 'comentario' then
    return new;
  end if;

  if new.target_type not in ('event', 'publicacion') then
    raise exception 'Los comentarios solo son válidos sobre Eventos y Publicaciones.' using errcode = '23514';
  end if;

  if new.target_type = 'event' then
    select status into v_event_status from public.events where id = new.target_id;
    if v_event_status is not null and v_event_status <> 'publicado' and not public.is_admin() then
      raise exception 'Este evento no admite comentarios públicos todavía.' using errcode = '23514';
    end if;
  end if;

  if new.target_type = 'publicacion' then
    select status, actor_id, subtype into v_pub_status, v_pub_actor, v_pub_subtype from public.publications where id = new.target_id;
    -- Las Promociones viven en la misma tabla que las Publicaciones
    -- (`target_type = 'publicacion'` no distingue subtipo) — sin este chequeo
    -- explícito de `subtype`, una Promoción publicada habría quedado
    -- comentable a nivel de base de datos, contradiciendo la decisión
    -- aprobada de excluirla. Defecto real encontrado y corregido durante
    -- esta misma verificación, antes de cualquier commit.
    if v_pub_subtype = 'promocion' then
      raise exception 'Las promociones no admiten comentarios.' using errcode = '23514';
    end if;
    if v_pub_status is not null
       and v_pub_status <> 'publicado'
       and not public.actor_editable_by_current_user(v_pub_actor)
       and not public.is_admin()
    then
      raise exception 'Esta publicación no admite comentarios públicos todavía.' using errcode = '23514';
    end if;
  end if;

  select count(*) into v_recent_count
  from public.interactions
  where actor_id = new.actor_id and type = 'comentario' and created_at > now() - interval '10 seconds';
  if v_recent_count > 0 then
    raise exception 'Espera unos segundos antes de comentar de nuevo.' using errcode = '23514';
  end if;

  select count(*) into v_hourly_count
  from public.interactions
  where actor_id = new.actor_id and type = 'comentario' and created_at > now() - interval '1 hour';
  if v_hourly_count >= 20 then
    raise exception 'Alcanzaste el límite de comentarios por hora. Intenta más tarde.' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger enforce_comment_rules_before_insert
  before insert on public.interactions
  for each row execute function public.enforce_comment_rules();

comment on function public.enforce_comment_rules() is
  'Fase 5B, Bloque 3: exclusividad de Evento/Publicación para "comentario", visibilidad del contenido de destino, y límite de tasa (10s entre comentarios, 20/hora, global por actor). El conteo de la ventana de una hora incluye comentarios ya eliminados (deleted_at no importa aquí) — el soft-delete nunca debe poder usarse para evadir el límite.';

-- ---------------------------------------------------------------------------
-- 6) Soft-delete protegido: la única transición de UPDATE permitida es
--    "activo -> eliminado". Nunca edición, nunca restauración, nunca
--    cambiar la estructura del hilo.
-- ---------------------------------------------------------------------------
create function public.protect_comment_soft_delete()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if old.deleted_at is not null then
    raise exception 'Un comentario eliminado no puede modificarse.' using errcode = '23514';
  end if;
  if new.parent_comment_id is distinct from old.parent_comment_id then
    raise exception 'No se puede modificar la estructura de un comentario.' using errcode = '23514';
  end if;
  new.deleted_at := now();
  new.body := null;
  return new;
end;
$$;

create trigger protect_comment_soft_delete_before_update
  before update on public.interaction_comments
  for each row execute function public.protect_comment_soft_delete();

comment on function public.protect_comment_soft_delete() is
  'Fase 5B, Bloque 3: fuerza la única transición válida de UPDATE (activo -> eliminado), sin importar qué valores intente enviar el cliente — nunca permite editar el cuerpo, restaurar un comentario eliminado, ni alterar parent_comment_id.';

-- ---------------------------------------------------------------------------
-- 7) Migración de event_comments -> interactions + interaction_comments.
--    Campo por campo, preservando created_at exacto. Comentarios ya
--    anonimizados (author_id is null) se asocian al Actor "Cuenta
--    eliminada" en vez de fallar por actor_id not null.
--
--    Deliberadamente ANTES de crear el trigger de conteo del punto 8 —
--    mismo orden que ya funcionó en el Bloque 1: `events.comments_count` ya
--    es exacto gracias al trigger viejo (`event_comments_sync_count`, todavía
--    activo en este punto), así que este backfill no debe volver a sumarlo.
--    Crear el trigger nuevo antes del backfill duplicaría el conteo — un
--    defecto real que se encontró y corrigió durante esta misma
--    verificación, antes de cualquier commit.
-- ---------------------------------------------------------------------------
-- Bucle procedural, no un `insert ... select` con `join` posterior: dos
-- comentarios distintos podrían coincidir en el mismo `event_id` y el mismo
-- `created_at` (incluso con precisión de microsegundos, no hay garantía
-- real de que nunca ocurra), y un `join` sobre esas columnas para
-- correlacionar cada fila recién insertada con su origen podría emparejar
-- mal. El bucle captura el `id` de cada `interactions` recién creada en el
-- mismo momento en que se crea, sin depender de que ninguna combinación de
-- columnas sea única.
do $$
declare
  ec record;
  v_actor_id uuid;
  v_interaction_id uuid;
  v_deleted_account_actor_id uuid;
begin
  select id into v_deleted_account_actor_id
  from public.actors where type = 'sistema' and display_name = 'Cuenta eliminada';

  for ec in select * from public.event_comments order by created_at loop
    select a.id into v_actor_id from public.actors a where a.profile_id = ec.author_id;
    if v_actor_id is null then
      v_actor_id := v_deleted_account_actor_id;
    end if;

    insert into public.interactions (actor_id, type, target_type, target_id, created_at)
    values (v_actor_id, 'comentario', 'event', ec.event_id, ec.created_at)
    returning id into v_interaction_id;

    insert into public.interaction_comments (interaction_id, body)
    values (v_interaction_id, ec.text);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 8) Contador público: solo comentarios visibles (deleted_at is null).
--    Vive en interaction_comments, no en interactions, porque deleted_at
--    solo existe en la tabla de detalle. Creado recién ahora, después del
--    backfill (ver nota del punto 7) para no duplicar el conteo histórico.
-- ---------------------------------------------------------------------------
create function public.sync_comments_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_target_type text;
  v_target_id uuid;
begin
  select i.target_type, i.target_id into v_target_type, v_target_id
  from public.interactions i
  where i.id = coalesce(new.interaction_id, old.interaction_id);

  if v_target_type = 'event' then
    if TG_OP = 'INSERT' then
      update public.events set comments_count = comments_count + 1 where id = v_target_id;
    elsif TG_OP = 'UPDATE' and old.deleted_at is null and new.deleted_at is not null then
      update public.events set comments_count = greatest(0, comments_count - 1) where id = v_target_id;
    end if;
  end if;
  -- Publicación: conteo en vivo (ver lib/interactions.js), sin columna
  -- desnormalizada — nada que mantener aquí para ese target_type.
  return new;
end;
$$;

create trigger interaction_comments_sync_count
  after insert or update on public.interaction_comments
  for each row execute function public.sync_comments_count();

-- ---------------------------------------------------------------------------
-- 9) event_comments deja de ser la fuente activa. Su trigger de conteo
--    viejo se deshabilita (no se elimina, permite reversión). La tabla
--    queda legacy de solo respaldo, mismo tratamiento que post_likes/
--    saved_events/saved_places desde el Bloque 1.
-- ---------------------------------------------------------------------------
alter table public.event_comments disable trigger event_comments_sync_count;

comment on trigger event_comments_sync_count on public.event_comments is
  'Deshabilitado a propósito desde la Fase 5B, Bloque 3: los comentarios de Eventos ya no escriben aquí, la fuente de verdad pasó a interaction_comments (ver sync_comments_count). No se elimina para permitir reversión.';

comment on table public.event_comments is
  'Legacy de solo respaldo desde la Fase 5B, Bloque 3 (mismo tratamiento que post_likes/saved_events/saved_places desde el Bloque 1): el frontend ya no la usa, la fuente de verdad de comentarios de Eventos es interaction_comments. No se retira todavía — su eliminación física requiere su propia migración futura, tras un período de convivencia observado en producción.';
