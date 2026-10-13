import { useState } from 'react'
import { exerciseRange } from '../courses/checkpoints'
import type { Checkpoint } from '../courses/types'
import { inlineCode } from '../lib/markup'

function CheckpointTasks({items,numbered=false,start=1}:{items:string[];numbered?:boolean;start?:number}){
  const Tag=numbered?'ol':'ul'
  return <Tag className="checkpoint-tasks" start={numbered?start:undefined}>
    {items.map((item,index)=><li key={index}>
      <span className="checkpoint-task-check" aria-hidden="true">{numbered?start+index:
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="2" width="14" height="14" rx="4"/></svg>}</span>
      <span dangerouslySetInnerHTML={{__html:inlineCode(item)}}/>
    </li>)}
  </Tag>
}

export function CheckpointsView({checkpoints}:{checkpoints:Checkpoint[]}){
  const [activeId,setActiveId]=useState(checkpoints[0]?.id??'')
  const active=checkpoints.find(c=>c.id===activeId)??checkpoints[0]
  if(!active)return <div className="checkpoint-empty">Nema definisanih kontrolnih tačaka.</div>
  const additionalRequirements=active.additionalRequirements??[]
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
        <h3>{active.itemsHeading??'Šta treba pripremiti'}</h3>
        <CheckpointTasks items={active.items} numbered={active.orderedItems}/>
        {additionalRequirements.map((group,index)=><section className="checkpoint-extra-section" key={group.title}>
          <h3>{group.title}</h3>
          <CheckpointTasks items={group.items} numbered={active.orderedItems}
            start={active.items.length+1+additionalRequirements.slice(0,index).reduce((sum,previous)=>sum+previous.items.length,0)}/>
        </section>)}
        {active.presentation&&<section className="checkpoint-note">
          <h3>Prikaz</h3><p dangerouslySetInnerHTML={{__html:inlineCode(active.presentation)}}/>
        </section>}
        {!!active.notRequired?.length&&<section className="checkpoint-note checkpoint-not-required">
          <h3>Ne tražiti u ovoj fazi</h3>
          <ul>{active.notRequired.map((item,index)=><li key={index} dangerouslySetInnerHTML={{__html:inlineCode(item)}}/>)}</ul>
        </section>}
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
