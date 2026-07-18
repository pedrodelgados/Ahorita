import { supabase } from "./supabaseClient";

// Búsqueda y descubrimiento de actores (Fase 3, Bloque C, Entrega 7):
// consulta el actor como entidad principal — `types` filtra qué tipos de
// actor son descubribles hoy (solo 'negocio'), no una función distinta
// "de negocios". Ampliar a 'organizador' o, con su propia aprobación,
// 'persona', es ensanchar este arreglo, nunca rediseñar la consulta.
// `query` y `category` son independientes entre sí — los accesos rápidos
// por categoría de la pantalla de búsqueda usan `category` solo, sin texto.
export async function searchActors({ query, category, types = ["negocio"] } = {}) {
  const { data, error } = await supabase.rpc("search_actors", {
    search_query: query || null,
    category_filter: category || null,
    actor_types: types,
  });
  if (error) throw error;
  return data;
}
