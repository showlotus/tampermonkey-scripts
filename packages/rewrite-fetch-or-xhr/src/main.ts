import { rules } from './config'
import type { RequestContext, RequestOverride, ResponseContext, ResponseOverride } from './types'
import { FetchInterceptor } from './interceptors/fetch'
import { XhrInterceptor } from './interceptors/xhr'

const enabledRules = rules.filter((rule) => rule.enabled)

function rewriteRequest(info: RequestContext): RequestOverride | undefined {
  let url: string | undefined
  let headers: Record<string, string> | undefined

  for (const rule of enabledRules) {
    if (!rule.request || !rule.match.test(info.url)) continue
    console.log(`[rewrite] 请求命中「${rule.name}」: ${url ?? info.url}`)
    if (rule.request.url) url = rule.request.url
    headers = { ...(headers ?? info.headers), ...rule.request.headers }
  }

  if (url === undefined && headers === undefined) return undefined
  return { ...(url !== undefined && { url }), ...(headers !== undefined && { headers }) }
}

function rewriteResponse(info: ResponseContext, body: string): ResponseOverride | undefined {
  let text = body
  let status: number | undefined
  let headers: Record<string, string> | undefined
  let hit = false

  for (const rule of enabledRules) {
    if (!rule.response || !rule.match.test(info.url)) continue
    console.log(`[rewrite] 响应命中「${rule.name}」: ${info.url}`)
    hit = true
    if (rule.response.replace) text = text.replace(rule.response.replace.from, rule.response.replace.to)
    if (rule.response.status !== undefined) status = rule.response.status
    headers = { ...headers, ...rule.response.headers }
  }

  if (!hit) return undefined
  return {
    ...(text !== body && { body: text }),
    ...(status !== undefined && { status }),
    ...(headers !== undefined && { headers }),
  }
}

if (enabledRules.length === 0) {
  console.log('[rewrite] 没有启用的规则，跳过 fetch/XHR 拦截')
} else {
  const fetchInterceptor = new FetchInterceptor()
  const xhrInterceptor = new XhrInterceptor()

  fetchInterceptor.addRequestInterceptor(rewriteRequest)
  fetchInterceptor.addResponseInterceptor(rewriteResponse)
  xhrInterceptor.addRequestInterceptor(rewriteRequest)
  xhrInterceptor.addResponseInterceptor(rewriteResponse)

  fetchInterceptor.start()
  xhrInterceptor.start()

  console.log(`[rewrite] fetch/XHR 拦截已启动，启用规则 ${enabledRules.length} 条`)
}
