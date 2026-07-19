import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getMyPromotionInteractions,
  getPromotionInteractionCounts,
  togglePromotionInteraction,
  describeInteractionError,
} from "../../lib/interactions";
import {
  formatPromotionStartLabel,
  formatPromotionEndLabel,
  formatPromotionFinishedLabel,
  formatRelativeTime,
} from "../../lib/time";
import { useShareContent } from "../../hooks/useShareContent";
import { COLORS, photoOverlay, textStyle, TYPE } from "../../styles/theme";
import ImageWithFallback from "../../components/ui/ImageWithFallback";
import VerificationBadge from "../profile/VerificationBadge";
import SocialActions from "./SocialActions";

// Fase 4, Bloque 3: tarjeta propia de Promoción, separada de FeedCard y de
// PublicationFeedCard — cada tipo de contenido tiene su propia forma
// (Evento no tiene beneficio/condición de canje; Publicación no tiene
// vigencia). Ajustes de producto aprobados: restricciones SIEMPRE visibles
// (nunca detrás de un "ver más"); "Publicado hace…" y la etiqueta temporal
// de fase (empieza/válido hasta/finalizó) se muestran siempre juntas.
export default function PromotionFeedCard({ item }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { share } = useShareContent();
  const [counts, setCounts] = useState({ meGusta: 0, guardados: 0 });
  const [mine, setMine] = useState({ meGusta: false, guardado: false });
  const [busy, setBusy] = useState({ meGusta: false, guardado: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPromotionInteractionCounts(item.publicationId).then((c) => {
      if (!cancelled) setCounts(c);
    });
    if (isAuthenticated) {
      getMyPromotionInteractions(user.id, item.publicationId).then((m) => {
        if (!cancelled) setMine(m);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.publicationId, isAuthenticated]);

  function requireAuth(action) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    action();
  }

  async function toggle(type, key) {
    if (busy[key]) return;
    const wasActive = mine[key];
    setBusy((prev) => ({ ...prev, [key]: true }));
    setError(null);
    setMine((prev) => ({ ...prev, [key]: !wasActive }));
    setCounts((prev) => ({
      ...prev,
      [key === "meGusta" ? "meGusta" : "guardados"]:
        prev[key === "meGusta" ? "meGusta" : "guardados"] + (wasActive ? -1 : 1),
    }));
    try {
      await togglePromotionInteraction({
        viewerProfileId: user.id,
        publicationId: item.publicationId,
        type,
        active: wasActive,
      });
    } catch (err) {
      setMine((prev) => ({ ...prev, [key]: wasActive }));
      setCounts((prev) => ({
        ...prev,
        [key === "meGusta" ? "meGusta" : "guardados"]:
          prev[key === "meGusta" ? "meGusta" : "guardados"] + (wasActive ? 1 : -1),
      }));
      setError(describeInteractionError(err));
    } finally {
      setBusy((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function handleShare() {
    setError(null);
    const { status } = await share({
      targetType: "promocion",
      targetId: item.publicationId,
      title: item.promoTitle,
      text: item.benefitDescription,
      url: window.location.origin + "/",
    });
    if (status === "failed") setError("No se pudo compartir. Intenta de nuevo.");
  }

  const phaseLabel =
    item.computedStatus === "programada_proxima"
      ? formatPromotionStartLabel(item.startsAt)
      : item.computedStatus === "finalizada_reciente"
        ? formatPromotionFinishedLabel(item.endedEarlyAt || item.endsAt)
        : formatPromotionEndLabel(item.endsAt);

  return (
    <section
      style={{
        position: "relative",
        minHeight: item.image ? "60svh" : "auto",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        marginBottom: 16,
        background: item.image ? "#1c1a18" : COLORS.surface,
        scrollSnapAlign: "start",
        flexShrink: 0,
      }}
    >
      {item.image && (
        <>
          <ImageWithFallback
            src={item.image}
            alt={item.promoTitle}
            iconSize={28}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", inset: 0, background: photoOverlay() }} />
        </>
      )}

      <span
        style={{
          position: item.image ? "absolute" : "static",
          top: 16,
          left: 16,
          margin: item.image ? 0 : "16px 0 0 16px",
          display: "inline-block",
          background: COLORS.accent,
          color: "#FFFFFF",
          padding: "6px 13px",
          borderRadius: "var(--radius-full)",
          ...textStyle(TYPE.label, { letterSpacing: 0.5 }),
        }}
      >
        Promoción
      </span>

      <SocialActions
        liked={mine.meGusta}
        likeCount={counts.meGusta}
        saved={mine.guardado}
        showComments={false}
        bottom={130}
        onToggleLike={() => requireAuth(() => toggle("me_gusta", "meGusta"))}
        onShare={handleShare}
        onToggleSave={() => requireAuth(() => toggle("guardado", "guardado"))}
      />

      <div
        style={{
          position: item.image ? "absolute" : "static",
          left: 16,
          right: 84,
          bottom: 20,
          color: item.image ? "#FFFFFF" : COLORS.ink,
          padding: item.image ? 0 : "16px 16px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <p style={textStyle(TYPE.kicker, { color: "inherit", opacity: 0.9, margin: 0 })}>{item.title}</p>
          <VerificationBadge status={item.verificationBadge} />
        </div>

        <h2 style={textStyle(TYPE.cardTitle, { color: "inherit", margin: "0 0 4px" })}>{item.promoTitle}</h2>
        <p style={textStyle(TYPE.body, { color: "inherit", margin: "0 0 8px", opacity: 0.98, fontWeight: 600 })}>
          {item.benefitDescription}
        </p>
        <p style={textStyle(TYPE.bodySmall, { color: "inherit", margin: "0 0 6px", opacity: 0.9 })}>
          {item.redemptionCondition}
        </p>
        {/* Restricciones: siempre visibles, nunca detrás de un desplegable
            (ajuste de producto aprobado) — si no hay, simplemente no se
            renderiza nada. */}
        {item.restrictions && (
          <p style={textStyle(TYPE.metadata, { color: "inherit", margin: "0 0 8px", opacity: 0.8 })}>
            {item.restrictions}
          </p>
        )}

        <p style={textStyle(TYPE.metadata, { color: "inherit", opacity: 0.7, margin: 0 })}>
          Publicado {formatRelativeTime(item.publishedAt)}
        </p>
        <p style={textStyle(TYPE.metadata, { color: "inherit", opacity: 0.85, fontWeight: 700, margin: 0 })}>
          {phaseLabel}
        </p>

        {error && (
          <p style={textStyle(TYPE.metadata, { color: item.image ? "#FFD9D9" : COLORS.error, margin: "6px 0 0" })}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
