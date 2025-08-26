import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(
  (() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'bilibili-video-note-export-v2')
    document.body.appendChild(app)
    return app
  })()
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
