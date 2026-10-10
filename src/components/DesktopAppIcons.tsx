import type { ReactNode } from 'react'

export type AppIconId =
  | 'finder' | 'ers' | 'oib' | 'odp' | 'sudoku' | 'tetris' | 'invaders'
  | 'snake' | 'merge' | 'calendar' | 'monitor' | 'notes' | 'readme' | 'trash'
  | 'calculator' | 'editor' | 'terminal' | 'files' | 'tasks' | 'pomodoro' | 'converter' | 'draw' | 'stopwatch' | 'settings'
  | 'photos' | 'colors' | 'markdown' | 'json' | 'passwords' | 'flashcards' | 'habits' | 'worldclock' | 'typing' | 'bookmarks'
  | 'diff' | 'regex' | 'base64' | 'urltools' | 'hashing' | 'csv' | 'entities' | 'timestamp' | 'uuid' | 'contrast'
  | 'kanban' | 'expenses' | 'grades' | 'reading' | 'countdown' | 'planner' | 'decisions' | 'quiz' | 'matrix' | 'metronome'

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

    case 'photos':
      return <><rect x="4" y="7" width="28" height="24" rx="5" fill="#9fc9f0" stroke="#c6e1fc" strokeWidth="1.5"/><circle cx="23.5" cy="14" r="3.1" fill="#ffe0a2"/><path d="m6 26 7.5-9 6 6 4-4 7 8" fill="#6ba994" stroke="#438b81" strokeWidth="1.1"/></>
    case 'colors':
      return <><path d="M18 4C10 4 4 10.3 4 18c0 7.8 6 14 14 14 3.4 0 5.8-2.3 5.8-5.1 0-2-1.2-3.4-1.2-5.1 0-1.2 1.2-2 2.7-2h1.9a4 4 0 0 0 4-4C32 10 26 4 18 4Z" fill="#e5cee8" stroke="#eae5ee" strokeWidth="1.2"/><circle cx="12" cy="12" r="2.6" fill="#e77979"/><circle cx="21" cy="10.4" r="2.6" fill="#efc26d"/><circle cx="27" cy="17" r="2.6" fill="#75bba1"/><circle cx="12" cy="22" r="2.6" fill="#7aa9e5"/></>
    case 'markdown':
      return <><rect x="4" y="7" width="28" height="23" rx="4.5" fill="#a9bcdd" stroke="#e0e9f7" strokeWidth="1.2"/><path d="M8 24V14l5 5 5-5v10m3-10v10m-3-3 3 3 3-3m-3 3 3-3" stroke="#355687" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'json':
      return <><rect x="4" y="5" width="28" height="26" rx="5" fill="#c0aeeb" stroke="#e2d9ff" strokeWidth="1.3"/><path d="M14 11c-4 0-3 3.4-3 7s-1 7-3 7m14-14c4 0 3 3.4 3 7s1 7 3 7" fill="none" stroke="#5b468e" strokeWidth="2.3" strokeLinecap="round"/><circle cx="18" cy="18" r="2" fill="#5b468e"/></>
    case 'passwords':
      return <><path d="M7 15V12a11 11 0 0 1 22 0v3" stroke="#6ea8c4" strokeWidth="3" strokeLinecap="round"/><rect x="6" y="14" width="24" height="18" rx="5" fill="#9cc7e0" stroke="#d7ecf4" strokeWidth="1.3"/><circle cx="18" cy="21" r="2.8" fill="#315a78"/><path d="M18 24v4" stroke="#315a78" strokeWidth="2.4" strokeLinecap="round"/></>
    case 'flashcards':
      return <><rect x="7" y="8" width="23" height="23" rx="4" fill="#b1c9eb" stroke="#ddeaff" strokeWidth="1.2"/><rect x="4" y="5" width="23" height="22" rx="4" fill="#f0dfa9" stroke="#fff2c8" strokeWidth="1.2"/><path d="M10 12h11m-11 5h8m-8 5h5" stroke="#bc9564" strokeWidth="2" strokeLinecap="round"/></>
    case 'habits':
      return <><rect x="5" y="5" width="26" height="27" rx="5" fill="#b2ddc9" stroke="#dff3e7" strokeWidth="1.2"/><path d="M11 12h14m-14 7h14m-14 7h14" stroke="#7da493" strokeWidth="2" strokeLinecap="round"/><path d="m8 12 2 2 4-5m-6 10 2 2 4-5m-6 10 2 2 4-5" stroke="#347965" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'worldclock':
      return <><circle cx="18" cy="18" r="14" fill="#a6daee" stroke="#e2f3f9" strokeWidth="1.2"/><ellipse cx="18" cy="18" rx="6" ry="13" stroke="#4e8ba5" strokeWidth="1.5"/><path d="M5 18h26M8 10h20M8 26h20" stroke="#4e8ba5" strokeWidth="1.4" strokeLinecap="round"/></>
    case 'typing':
      return <><rect x="3" y="10" width="30" height="20" rx="4" fill="#d6d6e6" stroke="#f1f0fa" strokeWidth="1.2"/>{[0,1,2].flatMap(row=>[0,1,2,3,4].map(col=><rect key={row+'-'+col} x={7+col*4.8} y={14+row*4.2} width="3.2" height="2.4" rx=".5" fill="#8786b2"/>))}<path d="M12 26h13" stroke="#8786b2" strokeWidth="2.4" strokeLinecap="round"/></>
    case 'bookmarks':
      return <><rect x="8" y="5" width="20" height="27" rx="3" fill="#edb3ba" stroke="#ffdde4" strokeWidth="1.2"/><path d="M13 5v17l5-5 5 5V5" fill="#d76a85" stroke="#aa5475" strokeWidth="1.2" strokeLinejoin="round"/></>

    case 'diff':
      return <><rect x="3" y="5" width="30" height="26" rx="4" fill="#c0d8f0"/><path d="M18 8v20" stroke="#668bb2" strokeWidth="2"/><path d="M8 13h6m-6 6h8m5-7h7m-7 8h6" stroke="#457baf" strokeWidth="2" strokeLinecap="round"/></>
    case 'regex':
      return <><rect x="4" y="5" width="28" height="27" rx="6" fill="#d7c2ec"/><path d="M10 13h16M10 19h12m-12 6h16" stroke="#845bab" strokeWidth="2.4" strokeLinecap="round"/><circle cx="26" cy="25" r="2" fill="#63408e"/></>
    case 'base64':
      return <><rect x="5" y="8" width="26" height="21" rx="5" fill="#b7d7e6"/><path d="M14 14 9 19l5 5m8-10 5 5-5 5m-5-9-3 10" stroke="#367e9e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'urltools':
      return <><path d="M11 12 8 15a6 6 0 0 0 8.5 8.5l4-4M25 24l3-3a6 6 0 0 0-8.5-8.5l-4 4" stroke="#86c6a9" strokeWidth="5" strokeLinecap="round"/><path d="m13 23 10-10" stroke="#4d947e" strokeWidth="2.3" strokeLinecap="round"/></>
    case 'hashing':
      return <><rect x="7" y="5" width="22" height="26" rx="5" fill="#b4bce9"/><path d="m13 11-2 14m10-14-2 14M10 16h16m-17 6h15" stroke="#555aa4" strokeWidth="2.6" strokeLinecap="round"/></>
    case 'csv':
      return <><rect x="5" y="5" width="26" height="26" rx="5" fill="#9ed5b7"/><path d="M14 6v25m9-25v25M6 14h24M6 23h24" stroke="#4d9472" strokeWidth="1.7"/><path d="m11 17 3 3 5-5" stroke="#f6fffa" strokeWidth="2" fill="none"/></>
    case 'entities':
      return <><rect x="4" y="6" width="28" height="25" rx="5" fill="#edb8aa"/><path d="m14 12-7 7 7 6m8-13 7 7-7 6" stroke="#bb6e5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></>
    case 'timestamp':
      return <><circle cx="18" cy="19" r="13" fill="#e7cd97" stroke="#f9eacd" strokeWidth="1.3"/><path d="M18 10v10l6 3" stroke="#a67b36" strokeWidth="2.6" strokeLinecap="round"/><rect x="14" y="3" width="8" height="4" rx="2" fill="#a67b36"/></>
    case 'uuid':
      return <><rect x="5" y="6" width="26" height="25" rx="5" fill="#b6d0e8"/>{[0,1,2].flatMap(r=>[0,1,2,3].map(c=><circle key={r+'-'+c} cx={11+c*4.6} cy={12+r*6} r="1.5" fill="#4779a8"/>))}</>
    case 'contrast':
      return <><circle cx="18" cy="18" r="13" fill="#f4e5ad" stroke="#faedcb" strokeWidth="1.1"/><path d="M18 5A13 13 0 0 1 18 31Z" fill="#394d69"/><circle cx="18" cy="18" r="4.5" fill="#9ebbd1"/></>
    case 'kanban':
      return <><rect x="4" y="6" width="28" height="25" rx="4" fill="#add4ef"/><path d="M13 7v24m10-24v24" stroke="#5f9bc3" strokeWidth="2"/><rect x="7" y="12" width="4" height="9" rx="1" fill="#e2f4fb"/><rect x="16" y="12" width="4" height="13" rx="1" fill="#e2f4fb"/><rect x="26" y="12" width="3" height="7" rx="1" fill="#e2f4fb"/></>
    case 'expenses':
      return <><circle cx="18" cy="18" r="14" fill="#efd6a0" stroke="#fff1c9" strokeWidth="1.1"/><path d="M23 11h-7a4 4 0 0 0 0 8h4a4 4 0 0 1 0 8h-8m6-20v22" stroke="#b48a3d" strokeWidth="2.5" strokeLinecap="round"/></>
    case 'grades':
      return <><rect x="6" y="5" width="24" height="26" rx="5" fill="#c5b9ed"/><path d="m11 21 4 4 11-13" stroke="#7155b9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 10h6" stroke="#8f7bc4" strokeWidth="2"/></>
    case 'reading':
      return <><path d="M18 10C10 5 6 7 4 9v20c6-3 10-3 14 1 4-4 8-4 14-1V9c-6-3-10-3-14 1Z" fill="#f4c2a9" stroke="#fff0dd" strokeWidth="1.2"/><path d="M18 10v20m-9-15h5m8 0h5" stroke="#c98363" strokeWidth="2" strokeLinecap="round"/></>
    case 'countdown':
      return <><circle cx="18" cy="20" r="12" fill="#b5d7ef" stroke="#e9f6ff" strokeWidth="1.1"/><path d="M18 20v-8m0 8 5 4M14 3h8" stroke="#5386ba" strokeWidth="2.5" strokeLinecap="round"/></>
    case 'planner':
      return <><rect x="5" y="7" width="26" height="24" rx="4" fill="#a8d6c7"/><path d="M11 5v5m14-5v5M6 14h24m-19 6h5m3 0h6m-14 5h13" stroke="#458e79" strokeWidth="2.4" strokeLinecap="round"/></>
    case 'decisions':
      return <><circle cx="18" cy="18" r="13" fill="#e3bbe0"/><path d="M13 13c0-3 2-5 5-5 7 0 7 7 0 9v3" stroke="#9d64a4" strokeWidth="3" strokeLinecap="round"/><circle cx="18" cy="26" r="1.9" fill="#9d64a4"/></>
    case 'quiz':
      return <><rect x="5" y="6" width="26" height="25" rx="5" fill="#d3b9f4"/><path d="M11 14h14m-14 7h14" stroke="#8e6ac1" strokeWidth="2"/><circle cx="12" cy="26" r="2" fill="#8e6ac1"/><path d="m19 25 2 2 4-5" stroke="#8e6ac1" strokeWidth="2" strokeLinecap="round"/></>
    case 'matrix':
      return <><rect x="5" y="5" width="26" height="26" rx="4" fill="#c5d1e8"/><path d="M15 8v20M7 17h22" stroke="#6e8bb5" strokeWidth="2.2"/>{[11,22].flatMap(x=>[12,24].map(y=><circle key={x+'-'+y} cx={x} cy={y} r="2" fill="#486b9e"/>))}</>
    case 'metronome':
      return <><path d="M12 6h12l8 26H4Z" fill="#e1c8a0" stroke="#f6e9ce" strokeWidth="1.2"/><path d="M18 9v17m0-17 7 7" stroke="#9a704a" strokeWidth="2.5" strokeLinecap="round"/><circle cx="18" cy="25" r="3" fill="#9a704a"/></>
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
