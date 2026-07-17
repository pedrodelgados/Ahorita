import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/ui/Button";
import { GoogleIcon, AppleIcon } from "../../components/ui/BrandIcons";

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } =
      mode === "login"
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

    setLoading(false);

    if (authError) {
      setError(traducirError(authError.message));
      return;
    }

    if (mode === "signup" && !data.session) {
      setConfirmEmailSent(true);
      return;
    }

    navigate(mode === "signup" ? "/bienvenida" : "/");
  }

  function handleGuest() {
    continueAsGuest();
    navigate("/");
  }

  if (confirmEmailSent) {
    return (
      <AuthShell>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Revisa tu correo</h1>
        <p style={{ color: "#948A80", lineHeight: 1.5 }}>
          Te enviamos un enlace de confirmación a <strong>{email}</strong>.
          Ábrelo para activar tu cuenta y volver a Ahorita.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 style={{ fontSize: 32, marginBottom: 4 }}>Ahorita</h1>
      <p style={{ color: "#948A80", marginBottom: 28 }}>
        Todo lo que pasa en Cuenca, en vivo.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <InputField
          icon={<Mail size={18} color="#948A80" />}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={setEmail}
          required
        />
        <InputField
          icon={<Lock size={18} color="#948A80" />}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
        />

        {error && (
          <p style={{ color: "#c0392b", fontSize: 14, margin: 0 }}>{error}</p>
        )}

        <Button type="submit" fullWidth disabled={loading} icon={<ArrowRight size={18} />}>
          {loading
            ? "Un momento…"
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </Button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
        }}
        style={{
          background: "none",
          border: "none",
          color: "#E8785C",
          fontSize: 14,
          fontWeight: 600,
          marginTop: 16,
        }}
      >
        {mode === "login"
          ? "¿No tienes cuenta? Regístrate"
          : "¿Ya tienes cuenta? Inicia sesión"}
      </button>

      <Divider />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button
          variant="secondary"
          fullWidth
          disabled
          title="Próximamente"
          icon={<GoogleIcon />}
        >
          Continuar con Google
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled
          title="Próximamente"
          icon={<AppleIcon />}
        >
          Continuar con Apple
        </Button>
      </div>

      <button
        onClick={handleGuest}
        style={{
          background: "none",
          border: "none",
          color: "#2B2622",
          textDecoration: "underline",
          fontSize: 14,
          marginTop: 24,
        }}
      >
        Explorar sin registrarme
      </button>
    </AuthShell>
  );
}

function AuthShell({ children }) {
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
        {children}
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

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
      <span style={{ flex: 1, height: 1, background: "rgba(43, 38, 34, 0.1)" }} />
      <span style={{ fontSize: 13, color: "#948A80" }}>o continúa con</span>
      <span style={{ flex: 1, height: 1, background: "rgba(43, 38, 34, 0.1)" }} />
    </div>
  );
}

function traducirError(message) {
  if (message.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (message.includes("User already registered")) {
    return "Ya existe una cuenta con ese correo.";
  }
  if (message.includes("Password should be at least")) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return message;
}
