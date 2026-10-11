import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'

// Exercise the same metadata and tree used by the file manager without a browser.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { courses } = await server.ssrLoadModule('/src/courses/index.ts')
  const { buildCourseFiles, courseFolderEntries } = await server.ssrLoadModule('/src/components/courseFileTree.ts')
  const { ersStandaloneExamples, ersLessonPackages, ersProjectBundle } = await server.ssrLoadModule('/src/courses/ers/examples.ts')
  const { oibExamples, oibExamplesBundle } = await server.ssrLoadModule('/src/courses/oib/examples.ts')
  const { odpExamples, odpExamplesBundle } = await server.ssrLoadModule('/src/courses/odp/examples.ts')
  const exampleSources = {
    ers: [...ersStandaloneExamples.map(item => item.zip), ...ersLessonPackages.map(item => item.zip), ersProjectBundle],
    oib: [...oibExamples.map(item => item.zip), oibExamplesBundle],
    odp: [...odpExamples.map(item => item.zip), odpExamplesBundle],
    ibis: [],
  }

  for (const course of courses) {
    const files = buildCourseFiles(course)
    const lookup = new Map(files.map(item => [item.id, item]))
    assert.equal(lookup.size, files.length, course.code + ': duplicate tree IDs')
    assert.ok(!files.some(item => item.id.startsWith('vezbe')), course.code + ': redundant exercise folders')
    for (const item of files) {
      if (item.parent !== 'root') assert.equal(lookup.get(item.parent)?.kind, 'folder')
      if (item.source) assert.ok(existsSync(resolve('public', item.source.slice(1))), 'Missing asset: ' + item.source)
    }

    const slides = course.presentations.kind === 'downloads' ? course.presentations.downloads : []
    const projects = [...(course.project ? [course.project] : []), ...(course.projects ?? [])]
    const expectedSources = [
      ...slides.map(item => item.file), ...projects.map(item => item.file), ...exampleSources[course.id],
      ...(course.presentations.kind === 'downloads' ? [course.presentations.bundle.file] : []),
    ]
    assert.deepEqual(files.filter(item => item.source).map(item => item.source).sort(), expectedSources.sort(),
      course.code + ': each original asset must appear exactly once')
    assert.deepEqual(files.filter(item => item.parent === 'prezentacije' && item.kind === 'pdf').map(item => item.source),
      slides.map(item => item.file), course.code + ': presentations must keep their numbered order')
    assert.deepEqual(files.filter(item => item.parent === 'projekat' && item.kind === 'pdf').map(item => item.source),
      projects.map(item => item.file))

    const rootEntries = courseFolderEntries(course, 'root', files)
    assert.equal(new Set(rootEntries.map(item => item.path)).size, rootEntries.length, course.code + ': colliding archive paths')
    assert.deepEqual(rootEntries.filter(item => item.url).map(item => item.url).sort(),
      files.filter(item => item.source && !item.bundle).map(item => item.source).sort(),
      course.code + ': folder export must contain original assets without collection ZIPs')
    for (const folder of files.filter(item => item.kind === 'folder')) {
      const entries = courseFolderEntries(course, folder.id, files)
      assert.deepEqual(entries.filter(item => item.url).map(item => item.url).sort(),
        files.filter(item => item.parent === folder.id && item.source && !item.bundle).map(item => item.source).sort(),
        course.code + ': export must stay inside ' + folder.name)
    }
    if (course.id === 'ibis') {
      assert.ok(!files.some(item => item.kind === 'practicum' || item.kind === 'checkpoints' || item.parent === 'primeri'))
    } else {
      assert.ok(rootEntries.some(item => item.path === 'Praktikum.md' && item.text))
      assert.ok(rootEntries.some(item => item.path === 'Projekat/Kontrolne_tacke.md' && item.text))
    }
    console.log(course.code + ': all assets reachable once; folder exports contain no duplicate collections.')
  }
} finally {
  await server.close()
}
