import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { courses } = await server.ssrLoadModule('/src/courses/index.ts')
  const { buildCourseFiles } = await server.ssrLoadModule('/src/components/courseFileTree.ts')
  const { directoryArchive, directoryHref } = await server.ssrLoadModule('/src/components/directoryModel.ts')
  const { downloadFolderZip } = await server.ssrLoadModule('/src/components/courseDownloads.ts')
  const { parseZip, readZipBytes } = await server.ssrLoadModule('/src/lib/archive.ts')
  const catalogs = courses.map(course => ({ course, files: buildCourseFiles(course) }))
  const targets = [{ folder: 'root' }]
  for (const { course, files } of catalogs) {
    targets.push({ courseId: course.id, folder: 'root' }, ...files.filter(file => file.kind === 'folder').map(file => ({ courseId: course.id, folder: file.id })))
  }
  for (const target of targets) {
    const archive = directoryArchive(catalogs, target)
    assert.ok(archive.entries.length, 'Empty directory: ' + JSON.stringify(target))
    assert.equal(new Set(archive.entries.map(entry => entry.path)).size, archive.entries.length, 'Duplicate archive paths')
    for (const entry of archive.entries) assert.ok(!entry.path.startsWith('/') && !entry.path.split('/').includes('..'), 'Unsafe archive path')
    if (!target.courseId) continue
    const { files } = catalogs.find(item => item.course.id === target.courseId)
    const descendants = files.filter(file => {
      let parent = file.parent
      while (parent !== 'root' && parent !== target.folder) parent = files.find(item => item.id === parent)?.parent ?? 'root'
      return parent === target.folder && file.source
    })
    for (const file of descendants) assert.ok(archive.entries.some(entry => entry.url === file.source), 'Missing file including collection ZIPs: ' + file.name)
    if (target.folder !== 'root') {
      const folder = files.find(file => file.id === target.folder)
      const parentArchive = directoryArchive(catalogs, { courseId: target.courseId, folder: folder.parent })
      for (const entry of archive.entries) assert.ok(parentArchive.entries.some(parent => parent.path === folder.name + '/' + entry.path), 'Parent must include the full child directory')
    }
    assert.ok(directoryHref(target).startsWith('#' + target.courseId))
  }
  const all = directoryArchive(catalogs, { folder: 'root' })
  for (const { course } of catalogs) {
    const own = directoryArchive(catalogs, { courseId: course.id, folder: 'root' })
    for (const entry of own.entries) assert.ok(all.entries.some(item => item.path === course.name + ' (' + course.code + ')/' + entry.path), 'Global archive must preserve course directory')
  }
  assert.throws(() => directoryArchive(catalogs, { courseId: 'ers', folder: 'missing' }))

  // Exercise ZIP creation and extraction with actual Word, PowerPoint and PDF files.
  const original = { fetch: globalThis.fetch, document: globalThis.document, window: globalThis.window, create: URL.createObjectURL, revoke: URL.revokeObjectURL }
  let blob, downloadedName, clicks = 0
  const publicFile = url => {
    const value = String(url)
    const base = server.config.base
    return resolve('public', (value.startsWith(base) ? value.slice(base.length) : value.replace(/^\/+/, '')))
  }
  globalThis.fetch = async url => new Response(await readFile(publicFile(url)))
  globalThis.document = { body: { append() {} }, createElement() { return { style: {}, click() { downloadedName = this.download; clicks++ }, remove() {} } } }
  globalThis.window = { setTimeout() {} }
  URL.createObjectURL = value => { blob = value; return 'blob:test' }
  URL.revokeObjectURL = () => {}
  try {
    for (const target of [{ courseId: 'ers', folder: 'teme/01' }, { courseId: 'ers', folder: 'opsti' }]) {
      const archive = directoryArchive(catalogs, target)
      await downloadFolderZip(archive.name, archive.entries)
      assert.equal(downloadedName, archive.name)
      const buffer = await blob.arrayBuffer()
      const extracted = parseZip(buffer)
      assert.equal(extracted.length, archive.entries.length)
      for (const entry of archive.entries) {
        const stored = extracted.find(file => file.name === entry.path)
        assert.ok(stored, 'Missing UTF-8 filename: ' + entry.path)
        const expected = entry.text !== undefined ? Buffer.from(entry.text) : await readFile(resolve('public', entry.url.replace(/^\/+/, '')))
        assert.deepEqual(Buffer.from(await readZipBytes(buffer, stored)), expected, 'ZIP content must match its source')
      }
    }
    const previousClicks = clicks
    globalThis.fetch = async () => new Response('Missing', { status: 404 })
    await assert.rejects(downloadFolderZip('missing', [{ path: 'Missing.pdf', url: '/missing.pdf' }]), /HTTP 404/)
    assert.equal(clicks, previousClicks, 'Failed fetch must not produce a partial download')
  } finally {
    globalThis.fetch = original.fetch
    globalThis.document = original.document
    globalThis.window = original.window
    URL.createObjectURL = original.create
    URL.revokeObjectURL = original.revoke
  }
  console.log(`Verified ${targets.length} downloadable directories, recursive parents, all-course archive, ZIP contents and download failure handling.`)
} finally { await server.close() }
