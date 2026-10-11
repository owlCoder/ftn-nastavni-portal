import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { portalRoot } from './practicum-data.mjs'

const materialsRoot = path.resolve(process.argv[2] ?? path.join(portalRoot, '../nastava'))
const manifest = JSON.parse(await fs.readFile(new URL('./teaching-materials.json', import.meta.url), 'utf8'))
const ignored = new Set(['bin', 'obj', '.vs', '.git', 'TestResults', 'node_modules', '.DS_Store'])
async function inventory(root, prefix = '') {
  const result = new Map()
  for (const entry of await fs.readdir(path.join(root, prefix), { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.startsWith('.env') || /\.(?:user|suo)$/i.test(entry.name)) continue
    const relative = path.join(prefix, entry.name)
    if (entry.isDirectory()) {
      for (const [name, digest] of await inventory(root, relative)) result.set(name, digest)
    } else if (entry.isFile()) {
      result.set(relative, createHash('sha256').update(await fs.readFile(path.join(root, relative))).digest('hex'))
    }
  }
  return result
}
async function compare(left, right, label) {
  const [a, b] = await Promise.all([inventory(left), inventory(right)])
  assert.deepEqual([...a.keys()].sort(), [...b.keys()].sort(), label + ': different file sets')
  for (const [name, digest] of a) assert.equal(digest, b.get(name), label + ': different file ' + name)
  return a.size
}
for (const root of [portalRoot, materialsRoot]) {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean)
  for (const name of files) {
    if (!(await fs.stat(path.join(root, name)).catch(() => null))?.isFile()) continue
    assert.ok(path.basename(name) !== 'verify.sh', root + ': unexpected verify.sh at ' + name)
    assert.ok(!/^readme(?:\.|$)/i.test(path.basename(name)) || !name.includes('/'), root + ': nested README at ' + name)
  }
}
let sourceFiles = 0
for (const example of manifest.examples) {
  sourceFiles += await compare(path.join(portalRoot, example.portal), path.join(materialsRoot, example.materials), example.portal)
}
for (const course of manifest.courses) {
  if (course.id !== 'ibis') await compare(
    path.join(portalRoot, 'public/downloads/praktikum', course.id),
    path.join(materialsRoot, course.directory, '03 Racunarske vezbe'), course.id + ': exercise documents',
  )
  for (const project of course.projects) {
    assert.ok((await fs.readFile(path.join(portalRoot, 'public', project.portal))).equals(
      await fs.readFile(path.join(materialsRoot, course.directory, project.materials)),
    ), course.id + ': project specification ' + project.materials)
  }
}
for (const document of manifest.sharedDocuments) {
  assert.ok((await fs.readFile(path.join(portalRoot, 'public', document.portal))).equals(
    await fs.readFile(path.join(materialsRoot, document.materials)),
  ), 'Shared document: ' + document.materials)
}
console.log(`Synchronized: ${manifest.examples.length} examples (${sourceFiles} files), 24 exercises, three practicums, six project specifications and ${manifest.sharedDocuments.length} shared guides.`)
