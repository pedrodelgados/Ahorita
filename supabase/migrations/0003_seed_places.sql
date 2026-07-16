-- Datos semilla — lugares reales del Centro Histórico de Cuenca para el arranque en frío.
-- image_url usa placeholders (picsum.photos); reemplazar por fotos reales antes de lanzar.

insert into public.places (name, area, channel_default, image_url, lat, lng) values
  ('Catedral de la Inmaculada', 'Centro Histórico', 'cultura', 'https://picsum.photos/seed/catedral-inmaculada/800/800', -2.8976, -79.0041),
  ('Parque Calderón', 'Centro Histórico', 'cultura', 'https://picsum.photos/seed/parque-calderon/800/800', -2.897733, -79.004396),
  ('Plaza de las Flores', 'Centro Histórico', 'cultura', 'https://picsum.photos/seed/plaza-flores/800/800', -2.8983, -79.0045),
  ('Mercado 10 de Agosto', 'Centro Histórico', 'gastronomia', 'https://picsum.photos/seed/mercado-10-agosto/800/800', -2.8987, -79.0062),
  ('Museo Pumapungo', 'Centro Histórico', 'cultura', 'https://picsum.photos/seed/museo-pumapungo/800/800', -2.903, -79.0005),
  ('Calle Larga', 'Centro Histórico', 'vida_nocturna', 'https://picsum.photos/seed/calle-larga/800/800', -2.9005, -79.0018),
  ('Barranco del Tomebamba', 'Centro Histórico', 'naturaleza', 'https://picsum.photos/seed/barranco-tomebamba/800/800', -2.901, -79.0035),
  ('Iglesia de San Blas', 'Centro Histórico', 'cultura', 'https://picsum.photos/seed/san-blas/800/800', -2.8968, -78.9995),
  ('Parque de la Madre', 'Centro Histórico', 'familiar', 'https://picsum.photos/seed/parque-madre/800/800', -2.9002, -79.008),
  ('Mirador de Turi', 'Turi', 'naturaleza', 'https://picsum.photos/seed/mirador-turi/800/800', -2.917, -79.006);
