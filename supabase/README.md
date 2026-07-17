# Base de datos — Ahorita

## Cómo aplicar el esquema

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** en el dashboard del proyecto.
3. Pega el contenido de `migrations/0001_init.sql` y ejecútalo.
4. Copia `Project Settings > API > Project URL` y `anon public key` a tu archivo `.env` (ver `.env.example` en la raíz).

Si prefieres la CLI de Supabase:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Guía IA (Edge Function)

La app llama a la API de Claude solo desde `supabase/functions/ai-guide`, nunca directo desde el navegador, para no exponer la API key.

```bash
supabase secrets set ANTHROPIC_API_KEY=tu-api-key-de-anthropic
supabase functions deploy ai-guide
```

La función usa `claude-sonnet-5`. Recibe `{ messages, placeId? }`: sin `placeId` arma contexto de toda la ciudad (lugares + eventos próximos); con `placeId` arma contexto de ese lugar específico (preguntas, respuestas, estados recientes y lugares cercanos en la misma zona).

## Notificaciones push (Edge Function)

Genera tu propio par de claves VAPID (no requiere cuenta externa, es criptografía local):

```bash
npx web-push generate-vapid-keys
```

Pega la **Public Key** en `VITE_VAPID_PUBLIC_KEY` (`.env` del frontend) y configura ambas claves como secrets de la función:

```bash
supabase secrets set VAPID_PUBLIC_KEY=tu-public-key
supabase secrets set VAPID_PRIVATE_KEY=tu-private-key
supabase secrets set VAPID_SUBJECT=mailto:tu-correo@ejemplo.com
supabase functions deploy send-push
```

`send-push` recibe `{ userId, title, body?, url? }` y le manda la notificación a todas las suscripciones guardadas de ese usuario (tabla `push_subscriptions`). Por ahora se dispara desde el cliente cuando alguien responde una pregunta — para producción, lo más robusto es moverlo a un [Database Webhook](https://supabase.com/docs/guides/database/webhooks) que llame a la función directamente al insertar en `answers`, en vez de depender del cliente.

## Notas sobre el esquema

- `profiles` extiende `auth.users` (Supabase Auth ya maneja email/contraseña y OAuth). Un trigger crea el perfil automáticamente al registrarse.
- Todas las tablas tienen Row Level Security activado. Lectura pública en la mayoría de tablas (contenido de la red social es abierto); escritura restringida al autor autenticado.
- `businesses.status` empieza en `'pendiente'` — solo se muestran públicamente cuando un admin lo cambia a `'aprobado'` (por ahora, manual desde el dashboard de Supabase; un panel de admin vendrá en una fase posterior).
- `answers.verified` — por ahora sin política de escritura para usuarios normales; solo el rol de servicio (admin) debería poder marcarlo hasta definir un sistema de reputación comunitario.
- `channels` viene pre-poblado con los 10 canales del sistema de diseño.
- `0002_storage.sql` crea el bucket público `media` (fotos/videos de estados) con lectura pública y escritura solo para usuarios autenticados.
- `0003_seed_places.sql` precarga ~10 lugares reales del Centro Histórico de Cuenca para evitar el "arranque en frío". Las imágenes son placeholders (`picsum.photos`) — reemplázalas por fotos reales antes de lanzar.
- `0004_seed_editorial.sql` precarga una tarjeta editorial de ejemplo — corre igual que las demás en orden, pero `0010_events.sql` elimina esa tabla después (ver más abajo). Se conserva el archivo por historial.
- `0005_profile_social.sql` agrega `saved_places` (lugares guardados), `follows` (seguir personas), y `profiles.is_admin` con las políticas necesarias para el panel de administración (`/admin`).
- `0006_author_profile_relations.sql` reapunta los FK de autor de `questions`/`answers`/`statuses` a `profiles` en vez de `auth.users`, para poder mostrar el nombre de usuario y el botón de "seguir".
- `0007_feed_and_likes.sql` agrega `places.tag/hours/website/tickets_url/menu_url/description` (para las tarjetas del feed de Inicio) y `post_likes` (like genérico para cualquier tipo de contenido, con la vista `post_like_counts` para el conteo agregado).
- `0008_seed_tags.sql` etiqueta algunos lugares semilla (`imperdible`, `gratis`, `hoy`) para que el feed de Inicio no se vea plano en el arranque en frío.
- `0009_push_subscriptions.sql` agrega `push_subscriptions` (una fila por dispositivo suscrito a notificaciones push).
- `0010_events.sql` — **corrección de producto**: Inicio pasa a ser un feed solo de eventos. Elimina `editorial_posts` y agrega `events` (con `likes_count`/`comments_count` desnormalizados, mantenidos por trigger), `event_comments` y `saved_events`. Solo administradores o el dueño de un negocio ya aprobado pueden crear eventos.
- `0011_seed_events.sql` precarga 4 eventos de ejemplo (festival, concierto, feria gastronómica, carrera) con fechas relativas a "ahora" para que siempre aparezcan como próximos.

## Convertir tu cuenta en administradora

Después de registrarte en la app, corre esto en el **SQL Editor** de Supabase (reemplaza el correo):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

Con eso podrás entrar a `/admin` para aprobar negocios, verificar respuestas y cargar lugares sin tocar código.
