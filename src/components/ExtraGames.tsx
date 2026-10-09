import { useCallback, useEffect, useRef, useState } from 'react'

type Point={x:number;y:number}
type Direction='up'|'down'|'left'|'right'
type SnakeState={body:Point[];food:Point;direction:Direction;score:number;over:boolean;paused:boolean}
const WIDTH=20, HEIGHT=17
const same=(a:Point,b:Point)=>a.x===b.x&&a.y===b.y
const freshSnake=():SnakeState=>({body:[{x:8,y:8},{x:7,y:8},{x:6,y:8}],food:{x:14,y:8},direction:'right',score:0,over:false,paused:false})
function newFood(body:Point[]):Point {
  const empty:Point[]=[]
  for(let y=0;y<HEIGHT;y++)for(let x=0;x<WIDTH;x++)if(!body.some(p=>p.x===x&&p.y===y))empty.push({x,y})
  return empty[Math.floor(Math.random()*empty.length)]??{x:0,y:0}
}
const directionMap:Record<Direction,Point>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}
const opposite:Record<Direction,Direction>={up:'down',down:'up',left:'right',right:'left'}
function tickSnake(previous:SnakeState,nextDirection:Direction):SnakeState {
  if(previous.paused||previous.over)return previous
  const dir=nextDirection===opposite[previous.direction]?previous.direction:nextDirection
  const d=directionMap[dir],head=previous.body[0]
  const nextHead={x:head.x+d.x,y:head.y+d.y}
  const eating=same(nextHead,previous.food)
  const bodyToCheck=eating?previous.body:previous.body.slice(0,-1)
  if(nextHead.x<0||nextHead.y<0||nextHead.x>=WIDTH||nextHead.y>=HEIGHT||bodyToCheck.some(p=>same(p,nextHead))){
    return {...previous,over:true,direction:dir}
  }
  const body=[nextHead,...previous.body]
  if(!eating)body.pop()
  return {...previous,body,direction:dir,food:eating?newFood(body):previous.food,score:previous.score+(eating?10:0),over:body.length===WIDTH*HEIGHT}
}
function readBest(key:string):number{try{return Number(localStorage.getItem(key))||0}catch{return 0}}
function saveBest(key:string,value:number){try{localStorage.setItem(key,String(value))}catch{/* storage unavailable */}}
function ControlHint({ keys, action }: { keys:string;action:string }) {
  return <span className="arcade-hint"><kbd>{keys}</kbd><span>{action}</span></span>
}
export function Snake({active}:{active:boolean}) {
  const [game,setGame]=useState<SnakeState>(freshSnake)
  const directionRef=useRef<Direction>('right')
  const [best,setBest]=useState(()=>readBest('ftn-os-best-snake'))
  const move=useCallback((dir:Direction)=>{directionRef.current=dir},[])
  useEffect(()=>{
    if(!active||game.paused||game.over)return
    const timer=window.setInterval(()=>setGame(previous=>tickSnake(previous,directionRef.current)),Math.max(78,157-Math.floor(game.score/40)*8))
    return()=>window.clearInterval(timer)
  },[active,game.paused,game.over,game.score])
  useEffect(()=>{
    if(game.score>best){setBest(game.score);saveBest('ftn-os-best-snake',game.score)}
  },[game.score,best])
  const restart=useCallback(()=>{directionRef.current='right';setGame(freshSnake())},[])
  useEffect(()=>{
    if(!active)return
    const handler=(event:KeyboardEvent)=>{
      const directions:Record<string,Direction>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'}
      if(directions[event.key]){event.preventDefault();move(directions[event.key])}
      if(event.key.toLowerCase()==='p'){event.preventDefault();setGame(v=>({...v,paused:!v.paused}))}
      if(event.key.toLowerCase()==='r'){event.preventDefault();restart()}
    }
    window.addEventListener('keydown',handler)
    return()=>window.removeEventListener('keydown',handler)
  },[active,move,restart])
  return <div className="game-screen snake-screen arcade-screen">
    <div className="arcade-heading"><div><span className="game-kicker">04 / KLASIK</span><h2>Snake<span className="game-accent">.</span></h2><p>Sakupi hranu i izbegni zidove i sopstveni rep.</p></div><button className="arcade-restart" onClick={restart}>↻ Nova igra</button></div>
    <div className="arcade-scorebar"><div><span>REZULTAT</span><strong>{game.score}</strong></div><div><span>REKORD</span><strong>{best}</strong></div><div><span>STATUS</span><strong>{game.over?'Kraj igre':game.paused?'Pauza':'Igra traje'}</strong></div></div>
    <div className="snake-playfield">
      <div className="snake-board" aria-label="Snake tabla">
        {Array.from({length:WIDTH*HEIGHT},(_,index)=>{
          const pt={x:index%WIDTH,y:Math.floor(index/WIDTH)}
          const part=game.body.findIndex(p=>same(p,pt))
          return <span className={'snake-cell'+(part===0?' snake-head':part>0?' snake-body':same(pt,game.food)?' snake-food':'')} key={index}/>
        })}
      </div>
      {(game.over||game.paused)&&<div className="arcade-board-overlay"><strong>{game.over?'Kraj igre':'Pauza'}</strong><span>{game.over?'Pritisni R za novu igru':'Pritisni P za nastavak'}</span><button onClick={game.over?restart:()=>setGame(v=>({...v,paused:false}))}>{game.over?'Igraj ponovo':'Nastavi'}</button></div>}
    </div>
    <div className="arcade-footer"><div className="arcade-keys"><ControlHint keys="↑ ↓ ← →" action="Kretanje"/><ControlHint keys="W A S D" action="Alternativno"/><ControlHint keys="P" action="Pauza"/><ControlHint keys="R" action="Restart"/></div>
      <div className="arcade-touch-controls">
        <button onClick={()=>move('left')} aria-label="Levo">←</button><button onClick={()=>move('up')} aria-label="Gore">↑</button><button onClick={()=>move('down')} aria-label="Dole">↓</button><button onClick={()=>move('right')} aria-label="Desno">→</button>
      </div>
    </div>
  </div>
}

