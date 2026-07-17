-- Prepara la arquitectura de "Selección del editor" para curaduría manual:
-- por ahora el bloque se arma automáticamente (ver pickEditorSelection en
-- src/lib/feed.js), pero el equipo de Ahorita debe poder elegir a mano qué
-- eventos aparecen ahí, sin que el código decida. Esta columna es esa
-- señal — por defecto false, cero cambio de comportamiento hasta que un
-- admin la marque desde el panel.
alter table public.events
  add column editor_pick boolean not null default false;
