# Ahorita (Cuenca Viva) — Prompt maestro

> **Ver `ARCHITECTURE.md` primero.** Ese documento es la visión y arquitectura fundacional del ecosistema completo (sin código) y es la autoridad de producto para las fases futuras. Para todo lo relacionado con la Guía IA específicamente, `AI_PHILOSOPHY.md` es la autoridad absoluta — define su filosofía, personalidad y comportamiento, y ninguna implementación futura de IA puede contradecirlo. Este archivo (`PROJECT.md`) es el registro fase por fase de lo ya implementado — se actualiza para reflejar cada fase construida, pero cuando entra en conflicto con `ARCHITECTURE.md` o `AI_PHILOSOPHY.md`, este archivo es el que debe ajustarse.

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
- `supabase/migrations/0012_seed_events.sql`: imágenes semilla reemplazadas por fotografía Unsplash curada por tema (antes picsum genérico); se agregó un 5º evento de ejemplo ("Noche de Jazz en el Barranco", con `video_url` de ejemplo) para cubrir la variante "historia".
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

## Banco de fotografía de demostración (temporal)

Se agregó `public/demo-photos/` con fotografías reales (no ilustraciones, no rectángulos de color), con licencia libre, obtenidas de proyectos de código abierto de referencia (plantillas web MIT: `codewithsadee/foodhub-restaurant-website`, `codewithsadee/tourly`, `codewithsadee/grilli`) y verificadas visualmente una por una antes de usarlas: `cafeteria-barista.jpg`, `gastronomia-wraps.jpg`, `naturaleza-andes.jpg`, `eventos-cena.jpg`, `parrilla-nocturna.jpg`.

`supabase/migrations/0012_seed_events.sql` referencia estas rutas locales (`/demo-photos/...`) en vez de URLs externas — esto también resuelve que el sandbox de desarrollo bloquea CDNs de imágenes externos, así que las capturas sí muestran el resultado visual real.

**Corrección de coherencia territorial (posterior):** la primera versión incluía `arquitectura-patrimonio.jpg` (Venecia) y `cultura-pueblo.jpg` (Portofino) — el usuario señaló correctamente que rompían la coherencia territorial con Cuenca/Azuay al mostrar lugares identificables de otra región. Se eliminaron ambas y se reemplazaron por escenas genéricas sin ningún monumento/lugar reconocible de otro país (café, mesa elegante, comida, parrilla nocturna) más `naturaleza-andes.jpg` (que sí es genuinamente una escena andina y se mantuvo). **Nota honesta:** se intentó activamente encontrar fotografía real y verificable de arquitectura colonial andina específica (Cusco, Quito, Sucre, Popayán) a través de los canales disponibles (varios repositorios de plantillas open-source en GitHub, Wikimedia Commons — bloqueado en este sandbox) sin éxito; por eso el banco actual prioriza escenas neutras sobre imágenes temáticamente más específicas pero territorialmente incorrectas. Si el usuario puede compartir fotografías de referencia directamente, se incorporarían de inmediato en vez de seguir buscando.

## Sistema editorial del feed: "Selección del editor" (primer bloque real)

Se implementó el primer bloque editorial real (no solo preparado) dentro del feed en producción:

- `src/features/feed/EditorialShelf.jsx`: bloque horizontal deslizable, tarjetas de 172×228 con mucho aire entre sí, kicker+título con la misma personalidad tipográfica de Fraunces del resto de la app, y un desvanecido sutil en el borde derecho (`mask-image`, no una flecha ni un punto) que insinúa que se puede seguir deslizando. Cada tarjeta es un botón real: al tocarla abre el mismo `EventSheet` que una tarjeta normal del feed.
- `src/lib/feed.js#getFeed()`: `pickEditorSelection()` arma "Selección del editor" con los **mismos eventos reales** del feed (los marcados `nuevo`/`imperdible`; si hay menos de 3 con esas etiquetas, usa los próximos eventos en general) — nunca contenido inventado. El bloque se inserta en la posición 1 del feed (justo después de la portada) para romper el ritmo vertical temprano, y solo aparece si hay al menos 3 eventos reales elegibles.
- Verificado: scroll vertical del feed intacto, scroll horizontal independiente dentro del bloque, apertura del detalle tanto desde una tarjeta del shelf como desde una tarjeta normal, con fotografía real visible en ambos casos (capturas revisadas una por una).
- **Deliberadamente no incluido todavía:** el resto de los bloques editoriales listados (Imperdibles de hoy, Planes para hoy, Ruta del café, etc.) — el usuario pidió validar primero que "Selección del editor" tenga el nivel esperado antes de construir cualquier otro. `FeedPage.jsx` ya despacha genéricamente por `item.kind`, así que agregar el siguiente bloque no requiere tocar esa lógica de nuevo.

## Refinamiento final de "Selección del editor" y EventSheet

Antes de construir un segundo bloque editorial, se hizo una última pasada de pulido sobre lo ya aprobado:

- **Overlay del shelf**: nueva función `bottomFade()` en `theme.js` — degradado de dos paradas que cubre solo la franja inferior de cada tarjeta (donde vive el texto) y deja el resto de la fotografía completamente sin oscurecer. Reemplaza el `photoOverlay()` de 3 paradas que se usaba antes ahí (ese sigue igual en `FeedCard`, sin cambios — es correcto para una tarjeta de pantalla completa, no para una miniatura).
- **Scroll del carrusel**: `scroll-snap-type: x mandatory` + `scroll-snap-align: start` por tarjeta, y el padding horizontal del shelf se igualó al del resto del feed (0, heredado del `<main>`) para que la primera tarjeta no se sienta "cortada" contra el borde. El desvanecido del borde derecho (`mask-image`) sigue siendo la señal de que hay más contenido, ahora un poco más ancho (32px) para notarse mejor.
- **`DirectionsSection.jsx` (compartido por `EventSheet` y `PlaceSheet`)**: eliminadas las cajas anidadas — antes era una tarjeta blanca conteniendo 4 mini-tarjetas de modo de transporte + tarjetas de tránsito expandibles, todas con su propio fondo. Ahora los modos de transporte son solo ícono+texto en fila, sin fondo individual, y la sección de tránsito expandida es texto plano. Se redujo a **una sola acción principal** ("Cómo llegar", botón sólido); "Pedir Uber" pasó a ser un enlace de texto subrayado, no un segundo botón compitiendo. `components/ui/Button.jsx` ganó un prop `as` (por defecto `"button"`, acepta `"a"`) para poder usar el mismo componente de botón como enlace sin duplicar estilos.
- **`EventSheet.jsx`**: reemplazados los `fontSize`/colores sueltos por los tokens `TYPE`/`SPACE` del sistema de diseño (antes eran valores inline ad hoc, inconsistentes con el resto de la app). Fecha+ubicación consolidadas en una sola línea con `LocationMetadata`; los comentarios dejaron de ser tarjetas blancas con sombra (caja dentro de la hoja) y ahora son filas separadas por un borde superior sutil — más ligero, menos "ficha técnica".
- **Espacio inferior / `BottomNav`**: el padding inferior de `FeedPage`, `ExplorePage` y `ProfilePage` (que reserva espacio para que el contenido no quede debajo de la barra fija) ahora es consciente del safe-area (`calc(84px + env(safe-area-inset-bottom))`), igual que el padding inferior del panel de `BottomSheet.jsx` (`calc(24px + env(safe-area-inset-bottom))`) — antes ambos eran valores fijos que no consideraban el home indicator de iOS.
- Verificado con capturas: portada completa, "Selección del editor" con el nuevo overlay, el carrusel desplazado, el detalle del evento (incluida la sección "Cómo llegar" sin cajas anidadas), y el final de una publicación normal del feed justo antes del `BottomNav` — nada queda oculto ni apretado contra la barra.

## Coherencia semántica de la fotografía por categoría

El usuario señaló mismatches concretos: "Festival de las Flores" (cultura) se mostraba con una barista, "Concierto en el Teatro Sucre" (música) con una cena, "Carrera 10K" (deportes) con montañismo en nieve — fotos temáticamente incoherentes con el evento, aunque ya no mostraran lugares de otra región. Se implementó una capa real de asignación visual, no solo un reemplazo manual de esas 3 fotos:

- **`src/components/ui/CategoryFallback.jsx`** (nuevo): fallback editorial de marca por categoría — degradado suave con el color de esa categoría (`CHANNEL_COLORS`) + su ícono (`CHANNEL_ICONS`, ya existente). Se ve diseñado a propósito, no como un error de carga.
- **`src/components/ui/ImageWithFallback.jsx`**: gana un prop opcional `category`. Cuando no hay `src` (o falla la carga) y se pasa `category`, muestra `CategoryFallback` en vez del ícono gris genérico. `FeedCard`, `EventSheet`, `EditorialShelf` y `PlaceCard` ya pasan su categoría/canal correspondiente.
- **Regla aplicada a la semilla**: solo se asigna una fotografía real cuando es semánticamente coherente — hoy eso es únicamente `gastronomia` (comida) y `naturaleza` (montaña andina, sin usar en esta tanda de eventos). El resto de las categorías (`cultura`, `musica`, `deportes`, `vida_nocturna`) no tienen todavía una foto real que les corresponda, así que `image_url = null` a propósito en `0012_seed_events.sql` y se apoyan en el fallback de marca — nunca una foto forzada solo por tener "algo".
- Esto es una capa reutilizable, no un parche de 3 filas: cualquier evento futuro sin foto (los suba un admin o no) cae automáticamente en el fallback correcto de su categoría.

## Selección del editor: arquitectura de curaduría manual (implementada)

- **`supabase/migrations/0011_events_editor_pick.sql`** (nuevo, corre antes que el seed): agrega `events.editor_pick boolean not null default false`.
- **`src/lib/feed.js#pickEditorSelection()`**: ahora prioriza `events.filter(e => e.editor_pick)` (curaduría manual real) cuando hay 3 o más marcados; si no, cae al heurístico automático de antes (etiquetas `nuevo`/`imperdible`, o los próximos eventos). El bloque deja de ser "solo una repetición automática del feed" — ya tiene una fuente de verdad manual real, aunque el heurístico automático sigue como respaldo.
- **`AdminPage.jsx`**: el formulario "Cargar un evento nuevo" gana un checkbox "Incluir en 'Selección del editor'" que escribe directamente en `editor_pick`. El equipo ya puede curar el bloque desde el panel, sin tocar código.
- Datos semilla: 3 de los 5 eventos (`Festival de las Flores`, `Feria Gastronómica de Calle Larga`, `Noche de Jazz en el Barranco`) tienen `editor_pick = true` para demostrar que el mecanismo manual funciona (verificado: el shelf muestra exactamente esos 3, no los 5 que mostraría el heurístico de etiquetas).

## Administración completa de eventos y lugares (implementada)

