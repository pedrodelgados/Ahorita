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
        .eq("is_visible", true)
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

// ---------------------------------------------------------------------------
// Edición (Fase 3, Bloque C, Entrega 4). A diferencia de listBusinessCatalog
// (perfil público, solo visibles), el editor necesita ver TODO —
// colecciones e ítems ocultos incluidos — para poder mostrarlos y permitir
// volver a mostrarlos.
// ---------------------------------------------------------------------------

export async function listCollectionsForEditor(businessId) {
  const { data, error } = await supabase
    .from("business_catalog_collections")
    .select("*")
    .eq("business_id", businessId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function listItemsForEditor(businessId) {
  const { data, error } = await supabase
    .from("business_catalog_items")
    .select("*")
    .eq("business_id", businessId)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCollection(businessId, { name, displayOrder }) {
  const { data, error } = await supabase
    .from("business_catalog_collections")
    .insert({ business_id: businessId, name, display_order: displayOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCollection(id, patch) {
  const { data, error } = await supabase
    .from("business_catalog_collections")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(id) {
  const { error } = await supabase.from("business_catalog_collections").delete().eq("id", id);
  if (error) throw error;
}

// Reasigna los ítems de una colección a "sin colección" antes de eliminarla
// — la decisión explícita que se le pide al usuario en vez de dejar que el
// on delete set null de la base de datos lo haga en silencio.
export async function moveItemsOutOfCollection(collectionId) {
  const { error } = await supabase
    .from("business_catalog_items")
    .update({ collection_id: null })
    .eq("collection_id", collectionId);
  if (error) throw error;
}

async function setCollectionOrder(id, displayOrder) {
  const { error } = await supabase.from("business_catalog_collections").update({ display_order: displayOrder }).eq("id", id);
  if (error) throw error;
}

export async function swapCollectionOrder(a, b) {
  await Promise.all([setCollectionOrder(a.id, b.display_order), setCollectionOrder(b.id, a.display_order)]);
}

export async function createItem(businessId, payload) {
  const { data, error } = await supabase
    .from("business_catalog_items")
    .insert({ business_id: businessId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id, patch) {
  const { data, error } = await supabase
    .from("business_catalog_items")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase.from("business_catalog_items").delete().eq("id", id);
  if (error) throw error;
}

async function setItemOrder(id, displayOrder) {
  const { error } = await supabase.from("business_catalog_items").update({ display_order: displayOrder }).eq("id", id);
  if (error) throw error;
}

export async function swapItemOrder(a, b) {
  await Promise.all([setItemOrder(a.id, b.display_order), setItemOrder(b.id, a.display_order)]);
}
