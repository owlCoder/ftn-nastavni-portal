import type { CoursePresentations, ProjectDocument } from '../types'

export const odpPresentations: CoursePresentations = {
  kind: 'downloads',
  bundle: { file: '/downloads/ODP_sve_prezentacije.zip', size: '1,3 MB' },
  downloads: [
    { number: '01', label: 'Vežba 1', title: 'Način razmišljanja u distribuiranom sistemu', pages: 20, size: '169 KB', file: '/downloads/odp-prezentacije/01_Nacin_razmisljanja_u_distribuiranom_sistemu.pdf' },
    { number: '02', label: 'Vežba 2', title: 'Ugovori, simulatori i ponovljivost', pages: 20, size: '166 KB', file: '/downloads/odp-prezentacije/02_Ugovori_simulatori_i_ponovljivost.pdf' },
    { number: '03', label: 'Vežba 3', title: 'Identitet, audit, observability i konfiguracija', pages: 20, size: '170 KB', file: '/downloads/odp-prezentacije/03_Identitet_audit_observability_i_konfiguracija.pdf' },
    { number: '04', label: 'Vežba 4', title: 'Verzionisanje i failure-first testiranje', pages: 20, size: '161 KB', file: '/downloads/odp-prezentacije/04_Verzionisanje_i_failure_first_testiranje.pdf' },
    { number: '05', label: 'Vežba 5', title: 'Tok podataka i read modeli', pages: 20, size: '165 KB', file: '/downloads/odp-prezentacije/05_Tok_podataka_i_read_modeli.pdf' },
    { number: '06', label: 'Vežba 6', title: 'Komande, poslovi i idempotentnost', pages: 20, size: '167 KB', file: '/downloads/odp-prezentacije/06_Komande_poslovi_i_idempotentnost.pdf' },
    { number: '07', label: 'Vežba 7', title: 'Rad bez veze i pouzdana isporuka', pages: 20, size: '159 KB', file: '/downloads/odp-prezentacije/07_Rad_bez_veze_i_pouzdana_isporuka.pdf' },
    { number: '08', label: 'Vežba 8', title: 'Koordinacija, protok i eventualna konzistentnost', pages: 20, size: '171 KB', file: '/downloads/odp-prezentacije/08_Koordinacija_protok_i_eventualna_konzistentnost.pdf' },
  ],
}

export const odpProject: ProjectDocument = {
  code: 'PICTOR',
  title: 'Distribuirani sistem za upravljanje zemaljskim stanicama i misijskim operacijama',
  description: 'Projektna specifikacija zajedničkog distribuiranog sistema za predmet Osnove distribuiranog programiranja.',
  file: '/downloads/odp-projekat/ODP_Projektna_Specifikacija.pdf',
  pages: 59,
  size: '1,0 MB',
  highlights: ['60 projektnih celina', 'R1, R2 i R3 razvojni nivoi', 'Timovi od 6 do 10 studenata'],
}
