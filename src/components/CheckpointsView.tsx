import { useState } from 'react'
import { exerciseRange } from '../courses/checkpoints'
import type { Checkpoint } from '../courses/types'
import { inlineCode } from '../lib/markup'

export function CheckpointsView({checkpoints}:{checkpoints:Checkpoint[]}){
  const [activeId,setActiveId]=useState(checkpoints[0]?.id??'')
  const active=checkpoints.find(c=>c.id===activeId)??checkpoints[0]
  if(!active)return <div className="checkpoint-empty">Nema definisanih kontrolnih tačaka.</div>
  return <main className="checkpoint-timeline-page">
    <header className="checkpoint-page-heading">
      <span className="checkpoint-eyebrow">PROJEKAT / PLAN RADA</span>
      <h1>Kontrolne tačke</h1>
      <p>Tok projekta kroz semestar. Izaberi etapu za zahteve i kriterijume.</p>
    </header>
    <div className="checkpoint-timeline-layout">
      <nav className="checkpoint-timeline-rail" aria-label="Etape projekta">
        <ol>
          {checkpoints.map((item,index)=><li key={item.id}>
            <button type="button" className={'checkpoint-timeline-step'+(active.id===item.id?' is-active':'')}
              aria-current={active.id===item.id?'step':undefined} onClick={()=>setActiveId(item.id)}>
              <span className="checkpoint-rail-track"><span className="checkpoint-rail-number">{String(index+1).padStart(2,'0')}</span></span>
              <span className="checkpoint-rail-copy"><span className="checkpoint-rail-date">{item.date} · {item.code}</span><strong>{item.title}</strong><small>{exerciseRange(item)}</small></span>
            </button>
          </li>)}
        </ol>
      </nav>
      <article className="checkpoint-timeline-detail" key={active.id}>
        <div className="checkpoint-detail-head">
          <span className="checkpoint-detail-index">{active.code}</span>
          <span className="checkpoint-detail-date">{active.date}</span>
        </div>
        <h2>{active.title}</h2>
        <p className="checkpoint-detail-scope">{exerciseRange(active)}</p>
        <p className="checkpoint-detail-intro">{active.summary}</p>
        <div className="checkpoint-detail-divider"/>
        <h3>Šta treba pripremiti</h3>
        <ul className="checkpoint-tasks">
          {active.items.map((item,index)=><li key={index}>
            <span className="checkpoint-task-check" aria-hidden="true"><svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="14" height="14" rx="4"/></svg></span>
            <span dangerouslySetInnerHTML={{__html:inlineCode(item)}}/>
          </li>)}
        </ul>
        <div className="checkpoint-detail-bottom">
          <span>Etapa {checkpoints.indexOf(active)+1} od {checkpoints.length}</span>
          <div>
            <button disabled={checkpoints.indexOf(active)===0} onClick={()=>setActiveId(checkpoints[checkpoints.indexOf(active)-1].id)}>← Prethodna</button>
            <button disabled={checkpoints.indexOf(active)===checkpoints.length-1} onClick={()=>setActiveId(checkpoints[checkpoints.indexOf(active)+1].id)}>Sledeća →</button>
          </div>
        </div>
      </article>
    </div>
  </main>
}
