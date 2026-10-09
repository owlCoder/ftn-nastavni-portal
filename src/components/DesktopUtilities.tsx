import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'

const ZONE='Europe/Belgrade'
const KEY='ftn-os-calendar-events-v1'
type EventItem={id:string;date:string;title:string}
const pad=(n:number)=>String(n).padStart(2,'0')
const keyDate=(year:number,month:number,day:number)=>year+'-'+pad(month)+'-'+pad(day)
function currentParts(now:Date) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:ZONE,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now)
  const get=(type:string)=>Number(parts.find(part=>part.type===type)?.value??0)
  return {year:get('year'),month:get('month'),day:get('day')}
}
const todayName=(date:string)=>new Intl.DateTimeFormat('sr-RS',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:ZONE}).format(new Date(date+'T12:00:00'))
function loadEvents():EventItem[] {
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)??'[]') as unknown
    if(!Array.isArray(parsed))return []
    return parsed.filter((item):item is EventItem=>typeof item==='object' && item!==null &&
      typeof item.id==='string' && typeof item.title==='string' && /^\d{4}-\d{2}-\d{2}$/.test(item.date)).slice(0,150)
  }catch{return []}
}
export function CalendarApp({now}:{now:Date}) {
  const today=useMemo(()=>currentParts(now),[now])
  const [view,setView]=useState(()=>({year:today.year,month:today.month}))
  const [selected,setSelected]=useState(()=>keyDate(today.year,today.month,today.day))
  const [events,setEvents]=useState<EventItem[]>(loadEvents)
  const [text,setText]=useState('')
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(events))}catch{/* storage unavailable */}},[events])
  const monthStart=(new Date(view.year,view.month-1,1).getDay()+6)%7
  const length=new Date(view.year,view.month,0).getDate()
  const cells=Array.from({length:Math.ceil((monthStart+length)/7)*7},(_,i)=>i-monthStart+1)
  const selectedEvents=events.filter(event=>event.date===selected)
  const monthLabel=new Intl.DateTimeFormat('sr-RS',{month:'long',year:'numeric',timeZone:ZONE})
    .format(new Date(view.year,view.month-1,15,12))
  const shift=(amount:number)=>{
    const date=new Date(view.year,view.month-1+amount,1,12)
    setView({year:date.getFullYear(),month:date.getMonth()+1})
  }
  const add=(event:FormEvent)=>{
    event.preventDefault()
    const title=text.trim()
    if(!title)return
    setEvents(previous=>[...previous,{id:String(Date.now())+'-'+Math.random().toString(36).slice(2,7),date:selected,title:title.slice(0,120)}])
    setText('')
  }
  const goToday=()=>{setView({year:today.year,month:today.month});setSelected(keyDate(today.year,today.month,today.day))}
  return <div className="gn-cal-app">
    <div className="gn-utility-head">
      <div><span className="gn-utility-eyebrow">ORGANIZACIJA</span><h2>Kalendar</h2><p>Tvoji datumi i obaveze na jednom mestu.</p></div>
      <button className="gn-utility-secondary" onClick={goToday}>Danas</button>
    </div>
    <div className="gn-cal-layout">
      <section className="gn-cal-sheet" aria-label="Mesečni kalendar">
        <div className="gn-cal-monthbar">
          <strong>{monthLabel}</strong>
          <div><button aria-label="Prethodni mesec" onClick={()=>shift(-1)}>‹</button><button aria-label="Sledeći mesec" onClick={()=>shift(1)}>›</button></div>
        </div>
        <div className="gn-cal-grid">
          {['Pon','Uto','Sre','Čet','Pet','Sub','Ned'].map(label=><div className="gn-cal-weekday" key={label}>{label}</div>)}
          {cells.map((day,i)=>{
            const inMonth=day>0 && day<=length
            const date=inMonth?keyDate(view.year,view.month,day):''
            const hasEvents=inMonth&&events.some(event=>event.date===date)
            const isToday=inMonth&&date===keyDate(today.year,today.month,today.day)
            return inMonth?<button key={i} className={'gn-cal-day'+(selected===date?' gn-cal-selected':'')+(isToday?' gn-cal-today':'')}
              onClick={()=>setSelected(date)} aria-pressed={selected===date} aria-label={date}>
              <span>{day}</span>{hasEvents&&<i/>}
            </button>:<div className="gn-cal-outside" key={i}/>
          })}
        </div>
      </section>
      <aside className="gn-cal-agenda">
        <span className="gn-utility-eyebrow">MOJ RASPORED</span>
        <h3>{todayName(selected)}</h3>
        <div className="gn-cal-events">
          {selectedEvents.length?selectedEvents.map(event=><div className="gn-cal-event" key={event.id}>
            <span>{event.title}</span><button aria-label={'Ukloni: '+event.title} onClick={()=>setEvents(previous=>previous.filter(item=>item.id!==event.id))}>×</button>
          </div>):<div className="gn-cal-empty"><span aria-hidden="true">☷</span><strong>Nema događaja</strong><small>Dodaj podsetnik za izabrani dan.</small></div>}
        </div>
        <form className="gn-cal-add" onSubmit={add}>
          <label htmlFor="gn-cal-event">Novi događaj</label>
          <input id="gn-cal-event" placeholder="npr. Vežbe iz ERS..." maxLength={120} value={text} onChange={event=>setText(event.target.value)}/>
          <button type="submit" disabled={!text.trim()}>+ Dodaj događaj</button>
        </form>
      </aside>
    </div>
  </div>
}

