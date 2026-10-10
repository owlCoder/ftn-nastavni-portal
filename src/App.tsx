import { useState } from 'react'
import { GnomeDesktop } from './components/GnomeDesktop'
import { LoginScreen, SESSION_KEY } from './components/DesktopSettings'
import { LockScreen } from './components/LockScreen'

export default function App(){
  const [loggedIn,setLoggedIn]=useState(()=>{
    try{return localStorage.getItem(SESSION_KEY)==='student'}catch{return false}
  })
  const [stage,setStage]=useState<'lock'|'login'>('lock')
  const logout=()=>{
    try{localStorage.removeItem(SESSION_KEY)}catch{/* storage unavailable */}
    setLoggedIn(false);setStage('lock')
  }
  return loggedIn?<GnomeDesktop onLogout={logout}/>:
    stage==='lock'?<LockScreen onUnlock={()=>setStage('login')}/>:
      <LoginScreen onLogin={()=>setLoggedIn(true)} onBack={()=>setStage('lock')}/>
}
