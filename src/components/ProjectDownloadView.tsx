import type { ProjectDocument } from '../courses/types'
import { assetUrl } from '../lib/assets'
import { DownloadIcon, PreviewIcon } from './icons'

export function ProjectDownloadView({ project }: { project: ProjectDocument }) {
  return (
    <main className="presentations-shell project-shell">
      <section className="project-hero">
        <div className="project-hero-copy">
          <span className="eyebrow">Projektna specifikacija</span>
          <h1>{project.code}</h1>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-highlights" aria-label="Osnovni podaci o projektu">
            {project.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}
          </div>
        </div>

        <article className="project-document-card">
          <div className="project-document-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M7 3.5h7l4 4V20.5H7v-17Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3.5v4h4M9.5 12h6M9.5 15.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="project-document-label">Referentni dokument</span>
          <h3>Kompletna specifikacija</h3>
          <p>Dokument sadrži opis projektnih celina, pravila integracije, zahteve za testiranje, način predaje i kriterijume ocenjivanja.</p>
          <div className="project-document-meta"><span>PDF</span><span>{project.pages} strana</span><span>{project.size}</span></div>
          <div className="project-document-actions">
            <a
              className="project-document-action project-preview-button"
              href={assetUrl(project.file)}
              target="_blank"
              rel="noreferrer"
              aria-label={`Pregledaj projektnu specifikaciju ${project.code}`}
            >
              <PreviewIcon />
              <span>Pregledaj</span>
            </a>
            <a
              className="project-document-action project-download-button"
              href={assetUrl(project.file)}
              download
              aria-label={`Preuzmi projektnu specifikaciju ${project.code}`}
            >
              <DownloadIcon />
              <span>Preuzmi PDF</span>
            </a>
          </div>
        </article>
      </section>
    </main>
  )
}
