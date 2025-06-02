import html2canvas from 'html2canvas'

import { $, $$ } from './utils'
import './style.css'

const APP_ID = 'bilibili-video-note-export'

// window.html2canvas = html2canvas

// 用于记录一些在 unmount 阶段执行的清理函数
import.meta.hot!.data.unmount = []

// 监听元素可见性
const watchElementVisibility = (
  selector: string | HTMLElement,
  callback: (isShow: boolean) => void
) => {
  const intersectionObserver = new IntersectionObserver(
    entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        callback(true)
      } else {
        callback(false)
      }
    },
    {
      // 当元素进入视口时触发
      threshold: 0.01
    }
  )

  const mutationObserver = new MutationObserver(() => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector
    if (el) {
      intersectionObserver.unobserve(el)
      intersectionObserver.observe(el)
    }
  })
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  const clear = () => {
    intersectionObserver.disconnect()
    mutationObserver.disconnect()
  }

  import.meta.hot!.data.unmount.push(clear)

  return clear
}

// 挂载
export const mount = () => {
  // 创建容器
  const root = document.createElement('div')
  root.setAttribute('id', APP_ID)

  let unwatchNoteDetail: (() => void) | undefined
  const unwatchNotePc = watchElementVisibility('div.note-pc', isNotePcShow => {
    if (!isNotePcShow) return
    console.log('打开笔记弹窗')
    // 移除类名控制笔记内容高度
    $('div.note-container div.note-content')?.classList.remove(
      'bilibili-video-note-export__after-note-export'
    )
    // 如果笔记详情已经监听，则不重复监听
    if (unwatchNoteDetail) return
    unwatchNoteDetail = watchElementVisibility('div.note-detail', noteDetailShow => {
      if (noteDetailShow) {
        console.log('打开笔记详情')
        const el = $(`div#${APP_ID}`)
        if (el) {
          // 显示容器
          el.style.display = 'block'

          // 添加类名控制笔记内容高度
          $('div.note-container div.note-content')?.classList.add(
            'bilibili-video-note-export__after-note-export'
          )

          // 设置 ql-editor 的 id，用于后续操作
          $('div.note-container div.ql-editor')!.setAttribute(
            'id',
            'bilibili-video-note-export__ql-editor'
          )

          // TODO 根据已记录的配置，设置 ql-editor 的样式
          return
        }

        root.innerHTML = /* html */ `
          <div class="h-[60px] py-3 px-5 flex items-center justify-between box-border bg-white border-t border-b border-solid border-l-0 border-r-0 border-[#e3e5e7] text-sm">
            <div class="flex gap-2">
              <div class="flex gap-2 items-center">
                <input type="radio" id="bilibili-video-note-export__default-style" name="export-style" value="default" checked />
                <label for="bilibili-video-note-export__default-style">默认样式</label>
              </div>
              <div class="flex gap-2 items-center">
                <input type="radio" id="bilibili-video-note-export__simple-style" name="export-style" value="simple" />
                <label for="bilibili-video-note-export__simple-style">简洁样式</label>
              </div>
              <div class="flex gap-2 items-center ml-[10px]">
                <input type="checkbox" id="bilibili-video-note-export__include-author-info" name="include-author-info" checked />
                <label for="bilibili-video-note-export__include-author-info">包含发布者</label>
              </div>
            </div>
            <div class="flex gap-2">
              <div id="bilibili-video-note-export__export-image" class="py-1 px-3 border-[#00aeec] border-solid border rounded-md text-[#33ffff] cursor-pointer hover:bg-[#00b5f6] hover:border-transparent hover:text-white">导出图片</div>
            </div>
          </div>
        `

        // 插入到笔记内容前面
        $('div.note-container')?.insertBefore(root, $('div.note-container div.note-content'))

        // 添加事件
        $$('input[name="export-style"]').forEach((radio: Element) => {
          radio.addEventListener('change', (e: Event) => {
            console.log('导出样式改变', (e.target as HTMLInputElement).value)
            if ((e.target as HTMLInputElement).value === 'simple') {
              $('div#bilibili-video-note-export__ql-editor')!.classList.remove('ql-editor')
            } else {
              $('div#bilibili-video-note-export__ql-editor')!.classList.add('ql-editor')
            }
          })
        })
        $('input[name="include-author-info"]')!.addEventListener('change', e => {
          if ((e.target as HTMLInputElement).checked) {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'flex'
          } else {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'none'
          }
          console.log('包含发布者改变', (e.target as HTMLInputElement).checked)
        })

        $('div#bilibili-video-note-export__export-image')!.addEventListener('click', () => {
          console.log('导出图片')

          // 获取选中的样式
          const style = $('input[name="export-style"]:checked') as HTMLInputElement
          console.log('导出样式:', style.value)

          // 获取是否包含发布者信息
          const includeAuthor = $('input[name="include-author-info"]') as HTMLInputElement
          console.log('包含发布者:', includeAuthor.checked)

          console.log('html2canvas', html2canvas)
        })
      } else {
        console.log('关闭笔记详情')
        $('div.note-container div.note-content')?.classList.remove(
          'bilibili-video-note-export__after-note-export'
        )
        const el = $(`div#${APP_ID}`)
        if (el) {
          // 隐藏容器
          el.style.display = 'none'
        }
      }
    })
    import.meta.hot!.data.unmount.push(unwatchNoteDetail)
  })
  import.meta.hot!.data.unmount.push(unwatchNotePc)
}

/**
 * 卸载
 *
 * - 移除新增的 DOM 节点或全局变量（DOM 节点与全局变量无论在哪个上下文中都可以获取得到，所以可以直接清理）
 * - 而对于一些在特定上下文中产生的变量，比如 `setTimeout` 返回的 `timerId` 或 `MutationObserver` 创建的实例，
 * - 在 `unmount` 中调用 `clearTimeout` 或 `ob.disconnect()` 是不会生效的，因为热更新后已经得到了一个新的上下文，
 * - 所以需要在 `import.meta.hot.data` 中记录这些副作用，然后在 `import.meta.hot.dispose` 中清理这些副作用
 */
export function unmount() {
  $(`div#${APP_ID}`)?.remove()
}

// 初始化渲染
mount()

// 添加 HMR 支持
if (import.meta.hot) {
  // 挂载
  import.meta.hot.accept(mod => {
    mod?.unmount()
    mod?.mount()
  })

  // 清理副作用
  import.meta.hot.dispose(data => {
    data.unmount.forEach((fn: (() => void) | undefined) => fn?.())
  })
}
