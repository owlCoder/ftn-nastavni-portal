import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './examples.css'

type PortalTargets = {
  nav: HTMLElement
  panel: HTMLElement
}

type ExampleEntry = {
  path: string
  note: string
  kind: 'solution' | 'code' | 'config' | 'test' | 'eval'
}

type LessonExamples = {
  number: number
  title: string
  summary: string
  zip: string
  entries: ExampleEntry[]
}

type SupplementalExample = {
  exercise: number
  title: string
  description: string
  zip: string
  tags: string[]
}

type CourseKey = 'ers' | 'oib'

const supplementalExamples: SupplementalExample[] = [
  {
    exercise: 2,
    title: 'Logger–Blogger',
    description: 'Primena SOLID principa kroz razdvajanje poslovne logike, evidentiranja događaja i infrastrukturnih odgovornosti.',
    zip: 'Logger-Bloger.zip',
    tags: ['SOLID', 'SRP', 'DIP'],
  },
  {
    exercise: 3,
    title: 'ECommerce',
    description: 'Organizacija domenskog, aplikacionog i infrastrukturnog sloja prema pravilima Clean Architecture.',
    zip: 'E-Commerce.zip',
    tags: ['Clean Architecture', 'Repository', 'Use cases'],
  },
]

const oibExamples: SupplementalExample[] = [
  { exercise: 1, title: 'Identitet i RBAC', description: 'Autentikacija aktera i centralizovana provera dozvola zasnovana na ulogama.', zip: 'oib-vezba-01-identitet-rbac.zip', tags: ['RBAC', 'Identitet', 'Politike'] },
  { exercise: 2, title: 'Resurs i klasifikacija', description: 'Odluka o pristupu na osnovu vlasništva, uloge i klasifikacije podatka.', zip: 'oib-vezba-02-resurs-klasifikacija.zip', tags: ['Autorizacija', 'Resursi', 'Klasifikacija'] },
  { exercise: 3, title: 'Politike i konfiguracija', description: 'Otkrivanje odstupanja aktivne konfiguracije od referentnog bezbednosnog stanja.', zip: 'oib-vezba-03-politike-konfiguracija.zip', tags: ['Referentno stanje', 'Odstupanje', 'Konfiguracija'] },
  { exercise: 4, title: 'Modelovanje pretnji', description: 'Povezivanje imovine, tokova podataka i granica poverenja sa scenarijima pretnji.', zip: 'oib-vezba-04-threat-modeling.zip', tags: ['Imovina', 'Granice poverenja', 'Pretnje'] },
  { exercise: 5, title: 'MFA, sesije i tajne', description: 'Dodatna autentikacija za rizičnu operaciju u okviru aktivne sesije.', zip: 'oib-vezba-05-mfa-sesije-tajne.zip', tags: ['MFA', 'Sesija', 'Dodatna provera'] },
  { exercise: 6, title: 'Detekcija i incident', description: 'Prepoznavanje sumnjivih prijava i formiranje incidenta na osnovu bezbednosnih signala.', zip: 'oib-vezba-06-detekcija-incident.zip', tags: ['Detekcija', 'Signali', 'Incident'] },
  { exercise: 7, title: 'ABAC i procena rizika', description: 'Odluka o pristupu zasnovana na atributima i priprema periodičnog pregleda prava.', zip: 'oib-vezba-07-abac-rizik-pregled.zip', tags: ['ABAC', 'Rizik', 'Pregled pristupa'] },
  { exercise: 8, title: 'Korelacija i efektivnost', description: 'Korelacija događaja i merenje efektivnosti bezbednosne kontrole.', zip: 'oib-vezba-08-korelacija-efektivnost.zip', tags: ['Korelacija', 'Metrike', 'Analiza incidenata'] },
]

