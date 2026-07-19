import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  PROMOTION_BENEFIT_MIN_LENGTH,
  createPromotionDraft,
  updatePromotionContent,
  setPromotionStatus,
  endPromotionEarly,
  deletePromotion,
  describePromotionError,
} from "../../lib/promotions";
import { COLORS, textStyle, TYPE } from "../../styles/theme";
import BottomSheet from "../../components/layout/BottomSheet";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import MediaUploader from "../../components/ui/MediaUploader";
import ImageWithFallback from "../../components/ui/ImageWithFallback";

const emptyForm = {
  title: "",
  benefitDescription: "",
  redemptionCondition: "",
  restrictions: "",
  startsAt: "",
  endsAt: "",
  imageUrl: null,
  previousPrice: "",
  promoPrice: "",
  discountPercentage: "",
};

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Fase 4, Bloque 3: mismo composer ligero de Publicaciones (Bloque 2),
// adaptado a beneficio/vigencia/condición de canje. Restricciones se
// muestran siempre en la vista previa (nunca detrás de un desplegable) —
// mismo criterio que exige el frontend público.
export default function PromotionComposerSheet({ open, onClose, actorId, authorName, existing, onSaved }) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmEndEarly, setConfirmEndEarly] = useState(false);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initial = existing
      ? {
          title: existing.title,
          benefitDescription: existing.benefitDescription,
          redemptionCondition: existing.redemptionCondition,
          restrictions: existing.restrictions || "",
          startsAt: toLocalInputValue(existing.startsAt),
          endsAt: toLocalInputValue(existing.endsAt),
          imageUrl: existing.imageUrl,
          previousPrice: existing.previousPrice ?? "",
          promoPrice: existing.promoPrice ?? "",
          discountPercentage: existing.discountPercentage ?? "",
        }
      : emptyForm;
    setForm(initial);
    setSavedSnapshot(JSON.stringify(initial));
    setShowPriceDetails(!!(existing?.previousPrice || existing?.promoPrice || existing?.discountPercentage));
    setError(null);
  }, [open, existing]);

  const dirty = JSON.stringify(form) !== savedSnapshot;
  const isValid =
    form.title.trim() &&
    form.benefitDescription.trim().length >= PROMOTION_BENEFIT_MIN_LENGTH &&
    form.redemptionCondition.trim() &&
    form.startsAt &&
    form.endsAt &&
    new Date(form.endsAt) > new Date(form.startsAt);

  function requestClose() {
    if (dirty && !saving) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  function fieldsForSave() {
    return {
      title: form.title.trim(),
      benefitDescription: form.benefitDescription.trim(),
      redemptionCondition: form.redemptionCondition.trim(),
      restrictions: form.restrictions.trim(),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      imageUrl: form.imageUrl,
      previousPrice: form.previousPrice === "" ? null : Number(form.previousPrice),
      promoPrice: form.promoPrice === "" ? null : Number(form.promoPrice),
      discountPercentage: form.discountPercentage === "" ? null : Number(form.discountPercentage),
    };
  }

  async function persistContent() {
    if (existing) {
      await updatePromotionContent(existing.id, fieldsForSave());
      return existing.id;
    }
    return createPromotionDraft(actorId, fieldsForSave());
  }

  async function handleSaveDraft() {
    if (saving || !isValid) return;
    setSaving(true);
    setError(null);
    try {
      await persistContent();
      onSaved();
      onClose();
    } catch (err) {
      setError(describePromotionError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (saving || !isValid) return;
    setSaving(true);
    setError(null);
    try {
      const id = await persistContent();
      await setPromotionStatus(id, "publicado");
      onSaved();
      onClose();
    } catch (err) {
      setError(describePromotionError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleHide() {
    if (!existing || saving) return;
    setSaving(true);
    setError(null);
    try {
      await setPromotionStatus(existing.id, "oculto");
      onSaved();
      onClose();
    } catch (err) {
      setError(describePromotionError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleEndEarly() {
    setConfirmEndEarly(false);
    setSaving(true);
    setError(null);
    try {
      await endPromotionEarly(existing.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(describePromotionError(err));
      setSaving(false);
    }
  }

  async function handleDelete() {
    setConfirmDelete(false);
    setSaving(true);
    setError(null);
    try {
      await deletePromotion(existing.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(describePromotionError(err));
      setSaving(false);
    }
  }

  const isVigenteOrProgramada = existing?.status === "publicado" && !existing?.endedEarlyAt;

  return (
    <>
      <BottomSheet open={open} onClose={requestClose} panelStyle={{ maxHeight: "92vh" }}>
        <h2 style={textStyle(TYPE.h3, { marginBottom: 4 })}>
          {existing ? "Editar promoción" : "Nueva promoción"}
        </h2>
        <p style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft, marginBottom: 16 })}>
          Un beneficio real que ofreces ahora — nunca un espacio pagado.
        </p>

        <MediaUploader imageUrl={form.imageUrl} ownerId={user?.id} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} aspectRatio="4 / 3" />

        <Field label="Título">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ej: Promo de mitad de semana"
            style={inputStyle}
          />
        </Field>

        <Field label="Beneficio — escríbelo como una frase completa">
          <textarea
            value={form.benefitDescription}
            onChange={(e) => setForm((f) => ({ ...f, benefitDescription: e.target.value }))}
            placeholder="Ej: 2x1 en pizzas medianas, Entrada gratuita, Menú ejecutivo por $6"
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          {form.benefitDescription && form.benefitDescription.trim().length < PROMOTION_BENEFIT_MIN_LENGTH && (
            <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: "4px 0 0" })}>
              Describe el beneficio completo, no solo un número o una palabra suelta.
            </p>
          )}
        </Field>

        <Field label="Condición de canje">
          <input
            value={form.redemptionCondition}
            onChange={(e) => setForm((f) => ({ ...f, redemptionCondition: e.target.value }))}
            placeholder="Ej: Presenta esta promoción al pedir"
            style={inputStyle}
          />
        </Field>

        <Field label="Restricciones (opcional, siempre visible para quien la vea)">
          <input
            value={form.restrictions}
            onChange={(e) => setForm((f) => ({ ...f, restrictions: e.target.value }))}
            placeholder="Ej: No aplica feriados, cantidad limitada"
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Empieza" style={{ flex: 1 }}>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Termina" style={{ flex: 1 }}>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              style={inputStyle}
            />
          </Field>
        </div>
        {form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt) && (
          <p style={textStyle(TYPE.metadata, { color: COLORS.error, margin: "0 0 12px" })}>
            La fecha de fin debe ser posterior al inicio.
          </p>
        )}

        <button
          onClick={() => setShowPriceDetails((v) => !v)}
          style={{ background: "none", border: "none", padding: 0, marginBottom: 12 }}
        >
          <span style={textStyle(TYPE.metadata, { color: COLORS.accent, fontWeight: 700 })}>
            {showPriceDetails ? "Ocultar" : "Agregar"} precio (opcional)
          </span>
        </button>
        {showPriceDetails && (
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <Field label="Precio anterior" style={{ flex: 1 }}>
              <input
                type="number"
                step="0.01"
                value={form.previousPrice}
                onChange={(e) => setForm((f) => ({ ...f, previousPrice: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="Precio promo" style={{ flex: 1 }}>
              <input
                type="number"
                step="0.01"
                value={form.promoPrice}
                onChange={(e) => setForm((f) => ({ ...f, promoPrice: e.target.value }))}
                style={inputStyle}
              />
            </Field>
            <Field label="% descuento" style={{ flex: 1 }}>
              <input
                type="number"
                step="0.01"
                value={form.discountPercentage}
                onChange={(e) => setForm((f) => ({ ...f, discountPercentage: e.target.value }))}
                style={inputStyle}
              />
            </Field>
          </div>
        )}

        {form.benefitDescription.trim() && (
          <div style={{ marginBottom: 20 }}>
            <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, marginBottom: 8 })}>
              Así se verá en el feed
            </p>
            <div
              style={{
                borderRadius: "var(--radius-card)",
                overflow: "hidden",
                background: "#1c1a18",
                position: "relative",
                minHeight: form.imageUrl ? 220 : "auto",
                padding: form.imageUrl ? 0 : 16,
              }}
            >
              {form.imageUrl && (
                <ImageWithFallback src={form.imageUrl} alt="" style={{ width: "100%", height: 220, objectFit: "cover" }} />
              )}
              <div style={{ padding: form.imageUrl ? 16 : 0 }}>
                <p style={textStyle(TYPE.kicker, { color: "#FFFFFF", opacity: 0.9, margin: "0 0 4px" })}>{authorName}</p>
                <p style={textStyle(TYPE.body, { color: "#FFFFFF", margin: "0 0 4px", fontWeight: 600 })}>{form.title}</p>
                <p style={textStyle(TYPE.bodySmall, { color: "#FFFFFF", margin: "0 0 4px", opacity: 0.95 })}>
                  {form.benefitDescription}
                </p>
                <p style={textStyle(TYPE.bodySmall, { color: "#FFFFFF", margin: "0 0 4px", opacity: 0.9 })}>
                  {form.redemptionCondition}
                </p>
                {form.restrictions && (
                  <p style={textStyle(TYPE.metadata, { color: "#FFFFFF", margin: 0, opacity: 0.8 })}>
                    {form.restrictions}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p style={textStyle(TYPE.bodySmall, { color: COLORS.error, marginBottom: 12 })} role="alert">
            {error}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button onClick={handlePublish} disabled={saving || !isValid}>
            {existing?.status === "publicado" ? "Guardar cambios" : "Publicar"}
          </Button>
          {existing?.status !== "publicado" && (
            <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || !isValid}>
              Guardar borrador
            </Button>
          )}
          {isVigenteOrProgramada && (
            <Button variant="secondary" onClick={() => setConfirmEndEarly(true)} disabled={saving}>
              Finalizar anticipadamente
            </Button>
          )}
          {existing?.status === "publicado" && (
            <Button variant="secondary" onClick={handleHide} disabled={saving}>
              Ocultar
            </Button>
          )}
          {existing && (
            <Button variant="secondary" onClick={() => setConfirmDelete(true)} disabled={saving}>
              Eliminar
            </Button>
          )}
        </div>
      </BottomSheet>

      <ConfirmationModal
        open={confirmClose}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Descartar"
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />

      <ConfirmationModal
        open={confirmEndEarly}
        title="¿Finalizar esta promoción antes de tiempo?"
        message="Esta acción no se puede deshacer — la promoción quedará marcada como finalizada de inmediato."
        confirmLabel="Finalizar"
        onConfirm={handleEndEarly}
        onCancel={() => setConfirmEndEarly(false)}
      />

      <ConfirmationModal
        open={confirmDelete}
        title="¿Eliminar esta promoción?"
        message="Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <p style={textStyle(TYPE.metadata, { color: COLORS.inkSoft, margin: "0 0 4px" })}>{label}</p>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: `1px solid ${COLORS.borderSubtle}`,
  borderRadius: "var(--radius-sm)",
  padding: 10,
  fontSize: 14,
  color: COLORS.ink,
  fontFamily: "inherit",
};
