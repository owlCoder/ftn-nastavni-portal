import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

// Server-side only. Never expose these environment variables to Vite.
const STORE_KEY = 'ftn-nastavni-portal:exam-policy:v1'
const COOKIE = 'ftn_exam_session'
const SESSION_SECONDS = 8 * 60 * 60
const DEFAULT_POLICY = { enabled: false, allowedFiles: [] }

const password = () => process.env.EXAM_ADMIN_PASSWORD || ''
const secret = () => process.env.EXAM_SESSION_SECRET || ''
const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || ''
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || ''
const hasStore = () => Boolean(redisUrl() && redisToken())
const isConfigured = () => hasStore() && Boolean(password()) && secret().length >= 32

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

async function redis(command) {
  const response = await fetch(redisUrl(), {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + redisToken(), 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Skladište nije dostupno.')
  const data = await response.json()
  if (data.error) throw new Error('Skladište je vratilo grešku.')
  return data.result
}

function normalizePolicy(value) {
  if (!value || typeof value !== 'object' || typeof value.enabled !== 'boolean' || !Array.isArray(value.allowedFiles)) {
    throw new Error('Neispravna konfiguracija ispitnog režima.')
  }
  if (value.allowedFiles.length > 3000 || !value.allowedFiles.every(key =>
    typeof key === 'string' && /^(ers|oib|odp|ibis):[^\s]{1,900}$/.test(key))) {
    throw new Error('Neispravan spisak fajlova.')
  }
  return { enabled: value.enabled, allowedFiles: [...new Set(value.allowedFiles)].sort() }
}

async function readPolicy() {
  const saved = await redis(['GET', STORE_KEY])
  return saved === null ? DEFAULT_POLICY : normalizePolicy(JSON.parse(saved))
}

async function checkLoginRate(req) {
  // An expiring server-side counter prevents unlimited password guessing.
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0]
  const key = STORE_KEY + ':login:' + digest(ip).toString('hex')
  const count = Number(await redis(['INCR', key]))
  if (count === 1) await redis(['EXPIRE', key, '900'])
  return count <= 8
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Allow', 'GET, POST')

  if (req.method === 'GET') {
    if (!hasStore()) {
      if (req.query?.admin === '1') return reply(res, 503, { error: 'Podesi Redis i administratorske promenljive na Vercel-u.' })
      return reply(res, 200, DEFAULT_POLICY) // Preserve existing portal behavior until initial setup.
    }
    try {
      if (req.query?.admin === '1' && !sessionValid(req)) return reply(res, 401, { error: 'Potrebna je prijava.' })
      return reply(res, 200, await readPolicy())
    } catch {
      return reply(res, 503, { error: 'Trenutno nije moguće proveriti ispitni režim.' })
    }
  }

  if (req.method !== 'POST') return reply(res, 405, { error: 'Metod nije dozvoljen.' })
  if (!validOrigin(req)) return reply(res, 403, { error: 'Zahtev nije sa istog domena.' })
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return reply(res, 415, { error: 'Očekuje se JSON.' })
  }
  if (!isConfigured()) return reply(res, 503, { error: 'Nedostaju administratorska šifra, tajni ključ ili Redis podešavanja.' })
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
      await redis(['SET', STORE_KEY, JSON.stringify(policy)])
      return reply(res, 200, policy)
    }
    return reply(res, 400, { error: 'Nepoznata akcija.' })
  } catch {
    return reply(res, 503, { error: 'Zahtev trenutno nije moguće obraditi.' })
  }
}
