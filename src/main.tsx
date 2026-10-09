import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/static-site.css'
import './styles/presentations.css'
import './styles/checkpoints.css'
import './styles/subjects.css'
import './styles/examples.css'
import './styles/ui-refresh.css'
import './styles/desktop-games.css'
import './styles/desktop-widgets.css'
import './styles/gnome.css'
import './styles/gnome-windows.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
