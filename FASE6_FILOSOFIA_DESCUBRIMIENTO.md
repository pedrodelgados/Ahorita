# Fase 6 — Filosofía del descubrimiento (aprobada 2026-07-22)

**Subordinado a `VISION_MAESTRA.md`** (máxima autoridad conceptual del proyecto) **y coherente con `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md` y `AI_PHILOSOPHY.md`.** Este documento es la autoridad filosófica del descubrimiento dentro de Ahorita — responde qué debe significar "descubrir", no cómo se implementa. Es, deliberadamente, anterior y superior a cualquier diseño técnico de la Fase 6: cuando llegue el contrato arquitectónico de esa fase (mismo tipo de documento que `FASE4_CONTRATO_ARQUITECTONICO.md` fue para la Fase 4), cada decisión de algoritmo, tabla o función deberá rendirle cuentas a lo que aquí se define. Si algo durante ese diseño exige contradecir un principio de este documento, se detiene el trabajo y se presenta como una nueva bifurcación — nunca se decide silenciosamente.

**Por qué existe.** Un feed híbrido es una fórmula, y una fórmula sin filosofía previa no tiene forma de decidir qué está optimizando. "Descubrimiento" es, de todas las palabras que usa este proyecto, la más fácil de dar por entendida y la más peligrosa de dejar sin definir: si no se define aquí, la definición de facto la pone el primer parámetro que alguien afine bajo presión de una métrica — exactamente el error que `VISION_MAESTRA.md` §13 ya advierte, "no confundir 'todavía no lo construimos' con 'ya lo resolvimos con equidad'".

---

## 1. Qué significa descubrir para distintos tipos de ciudadanos

`VISION_MAESTRA.md` §2 ya nombró ocho perfiles de ciudadano — estudiante, familia, deportista, artista/fotógrafo, investigador, emprendedor, adulto mayor, comunidades/colectivos — y advirtió que hoy "no existe, ni siquiera en plan, ningún mecanismo que distinga entre estos tipos de vida dentro de una ciudad". Descubrimiento es el lugar donde esa advertencia deja de ser teórica.

Para el **estudiante**, descubrir es encontrar lo viable hoy con lo que tiene: gratis, cercano, dentro de una ventana corta entre clases. Para la **familia**, es filtrar antes de mostrar — seguro y viable con quien la acompaña, no simplemente interesante. Para el **deportista**, tiene una dimensión que ningún directorio de negocios contempla — rutas, terreno, luz del día. Para el **artista/fotógrafo**, es casi lo opuesto de lo que sirve al estudiante: no la opción más práctica, sino la más visualmente o históricamente cargada. Para el **adulto mayor**, debe fallar menos que para cualquier otro perfil — tiene menos margen práctico para el error. Para **comunidades y colectivos**, debería incluir sentirse representado por barrio, no disuelto en "Cuenca" como categoría única — el puente que `VISION_MAESTRA.md` §9 deja planteado entre comunidad e identidad editorial.

**"Descubrir" no es una sola experiencia con una sola vara de éxito.** Es una misma promesa —honestidad, utilidad inmediata— expresada de formas genuinamente distintas según quién pregunta. Un Feed que responde igual a todos no está personalizando: está fingiendo que personaliza.

## 2. Cómo debería sentirse el Feed para una persona nueva

Una persona nueva no tiene historial que aprender, y esa ausencia no debería sentirse como una versión degradada del producto. Debería sentirse como una **presentación editorial deliberada de la ciudad**: que tiene pulso real ahora mismo, que hay negocios verificados reales detrás de lo que se muestra, y que lo curado por el equipo editorial tiene un lugar legítimo desde el primer segundo, no vergonzante ni oculto.

**El arranque en frío no se resuelve con un feed vacío de personalización disfrazado de neutralidad — se resuelve con curaduría honesta que se declara a sí misma como tal.** Es preferible que el Feed comunique, aunque sea implícitamente, "esto es lo que está pasando en Cuenca ahorita" que finja estar personalizado sin serlo.

## 3. Cómo debería evolucionar conforme aprende del usuario

Aprender de alguien no debería significar mostrarle cada vez una porción más reducida de la ciudad — debería significar que, dentro de la misma amplitud, el orden y el énfasis reflejen mejor lo que a esa persona realmente le sirve. **Aprender debe hacer al Feed más preciso, nunca más pequeño.**

