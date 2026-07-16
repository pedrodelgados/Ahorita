-- Tarjeta editorial curada de ejemplo, para que el feed no se sienta vacío.
insert into public.editorial_posts (title, image_url, items, published_at) values (
  'Este fin de semana en Cuenca',
  'https://picsum.photos/seed/cuenca-weekend/1000/400',
  array[
    'Sábado: feria de artesanías en la Plaza de las Flores, desde las 9am',
    'Domingo: caminata guiada por el Barranco del Tomebamba, 10am',
    'Toda la semana: música en vivo en Calle Larga por las noches'
  ],
  now()
);
