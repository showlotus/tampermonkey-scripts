import { GM_getValue, GM_setValue } from '$'
import { getSiteConfigs, saveSiteConfigs } from './config'
import { getProvider, PROVIDERS } from './providers'
import { ICONS, showToast } from './ui'

const VISION_MODEL_RE =
  /(vision|vl|-v\d|^gpt-4o|omni|gemini|pixtral|ocr|glm-.+v|internvl|minicpm|moondream|llama-\d|doubao)/i

const CHEVRON_SVG = `<svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="rgba(242,243,247,0.6)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l4 4 4-4"/></svg>`

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

function getCachedModels(providerId: string): string[] {
  return GM_getValue<string[]>(`models:${providerId}`, [])
}

interface ListboxOption {
  value: string
  label: string
  active?: boolean
}

let listboxAnchor: HTMLElement | null = null

function closeListbox() {
  document.getElementById('cap-rec-listbox')?.remove()
  listboxAnchor = null
}

function openListbox(
  anchor: HTMLElement,
  options: ListboxOption[],
  onSelect: (value: string) => void
) {
  closeListbox()
  listboxAnchor = anchor

  const list = document.createElement('div')
  list.id = 'cap-rec-listbox'
  list.className = 'cap-rec-listbox'

  const rect = anchor.getBoundingClientRect()
  list.style.top = `${Math.round(rect.bottom + 6)}px`
  list.style.left = `${Math.round(rect.left)}px`
  list.style.width = `${Math.round(rect.width)}px`
  list.style.maxHeight = `${Math.round(Math.max(120, window.innerHeight - rect.bottom - 24))}px`

  const items = options.map(option => {
    const item = document.createElement('div')
    item.className = option.active ? 'cap-rec-listbox-item active' : 'cap-rec-listbox-item'
    item.textContent = option.label
    item.title = option.label
    item.addEventListener('mousedown', e => e.preventDefault())
    item.addEventListener('click', () => {
      onSelect(option.value)
      closeListbox()
    })
    return item
  })

  if (items.length) {
    list.replaceChildren(...items)
  } else {
    const empty = document.createElement('div')
    empty.className = 'cap-rec-listbox-empty'
    empty.textContent = '无匹配项'
    list.replaceChildren(empty)
  }
  document.body.appendChild(list)
}

function toggleListbox(
  anchor: HTMLElement,
  options: ListboxOption[],
  onSelect: (value: string) => void
) {
  if (listboxAnchor === anchor) {
    closeListbox()
    return
  }
  openListbox(anchor, options, onSelect)
}

document.addEventListener(
  'mousedown',
  e => {
    const list = document.getElementById('cap-rec-listbox')
    if (!list) return
    const target = e.target as Node
    if (list.contains(target) || listboxAnchor?.contains(target)) return
    closeListbox()
  },
  true
)

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeListbox()
})

document.addEventListener(
  'scroll',
  e => {
    if (!document.getElementById('cap-rec-listbox')) return
    if (e.target instanceof Element && e.target.id === 'cap-rec-listbox') return
    closeListbox()
  },
  true
)

