import type { Practicum } from '../practicum/types'

export type CourseId = 'ers' | 'oib' | 'odp'

export type Checkpoint = {
  id: string
  code: string
  title: string
  /** First and last exercise the checkpoint covers; the practicum places it after the last one. */
  exercises: [first: number, last: number]
  date: string
  summary: string
  items: string[]
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
  | { kind: 'downloads'; downloads: PresentationDownload[]; bundle: PresentationBundle }
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
  semester: 'zimski' | 'letnji'
  available: boolean
  blurb: string
  accent: string
  accentSoft: string
  accentShadow: string
  practicum: Practicum
  presentations: CoursePresentations
  checkpoints: Checkpoint[]
  project?: ProjectDocument
}
