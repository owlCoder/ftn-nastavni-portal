import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { CourseApp } from './CourseApp'
import { Sudoku, Tetris, SpaceInvaders, type GameId } from './DesktopGames'
import { courses } from '../courses'
import type { CourseId } from '../courses/types'

type AppId = CourseId | GameId
type WindowState = { id: AppId; x: number; y: number; z: number; minimized: boolean; maximized: boolean }
const gameNames: Record<GameId, string> = { sudoku: 'Sudoku', tetris: 'Block stack', invaders: 'Space Invaders' }
const isCourse = (id: AppId): id is CourseId => courses.some(course => course.id === id)
const initialCourse = (): CourseId | null => {
  const match = window.location.hash.match(/^#(ers|oib|odp)(?:\/|$)/)
  return match ? match[1] as CourseId : null
}
const appName = (id: AppId) => courses.find(course => course.id === id)?.name ?? gameNames[id as GameId]
const initialWindows = (): WindowState[] => {
  const id = initialCourse()
  return id ? [{ id, x: 120, y: 90, z: 2, minimized: false, maximized: false }] : []
}

function FolderGlyph({ color = 'blue' }: { color?: string }) {
  return <svg className={`os-folder-art os-folder-${color}`} viewBox="0 0 90 80" fill="none" aria-hidden="true">
    <path d="M8 17a7 7 0 0 1 7-7h21l9 10h30a7 7 0 0 1 7 7v36a8 8 0 0 1-8 8H15a8 8 0 0 1-8-8V17Z" fill="currentColor" opacity=".67"/>
    <path d="M8 30a8 8 0 0 1 8-8h60a8 8 0 0 1 8 8l-5 34a8 8 0 0 1-8 7H16a8 8 0 0 1-8-8V30Z" fill="currentColor"/>
    <path d="M17 31h51" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".48"/>
    <path d="M18 58h50" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".18"/>
  </svg>
}

function AppGlyph({ id }: { id: AppId }) {
  if (isCourse(id)) return <FolderGlyph color={id === 'ers' ? 'blue' : id === 'oib' ? 'coral' : 'mint'} />
  if (id === 'sudoku') return <span className="os-game-art os-sudoku-art"><span>1</span><span>9</span><span>4</span><span>7</span></span>
  if (id === 'tetris') return <span className="os-game-art os-tetris-art"><i /><i /><i /><i /><i /><i /><i /></span>
  return <span className="os-game-art os-invaders-art">▟<span>✦</span>▙</span>
}

function WindowView({ windowState, focused, onFocus, onClose, onMinimize, onMaximize, onMove }: {
  windowState: WindowState; focused: boolean; onFocus: () => void; onClose: () => void
  onMinimize: () => void; onMaximize: () => void; onMove: (x: number, y: number) => void
}) {
  const ref = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const id = windowState.id
  const subject = courses.find(course => course.id === id)
  const isActive = focused && !windowState.minimized
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === ref.current) await document.exitFullscreen()
      else await ref.current?.requestFullscreen()
    } catch { /* Browser may reject fullscreen. Maximizing remains available. */ }
  }
  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || windowState.maximized || fullscreen ||
      (event.target instanceof Element && event.target.closest('button'))) return
    drag.current = { x: event.clientX, y: event.clientY, startX: windowState.x, startY: windowState.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    onFocus()
  }
  const dragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    onMove(Math.max(0, Math.min(window.innerWidth - 120, drag.current.startX + event.clientX - drag.current.x)),
      Math.max(45, Math.min(window.innerHeight - 90, drag.current.startY + event.clientY - drag.current.y)))
  }
  const stopDrag = () => { drag.current = null }
  return <section ref={ref} className={['os-window', focused ? 'os-focused' : '', windowState.maximized ? 'os-maximized' : '', windowState.minimized ? 'os-minimized' : ''].join(' ')}
    style={{ '--os-x': `${windowState.x}px`, '--os-y': `${windowState.y}px`, zIndex: windowState.z } as CSSProperties}
    onPointerDown={onFocus} aria-label={`Prozor: ${appName(id)}`}>
    <div className="os-titlebar" onPointerDown={startDrag} onPointerMove={dragMove} onPointerUp={stopDrag} onPointerCancel={stopDrag} onDoubleClick={onMaximize}>
      <div className="os-traffic" aria-label="Kontrole prozora">
        <button className="os-close" aria-label="Zatvori prozor" title="Zatvori" onClick={onClose}><span>×</span></button>
        <button className="os-min" aria-label="Minimizuj prozor" title="Minimizuj" onClick={onMinimize}><span>−</span></button>
        <button className="os-max" aria-label={windowState.maximized ? 'Vrati prozor' : 'Maksimizuj prozor'} title="Maksimizuj" onClick={onMaximize}><span>↗</span></button>
      </div>
      <div className="os-window-label"><span className="os-window-app-dot" />{subject ? `${subject.code} / Nastavni materijali` : appName(id)}</div>
      <button className="os-fullscreen" onClick={toggleFullscreen} title={fullscreen ? 'Izađi iz celog ekrana' : 'Ceo ekran'} aria-label={fullscreen ? 'Izađi iz celog ekrana' : 'Ceo ekran'}>
        {fullscreen ? '⊟' : '⛶'}
      </button>
    </div>
    <div className={`os-window-content ${subject ? 'os-course-content' : 'os-game-content'}`}>
      {subject ? <CourseApp key={subject.id} course={subject} onBack={onClose} embedded /> :
        id === 'sudoku' ? <Sudoku active={isActive} /> :
        id === 'tetris' ? <Tetris active={isActive} /> : <SpaceInvaders active={isActive} />}
    </div>
  </section>
}

