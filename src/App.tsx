import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import type { Block, CourseDocument, DiagramBlock, TextBlock } from './types'
import { practicum2026 } from './content/canvaPracticum'
import type { PresentationDeck } from './content/presentations'
import { checkpoints, type Checkpoint } from './content/checkpoints'
import { oibPracticum2026 } from './content/oib/oibPracticum'
import { oibCheckpoints } from './content/oib/oibCheckpoints'
import { odpPracticum2026 } from './content/odp/odpPracticum'
import { odpThematicPresentationDecks } from './content/odp/odpThematicPresentations'
import { odpCheckpoints } from './content/odp/odpCheckpoints'
import { ACCENTS, highlightCode } from './utils'
import './static-site.css'
import './presentations.css'
import './checkpoints.css'
import './subjects.css'

type ActiveKey = 'praktikum' | 'prezentacije' | 'projekat' | 'kontrolne-tacke'
type ArtifactKind = 'figure' | 'listing' | 'table'

type PreparedBlock = {
  block: Block
  anchor?: string
  artifactLabel?: string
}

type TocEntry = {
  id: string
  label: string
  level: 1 | 2 | 3
}

type PresentationDownload = {
  number: string
  label: string
  title: string
  description: string
  pages: number
  size: string
  file: string
}

type PresentationBundle = {
  file: string
  size: string
}

type ProjectDocument = {
  code: string
  title: string
  description: string
  file: string
  pages: number
  size: string
  highlights: [string, string, string]
}

const ersPresentationDownloads: PresentationDownload[] = [
  { number: '00', label: 'Uvodna prezentacija', title: 'Osnovne informacije', description: 'Organizacija nastave, način polaganja, projektne obaveze i rokovi.', pages: 13, size: '176 KB', file: '/downloads/ers-prezentacije/00_Osnovne_informacije.pdf' },
  { number: '01', label: 'Vežba 1', title: 'Zahtevi, backlog i Git', description: 'Formulisanje zahteva, vođenje backloga i sledljiv rad u Git repozitorijumu.', pages: 20, size: '195 KB', file: '/downloads/ers-prezentacije/01_Zahtevi_backlog_i_Git.pdf' },
  { number: '02', label: 'Vežba 2', title: 'SOLID i Clean Architecture', description: 'Primena SOLID principa i organizacija sistema prema pravilima Clean Architecture.', pages: 20, size: '202 KB', file: '/downloads/ers-prezentacije/02_SOLID_i_Clean_Architecture.pdf' },
  { number: '03', label: 'Vežba 3', title: 'Poslovna logika i slučajevi upotrebe', description: 'Modelovanje poslovnih pravila i odgovornosti aplikacionog sloja.', pages: 20, size: '198 KB', file: '/downloads/ers-prezentacije/03_Poslovna_logika_i_use_case.pdf' },
  { number: '04', label: 'Vežba 4', title: 'Testabilni dizajn, NUnit i Moq', description: 'Projektovanje komponenti za izolovano testiranje uz NUnit i Moq.', pages: 20, size: '223 KB', file: '/downloads/ers-prezentacije/04_Testabilni_dizajn_NUnit_i_Moq.pdf' },
  { number: '05', label: 'Vežba 5', title: 'Integracija modula i ugovori', description: 'Razgraničenje modula, ugovori između komponenti i razmena podataka.', pages: 20, size: '215 KB', file: '/downloads/ers-prezentacije/05_Integracija_modula_ugovori.pdf' },
  { number: '06', label: 'Vežba 6', title: 'Razvoj uz podršku AI alata', description: 'Upotreba AI alata u okviru definisanih arhitektonskih i razvojnih pravila.', pages: 20, size: '198 KB', file: '/downloads/ers-prezentacije/06_Kontrolisan_AI_workflow.pdf' },
  { number: '07', label: 'Vežba 7', title: 'Model Context Protocol (MCP)', description: 'Pristup projektnom kontekstu i alatima preko ograničenog MCP interfejsa.', pages: 20, size: '205 KB', file: '/downloads/ers-prezentacije/07_MCP.pdf' },
  { number: '08', label: 'Vežba 8', title: 'Zaštitni mehanizmi i evaluacija', description: 'Izvršive zaštitne politike, evaluacioni scenariji i kontrola kvaliteta.', pages: 20, size: '196 KB', file: '/downloads/ers-prezentacije/08_Guardrails_evaluacije_i_QA.pdf' },
]

