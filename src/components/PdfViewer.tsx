import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { assetUrl } from '../lib/assets'

type PDFPage={getViewport:(args:{scale:number})=>{width:number;height:number};render:(args:{canvasContext:CanvasRenderingContext2D;viewport:{width:number;height:number};transform?:number[];canvas?:HTMLCanvasElement})=>{promise:Promise<unknown>;cancel:()=>void}}
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
const MAX_CANVAS_PIXELS=16_000_000
function PdfLoading(){
  return <div className="ftn-pdf-loading" role="status" aria-label="Učitavanje dokumenta">
    <div className="ftn-pdf-loading-art" aria-hidden="true">
      <span className="ftn-pdf-loading-ring"/>
      <svg viewBox="0 0 40 48" fill="none"><path d="M7 2h18l9 9v33H7z" fill="white" stroke="currentColor" strokeWidth="1.5"/><path d="M25 2v10h9M13 21h15M13 27h15M13 33h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </div>
    <span className="ftn-pdf-loading-dots" aria-hidden="true"><i/><i/><i/></span>
  </div>
}
export function PdfViewer({file,name}:{file:string;name:string}){
  const [pdf,setPdf]=useState<PDFDocument|null>(null)
  const [page,setPage]=useState(1)
  const [zoom,setZoom]=useState<number|null>(null)
  const [scale,setScale]=useState(1)
  const [size,setSize]=useState({width:0,height:0})
  const [total,setTotal]=useState(0)
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(true)
  const [rendering,setRendering]=useState(true)
  const [full,setFull]=useState(false)
  const [pixelRatio,setPixelRatio]=useState(()=>window.devicePixelRatio||1)
  const canvas=useRef<HTMLCanvasElement>(null)
  const host=useRef<HTMLDivElement>(null)
  const scroll=useRef<HTMLDivElement>(null)
  const renderId=useRef(0)
  const url=assetUrl(file)
  useEffect(()=>{
    let cancelled=false
    let document:PDFDocument|null=null
    setPdf(null);setPage(1);setZoom(null);setTotal(0);setBusy(true);setRendering(true);setError('')
    void library().then(async lib=>{
      const loaded=await lib.getDocument(url).promise
      if(cancelled){await loaded.destroy();return}
      document=loaded
      setPdf(loaded);setTotal(loaded.numPages);setBusy(false)
    }).catch(err=>{if(!cancelled){setBusy(false);setRendering(false);setError(err instanceof Error?err.message:'PDF ne može da se učita.')}})
    return()=>{
      cancelled=true
      renderId.current++
      if(document)void document.destroy()
    }
  },[url])
  useEffect(()=>{
    let resolution:MediaQueryList
    const changed=()=>{
      setPixelRatio(window.devicePixelRatio||1)
      resolution?.removeEventListener('change',changed)
      resolution=window.matchMedia(`(resolution: ${window.devicePixelRatio||1}dppx)`)
      resolution.addEventListener('change',changed)
    }
    changed()
    window.addEventListener('resize',changed)
    return()=>{resolution.removeEventListener('change',changed);window.removeEventListener('resize',changed)}
  },[])
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
    setRendering(true);setError('')
    void pdf.getPage(page).then(pg=>{
      if(canceled||renderId.current!==id)return
      const natural=pg.getViewport({scale:1})
      const fitted=Math.min((size.width-2)/natural.width,(size.height-2)/natural.height)
      const displayScale=zoom??fitted
      const viewport=pg.getViewport({scale:displayScale})
      // Supersample text and diagrams without enlarging the displayed page.
      const outputScale=Math.min(Math.max(2,pixelRatio*1.5),Math.sqrt(MAX_CANVAS_PIXELS/(viewport.width*viewport.height)))
      const el=canvas.current,ctx=el?.getContext('2d')
      if(!el||!ctx)return
      setScale(displayScale)
      el.width=Math.ceil(viewport.width*outputScale)
      el.height=Math.ceil(viewport.height*outputScale)
      el.style.width=viewport.width+'px'
      el.style.height=viewport.height+'px'
      if(zoom===null&&scroll.current){scroll.current.scrollTop=0;scroll.current.scrollLeft=0}
      task=pg.render({canvasContext:ctx,viewport,transform:[outputScale,0,0,outputScale,0,0],canvas:el})
      return task.promise
    }).then(()=>{
      if(!canceled&&renderId.current===id)setRendering(false)
    }).catch(err=>{
      if(!canceled&&renderId.current===id&&err?.name!=='RenderingCancelledException'){
        setRendering(false);setError('Stranica ne može da se prikaže.')
      }
    })
    return()=>{canceled=true;task?.cancel()}
  },[pdf,page,zoom,size,pixelRatio,full])
  useEffect(()=>{
    if(pdf)scroll.current?.focus({preventScroll:true})
  },[pdf])
  useEffect(()=>{
    if(scroll.current){scroll.current.scrollTop=0;scroll.current.scrollLeft=0}
  },[page])
  useEffect(()=>{
    const element=scroll.current
    if(!element||!pdf)return
    let last=0,delta=0,consumed=false
    const wheel=(event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return
      const now=performance.now()
      if(now-last>180){delta=0;consumed=false}
      last=now
      const forward=event.deltaY>0
      const atEdge=forward?element.scrollTop+element.clientHeight>=element.scrollHeight-2:element.scrollTop<=2
      // Enlarged pages can be panned before continuing to the next page.
      if(!atEdge){delta=0;consumed=true;return}
      event.preventDefault()
      if(consumed)return
      delta+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?element.clientHeight:1)
      if(Math.abs(delta)<32)return
      consumed=true
      setPage(current=>clamp(current+(delta>0?1:-1),1,total))
    }
    element.addEventListener('wheel',wheel,{passive:false})
    return()=>element.removeEventListener('wheel',wheel)
  },[pdf,total])
  const keyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(!pdf||event.altKey||event.ctrlKey||event.metaKey||
      (event.target instanceof Element&&event.target.closest('input,textarea,select,button,a,[contenteditable="true"]')))return
    const direction=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:event.code==='Space'?(event.shiftKey?-1:1):0
    if(!direction)return
    event.preventDefault()
    setPage(current=>clamp(current+direction,1,total))
  }
  useEffect(()=>{
    const changed=()=>{
      setFull(document.fullscreenElement===host.current)
      if(host.current&&(document.fullscreenElement?.contains(host.current)||host.current.contains(document.activeElement)))
        scroll.current?.focus({preventScroll:true})
    }
    document.addEventListener('fullscreenchange',changed)
    return()=>document.removeEventListener('fullscreenchange',changed)
  },[])
  return <div className="ftn-pdf" ref={host} onKeyDown={keyDown}>
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
    <div className="ftn-pdf-scroll" aria-label="PDF dokument" aria-keyshortcuts="ArrowLeft ArrowRight Space" aria-busy={busy||rendering} tabIndex={0} ref={scroll}
      onPointerDown={event=>{if(!(event.target instanceof Element&&event.target.closest('a')))scroll.current?.focus({preventScroll:true})}}>
      {!error&&(busy||rendering)&&<PdfLoading/>}
      {error&&
        <div className="ftn-pdf-message ftn-pdf-error"><strong>{error}</strong><p>PDF možeš preuzeti ili otvoriti u sistemskom prikazu.</p>
          <a href={url} target="_blank" rel="noopener noreferrer">Otvori PDF ↗</a></div>}
      <canvas className="ftn-pdf-canvas" ref={canvas} hidden={!pdf||Boolean(error)} aria-label={`Strana ${page} od ${total}`}/>
    </div>
  </div>
}
