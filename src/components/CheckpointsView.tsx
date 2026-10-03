import { useState } from 'react'
import { exerciseRange } from '../courses/checkpoints'
import type { Checkpoint } from '../courses/types'
import { inlineCode } from '../lib/markup'

export function CheckpointsView({ checkpoints }: { checkpoints: Checkpoint[] }) {
  const [activeId, setActiveId] = useState(checkpoints[0].id)
  const active = checkpoints.find((item) => item.id === activeId) || checkpoints[0]
  const activeIndex = checkpoints.findIndex((item) => item.id === active.id)

  return (
    <main className="checkpoints-shell">
      <div className="checkpoints-topline">
        <h1>Kontrolne tačke</h1>
        <p>Pregled projektnih kontrolnih tačaka kroz semestar.</p>
      </div>

      <ol className="checkpoint-timeline" aria-label="Kontrolne tačke">
        {checkpoints.map((item, index) => (
          <li key={item.id} className={index <= activeIndex ? 'is-reached' : ''}>
            <button
              className={`checkpoint-node ${item.id === active.id ? 'active' : ''}`}
              onClick={() => setActiveId(item.id)}
            >
              <span className="checkpoint-node-dot">{item.code}</span>
              <span className="checkpoint-node-date">{item.date}</span>
              <span className="checkpoint-node-title">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="checkpoint-stage">
        <article className="checkpoint-canvas" key={active.id}>
          <div className="checkpoint-toolbar">
            <span className="checkpoint-badge">{active.code}</span>
            <div className="checkpoint-toolbar-title">
              <strong>{active.title}</strong>
              <span>{exerciseRange(active)} · nedelja od {active.date}</span>
            </div>
          </div>

          <p className="checkpoint-summary">{active.summary}</p>
          <h3>Šta treba uraditi</h3>
          <ul className="checkpoint-items">
            {active.items.map((item, index) => (
              <li key={item}>
                <span className="checkpoint-item-index">{index + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: inlineCode(item) }} />
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}
