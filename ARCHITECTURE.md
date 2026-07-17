# Ahorita — Arquitectura del Ecosistema

**Documento fundacional. Nivel: visión y arquitectura. No contiene código, componentes ni implementación.**

Este documento es la constitución técnica y de producto de Ahorita para los próximos años. Es distinto de `PROJECT.md` (el registro fase por fase de lo ya implementado), `ROADMAP.md` (qué fase sigue) y `CHANGELOG.md` (qué cambió en cada commit). Aquí no se responde "qué se construyó" sino "qué es Ahorita, por qué está diseñado así, y sobre qué cimientos se construirá todo lo demás". Cuando este documento y `PROJECT.md` entren en conflicto en el futuro, este documento es la autoridad de visión; `PROJECT.md` debe ajustarse a él, no al revés.

Este documento fue encargado explícitamente para pensar como se pensaría un ecosistema urbano diseñado para durar años, no una app de eventos con funciones agregadas sobre la marcha. Cada decisión aquí explica su "por qué", y en varios puntos se recomienda replantear piezas ya construidas cuando el análisis a largo plazo lo justifica — señalado explícitamente donde ocurre.

---

## Índice

- Parte I — Visión y fundamentos (1-5)
- Parte II — Arquitectura general (6-11)
- Parte III — Flujos principales (12-14)
- Parte IV — Sistemas centrales de contenido (15-19)
- Parte V — Descubrimiento e inteligencia (20-25)
- Parte VI — Identidad, perfiles e interacción social (26-35)
- Parte VII — Guía IA (36-40)
- Parte VIII — QR y experiencias físicas (41-45)
- Parte IX — Futuro comercial (46-49)
- Parte X — Plataforma transversal (50-53)
- Parte XI — Calidad, riesgo y operación (54-59)
- Parte XII — Camino a seguir (60)
- Parte XIII — Módulos adicionales recomendados (no solicitados explícitamente)

---

# Parte I — Visión y fundamentos

## 1. Visión general del producto

Ahorita no es una aplicación de eventos, ni una red social, ni un mapa, ni un directorio. Es un **ecosistema urbano inteligente** para Cuenca, Ecuador: una capa digital sobre la ciudad física que conecta personas, negocios, turismo, gastronomía, cultura, entretenimiento, comercio y servicios en una sola plataforma. La analogía correcta no es "es como Eventbrite" o "es como Instagram" — es que Ahorita ocupa, para una sola ciudad, el espacio que hoy ocupan siete aplicaciones distintas (Instagram para el feed social, Google Maps para ubicarse, Airbnb/TripAdvisor para descubrir y confiar, TikTok para el formato de video corto, Eventbrite para entradas, y una guía turística con criterio local) fusionadas alrededor de un solo dato que ninguna de ellas tiene: **contexto hiperlocal en tiempo real de una ciudad específica**.

Esa especificidad es la ventaja competitiva real y el motivo de ser de todo el documento. Google Maps sabe dónde está un restaurante pero no sabe que hoy tiene una promoción de dos-por-uno. Instagram sabe qué publicó un negocio pero no sabe si el negocio está verificado como real ni dónde queda exactamente. TripAdvisor tiene reseñas pero no tiene un feed vivo de "qué está pasando ahorita mismo, a media cuadra de donde estás". Ahorita existe en la intersección de esos tres huecos, y todo el diseño de este documento protege esa intersección: si una decisión de arquitectura debilita la inmediatez, la confianza (verificación) o la localidad, se rechaza sin importar cuánto "escale" en abstracto.

La ambición declarada — convertirse en la aplicación oficial no oficial de la ciudad, el lugar al que cualquier cuencano o visitante abre para responder "¿qué hago ahorita?" — implica que el producto debe eventualmente sentirse tan indispensable como el propio transporte público o el clima: infraestructura urbana, no un entretenimiento más. Esa ambición es la que justifica el nivel de rigor de este documento: no se está diseñando una app, se está diseñando una pieza de infraestructura cívica con un modelo de negocio sostenible encima.

## 2. Filosofía del sistema

Cinco principios no negociables gobiernan cada decisión de arquitectura en este documento:

**(a) Hiperlocal antes que masivo.** Ahorita gana siendo profundamente correcto sobre Cuenca antes de intentar ser amplio sobre Ecuador o Latinoamérica. Una base de datos con 50,000 lugares mal verificados en 10 ciudades vale menos que 2,000 lugares perfectamente verificados en una. Esto tiene una consecuencia arquitectónica directa (ver §6 y §9): el modelo de datos debe estar preparado para múltiples ciudades desde el día uno — como una dimensión de escopo, nunca hardcodeada — pero el producto, el equipo de curaduría y el enfoque comercial deben permanecer en una sola ciudad durante años. Prepararse estructuralmente para expandir ≠ expandir.

**(b) Confianza es el activo, no el contenido.** Cualquier red social genérica tiene contenido infinito. Lo que Ahorita vende es la garantía de que ese contenido es real, está verificado y corresponde a un lugar físico que existe. Esto significa que el sistema de verificación de negocios (§15) no es una casilla de aprobación — es el corazón del producto, y cualquier decisión que erosione la confianza (por ejemplo, dejar que negocios no verificados compren posicionamiento, o que el feed mezcle contenido verificado y no verificado sin distinción visual) se considera una regresión estructural, no un detalle de UI.

**(c) Inmediatez sobre exhaustividad.** El valor no es "un directorio completo de Cuenca" (eso ya lo intentaron páginas amarillas y fracasaron por ser estáticas). El valor es "esto está pasando ahora, a esta distancia de ti". Cada módulo debe preguntarse: ¿esto ayuda a alguien a decidir qué hacer en los próximos 30 minutos, o es contenido de referencia estático? Lo primero vive en el feed y en notificaciones; lo segundo vive en perfiles y en el mapa, pero nunca debe competir por la atención del feed.

**(d) Una sola fuente de verdad por concepto, nunca datos duplicados ni hardcodeados.** Ya establecido en fases anteriores (ver `PROJECT.md`) y se eleva aquí a principio de arquitectura permanente: ninguna pantalla, componente o módulo futuro debe contener contenido "de mentira" incrustado. Todo dato mostrado sale de una fuente estructurada y auditable. Esto incluye contenido generado por IA: la Guía IA nunca debe inventar un lugar, precio o evento — solo puede citar lo que existe en la base de datos (principio ya aplicado, ver §36-40).

**(e) Diseñar para no reescribir en un año.** Es la instrucción explícita de esta fase y se traduce en una regla concreta: cuando dos conceptos comparten el 80% de su comportamiento (un lugar y un negocio, un evento y una promoción, un "me gusta" a un evento y un "me gusta" a una publicación), se modelan como una sola abstracción con variantes — no como tablas paralelas duplicadas. El documento señala explícitamente cada vez que esto aplica a una pieza ya construida.

## 3. Objetivos del ecosistema

Los objetivos se organizan en tres horizontes, porque confundir "lo que debe ser verdad ahora" con "lo que debe ser posible en tres años" es la causa más común de sobre-ingeniería o de arquitecturas que se quedan cortas.

**Horizonte 1 — Producto indispensable en Cuenca (0-18 meses).** Cobertura de facto de los lugares y eventos relevantes de la ciudad; una base crítica de negocios verificados que renuevan su interés en estar presentes porque ven resultado real (visibilidad, tráfico, reservas eventuales); un feed que la gente revisa por hábito, no solo cuando busca algo puntual; confianza pública en que "si está en Ahorita, es real".

**Horizonte 2 — Plataforma comercial sostenible (18-36 meses).** Monetización madura sin traicionar la confianza (§53): suscripciones de negocio, contenido promocionado etiquetado con claridad, comisiones sobre transacciones reales (reservas, entradas). Integraciones físicas maduras (QR, check-in, validación de entradas — §41-45). Un sistema de recomendación que realmente aprende de cada usuario (§40), no solo un feed cronológico con filtros.

**Horizonte 3 — Infraestructura cívica y posible expansión (36+ meses).** Relación formal con instituciones (municipio, cámaras de turismo y comercio, operador de transporte) que use a Ahorita como canal oficial de difusión de eventos públicos y alertas ciudadanas. Evaluación — no ejecución automática — de expansión a otras ciudades intermedias de Ecuador, apoyada en que el modelo de datos ya lo permite (principio (a) de §2) sin haber distraído al equipo antes de tiempo.

Ningún objetivo de Horizonte 2 o 3 debe forzar una decisión de arquitectura en Horizonte 1 que sacrifique velocidad de ejecución hoy. Pero cada decisión de Horizonte 1 se revisa contra la pregunta "¿esto me bloquea el Horizonte 2?" antes de aprobarse — ese es el balance que este documento intenta sostener sección por sección.

## 4. Tipos de usuarios

El sistema reconoce seis tipos de usuario, no como roles técnicos (eso es §5) sino como perfiles de necesidad real que deben sentirse atendidos de forma distinta:

