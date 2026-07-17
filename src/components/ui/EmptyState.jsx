import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";

export default function EmptyState({ icon, title, description, style }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: SPACE.xs,
        padding: `${SPACE.huge}px ${SPACE.lg}px`,
        color: COLORS.inkSoft,
        ...style,
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "rgba(43, 38, 34, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: SPACE.xxs,
            color: COLORS.inkSoft,
          }}
        >
          {icon}
        </div>
      )}
      {title && <p style={textStyle(TYPE.h3, { color: COLORS.ink, margin: 0 })}>{title}</p>}
      {description && (
        <p style={textStyle(TYPE.bodySmall, { margin: 0, maxWidth: 280 })}>{description}</p>
      )}
    </div>
  );
}
