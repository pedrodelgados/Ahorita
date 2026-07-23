# Ahorita (Cuenca Viva) — Prompt maestro

> **Ver `VISION_MAESTRA.md` primero.** Ese documento es, desde el 2026-07-21, la máxima autoridad conceptual del proyecto — identidad, misión, filosofía de producto y crecimiento. Ver luego `ARCHITECTURE.md`, la visión y arquitectura fundacional del ecosistema completo (sin código), coherente con la Visión Maestra y autoridad de producto técnica para las fases futuras. Para todo lo relacionado con la Guía IA específicamente, `AI_PHILOSOPHY.md` es la autoridad absoluta — define su filosofía, personalidad y comportamiento, y ninguna implementación futura de IA puede contradecirlo. Este archivo (`PROJECT.md`) es el registro fase por fase de lo ya implementado — se actualiza para reflejar cada fase construida, pero cuando entra en conflicto con `VISION_MAESTRA.md`, `ARCHITECTURE.md` o `AI_PHILOSOPHY.md`, este archivo es el que debe ajustarse.

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

## Fase 3, Bloque C, Entrega 1 — Perfil público unificado (implementado)

Primera entrega del Bloque C ("Centro del Negocio"), dividido en 7 entregas verificables (perfil público unificado; Centro del Negocio; edición del perfil; horarios y catálogo editables; selector personal/negocios administrados; acciones sociales y de contacto; validación visual final). Esta es la **primera vez que un bloque de la Fase 3 toca `src/`** — todo lo anterior (Bloques A y B) fue exclusivamente backend.

### Bifurcación de permisos encontrada y resuelta antes de implementar

Antes de escribir cualquier código de frontend se encontró que la insignia de verificación pública, tal como estaba especificada, era imposible de cumplir con el esquema tal cual: la política de lectura de `verifications` (Fase 2) es intencionalmente privada — solo el propio actor o un administrador pueden leerla (`evidence_ref`/`internal_notes`/`rejection_reason`/`revocation_reason` son datos sensibles). Un visitante anónimo no podía calcular la insignia en absoluto. Se presentaron tres alternativas al Product Owner (función pública estrecha; vista pública acotada; abrir la tabla completa) y se aprobó explícitamente la primera.

### `supabase/migrations/0025_fase3_bloqueC_insignia_publica.sql` (nuevo)

- **`public.actor_verification_badge(actor_id)`**: función `security definer` que devuelve únicamente uno de cuatro estados calculados — `vigente` (aprobado, dentro de vigencia), `en_gracia` (aprobado, ya vencido pero dentro del periodo de gracia de 30 días de la Fase 2), `vencida` (`status = 'vencido'`), `no_verificado` (cualquier otro caso, incluida la ausencia total de una verificación). Nunca expone una fila de `verifications` ni ningún campo sensible — la tabla en sí sigue sin ninguna política pública nueva.
- **Decisión de producto documentada** (no una bifurcación adicional, solo tratamiento visual dentro de lo ya aprobado): la insignia pública muestra "Verificado" tanto en `vigente` como en `en_gracia` (para el público, el negocio sigue siendo confiable durante la gracia; la urgencia de renovación es información para el propietario, en una fase futura) y no muestra ninguna insignia en `vencida`/`no_verificado` — consistente con AI_PHILOSOPHY.md: la verificación es una señal de desempate, nunca una acusación pública de "no confiable".

### Frontend (primera vez que la Fase 3 toca `src/`)

- **`src/lib/actorProfile.js`** (nuevo): `getPublicActorProfile(actorId)` resuelve persona o negocio a partir de `actors`, uniendo `actor_profile_details`/`profiles`/`businesses`/`zones` según corresponda; `getActorVerificationBadge`/`getBusinessOpenStatus` (envoltorios de los RPC de Postgres, sin recalcular nada en el cliente); `getActorIdForBusiness` (único punto de entrada real de esta entrega).
- **`src/lib/time.js`**: se agrega `formatCuencaTime()` — formatea siempre en `America/Guayaquil`, sin importar la zona horaria del navegador de quien mira la pantalla.
- **`src/features/profile/VerificationBadge.jsx`**, **`BusinessOpenStatus.jsx`**, **`ActorProfileHeader.jsx`** (nuevos): la misma tarjeta de identidad sirve para un actor persona o negocio — foto/portada, nombre, bio, categoría, insignia de verificación en vivo, estado abierto/cerrado + próxima apertura/cierre (leído de `business_open_status()`, nunca recalculado en el frontend), dirección + zona.
- **`src/pages/ActorProfilePage.jsx`** (nuevo) y ruta `/actor/:actorId` en `src/App.jsx`: una sola ruta unificada para cualquier tipo de actor, siguiendo el mismo eje de identidad de toda la Fase 3.
- **`src/pages/ProfilePage.jsx`**: "Mis negocios" ahora enlaza cada negocio a su perfil público nuevo — único punto de entrada real a la ruta en esta entrega (el resto de las pruebas navegó directamente por URL, ya que el descubrimiento/búsqueda de negocios no es parte del alcance de este bloque).
- Solo lectura: sin edición, catálogo, eventos asociados ni acciones sociales todavía — llegan en las entregas siguientes.

### Verificación realizada

- **Migración 0025 contra Postgres 16 real**: las 25 migraciones aplicables en orden; los 4 estados calculados correctamente con datos reales (negocios vigente/en gracia/vencido/no verificado); confirmado que un rol de bajo privilegio sin ninguna relación (incluido `anon`, sin JWT) puede llamar la función y obtener el estado correcto, pero sigue recibiendo `permission denied` al intentar leer `verifications` directamente — la superficie nueva es exactamente tan estrecha como se aprobó. Reversión completa ejecutada de verdad (conteos de `businesses`/`verifications` intactos).
- **Playwright**: 8 escenarios contra la app real (`vite dev`) con las respuestas de Supabase interceptadas y sustituidas por datos que reproducen EXACTAMENTE los estados ya verificados contra Postgres real arriba — persona visitante (sin bio real, sin insignia); negocio vigente abierto; negocio en gracia (insignia igual a vigente); negocio vencido (sin insignia); negocio no verificado (sin insignia); horario nocturno (turno que cruza medianoche, "Cierra a las 2:00 a.m." calculado correctamente); negocio cerrado con zona y próxima apertura; usuario autenticado (mismo contenido que el visitante, ya que esta entrega no tiene todavía ninguna vista diferenciada por rol). Los 8 escenarios pasaron, con capturas de pantalla generadas para cada uno.
- **Regresión**: Feed (`/`), Explorar (`/explorar`) y Perfil (`/perfil`) cargan sin ninguna excepción de JavaScript no controlada tras los cambios.
- **Build y lint**: ambos limpios, sin advertencias nuevas.

### Limitación honesta del entorno (documentada, no un defecto)

Este sandbox no tiene un proyecto Supabase real ni Docker funcional (`supabase start` requiere contenedores; el daemon de Docker no está disponible aquí) ni acceso a GitHub Releases (bloqueado por la política de salida) para instalar PostgREST/GoTrue de forma independiente. Por lo tanto, el Playwright de esta entrega valida el **renderizado y la lógica real del frontend** contra respuestas de red interceptadas que reproducen fielmente los datos ya verificados en Postgres real — no valida un flujo end-to-end contra Auth + PostgREST + RLS en vivo. La corrección de las políticas RLS y de las funciones de Postgres sí se verificó de forma completamente real, como en todos los bloques anteriores. Se agrega como deuda técnica obligatoria (junto con la ya existente de Fases 1-2): validar esta entrega end-to-end contra un proyecto Supabase real antes de producción.

### Deuda técnica detectada

- **Sin prueba end-to-end contra Supabase real** (ver limitación de entorno arriba) — se suma a la deuda ya documentada de las Fases 1-2.
- **`actor_profile_details.logo_url`/`cover_image_url` vacíos para todo negocio existente** — el header usa `businesses.image_url` como respaldo visual mientras no exista la edición (Entrega 3); es un respaldo deliberado con datos reales existentes, no un placeholder inventado.
- **Sin descubrimiento/búsqueda de negocios todavía** — el único punto de entrada real a `/actor/:actorId` en esta entrega es "Mis negocios" en el perfil propio; la búsqueda (`actor_search_index`, Fase 3 Bloque A/B) no está conectada a ninguna pantalla todavía.
- **`follows` no admite seguir un negocio** (solo personas, ver `lib/follows.js`) — relevante para la Entrega 6 (acciones sociales).

### Qué sigue (Entrega 2, pendiente de aprobación)

Centro del Negocio: catálogo por colecciones y eventos/contenido asociado, todavía de solo lectura. No se avanza automáticamente — a la espera de aprobación explícita.

## Fase 3, Bloque C, Entrega 2 — Centro del Negocio (implementado)

Antes de programar esta entrega se pidió y se aprobó explícitamente una **propuesta completa de diseño funcional y visual** (jerarquía, prioridad de acciones, organización de catálogo/eventos/promociones/historias/reels/publicaciones, estrategia contra espacios vacíos, adaptabilidad por rubro, inventario de componentes, preparación para integraciones futuras) — ver el artefacto de diseño presentado y aprobado antes de esta implementación. Esta entrega implementa exactamente lo que esa propuesta marcó como "Entrega 2": actividad real, acciones, catálogo, eventos, galería, tarjeta de la Guía IA y "Acerca de". Historias destacadas, reels/publicaciones, promociones y "negocios similares" quedan como secciones **no implementadas todavía** (no hay tabla ni dato real que las respalde) — consistente con la regla de esta misma entrega de no dibujar nunca una sección sin contenido real.

### Bifurcación identificada y resuelta sin bloquear la entrega

El botón "Seguir" del mockup aprobado no tenía dónde escribir: `follows` (tabla existente) solo admite como objetivo a una persona (`followed_id` referencia `auth.users`), nunca a un negocio. En vez de modificar esa tabla o su RLS, se usó `interactions` (Fase 1, Bloque 4) — genérica por diseño (`actor_id`/`type`/`target_type`/`target_id`), con su propia RLS ya probada entonces, pero que hasta ahora ningún flujo del frontend escribía todavía. No fue necesaria ninguna migración: es la primera vez que el frontend usa esta tabla para lo que fue diseñada. `follows`/`saved_places` y las pantallas que ya los usan (persona/lugares) quedan completamente intactos.

### Frontend

- **`src/lib/interactions.js`** (nuevo): contadores y `toggle` de seguir/guardar para cualquier actor vía `interactions`.
- **`src/lib/catalog.js`** (nuevo): catálogo agrupado por colección; los ítems sin colección se agrupan bajo "Catálogo" en vez de perderse.
- **`src/lib/businessHours.js`** (nuevo): horario semanal en texto, agrupando días consecutivos con el mismo horario (p. ej. "Lun–Jue 08:00–22:00 · Vie 20:00–02:00 · Sáb 08:00–22:00 · Dom Cerrado") en vez de repetir siete líneas iguales.
- **`src/lib/events.js`**: `listBusinessEvents(businessId)` — reutiliza la RLS pública ya existente de `events`.
- **`src/lib/actorProfile.js`**: `listActorMedia(actorId)` para la galería.
- **`src/features/profile/{ActivityStrip,ActionBar,CatalogSection,EventsShelf,GallerySection,AboutSection,GuideTeaser}.jsx`** (nuevos): cada uno se auto-consulta y **no se monta si no tiene datos reales** — es la implementación literal de la regla "ninguna sección se dibuja sin contenido real" de la propuesta aprobada.
- **`src/features/profile/ActorProfileHeader.jsx`**: el respaldo sin foto ahora se tiñe del color de categoría del negocio (antes un color plano) — ajuste visual explícito de la propuesta aprobada; se retiró el estado abierto/cerrado y la dirección de este componente (ahora viven en `ActivityStrip`/`AboutSection`, evitando repetir el mismo dato dos veces en la pantalla).
- **`src/pages/ActorProfilePage.jsx`**: compone todo lo anterior exclusivamente para actores negocio; el perfil de persona queda igual que en la Entrega 1.
- Botones de contacto (llamar/WhatsApp/cómo llegar) solo aparecen cuando el negocio tiene ese dato real — nunca un botón que no lleva a ningún lado.
- "Seguir"/"Guardar" son visibles siempre, incluso para un visitante — al tocar, si no hay sesión, se pide iniciar sesión (mismo patrón que ya usa `FeedCard`), en vez de ocultar el botón por completo.
- La tarjeta de la Guía IA abre el mismo chat genérico de `PlaceSheet` — todavía **sin contexto del negocio** (eso es Fase 7); la copia no promete algo que el sistema no hace todavía.

### Verificación realizada

- **Build y lint**: limpios, sin advertencias nuevas.
- **Playwright** (mismo enfoque de red interceptada que la Entrega 1, con datos que reproducen fielmente el catálogo/horario/eventos/galería ya verificados contra Postgres real en los Bloques A y B): negocio completo (dos colecciones de catálogo con precios `fijo`/`desde` y un ítem `agotado`, un evento, dos fotos de galería, 128 guardados/342 seguidores reales, horario agrupado correctamente, sin repetir la dirección entre la identidad y "Acerca de"); negocio disperso (sin catálogo/eventos/galería/horario — ninguna de esas secciones se dibuja, pero actividad/acciones/Acerca de/Guía IA sí, con 0 guardados/0 seguidores mostrados honestamente); visitante sin sesión tocando "Seguir" es redirigido a `/login` en vez de fallar en silencio.
- **Regresión**: Feed, Explorar y Perfil siguen cargando sin excepciones de JavaScript.

### Limitación de entorno (misma que la Entrega 1, ver arriba)

Sin Docker ni un proyecto Supabase real disponibles en este sandbox, el Playwright de esta entrega también valida el frontend contra red interceptada, no un flujo end-to-end contra Auth+PostgREST+RLS en vivo. Adicionalmente, **no fue posible simular una sesión autenticada real de supabase-js** (requeriría reproducir el formato interno de `localStorage` de GoTrue) — el flujo de "seguir/guardar ya autenticado" se verificó revisando el código contra la RLS de `interactions` ya probada en la Fase 1 Bloque 4, no con un Playwright de extremo a extremo. Se documenta como parte de la misma deuda técnica obligatoria.

### Deuda técnica detectada

- Toda la de la Entrega 1 (sin cambios).
- **Sin prueba Playwright de "seguir/guardar" con sesión autenticada real** (ver limitación de entorno arriba).
- **Historias, reels/publicaciones, promociones y "negocios similares"** no implementados — no hay tabla ni dato real que los respalde todavía; quedan reservados a nivel de diseño (ver la propuesta aprobada), no de código.
- **Horario semanal sin manejo de horarios especiales/feriados en "Acerca de"**: `getBusinessWeekHoursText` lee solo `business_hours` (horario regular); no incorpora `business_special_hours` en el texto semanal — el estado "abierto ahora" (`ActivityStrip`) sí las considera correctamente porque usa `business_open_status()` de Postgres.

### Qué sigue (Entrega 3, pendiente de aprobación)

Edición del perfil: bio/logo/portada para propietario y administrador operativo. No se avanza automáticamente — a la espera de aprobación explícita.

## Fase 3, Bloque C, Entrega 3 — Edición del perfil (implementado)

Ni una sola migración nueva: toda la seguridad requerida (propietario legal o administrador operativo activo, terceros bloqueados) ya existía desde el Bloque A (`actor_editable_by_current_user`, políticas de `actor_profile_details`/`actor_media`) — esta entrega es la primera vez que el frontend la usa para escribir.

### Frontend

- **`src/lib/uploadValidation.js`** (nuevo): `validateImageFile()` — tipo (`jpeg`/`png`/`webp`) y tamaño (máximo 5 MB, decisión de producto). Se usa tanto en `MediaUploader` como en `GalleryEditor`.
- **`src/lib/actorMedia.js`** (nuevo): alta/baja/reordenamiento de `actor_media`. `MAX_GALLERY_ITEMS = 12` — una galería curada, no un álbum sin fin (decisión de producto, sin límite en la base de datos).
- **`src/lib/actorProfile.js`**: `canEditActor(actorId)` (envuelve el RPC `actor_editable_by_current_user` del Bloque A) y `updateActorProfileDetails(actorId, patch)`.
- **`src/components/ui/MediaUploader.jsx`**: dos props nuevas y opcionales, `aspectRatio` (por defecto `"16 / 9"`, sin cambiar el comportamiento donde ya se usa) y `round`; ahora valida tipo/tamaño antes de subir. Los usos existentes (editor de lugares/eventos) siguen intactos.
- **`src/features/profile/GalleryEditor.jsx`** (nuevo): cuadrícula de hasta 12 fotos con reordenamiento por flechas (sin arrastrar y soltar, para no sumar una dependencia nueva), eliminación y contador `n/12`. **Cada acción se guarda de inmediato** (a diferencia de logo/portada/bio) — no tiene sentido "deshacer" una foto ya subida esperando un guardado global, igual que cualquier gestor de fotos real.
- **`src/pages/ActorEditPage.jsx`** (nuevo) + ruta `/actor/:actorId/editar`: logo (1:1), portada (21:9), bio y galería, con el mismo patrón ya usado en los editores admin de lugares/eventos — snapshot/`dirty`, `SaveStatusPill` (guardando/guardado/error), `ConfirmationModal` al salir con cambios sin guardar (`useUnsavedChangesGuard`), vista previa reutilizando el propio `ActorProfileHeader` con el estado del formulario todavía no guardado.
- **`src/pages/ActorProfilePage.jsx`**: ícono de lápiz en el encabezado, visible únicamente cuando `canEditActor()` devuelve `true` para quien mira — el punto de entrada real al editor.
- Horarios y catálogo **no se tocan** — quedan para la Entrega 4, tal como se pidió explícitamente.

### Verificación realizada

- **Build y lint**: limpios, sin advertencias nuevas.
- **Playwright** (misma red interceptada de las entregas anteriores, pero esta vez **con una sesión autenticada real de supabase-js simulada** en `localStorage` bajo la clave `sb-127-auth-token` — la que supabase-js deriva del host de `VITE_SUPABASE_URL` — para poder probar el editor detrás de `RequireAuth`, no solo la función RPC en aislado):
  - Tercero ajeno (`actor_editable_by_current_user` responde `false`): pantalla "No tienes permiso para editar este perfil", sin ningún campo de edición.
  - Propietario/administrador operativo (`true`): editor completo — logo, portada, biografía, galería y vista previa, los cinco visibles.
  - Edición de biografía → aparece "Cambios sin guardar" → "Guardar cambios" envía el `PATCH` correcto a `actor_profile_details` → aparece "Guardado".
  - Cambios sin guardar + botón "Volver" → modal de confirmación ("Cambios sin guardar" / "Seguir editando").
  - Subir un PDF como logo → "Formato no admitido", sin llamar a Storage.
  - Subir una imagen de 6 MB → "Máximo 5 MB", sin llamar a Storage.
  - Subir un logo válido (200 KB, JPEG) → sin errores, "Cambios sin guardar" activado.
  - Galería: agregar una foto (contador pasa de `0/12` a `1/12`) y eliminarla (vuelve a `0/12`).
- **Regresión**: Feed, Explorar y Perfil siguen cargando sin excepciones; los perfiles públicos de la Entrega 1/2 no cambiaron su comportamiento.

### Limitación de entorno

Misma de las entregas anteriores (sin Docker/Supabase real). A diferencia de la Entrega 2, aquí sí fue posible simular una sesión autenticada real de supabase-js (ver arriba), lo que permitió probar el editor de extremo a extremo contra la red interceptada — pero sigue sin ser un flujo contra Auth+PostgREST+RLS realmente desplegados. La distinción real entre "propietario legal" y "administrador operativo" (dos condiciones distintas que ambas hacen que `actor_editable_by_current_user` devuelva `true`) ya se probó a nivel de Postgres en el Bloque A; esta entrega prueba que el frontend respeta correctamente lo que el RPC responde, no vuelve a probar la lógica SQL en sí.

### Deuda técnica detectada

- Toda la de las Entregas 1-2 (sin cambios).
- **Gestión de archivos huérfanos en Storage — deuda técnica OBLIGATORIA antes de producción** (registrada explícitamente como tal, no una mejora opcional): los objetos de Storage nunca se eliminan al reemplazar o eliminar una foto (logo/portada/galería) — mismo comportamiento ya existente en el editor de lugares/eventos desde antes de la Fase 3 (el bucket `media` no tiene política de `DELETE`/`UPDATE`, solo lectura pública e inserción). No se corrige de forma aislada dentro de esta entrega — antes de producción debe existir un mecanismo seguro que:
  1. elimine el objeto anterior al reemplazar una imagen;
  2. elimine el objeto de Storage al borrar una imagen;
  3. confirme que el archivo pertenece realmente al actor que solicita eliminarlo;
  4. evite borrar archivos todavía referenciados desde otra parte de la aplicación;
  5. registre fallos de eliminación;
  6. permita limpieza periódica de objetos sin referencia;
  7. respete los procesos de eliminación de cuenta y privacidad (Fase 1, Bloque 5).
  Ver también `ROADMAP.md`.
- **Sin editor de horarios ni catálogo** — a propósito, quedan para la Entrega 4.

### Qué sigue (Entrega 4, pendiente de aprobación)

Horarios y catálogo visibles/editables. No se avanza automáticamente — a la espera de aprobación explícita.

## Fase 3, Bloque C, Entrega 4 — Edición de horarios y catálogo (implementado)

### Hallazgo encontrado y resuelto antes de implementar

`business_catalog_collections` no tenía forma de "ocultar" una colección — a diferencia de `business_catalog_items`, que sí tiene `is_visible` desde el Bloque B. Se presentó y se aprobó explícitamente agregar la misma columna, con el mismo patrón de política pública ya usado en los ítems. Fuera de esto, ningún otro campo pedido en esta entrega requirió cambios de esquema — horarios regulares, horarios especiales y el resto de los campos del catálogo ya existían completos desde el Bloque B.

### `supabase/migrations/0026_fase3_bloqueC_ocultar_coleccion.sql` (nuevo)

`business_catalog_collections.is_visible boolean not null default true` + política de lectura pública ajustada al mismo patrón de `business_catalog_items` (`(is_visible and business_visible_to_current_user(...)) or business_editable_by_current_user(...)`).

### Corrección encontrada en el propio `lib/catalog.js` (Entrega 2) durante esta entrega

`listBusinessCatalog` (la función que alimenta el perfil público, `CatalogSection.jsx`) no filtraba las colecciones por `is_visible` — solo los ítems. Antes de que existiera la columna esto no importaba (no había nada que ocultar), pero con `is_visible` ya agregado, un propietario visitando su propio perfil público vería sus colecciones ocultas (porque RLS le permite leer todo, al ser el editor). Se corrigió agregando el mismo filtro que ya tenían los ítems — el perfil público debe mostrar siempre lo mismo a cualquiera, sin importar quién lo mire.

### Frontend

- **`src/lib/businessHours.js`**: `listBusinessHoursRaw`, `replaceBusinessHours` (reemplazo completo: borra todas las filas del negocio e inserta el nuevo conjunto — más simple y seguro que calcular una diferencia fila por fila, ya que el editor siempre trabaja con la semana completa), `findOverlappingIntervals` (validación previa en el cliente, mismo criterio exacto que el trigger de Postgres — descompone un turno que cruza medianoche en dos rangos de minutos), `listBusinessSpecialHours`/`addBusinessSpecialHours`/`deleteBusinessSpecialHours`.
- **`src/lib/catalog.js`**: `listCollectionsForEditor`/`listItemsForEditor` (a diferencia de la vista pública, incluyen lo oculto), CRUD completo de colecciones e ítems, `moveItemsOutOfCollection` (mueve explícitamente antes de borrar — la decisión que se le pide al usuario, no un efecto secundario silencioso del `on delete set null`), `swapCollectionOrder`/`swapItemOrder`.
- **`src/features/profile/HoursEditor.jsx`**: los 7 días de la semana, cada uno cerrado/24 horas/con intervalos; múltiples intervalos por día; turnos que terminan después de medianoche (el mismo intervalo `20:00–02:00` que ya sabía calcular Postgres desde el Bloque B); validación de solapamiento antes de guardar. **Guardado propio** (staged, con su propio botón "Guardar horario" y su propio `SaveStatusPill`) — deliberadamente distinto del guardado de logo/portada/bio, porque el horario se edita como una semana completa a la vez; su estado "sin guardar" se reporta hacia `ActorEditPage` para que la protección de salida del editor completo también lo cubra.
- **`src/features/profile/SpecialHoursEditor.jsx`**: excepciones por fecha (feriados, cierres, aperturas extraordinarias) — alta/baja inmediatas, igual que la galería, no staged.
- **`src/features/profile/CatalogEditor.jsx`** + **`CatalogItemSheet.jsx`**: colecciones (crear/renombrar/reordenar/ocultar/eliminar) e ítems (nombre/descripción/imagen/colección/precio fijo-desde-variable/moneda/disponibilidad/visible-oculto), cada acción inmediata. Eliminar una colección con elementos **pide una decisión explícita** (mover los elementos a "Sin colección" y eliminar, o cancelar) en vez de dejar que el `on delete set null` de la base de datos lo resuelva en silencio.
- **Vista previa de "abierto ahora"**: se muestra el estado ya guardado (`business_open_status()`, reutilizado de la Entrega 2) sobre el editor de horarios — se actualiza justo después de cada "Guardar horario", no tecla por tecla, para no duplicar la lógica de zona horaria/turnos nocturnos de Postgres en JavaScript.
- **Terminología deliberadamente genérica**: "Catálogo", "Colecciones" y "Elementos" en toda la interfaz — nunca "menú" ni "productos" — para que la misma pantalla sirva sin cambios a un restaurante, una barbería, una ferretería, un hotel, un gimnasio o un servicio profesional.
- **`ActorEditPage.jsx`**: agrega las secciones "Horarios" y "Catálogo" (exclusivas de actores negocio) entre la galería y la vista previa.

### Verificación realizada

- **Migración 0026 y las nuevas RLS contra Postgres 16 real**: las 26 migraciones aplicables en orden. Escenarios probados con roles de bajo privilegio (nunca superusuario):
  - Ana (propietaria) reemplaza su horario regular (lunes diurno, viernes nocturno, domingo cerrado) — funciona.
  - Beto (administrador operativo **activo** de ese negocio) agrega un intervalo — funciona.
  - Beto intenta un intervalo superpuesto al de Ana — **rechazado por el trigger** (`El intervalo se superpone...`).
  - Carla (tercero que nunca fue administradora) no puede insertar ni actualizar el horario de Ana — rechazada por RLS.
  - Beto, ahora **revocado** como administrador de un segundo negocio (la ferretería), ya no puede tocar su horario — rechazado por RLS.
  - El administrador de plataforma (`is_admin`) sí puede gestionar el horario de cualquier negocio.
  - Mismos cinco roles/escenarios repetidos para `business_special_hours` y `business_catalog_collections`/`business_catalog_items` (crear/ocultar/eliminar con reasignación de ítems) — mismo resultado en cada caso.
  - Reversión completa ejecutada de verdad: columna y política revertidas, conteos de filas existentes intactos.
- **Playwright** (misma red interceptada de las entregas anteriores, con sesión autenticada real de supabase-js simulada, más handlers con estado en memoria para que crear/ocultar/eliminar se reflejen dentro del propio test):
  - Horario diurno + varios intervalos + turno nocturno + 24 horas + día cerrado, guardado correctamente, vista previa "Abierto ahora" visible.
  - Dos intervalos idénticos en el mismo día → rechazados con el mensaje "hay dos intervalos que se superponen" **antes** de intentar guardar (sin llamar a la red).
  - Horario especial: agregar un feriado y eliminarlo.
  - Catálogo vacío → mensaje honesto ("Todavía no tienes ninguna colección"); crear una colección; agregar un ítem con precio "Desde $18.00"; ocultar la colección.
  - Ítem con precio `variable` (muestra "Consultar", nunca un número inventado) y disponibilidad `agotado`.
  - Eliminar una colección con un elemento → modal de decisión explícita (mover a "Sin colección" y eliminar, o cancelar); tras confirmar, el ítem aparece bajo "Sin colección" y la colección desaparece.
  - Tercero bloqueado: ni horarios ni catálogo aparecen en la pantalla de permiso denegado.
- **Regresión**: las cuatro Playwright completas de las Entregas 1, 2 y 3 se volvieron a correr después de esta entrega — los ocho escenarios de la Entrega 1, los tres de la Entrega 2 y los ocho de la Entrega 3 siguen pasando; Feed/Explorar/Perfil sin excepciones.
- **Build y lint**: limpios, sin advertencias nuevas.

### Incidencias encontradas

Una, descrita arriba (`listBusinessCatalog` de la Entrega 2 no filtraba colecciones ocultas) — encontrada al implementar `is_visible` en esta entrega, corregida antes de cualquier commit.

### Deuda técnica detectada

- Toda la de las Entregas 1-3 (sin cambios) — incluida la gestión de archivos huérfanos en Storage, registrada como obligatoria antes de producción.
- **`replaceBusinessHours` no es atómico**: borra y luego inserta en dos llamadas REST separadas (Supabase no ofrece transacciones multi-sentencia desde el cliente). Una falla de red entre ambas dejaría el negocio temporalmente sin horario regular. Riesgo bajo (ventana muy corta, recuperable reintentando) pero documentado — una función `RPC` transaccional en Postgres sería la solución definitiva, no implementada en esta entrega para no ampliar el alcance de la migración ya aprobada.
- **Horario semanal de "Acerca de" (Entrega 2) sigue sin mostrar horarios especiales** — limitación ya documentada en la Entrega 2, no tocada aquí.

### Qué sigue (Entrega 5, pendiente de aprobación)

Selector entre perfil personal y negocios administrados. No se avanza automáticamente — a la espera de aprobación explícita.

## Fase 3, Bloque C, Entrega 5 — Selector de perfil unificado (implementado)

A partir de esta entrega cambia la metodología para el resto del proyecto (decisión explícita del usuario, aplicable a todas las fases restantes): antes de escribir código de cualquier entrega nueva se presenta primero un análisis de 18 puntos revisado simultáneamente como arquitecto de software, ingeniero senior, diseñador UX/UI, product designer y auditor técnico, cuestionando activamente si el diseño previo puede mejorarse — no solo confirmando que la funcionalidad pedida es implementable. Ver el análisis completo de esta entrega en el artefacto publicado antes de esta implementación.

### Bifurcación identificada y resuelta con aprobación explícita

El encargo original describía un "selector" para elegir entre el perfil personal y los negocios administrados. Construirlo literalmente sobre `ProfilePage.jsx` (la pantalla heredada de la Fase 1, con una estética de panel distinta a la del sistema editorial construido en las Entregas 1-4 del Bloque C) habría perpetuado una inconsistencia visual real: dos "perfiles" con dos lenguajes de diseño distintos en la misma app. Se presentaron dos opciones — (A) agregar el selector sobre `ProfilePage.jsx` sin tocar su estructura, o (B) unificar el perfil personal al mismo sistema que ya usa cualquier negocio (`/actor/:actorId`), retirando `ProfilePage.jsx` — junto con una sub-pregunta sobre si mover cuenta/intereses/guardados/notificaciones/cerrar sesión a una nueva ruta `/ajustes`. El usuario aprobó explícitamente la **Opción B** y `/ajustes`.

### Frontend

- **`src/hooks/useMyActorId.js`** (nuevo): resuelve y cachea el `actor_id` tipo persona del usuario autenticado (`actors` donde `profile_id = auth.uid()`) — punto único que necesitan tanto `BottomNav` como el selector para saber "cuál es mi propio perfil".
- **`src/lib/actorProfile.js`**: `listMyManagedActors(profileId)` — combina los negocios que el usuario posee legalmente (`businesses.owner_id`) con los que administra de forma operativa y activa (`actor_managers`, sin `revoked_at`), deduplicados por `actor_id` (la propiedad legal tiene precedencia si coincidieran), cada uno etiquetado `propietario` o `administrador`. Dos consultas con embeds de PostgREST (`businesses!inner(...)` y `actors!inner(...)`), sin ninguna migración nueva — toda la seguridad y las tablas ya existían desde el Bloque A.
- **`src/features/profile/ProfileSwitcherSheet.jsx`** (nuevo): hoja deslizable con "Tú" (marca activa si corresponde), un renglón por cada negocio propio/administrado (foto o respaldo teñido por categoría, nombre, rol) y "Registrar un negocio" siempre visible al final.
- **`src/pages/ActorProfilePage.jsx`**: agrega dos íconos condicionales en el encabezado — el selector (visible en mi propio perfil o en cualquier negocio que pueda editar) y el engranaje de ajustes (visible únicamente en mi propio perfil de persona). El lápiz de edición (Entrega 3) no cambia.
- **`src/pages/SettingsPage.jsx`** (nuevo, reemplaza a `ProfilePage.jsx`): cuenta (usuario/correo), intereses, lugares guardados, notificaciones push, panel de administración, cerrar sesión — todo lo que en `ProfilePage.jsx` NO era "el perfil en sí". La sección "Mis negocios" **no se traslada aquí**: queda completamente reemplazada por el selector, accesible directamente desde el perfil unificado.
- **`src/pages/MyProfileRedirectPage.jsx`** (nuevo): `/perfil` deja de ser una pantalla propia pero se conserva como punto de entrada estable — resuelve `useMyActorId()` y redirige a `/actor/:miActorId`. Evita tener que actualizar los enlaces ya existentes hacia `/perfil` (`BusinessRegisterPage`, `AdminPage`).
- **`src/components/layout/BottomNav.jsx`**: la pestaña "Perfil" ya no es una ruta fija — apunta a `/actor/:miActorId` una vez resuelto (con `/perfil` como respaldo mientras se resuelve o sin sesión, cubierto por `RequireAuth`). El estado activo se calcula a mano comparando `location.pathname`, porque el destino de `NavLink` ahora es dinámico.
- **`src/pages/ProfilePage.jsx`** — eliminado. Ninguna otra pantalla lo importaba.
- **`src/App.jsx`**: nueva ruta `/ajustes` (`RequireAuth` + `MainLayout`); `/perfil` pasa a `MyProfileRedirectPage` (sin `MainLayout`, ya que solo redirige).

### Verificación realizada

- **Build y lint**: limpios, sin advertencias nuevas.
- **Playwright** (misma red interceptada de las entregas anteriores, con sesión autenticada real de supabase-js simulada): pestaña "Perfil" de `BottomNav` apunta a `/actor/:miActorId` y aparecen el selector y el engranaje de ajustes en mi propio perfil, sin el lápiz; el selector abierto muestra "Tú" (activo), un negocio propio ("Propietario"), un negocio administrado ("Administrador operativo") y "Registrar un negocio"; tocar el negocio administrado navega a su perfil; un negocio propio (visto como su editor, no como mi persona) muestra lápiz y selector pero no el engranaje; el negocio de un tercero sin relación no muestra ninguno de los tres íconos; `/perfil` autenticado redirige a `/actor/:miActorId`; `/ajustes` muestra usuario/intereses/guardados/cerrar sesión y **no** muestra "Mis negocios".
- **Regresión**: las cuatro Playwright completas de las Entregas 1-4 (8 + 3 + 8 + 7 = 26 escenarios) se volvieron a correr después de esta entrega — todos siguen pasando sin cambios.

