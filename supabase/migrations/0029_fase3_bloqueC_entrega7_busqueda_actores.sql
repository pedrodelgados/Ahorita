-- Fase 3 (ver MASTERPLAN.md), Bloque C, Entrega 7: búsqueda y descubrimiento
-- de negocios. Cierra la deuda técnica registrada desde la Entrega 2 (sin
-- descubrimiento/búsqueda de negocios conectado a ninguna pantalla) —
-- conecta a una pantalla real la infraestructura que ya existía completa
-- desde el Bloque A/B (`actor_search_index`, poblada automáticamente por
-- trigger con nombre/bio/categoría/catálogo).
--
-- Decisión de arquitectura aprobada explícitamente antes de esta migración:
-- la función consulta ACTORES, no negocios — `actor_types` es un parámetro
-- (por defecto solo 'negocio' en esta entrega) para que agregar
-- 'organizador' o, eventualmente y con su propia aprobación, 'persona', sea
-- ensanchar un arreglo, nunca rediseñar la consulta. Un actor tipo negocio u
-- organizador solo es descubrible si su negocio está `aprobado` — ningún
-- negocio pendiente, rechazado o sin propietario aparece jamás en un
-- resultado de búsqueda pública, filtrado dentro de la propia función
-- (nunca confiado solo a la política de lectura pública ya existente de
-- `actor_search_index`, que es intencionalmente abierta desde el Bloque A).
--
-- `category_filter` existe para los accesos rápidos por categoría de la
-- pantalla de búsqueda (aprobados junto con esta migración): un chip de
-- categoría filtra por `businesses.category` exacto (la misma taxonomía de
-- `channels` ya usada en toda la aplicación), no por una coincidencia de
-- texto contra la etiqueta en español — el nombre de categoría almacenado
-- es el id corto (p. ej. "gastronomia"), no la palabra "restaurantes", así
-- que buscar por texto literal el nombre de la categoría no encontraría
-- nada útil. `search_query` y `category_filter` son independientes: se
-- puede llamar con cualquiera de los dos, o ambos a la vez.
--
-- Deliberadamente NO implementado en esta función (fuera de alcance,
-- reservado para la Fase 6, "Descubrimiento inteligente v2"): ranking por
-- popularidad/cercanía, personalización, autocompletado en vivo. El orden
-- es por relevancia textual pura (`ts_rank`) cuando hay `search_query`, o
-- alfabético cuando el acceso es solo por categoría.
create function public.search_actors(
  search_query text default null,
  category_filter text default null,
  actor_types text[] default array['negocio']
)
returns table (
  actor_id uuid,
  display_name text,
  type text,
  business_id uuid,
  category text,
  image_url text
)
language sql
stable
security definer set search_path = public
as $$
  select
    a.id,
    a.display_name,
    a.type,
    a.business_id,
    b.category,
    b.image_url
  from public.actor_search_index si
  join public.actors a on a.id = si.actor_id
  left join public.businesses b on b.id = a.business_id
  where a.type = any(actor_types)
    and (b.id is null or b.status = 'aprobado')
    and (search_query is not null or category_filter is not null)
    and (search_query is null or si.search_vector @@ websearch_to_tsquery('spanish', search_query))
    and (category_filter is null or b.category = category_filter)
  order by
    case when search_query is not null
      then ts_rank(si.search_vector, websearch_to_tsquery('spanish', search_query))
    end desc nulls last,
    a.display_name asc
  limit 30;
$$;
