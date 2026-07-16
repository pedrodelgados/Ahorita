import { CHANNEL_COLORS } from "../../styles/theme";
import SaveButton from "./SaveButton";

export default function PlaceCard({ place, onClick }) {
  const channelColor = CHANNEL_COLORS[place.channel_default] ?? "#E8785C";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        background: "#EEE",
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
      }}
    >
      <img
        src={place.image_url}
        alt={place.name}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: channelColor,
          boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
        }}
      />
      <SaveButton placeId={place.id} style={{ position: "absolute", top: 8, right: 8 }} />
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 10,
          textAlign: "left",
        }}
      >
        <p style={{ color: "#FFFFFF", fontWeight: 600, fontSize: 14, margin: 0 }}>
          {place.name}
        </p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, margin: 0 }}>
          {place.area}
        </p>
      </div>
    </div>
  );
}