El hueco señalado en la nota anterior —solo se podía *crear* eventos, no editarlos— queda cerrado. Esta fase agrega CRUD completo para `events` y `places` desde `/admin`, sin tocar código ni la base de datos manualmente.

- **`supabase/migrations/0013_admin_lifecycle.sql`** (nuevo): agrega `events.status/organizer/publish_at/expires_at` (default `status='publicado'`, resto nulo → cero cambio de comportamiento en contenido existente) y `places.status`. Agrega las políticas RLS de UPDATE/DELETE para `places` que no existían (antes solo tenía INSERT admin). Ajusta el SELECT público de ambas tablas a `status = 'publicado' OR is_admin()` — borradores/ocultos dejan de ser públicamente consultables.
- **`src/lib/events.js`** / **`src/lib/places.js`**: nuevas `listAllEventsForAdmin`/`listAllPlacesForAdmin` (búsqueda por nombre + filtros de categoría/estado/fecha), `updateEvent`/`updatePlace`, `deleteEvent`/`deletePlace`. `listUpcomingEvents` (feed público) ahora también respeta `publish_at`/`expires_at` vía `.or()` encadenado, además del filtro de tiempo existente.
- **Componentes nuevos**: `ConfirmationModal` (para eliminar — irreversible; ocultar es un toggle de un clic, sin confirmación, por ser reversible), `MediaUploader` (subir/reemplazar/eliminar foto, reutiliza `uploadMedia` de `lib/storage.js`; al eliminar vuelve a `null` y cae en el `CategoryFallback` ya existente), `LocationPicker` (mapa Leaflet con clic para ubicar, mismos tiles CARTO que Explorar; lat/lng quedan detrás de un disclosure "Coordenadas avanzadas", nunca como campo primario), `FormSection` (numerador + título de cada bloque del editor).
- **Páginas nuevas** en `src/pages/admin/`: `AdminEventsListPage`/`AdminPlacesListPage` (buscar, filtrar por categoría/estado, duplicar, ocultar/mostrar con un clic) y `AdminEventEditorPage`/`AdminPlaceEditorPage` (crear y editar en el mismo componente, según haya `:id` en la ruta). El editor es **una sola página deslizable** dividida en las 7 secciones pedidas, en orden — no un wizard de pasos bloqueantes, por eficiencia: Información principal, Fotografías, Fecha y disponibilidad (en lugares: Horario, ya que un lugar fijo no tiene fecha de inicio/fin como un evento), Ubicación, Entradas y contacto, Publicación y visibilidad (estado, `editor_pick`, programar publicación, expiración), Vista previa. La vista previa renderiza `FeedCard`/`PlaceCard` reales con el estado del formulario — no una maqueta.
- **Rutas nuevas** en `App.jsx`: `/admin/eventos`, `/admin/eventos/nuevo`, `/admin/eventos/:id`, `/admin/lugares`, `/admin/lugares/nuevo`, `/admin/lugares/:id`.
- **`AdminPage.jsx`** simplificado a dashboard: los formularios inline "Cargar un lugar/evento nuevo" se retiran (superados por los editores nuevos) y se reemplazan por dos tarjetas de navegación ("Eventos", "Lugares"); las secciones de negocios en revisión y respuestas sin verificar se mantienen igual.
- Verificado (build + lint limpios, flujo E2E con Playwright + Supabase mockeado): crear, editar, duplicar, ocultar/mostrar y eliminar (con confirmación) funcionan para eventos y lugares.

Fuera de alcance de esta fase, explícitamente: negocios verificados, publicaciones de usuarios, Reels, carruseles sociales, monetización, Azu Taxi, nueva IA, nuevos bloques editoriales. Tampoco se agregó "galería" (múltiples fotos por evento/lugar) — no estaba en la lista de 20 puntos de esta fase.

## ✅ FASE CERRADA — Administración de eventos y lugares (aprobada, terminada)

**Estado: cerrada y aprobada por el usuario el 2026-07-17. No se le seguirán agregando mejoras en esta etapa.** Checkpoint estable en Git: tag `checkpoint-admin-eventos-lugares` (ver el final de esta sección). La siguiente fase (sistema social) tiene su propio bloque en `ROADMAP.md` y no empieza hasta que el usuario entregue arquitectura y requisitos definitivos.

### Funcionalidades completas

- **Eventos** (`/admin/eventos`): listar, buscar por título, filtrar por categoría/estado, crear, editar, duplicar, ocultar/publicar (un clic), eliminar (con confirmación). Editable: título, descripción, categoría, etiqueta, foto (subir/reemplazar/eliminar → cae en el fallback de categoría), ubicación (buscar dirección, tocar el mapa, o coordenadas avanzadas), fecha de inicio/fin, gratis o pagado + precio, enlace de entradas, organizador, estado (borrador/publicado/oculto/finalizado/cancelado), "Selección del editor", fecha de publicación programada, fecha de expiración.
- **Lugares** (`/admin/lugares`): mismo patrón (listar/buscar/filtrar/crear/editar/duplicar/ocultar/eliminar). Editable: nombre, descripción, zona, categoría, etiqueta, foto, ubicación (mismo selector), horario, sitio web, enlace de entradas/menú (opcionales), estado (borrador/publicado/oculto).
- Vista previa real (`FeedCard`/`PlaceCard`) con el estado en vivo del formulario, no una maqueta.
- Estados de guardado (sin guardar / guardando / guardado / error) y confirmación antes de salir con cambios sin guardar.
- Menú de acciones (⋮) por elemento, con metadatos de estado, última actualización y autor cuando existe.
- Todas las imágenes y datos vienen de la base de datos — nada incrustado en los componentes visuales; los fallbacks locales (`CategoryFallback`, `public/demo-photos/`) son respaldo, no contenido definitivo.

