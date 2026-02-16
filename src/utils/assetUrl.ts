/**
 * Asegura que la ruta tenga la base de la app (p. ej. /ntr-adv/ en GitHub Pages).
 * Idempotente: si la ruta ya tiene la base, no se duplica.
 */
export function withBaseUrl(path: string | null | undefined): string | null {
  if (path == null || path === '') return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path
  const withBase = base.endsWith('/') ? `${base}${pathWithoutLeadingSlash}` : `${base}/${pathWithoutLeadingSlash}`
  if (path === withBase || path.startsWith(base)) return path
  return withBase
}
