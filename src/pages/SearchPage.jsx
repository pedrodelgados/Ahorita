import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { searchPlaces } from "../lib/places";
import { COLORS } from "../styles/theme";
import PlaceCard from "../features/places/PlaceCard";
import PlaceSheet from "../features/places/PlaceSheet";

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const places = await searchPlaces(query.trim());
    setResults(places);
    setSearched(true);
  }

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
            placeholder="Buscar un lugar en Cuenca…"
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
        {searched && results.length === 0 && (
          <p style={{ color: COLORS.inkSoft, fontSize: 14 }}>
            No encontramos lugares con ese nombre.
          </p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 12,
          }}
        >
          {results.map((place) => (
            <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} />
          ))}
        </div>
      </main>

      <PlaceSheet place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  );
}
