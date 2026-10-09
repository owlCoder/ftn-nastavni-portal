import { useEffect, useState, type ComponentType, type CSSProperties, type ReactElement } from 'react'
import type { Course, CourseId } from '../courses/types'
import { CheckpointsView } from './CheckpointsView'
import { PracticumDocument } from './document/PracticumDocument'
import { ErsExamplesView } from './examples/ErsExamplesView'
import { OibExamplesView } from './examples/OibExamplesView'
import { OdpExamplesView } from './examples/OdpExamplesView'
import { PresentationDecksView } from './PresentationDecksView'
import { PresentationDownloadsView } from './PresentationDownloadsView'
import { ProjectDownloadView } from './ProjectDownloadView'

type TabKey = 'praktikum' | 'primeri' | 'prezentacije' | 'projekat' | 'kontrolne-tacke'

type Tab = {
  key: TabKey
  label: string
  title: string
  icon: ReactElement
}

const tabs: Tab[] = [
  {
    key: 'praktikum',
    label: 'Praktikum',
    title: 'Praktikum',
    icon: <path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  },
  {
    key: 'primeri',
    label: 'Primeri',
    title: 'Primeri',
    icon: (
      <>
        <path d="M4 6.5h6l1.6 2H20v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    key: 'prezentacije',
    label: 'Prezentacije',
    title: 'Prezentacije',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    key: 'projekat',
    label: 'Projekat',
    title: 'Projekat',
    icon: (
      <>
        <path d="M7 3.5h7l4 4V20.5H7v-17Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    key: 'kontrolne-tacke',
    label: 'Kont. tačke',
    title: 'Kontrolne tačke',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 12.3l1.8 1.8L15.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
]

const examplesViews: Partial<Record<CourseId, ComponentType>> = {
  ers: ErsExamplesView,
  oib: OibExamplesView,
  odp: OdpExamplesView,
}

const brandIcons: Partial<Record<CourseId, ReactElement>> = {
  ers: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13.5 5.5l-3 13" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  oib: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 19 6v5.3c0 4.3-2.8 7.6-7 9.2-4.2-1.6-7-4.9-7-9.2V6l7-2.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.3 11.4h5.4v4.1H9.3v-4.1Zm1-2a1.7 1.7 0 0 1 3.4 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

function availableTabs(course: Course) {
  return tabs.filter(({ key }) => {
    if (key === 'primeri') return course.id in examplesViews
    if (key === 'projekat') return Boolean(course.project)
    return true
  })
}

function tabFromHash(course: Course): TabKey | undefined {
  return availableTabs(course).find(({ key }) => window.location.hash.startsWith(`#${course.id}/${key}`))?.key
}

function TabPanel({ course, tab }: { course: Course; tab: TabKey }) {
  const ExamplesView = examplesViews[course.id]

  if (tab === 'primeri' && ExamplesView) return <ExamplesView />
  if (tab === 'projekat' && course.project) return <ProjectDownloadView project={course.project} />
  if (tab === 'kontrolne-tacke') return <CheckpointsView checkpoints={course.checkpoints} />
  if (tab === 'prezentacije') {
    return course.presentations.kind === 'downloads'
      ? <PresentationDownloadsView downloads={course.presentations.downloads} bundle={course.presentations.bundle} />
      : <PresentationDecksView decks={course.presentations.decks} />
  }
  return <PracticumDocument practicum={course.practicum} />
}

export function CourseApp({ course, onBack, embedded = false }: { course: Course; onBack: () => void; embedded?: boolean }) {
  const [active, setActive] = useState<TabKey>(() => tabFromHash(course) ?? 'praktikum')
  const visibleTabs = availableTabs(course)

  useEffect(() => {
    const syncActiveTab = () => {
      const next = tabFromHash(course)
      if (next) setActive(next)
    }

    window.addEventListener('hashchange', syncActiveTab)
    window.addEventListener('popstate', syncActiveTab)
    return () => {
      window.removeEventListener('hashchange', syncActiveTab)
      window.removeEventListener('popstate', syncActiveTab)
    }
  }, [course])

  useEffect(() => {
    if (!embedded) document.title = `${course.code} — ${tabs.find(({ key }) => key === active)!.title}`
  }, [active, course, embedded])

  const choose = (key: TabKey) => {
    setActive(key)
    if (!embedded) {
      history.replaceState(null, '', `#${course.id}/${key}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="site-brand" onClick={onBack}>
          <span
            className={`brand-mark brand-mark-${course.id}`}
            style={{ '--brand-accent': course.accent, '--brand-shadow': course.accentShadow } as CSSProperties}
          >
            {brandIcons[course.id]}
          </span>
          <span><strong>{course.name}</strong><small>{course.academicYear}</small></span>
        </button>
        <nav className="document-switcher" aria-label="Dokumenti">
          {visibleTabs.map(({ key, label, title, icon }) => (
            <button key={key} className={active === key ? 'active' : undefined} onClick={() => choose(key)} aria-label={title}>
              <svg viewBox="0 0 24 24" fill="none">{icon}</svg>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>
      <div className="tab-panel" key={active}>
        <TabPanel course={course} tab={active} />
      </div>
    </div>
  )
}
