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

## FASE 7, BLOQUE 2 — MEMORIA DE SESIÓN (2026-07-23)

Con el Bloque 1 cerrado, se siguió la metodología completa de esta fase para el Bloque 2: análisis conceptual (17 secciones, sin código) → cierre de ocho bifurcaciones por el Product Owner → diseño técnico (12 puntos, sin código) → cuatro ajustes explícitos → implementación incremental → verificación exhaustiva → documentación.

**Qué se construyó.** La Memoria de Sesión da continuidad a la única conversación activa de cada persona autenticada, sin importar desde qué superficie (Inicio, Explorar, una ficha de lugar, un perfil) la continúe — el contexto (`placeId`, actor, superficie) sigue siendo, como ya lo era desde el Bloque 1, una entrada del turno hacia El Razonador, nunca parte de la identidad de la conversación. Un invitado (sin sesión) no tiene ningún cambio de fondo: el cliente sigue siendo la única fuente de verdad de su propio hilo, sin ninguna persistencia server-side.

**Ocho bifurcaciones cerradas por el Product Owner** (análisis conceptual): recuperación tras recarga reservada a personas autenticadas (un invitado pierde la conversación al recargar, por privacidad en dispositivo compartido); ventana de inactividad inicial de 2 horas, configurable, nunca un principio permanente; historial de conversaciones autorizado diferido al futuro Bloque 5, con la frontera activa/cerrada/conservada-con-autorización ya preparada; frente a "no dije eso", la Guía IA siempre acepta la corrección sin discutir el registro literal; sin límite de producto visible para conversaciones largas, solo un requisito técnico de capacidad finita sin estrategia de reducción todavía definida; ninguna asociación automática de una conversación de invitado a una cuenta nueva — siempre con consentimiento explícito; y una señal visible, breve y no técnica, de cuándo empezó una conversación nueva o por qué ya no hay continuidad con la anterior.

**Cuatro ajustes del diseño técnico** (antes de autorizar la implementación): (1) una única conversación activa por persona, nunca una por contexto/superficie; (2) El Razonador reforzado en su agnosticismo — su contrato de entrada nunca habla de "mensajes", solo de un "contexto conversacional vigente" que produce exclusivamente la Memoria de Sesión, con mensajes literales como representación interna elegida hoy, nunca parte permanente del contrato; (3) la recuperación se acota estrictamente a la única conversación que sigue efectivamente activa — una conversación cerrada, expirada o reemplazada nunca se recupera automáticamente; (4) capacidad finita registrada como principio permanente, sin fijar todavía ninguna estrategia concreta de reducción.

**Implementación:**

- `supabase/migrations/0043_fase7_bloque2_memoria_sesion.sql`: `ai_active_conversations` (fila única y mutable por persona, mismo patrón ya usado en `editorial_selections`) y `ai_conversation_turns` (append-only, retracciones marcadas con `retracted_at`, nunca borradas — misma disciplina de revocación ya usada en verificaciones y selecciones editoriales). Ninguna política de RLS en ninguna de las dos tablas — ni siquiera la propia dueña puede leerlas directamente, mismo principio ya usado en `affinity_contributions` (Fase 6). El único acceso es a través de seis funciones `security definer`, cada una derivando la identidad exclusivamente de `auth.uid()`, nunca de un parámetro: `ai_get_active_conversation()` (lectura de estado, purga on-read si detecta expiración), `ai_get_conversation_turns()` (lectura de contenido, solo si sigue efectivamente activa, nunca lo retractado), `ai_append_turn()` (escritura de un turno, usada para reconstruir una conversación de invitado ya aceptada), `ai_append_exchange()` (camino normal del pipeline — persona + guía + retractación opcional, en una sola transacción implícita, para que un fallo a mitad de camino nunca deje un turno huérfano), `ai_ensure_fresh_conversation()` (paso interno compartido) y `ai_delete_active_conversation()` (borrado explícito y completo).
- `supabase/functions/ai-guide/memory.ts` (nuevo): implementa la Memoria de Sesión — resuelve identidad desde el propio token de quien llama (mismo patrón que `export-user-data`, nunca la clave de servicio para datos personales), produce el "contexto conversacional vigente", persiste el intercambio tras la respuesta, degrada honestamente ante cualquier fallo (nunca bloquea el turno, nunca finge continuidad).
- `supabase/functions/ai-guide/decision.ts`: `decide()` pasa a recibir el `ConversationalContext` genérico en vez de un arreglo de "mensajes"; la traducción al formato que el proveedor actual necesita es un detalle interno, privado de este archivo. Nuevo `MemoryInstruction` (retractación explícita, `security`-equivalente a `validateDecision`: nunca adivina ni repara un valor inválido) como salida secundaria, nunca parte del contrato de `Decision`. El sistema prompt incluye ahora el tiempo transcurrido desde el inicio de la conversación, para que El Razonador (nunca la Memoria) juzgue caducidad.
- `supabase/functions/ai-guide/index.ts`: orquesta identidad → Memoria de Sesión → contexto permitido → Razonador → Expresión → persistencia, con degradación segura en cada punto de fallo. Nuevas acciones administrativas (`delete_conversation`, `import_guest_conversation`, `get_conversation`) que nunca tocan el pipeline de razonamiento.
- `supabase/functions/export-user-data/index.ts`: la conversación activa nace exportable, con el mismo estándar del resto de los datos personales del proyecto desde la Fase 1.
- `src/lib/aiGuide.js`/`src/features/ai/GuideChat.jsx`: hidratación de la conversación activa al abrir el chat (autenticados), señal visible no técnica de conversación nueva/expirada, consentimiento explícito antes de asociar una conversación de invitado a una cuenta nueva, borrado explícito de la conversación desde la propia interfaz.

**Verificación realizada** (Postgres 16 real, 43 migraciones desde cero, mismo arnés de toda la Fase 6/Bloque 1): creación y continuación de la única conversación activa por persona; aislamiento estricto confirmado entre dos personas y frente a un administrador (ninguno puede leer la conversación de otra, ni siquiera con `is_admin()`); una petición sin sesión nunca accede a nada; expiración simulada (retroceso de `last_activity_at`) confirmando purga on-read y reinicio honesto sin recuperar lo anterior; conversación aún vigente sin tocar; corrección normal (nuevo turno, sin marcar nada) y retracción explícita (`ultimo_turno_persona`/`todo_lo_anterior`) verificadas, con el turno retractado siempre preservado para trazabilidad y siempre excluido de `ai_get_conversation_turns()`; escritura atómica del intercambio confirmada — un turno con contenido vacío se rechaza por completo, sin insertar nada a medias; importación secuencial de una conversación de invitado ya aceptada, en orden; borrado explícito sin dejar ninguna fila; eliminación de cuenta arrastrando conversación y turnos vía `on delete cascade` ya existente, sin código adicional; migración reversible sin dejar rastro y reaplicable de forma idéntica. Degradación de memoria (lectura y escritura) probada de forma aislada (transpilado con esbuild, mismo método ya usado en el Bloque 1 dado que `deno` no está disponible en este entorno): un fallo de lectura nunca bloquea el turno ni finge continuidad; un fallo de escritura nunca se informa como guardado. Regresión de `validateDecision()` (15/15, Bloque 1) y validación del nuevo envoltorio `{decision, memoryInstruction}` (incluyendo que un `memoryInstruction` malformado nunca invalida una decisión por lo demás correcta) confirmadas contra los mismos 15 casos más 6 nuevos. Verificación de tipos equivalente a `deno check` (`tsc --strict` contra el mismo shim fiel del Bloque 1, ahora extendido con `auth.getUser()`): cero errores nuevos, el único diagnóstico restante es la misma línea preexistente ya documentada en el Bloque 1. Build y lint limpios, sin advertencias nuevas.

**Limitaciones documentadas con honestidad:** el camino de invitado no cuenta con marcas de tiempo reales por turno (`GuideChat.jsx` nunca las registró, ni antes ni ahora), por lo que el juicio de caducidad temporal de El Razonador es menos preciso para invitados que para personas autenticadas — una limitación conocida y aceptada, no un defecto oculto. Igual que en el Bloque 1, no fue posible medir latencia/costo real ni ejecutar un comportamiento en vivo del modelo (sin `deno` ni `ANTHROPIC_API_KEY` en este entorno) — las reglas de retractación, corrección y caducidad quedan correctamente codificadas en el contrato y el prompt, pero su comportamiento real frente a un modelo en vivo queda pendiente de un entorno desplegado.

**Qué NO se construyó en este bloque** (exclusiones explícitas ya aprobadas): Conocimiento Permanente no-afinidad, historial autorizado de conversaciones cerradas, conexión con el Motor de Afinidad, síntesis automática o resúmenes generados, embeddings, búsqueda semántica, estrategia definitiva de reducción para conversaciones largas, acceso administrativo a conversaciones ajenas, sincronización entre dispositivos más allá de recuperar la única conversación activa, y cualquier trabajo de Planes o Itinerarios.

**Confirmación explícita.** Toda la implementación se ciñó exactamente al alcance aprobado en las dos rondas de diseño. No se avanza al Bloque 3 (Conocimiento Permanente no-afinidad) sin autorización explícita.

---

## FASE 7, BLOQUE 3 — CONOCIMIENTO PERMANENTE DE LA PERSONA, NO-AFINIDAD (2026-07-23)

Con el Bloque 2 cerrado, se siguió la metodología completa de esta fase para el Bloque 3: análisis conceptual (21 secciones, sin código) → cierre de cinco bifurcaciones por el Product Owner → diseño técnico (24 puntos, sin código) → cuatro precisiones explícitas → confirmación de las tres preguntas abiertas → autorización de implementación → auditoría previa → hallazgo real e incidental → implementación incremental → verificación exhaustiva → documentación.

**Qué se construyó.** El Conocimiento Permanente guarda datos estables y explícitamente confirmados sobre una persona (idioma preferido, estilo de respuesta, restricción alimentaria, necesidad de movilidad, necesidad de accesibilidad, dato financiero declarado) — distinto de la Memoria de Sesión (temporal, Bloque 2), del historial autorizado (futuro, transcripciones de conversación), de la Afinidad (interés por categoría/actor, Fase 6), de los datos de identidad de cuenta y de las preferencias de interfaz. El Razonador consulta estos hechos y puede **proponer un candidato** cuando la persona ya expresó algo con utilidad futura clara — nunca crea un "hecho": la interfaz confirma, y únicamente la acción explícita de la persona produce la escritura.

**Cinco bifurcaciones cerradas por el Product Owner** (análisis conceptual): sin caducidad automática general, pero con reconfirmación selectiva según sensibilidad/probabilidad de cambio/impacto — la ausencia de reconfirmación nunca equivale a revocación, El Razonador trata un dato envejecido con menor certeza o pregunta cuando es relevante; modelo de iniciativa mixta — la persona puede pedirlo directamente, la Guía IA puede sugerir excepcionalmente bajo ocho condiciones conservadoras para categorías normales, y una regla aún más estricta para categorías sensibles (nunca espontánea, debe originarse en las propias palabras ya expresadas por la persona, siempre exige una confirmación reforzada adicional); `profiles.interests` (campo heredado encontrado durante la auditoría) queda intocado, señalado explícitamente como deuda arquitectónica heredada para un análisis futuro separado — nunca resuelto dentro de este bloque; los datos financieros/de presupuesto reciben protección reforzada igual que los de salud, nunca inferidos, nunca para publicidad o discriminación, solo si se piden explícitamente con propósito claro; la plataforma nunca infiere minoría de edad — si una persona es conocida/declarada menor (mecanismo que hoy no existe en el esquema), el almacenamiento permanente queda bloqueado hasta que exista un consentimiento parental válido; este bloque simplemente no construye almacenamiento para menores conocidos, documentado como una limitación honesta.

**Cuatro precisiones del diseño técnico** (antes de autorizar la implementación): (1) el catálogo de categorías es cerrado y además semánticamente estable para siempre — el significado de una categoría nunca cambia una vez creada; un cambio conceptual exige una categoría nueva vía migración, nunca la reinterpretación de una existente; (2) El Razonador únicamente propone un **candidato**, nunca crea un "hecho" — terminología y contrato reforzados sin ambigüedad: "el Razonador propone; la interfaz confirma; únicamente la acción explícita de la persona produce la escritura"; (3) `treatment_policy` (`normal`/`protected`/`restricted`) reservado como eje de arquitectura futura, independiente de `sensitivity_level`, con cero implementación funcional hoy — solo para evitar una migración costosa más adelante; (4) principio permanente explícito de crecimiento mínimo — el Conocimiento Permanente nunca crece simplemente porque una persona conversa mucho; el crecimiento se activa exclusivamente por consentimiento explícito por dato, nunca por volumen o frecuencia de conversación.

**Hallazgo real descubierto durante la auditoría previa, presentado antes de continuar (no una ampliación de alcance).** El diseño técnico aprobado planteaba reutilizar `consent_records` para la trazabilidad de este bloque. La auditoría encontró que esa tabla tiene, desde la Fase 1, una política de RLS que otorga lectura administrativa directa (`auth.uid() = user_id or public.is_admin()`) — en contradicción directa con el principio, recién aprobado para este bloque específico, de ausencia total de acceso administrativo por defecto, porque incluso el nombre de una categoría (`necesidad_accesibilidad`, `dato_financiero_declarado`, `restriccion_alimentaria`) ya revela información sensible por sí solo, sin necesidad del valor. Se presentaron dos opciones (A: aceptar la exposición existente como consistente con el precedente de la Fase 1; B: construir una tabla de trazabilidad dedicada, sin ninguna política de RLS, replicando el patrón de `affinity_contributions`). **El Product Owner confirmó explícitamente la Opción B**, con doce garantías exactas para la nueva tabla dedicada (nunca guarda el valor; solo el tipo de operación — guardado/corregido/revocado/borrado_individual/borrado_total; la categoría misma se trata como información privada; sin lectura administrativa directa; sin acceso para negocios/organizadores/otros actores; ni siquiera la propia persona lee la tabla cruda directamente — solo mediante una función dedicada que devuelve lo necesario y comprensible; toda función `security definer` deriva la identidad de `auth.uid()`, nunca de un `owner_id` enviado por el cliente; la Edge Function nunca usa `service_role` para sortear esta frontera en operaciones normales de la persona; la eliminación de cuenta borra por completo esta trazabilidad; la exportación incluye solo lo legítimo de mostrar; la reversión de la migración elimina esta estructura sin afectar `consent_records`), documentado explícitamente como una bifurcación arquitectónica encontrada durante la auditoría, no como una ampliación funcional del alcance. `consent_records` permanece completamente intocada, con su propósito y políticas heredadas de la Fase 1 sin ningún cambio.

**Implementación:**

- `supabase/migrations/0044_fase7_bloque3_conocimiento_permanente.sql`: `permanent_knowledge_categories` (catálogo cerrado y estable, con lectura pública vía RLS por ser dato de referencia, no personal — sembrado con las seis categorías iniciales aprobadas, `treatment_policy` reservado sin uso funcional, `requires_reinforced_confirmation` obligatorio para sensibilidad alta/reforzada por `check`); `permanent_knowledge_facts` (una fila por persona/categoría/subtipo — `subtype` nunca `NULL`, siempre `'general'` por defecto, evitando el mismo escollo de unicidad con `NULL` ya conocido de la Fase 6 — sin ninguna política de RLS, ni siquiera de lectura para la propia dueña); `permanent_knowledge_audit_log` (la resolución de la Opción B — nunca el valor, ni siquiera la propia dueña lee la tabla cruda, sin ninguna política de RLS, `owner_id` con `on delete cascade` propio ya que esta trazabilidad nunca debe sobrevivir a la eliminación de cuenta, a diferencia de `consent_records`/`data_requests`). Cinco funciones `security definer`, todas derivando `owner_id` exclusivamente de `auth.uid()`: `pk_get_facts()` (lectura para El Razonador), `pk_save_fact()` (valida categoría/subtipo/confirmación reforzada, upsert con `is not distinct from`, registra `guardado`/`corregido` en el log), `pk_delete_fact()` (borrado físico, individual o como revocación — mismo efecto mecánico, distinta etiqueta de auditoría), `pk_delete_all_facts()` (borrado físico total, un solo evento agregado `borrado_total`), `pk_get_audit_summary()` (único camino de lectura del historial de auditoría).
- `supabase/functions/ai-guide/permanentKnowledge.ts` (nuevo): lectura degrada honestamente a un conjunto vacío ante cualquier fallo (nunca fabrica un hecho); todas las escrituras se invocan exclusivamente tras una acción explícita de interfaz, nunca como efecto de una respuesta conversacional; siempre con el propio token de quien llama, nunca la clave de servicio.
- `supabase/functions/ai-guide/decision.ts`: catálogo cerrado de categorías reexportado como tipo; `PermanentKnowledgeCandidate` (categoría, subtipo, valor sugerido, razón) como tercera salida del envoltorio del Razonador, con la misma disciplina de validación que `Decision`/`MemoryInstruction` — un candidato malformado nunca invalida una decisión por lo demás correcta. El prompt del Razonador incorpora las ocho condiciones conservadoras para categorías normales y la regla más estricta (nunca espontánea, debe originarse en palabras ya expresadas por la persona) para categorías reforzadas, con `null` por defecto ante cualquier duda.
- `supabase/functions/ai-guide/index.ts`: nuevas acciones explícitas de interfaz (`save_permanent_fact`, `delete_permanent_fact`, `delete_all_permanent_facts`, `get_permanent_knowledge`), ninguna alcanzable desde el flujo conversacional normal; el candidato propuesto por El Razonador viaja en la respuesta normal, explícitamente comentado como que nunca implica que algo ya se guardó.
- `supabase/functions/export-user-data/index.ts`: hechos vigentes y resumen de auditoría nacen exportables desde el origen, con las mismas columnas que ya expone `pk_get_audit_summary()` — nunca el valor en la trazabilidad, porque nunca se guardó ahí.
- `src/lib/aiGuide.js`: funciones cliente para guardar/corregir/borrar/borrar-todo, lectura del catálogo público directamente (sin pasar por la Edge Function, ya que la RLS ya lo permite) y lectura de la transparencia combinada (hechos + historial).
- `src/features/ai/GuideChat.jsx`: banner inline cuando El Razonador propone un candidato, con "Guardar"/"No, gracias"; para categorías marcadas `requires_reinforced_confirmation` en el catálogo, un segundo paso de confirmación explícita antes de escribir; declinar nunca invoca ninguna función de guardado.
- `src/features/settings/PermanentKnowledgeSection.jsx` (nuevo, mismo estilo que `AffinitySection.jsx`): lista de hechos vigentes con acción de borrado individual, borrado total, e historial de auditoría plegable (solo tipo de operación/categoría/fecha, nunca el valor).
- `src/pages/SettingsPage.jsx`: integra la nueva sección de transparencia junto a `AffinitySection`.

