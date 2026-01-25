/**
 * Utilidad centralizada para resolver URLs de medios (imágenes, videos, etc.)
 * Sincronizado con config/filesystems.php de Laravel
 */

// Declaración de tipo para la configuración global
declare global {
  interface Window {
    appConfig?: {
      filesystemPublicPath?: string;
    };
  }
}

/**
 * Obtiene el path público configurado para el filesystem
 * Lee desde la configuración global de Laravel pasada al frontend
 */
function getFilesystemPublicPath(): string {
  return window.appConfig?.filesystemPublicPath || 'storage';
}

/**
 * Resuelve la URL completa de un archivo de medios
 *
 * Maneja diferentes formatos de entrada:
 * - URLs completas (http://, https://) - las retorna sin cambios
 * - Rutas relativas - las convierte según la configuración del sistema
 *
 * @param raw - Ruta del archivo (puede ser null/undefined, URL completa, o ruta relativa)
 * @returns URL completa del archivo o string vacío si no hay input válido
 *
 * @example
 * resolveMediaUrl('products/image.jpg') // -> '/storage/products/image.jpg' (local)
 * resolveMediaUrl('/uploaded_files/products/image.jpg') // -> '/uploaded_files/products/image.jpg' (producción)
 * resolveMediaUrl('https://example.com/image.jpg') // -> 'https://example.com/image.jpg' (sin cambios)
 */
export function resolveMediaUrl(raw?: string | null): string {
  if (!raw) return '';

  const trimmed = String(raw).trim();
  if (!trimmed) return '';

  // Si ya es una URL completa (http:// o https://), retornarla sin cambios
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Limpiar el path: remover cualquier prefijo de sistema de archivos anterior
  let cleanPath = trimmed
    .replace(/^\/+/, '') // Remover barras iniciales
    .replace(/^uploaded_files\//, '') // Remover prefijo uploaded_files/
    .replace(/^storage\//, ''); // Remover prefijo storage/

  // Obtener el path público desde la configuración de Laravel
  // En desarrollo usa /storage, en producción puede usar /uploaded_files
  const publicPath = `/${getFilesystemPublicPath()}`;

  return `${publicPath}/${cleanPath}`;
}

/**
 * Resuelve la URL de un logo de cuenta
 */
export function resolveLogoUrl(logoPath?: string | null): string | undefined {
  if (!logoPath) return undefined;
  return resolveMediaUrl(logoPath);
}

/**
 * Resuelve la URL de una imagen de portada
 */
export function resolveCoverUrl(coverPath?: string | null): string | undefined {
  if (!coverPath) return undefined;
  return resolveMediaUrl(coverPath);
}

/**
 * Resuelve la URL de una imagen de producto
 */
export function resolveProductImageUrl(imagePath?: string | null): string {
  return resolveMediaUrl(imagePath) || '/placeholder-product.png';
}

/**
 * Resuelve URLs para una galería de imágenes
 */
export function resolveGalleryUrls(images: string[] | undefined | null): string[] {
  if (!images || !Array.isArray(images)) return [];
  return images.map(img => resolveMediaUrl(img)).filter(url => url !== '');
}

/**
 * Verifica si una URL es válida y accesible
 */
export function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const resolved = resolveMediaUrl(url);
  return resolved.length > 0;
}
