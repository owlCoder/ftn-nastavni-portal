import { useEffect, useState } from 'react'

type Weather = {
  current: { temperature_2m: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] }
}

const timeZone = 'Europe/Belgrade'
const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=45.2671&longitude=19.8335&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FBelgrade&forecast_days=5'
const dayFormat = new Intl.DateTimeFormat('sr-RS', { weekday: 'short', timeZone })
const weatherDescription = (code: number) => {
  if (code === 0) return 'Vedro'
  if (code <= 2) return 'Pretežno vedro'
  if (code === 3) return 'Oblačno'
  if (code <= 48) return 'Maglovito'
  if (code <= 57) return 'Rosulja'
  if (code <= 67) return 'Kiša'
  if (code <= 77) return 'Sneg'
  if (code <= 82) return 'Pljuskovi'
  if (code <= 86) return 'Sneg'
  return 'Grmljavina'
}
const weatherSymbol = (code: number) => code === 0 ? '☀' : code <= 2 ? '⛅' : code <= 48 ? '☁' : code <= 67 ? '☂' : code <= 77 ? '❄' : code <= 82 ? '☂' : code <= 86 ? '❄' : '☈'
const pad = (n: number) => String(n).padStart(2,'0')

function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const response = await fetch(weatherUrl)
        if (!response.ok) throw new Error('Weather unavailable')
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
  const min = weather ? Math.min(...weather.daily.temperature_2m_min) : 0
  const max = weather ? Math.max(...weather.daily.temperature_2m_max) : 1
  const span = Math.max(1,max-min)
  return <section className="widget weather-widget" aria-label="Vremenska prognoza za Novi Sad">
    <div className="widget-heading">
      <div><span className="widget-eyebrow">VREMENSKA PROGNOZA</span><h2>Novi Sad</h2></div>
    </div>
    {weather ? <>
      <div className="weather-hero">
        <span className="weather-temp">{Math.round(weather.current.temperature_2m)}°</span>
        <span className="weather-icon" aria-hidden="true">{weatherSymbol(weather.current.weather_code)}</span>
      </div>
      <div className="weather-condition">{weatherDescription(weather.current.weather_code)}</div>
      <div className="weather-details">
        <span>↑ {Math.round(weather.daily.temperature_2m_max[0])}°</span>
        <span>↓ {Math.round(weather.daily.temperature_2m_min[0])}°</span>
        <span className="weather-detail-spacer"/>
        <span>Vetar {Math.round(weather.current.wind_speed_10m)} km/h</span>
      </div>
      <div className="widget-section-separator"/>
      <div className="weather-days" aria-label="Prognoza za naredna četiri dana">
        {weather.daily.time.slice(1,5).map((date,index)=>{
          const i=index+1
          const low=weather.daily.temperature_2m_min[i],high=weather.daily.temperature_2m_max[i]
          return <div className="weather-day" key={date}>
            <span>{dayFormat.format(new Date(date+'T12:00:00'))}</span>
            <span className="weather-day-symbol" aria-label={weatherDescription(weather.daily.weather_code[i])}>{weatherSymbol(weather.daily.weather_code[i])}</span>
            <span className="weather-low">{Math.round(low)}°</span>
            <div className="weather-range" aria-hidden="true"><span style={{left:((low-min)/span*100)+'%',width:Math.max(8,(high-low)/span*100)+'%'}}/></div>
            <strong>{Math.round(high)}°</strong>
          </div>
        })}
      </div>
    </> : <div className="weather-unavailable"><span aria-hidden="true">☁</span><strong>{failed?'Vreme nije dostupno':'Učitavanje vremena…'}</strong><small>{failed?'Proveri mrežnu vezu':'Preuzimanje prognoze'}</small></div>}
    <div className="widget-source">Open-Meteo · Podaci uživo</div>
  </section>
}

function ClockWidget({ now }: { now: Date }) {
  const parts = new Intl.DateTimeFormat('en-GB',{timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(now)
  const get=(kind:string)=>Number(parts.find(p=>p.type===kind)?.value??0)
  const h=get('hour'),m=get('minute'),s=get('second')
  const date=new Intl.DateTimeFormat('sr-RS',{timeZone,weekday:'long',day:'numeric',month:'long'}).format(now)
  return <section className="widget clock-widget" aria-label="Trenutno lokalno vreme">
    <div className="clock-copy">
      <span className="widget-eyebrow">LOKALNO VREME</span>
      <strong className="clock-digital">{pad(h)}:{pad(m)}</strong>
      <span className="clock-date">{date}</span>
    </div>
    <div className="analog-clock" aria-hidden="true">
      {Array.from({length:12},(_,i)=><i key={i} className="clock-tick" style={{transform:`rotate(${i*30}deg)`}}/>)}
      <span className="clock-hand clock-hour" style={{transform:`rotate(${h%12*30+m/2}deg)`}}/>
      <span className="clock-hand clock-minute" style={{transform:`rotate(${m*6+s/10}deg)`}}/>
      <span className="clock-hand clock-second" style={{transform:`rotate(${s*6}deg)`}}/>
      <span className="clock-center"/>
    </div>
  </section>
}

function CalendarWidget({now}:{now:Date}) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now)
  const get=(type:string)=>Number(parts.find(p=>p.type===type)?.value??0)
  const year=get('year'),month=get('month'),day=get('day')
  const first=(new Date(year,month-1,1).getDay()+6)%7
  const length=new Date(year,month,0).getDate()
  const monthName=new Intl.DateTimeFormat('sr-RS',{timeZone,month:'long'}).format(now)
  return <section className="widget calendar-widget" aria-label="Kalendar za tekući mesec">
    <div className="widget-heading">
      <div><span className="widget-eyebrow">KALENDAR</span><h2>{monthName} <span>{year}</span></h2></div>
    </div>
    <div className="calendar-grid">
      {['Po','Ut','Sr','Če','Pe','Su','Ne'].map(label=><span className="calendar-weekday" key={label}>{label}</span>)}
      {Array.from({length:first},(_,i)=><span key={'empty-'+i}/>)}
      {Array.from({length},(_,i)=><span key={i} className={day===i+1?'calendar-today':undefined}>{i+1}</span>)}
    </div>
  </section>
}

export function DesktopWidgets({now}:{now:Date}) {
  return <aside className="os-widgets" aria-label="Desktop widgeti">
    <WeatherWidget/>
    <ClockWidget now={now}/>
    <CalendarWidget now={now}/>
  </aside>
}
