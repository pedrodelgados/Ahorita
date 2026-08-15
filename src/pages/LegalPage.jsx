import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SUPPORT_EMAIL } from "../features/settings/SupportSection";

// A13 (BETA_READINESS_CHECKLIST.md): Términos de Servicio y Política de
// Privacidad mínimos para la beta. Ruta pública, accesible sin sesión --
// debe poder leerse antes de crear una cuenta. Texto revisado para
// describir únicamente funcionalidades reales/desplegadas; ver PROJECT.md
// ("A13 — CERRADO") para el detalle de qué se omitió deliberadamente
// (Guía IA, automatización completa de exportación/eliminación) y por qué.
export default function LegalPage() {
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
        <Link to="/" style={{ display: "flex" }} aria-label="Volver">
          <ArrowLeft size={20} />
        </Link>
        <h1 style={{ fontSize: 20 }}>Términos y Privacidad</h1>
      </header>

      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "24px 24px calc(48px + env(safe-area-inset-bottom))",
          color: "#2B2622",
          lineHeight: 1.6,
          fontSize: 14,
        }}
      >
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>
          Términos de Servicio y Política de Privacidad de Ahorita
        </h2>
        <p style={{ color: "#948A80", marginBottom: 24 }}>
          Última actualización: 15 de agosto de 2026
        </p>

        <Section title="1. Quiénes somos">
          <p>
            Ahorita es un servicio operado por Pedro Delgado Sacaquirín, persona natural, con base
            en Ecuador.
          </p>
        </Section>

        <Section title="2. Ahorita está en fase beta">
          <p>
            Ahorita es un servicio en fase beta: está en construcción activa, algunas funciones
            pueden cambiar, no estar disponibles en todo momento, o presentar errores.
          </p>
        </Section>

        <Section title="3. Qué es Ahorita">
          <p>Ahorita es una guía local de lo que pasa en Cuenca — eventos, lugares y negocios reales.</p>
        </Section>

        <Section title="4. Condiciones de uso">
          <p>
            Para crear una cuenta en Ahorita debes tener al menos 18 años — es una condición de uso
            de este servicio. Al crear una cuenta, aceptas estos Términos y esta Política de
            Privacidad. También puedes explorar Ahorita sin registrarte, con funciones limitadas.
          </p>
        </Section>

        <Section title="5. Tu cuenta">
          <p>
            Te registras con tu correo electrónico y una contraseña. Eres responsable de mantener
            tu contraseña segura.
          </p>
        </Section>

        <Section title="6. Contenido que tú publicas">
          <p>
            En Ahorita puedes hacer preguntas, responder, marcar estados sobre un lugar, comentar
            eventos y publicaciones, y reaccionar (me gusta, guardar, seguir, compartir). Este
            contenido es visible públicamente dentro de la app. Eres responsable de lo que
            publicas.
          </p>
        </Section>

        <Section title="7. Negocios, eventos y contenido de terceros">
          <p>
            La información sobre negocios y eventos proviene de los propios negocios/organizadores
            o de nuestro equipo editorial. Hacemos un esfuerzo razonable por verificarla, pero no
            garantizamos que esté siempre libre de errores — puedes reportar cualquier
            inexactitud por nuestro canal de contacto (sección 11).
          </p>
        </Section>

        <Section title="8. Datos personales que tratamos">
          <p>
            Tratamos únicamente los datos necesarios para que Ahorita funcione: tu correo
            electrónico, tu perfil (nombre de usuario, intereses), y tu actividad dentro de la app
            (lugares/eventos guardados, a quién sigues, tus reacciones, preguntas, respuestas y
            comentarios). Si lo autorizas desde tu navegador, también usamos tu ubicación (sección
            9).
          </p>
          <p>
            Con esa actividad, Ahorita aprende patrones generales de tus gustos para sugerirte
            mejor. Puedes ver esta descripción de tus intereses y corregirla en cualquier momento
            desde Ajustes.
          </p>
        </Section>

        <Section title="9. Ubicación">
          <p>
            Si lo autorizas desde tu navegador, Ahorita usa tu ubicación para mostrar tu posición
            en el mapa y calcular distancias. Puedes negar o revocar este permiso en cualquier
            momento desde tu navegador o dispositivo — Ahorita sigue funcionando sin él, con
            funciones de ubicación limitadas.
          </p>
        </Section>

        <Section title="10. Almacenamiento local">
          <p>
            Ahorita no usa cookies de seguimiento ni de publicidad. Usamos el almacenamiento local
            de tu navegador únicamente para mantener tu sesión iniciada, a través de nuestro
            proveedor de infraestructura (Supabase).
          </p>
        </Section>

        <Section title="11. Acceso, corrección, exportación y eliminación de tus datos">
          <p>
            Ahorita incluye controles en Ajustes relacionados con tus datos, incluyendo la
            posibilidad de solicitar la exportación de tu información o la eliminación de tu
            cuenta. Estamos completando la automatización de algunos de estos procesos. Mientras
            tanto, puedes solicitar que atendamos tu requerimiento a través de nuestro canal de
            contacto.
          </p>
        </Section>

        <Section title="12. Guía IA">
          <p>
            Ahorita está desarrollando una Guía basada en inteligencia artificial. Antes de que
            esté disponible para conversar con personas reales, actualizaremos esta Política
            explicando con precisión cómo se tratan esas conversaciones.
          </p>
        </Section>

        <Section title="13. Seguridad">
          <p>
            Tomamos medidas razonables para proteger tus datos. Ningún sistema es perfectamente
            seguro — no podemos garantizar seguridad absoluta.
          </p>
        </Section>

        <Section title="14. Contacto">
          <p>
            Para reportar un fallo, pedir ayuda, o cualquier consulta sobre tus datos personales:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#4FA383", fontWeight: 600 }}>
              {SUPPORT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="15. Cambios a estos Términos">
          <p>
            Podemos actualizar estos Términos mientras Ahorita esté en beta. La fecha de la última
            actualización aparece en la parte superior de este documento.
          </p>
        </Section>

        <Section title="16. Legislación aplicable">
          <p>
            El tratamiento de tus datos personales se realiza conforme a la normativa ecuatoriana
            aplicable en materia de protección de datos. Puedes ejercer los derechos que te
            reconozca la normativa ecuatoriana aplicable a través de nuestro canal de contacto.
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15, marginBottom: 6 }}>{title}</h3>
      {children}
    </section>
  );
}
