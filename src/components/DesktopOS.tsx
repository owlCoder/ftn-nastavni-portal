import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { CourseApp } from './CourseApp'
import { DesktopWidgets } from './DesktopWidgets'
import { Sudoku, Tetris, SpaceInvaders, type GameId } from './DesktopGames'
import { courses } from '../courses'
import type { CourseId } from '../courses/types'

type AppId = CourseId | GameId | 'readme' | 'notes' | 'trash'
type WindowState = { id: AppId; x: number; y: number; z: number; minimized: boolean; maximized: boolean }
const gameNames: Record<GameId, string> = { sudoku: 'Sudoku', tetris: 'Tetris', invaders: 'Space Invaders' }
const utilityNames = { readme: 'README.txt', notes: 'Beleške', trash: 'Korpa' }
const isCourse = (id: AppId): id is CourseId => courses.some(course => course.id === id)
const initialCourse = (): CourseId | null => {
  const match = window.location.hash.match(/^#(ers|oib|odp)(?:\/|$)/)
  return match ? match[1] as CourseId : null
}
const appName = (id: AppId) => courses.find(course => course.id === id)?.name ?? gameNames[id as GameId] ?? utilityNames[id as keyof typeof utilityNames]
const initialWindows = (): WindowState[] => {
  const id = initialCourse()
  return id ? [{ id, x: 180, y: 90, z: 2, minimized: false, maximized: false }] : []
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
  if (isCourse(id)) return <FolderGlyph color="mac" />
  if (id === 'sudoku') return <span className="os-game-art os-sudoku-art"><span>1</span><span>9</span><span>4</span><span>7</span></span>
  if (id === 'tetris') return <span className="os-game-art os-tetris-art"><i /><i /><i /><i /><i /><i /><i /></span>
  if (id === 'invaders') return <span className="os-game-art os-invaders-art">▟<span>✦</span>▙</span>
  if (id === 'notes') return <span className="os-notes-art"><span>NOTES</span><i /><i /><i /></span>
  if (id === 'trash') return <span className="os-trash-art" aria-hidden="true">
    <svg viewBox="0 0 64 70" fill="none"><path d="M13 17h38l-4 44H17l-4-44Z" fill="#e7ecf0" stroke="#93a4ae" strokeWidth="2"/><path d="M10 14h44v7H10z" fill="#f9fafb" stroke="#a2b3be" strokeWidth="2"/><path d="M23 14l2-5h14l2 5" stroke="#f2f7f9" strokeWidth="5"/><path d="M24 30v23m8-23v23m8-23v23" stroke="#a9bac6" strokeWidth="2.5" strokeLinecap="round"/></svg>
  </span>
  return <span className="os-file-art" aria-hidden="true"><svg viewBox="0 0 60 70" fill="none"><path d="M10 4h27l14 14v47H10z" fill="#fff" stroke="#ccd3de" strokeWidth="2"/><path d="M37 4v15h14" fill="#edf1f7" stroke="#ccd3de" strokeWidth="2"/><path d="M17 32h27M17 39h27M17 46h21M17 53h24" stroke="#aebbd1" strokeWidth="2" strokeLinecap="round"/></svg></span>
}

function NotesWindow() {
  const [note, setNote] = useState(() => {
    try { return window.localStorage.getItem('ftn-os-notes') ?? '' }
    catch { return '' }
  })
  const update = (text: string) => {
    setNote(text)
    try { window.localStorage.setItem('ftn-os-notes', text) } catch { /* Private mode may deny storage */ }
  }
  return <div className="os-notes-window">
    <div className="os-utility-toolbar"><strong>Beleške</strong><span>Sačuvano lokalno u browseru</span></div>
    <textarea aria-label="Moje beleške" placeholder="Ovde zapiši ideje, pitanja i stvari za vežbe..." value={note} onChange={event => update(event.target.value)} />
  </div>
}

function ReadmeWindow({ onOpen }: { onOpen: (id: AppId) => void }) {
  return <div className="os-readme-window">
    <div className="os-utility-toolbar"><strong>README.txt</strong><span>FTN OS · Pomoć</span></div>
    <div className="os-readme-paper">
      <h2>Dobro došao u FTN OS.</h2>
      <p>Ovo je tvoj mali radni prostor za nastavne materijale Fakulteta tehničkih nauka.</p>
      <h3>Kako se koristi?</h3>
      <p>Izaberi ikonicu jednim klikom. Otvori je dvoklikom ili tasterom Enter. Na telefonu je dovoljan jedan dodir.</p>
      <p>Prozore pomeraš za naslovnu traku. Dugmad gore levo služe za zatvaranje, minimizovanje i maksimizovanje, a dugme desno za fullscreen. Dock pri dnu ekrana prikazuje otvorene aplikacije.</p>
      <h3>Brzi pristup</h3>
      <div className="os-readme-links">
        {courses.map(course => <button key={course.id} onClick={() => onOpen(course.id)}>📁 {course.name} ↗</button>)}
      </div>
      <p className="os-readme-muted">Widget za vremensku prognozu prikazuje podatke uživo za Novi Sad. Statistika korišćenja sistema je simulacija.</p>
    </div>
  </div>
}

function TrashWindow() {
  return <div className="os-trash-window"><span aria-hidden="true">♲</span><strong>Korpa je prazna</strong><p>Ovde još nema obrisanih fajlova.</p></div>
}

type DesktopItem = { id: AppId; label: string; col: number; row: number }
const desktopItems: DesktopItem[] = [
  { id: 'ers', label: 'ERS', col: 0, row: 0 },
  { id: 'oib', label: 'OIB', col: 1, row: 0 },
  { id: 'odp', label: 'ODP', col: 2, row: 0 },
  { id: 'sudoku', label: 'Sudoku', col: 3, row: 0 },
  { id: 'tetris', label: 'Tetris', col: 4, row: 0 },
  { id: 'invaders', label: 'Space Invaders', col: 5, row: 0 },
  { id: 'readme', label: 'README.txt', col: 2, row: 2 },
  { id: 'notes', label: 'Beleške', col: 4, row: 3 },
  { id: 'trash', label: 'Korpa', col: 5, row: 4 },
]
function WindowView({ windowState, focused, onFocus, onClose, onMinimize, onMaximize, onMove, onOpen }: {
  windowState: WindowState; focused: boolean; onFocus: () => void; onClose: () => void; onOpen: (id: AppId) => void
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
        id === 'tetris' ? <Tetris active={isActive} /> : id === 'invaders' ? <SpaceInvaders active={isActive} /> :
        id === 'notes' ? <NotesWindow /> : id === 'readme' ? <ReadmeWindow onOpen={onOpen} /> : <TrashWindow />}
    </div>
  </section>
}

export function DesktopOS() {
  const [windows, setWindows] = useState<WindowState[]>(initialWindows)
  const [now, setNow] = useState(() => new Date())
  const [launcher, setLauncher] = useState(false)
  const [selected, setSelected] = useState<AppId | null>(null)
  const [widgetsVisible, setWidgetsVisible] = useState(true)
  const [context, setContext] = useState<{ x: number; y: number } | null>(null)
  const zRef = useRef(3)
  useEffect(() => {
    document.title = 'FTN OS — Nastavni portal'
    const timer = window.setInterval(() => setNow(new Date()), 1000)
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
    setContext(null)
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

  const clock = new Intl.DateTimeFormat('sr-RS', { timeZone: 'Europe/Belgrade', hour: '2-digit', minute: '2-digit' }).format(now)
  const date = new Intl.DateTimeFormat('sr-RS', { timeZone: 'Europe/Belgrade', weekday: 'short', day: 'numeric', month: 'short' }).format(now)
  const shortcuts: AppId[] = [...courses.map(course => course.id), 'sudoku', 'tetris', 'invaders', 'notes', 'trash', 'readme']
  const activateIcon = (id: AppId) => { setSelected(id); setContext(null) }

  return <div className="os-desktop" onKeyDown={event => { if (event.key === 'Escape') { setLauncher(false); setContext(null); setSelected(null) } }}>
    <div className="os-wallpaper" aria-hidden="true" />
    <header className="os-menubar">
      <div className="os-menubar-left">
        <button className="os-menu-mark" aria-label="Otvori pokretač aplikacija" title="FTN OS" onClick={() => setLauncher(value => !value)}>✦</button>
        <button className="os-menu-finder" onClick={() => setLauncher(value => !value)}>Finder</button>
        <button onClick={() => open('notes')}>File</button>
        <button title={widgetsVisible ? 'Sakrij widgete' : 'Prikaži widgete'} onClick={() => setWidgetsVisible(visible => !visible)}>View</button>
        <button onClick={() => setLauncher(value => !value)}>Go</button>
        <button onClick={() => focused ? focus(focused) : setLauncher(true)}>Window</button>
        <button onClick={() => open('readme')}>Help</button>
      </div>
      <div className="os-menubar-right">
        <span className="os-top-stat" title="Simulirana upotreba procesora">CPU 28%</span>
        <span className="os-top-stat" title="Simulirana upotreba memorije">RAM 63%</span>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-label="Wi-Fi" role="img"><path d="M2 8c5-5 15-5 20 0M5 12c3.5-3.5 10.5-3.5 14 0M9 16c1.8-1.8 4.2-1.8 6 0M12 20h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <span className="os-menubar-battery" title="Simulirani indikator baterije">▰</span>
        <span className="os-top-divider" />
        <time dateTime={now.toISOString()}>{date} &nbsp; {clock}</time>
      </div>
    </header>

    <main className="os-workspace" onClick={() => { setSelected(null); setContext(null); setLauncher(false) }}
      onContextMenu={event => { if (event.target instanceof Element && event.target.closest('button, .widget')) return; event.preventDefault(); setContext({ x: event.clientX, y: event.clientY }) }}>
      {widgetsVisible && <DesktopWidgets now={now} />}
      <section className="os-shortcuts" aria-label="Desktop ikonice">
        {desktopItems.map(item => <button key={item.id} type="button"
          className={'os-desktop-icon' + (selected === item.id ? ' os-icon-selected' : '')}
          style={{ '--icon-col': item.col, '--icon-row': item.row } as CSSProperties}
          title={appName(item.id)}
          aria-label={item.label + ', dvoklik za otvaranje'}
          aria-pressed={selected === item.id}
          onClick={event => { event.stopPropagation(); activateIcon(item.id) }}
          onDoubleClick={event => { event.stopPropagation(); open(item.id) }}
          onPointerUp={event => { if (event.pointerType === 'touch') open(item.id) }}
          onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); open(item.id) } }}>
          <span className="os-icon-visual"><AppGlyph id={item.id} /></span>
          <span className="os-icon-label">{item.label}</span>
        </button>)}
      </section>
    </main>

    {windows.map(w => <WindowView key={w.id} windowState={w} focused={focused === w.id}
      onFocus={() => { if (!w.minimized && focused !== w.id) focus(w.id) }}
      onClose={() => close(w.id)} onMinimize={() => minimize(w.id)} onMaximize={() => maximize(w.id)}
      onMove={(x, y) => move(w.id, x, y)} onOpen={open} />)}

    {context && <div className="os-context-menu" style={{ left: Math.min(context.x, window.innerWidth - 210), top: Math.min(context.y, window.innerHeight - 190) }}>
      <button onClick={() => { setContext(null); setSelected(null) }}>Osveži desktop</button>
      <button onClick={() => { setContext(null); setWidgetsVisible(value => !value) }}>{widgetsVisible ? 'Sakrij widgete' : 'Prikaži widgete'}</button>
      <hr />
      <button onClick={() => open('notes')}>Otvori beleške</button>
      <button onClick={() => open('readme')}>Pomoć / README</button>
    </div>}

    {launcher && <div className="os-launcher">
      <div className="os-launcher-title"><span>✦</span><div><strong>Applications</strong><small>FTN OS · 2026/27</small></div></div>
      {shortcuts.map(id => <button key={id} onClick={() => open(id)}><span className="os-launcher-icon"><AppGlyph id={id} /></span><span>{appName(id)}</span><span className="os-launcher-arrow">↗</span></button>)}
    </div>}

    <footer className="os-dock-area">
      <nav className="os-dock" aria-label="Dock">
        <button className={'os-dock-button os-dock-home' + (launcher ? ' os-dock-selected' : '')}
          onClick={() => setLauncher(value => !value)} title="Finder / Aplikacije" aria-label="Finder / Aplikacije">
          <span className="os-finder-face"><span>◡</span></span>
        </button>
        <span className="os-dock-separator" />
        {shortcuts.filter(id => id !== 'readme' && id !== 'trash').map(id => {
          const w = windows.find(existing => existing.id === id)
          return <button key={id} className={'os-dock-button' + (focused === id ? ' os-dock-selected' : '')}
            title={appName(id)} aria-label={appName(id)}
            onClick={() => w && !w.minimized && focused === id ? minimize(id) : open(id)}>
            <span className="os-dock-glyph"><AppGlyph id={id} /></span>{w && <span className="os-dock-indicator" />}
          </button>
        })}
        <span className="os-dock-separator" />
        <button className="os-dock-button" onClick={() => open('trash')} aria-label="Korpa" title="Korpa"><span className="os-dock-glyph"><AppGlyph id="trash" /></span>{windows.some(w => w.id === 'trash') && <span className="os-dock-indicator" />}</button>
      </nav>
    </footer>
  </div>
}
