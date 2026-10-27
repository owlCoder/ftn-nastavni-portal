import type { Course, CourseId } from '../courses/types'
import { courseFolderEntries, safeFileName, type CourseFile } from './courseFileTree'
import type { DownloadEntry } from './courseDownloads'

export type Catalog = { course: Course; files: CourseFile[] }
export type DirectoryTarget = { courseId?: CourseId; folder: string }

export function directoryHref(target: DirectoryTarget) {
  if (!target.courseId) return '#'
  return '#' + target.courseId + (target.folder === 'root' ? '' : '/dir/' + target.folder.split('/').map(encodeURIComponent).join('/'))
}

export function directoryArchive(catalogs: Catalog[], target: DirectoryTarget): { name: string; entries: DownloadEntry[] } {
  if (!target.courseId) return {
    name: 'FTN-Materijali.zip',
    entries: catalogs.flatMap(({ course, files }) => courseFolderEntries(course, 'root', files, true)
      .map(entry => ({ ...entry, path: safeFileName(course.name + ' (' + course.code + ')') + '/' + entry.path }))),
  }
  const catalog = catalogs.find(item => item.course.id === target.courseId)
  if (!catalog) throw Error('Predmet nije pronađen.')
  const folder = catalog.files.find(file => file.kind === 'folder' && file.id === target.folder)
  if (target.folder !== 'root' && !folder) throw Error('Folder nije pronađen.')
  return {
    name: safeFileName(catalog.course.code + (folder ? '-' + folder.name : '')) + '.zip',
    entries: courseFolderEntries(catalog.course, target.folder, catalog.files, true),
  }
}
