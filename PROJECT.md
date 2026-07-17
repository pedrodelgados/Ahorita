# Ahorita (Cuenca Viva) — Prompt maestro

Quiero construir **"Ahorita"** (nombre de trabajo, también evaluamos "Cuenca Viva") — una red social hiperlocal para descubrir Cuenca, Ecuador en tiempo real. No es una guía turística: es una red social donde todo gira alrededor de lugares — preguntas, respuestas, reportes en vivo y contenido curado — con una IA que responde usando datos reales de la app, no genéricos.

## Stack técnico

- Frontend: React + Vite (web app / PWA instalable)
- Backend: Supabase (Postgres + Auth + Storage + Realtime)
- IA: API de Claude, llamada desde un endpoint del backend (nunca directo desde el cliente, para no exponer la key)
- Hosting: Vercel o Netlify

## Sistema de diseño — sigue esto exactamente, no uses valores por defecto

**Paleta** (tonos suaves y elegantes, nunca saturados/candy):
- Fondo: `#FBF8F4` · Tinta principal: `#2B2622` · Tinta suave: `#948A80`
- Acento primario: `#E8785C` (coral suave)
- Color por categoría: Gastronomía `#E8785C` · Cultura `#8B7CE0` · Vida nocturna `#E0669A` · Deportes `#4FA383` · Naturaleza `#4FA3A0` · Glamping `#B8875A` · Hoteles `#5B94C9` · Música `#D9A83F` · Familiar `#E0966A` · Pet friendly `#7BAE8C`

**Tipografía:** "Fraunces" (serif editorial) para títulos y logo; "Inter" para cuerpo y navegación. Nada de fuentes redondeadas/infantiles.

**Iconografía:** SIEMPRE íconos vectoriales (Lucide o equivalente). Nunca emojis como íconos de UI, mapa, categorías o navegación — los emojis solo como acento puntual junto a un título, nunca como reemplazo de un ícono funcional.

**Componentes:** esquinas muy redondeadas (16–24px), sombras suaves de bajo contraste, mucho espacio en blanco, círculos de categoría con tinte suave del color (8–15% opacidad) en estado inactivo y relleno sólido solo en estado activo.

**Referencia de calidad:** debe sentirse como Apple Maps + Airbnb + Instagram — premium, minimalista, fotografías grandes, nunca recargado. Es el estándar, no una aspiración — trátalo como criterio de aceptación de cada pantalla.

## Pantallas y comportamiento esperado

### 1. Onboarding / Auth
- Pantalla de bienvenida a pantalla completa con foto de Cuenca, texto "Descubre todo lo que pasa en Cuenca", botones: continuar con Google, continuar con Apple (maquetados pero deshabilitados por ahora), continuar con correo, y **"Explorar sin registrarme"** como opción secundaria
- No obligar a crear cuenta para navegar — pedir registro solo al intentar guardar, comentar, publicar o dar like
- Registro progresivo: tras el login (correo + contraseña funcional vía Supabase Auth), entra directo a explorar; los datos de perfil (intereses, ciudad, foto) se piden poco a poco, no todo de una vez
- Pantalla "¿Cómo usarás la app?" con tarjetas: Vivo en Cuenca / Estoy visitando / Tengo un negocio / Organizo eventos — sirve para personalizar el contenido inicial
- Pantalla de registro de negocio separada (nombre, categoría, dirección, ubicación en mapa, WhatsApp, teléfono, Instagram, horario, foto, descripción), con nota "en revisión antes de publicar"

### 2. Inicio — feed vertical de EVENTOS, estilo Instagram (esto es central, no lo conviertas en cuadrícula ni lo mezcles con lugares en general)

**Alcance del feed:** Inicio muestra únicamente **eventos** — festivales, conciertos, ferias, funciones de teatro, carreras, inauguraciones, pases y celebraciones puntuales. No incluye restaurantes, cafés, hoteles ni lugares fijos como posts del feed; esos viven en "Explorar" (mapa + cuadrícula) y en "Comunidad" (preguntas/respuestas/estados), no en el feed principal.