const lessons: LessonExamples[] = [
  {
    number: 5,
    title: 'Integracija modula, ugovori i podaci',
    summary: 'Razgraničenje domena, aplikacionog sloja, portova, adaptera i API-ja, uz proveru idempotentnosti zahteva.',
    zip: 'vezba-5-integracija-modula.zip',
    entries: [
      { path: 'EquipmentReservation.sln', note: 'Glavno rešenje za otvaranje primera', kind: 'solution' },
      { path: 'src/EquipmentReservation.Domain/', note: 'Modeli, Result i domenski servis za pravilo zalihe', kind: 'code' },
      { path: 'src/EquipmentReservation.Application/', note: 'Slučajevi upotrebe, validatori i portovi', kind: 'code' },
      { path: 'src/EquipmentReservation.Infrastructure/', note: 'Implementacije portova i infrastrukturni adapteri', kind: 'code' },
      { path: 'src/EquipmentReservation.Api/', note: 'HTTP API kao ulaz u aplikaciju', kind: 'code' },
      { path: 'src/EquipmentReservation.ConsoleUi/', note: 'Jednostavan konzolni interfejs za rad sa primerom', kind: 'code' },
      { path: 'tests/EquipmentReservation.Tests/Application/CreateReservationHandlerTests.cs', note: 'Testovi slučaja upotrebe uz zamenjene portove', kind: 'test' },
      { path: 'tests/EquipmentReservation.Tests/Integration/ReservationFlowTests.cs', note: 'Testovi idempotentnosti i konkurentnih zahteva', kind: 'test' },
    ],
  },
  {
    number: 6,
    title: 'Kontrolisan razvoj uz AI',
    summary: 'Projektna pravila, evidencija odluka i Kova skill-ovi sa jasno podeljenim ulogama i režimima rada.',
    zip: 'vezba-6-ai-workflow.zip',
    entries: [
      { path: '.ai/AI_INSTRUCTIONS.md', note: 'Projektna pravila za AI razvoj', kind: 'config' },
      { path: '.ai/AI_USAGE.md', note: 'Evidencija odluka i provera', kind: 'config' },
      { path: '.kova/skills/architecture-review/SKILL.md', note: 'Analiza uticaja promene u režimu Plan', kind: 'config' },
      { path: '.kova/skills/implement-approved-plan/SKILL.md', note: 'Implementacija usvojenog plana u režimu Manual', kind: 'config' },
      { path: '.kova/skills/review-pull-request/SKILL.md', note: 'Procedura za pregled izmene', kind: 'config' },
    ],
  },
  {
    number: 7,
    title: 'MCP: povezivanje agenata sa projektom',
    summary: 'Ograničen pristup projektnoj dokumentaciji, strukturi izvornog koda, izmenama i rezultatima testova.',
    zip: 'vezba-7-mcp.zip',
    entries: [
      { path: 'src/EquipmentReservation.Mcp/Program.cs', note: 'Pokretanje i konfiguracija MCP servera', kind: 'code' },
      { path: 'src/EquipmentReservation.Mcp/Resources/ProjectResources.cs', note: 'MCP resources', kind: 'code' },
      { path: 'src/EquipmentReservation.Mcp/Tools/ProjectTools.cs', note: 'MCP tools', kind: 'code' },
      { path: 'src/EquipmentReservation.Mcp/Workspace/ProjectPathPolicy.cs', note: 'Pravilo koje putanje server sme da izloži', kind: 'code' },
      { path: 'src/EquipmentReservation.Mcp/Processes/ProjectCommand.cs', note: 'Zatvoren skup dozvoljenih komandi', kind: 'code' },
      { path: '.kova/mcp.json', note: 'Povezivanje Kova agenta sa MCP serverom', kind: 'config' },
    ],
  },
  {
    number: 8,
    title: 'Hooks, guardrails i evaluacije',
    summary: 'Izvršiva pravila za AI alate i evaluacioni scenariji za proveru arhitekture, bezbednosti i kvaliteta rezultata.',
    zip: 'vezba-8-guardrails-evals.zip',
    entries: [
      { path: 'src/EquipmentReservation.Guardrails/Policies/DangerousCommandGuardrail.cs', note: 'Pravilo za opasne komande', kind: 'code' },
      { path: 'src/EquipmentReservation.Guardrails/Policies/SensitiveFileGuardrail.cs', note: 'Pravilo za osetljive fajlove', kind: 'code' },
      { path: 'src/EquipmentReservation.Guardrails/Services/GuardrailEvaluator.cs', note: 'Evaluator izvršivih zaštitnih politika', kind: 'code' },
      { path: 'src/EquipmentReservation.Guardrails/Hosting/GuardrailHook.cs', note: 'Adapter između procesa i zaštitnih politika', kind: 'code' },
      { path: '.vscode/settings.json', note: 'Povezivanje guardrail projekta sa Kova agentom', kind: 'config' },
      { path: '.kova/hooks.json', note: 'Hook-ovi pre i posle izvršenja alata', kind: 'config' },
      { path: 'evals/review-architecture.json', note: 'Provera arhitektonske regresije', kind: 'eval' },
      { path: 'evals/prompt-injection.json', note: 'Scenario za prompt injection', kind: 'eval' },
      { path: 'evals/missing-context.json', note: 'Scenario sa nepotpunim kontekstom', kind: 'eval' },
      { path: 'tests/EquipmentReservation.Tests/Guardrails/GuardrailPolicyTests.cs', note: 'Automatizovane provere zaštitnih politika', kind: 'test' },
    ],
  },
]

const packageKindLabels: Record<ExampleEntry['kind'], string> = {
  solution: 'Rešenje',
  code: 'Izvorni kod',
  config: 'Konfiguracija',
  test: 'Testovi',
  eval: 'Evaluacije',
}