type Metrics={cpu:number;ram:number;disk:number;network:number;gpu:number}
const initial:Metrics={cpu:32,ram:61,disk:42,network:8,gpu:27}
const nextMetric=(value:number,min:number,max:number,step:number)=>Math.max(min,Math.min(max,value+(Math.random()-.48)*step))
export function SystemMonitorApp() {
  const [metrics,setMetrics]=useState<Metrics>(initial)
  const metricsRef=useRef<Metrics>(initial)
  const [history,setHistory]=useState<number[]>([29,31,37,24,40,38,32,44,39,35,42,30,29,41,36,33,40,34,30,32,38,36,33,32])
  const [since]=useState(()=>Date.now())
  const [seconds,setSeconds]=useState(0)
  useEffect(()=>{
    const timer=window.setInterval(()=>{
      const previous=metricsRef.current
      const cpu=Math.round(nextMetric(previous.cpu,9,88,27))
      const next:Metrics={cpu,ram:Math.round(nextMetric(previous.ram,54,74,3)),
        disk:previous.disk,network:Math.round(nextMetric(previous.network,1,60,13)),
        gpu:Math.round(nextMetric(previous.gpu,12,82,22))}
      metricsRef.current=next
      setMetrics(next)
      setHistory(items=>[...items.slice(1),cpu])
      setSeconds(Math.floor((Date.now()-since)/1000))
    },1600)
    return ()=>window.clearInterval(timer)
  },[since])
  const uptime=pad(Math.floor(seconds/3600))+':'+pad(Math.floor(seconds%3600/60))+':'+pad(seconds%60)
  const cards:{id:keyof Metrics;title:string;sub:string;unit:string}[]=[
    {id:'cpu',title:'CPU',sub:'Ryzen 9 9950X3D',unit:'%'},
    {id:'gpu',title:'GPU',sub:'RTX 5090',unit:'%'},
    {id:'ram',title:'RAM',sub:'128 GB DDR5',unit:'%'},
    {id:'disk',title:'Skladište',sub:'4 TB NVMe',unit:'%'},
  ]
  return <div className="gn-monitor-app">
    <div className="gn-utility-head">
      <div><span className="gn-utility-eyebrow">PERFORMANSE</span><h2>System Monitor</h2><p>Pregled resursa FTN OS radnog okruženja.</p></div>
      <div className="gn-monitor-running"><span className="gn-monitor-dot"/>Aktivan</div>
    </div>
    <div className="gn-monitor-overview">
      <div className="gn-monitor-panel">
        <div className="gn-monitor-panel-title"><strong>Aktivnost procesora</strong><span>{metrics.cpu}%</span></div>
        <div className="gn-monitor-chart" role="img" aria-label={'Graf aktivnosti procesora: '+metrics.cpu+' procenata'}>
          <div className="gn-monitor-gridlines"/>
          {history.map((value,index)=><div key={index} className="gn-monitor-bar" style={{'--value':value+'%','--index':index} as CSSProperties}/>)}
        </div>
        <div className="gn-monitor-chart-footer"><span>Prethodnih 40 s</span><span>Osvežavanje na 1,6 s</span></div>
      </div>
      <div className="gn-monitor-summary">
        <div><span>Mreža</span><strong>{metrics.network}<small> MB/s</small></strong></div>
        <div><span>Aktivna sesija</span><strong>{uptime}</strong></div>
        <div><span>Radna stanica</span><strong>FTN OS</strong></div>
      </div>
    </div>
    <div className="gn-monitor-metrics">{cards.map(item=><div key={item.id} className="gn-monitor-metric">
      <header><span>{item.title}</span><strong>{metrics[item.id]}{item.unit}</strong></header>
      <div className="gn-monitor-track"><span style={{width:metrics[item.id]+'%'}}/></div>
      <small>{item.sub}</small>
    </div>)}</div>
    <p className="gn-monitor-note">Grafikon prikazuje radni profil FTN OS okruženja, a ne telemetriju računara posetioca.</p>
  </div>
}
