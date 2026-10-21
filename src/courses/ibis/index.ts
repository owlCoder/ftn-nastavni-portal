import type { Course } from '../types'
import { ibisPresentations, ibisProjects } from './downloads'

export const ibisCourse: Course = {
  id: 'ibis',
  code: 'IBIS',
  name: 'Informaciona bezbednost infrastrukturnih sistema',
  academicYear: '2026/2027',
  studyLevel: 'master',
  available: true,
  blurb: 'Prezentacije o SCADA sistemima, javno dostupnim podacima i tehničke specifikacije projektnih zadataka.',
  accent: 'linear-gradient(145deg, #d97706 0%, #b45309 48%, #92400e 100%)',
  accentSoft: 'rgba(217,119,6,.14)',
  accentShadow: 'rgba(217,119,6,.20)',
  practicum: {
    subject: 'Informaciona bezbednost infrastrukturnih sistema',
    footerText: 'Master akademske studije',
    blocks: [],
  },
  presentations: ibisPresentations,
  checkpoints: [],
  projects: ibisProjects,
}