Existen dos tipos de aprendizaje distintos: *qué le interesa* a alguien (afinidad temática, de categoría, de zona) y *qué tipo de vida* vive alguien (los arquetipos de §1). El primero puede inferirse razonablemente del comportamiento. El segundo es más delicado — inferirlo mal cuesta más caro — y `VISION_MAESTRA.md` §13 deja explícitamente abierta la pregunta de si Ahorita debería alguna vez preguntar directamente qué tipo de vida vive alguien, en vez de inferirlo todo en silencio. Este documento no la cierra.

## 4. Qué señales sociales deberían influir realmente

`PRODUCT_STRATEGY.md` §10 ya estableció un orden de calidad de señal: check-in físico confirmado > "Ya fui" > seguir un negocio/persona > catálogo con precio real > horarios estructurados > búsqueda realizada > compartir. Este documento adopta ese orden y agrega el principio que debe gobernarlo: **la fuerza de una señal depende de cuánto compromiso real costó producirla, no de cuánto volumen genera.**

Seguir un negocio es una declaración de interés sostenido, más fuerte que un me gusta puntual. "Ya fui" es asistencia real declarada, más fuerte que "quiero ir" y mucho más fuerte que un me gusta. Comentar demuestra más inversión que dar me gusta, pero es más ruidoso y más fácil de fabricar en volumen, así que su peso debe ser mayor que un like pero menor que una acción de asistencia real. Guardar es una señal privada de interés genuino que nunca debería tratarse como pública ni como métrica de popularidad — por diseño, la interacción menos performativa que existe en el sistema, y por eso una de las más honestas.

## 5. Cuáles nunca deberían influir

Tres categorías quedan excluidas sin excepción:

**El volumen de publicación por sí solo.** Un negocio que publica todos los días no debería, por ese solo hecho, aparecer más que uno honesto que publica una vez al mes — la "dominancia orgánica" que `VISION_MAESTRA.md` §6 nombra como la otra cara de la dominancia pagada que el techo del 15% ya protege.

**Cualquier proxy de gasto o tamaño de negocio no ligado a la calidad real de lo publicado.** Verificación es un filtro de confianza legítimo; cuánto invierte un negocio en su presencia digital no lo es.

**El contenido patrocinado nunca debe alterar el orden que produce el resto de este documento.** Ya protegido en dos capas por decisiones previas (techo auditado del 15%, prohibición absoluta de comprar una recomendación de la Guía IA) — este documento no lo reabre, solo lo reafirma.

## 6. Qué significa equidad para un negocio pequeño

Equidad no significa que todos los negocios aparezcan con la misma frecuencia — eso ignoraría la relevancia real. Significa que **un negocio pequeño y honesto que publica poco tenga una oportunidad genuina de ser visto por alguien a quien realmente le sirve**, sin necesitar competir en volumen contra quien tiene más recursos.

`VISION_MAESTRA.md` §6 nombra la tensión sin resolverla: la verificación exige continuidad y datos verificables, condición razonable contra negocios falsos, pero que puede excluir precisamente al emprendimiento más pequeño y más necesitado de visibilidad. Este documento no resuelve esa tensión, pero establece el criterio que cualquier solución futura debe cumplir: **la equidad del negocio pequeño no puede depender de que publique más — debe depender de que el sistema busque activamente motivos legítimos para mostrarlo, incluso con poca actividad.**

## 7. Qué significa diversidad de contenido

Diversidad tiene, para Ahorita, cuatro dimensiones simultáneas:

**Diversidad de categoría** — que el Feed no se sienta monotemático cuando la ciudad ofrece más que eso.

**Diversidad de antigüedad de la señal** — `VISION_MAESTRA.md` §11 lo nombra explícitamente: un motor de afinidad tiende a privilegiar lo ya establecido sobre lo recién aparecido sin historial todavía, el sesgo contrario al que necesita un organismo vivo para mostrarse como tal.

**Diversidad de tipo de vida** — que el Feed no termine sirviendo bien solo al perfil de ciudadano que genera más señal, dejando atrás a quien genera menos interacción pero necesita el producto igual o más.

**Diversidad de naturaleza del contenido** — funcional y emocional a la vez (ver §17, principio nuevo incorporado en esta revisión). No toda diversidad es de categoría de negocio; también lo es de *tipo de experiencia* que el contenido ofrece.

## 8. Cómo evitar cámaras de eco (y el papel de la serendipia)

Una cámara de eco en Ahorita no es que alguien solo vea opiniones que confirman las suyas — es que alguien que descubrió que le gusta un tipo de lugar deje de ver, con el tiempo, todo lo que no encaja en ese patrón, aunque la ciudad siga teniendo variedad real que ofrecerle.

