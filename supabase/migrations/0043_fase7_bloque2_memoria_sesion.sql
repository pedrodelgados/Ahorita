-- Fase 7 (ver MASTERPLAN.md), Bloque 2: Memoria de Sesión.
--
-- Autoridad de diseño: FASE7_FILOSOFIA_GUIA_IA.md, FASE7_CONTRATO_ARQUITECTONICO.md,
-- y el análisis conceptual + diseño técnico del Bloque 2 (aprobados antes de esta
-- migración, con cuatro ajustes explícitos incorporados: una única conversación
-- activa por persona, nunca por contexto/superficie; El Razonador nunca conoce la
-- representación concreta de la memoria, solo un "contexto conversacional vigente";
-- recuperación acotada estrictamente a la única conversación que sigue vigente,
-- nunca a una ya cerrada; capacidad finita registrada como principio permanente,
-- sin estrategia de reducción todavía).
--
-- Reglas de pureza no negociables de este bloque:
--   1. La Memoria de Sesión es pasiva: estas tablas y funciones retienen y
--      recortan mecánicamente (retracciones, expiración) -- nunca interpretan
--      qué es una corrección, qué caducó, ni qué significa nada de lo dicho.
--      Esa interpretación sigue siendo, sin excepción, responsabilidad de El
--      Razonador (decision.ts).
--   2. Persistencia server-side únicamente para personas autenticadas. Un
--      invitado (auth.uid() nulo) nunca tiene fila en ninguna de estas dos
--      tablas -- su "memoria" sigue siendo, como hoy, únicamente el estado
--      local de su propio cliente, sin ningún cambio de este bloque.
--   3. Una única conversación activa por persona (owner_id primary key en
--      ai_active_conversations, nunca una fila por lugar/superficie/contexto).
--   4. Ninguna política de RLS permite leer u escribir estas tablas
--      directamente -- ni siquiera a su propia dueña -- exactamente el mismo
--      principio ya usado en affinity_contributions (Fase 6, Bloque 1): el
--      único acceso posible es a través de las funciones
--      `security definer` de abajo, cada una derivando la identidad
--      exclusivamente de auth.uid(), nunca de un parámetro que el cliente
--      pueda manipular.
--   5. Cierre sin retención implícita: una conversación que expira purga sus
--      turnos de inmediato (nunca queda contenido conversacional colgando
--      "por si acaso" un futuro bloque lo quisiera) -- solo se conserva el
--      metadato mínimo (que existió y por qué se cerró) para poder producir
--      la señal honesta de "tu conversación anterior expiró", nunca más que
--      eso. El historial autorizado (Bloque 5, todavía inexistente) tendrá
--      que pedir su propio consentimiento explícito de conservación antes
--      del cierre -- este bloque no construye esa vía.

-- -----------------------------------------------------------------------
-- 0. Ventana de expiración: un único lugar canónico, ajustable sin tocar
--    ninguna lógica. Calibración inicial aprobada: 2 horas de inactividad --
--    nunca un principio permanente, una calibración a revisar con evidencia
--    real de uso.
-- -----------------------------------------------------------------------
create function public.ai_memory_expiration_window()
returns interval
language sql
immutable
as $$
  select interval '2 hours';
$$;

comment on function public.ai_memory_expiration_window() is
  'Fase 7, Bloque 2: calibración inicial (2 horas de inactividad) de cuándo la Memoria de Sesión considera terminada una conversación. Ajustable por evidencia real de uso -- nunca un principio permanente ni un valor que deba repetirse en más de un lugar.';

-- -----------------------------------------------------------------------
-- 1. ai_active_conversations: fila única y mutable por persona (nunca un
--    ledger por conversación) -- misma decisión ya usada para
--    editorial_selections (Fase 6, Bloque 3): una decisión de estado
--    actual, no un historial de ciclos pasados.
-- -----------------------------------------------------------------------
create table public.ai_active_conversations (
  owner_id uuid primary key references public.profiles (id) on delete cascade,
  status text not null default 'activa' check (status in ('activa', 'cerrada')),
  started_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  closed_at timestamptz,
  closed_reason text check (closed_reason in ('expirada', 'cerrada_por_persona')),
  check ((status = 'cerrada') = (closed_at is not null)),
  check ((closed_at is not null) = (closed_reason is not null))
);

