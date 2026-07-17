import { useEffect } from "react";

// Confirma antes de salir si hay cambios sin guardar: cubre cerrar/recargar
// la pestaña (beforeunload) y el botón atrás del navegador/gesto (popstate,
// interceptado con una entrada de historial "señuelo"). La navegación
// interna del propio editor (botón de volver) se guarda aparte porque ahí sí
// controlamos el clic directamente.
export function useUnsavedChangesGuard(dirty, onBlockedBack) {
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    window.history.pushState(null, "", window.location.href);
    function handlePopState() {
      window.history.pushState(null, "", window.location.href);
      onBlockedBack();
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dirty, onBlockedBack]);
}
