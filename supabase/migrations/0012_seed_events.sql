-- Eventos de ejemplo para que Inicio no se sienta vacío en el arranque en
-- frío. Fechas relativas a "ahora" para que siempre aparezcan como próximos,
-- sin importar cuándo se corra esta migración.
--
-- Imágenes: solo se asigna una fotografía de demostración local
-- (public/demo-photos/) cuando es semánticamente coherente con la
-- categoría y el título del evento. Hoy solo tenemos fotografía real
-- coherente para "gastronomia" (comida) y "naturaleza" (montaña andina) —
-- el resto queda con image_url = null a propósito, y el frontend muestra
-- el fallback editorial de marca de esa categoría (color + ícono) en vez
-- de forzar una foto que no corresponde (nunca una fotografía engañosa).
-- Ver PROJECT.md, "Coherencia semántica de la fotografía por categoría".
--
-- editor_pick marca 3 eventos para demostrar que "Selección del editor"
-- ya puede usar curaduría manual real (ver 0012_events_editor_pick.sql)
-- en vez de solo el heurístico automático de etiquetas.

insert into public.events
  (title, description, category, image_url, video_url, location_name, lat, lng, start_at, end_at, price, ticket_url, tag, editor_pick)
values
  (
    'Festival de las Flores',
    'Feria de artesanías y flores en la Plaza de las Flores, con música en vivo y puestos de comida típica.',
    'cultura',
    null,
    null,
    'Plaza de las Flores, Centro Histórico',
    -2.8983, -79.0045,
    now() + interval '2 days',
    now() + interval '2 days 8 hours',
    null,
    null,
    'gratis',
    true
  ),
  (
    'Concierto en el Teatro Sucre',
    'Orquesta Sinfónica de Cuenca presenta un repertorio de música clásica ecuatoriana.',
    'musica',
    null,
    null,
    'Teatro Sucre, Centro Histórico',
    -2.8974, -79.0037,
    now() + interval '4 days 3 hours',
    now() + interval '4 days 5 hours',
    15,
    'https://example.com/entradas-teatro-sucre',
    'nuevo',
    false
  ),
  (
    'Feria Gastronómica de Calle Larga',
    'Los mejores restaurantes de Calle Larga sacan sus platos estrella a la calle por una noche.',
    'gastronomia',
    '/demo-photos/gastronomia-wraps.jpg',
    null,
    'Calle Larga, Centro Histórico',
    -2.9005, -79.0018,
    now() + interval '6 hours',
    now() + interval '10 hours',
    null,
    null,
    'hoy',
    true
  ),
  (
    'Carrera 10K Río Tomebamba',
    'Carrera popular por el Barranco del Tomebamba, con categorías competitiva y recreativa.',
    'deportes',
    null,
    null,
    'Barranco del Tomebamba',
    -2.901, -79.0035,
    now() + interval '9 days',
    now() + interval '9 days 3 hours',
    10,
    'https://example.com/inscripcion-10k',
    'imperdible',
    false
  ),
  (
    'Noche de Jazz en el Barranco',
    'Trío de jazz en vivo con vista al río, en una terraza del Barranco al atardecer.',
    'vida_nocturna',
    null,
    null,
    'El Barranco',
    -2.9024, -79.0042,
    now() + interval '3 days 4 hours',
    now() + interval '3 days 7 hours',
    8,
    null,
    null,
    true
  );
