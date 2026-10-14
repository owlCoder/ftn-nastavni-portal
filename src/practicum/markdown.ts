import type { Course } from '../courses/types'

const portal = 'https://owlcoder.github.io/ftn-nastavni-portal'
const decode = (value: string) => value.replaceAll('&nbsp;', ' ').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&#39;', "'")
const assetLink = (value: string) => /^(?:https?:|mailto:|#)/.test(value) ? value : portal + '/' + value.replace(/^\.\//, '').replace(/^\//, '')

function markdownInline(value: string): string {
  const spans: string[] = []
  const protect = (text: string) => `\u0000${spans.push(text) - 1}\u0000`
  return decode(value
    .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/g, (_, code: string) => {
      const fence = '`'.repeat(Math.max(1, ...Array.from(code.matchAll(/`+/g), match => match[0].length + 1)))
      return protect(fence + decode(code) + fence)
    })
    .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href: string, label: string) => `[${label}](${assetLink(href)})`)
    .replace(/<(?:b|strong)>([\s\S]*?)<\/(?:b|strong)>/g, '**$1**')
    .replace(/<(?:i|em)>([\s\S]*?)<\/(?:i|em)>/g, '*$1*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, ''))
    .replace(/\u0000(\d+)\u0000/g, (_, index: string) => spans[Number(index)])
}

export function practicumMarkdown(course: Course, exercise?: number): string {
  let selected = !exercise
  const out = [`# ${course.name} — Praktikum`, '', 'FTN · Nastavni materijali', '']
  for (const block of course.practicum.blocks) {
    if (block.type === 'text' && block.variant !== 'paragraph') {
      const heading = markdownInline(block.html)
      if (exercise && block.variant === 'h1') {
        selected = Number(heading.match(/^Vežba\s+(\d+)\b/i)?.[1]) === exercise
      }
      if (!selected) continue
      out.push('#'.repeat(block.variant === 'h1' ? 2 : block.variant === 'h2' ? 3 : 4) + ' ' + heading, '')
      continue
    }
    if (!selected) continue
    if (block.type === 'text') out.push(markdownInline(block.html), '')
    else if (block.type === 'list') out.push(...block.items.map((item, i) => (block.ordered ? `${i + 1}. ` : '- ') + markdownInline(item)), '')
    else if (block.type === 'callout') out.push(`> **${block.title}**`, '>', ...markdownInline(block.html).split('\n').map(line => '> ' + line), '')
    else if (block.type === 'code') {
      const fence = '`'.repeat(Math.max(3, ...Array.from(block.code.matchAll(/`+/g), match => match[0].length + 1)))
      if (block.caption) out.push(markdownInline(block.caption), '')
      out.push(fence + block.language + '\n' + block.code + '\n' + fence, '')
    } else if (block.type === 'table') {
      const cell = (value: string) => markdownInline(value).replaceAll('|', '\\|').replaceAll('\n', '<br>')
      out.push('| ' + block.headers.map(cell).join(' | ') + ' |', '| ' + block.headers.map(() => '---').join(' | ') + ' |', ...block.rows.map(row => '| ' + row.map(cell).join(' | ') + ' |'), '')
    } else if (block.type === 'image') out.push(`![${block.alt}](${block.markdownSrc ?? assetLink(block.src)})`, '', block.caption, '')
    else if (block.type === 'diagram') {
      out.push(`### ${block.title}`, '', ...block.items.map(item => `- ${item.title}: ${item.subtitle}`), '')
      if (block.footer) out.push(block.footer, '')
    }
  }
  return out.join('\n')
}

/** Companion images that must travel with an exported Markdown document. */
export function practicumAssets(course: Course, exercise?: number): Array<{ path: string; url: string }> {
  let selected = !exercise
  const assets = new Map<string, string>()
  for (const block of course.practicum.blocks) {
    if (exercise && block.type === 'text' && block.variant === 'h1') {
      selected = Number(markdownInline(block.html).match(/^Vežba\s+(\d+)\b/i)?.[1]) === exercise
    }
    if (selected && block.type === 'image' && block.markdownSrc) assets.set(block.markdownSrc, block.src)
  }
  return [...assets].map(([path, url]) => ({ path, url }))
}

export function checkpointMarkdown(course: Course): string {
  return [`# ${course.name} — Kontrolne tačke`, '', ...course.checkpoints.flatMap(item => [
    `## ${item.code} — ${item.title}`, '', `${item.dateLabel ?? 'Datum'}: ${item.date}`, '', markdownInline(item.summary), '',
    ...(item.points !== undefined ? [`Poeni: ${item.points}`, ''] : []),
    ...(item.itemsHeading ? [`### ${item.itemsHeading}`, ''] : []),
    ...item.items.map((value, index) => (item.orderedItems ? `${index + 1}. ` : '- ') + markdownInline(value)), '',
    ...(item.additionalRequirements ?? []).flatMap(group => [
      `### ${group.title}`, '', ...group.items.map((value, index) => (item.orderedItems ? `${item.items.length + index + 1}. ` : '- ') + markdownInline(value)), '',
    ]),
    ...(item.presentation ? ['### Prikaz', '', markdownInline(item.presentation), ''] : []),
    ...(item.notRequired?.length ? ['### Ne tražiti u ovoj fazi', '', ...item.notRequired.map(value => '- ' + markdownInline(value)), ''] : []),
  ])].join('\n')
}
