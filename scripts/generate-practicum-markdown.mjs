import fs from 'node:fs/promises'
import path from 'node:path'
import { loadPracticumData, portalRoot } from './practicum-data.mjs'

const { courses, practicumMarkdown, checkpointMarkdown } = await loadPracticumData()
for (const course of courses.filter(item => item.practicum.blocks.length)) {
  const directory = path.join(portalRoot, 'public/downloads/praktikum', course.id)
  await fs.mkdir(directory, { recursive: true })
  const exercises = course.practicum.blocks
    .filter(block => block.type === 'text' && block.variant === 'h1' && /^Vežba\s+\d+\b/i.test(block.html))
    .map(block => ({ number: Number(block.html.match(/^Vežba\s+(\d+)/i)[1]), title: block.html.replace(/<[^>]+>/g, '') }))
  if (exercises.length !== 8 || new Set(exercises.map(item => item.number)).size !== 8) throw Error(`${course.code}: expected eight exercises`)
  await fs.writeFile(path.join(directory, 'Praktikum.md'), practicumMarkdown(course))
  await fs.writeFile(path.join(directory, 'Kontrolne_tacke.md'), checkpointMarkdown(course))
  for (const exercise of exercises) {
    await fs.writeFile(path.join(directory, `Vezba_${String(exercise.number).padStart(2, '0')}.md`), practicumMarkdown(course, exercise.number))
  }
  console.log(`${course.code}: exported eight exercises, practicum and checkpoints`)
}
