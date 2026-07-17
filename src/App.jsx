import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./features/auth/LoginPage";
import UsageModeScreen from "./features/auth/UsageModeScreen";
import FeedPage from "./pages/FeedPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import BusinessRegisterPage from "./pages/BusinessRegisterPage";
import AdminPage from "./pages/AdminPage";
import MainLayout from "./components/layout/MainLayout";

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
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAccess>
            <MainLayout>
              <FeedPage />
            </MainLayout>
          </RequireAccess>
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
            <MainLayout>
              <ExplorePage />
            </MainLayout>
          </RequireAccess>
        }
      />
      <Route
        path="/perfil"
        element={
          <RequireAuth>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </RequireAuth>
        }
      />
      <Route
        path="/buscar"
        element={
          <RequireAccess>
            <SearchPage />
          </RequireAccess>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <RequireAccess>
            <NotificationsPage />
          </RequireAccess>
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