comment on table public.ai_active_conversations is
  'Fase 7, Bloque 2: la única conversación activa (o recién cerrada, en espera de que la próxima escritura la reemplace) de cada persona autenticada con la Guía IA. Nunca contiene el contenido de la conversación -- solo su estado. Sin política de RLS alguna: el único acceso es a través de las funciones de abajo.';

comment on column public.ai_active_conversations.closed_reason is
  'expirada: cerrada por inactividad (ver ai_memory_expiration_window). cerrada_por_persona: reservado para un cierre explícito distinto del borrado total (ai_delete_active_conversation borra la fila por completo, nunca dEja este estado).';

alter table public.ai_active_conversations enable row level security;

-- -----------------------------------------------------------------------
-- 2. ai_conversation_turns: registro append-only de los turnos de la
--    conversación activa de cada persona. Nunca se reescribe ni se borra un
--    turno individual por una corrección normal -- una corrección es,
--    simplemente, un turno nuevo que El Razonador prioriza al leer el hilo
--    completo. Una retracción explícita ("olvida lo anterior", "no dije
--    eso") marca retracted_at sin borrar el turno -- preserva trazabilidad
--    (requisito explícito del Product Owner) sin volver a exponerlo como
--    utilizable (ver ai_get_conversation_turns).
-- -----------------------------------------------------------------------
create table public.ai_conversation_turns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  turn_role text not null check (turn_role in ('person', 'guide')),
  content text not null check (char_length(content) > 0),
  retracted_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.ai_conversation_turns is
  'Fase 7, Bloque 2: turnos literales (representación interna inicial, nunca parte del contrato de El Razonador -- ver decision.ts) de la conversación activa de cada persona. Append-only: una retracción marca retracted_at, nunca borra ni reescribe la fila. Se purga por completo (delete real) al cerrarse la conversación por expiración, o al borrarla explícitamente. Sin política de RLS alguna, mismo principio que ai_active_conversations.';

create index ai_conversation_turns_owner_idx on public.ai_conversation_turns (owner_id, created_at);

alter table public.ai_conversation_turns enable row level security;

-- -----------------------------------------------------------------------
-- 3. Lectura de estado: nunca muta por sí sola en la ruta estable, pero
--    ai_get_active_conversation() sí aplica la expiración al detectarla (ver
--    su comentario) -- higiene de minimización sin necesitar un proceso en
--    segundo plano.
-- -----------------------------------------------------------------------
create function public.ai_get_active_conversation()
returns table (
  conversation_status text,
  started_at timestamptz,
  last_activity_at timestamptz
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_row public.ai_active_conversations;
begin
  -- Un invitado (sin sesión) nunca tiene conversación server-side -- se
  -- responde honestamente "ninguna", nunca un error.
  if v_owner is null then
    return query select 'ninguna'::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  select * into v_row from public.ai_active_conversations where owner_id = v_owner;

  if v_row.owner_id is null then
    return query select 'ninguna'::text, null::timestamptz, null::timestamptz;
    return;
  end if;

  -- Higiene de minimización: si ya pasó la ventana de inactividad y todavía
  -- nadie lo detectó, se purga aquí mismo -- nunca queda contenido
  -- conversacional esperando una escritura futura que podría no llegar.
  if v_row.status = 'activa' and v_row.last_activity_at < now() - public.ai_memory_expiration_window() then
    delete from public.ai_conversation_turns where owner_id = v_owner;
    update public.ai_active_conversations
      set status = 'cerrada', closed_at = now(), closed_reason = 'expirada'
      where owner_id = v_owner
      returning * into v_row;
  end if;

  if v_row.status = 'activa' then
    return query select 'activa'::text, v_row.started_at, v_row.last_activity_at;
  else
    return query select 'expirada'::text, v_row.started_at, v_row.last_activity_at;
  end if;
end;
$$;

comment on function public.ai_get_active_conversation() is
  'Fase 7, Bloque 2: único punto de lectura de estado (nunca contenido) de la conversación de auth.uid(). Devuelve "activa", "expirada" (existía y ya se cerró por inactividad -- purgando sus turnos en el mismo momento si nadie lo había detectado antes) o "ninguna" (nunca existió, o ya fue borrada/reemplazada). Nunca recupera automáticamente una conversación ya cerrada -- "expirada" es una señal honesta de que ya no continúa, nunca una invitación a leer su contenido.';

-- -----------------------------------------------------------------------
-- 4. Lectura de turnos: solo si la conversación sigue efectivamente activa
--    -- vuelve a comprobar la expiración de forma independiente, para no
--    depender de que el llamador haya invocado antes ai_get_active_conversation().
--    Nunca incluye un turno retractado.
-- -----------------------------------------------------------------------
create function public.ai_get_conversation_turns()
returns table (
  turn_role text,
  content text,
  occurred_at timestamptz
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_row public.ai_active_conversations;
begin
  if v_owner is null then
    return;
  end if;

  select * into v_row from public.ai_active_conversations where owner_id = v_owner;
  if v_row.owner_id is null or v_row.status <> 'activa' then
    return;
  end if;
  if v_row.last_activity_at < now() - public.ai_memory_expiration_window() then
    -- Ya expiró pero todavía no se procesó por una lectura de estado --
    -- nunca se expone como si siguiera vigente.
    return;
  end if;

  return query
    select t.turn_role, t.content, t.created_at
    from public.ai_conversation_turns t
    where t.owner_id = v_owner and t.retracted_at is null
    order by t.created_at asc;
end;
$$;

comment on function public.ai_get_conversation_turns() is
  'Fase 7, Bloque 2: turnos utilizables (nunca los retractados) de la única conversación activa de auth.uid(), en orden. Devuelve vacío si no hay conversación, si ya expiró, o sin sesión -- nunca el contenido de una conversación ya cerrada.';

-- -----------------------------------------------------------------------
-- 5. Escritura de turnos: único camino de escritura de contenido. Si la
--    conversación existente ya expiró (o fue cerrada), empieza una nueva de
--    forma honesta -- purga lo anterior, nunca lo mezcla con lo nuevo.
--
--    ai_ensure_fresh_conversation() es un paso interno compartido (nunca se
--    expone con permisos propios más allá de los que ya tienen las
--    funciones que lo usan) -- evita duplicar la misma lógica de
--    reinicio-por-expiración en ai_append_turn() y ai_append_exchange().
-- -----------------------------------------------------------------------
create function public.ai_ensure_fresh_conversation(p_owner uuid)
returns void
language plpgsql
as $$
declare
  v_row public.ai_active_conversations;
begin
  select * into v_row from public.ai_active_conversations where owner_id = p_owner;

  if v_row.owner_id is null then
    insert into public.ai_active_conversations (owner_id) values (p_owner);
  elsif v_row.status = 'cerrada' or v_row.last_activity_at < now() - public.ai_memory_expiration_window() then
    -- Conversación cerrada o recién expirada: empieza de cero, nunca
    -- recupera lo anterior -- exactamente lo que exige el ajuste 3 del
    -- diseño técnico (nunca se recupera automáticamente lo ya cerrado).
    delete from public.ai_conversation_turns where owner_id = p_owner;
    update public.ai_active_conversations
      set status = 'activa', started_at = now(), last_activity_at = now(), closed_at = null, closed_reason = null
      where owner_id = p_owner;
  end if;
end;
$$;

create function public.ai_append_turn(p_role text, p_content text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para registrar un turno de la Memoria de Sesión.';
  end if;
  if p_role not in ('person', 'guide') then
    raise exception 'Rol de turno inválido: %', p_role;
  end if;
  if p_content is null or char_length(p_content) = 0 then
    raise exception 'El contenido del turno no puede estar vacío.';
  end if;

  perform public.ai_ensure_fresh_conversation(v_owner);

  insert into public.ai_conversation_turns (owner_id, turn_role, content) values (v_owner, p_role, p_content);

  update public.ai_active_conversations set last_activity_at = now() where owner_id = v_owner;
end;
$$;

comment on function public.ai_append_turn(text, text) is
  'Fase 7, Bloque 2: escritura de un único turno -- pensado para reconstruir, en orden, una conversación de invitado ya aceptada explícitamente (ver ai_append_exchange para el camino normal del pipeline, que inserta el intercambio persona+guía de forma atómica). Siempre deriva el dueño de auth.uid() -- nunca de un parámetro.';

-- -----------------------------------------------------------------------
-- 5b. Escritura atómica del intercambio completo de un turno (lo que dijo
--     la persona + lo que respondió la Guía IA) -- evita el riesgo de un
--     turno a medias (persona registrada, respuesta no) si algo falla entre
--     ambas inserciones: al ser una sola función, Postgres las trata como
--     una única transacción implícita.
-- -----------------------------------------------------------------------
create function public.ai_append_exchange(
  p_person_content text,
  p_guide_content text,
  p_retraction_scope text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para registrar un turno de la Memoria de Sesión.';
  end if;
  if p_person_content is null or char_length(p_person_content) = 0 then
    raise exception 'El contenido del turno de la persona no puede estar vacío.';
  end if;
  if p_guide_content is null or char_length(p_guide_content) = 0 then
    raise exception 'El contenido del turno de la Guía IA no puede estar vacío.';
  end if;
  if p_retraction_scope is not null and p_retraction_scope not in ('ultimo_turno_persona', 'todo_lo_anterior') then
    raise exception 'Alcance de retractación inválido: %', p_retraction_scope;
  end if;

  perform public.ai_ensure_fresh_conversation(v_owner);

  -- La retractación (si El Razonador la reconoció en este mismo turno, p.
  -- ej. "olvida lo anterior") se aplica ANTES de insertar el nuevo
  -- intercambio, para que nunca retracte, por error, el propio turno que
  -- se está registrando ahora.
  if p_retraction_scope = 'todo_lo_anterior' then
    update public.ai_conversation_turns
      set retracted_at = now()
      where owner_id = v_owner and retracted_at is null;
  elsif p_retraction_scope = 'ultimo_turno_persona' then
    update public.ai_conversation_turns
      set retracted_at = now()
      where id = (
        select id from public.ai_conversation_turns
        where owner_id = v_owner and turn_role = 'person' and retracted_at is null
        order by created_at desc
        limit 1
      );
  end if;

  insert into public.ai_conversation_turns (owner_id, turn_role, content) values (v_owner, 'person', p_person_content);
  insert into public.ai_conversation_turns (owner_id, turn_role, content) values (v_owner, 'guide', p_guide_content);

  update public.ai_active_conversations set last_activity_at = now() where owner_id = v_owner;
end;
$$;

comment on function public.ai_append_exchange(text, text, text) is
  'Fase 7, Bloque 2: camino normal de escritura del pipeline -- registra, de forma atómica, el turno de la persona y la respuesta de la Guía IA, aplicando primero (en la misma transacción implícita) cualquier retractación que El Razonador haya reconocido en este turno. Si algo falla a mitad de camino, Postgres revierte la función completa -- nunca queda un turno a medias ni una retractación aplicada sin su intercambio correspondiente.';

-- -----------------------------------------------------------------------
-- 6. Borrado explícito: la única vía para que la propia persona borre su
--    conversación activa por completo -- a diferencia de la expiración, no
--    deja ninguna fila de estado detrás.
-- -----------------------------------------------------------------------
create function public.ai_delete_active_conversation()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para borrar una conversación.';
  end if;

  delete from public.ai_conversation_turns where owner_id = v_owner;
  delete from public.ai_active_conversations where owner_id = v_owner;
end;
$$;

comment on function public.ai_delete_active_conversation() is
  'Fase 7, Bloque 2: borrado explícito y completo (turnos + fila de estado) de la conversación activa de auth.uid(). A diferencia de la expiración, no deja ningún metadato de estado detrás.';
