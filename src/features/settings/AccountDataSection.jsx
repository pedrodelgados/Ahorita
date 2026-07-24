import { useEffect, useState } from "react";
import {
  getDataRequests,
  requestAccountExport,
  requestAccountDeletion,
  cancelAccountDeletion,
} from "../../lib/privacy";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

// Entrega el archivo exportado usando el mecanismo oficial de descarga de
// la plataforma -- hoy, un Blob con un enlace temporal; si el navegador
// ofrece un mecanismo distinto en el futuro, solo esta función cambia.
function downloadAsFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Fase 7, Bloque 5: exportación de datos y solicitud/cancelación de
// eliminación de cuenta, expuestas por primera vez desde la interfaz --
// reutilizan exactamente export-user-data y data_requests, ya construidos
// en la Fase 1, Bloque 5. Dos acciones de funcionamiento real, separadas
// visualmente entre sí y de cualquier acción de solo transparencia
// (principio de separación entre transparencia y funcionamiento).
export default function AccountDataSection({ userId }) {
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function load() {
    setLoading(true);
    try {
      const requests = await getDataRequests(userId);
      const pending = requests.find((r) => r.type === "eliminacion" && r.status === "pendiente");
      setPendingDeletion(pending ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const data = await requestAccountExport(userId);
      downloadAsFile(data, `ahorita-mis-datos-${new Date().toISOString().slice(0, 10)}.json`);
    } finally {
      setExporting(false);
    }
  }

  async function handleConfirmDeletion() {
    setBusy(true);
    try {
      const request = await requestAccountDeletion(userId);
      setPendingDeletion(request);
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelDeletion() {
    setBusy(true);
    try {
      await cancelAccountDeletion(pendingDeletion.id);
      setPendingDeletion(null);
    } finally {
      setBusy(false);
    }
  }

  if (!userId || loading) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tus datos y tu cuenta</p>

      <Card style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 14, marginBottom: 4 }}>Exportar mis datos</p>
        <p style={{ fontSize: 13, color: "#948A80", marginBottom: 12 }}>
          Descarga un archivo con todos los datos de tu cuenta en Ahorita.
        </p>
        <Button variant="secondary" onClick={handleExport} disabled={exporting} style={{ padding: "10px 18px", fontSize: 14 }}>
          {exporting ? "Preparando descarga…" : "Exportar mis datos"}
        </Button>
      </Card>

      <Card>
        {pendingDeletion ? (
          <>
            <p style={{ fontSize: 14, marginBottom: 4 }}>Tu cuenta se eliminará el {formatDate(pendingDeletion.scheduled_for)}</p>
            <p style={{ fontSize: 13, color: "#948A80", marginBottom: 12 }}>
              Puedes cancelar esta solicitud en cualquier momento antes de esa fecha.
            </p>
            <Button
              variant="secondary"
              onClick={handleCancelDeletion}
              disabled={busy}
              style={{ padding: "10px 18px", fontSize: 14 }}
            >
              Cancelar solicitud
            </Button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 14, marginBottom: 4 }}>Eliminar mi cuenta</p>
            <p style={{ fontSize: 13, color: "#948A80", marginBottom: 12 }}>
              Esta acción es permanente. Tendrás 30 días para cancelar antes de que se elimine definitivamente.
            </p>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(true)}
              style={{ padding: "10px 18px", fontSize: 14, color: "#C0392B" }}
            >
              Eliminar mi cuenta
            </Button>
          </>
        )}
      </Card>

      <ConfirmationModal
        open={confirmOpen}
        title="¿Eliminar tu cuenta?"
        message="Tu cuenta se eliminará en 30 días — puedes cancelar esta solicitud en cualquier momento antes de esa fecha. Pasado ese plazo, la eliminación es definitiva y no se puede deshacer. Tus preguntas, respuestas y comentarios seguirán visibles para otras personas, pero sin tu nombre."
        confirmLabel="Eliminar mi cuenta"
        confirmDisabled={busy}
        onConfirm={handleConfirmDeletion}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
