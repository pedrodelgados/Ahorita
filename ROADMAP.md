# Roadmap — Ahorita (Cuenca Viva)

Ver `PROJECT.md` para el detalle técnico completo de cada fase y `CHANGELOG.md` para el registro de cambios archivo por archivo. Este documento es el mapa de alto nivel: qué está terminado y qué sigue.

## Fases completas

1. **Base del proyecto** — estructura de carpetas, sistema de diseño (Fraunces + Inter, tokens de color/tipografía/espaciado), cliente Supabase, login/registro con modo invitado y registro progresivo.
2. **Lugares** — cuadrícula filtrable por zona (estilo Instagram Explore), muro de lugar como Bottom Sheet, preguntas/respuestas/estados con like y gate de autenticación.
3. **Descubrimiento** — stories por canal, filtro de canal/categoría.
4. **Guía IA** — Edge Function de Supabase que llama a la API de Claude con contexto real de la base de datos (nunca la API key en el cliente); IA contextual dentro de cada lugar.
5. **Pulido y lanzamiento inicial** — perfil de usuario (lugares guardados, seguir personas), registro de negocios con estado "en revisión", panel de administración simple, PWA instalable.
6. **Rediseño premium de "Inicio"** — Inicio pasa a ser un feed exclusivo de eventos (no una mezcla de todo); mapa real en Explorar (Leaflet + CARTO + geolocalización); "Cómo llegar" con distancia real y deep links; notificaciones push reales (Web Push); sistema de diseño editorial (ritmo del feed, tipografía Fraunces con eje óptico, duotono cálido en fotos, transición continua feed→detalle); Guía IA como cápsula editorial; coherencia semántica de fotografía por categoría con fallback de marca; "Selección del editor" con curaduría manual real (`editor_pick`).
7. **✅ Administración completa de eventos y lugares** (cerrada el 2026-07-17) — CRUD completo desde `/admin/eventos` y `/admin/lugares` sin tocar código ni base de datos manualmente: crear, editar, duplicar, ocultar/publicar, eliminar; editor progresivo de 7 secciones con vista previa real; ciclo de vida completo de estados (borrador/publicado/oculto/finalizado/cancelado en eventos; borrador/publicado/oculto en lugares) con publicación programada y expiración; estados de guardado visibles y confirmación antes de salir con cambios sin guardar; menú de acciones y metadatos (estado/actualización/autor) por elemento; selector de ubicación con búsqueda de dirección. Ver el checklist completo de funcionalidades, limitaciones conocidas y el desglose de qué datos son reales/de prueba/fallback en `PROJECT.md`, sección "FASE CERRADA — Administración de eventos y lugares". Checkpoint de Git: tag `checkpoint-admin-eventos-lugares`.

## Próxima fase: sistema social — 🚧 NO INICIADA

El usuario ha anunciado la siguiente fase pero **explícitamente pidió no implementarla todavía** — falta que entregue la arquitectura y los requisitos definitivos. Alcance previsto (sujeto a cambio hasta que se confirme):

- Usuarios (perfiles públicos, más allá del perfil básico ya existente)
- Negocios verificados (evolución del registro de negocios actual, con verificación real)
- Publicaciones (contenido generado por usuarios/negocios, más allá de preguntas/respuestas/estados actuales)
- Promociones
- Carruseles (de contenido, no solo el editorial de "Selección del editor")
- Comentarios (ya existe un sistema básico en eventos — evaluar si se generaliza o se reemplaza)
- Likes (ya existe `post_likes` genérico — evaluar si se extiende)
- Guardados (ya existen `saved_places`/`saved_events` — evaluar si se generaliza)
- Perfiles (evolución del perfil de usuario actual)

**No implementar nada de esta lista hasta recibir instrucción explícita con la arquitectura y los requisitos definitivos.** Varias piezas (comentarios, likes, guardados, perfil básico) ya tienen una primera versión en el código — la fase social decidirá si se extienden, se rediseñan, o conviven con algo nuevo, y eso debe decidirse antes de tocar código, no durante.

## Explícitamente fuera de alcance por ahora (recordatorio recurrente)

Estos puntos se han excluido en rondas sucesivas y siguen sin fecha: Reels, monetización, Azu Taxi, nueva IA más allá de la Guía IA actual, nuevos bloques editoriales más allá de "Selección del editor".
