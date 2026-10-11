import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

export const portalRoot = fileURLToPath(new URL('../', import.meta.url))

// Use the same data modules and serializer as the portal, without a browser.
export async function loadPracticumData() {
  const server = await createServer({ root: portalRoot, server: { middlewareMode: true }, appType: 'custom' })
  try {
    const { courses } = await server.ssrLoadModule('/src/courses/index.ts')
    const markdown = await server.ssrLoadModule('/src/practicum/markdown.ts')
    return {
      courses,
      ...markdown,
    }
  } finally {
    await server.close()
  }
}
