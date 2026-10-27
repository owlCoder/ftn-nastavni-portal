import { useEffect, useState, type CSSProperties } from 'react'
import type { CourseFile } from './courseFileTree'
import { downloadFolderZip } from './courseDownloads'
import { directoryArchive, directoryHref, type Catalog, type DirectoryTarget } from './directoryModel'
import { assetUrl } from '../lib/assets'
import '../styles/directory.css'

function FileIcon({ folder = false }: { folder?: boolean }) {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    {folder ? <path d="M3 6h7l2 3h9v11H3z"/> : <><path d="M6 3h8l4 4v14H6zM14 3v5h4"/><path d="M9 12h6m-6 4h6"/></>}
  </svg>
}

function fileName(file: CourseFile) {
  if (file.kind === 'folder') return file.name + '/'
  return file.name
}

export function MaterialDirectory({ catalogs, courseId, folder = 'root' }: { catalogs: Catalog[]; courseId?: DirectoryTarget['courseId']; folder?: string }) {
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const allFolders = () => new Set(catalogs.flatMap(item => [item.course.id + '/root', ...item.files.filter(file => file.kind === 'folder').map(file => item.course.id + '/' + file.id)]))
  const [collapsed, setCollapsed] = useState<Set<string>>(allFolders)
  useEffect(() => { setCollapsed(new Set(catalogs.flatMap(item => [item.course.id + '/root', ...item.files.filter(file => file.kind === 'folder').map(file => item.course.id + '/' + file.id)]))) }, [catalogs])
  const catalog = catalogs.find(item => item.course.id === courseId)
  const current = catalog?.files.find(file => file.kind === 'folder' && file.id === folder)
  const target: DirectoryTarget = { courseId, folder }
  const parent: DirectoryTarget = { courseId: folder === 'root' ? undefined : courseId, folder: current?.parent ?? 'root' }
  const valid = !courseId || !!catalog && (folder === 'root' || !!current)
  const rows: { catalog: Catalog; file?: CourseFile; depth: number; key: string }[] = []
  const appendFiles = (item: Catalog, parentId: string, depth: number) => {
    for (const file of item.files.filter(file => file.parent === parentId)) {
      const key = item.course.id + '/' + file.id
      rows.push({ catalog: item, file, depth, key })
      if (file.kind === 'folder' && !collapsed.has(key)) appendFiles(item, file.id, depth + 1)
    }
  }
  if (catalog && valid) appendFiles(catalog, folder, 0)
  else if (!courseId) for (const item of catalogs) {
    const key = item.course.id + '/root'
    rows.push({ catalog: item, depth: 0, key })
    if (!collapsed.has(key)) appendFiles(item, 'root', 1)
  }
  const toggle = (key: string) => setCollapsed(previous => {
    const next = new Set(previous)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })
  const collapseAll = () => setCollapsed(allFolders())
  const breadcrumbs: { label: string; target: DirectoryTarget }[] = [{ label: '/', target: { folder: 'root' } }]
  if (catalog) {
    breadcrumbs.push({ label: catalog.course.code, target: { courseId, folder: 'root' } })
    const ancestors: CourseFile[] = []
    let ancestor = current
    while (ancestor) {
      ancestors.unshift(ancestor)
      ancestor = catalog.files.find(file => file.kind === 'folder' && file.id === ancestor!.parent)
    }
    breadcrumbs.push(...ancestors.map(file => ({ label: file.name, target: { courseId, folder: file.id } })))
  }
  const save = async (destination: DirectoryTarget) => {
    if (progress) return
    setError('')
    setProgress('Priprema ZIP-a…')
    try {
      const archive = directoryArchive(catalogs, destination)
      await downloadFolderZip(archive.name, archive.entries, setProgress)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Preuzimanje nije uspelo. Pokušajte ponovo.')
    } finally { setProgress('') }
  }
  const zipButton = (destination: DirectoryTarget, label: string) => <button type="button" className="directory-download" disabled={!!progress} onClick={() => void save(destination)} aria-label={'Preuzmi ' + label + ' kao ZIP'} title={'Preuzmi ' + label + ' kao ZIP'}>ZIP ↓</button>
  const hrefFor = (file: CourseFile, item: Catalog) => {
    const courseId = item.course.id
    if (file.source) return assetUrl(file.source)
    if (file.kind === 'folder') return directoryHref({ courseId, folder: file.id })
    if (file.kind === 'practicum') return '#' + courseId + '/praktikum'
    if (file.kind === 'practicum-link') return '#' + courseId + '/praktikum/' + String(file.exercise).padStart(2, '0')
    return '#' + courseId + '/kontrolne'
  }
  return <div className="material-directory">
    <header className="directory-heading">{catalog && <h1>{catalog.course.name}</h1>}
      {valid && <button type="button" className="directory-download" disabled={!!progress} onClick={() => void save(target)}>Preuzmi {catalog ? 'folder' : 'sve'} .zip ↓</button>}
    </header>
    {catalog && <nav className="directory-path" aria-label="Putanja foldera">{breadcrumbs.map((crumb, index) => <span key={crumb.target.folder}>
      {index > 0 && <span className="directory-slash">/</span>}
      {index === breadcrumbs.length - 1 ? <span aria-current="page">{crumb.label}</span> : <a href={directoryHref(crumb.target)}>{crumb.label}</a>}
    </span>)}</nav>}
    <div className="directory-tree-controls"><button type="button" onClick={() => setCollapsed(new Set())}>Proširi sve</button><button type="button" onClick={collapseAll}>Sažmi sve</button></div>
    {progress && <p className="directory-status" role="status">{progress}</p>}
    {error && <p className="directory-error" role="alert">{error}</p>}
    <table className="directory-table">
      <thead><tr><th scope="col">Naziv</th><th scope="col">Tip</th><th scope="col">Veličina</th><th scope="col"><span className="sr-only">Preuzimanje</span></th></tr></thead>
      <tbody>
        {catalog && <tr className="directory-parent-row"><td><a href={directoryHref(parent)}><span aria-hidden="true">↰</span> ..</a></td><td/><td/><td>{zipButton(parent, 'roditeljski folder')}</td></tr>}
        {rows.map(({ catalog: item, file, depth, key }) => {
          const isFolder = !file || file.kind === 'folder'
          const label = file ? fileName(file) : item.course.name + ' (' + item.course.code + ')/'
          const destination = { courseId: item.course.id, folder: file?.id ?? 'root' }
          return <tr key={key} className={isFolder ? 'directory-folder-row' : undefined}>
            <td><div className="directory-name directory-tree-name" style={{ '--directory-depth': depth } as CSSProperties}>
              {isFolder ? <button type="button" className="directory-toggle" aria-label={(collapsed.has(key) ? 'Proširi ' : 'Sažmi ') + (file?.name ?? item.course.code)} aria-expanded={!collapsed.has(key)} onClick={() => toggle(key)}>{collapsed.has(key) ? '▸' : '▾'}</button> : <span className="directory-tree-spacer"/>}
              {isFolder ? <button type="button" className="directory-entry-link directory-folder-toggle" aria-expanded={!collapsed.has(key)} onClick={() => toggle(key)}><FileIcon folder/><span>{label}</span></button> :
                <a className="directory-entry-link" href={hrefFor(file!, item)} target={file?.kind === 'pdf' ? '_blank' : undefined} rel={file?.kind === 'pdf' ? 'noopener noreferrer' : undefined} download={file?.source && file.kind !== 'pdf' ? '' : undefined}>
                  <FileIcon/><span>{label}</span>
                </a>}
              {file?.editableSource && <a className="directory-pdf" href={assetUrl(file.editableSource)} download aria-label={'Preuzmi ' + file.name.replace(/\.pdf$/i, '') + ' kao Word dokument'}>Word ↓</a>}

            </div></td>
            <td>{isFolder ? 'Folder' : file?.source ? file.source.split('.').pop()?.toUpperCase() : 'Online'}</td>
            <td>{file?.size ?? '—'}</td><td>{isFolder ? zipButton(destination, file?.name ?? item.course.code) : file?.source && <a className="directory-download" href={assetUrl(file.source)} download aria-label={'Preuzmi ' + file.name}>↓</a>}</td>
          </tr>
        })}
      </tbody>
    </table>
    {!valid && <p className="directory-note">Folder nije pronađen. <a href={directoryHref({ courseId, folder: 'root' })}>Nazad na predmet</a></p>}
    <footer className="directory-footer"><span>{rows.length} prikazanih stavki</span></footer>
  </div>
}