**Verificación realizada** (Postgres 16 real, 44 migraciones desde cero, mismo arnés de toda la Fase 6/Bloque 1/Bloque 2): guardado y corrección en el mismo lugar (fila única, dos eventos de auditoría distintos); las tres vías de rechazo (categoría inexistente, subtipo no permitido, confirmación reforzada faltante para categoría reforzada); borrado físico individual (con distinción de etiqueta revocación/borrado) y total (conteo correcto, un solo evento agregado); aislamiento estricto entre dos personas autenticadas, una sesión anónima con el claim explícitamente limpiado y un administrador con `is_admin()=true` — ninguno lee los hechos ni la auditoría ajena, confirmado tanto vía las funciones RPC como con consultas directas a la tabla cruda (0 filas, por la ausencia total de políticas de RLS, incluso bajo los `GRANT` amplios del arnés de prueba); rechazo de inserción directa en ambas tablas como defensa en profundidad; cascada completa de eliminación de cuenta (ambas tablas vacías); migración reversible sin dejar rastro y reaplicable de forma idéntica, confirmando explícitamente que `consent_records` queda byte-a-byte intocada. Verificación de tipos equivalente a `deno check` vía `tsc --strict` (shim extendido con el comportamiento real de `.rpc()` de `@supabase/supabase-js`, confirmado instalando el paquete real — sin generic de esquema tipado, resuelve permisivo, no un array forzado): cero errores nuevos, solo los mismos cinco diagnósticos preexistentes ya documentados en los Bloques 1-2. Validación de `validatePermanentKnowledgeCandidate()` (9 casos) y simulación completa del envoltorio de tres salidas confirmando que un candidato malformado nunca invalida una decisión correcta. Regresión de `validateDecision()`/`validateMemoryInstruction()` confirmada sin cambios de comportamiento. Build y lint del frontend limpios tras integrar el banner de candidato y la sección de transparencia — sin advertencias nuevas.

**Qué NO se construyó en este bloque** (exclusiones explícitas ya aprobadas): conexión con el Motor de Afinidad, historial autorizado de conversaciones cerradas, resolución de `profiles.interests` (deuda heredada, señalada para análisis futuro separado), cualquier mecanismo de consentimiento parental o detección de minoría de edad, cualquier estrategia de reducción para el Conocimiento Permanente, y cualquier trabajo de Planes o Itinerarios.

**Confirmación explícita.** Toda la implementación se ciñó exactamente al alcance aprobado, incluyendo la bifurcación arquitectónica encontrada y resuelta durante la propia auditoría (Opción B, doce garantías). No se avanza al Bloque 4 (conexión con el Motor de Afinidad) sin autorización explícita.

---

## FASE 7, BLOQUE 3 — AUDITORÍA FINAL Y CORRECCIONES (2026-07-23)

Antes de declarar cerrado el Bloque 3, se realizó una auditoría final exclusivamente sobre la implementación ya terminada (sin código ni ideas nuevas), buscando contradicciones con el diseño aprobado, violaciones de privacidad, reconstrucciones indirectas de información sensible, problemas de aislamiento/RLS, inconsistencias frontend/backend, errores de exportación o borrado, caminos de guardado sin consentimiento explícito, problemas de degradación segura y deuda técnica relevante — mismo rigor que el cierre de la Fase 6.

**Sin hallazgos** en RLS, aislamiento, `consent_records` (confirmada intocada), caminos de escritura sin consentimiento, `treatment_policy` (confirmado sin ninguna referencia fuera de la migración), degradación segura, exportación y consistencia de nombres de campo entre frontend y backend.

**Cuatro hallazgos presentados; dos corregidos, dos documentados como limitación conocida** (decisión del Product Owner):

1. **(Corregido) Repetición de un candidato ya propuesto o ya rechazado en la misma conversación.** El prompt de El Razonador exigía no repetir un candidato ya propuesto/rechazado en el mismo hilo, pero nada persistía esa señal: `permanentKnowledgeCandidate` nunca formaba parte de los turnos que guarda la Memoria de Sesión (solo el texto hablado, `reply`), y declinar en la interfaz no informaba nada al servidor. **Solución mínima, sin memoria paralela ni estados nuevos**: ahora la mención del candidato pasa a formar parte de la respuesta hablada (ver hallazgo 2), que ya se persiste como turno normal de la Memoria de Sesión existente — la próxima vez que El Razonador reciba el hilo completo, ve directamente su propia mención anterior en la conversación y puede aplicar la regla de no repetir sin ningún mecanismo adicional. Es, como el resto de las reglas de comportamiento de El Razonador en todo el proyecto, una disciplina de prompt reforzada por el hilo real, no una garantía verificable en código — mismo modelo de riesgo ya aceptado para las demás reglas del Razonador desde el Bloque 1.
2. **(Corregido) El campo `reason` del candidato llegaba a la persona sin pasar por La Expresión.** Rompía, específicamente para esta superficie, el principio permanente de que "El Razonador nunca habla directamente con la persona" — ya sostenido de forma estructural para la respuesta principal desde el Bloque 1. `expression.ts` ahora recibe también el candidato (nunca los hechos ya guardados, nunca el contexto crudo — la separación real sigue intacta) y decide, con sus propias palabras y las mismas reglas de personalidad de `AI_PHILOSOPHY.md §3`, cómo comunicarlo: siempre como invitación a confirmar, nunca como algo ya guardado, siempre después de responder la pregunta principal. `GuideChat.jsx` ya no muestra el texto crudo de `reason` — el banner solo ofrece la confirmación explícita sobre el valor sugerido, que la persona ya escuchó en la respuesta.
3. **(Documentado como funcionalidad preparada, no corregido)** La etiqueta de auditoría `revocado` (distinta de `borrado_individual`) no tiene hoy ningún camino real en la interfaz que la produzca — `PermanentKnowledgeSection.jsx` siempre borra con `asRevocation: false`. Queda como mecanismo ya construido en la base de datos, a la espera de una futura superficie de interfaz que distinga explícitamente "revocar consentimiento" de "borrar este dato" si el producto lo requiere. No se amplía la interfaz solo para hacer alcanzable la etiqueta.
4. **(Documentado como limitación transversal, no corregido)** El nombre de una categoría puede aparecer en los logs de la Edge Function (`console.error`) ante una entrada inválida/malformada en `pk_save_fact` — nunca el valor. Es el mismo patrón de logging usado en todo `ai-guide` desde bloques anteriores (`memory.ts` incluido), no una desviación de este bloque. Queda documentado para una futura revisión transversal del sistema de observabilidad del proyecto, nunca como un parche aislado para este bloque.

**Verificación tras las correcciones**: `tsc --strict` contra el mismo shim fiel (sin errores nuevos, solo los mismos diagnósticos preexistentes ya documentados); sanity-check del nuevo bloque de candidato en el prompt de La Expresión (cadena vacía sin candidato, candidato completo incluido cuando existe); regresión de `validateDecision()`/`validateMemoryInstruction()`/`validatePermanentKnowledgeCandidate()` sin cambios de comportamiento; build y lint del frontend limpios, sin advertencias nuevas.

**Confirmación explícita.** Con estas dos correcciones, la auditoría final del Bloque 3 no encontró ningún problema estructural de privacidad, consentimiento, aislamiento, RLS, exportación o borrado. Los dos puntos restantes quedan documentados honestamente como limitación conocida, no como deuda oculta. El Product Owner cierra formalmente el Bloque 3 con esta auditoría.

---

## FASE 7, BLOQUE 4 — CONEXIÓN DE EL RAZONADOR CON EL MOTOR DE AFINIDAD (2026-07-23)

Con el Bloque 3 cerrado, se siguió la metodología completa de esta fase para el Bloque 4: análisis conceptual (21 secciones, cerrado tras diez precisiones del Product Owner en cuatro rondas de revisión crítica, ninguna en contradicción con la arquitectura ya construida) → diseño técnico completo (17 puntos, con un principio adicional integrado en una ronda final) → auditoría técnica previa → implementación incremental → verificación exhaustiva → documentación.

**Qué se construyó.** El Razonador consulta, bajo demanda y nunca como prerrequisito de su pipeline, la dimensión `categoria` del perfil de Afinidad ya calculado por el Motor de Afinidad (Fase 6) — nunca la reconstruye, nunca la reinterpreta, nunca escribe en ella. La Afinidad describe preferencia relativa, nunca identidad, nunca una restricción, nunca decide por sí sola una recomendación: solo desempata entre alternativas que el contexto real, las restricciones vigentes y el resto de la jerarquía ya dejaron elegibles.

**Diez precisiones cerradas por el Product Owner a lo largo de cuatro rondas del análisis conceptual** (resumen; ver el propio documento del análisis para el detalle completo de cada una): consulta bajo demanda, nunca prerrequisito del pipeline; el Razonador nunca recibe el perfil completo, solo la porción pertinente al turno; la Afinidad nunca participa en interpretar la intención de la persona; la Afinidad explica preferencias, nunca identidad; el Descubrimiento puede prevalecer sobre la Afinidad ("la ciudad siempre debe ser más grande que el algoritmo"); la Afinidad nunca es una dependencia operacional; sin memoria propia de Afinidad dentro ni entre turnos; la Afinidad nunca explica por sí sola una recomendación (siempre integrada al contexto real del turno); la Afinidad nunca sustituye la curiosidad de la Guía IA por el presente (acotado explícitamente para no reabrir la prohibición ya vigente de que la conversación nunca sea una vía indirecta hacia el Motor de Afinidad); y la Afinidad nunca envejece sola — el tiempo es contexto, la evidencia (`evidence_status`/`confidence`, ya calculados por la Fase 6) es la fuente de verdad, sin tocar el mecanismo de decaimiento ya aprobado en la Fase 6.

**Hallazgo técnico presentado durante la auditoría previa al diseño (no una contradicción, una decisión de alcance).** Auditando cómo `context.ts` obtiene el contenido real de `CityContext`, se encontró una asimetría: `candidatos_editorial()` ya devuelve `actor_id` (gratis); `events` tiene `business_id` pero `context.ts` no lo selecciona (alcanzable con una consulta pequeña); `places` no tiene ningún vínculo estructural con `actors` (ausencia total, no una omisión de consulta). Conectar la dimensión `actor_seguido` de Afinidad en esta primera iteración habría producido cobertura asimétrica e inconsistente entre tipos de contenido. El Product Owner confirmó limitar esta iteración exclusivamente a la dimensión `categoria`, difiriendo `actor_seguido` hasta que todas las fuentes de contenido puedan resolver `actor_id` de forma homogénea — "prefiero una cobertura completamente consistente antes que una implementación parcial". Segundo hallazgo, menor: el perfil de Afinidad nunca se había incluido en `export-user-data` desde que se construyó en la Fase 6 — vacío preexistente, no introducido por este bloque, corregido aquí por decisión explícita del Product Owner ("todo dato personal nace exportable").

**Principio arquitectónico adicional, confirmado sin contradicción y ya garantizado por construcción del propio diseño**: *"La Afinidad nunca incrementa el conjunto de candidatos posibles; únicamente altera el orden de preferencia entre candidatos que ya fueron considerados elegibles por el contexto real, las restricciones vigentes y la jerarquía de prioridad ya aprobada."* El módulo de este bloque nunca consulta ninguna función generadora de contenido (`candidatos_afinidad()`, `discoverable_content()`, `compose_feed()` — reservadas al Compositor del Feed) — solo `affinity_profile()`, y solo para anotar preferencia sobre categorías que `context.ts` ya resolvió de forma completamente independiente.

**Implementación:**

- **Sin ninguna migración nueva** — el primer bloque de la Fase 7 que no la requiere. `affinity_profile()` ya existía, ya era `security definer`, ya derivaba identidad exclusivamente de `auth.uid()`, con exactamente el contrato de columnas necesario.
- `supabase/functions/ai-guide/affinity.ts` (nuevo): resuelve el actor propio de tipo `persona` desde `auth.uid()` (mismo patrón que `useMyActorId.js`, garantía de la Fase 3 Bloque A); llama `affinity_profile()` con el propio token de quien llama; filtra a la dimensión `categoria` únicamente, y dentro de ella, solo a las categorías que ya aparecen entre los candidatos reales de `CityContext` (principio de minimización dentro del propio pipeline); nunca expone el peso numérico crudo, solo confianza/estado de evidencia ya traducidos; degrada honestamente a un conjunto vacío ante cualquier fallo, exactamente como si la compuerta hubiera decidido no consultar.
- `supabase/functions/ai-guide/index.ts`: compuerta de consulta bajo demanda, puramente de código y sin ninguna llamada adicional al proveedor de IA — `ownerId && context.type === 'city'` (un `placeId` presente corresponde exactamente al escenario ya excluido en el análisis conceptual: "negocio concreto ya identificado por nombre"). Inserción en el pipeline después de `buildContext()` (necesita sus categorías reales) y antes de `decide()`.
- `supabase/functions/ai-guide/decision.ts`: jerarquía de prioridad extendida de cinco a ocho niveles (restricciones duras → seguridad/bienestar → pedido explícito → Conocimiento Permanente pertinente → Afinidad real → confianza/verificación → criterio editorial → contenido patrocinado nunca por encima), resolviendo con precisión un marcador genérico heredado del Bloque 1. Nueva `describeAffinityInsights()` (mismo patrón que `describePermanentFacts()`) traduce cada entrada a una frase de certeza relativa, nunca un número. **Sin ningún campo nuevo en `Decision` ni en `ReasonerOutput`** — la influencia de Afinidad cabe por completo en `reason`/`priorityTrace`, ya existentes desde el Bloque 1.
- `supabase/functions/ai-guide/expression.ts`: **sin cambios** — Afinidad nunca cruza la frontera de El Razonador como estructura propia, confirmando la conclusión ya adelantada en el cierre del análisis conceptual.
- `supabase/functions/export-user-data/index.ts`: agrega el perfil agregado de Afinidad (`affinity_profile()`, nunca `affinity_contributions` cruda), llamado con el propio token de quien pide la exportación — no con la clave de servicio, porque `affinity_profile()` deriva su verificación de `auth.uid()`, que un llamador `service_role` no tiene.
- `src/features/settings/AffinitySection.jsx`, `GuideChat.jsx`, `SettingsPage.jsx`: **sin cambios** — ninguna acción nueva de interfaz; las correcciones de Afinidad siguen viviendo exclusivamente en `AffinitySection.jsx`.

**Verificación realizada.** Postgres 16 real (sin necesidad de recrear la base desde cero, ya que no hay migración nueva): confirmado que "todo profile tiene exactamente un actor tipo persona" (garantía de la Fase 3 Bloque A) mediante creación real de una persona de prueba; simulación de extremo a extremo con contribuciones reales de Afinidad (categoría con evidencia reciente → `evidence_status='activa'`; categoría con evidencia antigua más una corrección `atenuar` real → `evidence_status='historica'`, confirmando que el estado "histórico" requiere una compensación negativa real, nunca solo el paso del tiempo, exactamente el principio ya registrado en la Precisión 2 de la cuarta ronda del análisis conceptual) — el filtro de categorías pertinentes, ejecutado contra este resultado real, conservó correctamente las dos categorías presentes en un contexto de prueba y excluyó correctamente una tercera categoría real pero ajena al turno; aislamiento estricto confirmado entre dos personas reales y frente a un invitado (cero filas, mismo mecanismo ya construido y verificado en la Fase 6, sin necesidad de ningún cambio); cascada de eliminación de cuenta confirmada. Verificación de tipos equivalente a `deno check` vía `tsc --strict`: cero errores nuevos, solo los mismos diagnósticos preexistentes ya documentados desde el Bloque 1. Regresión de `validateDecision()`/`validateMemoryInstruction()`/`validatePermanentKnowledgeCandidate()` (9/9 aserciones, sin cambios de comportamiento — ningún validador fue tocado). Verificación aislada de `describeAffinityInsights()` (3/3 casos: nunca incluye un número, nunca describe una afinidad histórica en presente, incluye la nota de reinicio reciente cuando corresponde). Build y lint del frontend limpios, sin advertencias nuevas — sin cambios de frontend previstos ni realizados en este bloque.

**Qué NO se construyó en este bloque** (exclusiones explícitas ya aprobadas): la dimensión `actor_seguido` de Afinidad, diferida hasta que `places`/`events`/`editorial` puedan resolver `actor_id` de forma homogénea; cualquier cambio a `affinity_profile()`, `apply_affinity_correction()` o al mecanismo de decaimiento (pertenecen a la Fase 6, cerrada); cualquier conexión con `compose_feed()`/el Compositor del Feed; cualquier acción nueva de interfaz; cualquier migración.

**Confirmación explícita.** Toda la implementación se ciñó exactamente al alcance aprobado en el diseño técnico, incluyendo las dos decisiones de alcance encontradas durante la auditoría (dimensión `categoria` únicamente; inclusión del perfil agregado en la exportación). No se avanza al Bloque 5 (experiencia unificada de transparencia, corrección y borrado) sin autorización explícita.

---

## FASE 7, BLOQUE 4 — AUDITORÍA FINAL Y SINCRONIZACIÓN DOCUMENTAL (2026-07-23)

Antes de declarar cerrado el Bloque 4, se realizó una auditoría final exclusivamente sobre la implementación ya terminada (18 puntos exigidos: uso exclusivo del cliente autenticado, ausencia de rutas hacia `affinity_contributions`/`candidatos_afinidad()`/`compose_feed()`/`discoverable_content()`/`apply_affinity_correction()`, compuerta bajo demanda, tratamiento de cada estado de confianza/evidencia/corrección, ausencia de uso de `last_updated_at` como caducidad, frontera con interpretación de intención, imposibilidad de que Afinidad introduzca contenido ajeno a `CityContext`, prioridad del pedido explícito/Memoria/Conocimiento Permanente, prevalencia del descubrimiento valioso, lenguaje del prompt, pureza de `expression.ts`, ausencia de persistencia paralela, reflejo inmediato de correcciones, exportación exclusiva del perfil agregado propio, ausencia de vía administrativa nueva, consistencia de la jerarquía actualizada con los documentos gobernantes, y legitimidad de la diferencia Feed/Guía IA) — mismo rigor que las auditorías finales de la Fase 6 y del Bloque 3.

