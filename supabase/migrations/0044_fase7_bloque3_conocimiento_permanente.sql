-- Fase 7 (ver MASTERPLAN.md), Bloque 3: Conocimiento Permanente de la Persona,
-- no-afinidad.
--
-- Autoridad de diseño: FASE7_FILOSOFIA_GUIA_IA.md, FASE7_CONTRATO_ARQUITECTONICO.md,
-- el análisis conceptual del Bloque 3 (17 secciones, ocho bifurcaciones cerradas
-- por el Product Owner) y el diseño técnico del Bloque 3 con sus cuatro
-- precisiones (estabilidad semántica del catálogo, candidato vs. hecho,
-- treatment_policy reservado, crecimiento mínimo) -- todo aprobado antes de
-- esta migración.
--
-- BIFURCACIÓN ARQUITECTÓNICA ENCONTRADA DURANTE LA AUDITORÍA PREVIA A ESTE
-- BLOQUE (no una ampliación de alcance): el diseño aprobado proponía reutilizar
-- `consent_records` (Fase 1) para la trazabilidad de este bloque. Auditando esa
-- tabla se encontró que ya tiene, desde la Fase 1, una política de RLS que
-- permite lectura administrativa directa (`auth.uid() = user_id or
-- public.is_admin()`) -- correcta y sin cambios para su propósito original
-- (solicitudes de exportación/eliminación), pero incompatible con el principio,
-- recién aprobado para este bloque específico, de "ausencia total de acceso
-- administrativo por defecto": incluso el nombre de una categoría (p. ej.
-- `necesidad_accesibilidad`, `dato_financiero_declarado`) ya es información
-- sensible por sí sola. Presentado al Product Owner antes de escribir esta
-- migración; decisión: NO reutilizar `consent_records` (que permanece sin
-- ningún cambio, ni un solo byte de esta migración la toca) -- se construye
-- aquí un registro de trazabilidad dedicado, sin ninguna vía de lectura
-- administrativa, de negocio, de organizador, ni siquiera de la propia persona
-- de forma directa (solo a través de una función que traduce a un resumen
-- comprensible). Ver `permanent_knowledge_audit_log` más abajo.
--
-- Reglas de pureza no negociables de este bloque:
--   1. El Razonador propone un CANDIDATO, nunca escribe un hecho. Ninguna
--      función de este archivo puede invocarse sin una identidad autenticada
--      real (auth.uid()) actuando explícitamente -- no existe ningún camino
--      de escritura automática.
--   2. Ninguna política de RLS en `permanent_knowledge_facts` ni en
--      `permanent_knowledge_audit_log` -- ni siquiera la propia dueña las lee
--      directamente. Todo acceso pasa por funciones `security definer` que
--      derivan la identidad exclusivamente de `auth.uid()`, nunca de un
--      parámetro que el cliente pueda enviar.
--   3. Borrado físico real: a diferencia de los turnos de la Memoria de Sesión
--      (Bloque 2, que marca `retracted_at` sin borrar), aquí la trazabilidad
--      vive exclusivamente en el registro de auditoría (sin el valor, nunca),
--      nunca en la propia fila del hecho -- borrar un hecho lo borra de
--      verdad.
--   4. Estabilidad semántica del catálogo: una categoría nunca cambia de
--      significado una vez creada. Un cambio conceptual futuro exige una
--      categoría nueva vía migración, nunca la reinterpretación de una
--      existente.
--   5. Crecimiento mínimo: este esquema no contiene ningún mecanismo que
--      relacione volumen de conversación con volumen de hechos guardados --
--      la única vía de escritura es un consentimiento explícito, dato por
--      dato, nunca un efecto acumulativo del uso.

-- -----------------------------------------------------------------------
-- 1. Catálogo de categorías: cerrado, extensible solo por migración
--    deliberada. Datos de referencia, no personales -- lectura pública, como
--    ya es el patrón para catálogos equivalentes (`channels`/`zones`).
-- -----------------------------------------------------------------------
create table public.permanent_knowledge_categories (
  category text primary key,
  sensitivity_level text not null check (sensitivity_level in ('baja', 'media', 'alta', 'reforzada')),
  requires_reinforced_confirmation boolean not null default false,
  reconfirmation_relevant boolean not null default false,
  -- Reservado (precisión 3 del diseño técnico): eje de tratamiento futuro,
  -- independiente del nivel de sensibilidad. Sin ninguna función de este
  -- bloque que lea o actúe sobre este campo todavía -- existe únicamente
  -- para evitar una migración estructural el día que sí se necesite.
  treatment_policy text not null default 'normal' check (treatment_policy in ('normal', 'protected', 'restricted')),
  purpose_template text not null,
  allowed_subtypes text[] not null default array['general'],
  created_at timestamptz not null default now(),
  -- Salvaguarda contra un futuro error de migración: una categoría 'alta' o
  -- 'reforzada' siempre debe exigir confirmación reforzada -- nunca al revés.
  check (sensitivity_level not in ('alta', 'reforzada') or requires_reinforced_confirmation)
);

