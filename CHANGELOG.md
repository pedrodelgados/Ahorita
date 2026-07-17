# Changelog

Registro de cambios notables de Ahorita (Cuenca Viva). Formato libre, en español, más cercano a un registro de fases de producto que a versiones semánticas — ver `PROJECT.md` para el plan completo y el estado real de la implementación.

## 2026-07-17 — Fase 1, Bloque 1: esquema fundacional (primera implementación del ecosistema social)

Primer bloque de código real de la Fase 1 del `MASTERPLAN.md`, tras la aprobación de la propuesta definitiva de ejecución. Puramente estructural — invisible para el usuario final.

### Agregado
- `supabase/migrations/0015_bloque1_esquema_fundacional.sql` (nuevo): seis tablas nuevas, sin tocar ninguna tabla existente — `cities` (con "Cuenca"), `zones` (hija de `cities`, con "Centro Histórico" y "Turi" — las únicas zonas reales en uso hoy), `actors` (tipos persona/negocio/organizador/sistema, con los actores de sistema "Guía IA" y "Ahorita Editorial" ya creados, y una restricción que impide combinaciones inválidas de tipo/referencia), `interactions` (polimórfica, catálogo me_gusta/quiero_ir/ya_fui/guardado/seguimiento/compartir), `event_details` (primer caso del patrón núcleo+detalle, vacía), `consent_records` (línea base de privacidad, vacía).

### Verificado
- Las 14 migraciones existentes (`0001`-`0014`) más la nueva `0015` se ejecutaron contra un Postgres 16 real (con un stub del esquema `auth` de Supabase), no solo se revisaron visualmente.
- Conteos idénticos antes/después en todas las tablas existentes (cero filas perdidas o alteradas).
- Restricciones de `actors` verificadas con datos reales (rechazan persona+business_id y sistema+profile_id).
- RLS de `interactions`, `event_details`, `cities` y `consent_records` verificada funcionalmente con dos usuarios simulados y un rol de bajo privilegio (nunca como superusuario) — no solo revisión de las políticas escritas.
- Build y lint del frontend sin cambios — no se tocó ninguna línea de código de la aplicación en este bloque.

### Nota
Ninguna de las tablas nuevas está todavía conectada a la aplicación ni a los datos existentes — esa vinculación es el Bloque 2 (identidad), pendiente de aprobación del Product Owner antes de empezar, según lo acordado.

## 2026-07-17 — Revisión arquitectónica previa a la Fase 1: cinco decisiones + visión de motor de experiencias

Antes de autorizar la implementación, el Product Owner pidió analizar cinco puntos de diseño de largo plazo (Actor, Publicación, Interacción, Ciudad, Guía IA) y aprobó las cinco recomendaciones. Se actualiza la documentación fundacional para incorporarlas.

### Cambiado
- `ARCHITECTURE.md` (§9-11, §36): Actor gana un tercer tipo, **Sistema/Institucional**, con las identidades "Guía IA" y "Ahorita Editorial"; Publicación se formaliza con el patrón **núcleo genérico + tabla de detalle por subtipo** (Carrusel queda explícitamente excluido como subtipo); Interacción incorpora **Compartir** y una preparación para respuestas anidadas, dejando **Reportar** fuera, como su propia entidad de moderación; se agrega la entidad **Zona** como hija de Ciudad (un solo nivel, con referencia opcional a una zona padre para crecer sin comprometerse a más niveles todavía); se documenta la visión de la Guía IA como Actor y como futuro motor de experiencias.
- `AI_PHILOSOPHY.md`: nueva sección 16, "La Guía IA como Actor del sistema y motor de experiencias (visión futura, no implementada)" — deja constancia de que la Guía IA deberá evolucionar hacia combinar lugares, eventos, promociones y servicios en planes completos, sin comprometer todavía ninguna fase ni plazo. La sección de cierre "La visión definitiva" pasa a ser la 17.
- `MASTERPLAN.md`: registro de decisiones ampliado con los puntos 12-16; Fase 1 rediseñada para incluir Actor tipo Sistema (con sus dos filas), el patrón núcleo+detalle aplicado primero a Eventos (`event_details`), la entidad Zona (con migración del campo de texto libre `places.area`), y el tipo de interacción Compartir; Fase 4 y Fase 5B actualizadas para reflejar que heredan estas piezas de la Fase 1 en vez de crearlas; matriz de dependencias y sección de v2.0 actualizadas.

