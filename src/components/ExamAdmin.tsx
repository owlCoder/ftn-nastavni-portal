import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Catalog } from './directoryModel'
import { defaultExamPolicy, examFileKey, type ExamPolicy } from '../lib/examMode'
import '../styles/exam-admin.css'

type AdminResponse = ExamPolicy & { error?: string; success?: boolean; writable?: boolean }
const options = { credentials: 'same-origin' as const, cache: 'no-store' as const }

async function adminRequest(action: 'login' | 'logout' | 'save', data: Record<string, unknown> = {}): Promise<AdminResponse> {
  const response = await fetch('/api/exam', {
    method: 'POST', ...options,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  })
  const payload = await response.json() as AdminResponse
  if (!response.ok) throw new Error(payload.error || 'Zahtev nije uspeo.')
  return payload
}

export function ExamAdmin({ catalogs, materialsError }: { catalogs: Catalog[]; materialsError?: string }) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')
  const [policy, setPolicy] = useState<ExamPolicy>(defaultExamPolicy)
  const [savedPolicy, setSavedPolicy] = useState<ExamPolicy | null>(null)
  const [writeReady, setWriteReady] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const groups = useMemo(() => catalogs.map(catalog => ({
    course: catalog.course,
    files: catalog.files.filter(file => file.kind !== 'folder' && Boolean(file.source)),
  })), [catalogs])
  const selected = useMemo(() => new Set(policy.allowedFiles), [policy.allowedFiles])
  const total = groups.reduce((sum, group) => sum + group.files.length, 0)
  const unsaved = savedPolicy !== null && (policy.enabled !== savedPolicy.enabled ||
    policy.allowedFiles.length !== savedPolicy.allowedFiles.length ||
    policy.allowedFiles.some(file => !savedPolicy.allowedFiles.includes(file)))

  const reload = async () => {
    const response = await fetch('/api/exam?admin=1', options)
    if (response.status === 401) {
      setAuthorized(false)
      return
    }
    const data = await response.json() as AdminResponse
    if (!response.ok) throw new Error(data.error || 'Administracija nije dostupna.')
    setAuthorized(true)
    setPolicy({ enabled: data.enabled, allowedFiles: data.allowedFiles })
    setSavedPolicy({ enabled: data.enabled, allowedFiles: data.allowedFiles })
    setWriteReady(data.writable === true)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const response = await fetch('/api/exam?admin=1', options)
        if (!mounted) return
        if (response.status === 401) { setAuthorized(false); return }
        const data = await response.json() as AdminResponse
        if (!response.ok) throw new Error(data.error || 'Administracija nije dostupna.')
        if (!mounted) return
        setPolicy({ enabled: data.enabled, allowedFiles: data.allowedFiles })
        setSavedPolicy({ enabled: data.enabled, allowedFiles: data.allowedFiles })
        setWriteReady(data.writable === true)
        setAuthorized(true)
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : 'Povezivanje nije uspelo.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!password || busy) return
    setBusy(true); setError(''); setNotice('')
    try {
      await adminRequest('login', { password })
      setPassword('')
      await reload()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Prijava nije uspela.')
    } finally { setBusy(false) }
  }

  const toggleFile = (key: string, checked: boolean) => {
    setNotice('')
    setPolicy(previous => {
      const next = new Set(previous.allowedFiles)
      if (checked) next.add(key)
      else next.delete(key)
      return { ...previous, allowedFiles: [...next] }
    })
  }

  const toggleCourse = (courseId: string, checked: boolean) => {
    setNotice('')
    setPolicy(previous => {
      const next = new Set(previous.allowedFiles)
      for (const file of groups.find(group => group.course.id === courseId)?.files ?? []) {
        const key = examFileKey(courseId, file.id)
        if (checked) next.add(key)
        else next.delete(key)
      }
      return { ...previous, allowedFiles: [...next] }
    })
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy || !writeReady) return
    setBusy(true); setError(''); setNotice('')
    try {
      const updated = await adminRequest('save', { policy })
      setPolicy({ enabled: updated.enabled, allowedFiles: updated.allowedFiles })
      setSavedPolicy({ enabled: updated.enabled, allowedFiles: updated.allowedFiles })
      setNotice('Podešavanja su sačuvana i važe za sve posetioce portala.')
    } catch (cause) {
      if (cause instanceof Error && cause.message.includes('Sesija je istekla')) setAuthorized(false)
      setError(cause instanceof Error ? cause.message : 'Čuvanje nije uspelo.')
    } finally { setBusy(false) }
  }

  const signOut = async () => {
    setBusy(true); setError(''); setNotice('')
    try {
      await adminRequest('logout')
      setAuthorized(false); setPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Odjava nije uspela.')
    } finally { setBusy(false) }
  }

  return <section className="exam-admin">
    <header className="exam-header">
      <div><a href="/" className="exam-back">← Nastavni portal</a><p className="exam-eyebrow">Upravljanje pristupom</p>
        <h1>Ispitni režim</h1><p>Uključi režim i izaberi dokumente koje studenti mogu da vide na portalu tokom ispita.</p></div>
      {authorized && <button type="button" className="exam-outline" disabled={busy} onClick={() => void signOut()}>Odjavi se</button>}
    </header>
    {error && <p className="exam-alert" role="alert">{error}</p>}
    {notice && <p className="exam-success" role="status">{notice}</p>}
    {authorized && !writeReady && <p className="exam-alert" role="alert">Za čuvanje podešavanja nedostaje EXAM_GITHUB_TOKEN na Vercel-u. Dodaj ga za Production i uradi Redeploy.</p>}
    {loading ? <p className="exam-muted">Provera administratorske sesije…</p> : !authorized ?
      <form className="exam-login" onSubmit={event => void signIn(event)}>
        <h2>Administratorska prijava</h2>
        <p>Unesi šifru. Ona se proverava na serveru i ne čuva u browseru.</p>
        <label htmlFor="exam-password">Šifra</label>
        <input id="exam-password" type="password" autoComplete="current-password" value={password}
          onChange={event => setPassword(event.target.value)} required placeholder="Unesi administratorsku šifru"/>
        <button type="submit" disabled={busy || !password}>{busy ? 'Provera…' : 'Prijavi se'}</button>
      </form> :
      <form className="exam-panel" onSubmit={event => void save(event)}>
        <div className="exam-section-title"><div><h2>Status režima</h2><p>Kada je uključen, u direktorijumu ostaju samo izabrani fajlovi.</p></div>
          <span className={'exam-state ' + (unsaved ? 'is-pending' : policy.enabled ? 'is-on' : '')}>{unsaved ? (policy.enabled ? 'ON' : 'OFF') + ' · Nesačuvano' : policy.enabled ? 'ON · Uključen' : 'OFF · Isključen'}</span></div>
        <fieldset className="exam-switch"><legend className="exam-sr-only">Status ispitnog režima</legend>
          <label><input type="radio" name="exam-enabled" checked={!policy.enabled}
            onChange={() => { setPolicy(previous => ({ ...previous, enabled: false })); setNotice('') }}/> OFF · Svi materijali</label>
          <label><input type="radio" name="exam-enabled" checked={policy.enabled}
            onChange={() => { setPolicy(previous => ({ ...previous, enabled: true })); setNotice('') }}/> ON · Samo odabrani fajlovi</label>
        </fieldset>
        <div className="exam-section-title exam-files-heading">
          <div><h2>Dozvoljeni fajlovi</h2><p>Izbor ostaje sačuvan čak i kada isključiš ispitni režim.</p></div>
          <strong>{selected.size} izabrano</strong>
        </div>
        <label className="exam-search"><span className="exam-sr-only">Pretraži fajlove</span>
          <input type="search" placeholder="Pretraži nazive fajlova…" value={search} onChange={event => setSearch(event.target.value)}/></label>
        {materialsError && <p className="exam-alert">Nije moguće učitati trenutni spisak fajlova: {materialsError}</p>}
        {!materialsError && total === 0 && <p className="exam-muted">Učitavanje spiska fajlova sa GitHub-a…</p>}
        <div className="exam-groups">
          {groups.map(group => {
            const matching = group.files.filter(file => !search.trim() ||
              (file.name + ' ' + group.course.name + ' ' + group.course.code).toLocaleLowerCase('sr')
                .includes(search.trim().toLocaleLowerCase('sr')))
            if (!matching.length) return null
            const count = group.files.filter(file => selected.has(examFileKey(group.course.id, file.id))).length
            return <section key={group.course.id} className="exam-group">
              <div className="exam-group-header"><div><h3>{group.course.code} · {group.course.name}</h3>
                <small>{count} od {group.files.length} izabrano</small></div>
                <div className="exam-group-actions"><button type="button" onClick={() => toggleCourse(group.course.id, true)}>Izaberi sve</button>
                  <button type="button" onClick={() => toggleCourse(group.course.id, false)}>Ukloni sve</button></div></div>
              <div className="exam-items">{matching.map(file => {
                const key = examFileKey(group.course.id, file.id)
                return <label className="exam-item" key={key}>
                  <input type="checkbox" checked={selected.has(key)} onChange={event => toggleFile(key, event.target.checked)}/>
                  <span><strong>{file.name}</strong><small>{file.id.replace(/^github-file\//, '')}</small></span>
                </label>
              })}</div>
            </section>
          })}
        </div>
        {policy.enabled && selected.size === 0 && <p className="exam-warning">Uključen režim bez izabranih fajlova: studenti neće videti nijedan fajl.</p>}
        <div className="exam-save">
          <button type="submit" disabled={busy || !writeReady}>{busy ? 'Čuvanje…' : 'Sačuvaj podešavanja'}</button></div>
      </form>}
  </section>
}
