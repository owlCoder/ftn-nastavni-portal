import type { CoursePresentations, ProjectDocument } from '../types'

export const oibPresentations: CoursePresentations = {
  kind: 'downloads',
  bundle: { file: '/downloads/OIB_sve_prezentacije.zip', size: '6,2 MB' },
  downloads: [
    { number: '00', label: 'Uvodna prezentacija', title: 'Osnovne informacije', pages: 20, size: '1019 KB', file: '/downloads/oib-prezentacije/00_Osnovne_informacije.pdf' },
    { number: '01', label: 'Vežba 1', title: 'Identitet, autentikacija i RBAC', pages: 20, size: '707 KB', file: '/downloads/oib-prezentacije/01_Identitet_autentikacija_i_RBAC.pdf' },
    { number: '02', label: 'Vežba 2', title: 'Autorizacija nad resursom', pages: 20, size: '693 KB', file: '/downloads/oib-prezentacije/02_Autorizacija_nad_resursom_i_klasifikacija_podataka.pdf' },
    { number: '03', label: 'Vežba 3', title: 'Politike i bezbednosna konfiguracija', pages: 20, size: '679 KB', file: '/downloads/oib-prezentacije/03_Politike_konfiguracija_i_vidljivost.pdf' },
    { number: '04', label: 'Vežba 4', title: 'Imovina i modelovanje pretnji', pages: 20, size: '651 KB', file: '/downloads/oib-prezentacije/04_Imovina_granice_poverenja_i_threat_modeling.pdf' },
    { number: '05', label: 'Vežba 5', title: 'MFA, sesije, servisi i tajne', pages: 20, size: '652 KB', file: '/downloads/oib-prezentacije/05_MFA_sesije_servisi_i_tajne.pdf' },
    { number: '06', label: 'Vežba 6', title: 'Detekcija i incident', pages: 20, size: '661 KB', file: '/downloads/oib-prezentacije/06_Detekcija_incident_i_ranjivosti.pdf' },
    { number: '07', label: 'Vežba 7', title: 'Atributi, rizik i pregled pristupa', pages: 20, size: '657 KB', file: '/downloads/oib-prezentacije/07_Atributi_rizik_i_pregled_pristupa.pdf' },
    { number: '08', label: 'Vežba 8', title: 'Korelacija i efektivnost kontrola', pages: 20, size: '667 KB', file: '/downloads/oib-prezentacije/08_Korelacija_efektivnost_i_ucenje.pdf' },
  ],
}

export const oibProject: ProjectDocument = {
  code: 'SCUTUM',
  title: 'Platforma za upravljanje informacionom bezbednošću i digitalnim poverenjem',
  description: 'Projektna specifikacija zajedničkog informacionog sistema za predmet Osnove informacione bezbednosti.',
  file: '/downloads/oib-projekat/OIB_Projektna_Specifikacija.pdf',
  pages: 96,
  size: '2,0 MB',
  highlights: ['90 projektnih celina', 'R1, R2 i R3 razvojni nivoi', 'Timovi od 6 do 10 studenata'],
}
