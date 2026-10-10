import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'

export type StudioAppId = 'photos'|'colors'|'markdown'|'json'|'passwords'|'flashcards'|'habits'|'worldclock'|'typing'|'bookmarks'
export const studioIds:StudioAppId[]=['photos','colors','markdown','json','passwords','flashcards','habits','worldclock','typing','bookmarks']
export const studioNames:Record<StudioAppId,string> = {
  photos:'Fotografije',colors:'Paleta boja',markdown:'Markdown Studio',json:'JSON Studio',
  passwords:'Generator lozinki',flashcards:'Flash kartice',habits:'Navike',
  worldclock:'Svetski sat',typing:'Vežbanje kucanja',bookmarks:'Obeleživači'
}
export const studioCategories:Record<StudioAppId,string>={
  photos:'Mediji',colors:'Dizajn',markdown:'Dokumenti',json:'Razvoj',passwords:'Privatnost',
  flashcards:'Učenje',habits:'Produktivnost',worldclock:'Vreme',typing:'Veštine',bookmarks:'Web'
}
const save=(key:string,value:unknown)=>{try{localStorage.setItem('ftn-app-'+key,JSON.stringify(value))}catch{/* quota or blocked storage */}}
function read<T>(key:string,initial:T):T{try{const value=localStorage.getItem('ftn-app-'+key);return value?JSON.parse(value) as T:initial}catch{return initial}}
function useSaved<T>(key:string,initial:T):[T,(v:T|((old:T)=>T))=>void]{
  const [value,setValue]=useState<T>(()=>read(key,initial))
  useEffect(()=>save(key,value),[key,value])
  return [value,setValue]
}
const download=(name:string,body:string,mime='text/plain;charset=utf-8')=>{
  const url=URL.createObjectURL(new Blob([body],{type:mime}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click()
  window.setTimeout(()=>URL.revokeObjectURL(url),1500)
}
async function copy(text:string,setStatus:(value:string)=>void){
  try{await navigator.clipboard.writeText(text);setStatus('Kopirano u clipboard.')}
  catch{setStatus('Clipboard nije dostupan. Izaberi i kopiraj tekst ručno.')}
}
function Title({tag,name,subtitle,actions}:{tag:string;name:string;subtitle:string;actions?:ReactNode}){
  return <header className="ftn-studio-title"><div><span>{tag}</span><h2>{name}</h2><p>{subtitle}</p></div>{actions&&<div className="ftn-studio-title-actions">{actions}</div>}</header>
}
function Pane({title,children,compact=false}:{title?:string;children:ReactNode;compact?:boolean}){
  return <section className={'ftn-studio-pane'+(compact?' is-compact':'')}>{title&&<h3>{title}</h3>}{children}</section>
}
function Empty({icon,title,text}:{icon:string;title:string;text:string}){
  return <div className="ftn-studio-empty"><span aria-hidden="true">{icon}</span><strong>{title}</strong><p>{text}</p></div>
}
function Photos(){
  type Photo={id:number;name:string;url:string}
  const [photos,setPhotos]=useState<Photo[]>([])
  const [selected,setSelected]=useState<number|null>(null)
  const urls=useRef(new Set<string>())
  useEffect(()=>()=>{urls.current.forEach(u=>URL.revokeObjectURL(u));urls.current.clear()},[])
  const upload=(event:ChangeEvent<HTMLInputElement>)=>{
    const files=Array.from(event.target.files??[]).filter(f=>f.type.startsWith('image/')&&f.size<=15*1024*1024).slice(0,12)
    const added=files.map(file=>{const url=URL.createObjectURL(file);urls.current.add(url);return {id:Date.now()+Math.random(),name:file.name,url}})
    setPhotos(previous=>[...previous,...added].slice(-36))
    if(added.length)setSelected(added[0].id)
    event.target.value=''
  }
  const remove=(id:number)=>{
    const item=photos.find(p=>p.id===id);if(item){URL.revokeObjectURL(item.url);urls.current.delete(item.url)}
    const next=photos.filter(p=>p.id!==id);setPhotos(next);setSelected(next[0]?.id??null)
  }
  const photo=photos.find(p=>p.id===selected)
  return <div className="ftn-studio-page"><Title tag="MEDIJI" name="Fotografije" subtitle="Lokalna galerija bez slanja slika na server."
    actions={<label className="ftn-studio-button ftn-studio-primary">+ Dodaj fotografije<input hidden multiple type="file" accept="image/*" onChange={upload}/></label>}/>
    <div className="ftn-studio-photo-layout">
      <Pane title="Galerija"><div className="ftn-studio-photo-grid">{photos.map(p=><button key={p.id} aria-label={'Prikaži '+p.name} className={p.id===selected?'selected':''} onClick={()=>setSelected(p.id)}>
        <img src={p.url} alt={p.name}/></button>)}</div>{!photos.length&&<Empty icon="▧" title="Tvoja galerija je prazna" text="Izaberi fotografije sa uređaja da ih pregledaš."/ >}</Pane>
      <Pane title={photo?.name??'Pregled'}>{photo?<><img className="ftn-studio-photo-big" src={photo.url} alt={photo.name}/><div className="ftn-studio-toolbar"><a className="ftn-studio-button" href={photo.url} download={photo.name}>↓ Sačuvaj</a><button onClick={()=>remove(photo.id)}>Ukloni iz galerije</button></div></>:<Empty icon="▤" title="Pregled fotografije" text="Izaberi sliku iz galerije."/ >}</Pane>
    </div><p className="ftn-studio-help">Fotografije ostaju samo u trenutnoj sesiji. Maksimalno 15 MB po slici.</p>
  </div>
}
const starterPalette=['#3584e4','#e66100','#33d17a','#9141ac','#f6d32d']
function Colors(){
  const [palette,setPalette]=useSaved<string[]>('colors',starterPalette)
  const [current,setCurrent]=useState('#3584e4')
  const [message,setMessage]=useState('')
  const unique=Array.isArray(palette)?palette.filter(x=>typeof x==='string'&&/^#[a-f0-9]{6}$/i.test(x)).slice(0,30):starterPalette
  return <div className="ftn-studio-page"><Title tag="DIZAJN" name="Paleta boja" subtitle="Pravi sopstvenu paletu i kopiraj HEX kodove."/>
    <div className="ftn-studio-layout"><Pane title="Boja"><div className="ftn-studio-color-preview" style={{backgroundColor:current}}/>
      <div className="ftn-studio-field-row"><label>Izaberi boju<input type="color" value={current} onChange={e=>setCurrent(e.target.value)}/></label>
      <strong className="ftn-studio-mono">{current.toUpperCase()}</strong></div>
      <div className="ftn-studio-toolbar"><button className="ftn-studio-primary" onClick={()=>{if(!unique.includes(current))setPalette([...unique,current]);setMessage('Boja je dodata.')}}>+ Dodaj u paletu</button><button onClick={()=>void copy(current,setMessage)}>Kopiraj HEX</button></div>
    </Pane><Pane title={'Sačuvane boje · '+unique.length}><div className="ftn-studio-swatch-grid">{unique.map(hex=><div key={hex} className="ftn-studio-swatch">
      <button className="ftn-studio-swatch-color" onClick={()=>{setCurrent(hex);void copy(hex,setMessage)}} style={{background:hex}} title={'Kopiraj '+hex} aria-label={'Izaberi '+hex}/>
      <span>{hex}</span><button className="ftn-studio-icon-btn" title="Ukloni" onClick={()=>setPalette(unique.filter(x=>x!==hex))}>×</button>
    </div>)}</div><div className="ftn-studio-toolbar"><button onClick={()=>download('ftn-paleta.txt',unique.join('\n'))}>↓ Izvezi paletu</button><button onClick={()=>setPalette(starterPalette)}>Vrati boje</button></div></Pane></div>
    {message&&<p role="status" className="ftn-studio-help">{message}</p>}
  </div>
}
const starterMd='# Moje beleške\n\n## Plan za danas\n\n- Pročitati praktikum\n- Uraditi vežbu\n\n**Srećno sa učenjem!**'
function Markdown(){
  const [value,setValue]=useSaved<string>('markdown',starterMd)
  const rows=value.split('\n')
  return <div className="ftn-studio-page ftn-studio-flex"><Title tag="DOKUMENTI" name="Markdown Studio" subtitle="Piši Markdown i vidi pregled dok kucaš."
    actions={<button onClick={()=>download('beleske.md',value,'text/markdown;charset=utf-8')}>↓ Markdown</button>}/>
    <div className="ftn-studio-editor-grid"><Pane title="Uređivač"><textarea spellCheck={false} className="ftn-studio-code-editor" aria-label="Markdown tekst" value={value} onChange={e=>setValue(e.target.value)}/></Pane>
      <Pane title="Pregled"><article className="ftn-studio-markdown-preview">{rows.map((line,i)=>{
        if(line.startsWith('### '))return <h4 key={i}>{line.slice(4)}</h4>
        if(line.startsWith('## '))return <h3 key={i}>{line.slice(3)}</h3>
        if(line.startsWith('# '))return <h2 key={i}>{line.slice(2)}</h2>
        if(line.startsWith('- '))return <p className="ftn-studio-bullet" key={i}>• &nbsp;{line.slice(2)}</p>
        if(line.startsWith('**')&&line.endsWith('**'))return <p key={i}><strong>{line.slice(2,-2)}</strong></p>
        return <p key={i}>{line||'\u00a0'}</p>
      })}</article></Pane></div><p className="ftn-studio-help">Bezbedan tekstualni pregled bez ubacivanja HTML-a. Podaci se čuvaju lokalno.</p>
  </div>
}
function JsonStudio(){
  const [value,setValue]=useState('{\n  "predmet": "ERS",\n  "semestar": 5,\n  "aktivan": true\n}')
  const [error,setError]=useState('')
  const [message,setMessage]=useState('')
  const action=(mode:'pretty'|'minify'|'validate')=>{try{const parsed:unknown=JSON.parse(value);if(mode!=='validate')setValue(JSON.stringify(parsed,null,mode==='pretty'?2:0));setError('');setMessage('JSON je ispravan.')}catch(e){setMessage('');setError(e instanceof Error?e.message:'Neispravan JSON')}}
  return <div className="ftn-studio-page ftn-studio-flex"><Title tag="RAZVOJ" name="JSON Studio" subtitle="Formatiranje, validacija i izvoz JSON dokumenata."/>
    <Pane><div className="ftn-studio-toolbar ftn-studio-toolbar-top"><button className="ftn-studio-primary" onClick={()=>action('pretty')}>Formatiraj</button><button onClick={()=>action('minify')}>Minifikuj</button><button onClick={()=>action('validate')}>Validiraj</button><button onClick={()=>void copy(value,setMessage)}>Kopiraj</button><button onClick={()=>download('dokument.json',value,'application/json')}>↓ JSON</button></div>
      <textarea className="ftn-studio-code-editor ftn-studio-json-input" spellCheck={false} aria-label="JSON sadržaj" value={value} onChange={e=>{setValue(e.target.value);setError('');setMessage('')}}/>
      {error&&<p role="alert" className="ftn-studio-error">{error}</p>}{message&&<p role="status" className="ftn-studio-success">{message}</p>}
    </Pane>
  </div>
}
const ALPHABETS={lower:'abcdefghijkmnopqrstuvwxyz',upper:'ABCDEFGHJKLMNPQRSTUVWXYZ',numbers:'23456789',symbols:'!@#$%^&*-_+='}
function secureString(length:number,chars:string):string{
  if(!chars||!globalThis.crypto?.getRandomValues)return ''
  const max=Math.floor(4294967296/chars.length)*chars.length
  let out=''
  for(let i=0;i<length;i++){
    let v=0
    do{const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);v=bytes[0]}while(v>=max)
    out+=chars[v%chars.length]
  }
  return out
}
function Passwords(){
  const [length,setLength]=useState(20)
  const [options,setOptions]=useState({lower:true,upper:true,numbers:true,symbols:true})
  const chars=(Object.keys(ALPHABETS) as (keyof typeof ALPHABETS)[]).filter(k=>options[k]).map(k=>ALPHABETS[k]).join('')
  const [password,setPassword]=useState(()=>secureString(20,Object.values(ALPHABETS).join('')))
  const [message,setMessage]=useState('')
  useEffect(()=>{setPassword(secureString(length,chars))},[length,chars])
  return <div className="ftn-studio-page"><Title tag="PRIVATNOST" name="Generator lozinki" subtitle="Kriptografski nasumične lozinke koje ostaju na uređaju."/>
    <Pane title="Nova lozinka"><div className="ftn-studio-password"><output aria-label="Generisana lozinka">{password}</output><button aria-label="Kopiraj lozinku" title="Kopiraj" onClick={()=>void copy(password,setMessage)}>⧉</button></div>
      <div className="ftn-studio-sliderline"><label htmlFor="ftn-pw-length">Dužina lozinke</label><strong>{length} karaktera</strong></div>
      <input id="ftn-pw-length" className="ftn-studio-range" type="range" min="8" max="48" value={length} onChange={e=>setLength(Number(e.target.value))}/>
      <div className="ftn-studio-checklist">{([['lower','Mala slova'],['upper','Velika slova'],['numbers','Brojevi'],['symbols','Simboli']] as const).map(([id,label])=>
        <label key={id}><input type="checkbox" checked={options[id]} onChange={e=>{if(!e.target.checked&&Object.entries(options).filter(([key,on])=>key!==id&&on).length===0)return;setOptions(prev=>({...prev,[id]:e.target.checked}))}}/>{label}</label>)}</div>
      <div className="ftn-studio-toolbar"><button className="ftn-studio-primary" onClick={()=>setPassword(secureString(length,chars))}>↻ Generiši</button><button onClick={()=>void copy(password,setMessage)}>Kopiraj</button></div>
      {message&&<p role="status" className="ftn-studio-help">{message}</p>}
      <p className="ftn-studio-help">Lozinke se ne čuvaju u localStorage. Koristi se browser Crypto API.</p>
    </Pane>
  </div>
}
type Flashcard={id:string;front:string;back:string}
const defaults:Flashcard[]=[{id:'1',front:'Šta je Git commit?',back:'Sačuvano stanje promena u istoriji repozitorijuma.'},{id:'2',front:'Šta znači HTTP 404?',back:'Resurs nije pronađen na serveru.'},{id:'3',front:'Šta je enkapsulacija?',back:'Sakrivanje implementacionih detalja i kontrolisan pristup podacima.'}]
function Flashcards(){
  const [deck,setDeck]=useSaved<Flashcard[]>('flashcards',defaults)
  const safe=Array.isArray(deck)?deck.filter(x=>typeof x?.front==='string'&&typeof x?.back==='string').slice(0,150):defaults
  const [index,setIndex]=useState(0),[flipped,setFlipped]=useState(false),[front,setFront]=useState(''),[back,setBack]=useState('')
  const card=safe[index%safe.length]
  const step=(direction:number)=>{setIndex(i=>(i+direction+safe.length)%safe.length);setFlipped(false)}
  const add=(e:FormEvent)=>{e.preventDefault();if(!front.trim()||!back.trim())return;setDeck([...safe,{id:String(Date.now()),front:front.trim().slice(0,220),back:back.trim().slice(0,700)}]);setFront('');setBack('');setIndex(safe.length);setFlipped(false)}
  return <div className="ftn-studio-page"><Title tag="UČENJE" name="Flash kartice" subtitle="Pitanja i odgovori za brzo ponavljanje gradiva."/>
    <div className="ftn-studio-layout"><Pane title={safe.length?'Kartica '+(index%safe.length+1)+' / '+safe.length:'Nema kartica'}>
      {card?<><button className={'ftn-studio-flashcard'+(flipped?' turned':'')} onClick={()=>setFlipped(v=>!v)}><small>{flipped?'ODGOVOR':'PITANJE'}</small><strong>{flipped?card.back:card.front}</strong><span>Klikni za {flipped?'pitanje':'odgovor'}</span></button>
        <div className="ftn-studio-toolbar ftn-studio-between"><button onClick={()=>step(-1)}>← Prethodna</button><button onClick={()=>setDeck(safe.filter(x=>x.id!==card.id))}>Obriši</button><button onClick={()=>step(1)}>Sledeća →</button></div></>:<Empty icon="◇" title="Prazan špil" text="Dodaj prvu karticu sa desne strane."/>}</Pane>
      <Pane title="Dodaj karticu"><form className="ftn-studio-form" onSubmit={add}><label>Pitanje<input value={front} maxLength={220} onChange={e=>setFront(e.target.value)} placeholder="Na primer: Šta je API?"/></label><label>Odgovor<textarea value={back} maxLength={700} onChange={e=>setBack(e.target.value)} rows={5} placeholder="Upiši odgovor…"/></label><button className="ftn-studio-primary">+ Dodaj karticu</button></form></Pane></div>
  </div>
}
type Habit={id:string;title:string;days:string[]}
const dateKey=()=>{const now=new Date();return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}
function Habits(){
  const [habits,setHabits]=useSaved<Habit[]>('habits',[])
  const [title,setTitle]=useState('')
  const day=dateKey()
  const safe=Array.isArray(habits)?habits.filter(x=>typeof x?.title==='string'&&Array.isArray(x.days)).slice(0,100):[]
  const completed=safe.filter(h=>h.days.includes(day)).length
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')})
  const toggle=(id:string)=>setHabits(safe.map(h=>h.id===id?{...h,days:h.days.includes(day)?h.days.filter(d=>d!==day):[...h.days,day]}:h))
  return <div className="ftn-studio-page"><Title tag="PRODUKTIVNOST" name="Navike" subtitle="Mali koraci svakog dana. Napredak se čuva lokalno."/>
    <Pane><div className="ftn-studio-metric"><strong>{completed}<span> / {safe.length}</span></strong><p>današnjih navika završeno</p></div>
      <form className="ftn-studio-inline" onSubmit={e=>{e.preventDefault();if(!title.trim())return;setHabits([...safe,{id:String(Date.now()),title:title.trim().slice(0,90),days:[]}]);setTitle('')}}><input value={title} maxLength={90} placeholder="Na primer: 30 minuta učenja" onChange={e=>setTitle(e.target.value)} aria-label="Naziv nove navike"/><button className="ftn-studio-primary">+ Dodaj</button></form>
      <div className="ftn-studio-habit-grid">{safe.map(h=><div className="ftn-studio-habit" key={h.id}><label><input type="checkbox" checked={h.days.includes(day)} onChange={()=>toggle(h.id)}/><span>{h.title}</span></label><div className="ftn-studio-week">{days.map(d=><span key={d} title={d} className={h.days.includes(d)?'done':''}/>)}</div><button title="Ukloni naviku" aria-label={'Ukloni '+h.title} onClick={()=>setHabits(safe.filter(x=>x.id!==h.id))}>×</button></div>)}</div>
      {!safe.length&&<Empty icon="◌" title="Počni od jedne navike" text="Dodaj naviku koju želiš da pratiš svakog dana."/>}
    </Pane>
  </div>
}
const zoneOptions=[['Europe/Belgrade','Novi Sad'],['Europe/London','London'],['America/New_York','New York'],['America/Los_Angeles','Los Angeles'],['Asia/Tokyo','Tokio'],['Asia/Dubai','Dubai'],['Australia/Sydney','Sidnej'],['Europe/Berlin','Berlin']] as const
function WorldClock(){
  const [zones,setZones]=useSaved<string[]>('zones',['Europe/Belgrade','Europe/London','America/New_York','Asia/Tokyo'])
  const [now,setNow]=useState(()=>new Date())
  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer)},[])
  const safe=Array.isArray(zones)?zones.filter(z=>zoneOptions.some(option=>option[0]===z)):['Europe/Belgrade']
  const unused=zoneOptions.filter(z=>!safe.includes(z[0]))
  return <div className="ftn-studio-page"><Title tag="VREME" name="Svetski sat" subtitle="Tačno lokalno vreme u više vremenskih zona."
    actions={<select aria-label="Dodaj grad" value="" onChange={e=>{if(e.target.value)setZones([...safe,e.target.value])}}><option value="">+ Dodaj grad</option>{unused.map(([zone,city])=><option key={zone} value={zone}>{city}</option>)}</select>}/>
    <div className="ftn-studio-clock-grid">{safe.map(zone=>{const city=zoneOptions.find(z=>z[0]===zone)?.[1]??zone
      const time=new Intl.DateTimeFormat('sr-RS',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now)
      const date=new Intl.DateTimeFormat('sr-RS',{timeZone:zone,weekday:'long',day:'numeric',month:'short'}).format(now)
      return <Pane key={zone}><div className="ftn-studio-clock-top"><span>{city}</span><button aria-label={'Ukloni '+city} title="Ukloni grad" onClick={()=>setZones(safe.filter(z=>z!==zone))}>×</button></div><strong className="ftn-studio-clock-face">{time}</strong><span className="ftn-studio-clock-date">{date}</span></Pane>
    })}</div>
  </div>
}
const typingTexts=['Dobar softver nastaje kroz male korake, pažljivo testiranje i jasnu komunikaciju u timu.','Redovno učenje i vežbanje pomažu nam da razumemo i složene računarske sisteme.','Svaki novi projekat prilika je da istražimo ideje, otkrijemo greške i napravimo nešto korisno.']
function Typing(){
  const [sample,setSample]=useState(0),[typed,setTyped]=useState(''),[started,setStarted]=useState<number|null>(null),[now,setNow]=useState(Date.now())
  useEffect(()=>{if(started===null||typed===typingTexts[sample])return;const timer=window.setInterval(()=>setNow(Date.now()),250);return()=>window.clearInterval(timer)},[started,typed,sample])
  const goal=typingTexts[sample],correct=typed.split('').filter((ch,i)=>ch===goal[i]).length
  const duration=started===null?0:Math.max(1,(now-started)/1000)
  const wpm=started===null?0:Math.round(correct/5/(duration/60))
  const accuracy=typed.length?Math.round(correct/typed.length*100):100
  const done=typed===goal
  const reset=(next=sample)=>{setSample(next);setTyped('');setStarted(null);setNow(Date.now())}
  return <div className="ftn-studio-page"><Title tag="VEŠTINE" name="Vežbanje kucanja" subtitle="Brzina i preciznost kucanja u realnom vremenu."
    actions={<button onClick={()=>reset((sample+1)%typingTexts.length)}>Nova vežba ↻</button>}/>
    <Pane><div className="ftn-studio-typing-stats"><div><strong>{wpm}</strong><span>reči/min</span></div><div><strong>{accuracy}%</strong><span>tačnost</span></div><div><strong>{typed.length} / {goal.length}</strong><span>karaktera</span></div></div>
      <p className="ftn-studio-typing-prompt">{goal.split('').map((ch,i)=><span key={i} className={i<typed.length?(ch===typed[i]?'correct':'incorrect'):i===typed.length?'current':''}>{ch}</span>)}</p>
      <textarea autoFocus value={typed} maxLength={goal.length} rows={4} spellCheck={false} placeholder="Počni da kucaš prikazani tekst…" aria-label="Unos vežbe kucanja" onChange={e=>{if(started===null)setStarted(Date.now());setNow(Date.now());setTyped(e.target.value)}}/>
      {done&&<p role="status" className="ftn-studio-success">Završeno! {wpm} reči/min, tačnost {accuracy}%.</p>}
      <div className="ftn-studio-toolbar"><button onClick={()=>reset()}>Pokušaj ponovo</button><button className="ftn-studio-primary" onClick={()=>reset((sample+1)%typingTexts.length)}>Sledeći tekst →</button></div>
    </Pane>
  </div>
}
type Bookmark={id:string;title:string;url:string}
function Bookmarks(){
  const [items,setItems]=useSaved<Bookmark[]>('bookmarks',[])
  const safe=Array.isArray(items)?items.filter(x=>typeof x?.title==='string'&&typeof x?.url==='string').slice(0,150):[]
  const [title,setTitle]=useState(''),[url,setUrl]=useState(''),[error,setError]=useState('')
  const add=(event:FormEvent)=>{event.preventDefault()
    try{const target=new URL(url.trim());if(!['https:','http:'].includes(target.protocol))throw Error('Samo HTTP/HTTPS adrese.')
      setItems([{id:String(Date.now()),title:title.trim().slice(0,100)||target.hostname,url:target.href},...safe]);setTitle('');setUrl('');setError('')
    }catch{setError('Unesi ispravnu HTTP ili HTTPS adresu.')}
  }
  return <div className="ftn-studio-page"><Title tag="WEB" name="Obeleživači" subtitle="Sačuvaj korisne linkove na jednom mestu."/>
    <div className="ftn-studio-layout"><Pane title="Novi obeleživač"><form className="ftn-studio-form" onSubmit={add}>
      <label>Naziv<input value={title} maxLength={100} onChange={e=>setTitle(e.target.value)} placeholder="Na primer: GitHub"/></label>
      <label>Web adresa<input type="url" required value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com"/></label>
      <button className="ftn-studio-primary">+ Sačuvaj link</button></form>{error&&<p className="ftn-studio-error" role="alert">{error}</p>}</Pane>
      <Pane title={'Sačuvani linkovi · '+safe.length}><div className="ftn-studio-bookmarks">{safe.map(link=><div key={link.id}>
        <span className="ftn-studio-bookmark-icon">↗</span><a href={link.url} target="_blank" rel="noopener noreferrer"><strong>{link.title}</strong><small>{link.url}</small></a><button title="Obriši link" onClick={()=>setItems(safe.filter(x=>x.id!==link.id))}>×</button>
      </div>)}</div>{!safe.length&&<Empty icon="⌁" title="Još nema obeleživača" text="Dodaj link sa leve strane."/>}</Pane></div>
    <p className="ftn-studio-help">Linkovi se otvaraju u novom browser tabu. Čuvaju se lokalno.</p>
  </div>
}
export function StudioApp({id}:{id:StudioAppId}){
  switch(id){
    case 'photos':return <Photos/>
    case 'colors':return <Colors/>
    case 'markdown':return <Markdown/>
    case 'json':return <JsonStudio/>
    case 'passwords':return <Passwords/>
    case 'flashcards':return <Flashcards/>
    case 'habits':return <Habits/>
    case 'worldclock':return <WorldClock/>
    case 'typing':return <Typing/>
    case 'bookmarks':return <Bookmarks/>
  }
}
