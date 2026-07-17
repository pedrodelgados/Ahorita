-- Fase 2 (ver MASTERPLAN.md), Bloque A: esquema de verificación y roles
-- granulares. Aditivo: no toca ninguna columna de profiles/businesses/actors,
-- no modifica ninguna política RLS existente. `profiles.is_admin` y la
-- función `public.is_admin()` permanecen exactamente como están — este
-- bloque introduce un sistema de roles en paralelo, sin ser todavía la
-- fuente de verdad de nada. El día que se decida que este sistema reemplaza
-- a `is_admin()` en las políticas existentes será su propia fase, con su
-- propia propuesta y aprobación explícita (mismo principio ya aplicado a
-- `interactions`/`event_details` en la Fase 1).
--
-- Decisiones de arquitectura aprobadas explícitamente antes de esta
-- migración (ver el análisis técnico completo en PROJECT.md):
--   1. Modelo de roles: catálogo `roles` + asignación `actor_roles`
--      (many-to-many sobre Actor, no una columna enum en profiles) —
--      permite múltiples roles por actor y agregar un rol nuevo con un
--      simple INSERT, sin migración de esquema.
--   2. `verifications` se asocia a `actors`, no a `businesses` — para poder
--      verificar en el futuro distintos tipos de entidad sin rediseñar.
--      Un `check` (vía trigger, no vía CHECK CONSTRAINT porque cruza
--      tablas) impide verificar o asignar un rol a un actor tipo 'sistema'.
--   3. Las evidencias de verificación NO se guardan en esta tabla — solo
--      una referencia (`evidence_ref`) a un objeto en un bucket de Storage
--      privado (a crear aparte, fuera del alcance de esta migración de
--      solo base de datos).
--   4. Auditoría: `role_audit_log`, poblada automáticamente por trigger
--      (nunca por la aplicación) a partir de cambios en `actor_roles` —
--      mismo patrón de trigger security definer ya usado en
--      `handle_new_profile_actor`/`handle_orphaned_business`.
--   5. Negocios ya aprobados se migran como verificaciones con
--      `origin = 'migracion'`, vigencia de un año desde el momento de esta
--      migración — nunca una fecha retroactiva inventada.
--
-- Fuera de alcance de este bloque (ver PROJECT.md): ciclo de renovación
-- anual, avisos de vencimiento, interfaz de solicitud/revisión, y el
-- bucket de Storage privado para evidencias (columna `evidence_ref`
-- prevista, pero el bucket en sí es una migración de Storage aparte).

-- ---------------------------------------------------------------------------
-- roles — catálogo. Agregar un rol nuevo es un INSERT, nunca una migración.
-- ---------------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.roles enable row level security;

create policy "Roles son públicos" on public.roles
  for select using (true);

create policy "Admins gestionan roles" on public.roles
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.roles (key, label, description) values
  ('administrador', 'Administrador principal', 'Control total de la plataforma.'),
  ('editor', 'Editor/Curador', 'Administra contenido editorial y Selección del editor. No puede modificar roles, acceder a datos privados, aprobar verificaciones, borrar usuarios, cambiar configuración crítica ni procesar eliminaciones de cuenta.'),
  ('moderador', 'Moderador', 'Modera contenido de terceros y aplica normas de comunidad. No aprueba verificaciones ni administra roles.');

-- ---------------------------------------------------------------------------
-- actor_roles — asignación many-to-many. Nunca se borra una fila: se
-- revoca con `revoked_at`, igual principio de auditoría inmutable ya usado
-- en consent_records/data_requests (Fase 1, Bloque 5).
-- ---------------------------------------------------------------------------
create table public.actor_roles (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles (id) on delete set null,
  revocation_reason text,
  origin text not null default 'asignacion' check (origin in ('asignacion', 'migracion'))
);

create unique index actor_roles_active_unique on public.actor_roles (actor_id, role_id)
  where revoked_at is null;

alter table public.actor_roles enable row level security;

create policy "El actor ve sus propios roles, admins ven todos" on public.actor_roles
  for select using (
    exists (select 1 from public.actors a where a.id = actor_id and a.profile_id = auth.uid())
    or public.is_admin()
  );

-- Solo quien YA tiene el rol de administrador principal (is_admin() actual)
-- puede insertar o actualizar cualquier fila — esto por sí solo cierra la
-- escalada de privilegios: un no-admin nunca pasa este check, sin importar
-- a quién intente asignarse.
create policy "Solo admins asignan roles" on public.actor_roles
  for insert with check (public.is_admin());

create policy "Solo admins revocan o modifican roles" on public.actor_roles
  for update using (public.is_admin());

