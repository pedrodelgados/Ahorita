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
//
// Fase 5B, Bloque 3: los comentarios (a diferencia de los otros seis tipos
// de `interactions`, que sí cascadean con la cuenta) deben sobrevivir a la
// eliminación — mismo principio que ya regía `event_comments` desde el
// Bloque 5 de la Fase 1. Como `interactions.actor_id` tiene
// `on delete cascade`, hay que reasignar explícitamente las filas
// `type = 'comentario'` del actor persona de este usuario al actor de
// sistema "Cuenta eliminada" ANTES de invocar `auth.admin.deleteUser` — una
// vez borrado el usuario, el cascade ya se disparó y no hay nada que
// reasignar.
//
// Fase 7 — cierre (auditoría transversal, hallazgos H2 y H3):
//
// H3 (carrera entre cancelación y procesamiento): antes, este archivo
// primero LEÍA las solicitudes vencidas (`select ... where status =
// 'pendiente'`) y solo al final, una por una, actualizaba su estado — dejando
// una ventana real entre "se decidió procesarla" y "se marcó como tal" donde
// una cancelación legítima de la persona (permitida por RLS mientras
// status = 'pendiente') podía colarse sin que el procesador se enterara.
// Ahora el primer paso es un UPDATE atómico que reclama de una sola vez
// todas las solicitudes vencidas, pasándolas de 'pendiente' a 'en_proceso'
// (el mismo valor de estado que el esquema original de la Fase 1 ya
// preveía, nunca uno nuevo). Postgres serializa esa transición fila por
// fila: si la cancelación de la persona (que exige status = 'pendiente'
// tanto en la política de RLS como en la condición del UPDATE) llega antes
// de que este reclamo tome esa fila, gana la cancelación y el reclamo
// simplemente no la selecciona; si el reclamo llega primero, la cancelación
// ya no encuentra ninguna fila en 'pendiente' que actualizar y no tiene
// ningún efecto. La frontera es exactamente esa transición — antes de ella
// la cancelación siempre se respeta, después de ella la eliminación ya está
// legítimamente en curso y es irreversible.
//
// H2 (idempotencia ante un fallo parcial): antes, si `auth.admin.deleteUser`
// ya tenía éxito pero la actualización final a 'completada' fallaba (un
// timeout, un corte de red), la siguiente ejecución encontraba la misma
// solicitud todavía 'pendiente' (o ahora 'en_proceso', ver arriba) e
// intentaba reasignar comentarios de un actor que la cascada ya había
// borrado — un fallo real, pero tratado como si fuera nuevo, dejando la
// solicitud atrapada para siempre sin poder alcanzar un estado terminal.
// Ahora, antes de reasignar o eliminar, se comprueba explícitamente si el
// perfil de la persona todavía existe. Si ya no existe, la eliminación real
// ya ocurrió en un ciclo anterior (parcialmente): no se reasigna nada de
// nuevo (no hay nada que reasignar, el actor propio ya no existe) ni se
// vuelve a invocar `deleteUser` — se avanza directo a cerrar la solicitud
// como 'completada'. Un fallo real (de reasignación, o de `deleteUser` en
// sí) sigue distinguiéndose con claridad en los resultados y revierte la
// solicitud a 'pendiente' para reintentarse, exactamente como antes.

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cronSecret = Deno.env.get("CRON_SECRET")!;

const db = createClient(supabaseUrl, serviceRoleKey);

async function reassignCommentsToDeletedAccount(userId: string) {
  const { data: deletedAccountActor, error: actorError } = await db
    .from("actors")
    .select("id")
    .eq("type", "sistema")
    .eq("display_name", "Cuenta eliminada")
    .single();
  if (actorError) throw actorError;

  const { data: ownActor, error: ownActorError } = await db
    .from("actors")
    .select("id")
    .eq("profile_id", userId)
    .single();
  if (ownActorError) throw ownActorError;

  const { error: reassignError } = await db
    .from("interactions")
    .update({ actor_id: deletedAccountActor.id })
    .eq("actor_id", ownActor.id)
    .eq("type", "comentario");
  if (reassignError) throw reassignError;
}

async function revertToPending(requestId: string) {
  // Best-effort: si esto también falla, la solicitud queda 'en_proceso' y
  // el próximo ciclo no la reclamará de nuevo (su condición exige
  // 'pendiente') -- se documenta como límite conocido, nunca se oculta.
  await db.from("data_requests").update({ status: "pendiente" }).eq("id", requestId);
}

Deno.serve(async (req) => {
  const providedSecret = req.headers.get("x-cron-secret") ?? "";
  if (!cronSecret || providedSecret !== cronSecret) {
    return jsonResponse({ error: "No autorizado." }, 401);
  }

  try {
    // Reclamo atómico (H3): una sola sentencia que decide, de una vez, qué
    // solicitudes se procesan en este ciclo -- desde este momento, ya no
    // están en 'pendiente' y ninguna cancelación posterior puede afectarlas.
    const { data: claimed, error: claimError } = await db
      .from("data_requests")
      .update({ status: "en_proceso" })
      .eq("type", "eliminacion")
      .eq("status", "pendiente")
      .lte("scheduled_for", new Date().toISOString())
      .select("id, user_id");
    if (claimError) throw claimError;

    const results = [];
    for (const request of claimed ?? []) {
      let accountAlreadyGone = false;
      try {
        // H2: reconocer con seguridad que la cuenta ya no existe (un ciclo
        // anterior ya la eliminó, pero no pudo cerrar la solicitud) --
        // nunca un error, un estado esperable de un fallo parcial previo.
        const { data: existingProfile } = await db
          .from("profiles")
          .select("id")
          .eq("id", request.user_id)
          .maybeSingle();
        accountAlreadyGone = !existingProfile;

        if (!accountAlreadyGone) {
          await reassignCommentsToDeletedAccount(request.user_id);
          const { error: deleteError } = await db.auth.admin.deleteUser(request.user_id);
          if (deleteError) throw deleteError;
        }

        await db
          .from("data_requests")
          .update({ status: "completada", processed_at: new Date().toISOString() })
          .eq("id", request.id);

        results.push({
          id: request.id,
          status: "completada",
          note: accountAlreadyGone ? "cuenta ya eliminada en un ciclo anterior -- solo se cerró la trazabilidad" : undefined,
        });
      } catch (perUserError) {
        // Distinción explícita, nunca oculta: un fallo aquí, con la cuenta
        // ya confirmada inexistente, significa que la eliminación real ya
        // ocurrió y solo faltó cerrar el registro -- se reintentará cerrarlo
        // en el próximo ciclo sin repetir ningún trabajo destructivo. Un
        // fallo con la cuenta todavía existente es un fallo real (de
        // reasignación o de `deleteUser`) que debe reintentarse desde cero.
        console.error(
          accountAlreadyGone
            ? `Solicitud ${request.id}: la cuenta ya no existía, pero no se pudo cerrar la trazabilidad:`
            : `Fallo al eliminar ${request.user_id}:`,
          perUserError
        );
        await revertToPending(request.id);
        results.push({
          id: request.id,
          status: "error",
          message: perUserError.message,
          alreadyProcessedPartially: accountAlreadyGone,
        });
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