**Tres hallazgos, ninguno crítico**: (A, observacional) ausencia de validadores de runtime explícitos para los campos tipo-enum de `AffinityInsight`, de bajo riesgo real porque `affinity_profile()` los produce mediante expresiones `CASE` fijas en Postgres, nunca texto libre — documentado como observación menor, sin corrección; (B, importante) la jerarquía de ocho niveles ya implementada en el prompt de `decision.ts` no estaba reflejada en `AI_PHILOSOPHY.md §9` (el documento canónico seguía mostrando la jerarquía original de cinco niveles), y `FASE7_CONTRATO_ARQUITECTONICO.md` prometía explícitamente, al fijar el alcance de toda la fase, que la jerarquía de `AI_PHILOSOPHY.md` "sigue vigente sin cambios" — una desalineación documental real, nunca una contradicción de criterio de fondo (los ocho niveles son un refinamiento de precisión del mismo criterio, nunca una reversión); (C, observacional) una de las cuatro prohibiciones de lenguaje del prompt (no presentar evidencia histórica como vigente) vive en el bloque de datos entregado al modelo en vez del bloque de reglas, sin efecto funcional.

**Corrección aplicada, exclusivamente documental — sin ningún cambio de código, migración, Edge Function o frontend:**

- `AI_PHILOSOPHY.md §9`: actualizado a la jerarquía de ocho niveles (restricciones duras → seguridad y bienestar → pedido explícito de la persona → Conocimiento Permanente pertinente → afinidad real → confianza/verificación → curaduría editorial → contenido patrocinado nunca por encima), con nota explícita de que el refinamiento ocurrió en la Fase 7, Bloque 4, y es una precisión, nunca un cambio de criterio. Corregida además la referencia cruzada "(Cuarto, arriba)" de la sección de verificación, ahora "(Sexto, arriba)", ya que la posición de confianza/verificación se desplazó de nivel 4 a nivel 6.
- `FASE7_CONTRATO_ARQUITECTONICO.md`: registrada una enmienda explícita en la sección "Relación con la arquitectura ya existente" documentando el refinamiento de la jerarquía como excepción aprobada a la promesa original de "sigue vigente sin cambios" (que se mantiene intacta para el resto del comportamiento: personalidad, principios no negociables, cómo razona y decide). Actualizado el paréntesis de la definición de El Razonador (componente 3) para reflejar el orden de ocho niveles en vez de repetir el orden de cinco ya obsoleto.
- `FASE7_FILOSOFIA_GUIA_IA.md §8`: corregida la referencia a "el tercer nivel de la jerarquía" (posición de Afinidad antes del refinamiento) a "el quinto nivel", con la misma nota de que la jerarquía se refinó en el Bloque 4 para nombrar con precisión el pedido explícito y el Conocimiento Permanente como niveles propios.
- Verificado por búsqueda exhaustiva (`grep`) que ninguna otra referencia a la jerarquía original de cinco niveles permanece en ningún documento del proyecto — `MASTERPLAN.md` solo apunta a `AI_PHILOSOPHY.md §9` por referencia, sin restablecer contenido específico, y no requirió cambios; las entradas históricas de `PROJECT.md`/`CHANGELOG.md` anteriores al Bloque 4 mencionan la jerarquía de forma genérica, sin citar el orden específico, por lo que no quedan desactualizadas — se dejan intactas como registro honesto de lo que era cierto en su momento, sin reescribir retroactivamente la historia del proyecto.

**Hallazgos A y C**: mantenidos como observaciones documentadas, sin corrección — no ameritan reabrir el bloque, por decisión explícita del Product Owner.

**Confirmación explícita.** Con esta sincronización, el comportamiento real de El Razonador y la documentación canónica de la Guía IA vuelven a describir exactamente lo mismo, sin ninguna referencia obsoleta pendiente. El Product Owner cierra formalmente el Bloque 4 con esta auditoría.

---

## FASE 7, BLOQUE 5 — EXPERIENCIA UNIFICADA DE TRANSPARENCIA, CORRECCIÓN Y BORRADO (2026-07-24)

Quinto y último bloque técnico de la Fase 7. La auditoría previa confirmó que `export-user-data` y `process-account-deletions` (Fase 1, Bloque 5) funcionaban correctamente desde su creación pero no tenían ninguna superficie en el frontend, y que `GuideChat`/`AffinitySection`/`PermanentKnowledgeSection` no tenían ningún cruce entre sí. El análisis conceptual, desarrollado en tres rondas de precisión del Product Owner, aprobó la lectura amplia de `FASE7_CONTRATO_ARQUITECTONICO.md` (línea 139): el Bloque 5 consolida no solo la transparencia propia de la Guía IA, sino la experiencia completa de privacidad de la cuenta, reutilizando exactamente la infraestructura de la Fase 1 — **ningún mecanismo nuevo**.

### Principios aprobados en el análisis conceptual
- **Ciclo de vida de la información**: la conversación es temporal por defecto; se vuelve permanente solo con consentimiento explícito; la Afinidad aprende patrones generales de la interacción con el ecosistema (seguir, guardar, reaccionar), nunca de la conversación; la persona siempre puede revisar, corregir, exportar o borrar.
- **Separación entre transparencia y funcionamiento**: mirar o navegar información nunca es en sí mismo una acción de corrección; las acciones que modifican comportamiento (borrar, corregir, atenuar, reiniciar, eliminar) permanecen explícitas y visualmente diferenciadas.
- **Simplicidad para la persona**: la transparencia nunca exige entender la arquitectura interna de la Guía IA para ejercer control real sobre la información.
- **Una única experiencia de privacidad**: no una mera superficie visual — una experiencia funcional unificada (explicar, revisar, corregir, exportar, borrar), consolidada dentro de `SettingsPage` sin pantalla ni ruta nueva.

### Hallazgos técnicos del diseño (ninguno bloqueante)
- `get_conversation` no exponía `started_at`/`last_activity_at`, aunque `memory.ts` ya los leía internamente para otro propósito — necesarios para el resumen de estado de Memoria de Sesión en Ajustes. Aprobado extender la respuesta de esa misma acción, sin crear ninguna acción nueva.
- `data_requests.scheduled_for` no tenía ningún valor por defecto ni disparador que calculara los 30 días de periodo de gracia ya aprobados como decisión de producto desde la Fase 1. El Product Owner aprobó explícitamente calcularlo del lado del servidor mediante un disparador mínimo — los 30 días son una garantía permanente del sistema, no deben depender del reloj del cliente.

### `supabase/migrations/0045_fase7_bloque5_privacidad_unificada.sql` (nuevo, único cambio de esquema del bloque)
Un disparador `before insert` en `data_requests`: si `type = 'eliminacion'` y `scheduled_for` es nulo, lo fija a `requested_at + 30 días`. No sobreescribe un valor ya provisto; nunca se dispara para `type = 'exportacion'`.

### `supabase/functions/ai-guide/memory.ts` e `index.ts`
`fetchExistingConversation()` agrega `startedAt`/`lastActivityAt` a su tipo de retorno y a la respuesta JSON de la acción `get_conversation` — mismo contrato, dos campos adicionales.

### Frontend (nuevo)
- `src/lib/privacy.js`: `getDataRequests`, `requestAccountExport` (invoca `export-user-data` con el mecanismo oficial de exportación ya existente; registra `consent_records` con `event_type: 'exportacion_solicitada'` solo tras éxito), `requestAccountDeletion` (inserta en `data_requests` sin enviar `scheduled_for` — lo calcula el disparador — y registra `consent_records` con `event_type: 'eliminacion_solicitada'`), `cancelAccountDeletion`.
- `src/features/settings/PrivacyIntro.jsx`: explicación introductoria única de las tres capas (Conversación Activa / Conocimiento Permanente / Afinidad).
- `src/features/settings/SessionMemoryStatus.jsx`: resumen de estado de la Memoria de Sesión — puramente informativo; un enlace reutiliza el mecanismo oficial mediante el cual la aplicación ya abre la conversación activa (hoy, la cápsula de la Guía IA en Inicio, que rehidrata la conversación persistida sin importar dónde se monte). La acción de borrar la conversación permanece, sin mover, en `GuideChat.jsx`.
- `src/features/settings/AccountDataSection.jsx`: exportar mis datos (entrega el archivo mediante el mecanismo oficial de descarga de la plataforma) y eliminar mi cuenta (reutiliza `ConfirmationModal`, ya existente, explicando irreversibilidad, periodo de gracia y anonimización del contenido colaborativo — requisito no negociable ya registrado desde la Fase 1); si ya existe una solicitud pendiente, muestra su fecha y permite cancelarla.
- `src/features/settings/PrivacySection.jsx`: consolida `PrivacyIntro` → `SessionMemoryStatus` → `AffinitySection` → `PermanentKnowledgeSection` → `AccountDataSection` en un solo punto de montaje.
- `src/pages/SettingsPage.jsx`: `AffinitySection`/`PermanentKnowledgeSection`, antes montadas sueltas, se reemplazan por `<PrivacySection userId={user.id} actorId={myActorId} />` — sin pantalla ni ruta nueva.

### Verificación realizada
- **Postgres 16 real**, las 45 migraciones (`0001`-`0045`) en orden: el disparador calcula correctamente `scheduled_for = requested_at + 30 días` cuando no se manda explícitamente; una solicitud de `exportacion` nunca recibe `scheduled_for`; un valor explícito de `scheduled_for` no es sobreescrito; verificado también con un rol de bajo privilegio real (`authenticated`, `auth.uid()` simulado vía `request.jwt.claim.sub`), no solo como superusuario. Reversión de la migración (`drop trigger`/`drop function`) confirmada limpia.
- `tsc --strict` sobre `memory.ts`/`index.ts` modificados: cero errores nuevos, solo los diagnósticos de referencia ya preexistentes (documentados desde bloques anteriores).
- Build y lint del frontend: limpios, sin advertencias nuevas en ninguno de los archivos agregados o modificados.

### Alcance explícitamente excluido
Ningún mecanismo nuevo de consentimiento; Afinidad y Conocimiento Permanente sin cambios de lógica; Memoria de Sesión sin mover su acción de borrado del chat; sin pantalla ni ruta nueva; `profiles.interests` fuera de este bloque.

**Con este bloque, la Fase 7 queda completa en sus cinco bloques técnicos**: separación Razonador/Expresión, Memoria de Sesión, Conocimiento Permanente, conexión con el Motor de Afinidad, y esta experiencia unificada de transparencia, corrección y borrado.

---

## FASE 7 — AUDITORÍA TRANSVERSAL FINAL Y CIERRE (2026-07-24)

Antes de declarar cerrada la Fase 7, se realizó una auditoría transversal de los cinco bloques como un único sistema (mismo estándar aplicado al cierre de la Fase 6) — no una revisión adicional de cada bloque por separado, sino específicamente de las fronteras entre ellos: el pipeline completo (identidad → Memoria de Sesión → Conocimiento Permanente → contexto → Afinidad condicional → El Razonador → La Expresión → persistencia), consentimiento, privacidad y aislamiento, borrado, exportación, eliminación de cuenta, integración frontend/backend, documentación canónica, migraciones, pruebas obligatorias, concurrencia e idempotencia, y rendimiento.

**Conclusión de la auditoría, confirmada por el Product Owner**: la arquitectura de los cinco bloques es coherente como sistema único — sin fugas de datos entre personas, sin ninguna regla de pureza rota, la conversación nunca alimenta la Afinidad, El Razonador nunca escribe Conocimiento Permanente, La Expresión nunca recibe datos personales crudos. Ninguna contradicción arquitectónica encontrada.

**Cuatro hallazgos importantes, ninguno una contradicción de diseño — todos defectos operativos reales en el cruce entre bloques o entre la Fase 7 y la Fase 1**, que el Product Owner exigió corregir antes del cierre formal (a diferencia de la deuda ordinaria) porque afectan garantías que la propia interfaz del Bloque 5 ya promete a la persona:

### Corrección H1 — una sola solicitud de eliminación pendiente por persona

Un doble clic real sobre "Eliminar mi cuenta" (`AccountDataSection.jsx`) podía crear más de una fila `data_requests` pendiente de tipo `eliminacion` a la vez — la interfaz solo mostraba y permitía cancelar la primera; una segunda, invisible, habría sobrevivido a esa cancelación.

**`supabase/migrations/0046_fase7_cierre_correcciones_operativas.sql`** (nuevo): un índice único parcial —`unique index ... on data_requests (user_id) where type = 'eliminacion' and status = 'pendiente'`— garantiza del lado del servidor, nunca solo en el frontend, que jamás exista más de una solicitud pendiente por persona, sin restringir en absoluto cuántas solicitudes completadas, canceladas o rechazadas puede acumular esa misma persona con el tiempo. Un segundo intento falla con una violación de unicidad (código Postgres `23505`).

`src/lib/privacy.js` (`requestAccountDeletion`) reconoce explícitamente ese código y responde con la solicitud pendiente que ya existe, nunca con un error críptico — para la persona, el resultado de un doble clic es exactamente el mismo, una única solicitud. `ConfirmationModal.jsx` gana un prop `confirmDisabled` (opcional, retrocompatible con sus otros nueve usos en el proyecto) que `AccountDataSection.jsx` conecta a su propio estado `busy` — defensa de experiencia en el frontend, nunca la única garantía.

### Corrección H2 — idempotencia de `process-account-deletions` ante un fallo parcial

Si `auth.admin.deleteUser()` ya tenía éxito pero la actualización posterior de `data_requests` a `completada` fallaba, el siguiente ciclo encontraba la misma solicitud todavía sin cerrar e intentaba reasignar comentarios de un actor que la cascada ya había borrado — un fallo real tratado como si fuera nuevo, dejando la solicitud atrapada para siempre sin poder alcanzar un estado terminal.

`supabase/functions/process-account-deletions/index.ts` ahora comprueba explícitamente, antes de reasignar o eliminar, si el perfil de la persona todavía existe. Si ya no existe, la eliminación real ya ocurrió en un ciclo anterior: no se repite ninguna reasignación ni se vuelve a invocar `deleteUser` — se avanza directo a cerrar la solicitud como `completada`, preservando su trazabilidad. Un fallo real (de reasignación o de `deleteUser`, con la cuenta todavía existente) sigue distinguiéndose con claridad y revierte la solicitud a `pendiente` para reintentarse, nunca oculto como éxito ni perdido en silencio.

### Corrección H3 — carrera entre cancelación y procesamiento

El procesador antes leía primero las solicitudes vencidas y solo al final, una por una, actualizaba su estado — una cancelación legítima de la persona podía colarse en esa ventana sin que el procesador se enterara, procesando la eliminación con un estado ya obsoleto.

`process-account-deletions/index.ts` ahora reclama todas las solicitudes vencidas en una sola sentencia atómica: `update data_requests set status = 'en_proceso' where type = 'eliminacion' and status = 'pendiente' and scheduled_for <= now() returning id, user_id` — reutilizando el estado `en_proceso` que el esquema original de la Fase 1 ya preveía, nunca uno nuevo. Esa transición es la frontera exacta: si la cancelación de la persona (que exige `status = 'pendiente'` tanto en su política de RLS como en su propio `update`) llega antes de que el reclamo tome esa fila, gana la cancelación; si el reclamo llega primero, la cancelación ya no encuentra ninguna fila en `pendiente` y no tiene ningún efecto. Un fallo posterior al reclamo revierte la fila a `pendiente` para reintentarse en el siguiente ciclo (que, gracias a H2, puede cerrarla de forma segura incluso si la eliminación ya se completó realmente).

### Corrección H4 — degradación honesta del contexto real

Memoria de Sesión, Conocimiento Permanente y Afinidad siempre degradaban a un valor vacío honesto ante cualquier fallo, dejando que el turno continuara; `context.ts` no tenía esa misma disciplina — un `placeId` de un lugar ya borrado, o un fallo transitorio de Postgres al leer lugares, eventos o contenido editorial, propagaba la excepción hasta el `catch` más externo de `index.ts`, que respondía con un 500 crudo — el turno completo nunca llegaba a El Razonador ni a La Expresión.

`supabase/functions/ai-guide/context.ts` reescrito: `buildCityContext()` ahora degrada **cada una de sus tres fuentes de forma independiente** (lugares, eventos, contenido editorial) — un fallo en una nunca borra lo que sí se leyó con éxito en las otras, mismo principio de degradación independiente ya usado en Memoria/Conocimiento Permanente/Afinidad. `buildContext()` distingue explícitamente, en su registro de errores, un lugar legítimamente inexistente (código Postgres `PGRST116`) de un fallo transitorio, y en ambos casos continúa con el contexto general de ciudad (legítimo: la persona ya no está viendo la ficha de un negocio identificado) en vez de un 500 crudo; si ese contexto de ciudad también falla, el último nivel de seguridad es un contexto vacío pero válido — nunca una excepción sin manejar. El Razonador ya sabe reconocer, con esta misma información real pero incompleta, que no tiene base suficiente para responder (`"noAnswer": true`, regla ya vigente desde el Bloque 1).

### Verificación de las cuatro correcciones

- **Postgres 16 real, las 46 migraciones (`0001`-`0046`) reproducidas desde una base completamente limpia** (sin arrastrar estado de verificaciones anteriores): orden y dependencias correctas, sin objetos huérfanos.
- **H1**: verificado que una segunda solicitud pendiente simultánea falla con `23505`; que cancelar la pendiente y crear una nueva funciona con normalidad (la historia de solicitudes canceladas se conserva intacta); reversión del índice (`drop index`) confirmada limpia.
- **H3**: verificado con concurrencia real de Postgres (dos transacciones simultáneas, una reteniendo el bloqueo de fila con `pg_sleep` mientras la otra queda bloqueada esperando) en **ambos sentidos** — el reclamo del procesador gana cuando compromete primero (la cancelación posterior afecta 0 filas, la solicitud queda `en_proceso`), y la cancelación de la persona gana cuando compromete primero (el reclamo posterior afecta 0 filas, la solicitud queda `cancelada`).
- **H2**: verificado en Postgres real que, tras simular una eliminación de cuenta ya ocurrida (`auth.users` borrado, cascada real disparada, `data_requests` todavía `pendiente`), el nuevo chequeo de existencia del perfil detecta correctamente la ausencia y permite cerrar la solicitud a `completada` sin ningún error. Complementado con una prueba funcional aislada (cinco casos: camino normal, cuenta ya eliminada, fallo real de reasignación, fallo de `deleteUser`, fallo al cerrar tras una eliminación ya exitosa) que reproduce fielmente el control de flujo real del archivo — los cinco casos distinguen correctamente entre "ya procesado parcialmente" y "fallo real", nunca ocultando uno como el otro.
- **H4**: verificado con una prueba funcional aislada de seis casos (lugar existente, lugar inexistente, fallo transitorio de Postgres, fallo solo de eventos, fallo solo de contenido editorial, fallo total de las tres fuentes) que reproduce fielmente el control de flujo real de `context.ts` — confirmando degradación independiente por fuente y que el contexto vacío final nunca se alcanza salvo que las tres fuentes fallen a la vez.
- `tsc --strict` sobre `context.ts`/`process-account-deletions/index.ts` modificados: cero errores nuevos — solo los mismos diagnósticos de referencia ya documentados desde bloques anteriores, replicados por primera vez en `process-account-deletions/index.ts` al incluirlo en el arnés de verificación de tipos.
- Build y lint del frontend: limpios, sin advertencias nuevas.

