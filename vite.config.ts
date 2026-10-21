import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

type ProcessEnv = Record<string, string | undefined>
const environment = (globalThis as typeof globalThis & {
  process?: { env?: ProcessEnv }
}).process?.env ?? {}

// Vercel always serves this application from the domain root.
// GitHub Pages explicitly supplies VITE_BASE_PATH=/<repository>/ during its build.
const publicBasePath = environment.VERCEL ? '/' : (environment.VITE_BASE_PATH?.trim() || '/')

export default defineConfig({
  base: publicBasePath,
  plugins: [react()],
  // A single stylesheet can be embedded into the production HTML reliably.
  build: { cssCodeSplit: false },
  server: { port: 5600 },
})
