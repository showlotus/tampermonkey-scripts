# captcha-ocr

自动识别验证码图片并填充的 Tampermonkey 脚本，基于多家 AI 视觉模型。

## 功能

- 🔍 点击验证码旁的侧贴按钮识别，页面加载后自动识别一次
- 🤖 支持多家 AI 平台：智谱（免费）、DeepSeek、Kimi、通义千问、豆包、SiliconFlow、OpenAI、Claude、Gemini、Grok、Mistral、OpenRouter，以及任意 OpenAI 兼容中转
- 🔄 模型列表可从平台动态获取，也支持手动输入任意模型名
- 📋 识别成功后自动填充输入框（兼容 React/Vue），可选自动复制到剪贴板
- 🎯 站点配置了 `submitSelector` 时，识别填充后自动点击提交（油猴菜单可开关，默认开启）

## 使用

1. `pnpm build` 后安装 `dist/captcha-ocr.user.js`（或 `pnpm dev` 开发调试）
2. 点击油猴菜单「🔑 设置 AI 模型与 API Key」，选择平台、填入 Key，可点 🔄 拉取该平台的模型列表
3. 打开匹配站点，验证码旁会出现识别按钮

## 站点配置

在 `src/config.ts` 的 `SITE_CONFIGS` 中按域名配置 `captchaSelector` / `inputSelector` / `submitSelector`（可选，识别填充后自动点击）。

## 发布到 Greasy Fork

1. 修改 `package.json` 的 `version`
2. 打 tag 并推送：`git tag captcha-ocr-v1.0.1 && git push origin captcha-ocr-v1.0.1`
3. CI 自动构建并把 `captcha-ocr.user.js` 推送到 `greasyfork` 分支（其他脚本的产物保持不变）
4. 首次发布：在 Greasy Fork「发布你编写的脚本」中填入以下 raw URL 并选择自动同步（仅需一次）：

   ```
   https://raw.githubusercontent.com/showlotus/tampermonkey-scripts/greasyfork/captcha-ocr.user.js
   ```

5. 之后每次打 tag，Greasy Fork 通过 webhook 自动同步更新