### Nota
Ningún archivo de código ni migración real se tocó — puramente planificación y arquitectura, tal como se pidió explícitamente. La implementación de la Fase 1 (Bloque 1) espera la aprobación final de la propuesta de ejecución presentada.

## 2026-07-17 — Filosofía y comportamiento de la Guía IA (AI_PHILOSOPHY.md)

Tras aprobar el MASTERPLAN, el usuario pidió definir "el corazón del proyecto" antes de autorizar la Fase 1: un documento completamente independiente, autoridad absoluta sobre toda decisión relacionada con la IA, puramente de comportamiento de producto — sin modelos, APIs, LLMs ni arquitectura técnica.

### Agregado
- `AI_PHILOSOPHY.md` (nuevo): filosofía completa, personalidad, principios no negociables, qué puede/nunca debe hacer, cómo razona, decide, prioriza información, maneja incertidumbre, aprende del usuario y adapta sus respuestas; cómo aprovecha toda la información del ecosistema; cinco casos de razonamiento trabajados a partir de los ejemplos del usuario ("tengo 10 dólares", "estoy aburrido", "estoy con mi novia", "la una de la madrugada", "nunca he venido a Cuenca"); un recorrido fase por fase de `MASTERPLAN.md` explicando qué capacidad de razonamiento nueva le aporta cada una a la Guía IA (presentada explícitamente como el hilo conductor del proyecto, no una fase más); y el capítulo de cierre "La visión definitiva de la Guía IA".

### Cambiado
- `README.md` y `PROJECT.md`: enlazan `AI_PHILOSOPHY.md` como autoridad absoluta sobre IA, al mismo nivel que `ARCHITECTURE.md` sobre el resto del ecosistema.

### Nota
Ningún archivo de código se tocó — exclusivamente filosofía de producto, sin mención de modelos, proveedores ni implementación técnica, tal como se pidió explícitamente.

## 2026-07-17 — Plan Maestro de Desarrollo (MASTERPLAN.md)

El usuario aprobó `ARCHITECTURE.md` como base oficial y pidió convertirlo en un plan de desarrollo accionable, actuando como CTO/Arquitecto Principal/Product Manager — sin código, sin migraciones, sin componentes, solo planificación.

### Agregado
- `MASTERPLAN.md` (nuevo): plan maestro con 13 fases de desarrollo (más la Fase 0 de línea base ya completada), cada una con objetivo, problema que resuelve, módulos, dependencias, bloqueos, tablas nuevas, entidades nuevas, APIs externas, migraciones, riesgos, pruebas necesarias y criterio de terminado. Incluye una matriz de dependencias de todos los módulos importantes (mismo formato que el ejemplo de la Guía IA entregado por el usuario), y un análisis explícito de qué puede desarrollarse en paralelo, qué nunca debe empezar antes de otra cosa, y qué puede esperar a una v2.0.
- Reordenamiento justificado respecto a las 8 fases (A-H) esbozadas en `ARCHITECTURE.md` §60: se dividen en 13 fases más granulares (cada una con un criterio de terminado verificable en semanas, no meses) y se separa la integración de Azu Taxi de la fase de comercio, porque no comparte dependencias reales con el manejo de pagos/reservas y no debería heredar ese riesgo regulatorio.