1. **Residente local.** Usa Ahorita como hábito diario. Le importa lo hiperlocal, lo gratuito/económico, y descubrir cosas nuevas cerca de casa o del trabajo. Es el usuario que sostiene el feed vivo y genera la mayoría de interacciones sociales (comentarios, guardados, preguntas).
2. **Visitante/turista.** Ventana de uso corta e intensa (días). Necesita confianza inmediata (verificación), contexto que un local da por sentado (cómo llegar, cuánto cuesta, si es seguro caminar de noche), y idealmente soporte en más de un idioma (ver Parte XIII). Es el usuario más dispuesto a pagar por servicios (reservas, entradas, tours).
3. **Dueño de negocio no verificado.** Quiere presencia digital simple sin fricción de registro complejo. Es la puerta de entrada al ecosistema de negocios — su experiencia de onboarding determina cuántos negocios llegan a verificarse.
4. **Negocio verificado.** Ya invirtió en confianza; espera retorno medible (analíticas, alcance, herramientas de promoción) a cambio de mantenerse verificado (posible suscripción, ver §53). Es el usuario que paga las cuentas del ecosistema en el Horizonte 2.
5. **Organizador de eventos.** Distinto de un negocio con local fijo — puede ser una persona, colectivo o institución que organiza algo puntual (un festival, una carrera, un concierto) sin ser dueño de un espacio físico permanente. Necesita las mismas herramientas de publicación y venta de entradas que un negocio, pero su identidad no está anclada a un lugar (ver §27 para el modelo).
6. **Equipo Ahorita (curaduría/administración/moderación).** Usuario interno, pero con necesidades de producto reales: paneles eficientes (ya construidos en la fase anterior), visibilidad de todo el sistema, y control fino de qué se publica, se destaca o se retira.

## 5. Roles y permisos

Los roles son la implementación técnica de los tipos de usuario de §4, pero no son 1:1 — un mismo tipo de usuario puede tener distintos roles según contexto (un residente local puede también ser dueño de negocio). El modelo de roles debe ser **aditivo y por contexto**, no una sola etiqueta fija en el perfil:

| Rol | Alcance | Otorgado por |
|---|---|---|
| Visitante anónimo | Lee contenido público, sin cuenta | Por defecto |
| Usuario registrado | Todo lo anterior + interactuar (like, comentar, guardar, seguir, preguntar) | Registro con email/OAuth |
| Usuario verificado (identidad) | Todo lo anterior + acciones de mayor confianza (reseñas con más peso, reportes con más prioridad) | Verificación opcional de teléfono/documento — ver Parte XIII, módulo de confianza extendida |
| Dueño de negocio (pendiente) | Gestiona el perfil de su negocio en estado no verificado, visibilidad limitada | Registro de negocio, sin aprobar aún |
| Negocio verificado | Publica contenido, promociones, responde reseñas, ve analíticas de su perfil | Aprobación por el equipo de verificación (§15) |
| Organizador de eventos | Publica eventos sin necesidad de un perfil de negocio con local fijo | Aprobación equivalente a negocio verificado, pero sobre una identidad de "organizador" en vez de "lugar" |
| Editor/Curador | Modera contenido, marca curaduría editorial (`editor_pick` y equivalentes futuros), gestiona reportes | Asignado por un administrador |
| Administrador | Control total sobre contenido, usuarios, negocios, configuración | Asignado por un super administrador |
| Super administrador / Fundador | Todo lo anterior + gestión de otros administradores, configuración de monetización y políticas | Nivel más alto, extremadamente limitado en número |

La razón para separar "Editor/Curador" de "Administrador" (que hoy no existe como distinción — el panel actual usa un solo booleano `is_admin`) es que la fase de administración ya construida demostró que curar contenido (marcar `editor_pick`, aprobar negocios, moderar preguntas) es una actividad de volumen que un equipo de varias personas hará constantemente, mientras que administrar el sistema (usuarios, configuración, monetización) debe quedar restringido a muy pocas personas. Mezclar ambos en un solo rol `is_admin` — que es exactamente lo que existe hoy — es una limitación aceptable para la fase actual pero **se marca aquí explícitamente como deuda a resolver antes de escalar el equipo de curaduría**, porque dar a un curador de medio tiempo el mismo poder que a un fundador es un riesgo de seguridad y de moderación, no solo un detalle de permisos.

---

# Parte II — Arquitectura general

## 6. Arquitectura general

La arquitectura se mantiene deliberadamente simple en capas, no por limitación sino porque la complejidad de Ahorita está en el *modelo de dominio* (cómo se relacionan lugares, negocios, eventos, personas y contenido), no en la infraestructura de cómputo. Cinco capas:

**Capa de cliente.** Aplicación web progresiva (PWA), instalable, con capacidad offline parcial (contenido ya visto, no todo el catálogo). Es la capa más visible pero la menos crítica de este documento — este documento explícitamente no prescribe tecnología de interfaz, solo el contrato de datos que esa interfaz debe consumir.

**Capa de API/backend administrado.** Un backend como servicio (Postgres + autenticación + almacenamiento de archivos + tiempo real) que expone el modelo de datos vía políticas de seguridad a nivel de fila (RLS) en vez de una capa de autorización separada. Esta decisión ya está tomada y funcionando (ver `PROJECT.md`) y se ratifica aquí: para un equipo pequeño, tener la autorización *dentro* de la base de datos (en vez de en un servidor de aplicación intermedio) reduce una clase entera de bugs de seguridad (olvidar el chequeo en un endpoint nuevo) al costo de que las reglas de negocio complejas (como el algoritmo del feed, §21) deben vivir en una capa de servicio adicional, no en la base de datos misma.

**Capa de servicios de dominio (funciones edge).** Lógica que no es "leer/escribir una fila" sino "orquestar": llamadas a la IA, envío de notificaciones push, procesamiento de webhooks de servicios externos (pagos, mapas, futuras integraciones). Esta capa debe crecer como el lugar donde vive *toda* la lógica que hoy podría tentar a ponerse directo en el cliente por rapidez — la regla es: si una operación decide algo sensible (quién ve qué, cuánto cuesta algo, si una entrada es válida), vive aquí, nunca solo en el cliente.

**Capa de datos externos e integraciones.** Mapas (OpenStreetMap/CARTO ya en uso), geocodificación (Nominatim ya en uso), y en el futuro pagos, taxis, y posibles APIs institucionales (municipio, transporte). Se trata siempre como *reemplazable* — ningún módulo de negocio debe asumir un proveedor específico como parte de su identidad (ver §46-49, donde esto se vuelve crítico).

**Capa de inteligencia (Guía IA y recomendaciones).** Deliberadamente separada de la capa de servicios de dominio aunque técnicamente pueda vivir en la misma infraestructura, porque su ciclo de vida es distinto: cambia de modelo, de prompt, de estrategia de recomendación con mucha más frecuencia que el resto del sistema, y necesita observabilidad propia (qué recomendó, por qué, si el usuario lo aceptó) que las demás capas no necesitan.

## 7. Módulos del sistema

Se identifican catorce módulos funcionales. Un módulo no es necesariamente un microservicio ni una carpeta de código — es una unidad de responsabilidad de producto con su propio ciclo de vida, sus propias métricas de éxito, y (cuando aplica) su propio dueño dentro del equipo de Ahorita a futuro:

1. **Identidad y perfiles** — personas, negocios, organizadores (§26-28).
2. **Verificación de confianza** — negocios, organizadores, y eventualmente identidad de usuario (§15).
3. **Contenido publicable** — eventos, promociones, publicaciones, historias, video (§16-19, 33-35).
4. **Interacción social** — seguidores, guardados, comentarios, reacciones (§29-32).
5. **Descubrimiento** — feed, búsqueda, categorías, recomendaciones (§20-23).
6. **Geolocalización y mapa** (§24-25).
7. **Guía IA** (§36-40).
8. **Experiencias físicas vía QR** — check-in, validación, promociones físicas (§41-45).
9. **Comercio** — reservas, entradas, pagos (futuro, §46-49).
10. **Notificaciones** (§50).
11. **Analíticas** — para usuarios, negocios y el equipo interno (§51).
12. **Publicidad y monetización** (§52-53).
13. **Moderación y confianza continua** (§56) — distinto del módulo 2, que es la verificación *inicial*; este es la vigilancia *continua*.
14. **Administración interna** — el panel ya construido, que evoluciona de "gestionar eventos y lugares" a "gestionar todo lo anterior".

## 8. Relación entre módulos

La relación entre módulos no es una jerarquía simple sino un grafo con un centro claro: el módulo de **Contenido publicable** es el núcleo por el que pasan casi todas las relaciones, porque es el único módulo cuyo propósito es *ser mostrado* — todos los demás módulos existen para decidir qué contenido mostrar (Descubrimiento), a quién (Identidad), con qué garantía (Verificación), permitiendo qué reacción (Interacción social), en qué lugar (Geolocalización), con qué asistencia (Guía IA), y con qué modelo de negocio detrás (Comercio, Publicidad).

Esto tiene una implicación de diseño concreta y es la recomendación de replanteo más importante de todo el documento (ver también principio (e) de §2): **Contenido publicable no debería ser cinco tablas paralelas (eventos, lugares-como-contenido, promociones, publicaciones, historias) sino una sola abstracción con subtipos.** Ya existe una prueba de este patrón funcionando parcialmente en el sistema actual: `post_likes` usa un `target_type`/`target_id` genérico para poder dar "me gusta" a lugares, estados, preguntas o eventos sin una tabla de likes por tipo de contenido. La recomendación es tomar ese mismo patrón y aplicarlo consistentemente en el módulo de Contenido publicable completo, no solo en Interacción social. El detalle conceptual está en §9-11.

