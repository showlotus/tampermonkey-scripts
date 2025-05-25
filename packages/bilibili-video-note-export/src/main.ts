import { setupCounter } from './counter'
import './style.css'

const APP_ID = 'bilibili-video-note-export'

const createApp = (id = APP_ID) => {
  const app = document.createElement('div')
  app.setAttribute('id', id)
  return app
}

function mount(app: HTMLElement) {
  const root = document.createElement('div')
  root.setAttribute(
    'class',
    'p-8 text-center rounded-2xl flex justify-center items-center fixed bottom-[70px] right-5 bg-black'
  )
  app.appendChild(root)

  const button = document.createElement('button')
  button.setAttribute(
    'class',
    'counter rounded-lg border border-[#3e3e3e] px-5 py-2.5 text-base font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed] hover:border-[#5384ed]'
  )
  button.textContent = '导出视频笔记'
  root.appendChild(button)

  document.body.append(app)

  setupCounter(button)
}

mount(createApp())
