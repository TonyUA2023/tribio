/**
 * Utilidades para normalizar y formatear enlaces de redes sociales
 */

/**
 * Convierte un número de WhatsApp o URL en un enlace válido de WhatsApp
 * Acepta formatos como:
 * - "51997730017"
 * - "+51 997 730 017"
 * - "https://wa.me/51997730017"
 * - "https://tribio.info/51997730017" (error común)
 */
export function normalizeWhatsAppLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Si ya es un enlace válido de WhatsApp, retornarlo
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('https://api.whatsapp.com/')) {
    return trimmed;
  }

  // Extraer solo números del input (elimina +, espacios, guiones, etc.)
  const onlyNumbers = trimmed.replace(/\D/g, '');

  // Validar que tengamos un número válido (mínimo 10 dígitos)
  if (onlyNumbers.length < 10) {
    console.warn(`Invalid WhatsApp number: ${input}`);
    return undefined;
  }

  // Construir enlace válido de WhatsApp
  return `https://wa.me/${onlyNumbers}`;
}

/**
 * Normaliza un enlace de Instagram
 */
export function normalizeInstagramLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Si ya es una URL completa, retornarla
  if (trimmed.startsWith('http')) {
    return trimmed;
  }

  // Si es solo el username (con o sin @)
  const username = trimmed.replace('@', '');
  return `https://instagram.com/${username}`;
}

/**
 * Normaliza un enlace de TikTok
 */
export function normalizeTikTokLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http')) {
    return trimmed;
  }

  const username = trimmed.replace('@', '');
  return `https://tiktok.com/@${username}`;
}

/**
 * Normaliza un enlace de Facebook
 */
export function normalizeFacebookLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('http')) {
    return trimmed;
  }

  return `https://facebook.com/${trimmed}`;
}

/**
 * Normaliza un enlace de sitio web
 */
export function normalizeWebsiteLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Si ya tiene protocolo, retornarla
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Agregar https por defecto
  return `https://${trimmed}`;
}

/**
 * Normaliza un enlace de email
 */
export function normalizeEmailLink(input: string | undefined): string | undefined {
  if (!input) return undefined;

  const trimmed = input.trim();
  if (!trimmed) return undefined;

  // Si ya es un mailto:, retornarlo
  if (trimmed.startsWith('mailto:')) {
    return trimmed;
  }

  // Validar que sea un email válido básico
  if (!trimmed.includes('@')) {
    console.warn(`Invalid email: ${input}`);
    return undefined;
  }

  return `mailto:${trimmed}`;
}

/**
 * Normaliza todos los enlaces sociales de un objeto
 */
export function normalizeSocialLinks(links: Record<string, string> | undefined): Record<string, string> {
  if (!links) return {};

  const normalized: Record<string, string> = {};

  // Normalizar cada tipo de enlace
  if (links.whatsapp) {
    const normalized_link = normalizeWhatsAppLink(links.whatsapp);
    if (normalized_link) normalized.whatsapp = normalized_link;
  }

  if (links.instagram) {
    const normalized_link = normalizeInstagramLink(links.instagram);
    if (normalized_link) normalized.instagram = normalized_link;
  }

  if (links.tiktok) {
    const normalized_link = normalizeTikTokLink(links.tiktok);
    if (normalized_link) normalized.tiktok = normalized_link;
  }

  if (links.facebook) {
    const normalized_link = normalizeFacebookLink(links.facebook);
    if (normalized_link) normalized.facebook = normalized_link;
  }

  if (links.website) {
    const normalized_link = normalizeWebsiteLink(links.website);
    if (normalized_link) normalized.website = normalized_link;
  }

  if (links.email) {
    const normalized_link = normalizeEmailLink(links.email);
    if (normalized_link) normalized.email = normalized_link;
  }

  return normalized;
}
