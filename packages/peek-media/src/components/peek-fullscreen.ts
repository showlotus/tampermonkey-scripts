import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import normalizeWheel from 'normalize-wheel'

/**
 * 全屏容器组件
 */
@customElement('peek-fullscreen')
export class PeekFullscreen extends LitElement {
  @property({ type: Object })
  media: HTMLImageElement | HTMLVideoElement | null = null

  // 图片缩放状态
  private scale = 1
  private fitScale = 1
  private minScale = 1 // 最小缩放比例
  private maxScale = 5 // 最大缩放比例
  private tx = 0 // 水平平移偏移
  private ty = 0 // 垂直平移偏移

  // 图片拖拽状态
  private dragging = false
  private dragStartX = 0
  private dragStartY = 0

  // 保存原始样式
  private originalStyles: Map<string, string> = new Map()
  private originalScrollbarWidth: number = 0
  private originalBodyStyles: Partial<CSSStyleDeclaration> = {}
  private originalVideoControls = false
  private mediaWrapper: HTMLElement | null = null
  private originalVideoParent: HTMLElement | null = null
  private originalVideoNextSibling: Node | null = null

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: fade-in 0.2s ease-out;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .media-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .media-container img {
      max-width: none;
      max-height: none;
      transition: transform 0.08s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: transform;
      transform-origin: center center;
      touch-action: none;
      user-select: none;
      -webkit-user-drag: none;
      cursor: grab;
    }

    .media-container img.dragging {
      transition: none;
      cursor: grabbing;
    }

    .close {
      position: fixed;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      font-size: 20px;
      transition: background-color 0.2s;
      z-index: 1000000;
    }

    .close:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('keydown', this._handleKeydown)
    this._disableScroll()

    if (this.media) {
      this._saveOriginalStyles()
      this._applyFullscreenStyles()
      window.addEventListener('resize', this._handleResize)

      if (this.media instanceof HTMLImageElement) {
        // 等待图片加载完成后初始化缩放参数
        if (this.media.complete) {
          this._initializeImageZoom()
        } else {
          this.media.addEventListener('load', () => this._initializeImageZoom())
        }
      }
    }

    this._notifyFullscreenState(true)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('keydown', this._handleKeydown)
    window.removeEventListener('resize', this._handleResize)
    this._enableScroll()

    if (this.media) {
      this._restoreOriginalStyles()
    }

