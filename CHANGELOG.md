# Changelog

Registro de cambios notables de Ahorita (Cuenca Viva). Formato libre, en español, más cercano a un registro de fases de producto que a versiones semánticas — ver `PROJECT.md` para el plan completo y el estado real de la implementación.

## 2026-07-19 — Corrección: fila estática de acciones en Publicación/Promoción

Corrección puntual, aprobada explícitamente, del hallazgo del Bloque 4 (riel de acciones recortado en contenido corto sin imagen). Alcance acotado a la solución elegida: no reabre arquitectura, no toca `FeedCard.jsx` (Eventos nunca tuvo el problema).

### Agregado
- `src/features/feed/ContentActionsRow.jsx`: fila estática de Me gusta/Compartir/Guardar, compartida entre Publicación y Promoción, siempre en flujo normal del documento después del contenido — nunca flotante, nunca depende de una altura mínima artificial.

### Cambiado
- `PublicationFeedCard.jsx`/`PromotionFeedCard.jsx`: reemplazan `SocialActions` (riel flotante) por `ContentActionsRow`. El bloque de foto (cuando existe) pasa a tener una altura propia y acotada en vez de llenar toda la tarjeta.

### Verificado
Playwright (`test_fase4_bloque4_fix.js`, 9 escenarios): las seis combinaciones exigidas (Publicación/Promoción × corta sin imagen/larga sin imagen/con imagen) con los tres controles verificados clickeables vía `elementFromPoint` (no solo presentes en el DOM); estado activo/inactivo y ocupado confirmados con interacción real. Regresión completa de Eventos, Publicaciones, Promociones y Compartir sigue pasando. Build y lint limpios. Capturas antes/después adjuntas.

## 2026-07-19 — Fase 4, Bloque 4: Compartidos fortalecen el Feed

Cuarto y último bloque de la Fase 4 — alcance deliberadamente pequeño e instrumental: convertir cada acción real de compartir (Evento, Publicación, Promoción, Perfil de persona o negocio) en una señal medible dentro de `interactions`, sin cambiar la experiencia nativa de compartir. Sin migración nueva — `interactions` ya estaba preparada para esto desde el Bloque 1 de la Fase 1 (`'compartir'` en el `check` de `type`, `target_type` genérico, `unique(actor_id, type, target_type, target_id)`).

### Agregado
- `src/hooks/useShareContent.js`: hook único que reemplaza las cuatro implementaciones casi idénticas de `handleShare` (Evento, Publicación, Promoción, Perfil). Compartir nunca se bloquea por falta de sesión; la interacción solo se registra con sesión real; cancelar el diálogo nativo nunca es un error; un fallo al registrar nunca revierte el compartir que ya ocurrió.
- `registerShare()` en `src/lib/interactions.js`: trata un conflicto de unicidad (23505, segundo intento sobre el mismo contenido) como éxito idempotente, nunca como error.

### Cambiado
- `ActionBar.jsx`: Compartir ya no vive solo dentro del bloque de negocio — ahora también aparece en el perfil de una persona (antes ausente).

### Verificado
Postgres 16 real con roles de bajo privilegio: un actor solo registra a nombre propio, no puede registrar por otro ni borrar interacciones ajenas, segundo intento sobre el mismo contenido no duplica fila. Playwright (11 escenarios + 1 verificación adicional): completar, cancelar, fallback de copiar enlace (éxito y fallo), visitante sin bloqueo y sin registro, segundo intento sin error visible, las cinco superficies (Evento/Publicación/Promoción/Perfil persona/Perfil negocio). Regresión completa de Fases 1-3 y Bloques 1-3 sigue pasando sin cambios de mocks. Build y lint limpios.

### Hallazgo documentado, sin decidir arreglo
Al probar Compartir sobre contenido corto sin imagen se descubrió que el riel de acciones de `PublicationFeedCard`/`PromotionFeedCard` puede quedar recortado por `overflow: hidden` — defecto preexistente del Bloque 2, no introducido por este bloque. Implica una decisión de diseño real (varias soluciones válidas); queda documentado en `PROJECT.md` para que el Product Owner decida antes de tocarlo.

## 2026-07-19 — Fase 4, Bloque 3: Promociones alimentan el Feed

Tercer bloque de la Fase 4. Incorpora siete ajustes de producto acordados al aprobar el diseño: ventana de anticipación de 24 horas ("Empieza hoy"/"Empieza mañana"), reutilización estricta del criterio de orden por distancia a "ahora" (sin algoritmo nuevo), sin "Quiero ir" (exclusivo de Eventos), restricciones siempre visibles, beneficio exigido como frase completa, doble etiqueta temporal siempre junta ("Publicado hace…" + "Válido hasta…"), y ventana de gracia de 3 horas tras finalizar ("Finalizó hace…") antes de desaparecer del Feed. Incluye además la corrección de un hallazgo de seguridad del Bloque 2: la RLS de `publications` no volvía a exigir verificación al reactivar/publicar contenido ya existente.

### Agregado
- `supabase/migrations/0031_fase4_bloque3_promociones.sql`: detalle `promotion_details` sobre el núcleo `publications` (subtype `promocion`); `actor_can_author_promotion()` (Ahorita Editorial excluido permanentemente); `enforce_publication_publish_authorization()` (corrige el hallazgo de verificación, aplica a Publicación y Promoción); `promotion_status()` (seis fases, única fuente de verdad computada); `list_feed_promotions()` (función pública estrecha); inmutabilidad de `ended_early_at`.
- `src/lib/promotions.js`, extensión de `src/lib/time.js` (etiquetas de fase) y de `src/lib/interactions.js` (me gusta/guardado sobre Promociones).
- `src/lib/feed.js`: Promociones como tercera fuente real, con `sortAt` calculado por fase.
- `src/features/feed/PromotionFeedCard.jsx`, `src/features/profile/PromotionComposerSheet.jsx`, `src/features/profile/PromotionsSection.jsx`.

### Corregido
- Hallazgo de seguridad del Bloque 2: un negocio que pierde la verificación ya no puede publicar un borrador ni reactivar contenido oculto (antes sí podía, por un vacío en la RLS de `update` de `publications`).
- Corrección visual (afecta también al Bloque 2): la etiqueta de tipo de tarjeta ("Promoción"/"Publicación") se superponía al nombre del autor cuando el contenido no tiene imagen; ahora fluye en el documento en ese caso, sin afectar el caso con imagen.

### Verificado
Postgres 16 real con roles de bajo privilegio: negocio vigente crea y publica, negocio sin verificar rechazado incluso en borrador, "Ahorita Editorial" siempre rechazado, beneficio corto y fechas inválidas rechazados por la base de datos, un negocio que **pierde** la verificación (transición real `aprobado → vencido` vía `service_role`) queda bloqueado al publicar/reactivar pero conserva edición y eliminación, `promotion_status()` correcto en sus seis fases, `ended_early_at` inmutable, `list_feed_promotions()` solo expone fases públicas. Playwright (5 escenarios): Feed con Promoción completa, sin comentarios ni "Quiero ir", etiqueta propia para promociones programadas, compatibilidad sin promociones, visitante sin sección montada. Regresión completa de Fases 1-3 y Bloques 1-2 sigue pasando (se agregaron mocks de `rpc/actor_can_author_promotion` y `rpc/list_feed_promotions` en archivos de prueba de sesiones anteriores; la misma inestabilidad de doble-toque de la Entrega 6 se confirmó de nuevo como ruido de entorno). Build y lint limpios.

