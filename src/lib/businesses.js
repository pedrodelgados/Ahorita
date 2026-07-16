import { supabase } from "./supabaseClient";

export async function listMyBusinesses(ownerId) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createBusiness(payload) {
  const { data, error } = await supabase.from("businesses").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function listPendingBusinesses() {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("status", "pendiente")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function setBusinessStatus(businessId, status) {
  const { data, error } = await supabase
    .from("businesses")
    .update({ status })
    .eq("id", businessId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteBusiness(businessId) {
  const { error } = await supabase.from("businesses").delete().eq("id", businessId);
  if (error) throw error;
}