Los módulos de **Verificación** y **Moderación** son transversales: no le pertenecen a un tipo de contenido específico, sino que se aplican sobre Identidad (verificar un negocio) y sobre Contenido (moderar una publicación) por igual. Deben diseñarse como servicios que *cualquier* módulo puede invocar, no como lógica incrustada dentro del módulo de negocios (que es, otra vez, cómo existe hoy — la verificación de negocios vive hoy como un campo de estado en la tabla de negocios, adecuado para la escala actual, pero no reutilizable cuando se necesite verificar organizadores de eventos o, eventualmente, identidad de usuarios).

## 9. Modelo conceptual de datos

Se proponen siete abstracciones centrales — una más que en la versión original de este documento, incorporada tras la revisión arquitectónica previa al inicio de la Fase 1 (ver `MASTERPLAN.md`, registro de decisiones). Esta sección es conceptual (entidades y su propósito) — las relaciones formales están en §11, y **no se incluye ni se debe incluir ningún esquema SQL ni de base de datos aquí**, por instrucción explícita de esta fase.

**Actor.** Cualquier entidad que puede tener seguidores, publicar contenido y ser mencionada. Tiene tres tipos, no dos: **Persona**, **Negocio/Organizador**, y **Sistema/Institucional** — este tercer tipo, aprobado explícitamente antes de iniciar la Fase 1, cubre identidades que no son ni una persona ni un negocio pero que igual necesitan poder "publicar" y ser referenciadas como autor: la **Guía IA** (que, según la visión aprobada, evolucionará hacia un motor de experiencias capaz de generar contenido propio — ver §36-40) y **Ahorita Editorial** (la identidad de curaduría del equipo, hoy expresada solo como un campo booleano `editor_pick` sobre contenido ajeno). Un Actor de tipo Sistema no tiene verificación (no la necesita, es del propio Ahorita), no lo crea un usuario, y sus atributos específicos de Persona o Negocio simplemente no aplican — no cuesta nada tenerlos vacíos. Hoy el sistema tiene `profiles` (personas) y `businesses` (negocios) como conceptos separados sin una identidad común — la recomendación es que los tres tipos se traten como variantes de un mismo concepto de Actor, para que Seguir, Mencionar, y Mostrar-perfil funcionen igual sin duplicar lógica por tipo.

**Lugar.** Una ubicación física persistente en la ciudad — puede o no estar asociada a un Negocio. Este concepto ya existe (`places`) y se mantiene esencialmente igual, pero se recomienda que todo Negocio tenga automáticamente un Lugar asociado, para que el mapa, la búsqueda y el check-in QR (§44) tengan una sola fuente de verdad geográfica.

**Publicación (Contenido).** La abstracción central de §8: cualquier pieza de contenido con fecha de vigencia, autor (un Actor — incluyendo, a futuro, el Actor Sistema/Institucional), posiblemente un Lugar asociado, medios (foto/video), y un ciclo de vida editorial. **Decisión de diseño aprobada:** Publicación se modela con un **núcleo genérico** (lo verdaderamente común a cualquier subtipo: autor, categoría, ciudad, zona, medios, ubicación opcional, subtipo, estado editorial, fechas de vigencia, métricas, marca de curaduría editorial) **más una tabla de detalle por subtipo** (los campos que solo ese subtipo necesita) — nunca campos específicos de un subtipo agregados directamente al núcleo. Este patrón se aplica primero a Evento (su propio detalle: fecha de inicio obligatoria, fecha de fin, precio, enlace de entradas, organizador) y se repite exactamente igual para cada subtipo futuro: Promoción (detalle: condición de canje, mecanismo de validación, ver §17), Publicación regular (sin detalle propio, es el caso más simple), Historia (detalle mínimo: vigencia fija de 24 horas, ver §35), y a futuro un posible subtipo de **Plan/Itinerario generado por la Guía IA** (detalle: lista ordenada de referencias a otras Publicaciones/Lugares reales — ver §36-40). Video es un atributo de medio de cualquier Publicación, no un subtipo (§34). **Carrusel explícitamente no es un subtipo de Publicación** — sigue siendo, como ya se establecía en §33, una vista curada sobre contenido que ya existe, nunca una pieza de contenido en sí misma; modelarlo como subtipo mezclaría dos conceptos que deben quedar separados.

**Interacción.** Cualquier acción de un Actor sobre una Publicación o sobre otro Actor. Tipos aprobados desde el inicio: **me gusta, quiero ir, ya fui, guardado, seguimiento, compartir**, y — cuando se generalicen los comentarios (ver `MASTERPLAN.md`, Fase 5B) — **comentario**, con una referencia opcional a otro comentario para soportar respuestas anidadas desde el momento en que esa tabla de detalle se cree, sin tener que rediseñarla después. **Reportar queda explícitamente fuera de Interacción** — un reporte necesita motivo, estado de revisión, revisor y resolución, una forma de dato distinta a la de una interacción simple; se modela como su propia entidad dentro del sistema de moderación (§56), no como un tipo más de interacción.

**Verificación.** Una solicitud de confianza sobre un Actor de tipo Negocio/Organizador (nunca sobre un Actor de tipo Sistema, que no la necesita), con evidencia, estado, revisor y fecha de vencimiento. Detalle en §15.

**Ciudad.** La dimensión de escopo geográfico mencionada en el principio (a) de §2. Se introduce desde ahora, con un único valor poblado ("Cuenca").

**Zona.** Nueva, aprobada junto con la revisión de Fase 1: una subdivisión territorial dentro de una Ciudad (Centro Histórico, El Barranco, etc.), con una referencia opcional a otra Zona como padre — no porque se necesite hoy una jerarquía de varios niveles, sino para poder insertar uno en el futuro sin cambiar la forma de la tabla. Reemplaza el campo de texto libre que hoy tiene `places.area`, sin representación real de dónde empieza y termina cada zona. Es lo que le da a la Guía IA una base real sobre la cual razonar variables como "seguridad de la zona a esa hora" (`AI_PHILOSOPHY.md` §7), y lo que hace posible, más adelante, definir geocercas reales para el check-in (§44). No se modela más de un nivel de profundidad por ahora — sería complejidad especulativa sin un caso de uso real detrás.

## 10. Entidades principales

Enumeración de las entidades de datos que se derivan del modelo conceptual de §9, con su propósito y su relación con lo que ya existe hoy en el sistema (para que el equipo de desarrollo entienda qué es continuidad y qué es una introducción nueva):

- **Actor-Persona** (continúa `profiles`): identidad, biografía, foto, intereses, modo de uso.
- **Actor-Negocio** (evoluciona `businesses`): identidad de negocio, categoría, horario, contacto, estado de verificación.
- **Actor-Organizador** (nuevo, ver §4 tipo 5 y §27): igual que Actor-Negocio pero sin obligación de tener un Lugar propio asociado.
- **Actor-Sistema/Institucional** (nuevo, aprobado antes de la Fase 1): identidad sin verificación ni atributos de negocio/persona, poblada desde el inicio con dos filas reales: **Guía IA** y **Ahorita Editorial**. Solo lo crea la administración, nunca un usuario.
- **Lugar** (continúa `places`, absorbe la geolocalización que hoy vive duplicada en `businesses`).
- **Publicación** (generaliza `events`, diseñada con núcleo genérico + tabla de detalle por subtipo — ver §9): título, descripción, medios, autor, lugar opcional, zona, categoría, subtipo, fechas de vigencia, estado editorial, métricas desnormalizadas.
- **Detalle de Evento** (nuevo, primer caso del patrón núcleo+detalle): fecha de inicio obligatoria, fecha de fin, precio, enlace de entradas, organizador — separado del núcleo de Publicación.
- **Interacción** (generaliza `post_likes` y absorbe conceptualmente `event_comments`, `saved_places`, `saved_events`, `follows`): tipo de interacción (me gusta, quiero ir, ya fui, guardado, seguimiento, compartir, y comentario cuando se generalice — con referencia opcional a otro comentario para respuestas anidadas), actor que interactúa, publicación o actor objetivo. Reportar no es un tipo de interacción — ver Solicitud de moderación más abajo.
- **Verificación** (nuevo): actor solicitante (siempre Negocio/Organizador, nunca Sistema), evidencia, estado, revisor, vigencia.
- **Ciudad** (nuevo): nombre, límites geográficos aproximados.
- **Zona** (nuevo, aprobado antes de la Fase 1): hija de Ciudad, con referencia opcional a otra Zona como padre; reemplaza el campo de texto libre `places.area`.
- **Categoría/Canal** (continúa `channels`): taxonomía compartida entre Lugares y Publicaciones.
- **Solicitud de moderación/reporte** (nuevo, ver §56): contenido o actor reportado, motivo, estado, resolución — su propia entidad, deliberadamente separada de Interacción.
- **Sesión de Guía IA** (nuevo formalmente): historial de interacción con la IA, para aprendizaje de preferencias (§40) con consentimiento explícito.
- **Token QR** (nuevo, ver §41): código, tipo de acción, entidad referenciada, estado de uso, vigencia.
- **Detalle de Plan/Itinerario** (futuro, sin fase asignada todavía — ver §36-40): lista ordenada de referencias a Publicaciones/Lugares reales, autorada por el Actor Guía IA. Se enumera aquí únicamente para dejar constancia de que el modelo de datos ya la soporta sin rediseño, no para anunciar su implementación.

