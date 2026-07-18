import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bookmark, Share2, Phone, MessageCircle, Navigation } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, textStyle, TYPE } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import DirectionsSection from "../places/DirectionsSection";

// Barra de acciones (Fase 3, Bloque C). Entrega 2: Seguir es siempre la
// acción principal (sólida, color de acento) — Guardar/Compartir/Llamar/
// WhatsApp/Cómo llegar son íconos secundarios de igual peso entre sí. Los
// botones nunca desaparecen para un visitante (a diferencia de AuthGate):
// se ven siempre, y solo piden iniciar sesión al tocar, igual que el patrón
// ya usado en el feed (FeedCard.requireAuth).
//
// Entrega 6 (consolidación): el estado de Seguir/Guardar/contadores ya no
// vive aquí — se recibe como `social` (useActorSocialState), instanciado
// una sola vez en ActorProfilePage y compartido con ActivityStrip, para que
// togglear un botón actualice el contador al instante sin recargar nada.
// `blocked` oculta Seguir/Guardar cuando el actor visto es "mío" (mi propia
// persona, o un negocio que poseo/administro) — la base de datos ya lo
// impide (migración 0027), pero no tiene sentido ni mostrar el botón.
// "Cómo llegar" ahora abre una hoja con el mismo `DirectionsSection`
// completo (distancia/tiempo/Uber/transporte) que ya usan los lugares, en
// vez de un enlace directo a Google Maps.
export default function ActionBar({ actor, business, zone, social, blocked }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDirections, setShowDirections] = useState(false);
  const { mine, busy, error, toggleFollow, toggleSave } = social;

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
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

  const directionsPlace = business?.lat && business?.lng
    ? { lat: business.lat, lng: business.lng, name: business.name, area: zone?.name }
    : null;

  if (!business && blocked) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {!blocked && (
          <button
            onClick={() => requireAuth(toggleFollow)}
            disabled={busy.following}
            aria-pressed={mine.following}
            style={{
              flex: 1,
              background: mine.following ? COLORS.surface : COLORS.accent,
              color: mine.following ? COLORS.ink : "#FFFFFF",
              border: mine.following ? `1.5px solid ${COLORS.borderSubtle}` : "none",
              borderRadius: "var(--radius-full)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "10px 0",
              opacity: busy.following ? 0.6 : 1,
              ...textStyle(TYPE.button, { fontSize: 14 }),
            }}
          >
            <Heart size={14} fill={mine.following ? COLORS.accent : "none"} color={mine.following ? COLORS.accent : "#FFFFFF"} />
            {mine.following ? "Siguiendo" : "Seguir"}
          </button>
        )}

        {business && (
          <>
            {!blocked && (
              <IconButton onClick={() => requireAuth(toggleSave)} label="Guardar" active={mine.saved} disabled={busy.saved} pressed={mine.saved}>
                <Bookmark size={17} fill={mine.saved ? COLORS.ink : "none"} />
              </IconButton>
            )}
            <IconButton onClick={handleShare} label="Compartir">
              <Share2 size={17} />
            </IconButton>
            {business.phone && (
              <IconButton as="a" href={`tel:${business.phone}`} label="Llamar">
                <Phone size={17} />
              </IconButton>
            )}
            {business.whatsapp && (
              <IconButton as="a" href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} target="_blank" label="WhatsApp">
                <MessageCircle size={17} />
              </IconButton>
            )}
            {directionsPlace && (
              <IconButton onClick={() => setShowDirections(true)} label="Cómo llegar">
                <Navigation size={17} />
              </IconButton>
            )}
          </>
        )}
      </div>

      {error && (
        <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: "6px 0 0" })} role="alert">
          {error}
        </p>
      )}

      <BottomSheet open={showDirections} onClose={() => setShowDirections(false)}>
        {directionsPlace && <DirectionsSection place={directionsPlace} />}
      </BottomSheet>
    </div>
  );
}

function IconButton({ children, onClick, as: As = "button", active, pressed, disabled, label, ...props }) {
  return (
    <As
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      disabled={As === "button" ? disabled : undefined}
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
        opacity: disabled ? 0.6 : 1,
      }}
      {...props}
    >
      {children}
    </As>
  );
}
