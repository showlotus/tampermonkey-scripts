import type { RequestContext, RequestOverride, ResponseContext, ResponseOverride } from '../types'
import { normalizeHeaders, responseHeadersToObject } from './headers'

export type FetchRequestInterceptor = (
  info: RequestContext
) => RequestOverride | void | Promise<RequestOverride | void>

export type FetchResponseInterceptor = (
  info: ResponseContext,
  body: string
) => ResponseOverride | void | Promise<ResponseOverride | void>

export class FetchInterceptor {
  private originalFetch: typeof window.fetch
  private requestInterceptors: FetchRequestInterceptor[] = []
  private responseInterceptors: FetchResponseInterceptor[] = []
  private isIntercepting = false

  constructor() {
    this.originalFetch = window.fetch
  }

  addRequestInterceptor(interceptor: FetchRequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: FetchResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  start() {
    if (this.isIntercepting) return

    const originalFetch = this.originalFetch
    const requestInterceptors = this.requestInterceptors
    const responseInterceptors = this.responseInterceptors

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const isRequest = input instanceof Request
      const info: RequestContext = {
        url: typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
        method: (init?.method ?? (isRequest ? input.method : 'GET')).toUpperCase(),
        headers: normalizeHeaders(isRequest ? input.headers : init?.headers),
        body: init?.body ?? (isRequest ? input.body : undefined),
        timestamp: Date.now(),
      }

      let modified: RequestOverride | undefined
      for (const interceptor of requestInterceptors) {
        try {
          const result = await interceptor(info)
          if (result) modified = { ...modified, ...result }
        } catch (error) {
          console.error('[rewrite] fetch 请求拦截器执行失败:', error)
        }
      }

      const shouldRebuild = Boolean(modified || init || isRequest)
      const finalInit: RequestInit = {
        ...init,
        method: modified?.method ?? init?.method ?? (isRequest ? input.method : info.method),
        headers: modified?.headers
          ? new Headers(modified.headers)
          : (init?.headers ?? (isRequest ? input.headers : undefined)),
        body: (modified?.body as BodyInit | null | undefined) ??
          init?.body ??
          (isRequest && !init ? input.body : undefined),
      }

      const startTime = performance.now()
      const response = await (shouldRebuild
        ? originalFetch.call(window, modified?.url ?? info.url, finalInit)
        : originalFetch.call(window, input))
      const duration = Math.round(performance.now() - startTime)

      if (responseInterceptors.length === 0) return response

      let body = ''
      try {
        body = await response.clone().text()
      } catch {
        // 流式或已消费的响应体读不出来，跳过响应改写
      }

      const responseInfo: ResponseContext = {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeadersToObject(response.headers),
        ok: response.ok,
        duration,
        request: info,
      }

      let override: ResponseOverride | undefined
      for (const interceptor of responseInterceptors) {
        try {
          const result = await interceptor(responseInfo, body)
          if (result) override = { ...override, ...result }
        } catch (error) {
          console.error('[rewrite] fetch 响应拦截器执行失败:', error)
        }
      }
      if (!override) return response

      const headers = new Headers(response.headers)
      if (override.headers) {
        for (const [key, value] of Object.entries(override.headers)) headers.set(key, value)
      }

      return new Response(override.body ?? body, {
        status: override.status ?? response.status,
        statusText: response.statusText,
        headers,
      })
    }

    this.isIntercepting = true
  }

  stop() {
    if (!this.isIntercepting) return
    window.fetch = this.originalFetch
    this.isIntercepting = false
  }
}