Esta distinción es intencional y resuelve un problema real de contenido: un evento es temporal y normalmente ya viene con foto/flyer del organizador, así que el feed se renueva solo con el calendario de la ciudad — no depende de que alguien fotografíe cada rincón de Cuenca para que Inicio se sienta lleno. Con 10-15 eventos activos el feed ya se siente vivo.

**Comportamiento:**
- Scroll vertical infinito, un evento grande a la vez, cada uno ocupa 80–90% de la pantalla (foto o video del evento)
- Ordenado por relevancia/proximidad en el tiempo (lo de hoy y esta semana primero)
- Cada post incluye: nombre del evento, lugar, fecha y hora, descripción corta, etiqueta llamativa (NUEVO / GRATIS / HOY / IMPERDIBLE / PROMOCIÓN)
- Acciones verticales a la derecha del post: ❤️ me gusta, 💬 comentarios, 📤 compartir, 🔖 guardar
- Botones contextuales abajo del post: Cómo llegar, Comprar entradas (si es pagado), Más información
- Fuente del contenido: curado por el equipo/administradores + eventos que suben organizadores/negocios verificados (vía el registro de negocios) — no contenido abierto de cualquier usuario, para mantener la calidad del feed principal
- Encabezado: logo, ícono de notificaciones, ícono de búsqueda
- Debajo del encabezado, fila horizontal deslizable de categorías de evento (Para ti, Música, Gastronómico, Cultural, Deportivo, Nocturno, Más) — filtra el feed de eventos, no categorías de lugares
- **Barra de IA fija**, visible mientras se hace scroll (no solo un botón flotante aparte): "✨ Pregúntale a la IA — ¿Qué plan me recomiendas para hoy?"

**Dónde vive todo lo demás (para que quede claro que no falta, solo está en otra pantalla):**
- Restaurantes, cafés, hoteles, glampings y lugares fijos → pestaña **Explorar** (mapa + cuadrícula tipo Instagram Explore)
- Preguntas, respuestas y reportes en vivo de la comunidad → pestaña **Comunidad**, y el "muro" de cada lugar accesible desde su Bottom Sheet en Explorar

### 3. Explorar — mapa + cuadrícula (pantalla distinta a Inicio)
- Mapa ocupa ~75% de la pantalla, con ubicación real del usuario (geolocalización del navegador) y pines de colores por categoría (íconos vectoriales, nunca pines genéricos)
- Barra de filtros horizontal por categoría, tipo píldora
- Widget de clima flotante
- Al tocar un lugar: se abre un **Bottom Sheet** (ventana deslizante desde abajo), nunca una pantalla nueva — el mapa siempre permanece visible detrás
- El Bottom Sheet incluye: foto grande, nombre, categoría, ubicación, calificación, estado (abierto/cerrado/abre en X), distancia y tiempo caminando real (calculado con la ubicación del usuario)
- Acciones: Cómo llegar (abre Google Maps con ruta real), Pedir Uber (deep link real), Llamar Taxi, Guardar, Compartir, y si aplica: Comprar entradas / Ver menú / Página web / Llamar
- Sección "Cómo llegar" con tarjetas por modo: caminando, bici, tranvía (con parada más cercana y tarifa real de Cuenca), auto
- Sección "Transporte disponible": tranvía y bus con línea, parada, próximo horario, costo
- Sección "Otras opciones": Uber, Taxi Ejecutivo, Taxi Convencional, con tiempos y precios marcados explícitamente como estimados
- **Botón "✨ Preguntar a la Guía IA" dentro del Bottom Sheet**, contextual a ese lugar específico (ej. "¿qué otro lugar parecido hay cerca?", "hazme una ruta desde aquí") — la IA responde usando el contexto de ese lugar, no un chat genérico aparte

