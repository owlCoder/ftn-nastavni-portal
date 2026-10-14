import { exerciseRange } from '../courses/checkpoints'
import type { Checkpoint } from '../courses/types'
import { callout, list, text } from './blocks'
import type { Block, Practicum } from './types'

type PracticumSource = {
  subject: string
  pdfFile?: string
  intro: Block[]
  /** One entry per exercise, in order: `exercises[0]` is Vežba 1. */
  exercises: Block[][]
  closing: Block[]
  checkpoints: Checkpoint[]
  checkpointSection: (checkpoint: Checkpoint) => Block[]
}

/**
 * Assembles a practicum. Checkpoints are not written into the exercises: each one is
 * rendered from the course checkpoint list, once, after the last exercise it covers.
 */
export function buildPracticum({ subject, pdfFile, intro, exercises, closing, checkpoints, checkpointSection }: PracticumSource): Practicum {
  const unplaced = checkpoints.filter(({ exercises: [, last] }) => last < 1 || last > exercises.length)
  if (unplaced.length > 0) {
    throw new Error(`${subject}: kontrolne tačke ${unplaced.map(({ code }) => code).join(', ')} ne pripadaju nijednoj vežbi.`)
  }

  return {
    subject,
    ...(pdfFile ? { pdfFile } : {}),
    footerText: 'Primenjeno softversko inženjerstvo',
    blocks: [
      ...intro,
      ...exercises.flatMap((exercise, index) => [
        ...exercise,
        ...checkpoints.filter(({ exercises: [, last] }) => last === index + 1).flatMap(checkpointSection),
      ]),
      ...closing,
    ],
  }
}

/** Full checkpoint section: the same summary and requirements the "Kontrolne tačke" tab shows. */
export const checkpointRequirements = (checkpoint: Checkpoint): Block[] => [
  text('h2', `Kontrolna tačka ${checkpoint.code} — ${checkpoint.title}`),
  text('paragraph', checkpoint.summary),
  ...(checkpoint.itemsHeading ? [text('h3', checkpoint.itemsHeading)] : []),
  list(checkpoint.items, checkpoint.orderedItems),
  ...(checkpoint.additionalRequirements ?? []).flatMap(group => [text('h3', group.title), list(group.items)]),
  ...(checkpoint.presentation ? [callout('task', 'Prikaz', checkpoint.presentation)] : []),
  ...(checkpoint.notRequired?.length ? [callout('note', 'Ne tražiti u ovoj fazi', checkpoint.notRequired.join(' '))] : []),
  callout('note', 'Termin i obuhvat', `${exerciseRange(checkpoint)} · ${checkpoint.dateLabel === 'Termin' ? checkpoint.date : `nedelja od ${checkpoint.date}`}${checkpoint.points !== undefined ? ` · ${checkpoint.points} poena.` : ''} Isti zahtevi prikazani su na kartici „Kontrolne tačke“.`),
]

/** Short checkpoint marker for practicums that leave the requirements to the "Kontrolne tačke" tab. */
export const checkpointReference = (checkpoint: Checkpoint): Block[] => [
  text('h2', `${checkpoint.code} — ${checkpoint.title}`),
  callout('note', 'Kontrolna tačka', 'Ova tačka zaokružuje prethodne teme. Organizacioni detalji i zahtevi nalaze se u posebnom odeljku kontrolnih tačaka.'),
]

/** One line per checkpoint for the semester overview. */
export const checkpointOverview = (checkpoints: Checkpoint[]): Block =>
  list(checkpoints.map((checkpoint) => `${checkpoint.code} (${exerciseRange(checkpoint)}, ${checkpoint.date}) — ${checkpoint.title}.`))
