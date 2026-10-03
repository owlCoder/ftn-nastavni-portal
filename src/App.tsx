import { useState } from 'react'
import { CourseApp } from './components/CourseApp'
import { SubjectSelector } from './components/SubjectSelector'
import { courseFromHash, courses } from './courses'
import type { CourseId } from './courses/types'

export default function App() {
  const [courseId, setCourseId] = useState<CourseId | undefined>(() => courseFromHash(window.location.hash)?.id)
  const course = courses.find(({ id }) => id === courseId)

  const openCourse = (id: CourseId) => {
    setCourseId(id)
    history.replaceState(null, '', `#${id}`)
  }

  const backToSubjects = () => {
    setCourseId(undefined)
    history.replaceState(null, '', window.location.pathname)
  }

  return course
    ? <CourseApp key={course.id} course={course} onBack={backToSubjects} />
    : <SubjectSelector onOpenSubject={openCourse} />
}
