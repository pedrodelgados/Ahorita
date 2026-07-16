import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./features/auth/LoginPage";
import UsageModeScreen from "./features/auth/UsageModeScreen";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import BusinessRegisterPage from "./pages/BusinessRegisterPage";
import AdminPage from "./pages/AdminPage";

function RequireAccess({ children }) {
  const { isAuthenticated, isGuest, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated && !isGuest) return <Navigate to="/login" replace />;
  return children;
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/negocio/nuevo"
        element={
          <RequireAuth>
            <BusinessRegisterPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