const oibPresentationDownloads: PresentationDownload[] = [
  { number: '00', label: 'Uvodna prezentacija', title: 'Osnovne informacije', description: 'Organizacija nastave, načini polaganja, obaveze i rokovi.', pages: 20, size: '1019 KB', file: '/downloads/oib-prezentacije/00_Osnovne_informacije.pdf' },
  { number: '01', label: 'Vežba 1', title: 'Identitet, autentikacija i RBAC', description: 'Upravljanje identitetima, autentikacija, uloge i dozvole.', pages: 20, size: '707 KB', file: '/downloads/oib-prezentacije/01_Identitet_autentikacija_i_RBAC.pdf' },
  { number: '02', label: 'Vežba 2', title: 'Autorizacija nad resursom', description: 'Autorizacija nad konkretnim resursom i klasifikacija podataka.', pages: 20, size: '693 KB', file: '/downloads/oib-prezentacije/02_Autorizacija_nad_resursom_i_klasifikacija_podataka.pdf' },
  { number: '03', label: 'Vežba 3', title: 'Politike i bezbednosna konfiguracija', description: 'Verzionisanje politika, upravljanje konfiguracijom i evidencija odstupanja.', pages: 20, size: '679 KB', file: '/downloads/oib-prezentacije/03_Politike_konfiguracija_i_vidljivost.pdf' },
  { number: '04', label: 'Vežba 4', title: 'Imovina i modelovanje pretnji', description: 'Evidencija imovine, granice poverenja, tokovi podataka i pretnje.', pages: 20, size: '651 KB', file: '/downloads/oib-prezentacije/04_Imovina_granice_poverenja_i_threat_modeling.pdf' },
  { number: '05', label: 'Vežba 5', title: 'MFA, sesije, servisi i tajne', description: 'Dodatna autentikacija, upravljanje sesijama i zaštita tajni.', pages: 20, size: '652 KB', file: '/downloads/oib-prezentacije/05_MFA_sesije_servisi_i_tajne.pdf' },
  { number: '06', label: 'Vežba 6', title: 'Detekcija i incident', description: 'Bezbednosni signali, detekcija, incidenti i ranjivosti.', pages: 20, size: '661 KB', file: '/downloads/oib-prezentacije/06_Detekcija_incident_i_ranjivosti.pdf' },
  { number: '07', label: 'Vežba 7', title: 'Atributi, rizik i pregled pristupa', description: 'ABAC politike, procena rizika i periodični pregled prava pristupa.', pages: 20, size: '657 KB', file: '/downloads/oib-prezentacije/07_Atributi_rizik_i_pregled_pristupa.pdf' },
  { number: '08', label: 'Vežba 8', title: 'Korelacija i efektivnost kontrola', description: 'Korelacija događaja, merenje efektivnosti kontrola i analiza incidenata.', pages: 20, size: '667 KB', file: '/downloads/oib-prezentacije/08_Korelacija_efektivnost_i_ucenje.pdf' },
]

const ersProjectDocument: ProjectDocument = {
  code: 'PYXIS',
  title: 'Informacioni sistem za upravljanje Data centrom',
  description: 'Projektna specifikacija zajedničkog modularnog sistema za predmet Elementi razvoja softvera.',
  file: '/downloads/ers-projekat/ERS_Projektna_Specifikacija.pdf',
  pages: 115,
  size: '2,1 MB',
  highlights: ['90 projektnih celina', 'R1, R2 i R3 razvojni nivoi', 'Timovi od 6 do 10 studenata'],
}

const oibProjectDocument: ProjectDocument = {
  code: 'SCUTUM',
  title: 'Platforma za upravljanje informacionom bezbednošću i digitalnim poverenjem',
  description: 'Projektna specifikacija zajedničkog informacionog sistema za predmet Osnove informacione bezbednosti.',
  file: '/downloads/oib-projekat/OIB_Projektna_Specifikacija.pdf',
  pages: 96,
  size: '2,0 MB',
  highlights: ['90 projektnih celina', 'R1, R2 i R3 razvojni nivoi', 'Timovi od 6 do 10 studenata'],
}

const calloutIcons = {
  info: 'i',
  note: '✦',
  task: '✓',
  warning: '!',
  success: '✓',
}

function assetUrl(src: string) {
  if (/^(?:data:|blob:|https?:|\/\/)/i.test(src)) return src
  return `${import.meta.env.BASE_URL}${src.replace(/^\/+/, '')}`
}

function plain(html: string) {
  const node = document.createElement('div')
  node.innerHTML = html
  return node.textContent?.trim() || ''
}

function inlineMarkup(html: string) {
  return html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
}

function slug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

function sectionFromHeading(block: TextBlock) {
  const value = plain(block.html)
  const numbered = value.match(/^(\d+(?:\.\d+)*)\.?\s+/)
  if (numbered) return numbered[1]
  const exercise = value.match(/^Vežba\s+(\d+)\b/i)
  if (exercise) return exercise[1]
  if (/^Sažetak\b/i.test(value)) return 'S'
  if (/^Preporučena literatura\b/i.test(value)) return 'L'
  return undefined
}

function prepareDocument(doc: CourseDocument) {
  const counters = new Map<string, Record<ArtifactKind, number>>()
  const usedAnchors = new Map<string, number>()
  let section = '0'
  const toc: TocEntry[] = []
  const prepared: PreparedBlock[] = []

  const nextArtifact = (kind: ArtifactKind) => {
    const current = counters.get(section) || { figure: 0, listing: 0, table: 0 }
    current[kind] += 1
    counters.set(section, current)
    const number = `${section}.${current[kind]}`
    if (kind === 'figure') return `Slika ${number}`
    if (kind === 'listing') return `Listing ${number}`
    return `Tabela ${number}`
  }

  for (const page of doc.pages) {
    if (page.layout === 'cover' || page.label === 'Sadržaj') continue

    for (const block of page.blocks) {
      let anchor: string | undefined
      let artifactLabel: string | undefined

      if (block.type === 'text' && ['h1', 'h2', 'h3'].includes(block.variant)) {
        const detected = sectionFromHeading(block)
        if (detected) section = detected
        const label = plain(block.html)
        const base = slug(label)
        const count = (usedAnchors.get(base) || 0) + 1
        usedAnchors.set(base, count)
        anchor = count === 1 ? base : `${base}-${count}`
        toc.push({
          id: anchor,
          label,
          level: block.variant === 'h1' ? 1 : block.variant === 'h2' ? 2 : 3,
        })
      }

      if (block.type === 'image' || block.type === 'diagram') artifactLabel = nextArtifact('figure')
      if (block.type === 'code') artifactLabel = nextArtifact('listing')
      if (block.type === 'table') artifactLabel = nextArtifact('table')

      prepared.push({ block, anchor, artifactLabel })
    }
  }

  return { prepared, toc }
}

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
  const props = {
    id: anchor,
    className: `doc-${block.variant} ${block.align ? `align-${block.align}` : ''}`,
    dangerouslySetInnerHTML: { __html: inlineMarkup(block.html) },
  }
  if (block.variant === 'h1') return <h1 {...props} />
  if (block.variant === 'h2') return <h2 {...props} />
  if (block.variant === 'h3') return <h3 {...props} />
  if (block.variant === 'quote') return <blockquote {...props} />
  if (block.variant === 'caption') return <p {...props} />
  if (block.variant === 'title') return <h1 {...props} />
  if (block.variant === 'subtitle') return <p {...props} />
  return <p {...props} />
}