### 4. Comunidad — preguntas, respuestas y estados en tiempo real
- Preguntas ancladas a un lugar (ej. "¿qué hay hoy por San Blas?"), con respuestas de la comunidad, likes por respuesta, y marca de "respuesta verificada" (solo administradores por ahora)
- Estados tipo Stories: reportes en vivo por lugar ("hay fila en el cine", "está lloviendo en Cajas"), con foto o video opcional
- Cada lugar tiene su propio "muro" con historial de preguntas y estados — accesible desde el Bottom Sheet o desde el feed

### 5. IA
- Endpoint backend que llama a la API de Claude, con el contexto real de preguntas/respuestas/estados/lugares de la base de datos — nunca respuestas genéricas
- Accesible desde la barra fija en Inicio, y contextualmente desde cada Bottom Sheet de lugar

## Modelo de datos (punto de partida, ajústalo si tiene sentido técnico hacerlo distinto)

- **users**: id, username, password (hash vía Supabase Auth, + OAuth Google/Apple), avatar_url, usage_mode, interests (array), created_at
- **businesses**: id, owner_id, name, category, address, lat, lng, whatsapp, phone, instagram, website, hours, image_url, description, status
- **places**: id, name, area, channel_default, image_url, lat, lng
- **questions**: id, author_id, place_id, channel, text, created_at
- **answers**: id, question_id, author_id, text, likes_count, verified, created_at
- **statuses**: id, author_id, place_id, channel, text, media_url, media_type, created_at
- **events**: id, business_id (nullable si lo carga el equipo), title, description, category, image_url, video_url, location_name, lat, lng, start_at, end_at, price (nullable si es gratis), ticket_url, tag (NUEVO/GRATIS/HOY/IMPERDIBLE/PROMOCIÓN), likes_count, comments_count, created_by
- **channels**: id, label, color_hex

## Notas de producto a tener presentes

- Arranque en frío: cargar contenido semilla real antes de invitar público; lanzar concentrado en una sola zona (Centro Histórico) en vez de toda Cuenca de golpe
- Moderación de contenido desde el día 1
- "Respuesta verificada" solo por administrador por ahora

## Orden de construcción — ve fase por fase, no todo de golpe

**Fase 1:** proyecto Vite + React, sistema de diseño como constantes reutilizables, conexión Supabase (dejo el proyecto sin crear — deja cliente, `.env.example` y esquema SQL listos para cuando yo cree el proyecto en supabase.com), esquema de base de datos, flujo de login/registro con "explorar sin registrarme" y registro progresivo.

**Fase 2:** feed vertical de Inicio estilo Instagram (esto es lo más importante de construir bien — revisa la sección "Inicio" arriba antes de empezar), cuadrícula de Explorar, Bottom Sheet de lugar, crear pregunta/estado con foto o video, responder y dar like.

**Fase 3:** mapa real con geolocalización y pines, "Cómo llegar" con Google Maps y Uber, tranvía/bus, barra de historias/estados en Inicio.

**Fase 4:** endpoint de IA conectado a la API de Claude con contexto real, barra de IA fija en Inicio, botón de IA contextual en el Bottom Sheet.

**Fase 5:** notificaciones push, perfil de usuario, registro de negocios, panel de administración simple, conversión a PWA instalable.

---

## Estado real de la implementación (actualizado por Claude Code)

Las Fases 1, 2 (parcial), 3 (parcial), 4 y 5 ya están construidas — ver `README.md` para el detalle completo de qué existe hoy. Diferencias/decisiones tomadas respecto a este prompt maestro, documentadas para no perder contexto:

