-- Eventos de ejemplo para que Inicio no se sienta vacío en el arranque en
-- frío. Fechas relativas a "ahora" para que siempre aparezcan como próximos,
-- sin importar cuándo se corra esta migración.
--
-- Imágenes: placeholders editoriales/cinematográficos de Unsplash (no genéricos,
-- elegidos por tema — arquitectura patrimonial, música en vivo, gastronomía,
-- naturaleza/deporte) mientras se construye el banco fotográfico real de Cuenca.
-- Ver PROJECT.md, sección "Rediseño visual premium".

insert into public.events
  (title, description, category, image_url, video_url, location_name, lat, lng, start_at, end_at, price, ticket_url, tag)
values
  (
    'Festival de las Flores',
    'Feria de artesanías y flores en la Plaza de las Flores, con música en vivo y puestos de comida típica.',
    'cultura',
    'https://images.unsplash.com/photo-1520333789090-73ee2f76f22a?w=1200&q=80&auto=format&fit=crop',
    null,
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
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop',
    null,
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
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop',
    null,
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
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80&auto=format&fit=crop',
    null,
    'Barranco del Tomebamba',
    -2.901, -79.0035,
    now() + interval '9 days',
    now() + interval '9 days 3 hours',
    10,
    'https://example.com/inscripcion-10k',
    'imperdible'
  ),
  (
    'Noche de Jazz en el Barranco',
    'Trío de jazz en vivo con vista al río, en una terraza del Barranco al atardecer.',
    'vida_nocturna',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop',
    null,
    'El Barranco',
    -2.9024, -79.0042,
    now() + interval '3 days 4 hours',
    now() + interval '3 days 7 hours',
    8,
    null,
    null
  );
