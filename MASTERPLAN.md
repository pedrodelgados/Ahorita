# Ahorita — Plan Maestro de Desarrollo

**Documento de planificación. Nivel: CTO / Arquitecto Principal / Product Manager. No contiene código, migraciones ni implementación.**

Este documento convierte `ARCHITECTURE.md` (visión y arquitectura del ecosistema, ya aprobado) en un plan de ejecución accionable: fases de desarrollo concretas, en orden, con sus dependencias, sus tablas, sus riesgos y su criterio de éxito. **A partir de la aprobación de este documento, este es el único roadmap oficial de desarrollo de Ahorita** — sustituye a la sección "Próxima fase" de `ROADMAP.md`, que pasa a apuntar aquí.

Relación con los demás documentos: `ARCHITECTURE.md` responde *qué es Ahorita y por qué*; este documento responde *en qué orden se construye y con qué criterio se sabe que cada pieza está lista*; `PROJECT.md` seguirá registrando, fase por fase, lo que realmente se construyó; `CHANGELOG.md` seguirá el detalle de cada cambio. Ninguna fase aquí descrita se implementa hasta que se apruebe explícitamente, exactamente como se hizo con la fase de administración de eventos y lugares.

---

## Cómo leer este documento

Cada fase se describe con doce campos fijos, en este orden: Objetivo, Problema que resuelve, Módulos que incluye, De qué depende, Qué bloquea hasta completarse, Tablas nuevas, Entidades nuevas, APIs externas necesarias, Migraciones que requiere, Riesgos, Pruebas necesarias, Criterio de terminado (Definition of Done).

Las fases no son de tamaño arbitrario ni están numeradas por capricho: **cada fase deja el producto en un estado estable y funcional**, aunque no todas sean visibles para el usuario final de la misma manera — algunas (como la Fase 1) son invisibles desde afuera pero indispensables por dentro, y eso se declara explícitamente en vez de forzar una funcionalidad de cara al usuario donde no corresponde.

Nota sobre una decisión de reordenamiento respecto a `ARCHITECTURE.md` §60: aquella sección proponía ocho fases (A-H) a alto nivel. Este plan las **divide en trece fases más granulares** y **separa la integración de movilidad (Azu Taxi) de la fase de comercio**, por dos razones concretas: (1) cada fase debe tener un criterio de terminado verificable en semanas, no en meses — una fase que mezcla "verificación de negocios" con "roles granulares" y "modelo de datos" a la vez es demasiado grande para tener un solo punto de rollback seguro; y (2) Azu Taxi no comparte ninguna dependencia real con reservas/pagos/entradas (es una integración de solo lectura de ubicación hacia un socio externo), así que forzarla dentro de la misma fase que el manejo de dinero real le hereda un riesgo regulatorio que no le corresponde. Ambos cambios se justifican con más detalle en sus fases respectivas.

---

## Fase 0 — Línea base (ya completada, no se planifica aquí)

Para que las dependencias de las fases siguientes sean legibles, se enumera lo que ya existe y sobre lo cual se construye todo lo demás: identidad básica de usuario (`profiles`), catálogo de categorías (`channels`), lugares (`places`), negocios con aprobación binaria (`businesses`), preguntas/respuestas/estados en vivo, likes genéricos (`post_likes`), guardados de lugares y eventos, seguir personas (`follows`), notificaciones push reales, eventos con administración completa (crear/editar/duplicar/ocultar/eliminar, estados de guardado, ciclo de vida editorial, `editor_pick`), y la Guía IA v1 (función de borde sobre la API de Claude, sin memoria de sesión). Ver `PROJECT.md` para el detalle completo de cómo se construyó cada pieza.

---

## Fase 1 — Unificación del modelo de datos fundacional

**Objetivo.** Introducir las cuatro abstracciones de `ARCHITECTURE.md` §9-11 — Actor, Publicación, Interacción, Ciudad — como estructura real de base de datos, sin cambiar en absoluto el comportamiento visible de la aplicación para el usuario final.

**Problema que resuelve.** Cada fase social nueva que se construya sobre la estructura actual (tablas separadas por tipo de contenido y por tipo de interacción) agrega deuda técnica de forma exponencial: hoy ya existen `saved_places` y `saved_events` como tablas paralelas para lo que conceptualmente es la misma acción ("guardar"); sin esta fase, mañana existirían también `saved_promotions`, `saved_posts`, y comentarios duplicados por cada tipo de contenido nuevo. Resolverlo ahora, con relativamente poco contenido y tráfico, es mucho más barato que resolverlo después.

**Módulos que incluye.** Modelo Actor (unifica identidad de persona y negocio). Modelo Publicación (generaliza eventos como su primer subtipo real, deja la estructura lista para publicaciones/promociones/historias). Modelo Interacción (generaliza likes, guardados, comentarios y seguimiento bajo un esquema polimórfico consistente, extendiendo el patrón que `post_likes` ya demuestra parcialmente). Entidad Ciudad (dimensión de escopo geográfico, poblada con un único valor: Cuenca).

**De qué depende.** De nada dentro de esta nueva etapa — se apoya únicamente en la Fase 0 ya construida. Es, por diseño, la primera fase posible.

**Qué bloquea hasta completarse.** Fase 2 (Verificación debe referenciar Actor, no `businesses` directamente), Fase 3 (perfiles sociales unificados), Fase 4 (contenido social ampliado), Fase 5 (interacción social generalizada) — en la práctica, casi todo el resto del plan depende de esta fase, que es exactamente su propósito.

**Tablas nuevas.** `cities` (ciudad, con límites geográficos aproximados). `actors` (identidad unificada, referenciada por `profiles` y `businesses`). `interactions` (tabla polimórfica: tipo de interacción, actor que interactúa, tipo y id del objetivo — generaliza `post_likes`/`saved_places`/`saved_events`/`follows`).

**Entidades nuevas.** Actor, Ciudad, Interacción unificada.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Migración de esquema que agrega `actors`/`cities`/`interactions` y adapta `profiles`/`businesses` para referenciar `actors`. Migración de datos que traslada las filas existentes de `post_likes`, `saved_places`, `saved_events` y `follows` hacia `interactions`, preservando cada fila (nunca se borra el historial durante la migración — las tablas viejas se retiran solo después de verificar conteos idénticos). Migración que puebla `cities` con una fila ("Cuenca") y asocia todas las filas existentes de `places`/`events`/`businesses` a ella.

