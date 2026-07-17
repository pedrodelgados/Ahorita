-- Eventos de ejemplo para que Inicio no se sienta vacío en el arranque en
-- frío. Fechas relativas a "ahora" para que siempre aparezcan como próximos,
-- sin importar cuándo se corra esta migración. Imágenes son placeholders.

insert into public.events
  (title, description, category, image_url, location_name, lat, lng, start_at, end_at, price, ticket_url, tag)
values
  (
    'Festival de las Flores',
    'Feria de artesanías y flores en la Plaza de las Flores, con música en vivo y puestos de comida típica.',
    'cultura',
    'https://picsum.photos/seed/festival-flores/900/1200',
    'Plaza de las Flores, Centro Histórico',
    -2.8983, -79.0045,
    now() + interval '2 days',
    now() + interval '2 days 8 hours',
    null,
    null,
    'gratis'
  ),
  (
    'Concierto en el Teatro Sucre',
    'Orquesta Sinfónica de Cuenca presenta un repertorio de música clásica ecuatoriana.',
    'musica',
    'https://picsum.photos/seed/teatro-sucre/900/1200',
    'Teatro Sucre, Centro Histórico',
    -2.8974, -79.0037,
    now() + interval '4 days 3 hours',
    now() + interval '4 days 5 hours',
    15,
    'https://example.com/entradas-teatro-sucre',
    'nuevo'
  ),
  (
    'Feria Gastronómica de Calle Larga',
    'Los mejores restaurantes de Calle Larga sacan sus platos estrella a la calle por una noche.',
    'gastronomia',
    'https://picsum.photos/seed/feria-gastronomica/900/1200',
    'Calle Larga, Centro Histórico',
    -2.9005, -79.0018,
    now() + interval '6 hours',
    now() + interval '10 hours',
    null,
    null,
    'hoy'
  ),
  (
    'Carrera 10K Río Tomebamba',
    'Carrera popular por el Barranco del Tomebamba, con categorías competitiva y recreativa.',
    'deportes',
    'https://picsum.photos/seed/carrera-10k/900/1200',
    'Barranco del Tomebamba',
    -2.901, -79.0035,
    now() + interval '9 days',
    now() + interval '9 days 3 hours',
    10,
    'https://example.com/inscripcion-10k',
    'imperdible'
  );
