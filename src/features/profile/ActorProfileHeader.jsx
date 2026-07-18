import { useEffect, useState } from "react";
import { getActorVerificationBadge } from "../../lib/actorProfile";
import { CHANNELS, COLORS, SPACE, textStyle, TYPE, tint } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import VerificationBadge from "./VerificationBadge";

// Tarjeta de identidad del perfil público unificado (Fase 3, Bloque C): la
// misma forma visual sirve para un actor persona o negocio — el eje
// unificador es actor_id, no profiles/businesses por separado (ver
// PROJECT.md, Fase 3 Bloque A). Solo identidad (foto/portada/nombre/bio/
// categoría/insignia) — el estado abierto/cerrado vive en ActivityStrip y
// la dirección en AboutSection (Entrega 2), para no repetir el mismo dato
// dos veces en la misma pantalla.
export default function ActorProfileHeader({ actor, details, profile, business }) {
  const [badge, setBadge] = useState(null);
  const isPersona = actor.type === "persona";

  useEffect(() => {
    if (isPersona) return;
    let cancelled = false;
    getActorVerificationBadge(actor.id)
      .then((s) => {
        if (!cancelled) setBadge(s);
      })
      .catch(() => {
        if (!cancelled) setBadge(null);
      });
    return () => {
      cancelled = true;
    };
  }, [actor.id, isPersona]);

  const channel = business && CHANNELS.find((c) => c.id === business.category);
  const photoUrl = isPersona ? profile?.avatar_url : details?.logo_url || business?.image_url;
  const initial = (actor.display_name || "?").charAt(0).toUpperCase();
  // El respaldo sin foto se tiñe del color de categoría del negocio (nunca
  // un color plano genérico) — misma decisión que la portada/insignia del
  // resto del Centro del Negocio, aprobada en la propuesta de diseño.
  const fallbackColor = isPersona ? COLORS.accent : channel?.color ?? COLORS.accent;

  return (
    <div>
      {!isPersona && details?.cover_image_url && (
        <div
          style={{
            height: 140,
            margin: `-20px -20px ${SPACE.lg}px`,
            overflow: "hidden",
            borderRadius: "var(--radius-card) var(--radius-card) 0 0",
          }}
        >
          <ImageWithFallback
            src={details.cover_image_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: SPACE.md, marginBottom: SPACE.md }}>
        {photoUrl ? (
          <ImageWithFallback
            src={photoUrl}
            alt=""
            style={{ width: 72, height: 72, borderRadius: isPersona ? "50%" : 18, objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: isPersona ? "50%" : 18,
              background: fallbackColor,
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontFamily: "var(--font-display)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={textStyle(TYPE.h1, { margin: 0 })}>{actor.display_name}</h1>
            {!isPersona && <VerificationBadge status={badge} />}
          </div>

          {channel && (
            <span
              style={{
                display: "inline-block",
                marginTop: 6,
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: tint(channel.color, 0.14),
                ...textStyle(TYPE.metadata, { color: COLORS.ink, fontWeight: 600 }),
              }}
            >
              {channel.label}
            </span>
          )}
        </div>
      </div>

      {details?.bio ? (
        <p style={textStyle(TYPE.body, { margin: `0 0 ${SPACE.md}px`, color: COLORS.ink })}>{details.bio}</p>
      ) : (
        <p style={textStyle(TYPE.bodySmall, { margin: `0 0 ${SPACE.md}px`, color: COLORS.inkSoft })}>
          {isPersona ? "Todavía no hay una biografía." : "Este negocio todavía no agregó una descripción."}
        </p>
      )}
    </div>
  );
}
