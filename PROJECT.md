# Ahorita — Plan inicial para Claude Code

## Visión del producto

**Ahorita** no es una guía turística — es la red social hiperlocal para descubrir lo que pasa en Cuenca, Ecuador, en tiempo real. Todo gira alrededor de lugares, no de un mapa: preguntas, respuestas y reportes en vivo anclados a sitios físicos de la ciudad.

**Frase de posicionamiento:** "Todo lo que pasa en Cuenca, en vivo."

**Audiencia:** turistas y locales por igual.

**Visión de expansión (no construir todavía, solo tenerlo en mente para no cerrar puertas en el diseño de datos):** mismo motor, activado ciudad por ciudad — cantones cercanos primero (Gualaceo, Chordeleg, Paute, Girón, Sígsig, Cajas), luego ciudades más grandes (Loja, Baños, Quito, Guayaquil).

---

## Stack técnico recomendado

- **Frontend:** React + Vite (empezar como web app / PWA instalable; app nativa con React Native es una fase posterior)
- **Backend / base de datos / autenticación / notificaciones push:** Supabase (Postgres + Auth + Storage + Realtime)
- **IA:** API de Claude (`claude-sonnet-4-6` o el modelo vigente), llamada desde un endpoint propio del backend (no directo desde el cliente, para no exponer la key)
- **Hosting:** Vercel o Netlify para el frontend; Supabase gestiona el backend

---

## Sistema de diseño

- **Paleta:** fondo claro y cálido (`#FBF8F4`), tinta principal `#2B2622`, acento primario `#E8785C` (coral suave, no saturado)
- **Color por categoría/canal** — tonos suaves y elegantes, no candy/neón:
  - Gastronomía `#E8785C` · Cultura `#8B7CE0` · Vida nocturna `#E0669A` · Deportes `#4FA383` · Naturaleza `#4FA3A0` · Glamping `#B8875A` · Hoteles `#5B94C9` · Música `#D9A83F` · Familiar `#E0966A` · Pet friendly `#7BAE8C`
- **Tipografía:** "Fraunces" (serif editorial, elegante) para títulos y logo; "Inter" para cuerpo de texto y navegación — evitar fuentes redondeadas/infantiles tipo "Baloo"
- **Iconografía:** siempre íconos vectoriales (Lucide o similar), nunca emojis como íconos de UI — los emojis se ven bien solo como acento puntual (ej. junto a un título), no como reemplazo de íconos de categoría, mapa o navegación
- **Círculos de categoría:** fondo con tinte suave del color (8-15% opacidad) en estado inactivo, relleno sólido solo en estado activo — no bloques de color sólido por defecto
- **Estilo de tarjetas:** esquinas muy redondeadas (16–24px), sombra suave y de bajo contraste, mucho espacio en blanco
- **Referencia de calidad:** debe sentirse como Apple Maps + Airbnb + Instagram — premium, minimalista, fotografías grandes, nunca recargado

---

## Modelo de datos (punto de partida)

- **users**: id, username, password (hash, vía Supabase Auth — incluir OAuth Google/Apple), avatar_url, usage_mode (vivo_en_cuenca / visitante / negocio / organizador), interests (array), created_at
- **businesses**: id, owner_id, name, category, address, lat, lng, whatsapp, phone, instagram, website, hours, image_url, description, status (pendiente/aprobado)
- **places**: id, name, area (zona de la ciudad), channel_default, image_url, lat, lng
- **questions**: id, author_id, place_id, channel, text, created_at
- **answers**: id, question_id, author_id, text, likes_count, verified (bool), created_at
- **statuses**: id, author_id, place_id, channel, text, media_url, media_type (image/video), created_at
- **editorial_posts**: id, title, image_url, items (array de texto), published_at
- **channels**: id, label, emoji, color_hex

---

## Funcionalidades — construir en este orden

### Fase 1 — Base
1. Proyecto Vite + React, estructura de carpetas, sistema de diseño (tokens de color, tipografía) como constantes reutilizables
2. Conexión a Supabase, esquema de base de datos inicial (tablas de arriba)
3. Login / registro real con Supabase Auth: correo + contraseña, y OAuth con Google/Apple. Permitir "explorar sin registrarme" — pedir cuenta solo al guardar, comentar, publicar o dar like
4. Registro progresivo: tras el login, ir directo a explorar; pedir intereses/ciudad/foto de perfil poco a poco, no todo de una vez

### Fase 2 — Feed principal
5. Cuadrícula de lugares tipo Instagram Explore, filtrable por zona
6. Pantalla de "muro de lugar" (preguntas + estados ordenados por tiempo) — como **Bottom Sheet** deslizable desde abajo, no pantalla nueva, manteniendo el mapa/feed visible detrás
7. Crear pregunta / crear estado (reporte en vivo), con opción de subir foto o video (Supabase Storage)
8. Responder preguntas, dar like a respuestas

