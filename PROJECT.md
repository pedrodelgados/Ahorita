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

---

## Fase 1 del ecosistema social — Bloque 4: interacciones y territorio (implementado)

Cuarto bloque de la Fase 1: poblar `interactions` con una copia fiel de `post_likes`/`saved_places`/`saved_events`/`follows`, y `places.zone_id` con el equivalente estructurado de `places.area`. Sin cambio de comportamiento visible — el frontend sigue leyendo/escribiendo exclusivamente las tablas de siempre.

Antes de implementar se presentó un análisis previo completo (tablas afectadas, lectores/escritores reales del frontend investigados en el código, recomendación aditiva vs. cambio inmediato, mapeo detallado, manejo de valores de zona no coincidentes, reconciliación de conteos, reversión, pruebas de RLS, criterios de aceptación y deuda técnica), aprobado explícitamente junto con una decisión de privacidad puntual antes de escribir cualquier migración.

- **`supabase/migrations/0018_bloque4_interacciones_territorio.sql`** (nuevo):
  - Backfill de `post_likes` → `interactions` (`type='me_gusta'`), resolviendo `actor_id` vía `actors.profile_id = post_likes.user_id` — consecuencia directa de que el Bloque 2 ya garantiza esa correspondencia.
  - Backfill de `saved_places` → `interactions` (`type='guardado'`, `target_type='place'`) y `saved_events` → `interactions` (`type='guardado'`, `target_type='event'`).
  - Backfill de `follows` → `interactions` (`type='seguimiento'`, `target_type='actor'`) — el destino es el **Actor** del perfil seguido (resuelto vía `actors.profile_id = follows.followed_id`), no el `profile_id` directamente, coherente con que Actor es la entidad que se sigue en la arquitectura.
  - Todos los backfills protegidos con `where not exists` (mismo patrón idempotente de los Bloques 2 y 3).
  - `places.zone_id` (columna nueva, nullable, `references zones(id) on delete set null`), poblada únicamente donde `places.area` coincide **exactamente** (case-sensitive) con `zones.name` para la ciudad "Cuenca". Ningún valor ambiguo se fuerza ni se corrige.
  - Reemplazo de la política de lectura de `interactions`: la política pública creada en el Bloque 1 (`for select using (true)`) se sustituye por una que excluye el tipo `guardado` de la lectura pública — ver la decisión de privacidad abajo.
  - Ningún trigger de sincronización — fotografía puntual, mismo criterio que `actors.display_name` (Bloque 2) y `event_details` (Bloque 3).
  - Ninguna columna ni fila de `post_likes`/`saved_places`/`saved_events`/`follows`/`places.area` se modifica ni se elimina.

### Decisión de privacidad de "guardado" (aprobada explícitamente antes de implementar)

Durante el análisis previo se encontró que la política de lectura de `interactions`, heredada tal cual del Bloque 1, es totalmente pública (`using (true)`) — pensada para `me_gusta`/`quiero_ir`/`ya_fui`/`seguimiento`/`compartir`, que sí son públicos hoy. Pero `saved_places` y `saved_events` son **privadas** hoy (`using (auth.uid() = user_id)`): nadie más que el dueño puede ver qué guardó. Migrar esos datos hacia `interactions` sin ajustar la política habría sido una regresión real de privacidad, no cosmética.

Se presentó como bifurcación explícita antes de escribir la migración, y se aprobó la Opción 1: **los guardados son privados** — visibles únicamente para el actor dueño o para un administrador (necesidad administrativa, legal, de soporte o de seguridad, justificada caso por caso). El resto de tipos de interacción mantiene exactamente la visibilidad pública que ya tenían. La política implementada:

```sql
create policy "Interacciones públicas excepto guardados" on public.interactions
  for select using (
    type <> 'guardado'
    or exists (select 1 from public.actors a where a.id = actor_id and a.profile_id = auth.uid())
    or public.is_admin()
  );
```

**Nota de alcance**: el acceso de administrador a un guardado ajeno es técnicamente posible (para los casos justificados que aprobaste), pero esta migración no agrega ninguna tabla ni mecanismo de auditoría de esos accesos — sería una funcionalidad nueva, fuera del alcance de un bloque que explícitamente no debía agregar funcionalidades para el usuario. Si en el futuro se decide que un registro de auditoría de accesos administrativos es necesario, es una decisión de producto a proponer y aprobar aparte, no algo que este bloque debiera asumir por adelantado.

### Verificación realizada

Mismo proceso que los Bloques 1-3: Postgres 16 real, las 18 migraciones (`0001`-`0018`, saltando `0002` que depende de Supabase Storage) en orden contra una base limpia, con datos de prueba reales: 4 perfiles (uno sin `username`, caso límite ya conocido del Bloque 2), 1 negocio, 3 `post_likes` (dos usuarios distintos likeando el mismo evento, uno likeando otro), 3 `saved_places`, 1 `saved_event`, 3 `follows`, y **un lugar de prueba con `area = 'centro historico'`** (minúsculas, deliberadamente no coincidente con ninguna `zone`) para verificar el caso límite del punto 6-8 del análisis previo.

- **Reconciliación exacta de conteos**: `interactions` quedó con 3 `me_gusta` + 3 `guardado`/`place` + 1 `guardado`/`event` + 3 `seguimiento` = 10 filas, exactamente el total esperado.
- **Comparación campo por campo** (no solo conteos) de los cuatro mapeos contra una foto de las tablas de origen capturada antes de migrar — con `diff`, coincidencia exacta en los cuatro casos (`post_likes`→`me_gusta`, `saved_places`→`guardado`/`place`, `saved_events`→`guardado`/`event`, `follows`→`seguimiento`/`actor`).
- **`places.zone_id`**: 10 de 11 lugares resueltos (coincidencia exacta con `Centro Histórico`/`Turi`); el lugar de prueba con `'centro historico'` (minúsculas) quedó correctamente en `NULL` — el comportamiento esperado del punto 6-8 del análisis previo, no un error. En una base de producción real, cualquier valor así encontrado debe reportarse antes de decidir si se corrige el dato de origen o se crea una zona legítima nueva — no se corrige ni se inventa silenciosamente en ningún caso.
- **`events.likes_count` vs. conteo real en `interactions`**: coincidencia exacta para los 5 eventos (2, 1, 0, 0, 0), confirmando que el trigger existente (`sync_event_likes_count`, del Bloque previo a Fase 1) y el backfill nuevo cuentan lo mismo.
- **Idempotencia de la lógica de datos**: reejecutar los `insert`/`update` de la migración (sin la parte de DDL de política, que por naturaleza es de una sola vez, igual que cualquier `create table`) insertó y actualizó 0 filas — el `where not exists`/`where zone_id is null` funciona.
- **Privacidad de "guardado" verificada con roles de bajo privilegio reales** (nunca superusuario): cada usuario ve únicamente sus propios guardados (ana: 2, beto: 1, caro: 1) y no los de los demás; las interacciones públicas (`me_gusta`/`seguimiento`) siguen siendo visibles para cualquier usuario (beto vio las 6 públicas de todos); un usuario marcado `is_admin` vio los 4 guardados existentes, confirmando el acceso administrativo aprobado.
- **Un actor no puede crear una interacción a nombre de otro actor**: verificado con un intento real que fue rechazado por RLS (`new row violates row-level security policy`); el mismo usuario sí pudo crear una interacción con su propio actor.
- **Un actor no puede borrar la interacción de otro**: un intento de borrado de un guardado ajeno borró 0 filas, con el dato original intacto después.
- **Tablas de origen completamente intactas**: conteos idénticos antes/después en `post_likes` (3), `saved_places` (3), `saved_events` (1), `follows` (3), `events` (5); `places.area` verificado con `diff` sin ninguna diferencia.
- **Estrategia de reversión ejecutada de verdad**: `delete from interactions`, `alter table places drop column zone_id`, y restaurar la política pública original dejaron el estado exacto previo al bloque — las cinco tablas de origen siguieron en los mismos conteos después de revertir.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirmó que solo se agregó el archivo de migración — ninguna línea de `src/` fue tocada.

### Incidencias encontradas

Ninguna en el resultado final. El hallazgo de privacidad (política pública de `interactions` vs. privacidad real de `saved_places`/`saved_events`) fue identificado y resuelto en el análisis previo, antes de escribir código — exactamente el propósito de exigir ese análisis por separado.

### Deuda técnica detectada

- **Duplicación de datos** entre las cinco tablas de origen y `interactions`/`places.zone_id`, aceptada temporalmente. Antes de que cualquier parte de la aplicación lea desde `interactions` o `places.zone_id`, es obligatoria una fase separada de reconciliación final, cambio controlado de fuente de verdad, actualización del frontend, pruebas de regresión, periodo de convivencia, reversión disponible, y retiro posterior de las estructuras antiguas — condición explícita impuesta para este bloque y, por simetría, ya aplicada también a `event_details` en el Bloque 3.
- **`places.area` sigue siendo texto libre sin validación** en el editor de administración — cualquier lugar nuevo o editado con una zona mal escrita quedará con `zone_id = null` hasta que se corrija el dato o se agregue un selector real contra `zones` en el editor — trabajo de una fase posterior, no de este bloque.
- **Acceso administrativo a guardados sin registro de auditoría**: la política permite el acceso pero no lo registra — ver la nota de alcance en la sección de privacidad arriba.

### Qué sigue

El Bloque 5 (privacidad) queda documentado en la sección siguiente. Sigue pendiente, sin autorizar todavía, la fase separada de "cambio de fuente de verdad" para `interactions`/`places.zone_id` y `event_details` (condición ya establecida). Ver `MASTERPLAN.md`, Fase 1.

---

## Fase 1 del ecosistema social — Bloque 5: privacidad (implementado)

Quinto y último bloque de la Fase 1. A diferencia de los Bloques 1-4 (deliberadamente invisibles), este bloque **sí** introduce comportamiento real — es su propósito explícito: activar el mecanismo de consentimiento, exportación y eliminación de datos personales cuyo registro (`consent_records`) se adelantó vacío desde el Bloque 1.