**Riesgos.** Es una migración de datos sobre información real de usuarios activos (likes, guardados, seguimientos ya existentes) — el riesgo central es pérdida o corrupción silenciosa de ese historial durante la migración. Mitigación: nunca eliminar una tabla vieja hasta confirmar conteos exactos antes/después, y ejecutar en una ventana de mantenimiento corta con respaldo verificado.

**Pruebas necesarias.** Conteo exacto de filas migradas por tipo de interacción (los likes de ayer deben seguir siendo exactamente los mismos likes hoy). Regresión completa de toda la funcionalidad existente — el usuario final no debe notar ningún cambio. Prueba de carga sobre la nueva tabla `interactions` con un volumen simulado varias veces mayor al actual, para confirmar que la generalización no introduce un cuello de botella de rendimiento.

**Criterio de terminado.** Toda la funcionalidad existente (feed, likes, guardados, seguir, comentarios de eventos) funciona de forma idéntica para el usuario final sin ningún cambio visible; el equipo de desarrollo puede confirmar, con un caso de prueba concreto, que agregar "seguir un negocio" o "comentar una promoción" en una fase futura no requiere crear una tabla nueva.

---

## Fase 2 — Verificación robusta y roles granulares

**Objetivo.** Formalizar la Verificación de negocios/organizadores como un proceso con estados, evidencia y vigencia (`ARCHITECTURE.md` §15), y separar el rol Editor/Curador del rol Administrador (§5).

**Problema que resuelve.** La aprobación de negocios hoy es un campo booleano sin evidencia adjunta, sin fecha de vencimiento y sin motivo de rechazo registrado — funcional para un puñado de negocios revisados a mano por una sola persona, pero no sostiene la confianza (el activo central del producto, principio (b) de `ARCHITECTURE.md`) a medida que el volumen crece y el equipo de curaduría deja de ser una sola persona.

**Módulos que incluye.** Sistema de Verificación con estados (`pendiente`/`en_revision`/`aprobado`/`rechazado`/`vencido`/`revocado`). Roles y permisos granulares (visitante/usuario/editor-curador/administrador/super-administrador, reemplazando el booleano `is_admin` actual). Extensión del panel de administración con una bandeja de trabajo de verificaciones pendientes.

**De qué depende.** Fase 1 — la Verificación debe referenciar el Actor unificado, no la tabla `businesses` en su forma actual.

**Qué bloquea hasta completarse.** Fase 3 (el perfil de negocio necesita mostrar un estado de verificación real, no un booleano), Fase 4 (solo Actores verificados deberían poder publicar Promociones), Fase 9 (check-in y promociones QR solo tienen sentido pleno sobre negocios ya verificados).

**Tablas nuevas.** `verifications` (actor solicitante, tipo de evidencia, estado, revisor, fecha de vigencia y de vencimiento, motivo si aplica). Extensión de `profiles` (o tabla `roles` dedicada) con un rol enumerado en vez del booleano actual.

**Entidades nuevas.** Verificación (con ciclo de vida propio), Rol granular.

**APIs externas necesarias.** Ninguna obligatoria — la evidencia se sube como archivo reutilizando el almacenamiento ya existente. Opcional a evaluar más adelante: un servicio de verificación automatizada de identidad/documento, no requerido para el mínimo viable de esta fase.

**Migraciones que requerirá.** Migración que crea `verifications` y traslada el estado actual de cada negocio (`pendiente`/`aprobado`) a una fila inicial de verificación, sin perder el historial de cuándo se aprobó. Migración que traslada `profiles.is_admin` al nuevo esquema de roles, preservando exactamente quién es administrador hoy.

**Riesgos.** Cambiar el modelo de permisos es sensible por naturaleza: un error puede dejar a un administrador real sin acceso, o dar de más a alguien. Mitigación: mantener el campo viejo (`is_admin`) en modo de solo lectura durante un periodo de convivencia, validando de forma cruzada contra el nuevo esquema de roles antes de retirarlo definitivamente.

**Pruebas necesarias.** Pruebas de autorización exhaustivas por cada rol (qué puede y no puede hacer cada uno, incluyendo casos negativos). Simulación del flujo completo de verificación de principio a fin (solicitud → evidencia → aprobación o rechazo con motivo → vigencia → vencimiento → renovación). Auditoría posterior a la migración: ningún negocio ya aprobado pierde su estado de aprobación.

**Criterio de terminado.** Todo negocio existente conserva su estado sin interrupción de servicio; el equipo puede asignar el rol Editor/Curador a alguien sin otorgarle control total del sistema; existe una cola visible y priorizable de verificaciones pendientes con evidencia adjunta.

---

## Fase 3 — Identidad social plena (perfiles y negocio extendido)

**Objetivo.** Extender el perfil personal y el perfil de negocio según `ARCHITECTURE.md` §26-28: bloques comunes de identidad/actividad/relaciones/reputación para cualquier Actor, catálogo básico y horario visible en el perfil de negocio, y una relación explícita de "persona administra negocio" que permita gestionar ambos desde una sola sesión.

**Problema que resuelve.** El perfil personal y la ficha de un negocio (hoy incrustada dentro de lugares/eventos) son experiencias completamente distintas sin ninguna estructura compartida; y no existe manera de que una persona registrada administre un negocio sin una cuenta separada.

**Módulos que incluye.** Arquitectura de perfil unificado. Arquitectura del negocio (catálogo, horario, insignia de verificación siempre visible). Arquitectura del perfil personal (intereses, contenido guardado, negocios administrados). Relación Actor-administra-Negocio.

**De qué depende.** Fase 1 (Actor unificado) y Fase 2 (estado de verificación real que mostrar).

**Qué bloquea hasta completarse.** Fase 5 (seguir un negocio requiere que exista un perfil de negocio real, no solo una ficha dentro de un lugar), Fase 6 (analíticas de negocio necesitan el concepto de "vistas de mi perfil" que nace aquí).

