/**
 * Prefixes a site path with Astro's `base` (e.g. `/cosmere-verse/` on GitHub
 * Pages), so links and assets in `public/` work under any deploy root.
 * `withBase()` returns the site root itself, with a trailing slash.
 */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, '')}`;
}