### H5 y H8 — documentados como deuda, sin corrección en esta ronda

- **H5**: `data_requests.type = 'exportacion'` nunca tiene ningún camino de escritura en todo el proyecto, ni siquiera tras construir la interfaz en el Bloque 5 — `requestAccountExport()` solo escribe en `consent_records`. La exportación sí tiene trazabilidad legítima por esa vía; la variante de flujo de trabajo en `data_requests` permanece sin ningún consumidor. Su permanencia o eliminación futura requiere un análisis separado, deliberadamente no abierto en este cierre.
- **H8**: `ai_ensure_fresh_conversation()` (migración `0043`, Bloque 2) no tiene ningún bloqueo explícito — dos turnos concurrentes de la misma persona (dos pestañas) que encuentran "sin conversación todavía" pueden intentar ambos crear la fila de estado; la clave primaria evita corrupción de datos, pero el segundo intento puede no persistirse (la persona sí recibe su respuesta con normalidad). Se registra como deuda de concurrencia — no se reabre el Bloque 2 en este cierre; una futura mejora de exclusión mutua o reintento idempotente queda pendiente.

### H6 y H7 — documentación sincronizada antes del cierre

- **`MASTERPLAN.md`**: la sección "Fase 7" describía una tabla `ai_sessions` que nunca se construyó. Corregida para describir el esquema real (`ai_active_conversations`, `ai_conversation_turns`, `permanent_knowledge_categories`, `permanent_knowledge_facts`, `permanent_knowledge_audit_log`, y el disparador de la migración `0045`), con una nota de corrección explícita (mismo formato ya usado al cerrar la Fase 6) y el encabezado marcado **✅ CERRADA (2026-07-24)**.
- **`ROADMAP.md`**: Fase 7 agregada a "Fases completas" y marcada `✅ ... cerrada` en el resumen de fases — antes solo aparecía sin marcar, a diferencia de las Fases 1-6.
- **`supabase/README.md`**: la descripción de `export-user-data` actualizada para mencionar la conversación activa, sus turnos, el Conocimiento Permanente vigente con su trazabilidad legítima, y el perfil agregado de Afinidad — agregados por los Bloques 2, 3 y 4 y nunca antes reflejados aquí. La descripción de `process-account-deletions` actualizada para mencionar el reclamo atómico y el reconocimiento seguro de una cuenta ya eliminada.

### H9-H12 — limitaciones deliberadas, mantenidas sin corrección

Confirmadas por el Product Owner como aceptables tal como están: confirmación reforzada de Conocimiento Permanente afirmada por el propio cliente (salvaguarda ligera ya aprobada desde el Bloque 3); la no repetición de un candidato ya rechazado depende de que El Razonador relea el hilo y reconozca su propia mención anterior (instrucción de prompt, no garantía de código); "Continuar conversación" navega a la superficie actual de la Guía IA pero no reabre automáticamente la cápsula; la exclusión de Afinidad en preguntas sobre un negocio ya identificado por nombre depende de una regla de El Razonador cuando no existe `placeId`, no de una compuerta estructural adicional.

### Cierre formal

Con las cuatro correcciones operativas verificadas contra Postgres 16 real (incluyendo concurrencia real, no solo revisión de código), la documentación canónica sincronizada, y la deuda restante (H5, H8) y las limitaciones deliberadas (H9-H12) registradas con la misma honestidad que el resto del proyecto: **el Product Owner declara oficialmente cerrada la Fase 7 — Guía IA v2**, completa en sus cinco bloques técnicos más esta auditoría transversal de cierre. No lista para producción hasta validar la deuda técnica obligatoria ya heredada de la Fase 1 (`export-user-data`/`process-account-deletions` nunca probadas contra un proyecto Supabase real ni contra su API de administración de Auth, existencia del actor semilla "Cuenta eliminada" no confirmada en un entorno real) — misma condición que ya rige el resto del proyecto desde su propio cierre de Fase 1.

---

## FASE 7 CERRADA — Guía IA v2 (2026-07-24)

Cierre histórico formal de la Fase 7 completa del `MASTERPLAN.md`, aprobado explícitamente por el Product Owner tras la auditoría transversal de los cinco bloques como sistema único (ver sección anterior) y las cuatro correcciones operativas (H1-H4) que esa auditoría exigió antes del cierre. Misma metodología de cierre ya aplicada a las Fases 4, 5B y 6.

### 1. Objetivo original

**Objetivo original** (`MASTERPLAN.md`, texto previo a esta fase): introducir la Sesión de Guía IA persistente y conectar la IA al Motor de Afinidad de la Fase 6, para que respondiera con criterio de afinidad real y no solo con el contexto de la pregunta puntual — el "objetivo" declarado hablaba de una única tabla `ai_sessions` (usuario, historial de conversación, con mecanismo de borrado que reutiliza `consent_records`).

**Resultado final**: el objetivo de fondo (memoria real + afinidad real) se cumplió íntegramente, pero la forma técnica original quedó reemplazada, antes de escribirse una sola línea de código, por `FASE7_FILOSOFIA_GUIA_IA.md` y `FASE7_CONTRATO_ARQUITECTONICO.md` — la tabla `ai_sessions` nunca existió. Lo construido es deliberadamente más granular: dos tablas para Memoria de Sesión (`ai_active_conversations`/`ai_conversation_turns`, Bloque 2), tres tablas para una categoría que el plan original ni siquiera distinguía (Conocimiento Permanente no-afinidad, Bloque 3), una conexión de solo lectura al Motor de Afinidad ya existente (Bloque 4, sin ninguna tabla nueva), y la exposición por primera vez, desde la interfaz, de mecanismos de privacidad que ya existían desde la Fase 1 (Bloque 5). `MASTERPLAN.md` y `ROADMAP.md` quedaron corregidos como parte de este mismo cierre — el plan maestro no queda desactualizado silenciosamente, exactamente el mismo principio ya aplicado al cerrar la Fase 6.

### 2. Filosofía adoptada

**`FASE7_FILOSOFIA_GUIA_IA.md`** (aprobada 2026-07-23, previa a cualquier diseño técnico, subordinada a `VISION_MAESTRA.md` y construida consolidando —nunca reemplazando— `AI_PHILOSOPHY.md`). Responde qué debe significar que la Guía IA "recuerde" y "personalice", no cómo se implementa. Veintitrés principios permanentes; los de mayor peso arquitectónico:

- **Tres categorías que nunca deben confundirse**: contexto temporal de una conversación, Conocimiento Permanente no-afinidad, y Afinidad construida por el Motor de Afinidad (Fase 6) — cada una con su propia naturaleza, su propio mecanismo de entrada y su propia relación con el consentimiento.
- **La conversación no es una vía nueva hacia el Motor de Afinidad** (§11): la prohibición de NLP/embeddings ya vigente para el Motor de Afinidad se extiende sin excepción a la Guía IA — cualquier señal que deba fortalecer la afinidad permanente tendría que pasar por el mismo tipo de interacción estructurada y verificable que ya gobierna todo lo demás, nunca por analizar directamente lo que la persona dijo.
- **Principio de memoria veraz** (§6): la Guía IA nunca puede atribuirle a una persona una preferencia, un dato o una declaración que no fue realmente expresada — inventar un recuerdo es tan grave como inventar un lugar que no existe.
- **La Guía IA nunca define la identidad de una persona** (§16): puede describir comportamientos y preferencias expresadas, pero nunca las convierte en una etiqueta de identidad.
- **La conversación pertenece siempre a la persona, nunca al sistema** (§13): la Guía IA la administra exclusivamente para servirle, nunca como un activo propio.
- **Principio de cierre** (§25): ninguna persona es reducible a su perfil de Afinidad, a su historial de conversación, ni al patrón que la Guía IA cree reconocer en ella — la memoria existe para servir a la persona, nunca para definir quién es.

### 3. Contrato arquitectónico

**`FASE7_CONTRATO_ARQUITECTONICO.md`** (aprobado 2026-07-23, mismo espíritu que `FASE6_CONTRATO_ARQUITECTONICO.md`, arquitectura conceptual únicamente — sin sesiones, tablas, funciones, RPC, prompts ni proveedor de tecnología). Traduce los veintitrés principios en cuatro componentes conceptuales nuevos, más los ya heredados sin cambios:

- **Memoria de Sesión**: da continuidad al momento presente de una conversación activa. Regla de pureza: es pasiva — retiene, nunca interpreta, nunca decide.
- **Conocimiento Permanente de la Persona, no-afinidad**: retiene hechos estables que no son, en el sentido de la Fase 6, una señal de interés. Regla de pureza en dos capas: el consentimiento explícito es condición necesaria pero nunca suficiente — la plataforma conserva su propia responsabilidad de minimización, finalidad y proporcionalidad.
- **El Razonador**: sintetiza las cuatro fuentes (contexto del ecosistema, Afinidad, Memoria de Sesión, Conocimiento Permanente) en una decisión articulable. Regla de pureza: consulta, nunca reconstruye — no tiene memoria propia entre turnos.
- **La Expresión**: traduce la decisión ya tomada en lenguaje natural. Regla de pureza: nunca decide contenido, solo estilo — no tiene acceso a datos personales crudos.

**Cadena de responsabilidad de un solo sentido**: Fuentes de contexto + Motor de Afinidad + Memoria de Sesión + Conocimiento Permanente → El Razonador → La Expresión → lo que la persona lee. Ningún componente escribe hacia atrás. **Principio de secuenciación explícito**: la transparencia, la corrección y el borrado deben nacer en el mismo bloque que introduce cualquier dato nuevo, nunca diferirse a un bloque posterior — condición que determinó que Memoria de Sesión (Bloque 2) y Conocimiento Permanente (Bloque 3) incluyeran su propio mecanismo de corrección/borrado desde su propio bloque, y que la separación Razonador/Expresión (Bloque 1) existiera antes de que hubiera memoria real que sintetizar.

**Enmienda registrada durante la implementación (Bloque 4)**: la jerarquía de priorización de `AI_PHILOSOPHY.md` §9 se refinó de cinco a ocho niveles al construirse la conexión con el Motor de Afinidad — nombrando explícitamente el pedido explícito de la persona y el Conocimiento Permanente como niveles propios, antes disueltos dentro de "afinidad real". Refinamiento de precisión, nunca cambio de criterio ni reversión de la promesa original del contrato de que el comportamiento de `AI_PHILOSOPHY.md` "sigue vigente sin cambios".

### 4. Resumen de los cinco bloques

1. **Bloque 1 — Separación Razonador/Expresión**: el esqueleto del pipeline (qué responder / cómo decirlo), con explicabilidad ya presente desde el origen, antes de que existiera memoria real. Corrigió, durante su propia auditoría previa, un defecto real heredado: `context.ts` todavía consultaba `editorial_posts`, una tabla eliminada desde la Fase 4 — cualquier pregunta sin `placeId` fallaba con "relation does not exist".
2. **Bloque 2 — Memoria de Sesión** (migración `0043`): una única conversación activa por persona (nunca por contexto/superficie), retención pasiva, expiración por inactividad de 2 horas con purga inmediata de turnos, retractación explícita marcando `retracted_at` sin borrar, borrado explícito y completo. Sin ninguna política de RLS — el único acceso es a través de funciones `security definer` que derivan identidad exclusivamente de `auth.uid()`.
3. **Bloque 3 — Conocimiento Permanente de la Persona, no-afinidad** (migración `0044`): catálogo cerrado de seis categorías (idioma preferido, estilo de respuesta, restricción alimentaria, movilidad, accesibilidad, dato financiero declarado) con niveles de sensibilidad y confirmación reforzada para las dos más sensibles. El Razonador propone un candidato, nunca escribe un hecho — solo una acción explícita de interfaz, posterior y separada, puede confirmarlo. Registro de trazabilidad dedicado, sin lectura administrativa, ni siquiera de la propia dueña de forma directa.
4. **Bloque 4 — Conexión de El Razonador con el Motor de Afinidad** (sin ninguna migración nueva — `affinity_profile()` de la Fase 6 ya tenía exactamente el contrato necesario): consulta bajo demanda, nunca un prerrequisito del pipeline, limitada a la dimensión `categoria` y solo a las categorías ya presentes en el contexto real del turno. La Afinidad nunca incrementa el universo de candidatos — solo desempata entre alternativas que el resto de la jerarquía ya dejó elegibles.
5. **Bloque 5 — Experiencia unificada de transparencia, corrección y borrado** (migración `0045`): consolida en `SettingsPage` toda la experiencia de privacidad de la persona — Memoria de Sesión, Conocimiento Permanente y Afinidad, junto con exportación de datos y solicitud de eliminación de cuenta, expuestas por primera vez desde la interfaz, reutilizando exactamente `export-user-data`/`data_requests`/`consent_records` ya construidos desde la Fase 1. Sin pantalla ni ruta nueva.

Una auditoría transversal final (migración `0046`) verificó los cinco bloques como sistema único y corrigió cuatro hallazgos operativos antes de este cierre (ver punto 7).

### 5. Principales decisiones permanentes incorporadas

- Memoria de Sesión, Conocimiento Permanente y Afinidad son tres categorías que nunca se confunden entre sí, ni en el código ni en el lenguaje de la Guía IA.
- Nada pasa de temporal a permanente sin consentimiento explícito — y ese consentimiento nunca es, por sí solo, autorización ilimitada.
- El Razonador nunca reescribe la Afinidad ni analiza el texto libre de una conversación como vía indirecta hacia ella — la conversación nunca alimenta la Afinidad, sin excepción, ni siquiera con consentimiento.
- La Expresión nunca decide contenido ni tiene acceso a datos personales crudos — separación real garantizada por tipos de TypeScript, no solo por convención documental.
- Jerarquía de priorización de ocho niveles: restricciones duras → seguridad y bienestar → pedido explícito de la persona → Conocimiento Permanente pertinente → Afinidad real (desempate, nunca decide elegibilidad) → confianza/verificación → curaduría editorial → contenido patrocinado nunca por encima.
- La Afinidad nunca incrementa el conjunto de candidatos posibles — únicamente altera el orden de preferencia entre candidatos ya elegibles.
- Principio de ciclo de vida de la información (Bloque 5, UX): conversación temporal por defecto → permanente solo con consentimiento explícito → Afinidad aprendiendo de la interacción estructurada con el ecosistema, nunca de la conversación → revisión/corrección/exportación/borrado siempre disponibles.
- Principio de separación entre transparencia y funcionamiento (Bloque 5): mirar información nunca es, por sí mismo, una acción de corrección.
- Los 30 días de periodo de gracia de eliminación de cuenta son una garantía de producto independiente del reloj del cliente — calculada del lado del servidor (migración `0045`) y protegida por un reclamo atómico irreversible una vez tomado (migración `0046`).

### 6. Hallazgos relevantes encontrados durante el desarrollo

- **Bloque 1**: `context.ts` consultaba una tabla ya eliminada (`editorial_posts`) — cualquier pregunta sin `placeId` fallaba en producción antes de este bloque.
- **Bloque 3, auditoría final**: repetición de candidatos ya rechazados en el mismo hilo (dependía de una señal que nunca se persistía); El Razonador hablando directamente a la interfaz con el campo `reason` de un candidato, rompiendo para esa superficie el principio de que "El Razonador nunca habla directamente con la persona".
- **Bloque 4, diseño técnico**: asimetría estructural real entre `places`/`events`/`editorial` (los dos últimos con vínculo indirecto a `actors`, el primero sin ninguno) — resuelta limitando esta iteración a la dimensión `categoria`, difiriendo `actor_seguido` sin inconsistencia.
- **Bloque 4, auditoría final**: la jerarquía de ocho niveles ya implementada en el prompt real no estaba reflejada en `AI_PHILOSOPHY.md` §9, pese a que el propio contrato prometía que ese documento "sigue vigente sin cambios" — desalineación documental real, nunca una contradicción de criterio de fondo.
- **Auditoría transversal final**: cuatro hallazgos operativos (H1-H4, ver punto 7) invisibles al auditar cada bloque por separado, todos en el cruce entre bloques o entre la Fase 7 y la Fase 1.

### 7. Correcciones importantes realizadas durante las auditorías