**Tablas nuevas.** `actor_managers` (relación persona↔negocio administrado, con posibilidad futura de más de un administrador por negocio).

**Entidades nuevas.** Relación de administración de negocio.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Creación de `actor_managers`; ninguna migración destructiva sobre datos existentes.

**Riesgos.** Riesgo técnico bajo — es mayormente construcción sobre datos ya unificados en la Fase 1. El riesgo real es de alcance: la tentación de incluir analíticas avanzadas de negocio aquí quitándole foco a la Fase 6, donde en realidad corresponden.

**Pruebas necesarias.** Una persona administra más de un negocio y cambia de contexto sin cerrar sesión. El estado de verificación se muestra correctamente y de forma inseparable del contenido en el perfil público.

**Criterio de terminado.** Todo perfil (personal o de negocio) se renderiza desde la misma estructura de datos común; un negocio ya verificado muestra su insignia de verificación de forma consistente en cualquier lugar donde aparezca su perfil.

---

## Fase 4 — Contenido social ampliado (Publicaciones y Promociones)

**Objetivo.** Implementar Publicación regular y Promoción como subtipos de la Publicación unificada, reutilizando el editor progresivo de secciones ya construido y probado para eventos.

**Problema que resuelve.** Hoy solo los eventos pueden publicarse desde el panel de administración — un negocio no tiene forma de compartir una novedad sin fecha de inicio obligatoria, ni de anunciar una promoción con una condición de canje concreta.

**Módulos que incluye.** Sistema de publicaciones (§16). Sistema de promociones (§17), incluyendo su condición de canje y mecanismo de validación previsto (manual o QR, este último construido en la Fase 9).

**De qué depende.** Fase 1 (la Publicación unificada debe existir antes de agregarle subtipos), Fase 2 (solo Actores verificados u organizadores aprobados deberían poder publicar), Fase 3 (se publica desde el perfil de negocio ya extendido).

**Qué bloquea hasta completarse.** Fase 5 (probar comentarios/guardados generalizados necesita más de un tipo de contenido real sobre el cual probarlos), Fase 9 (promociones mediante QR necesita que el subtipo Promoción ya exista).

**Tablas nuevas.** Ninguna tabla nueva de fondo si la Fase 1 se ejecutó correctamente — Publicación y Promoción son filas de la misma tabla de Publicación con un campo de subtipo. Se añade `promotion_details` como tabla auxiliar (condición de canje, mecanismo de validación) para no ensuciar la tabla genérica con campos que solo aplican a un subtipo.

**Entidades nuevas.** Publicación regular y Promoción (subtipos), Detalle de promoción.

**APIs externas necesarias.** Ninguna en esta fase — el canje físico vía QR se construye en la Fase 9.

**Migraciones que requerirá.** Agregar el campo de subtipo a la tabla de Publicación unificada; crear `promotion_details`.

**Riesgos.** Sobrecargar el editor progresivo con demasiadas variantes de campos por subtipo puede degradar la experiencia ya pulida construida para eventos. Mitigación: diseñar el formulario por composición de secciones comunes más secciones específicas del subtipo, no por condicionales anidados difíciles de mantener a largo plazo.

**Pruebas necesarias.** Crear, editar y publicar cada subtipo de principio a fin. Verificar que el feed y la vista previa en vivo (ya construida para eventos) muestran correctamente cada subtipo con su propio tratamiento visual.

**Criterio de terminado.** Un negocio verificado puede publicar una Publicación regular y una Promoción con condición de canje desde el panel, con el mismo nivel de pulido (estados de guardado, confirmación al salir, vista previa real) ya alcanzado para eventos.

---

## Fase 5 — Interacción social plena

**Objetivo.** Generalizar comentarios y guardados a cualquier Publicación, no solo eventos, y evaluar/implementar un conjunto acotado de reacciones con significado hiperlocal más allá de "me gusta" (por ejemplo, "quiero ir"/"fui" para eventos).

**Problema que resuelve.** Hoy solo los eventos admiten comentarios; guardar ya está técnicamente unificado desde la Fase 1, pero *extender su uso* a Publicaciones y Promociones es funcionalidad nueva y visible de esta fase, no solo un cambio estructural.

**Módulos que incluye.** Seguir negocios (extensión de seguidores, §29). Guardados generalizados (§30). Comentarios generalizados (§31). Reacciones (§32), evaluadas con criterio — no se copia el set de reacciones de una red social genérica sin que cada una se justifique por su valor como señal hiperlocal.

**De qué depende.** Fase 1 (Interacción unificada), Fase 3 (seguir negocios necesita el perfil de negocio de esa fase), Fase 4 (más de un tipo de Publicación real sobre la cual interactuar).

**Qué bloquea hasta completarse.** Fase 6 (el feed y las recomendaciones usan señales de interacción como insumo directo), Fase 7 (la Guía IA usa estas mismas interacciones para aprender de cada usuario).

**Tablas nuevas.** Ninguna tabla nueva de fondo — se amplía el enumerado de tipos en `interactions`. Se añade `interaction_comments` como tabla de detalle (contenido de texto) vinculada 1:1 a una fila de interacción tipo "comentario", para no ensuciar la tabla genérica con un campo de texto que no aplica a un like o un guardado.

**Entidades nuevas.** Reacciones tipo "quiero ir"/"fui" (nuevos tipos de interacción), Comentario como detalle de interacción.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Ampliar el enumerado de `interaction_type`; crear `interaction_comments`; migrar el contenido ya existente de `event_comments` hacia el nuevo esquema, preservando el historial.

**Riesgos.** El abuso (spam de comentarios o reacciones) crece proporcionalmente a la superficie de contenido comentable — este es el primer punto del roadmap donde la ausencia de un módulo de moderación completo (Fase 13) empieza a doler de verdad. Mitigación: límites de tasa básicos (no moderación completa) deben entrar en esta misma fase, no posponerse hasta la Fase 13.

**Pruebas necesarias.** Comentar una Promoción funciona igual que comentar un Evento (generalización real, no solo en el papel). Límite de tasa efectivo (un usuario no puede comentar de forma masiva en un minuto). Los conteos desnormalizados que ya usa el feed (`likes_count`, `comments_count`) se mantienen correctos con los nuevos tipos de interacción.