### Limitación de entorno

Misma de las entregas anteriores (sin Docker/Supabase real). No hubo migración nueva en esta entrega — toda la seguridad reutilizada (`actor_belongs_to_current_user`, `actor_managers`) ya se verificó contra Postgres real en el Bloque A; esta entrega solo prueba que el frontend arma correctamente las dos consultas de `listMyManagedActors` y las presenta bien, no vuelve a probar la lógica SQL en sí.

### Deuda técnica detectada

- Toda la de las Entregas 1-4 (sin cambios) — incluida la gestión de archivos huérfanos en Storage, registrada como obligatoria antes de producción.
- **Sin interfaz para gestionar `actor_managers`** (invitar/revocar administradores operativos): el selector muestra los negocios ya administrados, pero no hay todavía ninguna pantalla para agregar o quitar un administrador — queda para un bloque dedicado futuro (ver el análisis de la Entrega 5, sección 12).

### Qué sigue (Entrega 6, pendiente de aprobación y de su propio análisis de 18 puntos)

A definir junto con el usuario. No se avanza automáticamente — a la espera de aprobación explícita.

## Fase 3, Bloque C, Entrega 6 — Consolidación del seguimiento, autointeracción y experiencia social (implementado)

Precedida por un análisis de 18 puntos (primero bajo la nueva metodología de revisión crítica adoptada al cerrar la Entrega 5) que concluyó que la mayor parte de "acciones sociales" ya existía y funcionaba — solo para negocios. El alcance real aprobado fue de **consolidación**, no de funcionalidad nueva: unificar el seguimiento de personas y negocios bajo un único modelo de datos, extender las acciones sociales al perfil de persona (antes sin ninguna), hacer los contadores reactivos, bloquear la autointeracción también en la base de datos, y eliminar una duplicación visual real de contacto.

### Hallazgo central del análisis: dos sistemas de "seguir" inconexos

`follows` (Fase 1, `follower_id`/`followed_id` sobre `auth.users`) seguía siendo la única vía de seguimiento entre personas, usada por `FollowContext`/`AuthorTag` en el feed — completamente desconectada de `interactions` (Fase 3, Bloque C, Entrega 2), que ya seguía negocios pero nunca se usó para personas. El usuario aprobó explícitamente migrar el seguimiento de personas a `interactions`, convirtiéndola en la única fuente de verdad futura, sin retirar todavía `follows` (queda como legacy de solo respaldo).

### `supabase/migrations/0027_fase3_bloqueC_entrega6_seguimiento_unificado.sql` (nuevo)

- **Reconciliación puntual** (se ejecuta una sola vez, al aplicar esta migración): copia hacia `interactions` cualquier fila de `follows` que todavía no tuviera su equivalente (drift acumulado desde el backfill original del Bloque 4 de la Fase 1, ya que `follows` siguió recibiendo escritura real desde entonces), y elimina las interacciones persona→persona que ya no tuvieran respaldo real en `follows` (alguien dejó de seguir con el mecanismo viejo después de aquel backfill, sin que `interactions` se enterara nunca). Acotada estrictamente a pares persona→persona — el seguimiento de negocios, que ya vive solo en `interactions` desde la Entrega 2, no se toca.
- **`public.reconcile_follows_to_interactions()`** (nueva, solo administrador de plataforma): versión reutilizable de la mitad segura de la reconciliación — **solo copia hacia adelante**, nunca elimina. Se encontró y se corrigió un defecto real durante la propia verificación (ver "Incidencia encontrada" abajo) antes de que la función reutilizable pudiera borrar datos legítimos.
- **`public.prevent_self_interaction()`** + trigger `before insert` en `interactions`: bloquea a nivel de base de datos (no solo ocultando el botón) seguirte a ti mismo, seguir tu propio negocio, y guardar tu propio negocio como propietario legal o administrador operativo activo — una sola condición (`target_id = actor_id` o `actor_editable_by_current_user(target_id)`) cubre los tres casos pedidos.

### Incidencia encontrada y corregida durante la propia verificación

La primera versión de `reconcile_follows_to_interactions()` también eliminaba interacciones persona→persona sin fila de `follows` correspondiente — correcto en el instante exacto de esta migración (nada más pudo haberlas creado), pero **destructivo si se reejecutaba después del corte**: un seguimiento nuevo creado directamente en `interactions` (el comportamiento correcto post-migración) nunca tendrá fila en `follows`, y la función lo habría borrado como si fuera basura. Se encontró probando la función contra Postgres real con datos que reproducían exactamente ese escenario (ver verificación abajo) y se corrigió antes de cualquier commit: la eliminación de huérfanos queda **solo** en la reconciliación puntual de la migración (sección 1, se ejecuta una única vez), nunca en la función reutilizable.

### Frontend

- **`src/lib/actorProfile.js`**: `getActorIdForProfile(profileId)` — resuelve el actor persona de un profile_id, necesario porque `interactions.target_id` siempre es un actor_id.
- **`src/lib/interactions.js`**: `listFollowedProfileIds(viewerProfileId)` (dos consultas: mis seguimientos → actor_ids seguidos → profile_ids de esos actores, para que `FollowContext` conserve exactamente su forma pública de siempre); `describeInteractionError(error)` — traduce cualquier error real de Postgres/PostgREST (autointeracción `23514`, duplicado `23505`, RLS `42501`, fallo de red) a un mensaje breve en español, nunca un fallo silencioso.
- **`src/hooks/useActorSocialState.js`** (nuevo): única fuente de estado compartida entre `ActionBar` y `ActivityStrip` — contadores + "sigo/guardé" + `busy` por acción + mensaje de error transitorio, con actualización optimista y reversión exacta (botón y contador) si el servidor rechaza la acción.
- **`src/contexts/FollowContext.jsx`**: reescrito para leer/escribir exclusivamente `interactions` — **misma forma pública** (`followingIds: Set<profileId>`, `toggleFollow(profileId)`) para que `AuthorTag.jsx` no necesitara ni un solo cambio, verificado explícitamente con Playwright (el POST real llega a `interactions` con `type: "seguimiento"`, `target_type: "actor"`; `follows` nunca recibe una petición).
- **`src/lib/follows.js`** — eliminado (sin más referencias en el código; la tabla en la base de datos permanece intacta).
- **`src/features/profile/ActionBar.jsx`**: ahora recibe `social` (el hook de arriba) y `blocked` en vez de gestionar su propio estado; se monta también para actores persona (solo el botón Seguir, sin guardar/compartir/contacto); `blocked` oculta Seguir/Guardar cuando el actor visto es mi propia persona o un negocio que poseo/administro — la base de datos ya lo impide, pero no tiene sentido mostrar el botón. Los botones de alternar llevan `aria-pressed` y quedan deshabilitados mientras la petición está en curso (previene doble-toque además de la restricción `unique` ya existente). "Cómo llegar" ahora abre una hoja con el mismo `DirectionsSection` completo (distancia real, tiempo estimado por modo, Uber, tranvía/bus) que ya usan los lugares, en vez de un enlace directo a Google Maps.
- **`src/features/profile/ActivityStrip.jsx`**: recibe los contadores por props (ya no los consulta él mismo) y se adapta a persona (solo seguidores) o negocio (guardados + seguidores + estado abierto/cerrado).
- **`src/features/profile/AboutSection.jsx`**: teléfono y WhatsApp dejan de ser botones tocables aquí (ya existen, más arriba en la jerarquía, en `ActionBar`) — se muestran como información de texto; el sitio web sigue siendo un enlace tocable porque no existe en ningún otro lugar de la pantalla.
- **`src/pages/ActorProfilePage.jsx`**: instancia `useActorSocialState` una sola vez y lo pasa a ambos componentes; monta `ActivityStrip`/`ActionBar` también para actores persona (antes exclusivo de negocio).

### Verificación realizada

- **Migración 0027 contra Postgres 16 real**, con roles de bajo privilegio (nunca superusuario): Ana sigue a Beto (persona→persona, éxito); Ana intenta seguirse a sí misma (rechazado, "No puedes seguir ni guardar tu propio perfil."); Ana (propietaria) intenta seguir su propio negocio (rechazado); Beto (administrador operativo activo) intenta guardar el negocio que administra (rechazado); Carla (tercera) sigue y deja de seguir el negocio (éxito); Carla intenta insertar una interacción a nombre de Ana (rechazado por RLS, no por el trigger); Carla intenta borrar la interacción ajena de Ana (0 filas afectadas); doble inserción idéntica (rechazada por la restricción `unique` ya existente, `unique_violation`). **Reversión probada de verdad**: se eliminaron trigger y funciones, se confirmó que Ana **podía** entonces seguirse a sí misma (prueba de que el trigger era la causa real), y se reaplicó la migración. La reconciliación se probó con datos que reproducían exactamente el drift esperado (una fila de `follows` sin su equivalente en `interactions`, y una interacción persona→persona sin respaldo real en `follows`) — contadores antes/después documentados en el hallazgo de la incidencia arriba.
- **Playwright** (10 escenarios nuevos, sesión autenticada real de supabase-js simulada): perfil de otra persona muestra Seguir + contador, togglear actualiza ambos al instante; mi propio perfil de persona no muestra el botón Seguir pero sí mi contador de seguidores; negocio propio sin Seguir/Guardar pero con Compartir/Llamar/WhatsApp, "Cómo llegar" abre la hoja con `DirectionsSection` real; administrador operativo (no mi persona) tampoco ve Seguir/Guardar; tercero guarda un negocio y el contador sube al instante; una escritura rechazada revierte botón y contador exactamente al valor anterior y muestra un mensaje; el rechazo de autointeracción (código `23514`) muestra el mensaje exacto de la base de datos; doble-toque rápido genera una sola escritura real; visitante sin sesión que toca Seguir en un perfil de persona es redirigido a `/login`; `AuthorTag` dentro de `EventSheet` escribe en `interactions` (nunca en `follows`) al seguir al autor de un comentario.
- **Regresión completa**: las cinco Playwright de las Entregas 1-5 (8 + 3 + 8 + 7 + 7 = 33 escenarios) se volvieron a correr después de esta entrega — todos siguen pasando sin cambios.
- **Build y lint**: limpios, sin advertencias nuevas.

### Limitación de entorno

Misma de las entregas anteriores (sin Docker/Supabase real): la prueba de concurrencia real de la restricción `unique` (dos conexiones insertando exactamente al mismo tiempo) se aproximó con una inserción duplicada secuencial contra Postgres real (confirma que la restricción rechaza correctamente) y con un doble-clic real en Playwright (confirma que el frontend nunca envía dos peticiones) — una condición de carrera genuina con múltiples conexiones simultáneas requiere un banco de pruebas contra un proyecto desplegado, fuera de alcance de este sandbox.

### Deuda técnica detectada

- Toda la de las Entregas 1-5 (sin cambios) — incluida la gestión de archivos huérfanos en Storage (obligatoria antes de producción) y la falta de interfaz para gestionar `actor_managers`.
- **Prueba end-to-end de todo lo social contra Supabase real desplegado**: sigue pendiente (heredada desde la Entrega 2, no resuelta aquí tampoco).
- **`follows` permanece como estructura legacy de solo respaldo**: el frontend ya no la usa para nada, pero la tabla y sus filas no se retiran en esta entrega — el retiro definitivo requiere su propia migración futura, después de un periodo de convivencia observado en producción.
- **Sin pantalla de "negocios guardados"**: `guardar` un negocio sigue funcionando (vía `interactions`), pero no existe ningún lugar de la interfaz donde ver la lista de negocios guardados — registrada como funcionalidad futura de producto, no como deuda crítica de esta entrega (decisión explícita del usuario).
- **Concurrencia real de la restricción `unique`**: aproximada, no probada con múltiples conexiones simultáneas genuinas (ver limitación de entorno arriba).

### Recomendación de arquitectura aprobada al cerrar la Entrega 6: `reconcile_follows_to_interactions()` es legacy, no una operación normal

El Product Owner pidió dejar explícitamente documentado que esta función **no es una operación normal del sistema** — es una herramienta de una sola ejecución para la ventana de convivencia con `follows`, pensada únicamente para el caso de que `follows` reciba una escritura fuera de banda (por ejemplo, una corrección manual vía SQL Editor). No debe programarse para correr periódicamente sobre datos ya consolidados. Se documentó a nivel de base de datos con `supabase/migrations/0028_fase3_bloqueC_entrega6_documentar_reconciliacion_legacy.sql` (`comment on function`, verificado contra Postgres real — puramente documental, no cambia ninguna columna, política ni comportamiento ya aprobado), además de en este documento.

### Qué sigue (Entrega 7, pendiente de aprobación y de su propio análisis de 18 puntos)

A definir junto con el usuario. No se avanza automáticamente — a la espera de aprobación explícita. Ni la Entrega 7 ni el cierre del Bloque C/Fase 3 deben iniciarse sin aprobación expresa.

## Fase 3, Bloque C, Entrega 7 — Búsqueda y descubrimiento de negocios (implementado)

A diferencia de las Entregas 5 y 6, el objeto de esta entrega no vino dictado de antemano — el usuario pidió continuar solo con funcionalidad nueva y delegó la definición del alcance al análisis de 18 puntos. Se propuso y se aprobó cerrar la deuda técnica más citada del Bloque C (registrada desde la Entrega 2): no existía ninguna forma de descubrir un negocio salvo enlace directo, evento propio o ser tuyo. Auditando el código real antes de proponerlo se confirmó que `actor_search_index` (tsvector, Bloque A, extendida con catálogo en el Bloque B) existía completa y poblada automáticamente, pero ningún archivo de `src/` la usaba — trabajo ya pagado, nunca conectado a ninguna pantalla.

### Dos ajustes de producto exigidos antes de implementar

1. **Actor como entidad principal, no una función específica de negocios.** La función de búsqueda consulta actores con un parámetro `actor_types` (por defecto `['negocio']`) — ampliar a `'organizador'` o, con su propia aprobación futura, `'persona'`, es ensanchar un arreglo, nunca rediseñar la consulta.
2. **Estado inicial mejorado**: categorías rápidas de acceso directo (misma taxonomía de `channels`/`CHANNELS` ya usada en toda la app) antes de escribir texto, que disparan la misma búsqueda existente — nunca un sistema de recomendación aparte.

### `supabase/migrations/0029_fase3_bloqueC_entrega7_busqueda_actores.sql` (nuevo)

`public.search_actors(search_query, category_filter, actor_types)` — función de solo lectura sobre `actor_search_index`, unida a `actors`/`businesses`. Dos decisiones de seguridad, ambas verificadas contra Postgres 16 real:
- El filtro `status = 'aprobado'` se aplica **dentro de la propia función** (`b.id is null or b.status = 'aprobado'`), nunca confiado solo a la política de lectura pública ya existente de `actor_search_index` — un negocio pendiente, rechazado o sin propietario nunca es descubrible, aunque su fila de índice exista.
- `category_filter` filtra por el id corto de categoría (`businesses.category`, la misma taxonomía de `channels`), no por coincidencia de texto contra la etiqueta en español — el documento indexado contiene "gastronomia", no "restaurantes", así que un chip de categoría necesita un filtro exacto, no una búsqueda de texto disfrazada.
- `search_query` y `category_filter` son independientes: se puede llamar con cualquiera de los dos o ambos.
- Deliberadamente sin ranking por popularidad/cercanía ni personalización — orden por `ts_rank` cuando hay texto, alfabético cuando el acceso es solo por categoría; eso queda reservado para la Fase 6 ("Descubrimiento inteligente v2").

### Frontend

- **`src/lib/actorSearch.js`** (nuevo): `searchActors({ query, category, types })` — envuelve el RPC, con `types` por defecto `["negocio"]`.
- **`src/lib/places.js`**: sin cambios — `listPlaces({ channel })` (ya existente) se reutiliza tal cual para el acceso rápido por categoría del lado de Lugares; `searchPlaces(query)` (ya existente) se reutiliza tal cual para la búsqueda por texto.
- **`src/features/search/ActorResultCard.jsx`** (nuevo): mismo lenguaje visual que `PlaceCard` (grilla 1:1, imagen o respaldo por categoría, nombre superpuesto) para que Lugares y Negocios se sientan parte del mismo sistema, aunque sus secciones nunca se mezclan.
- **`src/pages/SearchPage.jsx`**: misma pantalla y misma ruta `/buscar` de siempre, extendida — nunca una pantalla nueva. Categorías rápidas visibles solo antes de buscar; al tocar una, dispara `listPlaces({channel})` + `searchActors({category, types:['negocio']})` en paralelo. Al escribir texto, dispara `searchPlaces(query)` + `searchActors({query, types:['negocio']})`. Dos secciones ("Lugares"/"Negocios") que **nunca se mezclan** — cada una se dibuja solo si tiene resultados reales, mismo principio ya usado en el Centro del Negocio. Placeholder actualizado a "Buscar un lugar o negocio…".

### Verificación realizada

- **Migración 0029 contra Postgres 16 real**, como visitante anónimo (`set role anon`, nunca superusuario): buscar por texto el nombre de un negocio aprobado (lo encuentra); buscar por texto el nombre de un negocio **pendiente** (no aparece, aunque el nombre coincida exactamente); buscar por categoría exacta (encuentra solo el aprobado de esa categoría); buscar por contenido de la bio/descripción, no solo el nombre (funciona, confirma que el índice cubre más que el nombre); sin `query` ni `category` (0 filas — nunca un listado completo accidental); un actor tipo persona nunca aparece al filtrar `actor_types=['negocio']`.
- **Playwright** (6 escenarios nuevos): estado inicial con chips de categoría y sin secciones de resultados; tocar un chip muestra ambas secciones separadas con datos reales; búsqueda de texto encuentra lugar y negocio a la vez, cada uno en su sección; buscar algo que solo tiene negocio hace que la sección "Lugares" no se renderice en absoluto; sin resultados en ninguna sección muestra un mensaje honesto sin dibujar ningún encabezado; tocar una tarjeta de negocio navega a `/actor/:actorId`.
- **Regresión completa**: las seis Playwright de las Entregas 1-6 (8 + 3 + 8 + 7 + 7 + 10 = 43 escenarios) se volvieron a correr — todos pasan. Una repetición aislada de un escenario de doble-toque de la Entrega 6 (`e6_08`) mostró una falla puntual (`writes=2` en vez de `1`) en la primera pasada de esta ronda de regresión; se confirmó que ningún archivo de la Entrega 6 fue tocado en esta entrega (`git diff` limpio) y se repitió la prueba de forma aislada, pasando limpiamente (`writes=1`) — conclusión: inestabilidad de temporización de la simulación de doble-clic bajo carga del sistema en este sandbox, no una regresión real. Se documenta por transparencia, no se descarta sin evidencia.
- **Build y lint**: limpios, sin advertencias nuevas.

### Limitación de entorno

Misma de las entregas anteriores (sin Docker/Supabase real). El comportamiento de `websearch_to_tsquery('spanish', ...)` se probó con nombres y contenido reales de negocio (no solo IDs sintéticos), pero no se probó exhaustivamente contra el catálogo completo de nombres de negocio reales que eventualmente existan en producción — un nombre con acentos, siglas o marcas inusuales podría comportarse de forma inesperada; se recomienda revisar resultados de búsqueda reales tras el primer mes en producción.

### Deuda técnica detectada

- Toda la de las Entregas 1-6 (sin cambios).
- **Sin autocompletado en vivo**: la búsqueda requiere enviar el formulario; agregar sugerencias mientras se escribe es una mejora de UX razonable, no incluida a propósito en esta entrega.
- **Sin ranking por relevancia/popularidad/cercanía**: reservado explícitamente para la Fase 6 ("Descubrimiento inteligente v2").
- **Sin búsqueda de personas**: el índice técnicamente ya cubre actores tipo persona, pero exponer "buscar personas por nombre" abre una pregunta de privacidad/descubribilidad nunca aprobada — queda fuera hasta que se apruebe aparte.
- **Negocios no aparecen en el Mapa/Explorar**: `ExplorePage`/`MapView`/`PlaceGrid` siguen trabajando exclusivamente sobre `places` — extensión futura razonable, no construida en esta entrega.

### Qué sigue

Con la Entrega 7 completa, el Bloque C (y con él, la Fase 3 completa) se declaran oficialmente cerrados — ver la sección "FASE 3 CERRADA" más abajo. No se crea una Entrega 8: el usuario confirmó que no correspondía extender artificialmente el Bloque C, y que las 7 entregas planificadas quedaron completas (con la sustitución transparentada de la Entrega 7, ver esa sección).

---

## FASE 3 CERRADA — Identidad social plena (2026-07-18)

Cierre formal de la Fase 3 completa del `MASTERPLAN.md`, aprobado explícitamente tras completar el Bloque C (7 entregas). Checkpoint de Git: tag `checkpoint-fase3-identidad-social`.

### Resumen ejecutivo

La Fase 3 construyó la identidad social plena de Ahorita — un perfil público, editable y descubrible, compartido por personas y negocios bajo un único eje: el Actor. Se dividió en tres bloques, cada uno propuesto, implementado, verificado y aprobado por separado:

1. **Bloque A — Perfil unificado y administración**: `actor_profile_details` (bio/logo/portada, 1:1 con cualquier actor), `actor_managers` (administración operativa delegable, distinta de la propiedad legal), `actor_media` (galería), `actor_search_index` (búsqueda básica con tsvector nativo), y `actor_editable_by_current_user()` (pertenencia legal O administración operativa activa).
2. **Bloque B — Horarios, catálogo y ubicación estructurada**: `business_hours`/`business_special_hours` (horario regular y excepciones, con turnos que cruzan medianoche), `business_open_status()` (función central de "abierto ahora" en zona horaria `America/Guayaquil`), `business_catalog_collections`/`business_catalog_items` (catálogo flexible sin taxonomía rígida), `businesses.zone_id`.
3. **Bloque C — Perfiles visibles y editables ("Centro del Negocio")**, 7 entregas:
   - **Entrega 1**: perfil público unificado (`/actor/:actorId`), identidad de solo lectura, insignia de verificación pública (`actor_verification_badge()`).
   - **Entrega 2**: "Centro del Negocio" — actividad real (guardados/seguidores), acciones (seguir/guardar/compartir/contacto), catálogo por colecciones, eventos asociados, galería, tarjeta de la Guía IA, "Acerca de". Precedida por una propuesta de diseño funcional y visual aprobada antes de escribir código.
   - **Entrega 3**: edición de logo/portada/bio/galería, con permisos reutilizados del Bloque A, sin ninguna migración nueva.
   - **Entrega 4**: edición de horarios (regulares y especiales) y catálogo (colecciones e ítems), con terminología deliberadamente genérica ("Catálogo"/"Colecciones"/"Elementos").
   - **Entrega 5**: selector de perfil unificado — el perfil personal se unificó al mismo sistema que los negocios (`ProfilePage.jsx` retirado), `ProfileSwitcherSheet` para saltar entre identidades propias/administradas, nueva ruta `/ajustes`.
   - **Entrega 6**: consolidación del seguimiento — `interactions` como única fuente de verdad para seguir personas y negocios (`follows` migrada y retirada del frontend, conservada como legacy de solo respaldo), autointeracción bloqueada a nivel de base de datos, estado social reactivo compartido entre componentes, "Cómo llegar" enriquecido, contacto sin duplicar.
   - **Entrega 7**: búsqueda y descubrimiento de negocios (`search_actors()`, Actor-céntrica, categorías rápidas), cerrando la deuda técnica citada desde la Entrega 2. Sustituyó, con aprobación informada después de transparentarlo, el contenido original planeado para esta entrega ("validación visual final").

A partir de la Entrega 6, la fase adoptó una metodología nueva y permanente: cada entrega se precede de un análisis de 18 puntos (arquitectura, ingeniería, UX/UI, product design, auditoría técnica), cuestionando activamente el diseño previo en vez de solo confirmar la funcionalidad pedida.

### Arquitectura lograda

- **Actor como eje unificador único**: toda identidad (persona, negocio, organizador, sistema) se resuelve a la misma forma de datos y a la misma ruta pública (`/actor/:actorId`) — nunca dos sistemas paralelos para "perfil de persona" y "perfil de negocio".
- **Separación explícita de dos ejes de control**: propiedad legal (`businesses.owner_id`, Fase 1) vs. administración operativa delegable (`actor_managers`, Bloque A) — un negocio puede tener administradores sin transferir su titularidad legal.
- **Perfil como concepto de Actor, no de tabla**: `actor_profile_details` es 1:1 con cualquier actor, incluidos los de sistema, por consistencia estructural.
- **Modelo polimórfico único de interacción social**: `interactions` (Fase 1, Bloque 4) terminó la fase siendo la única fuente de verdad para seguir/guardar cualquier tipo de actor — consolidación real, no solo una decisión de diseño en el papel.
- **Funciones de seguridad compuestas y reutilizadas, nunca reinventadas**: `actor_belongs_to_current_user` (Fase 2) + `actor_editable_by_current_user` (Bloque A) se combinan para dar exactamente "pertenencia legal O administración operativa activa" en cada punto donde se necesitó, incluida la migración 0027 de la Entrega 6.
- **Funciones públicas de alcance estrecho para exponer datos sensibles sin abrir RLS ancha**: `actor_verification_badge()` (badge público sin exponer `verifications`), `business_open_status()` (estado calculado sin exponer horarios completos si no se desea), `search_actors()` (búsqueda pública que respeta `status='aprobado'` dentro de la propia función).
- **Índice de búsqueda mantenido automáticamente**: `actor_search_index` (tsvector) se puebla por trigger desde el Bloque A, extendida en el Bloque B para incluir el catálogo — la Entrega 7 solo tuvo que conectarla, no construirla.
- **Patrones de producto consolidados y repetidos deliberadamente**: "staged vs. immediate save" (logo/portada/bio y horario semanal completo se guardan con un botón; galería/horarios especiales/catálogo se guardan de inmediato, acción por acción); "ninguna sección se dibuja sin datos reales" (Centro del Negocio, resultados de búsqueda).

### Funcionalidades implementadas

- Perfil público unificado para cualquier actor, con insignia de verificación pública.
- Centro del Negocio completo: actividad, acciones sociales, catálogo, eventos, galería, Guía IA, información de contacto y horario.
- Edición completa de logo, portada, biografía y galería, con validación de tipo/tamaño y protección de cambios sin guardar.
- Edición de horarios regulares (con validación de solapamiento) y especiales, y de catálogo por colecciones e ítems (con precio fijo/desde/variable, disponibilidad, visibilidad).
- Selector de identidad: cualquier usuario con negocios propios o administrados puede saltar entre su perfil personal y cada negocio desde un solo punto.
- Ajustes de cuenta separados del perfil (`/ajustes`): intereses, lugares guardados, notificaciones, panel de administración, cerrar sesión.
- Seguir/dejar de seguir y guardar/quitar de guardados, unificado para personas y negocios, con contadores reactivos, bloqueo de autointeracción, y mensajes de error comprensibles ante cualquier fallo.
- Búsqueda real de negocios por nombre, contenido de catálogo o categoría, con acceso rápido por categorías, separada siempre de la búsqueda de lugares.

### Decisiones de diseño tomadas durante la fase

- Usar `actor_verification_badge()` (función estrecha) en vez de abrir la lectura pública de `verifications`, para no reabrir una superficie de riesgo ya cerrada en la Fase 2.
- Reutilizar `interactions` para "seguir un negocio" (Entrega 2) en vez de ampliar `follows`, y más tarde (Entrega 6) completar esa consolidación migrando también el seguimiento de personas.
- Agregar `business_catalog_collections.is_visible` (pequeña migración aprobada aparte) en vez de forzar el mismo comportamiento con una columna ya existente que significaba algo distinto.
- Unificar el perfil personal al sistema de Actor (Opción B, Entrega 5) en vez de agregar un selector sobre la pantalla heredada de la Fase 1 — evitando perpetuar una inconsistencia visual real.
- Relocalizar los ajustes de cuenta a `/ajustes`, separando explícitamente "quién soy" (perfil) de "cómo configuro mi cuenta" (ajustes).
- Mantener `follows` como legacy de solo respaldo en vez de retirarla en la misma entrega que dejó de usarse — reversión sin pérdida de datos durante una ventana de convivencia observada.
- Documentar `reconcile_follows_to_interactions()` explícitamente como herramienta de una sola ejecución (a nivel de base de datos, con `comment on function`) tras una recomendación de arquitectura del Product Owner, para que nunca se interprete como una tarea programada normal.
- Diseñar `search_actors()` de forma Actor-céntrica (`actor_types` como arreglo) en vez de una función específica de negocios, para no rediseñar cuando se agreguen otros tipos de actor descubribles.
- Reutilizar la taxonomía de `channels`/`CHANNELS` ya existente para las categorías rápidas de búsqueda, en vez de inventar una nueva clasificación.

### Problemas encontrados y cómo fueron resueltos

- **`listBusinessCatalog` (Entrega 2) no filtraba colecciones ocultas** tras agregar `is_visible` en la Entrega 4 — encontrado y corregido antes de cualquier commit, agregando el mismo filtro que ya tenían los ítems.
- **Reordenar ítems del catálogo no re-ordenaba la lista visual** (Entrega 4) — corregido ordenando el arreglo antes de agrupar por colección.
- **Defecto real en la primera versión de `reconcile_follows_to_interactions()`** (Entrega 6): eliminaba interacciones sin fila de `follows` correspondiente, lo que habría destruido seguimientos nuevos legítimos si se hubiera reejecutado después del corte — encontrado probando la función contra Postgres real con datos que reproducían exactamente ese escenario, corregido antes de cualquier commit dejando la eliminación de huérfanos únicamente en la reconciliación puntual de la migración.
- **Inestabilidad puntual de un escenario de doble-toque en Playwright** (Entrega 6, reaparecida durante la regresión de la Entrega 7): se investigó activamente en vez de descartarla — se confirmó que ningún archivo relacionado había cambiado (`git diff` limpio) y se repitió la prueba de forma aislada, pasando limpiamente. Se documentó con transparencia como inestabilidad de temporización del entorno, no como una regresión real ni como una falla ignorada.
- **Sustitución no transparentada del contenido de la Entrega 7**: al delegárseme la definición de su alcance, propuse "búsqueda" en vez de la "validación visual final" originalmente planeada, sin marcarlo explícitamente como reemplazo — corregido con una aclaración completa apenas se preguntó directamente, antes de autorizar cualquier fase siguiente.

### Deudas técnicas pendientes (consolidado, obligatorio documentar antes de producción)

- **Gestión de `actor_managers`** (invitar, aceptar/rechazar, impedir invitaciones duplicadas, mostrar propietarios/administradores activos, revocar, registrar quién invitó/revocó, impedir que un administrador operativo invite o revoque a otros, retirar permisos de inmediato al revocar) — **obligatoria antes de que los negocios puedan publicar y operar plenamente en la fase social** (aprobación explícita al cerrar la Entrega 6).
- **Gestión de archivos huérfanos en Storage** (reemplazar/eliminar debe liberar el objeto binario real, confirmar pertenencia, evitar borrar referencias activas, registrar fallos, limpieza periódica, respetar privacidad/eliminación de cuenta) — obligatoria antes de producción, con su propio diseño dedicado, nunca corregida de forma aislada dentro de una entrega.
- **Prueba end-to-end contra un proyecto Supabase real desplegado** (Auth+PostgREST+RLS+Storage+Edge Functions+triggers programados) — heredada desde la Fase 1, nunca resuelta en ningún bloque de la Fase 3 por falta de Docker/Supabase real en este entorno de desarrollo.
- **`follows` permanece como estructura legacy de solo respaldo** — el frontend ya no la usa, pero la tabla y sus filas no se han retirado; el retiro definitivo requiere su propia migración futura, después de un periodo de convivencia observado en producción.
- **Sin pantalla de "negocios guardados"** — `guardar` un negocio funciona (vía `interactions`), pero no existe ningún lugar de la interfaz para ver esa lista; registrada como funcionalidad futura de producto, no como deuda crítica.
- **Sin autocompletado ni ranking en la búsqueda** — reservado explícitamente para la Fase 6 ("Descubrimiento inteligente v2"), decisión de alcance, no una omisión.
- **Sin búsqueda de personas** — el índice ya cubre actores tipo persona técnicamente, pero exponerla abre una pregunta de privacidad/descubribilidad nunca aprobada.
- **Negocios no aparecen en el Mapa/Explorar** — `ExplorePage`/`MapView`/`PlaceGrid` siguen trabajando exclusivamente sobre `places`.
- **`replaceBusinessHours` no es atómico** (Entrega 4) — dos llamadas REST separadas, sin transacción; riesgo bajo, documentado.
- **Concurrencia real de la restricción `unique` de `interactions`** (Entrega 6) — aproximada con inserción duplicada secuencial y doble-clic en Playwright, nunca probada con múltiples conexiones simultáneas genuinas.
- **Comportamiento de `websearch_to_tsquery('spanish', ...)` contra el catálogo completo de nombres reales de negocio** (Entrega 7) — probado con datos reales pero no exhaustivamente; recomendado revisar resultados reales tras el primer mes en producción.

### Dependencias habilitadas para las siguientes fases

- **`interactions` como única fuente de verdad del seguimiento** (Entrega 6) permite que la Fase 4 (Contenido social ampliado) y la Fase 5 (Interacción social plena) construyan directamente sobre ella, sin necesitar ninguna reconciliación adicional entre sistemas paralelos.
- **El perfil unificado (`/actor/:actorId`) es la superficie de identidad ya construida** sobre la que la Fase 4 (publicaciones/promociones), la Fase 7 (Guía IA v2) y la Fase 9 (QR y experiencias físicas) probablemente anclarán su interfaz, sin rediseñar la identidad de nuevo.
- **`actor_managers` + `actor_editable_by_current_user()` ya resuelven "quién puede actuar en nombre de un negocio"** — la futura interfaz de gestión de administradores (deuda obligatoria) es la única pieza que falta para que la Fase 4 pueda apoyarse en un modelo de permisos ya probado, en vez de diseñar uno nuevo.
- **`actor_search_index` ya conectada y en producción real de código (Entrega 7)** — la Fase 6 (Descubrimiento inteligente v2) puede construir ranking, personalización y autocompletado directamente sobre `search_actors()`, en vez de partir de cero.
- **El patrón de reutilización de `DirectionsSection` entre lugares y negocios (Entrega 6)** deja precedente para que futuras superficies (por ejemplo, negocios en el Mapa) compartan componentes en vez de duplicar lógica de distancia/transporte.

### Criterios que demuestran que la Fase 3 puede considerarse funcionalmente terminada

