import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./features/auth/LoginPage";
import UsageModeScreen from "./features/auth/UsageModeScreen";
import ExplorePage from "./pages/ExplorePage";

function RequireAccess({ children }) {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated && !isGuest) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated || isGuest ? "/explorar" : "/login"} replace />
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/bienvenida"
        element={
          <RequireAccess>
            <UsageModeScreen />
          </RequireAccess>
        }
      />
      <Route
        path="/explorar"
        element={
          <RequireAccess>
            <ExplorePage />
          </RequireAccess>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
