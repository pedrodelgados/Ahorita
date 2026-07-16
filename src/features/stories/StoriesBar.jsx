import { useEffect, useState } from "react";
import { listRecentStatusesByPlace } from "../../lib/statuses";
import { CHANNEL_COLORS } from "../../styles/theme";

export default function StoriesBar({ onSelectPlace }) {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    listRecentStatusesByPlace().then(setStories).catch(() => {});
  }, []);

  if (stories.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        padding: "4px 4px 16px",
        marginBottom: 8,
      }}
    >
      {stories.map((status) => {
        const ringColor = CHANNEL_COLORS[status.channel] ?? "#E8785C";
        return (
          <button
            key={status.id}
            onClick={() => onSelectPlace(status.place)}
            style={{
              flexShrink: 0,
              width: 68,
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                padding: 3,
                background: `conic-gradient(${ringColor}, ${ringColor})`,
              }}
            >
              <img
                src={status.place?.image_url}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--color-bg)",
                  display: "block",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                color: "#2B2622",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 68,
              }}
            >
              {status.place?.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
