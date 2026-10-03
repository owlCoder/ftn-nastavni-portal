export type Accent = 'blue' | 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate'

export type HeadingVariant = 'h1' | 'h2' | 'h3'

export type TextBlock = {
  type: 'text'
  variant: HeadingVariant | 'paragraph'
  html: string
}

export type ListBlock = {
  type: 'list'
  ordered: boolean
  items: string[]
}

export type CodeLanguage = 'csharp' | 'bash' | 'json' | 'markdown' | 'text'

export type CodeBlock = {
  type: 'code'
  language: CodeLanguage
  code: string
  caption?: string
}

export type CalloutTone = 'info' | 'note' | 'task' | 'warning' | 'success'

export type CalloutBlock = {
  type: 'callout'
  tone: CalloutTone
  title: string
  html: string
}

export type TableBlock = {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export type DiagramItem = {
  title: string
  subtitle: string
  accent: Accent
}

export type DiagramBlock = {
  type: 'diagram'
  title: string
  items: DiagramItem[]
  footer?: string
}

export type ImageBlock = {
  type: 'image'
  src: string
  alt: string
  caption: string
}

export type Block = TextBlock | ListBlock | CodeBlock | CalloutBlock | TableBlock | DiagramBlock | ImageBlock

export type Practicum = {
  subject: string
  footerText: string
  blocks: Block[]
}
