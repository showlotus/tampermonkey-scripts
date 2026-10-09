# tampermonkey-scripts

一些实用的 Tampermonkey 脚本集合 🚀

> 参考文档
>
> - https://www.tampermonkey.net/documentation.php#meta:include
> - https://cloud.tencent.com/developer/article/2123940

## 📦 插件列表

### 🎯 B 站相关插件

#### [bilibili-video-note-export](./packages/bilibili-video-note-export/)

**B 站视频笔记导出工具** - 支持将 B 站视频笔记导出为图片，提供多种样式选择

- ✨ 支持将笔记导出为图片
- 📋 支持复制笔记到剪贴板
- 🎨 提供默认和简洁两种样式
- ⚙️ 可自定义是否包含发布者信息
- 💾 自动保存用户偏好设置

#### [bilibili-comment-ip](./packages/bilibili-comment-ip/)

**B 站评论 IP 归属地显示** - 在 B 站视频评论中显示评论者的 IP 归属地信息

#### [bilibili-release-date](./packages/bilibili-release-date/)

**B 站视频发布日期显示** - 在 B 站视频页面显示视频的发布日期信息

#### [bilibili-online-rank](./packages/bilibili-online-rank/)

**B 站在线人数排名入口** - 在 B 站首页新增在线人数排名入口，点击后打开排行榜页面

### 🧑‍🏫 中国医学远程继续教育

#### [play-video-when-blur](./packages/play-video-when-blur/)

**网页失焦时视频继续播放** - 让视频在网页失焦时保持播放状态

- 🎥 防止视频在切换标签页时自动暂停
- 🔄 模拟页面始终处于焦点状态
- 🎯 适用于在线课程等视频网站

### 🎬 媒体与界面增强

#### [peek-media](./packages/peek-media/)

**媒体悬浮预览** - 悬浮预览页面中的图片和视频（Lit + Tailwind，开发中）

### 🌐 网络相关插件

#### [rewrite-fetch-or-xhr](./packages/rewrite-fetch-or-xhr/)

**网络请求重写工具** - 用于拦截和重写网页的 fetch 和 XHR 请求

- 🔍 拦截网络请求
- ✏️ 重写请求参数
- 📊 请求监控和调试

### 🧪 开发中

- [bilibili-video-note-export-v2](./packages/bilibili-video-note-export-v2/) - 使用 React 重构的 B 站笔记导出工具
- [scrollbar-pin](./packages/scrollbar-pin/) - 仅有技术设计文档（[tech.md](./packages/scrollbar-pin/tech.md)）
- [@tampermonkey-scripts/utils](./packages/utils/) - 各脚本共用的工具库（非脚本）

## 🚀 快速开始

### 安装 Tampermonkey

1. 首先安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 选择你需要的插件，点击对应的安装链接

### 开发环境

```bash
# 克隆项目
git clone https://github.com/your-username/tampermonkey-scripts.git
cd tampermonkey-scripts

# 安装依赖
pnpm install

# 进入特定插件目录
cd packages/your-plugin-name

# 开发模式
pnpm dev

# 构建
pnpm build

# 全部 TS 包类型检查（根目录运行）
pnpm typecheck
```

### 新建脚本

在 OpenCode 对话中直接说「帮我新建一个 xxx 脚本」，agent 会通过 `new-script` skill 询问脚本名与模板（js | lit | vue | react）并完成创建，也可用 `@new-script` 显式调用。底层执行 `node scripts/createNewScript.js <name> --template <template>`。

### 发布到 Greasy Fork

Vite 构建类脚本通过 tag 触发 CI（`.github/workflows/publish-greasyfork.yml`）自动发布：

1. 修改 `packages/<包名>/package.json` 的 `version`
2. 打 tag 并推送：`git tag <包名>-v<版本> && git push origin <包名>-v<版本>`（如 `captcha-ocr-v1.0.1`）
3. CI 自动构建，并把产物 `<包名>.user.js` 推送到 `greasyfork` 分支（多脚本产物共存，互不影响）

首次发布需在 Greasy Fork 手动完成两步配置：

**1. 导入脚本**（必做）：登录 [greasyfork.org](https://greasyfork.org/zh-CN/import) →「将新脚本导入到 Greasy Fork」，填入 raw URL，同步方式选「自动」：

```
https://raw.githubusercontent.com/showlotus/tampermonkey-scripts/greasyfork/<包名>.user.js
```

> 注意：「自动」同步是每天定期拉取，更新延迟最多 24 小时。

**2. 配置 webhook**（推荐，实现即时更新）：Greasy Fork 的「自动同步」和「webhook」是两个独立机制。在 Greasy Fork 用户面板的 webhook 说明页生成 secret（⚠️ 只显示一次），再到 GitHub 仓库 Settings → Webhooks → Add webhook：

- Payload URL：Greasy Fork 提供的地址（形如 `https://greasyfork.org/users/<ID>-<用户名>/webhook`）
- Content type：`application/json`
- Secret：Greasy Fork 生成的 key
- 触发事件：**Just the push event**

配置后每次打 tag 推送，脚本约 5~10 分钟内自动更新（GitHub raw 有 5 分钟缓存），脚本同步类型会自动变为「Webhook」并停止 24 小时定期拉取。

## 🛠️ 技术栈

- **构建工具**: Vite + [vite-plugin-monkey](https://github.com/nicepkg/vite-plugin-monkey)
- **包管理器**: pnpm（workspace monorepo）
- **语言**: TypeScript / JavaScript
- **样式**: Tailwind CSS（部分插件）
- **代码规范**: Prettier

## 📁 项目结构

```
tampermonkey-scripts/
├── packages/                        # 插件目录
│   ├── bilibili-video-note-export/  # B 站笔记导出
│   ├── bilibili-video-note-export-v2/ # B 站笔记导出（React 重构，开发中）
│   ├── bilibili-comment-ip/         # B 站评论 IP 显示
│   ├── bilibili-release-date/       # B 站发布日期显示
│   ├── bilibili-online-rank/        # B 站在线人数排名入口
│   ├── play-video-when-blur/        # 失焦时视频继续播放
│   ├── peek-media/                  # 媒体悬浮预览（开发中）
│   ├── rewrite-fetch-or-xhr/        # 网络请求重写
│   ├── beautify-docmost/            # Docmost 界面美化
│   ├── scrollbar-pin/               # 设计文档
│   └── utils/                       # 共享工具库
├── templates/                       # 新脚本模板（js / lit / vue / react）
└── scripts/                         # 脚手架脚本
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！
