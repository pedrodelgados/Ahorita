import { CloudSun } from "lucide-react";
import { COLORS } from "../../styles/theme";

// Placeholder honesto: todavía no está conectado a una API de clima real.
// Listo para conectar (OpenWeatherMap u otra) cuando se defina el proveedor.
export default function WeatherWidget() {
  return (
    <div
      style={{
        position: "absolute",
        top: 62,
        right: 12,
        zIndex: 500,
        background: "#FFFFFF",
        borderRadius: "var(--radius-full)",
        padding: "8px 14px",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: COLORS.inkSoft,
        fontWeight: 600,
      }}
    >
      <CloudSun size={16} color={COLORS.accent} />
      Clima próximamente
    </div>
  );
}