1. Los tres bloques planificados (A, B, C) están completos — cada uno propuesto, implementado, verificado contra Postgres 16 real (o Playwright cuando Postgres no aplicaba) y aprobado explícitamente por separado.
2. El Bloque C completó sus 7 entregas planificadas, incluida la sustitución de la Entrega 7 transparentada y aprobada informadamente.
3. Ningún defecto real encontrado durante la fase llegó a un commit sin corregir — cada uno se detectó, se corrigió (o se detuvo para aprobación si implicaba una decisión de producto) antes de cerrar su bloque/entrega.
4. Build y lint quedaron limpios, sin advertencias nuevas, al cierre de cada bloque y entrega.
5. La regresión acumulada de Playwright de todo el Bloque C (Entregas 1 a 7: 8+3+8+7+7+10+6 = 49 escenarios, más el escenario dedicado de `AuthorTag`) pasa sin fallas reales — la única falla observada durante el ciclo se investigó activamente y se confirmó como inestabilidad de entorno, no una regresión de código.
6. Toda deuda técnica pendiente está identificada, nombrada explícitamente y documentada como requisito de pre-producción — ninguna quedó oculta o implícita.
7. La arquitectura de Actor, establecida como eje unificador desde la Fase 1, se sostuvo sin necesitar ningún rediseño durante los tres bloques de la Fase 3 — cada pieza nueva (perfil, horarios/catálogo, seguimiento, búsqueda) se construyó *sobre* Actor, nunca al lado de él.

---

## FASE 4 — Contenido social ampliado, rediseñada como "el Feed como centro"

Antes de implementarse, esta fase pasó por tres rediseños arquitectónicos sucesivos, cada uno cuestionando al anterior en vez de protegerlo por inercia — ver `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md` y `FASE4_CONTRATO_ARQUITECTONICO.md` (autoridad de diseño de esta fase) para el detalle completo del proceso. Decisión final: **nunca migrar un sistema estable (`events`) antes de validar completamente el nuevo** (núcleo de Publicaciones); la fase se construye y se ordena mentalmente alrededor del Feed, no de la base de datos, en cuatro bloques verificables. La antigua Fase 5A ("Seguir negocios") queda formalmente retirada del `MASTERPLAN.md` — su alcance ya fue absorbido por la Fase 3 (Entregas 2 y 6).

### Bloque 1 — El Feed como contrato central

**Objetivo.** Construir la capacidad del Feed de combinar contenido de múltiples fuentes con jerarquía visual clara, probada primero con Eventos (única fuente real hoy) sin modificarlo, antes de que exista ninguna fuente nueva.

**Qué cambió.** `src/lib/feed.js`: se extrajo el mapeo de evento a item de feed a `mapEventToFeedItem` (antes inline dentro de `getFeed`), agregando un campo `sortAt` — el criterio de orden común entre fuentes, hoy igual a `start_at`. Se agregó `mergeFeedSources(...sources)`, que concatena y ordena por `sortAt` cualquier número de listas de items — hoy invocada con una sola fuente (eventos), por lo que el resultado es idéntico al anterior. `events` no se tocó en absoluto: ni su esquema, ni sus políticas RLS, ni `lib/events.js`, ni `EventSheet`, ni la administración de eventos.

**Por qué este orden.** Pensado desde el Feed como centro del producto (no desde la base de datos): se prueba primero que el contrato de composición funciona con una sola fuente real, antes de arriesgar la combinación con una segunda fuente nueva (Publicaciones, Bloque 2). Si el contrato fallara, el costo de descubrirlo es mínimo — nada nuevo depende todavía de él.

**Verificado.** Build y lint limpios (sin advertencias nuevas). Playwright (5 escenarios, `test_fase4_bloque1.js`): sin errores de JS; los cuatro eventos mockeados aparecen todos; el orden por cercanía temporal se preserva exactamente; "Selección del editor" sigue insertándose correctamente; el primer evento (más próximo) conserva el tratamiento visual "portada". Regresión general (`test_regression.js`): Inicio, Explorar y Perfil cargan sin errores. Sin migraciones — este bloque no toca la base de datos.

**Resultado visible para el usuario.** Ninguno — cero diferencia observable, tal como exige el criterio de aceptación del contrato aprobado.

**Deuda técnica.** Ninguna nueva. Sigue pendiente, a propósito, la eventual consolidación de `events` sobre el núcleo compartido de Publicación — se evaluará solo después de que Publicaciones y Promociones (Bloques 2-3) demuestren en uso real que el modelo es correcto.

### Bloque 2 — Publicaciones alimentan el Feed

**Objetivo.** Construir el núcleo real de Publicación (subtipo "publicación regular") e integrarlo como segunda fuente del contrato del Bloque 1, incluyendo el caso de autoría del Actor de sistema "Ahorita Editorial".

**Ajustes de producto incorporados antes de implementar** (aprobados junto con el diseño): (1) protección contra publicaciones accidentales — resuelta en el frontend con el mismo patrón de estado `busy`/botón deshabilitado ya probado en la Entrega 6, sin mecanismo nuevo de base de datos; (2) límite de contenido de 500 caracteres, justificado por la identidad del producto (una nota breve tipo publicación social, nunca un artículo) y exigido a nivel de restricción de base de datos, no solo de frontend; (3) edición transparente — `published_at` nunca se sobrescribe una vez fijada (protegida por trigger), y el frontend muestra "Editado" comparando la fecha de la última edición del contenido contra la fecha de publicación original, siempre visible; (4) pérdida de verificación — un negocio que deja de estar verificado conserva intactas y visibles sus publicaciones existentes, y conserva la capacidad de editarlas/ocultarlas/eliminarlas; solo se le impide crear publicaciones nuevas mientras no recupere la verificación; (5) preparación de permalink — registrado como decisión futura, ya satisfecha por construcción (el `id` uuid de cada publicación es estable y nunca se reutiliza), sin requerir ningún campo adicional en este bloque.

**Migración.** `supabase/migrations/0030_fase4_bloque2_publicaciones.sql`: núcleo `publications` + detalle `publication_posts`; `public.actor_can_author_publication()` (verificación exigida solo al crear); triggers de protección de `published_at` y de `updated_at` del detalle. `events` no se tocó en absoluto.

**Verificado contra Postgres 16 real** (roles de bajo privilegio, nunca superusuario): negocio verificado crea con éxito; negocio no verificado rechazado; administrador operativo activo crea/edita con éxito; administrador operativo revocado rechazado tanto al crear como al editar contenido ya existente; tercero ajeno rechazado; un usuario cualquiera no puede publicar como "Ahorita Editorial", solo un admin de plataforma puede; borrador invisible para terceros/anon, visible para su dueño; publicado visible para anon; texto de más de 500 caracteres rechazado por la base de datos; `published_at` idéntico antes y después de ocultar-y-republicar (protección real, no solo de frontend); "Editado" pasa de falso a verdadero exactamente cuando corresponde (verificado con una edición real de contenido posterior a la primera publicación).

**Capa de datos y frontend.** `src/lib/publications.js` (CRUD + `describePublicationError`), extensión de `src/lib/interactions.js` (me gusta/guardado sobre Publicaciones, reutilizando `interactions` sin ninguna migración — `target_type` ya era texto libre). `src/lib/feed.js`: se agregó la segunda fuente real; el criterio de orden de `mergeFeedSources` cambió de "fecha ascendente" a "distancia absoluta respecto a ahora" — necesario porque una Publicación (pasado reciente) y un Evento (futuro) no son comparables por valor crudo; con una sola fuente (solo eventos, todos futuros) el resultado es idéntico al del Bloque 1, confirmado por su misma batería de pruebas sin cambios. `src/features/feed/PublicationFeedCard.jsx` (tarjeta separada de `FeedCard` a propósito, con etiqueta de tipo "Publicación" e insignia de verificación del autor — la jerarquía visual mínima exigida desde el primer momento en que conviven dos tipos). `src/features/profile/PublicationComposerSheet.jsx` (composer ligero tipo BottomSheet, con vista previa inline, contador de caracteres, y las acciones publicar/guardar borrador/ocultar/eliminar). `src/features/profile/PublicationsSection.jsx` (el "muro" del Centro del Negocio: los tres estados visibles para quien administra, solo publicado para un visitante). `src/pages/admin/AdminEditorialPage.jsx` + entrada en `AdminPage.jsx` (Ahorita Editorial reutiliza el mismo composer y la misma sección, actor fijo, gate por `is_admin()`).

**Pruebas.** Build y lint limpios. Playwright (`test_fase4_bloque2.js`, 3 escenarios): feed mezcla Evento y Publicación con jerarquía visual e insignia de verificación; sin publicaciones el feed sigue mostrando solo eventos sin error (reversión/compatibilidad); un visitante sin publicaciones publicadas no ve la sección montada. Regresión completa de las Fases 1-3 y del Bloque 1 (Entregas 1-7 más `test_actor_profile.js`, `test_actor_edit.js`, `test_centro_negocio.js`, `test_hours_catalog_editor.js`, `test_fase4_bloque1.js`, `test_regression.js`) sigue pasando — se detectó y corrigió, en los archivos de prueba de sesiones anteriores (no en el código de producto), la falta de un mock para la nueva llamada a `publications` que ahora hace toda carga de `/actor/:id` e Inicio; una falla puntual de temporización en el escenario de doble-toque de la Entrega 6 se confirmó nuevamente como inestabilidad del entorno (mismo patrón ya documentado en la Entrega 7: cero archivos relacionados modificados, repetición aislada limpia).

**Interacciones habilitadas.** Me gusta y guardar, reutilizando `interactions` sin ninguna migración. Comentarios quedan, a propósito, fuera de alcance (Fase 5B). "Compartir" como interacción registrada queda para el Bloque 4 de esta misma fase.

**Resultado visible para el usuario.** Un negocio verificado publica una novedad real desde su Centro del Negocio sin que se sienta un formulario administrativo; Inicio combina eventos y publicaciones con jerarquía visual clara; "Ahorita Editorial" puede publicar contenido curado del equipo, siempre identificable como tal.

**Deuda técnica.** Ninguna nueva. Sigue pendiente, a propósito, el canje físico validado de Promoción (Fase 9) y la eventual consolidación de `events` sobre el núcleo compartido (criterio de revisión sin cambios respecto al Bloque 1).

### Bloque 3 — Promociones alimentan el Feed

**Objetivo.** Construir el núcleo real de Promoción (subtipo "promoción") sobre el mismo núcleo de Publicación del Bloque 2, e integrarla como tercera fuente del contrato del Bloque 1 — un beneficio comercial real y vigente, nunca contenido patrocinado ni un evento con fecha de asistencia.

**Hallazgo de seguridad encontrado y corregido como parte de este bloque (no reabre la arquitectura del Bloque 2).** La política RLS de `update` de `publications` (Bloque 2) nunca volvía a comprobar la verificación del actor después de la creación — un negocio que perdía su verificación podía, en teoría, publicar un borrador existente o reactivar contenido oculto, contradiciendo la regla de producto ya aprobada para pérdida de verificación. Se corrigió con un trigger adicional, `enforce_publication_publish_authorization()`, que bloquea específicamente la transición `borrador/oculto → publicado` cuando el actor ya no puede autorar contenido de ese subtipo — aplica por igual a Publicación y a Promoción. Editar, ocultar o eliminar contenido ya existente sigue sin exigir verificación vigente, tal como se aprobó.

**Ajustes de producto incorporados antes de implementar** (aprobados junto con el diseño): (1) ventana de anticipación de 24 horas antes de `starts_at`, mostrando "Empieza hoy"/"Empieza mañana" — nunca semanas antes, nunca confundida con "vigente"; (2) el orden del Feed reutiliza el mismo criterio de distancia a "ahora" del Bloque 1/2 sin ningún algoritmo nuevo — Promoción calcula su propio `sortAt` según su fase (`starts_at` mientras está por empezar, `ended_early_at` o `ends_at` mientras está vigente o recién finalizada); (3) sin "Quiero ir" — esa interacción pertenece a Eventos; Promoción solo tiene me gusta/guardar/compartir; (4) restricciones siempre visibles, nunca detrás de un desplegable; (5) el beneficio se exige como frase completa comprensible (mínimo 10 caracteres a nivel de base de datos, nunca un token suelto como "50%"), preparando además el terreno para la futura Guía IA; (6) contexto temporal doble siempre junto — "Publicado hace…" y "Válido hasta…" nunca se reemplazan entre sí; (7) ventana de gracia de 3 horas después de `ends_at` mostrando "Finalizó hace…" antes de desaparecer del Feed público — deliberadamente más corta que la ventana de anticipación (mirar hacia adelante tiene utilidad real; mirar hacia atrás es solo una cortesía de cierre).

**Migración.** `supabase/migrations/0031_fase4_bloque3_promociones.sql`: se amplía el `check` de `subtype` en `publications` para admitir `'promocion'`; detalle `promotion_details` (título, beneficio, condición de canje, restricciones, vigencia, precio opcional); `actor_can_author_promotion()` (Ahorita Editorial excluido permanentemente — un beneficio comercial no es contenido editorial); `actor_can_author_publication_of_subtype()` enruta la autorización de creación por subtipo; `enforce_publication_publish_authorization()` (el trigger del hallazgo, ver arriba); `promotion_status(publication_id, at)` — única fuente de verdad computada (mismo patrón que `business_open_status()`) con seis fases: `borrador`, `oculto`, `programada_lejana`, `programada_proxima` (<24h), `vigente`, `finalizada_reciente` (<3h) y `finalizada`; `list_feed_promotions()` — función pública estrecha que solo expone las fases visibles públicamente; protección de inmutabilidad de `ended_early_at` una vez fijado. `events` y `publications`/`publication_posts` (Bloque 2) no se modificaron en su comportamiento existente.

**Verificado contra Postgres 16 real** (roles de bajo privilegio, nunca superusuario): negocio con verificación vigente crea y publica con éxito; negocio sin verificación rechazado al crear (incluso en borrador); "Ahorita Editorial" rechazado siempre, sin excepción; beneficio de menos de 10 caracteres rechazado por la base de datos; `ends_at` anterior o igual a `starts_at` rechazado; un negocio que **pierde** la verificación después de crear contenido (simulado con la transición real `aprobado → vencido`, que por diseño de Fase 2 solo puede ejecutar `service_role`) queda bloqueado al intentar publicar una promoción en borrador o reactivar una publicación oculta — mensaje exacto "No tienes verificación vigente para publicar o reactivar este contenido" — pero conserva la capacidad de editar el contenido y eliminarlo sin verificación; `promotion_status()` verificado en sus seis fases mediante manipulación directa de `starts_at`/`ends_at`; `ended_early_at` verificado inmutable (un intento posterior de volverlo `null` no tiene efecto); `list_feed_promotions()` verificado devolviendo únicamente promociones en fase pública, nunca borrador/oculto.

**Capa de datos y frontend.** `src/lib/promotions.js` (CRUD completo + `describePromotionError`), `src/lib/time.js` (`formatPromotionStartLabel`, `formatPromotionEndLabel`, `formatPromotionFinishedLabel`), extensión de `src/lib/interactions.js` (me gusta/guardado sobre Promociones con su propio `target_type`, sin "quiero_ir"). `src/lib/feed.js`: tercera fuente real vía `mapPromotionToFeedItem`, con `sortAt` calculado por fase tal como exige el ajuste 2. `src/features/feed/PromotionFeedCard.jsx` (tarjeta propia, etiqueta "Promoción", insignia de verificación, beneficio y condición de canje siempre visibles, restricciones siempre visibles, doble etiqueta temporal). `src/features/profile/PromotionComposerSheet.jsx` (composer con vista previa inline, sección opcional de precio, y las acciones publicar/guardar borrador/finalizar anticipadamente/ocultar/eliminar). `src/features/profile/PromotionsSection.jsx` (el "muro" de Promociones del Centro del Negocio, agrupando los estados calculados en las cinco etiquetas relevantes para quien administra: Borrador, Programada, Vigente, Finalizada, Oculta). `src/pages/ActorProfilePage.jsx` monta `PromotionsSection` junto a `PublicationsSection`.

**Corrección visual encontrada y resuelta durante la propia verificación (afecta también al Bloque 2).** La etiqueta de tipo ("Promoción"/"Publicación") se posicionaba siempre en absoluto sobre la tarjeta; cuando el contenido no tiene imagen, el contenido de texto también empieza en la esquina superior y quedaba superpuesto e ilegible bajo la etiqueta. Se corrigió en `PromotionFeedCard.jsx` y en `PublicationFeedCard.jsx` (Bloque 2): la etiqueta pasa a fluir en el documento (no superpuesta) exactamente cuando no hay imagen, sin cambiar en absoluto el caso con imagen ya probado.

**Pruebas.** Build y lint limpios. Playwright (`test_fase4_bloque3.js`, 5 escenarios): el Feed muestra la Promoción completa (tipo, insignia, beneficio como frase completa, condición de canje, restricciones siempre visibles, ambas etiquetas temporales juntas); sin botón de comentarios ni "Quiero ir" en la tarjeta de Promoción; una promoción programada dentro de la ventana de 24 horas muestra su propia etiqueta "Empieza…"; sin promociones el Feed sigue funcionando con normalidad; un visitante sin promociones públicas no ve la sección montada en el Centro del Negocio. Regresión completa (Entregas 1-7, Bloques 1-2, `test_regression.js`) sigue pasando — se agregaron mocks para `rpc/actor_can_author_promotion` (en todos los archivos de prueba que cargan `/actor/:id`) y `rpc/list_feed_promotions` (en el único archivo que carga Inicio sin el mock genérico), siguiendo el mismo patrón ya usado en el Bloque 2; la misma inestabilidad de temporización ya documentada en el escenario de doble-toque de la Entrega 6 se confirmó de nuevo como ruido del entorno (cero archivos relacionados modificados, repetición aislada limpia con una sola escritura).

**Interacciones habilitadas.** Me gusta, guardar y compartir, reutilizando `interactions` con `target_type = 'promocion'`. Sin comentarios, sin check-in, sin QR, sin "quiero ir" — deliberadamente, esa última pertenece solo a Eventos.

**Resultado visible para el usuario.** Un negocio verificado publica un beneficio real y vigente desde su Centro del Negocio; Inicio combina eventos, publicaciones y promociones con jerarquía visual clara y un único criterio temporal de orden; una promoción por empezar se anuncia con antelación honesta, y una promoción recién finalizada se despide con un cierre honesto antes de desaparecer.

**Deuda técnica.** Ninguna nueva. Sigue pendiente, a propósito, el canje físico validado de Promoción (Fase 9) y la eventual consolidación de `events` sobre el núcleo compartido (criterio de revisión sin cambios respecto al Bloque 1).

### Bloque 4 — Compartidos fortalecen el Feed

**Objetivo.** Convertir cada acción real de compartir (Evento, Publicación, Promoción, Perfil de persona o negocio) en una señal medible dentro de `interactions`, sin cambiar en absoluto la experiencia nativa de compartir del usuario. Alcance deliberadamente pequeño e instrumental — no es un rediseño de la Fase 4, es la pieza final del contrato de contenido abierto en el Bloque 1.

**Sin migración nueva.** `interactions` ya estaba preparada para esto desde el Bloque 1 de la Fase 1 (migración `0015`): `'compartir'` ya vivía en el `check` de `type`, `target_type`/`target_id` ya eran genéricos (sin FK, para admitir cualquier tipo de contenido), y el `unique(actor_id, type, target_type, target_id)` ya existía. Compartir el mismo contenido varias veces nunca crea una fila nueva — la señal significa "esta persona ha compartido este contenido al menos una vez", nunca una cuenta de repeticiones. Las políticas RLS de insertar/borrar (solo el dueño del actor) tampoco cambiaron: ya eran exactamente lo que este bloque necesitaba.

**Semántica elegida para "compartir".** Es una señal de interés suficiente para recomendar algo a otra persona — más peso que una simple visualización, pero nunca equivale automáticamente a calidad o confianza, y nunca puede superar la señal de verificación. No se usa todavía para ranking ni recomendaciones (eso es Fase 6/7); por ahora es solo una interacción registrada, documentada para cuando la Guía IA la necesite.

**Comportamiento del compartir, deliberadamente distinto al de me gusta/guardar.** Compartir NUNCA se bloquea por falta de sesión — un invitado comparte exactamente igual que un usuario con sesión (a diferencia de me gusta/guardar, que sí exigen iniciar sesión y redirigen a `/login`). La interacción solo se registra cuando existe una sesión real; sin sesión, el compartir nativo ocurre igual, pero no se registra nada. Un fallo al registrar la interacción nunca interrumpe ni revierte el compartir que ya ocurrió — el compartir ya pasó, el registro es una señal secundaria y silenciosa.

**Momento exacto del registro.** Solo después de que `navigator.share` confirme éxito, o (sin `navigator.share`) después de que copiar el enlace tenga éxito. Cancelar el diálogo nativo (`AbortError`) nunca es un error y nunca se registra ni se muestra mensaje. Un fallo real de `navigator.share` (no cancelación) sí muestra un mensaje breve y no técnico. Un conflicto de unicidad al registrar (segundo intento sobre el mismo contenido) se trata como el resultado esperado, nunca como un error visible.

**Componentes unificados.** Un único hook, `src/hooks/useShareContent.js`, reemplaza las cuatro implementaciones casi idénticas de `handleShare` que existían por separado en `FeedCard.jsx` (Evento), `PublicationFeedCard.jsx`, `PromotionFeedCard.jsx` y `ActionBar.jsx` (Perfil) — ninguna de las cuatro registraba antes ninguna señal. De paso, Compartir en `ActionBar.jsx` dejó de vivir solo dentro del bloque `{business && ...}`: antes una persona no tenía forma de compartir su propio perfil; ahora se renderiza siempre, para persona y para negocio por igual.

**Contadores.** No se agregó ningún contador visible de "compartidos" en esta fase — ni en las tarjetas del Feed ni en el perfil. Se decidió así deliberadamente: Me gusta y Guardar ya cumplen el rol de métrica social visible, y agregar un tercer número no aportaría valor real, solo ruido (ver `AI_PHILOSOPHY.md` y los Principios de Evolución de Producto de `FASE4_CONTRATO_ARQUITECTONICO.md` — "nunca mecanismos artificiales de retención", "una sola frase clara"). La interacción se registra siempre; se muestra en cero superficies por ahora.

**Verificado contra Postgres 16 real** (roles de bajo privilegio, nunca superusuario, usando el esquema ya existente sin ninguna migración): un actor comparte un Evento y registra con éxito; un segundo intento sobre el mismo contenido no duplica la fila (choca contra el `unique` ya existente, tratado como éxito, no como error); comparte Publicación, Promoción y Perfil (actor) por igual; no puede registrar compartir a nombre de otro actor (RLS lo bloquea); no puede borrar una interacción ajena (0 filas afectadas); sí puede borrar la propia.

**Capa de datos y frontend.** `src/lib/interactions.js`: `registerShare({viewerProfileId, targetType, targetId})` — inserta y trata el código `23505` (conflicto de unicidad) como éxito idempotente, nunca como error. `src/hooks/useShareContent.js`: el hook único descrito arriba. `FeedCard.jsx`, `PublicationFeedCard.jsx`, `PromotionFeedCard.jsx`, `ActionBar.jsx`: cada uno reemplaza su `handleShare` propio por una llamada al hook, conservando exactamente el mismo `title`/`text`/`url` que ya compartían antes (cero cambio en qué se comparte, solo en que ahora se registra).

**Corrección aplicada de paso (afecta también al Bloque 2/3).** El mismo ajuste de la etiqueta de tipo del Bloque 3 (fluir en el documento cuando no hay imagen, en vez de superposición absoluta) ya estaba aplicado a ambas tarjetas; no fue necesario nada adicional para Compartir en sí.

**Hallazgo encontrado durante las pruebas de este bloque, fuera de su alcance, sin decidir un arreglo todavía.** Al probar Compartir en una Publicación sin imagen y con texto corto, se descubrió que el riel de acciones (Me gusta/Compartir/Guardar) de `PublicationFeedCard.jsx` y `PromotionFeedCard.jsx` puede quedar parcial o totalmente recortado por el `overflow: hidden` de la tarjeta cuando el contenido sin imagen es más corto que el desplazamiento vertical (`bottom`) del riel — el riel de acciones asume una tarjeta alta (como con imagen), pero sin imagen la tarjeta se ajusta a su contenido, que puede ser mucho más corto. Confirmado con mediciones reales: en una Publicación corta, "Me gusta" queda 100% fuera del área visible/clickeable y "Compartir" también; en una Promoción típica (con más campos de texto), "Compartir" cae apenas dentro del borde, funcionando por un margen mínimo, no de forma robusta. Esto es un defecto preexistente del Bloque 2 (nunca antes se había hecho clic específicamente en esos botones sobre contenido corto sin imagen en una prueba automatizada), no algo introducido por este bloque, y no se decidió una solución unilateralmente porque implica una decisión de diseño real con varias alternativas válidas (aumentar la altura mínima de la tarjeta sin imagen, permitir que el riel fluya visible fuera de la tarjeta, o mover el riel a una fila estática debajo del texto). Queda documentado para que el Product Owner decida el criterio antes de tocar el código.

**Pruebas.** Build y lint limpios. Playwright (`test_fase4_bloque4.js`, 11 escenarios más una verificación adicional de no-redirección): `navigator.share` disponible completa y registra; cancela sin mostrar error; fallo real de `navigator.share` sí muestra mensaje; fallback de copiar enlace con éxito registra igual que un share nativo; fallback de copiar enlace con fallo muestra mensaje; visitante comparte sin bloqueo y sin registrar, nunca redirige a login; segundo intento sobre el mismo contenido nunca se muestra como error; Publicación, Promoción, Perfil de persona (ahora con Compartir, antes ausente) y Perfil de negocio (sigue funcionando junto a Guardar/Llamar/WhatsApp/Cómo llegar) comparten y registran por igual con el mismo hook. Regresión completa de Fases 1-3 y Bloques 1-3 sigue pasando sin cambios de mocks (el registro de compartir usa las mismas rutas de `interactions` ya mockeadas desde la Entrega 6; la misma inestabilidad de doble-toque de la Entrega 6 se confirmó de nuevo como ruido de entorno).

**Interacciones habilitadas.** Compartir, con registro real, en las cinco superficies: Evento, Publicación, Promoción, Perfil de persona, Perfil de negocio.

**Resultado visible para el usuario.** Ninguno nuevo, a propósito — el botón "Compartir" se ve y se comporta exactamente igual que antes en Evento/Publicación/Promoción; la única diferencia observable es que ahora también aparece en el perfil de una persona (antes solo existía para negocios).

**Deuda técnica.** El hallazgo de recorte del riel de acciones en tarjetas cortas sin imagen (ver arriba), pendiente de una decisión de diseño antes de corregirse. Sigue pendiente, además y sin cambios, el canje físico validado de Promoción (Fase 9) y la eventual consolidación de `events` sobre el núcleo compartido.

### Corrección del hallazgo del Bloque 4 — fila estática de acciones en Publicación/Promoción

**Objetivo.** Corrección puntual, aprobada explícitamente, del hallazgo de recorte del riel de acciones documentado arriba. Alcance estrictamente acotado a la solución elegida por el Product Owner: no reabre la arquitectura de Compartir ni de las tarjetas, no toca `FeedCard.jsx` (Eventos nunca tuvo este problema, su tarjeta usa una altura fija en `svh`, no determinada por el contenido).

**Solución aplicada.** Me gusta, Compartir y Guardar dejan de vivir en el riel flotante `SocialActions` (pensado para tarjetas altas con imagen, posicionado con un desplazamiento vertical fijo desde el fondo) y pasan a `ContentActionsRow` — una fila horizontal nueva, compartida entre `PublicationFeedCard.jsx` y `PromotionFeedCard.jsx`, que vive siempre en el flujo normal del documento, justo después del bloque de contenido (foto+texto o solo texto), nunca superpuesta ni flotante. Al no depender de ningún desplazamiento vertical fijo ni de una altura mínima artificial, la fila nunca puede quedar fuera del área visible/clickeable — el contenido puede ser tan corto o tan largo como sea, con imagen o sin ella, y la fila siempre aparece justo debajo, con su propio fondo (`COLORS.surface`) y un borde superior sutil que la separa del contenido sin competir visualmente con la etiqueta de tipo ni con el nombre del autor (que siguen arriba, en su posición original).

**`src/features/feed/ContentActionsRow.jsx` (nuevo).** Componente único reutilizado por ambas tarjetas — evita la duplicación que hubiera significado escribir la misma fila dos veces. Reutiliza los mismos íconos (`Heart`, `Send`, `Bookmark` de `lucide-react`) y el mismo lenguaje tipográfico (`TYPE.metadata`) que ya usaba `SocialActions`, ahora en un layout horizontal con área táctil de 44px de alto por botón. Me gusta y Guardar muestran estado activo (ícono relleno + `aria-pressed`) y estado ocupado (opacidad reducida + `disabled` mientras hay una petición en curso, para no permitir doble clic); Compartir es una acción simple, sin estado persistente.

**Verificado.** Build y lint limpios. Playwright (`test_fase4_bloque4_fix.js`, 9 escenarios): las seis combinaciones exigidas (Publicación/Promoción × corta sin imagen/larga sin imagen/con imagen) confirman los tres controles completamente visibles y clickeables — verificado no solo por presencia en el DOM, sino comprobando con `elementFromPoint` que el punto central de cada botón realmente resuelve a ese botón (no a otro elemento superpuesto o a un ancestro con overflow que lo recorte); estado activo/inactivo de Me gusta se confirma con un clic real que cambia `aria-pressed` de `"false"` a `"true"`; estado ocupado se confirma con una petición que nunca resuelve, comprobando que el botón queda `disabled`; y se confirma que la fila de acciones aparece siempre por debajo de la etiqueta de tipo y del nombre del autor, nunca superpuesta. Regresión completa: Eventos (`test_fase4_bloque1.js`, `test_regression.js`), Publicaciones (`test_fase4_bloque2.js`), Promociones (`test_fase4_bloque3.js`) y Compartir (`test_fase4_bloque4.js`, los 11 escenarios + verificación de no-redirección) siguen pasando sin cambios de mocks ni de aserciones.

**Resultado visible para el usuario.** Me gusta, Compartir y Guardar ahora se ven y funcionan de forma idéntica y predecible en cualquier Publicación o Promoción, sea cual sea el largo de su texto o si tiene imagen — antes, en el peor caso (Publicación corta sin imagen), esos tres controles eran completamente invisibles e inalcanzables.

**Deuda técnica.** Ninguna nueva — este bloque cierra la deuda documentada en el hallazgo del Bloque 4.

---

## FASE 4 CERRADA — Contenido social ampliado, el Feed como centro (2026-07-19)

Cierre formal de la Fase 4 completa del `MASTERPLAN.md`, aprobado explícitamente tras completar los cuatro bloques y la corrección del hallazgo pendiente. Checkpoint de Git: tag `checkpoint-fase4-feed-social`.

### Resumen ejecutivo

La Fase 4 amplió el contenido del Feed más allá de los Eventos, sin tocar nunca el sistema que ya funcionaba. A diferencia de las tres fases anteriores (pensadas desde el modelo de datos hacia afuera), esta fase se rediseñó tres veces antes de implementarse hasta quedar ordenada mentalmente alrededor del Feed, no de la base de datos — decisión documentada en detalle en `FASE4_CONTRATO_ARQUITECTONICO.md`. El resultado: el Feed pasó de mostrar un solo tipo de contenido (Eventos) a combinar cuatro fuentes con jerarquía visual clara y un único criterio de orden compartido, y "compartir" —reservado desde la Fase 1 pero nunca conectado— se convirtió en una señal real y medible en las cinco superficies del ecosistema.

### Objetivo original y resultado final

**Objetivo original** (`MASTERPLAN.md`, antes del rediseño): agregar Publicaciones y Promociones como contenido social ampliado sobre el núcleo de Actor ya construido en la Fase 3.

**Resultado final**, tras el rediseño aprobado bajo `PRODUCT_MANIFESTO.md`/`PRODUCT_STRATEGY.md`: se cumplió ese objetivo y además se estableció un principio permanente para toda fase futura — **nunca migrar un sistema estable antes de validar completamente el nuevo**. `events` nunca se tocó; en su lugar, se construyó primero la capacidad del Feed de combinar múltiples fuentes (Bloque 1), probada exclusivamente con Eventos, y solo después se le agregaron Publicaciones (Bloque 2), Promociones (Bloque 3) y, por último, la señal de Compartir sobre las cinco superficies del ecosistema (Bloque 4). El objetivo se amplió, no se redujo: la fase entrega más de lo que pedía el plan original, con una arquitectura más honesta sobre cuál es realmente el centro del producto.

### Bloques implementados

1. **Bloque 1 — El Feed como contrato central** (2026-07-18): `mapEventToFeedItem` extraído con `sortAt` como criterio de orden compartido, y `mergeFeedSources(...sources)` — el contrato de composición multi-fuente, probado con una sola fuente real (Eventos) para que el resultado fuera idéntico al feed anterior. Sin migración. Cero diferencia observable para el usuario, criterio de aceptación explícito.
2. **Bloque 2 — Publicaciones alimentan el Feed** (2026-07-19): núcleo `publications`+`publication_posts` (migración `0030`), con cinco ajustes de producto (protección contra publicaciones accidentales, límite de 500 caracteres exigido por la base de datos, edición transparente, pérdida de verificación no retroactiva, preparación de permalink satisfecha por construcción). Segunda fuente real del Feed, con el criterio de orden cambiando de "fecha ascendente" a "distancia absoluta a ahora".
3. **Bloque 3 — Promociones alimentan el Feed** (2026-07-19): detalle `promotion_details` sobre el mismo núcleo (migración `0031`), `promotion_status()` como única fuente de verdad computada (seis fases), con siete ajustes de producto (ventana de anticipación de 24h, sin algoritmo nuevo de orden, sin "Quiero ir", restricciones siempre visibles, beneficio como frase completa, doble contexto temporal, ventana de gracia de 3h al finalizar). Corrigió además, como parte del propio bloque, un hallazgo de seguridad heredado del Bloque 2.
4. **Bloque 4 — Compartidos fortalecen el Feed** (2026-07-19): "compartir" (reservado en `interactions` desde la Fase 1, nunca usado) conectado a Evento, Publicación, Promoción y Perfil (persona y negocio) mediante un único hook (`useShareContent`), sin ninguna migración nueva. Encontró y documentó, sin decidir unilateralmente, un hallazgo de layout heredado del Bloque 2 (riel de acciones recortado en contenido corto sin imagen) — corregido después, con aprobación explícita separada, mediante `ContentActionsRow`.

### Funcionalidades visibles construidas

- Inicio combina Eventos, Publicaciones y Promociones en un solo Feed, cada tipo siempre distinguible por su propia etiqueta y tratamiento visual, ordenados por un único criterio compartido (distancia temporal a "ahora").
- Un negocio verificado publica novedades reales (texto + imagen opcional) desde su Centro del Negocio, sin que se sienta un formulario administrativo; puede editarlas, ocultarlas y ver honestamente cuándo fueron editadas.
- "Ahorita Editorial" publica contenido curado del equipo, siempre identificable como tal, usando el mismo composer que cualquier negocio.
- Un negocio verificado publica promociones reales y vigentes, con beneficio siempre expresado como frase completa, condición de canje clara, restricciones siempre visibles, y contexto temporal doble ("Publicado hace…" + "Válido hasta…").
- Una promoción por empezar se anuncia con antelación honesta ("Empieza hoy/mañana"); una que acaba de finalizar se despide con un cierre honesto ("Finalizó hace…") antes de desaparecer.
- Compartir (nativo del dispositivo, o copiar enlace como respaldo) funciona igual que siempre en Evento, Publicación y Promoción, y ahora también existe en el perfil de cualquier persona (antes solo en negocios) — visible para cualquiera, con o sin sesión.
- Me gusta, Compartir y Guardar en Publicación/Promoción se ven y funcionan de forma idéntica y predecible sea cual sea el contenido, gracias a la corrección final del bloque.

