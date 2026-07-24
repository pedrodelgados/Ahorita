// Fase 7, Bloque 5 (Experiencia unificada de transparencia, corrección y
// borrado): explicación introductoria única, en lenguaje llano, del
// principio de ciclo de vida de la información aprobado en el análisis
// conceptual. Nunca implica que la Conversación Activa alimenta la
// Afinidad -- son independientes por diseño (FASE7_CONTRATO_ARQUITECTONICO.md).
export default function PrivacyIntro() {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, marginBottom: 6 }}>Privacidad y tus datos</h2>
      <p style={{ color: "#948A80", fontSize: 13, lineHeight: 1.5 }}>
        Tu conversación con la Guía IA es temporal por defecto y solo se vuelve
        permanente si tú lo confirmas explícitamente. Por separado, Ahorita
        aprende patrones generales de tus gustos (lo que sigues, guardas o con
        lo que reaccionas) para hacerte mejores sugerencias — nunca a partir de
        lo que conversas. En cualquier momento puedes revisar, corregir,
        exportar o borrar cualquiera de estos datos.
      </p>
    </div>
  );
}
