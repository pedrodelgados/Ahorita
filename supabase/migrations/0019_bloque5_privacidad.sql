-- Fase 1 del ecosistema social (ver MASTERPLAN.md), Bloque 5: privacidad.
-- Activa el mecanismo real de consentimiento, exportación y eliminación de
-- datos personales cuyo registro (`consent_records`) se adelantó vacío desde
-- el Bloque 1. A diferencia de los Bloques 1-4 (deliberadamente invisibles),
-- este bloque SÍ introduce comportamiento nuevo real: es su propósito
-- explícito, no un efecto colateral a evitar.
--
-- Decisiones de producto aprobadas explícitamente antes de escribir esta
-- migración (ver el análisis previo completo y las cuatro bifurcaciones
-- resueltas en PROJECT.md):
--   1. Eliminación de cuenta: periodo de gracia de 30 días, cancelable.
--   2. Contenido colaborativo (preguntas, respuestas, estados, comentarios
--      de eventos): se ANONIMIZA el autor (FK de CASCADE a SET NULL), nunca
--      se borra el contenido — una pregunta con respuestas de terceros
--      sobrevive aunque quien preguntó elimine su cuenta. Antes de esta
--      migración, `answers.question_id` cascadeaba desde `questions`, así
--      que borrar la cuenta de quien preguntó borraba también las
--      respuestas ajenas — el motivo real de esta decisión.
--   3. `consent_records` (y `data_requests`, nueva) NUNCA se destruyen al
--      eliminar una cuenta — se retira la referencia (`user_id` deja de ser
--      una foreign key) para que el registro de consentimiento y de la
--      propia solicitud de eliminación sobreviva como evidencia de que el
--      proceso se tramitó correctamente. Sin esto, el `on delete cascade`
--      que ya tenía `consent_records.user_id` habría borrado la prueba
--      exactamente cuando más se necesita.
--   4. Negocios: cuando su única propietaria elimina su cuenta sin haber
--      transferido el negocio antes, el negocio pasa a un estado nuevo
--      "sin_propietario" (deja de ser público, conserva todo su historial:
--      eventos ya publicados bajo su `business_id`, etc.) en vez de
--      bloquear permanentemente la eliminación o borrar el negocio. Un
--      administrador puede reasignarlo más adelante.
--
-- Alcance de esta migración (solo base de datos): consentimiento versionado
-- con retiro, `data_requests` como flujo de trabajo independiente del log
-- de consentimiento, anonimización de contenido colaborativo, y el estado
-- "sin_propietario" de negocios con su trigger de transición automática.
--
-- Fuera de alcance de esta migración, documentado con la misma
-- transparencia (ver PROJECT.md para el detalle completo de por qué):
--   - Invalidación de sesiones activas y revocación de tokens: es una
--     consecuencia automática de que el proceso que ejecuta la eliminación
--     definitiva (una Edge Function, ver supabase/functions/) invoque la
--     API de administración de Supabase Auth para borrar el usuario — no
--     existe una tabla de sesiones/tokens en este esquema sobre la que
--     escribir una migración.
--   - Invalidación de códigos QR asociados al usuario: no existe todavía
--     ninguna entidad QR en el esquema (es un módulo de una fase futura,
--     ver ARCHITECTURE.md) — no hay nada que invalidar hoy. Se documenta
--     como requisito obligatorio para cuando esa fase se construya.
--   - El borrado del archivo binario en Supabase Storage (avatares, fotos)
--     requiere una llamada aparte a la API de Storage — no es una migración
--     de base de datos.

-- -----------------------------------------------------------------------
-- 1. consent_records: consentimiento versionado, con retiro, y sin cascada
--    hacia el usuario (para que sobreviva a la eliminación de la cuenta).
-- -----------------------------------------------------------------------
alter table public.consent_records
  drop constraint consent_records_user_id_fkey;

alter table public.consent_records
  add column consent_key text,
  add column document_version text;

alter table public.consent_records
  drop constraint consent_records_event_type_check;

alter table public.consent_records
  add constraint consent_records_event_type_check
  check (
    event_type in (
      'consentimiento_otorgado',
      'consentimiento_retirado',
      'exportacion_solicitada',
      'eliminacion_solicitada'
    )
  );