### Arquitectura lograda

- **El Feed como contrato de composición, no como consulta ad hoc**: `mergeFeedSources` es el único punto donde las fuentes se combinan; cada fuente nueva solo necesita producir items en la forma común y calcular su propio `sortAt` — nunca hubo que tocar el criterio de orden ya probado al agregar Publicaciones, Promociones o (en el futuro) cualquier otra fuente.
- **Un solo criterio de orden para contenido de naturaleza distinta**: "distancia absoluta a ahora" resuelve, con una sola fórmula, que un Evento futuro, una Publicación reciente y una Promoción vigente convivan de forma coherente — sin ranking, sin personalización, estrictamente cronológico por diseño de esta fase.
- **Núcleo genérico + detalle por subtipo, extendido por segunda vez**: `publications` (núcleo) + `publication_posts`/`promotion_details` (detalle) repite exactamente el patrón que `event_details` inauguró en la Fase 1 — Promoción se agregó ampliando un `check` existente, sin ninguna tabla nueva de núcleo.
- **Autorización de creación centralizada y reutilizada, no reinventada por subtipo**: `actor_can_author_publication_of_subtype()` enruta por subtipo hacia `actor_can_author_publication()`/`actor_can_author_promotion()`, ambas apoyadas en `actor_verification_badge()` (Fase 3) — ninguna regla de verificación se escribió dos veces.
- **Funciones públicas de alcance estrecho, patrón ya consolidado en la Fase 3, extendido a contenido con vigencia**: `promotion_status()` (mismo patrón que `business_open_status()`) y `list_feed_promotions()` (mismo patrón que `search_actors()`) calculan y exponen exactamente lo necesario, nunca la tabla completa.
- **`interactions` (Fase 1, Bloque 1) demostró estar completa desde el origen**: ni "compartir" como tipo, ni la deduplicación por `unique(actor_id, type, target_type, target_id)`, necesitaron ninguna migración cuatro fases después — la arquitectura fundacional sostuvo un caso de uso que no se construyó hasta ahora.
- **Un solo hook para una acción que vive en cuatro superficies**: `useShareContent` reemplazó cuatro implementaciones casi idénticas y sin señal real — el mismo patrón de consolidación que ya demostró su valor con `useActorSocialState` en la Fase 3.
- **Componentes de tarjeta separados por tipo, nunca un componente monolítico con condicionales**: `FeedCard`/`PublicationFeedCard`/`PromotionFeedCard` cada uno con su propia forma, compartiendo solo lo que genuinamente es común (`ContentActionsRow`, `SocialActions`, `VerificationBadge`).

### Decisiones de producto incorporadas

- Nunca migrar `events` al nuevo núcleo al inicio de la fase — validar primero el núcleo nuevo con uso real, evaluar la consolidación como una decisión futura y separada.
- Reordenar los bloques de la fase alrededor del Feed (no de la base de datos) tras un ejercicio de arquitectura dedicado, adoptando el Feed como centro explícito de la fase.
- Cinco ajustes de autenticidad y transparencia para Publicaciones (protección contra accidentes, límite de 500 caracteres, edición transparente, pérdida de verificación no retroactiva, permalink satisfecho por construcción).
- Siete ajustes de producto para Promociones (ventana de 24h, sin algoritmo nuevo de orden, sin "Quiero ir", restricciones siempre visibles, beneficio como frase completa, doble contexto temporal, ventana de gracia de 3h).
- Nueve reglas de comportamiento para Compartir (nunca bloquea al invitado, solo registra con sesión real, cancelar nunca es error, un fallo al registrar nunca revierte el compartir, segundo intento nunca se muestra como error, un único hook, Compartir habilitado también para personas, señal fuera de ranking por ahora, sin contador visible en ninguna superficie).
- Corrección de dos hallazgos encontrados durante la propia implementación, ambos documentados y corregidos con aprobación explícita separada en vez de decididos en silencio: el vacío de re-verificación al republicar/reactivar contenido (Bloque 3), y el recorte del riel de acciones en contenido corto sin imagen (cierre del Bloque 4).
- Se incorporó formalmente un quinto pilar de producto — **Economía local** — a los "Principios de Evolución de Producto" de `FASE4_CONTRATO_ARQUITECTONICO.md`, junto con tres reglas permanentes nuevas: el usuario debe volver por el valor que encuentra, nunca por retención artificial; toda funcionalidad debe explicarse en una sola frase clara; la ciudad siempre tiene prioridad sobre la plataforma.

### Relación con `PRODUCT_MANIFESTO.md` y `PRODUCT_STRATEGY.md`

Esta fue la primera fase en construirse bajo la autoridad de ambos documentos, aprobados justo después del cierre funcional de la Fase 3. El `PRODUCT_MANIFESTO.md` estableció que **el corazón de Ahorita es la Guía IA — la personificación del criterio local**, y que todo módulo del ecosistema (incluido el Feed) existe para producir material útil para ella, no para competir entre sí. La Fase 4 tradujo ese principio en arquitectura concreta: el Feed se convirtió en el punto único donde converge todo el contenido que la futura Guía IA (Fase 7) observará, y cada bloque se diseñó preguntando explícitamente qué señal nueva le aporta (ver más abajo). `FASE4_CONTRATO_ARQUITECTONICO.md`, subordinado a ambos, tradujo esa autoridad en el contrato técnico que gobernó los cuatro bloques — ningún bloque se implementó sin que su diseño rindiera cuentas primero a ese contrato.

### Cómo la Fase 4 fortalece los cinco pilares del producto

- **Descubrimiento.** El Feed ya no depende de una sola fuente: un usuario descubre eventos, novedades reales de negocios y beneficios vigentes en el mismo lugar, sin cambiar de pantalla ni de mentalidad.
- **Confianza.** Publicaciones y Promociones heredan directamente el sistema de verificación de la Fase 2/3 (solo un negocio verificado puede publicar contenido nuevo) y lo extienden con una regla nueva y explícita: perder la verificación nunca borra el pasado, pero sí impide publicar o reactivar contenido nuevo hasta recuperarla — confianza sin castigar retroactivamente a nadie.
- **Hábito diario.** Publicaciones y Promociones le dan al usuario una razón real para volver a Inicio más de una vez al día — no un evento programado con semanas de anticipación, sino algo que puede estar pasando ahorita mismo en un negocio real.
- **Economía local.** Cada Publicación y cada Promoción es, literalmente, un negocio de Cuenca hablándole directo a su comunidad sin pagar por un espacio — el pilar que esta misma fase incorporó formalmente al contrato de producto.
- **Inteligencia de la Guía IA (futura).** Ver la sección siguiente — la Fase 4 no construye IA, pero le entrega tres tipos de señal nuevos que antes no existían.

### Problemas encontrados y cómo fueron resueltos

- **Bifurcación de secuenciación propuesta y rechazada** (antes del Bloque 1): mi primera propuesta migraba `events` al nuevo núcleo al inicio de la fase; el Product Owner la rechazó explícitamente ("nunca migres un sistema estable antes de validar completamente el nuevo") y exigió una re-arquitectura completa, que se convirtió en el `FASE4_CONTRATO_ARQUITECTONICO.md` definitivo.
- **Vacío de re-verificación al republicar/reactivar contenido** (encontrado durante el análisis del Bloque 3, antes de implementar): la RLS de `update` de `publications` (Bloque 2) nunca volvía a exigir verificación después de la creación — un negocio que perdía la verificación podía, en teoría, publicar un borrador existente o reactivar contenido oculto. Se propuso como un ajuste pequeño y aditivo dentro del Bloque 3 (no una reapertura de la arquitectura del Bloque 2), aprobado explícitamente, y corregido con `enforce_publication_publish_authorization()`, verificado con un escenario real de vencimiento contra Postgres 16.
- **Riel de acciones recortado en contenido corto sin imagen** (encontrado durante las pruebas del Bloque 4, no introducido por él): `SocialActions` asumía una tarjeta siempre alta; en Publicaciones/Promociones sin imagen y con poco texto, el riel quedaba parcial o totalmente fuera del área clickeable, recortado por `overflow: hidden`. Documentado sin decidir un arreglo unilateral (implicaba una decisión de diseño real con varias alternativas válidas), presentado con mediciones exactas, y corregido después con aprobación explícita separada mediante `ContentActionsRow` — una fila estática compartida, verificada en las seis combinaciones exigidas con `elementFromPoint`, no solo presencia en el DOM.
- **Errores de datos de prueba durante la verificación del Bloque 3** (no defectos de código): un primer intento de simular "verificación vencida" solo movía `expires_at` al pasado sin cambiar `status`, lo que `actor_verification_badge()` interpreta correctamente como "en gracia", no "vencida" — corregido simulando la transición real (`aprobado → vencido`) que solo puede ejecutar `service_role`, exactamente como lo hace la Edge Function real de la Fase 2.

### Confirmación de que Events permaneció intacto

`events`, `event_details`, `lib/events.js`, `EventSheet`, la administración de eventos (`/admin/eventos`) y todas las interacciones existentes sobre eventos (me gusta, comentarios, guardado, "Quiero ir"/"Ya fui") **no cambiaron su esquema, su RLS, ni su comportamiento en ningún bloque de la fase** — verificado explícitamente en cada bloque con la misma batería de pruebas de regresión (`test_fase4_bloque1.js` primero, y de ahí en adelante como parte de la regresión general), sin necesitar nunca una sola actualización de aserciones. El único cambio que tocó al Evento como tarjeta fue el Bloque 4 (`FeedCard.jsx` adoptó el hook `useShareContent` para registrar la señal de compartir) — un cambio aditivo de comportamiento interno, sin ninguna diferencia visible ni de esquema.

### Convivencia temporal entre Events y el núcleo de Publicaciones

Por diseño explícito del `FASE4_CONTRATO_ARQUITECTONICO.md`, `events` y el núcleo `publications` conviven como dos sistemas independientes durante toda la fase, unidos únicamente en el Feed a través del contrato de composición (`mergeFeedSources`) — nunca a nivel de base de datos. La eventual consolidación de `events` sobre el núcleo compartido de Publicación queda, a propósito, como **un punto de decisión futuro, explícitamente no resuelto en esta fase**: se evaluará formalmente solo después de que Publicaciones y Promociones acumulen un período real de uso en producción y demuestren que el modelo es correcto — nunca por inercia arquitectónica. Esta es la primera vez en el proyecto que una convivencia temporal entre dos sistemas se declara así de explícita desde el inicio, en vez de descubrirse como deuda después (principio 6 de "Evolución de Producto", incorporado en esta misma fase).

### Señales nuevas disponibles para la futura Guía IA

- **Promociones activas en tiempo real**, con su fase computada (`programada_proxima`/`vigente`/`finalizada_reciente`) — la variable "promociones activas" de la lista original de `AI_PHILOSOPHY.md` nace, literalmente, en esta fase.
- **Variedad real de contenido más allá de eventos** (Publicaciones + Promociones) — más superficie de "qué está pasando ahorita" sobre la que razonar, no solo lo programado con anticipación.
- **Compartir como señal de interés genuino**: más peso que una visualización pasiva, documentado explícitamente en `AI_PHILOSOPHY.md` (nueva sección "'Compartir' como señal, no como métrica de ranking") con sus límites igual de explícitos — nunca supera a la verificación, no se usa para ranking todavía.

Ninguna de estas señales se usa hoy para ranking, recomendación ni personalización — quedan registradas y documentadas para cuando la Fase 6 (Descubrimiento inteligente v2) y la Fase 7 (Guía IA v2) las necesiten, exactamente el mismo patrón ya usado con `actor_search_index` al cierre de la Fase 3.

### Deudas técnicas pendientes (consolidado, obligatorio documentar antes de producción)

- **Prueba end-to-end contra un proyecto Supabase real desplegado** (Auth+PostgREST+RLS+Storage+Edge Functions+triggers programados) — heredada desde la Fase 1, nunca resuelta en ningún bloque de ninguna fase por falta de Docker/Supabase real en este entorno de desarrollo.
- **Canje físico validado de Promoción** — reservado a propósito para la Fase 9 (QR y experiencias físicas); una Promoción de esta fase es un beneficio declarado, no un cupón validado en el punto de venta.
- **Todas las deudas técnicas heredadas de las Fases 1-3** siguen sin resolver y sin empeorar (ver `PROJECT.md`, secciones "FASE 1/2/3 CERRADA", y `ROADMAP.md`) — la Fase 4 no las tocó ni las agravó.
- **Concurrencia real del `unique` de `interactions` bajo el nuevo caso de uso de Compartir** — aproximada con inserción duplicada secuencial en Postgres real y Playwright, nunca probada con múltiples conexiones simultáneas genuinas (mismo límite ya documentado para me gusta/guardar desde la Fase 3, ahora extendido a compartir).

### Funcionalidades deliberadamente no construidas

- **Ranking, afinidad, personalización o contenido patrocinado en el Feed** — límite explícito y repetido en cada bloque de `FASE4_CONTRATO_ARQUITECTONICO.md`; el orden sigue siendo estrictamente cronológico por diseño, reservado para la Fase 6 y la Fase 11.
- **Contador visible de "compartidos"** en cualquier superficie — decisión deliberada del Bloque 4 para no agregar una tercera métrica social (Me gusta y Guardar ya cumplen ese rol) ni convertir compartir en una métrica de vanidad.
- **Notificaciones o analítica de negocio sobre Compartir** — explícitamente fuera de alcance del Bloque 4, sin adelantar trabajo de fases futuras.
- **Consolidación de `events` sobre el núcleo compartido de Publicación** — punto de decisión futuro explícito, no resuelto ni asumido en esta fase (ver "Convivencia temporal" arriba).
- **Moderación de contenido más allá de las reglas de autenticidad ya construidas** — reservada para la Fase 13.

### Dependencias habilitadas para las fases siguientes

- **El contrato de composición del Feed (`mergeFeedSources`) ya probado con tres fuentes reales** — cualquier fuente futura (Compartidos ya la usa como señal, Historias en la Fase 8, contenido patrocinado en la Fase 11) puede sumarse sin rediseñar el criterio de orden ya validado.
- **El patrón núcleo genérico + detalle por subtipo, ahora probado dos veces** (`event_details` en la Fase 1, `publication_posts`/`promotion_details` en esta fase) — cualquier subtipo de contenido futuro puede seguir el mismo patrón con confianza real, no teórica.
- **`useShareContent` y el registro de "compartir" en `interactions`** — la Fase 6 (recomendaciones) y la Fase 7 (Guía IA v2) heredan una señal de interés ya registrada y consistente en las cinco superficies, sin tener que instrumentarla de cero.
- **`promotion_status()` como función de vigencia computada, mismo patrón que `business_open_status()`** — cualquier futuro tipo de contenido con vigencia temporal (por ejemplo, ofertas de comercio en la Fase 10) puede replicar el mismo patrón de cálculo, ya probado en producción de código.
- **El "hallazgo" de `enforce_publication_publish_authorization()` deja un precedente de seguridad reutilizable** — cualquier tabla futura con el patrón "crear vs. reactivar" debe considerar explícitamente si la reactivación necesita re-validar las mismas condiciones que la creación.

### Criterios que demuestran que la Fase 4 puede considerarse funcionalmente terminada

1. Los cuatro bloques planificados están completos — cada uno propuesto, implementado, verificado contra Postgres 16 real (cuando aplicaba) y Playwright, y aprobado explícitamente por separado.
2. Los dos hallazgos encontrados durante la propia implementación (vacío de re-verificación, riel de acciones recortado) se documentaron con transparencia total y se corrigieron solo después de una aprobación explícita separada — ninguno se decidió en silencio ni quedó sin resolver.
3. `events` permaneció verificablemente intacto durante toda la fase — la misma batería de regresión (`test_fase4_bloque1.js` en adelante) nunca necesitó una sola actualización de aserciones sobre el comportamiento de eventos.
4. Build y lint quedaron limpios, sin advertencias nuevas, al cierre de cada bloque.
5. La regresión acumulada de Playwright de toda la fase (33 escenarios propios entre los cuatro bloques y su corrección, más la regresión completa de Fases 1-3 reejecutada en cada bloque) pasa sin fallas reales — la única inestabilidad observada (el mismo escenario de doble-toque de la Entrega 6 de la Fase 3) se reconfirmó como ruido de entorno, no una regresión de código.
6. Toda deuda técnica pendiente está identificada, nombrada explícitamente y documentada como requisito de pre-producción — ninguna quedó oculta o implícita.
7. El principio rector de la fase (nunca migrar un sistema estable antes de validar el nuevo) se sostuvo sin excepciones durante los cuatro bloques — `events` nunca se tocó, y su eventual consolidación queda como una decisión futura explícita, no una tarea pendiente por omisión.

### Listado de pruebas acumuladas

- `test_fase4_bloque1.js` — 5 escenarios (contrato de composición del Feed, sin migración).
- `test_fase4_bloque2.js` — 3 escenarios (Publicaciones en el Feed, compatibilidad sin publicaciones, sección no montada para visitante sin contenido).
- `test_fase4_bloque3.js` — 5 escenarios (Promoción completa en el Feed, sin comentarios/"Quiero ir", etiqueta de programada, compatibilidad sin promociones, sección no montada).
- `test_fase4_bloque4.js` — 11 escenarios + 1 verificación adicional de no-redirección (completar/cancelar/fallback de copiar enlace con éxito y fallo, invitado sin bloqueo y sin registro, segundo intento sin error, las cinco superficies).
- `test_fase4_bloque4_fix.js` — 9 escenarios (las seis combinaciones de contenido/imagen exigidas, verificadas con `elementFromPoint`; estado activo/inactivo; estado ocupado; no competencia visual con etiqueta/autor).
- Verificación directa contra Postgres 16 real con roles de bajo privilegio, repetida en cada bloque que tocó base de datos (Bloques 2, 3 y 4) — incluidos los escenarios de vencimiento real de verificación, RLS de compartir, y dedup por `unique`.
- Regresión completa de Fases 1-3 (Entregas 1-7 del Bloque C más `test_actor_profile.js`, `test_actor_edit.js`, `test_centro_negocio.js`, `test_entrega5.js`, `test_entrega6.js`, `test_entrega6_authortag.js`, `test_entrega7.js`, `test_hours_catalog_editor.js`, `test_regression.js`) reejecutada al cierre de cada bloque de esta fase, sin necesitar cambios de aserciones en ningún momento.
- Build y lint limpios verificados al cierre de cada bloque y de la corrección final.

### Commits principales de cada bloque

- `0176a57` — Fase 4, Bloque 1: el Feed como contrato central de composición multi-fuente.
- `6cfdb87` — Fase 4, Bloque 2: Publicaciones alimentan el Feed.
- `f116571` — Fase 4, Bloque 3: Promociones alimentan el Feed.
- `3db46a8` — Fase 4, Bloque 4: Compartidos fortalecen el Feed.
- `8cdb864` — Corrección: fila estática de acciones en Publicación/Promoción.

---

## VISIÓN MAESTRA ADOPTADA — Autoridad conceptual máxima del proyecto (2026-07-21)

Tras el cierre formal de la Fase 4, y antes de autorizar cualquier fase nueva del `MASTERPLAN.md`, el Product Owner solicitó una pausa estratégica completa del proyecto: ningún código, ninguna migración, ninguna funcionalidad nueva — únicamente un trabajo conceptual pensado desde los roles de fundador, Product Owner, diseñador de producto, experto en UX, estratega de negocio, arquitecto de producto e investigador de inteligencia artificial. El resultado de ese proceso es `VISION_MAESTRA.md`, adoptado en esta fecha como la **máxima autoridad conceptual de todo el proyecto**.

**Cuándo.** 2026-07-21, tras tres iteraciones explícitas: una versión inicial de análisis profundo sobre los trece temas solicitados (esencia, misión, visión a cinco años, filosofía, diferenciación, economía local, inteligencia artificial, cultura, comunidad, experiencia de usuario, descubrimiento, el usuario, y una revisión crítica), una segunda iteración que profundizó específicamente en el ciudadano como protagonista, la identidad editorial, la identidad completa de la Guía IA, la ciudad como organismo vivo, y una nueva filosofía de utilidad sobre atención, y una tercera iteración de revisión editorial (coherencia, fluidez, estructura, precisión conceptual) que resolvió además dos preguntas de diseño documental: mantener "ciudad" en vez de "territorio" (para no responder en silencio, con un cambio de vocabulario, la pregunta de expansión geográfica que el propio documento deja abierta), e incorporar un principio explícito de responsabilidad ética (accesibilidad, equidad de representación del criterio local, y el riesgo de que una recomendación exitosa dañe lo que recomienda).

**Por qué se creó.** Después de cuatro fases de construcción real, el proyecto había adquirido una identidad propia que ningún documento existente capturaba de forma unificada — cada uno definía una porción (el corazón, la inteligencia, el plan de ejecución), pero ninguno respondía, de una sola vez, qué es Ahorita en su esencia, para quién existe realmente, y qué contradicciones internas del propio proyecto merecían resolverse antes de seguir construyendo.

**Propósito y alcance.** Ser el punto de referencia único al que cualquier decisión futura de arquitectura, producto, experiencia de usuario, inteligencia artificial, monetización o crecimiento debe rendir cuentas. Es estrictamente conceptual y estratégico — no contiene arquitectura técnica, especificaciones de implementación ni fases de desarrollo.

**Cómo debe utilizarse en el futuro.** Antes de aprobar cualquier fase nueva del `MASTERPLAN.md`, verificar su coherencia explícita con `VISION_MAESTRA.md`. El producto se adapta a esta visión, nunca al revés — ninguna funcionalidad se justifica por precedente de otras aplicaciones ni por conveniencia puntual de una fase.

**Congelamiento.** Declarado explícitamente estable por el Product Owner. No se modifica por ideas nuevas aisladas ni por presión de una fase futura; cualquier cambio requiere una decisión estratégica explícita, con el mismo rigor de análisis que dio origen al documento.

**Jerarquía documental resultante**, en orden de autoridad: `VISION_MAESTRA.md` (máxima autoridad conceptual) → `PRODUCT_MANIFESTO.md` (principios de producto, subordinado) → `PRODUCT_STRATEGY.md` (materialización 2026-2028, subordinado al Manifesto) → `AI_PHILOSOPHY.md` y `ARCHITECTURE.md` (autoridades técnicas y de comportamiento de IA, ambas subordinadas a la Visión Maestra) → `MASTERPLAN.md` y los contratos de cada fase (planificación) → `ROADMAP.md`, `PROJECT.md` y `CHANGELOG.md` (documentación de lo ejecutado). Referencias actualizadas en `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `AI_PHILOSOPHY.md`, `ARCHITECTURE.md`, `MASTERPLAN.md`, `ROADMAP.md` y `README.md` en esta misma formalización.

**Confirmación explícita.** Ninguna funcionalidad, componente, migración o comportamiento de la aplicación fue modificado durante este proceso — el trabajo fue exclusivamente documental y conceptual, tal como se autorizó.

---

## METODOLOGÍA PERMANENTE DE TRABAJO — Etapa conceptual cerrada, retorno al desarrollo (2026-07-21)

Con `VISION_MAESTRA.md` ya aprobada y congelada, el Product Owner declaró oficialmente cerrada la etapa de construcción conceptual del proyecto. `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `AI_PHILOSOPHY.md`, `ARCHITECTURE.md` y `MASTERPLAN.md` quedan **congelados**: no deben seguir ampliándose ni refinándose, salvo una decisión estratégica excepcional del Product Owner con el mismo rigor de análisis que dio origen a cada uno. `ROADMAP.md`, `PROJECT.md` y `CHANGELOG.md` siguen actualizándose con normalidad como registro de ejecución — su naturaleza es documentar lo que se construye fase por fase, no definir la identidad del producto, y por lo tanto no están sujetos a este congelamiento.

La prioridad vuelve a ser el desarrollo del producto. A partir de esta fecha, **el siguiente flujo de trabajo es obligatorio para toda fase futura**, sin excepción, hasta que el Product Owner decida explícitamente lo contrario:

1. Revisar `VISION_MAESTRA.md` y los documentos relacionados antes de proponer cualquier funcionalidad.
2. Analizar críticamente si la nueva idea fortalece la filosofía del producto.
3. Detectar posibles contradicciones antes de escribir código.
4. Presentar al Product Owner el análisis técnico y de producto.
5. Esperar siempre su aprobación explícita antes de implementar.
6. Implementar únicamente el alcance aprobado — nada más.
7. Verificar rigurosamente contra PostgreSQL real, RLS, Playwright, build y lint.
8. Documentar con el mismo nivel de detalle mantenido hasta ahora.
9. No avanzar automáticamente al siguiente bloque o fase — cada uno requiere su propia aprobación.

**Criterio permanente.** Toda propuesta debe responder primero una única pregunta: *¿esta decisión fortalece la Visión Maestra de Ahorita?* Si la respuesta es no, debe señalarse explícitamente como tal — incluso si es técnicamente posible implementarla, incluso si ninguna regla técnica la prohíbe. Se prefiere descartar una funcionalidad antes que debilitar la identidad del producto.

**Principio de evolución.** Ahorita no debe crecer por acumulación de funciones, sino por coherencia. Cada característica nueva debe sentirse como una consecuencia natural de la Visión Maestra, nunca como una idea aislada que se justifica solo porque es técnicamente viable o porque otra aplicación ya la tiene.

Esta metodología rige, sin necesidad de repetirla, para cada fase pendiente del `MASTERPLAN.md` (Fase 5B en adelante) y para cualquier propuesta de producto futura.

---

## Fase 5B, Bloque 1 — Cambio de fuente de verdad: Eventos y Lugares migran a `interactions` (implementado)

Primer bloque de la Fase 5B, siguiendo la metodología permanente recién institucionalizada: análisis previo presentado y aprobado, decisiones de producto explícitas, y solo entonces implementación. Cierra la deuda dejada pendiente desde el cierre del Bloque 4 de la Fase 1, que solo copió los datos de `post_likes`/`saved_events`/`saved_places` hacia `interactions` sin migrar quién los lee y escribe.

### Verificación previa contra el código real, no solo contra la documentación narrativa

Antes de diseñar la migración se inspeccionó directamente el esquema y `src/`, revelando tres hechos que no estaban documentados con esa precisión en ningún lugar: (1) `post_likes.target_type` también sirve a Comunidad (`status`/`question`), compartiendo tabla, vista de conteo y módulo de datos con Eventos/Lugares; (2) `events.likes_count` se mantenía con un trigger anclado a `post_likes`, no a `interactions`; (3) `places` no tiene contador propio — solo una vista agregada en vivo sobre `post_likes`, sin ningún consumidor real de "me gusta" en la interfaz hoy (capacidad de esquema sin uso). Este hallazgo cambió el diseño: la migración debía ser bidireccional (insertar lo que falta, eliminar lo que el usuario ya deshizo en la tabla legacy sin que `interactions` se enterara), no un backfill aditivo simple como el de la Fase 1.

### `supabase/migrations/0032_fase5b_bloque1_fuente_de_verdad_interacciones.sql` (nuevo)

- Reconciliación bidireccional (insertar + eliminar huérfanos, con comparación exacta) de `post_likes` (event/place) y `saved_events`/`saved_places` contra `interactions`, resolviendo `actor_id` vía `actors.profile_id`, mismo patrón de resolución que la Fase 1, Bloque 4.
- `public.sync_event_likes_count_from_interactions()` (trigger nuevo sobre `interactions`) reemplaza a `sync_event_likes_count()` (trigger sobre `post_likes`, deshabilitado con `alter table ... disable trigger`, no eliminado, para permitir reversión sin pérdida de historial).
- `post_likes.target_type` pierde `'event'/'place'` de su `check` (agregado `not valid` para no invalidar retroactivamente las filas históricas de esos dos tipos, que se conservan intactas) — decisión de arquitectura explícita del Product Owner: ninguna funcionalidad nueva puede volver a escribir ahí para Eventos o Lugares.
- `post_likes` queda documentada (`comment on table`) como parcialmente legacy — activa para Comunidad, retiro definitivo condicionado a que Comunidad migre a `interactions` en su propia migración futura. `saved_events`/`saved_places` quedan completamente legacy, mismo tratamiento que `follows` desde la Entrega 6 de la Fase 3.

### Hallazgo encontrado y corregido antes del commit

El trigger nuevo, en su primera versión, no llevaba `security definer`, igual que el trigger original que reemplaza. Verificado con un actor autenticado real sin privilegios de administrador (no con superusuario): el `update` interno sobre `events.likes_count` quedaba bloqueado por la política RLS "Admins editan eventos", y el contador nunca se movía — un defecto silencioso heredado, presente también en el trigger original desde su creación, que nunca se había manifestado porque toda verificación previa del proyecto se hizo con rol de servicio o superusuario. Corregido agregando `security definer set search_path = public` a la función nueva, mismo patrón ya usado en `handle_new_user`/`on_profile_created_actor`. Verificado de nuevo con el mismo actor no administrador: el conteo ahora sí sube y baja correctamente.

### Verificación realizada

Postgres 16 real, las 32 migraciones (`0001`-`0032`, saltando `0002`/`0022` por Storage) aplicadas en orden contra una base limpia, dos veces (una para depurar el hallazgo de `security definer`, otra final desde cero con la versión ya corregida). Escenario de prueba con 4 actores (ana/beto/caro/admin), 2 eventos y 2 lugares de prueba, deliberadamente desincronizado para probar ambas direcciones de la reconciliación:

- **Inserción de lo que faltaba**: una fila de "me gusta"/"guardado" presente solo en la tabla legacy (nunca copiada a `interactions`) se insertó correctamente.
- **Eliminación de huérfanos**: una fila de "me gusta"/"guardado" presente solo en `interactions` sin respaldo en la tabla legacy (simulando que el usuario deshizo la acción mientras el frontend todavía escribía solo en la tabla vieja) se eliminó correctamente — el escenario que la migración original de la Fase 1 nunca necesitó resolver, porque partía de una tabla vacía.
- **Filas ya coincidentes en ambos lados**: no se duplicaron ni se tocaron.
- **`events.likes_count`**: verificado con un actor autenticado real (no superusuario) insertando y eliminando su propio "me gusta" vía `interactions` — el contador sube y baja exactamente igual que antes.
- **Privacidad de "guardado" preservada**: un actor no ve el guardado ajeno (0 filas visibles), sí ve el propio (1 fila) — misma política heredada de la Fase 1, sin cambios.
- **"Me gusta" sigue siendo público**: un actor ve el "me gusta" de otro sin restricción.
- **Comunidad completamente intacta**: `post_likes` sigue aceptando filas nuevas de `'question'`/`'status'` sin ningún cambio; un intento de insertar `'event'`/`'place'` en `post_likes` fue rechazado por el nuevo `check constraint`, confirmando la decisión 4 del Product Owner a nivel de base de datos, no solo de disciplina de código.
- **Deduplicación**: un segundo intento de la misma interacción fue rechazado por el `unique` ya existente desde la Fase 1.
- **Trigger viejo deshabilitado**: confirmado vía `pg_trigger.tgenabled = 'D'`.
- **Reversión ejecutada de verdad**: restaurar el `check constraint` original, reactivar el trigger viejo y eliminar el trigger/función nuevos devolvió el comportamiento exacto previo al bloque — verificado insertando de nuevo directamente en `post_likes` y confirmando que `events.likes_count` volvía a incrementarse por esa vía. Las tres tablas legacy (`post_likes`, `saved_events`, `saved_places`) nunca perdieron una sola fila durante todo el proceso.

### Capa de datos y frontend

`lib/interactions.js` gana `listMyLikedEventIds`/`toggleEventLike`, `listMySavedEventIds`/`toggleSavedEvent`, `listMySavedPlaceIds`/`toggleSavedPlace`/`listMySavedPlaces` (esta última resuelta en dos pasos, mismo patrón que `listFollowedProfileIds` de la Entrega 6, ya que `interactions.target_id` es polimórfico y no tiene relación formal de clave foránea con `places`). Migrados a la nueva fuente: `FeedPage.jsx` (me gusta de Eventos), `SavedEventsContext.jsx`, `SavedPlacesContext.jsx`, `SettingsPage.jsx` (lista de lugares guardados). `postLikes.js`/`savedEvents.js`/`savedPlaces.js` permanecen en el repositorio con una nota de cabecera que documenta su estado legacy, sin que ningún archivo activo vuelva a importarlos para Eventos/Lugares.

### Limitación de entorno (misma que todas las fases anteriores)

Sin proyecto Supabase real desplegado en este entorno, la verificación de Playwright se limitó a confirmar que la aplicación carga sin errores de ejecución (`pageerror`) en Inicio y en Ajustes tras el refactor — no fue posible ejercitar el flujo real de dar "me gusta"/guardar contra una sesión autenticada real, misma limitación ya documentada en cada fase anterior desde la Fase 1.

### Verificado

Build y lint limpios (las advertencias de lint presentes son preexistentes, no introducidas por este bloque — mismo patrón ya señalado en `FollowContext.jsx`/`AuthContext.jsx`).

### Deuda técnica detectada

- **Prueba end-to-end contra un proyecto Supabase real desplegado** — heredada desde la Fase 1, sin resolver por el mismo motivo de siempre.
- **`post_likes` permanece parcialmente legacy**, condicionada a que Comunidad migre a `interactions` en una fase futura — no forma parte del alcance de la Fase 5B.

### Qué sigue

Bloque 2 (reacciones "Quiero ir"/"Ya fui" exclusivas de Eventos, coexistentes sin exclusión mutua) y Bloque 3 (comentarios generalizados con vista de detalle propia para Publicación), ambos pendientes de su propia aprobación explícita antes de implementarse — no se avanza automáticamente.

---

## Fase 5B, Bloque 2 — Reacciones "Quiero ir" y "Ya fui", exclusivas de Eventos (implementado)

Segundo bloque de la Fase 5B: construye por primera vez las dos reacciones reservadas en `interactions.type` desde la Fase 1, nunca implementadas hasta ahora. Diseño aprobado tras análisis previo: exclusivas de Eventos, coexistentes sin exclusión mutua, visibles únicamente dentro de `EventSheet` (nunca en `FeedCard`/`PublicationFeedCard`/`PromotionFeedCard`), con conteo público en vivo (sin columnas desnormalizadas) y una capa de datos generalizada en vez de funciones dedicadas por tipo.

### Diseño aprobado