## 2026-07-19 — Fase 4, Bloque 2: Publicaciones alimentan el Feed

Segundo bloque de la Fase 4. Incorpora cinco ajustes de producto acordados al aprobar el diseño: protección contra publicaciones accidentales (frontend, sin mecanismo nuevo de base de datos), límite de 500 caracteres exigido por restricción real de base de datos, edición transparente (`published_at` protegido por trigger, "Editado" siempre con fecha original visible), pérdida de verificación (el contenido ya publicado nunca desaparece; solo se bloquea crear contenido nuevo), y preparación de permalink (satisfecha por construcción con el `id` uuid estable, sin campo adicional).

### Agregado
- `supabase/migrations/0030_fase4_bloque2_publicaciones.sql`: núcleo `publications` + detalle `publication_posts`; `public.actor_can_author_publication()`; triggers de protección de `published_at` y de `updated_at` del detalle. `events` intacto.
- `src/lib/publications.js`, extensión de `src/lib/interactions.js` (me gusta/guardado sobre Publicaciones, reutilizando `interactions` sin migración).
- `src/lib/feed.js`: Publicaciones como segunda fuente real; `mergeFeedSources` pasa a ordenar por distancia absoluta respecto a "ahora" (retrocompatible: con una sola fuente, eventos, da el mismo resultado que antes).
- `src/features/feed/PublicationFeedCard.jsx`, `src/features/profile/PublicationComposerSheet.jsx`, `src/features/profile/PublicationsSection.jsx`, `src/pages/admin/AdminEditorialPage.jsx` (Ahorita Editorial).

### Verificado
Postgres 16 real con roles de bajo privilegio: negocio verificado publica, no verificado rechazado, administrador operativo activo con éxito, revocado rechazado de inmediato (crear y editar), tercero ajeno rechazado, solo admin de plataforma publica como "Ahorita Editorial", borrador/oculto invisibles fuera de su dueño, texto >500 caracteres rechazado, `published_at` protegido tras ocultar-y-republicar, "Editado" correcto en ambos sentidos. Playwright (3 escenarios): feed mezclado con jerarquía visual, compatibilidad sin publicaciones, visitante sin sección montada. Regresión completa de Fases 1-3 y Bloque 1 sigue pasando (se corrigió, en archivos de prueba de sesiones anteriores, la falta de mock para la nueva llamada a `publications`; una falla puntual de doble-toque de la Entrega 6 se confirmó de nuevo como inestabilidad de entorno, no regresión). Build y lint limpios.

## 2026-07-18 — Fase 4, Bloque 1: el Feed como contrato central

Primer bloque de la Fase 4, rediseñada tres veces antes de implementarse bajo `PRODUCT_MANIFESTO.md` y `PRODUCT_STRATEGY.md` — ver `FASE4_CONTRATO_ARQUITECTONICO.md` (autoridad de diseño de esta fase). Principio rector: nunca migrar un sistema estable (`events`) antes de validar completamente el nuevo (núcleo de Publicaciones, bloques siguientes). La fase se ordena alrededor del Feed, no de la base de datos.

