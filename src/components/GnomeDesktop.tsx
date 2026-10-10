import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ErsCourseFiles } from './ErsCourseFiles'
import { OtherCourseFiles } from './OtherCourseFiles'
import { DesktopWidgets } from './DesktopWidgets'
import { SystemAbout } from './SystemAbout'
import { CalendarApp } from './DesktopUtilities'
import { SystemMonitorPro } from './SystemMonitorPro'
import { UtilityApp, type UtilityId } from './WorkspaceApps'
import { StudioApp, studioIds, studioNames, studioCategories, type StudioAppId } from './StudioApps'
import { DevApp, devIds, devNames, type DevId } from './DeveloperApps'
import { LifeApp, lifeIds, lifeNames, type LifeId } from './LifeApps'
import { Snake, Merge2048 } from './ExtraGames'
import { loadPreferences, savePreferences, WALLPAPERS, type DesktopPreferences } from './DesktopSettings'
import { DockAppIcon } from './DesktopAppIcons'
import { DesktopShortcutGrid, useDesktopConfiguration } from './DesktopWorkspace'
import { Sudoku, Tetris, SpaceInvaders, type GameId } from './DesktopGames'
import { courses } from '../courses'
import { assetUrl } from '../lib/assets'
import type { CourseId } from '../courses/types'

type AppId = CourseId | GameId | 'snake' | 'merge' | 'notes' | 'readme' | 'trash' | 'calendar' | 'monitor' | UtilityId | StudioAppId | DevId | LifeId
const extraIds: UtilityId[] = ['calculator','editor','terminal','files','tasks','pomodoro','converter','draw','stopwatch','settings']
const extraNames: Record<UtilityId,string> = {calculator:'Kalkulator',editor:'Tekst editor',terminal:'Terminal',files:'Fajlovi',tasks:'Zadaci',pomodoro:'Pomodoro',converter:'Konverter',draw:'Crtanje',stopwatch:'Štoperica',settings:'Podešavanja'}
type WindowData = { id: AppId; x: number; y: number; z: number; minimized: boolean; maximized: boolean }
type Panel = 'calendar' | 'quick' | null
const names: Record<AppId, string> = {
  ers: 'Elementi razvoja softvera', oib: 'Osnove informacione bezbednosti', odp: 'Osnove distribuiranog programiranja',
  sudoku: 'Sudoku', tetris: 'Tetris', invaders: 'Space Invaders', snake: 'Snake', merge: '2048', notes: 'Beleške', readme: 'O sistemu', trash: 'Korpa', calendar: 'Kalendar', monitor: 'System Monitor', ...extraNames, ...studioNames, ...devNames, ...lifeNames,
}
const short: Record<AppId, string> = { ers: 'ERS', oib: 'OIB', odp: 'ODP', sudoku: 'Sudoku', tetris: 'Tetris', invaders: 'Space Invaders', snake: 'Snake', merge: '2048', notes: 'Beleške', readme: 'O sistemu', trash: 'Korpa', calendar: 'Kalendar', monitor: 'System Monitor', ...extraNames, ...studioNames, ...devNames, ...lifeNames }
const windowCategories: Partial<Record<AppId,string>> = {
  notes:'Dokumenti',readme:'Informacije o sistemu',trash:'Fajlovi',
  calendar:'Organizacija',monitor:'Performanse',
  calculator:'Alati',editor:'Dokumenti',terminal:'FTN Shell',files:'Fajlovi',
  tasks:'Organizacija',pomodoro:'Fokus',converter:'Alati',draw:'Kreativno',
  stopwatch:'Vreme',settings:'Sistemske postavke',...studioCategories,
  ...Object.fromEntries(devIds.map(id=>[id,'Razvoj'])), ...Object.fromEntries(lifeIds.map(id=>[id,'Alati i učenje'])),
}
const applicationIds: AppId[] = ['ers','oib','odp','sudoku','tetris','invaders','snake','merge','notes','calendar','monitor','readme','trash',...extraIds,...studioIds,...devIds,...lifeIds]

