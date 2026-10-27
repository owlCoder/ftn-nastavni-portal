import type { CourseFileKind } from './courseFileTree'

export function CourseFileIcon({ kind }: { kind: CourseFileKind }) {
  const color = {
    folder: '#5a83aa', practicum: '#497c71', 'practicum-link': '#6982a1',
    checkpoints: '#6b8255', file: '#6982a1', pdf: '#b96561', docx: '#5a83aa', pptx: '#9a6854', zip: '#747c91',
  }[kind]
  return <svg aria-hidden="true" viewBox="0 0 36 36" fill="none" className={'ers-entry-icon ers-entry-' + kind}>
    <g transform="translate(-3 -3) scale(1.17)" stroke={color} strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      {kind === 'folder' ? <path fill="#e3edf6" d="M8 12a2 2 0 0 1 2-2h6l3 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V12Zm0 5h20" /> :
        kind === 'practicum' ? <><path fill="#edf4f1" d="M18 12c-3-2-7-2-11-1v15c4-1 8-1 11 1 3-2 7-2 11-1V11c-4-1-8-1-11 1Zm0 0v15" /><path d="M11 16h3m-3 4h3m8-4h3m-3 4h3" /></> :
          kind === 'checkpoints' ? <><rect x="9" y="9" width="18" height="19" rx="3" /><path d="M14 8h8v4h-8V8Zm-1 13 3 3 7-7" /></> :
            kind === 'zip' ? <><path d="M10 8h11l5 5v15H10V8Zm11 0v5h5M17 9v2m2 1v2m-2 1v2m2 1v2" /><rect x="16" y="22" width="5" height="4" rx="1" /></> :
              kind === 'practicum-link' ? <><path d="M23 19v7H9V12h7M20 9h7v7m0-7L16 20" /><path d="M12 24h6" /></> :
                <><path d="M10 8h11l5 5v15H10V8Zm11 0v5h5M14 18h8m-8 4h6" /><path d="M14 26h8" /></>}
    </g>
  </svg>
}

export function CourseBrowserIcon({ name }: { name: 'back' | 'home' | 'list' | 'grid' | 'chevron' | 'download' | 'folder' | 'search' | 'fullscreen' }) {
  return <svg className="ers-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'folder' ? <path d="M3 7h7l2 3h9v10H3V7Zm0 5h18" /> :
      name === 'search' ? <><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></> :
        name === 'fullscreen' ? <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/> :
    name === 'back' ? <path d="m14 6-6 6 6 6" /> :
      name === 'home' ? <><path d="m4 10 8-7 8 7v10H4V10Z" /><path d="M9 20v-7h6v7" /></> :
        name === 'list' ? <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="3" /></> :
          name === 'grid' ? <>{[4, 14].flatMap(x => [4, 14].map(y => <rect key={x + ':' + y} x={x} y={y} width="6" height="6" rx="1" />))}</> :
            name === 'chevron' ? <path d="m9 6 6 6-6 6" /> :
              <><path d="M12 4v11m-4-4 4 4 4-4M5 17v3h14v-3" /></>}
  </svg>
}
