import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'CAPTCHA OCR (Zhipu AI)',
        namespace: 'captcha-ocr',
        description: '自动识别验证码图片，支持多家 AI 视觉模型，自动填充与提交',
        icon: 'https://wap.lotsmall.cn/favicon.ico',
        author: 'xu.yao',
        match: [
          'https://itestuser.sendinfo.com.cn/*',
          'https://itestwap.sendinfo.com.cn/*',
          'http://localhost/*'
        ],
        grant: [
          'GM_xmlhttpRequest',
          'GM_getValue',
          'GM_setValue',
          'GM_setClipboard',
          'GM_registerMenuCommand'
        ],
        connect: [
          'open.bigmodel.cn',
          'api.deepseek.com',
          'api.moonshot.cn',
          'dashscope.aliyuncs.com',
          'ark.cn-beijing.volces.com',
          'api.siliconflow.cn',
          'api.openai.com',
          'api.anthropic.com',
          'generativelanguage.googleapis.com',
          'api.x.ai',
          'api.mistral.ai',
          'openrouter.ai',
          '*'
        ],
        'run-at': 'document-idle',
        license: 'MIT',
        homepage:
          'https://github.com/showlotus/tampermonkey-scripts/blob/main/packages/captcha-ocr',
        supportURL: 'https://github.com/showlotus/tampermonkey-scripts/issues'
      }
    })
  ]
})
