import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PwaRegistration } from './components/pwa/PwaRegistration'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PwaRegistration />
    <App />
  </StrictMode>,
)
