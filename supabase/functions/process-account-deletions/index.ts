// Ahorita — procesamiento de eliminaciones de cuenta vencidas (Bloque 5 de
// la Fase 1, ver PROJECT.md). Pensada para invocarse periódicamente (cron
// externo), NO para que la llame un usuario final: procesa TODAS las
// solicitudes de eliminación cuyo periodo de gracia de 30 días ya venció,
// sin importar de quién sean — por eso exige un secreto compartido en vez
// de derivar un solo usuario de una sesión, a diferencia de
// export-user-data.
//
// borrar el usuario vía la API de administración de Supabase Auth
// (auth.admin.deleteUser) es, en un solo paso, lo que:
//   - invalida todas sus sesiones activas;
//   - revoca sus tokens/refresh tokens;
//   - dispara el `on delete cascade` ya existente sobre profiles/actors/
//     saved_places/saved_events/follows/post_likes/push_subscriptions/
//     interactions;
//   - dispara el `on delete set null` (0019) sobre questions/answers/
//     statuses/event_comments (anonimiza, no borra el contenido de
//     terceros) y sobre businesses.owner_id (el trigger
//     handle_orphaned_business lo pasa a 'sin_propietario').
// No hace falta ningún paso manual adicional para lograr esos efectos.
//
// El borrado del archivo binario en Storage (avatar, fotos) y la
// invalidación de códigos QR quedan fuera de esta función — ver la nota en
// 0019_bloque5_privacidad.sql sobre por qué (Storage necesita su propia
// llamada; QR no existe todavía como entidad en el esquema).

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cronSecret = Deno.env.get("CRON_SECRET")!;

const db = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  const providedSecret = req.headers.get("x-cron-secret") ?? "";
  if (!cronSecret || providedSecret !== cronSecret) {
    return jsonResponse({ error: "No autorizado." }, 401);
  }

  try {
    const { data: dueRequests, error } = await db
      .from("data_requests")
      .select("id, user_id")
      .eq("type", "eliminacion")
      .eq("status", "pendiente")
      .lte("scheduled_for", new Date().toISOString());
    if (error) throw error;

    const results = [];
    for (const request of dueRequests ?? []) {
      try {
        const { error: deleteError } = await db.auth.admin.deleteUser(request.user_id);
        if (deleteError) throw deleteError;

        await db
          .from("data_requests")
          .update({ status: "completada", processed_at: new Date().toISOString() })
          .eq("id", request.id);

        results.push({ id: request.id, status: "completada" });
      } catch (perUserError) {
        // No se marca como fallida: se deja en 'pendiente' para
        // reintentarse en la próxima ejecución, en vez de perder la
        // solicitud silenciosamente por un error transitorio.
        console.error(`Fallo al eliminar ${request.user_id}:`, perUserError);
        results.push({ id: request.id, status: "error", message: perUserError.message });
      }
    }

    return jsonResponse({ processed: results.length, results });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error.message ?? "Error desconocido" }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}
