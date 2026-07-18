-- Fase 2 (ver MASTERPLAN.md), Bloque B: ciclo de vida, vigencia y renovación
-- de verificaciones. Aditivo sobre el Bloque A en cuanto a tablas: no agrega
-- ninguna columna a `roles`/`actor_roles` ni cambia su esquema. SÍ corrige
-- una función de pertenencia de Actor usada por varias políticas del
-- Bloque A (ver sección 0) — un defecto real encontrado durante la
-- implementación de este bloque, no una ampliación de alcance.
--
-- Decisiones aprobadas explícitamente antes de esta migración (ver el
-- análisis técnico completo y la corrección de pertenencia en PROJECT.md):
--   0. CORRECCIÓN sobre el Bloque A: las políticas de "esto es mío" en
--      `verifications`/`actor_roles` comparaban únicamente
--      `actors.profile_id = auth.uid()` — funciona para actores tipo
--      `persona`, pero un actor `negocio`/`organizador` SIEMPRE tiene
--      `profile_id = NULL` por diseño (desde el Bloque 1). Eso bloqueaba
--      exactamente el caso de uso central de este bloque: el dueño de un
--      negocio solicitando la verificación de su propio negocio. Se
--      introduce `public.actor_belongs_to_current_user(actor_id)`,
--      reutilizada en las políticas afectadas de ambos bloques.
--   1. Periodo de gracia: 30 días (ajustado desde la propuesta inicial de
--      15, por coherencia con el resto del sistema).
--   2. `status` permanece 'aprobado' durante TODO el periodo de gracia — la
--      insignia se conserva. Solo el proceso automatizado, al vencer el
--      periodo de gracia completo, transiciona a 'vencido'. Ningún admin
--      humano puede alcanzar 'vencido' por la vía RLS normal.
--   3. `verification_status_log` es una tabla independiente de
--      `role_audit_log` (dominios distintos).
--   4. Snapshots (`snapshot_owner_id`/`snapshot_category`/`snapshot_lat`/
--      `snapshot_lng`) en cada verificación aprobada, para detectar
--      automáticamente cambios reales en la renovación basada en riesgo.
--   5. Los negocios `origin='migracion'` no quedan en desventaja: la nueva
--      restricción de "evidencia requerida antes de aprobar" los exime
--      explícitamente.
--   6. Evidencias: un único archivo por solicitud (PDF/JPG/PNG), bajo una
--      ruta fija por verificación — el bucket de Storage se crea en
--      `0022_fase2_bloqueB_storage_evidencias.sql` (migración separada,
--      no reproducible en Postgres local, mismo motivo que `0002_storage.sql`).
--
-- Fuera de alcance de este bloque (ver PROJECT.md): interfaz visual,
-- perfiles sociales, promociones, publicaciones, QR, IA nueva, Azu Taxi,
-- monetización, cambio de fuente de verdad desde is_admin, limpieza
-- automática de evidencias vencidas.

-- ---------------------------------------------------------------------------
-- 0. Corrección: pertenencia de Actor, para persona Y para negocio/
--    organizador. `security definer` para que la verificación de pertenencia
--    nunca dependa de si el llamante puede o no ver la fila de `businesses`
--    por sí sola (mismo criterio que `is_admin()`, ya `security definer`
--    desde el Bloque 1). No otorga ningún privilegio adicional: solo
--    responde "¿este actor es tuyo?", igual que antes, pero correctamente
--    para los cuatro casos:
--      1. persona -> profile_id = auth.uid().
--      2. negocio/organizador -> el business detrás del actor tiene
--         owner_id = auth.uid().
--      3. sistema -> nunca pertenece a nadie (no matchea ninguna rama).
--      4. negocio sin propietario (owner_id null) -> no pertenece a nadie
--         hasta que un admin lo reasigne (null = auth.uid() nunca es true).
-- ---------------------------------------------------------------------------
create function public.actor_belongs_to_current_user(check_actor_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.actors a
    left join public.businesses b on b.id = a.business_id
    where a.id = check_actor_id
      and (
        (a.type = 'persona' and a.profile_id = auth.uid())
        or (a.type in ('negocio', 'organizador') and b.owner_id = auth.uid())
      )
  );
$$;

-- Redefine las políticas del Bloque A que usaban la comparación directa
-- contra profile_id, sin cambiar su alcance para actores tipo persona.
drop policy "El actor ve sus propios roles, admins ven todos" on public.actor_roles;
create policy "El actor ve sus propios roles, admins ven todos" on public.actor_roles
  for select using (
    public.actor_belongs_to_current_user(actor_id) or public.is_admin()
  );

drop policy "El actor ve su verificación, admins ven todas" on public.verifications;
create policy "El actor ve su verificación, admins ven todas" on public.verifications
  for select using (
    public.actor_belongs_to_current_user(actor_id) or public.is_admin()
  );

