import { useEffect, useMemo, useState } from 'react'
import type { Course } from '../courses/types'
import { PdfViewer } from './PdfViewer'
import { assetUrl } from '../lib/assets'
import { PracticumDocument } from './document/PracticumDocument'
import { CheckpointsView } from './CheckpointsView'
import { ZipFileViewer } from './ZipFileViewer'
import { CourseBrowserIcon, CourseFileIcon } from './CourseFileIcon'
import { downloadFolderZip, downloadText } from './courseDownloads'
import { buildCourseFiles, courseFileContent, courseFolderEntries, practicumExerciseHref, safeFileName, type CourseFile as Item, type CourseFileKind as FileKind } from './courseFileTree'

function itemCount(count:number){
  const last=count%10,ending=count%100
  const word=last===1&&ending!==11?'stavka':last>=2&&last<=4&&(ending<12||ending>14)?'stavke':'stavki'
  return count+' '+word
}

function PresentationBadge({item}:{item:Item}){
  if(item.presentationNumber===undefined)return null
  const intro=Number(item.presentationNumber)===0
  return <span className={'ers-presentation-badge'+(intro?' is-intro':'')} aria-label={intro?'Uvodna prezentacija':'Prezentacija '+Number(item.presentationNumber)}>{intro?'Uvod':item.presentationNumber}</span>
}
type Preview={kind:FileKind;item:Item}

