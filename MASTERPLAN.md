# Ahorita — Plan Maestro de Desarrollo

**Documento de planificación. Nivel: CTO / Arquitecto Principal / Product Manager. No contiene código, migraciones ni implementación.**

Este documento convierte `ARCHITECTURE.md` (visión y arquitectura del ecosistema, ya aprobado) en un plan de ejecución accionable: fases de desarrollo concretas, en orden, con sus dependencias, sus tablas, sus riesgos y su criterio de éxito. **`MASTERPLAN.md` es la única hoja de ruta oficial de desarrollo de Ahorita** — `ROADMAP.md` apunta aquí para el detalle.

Relación con los demás documentos: `VISION_MAESTRA.md` es, desde el 2026-07-21, la máxima autoridad conceptual del proyecto, y este plan debe leerse en coherencia con ella; `PRODUCT_MANIFESTO.md`/`PRODUCT_STRATEGY.md` definen la identidad y los principios de producto, subordinados a la Visión Maestra; `ARCHITECTURE.md` responde *qué es Ahorita técnicamente y por qué*; `AI_PHILOSOPHY.md` es la autoridad absoluta sobre el comportamiento de la Guía IA; este documento responde *en qué orden se construye y con qué criterio se sabe que cada pieza está lista*; `PROJECT.md` registra, fase por fase, lo que realmente se construyó; `CHANGELOG.md` sigue el detalle de cada cambio. Ninguna fase aquí descrita se implementa hasta que se apruebe explícitamente.

**Principio aprobado: la inteligencia artificial es un eje transversal del producto, no una función aislada.** Por eso cada fase incluye, además de sus doce campos técnicos habituales, un campo adicional — **"Aporte a la Guía IA"** — que documenta qué información o capacidad nueva le entrega a la Guía IA, aunque la integración técnica definitiva de esa capacidad se implemente después (en la Fase 7 y en las fases posteriores). Ninguna fase, sin importar cuán "no relacionada con IA" parezca su título, queda exenta de este campo.

---

## Decisiones estratégicas ya cerradas por el Product Owner (registro)

Estas dieciséis decisiones fueron aprobadas antes de autorizar la implementación de la Fase 1 y ya están incorporadas en el detalle de cada fase más abajo. Se listan aquí también de forma compacta para que cualquier persona del equipo pueda verificarlas de un vistazo sin tener que leer las 13 fases completas:

1. **Se aprueba invertir en la Fase 1** aunque no produzca funcionalidad visible — prioridad: evitar reconstruir el sistema con usuarios y negocios reales ya activos.
2. **Verificación de negocios con vigencia anual**, orientada a confirmar actividad continua y datos actualizados — **la renovación no implica un cobro automático** (Fase 2).
3. **Catálogo de reacciones cerrado para v1:** Me gusta, Quiero ir, Ya fui — no se agregan más sin evidencia real de valor (Fase 5B).
4. **Techo máximo de contenido patrocinado: 15% aproximado del contenido mostrado**, siempre etiquetado como "Patrocinado", configurable únicamente por el administrador principal, con registro de auditoría de cualquier cambio (Fase 6 y Fase 11).
5. **El contenido pagado nunca puede comprar una recomendación de la Guía IA** — la IA prioriza relevancia, contexto, disponibilidad, seguridad, confianza y calidad de datos, sin excepción (protegido por `AI_PHILOSOPHY.md`, reforzado en Fase 11).
6. **Historias con duración máxima de 30 segundos**, alcance simple para v1: foto o video, texto básico, ubicación, vigencia de 24 horas — sin filtros, stickers ni funciones complejas (Fase 8).
7. **Proveedor de pagos y proveedor de transporte quedan abiertos** hasta investigar condiciones reales disponibles en Ecuador (Fase 10 y Fase 12).
8. **Precio final de la suscripción de negocio diferido** — debe existir un nivel gratuito inicial; el plan pagado se define después de validar valor y resultados medibles (Fase 11).
9. **Privacidad, consentimiento, acceso y eliminación de datos se adelantan a la Fase 1** — no quedan relegados a la Fase 13.
10. **La Fase 5 se divide en Fase 5A (seguir negocios, depende solo de la Fase 3) y Fase 5B (comentarios/guardados/reacciones generalizados, depende de la Fase 4).**
11. **Azu Taxi se trata como ventana de integración posible desde fases tempranas, pero no se implementa hasta verificar formalmente qué mecanismo ofrece** (aplicación con deep link, API, teléfono, WhatsApp) — la arquitectura debe permitir sustituir el proveedor o el mecanismo sin rediseñar el núcleo (Fase 12).

**Decisiones adicionales, cerradas en la revisión arquitectónica previa a la Fase 1:**

12. **Actor incorpora un tipo "Sistema/Institucional"**, con los actores **"Guía IA"** y **"Ahorita Editorial"** creados desde la Fase 1 (§9 de `ARCHITECTURE.md`).
13. **Publicación se diseña con el patrón "núcleo genérico + tabla de detalle"** desde la Fase 1, aplicado primero a Eventos (`event_details`) y repetido para cada subtipo futuro. **Carrusel no se modela como subtipo de Publicación** — sigue siendo una vista sobre contenido real, nunca contenido en sí mismo.
14. **Interacción incorpora "Compartir" como tipo desde la Fase 1**, y se deja preparada (columna de referencia opcional) para respuestas anidadas cuando la Fase 5B construya la tabla de detalle de comentarios. **Reportar se mantiene fuera de Interacción**, como su propia entidad dentro del sistema de moderación (Fase 13) — no encaja en la forma de una interacción simple porque necesita motivo, estado de revisión y resolución.
15. **Ciudad incorpora una entidad Zona** (hija de Ciudad, con referencia opcional a otra Zona como padre para poder crecer sin comprometerse a una jerarquía de más niveles todavía) desde la Fase 1, reemplazando el campo de texto libre `places.area`.
16. **La Guía IA es, desde la Fase 1, un Actor del sistema**, y se aprueba el principio de que en el futuro pueda generar contenido persistente (planes, itinerarios, recomendaciones) reutilizando la infraestructura de Publicación — implementación sin fase asignada todavía.

**Visión futura documentada, sin implementar (registrada en `AI_PHILOSOPHY.md` §16):** la Guía IA deberá evolucionar hacia un **motor de experiencias** — su objetivo no será únicamente recomendar lugares o eventos individuales, sino combinar lugares, eventos, promociones y servicios en planes completos adaptados al contexto del usuario. Se deja constancia de esta visión para que ninguna decisión arquitectónica futura la contradiga, sin comprometer todavía ninguna fase ni ningún plazo de implementación.

---

## Cómo leer este documento

Cada fase se describe con trece campos fijos, en este orden: Objetivo, Problema que resuelve, Módulos que incluye, De qué depende, Qué bloquea hasta completarse, Tablas nuevas, Entidades nuevas, APIs externas necesarias, Migraciones que requiere, Riesgos, Pruebas necesarias, Criterio de terminado (Definition of Done), y **Aporte a la Guía IA**.

Las fases no son de tamaño arbitrario: **cada fase deja el producto en un estado estable y funcional**, aunque no todas sean visibles para el usuario final de la misma manera.

Nota sobre reordenamiento respecto a `ARCHITECTURE.md` §60: aquella sección proponía ocho fases (A-H) a alto nivel; este plan las divide en fases más granulares, separa la integración de movilidad (Azu Taxi) de la fase de comercio, y —por decisión aprobada del Product Owner (decisión 10)— divide la fase de interacción social en 5A y 5B para capturar antes el valor de "seguir negocios", que no depende de tanto como el resto de la interacción social.

---

## Fase 0 — Línea base (ya completada, no se planifica aquí)

Lo que ya existe y sobre lo cual se construye todo lo demás: identidad básica de usuario, catálogo de categorías, lugares, negocios con aprobación binaria, preguntas/respuestas/estados en vivo, likes genéricos, guardados de lugares y eventos, seguir personas, notificaciones push reales, eventos con administración completa, y la Guía IA v1 (sin memoria de sesión). Ver `PROJECT.md` para el detalle completo.

**Aporte a la Guía IA.** Le da a la Guía IA su primera fuente de verdad real: lugares, negocios, eventos, categorías. Sin esto no habría nada sobre qué razonar — es la diferencia entre una IA que sabe cosas reales de Cuenca y una que solo tiene conocimiento genérico.

---

## Fase 1 — Unificación del modelo de datos fundacional + línea base de privacidad

