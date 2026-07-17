# Roadmap — Ahorita (Cuenca Viva)

Ver `ARCHITECTURE.md` para la visión y arquitectura del ecosistema, `MASTERPLAN.md` para el plan maestro de desarrollo detallado (única hoja de ruta oficial a partir de aquí — fases, dependencias, tablas, riesgos y criterio de terminado de cada una), `PROJECT.md` para el detalle técnico de cada fase ya implementada, y `CHANGELOG.md` para el registro de cambios archivo por archivo. Este documento es el mapa de alto nivel: qué está terminado y qué sigue.

## Fases completas

1. **Base del proyecto** — estructura de carpetas, sistema de diseño (Fraunces + Inter, tokens de color/tipografía/espaciado), cliente Supabase, login/registro con modo invitado y registro progresivo.
2. **Lugares** — cuadrícula filtrable por zona (estilo Instagram Explore), muro de lugar como Bottom Sheet, preguntas/respuestas/estados con like y gate de autenticación.
3. **Descubrimiento** — stories por canal, filtro de canal/categoría.
4. **Guía IA** — Edge Function de Supabase que llama a la API de Claude con contexto real de la base de datos (nunca la API key en el cliente); IA contextual dentro de cada lugar.
5. **Pulido y lanzamiento inicial** — perfil de usuario (lugares guardados, seguir personas), registro de negocios con estado "en revisión", panel de administración simple, PWA instalable.
6. **Rediseño premium de "Inicio"** — Inicio pasa a ser un feed exclusivo de eventos (no una mezcla de todo); mapa real en Explorar (Leaflet + CARTO + geolocalización); "Cómo llegar" con distancia real y deep links; notificaciones push reales (Web Push); sistema de diseño editorial (ritmo del feed, tipografía Fraunces con eje óptico, duotono cálido en fotos, transición continua feed→detalle); Guía IA como cápsula editorial; coherencia semántica de fotografía por categoría con fallback de marca; "Selección del editor" con curaduría manual real (`editor_pick`).
7. **✅ Administración completa de eventos y lugares** (cerrada el 2026-07-17) — CRUD completo desde `/admin/eventos` y `/admin/lugares` sin tocar código ni base de datos manualmente: crear, editar, duplicar, ocultar/publicar, eliminar; editor progresivo de 7 secciones con vista previa real; ciclo de vida completo de estados (borrador/publicado/oculto/finalizado/cancelado en eventos; borrador/publicado/oculto en lugares) con publicación programada y expiración; estados de guardado visibles y confirmación antes de salir con cambios sin guardar; menú de acciones y metadatos (estado/actualización/autor) por elemento; selector de ubicación con búsqueda de dirección. Ver el checklist completo de funcionalidades, limitaciones conocidas y el desglose de qué datos son reales/de prueba/fallback en `PROJECT.md`, sección "FASE CERRADA — Administración de eventos y lugares". Checkpoint de Git: tag `checkpoint-admin-eventos-lugares`.

## Próxima fase: implementación del ecosistema completo — plan aprobado, ejecución fase por fase

`ARCHITECTURE.md` (visión) y `MASTERPLAN.md` (plan de desarrollo, 13 fases con dependencias, tablas, riesgos y criterio de terminado) ya están aprobados. **`MASTERPLAN.md` es ahora la única hoja de ruta oficial** — reemplaza la lista de alcance previsto que vivía antes en esta sección. Resumen de las 13 fases (detalle completo en `MASTERPLAN.md`):

1. Unificación del modelo de datos fundacional (Actor, Publicación, Interacción, Ciudad)
2. Verificación robusta de negocios + roles granulares
3. Identidad social plena (perfiles y negocio extendido)
4. Contenido social ampliado (Publicaciones y Promociones)
5. Interacción social plena (comentarios/guardados/reacciones generalizados)
6. Descubrimiento inteligente v2 (feed híbrido, recomendaciones, búsqueda)
7. Guía IA v2 (sesiones persistentes y personalización)
8. Historias y video como contenido de primera clase
9. QR y experiencias físicas (check-in, promociones, validación de entradas, turismo)
10. Comercio: reservas y venta de entradas internas
11. Monetización activa y publicidad
12. Integración de movilidad (Azu Taxi y transporte)
13. Madurez operativa y cumplimiento (moderación, soporte, i18n, legal, feature flags, observabilidad)

**Ninguna fase se implementa hasta aprobación explícita, empezando por la Fase 1.** Cada fase, al aprobarse, sigue el mismo proceso ya establecido: análisis previo, implementación, verificación (build/lint/pruebas), documentación, y un punto estable de Git antes de continuar.

## Explícitamente fuera de alcance por ahora (recordatorio recurrente)

Estos puntos se han excluido en rondas sucesivas y siguen sin fecha: Reels, monetización, Azu Taxi, nueva IA más allá de la Guía IA actual, nuevos bloques editoriales más allá de "Selección del editor".
