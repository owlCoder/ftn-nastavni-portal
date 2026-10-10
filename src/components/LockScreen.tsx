import { useEffect, useRef, useState } from 'react'

const photoCredits=[
  {photographer:'Tobias Keller',url:'https://unsplash.com/photos/73F4pKoUkM0',image:'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?auto=format&fit=crop&w=1800&q=82'},
  {photographer:'Patrick Untersee',url:'https://unsplash.com/photos/j3f1lwXBuAI',image:'https://images.unsplash.com/photo-1773176647951-d8f618dee942?auto=format&fit=crop&w=1800&q=82'},
]
export function AuthBackdrop({soft=false}:{soft?:boolean}){
  return <div className={'ftn-auth-background'+(soft?' is-soft':'')} aria-hidden="true">
    {photoCredits.map((photo,index)=><div key={photo.image} className={'ftn-auth-photo ftn-auth-photo-'+index}
      style={{backgroundImage:'linear-gradient(165deg,rgba(8,20,36,.08),rgba(6,12,26,.36)),url("'+photo.image+'")'}}/>)}
    <div className="ftn-auth-shade"/>
  </div>
}
export function LockScreen({onUnlock}:{onUnlock:()=>void}){
  const [now,setNow]=useState(()=>new Date())
  const start=useRef<number|null>(null)
  useEffect(()=>{
    document.title='Zaključano · FTN OS'
    const timer=window.setInterval(()=>setNow(new Date()),1000)
    return()=>window.clearInterval(timer)
  },[])
  useEffect(()=>{
    const unlock=(event:KeyboardEvent)=>{
      if(event.key==='Enter'||event.key===' '||event.key==='ArrowUp'){event.preventDefault();onUnlock()}
    }
    window.addEventListener('keydown',unlock)
    return()=>window.removeEventListener('keydown',unlock)
  },[onUnlock])
  const clock=new Intl.DateTimeFormat('sr-RS',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Belgrade'}).format(now)
  const date=new Intl.DateTimeFormat('sr-RS',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Belgrade'}).format(now)
  return <main className="ftn-lockscreen" onPointerDown={e=>{start.current=e.clientY}} onPointerUp={e=>{
      const dy=start.current===null?0:e.clientY-start.current
      start.current=null
      if(dy< -45)onUnlock()
    }}>
    <AuthBackdrop/>
    <div className="ftn-lock-bar"><span className="ftn-lock-brand"><span className="ftn-lock-mark">◈</span> FTN OS</span><span>Radna površina studenta</span></div>
    <div className="ftn-lock-content">
      <time className="ftn-lock-time" dateTime={now.toISOString()}>{clock}</time>
      <div className="ftn-lock-date">{date}</div>
    </div>
    <button className="ftn-lock-unlock" onClick={onUnlock} aria-label="Otključaj i prijavi se">
      <span className="ftn-lock-swipe" aria-hidden="true">⌃</span>
      <span>Klikni, prevuci nagore ili pritisni Enter</span>
    </button>
    <div className="ftn-lock-credit">Fotografije: <a href={photoCredits[0].url} target="_blank" rel="noreferrer">{photoCredits[0].photographer}</a> i <a href={photoCredits[1].url} target="_blank" rel="noreferrer">{photoCredits[1].photographer}</a> / Unsplash</div>
  </main>
}
