import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Envuelve acciones que requieren cuenta (guardar, comentar, publicar, dar like).
// Los visitantes ven una invitación a iniciar sesión en vez de la acción.
export default function AuthGate({ children, prompt = "Inicia sesión para continuar" }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return children;

  return (
    <Link to="/login" style={{ fontSize: 13, color: "#E8785C", fontWeight: 600 }}>
      {prompt}
    </Link>
  );
}
