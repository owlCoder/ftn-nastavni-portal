import type { CourseId } from '../courses/types'
import { visibleMaterials, type CourseFile, type CourseFileKind } from '../components/courseFileTree'
import type { Catalog, CourseSummary } from '../components/directoryModel'

const repository = 'owlCoder/ftn-nastavni-materijali'
const api = `https://api.github.com/repos/${repository}`
const raw = `https://raw.githubusercontent.com/${repository}`
const courseRoots: Record<CourseId, string> = {
  ers: 'Elementi razvoja softvera (ERS)',
  oib: 'Osnove informacione bezbednosti (OIB)',
  odp: 'Osnove distribuiranog programiranja (ODP)',
  ibis: 'Informaciona bezbednost infrastrukturnih sistema (IBIS)',
}
export type TreeEntry = { path: string; type: string; size?: number }
export type MaterialsSnapshot = { revision: string; catalogs: Catalog[] }
const pathUrl = (path: string) => path.split('/').map(encodeURIComponent).join('/')
const normalized = (value: string) => value.normalize('NFC')

/** Stable identifiers preserve the existing links for commonly used folders. */
function folderId(courseId: CourseId, path: string): string {
  const parts = path.split('/').map(normalized)
  const first = parts[0]?.toLocaleLowerCase('sr')
  let root: string | undefined
  if (courseId === 'ers' && (first === 'opšti materijali' || first === 'opšte informacije')) root = 'opsti'
  else if (courseId === 'ers' && first === 'nastavni materijali') root = 'nastavni'
  else if (first === 'računarske vežbe') root = 'vezbe'
  else if (first === 'prezentacije') root = 'prezentacije'
  else if (first === 'projekat' || first === 'projekti') root = 'projekat'
  else if (first === 'uputstva') root = 'uputstva'
  if (root && parts.length === 1) return root
  if (root && parts.length === 2 && /^(\d{2})(?:\s|$)/.test(parts[1])) {
    const number = parts[1].slice(0, 2)
    if (root === 'nastavni') return `teme/${number}`
    if (root === 'vezbe') return `vezbe/${number}`
  }
  return 'github/' + path
}

function kindFor(name: string): CourseFileKind {
  const extension = name.split('.').pop()?.toLowerCase()
  if (extension === 'pdf' || extension === 'docx' || extension === 'pptx' || extension === 'zip') return extension
  return 'file'
}
function sizeLabel(size?: number) {
  if (size === undefined) return undefined
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export function catalogsFromTree(courses: CourseSummary[], tree: TreeEntry[], revision: string): Catalog[] {
  const catalogs = courses.map(course => ({ course, files: [] as CourseFile[] }))
  for (const catalog of catalogs) {
    const expected = normalized(courseRoots[catalog.course.id])
    const byPath = tree.filter(entry => normalized(entry.path.split('/')[0]) === expected)
    const paths = new Map<string, string>()
    for (const entry of byPath) {
      const relative = entry.path.split('/').slice(1).join('/')
      if (!relative || relative.split('/').some(part => part.startsWith('.') || ['bin', 'obj'].includes(part))) continue
      if (entry.type === 'tree') paths.set(relative, folderId(catalog.course.id, relative))
    }
    for (const entry of byPath) {
      const relative = entry.path.split('/').slice(1).join('/')
      if (!relative || relative.split('/').some(part => part.startsWith('.') || ['bin', 'obj'].includes(part))) continue
      if (entry.type !== 'blob' && entry.type !== 'tree') continue
      const segments = relative.split('/')
      const name = segments.pop()!
      const parentPath = segments.join('/')
      const parent = parentPath ? paths.get(parentPath) : 'root'
      if (!parent) continue
      if (entry.type === 'tree') catalog.files.push({ id: paths.get(relative)!, parent, name: normalized(name), kind: 'folder' })
      else catalog.files.push({
        id: 'github-file/' + relative, parent, name: normalized(name), kind: kindFor(name),
        source: `${raw}/${revision}/${pathUrl(entry.path)}`, size: sizeLabel(entry.size),
      })
    }
    catalog.files = visibleMaterials(catalog.files)
    catalog.files.sort((a, b) => (a.kind === 'folder' ? 0 : 1) - (b.kind === 'folder' ? 0 : 1) || a.name.localeCompare(b.name, 'sr'))
  }
  if (catalogs.some(catalog => catalog.files.length === 0)) throw new Error('Nedostaje sadržaj jednog ili više predmeta.')
  return catalogs
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/vnd.github+json' } })
  if (!response.ok) throw new Error(`GitHub nije dostupan (HTTP ${response.status}).`)
  return response.json()
}

export async function loadGithubMaterials(courses: CourseSummary[], signal?: AbortSignal): Promise<MaterialsSnapshot> {
  // The public raw index avoids GitHub's low anonymous REST API rate limit.
  // If the index is not available yet, the REST API supplies a temporary fallback.
  try {
    const index = await getJson(`${raw}/main/.github/materials-index.json`, signal) as { revision?: unknown; tree?: TreeEntry[] }
    if (typeof index.revision === 'string' && /^[a-f0-9]{40}$/.test(index.revision) && Array.isArray(index.tree))
      return { revision: index.revision, catalogs: catalogsFromTree(courses, index.tree, index.revision) }
  } catch (error) {
    if (signal?.aborted) throw error
  }
  const commit = await getJson(`${api}/commits/main`, signal) as { sha?: unknown }
  if (typeof commit.sha !== 'string' || !/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error('GitHub nije vratio ispravnu verziju materijala.')
  const tree = await getJson(`${api}/git/trees/${commit.sha}?recursive=1`, signal) as { tree?: TreeEntry[]; truncated?: boolean }
  if (!Array.isArray(tree.tree) || tree.truncated) throw new Error('Spisak materijala sa GitHub-a nije potpun.')
  return { revision: commit.sha, catalogs: catalogsFromTree(courses, tree.tree, commit.sha) }
}
