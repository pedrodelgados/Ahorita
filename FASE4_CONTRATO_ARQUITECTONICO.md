# Fase 4 — Contrato arquitectónico (aprobado 2026-07-18)

**Subordinado a `PRODUCT_MANIFESTO.md` y `PRODUCT_STRATEGY.md`.** Este documento es la autoridad de diseño de toda la Fase 4 — aprobado explícitamente, sin nuevos rediseños de arquitectura. Cualquier decisión de implementación debe rendir cuentas a lo que aquí se define; si algo durante la implementación exige contradecirlo, se detiene el trabajo y se presenta como una nueva bifurcación, no se decide silenciosamente.

## Principio rector

**Nunca se migra un sistema estable antes de validar completamente el nuevo.** `events` permanece intacto durante toda la Fase 4 — sin cambios de esquema, de RLS, ni de comportamiento. El Feed, el `EventSheet`, la administración de eventos y las interacciones existentes sobre eventos deben verse y comportarse exactamente igual al cierre de cada bloque de esta fase.

## El Feed como centro de la fase

El Feed es la superficie donde el criterio local del Manifesto se vuelve tangible hoy, mientras la Guía IA todavía no puede encarnarlo por sí sola (eso llega en la Fase 7). Por eso la fase se construye y se ordena mentalmente alrededor del Feed, no de la base de datos: primero se prueba que el Feed puede combinar y jerarquizar contenido de múltiples fuentes (con Eventos como única fuente real), y solo después se le agregan fuentes nuevas (Publicaciones, Promociones).

**Límite explícito, repetido en cada bloque:** esta fase no construye ranking, afinidad, personalización ni contenido patrocinado — el orden del Feed sigue siendo estrictamente cronológico por cercanía temporal. Eso es, por diseño, exclusivamente alcance de la Fase 6 y la Fase 11.

## Mapeo de la estructura aprobada

1. Feed como centro del producto → **Bloque 1**.
2. Publicaciones alimentan el Feed → **Bloque 2**.
3. Promociones alimentan el Feed → **Bloque 3**.
4. Eventos siguen alimentando el Feed sin modificarse → propiedad garantizada desde el Bloque 1, no un bloque nuevo.
5. Compartidos fortalecen el Feed → **Bloque 4**.
6. La IA observa el Feed para aprender contexto → no se construye en esta fase (Fase 7); el Feed queda diseñado como un único punto de observación futuro.
7. Evaluar consolidación de `events` sobre el núcleo compartido → punto de decisión futuro, no de esta fase (ver cierre).

## Bloque 1 — El Feed como contrato central

Construir la capacidad del Feed de combinar contenido de múltiples fuentes con jerarquía visual clara, probada primero con Eventos (única fuente real hoy) sin modificarlo. Sin tablas nuevas. Criterio de aceptación: cero diferencia observable para el usuario; regresión completa del feed de eventos actual (orden, transición continua, likes) pasa sin cambios.

## Bloque 2 — Publicaciones alimentan el Feed

Núcleo nuevo de Publicación (subtipo "publicación regular"), independiente de `events`, incluyendo el caso de autoría por el Actor de sistema "Ahorita Editorial" (ya existente desde la Fase 1, decisión 12 del `MASTERPLAN.md`) — resuelve "noticias relevantes" sin construir un tipo de contenido nuevo. Conectado como segunda fuente al contrato del Bloque 1. Solo actores negocio verificados (o el Actor sistema) pueden publicar.

## Bloque 3 — Promociones alimentan el Feed

Subtipo "promoción" sobre el mismo núcleo: vigencia obligatoria, condición de canje en texto claro, expiración automática. Distinción permanente frente a "contenido patrocinado" (Fase 11, no construido todavía) — una promoción es un beneficio real ofrecido por el negocio, nunca un espacio pagado. Canje físico validado queda, a propósito, en la Fase 9.

## Bloque 4 — Compartidos fortalecen el Feed

Conectar el tipo de interacción "compartir" (reservado desde la Fase 1, nunca usado) a cualquier contenido del Feed — Eventos, Publicaciones y Promociones por igual. Bajo riesgo, puede construirse en paralelo a los demás bloques.

## Condición previa no técnica (pendiente antes del Bloque 2)

Antes de que exista una sola Publicación real, debe cerrarse con el Product Owner la política mínima de autenticidad y calidad de ese contenido (qué puede publicarse, límites de frecuencia razonables, qué pasa si un negocio verificado publica contenido de mala calidad repetidamente) — no un sistema de moderación completo (eso es Fase 13), pero sí reglas explícitas antes de abrir la puerta.

## Principios de Evolución de Producto

Reglas permanentes para todas las fases futuras, no solo esta:

1. Nunca se migra un sistema estable antes de validar completamente el nuevo.
2. Nunca se crea una funcionalidad solo porque otra aplicación la tiene.
3. Toda funcionalidad nueva debe fortalecer al menos uno de **cinco** pilares: Descubrimiento, Confianza, Hábito diario, Inteligencia de la Guía IA, o **Economía local**. Si no fortalece ninguno, debe justificarse explícitamente ante quien apruebe la fase, o descartarse.
4. La experiencia del usuario siempre tiene prioridad sobre la pureza del modelo de datos.
5. La arquitectura sirve al producto, nunca al revés.
6. Toda convivencia temporal entre dos sistemas debe tener un punto de revisión documentado y con criterio explícito — nunca queda indefinida por omisión.
7. Ninguna fase se diseña empezando por la base de datos — se empieza por lo que el usuario ve primero, después lo que consume, y solo al final por lo que lo sostiene técnicamente.
8. Ninguna fase adelanta trabajo de una fase futura, aunque sea tentador mientras ya se está construyendo algo relacionado.
9. **El usuario debe volver por el valor que encuentra, nunca por mecanismos artificiales de retención.**
10. **Toda funcionalidad debe poder explicarse en una sola frase clara; si requiere una justificación excesiva, probablemente no pertenece al producto.**
11. **La ciudad siempre tiene prioridad sobre la plataforma; si una decisión beneficia a la aplicación pero perjudica la calidad de la información para la ciudad, debe rechazarse.**

## Cierre: punto de decisión pendiente

La futura consolidación de `events` sobre el núcleo compartido de Publicación se evalúa formalmente solo después de que Publicaciones y Promociones lleven un período real de uso en producción y hayan demostrado que el modelo es correcto. No se asume por inercia — será una decisión nueva, con su propio análisis, cuando llegue el momento.

---

*Documento aprobado. La implementación sigue la metodología: Análisis → Aprobación → Implementación → Verificación → Documentación → Cierre, bloque por bloque, empezando por el Bloque 1.*
