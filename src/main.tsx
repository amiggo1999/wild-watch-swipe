import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'
import { resetLocalStorage } from './utils/localStorage'

// Lösche Local Storage beim initialen Laden der Seite
resetLocalStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

