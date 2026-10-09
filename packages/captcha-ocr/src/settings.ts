import { GM_getValue, GM_setValue } from '$'
import { getProvider, PROVIDERS } from './providers'
import { showToast } from './ui'

const VISION_MODEL_RE =
  /(vision|vl|-v\d|^gpt-4o|omni|gemini|pixtral|ocr|glm-.+v|internvl|minicpm|moondream|llama-\d|doubao)/i

export function getProviderId(): string {
  const id = GM_getValue<string>('provider', 'zhipu')
  return getProvider(id) ? id : 'zhipu'
}

export function getApiKey(providerId: string): string {
  return GM_getValue<string>(`apiKey:${providerId}`, '')
}

export function getModel(providerId: string): string {
  return (
    GM_getValue<string>(`model:${providerId}`, '') || getProvider(providerId)?.defaultModel || ''
  )
}

export function getAutoCopy(): boolean {
  return GM_getValue<boolean>('autoCopy', false)
}

export function getAutoSubmit(): boolean {
  return GM_getValue<boolean>('autoSubmit', true)
}

export function toggleAutoCopy() {
  GM_setValue('autoCopy', !getAutoCopy())
  showToast(getAutoCopy() ? '自动复制已开启' : '自动复制已关闭', 'info')
}

export function toggleAutoSubmit() {
  GM_setValue('autoSubmit', !getAutoSubmit())
  showToast(getAutoSubmit() ? '自动提交已开启' : '自动提交已关闭', 'info')
}

function getCachedModels(providerId: string): string[] {
  return GM_getValue<string[]>(`models:${providerId}`, [])
}