### Cambiado
- `ROADMAP.md`: la sección "próxima fase" deja de listar un alcance social suelto y pasa a apuntar a `MASTERPLAN.md` como la única hoja de ruta oficial de desarrollo, con el resumen de las 13 fases.

### Nota
Ningún archivo de código (`src/`, `supabase/migrations/`) se tocó en esta entrada — exclusivamente planificación, tal como se pidió explícitamente.

## 2026-07-17 — Documento fundacional de arquitectura del ecosistema

Cambio de enfoque explícito del usuario: de "desarrollador de pantallas" a "Arquitecto Principal del producto". Se solicitó un documento de visión y arquitectura de 60 puntos para todo el ecosistema (identidad, roles, módulos, modelo conceptual de datos, flujos, descubrimiento, IA, QR, comercio futuro, riesgos y roadmap), sin ningún código, componente ni implementación.

### Agregado
- `ARCHITECTURE.md` (nuevo): documento fundacional. Cubre los 60 puntos solicitados organizados en 13 partes, más una parte final con módulos adicionales propuestos y justificados (onboarding/alianzas institucionales, soporte, internacionalización, cumplimiento legal, feature flags, observabilidad, preparación multi-ciudad) que no estaban en la lista original del usuario. Señala explícitamente varias recomendaciones de replanteo sobre lo ya construido — la más importante: generalizar `events`/`places`-como-contenido, y las tablas paralelas de likes/guardados/comentarios, bajo abstracciones únicas de "Actor", "Publicación" e "Interacción", siguiendo el patrón `target_type`/`target_id` que `post_likes` ya demuestra parcialmente.

### Cambiado
- `README.md`: la descripción del proyecto pasa de "red social hiperlocal" a "ecosistema urbano inteligente", y ahora enlaza `ARCHITECTURE.md` como primer documento a leer.
- `PROJECT.md`: nueva nota al inicio señalando que `ARCHITECTURE.md` es la autoridad de visión de producto; `PROJECT.md` es el registro de implementación y debe ajustarse a `ARCHITECTURE.md`, no al revés.

### Nota
Ningún archivo de código (`src/`, `supabase/migrations/`) se tocó en esta entrada — es exclusivamente documentación, tal como se pidió explícitamente ("no quiero que implementes absolutamente nada").

## 2026-07-17 — Fase de administración de eventos y lugares: cerrada

El usuario aprobó la fase completa (CRUD + ajustes finales) y pidió cerrarla formalmente antes de empezar el sistema social. Sin cambios de código en este punto — solo documentación y un checkpoint de Git.

### Agregado
- `ROADMAP.md` (nuevo): mapa de fases completas y la próxima fase (sistema social), explícitamente marcada como no iniciada hasta recibir arquitectura y requisitos definitivos.
- `PROJECT.md`: sección "✅ FASE CERRADA — Administración de eventos y lugares" con checklist de funcionalidades completas, limitaciones conocidas, y desglose de qué datos son reales/de prueba/fallback.
- Tag de Git `checkpoint-admin-eventos-lugares` (commit `abf12ed`, rama `claude/esto-tengo-2wzbnj`) — punto estable para volver si una fase futura necesita revertirse.

## 2026-07-17 — Cierre de la fase administrativa: ajustes finales

Siete ajustes puntuales pedidos tras aprobar la fase de administración completa de eventos y lugares, antes de pasar a publicaciones sociales.

### Agregado
- `src/hooks/useUnsavedChangesGuard.js`: confirma antes de salir si hay cambios sin guardar — cubre cerrar/recargar pestaña (`beforeunload`) y el botón atrás del navegador (`popstate` interceptado).
- `src/components/ui/SaveStatusPill.jsx`: indicador de estado de guardado (sin guardar / guardando / guardado / error) en el encabezado de cada editor.
- `src/components/ui/ActionsMenu.jsx`: menú de acciones (⋮) por elemento en los listados — editar, duplicar, ocultar/publicar, eliminar — en lugar de botones sueltos.
- `supabase/migrations/0014_updated_at_and_creator.sql`: `updated_at` en `events`/`places` (mantenido por trigger `set_updated_at`), y `created_by` en `places` (`events` ya lo tenía).
- Búsqueda por dirección/nombre en `LocationPicker` (Nominatim/OpenStreetMap, sesgada a Cuenca), con resultados desplegables y desplazamiento animado del mapa al elegir uno.
- `CHANGELOG.md` (este archivo).

