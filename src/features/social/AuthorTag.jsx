import { useAuth } from "../../contexts/AuthContext";
import { useFollow } from "../../contexts/FollowContext";
import { COLORS } from "../../styles/theme";

export default function AuthorTag({ author }) {
  const { user, isAuthenticated } = useAuth();
  const { followingIds, toggleFollow } = useFollow();

  if (!author) return null;

  const isMe = user?.id === author.id;
  const isFollowing = followingIds.has(author.id);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#6b6360" }}>
        {author.username || "Alguien de Ahorita"}
      </span>
      {isAuthenticated && !isMe && (
        <button
          onClick={() => toggleFollow(author.id)}
          style={{
            background: "none",
            border: "none",
            color: COLORS.accent,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {isFollowing ? "Siguiendo" : "Seguir"}
        </button>
      )}
    </span>
  );
}