Este documento incorpora aquí, de forma explícita y permanente, el principio de **serendipia** (ver también §18): no todo descubrimiento nace de una afinidad previa. El sistema debe reservar siempre un espacio para aquello que la persona nunca habría buscado por iniciativa propia, pero que puede enriquecer genuinamente su experiencia de ciudad. Esta no es una excepción tolerada al motor de afinidad — es una obligación estructural con el mismo estatus que la afinidad misma. La forma de evitar la cámara de eco no es dejar de personalizar: es que la personalización tenga, por diseño, una fracción reservada explícitamente para lo inesperado y genuinamente relevante. Esto conecta directamente con el modo "descubridor" de la Guía IA (`VISION_MAESTRA.md` §7) — el más delicado de sus cuatro modos, precisamente por el mismo riesgo: proponer algo no pedido es valioso solo si se ancla en relevancia real, nunca en lo que más convenga mostrar comercialmente.

## 9. Cómo evitar que un negocio grande monopolice el Feed

No se trata de limitar a un negocio grande por ser grande — un negocio grande y verificado que genera contenido real y útil no debería ser penalizado por su tamaño. Se trata de que su tamaño no le compre, por sí solo, una ventaja de visibilidad que no viene de la relevancia real de lo que publica. El mecanismo correcto no es un techo artificial por negocio (introduciría una forma nueva de arbitrariedad) — es que **el peso que un negocio recibe venga de la relevancia de cada publicación individual y de la diversidad de §7, nunca de la suma acumulada de cuánto contenido ha producido históricamente.**

## 10. Qué papel debe tener la Editorial de Ahorita

`VISION_MAESTRA.md` §8 ya estableció que la identidad editorial es una voz que impregna todo lo que Ahorita dice, no una sección cultural aislada. Este documento refuerza, como principio permanente, algo que debe quedar sin ambigüedad: **la Editorial no compite con el algoritmo.** Su función es aportar contexto, memoria, identidad y criterio humano exactamente donde un algoritmo nunca podrá hacerlo por sí solo — una fecha significativa para la ciudad, un lugar con una historia que enriquece por qué visitarlo hoy, una lectura del presente que ningún cálculo de afinidad puede producir.

Esto tiene una consecuencia de diseño concreta: el contenido editorial no debería competir en el mismo mecanismo de puntuación que decide qué publicación de negocio o qué interacción social se muestra — debe tener su propio criterio de inserción, deliberado y visible como tal, nunca disfrazado de una recomendación algorítmica más. La persona debe poder distinguir, sin ambigüedad, cuándo está viendo el criterio editorial del equipo y cuándo está viendo el resultado del motor de afinidad.

## 11. Qué papel debe tener la cercanía geográfica

La cercanía es la señal más honesta y menos manipulable de todas: no depende de comportamiento pasado, no puede comprarse, y es igual de válida para quien recién empieza a usar Ahorita que para quien lleva años. **La cercanía debe actuar como una restricción de relevancia base, no como una señal de puntuación entre muchas otras.** Algo lejano no debería aparecer con el mismo peso que algo cercano solo porque tiene más afinidad histórica. Al mismo tiempo, no debe ser el único filtro: el deportista con rutas, el investigador con memoria de ciudad, o cualquiera planificando algo para más adelante, tienen necesidades legítimas de descubrimiento que no siempre son "lo más cercano ahora".

## 12. Qué papel deben tener las preferencias explícitas frente al comportamiento observado

Una preferencia explícita ("no me interesan los bares", "sí me interesa el arte") es una declaración directa de la persona sobre sí misma, y debe tener **prioridad sobre cualquier inferencia de comportamiento que la contradiga.** El comportamiento observado es más rico en matices pero también más ambiguo, y debe tratarse como una señal a refinar, no como una verdad ya establecida. Cuándo Ahorita debería *preguntar* explícitamente frente a inferir todo en silencio sigue siendo una pregunta abierta (`VISION_MAESTRA.md` §13) — este documento no la cierra, pero fija la jerarquía: cuando existe preferencia explícita, gana sobre la inferencia.

## 13. Cómo equilibrar novedad, afinidad, descubrimiento y serendipia

Estos elementos no compiten por el mismo espacio — son necesidades distintas que conviven en la misma sesión de uso. **Afinidad** responde qué de lo que ya se sabe que gusta está disponible ahora. **Novedad** responde qué acaba de aparecer sin historial todavía pero merece una oportunidad. **Descubrimiento** responde qué no se sabía que existía pero el contexto real hace relevante hoy. **Serendipia** (§8, §18) es distinta de las tres: no depende de relevancia inferida en absoluto — es el espacio reservado para lo que amplía el mundo de la persona precisamente porque no encajaba en ningún patrón previo. El equilibrio correcto no es una proporción fija — es que **ninguno de los cuatro llegue jamás a cero**, sin importar cuánto historial acumule una persona con el tiempo.

