import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

const STORAGE_KEY='ftn-desktop-layout-v1'
export const DEFAULT_SHORTCUTS=['ers','oib','odp','readme','settings','trash']
export const DEFAULT_DOCK=['files','notes','calendar','calculator','settings','trash']
export type Shortcut={id:string;slot:number}
type Persisted={shortcuts:Shortcut[];pins:string[]}
const SLOT_LIMIT=120

function loadConfiguration(allowed:string[]):Persisted {
  let parsed:Partial<Persisted>|null=null
  try{parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)??'null') as Partial<Persisted>|null}catch{/* unavailable */}
  const isAllowed=(id:string)=>allowed.includes(id)
  const used=new Set<number>()
  const shortcuts:Shortcut[]=[]
  const requested=Array.isArray(parsed?.shortcuts)?parsed.shortcuts.filter((x):x is Shortcut=>typeof x?.id==='string'&&isAllowed(x.id)&&Number.isInteger(x.slot)):[]
  const initial=parsed&&Array.isArray(parsed.shortcuts)?requested:DEFAULT_SHORTCUTS.filter(isAllowed).map(id=>({id,slot:DEFAULT_SHORTCUTS.indexOf(id)}))
  const raw=[...['ers','oib','odp'].filter(isAllowed).map(id=>initial.find(x=>x.id===id)??{id,slot:DEFAULT_SHORTCUTS.indexOf(id)}),
    ...initial.filter(x=>!['ers','oib','odp'].includes(x.id))]
  for(const item of raw){
    if(shortcuts.some(x=>x.id===item.id))continue
    let slot=item.slot
    if(slot<0||slot>=SLOT_LIMIT||used.has(slot)){slot=0;while(used.has(slot))slot++}
    used.add(slot);shortcuts.push({id:item.id,slot})
  }
  const pins=Array.isArray(parsed?.pins)?parsed.pins.filter((x):x is string=>typeof x==='string'&&isAllowed(x)&&!['ers','oib','odp'].includes(x)):[]
  return {shortcuts,pins:parsed?.pins?Array.from(new Set(pins)):DEFAULT_DOCK.filter(isAllowed)}
}
export function useDesktopConfiguration(allowed:string[]) {
  const [config,setConfig]=useState<Persisted>(()=>loadConfiguration(allowed))
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(config))}catch{/* private mode */}},[config])
  const shortcutIds=useMemo(()=>config.shortcuts.map(x=>x.id),[config.shortcuts])
  const hasShortcut=(id:string)=>shortcutIds.includes(id)
  const addShortcut=(id:string)=>{
    if(!allowed.includes(id))return
    setConfig(old=>{
      if(old.shortcuts.some(x=>x.id===id))return old
      const occupied=new Set(old.shortcuts.map(x=>x.slot))
      let slot=0;while(occupied.has(slot)&&slot<SLOT_LIMIT)slot++
      if(slot>=SLOT_LIMIT)return old
      return {...old,shortcuts:[...old.shortcuts,{id,slot}]}
    })
  }
  const removeShortcut=(id:string)=>{
    if(['ers','oib','odp'].includes(id))return
    setConfig(old=>({...old,shortcuts:old.shortcuts.filter(x=>x.id!==id)}))
  }
  const moveShortcut=(id:string,target:number)=>{
    if(target<0||target>=SLOT_LIMIT)return
    setConfig(old=>{
      const moved=old.shortcuts.find(x=>x.id===id)
      if(!moved||moved.slot===target)return old
      const occupied=old.shortcuts.find(x=>x.slot===target)
      return {...old,shortcuts:old.shortcuts.map(x=>x.id===id?{...x,slot:target}:occupied&&x.id===occupied.id?{...x,slot:moved.slot}:x)}
    })
  }
  const pin=(id:string)=>{
    if(!allowed.includes(id)||['ers','oib','odp'].includes(id))return
    setConfig(old=>old.pins.includes(id)?old:{...old,pins:[...old.pins,id]})
  }
  const unpin=(id:string)=>setConfig(old=>({...old,pins:old.pins.filter(x=>x!==id)}))
  return {...config,hasShortcut,addShortcut,removeShortcut,moveShortcut,pin,unpin}
}

