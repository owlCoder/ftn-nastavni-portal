import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { courses } from './courses'
import type { Course, CourseId } from './courses/types'
import { buildCourseFiles, visibleMaterials, type CourseFile } from './components/courseFileTree'
import { PracticumDocument } from './components/document/PracticumDocument'
import { MaterialDirectory } from './components/MaterialDirectory'
import { loadGithubMaterials, type MaterialsSnapshot } from './lib/githubMaterials'

type Section = 'vezbe' | 'prezentacije' | 'primeri' | 'projekat' | 'uputstva'
type Reader = 'praktikum' | 'kontrolne'
type Route = { courseId: CourseId | null; section: Section | 'opsti' | 'nastavni' | 'root' | Reader; exercise?: number; folder?: string }
type Catalog = { course: Course; files: CourseFile[] }

const tones: Record<CourseId, string> = {
  ers: '#456fc4',
  oib: '#c35e6c',
  odp: '#26947e',
  ibis: '#bf8646',
}

function courseStyle(id: CourseId): CSSProperties {
  return { '--course-color': tones[id] } as CSSProperties
}

function dataFor(course: Course): Catalog {
  return { course, files: visibleMaterials(buildCourseFiles(course)) }
}

function readRoute(): Route {
  const directory = window.location.hash.match(/^#(ers|oib|odp|ibis)\/dir\/(.+)$/)
  if (directory) {
    try { return { courseId: directory[1] as CourseId, section: 'root', folder: decodeURIComponent(directory[2]) } }
    catch { return { courseId: directory[1] as CourseId, section: 'root' } }
  }
  const match = window.location.hash.match(/^#(ers|oib|odp|ibis)(?:\/(vezbe|prezentacije|primeri|projekat|uputstva|opsti|nastavni|praktikum|kontrolne)(?:\/(\d{1,2}))?)?$/)
  if (!match) return { courseId: null, section: 'vezbe' }
  const courseId = match[1] as CourseId
  let section = (match[2] as Route['section'] | undefined) ?? 'root'
  if (courseId === 'ers') {
    if (['vezbe', 'prezentacije', 'primeri'].includes(section)) section = 'nastavni'
    if (section === 'uputstva') section = 'opsti'
  }
  const exercise = match[3] ? Number(match[3]) : undefined
  const folder = section === 'nastavni' && exercise ? 'teme/' + String(exercise).padStart(2, '0')
    : section === 'vezbe' && exercise ? 'vezbe/' + String(exercise).padStart(2, '0')
    : ['primeri', 'prezentacije'].includes(section) && courseId !== 'ibis' ? 'vezbe' : section
  return { courseId, section, exercise, folder }
}

function path(courseId: CourseId, section?: Route['section'], exercise?: number) {
  return '#' + courseId + (section ? '/' + section : '') + (exercise ? '/' + String(exercise).padStart(2, '0') : '')
}

function ReaderPage({ catalog, section, exercise }: { catalog: Catalog; section: Reader; exercise?: number }) {
  const { course, files } = catalog
  const anchor = exercise ? files.find(file => file.kind === 'practicum-link' && file.exercise === exercise)?.anchor : undefined
  return <div className="reader-page" style={courseStyle(course.id)}>
    <div className="reader-top"><a href={path(course.id)} className="back-link">← Nazad na {course.code}</a><span>{course.name}</span></div>
    {section === 'praktikum' ? <>
      <p className="directory-note">Ovaj stariji online prikaz čuva se u portalu i ne ažurira se automatski. Najnoviji dokumenti nalaze se u <a href={path(course.id)}>materijalima predmeta</a>.</p>
      <div className="reader-title"><span className="eyebrow">{course.code} / PRAKTIKUM</span><h1>{exercise ? (course.id === 'ers' ? 'Tema ' : 'Vežba ') + String(exercise).padStart(2, '0') : 'Praktikum'}</h1>
        <p>Tekstovi vežbi i prateći nastavni sadržaji.</p></div>
      {course.practicum.blocks.length ? <div className="reader-document" onClickCapture={event => {
        const target = event.target
        if (!(target instanceof Element)) return
        const tocLink = target.closest('.toc-panel a[href^="#"]')
        if (!tocLink) return
        const id = tocLink.getAttribute('href')?.slice(1)
        const heading = id ? document.getElementById(id) : null
        if (!heading) return
        event.preventDefault()
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}><PracticumDocument key={course.id + '-' + (exercise ?? 0)} practicum={course.practicum} initialSection={anchor}/></div>
        : <p className="empty-state">Praktikum za ovaj predmet trenutno nije dostupan.</p>}
    </> : <>
      <p className="directory-note">Ovaj stariji online prikaz čuva se u portalu i ne ažurira se automatski. Najnoviji dokumenti nalaze se u <a href={path(course.id)}>materijalima predmeta</a>.</p>
      <div className="reader-title"><span className="eyebrow">{course.code} / PROJEKAT</span><h1>Kontrolne tačke</h1>
        <p>Kontrolne tačke, rokovi i zahtevi projektnih etapa.</p></div>
      <div className="checkpoints-list">{course.checkpoints.map((point, index) => <article key={point.id} className="checkpoint-card">
        <div className="checkpoint-top"><span className="checkpoint-number">{String(index + 1).padStart(2, '0')}</span>
          <div><span className="eyebrow">{point.code} · {point.date}{point.points !== undefined ? ' · ' + point.points + ' poena' : ''}</span><h2>{point.title}</h2></div></div>
        <p>{point.summary}</p>
        <h3>{point.itemsHeading || 'Šta treba uraditi'}</h3>
        {point.orderedItems ? <ol>{point.items.map((item, i) => <li key={i}>{item}</li>)}</ol> : <ul>{point.items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
        {point.additionalRequirements?.map(group => <div key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>)}
        {point.presentation && <p><strong>Prikaz:</strong> {point.presentation}</p>}
        {!!point.notRequired?.length && <div className="checkpoint-note"><h3>Ne traži se u ovoj fazi</h3><ul>{point.notRequired.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
      </article>)}</div>
    </>}
  </div>
}

export default function App() {
  const fallbackCatalogs = useMemo(() => courses.map(dataFor), [])
  const [snapshot, setSnapshot] = useState<MaterialsSnapshot | null>(null)
  const [materialsError, setMaterialsError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const catalogs = snapshot?.catalogs ?? fallbackCatalogs

  useEffect(() => {
    const controller = new AbortController()
    setMaterialsError('')
    loadGithubMaterials(courses, controller.signal)
      .then(setSnapshot)
      .catch(error => {
        if (!controller.signal.aborted) setMaterialsError(error instanceof Error ? error.message : 'Preuzimanje materijala nije uspelo.')
      })
    return () => controller.abort()
  }, [refresh])
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const update = () => {
      if (window.location.hash && window.location.hash !== '#' && !/^#(ers|oib|odp|ibis)(\/|$)/.test(window.location.hash)) return
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  const current = catalogs.find(catalog => catalog.course.id === route.courseId)
  const reading = route.section === 'praktikum' || route.section === 'kontrolne'
  const sourceStatus = materialsError ? <>GitHub nije dostupan · {snapshot ? 'prethodna verzija' : 'rezervna verzija'} <button type="button" onClick={() => setRefresh(n => n + 1)}>Pokušaj ponovo</button></>
    : snapshot ? <>GitHub · {snapshot.revision.slice(0, 7)} <button type="button" onClick={() => setRefresh(n => n + 1)}>Osveži</button></>
    : <>Učitavanje sa GitHub-a…</>
  return <div className="portal portal-directory">
    <a href="#content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('content')?.focus()
    }}>Preskoči na sadržaj</a>
    <main id="content" tabIndex={-1} className="site-content">
      {current ? reading ? <ReaderPage catalog={current} section={route.section as Reader} exercise={route.exercise}/> :
          <MaterialDirectory catalogs={catalogs} courseId={current.course.id} folder={route.folder ?? 'root'} sourceStatus={sourceStatus}/> :
          <MaterialDirectory catalogs={catalogs} sourceStatus={sourceStatus}/>}
    </main>

  </div>
}