## 11. Relaciones entre entidades

Las relaciones siguen el grafo descrito en §8. En prosa, no en diagrama, para que quede clara la razón detrás de cada una:

Un **Actor-Persona** sigue a otros Actores (personas o negocios) — una sola relación de "seguimiento" sirve para ambos casos si Actor es una abstracción común (§9). Un **Actor-Negocio** u **Organizador** tiene una **Verificación** asociada; un **Actor-Sistema** nunca la tiene, porque no aplica. Un **Actor-Negocio** está asociado opcionalmente a un **Lugar**. Una **Publicación** pertenece siempre a un **Actor** autor (incluyendo, a futuro, el Actor Guía IA para contenido generado), opcionalmente a un **Lugar**, opcionalmente a una **Zona** (heredada del Lugar si tiene uno), siempre a una **Categoría**, y vive dentro de una **Ciudad**. Cada subtipo de Publicación tiene, cuando lo necesita, su propia tabla de **Detalle** (Detalle de Evento, Detalle de Promoción, a futuro Detalle de Plan) — nunca campos propios mezclados en el núcleo de Publicación. Una **Interacción** conecta siempre un **Actor-Persona** (quien interactúa) con una **Publicación** o un **Actor** (el objetivo); un tipo "comentario" de Interacción puede referenciar opcionalmente a otra Interacción de tipo comentario, para soportar respuestas anidadas. Un **Token QR** referencia una **Publicación** o un **Lugar** y opcionalmente un **Actor-Persona**. Una **Solicitud de moderación** —entidad separada de Interacción— referencia una **Publicación** o un **Actor** reportado, y un **Actor** (rol Editor/Curador o Administrador) que la resuelve.

La razón para detallar esto en prosa y no solo en un diagrama es que la relación *opcional* (un Negocio-sin-Lugar, una Publicación-sin-Lugar) es la que más frecuentemente se modela mal en sistemas que crecen orgánicamente — y es exactamente el tipo de decisión que este documento existe para fijar antes de que el equipo de desarrollo tenga que adivinarla sobre la marcha.

---

# Parte III — Flujos principales

## 12. Flujo completo del usuario

El recorrido de un Residente local o Visitante (tipos 1-2 de §4) tiene cinco momentos, y el diseño de cada módulo debe poder ubicarse en uno de ellos:

**Descubrimiento pasivo** — abre la app sin un objetivo concreto, revisa el feed (§21), quizás la Guía IA le sugiere algo contextual (§36). **Descubrimiento activo** — busca algo puntual ("dónde comer cerca", "qué hay hoy en la noche") vía búsqueda (§22) o mapa (§25). **Decisión** — compara opciones: aquí es donde la verificación (§15), las reseñas/comentarios (§31) y la información de precio/horario deben estar completas y confiables, porque es el momento de mayor fricción hacia la conversión (ir al lugar, comprar una entrada). **Experiencia física** — el usuario está en el lugar o en el evento: aquí entra el QR (check-in §44, validación de entrada §42) y potencialmente notificaciones contextuales ("estás cerca de X, ¿sabías que..."). **Reflejo social** — después de la experiencia, el usuario comenta, guarda para recordar, o comparte — cerrando el ciclo hacia el Descubrimiento pasivo de otro usuario que ve esa interacción en su feed o notificaciones.

El error de diseño más común en apps similares es optimizar solo el primer momento (el feed bonito) y descuidar el cuarto (la experiencia física) — que es precisamente donde Ahorita puede diferenciarse porque ninguno de los siete competidores mencionados en §1 lo resuelve bien para una sola ciudad.

## 13. Flujo de negocios verificados

Cinco etapas, diseñadas para que la fricción sea proporcional al valor que el negocio recibe a cambio, no arbitraria:

**Registro** — el negocio crea su perfil básico (ya existe este flujo). **Solicitud de verificación** — envía evidencia (documento de identidad del propietario, RUC/permiso de funcionamiento, fotos del local) a través de una Solicitud de Verificación formal (§9, §15), no un simple botón "aprobar" como existe hoy. **Revisión** — un Editor/Curador (rol distinto de Administrador, §5) revisa y aprueba, rechaza, o pide más información — con un motivo registrado, porque un rechazo sin motivo es una fuente garantizada de fricción de soporte más adelante. **Publicación activa** — el negocio ya puede publicar contenido (eventos, promociones, publicaciones), con la insignia de verificado visible siempre. **Renovación/mantenimiento** — la verificación no es permanente de por vida: se recomienda una vigencia (por ejemplo anual) que obliga a una revalidación ligera, porque un negocio puede cerrar o cambiar de dueño y el sistema necesita un mecanismo para detectarlo, no depender de que alguien reporte manualmente que "ese lugar ya no existe".

## 14. Flujo del administrador

El panel de administración construido en la fase anterior ya resuelve gestión de eventos y lugares. Este flujo describe cómo se extiende conceptualmente sin asumir la interfaz: el administrador (o, según §5, el rol más granular de Editor/Curador) necesita **una cola de trabajo unificada** — solicitudes de verificación pendientes, contenido reportado pendiente de moderación, y contenido en borrador esperando revisión editorial — en vez de tener que recorrer módulos separados para cada tipo de pendiente. Esta es una recomendación de diseño de flujo (no de interfaz): el concepto de "bandeja de entrada de trabajo pendiente" debe ser una vista transversal sobre Verificación, Moderación y Contenido publicable, no una funcionalidad exclusiva de un módulo.

---

# Parte IV — Sistemas centrales de contenido

## 15. Sistema de verificación de negocios

Ya introducido conceptualmente en §9 y §13 como la entidad Verificación. El diseño clave es que la verificación es **un proceso con estados y evidencia, no un booleano**. Estados recomendados: `pendiente` → `en_revision` → `aprobado` (con fecha de vencimiento) → `rechazado` (con motivo) → `vencido` (requiere renovación) → `revocado` (verificación retirada por incumplimiento, distinto de vencida por tiempo). La razón de separar `rechazado` de `revocado` es que son eventos de producto completamente distintos: el primero ocurre antes de confiar en el negocio, el segundo ocurre *después*, y typically dispara consecuencias adicionales (ocultar contenido ya publicado, notificar a usuarios que interactuaron con ese negocio si el motivo es grave, como fraude).

La insignia de verificado debe ser **visualmente inseparable** del contenido de ese negocio en cualquier lugar donde aparezca (feed, mapa, búsqueda, perfil) — nunca un detalle que solo se ve al entrar al perfil. Esto es una decisión de confianza (principio (b) de §2), no de estética.

## 16. Sistema de publicaciones

Aplicando la abstracción de §9-10: una Publicación regular es el subtipo más simple — sin fecha de inicio obligatoria (a diferencia de un Evento), pensada para que un negocio comparta algo puntual ("nuevo plato en el menú", "así se ve nuestro local renovado") sin la carga semántica de "esto es un evento con hora de inicio". Comparte con Evento y Promoción el mismo ciclo de vida editorial (borrador/publicado/oculto), el mismo sistema de interacción (§29-32), y el mismo mecanismo de moderación (§56). La diferencia entre "Publicación", "Evento" y "Promoción" no debería ser tres tablas ni tres pantallas de administración distintas desde cero, sino la misma pantalla con un subtipo seleccionado al inicio — exactamente el mismo patrón de "editor progresivo de secciones" ya construido para eventos en la fase anterior, reutilizado.

## 17. Sistema de promociones

Una Promoción es una Publicación con dos campos adicionales obligatorios que ningún otro subtipo tiene: **condición de canje** (ej. "presenta este código", "válido de lunes a jueves", "2x1 en bebidas") y **mecanismo de validación** (manual, en el mostrador, o vía QR — ver §43). La vigencia (`publish_at`/`expires_at`, patrón ya construido para eventos) se reutiliza exactamente igual — una promoción "vence" de la misma forma conceptual en que un evento "termina". El seguimiento de cuántas veces se canjeó una promoción es una **Interacción** especializada (tipo "canje"), no una tabla nueva — de nuevo, generalizar en vez de duplicar.

## 18. Sistema de eventos

Ya construido y documentado en profundidad en `PROJECT.md`. Este documento lo re-encuadra como el primer subtipo de Publicación que se implementó — de hecho, el ciclo de vida editorial (`borrador`/`publicado`/`oculto`/`finalizado`/`cancelado`), la programación de publicación (`publish_at`) y expiración (`expires_at`), y la curaduría manual (`editor_pick`) que ya existen para eventos son, literalmente, el diseño de referencia que el resto de subtipos de Publicación (§16-17, §33-35) deben copiar. No se recomienda ningún cambio a la lógica de eventos en sí — se recomienda que todo lo demás aprenda de ella.

## 19. Sistema de lugares

