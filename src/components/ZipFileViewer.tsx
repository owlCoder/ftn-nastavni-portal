import { useEffect, useMemo, useState } from 'react'
import { assetUrl } from '../lib/assets'

type ZipEntry = { name:string; size:number; compressedSize:number; offset:number; method:number; isDirectory:boolean }
const MAX_ENTRIES=6000
const MAX_FILE_SIZE=2_000_000
const TEXT_EXTENSIONS=/\.(cs|csproj|sln|md|txt|json|xml|yaml|yml|js|jsx|ts|tsx|css|html|htm|sh|ps1|props|targets|config|editorconfig|gitignore|sql|csv|py|java|c|cpp|h|hpp|fs|fsproj|razor|dockerfile|gitkeep)$/i

function parseZip(buffer:ArrayBuffer):ZipEntry[] {
  const dv=new DataView(buffer)
  const decoder=new TextDecoder()
  let end=-1
  for(let i=buffer.byteLength-22;i>=Math.max(0,buffer.byteLength-65557);i--){
    if(dv.getUint32(i,true)===0x06054b50){end=i;break}
  }
  if(end<0)throw Error('Format arhive nije podržan.')
  const count=dv.getUint16(end+10,true),offset=dv.getUint32(end+16,true)
  if(count>MAX_ENTRIES)throw Error('Arhiva sadrži previše fajlova za pregled.')
  const entries:ZipEntry[]=[]
  let position=offset
  for(let i=0;i<count;i++){
    if(position+46>dv.byteLength||dv.getUint32(position,true)!==0x02014b50)throw Error('Arhiva nije ispravna.')
    const method=dv.getUint16(position+10,true)
    const compressedSize=dv.getUint32(position+20,true)
    const size=dv.getUint32(position+24,true)
    const nameSize=dv.getUint16(position+28,true)
    const extra=dv.getUint16(position+30,true)
    const comment=dv.getUint16(position+32,true)
    const localOffset=dv.getUint32(position+42,true)
    if(position+46+nameSize+extra+comment>dv.byteLength)throw Error('Oštećen spisak fajlova.')
    const bytes=new Uint8Array(buffer,position+46,nameSize)
    const name=decoder.decode(bytes).replaceAll('\\','/')
    if(!name.startsWith('/')&&!name.split('/').includes('..')&&!name.includes('\0')){
      entries.push({name,size,compressedSize,offset:localOffset,method,isDirectory:name.endsWith('/')})
    }
    position+=46+nameSize+extra+comment
  }
  return entries.sort((a,b)=>a.name.localeCompare(b.name,'sr'))
}
async function readZipFile(buffer:ArrayBuffer,entry:ZipEntry):Promise<string>{
  if(entry.size>MAX_FILE_SIZE)throw Error('Fajl je prevelik za pregled. Preuzmi ZIP arhivu.')
  const dv=new DataView(buffer)
  if(entry.offset+30>dv.byteLength||dv.getUint32(entry.offset,true)!==0x04034b50)throw Error('Neispravan zapis u arhivi.')
  const nameLength=dv.getUint16(entry.offset+26,true)
  const extraLength=dv.getUint16(entry.offset+28,true)
  const begin=entry.offset+30+nameLength+extraLength
  if(begin+entry.compressedSize>buffer.byteLength)throw Error('Oštećen sadržaj fajla.')
  const bytes=new Uint8Array(buffer,begin,entry.compressedSize)
  let decoded:Uint8Array
  if(entry.method===0)decoded=bytes
  else if(entry.method===8 && typeof DecompressionStream!=='undefined'){
    const stream=new Blob([new Uint8Array(bytes).buffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    decoded=new Uint8Array(await new Response(stream).arrayBuffer())
  }else throw Error('Kompresija ovog fajla nije podržana u pregledu. Preuzmi arhivu.')
  return new TextDecoder('utf-8',{fatal:false}).decode(decoded)
}
const icon=(kind:'file'|'folder'|'zip')=>kind==='folder'?'▸':kind==='zip'?'▤':'≡'

export function ZipFileViewer({file,title}:{file:string;title:string}){
  const [archive,setArchive]=useState<{buffer:ArrayBuffer;entries:ZipEntry[]}|null>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [active,setActive]=useState('')
  const [preview,setPreview]=useState('')
  const [previewError,setPreviewError]=useState('')
  const [expanded,setExpanded]=useState<Set<string>>(()=>new Set())
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
    if(!TEXT_EXTENSIONS.test(entry.name) && !/\/Dockerfile$|\/Makefile$|\/LICENSE$/i.test(entry.name)){
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
      <a href={assetUrl(file)} download className="ers-download">↓ Preuzmi ZIP</a>
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
            <span aria-hidden="true" className={row.folder?'ers-archive-folder':'ers-archive-file'}>{row.folder?(expanded.has(row.path)?'▾':'▸'):icon('file')}</span>
            <span>{row.name}</span>
          </button>)}
        </div>
        <div className="ers-archive-preview">
          {active?<><div className="ers-archive-filebar"><strong>{active.split('/').pop()}</strong><small>{active}</small></div>
              {previewError?<p className="ers-archive-notice">{previewError}</p>:<pre><code>{preview}</code></pre>}</>:
            <div className="ers-archive-placeholder"><span>⌘</span><strong>Izaberi fajl</strong><p>Klikni na fajl sa leve strane da pregledaš njegov tekstualni sadržaj.</p></div>}
        </div>
      </div>}
  </section>
}
