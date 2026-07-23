// Ahorita — Guía IA, Fase 7 Bloque 3: Conocimiento Permanente de la Persona,
// no-afinidad.
//
// Responsabilidad única: leer los hechos vigentes de una persona autenticada
// para que El Razonador los consulte, y ejecutar las acciones explícitas de
// guardado/corrección/borrado que la persona ya confirmó en un paso de
// interfaz separado -- este módulo nunca decide qué guardar, nunca escribe
// por iniciativa propia. El Razonador solo PROPONE un candidato
// (`PermanentKnowledgeCandidate`, decision.ts) -- nunca invoca directamente
// `saveFact`.
//
// Invitados: ninguna función de este archivo se invoca para ellos -- sin
// identidad autenticada no hay ningún hecho que leer ni ninguna acción que
// ejecutar (estructuralmente imposible, no una verificación especial).
//
// Acceso: siempre con el propio token de quien llama (nunca la clave de
// servicio) -- mismo patrón ya establecido en memory.ts (Bloque 2). Las
// funciones `security definer` de la migración derivan la identidad
// exclusivamente de auth.uid(); ningún parámetro de owner viaja desde aquí.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export type SensitivityLevel = "baja" | "media" | "alta" | "reforzada";

export type PermanentFact = {
  category: string;
  subtype: string;
  value: string;
  sensitivityLevel: SensitivityLevel;
  reconfirmationRelevant: boolean;
  purposeTemplate: string;
  confirmedAt: string;
};

export type AuditEntry = {
  operation: string;
  category: string | null;
  subtype: string | null;
  occurredAt: string;
};

function callerClient(authHeader: string): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
}

// Lectura para El Razonador: nunca lanza -- un fallo degrada a un conjunto
// vacío, nunca bloquea el turno ni fabrica un hecho que no existe.
export async function readPermanentFacts(authHeader: string): Promise<PermanentFact[]> {
  try {
    const client = callerClient(authHeader);
    const { data, error } = await client.rpc("pk_get_facts");
    if (error) throw error;
    return (data ?? []).map(
      (row: {
        category: string;
        subtype: string;
        value: string;
        sensitivity_level: SensitivityLevel;
        reconfirmation_relevant: boolean;
        purpose_template: string;
        confirmed_at: string;
      }) => ({
        category: row.category,
        subtype: row.subtype,
        value: row.value,
        sensitivityLevel: row.sensitivity_level,
        reconfirmationRelevant: row.reconfirmation_relevant,
        purposeTemplate: row.purpose_template,
        confirmedAt: row.confirmed_at,
      })
    );
  } catch (error) {
    console.error("Conocimiento Permanente: fallo de lectura, se continúa sin hechos disponibles en este turno:", error);
    return [];
  }
}

// Escritura: se invoca EXCLUSIVAMENTE tras una acción explícita de interfaz
// (la persona confirmó un candidato ya mostrado) -- nunca como efecto de una
// respuesta conversacional. `reinforcedConfirmationShown` debe reflejar
// honestamente si el frontend mostró el segundo diálogo de confirmación para
// categorías reforzadas -- la función de base de datos rechaza la escritura
// si no corresponde.
export async function savePermanentFact(
  authHeader: string,
  category: string,
  subtype: string,
  value: string,
  reinforcedConfirmationShown: boolean
): Promise<{ saved: boolean; error?: string }> {
  try {
    const client = callerClient(authHeader);
    const { error } = await client.rpc("pk_save_fact", {
      p_category: category,
      p_subtype: subtype,
      p_value: value,
      p_reinforced_confirmation_shown: reinforcedConfirmationShown,
    });
    if (error) throw error;
    return { saved: true };
  } catch (error) {
    console.error("Conocimiento Permanente: fallo al guardar:", error);
    return { saved: false, error: error instanceof Error ? error.message : "Error desconocido" };
  }
}

export async function deletePermanentFact(
  authHeader: string,
  category: string,
  subtype: string,
  asRevocation: boolean
): Promise<{ deleted: boolean }> {
  try {
    const client = callerClient(authHeader);
    const { error } = await client.rpc("pk_delete_fact", {
      p_category: category,
      p_subtype: subtype,
      p_as_revocation: asRevocation,
    });
    if (error) throw error;
    return { deleted: true };
  } catch (error) {
    console.error("Conocimiento Permanente: fallo al borrar:", error);
    return { deleted: false };
  }
}

export async function deleteAllPermanentFacts(authHeader: string): Promise<{ deleted: boolean; count: number }> {
  try {
    const client = callerClient(authHeader);
    const { data, error } = await client.rpc("pk_delete_all_facts");
    if (error) throw error;
    return { deleted: true, count: (data as number) ?? 0 };
  } catch (error) {
    console.error("Conocimiento Permanente: fallo al borrar todo:", error);
    return { deleted: false, count: 0 };
  }
}

// Transparencia: resumen ya traducible, nunca el valor (que nunca se guardó
// en la auditoría) -- misma disciplina de degradación honesta ante un fallo.
export async function readAuditSummary(authHeader: string): Promise<AuditEntry[]> {
  try {
    const client = callerClient(authHeader);
    const { data, error } = await client.rpc("pk_get_audit_summary");
    if (error) throw error;
    return (data ?? []).map((row: { operation: string; category: string | null; subtype: string | null; occurred_at: string }) => ({
      operation: row.operation,
      category: row.category,
      subtype: row.subtype,
      occurredAt: row.occurred_at,
    }));
  } catch (error) {
    console.error("Conocimiento Permanente: fallo al leer el resumen de auditoría:", error);
    return [];
  }
}
