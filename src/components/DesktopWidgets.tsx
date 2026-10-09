import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Weather = {
  current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] }
}
type Usage = { cpu: number; ram: number; disk: number }
const timeZone = 'Europe/Belgrade'
const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=45.2671&longitude=19.8335&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FBelgrade&forecast_days=5'
const formatter = new Intl.DateTimeFormat('sr-RS', { timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const weatherDescription = (code: number) => {
  if (code === 0) return 'Vedro'
  if (code <= 2) return 'Pretežno vedro'
  if (code === 3) return 'Oblačno'
  if (code <= 48) return 'Magla'
  if (code <= 57) return 'Rosulja'
  if (code <= 67) return 'Kiša'
  if (code <= 77) return 'Sneg'
  if (code <= 82) return 'Pljuskovi'
  if (code <= 86) return 'Sneg'
  return 'Grmljavina'
}
const weatherSymbol = (code: number) => code === 0 ? '☀' : code <= 2 ? '⛅' : code <= 48 ? '☁' : code <= 67 ? '☂' : code <= 77 ? '❄' : code <= 82 ? '☂' : code <= 86 ? '❄' : '☈'

function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const response = await fetch(weatherUrl)
        if (!response.ok) throw new Error('Vremenska prognoza nije dostupna')
        const data = await response.json() as Weather
        if (mounted) { setWeather(data); setFailed(false) }
      } catch {
        if (mounted) setFailed(true)
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 30 * 60 * 1000)
    return () => { mounted = false; window.clearInterval(timer) }
  }, [])
  return <section className="widget weather-widget" aria-label="Trenutno vreme u Novom Sadu">
    <div className="widget-weather-location">Novi Sad <span>↗</span></div>
    {weather ? <>
      <div className="weather-current">
        <span className="weather-temp">{Math.round(weather.current.temperature_2m)}°</span>
        <span className="weather-icon" aria-hidden="true">{weatherSymbol(weather.current.weather_code)}</span>
      </div>
      <div className="weather-condition">{weatherDescription(weather.current.weather_code)} · Vetar {Math.round(weather.current.wind_speed_10m)} km/h</div>
      <div className="weather-today-range">Najviša: {Math.round(weather.daily.temperature_2m_max[0])}° &nbsp; Najniža: {Math.round(weather.daily.temperature_2m_min[0])}°</div>
      <div className="weather-divider" />
      <div className="weather-days">
        {weather.daily.time.slice(1, 5).map((day, index) =>
          <div className="weather-day" key={day}>
            <span>{new Intl.DateTimeFormat('sr-RS', { weekday: 'short', timeZone }).format(new Date(day + 'T12:00:00'))}</span>
            <span aria-label={weatherDescription(weather.daily.weather_code[index + 1])}>{weatherSymbol(weather.daily.weather_code[index + 1])}</span>
            <div className="weather-range"><span style={{ width: `${Math.max(18, Math.min(100, (weather.daily.temperature_2m_max[index + 1] - weather.daily.temperature_2m_min[index + 1]) * 6))}%` }} /></div>
            <strong>{Math.round(weather.daily.temperature_2m_max[index + 1])}°</strong>
          </div>)}
      </div>
    </> : <div className="weather-unavailable"><span aria-hidden="true">☁</span><strong>{failed ? 'Vreme nije dostupno' : 'Učitavanje vremena…'}</strong><small>{failed ? 'Pokušaj ponovo uskoro' : 'Podaci uživo · Open-Meteo'}</small></div>}
    <div className="widget-source">Vremenski podaci uživo · Open-Meteo</div>
  </section>
}

function ClockWidget({ now }: { now: Date }) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const get = (kind: string) => Number(parts.find(p => p.type === kind)?.value ?? 0)
  const h = get('hour'), m = get('minute'), s = get('second')
  return <section className="widget clock-widget" aria-label="Tačno vreme u Beogradu">
    <div className="analog-clock" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => <i key={i} className="clock-tick" style={{ transform: `rotate(${i * 30}deg)` }} />)}
      <span className="clock-hand clock-hour" style={{ transform: `rotate(${h % 12 * 30 + m / 2}deg)` }} />
      <span className="clock-hand clock-minute" style={{ transform: `rotate(${m * 6 + s / 10}deg)` }} />
      <span className="clock-hand clock-second" style={{ transform: `rotate(${s * 6}deg)` }} />
      <span className="clock-center" />
    </div>
    <span className="clock-caption">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}</span>
  </section>
}