**Objetivo.** Introducir las abstracciones de `ARCHITECTURE.md` §9-11 — Actor (con sus tres tipos: Persona, Negocio/Organizador, y **Sistema/Institucional**), Publicación (con el patrón **núcleo genérico + tabla de detalle**), Interacción (con su catálogo ampliado de tipos), Ciudad y **Zona** — como estructura real de base de datos, sin cambiar el comportamiento visible de la aplicación; y establecer, desde esta misma fase, una línea base real de privacidad: consentimiento explícito, acceso y eliminación de datos personales a solicitud del usuario. Todo esto se aprobó para ir junto en esta fase (decisiones 1, 9, 12, 13, 14, 15, 16) — no como funcionalidades independientes, sino porque unificar el modelo de datos es precisamente lo que hace viable construir, de una sola vez y bien, cada una de estas piezas en vez de retrofitarlas después.

**Problema que resuelve.** Tres problemas a la vez, deliberadamente: (a) cada fase social nueva sobre la estructura actual agrega deuda técnica exponencial; (b) el sistema ya empieza a recolectar datos personales reales desde el día uno, y dejar el marco de privacidad para el final del plan es un riesgo real; (c) varias piezas de la visión de largo plazo —una Guía IA que algún día genera contenido propio, una Zona territorial real para razonar sobre seguridad y para geocercas, una distinción clara entre "compartir" y "reportar"— necesitan que el modelo de datos ya las contemple, para no rediseñar la base cada vez que el ecosistema madura.

**Módulos que incluye.**
- **Modelo Actor**, con tres tipos: Persona, Negocio/Organizador, y **Sistema/Institucional** — este último poblado desde el inicio con dos filas reales: **"Guía IA"** y **"Ahorita Editorial"**. Un Actor de tipo Sistema no tiene verificación ni atributos de negocio/persona; los crea únicamente la administración.
- **Modelo Publicación**, diseñado con el patrón **núcleo genérico + tabla de detalle por subtipo**: el núcleo conserva solo lo común a cualquier contenido (autor, categoría, ciudad, zona, medios, ubicación opcional, subtipo, estado editorial, fechas de vigencia, métricas, marca de curaduría editorial); lo específico de Evento (fecha de inicio obligatoria, fecha de fin, precio, enlace de entradas, organizador) se separa a su propia tabla de detalle (`event_details`) — el primer caso de un patrón que se repetirá igual para cada subtipo futuro (Promoción en la Fase 4, y a futuro un posible Plan/Itinerario generado por la Guía IA). **Carrusel no se incluye como subtipo** — sigue siendo una vista sobre contenido real, no contenido en sí mismo.
- **Modelo Interacción**, generalizando likes, guardados y seguimiento, con un catálogo de tipos que desde ahora incluye **Compartir** (además de Me gusta, Quiero ir, Ya fui, Guardado, Seguimiento). **Reportar queda fuera de este modelo** — se mantiene como su propia entidad, planificada en la Fase 13.
- **Entidad Ciudad**, y **Entidad Zona** (hija de Ciudad, con referencia opcional a otra Zona como padre), reemplazando el campo de texto libre `places.area`.
- **Línea base de privacidad:** registro de consentimiento explícito, mecanismo de exportación de los propios datos, mecanismo de eliminación de cuenta y datos asociados.

**De qué depende.** De nada dentro de esta nueva etapa — se apoya únicamente en la Fase 0 ya construida.

**Qué bloquea hasta completarse.** Fase 2, Fase 3, Fase 4, Fase 5A, Fase 5B — en la práctica, casi todo el resto del plan. Específicamente: la Fase 4 hereda el patrón núcleo+detalle ya probado con Eventos para construir Promoción sin tener que inventarlo de nuevo; la Fase 5B hereda el catálogo de tipos de Interacción y agrega la tabla de detalle de comentarios con la referencia de respuesta anidada ya prevista; la Fase 7 hereda la línea base de privacidad ya lista para aplicarla al historial de conversación, y el Actor "Guía IA" ya existente para poder, en el futuro, autorar contenido propio.

**Tablas nuevas.** `cities`. `zones` (referencia a `cities`, y una referencia opcional a otra `zone` como padre). `actors` (con tipo persona/negocio/organizador/sistema; incluye desde el inicio las filas "Guía IA" y "Ahorita Editorial"). `interactions` (polimórfica; tipos: me gusta, quiero ir, ya fui, guardado, seguimiento, compartir — el tipo "comentario" con su tabla de detalle llega en la Fase 5B, ya con la referencia de respuesta anidada prevista desde su creación). `event_details` (separa del núcleo de Publicación los campos específicos de Evento). `consent_records`.

**Entidades nuevas.** Actor (con su tipo Sistema/Institucional), Ciudad, Zona, Interacción unificada (con Compartir), Detalle de Evento (primer caso del patrón núcleo+detalle), Registro de consentimiento.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Migración de esquema que agrega `cities`/`zones`/`actors`/`interactions`/`event_details`/`consent_records`, adapta `profiles`/`businesses` para referenciar `actors`, y separa de `events` los campos que pasan a `event_details`. Migración de datos que traslada `post_likes`, `saved_places`, `saved_events` y `follows` hacia `interactions`, preservando cada fila. Migración que puebla `cities` con una fila ("Cuenca") y `zones` con las zonas ya conocidas y en uso hoy como texto libre en `places.area` (Centro Histórico, El Barranco, etc.), reasignando cada lugar existente a su zona correspondiente. Inserción de las dos filas de Actor tipo Sistema.

**Riesgos.** El riesgo central ya identificado: migración de datos reales de usuarios activos, con posibilidad de pérdida o corrupción silenciosa de historial. Riesgo adicional de agregar varios bloques a una fase ya sensible: mitigado tratando cada bloque (esquema, identidad, interacciones, privacidad, zonas) como una unidad de trabajo independiente y verificable por separado, no como un solo cambio monolítico. Riesgo específico de la migración de zonas: convertir un campo de texto libre en una referencia estructurada requiere mapear correctamente cada valor de texto ya existente a la zona correcta — riesgo bajo porque la lista de zonas en uso hoy es finita y ya conocida, pero requiere una verificación uno a uno, no solo una migración automática.

**Pruebas necesarias.** Conteo exacto de filas migradas por tipo de interacción. Regresión completa de toda la funcionalidad existente, incluyendo que ningún lugar pierda o cambie su zona visible al usuario. Prueba de carga sobre `interactions`. Verificación de que `event_details` contiene exactamente los mismos datos que antes tenían los eventos, sin pérdida de ningún campo. **Prueba específica de privacidad:** exportación y eliminación de datos de principio a fin.

**Criterio de terminado.** Toda la funcionalidad existente funciona de forma idéntica para el usuario final. El equipo puede confirmar que agregar "seguir un negocio" o "comentar una promoción" no requiere una tabla nueva, y que agregar un subtipo de Publicación nuevo en el futuro (por ejemplo, un Plan generado por la Guía IA) tampoco la requeriría. Existen los dos Actores de tipo Sistema ("Guía IA", "Ahorita Editorial"). Cada lugar tiene una Zona real asignada, ya no un texto libre. Existe, desde el lanzamiento de esta fase, un mecanismo funcional de consentimiento, exportación y eliminación de datos personales.

**Aporte a la Guía IA.** Le da a la Guía IA una sola forma consistente de leer cualquier tipo de contenido. Le da una **identidad propia dentro del sistema** (Actor "Guía IA"), condición necesaria para que, en el futuro, pueda autorar contenido persistente sin necesitar un caso especial en el resto del sistema. Le da una **Zona real** sobre la cual razonar variables como seguridad por horario (`AI_PHILOSOPHY.md` §7), en vez de un texto libre sin estructura. Y adelantar la línea base de privacidad significa que cuando la Guía IA empiece a acumular historial de conversación (Fase 7) ya existirá la infraestructura de consentimiento y borrado lista para aplicarse.

**Decisiones ya aprobadas aplicadas aquí:** 1, 9, 12, 13, 14, 15, 16. No requiere aprobación adicional del Product Owner — solo ejecución.

---

## Fase 2 — Verificación robusta y roles granulares

**Objetivo.** Formalizar la Verificación de negocios/organizadores como un proceso con estados, evidencia y **vigencia anual orientada a confirmar que el negocio sigue activo y que sus datos siguen actualizados** (decisión 2) — nunca como un cobro automático asociado a la renovación —, y separar el rol Editor/Curador del rol Administrador.

**Problema que resuelve.** La aprobación de negocios hoy es un campo booleano sin evidencia, sin vencimiento y sin motivo de rechazo registrado.

