import { ersCourse } from './ers'
import { odpCourse } from './odp'
import { oibCourse } from './oib'
import { ibisCourse } from './ibis'
import type { Course } from './types'

export const courses: Course[] = [ersCourse, oibCourse, odpCourse, ibisCourse]

export function courseFromHash(hash: string) {
  return courses.find((course) => hash.startsWith(`#${course.id}`))
}
