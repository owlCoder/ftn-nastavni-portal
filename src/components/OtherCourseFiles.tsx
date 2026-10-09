import { useEffect, useMemo, useState } from 'react'
import type { Course } from '../courses/types'
import { oibExamples, oibExamplesBundle } from '../courses/oib/examples'
import { odpExamples, odpExamplesBundle } from '../courses/odp/examples'
import { PdfViewer } from './PdfViewer'
import { assetUrl } from '../lib/assets'
import { PracticumDocument } from './document/PracticumDocument'
import { CheckpointsView } from './CheckpointsView'
import { ZipFileViewer } from './ZipFileViewer'
import { checkpointMarkdown, downloadFolderZip, downloadText, practicumMarkdown, type DownloadEntry } from './courseDownloads'

type FileKind='folder'|'practicum'|'section'|'checkpoints'|'pdf'|'zip'
type Item={
  id:string;parent:string|null;name:string;kind:FileKind;
  description?:string;source?:string;size?:string;pages?:number;exercise?:number
}
const exNumber=(n:number)=>String(n).padStart(2,'0')
function makeFiles(course:Course):Item[]{
  const slides=course.presentations.kind==='downloads'?course.presentations.downloads:[]
  const bundle=course.presentations.kind==='downloads'?course.presentations.bundle:null
  const examples=course.id==='oib'?oibExamples:odpExamples
  const exampleBundle=course.id==='oib'?oibExamplesBundle:odpExamplesBundle
  const items:Item[]=[
    {id:'praktikum',parent:'root',name:'Praktikum',kind:'practicum',description:'Kontinuirani nastavni dokument'},
    {id:'vezbe',parent:'root',name:'Vežbe',kind:'folder',description:'Osam vežbi i nastavni materijali'},
    {id:'prezentacije',parent:'root',name:'Prezentacije',kind:'folder',description:'PDF slajdovi'},
    {id:'primeri',parent:'root',name:'Primeri',kind:'folder',description:'Izvorni kod i ZIP arhive'},
    {id:'kontrolne',parent:'root',name:'Kontrolne tačke',kind:'checkpoints',description:'Projektne etape i rokovi'},
  ]
  if(course.project)items.push({id:'projektna-specifikacija',parent:'root',name:'Projektna specifikacija.pdf',
    kind:'pdf',source:course.project.file,size:course.project.size,pages:course.project.pages,description:course.project.title})
  for(let n=1;n<=8;n++){
    const prefix='vezbe/'+exNumber(n),slide=slides.find(p=>Number(p.number)===n)
    const example=examples.find(p=>p.exercise===n)
    items.push({id:prefix,parent:'vezbe',kind:'folder',name:'Vežba '+exNumber(n),description:slide?.title??example?.title??'Nastavni materijali'})
    items.push({id:prefix+'/practicum',parent:prefix,kind:'section',exercise:n,name:'Tekst vežbe u praktikumu',description:'Poglavlje u kontinuiranom dokumentu'})
    if(slide)items.push({id:prefix+'/slides',parent:prefix,kind:'pdf',
      name:slide.number+' — '+slide.title+'.pdf',source:slide.file,size:slide.size,pages:slide.pages,description:slide.label})
    if(example)items.push({id:prefix+'/example',parent:prefix,kind:'zip',
      name:example.title+'.zip',source:example.zip,description:example.description})
  }
  for(const slide of slides)items.push({id:'prezentacije/'+slide.number,parent:'prezentacije',kind:'pdf',
    name:slide.number+' — '+slide.title+'.pdf',source:slide.file,size:slide.size,pages:slide.pages,description:slide.label})
  if(bundle)items.push({id:'prezentacije/sve',parent:'prezentacije',kind:'zip',
    name:'Sve prezentacije.zip',source:bundle.file,size:bundle.size})
  for(const example of examples){
    const folder='primeri/'+exNumber(example.exercise)
    items.push({id:folder,parent:'primeri',kind:'folder',name:'Vežba '+exNumber(example.exercise),description:example.title})
    items.push({id:folder+'/zip',parent:folder,kind:'zip',name:example.title+'.zip',source:example.zip,description:example.description})
  }
  items.push({id:'primeri/sve',parent:'primeri',kind:'zip',name:'Svi primeri.zip',source:exampleBundle})
  return items
}
const safeName=(name:string)=>name.replaceAll(/[<>:"/\\|?*]/g,'-')
function EntryIcon({kind}:{kind:FileKind}){
  return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className={'ers-entry-icon ers-entry-'+kind}>
    {kind==='folder'?<>
      <path d="M4 10a4 4 0 0 1 4-4h9l4 4h7a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#72afe1"/>
      <path d="M4 15a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#9bc9ed"/>
    </>:<>
      <path d="M8 3h13l8 8v21H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2" fill="#fff" stroke="#d4dce7" strokeWidth="1.2"/>
      <path d="M21 3v8h8" fill="#e9edf5"/>
      {kind==='pdf'?<><rect x="9" y="20" width="19" height="9" rx="3" fill="#e9786e"/><text x="18.5" y="26.5" fontSize="6.5" textAnchor="middle" fontWeight="800" fill="#fff">PDF</text></>:
        kind==='zip'?<><rect x="9" y="20" width="19" height="9" rx="3" fill="#7ea5cc"/><text x="18.5" y="26.5" fontSize="6.5" textAnchor="middle" fontWeight="800" fill="#fff">ZIP</text></>:
        kind==='checkpoints'?<><path d="m12 22 4 4 8-9" stroke="#55ad82" strokeWidth="2.5" strokeLinecap="round"/></>:
        <><path d="M12 17h12m-12 5h9m-9 5h11" stroke="#7098c5" strokeWidth="1.6" strokeLinecap="round"/></>}
    </>}
  </svg>
}
function fileContent(item:Item,course:Course):DownloadEntry|null{
  if(item.source)return {path:item.name,url:item.source}
  if(item.kind==='practicum')return {path:'Praktikum.md',text:practicumMarkdown(course)}
  if(item.kind==='checkpoints')return {path:'Kontrolne_tacke.md',text:checkpointMarkdown(course)}
  if(item.kind==='section')return {path:'Vezba_'+exNumber(item.exercise??1)+'_praktikum.md',text:practicumMarkdown(course,item.exercise)}
  return null
}
function folderEntries(course:Course,id:string,files:Item[],lookup:Map<string,Item>):DownloadEntry[]{
  const descendant=(item:Item,folder:string)=>{
    let parent=item.parent
    while(parent){if(parent===folder)return true;parent=lookup.get(parent)?.parent??null}
    return false
  }
  return files.filter(item=>item.kind!=='folder'&&(id==='root'||descendant(item,id)))
    .map(item=>{
      const file=fileContent(item,course)
      if(!file)return null
      const parents:string[]=[]
      let parentId=item.parent
      while(parentId&&parentId!==id&&parentId!=='root'){
        const parent=lookup.get(parentId)
        if(!parent)break
        parents.unshift(safeName(parent.name));parentId=parent.parent
      }
      return {...file,path:[...parents,safeName(file.path)].join('/')}
    }).filter((item):item is DownloadEntry=>item!==null)
}
type Preview={kind:FileKind;item:Item}

export function OtherCourseFiles({course}:{course:Course}){
  const files=useMemo(()=>makeFiles(course),[course])
  const lookup=useMemo(()=>new Map(files.map(item=>[item.id,item])),[files])
  const children=(id:string)=>files.filter(item=>item.parent===id)
  const [folder,setFolder]=useState('root')
  const [preview,setPreview]=useState<Preview|null>(null)
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(['root']))
  const [busy,setBusy]=useState('')
  const [error,setError]=useState('')
  const current=lookup.get(folder)
  const folderItems=children(folder)
  const breadcrumb=useMemo(()=>{
    const items=[{id:'root',name:course.code}],branches:Item[]=[]
    let id=folder
    while(id!=='root'){
      const item=lookup.get(id)
      if(!item)break
      branches.unshift(item)
      id=item.parent??'root'
    }
    return [...items,...branches.map(item=>({id:item.id,name:item.name}))]
  },[folder,course.code,lookup])
  const visit=(item:Item)=>{
    setError('')
    if(item.kind==='folder'){
      setFolder(item.id);setPreview(null)
      setExpanded(old=>new Set(old).add(item.id))
    }else setPreview({kind:item.kind,item})
  }
  const navigate=(id:string)=>{setPreview(null);setFolder(id);setError('')}
  const back=()=>preview?setPreview(null):navigate(current?.parent??'root')
  const save=async(item?:Item)=>{
    if(busy)return
    setError('')
    if(item && item.kind!=='folder'){
      const file=fileContent(item,course)
      if(!file)return
      if(file.url){
        try{
          setBusy('Preuzimanje fajla…')
          const response=await fetch(assetUrl(file.url))
          if(!response.ok)throw Error('Fajl trenutno nije dostupan.')
          const blob=new Blob([await response.arrayBuffer()])
          const url=URL.createObjectURL(blob)
          const link=document.createElement('a')
          link.href=url;link.download=file.path;link.style.display='none';document.body.append(link);link.click();link.remove()
          window.setTimeout(()=>URL.revokeObjectURL(url),60_000)
        }catch(e){setError(e instanceof Error?e.message:'Preuzimanje nije uspelo.')}
        finally{setBusy('')}
      }else if(file.text!==undefined)downloadText(file.path,file.text)
      return
    }
    const target=item?.id??folder
    const filename=target==='root'?course.code+'-Materijali':safeName(item?.name??current?.name??'Materijali')
    try{
      setBusy('Priprema foldera…')
      await downloadFolderZip(filename,folderEntries(course,target,files,lookup),setBusy)
    }catch(e){setError(e instanceof Error?e.message:'Preuzimanje foldera nije uspelo.')}
    finally{setBusy('')}
  }
  const toggle=(id:string)=>setExpanded(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else next.add(id);return next})
  const tree=(parentId:string,depth=0):React.ReactNode=>children(parentId).map(item=>{
    const hasChildren=item.kind==='folder'
    const shown=expanded.has(item.id)
    return <div key={item.id}>
      <div className={'ers-tree-row'+(folder===item.id?' selected':'')+(preview?.item.id===item.id?' selected':'')} style={{paddingLeft:8+depth*13}}>
        {hasChildren?<button type="button" className="ers-tree-arrow" aria-label={shown?'Sažmi folder':'Proširi folder'} onClick={()=>toggle(item.id)}>{shown?'▾':'▸'}</button>:<span className="ers-tree-spacer"/>}
        <button className="ers-tree-select" title={item.name} onClick={()=>visit(item)}><EntryIcon kind={item.kind}/><span>{item.name}</span></button>
      </div>
      {hasChildren && shown&&depth<5&&tree(item.id,depth+1)}
    </div>
  })
  const viewing=preview?.item
  useEffect(()=>{
    if(viewing?.kind!=='section'||!viewing.exercise)return
    const exercise=viewing.exercise
    const frame=window.requestAnimationFrame(()=>{
      const toc=document.querySelector('.ers-continuous-document .toc-panel')
      const heading=[...(toc?.querySelectorAll<HTMLAnchorElement>('a')??[])].find(link=>
        new RegExp('^Vežba\\s+'+exercise+'(?:\\D|$)','i').test(link.textContent?.trim()??''))
      const id=heading?.getAttribute('href')?.slice(1)
      if(id)document.getElementById(id)?.scrollIntoView({behavior:'auto',block:'start'})
    })
    return()=>window.cancelAnimationFrame(frame)
  },[viewing?.id,viewing?.kind,viewing?.exercise])
  const pdfViewing=viewing?.kind==='pdf' && viewing.source
  return <div className="ers-explorer">
    <header className="ers-explorer-toolbar">
      <div className="ers-files-navigation">
        <button className="ers-nav-button" title="Nazad" aria-label="Nazad" onClick={back} disabled={folder==='root'&&!preview}>‹</button>
        <button className="ers-nav-button" title="Početni folder" aria-label="Početni folder" onClick={()=>navigate('root')}>⌂</button>
      </div>
      <nav className="ers-breadcrumb" aria-label="Putanja">
        {breadcrumb.map(item=><button key={item.id} onClick={()=>navigate(item.id)}>{item.name}</button>)}
        {viewing&&<><span>›</span><strong>{viewing.name}</strong></>}
      </nav>
      <div className="ers-toolbar-actions">
        <button className="ers-download" onClick={()=>void save(viewing??current??undefined)} disabled={Boolean(busy)}
          title={viewing?'Preuzmi ovaj fajl':'Preuzmi folder kao ZIP'}>
          ↓ <span>{busy||'Preuzmi'}</span>
        </button>
      </div>
    </header>
    {error&&<div className="ers-file-error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
    <div className="ers-explorer-layout">
      <aside className="ers-explorer-sidebar">
        <div className="ers-tree-caption">FAJLOVI PREDMETA</div>
        <button className={'ers-tree-root'+(folder==='root'&&!preview?' selected':'')} onClick={()=>navigate('root')}>▣ &nbsp; {course.code} · Materijali</button>
        {tree('root')}
      </aside>
      <main className={'ers-explorer-main'+(preview?' is-preview':'')}>
        {preview&&viewing ? <div className="ers-file-preview">
          {viewing.kind==='practicum' || viewing.kind==='section' ?
            <div className="ers-continuous-document">
              {viewing.kind==='section'&&<div className="ers-file-info">Vežba {viewing.exercise} · Prikazan je kompletan praktikum, sa navigacijom kroz sadržaj.</div>}
              <PracticumDocument practicum={course.practicum}/>
            </div> :
            viewing.kind==='checkpoints'?<div className="ers-checkpoint-document"><CheckpointsView checkpoints={course.checkpoints}/></div>:
            pdfViewing?<PdfViewer file={viewing.source!} name={viewing.name}/>:
            viewing.kind==='zip'&&viewing.source?<ZipFileViewer file={viewing.source} title={viewing.name}/>:
            <p>Fajl nije dostupan za prikaz.</p>}
        </div> : <div className="ers-directory">
          <div className="ers-directory-heading">
            <div><span className="ers-directory-eyebrow">NASTAVNI MATERIJALI · {course.code}</span><h2>{current?.name??course.name}</h2><p>{current?.description??'Odaberi folder ili fajl da pregledaš sadržaj.'}</p></div>
            <span className="ers-directory-count">{folderItems.length} stavki</span>
          </div>
          <div className="ers-file-list" role="list" aria-label="Sadržaj foldera">
            {folderItems.map(item=><div className="ers-file-row" key={item.id} role="listitem">
              <button className="ers-file-open" onClick={()=>visit(item)} title={'Otvori '+item.name}>
                <EntryIcon kind={item.kind}/>
                <span className="ers-file-row-name"><strong>{item.name}</strong><small>{item.description??(item.kind==='folder'?'Folder':'Dokument')}</small></span>
                <span className="ers-file-meta">{item.kind==='folder'?`${children(item.id).length} stavki`:item.size??(item.kind==='pdf'?'PDF':item.kind==='zip'?'ZIP':'Dokument')}</span>
                <span className="ers-open-chevron">›</span>
              </button>
              <button className="ers-download-mini" onClick={()=>void save(item)} disabled={Boolean(busy)} aria-label={'Preuzmi '+item.name} title={item.kind==='folder'?'Preuzmi folder kao ZIP':'Preuzmi fajl'}>↓</button>
            </div>)}
          </div>
          {folderItems.length===0&&<div className="ers-empty">Ovaj folder je prazan.</div>}
          <p className="ers-directory-footnote">Klikni na folder za otvaranje. Dokumenti i arhive otvaraju se unutar prozora; sve stavke mogu se preuzeti.</p>
        </div>}
      </main>
    </div>
  </div>
}
