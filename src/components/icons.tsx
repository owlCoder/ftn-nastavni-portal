const stroke = { stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" {...stroke} strokeWidth="1.8" />
    </svg>
  )
}

export function DownloadArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" {...stroke} strokeWidth="1.8" />
    </svg>
  )
}

export function PreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3.5 6.5h6l1.7 2H20a1.5 1.5 0 0 1 1.5 1.5v7.5A2.5 2.5 0 0 1 19 20H5a2.5 2.5 0 0 1-2.5-2.5V8a1.5 1.5 0 0 1 1-1.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

export function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M3 9V5a2 2 0 0 1 2-2h4M21 9V5a2 2 0 0 0-2-2h-4M3 15v4a2 2 0 0 0 2 2h4M21 15v4a2 2 0 0 1-2 2h-4" {...stroke} strokeWidth="2" />
    </svg>
  )
}

export function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" {...stroke} strokeWidth="2" />
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FullscreenButton({ isFullscreen, onToggle }: { isFullscreen: boolean; onToggle: () => void }) {
  return (
    <button
      className="fullscreen-icon-button"
      onClick={onToggle}
      aria-label={isFullscreen ? 'Izađi iz celog ekrana' : 'Otvori preko celog ekrana'}
      title={isFullscreen ? 'Izađi iz celog ekrana' : 'Ceo ekran'}
    >
      {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
    </button>
  )
}
