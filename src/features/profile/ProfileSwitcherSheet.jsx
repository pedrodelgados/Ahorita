import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { getPublicActorProfile, listMyManagedActors } from "../../lib/actorProfile";
import { CHANNELS, COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

// Selector de perfil (Fase 3, Bloque C, Entrega 5): un usuario es siempre un
// único actor persona, pero puede además ser propietario o administrador
// operativo de uno o más actores negocio (Bloque A). Esta hoja es el único
// punto donde se cambia "de quién estoy viendo/actuando el perfil" — se abre
// desde el propio perfil unificado, nunca desde BottomNav directamente.
export default function ProfileSwitcherSheet({ open, onClose, profileId, myActorId, activeActorId }) {
  const navigate = useNavigate();
  const [managed, setManaged] = useState([]);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    if (!open || !profileId) return;
    let cancelled = false;
    listMyManagedActors(profileId)
      .then((list) => {
        if (!cancelled) setManaged(list);
      })
      .catch(() => {
        if (!cancelled) setManaged([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, profileId]);

  useEffect(() => {
    if (!open || !myActorId) return;
    let cancelled = false;
    getPublicActorProfile(myActorId)
      .then((data) => {
        if (!cancelled) setMyProfile(data);
      })
      .catch(() => {
        if (!cancelled) setMyProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, myActorId]);

  function goTo(actorId) {
    onClose();
    navigate(`/actor/${actorId}`);
  }

  function goToRegister() {
    onClose();
    navigate("/negocio/nuevo");
  }

  return (
    <BottomSheet open={open} onClose={onClose}>
      <h2 style={textStyle(TYPE.h2, { margin: "0 0 " + SPACE.md + "px" })}>Cambiar de perfil</h2>

      <SwitcherRow
        active={activeActorId === myActorId}
        label={myProfile?.actor.display_name || "Tú"}
        sublabel="Tu perfil personal"
        imageUrl={myProfile?.profile?.avatar_url}
        fallbackColor={COLORS.accent}
        round
        onClick={() => goTo(myActorId)}
      />

      {managed.map((m) => {
        const channel = CHANNELS.find((c) => c.id === m.business?.category);
        return (
          <SwitcherRow
            key={m.actorId}
            active={activeActorId === m.actorId}
            label={m.displayName}
            sublabel={
              m.role === "propietario"
                ? m.business?.status === "aprobado"
                  ? "Propietario"
                  : "Propietario · en revisión"
                : "Administrador operativo"
            }
            imageUrl={m.business?.image_url}
            fallbackColor={channel?.color ?? COLORS.accent}
            onClick={() => goTo(m.actorId)}
          />
        );
      })}

      <button onClick={goToRegister} style={registerRowStyle}>
        <span style={plusIconStyle}>
          <Plus size={16} color={COLORS.accent} />
        </span>
        <span style={textStyle(TYPE.body, { fontWeight: 600, color: COLORS.accent })}>
          Registrar un negocio
        </span>
      </button>
    </BottomSheet>
  );
}

function SwitcherRow({ active, label, sublabel, imageUrl, fallbackColor, round, onClick }) {
  return (
    <button onClick={onClick} style={rowStyle}>
      {imageUrl ? (
        <ImageWithFallback
          src={imageUrl}
          alt=""
          style={{ width: 44, height: 44, borderRadius: round ? "50%" : 12, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: round ? "50%" : 12,
            background: fallbackColor,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            fontFamily: "var(--font-display)",
            flexShrink: 0,
          }}
        >
          {(label || "?").charAt(0).toUpperCase()}
        </div>
      )}
      <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <span style={textStyle(TYPE.body, { display: "block", fontWeight: 600, color: COLORS.ink })}>{label}</span>
        <span style={textStyle(TYPE.metadata, { display: "block", color: COLORS.inkSoft })}>{sublabel}</span>
      </span>
      {active && <Check size={18} color={COLORS.accent} />}
    </button>
  );
}

const rowStyle = {
  display: "flex",
  alignItems: "center",
  gap: SPACE.sm,
  width: "100%",
  padding: "10px 4px",
  background: "none",
  border: "none",
  borderBottom: `1px solid ${tint(COLORS.inkSoft, 0.12)}`,
  cursor: "pointer",
};

const registerRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: SPACE.sm,
  width: "100%",
  padding: "14px 4px 4px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

const plusIconStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: tint(COLORS.accent, 0.12),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};