**Módulos que incluye.** Estados de verificación (`pendiente`/`en_revision`/`aprobado`/`rechazado`/`vencido`/`revocado`). Ciclo de renovación anual, gratuito, enfocado en confirmar continuidad y actualidad de datos (no en volver a cobrar ni en una revisión desde cero tan exhaustiva como la inicial). Roles granulares. Bandeja de trabajo de verificaciones pendientes.

**De qué depende.** Fase 1 — la Verificación debe referenciar el Actor unificado.

**Qué bloquea hasta completarse.** Fase 3, Fase 4 (solo negocios verificados deberían publicar promociones), Fase 9 (check-in y promociones QR necesitan negocios verificados detrás).

**Tablas nuevas.** `verifications` (actor solicitante, tipo de evidencia, estado, revisor, fecha de vigencia y de vencimiento, motivo si aplica, indicador de si la renovación fue solo de confirmación o requirió nueva evidencia). Extensión de `profiles` con un rol enumerado en vez del booleano `is_admin` actual.

**Entidades nuevas.** Verificación, Rol granular.

**APIs externas necesarias.** Ninguna obligatoria.

**Migraciones que requerirá.** Creación de `verifications`, con una fila inicial por cada negocio ya aprobado. Migración de `profiles.is_admin` al nuevo esquema de roles.

**Riesgos.** Cambiar el modelo de permisos es sensible. Adicional: un negocio que no renueva a tiempo por simple descuido (no por mala fe ni por haber cerrado) no debería perder su verificación de forma abrupta — se recomienda un periodo de gracia con aviso previo antes de marcar la verificación como vencida, a definir en el detalle de implementación de esta fase.

**Pruebas necesarias.** Autorización exhaustiva por rol. Simulación completa del ciclo de verificación, incluyendo la renovación anual sin cobro. Auditoría de que ningún negocio pierde su estado durante la migración.

**Criterio de terminado.** Todo negocio existente conserva su estado sin interrupción. Existe una cola de verificaciones pendientes. La renovación anual funciona como confirmación de actividad/datos, sin ningún cobro asociado, tal como se aprobó.

**Aporte a la Guía IA.** Permite que la IA confíe en que un negocio verificado sigue realmente activo y con datos vigentes — no solo verificado alguna vez en el pasado y potencialmente desactualizado o cerrado hoy. La vigencia anual es, en el fondo, una señal de frescura de datos: si un negocio no ha renovado, la Guía IA debería tratar su información con más cautela, consistente con el principio de nunca inventar ni sobre-afirmar certeza (`AI_PHILOSOPHY.md` §10).

**Decisiones ya aprobadas aplicadas aquí:** 2. No requiere aprobación adicional — solo definir, durante la implementación, el periodo de gracia antes de marcar vencimiento (detalle operativo, no estratégico).

---

## Fase 3 — Identidad social plena (perfiles y negocio extendido)

**Objetivo.** Extender el perfil personal y el perfil de negocio: bloques comunes de identidad/actividad/relaciones/reputación, catálogo y horario visibles en el perfil de negocio, y relación explícita de "persona administra negocio".

**Problema que resuelve.** El perfil de negocio hoy es una ficha incrustada dentro de lugares/eventos, no una entidad propia visitable y administrable.

**Módulos que incluye.** Perfil unificado. Arquitectura del negocio. Arquitectura del perfil personal. Relación Actor-administra-Negocio.

**De qué depende.** Fase 1, Fase 2.

**Qué bloquea hasta completarse.** Fase 5A (seguir negocios necesita este perfil real), Fase 6 (analíticas de negocio necesitan "vistas de mi perfil").

**Tablas nuevas.** `actor_managers`.

**Entidades nuevas.** Relación de administración de negocio.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Creación de `actor_managers`.

**Riesgos.** Bajo — riesgo real es de alcance (tentación de incluir analíticas avanzadas aquí, que pertenecen a la Fase 6).

**Pruebas necesarias.** Una persona administra más de un negocio sin cerrar sesión. El estado de verificación se muestra de forma inseparable del contenido en el perfil público.

**Criterio de terminado.** Todo perfil se renderiza desde la misma estructura de datos común; un negocio verificado muestra su insignia de forma consistente.

**Aporte a la Guía IA.** El catálogo, horario y la relación de administración le dan a la IA contexto de negocio estructurado y confiable para responder con precisión preguntas como "¿qué tienen?" o "¿a qué hora abren realmente hoy?" — información que hoy no existe de forma estructurada en ningún lugar del sistema.

**Decisiones ya aprobadas aplicadas aquí:** ninguna directamente — ejecuta lo ya aprobado en Fases 1-2. No requiere aprobación adicional.

---

## Fase 4 — Contenido social ampliado (Publicaciones y Promociones)

**Objetivo.** Implementar Publicación regular y Promoción como subtipos de la Publicación unificada, reutilizando el editor progresivo ya construido para eventos.

**Problema que resuelve.** Hoy solo los eventos pueden publicarse — un negocio no tiene forma de compartir una novedad sin fecha de inicio obligatoria, ni de anunciar una promoción con condición de canje.

**Módulos que incluye.** Sistema de publicaciones. Sistema de promociones (condición de canje, mecanismo de validación previsto — el canje físico vía QR llega en la Fase 9).

**De qué depende.** Fase 1, Fase 2, Fase 3.

**Qué bloquea hasta completarse.** Fase 5B (necesita más de un tipo de contenido real), Fase 9 (promociones QR necesita que el subtipo Promoción ya exista).

**Tablas nuevas.** Ninguna tabla nueva de fondo; se añade `promotion_details`, siguiendo exactamente el mismo patrón núcleo+detalle que la Fase 1 ya estableció con `event_details` — la prueba de que ese patrón funciona igual para un segundo subtipo distinto.

**Entidades nuevas.** Publicación regular y Promoción (subtipos), Detalle de promoción.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Agregar el subtipo Promoción y Publicación regular al catálogo ya definido en la Fase 1; crear `promotion_details`.

**Riesgos.** Sobrecargar el editor progresivo con demasiadas variantes de campos por subtipo.

**Pruebas necesarias.** Crear/editar/publicar cada subtipo de principio a fin.

**Criterio de terminado.** Un negocio verificado puede publicar una Publicación regular y una Promoción con condición de canje, con el mismo nivel de pulido ya alcanzado para eventos.

**Aporte a la Guía IA.** Nace aquí, de forma literal, la variable "promociones activas" de la lista de contexto que la IA debe considerar (`AI_PHILOSOPHY.md` §7). La IA empieza a tener contenido variado sobre el cual razonar, no solo eventos con fecha fija.

**Decisiones ya aprobadas aplicadas aquí:** ninguna directamente. No requiere aprobación adicional.

---

## Fase 5A — Seguir negocios

**Objetivo.** Permitir que un usuario siga a un negocio de la misma forma en que ya sigue a una persona, generalizando el mecanismo de seguimiento (ya unificado en la Fase 1) al perfil de negocio construido en la Fase 3.

**Problema que resuelve.** Hoy "seguir" solo aplica a personas; un negocio no puede acumular una audiencia propia dentro de Ahorita, aunque ya tenga un perfil real desde la Fase 3.

**Por qué es una fase separada (decisión 10, aprobada por el Product Owner).** Seguir negocios solo depende de que exista el perfil de negocio (Fase 3) — no necesita que existan más tipos de contenido (Fase 4). Separarlo de lo que antes era "Fase 5" permite capturar ese valor de negocio real (audiencia propia dentro de la plataforma) más pronto, sin esperar a que el resto de la interacción social esté listo. Técnicamente, **esta fase puede ejecutarse en paralelo con la Fase 4**, ya que ninguna de las dos depende de la otra (ver matriz de dependencias).

**Módulos que incluye.** Extensión de "seguir" (ya unificado en la Fase 1) al Actor-Negocio.

**De qué depende.** Fase 1 (Interacción unificada), Fase 3 (perfil de negocio real que seguir). **No depende de la Fase 4.**

**Qué bloquea hasta completarse.** Nada de forma dura — alimenta señales de afinidad para la Fase 6, pero no la bloquea de empezar.

**Tablas nuevas.** Ninguna — reutiliza `interactions` (Fase 1) con el tipo ya existente de seguimiento, extendido a objetivos de tipo Actor-Negocio.

**Entidades nuevas.** Ninguna nueva — es una extensión de alcance sobre una entidad ya existente.

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Ninguna nueva si `interactions` (Fase 1) ya contempló Actor-Negocio como tipo válido de objetivo; en caso contrario, una migración menor de ampliación del enumerado.

**Riesgos.** Bajo. El riesgo principal es de experiencia de usuario: que "seguir un negocio" no se sienta distinto de "seguir una persona" cuando en la práctica cumple un propósito distinto (enterarte de novedades/promociones, no solo actividad social).