    this._notifyFullscreenState(false)
  }

  /**
   * 通知管理器全屏状态变化
   */
  private _notifyFullscreenState(active: boolean) {
    document.dispatchEvent(new CustomEvent('peek-fullscreen-change', { detail: { active } }))
  }

  /**
   * 初始化图片缩放参数
   */
  private _initializeImageZoom() {
    if (!(this.media instanceof HTMLImageElement)) return

    // 获取图片原始尺寸
    const imgWidth = this.media.naturalWidth
    const imgHeight = this.media.naturalHeight
    if (!imgWidth || !imgHeight) return

    // 计算适屏缩放比例（不放大小图）
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const rawFit = Math.min(viewportWidth / imgWidth, viewportHeight / imgHeight)
    this.fitScale = Math.min(rawFit, 1)

    // 最小为适屏大小，最大为自然大小与适屏中较大者的 4 倍
    this.minScale = this.fitScale
    this.maxScale = Math.max(rawFit, 1) * 4

    // 重置缩放与平移
    this.scale = this.fitScale
    this.tx = 0
    this.ty = 0
    this._updateImageTransform()
  }

  /**
   * 处理鼠标滚轮事件
   */
  private _handleWheel = (e: WheelEvent) => {
    if (!(this.media instanceof HTMLImageElement)) return

    // 阻止事件冒泡和默认行为
    e.stopPropagation()
    e.preventDefault()

    // 获取标准化的滚轮事件数据
    const { pixelY, spinY } = normalizeWheel(e)

    // 如果没有滚动，不处理
    if (pixelY === 0 && spinY === 0) return

    // 使用 spinY 和 pixelY 的组合来计算缩放
    const baseZoomFactor = 1.05 // 基础缩放因子（更小以实现更细腻的控制）

    // 计算滚动强度
    const spinStrength = Math.abs(spinY) * 0.008 // spinY 的权重
    const pixelStrength = Math.abs(pixelY) * 0.0001 // pixelY 的权重
    const scrollStrength = Math.min(spinStrength + pixelStrength, 0.2) // 限制最大强度

    // 计算最终的缩放因子
    const zoomFactor = baseZoomFactor + scrollStrength

    // 使用 easeOutQuad 缓动函数使缩放更平滑
    const easeOutQuad = (t: number) => t * (2 - t)
    const smoothZoomFactor = 1 + easeOutQuad(zoomFactor - 1)

    // 根据滚动方向决定是放大还是缩小
    const direction = (pixelY || spinY) > 0 ? -1 : 1
    const scaleFactor = Math.pow(smoothZoomFactor, direction)

    // 以鼠标位置为锚点进行缩放
    this._zoomAt(e.clientX, e.clientY, this.scale * scaleFactor)
  }

  /**
   * 以指定视口坐标为锚点缩放图片
   */
  private _zoomAt(clientX: number, clientY: number, targetScale: number) {
    const newScale = Math.max(this.minScale, Math.min(this.maxScale, targetScale))
    if (newScale === this.scale) return

    const container = this.renderRoot?.querySelector('.media-container')
    if (!container) return

    // 计算锚点相对于容器中心的位置，保持该点在缩放前后不动
    const rect = container.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    const ratio = newScale / this.scale
    this.tx = dx - (dx - this.tx) * ratio
    this.ty = dy - (dy - this.ty) * ratio
    this.scale = newScale
    this._clampPan()
    this._updateImageTransform()
  }

  /**
   * 限制平移范围，避免图片被拖出视口
   */
  private _clampPan() {
    if (!(this.media instanceof HTMLImageElement)) return

    const displayedWidth = this.media.naturalWidth * this.scale
    const displayedHeight = this.media.naturalHeight * this.scale
    const maxX = Math.max(0, (displayedWidth - window.innerWidth) / 2)
    const maxY = Math.max(0, (displayedHeight - window.innerHeight) / 2)
    this.tx = Math.min(maxX, Math.max(-maxX, this.tx))
    this.ty = Math.min(maxY, Math.max(-maxY, this.ty))
  }

  /**
   * 更新图片变换
   */
  private _updateImageTransform() {
    const img = this.renderRoot?.querySelector('img')
    if (!img) return

    // 应用变换
    img.style.transform = `translate(${this.tx}px, ${this.ty}px) scale(${this.scale})`
  }

  /**
   * 处理图片拖拽开始
   */
  private _onPointerDown = (e: PointerEvent) => {
    this.dragging = true
    this.dragStartX = e.clientX - this.tx
    this.dragStartY = e.clientY - this.ty
    const img = e.currentTarget as HTMLElement
    img.classList.add('dragging')
    img.setPointerCapture(e.pointerId)
  }

  /**
   * 处理图片拖拽移动
   */
  private _onPointerMove = (e: PointerEvent) => {
    if (!this.dragging) return

    this.tx = e.clientX - this.dragStartX
    this.ty = e.clientY - this.dragStartY
    this._clampPan()
    this._updateImageTransform()
  }

  /**
   * 处理图片拖拽结束
   */
  private _onPointerUp = (e: PointerEvent) => {
    if (!this.dragging) return

    this.dragging = false
    const img = e.currentTarget as HTMLElement
    img.classList.remove('dragging')
  }

  /**
   * 处理图片双击，在适屏与原始大小之间切换
   */
  private _onDblClick = (e: MouseEvent) => {
    const targetScale =
      this.scale > this.fitScale * 1.05 ? this.fitScale : Math.max(this.fitScale, 1)
    this._zoomAt(e.clientX, e.clientY, targetScale)
  }

  /**
   * 点击空白遮罩区域关闭全屏
   */
  private _onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      this._onClose()
    }
  }

  /**
   * 处理窗口大小变化
   */
  private _handleResize = () => {
    if (this.media instanceof HTMLVideoElement) {
      this._updateVideoSize(this.media)
    } else if (this.media instanceof HTMLImageElement) {
      this._initializeImageZoom()
    }
  }

  /**
   * 计算视频的最佳尺寸
   */
  private _calculateOptimalSize(
    originalWidth: number,
    originalHeight: number
  ): { width: number; height: number } {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 计算宽高缩放比
    const widthScale = viewportWidth / originalWidth
    const heightScale = viewportHeight / originalHeight

    // 使用较小的缩放比，确保视频完全显示且不变形
    const scale = Math.min(widthScale, heightScale)

    return {
      width: Math.floor(originalWidth * scale),
      height: Math.floor(originalHeight * scale)
    }
  }

  /**
   * 更新视频尺寸
   */
  private _updateVideoSize(video: HTMLVideoElement) {
    // 获取视频原始尺寸
    const originalWidth = video.videoWidth || video.clientWidth
    const originalHeight = video.videoHeight || video.clientHeight

    // 计算最佳尺寸
    const { width, height } = this._calculateOptimalSize(originalWidth, originalHeight)

    // 应用新尺寸
    video.style.width = `${width}px`
    video.style.height = `${height}px`

    // 更新包裹元素位置
    if (this.mediaWrapper) {
      this.mediaWrapper.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${width}px;
        height: ${height}px;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
      `
    }
  }

  /**
   * 保存原始样式
   */
  private _saveOriginalStyles() {
    if (!this.media) return // 保存媒体元素的样式
    ;[
      'position',
      'top',
      'left',
      'width',
      'height',
      'maxWidth',
      'maxHeight',
      'zIndex',
      'margin',
      'transform'
    ].forEach(prop => {
      this.originalStyles.set(prop, this.media!.style[prop as any])
    })

    // 如果是视频，保存原始位置信息
    if (this.media instanceof HTMLVideoElement) {
      this.originalVideoControls = this.media.controls
      this.originalVideoParent = this.media.parentElement
      this.originalVideoNextSibling = this.media.nextSibling
      this.mediaWrapper = document.createElement('div')
      document.body.appendChild(this.mediaWrapper)
    }
  }

  /**
   * 应用全屏样式
   */
  private _applyFullscreenStyles() {
    if (!this.media) return

    if (this.media instanceof HTMLVideoElement) {
      // 移动视频到包裹元素中
      if (this.mediaWrapper) {
        // 暂停视频，移动后再播放，避免闪烁
        const wasPlaying = !this.media.paused
        if (wasPlaying) {
          this.media.pause()
        }

        this.mediaWrapper.appendChild(this.media)

        // 确保视频控件可见
        this.media.controls = true

        // 更新视频尺寸
        this._updateVideoSize(this.media)

        // 恢复播放
        if (wasPlaying) {
          this.media.play()
        }
      }
    }
  }

  /**
   * 恢复原始样式
   */
  private _restoreOriginalStyles() {
    if (!this.media) return

    // 恢复媒体元素样式
    this.originalStyles.forEach((value, prop) => {
      this.media!.style[prop as any] = value
    })

    // 如果是视频，恢复到原始位置
    if (this.media instanceof HTMLVideoElement) {
      // 暂停视频，移动后再播放，避免闪烁
      const wasPlaying = !this.media.paused
      if (wasPlaying) {
        this.media.pause()
      }

      // 恢复视频控件原始状态
      this.media.controls = this.originalVideoControls

      // 恢复到原始位置
      if (this.originalVideoParent) {
        if (this.originalVideoNextSibling) {
          this.originalVideoParent.insertBefore(this.media, this.originalVideoNextSibling)
        } else {
          this.originalVideoParent.appendChild(this.media)
        }
      }

      // 移除包裹元素
      if (this.mediaWrapper) {
        this.mediaWrapper.remove()
      }

      // 恢复播放
      if (wasPlaying) {
        // 延迟一帧再恢复播放，确保 DOM 已更新
        requestAnimationFrame(() => {
          ;(this.media as HTMLVideoElement)!.play()
        })
      }
    }
  }

  /**
   * 禁用页面滚动
   */
  private _disableScroll() {
    this.originalScrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    const bodyStyles = window.getComputedStyle(document.body)
    this.originalBodyStyles = {
      overflow: bodyStyles.overflow,
      paddingRight: bodyStyles.paddingRight
    }

    // 只禁用 body 的滚动，不影响组件内部
    document.body.style.overflow = 'hidden'
    if (this.originalScrollbarWidth > 0) {
      document.body.style.paddingRight = `${this.originalScrollbarWidth}px`
    }

    // 阻止文档级别的滚轮事件，但不影响组件内部
    document.addEventListener('wheel', this._preventScroll, { passive: false })
  }

  /**
   * 恢复页面滚动
   */
  private _enableScroll() {
    document.body.style.overflow = this.originalBodyStyles.overflow || ''
    document.body.style.paddingRight = this.originalBodyStyles.paddingRight || ''
    document.removeEventListener('wheel', this._preventScroll)
  }

  /**
   * 阻止文档滚动
   */
  private _preventScroll = (e: WheelEvent) => {
    // 检查事件是否来自组件内部
    if (!this.renderRoot.contains(e.target as Node)) {
      e.preventDefault()
    }
  }

  private _handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this._onClose()
    }
  }

  render() {
    if (!this.media) return null

    return html`
      <div class="close" @click=${this._onClose}>×</div>
      <div class="media-container" @wheel=${this._handleWheel} @click=${this._onBackdropClick}>
        ${this.media instanceof HTMLImageElement
          ? html`<img
              src="${this.media.src}"
              alt="${this.media.alt}"
              draggable="false"
              @pointerdown=${this._onPointerDown}
              @pointermove=${this._onPointerMove}
              @pointerup=${this._onPointerUp}
              @pointercancel=${this._onPointerUp}
              @dblclick=${this._onDblClick}
            />`
          : ''}
      </div>
    `
  }

  private _onClose() {
    this.remove()
  }
}