### Limitaciones actuales (conocidas, no bloqueantes)

- **Sin galería multi-foto**: cada evento/lugar tiene una sola imagen principal (`image_url`) — no hay carrusel de fotos por elemento.
- **Sin historial/auditoría**: se sabe *cuándo* se actualizó algo por última vez (`updated_at`) y opcionalmente *quién lo creó* (`created_by`), pero no hay un log de *qué* cambió ni versiones anteriores para revertir.
- **Eliminar es permanente**: no hay papelera ni forma de recuperar un evento/lugar eliminado — por eso pide confirmación explícita.
- **Sin acciones masivas**: cada duplicar/ocultar/eliminar es por elemento, uno a la vez — no hay selección múltiple.
- **Sin paginación** en los listados de `/admin` — funciona bien con el volumen actual (semilla + pruebas), pero no se ha probado a escala con cientos de filas.
- **Búsqueda de ubicación depende de un servicio externo gratuito** (Nominatim/OpenStreetMap) sin SLA — puede ser lenta o fallar puntualmente; el clic directo en el mapa siempre queda como alternativa que no depende de red externa.
- **Sin pruebas automatizadas**: la verificación de esta fase fue manual (build, lint, y un flujo E2E puntual con Playwright + Supabase mockeado durante el desarrollo) — no quedaron tests en el repositorio.

### Qué datos son reales, cuáles de prueba, y cuáles fallback

- **Reales**: los nombres, zonas y coordenadas de los lugares y eventos semilla corresponden a sitios reales de Cuenca (Catedral de la Inmaculada, Parque Calderón, Museo Pumapungo, Barranco del Tomebamba, etc. — `0003_seed_places.sql`, `0012_seed_events.sql`). El esquema, las políticas RLS y la lógica de estados/visibilidad son reales y funcionan contra cualquier dato que un admin real cargue.
- **De prueba / placeholder, pendiente de reemplazo antes de lanzar**: las fotos de los 10 lugares semilla usan `picsum.photos` (imágenes aleatorias, no fotos reales del lugar — señalado también en `supabase/README.md`); los enlaces de entradas de los eventos semilla (`https://example.com/...`) y algunos precios son ficticios, puestos solo para probar el flujo de "gratis vs. pagado".
- **Fallback intencional (no es un placeholder temporal, es diseño permanente)**: cuando un evento/lugar no tiene foto real y coherente, `ImageWithFallback` muestra `CategoryFallback` — un degradado con el color e ícono de su categoría — en vez de forzar una imagen que no corresponde. Hoy eso incluye 2 de los 5 eventos semilla (los que no tienen foto local en `public/demo-photos/`), a propósito. Las 5 fotos en `public/demo-photos/` sí son reales y con licencia verificada, pero solo se usan donde son semánticamente coherentes (gastronomía, naturaleza) — el resto de categorías simplemente no tiene aún foto real asignada.

### Checkpoint estable

Tag de Git `checkpoint-admin-eventos-lugares` en el commit que cierra esta fase (`abf12ed`, rama `claude/esto-tengo-2wzbnj`) — usar `git checkout checkpoint-admin-eventos-lugares` (o directamente `git checkout abf12ed` si el tag no llegó a sincronizarse al remoto) para volver exactamente a este estado si una fase futura necesita revertirse.

---

## Cierre de la fase administrativa: ajustes finales (implementado)

Siete ajustes puntuales para cerrar correctamente la administración de eventos y lugares antes de pasar a publicaciones sociales. Ver `CHANGELOG.md` para el detalle técnico de cada archivo tocado.

- **Estados de guardado**: cada editor (`AdminEventEditorPage`/`AdminPlaceEditorPage`) rastrea un snapshot del formulario al cargar/guardar y lo compara contra el estado actual para saber si hay cambios sin guardar (`dirty`), y un estado de guardado (`saveStatus`: `null` | `"saving"` | `"saved"` | `"error"`). El indicador (`SaveStatusPill`, junto al título) muestra, en orden de prioridad: **Guardando…** (mientras la petición está en curso) > **Error al guardar** (si la última petición falló — se mantiene visible hasta el siguiente intento de guardar, para que un intento fallido nunca quede oculto detrás de un "cambios sin guardar" que ya existía antes de intentar) > **Cambios sin guardar** > **Guardado** (se desvanece solo a los 2.5s). Cualquier edición nueva limpia un "Guardado"/"Error" obsoleto.
- **Confirmación al salir**: `useUnsavedChangesGuard` (`src/hooks/`) cubre dos vías de salida — cerrar/recargar la pestaña o navegar a otra URL (`beforeunload`) y el botón atrás del navegador o gesto (interceptado con `popstate` + una entrada de historial señuelo). El botón "volver" propio del editor se resuelve aparte, mostrando el mismo `ConfirmationModal` ("Cambios sin guardar" / "Salir sin guardar" / "Seguir editando") antes de navegar si `dirty` es verdadero.
- **Menú de acciones por elemento**: `ActionsMenu` (nuevo, `src/components/ui/`) reemplaza los botones sueltos de "duplicar"/"ocultar" en los listados por un único menú desplegable (⋮) con **Editar / Duplicar / Ocultar (o Publicar)/ Eliminar**. "Eliminar" abre el `ConfirmationModal` ya existente en vez de borrar directo — el resto de acciones son de un clic, por ser reversibles o de bajo riesgo.
- **Metadatos por elemento**: cada fila de `/admin/eventos` y `/admin/lugares` muestra el pill de estado (ya existía), y ahora también "Actualizado hace…" (`updated_at`, mantenido automáticamente por un trigger de Postgres — ver migración `0014`) y "por `usuario`" cuando existe un creador conocido (`created_by` → `profiles.username`; en datos antiguos sin creador registrado, simplemente no se muestra esa parte).
- **Selector de ubicación mejorado**: `LocationPicker` gana un campo de búsqueda por dirección/nombre (Nominatim/OpenStreetMap, con sesgo de caja hacia Cuenca vía `viewbox`, sin filtrado estricto) con resultados desplegables; al elegir uno, el mapa se desplaza suavemente (`flyTo`) al punto y coloca el pin. El clic directo en el mapa se mantiene como alternativa. Lat/lng siguen detrás del disclosure "Coordenadas avanzadas" — nunca como campo primario.
- **Vista previa real**: sin cambios de fondo — se mantiene como estaba (sección 7 del editor renderiza `FeedCard`/`PlaceCard` reales con el estado en vivo del formulario), se verificó que sigue funcionando después de estos ajustes.
- **Documentación**: esta sección + `CHANGELOG.md` (nuevo).

