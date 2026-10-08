import type { RequestContext, RequestOverride, ResponseContext, ResponseOverride } from '../types'
import { parseRawHeaders } from './headers'

export type XhrRequestInterceptor = (info: RequestContext) => RequestOverride | void

export type XhrResponseInterceptor = (info: ResponseContext, body: string) => ResponseOverride | void

export class XhrInterceptor {
  private originalXHR: typeof XMLHttpRequest
  private requestInterceptors: XhrRequestInterceptor[] = []
  private responseInterceptors: XhrResponseInterceptor[] = []
  private isIntercepting = false

  constructor() {
    this.originalXHR = window.XMLHttpRequest
  }

  addRequestInterceptor(interceptor: XhrRequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: XhrResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  start() {
    if (this.isIntercepting) return

    const originalXHR = this.originalXHR
    const requestInterceptors = this.requestInterceptors
    const responseInterceptors = this.responseInterceptors

    const PatchedXHR = function (this: unknown): XMLHttpRequest {
      const xhr = new originalXHR()

      const info: RequestContext = {
        url: '',
        method: '',
        headers: {},
        body: null,
        timestamp: 0,
      }

      const originalOpen = xhr.open
      const originalSend = xhr.send
      const originalSetRequestHeader = xhr.setRequestHeader

      let pendingHeaders: Record<string, string> = {}
      let modifiedBody: unknown
      let modifiedMethod: string | undefined
      let modifiedUrl: string | undefined

      xhr.open = ((method: string, url: string | URL, async?: boolean,
        username?: string | null, password?: string | null) => {
        info.method = method.toUpperCase()
        info.url = url.toString()
        info.timestamp = Date.now()

        for (const interceptor of requestInterceptors) {
          try {
            const result = interceptor({ ...info, headers: { ...info.headers } })
            if (!result) continue
            if (result.url) modifiedUrl = result.url
            if (result.method) modifiedMethod = result.method.toUpperCase()
            if (result.body !== undefined) modifiedBody = result.body
            if (result.headers) {
              for (const [key, value] of Object.entries(result.headers)) {
                const lower = key.toLowerCase()
                if (info.headers[lower] !== value) pendingHeaders[lower] = value
              }
            }
          } catch (error) {
            console.error('[rewrite] XHR 请求拦截器执行失败:', error)
          }
        }

        if (modifiedUrl) info.url = modifiedUrl
        if (modifiedMethod) info.method = modifiedMethod

        return originalOpen.call(
          xhr,
          info.method,
          info.url,
          async ?? true,
          username,
          password
        )
      }) as typeof xhr.open

      xhr.setRequestHeader = ((name: string, value: string) => {
        info.headers[name.toLowerCase()] = value
        return originalSetRequestHeader.call(xhr, name, value)
      }) as typeof xhr.setRequestHeader

      xhr.send = ((data?: Document | XMLHttpRequestBodyInit | null) => {
        info.body = modifiedBody !== undefined ? modifiedBody : (data ?? null)
        info.timestamp = Date.now()

        if (Object.keys(pendingHeaders).length > 0) {
          for (const [name, value] of Object.entries(pendingHeaders)) {
            try {
              originalSetRequestHeader.call(xhr, name, value)
            } catch (error) {
              console.error('[rewrite] XHR 应用请求头失败:', name, error)
            }
          }
          pendingHeaders = {}
        }

        if (responseInterceptors.length > 0) {
          patchResponseAccess(xhr, info, responseInterceptors)
        }

        return originalSend.call(xhr, info.body as Document | XMLHttpRequestBodyInit | null)
      }) as typeof xhr.send

      return xhr
    } as unknown as typeof XMLHttpRequest

    Object.setPrototypeOf(PatchedXHR, originalXHR)
    PatchedXHR.prototype = originalXHR.prototype

    window.XMLHttpRequest = PatchedXHR
    this.isIntercepting = true
  }

  stop() {
    if (!this.isIntercepting) return
    window.XMLHttpRequest = this.originalXHR
    this.isIntercepting = false
  }
}

function patchResponseAccess(
  xhr: XMLHttpRequest,
  info: RequestContext,
  interceptors: XhrResponseInterceptor[]
) {
  const textDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText')!
  const responseDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response')!
  const statusDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'status')!

  let computed = false
  let cachedOverride: ResponseOverride | undefined

  const getOverride = (): ResponseOverride | undefined => {
    if (computed) return cachedOverride
    if (xhr.readyState < 4) return undefined
    computed = true

    let raw: string | null = null
    try {
      raw = textDescriptor.get!.call(xhr)
    } catch {
      try {
        raw = JSON.stringify(responseDescriptor.get!.call(xhr))
      } catch {
        return undefined
      }
    }
    if (raw === null) return undefined

    const responseInfo: ResponseContext = {
      url: xhr.responseURL || info.url,
      status: xhr.status,
      statusText: xhr.statusText,
      headers: parseRawHeaders(xhr.getAllResponseHeaders()),
      ok: xhr.status >= 200 && xhr.status < 300,
      duration: Date.now() - info.timestamp,
      request: info,
    }

    for (const interceptor of interceptors) {
      try {
        const result = interceptor(responseInfo, raw)
        if (result) cachedOverride = { ...cachedOverride, ...result }
      } catch (error) {
        console.error('[rewrite] XHR 响应拦截器执行失败:', error)
      }
    }
    if (cachedOverride?.headers) {
      console.warn('[rewrite] XHR 不支持修改响应头，已忽略:', cachedOverride.headers)
    }

    return cachedOverride
  }

  Object.defineProperty(xhr, 'responseText', {
    get() {
      const override = getOverride()
      return override?.body ?? textDescriptor.get!.call(xhr)
    },
    configurable: true,
  })

  Object.defineProperty(xhr, 'response', {
    get() {
      const override = getOverride()
      if (override?.body !== undefined) {
        const type = xhr.responseType
        if (type === '' || type === 'text') return override.body
        if (type === 'json') {
          try {
            return JSON.parse(override.body)
          } catch {
            // JSON 解析失败时回退原始值
          }
        }
      }
      return responseDescriptor.get!.call(xhr)
    },
    configurable: true,
  })

  Object.defineProperty(xhr, 'status', {
    get() {
      const override = getOverride()
      return override?.status ?? statusDescriptor.get!.call(xhr)
    },
    configurable: true,
  })
}
