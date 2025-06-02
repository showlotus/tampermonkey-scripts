import { setupCounter } from './counter'
import './style.css'

const APP_ID = 'tampermonkey-scripts-template'

export const mount = () => {
  const app = document.createElement('div')
  app.setAttribute('id', APP_ID)

  const root = document.createElement('div')
  root.setAttribute(
    'class',
    'p-8 text-center rounded-2xl flex justify-center items-center fixed bottom-[70px] right-5 bg-black'
  )
  app.appendChild(root)

  const button = document.createElement('button')
  button.setAttribute(
    'class',
    'counter rounded-lg border border-[#3e3e3e] px-5 py-2.5 text-base font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed] hover:border-[#5384ed] border-solid'
  )
  root.appendChild(button)

  document.body.append(app)

  setupCounter(button)
}

export const unmount = () => {
  const app = document.querySelector(`#${APP_ID}`)
  if (app) {
    app.remove()
  }
}

// 初始化渲染
mount()

// 添加 HMR 支持
if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    // 卸载
    mod?.unmount()
    // 挂载
    mod?.mount()
  })
}