**Pruebas necesarias.** Un usuario sigue y deja de seguir un negocio correctamente; el negocio ve su conteo real de seguidores en su perfil (Fase 3).

**Criterio de terminado.** Un usuario puede seguir/dejar de seguir un negocio con la misma facilidad que a una persona; el negocio ve su número de seguidores.

**Aporte a la Guía IA.** Seguir un negocio es una señal de afinidad explícita fuerte — más confiable que una simple vista o un like ocasional — que alimenta directamente el perfil de afinidad que la Guía IA usará desde la Fase 6 en adelante para personalizar sus recomendaciones.

**Decisiones ya aprobadas aplicadas aquí:** 10. No requiere aprobación adicional.

---

## Fase 5B — Interacción social plena (comentarios, guardados y reacciones generalizadas) ✅ CERRADA (2026-07-22)

**Objetivo.** Generalizar comentarios y guardados a cualquier Publicación, y fijar el catálogo final de reacciones para v1, ya aprobado: **Me gusta, Quiero ir, Ya fui** — sin agregar ninguna reacción adicional sin evidencia real de que aporta valor (decisión 3).

**Resultado final (nota de cierre, ver `PROJECT.md`, sección "FASE 5B CERRADA").** Se cumplió el objetivo con una corrección deliberada respecto al texto original de este plan: **Promoción queda explícitamente excluida de comentarios**, no incluida "igual que un Evento" como decía la redacción original de abajo (líneas "Pruebas necesarias"/"Criterio de terminado", nunca actualizadas hasta este cierre). La razón, aprobada explícitamente durante el análisis del Bloque 3: un beneficio comercial con vigencia no es un espacio de conversación — mismo principio ya aplicado en la Fase 4 para excluir "Quiero ir" y "Compartir sin comentarios" de Promoción. Guardados y las tres reacciones sí se generalizaron según lo planeado; comentarios se generalizaron a Evento y Publicación, deliberadamente no a Promoción.

**Problema que resuelve.** Hoy solo los eventos admiten comentarios; con Publicaciones y Promociones ya existiendo (Fase 4), restringir comentarios solo a eventos se siente arbitrario.

**Módulos que incluye.** Guardados generalizados. Comentarios generalizados. Reacciones: Me gusta, Quiero ir, Ya fui — catálogo cerrado para v1.

**De qué depende.** Fase 1 (Interacción unificada), Fase 4 (más de un tipo de Publicación real sobre la cual interactuar). A diferencia de la Fase 5A, esta sí necesita que exista contenido variado.

**Qué bloquea hasta completarse.** Fase 6 (el feed y las recomendaciones usan estas interacciones como insumo directo), Fase 7 (la Guía IA aprende de estas mismas interacciones).

**Tablas nuevas.** Ninguna de fondo — el tipo "comentario" se agrega al enumerado de `interactions` ya creado en la Fase 1 (que desde el inicio incluye Me gusta/Quiero ir/Ya fui/Guardado/Seguimiento/Compartir). Se añade `interaction_comments` como tabla de detalle vinculada a una interacción tipo "comentario" — **creada desde el inicio con una referencia opcional a otro comentario**, para soportar respuestas anidadas el día que se decida habilitarlas en la interfaz, sin tener que alterar esta tabla más adelante (decisión 14, preparada en la Fase 1 y ejecutada aquí).

**Entidades nuevas.** Comentario como detalle de interacción, con su referencia de respuesta anidada. (Las reacciones "Quiero ir"/"Ya fui" y "Compartir" ya son tipos del enumerado desde la Fase 1, no entidades nuevas de esta fase.)

**APIs externas necesarias.** Ninguna.

**Migraciones que requerirá.** Agregar el tipo "comentario" al enumerado de interacción ya definido en la Fase 1 — catálogo final y cerrado: Me gusta/Quiero ir/Ya fui/Guardado/Seguimiento/Compartir/Comentario, sin espacio abierto a tipos adicionales no revisados. Crear `interaction_comments` con su columna de referencia a otro comentario. Migrar `event_comments` existente hacia el nuevo esquema.

**Riesgos.** El abuso (spam de comentarios) crece con la superficie de contenido comentable — límites de tasa básicos deben entrar en esta misma fase, no esperar a la Fase 13.

**Pruebas necesarias.** Comentar un Evento y comentar una Publicación funcionan con la misma experiencia; comentar una Promoción está explícitamente bloqueado, también a nivel de base de datos (corrección respecto a la redacción original de esta línea — ver "Resultado final" arriba). Límite de tasa efectivo. Los conteos desnormalizados se mantienen correctos con los nuevos tipos.

**Criterio de terminado.** Evento y Publicación admiten comentar, guardar y reaccionar (solo con las tres reacciones aprobadas) con la misma experiencia; Promoción admite guardar y reaccionar pero nunca comentar; existen límites de tasa básicos activos.

**Aporte a la Guía IA.** Comentarios, guardados y las tres reacciones son la fuente principal de "gustos del usuario" e "historial de interacción" que la Guía IA usa para personalizar (`AI_PHILOSOPHY.md` §11). "Ya fui" en particular es una señal más confiable que "me gusta" porque implica una acción real declarada, no solo una intención — aunque todavía menos confiable que un check-in físico confirmado, que llega recién en la Fase 9.

**Decisiones ya aprobadas aplicadas aquí:** 3, 10. No requiere aprobación adicional — el catálogo de reacciones ya está cerrado.

---

## Fase 6 — Descubrimiento inteligente v2 (Motor de Afinidad, Motor de Garantías, Motor Editorial, Compositor del Feed) ✅ CERRADA (2026-07-23)

**Nota de corrección (2026-07-23, cierre formal de la fase):** esta sección describía originalmente un "modelo híbrido de puntuación" de una sola fórmula (afinidad + peso editorial + peso de promoción + decaimiento de frescura) sobre tablas `affinity_scores`/`feed_config`. Ese plan quedó completamente reemplazado, antes de escribirse una sola línea de código, por `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` y `FASE6_CONTRATO_ARQUITECTONICO.md` — ninguna de esas dos tablas llegó a existir. El texto de abajo ya describe lo realmente construido; ver esos dos documentos para la autoridad filosófica y arquitectónica completa, y `PROJECT.md` (sección "FASE 6 CERRADA") para el detalle técnico bloque por bloque.

**Autoridad filosófica de esta fase: `FASE6_FILOSOFIA_DESCUBRIMIENTO.md`** (aprobado 2026-07-22, previo a cualquier diseño técnico). Define qué debe significar "descubrir" en Ahorita — veinte principios permanentes (entre ellos: la fuerza de una señal depende de cuánto compromiso costó producirla; ningún negocio monopoliza por volumen; la Editorial nunca compite con el algoritmo; serendipia y dimensión emocional como formas legítimas de descubrimiento; la ciudad siempre debe ser más grande que el algoritmo) que cualquier decisión técnica de esta fase debe respetar.

