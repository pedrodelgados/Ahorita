// Ahorita — Guía IA, Fase 7 Bloque 4: conexión de El Razonador con el Motor
// de Afinidad (Fase 6).
//
// Responsabilidad única: leer, nunca reconstruir, el perfil de Afinidad ya
// calculado por `affinity_profile()` (Fase 6, Bloque 1) y reducirlo a la
// porción realmente pertinente para el turno en curso -- nunca el perfil
// completo (principio de minimización dentro del propio pipeline, ver el
// análisis conceptual del Bloque 4). Solo la dimensión `categoria`; la
// dimensión `actor_seguido` queda explícitamente diferida (ver PROJECT.md)
// hasta que todas las fuentes de contenido de `context.ts` puedan resolver
// `actor_id` de forma homogénea -- `places` no tiene hoy ningún vínculo con
// `actors`, a diferencia de `events`/`editorial`.
//
// Principio arquitectónico permanente: este módulo NUNCA consulta ninguna
// función generadora de contenido (`candidatos_afinidad()`,
// `discoverable_content()`, `compose_feed()`) -- solo `affinity_profile()`,
// que describe preferencia, nunca genera candidatos. La Afinidad nunca
// incrementa el universo de opciones de un turno; solo anota preferencia
// relativa sobre categorías que `context.ts` ya resolvió de forma
// completamente independiente.
//
// Consulta bajo demanda (nunca un prerrequisito del pipeline): quien llama
// a este módulo (index.ts) decide primero, con una compuerta de código sin
// ningún costo de llamada al proveedor de IA, si vale la pena invocarlo en
// absoluto (ownerId existente + contexto de tipo "city"). Este archivo no
// implementa esa compuerta -- solo la lectura y el filtrado, una vez que ya
// se decidió consultar.
//
// Sin memoria propia: se recalcula desde cero en cada turno que decide
// consultar, nunca se cachea entre turnos ni dentro del propio turno más
// allá de construir el prompt de El Razonador.
//
// Acceso: siempre con el propio token de quien llama (nunca la clave de
// servicio) -- mismo patrón ya establecido en memory.ts/permanentKnowledge.ts.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import type { CityContext } from "./context.ts";

export type AffinityConfidence = "alto" | "medio" | "bajo";
export type AffinityEvidenceStatus = "activa" | "historica";
// 'desconocido' nunca llega hasta aquí: affinity_profile() ya excluye esas
// filas de su propio resultado (confirmado en la auditoría técnica de este
// bloque, migración 0037_fase6_bloque1_estado_de_evidencia.sql) -- una
// dimensión sin ninguna afinidad simplemente no aparece en el resultado.
export type AffinityCorrectionState = "activo" | "reiniciado_recientemente";

export type AffinityInsight = {
  category: string;
  refined: boolean;
  confidence: AffinityConfidence;
  evidenceStatus: AffinityEvidenceStatus;
  correctionState: AffinityCorrectionState;
  // Deliberadamente sin `weight`: El Razonador nunca debe ver un número y
  // tratarlo como certeza absoluta -- solo la traducción ya hecha aquí.
};

function callerClient(authHeader: string): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
}

// Resuelve el actor propio de tipo "persona" desde auth.uid() -- mismo
// patrón ya establecido en src/hooks/useMyActorId.js (garantía de la Fase 3,
// Bloque A: todo profile tiene exactamente un actor tipo persona). Nunca
// lanza: sin sesión o sin fila, resuelve a null.
async function resolveOwnActorId(authHeader: string): Promise<string | null> {
  try {
    const client = callerClient(authHeader);
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();
    if (authError || !user) return null;

    const { data, error } = await client
      .from("actors")
      .select("id")
      .eq("profile_id", user.id)
      .eq("type", "persona")
      .single();
    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

function pertinentCategories(context: CityContext): Set<string> {
  const categories = new Set<string>();
  for (const place of context.places) {
    if (place.category) categories.add(place.category);
  }
  for (const event of context.upcomingEvents) {
    if (event.category) categories.add(event.category);
  }
  for (const item of context.editorial) {
    if (item.category) categories.add(item.category);
  }
  return categories;
}

// Lectura para El Razonador: nunca lanza -- un fallo, o la ausencia de
// identidad/afinidad pertinente, degrada honestamente a un conjunto vacío,
// exactamente como si la compuerta de index.ts hubiera decidido no
// consultar en absoluto. Nunca bloquea el turno, nunca fabrica una afinidad
// que no existe.
export async function readAffinityInsights(
  authHeader: string,
  context: CityContext
): Promise<AffinityInsight[]> {
  try {
    const actorId = await resolveOwnActorId(authHeader);
    if (!actorId) return [];

    const relevant = pertinentCategories(context);
    if (relevant.size === 0) return [];

    const client = callerClient(authHeader);
    const { data, error } = await client.rpc("affinity_profile", { check_actor_id: actorId });
    if (error) throw error;

    return (data ?? [])
      .filter(
        (row: { target_kind: string; category: string | null; correction_state: string }) =>
          row.target_kind === "categoria" && row.category !== null && relevant.has(row.category)
      )
      .map(
        (row: {
          category: string;
          refined: boolean;
          confidence: AffinityConfidence;
          evidence_status: AffinityEvidenceStatus;
          correction_state: AffinityCorrectionState;
        }) => ({
          category: row.category,
          refined: row.refined,
          confidence: row.confidence,
          evidenceStatus: row.evidence_status,
          correctionState: row.correction_state,
        })
      );
  } catch (error) {
    console.error("Afinidad: fallo de lectura, se continúa sin afinidad disponible en este turno:", error);
    return [];
  }
}
