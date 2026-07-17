-- Administración completa de eventos y lugares: agrega el ciclo de vida
-- editorial (borrador → publicado → oculto/finalizado/cancelado),
-- programación de publicación/expiración, y organizador. Los valores por
-- defecto ('publicado', columnas nuevas nulas) preservan exactamente el
-- contenido que ya es visible hoy — cero cambio de comportamiento hasta que
-- un admin edite algo desde el panel nuevo.

alter table public.events
  add column status text not null default 'publicado'
    check (status in ('borrador', 'publicado', 'oculto', 'finalizado', 'cancelado')),
  add column organizer text,
  add column publish_at timestamptz,
  add column expires_at timestamptz;

alter table public.places
  add column status text not null default 'publicado'
    check (status in ('borrador', 'publicado', 'oculto'));

-- ---------------------------------------------------------------------------
-- places no tenía políticas de UPDATE/DELETE — solo INSERT admin (ver
-- 0005_profile_social.sql). Sin esto, editar/ocultar/eliminar lugares es
-- imposible aunque el panel lo permita en la UI.
-- ---------------------------------------------------------------------------
create policy "Admins editan lugares" on public.places
  for update using (public.is_admin());

create policy "Admins eliminan lugares" on public.places
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- SELECT público ahora respeta status: borrador/oculto solo visibles para
-- admins. 'publicado' cubre todo lo que ya existía (default de la columna
-- nueva), así que ningún contenido actual desaparece.
-- ---------------------------------------------------------------------------
drop policy "Los eventos son públicos" on public.events;
create policy "Eventos publicados son públicos, admins ven todo" on public.events
  for select using (status = 'publicado' or public.is_admin());

drop policy "Lugares son públicos" on public.places;
create policy "Lugares publicados son públicos, admins ven todo" on public.places
  for select using (status = 'publicado' or public.is_admin());
