import { setupCounter } from './counter'
import './style.css'

const APP_ID = 'bilibili-video-note-export'

const createApp = (id = APP_ID) => {
  const app = document.createElement('div')
  app.setAttribute('id', id)
  return app
}

const main = () => {
  // 创建 MutationObserver 实例
  const observer = new MutationObserver((mutations, obs) => {
    // 查找目标元素
    const noteContainer = document.querySelector('div.note-container')

    if (noteContainer) {
      // 创建 IntersectionObserver 实例
      const intersectionObserver = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          if (entry.isIntersecting) {
            // 元素可见时，停止观察
            intersectionObserver.disconnect()
            obs.disconnect()

            // 创建并挂载应用
            mount(createApp())
          }
        },
        {
          // 当元素有 1% 进入视口时触发
          threshold: 0.01
        }
      )

      // 开始观察元素可见性
      intersectionObserver.observe(noteContainer)
    }
  })

  // 开始观察文档变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

main()

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
    'counter rounded-lg border-none border-[#3e3e3e] px-5 py-2.5 text-base font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed] hover:border-[#5384ed]'
  )
  button.textContent = '导出视频笔记'
  root.appendChild(button)

  document.body.append(app)

  setupCounter(button)
}

mount(createApp())
