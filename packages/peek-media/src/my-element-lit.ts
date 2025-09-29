import { LitElement, css, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import litLogo from './assets/lit.svg'
import viteLogo from '/vite.svg'
import tailwindStyles from './tailwind.generated.css?inline'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element-lit')
export class MyElementLit extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0

  render() {
    return html`
      <div
        class="flex flex-col justify-center items-center gap-4 p-8 text-center rounded-2xl bg-black border-[#5384ed] border-solid"
      >
        <div class="flex items-center gap-4">
          <a href="https://vite.dev" target="_blank">
            <img src=${viteLogo} class="logo" alt="Vite logo" />
          </a>
          <span className="text-2xl font-bold">+</span>
          <a href="https://lit.dev" target="_blank">
            <img src=${litLogo} class="logo lit" alt="Lit logo" />
          </a>
        </div>
        <slot></slot>
        <button
          class="counter rounded-lg border border-[#3e3e3e] px-5 py-2.5 text-base text-white font-medium font-inherit bg-[#1a1a1a] cursor-pointer transition-colors duration-250 hover:text-[#5384ed] hover:border-[#5384ed] border-solid"
          @click=${this._onClick}
          part="button"
        >
          count is ${this.count}
        </button>
      </div>
    `
  }

  private _onClick() {
    this.count++
  }

  static styles = [
    css`
      :host {
        position: fixed;
        bottom: 70px;
        right: 20px;
      }
    `,
    unsafeCSS(tailwindStyles)
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element-lit': MyElementLit
  }
}
