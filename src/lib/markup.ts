/** Turns `backtick` spans of trusted, hand-written content into inline code markup. */
export function inlineCode(value: string) {
  return value.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
}

export function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}
