import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/static-site.css'
import './styles/portal.css'
import './styles/portal-theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
