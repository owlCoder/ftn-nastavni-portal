import { useEffect, useState, type FormEvent } from 'react'
import { AuthBackdrop } from './LockScreen'

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
  { name: 'Alpine Lake', detail: 'Alpsko jezero', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=82"),linear-gradient(155deg,#647d96,#b0c2b9 55%,#253d59)' },
  { name: 'Blue Ridge', detail: 'Plave planine', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=82"),linear-gradient(155deg,#a0b2c0,#586a88 65%,#23344d)' },
  { name: 'Sequoia', detail: 'Šumsko svetlo', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=82"),linear-gradient(155deg,#68885d,#28443c 65%,#0c2a2c)' },
  { name: 'Golden Hour', detail: 'Zlatni čas', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=82"),linear-gradient(165deg,#f7ca7d,#d88579 55%,#543e65)' },
  { name: 'Still Water', detail: 'Mirna voda', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1920&q=82"),linear-gradient(145deg,#adc4c3,#5f8b96,#283e4f)' },
  { name: 'Night Sky', detail: 'Zvezdano nebo', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=82"),linear-gradient(155deg,#2d385f,#111a38 60%,#060d21)' },
  { name: 'Ocean', detail: 'Duboko plavetnilo', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1920&q=82"),linear-gradient(140deg,#95cad7,#32728f,#0b344c)' },
  { name: 'Desert', detail: 'Pustinjski horizont', background: 'linear-gradient(180deg,rgba(8,20,40,.04),rgba(8,20,40,.09)),url("https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1920&q=82"),linear-gradient(150deg,#bdba97,#8ca397,#304c53)' },
  { name: 'Paper', detail: 'Neutralna svetla', background: 'linear-gradient(135deg,#f4f3ef 0%,#d6e1e8 42%,#b7c7d8 100%)' },
  { name: 'Stone', detail: 'Kamena siva', background: 'linear-gradient(145deg,#777c85,#464d59 55%,#262b36)' },
  { name: 'Mint', detail: 'Pastelna menta', background: 'linear-gradient(135deg,#b3e4d4,#6fbea9 45%,#347c7e)' },
  { name: 'Cobalt', detail: 'Kobalt plava', background: 'linear-gradient(145deg,#639dea 0%,#325fb6 55%,#1d3367 100%)' },
]
export const WALLPAPER_COLLECTIONS = [
  { id: 'dynamic', title: 'Dinamičke pozadine', description: 'Apstraktne Adwaita boje i blagi prelazi', indexes: [0,1,2,3,4,5,6,7,8,9] },
  { id: 'landscape', title: 'Pejzaži', description: 'Fotografije prirode sa Unsplasha', indexes: [10,11,12,13,14,15,16,17] },
  { id: 'minimal', title: 'Minimalističke', description: 'Mirne boje bez detalja', indexes: [18,19,20,21] },
] as const

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

export function LoginScreen({onLogin,onBack}:{onLogin:()=>void;onBack:()=>void}){
  const [username,setUsername]=useState('student')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [busy,setBusy]=useState(false)
  useEffect(()=>{
    document.title='Prijava · FTN OS'
    const key=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onBack()}
    }
    window.addEventListener('keydown',key)
    return()=>window.removeEventListener('keydown',key)
  },[onBack])
  const submit=(event:FormEvent)=>{
    event.preventDefault()
    if(busy)return
    if(username.trim()==='student'&&password==='ftn'){
      setBusy(true)
      try{localStorage.setItem(SESSION_KEY,'student')}catch{/* local-only demo */}
      onLogin()
    }else{
      setError('Korisničko ime ili lozinka nisu ispravni.')
      setPassword('')
    }
  }
  return <main className="ftn-auth-login">
    <AuthBackdrop soft/>
    <header className="ftn-auth-login-top"><span className="ftn-auth-wordmark">◈ &nbsp; FTN OS</span>
      <span>Nastavni portal · Fakultet tehničkih nauka</span></header>
    <div className="ftn-auth-login-layout">
      <form className="ftn-auth-panel" onSubmit={submit}>
        <button type="button" className="ftn-auth-back" onClick={onBack} title="Nazad na zaključani ekran">← <span>Nazad</span></button>
        <div className="ftn-auth-user-icon" aria-hidden="true">
          <svg viewBox="0 0 48 48" width="38" height="38" fill="none"><circle cx="24" cy="17" r="8" fill="currentColor"/><path d="M10 42c0-10 5-16 14-16s14 6 14 16" fill="currentColor"/></svg>
        </div>
        <h1>Dobro došao nazad</h1>
        <p>Prijavi se na svoju radnu površinu.</p>
        <label htmlFor="ftn-login-name">Korisničko ime</label>
        <input id="ftn-login-name" autoComplete="username" spellCheck={false}
          value={username} onChange={e=>{setUsername(e.target.value);setError('')}} required/>
        <label htmlFor="ftn-login-password">Lozinka</label>
        <input id="ftn-login-password" autoFocus autoComplete="current-password" type="password"
          value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="Unesi lozinku" required/>
        {error&&<div className="ftn-auth-error" role="alert">{error}</div>}
        <button type="submit" className="ftn-auth-submit" disabled={busy}>{busy?'Otvaranje desktopa…':'Prijavi se'}<span aria-hidden="true">→</span></button>
        <div className="ftn-auth-footnote">Lokalna demonstraciona prijava · Podaci ostaju na ovom uređaju</div>
      </form>
    </div>
  </main>
}
