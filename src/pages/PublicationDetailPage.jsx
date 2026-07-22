import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getPublication } from "../lib/publications";
import {
  getMyPublicationInteractions,
  getPublicationInteractionCounts,
  togglePublicationInteraction,
  describeInteractionError,
} from "../lib/interactions";
import { useShareContent } from "../hooks/useShareContent";
import { COLORS, SPACE, textStyle, TYPE } from "../styles/theme";
import { formatRelativeTime } from "../lib/time";
import ImageWithFallback from "../components/ui/ImageWithFallback";
import VerificationBadge from "../features/profile/VerificationBadge";
import ContentActionsRow from "../features/feed/ContentActionsRow";
import CommentsSection from "../features/social/CommentsSection";

// Fase 5B, Bloque 3: vista de detalle de una Publicación, en su propia
// ruta (/publicacion/:id) — mismo motivo que ya tiene EventSheet para
// Eventos (dar a los comentarios un lugar propio, en vez de expandir la
// tarjeta del feed en el sitio). `PublicationFeedCard` navega aquí en vez
// de expandirse in-place desde este mismo bloque.
export default function PublicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { share } = useShareContent();
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [counts, setCounts] = useState({ meGusta: 0, guardados: 0 });
  const [mine, setMine] = useState({ meGusta: false, guardado: false });
  const [busy, setBusy] = useState({ meGusta: false, guardado: false });
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: null, data: null });
    getPublication(id)
      .then((data) => {
        if (!cancelled) setState({ loading: false, error: null, data });
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getPublicationInteractionCounts(id).then((c) => {
      if (!cancelled) setCounts(c);
    });
    if (isAuthenticated) {
      getMyPublicationInteractions(user.id, id).then((m) => {
        if (!cancelled) setMine(m);
      });
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated]);

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
      await togglePublicationInteraction({ viewerProfileId: user.id, publicationId: id, type, active: wasActive });
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
      targetType: "publicacion",
      targetId: id,
      title: state.data?.authorName,
      text: state.data?.body,
      url: window.location.origin + "/",
    });
    if (status === "failed") setError("No se pudo compartir. Intenta de nuevo.");
  }

  if (state.loading) return null;

  if (state.error || !state.data) {
    return (
      <div style={{ padding: SPACE.lg }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: SPACE.lg }}>
          <ArrowLeft size={18} color={COLORS.ink} />
        </Link>
        <p style={textStyle(TYPE.body, { color: COLORS.inkSoft })}>
          Esta publicación no existe o ya no está disponible.
        </p>
      </div>
    );
  }

  const item = state.data;

  return (
    <div style={{ paddingBottom: SPACE.xl }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: `${SPACE.md}px ${SPACE.lg}px` }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", display: "flex" }}>
          <ArrowLeft size={20} color={COLORS.ink} />
        </button>
      </div>

      {item.imageUrl && (
        <ImageWithFallback
          src={item.imageUrl}
          alt=""
          iconSize={28}
          style={{ width: "100%", maxHeight: 360, objectFit: "cover" }}
        />
      )}

      <div style={{ padding: `${SPACE.lg}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: SPACE.sm }}>
          <p style={textStyle(TYPE.kicker, { margin: 0 })}>{item.authorName}</p>
          <VerificationBadge status={item.verificationBadge} />
        </div>

        <p style={textStyle(TYPE.body, { margin: `0 0 ${SPACE.sm}px` })}>{item.body}</p>

        <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: `0 0 ${SPACE.lg}px` })}>
          {formatRelativeTime(item.publishedAt)}
          {item.edited ? " · Editado" : ""}
        </p>
      </div>

      <ContentActionsRow
        liked={mine.meGusta}
        likeCount={counts.meGusta}
        busyLike={busy.meGusta}
        onToggleLike={() => requireAuth(() => toggle("me_gusta", "meGusta"))}
        saved={mine.guardado}
        busySave={busy.guardado}
        onToggleSave={() => requireAuth(() => toggle("guardado", "guardado"))}
        onShare={handleShare}
      />
      {error && (
        <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: 0, padding: `0 ${SPACE.lg}px ${SPACE.sm}px` })}>
          {error}
        </p>
      )}

      <div style={{ padding: `${SPACE.lg}px` }}>
        <CommentsSection targetType="publicacion" targetId={id} />
      </div>
    </div>
  );
}
