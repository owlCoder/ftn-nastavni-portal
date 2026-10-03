import { useEffect, useRef, useState } from 'react'

/** Tracks and toggles browser fullscreen for one element. */
export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = () => setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const toggle = async () => {
    try {
      if (document.fullscreenElement === ref.current) await document.exitFullscreen()
      else await ref.current?.requestFullscreen()
    } catch {
      // Fullscreen može biti odbijen ako korisnička akcija nije prepoznata.
    }
  }

  return { ref, isFullscreen, toggle }
}
