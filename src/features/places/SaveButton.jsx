import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedPlaces } from "../../contexts/SavedPlacesContext";
import { COLORS } from "../../styles/theme";

export default function SaveButton({ placeId, size = 17, style }) {
  const { isAuthenticated } = useAuth();
  const { savedIds, toggleSave } = useSavedPlaces();
  const navigate = useNavigate();
  const isSaved = savedIds.has(placeId);

  function handleClick(e) {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleSave(placeId);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isSaved ? "Quitar de guardados" : "Guardar lugar"}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        border: "none",
        borderRadius: "50%",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <Bookmark
        size={size}
        fill={isSaved ? COLORS.accent : "none"}
        color={isSaved ? COLORS.accent : "#2B2622"}
      />
    </button>
  );
}
