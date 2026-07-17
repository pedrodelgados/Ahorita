// Ahorita — envío de notificaciones push
// Único lugar que conoce la clave privada VAPID. Recibe un userId + el
// contenido de la notificación, y se la manda a todas las suscripciones
// guardadas de ese usuario.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") ?? "mailto:hola@ahorita.app",
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId, title, body, url } = await req.json();
    if (!userId || !title) {
      return jsonResponse({ error: "Faltan 'userId' o 'title'." }, 400);
    }

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;

    const payload = JSON.stringify({ title, body: body ?? "", url: url ?? "/" });

    const results = await Promise.allSettled(
      (subscriptions ?? []).map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );

    // Una suscripción caducada/inválida devuelve 404/410 — se elimina para no
    // reintentarla en el futuro.
    await Promise.all(
      results.map((result, i) => {
        if (result.status === "rejected" && [404, 410].includes(result.reason?.statusCode)) {
          return supabase.from("push_subscriptions").delete().eq("id", subscriptions[i].id);
        }
        return Promise.resolve();
      })
    );

    return jsonResponse({ sent: results.filter((r) => r.status === "fulfilled").length });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error.message ?? "Error desconocido" }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
