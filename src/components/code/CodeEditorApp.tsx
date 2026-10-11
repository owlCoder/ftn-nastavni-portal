import {useEffect,useMemo,useRef,useState} from 'react'
import {assetUrl} from '../../lib/assets'
import {isTextEntry,parseZip,readZipBytes,type ZipEntry} from '../../lib/archive'
import {loadCodeDrafts,storeCodeDraft} from '../../lib/editorStorage'
import {codeLanguageForFile,codeLanguageLabel} from '../../lib/highlight'
import {downloadFolderZip, type DownloadEntry} from '../courseDownloads'
import {CourseBrowserIcon,CourseFileIcon} from '../CourseFileIcon'
import {codeProjects,type CodeProject} from '../../lib/codeProjects'
import {CodeSurface,type CodeSurfaceApi,type EditorPosition} from './CodeSurface'

type Document={original:string;bom:boolean;text:string}
type ProjectData={source:string;buffer:ArrayBuffer;entries:ZipEntry[];documents:Map<string,Document>;changes:Map<string,string>}
const defaultPosition:EditorPosition={line:1,column:1,lines:0,undo:0,redo:0}
function Glyph({path}:{path:string}){
  const extension=path.split('.').pop()?.toLowerCase()
  return <span className={'ftn-code-glyph is-'+(extension==='cs'?'csharp':extension==='json'?'json':'text')} aria-hidden="true">{extension==='cs'?'C#':extension==='json'?'{}':extension==='csproj'?'<>':'≡'}</span>
}
export function CodeEditorApp({project,onProjectChange}:{project:CodeProject|null;onProjectChange:(project:CodeProject)=>void}){
  const choice:CodeProject=project??codeProjects[0]
  const [data,setData]=useState<ProjectData|null>(null),dataRef=useRef<ProjectData|null>(null)
  const [active,setActive]=useState(''),[tabs,setTabs]=useState<string[]>([]),[expanded,setExpanded]=useState<Set<string>>(()=>new Set())
  const [loading,setLoading]=useState(false),[opening,setOpening]=useState(''),[error,setError]=useState(''),[exporting,setExporting]=useState('')
  const [revision,setRevision]=useState(0),[position,setPosition]=useState(defaultPosition),[saving,setSaving]=useState(false)
  const [query,setQuery]=useState(''),[sidebar,setSidebar]=useState(()=>innerWidth>=700)
  const [fontSize,setFontSize]=useState(()=>{try{return Math.max(11,Math.min(28,Number(localStorage.getItem('ftn-code-font-size'))||15))}catch{return 15}})
  const [wrap,setWrap]=useState(()=>{try{return localStorage.getItem('ftn-code-wrap')==='true'}catch{return false}})
  const api=useRef<CodeSurfaceApi|null>(null),host=useRef<HTMLElement>(null),selectionSerial=useRef(0),writes=useRef(0)
  useEffect(()=>{try{localStorage.setItem('ftn-code-font-size',String(fontSize));localStorage.setItem('ftn-code-wrap',String(wrap))}catch{/* Editor still works without preferences storage. */}},[fontSize,wrap])
  useEffect(()=>{
    if(!choice)return
    try{localStorage.setItem('ftn-code-last-project',JSON.stringify({file:choice.file,title:choice.title}))}catch{/* Preferences unavailable. */}
    const controller=new AbortController()
    dataRef.current=null;setData(null);setLoading(true);setActive('');setTabs([]);setError('');setQuery('');setOpening('')
    const load=async()=>{
      const response=await fetch(assetUrl(choice.file),{signal:controller.signal})
      if(!response.ok)throw Error('Primer trenutno nije dostupan.')
      const buffer=await response.arrayBuffer(),entries=parseZip(buffer)
      const next:ProjectData={source:choice.file,buffer,entries,documents:new Map(),changes:new Map()}
      try{
        const drafts=await loadCodeDrafts(choice.file)
        for(const draft of drafts){
          const entry=entries.find(entry=>entry.name===draft.path&&isTextEntry(entry))
          if(!entry)continue
          const bytes=await readZipBytes(buffer,entry),original=new TextDecoder().decode(bytes)
          const bom=bytes[0]===239&&bytes[1]===187&&bytes[2]===191
          next.documents.set(entry.name,{original,bom,text:draft.text})
          if(draft.text!==original)next.changes.set(entry.name,draft.text)
        }
      }catch{if(!controller.signal.aborted)setError('Lokalno čuvanje nije dostupno. Izmene sačuvaj kao ZIP.')}
      if(controller.signal.aborted)return
      dataRef.current=next;setData(next);setLoading(false)
      const preferred=entries.find(entry=>entry.name===choice.initialFile&&isTextEntry(entry))??entries.find(entry=>/\/Program\.cs$/.test(entry.name))??entries.find(isTextEntry)
      if(preferred)await openFile(preferred.name,next)
    }
    void load().catch(e=>{if(!controller.signal.aborted){setLoading(false);setError(e instanceof Error?e.message:'Primer ne može da se otvori.')}})
    return()=>{controller.abort();selectionSerial.current++}
    // The archive reloads only when the project changes, preserving open tabs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[choice?.file])
  useEffect(()=>{if(choice?.initialFile&&dataRef.current?.source===choice.file)void openFile(choice.initialFile)},[choice?.initialFile,choice?.file])
  async function openFile(path:string,current=dataRef.current){
    if(!current)return
    const entry=current.entries.find(item=>item.name===path)
    if(!entry||!isTextEntry(entry))return
    const serial=++selectionSerial.current
    setOpening(path)
    try{
      if(!current.documents.has(path)){
        const bytes=await readZipBytes(current.buffer,entry),original=new TextDecoder().decode(bytes)
        current.documents.set(path,{original,text:current.changes.get(path)??original,bom:bytes[0]===239&&bytes[1]===187&&bytes[2]===191})
      }
      if(serial!==selectionSerial.current||dataRef.current!==current)return
      setTabs(old=>old.includes(path)?old:[...old,path]);setActive(path);setPosition(defaultPosition)
      setExpanded(old=>{const next=new Set(old),parts=path.split('/');for(let i=1;i<parts.length;i++)next.add(parts.slice(0,i).join('/'));return next})
      if(innerWidth<700)setSidebar(false)
    }catch(e){setError(e instanceof Error?e.message:'Fajl ne može da se otvori.')}
    finally{if(serial===selectionSerial.current)setOpening('')}
  }
  const changed=(text:string)=>{
    const current=dataRef.current,document=current?.documents.get(active)
    if(!current||!document)return
    document.text=text
    if(text===document.original)current.changes.delete(active);else current.changes.set(active,text)
    setRevision(value=>value+1);setSaving(true);writes.current++
    // Queue each IndexedDB transaction immediately, including the last keypress
    // before closing a tab or window. Only modified files need stored drafts.
    void storeCodeDraft(current.source,active,text===document.original?null:text).catch(()=>{
      if(dataRef.current===current)setError('Izmena nije sačuvana lokalno. Sačuvaj ZIP pre zatvaranja.')
    }).finally(()=>{writes.current--;if(writes.current===0)setSaving(false)})
  }
  const closeTab=(path:string)=>{
    const remaining=tabs.filter(tab=>tab!==path);setTabs(remaining)
    if(active===path){const next=remaining.at(-1);if(next)void openFile(next);else setActive('')}
  }
  const exportZip=async()=>{
    if(!data||exporting)return
    try{
      setExporting('Priprema ZIP-a…')
      const entries:DownloadEntry[]=[]
      for(const entry of data.entries){
        if(entry.isDirectory)continue
        let bytes:Uint8Array
        const draft=data.changes.get(entry.name)
        if(draft!==undefined){
          const text=new TextEncoder().encode(draft),document=data.documents.get(entry.name)
          if(document?.bom){bytes=new Uint8Array(text.length+3);bytes.set([239,187,191]);bytes.set(text,3)}else bytes=text
        }else bytes=await readZipBytes(data.buffer,entry)
        entries.push({path:entry.name,bytes})
      }
      await downloadFolderZip(choice.title.replace(/\.zip$/i,'')+'-izmenjeno.zip',entries,setExporting)
    }catch(e){setError(e instanceof Error?e.message:'ZIP nije sačuvan.')}
    finally{setExporting('')}
  }
  const rows=useMemo(()=>{
    if(!data)return []
    const matches=data.entries.filter(entry=>!entry.isDirectory&&(!query||entry.name.toLowerCase().includes(query.toLowerCase())))
    const folders=new Set<string>()
    matches.forEach(entry=>{const parts=entry.name.split('/');for(let i=1;i<parts.length;i++)folders.add(parts.slice(0,i).join('/'))})
    return [...[...folders].map(path=>({path,folder:true,entry:undefined as ZipEntry|undefined})),...matches.map(entry=>({path:entry.name,folder:false,entry}))]
      .sort((a,b)=>a.path.localeCompare(b.path,'sr'))
      .filter(row=>query||row.path.split('/').slice(0,-1).every((_,i)=>expanded.has(row.path.split('/').slice(0,i+1).join('/'))))
  },[data,expanded,query])
  const document=data?.documents.get(active),dirty=data?.changes.size??0
  const toggleFolder=(path:string)=>setExpanded(old=>{const next=new Set(old);if(next.has(path))next.delete(path);else next.add(path);return next})
  const fullscreen=()=>{if(documentFullscreen())void globalThis.document.exitFullscreen();else if(host.current)void host.current.requestFullscreen()}
  function documentFullscreen(){return globalThis.document.fullscreenElement===host.current}
  return <section className="ftn-code-workbench" ref={host} data-revision={revision} aria-label="Code editor">
    <header className="ftn-code-projectbar">
      <button className="ftn-code-tool" onClick={()=>setSidebar(value=>!value)} aria-label={sidebar?'Sakrij fajlove':'Prikaži fajlove'} aria-pressed={sidebar}><CourseBrowserIcon name="folder"/></button>
      <select aria-label="Primer koda" value={choice?.file??''} onChange={event=>{const next=codeProjects.find(item=>item.file===event.target.value);if(next)onProjectChange(next)}}>
        {[...new Set(codeProjects.map(item=>item.course))].map(course=><optgroup key={course} label={course}>{codeProjects.filter(item=>item.course===course).map(item=><option key={item.file} value={item.file}>{item.label}</option>)}</optgroup>)}
      </select>
      <span className="ftn-code-project-count" title="Broj lokalno izmenjenih fajlova">{dirty?dirty+' izmenjeno':''}</span>
      <button className="ftn-code-save" onClick={()=>void exportZip()} disabled={!data||Boolean(exporting)}><CourseBrowserIcon name="download"/><span>{exporting?'Priprema…':'Sačuvaj ZIP'}</span></button>
    </header>
    <div className="ftn-code-layout">
      {sidebar&&<aside className="ftn-code-explorer" aria-label="Fajlovi projekta">
        <div className="ftn-code-explorer-heading"><span>FAJLOVI</span><small>{data?.entries.filter(entry=>!entry.isDirectory).length??0}</small></div>
        <input type="search" aria-label="Pronađi fajl" placeholder="Pronađi fajl…" value={query} onChange={event=>setQuery(event.target.value)}/>
        <div className="ftn-code-tree">{rows.map(row=><button key={row.path} className={'ftn-code-tree-row'+(active===row.path?' is-active':'')+(data?.changes.has(row.path)?' is-modified':'')}
          title={row.path} style={{paddingLeft:8+Math.min(8,row.path.split('/').length-1)*13}} disabled={!row.folder&&!isTextEntry(row.entry!)}
          aria-expanded={row.folder?Boolean(query)||expanded.has(row.path):undefined}
          onClick={()=>row.folder?toggleFolder(row.path):void openFile(row.path)}>
          {row.folder?<><span className="ftn-code-chevron">{query||expanded.has(row.path)?'▾':'▸'}</span><CourseFileIcon kind="folder"/></>:<Glyph path={row.path}/>}
          <span className="ftn-code-filename">{row.path.split('/').pop()}</span>{data?.changes.has(row.path)&&<span className="ftn-code-dirty" aria-label="Izmenjen fajl">●</span>}
        </button>)}</div>
      </aside>}
      <main className="ftn-code-main">
        <div className="ftn-code-tabs" role="tablist" aria-label="Otvoreni fajlovi">{tabs.map(path=><div className={'ftn-code-tab'+(path===active?' is-active':'')} key={path}>
          <button role="tab" aria-selected={path===active} title={path} onClick={()=>void openFile(path)}><Glyph path={path}/><span>{path.split('/').pop()}</span>{data?.changes.has(path)&&<span className="ftn-code-dirty" aria-label="Izmenjen fajl">●</span>}</button>
          <button className="ftn-code-tab-close" aria-label={'Zatvori fajl '+path.split('/').pop()} onClick={()=>closeTab(path)}>×</button>
        </div>)}</div>
        <div className="ftn-code-toolbar">
          <button className="ftn-code-tool" aria-label="Poništi izmenu" title="Poništi · Ctrl+Z" disabled={!position.undo||!active} onClick={()=>api.current?.undo()}>↶</button>
          <button className="ftn-code-tool" aria-label="Ponovi izmenu" title="Ponovi · Ctrl+Shift+Z" disabled={!position.redo||!active} onClick={()=>api.current?.redo()}>↷</button>
          <button className="ftn-code-tool" aria-label="Pretraži kod" title="Pretraži · Ctrl+F" disabled={!active} onClick={()=>api.current?.find()}><CourseBrowserIcon name="search"/></button>
          <span className="ftn-code-toolbar-divider"/>
          <button className="ftn-code-tool" aria-label="Umanji tekst koda" disabled={fontSize<=11} onClick={()=>setFontSize(value=>value-1)}>−</button>
          <button className="ftn-code-zoom" aria-label="Vrati veličinu teksta koda" onClick={()=>setFontSize(15)}>{Math.round(fontSize/15*100)}%</button>
          <button className="ftn-code-tool" aria-label="Uvećaj tekst koda" disabled={fontSize>=28} onClick={()=>setFontSize(value=>value+1)}>+</button>
          <button className={'ftn-code-wrap'+(wrap?' is-active':'')} aria-pressed={wrap} onClick={()=>setWrap(value=>!value)} title="Prelamanje dugih redova">Word wrap</button>
          <span className="ftn-code-toolbar-spacer"/>
          <button className="ftn-code-reset" disabled={!document||document.text===document.original} onClick={()=>{if(document)api.current?.replace(document.original)}} title="Vrati ovaj fajl na original; izmenu je moguće poništiti">Vrati original</button>
          <button className="ftn-code-tool" aria-label="Ceo ekran editora" onClick={fullscreen}><CourseBrowserIcon name="fullscreen"/></button>
        </div>
        {active&&<div className="ftn-code-breadcrumb" title={active}>{active.split('/').map((part,index)=><span key={index}>{index>0&&<i>›</i>}{part}</span>)}</div>}
        {error&&<div className="ftn-code-error" role="alert">{error}<button aria-label="Zatvori poruku" onClick={()=>setError('')}>×</button></div>}
        {document&&active?<CodeSurface fileKey={data!.source+'::'+active} text={document.text} fontSize={fontSize} wrap={wrap} onChange={changed} onPosition={setPosition} onApi={value=>{api.current=value}}/>:
          <div className="ftn-code-empty"><span>〈/〉</span><p>{loading?'Otvaranje projekta…':opening?'Otvaranje fajla…':'Izaberi fajl iz projekta.'}</p></div>}
        <footer className="ftn-code-status" aria-live="polite"><span>{saving?'Čuvanje…':dirty?'Sačuvano lokalno':'Bez lokalnih izmena'}</span><span className="ftn-code-toolbar-spacer"/><span>Ln {position.line}, Kol {position.column}</span><span>UTF-8{document?.bom?' BOM':''}</span><span>{document?.original.includes('\r\n')?'CRLF':'LF'}</span><span>{active?codeLanguageLabel(codeLanguageForFile(active)):''}</span></footer>
      </main>
    </div>
  </section>
}
