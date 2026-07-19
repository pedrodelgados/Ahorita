import { useAuth } from "../contexts/AuthContext";
import { registerShare } from "../lib/interactions";

// Fase 4, Bloque 4: un único hook para las cuatro superficies que hoy
// comparten contenido (Evento, Publicación, Promoción, Perfil de persona o
// negocio) — antes cada tarjeta tenía su propia copia casi idéntica de
// navigator.share/clipboard, y ninguna registraba una señal real. A
// propósito, compartir NUNCA se bloquea por falta de sesión (a diferencia de
// me gusta/guardar, que sí exigen iniciar sesión): un invitado comparte
// exactamente igual que alguien con sesión — la interacción solo se
// registra cuando hay una sesión real, y un fallo al registrarla nunca
// interrumpe ni revierte el compartir que ya ocurrió (el compartir ya pasó;
// el registro es una señal secundaria, no la acción principal).
//
// Distingue tres desenlaces para que quien llama decida si corresponde un
// mensaje: "shared" (compartido con éxito, o enlace copiado con éxito),
// "cancelled" (el usuario cerró el diálogo nativo — nunca es un error, nunca
// se muestra mensaje), "failed" (un fallo real de navigator.share o de
// clipboard — sí amerita un mensaje breve, no técnico).
export function useShareContent() {
  const { user, isAuthenticated } = useAuth();

  async function share({ targetType, targetId, title, text, url }) {
    let status;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        status = "shared";
      } catch (err) {
        status = err?.name === "AbortError" ? "cancelled" : "failed";
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        status = "shared";
      } catch {
        status = "failed";
      }
    }

    if (status === "shared" && isAuthenticated) {
      try {
        await registerShare({ viewerProfileId: user.id, targetType, targetId });
      } catch {
        /* el compartir ya ocurrió; el registro es una señal secundaria y silenciosa */
      }
    }

    return { status };
  }

  return { share };
}
