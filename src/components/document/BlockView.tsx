import type { CSSProperties } from 'react'
import { assetUrl } from '../../lib/assets'
import { highlightCode } from '../../lib/highlight'
import type { Accent, CalloutTone, CodeBlock, DiagramBlock, TextBlock } from '../../practicum/types'
import { ExpandIcon } from '../icons'
import type { PreparedBlock } from './prepareDocument'

const accents: Record<Accent, { solid: string; soft: string }> = {
  blue: { solid: '#2563eb', soft: '#eff6ff' },
  cyan: { solid: '#0891b2', soft: '#ecfeff' },
  violet: { solid: '#7c3aed', soft: '#f5f3ff' },
  emerald: { solid: '#059669', soft: '#ecfdf5' },
  amber: { solid: '#d97706', soft: '#fffbeb' },
  rose: { solid: '#e11d48', soft: '#fff1f2' },
  slate: { solid: '#475569', soft: '#f8fafc' },
}

const calloutIcons: Record<CalloutTone, string> = {
  info: 'i',
  note: '✦',
  task: '✓',
  warning: '!',
  success: '✓',
}

const MAX_DIAGRAM_COLUMNS = 5

function Caption({ label, text }: { label?: string; text?: string }) {
  if (!label && !text) return null
  return (
    <figcaption>
      {label && <strong>{label}</strong>}
      {label && text && <span> — </span>}
      {text && <span>{text}</span>}
    </figcaption>
  )
}

function TextView({ block, anchor }: { block: TextBlock; anchor?: string }) {
  const Tag = block.variant === 'paragraph' ? 'p' : block.variant
  return <Tag id={anchor} className={`doc-${block.variant}`} dangerouslySetInnerHTML={{ __html: block.html }} />
}

function CodeView({ block, label }: { block: CodeBlock; label?: string }) {
  return (
    <figure className="code-figure keep-together">
      <div className="code-toolbar"><span>{block.language}</span></div>
      <pre className="code-panel">
        {block.code.split('\n').map((line, index) => (
          <span className="code-row" key={index}>
            <span className="code-number" aria-hidden="true">{index + 1}</span>
            <code dangerouslySetInnerHTML={{ __html: highlightCode(line || ' ', block.language) }} />
          </span>
        ))}
      </pre>
      <Caption label={label} text={block.caption} />
    </figure>
  )
}

function DiagramView({ block, label }: { block: DiagramBlock; label?: string }) {
  const columns = Math.min(MAX_DIAGRAM_COLUMNS, block.items.length)
  return (
    <figure className="diagram-figure keep-together">
      <h4>{block.title}</h4>
      <div className="diagram-grid diagram-flow" style={{ '--diagram-columns': columns } as CSSProperties}>
        {block.items.map((item, index) => {
          const accent = accents[item.accent]
          return (
            <div className="diagram-card" key={index} style={{ '--card-accent': accent.solid, '--card-soft': accent.soft } as CSSProperties}>
              <span className="diagram-index">{index + 1}</span>
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </div>
          )
        })}
      </div>
      <Caption label={label} text={block.footer} />
    </figure>
  )
}

type BlockViewProps = {
  item: PreparedBlock
  onImageOpen: (src: string, alt: string) => void
}

export function BlockView({ item: { block, anchor, artifactLabel }, onImageOpen }: BlockViewProps) {
  switch (block.type) {
    case 'text':
      return <TextView block={block} anchor={anchor} />
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return <Tag className="doc-list">{block.items.map((entry, index) => <li key={index} dangerouslySetInnerHTML={{ __html: entry }} />)}</Tag>
    }
    case 'code':
      return <CodeView block={block} label={artifactLabel} />
    case 'callout':
      return (
        <aside className={`callout callout-${block.tone} keep-together`}>
          <span className="callout-icon" aria-hidden="true">{calloutIcons[block.tone]}</span>
          <div className="callout-content">
            <strong>{block.title}</strong>
            <div dangerouslySetInnerHTML={{ __html: block.html }} />
          </div>
        </aside>
      )
    case 'table':
      return (
        <figure className="table-figure keep-together">
          <div className="table-scroll">
            <table>
              <thead><tr>{block.headers.map((header, index) => <th key={index} dangerouslySetInnerHTML={{ __html: header }} />)}</tr></thead>
              <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} dangerouslySetInnerHTML={{ __html: cell }} />)}</tr>)}</tbody>
            </table>
          </div>
          <Caption label={artifactLabel} />
        </figure>
      )
    case 'diagram':
      return <DiagramView block={block} label={artifactLabel} />
    case 'image': {
      const src = assetUrl(block.src)
      return (
        <figure className="image-figure keep-together">
          <div className="image-frame">
            <img src={src} alt={block.alt} loading="lazy" />
            <button className="image-expand-button no-print" onClick={() => onImageOpen(src, block.alt)} aria-label="Prikaži sliku uvećano" title="Prikaži uvećano">
              <ExpandIcon />
            </button>
          </div>
          <Caption label={artifactLabel} text={block.caption} />
        </figure>
      )
    }
  }
}
