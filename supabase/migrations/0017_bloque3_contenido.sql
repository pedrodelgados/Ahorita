-- Fase 1 del ecosistema social (ver MASTERPLAN.md), Bloque 3: contenido.
-- Puebla event_details (creada vacía en el Bloque 1, 0015) con una copia
-- fiel de los campos específicos de cada evento ya existente. Es el primer
-- caso real de datos fluyendo por el patrón "núcleo genérico + tabla de
-- detalle" de Publicación (ver ARCHITECTURE.md §9).
--
-- Decisión arquitectónica aprobada explícitamente antes de escribir esta
-- migración (ver PROJECT.md para el detalle completo de las dos opciones
-- planteadas y por qué se descartó la alternativa en cada caso):
--   1. Separación ADITIVA, no física: event_details se llena como copia;
--      `events` NO pierde ninguna columna en este bloque. La separación
--      física real (retirar las columnas de `events`) solo tiene sentido
--      el día que el código de la aplicación migre a leer/escribir contra
--      event_details — tocar ese código está fuera del alcance de este
--      bloque, que es exclusivamente de base de datos.
--   2. event_details es una FOTOGRAFÍA tomada en este momento, sin
--      sincronización posterior — igual que ya se documentó para
--      actors.display_name en el Bloque 2 (0016). No se agrega ningún
--      trigger de sincronización en `events` a propósito: es la tabla de
--      mayor tráfico de escritura de todo el sistema (cada creación o
--      edición de evento desde el panel de administración pasa por ahí),
--      y nada lee todavía event_details — sincronizar en vivo algo que
--      nadie usa todavía es exactamente el tipo de optimización prematura
--      que se descartó deliberadamente.
--
-- No se toca ninguna columna de `events`, ninguna política RLS (las de
-- event_details ya quedaron correctas desde el Bloque 1, cascadeando la
-- visibilidad real de `events`), ni ningún otro bloque (interactions,
-- zones, privacidad siguen exactamente como en el Bloque 2).

insert into public.event_details (event_id, start_at, end_at, price, ticket_url, organizer)
select id, start_at, end_at, price, ticket_url, organizer
from public.events e
where not exists (select 1 from public.event_details ed where ed.event_id = e.id);
