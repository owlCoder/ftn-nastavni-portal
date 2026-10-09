import { useEffect, useState, type FormEvent } from 'react'

export const SESSION_KEY = 'ftn-os-session-v1'
export type DesktopPreferences = {
  wallpaper: number
  dark: boolean
  widgets: boolean
  nightLight: boolean
  brightness: number
}
export const DEFAULT_PREFERENCES: DesktopPreferences = {
  wallpaper: 0, dark: true, widgets: true, nightLight: false, brightness: 100,
}
const PREFERENCES_KEY = 'ftn-os-preferences-v2'

export type Wallpaper = { name: string; detail: string; background: string }
export const WALLPAPERS: Wallpaper[] = [
  { name: 'Adwaita', detail: 'Ljubičasti talasi', background: 'radial-gradient(ellipse 90% 88% at 8% 105%, #a15bbf 0%, transparent 58%), radial-gradient(ellipse 76% 88% at 89% -12%, #5688c9 0%, transparent 69%), linear-gradient(130deg,#21184c,#4a367e 48%,#202047)' },
  { name: 'Midnight', detail: 'Ponoćno plava', background: 'radial-gradient(ellipse at 22% 110%, #264b9b 0%, transparent 56%),radial-gradient(ellipse at 95% 10%,#435bc1 0%,transparent 56%),linear-gradient(130deg,#0b102e,#161c51 55%,#070b24)' },
  { name: 'Aurora', detail: 'Severna svetlost', background: 'radial-gradient(ellipse 65% 65% at 27% 72%,#2da8a4 0%,transparent 70%),radial-gradient(ellipse 70% 65% at 85% 25%,#884abe 0%,transparent 76%),linear-gradient(130deg,#081c30,#1b3657 53%,#131231)' },
  { name: 'Sunset', detail: 'Zalazak sunca', background: 'radial-gradient(ellipse 75% 65% at 8% 95%,#f69c77 0%,transparent 68%),radial-gradient(ellipse at 85% 13%,#a8508a 0%,transparent 65%),linear-gradient(125deg,#382049,#985a83,#1c1b45)' },
  { name: 'Forest', detail: 'Smaragdna šuma', background: 'radial-gradient(ellipse at 14% 100%,#397f6c 0%,transparent 66%),radial-gradient(ellipse at 85% 5%,#588f8c 0%,transparent 64%),linear-gradient(135deg,#0d2b34,#1f5b50 52%,#112b3a)' },
  { name: 'Rose', detail: 'Jutarnja ružičasta', background: 'radial-gradient(ellipse at 12% 86%,#e59dba 0%,transparent 64%),radial-gradient(ellipse at 86% 0%,#9b87d1 0%,transparent 60%),linear-gradient(128deg,#64466e,#b06f96,#352d67)' },
  { name: 'Dune', detail: 'Peščane dine', background: 'radial-gradient(ellipse at 12% 94%,#c99465 0%,transparent 64%),radial-gradient(ellipse at 87% 14%,#bd7e65 0%,transparent 58%),linear-gradient(130deg,#5c465b,#80606f,#362f47)' },
  { name: 'Ocean', detail: 'Plavi horizont', background: 'radial-gradient(ellipse at 8% 95%,#51afb7 0%,transparent 62%),radial-gradient(ellipse at 88% 8%,#3a81b8 0%,transparent 64%),linear-gradient(135deg,#073e5c,#236484 52%,#082d53)' },
  { name: 'Lavender', detail: 'Pastelna lavanda', background: 'radial-gradient(ellipse at 9% 95%,#bdb1e8 0%,transparent 59%),radial-gradient(ellipse at 92% 9%,#7f9bd1 0%,transparent 63%),linear-gradient(130deg,#5a5687,#8d78b7,#41426f)' },
  { name: 'Graphite', detail: 'Tamni grafit', background: 'radial-gradient(ellipse at 4% 100%,#5d637e 0%,transparent 59%),radial-gradient(ellipse at 85% 5%,#576c8e 0%,transparent 62%),linear-gradient(130deg,#191d2b,#32384c,#121722)' },
]

export function loadPreferences(): DesktopPreferences {
  try {
    const parsed = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null') as Partial<DesktopPreferences> | null
    if (!parsed || typeof parsed !== 'object') return DEFAULT_PREFERENCES
    return {
      wallpaper: Number.isInteger(parsed.wallpaper) && (parsed.wallpaper ?? 0) >= 0 && (parsed.wallpaper ?? 0) < WALLPAPERS.length ? parsed.wallpaper! : 0,
      dark: typeof parsed.dark === 'boolean' ? parsed.dark : true,
      widgets: typeof parsed.widgets === 'boolean' ? parsed.widgets : true,
      nightLight: typeof parsed.nightLight === 'boolean' ? parsed.nightLight : false,
      brightness: typeof parsed.brightness === 'number' && Number.isFinite(parsed.brightness) ? Math.min(120,Math.max(65,parsed.brightness)) : 100,
    }
  } catch { return DEFAULT_PREFERENCES }
}
export function savePreferences(preferences: DesktopPreferences) {
  try { localStorage.setItem(PREFERENCES_KEY,JSON.stringify(preferences)) } catch { /* Storage blocked by browser */ }
}

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [error,setError] = useState('')
  const [busy,setBusy] = useState(false)
  useEffect(()=>{document.title='Prijava · Nastavni portal'},[])
  const submit = (event:FormEvent) => {
    event.preventDefault()
    if(busy)return
    if(username.trim()==='student' && password==='ftn'){
      setBusy(true)
      try { localStorage.setItem(SESSION_KEY,'student') } catch { /* memory session still works */ }
      onLogin()
    } else {
      setError('Pogrešno korisničko ime ili lozinka.')
      setPassword('')
    }
  }
  return <main className="gn-login">
    <div className="gn-login-glow" aria-hidden="true"/>
    <div className="gn-login-clock"><span>Nastavni portal</span><span>FTN · Univerzitet u Novom Sadu</span></div>
    <form className="gn-login-card" onSubmit={submit}>
      <div className="gn-login-avatar" aria-hidden="true">
        <svg width="47" height="47" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="16" r="9" fill="currentColor"/><path d="M8 43c0-12 6-18 16-18s16 6 16 18" fill="currentColor"/></svg>
      </div>
      <h1>student</h1><p>Prijavi se na nastavni portal</p>
      <label htmlFor="gn-login-user">Korisničko ime</label>
      <input id="gn-login-user" autoComplete="username" spellCheck={false} value={username} onChange={e=>{setUsername(e.target.value);setError('')}} placeholder="student" required autoFocus />
      <label htmlFor="gn-login-pass">Lozinka</label>
      <input id="gn-login-pass" type="password" autoComplete="current-password" value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Lozinka" required />
      {error && <div className="gn-login-error" role="alert">{error}</div>}
      <button type="submit" className="gn-login-submit" disabled={busy}>Prijavi se <span>→</span></button>
      <small>Lokalna prijava za pristup nastavnom portalu.</small>
    </form>
  </main>
}
