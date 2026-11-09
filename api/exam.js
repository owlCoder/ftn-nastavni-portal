import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

// Server-side only. Never expose these environment variables to Vite.
const POLICY_API = 'https://api.github.com/repos/owlCoder/ftn-nastavni-portal/contents/exam-policy.json'
const PUBLIC_POLICY_URL = 'https://raw.githubusercontent.com/owlCoder/ftn-nastavni-portal/exam-config/exam-policy.json'
const POLICY_BRANCH = 'exam-config'
const COOKIE = 'ftn_exam_session'
const SESSION_SECONDS = 8 * 60 * 60
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const loginAttempts = new Map()
let cachedRecord = null
let cachedUntil = 0

const password = () => process.env.EXAM_ADMIN_PASSWORD || ''
const secret = () => process.env.EXAM_SESSION_SECRET || ''
const githubToken = () => process.env.EXAM_GITHUB_TOKEN || ''
const isConfigured = () => Boolean(password() && secret().length >= 32)

function reply(res, status, body) {
  res.status(status).json(body)
}

function digest(value) {
  return createHash('sha256').update(value).digest()
}

function equalSecrets(a, b) {
  return timingSafeEqual(digest(a), digest(b))
}

function signature(value) {
  const signingKey = createHmac('sha256', secret()).update(password()).digest()
  return createHmac('sha256', signingKey).update(value).digest('base64url')
}

function sessionValid(req) {
  if (!isConfigured()) return false
  const header = req.headers.cookie || ''
  const raw = header.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='))
  const value = raw?.slice(COOKIE.length + 1) || ''
  if (value.length > 1000 || !value.includes('.')) return false
  const [payload, signed, extra] = value.split('.')
  if (extra !== undefined || !payload || !signed || !equalSecrets(signature(payload), signed)) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return Number.isSafeInteger(parsed.exp) && parsed.exp > Date.now() && parsed.exp < Date.now() + SESSION_SECONDS * 1000 + 60_000
  } catch {
    return false
  }
}

function setSession(res) {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_SECONDS * 1000 })).toString('base64url')
  const secure = process.env.VERCEL ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE + '=' + payload + '.' + signature(payload) +
    '; Path=/api/exam; HttpOnly; SameSite=Strict; Max-Age=' + SESSION_SECONDS + secure)
}

function clearSession(res) {
  const secure = process.env.VERCEL ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE + '=; Path=/api/exam; HttpOnly; SameSite=Strict; Max-Age=0' + secure)
}

function validOrigin(req) {
  const origin = req.headers.origin
  const host = req.headers.host
  try {
    if (typeof origin !== 'string' || typeof host !== 'string') return false
    const parsed = new URL(origin)
    return parsed.host === host && (parsed.protocol === 'https:' || !process.env.VERCEL)
  } catch {
    return false
  }
}

function githubHeaders() {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ftn-nastavni-portal-exam',
    ...(githubToken() ? { Authorization: 'Bearer ' + githubToken() } : {}),
  }
}