### Qué puede editar hoy el administrador

Todo lo listado en la sección anterior ("Administración completa de eventos y lugares"), más lo que se agrega aquí: además de crear/editar/duplicar/ocultar/publicar/eliminar eventos y lugares con retroalimentación de guardado clara, el admin ahora ve quién y cuándo se tocó cada elemento por última vez, y puede ubicar un evento/lugar buscando su dirección en vez de tener que encontrarlo a ojo en el mapa.

### Qué falta (fuera de esta fase, explícitamente pospuesto)

- Galería de múltiples fotos por evento/lugar (sigue sin existir en el esquema — solo `image_url` + `video_url` en eventos, solo `image_url` en lugares).
- Historial de cambios / auditoría más allá de "última actualización" (no hay versionado ni un log de qué cambió exactamente).
- Negocios verificados, publicaciones de usuarios, Reels, carruseles sociales, monetización, Azu Taxi, nueva IA, nuevos bloques editoriales — explícitamente excluidos otra vez por el usuario en esta ronda.

### Cómo funcionan los estados

- **Eventos**: `borrador` (no público) → `publicado` (visible si además `publish_at` es nulo o ya pasó, y `expires_at` es nulo o no ha llegado) → `oculto` (retirado manualmente, no público) → `finalizado`/`cancelado` (estados terminales informativos, tampoco públicos salvo que se reactiven a `publicado`).
- **Lugares**: solo `borrador` / `publicado` / `oculto` — un lugar fijo no tiene un ciclo "finalizado/cancelado" como un evento con fecha.
- La visibilidad pública se aplica en dos capas: RLS en Postgres (`status = 'publicado' OR is_admin()`, migración `0013`) impide que cualquier fila no publicada sea legible por un usuario no-admin sin importar qué haga el cliente; y en el feed de eventos, `listUpcomingEvents` además filtra por `publish_at`/`expires_at` en el cliente, porque la RLS por sí sola no distingue "publicado pero programado para más adelante" de "publicado y ya visible ahora".

### Cómo se publican y ocultan contenidos

- **Publicar**: crear/editar y guardar con `status = "publicado"` (por defecto al crear). Para programar una publicación futura, se llena "Programar publicación" (`publish_at`) en la sección 6 del editor de eventos — el evento existe y es editable por el admin desde antes, pero no aparece en el feed público hasta esa fecha.
- **Ocultar**: desde el menú de acciones (⋮) del listado, un clic en "Ocultar" cambia `status` a `oculto` — reversible, sin confirmación, el mismo botón pasa a decir "Publicar" para revertirlo.
- **Eliminar**: desde el mismo menú, "Eliminar" pide confirmación explícita (`ConfirmationModal`) porque es irreversible — borra la fila de la base de datos, no solo la oculta.

---

## Fase 1 del ecosistema social — Bloque 1: esquema fundacional (implementado)

Primer bloque de la Fase 1 descrita en `MASTERPLAN.md`, ejecutado tras la aprobación de la propuesta definitiva y de las cinco decisiones de la revisión arquitectónica (ver `ARCHITECTURE.md` §9-11 y `AI_PHILOSOPHY.md` §16). **Deliberadamente invisible para el usuario final** — no hay ninguna pantalla, flujo ni comportamiento nuevo todavía; el objetivo de este bloque es puramente estructural.