**Contrato arquitectónico conceptual de esta fase: `FASE6_CONTRATO_ARQUITECTONICO.md`** (aprobado 2026-07-22, mismo espíritu que `FASE4_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 4). Traduce los veinte principios de la filosofía en seis componentes conceptuales (Motor de Afinidad, Motor de Garantías, Motor Editorial, Compositor del Feed, Gobernanza de contenido patrocinado, y los límites frente a Búsqueda y Guía IA), sus responsabilidades, y qué es determinístico frente a qué es adaptativo.

**Objetivo (resultado final).** Evolucionar el feed de "solo proximidad temporal" a una composición de seis entradas co-iguales — **nunca una sola fórmula de puntuación**: Motor de Afinidad (candidatos por interés real, sin NLP ni embeddings), Motor de Garantías (novedad, diversidad, equidad, serendipia — cuatro carriles que nunca llegan a cero), Motor Editorial (criterio humano, reclama por completo el contenido que le corresponde) y el Compositor del Feed (integra proporciones relativas mediante Weighted Fair Queuing, con anti-monopolio transversal y sin intentar "ser inteligente" por sí mismo). **El techo máximo de contenido patrocinado** —15% aproximado, configurable únicamente por el administrador principal y con registro de auditoría— sigue reservado como mecanismo a construir cuando exista contenido patrocinado real (Fase 11); hoy no gobierna nada porque no hay nada que gobernar todavía.

**Problema que resuelve.** El feed actual no distinguía interés personal ni aprendía de nada.

**Módulos que incluye.** Motor de Afinidad (Bloque 1, migraciones 0035-0037). Motor de Garantías (Bloque 2, migraciones 0038-0039). Motor Editorial (Bloque 3, migración 0040). Compositor del Feed (Bloque 4, migración 0041). Búsqueda mejorada (búsqueda por texto simple, independiente de este motor, ya disponible desde antes; búsqueda por intención delegada a la Guía IA en la Fase 7 — sin cambios en esta fase).

**De qué depende.** Fase 4, Fase 5B (señales de interacción reales que alimentan el Motor de Afinidad).

**Qué bloquea hasta completarse.** Fase 7 (la Guía IA v2 reutiliza el Motor de Afinidad como "cerebro de preferencias"), Fase 11 (contenido promocionado necesita que el Compositor y su techo de gobernanza ya existan).

**Tablas nuevas.** `affinity_contributions` (Bloque 1 — registro append-only de evidencia de afinidad). `editorial_selections` (Bloque 3 — selección editorial con autoría y motivo, reemplaza a `events.editor_pick`, ya legacy). El Compositor del Feed (Bloque 4) no agrega tablas nuevas — extiende `discovery_calibration()` y `candidatos_editorial()` ya existentes, y agrega las funciones `candidatos_afinidad()` y `compose_feed()`.

**Entidades nuevas.** Perfil de afinidad (`affinity_profile()`, legible y corregible por la propia persona). Candidatos por carril (`candidatos_afinidad`, `candidatos_novedad`, `candidatos_diversidad`, `candidatos_equidad`, `candidatos_serendipia`, `candidatos_editorial`). Composición final del feed (`compose_feed()`).

**APIs externas necesarias.** Ninguna.

**Migraciones que requirió.** `0035`-`0037` (Motor de Afinidad y su ciclo de vida de evidencia), `0038`-`0039` (Motor de Garantías y calibración geográfica), `0040` (Motor Editorial), `0041` (Compositor del Feed).

**Riesgos (ya verificados durante la implementación).** Que un carril abundante monopolice candidatos compartidos por volumen — mitigado con ownership por escasez y desempate por hash determinístico (ver "hallazgo real corregido" en `PROJECT.md`). Que el costo del Compositor no escale — verificado con `EXPLAIN ANALYZE` contra un dataset sintético mayor al funcional (663ms → 115ms tras optimizar el anti-monopolio).

**Pruebas realizadas.** Verificación funcional de cada bloque contra Postgres real. Pruebas adversariales de concentración de actor y empates exactos de conteo para el anti-monopolio y el ownership del Compositor. `EXPLAIN ANALYZE` objetivo contra 210 eventos / 69 negocios. Verificación de reversión (rollback) de los cuatro bloques, incluyendo el caso especial de restaurar `discovery_calibration()`/`candidatos_editorial()` a su forma exacta previa al Bloque 4.

**Criterio de terminado.** El feed compone seis entradas co-iguales con proporciones relativas y explicación visible por ítem; el usuario puede ver y corregir su perfil de afinidad (`AffinitySection.jsx`); el techo de promoción del 15% permanece definido en el contrato arquitectónico como mecanismo reservado, en cero contenido patrocinado real, a la espera de la Fase 11.

**Aporte a la Guía IA.** El Motor de Afinidad construido aquí (perfil de afinidad legible, sin NLP, con jerarquía explícita de fuerza de señal) es, literalmente, el "cerebro de preferencias" que la Guía IA hereda en la Fase 7 en vez de construir uno propio por separado.

**Decisiones ya aprobadas aplicadas aquí:** 4 (techo de contenido patrocinado, reservado para la Fase 11). No requiere aprobación adicional.

---

## Fase 7 — Guía IA v2 (sesiones persistentes y personalización) ✅ CERRADA (2026-07-24)

**Nota de corrección (2026-07-24, cierre formal de la fase):** esta sección describía originalmente una única tabla `ai_sessions` como esquema previsto — nunca llegó a existir. Lo realmente construido, en cinco bloques (Separación Razonador/Expresión; Memoria de Sesión; Conocimiento Permanente no-afinidad; Conexión con el Motor de Afinidad; Experiencia unificada de transparencia, corrección y borrado), está descrito abajo con el esquema real. Ver `PROJECT.md` (secciones "FASE 7, BLOQUE 1" a "FASE 7 CERRADA") para el detalle técnico completo, incluyendo la auditoría transversal final y las cuatro correcciones operativas (garantía de una sola solicitud de eliminación pendiente por persona, idempotencia del procesador de eliminaciones, resolución de la carrera entre cancelación y procesamiento, y degradación honesta del contexto real) aplicadas antes de este cierre.

**Autoridad filosófica de esta fase: `FASE7_FILOSOFIA_GUIA_IA.md`** (aprobado 2026-07-23, previo a cualquier diseño técnico, mismo espíritu que `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` tuvo para la Fase 6). Consolida `AI_PHILOSOPHY.md` y lo aterriza específicamente en el territorio que la memoria hace posible por primera vez — veintitrés principios permanentes, entre ellos: memoria de sesión, conocimiento permanente no-afinidad y afinidad son tres categorías que nunca deben confundirse; la Guía IA nunca inventa un recuerdo ni le atribuye a una persona algo que no dijo; ningún conocimiento pasa a ser permanente sin consentimiento explícito; la conversación pertenece siempre a la persona, nunca al sistema; la Guía IA nunca define la identidad de alguien, solo describe comportamientos y preferencias expresadas.

**Contrato arquitectónico conceptual de esta fase: `FASE7_CONTRATO_ARQUITECTONICO.md`** (aprobado 2026-07-23, mismo espíritu que `FASE6_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 6, sin sesiones, tablas, funciones, RPC, prompts ni proveedor de tecnología alguno). Traduce los veintitrés principios de la filosofía en cuatro componentes conceptuales — Memoria de Sesión, Conocimiento Permanente no-afinidad, El Razonador y La Expresión —, deliberadamente agnósticos de proveedor o modelo de inteligencia artificial: separa en cada uno su lógica y garantías permanentes de la tecnología reemplazable que las ejecuta. El análisis técnico de cada bloque (empezando por la separación Razonador/Expresión) debe rendirle cuentas a ese contrato.

**Objetivo.** Introducir la Sesión de Guía IA persistente y conectar la IA al Motor de Afinidad de la Fase 6, para que responda con criterio de afinidad real, no solo con el contexto de la pregunta puntual. Esta es la fase donde la filosofía completa de `AI_PHILOSOPHY.md` —ahora extendida por `FASE7_FILOSOFIA_GUIA_IA.md` al territorio de la memoria— se activa técnicamente por primera vez con memoria real.

**Problema que resuelve.** Hoy cada consulta a la IA carece esencialmente de memoria.

**Módulos que incluye.** Memoria de Sesión y Conocimiento Permanente no-afinidad (nuevos). Conexión de El Razonador al Motor de Afinidad y al perfil de afinidad de la Fase 6. Separación entre El Razonador y La Expresión, agnóstica de tecnología. Aplicación práctica de todos los principios de comportamiento definidos en `AI_PHILOSOPHY.md` y `FASE7_FILOSOFIA_GUIA_IA.md`.

**De qué depende.** Fase 6. Y, por la decisión 9, hereda ya construida la línea base de privacidad de la Fase 1 — el consentimiento y el mecanismo de borrado no se construyen aquí desde cero, se aplican al nuevo tipo de dato (historial de conversación) sobre una infraestructura ya existente. También hereda de la Fase 1 el Actor "Guía IA" ya existente como identidad del sistema — esta fase no necesita crearlo, solo empezar a usarlo activamente.

**Qué bloquea hasta completarse.** Nada de forma dura; mejora sustancialmente la Fase 9 (Guía IA contextual en puntos turísticos vía QR).

**Tablas nuevas (esquema real, actualizado al cierre de la fase — ver `PROJECT.md` para el detalle completo de los cinco bloques).** `ai_active_conversations` y `ai_conversation_turns` (Bloque 2, Memoria de Sesión: una única conversación activa por persona, con expiración por inactividad y borrado explícito). `permanent_knowledge_categories`, `permanent_knowledge_facts` y `permanent_knowledge_audit_log` (Bloque 3, Conocimiento Permanente no-afinidad: catálogo cerrado, hechos vigentes, trazabilidad dedicada sin lectura administrativa). Ningún esquema nuevo en el Bloque 4 (conexión con el Motor de Afinidad ya existente de la Fase 6). Un disparador en `data_requests` (migración `0045`, Bloque 5) que calcula el periodo de gracia de 30 días del lado del servidor, más un índice único parcial (migración `0046`, cierre de fase) que impide más de una solicitud de eliminación pendiente por persona.

