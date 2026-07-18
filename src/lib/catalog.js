import { supabase } from "./supabaseClient";

const UNASSIGNED_COLLECTION = { id: null, name: "Catálogo" };

// Catálogo agrupado por colección (Fase 3, Bloque B) — colecciones flexibles
// definidas por cada negocio, nunca una taxonomía fija por rubro. Los ítems
// sin colección se agrupan bajo una colección genérica ("Catálogo") en vez
// de perderse.
export async function listBusinessCatalog(businessId) {
  const [{ data: collections, error: collectionsError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("business_catalog_collections")
        .select("*")
        .eq("business_id", businessId)
        .order("display_order", { ascending: true }),
      supabase
        .from("business_catalog_items")
        .select("*")
        .eq("business_id", businessId)
        .eq("is_visible", true)
        .order("display_order", { ascending: true }),
    ]);
  if (collectionsError) throw collectionsError;
  if (itemsError) throw itemsError;

  const byCollection = new Map();
  for (const item of items) {
    const key = item.collection_id ?? "unassigned";
    if (!byCollection.has(key)) byCollection.set(key, []);
    byCollection.get(key).push(item);
  }

  const shelves = collections
    .map((c) => ({ collection: c, items: byCollection.get(c.id) ?? [] }))
    .filter((shelf) => shelf.items.length > 0);

  const unassigned = byCollection.get("unassigned") ?? [];
  if (unassigned.length > 0) {
    shelves.push({ collection: UNASSIGNED_COLLECTION, items: unassigned });
  }

  return shelves;
}

export function formatItemPrice(item) {
  if (item.price_type === "variable" || item.price == null) return "Consultar";
  const amount = Number(item.price).toFixed(2);
  return item.price_type === "desde" ? `Desde $${amount}` : `$${amount}`;
}