También ya construido. La única recomendación de replanteo (ya mencionada en §9) es unificar la geolocalización de negocios y lugares bajo una sola entidad Lugar, para que un negocio no tenga su propia lat/lng separada de la que tendría si se modelara como "un Lugar con un Negocio asociado". Esto no es un cambio urgente — es una simplificación que vale la pena hacer antes de que el sistema de check-in (§44) y el mapa unificado (§25) dependan de dos fuentes de coordenadas para el mismo punto físico.

---

# Parte V — Descubrimiento e inteligencia

## 20. Sistema de recomendaciones

Distinto del feed (§21): el feed es lo que se muestra por defecto sin que el usuario pida nada; las recomendaciones son sugerencias activas ("te podría interesar", "cerca de ti ahora", "otros que guardaron esto también guardaron..."). El sistema de recomendaciones se alimenta de tres señales, en orden de confiabilidad: **señales explícitas** (intereses declarados al registrarse, categorías seguidas, negocios seguidos — la señal más confiable porque el usuario la dio a propósito); **señales de comportamiento** (qué guardó, qué le dio like, qué le preguntó a la Guía IA, cuánto tiempo se quedó viendo cierto contenido); **señales contextuales** (ubicación actual, hora del día, día de la semana — un usuario a las 8pm un viernes tiene un contexto de recomendación distinto que a las 10am un martes). Ninguna recomendación debe basarse *solo* en señales de comportamiento sin las explícitas, porque el comportamiento pasado sobre-representa lo que el sistema ya mostró (sesgo de exposición) — un riesgo real si no se diseña con cuidado desde el principio.

## 21. Algoritmo del feed

El feed de eventos ya construido usa un criterio simple y correcto para su etapa actual: proximidad temporal (qué está por pasar antes). La evolución recomendada es un modelo híbrido de puntuación, no un reemplazo: **base de proximidad temporal y geográfica** (se mantiene, es la columna vertebral) + **peso de afinidad** (categorías de interés del usuario, negocios que sigue) + **peso editorial** (`editor_pick`, ya existente) + **peso de promoción pagada, siempre etiquetada como tal** (§52) + **decaimiento de frescura** (contenido que ya se mostró muchas veces al mismo usuario pierde prioridad, para evitar fatiga). La regla de oro, no negociable: el peso de promoción pagada **nunca** puede superar en la fórmula a la relevancia real (afinidad + proximidad) lo suficiente como para que contenido irrelevante pero pagado desplace contenido relevante no pagado — eso es exactamente el tipo de decisión que erosiona la confianza descrita en el principio (b) de §2 y es la forma más común en que plataformas grandes pierden la confianza de sus usuarios con el tiempo.

## 22. Sistema de búsqueda

Dos modos, con necesidades técnicas distintas que no deben confundirse en un solo mecanismo: **búsqueda por nombre/texto** (ya existe de forma básica para lugares y eventos vía coincidencia parcial de texto) y **búsqueda por intención** ("dónde comer algo picante", "planes para esta noche con lluvia") que requiere interpretar lenguaje natural — este segundo modo es, en realidad, una superficie más de la Guía IA (§36-40), no un sistema de búsqueda separado. La recomendación es no construir un "sistema de búsqueda inteligente" como proyecto aparte: la búsqueda por texto se resuelve con búsqueda estructurada (por título, categoría, ubicación), y la búsqueda por intención se resuelve delegando a la Guía IA, evitando duplicar esfuerzo de dos maneras distintas de resolver el mismo problema de "ayúdame a encontrar algo".

## 23. Sistema de categorías

El catálogo de categorías/canales ya existe y es compartido entre lugares y eventos — se ratifica esta decisión y se extiende a todos los subtipos de Publicación (§16-19): una sola taxonomía, nunca una por tipo de contenido. La única evolución recomendada es permitir **subcategorías** dentro de una categoría amplia (ej. "Gastronomía" → "Comida rápida", "Alta cocina", "Café") solo cuando el volumen de contenido lo justifique — introducir subcategorías antes de tener suficiente contenido por categoría genera listas vacías, que es peor para la confianza del usuario que una categoría amplia con contenido real.

## 24. Sistema de geolocalización

Tres necesidades distintas que hoy se resuelven con piezas ya construidas y deben seguir separadas conceptualmente aunque compartan infraestructura: **posición del usuario** (geolocalización del navegador, ya implementada), **geocodificación** (convertir una dirección en coordenadas y viceversa, ya implementada vía Nominatim en el panel de administración), y **cálculo de distancia/tiempo** (fórmula de Haversine ya implementada para "cómo llegar"). La evolución recomendada a mediano plazo es introducir **geocercas** (zonas geográficas con significado, como "Centro Histórico" o el radio de un evento masivo) como una capa adicional, necesaria para el check-in QR (§44) y para notificaciones de proximidad (§50) — hoy la "zona" de un lugar es solo un campo de texto libre, sin representación geográfica real, lo cual es suficiente para mostrarlo pero no para calcular "¿el usuario está dentro de esta zona?".

## 25. Arquitectura del mapa

El mapa ya construido (Leaflet + tiles CARTO sobre OpenStreetMap) es una decisión correcta y se ratifica: evita dependencia de una licencia paga de mapas (Google Maps) para un producto en etapa temprana, y OpenStreetMap tiene cobertura razonable de Cuenca. La recomendación de evolución es que el mapa deje de ser exclusivamente una vista de "Explorar" y se convierta en una **capa transversal** que cualquier módulo puede invocar en miniatura (un mapa pequeño dentro de la ficha de un evento, dentro del perfil de un negocio, dentro de una promoción) — esto ya empezó a ocurrir de facto con el selector de ubicación construido para el panel de administración, y se recomienda formalizar ese patrón como el estándar, en vez de que cada módulo futuro reimplemente su propia integración de mapa.

---

# Parte VI — Identidad, perfiles e interacción social

## 26. Arquitectura del perfil

Un perfil (de cualquier Actor, §9) tiene siempre cuatro bloques de información, sin importar si es una Persona o un Negocio: **identidad** (nombre, foto, biografía), **actividad** (contenido publicado, si aplica), **relaciones** (seguidores, seguidos), y **reputación** (verificación si aplica, reseñas/reacciones recibidas). Modelar esto como una estructura común es lo que permite que "ver el perfil de alguien" sea una sola pantalla conceptual con secciones que se muestran u ocultan según el tipo de Actor, en vez de dos experiencias de perfil completamente distintas construidas por separado.

## 27. Arquitectura del negocio

Extiende el perfil base (§26) con: **catálogo/menú** (si aplica al rubro), **horario y ubicación** (ya existente), **verificación** (§15), **analíticas propias** (§51 — cuántas veces se vio su perfil, cuántos guardados, cuántos clics a "cómo llegar"), y **herramientas de publicación** (crear eventos, promociones, publicaciones — el panel ya construido en la fase anterior es la base de esto, y debe extenderse para cubrir los subtipos nuevos, no reemplazarse). Un Organizador de eventos (§4, §9) usa exactamente esta misma arquitectura de negocio, sin el bloque de "ubicación fija" — reforzando la recomendación de §9 de tratar Negocio y Organizador como la misma entidad con un campo opcional, no dos entidades separadas.

## 28. Arquitectura del perfil personal

Extiende el perfil base (§26) con: **intereses declarados** (ya existente, usado hoy para el registro progresivo), **contenido guardado** (§30), **historial de interacción con la Guía IA** (§37-40, con consentimiento explícito y control de borrado), y **negocios que administra** (si el usuario personal también es dueño de un negocio — la relación entre una Persona y el Negocio que administra debe ser explícita en el modelo, para que "iniciar sesión" no obligue a elegir entre "modo personal" y "modo negocio" como cuentas separadas, sino que una misma persona pueda administrar su perfil personal y el de su negocio desde la misma sesión).

## 29. Sistema de seguidores

Aplicando la abstracción de Actor (§9): seguir a una Persona y seguir a un Negocio deben ser la misma operación de Interacción sobre distintos tipos de Actor, no dos sistemas de "seguir" separados (hoy `follows` ya modela seguir personas; seguir negocios debería generalizar la misma tabla, no crear una paralela). El propósito funcional de seguir un Negocio es distinto del de seguir una Persona (notificarte de su nuevo contenido/promociones vs. ver su actividad social) pero el mecanismo de almacenamiento y la UI de "quién sigo" deben ser unificados.

## 30. Sistema de guardados

Mismo razonamiento que interacciones (§9-11): guardar un lugar y guardar un evento hoy son dos tablas paralelas (`saved_places`, `saved_events`) — la recomendación es generalizar a una sola tabla de Interacción tipo "guardado" que apunte a cualquier Publicación o Lugar, siguiendo exactamente el patrón que `post_likes` ya demuestra que funciona con `target_type`/`target_id`. Este es el ejemplo más concreto y de menor esfuerzo de aplicar el principio (e) de §2, porque el patrón correcto ya existe en el sistema, solo no se aplicó de forma consistente a todas las tablas de interacción.

## 31. Sistema de comentarios

