export default function Card({ children, style, ...props }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: 20,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
