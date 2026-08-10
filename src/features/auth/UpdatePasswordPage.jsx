import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";

// Pantalla de destino del evento PASSWORD_RECOVERY (ver AuthContext.jsx):
// supabase-js ya estableció una sesión de recuperación al abrir el enlace
// del correo; aquí solo se pide la contraseña nueva y se llama
// updateUser({ password }) — nunca se crea ni se elimina ninguna cuenta.
export default function UpdatePasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await updatePassword(password);
    setLoading(false);

    if (updateError) {
      setError(traducirError(updateError.message));
      return;
    }

    setSuccess(true);
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Nueva contraseña</h1>

        {success ? (
          <>
            <p style={{ color: "#948A80", lineHeight: 1.5, marginBottom: 24 }}>
              Tu contraseña se actualizó correctamente.
            </p>
            <Button fullWidth onClick={() => navigate("/")} icon={<ArrowRight size={18} />}>
              Continuar
            </Button>
          </>
        ) : (
          <>
            <p style={{ color: "#948A80", marginBottom: 28 }}>
              Escribe tu nueva contraseña para esta cuenta.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <InputField
                icon={<Lock size={18} color="#948A80" />}
                type="password"
                placeholder="Contraseña nueva"
                value={password}
                onChange={setPassword}
                required
                minLength={6}
              />
              <InputField
                icon={<Lock size={18} color="#948A80" />}
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
                minLength={6}
              />

              {error && (
                <p style={{ color: "#c0392b", fontSize: 14, margin: 0 }}>{error}</p>
              )}

              <Button type="submit" fullWidth disabled={loading} icon={<ArrowRight size={18} />}>
                {loading ? "Guardando…" : "Guardar contraseña"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function InputField({ icon, ...props }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid rgba(43, 38, 34, 0.15)",
        background: "#FFFFFF",
      }}
    >
      {icon}
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          border: "none",
          outline: "none",
          flex: 1,
          fontSize: 15,
          background: "transparent",
        }}
      />
    </div>
  );
}

function traducirError(message) {
  if (message.includes("New password should be different")) {
    return "La contraseña nueva debe ser distinta de la actual.";
  }
  if (message.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (message.includes("Auth session missing")) {
    return "El enlace de recuperación ya no es válido. Solicita uno nuevo.";
  }
  return message;
}
