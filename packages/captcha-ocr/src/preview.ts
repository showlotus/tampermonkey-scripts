import './style.css'

interface GmProps {
  method: 'GET' | 'POST'
  url: string
  headers?: Record<string, string>
  data?: string
  responseType?: 'text' | 'blob'
  onload?: (res: { status: number; responseText: string; response: unknown }) => void
  onerror?: () => void
  ontimeout?: () => void
}

const store = new Map<string, unknown>()

Object.assign(window, {
  GM_getValue: (key: string, defaultValue?: unknown) =>
    store.has(key) ? store.get(key) : defaultValue,
  GM_setValue: (key: string, value: unknown) => void store.set(key, value),
  GM_registerMenuCommand: () => {},
  GM_setClipboard: () => {},
  GM_xmlhttpRequest: async (props: GmProps) => {
    try {
      const res = await fetch(props.url, {
        method: props.method,
        headers: props.headers,
        body: props.data
      })
      const isBlob = props.responseType === 'blob'
      props.onload?.({
        status: res.status,
        responseText: isBlob ? '' : await res.text(),
        response: isBlob ? await res.blob() : undefined
      })
    } catch {
      props.onerror?.()
    }
  }
})

async function init() {
  const { showSettingsDialog } = await import('./settings')
  document.getElementById('open-settings')!.addEventListener('click', () => showSettingsDialog())

  const img = document.querySelector<HTMLImageElement>('#demo-captcha')
  if (!img) return
  const { injectButton, setBtnState, showToast } = await import('./ui')
  const { getImageData, recognize } = await import('./ocr')
  injectButton(img, async btn => {
    setBtnState(btn, 'loading')
    try {
      const image = await getImageData(img)
      if (!image) throw new Error('获取验证码图片失败')
      const { text, error } = await recognize(image)
      if (error || !text) throw new Error(error || '识别失败')
      setBtnState(btn, 'success')
      showToast(`识别成功: ${text}`, 'success')
    } catch (err) {
      setBtnState(btn, 'error')
      showToast(err instanceof Error ? err.message : String(err), 'error')
    }
  })
}

init()
