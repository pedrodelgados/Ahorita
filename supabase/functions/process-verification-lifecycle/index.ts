// Ahorita — ciclo de vida de verificaciones (Fase 2, Bloque B, ver
// PROJECT.md). Pensada para invocarse periódicamente (cron externo), NO
// para que la llame un usuario final. Dos responsabilidades, deliberadamente
// en la misma función porque comparten los mismos datos de entrada
// (verificaciones aprobadas con expires_at próximo o vencido), pero
// completamente independiente de `process-account-deletions` — ningún
// código ni tabla se comparte entre ambas, solo pueden compartir el mismo
// secreto de invocación (CRON_SECRET) sin que eso las acople.
//
// 1. Avisos: 30/15/7 días antes de expires_at, el día de expires_at, y al
//    terminar el periodo de gracia (30 días después) — reutiliza la Edge
//    Function `send-push` ya existente en vez de duplicar su lógica.
// 2. Vencimiento automático: pasa una verificación de 'aprobado' a
//    'vencido' únicamente cuando el periodo de gracia completo ya venció.
//    Esta es la ÚNICA vía por la que 'vencido' puede alcanzarse — ningún
//    admin humano puede hacerlo vía RLS normal (ver 0021, política de
//    administradores con `with check (status <> 'vencido')`).

import { createClient } from "npm:@supabase/supabase-js@2";

const GRACE_PERIOD_DAYS = 30;

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const cronSecret = Deno.env.get("CRON_SECRET")!;

const db = createClient(supabaseUrl, serviceRoleKey);

const NOTICE_OFFSETS_DAYS: Record<string, number> = {
  "30_dias": 30,
  "15_dias": 15,
  "7_dias": 7,
  vencimiento: 0,
};

Deno.serve(async (req) => {
  const providedSecret = req.headers.get("x-cron-secret") ?? "";
  if (!cronSecret || providedSecret !== cronSecret) {
    return jsonResponse({ error: "No autorizado." }, 401);
  }

  try {
    const notices = await sendDueNotices();
    const expired = await expireOverdueVerifications();
    return jsonResponse({ notices, expired });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error.message ?? "Error desconocido" }, 500);
  }
});

async function sendDueNotices() {
  const results: Array<{ verificationId: string; noticeType: string; status: string }> = [];

  const { data: approved, error } = await db
    .from("verifications")
    .select("id, actor_id, expires_at, actors(profile_id)")
    .eq("status", "aprobado")
    .not("expires_at", "is", null);
  if (error) throw error;

  for (const verification of approved ?? []) {
    const expiresAt = new Date(verification.expires_at);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    for (const [noticeType, offsetDays] of Object.entries(NOTICE_OFFSETS_DAYS)) {
      if (daysUntilExpiry !== offsetDays) continue;
      results.push(await trySendNotice(verification, noticeType));
    }

    // Fin de gracia: exactamente GRACE_PERIOD_DAYS después de expires_at.
    const graceDaysElapsed = Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60 * 60 * 24));
    if (graceDaysElapsed === GRACE_PERIOD_DAYS) {
      results.push(await trySendNotice(verification, "fin_gracia"));
    }
  }

  return results;
}

async function trySendNotice(
  verification: { id: string; actor_id: string; actors: { profile_id: string | null } | null },
  noticeType: string
) {
  const userId = verification.actors?.profile_id;
  if (!userId) return { verificationId: verification.id, noticeType, status: "sin_usuario" };

  // Idempotencia: el `unique (verification_id, notice_type)` de
  // verification_notices rechaza un duplicado si ya se envió este aviso.
  const { error: insertError } = await db
    .from("verification_notices")
    .insert({ verification_id: verification.id, notice_type: noticeType, channel: "push" });
  if (insertError) {
    // Código 23505 = violación de unicidad -> ya se envió, no reintentar.
    if (insertError.code === "23505") {
      return { verificationId: verification.id, noticeType, status: "ya_enviado" };
    }
    throw insertError;
  }

  const { title, body } = noticeContent(noticeType);
  await fetch(`${supabaseUrl}/functions/v1/send-push`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${serviceRoleKey}` },
    body: JSON.stringify({ userId, title, body, url: "/perfil" }),
  });

  return { verificationId: verification.id, noticeType, status: "enviado" };
}

function noticeContent(noticeType: string): { title: string; body: string } {
  switch (noticeType) {
    case "30_dias":
      return { title: "Tu verificación vence en 30 días", body: "Renuévala desde tu perfil de negocio." };
    case "15_dias":
      return { title: "Tu verificación vence en 15 días", body: "Renuévala desde tu perfil de negocio." };
    case "7_dias":
      return { title: "Tu verificación vence en 7 días", body: "Renuévala desde tu perfil de negocio." };
    case "vencimiento":
      return {
        title: "Tu verificación vence hoy",
        body: "Tienes 30 días de gracia para renovarla antes de perder la insignia.",
      };
    case "fin_gracia":
      return {
        title: "Tu verificación venció",
        body: "El periodo de gracia terminó. Solicita una renovación cuando quieras.",
      };
    default:
      return { title: "Verificación", body: "" };
  }
}

async function expireOverdueVerifications() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - GRACE_PERIOD_DAYS);

  const { data: overdue, error } = await db
    .from("verifications")
    .select("id")
    .eq("status", "aprobado")
    .lte("expires_at", cutoff.toISOString());
  if (error) throw error;

  const results = [];
  for (const verification of overdue ?? []) {
    const { error: updateError } = await db
      .from("verifications")
      .update({ status: "vencido" })
      .eq("id", verification.id)
      .eq("status", "aprobado");
    if (updateError) {
      console.error(`Fallo al vencer ${verification.id}:`, updateError);
      results.push({ id: verification.id, status: "error", message: updateError.message });
    } else {
      results.push({ id: verification.id, status: "vencido" });
    }
  }
  return results;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}
