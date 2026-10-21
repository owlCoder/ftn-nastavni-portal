import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { courses } from './courses'
import type { Course, CourseId } from './courses/types'
import { buildCourseFiles, type CourseFile } from './components/courseFileTree'
import { PracticumDocument } from './components/document/PracticumDocument'
import { assetUrl } from './lib/assets'

type Section = 'vezbe' | 'prezentacije' | 'primeri' | 'projekat' | 'uputstva'
type Reader = 'praktikum' | 'kontrolne'
type Route = { courseId: CourseId | null; section: Section | Reader; exercise?: number }
type Catalog = { course: Course; files: CourseFile[] }
type Material = { course: Course; file: CourseFile; category: 'PDF' | 'ZIP' | 'Tekst' }
type SearchFilter = 'Sve' | Material['category']

const tones: Record<CourseId, string> = {
  ers: '#456fc4',
  oib: '#c35e6c',
  odp: '#26947e',
  ibis: '#bf8646',
}

const sections: { id: Section; label: string }[] = [
  { id: 'vezbe', label: 'Vežbe' },
  { id: 'prezentacije', label: 'Prezentacije' },
  { id: 'primeri', label: 'Primeri koda' },
  { id: 'projekat', label: 'Projekat' },
  { id: 'uputstva', label: 'Uputstva' },
]

function courseStyle(id: CourseId): CSSProperties {
  return { '--course-color': tones[id] } as CSSProperties
}

function dataFor(course: Course): Catalog {
  return { course, files: buildCourseFiles(course) }
}

function getSections(catalog: Catalog): Section[] {
  const { files } = catalog
  return sections.map(section => section.id).filter(section => {
    if (section === 'vezbe') return files.some(file => file.kind === 'folder' && file.parent === 'vezbe')
    if (section === 'prezentacije') return files.some(file => file.kind === 'pdf' && file.presentationNumber !== undefined)
    if (section === 'primeri') return files.some(file => file.kind === 'zip' && file.id.endsWith('/primer'))
    if (section === 'projekat') return files.some(file => file.parent === 'projekat') || catalog.course.checkpoints.length > 0
    return files.some(file => file.parent === 'uputstva')
  })
}

const sectionIcons: Record<Section, 'layers' | 'file' | 'code' | 'folder' | 'book'> = {
  vezbe: 'layers',
  prezentacije: 'file',
  primeri: 'code',
  projekat: 'folder',
  uputstva: 'book',
}

function sectionCount({ course, files }: Catalog, section: Section): number {
  if (section === 'vezbe') return files.filter(file => file.kind === 'folder' && file.parent === 'vezbe').length
  if (section === 'prezentacije') return files.filter(file => file.presentationNumber !== undefined).length
  if (section === 'primeri') return files.filter(file => file.kind === 'zip' && file.id.endsWith('/primer')).length
  if (section === 'projekat') return files.filter(file => file.parent === 'projekat' && file.kind === 'pdf').length + Number(course.checkpoints.length > 0)
  return files.filter(file => file.parent === 'uputstva' && file.kind === 'pdf').length
}

