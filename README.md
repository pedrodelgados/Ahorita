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