- **`supabase/migrations/0015_bloque1_esquema_fundacional.sql`** (nuevo): crea seis tablas nuevas sin tocar ni una fila de las tablas existentes.
  - `cities` — poblada con una sola fila, "Cuenca".
  - `zones` — hija de `cities`, un solo nivel de profundidad (con `parent_zone_id` opcional para crecer sin comprometerse a más niveles todavía); poblada únicamente con las zonas realmente en uso hoy en `places.area` — "Centro Histórico" y "Turi" — sin inventar ninguna zona especulativa.
  - `actors` — identidad unificada con tres tipos (`persona`/`negocio`/`organizador`/`sistema`), con una restricción (`check`) que impide combinaciones inválidas (un actor de tipo persona no puede tener `business_id`, uno de tipo sistema no puede tener ni `profile_id` ni `business_id`, etc.). Ya incluye los dos actores de tipo sistema aprobados: **"Guía IA"** y **"Ahorita Editorial"**. Todavía no está conectada a `profiles`/`businesses` — esa vinculación es el Bloque 2.
  - `interactions` — polimórfica (generaliza el patrón ya usado por `post_likes`), con el catálogo de tipos ya aprobado: `me_gusta`, `quiero_ir`, `ya_fui`, `guardado`, `seguimiento`, `compartir`. `reportar` queda deliberadamente fuera de esta tabla. Nace vacía — la migración de datos de `post_likes`/`saved_places`/`saved_events`/`follows` es el Bloque 4.
  - `event_details` — primer caso real del patrón "núcleo genérico + tabla de detalle" (una tabla por fila de `events`, referenciando su `id`). Nace vacía — separar los campos específicos de cada evento existente (`start_at`/`end_at`/`price`/`ticket_url`/`organizer`) hacia aquí es el Bloque 3.
  - `consent_records` — línea base de privacidad (adelantada desde la última fase del plan original a esta primera, por decisión aprobada): registro de consentimiento y de solicitudes de acceso/eliminación de datos. Nace vacía — el mecanismo que efectivamente exporta o elimina datos es el Bloque 5.
- Las seis tablas tienen RLS habilitada, con políticas verificadas funcionalmente (no solo revisadas visualmente) contra un Postgres real antes de aplicar la migración a producción — ver la sección de verificación más abajo.

### Verificación realizada

Se levantó un Postgres 16 local (con un stub mínimo del esquema `auth` de Supabase — `auth.users` y `auth.uid()` — para poder ejecutar las migraciones reales sin depender de un proyecto de Supabase) y se corrieron, en orden, las 14 migraciones ya existentes (`0001`-`0014`) más la nueva `0015`, contra una base de datos limpia.

Comprobado con consultas reales, no solo revisión de sintaxis:
- **Cero filas perdidas o alteradas**: los conteos de `places` (10), `events` (5) y el resto de tablas existentes son idénticos antes y después de aplicar `0015`.
- **La restricción de `actors` rechaza combinaciones inválidas**: un actor `persona` con `business_id`, y un actor `sistema` con `profile_id`, fallan ambos con un error de `check constraint`, verificado con datos reales (no con una subconsulta vacía, que en un primer intento dio un falso positivo — corregido antes de dar la prueba por válida).
- **RLS de `interactions` verificada con dos usuarios reales y un rol de bajo privilegio** (nunca como superusuario, que se salta RLS por completo): un usuario puede crear una interacción con su propio actor y no con el de otro; el intento con el actor ajeno se rechaza; un duplicado exacto se rechaza por la restricción `unique`; un usuario que intenta borrar la interacción de otro borra 0 filas y el dato original queda intacto.
- **RLS de `event_details` verificada cascadeando la visibilidad real de `events`**: un usuario normal solo ve el detalle del evento con `status = 'publicado'`; el mismo usuario, marcado como admin, ve también el del evento oculto.
- **RLS de `cities` y `consent_records` verificada**: un usuario no-admin no puede crear una ciudad aunque tenga permiso de tabla (el rechazo viene de la política, no del `GRANT`); un usuario puede insertar su propio registro de consentimiento pero no uno a nombre de otro usuario.
- **Build y lint del frontend**: sin cambios, ambos limpios — no se tocó ninguna línea de código de la aplicación en este bloque, por lo que no hay regresión posible más allá de "la base de datos ya no es exactamente la misma", que es justamente lo que se verificó arriba.

---

## Fase 1 del ecosistema social — Bloque 2: identidad (implementado)

Segundo bloque de la Fase 1, con el alcance estrictamente acotado que se aprobó: vincular `profiles`/`businesses` con `actors`, sin tocar events/interactions/zones/privacidad ni la interfaz.

- **`supabase/migrations/0016_bloque2_identidad.sql`** (nuevo):
  - Crea un actor tipo `persona` por cada fila ya existente de `profiles`, y uno tipo `negocio` por cada fila ya existente de `businesses` — sin modificar ninguna columna de ninguna de las dos tablas. La relación ya vivía lista en `actors.profile_id`/`actors.business_id` desde el Bloque 1; este bloque solo la puebla.
  - Agrega dos triggers (`on_profile_created_actor`, `on_business_created_actor`), ambos `security definer` con el mismo patrón que ya usa `handle_new_user` (`0001_init.sql`), para que la correspondencia se mantenga cierta también para cada perfil o negocio que se cree de ahora en adelante — sin esto, la garantía solo sería válida en el instante en que corre la migración, y empezaría a romperse con el primer registro nuevo. Un usuario normal no tiene permiso para insertar en `actors` directamente (solo existe una política de insert para actores de sistema, del Bloque 1); el trigger funciona precisamente porque corre con privilegio elevado, igual que la creación automática de `profiles` al registrarse.
  - Los actores de sistema creados en el Bloque 1 ("Guía IA", "Ahorita Editorial") quedan intactos — el backfill solo toca filas de tipo `persona`/`negocio`.

### Decisión de alcance documentada explícitamente

La instrucción acotaba el bloque a "vincular" y "crear un actor por cada profile/business existente". Interpretar "garantizar una correspondencia **verificable**" como una garantía permanente (no solo válida en el instante de la migración) llevó a agregar los dos triggers, además del backfill — sin ellos, un usuario que se registre mañana no tendría actor, y la "correspondencia verificable" dejaría de ser cierta al día siguiente de este bloque. Se documenta aquí con esa claridad para que quede a la vista, ya que técnicamente es un mecanismo adicional (dos funciones y dos triggers) más allá de un simple `insert` de una sola vez — ninguno de los dos es visible en la interfaz ni cambia ningún comportamiento existente, solo mantiene viva la garantía pedida.

