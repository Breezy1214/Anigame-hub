import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Latin subsets only: titles are English or romaji, and the full files carry hundreds of Japanese ranges.
import '@fontsource/dela-gothic-one/latin-400.css'
import '@fontsource/dela-gothic-one/latin-ext-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-700.css'
import '@fontsource/zen-kaku-gothic-new/latin-ext-400.css'
import '@fontsource/zen-kaku-gothic-new/latin-ext-500.css'
import '@fontsource/zen-kaku-gothic-new/latin-ext-700.css'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
