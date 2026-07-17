import { flushSync } from "react-dom";

// Envuelve un cambio de estado de React en la View Transitions API nativa
// del navegador (sin dependencias nuevas) para que la navegación se sienta
// continua — p. ej. la foto de una tarjeta del feed "expandiéndose" hacia
// el detalle, en vez de que aparezca un panel encima. Si el navegador no la
// soporta, o el usuario prefiere movimiento reducido, aplica el cambio de
// estado directo, sin animación — nunca bloquea la interacción.
export function withViewTransition(update) {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion || typeof document.startViewTransition !== "function") {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}