### Cambiado
- `AdminEventEditorPage`/`AdminPlaceEditorPage`: rastrean un snapshot del formulario para detectar cambios sin guardar; el botón "volver" pide confirmación si hay cambios pendientes; `handleSave` reporta éxito/error visualmente en vez de fallar en silencio.
- `AdminEventsListPage`/`AdminPlacesListPage`: cada fila ahora muestra "actualizado hace…" y el autor (cuando existe); las acciones se agrupan en `ActionsMenu`; "eliminar" pasó a pedir confirmación explícita también desde el listado (antes solo existía esa confirmación dentro del editor).
- `lib/events.js#listAllEventsForAdmin` / `lib/places.js#listAllPlacesForAdmin`: hacen join con `profiles` vía `created_by` para traer el nombre de usuario del creador.
- `src/index.css`: nueva animación `ahorita-spin` para el ícono de "guardando…".

### Verificado
- Build y lint limpios.
- Flujo E2E con Playwright + Supabase mockeado: cambios sin guardar detectados correctamente, confirmación al intentar salir, guardado exitoso (pill "Guardado"), guardado fallido simulado (pill "Error al guardar" sin ocultarse detrás de "cambios sin guardar"), menú de acciones, y búsqueda de ubicación.

## 2026-07-17 — Administración completa de eventos y lugares

- Migración `0013_admin_lifecycle.sql`: `events` gana `status`/`organizer`/`publish_at`/`expires_at`; `places` gana `status` + políticas RLS de `update`/`delete` que no existían; el `select` público de ambas tablas pasa a respetar `status = 'publicado' OR is_admin()`.
- Nuevas páginas `/admin/eventos` y `/admin/lugares` (listado con búsqueda/filtros) y sus editores (`AdminEventEditorPage`/`AdminPlaceEditorPage`), organizados en 7 secciones progresivas: información principal, fotografías, fecha y disponibilidad (horario en lugares), ubicación, entradas y contacto, publicación y visibilidad, vista previa (con `FeedCard`/`PlaceCard` reales).
- Componentes nuevos: `ConfirmationModal`, `MediaUploader`, `LocationPicker`, `FormSection`.
- `AdminPage.jsx` simplificado a dashboard; se retiran los formularios inline de creación, superados por los editores nuevos.

## 2026-07-17 — Coherencia semántica de fotografía + curaduría manual real

- `CategoryFallback`/`ImageWithFallback`: fallback editorial de marca por categoría cuando no hay foto real o falla la carga — nunca una foto genérica ni temáticamente incoherente.
- `events.editor_pick`: "Selección del editor" pasa de un heurístico automático a una fuente de verdad manual real, marcable desde el panel.

## Fases anteriores (resumen)

Ver `PROJECT.md` para el detalle completo de cada fase. En orden:

1. Proyecto base, sistema de diseño (Fraunces + Inter), Supabase, login/registro.
2. Cuadrícula de lugares + muro de lugar (Bottom Sheet).
3. Stories por canal, tarjeta editorial, filtro de canal.
4. Guía IA vía Claude (Edge Function de Supabase).
5. Perfil de usuario, registro de negocios, panel de admin simple, PWA.
6. Rediseño premium del feed ("Inicio" pasa a ser solo eventos): mapa Leaflet + CARTO, "Cómo llegar", notificaciones push reales, sistema de diseño editorial (tipografía, ritmo del feed, duotono de fotos), Guía IA como cápsula, "Selección del editor".