-- -----------------------------------------------------------------------
-- 2. data_requests: flujo de trabajo de una solicitud de exportación o
--    eliminación, separado del log inmutable de consentimiento. Igual que
--    consent_records, sin FK hacia el usuario — debe sobrevivir a la
--    eliminación que ella misma describe.
-- -----------------------------------------------------------------------
create table public.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('exportacion', 'eliminacion')),
  status text not null default 'pendiente' check (
    status in ('pendiente', 'en_proceso', 'completada', 'cancelada', 'rechazada')
  ),
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz,
  cancelled_at timestamptz,
  processed_at timestamptz,
  processed_by uuid references public.profiles (id) on delete set null
);

alter table public.data_requests enable row level security;

create policy "El usuario ve sus propias solicitudes" on public.data_requests
  for select using (auth.uid() = user_id or public.is_admin());

create policy "El usuario crea su propia solicitud" on public.data_requests
  for insert with check (auth.uid() = user_id and status = 'pendiente');

create policy "El usuario cancela su propia solicitud pendiente" on public.data_requests
  for update using (auth.uid() = user_id and status = 'pendiente')
  with check (status = 'cancelada');

create policy "Admins procesan solicitudes" on public.data_requests
  for update using (public.is_admin());

-- No existe política de delete: ninguna fila de data_requests se borra
-- jamás, es en sí misma parte del registro de trazabilidad.

-- -----------------------------------------------------------------------
-- 3. Anonimización de contenido colaborativo: CASCADE -> SET NULL.
--    Una pregunta/respuesta/estado/comentario sobrevive a que su autor
--    elimine su cuenta; solo pierde la atribución. Mismo precedente que ya
--    usan events.created_by/places.created_by desde antes de esta fase.
-- -----------------------------------------------------------------------
alter table public.questions alter column author_id drop not null;
alter table public.questions drop constraint questions_author_id_fkey;
alter table public.questions
  add constraint questions_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete set null;

alter table public.answers alter column author_id drop not null;
alter table public.answers drop constraint answers_author_id_fkey;
alter table public.answers
  add constraint answers_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete set null;

alter table public.statuses alter column author_id drop not null;
alter table public.statuses drop constraint statuses_author_id_fkey;
alter table public.statuses
  add constraint statuses_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete set null;

alter table public.event_comments alter column author_id drop not null;
alter table public.event_comments drop constraint event_comments_author_id_fkey;
alter table public.event_comments
  add constraint event_comments_author_id_fkey
  foreign key (author_id) references public.profiles (id) on delete set null;

-- -----------------------------------------------------------------------
-- 4. Negocios sin propietario: cuando el owner_id se pierde (porque su
--    cuenta fue eliminada), el negocio no se borra ni queda bloqueado —
--    pasa a un estado nuevo, deja de ser público, y un admin puede
--    reasignarlo más adelante. Conserva su historial (eventos ya publicados
--    bajo su business_id, etc. — ninguna otra tabla se toca).
-- -----------------------------------------------------------------------
alter table public.businesses alter column owner_id drop not null;
alter table public.businesses drop constraint businesses_owner_id_fkey;
alter table public.businesses
  add constraint businesses_owner_id_fkey
  foreign key (owner_id) references auth.users (id) on delete set null;

alter table public.businesses drop constraint businesses_status_check;
alter table public.businesses
  add constraint businesses_status_check
  check (status in ('pendiente', 'aprobado', 'sin_propietario'));

create function public.handle_orphaned_business()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is null and old.owner_id is not null then
    new.status := 'sin_propietario';
  end if;
  return new;
end;
$$;

create trigger on_business_orphaned
  before update on public.businesses
  for each row execute function public.handle_orphaned_business();

-- Los admins ya podían actualizar cualquier negocio ("Admins aprueban o
-- rechazan negocios", 0005_profile_social.sql) — esa política cubre
-- reasignar owner_id sin necesidad de una política nueva. Pero la lectura
-- pública de businesses nunca incluyó a los administradores (solo
-- "aprobado" o el propio dueño) — sin esto, un admin no podría ni ver un
-- negocio "sin_propietario" (owner_id ya es null) para reasignarlo. Se
-- corrige aquí porque es indispensable para que "un administrador podrá
-- reasignarlo posteriormente" sea posible, no una ampliación de alcance
-- gratuita.
drop policy "Negocios aprobados son públicos, el dueño ve el suyo" on public.businesses;
create policy "Negocios visibles: aprobados, del dueño, o para admins" on public.businesses
  for select using (status = 'aprobado' or owner_id = auth.uid() or public.is_admin());