drop policy "El actor solicita su propia verificación" on public.verifications;
create policy "El actor solicita su propia verificación" on public.verifications
  for insert with check (
    public.actor_belongs_to_current_user(actor_id) and status = 'pendiente'
  );

-- ---------------------------------------------------------------------------
-- 1. Columnas nuevas en verifications.
-- ---------------------------------------------------------------------------
alter table public.verifications
  add column revoked_by uuid references public.profiles (id) on delete set null,
  add column revoked_at timestamptz,
  add column snapshot_owner_id uuid,
  add column snapshot_category text,
  add column snapshot_lat double precision,
  add column snapshot_lng double precision;

-- Evidencia requerida antes de pasar a revisión o aprobar — excepto para
-- las verificaciones migradas del Bloque A, que nunca tuvieron ese requisito.
alter table public.verifications
  add constraint verifications_evidence_required
  check (
    status not in ('en_revision', 'aprobado')
    or evidence_ref is not null
    or origin = 'migracion'
  );

-- ---------------------------------------------------------------------------
-- 2. El actor puede completar su propia solicitud activa (adjuntar
--    evidencia, ajustar `scope`) — el Bloque A nunca necesitó esto porque
--    no existía todavía el flujo de evidencia. No puede tocar ningún otro
--    campo: el trigger de la sección 4 lo garantiza incluso si el UPDATE
--    intenta modificar otras columnas.
-- ---------------------------------------------------------------------------
create policy "El actor completa su propia solicitud activa" on public.verifications
  for update using (
    public.actor_belongs_to_current_user(actor_id)
    and status in ('pendiente', 'en_revision')
  )
  with check (
    status in ('pendiente', 'en_revision')
  );

-- ---------------------------------------------------------------------------
-- 3. 'vencido' deja de ser alcanzable por un admin humano vía RLS normal —
--    únicamente el proceso automatizado (service role, que no pasa por
--    políticas RLS en absoluto) puede marcarlo. Se reemplaza la política de
--    update de administradores del Bloque A por la misma, con esta
--    restricción adicional y la pertenencia corregida (evita que un admin
--    que también sea dueño de un negocio pueda auto-aprobar su propia
--    verificación de negocio — el defecto de la sección 0 hacía justamente
--    eso posible antes de esta corrección).
-- ---------------------------------------------------------------------------
drop policy "Admins deciden verificaciones ajenas, nunca la propia" on public.verifications;

create policy "Admins deciden verificaciones ajenas, nunca la propia" on public.verifications
  for update using (
    public.is_admin()
    and not public.actor_belongs_to_current_user(actor_id)
  )
  with check (status <> 'vencido');

-- ---------------------------------------------------------------------------
-- 4. Trigger de protección de campos. Si quien actualiza NO es admin ni el
--    proceso automatizado (service role), todos los campos sensibles vuelven
--    a su valor anterior sin importar qué intente escribir el UPDATE — solo
--    `evidence_ref`/`scope` quedan realmente editables por el actor. Además,
--    ni siquiera un admin puede cambiar `expires_at` de forma aislada: solo
--    puede cambiar como consecuencia real de una transición de `status`
--    (aprobar/renovar), nunca por sí solo.
-- ---------------------------------------------------------------------------
create function public.protect_verification_fields()
returns trigger
language plpgsql
as $$
begin
  -- Guardia explícita e incondicional contra la auto-aprobación, ejecutada
  -- en el trigger (no solo en RLS): en Postgres, las cláusulas WITH CHECK
  -- de TODAS las políticas permisivas de UPDATE se combinan con OR, sin
  -- importar cuál política fue la que autorizó vía USING — el WITH CHECK
  -- laxo de "Admins deciden..." (`status <> 'vencido'`) puede terminar
  -- validando una fila que en realidad entró por la política de "el actor
  -- completa su propia solicitud". Esta comprobación no depende de qué
  -- política haya dejado pasar el UPDATE: si quien ejecuta la operación es
  -- dueño del actor y el status resultante es una decisión real, se
  -- rechaza siempre, sin excepción.
  if public.actor_belongs_to_current_user(new.actor_id)
     and new.status is distinct from old.status
     and new.status in ('aprobado', 'rechazado', 'revocado') then
    raise exception 'Un actor no puede decidir sobre su propia verificación';
  end if;

  if auth.role() = 'service_role' or public.is_admin() then
    if new.status is not distinct from old.status and auth.role() <> 'service_role' then
      new.expires_at := old.expires_at;
    end if;
    -- Al aprobar (primera vez o renovación), se toma una fotografía de los
    -- datos del negocio en ese instante — es lo que permite detectar, en la
    -- siguiente renovación, si hubo un cambio real de propietario/actividad/
    -- ubicación (modelo de renovación basado en riesgo, sección 3 del
    -- análisis). Nunca se recalcula fuera de una aprobación real.
    if new.status = 'aprobado' and old.status is distinct from new.status then
      select b.owner_id, b.category, b.lat, b.lng
        into new.snapshot_owner_id, new.snapshot_category, new.snapshot_lat, new.snapshot_lng
      from public.actors a
      join public.businesses b on b.id = a.business_id
      where a.id = new.actor_id;
    end if;
  else
    new.status := old.status;
    new.reviewed_by := old.reviewed_by;
    new.decided_at := old.decided_at;
    new.rejection_reason := old.rejection_reason;
    new.revocation_reason := old.revocation_reason;
    new.revoked_by := old.revoked_by;
    new.revoked_at := old.revoked_at;
    new.expires_at := old.expires_at;
    new.internal_notes := old.internal_notes;
    new.snapshot_owner_id := old.snapshot_owner_id;
    new.snapshot_category := old.snapshot_category;
    new.snapshot_lat := old.snapshot_lat;
    new.snapshot_lng := old.snapshot_lng;
    new.origin := old.origin;
    new.renewal_of := old.renewal_of;
    new.verification_type := old.verification_type;
    new.actor_id := old.actor_id;
    new.requested_at := old.requested_at;
  end if;
  return new;
