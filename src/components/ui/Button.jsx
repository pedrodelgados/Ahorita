import { COLORS } from "../../styles/theme";

const VARIANTS = {
  primary: {
    background: COLORS.accent,
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: COLORS.ink,
    border: `1px solid rgba(43, 38, 34, 0.15)`,
  },
  ghost: {
    background: "transparent",
    color: COLORS.ink,
    border: "none",
  },
};

export default function Button({
  variant = "primary",
  disabled = false,
  fullWidth = false,
  icon,
  children,
  style,
  ...props
}) {
  const styles = VARIANTS[variant] ?? VARIANTS.primary;

  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        padding: "14px 20px",
        borderRadius: "var(--radius-full)",
        fontWeight: 600,
        fontSize: 15,
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.15s ease, transform 0.1s ease",
        ...styles,
        ...style,
      }}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
