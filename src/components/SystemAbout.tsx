import { courses } from '../courses'
import { assetUrl } from '../lib/assets'
import type { CourseId } from '../courses/types'

type Specification = { label: string; value: string; detail: string }

const specifications: Specification[] = [
  { label: 'Procesor', value: 'AMD Ryzen™ 9 9950X3D', detail: '16 jezgara · 32 niti · Zen 5' },
  { label: 'Grafika', value: 'NVIDIA GeForce RTX™ 5090', detail: '32 GB GDDR7 · Blackwell' },
  { label: 'Memorija', value: '128 GB DDR5', detail: 'Radna memorija · demonstracioni profil' },
  { label: 'Skladište', value: '4 TB NVMe SSD', detail: 'Brzi SSD · demonstracioni profil' },
]

function SystemMark() {
  return <svg viewBox="0 0 88 88" aria-hidden="true" className="gn-about-system-mark">
    <defs><linearGradient id="ftnAboutGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#99c1f1"/><stop offset="1" stopColor="#613fa6"/></linearGradient></defs>
    <rect width="88" height="88" rx="23" fill="url(#ftnAboutGradient)"/>
    <path d="M23 57V32h29M23 44h22M53 30l13 14-13 14M52 44H31" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="68" cy="22" r="5" fill="#f3d17d"/>
  </svg>
}

export function SystemAbout({ onOpenCourse }: { onOpenCourse: (id: CourseId) => void }) {
  return <article className="gn-about">
    <header className="gn-about-heading">
      <SystemMark/>
      <span className="gn-about-eyebrow">FTN DESKTOP · O SISTEMU</span>
      <h1>FTN OS</h1>
      <p>GNOME 51-inspired desktop za nastavne materijale.</p>
      <span className="gn-about-version">Desktop Experience · 2.0</span>
    </header>

    <section className="gn-about-section">
      <div className="gn-about-section-head"><h2>Demonstraciona radna stanica</h2><span className="gn-about-demo">SIMULIRANE SPECIFIKACIJE</span></div>
      <p className="gn-about-intro">Zamišljeni high-end sistemski profil za ovaj web desktop. Ove vrednosti nisu očitane sa tvog računara.</p>
      <div className="gn-about-hardware">
        <div className="gn-about-hardware-card gn-about-amd">
          <div className="gn-about-brand"><img src={assetUrl('/brand/amd.svg')} alt="AMD" /></div>
          <span className="gn-about-hardware-label">PROCESOR</span>
          <strong>Ryzen™ 9 9950X3D</strong>
          <span>16 cores · 32 threads · Zen 5</span>
        </div>
        <div className="gn-about-hardware-card gn-about-nvidia">
          <div className="gn-about-brand"><img src={assetUrl('/brand/nvidia.svg')} alt="NVIDIA" /></div>
          <span className="gn-about-hardware-label">GRAFIČKA KARTICA</span>
          <strong>GeForce RTX™ 5090</strong>
          <span>32 GB GDDR7 · Blackwell</span>
        </div>
      </div>
      <div className="gn-about-specs" aria-label="Specifikacije demonstracionog sistema">
        {specifications.map(spec=><div className="gn-about-spec-row" key={spec.label}>
          <span>{spec.label}</span>
          <div><strong>{spec.value}</strong><small>{spec.detail}</small></div>
        </div>)}
        <div className="gn-about-spec-row"><span>Interfejs</span><div><strong>FTN Desktop · GNOME 51 izgled</strong><small>React · TypeScript · Vite · Web simulacija</small></div></div>
      </div>
    </section>

    <section className="gn-about-section">
      <h2>O projektu</h2>
      <p>FTN Desktop je nastavni portal Fakulteta tehničkih nauka, organizovan kao radna površina. Folderi otvaraju predmete u pomerljivim prozorima, a pregled aktivnosti služi za pokretanje aplikacija i pretragu.</p>
      <div className="gn-about-features">
        <div><strong>03</strong><span>Predmeta</span></div>
        <div><strong>03</strong><span>Mini-igre</span></div>
        <div><strong>Live</strong><span>Vreme i datum</span></div>
      </div>
      <div className="gn-about-course-links">
        {courses.map(course=><button key={course.id} onClick={()=>onOpenCourse(course.id)}>
          <span>{course.code}</span><strong>{course.name}</strong><span>↗</span>
        </button>)}
      </div>
    </section>

    <section className="gn-about-section">
      <h2>Kontrole</h2>
      <p><kbd>Super</kbd> ili <kbd>Ctrl</kbd> + <kbd>Space</kbd> otvara prikaz aplikacija; <kbd>Esc</kbd> ga zatvara. Dvoklik na folder otvara predmet, a tasteri u naslovnoj traci upravljaju prozorom. U „Brzim postavkama” mogu se menjati tema, widgeti i svetlina pozadine.</p>
    </section>

    <footer className="gn-about-footer">
      FTN Desktop nije instalirani operativni sistem. Hardverske specifikacije, Wi-Fi i sistemske kontrole su demonstracioni prikazi. GNOME/Adwaita ikonice: © GNOME Project, LGPL-3.0 ili CC BY-SA 3.0. AMD i NVIDIA oznake služe isključivo ilustraciji simuliranog profila i ne predstavljaju saradnju sa proizvođačima. SVG logotipi preuzeti iz Simple Icons (CC0).
      <a href="https://github.com/owlCoder/ftn-nastavni-portal" target="_blank" rel="noreferrer">Izvorni kod ↗</a>
    </footer>
  </article>
}