end;
$$;

create trigger protect_verification_fields_trigger
  before update on public.verifications
  for each row execute function public.protect_verification_fields();

-- ---------------------------------------------------------------------------
-- 5. verification_status_log — auditoría de cada transición de estado,
--    poblada únicamente por trigger (nunca por la aplicación).
-- ---------------------------------------------------------------------------
create table public.verification_status_log (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references public.verifications (id) on delete cascade,
  from_status text,
  to_status text not null,
  performed_by uuid references public.profiles (id) on delete set null,
  performed_at timestamptz not null default now(),
  reason text,
  is_automated boolean not null default false
);

alter table public.verification_status_log enable row level security;

create policy "Solo admins ven el log de estado de verificaciones" on public.verification_status_log
  for select using (public.is_admin());

create function public.log_verification_status_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.verification_status_log (verification_id, from_status, to_status, performed_by, is_automated)
    values (new.id, null, new.status, null, false);
  elsif TG_OP = 'UPDATE' and new.status is distinct from old.status then
    insert into public.verification_status_log (
      verification_id, from_status, to_status, performed_by, reason, is_automated
    )
    values (
      new.id,
      old.status,
      new.status,
      case
        when auth.role() = 'service_role' then null
        when new.status = 'revocado' then new.revoked_by
        when new.status in ('aprobado', 'rechazado') then new.reviewed_by
        else null
      end,
      coalesce(new.rejection_reason, new.revocation_reason),
      auth.role() = 'service_role'
    );
  end if;
  return new;
end;
$$;

create trigger on_verification_status_change
  after insert or update on public.verifications
  for each row execute function public.log_verification_status_change();

-- ---------------------------------------------------------------------------
-- 6. verification_notices — avisos enviados antes/durante el vencimiento.
--    Único por (verification_id, notice_type): nunca se reenvía el mismo
--    aviso. Poblada únicamente por el proceso automatizado.
-- ---------------------------------------------------------------------------
create table public.verification_notices (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references public.verifications (id) on delete cascade,
  notice_type text not null check (
    notice_type in ('30_dias', '15_dias', '7_dias', 'vencimiento', 'fin_gracia')
  ),
  sent_at timestamptz not null default now(),
  channel text not null default 'push' check (channel in ('push')),
  unique (verification_id, notice_type)
);

alter table public.verification_notices enable row level security;

create policy "El actor ve sus propios avisos, admins ven todos" on public.verification_notices
  for select using (
    exists (
      select 1 from public.verifications v
      where v.id = verification_id and public.actor_belongs_to_current_user(v.actor_id)
    )
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- 7. evidence_access_log — quién consultó la evidencia de quién y cuándo.
--    Poblada por la Edge Function que genera cada URL firmada (no puede ser
--    un trigger de base de datos: generar una URL firmada es una llamada a
--    la API de Storage, no una operación SQL).
-- ---------------------------------------------------------------------------
create table public.evidence_access_log (
  id uuid primary key default gen_random_uuid(),
  verification_id uuid not null references public.verifications (id) on delete cascade,
  accessed_by uuid references public.profiles (id) on delete set null,
  accessed_at timestamptz not null default now()
);

alter table public.evidence_access_log enable row level security;

create policy "Solo admins ven el log de acceso a evidencias" on public.evidence_access_log
  for select using (public.is_admin());
