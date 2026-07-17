-- Etiquetas de ejemplo sobre los lugares semilla, para que el feed de Inicio
-- no se vea plano en el arranque en frío.
update public.places set tag = 'imperdible', hours = '9:00–17:00'
  where name = 'Catedral de la Inmaculada';

update public.places set tag = 'gratis', hours = '9:00–17:30'
  where name = 'Museo Pumapungo';

update public.places set tag = 'imperdible'
  where name = 'Mirador de Turi';

update public.places set tag = 'hoy'
  where name = 'Calle Larga';
