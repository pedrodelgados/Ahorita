// Cálculo de distancia real (línea recta) + deep links a apps externas.
// No hay ruteo real (requeriría una API de rutas con key propia), así que el
// tiempo estimado se marca siempre como aproximado en la UI.

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateMinutes(km, speedKmh) {
  return Math.max(1, Math.round((km / speedKmh) * 60));
}

export function googleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
}

export function uberDeepLink(lat, lng, name) {
  const params = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[latitude]": lat,
    "dropoff[longitude]": lng,
    "dropoff[nickname]": name ?? "",
  });
  return `https://m.uber.com/ul/?${params.toString()}`;
}

// Tarifa unificada de tranvía y bus urbano en Cuenca (referencial).
export const CUENCA_TRANSIT_FARE = "$0.35";

// Interpreta un horario tipo "9:00–17:00". Devuelve null si el formato no es
// reconocible (no se inventa un estado abierto/cerrado sin datos claros).
export function isOpenNow(hoursText) {
  if (!hoursText) return null;
  const match = hoursText.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const [, h1, m1, h2, m2] = match;
  const start = Number(h1) * 60 + Number(m1);
  const end = Number(h2) * 60 + Number(m2);
  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return minutesNow >= start && minutesNow <= end;
}
