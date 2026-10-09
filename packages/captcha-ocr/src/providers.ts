import { GM_getValue } from '$'
import { gmGetJson } from './gm'

const OCR_PROMPT =
  '请识别这张验证码图片中的所有字符，只输出识别到的文字内容，不要添加任何解释、标点符号或多余字符。'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export interface VisionRequest {
  url: string
  headers: Record<string, string>
  data: string
}

export interface OcrProvider {
  id: string
  label: string
  models: string[]
  defaultModel: string
  buildRequest(apiKey: string, model: string, imageUrl: string): VisionRequest
  extractText(responseText: string): string | null
  listModels(apiKey: string): Promise<string[]>
}

function parseDataUrl(url: string): { mimeType: string; base64: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(url)
  return match ? { mimeType: match[1], base64: match[2] } : null
}

function requireDataUrl(imageUrl: string): { mimeType: string; base64: string } {
  const parts = parseDataUrl(imageUrl)
  if (!parts) throw new Error('该平台仅支持 base64 图片，获取验证码图片失败')
  return parts
}

interface OpenAiCompatibleOptions {
  id: string
  label: string
  getBaseURL: () => string
  models: string[]
  defaultModel: string
}

function openaiCompatible(opts: OpenAiCompatibleOptions): OcrProvider {
  return {
    id: opts.id,
    label: opts.label,
    models: opts.models,
    defaultModel: opts.defaultModel,
    buildRequest(apiKey, model, imageUrl) {
      const baseURL = opts.getBaseURL()
      if (!baseURL) throw new Error('请先在设置中填写 API 地址')
      return {
        url: `${baseURL}/chat/completions`,
        headers: { Authorization: `Bearer ${apiKey}`, ...JSON_HEADERS },
        data: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: OCR_PROMPT }
              ]
            }
          ]
        })
      }
    },
    extractText(responseText) {
      const body = JSON.parse(responseText)
      const text = body.choices?.[0]?.message?.content
      return typeof text === 'string' ? text.trim() || null : null
    },
    async listModels(apiKey) {
      const baseURL = opts.getBaseURL()
      if (!baseURL) throw new Error('请先填写 API 地址')
      const body = await gmGetJson<{ data?: Array<{ id?: string }> }>(`${baseURL}/models`, {
        Authorization: `Bearer ${apiKey}`
      })
      return (body.data || []).map(item => item.id).filter((id): id is string => Boolean(id))
    }
  }
}

const claudeProvider: OcrProvider = {
  id: 'claude',
  label: 'Anthropic Claude',
  models: ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-5-sonnet-latest'],
  defaultModel: 'claude-sonnet-4-5',
  buildRequest(apiKey, model, imageUrl) {
    const { mimeType, base64 } = requireDataUrl(imageUrl)
    return {
      url: 'https://api.anthropic.com/v1/messages',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', ...JSON_HEADERS },
      data: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
              { type: 'text', text: OCR_PROMPT }
            ]
          }
        ]
      })
    }
  },
  extractText(responseText) {
    const body = JSON.parse(responseText)
    const block = body.content?.find((item: { type?: string }) => item.type === 'text')
    return typeof block?.text === 'string' ? block.text.trim() || null : null
  },
  async listModels(apiKey) {
    const body = await gmGetJson<{ data?: Array<{ id?: string }> }>(
      'https://api.anthropic.com/v1/models',
      { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
    )
    return (body.data || []).map(item => item.id).filter((id): id is string => Boolean(id))
  }
}

