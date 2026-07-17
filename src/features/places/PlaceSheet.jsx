import { useEffect, useState } from "react";
import { Sparkles, Globe, Ticket, UtensilsCrossed } from "lucide-react";
import { listQuestions } from "../../lib/questions";
import { listStatuses } from "../../lib/statuses";
import { isOpenNow } from "../../lib/directions";
import { CHANNELS, COLORS } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import AuthGate from "../../components/ui/AuthGate";
import Composer from "./Composer";
import QuestionCard from "./QuestionCard";
import StatusCard from "./StatusCard";
import SaveButton from "./SaveButton";
import DirectionsSection from "./DirectionsSection";
import GuideChat from "../ai/GuideChat";

function mergeTimeline(questions, statuses) {
  return [
    ...questions.map((q) => ({ type: "question", id: `q-${q.id}`, data: q, created_at: q.created_at })),
    ...statuses.map((s) => ({ type: "status", id: `s-${s.id}`, data: s, created_at: s.created_at })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export default function PlaceSheet({ place, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!place) return;
    setShowGuide(false);
    setLoading(true);
    Promise.all([listQuestions(place.id), listStatuses(place.id)])
      .then(([questions, statuses]) => setItems(mergeTimeline(questions, statuses)))
      .finally(() => setLoading(false));
  }, [place?.id]);

  function handleCreated(entry) {
    setItems((prev) => [entry, ...prev]);
  }

  function handleQuestionUpdate(updatedQuestion) {
    setItems((prev) =>
      prev.map((item) =>
        item.type === "question" && item.data.id === updatedQuestion.id
          ? { ...item, data: updatedQuestion }
          : item
      )
    );
  }

  const channel = place && CHANNELS.find((c) => c.id === place.channel_default);
  const openNow = place && isOpenNow(place.hours);

  return (
    <BottomSheet open={!!place} onClose={onClose}>
      {place && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              paddingRight: 40,
            }}
          >
            <img
              src={place.image_url}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 14, objectFit: "cover" }}
            />
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 19 }}>{place.name}</h2>
              <p style={{ fontSize: 13, color: "#948A80", margin: 0 }}>
                {place.area}
                {channel && ` · ${channel.label}`}
                {openNow !== null && (
                  <span style={{ color: openNow ? "#4FA383" : "#C0392B", fontWeight: 600 }}>
                    {" "}
                    · {openNow ? "Abierto" : "Cerrado"}
                  </span>
                )}
              </p>
            </div>
            <SaveButton placeId={place.id} style={{ background: "var(--color-bg)" }} />
          </div>

          {(place.website || place.tickets_url || place.menu_url) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {place.tickets_url && (
                <InfoLink href={place.tickets_url} icon={<Ticket size={14} />} label="Comprar entradas" />
              )}
              {place.menu_url && (
                <InfoLink href={place.menu_url} icon={<UtensilsCrossed size={14} />} label="Ver menú" />
              )}
              {place.website && <InfoLink href={place.website} icon={<Globe size={14} />} label="Página web" />}
            </div>
          )}

          <DirectionsSection place={place} />

          {showGuide ? (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-card)",
                boxShadow: "var(--shadow-card)",
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h3 style={{ fontSize: 15 }}>Guía IA sobre {place.name}</h3>
                <button
                  onClick={() => setShowGuide(false)}
                  style={{ background: "none", border: "none", color: "#948A80", fontSize: 13 }}
                >
                  Cerrar
                </button>
              </div>
              <GuideChat
                placeId={place.id}
                placeholder={`Pregunta sobre ${place.name}…`}
                suggestions={[
                  "¿Qué lugar parecido hay cerca?",
                  "Hazme una ruta desde aquí",
                ]}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowGuide(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "10px 16px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(43, 38, 34, 0.1)",
                background: "#FFFFFF",
                color: "#948A80",
                fontSize: 14,
                marginBottom: 16,
              }}
            >
              <Sparkles size={16} color={COLORS.accent} />
              Preguntar a la Guía IA
            </button>
          )}

          <AuthGate prompt="Inicia sesión para preguntar o publicar un estado">
            <Composer place={place} onCreated={handleCreated} />
          </AuthGate>

          {loading && <p style={{ color: "#948A80", fontSize: 14 }}>Cargando…</p>}

          {!loading && items.length === 0 && (
            <p style={{ color: "#948A80", fontSize: 14 }}>
              Todavía no hay actividad aquí. ¡Sé el primero en preguntar o reportar algo!
            </p>
          )}

          {items.map((item) =>
            item.type === "question" ? (
              <QuestionCard key={item.id} question={item.data} onUpdate={handleQuestionUpdate} />
            ) : (
              <StatusCard key={item.id} status={item.data} />
            )
          )}
        </div>
      )}
    </BottomSheet>
  );
}

function InfoLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: "var(--radius-full)",
        background: "rgba(43, 38, 34, 0.06)",
        color: COLORS.ink,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      {icon}
      {label}
    </a>
  );
}
