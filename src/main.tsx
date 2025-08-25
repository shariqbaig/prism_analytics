import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { configureConsole } from './lib/utils'
import { performanceMonitor, bundleMetrics } from './lib/performance'

// Configure console logging based on environment
configureConsole()

// Initialize performance monitoring
performanceMonitor.init()

// Track bundle metrics after app loads
window.addEventListener('load', () => {
  bundleMetrics.logBundleMetrics()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