// Public reads use GitHub's raw content CDN rather than the REST API
// (anonymous GitHub REST reads have a much smaller request quota).
async function readPolicy() {
  if (cachedRecord && Date.now() < cachedUntil) return cachedRecord.policy
  const response = await fetch(PUBLIC_POLICY_URL + '?v=' + Math.floor(Date.now() / 6000), {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('GitHub podešavanja nisu dostupna.')
  const raw = await response.text()
  if (raw.length > 100_000) throw new Error('Neispravna konfiguracija ispitnog režima.')
  const policy = normalizePolicy(JSON.parse(raw))
  cachedRecord = { policy }
  cachedUntil = Date.now() + 6000
  return policy
}

// On writes, fetch the latest file SHA via the authenticated Contents API.
async function readPolicyRecordForWrite() {
  const response = await fetch(POLICY_API + '?ref=' + POLICY_BRANCH, {
    headers: githubHeaders(), cache: 'no-store', signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('GitHub nije dozvolio čitanje konfiguracije.')
  const file = await response.json()
  if (file.type !== 'file' || file.encoding !== 'base64' ||
    typeof file.content !== 'string' || typeof file.sha !== 'string' || file.size > 100_000) {
    throw new Error('Neispravan odgovor GitHub-a.')
  }
  const raw = Buffer.from(file.content.replace(/\s/g, ''), 'base64').toString('utf8')
  return { policy: normalizePolicy(JSON.parse(raw)), sha: file.sha }
}

async function savePolicy(policy) {
  if (!githubToken()) throw new Error('Nedostaje EXAM_GITHUB_TOKEN. Dodaj ga u Vercel Environment Variables.')
  const { sha } = await readPolicyRecordForWrite()
  const content = Buffer.from(JSON.stringify(policy, null, 2) + '\n').toString('base64')
  const response = await fetch(POLICY_API, {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'chore: update exam mode configuration',
      content, sha, branch: POLICY_BRANCH,
    }),
    cache: 'no-store', signal: AbortSignal.timeout(10000),
  })
  if (response.status === 409 || response.status === 422) {
    throw new Error('Podešavanja su se promenila. Osveži stranicu i pokušaj ponovo.')
  }
  if (!response.ok) throw new Error('GitHub nije prihvatio promene. Proveri dozvole EXAM_GITHUB_TOKEN.')
  await response.json()
  cachedRecord = { policy }
  // The new blob has been committed; next read will refresh the public file.
  cachedUntil = Date.now() + 6000
}

function normalizePolicy(value) {
  if (!value || typeof value !== 'object' || typeof value.enabled !== 'boolean' || !Array.isArray(value.allowedFiles)) {
    throw new Error('Neispravna konfiguracija ispitnog režima.')
  }
  if (value.allowedFiles.length > 3000 || !value.allowedFiles.every(key =>
    typeof key === 'string' && /^(ers|oib|odp|ibis):github-file\/[^\u0000-\u001f\u007f]{1,900}$/.test(key))) {
    throw new Error('Neispravan spisak fajlova.')
  }
  return { enabled: value.enabled, allowedFiles: [...new Set(value.allowedFiles)].sort() }
}

function checkLoginRate(req) {
  // In-memory, best-effort per-instance limit. Use a strong admin password.
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress || 'unknown').split(',')[0]
  const key = digest(ip).toString('hex')
  const now = Date.now()
  const prior = loginAttempts.get(key)
  const attempt = !prior || prior.until <= now
    ? { count: 0, until: now + LOGIN_WINDOW_MS } : prior
  attempt.count++
  loginAttempts.set(key, attempt)
  if (loginAttempts.size > 1024) {
    for (const [id, item] of loginAttempts) if (item.until <= now) loginAttempts.delete(id)
    if (loginAttempts.size > 1024) loginAttempts.delete(loginAttempts.keys().next().value)
  }
  return attempt.count <= 8
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Allow', 'GET, POST')

  if (req.method === 'GET') {
    const admin = req.query?.admin === '1'
    if (admin && !isConfigured()) {
      return reply(res, 503, { error: 'Nedostaju administratorska šifra ili tajni ključ na Vercel-u.' })
    }
    if (admin && !sessionValid(req)) return reply(res, 401, { error: 'Potrebna je prijava.' })
    try {
      const policy = await readPolicy()
      if (!admin) res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=8, stale-while-revalidate=4')
      return reply(res, 200, admin ? { ...policy, writable: Boolean(githubToken()) } : policy)
    } catch {
      return reply(res, 503, { error: 'Trenutno nije moguće proveriti ispitni režim.' })
    }
  }

  if (req.method !== 'POST') return reply(res, 405, { error: 'Metod nije dozvoljen.' })
  if (!validOrigin(req)) return reply(res, 403, { error: 'Zahtev nije sa istog domena.' })
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return reply(res, 415, { error: 'Očekuje se JSON.' })
  }
  if (!isConfigured()) return reply(res, 503, { error: 'Nedostaju administratorska šifra ili tajni ključ.' })
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (!body || typeof body !== 'object' || JSON.stringify(body).length > 100_000) {
      return reply(res, 400, { error: 'Neispravan zahtev.' })
    }
    if (body.action === 'login') {
      if (!(await checkLoginRate(req))) return reply(res, 429, { error: 'Previše pokušaja. Pokušaj ponovo za 15 minuta.' })
      if (typeof body.password !== 'string' || !equalSecrets(body.password, password())) {
        return reply(res, 401, { error: 'Pogrešna šifra.' })
      }
      setSession(res)
      return reply(res, 200, { success: true })
    }
    if (!sessionValid(req)) return reply(res, 401, { error: 'Sesija je istekla. Prijavi se ponovo.' })
    if (body.action === 'logout') {
      clearSession(res)
      return reply(res, 200, { success: true })
    }
    if (body.action === 'save') {
      let policy
      try { policy = normalizePolicy(body.policy) }
      catch { return reply(res, 400, { error: 'Neispravno podešavanje fajlova.' }) }
      await savePolicy(policy)
      return reply(res, 200, policy)
    }
    return reply(res, 400, { error: 'Nepoznata akcija.' })
  } catch (error) {
    return reply(res, 503, { error: error instanceof Error ? error.message : 'Zahtev trenutno nije moguće obraditi.' })
  }
}
