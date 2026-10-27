import type { Course } from '../courses/types'
import { sharedCourseGuides } from '../courses/guides'
import { ersLessonPackages, ersProjectBundle, ersStandaloneExamples } from '../courses/ers/examples'
import { oibExamples, oibExamplesBundle } from '../courses/oib/examples'
import { odpExamples, odpExamplesBundle } from '../courses/odp/examples'
import type { DownloadEntry } from './courseDownloads'
import { prepareDocument } from './document/prepareDocument'
import { assetUrl } from '../lib/assets'

export type CourseFileKind = 'folder' | 'practicum' | 'practicum-link' | 'checkpoints' | 'pdf' | 'docx' | 'pptx' | 'zip'
export type CourseFile = {
  id: string
  parent: string
  name: string
  kind: CourseFileKind
  description?: string
  source?: string
  editableSource?: string
  size?: string
  pages?: number
  presentationNumber?: string
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
    id: 'praktikum', parent: 'root', kind: 'practicum', name: 'Praktikum.docx',
    description: 'Word dokument za čitanje i uređivanje.', source: '/downloads/praktikum/' + course.id + '/Praktikum.docx',
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
      files.push({ id: parent, parent: 'vezbe', kind: 'folder', name: number(exercise.number) + ' ' + (slide?.title ?? exercise.title), description: slide?.title ?? exercise.title })
      if (slide) files.push({
        id: parent + '/prezentacija', parent, kind: 'pptx',
        name: slide.title + '.pptx', description: 'Prezentacija za vežbu.', presentationNumber: slide.number,
        source: slide.file.replace(/\.pdf$/i, '.pptx'),
      })
      if (example) files.push({
        id: parent + '/primer', parent, kind: 'zip',
        name: example.title + '.zip', description: example.description, source: example.zip,
      })
      files.push({
        id: parent + '/praktikum', parent, kind: 'practicum-link',
        name: 'Poglavlje ' + number(exercise.number) + '.docx', source: '/downloads/praktikum/' + course.id + '/Poglavlje_' + number(exercise.number) + '.docx',
        description: 'Poglavlje praktikuma u Word formatu.',
        exercise: exercise.number, anchor: exercise.anchor,
      })
    }
    // Introductory presentations live at the course root, outside exercise folders.
    for (const slide of slides.filter(item => !exercises.some(exercise => exercise.number === Number(item.number)))) files.push({
      id: 'uvod/' + slide.number, parent: 'root', kind: 'pptx',
      name: slide.title + '.pptx', description: slide.label, presentationNumber: slide.number,
      source: slide.file.replace(/\.pdf$/i, '.pptx'),
    })
  } else if (slides.length) {
    files.push({ id: 'prezentacije', parent: 'root', kind: 'folder', name: 'Prezentacije', description: 'PowerPoint prezentacije poređane po broju.' })
    for (const slide of slides) files.push({
      id: 'prezentacije/' + slide.number, parent: 'prezentacije', kind: 'pptx',
      name: slide.title + '.pptx', description: slide.label, presentationNumber: slide.number,
      source: slide.file.replace(/\.pdf$/i, '.pptx'),
    })
  }

  if (examples.length) {
    files.push({
      id: 'paketi/primeri', parent: 'vezbe', kind: 'zip', bundle: true,
      name: course.id === 'ers' ? 'EquipmentReservation — vežbe 05–08.zip' : 'Svi primeri.zip',
      description: course.id === 'ers' ? 'Komplet EquipmentReservation primera za vežbe 05–08.' : 'Komplet primera za sve vežbe.',
      source: course.id === 'ers' ? ersProjectBundle : course.id === 'oib' ? oibExamplesBundle : odpExamplesBundle,
    })
  }

  const projects = [...(course.project ? [course.project] : []), ...(course.projects ?? [])]
  const projectGuides = course.projectGuides ?? []
  if (projects.length || projectGuides.length || course.checkpoints.length) {
    files.push({
      id: 'projekat', parent: 'root', kind: 'folder', name: projects.length > 1 ? 'Projekti' : 'Projekat',
      description: course.checkpoints.length ? 'Projektna dokumentacija i kontrolne tačke.' : 'Tehničke specifikacije projekata.',
    })
    for (const project of projects) files.push({
      id: 'projekat/' + project.code, parent: 'projekat', kind: course.id === 'ibis' ? 'pdf' : 'docx',
      name: project.code + ' — ' + (course.id === 'ibis' ? 'Tehnička' : 'Projektna') + (course.id === 'ibis' ? ' specifikacija.pdf' : ' specifikacija.docx'),
      description: project.title, source: course.id === 'ibis' ? project.file : project.file.replace(/\.pdf$/i, '.docx'),
    })
    for (const guide of projectGuides) files.push({
      id: 'projekat/' + guide.id, parent: 'projekat', kind: guide.editableFile ? 'docx' : 'pdf',
      name: guide.editableFile ? guide.name.replace(/\.pdf$/i, '.docx') : guide.name, description: guide.description, source: guide.editableFile ?? guide.file,
    })
    if (course.checkpoints.length) files.push({
      id: 'projekat/kontrolne', parent: 'projekat', kind: 'checkpoints', name: 'Kontrolne tačke.docx', source: '/downloads/praktikum/' + course.id + '/Kontrolne_tacke.docx',
      description: 'Projektne etape, obaveze i datumi predaje.',
    })
  }
  files.push({
    id: 'uputstva', parent: 'root', kind: 'folder', name: 'Uputstva',
    description: 'Uputstva za Tapiz LMS i Tapiz Boards.',
  })
  for (const guide of sharedCourseGuides) files.push({
    id: 'uputstva/' + guide.id, parent: 'uputstva', kind: guide.editableFile ? 'docx' : 'pdf',
    name: guide.editableFile ? guide.name.replace(/\.pdf$/i, '.docx') : guide.name, description: guide.description, source: guide.editableFile ?? guide.file,
  })
  if (course.id === 'ers') files.push({ id: 'projekat/teorijska-pitanja', parent: 'projekat', kind: 'docx', name: 'Teorijska pitanja ERS.docx', source: '/downloads/ers-projekat/ERS_Teorijska_Pitanja.docx' })
  return course.id === 'ers' ? organizeErsMaterials(files) : files
}

