import { Sparkles } from "lucide-react";
import { CHANNELS, COLORS, tint } from "../../styles/theme";
import { CHANNEL_ICONS } from "./channelIcons";

export default function CategoryPillsRow({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "2px 4px 12px" }}>
      <Pill label="Para ti" Icon={Sparkles} color={COLORS.accent} active={!selected} onClick={() => onSelect(null)} />
      {CHANNELS.map((c) => (
        <Pill
          key={c.id}
          label={c.label}
          Icon={CHANNEL_ICONS[c.id]}
          color={c.color}
          active={selected === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

function Pill({ label, Icon, color, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        flexShrink: 0,
        background: "none",
        border: "none",
        width: 58,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: active ? color : tint(color, 0.12),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={19} color={active ? "#FFFFFF" : color} />
      </div>
      <span style={{ fontSize: 11, color: COLORS.ink, fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
}
