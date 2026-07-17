import { useNavigate } from "react-router-dom";
import { ArrowLeft, BellRing } from "lucide-react";
import { COLORS } from "../styles/theme";

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100svh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", display: "flex" }}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20 }}>Notificaciones</h1>
      </header>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "80px 24px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(232, 120, 92, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <BellRing size={24} color={COLORS.accent} />
        </div>
        <p style={{ color: COLORS.inkSoft, maxWidth: 280, lineHeight: 1.5 }}>
          Las notificaciones push llegan pronto. Por ahora, revisa el feed para ver lo último de las
          personas y lugares que sigues.
        </p>
      </main>
    </div>
  );
}