comment on table public.permanent_knowledge_categories is
  'Fase 7, Bloque 3: catálogo cerrado de categorías de Conocimiento Permanente no-afinidad. Una categoría nunca cambia de significado una vez creada -- un cambio conceptual futuro exige una fila nueva vía migración, nunca reinterpretar una existente. Dato de referencia, no personal.';

comment on column public.permanent_knowledge_categories.treatment_policy is
  'Reservado para una política de tratamiento diferenciada futura (retención, exportación, acceso), independiente del nivel de sensibilidad. No implementado funcionalmente en este bloque -- ninguna función lo consulta todavía.';

alter table public.permanent_knowledge_categories enable row level security;

create policy "Catálogo de Conocimiento Permanente es público" on public.permanent_knowledge_categories
  for select using (true);

-- Seis categorías iniciales aprobadas -- ver PROJECT.md para el registro de
-- la aprobación. `restriccion_alimentaria` admite subtipos que distinguen
-- alergia/preferencia/religioso (relevante para el margen de error tolerable
-- al usar el dato, ver el análisis conceptual §7).
insert into public.permanent_knowledge_categories
  (category, sensitivity_level, requires_reinforced_confirmation, reconfirmation_relevant, purpose_template, allowed_subtypes)
values
  ('idioma_preferido', 'baja', false, false,
   'Se usa para conversar contigo en el idioma que prefieres.', array['general']),
  ('preferencia_estilo_respuesta', 'baja', false, false,
   'Se usa para ajustar el nivel de detalle o el tono de las respuestas.', array['general']),
  ('restriccion_alimentaria', 'media', false, true,
   'Se usa para no recomendarte lugares o platillos que no encajan con esta restricción.', array['alergia', 'preferencia', 'religioso', 'general']),
  ('necesidad_movilidad', 'media', false, true,
   'Se usa para tener en cuenta tu movilidad al recomendarte lugares o rutas.', array['general']),
  ('necesidad_accesibilidad', 'reforzada', true, true,
   'Se usa para tener en cuenta tu accesibilidad al recomendarte lugares o rutas.', array['general']),
  ('dato_financiero_declarado', 'reforzada', true, true,
   'Se usa para ajustar tus recomendaciones a una restricción de presupuesto que tú mismo declaraste.', array['general']);

-- -----------------------------------------------------------------------
-- 2. Hechos: fila única y mutable por (persona, categoría, subtipo) -- mismo
--    patrón ya usado en `editorial_selections` (Fase 6). `subtype` nunca es
--    NULL (usa 'general' como valor por defecto) para que la restricción de
--    unicidad se comporte de forma correcta y predecible -- NULL en una
--    columna de una unique constraint nunca se compara igual a sí mismo en
--    Postgres, el mismo tipo de trampa ya encontrada antes en este proyecto
--    con comparaciones contra NULL.
-- -----------------------------------------------------------------------
create table public.permanent_knowledge_facts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  category text not null references public.permanent_knowledge_categories (category),
  subtype text not null default 'general',
  value text not null check (char_length(value) > 0 and char_length(value) <= 200),
  consented_at timestamptz not null default now(),
  confirmed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (owner_id, category, subtype)
);

comment on table public.permanent_knowledge_facts is
  'Fase 7, Bloque 3: hechos vigentes de Conocimiento Permanente no-afinidad. Solo contiene lo que sigue vigente hoy -- nunca un historial de valores pasados (eso vive, sin el valor, en permanent_knowledge_audit_log). Sin ninguna política de RLS: el único acceso es a través de las funciones de abajo. value limitado a 200 caracteres a propósito -- nunca una narrativa ni una transcripción conversacional, siempre un hecho ya articulado en forma mínima.';

alter table public.permanent_knowledge_facts enable row level security;