const geminiProvider: OcrProvider = {
  id: 'gemini',
  label: 'Google Gemini',
  models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
  defaultModel: 'gemini-2.0-flash',
  buildRequest(apiKey, model, imageUrl) {
    const { mimeType, base64 } = requireDataUrl(imageUrl)
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      headers: { 'x-goog-api-key': apiKey, ...JSON_HEADERS },
      data: JSON.stringify({
        contents: [
          {
            parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: OCR_PROMPT }]
          }
        ]
      })
    }
  },
  extractText(responseText) {
    const body = JSON.parse(responseText)
    const parts = body.candidates?.[0]?.content?.parts || []
    const text = parts.map((part: { text?: string }) => part.text || '').join('')
    return text.trim() || null
  },
  async listModels(apiKey) {
    const body = await gmGetJson<{ models?: Array<{ name?: string }> }>(
      'https://generativelanguage.googleapis.com/v1beta/models',
      { 'x-goog-api-key': apiKey }
    )
    return (body.models || [])
      .map(item => (item.name || '').replace(/^models\//, ''))
      .filter(Boolean)
  }
}

export const PROVIDERS: OcrProvider[] = [
  openaiCompatible({
    id: 'zhipu',
    label: '智谱 AI（免费）',
    getBaseURL: () => 'https://open.bigmodel.cn/api/paas/v4',
    models: ['glm-4v-flash', 'glm-4.6v', 'glm-4.5v', 'glm-4v-plus'],
    defaultModel: 'glm-4v-flash'
  }),
  openaiCompatible({
    id: 'deepseek',
    label: 'DeepSeek',
    getBaseURL: () => 'https://api.deepseek.com',
    models: ['deepseek-v4-flash-vision-exp'],
    defaultModel: 'deepseek-v4-flash-vision-exp'
  }),
  openaiCompatible({
    id: 'moonshot',
    label: 'Kimi (Moonshot)',
    getBaseURL: () => 'https://api.moonshot.cn/v1',
    models: ['kimi-latest', 'moonshot-v1-8k-vision-preview'],
    defaultModel: 'kimi-latest'
  }),
  openaiCompatible({
    id: 'qwen',
    label: '通义千问',
    getBaseURL: () => 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-vl-plus', 'qwen-vl-max', 'qwen3-vl-plus'],
    defaultModel: 'qwen-vl-plus'
  }),
  openaiCompatible({
    id: 'doubao',
    label: '豆包 (火山方舟)',
    getBaseURL: () => 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-seed-1.6-vision-250815', 'doubao-1.5-vision-pro-32k'],
    defaultModel: 'doubao-seed-1.6-vision-250815'
  }),
  openaiCompatible({
    id: 'siliconflow',
    label: 'SiliconFlow 硅基流动',
    getBaseURL: () => 'https://api.siliconflow.cn/v1',
    models: ['Qwen/Qwen2.5-VL-32B-Instruct', 'Qwen/Qwen3-VL-8B-Instruct'],
    defaultModel: 'Qwen/Qwen2.5-VL-32B-Instruct'
  }),
  openaiCompatible({
    id: 'openai',
    label: 'OpenAI',
    getBaseURL: () => 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
    defaultModel: 'gpt-4o-mini'
  }),
  claudeProvider,
  geminiProvider,
  openaiCompatible({
    id: 'grok',
    label: 'xAI Grok',
    getBaseURL: () => 'https://api.x.ai/v1',
    models: ['grok-2-vision-1212', 'grok-4'],
    defaultModel: 'grok-2-vision-1212'
  }),
  openaiCompatible({
    id: 'mistral',
    label: 'Mistral',
    getBaseURL: () => 'https://api.mistral.ai/v1',
    models: ['pixtral-12b-2409', 'mistral-small-latest'],
    defaultModel: 'pixtral-12b-2409'
  }),
  openaiCompatible({
    id: 'openrouter',
    label: 'OpenRouter（聚合）',
    getBaseURL: () => 'https://openrouter.ai/api/v1',
    models: [
      'google/gemini-2.0-flash-exp:free',
      'qwen/qwen2.5-vl-72b-instruct:free',
      'meta-llama/llama-3.2-11b-vision-instruct:free'
    ],
    defaultModel: 'google/gemini-2.0-flash-exp:free'
  }),
  openaiCompatible({
    id: 'custom',
    label: '自定义（OpenAI 兼容）',
    getBaseURL: () => GM_getValue<string>('customBaseURL', '').replace(/\/+$/, ''),
    models: [],
    defaultModel: ''
  })
]

export function getProvider(id: string): OcrProvider | undefined {
  return PROVIDERS.find(provider => provider.id === id)
}
