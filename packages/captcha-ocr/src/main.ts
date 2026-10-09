import { GM_registerMenuCommand, GM_setClipboard } from '$'
import { findSiteConfig, type SiteConfig } from './config'
import { getImageData, recognize, fillInput } from './ocr'
import { getAutoCopy, getAutoSubmit, showSettingsDialog } from './settings'
import { injectButton, setBtnState, showToast } from './ui'
import './style.css'

GM_registerMenuCommand('设置', showSettingsDialog)

async function recognizeAndApply(
  captchaEl: HTMLElement,
  config: SiteConfig,
  btn: HTMLButtonElement | null,
  silent = false
) {
  if (btn) setBtnState(btn, 'loading')
  try {
    const image = await getImageData(captchaEl)
    if (!image) throw new Error('获取验证码图片失败')

    const { text, error } = await recognize(image)
    if (error || !text) throw new Error(error || '识别失败')

    fillInput(text, config.inputSelector)

    const autoCopy = getAutoCopy()
    if (autoCopy) GM_setClipboard(text, 'text')

    const actions: string[] = []
    if (config.inputSelector) {
      actions.push(autoCopy ? '已复制并填入' : '已填入')
    } else if (autoCopy) {
      actions.push('已复制')
    }

    if (getAutoSubmit() && config.submitSelector) {
      actions.push('已提交')
      setTimeout(() => {
        ;(document.querySelector(config.submitSelector!) as HTMLElement | null)?.click()
      }, 300)
    }

    if (btn) {
      setBtnState(btn, 'success')
      setTimeout(() => setBtnState(btn, 'idle'), 800)
    }
    showToast(`识别成功: ${text}${actions.length ? `（${actions.join('，')}）` : ''}`, 'success')
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (btn) {
      setBtnState(btn, 'error')
      setTimeout(() => setBtnState(btn, 'idle'), 1500)
    }
    if (!silent) showToast(message, 'error')
  }
}

function scanAndInject(config: SiteConfig) {
  document.querySelectorAll(config.captchaSelector).forEach(el => {
    if (el instanceof HTMLElement) {
      injectButton(el, btn => recognizeAndApply(el, config, btn))
    }
  })
}

function tryAutoRecognize(config: SiteConfig): boolean {
  const captchaEl = document.querySelector<HTMLElement>(config.captchaSelector)
  if (!captchaEl) return false
  if (captchaEl.tagName === 'IMG' && !(captchaEl as HTMLImageElement).complete) return false
  if (config.inputSelector && !document.querySelector(config.inputSelector)) return false

  const btn = captchaEl.closest('.cap-rec-wrap')?.querySelector('button') || null
  recognizeAndApply(captchaEl, config, btn, true)
  return true
}

function main() {
  const config = findSiteConfig(location.hostname)
  if (!config) return

  let autoDone = false
  const autoDeadline = Date.now() + 10000

  const observer = new MutationObserver(() => {
    scanAndInject(config)
    if (!autoDone && Date.now() <= autoDeadline) {
      autoDone = tryAutoRecognize(config)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })

  scanAndInject(config)
  if (Date.now() <= autoDeadline) {
    autoDone = tryAutoRecognize(config)
  }
}

main()
