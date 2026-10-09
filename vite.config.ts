import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type ProcessEnv = Record<string, string | undefined>
const environment = (globalThis as typeof globalThis & {
  process?: { env?: ProcessEnv }
}).process?.env ?? {}

// Most hosts (including local development and Vercel) serve from /.
// The GitHub Pages workflow explicitly sets VITE_BASE_PATH to /<repository>/.
const publicBasePath = environment.VITE_BASE_PATH?.trim() || '/'

export default defineConfig({
  base: publicBasePath,
  plugins: [react()],
  server: { port: 5600 },
})