### Fase 3 — Vivo y editorial
8. Barra de "stories" con anillos de color por canal, mostrando estados recientes
9. Tarjeta editorial curada ("Este fin de semana")
10. Filtro por canal/categoría

### Fase 4 — IA
11. Endpoint backend que llama a la API de Claude, pasando como contexto las preguntas/respuestas/estados reales de la base de datos
12. Chat de "guía IA" en el frontend, accesible desde una barra fija visible mientras se hace scroll (no solo un botón flotante)
13. IA contextual dentro de cada ficha de lugar (Bottom Sheet): botón "Preguntar a la Guía IA" que responde usando el contexto de ese lugar específico (lugares similares cercanos, ruta sugerida, etc.)

### Fase 5 — Pulido y lanzamiento
14. Notificaciones push (Supabase Realtime + Web Push, o Firebase Cloud Messaging si se pasa a app nativa después)
15. Perfil de usuario (historial, lugares guardados, seguir personas)
16. Pantalla de registro de negocios (nombre, categoría, dirección, ubicación en mapa, contacto, horario, foto, descripción) con estado "en revisión" antes de publicar
17. Panel de administración simple para moderar contenido y cargar lugares/eventos sin tocar código
18. Convertir a PWA instalable (manifest, service worker)

---

## Mejoras de UX incorporadas (de la revisión de prompts de diseño)

- **Bottom Sheet en vez de pantalla completa**: al tocar un lugar en el mapa/explorar, la información aparece en una ventana deslizante desde abajo (estilo Apple Maps), no navega a una pantalla nueva. El mapa permanece siempre visible detrás.
- **Barra de IA fija debajo del encabezado**, visible mientras se hace scroll por el feed — no solo un botón flotante aparte.
- **"Preguntar a la Guía IA" dentro de la ficha de cada lugar** (no solo como chat genérico): ej. "¿qué otro lugar parecido hay cerca?", "hazme una ruta desde aquí". La IA responde usando el contexto de ese lugar específico.
- **Explorar sin registrarme**: permitir navegar la app sin cuenta; pedir registro solo cuando el usuario intenta guardar, comentar, publicar o dar like. Reduce fricción inicial y ayuda con el arranque en frío.
- **Registro progresivo**: entrar con Google/Apple/correo y pasar directo a explorar; pedir datos adicionales (intereses, ciudad, foto) poco a poco conforme el usuario usa funciones, no todo de una vez.
- **Pantalla de registro de negocios separada** (nombre, categoría, dirección, ubicación en mapa, WhatsApp, teléfono, Instagram, horario, foto, descripción) con nota de "en revisión antes de publicar" — clave para el modelo de listados destacados.
- **Pantalla "¿Cómo usarás la app?"** con tarjetas (Vivo en Cuenca / Estoy visitando / Tengo un negocio / Organizo eventos) en vez de un simple selector turista/local — personaliza el contenido inicial.

---


- **Arranque en frío:** la app se siente "muerta" si no hay actividad. Antes de invitar público, cargar contenido semilla real (preguntas, estados, lugares) para la zona de lanzamiento.
- **Lanzar concentrado**, no toda Cuenca de golpe — empezar en una sola zona (ej. Centro Histórico) para que se sienta viva más rápido.
- **Moderación** desde el día 1 — preguntas/respuestas/fotos abiertas son vector de spam.
- **"Respuesta verificada"**: por ahora, que solo el usuario administrador pueda marcarla (campo `verified` en la tabla `answers`), hasta definir un sistema de reputación comunitario más adelante.

---

## Prompt para pegar en Claude Code (primer mensaje)

```
Quiero construir "Ahorita" (nombre de trabajo, también evaluamos "Cuenca Viva") — una red social hiperlocal para descubrir Cuenca, Ecuador en tiempo real. Toda la información de producto, diseño, modelo de datos y mejoras de UX está en el archivo ahorita-plan-claude-code.md que voy a subir a este repositorio.

Empecemos por la Fase 1: configura el proyecto (Vite + React), define el sistema de diseño como constantes reutilizables (colores, tipografía Fraunces + Inter), conecta Supabase, crea el esquema de base de datos según el modelo de datos del documento, y construye el flujo de login/registro con Supabase Auth (correo + contraseña, con opción de "explorar sin registrarme").

Ve paso a paso, pregúntame cuando necesites una decisión de producto, y avísame cuando cada parte esté lista para probar.
```

**Recomendación:** sube este mismo archivo `.md` al repositorio de GitHub (en la raíz, como `PROJECT.md` o similar) antes de pegar el prompt — así Claude Code tiene el documento completo como referencia permanente del proyecto, en vez de depender de que quede solo en el mensaje inicial.
