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
import ActorProfilePage from "./pages/ActorProfilePage";
import ActorEditPage from "./pages/ActorEditPage";
import AdminPage from "./pages/AdminPage";
import AdminEventsListPage from "./pages/admin/AdminEventsListPage";
import AdminEventEditorPage from "./pages/admin/AdminEventEditorPage";
import AdminPlacesListPage from "./pages/admin/AdminPlacesListPage";
import AdminPlaceEditorPage from "./pages/admin/AdminPlaceEditorPage";
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
        path="/actor/:actorId"
        element={
          <RequireAccess>
            <MainLayout>
              <ActorProfilePage />
            </MainLayout>
          </RequireAccess>
        }
      />
      <Route
        path="/actor/:actorId/editar"
        element={
          <RequireAuth>
            <ActorEditPage />
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
      <Route
        path="/admin/eventos"
        element={
          <RequireAuth>
            <AdminEventsListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/eventos/nuevo"
        element={
          <RequireAuth>
            <AdminEventEditorPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/eventos/:id"
        element={
          <RequireAuth>
            <AdminEventEditorPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/lugares"
        element={
          <RequireAuth>
            <AdminPlacesListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/lugares/nuevo"
        element={
          <RequireAuth>
            <AdminPlaceEditorPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/lugares/:id"
        element={
          <RequireAuth>
            <AdminPlaceEditorPage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
