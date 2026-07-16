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

La función usa `claude-sonnet-5`. Recibe `{ messages, placeId? }`: sin `placeId` arma contexto de toda la ciudad (lugares + tarjeta editorial); con `placeId` arma contexto de ese lugar específico (preguntas, respuestas, estados recientes y lugares cercanos en la misma zona).

## Notas sobre el esquema

- `profiles` extiende `auth.users` (Supabase Auth ya maneja email/contraseña y OAuth). Un trigger crea el perfil automáticamente al registrarse.
- Todas las tablas tienen Row Level Security activado. Lectura pública en la mayoría de tablas (contenido de la red social es abierto); escritura restringida al autor autenticado.
- `businesses.status` empieza en `'pendiente'` — solo se muestran públicamente cuando un admin lo cambia a `'aprobado'` (por ahora, manual desde el dashboard de Supabase; un panel de admin vendrá en una fase posterior).
- `answers.verified` — por ahora sin política de escritura para usuarios normales; solo el rol de servicio (admin) debería poder marcarlo hasta definir un sistema de reputación comunitario.
- `channels` viene pre-poblado con los 10 canales del sistema de diseño.
- `0002_storage.sql` crea el bucket público `media` (fotos/videos de estados) con lectura pública y escritura solo para usuarios autenticados.
- `0003_seed_places.sql` precarga ~10 lugares reales del Centro Histórico de Cuenca para evitar el "arranque en frío". Las imágenes son placeholders (`picsum.photos`) — reemplázalas por fotos reales antes de lanzar.
- `0004_seed_editorial.sql` precarga una tarjeta editorial de ejemplo ("Este fin de semana"). Edítala o crea una nueva fila en `editorial_posts` para actualizar el contenido curado.
- `0005_profile_social.sql` agrega `saved_places` (lugares guardados), `follows` (seguir personas), y `profiles.is_admin` con las políticas necesarias para el panel de administración (`/admin`).

## Convertir tu cuenta en administradora

Después de registrarte en la app, corre esto en el **SQL Editor** de Supabase (reemplaza el correo):

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
```

Con eso podrás entrar a `/admin` para aprobar negocios, verificar respuestas y cargar lugares sin tocar código.
