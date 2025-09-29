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
   * 查找目标媒体元素
   */
  private findTargetMedia(elements: Element[]): HTMLElement | null {
    // 过滤出所有媒体元素
    const mediaElements = elements.filter(
      el => el instanceof HTMLImageElement || el instanceof HTMLVideoElement
    ) as HTMLElement[]

    if (mediaElements.length === 0) return null
    if (mediaElements.length === 1) return mediaElements[0]

    // 如果有多个媒体元素，使用以下规则按优先级筛选
    return (
      mediaElements.find(media => {
        // 1. 检查尺寸是否符合要求
        if (!this.isMediaSizeValid(media)) return false

        // 2. 检查可见性
        const style = window.getComputedStyle(media)
        if (style.display === 'none' || style.visibility === 'hidden') return false

        // 3. 检查是否为装饰性媒体
        if (media.dataset.isDecorative === 'true') return false

        // 4. 检查媒体是否有效
        if (media instanceof HTMLImageElement) {
          if (!media.complete || !media.naturalWidth) return false
        } else if (media instanceof HTMLVideoElement) {
          // 视频元素特殊检查
          if (media.readyState === 0) return false // HAVE_NOTHING
          if (media.videoWidth === 0 || media.videoHeight === 0) return false
        }

        return true
      }) || mediaElements[0] // 如果没有符合条件的，返回最上层的媒体元素
    )
  }

  /**
   * 初始化事件监听
   */
  private initEventListeners() {
    // 使用节流函数处理鼠标移动
    const handleMouseMove = createThrottledFunction((e: MouseEvent) => {
      // 获取鼠标位置下的所有元素
      const elements = document.elementsFromPoint(e.clientX, e.clientY)
      const targetMedia = this.findTargetMedia(elements)

      // 如果找到有效的媒体元素
      if (targetMedia && this.isMediaSizeValid(targetMedia)) {
        this.handleMediaHover(targetMedia)
      } else if (
        // 如果鼠标不在当前媒体元素或工具栏上，隐藏工具栏
        this.currentMedia &&
        !elements.includes(this.currentMedia) &&
        !elements.some(el => this.isToolbarElement(el as HTMLElement))
      ) {
        this.handleMediaLeave()
      }
    }, 30) // 30ms 的节流时间

    // 监听鼠标移动事件
    document.addEventListener('mousemove', handleMouseMove, { passive: true })

    // 使用节流函数处理滚动和窗口大小变化
    const handleViewportChange = createThrottledFunction(() => {
      if (!this.currentMedia || !this.toolbar) return

      // 检查当前图片是否仍然可见
      const rect = this.currentMedia.getBoundingClientRect()
      if (
        rect.right < 0 ||
        rect.bottom < 0 ||
        rect.left > window.innerWidth ||
        rect.top > window.innerHeight ||
        !this.isMediaSizeValid(this.currentMedia)
      ) {
        this.handleMediaLeave()
        return
      }

      // 更新工具栏位置
      this.updateToolbarPosition(this.currentMedia)
    }, 60) // 60ms 的节流时间，因为视口变化不需要太频繁的更新

    // 监听滚动和窗口大小变化
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange)
  }

  /**
   * 判断是否为媒体元素
   */
  private isMediaElement(element: HTMLElement): boolean {
    if (element instanceof HTMLImageElement) {
      return true
    }
    if (element instanceof HTMLVideoElement) {
      // 检查视频是否有效
      return element.readyState > 0 && element.videoWidth > 0 && element.videoHeight > 0
    }
    return false
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
