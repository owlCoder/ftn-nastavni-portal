import type { Checkpoint } from './types'

export function exerciseRange({ exercises: [first, last] }: Checkpoint) {
  return first === last ? `Vežba ${first}` : `Vežba ${first}–${last}`
}
