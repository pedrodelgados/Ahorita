import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isPushSupported,
  getPushSubscriptionStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from "../../lib/push";
import { COLORS } from "../../styles/theme";

export default function PushToggle({ userId }) {
  const [status, setStatus] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    getPushSubscriptionStatus().then(setStatus);
  }, []);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      if (status === "subscribed") {
        await unsubscribeFromPush();
        setStatus("unsubscribed");
      } else {
        await subscribeToPush(userId);
        setStatus("subscribed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "unsupported" || status === "checking") return null;

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(43, 38, 34, 0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {status === "subscribed" ? (
            <Bell size={16} color={COLORS.accent} />
          ) : (
            <BellOff size={16} color={COLORS.inkSoft} />
          )}
          <span style={{ fontSize: 13 }}>Notificaciones push</span>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 13, fontWeight: 600 }}
        >
          {status === "subscribed" ? "Desactivar" : "Activar"}
        </button>
      </div>
      {error && <p style={{ fontSize: 11, color: "#c0392b", marginTop: 6 }}>{error}</p>}
    </div>
  );
}
