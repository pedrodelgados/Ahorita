import { supabase } from "./supabaseClient";

// Fase 7, Bloque 5 (Experiencia unificada de transparencia, corrección y
// borrado): capa de datos de la única experiencia de privacidad en Ajustes.
// Reutiliza exactamente el mecanismo ya construido en la Fase 1, Bloque 5
// (export-user-data, data_requests, consent_records) -- este módulo no
// introduce ningún mecanismo nuevo, solo lo expone desde la interfaz por
// primera vez.

export async function getDataRequests(userId) {
  const { data, error } = await supabase
    .from("data_requests")
    .select("id, type, status, requested_at, scheduled_for, cancelled_at, processed_at")
    .eq("user_id", userId)
    .order("requested_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Entrega el archivo exportado usando el mecanismo oficial de exportación
// ya construido (export-user-data): el propio token de la sesión, nunca un
// userId enviado por el cliente. Se registra en consent_records solo tras
// una exportación ya completada con éxito -- el registro de trazabilidad
// nunca debe reflejar un intento fallido.
export async function requestAccountExport(userId) {
  const { data, error } = await supabase.functions.invoke("export-user-data");
  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  await supabase
    .from("consent_records")
    .insert({ user_id: userId, event_type: "exportacion_solicitada" });

  return data;
}

// Solicita la eliminación de la cuenta -- data_requests.scheduled_for se
// calcula del lado del servidor (migración 0045), nunca aquí: esta función
// nunca envía scheduled_for. Se registra también en consent_records, como
// evidencia de consentimiento separada del flujo de trabajo de
// data_requests (mismo principio de separación ya usado en el Bloque 5
// original de la Fase 1).
//
// Cierre de Fase 7 (hallazgo H1): el índice único parcial de la migración
// 0046 garantiza, del lado del servidor, que nunca exista más de una
// solicitud pendiente por persona. Un doble envío real (dos clics antes de
// que el primero resuelva) golpea esa restricción con una violación de
// unicidad (código Postgres 23505) -- se reconoce explícitamente ese caso y
// se responde con la solicitud pendiente que ya existe, nunca con un error
// críptico: para la persona, el resultado de ambos clics es exactamente el
// mismo, una única solicitud pendiente.
export async function requestAccountDeletion(userId) {
  const { data, error } = await supabase
    .from("data_requests")
    .insert({ user_id: userId, type: "eliminacion" })
    .select("id, type, status, requested_at, scheduled_for")
    .single();

  if (error) {
    if (error.code === "23505") {
      const requests = await getDataRequests(userId);
      const pending = requests.find((r) => r.type === "eliminacion" && r.status === "pendiente");
      if (pending) return pending;
    }
    throw error;
  }

  await supabase
    .from("consent_records")
    .insert({ user_id: userId, event_type: "eliminacion_solicitada" });

  return data;
}

// Cancela una solicitud propia mientras siga "pendiente" -- la política RLS
// ya impide cancelar una solicitud ajena o una que ya no esté pendiente.
export async function cancelAccountDeletion(requestId) {
  const { error } = await supabase
    .from("data_requests")
    .update({ status: "cancelada", cancelled_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pendiente");
  if (error) throw error;
}
