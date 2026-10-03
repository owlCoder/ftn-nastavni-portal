import { inlineCode } from '../lib/markup'
import type { Accent, Block, CalloutTone, CodeLanguage, TextBlock } from './types'

export const text = (variant: TextBlock['variant'], html: string): Block => ({ type: 'text', variant, html: inlineCode(html) })
export const list = (items: string[], ordered = false): Block => ({ type: 'list', ordered, items: items.map(inlineCode) })
export const callout = (tone: CalloutTone, title: string, body: string): Block => ({ type: 'callout', tone, title, html: inlineCode(body) })
export const code = (language: CodeLanguage, value: string, caption?: string): Block => ({ type: 'code', language, code: value, caption })
export const table = (headers: string[], rows: string[][]): Block => ({ type: 'table', headers: headers.map(inlineCode), rows: rows.map((row) => row.map(inlineCode)) })
export const image = (src: string, caption: string, alt: string): Block => ({ type: 'image', src, caption, alt })
export const diagram = (title: string, items: Array<[title: string, subtitle: string, accent: Accent]>, footer?: string): Block => ({
  type: 'diagram',
  title,
  items: items.map(([itemTitle, subtitle, accent]) => ({ title: itemTitle, subtitle, accent })),
  footer,
})