- **Bloque 3**: candidato mencionado dentro de la propia respuesta de La Expresión (nunca por El Razonador directamente), quedando naturalmente registrado en el turno para que El Razonador reconozca su propia mención anterior sin ningún mecanismo nuevo.
- **Bloque 4**: `AI_PHILOSOPHY.md` §9 actualizado a la jerarquía de ocho niveles con nota explícita de refinamiento, nunca cambio de criterio; `FASE7_CONTRATO_ARQUITECTONICO.md` con una enmienda registrada; `FASE7_FILOSOFIA_GUIA_IA.md` con su referencia de nivel corregida.
- **Auditoría transversal final (H1-H4, este cierre)**:
  - **H1**: índice único parcial (`data_requests_one_pending_eliminacion_per_user`, migración `0046`) que garantiza, del lado del servidor, una sola solicitud de eliminación pendiente por persona; reconocimiento explícito del código `23505` en `lib/privacy.js`; defensa de doble clic en el frontend (`ConfirmationModal`'s `confirmDisabled`).
  - **H2**: `process-account-deletions` reconoce con seguridad que una cuenta ya fue eliminada en un ciclo anterior (perfil inexistente) y cierra la trazabilidad sin repetir ningún trabajo destructivo, distinguiendo siempre un fallo real de un cierre parcial ya completado.
  - **H3**: reclamo atómico (`pendiente` → `en_proceso`, reutilizando un estado ya existente desde la Fase 1) que resuelve la carrera entre la cancelación de la persona y el procesamiento por lotes — verificado con concurrencia real de Postgres en ambos sentidos.
  - **H4**: `context.ts` degrada de forma independiente por fuente (lugares/eventos/editorial) en vez de un 500 crudo, con la misma disciplina de degradación honesta ya usada en Memoria de Sesión, Conocimiento Permanente y Afinidad.

### 8. Deuda técnica registrada

**Heredada de fases anteriores, sin cambios** (ver secciones de cierre de Fases 1-6): prueba end-to-end contra un proyecto Supabase real desplegado; `export-user-data`/`process-account-deletions` nunca probadas contra la API de administración de Auth real; existencia del actor semilla "Cuenta eliminada" no confirmada en un entorno real.

**Propia de la Fase 7**:
- **H5**: `data_requests.type = 'exportacion'` nunca tiene ningún camino de escritura en todo el proyecto — la trazabilidad real de una exportación vive en `consent_records`, la variante de flujo de trabajo permanece sin consumidor. Su permanencia o eliminación futura requiere un análisis separado.
- **H8**: `ai_ensure_fresh_conversation()` no tiene bloqueo explícito — dos turnos concurrentes de la misma persona (dos pestañas) que encuentran "sin conversación todavía" pueden intentar ambos crear la fila de estado; la clave primaria evita corrupción, pero el segundo turno puede no persistirse en la Memoria de Sesión (la persona sí recibe su respuesta). Una futura mejora de exclusión mutua o reintento idempotente queda pendiente, sin reabrir el Bloque 2.

### 9. Limitaciones conocidas

- **H9**: la confirmación reforzada de Conocimiento Permanente (`reinforcedConfirmationShown`) es un booleano afirmado por el propio cliente — el backend no puede verificar que la interfaz realmente mostró el segundo diálogo. Salvaguarda deliberadamente ligera, sin riesgo entre personas.
- **H10**: la no repetición de un candidato ya rechazado depende de que El Razonador relea el hilo completo y reconozca su propia mención anterior — instrucción de prompt, nunca una garantía estructural de código.
- **H11**: "Continuar conversación" (Ajustes) navega a la superficie actual donde vive la Guía IA, pero no reabre automáticamente la cápsula — reutiliza el mecanismo de rehidratación ya existente sin crear uno nuevo, a costa de un toque adicional de la persona.
- **H12**: la exclusión de Afinidad en preguntas sobre un negocio ya identificado por nombre (sin `placeId`) depende de una regla de El Razonador, no de una compuerta estructural adicional — la única compuerta de código es `context.type === 'city'`.

### 10. Estado final del sistema al terminar la Fase 7

Los cuatro componentes conceptuales nuevos (Memoria de Sesión, Conocimiento Permanente no-afinidad, El Razonador, La Expresión) están implementados, verificados contra Postgres 16 real (46 migraciones, `0001`-`0046`, reproducidas desde una base limpia), y documentados. El pipeline completo —identidad → Memoria de Sesión → Conocimiento Permanente → contexto → Afinidad condicional → El Razonador → La Expresión → persistencia— funciona como un único sistema coherente, sin ninguna regla de pureza rota y sin ninguna fuga de datos entre personas. Una auditoría transversal final, deliberadamente independiente de las auditorías de cada bloque, encontró cuatro hallazgos operativos reales (H1-H4) y los corrigió antes de este cierre, verificando las correcciones con concurrencia real de Postgres, no solo revisión de código. La documentación canónica (`AI_PHILOSOPHY.md`, `FASE7_FILOSOFIA_GUIA_IA.md`, `FASE7_CONTRATO_ARQUITECTONICO.md`, `MASTERPLAN.md`, `ROADMAP.md`, `supabase/README.md`) describe exactamente el mismo comportamiento que el código real, sin ninguna referencia obsoleta pendiente. **No lista para producción** hasta validar la deuda técnica obligatoria heredada de la Fase 1 (ver punto 8).

### 11. Qué capacidades nuevas posee ahora la Guía IA (respecto al final de la Fase 6)

- **Memoria real dentro de una conversación**: antes de esta fase, cada pregunta a la Guía IA carecía de cualquier continuidad, incluso dentro del mismo intercambio. Ahora retiene lo dicho en la conversación activa, permite retractación explícita, y expira honestamente por inactividad.
- **Conocimiento estable sobre la persona, distinto de la Afinidad**: la Guía IA ahora puede recordar, con consentimiento explícito, una restricción alimentaria, una necesidad de accesibilidad o una preferencia de idioma — información que el Motor de Afinidad nunca tuvo la pretensión de capturar.
- **Razonamiento informado por afinidad real**: El Razonador ahora consulta el perfil de Afinidad ya construido por la Fase 6 como insumo de desempate, con una jerarquía de priorización de ocho niveles que nombra con precisión dónde entra cada fuente de información.
- **Separación tecnológica real, no solo documental**: El Razonador y La Expresión están separados por tipos de TypeScript, no solo por convención — cualquiera de los dos es reemplazable sin tocar el otro ni las tres fuentes de memoria.
- **Transparencia y control completos**: la persona puede ver y corregir, en un solo lugar, su Memoria de Sesión, su Conocimiento Permanente y su Afinidad, y ejercer por primera vez desde la interfaz su derecho a exportar sus datos o solicitar (y cancelar) la eliminación de su cuenta.

### 12. Qué partes de la arquitectura quedan preparadas para futuras fases

- **El patrón de cuatro componentes con reglas de pureza propias** (Memoria pasiva, Conocimiento Permanente con consentimiento en dos capas, Razonador que consulta nunca reconstruye, Expresión que nunca decide contenido) queda como precedente arquitectónico reutilizable para cualquier futura extensión de la Guía IA.
- **La compuerta de consulta bajo demanda de Afinidad** (sin costo de llamada al proveedor de IA cuando no aplica) queda como patrón para cualquier futura fuente de enriquecimiento condicional del pipeline.
- **El catálogo cerrado de categorías de Conocimiento Permanente**, extensible solo por migración deliberada, queda listo para crecer sin ninguna reinterpretación de una categoría existente.
- **La experiencia unificada de privacidad en `SettingsPage`** queda como el único lugar de la aplicación donde cualquier futuro dato personal nuevo debería exponer su propia transparencia/corrección/borrado, en vez de crear una superficie nueva.
- **La Guía IA como Actor del sistema y motor de experiencias** (`AI_PHILOSOPHY.md` §16, visión futura no implementada) sigue intacta y sin fecha asignada — esta fase no la adelantó, y el pipeline de cuatro componentes ya construido es exactamente la base que esa visión necesitará cuando se autorice.
- **La pregunta de si algo dicho en una conversación, con consentimiento explícito y deliberado, podría algún día fortalecer la Afinidad permanente** sigue explícitamente sin resolver, tal como la dejó `FASE7_FILOSOFIA_GUIA_IA.md` — cualquier fase futura que quiera abrir esa puerta deberá hacerlo mediante una interacción estructurada y verificable del Registro de Señales ya existente, nunca por inferencia directa de texto libre.

### 13. Referencias a documentos canónicos

- `FASE7_FILOSOFIA_GUIA_IA.md` — autoridad filosófica de la fase (veintitrés principios).
- `FASE7_CONTRATO_ARQUITECTONICO.md` — arquitectura conceptual (cuatro componentes, reglas de pureza, principio de secuenciación).
- `AI_PHILOSOPHY.md` §9 — jerarquía de priorización de ocho niveles, refinada en el Bloque 4.
- `MASTERPLAN.md` — sección "Fase 7", corregida en este cierre para describir el esquema real.
- `ROADMAP.md` — Fase 7 marcada cerrada en este cierre.
- `supabase/README.md` — descripción de `export-user-data`/`process-account-deletions` sincronizada con el comportamiento real.
- `CHANGELOG.md` — entradas cronológicas de los cinco bloques y de esta auditoría transversal final.
- Este mismo documento (`PROJECT.md`), secciones "FASE 7, BLOQUE 1" a "FASE 7, BLOQUE 5" y "FASE 7 — AUDITORÍA TRANSVERSAL FINAL Y CIERRE" — el detalle técnico completo, bloque por bloque, del que esta sección es el resumen histórico.

### Commits principales de la fase

- `6c08a3a` — filosofía de la Guía IA (documento conceptual, sin código).
- `4325b1d` — contrato arquitectónico conceptual (sin código, sin proveedor de IA).
- `0df5928` — Bloque 1: separar El Razonador de La Expresión en `ai-guide`.
- `5d431dd` — Bloque 2: Memoria de Sesión (migración `0043`).
- `809882d` — Bloque 3: Conocimiento Permanente de la Persona, no-afinidad (migración `0044`).
- `79651c8` — Bloque 3: correcciones de la auditoría final.
- `89709d6` — Bloque 4: conexión de El Razonador con el Motor de Afinidad.
- `783991e` — Bloque 4: sincronización documental (Hallazgo B).
- `4f7495d` — Bloque 5: experiencia unificada de transparencia, corrección y borrado (migración `0045`).
- `3112fc7` — auditoría transversal final: correcciones H1-H4 (migración `0046`), documentación sincronizada.

### Estado final

**FASE 7 CERRADA.** Los cuatro componentes conceptuales (Memoria de Sesión, Conocimiento Permanente no-afinidad, El Razonador, La Expresión) están implementados en cinco bloques técnicos, verificados contra Postgres 16 real, y documentados. Una auditoría transversal final, deliberadamente independiente de las auditorías de cada bloque, confirmó que los cinco bloques funcionan como un único sistema coherente y corrigió cuatro hallazgos operativos reales antes de este cierre — ninguno una contradicción arquitectónica. La documentación canónica de la fase (`FASE7_FILOSOFIA_GUIA_IA.md`, `FASE7_CONTRATO_ARQUITECTONICO.md`, `AI_PHILOSOPHY.md`, `MASTERPLAN.md`, `ROADMAP.md`, `supabase/README.md`) describe exactamente el mismo comportamiento que el código real. **No lista para producción** hasta validar la deuda técnica heredada de la Fase 1, igual que el resto del proyecto.

---

## ETAPA "EL PRODUCTO VIVO" — ADOPCIÓN DEL DOCUMENTO CANÓNICO (2026-07-25)

### 1. Contexto histórico

Inmediatamente después del cierre formal de la Fase 7 (Guía IA v2, ver sección anterior), el Product Owner pausó explícitamente todo desarrollo de funcionalidad nueva y solicitó un análisis estratégico puro sobre cuál debía ser la siguiente gran etapa del proyecto — sin asumir que fuera automáticamente la Fase 8 del `MASTERPLAN.md`. El análisis se desarrolló en dos rondas de profundidad creciente: una primera comparando explícitamente la opción de continuar con el `MASTERPLAN.md` frente a la de abrir una etapa nueva; una segunda, adoptando explícitamente el rol de "Director de Producto y Arquitecto Principal", que releyó de forma crítica `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md` y `ARCHITECTURE.md` completos, evaluó el estado real del proyecto en nueve dimensiones, un ejercicio de "beta mañana", una estimación de escalabilidad en cinco escenarios de tráfico, y una tabla de criterios medibles de madurez.

Ambas rondas concluyeron lo mismo: cada cierre de fase, de la 1 a la 7, repitió la misma deuda — nunca probado contra infraestructura real desplegada, cero contenido real, cero usuarios reales, cero negocios reales. `PRODUCT_MANIFESTO.md` §10, filtro 4, es explícito al respecto — toda funcionalidad que dependa de masa crítica inexistente se pospone — y las Fases 8-13 dependen todas, en distinto grado, de una masa crítica que hoy no existe. El Product Owner aceptó esta conclusión y solicitó, en vez de continuar automáticamente hacia la Fase 8, el diseño de una nueva etapa estratégica dedicada exclusivamente a validar el producto en el mundo real.

### 2. Proceso de maduración del documento

El documento resultante, `ETAPA_PRODUCTO_VIVO.md`, se maduró a través de **cuatro rondas explícitas de revisión del Product Owner** antes de su adopción — el mismo nivel de escrutinio que recibieron `FASE6_FILOSOFIA_DESCUBRIMIENTO.md` y `FASE7_FILOSOFIA_GUIA_IA.md` antes de sus fases respectivas:

- **Primera ronda**: borrador inicial con diagnóstico, principio central, visión, riesgos, objetivos, principios no negociables, estrategia de contenido, economía del producto y criterios de éxito medibles — incluyendo una propuesta de nombre ("Ahorita Vivo en Cuenca") que el Product Owner rechazó por sonar a campaña más que a etapa estratégica.
- **Segunda ronda**: adopción del nombre definitivo **"AHORITA — EL PRODUCTO VIVO"** (por su resonancia directa con `VISION_MAESTRA.md` §1: "un reflejo vivo", "un organismo que respira"), e incorporación de cuatro elementos ausentes: el rol del fundador durante la etapa ("el fundador también forma parte del producto"), la lectura de Ahorita como ecosistema ("la comunidad como sistema"), el tratamiento cualitativo de los primeros usuarios y negocios como "los primeros creyentes", y el principio de que toda funcionalidad debe tener un rostro humano.
- **Tercera ronda**: refuerzo de la tesis central del documento ("¿cómo nace un producto real?"), con la distinción explícita entre construir software y construir un producto, una metodología formal de validación (paralela en rigor a la disciplina de análisis-diseño-implementación-verificación-documentación-cierre de las fases técnicas), el principio de que escuchar al usuario no significa construir lo que pide, y un cierre que sintetiza el momento como el más importante del proyecto hasta ahora.
- **Cuarta ronda (edición final de pulido)**: recuperación explícita de la ciudad como protagonista original de Ahorita — hilo conductor de `VISION_MAESTRA.md` que las rondas anteriores, centradas en fundador/comunidad/usuarios/producto, habían dejado en segundo plano — y una corrección de redacción en la sección "El momento más importante del proyecto" ("las Fases 1-7 construyeron software" pasó a "las Fases 1-7 construyeron la infraestructura necesaria para que un producto pudiera nacer").

### 3. Motivo de su creación

`ETAPA_PRODUCTO_VIVO.md` existe para cerrar la brecha entre "arquitectura verificada técnicamente" y "producto validado en el mundo real" que ninguna de las siete fases anteriores pudo cerrar, por diseño — verificar contra Postgres real, contra un dataset sintético o con Playwright nunca fue, ni podía ser, lo mismo que verificar contra una persona real de Cuenca decidiendo si confía en Ahorita. El documento formaliza esa etapa con la misma rigurosidad metodológica que el proyecto ya exige para el trabajo técnico: objetivos, principios no negociables, una metodología explícita de validación, criterios de éxito medibles, y un veredicto requerido antes de autorizar cualquier fase de crecimiento del `MASTERPLAN.md`.

### 4. Decisión final

El Product Owner aprobó, sin más rondas de revisión, el texto final de `ETAPA_PRODUCTO_VIVO.md` tras su cuarta ronda, y decidió explícitamente que se registrara como **documento canónico independiente** — al mismo nivel jerárquico que `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`/`PRODUCT_STRATEGY.md` y `AI_PHILOSOPHY.md`/`ARCHITECTURE.md` — en vez de como una sección dentro del `MASTERPLAN.md`. Como parte de la integración documental, se verificó la ausencia de contradicciones entre `VISION_MAESTRA.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `MASTERPLAN.md` y `ETAPA_PRODUCTO_VIVO.md`: el único punto que requería aclaración — que la argumentación de "masa crítica inexistente" de `ETAPA_PRODUCTO_VIVO.md` opera sobre un eje distinto al de la matriz de dependencias técnicas del `MASTERPLAN.md`, sin contradecirla — quedó resuelto añadiendo una sección dedicada en `MASTERPLAN.md` que ubica esta etapa explícitamente entre la Fase 7 y la Fase 8, y una condición explícita en su sección "Qué nunca debería empezar antes de otra cosa".

### 5. Referencias a documentos canónicos

- `ETAPA_PRODUCTO_VIVO.md` — documento adoptado, autoridad estratégica de esta etapa.
- `VISION_MAESTRA.md` §1 — fuente del nombre y del hilo conductor de la ciudad como protagonista.
- `PRODUCT_MANIFESTO.md` §10, filtro 4 — argumento central que pospone las Fases 8-13.
- `PRODUCT_STRATEGY.md` §14 — ya anticipaba que el criterio de éxito de cada fase, no solo su orden técnico, debía cambiar respecto al `MASTERPLAN.md` original.
- `MASTERPLAN.md` — nueva sección "Etapa — El Producto Vivo (entre la Fase 7 y la Fase 8)" y condición añadida en "Qué nunca debería empezar antes de otra cosa".
- `CHANGELOG.md` — entrada cronológica de esta adopción.

### Estado final

**"El Producto Vivo" queda adoptado como documento canónico y como la guía estratégica oficial de la etapa que sigue a la Fase 7.** No introduce código, migraciones, ni ningún cambio funcional — es, deliberadamente, estrategia de producto pura. Ninguna fase del `MASTERPLAN.md` a partir de la Fase 8 debe autorizarse hasta que los criterios de éxito medibles de `ETAPA_PRODUCTO_VIVO.md` §20 se cumplan.

---

## BETA READINESS CHECKLIST — REGISTRO COMO INSTRUMENTO OPERATIVO (2026-07-25)

### 1. Contexto histórico

Tras adoptar `ETAPA_PRODUCTO_VIVO.md`, el Product Owner propuso continuar con lo que inicialmente llamó "Fase 8", redefiniendo su propósito: no agregar funcionalidad (Historias/video, la Fase 8 real de `MASTERPLAN.md`), sino preparar técnicamente a Ahorita para recibir personas y negocios reales. El análisis conceptual identificó dos problemas antes de aceptar ese marco: (a) la decisión se tomaba sin evidencia de campo, contradiciendo lo recién acordado sobre dejar que la realidad marque la agenda; (b) el nombre "Fase 8" ya está ocupado por Historias/video en `MASTERPLAN.md` — llamar "Fase 8" a esto habría creado una contradicción documental. Se resolvió tratar el trabajo como lo que `ETAPA_PRODUCTO_VIVO.md` §26 ya anticipaba como posible continuación: un plan operativo, subordinado a esa etapa, no una fase técnica nueva.

### 2. De "Plan Operativo" a "checklist operativa"

Antes de dar forma a ese plan operativo, se sometió la propia decisión de crear un documento nuevo al mismo estándar de evidencia que rige esta etapa: ¿hace falta un documento canónico con filosofía y contrato, o basta una checklist viva? El análisis concluyó que un documento de ese peso repetiría exactamente el patrón que `ETAPA_PRODUCTO_VIVO.md` fue creado para romper — más documentación antes de tocar la realidad —, porque ninguno de los puntos identificados introduce una decisión conceptual nueva sobre el modelo Actor/Publicación/Interacción; todos son verificación de algo ya construido o configuración operativa mínima. Se adoptó el formato de checklist con criterio de verificación objetivo por ítem, sin filosofía ni contrato propios.

### 3. Construcción y rondas de revisión crítica

La checklist se construyó en dos rondas:

- **Primera ronda**: 17 ítems agrupados por bloqueante/diferible, cubriendo infraestructura desplegada, identidad y seguridad de datos, la Guía IA con costo real, privacidad y mínimo legal, resiliencia operativa, y un ciclo completo con un negocio real.
- **Segunda ronda (10 ajustes del Product Owner)**: reorganización en tres momentos temporales (A: antes de la primera persona real: antes de admitir, B: primera semana de beta, C: antes de ampliar el piloto); matriz de RLS reproducible contra JWT reales en vez de una afirmación general; restauración de respaldo en entorno aislado con RPO/RTO; correo transaccional de producción; plan de reversión del despliegue; recorrido completo de una persona real; instrumentación mínima de aprendizaje; canal de soporte probado; inventario de semillas operativas; y pruebas ampliadas de PWA/caché.

Una tercera ronda evaluó críticamente tres posibles incorporaciones adicionales (gestión moderna de identidad, infraestructura de notificaciones push, distribución en tiendas de aplicaciones) contra `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md`, `ETAPA_PRODUCTO_VIVO.md` y `MASTERPLAN.md`, sin apelar a costumbre. Resultado: se incorporó la verificación de notificaciones push transaccionales (nuevo ítem A16-bis, funcionalidad ya construida desde la Fase 0, nunca probada en producción) y se amplió el ítem A5 para verificar cambio de dispositivo sin pérdida de información (consecuencia natural de una arquitectura ya centrada en el servidor, no funcionalidad nueva). Quedaron explícitamente fuera, por ausencia de evidencia de necesidad —no por genericidad—: inicio de sesión con Google/Apple, cambio de contraseña/correo desde la interfaz, y distribución mediante Google Play/TestFlight.

### 4. Decisión final

El Product Owner aprobó el contenido consolidado y solicitó su registro como archivo del proyecto, con la condición explícita de que no se convirtiera en documento canónico. Antes de escribirlo se verificó la ausencia de contradicciones con `MASTERPLAN.md`, `PRODUCT_MANIFESTO.md`, `PRODUCT_STRATEGY.md` y `ETAPA_PRODUCTO_VIVO.md` — ninguna encontrada, porque la checklist no introduce ninguna decisión conceptual nueva ni ocupa ningún número de fase.

### 5. Referencias a documentos canónicos

- `BETA_READINESS_CHECKLIST.md` — archivo creado, checklist operativa viva.
- `ETAPA_PRODUCTO_VIVO.md` §26 — autoridad de la que esta checklist es subordinada directa.
- `PRODUCT_MANIFESTO.md` §10 — filtros usados para evaluar y excluir las tres incorporaciones potenciales de la tercera ronda.
- `MASTERPLAN.md` — no requiere modificación; la checklist no ocupa ningún número de fase, y la sección "Etapa — El Producto Vivo" ya referencia a `ETAPA_PRODUCTO_VIVO.md` como su autoridad.
- `CHANGELOG.md` — entrada cronológica de este registro.

### Estado final

**La Beta Readiness Checklist queda registrada como instrumento operativo vivo, subordinada a `ETAPA_PRODUCTO_VIVO.md`, sin autoridad conceptual propia.** Todos sus ítems inician en estado Pendiente. Se actualiza directamente en `BETA_READINESS_CHECKLIST.md` conforme cada ítem se verifica con evidencia real.

---

## A1 CERRADO — Infraestructura Supabase de producción operativa (2026-07-29)

Primer ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado con evidencia real contra el proyecto de producción `ahorita-production` (Supabase, South America / São Paulo, plan Free — con el paso a Pro registrado como condición obligatoria antes de A21/A22).

### 1. Hallazgo previo al primer despliegue: `0040` bloqueaba una aplicación desde cero

Antes de ejecutar el primer `db push` real, se auditó el procedimiento de aplicar las 46 migraciones completas contra un proyecto recién creado, sin ningún dato todavía. Se encontró que `0040_fase6_bloque3_motor_editorial.sql` incluía, en la misma transacción que su DDL, un backfill de `events.editor_pick → editorial_selections` que exigía un administrador ya existente (`raise exception` explícito si no lo encontraba) — dependencia de un dato operativo dentro de una migración de esquema que impedía aplicar las 46 migraciones deterministas contra una base de datos vacía sin intervención manual previa. El defecto no era hipotético: al no existir todavía ningún administrador en un proyecto nuevo, un `db push --include-all` completo habría abortado exactamente en `0040`, bloqueando también `0041`-`0046`.

**Diagnóstico arquitectónico.** Se evaluó si esto era un smell real (sí: rompe la propiedad de que el conjunto de migraciones sea reproducible contra cualquier entorno nuevo sin intervención externa — la misma propiedad que exige A14, restauración de respaldo en entorno aislado, y cualquier futuro pipeline de CI) y si el bootstrap de datos operativos debía vivir separado del DDL (sí — mismo patrón ya establecido por `bootstrap_admin.sql`, que deliberadamente vive fuera de `supabase/migrations/`).

**Auditoría de impacto antes de tocar nada:** se verificó, contra el código real de las 46 migraciones, que (a) ninguna migración posterior (`0041`-`0046`) depende de que las filas del backfill existan durante la propia secuencia de aplicación — solo de que la tabla y las funciones de `0040` existan; (b) ningún archivo de prueba ni RPC del frontend presupone un mínimo de filas en `editorial_selections`; (c) `0040` era el único bloqueo de este tipo en las 46 migraciones — se revisaron todos los `raise exception` y todos los bloques `do $$` de nivel superior del historial completo, sin encontrar ningún otro caso.

### 2. Corrección aplicada, antes del primer despliegue remoto

Se separó `0040` en DDL puro (tabla `editorial_selections`, triggers, RLS, y las cuatro funciones `set_editorial_selection()`/`revoke_editorial_selection()`/`editorial_selection_public()`/`candidatos_editorial()`) y se extrajo el backfill hacia una nueva herramienta operativa, `supabase/scripts/backfill_editorial_selections.sql` (mismo patrón que `bootstrap_admin.sql`: idempotente vía `on conflict do nothing`, sin parámetros, con `raise notice` reportando exactamente qué filas procesó, fallo explícito solo si no existe ningún administrador — sin introducir ninguna comprobación de "más de un administrador" que no existiera en el algoritmo original, para no cambiar semántica donde nunca hubo ninguna). El comentario de `events.editor_pick` se ajustó para no afirmar que el contenido ya estaba migrado en el momento de aplicar la migración.

**Es la única de las 46 migraciones corregida reabriendo su propio archivo en vez de hacia adelante** (convención seguida sin excepción en el resto del historial — ver `0031`, `0036`, `0039` en `supabase/README.md`). Se justifica porque (a) el proyecto remoto seguía completamente vacío — `supabase migration list` confirmó 0 de 46 aplicadas antes de esta corrección — y (b) este defecto aborta la aplicación completa antes de que cualquier migración posterior pueda alcanzarse, haciendo estructuralmente inviable una corrección hacia adelante (a diferencia de los hallazgos de `0031`/`0039`, que sí podían corregirse sin reabrir la migración original).

**Prueba de equivalencia funcional**, exigida antes de aprobar el diff: se comparó el estado final de aplicar el diseño original (backfill dentro de `0040`) contra el corregido (DDL puro + `backfill_editorial_selections.sql` posterior) en tablas, funciones, triggers, políticas RLS, grants, comentarios, datos creados/modificados, comportamiento observable del frontend/`AdminEventEditorPage`, y las RPC del feed. Única diferencia real, aceptada conscientemente: la atomicidad — antes, DDL y backfill se garantizaban juntos por la propia transacción de la migración; después, el DDL es determinista y el backfill queda como paso operativo posterior, cuya ejecución se verifica formalmente (ver §4) en vez de darse por descontada.

Commit `246de51` en `claude/esto-tengo-2wzbnj`: `supabase/migrations/0040_fase6_bloque3_motor_editorial.sql` (modificado) y `supabase/scripts/backfill_editorial_selections.sql` (nuevo).

### 3. Primer despliegue real contra `ahorita-production`

- `npx supabase@2.109.1 db push --include-all --dry-run`: confirmó las 46 migraciones detectadas y ordenadas (`0001`-`0046`) contra el proyecto real, sin ejecutar SQL — insuficiente por sí solo para probar la corrección, porque el defecto original era una excepción en tiempo de ejecución, no un error estático.
- `npx supabase@2.109.1 db push --include-all` (real, sin `--dry-run`): las 46 migraciones se aplicaron sin ningún `ERROR`, incluida `0040` ya corregida. Salida completa conservada en `db_push_output.txt`.
- `npx supabase@2.109.1 migration list`: las 46 versiones confirmadas en las columnas Local y Remote. Salida conservada en `migration_list_post_push.txt`.
- Verificación estructural: `select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname in ('set_editorial_selection','revoke_editorial_selection','editorial_selection_public','candidatos_editorial')` devolvió exactamente las 4 filas esperadas, confirmando el DDL del Motor Editorial completamente instalado.

### 4. Bootstrap del administrador y backfill editorial, contra producción real

- Cuenta Auth real creada vía dashboard (Authentication → Users, con confirmación automática — el correo transaccional, A16, todavía no está configurado). Disparador de creación de `profiles` verificado: exactamente una fila para el nuevo `id`.
- `bootstrap_admin.sql` ejecutado con ese `id` real. Verificado por consulta: exactamente un administrador (`is_admin = true`), sin modificación manual de `profiles`.
- `backfill_editorial_selections.sql` ejecutado: 3 eventos migrados (Feria Gastronómica de Calle Larga, Festival de las Flores, Noche de Jazz en el Barranco) en la primera ejecución; 0 eventos migrados en una segunda ejecución inmediata, con el conteo final permaneciendo en exactamente 3 filas — idempotencia confirmada por prueba real, no solo por lectura del código.
- Verificaciones de datos, todas contra `ahorita-production` real: conteo exacto de 3 filas activas; las 3 con `target_type = 'event'`; `decided_by` coincide en las 3 con el único administrador sembrado; sin duplicados por `(target_type, target_id)`.
- **Hallazgo verificado durante esta ronda, no un defecto:** `candidatos_editorial(null, null, null)` devolvió solo 2 de las 3 selecciones. Se obtuvo la definición real de la función (`pg_get_functiondef`) y se determinó la causa exacta: la condición `coalesce(e.end_at, e.start_at) >= now()` dentro del CTE `editorial_eligible` (no `es.ends_at`, que pertenece a la ventana de vigencia de la propia selección editorial y que el backfill deja en `NULL` para las tres filas por igual) excluye a "Feria Gastronómica de Calle Larga" porque su `end_at` ya había pasado al momento de la consulta — comportamiento correcto de vigencia del evento, confirmado leyendo la definición real de la función, no inferido de los datos.

### 5. Condición permanente para el futuro

El backfill del Motor Editorial ya no es automático dentro de las migraciones. Cualquier aplicación futura desde cero (restauración de respaldo — A14 —, un entorno de CI, o un proyecto nuevo) debe ejecutar, en orden, después de `db push --include-all`: (1) crear la cuenta Auth real del administrador, (2) `bootstrap_admin.sql`, (3) `backfill_editorial_selections.sql`. Registrado como nota permanente en `BETA_READINESS_CHECKLIST.md` (bajo la tabla de la sección A) y en `supabase/README.md`.

### Referencias

- `supabase/migrations/0040_fase6_bloque3_motor_editorial.sql` — corregida, commit `246de51`.
- `supabase/scripts/backfill_editorial_selections.sql` — nueva, commit `246de51`.
- `supabase/README.md` — addendum de corrección preproducción junto a la entrada de `0040`; nueva sección "Sembrar el primer administrador y el backfill del Motor Editorial".
- `BETA_READINESS_CHECKLIST.md` — ítem A1 marcado Hecho; nota de corrección preproducción bajo la tabla de la sección A.
- `CHANGELOG.md` — entrada cronológica de este cierre.

### Estado final

**A1 queda Hecho**, con evidencia real conservada (`db_push_output.txt`, `migration_list_post_push.txt`, resultados de las 7 consultas de verificación del Motor Editorial). Ninguna otra migración de las 46 requirió corrección. El proyecto `ahorita-production` tiene ahora el esquema completo de las 46 migraciones, un administrador único, y las 3 selecciones editoriales legacy migradas correctamente.

---

## A2 — preparación local (en progreso, 2026-07-29)

**A2 sigue Pendiente — esta entrada documenta únicamente el primer paso local autorizado, no un cierre.** Ningún despliegue, configuración de Vercel ni configuración de Supabase Auth ha ocurrido todavía.

### Diagnóstico previo (verificado contra el código y un build real)

Sin ningún despliegue existente del frontend (sin `netlify.toml`/`vercel.json`/workflows previos), se auditó el estado real de la PWA: `vite-plugin-pwa` (estrategia `injectManifest`, `src/sw.js`) registra el service worker correctamente en el build generado (`dist/registerSW.js`, confirmado ejecutando `npm run build` localmente) — pero **no contiene `skipWaiting()` ni `clientsClaim()`**, y no existe ningún mecanismo que comunique al usuario que hay una versión nueva disponible. Se buscó en todo `src/` cualquier uso de `localStorage`/`sessionStorage`/`indexedDB`/Cache Storage: solo `AuthContext.jsx` lo usa (flag de invitado en `sessionStorage`, token de sesión de `supabase-js` en `localStorage`, ambos limpiados por `signOut()`) — sin persistencia adicional de datos privados encontrada. Ninguna de estas observaciones se trata todavía como conclusión definitiva: las pruebas reales de actualización, offline y logout, ejecutadas contra la app ya desplegada, son las que determinarán si hace falta algún cambio de código — no la sola lectura del código.

### Decisiones tomadas antes de implementar

1. **Hosting:** Vercel.
2. **Dominio:** subdominio gratuito `*.vercel.app` por ahora; sin dominio propio todavía.
3. **Rama de producción en Vercel:** `claude/esto-tengo-2wzbnj`, usada **de forma explícitamente temporal** únicamente para completar A2 — el repositorio migrará más adelante a una rama `main` estándar para producción, lo cual exigirá reconfigurar Vercel en su momento. No es una decisión permanente.
4. **Entornos Preview:** **deliberadamente no conectados a `ahorita-production`.** No se crea todavía un proyecto Supabase de staging. Preview queda sin credenciales reales configuradas hasta que exista una estrategia de staging específica — es una decisión consciente, no una omisión.
5. **Fallback SPA:** verificado contra la documentación oficial de Vercel (con la salvedad de que el acceso directo a `vercel.com/docs` fue bloqueado en este entorno, y la verificación se apoyó en el resumen de búsqueda que cita esas páginas, más varios reportes independientes de la comunidad) — la detección automática del framework Vite **no** incluye el fallback SPA para React Router; es una configuración explícita necesaria. Se agrega `vercel.json` desde el inicio.
6. **Bundle (~858 kB, medido con un build real):** registrado únicamente como hallazgo técnico diferido. No forma parte de los criterios de A2 y no se optimiza en este hito — queda como trabajo independiente futuro.

### Cambio realizado en este paso

- `vercel.json` (nuevo, en la raíz del repositorio): rewrite de fallback SPA hacia `index.html`.

### Explícitamente no realizado todavía

Ningún commit, push, creación de proyecto en Vercel, configuración de variables de entorno, configuración de dominio, despliegue, cambio en Supabase Auth, ni cambio en `src/sw.js` o en el código de la aplicación (sin `skipWaiting`, `clientsClaim` ni lógica offline agregada). Todo eso requiere autorización expresa y separada.

---

## A2 CERRADO — Frontend desplegado, PWA validada (2026-08-07)

Segundo ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado con evidencia real, en escritorio y en un Android real, contra el frontend desplegado en producción.

### 1. Despliegue en Vercel

Proyecto creado e importado desde `pedrodelgados/Ahorita`, Framework Preset Vite (autodetectado), Production Branch fijada explícitamente en `claude/esto-tengo-2wzbnj` (única rama existente en `origin`; el repositorio migrará más adelante a una rama `main` estándar, lo que exigirá reconfigurar Vercel en su momento — no es una decisión permanente). Dominio de producción: `https://ahorita-five.vercel.app`, sobre HTTPS. Variables de entorno de Production: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (valores reales de `ahorita-production`); `VITE_VAPID_PUBLIC_KEY` deliberadamente ausente (pertenece a A16-bis, no a A2 — `src/lib/push.js` tolera su ausencia de forma controlada, confirmado con un build local). Entornos Preview deliberadamente sin credenciales reales, hasta que exista una estrategia de staging específica.

### 2. PWA — manifest, service worker, fallback SPA

`vite-plugin-pwa` (`strategies: 'injectManifest'`, `registerType: 'autoUpdate'`) confirmado registrando el service worker en el build real (`dist/registerSW.js` inyectado automáticamente en `dist/index.html`). Manifest cargando correctamente (nombre "Ahorita", `display: standalone`, iconos). PWA instalable y verificada como instalada, en escritorio y en Android real (ícono propio, ventana/app independiente).

Fallback SPA (`vercel.json`, `rewrites` hacia `index.html`) confirmado necesario contra la documentación oficial de Vercel para Vite + React Router (con la salvedad de que el acceso directo a `vercel.com/docs` estuvo bloqueado en el entorno de esta sesión; la verificación se apoyó en el resumen de búsqueda que cita esas páginas, más varios reportes independientes de la comunidad). Verificado en producción real: navegación directa a `/explorar` y refrescos repetidos, sin ningún 404.

### 3. Defecto real encontrado: `ReferenceError: supabase is not defined`

Durante la primera prueba real del frontend desplegado, la pantalla de Inicio (ruta `/`) quedaba colgada indefinidamente en el esqueleto de carga. Causa raíz: `src/lib/feed.js` llamaba `supabase.rpc("compose_feed", ...)` sin importar el cliente `supabase` — único archivo de los 15 en `src/lib/` con esa omisión (todos los demás sí lo importan desde `./supabaseClient`). No detectado por `oxlint` (sin regla de variable no definida entre módulos) ni por el build (JS plano, sin verificación de referencias en tiempo de compilación) — solo se manifestaba en tiempo de ejecución real, en el navegador. `FeedPage.jsx` no tenía `.catch()` en la promesa de `getComposedFeed()`, por lo que el rechazo quedaba sin capturar y `setLoading(false)` nunca se ejecutaba (hallazgo relacionado, registrado pero no corregido en este commit — queda como tarea independiente).

**Corregido** con una sola línea: `import { supabase } from "./supabaseClient";`. Commit `45dd146d12ed053ee76c18c9db60897b527ba92d`. Verificado en producción: el error desapareció, el feed dejó de colgarse y mostró correctamente "Todavía no hay eventos aquí".

### 4. Investigación del feed vacío — no fue un defecto

No se asumió que el feed vacío fuera otro bug. Se consultó `ahorita-production` en vivo (vía `psql`, Session Pooler): `now()` real del servidor `2026-08-07 17:50:23.485503+00`. Los 5 eventos de `0012_seed_events.sql` (fechas generadas como `now() + interval` en el momento del `db push` real, ~2026-07-27) tenían todos `coalesce(end_at, start_at) >= now() = false` — el más lejano ("Carrera 10K Río Tomebamba") había terminado el 2026-08-05. Conclusión: "Todavía no hay eventos aquí" era el comportamiento correcto dado que los datos de demostración ya habían vencido — no un defecto de `compose_feed()`, RLS, `candidatos_editorial()` ni del frontend. No se modificó `compose_feed()` ni los seeds por este motivo.

### 5. Recuperación tras pérdida de conexión

**Escritorio** (DevTools → Network → Offline, simulado): el shell de la PWA permaneció disponible, Inicio quedó cargando (depende de datos remotos de Supabase), la app no colapsó; al volver a "No throttling", recuperación correcta.

**Android real** (pérdida real de conectividad, no simulada): la app no se cerró, navegación básica siguió disponible, Perfil pudo quedar en blanco inicialmente o mostrar "No tienes conexión" al refrescar; al restablecer Internet, recuperación completa.

**Limitación explícita:** Ahorita conserva el shell de la PWA sin conexión, pero las vistas que dependen de datos remotos requieren conectividad real — no hay caché de respuestas de Supabase (`src/sw.js` solo precachea assets estáticos, sin ninguna ruta de runtime caching registrada). No se afirma funcionamiento offline completo.

### 6. Defecto real encontrado: service worker nuevo quedaba en `waiting` indefinidamente

Con un marcador visual temporal ("Ahorita — A2 update test", commit `84ce1a1565c807b4562c072419ae7100849b2ebc`) se ejecutó la primera prueba real de actualización en escritorio. DevTools mostró el worker viejo `activated and is running` junto al worker nuevo `waiting to activate` — el deployment nuevo estaba correctamente en Production/Current, así que el problema no era Vercel. Causa raíz: `src/sw.js` no llamaba `self.skipWaiting()` ni `clientsClaim()`, requeridos por la documentación de `vite-plugin-pwa` para `injectManifest` + `registerType: 'autoUpdate'`.

**Corregido** agregando ambas llamadas y declarando `workbox-core ^7.4.1` como `devDependency` directa (antes solo transitiva vía `workbox-precaching`/`workbox-build`). Commit `c030d93728618ed1cb9fd972142f5b8a59070e94`. Confirmado en el artefacto real (`dist/sw.js`) que ambas llamadas quedaron presentes antes de desplegar.

### 7. Actualización sin romper sesión — verificado en escritorio

Repetida la prueba real: el worker nuevo pasó a `activated and is running` sin quedar ningún otro en `waiting`; la PWA instalada recibió "Ahorita — A2 update test"; la sesión de Supabase permaneció iniciada; navegación normal. Retirado el marcador (commit `07a3404e143a8d92b8a848708e5818f8bdfd171f`); confirmado que la actualización de reversión también llegó limpia, con la sesión intacta.

### 8. Invalidación de caché — verificado en escritorio con inspección forense directa

DevTools → Application → Cache Storage (`workbox-precache...`): un único bundle JS principal vigente (`/assets/index-xBqFqrTs.js`) y su CSS correspondiente, 12 entradas totales, sin ningún `index-XXXXXXXX.js` antiguo coexistiendo. Service Workers: un único worker `activated and is running`, cero en `waiting`. Confirma que la renovación de caché no dejó versiones mezcladas.

### 9. Logout y datos residuales — verificado en escritorio con inspección forense directa

Antes del logout: `Local Storage` contenía `sb-...-auth-token` (sin exponer su contenido). Tras el botón normal "Cerrar sesión": esa clave desapareció por completo. `Session Storage`: vacío. `IndexedDB`: ninguna base de datos detectada. `Cache Storage`: permaneció `workbox-precache...` — correcto, son assets públicos de la app, nunca datos de sesión. La app regresó correctamente a `/login`.

### 10. Android real — recorrido completo

- **Instalación:** PWA instalada desde el navegador, abierta desde su propio ícono, funcionando como app independiente, navegación normal.
- **Sesión:** inicio de sesión correcto, uso normal de la app.
- **Pérdida/recuperación de conexión:** ver punto 5.
- **Logout:** cierre de sesión mediante el flujo normal, regreso correcto a login; tras cerrar Ahorita por completo desde apps recientes y reabrirla desde el ícono, permaneció deslogueada — sin reautenticación silenciosa.
- **Actualización sin romper sesión:** con la PWA instalada y sesión iniciada, marcador temporal "Ahorita — Android update test" (commit `218ed82933bf1b68d9daaef146e231b2959d5fa3`) recibido correctamente tras el deployment automático, sesión preservada, navegación normal. Retirado el marcador (commit `9c4491842ff43a31742c23cccd0f636e111f1b95`); la reversión también se recibió correctamente, sesión intacta.

**Dos matices metodológicos explícitos, no ocultos:** en Android, la invalidación de caché y la ausencia de datos residuales tras logout se verificaron de forma **funcional/de comportamiento** (dos actualizaciones consecutivas correctas sin ningún síntoma de mezcla de versiones; sesión no restaurada tras cierre completo y reapertura), **no mediante inspección forense directa** de Cache Storage (no se usó `chrome://inspect`/depuración remota vía USB). Se consideró razonablemente suficiente porque es exactamente el mismo código (`sw.js`, Workbox, adaptador de almacenamiento de `supabase-js`) ya verificado de forma forense en escritorio, corriendo sobre el mismo motor Chromium en ambas plataformas — pero se deja escrito con precisión qué se verificó y cómo, sin inventar una inspección que no ocurrió.

### Commits relevantes

- `539a54f` — `vercel.json` + notas de preparación local de A2.
- `45dd146` — fix: import de `supabase` faltante en `feed.js`.
- `84ce1a1` — marcador de prueba de actualización (escritorio).
- `c030d93` — fix: `skipWaiting()` + `clientsClaim()` + `workbox-core` como devDependency.
- `07a3404` — retiro del marcador (escritorio).
- `218ed82` — marcador de prueba de actualización (Android).
- `9c44918` — retiro del marcador (Android).

### Estado final

**A2 queda Hecho.** Las seis cláusulas del criterio verificadas con evidencia real: instalable sobre HTTPS (ambos dispositivos), actualización sin romper sesión (ambos dispositivos), invalidación de caché correcta (forense en escritorio, funcional en Android — matiz documentado arriba), recuperación tras pérdida de conexión (ambos dispositivos, con la limitación offline explícita), cierre de sesión sin datos residuales visibles (forense en escritorio, funcional en Android — mismo matiz), probado en un Android real y un navegador de escritorio. Dos defectos reales encontrados durante la validación y corregidos (`feed.js`, `sw.js`) — ninguno relacionado con Supabase, migraciones ni infraestructura de A1.

---

## A3 CERRADO — Secretos y credenciales de producción propios y separados de desarrollo (2026-08-09)

Tercer ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado, bajo el alcance aclarado en el commit `2b25b75` (higiene y separación de secretos de los componentes **ya desplegados** en producción — frontend en Vercel y base de datos `ahorita-production` — sin exigir el despliegue anticipado de las Edge Functions de A8/A9/A10/A11/A16-bis).

### 1. Objetivo y alcance

Confirmar que ninguna credencial, secreto o valor conocido de desarrollo/pruebas quedó activo o embebido en producción, y que las credenciales que sí están en producción son exclusivamente de producción — verificado tanto en la configuración del entorno como en el artefacto real desplegado, desde un dispositivo fuera de la red de desarrollo. Explícitamente fuera de alcance: el despliegue funcional de `ai-guide`, `send-push`, `export-user-data`, `process-account-deletions` y `process-verification-lifecycle`, que se verifica bajo A8/A9, A16-bis, A10 y A11 respectivamente — ninguna de las 5 ha sido desplegada todavía contra `ahorita-production`, y A3 no lo exige.

### 2. Inventario de variables consumidas por el cliente

Grep exhaustivo de `import.meta.env` en todo `src/` encontró únicamente 3 usos: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (`src/lib/supabaseClient.js`), y `VITE_VAPID_PUBLIC_KEY` (`src/lib/push.js`, deliberadamente ausente en Production, pertenece a A16-bis). Las tres están diseñadas para ser públicas por su propio proveedor (URL/anon key de Supabase protegida por RLS; clave pública VAPID pensada para viajar al navegador vía `applicationServerKey`) — su presencia en el bundle no es, por sí misma, un hallazgo de seguridad. `vite.config.js` no contiene ningún bloque `define` que exponga variables adicionales al cliente más allá de la convención estándar `VITE_*` de Vite.

### 3. Separación frontend/servidor

Los secretos previstos para las Edge Functions (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`) no aparecen consumidos mediante `import.meta.env` en ningún punto del frontend — viven exclusivamente como `Deno.env.get(...)` dentro de `supabase/functions/*`. Esta observación no implica que esas funciones ya estén desplegadas o configuradas en producción (no lo están, ver A1 y el diagnóstico de A3) — solo que el código del cliente nunca podría exponerlas aunque lo estuvieran, por diseño de Vite.

### 4. Resultado del grep sobre el repositorio completo

Búsqueda exhaustiva (excluyendo `node_modules`/`dist`) de JWTs, `service_role`, `SUPABASE_SERVICE_ROLE`, `localhost`/`127.0.0.1`, dominios `.supabase.co` hardcodeados, y asignaciones literales de `password`/`api_key`/`secret`/`token`: sin hallazgos de secretos, tokens ni credenciales hardcodeadas en código. Las únicas coincidencias de `localhost`/`127.0.0.1` están en `PROJECT.md` (prosa histórica de entornos de desarrollo anteriores) y en el propio texto del criterio de A16 — ninguna es configuración activa.

### 5. Estado de `.env` y del historial de git

`.env` está en `.gitignore`. `git log --all --full-history -- .env` confirmó que nunca fue commiteado a este repositorio, en ninguna rama.

### 6. Evidencia real de producción — Network

Verificado directamente en `https://ahorita-five.vercel.app` (DevTools → Network): el frontend desplegado realiza peticiones REST reales contra `itbycfshmvxp....supabase.co/rest/v1/...`, con respuestas `200 OK`. Confirma que el frontend real está conectado a un proyecto Supabase real — no al `127.0.0.1` usado en desarrollo local.

### 7. Project ref y verificación de `ahorita-production`

El project ref visible en las peticiones reales (`itbycfshmvxp...`) coincide exactamente con el project ref mostrado en la URL del dashboard del proyecto llamado `ahorita-production` en Supabase. Confirma que la aplicación desplegada está comunicándose con el proyecto de producción correcto, no con un proyecto de pruebas o abandonado.

### 8. Vercel Production

`Project Settings → Environment Variables` de Vercel contiene únicamente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables de proyecto relevantes, ambas asignadas específicamente al scope **Production** — ninguna variable adicional ni residual encontrada. Consistente con la configuración documentada en el cierre de A2.

### 9. Legacy anon/public vs service_role/secret

En `Supabase → Settings → API Keys → Legacy anon, service_role API keys`, el proyecto `ahorita-production` muestra dos claves clasificadas oficialmente por Supabase: una como `anon`/`public` (apta para navegador, con su seguridad dependiente de RLS/policies) y otra, separada, como `service_role`/`secret`. La segunda permaneció oculta — no fue revelada ni copiada en ningún momento. Al abrir "Edit" sobre `VITE_SUPABASE_ANON_KEY` en Vercel, el valor mostrado comenzaba con `eyJhbGci...`, formato JWT legacy consistente con el formato de la clave `anon`/`public` de Supabase. Aclaración explícita: Supabase también expone una nueva `sb_publishable_...` key; la aplicación usa hoy la JWT legacy `anon`, y migrar a la nueva Publishable key no es parte de este cierre ni se realizó en esta ronda.

### 10. Limitación metodológica, documentada con honestidad

No se realizó una comparación byte por byte entre la JWT configurada en Vercel y la anon key mostrada en el dashboard de Supabase, ni se decodificó su payload para confirmar explícitamente el claim `role`/`ref` — deliberadamente, para no manipular ni exponer innecesariamente la credencial completa. La conclusión de cierre se apoya en evidencia convergente e independiente: peticiones reales exitosas (`200 OK`) desde el frontend desplegado contra el project ref correcto de `ahorita-production`, combinadas con la evidencia independiente de Vercel, Supabase y el repositorio (nomenclatura y clasificación coincidentes en las tres superficies) — no en una verificación criptográfica exhaustiva del valor exacto.

### Explícitamente fuera de alcance de este cierre

El despliegue y la validación funcional de `ai-guide`, `send-push`, `export-user-data`, `process-account-deletions` y `process-verification-lifecycle` contra `ahorita-production`, incluida la configuración de `ANTHROPIC_API_KEY`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` y `CRON_SECRET` — pertenecen a A8, A9, A10, A11 y A16-bis respectivamente, y ninguno se dio por resuelto ni se inició en esta ronda.

### Estado final

**A3 queda Hecho.** Sin evidencia de ninguna credencial de desarrollo/pruebas activa o embebida en producción; credenciales de producción confirmadas como propias de `ahorita-production` mediante evidencia real convergente (Network, dashboard de Supabase, configuración de Vercel), con una limitación metodológica documentada explícitamente, no oculta.

---

## A4 CERRADO — Buckets de Storage reales con políticas RLS (2026-08-09)

Cuarto ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado, con alcance estrictamente ceñido a su texto literal (subir/leer un archivo real; un archivo privado de evidencia permanece inaccesible públicamente) — sin ampliarlo hacia la matriz completa de permisos (A6) ni el ciclo real de verificación con negocio reclutado (A21).

**Bucket `media`** (público): subida real autenticada desde `/admin/eventos/nuevo` sin guardar el evento (evitando crear datos de prueba en `events`), lectura pública real sin sesión, y un intento de subida sin autenticación rechazado explícitamente por RLS (cuerpo de respuesta: `statusCode 403`, `error: Unauthorized`, `message: "new row violates row-level security policy"`, `code: AccessDenied`). Objeto de prueba eliminado; su URL dejó de responder tras la limpieza.

**Bucket `verification_evidence`** (privado): se evitó deliberadamente crear cualquier fila nueva en `public` (sin usuario Auth, `profiles`, `actors`, `businesses` ni `verifications` de prueba) — un objeto se subió directamente vía Dashboard de Supabase (que no pasa por la política `insert` de `storage.objects`, mismo mecanismo ya usado para eliminar objetos de `media` sin política `delete`), y su existencia se confirmó visualmente antes de la prueba. Una petición sin sesión, contra el endpoint privado de descarga (no el endpoint público, inaplicable a un bucket con `public=false`), no recuperó el objeto: `statusCode 404`, `error: not_found`, `message: "Object not found"`, `code: NoSuchKey`.

**Análisis honesto de `NoSuchKey`**: ese cuerpo no menciona RLS explícitamente. `supabase.com/docs` no fue accesible desde este entorno (misma restricción de red ya documentada en A3); como fuente oficial alternativa se consultaron el repositorio y el foro de discusión propios de la organización `supabase` en GitHub, donde está reportado que Supabase Storage responde con `400`/tipo genérico (en vez de un `403`/`AccessDenied` explícito) cuando una política RLS deniega una descarga privada, y que ese comportamiento enmascara deliberadamente la denegación como "objeto no encontrado" para no confirmar la existencia de archivos a quien no tiene permiso (`github.com/supabase/storage` issue #640; `github.com/orgs/supabase/discussions` #20366 — caso casi idéntico: mismo archivo, accesible con permiso público, "not found" al restringir por RLS). La conclusión de cierre se apoya en la comparación controlada — el objeto existía momentos antes en la misma ruta exacta, confirmado independientemente en el Dashboard, y dejó de ser recuperable únicamente al cambiar el contexto de autorización de la petición — no en una frase literal de error que la respuesta no contenía.

**Limpieza**: el objeto de `verification_evidence/probe-a4/` fue eliminado vía Dashboard; la carpeta quedó vacía. Ninguna fila de base de datos fue creada ni requirió eliminarse. Ninguna política, configuración de bucket, RLS, código ni infraestructura fue modificada durante esta verificación.

**Hallazgo de hardening registrado, no corregido en esta ronda**: el Dashboard de Supabase advirtió que la política `select` de `media` ("Media es pública para lectura") permite listar/enumerar objetos del bucket, no solo leerlos por ruta conocida — innecesario para un bucket público, cuyas lecturas por URL directa no dependen de RLS. Riesgo bajo (sin datos sensibles en `media`; `verification_evidence` no tiene ninguna política equivalente). Queda como deuda de hardening a decidir en una ronda aparte, junto con la ya registrada ausencia de políticas `delete`/`update` en `media` (huérfanos de Storage, `PROJECT.md` línea 1045, `ROADMAP.md` línea 50) — ninguna de las dos bloquea el criterio literal de A4.

### Estado final

**A4 queda Hecho.** Las dos cláusulas del criterio verificadas con evidencia real contra `ahorita-production`: subir/leer en `media`, y un archivo privado de `verification_evidence` inaccesible sin sesión — con el matiz metodológico de `NoSuchKey` documentado con honestidad, no forzado. Cero filas de prueba creadas o eliminadas en cualquier tabla; todo el impacto sobre producción quedó limitado a dos objetos de Storage, ambos limpiados y confirmados ausentes.

---

## A5 — aclaración de alcance ("historial"), en progreso (2026-08-09)

Durante la validación real de A5 (Etapa 1: registro self-service, confirmación de correo, logout/login, todo verificado exitosamente contra `ahorita-production`; Etapa 2: guardado de lugar y preferencia de interés verificados cross-device PC↔Android real, ambos exitosos) se detectó que el criterio de A5 incluía la palabra "historial" sin que exista, en ningún punto del repositorio, una tabla, función, pantalla o concepto dedicado a esa idea.

**Trazabilidad completa realizada antes de tocar el documento.** La palabra nace con el commit `d8d429d8c0dd619ad8bbb17750ca6b091afc184b` (creación de `BETA_READINESS_CHECKLIST.md`, 2026-07-25) y nunca fue modificada en ningún commit posterior — verificado filtrando específicamente líneas `+`/`-` que contuvieran "A5" en los seis commits que tocaron ese archivo desde entonces. El único texto contemporáneo a su redacción (la sección de registro de la checklist, más arriba en este mismo documento) explica que la ampliación de A5 hacia cambio de dispositivo fue "consecuencia natural de una arquitectura ya centrada en el servidor, no funcionalidad nueva" — consistente con el principio fundacional explícito de la propia checklist ("No introduce funcionalidad nueva"). Búsqueda exhaustiva de conceptos equivalentes (`activity`, `recent`, `viewed`, `visited`, `history`, reacciones) sin resultados relevantes — la única superficie remotamente cercana (`me_gusta`/`ya_fui` en `interactions`) fue evaluada y descartada explícitamente por falta de respaldo documental para tratarla como "historial".

**Decisión:** se retira la palabra "historial" del criterio objetivo de A5, dejando intacto el resto ("...conserva sus guardados, seguimientos y preferencias sin pérdida"). Es una corrección de una inconsistencia documental de la propia checklist, no un cambio de alcance de producto — no se construyó, ni se descartó, ninguna funcionalidad real de Ahorita.

**Estado de A5**: sigue **Pendiente** — la aclaración de "historial" no cierra el ítem. Falta todavía evidencia real de "seguimientos" (bloqueado por ausencia de un actor alcanzable vía UI sin crear contenido nuevo, ver diagnóstico en la sesión de validación) y, opcionalmente, de guardado de evento (bloqueado por ausencia de un evento vigente en producción). Ninguna prueba adicional se ejecutó en esta ronda — exclusivamente aclaración documental.

---

## A5 CERRADO — Registro/login real de punta a punta, cambio de dispositivo (2026-08-09)

Quinto ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado, con el alcance ya aclarado en la sección anterior (sin "historial"). Las siete cláusulas del criterio vigente quedaron demostradas con evidencia real contra `ahorita-production`, usando una cuenta self-service real, distinta de la cuenta administrativa.

**Registro, correo y sesión (sin intervención del equipo):** una persona real se registró desde el frontend real de producción, recibió y usó un correo de confirmación real, y completó un ciclo real de cierre/inicio de sesión sin que el equipo interviniera manualmente en ningún paso de ese flujo.

**Cambio de dispositivo — las tres categorías del criterio, cada una confirmada reabriendo la app en el segundo dispositivo sin repetir la acción:**
- **Guardados**: "Parque Calderón" guardado desde PC; visible en "Lugares guardados" (`/ajustes`) al iniciar sesión en Android real con la misma cuenta.
- **Preferencias**: interés "Naturaleza" activado desde PC; visible ya activo en Android real.
- **Seguimientos**: se reutilizó el mismo lugar ya guardado ("Parque Calderón") para publicar, desde la cuenta administrativa, una pregunta de prueba claramente identificada ("PRUEBA A5 — seguimiento, eliminar después") — el único artefacto de contenido nuevo de todo este cierre, y temporal. Desde la cuenta A5 en PC se pulsó "Seguir" sobre el autor de esa pregunta (mostrado como "Alguien de Ahorita", el `fallback` real de `AuthorTag.jsx` cuando el perfil no tiene `username` — consistente con el código, corrobora la evidencia); en Android, con la misma cuenta, el mismo autor apareció directamente como "Siguiendo", sin volver a pulsar el botón.

**Limpieza confirmada:** se dejó de seguir a la cuenta usada en la prueba y se eliminó manualmente la pregunta de prueba desde Supabase Table Editor tras obtener la evidencia — no quedó contenido público de prueba, no se tocó `Parque Calderón`, no se eliminó ni modificó ningún usuario ni rol.

**Distinción explícita, no ambigua:** en el curso de esta validación se descubrió que la cuenta administrativa no podía iniciar sesión por falta de una contraseña funcional, y se implementó un flujo mínimo de finalización de `PASSWORD_RECOVERY` (commit `a58f3cf`) para recuperar el acceso sin eliminar ni recrear esa cuenta, conservando `auth.users.id` y `profiles.is_admin` intactos. **Esa recuperación de acceso no es, ni sustituye, ningún requisito del criterio de A5** — fue un paso operativo necesario para poder publicar el artefacto de prueba de seguimiento (que requería una segunda persona real, distinta de la cuenta A5), documentado aquí solo como contexto, no como evidencia del criterio en sí.

### Estado final

**A5 queda Hecho.** Las siete cláusulas del criterio vigente (registro, confirmación de correo, cierre/inicio de sesión sin intervención del equipo, segundo dispositivo, guardados, seguimientos, preferencias) verificadas con evidencia real. "Historial" permanece fuera del criterio, tal como se aclaró en la sección anterior — no se reinterpretó ni se reintrodujo.

---

## A7 CERRADO — Trigger de creación de `profiles` contra Auth real (2026-08-15)

Séptimo ítem bloqueante de `BETA_READINESS_CHECKLIST.md` verificado con una consulta de solo lectura contra `ahorita-production`, comparando `auth.users` con `public.profiles`.

**Resultado real obtenido:** `total_auth_users = 4`, `total_profiles = 4`; cero filas de `auth.users` sin su correspondiente `profiles` (huérfano en esa dirección); cero filas de `profiles` sin su `auth.users` correspondiente (huérfano en la otra dirección); cero `id` con más de una fila en `profiles` (duplicado). Verificación puntual adicional, positiva, para dos cuentas reales conocidas (Pedro y Moisés, cada una con exactamente una fila).

**Consistencia con el esquema:** `profiles.id` es simultáneamente clave primaria de `profiles` y clave foránea hacia `auth.users(id) on delete cascade` (`0001_init.sql`), lo cual hace estructuralmente muy improbables los tres casos que el criterio prohíbe — pero, siguiendo el mismo estándar aplicado en A1-A6, esta verificación se apoya en datos reales de producción, no únicamente en el diseño del esquema.

### Estado final

**A7 queda Hecho.** El criterio ("un registro real produce exactamente una fila de perfil, sin duplicados ni huérfanos") queda demostrado con evidencia real, mediante una consulta exclusivamente de lectura, sin ninguna escritura en producción.

---

## A16 CERRADO — Correo transaccional de producción (2026-08-15)

Ítem A16 de `BETA_READINESS_CHECKLIST.md` verificado con evidencia real contra `ahorita-production`, tras un hallazgo histórico real que se documenta explícitamente en vez de omitirse.

**Hallazgo histórico, no ocultado:** un correo real de confirmación de registro recibido el 7 de agosto de 2026 contenía `redirect_to=http://localhost:3000` — una configuración de `Site URL`/`Redirect URLs` del proyecto de Supabase incorrecta y real en ese momento, no hipotética. Esto habría hecho fallar el criterio de A16 si se hubiera evaluado entonces.

**Estado actual de la configuración**, verificado en Supabase Dashboard → Authentication → URL Configuration: `Site URL: https://ahorita-five.vercel.app`; `Redirect URLs: https://ahorita-five.vercel.app/**`. Sin `localhost` en la configuración vigente. Esta configuración, por sí sola, no se consideró evidencia suficiente para cerrar A16 — se exigió, en cambio, un correo real nuevo, generado después de la corrección, que la confirmara empíricamente.

**Prueba real de recuperación de contraseña** (reutilizando una cuenta ya existente, sin crear ninguna nueva): correo real de recuperación disparado desde el Dashboard para una cuenta real, recibido en Gmail. Remitente: `Supabase Auth <noreply@mail.app.supabase.io>`. Enlace real con `type=recovery` y `redirect_to=https://ahorita-five.vercel.app`, sin `localhost`. Verificado directamente en Gmail → "Mostrar original": SPF PASS, DKIM PASS (dominio `mail.app.supabase.io`), DMARC PASS.

**Prueba real de confirmación de registro en un segundo proveedor de correo**: una cuenta nueva registrada desde el frontend real de Ahorita con una dirección de Yahoo Mail. El correo de confirmación llegó realmente a Yahoo Mail, enviado por Supabase Auth, con enlace `type=signup` y `redirect_to=https://ahorita-five.vercel.app`, sin `localhost`. Se pulsó "Confirm email address": la confirmación fue aceptada, el navegador terminó en `https://ahorita-five.vercel.app`, Ahorita cargó correctamente y apareció el onboarding de intereses correspondiente a una cuenta nueva — ciclo completo de punta a punta, con evidencia real.

**Dos proveedores de correo distintos, no solo dos cuentas**: Gmail (prueba de recuperación) y Yahoo Mail (prueba de confirmación de una cuenta nueva) — satisface explícitamente la exigencia del criterio de "más de un proveedor de correo", distinguida de simplemente usar dos direcciones distintas del mismo proveedor.

### Estado final

**A16 queda Hecho.** Las cláusulas del criterio (confirmación de registro, recuperación de contraseña, remitente correcto, URLs de redirección de producción, SPF/DKIM, más de un proveedor de correo, sin enlaces a localhost, sin secretos expuestos) quedan demostradas con evidencia real posterior a la corrección del hallazgo histórico — documentado aquí como defecto real ya corregido, no omitido. Ninguna escritura de configuración, RLS, código ni migraciones se realizó para obtener esta evidencia.

---

## A20 CERRADO — Inventario de datos operativos/semillas verificado (2026-08-15)

Ítem A20 de `BETA_READINESS_CHECKLIST.md` verificado con una consulta de solo lectura contra `ahorita-production`, comprobando uno a uno cada semilla exigida por el criterio literal.

**Semillas identificadas y su origen en el repositorio**, antes de ejecutar cualquier consulta: administrador inicial (`public.profiles.is_admin`, sembrado por `supabase/scripts/bootstrap_admin.sql`); actor de sistema "Ahorita Editorial" (`public.actors`, `0015_bloque1_esquema_fundacional.sql:113-115`); actor de sistema "Cuenta eliminada" (`public.actors`, `0034_fase5b_bloque3_comentarios_generalizados.sql:56`); ciudad "Cuenca" (`public.cities`, `0015:42`); zonas "Centro Histórico" y "Turi", hijas de Cuenca (`public.zones`, `0015:72-75`); catálogo de 10 canales (`public.channels`, `0001_init.sql:63-73`) — incluido bajo la cláusula abierta del criterio ("cualquier configuración sin la cual un flujo crítico falle") por ser la base de los filtros de categoría de toda la app.

**Resultado real obtenido**: administrador inicial = 1; actor "Ahorita Editorial" = 1; actor "Cuenta eliminada" = 1; ciudad "Cuenca" = 1; zona "Centro Histórico" de Cuenca = 1; zona "Turi" de Cuenca = 1; canales presentes = 10 de 10 esperados; canales faltantes = ninguno. Todos los valores coinciden exactamente con lo esperado — sin ausencias, sin duplicados.

### Estado final

**A20 queda Hecho.** Cada semilla exigida por el criterio literal existe, en la tabla y con el valor exacto esperado, verificado con una consulta exclusivamente de lectura contra producción real, sin ninguna escritura.

---

## A19 CERRADO — Canal de soporte visible y probado (2026-08-15)

Ítem A19 de `BETA_READINESS_CHECKLIST.md` verificado con una prueba real del canal de soporte definido para esta etapa.

**Decisión operativa (ya registrada al implementarlo, commit `05041a6`):** durante la beta, el soporte de Ahorita es atendido directamente por una persona responsable a través de un correo real — no un sistema de tickets automatizado, consistente con el principio explícito de `ETAPA_PRODUCTO_VIVO.md` §5 ("una persona respondiendo, no un sistema de tickets... que esta etapa no necesita ni debe construir"). El canal quedó visible en "Ajustes" (`SupportSection.jsx`), con un enlace `mailto:` real, sin formularios, tablas ni Edge Functions.

**Prueba real ejecutada:** se envió un correo real de prueba ("PRUEBA A19 — mensaje de prueba del canal de soporte de Ahorita. Solo necesito confirmar recepción y respuesta.") a través de ese canal. El mensaje llegó realmente a la persona responsable, quien respondió realmente. Hora de envío observada: 18:13. Hora de respuesta observada: 18:14. Tiempo de respuesta registrado: aproximadamente 1 minuto. Capturas reales conservadas tanto del envío como de la respuesta — no se documenta aquí la dirección de correo en sí, por no ser necesaria para esta evidencia (ya vive, intencionalmente, en el código de la aplicación).

### Estado final

**A19 queda Hecho.** El criterio literal ("un mensaje real... llega a una persona responsable") y su evidencia exigida ("prueba real del canal, con tiempo de respuesta registrado") quedan demostrados con un envío y una respuesta reales, sin construir ninguna funcionalidad nueva.

---

## A13 CERRADO, con desviación histórica documentada — Términos de Servicio y Política de Privacidad (2026-08-15)

Ítem A13 de `BETA_READINESS_CHECKLIST.md` implementado y publicado en producción. Se documenta aquí, deliberadamente separado, el resultado actual y la desviación histórica del criterio original — sin mezclar ambos como si el criterio se hubiera cumplido íntegramente.

### Resultado actual (evidencia real de producción)

El documento "Términos de Servicio y Política de Privacidad de Ahorita" (`src/pages/LegalPage.jsx`) contiene texto real, revisado sección por sección contra el código actual — ceñido deliberadamente a lo que está realmente desplegado: describe registro/autenticación, contenido publicado por personas usuarias, negocios/eventos, datos tratados, el aprendizaje real de afinidad (`affinity_profile()`, ya desplegado con las 46 migraciones), ubicación solo con permiso del navegador, ausencia de cookies de seguimiento, y un canal de contacto real (mismo correo ya cerrado en A19). **Omite deliberadamente** cualquier afirmación de que la Guía IA procesa conversaciones reales en producción hoy, y describe la exportación/eliminación de datos con lenguaje prudente (controles existentes en Ajustes, automatización en curso, solicitudes atendibles por el canal de contacto) — porque las Edge Functions correspondientes (`ai-guide`, `export-user-data`, `process-account-deletions`) no están confirmadas como desplegadas contra `ahorita-production` (mismo hallazgo ya registrado en el cierre de A3).

Verificación real ejecutada: `https://ahorita-five.vercel.app/legal` cargó correctamente en una ventana sin sesión (InPrivate) — ruta pública, fuera de `RequireAuth`/`RequireAccess`. Enlace verificado desde "Ajustes" (junto a "Ayuda y soporte") y desde `LoginPage.jsx`, visible antes de pulsar "Crear cuenta", sin checkbox de aceptación (decisión de producto explícita para esta beta).

### Desviación histórica del criterio original, no oculta

El criterio literal exige el documento "publicado antes del primer registro real". Eso **no ocurrió**: existieron registros reales completos (Moisés — cuenta administrativa —, Pedro y Ana — cuentas self-service reales de A5/A6 —, y las cuentas de prueba usadas durante esas validaciones) **antes** de que este documento existiera. La publicación real ocurrió el **15 de agosto de 2026**. No se altera esta fecha, no se reinterpreta el criterio, no se presenta este hecho como cumplido.

### Corrección prospectiva

A partir del 15 de agosto de 2026, cualquier persona que se registre **de ahora en adelante** encuentra el documento ya publicado y accesible antes de crear su cuenta — la condición queda corregida hacia el futuro, sin que eso subsane retroactivamente los registros que ya existían antes de esta fecha.

### Estado final

**A13 queda "Hecho, con desviación histórica documentada"** — no un cumplimiento íntegro del criterio original. Dos de sus tres cláusulas (documento real, accesible desde la app) están demostradas con evidencia real de producción; la cláusula de orden temporal respecto al primer registro no se cumplió y es, por naturaleza, irreversible.

---

## A17 — ensayo real de rollback de frontend (en progreso, no cierra el ítem) (2026-08-15)

Ítem A17 de `BETA_READINESS_CHECKLIST.md` (plan de reversión del despliegue) avanzó con un ensayo real, pero **permanece Pendiente** — se documenta aquí exactamente lo que se probó y lo que sigue faltando, sin presentarlo como un cierre.

**Ensayo real ejecutado**: con producción en `1bfd3ed` (commit más reciente en el momento del ensayo), se usó `Promote` en el Dashboard de Vercel para llevar temporalmente a Producción el deployment correspondiente a `05041a6` — un commit real, anterior, ya construido por Vercel (sin necesidad de reconstruir nada). Se verificó `https://ahorita-five.vercel.app/ajustes` y se confirmó que el enlace "Términos de Servicio y Política de Privacidad" —introducido recién en `5405afb`/`1bfd3ed`, posterior a `05041a6`— **no aparecía**, confirmando de forma observable que el rollback del artefacto frontend surtió efecto real, no solo teórico. Inmediatamente después se volvió a promover `1bfd3ed` a Producción, y se confirmó la reaparición del enlace, verificando la restauración completa. Capturas reales conservadas de ambos estados.

**Alcance del ensayo, explícito**: exclusivamente el artefacto estático del frontend en Vercel. En ningún momento se tocó Supabase, la base de datos, RLS, ninguna migración, ni ningún dato de personas reales — consistente con la cláusula del criterio "nunca revierte destructivamente datos ya creados por personas reales", aunque esta confirmación aplica únicamente al caso probado (rollback de frontend), no a un escenario que involucre Edge Functions o migraciones.

**Qué sigue faltando, sin reinterpretar el criterio**: la reversibilidad de las Edge Functions (`ai-guide`, `send-push`, `export-user-data`, `process-account-deletions`, `process-verification-lifecycle`) no puede ensayarse mientras ninguna esté desplegada contra `ahorita-production` — mismo hallazgo estructural ya registrado en el cierre de A3 y en A8-A11/A16-bis. Sin esa pieza, "el procedimiento" completo que exige el criterio (frontend **y** Edge Functions) no queda demostrado en su totalidad.

### Estado

**A17 sigue Pendiente.** De sus seis cláusulas atómicas, tres cuentan ahora con evidencia real (versión estable identificada, frontend revertible, no-destructividad confirmada para el caso probado); la política de migraciones de avance/reparación ya estaba satisfecha desde antes; la reversibilidad de Edge Functions permanece bloqueada, y el "procedimiento" en su conjunto no puede darse por ensayado hasta que esa pieza exista.

---
