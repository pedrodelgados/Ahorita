-- Fase 2, Bloque B: bucket privado de Storage para evidencias de
-- verificación. Migración separada de 0021 porque depende del esquema
-- `storage` de Supabase (no existe en un Postgres vanilla) — mismo motivo
-- por el que `0002_storage.sql` ya se salta en la reproducción local; esta
-- migración tampoco puede verificarse contra Postgres local, solo revisarse
-- por sintaxis y contra un proyecto Supabase real.
--
-- Usa `public.actor_belongs_to_current_user()` (creada en 0021) para la
-- pertenencia — cubre correctamente actores tipo negocio/organizador, no
-- solo persona.
--
-- Convención de ruta: cada objeto vive en `<verification_id>/evidence.<ext>`
-- — una ruta FIJA por verificación (no un nombre aleatorio), de forma que
-- subir un archivo nuevo bajo la misma ruta (upsert) reemplaza al anterior.
-- Esto implementa, sin restricción adicional de esquema, la decisión
-- aprobada de "un único archivo por solicitud" — múltiples evidencias por
-- solicitud queda documentado como fase futura, no implementado aquí.
--
-- Tipos permitidos y tamaño máximo declarados a nivel del bucket
-- (`allowed_mime_types`/`file_size_limit`), no solo por convención de la
-- futura interfaz de carga.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification_evidence',
  'verification_evidence',
  false,
  10485760, -- 10 MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- El actor sube evidencia únicamente para SU PROPIA verificación, y
-- únicamente mientras esté activa (pendiente/en_revision) — coherente con
-- que, una vez decidida, ya no debería poder alterar lo que se revisó.
create policy "El actor sube evidencia de su propia verificación" on storage.objects
  for insert with check (
    bucket_id = 'verification_evidence'
    and exists (
      select 1 from public.verifications v
      where v.id::text = (storage.foldername(name))[1]
        and public.actor_belongs_to_current_user(v.actor_id)
        and v.status in ('pendiente', 'en_revision')
    )
  );

-- Reemplazar (upsert) el único archivo de una solicitud activa — mismo
-- criterio que el insert.
create policy "El actor reemplaza evidencia de su solicitud activa" on storage.objects
  for update using (
    bucket_id = 'verification_evidence'
    and exists (
      select 1 from public.verifications v
      where v.id::text = (storage.foldername(name))[1]
        and public.actor_belongs_to_current_user(v.actor_id)
        and v.status in ('pendiente', 'en_revision')
    )
  );

-- Lectura: el propio solicitante (en cualquier estado, incluida una
-- verificación ya decidida) o un administrador — nunca Editor/Moderador,
-- nunca público.
create policy "El actor ve su propia evidencia, admins ven toda" on storage.objects
  for select using (
    bucket_id = 'verification_evidence'
    and (
      exists (
        select 1 from public.verifications v
        where v.id::text = (storage.foldername(name))[1]
          and public.actor_belongs_to_current_user(v.actor_id)
      )
      or public.is_admin()
    )
  );
