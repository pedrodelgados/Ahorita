// Bloque base con animación de shimmer (ver @keyframes ahorita-shimmer en index.css).
function Bone({ width = "100%", height = 14, radius = 8, style }) {
  return (
    <div
      className="ahorita-skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

// Skeleton del tamaño de una tarjeta de evento del feed, para no mostrar
// "Cargando…" como texto plano mientras llega el contenido.
export function FeedCardSkeleton() {
  return (
    <div
      style={{
        position: "relative",
        height: "82svh",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        marginBottom: 16,
        flexShrink: 0,
      }}
    >
      <Bone width="100%" height="100%" radius={0} />
      <div style={{ position: "absolute", left: 16, right: 84, bottom: 20 }}>
        <Bone width="55%" height={12} style={{ marginBottom: 10, opacity: 0.7 }} />
        <Bone width="80%" height={22} style={{ marginBottom: 10, opacity: 0.7 }} />
        <Bone width="40%" height={12} style={{ opacity: 0.7 }} />
      </div>
    </div>
  );
}

export default Bone;
