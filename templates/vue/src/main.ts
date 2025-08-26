import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount(
  (() => {
    const app = document.createElement('div')
    app.setAttribute('id', 'tampermonkey-scripts-template-vue')
    document.body.appendChild(app)
    return app
  })()
)