## 14. Cómo evitar que el usuario sienta que la aplicación manipula lo que ve

La manipulación no se siente por el hecho de que exista un algoritmo — se siente cuando la persona no puede entender ni cuestionar por qué ve lo que ve. `PRODUCT_STRATEGY.md` §7 ya lo dice: falta que "la fuente de cada recomendación sea siempre visible y explicable". Este documento eleva ese principio, ya aplicado hoy a la Guía IA (`AI_PHILOSOPHY.md`, principio no negociable 9), a un requisito igual de válido para el Feed algorítmico: **cualquier orden que el descubrimiento produzca debe poder justificarse en términos que la persona entienda.**

## 15-16. Cómo debe comportarse el sistema cuando conoce poco del usuario, y cómo debe evolucionar cuando ya conoce suficiente

**Con poca información** (la persona nueva de §2, o cualquiera con actividad todavía escasa): apoyarse con más peso en las señales que no requieren historial — cercanía, curaduría editorial declarada, vigencia real de lo mostrado, diversidad amplia de categoría — y ser honesto, en el diseño, sobre que la personalización todavía es limitada. El error a evitar es fingir una personalización que no existe con datos ruidosos e insuficientes.

**Con suficiente información:** la afinidad gana precisión sin tomar control total ni desplazar a novedad, descubrimiento o serendipia. La madurez del sistema debe notarse en que acierta más seguido, no en que se vuelve más estrecho. Si con el tiempo el Feed de alguien se parece cada vez más a una sola categoría, eso no es éxito del aprendizaje — es el síntoma exacto de la cámara de eco que §8 exige evitar.

## 17. La dimensión emocional del descubrimiento

No todo contenido debe ser útil desde un punto de vista funcional. Este documento incorpora, como principio permanente, que **descubrir una ciudad no es solo resolver qué hacer — también es sentir algo por ella.** Fotografías históricas, relatos, tradiciones, patrimonio, memoria urbana, personajes ilustres, paisajes, collages y cultura forman parte legítima del descubrimiento, exactamente en el mismo sentido en que lo son un evento vigente o una promoción real — no como un anexo cultural opcional, sino como una de las formas reales en que alguien puede "descubrir" Cuenca.

Esta dimensión no diluye el criterio de utilidad que gobierna el resto del producto (`VISION_MAESTRA.md` §4: "compite por serle útil") — lo amplía. La utilidad de un contenido emocional no se mide en "¿esto me ayuda a resolver algo ahorita?" sino en "¿esto me hace sentir algo genuino por la ciudad que habito o visito?" — la emoción de **asombro práctico** que `VISION_MAESTRA.md` §8 ya nombró para la identidad editorial ("llevo años viviendo aquí y no sabía esto"), aquí elevada de principio editorial a principio de descubrimiento en general.

## 18. La serendipia como principio estructural (no como excepción)

Se declara aquí, con el mismo peso que cualquier otro principio de este documento, que **la serendipia no es un extra decorativo del descubrimiento — es una de sus formas legítimas.** El sistema debe reservar siempre un espacio para aquello que la persona nunca habría buscado por iniciativa propia, pero que puede enriquecer genuinamente su experiencia de ciudad. Esto es distinto de "novedad" (§13, que es temporal — lo recién aparecido) y distinto de "descubrimiento" en el sentido general del documento (que sigue ligado a relevancia de contexto real): la serendipia existe precisamente para lo que *no* se justifica por relevancia inferida, y su valor está en que amplía el mundo de la persona sin necesitar esa justificación.

## 19. El objetivo dual del Feed: lo que el usuario quiere, y lo que puede ampliar su mundo

Se declara como principio permanente que **el objetivo del Feed no es mostrar únicamente aquello que el usuario ya quiere.** También debe mostrar aquello que puede ampliar su mundo, despertar curiosidad genuina, o fortalecer su vínculo con la ciudad — incluso cuando eso no se desprende de ninguna señal de afinidad medible. Este principio es el que le da fundamento estructural a §8 (cámaras de eco), §13 (equilibrio permanente) y §18 (serendipia): los tres son consecuencias directas de esta misma declaración, no principios aislados entre sí.

## 20. La ciudad siempre debe ser más grande que el algoritmo

