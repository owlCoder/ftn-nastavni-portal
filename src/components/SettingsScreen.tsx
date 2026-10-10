import { useState, type CSSProperties, type ReactNode } from 'react'
import { DEFAULT_PREFERENCES, WALLPAPERS, WALLPAPER_COLLECTIONS, type DesktopPreferences } from './DesktopSettings'

type Page='appearance'|'wallpaper'|'desktop'|'shortcuts'
type Props={preferences:DesktopPreferences;onChange:(patch:Partial<DesktopPreferences>)=>void}
function Symbol({name,size=18}:{name:Page|'check'|'chevron'|'monitor'|'moon'|'sun'|'info'|'left'|'right'|'reset';size?:number}){
  const paths:Record<string,ReactNode>={
    appearance:<><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></>,
    wallpaper:<><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="16.5" cy="8.5" r="1.6"/><path d="m4.5 17 5-5 4 3 3.5-3.5 3.5 3.5"/></>,
    desktop:<><rect x="2.7" y="4" width="18.6" height="15.5" rx="2.5"/><path d="M2.7 9h18.6M8.6 9v10.5"/></>,
    shortcuts:<><rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M8 10h2m4 0h2M8 14h8"/></>,
    check:<path d="m4.5 12 5 5 10-11"/>,
    chevron:<path d="m9 6 6 6-6 6"/>,
    monitor:<><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M9 22h6m-3-4v4"/></>,
    moon:<path d="M20.5 16A8.5 8.5 0 0 1 8 3.5a8.5 8.5 0 1 0 12.5 12.5Z"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.2 2.2m9.8 9.8 2.2 2.2m0-14.2-2.2 2.2m-9.8 9.8-2.2 2.2"/></>,
    info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
    left:<path d="m15 5-7 7 7 7"/>,
    right:<path d="m9 5 7 7-7 7"/>,
    reset:<><path d="M4 11a8 8 0 1 1 1 5"/><path d="M4 4v7h7"/></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}
function Switch({checked,onChange,label}:{checked:boolean;onChange:(value:boolean)=>void;label:string}){
  return <button type="button" className={'ftn-switch'+(checked?' is-on':'')} role="switch" aria-checked={checked} aria-label={label} onClick={()=>onChange(!checked)}>
    <span className="ftn-switch-thumb"/>
  </button>
}
function PreferenceRow({title,description,children}:{title:string;description:string;children:ReactNode}){
  return <div className="ftn-pref-row"><div className="ftn-pref-row-copy"><strong>{title}</strong><small>{description}</small></div><div className="ftn-pref-row-control">{children}</div></div>
}
const headings:Record<Page,[string,string]>={
  appearance:['Izgled','Izaberi izgled prozora i kontrola.'],
  wallpaper:['Pozadine','Pronađi pozadinu za svoj radni prostor.'],
  desktop:['Radna površina','Odredi šta je prikazano i kako izgleda.'],
  shortcuts:['Prečice','Organizuj aplikacije i svoj dock.'],
}
const tabs:{id:Page;title:string}[]=[
  {id:'appearance',title:'Izgled'},{id:'wallpaper',title:'Pozadine'},
  {id:'desktop',title:'Radna površina'},{id:'shortcuts',title:'Prečice i dock'},
]
export function SettingsScreen({preferences,onChange}:Props){
  const [page,setPage]=useState<Page>('wallpaper')
  const current=WALLPAPERS[preferences.wallpaper]??WALLPAPERS[0]
  const isPhoto=preferences.wallpaper>=10&&preferences.wallpaper<=17
  const brightness=(preferences.brightness-65)/55*100
  const changeWallpaper=(offset:number)=>onChange({wallpaper:(preferences.wallpaper+offset+WALLPAPERS.length)%WALLPAPERS.length})
  const previewStyle={background:current.background} as CSSProperties
  return <div className={'ftn-preferences'+(preferences.dark?' is-dark':'')}>
    <aside className="ftn-pref-sidebar" aria-label="Navigacija podešavanja">
      <div className="ftn-pref-sidebar-head"><span className="ftn-pref-sidebar-icon"><Symbol name="monitor" size={19}/></span>
        <div><strong>FTN OS</strong><small>Postavke sistema</small></div></div>
      <div className="ftn-pref-sidebar-group-label">PERSONALIZACIJA</div>
      <nav className="ftn-pref-nav" aria-label="Sekcije">
        {tabs.map(({id,title})=><button key={id} type="button" className={page===id?'selected':''}
          aria-current={page===id?'page':undefined} onClick={()=>setPage(id)}>
          <span className="ftn-pref-nav-icon"><Symbol name={id}/></span><span>{title}</span>{page===id&&<Symbol name="chevron" size={14}/>}
        </button>)}
      </nav>
      <div className="ftn-pref-sidebar-bottom"><span className="ftn-pref-sidebar-online"/><span>Postavke se čuvaju lokalno</span></div>
    </aside>
    <div className="ftn-pref-content">
      <div className="ftn-pref-top"><div><span className="ftn-pref-eyebrow">PODEŠAVANJA / {headings[page][0].toUpperCase()}</span>
        <h2>{headings[page][0]}</h2><p>{headings[page][1]}</p></div></div>
      {page==='wallpaper'&&<div className="ftn-pref-page" key="wallpaper">
        <section className="ftn-pref-current" aria-label="Izabrana pozadina">
          <div className="ftn-pref-hero-image" style={previewStyle}>
            <span className="ftn-pref-hero-label">FTN OS <span>09:41</span></span>
            <span className="ftn-pref-preview-dock"><i/><i/><i/><i/><i/></span>
          </div>
          <div className="ftn-pref-current-details">
            <span className="ftn-pref-tag">TRENUTNA POZADINA</span>
            <h3>{current.name}</h3><p>{current.detail}</p>
            <div className="ftn-pref-hero-controls">
              <button type="button" onClick={()=>changeWallpaper(-1)} title="Prethodna pozadina" aria-label="Prethodna pozadina"><Symbol name="left"/></button>
              <span>{String(preferences.wallpaper+1).padStart(2,'0')} / {WALLPAPERS.length}</span>
              <button type="button" onClick={()=>changeWallpaper(1)} title="Sledeća pozadina" aria-label="Sledeća pozadina"><Symbol name="right"/></button>
            </div>
            {isPhoto&&<small className="ftn-pref-photo-caption">Foto: Unsplash · internet konekcija je potrebna</small>}
          </div>
        </section>
        {WALLPAPER_COLLECTIONS.map(section=><section className="ftn-pref-wall-group" key={section.id}>
          <div className="ftn-pref-section-heading"><div><h3>{section.title}</h3><p>{section.description}</p></div><span>{section.indexes.length} pozadina</span></div>
          <div className="ftn-pref-wallpaper-grid">
            {section.indexes.map(index=><button key={index} type="button" title={WALLPAPERS[index].name+' — '+WALLPAPERS[index].detail}
              className={'ftn-pref-wallpaper-choice'+(preferences.wallpaper===index?' active':'')}
              aria-label={'Izaberi pozadinu '+WALLPAPERS[index].name} aria-pressed={preferences.wallpaper===index}
              onClick={()=>onChange({wallpaper:index})}>
              <span className="ftn-pref-thumb" style={{background:WALLPAPERS[index].background.replace('w=1920&q=82','w=480&q=72')}}/>
              {preferences.wallpaper===index&&<span className="ftn-pref-wall-check"><Symbol name="check" size={14}/></span>}
              <span className="ftn-pref-wall-name">{WALLPAPERS[index].name}</span>
            </button>)}
          </div>
        </section>)}
        <p className="ftn-pref-image-note">Fotografske pozadine se učitavaju sa Unsplasha. Za rad bez interneta uvek su dostupne ugrađene gradijentne pozadine.</p>
      </div>}
      {page==='appearance'&&<div className="ftn-pref-page">
        <section className="ftn-pref-surface"><div className="ftn-pref-section-heading"><div><h3>Tema prozora</h3><p>Odaberi svetlu ili tamnu površinu aplikacija.</p></div></div>
          <div className="ftn-pref-theme-grid">
            {([false,true] as const).map(dark=><button type="button" key={String(dark)}
              className={'ftn-pref-theme-choice'+(preferences.dark===dark?' selected':'')}
              onClick={()=>onChange({dark})} aria-pressed={preferences.dark===dark}>
              <span className={'ftn-pref-theme-mini'+(dark?' dark':' light')}><i/><b/><em/><small/></span>
              <span>{dark?'Tamna':'Svetla'} tema</span>
              {preferences.dark===dark&&<span className="ftn-pref-theme-selected"><Symbol name="check" size={14}/></span>}
            </button>)}
          </div>
          <PreferenceRow title="Tamni režim" description="Primeni tamnu temu radne površine i podešavanja.">
            <Switch checked={preferences.dark} label="Tamni režim" onChange={dark=>onChange({dark})}/>
          </PreferenceRow>
        </section>
        <section className="ftn-pref-surface">
          <div className="ftn-pref-section-heading"><div><h3>Brzi pristup</h3><p>Izabrana pozadina prikazuje se na tvojoj radnoj površini.</p></div></div>
          <button className="ftn-pref-inline-link" type="button" onClick={()=>setPage('wallpaper')}><Symbol name="wallpaper"/><span>Izaberi pozadinu</span><Symbol name="chevron" size={16}/></button>
        </section>
      </div>}
      {page==='desktop'&&<div className="ftn-pref-page">
        <section className="ftn-pref-surface">
          <div className="ftn-pref-section-heading"><div><h3>Prikaz</h3><p>Kontrole koje utiču na izgled desktopa.</p></div></div>
          <PreferenceRow title="Widgeti" description="Vremenska prognoza, lokalni sat i kalendar na desktopu.">
            <Switch checked={preferences.widgets} label="Prikaži widgete" onChange={widgets=>onChange({widgets})}/>
          </PreferenceRow>
          <PreferenceRow title="Noćno svetlo" description="Toplije boje i prijatniji kontrast uveče.">
            <Switch checked={preferences.nightLight} label="Noćno svetlo" onChange={nightLight=>onChange({nightLight})}/>
          </PreferenceRow>
          <div className="ftn-pref-slider-row">
            <div><strong>Osvetljenje pozadine</strong><small>Menja svetlinu pozadine, ne svetlinu ekrana.</small></div>
            <div className="ftn-pref-slider-controls"><Symbol name="moon" size={16}/>
              <input type="range" min="65" max="120" step="1" aria-label="Osvetljenje pozadine"
                value={preferences.brightness} style={{'--ftn-range-fill':brightness+'%'} as CSSProperties}
                onChange={event=>onChange({brightness:Number(event.target.value)})}/>
              <Symbol name="sun" size={18}/><output>{preferences.brightness}%</output>
            </div>
          </div>
        </section>
        <section className="ftn-pref-surface">
          <div className="ftn-pref-section-heading"><div><h3>Početne postavke</h3><p>Vrati originalni izgled radne površine.</p></div></div>
          <button className="ftn-pref-reset" type="button" onClick={()=>onChange(DEFAULT_PREFERENCES)}>
            <Symbol name="reset" size={16}/> Vrati izgled i pozadinu na podrazumevane vrednosti
          </button>
        </section>
      </div>}
      {page==='shortcuts'&&<div className="ftn-pref-page">
        <section className="ftn-pref-surface">
          <div className="ftn-pref-section-heading"><div><h3>Prečice na desktopu</h3><p>Tvoj raspored aplikacija može da se prilagodi.</p></div></div>
          <div className="ftn-pref-instruction"><span>01</span><div><strong>Dodaj aplikaciju</strong><p>Otvori Aktivnosti, pronađi željenu aplikaciju i izaberi + Desktop.</p></div></div>
          <div className="ftn-pref-instruction"><span>02</span><div><strong>Premesti prečicu</strong><p>Prevuci je na novu ćeliju. Zauzeta ćelija automatski menja mesta sa tvojom prečicom.</p></div></div>
          <div className="ftn-pref-instruction"><span>03</span><div><strong>Pinuj aplikaciju</strong><p>Koristi + Dock u pregledu aplikacija, ili desni klik na desktop ikonicu.</p></div></div>
          <div className="ftn-pref-instruction"><span>04</span><div><strong>Ukloni prečicu</strong><p>Desni klik na ikonicu, zatim Ukloni sa desktopa. Predmeti ostaju dostupni.</p></div></div>
        </section>
        <section className="ftn-pref-surface ftn-pref-note"><Symbol name="info" size={18}/>
          <p>Raspored prečica i pinovanih aplikacija čuva se lokalno u ovom browseru i neće se prenositi na drugi uređaj.</p>
        </section>
      </div>}
    </div>
  </div>
}
