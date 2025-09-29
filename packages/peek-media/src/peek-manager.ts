import { PeekToolbar } from './components/peek-toolbar'
import { PeekFullscreen } from './components/peek-fullscreen'
import { createThrottledFunction } from './utils/throttle'
import './components/peek-toolbar'
import './components/peek-fullscreen'

/**
 * 媒体管理器
 */
export class PeekManager extends EventTarget {
  private toolbar: PeekToolbar | null = null
  private currentMedia: HTMLElement | null = null
  private hideTimeout: number | null = null
  private readonly updateToolbarPosition: (media: HTMLElement) => void
  private readonly MIN_MEDIA_SIZE = 100 // 最小媒体尺寸

  constructor() {
    super()
    // 创建节流版本的位置更新函数
    this.updateToolbarPosition = createThrottledFunction((media: HTMLElement) => {
      if (!this.toolbar) return
      const rect = media.getBoundingClientRect()
      this.toolbar.updatePosition(rect)
    }, 30)

    this.initEventListeners()
  }

  /**
   * 检查媒体元素是否满足最小尺寸要求
   */
  private isMediaSizeValid(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return rect.width >= this.MIN_MEDIA_SIZE && rect.height >= this.MIN_MEDIA_SIZE
  }

  /**
   * 初始化事件监听
   */
  private initEventListeners() {
    // 事件委托处理鼠标移入
    document.addEventListener('mouseover', e => {
      const target = e.target as HTMLElement
      if (this.isMediaElement(target) && this.isMediaSizeValid(target)) {
        this.handleMediaHover(target)
      }
    })

    // 处理鼠标移出
    document.addEventListener('mouseout', e => {
      const target = e.target as HTMLElement
      const relatedTarget = e.relatedTarget as HTMLElement

      if (
        this.isMediaElement(target) &&
        (!relatedTarget || !this.isToolbarElement(relatedTarget))
      ) {
        this.handleMediaLeave()
      }
    })

    // 处理鼠标移动
    document.addEventListener(
      'mousemove',
      e => {
        if (this.currentMedia && this.toolbar) {
          // 检查当前媒体元素是否仍然满足尺寸要求
          if (!this.isMediaSizeValid(this.currentMedia)) {
            this.handleMediaLeave()
            return
          }
          this.updateToolbarPosition(this.currentMedia)
        }
      },
      { passive: true }
    )

    // 处理滚动时更新工具栏位置
    window.addEventListener(
      'scroll',
      () => {
        if (this.currentMedia && this.toolbar) {
          // 检查当前媒体元素是否仍然满足尺寸要求
          if (!this.isMediaSizeValid(this.currentMedia)) {
            this.handleMediaLeave()
            return
          }
          this.updateToolbarPosition(this.currentMedia)
        }
      },
      { passive: true }
    )

    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      if (this.currentMedia && this.toolbar) {
        // 检查当前媒体元素是否仍然满足尺寸要求
        if (!this.isMediaSizeValid(this.currentMedia)) {
          this.handleMediaLeave()
          return
        }
        this.updateToolbarPosition(this.currentMedia)
      }
    })
  }

  /**
   * 判断是否为媒体元素
   */
  private isMediaElement(element: HTMLElement): boolean {
    return element instanceof HTMLImageElement || element instanceof HTMLVideoElement
  }

  /**
   * 判断是否为工具栏元素
   */
  private isToolbarElement(element: HTMLElement): boolean {
    return (
      element.tagName.toLowerCase() === 'peek-toolbar' || element.closest('peek-toolbar') !== null
    )
  }

  /**
   * 处理媒体元素的鼠标悬浮
   */
  private handleMediaHover(media: HTMLElement) {
    // 检查媒体元素尺寸
    if (!this.isMediaSizeValid(media)) return

    // 清除之前的隐藏定时器
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout)
      this.hideTimeout = null
    }

    // 如果是新的媒体元素，更新当前媒体
    if (this.currentMedia !== media) {
      this.currentMedia = media
      // 创建或更新工具栏
      if (!this.toolbar) {
        this.toolbar = document.createElement('peek-toolbar') as PeekToolbar
        this.setupToolbarEvents()
        document.body.appendChild(this.toolbar)
      }
      // 设置媒体类型
      this.toolbar.mediaType = media instanceof HTMLVideoElement ? 'video' : 'image'
    }

    // 立即更新工具栏位置
    this.updateToolbarPosition(media)
    this.toolbar!.show()
  }

  /**
   * 处理媒体元素的鼠标移出
   */
  private handleMediaLeave() {
    if (this.toolbar) {
      // 添加延迟以处理工具栏的悬浮
      this.hideTimeout = window.setTimeout(() => {
        if (this.toolbar) {
          this.toolbar.hide()
        }
      }, 200)
    }

    // 清理节流函数
    ;(this.updateToolbarPosition as any).cleanup?.()
  }

  /**
   * 设置工具栏事件
   */
  private setupToolbarEvents() {
    if (!this.toolbar) return

    // 处理工具栏自身的悬浮
    this.toolbar.addEventListener('mouseover', () => {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout)
        this.hideTimeout = null
      }
      this.toolbar!.show()
    })

    this.toolbar.addEventListener('mouseout', e => {
      const relatedTarget = e.relatedTarget as HTMLElement
      if (!this.currentMedia || !relatedTarget || !this.currentMedia.contains(relatedTarget)) {
        this.handleMediaLeave()
      }
    })

    // 处理全屏事件
    this.toolbar.addEventListener('fullscreen', () => {
      if (this.currentMedia) {
        const container = document.createElement('peek-fullscreen') as PeekFullscreen
        container.media = this.currentMedia as HTMLImageElement | HTMLVideoElement
        document.body.appendChild(container)
      }
    })

    // 处理播放/暂停事件
    this.toolbar.addEventListener('playpause', () => {
      if (this.currentMedia instanceof HTMLVideoElement) {
        if (this.currentMedia.paused) {
          this.currentMedia.play()
        } else {
          this.currentMedia.pause()
        }
      }
    })
  }
}
