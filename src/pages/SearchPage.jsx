import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { searchPlaces, listPlaces } from "../lib/places";
import { searchActors } from "../lib/actorSearch";
import { CHANNELS, COLORS } from "../styles/theme";
import CategoryChip from "../components/ui/CategoryChip";
import PlaceCard from "../features/places/PlaceCard";
import PlaceSheet from "../features/places/PlaceSheet";
import ActorResultCard from "../features/search/ActorResultCard";

// Búsqueda y descubrimiento (Fase 3, Bloque C, Entrega 7): la misma pantalla
// que ya buscaba lugares (Fase 1) ahora también busca negocios, reutilizando
// `actor_search_index` (Bloque A/B) — cierra la deuda técnica registrada
// desde la Entrega 2. Lugares y Negocios son SIEMPRE dos secciones
// separadas, nunca una lista mezclada — cada una se dibuja solo si tiene
// resultados reales, mismo principio ya usado en el Centro del Negocio.
// Los accesos rápidos por categoría (chips, visibles solo antes de escribir)
// reutilizan exactamente las mismas funciones de búsqueda — nunca un
// sistema de recomendación aparte.
export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  async function runSearch({ text, category }) {
    const [placeResults, actorResults] = await Promise.all([
      text ? searchPlaces(text) : listPlaces({ channel: category }),
      searchActors({ query: text, category, types: ["negocio"] }),
    ]);
    setPlaces(placeResults);
    setBusinesses(actorResults);
    setSearched(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setActiveCategory(null);
    runSearch({ text: query.trim() });
  }

  function handleCategoryTap(categoryId) {
    const next = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(next);
    setQuery("");
    if (next) runSearch({ category: next });
    else {
      setSearched(false);
      setPlaces([]);
      setBusinesses([]);
    }
  }

  const showChips = !searched;
  const noResults = searched && places.length === 0 && businesses.length === 0;

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
        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", gap: 8 }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar un lugar o negocio…"
            style={{
              flex: 1,
              border: "1px solid rgba(43, 38, 34, 0.15)",
              borderRadius: "var(--radius-full)",
              padding: "10px 16px",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            style={{
              background: COLORS.accent,
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Search size={16} color="#FFFFFF" />
          </button>
        </form>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {showChips && (
          <>
            <p style={{ color: COLORS.inkSoft, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              Categorías rápidas
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {CHANNELS.map((c) => (
                <CategoryChip
                  key={c.id}
                  label={c.label}
                  color={c.color}
                  active={activeCategory === c.id}
                  onClick={() => handleCategoryTap(c.id)}
                />
              ))}
            </div>
          </>
        )}

        {noResults && (
          <p style={{ color: COLORS.inkSoft, fontSize: 14, marginTop: showChips ? 24 : 0 }}>
            No encontramos lugares ni negocios con ese criterio.
          </p>
        )}

        {places.length > 0 && (
          <section style={{ marginTop: showChips ? 24 : 0, marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Lugares</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
              ))}
            </div>
          </section>
        )}

        {businesses.length > 0 && (
          <section>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>Negocios</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
              {businesses.map((actor) => (
                <ActorResultCard key={actor.actor_id} actor={actor} onClick={() => navigate(`/actor/${actor.actor_id}`)} />
              ))}
            </div>
          </section>
        )}
      </main>

      <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}
