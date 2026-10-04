import type { Course } from '../types'
import { odpCheckpoints } from './checkpoints'
import { odpPracticum } from './practicum'
import { odpPresentations, odpProject } from './downloads'

export const odpCourse: Course = {
  id: 'odp',
  code: 'ODP',
  name: 'Osnove distribuiranog programiranja',
  academicYear: '2026/2027',
  semester: 'letnji',
  available: false,
  blurb: 'Praktikum, prezentacije, nastavni primeri, projektna specifikacija i kontrolne tačke.',
  accent: 'linear-gradient(145deg, #059669 0%, #047857 48%, #065f46 100%)',
  accentSoft: 'rgba(5,150,105,.14)',
  accentShadow: 'rgba(5,150,105,.20)',
  practicum: odpPracticum,
  presentations: odpPresentations,
  checkpoints: odpCheckpoints,
  project: odpProject,
}
