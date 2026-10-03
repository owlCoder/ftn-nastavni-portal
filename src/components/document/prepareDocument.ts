import { slugify, stripTags } from '../../lib/markup'
import type { Block } from '../../practicum/types'

type ArtifactKind = 'figure' | 'listing' | 'table'

export type PreparedBlock = {
  block: Block
  anchor?: string
  artifactLabel?: string
}

export type TocEntry = {
  id: string
  label: string
  level: 1 | 2
}

const artifactNames: Record<ArtifactKind, string> = { figure: 'Slika', listing: 'Listing', table: 'Tabela' }

const artifactKinds: Partial<Record<Block['type'], ArtifactKind>> = {
  image: 'figure',
  diagram: 'figure',
  code: 'listing',
  table: 'table',
}

/** Section a heading opens, used as the prefix of figure, listing and table numbers. */
function sectionOf(heading: string) {
  const numbered = heading.match(/^(\d+(?:\.\d+)*)\.?\s+/)
  if (numbered) return numbered[1]
  const exercise = heading.match(/^Vežba\s+(\d+)\b/i)
  if (exercise) return exercise[1]
  if (/^Sažetak\b/i.test(heading)) return 'S'
  if (/^Preporučena literatura\b/i.test(heading)) return 'L'
  return undefined
}

/** Assigns heading anchors, the table of contents and running artifact labels. */
export function prepareDocument(blocks: Block[]) {
  const counters = new Map<string, Record<ArtifactKind, number>>()
  const usedAnchors = new Map<string, number>()
  const toc: TocEntry[] = []
  let section = '0'

  const nextArtifact = (kind: ArtifactKind) => {
    const current = counters.get(section) ?? { figure: 0, listing: 0, table: 0 }
    current[kind] += 1
    counters.set(section, current)
    return `${artifactNames[kind]} ${section}.${current[kind]}`
  }

  const prepared = blocks.map((block): PreparedBlock => {
    if (block.type === 'text' && block.variant !== 'paragraph') {
      const label = stripTags(block.html)
      section = sectionOf(label) ?? section

      const base = slugify(label)
      const count = (usedAnchors.get(base) ?? 0) + 1
      usedAnchors.set(base, count)
      const anchor = count === 1 ? base : `${base}-${count}`

      if (block.variant !== 'h3') toc.push({ id: anchor, label, level: block.variant === 'h1' ? 1 : 2 })
      return { block, anchor }
    }

    const kind = artifactKinds[block.type]
    return kind ? { block, artifactLabel: nextArtifact(kind) } : { block }
  })

  return { prepared, toc }
}
