import { getProviderId, getApiKey, getModel } from './settings'
import { getProvider } from './providers'
import { gmRequest, fetchImageAsBase64 } from './gm'

export interface CaptchaImage {
  type: 'data' | 'url'
  value: string
}

export async function getImageData(el: HTMLElement): Promise<CaptchaImage | null> {
  if (el.tagName === 'IMG' && (el as HTMLImageElement).src) {
    try {
      const img = el as HTMLImageElement
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      canvas.getContext('2d')?.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL('image/png')
      if (dataUrl && dataUrl !== 'data:,') {
        return { type: 'data', value: dataUrl }
      }
    } catch {
      // canvas 被跨域污染，降级为 URL 模式
    }
    return { type: 'url', value: (el as HTMLImageElement).src }
  }
  if (el.tagName === 'CANVAS') {
    return { type: 'data', value: (el as HTMLCanvasElement).toDataURL('image/png') }
  }
  console.warn('[CAPTCHA OCR] 不支持的元素类型:', el.tagName)
  return null
}

export async function recognize(
  image: CaptchaImage
): Promise<{ text: string | null; error: string | null }> {
  const provider = getProvider(getProviderId())
  if (!provider) return { text: null, error: '未知的 AI 平台，请重新设置' }

  const apiKey = getApiKey(provider.id)
  if (!apiKey && provider.id !== 'openrouter') {
    return { text: null, error: '请先设置 API Key（点击油猴菜单）' }
  }

  const model = getModel(provider.id)
  if (!model) return { text: null, error: '请先在设置中选择模型' }

  let imageUrl = image.value
  if (image.type === 'url') {
    imageUrl = (await fetchImageAsBase64(image.value).catch(() => null)) || image.value
  }

  let request
  try {
    request = provider.buildRequest(apiKey, model, imageUrl)
  } catch (err) {
    return { text: null, error: err instanceof Error ? err.message : '构造请求失败' }
  }

  let res
  try {
    res = await gmRequest({
      method: 'POST',
      url: request.url,
      headers: request.headers,
      data: request.data
    })
  } catch (err) {
    return { text: null, error: err instanceof Error ? err.message : '网络请求失败' }
  }

  if (res.status < 200 || res.status >= 300) {
    let message = `请求失败 (HTTP ${res.status})`
    try {
      const errJson = JSON.parse(res.responseText)
      message = errJson.error?.message || message
    } catch {
      // 非 JSON 错误体，保留默认消息
    }
    return { text: null, error: message }
  }

  try {
    const text = provider.extractText(res.responseText)
    return { text, error: text ? null : '识别失败' }
  } catch {
    return { text: null, error: '解析响应失败' }
  }
}

export function fillInput(text: string, inputSelector: string) {
  if (!inputSelector) return

  const input = document.querySelector(inputSelector)
  if (!input) {
    console.warn('[CAPTCHA OCR] 未找到输入框:', inputSelector)
    return
  }

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set
  if (nativeSetter) {
    nativeSetter.call(input, text)
  } else {
    ;(input as HTMLInputElement).value = text
  }

  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}