**Criterio de terminado.** Cualquier Publicación admite comentar, guardar y reaccionar con la misma experiencia y el mismo nivel de pulido; existen límites de tasa básicos activos contra abuso evidente.

---

## Fase 6 — Descubrimiento inteligente v2 (feed híbrido, recomendaciones, búsqueda)

**Objetivo.** Evolucionar el feed de "solo proximidad temporal" al modelo híbrido de puntuación de `ARCHITECTURE.md` §21 (afinidad + peso editorial + peso de promoción acotado + decaimiento de frescura), e introducir el Sistema de recomendaciones (§20) como motor compartido entre el feed, la búsqueda por intención y la Guía IA.

**Problema que resuelve.** El feed actual no distingue interés personal ni aprende de nada; con más tipos de contenido (Fase 4) y señales de interacción reales ya disponibles (Fase 5), seguir mostrando únicamente orden cronológico desaprovecha datos que el sistema ya tiene.

**Módulos que incluye.** Algoritmo del feed (§21). Sistema de recomendaciones (§20). Sistema de búsqueda mejorado, distinguiendo búsqueda por texto (ya existente) de búsqueda por intención (delegada a la Guía IA en la Fase 7, no duplicada aquí, §22).

**De qué depende.** Fase 4 (más de un tipo de contenido que rankear), Fase 5 (señales de interacción reales que alimentar al algoritmo).

**Qué bloquea hasta completarse.** Fase 7 (la Guía IA v2 reutiliza este motor de recomendaciones en vez de duplicar lógica), Fase 11 (contenido promocionado en el feed depende de que el algoritmo híbrido ya tenga un lugar bien definido y acotado para ese peso).

**Tablas nuevas.** `affinity_scores` (actor, categoría, peso — perfil de afinidad legible y corregible por el usuario, según el principio de transparencia de §40).

**Entidades nuevas.** Perfil de afinidad.

**APIs externas necesarias.** Ninguna obligatoria. Evaluar (no adoptar de antemano) un servicio de búsqueda de texto completo solo si el volumen real de contenido supera lo que una búsqueda de coincidencia parcial simple puede resolver con buen rendimiento.

**Migraciones que requerirá.** Creación de `affinity_scores`; ninguna migración destructiva.

**Riesgos.** El riesgo central, ya señalado en `ARCHITECTURE.md` §21: que cualquier peso de promoción futura termine superando en la fórmula a la relevancia real. Aunque el contenido promocionado pagado no existe todavía en esta fase (llega en la Fase 11), la fórmula debe diseñarse dejando ese espacio ya acotado desde ahora, no improvisado después bajo presión comercial.

**Pruebas necesarias.** Comparación A/B interna (orden cronológico puro contra orden híbrido, con el mismo conjunto de usuarios de prueba) para confirmar que la relevancia percibida mejora, no solo que el algoritmo es más complejo. Verificación de que el perfil de afinidad mostrado al usuario coincide exactamente con lo que el algoritmo usa internamente — transparencia real, no solo declarada.

**Criterio de terminado.** El feed prioriza contenido relevante por afinidad además de proximidad temporal; el usuario puede ver y corregir su propio perfil de afinidad desde su perfil personal.

---

## Fase 7 — Guía IA v2 (sesiones persistentes y personalización)

**Objetivo.** Introducir la Sesión de Guía IA persistente (§36) y conectar la IA al motor de recomendaciones construido en la Fase 6, para que responda con criterio de afinidad real del usuario, no solo con el contexto de la pregunta puntual.

**Problema que resuelve.** Hoy cada consulta a la IA carece esencialmente de memoria; con el motor de recomendaciones ya existente, la IA puede dar respuestas mucho más útiles reutilizando esa infraestructura en vez de construir su propia lógica de personalización por separado.

**Módulos que incluye.** Arquitectura de sesión de IA (§36). Fuentes de información de la IA, sin cambios en el principio de nunca inventar datos (§37). Cómo recomienda lugares y eventos (§38-39), reutilizando el motor de la Fase 6. Cómo aprende de cada usuario (§40), compartiendo el mismo perfil de afinidad legible de la Fase 6.

**De qué depende.** Fase 6 — el motor de recomendaciones y el perfil de afinidad deben existir antes de que la IA pueda apoyarse en ellos.

**Qué bloquea hasta completarse.** Nada de forma dura. La Fase 9 (Guía IA contextual en puntos turísticos vía QR, §45) se beneficia de que la IA ya tenga memoria de sesión antes de extenderse a un punto de acceso físico, pero no depende estrictamente de ello.

**Tablas nuevas.** `ai_sessions` (usuario, historial de conversación, con mecanismo explícito de borrado por el usuario).

**Entidades nuevas.** Sesión de Guía IA.

**APIs externas necesarias.** Ninguna nueva — se mantiene la función de borde ya construida sobre la API de Claude.

**Migraciones que requerirá.** Creación de `ai_sessions`, sin tocar tablas existentes.

**Riesgos.** Privacidad (§57 de `ARCHITECTURE.md`): el historial de conversación con la IA es potencialmente el dato más sensible que recolecta todo el sistema. Requiere diseño de retención y borrado desde el primer día de esta fase, no como una mejora agregada después de un incidente.

**Pruebas necesarias.** Suite de casos donde la respuesta correcta es "no lo sé" por falta de datos reales, confirmando que la IA nunca inventa. Prueba de borrado efectivo del historial a solicitud del usuario. Prueba de que cada recomendación de la IA puede explicar su propio motivo quiado se le pregunta.

**Criterio de terminado.** La Guía IA recuerda contexto dentro de una sesión, prioriza por afinidad real del usuario que pregunta, y el usuario puede ver y borrar su historial de conversación desde su perfil.

---

## Fase 8 — Historias y video como contenido de primera clase

**Objetivo.** Evolucionar los "estados" (reportes en vivo) actuales hacia Historias con vigencia de 24 horas (§35), y formalizar el video como un atributo de medio disponible para cualquier Publicación, con transcodificación en servidor (§34).