-- -----------------------------------------------------------------------
-- 3. Registro de trazabilidad dedicado (bifurcación de esta auditoría) --
--    nunca el valor, ni siquiera la propia dueña lo lee directamente. Existe
--    exclusivamente para poder demostrar que el sistema respetó el
--    consentimiento y el borrado -- nunca para reconstruir información
--    personal. `consent_records` (Fase 1) permanece sin ningún cambio.
-- -----------------------------------------------------------------------
create table public.permanent_knowledge_audit_log (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  operation text not null check (
    operation in ('guardado', 'corregido', 'revocado', 'borrado_individual', 'borrado_total')
  ),
  category text,
  subtype text,
  occurred_at timestamptz not null default now(),
  check (
    (operation = 'borrado_total' and category is null and subtype is null)
    or (operation <> 'borrado_total' and category is not null)
  )
);

comment on table public.permanent_knowledge_audit_log is
  'Fase 7, Bloque 3: trazabilidad dedicada de operaciones sobre Conocimiento Permanente -- nunca el valor, ni siquiera la categoría es de lectura pública o administrativa. Distinto y separado de consent_records (Fase 1), que conserva su propósito y políticas heredadas sin ningún cambio. Sin ninguna política de RLS: ni un administrador, ni un negocio, ni un organizador, ni siquiera la propia dueña leen esta tabla directamente -- el único acceso de lectura es pk_get_audit_summary(), que devuelve un resumen ya traducido a lenguaje comprensible. La única escritura ocurre como parte interna de las funciones de la sección 4, nunca mediante una función de inserción expuesta por separado.';

alter table public.permanent_knowledge_audit_log enable row level security;

-- -----------------------------------------------------------------------
-- 4. Funciones. Todas `security definer`, todas derivan `owner_id`
--    exclusivamente de auth.uid() -- nunca de un parámetro. Pensadas para
--    ser llamadas desde la Edge Function con un cliente que actúa con el
--    propio token de quien llama (nunca con la clave de servicio) para
--    cualquier operación normal de la persona -- mismo patrón ya
--    establecido en memory.ts (Bloque 2).
-- -----------------------------------------------------------------------