export function showSettingsDialog() {
  if (document.getElementById('cap-rec-dialog-mask')) return

  const mask = document.createElement('div')
  mask.id = 'cap-rec-dialog-mask'
  mask.className = 'cap-rec-mask'

  const card = document.createElement('div')
  card.id = 'cap-rec-dialog'
  card.className = 'cap-rec-card'
  card.innerHTML = `
    <div class="cap-rec-card-title">🔑 AI 模型设置</div>

    <div class="cap-rec-field">
      <span class="cap-rec-field-label">AI 平台</span>
      <select id="cap-rec-provider"></select>
    </div>

    <div class="cap-rec-field" id="cap-rec-baseurl-field" hidden>
      <span class="cap-rec-field-label">API 地址（OpenAI 兼容，如 https://example.com/v1）</span>
      <input id="cap-rec-baseurl" type="text" placeholder="https://example.com/v1" />
    </div>

    <div class="cap-rec-field">
      <span class="cap-rec-field-label">模型（可手动输入）</span>
      <span class="cap-rec-model-row">
        <input id="cap-rec-model" list="cap-rec-model-list" />
        <button id="cap-rec-fetch-models" type="button" title="从平台获取模型列表">🔄</button>
      </span>
      <datalist id="cap-rec-model-list"></datalist>
      <label class="cap-rec-check">
        <input id="cap-rec-show-all" type="checkbox" />
        显示全部模型（不过滤视觉模型）
      </label>
    </div>

    <div class="cap-rec-field">
      <span class="cap-rec-field-label" id="cap-rec-key-label">API Key</span>
      <input id="cap-rec-key" type="password" placeholder="输入 API Key" />
    </div>

    <label class="cap-rec-check">
      <input id="cap-rec-autocopy" type="checkbox" />
      识别成功后自动复制到剪贴板
    </label>
    <label class="cap-rec-check">
      <input id="cap-rec-autosubmit" type="checkbox" />
      识别填充后自动点击提交（需站点配置 submitSelector）
    </label>

    <div class="cap-rec-actions">
      <button id="cap-rec-cancel" type="button">取消</button>
      <button id="cap-rec-save" type="button">保存</button>
    </div>
  `
  mask.appendChild(card)
  document.body.appendChild(mask)

  const providerSelect = card.querySelector<HTMLSelectElement>('#cap-rec-provider')!
  const baseurlField = card.querySelector<HTMLElement>('#cap-rec-baseurl-field')!
  const baseurlInput = card.querySelector<HTMLInputElement>('#cap-rec-baseurl')!
  const modelInput = card.querySelector<HTMLInputElement>('#cap-rec-model')!
  const modelList = card.querySelector<HTMLDataListElement>('#cap-rec-model-list')!
  const fetchBtn = card.querySelector<HTMLButtonElement>('#cap-rec-fetch-models')!
  const showAllInput = card.querySelector<HTMLInputElement>('#cap-rec-show-all')!
  const keyLabel = card.querySelector<HTMLElement>('#cap-rec-key-label')!
  const keyInput = card.querySelector<HTMLInputElement>('#cap-rec-key')!
  const autocopyInput = card.querySelector<HTMLInputElement>('#cap-rec-autocopy')!
  const autosubmitInput = card.querySelector<HTMLInputElement>('#cap-rec-autosubmit')!

  for (const provider of PROVIDERS) {
    const option = document.createElement('option')
    option.value = provider.id
    option.textContent = provider.label
    providerSelect.appendChild(option)
  }

  const rebuildModelList = () => {
    const provider = getProvider(providerSelect.value)
    if (!provider) return
    const all = [...new Set([...provider.models, ...getCachedModels(provider.id)])]
    const filtered = showAllInput.checked ? all : all.filter(id => VISION_MODEL_RE.test(id))
    if (modelInput.value && !filtered.includes(modelInput.value)) filtered.unshift(modelInput.value)
    modelList.replaceChildren(
      ...filtered.map(id => {
        const option = document.createElement('option')
        option.value = id
        return option
      })
    )
  }

  const refreshProviderFields = () => {
    const provider = getProvider(providerSelect.value)
    if (!provider) return
    const providerId = provider.id
    baseurlField.hidden = providerId !== 'custom'
    if (providerId === 'custom') baseurlInput.value = GM_getValue<string>('customBaseURL', '')
    modelInput.value = getModel(providerId)
    keyLabel.textContent = `API Key（${provider.label}）`
    keyInput.value = getApiKey(providerId)
    rebuildModelList()
  }

  providerSelect.addEventListener('change', refreshProviderFields)
  showAllInput.addEventListener('change', rebuildModelList)

  fetchBtn.addEventListener('click', async () => {
    const provider = getProvider(providerSelect.value)
    if (!provider) return
    fetchBtn.disabled = true
    fetchBtn.textContent = '⏳'
    try {
      const models = await provider.listModels(keyInput.value.trim())
      if (!models.length) throw new Error('未获取到模型')
      GM_setValue(`models:${provider.id}`, [...new Set(models)])
      rebuildModelList()
      showToast(`获取到 ${models.length} 个模型`, 'success')
    } catch (err) {
      showToast(`获取模型列表失败: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      fetchBtn.disabled = false
      fetchBtn.textContent = '🔄'
    }
  })

  const save = () => {
    const providerId = providerSelect.value
    GM_setValue('provider', providerId)
    GM_setValue('customBaseURL', baseurlInput.value.trim())
    GM_setValue(`model:${providerId}`, modelInput.value.trim())
    GM_setValue(`apiKey:${providerId}`, keyInput.value.trim())
    GM_setValue('autoCopy', autocopyInput.checked)
    GM_setValue('autoSubmit', autosubmitInput.checked)
    showToast('✅ 设置已保存', 'success')
    setTimeout(() => mask.remove(), 800)
  }

  keyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') save()
  })
  card.querySelector('#cap-rec-cancel')!.addEventListener('click', () => mask.remove())
  card.querySelector('#cap-rec-save')!.addEventListener('click', save)
  mask.addEventListener('click', e => {
    if (e.target === mask) mask.remove()
  })

  providerSelect.value = getProviderId()
  autocopyInput.checked = getAutoCopy()
  autosubmitInput.checked = getAutoSubmit()
  refreshProviderFields()
}
