import { oibExamples, oibExamplesBundle } from '../../courses/oib/examples'
import { assetUrl } from '../../lib/assets'
import { DownloadArrowIcon, FolderIcon } from '../icons'

export function OibExamplesView() {
  const zipUrl = assetUrl(oibExamplesBundle)

  return (
    <main className="examples-shell examples-shell-oib">
      <section className="examples-hero">
        <div className="examples-hero-copy">
          <span className="eyebrow">C# / .NET 8</span>
          <h1>Primeri iz informacione bezbednosti</h1>
          <p>Svaku vežbu prati samostalno .NET rešenje sa razdvojenim slojevima, testovima i uputstvom za pokretanje.</p>
          <div className="examples-summary" aria-label="Sadržaj primera">
            <span><strong>{oibExamples.length}</strong> ZIP paketa</span>
            <span><strong>1–8</strong> vežbe</span>
            <span><strong>.NET 8</strong> rešenja sa testovima</span>
          </div>
        </div>
        <a href={zipUrl} download className="examples-hero-download">
          <span className="examples-hero-download-icon"><DownloadArrowIcon /></span>
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
              <a className="examples-course-download" href={assetUrl(example.zip)} download>
                <DownloadArrowIcon />
                <span>Preuzmi vežbu {example.exercise}</span>
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