### Limitación conocida

`actors.display_name` para un actor `persona`/`negocio` es una fotografía tomada en el momento de su creación (el `username` o `name` de ese instante) — no se mantiene sincronizada si el perfil o el negocio cambian su nombre después. Ningún código de la aplicación lee todavía `actors.display_name` (nada está conectado al modelo nuevo aún), así que hoy esto no tiene ningún efecto visible; se deja anotado para que la fase que primero muestre actores en la interfaz decida entonces si lee el nombre en vivo desde `profiles`/`businesses` (recomendado) o agrega un mecanismo de sincronización — no es una decisión que este bloque debiera tomar por adelantado.

### Verificación realizada

Mismo proceso que el Bloque 1: Postgres 16 real, las 16 migraciones (`0001`-`0016`) en orden contra una base limpia, con datos de prueba reales (4 perfiles — incluyendo uno sin `username`, el caso límite — y 3 negocios).

- **Conteos idénticos antes/después** en `profiles` (4) y `businesses` (3) tras correr `0016` — ninguna fila tocada.
- **Reconciliación exacta**: cero perfiles sin actor, cero negocios sin actor, cero perfiles con más de un actor, cero negocios con más de un actor. Total: 4 personas + 3 negocios + 2 sistema = 9 actores, verificado con consulta directa, no solo inspección visual.
- **Caso límite del perfil sin `username`**: el actor se creó igual, con un nombre de respaldo generado (`Usuario` + los primeros caracteres del id) — nunca un valor nulo ni un error.
- **Los triggers probados con inserciones reales nuevas**, no solo el backfill: un signup nuevo (insertando en `auth.users`, igual que hace Supabase Auth) generó su actor automáticamente; un registro de negocio nuevo, ejecutado con un rol de bajo privilegio bajo las mismas políticas RLS que un usuario real (no como superusuario), también generó su actor — confirmando que el trigger `security definer` funciona incluso cuando quien dispara el insert no tiene permiso directo sobre `actors` (se verificó explícitamente que ese mismo rol, sin el trigger de por medio, recibe `permission denied` al intentar insertar en `actors` directamente).
- **Estrategia de reversión probada, no solo descrita**: se hizo `drop trigger`/`drop function` de ambos mecanismos y se borraron las filas de tipo `persona`/`negocio` de `actors`; el resultado fue el estado exacto de antes del bloque (mismos `profiles`/`businesses`, solo los 2 actores de sistema en `actors`) — confirmando que revertir este bloque es limpio y no deja rastro.
- **Build y lint del frontend**: sin cambios, ambos limpios — ninguna línea de código de la aplicación se tocó en este bloque tampoco.

### Incidencias encontradas

Ninguna en el resultado final. Se identificó y corrigió una decisión de alcance (los triggers, ver arriba) que requería documentarse con transparencia por exceder ligeramente una lectura estrictamente literal de "crear un actor por cada fila existente" — se optó por interpretar "correspondencia verificable" como una garantía continua, no un hecho de un solo momento, y se deja explícito para que quede a revisión.

---

## Fase 1 del ecosistema social — Bloque 3: contenido (implementado)

Tercer bloque de la Fase 1: separar hacia `event_details` los campos específicos de un evento (`start_at`/`end_at`/`price`/`ticket_url`/`organizer`), primer caso real de datos fluyendo por el patrón "núcleo genérico + tabla de detalle" de Publicación (`ARCHITECTURE.md` §9). Sin cambio de comportamiento visible para el usuario, sin tocar interacciones/zonas/privacidad (esos siguen exactamente como quedaron en el Bloque 2).

- **`supabase/migrations/0017_bloque3_contenido.sql`** (nuevo): copia `start_at`/`end_at`/`price`/`ticket_url`/`organizer` de cada fila existente de `events` hacia `event_details` (backfill, protegido con `where not exists`, igual que los bloques anteriores). No modifica ninguna columna de `events`, ninguna política RLS (las de `event_details` ya quedaron correctas desde el Bloque 1) ni ninguna otra tabla.

### Bifurcaciones arquitectónicas presentadas antes de implementar

Antes de escribir la migración se identificaron dos puntos de ambigüedad genuina y se presentaron con ventajas/desventajas/riesgos, tal como se pidió explícitamente:

**Bifurcación 1 — ¿la separación es aditiva o física?**
- *Opción A (aditiva, recomendada y aplicada)*: `event_details` se llena como copia; `events` conserva sus columnas intactas en este bloque. Ventaja: cero riesgo de romper el código de la aplicación, que hoy lee/escribe directamente contra `events` — retirar esas columnas ahora rompería la app en producción sin ningún cambio de código acompañándolo, y ese cambio de código está fuera del alcance de un bloque "exclusivamente de base de datos". Desventaja: hay duplicación de datos durante un tiempo (dos copias de los mismos cinco campos) hasta que una fase futura migre el código a leer/escribir `event_details` y recién entonces tenga sentido retirar las columnas de `events`.
- *Opción B (física)*: retirar las columnas de `events` en este mismo bloque. Ventaja: cero duplicación. Desventaja/riesgo: rompe inmediatamente cualquier parte del código de la aplicación que todavía lea `events.start_at` etc. (que es toda la app hoy), violando el requisito explícito de "sin modificar todavía el comportamiento visible de la aplicación".
- **Decisión**: Opción A.

