import type { PresentationBundle, PresentationDownload } from '../courses/types'
import { assetUrl } from '../lib/assets'
import { DownloadIcon, PreviewIcon } from './icons'

export function PresentationDownloadsView({ downloads, bundle }: { downloads: PresentationDownload[]; bundle: PresentationBundle }) {
  const totalPages = downloads.reduce((sum, item) => sum + item.pages, 0)

  return (
    <main className="presentations-shell presentation-downloads-shell">
      <section className="download-hero">
        <div className="download-hero-copy">
          <span className="eyebrow">Materijali za nastavu</span>
          <h1>Prezentacije za vežbe</h1>
          <p>Prezentacije sa vežbi u PDF formatu, raspoređene prema redosledu izvođenja nastave.</p>
          <div className="download-summary" aria-label="Sadržaj paketa">
            <span><strong>{downloads.length}</strong> PDF fajlova</span>
            <span><strong>{totalPages}</strong> slajdova</span>
          </div>
        </div>
        <a className="download-all-button" href={assetUrl(bundle.file)} download>
          <span className="download-all-icon"><DownloadIcon /></span>
          <span className="download-all-copy">
            <small>SVE PREZENTACIJE</small>
            <strong>Preuzmi komplet</strong>
            <em><b>ZIP</b><span>{downloads.length} PDF fajlova</span><span>{bundle.size}</span></em>
          </span>
          <span className="download-all-arrow" aria-hidden="true">→</span>
        </a>
      </section>

      <section className="download-library" aria-labelledby="download-library-title">
        <div className="download-library-heading">
          <div>
            <span className="eyebrow">Pojedinačno preuzimanje</span>
            <h2 id="download-library-title">Prezentacije po vežbama</h2>
          </div>
          <p>PDF možete pregledati u pregledaču ili preuzeti.</p>
        </div>

        <div className="download-card-grid">
          {downloads.map((item) => (
            <article className={`download-card ${item.number === '00' ? 'download-card-featured' : ''}`} key={item.number}>
              <div className="download-card-number" aria-hidden="true">{item.number}</div>
              <div className="download-card-content">
                <span className="download-card-label">{item.label}</span>
                <h3>{item.title}</h3>
                <div className="download-card-meta"><span>{item.pages} strana</span><span>{item.size}</span></div>
              </div>
              <div className="download-card-actions">
                <a className="download-card-action download-card-preview" href={assetUrl(item.file)} target="_blank" rel="noreferrer" aria-label={`Pregledaj ${item.label}: ${item.title}`}>
                  <PreviewIcon />
                  <span>Pregledaj</span>
                </a>
                <a className="download-card-action" href={assetUrl(item.file)} download aria-label={`Preuzmi ${item.label}: ${item.title}`}>
                  <DownloadIcon />
                  <span>Preuzmi</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
