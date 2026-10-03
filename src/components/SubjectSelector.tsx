import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'
import { courses } from '../courses'
import type { Course, CourseId } from '../courses/types'

const subjectIcons: Record<CourseId, ReactElement> = {
  ers: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  oib: (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6l7-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L14.8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  odp: (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="5" cy="6" r="2.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="19" cy="6" r="2.4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="18" r="2.4" stroke="currentColor" strokeWidth="2" />
      <path d="M7 7.2L10.3 16M17 7.2L13.7 16M7.4 6h9.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

function SubjectTile({ subject, onOpen }: { subject: Course; onOpen: () => void }) {
  return (
    <div
      className={`subject-tile ${subject.available ? '' : 'disabled'}`}
      style={{ '--tile-accent': subject.accent, '--tile-accent-soft': subject.accentSoft } as CSSProperties}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect()
        event.currentTarget.style.setProperty('--tile-pointer-x', `${event.clientX - bounds.left}px`)
        event.currentTarget.style.setProperty('--tile-pointer-y', `${event.clientY - bounds.top}px`)
      }}
    >
      <span className="subject-tile-pointer-glow" aria-hidden="true" />
      <span className="subject-tile-mark">{subjectIcons[subject.id]}</span>
      <span className="subject-tile-copy">
        <strong>{subject.name}</strong>
        <span className="subject-tile-meta">{subject.blurb}</span>
        {!subject.available && <span className="subject-tile-badge">Uskoro</span>}
      </span>
      <button className="subject-tile-cta" onClick={onOpen} disabled={!subject.available}>
        <span>{subject.available ? 'Otvori' : 'Uskoro'}</span>
        <svg className="subject-tile-cta-icon" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

export function SubjectSelector({ onOpenSubject }: { onOpenSubject: (id: CourseId) => void }) {
  const shellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'FTN — Izbor predmeta'
  }, [])

  const winter = courses.filter((subject) => subject.semester === 'zimski')
  const summer = courses.filter((subject) => subject.semester === 'letnji')

  return (
    <div
      className="subjects-shell"
      ref={shellRef}
      onPointerMove={(event) => {
        const shell = shellRef.current
        if (!shell) return
        const bounds = shell.getBoundingClientRect()
        shell.style.setProperty('--subjects-pointer-x', `${event.clientX - bounds.left}px`)
        shell.style.setProperty('--subjects-pointer-y', `${event.clientY - bounds.top - 64}px`)
      }}
    >
      <span className="subjects-pointer-glow" aria-hidden="true" />
      <div className="subjects-ambient" aria-hidden="true">
        <span className="subjects-orb subjects-orb-blue" />
        <span className="subjects-orb subjects-orb-red" />
        <span className="subjects-orb subjects-orb-green" />

        <svg className="subjects-ambient-graphic subjects-network-graphic" viewBox="0 0 360 250" fill="none">
          <path className="subjects-flow-line" d="M54 67 145 32l78 56 87-24M54 67l39 96 130-75 49 104M93 163l109 45 70-16" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 7" />
          <circle cx="54" cy="67" r="9" />
          <circle cx="145" cy="32" r="6" />
          <circle cx="223" cy="88" r="11" />
          <circle cx="310" cy="64" r="6" />
          <circle cx="93" cy="163" r="8" />
          <circle cx="202" cy="208" r="6" />
          <circle cx="272" cy="192" r="10" />
        </svg>

        <svg className="subjects-ambient-graphic subjects-code-graphic" viewBox="0 0 300 220" fill="none">
          <rect x="31" y="35" width="238" height="150" rx="22" />
          <path d="m104 91-27 19 27 19M196 91l27 19-27 19M166 73l-32 74" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="57" cy="59" r="4" fill="currentColor" stroke="none" />
          <circle cx="72" cy="59" r="4" fill="currentColor" stroke="none" />
          <circle cx="87" cy="59" r="4" fill="currentColor" stroke="none" />
        </svg>

        <svg className="subjects-ambient-graphic subjects-orbit-graphic" viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="74" />
          <circle cx="120" cy="120" r="43" strokeDasharray="4 8" />
          <path className="subjects-orbit-path" d="M42 120c0-43.1 34.9-78 78-78s78 34.9 78 78-34.9 78-78 78-78-34.9-78-78Z" strokeDasharray="7 12" />
          <circle className="subjects-orbit-node" cx="186" cy="79" r="8" fill="currentColor" stroke="none" />
          <circle cx="120" cy="120" r="10" fill="currentColor" stroke="none" />
        </svg>

        <span className="subjects-data-chip subjects-data-chip-one">{`{ }`}</span>
        <span className="subjects-data-chip subjects-data-chip-two">01</span>
        <span className="subjects-data-chip subjects-data-chip-three">✓</span>
        <span className="subjects-data-chip subjects-data-chip-four">&lt;/&gt;</span>
      </div>

      <header className="subjects-header">
        <div className="subjects-header-brand">
          <span className="brand-mark subjects-home-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="2.3" fill="currentColor" />
              <path d="M12 5.8v3.8M6.2 9.2l3.5 2M17.8 9.2l-3.5 2M12 14.4v3.8" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
            </svg>
          </span>
          <div><strong>Materijali za predmete</strong><small>Fakultet tehničkih nauka · Novi Sad</small></div>
        </div>
      </header>

      <main className="subjects-main">
        <section className="subjects-section">
          <h2>Zimski semestar</h2>
          <div className="subjects-grid">
            {winter.map((subject) => (
              <SubjectTile key={subject.id} subject={subject} onOpen={() => onOpenSubject(subject.id)} />
            ))}
          </div>
        </section>

        <section className="subjects-section">
          <h2>Letnji semestar</h2>
          <div className="subjects-grid">
            {summer.map((subject) => (
              <SubjectTile key={subject.id} subject={subject} onOpen={() => onOpenSubject(subject.id)} />
            ))}
          </div>
        </section>
      </main>

      <footer className="subjects-footer">
        <div className="subjects-footer-brand">
          <span className="subjects-footer-mark">FTN</span>
          <span><strong>Univerzitet u Novom Sadu</strong><small>Fakultet tehničkih nauka · Primenjeno softversko inženjerstvo</small></span>
        </div>
        <span className="subjects-footer-copyright">© {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