**Entidades nuevas.** Sesión de Guía IA (Memoria de Sesión); Conocimiento Permanente no-afinidad.

**APIs externas necesarias.** Ninguna nueva — se mantiene la función de borde ya construida.

**Migraciones que requirió.** `0043` (Memoria de Sesión), `0044` (Conocimiento Permanente), `0045` (periodo de gracia server-side de eliminación de cuenta), `0046` (índice único parcial de solicitudes de eliminación pendientes, cierre de fase). El Bloque 4 no requirió ninguna.

**Riesgos.** Privacidad: el historial de conversación es, según `AI_PHILOSOPHY.md` §11, potencialmente el dato más sensible de todo el sistema. Mitigado por heredar ya lista la infraestructura de consentimiento/borrado de la Fase 1, en vez de construirla bajo presión en esta misma fase.

**Pruebas necesarias.** Suite de casos donde la respuesta correcta es "no lo sé". Borrado efectivo del historial. Verificación de que cada recomendación puede explicar su propio motivo.

**Criterio de terminado.** La Guía IA recuerda contexto dentro de una sesión, prioriza por afinidad real, y el usuario puede ver y borrar su historial de conversación.

**Aporte a la Guía IA.** Esta fase no le "aporta" a la IA como las demás — es donde la IA misma se transforma, ya alimentada por las seis fases anteriores: modelo de datos unificado (Fase 1), verificación como señal de confianza (Fase 2), perfiles de negocio ricos (Fase 3), contenido variado (Fase 4), señales de seguimiento e interacción (Fases 5A-5B), y un motor de afinidad ya maduro (Fase 6).

**Decisiones ya aprobadas aplicadas aquí:** 5, 9. No requiere aprobación adicional.

---

## Fase 8 — Historias y video como contenido de primera clase

**Objetivo.** Evolucionar "estados" hacia Historias, con el alcance exacto ya aprobado para v1 (decisión 6): **duración máxima de 30 segundos**, foto o video, texto básico, ubicación, vigencia de 24 horas — **sin filtros, stickers ni funciones complejas**. Formalizar el video como atributo de medio disponible para cualquier Publicación, con transcodificación en servidor.

**Problema que resuelve.** El formato "esto está pasando ahora" hoy vive de forma primitiva en "estados".

**Módulos que incluye.** Historias (alcance simple ya cerrado). Soporte de video con compresión.

**De qué depende.** Fase 1, Fase 4.

**Qué bloquea hasta completarse.** Nada crítico.

**Tablas nuevas.** Ninguna de fondo — subtipo de Publicación con `expires_at` obligatorio a 24 horas y un límite de duración de 30 segundos validado en el momento de publicar.

**Entidades nuevas.** Historia (subtipo).

**APIs externas necesarias.** Servicio de transcodificación/compresión de video.

**Migraciones que requerirá.** Agregar el subtipo Historia con sus restricciones ya definidas (30 segundos, sin campos de filtros/stickers que ni siquiera deben existir en el modelo de datos de esta fase).

**Riesgos.** Costo de almacenamiento/procesamiento de video — mitigado por el límite ya aprobado de 30 segundos, no dejado abierto a decidir después.

**Pruebas necesarias.** Expiración automática exacta a 24 horas. Rechazo de cualquier archivo que supere 30 segundos. Transcodificación correcta. Rendimiento en conexión móvil simulada lenta.

**Criterio de terminado.** Un usuario o negocio publica una Historia de máximo 30 segundos que desaparece a las 24 horas, con el alcance simple ya aprobado — sin ninguna función adicional no contemplada aquí.

**Aporte a la Guía IA.** Las historias dan a la Guía IA una señal de "esto está pasando ahora mismo" en tiempo real, más viva que un evento programado con anticipación — refuerza directamente su capacidad de responder bien a preguntas como "qué está pasando ahorita" (`AI_PHILOSOPHY.md`, caso "estoy aburrido").

**Decisiones ya aprobadas aplicadas aquí:** 6. No requiere aprobación adicional.

---

## Fase 9 — QR y experiencias físicas

**Objetivo.** Construir el Token QR genérico y sus consumidores: check-in en lugares, promociones mediante QR, validación de entradas, y turismo mediante QR.

**Problema que resuelve.** Hasta este punto, todo lo construido es descubrimiento y conversación digital — nada confirma que algo realmente ocurrió en el mundo físico.

**Módulos que incluye.** Token QR genérico. Validación de entradas. Promociones QR. Check-in. Turismo QR.

**De qué depende.** Fase 2 (verificación), Fase 4 (Promoción como subtipo).

**Qué bloquea hasta completarse.** Fase 10 (una entrada vendida internamente es, en la práctica, un Token QR).

**Tablas nuevas.** `qr_tokens`.

**Entidades nuevas.** Token QR.

**APIs externas necesarias.** Ninguna obligatoria.

**Migraciones que requerirá.** Creación de `qr_tokens`.

**Riesgos.** Fraude por duplicación de tokens de un solo uso.

**Pruebas necesarias.** Ciclo de vida completo por tipo de token. Expiración. Check-in repetible vs. entrada de un solo uso.

**Criterio de terminado.** Check-in, canje de promoción y validación de entrada funcionan de principio a fin sobre negocios verificados.

**Aporte a la Guía IA.** El check-in confirma presencia física real — una señal de popularidad mucho más confiable que un simple "me gusta" o "quiero ir" (que son intención declarada, no confirmación). La Guía IA puede usar esta señal para recomendar con más confianza ("mucha gente ha estado aquí realmente esta semana"), consistente con la jerarquía de priorización de `AI_PHILOSOPHY.md` §9.

**Decisiones ya aprobadas aplicadas aquí:** ninguna directamente. No requiere aprobación adicional.

---

## Fase 10 — Comercio: reservas y venta de entradas internas

**Objetivo.** Implementar Reservas y venta de entradas dentro de la plataforma. **El proveedor de pagos queda explícitamente abierto** (decisión 7) hasta que el equipo comercial investigue condiciones reales disponibles en Ecuador.

**Problema que resuelve.** Hoy Ahorita delega toda venta de entradas y reserva a plataformas externas.

**Módulos que incluye.** Reservas. Venta de entradas internas, generando un Token QR como confirmación.

**De qué depende.** Fase 9.

**Qué bloquea hasta completarse.** Fase 11 (comisión sobre transacciones).

**Tablas nuevas.** `reservations`, `transactions`.

**Entidades nuevas.** Reserva, Transacción.

**APIs externas necesarias.** **Proveedor de pagos — decisión pendiente de investigación de mercado, no técnica** (decisión 7).

**Migraciones que requerirá.** Creación de `reservations` y `transactions`. `ticket_url` se conserva sin eliminarse.

**Riesgos.** El de mayor riesgo regulatorio y financiero de todo el plan — requiere revisión legal y fiscal específica de Ecuador antes de activarse.

**Pruebas necesarias.** Estados de transacción exhaustivos con fallos simulados. Conciliación exacta. Auditoría de seguridad de pagos.

**Criterio de terminado.** Un usuario reserva o compra una entrada con un pago real procesado y una confirmación (Token QR) generada automáticamente.

**Aporte a la Guía IA.** Permite que la Guía IA pase de recomendar a *resolver* — "te reservo la mesa" o "te consigo la entrada" dentro de la misma conversación, en vez de solo sugerir y dejar el resto del trabajo a la persona.

**Decisiones ya aprobadas aplicadas aquí:** 7. Cuando llegue esta fase, el Product Owner y el equipo comercial deberán cerrar la elección real de proveedor — no es una aprobación pendiente ahora, es una decisión que todavía no existe información suficiente para tomar.

---

## Fase 11 — Monetización activa y publicidad

**Objetivo.** Activar la suscripción de negocio verificado y el contenido promocionado, respetando el techo del 15% ya definido en la Fase 6. **El precio final del plan pagado de la suscripción queda diferido** (decisión 8) — debe existir un nivel gratuito desde el lanzamiento de esta fase, y el plan pagado se define después de validar qué valor y resultados medibles obtiene un negocio real dentro de Ahorita.

**Problema que resuelve.** Hasta este punto, el ecosistema no genera ingreso propio.

**Módulos que incluye.** Contenido promocionado, sujeto al techo de 15% ya construido y auditado desde la Fase 6, y a la restricción explícita de que **nunca puede comprar una recomendación de la Guía IA** (decisión 5, protegida por `AI_PHILOSOPHY.md`). Suscripción de negocio con nivel gratuito, pricing pagado sin definir todavía.

**De qué depende.** Fase 2, Fase 6, Fase 10.

