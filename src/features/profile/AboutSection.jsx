import { useEffect, useState } from "react";
import { ChevronDown, Clock, MapPin, Phone, MessageCircle, Navigation, Globe } from "lucide-react";
import { getBusinessWeekHoursText } from "../../lib/businessHours";
import { googleMapsDirectionsUrl } from "../../lib/directions";
import { COLORS, SPACE, textStyle, TYPE } from "../../styles/theme";

// "Acerca de" (Fase 3, Bloque C, Entrega 2): horario semanal completo,
// dirección y contacto en un solo bloque expandible. La bio ya se muestra
// en la identidad (ActorProfileHeader) — no se repite aquí.
export default function AboutSection({ business, zone, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const [weekHours, setWeekHours] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getBusinessWeekHoursText(business.id)
      .then((text) => {
        if (!cancelled) setWeekHours(text);
      })
      .catch(() => {
        if (!cancelled) setWeekHours(null);
      });
    return () => {
      cancelled = true;
    };
  }, [business.id]);

  return (
    <div style={{ borderTop: `1px solid ${COLORS.borderSubtle}`, paddingTop: SPACE.md, marginBottom: SPACE.lg }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", width: "100%", display: "flex",
          justifyContent: "space-between", alignItems: "center", padding: 0,
        }}
      >
        <h3 style={textStyle(TYPE.h3, { margin: 0 })}>Acerca de</h3>
        <ChevronDown size={18} color={COLORS.inkSoft} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
      </button>

      {open && (
        <div style={{ paddingTop: SPACE.sm }}>
          {weekHours && (
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <Clock size={15} color={COLORS.inkSoft} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft })}>{weekHours}</span>
            </div>
          )}

          {(business.address || zone?.name) && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <MapPin size={15} color={COLORS.inkSoft} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={textStyle(TYPE.bodySmall, { color: COLORS.inkSoft })}>
                {[business.address, zone?.name].filter(Boolean).join(" · ")}
              </span>
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {business.phone && (
              <ContactIcon href={`tel:${business.phone}`}><Phone size={16} /></ContactIcon>
            )}
            {business.whatsapp && (
              <ContactIcon href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} external><MessageCircle size={16} /></ContactIcon>
            )}
            {business.lat && business.lng && (
              <ContactIcon href={googleMapsDirectionsUrl(business.lat, business.lng)} external><Navigation size={16} /></ContactIcon>
            )}
            {business.website && (
              <ContactIcon href={business.website} external><Globe size={16} /></ContactIcon>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactIcon({ href, external, children }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{
        width: 36, height: 36, borderRadius: "50%", border: `1.5px solid ${COLORS.borderSubtle}`,
        display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink,
      }}
    >
      {children}
    </a>
  );
}
