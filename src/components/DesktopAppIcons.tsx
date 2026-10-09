import type { ReactNode } from 'react'

export type AppIconId =
  | 'finder' | 'ers' | 'oib' | 'odp' | 'sudoku' | 'tetris' | 'invaders'
  | 'snake' | 'merge' | 'calendar' | 'monitor' | 'notes' | 'readme' | 'trash'

/*
 * Symbolic Adwaita-inspired glyphs. No background rectangles, coloured app
 * tiles or baked-in gradients: the containing surface controls the icon colour.
 */
function Symbol({ id }: { id: AppIconId }): ReactNode {
  switch (id) {
    case 'finder':
      return <><rect x="6" y="5" width="24" height="26" rx="4"/><path d="M6 13h24M12 20h12M12 25h8"/></>
    case 'ers':
      return <><path d="m12 11-7 7 7 7m12-14 7 7-7 7M21 7l-6 22"/></>
    case 'oib':
      return <><path d="M18 4 29 9v8c0 8-5 13-11 15C12 30 7 25 7 17V9z"/><rect x="13" y="17" width="10" height="9" rx="2"/><path d="M15 17v-3a3 3 0 0 1 6 0v3"/></>
    case 'odp':
      return <><path d="m10 10 16 0-8 16z"/><circle cx="10" cy="10" r="3"/><circle cx="26" cy="10" r="3"/><circle cx="18" cy="26" r="3"/></>
    case 'sudoku':
      return <><rect x="5" y="5" width="26" height="26" rx="3"/><path d="M13.7 5v26m8.6-26v26M5 13.7h26m-26 8.6h26"/><path d="M8.5 8.5h.1m8.2 8.2h.1m8.3 8.3h.1" strokeWidth="3" strokeLinecap="round"/></>
    case 'tetris':
      return <>
        <rect x="7" y="20" width="7" height="7" rx="1"/>
        <rect x="14.5" y="20" width="7" height="7" rx="1"/>
        <rect x="22" y="20" width="7" height="7" rx="1"/>
        <rect x="14.5" y="12.5" width="7" height="7" rx="1"/>
        <rect x="22" y="12.5" width="7" height="7" rx="1"/>
        <path d="M9 10h4m-4 4h4" strokeLinecap="round"/>
      </>
    case 'invaders':
      return <>
        <path d="M10 10V6m16 4V6M7 16V12h22v4h3v10h-5v-4h-4v6H13v-6H9v4H4V16z"/>
        <path d="M11.5 17h2m9 0h2" strokeWidth="2.8" strokeLinecap="round"/>
      </>
    case 'snake':
      return <>
        <path d="M6 22v-6a7 7 0 0 1 7-7h7a5 5 0 0 1 5 5v2c0 3-2 5-5 5h-7v7"/>
        <path d="M13 28h4m8-13 5 1m-5-1 4-3"/>
        <circle cx="21.5" cy="13.5" r="1" fill="currentColor" stroke="none"/>
      </>
    case 'merge':
      return <>
        <rect x="5" y="5" width="12" height="12" rx="2"/>
        <rect x="19" y="5" width="12" height="12" rx="2"/>
        <rect x="5" y="19" width="12" height="12" rx="2"/>
        <rect x="19" y="19" width="12" height="12" rx="2"/>
        <g fontSize="8.5" fontWeight="750" fill="currentColor" stroke="none" textAnchor="middle">
          <text x="11" y="13.9">2</text><text x="25" y="13.9">4</text>
          <text x="11" y="27.9">8</text><text x="25" y="27.9">16</text>
        </g>
      </>
    case 'calendar':
      return <><rect x="5" y="8" width="26" height="23" rx="3"/><path d="M5 15h26M11 5v6m14-6v6"/><path d="M12 21h4m5 0h3m-12 5h4m5 0h3" strokeLinecap="round"/></>
    case 'monitor':
      return <><rect x="4" y="7" width="28" height="22" rx="4"/><path d="M7 19h5l3-7 6 13 3-6h5" strokeLinejoin="round"/></>
    case 'notes':
      return <><rect x="7" y="5" width="22" height="27" rx="3"/><path d="M11 5v6h14V5M11 17h14m-14 5h14m-14 5h9" strokeLinecap="round"/></>
    case 'readme':
      return <><circle cx="18" cy="18" r="13"/><circle cx="18" cy="11" r="1.8" fill="currentColor" stroke="none"/><path d="M18 17v9" strokeWidth="2.7" strokeLinecap="round"/></>
    case 'trash':
      return <><path d="M10 10h16l-2 21H12z"/><path d="M7 10h22m-15 0V6h8v4M15 16v10m6-10v10" strokeLinecap="round"/></>
  }
}

export function DockAppIcon({ id }: { id: AppIconId }) {
  return <span className={`os-appicon os-appicon-${id}`} aria-hidden="true">
    <svg viewBox="0 0 36 36" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Symbol id={id}/>
    </svg>
  </span>
}
