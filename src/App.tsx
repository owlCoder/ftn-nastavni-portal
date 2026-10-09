import { useState } from 'react'
import { GnomeDesktop } from './components/GnomeDesktop'
import { LoginScreen, SESSION_KEY } from './components/DesktopSettings'

export default function App() {
  const [loggedIn,setLoggedIn]=useState(()=>{
    try{return localStorage.getItem(SESSION_KEY)==='student'}catch{return false}
  })
  const logout=()=>{
    try{localStorage.removeItem(SESSION_KEY)}catch{/* storage unavailable */}
    setLoggedIn(false)
  }
  return loggedIn?<GnomeDesktop onLogout={logout}/>:<LoginScreen onLogin={()=>setLoggedIn(true)}/>
}
