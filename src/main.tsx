import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import type { FootballData } from './types'

const root = document.getElementById('root')!
const snapshot = document.getElementById('initial-data')
const initialData: FootballData | null = snapshot?.textContent ? JSON.parse(snapshot.textContent) : null
const app = (
  <StrictMode>
    <App initialData={initialData} />
  </StrictMode>
)

if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
