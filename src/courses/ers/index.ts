import type { Course } from '../types'
import { ersCheckpoints } from './checkpoints'
import { ersPresentations, ersProject } from './downloads'
import { ersPracticum } from './practicum'

export const ersCourse: Course = {
  id: 'ers',
  code: 'ERS',
  name: 'Elementi razvoja softvera',
  academicYear: '2026/2027',
  semester: 'zimski',
  available: true,
  blurb: 'Praktikum, prezentacije, nastavni primeri, projektna specifikacija i kontrolne tačke.',
  accent: 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 48%, #3730a3 100%)',
  accentSoft: 'rgba(37,99,235,.14)',
  accentShadow: 'rgba(37,99,235,.20)',
  practicum: ersPracticum,
  presentations: ersPresentations,
  checkpoints: ersCheckpoints,
  project: ersProject,
}