-- ---------------------------------------------------------------------------
-- verifications — asociada a Actor (no a businesses), con evidencia
-- referenciada, nunca almacenada aquí. Cada renovación es una fila NUEVA
-- enlazada por `renewal_of`, nunca un UPDATE que pierda el historial —
-- mismo principio que consent_records.
-- ---------------------------------------------------------------------------
create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors (id) on delete cascade,
  verification_type text not null check (verification_type in ('negocio', 'organizador')),
  status text not null default 'pendiente' check (
    status in ('pendiente', 'en_revision', 'aprobado', 'rechazado', 'vencido', 'revocado')
  ),
  evidence_ref text,
  requested_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id) on delete set null,
  decided_at timestamptz,
  rejection_reason text,
  revocation_reason text,
  expires_at timestamptz,
  renewal_of uuid references public.verifications (id) on delete set null,
  internal_notes text,
  scope text,
  origin text not null default 'revision_nueva' check (origin in ('revision_nueva', 'migracion'))
);

alter table public.verifications enable row level security;

create policy "El actor ve su verificación, admins ven todas" on public.verifications
  for select using (
    exists (select 1 from public.actors a where a.id = actor_id and a.profile_id = auth.uid())
    or public.is_admin()
  );

create policy "El actor solicita su propia verificación" on public.verifications
  for insert with check (
    exists (select 1 from public.actors a where a.id = actor_id and a.profile_id = auth.uid())
    and status = 'pendiente'
  );

-- Un admin decide sobre cualquier verificación EXCEPTO la propia — defensa
-- en profundidad para que nadie apruebe/rechace/revoque su propia
-- verificación, incluso en el caso hipotético de tener rol de administrador.
create policy "Admins deciden verificaciones ajenas, nunca la propia" on public.verifications
  for update using (
    public.is_admin()
    and not exists (
      select 1 from public.actors a where a.id = actor_id and a.profile_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Ningún actor tipo 'sistema' puede recibir un rol ni ser verificado — son
-- ejes distintos (identidad de autoría vs. control de plataforma / confianza
-- comercial), no deben mezclarse.
-- ---------------------------------------------------------------------------
create function public.prevent_system_actor_assignment()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from public.actors where id = new.actor_id and type = 'sistema') then
    raise exception 'No se puede asignar % a un actor de tipo sistema', TG_TABLE_NAME;
  end if;
  return new;
end;
$$;

create trigger prevent_system_role_assignment
  before insert or update on public.actor_roles
  for each row execute function public.prevent_system_actor_assignment();

create trigger prevent_system_verification
  before insert or update on public.verifications
  for each row execute function public.prevent_system_actor_assignment();

-- ---------------------------------------------------------------------------
-- role_audit_log — trazabilidad de toda asignación/revocación de rol.
-- Se llena únicamente por trigger (security definer, mismo patrón que
-- handle_new_profile_actor) — nunca por la aplicación directamente, por
-- eso no tiene ninguna política de insert/update/delete para usuarios.
-- ---------------------------------------------------------------------------
create table public.role_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null,
  role_id uuid not null,
  action text not null check (action in ('asignado', 'revocado')),
  performed_by uuid references public.profiles (id) on delete set null,
  performed_at timestamptz not null default now(),
  reason text
);

alter table public.role_audit_log enable row level security;

create policy "Solo admins ven el log de auditoría de roles" on public.role_audit_log
  for select using (public.is_admin());

create function public.log_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.role_audit_log (actor_id, role_id, action, performed_by)
    values (new.actor_id, new.role_id, 'asignado', new.granted_by);
  elsif TG_OP = 'UPDATE' and new.revoked_at is not null and old.revoked_at is null then
    insert into public.role_audit_log (actor_id, role_id, action, performed_by, reason)
    values (new.actor_id, new.role_id, 'revocado', new.revoked_by, new.revocation_reason);
  end if;
  return new;
end;
$$;

create trigger on_actor_role_change
  after insert or update on public.actor_roles
  for each row execute function public.log_role_change();

-- ---------------------------------------------------------------------------
-- Backfill: administradores actuales -> actor_roles (origin = 'migracion').
-- ---------------------------------------------------------------------------
insert into public.actor_roles (actor_id, role_id, granted_at, origin)
select a.id, r.id, now(), 'migracion'
from public.profiles p
join public.actors a on a.profile_id = p.id
cross join (select id from public.roles where key = 'administrador') r
where p.is_admin = true
  and not exists (
    select 1 from public.actor_roles ar
    where ar.actor_id = a.id and ar.role_id = r.id and ar.revoked_at is null
  );

-- ---------------------------------------------------------------------------
-- Backfill: negocios ya aprobados -> verifications (origin = 'migracion',
-- vigencia de un año desde este momento, nunca una fecha retroactiva).
-- ---------------------------------------------------------------------------
insert into public.verifications (
  actor_id, verification_type, status, requested_at, decided_at, expires_at, origin
)
select a.id, 'negocio', 'aprobado', now(), now(), now() + interval '1 year', 'migracion'
from public.businesses b
join public.actors a on a.business_id = b.id
where b.status = 'aprobado'
  and not exists (
    select 1 from public.verifications v where v.actor_id = a.id and v.origin = 'migracion'
  );
