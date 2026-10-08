export function normalizeHeaders(headers?: HeadersInit | null): Record<string, string> {
  const normalized: Record<string, string> = {}
  if (!headers) return normalized

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key.toLowerCase()] = value
    })
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      normalized[key.toLowerCase()] = value
    }
  } else {
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value
    }
  }

  return normalized
}

export function responseHeadersToObject(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {}
  headers.forEach((value, key) => {
    result[key.toLowerCase()] = value
  })
  return result
}

export function parseRawHeaders(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!raw) return result

  for (const line of raw.split('\r\n')) {
    const index = line.indexOf(':')
    if (index === -1) continue
    const key = line.slice(0, index).trim().toLowerCase()
    const value = line.slice(index + 1).trim()
    if (key) result[key] = value
  }

  return result
}
