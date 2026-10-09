import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { CourseApp } from './CourseApp'
import { ErsCourseFiles } from './ErsCourseFiles'
import { DesktopWidgets } from './DesktopWidgets'
import { SystemAbout } from './SystemAbout'
import { CalendarApp, SystemMonitorApp } from './DesktopUtilities'
import { Snake, Merge2048 } from './ExtraGames'
import { loadPreferences, savePreferences, WALLPAPERS } from './DesktopSettings'
import { DockAppIcon } from './DesktopAppIcons'
import { Sudoku, Tetris, SpaceInvaders, type GameId } from './DesktopGames'
import { courses } from '../courses'
import { assetUrl } from '../lib/assets'
import type { CourseId } from '../courses/types'

type AppId = CourseId | GameId | 'snake' | 'merge' | 'notes' | 'readme' | 'trash' | 'calendar' | 'monitor'
type WindowData = { id: AppId; x: number; y: number; z: number; minimized: boolean; maximized: boolean }
type Panel = 'calendar' | 'quick' | null
const names: Record<AppId, string> = {
  ers: 'Elementi razvoja softvera', oib: 'Osnove informacione bezbednosti', odp: 'Osnove distribuiranog programiranja',
  sudoku: 'Sudoku', tetris: 'Tetris', invaders: 'Space Invaders', snake: 'Snake', merge: '2048', notes: 'Beleške', readme: 'O sistemu', trash: 'Korpa', calendar: 'Kalendar', monitor: 'System Monitor',
}
const short: Record<AppId, string> = { ers: 'ERS', oib: 'OIB', odp: 'ODP', sudoku: 'Sudoku', tetris: 'Tetris', invaders: 'Space Invaders', snake: 'Snake', merge: '2048', notes: 'Beleške', readme: 'O sistemu', trash: 'Korpa', calendar: 'Kalendar', monitor: 'System Monitor' }
const applicationIds: AppId[] = ['ers','oib','odp','sudoku','tetris','invaders','snake','merge','notes','calendar','monitor','readme','trash']
const courseIds: AppId[] = ['ers','oib','odp']
const utilityIds: AppId[] = ['sudoku','tetris','invaders','snake','merge','notes','calendar','monitor','readme','trash']
const dashIds: AppId[] = ['sudoku','tetris','invaders','snake','merge','notes','calendar','monitor','readme']
const courseIcon: Record<CourseId, string> = { ers:'folder.svg', oib:'folder-documents.svg', odp:'folder-projects.svg' }
const initialHashCourse = () => {
  const match = location.hash.match(/^#(ers|oib|odp)(?:\/|$)/)
  return match ? match[1] as CourseId : null
}
function Icon({ name, size = 19 }: { name: 'search'|'grid'|'chevron'|'wifi'|'sound'|'battery'|'power'|'settings'|'sun'|'moon'|'layout'|'close'|'minimize'|'maximize'|'restore'|'fullscreen'|'arrow'|'check'|'bell'; size?: number }) {
  const paths: Record<typeof name, ReactNode> = {
    search: <><circle cx="10.7" cy="10.7" r="6.5"/><path d="m16 16 5 5"/></>,
    grid: <>{[4,10,16].flatMap(x=>[4,10,16].map(y=><rect key={x+'-'+y} x={x} y={y} width="4" height="4" rx=".8" fill="currentColor" stroke="none"/>))}</>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    wifi: <><path d="M2 8.5c5.5-5.1 14.5-5.1 20 0M5.5 12.3a9.3 9.3 0 0 1 13 0M9.3 16.2a4 4 0 0 1 5.4 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></>,
    sound: <><path d="M4 10h4l5-4v12l-5-4H4z"/><path d="M17 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"/></>,
    battery: <><rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4"/><rect x="4.5" y="9.5" width="12" height="5" rx="1" fill="currentColor" stroke="none"/></>,
    power: <><path d="M12 2v10"/><path d="M7 5a9 9 0 1 0 10 0"/></>,
    settings: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/></>,
    moon: <path d="M20 16A8 8 0 0 1 8 4 8 8 0 1 0 20 16Z"/>,
    layout: <><rect x="2" y="3" width="20" height="18" rx="3"/><path d="M2 9h20M10 9v12"/></>,
    close: <path d="M6 6 18 18M18 6 6 18"/>,
    minimize: <path d="M5 12h14"/>,
    maximize: <rect x="5" y="5" width="14" height="14" rx="2"/>,
    restore: <><rect x="4" y="8" width="13" height="12" rx="2"/><path d="M9 4h9a2 2 0 0 1 2 2v9"/></>,
    fullscreen: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    check: <path d="m4 12 5 5L20 6"/>,
    bell: <><path d="M5 17h14l-2-3V9a5 5 0 1 0-10 0v5z"/><path d="M10 20h4"/></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
function AppArtwork({ id, folder = false }: { id: AppId; folder?: boolean }) {
  if (id === 'ers' || id === 'oib' || id === 'odp') {
    if (folder) return <img className="gn-folder-svg" src={assetUrl('/gnome-icons/' + courseIcon[id])} alt="" />
    return <span className="gn-app-art"><DockAppIcon id={id}/></span>
  }
  if (id === 'readme') return <span className="gn-app-art"><DockAppIcon id="readme"/></span>
  if (id === 'trash') return <img className="gn-file-svg" src={assetUrl('/gnome-icons/user-trash.svg')} alt="" />
  return <span className="gn-app-art"><DockAppIcon id={id}/></span>
}

function Notes() {
  const [text, setText] = useState(() => {
    try { return localStorage.getItem('ftn-os-notes') ?? '' } catch { return '' }
  })
  return <div className="gn-notes">
    <div className="gn-notes-toolbar"><span>Moje beleške</span><small>Automatski se čuva na ovom uređaju</small></div>
    <textarea aria-label="Moje beleške" value={text} onChange={event => {
      setText(event.target.value)
      try { localStorage.setItem('ftn-os-notes',event.target.value) } catch { /* storage blocked */ }
    }} placeholder="Nova beleška..." />
  </div>
}
function Trash() { return <div className="gn-trash-empty"><AppArtwork id="trash"/><h2>Korpa je prazna</h2><p>Nema obrisanih stavki.</p></div> }

function WindowFrame({ windowData: w, isFocused, gamesActive, now, onFocus, onClose, onMinimize, onMaximize, onMove }: {
  windowData: WindowData; isFocused: boolean; gamesActive:boolean; now:Date; onFocus:()=>void; onClose:()=>void; onMinimize:()=>void; onMaximize:()=>void;
  onMove:(x:number,y:number)=>void
}) {
  const ref=useRef<HTMLElement>(null)
  const dragging=useRef<{px:number;py:number;x:number;y:number}|null>(null)
  const [isFullscreen,setIsFullscreen]=useState(false)
  useEffect(()=>{
    const sync=()=>setIsFullscreen(document.fullscreenElement===ref.current)
    document.addEventListener('fullscreenchange',sync)
    return ()=>document.removeEventListener('fullscreenchange',sync)
  },[])
  const onPointerDown=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(e.button!==0 || w.maximized || isFullscreen || (e.target instanceof Element && e.target.closest('button')))return
    dragging.current={px:e.clientX,py:e.clientY,x:w.x,y:w.y}
    e.currentTarget.setPointerCapture(e.pointerId)
    onFocus()
  }
  const onPointerMove=(e:ReactPointerEvent<HTMLDivElement>)=>{
    if(!dragging.current)return
    const d=dragging.current
    onMove(Math.max(0,Math.min(window.innerWidth-160,d.x+e.clientX-d.px)),Math.max(35,Math.min(window.innerHeight-90,d.y+e.clientY-d.py)))
  }
  const fullscreen=async()=>{
    try{
      if(document.fullscreenElement===ref.current)await document.exitFullscreen()
      else await ref.current?.requestFullscreen()
    }catch{/* browser can deny fullscreen */}
  }
  const title=names[w.id]
  const course=courses.find(c=>c.id===w.id)
  const active=isFocused && !w.minimized && gamesActive
  return <section ref={ref} aria-label={'Prozor: '+title} onPointerDown={onFocus}
    className={'gn-window'+(isFocused?' gn-window-focused':'')+(w.maximized?' gn-window-max':'')+(w.minimized?' gn-window-min':'')+(['calendar','monitor'].includes(w.id)?' gn-utility-window':'')}
    style={{left:w.x,top:w.y,zIndex:w.z} as CSSProperties}>
    <div className="gn-headerbar" onDoubleClick={onMaximize} onPointerDown={onPointerDown}
      onPointerMove={onPointerMove} onPointerUp={()=>dragging.current=null} onPointerCancel={()=>dragging.current=null}>
      <div className="gn-window-leading"><AppArtwork id={w.id}/></div>
      <div className="gn-header-title"><strong>{course ? course.name : title}</strong><span>{course ? 'Nastavni materijali · '+course.code : w.id==='notes' ? 'Text Editor' : w.id==='readme' ? 'Settings' : w.id==='calendar' ? 'Calendar' : w.id==='monitor' ? 'Resources' : w.id==='trash' ? 'Files' : 'Igre'}</span></div>
      <div className="gn-window-controls">
        <button title="Minimizuj" aria-label="Minimizuj" onClick={onMinimize}><Icon name="minimize" size={15}/></button>
        <button title={w.maximized?'Vrati prozor':'Maksimizuj'} aria-label={w.maximized?'Vrati prozor':'Maksimizuj'} onClick={onMaximize}><Icon name={w.maximized?'restore':'maximize'} size={15}/></button>
        <button title={isFullscreen?'Izađi iz celog ekrana':'Ceo ekran'} aria-label="Ceo ekran" onClick={fullscreen}><Icon name="fullscreen" size={15}/></button>
        <button className="gn-close" title="Zatvori" aria-label="Zatvori" onClick={onClose}><Icon name="close" size={15}/></button>
      </div>
    </div>
    <div className={'gn-window-body'+(course?' gn-course-body':'')+(course?.id==='ers'?' gn-course-files-body':'')}>
      {course ? (course.id==='ers'?<ErsCourseFiles course={course}/>:<CourseApp course={course} embedded onBack={onClose}/>) :
        w.id==='sudoku'?<Sudoku active={active}/> :
        w.id==='tetris'?<Tetris active={active}/> :
        w.id==='invaders'?<SpaceInvaders active={active}/> :
        w.id==='snake'?<Snake active={active}/> :
        w.id==='merge'?<Merge2048 active={active}/> :
        w.id==='calendar'?<CalendarApp now={now}/> :
        w.id==='monitor'?<SystemMonitorApp/> :
        w.id==='notes'?<Notes/> : w.id==='readme'?<SystemAbout/>:<Trash/>}
    </div>
  </section>
}

function Calendar({ now }: { now:Date }) {
  const dt=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Belgrade',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now)
  const year=Number(dt.find(x=>x.type==='year')?.value)
  const month=Number(dt.find(x=>x.type==='month')?.value)
  const day=Number(dt.find(x=>x.type==='day')?.value)
  const offset=(new Date(year,month-1,1).getDay()+6)%7
  const length=new Date(year,month,0).getDate()
  const monthName=new Intl.DateTimeFormat('sr-RS',{timeZone:'Europe/Belgrade',month:'long',year:'numeric'}).format(now)
  return <div className="gn-calendar" aria-label="Kalendar">
    <h3>{monthName}</h3>
    <div className="gn-calendar-grid">
      {['Po','Ut','Sr','Če','Pe','Su','Ne'].map(d=><strong key={d}>{d}</strong>)}
      {Array.from({length:offset},(_,i)=><span key={'empty'+i}/>)}
      {Array.from({length},(_,i)=><span key={i} className={i+1===day?'gn-today':''}>{i+1}</span>)}
    </div>
  </div>
}
export function GnomeDesktop({onLogout}:{onLogout:()=>void}) {
  const [windows,setWindows]=useState<WindowData[]>(()=>{
    const course=initialHashCourse()
    return course?[{id:course,x:140,y:88,z:3,minimized:false,maximized:false}]:[]
  })
  const [selected,setSelected]=useState<AppId|null>(null)
  const [overview,setOverview]=useState(false)
  const [search,setSearch]=useState('')
  const [panel,setPanel]=useState<Panel>(null)
  const [saved]=useState(loadPreferences)
  const [showWidgets,setShowWidgets]=useState(saved.widgets)
  const [isDark,setIsDark]=useState(saved.dark)
  const [nightLight,setNightLight]=useState(saved.nightLight)
  const [brightness,setBrightness]=useState(saved.brightness)
  const [wallpaper,setWallpaper]=useState(saved.wallpaper)
  const [now,setNow]=useState(()=>new Date())
  const [context,setContext]=useState<{x:number;y:number}|null>(null)
  const searchRef=useRef<HTMLInputElement>(null)
  const zRef=useRef(4)
  useEffect(()=>{
    document.title='Nastavni portal | FTN'
    const timer=window.setInterval(()=>setNow(new Date()),1000)
    return()=>window.clearInterval(timer)
  },[])
  useEffect(()=>{savePreferences({wallpaper,dark:isDark,widgets:showWidgets,nightLight,brightness})},[wallpaper,isDark,showWidgets,nightLight,brightness])
  useEffect(()=>{if(overview)searchRef.current?.focus()},[overview])
  const focus=useCallback((id:AppId)=>{
    const z=++zRef.current
    setWindows(current=>current.map(w=>w.id===id?{...w,minimized:false,z}:w))
  },[])
  const open=useCallback((id:AppId)=>{
    const z=++zRef.current
    setWindows(current=>current.some(w=>w.id===id)?
      current.map(w=>w.id===id?{...w,minimized:false,z}:w):
      [...current,{id,x:125+(current.length%5)*43,y:85+(current.length%5)*27,z,minimized:false,maximized:false}])
    setOverview(false);setSearch('');setPanel(null);setContext(null)
  },[])
  useEffect(()=>{
    const onHash=()=>{const course=initialHashCourse();if(course)open(course)}
    window.addEventListener('hashchange',onHash)
    return()=>window.removeEventListener('hashchange',onHash)
  },[open])
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        setPanel(null);setContext(null);setSelected(null)
        if(search)setSearch('')
        else setOverview(false)
      }
      const target=event.target
      if(target instanceof HTMLElement && (target.matches('input,textarea')||target.isContentEditable))return
      if(event.key==='Meta'||(event.ctrlKey&&event.code==='Space')){
        if(event.ctrlKey)event.preventDefault()
        setOverview(v=>!v);setPanel(null);setContext(null)
      }
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  },[search])
  const close=(id:AppId)=>setWindows(current=>current.filter(w=>w.id!==id))
  const minimize=(id:AppId)=>setWindows(current=>current.map(w=>w.id===id?{...w,minimized:true}:w))
  const maximize=(id:AppId)=>setWindows(current=>current.map(w=>w.id===id?{...w,maximized:!w.maximized}:w))
  const move=(id:AppId,x:number,y:number)=>setWindows(current=>current.map(w=>w.id===id?{...w,x,y}:w))
  const activeWindow=windows.filter(w=>!w.minimized).reduce<WindowData|null>((last,w)=>!last||w.z>last.z?w:last,null)
  const filteredApps=applicationIds.filter(id=>short[id].toLowerCase().includes(search.toLowerCase())||names[id].toLowerCase().includes(search.toLowerCase()))
  const dateString=new Intl.DateTimeFormat('sr-RS',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Belgrade'}).format(now)
  const timeString=new Intl.DateTimeFormat('sr-RS',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Belgrade'}).format(now)
  const panelToggle=(id:Panel)=>{setPanel(current=>current===id?null:id);setContext(null)}
  return <div className={'gn-shell'+(!isDark?' gn-light':'')+(nightLight?' gn-nightlight':'')+(wallpaper===0?' gn-wallpaper-default':'')}
    style={{'--gn-brightness':String(brightness/100),'--gn-wallpaper':WALLPAPERS[wallpaper].background} as CSSProperties}>
    <div className="gn-wallpaper" aria-hidden="true"/>
    <header className="gn-topbar">
      <div className="gn-top-left">
        <button className={'gn-activities'+(overview?' gn-activities-active':'')} onClick={()=>{setOverview(v=>!v);setPanel(null)}} aria-expanded={overview}>Aktivnosti <span className="gn-activities-dot"/></button>
        {activeWindow && <span className="gn-running-name">{short[activeWindow.id]}</span>}
      </div>
      <button className={'gn-top-clock'+(panel==='calendar'?' gn-top-button-active':'')} onClick={()=>panelToggle('calendar')} aria-expanded={panel==='calendar'}>
        {dateString} &nbsp; {timeString}<span className="gn-clock-dot">●</span>
      </button>
      <button className={'gn-system-status'+(panel==='quick'?' gn-top-button-active':'')} onClick={()=>panelToggle('quick')} aria-label="Sistemske postavke" aria-expanded={panel==='quick'}>
        <Icon name="wifi" size={17}/><Icon name="sound" size={17}/><Icon name="battery" size={19}/><Icon name="chevron" size={14}/>
      </button>
    </header>

    <main className="gn-desktop" onClick={()=>{setSelected(null);setContext(null);setPanel(null)}} onContextMenu={e=>{
      if(e.target instanceof Element&&e.target.closest('button,.os-widgets'))return
      e.preventDefault();setContext({x:e.clientX,y:e.clientY})
    }}>
      {showWidgets && <div className="gn-widget-rail" onClick={e=>e.stopPropagation()}><DesktopWidgets now={now}/></div>}
      <div className="gn-desktop-items">
        <section className="gn-shortcut-group gn-course-group" aria-label="Predmeti">
          <div className="gn-shortcut-heading"><span>PREDMETI</span><i/></div>
          <div className="gn-shortcut-grid gn-shortcut-courses">
            {courseIds.map(id=><button key={id} className={'gn-desktop-item'+(selected===id?' gn-item-selected':'')}
              onClick={e=>{e.stopPropagation();setSelected(id)}} onDoubleClick={e=>{e.stopPropagation();open(id)}}
              onPointerUp={e=>{if(e.pointerType==='touch')open(id)}}
              onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();open(id)}}}
              aria-label={short[id]+', dvoklik za otvaranje'} title={names[id]}>
              <AppArtwork id={id} folder/><span>{short[id]}</span>
            </button>)}
          </div>
        </section>
        <section className="gn-shortcut-group gn-app-group" aria-label="Aplikacije">
          <div className="gn-shortcut-heading"><span>APLIKACIJE</span><i/></div>
          <div className="gn-shortcut-grid gn-shortcut-apps">
            {utilityIds.map(id=><button key={id} className={'gn-desktop-item'+(selected===id?' gn-item-selected':'')}
              onClick={e=>{e.stopPropagation();setSelected(id)}} onDoubleClick={e=>{e.stopPropagation();open(id)}}
              onPointerUp={e=>{if(e.pointerType==='touch')open(id)}}
              onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();open(id)}}}
              aria-label={short[id]+', dvoklik za otvaranje'} title={names[id]}>
              <AppArtwork id={id} folder/><span>{short[id]}</span>
            </button>)}
          </div>
        </section>
      </div>
    </main>

    {windows.map(w=><WindowFrame key={w.id} windowData={w} isFocused={activeWindow?.id===w.id} gamesActive={!overview && panel===null} now={now}
      onFocus={()=>{if(!w.minimized&&activeWindow?.id!==w.id)focus(w.id)}}
      onClose={()=>close(w.id)} onMinimize={()=>minimize(w.id)} onMaximize={()=>maximize(w.id)}
      onMove={(x,y)=>move(w.id,x,y)}/>)}

    {panel && <><button className="gn-popover-scrim" aria-label="Zatvori meni" onClick={()=>setPanel(null)}/>
      {panel==='calendar'? <div className="gn-calendar-popover">
        <div className="gn-calendar-panel-left"><h3>Obaveštenja</h3><div className="gn-no-notifications"><Icon name="bell" size={36}/><strong>Nema obaveštenja</strong><span>Sve je ažurno.</span></div></div>
        <div className="gn-calendar-panel-right"><div className="gn-calendar-date">{new Intl.DateTimeFormat('sr-RS',{dateStyle:'full',timeZone:'Europe/Belgrade'}).format(now)}</div><Calendar now={now}/><button className="gn-launch-calendar" onClick={()=>open('calendar')}>Otvori Kalendar ↗</button></div>
      </div> : <div className="gn-quick-menu">
        <div className="gn-quick-grid">
          <div className="gn-quick-tile gn-quick-connected"><span className="gn-quick-round"><Icon name="wifi" size={19}/></span><div><strong>Internet</strong><span>Browser konekcija</span></div></div>
          <button className={'gn-quick-tile'+(showWidgets?' gn-quick-enabled':'')} onClick={()=>setShowWidgets(v=>!v)}><span className="gn-quick-round"><Icon name="layout" size={19}/></span><div><strong>Widgeti</strong><span>{showWidgets?'Uključeni':'Isključeni'}</span></div></button>
          <button className={'gn-quick-tile'+(!isDark?' gn-quick-enabled':'')} onClick={()=>setIsDark(v=>!v)}><span className="gn-quick-round"><Icon name="sun" size={19}/></span><div><strong>Tema</strong><span>{isDark?'Tamna':'Svetla'}</span></div></button>
          <button className={'gn-quick-tile'+(nightLight?' gn-quick-enabled':'')} onClick={()=>setNightLight(v=>!v)}><span className="gn-quick-round"><Icon name="moon" size={19}/></span><div><strong>Noćno svetlo</strong><span>{nightLight?'Uključeno':'Isključeno'}</span></div></button>
        </div>
        <div className="gn-quick-slider"><Icon name="sun"/><input type="range" aria-label="Osvetljenje pozadine" min="65" max="120" value={brightness} onChange={e=>setBrightness(Number(e.target.value))}/><span>{brightness}%</span></div>
        <div className="gn-wallpaper-setting">
          <div className="gn-wallpaper-setting-heading"><strong>Pozadina</strong><span>{WALLPAPERS[wallpaper].name}</span></div>
          <div className="gn-wallpaper-options" role="group" aria-label="Izaberi pozadinu">
            {WALLPAPERS.map((item,index)=><button key={item.name} className={'gn-wallpaper-option'+(index===wallpaper?' gn-wallpaper-selected':'')}
              aria-label={item.name} title={item.name+' — '+item.detail} aria-pressed={index===wallpaper}
              onClick={()=>setWallpaper(index)} style={{background:item.background}}>
              {wallpaper===index&&<Icon name="check" size={17}/>}
            </button>)}
          </div>
        </div>
        <div className="gn-quick-footer"><span>student · Nastavni portal</span><button title="O sistemu" onClick={()=>open('readme')}><Icon name="settings"/></button>
          <button title="Odjavi se" aria-label="Odjavi se" onClick={onLogout}><Icon name="power"/></button></div>
      </div>}
    </>}

    {context && <><button className="gn-context-scrim" aria-label="Zatvori kontekstni meni" onClick={()=>setContext(null)}/>
      <div className="gn-context" style={{left:Math.min(context.x,innerWidth-236),top:Math.min(context.y,innerHeight-180)}}>
        <button onClick={()=>{setOverview(true);setContext(null)}}>Prikaži aktivnosti</button>
        <button onClick={()=>{setShowWidgets(v=>!v);setContext(null)}}>{showWidgets?'Sakrij widgete':'Prikaži widgete'}</button>
        <hr/><button onClick={()=>open('notes')}>Otvori beleške</button><button onClick={()=>open('readme')}>O sistemu</button><button onClick={()=>{setWallpaper((wallpaper+1)%WALLPAPERS.length);setContext(null)}}>Promeni pozadinu</button><hr/><button onClick={onLogout}>Odjavi se</button>
      </div>
    </>}

    {overview && <><button className="gn-drawer-scrim" aria-label="Zatvori pregled aplikacija" onClick={()=>{setOverview(false);setSearch('')}}/>
      <div className="gn-overview">
      <button className="gn-overview-dismiss" aria-label="Zatvori pregled" onClick={()=>{setOverview(false);setSearch('')}}/>
      <button className="gn-overview-close" title="Zatvori aplikacije" aria-label="Zatvori aplikacije" onClick={()=>{setOverview(false);setSearch('')}}><Icon name="close" size={17}/></button>
      <div className="gn-overview-body">
        <div className="gn-overview-top"><input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pretraži..." aria-label="Pretraži aplikacije"/>
          <Icon name="search" size={19}/></div>
        <div className="gn-apps-overview">
          <div className="gn-apps-overview-heading"><div><span className="gn-apps-eyebrow">FTN DESKTOP</span><h2>{search ? 'Rezultati pretrage' : 'Sve aplikacije'}</h2></div><span>{filteredApps.length} {filteredApps.length === 1 ? 'aplikacija' : 'aplikacija'}</span></div>
          <div className="gn-app-grid">
            {filteredApps.map((id,index)=><button key={id} onClick={()=>open(id)}
              style={{ '--gn-app-index': index } as CSSProperties} title={names[id]}>
              <AppArtwork id={id}/>
              <span>{short[id]}</span>
            </button>)}
          </div>
          {!filteredApps.length && <div className="gn-no-app-results"><Icon name="search" size={30}/><strong>Nema rezultata</strong><span>Probaj drugi naziv predmeta ili aplikacije.</span></div>}
        </div>
      </div>
    </div></>}
    <nav className="gn-bottom-dock" aria-label="Traka aplikacija">
      <button className={'gn-dock-apps'+(overview?' gn-dock-current':'')} title="Sve aplikacije" aria-label="Sve aplikacije" onClick={()=>{setSearch('');setOverview(v=>!v);setPanel(null)}}><Icon name="grid" size={25}/></button>
      <span className="gn-bottom-separator"/>
      {dashIds.map(id=><button key={id} className={'gn-dock-icon'+(activeWindow?.id===id?' gn-dock-current':'')} title={names[id]} aria-label={names[id]}
        onClick={()=>{const w=windows.find(item=>item.id===id);if(w && !w.minimized && activeWindow?.id===id && !overview)minimize(id);else open(id)}}>
        <AppArtwork id={id}/>{windows.some(w=>w.id===id)&&<i className="gn-running-dot"/>}
      </button>)}
      <span className="gn-bottom-separator"/>
      <button className="gn-dock-icon" title="Korpa" aria-label="Korpa" onClick={()=>open('trash')}><AppArtwork id="trash"/></button>
    </nav>
  </div>
}
