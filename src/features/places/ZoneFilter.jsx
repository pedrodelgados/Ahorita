export default function ZoneFilter({ areas, selected, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        marginBottom: 16,
      }}
    >
      <ZonePill label="Todas" active={!selected} onClick={() => onSelect(null)} />
      {areas.map((area) => (
        <ZonePill
          key={area}
          label={area}
          active={selected === area}
          onClick={() => onSelect(area)}
        />
      ))}
    </div>
  );
}

function ZonePill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: "8px 16px",
        borderRadius: "var(--radius-full)",
        border: active ? "none" : "1px solid rgba(43, 38, 34, 0.15)",
        background: active ? "#2B2622" : "transparent",
        color: active ? "#FFFFFF" : "#2B2622",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
