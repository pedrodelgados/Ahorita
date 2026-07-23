// Ahorita — exportación de datos personales (Bloque 5 de la Fase 1, ver
// PROJECT.md). Entrega en JSON exactamente los datos del usuario que llama,
// nunca los de otro: el usuario SIEMPRE se deriva del token de la sesión que
// hace la llamada (auth.getUser con ese token), jamás de un parámetro que
// mande el cliente — aceptar un userId del cliente aquí sería exactamente
// la vulnerabilidad de acceso indebido a datos ajenos que este bloque busca
// evitar.

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return jsonResponse({ error: "Falta el token de la sesión." }, 401);

    // Cliente con la anon key + el token de quien llama: auth.getUser()
    // valida el JWT contra Supabase Auth y devuelve el usuario real dueño
    // de esa sesión — es la única fuente de verdad sobre "quién es".
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const {
      data: { user },
      error: authError,
    } = await callerClient.auth.getUser();
    if (authError || !user) return jsonResponse({ error: "Sesión inválida." }, 401);

    const userId = user.id;

    // Cliente con service role: hace falta para leer varias tablas sin
    // depender de que cada política RLS individual ya contemple este caso
    // (por ejemplo, push_subscriptions no tiene política de SELECT propia
    // para el usuario hoy) — pero cada consulta de abajo está filtrada
    // explícitamente por el userId ya verificado arriba, nunca por uno que
    // mande el cliente.
    const db = createClient(supabaseUrl, serviceRoleKey);

    const [
      profile,
      businesses,
      questions,
      answers,
      statuses,
      eventComments,
      createdEvents,
      createdPlaces,
      savedPlaces,
      savedEvents,
      follows,
      postLikes,
      consentRecords,
      dataRequests,
      aiActiveConversation,
      aiConversationTurns,
      permanentKnowledgeFacts,
      permanentKnowledgeAuditLog,
    ] = await Promise.all([
      db.from("profiles").select("*").eq("id", userId).maybeSingle(),
      db.from("businesses").select("*").eq("owner_id", userId),
      db.from("questions").select("*").eq("author_id", userId),
      db.from("answers").select("*").eq("author_id", userId),
      db.from("statuses").select("*").eq("author_id", userId),
      db.from("event_comments").select("*").eq("author_id", userId),
      db.from("events").select("*").eq("created_by", userId),
      db.from("places").select("*").eq("created_by", userId),
      db.from("saved_places").select("place_id, created_at").eq("user_id", userId),
      db.from("saved_events").select("event_id, created_at").eq("user_id", userId),
      db.from("follows").select("followed_id, created_at").eq("follower_id", userId),
      db.from("post_likes").select("target_type, target_id, created_at").eq("user_id", userId),
      db.from("consent_records").select("*").eq("user_id", userId).order("created_at"),
      db.from("data_requests").select("*").eq("user_id", userId).order("requested_at"),
      // Fase 7, Bloque 2 (Memoria de Sesión): nace exportable desde el
      // origen. Solo la conversación activa -- este bloque no construye
      // ningún historial de conversaciones ya cerradas.
      db
        .from("ai_active_conversations")
        .select("status, started_at, last_activity_at")
        .eq("owner_id", userId)
        .maybeSingle(),
      db
        .from("ai_conversation_turns")
        .select("turn_role, content, retracted_at, created_at")
        .eq("owner_id", userId)
        .order("created_at"),
      // Fase 7, Bloque 3 (Conocimiento Permanente no-afinidad): nace
      // exportable desde el origen -- solo lo legítimo de mostrarle a la
      // propia persona (nunca columnas internas). El registro de
      // trazabilidad nunca incluyó el valor, así que exportarlo tal cual es
      // seguro (mismas columnas que expone pk_get_audit_summary()).
      db
        .from("permanent_knowledge_facts")
        .select("category, subtype, value, consented_at, confirmed_at")
        .eq("owner_id", userId)
        .order("category"),
      db
        .from("permanent_knowledge_audit_log")
        .select("operation, category, subtype, occurred_at")
        .eq("owner_id", userId)
        .order("occurred_at"),
    ]);

    const firstError = [
      profile,
      businesses,
      questions,
      answers,
      statuses,
      eventComments,
      createdEvents,
      createdPlaces,
      savedPlaces,
      savedEvents,
      follows,
      postLikes,
      consentRecords,
      dataRequests,
      aiActiveConversation,
      aiConversationTurns,
      permanentKnowledgeFacts,
      permanentKnowledgeAuditLog,
    ].find((r) => r.error)?.error;
    if (firstError) throw firstError;

    return jsonResponse({
      generated_at: new Date().toISOString(),
      profile: profile.data,
      businesses: businesses.data,
      questions: questions.data,
      answers: answers.data,
      statuses: statuses.data,
      event_comments: eventComments.data,
      events_created: createdEvents.data,
      places_created: createdPlaces.data,
      saved_places: savedPlaces.data,
      saved_events: savedEvents.data,
      follows: follows.data,
      post_likes: postLikes.data,
      consent_records: consentRecords.data,
      data_requests: dataRequests.data,
      ai_guide_active_conversation: aiActiveConversation.data,
      ai_guide_conversation_turns: aiConversationTurns.data,
      ai_guide_permanent_knowledge: permanentKnowledgeFacts.data,
      ai_guide_permanent_knowledge_history: permanentKnowledgeAuditLog.data,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: error.message ?? "Error desconocido" }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
}
