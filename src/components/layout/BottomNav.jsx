import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, User } from "lucide-react";
import { useMyActorId } from "../../hooks/useMyActorId";
import { COLORS } from "../../styles/theme";

const STATIC_TABS = [
  { to: "/", label: "Inicio", Icon: Home, end: true },
  { to: "/explorar", label: "Explorar", Icon: Compass, end: false },
];

// La pestaña "Perfil" ya no es una ruta fija (Entrega 5): el perfil personal
// vive en el mismo sistema unificado que el de negocios, así que apunta
// directo a /actor/:miActorId. Mientras se resuelve (o si no hay sesión),
// cae a /perfil — RequireAuth allí se encarga del login, y una vez resuelto
// el actor, MyProfileRedirectPage hace el salto final.
export default function BottomNav() {
  const location = useLocation();
  const myActorId = useMyActorId();
  const profileTarget = myActorId ? `/actor/${myActorId}` : "/perfil";
  const profileActive = myActorId
    ? location.pathname === profileTarget
    : location.pathname === "/perfil";

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        background: "#FFFFFF",
        borderTop: "1px solid rgba(43, 38, 34, 0.08)",
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {STATIC_TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => tabStyle(isActive)}
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
      <NavLink to={profileTarget} style={tabStyle(profileActive)}>
        <User size={22} />
        Perfil
      </NavLink>
    </nav>
  );
}

function tabStyle(isActive) {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    padding: "2px 20px",
    color: isActive ? COLORS.accent : COLORS.inkSoft,
    fontSize: 11,
    fontWeight: isActive ? 700 : 500,
    textDecoration: "none",
  };
}