type GridProps={
  shortcuts:Shortcut[]
  label:(id:string)=>string
  icon:(id:string)=>ReactNode
  open:(id:string)=>void
  selected:string|null
  onSelect:(id:string)=>void
  onMove:(id:string,slot:number)=>void
  onContextMenu:(id:string,x:number,y:number)=>void
}
type DragState={id:string;pointerId:number;startX:number;startY:number;moved:boolean}
export function DesktopShortcutGrid({shortcuts,label,icon,open,selected,onSelect,onMove,onContextMenu}:GridProps){
  const container=useRef<HTMLDivElement>(null)
  const dragging=useRef<DragState|null>(null)
  const blockedClick=useRef<string|null>(null)
  const [target,setTarget]=useState<number|null>(null)
  const [dragged,setDragged]=useState<string|null>(null)
  const [columns,setColumns]=useState(4)
  useEffect(()=>{
    if(!container.current)return
    const observer=new ResizeObserver(entries=>{
      const width=entries[0]?.contentRect.width??620
      setColumns(width>=540?5:width>=430?4:width>=320?3:Math.max(1,Math.floor(width/94)))
    })
    observer.observe(container.current)
    return()=>observer.disconnect()
  },[])
  const targetSlot=(x:number,y:number)=>{
    const bounds=container.current?.getBoundingClientRect()
    if(!bounds)return null
    if(x<bounds.left-20||x>bounds.right+20||y<bounds.top-20||y>bounds.bottom+20)return null
    const w=bounds.width/columns
    const col=Math.max(0,Math.min(columns-1,Math.floor((x-bounds.left)/w)))
    const row=Math.max(0,Math.floor((y-bounds.top)/119))
    return Math.min(SLOT_LIMIT-1,row*columns+col)
  }
  const pointerDown=(id:string,event:ReactPointerEvent<HTMLButtonElement>)=>{
    if(event.button!==0)return
    dragging.current={id,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,moved:false}
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const pointerMove=(id:string,event:ReactPointerEvent<HTMLButtonElement>)=>{
    const drag=dragging.current
    if(!drag||drag.id!==id||drag.pointerId!==event.pointerId)return
    if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>7){
      drag.moved=true;setDragged(id)
    }
    if(drag.moved)setTarget(targetSlot(event.clientX,event.clientY))
  }
  const pointerEnd=(id:string,event:ReactPointerEvent<HTMLButtonElement>)=>{
    const drag=dragging.current
    if(!drag||drag.id!==id||drag.pointerId!==event.pointerId)return
    if(drag.moved){
      const slot=targetSlot(event.clientX,event.clientY)
      if(slot!==null)onMove(id,slot)
      blockedClick.current=id
    }
    if(!drag.moved&&event.pointerType==='touch')open(id)
    dragging.current=null
    setTarget(null);setDragged(null)
  }
  const rows=Math.max(5,Math.ceil((Math.max(0,...shortcuts.map(x=>x.slot))+columns)/columns))
  return <div ref={container} className="ftn-desktop-grid" style={{'--ftn-columns':columns,'--ftn-rows':rows} as CSSProperties} aria-label="Prečice na radnoj površini">
    {target!==null&&dragged&&<span className="ftn-desktop-drop-preview" style={{gridColumn:target%columns+1,gridRow:Math.floor(target/columns)+1}}/>}
    {shortcuts.map(({id,slot})=><button key={id} type="button" className={'gn-desktop-item ftn-desktop-shortcut'+(selected===id?' gn-item-selected':'')+(dragged===id?' ftn-is-dragging':'')}
      style={{gridColumn:slot%columns+1,gridRow:Math.floor(slot/columns)+1,touchAction:'none'}}
      aria-label={label(id)+', dvoklik za otvaranje, prevuci za pomeranje'}
      title={label(id)}
      onPointerDown={e=>pointerDown(id,e)}
      onPointerMove={e=>pointerMove(id,e)}
      onPointerUp={e=>pointerEnd(id,e)}
      onPointerCancel={e=>pointerEnd(id,e)}
      onClick={e=>{e.stopPropagation();if(blockedClick.current===id){blockedClick.current=null;return}onSelect(id);if(e.detail>=2)open(id)}}
      onContextMenu={e=>{e.preventDefault();e.stopPropagation();onContextMenu(id,e.clientX,e.clientY)}}
      onKeyDown={e=>{
        if(e.key==='Enter'){e.preventDefault();open(id)}
        if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){
          e.preventDefault()
          const rect=e.currentTarget.getBoundingClientRect()
          onContextMenu(id,rect.right-12,rect.top+24)
        }
      }}>
      {icon(id)}<span>{label(id)}</span>
    </button>)}
    {selected&&shortcuts.some(x=>x.id===selected)&&(()=>{
      const slot=shortcuts.find(x=>x.id===selected)?.slot??0
      return <button type="button" className="ftn-shortcut-actions" aria-label={'Opcije za '+label(selected)}
        title="Opcije prečice" style={{gridColumn:slot%columns+1,gridRow:Math.floor(slot/columns)+1}}
        onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.preventDefault();e.stopPropagation();const rect=e.currentTarget.getBoundingClientRect();onContextMenu(selected,rect.right-8,rect.top+30)}}>
        ···
      </button>
    })()}
  </div>
}
