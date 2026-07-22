# Fase 6 — Contrato arquitectónico conceptual (aprobado 2026-07-22)

**Subordinado a `VISION_MAESTRA.md` y a `FASE6_FILOSOFIA_DESCUBRIMIENTO.md`** (autoridad filosófica del descubrimiento, congelada). Este documento traduce esos veinte principios en una arquitectura conceptual verificable — componentes, responsabilidades, límites y garantías — sin todavía tablas, migraciones ni funciones. Es la autoridad de diseño de toda la Fase 6, con el mismo estatus que `FASE4_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 4: cualquier decisión técnica posterior debe rendirle cuentas; si algo durante el análisis de un bloque exige contradecirlo, se detiene el trabajo y se presenta como una nueva bifurcación, nunca se decide silenciosamente.

**Alcance de este documento.** Arquitectura conceptual únicamente. No define tablas, columnas, índices, funciones de base de datos, fórmulas de puntuación ni componentes de interfaz. Esas decisiones pertenecen al análisis de cada bloque, que empieza solo después de que este contrato quede aprobado.

## Principio rector

**Ninguna garantía de este documento es negociable a cambio de una métrica de compromiso, de una conveniencia técnica, o de la presión de tener "un algoritmo funcionando".** Si en algún momento del diseño técnico posterior una implementación concreta solo puede lograrse debilitando la equidad del negocio pequeño, el espacio de serendipia, la explicabilidad o cualquier otra garantía definida aquí, la implementación está mal — se detiene y se replantea, nunca se debilita la garantía para que el código sea más simple. Este principio es la traducción arquitectónica directa del principio 20 de `FASE6_FILOSOFIA_DESCUBRIMIENTO.md`: la ciudad siempre debe ser más grande que el algoritmo.

## Relación con la arquitectura ya existente

La Fase 6 no empieza de cero. Hereda y extiende, sin reemplazar, dos piezas ya construidas y probadas:

- **`mergeFeedSources` (Fase 4, Bloque 1)** sigue siendo el único punto de composición multi-fuente del Feed — el contrato ya probado de que Eventos, Publicaciones y Promociones pueden combinarse con un criterio de orden compartido. La Fase 6 no lo sustituye: lo enriquece, agregándole las capas de puntuación y garantía que este documento define. Si el diseño técnico posterior necesitara reemplazar ese contrato en vez de extenderlo, eso sería una bifurcación que requiere aprobación explícita, no una decisión de implementación silenciosa.
- **`interactions` (Fase 1, Bloque 4; generalizada en las Fases 4, 5A y 5B)** sigue siendo la única fuente de verdad de comportamiento social. La Fase 6 la **lee**, nunca la modifica ni le agrega tipos nuevos — el catálogo de `interactions.type` quedó formalmente cerrado al cierre de la Fase 5B.

## Los grandes componentes del sistema

Seis componentes conceptuales, cada uno con una responsabilidad única y sin superposición:

1. **Fuentes de contenido** (ya existentes: Eventos, Publicaciones, Promociones — Historias se sumará cuando exista). No son parte nueva de esta fase — son el insumo que ya produce cada tipo de contenido, sin cambios en su propio ciclo de vida.

2. **Registro de señales** (`interactions`, ya existente). El insumo de comportamiento social. Su única responsabilidad de cara a esta fase es dejarse leer — nunca escribirse desde aquí. **Regla de pureza (no negociable): el Registro de Señales es pasivo.** Su única responsabilidad es registrar interacciones verificables. Nunca interpreta, nunca puntúa, nunca aprende, nunca decide. Cualquier lectura de significado sobre una señal (qué tan fuerte es, qué tan reciente, qué tan relevante) ocurre exclusivamente en los componentes que la consumen — nunca en el propio registro.

3. **Motor de Afinidad** (nuevo). Responsabilidad única: producir, para cada persona, una estimación legible de qué le interesa, a partir del Registro de Señales, respetando la jerarquía de fuerza de señal ya establecida (`FASE6_FILOSOFIA_DESCUBRIMIENTO.md` §4: compromiso real > volumen). **Regla de pureza (no negociable): el Motor de Afinidad construye conocimiento, no decisiones.** Su salida representa únicamente una descripción de la persona — nunca determina directamente qué contenido aparece en el Feed ni en qué orden. Esa frontera importa incluso cuando, en la práctica, el resultado sea el mismo: el Motor de Afinidad debe poder consultarse, mostrarse y editarse por la persona como una descripción de sí misma, independientemente de si algún componente posterior lo usa o no para componer un Feed en ese momento. Debe ser visible y editable por la propia persona (ya anticipado en `MASTERPLAN.md`, Fase 6, criterio de terminado).

**Principios permanentes del Motor de Afinidad (incorporados durante el análisis del Bloque 1, 2026-07-22):**

- **Las afinidades describen personas. Nunca las clasifican.** El perfil se presenta siempre como una descripción abierta y corregible, nunca como una etiqueta cerrada de tipo de usuario. Ninguna interfaz futura debe resumir a una persona en una sola etiqueta derivada de este perfil.
- **El perfil de afinidad representa siempre la mejor interpretación disponible en ese momento — nunca una verdad definitiva sobre la persona.** Debe permanecer siempre abierto a corregirse y evolucionar; ninguna afinidad se presenta ni se trata internamente como un hecho cerrado.
- **Cada afinidad registra su propia última actualización**, como indicador temporal (no necesariamente una fecha exacta expuesta) que ayuda a la persona a entender cómo evoluciona su perfil con el tiempo.
- **Las afinidades nunca compiten entre sí.** Cada una describe una dimensión distinta de la persona; una afinidad fuerte no invalida ni reduce el valor de otra afinidad diferente. El sistema no debe interpretar la fuerza relativa entre afinidades como una jerarquía de exclusión.
- **El registro append-only de evidencia existe exclusivamente para preservar la coherencia del aprendizaje del sistema.** Nunca deberá utilizarse para reconstruir cronologías personales visibles. Nunca deberá convertirse en un historial de actividad del usuario. Nunca deberá emplearse para generar experiencias invasivas o de vigilancia. Su único propósito es garantizar la estabilidad, trazabilidad y capacidad futura de evolución del Motor de Afinidad.

4. **Motor de Garantías** (nuevo — cubre diversidad, serendipia y equidad a la vez, porque las tres comparten la misma naturaleza: son restricciones estructurales, no señales de puntuación). Responsabilidad única: asegurar que ninguna de las dimensiones de diversidad (`FASE6_FILOSOFIA_DESCUBRIMIENTO.md` §7), el espacio de serendipia (§18) ni la visibilidad del negocio pequeño con poca frecuencia de publicación (§6) lleguen jamás a cero, sin importar lo que produzca el Motor de Afinidad. Actúa **junto** al Motor de Afinidad, nunca como una corrección posterior aplicada al final — es co-igual, no un parche.

**Principio permanente (incorporado durante el análisis del Bloque 2, 2026-07-22): la elegibilidad siempre ocurre antes que las garantías.** Primero existe un universo de contenido elegible — público, vigente, de un actor autorizado — y solo después actúan, sobre ese universo ya elegible, los carriles de novedad, diversidad, equidad y serendipia. Ninguna garantía convierte en elegible un contenido que no lo era; las garantías filtran y limitan cantidad dentro de lo ya elegible, nunca amplían la elegibilidad de base. Finalmente, y solo entonces, el Compositor del Feed decide composición, deduplicación, interleaving y explicación final. Este orden — elegibilidad → garantías → composición — es una secuencia arquitectónica fija, no una convención de implementación de este bloque, precisamente para que ninguna fase futura mezcle estas responsabilidades.

5. **Motor Editorial** (nuevo, en el sentido de mecanismo — el contenido mismo ya existe desde la Fase 1 vía el Actor "Ahorita Editorial"). Responsabilidad única: decidir qué contenido curado por el equipo se inserta y cuándo, con un criterio humano y declarado, **sin participar del mismo cálculo de puntuación** que usan Afinidad y Garantías. Su relación con el resto del sistema es de inserción paralela, no de competencia por posición.

**Principio permanente (incorporado durante el diseño técnico del Motor Editorial, 2026-07-22): Editorial nunca existe para corregir al algoritmo; existe para aportar criterio humano allí donde el algoritmo, por naturaleza, nunca puede sustituirlo.** El Motor Editorial no es un mecanismo de ajuste fino ni de compensación de lo que produzcan la Afinidad o las Garantías — no existe para "arreglar" un resultado algorítmico que alguien considere insuficiente. Existe porque hay decisiones (contexto local, oportunidad editorial, relevancia de una fecha, criterio humano declarado) que ningún cálculo de señales puede producir por definición, sin importar cuánto se perfeccione ese cálculo. Esta distinción importa para el diseño técnico: el Motor Editorial nunca debe recibir como entrada el resultado de la Afinidad o las Garantías para "corregirlo", y nunca debe justificarse una selección editorial en términos de lo que el algoritmo no mostró.

6. **Compositor del Feed** (extiende `mergeFeedSources`). Responsabilidad única: integrar **seis entradas concretas, nunca cinco ni tres** — Afinidad, Novedad, Diversidad, Equidad, Serendipia y Editorial (Novedad/Diversidad/Equidad/Serendipia son los cuatro carriles co-iguales del Motor de Garantías, nunca una sola entrada agregada; Editorial es una entrada paralela y distinta, nunca fusionada con Garantías ni con Afinidad) — más la restricción dura de cercanía geográfica y la restricción dura del techo de contenido patrocinado, y producir el orden final — junto con la razón de cada ítem (ver "Explicabilidad" más abajo). Es el único punto de salida del sistema hacia el Feed que la persona ve. **Regla de pureza (no negociable): el Compositor del Feed es un componente puro.** Recibe esas seis entradas ya elegibles y produce únicamente una composición explicable del Feed — nada más. No aprende, no escribe datos, no modifica afinidades, no registra señales. Solo compone. Cualquier necesidad futura de que el sistema "aprenda" de cómo reacciona la persona a una composición específica del Feed pertenece al Motor de Afinidad (vía el Registro de Señales, que sigue siendo la única puerta de entrada de comportamiento) — nunca se resuelve dándole al Compositor una vía de escritura propia.

**Principios permanentes del Compositor del Feed (incorporados durante el diseño técnico del Bloque 4, 2026-07-22):**

- **El Compositor nunca intenta ser inteligente.** La inteligencia (interpretar qué le interesa a una persona) pertenece exclusivamente al Motor de Afinidad; la protección estructural (que ninguna dimensión desaparezca) pertenece exclusivamente al Motor de Garantías; el criterio humano pertenece exclusivamente al Motor Editorial. El Compositor únicamente organiza, integra y compone lo que esos tres ya decidieron — puede usar la fuerza de una afinidad para decidir cuánto espacio y en qué posición ocupa, pero nunca decide por sí mismo qué le interesa a alguien, nunca aprende de cómo reacciona la persona a una composición, y nunca reinterpreta ni ajusta una decisión ya tomada por otro componente.
- **El anti-monopolio es transversal, no exclusivo de la composición final.** Ningún carril, incluidos Afinidad y Editorial, puede monopolizar internamente sus propios candidatos por volumen de un mismo actor antes de llegar al entrelazado — se reutiliza siempre el mismo mecanismo ya probado (tope de candidatos por actor dentro del propio carril), nunca una regla distinta inventada para cada uno.
- **Editorial reclama por completo el contenido que le corresponde.** Cuando un ítem califica simultáneamente para Editorial y para cualquier otra entrada, Editorial consume su propio cupo, define la propiedad del ítem dentro de la composición, y define su explicación visible. Las demás entradas no pierden su turno: simplemente lo ocupan con otro candidato.
- **Las proporciones son siempre relativas, nunca una cantidad fija de posiciones.** El Compositor razona en fracciones del universo elegible real de cada solicitud — cualquier ejemplo con un número de referencia (p. ej. "veinte") es únicamente pedagógico, nunca parte del algoritmo. Los valores concretos de cada fracción son calibración inicial (`discovery_calibration()`), nunca una verdad permanente — podrán evolucionar mediante futuras migraciones cuando exista evidencia real de uso.

Un séptimo elemento, la **Gobernanza de Contenido Patrocinado** (el techo auditable del 15%, ya decidido — decisión 4 del `MASTERPLAN.md`), no es un componente que produce contenido — es una restricción dura que el Compositor debe respetar siempre, incluso hoy que no existe todavía ningún contenido patrocinado real que gobernar (llega en la Fase 11). Se construye el mecanismo ahora, vacío de contenido, precisamente para que el límite no se decida bajo presión comercial futura (`MASTERPLAN.md`, Fase 6, ya lo dice explícitamente).

La **Guía IA** y el **Motor de Búsqueda** quedan fuera de estos seis componentes a propósito — ver "Límites" más abajo.

## Reglas de pureza de componentes (no negociables)

Tres reglas, cada una anclada a un componente específico, que refuerzan la separación de responsabilidades por encima de cualquier conveniencia de implementación futura:

1. **El Registro de Señales es pasivo.** Su única responsabilidad es registrar interacciones verificables. Nunca interpreta. Nunca puntúa. Nunca aprende. Nunca decide.
2. **El Motor de Afinidad construye conocimiento, no decisiones.** Su salida representa únicamente una descripción de la persona. Nunca determina directamente qué contenido aparece en el Feed.
3. **El Compositor del Feed es un componente puro.** Recibe sus seis entradas (afinidad, novedad, diversidad, equidad, serendipia, editorial) ya elegibles. Produce únicamente una composición explicable del Feed. No aprende. No escribe datos. No modifica afinidades. No registra señales. No decide relevancia por sí mismo. Solo organiza, integra y compone.

Estas tres reglas son la razón por la que este sistema puede describirse como una cadena de responsabilidad de un solo sentido: **Registro de señales → Motor de Afinidad → (Motor de Garantías + Motor Editorial) → Compositor del Feed → lo que la persona ve.** Ningún componente escribe hacia atrás en esta cadena. Si el diseño técnico de un bloque futuro encuentra una necesidad real de que la información fluya en sentido contrario (por ejemplo, que el Compositor influya en el Motor de Afinidad, o que el Motor de Afinidad escriba directamente en el Registro de Señales), eso no se resuelve rompiendo la pureza del componente — se resuelve haciendo que el comportamiento de la persona frente a esa composición se registre como una señal nueva y legítima en el Registro de Señales, exactamente como cualquier otra interacción, y dejando que el Motor de Afinidad la vuelva a leer en su próximo ciclo.

## Cómo se relacionan entre sí

El flujo conceptual, en el orden en que cada componente participa:

Las **Fuentes de contenido** y el **Registro de señales** son insumos de solo lectura para todo lo demás. El **Motor de Afinidad** lee el Registro de señales y produce un perfil de afinidad por persona. El **Motor de Garantías** lee ese perfil, las Fuentes de contenido (para conocer categoría, antigüedad, y frecuencia de publicación del actor) y produce las correcciones/inserciones necesarias para que ninguna dimensión de diversidad o serendipia llegue a cero. El **Motor Editorial** decide, en paralelo y de forma independiente, qué insertar y cuándo. El **Compositor del Feed** toma las seis entradas (afinidad, novedad, diversidad, equidad, serendipia, editorial), les aplica las dos restricciones duras (cercanía geográfica, techo de patrocinado) y produce el orden final con su explicación por ítem.

Ningún componente puede saltarse al Compositor para llegar directo al Feed — ni siquiera el contenido editorial, que participa como una entrada más al Compositor, aunque con un criterio de inserción propio y distinto al del resto.

## Límites entre Editorial, Feed, Descubrimiento y Guía IA

Estos cuatro términos se usan sueltos con frecuencia y es fácil que se difuminen entre sí. Este contrato fija sus fronteras:

- **Editorial** decide *qué* curar y *cuándo* insertarlo, con criterio humano. No decide el orden del resto del Feed, no deriva su criterio de señales de comportamiento, y no compite dentro del mismo cálculo de puntuación que el contenido social o comercial.
- **Feed** (el Compositor) decide el *orden final* de lo que se muestra, integrando todos los insumos. No genera contenido, no decide relevancia editorial, no conversa con la persona.
- **Descubrimiento** (la capacidad transversal que forman el Motor de Afinidad + el Motor de Garantías juntos) decide *qué tan relevante* es cada ítem para cada persona y garantiza que la variedad y lo inesperado tengan espacio real. No decide criterio editorial, no compite con Editorial, y no es, por sí solo, sinónimo de "Feed" — es uno de sus insumos.
- **Guía IA** (Fase 7, fuera del alcance de esta fase) consume el perfil de afinidad y el Compositor ya construidos aquí para razonar y responder en lenguaje natural. No participa en absoluto en componer el Feed de esta fase, y esta fase no construye ninguna superficie conversacional nueva.

El **Motor de Búsqueda** (ya existente desde la Fase 3, `search_actors`, extendido en esta fase como "búsqueda mejorada" de texto) es un componente separado que comparte las Fuentes de contenido pero nunca pasa por el Compositor del Feed — una búsqueda responde una pregunta puntual, no compone una experiencia continua. Búsqueda por intención en lenguaje natural queda, por diseño ya aprobado en `MASTERPLAN.md`, delegada a la Guía IA en la Fase 7.

## Qué partes serán determinísticas y cuáles adaptativas

Esta distinción es, en sí misma, un principio de diseño permanente: **las garantías son determinísticas y no negociables; solo la personalización dentro de esas garantías puede ser adaptativa.**

**Determinístico** (el mismo insumo produce siempre el mismo resultado, nunca aprende):
- La restricción de cercanía geográfica actúa como filtro base, nunca como señal de puntuación (`FASE6_FILOSOFIA_DESCUBRIMIENTO.md` §11).
- El techo auditable de contenido patrocinado y su gobernanza.
- La exclusión absoluta de las señales prohibidas (§5 de la filosofía, ver también "Datos que nunca podrán utilizarse" abajo).
- La regla de que ninguna dimensión de diversidad ni el espacio de serendipia lleguen a cero — la *regla* es fija, aunque el ítem específico que la satisface en cada momento pueda variar.
- El criterio de inserción editorial — humano, declarado, nunca aprendido de comportamiento.
- La vigencia real del contenido — algo vencido no aparece, sin importar la afinidad calculada.
- Que las preferencias explícitas siempre ganen sobre cualquier inferencia de comportamiento.

**Adaptativo** (cambia con el comportamiento acumulado de cada persona):
- El perfil de afinidad en sí mismo.
- El peso relativo que cada categoría, zona o tipo de contenido tiene para una persona particular.
- Qué ítem específico llena, en cada momento, el espacio garantizado de diversidad o serendipia — el espacio existe siempre (determinístico), pero puede beneficiarse de cierta lectura de contexto para elegir mejor qué lo ocupa.

## Qué datos podrán utilizarse

- Todas las interacciones ya construidas y cerradas en su catálogo (me gusta, guardado, seguimiento, quiero ir, ya fui, compartir, comentario), respetando la jerarquía de fuerza ya establecida.
- Cercanía geográfica real, cuando esté disponible y con el consentimiento ya exigido desde la línea base de privacidad de la Fase 1.
- Estado de verificación del actor, como señal de confianza (nunca como señal de tamaño o inversión).
- Vigencia real del contenido (fechas, estados).
- Categoría y zona de cada contenido.
- Antigüedad de la señal y del propio contenido (recencia).
- Preferencias explícitas declaradas directamente por la persona, si en el futuro el sistema llega a ofrecer ese mecanismo — su diseño concreto queda para el análisis del bloque correspondiente, no para este contrato.

## Qué datos nunca podrán utilizarse

- **El contenido de conversaciones privadas con la Guía IA** — protegido ya por `AI_PHILOSOPHY.md`, principio no negociable 11. Ni siquiera de forma agregada o anonimizada, sin una decisión explícita nueva que lo autorice específicamente.
- **El monto o la frecuencia de pago de un negocio** como señal de relevancia orgánica — solo puede afectar la porción ya gobernada y separada del techo de contenido patrocinado, nunca el resto del sistema.
- **El volumen de publicación acumulado histórico** como proxy de relevancia — es exactamente la "dominancia orgánica" que `VISION_MAESTRA.md` §6 y `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` §5/§9 prohíben.
- **"Guardado"** para inferir señales públicas, compartidas o de ranking — sigue siendo una interacción privada, protegida desde la Fase 1, y este sistema no puede convertirla en un dato menos privado de lo que ya es.
- **Cualquier atributo que pudiera derivar en discriminación** no relacionada con la utilidad real de la recomendación — conecta directamente con el compromiso de `VISION_MAESTRA.md` §4 de vigilar activamente que el criterio local no termine favoreciendo sistemáticamente ciertos barrios o clases sociales bajo apariencia de neutralidad algorítmica.

## Cómo se preservará la explicabilidad

La explicabilidad no es un informe que se genera después, por separado — es una responsabilidad de cada componente en el momento en que contribuye al resultado. El Motor de Afinidad, el Motor de Garantías y el Motor Editorial deben adjuntar, cada uno, una razón atómica y legible a cualquier ítem en el que participan ("porque sigues a este negocio", "es nuevo y todavía no tiene historial", "seleccionado por el equipo editorial de Ahorita", "está cerca de ti"). El Compositor agrega esas razones en una explicación priorizada y honesta, sin abrumar con todas a la vez cuando varias aplican al mismo ítem.

Esto traduce a nivel de componente lo que ya rige a la Guía IA (`AI_PHILOSOPHY.md`, principio 9: "siempre puede explicar el porqué de una recomendación") y lo eleva, por primera vez, a un requisito igual de válido para el Feed algorítmico. Ninguna persona debería recibir jamás, como respuesta a "¿por qué me muestras esto?", algo equivalente a "porque el algoritmo lo decidió" — esa frase queda explícitamente prohibida como resultado aceptable de este sistema.

## Cómo se garantizará la equidad para negocios pequeños

Dos mecanismos trabajando juntos, no uno solo:

1. **Evaluación por publicación, nunca por historial acumulado.** El Motor de Afinidad y el Compositor deben evaluar la relevancia de cada publicación en sus propios méritos — nunca acumulando ventaja porque el actor que la produjo publicó mucho en el pasado.
2. **Una dimensión protegida explícita dentro del Motor de Garantías** para negocios con baja frecuencia de publicación pero contenido genuino — con el mismo estatus de "nunca en cero" que las demás dimensiones de diversidad.

Ningún peso de ningún componente puede derivarse, directa o indirectamente, del gasto o del tamaño del negocio — eso queda prohibido con el mismo peso que la prohibición ya existente de que el contenido patrocinado compre una recomendación de la Guía IA.

## Cómo se evitarán cámaras de eco

El Motor de Garantías no es un ajuste posterior ni un componente opcional — es co-igual al Motor de Afinidad dentro del Compositor, con una cuota mínima garantizada que ninguna configuración puede reducir a cero (ver "Configurable vs. principio permanente" abajo). La prueba de que este mecanismo funciona no es que exista en el diseño — es que el Feed de una persona con mucho historial acumulado siga mostrando, con el tiempo, una amplitud de categorías comparable a la que mostraba al principio, no una versión progresivamente más estrecha.

## Cómo se incorporará la serendipia

La serendipia es un mecanismo explícito dentro del Motor de Garantías, con un criterio de selección distinto al de las demás dimensiones de diversidad: **no depende de relevancia inferida en absoluto.** Mientras que diversidad de categoría o de antigüedad todavía razonan sobre qué tan relevante podría ser algo, la serendipia existe precisamente para lo que no se justificaría por ninguna medida de relevancia calculada — su valor está en que amplía el mundo de la persona sin necesitar esa justificación. Puede coincidir con contenido editorial o con contenido social/comercial que simplemente no encaja en el patrón de afinidad de la persona; lo que la define no es su origen, sino que no depende de afinidad para merecer un lugar.

## Cómo convivirán afinidad, novedad y descubrimiento

Los tres —y la serendipia, que es un cuarto elemento distinto de estos— deben pensarse como carriles con una garantía mínima propia dentro del Compositor, nunca como una única fórmula de pesos donde un coeficiente mal ajustado podría matemáticamente reducir a cero a cualquiera de ellos. Esto es una restricción de diseño explícita para el análisis técnico posterior: cualquier mecanismo de puntuación que se proponga debe poder demostrar que, estructuralmente, ninguno de los cuatro carriles puede desaparecer, no solo que "en la práctica" no suele pasar.

## Cómo evolucionará el sistema desde un usuario nuevo hasta uno con suficiente historial

El Compositor debe reconocer explícitamente un **estado de señal insuficiente** — no como un caso especial oculto o un parche, sino como un estado reconocido del sistema con su propio comportamiento esperado: cuando la señal de afinidad es escasa, su peso se reduce automáticamente y el peso de cercanía, vigencia, criterio editorial y novedad aumenta proporcionalmente para compensar — nunca al revés, y nunca fabricando afinidad artificial a partir de datos insuficientes para simular una personalización que todavía no existe.

La transición entre "señal insuficiente" y "señal suficiente" debe ser gradual, no un salto en un umbral arbitrario — un cambio abrupto de personalidad del Feed en un punto fijo se sentiría como una inconsistencia, no como una mejora.

## Qué decisiones quedarán configurables y cuáles serán principios permanentes

**Configurable** (con registro de auditoría, según la decisión 4 ya aprobada en `MASTERPLAN.md`):
- El techo exacto de contenido patrocinado (hoy, 15% aproximado).
- Las proporciones relativas entre las seis entradas del Compositor (afinidad, novedad, diversidad, equidad, serendipia y editorial) — siempre expresadas como fracciones del universo elegible real, nunca como una cantidad fija de posiciones, y siempre dentro del límite de que ningún carril de Garantías pueda desaparecer de la composición.
- Parámetros de decaimiento de frescura (qué tan rápido pierde peso algo por antigüedad).

**Principio permanente** (nunca configurable, ni siquiera por el administrador principal):
- Que el contenido patrocinado jamás supere el techo auditado.
- Que ningún carril de Garantías (novedad, diversidad, equidad, serendipia) desaparezca de la composición por el peso o la abundancia de otro carril — la ausencia real de candidatos elegibles es válida; la desaparición causada por la propia composición no lo es. Afinidad y Editorial, en cambio, pueden legítimamente estar en cero (usuario nuevo sin historial, ninguna selección editorial activa) — esa es una salida honesta, nunca un defecto a corregir con relleno artificial.
- Que Afinidad y Editorial nunca puedan monopolizar internamente sus propios turnos por el volumen de contenido de un único actor — mismo mecanismo de tope por actor ya usado en Diversidad, reutilizado, nunca una regla nueva por carril.
- Que Editorial, cuando un contenido le pertenece también a otra entrada, reclame siempre por completo su cupo, su propiedad dentro de la composición y su explicación visible.
- Que la Editorial nunca participe del mismo cálculo de puntuación que el resto del sistema.
- Que la cercanía geográfica actúe siempre como restricción base, nunca como señal de puntuación.
- Que Editorial nunca exista para corregir al algoritmo; existe para aportar criterio humano allí donde el algoritmo, por naturaleza, nunca puede sustituirlo.
- Que las preferencias explícitas siempre ganen sobre la inferencia de comportamiento.
- Que ninguna de las señales prohibidas (ver "Datos que nunca podrán utilizarse") participe jamás, bajo ninguna configuración administrativa.
- Que todo ítem del Feed pueda explicarse con una razón honesta y legible.

## Qué partes pertenecen realmente a la Fase 6 y cuáles deben reservarse

**Pertenece a esta fase:**
- El Motor de Afinidad, con su perfil legible y editable por la persona.
- El Motor de Garantías (diversidad, serendipia, equidad del negocio pequeño).
- El Motor Editorial como mecanismo de inserción paralela.
- El Compositor del Feed extendido, con su capa de explicabilidad.
- La gobernanza auditable del techo de contenido patrocinado — el mecanismo, no el contenido real todavía.
- La extensión de búsqueda ya existente hacia una "búsqueda mejorada" de texto.

**Se reserva para fases posteriores:**
- La Guía IA consumiendo este motor para conversar y personalizar sus respuestas (Fase 7).
- Búsqueda por intención en lenguaje natural (Fase 7, delegada a la Guía IA).
- Contenido patrocinado real (Fase 11) — esta fase solo construye el techo que lo gobernará cuando llegue.
- Cualquier ponderación basada en check-in físico confirmado (depende del Token QR de la Fase 9, todavía no construido).
- La decisión, todavía pendiente, de si Ahorita debería preguntar explícitamente qué tipo de vida vive alguien en vez de inferirlo en silencio — sigue abierta, ni la filosofía ni este contrato la cierran.
- Memoria de barrio/comunidad como identidad narrativa (`VISION_MAESTRA.md` §9) — sin fase asignada todavía en `MASTERPLAN.md`.

## Mapeo tentativo de bloques (sujeto a su propio análisis y aprobación)

Al mismo nivel de compromiso que tuvo el "Mapeo de la estructura aprobada" del contrato de la Fase 4 antes de implementarse — una referencia de orden probable, no una decisión cerrada de alcance por bloque. Cada bloque tendrá su propio análisis, aprobación, implementación, verificación, documentación y cierre, exactamente con la misma metodología ya usada en cada fase anterior:

1. Motor de Afinidad — perfil legible y editable, alimentado por el Registro de señales ya existente.
2. Motor de Garantías — diversidad, serendipia y equidad del negocio pequeño, co-igual al Motor de Afinidad.
3. Motor Editorial y Compositor del Feed extendido — integración de todos los insumos, explicabilidad por ítem, restricción de cercanía.
4. Gobernanza auditable del techo de contenido patrocinado — mecanismo vacío de contenido real.
5. Búsqueda mejorada — extensión del motor ya existente.

Este orden puede revisarse por completo durante el análisis del primer bloque si el propio análisis revela una secuencia mejor — no es una promesa de secuencia, es un punto de partida para la conversación de priorización de cada bloque.

## Principios de Evolución de Producto (vigentes, no se reabren)

Los once principios ya aprobados en `FASE4_CONTRATO_ARQUITECTONICO.md` siguen gobernando esta fase sin excepción — en particular el principio 3 (toda funcionalidad nueva debe fortalecer al menos uno de los cinco pilares: Descubrimiento, Confianza, Hábito diario, Inteligencia de la Guía IA, o Economía local) y el principio 11 (la ciudad siempre tiene prioridad sobre la plataforma). Este contrato no los repite en detalle — los hereda íntegros.

---

*Documento aprobado. Arquitectura conceptual únicamente — sin tablas, sin migraciones, sin funciones, sin fórmulas de puntuación. El análisis del primer bloque (Motor de Afinidad) comienza solo después de que este contrato quede consolidado.*