function readRoute(): Route {
  const match = window.location.hash.match(/^#(ers|oib|odp|ibis)(?:\/(vezbe|prezentacije|primeri|projekat|uputstva|praktikum|kontrolne)(?:\/(\d{1,2}))?)?$/)
  if (!match) return { courseId: null, section: 'vezbe' }
  const courseId = match[1] as CourseId
  const section = (match[2] as Route['section'] | undefined) ?? (courseId === 'ibis' ? 'prezentacije' : 'vezbe')
  return { courseId, section, exercise: match[3] ? Number(match[3]) : undefined }
}

function path(courseId: CourseId, section?: Section | Reader, exercise?: number) {
  return '#' + courseId + (section ? '/' + section : '') + (exercise ? '/' + String(exercise).padStart(2, '0') : '')
}

function normalize(value: string) {
  return value.toLocaleLowerCase('sr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

function routeForFile(course: Course, file: CourseFile) {
  if (file.source) return assetUrl(file.source)
  if (file.kind === 'practicum-link') return path(course.id, 'praktikum', file.exercise)
  if (file.kind === 'practicum') return path(course.id, 'praktikum')
  if (file.kind === 'checkpoints') return path(course.id, 'kontrolne')
  return path(course.id)
}

function materialType(file: CourseFile): Material['category'] {
  return file.kind === 'pdf' ? 'PDF' : file.kind === 'zip' ? 'ZIP' : 'Tekst'
}

function Icon({ name, size = 20 }: { name: 'search' | 'arrow' | 'external' | 'download' | 'book' | 'layers' | 'code' | 'file' | 'folder' | 'close' | 'chevron' | 'grid' | 'keyboard'; size?: number }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const graphic = {
    search: <><circle cx="10.6" cy="10.6" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    arrow: <><path d="M4 12h16m-7-7 7 7-7 7"/></>,
    external: <><path d="M13 5h6v6m0-6-9 9"/><path d="M19 13v6H5V5h6"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v3h16v-3"/></>,
    book: <><path d="M12 6c-3.2-2-6.6-2-10-1v14c3.4-1 6.8-1 10 1 3.2-2 6.6-2 10-1V5c-3.4-1-6.8-1-10 1Z"/><path d="M12 6v14"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    code: <><path d="m8 7-5 5 5 5m8-10 5 5-5 5M14 4l-4 16"/></>,
    file: <><path d="M6 2h8l5 5v15H6V2Z"/><path d="M14 2v6h5M9 13h7m-7 4h7"/></>,
    folder: <path d="M3 7V5h7l2 3h9v12H3V7Z"/>,
    close: <path d="m5 5 14 14M19 5 5 19"/>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    keyboard: <><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 10h2m3 0h2m3 0h2M6 14h2m3 0h7"/></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} {...common}>{graphic[name]}</svg>
}

function LinkAction({ course, file, primary = false, children, onNavigate }: {
  course: Course; file: CourseFile; primary?: boolean; children?: ReactNode; onNavigate?: () => void
}) {
  const category = materialType(file)
  const isDownload = category === 'ZIP'
  const isExternal = category === 'PDF'
  return <a className={'ui-button ' + (primary ? 'ui-button-primary' : 'ui-button-quiet')}
    href={routeForFile(course, file)}
    target={isExternal ? '_blank' : undefined}
    rel={isExternal ? 'noopener noreferrer' : undefined}
    download={isDownload ? '' : undefined}
    onClick={!file.source ? onNavigate : undefined}>
    {children ?? (isDownload ? 'Preuzmi' : isExternal ? 'Otvori PDF' : 'Pročitaj')}
    <Icon name={isDownload ? 'download' : isExternal ? 'external' : 'arrow'} size={15}/>
  </a>
}

function ResourceRow({ course, file, onNavigate }: { course: Course; file: CourseFile; onNavigate?: () => void }) {
  const category = materialType(file)
  return <article className="resource-row">
    <span className={'resource-icon resource-icon-' + category.toLowerCase()}><Icon name={category === 'ZIP' ? 'code' : category === 'PDF' ? 'file' : 'book'} size={19}/></span>
    <div className="resource-details">
      <div className="resource-kicker">{category === 'Tekst' ? 'Online' : category}
        {file.presentationNumber !== undefined && <span> · {Number(file.presentationNumber) === 0 ? 'Uvodna' : 'Prezentacija ' + file.presentationNumber}</span>}
      </div>
      <strong>{file.name.replace(/\.(pdf|zip)$/i, '')}</strong>
      <p>{file.description || 'Nastavni materijal'}{file.pages ? ' · ' + file.pages + ' strana' : ''}{file.size ? ' · ' + file.size : ''}</p>
    </div>
    <LinkAction course={course} file={file} onNavigate={onNavigate}/>
  </article>
}

function PageHeading({ eyebrow, title, description, count, extra }: {
  eyebrow: string; title: string; description: string; count?: number; extra?: React.ReactNode
}) {
  return <header className="section-heading">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}{count !== undefined && <span className="heading-count">{count}</span>}</h2>
      <p>{description}</p>
    </div>
    {extra && <div className="heading-extra">{extra}</div>}
  </header>
}

function Home({ catalogs, onSelect }: { catalogs: Catalog[]; onSelect: () => void }) {
  const totalSlides = catalogs.reduce((sum, item) => sum + item.files.filter(file => file.presentationNumber !== undefined).length, 0)
  return <div className="home-page">
    <section className="home-hero">
      <div className="home-hero-copy">
        <span className="eyebrow"><span className="live-dot"/> NASTAVNI PORTAL · FTN</span>
        <h1>Nastavni materijali<br/><span>po predmetima.</span></h1>
        <p>Prezentacije, praktikumi, primeri programskog koda i projektna dokumentacija za predmete obuhvaćene portalom.</p>
        <a href="#predmeti" className="hero-button" onClick={event => {
          event.preventDefault()
          document.getElementById('predmeti')?.scrollIntoView({ behavior: 'smooth' })
        }}>Pregled predmeta <Icon name="arrow" size={19}/></a>
      </div>
      <div className="home-hero-panel" aria-label="Pregled kataloga">
        <div className="hero-panel-top"><span>PREGLED SADRŽAJA</span><Icon name="layers" size={19}/></div>
        <div className="hero-stat"><strong>{catalogs.length.toString().padStart(2, '0')}</strong><span>predmeta</span></div>
        <div className="hero-panel-line"/>
        <div className="hero-stat small"><strong>{totalSlides}</strong><span>PDF prezentacija</span></div>
        <div className="hero-panel-note"><span className="live-dot"/> Pristup materijalima bez prijave</div>
      </div>
    </section>

    <section className="home-courses" id="predmeti">
      <div className="home-heading"><div><span className="eyebrow">PREDMETI</span><h2>Nastavni predmeti</h2></div><p>Izaberite predmet za pregled vežbi, prezentacija i projektne dokumentacije.</p></div>
      <div className="course-grid">{catalogs.map(({ course, files }, index) => {
        const exercises = files.filter(file => file.kind === 'folder' && file.parent === 'vezbe').length
        const presentations = files.filter(file => file.presentationNumber !== undefined).length
        return <a key={course.id} href={path(course.id)} className="course-card" style={courseStyle(course.id)} onClick={onSelect}>
          <div className="course-card-top"><span className="course-card-icon">{course.code.slice(0, 1)}</span><span className="course-card-number">0{index + 1} / 04</span></div>
          <span className="course-card-code">{course.code}</span>
          <h3>{course.name}</h3>
          <div className="course-card-bottom"><span>{course.studyLevel === 'master' ? 'Master studije' : course.semester === 'letnji' ? 'Letnji semestar' : 'Zimski semestar'}</span><span>{exercises ? exercises + ' vežbi' : presentations + ' prezentacije'}</span><span className="course-card-go"><Icon name="arrow" size={18}/></span></div>
        </a>
      })}</div>
    </section>
    <div className="home-help"><Icon name="search" size={19}/><span>Pretraga u zaglavlju omogućava pronalaženje materijala iz svih predmeta.</span></div>
  </div>
}

function CourseSidebar({ catalog, active }: { catalog: Catalog; active: Section }) {
  const { course } = catalog
  const available = getSections(catalog)
  return <aside className="course-sidebar">
    <a className="back-link" href="#"><span>←</span> Svi predmeti</a>
    <div className="sidebar-label">PREDMETI</div>
    <nav className="sidebar-courses" aria-label="Promeni predmet">{courses.map(item =>
      <a key={item.id} href={path(item.id)} className={'sidebar-course' + (item.id === course.id ? ' is-active' : '')} style={courseStyle(item.id)}
        aria-current={item.id === course.id ? 'page' : undefined}>
        <span className="sidebar-course-mark">{item.code.slice(0, 1)}</span>
        <span><strong>{item.code}</strong><small>{item.name}</small></span>
      </a>
    )}</nav>
    <div className="sidebar-divider"/>
    <div className="sidebar-label">MATERIJALI PREDMETA</div>
    <nav className="sidebar-sections" aria-label="Sekcije predmeta">{sections.filter(item => available.includes(item.id)).map(section =>
      <a key={section.id} href={path(course.id, section.id)} className={'sidebar-section' + (active === section.id ? ' is-active' : '')} aria-current={active === section.id ? 'page' : undefined}>
        {section.label}<Icon name="chevron" size={15}/>
      </a>
    )}</nav>
    <div className="sidebar-note"><Icon name="book" size={20}/><span>Pristup i preuzimanje nastavnih materijala ne zahtevaju prijavljivanje.</span></div>
  </aside>
}

function CourseHero({ catalog }: { catalog: Catalog }) {
  const { course, files } = catalog
  const exerciseCount = files.filter(file => file.kind === 'folder' && file.parent === 'vezbe').length
  const slideCount = files.filter(file => file.presentationNumber !== undefined).length
  const practicum = files.find(file => file.kind === 'practicum')
  const bundle = files.find(file => file.bundle && file.id === 'paketi/prezentacije')
  const project = files.find(file => file.parent === 'projekat' && file.kind === 'pdf')
  return <section className="subject-hero" style={courseStyle(course.id)}>
    <div className="subject-hero-meta"><span className="subject-pill">{course.code}</span><span>{course.academicYear}</span><span>·</span><span>{course.studyLevel === 'master' ? 'Master akademske studije' : course.semester === 'letnji' ? 'Letnji semestar' : 'Zimski semestar'}</span></div>
    <h1>{course.name}</h1>
    <p>{course.blurb}</p>
    <div className="subject-hero-bottom">
      <div className="subject-stats">
        {exerciseCount > 0 && <span><strong>{exerciseCount}</strong> vežbi</span>}
        <span><strong>{slideCount}</strong> prezentacija</span>
      </div>
      <div className="subject-shortcuts">
        {practicum && <a href={path(course.id, 'praktikum')}><Icon name="book" size={17}/> Praktikum <Icon name="arrow" size={14}/></a>}
        {bundle?.source && <a href={assetUrl(bundle.source)} download><Icon name="download" size={17}/> Preuzmi prezentacije</a>}
        {!practicum && project && <a href={routeForFile(course, project)} target="_blank" rel="noopener noreferrer"><Icon name="file" size={17}/> Specifikacija <Icon name="external" size={14}/></a>}
      </div>
    </div>
  </section>
}

function ExerciseList({ catalog }: { catalog: Catalog }) {
  const { course, files } = catalog
  const lessons = files.filter(file => file.kind === 'folder' && file.parent === 'vezbe')
  return <>
    <PageHeading eyebrow="MATERIJALI / VEŽBE" title="Računarske vežbe" description="Prezentacije, tekstovi zadataka i programski primeri raspoređeni po vežbama." count={lessons.length}/>
    <div className="exercise-list">{lessons.map(lesson => {
      const number = Number(lesson.id.split('/').at(-1))
      const children = files.filter(file => file.parent === lesson.id)
      const slide = children.find(file => file.kind === 'pdf')
      const example = children.find(file => file.kind === 'zip')
      const text = children.find(file => file.kind === 'practicum-link')
      return <article className="exercise-row" key={lesson.id}>
        <span className="exercise-number">{String(number).padStart(2, '0')}</span>
        <div className="exercise-content">
          <span className="exercise-label">VEŽBA {String(number).padStart(2, '0')}</span>
          <h3>{lesson.description || lesson.name}</h3>
          <div className="exercise-actions">
            {slide && <LinkAction course={course} file={slide} primary>Prezentacija</LinkAction>}
            {text && <LinkAction course={course} file={text}>Tekst vežbe</LinkAction>}
            {example && <LinkAction course={course} file={example}>Primer koda</LinkAction>}
          </div>
        </div>
      </article>
    })}</div>
    <div className="tip"><Icon name="book" size={18}/><span>Tekstovi svih vežbi dostupni su u okviru praktikuma. <a href={path(course.id, 'praktikum')}>Pregledaj praktikum →</a></span></div>
  </>
}

function FileCollection({ catalog, section }: { catalog: Catalog; section: Exclude<Section, 'vezbe'> }) {
  const { course, files } = catalog
  const slides = files.filter(file => file.kind === 'pdf' && file.presentationNumber !== undefined)
    .sort((a, b) => Number(a.presentationNumber) - Number(b.presentationNumber))
  const examples = files.filter(file => file.kind === 'zip' && file.id.endsWith('/primer'))
  const project = files.filter(file => file.parent === 'projekat' && file.kind === 'pdf')
  const guides = files.filter(file => file.parent === 'uputstva' && file.kind === 'pdf')
  const collection = section === 'prezentacije' ? slides : section === 'primeri' ? examples : section === 'projekat' ? project : guides
  const config = {
    prezentacije: { title: 'Prezentacije', description: 'Prezentacije u PDF formatu, raspoređene prema redosledu predavanja i vežbi.' },
    primeri: { title: 'Programski primeri', description: 'ZIP arhive sa izvornim kodom i primerima za vežbe.' },
    projekat: { title: course.projects?.length ? 'Projektna dokumentacija' : 'Projekat', description: 'Projektne specifikacije, pravila ocenjivanja i kontrolne tačke.' },
    uputstva: { title: 'Uputstva', description: 'Uputstva za korišćenje platformi koje se koriste u nastavi.' },
  }[section]
  const extras = section === 'projekat' && course.checkpoints.length > 0 ? 1 : 0
  const bundle = section === 'prezentacije' ? files.find(file => file.id === 'paketi/prezentacije') :
    section === 'primeri' ? files.find(file => file.id === 'paketi/primeri') : undefined
  return <>
    <PageHeading eyebrow={'MATERIJALI / ' + config.title.toUpperCase()} title={config.title} description={config.description}
      count={collection.length + extras}
      extra={bundle?.source ? <a className="ui-button ui-button-primary" href={assetUrl(bundle.source)} download><Icon name="download" size={16}/> Preuzmi sve</a> : undefined}/>
    <div className="resource-list">
      {collection.map(file => <ResourceRow course={course} file={file} key={file.id}/>)}
      {section === 'projekat' && extras > 0 && <ResourceRow course={course} file={{
        id: 'kontrolne', parent: 'projekat', kind: 'checkpoints', name: 'Kontrolne tačke',
        description: 'Etape, datumi i obaveze za projektni rad.',
      }}/>}
    </div>
    {collection.length === 0 && extras === 0 && <div className="empty-state">Za izabranu kategoriju trenutno nema objavljenih materijala.</div>}
  </>
}

function CoursePage({ catalog, section }: { catalog: Catalog; section: Section }) {
  const available = getSections(catalog)
  const active = available.includes(section) ? section : available[0] ?? 'uputstva'
  const tabsRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const tabs = tabsRef.current
    const current = tabs?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!tabs || !current || tabs.scrollWidth <= tabs.clientWidth) return
    tabs.scrollTo({ left: current.offsetLeft - (tabs.clientWidth - current.offsetWidth) / 2, behavior: 'auto' })
  }, [active, catalog.course.id])

  return <div className="course-layout">
    <CourseSidebar catalog={catalog} active={active}/>
    <div className="course-content">
      <div className="mobile-breadcrumb"><a href="#">← Svi predmeti</a><span>/ {catalog.course.code}</span></div>
      <CourseHero catalog={catalog}/>
      <div className="course-tabs-shell">
        <nav ref={tabsRef} className="course-tabs" aria-label="Vrsta materijala">{sections.filter(item => available.includes(item.id)).map(item =>
          <a key={item.id} href={path(catalog.course.id, item.id)}
            className={'course-tab' + (active === item.id ? ' is-active' : '')}
            aria-current={active === item.id ? 'page' : undefined}>
            <Icon name={sectionIcons[item.id]} size={16}/>
            <span className="course-tab-label">{item.label}</span>
            <span className="course-tab-count" aria-hidden="true">{sectionCount(catalog, item.id)}</span>
          </a>
        )}</nav>
      </div>
      <div className="course-panel">{active === 'vezbe' ? <ExerciseList catalog={catalog}/> : <FileCollection catalog={catalog} section={active}/>}</div>
    </div>
  </div>
}

