import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { courses } from './courses'
import type { Course, CourseId } from './courses/types'
import { buildCourseFiles, type CourseFile } from './components/courseFileTree'
import { PracticumDocument } from './components/document/PracticumDocument'
import { assetUrl } from './lib/assets'

type Page = 'materials' | 'praktikum' | 'kontrolne'
type Route = { courseId: CourseId | null; page: Page; exercise?: number }
type Catalog = { course: Course; files: CourseFile[] }

const palette: Record<CourseId, string> = {
  ers: '#2563a9', oib: '#c54b50', odp: '#16856f', ibis: '#ae7533',
}
const readRoute = (): Route => {
  const match = window.location.hash.match(/^#(ers|oib|odp|ibis)(?:\/(praktikum|kontrolne)(?:\/(\d{1,2}))?)?$/)
  return match
    ? { courseId: match[1] as CourseId, page: (match[2] as Page | undefined) ?? 'materials', exercise: match[3] ? Number(match[3]) : undefined }
    : { courseId: null, page: 'materials' }
}
const normalize = (value: string) => value.toLocaleLowerCase('sr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const fileHref = (course: Course, file: CourseFile) => {
  if (file.source) return assetUrl(file.source)
  if (file.kind === 'practicum-link' && file.exercise) return '#' + course.id + '/praktikum/' + String(file.exercise).padStart(2, '0')
  if (file.kind === 'practicum') return '#' + course.id + '/praktikum'
  if (file.kind === 'checkpoints') return '#' + course.id + '/kontrolne'
  return '#' + course.id
}
const fileType = (file: CourseFile) => file.kind === 'pdf' ? 'PDF' : file.kind === 'zip' ? 'ZIP' : 'TEKST'

function SearchIcon() {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
}

function FileAction({ course, file, primary = false, onNavigate }: {
  course: Course; file: CourseFile; primary?: boolean; onNavigate?: () => void
}) {
  const remote = Boolean(file.source)
  const pdf = file.kind === 'pdf'
  const zip = file.kind === 'zip'
  return <a
    className={'portal-action' + (primary ? ' portal-action-primary' : '')}
    href={fileHref(course, file)}
    target={pdf ? '_blank' : undefined}
    rel={pdf ? 'noopener noreferrer' : undefined}
    download={zip ? '' : undefined}
    onClick={remote ? undefined : onNavigate}
  >{pdf ? 'Otvori PDF ↗' : zip ? 'Preuzmi ZIP ↓' : 'Pročitaj →'}</a>
}

function FileRow({ course, file, onNavigate }: { course: Course; file: CourseFile; onNavigate?: () => void }) {
  return <article className="portal-file-row">
    <span className={'portal-file-format ' + (file.kind === 'zip' ? 'zip' : file.kind === 'pdf' ? '' : 'doc')}>{fileType(file)}</span>
    <div className="portal-file-info">
      <strong>{file.presentationNumber !== undefined && Number(file.presentationNumber) > 0 ? file.presentationNumber + ' · ' : ''}{file.name}</strong>
      <small>{file.description || 'Nastavni materijal'}{file.pages ? ' · ' + file.pages + ' str.' : ''}{file.size ? ' · ' + file.size : ''}</small>
    </div>
    <FileAction course={course} file={file} onNavigate={onNavigate}/>
  </article>
}

function Home() {
  return <>
    <div className="portal-intro">
      <span className="portal-eyebrow">FTN · Nastavni materijali</span>
      <h1>Materijali za nastavu, bez komplikacija.</h1>
      <p>Izaberi predmet i odmah otvori prezentacije, tekstove vežbi, primere koda i projektna uputstva. Sve je dostupno bez prijavljivanja.</p>
    </div>
    <div className="portal-course-grid">
      {courses.map(course => <a key={course.id} href={'#' + course.id} className="portal-course-card"
        style={{ '--subject-color': palette[course.id] } as CSSProperties}>
        <span className="portal-course-code">{course.code}</span>
        <strong>{course.name}</strong>
        <span className="portal-course-meta">{course.studyLevel === 'master' ? 'Master studije' : 'Osnovne studije'} · {course.academicYear}</span>
        <span className="portal-course-arrow" aria-hidden="true">↗</span>
      </a>)}
    </div>
    <p className="portal-secondary-note">Tražiš određeni PDF ili primer? U polje za pretragu iznad unesi naziv, temu ili broj vežbe.</p>
  </>
}

function SectionTitle({ title, subtitle, count }: { title: string; subtitle: string; count?: number }) {
  return <div className="portal-section-head">
    <div><h2>{title}</h2><p>{subtitle}</p></div>
    {count !== undefined && <span className="portal-count">{count}</span>}
  </div>
}

function CourseMaterials({ catalog }: { catalog: Catalog }) {
  const { course, files } = catalog
  const lessons = files.filter(file => file.kind === 'folder' && file.parent === 'vezbe')
  const slides = files.filter(file => file.kind === 'pdf' && file.presentationNumber !== undefined)
    .sort((a, b) => Number(a.presentationNumber) - Number(b.presentationNumber))
  const examples = files.filter(file => file.kind === 'zip' && file.id.endsWith('/primer'))
  const project = files.filter(file => file.parent === 'projekat' && file.kind === 'pdf')
  const guides = files.filter(file => file.parent === 'uputstva' && file.kind === 'pdf')
  const bundles = files.filter(file => file.bundle && file.source)
  const practicum = files.find(file => file.kind === 'practicum')
  const hasProject = project.length > 0 || course.checkpoints.length > 0
  const scrollTo = (section: string) => document.getElementById(course.id + '-' + section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return <>
    <div className="portal-breadcrumb"><a href="#">Svi predmeti</a><span>/</span><span>{course.code}</span></div>
    <div className="portal-course-heading">
      <div>
        <span className="portal-eyebrow">Nastavni materijali · {course.academicYear}</span>
        <h1>{course.name}</h1>
        <p>{course.blurb}</p>
      </div>
      <span className="portal-course-code" style={{ '--subject-color': palette[course.id] } as CSSProperties}>{course.code}</span>
    </div>
    <nav className="portal-subject-nav" aria-label="Predmeti">
      {courses.map(item => <a key={item.id} href={'#' + item.id} aria-current={item.id === course.id ? 'page' : undefined}>{item.code}</a>)}
    </nav>
    <div className="portal-summary" aria-label="Brzi pristup">
      {practicum && <a className="portal-quick-link" href={'#' + course.id + '/praktikum'}>Praktikum <span aria-hidden="true">↗</span></a>}
      {course.practicum.pdfFile && <a className="portal-quick-link" href={assetUrl(course.practicum.pdfFile)} target="_blank" rel="noopener noreferrer">Praktikum PDF ↗</a>}
      {bundles.map(file => <a className="portal-quick-link" key={file.id} href={assetUrl(file.source!)} download>{file.name} <small>{file.size || ''}</small> ↓</a>)}
      {course.checkpoints.length > 0 && <a className="portal-quick-link" href={'#' + course.id + '/kontrolne'}>Kontrolne tačke →</a>}
      <button className="portal-quick-link" type="button" onClick={() => scrollTo(slides.length ? 'prezentacije' : 'projekat')}>Pregled svih materijala ↓</button>
    </div>

    <nav className="portal-section-nav" aria-label="Odeljci predmeta">
      {lessons.length > 0 && <button onClick={() => scrollTo('vezbe')}>Vežbe</button>}
      {slides.length > 0 && <button onClick={() => scrollTo('prezentacije')}>Prezentacije</button>}
      {examples.length > 0 && <button onClick={() => scrollTo('primeri')}>Primeri koda</button>}
      {hasProject && <button onClick={() => scrollTo('projekat')}>Projekat</button>}
      <button onClick={() => scrollTo('uputstva')}>Uputstva</button>
    </nav>

    {lessons.length > 0 && <section className="portal-section" id={course.id + '-vezbe'}>
      <SectionTitle title="Računarske vežbe" subtitle="Za svaku vežbu: prezentacija, primer koda i zadatak." count={lessons.length}/>
      <div className="portal-lessons">{lessons.map((lesson, index) => {
        const children = files.filter(file => file.parent === lesson.id)
        const slide = children.find(file => file.kind === 'pdf')
        const example = children.find(file => file.kind === 'zip')
        const task = children.find(file => file.kind === 'practicum-link')
        return <article className="portal-lesson" key={lesson.id}>
          <span className="portal-lesson-index">Vežba {String(index + 1).padStart(2, '0')}</span>
          <h3>{lesson.description || lesson.name}</h3>
          <div className="portal-lesson-actions">
            {slide && <FileAction course={course} file={slide} primary/>}
            {task && <FileAction course={course} file={task}/>}
            {example && <FileAction course={course} file={example}/>}
          </div>
        </article>
      })}</div>
    </section>}

    {slides.length > 0 && <section className="portal-section" id={course.id + '-prezentacije'}>
      <SectionTitle title="Prezentacije" subtitle="Sve prezentacije na jednom mestu, u PDF formatu." count={slides.length}/>
      <div className="portal-file-list">{slides.map(file => <FileRow key={file.id} course={course} file={file}/>)}</div>
    </section>}

    {examples.length > 0 && <section className="portal-section" id={course.id + '-primeri'}>
      <SectionTitle title="Programski primeri" subtitle="ZIP arhive sa izvornim kodom za vežbe." count={examples.length}/>
      <div className="portal-file-list">{examples.map(file => <FileRow key={file.id} course={course} file={file}/>)}</div>
    </section>}

    {hasProject && <section className="portal-section" id={course.id + '-projekat'}>
      <SectionTitle title={course.projects?.length ? 'Projekti' : 'Projekat'} subtitle="Specifikacije, pravila i projektne obaveze." count={project.length + (course.checkpoints.length ? 1 : 0)}/>
      <div className="portal-file-list">
        {project.map(file => <FileRow key={file.id} course={course} file={file}/>)}
        {course.checkpoints.length > 0 && <FileRow course={course} file={{
          id: 'kontrolne', parent: 'projekat', kind: 'checkpoints', name: 'Kontrolne tačke',
          description: 'Datumi, zahtevi i obaveze po etapama projekta.',
        }}/>}
      </div>
    </section>}

    <section className="portal-section" id={course.id + '-uputstva'}>
      <SectionTitle title="Uputstva" subtitle="Korisnička uputstva za sisteme koji se koriste na nastavi." count={guides.length}/>
      <div className="portal-file-list">{guides.map(file => <FileRow key={file.id} course={course} file={file}/>)}</div>
    </section>
  </>
}

function CourseReader({ course, page, exercise }: { course: Course; page: Page; exercise?: number }) {
  const files = useMemo(() => buildCourseFiles(course), [course])
  const anchor = exercise ? files.find(file => file.kind === 'practicum-link' && file.exercise === exercise)?.anchor : undefined
  if (page === 'kontrolne') {
    return <>
      <div className="portal-breadcrumb"><a href={'#' + course.id}>← Nazad na {course.code}</a></div>
      <div className="portal-reader-head"><span className="portal-eyebrow">{course.code} · Projekat</span><h1>Kontrolne tačke</h1></div>
      <div className="portal-checkpoint-list">{course.checkpoints.map(checkpoint => <article key={checkpoint.id}>
        <span className="portal-date">{checkpoint.code} · {checkpoint.date}{checkpoint.points !== undefined ? ' · ' + checkpoint.points + ' poena' : ''}</span>
        <h2>{checkpoint.title}</h2><p>{checkpoint.summary}</p>
        <h3>{checkpoint.itemsHeading || 'Šta treba pripremiti'}</h3>
        {checkpoint.orderedItems ? <ol>{checkpoint.items.map((item, i) => <li key={i}>{item}</li>)}</ol> : <ul>{checkpoint.items.map((item, i) => <li key={i}>{item}</li>)}</ul>}
        {checkpoint.additionalRequirements?.map(group => <div key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item, i) => <li key={i}>{item}</li>)}</ul></div>)}
        {checkpoint.presentation && <p><strong>Prikaz:</strong> {checkpoint.presentation}</p>}
        {!!checkpoint.notRequired?.length && <div><h3>Ne traži se u ovoj fazi</h3><ul>{checkpoint.notRequired.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
      </article>)}</div>
    </>
  }
  if (!course.practicum.blocks.length) return <p className="portal-empty">Praktikum za ovaj predmet nije dostupan.</p>
  return <>
    <div className="portal-breadcrumb"><a href={'#' + course.id}>← Nazad na {course.code}</a></div>
    <div className="portal-reader-head"><span className="portal-eyebrow">{course.code} · Nastavni materijali</span><h1>{exercise ? 'Vežba ' + String(exercise).padStart(2, '0') : 'Praktikum'}</h1></div>
    <div className="portal-reading" onClickCapture={event => {
      const link = (event.target as HTMLElement).closest('a[href^="#"]')
      if (!link || !link.closest('.toc-panel')) return
      const id = link.getAttribute('href')?.slice(1)
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return
      event.preventDefault()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }}>
      <PracticumDocument key={course.id + '-' + (exercise ?? 0)} practicum={course.practicum} initialSection={anchor}/>
    </div>
  </>
}

function SearchResults({ catalogs, query, onNavigate }: { catalogs: Catalog[]; query: string; onNavigate: () => void }) {
  const needle = normalize(query.trim())
  const all = catalogs.flatMap(({ course, files }) => files
    .filter(file => file.kind !== 'folder')
    .filter(file => {
      const number = file.exercise ?? Number(file.id.match(/^vezbe\/(\d+)/)?.[1] ?? file.presentationNumber ?? 0)
      const searchable = [
        course.code, course.name, file.name, file.description || '', file.parent,
        number ? 'vežba ' + number + ' vežba ' + String(number).padStart(2, '0') : '',
        file.kind === 'zip' ? 'primer izvorni kod' : '',
      ].join(' ')
      return normalize(searchable).includes(needle)
    })
    .map(file => ({ course, file })))
  const results = all.slice(0, 60)
  return <>
    <div className="portal-search-intro"><span className="portal-eyebrow">Pretraga materijala</span>
      <h1>Rezultati za „{query.trim()}”</h1>
      <p>{all.length} {all.length === 1 ? 'rezultat' : 'rezultata'} u sva četiri predmeta.</p>
    </div>
    {results.length > 0 ? <div className="portal-search-results">
      {results.map(({ course, file }) => <div key={course.id + ':' + file.id} className="portal-search-result">
        <span className={'portal-file-format ' + (file.kind === 'zip' ? 'zip' : file.kind === 'pdf' ? '' : 'doc')}>{fileType(file)}</span>
        <div className="portal-file-info"><small className="portal-search-course">{course.code} · {course.name}</small><strong>{file.name}</strong><small>{file.description || ''}</small></div>
        <FileAction course={course} file={file} onNavigate={onNavigate}/>
      </div>)}
    </div> : <p className="portal-empty">Nema rezultata. Probaj naziv predmeta, vežbe ili temu prezentacije.</p>}
    {all.length > results.length && <p className="portal-secondary-note">Prikazano je prvih {results.length} rezultata. Preciziraj pretragu za uži izbor.</p>}
  </>
}

export default function App() {
  const catalogs = useMemo<Catalog[]>(() => courses.map(course => ({ course, files: buildCourseFiles(course) })), [])
  const [route, setRoute] = useState<Route>(readRoute)
  const [query, setQuery] = useState('')
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash
      if (hash && hash !== '#' && !/^#(ers|oib|odp|ibis)(\/|$)/.test(hash)) return
      setRoute(readRoute())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const active = catalogs.find(catalog => catalog.course.id === route.courseId)
  return <div className="portal">
    <a href="#portal-content" className="portal-skip">Preskoči na sadržaj</a>
    <header className="portal-header">
      <div className="portal-header-inner">
        <a className="portal-brand" href="#" onClick={() => setQuery('')}>
          <span className="portal-brand-mark">FTN</span>
          <span className="portal-brand-copy"><strong>Nastavni portal</strong><small>Materijali na jednom mestu</small></span>
        </a>
        <label className="portal-header-search"><SearchIcon/>
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Pretraži vežbe, prezentacije, projekte…" aria-label="Pretraži sve nastavne materijale"/>
          {query && <button type="button" className="portal-clear" aria-label="Obriši pretragu" onClick={() => setQuery('')}>×</button>}
        </label>
        <span className="portal-header-year">2026/2027</span>
      </div>
    </header>
    <main id="portal-content" className="portal-main">
      {query.trim() ? <SearchResults catalogs={catalogs} query={query} onNavigate={() => setQuery('')}/> :
        active ? route.page !== 'materials' ? <CourseReader course={active.course} page={route.page} exercise={route.exercise}/> :
          <CourseMaterials catalog={active}/> : <Home/>}
    </main>
    <footer className="portal-footer"><div className="portal-footer-inner">
      <span>FTN · Materijali za akademsku godinu 2026/2027</span>
      <a href="https://github.com/owlCoder/ftn-nastavni-materijali" target="_blank" rel="noopener noreferrer">Repozitorijum nastavnih materijala ↗</a>
    </div></footer>
  </div>
}