Principio de cierre, y el que gobierna a todos los demás en caso de conflicto: **el algoritmo existe para ayudar a descubrir la ciudad — nunca para reducir la ciudad únicamente a aquello que el algoritmo ya conoce del usuario.** Cuencanos y visitantes viven una ciudad que es, por definición (`VISION_MAESTRA.md` §1), más grande, más viva y más impredecible que cualquier modelo de datos que la represente. Si alguna vez una decisión técnica futura tuviera que elegir entre optimizar una métrica de afinidad y preservar la amplitud real de lo que la ciudad tiene para ofrecer, este documento ya deja dicho, de antemano, cuál debe ganar.

---

## Síntesis: los principios que deben gobernar cualquier diseño técnico futuro de la Fase 6

1. Descubrir no es una experiencia única — es la misma promesa de honestidad y utilidad expresada distinto según quién pregunta.
2. La ausencia de datos se resuelve con curaduría honesta y declarada, nunca con personalización fingida.
3. Aprender de alguien debe hacer al Feed más preciso, nunca más pequeño.
4. La fuerza de una señal social depende de cuánto compromiso real costó producirla.
5. Volumen de publicación, tamaño de negocio y contenido patrocinado nunca deben, por sí solos, comprar visibilidad.
6. La equidad del negocio pequeño depende de que el sistema busque activamente motivos legítimos para mostrarlo, no de que publique más.
7. Diversidad tiene cuatro dimensiones simultáneas: categoría, antigüedad de la señal, tipo de vida del ciudadano, y naturaleza funcional/emocional del contenido.
8. Reservar espacio deliberado para lo inesperado y genuinamente relevante es la defensa estructural contra la cámara de eco.
9. Ningún negocio debe monopolizar por volumen acumulado — el peso viene de la relevancia de cada publicación, no de la suma histórica.
10. La Editorial no compite con el algoritmo — aporta contexto, memoria, identidad y criterio humano donde el algoritmo nunca podrá hacerlo por sí solo, con su propio criterio de inserción, siempre visible como tal.
11. La cercanía geográfica es una restricción de relevancia base, no una señal más entre muchas.
12. La preferencia explícita siempre gana sobre la inferencia de comportamiento cuando ambas entran en conflicto.
13. Afinidad, novedad, descubrimiento y serendipia coexisten siempre — ninguno de los cuatro debe llegar jamás a cero.
14. Cualquier orden que el sistema produzca debe poder explicarse en términos honestos y comprensibles.
15. Con poca información, apoyarse en señales que no requieren historial y ser honesto sobre esa limitación.
16. Con suficiente información, ganar precisión sin sacrificar nunca la diversidad ni el espacio reservado al descubrimiento genuino.
17. No todo contenido debe ser funcionalmente útil — la dimensión emocional (patrimonio, memoria, historia, cultura) es una forma legítima de descubrimiento.
18. La serendipia es un principio estructural, no una excepción tolerada — un espacio permanente para lo que la persona nunca habría buscado por sí misma.
19. El objetivo del Feed es dual: lo que el usuario ya quiere, y lo que puede ampliar su mundo, despertar curiosidad o fortalecer su vínculo con la ciudad.
20. La ciudad siempre debe ser más grande que el algoritmo — el algoritmo ayuda a descubrirla, nunca la reduce a lo que ya conoce del usuario.

## Tensiones que este documento hereda sin resolver (a propósito)

Consistente con la honestidad que `VISION_MAESTRA.md` §13 exige de sí mismo, este documento no cierra ninguna de las siguientes preguntas — quedan explícitamente pendientes para cuando el diseño técnico las enfrente en concreto:

- Si Ahorita debería preguntar directamente qué tipo de vida vive alguien, o inferirlo todo en silencio.
- Cómo, técnicamente, medir "relevancia real de una publicación" sin que termine siendo, en la práctica, un proxy indirecto de volumen.
- Qué proporción exacta de espacio reservar para novedad/descubrimiento/serendipia frente a afinidad — este documento establece que nunca debe ser cero, no un número.
- Cómo verificación (que exige continuidad) y equidad del negocio pequeño (que no debería exigirla) conviven sin que una debilite a la otra.
- Cómo medir, en términos técnicos, cuándo un contenido "amplía el mundo" de alguien (§19) sin que esa medición se convierta, por la puerta de atrás, en otra forma de afinidad disfrazada.

---

*Documento conceptual, sin código, sin migraciones, sin arquitectura. Autoridad filosófica permanente del descubrimiento en Ahorita, subordinada a `VISION_MAESTRA.md`. El diseño técnico de la Fase 6 —su propio contrato arquitectónico, en el mismo espíritu que `FASE4_CONTRATO_ARQUITECTONICO.md`— debe rendir cuentas a los veinte principios de este documento.*
