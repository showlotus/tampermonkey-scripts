export type BtnState = 'idle' | 'loading' | 'success' | 'error'
export type ToastType = 'success' | 'error' | 'info'

export const ICONS = {
  bolt: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="#fff" width="16" height="16"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  spinner: `<svg class="cap-rec-icon cap-rec-spinning" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`,
  check: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
  times: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  refresh: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" width="15" height="15" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><polyline points="20 3 20 8 15 8"/></svg>`,
  eye: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" width="16" height="16" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
} as const

const STATE_ICONS: Record<BtnState, string> = {
  idle: ICONS.bolt,
  loading: ICONS.spinner,
  success: ICONS.check,
  error: ICONS.times
}

export function showToast(message: string, type: ToastType = 'info') {
  const existing = document.querySelector('.cap-rec-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = `cap-rec-toast ${type}`
  toast.textContent = message
  ;(document.documentElement || document.body).appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(120%)'
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

export function setBtnState(btn: HTMLButtonElement, state: BtnState) {
  btn.classList.remove('loading', 'success', 'error')
  if (state !== 'idle') btn.classList.add(state)
  btn.innerHTML = STATE_ICONS[state]
}

export function injectButton(captchaEl: HTMLElement, onClick: (btn: HTMLButtonElement) => void) {
  if (captchaEl.dataset.captchaOcrInjected) return null
  captchaEl.dataset.captchaOcrInjected = 'true'

  const btn = document.createElement('button')
  btn.className = 'cap-rec-btn'
  btn.setAttribute('aria-label', '识别验证码')
  setBtnState(btn, 'idle')

  const needsWrapper = ['IMG', 'CANVAS'].includes(captchaEl.tagName)
  let container: HTMLElement = captchaEl

  if (needsWrapper) {
    const wrapper = document.createElement('div')
    wrapper.className = 'cap-rec-wrap'
    captchaEl.parentNode?.insertBefore(wrapper, captchaEl)
    wrapper.appendChild(captchaEl)
    container = wrapper

    const syncBtnHeight = () => {
      const height = captchaEl.offsetHeight
      if (height > 0) {
        btn.style.height = `${height}px`
      } else {
        requestAnimationFrame(syncBtnHeight)
      }
    }
    if (captchaEl.tagName === 'IMG' && (captchaEl as HTMLImageElement).complete) {
      syncBtnHeight()
    } else {
      captchaEl.addEventListener('load', syncBtnHeight, { once: true })
      captchaEl.addEventListener('error', syncBtnHeight, { once: true })
    }
  } else {
    if (getComputedStyle(captchaEl).position === 'static') {
      captchaEl.style.position = 'relative'
    }
    captchaEl.style.marginRight = '38px'
  }

  btn.addEventListener('click', e => {
    e.preventDefault()
    e.stopPropagation()
    if (btn.classList.contains('loading')) return
    onClick(btn)
  })
  btn.addEventListener('mousedown', e => e.stopPropagation())
  btn.addEventListener('mouseup', e => e.stopPropagation())

  container.appendChild(btn)
  return btn
}
