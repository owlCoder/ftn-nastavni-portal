import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../lib/assets'
import { codeLanguageForFile, codeLanguageLabel, highlightCode } from '../lib/highlight'
import { CourseBrowserIcon, CourseFileIcon } from './CourseFileIcon'

import {isTextEntry,parseZip,readZipFile,type ZipEntry} from '../lib/archive'
import type {CodeProject} from '../lib/codeProjects'

export function ZipFileViewer({file,title,onOpenEditor}:{file:string;title:string;onOpenEditor?:(project:CodeProject)=>void}){
  const [archive,setArchive]=useState<{buffer:ArrayBuffer;entries:ZipEntry[]}|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [active,setActive]=useState('')
  const [preview,setPreview]=useState('')
  const [previewError,setPreviewError]=useState('')
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set())
  const language=codeLanguageForFile(active)
  const highlighted=useMemo(()=>highlightCode(preview,language),[preview,language])
  useEffect(()=>{
    const controller=new AbortController()
    setArchive(null);setLoading(true);setError('');setActive('');setPreview('')
    fetch(assetUrl(file),{signal:controller.signal}).then(async response=>{
      if(!response.ok)throw Error('Arhiva nije dostupna.')
      const buffer=await response.arrayBuffer()
      if(controller.signal.aborted)return
      const entries=parseZip(buffer)
      setArchive({buffer,entries})
      const root=entries[0]?.name.split('/')[0]
      setExpanded(root?new Set([root]):new Set())
    }).catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:'Greška pri učitavanju.')})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)})
    return()=>controller.abort()
  },[file])
  const select=async(entry:ZipEntry)=>{
    if(entry.isDirectory){setExpanded(previous=>{const next=new Set(previous);if(next.has(entry.name.replace(/\/$/,'')))next.delete(entry.name.replace(/\/$/,''));else next.add(entry.name.replace(/\/$/,''));return next});return}
    setActive(entry.name);setPreview('');setPreviewError('')
    if(!isTextEntry(entry)){
      setPreviewError('Ovaj format nema tekstualni pregled. Preuzmi ZIP arhivu za otvaranje.');return
    }
    if(!archive)return
    try{setPreview(await readZipFile(archive.buffer,entry))}catch(e){setPreviewError(e instanceof Error?e.message:'Fajl ne može da se prikaže.')}
  }
  const files=archive?.entries??[]
  // Display implicit folders too (many ZIP generators omit directory entries).
  const folderSet=new Set<string>()
  files.forEach(entry=>{
    const parts=entry.name.split('/')
    for(let i=1;i<parts.length;i++)folderSet.add(parts.slice(0,i).join('/'))
  })
  const folderNames=[...folderSet].sort((a,b)=>a.localeCompare(b,'sr'))
  type Row={path:string;name:string;depth:number;entry?:ZipEntry;folder:boolean}
  const rows:Row[]=[
    ...folderNames.map(path=>({path,name:path.split('/').pop()??path,depth:path.split('/').length-1,folder:true})),
    ...files.filter(entry=>!entry.isDirectory).map(entry=>({path:entry.name,name:entry.name.split('/').pop()??entry.name,depth:entry.name.split('/').length-1,entry,folder:false})),
  ].sort((a,b)=>a.path.localeCompare(b.path,'sr'))
    .filter(item=>{const parts=item.path.split('/');return parts.slice(0,-1).every((_,i)=>expanded.has(parts.slice(0,i+1).join('/')))})
  return <section className="ers-archive">
    <header className="ers-archive-header">
      <div><span className="ers-archive-overline">ZIP ARHIVA</span><h2>{title}</h2><p>{loading?'Učitavanje…':error||`${files.filter(entry=>!entry.isDirectory).length} fajlova · izvorni kod i dokumentacija`}</p></div>
      {onOpenEditor&&files.some(isTextEntry)&&<button className="ers-download" onClick={()=>onOpenEditor({file,title,initialFile:active||undefined})}>〈/〉 Otvori u editoru</button>}
      <a href={assetUrl(file)} download className="ers-download"><CourseBrowserIcon name="download"/> Preuzmi ZIP</a>
    </header>
    {loading?<div className="ers-empty">Učitavanje arhive…</div>:error?<p role="alert" className="ers-error">{error}</p>:
      <div className="ers-archive-content">
        <div className="ers-archive-tree" aria-label="Sadržaj ZIP arhive">
          {rows.map(row=><button key={row.path} type="button"
            className={'ers-archive-row'+(active===row.path?' active':'')}
            onClick={()=>row.folder?
              setExpanded(old=>{const next=new Set(old);if(next.has(row.path))next.delete(row.path);else next.add(row.path);return next}):
              row.entry&&void select(row.entry)}
            title={row.path} style={{paddingLeft:10+Math.min(row.depth,8)*15}}>
            <span aria-hidden="true" className={row.folder?'ers-archive-folder':'ers-archive-file'}><CourseFileIcon kind={row.folder?'folder':'practicum-link'}/></span>
            <span>{row.name}</span>
          </button>)}
        </div>
        <div className="ers-archive-preview">
          {active?<><div className="ers-archive-filebar"><div className="ers-archive-file-title"><strong>{active.split('/').pop()}</strong><span className="ers-code-language">{codeLanguageLabel(language)}</span></div><small>{active}</small></div>
              {previewError?<p className="ers-archive-notice">{previewError}</p>:<pre><code className="ftn-highlight" dangerouslySetInnerHTML={{__html:highlighted}}/></pre>}</>:
            <div className="ers-archive-placeholder"><CourseFileIcon kind="zip"/><strong>Izaberi fajl</strong><p>Klikni na fajl sa leve strane da pregledaš njegov tekstualni sadržaj.</p></div>}
        </div>
      </div>}
  </section>
}