**Problema que resuelve.** El formato "esto está pasando ahora" —la ventaja diferencial de Ahorita frente a un directorio estático, principio (c) de `ARCHITECTURE.md`— hoy vive de forma primitiva en "estados"; sin mejor tratamiento visual y sin soporte robusto de video, se pierde la oportunidad de ser el canal preferido para mostrar ambiente en vivo real.

**Módulos que incluye.** Sistema de Historias. Soporte de video como atributo de medio, con compresión/transcodificación para no penalizar el rendimiento en redes móviles imperfectas (§58).

**De qué depende.** Fase 1 (Publicación unificada — una Historia es un subtipo con vigencia corta obligatoria), Fase 4 (el patrón de subtipos ya probado con Publicaciones/Promociones).

**Qué bloquea hasta completarse.** Nada crítico — es una fase de enriquecimiento de formato, no de infraestructura habilitante para otras fases.

**Tablas nuevas.** Ninguna de fondo si se modela como un subtipo más de Publicación con `expires_at` obligatorio a 24 horas. Opcional: `story_views` si se decide implementar "quién vio tu historia".

**Entidades nuevas.** Historia (subtipo), Vista de historia (opcional).

**APIs externas necesarias.** **Servicio de transcodificación/compresión de video** — la primera dependencia externa no trivial de todo este plan, necesaria porque no se puede depender de que cada usuario suba un archivo ya optimizado.

**Migraciones que requerirá.** Agregar el subtipo Historia; tabla opcional de vistas.

**Riesgos.** El costo de almacenamiento y procesamiento de video puede crecer rápido sin límites explícitos. Mitigación: definir desde el diseño (no ajustar después de un problema de costos) límites de duración y tamaño — por ejemplo, historias de máximo 15-30 segundos.

**Pruebas necesarias.** Expiración automática exacta a las 24 horas. Transcodificación correcta de un archivo pesado subido por un usuario. Rendimiento verificado en una conexión móvil simulada lenta, no solo en conexión de oficina.

**Criterio de terminado.** Un usuario o negocio puede publicar una Historia que desaparece automáticamente a las 24 horas con tratamiento visual distintivo; cualquier Publicación admite video con carga fluida en red móvil imperfecta.

---

## Fase 9 — QR y experiencias físicas

**Objetivo.** Construir el Token QR genérico (§41) y sus consumidores: check-in en lugares (§44), promociones mediante QR (§43), validación de entradas (§42), y turismo mediante QR (§45).

**Problema que resuelve.** Es el módulo que conecta directamente el mundo digital con la experiencia física real. Sin él, todo lo construido hasta este punto es descubrimiento y conversación — nunca una confirmación de que algo realmente ocurrió en el mundo físico, que es precisamente el hueco que ninguno de los siete productos de referencia mencionados en `ARCHITECTURE.md` §1 resuelve bien para una sola ciudad.

**Módulos que incluye.** Arquitectura del sistema QR (un solo token genérico, no tres sistemas paralelos). Validación de entradas. Promociones mediante QR. Check-in en lugares. Turismo mediante QR.

**De qué depende.** Fase 2 (verificación de negocios — check-in y promociones QR solo tienen sentido pleno con negocios ya verificados detrás), Fase 4 (Promoción como subtipo debe existir para que un QR de promoción tenga qué canjear).

**Qué bloquea hasta completarse.** Fase 10 — la venta de entradas interna necesita el Token QR de validación ya construido, porque una entrada digital *es*, en la práctica, un Token QR con un tipo de acción específico.

**Tablas nuevas.** `qr_tokens` (código único, tipo de acción, entidad referenciada, estado, actor emisor y/o receptor, vigencia).

**Entidades nuevas.** Token QR (con tipo de acción como diferenciador, no una tabla por caso de uso).

**APIs externas necesarias.** Ninguna obligatoria para generar o leer códigos QR (se resuelve completamente del lado del cliente). Si se decide instalar QR físicos para turismo, puede requerirse coordinación con un servicio de impresión — operativa, no necesariamente técnica.

**Migraciones que requerirá.** Creación de `qr_tokens`; ninguna migración destructiva sobre lo existente.

**Riesgos.** Fraude por duplicación (alguien comparte una captura de pantalla de un token de un solo uso). Mitigación: invalidación inmediata al primer escaneo exitoso, con marca de tiempo y quién lo validó, y una señal visual inequívoca de "ya usado" frente a "válido" en el punto de validación.

**Pruebas necesarias.** Ciclo de vida completo por cada tipo de token: emitir, escanear, validar estado, marcar como usado, confirmar que un segundo escaneo del mismo token se rechaza. Prueba de expiración. Prueba específica de que el check-in (a diferencia de una entrada) sí es repetible por diseño.

**Criterio de terminado.** Un negocio verificado puede generar un QR de check-in funcional; una Promoción puede canjearse una vez vía QR con conteo real visible para el negocio; un Evento con entradas puede validar asistencia real vía QR.

---

## Fase 10 — Comercio: reservas y venta de entradas internas

**Objetivo.** Implementar Reservas (§46) y venta de entradas dentro de la propia plataforma (§47), reduciendo gradualmente la dependencia del enlace externo de entradas (`ticket_url`) que hoy funciona como solución de transición.

**Problema que resuelve.** Hoy Ahorita delega toda venta de entradas y toda reserva a plataformas externas — pierde la oportunidad de comisión (modelo de negocio, Fase 11) y de tener el dato real de asistencia dentro del propio ecosistema en vez de depender de lo que un tercero reporte.

**Módulos que incluye.** Arquitectura de reservas. Arquitectura de venta de entradas internas, generando un Token QR (Fase 9) como confirmación digital.

**De qué depende.** Fase 9 (Token QR de validación ya construido).

**Qué bloquea hasta completarse.** Fase 11, específicamente la parte de "comisión sobre transacciones" — solo tiene sentido si existen transacciones reales que comisionar.

**Tablas nuevas.** `reservations` (actor, publicación o lugar reservado, estado, fecha). `transactions` (abstracción común de cobro, reutilizada también por la suscripción de negocio en la Fase 11 — nunca un flujo de cobro distinto por caso de uso).

