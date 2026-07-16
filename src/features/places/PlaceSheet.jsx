import { useEffect, useState } from "react";
import { listQuestions } from "../../lib/questions";
import { listStatuses } from "../../lib/statuses";
import { CHANNELS } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import AuthGate from "../../components/ui/AuthGate";
import Composer from "./Composer";
import QuestionCard from "./QuestionCard";
import StatusCard from "./StatusCard";

function mergeTimeline(questions, statuses) {
  return [
    ...questions.map((q) => ({ type: "question", id: `q-${q.id}`, data: q, created_at: q.created_at })),
    ...statuses.map((s) => ({ type: "status", id: `s-${s.id}`, data: s, created_at: s.created_at })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export default function PlaceSheet({ place, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!place) return;
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
            <div>
              <h2 style={{ fontSize: 19 }}>{place.name}</h2>
              <p style={{ fontSize: 13, color: "#6b6360", margin: 0 }}>
                {place.area}
                {channel && ` · ${channel.label}`}
              </p>
            </div>
          </div>

          <AuthGate prompt="Inicia sesión para preguntar o publicar un estado">
            <Composer place={place} onCreated={handleCreated} />
          </AuthGate>

          {loading && <p style={{ color: "#6b6360", fontSize: 14 }}>Cargando…</p>}

          {!loading && items.length === 0 && (
            <p style={{ color: "#6b6360", fontSize: 14 }}>
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
