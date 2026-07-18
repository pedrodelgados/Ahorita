-- Fase 3 (ver MASTERPLAN.md), Bloque C, Entrega 1: perfil público unificado.
-- Aditivo: no toca ninguna tabla ni política existente.
--
-- Hallazgo encontrado durante el análisis previo a esta entrega (ver el
-- intercambio explícito con el Product Owner antes de implementar): la
-- tabla `verifications` (Fase 2) es intencionalmente privada — solo el
-- propio actor o un administrador pueden leerla (`evidence_ref`,
-- `internal_notes`, `rejection_reason`, `revocation_reason` son datos
-- sensibles). Pero el Bloque C exige que CUALQUIER visitante, incluso
-- anónimo, vea la insignia de verificación calculada en vivo en el perfil
-- público. Solución aprobada explícitamente: una función `security definer`
-- estrecha que devuelve ÚNICAMENTE el estado calculado — nunca una fila de
-- `verifications`, nunca un campo sensible. La tabla en sí sigue sin
-- ninguna política pública nueva; esta es la única superficie nueva.
--
-- Cuatro estados calculados (más granulares que los tres "estados de
-- confianza para la IA" de AI_PHILOSOPHY.md — esa distinción de tres
-- estados sigue rigiendo cómo razona la Guía IA; esta función es para la
-- insignia VISUAL del perfil, un nivel de detalle distinto y compatible):
--   - 'vigente': aprobado, dentro de su vigencia (expires_at en el futuro).
--   - 'en_gracia': aprobado, ya vencido pero todavía no procesado por el
--     Edge Function automático (el status permanece 'aprobado' durante los
--     30 días de gracia, ver Fase 2 Bloque B).
--   - 'vencida': status = 'vencido'.
--   - 'no_verificado': cualquier otro caso (pendiente/en_revision/
--     rechazado/revocado, o ninguna verificación solicitada nunca).
-- Decisión de producto tomada en esta entrega (no una bifurcación de
-- arquitectura/permisos, solo tratamiento visual): el badge público
-- muestra "Verificado" tanto en 'vigente' como en 'en_gracia' (para el
-- público, el negocio sigue siendo confiable durante la gracia; el matiz
-- de urgencia de renovación es información para el propietario, no para
-- el público) y no muestra ninguna insignia en 'vencida'/'no_verificado'
-- (ver AI_PHILOSOPHY.md: la verificación es una señal de desempate, nunca
-- una acusación pública de "no confiable").
create function public.actor_verification_badge(check_actor_id uuid)
returns text
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (
      select case
        when v.status = 'aprobado' and v.expires_at > now() then 'vigente'
        when v.status = 'aprobado' and v.expires_at <= now() then 'en_gracia'
        when v.status = 'vencido' then 'vencida'
        else 'no_verificado'
      end
      from public.verifications v
      where v.actor_id = check_actor_id
      order by v.requested_at desc
      limit 1
    ),
    'no_verificado'
  );
$$;