Antes de implementar se presentó un análisis previo completo (consentimiento, exportación, eliminación, modelo de datos, RLS, reversibilidad, cumplimiento LOPDP, pruebas, criterios de aceptación, deuda técnica) que investigó el esquema real y encontró dos hallazgos críticos, resueltos antes de escribir código.

### Hallazgos críticos encontrados durante el análisis previo

1. **`answers.question_id` tenía `on delete cascade` hacia `questions`.** Con el esquema previo a este bloque, borrar la cuenta de quien hizo una pregunta habría borrado también las respuestas de terceros a esa pregunta — pérdida de contenido ajeno como efecto colateral.
2. **`consent_records.user_id` tenía `on delete cascade` hacia `auth.users`.** Borrar la cuenta habría destruido también la evidencia de que hubo un consentimiento y una solicitud de eliminación bien tramitados — justo la trazabilidad que más se necesita después de una eliminación.

### Decisiones de producto aprobadas (cuatro bifurcaciones)

1. **Eliminación de cuenta**: periodo de gracia de **30 días**, cancelable — no eliminación inmediata.
2. **Contenido colaborativo** (preguntas, respuestas, estados, comentarios de eventos): se **anonimiza** el autor, nunca se borra el contenido — resuelve directamente el Hallazgo 1.
3. **`consent_records`/`data_requests`**: **nunca se destruyen** al eliminar una cuenta — se conserva el historial de consentimiento y trazabilidad, resolviendo el Hallazgo 2.
4. **Negocios sin propietaria** (variante específica, no una de las tres opciones originalmente presentadas): cuando la única dueña de un negocio elimina su cuenta sin haber transferido antes, el negocio pasa a `status = 'sin_propietario'` — no se bloquea la eliminación, no se borra el negocio. Deja de mostrarse públicamente, conserva su historial (eventos ya publicados bajo su `business_id`, etc.), y un administrador puede reasignarlo más adelante.

### `supabase/migrations/0019_bloque5_privacidad.sql` (nuevo)

- **`consent_records`**: gana `consent_key` (a qué consentimiento se refiere: `terminos_servicio`, `politica_privacidad`, `notificaciones_push`, `personalizacion_ia`) y `document_version`; el `check` de `event_type` gana `'consentimiento_retirado'` (retirar un consentimiento opcional inserta una fila nueva, nunca borra el historial — el estado vigente es la fila más reciente por `(user_id, consent_key)`); pierde su FK hacia `auth.users` (deja de tener `on delete cascade`) para sobrevivir a la eliminación de la cuenta que describe.
- **`data_requests`** (tabla nueva): flujo de trabajo de una solicitud de exportación o eliminación, deliberadamente separado del log inmutable de `consent_records` — decisión arquitectónica presentada y aprobada explícitamente en el análisis previo. Columnas: `type` (`exportacion`/`eliminacion`), `status` (`pendiente`/`en_proceso`/`completada`/`cancelada`/`rechazada`), `requested_at`, `scheduled_for`, `cancelled_at`, `processed_at`, `processed_by`. Sin FK hacia el usuario, mismo motivo que `consent_records`. Sin política de `delete` — ninguna fila se borra jamás.
- **Anonimización**: `questions.author_id`, `answers.author_id`, `statuses.author_id`, `event_comments.author_id` pasan de `not null` + `on delete cascade` a nullable + `on delete set null` — mismo precedente que ya usan `events.created_by`/`places.created_by` desde antes de esta fase.
- **Negocios sin propietaria**: `businesses.owner_id` pasa a nullable + `on delete set null`; el `check` de `status` gana `'sin_propietario'`; un trigger nuevo (`handle_orphaned_business`, `before update`) fuerza `status := 'sin_propietario'` en el mismo instante en que `owner_id` se vuelve `null` por la cascada. La política de lectura pública de `businesses` (que nunca había incluido a los administradores) se reemplaza para agregar `or public.is_admin()` — sin esto, un admin no podría ni ver un negocio `sin_propietario` para reasignarlo; se documenta como una corrección indispensable para que el requisito fuera posible, no como una ampliación de alcance gratuita. La política de actualización de admins ya existente (`0005_profile_social.sql`) cubre la reasignación de `owner_id` sin necesitar una política nueva.

### Fuera de alcance de esta migración (documentado con la misma transparencia)

- **Invalidación de sesiones activas y revocación de tokens**: no requieren ninguna migración — son una consecuencia automática de que el proceso que ejecuta la eliminación definitiva invoque `auth.admin.deleteUser` (API de administración de Supabase Auth), que internamente revoca sesiones/tokens del usuario. No existe una tabla de sesiones en este esquema sobre la que escribir SQL.
- **Invalidación de códigos QR**: no existe todavía ninguna entidad QR en el esquema — es un módulo de una fase futura (`ARCHITECTURE.md`). No hay nada que invalidar hoy. Se documenta aquí como **requisito obligatorio** para cuando esa fase se construya: el diseño de esa fase deberá incluir su propia invalidación al eliminar una cuenta.
- **Borrado del archivo binario en Supabase Storage** (avatares, fotos de estados/negocios): requiere una llamada aparte a la API de Storage, no una migración de base de datos.
- **Rectificación de datos** (principio LOPDP): la edición de perfil ya existente en la app cubre esto; no se agrega ningún mecanismo nuevo en este bloque.

### `supabase/functions/export-user-data` y `supabase/functions/process-account-deletions` (nuevos)

Mecanismo real que el Bloque 5 necesitaba activar (a diferencia de los Bloques 1-4, "solo base de datos" no era suficiente aquí). Siguen la misma convención de código que `ai-guide`/`send-push` ya existentes.

- **`export-user-data`**: el usuario autenticado la llama para obtener sus propios datos en JSON. Deriva quién es del token de su sesión (`auth.getUser()`) — **nunca acepta un `userId` de parámetro del cliente**, precisamente el principio de diseño exigido en el análisis previo para que nadie pueda exportar datos ajenos.
- **`process-account-deletions`**: pensada para invocarse periódicamente desde un disparador externo (no un usuario final) — exige un secreto compartido (`CRON_SECRET`) en un header, ya que procesa todas las solicitudes vencidas, no las de un solo usuario. Por cada `data_requests` tipo `eliminacion` con `scheduled_for` ya vencido, llama a `auth.admin.deleteUser` y marca la solicitud como `completada`; un error puntual deja la solicitud en `pendiente` para reintentarla en la siguiente ejecución en vez de perderla.

**Nota de verificación honesta**: a diferencia de toda migración SQL de este proyecto (verificada exhaustivamente contra Postgres real), estas dos funciones **no pudieron probarse contra un proyecto Supabase real** en este entorno de desarrollo — no hay un proyecto desplegado ni credenciales de servicio disponibles aquí, y la API de administración de Auth no existe en el stub local usado para verificar las migraciones. Están escritas y revisadas con cuidado, siguiendo la misma convención que `ai-guide`/`send-push`, pero requieren una verificación end-to-end contra un proyecto real antes de confiar en ellas en producción — a diferencia del resto de este bloque, que sí tiene el mismo nivel de prueba real que los Bloques 1-4.

### Principio de privacidad de la Guía IA (`AI_PHILOSOPHY.md`)

Se agregó el Principio no negociable 11 y una entrada correspondiente en "Qué nunca debe hacer": la Guía IA nunca comparte información privada entre usuarios ni usa el contenido de una conversación privada de una persona para responderle a otra — una interacción privada del ecosistema (por ejemplo, `guardado` en `interactions`) es privada también para la Guía IA, no solo para otros usuarios humanos.

### Verificación realizada (capa de base de datos)

Postgres 16 real, las 19 migraciones (`0001`-`0019`) en orden contra una base limpia, con datos de prueba reales: 3 usuarios (ana con un negocio aprobado y una pregunta; beto respondiendo esa pregunta; caro como administradora).

- **Consentimiento versionado con retiro**: se otorgó un consentimiento, se agregó una fila de retiro para otro `consent_key` — las 3 filas del historial completo se conservan intactas; el estado vigente es la más reciente por `(user_id, consent_key)`.
- **`data_requests` con roles de bajo privilegio reales**: ana ve su propia solicitud, beto no la ve (0 filas); un intento de beto de cancelar la solicitud de ana afectó 0 filas; ana canceló la suya propia con éxito.
- **Eliminación definitiva simulada de verdad**: se creó una nueva solicitud vencida, se marcó `completada`, y se borró el `auth.users` de ana (lo que haría `auth.admin.deleteUser` en producción). Resultado verificado punto por punto:
  - `profiles`/`actors` de ana: 0 filas (cascada ya existente).
  - **Negocio de ana**: `owner_id` quedó en `NULL` y `status` cambió automáticamente a `'sin_propietario'` — el trigger funcionó exactamente como se diseñó.
  - **Pregunta de ana**: sobrevivió con `author_id = NULL` (anonimizada, no borrada).
  - **Respuesta de beto** (a la pregunta de ana): sobrevivió completamente intacta, sin ningún cambio — prueba directa de que el Hallazgo 1 quedó resuelto.
  - **Evento publicado por el negocio de ana**: conservó su `business_id` (el negocio, aunque huérfano, sigue existiendo) — historial preservado.
  - **`consent_records`/`data_requests` de ana**: las 3 y 2 filas respectivamente sobrevivieron completas — prueba directa de que el Hallazgo 2 quedó resuelto.
- **RLS del negocio `sin_propietario`**: un usuario normal no lo ve (0 negocios visibles); la administradora sí lo ve (1) y pudo reasignar `owner_id`/`status` con éxito usando la política de administración ya existente, sin necesitar una política nueva.
- **Estrategia de reversión**: probada en dos escenarios distintos, con un resultado honesto y distinto en cada uno:
  - Contra una base limpia (sin ninguna eliminación real procesada todavía): reversión completa exitosa, sin errores.
  - Contra el estado que ya había procesado la eliminación real de ana: la reversión **falla exactamente donde se esperaba** (`column "author_id" of relation "questions" contains null values` al intentar restaurar `not null`) — un límite genuino e inherente de la función, no un defecto: una vez que el mecanismo anonimizó datos reales, no hay forma de "recuperar" el autor original, y restaurar las restricciones antiguas sin decidir qué hacer con esos datos ya anonimizados no es posible. Se documenta con la misma honestidad que el resto de la verificación, en vez de afirmar una reversión limpia que no sería cierta en producción.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirma que `src/` no fue tocado — los únicos cambios son la migración, las dos Edge Functions nuevas, y `AI_PHILOSOPHY.md`.

