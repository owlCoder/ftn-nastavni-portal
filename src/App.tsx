import { useEffect, useMemo, useState } from 'react'
import type { CourseId } from './courses/types'
import type { Catalog, CourseSummary } from './components/directoryModel'
import { MaterialDirectory } from './components/MaterialDirectory'
import { loadGithubMaterials, type MaterialsSnapshot } from './lib/githubMaterials'

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
  const sourceStatus = materialsError ? <>GitHub nije dostupan · {snapshot ? 'prethodna verzija' : 'materijali nisu učitani'} <button type="button" onClick={() => setRefresh(n => n + 1)}>Pokušaj ponovo</button></>
    : snapshot ? <>GitHub · {snapshot.revision.slice(0, 7)} <button type="button" onClick={() => setRefresh(n => n + 1)}>Osveži</button></>
    : <>Učitavanje sa GitHub-a…</>
  return <div className="portal portal-directory">
    <a href="#content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('content')?.focus()
    }}>Preskoči na sadržaj</a>
    <main id="content" tabIndex={-1} className="site-content">
      {current ? <MaterialDirectory catalogs={catalogs} courseId={current.course.id} folder={route.folder ?? 'root'} sourceStatus={sourceStatus}/> :
          <MaterialDirectory catalogs={catalogs} sourceStatus={sourceStatus}/>}
    </main>

  </div>
}
