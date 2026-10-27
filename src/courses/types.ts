import type { Practicum } from '../practicum/types'

export type CourseId = 'ers' | 'oib' | 'odp' | 'ibis'

export type Checkpoint = {
  id: string
  code: string
  title: string
  /** First and last exercise the checkpoint covers; the practicum places it after the last one. */
  exercises: [first: number, last: number]
  date: string
  dateLabel?: string
  points?: number
  summary: string
  items: string[]
  itemsHeading?: string
  orderedItems?: boolean
  additionalRequirements?: Array<{ title: string; items: string[] }>
  presentation?: string
  notRequired?: string[]
}

export type PresentationDownload = {
  number: string
  label: string
  title: string
  pages: number
  size: string
  file: string
}

export type PresentationBundle = {
  file: string
  size: string
}

export type PresentationSlide = {
  title: string
  lead?: string
  points?: string[]
}

export type PresentationDeck = {
  id: string
  exercise: number
  title: string
  subtitle: string
  duration: string
  goal: string
  slides: PresentationSlide[]
}

export type CoursePresentations =
  | { kind: 'downloads'; downloads: PresentationDownload[]; bundle?: PresentationBundle }
  | { kind: 'decks'; decks: PresentationDeck[] }

export type ProjectDocument = {
  code: string
  title: string
  description: string
  file: string
  pages: number
  size: string
  highlights: string[]
}

export type CourseGuide = {
  editableFile?: string
  id: string
  name: string
  description: string
  file: string
  pages: number
  size: string
}

export type LessonPackage = {
  number: number
  title: string
  summary: string
  zip: string
  contents: string[]
}

export type StandaloneExample = {
  exercise: number
  title: string
  description: string
  zip: string
  tags: string[]
}

export type Course = {
  id: CourseId
  code: string
  name: string
  academicYear: string
  semester?: 'zimski' | 'letnji'
  studyLevel?: 'osnovne' | 'master'
  available: boolean
  blurb: string
  accent: string
  accentSoft: string
  accentShadow: string
  practicum: Practicum
  presentations: CoursePresentations
  checkpoints: Checkpoint[]
  project?: ProjectDocument
  projects?: ProjectDocument[]
  projectGuides?: CourseGuide[]
}
