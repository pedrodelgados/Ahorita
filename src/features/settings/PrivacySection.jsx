import PrivacyIntro from "./PrivacyIntro";
import SessionMemoryStatus from "./SessionMemoryStatus";
import AffinitySection from "./AffinitySection";
import PermanentKnowledgeSection from "./PermanentKnowledgeSection";
import AccountDataSection from "./AccountDataSection";

// Fase 7, Bloque 5 (Experiencia unificada de transparencia, corrección y
// borrado): el punto único donde SettingsPage monta toda la experiencia de
// privacidad -- no una superficie visual nueva, sino la consolidación de
// piezas que antes vivían sueltas (AffinitySection, PermanentKnowledgeSection)
// junto con lo que nunca había tenido interfaz (estado de Memoria de Sesión,
// exportación, eliminación de cuenta). Ninguna pieza cambia su propia
// lógica: este componente solo las ordena y las presenta como una única
// experiencia de privacidad, sin pantalla ni ruta nueva.
export default function PrivacySection({ userId, actorId }) {
  return (
    <>
      <PrivacyIntro />
      <SessionMemoryStatus />
      <AffinitySection actorId={actorId} />
      <PermanentKnowledgeSection userId={userId} />
      <AccountDataSection userId={userId} />
    </>
  );
}