Mismo razonamiento: hoy solo eventos tienen comentarios (`event_comments`); a medida que existan Publicaciones, Promociones, y perfiles de Negocio comentables, se recomienda generalizar a comentarios sobre cualquier Publicación (y, si el producto lo requiere más adelante, sobre un perfil de Negocio como forma de reseña). Una consideración de moderación importante aquí (ver también §56): los comentarios son, junto con las reseñas, el contenido con más riesgo de abuso (spam, ofensas, competencia desleal entre negocios) — el sistema de comentarios debe nacer con capacidad de reporte y ocultamiento rápido, no agregarse después.

## 32. Sistema de reacciones

Hoy existe "me gusta" únicamente. Se recomienda evaluar (no implementar de inmediato) un conjunto pequeño y deliberado de reacciones adicionales con significado hiperlocal real — por ejemplo, distinguir "me gusta" de "quiero ir"/"fui" para eventos, porque esa segunda señal es mucho más valiosa para el algoritmo de recomendación (§20) y para que un organizador sepa el interés real en su evento, que un genérico "me gusta". Se advierte explícitamente en contra de copiar el set de reacciones de Facebook (like/love/haha/wow/sad/angry) sin una razón hiperlocal detrás — cada reacción adicional es una decisión de producto que debe justificar su propio peso en el algoritmo de recomendación, no solo "sentirse más social".

## 33. Carruseles

Un carrusel (ya existe el patrón para "Selección del editor") es una **vista curada de Publicaciones existentes**, nunca contenido propio nuevo — esto ya está bien resuelto en el diseño actual y se ratifica como principio permanente: un carrusel es una lente sobre el contenido real (por categoría, por curaduría editorial, por cercanía, por "negocios que sigues con novedades"), nunca una pieza de contenido separada que alguien tiene que crear y mantener a mano fuera del flujo normal de publicación.

## 34. Videos

El sistema ya soporta video en eventos (`video_url`) como medio alternativo a foto. La recomendación de arquitectura es tratar el video como **un atributo de medio de una Publicación**, no como un tipo de contenido separado ("no hay una tabla de Reels, hay Publicaciones cuyo medio principal es un video corto"). La única pieza de infraestructura nueva que video de verdad requiere (a diferencia de foto) es transcodificación/compresión en el servidor para no depender de que cada usuario suba un archivo ya optimizado — se marca como requisito técnico de infraestructura, no de modelo de datos.

## 35. Historias (si las recomiendas)

Se recomienda **sí implementarlas, pero encuadradas como lo que realmente son**: una Publicación con vigencia corta obligatoria (24 horas, patrón ya existente conceptualmente vía `expires_at`) y sin necesidad de permanecer en el perfil después. El valor hiperlocal específico de una Historia en Ahorita — a diferencia de Instagram, donde son en gran parte contenido personal casual — es la **inmediatez de "esto está pasando ahora"**: un negocio mostrando que su local está lleno esta noche, un usuario mostrando el ambiente real de un evento mientras ocurre. Esto ya existe de forma primitiva en el concepto de "estados" (`statuses`, reportes en vivo con foto/video) construido en fases anteriores — la recomendación es que Historias no sea una función nueva desde cero, sino la evolución natural de "estados" con mejor tratamiento visual (formato de historia en vez de un post más), reforzando otra vez el principio de no duplicar lo que ya existe con otro nombre.

---

# Parte VII — Guía IA

## 36. Arquitectura de la Guía IA

Ya construida como una función de borde que llama a la API de Claude con contexto de la base de datos, nunca exponiendo la clave de API al cliente — esta decisión de seguridad se ratifica sin cambios. La evolución arquitectónica recomendada es introducir formalmente una **Sesión de Guía IA** (§10) como entidad persistente (hoy cada consulta es esencially sin memoria de las anteriores más allá de una conversación puntual), para que la IA pueda razonar sobre preferencias de un usuario a través del tiempo (§40) — con el usuario siempre consciente de que ese historial existe y con control para borrarlo.

La Guía IA es, desde el modelo de datos (§9), un **Actor** del sistema (tipo Sistema/Institucional) — no solo un servicio que responde preguntas. Esta decisión, aprobada antes de iniciar la Fase 1, existe para sostener una visión de producto de más largo plazo, registrada aquí para que ninguna decisión arquitectónica futura la contradiga: **la Guía IA debe evolucionar hacia un motor de experiencias.** Su objetivo final no es únicamente recomendar lugares o eventos individuales, sino combinar lugares, eventos, promociones y servicios en planes completos adaptados al contexto de cada usuario — un Plan/Itinerario persistente, generado por la propia IA como autora, reutilizando exactamente la misma infraestructura de Publicación (§9) que cualquier otro contenido, sin necesitar un sistema aparte. Esta visión **no se implementa todavía** — no tiene fase asignada en `MASTERPLAN.md` — pero el modelo de datos ya queda diseñado para que, el día que se implemente, no requiera ningún rediseño estructural. El detalle completo de esta visión, su filosofía y sus límites vive en `AI_PHILOSOPHY.md`, que es la autoridad absoluta sobre el comportamiento de la Guía IA — este documento solo confirma que la arquitectura de datos ya la sostiene.

## 37. Qué información utilizará la IA

Estrictamente datos reales de la plataforma: lugares, negocios verificados, eventos, promociones vigentes, categorías, y (con consentimiento) el historial de intereses/interacciones del usuario que pregunta. **Nunca** información inventada ni de fuentes externas no verificadas — este principio ya está establecido (`PROJECT.md`) y se eleva aquí a regla de arquitectura permanente: si la IA no tiene datos reales suficientes para responder algo, debe decir que no lo sabe, nunca rellenar el hueco con una suposición que suene plausible. Es, otra vez, una decisión de confianza (principio (b) de §2) antes que de experiencia conversacional.

## 38. Cómo recomendará lugares

Combinando el contexto explícito de la pregunta del usuario ("un lugar tranquilo para trabajar con laptop") con las señales del sistema de recomendaciones (§20): categoría, verificación (preferir siempre negocios verificados sobre no verificados, salvo que el usuario pida explícitamente lo contrario), proximidad si se conoce la ubicación, y afinidad de intereses declarados. La respuesta debe ser explicable: no solo "te recomiendo X" sino, cuando sea razonable, "porque está cerca y es del tipo de lugar que sueles guardar" — la transparencia sobre el porqué de una recomendación es lo que sostiene la confianza en un sistema de IA a largo plazo, mucho más que la precisión pura de la recomendación misma.

## 39. Cómo recomendará eventos

Mismo criterio que lugares (§38), con el peso adicional de **urgencia temporal** (un evento que empieza en una hora se prioriza sobre uno la próxima semana si el usuario pregunta "qué hacer ahorita") y de **curaduría editorial** (`editor_pick`) como señal de calidad cuando el sistema no tiene suficiente información sobre las preferencias del usuario todavía (el problema de arranque en frío, ya resuelto conceptualmente para el feed y reutilizado aquí).

## 40. Cómo aprenderá de cada usuario

El aprendizaje debe ser **incremental y transparente, nunca un modelo de caja negra reentrenado en secreto**: cada interacción (like, guardado, pregunta a la IA, tiempo de permanencia) ajusta un perfil de afinidad legible (categorías de interés con peso, no un vector opaco) que tanto el sistema de recomendaciones (§20) como la Guía IA consultan. Se recomienda que el usuario pueda **ver y corregir** ese perfil de afinidad ("Ahorita cree que te interesa: Gastronómico, Cultural — ¿es correcto?") en su perfil personal — no como una función de transparencia opcional, sino como parte del diseño desde el principio, porque un modelo de preferencias que el usuario no puede ver ni corregir es, con el tiempo, una fuente de desconfianza cuando las recomendaciones empiezan a sentirse "raras" sin que el usuario entienda por qué.

---

# Parte VIII — QR y experiencias físicas

## 41. Arquitectura del sistema QR

Se recomienda un **Token QR genérico** (§9-10) — un código único con un tipo de acción, una entidad referenciada, un estado (emitido/usado/vencido/revocado) y opcionalmente un actor al que se emitió — en vez de tres sistemas de QR independientes para check-in, validación de entradas y promociones. La razón es puramente de mantenimiento: los tres casos comparten el 90% de su ciclo de vida (generar código → escanear → validar estado → marcar como usado → registrar la interacción resultante) y solo difieren en qué pasa *después* de validar. Construir un sistema y tres consumidores es sustancialmente más sostenible que construir tres sistemas.

## 42. Validación de entradas

Un Token QR de tipo "entrada" referencia una Publicación de subtipo Evento (o Promoción con canje único). Al escanearse, el sistema valida: que el token no ha sido usado antes (evita duplicación de una misma entrada), que el evento no ha finalizado o sido cancelado (reutilizando el ciclo de vida editorial ya existente, §18), y marca el token como usado con timestamp — que además alimenta analíticas reales de asistencia (§51) para el organizador, un valor añadido concreto más allá de solo "validar que la entrada es real".

## 43. Promociones mediante QR

Un Token QR de tipo "promoción" referencia una Publicación de subtipo Promoción (§17). El caso de uso típico es que el negocio muestra un QR físico en el local (o lo entrega a un usuario que lo guardó en la app) y al escanearlo se registra el canje como una Interacción — permitiendo que el negocio vea cuántas veces se canjeó su promoción, información que hoy no existe de ninguna forma y es exactamente el tipo de analítica que hace que un negocio vea valor concreto en mantenerse verificado y activo (§53).

