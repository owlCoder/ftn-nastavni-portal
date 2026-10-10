import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { WALLPAPERS, type DesktopPreferences } from './DesktopSettings'
import type { CourseId } from '../courses/types'

export type UtilityId = 'calculator'|'editor'|'terminal'|'files'|'tasks'|'pomodoro'|'converter'|'draw'|'stopwatch'|'settings'

type SettingsProps = { preferences:DesktopPreferences; onChange:(patch:Partial<DesktopPreferences>)=>void }
const load=(key:string,fallback:string)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}}
const persist=(key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{/* private mode */}}
function Header({eyebrow,title,description,actions}:{eyebrow:string;title:string;description:string;actions?:React.ReactNode}){
  return <header className="ftn-tool-heading"><div><span>{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>{actions&&<div className="ftn-tool-actions">{actions}</div>}</header>
}
function Card({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={'ftn-tool-card '+className}>{children}</section>}
function download(name:string,content:string,type='text/plain'){
  const url=URL.createObjectURL(new Blob([content],{type}))
  const link=document.createElement('a');link.href=url;link.download=name;link.click()
  window.setTimeout(()=>URL.revokeObjectURL(url),3000)
}
function calculate(expression:string):number{
  // Pure local arithmetic parser. Never call eval() or Function().
  const tokens=expression.replace(/\s+/g,'').match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/%]/g)
  if(!tokens||tokens.join('')!==expression.replace(/\s+/g,''))throw Error('Neispravan izraz')
  let i=0
  function factor():number{
    const t=tokens![i++];if(t===undefined)throw Error('Nedovršen izraz')
    if(t==='-')return -factor()
    if(t==='+')return factor()
    if(t==='('){const n=add();if(tokens![i++]!==')')throw Error('Nedostaje zagrada');return n}
    const number=Number(t);if(!Number.isFinite(number))throw Error('Neispravan broj')
    return number
  }
  function multiply():number{
    let n=factor()
    while(['*','/','%'].includes(tokens![i])){
      const op=tokens![i++],v=factor()
      n=op==='*'?n*v:op==='/'?n/v:n%v
    }
    return n
  }
  function add():number{
    let n=multiply()
    while(tokens![i]==='+'||tokens![i]==='-'){
      const op=tokens![i++],v=multiply();n=op==='+'?n+v:n-v
    }
    return n
  }
  const result=add()
  if(i!==tokens.length||!Number.isFinite(result))throw Error('Neispravan izraz')
  return Number(result.toPrecision(12))
}
export function CalculatorApp(){
  const [expr,setExpr]=useState('');const [result,setResult]=useState('0')
  const action=(value:string)=>{
    if(value==='AC'){setExpr('');setResult('0');return}
    if(value==='⌫'){setExpr(s=>s.slice(0,-1));return}
    if(value==='='){try{const n=calculate(expr);setResult(String(n));setExpr(String(n))}catch(e){setResult(e instanceof Error?e.message:'Greška')}return}
    setExpr(s=>s+value)
  }
  return <div className="ftn-tool-page"><Header eyebrow="ALATI" title="Kalkulator" description="Osnovne operacije, zagrade i procenti."/>
    <Card className="ftn-calc"><div className="ftn-calc-display"><span>{expr||'0'}</span><strong>{result}</strong></div>
      <div className="ftn-calc-keys">{['AC','(',')','⌫','7','8','9','/','4','5','6','*','1','2','3','-','0','.','%','+','='].map(key=>
        <button key={key} className={key==='='?'ftn-emphasis':''} onClick={()=>action(key)}>{key==='*'?'×':key==='/'?'÷':key}</button>)}</div>
      <p className="ftn-tool-hint">Proračun je lokalni i ne izvršava JavaScript kod.</p>
    </Card>
  </div>
}
export function EditorApp(){
  const [value,setValue]=useState(()=>load('ftn-editor-v1',''))
  const [filename,setFilename]=useState(()=>load('ftn-editor-filename-v1','novi-dokument.txt'))
  useEffect(()=>{persist('ftn-editor-v1',value);persist('ftn-editor-filename-v1',filename)},[value,filename])
  return <div className="ftn-tool-page ftn-editor-page">
    <Header eyebrow="DOKUMENTI" title="Tekst editor" description="Lokalni dokument sa automatskim čuvanjem."
      actions={<button onClick={()=>download(filename.trim()||'dokument.txt',value)}>↓ Sačuvaj fajl</button>}/>
    <Card className="ftn-editor-card"><div className="ftn-editor-bar"><input aria-label="Ime fajla" value={filename} onChange={e=>setFilename(e.target.value)} maxLength={100}/><span>{value.length} karaktera · {value.split(/\s+/).filter(Boolean).length} reči</span></div>
    <textarea spellCheck value={value} onChange={e=>setValue(e.target.value)} placeholder="Počni da pišeš…" aria-label="Tekst dokumenta"/></Card>
  </div>
}
const initialTerm=[{cmd:'FTN Shell 1.0',out:'Upiši help za listu dostupnih komandi.'}]
export function TerminalApp({onOpen}:{onOpen:(id:CourseId)=>void}){
  const [entries,setEntries]=useState(initialTerm)
  const [input,setInput]=useState('')
  const end=useRef<HTMLDivElement>(null)
  useEffect(()=>{end.current?.scrollIntoView({block:'end'})},[entries])
  const run=(event:FormEvent)=>{
    event.preventDefault();const cmd=input.trim();if(!cmd)return
    const [verb,...args]=cmd.split(/\s+/);const arg=args.join(' ')
    if(verb==='clear'){setEntries([]);setInput('');return}
    let out=''
    switch(verb.toLowerCase()){
      case 'help':out='help · clear · date · whoami · pwd · ls · echo <tekst> · cat readme · open ers|oib|odp';break
      case 'date':out=new Date().toLocaleString('sr-RS',{timeZone:'Europe/Belgrade'});break
      case 'whoami':out='student';break
      case 'pwd':out='/home/student';break
      case 'ls':out='ERS/    OIB/    ODP/    Apps/    readme';break
      case 'echo':out=arg;break
      case 'cat':out=arg==='readme'?'FTN Teaching Portal — desktop za nastavne materijale.':'Nepoznat fajl.';break
      case 'open':if(['ers','oib','odp'].includes(arg.toLowerCase())){onOpen(arg.toLowerCase() as CourseId);out='Otvoren predmet '+arg.toUpperCase()}else out='Koristi: open ers | open oib | open odp';break
      default:out='Nepoznata komanda: '+verb+'. Pokušaj help.'
    }
    setEntries(prev=>[...prev.slice(-100),{cmd:'student@ftn:~$ '+cmd,out}]);setInput('')
  }
  return <div className="ftn-terminal"><div className="ftn-term-label"><span className="ftn-status-dot"/> student@ftn — lokalna komandna linija</div>
    <div className="ftn-term-output">{entries.map((entry,index)=><div key={index}><strong>{entry.cmd}</strong><pre>{entry.out}</pre></div>)}<div ref={end}/></div>
    <form onSubmit={run}><span>student@ftn:~$</span><input autoComplete="off" spellCheck={false} aria-label="Komanda" value={input} onChange={e=>setInput(e.target.value)} placeholder="help" /></form>
    <small>Terminal ne pristupa operativnom sistemu niti izvršava stvarne shell komande.</small>
  </div>
}
export function FilesApp({onOpen}:{onOpen:(id:CourseId)=>void}){
  const courses:[CourseId,string,string][]=[['ers','Elementi razvoja softvera','Praktikum, prezentacije i primeri'],['oib','Osnove informacione bezbednosti','Dokumenti i projektne kontrolne tačke'],['odp','Osnove distribuiranog programiranja','Vežbe i izvorni kod']]
  return <div className="ftn-tool-page"><Header eyebrow="NASTAVNI PORTAL" title="Fajlovi" description="Tvoja biblioteka materijala i predmeta."/>
    <div className="ftn-files-path">⌂ &nbsp; Student / Predmeti</div><Card><div className="ftn-files-list">{courses.map(([id,title,description])=>
      <button onClick={()=>onOpen(id)} key={id}><span className="ftn-files-folder">▰</span><span><strong>{title}</strong><small>{description}</small></span><span>Otvori ›</span></button>)}</div></Card>
    <p className="ftn-tool-hint">Predmeti se otvaraju u zasebnim prozorima, sa pregledom PDF i ZIP materijala.</p>
  </div>
}
type Task={id:string;title:string;completed:boolean}
const taskKey='ftn-tasks-v1'
function readTasks():Task[]{try{const p=JSON.parse(load(taskKey,'[]')) as unknown;return Array.isArray(p)?p.filter((v):v is Task=>!!v&&typeof v.title==='string'&&typeof v.id==='string'&&typeof v.completed==='boolean').slice(0,200):[]}catch{return []}}
export function TasksApp(){
  const [tasks,setTasks]=useState<Task[]>(readTasks),[text,setText]=useState(''),[showAll,setShowAll]=useState(true)
  useEffect(()=>persist(taskKey,JSON.stringify(tasks)),[tasks])
  const completed=tasks.filter(x=>x.completed).length
  return <div className="ftn-tool-page"><Header eyebrow="ORGANIZACIJA" title="Zadaci" description="Spisak obaveza koji ostaje sačuvan u browseru."/>
    <Card><div className="ftn-task-summary"><strong>{tasks.length-completed}</strong><span>preostalih zadataka</span><small>{completed} završeno</small></div>
    <form className="ftn-inline-form" onSubmit={e=>{e.preventDefault();if(!text.trim())return;setTasks(t=>[...t,{id:String(Date.now()),title:text.trim().slice(0,140),completed:false}]);setText('')}}>
      <input aria-label="Novi zadatak" placeholder="Dodaj novi zadatak…" value={text} onChange={e=>setText(e.target.value)}/><button type="submit">+ Dodaj</button>
    </form><div className="ftn-tool-filters"><button className={showAll?'active':''} onClick={()=>setShowAll(true)}>Svi</button><button className={!showAll?'active':''} onClick={()=>setShowAll(false)}>Aktivni</button></div>
    <div className="ftn-task-list">{tasks.filter(t=>showAll||!t.completed).map(task=><div key={task.id}><label><input type="checkbox" checked={task.completed} onChange={e=>setTasks(list=>list.map(x=>x.id===task.id?{...x,completed:e.target.checked}:x))}/><span className={task.completed?'completed':''}>{task.title}</span></label><button title="Obriši" onClick={()=>setTasks(list=>list.filter(t=>t.id!==task.id))}>×</button></div>)}
    {!tasks.length&&<p className="ftn-tool-hint">Nema zadataka — dodaj prvi.</p>}</div></Card>
  </div>
}
export function PomodoroApp(){
  const [minutes,setMinutes]=useState(25),[remaining,setRemaining]=useState(1500),[running,setRunning]=useState(false),[sessions,setSessions]=useState(0)
  const deadline=useRef(0)
  useEffect(()=>{
    if(!running)return
    deadline.current=Date.now()+remaining*1000
    const tick=()=>{
      const seconds=Math.max(0,Math.ceil((deadline.current-Date.now())/1000));setRemaining(seconds)
      if(seconds===0){setRunning(false);setSessions(v=>v+1)}
    }
    const interval=window.setInterval(tick,250);return()=>window.clearInterval(interval)
  },[running])
  const choose=(m:number)=>{setRunning(false);setMinutes(m);setRemaining(m*60)}
  return <div className="ftn-tool-page"><Header eyebrow="FOKUS" title="Pomodoro" description="Radni intervali i kratke pauze."/>
    <Card className="ftn-timer-card"><div className="ftn-tool-filters">{[25,5,15].map(m=><button key={m} className={minutes===m?'active':''} onClick={()=>choose(m)}>{m===25?'Fokus 25m':m===5?'Pauza 5m':'Pauza 15m'}</button>)}</div>
      <strong className="ftn-timer-face">{String(Math.floor(remaining/60)).padStart(2,'0')}:{String(remaining%60).padStart(2,'0')}</strong>
      <div className="ftn-timer-progress"><span style={{width:(100-remaining/(minutes*60)*100)+'%'}}/></div>
      <div className="ftn-centered-buttons"><button className="ftn-emphasis" onClick={()=>setRunning(!running)}>{running?'Pauziraj':'Pokreni'}</button><button onClick={()=>choose(minutes)}>Resetuj</button></div>
      <p>{sessions} završenih intervala u ovoj sesiji</p>
    </Card>
  </div>
}
type ConvertKind='length'|'mass'|'data'|'temperature'
const converterUnits:Record<ConvertKind,string[]>={length:['m','km','cm','mi','ft'],mass:['kg','g','lb'],data:['B','KB','MB','GB'],temperature:['°C','°F','K']}
const factors:Record<Exclude<ConvertKind,'temperature'>,Record<string,number>>={
  length:{m:1,km:1000,cm:.01,mi:1609.344,ft:.3048},
  mass:{kg:1,g:.001,lb:.45359237},
  data:{B:1,KB:1024,MB:1048576,GB:1073741824}
}
function convert(value:number,kind:ConvertKind,from:string,to:string){
  if(kind!=='temperature')return value*factors[kind][from]/factors[kind][to]
  const c=from==='°C'?value:from==='°F'?(value-32)*5/9:value-273.15
  return to==='°C'?c:to==='°F'?c*9/5+32:c+273.15
}
export function ConverterApp(){
  const [kind,setKind]=useState<ConvertKind>('length'),[value,setValue]=useState('1'),[from,setFrom]=useState('m'),[to,setTo]=useState('km')
  const number=Number(value),valid=value.trim()!==''&&Number.isFinite(number)
  const result=valid?convert(number,kind,from,to):null
  return <div className="ftn-tool-page"><Header eyebrow="ALATI" title="Konverter" description="Dužina, masa, temperatura i digitalne jedinice."/>
    <Card className="ftn-converter"><div className="ftn-tool-filters">{([['length','Dužina'],['mass','Masa'],['data','Podaci'],['temperature','Temperatura']] as const).map(([id,label])=><button key={id} className={kind===id?'active':''} onClick={()=>{setKind(id);setFrom(converterUnits[id][0]);setTo(converterUnits[id][1])}}>{label}</button>)}</div>
      <label>Vrednost<input type="number" value={value} onChange={e=>setValue(e.target.value)} step="any"/></label>
      <div className="ftn-converter-row"><label>Iz<select value={from} onChange={e=>setFrom(e.target.value)}>{converterUnits[kind].map(unit=><option key={unit}>{unit}</option>)}</select></label>
        <button title="Zameni jedinice" onClick={()=>{setFrom(to);setTo(from)}}>⇄</button>
        <label>U<select value={to} onChange={e=>setTo(e.target.value)}>{converterUnits[kind].map(unit=><option key={unit}>{unit}</option>)}</select></label></div>
      <div className="ftn-converter-result"><span>Rezultat</span><strong>{result===null?'—':Number(result.toPrecision(10)).toLocaleString('sr-RS',{maximumFractionDigits:8})} {to}</strong></div>
    </Card>
  </div>
}
export function DrawApp(){
  const canvas=useRef<HTMLCanvasElement>(null),drawing=useRef(false)
  const [color,setColor]=useState('#3584e4'),[width,setWidth]=useState(4)
  useEffect(()=>{const el=canvas.current;if(!el)return;const ctx=el.getContext('2d');if(!ctx)return;ctx.fillStyle='#ffffff';ctx.fillRect(0,0,900,480)},[])
  const pos=(event:ReactPointerEvent<HTMLCanvasElement>)=>{const bounds=event.currentTarget.getBoundingClientRect();return {x:(event.clientX-bounds.left)*900/bounds.width,y:(event.clientY-bounds.top)*480/bounds.height}}
  const start=(event:ReactPointerEvent<HTMLCanvasElement>)=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;drawing.current=true;event.currentTarget.setPointerCapture(event.pointerId);const p=pos(event);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
  const move=(event:ReactPointerEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const ctx=canvas.current?.getContext('2d');if(!ctx)return;const p=pos(event);ctx.lineTo(p.x,p.y);ctx.stroke()}
  const clear=()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;ctx.fillStyle='#fff';ctx.fillRect(0,0,900,480)}
  const save=()=>{const data=canvas.current?.toDataURL('image/png');if(!data)return;const a=document.createElement('a');a.download='ftn-crtez.png';a.href=data;a.click()}
  return <div className="ftn-tool-page"><Header eyebrow="KREATIVNO" title="Crtanje" description="Skiciraj mišem ili dodirom i sačuvaj sliku."
    actions={<><button onClick={clear}>Obriši</button><button onClick={save}>↓ PNG</button></>}/>
    <Card className="ftn-draw-card"><div className="ftn-draw-bar"><label>Boja <input type="color" value={color} onChange={e=>setColor(e.target.value)}/></label><label>Debljina <input type="range" min="1" max="24" value={width} onChange={e=>setWidth(Number(e.target.value))}/><span>{width}px</span></label></div>
      <canvas ref={canvas} width={900} height={480} aria-label="Platno za crtanje" onPointerDown={start} onPointerMove={move} onPointerUp={()=>drawing.current=false} onPointerCancel={()=>drawing.current=false}/></Card>
  </div>
}
export function StopwatchApp(){
  const [elapsed,setElapsed]=useState(0),[running,setRunning]=useState(false),[laps,setLaps]=useState<number[]>([])
  const last=useRef(0)
  useEffect(()=>{if(!running)return;last.current=Date.now();const timer=window.setInterval(()=>{const now=Date.now();const delta=now-last.current;last.current=now;setElapsed(t=>t+delta)},30);return()=>window.clearInterval(timer)},[running])
  const formatted=(n:number)=>{const cs=Math.floor(n/10)%100;return [Math.floor(n/60000),Math.floor(n/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+'.'+String(cs).padStart(2,'0')}
  return <div className="ftn-tool-page"><Header eyebrow="VREME" title="Štoperica" description="Precizno merenje trajanja i prolaznih vremena."/>
    <Card className="ftn-timer-card"><strong className="ftn-timer-face">{formatted(elapsed)}</strong>
      <div className="ftn-centered-buttons"><button className="ftn-emphasis" onClick={()=>setRunning(!running)}>{running?'Pauza':'Start'}</button><button onClick={()=>setLaps(x=>[elapsed,...x])} disabled={!running}>Krug</button><button onClick={()=>{setRunning(false);setElapsed(0);setLaps([])}}>Reset</button></div>
      <div className="ftn-laps">{laps.map((lap,i)=><div key={i}><span>Krug {laps.length-i}</span><strong>{formatted(lap)}</strong></div>)}</div>
    </Card>
  </div>
}
export function SettingsApp({preferences,onChange}:SettingsProps){
  const [tab,setTab]=useState<'appearance'|'desktop'>('appearance')
  return <div className="ftn-tool-page"><Header eyebrow="PERSONALIZACIJA" title="Podešavanja" description="Izgled i ponašanje FTN radne površine."/>
    <div className="ftn-tool-filters"><button className={tab==='appearance'?'active':''} onClick={()=>setTab('appearance')}>Izgled</button><button className={tab==='desktop'?'active':''} onClick={()=>setTab('desktop')}>Radna površina</button></div>
    {tab==='appearance'?<Card><h3>Tema</h3><div className="ftn-settings-row"><div><strong>Tamni režim</strong><small>Svetle ili tamne površine na desktopu</small></div><input aria-label="Tamni režim" type="checkbox" checked={preferences.dark} onChange={e=>onChange({dark:e.target.checked})}/></div>
    <h3>Pozadina</h3><div className="ftn-settings-wallpapers">{WALLPAPERS.map((wall,i)=><button key={wall.name} className={i===preferences.wallpaper?'selected':''} onClick={()=>onChange({wallpaper:i})} aria-label={wall.name} aria-pressed={i===preferences.wallpaper}><span style={{background:wall.background}}/><small>{wall.name}</small></button>)}</div></Card>:
    <Card><h3>Radna površina</h3><div className="ftn-settings-row"><div><strong>Widgeti</strong><small>Vreme, sat i kalendar sa leve strane</small></div><input type="checkbox" checked={preferences.widgets} onChange={e=>onChange({widgets:e.target.checked})}/></div>
      <div className="ftn-settings-row"><div><strong>Noćno svetlo</strong><small>Toplije boje pozadine</small></div><input type="checkbox" checked={preferences.nightLight} onChange={e=>onChange({nightLight:e.target.checked})}/></div>
      <div className="ftn-settings-row"><div><strong>Osvetljenje pozadine</strong><small>{preferences.brightness}%</small></div><input type="range" min="65" max="120" value={preferences.brightness} onChange={e=>onChange({brightness:Number(e.target.value)})}/></div></Card>}
  </div>
}
export function UtilityApp({id,onOpen,preferences,onSettingsChange}:{id:UtilityId;onOpen:(id:CourseId)=>void;preferences:DesktopPreferences;onSettingsChange:(patch:Partial<DesktopPreferences>)=>void}){
  switch(id){
    case 'calculator':return <CalculatorApp/>
    case 'editor':return <EditorApp/>
    case 'terminal':return <TerminalApp onOpen={onOpen}/>
    case 'files':return <FilesApp onOpen={onOpen}/>
    case 'tasks':return <TasksApp/>
    case 'pomodoro':return <PomodoroApp/>
    case 'converter':return <ConverterApp/>
    case 'draw':return <DrawApp/>
    case 'stopwatch':return <StopwatchApp/>
    case 'settings':return <SettingsApp preferences={preferences} onChange={onSettingsChange}/>
  }
}
