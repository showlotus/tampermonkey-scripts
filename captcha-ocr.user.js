// ==UserScript==
// @name         CAPTCHA OCR (Zhipu AI)
// @namespace    captcha-ocr
// @version      1.0.0
// @author       xu.yao
// @description  自动识别验证码图片，支持多家 AI 视觉模型，自动填充与提交
// @license      MIT
// @icon         https://wap.lotsmall.cn/favicon.ico
// @homepage     https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/captcha-ocr
// @supportURL   https://github.com/showlotus/tampermonkey-scripts/issues
// @match        https://itestuser.sendinfo.com.cn/*
// @match        https://itestwap.sendinfo.com.cn/*
// @match        http://localhost/*
// @connect      open.bigmodel.cn
// @connect      api.deepseek.com
// @connect      api.moonshot.cn
// @connect      dashscope.aliyuncs.com
// @connect      ark.cn-beijing.volces.com
// @connect      api.siliconflow.cn
// @connect      api.openai.com
// @connect      api.anthropic.com
// @connect      generativelanguage.googleapis.com
// @connect      api.x.ai
// @connect      api.mistral.ai
// @connect      openrouter.ai
// @connect      *
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(r=>{if(typeof GM_addStyle=="function"){GM_addStyle(r);return}const t=document.createElement("style");t.textContent=r,document.head.append(t)})(" .cap-rec-wrap{position:relative!important;display:inline-flex!important;line-height:0!important;margin-right:38px!important;border-radius:2px!important}.cap-rec-wrap>img,.cap-rec-wrap>canvas{position:static!important;margin:0!important;display:block!important;border:2px solid #4a6cf7!important;border-radius:2px 0 0 2px!important;transition:border-color .2s ease!important}.cap-rec-wrap:has(.loading)>img,.cap-rec-wrap:has(.loading)>canvas{border-color:#f59e0b!important}.cap-rec-wrap:has(.success)>img,.cap-rec-wrap:has(.success)>canvas{border-color:#22c55e!important}.cap-rec-wrap:has(.error)>img,.cap-rec-wrap:has(.error)>canvas{border-color:#ef4444!important}.cap-rec-btn{position:absolute!important;right:-29px!important;top:0!important;width:30px!important;min-height:30px!important;background:#4a6cf7!important;border:none!important;border-radius:0 2px 2px 0!important;cursor:pointer!important;margin:0!important;padding:0!important;opacity:1!important;visibility:visible!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;box-sizing:border-box!important;pointer-events:auto!important;transition:background .2s ease!important;font-family:sans-serif!important}.cap-rec-btn .cap-rec-icon{display:block!important}.cap-rec-btn.loading{background:#f59e0b!important;pointer-events:none!important}.cap-rec-spinning{animation:cap-rec-spin .7s linear infinite!important}.cap-rec-btn.success{background:#22c55e!important}.cap-rec-btn.error{background:#ef4444!important}@keyframes cap-rec-spin{to{transform:rotate(360deg)}}.cap-rec-toast{position:fixed!important;top:16px!important;right:16px!important;left:auto!important;bottom:auto!important;z-index:2147483647!important;border-radius:6px!important;font-size:11px!important;font-weight:500!important;font-family:sans-serif!important;color:#fff!important;display:flex!important;align-items:center!important;gap:7px!important;transform:translate(0)!important;transition:transform .3s ease,opacity .3s ease!important;max-width:300px!important;word-break:break-all!important;margin:0!important;padding:8px 16px!important;border:none!important}.cap-rec-toast.success{background:#22c55e!important}.cap-rec-toast.error{background:#ef4444!important}.cap-rec-toast.info{background:#60a5fa!important}.cap-rec-mask{position:fixed;top:0;right:0;bottom:0;left:0;z-index:999999;background:#0006;display:flex;align-items:center;justify-content:center}.cap-rec-card{background:#2d3436;border-radius:12px;padding:24px;width:340px;color:#e6e9f2;font-family:sans-serif;font-size:14px;box-sizing:border-box}.cap-rec-card-title{font-size:16px;font-weight:600;margin-bottom:16px}.cap-rec-field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}.cap-rec-field-label{font-size:12px;color:#e6e9f299}.cap-rec-card input,.cap-rec-card select{width:100%;padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:#12131a;color:#e6e9f2;font-size:13px;outline:none;box-sizing:border-box}.cap-rec-model-row{display:flex;gap:8px}.cap-rec-model-row input{flex:1}.cap-rec-model-row button{padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#e6e9f2;cursor:pointer;font-size:13px}.cap-rec-model-row button:disabled{opacity:.6;cursor:wait}.cap-rec-check{display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer;font-size:13px}.cap-rec-card .cap-rec-field .cap-rec-check{margin-top:6px}.cap-rec-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.cap-rec-actions button{padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px}.cap-rec-actions #cap-rec-cancel{border:1px solid rgba(255,255,255,.15);background:transparent;color:#e6e9f2}.cap-rec-actions #cap-rec-save{border:none;background:#6c5ce7;color:#fff} ");