type MergeState={grid:number[];score:number;over:boolean;won:boolean}
const createMerge=():MergeState=>{
  const grid=Array(16).fill(0) as number[]
  grid[5]=2;grid[10]=2
  return{grid,score:0,over:false,won:false}
}
type MergeDirection='up'|'down'|'left'|'right'
const slide=(line:number[])=>{
  const values=line.filter(Boolean),result:number[]=[],score={value:0}
  for(let i=0;i<values.length;i++){
    if(i+1<values.length&&values[i]===values[i+1]){
      const merged=values[i]*2
      result.push(merged);score.value+=merged;i++
    }else result.push(values[i])
  }
  while(result.length<4)result.push(0)
  return {line:result,score:score.value}
}
function moveMerge(prev:MergeState,dir:MergeDirection):MergeState {
  if(prev.over)return prev
  const next=[...prev.grid]
  let gained=0
  for(let index=0;index<4;index++){
    const at=(pos:number)=>dir==='left'?index*4+pos:dir==='right'?index*4+(3-pos):dir==='up'?pos*4+index:(3-pos)*4+index
    const current=Array.from({length:4},(_,p)=>prev.grid[at(p)])
    const moved=slide(current)
    gained+=moved.score
    moved.line.forEach((n,p)=>{next[at(p)]=n})
  }
  if(next.every((value,i)=>value===prev.grid[i]))return prev
  const empty=next.map((n,i)=>n? -1:i).filter(i=>i>=0)
  if(empty.length)next[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4
  const possible=next.some(v=>v===0)||next.some((v,i)=>i%4!==3&&v===next[i+1])||next.some((v,i)=>i<12&&v===next[i+4])
  return {grid:next,score:prev.score+gained,over:!possible,won:prev.won||next.some(v=>v>=2048)}
}
export function Merge2048({active}:{active:boolean}) {
  const [game,setGame]=useState<MergeState>(createMerge)
  const [best,setBest]=useState(()=>readBest('ftn-os-best-2048'))
  const restart=useCallback(()=>setGame(createMerge()),[])
  const move=useCallback((dir:MergeDirection)=>setGame(state=>moveMerge(state,dir)),[])
  useEffect(()=>{if(game.score>best){setBest(game.score);saveBest('ftn-os-best-2048',game.score)}},[game.score,best])
  useEffect(()=>{
    if(!active)return
    const handler=(event:KeyboardEvent)=>{
      const directions:Record<string,MergeDirection>={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',W:'up',S:'down',A:'left',D:'right'}
      if(directions[event.key]){event.preventDefault();move(directions[event.key])}
      if(event.key.toLowerCase()==='r'){event.preventDefault();restart()}
    }
    window.addEventListener('keydown',handler)
    return()=>window.removeEventListener('keydown',handler)
  },[active,move,restart])
  return <div className="game-screen merge-screen arcade-screen">
    <div className="arcade-heading"><div><span className="game-kicker">05 / BROJEVI</span><h2>2048<span className="game-accent">.</span></h2><p>Spajaj iste brojeve i pokušaj da stigneš do 2048.</p></div><button className="arcade-restart" onClick={restart}>↻ Nova igra</button></div>
    <div className="arcade-scorebar"><div><span>POENI</span><strong>{game.score}</strong></div><div><span>REKORD</span><strong>{best}</strong></div><div><span>CILJ</span><strong>{game.won?'Dostignut!':'2048'}</strong></div></div>
    <div className="merge-board-wrap">
      <div className="merge-board" role="grid" aria-label="2048 mreža 4 sa 4">
        {game.grid.map((value,index)=><div key={index} role="gridcell" aria-label={value?String(value):'Prazno'} className={'merge-tile merge-'+(value||'empty')}>{value||''}</div>)}
      </div>
      {game.over&&<div className="arcade-board-overlay"><strong>Više nema poteza</strong><span>Osvojeno poena: {game.score}</span><button onClick={restart}>Igraj ponovo</button></div>}
    </div>
    <div className="arcade-footer"><div className="arcade-keys"><ControlHint keys="↑ ↓ ← →" action="Pomeraj pločice"/><ControlHint keys="W A S D" action="Alternativno"/><ControlHint keys="R" action="Nova igra"/></div>
      <div className="arcade-touch-controls"><button onClick={()=>move('left')} aria-label="Levo">←</button><button onClick={()=>move('up')} aria-label="Gore">↑</button><button onClick={()=>move('down')} aria-label="Dole">↓</button><button onClick={()=>move('right')} aria-label="Desno">→</button></div>
    </div>
  </div>
}
