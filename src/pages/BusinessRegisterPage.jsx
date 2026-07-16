import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createBusiness } from "../lib/businesses";
import { uploadMedia } from "../lib/storage";
import { CHANNELS } from "../styles/theme";
import Button from "../components/ui/Button";

const emptyForm = {
  name: "",
  category: CHANNELS[0].id,
  address: "",
  lat: "",
  lng: "",
  whatsapp: "",
  phone: "",
  instagram: "",
  website: "",
  hours: "",
  description: "",
};

export default function BusinessRegisterPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);

    try {
      let image_url = null;
      if (imageFile) image_url = await uploadMedia(imageFile, user.id);

      await createBusiness({
        owner_id: user.id,
        name: form.name.trim(),
        category: form.category,
        address: form.address.trim() || null,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
        whatsapp: form.whatsapp.trim() || null,
        phone: form.phone.trim() || null,
        instagram: form.instagram.trim() || null,
        website: form.website.trim() || null,
        hours: form.hours.trim() || null,
        description: form.description.trim() || null,
        image_url,
      });

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
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
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, marginBottom: 12 }}>¡Listo, gracias!</h1>
          <p style={{ color: "#6b6360", marginBottom: 24, lineHeight: 1.5 }}>
            Tu negocio quedó <strong>en revisión</strong>. Te avisaremos cuando esté aprobado y
            visible para todos en Ahorita.
          </p>
          <Button onClick={() => navigate("/perfil")}>Volver a mi perfil</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100svh" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 24px",
          borderBottom: "1px solid rgba(43, 38, 34, 0.08)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", display: "flex" }}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: 20 }}>Registrar un negocio</h1>
      </header>

      <main style={{ maxWidth: 560, margin: "0 auto", padding: 24 }}>
        <p style={{ color: "#6b6360", fontSize: 14, marginBottom: 20 }}>
          Cuéntanos de tu negocio. Un administrador lo revisará antes de publicarlo en Ahorita.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Nombre del negocio *">
            <TextInput value={form.name} onChange={(v) => update("name", v)} required />
          </Field>

          <Field label="Categoría">
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              style={inputStyle}
            >
              {CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Dirección">
            <TextInput value={form.address} onChange={(v) => update("address", v)} />
          </Field>

          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Latitud" style={{ flex: 1 }}>
              <TextInput
                value={form.lat}
                onChange={(v) => update("lat", v)}
                placeholder="-2.8974"
                type="number"
                step="any"
              />
            </Field>
            <Field label="Longitud" style={{ flex: 1 }}>
              <TextInput
                value={form.lng}
                onChange={(v) => update("lng", v)}
                placeholder="-79.0045"
                type="number"
                step="any"
              />
            </Field>
          </div>
          <p style={{ fontSize: 12, color: "#6b6360", marginTop: -8 }}>
            Puedes copiar la latitud y longitud desde Google Maps (clic derecho sobre el punto).
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <Field label="WhatsApp" style={{ flex: 1 }}>
              <TextInput value={form.whatsapp} onChange={(v) => update("whatsapp", v)} />
            </Field>
            <Field label="Teléfono" style={{ flex: 1 }}>
              <TextInput value={form.phone} onChange={(v) => update("phone", v)} />
            </Field>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Field label="Instagram" style={{ flex: 1 }}>
              <TextInput value={form.instagram} onChange={(v) => update("instagram", v)} />
            </Field>
            <Field label="Sitio web" style={{ flex: 1 }}>
              <TextInput value={form.website} onChange={(v) => update("website", v)} />
            </Field>
          </div>

          <Field label="Horario">
            <TextInput
              value={form.hours}
              onChange={(v) => update("hours", v)}
              placeholder="Lun a sáb, 9am - 7pm"
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "none" }}
            />
          </Field>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#6b6360",
              cursor: "pointer",
            }}
          >
            <ImagePlus size={16} />
            {imageFile ? imageFile.name : "Agregar una foto"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
          </label>

          {error && <p style={{ color: "#c0392b", fontSize: 14 }}>{error}</p>}

          <Button type="submit" disabled={saving} fullWidth>
            {saving ? "Enviando…" : "Enviar para revisión"}
          </Button>
        </form>
      </main>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput(props) {
  return <input {...props} onChange={(e) => props.onChange(e.target.value)} style={inputStyle} />;
}

const inputStyle = {
  width: "100%",
  border: "1px solid rgba(43, 38, 34, 0.15)",
  borderRadius: "var(--radius-sm)",
  padding: "10px 14px",
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};