export function CourseFiles({course}:{course:Course}){
  const files=useMemo(()=>buildCourseFiles(course),[course])
  const lookup=useMemo(()=>new Map(files.map(item=>[item.id,item])),[files])
  const children=(id:string)=>files.filter(item=>item.parent===id)
  const [folder,setFolder]=useState('root')
  const [preview,setPreview]=useState<Preview|null>(null)
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set(['root']))
  const [busy,setBusy]=useState('')
  const [error,setError]=useState('')
  const [view,setView]=useState<'list'|'grid'>(()=>{
    try{return localStorage.getItem('ftn-course-view')==='grid'?'grid':'list'}catch{return 'list'}
  })
  useEffect(()=>{try{localStorage.setItem('ftn-course-view',view)}catch{/* storage unavailable */}},[view])
  useEffect(()=>{
    const openFromHash=()=>{
      const match=location.hash.match(new RegExp('^#'+course.id+'/praktikum/(\\d+)$'))
      if(!match)return
      const item=files.find(file=>file.kind==='practicum-link'&&file.exercise===Number(match[1]))
      if(!item)return
      setFolder(item.parent);setPreview({kind:item.kind,item})
      setExpanded(old=>new Set([...old,'vezbe',item.parent]))
    }
    openFromHash()
    window.addEventListener('hashchange',openFromHash)
    return()=>window.removeEventListener('hashchange',openFromHash)
  },[course.id,files])
  const current=lookup.get(folder)
  const folderItems=children(folder)
  const metadata=(item:Item)=>{
    if(item.kind==='folder'){
      const entries=children(item.id).filter(child=>!child.bundle)
      if(item.id==='vezbe')return entries.length+' vežbi'
      if(entries.length&&entries.every(child=>child.kind==='pdf'))return entries.length+' PDF'
      if(entries.length&&entries.every(child=>child.kind==='zip'))return entries.length+' ZIP'
      return itemCount(entries.length)
    }
    return item.kind==='practicum-link'?'Prečica':item.kind==='pdf'?item.pages+' str. · '+item.size:item.size??(item.kind==='zip'?'ZIP':'Dokument')
  }
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
    history.replaceState(null,'',item.kind==='practicum-link'&&item.exercise?practicumExerciseHref(course,item.exercise):'#'+course.id)
    if(item.kind==='folder'){
      setFolder(item.id);setPreview(null)
      setExpanded(old=>new Set(old).add(item.id))
    }else{
      setFolder(item.parent);setPreview({kind:item.kind,item})
      setExpanded(old=>new Set(old).add(item.parent))
    }
  }
  const navigate=(id:string)=>{history.replaceState(null,'','#'+course.id);setPreview(null);setFolder(id);setError('')}
  const back=()=>preview?navigate(folder):navigate(current?.parent??'root')
  const save=async(item?:Item)=>{
    if(busy)return
    setError('')
    if(item && item.kind!=='folder'){
      const file=courseFileContent(item,course)
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
    const filename=target==='root'?course.code+'-Materijali':safeFileName(item?.name??current?.name??'Materijali')
    try{
      setBusy('Priprema foldera…')
      await downloadFolderZip(filename,courseFolderEntries(course,target,files),setBusy)
    }catch(e){setError(e instanceof Error?e.message:'Preuzimanje foldera nije uspelo.')}
    finally{setBusy('')}
  }
  const toggle=(id:string)=>setExpanded(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else next.add(id);return next})
  const tree=(parentId:string,depth=0):React.ReactNode=>children(parentId).map(item=>{
    const hasChildren=item.kind==='folder'
    const shown=expanded.has(item.id)
    return <div key={item.id}>
      <div className={'ers-tree-row'+(folder===item.id?' selected':'')+(preview?.item.id===item.id?' selected':'')} style={{paddingLeft:8+depth*13}}>
        {hasChildren?<button type="button" className="ers-tree-arrow" aria-label={(shown?'Sažmi ':'Proširi ')+item.name} aria-expanded={shown} onClick={()=>toggle(item.id)}>{shown?'▾':'▸'}</button>:<span className="ers-tree-spacer"/>}
        <button className="ers-tree-select" title={item.name} onClick={()=>visit(item)}><CourseFileIcon kind={item.kind}/><span className="ers-tree-name">{item.name}</span><PresentationBadge item={item}/></button>
      </div>
      {hasChildren && shown&&depth<5&&tree(item.id,depth+1)}
    </div>
  })
  const viewing=preview?.item
  const pdfViewing=viewing?.kind==='pdf' && viewing.source
  return <div className="ers-explorer">
    <header className="ers-explorer-toolbar">
      <div className="ers-files-navigation">
        <button className="ers-nav-button" title="Nazad" aria-label="Nazad" onClick={back} disabled={folder==='root'&&!preview}><CourseBrowserIcon name="back"/></button>
        <button className="ers-nav-button" title="Početni folder" aria-label="Početni folder" onClick={()=>navigate('root')}><CourseBrowserIcon name="home"/></button>
      </div>
      <nav className="ers-breadcrumb" aria-label="Putanja">
        {breadcrumb.map(item=><button key={item.id} onClick={()=>navigate(item.id)}>{item.name}</button>)}
        {viewing&&<><span>›</span><strong>{viewing.name}</strong></>}
      </nav>
      <div className="ers-toolbar-actions">
        {!preview&&<div className="ers-view-switch" role="group" aria-label="Prikaz materijala">
          <button aria-label="Prikaz liste" title="Lista" aria-pressed={view==='list'} onClick={()=>setView('list')}><CourseBrowserIcon name="list"/></button>
          <button aria-label="Prikaz mreže" title="Mreža" aria-pressed={view==='grid'} onClick={()=>setView('grid')}><CourseBrowserIcon name="grid"/></button>
        </div>}
        <button className="ers-download" onClick={()=>void save(viewing??current??undefined)} disabled={Boolean(busy)}
          title={viewing?'Preuzmi ovaj fajl':'Preuzmi folder kao ZIP'}>
          <CourseBrowserIcon name="download"/> <span>{busy||'Preuzmi'}</span>
        </button>
      </div>
    </header>
    {error&&<div className="ers-file-error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
    <div className="ers-explorer-layout">
      <aside className="ers-explorer-sidebar">
        <div className="ers-tree-caption">FAJLOVI PREDMETA</div>
        <button className={'ers-tree-root'+(folder==='root'&&!preview?' selected':'')} title={course.code+' · Materijali'} onClick={()=>navigate('root')}><CourseFileIcon kind="folder"/><span>{course.code} · Materijali</span></button>
        {tree('root')}
      </aside>
      <main className={'ers-explorer-main'+(preview?' is-preview':'')}>
        {preview&&viewing ? <div className="ers-file-preview">
          {viewing.kind==='practicum' || viewing.kind==='practicum-link' ?
            <div className="ers-continuous-document">
              <PracticumDocument key={viewing.id} practicum={course.practicum} initialSection={viewing.anchor}/>
            </div> :
            viewing.kind==='checkpoints'?<div className="ers-checkpoint-document"><CheckpointsView checkpoints={course.checkpoints}/></div>:
            pdfViewing?<PdfViewer file={viewing.source!} name={viewing.name}/>:
            viewing.kind==='zip'&&viewing.source?<ZipFileViewer file={viewing.source} title={viewing.name}/>:
            <p>Fajl nije dostupan za prikaz.</p>}
        </div> : <div className="ers-directory">
          <div className="ers-directory-heading">
            <div className="ers-directory-title"><CourseFileIcon kind="folder"/><div><span className="ers-directory-eyebrow">NASTAVNI MATERIJALI · {course.code}</span><h2>{current?.name??course.name}</h2><p>{current?.description??course.blurb}</p></div></div>
            <span className="ers-directory-count">{itemCount(folderItems.length)}</span>
          </div>
          <div className={'ers-file-list ers-view-'+view} role="list" aria-label="Sadržaj foldera">
            {folderItems.map(item=>{
              const OpenEntry=item.kind==='practicum-link'?'a':'button'
              return <div className="ers-file-row" key={item.id} role="listitem">
              <OpenEntry className="ers-file-open" href={item.exercise?practicumExerciseHref(course,item.exercise):undefined}
                onClick={event=>{event.preventDefault();visit(item)}} title={'Otvori '+item.name}>
                <CourseFileIcon kind={item.kind}/>
                <span className="ers-file-row-name"><span className="ers-file-name-line"><PresentationBadge item={item}/><strong>{item.name}</strong></span><small>{item.description??(item.kind==='folder'?'Folder':'Dokument')}</small></span>
                <span className="ers-file-meta">{metadata(item)}</span>
                <span className="ers-open-chevron"><CourseBrowserIcon name="chevron"/></span>
              </OpenEntry>
              <button className="ers-download-mini" onClick={()=>void save(item)} disabled={Boolean(busy)} aria-label={'Preuzmi '+item.name} title={item.kind==='folder'?'Preuzmi folder kao ZIP':'Preuzmi fajl'}><CourseBrowserIcon name="download"/></button>
            </div>})}
          </div>
          {folderItems.length===0&&<div className="ers-empty">Ovaj folder je prazan.</div>}
          <p className="ers-directory-footnote">Klikni na folder za otvaranje. Dokumenti i arhive otvaraju se unutar prozora; sve stavke mogu se preuzeti.</p>
        </div>}
      </main>
    </div>
  </div>
}