function CodeView({ block, label }: { block: Extract<Block, { type: 'code' }>; label?: string }) {
  const lines = block.code.split('\n')
  return (
    <figure className="code-figure keep-together">
      <div className="code-toolbar"><span>{block.language}</span></div>
      <pre className="code-panel">
        {lines.map((line, index) => (
          <span className="code-row" key={`${block.id}-${index}`}>
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
  const columns = Math.min(block.columns || 4, Math.max(1, block.items.length))
  return (
    <figure className="diagram-figure keep-together">
      {block.title && <h4>{block.title}</h4>}
      <div className={`diagram-grid diagram-${block.variant}`} style={{ '--diagram-columns': columns } as CSSProperties}>
        {block.items.map((item, index) => {
          const accent = ACCENTS[item.accent || 'blue']
          return (
            <div className="diagram-card" key={item.id} style={{ '--card-accent': accent.solid, '--card-soft': accent.soft } as CSSProperties}>
              <span className="diagram-index">{index + 1}</span>
              <strong>{item.title}</strong>
              {item.subtitle && <span>{item.subtitle}</span>}
            </div>
          )
        })}
      </div>
      <Caption label={label} text={block.footer} />
    </figure>
  )
}

function BlockView({ item, onImageOpen }: { item: PreparedBlock; onImageOpen?: (src: string, alt: string) => void }) {
  const { block, anchor, artifactLabel } = item

  if (block.type === 'text') return <TextView block={block} anchor={anchor} />
  if (block.type === 'list') {
    const Tag = block.ordered ? 'ol' : 'ul'
    return <Tag className="doc-list">{block.items.map((entry, index) => <li key={index} dangerouslySetInnerHTML={{ __html: inlineMarkup(entry) }} />)}</Tag>
  }
  if (block.type === 'code') return <CodeView block={block} label={artifactLabel} />
  if (block.type === 'callout') {
    return (
      <aside className={`callout callout-${block.tone} keep-together`}>
        <span className="callout-icon" aria-hidden="true">{calloutIcons[block.tone]}</span>
        <div className="callout-content">
          <strong>{block.title}</strong>
          <div dangerouslySetInnerHTML={{ __html: inlineMarkup(block.text) }} />
        </div>
      </aside>
    )
  }
  if (block.type === 'table') {
    return (
      <figure className="table-figure keep-together">
        <div className="table-scroll">
          <table>
            {block.headers.length > 0 && <thead><tr>{block.headers.map((header, index) => <th key={index} dangerouslySetInnerHTML={{ __html: inlineMarkup(header) }} />)}</tr></thead>}
            <tbody>{block.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} dangerouslySetInnerHTML={{ __html: inlineMarkup(cell) }} />)}</tr>)}</tbody>
          </table>
        </div>
        <Caption label={artifactLabel} text={block.caption} />
      </figure>
    )
  }
  if (block.type === 'diagram') return <DiagramView block={block} label={artifactLabel} />
  if (block.type === 'image') {
    const src = assetUrl(block.src)
    const alt = block.alt || block.caption || ''
    return (
      <figure className="image-figure keep-together" style={{ maxWidth: `${block.widthPercent || 100}%` }}>
        <div className="image-frame">
          <img src={src} alt={alt} loading="lazy" />
          <button
            className="image-expand-button no-print"
            onClick={() => onImageOpen?.(src, alt)}
            aria-label="Prikaži sliku uvećano"
            title="Prikaži uvećano"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <Caption label={artifactLabel} text={block.caption} />
      </figure>
    )
  }
  if (block.type === 'institution') {
    return (
      <div className="institution-row keep-together">
        <img src={assetUrl(block.leftLogoSrc || '/brand/university.svg')} alt="Univerzitet u Novom Sadu" />
        <div><strong>{block.university}</strong><span>{block.faculty}</span>{block.department && <small>{block.department}</small>}</div>
        <img src={assetUrl(block.rightLogoSrc || '/brand/ftn.svg')} alt="Fakultet tehničkih nauka" />
      </div>
    )
  }
  return <hr className="doc-divider" />
}

function DocumentCover({ subject }: { subject: string }) {
  return (
    <header className="document-cover">
      <div className="cover-institution">
        <img src={assetUrl('/brand/university.svg')} alt="Univerzitet u Novom Sadu" />
        <div>
          <span>Univerzitet u Novom Sadu</span>
          <strong>Fakultet tehničkih nauka</strong>
          <small>Primenjeno softversko inženjerstvo · 2026/2027</small>
        </div>
        <img src={assetUrl('/brand/ftn.svg')} alt="FTN" />
      </div>
      <div className="cover-copy">
        <span className="eyebrow">{subject}</span>
        <h1>Praktikum</h1>
        <p>Radni materijal za vežbe, samostalno ponavljanje i projektni rad.</p>
      </div>
    </header>
  )
}