export function showSettingsDialog() {
  if (document.getElementById('cap-rec-dialog-mask')) return

  const mask = document.createElement('div')
  mask.id = 'cap-rec-dialog-mask'
  mask.className = 'cap-rec-mask'

  const dialog = document.createElement('div')
  dialog.id = 'cap-rec-dialog'
  dialog.className = 'cap-rec-dialog'
  dialog.innerHTML = `
    <div class="cap-rec-header">
      <span class="cap-rec-header-title">设置</span>
      <button id="cap-rec-close" type="button" class="cap-rec-close" aria-label="关闭">✕</button>
    </div>

    <div class="cap-rec-dialog-body">
      <div class="cap-rec-group">
        <div class="cap-rec-group-label">AI 模型</div>
        <div class="cap-rec-cell">
          <button id="cap-rec-provider" type="button" class="cap-rec-select"></button>
        </div>
        <div class="cap-rec-cell" id="cap-rec-baseurl-field" hidden>
          <label class="cap-rec-field">
            <span class="cap-rec-mini-label">API 地址（OpenAI 兼容）</span>
            <input id="cap-rec-baseurl" type="text" placeholder="https://example.com/v1" />
          </label>
        </div>
        <div class="cap-rec-cell">
          <div class="cap-rec-input-row">
            <div class="cap-rec-combo">
              <input id="cap-rec-model" type="text" placeholder="模型名称，可输入筛选" autocomplete="off" />
              <span class="cap-rec-combo-arrow">${CHEVRON_SVG}</span>
            </div>
            <button id="cap-rec-fetch-models" type="button" class="cap-rec-fetch" title="从平台获取模型列表">${ICONS.refresh}</button>
          </div>
        </div>
        <div class="cap-rec-cell">
          <div class="cap-rec-input-row">
            <input id="cap-rec-key" type="password" placeholder="API Key" autocomplete="off" />
            <button id="cap-rec-key-toggle" type="button" class="cap-rec-key-toggle" title="显示 / 隐藏 API Key">${ICONS.eye}</button>
          </div>
        </div>
        <label class="cap-rec-switch-cell">
          <span>显示全部模型<span class="cap-rec-switch-hint">不过滤视觉模型</span></span>
          <input id="cap-rec-show-all" type="checkbox" class="cap-rec-switch" />
        </label>
      </div>

      <div class="cap-rec-group">
        <div class="cap-rec-group-label">操作</div>
        <label class="cap-rec-switch-cell">
          <span>识别成功后自动复制</span>
          <input id="cap-rec-autocopy" type="checkbox" class="cap-rec-switch" />
        </label>
        <label class="cap-rec-switch-cell">
          <span>识别填充后自动提交</span>
          <input id="cap-rec-autosubmit" type="checkbox" class="cap-rec-switch" />
        </label>
      </div>

      <div class="cap-rec-group">
        <div class="cap-rec-group-label">站点配置</div>
        <div id="cap-rec-site-list" class="cap-rec-site-list"></div>
        <div class="cap-rec-site-grid">
          <label class="cap-rec-field">
            <span class="cap-rec-mini-label">域名 *</span>
            <input id="cap-rec-site-host" type="text" placeholder="example.com" />
          </label>
          <label class="cap-rec-field">
            <span class="cap-rec-mini-label">验证码选择器 *</span>
            <input id="cap-rec-site-captcha" type="text" placeholder="img.code-img" />
          </label>
          <label class="cap-rec-field">
            <span class="cap-rec-mini-label">输入框选择器</span>
            <input id="cap-rec-site-input" type="text" placeholder="input.code-input" />
          </label>
          <label class="cap-rec-field">
            <span class="cap-rec-mini-label">提交按钮选择器</span>
            <input id="cap-rec-site-submit" type="text" placeholder="button.submit" />
          </label>
        </div>
        <button id="cap-rec-site-add" type="button" class="cap-rec-site-add">添加站点</button>
      </div>
    </div>

    <div class="cap-rec-footer">
      <button id="cap-rec-cancel" type="button" class="cap-rec-btn-ghost">取消</button>
      <button id="cap-rec-save" type="button" class="cap-rec-btn-primary">保存</button>
    </div>
  `
  mask.appendChild(dialog)
  document.body.appendChild(mask)

  const closeDialog = () => {
    closeListbox()
    mask.remove()
  }

  const providerBtn = dialog.querySelector<HTMLButtonElement>('#cap-rec-provider')!
  const baseurlField = dialog.querySelector<HTMLElement>('#cap-rec-baseurl-field')!
  const baseurlInput = dialog.querySelector<HTMLInputElement>('#cap-rec-baseurl')!
  const modelInput = dialog.querySelector<HTMLInputElement>('#cap-rec-model')!
  const fetchBtn = dialog.querySelector<HTMLButtonElement>('#cap-rec-fetch-models')!
  const showAllInput = dialog.querySelector<HTMLInputElement>('#cap-rec-show-all')!
  const keyInput = dialog.querySelector<HTMLInputElement>('#cap-rec-key')!
  const keyToggleBtn = dialog.querySelector<HTMLButtonElement>('#cap-rec-key-toggle')!
  const autocopyInput = dialog.querySelector<HTMLInputElement>('#cap-rec-autocopy')!
  const autosubmitInput = dialog.querySelector<HTMLInputElement>('#cap-rec-autosubmit')!
  const siteList = dialog.querySelector<HTMLElement>('#cap-rec-site-list')!
  const siteHostInput = dialog.querySelector<HTMLInputElement>('#cap-rec-site-host')!
  const siteCaptchaInput = dialog.querySelector<HTMLInputElement>('#cap-rec-site-captcha')!
  const siteInputInput = dialog.querySelector<HTMLInputElement>('#cap-rec-site-input')!
  const siteSubmitInput = dialog.querySelector<HTMLInputElement>('#cap-rec-site-submit')!

  let currentProviderId = getProviderId()
  let modelOptions: string[] = []

  const renderProviderButton = () => {
    const provider = getProvider(currentProviderId)
    const text = document.createElement('span')
    text.className = 'cap-rec-select-text'
    text.textContent = provider?.label || currentProviderId
    const arrow = document.createElement('span')
    arrow.className = 'cap-rec-select-arrow'
    arrow.innerHTML = CHEVRON_SVG
    providerBtn.replaceChildren(text, arrow)
  }

  const rebuildModelOptions = () => {
    const provider = getProvider(currentProviderId)
    if (!provider) return
    const all = [...new Set([...provider.models, ...getCachedModels(provider.id)])]
    modelOptions = showAllInput.checked ? all : all.filter(id => VISION_MODEL_RE.test(id))
  }

  const openModelListbox = () => {
    const query = modelInput.value.trim().toLowerCase()
    const current = modelInput.value.trim()
    const filtered = query
      ? modelOptions.filter(id => id.toLowerCase().includes(query))
      : modelOptions
    openListbox(
      modelInput,
      filtered.map(id => ({ value: id, label: id, active: id === current })),
      value => {
        modelInput.value = value
      }
    )
  }

  const refreshProviderFields = () => {
    const provider = getProvider(currentProviderId)
    if (!provider) return
    baseurlField.hidden = provider.id !== 'custom'
    if (provider.id === 'custom') baseurlInput.value = GM_getValue<string>('customBaseURL', '')
    modelInput.value = getModel(provider.id)
    keyInput.placeholder = `API Key（${provider.label}）`
    keyInput.value = getApiKey(provider.id)
    rebuildModelOptions()
    closeListbox()
  }

  providerBtn.addEventListener('click', () => {
    toggleListbox(
      providerBtn,
      PROVIDERS.map(p => ({ value: p.id, label: p.label, active: p.id === currentProviderId })),
      value => {
        if (value === currentProviderId) return
        currentProviderId = value
        renderProviderButton()
        refreshProviderFields()
      }
    )
  })

  modelInput.addEventListener('focus', openModelListbox)
  modelInput.addEventListener('input', openModelListbox)
  modelInput.addEventListener('click', openModelListbox)

  showAllInput.addEventListener('change', () => {
    rebuildModelOptions()
    if (listboxAnchor === modelInput) openModelListbox()
  })

  fetchBtn.addEventListener('click', async () => {
    const provider = getProvider(currentProviderId)
    if (!provider) return
    fetchBtn.disabled = true
    fetchBtn.innerHTML = ICONS.spinner
    try {
      const models = await provider.listModels(keyInput.value.trim())
      if (!models.length) throw new Error('未获取到模型')
      GM_setValue(`models:${provider.id}`, [...new Set(models)])
      rebuildModelOptions()
      if (listboxAnchor === modelInput) openModelListbox()
      showToast(`获取到 ${models.length} 个模型`, 'success')
    } catch (err) {
      showToast(`获取模型列表失败: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      fetchBtn.disabled = false
      fetchBtn.innerHTML = ICONS.refresh
    }
  })

  const save = () => {
    GM_setValue('provider', currentProviderId)
    GM_setValue('customBaseURL', baseurlInput.value.trim())
    GM_setValue(`model:${currentProviderId}`, modelInput.value.trim())
    GM_setValue(`apiKey:${currentProviderId}`, keyInput.value.trim())
    GM_setValue('autoCopy', autocopyInput.checked)
    GM_setValue('autoSubmit', autosubmitInput.checked)
    showToast('设置已保存', 'success')
    setTimeout(() => closeDialog(), 800)
  }

  keyToggleBtn.addEventListener('click', () => {
    const visible = keyInput.type === 'text'
    keyInput.type = visible ? 'password' : 'text'
    keyToggleBtn.innerHTML = visible ? ICONS.eye : ICONS.eyeOff
    keyInput.focus()
  })

  keyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') save()
  })
  dialog.querySelector('#cap-rec-close')!.addEventListener('click', closeDialog)
  dialog.querySelector('#cap-rec-cancel')!.addEventListener('click', closeDialog)
  dialog.querySelector('#cap-rec-save')!.addEventListener('click', save)
  mask.addEventListener('click', e => {
    if (e.target === mask) closeDialog()
  })

  const renderSiteList = () => {
    const configs = getSiteConfigs()
    if (!configs.length) {
      const empty = document.createElement('div')
      empty.className = 'cap-rec-site-empty'
      empty.textContent = '暂无站点，在下方添加后刷新页面生效'
      siteList.replaceChildren(empty)
      return
    }
    siteList.replaceChildren(
      ...configs.map((config, index) => {
        const row = document.createElement('div')
        row.className = 'cap-rec-site-row'
        const info = document.createElement('span')
        info.className = 'cap-rec-site-info'
        info.textContent = `${config.match} · ${config.captchaSelector}`
        info.title = [
          `域名: ${config.match}`,
          `验证码: ${config.captchaSelector}`,
          config.inputSelector ? `输入框: ${config.inputSelector}` : null,
          config.submitSelector ? `提交: ${config.submitSelector}` : null
        ]
          .filter(Boolean)
          .join('\n')
        const del = document.createElement('button')
        del.type = 'button'
        del.className = 'cap-rec-site-del'
        del.textContent = '✕'
        del.addEventListener('click', () => {
          saveSiteConfigs(getSiteConfigs().filter((_, i) => i !== index))
          renderSiteList()
          showToast('已删除站点，刷新页面后生效', 'info')
        })
        row.append(info, del)
        return row
      })
    )
  }

  dialog.querySelector<HTMLButtonElement>('#cap-rec-site-add')!.addEventListener('click', () => {
    const match = siteHostInput.value.trim()
    const captchaSelector = siteCaptchaInput.value.trim()
    if (!match || !captchaSelector) {
      showToast('域名与验证码元素选择器为必填', 'error')
      return
    }
    if (getSiteConfigs().some(config => config.match === match)) {
      showToast('该域名已配置', 'error')
      return
    }
    saveSiteConfigs([
      ...getSiteConfigs(),
      {
        match,
        captchaSelector,
        inputSelector: siteInputInput.value.trim(),
        submitSelector: siteSubmitInput.value.trim() || undefined
      }
    ])
    siteHostInput.value = ''
    siteCaptchaInput.value = ''
    siteInputInput.value = ''
    siteSubmitInput.value = ''
    renderSiteList()
    showToast('站点已添加，刷新页面后生效', 'success')
  })

  autocopyInput.checked = getAutoCopy()
  autosubmitInput.checked = getAutoSubmit()
  renderSiteList()
  renderProviderButton()
  refreshProviderFields()
}
