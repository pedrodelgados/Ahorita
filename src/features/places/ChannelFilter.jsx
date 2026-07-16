import { CHANNELS } from "../../styles/theme";
import CategoryChip from "../../components/ui/CategoryChip";

export default function ChannelFilter({ selected, onSelect }) {
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
      <CategoryChip label="Todas" color="#2B2622" active={!selected} onClick={() => onSelect(null)} />
      {CHANNELS.map((c) => (
        <CategoryChip
          key={c.id}
          label={c.label}
          color={c.color}
          active={selected === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}