**Entidades nuevas.** Reserva, Transacción.

**APIs externas necesarias.** **Proveedor de pagos** — decisión explícitamente no prescrita por adelantado en `ARCHITECTURE.md` §49; corresponde al equipo de producto evaluarla en su momento según condiciones reales del mercado ecuatoriano.

**Migraciones que requerirá.** Creación de `reservations` y `transactions`. El campo `ticket_url` existente se conserva sin eliminarse — algunos organizadores seguirán prefiriendo su propia plataforma de venta externa.

**Riesgos.** La fase de mayor riesgo regulatorio y financiero de todo el plan, porque implica manejo de dinero real. Requiere revisión legal y fiscal específica de Ecuador (facturación, retenciones) antes de activarse, no solo revisión técnica de seguridad.

**Pruebas necesarias.** Estados de transacción exhaustivos (iniciada/completada/fallida/reembolsada) incluyendo casos de fallo simulado (pago rechazado, timeout del proveedor). Conciliación exacta (el dinero cobrado coincide con las entradas/reservas efectivamente emitidas). Auditoría de seguridad específica: nunca almacenar datos de tarjeta directamente, delegar siempre esa responsabilidad al proveedor de pagos.

**Criterio de terminado.** Un usuario puede reservar o comprar una entrada dentro de la app con un pago real procesado y una confirmación (Token QR) generada automáticamente; el organizador ve el estado de sus ventas en tiempo real.

---

## Fase 11 — Monetización activa y publicidad

**Objetivo.** Activar la suscripción de negocio verificado (§53) y el contenido promocionado etiquetado (§52), apoyándose en la base de negocios verificados (Fase 2-3), la variedad de contenido (Fase 4), el feed con un peso de promoción ya acotado por diseño (Fase 6), y la infraestructura de transacción reutilizable (Fase 10).

**Problema que resuelve.** Hasta este punto del plan, el ecosistema completo no genera ingreso propio — es la fase donde el producto empieza a sostenerse económicamente.

**Módulos que incluye.** Arquitectura de publicidad (contenido promocionado, siempre etiquetado sin excepción). Arquitectura de monetización (suscripción de negocio, con nivel gratuito básico para no bloquear la adopción inicial).

**De qué depende.** Fase 2 (verificación como requisito para poder suscribirse), Fase 6 (el feed ya tiene un lugar acotado y auditable para el peso de promoción), Fase 10 (la abstracción de Transacción se reutiliza para el cobro recurrente de la suscripción).

**Qué bloquea hasta completarse.** Nada más adelante en este plan depende estrictamente de esta fase — es una fase de "cosecha" del valor ya construido, no de habilitación de fases futuras.

**Tablas nuevas.** `subscriptions` (negocio, plan, estado, vigencia). `promoted_content` (publicación, peso/presupuesto de promoción, periodo activo).

**Entidades nuevas.** Suscripción, Contenido promocionado.

**APIs externas necesarias.** El mismo proveedor de pagos de la Fase 10, con soporte de cobro recurrente (más exigente que un cobro único de entrada).

**Migraciones que requerirá.** Creación de `subscriptions` y `promoted_content`; ningún cambio destructivo.

**Riesgos.** El riesgo de producto más delicado de todo el plan: cualquier percepción de que pagar mejora deshonestamente la visibilidad por encima de la relevancia real daña la confianza que sostiene todo el ecosistema (principio (b) de `ARCHITECTURE.md`, reiterado en §21 y §52). Mitigación: un límite duro y auditable en la fórmula del feed sobre cuánto puede pesar la promoción pagada, y una etiqueta visual sin excepciones en cualquier superficie donde aparezca contenido promocionado.

**Pruebas necesarias.** Verificación de que el contenido promocionado aparece etiquetado en el 100% de los casos, en feed, búsqueda y mapa por igual. Prueba de facturación recurrente completa (renovación automática, cancelación, manejo de un cobro fallido). Prueba negativa: un negocio no verificado no puede suscribirse ni promocionar contenido bajo ninguna circunstancia.

**Criterio de terminado.** Un negocio verificado puede suscribirse y pagar de forma recurrente; puede promocionar una publicación real con un peso acotado y siempre visible en el feed; el equipo tiene un reporte de ingresos reales por ambas vías.

---

## Fase 12 — Integración de movilidad (Azu Taxi y transporte)

**Objetivo.** Implementar la integración desacoplada de transporte descrita en §48, extendiendo el patrón ya existente de deep link a Google Maps/Uber dentro de "Cómo llegar".

**Problema que resuelve.** Cierra el último tramo del flujo de usuario (§12, momento de "experiencia física") — descubrir algo y poder llegar a algo son necesidades igual de reales, y hoy ese tramo se resuelve solo con enlaces genéricos a apps de terceros sin ninguna relación comercial ni de datos con Ahorita.

**Módulos que incluye.** Integración con Azu Taxi (o el proveedor de transporte vigente en el momento de implementar).

**De qué depende.** Técnicamente, de nada dentro de este plan — es la razón por la que se separó como fase propia en vez de agruparla con comercio (ver la nota de reordenamiento al inicio del documento). Puede desarrollarse en paralelo con cualquier fase desde la Fase 6 en adelante sin fricción.

**Qué bloquea hasta completarse.** Nada.

**Tablas nuevas.** Ninguna necesariamente — puede resolverse con un deep link parametrizado, igual que la integración actual con Google Maps/Uber. Si se decide medir conversión (cuántos viajes se iniciaron desde Ahorita), una tabla ligera `mobility_referrals`.

**Entidades nuevas.** Referencia de movilidad (opcional).

**APIs externas necesarias.** **API o SDK de Azu Taxi**, tratada siempre como reemplazable por diseño (principio de la capa de integraciones externas, `ARCHITECTURE.md` §6).

**Migraciones que requerirá.** Opcional, solo si se decide trackear conversión con `mobility_referrals`.

**Riesgos.** Dependencia de un socio externo cuya disponibilidad o API puede cambiar sin aviso. Mitigación: mantener siempre el deep link genérico a Google Maps/Uber como alternativa de respaldo, nunca reemplazarlo por completo.

