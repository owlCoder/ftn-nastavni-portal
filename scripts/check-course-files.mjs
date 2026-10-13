import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'

// Exercise the same metadata and tree used by the file manager without a browser.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { courses } = await server.ssrLoadModule('/src/courses/index.ts')
  const { sharedCourseGuides } = await server.ssrLoadModule('/src/courses/guides.ts')
  const { buildCourseFiles, courseFolderEntries } = await server.ssrLoadModule('/src/components/courseFileTree.ts')
  const { ersStandaloneExamples, ersLessonPackages, ersProjectBundle } = await server.ssrLoadModule('/src/courses/ers/examples.ts')
  const { oibExamples, oibExamplesBundle } = await server.ssrLoadModule('/src/courses/oib/examples.ts')
  const { odpExamples, odpExamplesBundle } = await server.ssrLoadModule('/src/courses/odp/examples.ts')
  const examples = {
    ers: [...ersStandaloneExamples, ...ersLessonPackages.map(item => ({ exercise: item.number, zip: item.zip }))],
    oib: oibExamples, odp: odpExamples, ibis: [],
  }
  const bundles = { ers: ersProjectBundle, oib: oibExamplesBundle, odp: odpExamplesBundle }
  const { prepareDocument } = await server.ssrLoadModule('/src/components/document/prepareDocument.ts')
  const { practicumMarkdown, checkpointMarkdown, practicumAssets } = await server.ssrLoadModule('/src/practicum/markdown.ts')

  for (const course of courses) {
    const files = buildCourseFiles(course)
    const companionAssets = practicumAssets(course)
    for (const asset of companionAssets) {
      assert.ok(!asset.path.startsWith('/') && !asset.path.split('/').includes('..'), 'Unsafe companion path: ' + asset.path)
      assert.ok(existsSync(resolve('public', asset.url.slice(1))), 'Missing companion image: ' + asset.url)
      assert.ok(readFileSync(resolve('public/downloads/praktikum', course.id, asset.path)).equals(readFileSync(resolve('public', asset.url.slice(1)))))
    }
    if (course.practicum.pdfFile) assert.ok(existsSync(resolve('public', course.practicum.pdfFile.slice(1))), 'Missing practicum PDF')
    const lookup = new Map(files.map(item => [item.id, item]))
    assert.equal(lookup.size, files.length, course.code + ': duplicate tree IDs')
    for (const item of files) {
      if (item.parent !== 'root') assert.equal(lookup.get(item.parent)?.kind, 'folder')
      if (item.source) assert.ok(existsSync(resolve('public', item.source.slice(1))), 'Missing asset: ' + item.source)
    }

    const slides = course.presentations.kind === 'downloads' ? course.presentations.downloads : []
    const projects = [...(course.project ? [course.project] : []), ...(course.projects ?? [])]
    const projectSources = [...projects, ...(course.projectGuides ?? [])].map(item => item.file)
    const expectedSources = [
      ...slides.map(item => item.file), ...projectSources, ...examples[course.id].map(item => item.zip),
      ...(bundles[course.id] ? [bundles[course.id]] : []),
      ...(course.presentations.kind === 'downloads' ? [course.presentations.bundle.file] : []),
      ...sharedCourseGuides.map(item => item.file),
    ]
    assert.deepEqual(files.filter(item => item.source).map(item => item.source).sort(), expectedSources.sort(),
      course.code + ': each original asset must appear exactly once')
    assert.deepEqual(files.filter(item => item.parent === 'projekat' && item.kind === 'pdf').map(item => item.source),
      projectSources)

    const rootEntries = courseFolderEntries(course, 'root', files)
    assert.equal(new Set(rootEntries.map(item => item.path)).size, rootEntries.length, course.code + ': colliding archive paths')
    const documentAssets = new Set([...companionAssets.map(asset => asset.url), course.practicum.pdfFile].filter(Boolean))
    assert.deepEqual(rootEntries.filter(item => item.url && !documentAssets.has(item.url)).map(item => item.url).sort(),
      files.filter(item => item.source && !item.bundle).map(item => item.source).sort(),
      course.code + ': folder export must contain original assets without collection ZIPs')
    const projectEntries = courseFolderEntries(course, 'projekat', files)
    assert.deepEqual(projectEntries.filter(item => item.url).map(item => item.url), projectSources)
    assert.equal(lookup.get('uputstva')?.parent, 'root')
    assert.deepEqual(files.filter(item => item.parent === 'uputstva').map(item => item.source), sharedCourseGuides.map(item => item.file))
    assert.deepEqual(courseFolderEntries(course, 'uputstva', files), sharedCourseGuides.map(item => ({ path: item.name, url: item.file })))
    if (course.id === 'ibis') {
      assert.ok(!files.some(item => item.kind === 'practicum' || item.kind === 'practicum-link' || item.id === 'vezbe'))
      assert.deepEqual(files.filter(item => item.parent === 'prezentacije' && item.kind === 'pdf').map(item => item.source),
        slides.map(item => item.file))
    } else {
      assert.ok(!files.some(item => item.id === 'prezentacije' || item.id === 'primeri'), 'No parallel presentation/example folders')
      const exerciseFolders = files.filter(item => item.parent === 'vezbe' && item.kind === 'folder')
      assert.deepEqual(exerciseFolders.map(item => item.id), Array.from({ length: 8 }, (_, i) => 'vezbe/' + String(i + 1).padStart(2, '0')))
      const { toc } = prepareDocument(course.practicum.blocks)
      for (let n = 1; n <= 8; n++) {
        const parent = 'vezbe/' + String(n).padStart(2, '0')
        const contents = files.filter(item => item.parent === parent)
        const slide = slides.find(item => Number(item.number) === n)
        const example = examples[course.id].find(item => item.exercise === n)
        assert.deepEqual(contents.filter(item => item.source).map(item => item.source),
          [...(slide ? [slide.file] : []), ...(example ? [example.zip] : [])], course.code + ': mismatched exercise materials')
        const links = contents.filter(item => item.kind === 'practicum-link')
        assert.equal(links.length, 1)
        assert.equal(links[0].exercise, n)
        const heading = toc.find(item => item.id === links[0].anchor)
        assert.ok(heading && new RegExp('^Vežba\\s+' + n + '(?:\\D|$)').test(heading.label), 'Shortcut must target its own chapter')
        const entries = courseFolderEntries(course, parent, files)
        assert.deepEqual(entries.filter(item => item.url && !documentAssets.has(item.url)).map(item => item.url), contents.filter(item => item.source).map(item => item.source))
        assert.equal(entries.filter(item => item.path.endsWith('.url')).length, 1)
        assert.ok(entries.some(item => item.text?.includes('/#' + course.id + '/praktikum/' + String(n).padStart(2, '0'))))
        const markdown = practicumMarkdown(course, n)
        for (const asset of practicumAssets(course, n)) {
          assert.ok(markdown.includes('](' + asset.path + ')'), 'Markdown must reference its companion image')
          assert.ok(entries.some(item => item.path === asset.path && item.url === asset.url), 'Exercise archive must include its companion image')
          const exercisePath = 'Računarske vežbe/Vežba ' + String(n).padStart(2, '0') + '/' + asset.path
          assert.ok(rootEntries.some(item => item.path === exercisePath && item.url === asset.url), 'Course archive must keep images beside the exercise')
        }
        assert.equal(entries.find(item => item.path === 'Vezba_' + String(n).padStart(2, '0') + '.md')?.text, markdown)
        assert.equal(readFileSync(resolve('public/downloads/praktikum', course.id, 'Vezba_' + String(n).padStart(2, '0') + '.md'), 'utf8'), markdown)
        assert.deepEqual([...markdown.matchAll(/^## Vežba (\d+)\b/gm)].map(match => Number(match[1])), [n], 'Exercise export must contain only its chapter')
        assert.ok(!/^## (?:Sažetak|Preporučena literatura)/m.test(markdown), 'Closing material must stay outside the last exercise')
      }
      assert.equal(readFileSync(resolve('public/downloads/praktikum', course.id, 'Praktikum.md'), 'utf8'), practicumMarkdown(course))
      assert.equal(readFileSync(resolve('public/downloads/praktikum', course.id, 'Kontrolne_tacke.md'), 'utf8'), checkpointMarkdown(course))
      assert.equal(rootEntries.filter(item => item.path.endsWith('.url')).length, 8)
      assert.ok(rootEntries.some(item => item.path === 'Praktikum.md' && item.text))
      for (const asset of companionAssets) assert.ok(rootEntries.some(item => item.path === asset.path && item.url === asset.url))
      if (course.practicum.pdfFile) assert.ok(rootEntries.some(item => item.path === 'Praktikum.pdf' && item.url === course.practicum.pdfFile))
      assert.ok(rootEntries.some(item => item.path === 'Projekat/Kontrolne_tacke.md' && item.text))
      const lessonEntries = courseFolderEntries(course, 'vezbe', files)
      assert.deepEqual(lessonEntries.filter(item => item.url && !documentAssets.has(item.url)).map(item => item.url).sort(),
        [...slides.filter(item => Number(item.number) > 0).map(item => item.file), ...examples[course.id].map(item => item.zip)].sort())
      assert.deepEqual(files.filter(item => item.kind === 'pdf' && item.parent === 'root').map(item => item.source),
        slides.filter(item => Number(item.number) === 0).map(item => item.file))
    }
    console.log(course.code + ': course hierarchy, asset uniqueness and folder exports verified.')
  }
} finally {
  await server.close()
}
