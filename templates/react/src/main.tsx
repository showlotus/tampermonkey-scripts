import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(
  (() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'tampermonkey-scripts-template')
    document.body.append(app)
    return app
  })()
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
