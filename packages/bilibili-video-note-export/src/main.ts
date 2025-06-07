import html2canvas from 'html2canvas'
import { GM_getValue, GM_setValue } from '$'
import { $, $$, logger, watchElementVisibility } from './utils'
import './style.css'

window.html2canvas = html2canvas

// 挂载函数，返回清理函数
export const mount = () => {
  const APP_ID = 'bilibili-video-note-export'
  // 创建容器
  const root = document.createElement('div')
  root.setAttribute('id', APP_ID)

  let unwatchNoteDetail: (() => void) | undefined
  const unwatchNotePc = watchElementVisibility('div.note-pc', isNotePcShow => {
    if (!isNotePcShow) {
      return
    }
    logger.debug('【笔记弹窗】打开')

    // 如果笔记详情已经监听，则不重复监听
    if (unwatchNoteDetail) return
    unwatchNoteDetail = watchElementVisibility('div.note-detail', noteDetailShow => {
      if (noteDetailShow) {
        logger.debug('【笔记详情】打开')
        const el = $(`div#${APP_ID}`)
        if (el) {
          // 显示容器
          el.style.display = 'block'

          // 添加类名控制笔记内容高度
          $('div.note-container div.note-content')?.classList.add(
            'bilibili-video-note-export__after-note-export'
          )

          // 设置 ql-editor 的 id，用于后续操作
          $('div.note-container div.ql-editor')?.setAttribute(
            'id',
            'bilibili-video-note-export__ql-editor'
          )

          // 根据已记录的配置，设置 ql-editor 的样式
          const exportStyle = GM_getValue('export-style', 'default') as 'default' | 'simple'
          if (exportStyle === 'simple') {
            $('div#bilibili-video-note-export__ql-editor')?.classList.remove('ql-editor')
          } else {
            $('div#bilibili-video-note-export__ql-editor')?.classList.add('ql-editor')
          }
          const includeAuthorInfo = GM_getValue('include-author-info', true)
          if (includeAuthorInfo) {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'flex'
          } else {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'none'
          }
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

        // 表单项发生变化时，记录值
        // 记录导出样式
        $$('input[name="export-style"]').forEach((radio: Element) => {
          radio.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLInputElement
            if (target.value === 'simple') {
              $('div#bilibili-video-note-export__ql-editor')!.classList.remove('ql-editor')
            } else {
              $('div#bilibili-video-note-export__ql-editor')!.classList.add('ql-editor')
            }
            GM_setValue('export-style', target.value)
          })
        })
        // 记录是否包含发布者信息
        $('input[name="include-author-info"]')!.addEventListener('change', e => {
          const target = e.target as HTMLInputElement
          if (target.checked) {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'flex'
          } else {
            $('div.note-container div.note-up.note-detail-up')!.style.display = 'none'
          }
          GM_setValue('include-author-info', target.checked)
        })

        $('div#bilibili-video-note-export__export-image')!.addEventListener('click', () => {
          // TODO 导出图片
          logger.debug('导出图片')
          logger.debug('导出样式:', GM_getValue('export-style', 'default'))
          logger.debug('包含发布者:', GM_getValue('include-author-info', true))

          // const canvas = await html2canvas(targetElement, {
          //   // 可选配置
          //   backgroundColor: null, // 保持透明背景
          //   useCORS: true,         // 如果元素中有跨域图片
          //   scale: 2,              // 提升分辨率
          // })

          // const dataUrl = canvas.toDataURL('image/png')

          // // 下载图片
          // const link = document.createElement('a')
          // link.href = dataUrl
          // link.download = 'screenshot.png'
          // link.click()
          // logger.info('html2canvas', html2canvas)
        })
      } else {
        logger.debug('关闭笔记详情')
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
  })

  logger.info('插件运行中...')

  // 返回清理函数
  return () => {
    // 移除类名控制笔记内容高度
    $('div.note-container div.note-content')?.classList.remove(
      'bilibili-video-note-export__after-note-export'
    )

    // 移除 DOM 节点
    $(`div#${APP_ID}`)?.remove()

    // 清理事件监听器
    unwatchNotePc()
    unwatchNoteDetail?.()
  }
}