**Bifurcación 2 — ¿`event_details` se mantiene sincronizada en vivo o es una fotografía puntual?**
- *Opción A (fotografía, recomendada y aplicada)*: se copia una sola vez, sin trigger de sincronización continua — mismo criterio ya usado para `actors.display_name` en el Bloque 2. Ventaja: no agrega complejidad ni costo de escritura a `events`, que es la tabla de mayor tráfico de escritura del sistema (cada alta o edición de evento desde `/admin` pasa por ahí), para sincronizar un dato que nada lee todavía. Desventaja: si alguien edita un evento desde `/admin` hoy, `event_details` queda desactualizada respecto a `events` hasta que una fase futura conecte de verdad el código a `event_details` (momento en el que, según la Bifurcación 1, ese código pasaría a escribir directamente ahí).
- *Opción B (sincronizada)*: un trigger en `events` mantiene `event_details` al día ante cada edición. Ventaja: los datos nunca divergen. Desventaja/riesgo: es trabajo y costo de escritura sostenido en la tabla más caliente del sistema, a cambio de mantener sincronizado un dato que ningún código lee hoy — exactamente el tipo de optimización prematura que la filosofía del proyecto pide evitar ("prefiero una arquitectura sólida antes que una implementación rápida", no "prefiero todo sincronizado aunque nadie lo use").
- **Decisión**: Opción A.

Ambas bifurcaciones se presentaron en el chat junto con la recomendación (Opción A en ambas) antes de escribir la migración. La confirmación explícita del usuario llegó en la forma de un reenvío verbatim del mensaje original de arranque del Bloque 3 — cuyo propio contenido ya exige "sin modificar todavía el comportamiento visible de la aplicación" y "prefiero una migración segura antes que una optimización prematura", coincidiendo exactamente con la Opción A de ambas bifurcaciones. Se interpretó explícitamente ese mensaje como confirmación de la recomendación, comunicándole esa interpretación al usuario antes de proceder, en vez de asumir silenciosamente que un reenvío equivalía a un "sí" sin más — siguiendo el mismo estándar de transparencia usado para la decisión de alcance del Bloque 2.

### Verificación realizada

Mismo proceso que los Bloques 1 y 2: Postgres 16 real, las 17 migraciones (`0001`-`0017`) en orden contra una base limpia, con 6 eventos de prueba (los 5 ya sembrados más uno agregado a propósito para cubrir el caso límite `end_at IS NULL` combinado con `organizer` distinto de nulo, que no existía entre los 5 originales).

- **Copia exacta campo por campo**: se capturó una foto de `events` (`id`/`start_at`/`end_at`/`price`/`ticket_url`/`organizer`) antes de aplicar `0017`, y se comparó — con `diff`, no solo inspección visual — contra el contenido resultante de `event_details` tras aplicarla. Coincidencia exacta en las 6 filas, incluyendo el caso límite de valores nulos.
- **`events` queda intacta**: mismo `diff` aplicado entre el `events` de antes y el de después de `0017` — idéntico, cero diferencias, 6 filas en ambos.
- **Idempotencia**: reaplicar `0017` sobre la base ya migrada inserta 0 filas nuevas (el `where not exists` funciona) — `event_details` se mantiene en 6 filas, no en 12.
- **RLS de `event_details` sigue cascadeando correctamente la visibilidad de `events`**, verificado con un rol de bajo privilegio real (no superusuario): de los 6 eventos (5 `publicado`, 1 `borrador`), el rol ve exactamente 5 detalles — el del evento en `borrador` queda oculto, igual que ya ocurría con el propio evento.
- **Estrategia de reversión probada, no solo descrita**: `delete from event_details` deja la tabla en 0 filas y `events` sin ningún cambio (sigue en 6) — revertir este bloque es limpio y no deja rastro, igual que en los bloques anteriores.
- **Build y lint del frontend**: sin cambios, ambos limpios — ninguna línea de código de la aplicación se tocó en este bloque (confirmado también con `git status`, que solo muestra el archivo de migración nuevo).

### Incidencias encontradas

Ninguna. Las dos bifurcaciones arquitectónicas fueron anticipadas y resueltas antes de escribir código, no descubiertas durante la implementación.

### Deuda técnica detectada

- **Duplicación de datos entre `events` y `event_details`** hasta que una fase futura migre el código de la aplicación a leer/escribir contra `event_details` y, en ese momento, se retiren las columnas equivalentes de `events` (Bifurcación 1, Opción A). No es deuda urgente — es la consecuencia esperada y aceptada de una separación aditiva.
- **`event_details` puede desactualizarse silenciosamente** si un evento se edita desde `/admin` después de este bloque, porque no hay sincronización en vivo (Bifurcación 2, Opción A) — sin efecto visible hoy porque nada lee todavía `event_details`, pero la fase que finalmente conecte código a esta tabla deberá decidir entonces si migra a leer/escribir directamente ahí (recomendado, elimina el problema de raíz) o agrega sincronización — igual que la limitación ya anotada para `actors.display_name` en el Bloque 2.

### Qué sigue (Bloque 4, pendiente de aprobación)

Interacciones y territorio: migrar `post_likes`/`saved_places`/`saved_events`/`follows` hacia `interactions`, y mapear `places.area` (texto libre) hacia `zones`. Ver `MASTERPLAN.md`, Fase 1, para el detalle completo de los cinco bloques.