- **Ubicación**: solo `EventSheet`, como dos chips independientes (nunca un control segmentado) después del precio. `FeedCard` permanece exactamente como quedó en el Bloque 1 — evita repetir el hallazgo de recorte ya resuelto en la Fase 4 para Publicación/Promoción, y coincide con que "quiero ir"/"ya fui" son decisiones que se toman con la información completa que solo el detalle muestra, no en el scroll rápido del feed.
- **Compuerta temporal, en interfaz y en base de datos**: "Ya fui" nunca puede registrarse antes de `start_at`; "Quiero ir" nunca puede registrarse por primera vez después de `coalesce(end_at, start_at)` (mismo criterio de "finalización" que ya usa `listUpcomingEvents` en `lib/events.js` para decidir qué eventos siguen "próximos"). Ninguna de las dos reglas restringe la eliminación — una intención histórica nunca se borra automáticamente y el usuario siempre puede quitarla, sin importar la fecha.
- **Exclusividad de Eventos reforzada también en la base de datos**, no solo por ausencia de interfaz: un intento de escribir `quiero_ir`/`ya_fui` contra cualquier `target_type` que no sea `'event'` se rechaza con el mismo mecanismo de la compuerta temporal.
- **Conteo en vivo**: sin columnas desnormalizadas ni triggers de conteo nuevos — decisión explícita, sin necesidad de rendimiento real todavía que lo justifique.
- **Semántica documentada explícitamente** (`AI_PHILOSOPHY.md`, nueva sección "La jerarquía de señales declaradas sobre un Evento"): Me gusta = afinidad; Quiero ir = intención declarada; Ya fui = asistencia declarada; check-in futuro (Fase 9) = presencia verificada. "Ya fui" nunca debe presentarse ni interpretarse como equivalente a un check-in validado. Ninguna de las tres se usa todavía para ranking ni recomendaciones.

### `supabase/migrations/0033_fase5b_bloque2_reacciones_evento.sql` (nuevo)

Una sola función (`enforce_event_reaction_timing()`, `security definer`, disparada `before insert on interactions`) resuelve las tres reglas de negocio del bloque: exclusividad de Eventos, compuerta de "ya_fui" y compuerta de "quiero_ir" — sin ninguna tabla ni columna nueva, sin cambio de RLS (la política pública de `interactions` desde la Fase 1 ya cubre estos dos tipos).

### Capa de datos (`lib/interactions.js`)

Reemplaza `toggleEventLike` (Bloque 1, específica de un solo tipo) por una capa coherente para las cuatro interacciones posibles sobre un Evento: `getMyEventReactions` (lectura de un solo evento, para `EventSheet`), `getEventReactionCounts` (conteo público en vivo de "quiero ir"/"ya fui"), y `toggleEventInteraction` (única función de escritura, valida el `type` contra una lista de permiso — `me_gusta`/`quiero_ir`/`ya_fui`/`guardado` — en vez de aceptar cualquier valor del catálogo). `toggleSavedEvent` (Bloque 1) pasa a delegar en esta misma función en vez de duplicar su cuerpo. Las lecturas masivas del Bloque 1 (`listMyLikedEventIds`/`listMySavedEventIds`, usadas por `FeedPage`/`SavedEventsContext` para poblar el estado de muchas tarjetas a la vez) no se tocan — siguen siendo el caso de uso correcto para el feed, distinto del de una sola tarjeta/detalle.

### Frontend

`EventReactionChips.jsx` (nuevo): dos chips independientes con icono, conteo, estado activo/inactivo/ocupado, `aria-pressed`, y una nota breve cuando "Ya fui" o "Quiero ir" están deshabilitados por la compuerta temporal ("Disponible cuando empiece el evento." / "Este evento ya finalizó."). Integrado en `EventSheet.jsx` con el mismo patrón `requireAuth` (redirección a `/login`) ya usado en `FeedCard`/`PublicationFeedCard`/`PromotionFeedCard`, en vez del `AuthGate` en línea que usa el formulario de comentarios — consistente con el resto de acciones sociales de tipo toggle de la aplicación.

### Verificación realizada

Postgres 16 real, las 33 migraciones aplicadas en orden contra una base limpia (dos veces, la segunda con la versión final que ya incluye el refuerzo de exclusividad). Escenario de prueba con dos actores, un evento futuro, uno en curso y uno puntual ya finalizado sin `end_at`:

- "Ya fui" antes de `start_at` rechazado; permitido desde que el evento ya comenzó.
- "Quiero ir" permitido mientras el evento no ha finalizado; una nueva activación rechazada después de `coalesce(end_at, start_at)`.
- Ambas reacciones activas simultáneamente sobre el mismo evento, sin ningún conflicto.
- Una intención histórica (`quiero_ir` insertada legítimamente antes de la finalización, simulada deshabilitando la compuerta temporalmente para la inserción de prueba) se conserva sin borrado automático y se elimina sin problema incluso después de finalizado el evento — confirmando que la compuerta solo actúa sobre `INSERT`, nunca sobre `DELETE`.
- Exclusividad de Eventos confirmada: un intento de `quiero_ir` contra `target_type='publicacion'` fue rechazado.
- Deduplicación por `unique` confirmada. Un actor sin sesión (sin `auth.uid()`) rechazado por RLS, no por el trigger nuevo. Un actor no puede escribir a nombre de otro (RLS ya existente desde la Fase 1).
- Conteos públicos verificados exactos.
- `me_gusta`/`guardado` de Eventos (Bloque 1) siguen funcionando sin ninguna interferencia del trigger nuevo, incluido el contador `events.likes_count`.
- Reversión ejecutada de verdad (eliminar el trigger/función nuevos) sin pérdida de datos en ninguna tabla.

Build y lint limpios (sin advertencias nuevas). Playwright limitado a confirmar ausencia de errores de ejecución tras el cambio — misma limitación de entorno ya aceptada desde la Fase 1, sin proyecto Supabase real desplegado.

### Deuda técnica detectada

- **Prueba end-to-end contra un proyecto Supabase real desplegado** — heredada, sin resolver por el mismo motivo de siempre.
- Ninguna deuda nueva propia de este bloque.

### Qué sigue

Bloque 3 (comentarios generalizados, con vista de detalle propia para Publicación), pendiente de su propia aprobación explícita antes de implementarse.

---

## Fase 5B, Bloque 3 — Comentarios generalizados sobre Evento y Publicación (implementado)

Tercer y último bloque de la Fase 5B: generaliza los comentarios (hasta ahora exclusivos de Evento, sobre `event_comments`) a Evento y Publicación por igual, sobre el mismo eje `interactions`/`actors` que ya usan los demás tipos de interacción — Promoción queda deliberadamente excluida. Aprobado tras un análisis de 16 puntos más un addendum crítico que el usuario identificó personalmente: la unicidad `unique(actor_id, type, target_type, target_id)` heredada del Bloque 4 de la Fase 1 habría impedido que un mismo actor comentara más de una vez el mismo contenido, y habría bloqueado la anonimización compartida de cuentas eliminadas en cuanto dos de ellas comentaran el mismo contenido.

### Diseño aprobado

- **Unicidad de `interactions`**: la restricción única original se reemplaza por un índice único parcial (`interactions_unique_toggle_idx`) que excluye `type = 'comentario'` — los seis tipos de alternancia (`me_gusta`/`quiero_ir`/`ya_fui`/`guardado`/`seguimiento`/`compartir`) conservan exactamente una fila por actor/objetivo; `comentario` permite filas ilimitadas del mismo actor sobre el mismo objetivo.
- **Actor de sistema "Cuenta eliminada"**: mismo patrón que "Guía IA"/"Ahorita Editorial" (`type = 'sistema'`, sin `profile_id`/`business_id`, estructuralmente excluido de toda RLS basada en propiedad). Puede agregar comentarios de varias cuentas eliminadas distintas sin que eso implique la misma autoría — documentado explícitamente. No puede iniciar sesión, publicar, comentar ni interactuar como un usuario normal; solo recibe reasignaciones desde el proceso administrativo de eliminación de cuentas.
- **Soft-delete con exactamente dos estados válidos**, forzado por un `check` en la base de datos: activo (`deleted_at is null`, `body` entre 1 y 500 caracteres tras `btrim`) o eliminado (`deleted_at is not null`, `body is null`) — ningún estado intermedio.
- **Distinción visual**: "autor eliminado, comentario vigente" (el texto se sigue mostrando, el autor se muestra como "Cuenta eliminada", nunca se da a entender que el comentario mismo fue eliminado) vs. "comentario eliminado" (sin texto, solo "Comentario eliminado", autor desenfatizado, estructura conservada para futuras respuestas anidadas — `parent_comment_id` ya existe sin exponerse todavía).
- **`comments_count`** (Eventos, desnormalizado) representa solo comentarios visibles (`deleted_at is null`); un comentario eliminado nunca infla el contador público pero sí sigue contando para el límite de tasa. Publicación usa conteo en vivo (sin desnormalizar), igual que sus demás contadores.
- **Límite de tasa sin cambios**: 1 comentario/10s por actor, máximo 20/hora por actor, global (no por contenido) — un comentario eliminado sigue contando dentro de estas ventanas; el soft-delete nunca puede usarse para evadir el límite.
- **Migración de `event_comments`**: campo por campo (evento, cuerpo, `created_at`, autor resuelto o "Cuenta eliminada" si ya estaba anonimizado), asumiendo que un mismo autor puede tener varios comentarios sobre el mismo Evento. `event_comments` permanece como respaldo legacy durante un periodo de convivencia — no se elimina en este bloque.

### `supabase/migrations/0034_fase5b_bloque3_comentarios_generalizados.sql` (nuevo)

Amplía el catálogo de `interactions.type` con `'comentario'`; reemplaza la restricción única por el índice parcial; siembra el actor "Cuenta eliminada"; crea `interaction_comments` (detalle 1:1 vía `interaction_id`, con `parent_comment_id` autorreferenciado sin exponer todavía, `deleted_at`, y el `check` de dos estados) con su propia RLS; `enforce_comment_rules()` (`security definer`, disparado `before insert on interactions`) valida `target_type in ('event','publicacion')`, rechaza explícitamente `subtype = 'promocion'`, valida visibilidad del contenido de destino, y aplica los dos límites de tasa; `protect_comment_soft_delete()` (`before update on interaction_comments`) fuerza la única transición válida de `UPDATE` (activo → eliminado) sin importar qué envíe el cliente, y rechaza tocar un comentario ya eliminado o su `parent_comment_id`; backfill procedural (`do $$ ... loop ... end $$`, no un `insert...select` con `join`) de `event_comments` hacia `interactions`/`interaction_comments`, deliberadamente **antes** de crear `sync_comments_count()` (mismo orden que el Bloque 1: crear el trigger de conteo antes del backfill duplicaría el conteo); finalmente deshabilita `event_comments_sync_count` y documenta el estado legacy de la tabla.

### Hallazgos encontrados y corregidos durante la verificación (antes de cualquier commit)

Cuatro defectos reales, ninguno detectado por inspección visual del SQL — los cuatro emergieron al ejecutar la migración contra Postgres 16 real con datos sembrados:

1. **Constraint de dos estados con fuga de `NULL`**: `char_length(btrim(body)) between 1 and 500` evalúa a `NULL` (no `false`) cuando `body is null`, y Postgres acepta un `CHECK` que evalúa a `NULL` — permitía insertar una fila con `deleted_at is null and body is null`, violando el invariante de dos estados. Corregido envolviendo con `coalesce(..., 0)`.
2. **Correlación fragil en el backfill**: el primer borrador correlacionaba las filas nuevas de vuelta a `event_comments` por `(target_id, created_at)` vía `join`, ambiguo si dos comentarios distintos compartieran exactamente el mismo instante. Corregido con un bucle procedural que preserva la correspondencia 1:1 fila por fila sin depender de coincidencias de timestamp.
3. **Doble conteo (`comments_count` 4→8)**: el trigger de conteo se creaba *antes* del backfill en el primer borrador, así que cada inserción del backfill disparaba el trigger nuevo sumando sobre un conteo que el trigger legacy (todavía activo en ese punto) ya había dejado correcto — duplicando el total. Corregido reordenando el archivo: backfill primero, trigger de conteo después (mismo patrón que ya funcionó en el Bloque 1).
4. **Promoción comentable a nivel de base de datos**: `enforce_comment_rules()` solo validaba `target_type in ('event','publicacion')` — como las Promociones viven en la misma tabla `publications` con `subtype='promocion'`, una Promoción publicada pasaba la validación sin ningún chequeo adicional, contradiciendo la decisión aprobada de excluirlas. Corregido añadiendo el chequeo explícito de `subtype`.
5. **Política de `UPDATE` sin `with check` explícito**: la política "El dueño del actor o un admin eliminan (soft-delete)" solo tenía `using (deleted_at is null and ...)` — sin un `with check` propio, Postgres reutiliza la misma expresión para validar la fila resultante, pero `deleted_at` deja de ser `null` justo después de la transición que el propio trigger fuerza, así que ni el dueño ni un admin podían completar su propia eliminación (rechazado por RLS, no por el trigger). Corregido con un `with check` que valida identidad/rol sobre la fila (sin repetir la condición de `deleted_at`).

### Capa de datos (`lib/interactions.js`)

`listComments(targetType, targetId)`, `createComment({viewerProfileId, targetType, targetId, body})`, `deleteComment(interactionId)` — consultan desde `interactions` (no desde `interaction_comments`) porque `target_type`/`target_id` viven en la tabla padre. La resolución del autor maneja el caso del actor de sistema (`profile_id is null`) devolviendo `{id: null, username: "Cuenta eliminada", avatar_url: null}` en vez de intentar un join que devolvería `null`.

### Frontend

`CommentsSection.jsx` (nuevo, `src/features/social/`): componente compartido entre Evento y Publicación — lista, formulario con estado `busy` (previene el doble envío, un defecto real identificado durante el análisis pero nunca corregido en el composer original de Evento), estados vacío/con contador, eliminar solo el propio comentario, y la distinción visual "autor eliminado" vs. "comentario eliminado". `EventSheet.jsx` reemplaza su implementación en línea (sobre `event_comments`) por este componente — `lib/events.js` pierde `listEventComments`/`createEventComment`, ya sin ningún llamador. Nueva ruta `/publicacion/:id` (`PublicationDetailPage.jsx`, mismo patrón `RequireAccess`+`MainLayout` que `/actor/:actorId`) con `getPublication(id)` (`lib/publications.js`, nuevo) — `PublicationFeedCard.jsx` cambia su botón "Ver más" de expandir en línea a navegar aquí, mismo criterio que ya usa Evento (el detalle, no el scroll del feed, es donde vive la conversación).

### `supabase/functions/process-account-deletions/index.ts`

Antes de `auth.admin.deleteUser`, reasigna las `interactions` `type = 'comentario'` del actor persona del usuario hacia "Cuenta eliminada" (`reassignCommentsToDeletedAccount`) — los otros seis tipos de interacción siguen cascadeando normalmente con la cuenta, sin cambios. Si la reasignación falla, la eliminación de ese usuario se aborta (no se llama a `deleteUser`) y la solicitud queda `pendiente` para reintentarse, igual que cualquier otro fallo por usuario ya manejado en este bucle.

### Verificación realizada

Postgres 16 real, las 34 migraciones aplicadas en orden contra una base limpia (múltiples veces, con recreación completa de la base entre cada corrección para nunca verificar sobre estado parcialmente corregido):

- **Doble conteo**: `comments_count` confirmado en 4 (no 8) tras backfillear 4 `event_comments` preexistentes (dos del mismo autor sobre el mismo Evento, una de un segundo autor, una ya anonimizada) y aplicar la migración corregida.
- **Migración campo por campo**: los 4 comentarios preservados exactamente (texto, `created_at`, autor resuelto), incluidos los dos duplicados del mismo autor como filas distintas, y el ya anonimizado correctamente reasignado a "Cuenta eliminada".
- **Índice único parcial**: duplicado rechazado para cada uno de `me_gusta`/`guardado`/`quiero_ir`/`seguimiento`/`compartir` (mismo actor, mismo objetivo); `comentario` permite múltiples filas del mismo actor sobre el mismo objetivo sin conflicto (bloqueado solo por el límite de tasa, nunca por unicidad).
- **Dos cuentas eliminadas reasignadas al mismo actor "Cuenta eliminada"** sobre el mismo Evento y sobre la misma Publicación — sin ningún conflicto de unicidad en ningún caso.
- **Soft-delete**: transición válida exitosa (`body` correctamente a `null`); un intento de "editar" el cuerpo de un comentario activo se convierte en la misma transición de eliminación (por diseño: no existe función de edición, así que cualquier `UPDATE` solo puede significar "eliminar"); un segundo intento de modificar un comentario ya eliminado, rechazado; un intento de cambiar `parent_comment_id`, rechazado.
- **RLS por rol**: creación propia exitosa; suplantación de otro actor rechazada; comentario en Promoción rechazado (tras la corrección del hallazgo 4); comentario en Publicación en borrador ajena rechazado; comentario en Evento en borrador rechazado; `target_type` inválido (`place`) rechazado; eliminación por un tercero rechazada (0 filas afectadas); eliminación del propio comentario exitosa (tras la corrección del hallazgo 5); moderación mínima de un admin sobre un comentario ajeno exitosa; el actor "Cuenta eliminada" no puede usarse para crear una interacción nueva (RLS de propiedad lo excluye estructuralmente); un invitado sin sesión (rol `anon`) rechazado.
- **Reversión** ejecutada de verdad en un escenario limpio previo a cualquier uso real: elimina los triggers/tabla/índice nuevos, restaura el trigger legacy de `event_comments` (vuelve a contar automáticamente), restaura la restricción única original, restaura el catálogo de tipos original — confirmado con datos reales tras la reversión (`event_comments` vuelve a contar solo, `comentario` vuelve a ser un tipo inválido, un duplicado de `me_gusta` vuelve a rechazarse). Documentado honestamente: esta limpieza solo está garantizada antes de que existan datos reales de uso (comentarios duplicados reales del mismo actor, comentarios reales de Publicación, reasignaciones reales a "Cuenta eliminada") — después de uso real, una reversión completa ya no se promete limpia.

Build y lint limpios (sin advertencias nuevas más allá de las ya conocidas). Playwright limitado a confirmar ausencia de errores de ejecución en Inicio, `/publicacion/:id` (incluida una Publicación inexistente, que debe mostrar el mensaje de "no disponible" sin fallar) y Explorar — misma limitación de entorno aceptada desde la Fase 1 (sin proyecto Supabase real desplegado, no es posible ver la interfaz autenticada real en este entorno).

### Deuda técnica detectada

- **Prueba end-to-end contra un proyecto Supabase real desplegado** (Edge Function `process-account-deletions` incluida) — heredada, sin resolver por el mismo motivo de siempre; debe mantenerse expresamente registrada, tal como se acordó explícitamente para este bloque.
- **Sin moderación de comentarios desde la interfaz de administración**: la base de datos ya permite que un admin haga soft-delete de cualquier comentario (verificado), pero no existe todavía una pantalla dedicada en `/admin` para ejercer esa capacidad — queda disponible para una fase de moderación futura si se decide construirla.
- **Ninguna deuda nueva de integridad de datos o privacidad** — las cinco correcciones de este bloque se verificaron todas contra Postgres real antes del commit.

### Decisiones adicionales de producto, registradas tras la aprobación del cierre de este bloque

1. **La eliminación de un comentario es definitiva.** El cuerpo de un comentario eliminado nunca podrá recuperarse, ni siquiera mediante herramientas administrativas normales — coherente con el diseño ya implementado y verificado (`protect_comment_soft_delete()` fuerza `body := null` en la única transición de `UPDATE` permitida, y la propia RLS de `UPDATE` exige `deleted_at is null` incluso para un admin, así que ninguna fila ya eliminada vuelve a ser alcanzable por ese camino). Se eleva aquí de detalle de implementación a **decisión permanente de producto**: respeta plenamente la decisión de quien eliminó su propio comentario y el principio de minimización de datos. Si en el futuro existiera alguna excepción legal que exigiera recuperar ese contenido, deberá resolverse mediante un mecanismo completamente distinto y explícitamente aprobado — nunca reinterpretando ni debilitando el soft-delete actual.
2. **Diferencia semántica permanente entre "Cuenta eliminada" y "Comentario eliminado".** Son dos conceptos distintos que nunca deben tratarse como equivalentes: una cuenta eliminada conserva el contenido del comentario pero pierde la identidad de su autor; un comentario eliminado conserva únicamente la estructura conversacional y elimina definitivamente el contenido. Documentado de forma permanente en `AI_PHILOSOPHY.md` (Principio no negociable 12, y su correspondiente entrada en "Qué nunca debe hacer") para que la futura Guía IA nunca los interprete como el mismo estado.

### Qué sigue

Cierre formal de la Fase 5B — aprobado. Ver la sección "FASE 5B CERRADA" más abajo.

---

## FASE 5B CERRADA — Interacción social plena (2026-07-22)

Cierre formal de la Fase 5B completa del `MASTERPLAN.md`, aprobado explícitamente tras completar los tres bloques planificados. Primera fase construida enteramente bajo la "METODOLOGÍA PERMANENTE DE TRABAJO" registrada tras la pausa estratégica que adoptó `VISION_MAESTRA.md` como autoridad conceptual máxima del proyecto — cada bloque se precedió de análisis explícito, decisiones de producto aprobadas por separado, y verificación exhaustiva contra Postgres 16 real antes de cualquier commit. Checkpoint de Git: tag `checkpoint-fase5b-interaccion-social`.

### Resumen ejecutivo

La Fase 5B completó la interacción social del ecosistema: generalizó "me gusta"/"guardado" a Eventos y Lugares sobre la misma fuente de verdad que ya usaba el resto del producto (Bloque 1), construyó por primera vez las reacciones "Quiero ir"/"Ya fui" reservadas desde la Fase 1 (Bloque 2), y generalizó los comentarios — antes exclusivos de Evento — a Evento y Publicación, con Promoción deliberadamente excluida (Bloque 3). Los tres bloques comparten un mismo patrón de rigor: cada uno encontró y corrigió defectos reales durante su propia verificación contra Postgres real, nunca detectados por inspección visual del código — dos en el Bloque 1, cinco en el Bloque 3 — y ninguno llegó a un commit sin corregir.

### Objetivo original y resultado final

**Objetivo original** (`MASTERPLAN.md`): generalizar comentarios y guardados a cualquier Publicación, y fijar el catálogo final de reacciones para v1 (Me gusta, Quiero ir, Ya fui).

**Resultado final**: se cumplió el objetivo con una corrección deliberada respecto a la redacción original del plan — **Promoción queda explícitamente excluida de comentarios**, no incluida "igual que un Evento" como decía el texto original de `MASTERPLAN.md` (corregido como parte de este cierre). La razón, aprobada explícitamente durante el análisis del Bloque 3: un beneficio comercial con vigencia no es un espacio de conversación, mismo principio que la Fase 4 ya aplicó para excluir "Quiero ir" y comentarios de Promoción desde su diseño original. Guardados y las tres reacciones se generalizaron exactamente según lo planeado.

### Bloques implementados

1. **Bloque 1 — Cambio de fuente de verdad** (2026-07-21, migración `0032`): "me gusta"/"guardado" de Eventos y Lugares migran de `post_likes`/`saved_events`/`saved_places` a `interactions`, cerrando la deuda dejada pendiente desde el Bloque 4 de la Fase 1. Reconciliación bidireccional (no un backfill puramente aditivo, porque las tablas legacy siguieron recibiendo escrituras reales) — hallazgo que cambió el diseño antes de implementar. Encontró y corrigió un defecto real: el trigger de conteo nuevo necesitaba `security definer` para no quedar bloqueado por la misma RLS que protege `events`, un defecto silencioso heredado del trigger original desde su creación, nunca manifestado porque toda verificación previa se había hecho con rol de servicio o superusuario.
2. **Bloque 2 — Reacciones "Quiero ir" y "Ya fui"** (2026-07-21, migración `0033`): construye por primera vez las dos reacciones reservadas en `interactions.type` desde la Fase 1 — exclusivas de Eventos, coexistentes sin exclusión mutua, con compuerta temporal (nunca "ya fui" antes de empezar, nunca una nueva activación de "quiero ir" después de finalizar) reforzada en la base de datos, no solo en la interfaz. Semántica documentada explícitamente en `AI_PHILOSOPHY.md` como jerarquía de señales de fuerza creciente (me gusta → quiero ir → ya fui → check-in futuro), con la advertencia explícita de que "ya fui" nunca equivale a un check-in validado.
3. **Bloque 3 — Comentarios generalizados** (2026-07-22, migración `0034`): generaliza comentarios de Evento a Evento y Publicación, con Promoción explícitamente excluida. Introduce el actor de sistema "Cuenta eliminada" para anonimizar comentarios de cuentas eliminadas sin perder el contenido de terceros (mismo principio de privacidad que la Fase 1, Bloque 5 ya aplicaba a `event_comments`, ahora generalizado), y un índice único parcial que permite múltiples comentarios del mismo actor sobre el mismo contenido sin romper la unicidad de los otros seis tipos de interacción. Encontró y corrigió cinco defectos reales durante su verificación — el bloque con más rigor de detección de todo el proyecto hasta ahora. Cerró con dos decisiones adicionales de producto registradas tras su aprobación: la eliminación de un comentario es definitiva y no reversible ni por herramientas administrativas, y la diferencia semántica entre "Cuenta eliminada" y "Comentario eliminado" queda documentada de forma permanente en `AI_PHILOSOPHY.md`.

### Funcionalidades visibles construidas

- "Me gusta" y "guardado" de Eventos y Lugares funcionan exactamente igual que antes para el usuario, ahora sobre una única fuente de verdad compartida con el resto del ecosistema.
- Dos chips independientes en `EventSheet` — "Quiero ir" y "Ya fui" — con conteo público en vivo, estado activo/inactivo/ocupado, y una nota breve cuando están deshabilitados por el momento del evento.
- Cualquier Evento o Publicación admite comentarios con la misma experiencia: lista, formulario con protección contra doble envío, contador de comentarios visibles, y eliminación del propio comentario.
- Un comentario de una cuenta eliminada conserva su texto pero muestra "Cuenta eliminada" como autor, sin insinuar que el comentario mismo fue eliminado; un comentario eliminado muestra únicamente "Comentario eliminado", sin texto.
- Nueva vista de detalle de Publicación (`/publicacion/:id`), con el mismo patrón que ya usa Evento — la conversación vive en el detalle, no en el scroll del feed.
- Promoción conserva me gusta/guardar/compartir exactamente como en la Fase 4, sin ningún cambio — nunca admitió ni admite comentarios ni "quiero ir".

### Arquitectura lograda

- **`interactions` demostró, por tercera vez consecutiva, estar completa desde su diseño original en la Fase 1**: "quiero_ir"/"ya_fui" y "comentario" ya vivían reservados en su catálogo de tipos desde la migración `0015`, y `parent_comment_id` en `interaction_comments` ya estaba previsto en el `MASTERPLAN.md` antes de que existiera la tabla — ninguno de los tres bloques necesitó rediseñar el eje de interacción, solo completarlo.
- **Unicidad de `interactions` evolucionó de una restricción única simple a un índice único parcial**, el primer cambio real a ese invariante desde su creación en la Fase 1 — necesario específicamente porque "comentario" es el primer tipo de interacción que legítimamente admite más de una fila por actor/objetivo. Los otros seis tipos conservan exactamente la misma garantía de una fila por actor/objetivo que tenían desde el origen.
- **Patrón de anonimización por actor de sistema, generalizado por primera vez**: "Cuenta eliminada" sigue el mismo patrón estructural que "Guía IA"/"Ahorita Editorial" (Fase 1) — un actor sin `profile_id`/`business_id`, excluido de toda RLS basada en propiedad — pero es el primero de los tres que existe específicamente para *recibir* contenido reasignado en vez de para *crear* contenido propio.
- **`security definer` como patrón consolidado y verificado activamente, no asumido**: el hallazgo del Bloque 1 (un trigger sin ese atributo queda silenciosamente bloqueado por la RLS que protege la tabla que actualiza) se aplicó preventivamente en el diseño del Bloque 3 (`enforce_comment_rules`, `sync_comments_count`, `protect_comment_soft_delete` lo llevan desde su primera versión) — el aprendizaje de un bloque se volvió disciplina de diseño del siguiente, no solo una corrección puntual.
- **Orden backfill-antes-que-trigger-de-conteo, aprendido en el Bloque 1 y re-verificado en el Bloque 3**: crear un trigger de conteo antes de que el backfill corra duplica el conteo sobre datos ya correctos — el mismo error se cometió y se corrigió dos veces en la misma fase, confirmando que la disciplina de verificar contra Postgres real (no solo razonar sobre el SQL) es lo que realmente atrapa este tipo de defecto, no la experiencia previa por sí sola.
- **Soft-delete de dos estados, exigido a nivel de `CHECK` de base de datos, no de disciplina de aplicación**: ningún estado intermedio entre "activo" y "eliminado" es representable en la tabla — el mismo rigor que ya usaba `promotion_status()`/`business_open_status()` (cálculo, no confianza ciega) aplicado aquí a una transición de escritura protegida por trigger.
- **Componente compartido de comentarios entre dos tipos de contenido**, mismo principio de consolidación ya demostrado con `useShareContent` (Fase 4) y `useActorSocialState` (Fase 3) — una sola implementación, dos superficies, en vez de duplicar lógica casi idéntica.

### Decisiones de producto incorporadas

- Reconciliación bidireccional (no backfill aditivo) para el cambio de fuente de verdad del Bloque 1, tras descubrir que las tablas legacy seguían recibiendo escrituras reales.
- "Quiero ir"/"Ya fui" exclusivas de Eventos, visibles únicamente en el detalle (nunca en las tarjetas del Feed), con compuerta temporal reforzada en la base de datos.
- Comentarios generalizados a Evento y Publicación, con Promoción explícitamente excluida — corrección del texto original de `MASTERPLAN.md`.
- Índice único parcial sobre `interactions`, resolviendo la bifurcación crítica que el propio Product Owner identificó: la restricción única original habría impedido múltiples comentarios del mismo actor y habría bloqueado la anonimización compartida de cuentas eliminadas.
- Actor de sistema "Cuenta eliminada", que puede agregar comentarios de varias cuentas eliminadas distintas sin que eso implique la misma autoría, y que está estructuralmente excluido de crear cualquier interacción nueva.
- Soft-delete de dos estados exactos, sin intermedios, con distinción visual permanente entre "autor eliminado" y "comentario eliminado".
- La eliminación de un comentario es definitiva y no reversible, ni siquiera mediante herramientas administrativas normales — cualquier excepción legal futura requeriría un mecanismo completamente distinto y explícitamente aprobado.
- La diferencia semántica entre "Cuenta eliminada" y "Comentario eliminado" queda documentada de forma permanente en `AI_PHILOSOPHY.md`, para que la futura Guía IA nunca los trate como equivalentes.
- Límite de tasa de comentarios (10 segundos entre comentarios, 20 por hora, global por actor) desde el propio Bloque 3 — adelantando parte del alcance de límites de tasa que el `MASTERPLAN.md` reserva formalmente para la Fase 13.

### Relación con `VISION_MAESTRA.md`

La Fase 5B fue la primera fase completa construida enteramente bajo la autoridad de `VISION_MAESTRA.md`, adoptada justo antes de que empezara (ver la sección "VISIÓN MAESTRA ADOPTADA" arriba). El criterio "¿esta decisión fortalece la Visión Maestra?" se aplicó explícitamente en el punto de mayor tensión de la fase: la bifurcación de unicidad del Bloque 3, donde la solución técnicamente más simple (mantener la restricción única sin cambios) habría contradicho directamente el principio de la Visión Maestra de que cada persona puede comentar tantas veces como quiera sobre algo que le importa, y que una cuenta eliminada nunca debe impedir que el contenido de terceros sobreviva. La Visión Maestra no se invocó como una frase decorativa — cambió el diseño real de la migración.

### Cómo la Fase 5B fortalece la Visión Maestra y los pilares del producto

- **Utilidad sobre atención.** Ninguna de las tres reacciones ni los comentarios generalizados introducen ningún mecanismo de retención artificial — "Quiero ir"/"Ya fui" son declaraciones honestas de intención/asistencia, nunca gamificadas; comentarios no tienen "me gusta" anidado, contador de vistas, ni ranking por popularidad.
- **Centralidad del ciudadano.** El soft-delete de dos estados y la anonimización compartida por "Cuenta eliminada" existen exclusivamente para proteger la decisión de la persona (eliminar su cuenta, eliminar su comentario) por encima de cualquier conveniencia técnica de conservar más datos de los necesarios.
- **Identidad editorial.** Ninguna interacción de esta fase mezcla contenido patrocinado con señal orgánica — Promoción conserva su misma exclusión de comentarios/"quiero ir" que ya tenía desde la Fase 4, sin excepción ni presión de producto para ampliarla.
- **La ciudad como organismo.** "Quiero ir"/"Ya fui" son, literalmente, el pulso declarado de la ciudad sobre sus propios eventos — la primera señal de asistencia real (no solo de interés) que el ecosistema registra.
- **Profundidad de la IA (futura).** Ver la sección de señales nuevas más abajo.

### Problemas encontrados y cómo fueron resueltos (consolidado de los tres bloques)

- **Bloque 1 — Trigger de conteo sin `security definer`**: el trigger nuevo, en su primera versión, no llevaba ese atributo, igual que el trigger original que reemplazaba — verificado con un actor autenticado real (no superusuario), el conteo nunca se movía porque la RLS de `events` bloqueaba la escritura interna. Corregido antes de cualquier commit, con el mismo patrón ya usado en `handle_new_user`.
- **Bloque 3 — Fuga de `NULL` en el `CHECK` de dos estados**: `char_length(btrim(body))` sobre `body is null` evalúa `NULL`, no `false`, y Postgres acepta un `CHECK` que evalúa `NULL` — permitía un estado intermedio inválido. Corregido con `coalesce`.
- **Bloque 3 — Backfill frágil por coincidencia de timestamp**: el primer borrador correlacionaba filas nuevas de vuelta a `event_comments` por `(target_id, created_at)`, ambiguo si dos comentarios compartieran el mismo instante exacto. Reescrito como bucle procedural con correspondencia 1:1 garantizada.
- **Bloque 3 — Doble conteo (4→8) por orden trigger/backfill**: el trigger de conteo se creaba antes del backfill, duplicando la suma sobre un conteo que el trigger legacy (todavía activo) ya había dejado correcto — el mismo error de ordenamiento que el Bloque 1 ya había resuelto una vez, cometido y corregido de nuevo en el Bloque 3, confirmando que solo la verificación empírica (no la experiencia previa por sí sola) atrapa este tipo de defecto de forma confiable.
- **Bloque 3 — Promoción comentable a nivel de base de datos**: el chequeo de `target_type` no distinguía `subtype`, así que una Promoción publicada pasaba la validación sin ningún rechazo — contradiciendo la decisión aprobada de excluirla. Corregido con un rechazo explícito de `subtype = 'promocion'`.
- **Bloque 3 — Política de `UPDATE` sin `with check` explícito**: ni el propio dueño ni un admin podían completar su propia eliminación de comentario, porque RLS reutilizaba la misma condición `deleted_at is null` para validar también la fila ya transicionada. Corregido con un `with check` propio.

