import { ersLessonPackages, ersProjectBundle, ersStandaloneExamples } from '../../courses/ers/examples'
import { assetUrl } from '../../lib/assets'
import { DownloadArrowIcon, FolderIcon } from '../icons'

export function ErsExamplesView() {
  const zipUrl = assetUrl(ersProjectBundle)

  return (
    <main className="examples-shell">
      <section className="examples-hero">
        <div className="examples-hero-copy">
          <span className="eyebrow">Nastavni primeri</span>
          <h1>Primeri za vežbe</h1>
          <p>Pripremljeni .NET projekti prate teme obrađene na vežbama i namenjeni su samostalnoj analizi.</p>
          <div className="examples-summary" aria-label="Sadržaj primera">
            <span><strong>{ersStandaloneExamples.length + ersLessonPackages.length}</strong> ZIP paketa</span>
            <span><strong>2–8</strong> vežbe</span>
            <span><strong>.NET</strong> rešenja</span>
          </div>
        </div>
        <a href={zipUrl} download className="examples-hero-download">
          <span className="examples-hero-download-icon"><DownloadArrowIcon /></span>
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
          {ersStandaloneExamples.map((example) => (
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
              <a className="supplemental-download" href={assetUrl(example.zip)} download>
                <DownloadArrowIcon />
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
            <span className="examples-project-download-icon"><DownloadArrowIcon /></span>
            <span><strong>Preuzmi ceo projekat</strong><small>Vežbe 5–8 · ZIP paket</small></span>
          </a>
        </div>

        <div className="examples-course-grid" aria-label="Primeri po vežbama">
          {ersLessonPackages.map((lesson) => (
            <article className="examples-course-card" key={lesson.number}>
              <div className="examples-course-card-topline">
                <span>Vežba {lesson.number}</span>
                <span>ZIP</span>
              </div>
              <span className="examples-course-icon"><FolderIcon /></span>
              <h3>{lesson.title}</h3>
              <p>{lesson.summary}</p>
              <div className="examples-course-tags" aria-label="Sadržaj paketa">
                {lesson.contents.map((label) => <span key={label}>{label}</span>)}
              </div>
              <a className="examples-course-download" href={assetUrl(lesson.zip)} download>
                <DownloadArrowIcon />
                <span>Preuzmi vežbu {lesson.number}</span>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
