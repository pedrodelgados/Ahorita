import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bookmark, Share2, Phone, MessageCircle, Navigation } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getMyActorInteractions, toggleActorInteraction } from "../../lib/interactions";
import { googleMapsDirectionsUrl } from "../../lib/directions";
import { COLORS, textStyle, TYPE } from "../../styles/theme";

// Barra de acciones (Fase 3, Bloque C, Entrega 2): Seguir es siempre la
// acción principal (sólida, color de acento) — Guardar/Compartir/Llamar/
// WhatsApp/Cómo llegar son íconos secundarios de igual peso entre sí. Los
// botones nunca desaparecen para un visitante (a diferencia de AuthGate):
// se ven siempre, y solo piden iniciar sesión al tocar, igual que el patrón
// ya usado en el feed (FeedCard.requireAuth).
export default function ActionBar({ actor, business }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ following: false, saved: false });

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMyActorInteractions(user.id, actor.id)
      .then((s) => {
        if (!cancelled) setState(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, actor.id]);

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  }

  async function toggleFollow() {
    const next = !state.following;
    setState((s) => ({ ...s, following: next }));
    try {
      await toggleActorInteraction({
        viewerProfileId: user.id,
        targetActorId: actor.id,
        type: "seguimiento",
        active: !next,
      });
    } catch {
      setState((s) => ({ ...s, following: !next }));
    }
  }

  async function toggleSave() {
    const next = !state.saved;
    setState((s) => ({ ...s, saved: next }));
    try {
      await toggleActorInteraction({
        viewerProfileId: user.id,
        targetActorId: actor.id,
        type: "guardado",
        active: !next,
      });
    } catch {
      setState((s) => ({ ...s, saved: !next }));
    }
  }

  async function handleShare() {
    const shareData = {
      title: actor.display_name,
      text: `Mira ${actor.display_name} en Ahorita`,
      url: `${window.location.origin}/actor/${actor.id}`,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* el usuario canceló el share */
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
      <button
        onClick={() => requireAuth(toggleFollow)}
        style={{
          flex: 1,
          background: state.following ? COLORS.surface : COLORS.accent,
          color: state.following ? COLORS.ink : "#FFFFFF",
          border: state.following ? `1.5px solid ${COLORS.borderSubtle}` : "none",
          borderRadius: "var(--radius-full)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "10px 0",
          ...textStyle(TYPE.button, { fontSize: 14 }),
        }}
      >
        <Heart size={14} fill={state.following ? COLORS.accent : "none"} color={state.following ? COLORS.accent : "#FFFFFF"} />
        {state.following ? "Siguiendo" : "Seguir"}
      </button>

      <IconButton onClick={() => requireAuth(toggleSave)} label="Guardar" active={state.saved}>
        <Bookmark size={17} fill={state.saved ? COLORS.ink : "none"} />
      </IconButton>
      <IconButton onClick={handleShare} label="Compartir">
        <Share2 size={17} />
      </IconButton>
      {business?.phone && (
        <IconButton as="a" href={`tel:${business.phone}`} label="Llamar">
          <Phone size={17} />
        </IconButton>
      )}
      {business?.whatsapp && (
        <IconButton as="a" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" label="WhatsApp">
          <MessageCircle size={17} />
        </IconButton>
      )}
      {business?.lat && business?.lng && (
        <IconButton as="a" href={googleMapsDirectionsUrl(business.lat, business.lng)} target="_blank" label="Cómo llegar">
          <Navigation size={17} />
        </IconButton>
      )}
    </div>
  );
}

function IconButton({ children, onClick, as: As = "button", active, label, ...props }) {
  return (
    <As
      onClick={onClick}
      aria-label={label}
      rel={As === "a" ? "noreferrer" : undefined}
      style={{
        width: 38,
        height: 38,
        borderRadius: "50%",
        border: `1.5px solid ${COLORS.borderSubtle}`,
        background: active ? COLORS.borderSubtle : "transparent",
        color: COLORS.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      {...props}
    >
      {children}
    </As>
  );
}
