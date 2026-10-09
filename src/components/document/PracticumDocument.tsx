import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import { assetUrl } from '../../lib/assets'
import { useFullscreen } from '../../lib/useFullscreen'
import type { Practicum } from '../../practicum/types'
import { FullscreenButton } from '../icons'
import { BlockView } from './BlockView'
import { ImageLightbox } from './ImageLightbox'
import { prepareDocument } from './prepareDocument'

const ZOOM_STEPS = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6]

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

export function PracticumDocument({ practicum }: { practicum: Practicum }) {
  const { prepared, toc } = useMemo(() => prepareDocument(practicum.blocks), [practicum])
  const [zoom, setZoom] = useState(1)
  const [tocCollapsed, setTocCollapsed] = useState(false)
  const [openImage, setOpenImage] = useState<{ src: string; alt: string } | null>(null)
  const { ref: layoutRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>()

  const openLightbox = useCallback((src: string, alt: string) => setOpenImage({ src, alt }), [])
  const closeLightbox = useCallback(() => setOpenImage(null), [])

  const zoomOut = () => setZoom((current) => [...ZOOM_STEPS].reverse().find((step) => step < current) ?? current)
  const zoomIn = () => setZoom((current) => ZOOM_STEPS.find((step) => step > current) ?? current)

  const body = useMemo(
    () => prepared.map((item, index) => <BlockView item={item} key={index} onImageOpen={openLightbox} />),
    [prepared, openLightbox],
  )

  return (
    <div className={`document-layout ${isFullscreen ? 'is-fullscreen' : ''} ${tocCollapsed ? 'toc-collapsed' : ''}`} ref={layoutRef}>
      <aside className="toc-panel">
        <div className="toc-header">
          <div className="toc-title">Sadržaj</div>
          <button type="button" className="toc-collapse" aria-expanded={!tocCollapsed}
            aria-controls="practicum-toc-nav" aria-label={tocCollapsed ? 'Prikaži sadržaj praktikuma' : 'Sakrij sadržaj praktikuma'}
            title={tocCollapsed ? 'Prikaži sadržaj' : 'Sakrij sadržaj'}
            onClick={() => setTocCollapsed(value => !value)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16M4 10h16M4 15h10M4 20h10"/>
              <path d={tocCollapsed ? 'm17 16 3-4-3-4' : 'm20 8-3 4 3 4'} />
            </svg>
          </button>
        </div>
        <nav id="practicum-toc-nav" hidden={tocCollapsed}>
          {toc.map((entry) => (
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
          <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
        </div>

        <div className="document-scroll">
          <div className="document-zoom-frame" style={{ '--doc-zoom': zoom } as CSSProperties}>
            <main className="document-paper">
              <DocumentCover subject={practicum.subject} />
              <article className="document-body">{body}</article>
              <footer className="document-end">
                <span>{practicum.footerText}</span>
                <span>Univerzitet u Novom Sadu · Fakultet tehničkih nauka</span>
              </footer>
            </main>
          </div>
        </div>
      </div>

      {openImage && <ImageLightbox src={openImage.src} alt={openImage.alt} onClose={closeLightbox} />}
    </div>
  )
}