(function () {
  'use strict';

  var _GM_getValue = /* @__PURE__ */ (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_registerMenuCommand = /* @__PURE__ */ (() => typeof GM_registerMenuCommand != "undefined" ? GM_registerMenuCommand : void 0)();
  var _GM_setClipboard = /* @__PURE__ */ (() => typeof GM_setClipboard != "undefined" ? GM_setClipboard : void 0)();
  var _GM_setValue = /* @__PURE__ */ (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  const SITE_CONFIGS = [
    {
      match: "itestuser.sendinfo.com.cn",
      captchaSelector: "img.code-img",
      inputSelector: 'input[placeholder="请输入验证码"]'
    },
    {
      match: "itestwap.sendinfo.com.cn",
      captchaSelector: "div.tel-code.input-box > img",
      inputSelector: "div.tel-code.input-box > input"
    },
    {
      match: "localhost",
      captchaSelector: "div.tel-code.input-box > img",
      inputSelector: "div.tel-code.input-box > input"
    }
  ];
  function findSiteConfig(hostname) {
    return SITE_CONFIGS.find((config) => config.match === hostname) || null;
  }
  function gmRequest(props) {
    return new Promise((resolve, reject) => {
      _GM_xmlhttpRequest({
        ...props,
        onload: (res) => resolve(res),
        onerror: () => reject(new Error("网络请求失败")),
        ontimeout: () => reject(new Error("请求超时"))
      });
    });
  }
  function gmGetJson(url, headers) {
    return gmRequest({ method: "GET", url, headers }).then((res) => JSON.parse(res.responseText));
  }
  function fetchImageAsBase64(url) {
    return gmRequest({ method: "GET", url, responseType: "blob" }).then(
      (res) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(res.response);
      })
    );
  }
  const OCR_PROMPT = "请识别这张验证码图片中的所有字符，只输出识别到的文字内容，不要添加任何解释、标点符号或多余字符。";
  const JSON_HEADERS = { "Content-Type": "application/json" };
  function parseDataUrl(url) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(url);
    return match ? { mimeType: match[1], base64: match[2] } : null;
  }
  function requireDataUrl(imageUrl) {
    const parts = parseDataUrl(imageUrl);
    if (!parts) throw new Error("该平台仅支持 base64 图片，获取验证码图片失败");
    return parts;
  }
  function openaiCompatible(opts) {
    return {
      id: opts.id,
      label: opts.label,
      models: opts.models,
      defaultModel: opts.defaultModel,
      buildRequest(apiKey, model, imageUrl) {
        const baseURL = opts.getBaseURL();
        if (!baseURL) throw new Error("请先在设置中填写 API 地址");
        return {
          url: `${baseURL}/chat/completions`,
          headers: { Authorization: `Bearer ${apiKey}`, ...JSON_HEADERS },
          data: JSON.stringify({
            model,
            messages: [
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: imageUrl } },
                  { type: "text", text: OCR_PROMPT }
                ]
              }
            ]
          })
        };
      },
      extractText(responseText) {
        var _a, _b, _c;
        const body = JSON.parse(responseText);
        const text = (_c = (_b = (_a = body.choices) == null ? void 0 : _a[0]) == null ? void 0 : _b.message) == null ? void 0 : _c.content;
        return typeof text === "string" ? text.trim() || null : null;
      },
      async listModels(apiKey) {
        const baseURL = opts.getBaseURL();
        if (!baseURL) throw new Error("请先填写 API 地址");
        const body = await gmGetJson(`${baseURL}/models`, {
          Authorization: `Bearer ${apiKey}`
        });
        return (body.data || []).map((item) => item.id).filter((id) => Boolean(id));
      }
    };
  }
  const claudeProvider = {
    id: "claude",
    label: "Anthropic Claude",
    models: ["claude-sonnet-4-5", "claude-haiku-4-5", "claude-3-5-sonnet-latest"],
    defaultModel: "claude-sonnet-4-5",
    buildRequest(apiKey, model, imageUrl) {
      const { mimeType, base64 } = requireDataUrl(imageUrl);
      return {
        url: "https://api.anthropic.com/v1/messages",
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", ...JSON_HEADERS },
        data: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mimeType, data: base64 } },
                { type: "text", text: OCR_PROMPT }
              ]
            }
          ]
        })
      };
    },
    extractText(responseText) {
      var _a;
      const body = JSON.parse(responseText);
      const block = (_a = body.content) == null ? void 0 : _a.find((item) => item.type === "text");
      return typeof (block == null ? void 0 : block.text) === "string" ? block.text.trim() || null : null;
    },
    async listModels(apiKey) {
      const body = await gmGetJson(
        "https://api.anthropic.com/v1/models",
        { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
      );
      return (body.data || []).map((item) => item.id).filter((id) => Boolean(id));
    }
  };
  const geminiProvider = {
    id: "gemini",
    label: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.5-pro"],
    defaultModel: "gemini-2.0-flash",
    buildRequest(apiKey, model, imageUrl) {
      const { mimeType, base64 } = requireDataUrl(imageUrl);
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        headers: { "x-goog-api-key": apiKey, ...JSON_HEADERS },
        data: JSON.stringify({
          contents: [
            {
              parts: [{ inline_data: { mime_type: mimeType, data: base64 } }, { text: OCR_PROMPT }]
            }
          ]
        })
      };
    },
    extractText(responseText) {
      var _a, _b, _c;
      const body = JSON.parse(responseText);
      const parts = ((_c = (_b = (_a = body.candidates) == null ? void 0 : _a[0]) == null ? void 0 : _b.content) == null ? void 0 : _c.parts) || [];
      const text = parts.map((part) => part.text || "").join("");
      return text.trim() || null;
    },
    async listModels(apiKey) {
      const body = await gmGetJson(
        "https://generativelanguage.googleapis.com/v1beta/models",
        { "x-goog-api-key": apiKey }
      );
      return (body.models || []).map((item) => (item.name || "").replace(/^models\//, "")).filter(Boolean);
    }
  };
  const PROVIDERS = [
    openaiCompatible({
      id: "zhipu",
      label: "智谱 AI（免费）",
      getBaseURL: () => "https://open.bigmodel.cn/api/paas/v4",
      models: ["glm-4v-flash", "glm-4.6v", "glm-4.5v", "glm-4v-plus"],
      defaultModel: "glm-4v-flash"
    }),
    openaiCompatible({
      id: "deepseek",
      label: "DeepSeek",
      getBaseURL: () => "https://api.deepseek.com",
      models: ["deepseek-v4-flash-vision-exp"],
      defaultModel: "deepseek-v4-flash-vision-exp"
    }),
    openaiCompatible({
      id: "moonshot",
      label: "Kimi (Moonshot)",
      getBaseURL: () => "https://api.moonshot.cn/v1",
      models: ["kimi-latest", "moonshot-v1-8k-vision-preview"],
      defaultModel: "kimi-latest"
    }),
    openaiCompatible({
      id: "qwen",
      label: "通义千问",
      getBaseURL: () => "https://dashscope.aliyuncs.com/compatible-mode/v1",
      models: ["qwen-vl-plus", "qwen-vl-max", "qwen3-vl-plus"],
      defaultModel: "qwen-vl-plus"
    }),
    openaiCompatible({
      id: "doubao",
      label: "豆包 (火山方舟)",
      getBaseURL: () => "https://ark.cn-beijing.volces.com/api/v3",
      models: ["doubao-seed-1.6-vision-250815", "doubao-1.5-vision-pro-32k"],
      defaultModel: "doubao-seed-1.6-vision-250815"
    }),
    openaiCompatible({
      id: "siliconflow",
      label: "SiliconFlow 硅基流动",
      getBaseURL: () => "https://api.siliconflow.cn/v1",
      models: ["Qwen/Qwen2.5-VL-32B-Instruct", "Qwen/Qwen3-VL-8B-Instruct"],
      defaultModel: "Qwen/Qwen2.5-VL-32B-Instruct"
    }),
    openaiCompatible({
      id: "openai",
      label: "OpenAI",
      getBaseURL: () => "https://api.openai.com/v1",
      models: ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini"],
      defaultModel: "gpt-4o-mini"
    }),
    claudeProvider,
    geminiProvider,
    openaiCompatible({
      id: "grok",
      label: "xAI Grok",
      getBaseURL: () => "https://api.x.ai/v1",
      models: ["grok-2-vision-1212", "grok-4"],
      defaultModel: "grok-2-vision-1212"
    }),
    openaiCompatible({
      id: "mistral",
      label: "Mistral",
      getBaseURL: () => "https://api.mistral.ai/v1",
      models: ["pixtral-12b-2409", "mistral-small-latest"],
      defaultModel: "pixtral-12b-2409"
    }),
    openaiCompatible({
      id: "openrouter",
      label: "OpenRouter（聚合）",
      getBaseURL: () => "https://openrouter.ai/api/v1",
      models: [
        "google/gemini-2.0-flash-exp:free",
        "qwen/qwen2.5-vl-72b-instruct:free",
        "meta-llama/llama-3.2-11b-vision-instruct:free"
      ],
      defaultModel: "google/gemini-2.0-flash-exp:free"
    }),
    openaiCompatible({
      id: "custom",
      label: "自定义（OpenAI 兼容）",
      getBaseURL: () => _GM_getValue("customBaseURL", "").replace(/\/+$/, ""),
      models: [],
      defaultModel: ""
    })
  ];
  function getProvider(id) {
    return PROVIDERS.find((provider) => provider.id === id);
  }
  const ICONS = {
    bolt: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="#fff" width="16" height="16"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    spinner: `<svg class="cap-rec-icon cap-rec-spinning" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`,
    check: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>`,
    times: `<svg class="cap-rec-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
  };
  const STATE_ICONS = {
    idle: ICONS.bolt,
    loading: ICONS.spinner,
    success: ICONS.check,
    error: ICONS.times
  };
  function showToast(message, type = "info") {
    const existing = document.querySelector(".cap-rec-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = `cap-rec-toast ${type}`;
    toast.textContent = message;
    (document.documentElement || document.body).appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(120%)";
      setTimeout(() => toast.remove(), 300);
    }, 3e3);
  }
  function setBtnState(btn, state) {
    btn.classList.remove("loading", "success", "error");
    if (state !== "idle") btn.classList.add(state);
    btn.innerHTML = STATE_ICONS[state];
  }
  function injectButton(captchaEl, onClick) {
    var _a;
    if (captchaEl.dataset.captchaOcrInjected) return null;
    captchaEl.dataset.captchaOcrInjected = "true";
    const btn = document.createElement("button");
    btn.className = "cap-rec-btn";
    btn.setAttribute("aria-label", "识别验证码");
    setBtnState(btn, "idle");
    const needsWrapper = ["IMG", "CANVAS"].includes(captchaEl.tagName);
    let container = captchaEl;
    if (needsWrapper) {
      const wrapper = document.createElement("div");
      wrapper.className = "cap-rec-wrap";
      (_a = captchaEl.parentNode) == null ? void 0 : _a.insertBefore(wrapper, captchaEl);
      wrapper.appendChild(captchaEl);
      container = wrapper;
      const syncBtnHeight = () => {
        const height = captchaEl.offsetHeight;
        if (height > 0) {
          btn.style.height = `${height}px`;
        } else {
          requestAnimationFrame(syncBtnHeight);
        }
      };
      if (captchaEl.tagName === "IMG" && captchaEl.complete) {
        syncBtnHeight();
      } else {
        captchaEl.addEventListener("load", syncBtnHeight, { once: true });
        captchaEl.addEventListener("error", syncBtnHeight, { once: true });
      }
    } else {
      if (getComputedStyle(captchaEl).position === "static") {
        captchaEl.style.position = "relative";
      }
      captchaEl.style.marginRight = "38px";
    }
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.classList.contains("loading")) return;
      onClick(btn);
    });
    btn.addEventListener("mousedown", (e) => e.stopPropagation());
    btn.addEventListener("mouseup", (e) => e.stopPropagation());
    container.appendChild(btn);
    return btn;
  }
  const VISION_MODEL_RE = /(vision|vl|-v\d|^gpt-4o|omni|gemini|pixtral|ocr|glm-.+v|internvl|minicpm|moondream|llama-\d|doubao)/i;
  function getProviderId() {
    const id = _GM_getValue("provider", "zhipu");
    return getProvider(id) ? id : "zhipu";
  }
  function getApiKey(providerId) {
    return _GM_getValue(`apiKey:${providerId}`, "");
  }
  function getModel(providerId) {
    var _a;
    return _GM_getValue(`model:${providerId}`, "") || ((_a = getProvider(providerId)) == null ? void 0 : _a.defaultModel) || "";
  }
  function getAutoCopy() {
    return _GM_getValue("autoCopy", false);
  }
  function getAutoSubmit() {
    return _GM_getValue("autoSubmit", true);
  }
  function toggleAutoCopy() {
    _GM_setValue("autoCopy", !getAutoCopy());
    showToast(getAutoCopy() ? "自动复制已开启" : "自动复制已关闭", "info");
  }
  function toggleAutoSubmit() {
    _GM_setValue("autoSubmit", !getAutoSubmit());
    showToast(getAutoSubmit() ? "自动提交已开启" : "自动提交已关闭", "info");
  }
  function getCachedModels(providerId) {
    return _GM_getValue(`models:${providerId}`, []);
  }
  function showSettingsDialog() {
    if (document.getElementById("cap-rec-dialog-mask")) return;
    const mask = document.createElement("div");
    mask.id = "cap-rec-dialog-mask";
    mask.className = "cap-rec-mask";
    const card = document.createElement("div");
    card.id = "cap-rec-dialog";
    card.className = "cap-rec-card";
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
  `;
    mask.appendChild(card);
    document.body.appendChild(mask);
    const providerSelect = card.querySelector("#cap-rec-provider");
    const baseurlField = card.querySelector("#cap-rec-baseurl-field");
    const baseurlInput = card.querySelector("#cap-rec-baseurl");
    const modelInput = card.querySelector("#cap-rec-model");
    const modelList = card.querySelector("#cap-rec-model-list");
    const fetchBtn = card.querySelector("#cap-rec-fetch-models");
    const showAllInput = card.querySelector("#cap-rec-show-all");
    const keyLabel = card.querySelector("#cap-rec-key-label");
    const keyInput = card.querySelector("#cap-rec-key");
    const autocopyInput = card.querySelector("#cap-rec-autocopy");
    const autosubmitInput = card.querySelector("#cap-rec-autosubmit");
    for (const provider of PROVIDERS) {
      const option = document.createElement("option");
      option.value = provider.id;
      option.textContent = provider.label;
      providerSelect.appendChild(option);
    }
    const rebuildModelList = () => {
      const provider = getProvider(providerSelect.value);
      if (!provider) return;
      const all = [.../* @__PURE__ */ new Set([...provider.models, ...getCachedModels(provider.id)])];
      const filtered = showAllInput.checked ? all : all.filter((id) => VISION_MODEL_RE.test(id));
      if (modelInput.value && !filtered.includes(modelInput.value)) filtered.unshift(modelInput.value);
      modelList.replaceChildren(
        ...filtered.map((id) => {
          const option = document.createElement("option");
          option.value = id;
          return option;
        })
      );
    };
    const refreshProviderFields = () => {
      const provider = getProvider(providerSelect.value);
      if (!provider) return;
      const providerId = provider.id;
      baseurlField.hidden = providerId !== "custom";
      if (providerId === "custom") baseurlInput.value = _GM_getValue("customBaseURL", "");
      modelInput.value = getModel(providerId);
      keyLabel.textContent = `API Key（${provider.label}）`;
      keyInput.value = getApiKey(providerId);
      rebuildModelList();
    };
    providerSelect.addEventListener("change", refreshProviderFields);
    showAllInput.addEventListener("change", rebuildModelList);
    fetchBtn.addEventListener("click", async () => {
      const provider = getProvider(providerSelect.value);
      if (!provider) return;
      fetchBtn.disabled = true;
      fetchBtn.textContent = "⏳";
      try {
        const models = await provider.listModels(keyInput.value.trim());
        if (!models.length) throw new Error("未获取到模型");
        _GM_setValue(`models:${provider.id}`, [...new Set(models)]);
        rebuildModelList();
        showToast(`获取到 ${models.length} 个模型`, "success");
      } catch (err) {
        showToast(`获取模型列表失败: ${err instanceof Error ? err.message : String(err)}`, "error");
      } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = "🔄";
      }
    });
    const save = () => {
      const providerId = providerSelect.value;
      _GM_setValue("provider", providerId);
      _GM_setValue("customBaseURL", baseurlInput.value.trim());
      _GM_setValue(`model:${providerId}`, modelInput.value.trim());
      _GM_setValue(`apiKey:${providerId}`, keyInput.value.trim());
      _GM_setValue("autoCopy", autocopyInput.checked);
      _GM_setValue("autoSubmit", autosubmitInput.checked);
      showToast("✅ 设置已保存", "success");
      setTimeout(() => mask.remove(), 800);
    };
    keyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") save();
    });
    card.querySelector("#cap-rec-cancel").addEventListener("click", () => mask.remove());
    card.querySelector("#cap-rec-save").addEventListener("click", save);
    mask.addEventListener("click", (e) => {
      if (e.target === mask) mask.remove();
    });
    providerSelect.value = getProviderId();
    autocopyInput.checked = getAutoCopy();
    autosubmitInput.checked = getAutoSubmit();
    refreshProviderFields();
  }
  async function getImageData(el) {
    var _a;
    if (el.tagName === "IMG" && el.src) {
      try {
        const img = el;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        (_a = canvas.getContext("2d")) == null ? void 0 : _a.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        if (dataUrl && dataUrl !== "data:,") {
          return { type: "data", value: dataUrl };
        }
      } catch {
      }
      return { type: "url", value: el.src };
    }
    if (el.tagName === "CANVAS") {
      return { type: "data", value: el.toDataURL("image/png") };
    }
    console.warn("[CAPTCHA OCR] 不支持的元素类型:", el.tagName);
    return null;
  }
  async function recognize(image) {
    var _a;
    const provider = getProvider(getProviderId());
    if (!provider) return { text: null, error: "未知的 AI 平台，请重新设置" };
    const apiKey = getApiKey(provider.id);
    if (!apiKey && provider.id !== "openrouter") {
      return { text: null, error: "请先设置 API Key（点击油猴菜单）" };
    }
    const model = getModel(provider.id);
    if (!model) return { text: null, error: "请先在设置中选择模型" };
    let imageUrl = image.value;
    if (image.type === "url") {
      imageUrl = await fetchImageAsBase64(image.value).catch(() => null) || image.value;
    }
    let request;
    try {
      request = provider.buildRequest(apiKey, model, imageUrl);
    } catch (err) {
      return { text: null, error: err instanceof Error ? err.message : "构造请求失败" };
    }
    let res;
    try {
      res = await gmRequest({
        method: "POST",
        url: request.url,
        headers: request.headers,
        data: request.data
      });
    } catch (err) {
      return { text: null, error: err instanceof Error ? err.message : "网络请求失败" };
    }
    if (res.status < 200 || res.status >= 300) {
      let message = `请求失败 (HTTP ${res.status})`;
      try {
        const errJson = JSON.parse(res.responseText);
        message = ((_a = errJson.error) == null ? void 0 : _a.message) || message;
      } catch {
      }
      return { text: null, error: message };
    }
    try {
      const text = provider.extractText(res.responseText);
      return { text, error: text ? null : "识别失败" };
    } catch {
      return { text: null, error: "解析响应失败" };
    }
  }
  function fillInput(text, inputSelector) {
    var _a;
    if (!inputSelector) return;
    const input = document.querySelector(inputSelector);
    if (!input) {
      console.warn("[CAPTCHA OCR] 未找到输入框:", inputSelector);
      return;
    }
    const nativeSetter = (_a = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )) == null ? void 0 : _a.set;
    if (nativeSetter) {
      nativeSetter.call(input, text);
    } else {
      input.value = text;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  _GM_registerMenuCommand("🔑 设置 AI 模型与 API Key", showSettingsDialog);
  _GM_registerMenuCommand("📋 切换自动复制", toggleAutoCopy);
  _GM_registerMenuCommand("🎯 切换自动提交", toggleAutoSubmit);
  async function recognizeAndApply(captchaEl, config, btn, silent = false) {
    if (btn) setBtnState(btn, "loading");
    try {
      const image = await getImageData(captchaEl);
      if (!image) throw new Error("获取验证码图片失败");
      const { text, error } = await recognize(image);
      if (error || !text) throw new Error(error || "识别失败");
      fillInput(text, config.inputSelector);
      const autoCopy = getAutoCopy();
      if (autoCopy) _GM_setClipboard(text, "text");
      const actions = [];
      if (config.inputSelector) {
        actions.push(autoCopy ? "已复制并填入" : "已填入");
      } else if (autoCopy) {
        actions.push("已复制");
      }
      if (getAutoSubmit() && config.submitSelector) {
        actions.push("已提交");
        setTimeout(() => {
          var _a;
          ;
          (_a = document.querySelector(config.submitSelector)) == null ? void 0 : _a.click();
        }, 300);
      }
      if (btn) {
        setBtnState(btn, "success");
        setTimeout(() => setBtnState(btn, "idle"), 800);
      }
      showToast(`识别成功: ${text}${actions.length ? `（${actions.join("，")}）` : ""}`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (btn) {
        setBtnState(btn, "error");
        setTimeout(() => setBtnState(btn, "idle"), 1500);
      }
      if (!silent) showToast(message, "error");
    }
  }
  function scanAndInject(config) {
    document.querySelectorAll(config.captchaSelector).forEach((el) => {
      if (el instanceof HTMLElement) {
        injectButton(el, (btn) => recognizeAndApply(el, config, btn));
      }
    });
  }
  function tryAutoRecognize(config) {
    var _a;
    const captchaEl = document.querySelector(config.captchaSelector);
    if (!captchaEl) return false;
    if (captchaEl.tagName === "IMG" && !captchaEl.complete) return false;
    if (config.inputSelector && !document.querySelector(config.inputSelector)) return false;
    const btn = ((_a = captchaEl.closest(".cap-rec-wrap")) == null ? void 0 : _a.querySelector("button")) || null;
    recognizeAndApply(captchaEl, config, btn, true);
    return true;
  }
  function main() {
    const config = findSiteConfig(location.hostname);
    if (!config) return;
    let autoDone = false;
    const autoDeadline = Date.now() + 1e4;
    const observer = new MutationObserver(() => {
      scanAndInject(config);
      if (!autoDone && Date.now() <= autoDeadline) {
        autoDone = tryAutoRecognize(config);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    scanAndInject(config);
    if (Date.now() <= autoDeadline) {
      autoDone = tryAutoRecognize(config);
    }
  }
  main();

})();