## 44. Check-in en lugares

Un Token QR de tipo "check-in" referencia un Lugar. A diferencia de entradas y promociones, un check-in no se "usa una sola vez" — es una Interacción repetible (como un like, no como un canje de un solo uso) que alimenta tres cosas: la sensación social de "quién ha estado aquí" en el perfil del lugar, señales reales de popularidad para el algoritmo de recomendación (§20) más confiables que un simple "me gusta" porque implica presencia física real, y — combinado con geocercas (§24) — la posibilidad futura de detectar check-in automático por proximidad sin necesidad de escanear nada, aunque esa automatización se marca explícitamente como evolución futura, no como parte del diseño inicial.

## 45. Turismo mediante QR

Extiende el check-in (§44) con un caso de uso específico: códigos QR físicos instalados en puntos turísticos o históricos (una plaza, una iglesia, un mirador) que, al escanearse, no solo registran un check-in sino que activan contenido enriquecido — información histórica/cultural del punto, y potencialmente una consulta directa a la Guía IA con el contexto de ese lugar específico ya cargado (el mismo patrón de "IA contextual dentro de un lugar" que ya existe en el sistema, extendido a un punto de acceso físico en vez de solo digital). Este módulo es el que más directamente conecta la ambición de "app oficial de la ciudad" (§1, Horizonte 3) con una pieza tangible: es plausible que el municipio o la cámara de turismo co-financien la instalación física de estos códigos en puntos de interés, lo cual es en sí mismo una vía de relación institucional temprana.

---

# Parte IX — Futuro comercial

## 46. Arquitectura futura para reservas

No se implementa ahora — se define el punto de extensión. Una Reserva es conceptualmente una Interacción especializada entre un Actor-Persona y una Publicación o Lugar reservable, con un estado propio (solicitada/confirmada/cancelada/completada) y opcionalmente un pago asociado (§49). El diseño de Publicación (§9-10) ya contempla que un subtipo pueda tener campos adicionales (como Promoción tiene condición de canje) — "reservable" debería modelarse de la misma forma, como un atributo que cualquier Lugar o Evento puede activar, no como un sistema paralelo de "lugares reservables" separado del resto.

## 47. Arquitectura futura para venta de entradas

Ya existe el campo de enlace de entradas externo (`ticket_url`) como solución de transición — adecuada para la etapa actual, donde delegar la venta a una plataforma externa es más rápido que construir un sistema de pagos propio. La evolución hacia venta de entradas *dentro* de Ahorita depende directamente de la arquitectura de pagos (§49) y del Token QR (§41-42) para la entrada digital resultante — no es un módulo aislado, es la unión de tres piezas que este documento ya define por separado.

## 48. Integración futura con Azu Taxi

Se define como **integración externa desacoplada**, nunca como lógica propia de transporte: Ahorita expone contexto (ubicación de origen del usuario, ubicación de destino de un lugar/evento) a través de un deep link o una API de un socio de transporte, de la misma forma en que hoy ya existe un deep link a Google Maps/Uber para "cómo llegar". El principio de arquitectura (§6, capa de integraciones externas) de "nunca asumir un proveedor específico como parte de la identidad del producto" aplica directamente aquí: si Azu Taxi es el socio de hoy, la capa de integración debe estar diseñada para que sea reemplazable por otro proveedor de transporte sin tocar el resto del sistema.

## 49. Integración futura con pagos

El punto de extensión más sensible del documento, por lo que se define con más cautela: un proveedor de pagos (a definir) se integra únicamente a través de la capa de servicios de dominio (§6), nunca con credenciales o lógica de cobro en el cliente. Los casos de uso que dependerán de pagos —suscripción de negocio verificado (§53), reservas (§46), entradas (§47), promociones destacadas (§52) — deben compartir una sola abstracción de "Transacción" con estado (iniciada/completada/fallida/reembolsada) en vez de que cada caso de uso implemente su propio flujo de cobro. Dado que Ecuador tiene proveedores de pago locales con distintas capacidades que las pasarelas internacionales, se recomienda que la elección de proveedor sea una decisión informada por el equipo de producto en su momento, no una que este documento prescriba de antemano.

---

# Parte X — Plataforma transversal

## 50. Arquitectura de notificaciones

Ya existe infraestructura de notificaciones push reales (Web Push, sin dependencia de Firebase) funcionando para un caso de uso (respuesta a preguntas). La evolución es de **catálogo de eventos de notificación**, no de infraestructura: nuevo seguidor, nuevo contenido de un negocio seguido, promoción por vencer que el usuario guardó, evento guardado que empieza pronto, proximidad geográfica a algo relevante (requiere geocercas, §24). Cada tipo de notificación debe ser configurable individualmente por el usuario (no un interruptor único de "notificaciones sí/no") porque el volumen de tipos de notificación crecerá rápido y un usuario que desactiva todo por exceso de una sola categoría es una pérdida de canal completa, evitable con granularidad desde el diseño.

## 51. Arquitectura de analíticas

Tres audiencias con necesidades distintas que no deben mezclarse en un solo panel: **analíticas para negocios** (vistas de perfil, guardados, clics a "cómo llegar", canjes de promoción, asistencia validada por QR — información que justifica el valor de estar en la plataforma, §53), **analíticas para el equipo Ahorita** (salud del ecosistema: crecimiento de usuarios, retención, densidad de contenido por categoría/zona, tasa de conversión de negocio-pendiente a verificado), y **analíticas para el sistema de recomendación** (§20, señales de comportamiento, no necesariamente visibles a nadie como "reporte"). Diseñar estas tres desde el principio como consumidores distintos de los mismos eventos base (una interacción, una vista, un canje) evita el error común de construir "analíticas" como una sola cosa y descubrir después que negocios y equipo interno necesitan vistas incompatibles de los mismos datos.

## 52. Arquitectura de publicidad

Se recomienda que la publicidad exista exclusivamente como **contenido promocionado dentro del propio ecosistema de Publicaciones** (un negocio paga para que su Publicación/Evento/Promoción ya real tenga más peso en el feed, §21) y no como una capa de anuncios de terceros ajena al contenido real de la plataforma. Esto es consistente con el principio (b) de §2: un anuncio de una marca de cerveza global no construye confianza hiperlocal, mientras que un negocio real de Cuenca pagando por más visibilidad de su promoción real sí lo hace, y además refuerza el modelo de negocio descrito en §53. Todo contenido promocionado debe llevar una etiqueta visual clara ("Promocionado") sin excepción.

## 53. Arquitectura de monetización

Tres fuentes de ingreso, en orden de cuándo deberían activarse: **(1) Suscripción de negocio verificado** (Horizonte 1-2, §3) — un plan que da acceso a publicar, a analíticas (§51), y potencialmente a herramientas de promoción (§52), con un nivel gratuito básico para no bloquear la adopción inicial de negocios pequeños. **(2) Contenido promocionado** (§52, Horizonte 2) — negocios ya verificados pagan por mayor alcance de contenido que ya es real. **(3) Comisión sobre transacciones** (§46-47, 49, Horizonte 2-3) — un porcentaje sobre reservas y entradas vendidas dentro de la plataforma, que solo tiene sentido una vez que el volumen de transacciones justifique la complejidad de integrar pagos. La regla transversal, reiterada de §21: ninguna de estas tres fuentes puede jamás comprar mejor posicionamiento que contenido no pagado pero más relevante — el negocio de Ahorita es la confianza, y monetizar de una forma que la erosione es, literalmente, vender el activo que sostiene todo lo demás.

---

# Parte XI — Calidad, riesgo y operación

## 54. Escalabilidad

En esta etapa (una ciudad, decenas de miles de usuarios en el horizonte de 1-2 años) escalabilidad de cómputo no es el riesgo real — el backend administrado elegido (§6) escala varios órdenes de magnitud por encima de esa necesidad sin cambios estructurales. El riesgo real de escalabilidad es **de curaduría y moderación**: el equipo humano que verifica negocios y modera contenido no escala automáticamente con el crecimiento de usuarios, y es el cuello de botella más probable del ecosistema completo. La arquitectura debe priorizar herramientas internas eficientes (el panel de administración ya construido, y su evolución hacia una bandeja de trabajo unificada, §14) tanto o más que la escalabilidad técnica pura.

## 55. Seguridad

El principio ya establecido de autorización a nivel de fila en la base de datos (§6) se mantiene como la primera línea de defensa. Tres áreas de atención específicas para el crecimiento futuro: **prevención de abuso de interacciones** (límites de tasa sobre likes/comentarios/seguimientos para frenar manipulación artificial de métricas, relevante en cuanto la reputación empiece a tener valor económico vía §53); **protección de evidencia de verificación** (documentos de identidad y permisos de funcionamiento subidos durante verificación, §15, son datos sensibles que requieren almacenamiento con acceso más restringido que fotos de contenido normal); y **separación de roles administrativos** (ya señalado en §5 — un rol Editor/Curador con menos poder que Administrador es, en el fondo, una medida de seguridad tanto como de producto, porque reduce el daño posible de una cuenta de curador comprometida).

## 56. Moderación