**Qué bloquea hasta completarse.** Nada más adelante en este plan.

**Tablas nuevas.** `subscriptions`, `promoted_content` (esta última referencia directamente el `feed_config` de la Fase 6 para respetar el techo ya definido).

**Entidades nuevas.** Suscripción, Contenido promocionado.

**APIs externas necesarias.** El proveedor de pagos elegido en la Fase 10, con soporte de cobro recurrente.

**Migraciones que requerirá.** Creación de `subscriptions` y `promoted_content`.

**Riesgos.** El riesgo de producto más delicado de todo el plan: que la promoción pagada erosione la confianza. Mitigado por dos capas independientes ya aprobadas: el techo técnico del 15% en el feed (decisión 4) y la prohibición explícita de que compre una recomendación de la Guía IA (decisión 5) — dos mecanismos distintos protegiendo el mismo principio en dos superficies distintas del producto.

**Pruebas necesarias.** El contenido promocionado nunca supera el 15% ni siquiera en escenarios simulados de presión comercial alta. **Prueba específica:** la Guía IA, al recomendar, nunca prioriza una opción por estar promocionada — se verifica comparando sus respuestas con y sin contenido patrocinado activo sobre las mismas opciones, confirmando que el orden de recomendación no cambia por el pago. Facturación recurrente completa. Un negocio no verificado no puede suscribirse ni promocionar.

**Criterio de terminado.** Un negocio verificado se suscribe (nivel gratuito disponible desde el lanzamiento) y puede promocionar contenido real dentro del techo del 15%, siempre etiquetado; la Guía IA jamás altera sus recomendaciones por esto, verificado con pruebas específicas.

**Aporte a la Guía IA.** Ninguno positivo — al contrario, esta es la fase que más se debe vigilar para que **no** contamine el razonamiento de la Guía IA. `AI_PHILOSOPHY.md` es la autoridad que lo protege (principio no negociable §4.3), y esta fase existe bajo esa restricción explícita, no a pesar de ella.

**Decisiones ya aprobadas aplicadas aquí:** 4, 5, 8. El pricing final del plan pagado no requiere aprobación ahora — se retomará cuando existan datos reales de valor medible que lo justifiquen.

---

## Fase 12 — Integración de movilidad (ventana condicionada)

**Objetivo.** Evaluar y, cuando corresponda, implementar una integración de transporte (Azu Taxi u otro proveedor vigente en su momento) desde la ficha de un lugar o evento. **Por decisión aprobada (11), esta fase se trata como una ventana de integración posible desde fases tempranas, pero no se implementa hasta verificar formalmente qué mecanismo real ofrece el proveedor:** aplicación con deep link, API formal, contacto telefónico, WhatsApp Business, u otro. La arquitectura de integración debe permitir sustituir el proveedor o el mecanismo elegido sin rediseñar el núcleo del sistema.

**Problema que resuelve.** Cierra el último tramo del flujo de usuario — descubrir algo y poder llegar son necesidades igual de reales.

**Módulos que incluye.** Integración de movilidad, con el mecanismo concreto (deep link, API, WhatsApp, etc.) a definir tras la investigación formal.

**De qué depende.** Técnicamente, de nada dentro de este plan — solo de ubicación y lugares/eventos, ya existentes desde la Fase 0. Es la fase con menos dependencias reales de todo el plan; puede investigarse y prototiparse desde etapas muy tempranas, aunque su implementación final espere a que la investigación de mecanismos esté cerrada.

**Qué bloquea hasta completarse.** Nada.

**Tablas nuevas.** Ninguna necesariamente si se resuelve con deep link parametrizado; `mobility_referrals` opcional si se decide medir conversión.

**Entidades nuevas.** Referencia de movilidad (opcional).

**APIs externas necesarias.** Depende enteramente del resultado de la investigación formal exigida por la decisión 11 — puede ser una API, puede ser simplemente un deep link a una app, puede ser una integración vía WhatsApp Business. **Esta decisión no se toma hoy.**

**Migraciones que requerirá.** Opcional.

**Riesgos.** Dependencia de un socio externo cuya disponibilidad o mecanismo real puede no ser el que se asumía. Mitigado precisamente por la decisión 11: no se compromete ningún diseño técnico hasta confirmar el mecanismo real disponible.

**Pruebas necesarias.** Una vez definido el mecanismo: que la integración funcione con coordenadas reales; prueba de degradación (si falla, el deep link genérico a Google Maps/Uber sigue funcionando como respaldo, sin importar qué mecanismo se haya elegido para Azu Taxi).

**Criterio de terminado.** Existe una integración funcional con el mecanismo real confirmado del proveedor de transporte vigente, sustituible sin rediseñar el núcleo.

**Aporte a la Guía IA.** Permite que la Guía IA resuelva "cómo llegar" dentro de la misma conversación en la que ya recomendó algo. La forma exacta en que la IA invoca esta integración dependerá del mecanismo real que se confirme (un deep link se invoca distinto que una API o que una sugerencia de contactar por WhatsApp) — pero la filosofía de comportamiento ya definida en `AI_PHILOSOPHY.md` no cambia con el mecanismo elegido.

**Decisiones ya aprobadas aplicadas aquí:** 11. La única acción pendiente antes de cualquier implementación es la investigación formal de mecanismos disponibles — no una decisión de producto adicional del Product Owner en este momento.

---

## Fase 13 — Madurez operativa y cumplimiento (extiende la línea base de privacidad ya establecida)

**Objetivo.** Moderación completa con cola humana, soporte al negocio, internacionalización, cumplimiento legal completo, feature flags, observabilidad. **Importante: esta fase ya no introduce la privacidad desde cero** — eso se adelantó a la Fase 1 (decisión 9). Aquí se extiende esa línea base (términos de servicio completos, políticas más elaboradas, cumplimiento regulatorio ampliado) sobre una base de consentimiento y borrado que ya existe y funciona desde el principio del plan.

**Problema que resuelve.** Sin esto, el crecimiento de usuarios y negocios expone al ecosistema a riesgos operativos y legales que ninguna arquitectura de producto resuelve por sí sola.

**Módulos que incluye.** Moderación completa. Soporte y ayuda. Internacionalización. Cumplimiento legal completo y términos de servicio. Feature flags. Observabilidad.

**De qué depende.** Formalmente ninguna fase previa la bloquea de empezar — se recomienda iniciar sus componentes de forma incremental desde la Fase 5B (límites de tasa básicos ya exigidos ahí).

**Qué bloquea hasta completarse.** Ninguna fase de producto queda técnicamente bloqueada, pero el crecimiento sano del negocio depende de tenerlo resuelto antes de escalar el volumen varias veces por encima del actual.

**Tablas nuevas.** `moderation_reports`, `feature_flags`.

**Entidades nuevas.** Reporte de moderación, Feature flag.

**APIs externas necesarias.** Posible servicio de moderación automatizada; posible servicio de traducción.

**Migraciones que requerirá.** Creación de `moderation_reports` y `feature_flags`.

**Riesgos.** El riesgo principal es organizacional (postergación indefinida por no "verse" en una demo), no técnico.

**Pruebas necesarias.** Simulación de reporte → cola → resolución. Activación/desactivación de funcionalidad vía feature flag. Auditoría de que el historial de ubicación e IA puede exportarse/borrarse — reutilizando y extendiendo el mecanismo que ya existe desde la Fase 1, no uno nuevo.

**Criterio de terminado.** Cola de moderación funcional con tiempo de respuesta objetivo definido; políticas legales completas publicadas; activación de funcionalidad para un subconjunto de usuarios sin despliegue de código nuevo.

**Aporte a la Guía IA.** Protege la confianza en los datos que la Guía IA usa — la moderación filtra contenido no confiable antes de que la IA pueda citarlo o recomendarlo; el cumplimiento legal completo (que ya parte de una base sólida desde la Fase 1) sostiene la legitimidad del historial de conversación que la IA acumula desde la Fase 7.

**Decisiones ya aprobadas aplicadas aquí:** 9 (por herencia — el alcance de privacidad que faltaba aquí ya se resolvió antes). No requiere aprobación adicional.

---

# Matriz de dependencias de módulos

**Identidad (Actor unificado, con tipo Sistema/Institucional)** depende de: ✔ Nada (Fase 1).

**Ciudad** depende de: ✔ Nada (Fase 1).

**Zona** depende de: ✔ Ciudad (Fase 1) — nivel único por ahora, con referencia opcional a otra Zona como padre para crecer sin comprometerse a más niveles todavía.

**Privacidad y consentimiento** depende de: ✔ Identidad — **adelantada a la Fase 1 por decisión aprobada**, ya no depende de que el resto del plan avance para existir.

