import { useEffect, useRef, useState } from 'react'
import { assetUrl } from '../lib/assets'

type PDFPage={getViewport:(args:{scale:number})=>{width:number;height:number};render:(args:{canvasContext:CanvasRenderingContext2D;viewport:{width:number;height:number};canvas?:HTMLCanvasElement})=>{promise:Promise<unknown>;cancel:()=>void}}
type PDFDocument={numPages:number;getPage:(page:number)=>Promise<PDFPage>;destroy:()=>Promise<void>}
type PdfLibrary={getDocument:(url:string)=>{promise:Promise<PDFDocument>;destroy?:()=>void};GlobalWorkerOptions:{workerSrc:string}}
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/'
let loader:Promise<PdfLibrary>|null=null
function library():Promise<PdfLibrary>{
  if(loader)return loader
  const pending=new Promise<PdfLibrary>((resolve,reject)=>{
    const onReady=()=>{
      const lib=(window as Window&{pdfjsLib?:PdfLibrary}).pdfjsLib
      if(!lib){reject(Error('PDF renderer nije dostupan.'));return}
      lib.GlobalWorkerOptions.workerSrc=CDN+'pdf.worker.min.js'
      resolve(lib)
    }
    if((window as Window&{pdfjsLib?:PdfLibrary}).pdfjsLib){onReady();return}
    const script=document.createElement('script')
    script.src=CDN+'pdf.min.js'
    script.async=true
    script.crossOrigin='anonymous'
    script.onload=onReady
    script.onerror=()=>reject(Error('PDF.js se nije učitao. Proveri internet konekciju.'))
    document.head.append(script)
  }).catch((err: unknown): never=>{loader=null;throw err})
  loader=pending
  return pending
}
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(value,max))
const MIN_SCALE=.1
const MAX_SCALE=3
export function PdfViewer({file,name}:{file:string;name:string}){
  const [pdf,setPdf]=useState<PDFDocument|null>(null)
  const [page,setPage]=useState(1)
  const [zoom,setZoom]=useState<number|null>(null)
  const [scale,setScale]=useState(1)
  const [size,setSize]=useState({width:0,height:0})
  const [total,setTotal]=useState(0)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(true)
  const [full,setFull]=useState(false)
  const canvas=useRef<HTMLCanvasElement>(null)
  const host=useRef<HTMLDivElement>(null)
  const scroll=useRef<HTMLDivElement>(null)
  const renderId=useRef(0)
  const url=assetUrl(file)
  useEffect(()=>{
    let cancelled=false
    let document:PDFDocument|null=null
    setPdf(null);setPage(1);setZoom(null);setTotal(0);setBusy(true);setError('')
    void library().then(async lib=>{
      const loaded=await lib.getDocument(url).promise
      if(cancelled){await loaded.destroy();return}
      document=loaded
      setPdf(loaded);setTotal(loaded.numPages);setBusy(false)
    }).catch(err=>{if(!cancelled){setBusy(false);setError(err instanceof Error?err.message:'PDF ne može da se učita.')}})
    return()=>{
      cancelled=true
      renderId.current++
      if(document)void document.destroy()
    }
  },[url])
  useEffect(()=>{
    const element=scroll.current
    if(!element)return
    const measure=()=>{
      const styles=getComputedStyle(element)
      const width=element.clientWidth-parseFloat(styles.paddingLeft)-parseFloat(styles.paddingRight)
      const height=element.clientHeight-parseFloat(styles.paddingTop)-parseFloat(styles.paddingBottom)
      setSize(previous=>previous.width===width&&previous.height===height?previous:{width,height})
    }
    measure()
    const observer=new ResizeObserver(measure)
    observer.observe(element)
    return()=>observer.disconnect()
  },[])
  useEffect(()=>{
    if(!pdf||!canvas.current||size.width<=2||size.height<=2)return
    let canceled=false
    let task:ReturnType<PDFPage['render']>|null=null
    const id=++renderId.current
    void pdf.getPage(page).then(pg=>{
      if(canceled||renderId.current!==id)return
      const natural=pg.getViewport({scale:1})
      const fitted=Math.min((size.width-2)/natural.width,(size.height-2)/natural.height)
      const displayScale=zoom??fitted
      const pixelRatio=Math.min(window.devicePixelRatio||1,2)
      const viewport=pg.getViewport({scale:pixelRatio*displayScale})
      const el=canvas.current,ctx=el?.getContext('2d')
      if(!el||!ctx)return
      setScale(displayScale)
      el.width=Math.floor(viewport.width)
      el.height=Math.floor(viewport.height)
      el.style.width=(viewport.width/pixelRatio)+'px'
      el.style.height=(viewport.height/pixelRatio)+'px'
      if(zoom===null&&scroll.current){scroll.current.scrollTop=0;scroll.current.scrollLeft=0}
      task=pg.render({canvasContext:ctx,viewport,canvas:el})
      return task.promise
    }).catch(err=>{
      if(!canceled && err?.name!=='RenderingCancelledException')setError('Stranica ne može da se prikaže.')
    })
    return()=>{canceled=true;task?.cancel()}
  },[pdf,page,zoom,size])
  useEffect(()=>{
    const changed=()=>setFull(document.fullscreenElement===host.current)
    document.addEventListener('fullscreenchange',changed)
    return()=>document.removeEventListener('fullscreenchange',changed)
  },[])
  return <div className="ftn-pdf" ref={host}>
    <div className="ftn-pdf-toolbar">
      <span className="ftn-pdf-mark" aria-hidden="true">PDF</span>
      <span className="ftn-pdf-title" title={name}>{name}</span>
      <div className="ftn-pdf-paging">
        <button title="Prethodna strana" aria-label="Prethodna strana" onClick={()=>setPage(p=>clamp(p-1,1,total))} disabled={page<=1}>‹</button>
        <span><input aria-label="Trenutna strana" type="number" min="1" max={total||1} value={page} onChange={event=>setPage(clamp(Number(event.target.value)||1,1,total||1))}/> / {total||'—'}</span>
        <button title="Sledeća strana" aria-label="Sledeća strana" onClick={()=>setPage(p=>clamp(p+1,1,total))} disabled={page>=total}>›</button>
      </div>
      <div className="ftn-pdf-zoom">
        <button aria-label="Umanji" onClick={()=>setZoom(clamp(Number((scale-.15).toFixed(2)),MIN_SCALE,MAX_SCALE))} disabled={scale<=MIN_SCALE}>−</button>
        <button title="Uklopi celu stranicu" aria-label="Uklopi celu stranicu" onClick={()=>setZoom(null)}>{Math.round(scale*100)}%</button>
        <button aria-label="Uvećaj" onClick={()=>setZoom(clamp(Number((scale+.15).toFixed(2)),MIN_SCALE,MAX_SCALE))} disabled={scale>=MAX_SCALE}>+</button>
      </div>
      <button className="ftn-pdf-action" onClick={()=>{if(!host.current)return;if(full)void document.exitFullscreen();else void host.current.requestFullscreen()}} aria-label={full?'Izađi iz celog ekrana':'Ceo ekran'} title="Ceo ekran">⛶</button>
      <a className="ftn-pdf-action ftn-pdf-download" href={url} download={name} title="Preuzmi PDF">↓ <span>Preuzmi</span></a>
    </div>
    <div className="ftn-pdf-scroll" aria-label="PDF dokument" ref={scroll}>
      {busy?<div className="ftn-pdf-message">Učitavanje dokumenta…</div>:error?
        <div className="ftn-pdf-message ftn-pdf-error"><strong>{error}</strong><p>PDF možeš preuzeti ili otvoriti u sistemskom prikazu.</p>
          <a href={url} target="_blank" rel="noopener noreferrer">Otvori PDF ↗</a></div>:
        <canvas className="ftn-pdf-canvas" ref={canvas} aria-label={`Strana ${page} od ${total}`}/>}
    </div>
  </div>
}
