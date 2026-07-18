// Validación de imágenes antes de subir (Fase 3, Bloque C, Entrega 3). El
// bucket "media" acepta cualquier archivo de un usuario autenticado (ver
// 0002_storage.sql) — la validación de tipo/tamaño es responsabilidad del
// frontend, no de RLS.
export const MAX_IMAGE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato no admitido. Usa JPG, PNG o WEBP.";
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `El archivo pesa demasiado. Máximo ${MAX_IMAGE_MB} MB.`;
  }
  return null;
}
