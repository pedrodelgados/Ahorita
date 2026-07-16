import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";
import { SavedPlacesProvider } from "./contexts/SavedPlacesContext";
import { FollowProvider } from "./contexts/FollowContext";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedPlacesProvider>
          <FollowProvider>
            <App />
          </FollowProvider>
        </SavedPlacesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
