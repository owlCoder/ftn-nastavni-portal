import { useEffect, useMemo, useRef, useState } from 'react'

type Metric='cpu'|'gpu'|'ram'|'disk'|'network'
type RecordSample={stamp:number;cpu:number;gpu:number;ram:number;disk:number;network:number}
const labels:Record<Metric,string>={cpu:'Procesor',gpu:'Grafika',ram:'Memorija',disk:'Disk',network:'Mreža'}
const units:Record<Metric,string>={cpu:'%',gpu:'%',ram:'%',disk:'%',network:'MB/s'}
const base:RecordSample={stamp:Date.now(),cpu:32,gpu:23,ram:61,disk:42,network:9}
const randomWalk=(v:number,step:number,min:number,max:number)=>Math.round(Math.min(max,Math.max(min,v+(Math.random()-.5)*step)))
const meter=(metric:Metric,value:number)=>metric==='network'?value+' MB/s':value+'%'
function Sparkline({values,color,id}:{values:number[];color:string;id:string}){
  const max=100,min=0,width=550,height=150
  const points=values.map((n,i)=>[i/Math.max(values.length-1,1)*width,height-(n-min)/(max-min)*height])
  const path=points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1)).join(' ')
  const area=path+' L'+width+',150 L0,150 Z'
  return <svg viewBox="0 0 550 150" className="ftn-monitor-svg" role="img" aria-label={'Grafikon poslednjih '+values.length+' uzoraka'}>
    <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    {[0,37.5,75,112.5,150].map(y=><line key={y} x1="0" x2="550" y1={y} y2={y} stroke="#e8edf2" strokeWidth="1"/>)}
    <path d={area} fill={'url(#'+id+')'}/><path d={path} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
}
type BrowserData={cores:number|null;deviceMemory:number|null;storage:string|null;online:boolean;userAgent:string}
function getBrowserInfo():BrowserData{
  const n=navigator as Navigator&{deviceMemory?:number}
  return {cores:n.hardwareConcurrency??null,deviceMemory:n.deviceMemory??null,storage:null,online:n.onLine,userAgent:n.userAgent}
}
function csvDownload(history:RecordSample[]){
  const lines=['time,cpu_percent,gpu_percent,ram_percent,disk_percent,network_mb_s',
    ...history.map(h=>[new Date(h.stamp).toISOString(),h.cpu,h.gpu,h.ram,h.disk,h.network].join(','))]
  const uri=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv;charset=utf-8'}))
  const a=document.createElement('a');a.download='ftn-system-monitor.csv';a.href=uri;a.click()
  window.setTimeout(()=>URL.revokeObjectURL(uri),1000)
}
export function SystemMonitorPro({apps,onOpen}:{apps:{id:string;name:string;minimized:boolean}[];onOpen:(id:string)=>void}){
  const [tab,setTab]=useState<'performance'|'processes'|'system'>('performance')
  const [selected,setSelected]=useState<Metric>('cpu')
  const [paused,setPaused]=useState(false)
  const [history,setHistory]=useState<RecordSample[]>(()=>Array.from({length:36},(_,i)=>({...base,stamp:Date.now()-(35-i)*2000,cpu:24+Math.round(Math.random()*20),gpu:18+Math.round(Math.random()*19),ram:59+Math.round(Math.random()*5),disk:42,network:5+Math.round(Math.random()*15)})))
  const [browser,setBrowser]=useState<BrowserData>(getBrowserInfo)
  const last=useRef(history[history.length-1])
  useEffect(()=>{
    const online=()=>setBrowser(p=>({...p,online:navigator.onLine}))
    window.addEventListener('online',online);window.addEventListener('offline',online)
    let live=true
    if(navigator.storage?.estimate)void navigator.storage.estimate().then(v=>{if(live)setBrowser(p=>({...p,storage:((v.usage??0)/1048576).toFixed(1)+' MB'}))}).catch(()=>{})
    return()=>{live=false;window.removeEventListener('online',online);window.removeEventListener('offline',online)}
  },[])
  useEffect(()=>{
    if(paused)return
    const timer=window.setInterval(()=>{
      const p=last.current
      const next={stamp:Date.now(),cpu:randomWalk(p.cpu,23,8,84),gpu:randomWalk(p.gpu,21,7,85),
        ram:randomWalk(p.ram,4,52,76),disk:p.disk,network:randomWalk(p.network,17,0,68)}
      last.current=next
      setHistory(old=>[...old.slice(-59),next])
    },2000)
    return()=>window.clearInterval(timer)
  },[paused])
  const current=history[history.length-1]
  const colors:Record<Metric,string>={cpu:'#3584e4',gpu:'#8c78c9',ram:'#2f9e8f',disk:'#dc9b42',network:'#5f8db8'}
  const id=selected
  const values=useMemo(()=>history.map(x=>x[selected]),[history,selected])
  const processRows=[{id:'shell',name:'FTN Desktop Shell',minimized:false},...apps.filter(a=>a.id!=='monitor')]
  return <div className="ftn-monitor-pro">
    <div className="ftn-monitor-head"><div><span>RESURSI · FTN OS</span><h2>System Monitor</h2><p>Praćenje radnog prostora i pregled aplikacija</p></div><div className="ftn-monitor-header-actions"><span className="ftn-monitor-simulated">Primer podataka · simulacija</span><button onClick={()=>setPaused(v=>!v)}>{paused?'▶ Nastavi':'Ⅱ Pauziraj'}</button><button onClick={()=>csvDownload(history)}>↓ CSV</button></div></div>
    <nav className="ftn-monitor-tabs" aria-label="Sekcije monitora">
      <button className={tab==='performance'?'active':''} onClick={()=>setTab('performance')}>Performanse</button>
      <button className={tab==='processes'?'active':''} onClick={()=>setTab('processes')}>Aplikacije <span>{processRows.length}</span></button>
      <button className={tab==='system'?'active':''} onClick={()=>setTab('system')}>Sistem</button>
    </nav>
    {tab==='performance'&&<div className="ftn-monitor-layout">
      <aside className="ftn-monitor-resources">{(Object.keys(labels) as Metric[]).map(metric=><button key={metric} className={selected===metric?'selected':''} onClick={()=>setSelected(metric)}>
        <span className="ftn-monitor-resource-symbol" style={{background:colors[metric]}}/>
        <span><strong>{labels[metric]}</strong><small>{meter(metric,current[metric])}</small></span>
        <span className="ftn-monitor-mini"><Sparkline values={history.slice(-18).map(h=>h[metric])} color={colors[metric]} id={'mini-'+metric}/></span>
      </button>)}</aside>
      <div className="ftn-monitor-detail">
        <div className="ftn-monitor-detail-title"><div><span>AKTIVNOST RESURSA</span><h3>{labels[selected]}</h3></div><strong>{meter(selected,current[selected])}</strong></div>
        <div className="ftn-monitor-chart"><Sparkline values={values} color={colors[selected]} id={'main-'+selected}/></div>
        <div className="ftn-monitor-chart-axis"><span>Pre {Math.max(0,history.length-1)*2} s</span><span>Osvežavanje na 2 s</span><span>Sada</span></div>
        <div className="ftn-monitor-stat-grid">
          <div><span>Trenutno</span><strong>{meter(selected,current[selected])}</strong></div>
          <div><span>Prosek</span><strong>{meter(selected,Math.round(values.reduce((a,b)=>a+b,0)/values.length))}</strong></div>
          <div><span>Najviše</span><strong>{meter(selected,Math.max(...values))}</strong></div>
          <div><span>Uzorci</span><strong>{history.length}</strong></div>
        </div>
        <p className="ftn-monitor-disclaimer">Vrednosti CPU, GPU, RAM, SSD i mreže predstavljaju simulaciju profila FTN OS, ne telemetriju tvog uređaja.</p>
      </div>
    </div>}
    {tab==='processes'&&<div className="ftn-monitor-processes">
      <div className="ftn-monitor-process-summary"><strong>{processRows.length}</strong><span>aktivnih komponenti portala</span></div>
      <div className="ftn-monitor-process-table"><div className="ftn-monitor-table-head"><span>Aplikacija</span><span>Stanje</span><span>Akcija</span></div>
      {processRows.map(app=><div className="ftn-monitor-process-row" key={app.id}><span><b className="ftn-monitor-app-dot"/>{app.name}</span><span>{app.minimized?'Minimizovano':'Otvoreno'}</span><span>{app.id==='shell'?'—':<button onClick={()=>onOpen(app.id)}>Prikaži ↗</button>}</span></div>)}</div>
      <p>Ovaj spisak prikazuje stvarno otvorene prozore FTN portala. Nisu prikazani procesi operativnog sistema.</p>
    </div>}
    {tab==='system'&&<div className="ftn-monitor-system"><div className="ftn-monitor-system-grid">
      <section><span>WEB RUNTIME</span><h3>Browser</h3><div><small>Logička CPU jezgra</small><strong>{browser.cores??'Nedostupno'}</strong></div>
        <div><small>Prijavljena memorija uređaja</small><strong>{browser.deviceMemory?browser.deviceMemory+' GB':'Nedostupno'}</strong></div>
        <div><small>Zauzeće lokalne web memorije</small><strong>{browser.storage??'Nedostupno'}</strong></div>
        <div><small>Internet status</small><strong>{browser.online?'Povezano':'Offline'}</strong></div>
      </section>
      <section><span>FTN OS PROFIL</span><h3>Konfiguracija</h3><div><small>Procesor</small><strong>AMD Ryzen 9 9950X3D</strong></div>
        <div><small>Grafika</small><strong>NVIDIA GeForce RTX 5090</strong></div>
        <div><small>Memorija profila</small><strong>128 GB DDR5</strong></div>
        <div><small>Disk profila</small><strong>4 TB NVMe</strong></div></section>
    </div><p className="ftn-monitor-disclaimer">Browser podaci, kada ih browser podržava, preuzeti su iz Web API-ja. FTN OS konfiguracija je ilustrativna, a ne detekcija hardvera.</p></div>}
  </div>
}
