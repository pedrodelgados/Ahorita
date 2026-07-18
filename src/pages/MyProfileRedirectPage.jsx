import { Navigate } from "react-router-dom";
import { useMyActorId } from "../hooks/useMyActorId";

// "/perfil" deja de ser una pantalla propia (Entrega 5: el perfil personal
// se unificó al mismo sistema que el de negocios) pero se conserva como
// punto de entrada estable — BusinessRegisterPage y AdminPage siguen
// enlazando aquí, y cualquier marcador guardado externamente sigue
// funcionando — resolviendo siempre al actor persona actual.
export default function MyProfileRedirectPage() {
  const myActorId = useMyActorId();
  if (!myActorId) return null;
  return <Navigate to={`/actor/${myActorId}`} replace />;
}
