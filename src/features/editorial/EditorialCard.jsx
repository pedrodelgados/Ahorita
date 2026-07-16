import { useEffect, useState } from "react";
import { getLatestEditorialPost } from "../../lib/editorial";

export default function EditorialCard() {
  const [post, setPost] = useState(null);

  useEffect(() => {
    getLatestEditorialPost().then(setPost).catch(() => {});
  }, []);

  if (!post) return null;

  return (
    <div
      style={{
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        boxShadow: "var(--shadow-card)",
        background: "#FFFFFF",
        marginBottom: 24,
      }}
    >
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
        />
      )}
      <div style={{ padding: 18 }}>
        <h2 style={{ fontSize: 19, marginBottom: 12 }}>{post.title}</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {(post.items ?? []).map((item, i) => (
            <li key={i} style={{ fontSize: 14, color: "#2B2622" }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