function CalendarWidget({ now }: { now: Date }) {
  const dt = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now)
  const year = Number(dt.find(p => p.type === 'year')?.value)
  const month = Number(dt.find(p => p.type === 'month')?.value)
  const day = Number(dt.find(p => p.type === 'day')?.value)
  const first = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const length = new Date(year, month, 0).getDate()
  return <section className="widget calendar-widget" aria-label="Kalendar za tekući mesec">
    <div className="calendar-month">{new Intl.DateTimeFormat('sr-RS', { month: 'long', timeZone }).format(now)} <span>{year}</span></div>
    <div className="calendar-grid">
      {['P','U','S','Č','P','S','N'].map((label, index) => <span className="calendar-weekday" key={index}>{label}</span>)}
      {Array.from({ length: first }, (_, i) => <span key={`empty-${i}`} />)}
      {Array.from({ length }, (_, index) => <span key={index} className={day === index + 1 ? 'calendar-today' : undefined}>{index + 1}</span>)}
    </div>
  </section>
}

function UsageWidget() {
  const [usage, setUsage] = useState<Usage>({ cpu: 28, ram: 63, disk: 42 })
  const [history, setHistory] = useState<number[]>([32,40,28,46,38,51,44,28,33,41,35,52,43,31,36,28,44,38])
  useEffect(() => {
    const timer = window.setInterval(() => {
      const cpu = Math.min(85, Math.max(12, 26 + Math.round(Math.random() * 34)))
      setUsage(previous => ({ cpu, ram: Math.min(75, Math.max(56, previous.ram + Math.round(Math.random() * 6 - 3))), disk: previous.disk }))
      setHistory(previous => [...previous.slice(1), cpu])
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])
  return <section className="widget usage-widget" aria-label="Simulirana upotreba sistema">
    <div className="usage-header"><strong>System Monitor</strong><span>● DEMO</span></div>
    <div className="usage-chart" aria-hidden="true">{history.map((value, i) => <div className="usage-chart-column" key={i} style={{ height: `${value}%` }} />)}</div>
    <div className="usage-metrics">
      {([
        ['CPU', usage.cpu, 'Procesor'],
        ['RAM', usage.ram, 'Memorija'],
        ['SSD', usage.disk, 'Disk'],
      ] as const).map(([label, percent, description]) => <div className="usage-metric" key={label}>
        <span className="usage-metric-label">{label}<small>{description}</small></span>
        <span className="usage-meter"><i style={{ '--fill': `${percent}%` } as CSSProperties} /></span>
        <strong>{percent}%</strong>
      </div>)}
    </div>
    <div className="usage-disclaimer">Simulirani podaci · nisu podaci tvog uređaja</div>
  </section>
}

function DateWidget({ now }: { now: Date }) {
  const parts = new Intl.DateTimeFormat('sr-RS', { timeZone, weekday:'short', day:'numeric', month:'long' }).formatToParts(now)
  const val = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return <section className="widget date-widget" aria-label="Današnji datum">
    <span>{val('weekday')} · {val('month')}</span>
    <strong>{val('day')}</strong>
    <small>{formatter.format(now)}</small>
  </section>
}

function MiniStatusWidget() {
  return <section className="widget system-widget">
    <div className="system-ring"><span>FTN</span></div>
    <div><strong>Portal OS</strong><span>Sistem aktivan</span><small>2026/27</small></div>
  </section>
}

export function DesktopWidgets({ now }: { now: Date }) {
  const time = useMemo(() => now, [now])
  return <aside className="os-widgets" aria-label="Desktop widgeti">
    <WeatherWidget />
    <div className="os-widget-pair"><ClockWidget now={time} /><CalendarWidget now={time} /></div>
    <UsageWidget />
    <div className="os-widget-pair os-widget-last"><DateWidget now={time} /><MiniStatusWidget /></div>
  </aside>
}
