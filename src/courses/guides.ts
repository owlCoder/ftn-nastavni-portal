import type { CourseGuide } from './types'

export const sharedCourseGuides: CourseGuide[] = [
  {
    id: 'tapiz-lms',
    name: 'Tapiz LMS — Uputstvo.pdf',
    description: 'Uputstvo za korišćenje Tapiz LMS-a.',
    file: '/downloads/uputstva/Uputstvo_Tapiz_LMS.pdf',
    pages: 2,
    size: '663 KB',
  },
  {
    id: 'tapiz-boards',
    name: 'Tapiz Boards — Uputstvo.pdf',
    description: 'Uputstvo za korišćenje Tapiz Boards-a.',
    file: '/downloads/uputstva/Tapiz_Boards_Uputstvo.pdf',
    editableFile: '/downloads/uputstva/Tapiz_Boards_Uputstvo.docx',
    pages: 8,
    size: '217 KB',
  },
]