- **"Explorar" ya construido** (mapa + cuadrícula) corresponde a lo que este documento describe como Fase 3/pantalla 3. Falta agregar a esa pantalla: mapa real con geolocalización y pines, widget de clima, Uber, tranvía/bus, tiempo caminando real.
- **"Inicio" (feed vertical estilo Instagram) es nuevo** — no existía antes de este prompt. Es la pieza central pendiente de construir.
- **Mapa:** se usa Leaflet + OpenStreetMap (gratis, sin API key) en vez de Google Maps/Mapbox, para no depender de una cuenta/token que el usuario tendría que crear. "Cómo llegar" sigue abriendo Google Maps vía deep link (no requiere API key).
- **Clima:** por ahora widget visual sin datos reales (requeriría una cuenta de OpenWeatherMap u similar); se deja preparado para conectar una API real cuando el usuario decida cuál usar.
- **Tranvía/bus:** no existe una API pública de tiempo real para el tranvía/buses de Cuenca; se muestra información estática (parada más cercana, tarifa) en vez de "próximo horario" en vivo, para no inventar datos.
- **Corrección importante (posterior):** Inicio se había construido mezclando lugares/estados/preguntas/editorial en el feed. Se corrigió para que sea **solo eventos**, según la reescritura de la sección "Inicio" de arriba. La tabla `editorial_posts` se eliminó y se reemplazó por `events`. Restaurantes/cafés/hoteles siguen viviendo en Explorar; preguntas/respuestas/estados siguen viviendo en el muro de cada lugar (Comunidad).
- **Creación de eventos:** por ahora solo administradores desde `/admin`. La idea de "negocios verificados" suben sus propios eventos queda anotada para una fase posterior — el registro de negocios existente no distingue todavía un estado "verificado" separado de "aprobado".

## Rediseño visual premium (confirmado, en curso)

Se recibió un prompt de rediseño visual integral (editorial/premium, referencias Instagram+Airbnb+Apple+Fever). Antes de implementar se hizo una auditoría y se detectaron contradicciones con lo ya definido arriba; el usuario las resolvió punto por punto:

- **Inicio se mantiene solo-eventos.** No se revierte la corrección de arriba. El rediseño visual del feed no reabre la mezcla con lugares.
- **Pestaña "Reels" (video corto):** fuera de alcance por ahora. Es funcionalidad nueva, no rediseño visual — anotada para una fase de producto posterior.
- **Navegación inferior:** se agrega una pestaña **"Comunidad"** → queda Inicio / Explorar / Comunidad / Perfil. "Reels" y "Publicar" como pestaña propia quedan fuera por ahora. Nota: la pestaña "Comunidad" está confirmada como decisión pero **todavía no se construyó** — hoy preguntas/respuestas/estados siguen viviendo solo dentro del Bottom Sheet de cada lugar en Explorar; falta decidir el contenido de esa pantalla (¿feed global de preguntas/estados de todos los lugares?) antes de darle una ruta y un tab propios.
- **Creación de contenido:** se mantiene solo-admin para eventos y lugares (no se abre un flujo "Publicar" tipo Instagram para evento/lugar a usuarios normales). Preguntar/reportar estado en el muro de un lugar sigue abierto a cualquier usuario autenticado, como ya funcionaba.
- **Categorías/destinos nuevos** (Compras, Museos, Cajas, Paute, Gualaceo, Chordeleg, Soldados, etc.): fuera de alcance, anotado para una fase posterior de expansión de taxonomía/geografía.
- **Sin datos inventados:** galería multi-foto, calificación (rating), "publicaciones relacionadas" y "eventos/lugares cercanos" en el detalle quedan fuera hasta que exista el esquema real — no se simulan con datos falsos.