-- 4.1 Lectura para El Razonador: solo hechos vigentes, con el contexto del
--     catálogo ya incluido (finalidad, si puede cambiar) para que El
--     Razonador pueda juzgar con criterio -- nunca el texto original de
--     ninguna conversación.
create function public.pk_get_facts()
returns table (
  category text,
  subtype text,
  value text,
  sensitivity_level text,
  reconfirmation_relevant boolean,
  purpose_template text,
  confirmed_at timestamptz
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
begin
  if v_owner is null then
    return;
  end if;

  return query
    select f.category, f.subtype, f.value, c.sensitivity_level, c.reconfirmation_relevant, c.purpose_template, f.confirmed_at
    from public.permanent_knowledge_facts f
    join public.permanent_knowledge_categories c on c.category = f.category
    where f.owner_id = v_owner
    order by f.category, f.subtype;
end;
$$;

comment on function public.pk_get_facts() is
  'Fase 7, Bloque 3: único punto de lectura de hechos vigentes para El Razonador. Sin sesión, devuelve vacío -- nunca un error.';

-- 4.2 Guardar o corregir: una sola función para ambos casos (misma fila,
--     misma clave), distinguibles solo por si ya existía una fila previa.
--     Rechaza una categoría inexistente (nunca "una tercera interpretación"
--     inventada) y exige la salvaguarda de confirmación reforzada cuando el
--     catálogo la requiere.
create function public.pk_save_fact(
  p_category text,
  p_subtype text default 'general',
  p_value text default null,
  p_reinforced_confirmation_shown boolean default false
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_category public.permanent_knowledge_categories;
  v_existing public.permanent_knowledge_facts;
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para guardar un dato de Conocimiento Permanente.';
  end if;
  if p_value is null or char_length(p_value) = 0 then
    raise exception 'El valor no puede estar vacío.';
  end if;

  select * into v_category from public.permanent_knowledge_categories where category = p_category;
  if v_category.category is null then
    raise exception 'Categoría de Conocimiento Permanente inexistente: %', p_category;
  end if;
  if not (p_subtype = any (v_category.allowed_subtypes)) then
    raise exception 'Subtipo no permitido para la categoría %: %', p_category, p_subtype;
  end if;
  if v_category.requires_reinforced_confirmation and not p_reinforced_confirmation_shown then
    raise exception 'Esta categoría exige confirmación reforzada explícita antes de guardarse.';
  end if;

  select * into v_existing
    from public.permanent_knowledge_facts
    where owner_id = v_owner and category = p_category and subtype is not distinct from p_subtype;

  if v_existing.id is null then
    insert into public.permanent_knowledge_facts (owner_id, category, subtype, value)
      values (v_owner, p_category, p_subtype, p_value);
    insert into public.permanent_knowledge_audit_log (owner_id, operation, category, subtype)
      values (v_owner, 'guardado', p_category, p_subtype);
  else
    update public.permanent_knowledge_facts
      set value = p_value, confirmed_at = now()
      where id = v_existing.id;
    insert into public.permanent_knowledge_audit_log (owner_id, operation, category, subtype)
      values (v_owner, 'corregido', p_category, p_subtype);
  end if;
end;
$$;

comment on function public.pk_save_fact(text, text, text, boolean) is
  'Fase 7, Bloque 3: único camino de escritura para crear o corregir un hecho -- nunca lo invoca El Razonador, solo una acción explícita de interfaz tras la confirmación de la persona sobre un candidato ya mostrado. Rechaza categorías o subtipos fuera del catálogo. Exige reinforced_confirmation_shown=true para categorías que lo requieran -- salvaguarda barata en el backend, no una máquina de estados de dos fases.';

-- 4.3 Borrado individual / revocación: misma operación mecánica (borrado
--     físico real, nunca un retracted_at), distinguible en la auditoría por
--     el matiz con el que la persona lo pidió.
create function public.pk_delete_fact(
  p_category text,
  p_subtype text default 'general',
  p_as_revocation boolean default false
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_deleted_id uuid;
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para borrar un dato de Conocimiento Permanente.';
  end if;

  delete from public.permanent_knowledge_facts
    where owner_id = v_owner and category = p_category and subtype is not distinct from p_subtype
    returning id into v_deleted_id;

  if v_deleted_id is null then
    raise exception 'No existe ese dato de Conocimiento Permanente para borrar.';
  end if;

  insert into public.permanent_knowledge_audit_log (owner_id, operation, category, subtype)
    values (v_owner, case when p_as_revocation then 'revocado' else 'borrado_individual' end, p_category, p_subtype);
end;
$$;

comment on function public.pk_delete_fact(text, text, boolean) is
  'Fase 7, Bloque 3: borrado físico real de un hecho individual -- nunca queda el valor en ningún lado, ni siquiera en la auditoría. p_as_revocation solo cambia la etiqueta registrada en la auditoría (revocado vs. borrado_individual), nunca el efecto.';

-- 4.4 Borrado total: elimina todos los hechos de la persona de una vez.
create function public.pk_delete_all_facts()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
  v_count integer;
begin
  if v_owner is null then
    raise exception 'Se requiere una sesión autenticada para borrar el Conocimiento Permanente.';
  end if;

  delete from public.permanent_knowledge_facts where owner_id = v_owner;
  get diagnostics v_count = row_count;

  insert into public.permanent_knowledge_audit_log (owner_id, operation, category, subtype)
    values (v_owner, 'borrado_total', null, null);

  return v_count;
end;
$$;

comment on function public.pk_delete_all_facts() is
  'Fase 7, Bloque 3: borrado físico real de todos los hechos de auth.uid(). Un único evento agregado en la auditoría, nunca uno por hecho borrado.';

-- 4.5 Transparencia: único punto de lectura de la auditoría, ya traducida a
--     un resumen comprensible -- ni siquiera la propia dueña lee la tabla
--     cruda directamente (mismo principio de pureza que el resto del
--     bloque).
create function public.pk_get_audit_summary()
returns table (
  operation text,
  category text,
  subtype text,
  occurred_at timestamptz
)
language plpgsql
stable
security definer set search_path = public
as $$
declare
  v_owner uuid := auth.uid();
begin
  if v_owner is null then
    return;
  end if;

  return query
    select a.operation, a.category, a.subtype, a.occurred_at
    from public.permanent_knowledge_audit_log a
    where a.owner_id = v_owner
    order by a.occurred_at desc;
end;
$$;

comment on function public.pk_get_audit_summary() is
  'Fase 7, Bloque 3: única vía de transparencia sobre la trazabilidad de Conocimiento Permanente -- devuelve operación/categoría/subtipo/fecha para auth.uid(), nunca el valor (que nunca se guardó aquí), nunca datos de otra persona. La traducción a lenguaje llano (nunca códigos técnicos) ocurre en el cliente, con las mismas etiquetas ya usadas en permanent_knowledge_categories.purpose_template.';
