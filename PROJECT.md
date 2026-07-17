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

### 2. Inicio — feed vertical estilo Instagram (esto es central, no lo conviertas en cuadrícula)
- Scroll vertical infinito, un post grande a la vez, cada uno ocupa 80–90% de la pantalla (foto o video)
- Mezcla orgánica de: eventos, restaurantes, cafeterías, hoteles, glampings, conciertos, museos, naturaleza, preguntas de la comunidad, estados/reportes en vivo — no agrupados por tipo, mezclados como en Instagram
- Cada post incluye: nombre del lugar/evento, ubicación, fecha/hora si aplica, descripción corta, etiqueta llamativa (NUEVO / GRATIS / IMPERDIBLE / HOY / EVENTO / PROMOCIÓN)
- Acciones verticales a la derecha del post: ❤️ me gusta, 💬 comentarios, 📤 compartir, 🔖 guardar
- Botones contextuales abajo del post según tipo: Cómo llegar, Comprar entradas, Ver menú, Más información
- Encabezado: logo, ícono de notificaciones, ícono de búsqueda
- Debajo del encabezado, fila horizontal deslizable de categorías con ícono + nombre (Para ti, Eventos, Gastronomía, Cafés, Naturaleza, Hoteles, Cultura, Deportes, Vida nocturna, Más)
- **Barra de IA fija**, visible mientras se hace scroll (no solo un botón flotante aparte): "✨ Pregúntale a la IA — ¿Qué quieres hacer hoy en Cuenca?"

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
- **editorial_posts**: id, title, image_url, items, published_at
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
