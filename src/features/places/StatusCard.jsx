import { formatRelativeTime } from "../../lib/time";

export default function StatusCard({ status }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      {status.media_url &&
        (status.media_type === "video" ? (
          <video src={status.media_url} controls style={{ width: "100%", display: "block" }} />
        ) : (
          <img
            src={status.media_url}
            alt=""
            style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }}
          />
        ))}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 12, color: "#4FA383", fontWeight: 600, margin: "0 0 4px" }}>
          En vivo · {formatRelativeTime(status.created_at)}
        </p>
        {status.text && <p style={{ fontSize: 15, margin: 0 }}>{status.text}</p>}
      </div>
    </div>
  );
}
