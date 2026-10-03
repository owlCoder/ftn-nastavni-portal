import { useEffect } from 'react'
import { CloseIcon } from '../icons'

export function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
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
        <CloseIcon />
      </button>
      <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
    </div>
  )
}
