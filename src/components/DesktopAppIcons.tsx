import type { ReactNode } from 'react'

export type AppIconId =
  | 'finder' | 'ers' | 'oib' | 'odp' | 'sudoku' | 'tetris' | 'invaders'
  | 'snake' | 'merge' | 'calendar' | 'monitor' | 'notes' | 'readme' | 'trash'
  | 'calculator' | 'editor' | 'terminal' | 'files' | 'tasks' | 'pomodoro' | 'converter' | 'draw' | 'stopwatch' | 'settings'

/**
 * Minimal two-tone application symbols. Shapes are the icons themselves:
 * there is no full-size coloured tile, rounded-square backdrop or gradient.
 */
function Symbol({ id }: { id: AppIconId }): ReactNode {
  switch (id) {
    case 'finder':
      return <>
        <path d="M8 6h20a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" fill="#bdddf7" stroke="#edf6ff" strokeWidth="1.6"/>
        <path d="M5 13h26M13 20h11M13 25h8" stroke="#4a82b7" strokeWidth="2" strokeLinecap="round"/>
      </>
    case 'ers':
      return <path d="m12 11-7 7 7 7m12-14 7 7-7 7M21 7l-6 22" stroke="#a4caff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>

    case 'oib':
      return <>
        <path d="M18 4 29 9v8c0 8-5 13-11 15C12 30 7 25 7 17V9z" fill="#a5bffd" fillOpacity=".22" stroke="#b6caff" strokeWidth="2.5" strokeLinejoin="round"/>
        <rect x="13" y="17" width="10" height="9" rx="2" fill="#a5bffd" stroke="#b6caff" strokeWidth="1.6"/>
        <path d="M15 17v-3a3 3 0 0 1 6 0v3" stroke="#f5f7ff" strokeWidth="2.2" strokeLinecap="round"/>
      </>
    case 'odp':
      return <>
        <path d="M10 10h16l-8 16Z" fill="#63cdbb" fillOpacity=".20" stroke="#73e4ce" strokeWidth="2.3" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="3.2" fill="#a0f3df"/>
        <circle cx="26" cy="10" r="3.2" fill="#a0f3df"/>
        <circle cx="18" cy="26" r="3.2" fill="#a0f3df"/>
      </>
    case 'sudoku':
      return <>
        <rect x="5" y="5" width="26" height="26" rx="2.8" fill="#a98bec" fillOpacity=".16" stroke="#cab5ff" strokeWidth="2.2"/>
        <path d="M13.7 5v26m8.6-26v26M5 13.7h26m-26 8.6h26" stroke="#a58bea" strokeWidth="1.5"/>
        <path d="M9.3 9.4h.1m8.5 8.6h.1m8.6 8.4h.1" stroke="#f2eaff" strokeWidth="3.3" strokeLinecap="round"/>
      </>
    case 'tetris':
      return <>
        <rect x="7" y="20" width="7" height="7" rx="1.2" fill="#ffdd99"/>
        <rect x="14.5" y="20" width="7" height="7" rx="1.2" fill="#ffc078"/>
        <rect x="22" y="20" width="7" height="7" rx="1.2" fill="#ff9e85"/>
        <rect x="14.5" y="12.5" width="7" height="7" rx="1.2" fill="#ffe6a8"/>
        <rect x="22" y="12.5" width="7" height="7" rx="1.2" fill="#ffc078"/>
        <path d="M9 10h4m-4 4h4" fill="none" stroke="#fff0d3" strokeWidth="2.1" strokeLinecap="round"/>
      </>
    case 'invaders':
      return <>
        <path d="M10 10V6m16 4V6" stroke="#9ef4ba" strokeWidth="2.7" strokeLinecap="round"/>
        <path d="M7 16V12h22v4h3v10h-5v-4h-4v6H13v-6H9v4H4V16z" fill="#7fe5aa" stroke="#a5f6c8" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M12 16v3m12-3v3" stroke="#1e6555" strokeWidth="2.8" strokeLinecap="round"/>
      </>
    case 'snake':
      return <>
        <path d="M6 22v-6a7 7 0 0 1 7-7h7a5 5 0 0 1 5 5v2c0 3-2 5-5 5h-7v7" fill="none" stroke="#85e9de" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="21" cy="13.4" r="1.15" fill="#205962"/>
        <circle cx="29" cy="25" r="4" fill="#ffba99"/>
      </>
    case 'merge':
      return <>
        <rect x="5" y="5" width="12" height="12" rx="2.4" fill="#ffebbf"/>
        <rect x="19" y="5" width="12" height="12" rx="2.4" fill="#ffdaaa"/>
        <rect x="5" y="19" width="12" height="12" rx="2.4" fill="#ffc892"/>
        <rect x="19" y="19" width="12" height="12" rx="2.4" fill="#ffb288"/>
        <g fontSize="8.4" fontWeight="800" fill="#8a5948" textAnchor="middle">
          <text x="11" y="13.7">2</text><text x="25" y="13.7">4</text>
          <text x="11" y="27.6">8</text><text x="25" y="27.6">16</text>
        </g>
      </>
    case 'calendar':
      return <>
        <rect x="5" y="8" width="26" height="23" rx="3" fill="#fff2e7" stroke="#fbe1d7" strokeWidth="1.1"/>
        <path d="M5 15V11a3 3 0 0 1 3-3h20a3 3 0 0 1 3 3v4Z" fill="#fa8d85"/>
        <path d="M11 5v6m14-6v6" stroke="#fff5ef" strokeWidth="2.8" strokeLinecap="round"/>
        <path d="M12 21h4m5 0h3m-12 5h4m5 0h3" stroke="#ba7a73" strokeWidth="2" strokeLinecap="round"/>
      </>
    case 'monitor':
      return <>
        <rect x="4" y="7" width="28" height="22" rx="4" fill="#2d465a" fillOpacity=".45" stroke="#8fbeda" strokeWidth="2.2"/>
        <path d="M7 19h5l3-7 6 13 3-6h5" fill="none" stroke="#90efbd" strokeWidth="2.7" strokeLinejoin="round" strokeLinecap="round"/>
      </>
    case 'notes':
      return <>
        <rect x="7" y="5" width="22" height="27" rx="3" fill="#fff6dc" stroke="#f7e6ba" strokeWidth="1.2"/>
        <path d="M7 9a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v3H7Z" fill="#ffc878"/>
        <path d="M11 17h14m-14 5h14m-14 5h10" fill="none" stroke="#b3a28e" strokeWidth="1.7" strokeLinecap="round"/>
      </>
    case 'readme':
      return <>
        <circle cx="18" cy="18" r="13" fill="#d6e5ff" stroke="#f3f8ff" strokeWidth="1.2"/>
        <circle cx="18" cy="11" r="2" fill="#567eb8"/>
        <path d="M18 17v9" fill="none" stroke="#567eb8" strokeWidth="2.8" strokeLinecap="round"/>
      </>
    case 'calculator':
      return <><rect x="7" y="3" width="22" height="30" rx="4" fill="#b9d6f4" stroke="#d9e9fb" strokeWidth="1"/><rect x="11" y="8" width="14" height="5" rx="1" fill="#43698e"/>{[0,1,2].flatMap(y=>[0,1,2].map(x=><rect key={y+'-'+x} x={11+x*5.1} y={17+y*4.5} width="3.6" height="3" rx=".7" fill={x===2&&y===2?'#549dcc':'#7294b7'}/>))}</>
    case 'editor':
      return <><path d="M7 4h15l6 6v23H7z" fill="#e7e5ff" stroke="#c9c8ed" strokeWidth="1.3"/><path d="M22 4v7h6M11 17h13M11 22h13M11 27h10" stroke="#8e7ac1" strokeWidth="2" strokeLinecap="round"/></>
    case 'terminal':
      return <><rect x="3" y="6" width="30" height="24" rx="4.5" fill="#273b53" stroke="#8197b1" strokeWidth="1.1"/><path d="m9 14 5 5-5 5m9 0h8" stroke="#a4f0bd" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'files':
      return <><path d="M4 11V8a4 4 0 0 1 4-4h9l4 5h7a4 4 0 0 1 4 4v16H4z" fill="#529fda"/><path d="M4 14a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#9acbec" stroke="#c2e0f5" strokeWidth="1"/></>
    case 'tasks':
      return <><rect x="7" y="4" width="23" height="29" rx="3" fill="#f9f3e1" stroke="#e5dcc6" strokeWidth="1.1"/>{[12,19,26].map(y=><g key={y}><rect x="11" y={y-2} width="5" height="5" rx="1" fill="#9cc9b3"/><path d={'M19 '+y+'h7'} stroke="#8f9eaa" strokeWidth="2" strokeLinecap="round"/></g>)}</>
    case 'pomodoro':
      return <><circle cx="18" cy="20" r="12" fill="#f7c9a1" stroke="#ffe3cb" strokeWidth="1.6"/><path d="M18 7V3m-5 0h10M18 20v-7m0 7 6 3" stroke="#ae6f59" strokeWidth="2.3" strokeLinecap="round"/></>
    case 'converter':
      return <><rect x="5" y="7" width="26" height="23" rx="5" fill="#cfebd9" stroke="#b8d7c5" strokeWidth="1.1"/><path d="M11 16h14m-4-4 4 4-4 4M25 23H11m4-4-4 4 4 4" stroke="#418a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'draw':
      return <><path d="M6 30c9-2 7-12 19-20l5 5C22 26 15 26 6 30Z" fill="#dbb4ef" stroke="#c393dd" strokeWidth="1.2"/><path d="M24 9 28 5l4 4-4 5" fill="#ebca9f"/><path d="M6 30 4 33l8-2" fill="#82a1d9"/></>
    case 'stopwatch':
      return <><circle cx="18" cy="21" r="12" fill="#b5deee" stroke="#e6f3fc" strokeWidth="1.5"/><path d="M18 8V3m-5 0h10M18 14v8l6 3" stroke="#3d829f" strokeWidth="2.5" strokeLinecap="round"/></>
    case 'settings':
      return <><circle cx="18" cy="18" r="12" fill="#b6c2d1"/><path d="M18 5v6m0 14v6M5 18h6m14 0h6M9 9l4 4m10 10 4 4M27 9l-4 4M13 23l-4 4" stroke="#eaf1f9" strokeWidth="3" strokeLinecap="round"/><circle cx="18" cy="18" r="5" fill="#e7eef5" stroke="#7b8b9e" strokeWidth="2"/></>
    case 'trash':
      return <>
        <path d="M10 10h16l-2 21H12Z" fill="#d9e1e9" stroke="#eff3f8" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M7 10h22m-15 0V6h8v4M15 16v10m6-10v10" fill="none" stroke="#91a4b5" strokeWidth="2" strokeLinecap="round"/>
      </>
  }
}

export function DockAppIcon({ id }: { id: AppIconId }) {
  return <span className={`os-appicon os-appicon-${id}`} aria-hidden="true">
    <svg viewBox="0 0 36 36" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Symbol id={id}/>
    </svg>
  </span>
}
