export interface RequestContext {
  url: string
  method: string
  headers: Record<string, string>
  body?: unknown
  timestamp: number
}

export type RequestOverride = Partial<Pick<RequestContext, 'url' | 'method' | 'headers' | 'body'>>

export interface ResponseContext {
  url: string
  status: number
  statusText: string
  headers: Record<string, string>
  ok: boolean
  duration: number
  request: RequestContext
}

export interface ResponseOverride {
  status?: number
  headers?: Record<string, string>
  body?: string
}

export interface Rule {
  name: string
  enabled: boolean
  match: RegExp
  request?: {
    url?: string
    headers?: Record<string, string>
  }
  response?: {
    status?: number
    headers?: Record<string, string>
    replace?: { from: string | RegExp; to: string }
  }
}
