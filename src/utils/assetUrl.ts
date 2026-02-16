/**
 * Prefija la URL base de Vite (p. ej. /ntr-adv/ en GitHub Pages) a rutas absolutas.
 * Así /images/foo.jpg se resuelve a /ntr-adv/images/foo.jpg en deploy.
 */
export function withBaseUrl(path: string | null | undefined): string | null {
  if (path == null || path === '') return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL
  const pathWithoutLeadingSlash = path.startsWith('/') ? path.slice(1) : path
  return base.endsWith('/') ? `${base}${pathWithoutLeadingSlash}` : `${base}/${pathWithoutLeadingSlash}`
}
