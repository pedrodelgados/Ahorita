-- Fase 3 (ver MASTERPLAN.md), Bloque C, Entrega 4: horarios y catálogo
-- editables. Aditivo: no toca ninguna tabla ni política existente salvo la
-- señalada abajo.
--
-- Hallazgo encontrado antes de implementar la Entrega 4 (presentado y
-- aprobado explícitamente): `business_catalog_collections` no tenía forma
-- de "ocultar" una colección — a diferencia de `business_catalog_items`,
-- que sí tiene `is_visible` desde el Bloque B. Se agrega la misma columna,
-- con el mismo patrón de política pública ya usado en los ítems.
alter table public.business_catalog_collections
  add column is_visible boolean not null default true;

drop policy "Colección visible si el negocio es visible" on public.business_catalog_collections;

create policy "Colección visible si el negocio es visible" on public.business_catalog_collections
  for select using (
    (is_visible and public.business_visible_to_current_user(business_id))
    or public.business_editable_by_current_user(business_id)
  );
