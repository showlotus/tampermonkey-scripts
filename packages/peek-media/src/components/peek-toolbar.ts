import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * 媒体工具栏组件
 */
@customElement('peek-toolbar')
export class PeekToolbar extends LitElement {
  @property({ type: String })
  mediaType: 'image' | 'video' = 'image'

  @property({ type: Boolean, reflect: true })
  visible = false

  static styles = css`
    :host {
      position: fixed;
      z-index: 999999;
      display: flex;
      gap: 8px;
      padding: 4px;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: auto;
    }

    :host([visible]) {
      opacity: 1;
    }

    .icon {
      width: 24px;
      height: 24px;
      padding: 4px;
      color: white;
      cursor: pointer;
      border-radius: 4px;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  `

  render() {
    return html`
      <div class="icon fullscreen" @click=${this._onFullscreen} title="全屏查看">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </div>
    `
    // ${this.mediaType === 'video' ? this._renderVideoControls() : ''}
  }

  private _renderVideoControls() {
    return html`
      <div class="icon play-pause" @click=${this._onPlayPause} title="播放/暂停">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z"
          />
        </svg>
      </div>
    `
  }

  private _onFullscreen(e: Event) {
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent('fullscreen'))
  }

  private _onPlayPause(e: Event) {
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent('playpause'))
  }

  /**
   * 更新工具栏位置
   */
  updatePosition(rect: DOMRect) {
    const padding = 8
    this.style.top = `${rect.top + padding}px`
    this.style.left = `${rect.right - this.offsetWidth - padding}px`
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }
}
