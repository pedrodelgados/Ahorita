# Ahorita

Red social hiperlocal para descubrir lo que pasa en Cuenca, Ecuador, en tiempo real. Ver `PROJECT.md` para el plan de producto completo.

## Stack

- React + Vite
- Supabase (Postgres + Auth + Storage + Realtime)
- React Router

## Empezar

```bash
npm install
cp .env.example .env   # completa con tu URL y anon key de Supabase
npm run dev
```

Para crear el esquema de base de datos, ve a `supabase/README.md`.

## Estado actual

**Fase 1**
- Sistema de diseño (colores, tipografía Fraunces + Inter) en `src/styles/`
- Cliente Supabase en `src/lib/supabaseClient.js`
- Esquema SQL inicial en `supabase/migrations/0001_init.sql`
- Login/registro con correo y contraseña (`src/features/auth/`), modo "explorar sin registrarme", y registro progresivo (pantalla de uso + intereses)
- OAuth de Google/Apple maquetado pero deshabilitado hasta configurar los providers en Supabase

**Fase 2**
- Cuadrícula de lugares tipo Instagram Explore, filtrable por zona (`src/features/places/PlaceGrid.jsx`)
- Muro de lugar como Bottom Sheet deslizable (`src/features/places/PlaceSheet.jsx`), con el mapa/grilla siempre visible detrás
- Timeline combinado de preguntas + estados, ordenado por tiempo
- Crear pregunta / crear estado con foto o video (Supabase Storage), responder preguntas, dar like a respuestas
- Todas las acciones de escritura piden cuenta solo al usarlas (`AuthGate`), no de entrada
- Datos semilla de ~10 lugares reales del Centro Histórico de Cuenca en `supabase/migrations/0003_seed_places.sql`

**Fase 3**
- Barra de stories con anillos de color por canal, mostrando el estado más reciente de cada lugar (`src/features/stories/StoriesBar.jsx`)
- Tarjeta editorial curada "Este fin de semana" (`src/features/editorial/EditorialCard.jsx`)
- Filtro por canal/categoría en la cuadrícula, combinable con el filtro de zona (`src/features/places/ChannelFilter.jsx`)

**Fase 4**
- Edge Function de Supabase (`supabase/functions/ai-guide`) que llama a la API de Claude con el contexto real de la base de datos — la API key nunca se expone al cliente
- Barra fija de "Guía IA" debajo del encabezado, visible al hacer scroll (`src/features/ai/GuideBar.jsx`)
- IA contextual dentro de cada ficha de lugar: botón "Preguntar a la Guía IA" que responde usando el contexto de ese lugar (`src/features/places/PlaceSheet.jsx`)

**Fase 5 — pulido y lanzamiento**
- Perfil de usuario (`src/pages/ProfilePage.jsx`): editar nombre e intereses, lugares guardados, negocios registrados
- Guardar lugares (ícono en `PlaceCard`/`PlaceSheet`) y seguir a otros usuarios (botón junto a cada pregunta/respuesta/estado), con estado compartido vía contexto (`SavedPlacesContext`, `FollowContext`)
- Registro de negocios (`src/pages/BusinessRegisterPage.jsx`) con estado "en revisión" hasta que un admin lo aprueba
- Panel de administración simple en `/admin` (`src/pages/AdminPage.jsx`): aprobar/rechazar negocios, verificar respuestas, cargar lugares nuevos sin tocar código
- PWA instalable: manifest, service worker (`vite-plugin-pwa`) e íconos en `public/icons/`

**Prompt maestro (revisión posterior) — ver `PROJECT.md`**
- **"Inicio"** (`/`, `src/pages/FeedPage.jsx`): feed vertical estilo Instagram, un post grande a la vez, mezcla orgánica de lugares/estados/preguntas/editorial (`src/lib/feed.js`), like/comentar/compartir/guardar por post (`src/lib/postLikes.js`), píldoras de categoría con ícono, barra de IA fija, búsqueda (`/buscar`) y notificaciones (`/notificaciones`, honesto placeholder — no hay push todavía)
- **"Explorar"** (`/explorar`) rediseñado: mapa real con Leaflet + OpenStreetMap, geolocalización del navegador, pines de color por canal, widget de clima (placeholder honesto, sin datos falsos), toggle a cuadrícula (`src/features/explore/`)
- **Navegación por pestañas** fija (Inicio / Explorar / Perfil) en `src/components/layout/BottomNav.jsx`
- **"Cómo llegar"** en el Bottom Sheet de lugar: distancia y tiempo real (geolocalización + fórmula de Haversine), deep link a Google Maps y a Uber, tarjetas caminando/bici/tranvía/auto, sección de transporte (tranvía/bus) con parada y tarifa referencial — sin horario en vivo, porque no existe una API pública de tiempo real para el tranvía/buses de Cuenca (`src/features/places/DirectionsSection.jsx`)
