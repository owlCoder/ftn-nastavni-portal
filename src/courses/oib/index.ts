import type { Course } from '../types'
import { oibCheckpoints } from './checkpoints'
import { oibPresentations, oibProject } from './downloads'
import { oibPracticum } from './practicum'

export const oibCourse: Course = {
  id: 'oib',
  code: 'OIB',
  name: 'Osnove informacione bezbednosti',
  academicYear: '2026/2027',
  semester: 'zimski',
  available: true,
  blurb: 'Praktikum, prezentacije, nastavni primeri, projektna specifikacija i kontrolne tačke.',
  accent: 'linear-gradient(145deg, #dc2626 0%, #b91c1c 48%, #7f1d1d 100%)',
  accentSoft: 'rgba(220,38,38,.14)',
  accentShadow: 'rgba(220,38,38,.20)',
  practicum: oibPracticum,
  presentations: oibPresentations,
  checkpoints: oibCheckpoints,
  project: oibProject,
}