**Design system:** se extendieron (no reemplazaron) los tokens existentes en `src/styles/theme.js`/`tokens.css`: escala de espaciado (4/8/12/16/20/24/32/40/48), escala tipográfica nombrada (display/h1/h2/h3/body/bodySmall/label/metadata/button), y colores nuevos `aiAccent` (lavanda `#8B7CE0`, exclusivo de la Guía IA — nunca se reusa en otro contexto), `success`/`warning`/`error`/`surface`/`borderSubtle`, más un `shadow-modal`. Componentes nuevos reutilizables: `ImageWithFallback` (arregla el bug de tarjetas negras cuando una imagen no carga — no existía ningún `onError` en toda la app), `EmptyState`, `LoadingSkeleton`, `AppHeader`, `LocationMetadata`, `SocialActions` (con microrebote en el like). Se eliminó `StoriesBar.jsx`, código muerto desde la corrección de Inicio a solo-eventos.

**Hecho:** Fase de Design System + Feed premium (Inicio) — `FeedCard`, `FeedPage`, `CategoryPillsRow`, `GuideBar`/`GuideChat` (ahora en lavanda) y el botón de IA contextual en `PlaceSheet`.

## Dirección creativa oficial (documento de filosofía de marca)

El usuario entregó un segundo documento — no de requisitos, sino de **identidad visual y filosofía de producto**: "diseñar deseo, no interfaces", contenido/fotografía siempre protagonista, tipografía editorial (Kinfolk/Condé Nast, no genérica de app), mucho aire, movimiento tipo Apple, un feed que se sienta "revista infinita" con ritmo variable (no todas las publicaciones con la misma jerarquía), mapa elegante tipo Apple Maps (no Google Maps), y sobre todo: **esto es una marca, no una colección de pantallas** — cada pantalla debe ser reconocible sin logo. Se adopta como criterio de calidad permanente para todo el proyecto, sin reemplazar los requisitos funcionales de arriba. Filtro de aceptación acordado antes de mostrar cualquier pantalla: *¿Apple lo aprobaría, Airbnb lo publicaría, Instagram lo lanzaría?*

Decisiones de aplicación confirmadas por el usuario:
- **Fotografía placeholder editorial/cinematográfica** (Unsplash, curada por tema — arquitectura patrimonial, gastronomía, naturaleza, cultura), no genérica, hasta tener el banco fotográfico real de Cuenca. El contenido definitivo no es el objetivo de esta etapa, la experiencia sí.
- **Escala tipográfica más grande y editorial** para títulos de tarjeta.
- **Mapa restyled** a un estilo muteado tipo Apple Maps (se descarta el aspecto "Google Maps" del tile por defecto de OSM).
- **Transición continua feed → detalle**, sensación de expansión, no de panel nuevo encima.
- **Ritmo editorial obligatorio en el feed**: no todas las tarjetas con la misma composición — variantes portada/destacado/normal/rápida/historia.

**Hecho (esta iteración — Feed + sistema visual, sin nuevas funcionalidades):**
- `supabase/migrations/0011_seed_events.sql`: imágenes semilla reemplazadas por fotografía Unsplash curada por tema (antes picsum genérico); se agregó un 5º evento de ejemplo ("Noche de Jazz en el Barranco", con `video_url` de ejemplo) para cubrir la variante "historia".
- `src/lib/feed.js`: `getCardVariant()` — asigna la variante de ritmo editorial (portada/destacado/historia/rapida/normal) a partir de datos reales ya existentes (posición por proximidad en el tiempo, `tag`, `video_url`) — nunca datos inventados.
- `src/styles/theme.js`: tokens tipográficos editoriales nuevos (`cardTitle`, `cardTitleFeatured`, `cardTitlePortada`, `cardTitleCompact`, `kicker`), y `display` subido a 34px. Deliberadamente separados de `h1`/`h2` para no afectar otras pantallas todavía no rediseñadas (perfil, admin).
- `src/features/feed/FeedCard.jsx` + `SocialActions.jsx`: renderizado por variante (altura, tipografía, kicker en itálica, densidad de contenido, anillo de color en "destacado").
- `src/features/explore/MapView.jsx`: tiles de OpenStreetMap por defecto reemplazados por CARTO Positron (gratis, sin API key) — base muteada en vez del estilo saturado por defecto.
- `src/lib/viewTransition.js` (nuevo): envoltorio de la View Transitions API nativa del navegador (con `flushSync`, sin librería nueva) para la continuidad feed→detalle; respeta `prefers-reduced-motion` y navegadores sin soporte (fallback silencioso, sin regresión). Aplicado a `FeedPage`/`FeedCard`/`EventSheet` vía un `viewTransitionName` compartido por evento.
- **Nota de verificación honesta:** este sandbox de desarrollo bloquea la salida a CDNs de imágenes externos (se probó Unsplash, Wikimedia, Pexels y picsum — los cuatro bloqueados por la política de red del entorno), así que no pude confirmar visualmente que cada URL de Unsplash específica cargue. El patrón (CDN directo de Unsplash, sin API key) es el correcto y el fallback de imagen ya construido cubre cualquier URL que falle sin romper la interfaz, pero conviene una revisión visual rápida la primera vez que se vea en un navegador con red real.

