/** Resolves a public asset path against the deployment base (Vercel root or a relative local build). */
export function assetUrl(src: string) {
  if (/^(?:data:|blob:|https?:|\/\/)/i.test(src)) return src
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`
}
