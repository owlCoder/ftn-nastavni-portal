import {useEffect,useRef,useState,type FormEvent} from 'react'
import {usePersistent,saveText,DevPage,DevPanel} from './DeveloperApps'
export type LifeId='kanban'|'expenses'|'grades'|'reading'|'countdown'|'planner'|'decisions'|'quiz'|'matrix'|'metronome'
export const lifeIds:LifeId[]=['kanban','expenses','grades','reading','countdown','planner','decisions','quiz','matrix','metronome']
export const lifeNames:Record<LifeId,string>={
 kanban:'Kanban tabla',expenses:'Troškovi',grades:'Prosek ocena',reading:'Lista za čitanje',
 countdown:'Odbrojavanje',planner:'Plan učenja',decisions:'Izbor opcije',
 quiz:'IT Kviz',matrix:'Matrice 2×2',metronome:'Metronom'
}
type Item={id:number;title:string;status:number}
const uid=()=>Date.now()+Math.random()
function Kanban(){
 const [items,setItems]=usePersistent<Item[]>('kanban',[]),[title,setTitle]=useState('')
 const safe=Array.isArray(items)?items.filter(x=>typeof x?.title==='string'&&Number.isInteger(x.status)).slice(0,200):[]
 const add=(e:FormEvent)=>{e.preventDefault();if(title.trim()){setItems([...safe,{id:uid(),title:title.trim().slice(0,90),status:0}]);setTitle('')}}
 return <DevPage category="PLANIRANJE" title="Kanban tabla" description="Razvrstaj zadatke po stanju i prati realizaciju."><DevPanel>
  <form className="ftn-suite-inline" onSubmit={add}><input aria-label="Novi zadatak" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Novi zadatak…"/><button className="ftn-suite-primary">+ Dodaj</button></form>
  <div className="ftn-suite-kanban">{['Za rad','U toku','Završeno'].map((name,status)=><div key={name}><h3>{name}<span>{safe.filter(x=>x.status===status).length}</span></h3>{safe.filter(x=>x.status===status).map(item=><article key={item.id}><strong>{item.title}</strong><div><button disabled={status===0} title="Prethodni status" onClick={()=>setItems(safe.map(x=>x.id===item.id?{...x,status:status-1}:x))}>←</button><button disabled={status===2} title="Sledeći status" onClick={()=>setItems(safe.map(x=>x.id===item.id?{...x,status:status+1}:x))}>→</button><button title="Obriši" onClick={()=>setItems(safe.filter(x=>x.id!==item.id))}>×</button></div></article>)}</div>)}</div>
 </DevPanel></DevPage>
}
type Expense={id:number;name:string;cost:number;category:string}
function Expenses(){
 const [items,setItems]=usePersistent<Expense[]>('expenses',[]),[name,setName]=useState(''),[amount,setAmount]=useState(''),[category,setCategory]=useState('Ostalo')
 const safe=Array.isArray(items)?items.filter(x=>typeof x?.name==='string'&&Number.isFinite(x.cost)).slice(0,500):[]
 const total=safe.reduce((v,x)=>v+x.cost,0)
 const add=(e:FormEvent)=>{e.preventDefault();const cost=Number(amount);if(!name.trim()||!Number.isFinite(cost)||cost<=0)return;setItems([...safe,{id:uid(),name:name.trim().slice(0,90),cost,category}]);setName('');setAmount('')}
 return <DevPage category="FINANSIJE" title="Troškovi" description="Lični pregled troškova u dinarima, samo u browseru."><DevPanel>
 <div className="ftn-suite-hero"><span>Ukupno evidentirano</span><strong>{total.toLocaleString('sr-RS',{maximumFractionDigits:2})} RSD</strong></div>
 <form className="ftn-suite-inline" onSubmit={add}><input aria-label="Opis troška" placeholder="Opis troška" value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Iznos u RSD" type="number" step="0.01" min="0.01" placeholder="RSD" value={amount} onChange={e=>setAmount(e.target.value)}/><select aria-label="Kategorija" value={category} onChange={e=>setCategory(e.target.value)}>{['Hrana','Prevoz','Studije','Ostalo'].map(x=><option key={x}>{x}</option>)}</select><button className="ftn-suite-primary">Dodaj</button></form>
 <div className="ftn-suite-rows">{safe.map(x=><div key={x.id}><strong>{x.name}</strong><small>{x.category}</small><b>{x.cost.toLocaleString('sr-RS')} RSD</b><button onClick={()=>setItems(safe.filter(t=>t.id!==x.id))} aria-label={'Obriši '+x.name}>×</button></div>)}</div>
 <div className="ftn-suite-actions"><button onClick={()=>saveText('troskovi.csv','Opis,Kategorija,RSD\n'+safe.map(x=>[x.name,x.category,x.cost].map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n'),'text/csv')}>↓ CSV</button></div>
 </DevPanel></DevPage>
}
type Grade={id:number;name:string;grade:number;ects:number}
function Grades(){
 const [items,setItems]=usePersistent<Grade[]>('grades',[]),[name,setName]=useState(''),[grade,setGrade]=useState('10'),[ects,setEcts]=useState('6')
 const safe=Array.isArray(items)?items.filter(x=>typeof x?.name==='string'&&Number.isFinite(x.grade)&&Number.isFinite(x.ects)).slice(0,200):[]
 const credits=safe.reduce((v,x)=>v+x.ects,0),avg=credits?safe.reduce((v,x)=>v+x.grade*x.ects,0)/credits:0
 const add=(e:FormEvent)=>{e.preventDefault();const g=Number(grade),c=Number(ects);if(!name.trim()||g<6||g>10||!Number.isInteger(g)||c<=0||!Number.isFinite(c))return;setItems([...safe,{id:uid(),name:name.trim().slice(0,100),grade:g,ects:c}]);setName('')}
 return <DevPage category="UČENJE" title="Prosek ocena" description="Izračunaj ponderisani prosek prema ESPB bodovima."><DevPanel>
 <div className="ftn-suite-metrics"><div><span>Ponderisani prosek</span><strong>{credits?avg.toFixed(2):'—'}</strong></div><div><span>ESPB</span><strong>{credits}</strong></div><div><span>Položeno predmeta</span><strong>{safe.length}</strong></div></div>
 <form className="ftn-suite-inline" onSubmit={add}><input aria-label="Predmet" value={name} placeholder="Predmet" onChange={e=>setName(e.target.value)}/><select aria-label="Ocena" value={grade} onChange={e=>setGrade(e.target.value)}>{[6,7,8,9,10].map(x=><option key={x}>{x}</option>)}</select><input aria-label="ESPB" type="number" min="1" max="50" value={ects} onChange={e=>setEcts(e.target.value)}/><button className="ftn-suite-primary">Dodaj</button></form>
 <div className="ftn-suite-rows">{safe.map(g=><div key={g.id}><strong>{g.name}</strong><small>{g.ects} ESPB</small><b>Ocena {g.grade}</b><button onClick={()=>setItems(safe.filter(x=>x.id!==g.id))}>×</button></div>)}</div>
 </DevPanel></DevPage>
}
type Book={id:number;title:string;author:string;read:boolean}
function Reading(){
 const [items,setItems]=usePersistent<Book[]>('reading',[]),[name,setName]=useState(''),[author,setAuthor]=useState('')
 const safe=Array.isArray(items)?items.filter(x=>typeof x?.title==='string'&&typeof x?.read==='boolean').slice(0,300):[]
 const add=(e:FormEvent)=>{e.preventDefault();if(!name.trim())return;setItems([...safe,{id:uid(),title:name.trim().slice(0,130),author:author.trim().slice(0,90),read:false}]);setName('');setAuthor('')}
 return <DevPage category="UČENJE" title="Lista za čitanje" description="Sačuvaj naslove za čitanje i obeleži završene."><DevPanel>
 <div className="ftn-suite-metrics"><div><span>Pročitano</span><strong>{safe.filter(x=>x.read).length}</strong></div><div><span>Na listi</span><strong>{safe.length}</strong></div></div>
 <form className="ftn-suite-inline" onSubmit={add}><input aria-label="Naslov" placeholder="Naziv knjige ili članka" value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Autor" placeholder="Autor (opciono)" value={author} onChange={e=>setAuthor(e.target.value)}/><button className="ftn-suite-primary">Dodaj</button></form>
 <div className="ftn-suite-rows">{safe.map(b=><div key={b.id}><input type="checkbox" aria-label={'Pročitano '+b.title} checked={b.read} onChange={e=>setItems(safe.map(x=>x.id===b.id?{...x,read:e.target.checked}:x))}/><strong className={b.read?'ftn-suite-completed':''}>{b.title}</strong><small>{b.author}</small><button onClick={()=>setItems(safe.filter(x=>x.id!==b.id))}>×</button></div>)}</div>
 </DevPanel></DevPage>
}
type Event={id:number;name:string;when:string}
function Countdown(){
 const [events,setEvents]=usePersistent<Event[]>('countdowns',[]),[name,setName]=useState(''),[date,setDate]=useState('')
 const [now,setNow]=useState(Date.now())
 useEffect(()=>{const interval=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(interval)},[])
 const safe=Array.isArray(events)?events.filter(x=>typeof x?.when==='string'&&typeof x?.name==='string').slice(0,150):[]
 const add=(e:FormEvent)=>{e.preventDefault();if(!name.trim()||!Number.isFinite(new Date(date).getTime()))return;setEvents([...safe,{id:uid(),name:name.trim().slice(0,100),when:date}]);setName('');setDate('')}
 const fmt=(target:string)=>{const delta=Math.max(0,Math.floor((new Date(target).getTime()-now)/1000));return Math.floor(delta/86400)+'d '+Math.floor(delta%86400/3600)+'h '+Math.floor(delta%3600/60)+'m '+delta%60+'s'}
 return <DevPage category="PLANIRANJE" title="Odbrojavanje" description="Rokovi ispita, događaji i preostalo vreme."><DevPanel><form className="ftn-suite-inline" onSubmit={add}><input aria-label="Naziv događaja" placeholder="Naziv događaja" value={name} onChange={e=>setName(e.target.value)}/><input aria-label="Datum događaja" type="datetime-local" required value={date} onChange={e=>setDate(e.target.value)}/><button className="ftn-suite-primary">Dodaj</button></form>
 <div className="ftn-suite-cards">{safe.map(x=><article key={x.id}><div><strong>{x.name}</strong><small>{new Date(x.when).toLocaleString('sr-RS')}</small></div><b>{fmt(x.when)}</b><button aria-label={'Ukloni '+x.name} onClick={()=>setEvents(safe.filter(t=>t.id!==x.id))}>×</button></article>)}</div>
 </DevPanel></DevPage>
}
type Session={id:number;day:string;subject:string;minutes:number}
function Planner(){
 const [sessions,setSessions]=usePersistent<Session[]>('planner',[]),[day,setDay]=useState('Ponedeljak'),[subject,setSubject]=useState(''),[mins,setMins]=useState('60')
 const safe=Array.isArray(sessions)?sessions.filter(x=>typeof x?.subject==='string'&&Number.isFinite(x.minutes)).slice(0,200):[]
 const days=['Ponedeljak','Utorak','Sreda','Četvrtak','Petak','Subota','Nedelja']
 const add=(e:FormEvent)=>{e.preventDefault();const m=Number(mins);if(!subject.trim()||m<5||m>600)return;setSessions([...safe,{id:uid(),day,subject:subject.trim().slice(0,90),minutes:m}]);setSubject('')}
 return <DevPage category="UČENJE" title="Plan učenja" description="Rasporedi sesije rada kroz sedmicu."><DevPanel><form className="ftn-suite-inline" onSubmit={add}><select aria-label="Dan" value={day} onChange={e=>setDay(e.target.value)}>{days.map(x=><option key={x}>{x}</option>)}</select><input placeholder="Predmet ili tema" aria-label="Predmet" value={subject} onChange={e=>setSubject(e.target.value)}/><input type="number" aria-label="Minuti" min="5" max="600" value={mins} onChange={e=>setMins(e.target.value)}/><button className="ftn-suite-primary">Dodaj</button></form>
 <div className="ftn-suite-planner">{days.map(d=><section key={d}><h3>{d}<small>{safe.filter(x=>x.day===d).reduce((v,x)=>v+x.minutes,0)} min</small></h3>{safe.filter(x=>x.day===d).map(x=><div key={x.id}><span>{x.subject}</span><small>{x.minutes} min</small><button onClick={()=>setSessions(safe.filter(t=>t.id!==x.id))}>×</button></div>)}</section>)}</div>
 </DevPanel></DevPage>
}
function Decisions(){
 const [options,setOptions]=useState('Učenje\nProjekat\nPauza'),[result,setResult]=useState(''),[history,setHistory]=useState<string[]>([])
 const list=options.split('\n').map(x=>x.trim()).filter(Boolean)
 const draw=()=>{if(!list.length)return;const numbers=new Uint32Array(1);crypto.getRandomValues(numbers);const chosen=list[numbers[0]%list.length];setResult(chosen);setHistory(x=>[chosen,...x].slice(0,10))}
 return <DevPage category="ORGANIZACIJA" title="Izbor opcije" description="Nasumično odaberi jednu mogućnost sa svoje liste."><DevPanel><label className="ftn-suite-field"><span>Opcije (po jedna u redu)</span><textarea rows={7} value={options} onChange={e=>setOptions(e.target.value)}/></label><div className="ftn-suite-decision">{result?<strong>{result}</strong>:<span>Spremno za izbor</span>}</div><button className="ftn-suite-primary" disabled={!list.length} onClick={draw}>Izaberi nasumično</button>
 {history.length>0&&<p className="ftn-suite-note">Prethodni izbori: {history.join(' · ')}</p>}</DevPanel></DevPage>
}
const QUESTIONS=[
 ['Koji HTTP metod najčešće čita resurs?',['GET','POST','PATCH'],'GET'],
 ['Koji je tip podataka true u JavaScriptu?',['boolean','string','number'],'boolean'],
 ['Koji Git alat šalje commit na remote?',['push','pull','status'],'push'],
 ['Koji status označava Not Found?',['200','404','500'],'404'],
 ['Koji protokol šifruje HTTP saobraćaj?',['HTTPS','FTP','Telnet'],'HTTPS'],
 ['Koji je osnovni HTML element za link?',['a','div','span'],'a'],
 ['Koja SQL komanda čita redove?',['SELECT','DROP','INSERT'],'SELECT'],
 ['Koji CSS atribut menja boju teksta?',['color','background','display'],'color'],
] as const
function Quiz(){
 const [index,setIndex]=useState(0),[answer,setAnswer]=useState(''),[score,setScore]=useState(0)
 const current=QUESTIONS[index],finished=index>=QUESTIONS.length
 return <DevPage category="UČENJE" title="IT Kviz" description="Osam pitanja za proveru osnovnih informatičkih znanja."><DevPanel>
 {finished?<div className="ftn-suite-result"><strong>{score} / {QUESTIONS.length}</strong><p>Kviz je završen.</p><button className="ftn-suite-primary" onClick={()=>{setIndex(0);setScore(0);setAnswer('')}}>Pokušaj ponovo</button></div>:<><span className="ftn-suite-note">Pitanje {index+1} / {QUESTIONS.length}</span><h3>{current[0]}</h3><div className="ftn-suite-answer">{current[1].map(option=><button className={answer===option?'chosen':''} key={option} onClick={()=>setAnswer(option)}>{option}</button>)}</div><button className="ftn-suite-primary" disabled={!answer} onClick={()=>{if(answer===current[2])setScore(s=>s+1);setIndex(i=>i+1);setAnswer('')}}>Sledeće pitanje →</button></>}
 </DevPanel></DevPage>
}
function Matrix(){
 const [a,setA]=useState([1,2,3,4]),[b,setB]=useState([2,0,1,3])
 const set=(which:'a'|'b',i:number,x:number)=>{if(which==='a')setA(v=>v.map((n,j)=>j===i?x:n));else setB(v=>v.map((n,j)=>j===i?x:n))}
 const prod=[a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3]]
 return <DevPage category="MATEMATIKA" title="Matrice 2×2" description="Sabiranje, množenje i determinanta matrica."><DevPanel><div className="ftn-suite-matrixpair">{([['A',a],['B',b]] as const).map(([name,items])=><div key={name}><h3>Matrica {name}</h3><div className="ftn-suite-matrix">{items.map((n,i)=><input key={i} type="number" aria-label={name+(i+1)} value={n} onChange={e=>set(name.toLowerCase() as 'a'|'b',i,Number(e.target.value))}/>)}</div></div>)}</div>
 <div className="ftn-suite-matrixresults"><div><h3>A + B</h3><div className="ftn-suite-matrix">{a.map((n,i)=><output key={i}>{n+b[i]}</output>)}</div></div><div><h3>A × B</h3><div className="ftn-suite-matrix">{prod.map((n,i)=><output key={i}>{n}</output>)}</div></div></div>
 <p className="ftn-suite-note">det(A) = {a[0]*a[3]-a[1]*a[2]}, det(B) = {b[0]*b[3]-b[1]*b[2]}</p></DevPanel></DevPage>
}
function Metronome(){
 const [bpm,setBpm]=useState(100),[running,setRunning]=useState(false),[beats,setBeats]=useState(0),ctx=useRef<AudioContext|null>(null)
 const playing=useRef(false)
 useEffect(()=>{if(!running){playing.current=false;return}playing.current=true;let timer=0
  const play=()=>{if(!playing.current)return
    try{const context=ctx.current;if(context){const osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=880;gain.gain.setValueAtTime(.12,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.08);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.08)}}catch{/*audio may be blocked*/}
    setBeats(v=>v+1);timer=window.setTimeout(play,60000/bpm)}
  play();return()=>{playing.current=false;window.clearTimeout(timer)}
 },[bpm,running])
 useEffect(()=>()=>{void ctx.current?.close()},[])
 const toggle=()=>{if(!running){if(!ctx.current)ctx.current=new AudioContext();void ctx.current.resume()}setRunning(!running)}
 return <DevPage category="MUZIKA / VEŽBA" title="Metronom" description="Ravnomeran ritam pomoću Web Audio API-ja."><DevPanel><div className="ftn-suite-metronome"><span>Tempo</span><strong>{bpm} <small>BPM</small></strong><input type="range" min="40" max="220" value={bpm} onChange={e=>setBpm(Number(e.target.value))}/><div className="ftn-suite-inline"><button onClick={()=>setBpm(b=>Math.max(40,b-5))}>−5</button><button onClick={()=>setBpm(b=>Math.min(220,b+5))}>+5</button><button className="ftn-suite-primary" onClick={toggle}>{running?'Pauziraj':'Pokreni'}</button></div><p>{beats} otkucaja u ovoj sesiji</p></div><p className="ftn-suite-note">Zvuk radi nakon korisničkog klika. Nije profesionalni audio sekvencer.</p></DevPanel></DevPage>
}
export function LifeApp({id}:{id:LifeId}){
 switch(id){
 case 'kanban':return <Kanban/>
 case 'expenses':return <Expenses/>
 case 'grades':return <Grades/>
 case 'reading':return <Reading/>
 case 'countdown':return <Countdown/>
 case 'planner':return <Planner/>
 case 'decisions':return <Decisions/>
 case 'quiz':return <Quiz/>
 case 'matrix':return <Matrix/>
 case 'metronome':return <Metronome/>
 }
}
