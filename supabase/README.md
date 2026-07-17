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
- `0012_seed_events.sql` precarga 4 eventos de ejemplo (festival, concierto, feria gastronómica, carrera) con fechas relativas a "ahora" para que siempre aparezcan como próximos.
- `0013_admin_lifecycle.sql` — administración completa de eventos y lugares (`/admin/eventos`, `/admin/lugares`): agrega `events.status/organizer/publish_at/expires_at` y `places.status`, políticas UPDATE/DELETE para `places` (antes solo tenía INSERT admin), y ajusta el SELECT público de ambas tablas a `status = 'publicado' OR is_admin()`.
- `0014_updated_at_and_creator.sql` — agrega `updated_at` (mantenido por trigger `set_updated_at`) a `events`/`places`, y `created_by` a `places` (`events` ya lo tenía), para mostrar "actualizado hace…" y autor en los listados de `/admin`.
- `0015_bloque1_esquema_fundacional.sql` — **Fase 1 del ecosistema social (ver `MASTERPLAN.md`), Bloque 1: esquema.** Agrega únicamente tablas nuevas, sin tocar ni una fila de las tablas existentes: `cities` (poblada con "Cuenca"), `zones` (hija de `cities`, con jerarquía de un solo nivel; poblada con "Centro Histórico" y "Turi", las únicas zonas realmente en uso hoy en `places.area`), `actors` (identidad unificada persona/negocio/organizador/sistema; ya incluye los actores de sistema "Guía IA" y "Ahorita Editorial"), `interactions` (polimórfica, catálogo: me_gusta/quiero_ir/ya_fui/guardado/seguimiento/compartir — "reportar" queda deliberadamente fuera, es su propia entidad de moderación en una fase posterior), `event_details` (primer caso del patrón "núcleo genérico + tabla de detalle", nace vacía — la separación real de los datos de `events` ocurre en el Bloque 3), y `consent_records` (línea base de privacidad, adelantada desde la fase final del plan original). Ninguna de estas tablas está todavía conectada a la aplicación — es deliberadamente invisible para el usuario final hasta los bloques siguientes.
- `0016_bloque2_identidad.sql` — **Fase 1, Bloque 2: identidad.** Vincula `profiles` y `businesses` con `actors`, sin alterar ninguna columna de ninguna de las dos: crea un actor tipo `persona` por cada `profile` existente y uno tipo `negocio` por cada `business` existente (backfill, protegido con `where not exists` además de la restricción `unique` ya existente), y agrega dos triggers (`on_profile_created_actor`, `on_business_created_actor`, ambos `security definer` con el mismo patrón que `handle_new_user`) para que todo registro o negocio nuevo cree su actor automáticamente de ahora en adelante — sin esto, la correspondencia solo sería cierta en el instante de la migración. El `display_name` de un actor persona/negocio es una foto del momento de creación (usa `username`/`name` en ese instante); no se mantiene sincronizado ante ediciones posteriores — ver la nota de limitación conocida en `PROJECT.md`.
- `0017_bloque3_contenido.sql` — **Fase 1, Bloque 3: contenido.** Puebla `event_details` (creada vacía en el Bloque 1) con una copia fiel de `start_at/end_at/price/ticket_url/organizer` de cada evento ya existente (backfill, protegido con `where not exists`) — primer caso real de datos fluyendo por el patrón "núcleo genérico + tabla de detalle" de Publicación. La separación es deliberadamente **aditiva**: ninguna columna se retira de `events` en este bloque, y `event_details` es una **fotografía** tomada en este momento, sin trigger de sincronización posterior (mismo criterio que `actors.display_name` en el Bloque 2) — ver el detalle de las dos decisiones arquitectónicas evaluadas y aprobadas en `PROJECT.md`.
- `0018_bloque4_interacciones_territorio.sql` — **Fase 1, Bloque 4: interacciones y territorio.** Puebla `interactions` con una copia fiel de `post_likes` (→ `me_gusta`), `saved_places`/`saved_events` (→ `guardado`) y `follows` (→ `seguimiento`, resuelto vía `actors.profile_id`), y agrega `places.zone_id` mapeado desde `places.area` únicamente cuando coincide exactamente con una `zones.name` existente (nunca se inventa ni corrige una zona ambigua). Reemplaza la política de lectura pública de `interactions` (creada en el Bloque 1) por una que excluye el tipo `guardado` — un guardado solo es visible para su dueño o un administrador, igual privacidad que ya tenían `saved_places`/`saved_events`. Aditivo y sin sincronización en vivo, mismo criterio que los Bloques 2 y 3 — ver el análisis previo aprobado y la verificación completa en `PROJECT.md`.

## Convertir tu cuenta en administradora

Después de registrarte en la app, corre esto en el **SQL Editor** de Supabase (reemplaza el correo):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

Con eso podrás entrar a `/admin` para aprobar negocios, verificar respuestas y cargar lugares sin tocar código.