const ZOOM_STEPS = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6]

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="image-lightbox no-print" onClick={onClose}>
      <button className="image-lightbox-close" onClick={onClose} aria-label="Zatvori">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
    </div>
  )
}

function StaticDocument({ doc }: { doc: CourseDocument }) {
  const { prepared, toc } = useMemo(() => prepareDocument(doc), [doc])
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [openImage, setOpenImage] = useState<{ src: string; alt: string } | null>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === layoutRef.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === layoutRef.current) {
        await document.exitFullscreen()
      } else {
        await layoutRef.current?.requestFullscreen()
      }
    } catch {
      // Fullscreen može biti odbijen ako korisnička akcija nije prepoznata.
    }
  }

  const zoomOut = () => setZoom((current) => {
    const smaller = [...ZOOM_STEPS].reverse().find((step) => step < current)
    return smaller ?? current
  })

  const zoomIn = () => setZoom((current) => {
    const bigger = ZOOM_STEPS.find((step) => step > current)
    return bigger ?? current
  })

  return (
    <div className={`document-layout ${isFullscreen ? 'is-fullscreen' : ''}`} ref={layoutRef}>
      <aside className="toc-panel">
        <div className="toc-title">Sadržaj</div>
        <nav>
          {toc.filter((entry) => entry.level <= 2).map((entry) => (
            <a className={`toc-level-${entry.level}`} key={entry.id} href={`#${entry.id}`}>{entry.label}</a>
          ))}
        </nav>
      </aside>

      <div className="document-stage">
        <div className="document-toolbar no-print">
          <div className="zoom-controls" aria-label="Uvećanje stranice">
            <button onClick={zoomOut} disabled={zoom <= ZOOM_STEPS[0]} aria-label="Umanji">−</button>
            <button className="zoom-reset" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</button>
            <button onClick={zoomIn} disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]} aria-label="Uvećaj">+</button>
          </div>
          <button
            className="fullscreen-icon-button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Izađi iz celog ekrana' : 'Otvori preko celog ekrana'}
            title={isFullscreen ? 'Izađi iz celog ekrana' : 'Ceo ekran'}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        <div className="document-scroll">
          <div className="document-zoom-frame" style={{ '--doc-zoom': zoom } as CSSProperties}>
            <main className="document-paper">
              <DocumentCover subject={doc.subject} />
              <article className="document-body">
                {prepared.map((item, index) => (
                  <BlockView item={item} key={`${item.block.id}-${index}`} onImageOpen={(src, alt) => setOpenImage({ src, alt })} />
                ))}
              </article>
              <footer className="document-end">
                <span>{doc.footerText}</span>
                <span>Univerzitet u Novom Sadu · Fakultet tehničkih nauka</span>
              </footer>
            </main>
          </div>
        </div>
      </div>

      {openImage && <ImageLightbox src={openImage.src} alt={openImage.alt} onClose={() => setOpenImage(null)} />}
    </div>
  )
}