function publicAsset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 6.5h6l1.7 2H20a1.5 1.5 0 0 1 1.5 1.5v7.5A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5V8a1.5 1.5 0 0 1 1-1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function ErsExamplesView() {
  const zipUrl = publicAsset('/downloads/ers-ai-vezbe-5-8.zip')

  return (
    <main className="examples-shell">
      <section className="examples-hero">
        <div className="examples-hero-copy">
          <span className="eyebrow">Nastavni primeri</span>
          <h1>Primeri za vežbe</h1>
          <p>Pripremljeni .NET projekti prate teme obrađene na vežbama i namenjeni su samostalnoj analizi.</p>
          <div className="examples-summary" aria-label="Sadržaj primera">
            <span><strong>6</strong> ZIP paketa</span>
            <span><strong>2–8</strong> vežbe</span>
            <span><strong>.NET</strong> rešenja</span>
          </div>
        </div>
        <a href={zipUrl} download className="examples-hero-download">
          <span className="examples-hero-download-icon"><DownloadIcon /></span>
          <span className="examples-hero-download-copy">
            <small>VEŽBE 5–8</small>
            <strong>Preuzmi komplet</strong>
            <em><b>ZIP</b><span>EquipmentReservation</span></em>
          </span>
          <span className="examples-hero-download-arrow" aria-hidden="true">→</span>
        </a>
      </section>

      <section className="examples-supplemental">
        <div className="examples-section-heading">
          <div>
            <span className="eyebrow">Vežbe 2 i 3</span>
            <h2>Zasebni primeri</h2>
          </div>
          <p>Preuzmite projekat za vežbu koju pratite.</p>
        </div>
        <div className="supplemental-grid">
          {supplementalExamples.map((example) => (
            <article className="supplemental-card" key={example.title}>
              <div className="supplemental-card-topline">
                <span className="supplemental-exercise">Vežba {example.exercise}</span>
                <span className="supplemental-format">ZIP</span>
              </div>
              <h3>{example.title}</h3>
              <p>{example.description}</p>
              <div className="supplemental-tags">
                {example.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a className="supplemental-download" href={publicAsset(`/${example.zip}`)} download>
                <DownloadIcon />
                <span>Preuzmi primer</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="examples-card">
        <div className="examples-project-heading">
          <div>
            <span className="eyebrow">Vežbe 5–8</span>
            <h2>EquipmentReservation</h2>
          <p>Isti projekat se proširuje kroz četiri vežbe, uz očuvanje zajedničke arhitekture i skupa testova.</p>
          </div>
          <a href={zipUrl} download className="examples-project-download">
            <span className="examples-project-download-icon"><DownloadIcon /></span>
            <span><strong>Preuzmi ceo projekat</strong><small>Vežbe 5–8 · ZIP paket</small></span>
          </a>
        </div>

        <div className="examples-course-grid" aria-label="Primeri po vežbama">
          {lessons.map((lesson) => {
            const lessonZipUrl = publicAsset(`/downloads/${lesson.zip}`)
            const packageKinds = [...new Set(lesson.entries.map((entry) => entry.kind))]
            return (
              <article className="examples-course-card" key={lesson.number}>
                <div className="examples-course-card-topline">
                  <span>Vežba {lesson.number}</span>
                  <span>ZIP</span>
                </div>
                <span className="examples-course-icon"><FolderIcon /></span>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <div className="examples-course-tags" aria-label="Sadržaj paketa">
                  {packageKinds.map((kind) => <span key={kind}>{packageKindLabels[kind]}</span>)}
                </div>
                <a className="examples-course-download" href={lessonZipUrl} download>
                  <DownloadIcon />
                  <span>Preuzmi vežbu {lesson.number}</span>
                </a>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function OibExamplesView() {
  const zipUrl = publicAsset('/downloads/oib-svi-primeri.zip')

  return (
    <main className="examples-shell examples-shell-oib">
      <section className="examples-hero">
        <div className="examples-hero-copy">
          <span className="eyebrow">C# / .NET 8</span>
          <h1>Primeri iz informacione bezbednosti</h1>
          <p>Svaku vežbu prati samostalno .NET rešenje sa razdvojenim slojevima, testovima i uputstvom za pokretanje.</p>
          <div className="examples-summary" aria-label="Sadržaj primera">
            <span><strong>8</strong> ZIP paketa</span>
            <span><strong>1–8</strong> vežbe</span>
            <span><strong>.NET 8</strong> rešenja sa testovima</span>
          </div>
        </div>
        <a href={zipUrl} download className="examples-hero-download">
          <span className="examples-hero-download-icon"><DownloadIcon /></span>
          <span className="examples-hero-download-copy">
            <small>SVI PRIMERI</small>
            <strong>Preuzmi komplet</strong>
            <em><b>ZIP</b><span>Vežbe 1–8</span></em>
          </span>
          <span className="examples-hero-download-arrow" aria-hidden="true">→</span>
        </a>
      </section>

      <section className="examples-card">
        <div className="examples-project-heading">
          <div>
            <span className="eyebrow">Primeri po vežbama</span>
            <h2>Primeri po temama</h2>
            <p>Paketi su međusobno nezavisni: svaki ima sopstveni solution, testove i uputstvo za pokretanje.</p>
          </div>
        </div>
        <div className="examples-course-grid" aria-label="OIB primeri po vežbama">
          {oibExamples.map((example) => (
            <article className="examples-course-card" key={example.exercise}>
              <div className="examples-course-card-topline">
                <span>Vežba {example.exercise}</span>
                <span>ZIP</span>
              </div>
              <span className="examples-course-icon"><FolderIcon /></span>
              <h3>{example.title}</h3>
              <p>{example.description}</p>
              <div className="examples-course-tags">
                {example.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a className="examples-course-download" href={publicAsset(`/downloads/${example.zip}`)} download>
                <DownloadIcon />
                <span>Preuzmi vežbu {example.exercise}</span>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default function ExamplesEnhancer() {
  const [targets, setTargets] = useState<PortalTargets | null>(null)
  const getCourse = (): CourseKey | null => window.location.hash.startsWith('#ers') ? 'ers' : window.location.hash.startsWith('#oib') ? 'oib' : null
  const [course, setCourse] = useState<CourseKey | null>(() => getCourse())
  const [active, setActive] = useState(() => /#(?:ers|oib)\/primeri/.test(window.location.hash))

  useEffect(() => {
    const syncTargets = () => {
      const nextCourse = getCourse()
      const nav = document.querySelector<HTMLElement>('.site-header .document-switcher')
      const panel = document.querySelector<HTMLElement>('.site-shell .tab-panel')

      if (!nextCourse || !nav || !panel) {
        setTargets(null)
        setCourse(null)
        setActive(false)
        return
      }

      setCourse(nextCourse)
      setTargets((current) => current?.nav === nav && current.panel === panel ? current : { nav, panel })
      setActive(window.location.hash.startsWith(`#${nextCourse}/primeri`))
    }

    syncTargets()
    const observer = new MutationObserver(syncTargets)
    observer.observe(document.body, { childList: true, subtree: true })

    const handleDocumentClick = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null
      const navButton = element?.closest('.document-switcher button')
      if (navButton && !navButton.classList.contains('examples-tab-button')) setActive(false)
    }

    const handleLocationChange = () => {
      const nextCourse = getCourse()
      setCourse(nextCourse)
      setActive(Boolean(nextCourse && window.location.hash.startsWith(`#${nextCourse}/primeri`)))
      syncTargets()
    }

    document.addEventListener('click', handleDocumentClick)
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', handleDocumentClick)
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  useEffect(() => {
    if (!targets) return
    targets.panel.classList.toggle('examples-tab-active', active)
    targets.nav.classList.toggle('examples-tab-active', active)
    if (active) {
      targets.nav.querySelectorAll('button.active:not(.examples-tab-button)').forEach((button) => button.classList.remove('active'))
      document.title = `${course?.toUpperCase()} — Primeri`
    } else if (course && window.location.hash.startsWith(`#${course}/prezentacije`)) {
      document.title = `${course.toUpperCase()} — Prezentacije`
    } else if (course && window.location.hash.startsWith(`#${course}/kontrolne-tacke`)) {
      document.title = `${course.toUpperCase()} — Kontrolne tačke`
    } else if (course && window.location.hash.startsWith(`#${course}/praktikum`)) {
      document.title = `${course.toUpperCase()} — Praktikum`
    }
    return () => {
      targets.panel.classList.remove('examples-tab-active')
      targets.nav.classList.remove('examples-tab-active')
    }
  }, [active, course, targets])

  const button = useMemo(() => (
    <button
      className={`examples-tab-button ${active ? 'active' : ''}`}
      aria-label="Primeri"
      onClick={() => {
        if (!course) return
        setActive(true)
        history.replaceState(null, '', `#${course}/primeri`)
        document.title = `${course.toUpperCase()} — Primeri`
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 6.5h6l1.6 2H20v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>Primeri</span>
    </button>
  ), [active, course])

  if (!targets) return null

  return (
    <>
      {createPortal(button, targets.nav)}
      {active && createPortal(course === 'oib' ? <OibExamplesView /> : <ErsExamplesView />, targets.panel)}
    </>
  )
}