**Pruebas necesarias.** El deep link/integración funciona con las coordenadas reales de cualquier lugar o evento. Prueba de degradación: si la integración falla, el usuario igual puede llegar por el medio genérico ya existente.

**Criterio de terminado.** Desde la ficha de un lugar o evento, un usuario puede iniciar un viaje con Azu Taxi con un solo toque, con origen y destino precargados.

---

## Fase 13 — Madurez operativa y cumplimiento

**Objetivo.** Implementar los módulos adicionales propuestos en `ARCHITECTURE.md` Parte XIII que no encajan de forma natural dentro de una sola fase de producto, pero son requisito de sostenibilidad a partir de cierto volumen: moderación completa con cola humana, soporte al negocio, internacionalización, cumplimiento legal (LOPDP de Ecuador), feature flags/experimentación, observabilidad e incidentes.

**Problema que resuelve.** Sin esto, el crecimiento de usuarios y negocios logrado por las fases anteriores expone al ecosistema a riesgos operativos, legales y de confianza que ninguna cantidad de buena arquitectura de producto resuelve por sí sola.

**Módulos que incluye.** Moderación completa (extiende los límites de tasa básicos ya construidos en la Fase 5 hacia una cola humana real con prioridad). Soporte y ayuda. Internacionalización (español/inglés). Cumplimiento legal y términos de servicio. Feature flags. Observabilidad e incidentes.

**De qué depende.** Formalmente, ninguna fase previa la bloquea de empezar — pero **se recomienda iniciar sus componentes de forma incremental desde la Fase 5** (donde nace la primera necesidad real de moderación), no esperar hasta llegar aquí en el orden del documento. Se coloca al final de la lista por claridad expositiva, no como instrucción de secuencia estricta — ver la matriz de paralelización más abajo.

**Qué bloquea hasta completarse.** Ninguna fase de producto queda técnicamente bloqueada, pero el crecimiento sano del negocio y del equipo de curaduría (§54 de `ARCHITECTURE.md`) sí depende de tener esto resuelto antes de escalar el volumen de negocios y contenido varias veces por encima del actual.

**Tablas nuevas.** `moderation_reports` (contenido o actor reportado, motivo, estado, prioridad, resolución). `feature_flags` (nombre, estado, porcentaje de usuarios expuestos).

**Entidades nuevas.** Reporte de moderación, Feature flag.

**APIs externas necesarias.** Posible servicio de moderación automatizada de imágenes/texto si el volumen de contenido lo justifica. Posible servicio de traducción/gestión de contenido multi-idioma si se prioriza inglés antes de contar con recursos de traducción humana.

**Migraciones que requerirá.** Creación de `moderation_reports` y `feature_flags`; ningún cambio destructivo.

**Riesgos.** El riesgo principal aquí es organizacional, no técnico: es exactamente el tipo de fase que se pospone indefinidamente porque no "se ve" en una demo de producto, hasta que un incidente de moderación o de cumplimiento legal obliga a resolverla bajo presión.

**Pruebas necesarias.** Simulación de reporte → cola de moderación → resolución con distintos niveles de prioridad. Activación y desactivación de una funcionalidad vía feature flag sin necesidad de un despliegue de código nuevo. Auditoría de que el historial de ubicación y de conversación con la IA (§57) puede exportarse y borrarse a solicitud del usuario, requisito directo de la LOPDP.

**Criterio de terminado.** Existe una cola de moderación funcional con tiempo de respuesta objetivo definido; existen políticas legales publicadas y accesibles; el equipo puede activar una funcionalidad nueva solo para un subconjunto de usuarios antes de un lanzamiento total.

---

# Matriz de dependencias de módulos

Formato idéntico al ejemplo entregado por el usuario para la Guía IA — cada módulo con la lista completa de lo que necesita ya resuelto antes de poder comenzar.

**Identidad (Actor unificado)** depende de:
✔ Nada — es la base de todo el plan (Fase 1).

**Ciudad** depende de:
✔ Nada — se construye en paralelo con Identidad (Fase 1).

**Verificación** depende de:
✔ Identidad

**Negocios (perfil extendido)** depende de:
✔ Identidad
✔ Verificación

**Lugares** depende de:
✔ Ciudad
(ya construido en la Fase 0; se re-asocia a Ciudad en la Fase 1)

**Eventos** depende de:
✔ Lugares
✔ Categorías
(ya construido en la Fase 0; es el subtipo de referencia para todo lo demás)

**Publicaciones y Promociones** depende de:
✔ Identidad
✔ Verificación
✔ Negocios
✔ Modelo de Publicación unificado (generaliza Eventos)

**Interacciones (likes/guardados/comentarios/seguir)** depende de:
✔ Identidad
✔ Publicaciones (necesita contenido real sobre el cual interactuar)

**Feed / Descubrimiento** depende de:
✔ Publicaciones
✔ Interacciones
✔ Categorías
✔ Ubicación

**Búsqueda** depende de:
✔ Publicaciones
✔ Categorías
✔ Ubicación

**Recomendaciones** depende de:
✔ Interacciones
✔ Feed
✔ Categorías
✔ Identidad (intereses declarados)

**Guía IA** depende de:
✔ Identidad
✔ Negocios
✔ Publicaciones
✔ Categorías
✔ Ubicación
✔ Feed
✔ Recomendaciones
(exactamente el ejemplo entregado por el usuario, confirmado por este análisis)

**Historias** depende de:
✔ Publicaciones (subtipo con vigencia corta)

**Video** depende de:
✔ Publicaciones (atributo de medio)

**Token QR (genérico)** depende de:
✔ Identidad
✔ Verificación
✔ Publicaciones
✔ Lugares

**Check-in en lugares** depende de:
✔ Token QR
✔ Lugares
✔ Ubicación (geocercas)

**Validación de entradas** depende de:
✔ Token QR
✔ Eventos
✔ Publicaciones

**Promociones mediante QR** depende de:
✔ Token QR
✔ Promociones

**Reservas** depende de:
✔ Token QR
✔ Publicaciones/Lugares
✔ Pagos (si son pagadas)

**Venta de entradas internas** depende de:
✔ Token QR
✔ Eventos
✔ Pagos