function CheckpointsView({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const [activeId, setActiveId] = useState(checkpoints[0].id)
  const active = checkpoints.find((item) => item.id === activeId) || checkpoints[0]
  const activeIndex = checkpoints.findIndex((item) => item.id === active.id)

  return (
    <main className="checkpoints-shell">
      <div className="checkpoints-topline">
        <h1>Kontrolne tačke</h1>
        <p>Pregled projektnih kontrolnih tačaka kroz semestar.</p>
      </div>

      <ol className="checkpoint-timeline" aria-label="Kontrolne tačke">
        {checkpoints.map((item, index) => (
          <li key={item.id} className={index <= activeIndex ? 'is-reached' : ''}>
            <button
              className={`checkpoint-node ${item.id === active.id ? 'active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="checkpoint-node-dot">{item.code}</span>
              <span className="checkpoint-node-date">{item.date}</span>
              <span className="checkpoint-node-title">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="checkpoint-stage">
        <article className="checkpoint-canvas" key={active.id}>
          <div className="checkpoint-toolbar">
            <span className="checkpoint-badge">{active.code}</span>
            <div className="checkpoint-toolbar-title">
              <strong>{active.title}</strong>
              <span>{active.exercise} · nedelja od {active.date}</span>
            </div>
          </div>

          <p className="checkpoint-summary">{active.summary}</p>
          <h3>Šta treba uraditi</h3>
          <ul className="checkpoint-items">
            {active.items.map((item, index) => (
              <li key={item}>
                <span className="checkpoint-item-index">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

function PresentationsView({ presentationDecks }: { presentationDecks: PresentationDeck[] }) {
  const [deckId, setDeckId] = useState(presentationDecks[0].id)
  const [slideIndex, setSlideIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [deckZoom, setDeckZoom] = useState(1)
  const stageRef = useRef<HTMLDivElement>(null)
  const deck = presentationDecks.find((item) => item.id === deckId) || presentationDecks[0]
  const slide = deck.slides[slideIndex] || deck.slides[0]

  const chooseDeck = (nextDeck: PresentationDeck) => {
    setDeckId(nextDeck.id)
    setSlideIndex(0)
  }

  const previousSlide = () => setSlideIndex((current) => Math.max(0, current - 1))
  const nextSlide = () => setSlideIndex((current) => Math.min(deck.slides.length - 1, current + 1))

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  useEffect(() => {
    if (!isFullscreen) {
      setDeckZoom(1)
      return
    }
    const canvas = stageRef.current?.querySelector('.slide-canvas') as HTMLElement | null
    if (!canvas) return
    const REFERENCE_WIDTH = 820
    const updateZoom = () => {
      const stage = stageRef.current
      if (!stage || !canvas) return
      const previousInlineZoom = canvas.style.zoom
      canvas.style.zoom = '1'
      const contentHeight = canvas.scrollHeight
      canvas.style.zoom = previousInlineZoom
      const availableWidth = stage.clientWidth - 112
      const availableHeight = stage.clientHeight - 128
      const scale = Math.min(availableWidth / REFERENCE_WIDTH, availableHeight / contentHeight)
      setDeckZoom(Math.max(1, Math.min(2.6, scale)))
    }
    updateZoom()
    window.addEventListener('resize', updateZoom)
    return () => window.removeEventListener('resize', updateZoom)
  }, [isFullscreen, slideIndex])

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === stageRef.current) {
        await document.exitFullscreen()
      } else {
        await stageRef.current?.requestFullscreen()
      }
    } catch {
      // Fullscreen može biti odbijen ako korisnička akcija nije prepoznata.
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') previousSlide()
      if (event.key === 'ArrowRight') nextSlide()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deck.slides.length])

  return (
    <main className="presentations-shell">
      <section className="presentations-hero">
        <span className="eyebrow">Nastavnički materijal</span>
        <h1>Prezentacije za vežbe</h1>
        <p>Svaka prezentacija prati jednu vežbu iz praktikuma. Slajdovi su kratki i služe kao oslonac tokom objašnjavanja gradiva, dok beleške daju smernice za razgovor, primere i pitanja za studente.</p>
      </section>

      <section className="presentation-grid">
        <aside className="deck-list" aria-label="Prezentacije po vežbama">
          {presentationDecks.map((item) => (
            <button className={`deck-tab ${item.id === deck.id ? 'active' : ''}`} key={item.id} onClick={() => chooseDeck(item)}>
              <strong>Vežba {item.exercise}</strong>
              <span>{item.title}</span>
            </button>
          ))}
        </aside>

        <section
          className={`deck-stage ${isFullscreen ? 'is-fullscreen' : ''}`}
          ref={stageRef}
          style={{ '--deck-zoom': deckZoom } as CSSProperties}
        >
          <div className="deck-toolbar">
            <div className="deck-toolbar-title">
              <strong>{deck.title}</strong>
              <span>{deck.subtitle} · {deck.duration}</span>
            </div>
            <div className="slide-controls" aria-label="Kontrole slajdova">
              <button onClick={previousSlide} disabled={slideIndex === 0}>Prethodni</button>
              <span>{slideIndex + 1} / {deck.slides.length}</span>
              <button onClick={nextSlide} disabled={slideIndex === deck.slides.length - 1}>Sledeći</button>
            </div>
          </div>

          <article className="slide-canvas" aria-live="polite" key={`${deck.id}-${slideIndex}`}>
            <span className="slide-kicker">Vežba {deck.exercise}</span>
            <h2>{slide.title}</h2>
            {slide.lead && <p className="slide-lead">{slide.lead}</p>}
            {slide.points && slide.points.length > 0 && (
              <ul className="slide-points">
                {slide.points.map((point) => <li key={point}>{point}</li>)}
              </ul>
            )}
            {slide.example && <div className="slide-example"><strong>Primer</strong>{slide.example}</div>}
            {slide.question && <div className="slide-question"><strong>Pitanje za studente</strong>{slide.question}</div>}
          </article>

          <aside className="deck-overview">
            <h3>Cilj prezentacije</h3>
            <p>{deck.goal}</p>
          </aside>

          <div className="floating-controls no-print">
            <button
              className="fullscreen-icon-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Izađi iz celog ekrana' : 'Otvori preko celog ekrana'}
              title={isFullscreen ? 'Izađi iz celog ekrana' : 'Ceo ekran'}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </section>
      </section>
    </main>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function PresentationDownloadsView({ downloads, bundle }: { downloads: PresentationDownload[]; bundle: PresentationBundle }) {
  const totalPages = downloads.reduce((sum, item) => sum + item.pages, 0)

  return (
    <main className="presentations-shell presentation-downloads-shell">
      <section className="download-hero">
        <div className="download-hero-copy">
          <span className="eyebrow">Materijali za nastavu</span>
          <h1>Prezentacije za vežbe</h1>
          <p>Prezentacije sa vežbi u PDF formatu, raspoređene prema redosledu izvođenja nastave.</p>
          <div className="download-summary" aria-label="Sadržaj paketa">
            <span><strong>{downloads.length}</strong> PDF fajlova</span>
            <span><strong>{totalPages}</strong> slajdova</span>
          </div>
        </div>
        <a className="download-all-button" href={assetUrl(bundle.file)} download>
          <span className="download-all-icon"><DownloadIcon /></span>
          <span className="download-all-copy">
            <small>SVE PREZENTACIJE</small>
            <strong>Preuzmi komplet</strong>
            <em><b>ZIP</b><span>{downloads.length} PDF fajlova</span><span>{bundle.size}</span></em>
          </span>
          <span className="download-all-arrow" aria-hidden="true">→</span>
        </a>
      </section>

      <section className="download-library" aria-labelledby="download-library-title">
        <div className="download-library-heading">
          <div>
            <span className="eyebrow">Pojedinačno preuzimanje</span>
            <h2 id="download-library-title">Prezentacije po vežbama</h2>
          </div>
          <p>PDF možete pregledati u pregledaču ili preuzeti.</p>
        </div>

        <div className="download-card-grid">
          {downloads.map((item) => (
            <article className={`download-card ${item.number === '00' ? 'download-card-featured' : ''}`} key={item.number}>
              <div className="download-card-number" aria-hidden="true">{item.number}</div>
              <div className="download-card-content">
                <span className="download-card-label">{item.label}</span>
                <h3>{item.title}</h3>
                <div className="download-card-meta"><span>{item.pages} strana</span><span>{item.size}</span></div>
              </div>
              <div className="download-card-actions">
                <a className="download-card-action download-card-preview" href={assetUrl(item.file)} target="_blank" rel="noreferrer" aria-label={`Pregledaj ${item.label}: ${item.title}`}>
                  <PreviewIcon />
                  <span>Pregledaj</span>
                </a>
                <a className="download-card-action" href={assetUrl(item.file)} download aria-label={`Preuzmi ${item.label}: ${item.title}`}>
                  <DownloadIcon />
                  <span>Preuzmi</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function ProjectDownloadView({ project }: { project: ProjectDocument }) {
  return (
    <main className="presentations-shell project-shell">
      <section className="project-hero">
        <div className="project-hero-copy">
          <span className="eyebrow">Projektna specifikacija</span>
          <h1>{project.code}</h1>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-highlights" aria-label="Osnovni podaci o projektu">
            {project.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
          </div>
        </div>

        <article className="project-document-card">
          <div className="project-document-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 3.5h7l4 4V20.5H7v-17Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="project-document-label">Referentni dokument</span>
          <h3>Kompletna specifikacija</h3>
          <p>Dokument sadrži opis projektnih celina, pravila integracije, zahteve za testiranje, način predaje i kriterijume ocenjivanja.</p>
          <div className="project-document-meta"><span>PDF</span><span>{project.pages} strana</span><span>{project.size}</span></div>
          <div className="project-document-actions">
            <a
              className="project-document-action project-preview-button"
              href={assetUrl(project.file)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Pregledaj projektnu specifikaciju ${project.code}`}
            >
              <PreviewIcon />
              <span>Pregledaj</span>
            </a>
            <a
              className="project-document-action project-download-button"
              href={assetUrl(project.file)}
              download
              aria-label={`Preuzmi projektnu specifikaciju ${project.code}`}
            >
              <DownloadIcon />
              <span>Preuzmi PDF</span>
            </a>
          </div>
        </article>
      </section>
    </main>
  )
}

type CourseAppProps = {
  onBack: () => void
  hashPrefix: string
  brandInitial: string
  brandAccent?: string
  brandShadow?: string
  courseName: string
  academicYear: string
  titlePrefix: string
  doc: CourseDocument
  presentationDecks?: PresentationDeck[]
  presentationDownloads?: PresentationDownload[]
  presentationBundle?: PresentationBundle
  project?: ProjectDocument
  checkpoints: Checkpoint[]
}

function CourseApp({ onBack, hashPrefix, brandInitial, brandAccent, brandShadow, courseName, academicYear, titlePrefix, doc, presentationDecks, presentationDownloads, presentationBundle, project, checkpoints }: CourseAppProps) {
  const activeFromHash = (): ActiveKey | null => window.location.hash.startsWith(`#${hashPrefix}/prezentacije`)
    ? 'prezentacije'
    : window.location.hash.startsWith(`#${hashPrefix}/projekat`)
      ? 'projekat'
      : window.location.hash.startsWith(`#${hashPrefix}/kontrolne-tacke`)
        ? 'kontrolne-tacke'
        : window.location.hash.startsWith(`#${hashPrefix}/praktikum`)
          ? 'praktikum'
          : null
  const initial: ActiveKey = activeFromHash() ?? 'praktikum'
  const [active, setActive] = useState<ActiveKey>(initial)

  useEffect(() => {
    const syncActiveTab = () => {
      const next = activeFromHash()
      if (next) setActive(next)
    }

    window.addEventListener('hashchange', syncActiveTab)
    window.addEventListener('popstate', syncActiveTab)
    return () => {
      window.removeEventListener('hashchange', syncActiveTab)
      window.removeEventListener('popstate', syncActiveTab)
    }
  }, [hashPrefix])

  useEffect(() => {
    const titles: Record<ActiveKey, string> = {
      praktikum: `${titlePrefix} — Praktikum`,
      prezentacije: `${titlePrefix} — Prezentacije`,
      projekat: `${titlePrefix} — Projekat`,
      'kontrolne-tacke': `${titlePrefix} — Kontrolne tačke`,
    }
    document.title = titles[active]
  }, [active, titlePrefix])

  const choose = (key: ActiveKey) => {
    setActive(key)
    history.replaceState(null, '', `#${hashPrefix}/${key}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="site-brand" onClick={onBack}>
          <span
            className={`brand-mark brand-mark-${hashPrefix}`}
            style={{ '--brand-accent': brandAccent, '--brand-shadow': brandShadow } as CSSProperties}
          >
            {hashPrefix === 'ers' ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13.5 5.5l-3 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : hashPrefix === 'oib' ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 3.5 19 6v5.3c0 4.3-2.8 7.6-7 9.2-4.2-1.6-7-4.9-7-9.2V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9.3 11.4h5.4v4.1H9.3v-4.1Zm1-2a1.7 1.7 0 0 1 3.4 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : brandInitial}
          </span>
          <span><strong>{courseName}</strong><small>{academicYear}</small></span>
        </button>
        <nav className="document-switcher" aria-label="Dokumenti">
          <button className={`nav-tab-praktikum ${active === 'praktikum' ? 'active' : ''}`} onClick={() => choose('praktikum')} aria-label="Praktikum">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span>Praktikum</span>
          </button>
          <button className={`nav-tab-prezentacije ${active === 'prezentacije' ? 'active' : ''}`} onClick={() => choose('prezentacije')} aria-label="Prezentacije">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span>Prezentacije</span>
          </button>
          {project && (
            <button className={`nav-tab-projekat ${active === 'projekat' ? 'active' : ''}`} onClick={() => choose('projekat')} aria-label="Projekat">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3.5h7l4 4V20.5H7v-17Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Projekat</span>
            </button>
          )}
          <button className={`nav-tab-kontrolne ${active === 'kontrolne-tacke' ? 'active' : ''}`} onClick={() => choose('kontrolne-tacke')} aria-label="Kontrolne tačke">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9 12.3l1.8 1.8L15.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Kont. tačke</span>
          </button>
        </nav>
      </header>
      <div className="tab-panel" key={active}>
        {active === 'prezentacije' ? (
          presentationDownloads ? (
            <PresentationDownloadsView downloads={presentationDownloads} bundle={presentationBundle ?? { file: '/downloads/ERS_sve_prezentacije.zip', size: '1,8 MB' }} />
          ) : presentationDecks ? (
            <PresentationsView presentationDecks={presentationDecks} />
          ) : null
        ) : active === 'projekat' && project ? (
          <ProjectDownloadView project={project} />
        ) : active === 'kontrolne-tacke' ? (
          <CheckpointsView checkpoints={checkpoints} />
        ) : (
          <StaticDocument doc={doc} />
        )}
      </div>
    </div>
  )
}

type Subject = {
  id: string
  name: string
  semester: 'zimski' | 'letnji'
  available: boolean
  blurb: string
  accent: string
  accentSoft: string
}

const subjects: Subject[] = [
  {
    id: 'ers',
    name: 'Elementi razvoja softvera',
    semester: 'zimski',
    available: true,
    blurb: 'Praktikum, prezentacije, nastavni primeri, projektna specifikacija i kontrolne tačke.',
    accent: 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 48%, #3730a3 100%)',
    accentSoft: 'rgba(37,99,235,.14)',
  },
  {
    id: 'oib',
    name: 'Osnove informacione bezbednosti',
    semester: 'zimski',
    available: true,
    blurb: 'Praktikum, prezentacije, nastavni primeri, projektna specifikacija i kontrolne tačke.',
    accent: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 48%, #7f1d1d 100%)',
    accentSoft: 'rgba(220,38,38,.14)',
  },
  {
    id: 'odp',
    name: 'Osnove distribuiranog programiranja',
    semester: 'letnji',
    available: false,
    blurb: 'Praktikum, prezentacije za vežbe i kontrolne tačke projektnog rada iz distribuiranih sistema.',
    accent: 'linear-gradient(145deg, #059669 0%, #047857 48%, #065f46 100%)',
    accentSoft: 'rgba(5,150,105,.14)',
  },
]

const subjectIcons: Record<string, ReactElement> = {
  ers: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  oib: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L14.8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  odp: (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="6" r="2.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="19" cy="6" r="2.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="18" r="2.4" stroke="currentColor" strokeWidth="2" />
      <path d="M7 7.2L10.3 16M17 7.2L13.7 16M7.4 6h9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

function SubjectTile({ subject, onOpen }: { subject: Subject; onOpen: () => void }) {
  return (
    <div
      className={`subject-tile ${subject.available ? '' : 'disabled'}`}
      style={{ '--tile-accent': subject.accent, '--tile-accent-soft': subject.accentSoft } as CSSProperties}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--tile-pointer-x', `${event.clientX - bounds.left}px`)
        event.currentTarget.style.setProperty('--tile-pointer-y', `${event.clientY - bounds.top}px`)
      }}
    >
      <span className="subject-tile-pointer-glow" aria-hidden="true" />
      <span className="subject-tile-mark">{subjectIcons[subject.id]}</span>
      <span className="subject-tile-copy">
        <strong>{subject.name}</strong>
        <span className="subject-tile-meta">{subject.blurb}</span>
        {!subject.available && <span className="subject-tile-badge">Uskoro</span>}
      </span>
      <button className="subject-tile-cta" onClick={onOpen} disabled={!subject.available}>
        <span>{subject.available ? 'Otvori' : 'Uskoro'}</span>
        <svg className="subject-tile-cta-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

function SubjectSelector({ onOpenSubject }: { onOpenSubject: (id: string) => void }) {
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'FTN — Izbor predmeta'
  }, [])

  const winter = subjects.filter((subject) => subject.semester === 'zimski')
  const summer = subjects.filter((subject) => subject.semester === 'letnji')

  return (
    <div
      className="subjects-shell"
      ref={shellRef}
      onPointerMove={(event) => {
        const shell = shellRef.current
        if (!shell) return
        const bounds = shell.getBoundingClientRect()
        shell.style.setProperty('--subjects-pointer-x', `${event.clientX - bounds.left}px`)
        shell.style.setProperty('--subjects-pointer-y', `${event.clientY - bounds.top - 64}px`)
      }}
    >
      <span className="subjects-pointer-glow" aria-hidden="true" />
      <div className="subjects-ambient" aria-hidden="true">
        <span className="subjects-orb subjects-orb-blue" />
        <span className="subjects-orb subjects-orb-red" />
        <span className="subjects-orb subjects-orb-green" />

        <svg className="subjects-ambient-graphic subjects-network-graphic" viewBox="0 0 360 250" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path className="subjects-flow-line" d="M54 67 145 32l78 56 87-24M54 67l39 96 130-75 49 104M93 163l109 45 70-16" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 7" />
          <circle cx="54" cy="67" r="9" />
          <circle cx="145" cy="32" r="6" />
          <circle cx="223" cy="88" r="11" />
          <circle cx="310" cy="64" r="6" />
          <circle cx="93" cy="163" r="8" />
          <circle cx="202" cy="208" r="6" />
          <circle cx="272" cy="192" r="10" />
        </svg>

        <svg className="subjects-ambient-graphic subjects-code-graphic" viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="31" y="35" width="238" height="150" rx="22" />
          <path d="m104 91-27 19 27 19M196 91l27 19-27 19M166 73l-32 74" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="57" cy="59" r="4" fill="currentColor" stroke="none" />
          <circle cx="72" cy="59" r="4" fill="currentColor" stroke="none" />
          <circle cx="87" cy="59" r="4" fill="currentColor" stroke="none" />
        </svg>

        <svg className="subjects-ambient-graphic subjects-orbit-graphic" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="120" r="74" />
          <circle cx="120" cy="120" r="43" strokeDasharray="4 8" />
          <path className="subjects-orbit-path" d="M42 120c0-43.1 34.9-78 78-78s78 34.9 78 78-34.9 78-78 78-78-34.9-78-78Z" strokeDasharray="7 12" />
          <circle className="subjects-orbit-node" cx="186" cy="79" r="8" fill="currentColor" stroke="none" />
          <circle cx="120" cy="120" r="10" fill="currentColor" stroke="none" />
        </svg>

        <span className="subjects-data-chip subjects-data-chip-one">{`{ }`}</span>
        <span className="subjects-data-chip subjects-data-chip-two">01</span>
        <span className="subjects-data-chip subjects-data-chip-three">✓</span>
        <span className="subjects-data-chip subjects-data-chip-four">&lt;/&gt;</span>
      </div>

      <header className="subjects-header">
        <div className="subjects-header-brand">
          <span className="brand-mark subjects-home-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.3" fill="currentColor" />
              <path d="M12 5.8v3.8M6.2 9.2l3.5 2M17.8 9.2l-3.5 2M12 14.4v3.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
            </svg>
          </span>
          <div><strong>Materijali za predmete</strong><small>Fakultet tehničkih nauka · Novi Sad</small></div>
        </div>
      </header>

      <main className="subjects-main">
        <section className="subjects-section">
          <h2>Zimski semestar</h2>
          <div className="subjects-grid">
            {winter.map((subject) => (
              <SubjectTile key={subject.id} subject={subject} onOpen={() => onOpenSubject(subject.id)} />
            ))}
          </div>
        </section>

        <section className="subjects-section">
          <h2>Letnji semestar</h2>
          <div className="subjects-grid">
            {summer.map((subject) => (
              <SubjectTile key={subject.id} subject={subject} onOpen={() => onOpenSubject(subject.id)} />
            ))}
          </div>
        </section>
      </main>

      <footer className="subjects-footer">
        <div className="subjects-footer-brand">
          <span className="subjects-footer-mark">FTN</span>
          <span><strong>Univerzitet u Novom Sadu</strong><small>Fakultet tehničkih nauka · Primenjeno softversko inženjerstvo</small></span>
        </div>
        <span className="subjects-footer-copyright">© {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}

export default function StaticApp() {
  const [subject, setSubject] = useState<string | null>(
    window.location.hash.startsWith('#ers')
      ? 'ers'
      : window.location.hash.startsWith('#oib')
        ? 'oib'
        : window.location.hash.startsWith('#odp')
          ? 'odp'
          : null,
  )

  const openSubject = (id: string) => {
    setSubject(id)
    history.replaceState(null, '', `#${id}`)
  }

  const backToSubjects = () => {
    setSubject(null)
    history.replaceState(null, '', window.location.pathname)
  }

  if (subject === 'ers') {
    return (
      <CourseApp
        onBack={backToSubjects}
        hashPrefix="ers"
        brandInitial="E"
        courseName="Elementi razvoja softvera"
        academicYear="2026/2027"
        titlePrefix="ERS"
        doc={practicum2026}
        presentationDownloads={ersPresentationDownloads}
        presentationBundle={{ file: '/downloads/ERS_sve_prezentacije.zip', size: '1,8 MB' }}
        project={ersProjectDocument}
        checkpoints={checkpoints}
      />
    )
  }

  if (subject === 'oib') {
    return (
      <CourseApp
        onBack={backToSubjects}
        hashPrefix="oib"
        brandInitial="S"
        brandAccent="linear-gradient(145deg, #dc2626 0%, #b91c1c 48%, #7f1d1d 100%)"
        brandShadow="rgba(220,38,38,.20)"
        courseName="Osnove informacione bezbednosti"
        academicYear="2026/2027"
        titlePrefix="OIB"
        doc={oibPracticum2026}
        presentationDownloads={oibPresentationDownloads}
        presentationBundle={{ file: '/downloads/OIB_sve_prezentacije.zip', size: '6,2 MB' }}
        project={oibProjectDocument}
        checkpoints={oibCheckpoints}
      />
    )
  }

  if (subject === 'odp') {
    return (
      <CourseApp
        onBack={backToSubjects}
        hashPrefix="odp"
        brandInitial="P"
        brandAccent="linear-gradient(145deg, #059669 0%, #047857 48%, #065f46 100%)"
        brandShadow="rgba(5,150,105,.20)"
        courseName="Osnove distribuiranog programiranja"
        academicYear="2026/2027"
        titlePrefix="ODP"
        doc={odpPracticum2026}
        presentationDecks={odpThematicPresentationDecks}
        checkpoints={odpCheckpoints}
      />
    )
  }

  return <SubjectSelector onOpenSubject={openSubject} />
}
