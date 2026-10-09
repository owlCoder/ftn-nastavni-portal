import type { ReactNode } from 'react'

export type AppIconId = 'finder' | 'ers' | 'oib' | 'odp' | 'sudoku' | 'tetris' | 'invaders' | 'notes' | 'readme' | 'trash'

function Symbol({ id }: { id: AppIconId }): ReactNode {
  switch (id) {
    case 'finder':
      return <>
        <path d="M4 4h28v28H4z" fill="#d8f3ff"/>
        <path d="M4 4h14c-1 7-2 11 0 17l-4 11H4z" fill="#37a8ec"/>
        <path d="M15 9.5 13.6 18" stroke="#17395b" strokeWidth="1.7" strokeLinecap="round"/>
        <path d="M9 13.5v3m16-3v3" stroke="#17395b" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M10 24c3.3 3.2 12.8 3.2 16 0" fill="none" stroke="#17395b" strokeWidth="1.7" strokeLinecap="round"/>
      </>
    case 'ers':
      return <>
        <rect x="6" y="7" width="24" height="22" rx="4" fill="rgba(255,255,255,.17)" stroke="rgba(255,255,255,.42)" strokeWidth=".6"/>
        <path d="m14 14-5 4 5 4m8-8 5 4-5 4m-2.5-10-3 12" fill="none" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    case 'oib':
      return <>
        <path d="M18 5 29 9v8c0 7.2-4.4 11.5-11 14-6.6-2.5-11-6.8-11-14V9z" fill="rgba(255,255,255,.25)" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14.5 16v-2a3.5 3.5 0 0 1 7 0v2m-7.5 0h8a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-8a1.5 1.5 0 0 1-1.5-1.5v-5a1.5 1.5 0 0 1 1.5-1.5Z" fill="white"/>
        <circle cx="18" cy="20" r="1.15" fill="#cc6274"/>
      </>
    case 'odp':
      return <>
        <path d="M10 11 25 10 18 25 10 11Z" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.75)" strokeWidth="2"/>
        <path d="M10 11 18 25 25 10" fill="none" stroke="white" strokeWidth="2.2"/>
        <circle cx="10" cy="10" r="4.2" fill="#fff"/>
        <circle cx="26" cy="10" r="4.2" fill="#fff"/>
        <circle cx="18" cy="26" r="4.2" fill="#fff"/>
        <circle cx="10" cy="10" r="1.8" fill="#159b87"/>
        <circle cx="26" cy="10" r="1.8" fill="#159b87"/>
        <circle cx="18" cy="26" r="1.8" fill="#159b87"/>
      </>
    case 'sudoku':
      return <>
        <rect x="7.5" y="7.5" width="21" height="21" rx="2.6" fill="rgba(255,255,255,.93)"/>
        <path d="M14.5 7.5v21m7-21v21M7.5 14.5h21m-21 7h21" stroke="#aa8acb" strokeWidth="1.05"/>
        <path d="M11.5 10.9h.1m6.4 0h.1m7 7h.1m-14 7h.1" stroke="#774fae" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="10" y="12.8" fontSize="6.3" fontWeight="750" fill="#774fae">1</text>
        <text x="17" y="19.9" fontSize="6.3" fontWeight="750" fill="#774fae">9</text>
        <text x="24" y="26.8" fontSize="6.3" fontWeight="750" fill="#774fae">4</text>
      </>
    case 'tetris':
      return <>
        <g stroke="rgba(255,255,255,.55)" strokeWidth=".7">
          <rect x="7" y="18" width="7" height="7" rx="1.2" fill="#f9eac2"/>
          <rect x="14.7" y="18" width="7" height="7" rx="1.2" fill="#f9eac2"/>
          <rect x="14.7" y="10.3" width="7" height="7" rx="1.2" fill="#f9eac2"/>
          <rect x="22.4" y="18" width="7" height="7" rx="1.2" fill="#fffcf1"/>
          <rect x="7" y="25.7" width="7" height="4" rx="1" fill="#fbd5b8"/>
          <rect x="14.7" y="25.7" width="7" height="4" rx="1" fill="#fbd5b8"/>
          <rect x="22.4" y="25.7" width="7" height="4" rx="1" fill="#fbd5b8"/>
        </g>
      </>
    case 'invaders':
      return <path d="M13 7v3h10V7h3v3h3v3h2v12h-4v-4h-4v4h-3v3h-4v-3h-3v-4H9v4H5V13h2v-3h3V7zm-1 10h4v4h-4zm8 0h4v4h-4z" fill="#b8f4d7" fillRule="evenodd"/>
    case 'notes':
      return <>
        <rect x="7" y="6" width="22" height="25" rx="3.4" fill="#fffaf0"/>
        <path d="M7 10a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v3H7z" fill="#ffca70"/>
        <path d="M11 17h14m-14 4h14m-14 4h10" stroke="#a4a1a2" strokeWidth="1.4" strokeLinecap="round"/>
      </>
    case 'readme':
      return <>
        <path d="M10 5h12l6 6v19H10z" fill="#fff" stroke="#d2dbe9" strokeWidth="1.1"/>
        <path d="M22 5v6h6" fill="#e3ebf6"/>
        <path d="M14 16h10m-10 4h10m-10 4h7" stroke="#799cc8" strokeWidth="1.3" strokeLinecap="round"/>
      </>
    case 'trash':
      return <>
        <path d="M10 11h16l-2 18H12l-2-18Z" fill="#e4eff7" stroke="#9aafbe" strokeWidth="1.5" />
        <path d="M8 9h20v4H8z" fill="#f6f9fc" stroke="#8fa8b7" strokeWidth="1.2" />
        <path d="M14 9V7h8v2" fill="none" stroke="#cbdde9" strokeWidth="2.5" />
        <path d="M15 16v9m6-9v9" stroke="#90aabb" strokeWidth="1.4" strokeLinecap="round" />
      </>
  }
}

export function DockAppIcon({ id }: { id: AppIconId }) {
  return <span className={`os-appicon os-appicon-${id}`} aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><Symbol id={id}/></svg></span>
}
