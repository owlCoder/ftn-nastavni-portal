import type { Course } from '../courses/types'
import { ersLessonPackages, ersProjectBundle, ersStandaloneExamples } from '../courses/ers/examples'
import { oibExamples, oibExamplesBundle } from '../courses/oib/examples'
import { odpExamples, odpExamplesBundle } from '../courses/odp/examples'
import { checkpointMarkdown, practicumMarkdown, type DownloadEntry } from './courseDownloads'
import { prepareDocument } from './document/prepareDocument'
import { assetUrl } from '../lib/assets'

export type CourseFileKind = 'folder' | 'practicum' | 'practicum-link' | 'checkpoints' | 'pdf' | 'zip'
export type CourseFile = {
  id: string
  parent: string
  name: string
  kind: CourseFileKind
  description?: string
  source?: string
  size?: string
  pages?: number
  exercise?: number
  anchor?: string
  /** Collections remain available separately, but are excluded from folder exports. */
  bundle?: boolean
}

const number = (n: number) => String(n).padStart(2, '0')
export const safeFileName = (name: string) => name.replaceAll(/[<>:"/\\|?*]/g, '-')
export const practicumExerciseHref = (course: Course, exercise: number) =>
  assetUrl('/') + '#' + course.id + '/praktikum/' + number(exercise)

export function buildCourseFiles(course: Course): CourseFile[] {
  const files: CourseFile[] = []
  if (course.practicum.blocks.length) files.push({
    id: 'praktikum', parent: 'root', kind: 'practicum', name: 'Praktikum',
    description: 'Tekst vežbi sa sadržajem i navigacijom kroz poglavlja.',
  })

  const examples = course.id === 'ers' ? [
    ...ersStandaloneExamples,
    ...ersLessonPackages.map(lesson => ({
      exercise: lesson.number, title: lesson.title,
      description: 'EquipmentReservation · ' + lesson.summary, zip: lesson.zip,
    })),
  ] : course.id === 'oib' ? oibExamples : course.id === 'odp' ? odpExamples : []

  const slides = course.presentations.kind === 'downloads' ? course.presentations.downloads : []
  const exercises = prepareDocument(course.practicum.blocks).toc
    .filter(entry => entry.level === 1 && /^Vežba\s+\d+\b/i.test(entry.label))
    .map(entry => ({
      number: Number(entry.label.match(/^Vežba\s+(\d+)/i)![1]),
      title: entry.label.replace(/^Vežba\s+\d+\s*[—–-]\s*/i, ''),
      anchor: entry.id,
    }))
  if (exercises.length) {
    files.push({
      id: 'vezbe', parent: 'root', kind: 'folder', name: 'Računarske vežbe',
      description: 'Prezentacija, primer i poglavlje praktikuma za svaku vežbu.',
    })
    for (const exercise of exercises) {
      const parent = 'vezbe/' + number(exercise.number)
      const slide = slides.find(item => Number(item.number) === exercise.number)
      const example = examples.find(item => item.exercise === exercise.number)
      files.push({ id: parent, parent: 'vezbe', kind: 'folder', name: 'Vežba ' + number(exercise.number), description: slide?.title ?? exercise.title })
      if (slide) files.push({
        id: parent + '/prezentacija', parent, kind: 'pdf',
        name: slide.number + ' — ' + slide.title + '.pdf', description: 'Prezentacija za vežbu.',
        source: slide.file, size: slide.size, pages: slide.pages,
      })
      if (example) files.push({
        id: parent + '/primer', parent, kind: 'zip',
        name: example.title + '.zip', description: example.description, source: example.zip,
      })
      files.push({
        id: parent + '/praktikum', parent, kind: 'practicum-link',
        name: 'Vežba ' + number(exercise.number) + ' u praktikumu',
        description: 'Otvori odgovarajuće poglavlje praktikuma.',
        exercise: exercise.number, anchor: exercise.anchor,
      })
    }
    // Introductory presentations live at the course root, outside exercise folders.
    for (const slide of slides.filter(item => !exercises.some(exercise => exercise.number === Number(item.number)))) files.push({
      id: 'uvod/' + slide.number, parent: 'root', kind: 'pdf',
      name: slide.number + ' — ' + slide.title + '.pdf', description: slide.label,
      source: slide.file, size: slide.size, pages: slide.pages,
    })
  } else if (slides.length) {
    files.push({ id: 'prezentacije', parent: 'root', kind: 'folder', name: 'Prezentacije', description: 'PDF prezentacije poređane po broju.' })
    for (const slide of slides) files.push({
      id: 'prezentacije/' + slide.number, parent: 'prezentacije', kind: 'pdf',
      name: slide.number + ' — ' + slide.title + '.pdf', description: slide.label,
      source: slide.file, size: slide.size, pages: slide.pages,
    })
  }

  if (course.presentations.kind === 'downloads') files.push({
    id: 'paketi/prezentacije', parent: exercises.length ? 'vezbe' : 'prezentacije', kind: 'zip', name: 'Sve prezentacije.zip',
    description: 'Komplet PDF prezentacija za preuzimanje.',
    source: course.presentations.bundle.file, size: course.presentations.bundle.size, bundle: true,
  })
  if (examples.length) {
    files.push({
      id: 'paketi/primeri', parent: 'vezbe', kind: 'zip', bundle: true,
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
  if (file.kind === 'practicum-link' && file.exercise) return {
    path: file.name + '.url',
    text: '[InternetShortcut]\r\nURL=https://owlcoder.github.io/ftn-nastavni-portal/#' + course.id + '/praktikum/' + number(file.exercise) + '\r\n',
  }
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