function ReaderPage({ catalog, section, exercise }: { catalog: Catalog; section: Reader; exercise?: number }) {
  const { course, files } = catalog
  const anchor = exercise ? files.find(file => file.kind === 'practicum-link' && file.exercise === exercise)?.anchor : undefined
  return <div className="reader-page">
    <div className="reader-top"><a href={path(course.id)} className="back-link">← Nazad na {course.code}</a><span>{course.name}</span></div>
    {section === 'praktikum' ? <>
      <div className="reader-title"><span className="eyebrow">{course.code} / PRAKTIKUM</span><h1>{exercise ? 'Vežba ' + String(exercise).padStart(2, '0') : 'Praktikum'}</h1>
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

function SearchPage({ catalogs, query, filter, setFilter, selectedCourse, setSelectedCourse, onNavigate }: {
  catalogs: Catalog[]; query: string; filter: SearchFilter; setFilter: (value: SearchFilter) => void;
  selectedCourse: CourseId | 'all'; setSelectedCourse: (value: CourseId | 'all') => void; onNavigate: () => void
}) {
  const words = normalize(query).split(' ').filter(Boolean)
  const matches = catalogs.flatMap(({ course, files }) => files.filter(file => file.kind !== 'folder').map(file => {
    const number = file.exercise ?? Number(file.id.match(/^vezbe\/(\d+)/)?.[1] ?? file.presentationNumber ?? 0)
    const searchable = [
      course.code, course.name, file.name, file.description ?? '', file.parent,
      number ? 'vezba ' + number + ' vezba ' + String(number).padStart(2, '0') : '',
      materialType(file) === 'ZIP' ? 'primer kod preuzmi' : '',
      file.kind === 'practicum-link' ? 'zadatak praktikum' : '',
    ].join(' ')
    return { course, file, category: materialType(file), words: normalize(searchable) } as Material & { words: string }
  })).filter(item => words.every(word => item.words.includes(word)))
  const filtered = matches.filter(item => (filter === 'Sve' || item.category === filter) && (selectedCourse === 'all' || item.course.id === selectedCourse))
  return <div className="search-page">
    <a href="#" className="back-link" onClick={onNavigate}>← Nazad na predmete</a>
    <div className="search-heading"><span className="eyebrow">PRETRAGA KATALOGA</span><h1>Rezultati pretrage</h1><p>Za upit „{query.trim()}” pronađeno je {filtered.length} {filtered.length === 1 ? 'stavka' : 'stavki'}.</p></div>
    <div className="search-filters">
      <div className="filter-tabs" role="group" aria-label="Tip materijala">{(['Sve', 'PDF', 'ZIP', 'Tekst'] as SearchFilter[]).map(item =>
        <button type="button" key={item} className={filter === item ? 'is-active' : ''} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>
      )}</div>
      <label className="filter-course-label">Predmet <select value={selectedCourse} onChange={event => setSelectedCourse(event.target.value as CourseId | 'all')}>
        <option value="all">Svi predmeti</option>
        {courses.map(course => <option value={course.id} key={course.id}>{course.code}</option>)}
      </select></label>
    </div>
    {filtered.length > 0 ? <div className="search-results" aria-live="polite">
      {filtered.slice(0, 80).map(({ course, file }) => <div className="search-result" key={course.id + '/' + file.id}>
        <div className="search-result-course" style={courseStyle(course.id)}><span>{course.code}</span></div>
        <div className="search-result-content"><span className="resource-kicker">{materialType(file)} · {course.name}</span>
          <strong>{file.name.replace(/\.(pdf|zip)$/i, '')}</strong><p>{file.description || 'Nastavni materijal'}</p>
        </div>
        <LinkAction course={course} file={file} onNavigate={onNavigate}/>
      </div>)}
      {filtered.length > 80 && <p className="search-more">Prikazano je prvih 80 rezultata. Precizirajte upit za uži izbor.</p>}
    </div> : <div className="empty-state"><Icon name="search" size={27}/><h2>Nema rezultata</h2><p>Nema dokumenata koji odgovaraju upitu. Izmenite ključne reči ili filtere pretrage.</p>
      {(filter !== 'Sve' || selectedCourse !== 'all') && <button className="ui-button ui-button-quiet" onClick={() => { setFilter('Sve'); setSelectedCourse('all') }}>Ukloni filtere</button>}</div>}
  </div>
}

export default function App() {
  const catalogs = useMemo(() => courses.map(dataFor), [])
  const [route, setRoute] = useState<Route>(readRoute)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SearchFilter>('Sve')
  const [selectedCourse, setSelectedCourse] = useState<CourseId | 'all'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const resetSearch = () => { setQuery(''); setFilter('Sve'); setSelectedCourse('all') }

  useEffect(() => {
    const update = () => {
      if (window.location.hash && window.location.hash !== '#' && !/^#(ers|oib|odp|ibis)(\/|$)/.test(window.location.hash)) return
      setRoute(readRoute())
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || (target instanceof HTMLElement && target.isContentEditable)
      if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault()
        inputRef.current?.focus()
      }
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        resetSearch()
        inputRef.current?.blur()
      }
    }
    window.addEventListener('hashchange', update)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('keydown', onKey) }
  }, [])

  const current = catalogs.find(catalog => catalog.course.id === route.courseId)
  const reading = route.section === 'praktikum' || route.section === 'kontrolne'
  return <div className="portal">
    <a href="#content" className="skip-link" onClick={event => {
      event.preventDefault()
      document.getElementById('content')?.focus()
    }}>Preskoči na sadržaj</a>
    <header className="site-topbar">
      <div className="topbar-inner">
        <a href="#" className="site-logo" onClick={resetSearch} aria-label="Nastavni portal, početna">
          <span className="logo-emblem"><span>F</span><span>T</span><span>N</span></span>
          <span className="logo-text"><strong>Nastavni portal</strong><small>Fakultet tehničkih nauka</small></span>
        </a>
        <div className="topbar-search">
          <Icon name="search" size={20}/>
          <input ref={inputRef} type="search" value={query} onChange={event => {
            setQuery(event.target.value); setFilter('Sve'); setSelectedCourse('all')
          }} placeholder="Pretraži sve materijale..." aria-label="Pretraži nastavne materijale" autoComplete="off"/>
          {query ? <button type="button" onClick={resetSearch} aria-label="Obriši pretragu" className="search-clear"><Icon name="close" size={17}/></button>
            : <span className="search-shortcut" aria-hidden="true">/</span>}
        </div>
        <a href="#" className="topbar-catalog" onClick={resetSearch}><Icon name="grid" size={17}/><span>Predmeti</span></a>
      </div>
    </header>
    <main id="content" tabIndex={-1} className="site-content">
      {query.trim() ? <SearchPage catalogs={catalogs} query={query} filter={filter} setFilter={setFilter}
        selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} onNavigate={resetSearch}/> :
        current ? reading ? <ReaderPage catalog={current} section={route.section as Reader} exercise={route.exercise}/> :
          <CoursePage catalog={current} section={route.section as Section}/> :
          <Home catalogs={catalogs} onSelect={resetSearch}/>}
    </main>
    <footer className="site-footer"><div><span>FTN · Nastavni portal <span className="footer-year">2026/2027</span></span>
      <a href="https://github.com/owlCoder/ftn-nastavni-materijali" target="_blank" rel="noopener noreferrer">Izvorni nastavni materijali <Icon name="external" size={13}/></a></div></footer>
  </div>
}
