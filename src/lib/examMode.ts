import type { Catalog } from '../components/directoryModel'

export type ExamPolicy = { enabled: boolean; allowedFiles: string[] }
export const defaultExamPolicy: ExamPolicy = { enabled: false, allowedFiles: [] }

export function examFileKey(courseId: string, fileId: string) {
  return courseId + ':' + fileId
}

export async function loadExamPolicy(signal?: AbortSignal): Promise<ExamPolicy> {
  // GitHub Pages is a static mirror; only the Vercel deployment has /api/exam.
  if (import.meta.env.BASE_URL !== '/' || import.meta.env.DEV) return defaultExamPolicy
  const response = await fetch('/api/exam', { credentials: 'same-origin', cache: 'no-store', signal })
  if (!response.ok) throw new Error('Provera ispitnog režima nije dostupna.')
  const policy = await response.json() as ExamPolicy
  if (typeof policy?.enabled !== 'boolean' || !Array.isArray(policy.allowedFiles) ||
    !policy.allowedFiles.every(file => typeof file === 'string')) {
    throw new Error('Neispravan odgovor o ispitnom režimu.')
  }
  return policy
}

/** Only selected documents and their ancestor directories remain visible or exportable. */
export function filterCatalogsForExam(catalogs: Catalog[], policy: ExamPolicy): Catalog[] {
  if (!policy.enabled) return catalogs
  const allowed = new Set(policy.allowedFiles)
  return catalogs.map(catalog => {
    const folders = new Map(catalog.files.filter(file => file.kind === 'folder').map(file => [file.id, file]))
    const documents = catalog.files.filter(file => file.kind !== 'folder' && file.source &&
      allowed.has(examFileKey(catalog.course.id, file.id)))
    const ancestors = new Set<string>()
    for (const file of documents) {
      let parent = file.parent
      while (parent !== 'root' && !ancestors.has(parent)) {
        const folder = folders.get(parent)
        if (!folder) break
        ancestors.add(parent)
        parent = folder.parent
      }
    }
    const documentIds = new Set(documents.map(file => file.id))
    return {
      ...catalog,
      files: catalog.files.filter(file => documentIds.has(file.id) || file.kind === 'folder' && ancestors.has(file.id)),
    }
  }).filter(catalog => catalog.files.some(file => file.kind !== 'folder'))
}
