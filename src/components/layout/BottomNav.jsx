import { NavLink } from "react-router-dom";
import { Home, Compass, User } from "lucide-react";
import { COLORS } from "../../styles/theme";

const TABS = [
  { to: "/", label: "Inicio", Icon: Home, end: true },
  { to: "/explorar", label: "Explorar", Icon: Compass, end: false },
  { to: "/perfil", label: "Perfil", Icon: User, end: false },
];

export default function BottomNav() {
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
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "2px 20px",
            color: isActive ? COLORS.accent : COLORS.inkSoft,
            fontSize: 11,
            fontWeight: isActive ? 700 : 500,
            textDecoration: "none",
          })}
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
