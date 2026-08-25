import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import { TRPCProvider } from './providers/trpc'
import './styles/base.css'
import './styles/nav.css'
import './styles/cursor.css'
import './styles/chrome.css'
import './styles/home-hero.css'
import './styles/home.css'
import './styles/about.css'
import './styles/work.css'
import './styles/lab.css'
import './styles/blog.css'
import './styles/contact.css'
import './styles/notfound.css'
import './styles/dashboard.css'

/* PWA: register the service worker (app shell + offline API reads) */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is best-effort */
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