Los siete defectos anteriores (dos del Bloque 1, cinco del Bloque 3) se encontraron y corrigieron durante la verificación contra Postgres 16 real, antes de cualquier commit — ninguno llegó a producción de código sin corregir.

### Confirmación de qué permaneció intacto

- **Comunidad** (`post_likes` para `status`/`question`) no se tocó en ningún bloque — el Bloque 1 reafirmó explícitamente esa frontera al restringir el `check` de `post_likes.target_type` para Eventos/Lugares, sin afectar en absoluto su uso activo para Comunidad.
- **Promoción** conserva exactamente el mismo conjunto de interacciones que tenía al cerrar la Fase 4 (me gusta/guardar/compartir, sin "quiero ir" ni comentarios) — verificado explícitamente en el Bloque 3, con un rechazo real a nivel de base de datos, no solo por ausencia de interfaz.
- **`event_comments`** permanece como respaldo legacy, con todas sus filas históricas intactas, migradas campo por campo hacia el nuevo esquema sin pérdida de un solo comentario — su trigger de conteo legacy queda deshabilitado (no eliminado), reversible durante el periodo de convivencia.
- **`events.likes_count`/`comments_count`** se comportan de forma idéntica a como lo hacían antes de la fase, para cualquier usuario autenticado real, en cada uno de los tres bloques que los tocó.

### Deudas técnicas pendientes (consolidado, obligatorio documentar antes de producción)

- **Prueba end-to-end contra un proyecto Supabase real desplegado** (Auth+PostgREST+RLS+Storage+Edge Functions+triggers programados) — heredada desde la Fase 1, nunca resuelta en ningún bloque de ninguna fase por falta de Docker/Supabase real en este entorno de desarrollo. Afecta en particular la verificación completa de `process-account-deletions` (Bloque 3).
- **`post_likes` permanece parcialmente legacy** (Bloque 1) — activa para Comunidad, su retiro definitivo depende de que Comunidad migre a `interactions` en una fase futura, fuera del alcance de la Fase 5B.
- **`saved_events`/`saved_places`/`event_comments` permanecen como legacy de solo respaldo** — el frontend ya no las usa, pero sus filas no se han retirado; el retiro definitivo requiere su propia migración futura, después de un periodo de convivencia observado.
- **Sin moderación de comentarios desde la interfaz de administración** (Bloque 3) — la base de datos ya permite que un admin haga soft-delete de cualquier comentario, verificado, pero no existe todavía una pantalla dedicada en `/admin` para ejercerlo.
- **Todas las deudas técnicas heredadas de las Fases 1-4** siguen sin resolver y sin empeorar (ver secciones "FASE 1/2/3/4 CERRADA" en este mismo documento) — la Fase 5B no las tocó ni las agravó.

### Funcionalidades deliberadamente no construidas

- **Comentarios en Promoción** — límite explícito de producto, reafirmado dos veces (diseño original de la Fase 4, decisión explícita del Bloque 3 de esta fase): un beneficio comercial con vigencia no es un espacio de conversación.
- **Respuestas anidadas a comentarios** — `parent_comment_id` ya existe en `interaction_comments`, preparado desde su creación, pero deliberadamente sin exponerse en la interfaz todavía.
- **Ranking, ni cualquier uso de estas señales para recomendación o personalización** — "quiero ir"/"ya fui"/comentarios quedan registrados y documentados para cuando la Fase 6 (Descubrimiento inteligente v2) y la Fase 7 (Guía IA v2) los necesiten, mismo patrón ya usado con `actor_search_index` (Fase 3) y "compartir" (Fase 4).
- **Moderación de contenido más allá de las reglas de autenticidad ya construidas** (rate limiting, soft-delete, exclusión de Promoción) — reservada para la Fase 13.
- **Check-in físico validado** — "Ya fui" es una declaración honesta de asistencia, deliberadamente no equivalente a una verificación física; esa capacidad llega recién en la Fase 9.

### Dependencias habilitadas para las fases siguientes

- **El catálogo de `interactions.type` queda formalmente cerrado y completo para v1** (me gusta, quiero ir, ya fui, guardado, seguimiento, compartir, comentario) — la Fase 6 (Descubrimiento inteligente v2) y la Fase 7 (Guía IA v2) heredan un conjunto de señales ya estable, sin necesitar ninguna migración de catálogo adicional.
- **`interaction_comments.parent_comment_id` ya probado en el esquema real** (aunque sin exponerse) — cualquier futura decisión de habilitar respuestas anidadas no requiere ninguna migración, solo trabajo de interfaz.
- **El patrón de actor de sistema para anonimización ("Cuenta eliminada") queda disponible como precedente reutilizable** — cualquier futuro tipo de contenido colaborativo que necesite sobrevivir a la eliminación de una cuenta puede seguir el mismo patrón exacto, ya verificado contra Postgres real.
- **El componente compartido de comentarios (`CommentsSection`) y la ruta de detalle de Publicación (`/publicacion/:id`)** dejan un precedente de superficie de conversación reutilizable para cualquier futuro tipo de contenido (por ejemplo, Historias en la Fase 8).
- **Límites de tasa básicos ya activos desde este bloque** (10s/20 por hora en comentarios) — la Fase 13 (madurez operativa) hereda un precedente de implementación ya probado en vez de diseñar el mecanismo desde cero.

### Señales nuevas disponibles para la futura Guía IA

- **"Quiero ir"/"Ya fui" como intención y asistencia declaradas**, con fuerza explícitamente distinta de "me gusta" — documentado en `AI_PHILOSOPHY.md` como jerarquía de señales de fuerza creciente, con la advertencia explícita de que "ya fui" nunca equivale a un check-in validado (Fase 9).
- **Comentarios sobre Evento y Publicación como señal de involucramiento real**, más allá de me gusta/guardar — la primera vez que el ecosistema registra texto libre de un usuario sobre contenido específico, con su propia semántica de privacidad (Cuenta eliminada vs. Comentario eliminado) ya documentada para que la Guía IA nunca la interprete incorrectamente.
- **"Me gusta"/"guardado" de Eventos y Lugares consolidados sobre una única fuente de verdad** — cualquier análisis futuro de afinidad ya no necesita reconciliar dos sistemas de datos paralelos.

Ninguna de estas señales se usa hoy para ranking, recomendación ni personalización — quedan registradas y documentadas para cuando la Fase 6 y la Fase 7 las necesiten, mismo patrón ya usado en cada fase anterior.

### Criterios que demuestran que la Fase 5B puede considerarse funcionalmente terminada

1. Los tres bloques planificados están completos — cada uno propuesto, implementado, verificado contra Postgres 16 real y aprobado explícitamente por separado.
2. Los siete defectos reales encontrados durante la propia implementación (dos en el Bloque 1, cinco en el Bloque 3) se detectaron y corrigieron antes de cualquier commit — ninguno llegó a producción de código sin resolver.
3. `events`/Comunidad/Promoción permanecieron verificablemente intactos en todo lo que la fase no debía tocar — confirmado explícitamente en cada bloque, no asumido.
4. Build y lint quedaron limpios, sin advertencias nuevas, al cierre de cada bloque.
5. La reversión se ejecutó de verdad (no solo se razonó) en los tres bloques, confirmando en cada caso que el comportamiento previo se restaura exactamente — con la limitación honestamente documentada de que, para el Bloque 3, esa garantía deja de sostenerse después de que exista uso real (comentarios duplicados reales, comentarios reales de Publicación, reasignaciones reales a "Cuenta eliminada").
6. Toda deuda técnica pendiente está identificada, nombrada explícitamente y documentada como requisito de pre-producción — ninguna quedó oculta o implícita.
7. La discrepancia entre el texto original de `MASTERPLAN.md` (Promoción comentable) y la decisión de producto realmente aprobada e implementada (Promoción excluida) se detectó y corrigió como parte de este mismo cierre — el plan maestro no quedó desactualizado silenciosamente.
8. Las dos decisiones de producto adicionales registradas tras la aprobación del Bloque 3 (permanencia de la eliminación de comentarios, diferencia semántica Cuenta eliminada/Comentario eliminado) quedan documentadas de forma permanente, incluida su incorporación explícita a `AI_PHILOSOPHY.md`.

### Listado de pruebas acumuladas

- Bloque 1: Postgres 16 real (32 migraciones, dos veces), reconciliación bidireccional en ambas direcciones, `events.likes_count` con actor real no superusuario, privacidad de guardado preservada, Comunidad intacta, deduplicación, trigger viejo deshabilitado, reversión ejecutada de verdad.
- Bloque 2: Postgres 16 real (33 migraciones, dos veces), compuerta temporal de "ya fui"/"quiero ir", exclusividad de Eventos, coexistencia simultánea, conservación de intención histórica, deduplicación, RLS de actor ajeno y de sesión ausente, conteos exactos, reversión completa.
- Bloque 3: Postgres 16 real (34 migraciones, múltiples veces, recreación total de la base entre cada corrección), doble conteo, migración campo por campo, índice único parcial (6 tipos + comentario), dos cuentas eliminadas reasignadas al mismo actor sin conflicto, límite de tasa, soft-delete de dos estados, RLS por rol completo (propio/ajeno/admin/Promoción/borrador/`target_type` inválido/invitado/actor de sistema), reversión completa en escenario limpio.
- Build y lint limpios verificados al cierre de cada bloque, sin advertencias nuevas en ningún momento de la fase.
- Playwright limitado, en los tres bloques, a confirmar ausencia de errores de ejecución — misma limitación de entorno aceptada desde la Fase 1, sin proyecto Supabase real desplegado.

### Commits principales de cada bloque

- `6c61b45` — Fase 5B, Bloque 1: Eventos y Lugares migran a `interactions`.
- `cd2b500` — Fase 5B, Bloque 2: reacciones "Quiero ir" y "Ya fui" en Eventos.
- `40bf9e7` — Fase 5B, Bloque 3: comentarios generalizados sobre Evento y Publicación.

---

## Fase 6, Bloque 1 — Motor de Afinidad (implementado)

Primer bloque de la Fase 6 (Descubrimiento inteligente v2), construido bajo triple autoridad de diseño: `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` (20 principios, congelados), `FASE6_CONTRATO_ARQUITECTONICO.md` (arquitectura conceptual de seis componentes) y un análisis técnico de dos rondas explícitamente aprobado antes de escribir una sola línea de SQL. Construye únicamente el Motor de Afinidad: produce, para cada persona, una descripción legible y corregible de qué le interesa — nunca decide qué se muestra en ningún Feed, responsabilidad que queda fuera de alcance de este bloque (Motor de Garantías y Compositor, todavía sin construir).

### Diseño aprobado

- **Evidencia como registro append-only, nunca como contador mutable.** `affinity_contributions` acumula una fila por interacción relevante; ninguna fila ya escrita se actualiza ni se borra jamás. Decisión tomada explícitamente para evitar la clase de defecto ya sufrida dos veces en este proyecto (el huérfano de `reconcile_follows_to_interactions` en la Fase 3, el doble conteo del Bloque 3 de la Fase 5B), ambos originados en un contador que debía mantenerse sincronizado con inserciones y eliminaciones de otra tabla.
- **Todo se calcula en el momento de leer.** Peso, confianza y estado de corrección nunca se guardan como valores precalculados — `affinity_profile()` los deriva siempre desde cero a partir del registro de contribuciones.
- **Jerarquía de fuerza de señal ya establecida, respetada sin modificarla**: `ya_fui`(7) > `seguimiento`(6) > `quiero_ir`(5) > `guardado`(4) > `comentario`(3) > `me_gusta`(2) > `compartir`(1).
- **Decaimiento exponencial con piso, nunca hacia cero.** Media vida de 90 días; ninguna afinidad puede decaer por debajo del 15% de su fuerza acumulada bruta, por mucho tiempo que pase — la evidencia se debilita, nunca desaparece solo por el paso del tiempo.
- **Granularidad categoría y categoría×zona**, sin inventar ninguna taxonomía nueva — reutiliza exactamente las categorías libres ya existentes en cada tipo de contenido. El refinamiento por zona exige una concentración mínima (≥3 contribuciones con zona en la misma categoría) antes de mostrarse, para no fabricar precisión donde solo hay una coincidencia aislada.
- **Tres acciones de corrección explícita**, todas implementadas como filas *agregadas* (nunca como borrado ni mutación): "atenuar" (amortigua permanentemente, sigue decayendo con normalidad), "reiniciar" (limpia la evidencia acumulada mediante una marca de agua — la dimensión desaparece hasta que llegue evidencia nueva), "desconocido" (igual que reiniciar, más una supresión adicional hasta acumular evidencia nueva ≥ umbral 3).
- **Estado de corrección con ventana de vigencia (30 días), nunca una etiqueta congelada.** Un ajuste identificado durante la propia verificación: sin esta ventana, `correction_state` habría quedado marcado "recién corregido" para siempre, incluso años después — violando el principio ya aprobado de que el perfil es siempre la mejor interpretación disponible, nunca una verdad definitiva.
- **Privacidad estricta sin excepciones.** El perfil de afinidad es visible únicamente para su propia dueña — ni siquiera un administrador de plataforma tiene acceso. `affinity_contributions` no tiene ninguna política de RLS de lectura: nadie, ni siquiera su propia dueña, puede leerla directamente — solo se accede a través de `affinity_profile()`, que devuelve exclusivamente el resultado ya agregado.
- **Alcance solo persona.** Un actor de tipo negocio u organizador no acumula afinidad propia en esta fase.
- **Límite de alcance conocido y aceptado**: Promociones no tienen ningún campo de categoría en su esquema (`promotion_details`, desde la Fase 4) — una interacción sobre una Promoción nunca genera contribución de categoría. Eventos no tienen zona estructurada — una interacción sobre un Evento solo contribuye a nivel de categoría, nunca a categoría+zona.
- **Deshacer una interacción no borra su contribución histórica.** El registro es append-only por diseño; solo el decaimiento natural o una corrección explícita reducen la influencia futura de una señal ya registrada.
- **Cinco principios permanentes** incorporados a `FASE6_CONTRATO_ARQUITECTONICO.md` durante el análisis de este bloque: las afinidades describen personas y nunca las clasifican; el perfil es siempre la mejor interpretación disponible, nunca una verdad definitiva; cada afinidad registra su propia última actualización; las afinidades nunca compiten entre sí; el registro append-only existe exclusivamente para preservar la coherencia del aprendizaje del sistema y nunca debe convertirse en cronología visible, historial de actividad ni mecanismo de vigilancia.

### `supabase/migrations/0035_fase6_bloque1_motor_afinidad.sql` (nuevo)

Crea `affinity_contributions` (append-only, RLS habilitado sin ninguna política — deliberadamente sin ninguna vía de lectura directa) con un índice sobre `(actor_id, target_kind, category, followed_actor_id, created_at)`. `record_affinity_contribution()` (`security definer`, disparado `after insert on interactions`) resuelve categoría/zona según el tipo de contenido (evento: solo categoría; lugar: categoría+zona; publicación: categoría propia + zona heredada del negocio autor; actor seguido: dimensión propia; promoción y cualquier otro: sin contribución) y registra la fila con la fuerza correspondiente — nunca modifica `interactions`, que permanece exactamente tan pasivo como antes. `apply_affinity_correction(p_category, p_followed_actor_id, p_correction)` (`security definer`) resuelve siempre el actor propio desde `auth.uid()`, nunca permite corregir el perfil de otra persona. `affinity_profile(check_actor_id)` (`security definer stable`) calcula, para cada dimensión, el peso decaído con piso, la confianza cualitativa (alto/medio/bajo según evidencia bruta acumulada) y el estado de corrección (activo/reiniciado_recientemente/desconocido), respetando la marca de agua de la corrección más reciente y su ventana de vigencia de 30 días.

### Hallazgos encontrados y corregidos durante la verificación (antes de cualquier commit)

Tres defectos reales, ninguno detectado por inspección visual del SQL:

1. **Referencia sin declarar**: la constante `v_reset_recency_days`, introducida para dar vigencia temporal al estado de corrección, se usó en la consulta antes de declararse en el bloque `declare` de `affinity_profile()` — error de compilación detectado en la primera ejecución contra Postgres real.
2. **Tipo incompatible en `make_interval`**: `make_interval(days => v_reset_recency_days)` fallaba porque el parámetro nombrado `days` exige `int`, y la constante se había declarado `numeric` (como las demás constantes de calibración de la función) — corregido con un cast explícito (`v_reset_recency_days::int`).
3. **Privacidad: fuga por comparación con `NULL`** — el mismo patrón de defecto ya encontrado y corregido en la Fase 5B, Bloque 3, reaparecido aquí: la guarda `if v_owner_profile_id is null or v_owner_profile_id <> auth.uid() then return; end if;` produce SQL `NULL` (no `true`) cuando `auth.uid()` es `NULL` (por ejemplo, el rol `anon` sin sesión), y `if NULL then` se comporta como `false` en PL/pgSQL — dejando pasar la lectura sin sesión. Un invitado anónimo podía leer el perfil de afinidad de cualquier persona. Corregido reemplazando la guarda completa por `if v_owner_profile_id is distinct from auth.uid() then return; end if;`.

### Capa de datos (`lib/affinity.js`, nuevo)

`getAffinityProfile(actorId)` y `applyAffinityCorrection({category, followedActorId, correction})` — envuelven únicamente las dos funciones `security definer`; nunca consultan `affinity_contributions` directamente, porque esa tabla no expone ninguna vía de lectura.

### Frontend

`AffinitySection.jsx` (nuevo, `src/features/settings/`), integrado en `SettingsPage.jsx` (`/ajustes`) vía `useMyActorId()`: única superficie donde una persona ve y corrige su propio perfil de afinidad. Muestra cada dimensión de categoría (con el color/etiqueta ya existente de `CHANNELS`) o actor seguido (nombre resuelto vía `getPublicActorProfile`), junto con su nivel de confianza cualitativo y, cuando aplica, su estado de corrección reciente — nunca el peso numérico crudo, que no es información significativa para la persona. Cada fila expone un menú con las tres acciones de corrección aprobadas. Filas refinadas por categoría+zona se excluyen deliberadamente de esta vista — son insumo para el futuro Compositor del Feed, no información adicional que la persona necesite gestionar por separado.

### Verificación realizada

Postgres 16 real, las 35 migraciones aplicadas en orden contra una base limpia (reconstruida por completo entre cada corrección):

- **Cómputo básico**: categoría, categoría×zona (refinado) y actor seguido calculados correctamente sobre un escenario sembrado con 8 interacciones de distinto tipo; Promoción confirmada sin generar ninguna contribución; Evento confirmado sin generar ninguna contribución de zona.
- **Privacidad/RLS**: otra persona no puede leer el perfil ajeno (0 filas); nadie, ni siquiera la propia dueña, puede leer `affinity_contributions` directamente; un invitado sin sesión (`anon`) no puede leer ningún perfil — incluida la corrección del hallazgo 3, reverificada tras limpiar explícitamente el estado de sesión simulada entre sub-pruebas; un actor de tipo negocio no puede generar contribución propia, y de hecho no puede ni insertar la interacción (bloqueado por la RLS ya existente de `interactions`).
- **Tres acciones de corrección**: "atenuar" reduce el peso sin eliminar la dimensión; "reiniciar" hace desaparecer la dimensión hasta que llega una señal nueva, que entonces se muestra con su propio valor, no con el histórico; "desconocido" desaparece y permanece oculta ante una señal nueva débil (bajo el umbral), y reaparece correctamente al acumular evidencia nueva suficiente (≥3).
- **Ventana de vigencia del estado de corrección**: confirmado que `correction_state` muestra "reiniciado_recientemente" mientras la corrección es reciente, y revierte a "activo" una vez que la marca de agua supera los 30 días de antigüedad (verificado retrasando artificialmente la fecha de la corrección).
- **Decaimiento y piso**: una contribución de fuerza 7 retrasada artificialmente 365 días decae exactamente hasta su piso (1.05 = 0.15 × 7), nunca por debajo.
- **Garantía append-only**: eliminar la interacción original (dejar de seguir a un actor) no elimina su contribución histórica ya registrada — confirmado con conteo antes y después.
- **Umbral de refinamiento categoría×zona**: exactamente 2 contribuciones con zona no activan el refinamiento; la tercera sí, apareciendo entonces la fila refinada junto a la de categoría simple, sin reemplazarla.
- **Regresión**: un comentario sobre un Evento sigue creando su fila en `interaction_comments` con normalidad y genera correctamente su propia contribución de afinidad — el nuevo trigger, adjunto a `interactions`, no interfiere con ningún flujo ya existente.

Build y lint limpios (sin advertencias nuevas más allá de las ya conocidas). Playwright limitado a confirmar ausencia de errores de ejecución en la carga de la aplicación — misma limitación de entorno aceptada desde la Fase 1 (sin proyecto Supabase real desplegado, no es posible verificar en este entorno la interfaz autenticada real de `/ajustes` mostrando datos reales).

### Deuda técnica detectada

- **Prueba end-to-end contra un proyecto Supabase real desplegado** — heredada, sin resolver por el mismo motivo de siempre.
- **Los parámetros de calibración** (media vida de 90 días, piso del 15%, umbral de confianza, umbral de refinamiento ≥3, umbral de "desconocido" ≥3, ventana de vigencia de 30 días) son constantes documentadas explícitamente como ajustables, no como arquitectura — cualquier ajuste futuro no debería requerir rediseño, solo recalibración.
- **Ninguna deuda nueva de integridad de datos o privacidad** — las tres correcciones de este bloque se verificaron todas contra Postgres real antes del commit.

### Adenda técnica — dos brechas encontradas en auditoría posterior (`supabase/migrations/0036_fase6_bloque1_resolucion_indirecta_y_revocacion.sql`)

Antes de aprobar definitivamente el bloque, se auditaron dos puntos señalados explícitamente: la resolución de categoría/zona por tipo de objetivo, y la diferencia entre evidencia histórica y señal activa. Ambas auditorías concluyeron que existía una brecha real; se corrigieron hacia adelante (no se reabrió `0035`, ya aplicada — mismo patrón que `0028` sobre `0027`).

**Brecha 1 — resolución indirecta por autor.** `0035` excluía Promoción del aprendizaje y a Publicación sin categoría propia únicamente porque el *detalle* no almacena categoría, ignorando que el *autor* (siempre negocio/organizador con `business_id` — nunca una persona, confirmado en `actor_can_author_publication`/`actor_can_author_promotion`) sí tiene categoría/zona conocidas y públicas en `businesses`. Del mismo modo, seguir a un negocio solo alimentaba la dimensión `actor_seguido`, nunca su categoría/zona; y un Evento solo usaba su categoría propia, ignorando que `events.business_id` (existente desde la migración `0010`) resuelve su zona cuando el evento pertenece a un negocio. Matriz de resolución final:

| `target_type` | Categoría | Zona | Si falta |
|---|---|---|---|
| `actor` (seguir negocio/organizador) | dimensión `actor_seguido` propia **+ nueva**: categoría del negocio seguido | zona del negocio seguido | si es persona, sin categoría/zona |
| `event` | propia | **nueva**: vía `business_id → businesses.zone_id` | sin `business_id`, sin zona — nunca inventada desde `lat`/`lng` (`zones` no tiene geometría) |
| `place` | propia | propia | — |
| `publicacion` | propia, **con fallback nuevo** a la categoría del negocio autor | del negocio autor (sin cambios) | si el autor es "Ahorita Editorial" (sin `business_id`) y sin categoría propia |
| `promocion` | **nueva**: del negocio autor (nunca tuvo propia) | **nueva**: del negocio autor | si el autor no tuviera `business_id` (no debería ocurrir) |

`public.resolve_affinity_category_zone(target_type, target_id)` centraliza esta resolución, compartida entre el trigger de inserción y el nuevo trigger de revocación, para que nunca diverjan. Ninguna relación nueva usa `lat`/`lng` — solo claves foráneas ya existentes.

**Brecha 2 — evidencia histórica vs. señal activa.** Deshacer una interacción alternable (dejar de seguir, quitar un "me gusta"/guardado, retirar "quiero ir"/"ya fui"/compartir) dejaba la contribución original con el mismo peso indefinidamente. Se preserva el registro append-only (nunca se borra ni se muta la fila original) y se agrega `public.record_affinity_revocation()` (`after delete on interactions`) que inserta una fila de **compensación** (`signal_type = 'revocacion'`, fuerza igual a la original en negativo) en la misma dimensión. Como `raw_positive_strength` usa `greatest(strength, 0)`, la compensación nunca cuenta para el piso (la evidencia positiva histórica se preserva), pero el peso decaído neto cae de inmediato hacia el piso apenas se revoca y permanece ahí — nunca crece de nuevo, nunca se vuelve negativo de forma visible. Generaliza sin ningún caso especial a ciclos repetidos (seguir→dejar de seguir→volver a seguir). No se dispara para "comentario" (su soft-delete nunca produce un `DELETE` real sobre `interactions`) ni para ningún `target_type` de contenido eliminado sin resolución posible (se omite silenciosamente, igual que el trigger de inserción). "Compartir" se trata igual que los demás tipos por coherencia estructural, aunque hoy no tiene ningún "deshacer" expuesto en la interfaz.

**Defecto real encontrado durante este mismo análisis, antes de escribir código:** `affinity_contributions.actor_id references actors(id) on delete cascade`. Al eliminar una cuenta, Postgres cascada el borrado de `interactions` de ese actor *dentro de la misma transacción* — el trigger de revocación, al intentar insertar una fila referenciando ese mismo `actor_id`, habría violado la clave foránea (el padre ya es invisible por las reglas de visibilidad MVCC dentro de la propia transacción), abortando la eliminación completa de la cuenta. Prevenido con una guarda explícita: si el actor propietario ya no existe, no se inserta ninguna compensación. **Verificado empíricamente** eliminando una fila real de `auth.users` con un ledger de afinidad existente y confirmando que la cascada completa (auth.users → profiles → actors → interactions → affinity_contributions) se ejecuta sin error y el ledger del actor queda completamente vacío.

**Privacidad:** confirmado que `affinity_contributions` sigue sin ninguna columna `target_id` — estructuralmente imposible reconstruir qué objeto específico fue guardado/interactuado, con o sin las nuevas rutas de resolución (todas usan únicamente atributos públicos del negocio autor).

**Verificación exhaustiva realizada, Postgres 16 real (36 migraciones desde cero):** me gusta en Promoción ahora aporta afinidad vía el negocio autor; publicación/evento con y sin relación confiable de zona (sin inventar ninguna); seguir un negocio aporta tanto a `actor_seguido` como a categoría/zona; comentario en Publicación regular sin regresión; quitar me gusta, guardado, seguimiento y retirar "quiero ir" — los cuatro caen exactamente al piso calculado (`0.15 × fuerza original`) tras la revocación, nunca al valor pleno ni a cero; la fila original y la de compensación coexisten (append-only confirmado); soft-delete de un comentario confirmado sin generar ninguna fila de revocación; cascada completa de eliminación de cuenta sin violación de clave foránea; regresión de decaimiento-con-piso y umbral de refinamiento categoría×zona sin cambios. Build y lint limpios (esta adenda no toca frontend).

### Segunda adenda técnica — precisión final antes del cierre (`supabase/migrations/0037_fase6_bloque1_estado_de_evidencia.sql`)

Dos precisiones finales registradas antes de aprobar conceptualmente el bloque.

**1. Evidencia histórica frente a interés actual.** Se agrega `evidence_status` a la salida de `affinity_profile()`: `'activa'` cuando el peso decaído sin piso (`decayed_weight`, ya calculado internamente) sigue siendo positivo — existe al menos una fracción de evidencia todavía viva tras descontar cualquier compensación; `'historica'` cuando ese mismo valor ya cayó a cero o menos, es decir, cuando el único motivo por el que la dimensión sigue apareciendo es el piso mínimo (protección contra el olvido total), no un interés vigente. Es un criterio puramente aditivo sobre el cálculo ya existente — no rastrea qué contribución individual fue revocada (eso violaría la privacidad ya garantizada), y generaliza correctamente a revocaciones parciales: si de tres "me gusta" en la misma categoría se retira solo uno, el peso decaído de los otros dos sigue siendo positivo, así que la dimensión correctamente permanece `'activa'` — una revocación parcial nunca degrada de más. Igual de importante: una señal nunca revocada pero muy decaída por el simple paso del tiempo (p. ej. un "ya fui" de hace un año) también permanece `'activa'` — el decaimiento natural de un valor positivo nunca cruza a cero o negativo en un tiempo finito, así que `'historica'` distingue específicamente una revocación real, no la mera antigüedad. La confianza (`confidence`) se degrada un nivel cuando `evidence_status = 'historica'` (alto→medio, medio→bajo, bajo se mantiene) — una afinidad sin ninguna evidencia actualmente viva nunca se muestra con la misma confianza que una equivalente en bruto pero todavía activa, aun cuando `raw_positive_strength` (que nunca se modifica, para preservar la historia) sea idéntico en ambos casos. El frontend (`AffinitySection.jsx`) refleja esto con una etiqueta explícita en lenguaje neutral ("Sin señales activas — antecedente histórico"), nunca con una afirmación en presente sobre seguir/guardar/desear asistir.

**2. Contribución multidimensional de seguimiento — reauditada, sin cambios de código.** Se confirmó por análisis de código y se verificó empíricamente que seguir a un negocio/organizador produce exactamente una fila en la dimensión `actor_seguido` y exactamente una fila (condicional) en la dimensión `categoria` — nunca dos veces la misma dimensión por una sola acción. `record_affinity_contribution()` y `record_affinity_revocation()` (rama `target_type = 'actor'`) ya hacían exactamente un `insert` por dimensión, con un `return` inmediato que evita cualquier segunda ruta de escritura — no requirió ningún cambio. Cada dimensión representa una pregunta distinta (¿le interesa este actor específico? vs. ¿le interesa esta categoría/zona en general?); la contribución al actor nunca reemplaza la agregada, y viceversa.

**Verificación exhaustiva realizada, Postgres 16 real (37 migraciones desde cero):**
- Seguir un negocio → `evidence_status = 'activa'`, confianza `'medio'` en ambas dimensiones (`actor_seguido` y `categoria`).
- Dejar de seguir → peso cae al piso exacto (`0.90 = 0.15 × 6`), confianza degradada a `'bajo'`, `evidence_status = 'historica'` en ambas dimensiones simultáneamente.
- Volver a seguir → `evidence_status = 'activa'` de nuevo, confianza recalculada sobre la evidencia bruta acumulada (`'alto'`, al sumarse la nueva contribución a la histórica) — la reconstrucción es correcta y la historia (3 filas: seguimiento/revocación/seguimiento) permanece intacta en el ledger, verificada directamente sobre `affinity_contributions`.
- Revocación parcial (2 de 3 "me gusta" en la misma categoría, se retira solo 1) → `evidence_status` permanece `'activa'`, el peso baja pero no cae al piso — confirmando que una revocación parcial nunca degrada de más.
- Decaimiento puro sin revocación (365 días simulados sobre una señal nunca deshecha) → `evidence_status` permanece `'activa'` a pesar de caer al piso por decaimiento — confirmando que `'historica'` distingue revocación real, no mera antigüedad.
- Regresión de umbral de refinamiento categoría×zona (2 vs. 3) sin cambios de comportamiento.
- Ledger de la dimensión `categoria` y de la dimensión `actor_seguido` verificado con exactamente 3 filas cada uno (seguimiento, revocación, seguimiento) tras un ciclo completo seguir→dejar de seguir→volver a seguir — confirmando que una sola acción nunca duplica su propia dimensión.

Build y lint limpios (frontend actualizado: `AffinitySection.jsx` consume `evidence_status`).

### Qué sigue

Bloque 1 completo y verificado, incluidas ambas adendas técnicas. El resto de la Fase 6 (Motor de Garantías, Motor Editorial, Compositor del Feed) permanece pendiente de análisis y aprobación explícita, bloque por bloque, siguiendo la misma metodología.

---

## Fase 6, Bloque 2 — Motor de Garantías (implementado)

Segundo bloque de la Fase 6, construido tras dos rondas de análisis conceptual y técnico explícitamente aprobadas: análisis conceptual completo (20 puntos, sustentado en `VISION_MAESTRA.md`, `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` y `FASE6_CONTRATO_ARQUITECTONICO.md`), tres precisiones conceptuales adicionales (garantías como oportunidad no obligación; equidad como oportunidad de competir, no visibilidad garantizada; serendipia que debe renovarse), diseño técnico completo, y una adenda técnica resolviendo tres puntos pendientes (rotación determinística de serendipia, responsabilidad exacta de diversidad, propietario de la restricción geográfica) antes de autorizar la implementación. Construye únicamente el Motor de Garantías: produce, por cada carril, un conjunto de **candidatos elegibles** con su razón de explicabilidad — nunca decide el Feed final, nunca ordena, nunca fusiona con afinidad. El Compositor (Bloque 3, todavía sin construir) decidirá composición, deduplicación, interleaving y explicación final.

### Principio permanente incorporado a `FASE6_CONTRATO_ARQUITECTONICO.md`

**La elegibilidad siempre ocurre antes que las garantías.** Primero existe un universo de contenido elegible — público, vigente, de un actor autorizado —, y solo después actúan, sobre ese universo ya elegible, los carriles de novedad, diversidad, equidad y serendipia. Ninguna garantía convierte en elegible un contenido que no lo era; las garantías filtran y limitan cantidad dentro de lo ya elegible, nunca amplían la elegibilidad de base. Este orden es una secuencia arquitectónica fija, no una convención de implementación de este bloque.

### Diseño aprobado

- **Sin estado nuevo persistido.** Igual que `affinity_profile()`, todo se calcula en el momento de leer — ninguna tabla nueva, ningún trigger, ninguna escritura. `interactions` no se toca en absoluto; este bloque ni siquiera la lee directamente, solo el resultado ya agregado de `affinity_profile()` (Bloque 1), y únicamente para excluir de la serendipia las categorías con afinidad fuerte y activa.
- **Alcance de contenido**: solo Eventos, Publicaciones y Promociones — las únicas "Fuentes de contenido" del Feed según el contrato (los Lugares viven en Explorar, nunca en el Feed). El contenido autorado por el actor de sistema "Ahorita Editorial" queda excluido por completo del universo elegible de este bloque — la Editorial tiene su propio mecanismo de inserción paralelo (Motor Editorial, fuera de este bloque).
- **Candidatos por carril, no un Feed compuesto.** Cada función devuelve `target_type, target_id, category, zone_id, actor_id, reason` — nunca una posición ni un orden final. El Motor de Garantías puede **limitar cantidad** (cuántos candidatos de una dimensión entrega) pero nunca **decide orden ni posición** — eso es exclusivamente del futuro Compositor.
- **Garantías como oportunidad, no obligación**: cada carril puede devolver cero candidatos sin relleno artificial — ninguna consulta fuerza un `LIMIT` mínimo.
- **Equidad como oportunidad de competir, nunca visibilidad garantizada**: el carril de equidad añade un criterio (baja frecuencia de publicación reciente del actor) sobre los mismos filtros base que exige cualquier otro contenido (vigencia, verificación) — nunca los remueve, y nunca depende del tamaño del negocio ni de su volumen histórico total.
- **Diversidad limita, no compone**: etiqueta todo el contenido elegible por categoría/zona/actor/tipo, con un tope de candidatos por actor para evitar que uno solo domine el conjunto entregado — nunca decide posiciones consecutivas, cuotas finales por categoría/zona/tipo, ni deduplica candidatos que califican para varios carriles a la vez (eso pertenece exclusivamente al Compositor, que sí ve la composición completa).
- **Serendipia mediante rotación determinística, nunca `random()`**: sembrada por actor + periodo de renovación (día calendario), usando `hashtext()` — reproducible dentro del mismo día, renovada automáticamente al día siguiente, distinta entre personas, sin ninguna memoria de exposición persistida. Excluye únicamente las categorías donde `affinity_profile()` ya muestra `confidence = 'alto'` y `evidence_status = 'activa'` (umbral conservador, deja el resto del espectro disponible).
- **Restricción geográfica compartida** (`geo_eligible()`), reutilizable por el futuro Compositor: zona elegida manualmente siempre gana (preferencia explícita); sin geolocalización ni zona manual, degrada honestamente sin inferir ubicación desde ninguna otra fuente; eventos de planificación futura (más allá de una ventana cercana) quedan exentos del radio estricto; contenido sin coordenada propia nunca se excluye por una distancia no calculable — nunca se infiere ubicación por IP ni ninguna fuente no consentida.

