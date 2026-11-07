import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A Vite HTML-jében megadott root elemre csatoljuk a React komponensfát.
// A nem-null állítás a HTML és a belépési pont közötti szerződésre támaszkodik.
createRoot(document.getElementById('root')!).render(
  // A StrictMode fejlesztéskor segít észrevenni a nem tiszta renderelést és a hiányzó effekttakarítást.
  <StrictMode>
    <App />
  </StrictMode>,
)