type LauncherCategory = 'all'|'courses'|'games'|'tools'|'study'|'media'|'developer'|'system'
const launcherGroups: {id:LauncherCategory;title:string;apps:AppId[]}[] = [
  {id:'all',title:'Sve',apps:[]},
  {id:'courses',title:'Predmeti',apps:['ers','oib','odp']},
  {id:'games',title:'Igre',apps:['sudoku','tetris','invaders','snake','merge']},
  {id:'tools',title:'Alati',apps:['calculator','editor','terminal','converter','json','markdown','passwords','contrast','matrix','metronome','decisions']},
  {id:'study',title:'Učenje',apps:['flashcards','habits','tasks','pomodoro','typing','kanban','expenses','grades','reading','countdown','planner','quiz']},
  {id:'media',title:'Kreativno',apps:['photos','colors','draw','bookmarks']},
  {id:'developer',title:'Razvoj',apps:['diff','regex','base64','urltools','hashing','csv','entities','timestamp','uuid']},
  {id:'system',title:'Sistem',apps:['files','notes','calendar','worldclock','stopwatch','monitor','settings','readme','trash']}
]
const courseIds: AppId[] = ['ers','oib','odp']
const courseIcon: Record<CourseId, string> = { ers:'folder.svg', oib:'folder-documents.svg', odp:'folder-projects.svg' }
const initialHashCourse = () => {
  const match = location.hash.match(/^#(ers|oib|odp)(?:\/|$)/)
  return match ? match[1] as CourseId : null
}
function Icon({ name, size = 19 }: { name: 'search'|'grid'|'chevron'|'wifi'|'sound'|'battery'|'power'|'settings'|'sun'|'moon'|'layout'|'close'|'minimize'|'maximize'|'restore'|'fullscreen'|'arrow'|'check'|'bell'|'more'; size?: number }) {
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
    more: <><circle cx="5" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.7" fill="currentColor" stroke="none"/></>,
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

function WindowFrame({ windowData: w, isFocused, gamesActive, now, otherWindows, preferences, onSettingsChange, onOpenApp, onWindowMenu, onFocus, onClose, onMinimize, onMaximize, onMove }: {
  windowData: WindowData; isFocused: boolean; gamesActive:boolean; now:Date; otherWindows:WindowData[]; preferences:DesktopPreferences;
  onSettingsChange:(patch:Partial<DesktopPreferences>)=>void;onOpenApp:(id:AppId)=>void;onWindowMenu:(x:number,y:number)=>void;
  onFocus:()=>void; onClose:()=>void; onMinimize:()=>void; onMaximize:()=>void;
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
    onMove(Math.max(0,Math.min(window.innerWidth-160,d.x+e.clientX-d.px)),Math.max(35,Math.min(Math.max(35,window.innerHeight-430),d.y+e.clientY-d.py)))
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
    className={'gn-window'+(isFocused?' gn-window-focused':'')+(w.maximized?' gn-window-max':'')+(w.minimized?' gn-window-min':'')+(['calendar','monitor'].includes(w.id)?' gn-utility-window':'')+' gn-window-app-'+w.id}
    style={{left:w.x,top:w.y,zIndex:w.z,'--gn-window-y':`${w.y}px`} as CSSProperties}>
    <div className="gn-headerbar" onDoubleClick={e=>{if(!(e.target instanceof Element&&e.target.closest("button")))onMaximize()}} onContextMenu={e=>{e.preventDefault();onWindowMenu(e.clientX,e.clientY)}} onPointerDown={onPointerDown}
      onPointerMove={onPointerMove} onPointerUp={()=>dragging.current=null} onPointerCancel={()=>dragging.current=null}>
      <div className="gn-window-leading"><AppArtwork id={w.id}/></div>
      <div className="gn-header-title"><strong>{course ? course.name : title}</strong><span>{course ? 'Nastavni materijali · '+course.code : windowCategories[w.id] ?? 'Igre'}</span></div>
      <div className="gn-window-controls">
        <button className="ftn-window-actions-trigger" title="Meni prozora" aria-label="Meni prozora" onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();onWindowMenu(rect.left,rect.bottom+7)}}><Icon name="more" size={16}/></button>
        <button title="Minimizuj" aria-label="Minimizuj" onClick={onMinimize}><Icon name="minimize" size={15}/></button>
        <button title={w.maximized?'Vrati prozor':'Maksimizuj'} aria-label={w.maximized?'Vrati prozor':'Maksimizuj'} onClick={onMaximize}><Icon name={w.maximized?'restore':'maximize'} size={15}/></button>
        <button title={isFullscreen?'Izađi iz celog ekrana':'Ceo ekran'} aria-label="Ceo ekran" onClick={fullscreen}><Icon name="fullscreen" size={15}/></button>
        <button className="gn-close" title="Zatvori" aria-label="Zatvori" onClick={onClose}><Icon name="close" size={15}/></button>
      </div>
    </div>
    <div className={'gn-window-body'+(course?' gn-course-body':'')+(course?' gn-course-files-body':'')}>
      {course ? (course.id==='ers'?<ErsCourseFiles course={course}/>:<OtherCourseFiles course={course}/>) :
        w.id==='sudoku'?<Sudoku active={active}/> :
        w.id==='tetris'?<Tetris active={active}/> :
        w.id==='invaders'?<SpaceInvaders active={active}/> :
        w.id==='snake'?<Snake active={active}/> :
        w.id==='merge'?<Merge2048 active={active}/> :
        w.id==='calendar'?<CalendarApp now={now}/> :
        w.id==='monitor'?<SystemMonitorPro apps={otherWindows.map(item=>({id:item.id,name:names[item.id],minimized:item.minimized}))} onOpen={id=>onOpenApp(id as AppId)}/> :
        extraIds.includes(w.id as UtilityId)?<UtilityApp id={w.id as UtilityId} onOpen={id=>onOpenApp(id)} preferences={preferences} onSettingsChange={onSettingsChange}/> :
        studioIds.includes(w.id as StudioAppId)?<StudioApp id={w.id as StudioAppId}/> :
        devIds.includes(w.id as DevId)?<DevApp id={w.id as DevId}/> :
        lifeIds.includes(w.id as LifeId)?<LifeApp id={w.id as LifeId}/> :
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
  const {shortcuts,pins,hasShortcut,addShortcut,removeShortcut,moveShortcut,pin,unpin}=useDesktopConfiguration(applicationIds)
  const [shortcutMenu,setShortcutMenu]=useState<{id:AppId;x:number;y:number;source:'desktop'|'dock'|'window'}|null>(null)
  const [overview,setOverview]=useState(false)
  const [search,setSearch]=useState('')
  const [launcherCategory,setLauncherCategory]=useState<LauncherCategory>('all')
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
  const menuRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    document.title='Nastavni portal | FTN'
    const timer=window.setInterval(()=>setNow(new Date()),1000)
    return()=>window.clearInterval(timer)
  },[])
  useEffect(()=>{savePreferences({wallpaper,dark:isDark,widgets:showWidgets,nightLight,brightness})},[wallpaper,isDark,showWidgets,nightLight,brightness])
  useEffect(()=>{if(overview)searchRef.current?.focus()},[overview])
  useEffect(()=>{
    const dismiss=(event:PointerEvent)=>{
      if(event.button!==0)return
      const target=event.target
      if(!(target instanceof Element))return
      if(target.closest('.ftn-shortcut-menu,.gn-context'))return
      setShortcutMenu(null)
      setContext(null)
    }
    const onEscape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setShortcutMenu(null);setContext(null)}
    }
    document.addEventListener('pointerdown',dismiss,true)
    document.addEventListener('keydown',onEscape)
    return()=>{document.removeEventListener('pointerdown',dismiss,true);document.removeEventListener('keydown',onEscape)}
  },[])
  useEffect(()=>{if(shortcutMenu)menuRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus()},[shortcutMenu])
  const focus=useCallback((id:AppId)=>{
    const z=++zRef.current
    setWindows(current=>current.map(w=>w.id===id?{...w,minimized:false,z}:w))
  },[])
  const open=useCallback((id:AppId)=>{
    const z=++zRef.current
    setWindows(current=>current.some(w=>w.id===id)?
      current.map(w=>w.id===id?{...w,minimized:false,z}:w):
      [...current,{id,x:125+(current.length%5)*43,y:85+(current.length%5)*27,z,minimized:false,maximized:false}])
    setOverview(false);setSearch('');setPanel(null);setContext(null);setShortcutMenu(null)
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
        setOverview(v=>!v);setPanel(null);setContext(null);setShortcutMenu(null)
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
  const preferences:DesktopPreferences={wallpaper,dark:isDark,widgets:showWidgets,nightLight,brightness}
  const changeSettings=(patch:Partial<DesktopPreferences>)=>{
    if(patch.wallpaper!==undefined)setWallpaper(patch.wallpaper)
    if(patch.dark!==undefined)setIsDark(patch.dark)
    if(patch.widgets!==undefined)setShowWidgets(patch.widgets)
    if(patch.nightLight!==undefined)setNightLight(patch.nightLight)
    if(patch.brightness!==undefined)setBrightness(patch.brightness)
  }
  const dockIds=Array.from(new Set([...pins,...windows.map(w=>w.id).filter(id=>!pins.includes(id) && !courseIds.includes(id))])) as AppId[]
  const filteredApps=applicationIds.filter(id=>{
    const group=launcherGroups.find(group=>group.id===launcherCategory)
    return (launcherCategory==='all'||Boolean(group?.apps.includes(id))) &&
      (short[id].toLowerCase().includes(search.toLowerCase())||names[id].toLowerCase().includes(search.toLowerCase()))
  })
  const dateString=new Intl.DateTimeFormat('sr-RS',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Belgrade'}).format(now)
  const timeString=new Intl.DateTimeFormat('sr-RS',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Belgrade'}).format(now)
  const panelToggle=(id:Panel)=>{setPanel(current=>current===id?null:id);setContext(null)}
  return <div className={'gn-shell'+(!isDark?' gn-light':'')+(nightLight?' gn-nightlight':'')+(wallpaper===0?' gn-wallpaper-default':'')+(wallpaper<10?' gn-wallpaper-dynamic':'')+(wallpaper>=10&&wallpaper<=17?' gn-wallpaper-photo':'')}
    style={{'--gn-brightness':String(brightness/100),'--gn-wallpaper':WALLPAPERS[wallpaper].background} as CSSProperties}>
    <div className="gn-wallpaper" aria-hidden="true"/>
    <header className="gn-topbar">
      <div className="gn-top-left">
        <button className={'gn-activities'+(overview?' gn-activities-active':'')} onClick={()=>{setOverview(v=>!v);setPanel(null)}} aria-expanded={overview}>Aktivnosti <span className="gn-activities-dot"/></button>
        {activeWindow && <button className="gn-running-name ftn-app-menu-top-trigger" title="Opcije aktivnog prozora"
          aria-label={'Meni aplikacije '+names[activeWindow.id]}
          onClick={e=>{const rect=e.currentTarget.getBoundingClientRect();setShortcutMenu({id:activeWindow.id,x:rect.left,y:rect.bottom+9,source:'window'});setPanel(null);setContext(null)}}>
          {short[activeWindow.id]} <Icon name="chevron" size={13}/>
        </button>}
      </div>
      <button className={'gn-top-clock'+(panel==='calendar'?' gn-top-button-active':'')} onClick={()=>panelToggle('calendar')} aria-expanded={panel==='calendar'}>
        {dateString} &nbsp; {timeString}<span className="gn-clock-dot">●</span>
      </button>
      <button className={'gn-system-status'+(panel==='quick'?' gn-top-button-active':'')} onClick={()=>panelToggle('quick')} aria-label="Sistemske postavke" aria-expanded={panel==='quick'}>
        <Icon name="wifi" size={17}/><Icon name="sound" size={17}/><Icon name="battery" size={19}/><Icon name="chevron" size={14}/>
      </button>
    </header>

    <main className="gn-desktop" onClick={()=>{setSelected(null);setContext(null);setShortcutMenu(null);setPanel(null)}} onContextMenu={e=>{
      if(e.target instanceof Element&&e.target.closest('button,.os-widgets,.gn-window'))return
      e.preventDefault();setContext({x:e.clientX,y:e.clientY})
    }}>
      {showWidgets && <div className="gn-widget-rail" onClick={e=>e.stopPropagation()}><DesktopWidgets now={now}/></div>}
      <div className="gn-desktop-items ftn-shortcut-area" onClick={e=>{
        e.stopPropagation()
        if(e.target instanceof Element&&!e.target.closest('button')){
          setSelected(null);setShortcutMenu(null);setContext(null);setPanel(null)
        }
      }}>
        <div className="ftn-desktop-grid-heading">RADNA POVRŠINA <span>Prevuci ikonicu da je pomeriš</span></div>
        <DesktopShortcutGrid shortcuts={shortcuts} label={id=>short[id as AppId]}
          icon={id=><AppArtwork id={id as AppId} folder={courseIds.includes(id as AppId)}/>}
          open={id=>open(id as AppId)} selected={selected} onSelect={id=>setSelected(id as AppId)}
          onMove={moveShortcut} onContextMenu={(id,x,y)=>{setShortcutMenu({id:id as AppId,x,y,source:'desktop'});setContext(null)}}/>
      </div>
    </main>

    {windows.map(w=><WindowFrame key={w.id} windowData={w} isFocused={activeWindow?.id===w.id} gamesActive={!overview && panel===null} now={now} otherWindows={windows} preferences={preferences} onSettingsChange={changeSettings} onOpenApp={open}
      onFocus={()=>{if(!w.minimized&&activeWindow?.id!==w.id)focus(w.id)}}
      onClose={()=>close(w.id)} onMinimize={()=>minimize(w.id)} onMaximize={()=>maximize(w.id)}
      onMove={(x,y)=>move(w.id,x,y)} onWindowMenu={(x,y)=>{setShortcutMenu({id:w.id,x,y,source:"window"});setContext(null)}}/>)}

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

    {shortcutMenu && <><button className="ftn-shortcut-menu-scrim" onClick={()=>setShortcutMenu(null)} aria-label="Zatvori meni prečice"/>
      <div className="ftn-shortcut-menu" role="menu" aria-label={'Opcije: '+names[shortcutMenu.id]} ref={menuRef}
        style={{left:Math.max(12,Math.min(shortcutMenu.x,window.innerWidth-278)),top:Math.max(44,Math.min(shortcutMenu.y,window.innerHeight-334))}}
        onKeyDown={e=>{if(e.key==='Escape'){setShortcutMenu(null);return}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()}}}>
        <div className="ftn-context-header"><span className="ftn-context-header-art"><AppArtwork id={shortcutMenu.id}/></span><div><strong>{short[shortcutMenu.id]}</strong><small>{windowCategories[shortcutMenu.id]??(courseIds.includes(shortcutMenu.id)?'Predmet':'Aplikacija')}</small></div></div>
        <div className="ftn-menu-group">
          <button role="menuitem" onClick={()=>{open(shortcutMenu.id);setShortcutMenu(null)}}><span className="ftn-menu-symbol">↗</span><span>Otvori aplikaciju</span><kbd>↵</kbd></button>
          {windows.some(w=>w.id===shortcutMenu.id&&!w.minimized)&&<button role="menuitem" onClick={()=>{minimize(shortcutMenu.id);setShortcutMenu(null)}}><span className="ftn-menu-symbol">−</span><span>Minimizuj</span></button>}
          {windows.some(w=>w.id===shortcutMenu.id)&&<button role="menuitem" onClick={()=>{maximize(shortcutMenu.id);setShortcutMenu(null)}}><span className="ftn-menu-symbol">□</span><span>{windows.find(w=>w.id===shortcutMenu.id)?.maximized?'Vrati veličinu':'Maksimizuj'}</span></button>}
        </div>
        {!courseIds.includes(shortcutMenu.id)&&<div className="ftn-menu-group">
          <button role="menuitem" onClick={()=>{hasShortcut(shortcutMenu.id)?removeShortcut(shortcutMenu.id):addShortcut(shortcutMenu.id);setShortcutMenu(null)}}>
            <span className="ftn-menu-symbol">▦</span><span>{hasShortcut(shortcutMenu.id)?'Ukloni prečicu sa desktopa':'Dodaj na desktop'}</span></button>
          <button role="menuitem" onClick={()=>{pins.includes(shortcutMenu.id)?unpin(shortcutMenu.id):pin(shortcutMenu.id);setShortcutMenu(null)}}>
            <span className="ftn-menu-symbol">⌁</span><span>{pins.includes(shortcutMenu.id)?'Ukloni iz docka':'Pinuj u dock'}</span><span className="ftn-menu-state">{pins.includes(shortcutMenu.id)?'✓':''}</span></button>
        </div>}
        {windows.some(w=>w.id===shortcutMenu.id)&&<div className="ftn-menu-group">
          <button className="ftn-menu-danger" role="menuitem" onClick={()=>{close(shortcutMenu.id);setShortcutMenu(null)}}><span className="ftn-menu-symbol">×</span><span>Zatvori prozor</span></button>
        </div>}
      </div></>}
    {overview && <><button className="gn-drawer-scrim" aria-label="Zatvori pregled aplikacija" onClick={()=>{setOverview(false);setSearch('')}}/>
      <div className="gn-overview">
      <button className="gn-overview-dismiss" aria-label="Zatvori pregled" onClick={()=>{setOverview(false);setSearch('')}}/>
      <button className="gn-overview-close" title="Zatvori aplikacije" aria-label="Zatvori aplikacije" onClick={()=>{setOverview(false);setSearch('')}}><Icon name="close" size={17}/></button>
      <div className="gn-overview-body">
        <div className="gn-overview-top"><input ref={searchRef} value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value)setLauncherCategory('all')}} placeholder="Pretraži aplikacije..." aria-label="Pretraži aplikacije"/>
          <Icon name="search" size={19}/></div>
        <div className="gn-apps-overview">
          <div className="gn-apps-overview-heading"><div><span className="gn-apps-eyebrow">FTN DESKTOP</span><h2>{search ? 'Rezultati pretrage' : 'Sve aplikacije'}</h2></div><span>{filteredApps.length} {filteredApps.length === 1 ? 'aplikacija' : 'aplikacija'}</span></div>
          <nav className="ftn-launcher-categories" aria-label="Kategorije aplikacija">
            {launcherGroups.map(group=><button type="button" key={group.id}
              aria-pressed={launcherCategory===group.id} className={launcherCategory===group.id?'active':''}
              onClick={()=>setLauncherCategory(group.id)}>{group.title}<span>{group.id==='all'?applicationIds.length:group.apps.length}</span></button>)}
          </nav>
          <div className="gn-app-grid ftn-launcher-grid">
            {filteredApps.map((id,index)=><div className="ftn-launcher-cell" key={id}
              style={{'--gn-app-index':index} as CSSProperties}>
              <button className="ftn-launcher-open" onClick={()=>open(id)} title={'Otvori '+names[id]}>
                <AppArtwork id={id}/><span>{short[id]}</span>
              </button>
              <div className="ftn-launcher-actions">
                <button type="button" disabled={hasShortcut(id)} onClick={()=>addShortcut(id)}
                  title={hasShortcut(id)?'Već je na desktopu':'Dodaj na desktop'}>{hasShortcut(id)?'✓ Desktop':'+ Desktop'}</button>
                {!courseIds.includes(id)&&<button type="button" onClick={()=>pins.includes(id)?unpin(id):pin(id)} title={pins.includes(id)?'Ukloni iz docka':'Pinuj u dock'}>
                  {pins.includes(id)?'− Dock':'+ Dock'}</button>}
              </div>
            </div>)}
          </div>
          {!filteredApps.length && <div className="gn-no-app-results"><Icon name="search" size={30}/><strong>Nema rezultata</strong><span>Probaj drugi naziv predmeta ili aplikacije.</span></div>}
        </div>
      </div>
    </div></>}
    <nav className="gn-bottom-dock" aria-label="Traka aplikacija">
      <button className={'gn-dock-apps'+(overview?' gn-dock-current':'')} title="Sve aplikacije" aria-label="Sve aplikacije" onClick={()=>{setSearch('');setOverview(v=>!v);setPanel(null)}}><Icon name="grid" size={25}/></button>
      <span className="gn-bottom-separator"/>
      {dockIds.map(id=><button key={id} className={'gn-dock-icon'+(activeWindow?.id===id?' gn-dock-current':'')}
        title={names[id]+(pins.includes(id)?' · pinovano':' · otvoreno')} aria-label={names[id]}
        onContextMenu={e=>{e.preventDefault();setShortcutMenu({id,x:e.clientX,y:e.clientY,source:'dock'});setPanel(null)}}
        onClick={()=>{const w=windows.find(item=>item.id===id);if(w&&!w.minimized&&activeWindow?.id===id&&!overview)minimize(id);else open(id)}}>
        <AppArtwork id={id}/>{windows.some(w=>w.id===id)&&<i className="gn-running-dot"/>}
        {pins.includes(id)&&<i className="ftn-pinned-mark"/>}
      </button>)}
    </nav>
  </div>
}
