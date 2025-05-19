import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/styles/globals.css'

import App from './App.tsx'

// TAG: Monkey 接入 vite-plugin-monkey 后，需手动创建根节点
createRoot(
  (() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'media-peek-app')
    document.body.appendChild(app)
    return app
  })()
).render(
  <StrictMode>
    <App />
  </StrictMode>
)
