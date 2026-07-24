# Fase 7 — Contrato arquitectónico conceptual (aprobado 2026-07-23)

**Subordinado a `VISION_MAESTRA.md` y a `FASE7_FILOSOFIA_GUIA_IA.md`** (autoridad filosófica de la Guía IA para esta fase, congelada) **y coherente con `AI_PHILOSOPHY.md`** (comportamiento ya definido de la Guía IA, que este documento no rediseña). Este documento traduce los veintitrés principios de la filosofía en una arquitectura conceptual verificable — componentes, responsabilidades, límites y garantías — sin todavía sesiones, tablas, funciones, RPC, prompts ni proveedor de tecnología alguno. Es la autoridad de diseño de toda la Fase 7, con el mismo estatus que `FASE6_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 6: cualquier decisión técnica posterior debe rendirle cuentas; si algo durante el análisis de un bloque exige contradecirlo, se detiene el trabajo y se presenta como una nueva bifurcación, nunca se decide silenciosamente.

**Alcance de este documento.** Arquitectura conceptual únicamente. No define sesiones, tablas, columnas, funciones, RPC, ni el proveedor, modelo o mecanismo concreto de inteligencia artificial que la Guía IA utilizará. Esas decisiones pertenecen al análisis de cada bloque, que empieza solo después de que este contrato quede aprobado. **Esta es una decisión de diseño deliberada, no una omisión**: la arquitectura descrita aquí debe seguir siendo válida sin importar qué tecnología concreta de inteligencia artificial exista dentro de cinco años — el proveedor y el modelo son, por diseño, la parte más reemplazable de todo el sistema, nunca la que define su arquitectura.

## Principio rector

**Ninguna garantía de este documento es negociable a cambio de una conveniencia técnica, de la capacidad de un modelo concreto, o de la presión de "aprovechar todo lo que la tecnología ya permite hacer".** Si en algún momento del diseño técnico posterior una implementación concreta solo puede lograrse debilitando la separación entre memoria y afinidad, el consentimiento explícito para el conocimiento permanente, la explicabilidad, o cualquier otra garantía definida aquí, la implementación está mal — se detiene y se replantea, nunca se debilita la garantía porque el modelo de turno lo permitiría técnicamente. Este principio es la traducción arquitectónica directa del principio de cierre de `FASE7_FILOSOFIA_GUIA_IA.md`: la persona siempre es más grande que el perfil que el sistema tiene de ella.

## Relación con la arquitectura ya existente

La Fase 7 no empieza de cero. Hereda y extiende, sin reemplazar, piezas ya construidas y probadas:

- **El Motor de Afinidad (Fase 6)** sigue siendo la única autoridad que interpreta qué le interesa a una persona. La Fase 7 lo **consulta**, nunca lo reconstruye, reinterpreta ni le agrega una vía paralela de aprendizaje.
- **El comportamiento ya definido de la Guía IA (`AI_PHILOSOPHY.md`)** — personalidad, principios no negociables, cómo razona y decide — sigue vigente sin cambios. Esta fase no lo rediseña: le da, por primera vez, memoria real con la que operar. **Enmienda registrada (Fase 7, Bloque 4):** la jerarquía de priorización de `AI_PHILOSOPHY.md` §9 se refinó de cinco a ocho niveles al construirse la conexión de El Razonador con el Motor de Afinidad — un refinamiento de precisión que nombra explícitamente el pedido explícito de la persona y el Conocimiento Permanente como niveles propios, antes disueltos dentro de "afinidad real" porque ninguno de los dos existía todavía como insumo separado del Razonador. Nunca fue un cambio de criterio ni una reversión de esta promesa: es la actualización honesta de una jerarquía que, en el momento de escribir este contrato, todavía no tenía razón para distinguir esos dos niveles.
- **El Actor de sistema "Guía IA" (Fase 1)** sigue siendo su identidad dentro del ecosistema — ya existe, esta fase solo empieza a usarlo activamente para lo que esta fase construye.
- **La línea base de privacidad, consentimiento y borrado (Fase 1, decisión 9)** sigue siendo el único mecanismo de gobernanza de datos personales del proyecto. La Fase 7 la aplica a un tipo de dato nuevo (historial de conversación); no construye un mecanismo paralelo.

## Los componentes conceptuales del sistema

Cuatro componentes nuevos, cada uno con una responsabilidad única y sin superposición, más los ya heredados sin cambios de la sección anterior:

1. **Memoria de Sesión** (nuevo). Responsabilidad única: dar continuidad al momento presente de una conversación activa (`FASE7_FILOSOFIA_GUIA_IA.md` §2, §4). Este contrato define esta responsabilidad deliberadamente **por lo que debe cumplir, nunca por la forma concreta que debe tener** — mensajes literales, contexto estructurado, una síntesis temporal, o una combinación, son todas representaciones técnicas válidas, y esa elección pertenece al análisis del bloque correspondiente, no a este contrato. Lo que sí es permanente, sin importar la representación elegida: debe ser verificable (nunca inventa un recuerdo); debe permitir que la persona corrija un malentendido; no debe acumularse indefinidamente; y debe conservar únicamente lo necesario para la continuidad de la conversación en curso, nunca más. **Regla de pureza (no negociable): la Memoria de Sesión es pasiva.** Retiene, nunca interpreta, nunca decide, nunca prioriza. Cualquier lectura de significado sobre lo retenido (qué tan relevante es, si sigue aplicando, si contradice algo dicho antes) ocurre exclusivamente en El Razonador — nunca en la propia memoria. Existe para dar continuidad a la conversación en curso, nunca para convertirse, en silencio, en un segundo perfil permanente de la persona.

2. **Conocimiento Permanente de la Persona, no-afinidad** (nuevo). Responsabilidad única: retener hechos estables sobre una persona que no son, en el sentido de la Fase 6, una señal de interés por categoría o por actor — una restricción alimentaria, una necesidad de accesibilidad, una preferencia de idioma (`FASE7_FILOSOFIA_GUIA_IA.md` §4). **Regla de pureza (no negociable, en dos capas): el consentimiento explícito es condición necesaria, pero nunca suficiente, para que algo entre a este componente.** La primera capa: ningún dato pasa de la Memoria de Sesión a este componente por decisión unilateral de ningún otro componente, por relevante o importante que parezca — el paso de temporal a permanente es siempre un acto de consentimiento de la persona, nunca una inferencia automática. La segunda capa, igual de vinculante: que la persona consienta no obliga a la plataforma a conservar cualquier cosa tal como se pidió — la plataforma conserva su propia responsabilidad independiente de minimización de datos, finalidad clara, proporcionalidad y seguridad, y de reconocer que existen categorías de información que, por su naturaleza sensible, no deberían persistir de forma permanente sin importar el consentimiento dado. Este contrato no define esas categorías ni su mecanismo técnico — solo deja registrada la frontera, para que el futuro diseño técnico nunca interprete "consentimiento explícito" como autorización ilimitada para almacenar cualquier dato. Este componente tampoco interpreta ni decide: solo retiene lo que ya fue declarado, confirmado como permanente, y admitido dentro de esos límites de minimización.

3. **El Razonador** (nuevo). Responsabilidad única: sintetizar, en cada turno de una conversación, todo lo disponible — Memoria de Sesión, Conocimiento Permanente, el perfil de Afinidad ya construido (Fase 6), y el contexto real del ecosistema (negocios, verificación, horarios, eventos, promociones vigentes) — en una decisión de qué responder y por qué, aplicando la jerarquía de priorización establecida en `AI_PHILOSOPHY.md` §9 (restricciones duras del momento primero, luego seguridad y bienestar, luego el pedido explícito de la persona en el turno, luego el Conocimiento Permanente pertinente, luego la afinidad real como desempate, luego confianza/verificación, y solo al final curaduría editorial o contenido patrocinado, nunca por encima de lo anterior — jerarquía de ocho niveles desde la Fase 7, Bloque 4, ver la enmienda registrada más arriba). **Regla de pureza (no negociable): El Razonador consulta, nunca reconstruye.** Nunca reinterpreta la afinidad ya construida por el Motor de Afinidad, nunca decide por sí solo que algo pasa a ser conocimiento permanente, nunca analiza el texto libre de una conversación como una vía indirecta hacia el Motor de Afinidad (`FASE7_FILOSOFIA_GUIA_IA.md` §11). El Razonador no tiene memoria propia: no conserva ningún estado entre turnos que no provenga de la Memoria de Sesión, el Conocimiento Permanente o la Afinidad. Lo permanente de este componente es exactamente eso — sus reglas, sus cuatro entradas, y la forma de su salida (una decisión con su razón articulable); la tecnología concreta que ejecuta esa síntesis es, como se detalla más abajo, tan reemplazable como la de cualquier otro componente de este contrato.

4. **La Expresión** (nuevo). Responsabilidad única: traducir la decisión ya tomada por El Razonador en lenguaje natural, aplicando la personalidad ya definida en `AI_PHILOSOPHY.md` §3 (cercana, con criterio propio, curiosa sin interrogar, cálida sin exagerar, segura sin arrogancia, consistente) y el tono adaptado al contexto ya definido en `AI_PHILOSOPHY.md` §12. **Regla de pureza (no negociable): La Expresión nunca decide contenido, solo estilo.** No tiene acceso directo a la Memoria de Sesión, al Conocimiento Permanente ni al perfil de Afinidad crudo — recibe únicamente lo que El Razonador ya decidió comunicar, nunca los datos personales de origen. No puede agregar una recomendación, una razón o un dato que El Razonador no haya producido, ni omitir la explicación que El Razonador ya construyó. Lo permanente de este componente es su responsabilidad y su frontera de acceso a datos; la tecnología concreta que genera el lenguaje es, igual que en El Razonador, deliberadamente reemplazable.

**Sobre los componentes 3 y 4: la agnosticidad tecnológica no distingue entre ellos.** Ninguno de los dos está más o menos atado a una tecnología concreta que el otro — ambos separan, de la misma forma, lo permanente (reglas, responsabilidades, entradas y forma de salida, gobernadas por este contrato) de lo reemplazable (el mecanismo concreto que ejecuta esa lógica, fuera del alcance de este contrato). Ver "Cómo se preservará la agnosticidad tecnológica" más abajo.

## Reglas de pureza de componentes (no negociables)

Cuatro reglas, cada una anclada a un componente específico:

1. **La Memoria de Sesión es pasiva.** Retiene el contexto temporal de una conversación. Nunca interpreta. Nunca decide. Nunca se acumula más allá de lo necesario para dar continuidad a la conversación en curso.
2. **El Conocimiento Permanente no-afinidad nunca se llena a sí mismo, y el consentimiento nunca es la única condición.** Solo el consentimiento explícito de la persona mueve algo de temporal a permanente — pero ese consentimiento habilita, nunca obliga; la plataforma conserva su propia responsabilidad de minimización, finalidad y proporcionalidad sobre lo que efectivamente conserva.
3. **El Razonador consulta, nunca reconstruye.** Usa la Afinidad, la Memoria de Sesión y el Conocimiento Permanente como insumos de lectura — nunca los reescribe, nunca infiere afinidad nueva del texto libre de una conversación, nunca conserva estado propio entre turnos.
4. **La Expresión nunca decide contenido, solo estilo.** Recibe únicamente la decisión ya tomada por El Razonador, nunca los datos personales de origen. No agrega, no omite, no reinterpreta lo que El Razonador ya decidió comunicar.

Estas cuatro reglas son la razón por la que este sistema puede describirse como una cadena de responsabilidad de un solo sentido: **Fuentes de contexto del ecosistema + Motor de Afinidad (Fase 6) + Memoria de Sesión + Conocimiento Permanente → El Razonador → La Expresión → lo que la persona lee.** Ningún componente escribe hacia atrás en esta cadena. Si el diseño técnico de un bloque futuro encuentra una necesidad real de que la información fluya en sentido contrario (por ejemplo, que algo dicho en una conversación deba fortalecer la afinidad permanente de la persona), eso no se resuelve rompiendo la pureza de un componente — se resuelve, exactamente como ya lo resolvió la Fase 6 para el Compositor del Feed, haciendo que ese comportamiento se registre como una interacción nueva y legítima en el Registro de Señales ya existente (con consentimiento explícito, nunca por inferencia directa de texto), dejando que el Motor de Afinidad la vuelva a leer en su propio ciclo — nunca dándole a El Razonador una vía de escritura propia hacia la Afinidad.

## Cómo se relacionan entre sí

El flujo conceptual, en el orden en que cada componente participa dentro de un turno de conversación:

Las **Fuentes de contexto del ecosistema** y el **Motor de Afinidad** son insumos de solo lectura, ya construidos, sin cambios. La **Memoria de Sesión** retiene lo dicho en la conversación activa. El **Conocimiento Permanente** retiene lo que la persona ya declaró como estable, con su consentimiento explícito. **El Razonador** toma las cuatro fuentes —contexto del ecosistema, afinidad, memoria de sesión, conocimiento permanente— y produce una decisión de qué responder, con su propia razón articulable. **La Expresión** traduce esa decisión en lenguaje natural con la personalidad y el tono ya definidos, y es lo único que la persona efectivamente lee.

Ningún componente puede saltarse a El Razonador para llegar directo a la persona — ni siquiera un hecho ya confirmado del Conocimiento Permanente se comunica sin pasar primero por la síntesis y el criterio de El Razonador.

## Dónde termina cada responsabilidad

Este contrato existe, en buena parte, para fijar por escrito fronteras que son fáciles de difuminar sin darse cuenta:

- **El Motor de Afinidad termina en producir y mantener el perfil de interés de una persona.** La Guía IA (El Razonador) empieza donde ese perfil ya existe y lo consulta como un insumo más — nunca antes, nunca compitiendo con esa responsabilidad.
- **La memoria termina en retener; el razonamiento empieza en interpretar.** Ni la Memoria de Sesión ni el Conocimiento Permanente deciden nada por sí solos — solo están disponibles para que El Razonador los use. El Razonador, a su vez, no retiene nada por su cuenta: todo lo que "recuerda" en un turno proviene de un componente de memoria ya existente, nunca de un estado propio oculto.
- **El Razonador termina en decidir qué responder y por qué; La Expresión empieza en decidir cómo decirlo.** Ninguno de los dos puede invadir el terreno del otro: El Razonador no elige el tono ni la forma; La Expresión no elige el contenido ni la razón.
- **Proponer termina donde empieza decidir.** El Razonador y La Expresión, juntos, pueden proponer con toda la fuerza de criterio que `AI_PHILOSOPHY.md` ya exige — pero ninguno de los dos ejecuta una acción con consecuencia real (un pago, una reserva, un compromiso) por su cuenta. Esa capacidad, cuando exista, pertenece a una fase posterior (Fase 10) y a un componente todavía no definido — este contrato no la adelanta.

## Qué componentes consumen información y cuáles únicamente la retienen

Distinción arquitectónica central de esta fase: **la Memoria de Sesión, el Conocimiento Permanente, el Motor de Afinidad y las Fuentes de contexto del ecosistema son almacenes** — cada uno retiene o produce información dentro de su propio dominio, ninguno interpreta ni decide fuera de él. **El Razonador es el único componente que consume e interpreta** — es el único punto del sistema donde varias fuentes de información se cruzan para producir una síntesis. **La Expresión no consume información personal en absoluto** — consume exclusivamente la salida ya decidida por El Razonador. Esta separación no es incidental: significa que, en cualquier momento, es posible auditar exactamente qué componente tuvo acceso a qué dato, y que un cambio en la tecnología que implementa La Expresión nunca implica, por diseño, un cambio en qué datos personales estuvieron expuestos a ella.

## Qué partes serán determinísticas y cuáles adaptativas

**Determinístico** (la misma situación produce siempre la misma regla aplicada, nunca "aprende" a saltársela):

- Que las restricciones duras del momento siempre ganan, sin excepción (`AI_PHILOSOPHY.md` §9).
- Que el contenido pagado nunca compra una recomendación de la Guía IA (decisión 5, `MASTERPLAN.md`).
- Que nada pasa de la Memoria de Sesión al Conocimiento Permanente sin consentimiento explícito.
- Que El Razonador nunca reescribe la Afinidad ni analiza texto libre como vía hacia ella.
- Que La Expresión nunca decide contenido, solo estilo, y nunca tiene acceso a datos personales crudos.
- Que ninguna acción con consecuencia real se ejecuta sin confirmación explícita de la persona.
- Que la Guía IA nunca afirma recordar algo que la persona no dijo realmente.

**Adaptativo** (cambia con la conversación y con la persona, dentro de las reglas anteriores):

- El contenido específico retenido en la Memoria de Sesión, distinto en cada conversación.
- El contenido específico del Conocimiento Permanente, distinto por persona y siempre sujeto a corrección.
- Cómo El Razonador combina, en cada turno, las señales disponibles — cuánto pregunta frente a cuánto asume, según cuánta memoria y afinidad ya existan.
- El tono y la extensión que aplica La Expresión según el contexto del momento (una respuesta corta a la una de la madrugada, una más extendida para alguien nuevo en la ciudad).
- La tecnología concreta que implementa El Razonador y La Expresión — deliberadamente fuera del alcance de este contrato, y la parte de la arquitectura que más se espera que cambie con el tiempo.

## Qué datos podrán utilizarse

- El perfil de Afinidad ya construido y visible para esa persona (Fase 6), sin cambios.
- El Conocimiento Permanente no-afinidad ya declarado y confirmado con consentimiento explícito.
- Lo dicho dentro de la conversación activa, mientras dure (Memoria de Sesión).
- Toda la información real y verificable del ecosistema ya usada hoy por la Guía IA (negocios, verificación, horarios, eventos, promociones vigentes).
- El propio historial de conversación previo de la persona, cuando ella lo autorice explícitamente.

## Qué datos nunca podrán utilizarse

- **El contenido de una conversación de otra persona** — ya protegido por `AI_PHILOSOPHY.md`, principio no negociable 11; esta fase no lo debilita.
- **El monto o la frecuencia de pago de un negocio** como señal de relevancia — la misma prohibición ya vigente desde la Fase 6, sin excepción nueva por tener más superficie de personalización disponible.
- **El texto libre de una conversación, analizado directamente como evidencia estructurada de afinidad** — la misma prohibición de NLP/embeddings ya vigente para el Motor de Afinidad, extendida sin excepción a este componente.
- **Información marcada como privada por la persona** (un guardado, por ejemplo), para cualquier finalidad distinta de servir a esa misma persona.
- **Cualquier dato inferido sin que la propia persona lo haya confirmado**, presentado como si fuera un hecho verificado — la memoria ambigua nunca se presenta como certeza (`FASE7_FILOSOFIA_GUIA_IA.md` §9).

## Cómo se preservará la explicabilidad

La explicabilidad no es un resumen que se genera al final — es una responsabilidad de El Razonador en el momento mismo en que toma su decisión, y una responsabilidad de La Expresión no perderla al traducirla a lenguaje natural. Cada respuesta debe poder justificar dos preguntas distintas, nunca solo una: **"¿por qué me recomiendas esto?"** (la razón de fondo, ya exigida por `AI_PHILOSOPHY.md`, principio no negociable 9) y, ahora que existe memoria real, **"¿por qué recuerdas esto de mí?"** (`FASE7_FILOSOFIA_GUIA_IA.md` §15). Ninguna persona debería recibir jamás, como respuesta a cualquiera de las dos, algo equivalente a "porque el sistema lo decidió" — esa frase queda tan prohibida aquí como ya lo estaba para el Feed algorítmico desde la Fase 6.

## Cómo se preservará la corregibilidad

Todo lo que la Guía IA cree saber de una persona debe poder corregirse por esa misma persona, con la misma facilidad en los tres componentes que lo retienen: la Afinidad (ya garantizado desde la Fase 6), el Conocimiento Permanente (corregible como cualquier otro dato personal), y lo que El Razonador cree haber entendido dentro de una conversación activa (corregible en el momento, sin necesidad de reiniciar la conversación completa). Ninguno de los tres puede convertirse en una verdad fija que la persona no pueda cuestionar.

## Cómo se preservará la agnosticidad tecnológica

Esta arquitectura se considera correcta si, y solo si, cumple la siguiente prueba: **reemplazar por completo la tecnología que implementa El Razonador o La Expresión —cualquiera de los dos, independientemente— no debería exigir ningún cambio en la Memoria de Sesión, el Conocimiento Permanente, el Motor de Afinidad, ni en ninguna de las reglas de pureza o límites definidos en este documento.** No existe una jerarquía entre ambos componentes en cuanto a qué tan reemplazable es cada uno — los dos separan, de la misma manera, su lógica permanente de su tecnología reemplazable. Si un diseño técnico futuro propone algo que solo funciona atado a las capacidades específicas de una tecnología concreta —de un modo que rompería esta prueba, en cualquiera de los dos componentes—, ese diseño está mal planteado para este contrato, no una limitación aceptable de "así funciona la tecnología actual".

## Qué decisiones quedarán configurables y cuáles serán principios permanentes

**Configurable** (puede cambiar sin que este contrato se reabra):
- La tecnología, proveedor o mecanismo concreto que implementa El Razonador y La Expresión.
- Cuánto tiempo dura técnicamente una sesión antes de que su Memoria deje de estar disponible.
- Cuánta memoria disponible reduce, en la práctica, cuánto pregunta El Razonador antes de proponer.

**Principio permanente** (nunca configurable, sin importar la tecnología subyacente):
- Que la Memoria de Sesión, el Conocimiento Permanente y la Afinidad son tres categorías distintas que nunca se confunden entre sí.
- Que nada pasa a ser conocimiento permanente sin consentimiento explícito de la persona — y que ese consentimiento nunca es, por sí solo, autorización ilimitada: la plataforma conserva su propia responsabilidad de minimización, finalidad y proporcionalidad sobre lo que efectivamente almacena.
- Que El Razonador nunca reescribe la Afinidad ni analiza conversación como vía indirecta hacia ella.
- Que La Expresión nunca decide contenido ni tiene acceso a datos personales crudos.
- Que la Guía IA nunca afirma recordar algo que no fue dicho realmente.
- Que ninguna persona es reducible a su perfil de Afinidad ni a su historial de conversación.
- Que ninguna acción con consecuencia real se ejecuta sin confirmación explícita.
- Que el contenido pagado nunca compra una recomendación, sin excepción.

## Qué partes pertenecen realmente a la Fase 7 y cuáles deben reservarse

**Pertenece a esta fase:**
- La Memoria de Sesión y su alcance acotado a una conversación activa.
- El Conocimiento Permanente no-afinidad y su puerta de consentimiento explícito.
- La conexión de El Razonador al Motor de Afinidad ya construido (consulta, nunca reconstrucción).
- La separación entre El Razonador y La Expresión, como garantía de que la tecnología de generación de lenguaje sea reemplazable sin tocar el resto.
- La explicabilidad extendida a "por qué recuerdo esto de ti", además de "por qué te recomiendo esto".
- La transparencia, corrección y borrado del historial de conversación, reutilizando la infraestructura de consentimiento de la Fase 1.

**Se reserva para fases posteriores:**
- La Guía IA como motor de experiencias, generando Planes o Itinerarios persistentes (`AI_PHILOSOPHY.md` §16) — sin fase asignada todavía, y este contrato no la adelanta.
- Que la Guía IA ejecute una acción con consecuencia real (reservar, comprar) en vez de solo proponer (Fase 10).
- Guía IA contextual en puntos físicos vía QR (Fase 9).
- Cualquier mecanismo, incluso con consentimiento explícito, para que algo dicho en una conversación fortalezca la Afinidad permanente — sigue sin resolverse, ni en la filosofía ni en este contrato.
- Que la Guía IA inicie una conversación por iniciativa propia — no explorado en ningún documento del proyecto todavía.

## Mapeo tentativo de bloques (sujeto a su propio análisis y aprobación)

Al mismo nivel de compromiso que tuvo el mapeo tentativo del contrato de la Fase 6 antes de implementarse — una referencia de orden probable, no una decisión cerrada de alcance por bloque. Cada bloque tendrá su propio análisis, aprobación, implementación, verificación, documentación y cierre, exactamente con la misma metodología ya usada en cada fase anterior.

**Principio de secuenciación explícito, que corrige un riesgo real detectado antes de aprobar este contrato**: la transparencia, la corrección y el borrado no son una capa que se agrega al final — son una garantía que debe nacer en el mismo bloque que introduce cualquier dato nuevo, nunca en un bloque posterior separado. Construir el Conocimiento Permanente sin su propio mecanismo de corrección/borrado ya funcionando dejaría, aunque fuera temporalmente, datos permanentes reales sin la garantía que los justifica. Por la misma razón, la separación entre El Razonador y La Expresión debe existir desde el primer bloque — construir primero un componente mezclado para separarlo después repetiría exactamente el tipo de retrabajo que este proyecto ya evita en cada fase, en vez de construir la forma correcta desde el origen.

1. **Separación Razonador/Expresión** — el esqueleto del pipeline (qué responder / cómo decirlo), con explicabilidad ya presente desde el origen, incluso antes de que exista memoria real que sintetizar.
2. **Memoria de Sesión** — con su propia corrección y su propio límite de acumulación incluidos en este mismo bloque, no diferidos a un bloque posterior.
3. **Conocimiento Permanente no-afinidad** — con su puerta de consentimiento y su minimización/borrado incluidos en este mismo bloque, no diferidos a un bloque posterior.
4. **Conexión de El Razonador al Motor de Afinidad** — consulta, nunca reconstrucción, con la jerarquía de priorización ya establecida, construida sobre un pipeline ya separado y una memoria ya corregible.
5. **Experiencia unificada de transparencia, corrección y borrado** — consolidación en una sola superficie coherente de las garantías que ya nacieron, por separado, dentro de los bloques 2 y 3 — no el origen de esas garantías, sino su presentación completa a la persona.

Este orden puede revisarse por completo durante el análisis del primer bloque si el propio análisis revela una secuencia mejor — no es una promesa de secuencia, es un punto de partida para la conversación de priorización de cada bloque. Lo que no debe revisarse sin una bifurcación explícita es el principio de secuenciación en sí: ninguna garantía de corrección o borrado puede quedar pendiente para "un bloque posterior" mientras el dato que protege ya existe en producción.

## Principios de Evolución de Producto (vigentes, no se reabren)

Los once principios ya aprobados en `FASE4_CONTRATO_ARQUITECTONICO.md` siguen gobernando esta fase sin excepción — en particular el principio 3 (toda funcionalidad nueva debe fortalecer al menos uno de los cinco pilares: Descubrimiento, Confianza, Hábito diario, Inteligencia de la Guía IA, o Economía local) y el principio 11 (la ciudad siempre tiene prioridad sobre la plataforma). Este contrato no los repite en detalle — los hereda íntegros.

---

*Documento aprobado. Arquitectura conceptual únicamente — sin sesiones, sin tablas, sin migraciones, sin funciones, sin RPC, sin prompts, sin proveedor de tecnología de inteligencia artificial. El análisis del primer bloque (Separación Razonador/Expresión) comienza solo después de que este contrato quede consolidado.*
