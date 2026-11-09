import { useEffect, useMemo, useState } from 'react'
import type { CourseId } from './courses/types'
import type { Catalog, CourseSummary } from './components/directoryModel'
import { MaterialDirectory } from './components/MaterialDirectory'
import { loadGithubMaterials, type MaterialsSnapshot } from './lib/githubMaterials'
import { ExamAdmin } from './components/ExamAdmin'
import { filterCatalogsForExam, loadExamPolicy, type ExamPolicy } from './lib/examMode'

type Section = 'vezbe' | 'prezentacije' | 'primeri' | 'projekat' | 'uputstva'
type Reader = 'praktikum' | 'kontrolne'
type Route = { courseId: CourseId | null; section: Section | 'opsti' | 'nastavni' | 'root' | Reader; exercise?: number; folder?: string }
const courses: CourseSummary[] = [
  { id: 'ers', code: 'ERS', name: 'Elementi razvoja softvera' },
  { id: 'oib', code: 'OIB', name: 'Osnove informacione bezbednosti' },
  { id: 'odp', code: 'ODP', name: 'Osnove distribuiranog programiranja' },
  { id: 'ibis', code: 'IBIS', name: 'Informaciona bezbednost infrastrukturnih sistema' },
]

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
  if (section === 'praktikum') section = courseId === 'ers' ? 'nastavni' : 'vezbe'
  if (section === 'kontrolne') section = 'projekat'
  const exercise = match[3] ? Number(match[3]) : undefined
  const folder = section === 'nastavni' && exercise ? 'teme/' + String(exercise).padStart(2, '0')
    : section === 'vezbe' && exercise ? 'vezbe/' + String(exercise).padStart(2, '0')
    : ['primeri', 'prezentacije'].includes(section) && courseId !== 'ibis' ? 'vezbe' : section
  return { courseId, section, exercise, folder }
}

export default function App() {
  const emptyCatalogs = useMemo<Catalog[]>(() => courses.map(course => ({ course, files: [] })), [])
  const [snapshot, setSnapshot] = useState<MaterialsSnapshot | null>(null)
  const [materialsError, setMaterialsError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const catalogs = snapshot?.catalogs ?? emptyCatalogs
  const [examPolicy, setExamPolicy] = useState<ExamPolicy | null>(null)
  const [examError, setExamError] = useState('')
  const isAdminPage = window.location.pathname.replace(/\/+$/, '') === '/ir'

  useEffect(() => {
    let active = true
    let requestNumber = 0
    const controller = new AbortController()
    const check = () => {
      const currentRequest = ++requestNumber
      loadExamPolicy(controller.signal)
        .then(policy => {
          if (!active || currentRequest !== requestNumber) return
          setExamPolicy(policy)
          setExamError('')
        })
        .catch(error => {
          if (!active || currentRequest !== requestNumber) return
          setExamPolicy(null) // Fail closed if the deployed configuration cannot be verified.
          setExamError(error instanceof Error ? error.message : 'Ispitni režim nije dostupan.')
        })
    }
    check()
    const timer = window.setInterval(check, 15_000)
    const whenVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', whenVisible)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', whenVisible)
    }
  }, [])
  const displayedCatalogs = useMemo(
    () => examPolicy ? filterCatalogsForExam(catalogs, examPolicy) : [],
    [catalogs, examPolicy],
  )

  useEffect(() => {
    const controller = new AbortController()
    setMaterialsError('')
    loadGithubMaterials(courses, controller.signal)
      .then(next => setSnapshot(previous => previous?.revision === next.revision ? previous : next))
      .catch(error => {
        if (!controller.signal.aborted) setMaterialsError(error instanceof Error ? error.message : 'Preuzimanje materijala nije uspelo.')
      })
    return () => controller.abort()
  }, [refresh])

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') setRefresh(n => n + 1)
    }
    const timer = window.setInterval(refreshWhenVisible, 60_000)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
    }
  }, [])
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

  const current = displayedCatalogs.find(catalog => catalog.course.id === route.courseId)
  const sourceStatus = materialsError ? <>GitHub nije dostupan · {snapshot ? 'prethodna verzija' : 'materijali nisu učitani'} <button type="button" onClick={() => setRefresh(n => n + 1)}>Pokušaj ponovo</button></>
    : snapshot ? <>GitHub · {snapshot.revision.slice(0, 7)} <button type="button" onClick={() => setRefresh(n => n + 1)}>Osveži</button></>
    : <>Učitavanje sa GitHub-a…</>
  return <div className="portal portal-directory">
    <a href="#content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('content')?.focus()
    }}>Preskoči na sadržaj</a>
    <main id="content" tabIndex={-1} className="site-content">
      {isAdminPage ? <ExamAdmin catalogs={catalogs} materialsError={materialsError}/> :
        !examPolicy ? <p className="exam-loading" role="status">{examError || 'Provera dostupnosti materijala…'}</p> :
        <>
          {examPolicy.enabled && <div className="exam-banner" role="status">Ispitni režim je uključen · Dostupni su samo odabrani materijali.</div>}
          {current ? <MaterialDirectory catalogs={displayedCatalogs} courseId={current.course.id} folder={route.folder ?? 'root'} sourceStatus={sourceStatus}/> :
            <MaterialDirectory catalogs={displayedCatalogs} sourceStatus={sourceStatus}/>}
        </>}
    </main>

  </div>
}
