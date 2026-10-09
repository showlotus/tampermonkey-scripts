# captcha-ocr

自动识别验证码图片并填充的 Tampermonkey 脚本，基于多家 AI 视觉模型。

## 功能

- 🔍 点击验证码旁的侧贴按钮识别，页面加载后自动识别一次
- 🤖 支持多家 AI 平台：智谱（免费）、DeepSeek、Kimi、通义千问、豆包、SiliconFlow、OpenAI、Claude、Gemini、Grok、Mistral、OpenRouter，以及任意 OpenAI 兼容中转
- 🔄 模型列表可从平台动态获取，也支持手动输入任意模型名
- 📋 识别成功后自动填充输入框（兼容 React/Vue），可选自动复制到剪贴板
- 🎯 站点配置了提交按钮选择器时，识别填充后自动点击提交（设置页可开关，默认开启）

## 使用

1. `pnpm dev` 后访问 `http://localhost:5173/preview.html` 可在浏览器直接预览设置页与识别按钮效果（GM API 已 mock，无需 Tampermonkey）
2. `pnpm build` 后安装 `dist/captcha-ocr.user.js`
3. 点击油猴菜单「设置」，选择 AI 平台、填入 Key，可点刷新按钮拉取该平台的模型列表
4. 在设置页的「站点配置」中添加目标站点，刷新页面后验证码旁出现识别按钮

## 站点配置

脚本不预置任何站点，在设置弹窗的「🌐 站点配置」区块中自定义：

- **域名**（必填）：目标页面的 hostname，如 `example.com`（不带协议和路径）
- **验证码元素选择器**（必填）：验证码图片的 CSS 选择器，如 `img.code-img`
- **输入框选择器**：验证码输入框选择器，留空则只识别不填充
- **提交按钮选择器**：识别填充后自动点击的按钮选择器，留空不自动提交（也可在设置页「操作」组全局开关）

站点配置即时保存，添加或删除后刷新页面生效。

## 发布到 Greasy Fork

1. 修改 `package.json` 的 `version`
2. 打 tag 并推送：`git tag captcha-ocr-v1.0.1 && git push origin captcha-ocr-v1.0.1`
3. CI 自动构建并把 `captcha-ocr.user.js` 推送到 `greasyfork` 分支（其他脚本的产物保持不变）
4. 首次发布：在 Greasy Fork「发布你编写的脚本」中填入以下 raw URL 并选择自动同步（仅需一次）：

   ```
   https://raw.githubusercontent.com/showlotus/tampermonkey-scripts/greasyfork/captcha-ocr.user.js
   ```

5. 之后每次打 tag，Greasy Fork 通过 webhook 自动同步更新
