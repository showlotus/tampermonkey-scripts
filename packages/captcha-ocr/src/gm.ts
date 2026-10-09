import { GM_xmlhttpRequest } from '$'

export interface GmResponse {
  status: number
  responseText: string
  response: unknown
}

interface GmRequestProps {
  method: 'GET' | 'POST'
  url: string
  headers?: Record<string, string>
  data?: string
  responseType?: 'text' | 'blob'
}

export function gmRequest(props: GmRequestProps): Promise<GmResponse> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      ...props,
      onload: res => resolve(res),
      onerror: () => reject(new Error('网络请求失败')),
      ontimeout: () => reject(new Error('请求超时'))
    })
  })
}

export function gmGetJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  return gmRequest({ method: 'GET', url, headers }).then(res => JSON.parse(res.responseText) as T)
}

export function fetchImageAsBase64(url: string): Promise<string | null> {
  return gmRequest({ method: 'GET', url, responseType: 'blob' }).then(
    res =>
      new Promise<string | null>(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(res.response as Blob)
      })
  )
}
