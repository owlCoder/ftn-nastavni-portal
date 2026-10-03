import { useEffect, useState, type CSSProperties } from 'react'
import type { PresentationDeck } from '../courses/types'
import { useFullscreen } from '../lib/useFullscreen'
import { FullscreenButton } from './icons'

const REFERENCE_WIDTH = 820

export function PresentationDecksView({ decks }: { decks: PresentationDeck[] }) {
  const [deckId, setDeckId] = useState(decks[0].id)
  const [slideIndex, setSlideIndex] = useState(0)
  const [deckZoom, setDeckZoom] = useState(1)
  const { ref: stageRef, isFullscreen, toggle: toggleFullscreen } = useFullscreen<HTMLDivElement>()
  const deck = decks.find((item) => item.id === deckId) || decks[0]
  const slide = deck.slides[slideIndex] || deck.slides[0]

  const chooseDeck = (nextDeck: PresentationDeck) => {
    setDeckId(nextDeck.id)
    setSlideIndex(0)
  }

  const previousSlide = () => setSlideIndex((current) => Math.max(0, current - 1))
  const nextSlide = () => setSlideIndex((current) => Math.min(deck.slides.length - 1, current + 1))

  useEffect(() => {
    if (!isFullscreen) {
      setDeckZoom(1)
      return
    }
    const canvas = stageRef.current?.querySelector('.slide-canvas') as HTMLElement | null
    if (!canvas) return
    const updateZoom = () => {
      const stage = stageRef.current
      if (!stage) return
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
      <section className="presentation-grid">
        <aside className="deck-list" aria-label="Prezentacije po vežbama">
          {decks.map((item) => (
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
          </article>

          <aside className="deck-overview">
            <h3>Cilj prezentacije</h3>
            <p>{deck.goal}</p>
          </aside>

          <div className="floating-controls no-print">
            <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          </div>
        </section>
      </section>
    </main>
  )
}
