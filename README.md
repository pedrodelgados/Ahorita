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

## Estado actual (Fase 1)

- Sistema de diseño (colores, tipografía Fraunces + Inter) en `src/styles/`
- Cliente Supabase en `src/lib/supabaseClient.js`
- Esquema SQL inicial en `supabase/migrations/0001_init.sql`
- Login/registro con correo y contraseña (`src/features/auth/`), modo "explorar sin registrarme", y registro progresivo (pantalla de uso + intereses)
- OAuth de Google/Apple maquetado pero deshabilitado hasta configurar los providers en Supabase
