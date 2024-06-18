import './style.css'
import { setupCounter } from './counter'

function mount() {
  const app = document.createElement('div')
  app.innerHTML = /* html */ `
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  `
  document.body.append(app)
}

mount()

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
