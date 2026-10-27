import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' })
try {
  const { catalogsFromTree, loadGithubMaterials } = await server.ssrLoadModule('/src/lib/githubMaterials.ts')
  const courses = (await server.ssrLoadModule('/src/courses/index.ts')).courses
  const roots = [
    'Elementi razvoja softvera (ERS)', 'Osnove informacione bezbednosti (OIB)',
    'Osnove distribuiranog programiranja (ODP)', 'Informaciona bezbednost infrastrukturnih sistema (IBIS)',
  ]
  const tree = roots.flatMap((root, index) => {
    const folder = index === 0 ? 'Nastavni materijali' : 'Računarske vežbe'
    return [
      { path: `${root}/${folder}`, type: 'tree' },
      { path: `${root}/${folder}/01 Prva tema`, type: 'tree' },
      { path: `${root}/${folder}/01 Prva tema/Test #1.pdf`, type: 'blob', size: 1024 },
      { path: `${root}/${folder}/.DS_Store`, type: 'blob' },
      { path: `${root}/${folder}/01 Prva tema/Izvor.docx`, type: 'blob' },
      { path: `${root}/${folder}/01 Prva tema/Izvor.pptx`, type: 'blob' },
      { path: `${root}/${folder}/01 Prva tema/Primer.zip`, type: 'blob' },
    ]
  })
  const sha = 'a'.repeat(40)
  const catalogs = catalogsFromTree(courses, tree, sha)
  const ers = catalogs.find(x => x.course.id === 'ers')
  assert.ok(ers.files.some(file => file.id === 'nastavni'))
  assert.ok(ers.files.some(file => file.id === 'teme/01' && file.parent === 'nastavni'))
  const file = ers.files.find(file => file.name === 'Test #1.pdf')
  assert.equal(file.parent, 'teme/01')
  assert.ok(file.source.includes('/' + sha + '/'))
  assert.ok(file.source.endsWith('Test%20%231.pdf'))
  assert.ok(catalogs.every(catalog => !catalog.files.some(item => /\.(docx|pptx)$/i.test(item.name) || item.name === '.DS_Store')))
  assert.ok(ers.files.some(item => item.name === 'Primer.zip'))
  assert.ok(catalogs.find(x => x.course.id === 'oib').files.some(file => file.id === 'vezbe/01'))

  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ revision: sha, tree }), { status: 200 })
  assert.equal((await loadGithubMaterials(courses)).revision, sha)
  globalThis.fetch = async url => String(url).includes('materials-index.json')
    ? new Response('', { status: 404 })
    : new Response(JSON.stringify(String(url).includes('/commits/') ? { sha } : { tree, truncated: false }), { status: 200 })
  assert.equal((await loadGithubMaterials(courses)).revision, sha)
  globalThis.fetch = async url => String(url).includes('materials-index.json')
    ? new Response('', { status: 404 })
    : new Response(JSON.stringify(String(url).includes('/commits/') ? { sha } : { tree, truncated: true }), { status: 200 })
  await assert.rejects(() => loadGithubMaterials(courses), /nije potpun/)
  globalThis.fetch = async () => new Response('', { status: 403 })
  await assert.rejects(() => loadGithubMaterials(courses), /HTTP 403/)
  globalThis.fetch = originalFetch
  console.log('GitHub materials: paths, existing routes, snapshot and failure handling verified.')
} finally { await server.close() }