Sistema de tres niveles: **automatizado** (límites de tasa, filtros de palabras/patrones evidentes de spam, aplicado en el momento de publicar); **comunitario** (reporte de contenido por cualquier usuario, alimentando la entidad Solicitud de Moderación de §10); **humano** (cola de revisión para el equipo Editor/Curador, §5, §14). La moderación de reseñas y comentarios sobre negocios merece atención particular porque tiene un vector de abuso específico de este dominio — competencia desleal entre negocios (reseñas falsas negativas hacia competidores, o falsas positivas propias) — que un sistema de moderación genérico de redes sociales no necesariamente contempla. Se recomienda que denuncias sobre reseñas de negocios tengan una cola de prioridad distinta a denuncias de contenido general.

## 57. Privacidad

Dado que Ahorita aspira a ser infraestructura cívica (§1, Horizonte 3) y opera en Ecuador, el cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP) debe tratarse como requisito de arquitectura, no como una revisión legal posterior. Dos categorías de dato merecen diseño explícito de privacidad desde ahora: **historial de ubicación** (posición del usuario, usada para recomendaciones y proximidad — debe minimizarse su retención, nunca usarse para fines distintos a los declarados, y el usuario debe poder ver y borrar ese historial) y **historial de conversación con la Guía IA** (§36-40 — potencialmente el dato más personal que el sistema recolecta, porque un usuario le puede contar a la IA cosas que no publicaría nunca en el feed social; requiere el mismo estándar de control y borrado).

## 58. Rendimiento

El requisito de rendimiento más importante no es genérico ("que cargue rápido") sino específico del caso de uso hiperlocal: el feed y el mapa deben sentirse instantáneos en el momento exacto en que alguien está parado en la calle decidiendo qué hacer — es decir, rendimiento en redes móviles imperfectas (3G/4G variable en zonas del Centro Histórico con edificaciones antiguas) importa más que rendimiento en una conexión de oficina. La arquitectura PWA con capacidad offline parcial ya construida es la decisión correcta para esto y se ratifica; la recomendación adicional es que cualquier funcionalidad nueva (QR, notificaciones de proximidad) se diseñe asumiendo conectividad intermitente como el caso normal, no la excepción.

## 59. Riesgos técnicos

Cuatro riesgos concretos, no genéricos: **(1) Dependencia de un solo proveedor de backend** — mitigado parcialmente por estar sobre Postgres estándar (portable), pero la lógica de autorización vía RLS es específica del proveedor actual y una migración futura no sería trivial; se acepta como riesgo conocido dado el beneficio de velocidad de desarrollo en esta etapa. **(2) Servicio de geocodificación gratuito sin garantía de disponibilidad** (Nominatim) — adecuado para el volumen actual (uso interno de administración), pero si la búsqueda de ubicación se expone a usuarios finales masivamente, requiere evaluar un proveedor con SLA. **(3) Deuda de modelado de datos** — las recomendaciones de unificación de este documento (Actor, Publicación, Interacción como abstracciones genéricas) implican migrar estructuras ya construidas; cuanto más se tarde en hacerlo, más costosa la migración, porque cada tabla paralela nueva que se agregue mientras tanto es más superficie que unificar después. **(4) Escalamiento de moderación humana** (ya mencionado en §54) es, de los cuatro, el que con más probabilidad se convierte en un bloqueador de crecimiento real si no se atiende a tiempo.

---

# Parte XII — Camino a seguir

## 60. Roadmap recomendado de implementación

Este documento es de arquitectura, no de ejecución — el orden aquí es una recomendación de secuencia, sujeta a que el usuario apruebe el documento completo antes de convertir cualquier punto en una fase de desarrollo real, como se pidió explícitamente.

**Fase A — Fundamentos del modelo unificado.** Antes de construir el sistema social nuevo, resolver la deuda de modelado señalada en §8-11, §29-30: generalizar Actor (personas/negocios), generalizar Interacción (likes/guardados/comentarios), e introducir la dimensión Ciudad. Hacerlo ahora es más barato que después de que el sistema social añada más tablas paralelas sobre la estructura actual.

**Fase B — Verificación robusta.** Antes de abrir publicaciones/promociones a más negocios, formalizar la entidad Verificación (§15) con estados y vigencia, y separar el rol Editor/Curador del rol Administrador (§5) — es la base de confianza sobre la que todo lo demás del sistema social se apoya.

**Fase C — Contenido social ampliado.** Publicaciones regulares y Promociones como subtipos de la abstracción ya unificada (§16-17), reutilizando el editor progresivo y el ciclo de vida editorial ya construidos para eventos.

**Fase D — Interacción social plena.** Seguir negocios (no solo personas), comentarios generalizados, y evaluación de reacciones más allá de "me gusta" (§29, 31-32).

**Fase E — Historias y video como contenido de primera clase.** Evolución de "estados" hacia Historias (§35), tratamiento de video como atributo de medio (§34).

**Fase F — QR y experiencias físicas.** Token QR genérico primero (§41), luego sus tres consumidores (check-in, promociones, entradas — §42-45) en el orden de menor a mayor complejidad de validación.

**Fase G — Comercio.** Reservas, entradas internas y pagos (§46-49) — la fase más dependiente de decisiones de negocio externas al equipo técnico (elección de proveedor de pagos, condiciones comerciales) y por eso la que más se beneficia de llegar al final, con todo lo demás ya maduro.

**Fase H — Monetización activa y publicidad.** Suscripciones de negocio y contenido promocionado (§52-53) — solo tiene sentido con una base de negocios verificados ya sustancial (Fase B-C) y con analíticas que demuestren valor (§51).

Cada fase, al aprobarse, debe generar su propio documento de requisitos definitivos antes de tocar código — exactamente como se hizo con la fase de administración de eventos y lugares recién cerrada.

---

# Parte XIII — Módulos adicionales recomendados

Estos módulos no fueron solicitados explícitamente en la lista de 60 puntos, pero el análisis de arquitectura los identifica como necesarios para que el ecosistema descrito en §1 funcione de forma sostenible. Se proponen con su justificación, no como una lista superficial:

**Onboarding de contenido y alianzas institucionales.** El problema de "arranque en frío" (una ciudad con pocos negocios verificados al inicio) no se resuelve solo con un buen flujo de registro — se resuelve con una estrategia deliberada de precarga y alianzas (cámaras de comercio/turismo, municipio) que traigan los primeros cientos de negocios y eventos reales antes de depender de que lleguen orgánicamente. Sin este módulo como preocupación de producto explícita, el ecosistema corre el riesgo de sentirse vacío en su lanzamiento, sin importar cuán bien esté construida la arquitectura.

**Soporte y ayuda.** A medida que existan negocios pagando por verificación/promoción (§53), necesitan un canal de soporte real (no solo un formulario de contacto) cuando algo falla — una promoción no se activó, un pago no se procesó, una verificación se rechazó sin claridad. Este módulo protege directamente la confianza que sostiene el modelo de negocio.

**Internacionalización.** Dado que el tipo de usuario "visitante/turista" (§4) es explícitamente parte de la visión y probablemente el segmento más dispuesto a pagar por servicios (§3, Horizonte 2), soporte de al menos español e inglés en el contenido curado editorialmente (no necesariamente en contenido generado por negocios) es una necesidad de producto real, no un lujo de fases muy tardías.

**Cumplimiento legal y términos de servicio.** Más allá de la privacidad de datos (§57), un ecosistema con verificación de negocios, transacciones futuras (§49) y contenido generado por usuarios necesita términos de servicio, políticas claras de qué pasa cuando se revoca una verificación (§15) o se modera contenido (§56) de forma que sea legalmente defendible, especialmente si la relación con instituciones públicas (§3, Horizonte 3) se profundiza.

**Gestión de versiones y experimentación (feature flags).** A medida que el equipo crezca y se lancen fases nuevas (§60) de forma incremental, la capacidad de activar/desactivar funcionalidad para subconjuntos de usuarios sin desplegar código nuevo cada vez reduce riesgo — especialmente relevante para cambios en el algoritmo del feed (§21) o en monetización (§53), donde probar con un grupo pequeño antes de un cambio total es mucho más seguro que un cambio de golpe para toda la base de usuarios.

**Observabilidad e incidentes.** Un ecosistema que aspira a sentirse como infraestructura urbana (§1) necesita que el equipo sepa, en minutos y no en reportes de usuarios molestos, cuándo algo crítico falla (el feed no carga, las notificaciones dejaron de enviarse, la Guía IA no responde) — esto es una preocupación de arquitectura de operación, no solo de código.

**Preparación para multi-ciudad (sin ejecutarla).** Ya cubierta conceptualmente en la entidad Ciudad (§9-10) y el principio (a) de §2 — se menciona aquí de nuevo como módulo explícito porque es la clase de decisión que, si se omite ahora, se vuelve exponencialmente más cara de corregir cuantas más tablas y funcionalidades se construyan asumiendo implícitamente "todo es Cuenca".

---

*Fin del documento. Como se indicó al inicio de esta fase: no se ha modificado, creado ni tocado ningún componente, pantalla, estilo o línea de código de la aplicación. Este documento existe únicamente como base de decisión para las fases futuras, y debe ser revisado y aprobado por el usuario antes de que cualquier punto aquí descrito se convierta en una fase de desarrollo real.*
