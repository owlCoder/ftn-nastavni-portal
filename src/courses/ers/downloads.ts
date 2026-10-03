import type { CoursePresentations, ProjectDocument } from '../types'

export const ersPresentations: CoursePresentations = {
  kind: 'downloads',
  bundle: { file: '/downloads/ERS_sve_prezentacije.zip', size: '1,8 MB' },
  downloads: [
    { number: '00', label: 'Uvodna prezentacija', title: 'Osnovne informacije', pages: 13, size: '176 KB', file: '/downloads/ers-prezentacije/00_Osnovne_informacije.pdf' },
    { number: '01', label: 'Vežba 1', title: 'Zahtevi, backlog i Git', pages: 20, size: '195 KB', file: '/downloads/ers-prezentacije/01_Zahtevi_backlog_i_Git.pdf' },
    { number: '02', label: 'Vežba 2', title: 'SOLID i Clean Architecture', pages: 20, size: '202 KB', file: '/downloads/ers-prezentacije/02_SOLID_i_Clean_Architecture.pdf' },
    { number: '03', label: 'Vežba 3', title: 'Poslovna logika i slučajevi upotrebe', pages: 20, size: '198 KB', file: '/downloads/ers-prezentacije/03_Poslovna_logika_i_use_case.pdf' },
    { number: '04', label: 'Vežba 4', title: 'Testabilni dizajn, NUnit i Moq', pages: 20, size: '223 KB', file: '/downloads/ers-prezentacije/04_Testabilni_dizajn_NUnit_i_Moq.pdf' },
    { number: '05', label: 'Vežba 5', title: 'Integracija modula i ugovori', pages: 20, size: '215 KB', file: '/downloads/ers-prezentacije/05_Integracija_modula_ugovori.pdf' },
    { number: '06', label: 'Vežba 6', title: 'Razvoj uz podršku AI alata', pages: 20, size: '198 KB', file: '/downloads/ers-prezentacije/06_Kontrolisan_AI_workflow.pdf' },
    { number: '07', label: 'Vežba 7', title: 'Model Context Protocol (MCP)', pages: 20, size: '205 KB', file: '/downloads/ers-prezentacije/07_MCP.pdf' },
    { number: '08', label: 'Vežba 8', title: 'Zaštitni mehanizmi i evaluacija', pages: 20, size: '196 KB', file: '/downloads/ers-prezentacije/08_Guardrails_evaluacije_i_QA.pdf' },
  ],
}

export const ersProject: ProjectDocument = {
  code: 'PYXIS',
  title: 'Informacioni sistem za upravljanje Data centrom',
  description: 'Projektna specifikacija zajedničkog modularnog sistema za predmet Elementi razvoja softvera.',
  file: '/downloads/ers-projekat/ERS_Projektna_Specifikacija.pdf',
  pages: 115,
  size: '2,1 MB',
  highlights: ['90 projektnih celina', 'R1, R2 i R3 razvojni nivoi', 'Timovi od 6 do 10 studenata'],
}