### `supabase/migrations/0038_fase6_bloque2_motor_garantias.sql` (nuevo)

Seis funciones nuevas, todas `security definer stable`, sin tabla ni trigger:

- **`discoverable_content()`**: universo de contenido elegible — Eventos vigentes (`status='publicado'`, `coalesce(end_at,start_at) >= now()`, ventana de `publish_at`/`expires_at`, mismo criterio que `listUpcomingEvents`), Publicaciones y Promociones (`status='publicado'`/`promotion_status() in (...)`, actor verificado `vigente`/`en_gracia`) — excluye por completo al actor de sistema "Ahorita Editorial".
- **`geo_eligible(...)`**: restricción geográfica dura compartida, con la fórmula haversine (radio terrestre 6371 km) ya usada en `lib/directions.js`, para que exista una única definición de "distancia" en todo el proyecto.
- **`candidatos_novedad(...)`**: contenido aparecido en los últimos 7 días.
- **`candidatos_equidad(...)`**: actores con a lo sumo una publicación/evento elegible adicional en los últimos 30 días.
- **`candidatos_diversidad(...)`**: todo el contenido elegible etiquetado, con tope de 3 candidatos por actor.
- **`candidatos_serendipia(check_actor_id, ...)`**: rotación determinística por actor + día calendario, excluyendo categorías con afinidad alta y activa.

### Constantes de calibración

Cuatro ya fijadas en la adenda técnica (ventana de novedad: 7 días; ventana de baja frecuencia de equidad: 30 días; umbral de afinidad que excluye de serendipia: `confidence='alto'` y `evidence_status='activa'`; periodo de renovación de serendipia: 1 día calendario) — más dos adicionales, necesarias para que `geo_eligible()` sea operativa y explícitamente señaladas para revisión: radio de cercanía (5 km) y ventana de exención por planificación futura (3 días).

### Verificación realizada

Postgres 16 real (38 migraciones desde cero, múltiples veces):

- **Elegibilidad de base**: negocio sin verificar excluido por completo de `discoverable_content()`; negocio verificado vigente incluido; evento sin `business_id` (admin) incluido sin exigir verificación; evento vencido o fuera de la ventana de `publish_at`/`expires_at` excluido.
- **Novedad**: contenido de más de 7 días correctamente excluido; contenido reciente incluido.
- **Equidad**: actor con una sola publicación reciente calificado; actor con alta frecuencia (5 y 3 publicaciones/eventos en 30 días) correctamente excluido — verificado que la exigencia de vigencia/verificación nunca se relaja para este carril.
- **Diversidad**: actor con 6 contenidos elegibles correctamente acotado a 3 en el conjunto entregado; actores con menos contenido, sin cambios.
- **Serendipia**: categoría con afinidad `alto`+`activa` correctamente excluida para esa persona; misma categoría disponible para un llamador anónimo (sin afinidad que excluir); dos lecturas en el mismo día producen exactamente el mismo orden byte a byte; el mismo cálculo de hash con una fecha distinta produce un orden completamente diferente (renovación confirmada); dos semillas de actor distintas sobre el mismo contenido producen órdenes distintos, sin ninguna tabla de historial de por medio.
- **Geografía**: ubicación autorizada cercana elegible, lejana rechazada; sin ubicación ni zona manual, elegible sin importar distancia (degradación honesta); zona manual gana sobre cualquier coordenada, en ambos sentidos (incluye lo que está en esa zona aunque esté lejos, excluye lo que no está en esa zona aunque esté cerca); contenido sin coordenada propia nunca excluido; evento de planificación futura exento del radio; evento de hoy lejano correctamente rechazado.
- **Sin relleno artificial**: un carril restringido a una zona sin contenido devuelve exactamente cero filas.
- **Sin deduplicación prematura**: un ítem que califica para novedad y equidad simultáneamente aparece en ambos conjuntos, sin que ninguno de los dos lo excluya.
- **Regresión completa del Bloque 1**: cómputo básico, privacidad/RLS, las tres correcciones y `evidence_status` sin ningún cambio de comportamiento tras agregar las seis funciones nuevas.

Build y lint limpios — sin cambios de frontend en este bloque (no existe todavía ningún consumidor visible de estos candidatos; el Compositor, Bloque 3, es quien los usará).

### Deuda técnica y puntos señalados para revisión

- ~~Radio de cercanía (5 km) y ventana de exención por planificación futura (3 días)~~ — **resuelto**, ver adenda técnica abajo.
- **Prueba end-to-end contra un proyecto Supabase real desplegado** — heredada, sin resolver por el mismo motivo de siempre.
- **Ninguna deuda nueva de integridad de datos o privacidad.**

### Adenda técnica — revisión de las dos constantes geográficas (`supabase/migrations/0039_fase6_bloque2_calibracion_geografica.sql`)

Antes de cerrar definitivamente el bloque, se auditaron las dos constantes señaladas explícitamente en el informe final. La auditoría concluyó que ambas tenían una brecha real; se corrigieron hacia adelante (no se reabrió `0038`).

**Hallazgo 1 — radio único de 5 km.** No resistía el análisis: 5 km ya cubre gran parte del área urbana inmediata de Cuenca, debilitando el propósito de "cercanía para ahorita" (`VISION_MAESTRA.md` §7), y penalizaba injustamente contenido de naturaleza/rutas por su tamaño de radio, no por su categoría. Se reemplaza por **dos radios según la temporalidad del contenido, nunca según su categoría**: radio inmediato (3 km) para Promociones y Publicaciones siempre, y para Eventos dentro de la ventana cercana; radio de planificación (15 km) exclusivamente para Eventos cuyo inicio supera el umbral de antelación — nunca Promociones ni Publicaciones, que no tienen la naturaleza de "ocurre una vez, en un momento específico por venir" (esto ocurre estructuralmente, porque `p_event_start_at` es `NULL` para esos dos subtipos en `discoverable_content()`, no por una validación adicional).

**Hallazgo 2 — exención total de radio para planificación futura.** Podía anular por completo la restricción de cercanía, exactamente el riesgo señalado. Se reemplaza por el radio ampliado de planificación (15 km) — nunca una exención completa. El umbral de 3 días se conserva: combinado con el radio ampliado, ya resuelve que un evento con 4-5 días de antelación no quede excluido injustificadamente, sin necesidad de anular la cercanía.

**Hallazgo 3 — `geo_eligible()` solo devolvía un booleano.** Descartaba la razón por la que un contenido pasaba la restricción. El futuro Compositor necesitará distinguir "cercanía confirmada" de "sin ninguna restricción evaluable" para nunca mostrar "está cerca de ti" sobre contenido cuya proximidad nunca se verificó — hoy ningún carril de este bloque genera esa razón (sus explicaciones son fijas y no geográficas), pero la distinción debe existir para cuando el Compositor la necesite. Se reemplaza el booleano por un estado textual (`zona_manual` / `confirmada_cercana` / `planificacion_futura` / `sin_restriccion` / `NULL` para no elegible), expuesto también como nueva columna `geo_status` en las cuatro funciones `candidatos_*`.

**Hallazgo 4 — auditoría.** Las constantes de este bloque estaban repetidas como literales dentro de cada función. Se centralizan **todas** (no solo las dos geográficas) en `public.discovery_calibration()`, única fuente de verdad — cualquier ajuste futuro es una migración nueva, auditable por el mismo historial de git que ya gobierna cada constante del Bloque 1.

**Valores revisados**: radio inmediato 3 km (antes: radio único de 5 km); radio de planificación 15 km (antes: exención total); umbral de planificación 3 días (sin cambio, pero ahora selecciona un radio en vez de eximir por completo).

**Verificación exhaustiva realizada, Postgres 16 real (39 migraciones desde cero):** las diez combinaciones exactas pedidas — promoción dentro/fuera del radio inmediato, evento hoy dentro/fuera del radio, evento dentro de 3 días fuera del radio inmediato (correctamente excluido, no aplica todavía el radio de planificación), evento después de 3 días dentro del radio de planificación (`planificacion_futura`) y más allá de 15 km (excluido incluso con el radio ampliado), zona manual ignorando coordenadas en ambos sentidos, contenido con zona pero sin coordenadas (`sin_restriccion`, nunca excluido ni etiquetado como cercano), contenido sin ninguna ubicación estructurada, ausencia de permiso de ubicación, y confirmación estructural de que ningún parámetro de IP existe en la función. Verificado además end-to-end a través de `candidatos_novedad()` con coordenadas reales (cercana incluye con `confirmada_cercana`, lejana excluye). Regresión completa del Bloque 1 y de los cuatro carriles (novedad, equidad, diversidad, serendipia) sin cambios de comportamiento tras el refactor de calibración centralizada. Build y lint limpios (sin cambios de frontend).

### Qué sigue

Bloque 2 completo y verificado, incluida la adenda de calibración geográfica. El resto de la Fase 6 (Motor Editorial, Compositor del Feed extendido) permanece pendiente de análisis y aprobación explícita, bloque por bloque, siguiendo la misma metodología.

## Fase 6, Bloque 3 — Motor Editorial (implementado)

Tercer bloque de la Fase 6, construido tras un análisis exhaustivo de 22 puntos (auditoría evidence-based de los mecanismos editoriales ya existentes: `events.editor_pick` y el Actor de sistema "Ahorita Editorial", confirmando que estaban completamente desconectados y que la autoría nunca implicó ventaja algorítmica), tres precisiones conceptuales adicionales (el Compositor tiene seis entradas, nunca cinco; "ningún carril llega a cero" distingue ausencia real de ausencia causada por composición; auditoría reproducible sin historial de exposición personal), un diseño técnico completo de 16 puntos, y una revisión de ese diseño con cuatro ajustes arquitectónicos explícitos antes de autorizar la implementación.

### Los cuatro ajustes arquitectónicos incorporados antes de implementar

1. **`editorial_selections` deja de ser append-only** — una fila única y mutable por `(target_type, target_id)`, con reactivación sobre la misma fila. A diferencia de `affinity_contributions` (aprendizaje automático) o `verifications` (ciclo de vida con transiciones automáticas por cron), aquí no existe ningún proceso automático ni concurrente que dependa de una cronología completa — es una decisión humana, manual, de un único rol.
2. **`candidatos_editorial()` sin límite de cantidad** — devuelve todos los candidatos elegibles; cantidad, posición e interleaving quedan reservados por completo al futuro Compositor.
3. **Sin `editorial_calibration()` propia** — al quitar el límite de cantidad no quedó ninguna constante nueva que calibrar; `discovery_calibration()` (Bloque 2) sigue siendo la única fuente de calibración de todo el sistema de descubrimiento.
4. **`reason_code` técnico separado de la redacción visible** — la función devuelve un enum cerrado, nunca una frase ya construida; la resolución a texto es una capa de presentación posterior, permitiendo varias redacciones por código sin multiplicar el catálogo.

### Principio permanente incorporado a `FASE6_CONTRATO_ARQUITECTONICO.md`

**Editorial nunca existe para corregir al algoritmo; existe para aportar criterio humano allí donde el algoritmo, por naturaleza, nunca puede sustituirlo.** El Motor Editorial no ajusta ni compensa lo que produzcan la Afinidad o las Garantías — nunca recibe su resultado como entrada para "corregirlo", y ninguna selección editorial se justifica en términos de lo que el algoritmo no mostró.

### `supabase/migrations/0040_fase6_bloque3_motor_editorial.sql` (nuevo)

- **`public.editorial_selections`**: fila única por `(target_type, target_id)` — `reason_code` (enum cerrado: `seleccionado_equipo`/`informacion_util`/`relevante_fecha`/`historia_ciudad`), `starts_at`/`ends_at` (`check` de ventana válida), `created_at` (protegido por trigger, inmutable), `decided_by`/`decided_at` (siempre la decisión vigente), `revoked_by`/`revoked_at` (`check` de pareo: ambos o ninguno). **Sin ninguna política de `INSERT`/`UPDATE`/`DELETE`** — ni siquiera `is_admin()` puede escribirla directamente.
- **`public.set_editorial_selection(...)`** y **`public.revoke_editorial_selection(...)`** (`security definer`, solo `is_admin()`): único camino de escritura sancionado — upsert que crea/reactiva/modifica, y retiro explícito que nunca elimina la fila.
- **`public.validate_editorial_selection_target()`** (trigger `before insert or update`): exige que el contenido exista de verdad y rechaza una Publicación con `subtype='promocion'` aunque `target_type='publicacion'` — exclusión permanente de Promociones.
- **`public.candidatos_editorial(...)`**: universo completo de candidatos elegibles (sin límite), con `reason_code` crudo y `geo_status` (reutiliza `geo_eligible()` del Bloque 2). Base de elegibilidad deliberadamente opuesta a `discoverable_content()`: permite al actor "Ahorita Editorial" y a eventos sin negocio/organizador detrás, exige verificación `vigente`/`en_gracia` solo cuando el autor sí es negocio/organizador.
- **`public.editorial_selection_public(...)`**: lectura pública segura (mismo patrón que `actor_verification_badge()`) — expone `reason_code`/vigencia/estado activo-revocado, nunca `decided_by` ni `revoked_by`.
- **Backfill de `events.editor_pick`**: administrador determinístico (el más antiguo registrado); falla explícitamente si no existe ninguno. La columna queda legacy, sin nuevas escrituras desde la aplicación.

### Frontend

- **`src/lib/editorial.js`** (nuevo): `listEditorialSelectedEventIds()`, `getEventEditorialSelection()`, `setEventEditorialSelection()` (retirar algo ya no seleccionado es un no-op, no un error), `describeEditorialError()`.
- **`src/lib/feed.js`**: `pickEditorSelection()` ahora recibe el conjunto de ids seleccionados vía `listEditorialSelectedEventIds()` en vez de leer `event.editor_pick` — mismo comportamiento visible, "Selección del editor" sin ningún cambio para quien usa la app.
- **`src/pages/admin/AdminEventEditorPage.jsx`**: la casilla "Incluir en Selección del editor" ya no escribe `events.editor_pick` — lee el estado inicial vía `getEventEditorialSelection()` y guarda mediante `setEventEditorialSelection()` como un paso posterior al guardado del evento.

### Verificación realizada

Postgres 16 real (40 migraciones desde cero):

- **Backfill**: los 3 eventos ya marcados con `editor_pick=true` migraron exactamente una vez cada uno, sin duplicados, atribuidos al administrador más antiguo; simulación sin ningún administrador registrado confirmó el fallo explícito de la migración.
- **`candidatos_editorial()`**: exactamente los 7 candidatos esperados (3 migrados + 1 evento de negocio verificado + 1 evento sin negocio + 2 publicaciones, una de ellas del Actor "Ahorita Editorial") — evento con autor de verificación revocada, evento oculto, evento finalizado, publicación con autor revocado, publicación oculta y la Promoción, todos ausentes tal como se esperaba pese a tener una fila de selección activa.
- **Rechazos explícitos**: Promoción rechazada al intentar seleccionarla aunque `target_type='publicacion'`; contenido inexistente rechazado; ventana `starts_at`/`ends_at` inválida rechazada por el `check`; negocio intentando autoseleccionarse rechazado por no ser admin.
- **Reactivación**: ciclo completo revocar → reseleccionar (con un segundo administrador) confirmando `created_at` preservado, `decided_at`/`decided_by` actualizados a la decisión vigente, `revoked_at`/`revoked_by` limpiados.
- **Geografía**: `geo_status` correcto con coordenadas reales (`confirmada_cercana`, `planificacion_futura` para el evento más lejano en el tiempo, `sin_restriccion` para contenido sin coordenadas propias) y con zona manual.
- **Sin relleno**: tras revocar todas las selecciones, `candidatos_editorial()` devuelve exactamente cero filas.
- **Selección vencida**: `ends_at` en el pasado ausente de `candidatos_editorial()`; la misma publicación con ventana vigente, presente.
- **RLS con roles de bajo privilegio**: lectura cruda de `editorial_selections` denegada a un negocio no-admin, permitida a un admin; escritura directa denegada incluso otorgando `GRANT INSERT/UPDATE` y siendo admin, porque no existe ninguna política que la permita — solo las dos funciones dedicadas pueden escribir.
- **Defensa en profundidad**: el `check` de pareo `revoked_at`/`revoked_by` rechazó una inserción directa que los violaba, incluso sorteando RLS como superusuario.
- **Lectura pública**: `editorial_selection_public()` confirmado sin `decided_by` ni `revoked_by` en su proyección.
- **Reversión ejecutada de verdad** en un escenario limpio: eliminar `editorial_selections` no afectó `events`/`publications`, los 3 eventos con `editor_pick=true` conservaron su valor intacto — documentado honestamente que las selecciones nuevas de Publicaciones (nunca representables en la columna legacy) se perderían al revertir.
- **Regresión completa** del Bloque 1 y el Bloque 2 sin cambios de comportamiento.

Build y lint limpios. **Verificación visual en navegador (Playwright) no pudo ejecutarse en este entorno**: el proyecto usa una instancia local de Supabase (`http://127.0.0.1:54321`) que requiere Docker con la CLI de Supabase inicializada, y ese stack no estaba disponible/configurado en este entorno de ejecución — se dice esto explícitamente en vez de reclamar una verificación visual que no ocurrió. La verificación de base de datos (Postgres 16 real, RLS con roles de bajo privilegio) fue exhaustiva; el build de producción confirma que el código compila y los tipos de datos encajan, pero no sustituye una prueba de interacción real en navegador.

### Deuda técnica y puntos señalados para revisión

- **Prueba end-to-end contra un proyecto Supabase real desplegado (incluyendo Playwright)** — heredada, sin resolver por el mismo motivo de siempre, agravada en este bloque por la ausencia de una instancia local de Supabase en el entorno de ejecución.
- **Ninguna deuda nueva de integridad de datos o privacidad.**

### Qué sigue

Bloque 3 completo y verificado. Queda pendiente el cierre formal de este bloque (informe final para revisión y aprobación explícita) antes de avanzar al Compositor del Feed — el único componente restante de la Fase 6.

---

## Fase 6, Bloque 4 — Compositor del Feed (implementado)

Cierra la Fase 6: último componente. Construido tras un diseño técnico de 25 puntos y una revisión adicional de 7 puntos (proporción de Afinidad, anti-monopolio transversal, propiedad completa de Editorial, estabilidad por bloques horarios, proporciones relativas en vez de una cantidad fija, disciplina de rendimiento, y el nuevo principio "el Compositor nunca intenta ser inteligente") — los cuatro principios de esa revisión quedaron registrados en `FASE6_CONTRATO_ARQUITECTONICO.md` antes de autorizar la implementación.

### Piezas nuevas

- **`discovery_calibration()` extendida** (no una función nueva — principio ya fijado desde el Bloque 3): agrega las seis proporciones del Compositor (afinidad 35%, novedad 15%, diversidad 20%, equidad 10%, serendipia 10%, editorial 10% — calibración inicial, ajustable por migración futura) y las constantes de anti-monopolio/estabilidad (ventana de 10, topes por actor/categoría/zona/tipo, brecha editorial mínima de 3, bloque de estabilidad de 4 horas).
- **`candidatos_editorial()` extendida** (Bloque 3): agrega `zone_id` a su proyección (ya tenía `category`/`actor_id` desde el Bloque 3) — el Compositor los necesita para deduplicar y aplicar anti-monopolio, sin tocar ninguna regla de elegibilidad ya verificada.
- **`candidatos_afinidad()` (nueva)**: la pieza que le faltaba a Afinidad — hasta ahora solo existía `affinity_profile()` (una descripción, Bloque 1), nunca un generador de candidatos. Lee `discoverable_content()` (mismo universo que Garantías, excluye a Editorial) cruzado contra `affinity_profile()` por categoría o por actor seguido, con confianza `medio`/`alto` y `evidence_status='activa'`. Sin `check_actor_id` (invitado): cero candidatos, nunca personalización fabricada. Aplica ya aquí el tope de candidatos por actor (mismo mecanismo de Diversidad) para que un único actor con mucho contenido afín no sature por sí solo el cupo de Afinidad.
- **`compose_feed_item` (tipo compuesto) y `compose_feed()` (el Compositor)**: fusiona las seis entradas, deduplica, ordena mediante colas justas ponderadas (weighted fair queuing — la posición k-ésima de un carril con peso W recibe la clave `k/W`; ordenar por esa clave produce un entrelazado proporcional determinista, sin ninguna fórmula de puntuación), aplica anti-monopolio en una pasada lineal, y pagina por clave de identidad (`target_type`, `target_id`) — nunca `OFFSET`.

### Deduplicación y propiedad

Editorial reclama siempre por completo (cupo, propiedad y explicación) cuando un ítem también califica para otra entrada. Entre las cinco entradas restantes, la propiedad no sigue una lista fija de prioridad: decide primero la **escasez** (el carril con menos candidatos totales se queda con el ítem compartido, para que un carril abundante — p. ej. Novedad tras una ráfaga de contenido — nunca pueda, por su propio volumen, hacer desaparecer de la composición a un carril escaso con candidatos reales) y, entre carriles igual de escasos, el desempate final es la misma rotación determinística ya usada en Serendipia (hash por semilla+carril+ítem), nunca una preferencia fija que sistemáticamente favorezca siempre al mismo carril.

**Hallazgo real corregido durante la verificación**: la primera versión usaba una lista de prioridad fija (Editorial > Afinidad > Novedad > Equidad > Serendipia > Diversidad) para resolver la propiedad de ítems compartidos. Contra datos sembrados donde Novedad y Diversidad/Serendipia comparten casi el mismo universo (contenido recién publicado), esa lista dejaba a Diversidad y Serendipia con **cero** ítems propios pese a tener candidatos reales — una violación directa del principio recién registrado ("la ausencia real de candidatos es válida; la desaparición causada por la propia composición no lo es"). Corregido hacia el mecanismo de escasez + hash descrito arriba, verificado con datos de concentración de actor variable hasta confirmar que ambos carriles reciben propiedad real y proporcional.

### Anti-monopolio

Ventana deslizante (actor/categoría/zona/tipo) más la regla dura de no-consecutivos-del-mismo-actor y la brecha mínima entre piezas Editoriales. Lo que viola se difiere, nunca se descarta. **Hallazgo real corregido**: la primera versión de la segunda pasada (colocación de diferidos) los insertaba en su orden original fijo, lo que podía repetir la misma violación entre dos diferidos consecutivos del mismo actor. Corregido: en cada paso se busca, entre TODOS los diferidos restantes, el primero que ya no viole la regla contra lo último colocado — solo si ninguno la evita se acepta el primero como último recurso documentado. Verificado con datos de concentración de actor extrema (un solo actor con 6 de ~45 ítems del universo) que el número de aceptaciones de último recurso baja a cero conforme la concentración de actor se acerca a un dato realista, confirmando que el mecanismo no es la causa — es la escasez de diversidad de actor en el dato sintético.

### Rendimiento

Medido con `EXPLAIN ANALYZE` contra un conjunto sintético de 210 eventos y 69 negocios (no el puñado de filas usado para verificar reglas funcionales). **Cuello de botella real encontrado y corregido**: la comprobación de anti-monopolio usaba `(select count(*) from unnest(ring_actor) x where x = ...)` — una subconsulta correlacionada por cada una de cuatro reglas, por cada ítem — costando 663 ms para una página de 20. Reemplazado por `cardinality(array_positions(ring_actor, ...))` (una función nativa de array, sin subconsulta) — el mismo cálculo baja a 115 ms, una mejora de ~5.8×. Verificado que la corrección no cambió ningún resultado (dedup y anti-monopolio re-verificados idénticos). Cuello de botella conocido y **conscientemente diferido** (no corregido ahora): `discoverable_content()` se evalúa de forma independiente dentro de cada una de las cinco funciones `candidatos_*` que la consumen (Afinidad, Novedad, Diversidad, Equidad, Serendipia) en vez de una sola vez compartida — aceptable a 115 ms para el volumen real de una sola ciudad; revisitar solo si se mide como un problema real a mayor escala, nunca por anticipado.

### Verificación realizada

Postgres 16 real (41 migraciones desde cero, reconstruido varias veces durante la depuración):

- Deduplicación sin duplicados verificada hasta con 300 ítems en la composición.
- Propiedad por escasez + desempate por hash verificada con datos de concentración de actor variable (ver hallazgo arriba).
- Editorial reclama por completo un ítem que también calificaba para Novedad y Serendipia — confirmado con `internal_carriles`.
- Filtro de canal: solo devuelve ítems de la categoría pedida.
- Paginación: cursor por `(target_type, target_id)` verificado sin solapamiento entre página 1 y página 2.
- Anti-monopolio: cero violaciones de adyacencia con distribución de actor realista; aceptaciones de último recurso documentadas y explicadas con datos de concentración extrema (ver hallazgo arriba).
- RLS con roles de bajo privilegio: `candidatos_afinidad()`, `candidatos_editorial()` y `compose_feed()` verificados con `authenticated` (negocio, no admin) y con `anon` — ambos funcionan (son de lectura pública/agregada, sin exponer nada privado); `affinity_profile()` para un actor de tipo `negocio` devuelve cero filas (sin concepto de afinidad propia, ya establecido desde el Bloque 1).
- **Reversión ejecutada de verdad, con un hallazgo real**: revertir el Bloque 4 no es solo borrar `compose_feed()`/`candidatos_afinidad()`/el tipo nuevo — `discovery_calibration()` y `candidatos_editorial()` fueron **extendidas en el mismo lugar**, no creadas de nuevo, así que revertir de verdad exige devolverlas a su forma exacta de Bloque 2/3 (confirmado: sin esa restauración, `candidatos_novedad()` y el resto de Bloque 2 quedan rotos). Con la restauración correcta, `candidatos_novedad()`/`candidatos_editorial()`/`events`/`editorial_selections` quedaron exactamente como antes, sin ninguna pérdida de datos.
- Regresión completa de los Bloques 1, 2 y 3 sin cambios de comportamiento.

Build y lint limpios. **Verificación visual en navegador (Playwright) no pudo ejecutarse en este entorno**, por el mismo motivo ya declarado en el Bloque 3 (sin instancia local de Supabase disponible) — se dice explícitamente, no se reclama una prueba que no ocurrió.

### Frontend

- **`src/lib/feed.js`**: nueva `getComposedFeed({ channel, actorId, afterTargetType, afterTargetId, pageSize })` — llama a `compose_feed()`, reutiliza sin cambios las mismas funciones de obtención (`listUpcomingEvents`, `listPublishedFeedPublications`, `listPublishedFeedPromotions`) y de mapeo a tarjeta ya usadas por `getFeed()`, y calcula también la "Selección del editor" (superficie separada, coexiste sin conflicto con los ítems editoriales que ya aparecen intercalados). `getFeed()` se conserva intacta, sin usarse ya en `FeedPage`, como camino de reversión de un paso.
- **`src/pages/FeedPage.jsx`**: cambia de `getFeed` a `getComposedFeed`; agrega paginación con un botón "Cargar más" (cambio mínimo de interfaz, sin scroll infinito ni rediseño); muestra la razón de composición como un subtítulo breve sobre cada tarjeta; "Selección del editor" se conserva en la misma posición relativa (después del primer ítem) que tenía antes.

### Deuda técnica y puntos señalados para revisión

- **Prueba end-to-end contra un proyecto Supabase real desplegado (incluyendo Playwright)** — heredada, sin resolver por el mismo motivo de siempre.
- **`discoverable_content()` evaluado de forma independiente por cinco funciones dentro de una misma composición** — conscientemente diferido, ver sección de Rendimiento arriba.
- **Ninguna deuda nueva de integridad de datos o privacidad.**

### Qué sigue

Bloque 4 completo y verificado — con él, los seis componentes de la Fase 6 (Fuentes de contenido, Registro de señales, Motor de Afinidad, Motor de Garantías, Motor Editorial, Compositor del Feed) están implementados. Queda pendiente el informe final de este bloque para tu revisión y aprobación explícita, y con ella, el cierre formal de toda la Fase 6.

---

## FASE 6 CERRADA — Descubrimiento inteligente v2 (2026-07-23)

Cierre formal de la Fase 6 completa del `MASTERPLAN.md`, tras una auditoría explícita de siete puntos (código y migraciones, coherencia documental, código, pureza arquitectónica, principios permanentes, rendimiento, deuda técnica consolidada) presentada al Product Owner antes de escribir una sola corrección, siguiendo la misma metodología de cierre ya aplicada a la Fase 4 y la Fase 5B. Checkpoint de Git: tag `checkpoint-fase6-descubrimiento-inteligente`, creado localmente; el `git push` del tag fue rechazado por el remoto con `403` en este entorno — la misma restricción que, verificado ahora explícitamente, ya afectaba en silencio a los seis tags de checkpoint anteriores (ninguno de `checkpoint-admin-eventos-lugares` a `checkpoint-fase5b-interaccion-social` existe tampoco en `origin`, según `git ls-remote --tags`). Se documenta aquí honestamente en vez de asumir que el tag quedó respaldado remotamente: el historial de commits en la rama remota es, en este entorno, el único registro de checkpoint verificablemente sincronizado.

### Resumen ejecutivo

La Fase 6 reemplazó el feed "solo proximidad temporal" por una composición de seis entradas co-iguales — nunca una fórmula de puntuación — construida en cuatro bloques, cada uno propuesto, implementado y verificado contra Postgres 16 real por separado: el **Motor de Afinidad** (Bloque 1), que describe a cada persona sin clasificarla nunca, con corrección explícita y privacidad estricta sin excepciones; el **Motor de Garantías** (Bloque 2), que asegura que novedad, diversidad, equidad y serendipia nunca lleguen a cero, actuando junto a la afinidad, nunca como corrección posterior; el **Motor Editorial** (Bloque 3), que reemplaza el booleano `editor_pick` por un mecanismo con autoría, motivo y ciclo de vida, sin competir jamás con el cálculo algorítmico; y el **Compositor del Feed** (Bloque 4), que integra las seis entradas mediante colas justas ponderadas (weighted fair queuing), con anti-monopolio transversal y deduplicación por escasez, sin intentar "ser inteligente" por sí mismo. Toda la fase se construyó bajo triple autoridad documental — `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` (veinte principios filosóficos, previos a cualquier diseño técnico), `FASE6_CONTRATO_ARQUITECTONICO.md` (arquitectura de seis componentes, con varios principios permanentes adicionales incorporados durante la propia implementación — uno por cada bloque, más los cuatro específicos del Compositor) y `VISION_MAESTRA.md` — y encontró y corrigió, durante su propia verificación contra Postgres real, ocho defectos reales no detectados por inspección visual del código, más cinco hallazgos adicionales (uno crítico, cuatro importantes) detectados en una auditoría final de liberación posterior al cierre inicial (ver más abajo).

### Objetivo original y resultado final

**Objetivo original** (`MASTERPLAN.md`, texto previo a esta fase): un modelo híbrido de puntuación (afinidad + peso editorial + peso de promoción + decaimiento de frescura) sobre tablas `affinity_scores`/`feed_config`.

**Resultado final**: ese plan quedó completamente reemplazado, antes de escribirse una sola línea de código, por `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` y `FASE6_CONTRATO_ARQUITECTONICO.md` — ninguna de esas dos tablas llegó a existir. Lo construido es deliberadamente distinto de una fórmula: seis entradas co-iguales sin ranking combinado, proporciones siempre relativas (nunca una cantidad fija de posiciones), anti-monopolio reutilizado transversalmente en vez de reglas distintas por carril, y Editorial con propiedad completa y explícita en vez de un peso más dentro del cálculo. `MASTERPLAN.md` (sección Fase 6) y `ARCHITECTURE.md` (§21) quedaron corregidos como parte de este mismo cierre, exactamente igual que ya ocurrió con la sección de Promoción-comentable de `MASTERPLAN.md` durante el cierre de la Fase 5B — el plan maestro no queda desactualizado silenciosamente.

### Bloques implementados

1. **Bloque 1 — Motor de Afinidad** (migraciones `0035`-`0037`): perfil de afinidad legible y corregible por la propia persona, jerarquía de fuerza de señal, decaimiento exponencial con piso, tres acciones de corrección explícita, privacidad estricta sin excepciones. Dos adendas técnicas (resolución indirecta por autor + revocación, y precisión de evidencia activa/histórica) resolvieron brechas encontradas en auditoría posterior, antes del cierre del bloque.
2. **Bloque 2 — Motor de Garantías** (migraciones `0038`-`0039`): cuatro carriles (novedad, equidad, diversidad, serendipia) que producen candidatos elegibles sin decidir nunca el orden final. Una adenda técnica corrigió el radio geográfico único (reemplazado por radio inmediato + radio de planificación) y expuso `geo_status` para explicabilidad futura.
3. **Bloque 3 — Motor Editorial** (migración `0040`): reemplaza `events.editor_pick` (legacy desde este bloque) por `editorial_selections`, con autoría, motivo, ventana de vigencia y revocación — exclusivamente escribible por `is_admin()`.
4. **Bloque 4 — Compositor del Feed** (migración `0041`): fusiona las seis entradas mediante weighted fair queuing, con deduplicación por escasez + hash determinístico, anti-monopolio transversal en una pasada lineal, y paginación por clave de identidad.

### Arquitectura lograda