export function DesktopOS() {
  const [windows, setWindows] = useState<WindowState[]>(initialWindows)
  const [now, setNow] = useState(() => new Date())
  const [launcher, setLauncher] = useState(false)
  const zRef = useRef(3)
  useEffect(() => {
    document.title = 'FTN OS — Nastavni portal'
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const focus = useCallback((id: AppId) => {
    const z = ++zRef.current
    setWindows(previous => previous.map(w => w.id === id ? { ...w, z, minimized: false } : w))
  }, [])

  const open = useCallback((id: AppId) => {
    const z = ++zRef.current
    setWindows(previous => previous.some(w => w.id === id)
      ? previous.map(w => w.id === id ? { ...w, minimized: false, z } : w)
      : [...previous, { id, x: 95 + (previous.length % 5) * 42, y: 82 + (previous.length % 5) * 28, z, minimized: false, maximized: false }])
    setLauncher(false)
  }, [])

  useEffect(() => {
    const onHash = () => {
      const id = initialCourse()
      if (id) open(id)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [open])

  const close = (id: AppId) => setWindows(previous => previous.filter(w => w.id !== id))
  const minimize = (id: AppId) => setWindows(previous => previous.map(w => w.id === id ? { ...w, minimized: true } : w))
  const maximize = (id: AppId) => setWindows(previous => previous.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))
  const move = (id: AppId, x: number, y: number) => setWindows(previous => previous.map(w => w.id === id ? { ...w, x, y } : w))
  const focused = windows.filter(w => !w.minimized).reduce<WindowState | null>((best, w) => !best || w.z > best.z ? w : best, null)?.id
  const date = new Intl.DateTimeFormat('sr-RS', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  const clock = new Intl.DateTimeFormat('sr-RS', { hour: '2-digit', minute: '2-digit' }).format(now)
  const shortcuts: AppId[] = [...courses.map(course => course.id), 'sudoku', 'tetris', 'invaders']

  return <div className="os-desktop">
    <div className="os-wallpaper" aria-hidden="true"><div className="os-glow os-glow-one" /><div className="os-glow os-glow-two" /><div className="os-wallpaper-orbit" /><div className="os-wallpaper-grid" /></div>
    <header className="os-menubar">
      <div className="os-menubar-left"><span className="os-logo">✳</span><strong>FTN<span>OS</span></strong><span className="os-menu-divider" /><span className="os-menu-desktop">Desktop</span><span className="os-menu-extra">Fakultet tehničkih nauka</span></div>
      <div className="os-menubar-right"><span className="os-status-dot" /><span>Academic mode</span><span className="os-menu-divider" /><time>{clock}</time></div>
    </header>

    <main className="os-workspace" onClick={() => launcher && setLauncher(false)}>
      <div className="os-welcome">
        <span className="os-eyebrow"><span className="os-status-dot" /> AKADEMSKA 2026/27</span>
        <h1>Tvoj prostor.<br /><em>Tvoja pravila.</em></h1>
        <p>Predmeti, praktikumi i malo zabave. Sve na jednom mestu — kao tvoj omiljeni desktop.</p>
        <div className="os-welcome-actions"><button onClick={() => open('ers')}>Otvori praktikum <span>↗</span></button><span>{date}</span></div>
      </div>
      <section className="os-shortcuts" aria-label="Desktop prečice">
        <div className="os-shortcuts-heading"><span>MOJ DESKTOP</span><span>0{courses.length} FOLDERA</span></div>
        <div className="os-icon-grid">
          {courses.map(course => <button key={course.id} className="os-desktop-icon" onClick={() => open(course.id)} onDoubleClick={() => open(course.id)} title={`Otvori ${course.name}`}>
            <span className="os-icon-visual"><AppGlyph id={course.id} /></span><strong>{course.code}</strong><small>{course.name}</small>
          </button>)}
        </div>
        <div className="os-shortcuts-heading os-games-heading"><span>PAUZA ZA MOZAK</span><span>03 IGRE</span></div>
        <div className="os-icon-grid">
          {(['sudoku','tetris','invaders'] as GameId[]).map(id => <button key={id} className="os-desktop-icon" onClick={() => open(id)} onDoubleClick={() => open(id)} title={`Pokreni ${gameNames[id]}`}>
            <span className="os-icon-visual"><AppGlyph id={id} /></span><strong>{gameNames[id]}</strong><small>{id === 'sudoku' ? 'Logička igra' : id === 'tetris' ? 'Tetris arkada' : 'Retro arkada'}</small>
          </button>)}
        </div>
      </section>
      <aside className="os-desktop-stamp" aria-hidden="true"><span>F T N / 0 1</span><span>STUDY. BUILD. PLAY.</span></aside>
    </main>

    {windows.map(w => <WindowView key={w.id} windowState={w} focused={focused === w.id}
      onFocus={() => { if (!w.minimized && focused !== w.id) focus(w.id) }}
      onClose={() => close(w.id)} onMinimize={() => minimize(w.id)} onMaximize={() => maximize(w.id)}
      onMove={(x, y) => move(w.id, x, y)} />)}

    {launcher && <div className="os-launcher">
      <div className="os-launcher-title"><span>✳</span><div><strong>FTN OS</strong><small>Izaberi aplikaciju</small></div></div>
      {shortcuts.map(id => <button key={id} onClick={() => open(id)}><span className="os-launcher-icon"><AppGlyph id={id} /></span><span>{appName(id)}</span><span className="os-launcher-arrow">↗</span></button>)}
    </div>}

    <footer className="os-dock-area">
      <nav className="os-dock" aria-label="Taskbar">
        <button className={`os-dock-button os-dock-home ${launcher ? 'os-dock-selected' : ''}`} onClick={() => setLauncher(value => !value)} title="Pokretač aplikacija" aria-label="Pokretač aplikacija">✳</button>
        <span className="os-dock-separator" />
        {shortcuts.map(id => {
          const w = windows.find(window => window.id === id)
          return <button key={id} className={`os-dock-button ${focused === id ? 'os-dock-selected' : ''}`}
            title={appName(id)} aria-label={appName(id)} onClick={() => w && !w.minimized && focused === id ? minimize(id) : open(id)}>
            <span className="os-dock-glyph"><AppGlyph id={id} /></span>{w && <span className="os-dock-indicator" />}
          </button>
        })}
        <span className="os-dock-separator" /><div className="os-dock-clock"><strong>{clock}</strong><small>{new Intl.DateTimeFormat('sr-RS', { day: '2-digit', month: '2-digit' }).format(now)}</small></div>
      </nav>
    </footer>
  </div>
}