**Pendiente** (mismo orden acordado, ahora bajo el criterio de la dirección creativa): detalle + comentarios separados (`EventSheet`/`PlaceSheet`), resto de Explorar (más allá del tile), registro de negocio (sacar lat/lng crudos de cara al usuario — hoy expuestos como campos numéricos en `BusinessRegisterPage`), auth/perfil, revisión global.

## Refinamiento visual extremo (etapa de "Director Creativo")

El usuario pidió una etapa dedicada solo a pulir diseño, sin funcionalidades nuevas, con un filtro de aceptación explícito: *¿Apple lo aprobaría, Airbnb lo publicaría, Instagram lo lanzaría?* Se identificaron 5 cambios de alto impacto (analizados como Director Creativo, no como lista de ajustes cosméticos), aprobados en este orden, más un 6º principio transversal:

1. Duotono cálido en los overlays de foto (con la tinta de marca, no negro genérico).
2. Personalidad tipográfica propia en Fraunces (eje óptico, no "una serif más").
3. Un patrón estructural nuevo en el ritmo del feed (no solo variar alto/tipografía de la misma tarjeta) — ej. "Selección del editor" horizontal.
4. Mapa con profundidad real (pines con ícono + sombra, cristal esmerilado en filtros/clima) — no solo el tile.
5. Microinteracciones táctiles universales: estado "presionado" en todo elemento tocable + paralaje de foto al hacer scroll.
6. **ADN de marca**: cada componente (tarjeta, botón, título, transición, etiqueta) debe tener personalidad propia — la app debe reconocerse sin logo.

**Hecho (cambios 1 y 2):**
- `src/styles/theme.js`: nueva función `photoOverlay()` — degradado con `COLORS.ink` en vez de negro puro, centralizado (una sola fuente de verdad para "el degradado de Ahorita"). Aplicado en `FeedCard.jsx` y `PlaceCard.jsx` (antes cada uno tenía su propio `rgba(0,0,0,...)` inline).
- `src/styles/theme.js`: los tokens `display`, `cardTitle`, `cardTitleFeatured`, `cardTitlePortada` y `kicker` ahora fijan `fontVariationSettings` sobre el eje óptico (`opsz`) de Fraunces — opsz muy bajo (9) a tamaños grandes es la firma tipográfica deliberada (Fraunces se vuelve más suelta/con carácter en vez de leerse como una serif elegante genérica), opsz medio (40) en el kicker itálico. No requirió cambiar el `<link>` de Google Fonts (los ejes `ital`/`opsz`/`wght` ya estaban cargados) — cero riesgo de romper la carga de la tipografía.
- `PlaceCard.jsx` también recibió `ImageWithFallback` (no la tenía todavía).

**Pendiente (mismo orden):** 3 (patrón estructural del feed), 4 (mapa con profundidad), 5 (microinteracciones táctiles universales), 6 (ADN de marca — transversal, se refuerza en cada cambio siguiente en vez de ser un paso aislado).