### Agregado
- Documentos fundacionales nuevos: `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `FASE4_CONTRATO_ARQUITECTONICO.md`.
- `src/lib/feed.js`: `mapEventToFeedItem` (extraído, con `sortAt` como criterio de orden compartido entre fuentes) y `mergeFeedSources(...sources)` — contrato de composición multi-fuente, hoy invocado con una sola fuente real (Eventos), por lo que el resultado es idéntico al feed anterior.

### Sin cambios (a propósito)
`events`, `lib/events.js`, `EventSheet`, la administración de eventos y todas las interacciones existentes sobre eventos — cero diferencia observable para el usuario, criterio de aceptación explícito de este bloque.

### Verificado
Build y lint limpios. Playwright (5 escenarios): sin errores de JS, todos los eventos mockeados presentes, orden por cercanía temporal preservado, "Selección del editor" preservada, tratamiento visual "portada" del primer evento preservado. Regresión general (Inicio/Explorar/Perfil) sin errores. Sin migraciones — este bloque no toca la base de datos.

### Retirado del plan
La antigua Fase 5A ("Seguir negocios") del `MASTERPLAN.md` — su alcance ya fue absorbido por la Fase 3 (Entregas 2 y 6); no se implementará como fase independiente.

## 2026-07-18 — Cierre funcional de la Fase 3: Identidad social plena

Cierre formal solicitado tras completar la Entrega 7 y responder con transparencia si correspondía una Entrega 8. La planificación original del Bloque C (fijada al aprobar la Entrega 4) nombraba una séptima entrega de "validación visual final"; se sustituyó silenciosamente por "búsqueda y descubrimiento" al delegarse el alcance, sin señalarlo como sustitución en su momento. Reconocida la sustitución, se concluyó que ninguna deuda pendiente justificaba una Entrega 8 solo para extender artificialmente el Bloque C — todas las deudas reales ya están registradas por nombre. Se cierra oficialmente el Bloque C y, con él, la Fase 3 desde el punto de vista funcional.

### Documentación (sin cambios de código)
- `PROJECT.md`: nueva sección "FASE 3 CERRADA — Identidad social plena (2026-07-18)" — resumen ejecutivo de los tres bloques (A, B, C con sus 7 entregas), arquitectura lograda, funcionalidades implementadas, decisiones de diseño, problemas encontrados y su resolución (incluida la sustitución de la Entrega 7), deudas técnicas pendientes consolidadas, dependencias habilitadas para las fases siguientes, y los criterios que sustentan el cierre funcional.
- `ROADMAP.md`: Fase 3 movida de "próxima fase" a "Fases completas" (ítem 10), con el mismo nivel de detalle que las Fases 1 y 2; deuda técnica acumulada actualizada para incluir la Fase 3 en la validación pendiente contra un proyecto Supabase real.
- Checkpoint de Git: tag `checkpoint-fase3-identidad-social`.

### Pendiente, no forma parte de esta fase
Ninguna Fase 4 (ni ninguna otra fase futura del `MASTERPLAN.md`) queda autorizada ni iniciada por este cierre. Las deudas técnicas registradas (Storage, verificación end-to-end contra Supabase real, gestión visual de `actor_managers`, retiro de `follows`, entre otras) permanecen como pendientes obligatorios antes de producción, documentadas en `PROJECT.md` y `ROADMAP.md`.

## 2026-07-18 — Fase 3, Bloque C, Entrega 7: búsqueda y descubrimiento de negocios

El objeto de esta entrega no vino dictado de antemano — se definió con un análisis de 18 puntos que propuso cerrar la deuda técnica más citada del Bloque C (desde la Entrega 2): sin descubrimiento/búsqueda de negocios conectado a ninguna pantalla, pese a que `actor_search_index` (Bloque A/B) ya existía completa y poblada.

### Ajustes de producto exigidos antes de implementar
- Búsqueda Actor-céntrica (`actor_types` como parámetro, no una función específica de negocios) para no rediseñar cuando se agreguen otros tipos de actor.
- Categorías rápidas de acceso directo en el estado inicial de `/buscar`, reutilizando la misma búsqueda existente — sin ranking ni recomendaciones.

### Agregado
- `supabase/migrations/0029_fase3_bloqueC_entrega7_busqueda_actores.sql`: `public.search_actors(search_query, category_filter, actor_types)` — filtra `status='aprobado'` dentro de la propia función (nunca confiado solo a RLS), category_filter exacto sobre `businesses.category`, sin ranking por popularidad ni personalización (reservado para la Fase 6).
- `src/lib/actorSearch.js`: `searchActors({query, category, types})`.
- `src/features/search/ActorResultCard.jsx`: tarjeta de negocio, mismo lenguaje visual que `PlaceCard`.
- `SearchPage.jsx`: extendida (misma ruta `/buscar`) — categorías rápidas antes de escribir; secciones "Lugares"/"Negocios" siempre separadas, cada una se dibuja solo si tiene resultados reales.

### Verificado
Migración contra Postgres 16 real como visitante anónimo: negocio aprobado encontrado por texto y por categoría; negocio pendiente nunca aparece aunque el nombre coincida exactamente; búsqueda por contenido de bio/descripción funciona; sin query ni categoría devuelve 0 filas; personas nunca aparecen filtrando por `types=['negocio']`. Playwright (6 escenarios): chips iniciales, secciones separadas, sección vacía no se renderiza, sin resultados con mensaje honesto, navegación a perfil. Regresión completa de las Entregas 1-6 (43 escenarios) sigue pasando — una falla puntual de temporización en un escenario de doble-toque de la Entrega 6 se confirmó como inestabilidad del entorno (repetición aislada limpia), no una regresión real. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 6 (seguimiento): documentar reconciliación como legacy

Recomendación de arquitectura aprobada al cerrar la Entrega 6: `reconcile_follows_to_interactions()` debe quedar documentada expresamente como herramienta de una sola ejecución, no una operación normal del sistema, para evitar que se reejecute sobre datos ya consolidados.

### Agregado
- `supabase/migrations/0028_fase3_bloqueC_entrega6_documentar_reconciliacion_legacy.sql`: `comment on function` — puramente documental, verificado contra Postgres 16 real, sin cambiar ninguna columna, política ni comportamiento.

## 2026-07-18 — Fase 3, Bloque C, Entrega 6: consolidación del seguimiento y experiencia social

Precedida por un análisis de 18 puntos que concluyó que esta entrega debía tratarse como consolidación de arquitectura/seguridad/experiencia, no como funcionalidad social nueva — la mayoría ya existía, solo para negocios.

### Bifurcación resuelta con aprobación explícita
`follows` (persona→persona, Fase 1) e `interactions` (cualquier actor, Entrega 2) eran dos sistemas de seguimiento desconectados. Se migró el seguimiento de personas a `interactions`, convirtiéndola en la única fuente de verdad futura; `follows` queda como legacy de solo respaldo (no se elimina en esta entrega).

### Agregado
- `supabase/migrations/0027_fase3_bloqueC_entrega6_seguimiento_unificado.sql`: reconciliación puntual `follows` → `interactions` (inserta drift faltante, elimina huérfanos persona→persona sin respaldo real); `reconcile_follows_to_interactions()` reutilizable (solo admin, únicamente copia hacia adelante); trigger `prevent_self_interaction` — bloquea a nivel de base de datos seguirte a ti mismo, seguir tu propio negocio, y guardarlo como propietario/administrador operativo.
- `src/hooks/useActorSocialState.js`: estado compartido entre `ActionBar`/`ActivityStrip` — contadores reactivos, optimista con reversión exacta, `busy` por acción, mensaje de error transitorio.
- `src/lib/interactions.js`: `listFollowedProfileIds`, `describeInteractionError`.
- `src/lib/actorProfile.js`: `getActorIdForProfile`.
- `ActionBar.jsx`/`ActivityStrip.jsx`: ahora también para actores persona (antes exclusivo de negocio); "Cómo llegar" abre `DirectionsSection` completo en vez de un enlace básico.
- `AboutSection.jsx`: teléfono/WhatsApp pasan a ser texto informativo (ya no duplican los botones de `ActionBar`).
- `FollowContext.jsx`: reescrito sobre `interactions`, misma forma pública — `AuthorTag.jsx` no necesitó ningún cambio.

### Eliminado
- `src/lib/follows.js` — sin más referencias (la tabla en la base de datos no se toca).

### Incidencia encontrada y corregida antes de cualquier commit
La primera versión de `reconcile_follows_to_interactions()` también eliminaba interacciones sin fila de `follows` correspondiente — correcto solo en el instante exacto de la migración, pero habría borrado seguimientos nuevos legítimos si se reejecutaba después del corte. Encontrado probando la función contra Postgres real con datos que reproducían el escenario; corregido dejando la eliminación de huérfanos únicamente en la reconciliación puntual (una sola vez, dentro de la migración), nunca en la función reutilizable.

### Verificado
Migración y trigger contra Postgres 16 real: seguir persona/negocio, autointeracción rechazada (uno mismo, negocio propio, negocio administrado), tercero sigue/deja de seguir, RLS impide suplantar o borrar interacciones ajenas, duplicado rechazado por `unique`, reversión real probada (trigger removido → auto-seguimiento posible → reaplicado). Playwright (10 escenarios + 1 de `AuthorTag`): contadores reactivos, botón oculto para autointeracción, "Cómo llegar" enriquecido, reversión ante error con mensaje, doble-toque una sola escritura, `AuthorTag` escribe en `interactions` nunca en `follows`. Regresión completa de las Entregas 1-5 (33 escenarios) sigue pasando. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 5: selector de perfil unificado

A partir de esta entrega, nueva metodología para el resto del proyecto: cada entrega futura se presenta primero como un análisis de 18 puntos (arquitectura, UX/UI, product design, auditoría técnica) antes de escribir código, cuestionando activamente el diseño previo — no solo confirmando la funcionalidad pedida.

Sin ninguna migración nueva — toda la seguridad (`actor_belongs_to_current_user`, `actor_managers`) ya existía desde el Bloque A.

### Bifurcación resuelta con aprobación explícita
El encargo original describía un selector agregado sobre `ProfilePage.jsx` (estética heredada de la Fase 1, inconsistente con el sistema editorial del Bloque C). Se propusieron dos opciones — agregarlo sin tocar la estructura, o unificar el perfil personal al mismo `/actor/:actorId` que ya usan los negocios, retirando `ProfilePage.jsx` — y una sub-pregunta sobre mover ajustes a `/ajustes`. El usuario aprobó la opción de unificación y `/ajustes`.

### Agregado
- `src/hooks/useMyActorId.js`: resuelve el `actor_id` persona del usuario autenticado.
- `src/lib/actorProfile.js`: `listMyManagedActors(profileId)` — negocios propios + administrados (activos), deduplicados y etiquetados por rol.
- `src/features/profile/ProfileSwitcherSheet.jsx`: hoja de selección — "Tú", cada negocio propio/administrado, "Registrar un negocio".
- `src/pages/SettingsPage.jsx` (reemplaza a `ProfilePage.jsx`): cuenta, intereses, guardados, push, admin, cerrar sesión — sin "Mis negocios" (reemplazada por el selector).
- `src/pages/MyProfileRedirectPage.jsx`: `/perfil` pasa a ser un punto de entrada estable que redirige a `/actor/:miActorId`.
- `ActorProfilePage.jsx`: íconos de selector (mi perfil o cualquier negocio editable) y ajustes (solo mi perfil de persona) en el encabezado.
- `BottomNav.jsx`: la pestaña "Perfil" apunta directamente a `/actor/:miActorId`.

### Eliminado
- `src/pages/ProfilePage.jsx` — sin más referencias en el código.

### Verificado
Build y lint limpios. Playwright: BottomNav y encabezado en mi propio perfil (selector + ajustes, sin lápiz); selector muestra "Tú"/negocio propio/negocio administrado/"Registrar un negocio"; clic en negocio administrado navega a su perfil; negocio propio visto como editor (lápiz + selector, sin ajustes); negocio de un tercero sin ninguno de los tres íconos; `/perfil` redirige a `/actor/:miActorId`; `/ajustes` sin "Mis negocios". Regresión completa de las Entregas 1-4 (26 escenarios) sigue pasando.

## 2026-07-18 — Fase 3, Bloque C, Entrega 4: edición de horarios y catálogo

### Agregado
- `supabase/migrations/0026_fase3_bloqueC_ocultar_coleccion.sql`: `business_catalog_collections.is_visible` + política pública ajustada (hallazgo presentado y aprobado antes de implementar).
- `src/lib/businessHours.js`: `replaceBusinessHours` (reemplazo completo del horario semanal), `findOverlappingIntervals` (validación previa, mismo criterio que el trigger de Postgres), CRUD de horarios especiales.
- `src/lib/catalog.js`: CRUD completo de colecciones e ítems para el editor, `moveItemsOutOfCollection` (decisión explícita antes de eliminar una colección con elementos).
- `src/features/profile/HoursEditor.jsx` (horario regular, guardado propio staged), `SpecialHoursEditor.jsx` (excepciones, inmediato), `CatalogEditor.jsx` + `CatalogItemSheet.jsx` (colecciones e ítems, inmediato).
- `ActorEditPage.jsx`: secciones "Horarios" y "Catálogo", exclusivas de negocios.

### Corrección encontrada durante esta entrega
`listBusinessCatalog` (Entrega 2, perfil público) no filtraba colecciones ocultas — solo ítems. Con `is_visible` recién agregado a las colecciones, un propietario viendo su propio perfil público habría visto sus colecciones ocultas. Corregido antes de cualquier commit.

### Verificado
Migración y RLS contra Postgres 16 real: propietario/administrador operativo activo pueden editar; administrador **revocado** pierde el acceso; tercero bloqueado; administrador de plataforma con acceso global; solapamiento de horarios rechazado por el trigger existente. Playwright: horario variado guardado, solapamiento rechazado antes de guardar, horario especial agregar/eliminar, catálogo vacío → crear colección → agregar ítem con precio "desde", ítem variable/agotado, eliminar colección con elementos → decisión explícita, tercero bloqueado. Regresión completa de las Entregas 1-3 (19 escenarios) sigue pasando. Build y lint limpios.

## 2026-07-18 — Fase 3, Bloque C, Entrega 3: edición del perfil

Sin ninguna migración nueva — toda la seguridad (propietario legal o administrador operativo activo, terceros bloqueados) ya existía desde el Bloque A; esta entrega es la primera vez que el frontend la usa para escribir.

### Agregado
- `src/lib/uploadValidation.js`: validación de tipo (jpeg/png/webp) y tamaño (máx. 5 MB) antes de subir.
- `src/lib/actorMedia.js`: alta/baja/reordenamiento de `actor_media`, límite de 12 fotos (decisión de producto).
- `src/lib/actorProfile.js`: `canEditActor`, `updateActorProfileDetails`.
- `src/components/ui/MediaUploader.jsx`: props opcionales `aspectRatio`/`round` + validación — sin romper los usos existentes (lugares/eventos).
- `src/features/profile/GalleryEditor.jsx`: galería con reordenamiento por flechas, cada acción se guarda de inmediato (a diferencia de logo/portada/bio).
- `src/pages/ActorEditPage.jsx` + ruta `/actor/:actorId/editar`: logo, portada, bio y galería con snapshot/dirty, estado de guardado, confirmación al salir, vista previa reutilizando `ActorProfileHeader`.
- `ActorProfilePage.jsx`: ícono de edición visible solo cuando `canEditActor()` es verdadero.

### No implementado a propósito
Editores de horarios y catálogo — quedan para la Entrega 4.

### Verificado
Build y lint limpios. Playwright con sesión autenticada real de supabase-js simulada (primera vez en este proyecto): tercero bloqueado, propietario/admin operativo con editor completo, dirty-tracking + guardado con `PATCH` correcto, confirmación al salir con cambios sin guardar, validación de tipo y tamaño rechazando archivos inválidos sin llamar a Storage, carga de logo válida, galería agregar/eliminar. Regresión de Feed/Explorar/Perfil y de los perfiles públicos de las Entregas 1-2 sin cambios de comportamiento.

## 2026-07-18 — Fase 3, Bloque C, Entrega 2: Centro del Negocio

Precedida por una propuesta de diseño funcional y visual aprobada explícitamente antes de escribir código (jerarquía, prioridad de acciones, organización de contenido, estrategia contra espacios vacíos, adaptabilidad por rubro, componentes, integraciones futuras).

### Agregado
- `src/lib/interactions.js`: contadores y toggle de seguir/guardar para cualquier actor, vía `interactions` (Fase 1, Bloque 4) — sin ninguna migración nueva.
- `src/lib/catalog.js`, `src/lib/businessHours.js`: catálogo agrupado por colección; horario semanal con días consecutivos agrupados.
- `src/lib/events.js`: `listBusinessEvents`. `src/lib/actorProfile.js`: `listActorMedia`.
- `src/features/profile/{ActivityStrip,ActionBar,CatalogSection,EventsShelf,GallerySection,AboutSection,GuideTeaser}.jsx`: cada uno se auto-consulta y no se monta sin datos reales.
- `ActorProfileHeader.jsx`: respaldo sin foto ahora teñido por categoría (antes color plano).

### Bifurcación resuelta sin migración
"Seguir" un negocio no tenía dónde escribir (`follows` solo admite personas). Se usó `interactions`, genérica desde la Fase 1 Bloque 4 pero nunca antes escrita por el frontend — `follows`/`saved_places` quedan intactos.

### No implementado a propósito
Historias, reels/publicaciones, promociones, "negocios similares" — sin tabla ni dato real todavía; reservados a nivel de diseño, no de código, siguiendo la misma regla de "sin contenido real, no se dibuja".

### Verificado
Build y lint limpios. Playwright (red interceptada): negocio completo (catálogo con 2 colecciones, evento, galería, 128/342 guardados-seguidores, horario agrupado); negocio disperso (ninguna sección de contenido se dibuja, actividad en 0 mostrada honestamente); visitante sin sesión tocando "Seguir" redirige a `/login`. Regresión de Feed/Explorar/Perfil sin excepciones.

### Limitación de entorno
Misma de la Entrega 1 (sin Docker/Supabase real) más: no fue posible simular una sesión autenticada real de supabase-js para probar "seguir/guardar" de extremo a extremo — verificado por código contra la RLS de `interactions` ya probada en la Fase 1.

## 2026-07-18 — Fase 3, Bloque C, Entrega 1: perfil público unificado

Primera entrega del Bloque C ("Centro del Negocio") y primera vez que la Fase 3 toca `src/`. Solo lectura.

### Agregado
- `supabase/migrations/0025_fase3_bloqueC_insignia_publica.sql`: `public.actor_verification_badge(actor_id)` — función pública y estrecha que calcula vigente/en_gracia/vencida/no_verificado sin exponer ninguna fila de `verifications` ni sus campos sensibles.
- `src/lib/actorProfile.js`, `src/lib/time.js` (formateador de hora en zona Cuenca): capa de datos del perfil público.
- `src/features/profile/{ActorProfileHeader,VerificationBadge,BusinessOpenStatus}.jsx`: tarjeta de identidad unificada (persona o negocio) — foto/portada/nombre/bio/categoría/insignia en vivo/estado abierto-cerrado/dirección y zona.
- `src/pages/ActorProfilePage.jsx` + ruta `/actor/:actorId` en `src/App.jsx`.
- `src/pages/ProfilePage.jsx`: "Mis negocios" enlaza al nuevo perfil público.

### Bifurcación de permisos resuelta antes de implementar
`verifications` es privada por diseño (Fase 2) — un visitante anónimo no podía calcular la insignia. Se presentaron 3 alternativas, se aprobó la función pública estrecha (opción recomendada).

### Verificado
- Migración 0025 contra Postgres 16 real: los 4 estados calculados correctamente; `anon` puede llamar la función pero sigue sin poder leer `verifications` directamente; reversión completa.
- Playwright (8 escenarios, red interceptada con datos que reproducen los estados verificados en Postgres): persona visitante, negocio vigente/en_gracia/vencido/no_verificado, horario nocturno, negocio cerrado con zona, usuario autenticado (mismo contenido que visitante — sin vista diferenciada por rol todavía).
- Regresión de Feed/Explorar/Perfil sin excepciones de JS; build y lint limpios.

### Limitación de entorno documentada
Sin Docker ni proyecto Supabase real disponibles en este sandbox, el Playwright valida el frontend contra red interceptada, no un flujo end-to-end contra Auth+PostgREST+RLS en vivo — deuda técnica obligatoria sumada a la ya existente de Fases 1-2.

## 2026-07-18 — Fase 3, Bloque B: horarios, catálogo y ubicación estructurada

Segundo bloque de la Fase 3 del `MASTERPLAN.md`. Aditivo sobre las Fases 1-2 y el Bloque A. Cero cambios en `src/`.

### Agregado
- `supabase/migrations/0024_fase3_bloqueB_horarios_catalogo_ubicacion.sql`: `business_hours` (horario regular, múltiples intervalos por día, turnos que cruzan medianoche, 24 horas, días cerrados, con validación de superposición vía trigger); `business_special_hours` (excepciones por fecha con prioridad absoluta sobre el horario regular); `business_open_status()` (función central en PostgreSQL, zona horaria `America/Guayaquil`, que calcula abierto ahora/próxima apertura/próximo cierre); `business_catalog_collections`/`business_catalog_items` (colecciones flexibles por negocio, sin taxonomía rígida por rubro); extensión de `refresh_actor_search_index()` para incluir el catálogo; `businesses.zone_id` (columna nueva, sin backfill — ver hallazgo abajo).

### Hallazgo documentado (no un defecto)
`businesses.zone_id` no pudo backfilearse: a diferencia de `places.area` (Bloque 4, Fase 1), `businesses` no tiene ningún campo de texto libre de zona, y `zones` no tiene geometría. Se agregó la columna vacía en vez de inventar una coincidencia débil.

### Dos incidencias encontradas y corregidas antes del commit
1. El cálculo de "abierto ahora" evaluaba el horario de hoy y de ayer con la misma lógica simétrica, causando que un negocio apareciera abierto un día que no tiene horario propio (por contaminación del día anterior) y que un turno nocturno pareciera abierto antes de empezar su propio turno. Corregido separando el cálculo en dos evaluaciones asimétricas explícitas.
2. "Próximo cierre" no capturaba el cierre de un turno nocturno en curso (consultado a la 01:00 dentro de un turno 20:00–02:00, reportaba el cierre del lunes siguiente en vez de las 02:00 de esa misma madrugada) — el bucle de eventos futuros no incluía el día anterior. Corregido extendiendo el bucle para incluir explícitamente el día anterior.

Ambas detectadas probando contra Postgres 16 real, ninguna llegó a un commit sin corregir.

### Verificado
- Las 24 migraciones aplicables contra Postgres 16 real, con datos de 5 rubros distintos (restaurante, barbería, ferretería, hotel, consultorio legal).
- Horario diurno, dos intervalos el mismo día, turno que cruza medianoche (con consulta a la 01:00), 24 horas, día cerrado, feriado que anula el horario regular, próxima apertura y próximo cierre — todos correctos tras las dos correcciones.
- Validaciones y triggers: solapamiento rechazado, formas inválidas del `check` rechazadas, colección de otro negocio rechazada, precio numérico con `price_type='variable'` rechazado.
- Búsqueda extendida al catálogo funcionando, con refresco automático en cada cambio.
- RLS con roles de bajo privilegio: dueño legal y administrador operativo gestionan correctamente; terceros bloqueados; intento de delegación por un administrador operativo rechazado; usuario anónimo lee negocio aprobado; administrador de plataforma con acceso global.
- Aislamiento de la Fase 2 reconfirmado: el administrador operativo, con permiso de tabla otorgado explícitamente, fue rechazado por RLS al intentar insertar en `verifications`.
- Reversión completa sin errores (incluida la restauración de `refresh_actor_search_index` a su versión del Bloque A); build y lint sin cambios; `src/` no tocado.

## 2026-07-18 — Fase 3, Bloque A: perfil unificado y administración

Primer bloque de la Fase 3 del `MASTERPLAN.md` (reformulada en tres bloques: A perfil unificado/administración, B información estructurada, C perfiles visibles/editables — "Centro del Negocio"). Aditivo sobre las Fases 1-2, sin tocar `verifications`/`actor_roles`.

### Agregado
- `supabase/migrations/0023_fase3_bloqueA_perfil_administracion.sql`: `actor_profile_details` (bio/logo/portada, 1:1 con cualquier actor, auto-creada por trigger); `actor_managers` (administración operativa delegable, distinta de `businesses.owner_id` — solo el propietario legal o un admin de plataforma agregan/revocan); `actor_media` (galería preparada); `actor_search_index` (búsqueda básica con `tsvector` nativo, sin motor externo). `public.actor_editable_by_current_user()` compone pertenencia legal + administración operativa — deliberadamente no usada en `verifications`.

### Cuatro ajustes de producto incorporados
"Centro del Negocio" (Bloque C futuro, estructura ya preparada colgando de `actor_id`); estructura multimedia preparada (`actor_media`, interfaz pendiente); búsqueda básica (`tsvector`, extensible en Bloque B con catálogo); colecciones flexibles de catálogo (aplica al Bloque B).

### Incidencia encontrada y corregida antes del commit
El trigger de auto-creación no copiaba `businesses.description` al `bio` de negocios nuevos (a diferencia del backfill, que sí lo hacía para los existentes) — detectado probando la creación de un negocio posterior a la migración, corregido antes de cualquier commit.

### Verificado
- Las 23 migraciones aplicables contra Postgres 16 real.
- Auto-creación con siembra correcta de `bio` tras la corrección.
- Búsqueda básica funcionando (encuentra por nombre/bio/categoría, se actualiza en cada edición).
- Administración operativa real: un administrador no propietario editó el perfil con éxito.
- Escalada de permisos rechazada (un administrador no puede agregar a otro); terceros ajenos bloqueados; revocación real con motivo verificada.
- Guard de tipo de actor (solo negocio/organizador pueden tener administradores).
- Aislamiento de la Fase 2 confirmado explícitamente: un administrador operativo activo no pudo insertar en `verifications` (rechazado por RLS, no por falta de permiso).
- Reversión completa sin errores; build y lint sin cambios; `src/` no tocado.

### Nota
`businesses.description` se verificó en el código real: se escribe una sola vez al registrar el negocio, sin ningún editor posterior — `actor_profile_details.bio` es la fuente de verdad desde ahora, la columna antigua queda como histórica hasta que una fase posterior confirme que puede retirarse.

## 2026-07-18 — FASE 2 CERRADA: verificación robusta y roles granulares

Cierre formal de la Fase 2 completa del `MASTERPLAN.md`, tras la aprobación de los dos bloques (esquema de verificación/roles, ciclo de vida/vigencia/renovación). Checkpoint de Git: tag `checkpoint-fase2-verificacion-roles`.

Completa en arquitectura, migraciones (`0020`-`0022`), RLS, lógica PostgreSQL, documentación y pruebas locales contra Postgres 16 real. **No lista para producción** hasta validar contra un proyecto Supabase real: `process-verification-lifecycle`, bucket y políticas de Storage reales, `CRON_SECRET`/variables de entorno, tarea programada de vencimiento, generación de URLs firmadas, flujo completo de carga/revisión de evidencias, limpieza de evidencias, interfaz de solicitud/revisión, y regresión extremo a extremo en un entorno desplegado — registrado como deuda técnica obligatoria en `PROJECT.md`.

Durante el Bloque B se encontraron y corrigieron tres defectos reales antes de cualquier commit, el más importante un defecto de pertenencia de Actor heredado del Bloque A — ninguno llegó a producción.

## 2026-07-17 — Fase 2, Bloque B: ciclo de vida, vigencia y renovación de verificaciones

Segundo bloque de la Fase 2 del `MASTERPLAN.md`. Periodo de gracia de 30 días (coherencia con el Bloque 5); bucket privado de evidencias construido en este bloque, un único archivo por solicitud.

### Agregado
- `supabase/migrations/0021_fase2_bloqueB_ciclo_vida_verificaciones.sql`: `public.actor_belongs_to_current_user(actor_id)` (corrige la pertenencia de Actor para negocio/organizador, ver más abajo); columnas nuevas en `verifications` (`revoked_by`/`revoked_at`, snapshots automáticos al aprobar); `verification_status_log`/`verification_notices`/`evidence_access_log`; trigger de protección de campos con guarda anti-autoaprobación incondicional; `vencido` solo alcanzable por el proceso automatizado.
- `supabase/migrations/0022_fase2_bloqueB_storage_evidencias.sql`: bucket privado `verification_evidence` (PDF/JPG/PNG, 10MB), un archivo por solicitud vía ruta fija. No verificable contra Postgres local (depende de `storage`, mismo motivo que `0002_storage.sql`).
- `supabase/functions/process-verification-lifecycle`: avisos (reutilizando `send-push`) + vencimiento automático, protegida con `CRON_SECRET`, independiente de `process-account-deletions`.

### Tres defectos encontrados y corregidos durante la implementación (antes de cualquier commit)
1. **Pertenencia de Actor rota para negocio/organizador** (defecto del Bloque A): las políticas comparaban solo `actors.profile_id`, que siempre es `NULL` para un actor negocio/organizador — bloqueaba el caso central de este bloque. Se detuvo la implementación y se pidió aprobación explícita antes de corregir, por tratarse de políticas ya aprobadas y enviadas. Corregido con una función reutilizable que cubre los cuatro casos (persona, negocio/organizador, sistema, negocio sin propietario).
2. **Auto-aprobación posible para un admin dueño de un negocio**: al corregir el punto 1, se descubrió que en PostgreSQL las cláusulas `WITH CHECK` de todas las políticas permisivas de `UPDATE` se combinan con `OR` sin importar cuál política autorizó — el `WITH CHECK` laxo de la política de administradores podía rescatar una actualización entrada por la política del propio actor. Corregido con una guarda incondicional en el trigger, inmune a la interacción entre políticas.
3. **Auditoría de revocación atribuida al admin equivocado**: el trigger de auditoría tomaba `reviewed_by` (de la aprobación original) en vez de `revoked_by` (quien realmente revocó). Corregido para usar el campo correcto según el tipo de transición.

### Verificado
- Las 21 migraciones aplicables (`0001`-`0021`) contra Postgres 16 real, con un administrador que también es dueño de un negocio (deliberado, para probar el caso crítico).
- Los seis escenarios de pertenencia pedidos, todos correctos tras la corrección.
- Ciclo completo real: solicitud, evidencia, revisión, aprobación con snapshot automático.
- Auto-aprobación rechazada en el caso crítico (admin dueño de su propio negocio); un segundo admin sí pudo aprobar.
- `vencido` inalcanzable por RLS normal; `expires_at` protegido de cambios aislados.
- Periodo de gracia de 30 días probado con dos casos reales (dentro y fuera de gracia), simulando el rol de servicio.
- Auditoría exacta tras la corrección del defecto 3.
- `verification_notices` idempotente; reversión completa sin errores; build/lint sin cambios, `src/` no tocado.

## 2026-07-17 — Fase 2, Bloque A: esquema de verificación y roles granulares

Primer bloque de la Fase 2 del `MASTERPLAN.md`. Aditivo y deliberadamente invisible: `profiles.is_admin`/`public.is_admin()` permanecen exactamente iguales, ninguna política RLS existente se toca.

### Agregado
- `supabase/migrations/0020_fase2_bloqueA_verificacion_roles.sql`: `roles` (catálogo, agregar un rol nuevo es un `INSERT`), `actor_roles` (asignación many-to-many sobre `Actor`, nunca se borra una fila — se revoca con `revoked_at`), `verifications` (asociada a `Actor`, no a `businesses`; evidencia solo referenciada, nunca almacenada en la tabla), `role_audit_log` (poblada únicamente por trigger). Trigger que impide asignar un rol o verificación a un actor tipo `sistema`. RLS que impide que cualquiera —incluido un administrador real— apruebe su propia verificación. Backfill: administradores actuales → rol `administrador`; negocios aprobados → verificación `aprobado` con un año de vigencia (`origin='migracion'` en ambos casos).
- `AI_PHILOSOPHY.md`: la Guía IA distingue tres estados de confianza (verificado/vencido/no verificado, nunca el criterio principal de recomendación, solo desempate); documentada la visión futura de cuentas oficiales institucionales vía verificación de Actor, sin privilegios administrativos adicionales.

### Verificado
- Las 20 migraciones (`0001`-`0020`) contra Postgres 16 real, con 2 administradores, 2 usuarios normales, 1 negocio aprobado y 1 pendiente.
- Reconciliación exacta del backfill; tablas existentes completamente intactas.
- Escalada de privilegios rechazada (auto-asignación y asignación a terceros por un no-admin); asignación y revocación reales por un admin, con auditoría automática y motivo conservado.
- Ningún actor tipo `sistema` puede recibir rol ni verificación.
- Auto-aprobación de verificación rechazada incluso para un administrador real sobre su propia verificación; un segundo administrador sí pudo aprobarla.
- `role_audit_log` visible solo para administradores.
- Reversión completa ejecutada de verdad, sin errores (a diferencia del Bloque 5, no toca ninguna restricción de tabla existente).
- Build y lint sin cambios; `git status` confirma que `src/` no fue tocado.

### Nota
Análisis técnico previo completo (comparación de tres modelos de roles, matriz de permisos por módulo, justificación de Actor sobre Business para verificación, alcance de Editor/Curador vs. Moderador) presentado y aprobado antes de escribir la migración — incluida la decisión de no crear un rol "Partner"/"Institución" nuevo, resuelto en cambio con un futuro valor de `verification_type`.

## 2026-07-17 — FASE 1 CERRADA: ecosistema social, modelo de datos fundacional

Cierre formal de la Fase 1 completa del `MASTERPLAN.md`, tras la aprobación de los cinco bloques (esquema, identidad, contenido, interacciones y territorio, privacidad). Checkpoint de Git: tag `checkpoint-fase1-ecosistema-social`.

Completa en arquitectura, migraciones (`0015`-`0019`), restricciones, RLS, lógica PostgreSQL, documentación y pruebas locales contra Postgres 16 real. **No lista para producción** hasta validar contra un proyecto Supabase real: `export-user-data`, `process-account-deletions`, autenticación JWT real, `auth.admin.deleteUser`, variables de entorno/secretos, permisos de las Edge Functions, ejecución programada del periodo de gracia, eliminación real de archivos en Storage, exportación completa de datos reales, y el flujo extremo a extremo de solicitud/cancelación/eliminación — registrado como deuda técnica obligatoria, no como mejora opcional, en `PROJECT.md`.

Queda documentado expresamente: una eliminación definitiva es irreversible; no existe restauración completa tras anonimizar/borrar datos personales; la futura interfaz de eliminación debe comunicar esto al usuario; los QR deberán invalidarse cuando esa entidad exista (Fase 9); los archivos de Storage requieren un flujo de borrado explícito antes de producción.

## 2026-07-17 — Fase 1, Bloque 5: privacidad (consentimiento, exportación y eliminación de cuenta)

Quinto y último bloque de la Fase 1 del `MASTERPLAN.md`. A diferencia de los Bloques 1-4, introduce comportamiento real — es su propósito explícito: activar el mecanismo de `consent_records`, que se adelantó vacío desde el Bloque 1.

### Agregado
- `supabase/migrations/0019_bloque5_privacidad.sql`: `consent_records` gana consentimiento versionado (`consent_key`/`document_version`, retirable sin borrar historial) y pierde su FK hacia `auth.users` para sobrevivir a la eliminación de la cuenta; `data_requests` (tabla nueva) como flujo de trabajo independiente del log de consentimiento; `questions`/`answers`/`statuses`/`event_comments.author_id` pasan de `cascade` a `set null` (anonimización, el contenido colaborativo sobrevive); `businesses.owner_id` pasa a `set null` con un trigger que fuerza `status = 'sin_propietario'` cuando el dueño desaparece, sin bloquear la eliminación ni borrar el negocio.
- `supabase/functions/export-user-data`: el usuario autenticado obtiene sus propios datos en JSON, derivando su identidad del token de sesión — nunca de un `userId` de parámetro.
- `supabase/functions/process-account-deletions`: procesa (protegida por un secreto compartido) las solicitudes de eliminación cuyo periodo de gracia de 30 días venció, invocando `auth.admin.deleteUser`.
- `AI_PHILOSOPHY.md`: nuevo Principio no negociable 11 — la Guía IA nunca comparte información privada entre usuarios ni usa una conversación privada de una persona para responderle a otra.

### Hallazgos críticos encontrados en el análisis previo (resueltos antes de implementar)
1. `answers.question_id` cascadeaba desde `questions` — borrar la cuenta de quien preguntó habría borrado también las respuestas de terceros.
2. `consent_records.user_id` cascadeaba desde `auth.users` — habría destruido la evidencia de consentimiento/eliminación justo cuando más se necesita.

### Decisiones de producto (cuatro bifurcaciones aprobadas)
Periodo de gracia de 30 días cancelable; anonimizar autores de contenido colaborativo en vez de borrarlo; conservar `consent_records`/`data_requests` sin cascada; negocios sin propietaria pasan a `sin_propietario` (no se bloquea la eliminación, no se borra el negocio, un admin reasigna después).

### Verificado
- Postgres 16 real, las 19 migraciones en orden, con datos de prueba reales (una pregunta con respuesta ajena, un negocio aprobado, tres usuarios).
- Consentimiento versionado con retiro: historial completo conservado, estado vigente = fila más reciente.
- RLS de `data_requests` con roles de bajo privilegio: cada usuario ve y cancela solo lo suyo.
- Eliminación definitiva simulada de verdad (borrado real del `auth.users` de prueba): perfil/actor cascadearon; el negocio quedó `sin_propietario` con `owner_id` NULL (trigger verificado); la pregunta sobrevivió anonimizada; la respuesta ajena sobrevivió intacta (Hallazgo 1 resuelto); `consent_records`/`data_requests` sobrevivieron completos (Hallazgo 2 resuelto).
- RLS del negocio huérfano: invisible para un usuario normal, visible y reasignable por un admin.
- Reversión probada en dos escenarios: limpia sin errores contra una base sin eliminaciones reales; falla exactamente donde se esperaba (`author_id` ya no admite `not null`) contra un estado que ya procesó una eliminación real — límite genuino, no un defecto.
- Build y lint sin cambios; `git status` confirma que `src/` no fue tocado.

### Nota de verificación honesta
Las dos Edge Functions no pudieron probarse contra un proyecto Supabase real en este entorno (sin proyecto desplegado ni API de administración de Auth disponible) — a diferencia de la migración SQL, que sí tiene el mismo nivel de prueba real que los Bloques 1-4. Recomendado verificarlas end-to-end antes de producción.

### Deuda técnica
Sin interfaz de usuario todavía para consentimiento/exportación/eliminación desde la app; sin mecanismo de disparo temporal (`pg_cron` u otro) configurado para `process-account-deletions`; sin transferencia de propiedad de negocio de autoservicio; invalidación de QR documentada como requisito para cuando esa entidad exista (no existe hoy); rectificación de datos fuera de alcance.

## 2026-07-17 — Fase 1, Bloque 4: interacciones y territorio (post_likes/saved_places/saved_events/follows → interactions, places.area → zones)

Cuarto bloque de la Fase 1 del `MASTERPLAN.md`. Precedido por un análisis previo formal (aprobado antes de escribir código) que investigó los lectores/escritores reales del frontend y encontró un hallazgo de privacidad relevante, resuelto antes de implementar.

### Agregado
- `supabase/migrations/0018_bloque4_interacciones_territorio.sql` (nuevo): backfill de `post_likes` (→ `me_gusta`), `saved_places`/`saved_events` (→ `guardado`) y `follows` (→ `seguimiento`, hacia el Actor del perfil seguido) en `interactions`; `places.zone_id` (columna nueva) poblada únicamente donde `places.area` coincide exactamente con una `zones.name` existente. Reemplaza la política de lectura pública de `interactions` por una que excluye el tipo `guardado`.

### Decisión de privacidad
Se encontró que la política pública heredada de `interactions` (Bloque 1) habría hecho públicos los guardados al migrarlos, cuando `saved_places`/`saved_events` son privados hoy. Se presentó como bifurcación y se aprobó: los guardados son visibles solo para su dueño o para un administrador (uso justificado caso por caso, sin tabla de auditoría en este bloque — ver nota de alcance en `PROJECT.md`).

### Verificado
- Las 18 migraciones (`0001`-`0018`) ejecutadas contra un Postgres 16 real, con datos de prueba incluyendo un lugar con zona deliberadamente no coincidente (caso límite).
- Reconciliación exacta de conteos (10 interacciones) y comparación campo por campo (`diff`) contra las tablas de origen para los cuatro mapeos.
- `places.zone_id`: 10/11 lugares resueltos; el caso no coincidente quedó en NULL, sin corrección silenciosa.
- `events.likes_count` coincide exactamente con el conteo real en `interactions` para los 5 eventos.
- Idempotencia de la lógica de datos confirmada (reejecutar inserta/actualiza 0 filas).
- RLS de privacidad de "guardado" probada con roles de bajo privilegio reales: cada usuario ve solo lo suyo, las interacciones públicas siguen visibles para todos, y un admin ve todos los guardados.
- Un actor no puede crear ni borrar interacciones de otro actor (verificado con intentos reales rechazados por RLS).
- Tablas de origen completamente intactas (conteos y `diff` idénticos antes/después).
- Estrategia de reversión ejecutada de verdad, restaura el estado exacto previo.
- Build y lint del frontend sin cambios; `git status` confirma que solo se agregó el archivo de migración.

### Nota
Queda como condición obligatoria (impuesta antes de este bloque y ya extendida por simetría a `event_details`): ninguna parte de la aplicación puede empezar a leer `interactions` o `places.zone_id` sin una fase separada de reconciliación final, cambio controlado de fuente de verdad, actualización del frontend, pruebas de regresión, periodo de convivencia, reversión disponible y retiro posterior de las estructuras antiguas.

## 2026-07-17 — Fase 1, Bloque 3: contenido (separa datos de eventos hacia event_details)

Tercer bloque de la Fase 1 del `MASTERPLAN.md`: primer caso real de datos fluyendo por el patrón "núcleo genérico + tabla de detalle" de Publicación. Sin cambio de comportamiento visible para el usuario.

### Agregado
- `supabase/migrations/0017_bloque3_contenido.sql` (nuevo): copia `start_at`/`end_at`/`price`/`ticket_url`/`organizer` de cada `event` existente hacia `event_details` (backfill, protegido con `where not exists`). `events` conserva todas sus columnas intactas — separación deliberadamente aditiva, no física.

### Verificado
- Las 17 migraciones (`0001`-`0017`) ejecutadas contra un Postgres 16 real, con 6 eventos de prueba incluyendo el caso límite `end_at IS NULL` + `organizer` distinto de nulo.
- Copia exacta campo por campo, verificada con `diff` contra una foto de `events` capturada antes de migrar — coincidencia total en las 6 filas.
- `events` queda byte a byte idéntica antes/después (mismo `diff`, cero diferencias).
- Idempotencia confirmada: reaplicar la migración inserta 0 filas nuevas.
- RLS de `event_details` sigue cascadeando correctamente la visibilidad de `events` (probado con un rol de bajo privilegio real): el detalle de un evento en `borrador` queda oculto, igual que el propio evento.
- Estrategia de reversión ejecutada de verdad: `delete from event_details` restaura la tabla vacía sin tocar `events`.
- Build y lint del frontend sin cambios; `git status` confirma que solo se agregó el archivo de migración.

### Nota
Dos bifurcaciones arquitectónicas se presentaron y resolvieron antes de escribir la migración (detalle completo en `PROJECT.md`): (1) separación aditiva vs. física — se optó por aditiva, para no romper el código de la aplicación que hoy lee/escribe directamente `events`; (2) fotografía puntual vs. sincronización en vivo — se optó por fotografía puntual, igual criterio que `actors.display_name` en el Bloque 2, para no agregar costo de escritura permanente a la tabla de mayor tráfico del sistema por sincronizar un dato que nada lee todavía. Ambas quedan como deuda técnica documentada (no urgente) a resolver el día que una fase futura conecte código de verdad a `event_details`.

## 2026-07-17 — Fase 1, Bloque 2: identidad (vincula profiles/businesses con actors)

Segundo bloque de la Fase 1 del `MASTERPLAN.md`, con alcance estrictamente acotado a vincular identidad — sin tocar events, interacciones, zonas, privacidad ni la interfaz.

### Agregado
- `supabase/migrations/0016_bloque2_identidad.sql` (nuevo): backfill de un actor `persona` por cada `profile` existente y uno `negocio` por cada `business` existente; dos triggers `security definer` (`on_profile_created_actor`, `on_business_created_actor`) que crean el actor correspondiente para cada perfil/negocio nuevo de ahora en adelante, con el mismo patrón que `handle_new_user`.

### Verificado
- Las 16 migraciones (`0001`-`0016`) ejecutadas contra un Postgres 16 real, con datos de prueba incluyendo el caso límite de un perfil sin `username`.
- Conteos idénticos antes/después en `profiles` y `businesses` — cero filas tocadas.
- Reconciliación exacta: cero perfiles/negocios sin actor, cero con más de uno.
- Los triggers probados con inserciones reales nuevas (un signup simulado y un registro de negocio bajo RLS real con un rol de bajo privilegio, no como superusuario), confirmando que funcionan incluso sin permiso directo de ese rol sobre `actors`.
- Estrategia de reversión ejecutada de verdad (no solo descrita): `drop trigger`/`drop function` + borrar las filas `persona`/`negocio` de `actors` restaura exactamente el estado previo al bloque.
- Build y lint del frontend sin cambios.

### Nota
Decisión de alcance documentada con transparencia en `PROJECT.md`: se agregaron los dos triggers (además del backfill pedido explícitamente) para que "una correspondencia verificable" sea una garantía permanente, no solo válida en el instante de la migración — señalado como una interpretación, no como algo pedido literalmente palabra por palabra. `actors.display_name` es una fotografía del momento de creación, sin sincronización posterior — limitación conocida y documentada, sin efecto visible hoy porque ningún código de la aplicación lee todavía esa columna.

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