**Pagos** depende de:
✔ Identidad
✔ Verificación (negocios que cobran)
✔ Transacción (abstracción común)

**Suscripciones / Monetización** depende de:
✔ Verificación
✔ Pagos
✔ Feed (lugar acotado para el peso de promoción)

**Publicidad / Contenido promocionado** depende de:
✔ Feed
✔ Suscripciones
✔ Publicaciones

**Notificaciones** depende de:
✔ Identidad
✔ Interacciones (eventos que disparan una notificación)
✔ Ubicación (proximidad, a futuro)

**Analíticas** depende de:
✔ Interacciones
✔ Publicaciones
✔ Verificación (negocios)
✔ Token QR (asistencia real, canjes reales)

**Moderación** depende de:
✔ Publicaciones
✔ Interacciones (comentarios, reportes)

**Movilidad (Azu Taxi)** depende de:
✔ Ubicación
✔ Lugares/Eventos (destino)
(deliberadamente sin dependencia de ningún módulo social o comercial — por eso puede desarrollarse en cualquier momento sin fricción, ver Fase 12)

**Multi-ciudad (expansión real, no la preparación estructural)** depende de:
✔ Ciudad
✔ Prácticamente todos los demás módulos ya generalizados correctamente
(es más una validación transversal de que el resto del sistema no asumió "Cuenca" en ningún lugar, que un módulo con dependencias propias acotadas)

---

# Paralelización, secuencia estricta, y alcance para v2.0

## Qué puede desarrollarse en paralelo

- Los componentes de **Fase 13** (límites de tasa básicos, borradores de términos de servicio, scaffolding de feature flags) pueden y deben empezar de forma incremental desde la **Fase 5** en adelante, en vez de esperar a que el plan llegue formalmente a esa fase.
- **Fase 8** (Historias/Video) y **Fase 9** (QR) no comparten dependencias entre sí más allá de la Fase 1/4 ya resueltas — pueden construirse en paralelo por equipos distintos sin coordinación estrecha.
- **Fase 12** (Azu Taxi) puede desarrollarse en paralelo con prácticamente cualquier fase desde la Fase 6 en adelante, precisamente porque no comparte dependencias reales con el resto del plan (ver matriz de dependencias) — es la justificación técnica de haberla separado de la fase de comercio.
- **Notificaciones** y **Analíticas** son transversales por naturaleza: cada fase que introduce un nuevo tipo de interacción o transacción debe simplemente añadir su propio evento a estos dos sistemas ya existentes, en vez de tratarlos como una fase monolítica al final.
- Dentro de la **Fase 6**, el trabajo de "búsqueda mejorada" puede avanzar en paralelo al de "feed híbrido" — comparten dependencias de entrada pero no comparten código ni lógica entre sí.

## Qué nunca debería empezar antes de otra cosa

- **Verificación (Fase 2) nunca antes de Identidad unificada (Fase 1)** — modelarla directamente sobre `businesses` en su forma actual reproduciría la misma deuda técnica que este plan existe para evitar.
- **Publicaciones/Promociones (Fase 4) nunca antes de Verificación (Fase 2)** — abrir la capacidad de publicar contenido nuevo sin un sistema de confianza real detrás reproduce exactamente el riesgo que el principio (b) de `ARCHITECTURE.md` señala como no negociable.
- **QR de check-in/promociones (Fase 9) nunca antes de Verificación (Fase 2)** — sin negocios verificados detrás, es una superficie de fraude físico sin ningún control de confianza.
- **Comercio interno (Fase 10) nunca antes del Token QR (Fase 9)** — una entrada vendida sin mecanismo de validación real no tiene forma de confirmarse en el mundo físico.
- **Monetización (Fase 11) nunca antes del Feed híbrido (Fase 6)** — vender promoción sobre un feed puramente cronológico no tiene ningún lugar coherente donde insertar ese peso sin que se sienta arbitrario o, peor, dañino para la confianza.
- **Cualquier generalización de interacción social (Fase 5) nunca antes de la Interacción unificada (Fase 1)** — es, otra vez, el error estructural que este plan entero existe para prevenir desde el principio.

## Qué puede esperar a una versión 2.0

- **Reacciones más allá de un conjunto mínimo** ("me gusta", "quiero ir", "fui") — un set acotado es suficiente para la versión 1 del sistema social completo; ampliar el catálogo de reacciones es una mejora de v2.0, no un requisito de lanzamiento.
- **Venta de entradas y reservas internas completas (Fase 10)** — el enlace externo de entradas (`ticket_url`) ya es una solución de transición aceptable de forma indefinida si el volumen real de transacciones no justifica todavía el riesgo regulatorio de manejar dinero directamente.
- **Contenido promocionado / publicidad (la mitad "publicidad" específicamente de la Fase 11, distinta de la suscripción básica que sí es razonable en v1)** — puede posponerse hasta tener suficiente volumen de negocios suscritos para que valga la pena construirla.
- **Internacionalización completa** — español puede ser la única versión 1 viable; inglés se adelanta a v1 solo si los datos reales de uso de visitantes/turistas lo justifican antes.
- **Turismo mediante QR físico (§45)** — depende de coordinación institucional y de instalación física de códigos, que es operativamente mucho más lenta que cualquier desarrollo de software; aunque el Token QR genérico (Fase 9) se construya en v1, este caso de uso específico puede esperar sin bloquear nada más.
- **Reservas para servicios más allá de eventos** (mesas de restaurante, citas de servicio) — el foco inicial de "reservable" debe ser eventos con cupo limitado; extender el concepto a otros tipos de negocio es una ampliación de alcance razonable para v2.0.
- **Multi-ciudad real** (expansión efectiva a una segunda ciudad) — distinta de la preparación estructural de la entidad Ciudad, que sí es parte de v1 (Fase 1) precisamente para que esta expansión, cuando se decida, no requiera una migración de arquitectura.

---

*Fin del documento. No se ha creado ninguna migración, tabla, componente ni línea de código de la aplicación — este documento es exclusivamente planificación. Cada fase se implementa solo tras aprobación explícita, comenzando por la Fase 1 cuando el usuario lo indique.*