## Guía IA: cápsula editorial (implementado)

Se rechazó explícitamente el patrón de FAB/chatbot flotante (tipo Intercom/Drift) y la barra tipo buscador original. La Guía IA ahora es una pieza editorial, no un botón: `src/features/ai/GuideCapsule.jsx` reemplaza a `GuideBar.jsx` (eliminado).

- **Forma:** cápsula de ancho de contenido (no ancho completo, no círculo), fondo lavanda casi transparente con `backdrop-filter: blur`, sin sombra dura, texto en itálica (Fraunces, mismo tratamiento tipográfico que el kicker editorial del feed) — se lee como una cita/invitación, no como un input ni un CTA.
- **Contextual y viva:** mensaje distinto según la sección (`context="inicio"` / `"explorar"`), rotando cada ~7s con un fundido de opacidad de 450ms — nunca el mismo texto fijo. El sparkle tiene una "respiración" (`ahorita-breathe`, opacidad 0.55↔1 en 2.6s) — microanimación deliberadamente casi imperceptible, sin rebote ni brillo llamativo.
- **Transición "que respira":** al tocarla, la cápsula se expande hacia la hoja de conversación completa vía la misma View Transitions API ya usada en feed→detalle (mismo `viewTransitionName` compartido, mismo mecanismo `withViewTransition`) — reutilizar el mismo gesto en toda la app es, en sí mismo, la firma de marca que se pidió, no una animación nueva por pantalla.
- **Dónde vive:** montada directamente en `FeedPage` (bajo las píldoras de categoría) y en `ExplorePage` (bajo el encabezado) — no como un elemento `position:fixed` global, para evitar que se superponga con el contenido inferior de cada `FeedCard` (acciones sociales, botones contextuales) que ya ocupa esa franja de la pantalla. La consistencia viene de ser el mismo componente reutilizado con distinto `context`, no de ser un único nodo flotante.
- **Nota honesta:** los mensajes de ejemplo del usuario que requieren datos reales (distancia a un evento, clima) no se implementaron todavía — necesitan geolocalización/clima real, que es funcionalidad nueva fuera del alcance de "solo diseño" de esta etapa. Los mensajes actuales son genéricos por sección, no inventan datos.
- `BottomSheet.jsx` ganó un prop opcional `panelStyle` (retrocompatible) para poder aplicar el `viewTransitionName` al panel sin acoplar la lógica de la IA al componente genérico.

## Sistema editorial del feed: preparado, no implementado

Se aprobó la idea de bloques editoriales (Selección del editor, Imperdibles de hoy, Planes para hoy, Gratis esta semana, Escápate este fin de semana, Ruta gastronómica, Ruta del café, Cinco lugares para una cita, Lo nuevo en Cuenca, Joyas escondidas, Descubre cerca de ti) como un patrón estructural futuro que rompa el ritmo del feed — explícitamente **no implementado todavía**, solo preparado:

- `src/features/feed/EditorialShelf.jsx` (nuevo): bloque horizontal deslizable con encabezado editorial (kicker + título), tarjetas con el mismo duotono/`ImageWithFallback` que el resto de la app. Genérico — recibe `title`/`subtitle`/`items`, no sabe nada de "Selección del editor" específicamente.
- `FeedPage.jsx` ya sabe despachar por `item.kind` (`"editorial-shelf"` → `EditorialShelf`, cualquier otra cosa → `FeedCard` como hoy) — pero `lib/feed.js#getFeed()` **no genera ningún item de este tipo todavía**, así que no hay cambio de comportamiento visible en producción. Cuando se decida cuál de estos bloques construir primero (y con qué lógica de curaduría/datos), solo hace falta que `getFeed()` (o una función nueva) produzca items con ese `kind` — el sistema visual ya está listo para recibirlos.