**Verificación** depende de: ✔ Identidad — nunca aplica al Actor de tipo Sistema, que no la necesita.

**Negocios (perfil extendido)** depende de: ✔ Identidad, ✔ Verificación.

**Lugares** depende de: ✔ Ciudad.

**Eventos** depende de: ✔ Lugares, ✔ Categorías.

**Publicaciones y Promociones** depende de: ✔ Identidad, ✔ Verificación, ✔ Negocios, ✔ Modelo de Publicación unificado.

**Seguir (personas y negocios)** depende de: ✔ Identidad, ✔ Negocios (perfil) — **no depende de Publicaciones**, por eso es la Fase 5A y puede ir en paralelo con la Fase 4.

**Comentarios / Guardados / Reacciones generalizadas / Compartir** depende de: ✔ Identidad, ✔ Publicaciones — Compartir ya está disponible como tipo desde la Fase 1 (no necesita esperar a la Fase 5B); Comentarios sí depende de que exista más de un tipo de contenido, por eso llega en la Fase 5B junto con la Fase 4.

**Reportar** depende de: ✔ Publicaciones, ✔ Identidad — **no vive dentro de Interacción**, es su propia entidad en el sistema de moderación (Fase 13), porque necesita motivo, estado de revisión y resolución, una forma de dato que una interacción simple no tiene.

**Feed / Descubrimiento** depende de: ✔ Publicaciones, ✔ Interacciones (5A+5B), ✔ Categorías, ✔ Ubicación.

**Búsqueda** depende de: ✔ Publicaciones, ✔ Categorías, ✔ Ubicación.

**Recomendaciones** depende de: ✔ Interacciones, ✔ Feed, ✔ Categorías, ✔ Identidad.

**Guía IA** depende de: ✔ Identidad (incluye su propio Actor de tipo Sistema desde la Fase 1), ✔ Negocios, ✔ Publicaciones, ✔ Categorías, ✔ Ubicación, ✔ Zona, ✔ Feed, ✔ Recomendaciones, ✔ Privacidad y consentimiento (para el historial de sesión).

**Plan/Itinerario generado por la Guía IA (motor de experiencias — visión futura, sin fase asignada)** depende de: ✔ Guía IA (con su Actor propio), ✔ Publicaciones (patrón núcleo+detalle), ✔ Interacciones (para guardar/compartir un plan como cualquier otro contenido). No depende de ningún módulo que no exista ya desde la Fase 1 y la Fase 6-7 — es, deliberadamente, una capacidad que la arquitectura ya sostiene sin necesitar nada nuevo estructural cuando se decida implementarla.

**Historias** depende de: ✔ Publicaciones.

**Video** depende de: ✔ Publicaciones.

**Token QR (genérico)** depende de: ✔ Identidad, ✔ Verificación, ✔ Publicaciones, ✔ Lugares.

**Check-in en lugares** depende de: ✔ Token QR, ✔ Lugares, ✔ Ubicación.

**Validación de entradas** depende de: ✔ Token QR, ✔ Eventos, ✔ Publicaciones.

**Promociones mediante QR** depende de: ✔ Token QR, ✔ Promociones.

**Reservas** depende de: ✔ Token QR, ✔ Publicaciones/Lugares, ✔ Pagos (si son pagadas).

**Venta de entradas internas** depende de: ✔ Token QR, ✔ Eventos, ✔ Pagos.

**Pagos** depende de: ✔ Identidad, ✔ Verificación, ✔ Transacción (abstracción común) — **proveedor todavía sin elegir, por decisión.**

**Suscripciones / Monetización** depende de: ✔ Verificación, ✔ Pagos, ✔ Feed (techo de 15% ya definido) — **pricing final todavía sin definir, por decisión.**

**Publicidad / Contenido promocionado** depende de: ✔ Feed (techo 15% auditable), ✔ Suscripciones, ✔ Publicaciones. **Restricción permanente: nunca puede alterar las recomendaciones de la Guía IA.**

**Notificaciones** depende de: ✔ Identidad, ✔ Interacciones, ✔ Ubicación (a futuro).

**Analíticas** depende de: ✔ Interacciones, ✔ Publicaciones, ✔ Verificación, ✔ Token QR.

**Moderación** depende de: ✔ Publicaciones, ✔ Interacciones.

**Movilidad (transporte)** depende de: ✔ Ubicación, ✔ Lugares/Eventos — **mecanismo/proveedor sin confirmar, por decisión (investigación formal pendiente).**

**Multi-ciudad (expansión real)** depende de: ✔ Ciudad, ✔ prácticamente todos los demás módulos ya generalizados correctamente.

---

# Paralelización, secuencia estricta, y alcance para v2.0

## Qué puede desarrollarse en paralelo

- **La Fase 5A (seguir negocios) puede ejecutarse en paralelo con la Fase 4** — es la actualización más importante de esta sección respecto a la versión anterior del documento: ambas dependen únicamente de fases ya completadas (Fase 1-3), no una de la otra.
- Los componentes de la **Fase 13** (límites de tasa, borradores de políticas, scaffolding de feature flags) deben empezar de forma incremental desde la **Fase 5B**, no esperar a que el plan llegue formalmente a esa fase — con la salvedad de que la línea base de privacidad ya no es parte de este bloque incremental, porque ya se resolvió por completo en la Fase 1.
- **Fase 8** (Historias/Video) y **Fase 9** (QR) no comparten dependencias entre sí — pueden construirse en paralelo.
- **La investigación formal de mecanismos de Azu Taxi (Fase 12)** puede comenzar en paralelo con prácticamente cualquier fase desde la Fase 2-3 en adelante, precisamente porque no comparte dependencias reales con el resto del plan — aunque su implementación final espere a que esa investigación concluya (decisión 11).
- **Notificaciones** y **Analíticas** son transversales: cada fase que introduce un nuevo tipo de interacción o transacción añade su propio evento a estos sistemas ya existentes.

## Qué nunca debería empezar antes de otra cosa

- **Verificación (Fase 2) nunca antes de Identidad unificada (Fase 1).**
- **Publicaciones/Promociones (Fase 4) nunca antes de Verificación (Fase 2).**
- **QR de check-in/promociones (Fase 9) nunca antes de Verificación (Fase 2).**
- **Comercio interno (Fase 10) nunca antes del Token QR (Fase 9).**
- **Monetización (Fase 11) nunca antes del Feed híbrido con su techo ya definido (Fase 6).**
- **Fase 5B nunca antes de la Fase 4** — a diferencia de la Fase 5A, sí necesita contenido variado para generalizar comentarios/guardados/reacciones sobre algo real.
- **Ninguna implementación de Azu Taxi (Fase 12) antes de confirmar formalmente su mecanismo de integración real** — la investigación puede adelantarse, la implementación no (decisión 11).

## Qué puede esperar a una versión 2.0

- **Reacciones más allá de Me gusta / Quiero ir / Ya fui** — catálogo cerrado explícitamente por decisión del Product Owner; no se reabre sin evidencia real de valor.
- **Venta de entradas y reservas internas completas (Fase 10)** — `ticket_url` sigue siendo una alternativa válida indefinidamente.
- **Contenido promocionado a gran escala** — puede posponerse hasta tener suficiente volumen de negocios suscritos, aunque el techo y su gobernanza ya existan desde la Fase 6.
- **Internacionalización completa.**
- **Turismo mediante QR físico** — depende de coordinación institucional y instalación física, mucho más lenta que el desarrollo de software.
- **Reservas para servicios más allá de eventos.**
- **Multi-ciudad real.**
- **Precio final de la suscripción de negocio** — diferido explícitamente hasta validar valor medible (decisión 8), no una omisión.
- **Elección definitiva de proveedor de pagos y de transporte** — diferida explícitamente hasta investigar condiciones reales en Ecuador (decisiones 7 y 11).
- **La Guía IA como motor de experiencias** (generación de planes/itinerarios persistentes, decisión 16 y visión registrada en `AI_PHILOSOPHY.md` §16) — el modelo de datos ya la soporta desde la Fase 1 (Actor "Guía IA", patrón núcleo+detalle de Publicación), pero su implementación no tiene todavía una fase asignada; queda como visión de largo plazo a retomar cuando el resto del sistema social esté maduro.

---

*Fin del documento. No se ha creado ninguna migración, tabla, componente ni línea de código de la aplicación — este documento es exclusivamente planificación. Cada fase se implementa solo tras aprobación explícita, comenzando por la Fase 1 cuando el Product Owner apruebe la propuesta de ejecución concreta correspondiente.*
