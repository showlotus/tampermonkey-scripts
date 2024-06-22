import './style.css'
import { setupCounter } from './counter'

function mount() {
  const app = document.createElement('div')
  app.setAttribute('id', 'monkey-app')
  app.innerHTML = /* html */ `
    <button class="counter"></button>
  `
  document.body.append(app)
}

mount()

setupCounter(document.querySelector<HTMLButtonElement>('#monkey-app .counter')!)