### Incidencias encontradas

Ninguna no anticipada. Los dos hallazgos críticos y la limitación de reversión post-uso-real fueron identificados y documentados con transparencia, no descubiertos como sorpresa a mitad de la implementación.

### Deuda técnica detectada

- **No existe todavía ninguna interfaz de usuario** para que una persona real otorgue/retire consentimientos, solicite una exportación, o solicite/cancele la eliminación de su cuenta desde la app — este bloque activa el mecanismo de backend (esquema + Edge Functions), no construye pantallas nuevas. Es trabajo de una fase posterior.
- **Las Edge Functions no están verificadas contra un proyecto Supabase real** (ver la nota de verificación honesta arriba) — recomendado antes de confiar en ellas en producción.
- **No hay mecanismo de disparo temporal configurado** (`pg_cron` u otro) para invocar `process-account-deletions` automáticamente cuando vence el periodo de gracia — hoy depende de que algo externo la llame.
- **Transferencia de propiedad de un negocio**: sigue sin existir ningún mecanismo de autoservicio para que una dueña transfiera su negocio antes de eliminar su cuenta — hoy, sin transferencia previa, el único camino es la reasignación manual por un administrador tras la orfandad.
- **Invalidación de códigos QR**: requisito obligatorio anotado para cuando esa fase futura se construya (ver arriba) — no aplica todavía porque la entidad no existe.
- **Rectificación de datos** (principio LOPDP): fuera de alcance de este bloque, ver nota arriba.

### Qué sigue

Con el Bloque 5 completo, la Fase 1 del ecosistema social queda terminada en su capa de base de datos. Sigue pendiente, sin autorizar todavía: la fase separada de "cambio de fuente de verdad" para `interactions`/`places.zone_id`/`event_details` (condición ya establecida en los Bloques 3 y 4), la interfaz de usuario para consentimiento/exportación/eliminación, la verificación end-to-end de las Edge Functions contra un proyecto real, y la Fase 2 del `MASTERPLAN.md`.

---

## FASE 1 CERRADA — Ecosistema social: modelo de datos fundacional (2026-07-17)

Cierre formal de la Fase 1 completa del `MASTERPLAN.md`, aprobado explícitamente tras el Bloque 5. Checkpoint de Git: tag `checkpoint-fase1-ecosistema-social`.

### Resumen ejecutivo

La Fase 1 unificó el modelo de datos fundacional del ecosistema social de Ahorita en cinco bloques independientes, cada uno propuesto, implementado, verificado contra Postgres real y aprobado por separado:

1. **Bloque 1 — Esquema fundacional**: seis tablas nuevas (`cities`, `zones`, `actors`, `interactions`, `event_details`, `consent_records`), ninguna conectada todavía a la aplicación — deliberadamente invisible.
2. **Bloque 2 — Identidad**: vincula `profiles`/`businesses` con `actors` (backfill + triggers para todo registro futuro).
3. **Bloque 3 — Contenido**: primer caso real del patrón "núcleo genérico + tabla de detalle" (`event_details`), aditivo y sin sincronización en vivo.
4. **Bloque 4 — Interacciones y territorio**: `post_likes`/`saved_places`/`saved_events`/`follows` → `interactions`; `places.area` → `places.zone_id`; privacidad de "guardado" preservada explícitamente.
5. **Bloque 5 — Privacidad**: consentimiento versionado, `data_requests`, anonimización de contenido colaborativo, negocios sin propietaria, y el mecanismo real (Edge Functions) de exportación/eliminación.

En los cinco bloques, absolutamente ninguna línea de `src/` fue tocada hasta el Bloque 5 (que sí introdujo comportamiento nuevo real, a propósito) — la aplicación en producción se comportó exactamente igual durante toda la fase, salvo por el mecanismo de privacidad que el propio Bloque 5 tenía como objetivo activar.

La Fase 1 está completa en su capa de:
- **Arquitectura** — Actor, Publicación (núcleo+detalle), Interacción, Ciudad/Zona, línea base de privacidad, todos con su justificación documentada en `ARCHITECTURE.md`.
- **Migraciones** — `0015` a `0019`, cada una diseñada, propuesta y aprobada antes de escribirse.
- **Restricciones** — `check`, `unique`, `foreign key` con el `on delete` correcto para cada relación (incluyendo las dos correcciones de cascada del Bloque 5).
- **RLS** — cada tabla y cada cambio de política probado con roles de bajo privilegio reales, nunca con el superusuario.
- **Lógica PostgreSQL** — triggers `security definer` (Bloque 2), triggers de transición de estado (`handle_orphaned_business`, Bloque 5), todos verificados con inserciones/eliminaciones reales.
- **Documentación** — `PROJECT.md`, `CHANGELOG.md`, `supabase/README.md` actualizados en cada bloque con el mismo nivel de detalle.
- **Pruebas locales** — Postgres 16 real, nunca solo revisión visual de SQL, en los cinco bloques.

### Deuda técnica obligatoria antes de producción (no es una mejora opcional)

Registrada explícitamente como **requisito de validación obligatorio**, no como una lista de "nice to have". Nada de lo siguiente se probó contra un proyecto Supabase real — todo lo demás en esta fase sí se probó contra Postgres real:

1. `export-user-data` — validar end-to-end contra un proyecto Supabase real.
2. `process-account-deletions` — validar end-to-end contra un proyecto Supabase real.
3. Autenticación con JWT real (esta fase se verificó contra un stub local de `auth.uid()`, no contra Supabase Auth real).
4. `auth.admin.deleteUser` — confirmar que produce exactamente las cascadas/anonimizaciones diseñadas contra una base de datos real de Supabase, no solo contra la simulación local (`DELETE FROM auth.users`).
5. Variables de entorno y secretos (`CRON_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) — configurar y confirmar en el proyecto real.
6. Permisos de las Edge Functions (quién puede invocarlas, verificación de que `process-account-deletions` rechaza correctamente una llamada sin el secreto correcto contra el runtime real de Supabase, no solo en el código).
7. Ejecución programada al vencer el periodo de gracia de 30 días — no existe todavía ningún disparador temporal (`pg_cron` u otro) configurado.
8. Eliminación real de archivos personales en Supabase Storage (avatares, fotos de estados/negocios) — hoy solo se anonimizan/eliminan las filas que los referencian, no el archivo binario.
9. Exportación completa de datos reales — confirmar contra datos de producción (o un entorno de staging con datos realistas), no solo los datos de prueba sintéticos usados en la verificación local.
10. Flujo extremo a extremo de solicitud, cancelación y eliminación definitiva — probado por partes contra Postgres real y con una simulación de la llamada a Auth, pero nunca como un flujo continuo real de principio a fin.

### Documentación expresa de irreversibilidad

- **Una eliminación definitiva es irreversible.** Una vez que `process-account-deletions` ejecuta `auth.admin.deleteUser` tras el periodo de gracia, no existe ningún mecanismo de restauración.
- **Después de anonimizar o borrar datos personales no existe una restauración completa.** El `author_id` de una pregunta/respuesta/estado/comentario anonimizado no puede recuperarse — se probó explícitamente en la verificación del Bloque 5 que ni siquiera revertir la migración restaura ese dato, porque nunca se guarda en ningún otro lugar.
- **La interfaz futura que construya el flujo de solicitud de eliminación debe comunicar claramente este punto al usuario** antes de que confirme la solicitud — no es responsabilidad de este bloque (que no construyó ninguna interfaz), pero queda como requisito no negociable para la fase que sí la construya.
- **Los códigos QR deberán invalidarse cuando ese módulo exista** (Fase 9 del `MASTERPLAN.md`) — no existe la entidad hoy, así que no hay nada que invalidar todavía, pero el diseño de esa fase debe incluir su propia invalidación al eliminar una cuenta, sin excepción.
- **Los archivos de Storage deberán eliminarse mediante un flujo explícito antes de producción** — borrar la fila que referencia `image_url`/`avatar_url` no borra el archivo binario en el bucket `media`; eso requiere una llamada aparte a la API de Storage, todavía no construida.

---

## Fase 2, Bloque A — Esquema de verificación y roles granulares (implementado)

Primer bloque de la Fase 2 del `MASTERPLAN.md`. Aditivo, deliberadamente invisible: no toca ninguna columna de `profiles`/`businesses`/`actors`, no modifica ninguna política RLS existente. `profiles.is_admin` y `public.is_admin()` permanecen exactamente iguales — el nuevo sistema de roles convive en paralelo, sin ser todavía la fuente de verdad de nada.

### Análisis técnico previo (resumen de las decisiones tomadas)

Antes de escribir la migración se presentó y aprobó un análisis técnico completo cubriendo: comparación de tres alternativas de modelo de roles (columna enum vs. catálogo+asignación vs. híbrido), una matriz de permisos por acción y luego por módulo (Feed, Promociones, Eventos, Lugares, Comentarios, Historias, Reels, IA, QR, Mapa, Verificaciones, Analíticas, Panel administrativo, Publicidad, Monetización, Azu Taxi), la relación de `verifications` con Actor vs. Business, el tratamiento de negocios ya aprobados, el alcance de Editor/Curador frente a Moderador, las políticas RLS previstas, la necesidad de una tabla de auditoría, y la estrategia de migración completa.

**Decisiones cerradas:**
1. **Modelo de roles**: catálogo `roles` + asignación `actor_roles` (many-to-many sobre `Actor`), no una columna enum en `profiles` — permite múltiples roles por actor y agregar un rol nuevo con un simple `INSERT`, sin migración de esquema.
2. **`verifications` se asocia a `Actor`, no a `businesses`** — para poder verificar en el futuro distintos tipos de entidad (organizador, y potencialmente una institución) sin rediseñar. Un actor tipo `sistema` nunca puede recibir un rol ni ser verificado — son ejes distintos (identidad de autoría vs. control de plataforma/confianza comercial) que no deben mezclarse.
3. **Evidencias de verificación**: nunca se guardan en la tabla — solo una referencia (`evidence_ref`) a un objeto en un bucket de Storage privado, a crear en una migración de Storage aparte (fuera de este bloque, que es solo base de datos).
4. **Auditoría**: `role_audit_log`, poblada únicamente por trigger (nunca por la aplicación), a partir de cambios en `actor_roles`.
5. **Negocios ya aprobados**: se migran como `verifications` con `origin='migracion'`, vigencia de un año desde el momento de la migración (nunca una fecha retroactiva inventada) y `status='aprobado'`.
6. **Editor/Curador y Moderador son roles distintos** — superficies de riesgo distintas (contenido editorial propio vs. contenido/cuentas de terceros); Editor explícitamente no puede modificar roles, acceder a datos privados, aprobar verificaciones, borrar usuarios, cambiar configuración crítica ni procesar eliminaciones de cuenta.
7. **No se crea un rol "Partner"/"Institución"** — se resuelve con un futuro valor de `verification_type` (p. ej. `'institucion'`, no agregado todavía, sin caso de uso aprobado) en vez de un rol nuevo, evitando inventar capacidades de plataforma no aprobadas.

**Dos aclaraciones adicionales incorporadas a `AI_PHILOSOPHY.md`** (documentación pura, sin código):
- La Guía IA distingue explícitamente **tres estados** de confianza — verificado (vigente), verificación vencida, y no verificado — nunca trata una verificación vencida igual que una vigente, y nunca asume que "no verificado" significa incorrecto o poco confiable. La verificación es una señal adicional de confianza y vigencia de los datos, nunca el criterio principal; la relevancia real siempre tiene prioridad, y la verificación solo desempata entre opciones de relevancia equivalente.
- Se documentó la visión futura de **cuentas oficiales institucionales** (Municipio de Cuenca, ETAPA, Turismo Cuenca, Universidad de Cuenca, etc.), representadas mediante el sistema de verificación y la identidad del Actor — nunca mediante privilegios administrativos adicionales. Su existencia sirve para comunicar confianza e identidad, no para otorgar permisos.

### `supabase/migrations/0020_fase2_bloqueA_verificacion_roles.sql` (nuevo)

- **`roles`**: catálogo (`key`, `label`, `description`), sin `check` enumerado sobre `key` — agregar un rol nuevo es un `INSERT`. Poblada con `administrador`, `editor`, `moderador`.
- **`actor_roles`**: `actor_id`, `role_id`, `granted_at`/`granted_by`, `revoked_at`/`revoked_by`/`revocation_reason`, `origin` (`asignacion`/`migracion`). Nunca se borra una fila — se revoca con `revoked_at`, mismo principio de auditoría inmutable que `consent_records`/`data_requests` (Bloque 5). Índice único parcial que impide asignaciones activas duplicadas sin impedir el historial de reasignaciones.
- **`verifications`**: `actor_id`, `verification_type` (`negocio`/`organizador`), `status`, `evidence_ref` (solo referencia), `requested_at`, `reviewed_by`, `decided_at`, `rejection_reason`, `revocation_reason`, `expires_at`, `renewal_of` (auto-referencial — cada renovación es una fila nueva, nunca un `UPDATE` que pierda historial), `internal_notes`, `scope`, `origin` (`revision_nueva`/`migracion`).
- **`role_audit_log`**: `actor_id`, `role_id`, `action` (`asignado`/`revocado`), `performed_by`, `performed_at`, `reason`. Sin ninguna política de insert/update/delete para usuarios — se llena únicamente por el trigger `log_role_change` (`security definer`, mismo patrón que `handle_new_profile_actor`).
- **Trigger `prevent_system_actor_assignment`**: bloquea cualquier `insert`/`update` en `actor_roles` o `verifications` cuyo `actor_id` sea de tipo `sistema`.
- **RLS crítica**: la política de `insert`/`update` de `actor_roles` exige `public.is_admin()` — cierra la escalada de privilegios en su origen, un no-admin nunca la pasa. La política de `update` de `verifications` exige `public.is_admin()` **y** que `actor_id` no pertenezca al perfil que ejecuta la operación — impide que cualquiera, incluido un administrador real, apruebe/rechace/revoque su propia verificación.
- **Backfill**: cada `profile.is_admin=true` recibe una fila en `actor_roles` con el rol `administrador` (`origin='migracion'`); cada `business.status='aprobado'` recibe una fila en `verifications` `aprobado` (`origin='migracion'`, un año de vigencia desde el momento de la migración).

### Verificación realizada

Postgres 16 real, las 20 migraciones (`0001`-`0020`, saltando `0002`) en orden contra una base limpia, con datos de prueba reales: 2 administradores, 2 usuarios normales, 1 negocio aprobado y 1 pendiente.

- **Reconciliación exacta**: 2 `profiles.is_admin=true` → 2 filas activas en `actor_roles` con rol `administrador`; 1 `business` aprobado → 1 `verifications` `aprobado`; el trigger de auditoría registró automáticamente ambas asignaciones del backfill (2 filas `asignado`) sin intervención manual.
- **Tablas existentes completamente intactas**: mismos conteos de `profiles`, `profiles.is_admin`, `businesses`, `businesses.status='aprobado'` antes y después.
- **Escalada de privilegios rechazada, con dos variantes reales**: un usuario normal intentando auto-asignarse el rol `administrador` fue rechazado por RLS; el mismo usuario intentando asignarle ese rol a *otra* persona también fue rechazado.
- **Asignación real por un admin verificada de punta a punta**: un administrador real asignó el rol `editor` a un usuario normal — la fila se creó, y el trigger de auditoría registró `asignado` con el admin correcto en `performed_by`, automáticamente.
- **Revocación con motivo verificada**: se revocó ese mismo rol con un `revocation_reason` — el trigger registró `revocado` con el motivo exacto, y la fila original de `actor_roles` **no se borró** (el historial completo de asignación+revocación queda visible).
- **Ningún actor de tipo `sistema` puede recibir un rol ni ser verificado**: se intentó asignar un rol y crear una verificación para el actor "Guía IA" — ambos intentos fueron rechazados por el trigger `prevent_system_actor_assignment`, con el mensaje de error esperado.
- **Auto-aprobación de verificación rechazada, incluso para un administrador real**: un usuario normal solicitó su propia verificación (permitido) y luego intentó auto-aprobarla (rechazado, 0 filas afectadas, la verificación siguió `pendiente`) — un administrador real la aprobó sin problema. Más crítico aún: un **administrador real** solicitó su propia verificación y también intentó auto-aprobarla — rechazado igual (0 filas afectadas) — y un *segundo* administrador sí pudo aprobarla, confirmando que la regla "nadie aprueba su propia verificación" se sostiene incluso para quien ya tiene el rol más alto del sistema.
- **`role_audit_log` visible solo para administradores**: un usuario normal vio 0 filas; un administrador vio las 4 filas reales generadas durante la verificación.
- **Estrategia de reversión ejecutada de verdad**: se revirtieron las 4 tablas nuevas, sus funciones y triggers — reversión limpia sin ningún error (a diferencia del Bloque 5, este bloque no toca ninguna restricción de tabla existente, por lo que no hay el tipo de bloqueo por integridad que se encontró ahí). Las tablas existentes quedaron con los mismos conteos exactos de antes de aplicar la migración.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirma que `src/` no fue tocado — los únicos cambios son la migración y `AI_PHILOSOPHY.md`.

### Incidencias encontradas

Ninguna no anticipada. Todas las decisiones de diseño (modelo de roles, relación Actor↔verificación, exclusión de un rol Partner) fueron resueltas en el análisis previo, no descubiertas durante la implementación.

### Deuda técnica detectada

- **Bucket de Storage privado para evidencias**: `verifications.evidence_ref` está prevista pero el bucket en sí (con sus políticas de acceso: el propio actor y quien tenga permiso de revisar evidencias) no se crea en este bloque — es una migración de Storage aparte, análoga a `0002_storage.sql`.
- **Sin interfaz de usuario todavía**: ni para solicitar verificación, ni para que un admin gestione roles/revisiones — este bloque es solo el esquema de backend.
- **`is_admin()` sigue siendo la única fuente de verdad real** en todas las políticas RLS existentes — el nuevo sistema de roles no reemplaza nada todavía. El "punto de no retorno" (cuándo el nuevo sistema pasa a ser la fuente de verdad) es una decisión de una fase posterior, con su propia propuesta y aprobación.
- **`verification_type` no incluye `'institucion'` todavía** — se documentó como visión futura (ver arriba), no se implementa hasta que exista un caso de uso aprobado.
- **Ciclo de renovación anual, avisos de vencimiento, interfaz de solicitud/revisión** — explícitamente fuera de alcance de este bloque, quedan para el Bloque B.

### Recomendaciones para el Bloque B (ciclo de vida, vigencia y renovación anual)

- Definir el mecanismo de disparo temporal para detectar verificaciones vencidas (mismo tipo de decisión pendiente que ya quedó anotada para `process-account-deletions` en el Bloque 5 de la Fase 1 — posiblemente resoluble con el mismo mecanismo cuando se elija).
- Diseñar el periodo de gracia con aviso antes de marcar una verificación como `vencida` (ya anticipado como riesgo en el `MASTERPLAN.md`, Fase 2).
- Decidir si la renovación anual requiere nueva evidencia o es solo una confirmación (el campo `renewal_of` ya está preparado para encadenar cualquiera de los dos casos sin cambios de esquema).
- Evaluar en ese momento, no antes, si conviene ya iniciar el diseño del bucket de Storage privado para evidencias, dado que el ciclo de vida completo de una verificación probablemente lo necesite antes de tener una interfaz real.

---

## Fase 2, Bloque B — Ciclo de vida, vigencia y renovación de verificaciones (implementado)

Segundo y último bloque de la Fase 2 planificado hasta ahora. Ajustes aprobados sobre el análisis técnico previo: periodo de gracia de **30 días** (coherencia con el Bloque 5, no los 15 propuestos inicialmente), y el bucket privado de evidencias **sí se construye en este bloque**, con un único archivo por solicitud (PDF/JPG/PNG) — múltiples evidencias queda documentado como fase futura, no implementado.

### Dos defectos reales encontrados y corregidos durante la implementación

Ambos se detectaron probando escenarios explícitamente pedidos, no por casualidad — y ambos se corrigieron dentro de este mismo bloque (la migración `0021` nunca llegó a commitearse con el defecto), previa parada y aprobación expresa del primero, y corrección directa del segundo por ser un bug de implementación de un requisito ya aprobado, no una bifurcación arquitectónica nueva.

**1. Pertenencia de Actor rota para negocio/organizador (defecto del Bloque A).** Las políticas de "esto es mío" en `verifications`/`actor_roles` comparaban únicamente `actors.profile_id = auth.uid()`. Funciona para un actor `persona`, pero un actor `negocio`/`organizador` **siempre** tiene `profile_id = NULL` por diseño (desde el Bloque 1) — la pertenencia real para esos actores depende de `businesses.owner_id`. Esto bloqueaba exactamente el caso de uso central de este bloque: Ana, dueña de un negocio, solicitando la verificación de **su propio negocio**. Nunca se detectó en las pruebas del Bloque A porque ahí solo se probaron verificaciones sobre actores `persona`.

  Se presentó el hallazgo, se detuvo la implementación, y se esperó aprobación explícita antes de corregir (por tratarse de una modificación a políticas ya aprobadas y enviadas del Bloque A). Corrección aprobada: función `public.actor_belongs_to_current_user(actor_id)` (`security definer`, mismo criterio que `is_admin()`), que resuelve correctamente los cuatro casos pedidos — persona vía `profile_id`; negocio/organizador vía `businesses.owner_id`; sistema nunca pertenece a nadie; negocio sin propietario no pertenece a nadie hasta reasignación. Reemplaza la comparación directa en las políticas afectadas de `verifications` (Bloque A y B) y `actor_roles` (Bloque A), sin cambiar el comportamiento para actores `persona`.

**2. Auto-aprobación posible para un admin dueño de un negocio (consecuencia del mismo defecto, más seria de lo que parecía).** La política "nunca la propia" del Bloque A también usaba la comparación rota — significaba que un administrador que **además** fuera dueño de un negocio podía aprobar la verificación de **su propio negocio**, porque el chequeo de exclusión nunca detectaba que ese actor le pertenecía. Al corregir con `actor_belongs_to_current_user`, se descubrió un segundo problema más sutil al probarlo: en PostgreSQL, las cláusulas `WITH CHECK` de **todas** las políticas permisivas de `UPDATE` se combinan con `OR`, sin importar cuál política fue la que autorizó vía `USING` — el `WITH CHECK` laxo de la política de administradores (`status <> 'vencido'`) podía "rescatar" una actualización que en realidad había entrado por la política de "el actor completa su propia solicitud", permitiendo de nuevo la auto-aprobación aunque la corrección de pertenencia ya estuviera aplicada.

  Solución: una guarda explícita e incondicional dentro del trigger `protect_verification_fields` (no solo en RLS): si quien ejecuta la operación pertenece al actor de la verificación **y** el `status` resultante es una decisión real (`aprobado`/`rechazado`/`revocado`), se aborta con una excepción — sin importar qué política haya dejado pasar el `UPDATE` a nivel de RLS. Este mecanismo no depende de la interacción entre políticas, por lo que es inmune al problema de `WITH CHECK` combinados con `OR`.

### `supabase/migrations/0021_fase2_bloqueB_ciclo_vida_verificaciones.sql` (nuevo)

- **`public.actor_belongs_to_current_user(actor_id)`**: función de pertenencia corregida (ver arriba), usada en las políticas de `verifications` (select/insert/update) y `actor_roles` (select).
- **Columnas nuevas en `verifications`**: `revoked_by`/`revoked_at` (distintas de `reviewed_by`/`decided_at`, porque una revocación es un evento posterior y potencialmente de otro admin); `snapshot_owner_id`/`snapshot_category`/`snapshot_lat`/`snapshot_lng`, pobladas automáticamente por el trigger al aprobar (primera vez o renovación) — permiten detectar en la siguiente renovación si hubo un cambio real de propietario/actividad/ubicación (modelo de renovación basado en riesgo).
- **`verifications_evidence_required`** (check): exige `evidence_ref` antes de pasar a `en_revision`/`aprobado`, exceptuando explícitamente las verificaciones `origin='migracion'` — no se les exige retroactivamente algo que el Bloque A nunca les pidió.
- **Política nueva**: el actor puede completar su propia solicitud activa (adjuntar `evidence_ref`/`scope`) mientras esté `pendiente`/`en_revision` — vacío real del Bloque A, que nunca necesitó esto porque no existía el flujo de evidencia.
- **`vencido` inalcanzable vía RLS normal**: la política de administradores se reemplaza con `with check (status <> 'vencido')` — solo el proceso automatizado (service role, que no pasa por RLS) puede marcarlo.
- **Trigger `protect_verification_fields`**: congela todo campo sensible si quien actualiza no es admin ni el proceso automatizado (deja editable solo `evidence_ref`/`scope`); congela `expires_at` incluso para un admin si no hay una transición real de `status` en el mismo `UPDATE`; contiene la guarda anti-autoaprobación descrita arriba; puebla los snapshots al aprobar.
- **`verification_status_log`**: auditoría de cada transición (`from_status`/`to_status`/`performed_by`/`reason`/`is_automated`), poblada por trigger — tabla separada de `role_audit_log` (dominios distintos).
- **`verification_notices`**: un aviso único por `(verification_id, notice_type)` — nunca se reenvía.
- **`evidence_access_log`**: quién consultó la evidencia de quién, poblada por la Edge Function que genera cada URL firmada (no puede ser un trigger, generar una URL firmada es una llamada a Storage, no SQL).

### `supabase/migrations/0022_fase2_bloqueB_storage_evidencias.sql` (nuevo)

Bucket privado `verification_evidence` (`allowed_mime_types`: PDF/JPG/PNG; `file_size_limit`: 10 MB). Ruta fija `<verification_id>/evidence.<ext>` — un único archivo por solicitud vía upsert, sin necesitar una restricción de esquema adicional. Políticas: el actor sube/reemplaza evidencia solo de su propia verificación activa (`pendiente`/`en_revision`); lectura para el propio solicitante (en cualquier estado) o un administrador — nunca Editor/Moderador, nunca público. **No pudo verificarse contra Postgres local** (depende del esquema `storage` de Supabase, igual que `0002_storage.sql`) — solo revisada por sintaxis y consistencia con el resto del esquema.

### `supabase/functions/process-verification-lifecycle` (nuevo)

Avisos (reutilizando `send-push` en vez de duplicar su lógica, con idempotencia vía la restricción única de `verification_notices`) y vencimiento automático (`aprobado` → `vencido` tras 30 días de gracia). Protegida con `CRON_SECRET`, independiente de `process-account-deletions` en código y dominio — solo puede compartir la credencial de invocación. **Misma nota de verificación honesta que las Edge Functions del Bloque 5**: no se pudo probar contra un proyecto Supabase real en este entorno.

### Verificación realizada

Postgres 16 real, las 21 migraciones aplicables en orden (`0001`-`0021`, saltando `0002` y `0022` — ambas dependen del esquema `storage`), con datos de prueba reales: Ana (dueña de un negocio aprobado), Beto (negocio pendiente), dos administradores — uno de ellos (admin1) **también dueño de un negocio**, deliberadamente, para poder probar el caso crítico.

- **Pertenencia corregida, los seis escenarios pedidos**: usuario accediendo a su actor persona (✔ true); propietario accediendo al actor de su propio negocio (✔ true); propietario intentando acceder al actor de otro negocio (✔ false); usuario normal intentando "pertenecer" a un actor de sistema (✔ false); negocio sin propietario — nadie pertenece hasta reasignación (✔ false); tras la reasignación por un admin, el nuevo dueño sí pertenece y el anterior nunca lo hizo (✔ true / ✔ false).
- **Ciclo completo real**: Ana solicita, adjunta evidencia, admin1 pasa a `en_revision` y aprueba — `snapshot_owner_id`/`snapshot_category`/`snapshot_lat`/`snapshot_lng` se poblaron automáticamente y coinciden exactamente con los datos reales del negocio en ese momento.
- **Auto-aprobación rechazada en el caso crítico real**: admin1 (administrador real) intentando aprobar la verificación de **su propio negocio** fue rechazado con una excepción explícita — un segundo admin (admin2, sin relación con ese negocio) sí pudo aprobarla.
- **`vencido` inalcanzable por RLS normal**: un admin real intentando `UPDATE ... SET status='vencido'` directamente fue rechazado por la política.
- **`expires_at` protegido**: un admin intentando cambiarlo sin una transición de estado real vio el valor revertido silenciosamente por el trigger, sin error, sin cambio efectivo.
- **Periodo de gracia de 30 días probado con dos casos reales**: una verificación vencida hace 20 días (dentro de gracia) permaneció `aprobado` tras correr la lógica de vencimiento; una vencida hace 35 días (fuera de gracia) pasó a `vencido` automáticamente — simulado con el rol de Postgres ejecutando como `service_role` (vía `auth.role()`), igual que lo haría la Edge Function real.
- **Auditoría exacta, incluyendo un tercer defecto encontrado y corregido en el camino**: la primera versión del trigger de auditoría registraba `reviewed_by` (de la aprobación original) como responsable de una revocación posterior hecha por otro admin — corregido para que cada tipo de transición registre el campo correcto (`reviewed_by` para aprobar/rechazar, `revoked_by` para revocar, `null` para vencimiento automático). Verificado de nuevo tras la corrección: la revocación por admin2 quedó auditada con `performed_by = admin2`, no con el admin que había aprobado antes.
- **`verification_notices` idempotente**: un segundo intento de insertar el mismo `(verification_id, notice_type)` fue rechazado por la restricción única; RLS verificada (el dueño ve su propio aviso, un tercero no).
- **Reversión completa ejecutada de verdad** (sobre un estado sin ningún vencimiento/decisión real de producción): las 4 tablas nuevas, la función de pertenencia, el trigger de protección, y las políticas modificadas del Bloque A se revirtieron sin ningún error; las tablas existentes (`profiles`, `businesses`, `verifications` con sus filas de prueba, `roles`, `actors`) quedaron exactamente con los mismos conteos.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirma que `src/` no fue tocado — los únicos cambios son las dos migraciones y la Edge Function nueva.

### Incidencias encontradas

Tres, todas encontradas durante la propia verificación exhaustiva (no en producción) y corregidas dentro de este mismo bloque antes de cualquier commit: (1) pertenencia de Actor rota para negocio/organizador — requirió detener la implementación y pedir aprobación explícita por modificar políticas ya aprobadas del Bloque A; (2) auto-aprobación posible vía interacción de políticas `WITH CHECK` combinadas con `OR` — corregida con una guarda de trigger incondicional; (3) auditoría de revocación atribuida al admin equivocado — corregida para usar el campo correcto según el tipo de transición.

### Deuda técnica detectada

- **Limpieza automática de evidencias vencidas** (90 días tras un estado terminal, propuesta en el análisis previo): no implementada en este bloque — no fue parte de lo explícitamente aprobado en esta ronda.
- **Edge Function no verificada contra un proyecto Supabase real** (misma limitación que las del Bloque 5) — pendiente antes de producción.
- **Sin interfaz de usuario** para solicitar verificación, adjuntar evidencia, o revisar — este bloque es solo backend (esquema + Storage + Edge Function).
- **Sin mecanismo de disparo temporal configurado** para invocar `process-verification-lifecycle` periódicamente (mismo tipo de deuda ya heredada de `process-account-deletions`).
- **Denuncia/incidencia como señal de riesgo para exigir evidencia en la renovación**: depende de un mecanismo de moderación que no existe todavía (Fase 13) — hasta entonces, esa señal específica solo puede evaluarse manualmente por un admin.

### Qué sigue

Con el Bloque B completo, la Fase 2 (Verificación robusta y roles granulares) queda terminada en su capa de backend. Sigue pendiente, sin autorizar todavía: interfaz visual de solicitud/revisión, perfiles sociales, promociones, publicaciones, QR, IA nueva, Azu Taxi, monetización, y el cambio de fuente de verdad desde `is_admin` hacia el nuevo sistema de roles. Ver `MASTERPLAN.md` para las fases siguientes.

---

## FASE 2 CERRADA — Verificación robusta y roles granulares (2026-07-18)

Cierre formal de la Fase 2 completa del `MASTERPLAN.md`, aprobado explícitamente tras el Bloque B. Checkpoint de Git: tag `checkpoint-fase2-verificacion-roles`.

### Resumen ejecutivo

La Fase 2 formalizó la verificación de negocios/organizadores como un proceso real con estados, evidencia y vigencia, y separó el rol de Administrador de roles granulares (Editor/Curador, Moderador), en dos bloques independientes:

1. **Bloque A — Esquema de verificación y roles**: catálogo `roles` + asignación `actor_roles` (many-to-many sobre Actor, no una columna enum en `profiles`); `verifications` asociada a Actor (no a `businesses`), con evidencia solo referenciada nunca almacenada; `role_audit_log`. Aditivo total — `profiles.is_admin`/`public.is_admin()` permanecen exactamente iguales, ninguna política existente se tocó.
2. **Bloque B — Ciclo de vida, vigencia y renovación**: transiciones de estado completas (pendiente/en_revisión/aprobado/rechazado/vencido/revocado), vigencia anual con 30 días de gracia, vencimiento automático (únicamente vía proceso de servicio, nunca por RLS normal), revocación con motivo obligatorio, snapshots automáticos para el modelo de renovación basado en riesgo, auditoría completa (`verification_status_log`/`verification_notices`/`evidence_access_log`), bucket privado de Storage para evidencias, y la Edge Function `process-verification-lifecycle`.

Durante el Bloque B se encontraron y corrigieron **tres defectos reales** antes de cualquier commit — el más importante, un defecto de pertenencia de Actor heredado del propio Bloque A (las políticas de "esto es mío" nunca podían ser ciertas para un actor negocio/organizador) que se detuvo, se presentó, y se corrigió solo tras aprobación explícita, por tratarse de una modificación a políticas ya enviadas. Ningún defecto llegó a producción ni a un commit sin corregir — ver el detalle completo en la sección del Bloque B más arriba.

Está completa en:
- **Arquitectura** — Actor como eje de verificación y de roles, consistente con el resto de la Fase 1.
- **Migraciones** — `0020` a `0022`, cada una propuesta y aprobada antes de escribirse (incluida la corrección de pertenencia, aprobada aparte antes de aplicarse).
- **RLS** — cada tabla y cada regla de negocio sensible (auto-aprobación, escalada de privilegios, acceso a evidencias) probada con roles de bajo privilegio reales, incluyendo el caso más exigente: un administrador real que también es dueño de un negocio, intentando decidir sobre su propia verificación.
- **Lógica PostgreSQL** — triggers de protección de campos, de auditoría automática, y de prevención de asignación a actores de sistema, todos verificados con datos reales.
- **Documentación** — `PROJECT.md`, `CHANGELOG.md`, `supabase/README.md` actualizados en cada bloque.
- **Pruebas locales** — Postgres 16 real en ambos bloques, nunca solo revisión visual de SQL.

### Deuda técnica obligatoria antes de producción (no es una mejora opcional)

Registrada explícitamente, mismo criterio que la Fase 1 — nada de lo siguiente se probó contra un proyecto Supabase real:

1. `process-verification-lifecycle` — validar end-to-end contra un proyecto Supabase real.
2. Bucket y políticas de Storage reales (`verification_evidence`) — confirmar en el proyecto real, ya que `0022` no pudo aplicarse contra Postgres local.
3. `CRON_SECRET` y variables de entorno — configurar y confirmar en el proyecto real.
4. Tarea programada de vencimiento — no existe todavía ningún disparador temporal configurado (misma deuda ya heredada de `process-account-deletions`, Fase 1 Bloque 5).
5. Generación de URLs firmadas — confirmar que el flujo real de `createSignedUrl` funciona como se diseñó contra el bucket real.
6. Flujo completo de carga y revisión de evidencias — nunca probado de punta a punta contra Storage real (solo simulado con referencias de texto en las pruebas locales).
7. Limpieza de evidencias vencidas — mecanismo documentado en el análisis previo, no implementado en este bloque.
8. Interfaz de solicitud y revisión — no existe ninguna todavía; este bloque es solo backend.
9. Regresión extremo a extremo en un entorno desplegado — todo lo anterior verificado por partes contra Postgres real y simulaciones, nunca como un flujo continuo real de principio a fin en producción o staging.

---

## Fase 3, Bloque A — Perfil unificado y administración (implementado)

Primer bloque de la Fase 3 del `MASTERPLAN.md`, reformulada en tres bloques (A: perfil unificado y administración; B: información estructurada del negocio; C: perfiles visibles y editables — "Centro del Negocio"). Aditivo sobre las Fases 1-2: no toca ninguna tabla ni política existente de `actors`/`businesses`/`profiles`/`verifications`/`actor_roles`.

### Cuatro ajustes de producto incorporados al diseño

1. **"Centro del Negocio" (visión de Bloque C)**: `actor_profile_details`/`actor_media`/`actor_search_index` cuelgan de `actor_id` — el mismo eje unificador de toda la arquitectura — precisamente para que publicaciones/promociones/historias/reels/eventos/catálogo se integren en el futuro sin rediseñar esta base.
2. **Estructura multimedia preparada**: `actor_media` (galería) además de `logo_url`/`cover_image_url` en `actor_profile_details` — la interfaz para gestionarla es Bloque C, no este bloque.
3. **Búsqueda básica**: `actor_search_index` con `tsvector` nativo de Postgres (sin motor externo), poblada por trigger desde nombre/bio/categoría — el Bloque B la extenderá para incluir el catálogo.
4. **Colecciones flexibles de catálogo**: decisión que aplica al Bloque B (`business_catalog_collections`), no a este.

### Separación deliberada: propiedad legal vs. administración operativa

`businesses.owner_id` (Bloque 5 de la Fase 1) sigue siendo el **único** propietario legal — rige la orfandad de negocios y sigue siendo, sin ningún cambio, quien puede solicitar/aprobar/rechazar/revocar verificaciones (Fase 2). Este bloque **no toca `verifications` ni sus políticas** — los administradores operativos nuevos (`actor_managers`) no obtienen ninguna capacidad sobre verificación, deliberadamente, para no reabrir superficie de riesgo ya cerrada en la Fase 2. Se verificó explícitamente que esto es cierto (ver abajo), no solo se asumió.

### `supabase/migrations/0023_fase3_bloqueA_perfil_administracion.sql` (nuevo)

- **`actor_profile_details`**: `actor_id` como llave primaria real (1:1 con cualquier actor, de cualquier tipo). Lectura pública; escritura por el dueño legal o un administrador operativo activo (`actor_editable_by_current_user`).
- **`actor_managers`**: administración operativa many-to-many, nunca se borra una fila (se revoca con `revoked_at`/`revoked_by`/`revocation_reason`, mismo principio de auditoría inmutable de toda la Fase 1/2). Un trigger (`prevent_invalid_actor_manager_target`) impide asignar administradores a actores `persona`/`sistema` — solo `negocio`/`organizador`. Solo el propietario legal o un admin de plataforma agregan/revocan — **nunca** un administrador operativo puede agregar a otro, cerrando la cadena de delegación sin control.
- **`public.actor_editable_by_current_user(actor_id)`**: compone `actor_belongs_to_current_user` (Fase 2, dueño legal) **o** una fila activa en `actor_managers` — deliberadamente no usada en ningún lugar de `verifications`.
- **`actor_media`**: galería preparada (`media_url`, `media_type`, `display_order`, `is_active`) — interfaz de carga pendiente de Bloque C.
- **`actor_search_index`**: `tsvector` con índice GIN, poblado por `refresh_actor_search_index()` desde nombre del actor + bio + categoría del negocio, con peso decreciente (`A`/`B`/`C`). Disparado automáticamente por trigger en cada cambio de `actor_profile_details.bio`.
- **Auto-creación**: un trigger en `actors` (`handle_new_actor_profile_details`) crea automáticamente la fila de `actor_profile_details` de todo actor nuevo — con `bio` sembrado desde `businesses.description` si es un actor `negocio`, replicando para actores futuros el mismo backfill que se hizo una sola vez para los existentes.
- **Backfill**: una fila de `actor_profile_details` por cada actor ya existente, con `bio` copiado de `businesses.description` para los actores `negocio` (fotografía puntual, sin sincronización posterior — mismo criterio ya usado en toda la Fase 1/2). El `INSERT` masivo dispara el trigger de búsqueda fila por fila, poblando `actor_search_index` automáticamente sin un paso aparte.

### Decisión sobre la fuente de verdad `businesses.description` vs. `actor_profile_details.bio`

Se verificó en el código real (no se asumió) que **`businesses.description` se escribe una sola vez, en `BusinessRegisterPage.jsx`, y no existe ningún editor posterior** — no hay ningún flujo de edición compitiendo con el nuevo. `actor_profile_details.bio` es la fuente de verdad desde que existe; `businesses.description` queda como campo histórico de solo lectura. El editor de perfil de negocio (Bloque C) leerá y escribirá exclusivamente `bio`. La columna antigua puede retirarse en una fase posterior, una vez confirmado que ningún código la lee ya — no en este bloque.

### Incidencia encontrada y corregida antes del commit

El trigger de auto-creación (`handle_new_actor_profile_details`), en su primera versión, creaba la fila de `actor_profile_details` sin copiar `businesses.description` — a diferencia del backfill, que sí lo hacía para los actores ya existentes en el momento de la migración. Se detectó probando la creación de un negocio **nuevo** (posterior a aplicar la migración) y viendo que su `bio` quedaba vacío en vez de heredar la descripción inicial. Corregido antes de cualquier commit: el trigger ahora replica exactamente el mismo criterio de siembra que el backfill.

### Verificación realizada

Postgres 16 real, las 23 migraciones aplicables en orden (saltando `0002` y `0022`, que dependen del esquema `storage`), con datos de prueba reales: dos negocios (Ana y Beto), un administrador de plataforma, y Carla como administradora operativa del negocio de Ana.

- **Auto-creación con siembra correcta**: los dos negocios de prueba, creados después de aplicar la migración, mostraron `bio` poblado exactamente con su `businesses.description` — confirmando la corrección de la incidencia de arriba.
- **Búsqueda básica funcionando de verdad**: `to_tsquery('spanish', 'cafe')` encontró correctamente "Cafetería La Ana"; tras editar el `bio` para incluir "repostería", una nueva búsqueda con esa palabra (con tilde) encontró el negocio — confirmando que el trigger de refresco se dispara en cada cambio, no solo en la creación. (Nota honesta: sin la extensión `unaccent`, una búsqueda sin tilde — "reposteria" — no encuentra "repostería" con tilde; documentado como limitación conocida, no como defecto, ver deuda técnica abajo.)
- **Administración operativa real**: Ana agregó a Carla como administradora de su negocio; Carla, sin ser dueña, editó exitosamente el `bio` del negocio.
- **Escalada de permisos rechazada**: Carla (administradora, no propietaria) intentando agregar a otro administrador fue rechazada por RLS.
- **Terceros ajenos bloqueados**: Beto, sin ninguna relación con el negocio de Ana, intentó editar su `bio` — `UPDATE` afectó 0 filas.
- **Revocación real con motivo**: Ana revocó a Carla con `revocation_reason` — verificado que, tras la revocación, Carla ya no pudo editar el perfil (`UPDATE` afectó 0 filas).
- **Guard de tipo de actor**: un intento de asignar un administrador operativo a un actor tipo `persona` fue rechazado explícitamente por el trigger `prevent_invalid_actor_manager_target`.
- **Admin de plataforma con visibilidad completa**: un administrador vio la lista completa de `actor_managers` de un negocio del que no es dueño ni administrador.
- **Aislamiento de la Fase 2 confirmado, no solo asumido**: se reactivó a Carla como administradora y se probó que, aun siendo administradora operativa activa, no pudo insertar en `verifications` — rechazada por RLS (no por falta de permiso de tabla, verificado otorgando el `GRANT` explícitamente antes de la prueba).
- **Reversión completa ejecutada de verdad**: las 4 tablas nuevas, sus funciones, triggers e índices se revirtieron sin ningún error; las tablas existentes (`profiles`, `businesses`, `actors`, `verifications`, `roles`) quedaron con los mismos conteos exactos de antes de aplicar la migración.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirma que `src/` no fue tocado — el único cambio es la migración nueva.

### Incidencias encontradas

Una, ya descrita arriba (siembra de `bio` faltante en el trigger de auto-creación), encontrada y corregida antes de cualquier commit.

### Deuda técnica detectada

- **Búsqueda sin normalización de tildes**: sin la extensión `unaccent` (no instalada, no solicitada), una búsqueda sin tilde no encuentra una palabra con tilde. Aceptable para "búsqueda básica sin motor complejo" tal como se aprobó; se anota como mejora posible si en el futuro se decide que la tolerancia a tildes es un requisito real.
- **Sin interfaz de usuario todavía** para gestionar perfil/galería/administradores — este bloque es solo backend; la experiencia visible es Bloque C.
- **`businesses.description` sigue existiendo** como campo histórico sin escritores activos — su retiro definitivo queda para una fase posterior, una vez confirmado que ningún código lo lee.

### Qué sigue (Bloque B, pendiente de aprobación)

Información estructurada del negocio: horarios (múltiples intervalos, turnos que cruzan medianoche, 24 horas, horarios especiales/feriados, cálculo "abierto ahora" en zona horaria de Cuenca), catálogo con colecciones flexibles definidas por cada negocio, y `businesses.zone_id`. Ver `MASTERPLAN.md`/la propuesta detallada ya presentada para el desglose completo.

## Fase 3, Bloque B — Horarios, catálogo y ubicación estructurada (implementado)

Segundo bloque de la Fase 3. Aditivo sobre las Fases 1-2 y el Bloque A: no toca ninguna tabla ni política existente. Cero cambios en `src/` — sigue siendo, como el Bloque A, exclusivamente backend.

### `supabase/migrations/0024_fase3_bloqueB_horarios_catalogo_ubicacion.sql` (nuevo)

- **`business_hours`**: horario regular por `day_of_week` (0-6, igual que `extract(dow)` de Postgres). Cada fila es exactamente uno de {cerrado, 24h, intervalo válido} — impuesto por un `check` constraint (`business_hours_shape`). Un negocio puede tener varios intervalos el mismo día (p. ej. una barbería con pausa de mediodía). Un índice parcial impide más de una fila "cerrado" o "24h" por negocio/día. Un trigger (`validate_business_hours_no_overlap`) impide intervalos superpuestos el mismo día, incluidos los que cruzan medianoche, usando una función auxiliar (`time_interval_to_ranges`) que descompone cualquier intervalo en uno o dos rangos de minutos `[0,1440)` para poder comparar con el operador `&&` de Postgres.
- **`business_special_hours`**: excepciones por fecha (feriados, cierres temporales, horario reducido/ampliado), una sola fila por `(business_id, special_date)` — un único estado por fecha, no varios intervalos, decisión deliberada de simplicidad de alcance. Tiene prioridad absoluta sobre el horario regular de ese día cuando existe.
- **`business_effective_intervals(business_id, fecha)`**: resuelve, para una fecha dada, si existe una excepción especial (y la usa, reemplazando el horario regular por completo) o si debe usarse el horario regular del día de la semana correspondiente.
- **`business_open_status(business_id, instante)`**: función central en PostgreSQL, zona horaria `America/Guayaquil`, que devuelve `is_open` / `next_open_at` / `next_close_at`. Evalúa el horario de hoy y de ayer de forma **asimétrica a propósito**: un intervalo de hoy que cruza medianoche cubre desde su apertura hasta el final del día (su tramo posterior a medianoche pertenece al cálculo de mañana, no al de hoy); un intervalo de ayer solo puede "derramarse" sobre hoy si cruzaba medianoche, y únicamente en su tramo antes de la hora de cierre. Un intervalo que no cruza medianoche nunca se hereda del día anterior. Para "próxima apertura"/"próximo cierre" recorre desde ayer (para poder capturar el cierre de un turno de ayer que cruza medianoche y todavía no ha terminado) hasta 8 días hacia adelante, generando eventos concretos y quedándose con el primero estrictamente posterior al instante consultado. Un día 24 horas no genera una transición explícita de apertura/cierre en esta primera versión (limitación conocida y documentada, no un defecto: un negocio 24h no tiene una "próxima apertura" con sentido).
- **`business_catalog_collections`** / **`business_catalog_items`**: colecciones flexibles definidas por cada negocio (sin taxonomía fija por rubro). Un ítem tiene nombre, descripción, `price_type` (`fijo`/`desde`/`variable`, con un `check` que impide precio numérico cuando es `variable`), moneda, disponibilidad (`disponible`/`agotado`/`temporada`), imagen, orden y visibilidad. Un trigger (`validate_catalog_item_collection`) impide asignar un ítem a una colección de **otro** negocio.
- **Extensión de la búsqueda del Bloque A**: `refresh_actor_search_index()` se reemplaza (`create or replace`, misma firma) para incluir también nombre y descripción de los ítems de catálogo visibles, con el mismo peso que la categoría. Un nuevo trigger (`on_catalog_item_change`) refresca el índice del actor correspondiente en cada alta/edición/baja de un ítem.
- **`businesses.zone_id`**: columna nueva, sin retirar ningún campo existente. **Hallazgo documentado, no un defecto**: a diferencia de `places.area` (texto libre que existía y se mapeó a `zones.name` en el Bloque 4 de la Fase 1), `businesses` no tiene ningún campo de texto libre de zona/área, y `zones` no tiene geometría para cruzar contra `lat`/`lng`. No existe ninguna fuente de datos confiable para backfilear esta columna hoy — se agrega la columna (aditiva) pero el backfill no actualiza ninguna fila. Es el resultado correcto y honesto, no un error: "valores no coincidentes reportados, nunca inventados", tal como se acordó.
- **Seguridad**: dos funciones auxiliares nuevas, `business_editable_by_current_user(business_id)` y `business_visible_to_current_user(business_id)`, construidas sobre `actor_editable_by_current_user` (Bloque A) para no repetir la misma subconsulta en las cuatro tablas nuevas. El propietario legal y el administrador operativo activo pueden gestionar horarios/catálogo; terceros no pueden modificar nada; un negocio no puede modificar datos de otro. "Un administrador operativo no puede delegar permisos" ya estaba garantizado por el diseño de `actor_managers` del Bloque A — este bloque no introduce ninguna vía nueva de delegación.
- **Fuente de verdad**: `businesses.hours` (texto libre existente) no se retira ni se sincroniza en este bloque. El frontend no cambia. `business_hours`/`business_special_hours` serán la fuente de verdad futura una vez que exista la interfaz del Bloque C — no se agregó ningún trigger de sincronización, según lo acordado.

### Dos incidencias reales encontradas y corregidas antes del commit

Ambas se descubrieron probando `business_open_status` con datos reales (un turno de restaurante que cruza medianoche, viernes 20:00–02:00) contra Postgres 16 real — no se detectaron con una revisión visual del SQL.

1. **Estado "abierto ahora" contaminado por el día anterior**: la primera versión evaluaba el horario de hoy y de ayer con la misma función simétrica (`time_is_within`), lo que causaba dos errores opuestos: (a) un negocio con horario normal (sin cruce de medianoche) el sábado aparecía **abierto el domingo** solo porque la hora local del domingo caía dentro del rango horario — aunque el sábado no tiene ninguna relación con el domingo; (b) un negocio con un turno que cruza medianoche el viernes (20:00–02:00) aparecía **erróneamente abierto durante la madrugada del propio viernes**, antes de que su turno siquiera empezara, porque la comparación no distinguía "el tramo de esta noche" del "tramo que pertenece a la madrugada de mañana". Corregido separando el cálculo en dos bucles explícitos y asimétricos: el de hoy solo cubre desde la apertura hasta el final del día en un cruce de medianoche; el de ayer solo puede aportar el tramo previo al cierre, y solo si esa fila de ayer efectivamente cruzaba medianoche.
2. **"Próximo cierre" no capturaba el cierre de un turno nocturno en curso**: consultando el estado a la 01:00 de la madrugada del sábado (dentro del turno viernes 20:00–02:00), la función reportaba como "próximo cierre" el del **lunes siguiente**, en vez de las 02:00 de esa misma madrugada — porque el bucle de eventos futuros empezaba en el día de hoy (sábado) y el sábado no tiene ninguna fila propia de horario; la fila responsable (la del viernes) solo se consultaba si el bucle incluía el día anterior. Corregido extendiendo el bucle de generación de eventos para incluir explícitamente el día anterior (`i` desde `-1` en vez de `0`).

Ninguna de las dos llegó a un commit sin corregir.

### Verificación realizada

Postgres 16 real, las 24 migraciones aplicables en orden (saltando `0002` y `0022`, que dependen del esquema `storage`), con datos de prueba de cinco rubros distintos (restaurante, barbería, ferretería, hotel, consultorio legal), un administrador operativo delegado y un administrador de plataforma.

- **Horario diurno normal** (restaurante, 08:00–22:00): abierto a mediodía, cerrado a las 23:00, con próxima apertura/próximo cierre correctos.
- **Dos intervalos el mismo día** (barbería, 09:00–13:00 y 15:00–19:00): abierto dentro de cada intervalo, cerrado en el hueco de mediodía, con "próxima apertura" apuntando correctamente al segundo intervalo durante el hueco.
- **Turno 20:00–02:00 (cruza medianoche)**: abierto el viernes a las 21:00; **abierto** el sábado a la 01:00 con "próximo cierre" corregido a las 02:00 de esa misma madrugada (la incidencia 2 de arriba); cerrado el sábado a las 03:00; cerrado la madrugada del propio viernes a la 01:00, antes de que el turno empezara (la incidencia 1 de arriba).
- **Negocio 24 horas** (hotel): siempre abierto, sin próxima apertura/cierre (limitación documentada, no defecto).
- **Día cerrado** (ferretería, domingo): correctamente cerrado todo el domingo (antes de la corrección, aparecía erróneamente abierto por contaminación del sábado — incidencia 1), con próxima apertura el lunes a las 08:00.
- **Feriado que anula el horario regular** (consultorio legal, excepción especial un lunes): cerrado ese lunes pese a tener horario regular de lunes a viernes; abierto con normalidad el martes siguiente, sin excepción.
- **Validaciones y triggers**: un intervalo superpuesto fue rechazado; un intervalo no superpuesto se insertó sin problema; las tres formas inválidas del `check` de horarios (cerrado con horas no nulas, apertura igual a cierre, dos filas "cerrado" el mismo día) fueron rechazadas; un ítem de catálogo apuntando a una colección de otro negocio fue rechazado; un ítem `variable` con precio numérico fue rechazado.
- **Catálogo de los 5 rubros**: platos de restaurante, cortes de barbería, herramientas de ferretería (sin colección), habitaciones de hotel con precio `variable`, y consulta legal `desde` — todos insertados y consultados correctamente.
- **Búsqueda extendida al catálogo**: una búsqueda por "mote" encontró al restaurante a través del nombre de un ítem de catálogo ("Mote pillo"); insertar un nuevo ítem ("Martillo profesional") refrescó automáticamente el índice del negocio correspondiente.
- **RLS con roles de bajo privilegio** (nunca superusuario): la dueña legal editó el horario de su propio negocio; el administrador operativo delegado editó el horario del negocio que administra; el mismo administrador, sin relación con otro negocio, no pudo modificarlo (0 filas afectadas); un tercero sin ninguna relación fue rechazado por RLS al intentar insertar horario o catálogo ajenos; un administrador operativo intentando delegar (crear otro `actor_manager`) fue rechazado, confirmando que este bloque no abre ninguna vía nueva de delegación; un usuario anónimo pudo leer horario y catálogo de un negocio aprobado; la dueña de un negocio no pudo tocar el horario de un negocio ajeno; el administrador de plataforma gestionó el horario de cualquier negocio.
- **Aislamiento de la Fase 2 reconfirmado**: el administrador operativo delegado, aun con permiso de tabla otorgado explícitamente, fue rechazado por RLS al intentar insertar en `verifications` — el Bloque B tampoco abre ninguna vía nueva hacia verificación.
- **Reversión completa ejecutada de verdad**: las 4 tablas nuevas, sus funciones, triggers e índices se revirtieron sin ningún error; `refresh_actor_search_index` se restauró a su versión del Bloque A (sin catálogo); `businesses.zone_id` se retiró; las tablas existentes (`businesses`, `actors`, `profiles`, `actor_profile_details`, `actor_managers`, `actor_search_index`, `verifications`) quedaron con los mismos conteos exactos de antes de aplicar la migración.
- **Build y lint del frontend**: sin cambios, ambos limpios; `git status` confirma que `src/` no fue tocado — el único cambio es la migración nueva.

### Incidencias encontradas

Dos, ambas descritas arriba (contaminación del estado "abierto ahora" entre días, y "próximo cierre" no capturaba un turno nocturno en curso), encontradas probando contra Postgres real y corregidas antes de cualquier commit.

### Deuda técnica detectada

- **`businesses.zone_id` sin backfill**: no existe ninguna fuente de datos confiable para poblarla hoy (ver el hallazgo documentado arriba). Queda como columna vacía hasta que exista un mecanismo confiable de asignación de zona (manual, desde el Bloque C, o geoespacial).
- **24 horas sin transición explícita**: `business_open_status` no calcula una "próxima apertura/cierre" con sentido para un negocio 24h — limitación aceptada, no un defecto, dado que no hay una transición real que reportar.
- **`businesses.hours` (texto libre) sigue existiendo** sin sincronización con `business_hours` — su retiro y la migración del frontend quedan para el Bloque C.
- **Sin interfaz de usuario todavía** para gestionar horarios/catálogo — este bloque es solo backend; la experiencia visible es Bloque C.
- Toda la deuda técnica obligatoria de la Fase 2 (validación contra un proyecto Supabase real) sigue pendiente e inalterada.

### Recomendaciones para el Bloque C ("Centro del Negocio")

1. El editor de perfil de negocio deberá gestionar `actor_profile_details` (bio/logo/portada), `actor_media` (galería), `business_hours`/`business_special_hours` (horarios) y el catálogo — cuatro superficies de datos ya preparadas por los Bloques A y B, ninguna requiere cambios de esquema para tener una interfaz.
2. El perfil público deberá leer `business_open_status()` para mostrar "abierto ahora"/"próxima apertura"/"próximo cierre" sin duplicar la lógica de horarios en el frontend.
3. La insignia de verificación debe leer en vivo de `verifications` (Fase 2), nunca duplicar el estado — reutilizar el mismo criterio vigente/en gracia/vencida/no verificada ya usado en el resto del sistema.
4. Es el momento natural para decidir si se asigna `businesses.zone_id` manualmente desde la interfaz de administración, dado que no hay backfill automático posible.
5. El botón "cómo llegar" ya existe para `places`; el Bloque C deberá decidir si el negocio reutiliza el mismo componente o requiere uno propio dado que `businesses` no comparte tabla con `places`.

Ninguna fase ni bloque siguiente se implementa hasta aprobación explícita — no se avanza automáticamente al Bloque C.