- **Seis componentes conceptuales con responsabilidad única, sin superposición**: Fuentes de contenido, Registro de señales (pasivo), Motor de Afinidad (describe, nunca decide), Motor de Garantías (protege, nunca personaliza), Motor Editorial (criterio humano, nunca compite), Compositor del Feed (integra, nunca interpreta).
- **Elegibilidad antes que garantías, garantías antes que composición** — secuencia arquitectónica fija verificada en cada bloque: ninguna garantía amplía el universo elegible de base; el Compositor nunca recibe nada que no haya pasado ya por elegibilidad.
- **Quince principios permanentes incorporados a `FASE6_CONTRATO_ARQUITECTONICO.md`** durante la implementación (cinco del Motor de Afinidad, uno de elegibilidad-antes-que-garantías, uno del Motor Editorial, uno de determinismo/adaptabilidad, cuatro del Compositor, más los ya vigentes de pureza de componentes) — todos re-verificados en esta auditoría de cierre contra el código real, ninguno quedó violado por la implementación.
- **Sin fórmula de puntuación en ningún punto del sistema**: ni el Motor de Afinidad, ni el Motor de Garantías, ni el Compositor combinan señales en un único número — cada componente produce candidatos o composición explicable, nunca un score opaco.
- **`security definer set search_path = public` como patrón consolidado** en las 20 funciones nuevas de la fase, sin ninguna excepción.
- **Weighted fair queuing** (técnica de scheduling de redes, reutilizada aquí) como mecanismo de interleaving proporcional determinista — elegido específicamente porque no requiere redistribución iterativa y no permite que la abundancia de un carril desplace la cuota justa de otro.

### Decisiones de producto incorporadas

- Reducción de la proporción inicial de Afinidad del 40% al 35%, con el 5% liberado reasignado específicamente a Diversidad (nunca repartido arbitrariamente).
- Anti-monopolio transversal: mismo mecanismo (tope de candidatos por actor) reutilizado dentro de cada carril, nunca una regla nueva inventada por carril.
- Editorial reclama por completo el contenido que le corresponde — cupo, propiedad y explicación — cuando compite con cualquier otra entrada.
- Estabilidad por bloques horarios (4 horas, configurable) en vez de estabilidad diaria completa.
- Proporciones siempre relativas al universo elegible real de cada solicitud, nunca una cantidad fija de posiciones — cualquier número de referencia es pedagógico, nunca parte del algoritmo.
- Verificación de rendimiento obligatoria con `EXPLAIN ANALYZE` contra un dataset sintético mayor al funcional, como parte del criterio de cierre del Compositor.
- "El Compositor nunca intenta ser inteligente" incorporado como principio permanente — la inteligencia, la protección estructural y el criterio humano pertenecen exclusivamente a Afinidad, Garantías y Editorial respectivamente.

### Problemas encontrados y corregidos (consolidado de los cuatro bloques)

1. **Bloque 1 — referencia sin declarar y tipo incompatible** en `affinity_profile()`, detectados en la primera ejecución contra Postgres real.
2. **Bloque 1 — fuga de privacidad por comparación con `NULL`**: mismo patrón de defecto ya visto en la Fase 5B, reaparecido aquí — corregido con `is distinct from`.
3. **Bloque 1 (adenda) — cascada de eliminación de cuenta rompía la inserción de compensación de afinidad**: prevenido con una guarda explícita si el actor propietario ya no existe.
4. **Bloque 2 (adenda) — radio geográfico único insuficiente y exención total de riesgo**: reemplazado por radio inmediato + radio de planificación, nunca una exención completa.
5. **Bloque 4 — bug de ownership por prioridad fija**: una lista de prioridad fija dejaba a carriles escasos (Diversidad, Serendipia) con cero ítems propios pese a tener candidatos reales, violando el principio recién registrado — corregido con escasez + hash determinístico.
6. **Bloque 4 — clustering en la segunda pasada de anti-monopolio**: los diferidos se reinsertaban en su orden original, repitiendo violaciones — corregido con búsqueda activa entre todos los diferidos restantes.
7. **Bloque 4 — campo `zone_id` nunca proyectado**: ninguna CTE lo seleccionaba pese a que la lógica de anti-monopolio ya lo referenciaba — corregido extendiendo `candidatos_editorial()` por segunda vez.
8. **Bloque 4 — cuello de botella de rendimiento medido**: subconsultas correlacionadas de anti-monopolio (663ms) reemplazadas por `array_positions` nativo (115ms, ~5.8×), verificado sin cambio de resultados.

Los ocho defectos se encontraron y corrigieron durante la verificación contra Postgres real, antes de cualquier commit — ninguno llegó a producción de código sin corregir.

### Verificaciones realizadas (consolidado)

Postgres 16 real en cada bloque (35 a 41 migraciones, reconstruida entre cada corrección): cómputo de afinidad y sus tres correcciones; privacidad/RLS con actor propio/ajeno/invitado/negocio; los cuatro carriles de Garantías con y sin restricción geográfica; backfill de `editor_pick`, rechazos explícitos y reactivación del Motor Editorial; deduplicación, propiedad por escasez, anti-monopolio y paginación del Compositor con datos de concentración de actor variable; `EXPLAIN ANALYZE` objetivo contra 210 eventos/69 negocios; reversión ejecutada de verdad en los cuatro bloques, incluyendo el caso especial de restaurar `discovery_calibration()`/`candidatos_editorial()` a su forma exacta previa al Bloque 4; regresión completa de cada bloque anterior tras cada cambio.

Build y lint limpios en los cuatro bloques. **Verificación visual en navegador (Playwright) no pudo ejecutarse en este entorno** desde el Bloque 3 en adelante: el proyecto usa Supabase local (`http://127.0.0.1:54321`), que requiere Docker con la CLI de Supabase inicializada (`supabase init`) — Docker llegó a iniciar en este entorno durante el Bloque 4, pero el repositorio nunca tuvo `supabase/config.toml`, y bootstrapear un stack completo solo para esta verificación se consideró fuera de proporción para el bloque. Se documenta explícitamente en vez de reclamar una prueba que no ocurrió.

### Deuda técnica consolidada de toda la Fase 6

**Deuda heredada (de Fases 1-5B, sin cambios, ver secciones de cierre anteriores en este mismo documento):** prueba end-to-end contra un proyecto Supabase real desplegado; `post_likes`/`saved_events`/`saved_places`/`follows` legacy de solo respaldo; sin interfaz de gestión de `actor_managers`; sin limpieza de archivos huérfanos en Storage; `replaceBusinessHours` no atómico; sin moderación de comentarios desde `/admin`.

**Deuda propia de la Fase 6:** `events.editor_pick` permanece en el esquema como fuente histórica del backfill, sin nuevas escrituras (documentado en la migración `0040`); `discoverable_content()` se evalúa de forma independiente dentro de cada una de las cinco funciones `candidatos_*` que la consumen, en vez de una sola vez compartida (aceptable al volumen actual, conscientemente diferido); sin verificación Playwright real en ningún bloque desde el Bloque 3, por ausencia de Supabase local inicializado en este entorno; el mecanismo de aceptación de "último recurso" del anti-monopolio del Compositor puede activarse bajo concentración extrema de un solo actor (verificado como comportamiento correcto y documentado, no un defecto).

**Deuda futura (optimizaciones que solo se justifican con crecimiento real, nunca implementadas por anticipado):** caché compartida de `discoverable_content()` entre los cinco carriles que la consumen, si el volumen de contenido de la ciudad crece significativamente; índices sobre `affinity_contributions(actor_id, category)` y `editorial_selections(target_id)` si el volumen de contribuciones/selecciones lo justifica; la Gobernanza de Contenido Patrocinado (techo del 15%) permanece construida vacía de contenido real, a la espera de la Fase 11.

### Qué habilita para la Fase 7

- **El Motor de Afinidad es, literalmente, el "cerebro de preferencias" que la Guía IA v2 hereda** — perfil legible, sin NLP ni embeddings, con jerarquía explícita de fuerza de señal — en vez de construir uno propio por separado.
- **El patrón de seis componentes co-iguales sin fórmula de puntuación** queda como precedente arquitectónico reutilizable para cualquier futuro mecanismo de recomendación del ecosistema.
- **`compose_feed()` y su paginación por clave de identidad** quedan disponibles como el único punto de salida del sistema hacia el Feed — cualquier fase futura que necesite mostrar contenido personalizado ya tiene un contrato de composición probado al que puede rendir cuentas, en vez de construir uno nuevo desde cero.
- **La Gobernanza de Contenido Patrocinado** ya tiene su lugar reservado en el contrato arquitectónico — la Fase 11 hereda el principio ya cerrado (techo del 15%, auditable, nunca superado por relevancia pagada) sin tener que definirlo bajo presión comercial futura.

### Auditoría final de liberación (2026-07-23, posterior al cierre inicial)

Antes de declarar la fase cerrada de forma definitiva, se realizó una segunda auditoría explícitamente más crítica que la primera — revisando cada documento contra el código real (no solo contra sí mismo) y sin asumir que algo estaba correcto solo por haberse implementado antes. Encontró cinco hallazgos reales que la primera auditoría no había capturado, presentados al Product Owner y resueltos en esta misma ronda con autorización explícita, sin abrir ningún frente de trabajo nuevo ni tocar la arquitectura ya aprobada:

1. **(Crítico) `reason_code` de Editorial sin traducir llegaba crudo a la pantalla.** `candidatos_editorial()` devuelve, a propósito, el código técnico del enum (`seleccionado_equipo`/`informacion_util`/`relevante_fecha`/`historia_ciudad`) — nunca una frase, por diseño ya aprobado en el Bloque 3 ("permitiendo varias redacciones por código sin multiplicar el catálogo"). Ese código fluía sin traducir por `compose_feed()` hasta `src/lib/feed.js` y se renderizaba literalmente en `FeedPage.jsx` para cualquier ítem propiedad de Editorial. Ninguna verificación anterior lo notó porque toda la verificación de los Bloques 3 y 4 fue contra Postgres puro, nunca renderizando la interfaz real con un ítem editorial de por medio. **Corregido** agregando la capa de presentación que el propio diseño del Bloque 3 ya anticipaba pero nunca se había construido: `EDITORIAL_REASON_LABELS` y `resolveComposedReason()` en `src/lib/feed.js`, que traducen el código a una frase legible (p. ej. "Seleccionado por el equipo editorial de Ahorita.") exactamente en la frontera donde el propio diseño dijo que debía vivir esa traducción — sin tocar `candidatos_editorial()` ni ninguna otra pieza de la base de datos.
2. **(Importante) Contradicción interna en `FASE6_CONTRATO_ARQUITECTONICO.md`.** La sección "Cómo evolucionará el sistema desde un usuario nuevo hasta uno con suficiente historial" pedía que el Compositor aumentara "el peso de cercanía" para compensar una afinidad escasa — contradiciendo directamente el principio permanente, en el mismo documento, de que la cercanía nunca es una señal de puntuación. **Corregido** reescribiendo esa sección para describir con precisión lo que el sistema realmente hace (degradación honesta y emergente vía colas justas ponderadas, nunca una reponderación explícita ni un peso ajustable de cercanía) — corrección puramente documental, sin ningún cambio de comportamiento del código.
3. **(Importante) Riesgo de división por cero en `compose_feed()`.** La fórmula `carril_rank / peso_del_carril` no tenía ninguna guarda contra un peso configurado en 0 en una futura recalibración, lo que rompería la función completa para todas las personas. **Corregido** en `supabase/migrations/0042_fase6_cierre_correccion_division_cero.sql`, envolviendo el divisor en `greatest(peso, 0.0001)` — con cualquier peso ya vigente (todos > 0) el resultado es idéntico bit a bit al de antes; solo protege contra un futuro error de configuración.
4. **(Importante) Lista de commits del cierre con formato inconsistente.** La primera versión de esta sección mezclaba hashes reales para el Bloque 4 con descripciones sin hash para los Bloques 1-3, pese a existir hashes reales verificables para todos. **Corregido** — ver la lista completa más abajo.
5. **(Importante) Afirmación cuantitativa no verificada.** El resumen ejecutivo de este mismo documento afirmaba "quince principios permanentes incorporados" sin que ese número se sostuviera bajo ningún criterio de conteo objetivo contra `FASE6_CONTRATO_ARQUITECTONICO.md`. **Corregido** retirando la cifra específica, sin reemplazarla por otra cifra tampoco verificada.

Verificado tras aplicar las cinco correcciones: Postgres 16 real (42 migraciones desde cero) — `compose_feed()` produce exactamente la misma composición, orden y deduplicación que antes de la migración `0042` para cualquier calibración ya vigente (los pesos nunca fueron 0); un ítem editorial de prueba ahora muestra "Seleccionado por el equipo editorial de Ahorita." en vez del código crudo; regresión completa de los cuatro bloques sin cambios de comportamiento. Build y lint limpios. Se releyeron `MASTERPLAN.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md` y `FASE6_CONTRATO_ARQUITECTONICO.md` completos tras los cambios para confirmar que ninguna referencia cruzada quedó rota — ninguna lo estaba.

### Commits principales de la fase

- `d97bdd4` — filosofía del descubrimiento (documento conceptual, sin código).
- `469af42` — contrato arquitectónico conceptual (sin tablas ni migraciones).
- `57deb2a` — incorporar reglas de pureza de componentes al contrato.
- `725368b` — registrar principios permanentes del Motor de Afinidad.
- `5bc8606` — Bloque 1: Motor de Afinidad (migración `0035`).
- `9243416` — Bloque 1 (adenda): resolución indirecta por autor y revocación (migración `0036`).
- `4a92fb2` — Bloque 1 (segunda adenda): estado de evidencia (migración `0037`).
- `508b25d` — Bloque 2: Motor de Garantías (migración `0038`).
- `4b8d446` — Bloque 2 (adenda): calibración geográfica (migración `0039`).
- `77b468f` — registrar principio permanente del Motor Editorial.
- `0c83ad4` — Bloque 3: Motor Editorial (migración `0040`).
- `963f3df` — correcciones y principios permanentes del Bloque 4 incorporados a `FASE6_CONTRATO_ARQUITECTONICO.md` antes de implementar.
- `7a8441a` — Bloque 4: Compositor del Feed (migración `0041`), frontend, documentación.
- `0c7bf87` — cierre formal de la Fase 6 (esta sección, `MASTERPLAN.md`, `ARCHITECTURE.md`, `ROADMAP.md`, `CHANGELOG.md`).
- `789e9b2` — documentar honestamente el rechazo del push del tag de checkpoint.
- `6a92c56` — auditoría final de liberación: resolución de los cinco hallazgos de arriba (migración `0042`, `src/lib/feed.js`, `FASE6_CONTRATO_ARQUITECTONICO.md`, esta sección).

### Estado final

**FASE 6 CERRADA.** Los seis componentes conceptuales (Fuentes de contenido, Registro de señales, Motor de Afinidad, Motor de Garantías, Motor Editorial, Compositor del Feed) están implementados, verificados contra Postgres 16 real, y documentados. Dos rondas de auditoría de cierre (código, coherencia documental, pureza arquitectónica, principios permanentes, rendimiento, deuda técnica) no encontraron, en ninguna de las dos, ninguna decisión arquitectónica abierta ni ningún componente a medio implementar — la arquitectura de seis componentes se sostiene sin cambios desde su aprobación. La primera ronda corrigió `MASTERPLAN.md` y `ARCHITECTURE.md` (describían el plan original ya reemplazado). Una segunda auditoría, deliberadamente más crítica y ejecutada como si fuera un auditor externo, encontró cinco hallazgos adicionales — uno crítico (un código técnico interno llegaba sin traducir a la pantalla del usuario en ítems editoriales) y cuatro importantes (una contradicción documental interna, un riesgo de división por cero sin guarda, y dos imprecisiones dentro del propio documento de cierre) — los cinco resueltos en la misma ronda, sin abrir ningún frente de trabajo nuevo ni tocar la arquitectura ya aprobada (ver "Auditoría final de liberación" arriba). **No lista para producción** hasta validar la deuda técnica heredada contra un proyecto Supabase real desplegado, igual que el resto del proyecto.

---

## FASE 7 — FILOSOFÍA DE LA GUÍA IA ADOPTADA (2026-07-23)

Con la Fase 6 oficialmente cerrada, y antes de iniciar cualquier trabajo técnico de la Fase 7, se siguió exactamente la misma metodología ya usada para el Descubrimiento inteligente: un análisis previo de la siguiente fase natural del proyecto (justificación, alcance, exclusiones, riesgos, dependencias y resultado esperado, sin código ni diseño de solución), seguido de la construcción de su propio documento filosófico — `FASE7_FILOSOFIA_GUIA_IA.md`, adoptado en esta fecha como la **autoridad filosófica permanente de la Guía IA para la Fase 7 y su evolución futura**, subordinada a `VISION_MAESTRA.md` y construida sobre `AI_PHILOSOPHY.md`, nunca en su reemplazo.

**Por qué se creó.** `AI_PHILOSOPHY.md` ya define con gran detalle cómo debe comportarse la Guía IA, pero lo hace enteramente para una IA sin memoria, donde cada pregunta empieza de cero. La memoria real que la Fase 7 introduce cambia la naturaleza del riesgo — encasillar a alguien en un patrón viejo, confundir lo que se sabe de la conversación con lo que se sabe de la persona, inventar un recuerdo que nunca ocurrió, dejar que la personalización decida por la persona en vez de servirla — riesgos que ninguna fase anterior necesitó resolver porque ninguna IA anterior tenía memoria de una llamada a la siguiente.

**Proceso de tres rondas.** Un primer borrador consolidó los principios ya dispersos en `VISION_MAESTRA.md`, `AI_PHILOSOPHY.md`, `PRODUCT_MANIFESTO.md` y `PRODUCT_STRATEGY.md`, aterrizándolos específicamente en el territorio de la memoria (qué significa recordar, aprender, olvidar; la diferencia entre memoria y afinidad). Una segunda ronda de refinamiento crítico incorporó ocho principios adicionales, cada uno evaluado por separado antes de aceptarlo: memoria veraz (nunca inventar un recuerdo); una tercera categoría intermedia entre memoria de sesión y afinidad (conocimiento permanente no-afinidad); niveles de certeza de la memoria misma; la conversación como propiedad de la persona, nunca del sistema; la prohibición de que la Guía IA defina la identidad de alguien (extensión directa de un principio ya vigente del Motor de Afinidad); el refuerzo de "nunca intentar demostrar que tenía razón" frente a un cambio de patrón; una síntesis de los límites fundamentales de la memoria; y el refuerzo del principio de cierre. Una tercera ronda final incorporó dos precisiones más: que ningún conocimiento pasa de temporal a permanente sin consentimiento explícito de la persona (nunca por decisión unilateral de la Guía IA), y que la memoria se mide por selectividad, no por volumen acumulado.

**Veintitrés principios permanentes**, entre ellos: memoria de sesión, conocimiento permanente no-afinidad y afinidad son tres categorías que nunca deben confundirse; la Guía IA consulta la afinidad ya construida, nunca la reconstruye desde una conversación; la conversación nunca es una vía indirecta hacia el Motor de Afinidad (la misma prohibición de NLP/embeddings del Motor de Afinidad se extiende a la Guía IA); la Guía IA nunca afirma recordar algo que la persona no dijo; no toda memoria tiene el mismo grado de certeza; olvidar es el comportamiento honesto por defecto; la conversación pertenece siempre a la persona; la Guía IA nunca define la identidad de alguien, solo describe comportamientos y preferencias expresadas; la Guía IA propone, la persona decide; y el principio de cierre — ninguna persona es reducible a su perfil de afinidad ni a su historial de conversación, y la memoria existe para servir a la persona, nunca para definir quién es ni para acumular por acumular.

**Cómo debe utilizarse en el futuro.** El contrato arquitectónico técnico de la Fase 7 —cuando se autorice— debe rendirle cuentas a los veintitrés principios de este documento, exactamente como `FASE6_CONTRATO_ARQUITECTONICO.md` le rindió cuentas a `FASE6_FILOSOFIA_DESCUBRIMIENTO.md`. Si algo durante ese diseño exige contradecir un principio ya registrado aquí, el trabajo se detiene y se presenta como una nueva bifurcación — nunca se decide en silencio.

**Tensiones heredadas sin resolver, a propósito**: la duración exacta de una "sesión"; dónde se almacena técnicamente el conocimiento permanente no-afinidad; si algún día un consentimiento explícito podría dejar que algo dicho en una conversación fortalezca la afinidad permanente; si la Guía IA debería iniciar conversaciones por iniciativa propia; y la visibilidad/privacidad de los futuros "Planes" o itinerarios generados por la Guía IA (`AI_PHILOSOPHY.md` §16, ya diferida desde antes de esta fase). Ninguna de estas preguntas se cierra aquí — quedan explícitamente para cuando el diseño técnico las enfrente en concreto.

**Referencias documentales actualizadas.** `MASTERPLAN.md`, sección Fase 7: agregada la referencia a `FASE7_FILOSOFIA_GUIA_IA.md` como autoridad filosófica de la fase (mismo patrón que la Fase 6), y precisada la conexión declarada de "el motor de recomendaciones de la Fase 6" a "el Motor de Afinidad de la Fase 6" — la redacción genérica original no reflejaba con precisión la arquitectura de seis componentes ya construida.

**Confirmación explícita.** Ningún código, migración, funcionalidad ni comportamiento de la aplicación fue modificado durante este proceso — el trabajo fue exclusivamente filosófico y documental, tal como se autorizó. El contrato arquitectónico técnico de la Fase 7 permanece sin iniciarse.

---

## FASE 7 — CONTRATO ARQUITECTÓNICO ADOPTADO (2026-07-23)

Con `FASE7_FILOSOFIA_GUIA_IA.md` ya adoptada, se construyó `FASE7_CONTRATO_ARQUITECTONICO.md` — la arquitectura conceptual que traduce sus veintitrés principios en componentes, responsabilidades y límites verificables, sin sesiones, tablas, funciones, RPC, prompts ni proveedor de tecnología de inteligencia artificial, siguiendo exactamente el mismo espíritu que `FASE6_CONTRATO_ARQUITECTONICO.md` tuvo para la Fase 6.

**Encargo explícito del Product Owner para esta ronda**: diseñar una arquitectura que sobreviva al proveedor tecnológico — que permanezca válida sin importar qué modelo o mecanismo concreto de inteligencia artificial use la aplicación dentro de cinco años.

**Cuatro componentes conceptuales nuevos**, más lo heredado sin cambios (Motor de Afinidad de la Fase 6, comportamiento ya definido en `AI_PHILOSOPHY.md`, Actor de sistema "Guía IA" de la Fase 1, línea base de privacidad de la Fase 1):

1. **Memoria de Sesión** — pasiva, retiene el contexto temporal de una conversación, nunca interpreta ni decide.
2. **Conocimiento Permanente de la Persona, no-afinidad** — hechos estables declarados con consentimiento explícito.
3. **El Razonador** — sintetiza afinidad, memoria, conocimiento permanente y contexto del ecosistema en una decisión de qué responder y por qué; consulta, nunca reconstruye.
4. **La Expresión** — traduce esa decisión en lenguaje natural, con la personalidad ya definida en `AI_PHILOSOPHY.md`; nunca decide contenido, nunca ve datos personales crudos.

**Proceso de dos rondas.** Un primer borrador estableció los cuatro componentes, la cadena de responsabilidad de un solo sentido, las fronteras entre memoria/afinidad/razonamiento, y una primera versión de la agnosticidad tecnológica y del mapeo tentativo de bloques. Una segunda ronda de revisión crítica resolvió cuatro precisiones antes de la aprobación final:

1. **La agnosticidad tecnológica se extiende también a El Razonador, no solo a La Expresión.** El borrador original distinguía mal: solo La Expresión se describía como reemplazable. Corregido — ambos componentes separan, de la misma forma, su lógica y garantías permanentes (reglas, responsabilidades, entradas, forma de la salida) de la tecnología reemplazable que las ejecuta.
2. **La Memoria de Sesión queda definida por responsabilidad, nunca por representación técnica.** No presupone mensajes literales, contexto estructurado, síntesis temporal o una combinación — esa elección pertenece al diseño técnico. Lo permanente es que sea verificable, corregible, no acumule indefinidamente y conserve solo lo necesario para la continuidad.
3. **El consentimiento explícito es condición necesaria, pero nunca suficiente, para el Conocimiento Permanente.** Se incorporó una segunda capa de la misma regla de pureza: la plataforma conserva su propia responsabilidad de minimización, finalidad, proporcionalidad y seguridad, y existen categorías de información sensible que no deberían persistir permanentemente sin importar el consentimiento dado — sin definir aquí esas categorías ni su mecanismo técnico.
4. **El mapeo tentativo de bloques se reordenó por completo** para que ninguna garantía de corrección o borrado aparezca como una capa tardía. Hallazgo real de la revisión: construir el Conocimiento Permanente antes de que exista su propio mecanismo de corrección/borrado dejaría, temporalmente, datos permanentes sin la garantía que los justifica; y construir la conexión con la Afinidad antes de separar Razonador de Expresión arriesgaba construir primero un componente mezclado para separarlo después. Orden final: (1) separación Razonador/Expresión desde el origen, (2) Memoria de Sesión con su propia corrección incluida, (3) Conocimiento Permanente con su propia puerta de consentimiento y minimización incluidas, (4) conexión con el Motor de Afinidad, (5) experiencia unificada de transparencia/corrección/borrado — consolidación de garantías ya nacidas en los bloques 2 y 3, no su origen.

**Verificación de consistencia realizada** antes del registro final: se releyeron `VISION_MAESTRA.md`, `FASE7_FILOSOFIA_GUIA_IA.md`, `AI_PHILOSOPHY.md` y `MASTERPLAN.md` completos, y se confirmaron las referencias cruzadas del propio contrato (números de sección de la filosofía citados en cada regla, principios no negociables y decisiones de `AI_PHILOSOPHY.md`/`MASTERPLAN.md` citados) contra el texto real de esos documentos — ninguna quedó rota ni desactualizada tras las cuatro correcciones.

**Cómo debe utilizarse en el futuro.** El análisis técnico de cada bloque —empezando por la separación Razonador/Expresión— debe rendirle cuentas a este contrato, exactamente como el Motor de Afinidad le rindió cuentas a `FASE6_CONTRATO_ARQUITECTONICO.md`. Si algo durante ese diseño exige contradecir un principio ya registrado aquí, el trabajo se detiene y se presenta como una nueva bifurcación — nunca se decide en silencio.

**Referencias documentales actualizadas.** `MASTERPLAN.md`, sección Fase 7: agregada la referencia a `FASE7_CONTRATO_ARQUITECTONICO.md` como contrato arquitectónico de la fase (mismo patrón que la Fase 6), y actualizados "Módulos que incluye" para nombrar los cuatro componentes conceptuales en vez de la redacción genérica original.

**Confirmación explícita.** Ningún código, migración, tabla, función, RPC, prompt ni elección de proveedor o modelo de inteligencia artificial fue definido durante este proceso — el trabajo fue exclusivamente de arquitectura conceptual, tal como se autorizó. El análisis técnico del Bloque 1 (Separación Razonador/Expresión) todavía no ha comenzado.

---

## FASE 7, BLOQUE 1 — SEPARACIÓN RAZONADOR/EXPRESIÓN (2026-07-23)

Con la filosofía y el contrato arquitectónico de la Fase 7 ya adoptados, y siguiendo la metodología específica de esta fase (análisis conceptual → escenarios de conversación → diseño técnico → implementación → verificación → documentación → cierre, en vez de la metodología estándar del resto del proyecto — decisión explícita del Product Owner: "no estamos construyendo un chatbot... estamos construyendo un sistema de razonamiento compuesto por componentes"), se implementó el Bloque 1: la separación estructural de El Razonador y La Expresión dentro de la Edge Function `ai-guide`.

**Qué cambia.** La función pasa de un único prompt monolítico que mezclaba contexto, criterio de qué responder y estilo de cómo decirlo, a un pipeline con frontera de datos explícita:

```
Contexto permitido -> El Razonador -> Decisión estructurada e inmutable -> La Expresión -> Respuesta final
```

Cuatro archivos nuevos/reescritos, cada uno con una única responsabilidad:

- **`context.ts`** — reúne el contexto real (lugar o ciudad); no interpreta ni decide nada.
- **`decision.ts`** — El Razonador: sintetiza contexto + conversación en una `Decision` (objeto validable con `dominantMode`, `supportingModes`, `content`, `narrative`, `reason`, `resolutionRoute`, `priorityTrace`, `actions`, `noAnswer`), aplicando la jerarquía de prioridad, la regla de las cinco condiciones del modo Descubridor, y el ruteo búsqueda-directa/síntesis/combinar — todo definido en el mismo archivo como reglas no negociables traducidas de `AI_PHILOSOPHY.md` y `FASE7_CONTRATO_ARQUITECTONICO.md`.
- **`expression.ts`** — La Expresión: traduce una `Decision` ya tomada en lenguaje natural. Solo importa el tipo `Decision`; no tiene ninguna vía de código para llamar a `buildContext`/`buildCityContext`/`buildPlaceContext` ni recibir un dato personal crudo — la separación es estructural (verificable en el grafo de importaciones), no solo documental.
- **`index.ts`** — orquesta el pipeline; si El Razonador falla o produce algo que no cumple el contrato, usa una decisión de seguridad fija (`REASONER_FAILURE_DECISION`, con `noAnswer: true`) en vez de intentar adivinar o reparar un campo ausente; si La Expresión falla, usa un mensaje de seguridad fijo. Nunca deja pasar un error crudo a la persona.

**Hallazgo real descubierto y corregido dentro de este bloque (no una funcionalidad nueva).** Al auditar qué contexto consumía la versión anterior antes de tocar nada, se encontró que `buildCityContext()` —el camino usado desde Inicio y Explorar, es decir, la mayoría del uso real de la Guía IA, ya que `GuideCapsule.jsx` nunca pasa `placeId`— consultaba `editorial_posts`, una tabla eliminada desde la migración `0010_events.sql` ("Inicio solo eventos"), muy anterior a la Fase 6. Cualquier pregunta sin `placeId` fallaba con un error de Postgres de "relation does not exist". Se corrigió reemplazando esa consulta por la única superficie oficial de lectura editorial ya existente desde la Fase 6 — la función pública `candidatos_editorial()` (la misma RPC que ya usa `src/lib/editorial.js`) — siguiendo el orden de preferencia exigido por el Product Owner (RPC oficial antes que superficie pública, antes que consulta directa como último recurso): no se inventó ninguna interpretación nueva de qué contenido es elegible editorialmente. `context.ts` hidrata cada candidato devuelto por la RPC con su contenido real (`events`/`publication_posts`), reutilizando la misma traducción `reason_code` → texto legible ya establecida en `src/lib/feed.js` durante la auditoría de cierre de la Fase 6 (duplicada, no importada, porque esta función corre en el runtime aislado de Deno).

**Verificación realizada.**

- **Postgres 16 real** (42 migraciones desde cero, mismo arnés usado en toda la Fase 6): se ejecutaron los ocho escenarios exigidos contra `candidatos_editorial()` — cero contenido editorial (antes de cualquier selección, solo aparecen los tres eventos migrados por `editor_pick` en la Fase 6, comportamiento ya conocido, no un hallazgo nuevo); selección vigente (Evento verificado + Evento de admin + dos publicaciones aparecen con su `reason_code` correcto); selección vencida (`ends_at` en el pasado desaparece; la misma publicación con ventana vigente sí aparece); contenido oculto (evento y publicación ocultos, aunque seleccionados, nunca aparecen); evento finalizado (nunca aparece aunque seleccionado); autor con verificación revocada (evento y publicación del mismo negocio revocado nunca aparecen aunque seleccionados); contenido de Ahorita Editorial (aparece únicamente cuando tiene una selección explícita, nunca por ser del actor de sistema). Se confirmó además, consultando `events`/`publication_posts` directamente, que cada candidato devuelto por la RPC hidrata correctamente con título/descripción/categoría reales — ninguno se pierde silenciosamente.
- **Contrato de decisión**: `validateDecision()` se probó con 15 casos sintéticos (transpilados con esbuild y ejecutados en Node, ya que `deno` no está disponible en este entorno) — 3 decisiones válidas (mínima, con `noAnswer`, completa con contenido/acciones) y 12 inválidas (campo faltante, valor de enum inválido, `dominantMode` duplicado en `supportingModes`, `noAnswer:true` con contenido o acciones no vacíos, entrada no-objeto, `null`, arreglo, razón vacía) — los 15 se comportaron como se esperaba; el validador nunca intenta reparar ni completar un campo ausente. También se confirmó que la propia `REASONER_FAILURE_DECISION` (el fallback de seguridad) es, ella misma, una `Decision` válida según el contrato.
- **Separación efectiva**: confirmado por inspección del grafo de importaciones que `expression.ts` no tiene ninguna referencia a `context.ts` ni a las funciones de construcción de contexto — un intento futuro de pasarle contexto crudo sería un error de compilación, no solo una convención documentada.
- **Verificación de tipos**: `deno` no está instalado en este entorno (no se pudo ejecutar `deno check`/`deno lint` directamente). Como verificación equivalente, se tradujeron los cuatro archivos con TypeScript (`tsc --strict`) contra un *shim* de ambiente fiel a los tipos reales de `@supabase/supabase-js` y `@anthropic-ai/sdk` — cero errores de tipo nuevos; el único diagnóstico restante (`error.message` sobre una variable `catch` de tipo `unknown` en `index.ts`) es una línea preexistente sin cambios desde antes de este bloque, fuera del alcance autorizado.
- **Compatibilidad**: `src/lib/aiGuide.js` (`askGuide()`) solo lee `data.reply`; `GuideChat.jsx` y `GuideCapsule.jsx` no fueron tocados. La respuesta nueva (`{reply, actions}`) es aditiva — el campo `actions` viaja preparado para un futuro consumidor visual sin exponerse todavía.
- **Build y lint**: `npm run build` y `npm run lint` limpios, sin advertencias nuevas (ambos no cubren `supabase/functions/`, solo `src/` — limitación ya conocida del proyecto, no de este bloque).

**Medición de impacto honesta (sin optimizar antes de medir).** El pipeline pasa de una llamada al proveedor de IA por turno a dos (Razonador + Expresión), lo que en principio duplica la latencia y el costo por turno frente al diseño monolítico anterior. Este entorno no tiene configurada `ANTHROPIC_API_KEY` para el runtime propio de la Edge Function (el acceso a la red de `anthropic.com` de esta sesión de Claude Code es un mecanismo distinto y no aplica al secreto propio del proyecto), y `deno` tampoco está disponible para ejecutar la función de forma aislada — por lo tanto **no fue posible medir latencia, conteo de invocaciones ni costo real de dos llamadas encadenadas contra el proveedor real**. Esto se documenta honestamente como una limitación de este entorno de verificación, no como un resultado ya medido, siguiendo el mismo criterio ya usado para las limitaciones de Playwright a lo largo del proyecto. Queda pendiente medir esto contra un proyecto Supabase real desplegado, con las claves configuradas, antes de cualquier decisión de optimización.

**Qué NO se tocó en este bloque** (exclusiones explícitas del Product Owner, respetadas): Memoria de Sesión, Conocimiento Permanente no-afinidad, conexión con el Motor de Afinidad, análisis de historial de conversación, aprendizaje, nuevos datos personales, nuevo proveedor de IA, funcionalidad visual nueva ni rediseño del frontend.

**Confirmación explícita.** El único cambio de comportamiento observable para la persona, fuera de la corrección del defecto preexistente, es que la Guía IA ya no falla con un error crudo de base de datos al preguntar desde Inicio o Explorar. Ningún código de Memoria de Sesión, Conocimiento Permanente ni Motor de Afinidad fue escrito. No se avanza al Bloque 2 sin autorización explícita.

---