/** ERS catalog organization is independent of teaching weeks and source filenames. */
function organizeErsMaterials(files: CourseFile[]): CourseFile[] {
  const general = (file: CourseFile) => file.parent === 'uputstva'
    || file.id === 'projekat/ers-pravila-polaganja' || file.id.startsWith('uvod/')
  const result: CourseFile[] = [
    { id: 'opsti', parent: 'root', kind: 'folder', name: 'Opšti materijali', description: 'Osnovne informacije, pravila polaganja i uputstva.' },
    { id: 'nastavni', parent: 'root', kind: 'folder', name: 'Nastavni materijali', description: 'Praktikum i materijali organizovani po temama.' },
  ]
  for (const file of files) {
    if (file.id === 'vezbe' || file.id === 'uputstva') continue
    if (general(file)) {
      result.push({ ...file, parent: 'opsti', description: file.id === 'projekat/ers-pravila-polaganja' ? 'Način polaganja, obaveze i bodovanje.' : file.description })
    } else if (file.id === 'praktikum') {
      result.push({ ...file, parent: 'nastavni', description: 'Celovit praktikum za rad na temama i samostalno učenje.' })
    } else if (file.id.startsWith('vezbe/')) {
      const id = file.id.replace(/^vezbe\//, 'teme/')
      const parent = file.parent === 'vezbe' ? 'nastavni' : file.parent.replace(/^vezbe\//, 'teme/')
      result.push({ ...file, id, parent,
        name: file.kind === 'folder' ? file.name
          : file.kind === 'practicum-link' ? 'Poglavlje ' + number(file.exercise!) + '.docx' : file.name,
        description: file.presentationNumber !== undefined ? 'Prezentacija uz temu.' : file.description,
      })
    } else if (file.bundle) {
      result.push({ ...file, parent: 'nastavni', name: file.id === 'paketi/primeri' ? 'EquipmentReservation — teme 05–08.zip' : file.name,
        description: file.id === 'paketi/primeri' ? 'Komplet EquipmentReservation primera za teme 05–08.' : file.description })
    } else {
      result.push(file)
    }
  }
  return result
}

export function courseFileContent(file: CourseFile, _course: Course): DownloadEntry | null {
  return file.source ? { path: file.name, url: file.source } : null
}

export function courseFolderEntries(course: Course, folder: string, files: CourseFile[], includeBundles = false): DownloadEntry[] {
  const lookup = new Map(files.map(file => [file.id, file]))
  const entries: DownloadEntry[] = []
  for (const item of files) {
    if (item.kind === 'folder' || (item.bundle && !includeBundles)) continue
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
