import { useEffect, useState } from "react";
import { listAreas, listPlaces } from "../../lib/places";
import PlaceCard from "./PlaceCard";
import ZoneFilter from "./ZoneFilter";

export default function PlaceGrid({ onSelectPlace }) {
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    listAreas().then(setAreas).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    listPlaces({ area: selectedArea })
      .then(setPlaces)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedArea]);

  return (
    <div>
      {areas.length > 0 && (
        <ZoneFilter areas={areas} selected={selectedArea} onSelect={setSelectedArea} />
      )}

      {loading && <p style={{ color: "#6b6360", fontSize: 14 }}>Cargando lugares…</p>}

      {error && (
        <p style={{ color: "#c0392b", fontSize: 14 }}>
          No se pudo cargar los lugares: {error}
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <p style={{ color: "#6b6360", fontSize: 14 }}>
          Todavía no hay lugares cargados para esta zona.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} onClick={() => onSelectPlace(place)} />
        ))}
      </div>
    </div>
  );
}
