import {useState,useEffect,type ReactNode,type FormEvent} from 'react'
export type DevId='diff'|'regex'|'base64'|'urltools'|'hashing'|'csv'|'entities'|'timestamp'|'uuid'|'contrast'
export const devIds:DevId[]=['diff','regex','base64','urltools','hashing','csv','entities','timestamp','uuid','contrast']
export const devNames:Record<DevId,string>={diff:'Diff Viewer',regex:'Regex Lab',base64:'Base64',urltools:'URL Inspektor',hashing:'SHA-256 Hash',csv:'CSV Tabela',entities:'HTML Entiteti',timestamp:'Unix Time',uuid:'UUID Generator',contrast:'Kontrast boja'}
export function DevPage({category,name,description,children} :{category:string;name:string;description:string;children:ReactNode}){return <div className="ftn-suite"><header className="ftn-suite-heading"><small>{category}</small><h2>{name}</h2><p>{description}</p></header>{children}</div>}
export function DevPanel({title,children}:{title?:string;children:ReactNode}){return <section className="ftn-suite-panel">{title&&<h3>{title}</h3>}{children}</section>}
function Page({name,info,children}:{name:string;info:string;children:ReactNode}){return <DevPage name={name} description={info} category="RAZVOJ" >{children}</DevPage>}
function Panel({title,children}:{title?:string;children:ReactNode}){return <DevPanel title={title}>{children}</DevPanel>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="ftn-suite-field"><span>{label}</span>{children}</label>}
export function usePersistent<T>(id:string,initial:T):[T,(value:T|((prev:T)=>T))=>void]{
 const [value,set]=useState<T>(()=>{try{const s=localStorage.getItem('ftn-suite-'+id);return s?JSON.parse(s) as T:initial}catch{return initial}})
 useEffect(()=>{try{localStorage.setItem('ftn-suite-'+id,JSON.stringify(value))}catch{/*storage blocked*/}},[id,value])
 return [value,set]
}
export function saveText(filename:string,content:string,type='text/plain;charset=utf-8'){
 const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a')
 a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function Diff(){
 const [a,setA]=useState('const sum = a + b;'),[b,setB]=useState('const result = a + b;')
 const left=a.split('\n'),right=b.split('\n'),count=Math.max(left.length,right.length)
 return <Page name="Diff Viewer" info="Upoređivanje dve verzije teksta, red po red."><div className="ftn-suite-columns"><Panel title="Original"><textarea rows={9} value={a} onChange={e=>setA(e.target.value)} spellCheck={false}/></Panel><Panel title="Izmenjeno"><textarea rows={9} value={b} onChange={e=>setB(e.target.value)} spellCheck={false}/></Panel></div>
 <Panel title="Razlike"><div className="ftn-suite-diff">{Array.from({length:count},(_,i)=><div className={left[i]===right[i]?'':'different'} key={i}><span>{i+1}</span><code>{left[i]??'∅'}</code><code>{right[i]??'∅'}</code></div>)}</div><p className="ftn-suite-note">Poređenje je po poziciji reda, nije Git diff algoritam.</p></Panel></Page>
}
function Regex(){
 const [pattern,setPattern]=useState('[a-z]{4,}'),[flags,setFlags]=useState('gi'),[data,setData]=useState('React Vite TypeScript GNOME')
 let hits:string[]=[],error=''
 try{if(pattern.length>150)throw Error('Predugačak obrazac');hits=Array.from(data.slice(0,4000).matchAll(new RegExp(pattern,flags))).slice(0,100).map(m=>m[0])}catch(e){error=String(e)}
 return <Page name="Regex Lab" info="Testiraj JavaScript regularne izraze nad svojim tekstom."><Panel><div className="ftn-suite-row"><Field label="Regex"><input value={pattern} onChange={e=>setPattern(e.target.value)}/></Field><Field label="Flags"><select value={flags} onChange={e=>setFlags(e.target.value)}>{['g','gi','gm','gim','gs','gis'].map(x=><option key={x}>{x}</option>)}</select></Field></div><Field label="Tekst"><textarea rows={6} value={data} onChange={e=>setData(e.target.value)}/></Field>
 {error?<p className="ftn-suite-error">{error}</p>:<><h3>{hits.length} poklapanja</h3><div className="ftn-suite-chips">{hits.map((x,i)=><code key={i}>{x||'(prazno)'}</code>)}</div></>}
 <p className="ftn-suite-note">Veoma složeni regularni izrazi mogu usporiti browser.</p></Panel></Page>
}
function Base64(){
 const [input,setInput]=useState('FTN Portal'),[result,setResult]=useState(''),[mode,setMode]=useState<'encode'|'decode'>('encode'),[error,setError]=useState('')
 const act=()=>{try{setResult(mode==='encode'?btoa(Array.from(new TextEncoder().encode(input),x=>String.fromCharCode(x)).join('')):new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(input),x=>x.charCodeAt(0))));setError('')}catch{setError('Neispravan Base64 / UTF-8');setResult('')}}
 return <Page name="Base64" info="Pretvori UTF-8 tekst u Base64 i nazad."><Panel><div className="ftn-suite-tabs"><button className={mode==='encode'?'active':''} onClick={()=>setMode('encode')}>Kodiranje</button><button className={mode==='decode'?'active':''} onClick={()=>setMode('decode')}>Dekodiranje</button></div><Field label="Ulaz"><textarea rows={5} value={input} onChange={e=>setInput(e.target.value)}/></Field><button className="ftn-suite-primary" onClick={act}>Konvertuj</button><Field label="Rezultat"><textarea readOnly rows={5} value={result}/></Field>{error&&<p className="ftn-suite-error">{error}</p>}</Panel></Page>
}
function Urltools(){
 const [input,setInput]=useState('https://example.com/search?q=ftn&lang=sr'),[key,setKey]=useState(''),[value,setValue]=useState('')
 let url:URL|null=null;try{url=new URL(input);if(!['https:','http:'].includes(url.protocol))url=null}catch{/*invalid*/}
 const add=(e:FormEvent)=>{e.preventDefault();if(url&&key.trim()){url.searchParams.set(key,value);setInput(url.href);setKey('');setValue('')}}
 return <Page name="URL Inspektor" info="Analiza web adresa i parametara."><Panel><Field label="Web adresa"><input value={input} onChange={e=>setInput(e.target.value)} spellCheck={false}/></Field>
 {url?<><div className="ftn-suite-details">{[['Protokol',url.protocol],['Domen',url.hostname],['Putanja',url.pathname],['Fragment',url.hash||'—'],...Array.from(url.searchParams.entries())].map(([a,b],i)=><div key={i}><span>{a}</span><code>{b}</code></div>)}</div><form className="ftn-suite-inline" onSubmit={add}><input aria-label="Parametar" placeholder="Parametar" value={key} onChange={e=>setKey(e.target.value)}/><input aria-label="Vrednost" placeholder="Vrednost" value={value} onChange={e=>setValue(e.target.value)}/><button>Dodaj</button></form></>:<p className="ftn-suite-error">Nevažeća HTTP/HTTPS adresa.</p>}</Panel></Page>
}
function Hashing(){
 const [input,setInput]=useState('FTN Nastavni Portal'),[result,setResult]=useState(''),[status,setStatus]=useState('')
 const action=async()=>{try{const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(input));setResult(Array.from(new Uint8Array(data),v=>v.toString(16).padStart(2,'0')).join(''));setStatus('SHA-256 je izračunat.')}catch{setStatus('Kriptografski API nije dostupan.')}}
 return <Page name="SHA-256 Hash" info="Izračunavanje kriptografskog otiska teksta."><Panel><Field label="Tekst"><textarea rows={7} value={input} onChange={e=>setInput(e.target.value)}/></Field><button className="ftn-suite-primary" onClick={()=>void action()}>Izračunaj</button><output className="ftn-suite-code">{result||'Rezultat će se prikazati ovde.'}</output><p className="ftn-suite-note">{status||'Lokalni Web Crypto API.'}</p></Panel></Page>
}
function parseCsv(text:string){
 const rows:string[][]=[];let row:string[]=[],cell='',quoted=false
 for(let i=0;i<text.length;i++){const x=text[i]
  if(x==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(x===','&&!quoted){row.push(cell);cell=''}
  else if((x==='\n'||x==='\r')&&!quoted){if(x==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=x
 }
 if(quoted)throw Error('Nedovršen CSV navodnik')
 if(row.length||cell){row.push(cell);rows.push(row)}
 return rows
}
function Csv(){
 const [text,setText]=useState('Predmet,ECTS,Poeni\nERS,7,90\nOIB,6,85')
 let rows:string[][]=[];let error=''
 try{rows=parseCsv(text.slice(0,50000)).slice(0,501)}catch(e){error=String(e)}
 return <Page name="CSV Tabela" info="Lokalni pregled CSV sadržaja sa navodnicima."><Panel><div className="ftn-suite-actions"><strong>{Math.max(0,rows.length-1)} redova</strong><button onClick={()=>saveText('tabela.csv',text,'text/csv')}>↓ CSV</button></div><Field label="CSV sadržaj"><textarea rows={5} spellCheck={false} value={text} onChange={e=>setText(e.target.value)}/></Field>
 {error?<p className="ftn-suite-error">{error}</p>:<div className="ftn-suite-table"><table><thead><tr>{(rows[0]??[]).map((h,i)=><th key={i}>{h}</th>)}</tr></thead><tbody>{rows.slice(1).map((r,i)=><tr key={i}>{(rows[0]??[]).map((_,j)=><td key={j}>{r[j]??''}</td>)}</tr>)}</tbody></table></div>}</Panel></Page>
}
const entities:[string,string][]=[['&','&amp;'],['<','&lt;'],['>','&gt;'],['"','&quot;'],["'",'&#39;']]
function Entities(){
 const [text,setText]=useState('<h1 title="FTN">A & B</h1>'),[mode,setMode]=useState<'encode'|'decode'>('encode')
 const result=mode==='encode'?entities.reduce((a,[b,c])=>a.replaceAll(b,c),text):text.replace(/&(amp|lt|gt|quot|#39);/g,c=>entities.find(x=>x[1]===c)?.[0]??c)
 return <Page name="HTML Entiteti" info="Kodiranje rezervisanih HTML karaktera."><Panel><div className="ftn-suite-tabs">{(['encode','decode'] as const).map(m=><button key={m} className={mode===m?'active':''} onClick={()=>setMode(m)}>{m==='encode'?'Kodiraj':'Dekodiraj'}</button>)}</div><Field label="Ulaz"><textarea rows={6} value={text} onChange={e=>setText(e.target.value)}/></Field><Field label="Rezultat"><textarea rows={6} readOnly value={result}/></Field><button onClick={()=>saveText('entiteti.txt',result)}>↓ Sačuvaj</button></Panel></Page>
}
function Timestamp(){
 const [time,setTime]=useState(()=>new Date().toISOString().slice(0,16)),[unix,setUnix]=useState('')
 const date=new Date(time),parsed=unix.trim()?new Date(Number(unix)*1000):null
 return <Page name="Unix Time" info="Konverzija Unix sekundi i datuma."><div className="ftn-suite-columns"><Panel title="Datum → Unix"><Field label="Datum"><input type="datetime-local" value={time} onChange={e=>setTime(e.target.value)}/></Field><output className="ftn-suite-code">{Number.isFinite(date.getTime())?Math.floor(date.getTime()/1000):'—'}</output></Panel><Panel title="Unix → Datum"><Field label="Sekunde"><input type="number" value={unix} placeholder="1760000000" onChange={e=>setUnix(e.target.value)}/></Field><output className="ftn-suite-code">{parsed&&Number.isFinite(parsed.getTime())?parsed.toLocaleString('sr-RS'):'—'}</output></Panel></div></Page>
}
function Uuid(){
 const [ids,setIds]=useState<string[]>([]),[status,setStatus]=useState('')
 const generate=()=>{if(typeof crypto.randomUUID==='function'){setIds(Array.from({length:8},()=>crypto.randomUUID()));setStatus('')}else setStatus('UUID API nije dostupan.')}
 return <Page name="UUID Generator" info="Generisanje UUID v4 identifikatora."><Panel><button className="ftn-suite-primary" onClick={generate}>Generiši 8 UUID-a</button><div className="ftn-suite-list">{ids.map(id=><code key={id}>{id}</code>)}</div>{ids.length>0&&<button onClick={()=>saveText('uuid.txt',ids.join('\n'))}>↓ Sačuvaj</button>}<p className="ftn-suite-note">{status}</p></Panel></Page>
}
function luminance(hex:string){const n=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*n[0]+.7152*n[1]+.0722*n[2]}
function Contrast(){
 const [front,setFront]=useState('#ffffff'),[back,setBack]=useState('#215db2')
 const a=luminance(front),b=luminance(back),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05)
 return <Page name="Kontrast boja" info="WCAG AA provera čitljivosti teksta."><Panel><div className="ftn-suite-row"><Field label="Tekst"><input type="color" value={front} onChange={e=>setFront(e.target.value)}/></Field><Field label="Pozadina"><input type="color" value={back} onChange={e=>setBack(e.target.value)}/></Field></div><div className="ftn-suite-contrast" style={{background:back,color:front}}><strong>Primer teksta Aa</strong><span>Accessible design for everyone.</span></div><div className="ftn-suite-details"><div><span>Kontrast</span><strong>{ratio.toFixed(2)}:1</strong></div><div><span>Normalan tekst</span><strong>{ratio>=4.5?'AA prolazi':'Ne prolazi'}</strong></div><div><span>Veliki tekst</span><strong>{ratio>=3?'AA prolazi':'Ne prolazi'}</strong></div></div></Panel></Page>
}
export function DevApp({id}:{id:DevId}){switch(id){
 case 'diff':return <Diff/>
 case 'regex':return <Regex/>
 case 'base64':return <Base64/>
 case 'urltools':return <Urltools/>
 case 'hashing':return <Hashing/>
 case 'csv':return <Csv/>
 case 'entities':return <Entities/>
 case 'timestamp':return <Timestamp/>
 case 'uuid':return <Uuid/>
 case 'contrast':return <Contrast/>
}}
