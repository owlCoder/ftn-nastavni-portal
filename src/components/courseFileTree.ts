import type { Course } from '../courses/types'
import { ersLessonPackages, ersProjectBundle, ersStandaloneExamples } from '../courses/ers/examples'
import { oibExamples, oibExamplesBundle } from '../courses/oib/examples'
import { odpExamples, odpExamplesBundle } from '../courses/odp/examples'
import { checkpointMarkdown, practicumMarkdown, type DownloadEntry } from './courseDownloads'

export type CourseFileKind = 'folder' | 'practicum' | 'checkpoints' | 'pdf' | 'zip'
export type CourseFile = {
  id: string
  parent: string
  name: string
  kind: CourseFileKind
  description?: string
  source?: string
  size?: string
  pages?: number
  /** Collections remain available separately, but are excluded from folder exports. */
  bundle?: boolean
}

const number = (n: number) => String(n).padStart(2, '0')
export const safeFileName = (name: string) => name.replaceAll(/[<>:"/\\|?*]/g, '-')

export function buildCourseFiles(course: Course): CourseFile[] {
  const files: CourseFile[] = []
  if (course.practicum.blocks.length) files.push({
    id: 'praktikum', parent: 'root', kind: 'practicum', name: 'Praktikum',
    description: 'Tekst vežbi sa sadržajem i navigacijom kroz poglavlja.',
  })

  if (course.presentations.kind === 'downloads') {
    files.push({ id: 'prezentacije', parent: 'root', kind: 'folder', name: 'Prezentacije', description: 'PDF prezentacije poređane po broju.' })
    for (const slide of course.presentations.downloads) files.push({
      id: 'prezentacije/' + slide.number, parent: 'prezentacije', kind: 'pdf',
      name: slide.number + ' — ' + slide.title + '.pdf', description: slide.label,
      source: slide.file, size: slide.size, pages: slide.pages,
    })
    files.push({
      id: 'prezentacije/sve', parent: 'prezentacije', kind: 'zip', name: 'Sve prezentacije.zip',
      description: 'Komplet PDF prezentacija za preuzimanje.',
      source: course.presentations.bundle.file, size: course.presentations.bundle.size, bundle: true,
    })
  }

  const examples = course.id === 'ers' ? [
    ...ersStandaloneExamples,
    ...ersLessonPackages.map(lesson => ({
      exercise: lesson.number, title: lesson.title,
      description: 'EquipmentReservation · ' + lesson.summary, zip: lesson.zip,
    })),
  ] : course.id === 'oib' ? oibExamples : course.id === 'odp' ? odpExamples : []
  if (examples.length) {
    files.push({ id: 'primeri', parent: 'root', kind: 'folder', name: 'Primeri', description: 'Izvorni kod i prateći materijali po vežbama.' })
    for (const example of examples) files.push({
      id: 'primeri/' + number(example.exercise), parent: 'primeri', kind: 'zip',
      name: number(example.exercise) + ' — ' + example.title + '.zip',
      description: 'Vežba ' + number(example.exercise) + ' · ' + example.description, source: example.zip,
    })
    files.push({
      id: 'primeri/sve', parent: 'primeri', kind: 'zip', bundle: true,
      name: course.id === 'ers' ? 'EquipmentReservation — vežbe 05–08.zip' : 'Svi primeri.zip',
      description: course.id === 'ers' ? 'Komplet EquipmentReservation primera za vežbe 05–08.' : 'Komplet primera za sve vežbe.',
      source: course.id === 'ers' ? ersProjectBundle : course.id === 'oib' ? oibExamplesBundle : odpExamplesBundle,
    })
  }

  const projects = [...(course.project ? [course.project] : []), ...(course.projects ?? [])]
  if (projects.length || course.checkpoints.length) {
    files.push({
      id: 'projekat', parent: 'root', kind: 'folder', name: projects.length > 1 ? 'Projekti' : 'Projekat',
      description: course.checkpoints.length ? 'Projektna specifikacija, obaveze i rokovi.' : 'Tehničke specifikacije projekata.',
    })
    for (const project of projects) files.push({
      id: 'projekat/' + project.code, parent: 'projekat', kind: 'pdf',
      name: project.code + ' — ' + (course.id === 'ibis' ? 'Tehnička' : 'Projektna') + ' specifikacija.pdf',
      description: project.title, source: project.file, size: project.size, pages: project.pages,
    })
    if (course.checkpoints.length) files.push({
      id: 'projekat/kontrolne', parent: 'projekat', kind: 'checkpoints', name: 'Kontrolne tačke',
      description: 'Projektne etape, obaveze i datumi predaje.',
    })
  }
  return files
}

export function courseFileContent(file: CourseFile, course: Course): DownloadEntry | null {
  if (file.source) return { path: file.name, url: file.source }
  if (file.kind === 'practicum') return { path: 'Praktikum.md', text: practicumMarkdown(course) }
  if (file.kind === 'checkpoints') return { path: 'Kontrolne_tacke.md', text: checkpointMarkdown(course) }
  return null
}

export function courseFolderEntries(course: Course, folder: string, files: CourseFile[]): DownloadEntry[] {
  const lookup = new Map(files.map(file => [file.id, file]))
  const entries: DownloadEntry[] = []
  for (const item of files) {
    if (item.kind === 'folder' || item.bundle) continue
    const parents: string[] = []
    let parent = item.parent
    while (parent !== folder && parent !== 'root') {
      const ancestor = lookup.get(parent)
      if (!ancestor) break
      parents.unshift(safeFileName(ancestor.name))
      parent = ancestor.parent
    }
    if (parent !== folder) continue
    const file = courseFileContent(item, course)
    if (file) entries.push({ ...file, path: [...parents, safeFileName(file.path)].join('/') })
  }
  return entries
}
