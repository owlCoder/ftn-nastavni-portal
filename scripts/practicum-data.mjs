import { fileURLToPath } from 'node:url'

export const portalRoot = fileURLToPath(new URL('../', import.meta.url))
