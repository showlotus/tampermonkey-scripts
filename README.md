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

**B 站视频在线人数排名显示** - 在 B 站首页新增在线人数排名入口，点击后打开排行榜页面

### 🧑‍🏫 中国医学远程继续教育

#### [play-video-when-blur](./packages/play-video-when-blur/)

**网页失焦时视频继续播放** - 让视频在网页失焦时保持播放状态

- 🎥 防止视频在切换标签页时自动暂停
- 🔄 模拟页面始终处于焦点状态
- 🎯 适用于在线课程等视频网站
<!--

### 🎬 视频相关插件

#### [video-fullscreen](./packages/video-fullscreen/)

**视频全屏增强工具** - 为网页中的视频元素添加全屏功能增强

- 🎥 为任意视频元素添加全屏按钮
- 🎯 智能定位全屏按钮
- 🔄 响应式适配视频尺寸变化

### 🌐 网络相关插件

#### [rewrite-fetch-or-xhr](./packages/rewrite-fetch-or-xhr/)

**网络请求重写工具** - 用于拦截和重写网页的 fetch 和 XHR 请求

- 🔍 拦截网络请求
- ✏️ 重写请求参数
- 📊 请求监控和调试

### 🎨 UI 组件模板

#### [media-peek](./packages/media-peek/)

**React + Vite + TypeScript 模板** - 基于 shadcn/ui 的现代化 UI 组件模板

- ⚛️ React + TypeScript
- ⚡ Vite 构建工具
- 🎨 Tailwind CSS + shadcn/ui
- 🔧 ESLint + Prettier
- 📱 响应式设计 -->

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
```

## 🛠️ 技术栈

- **构建工具**: Vite
- **包管理器**: pnpm
- **语言**: TypeScript / JavaScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui (部分插件)
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
tampermonkey-scripts/
├── packages/                    # 插件目录
│   ├── bilibili-video-note-export/    # B 站笔记导出
│   ├── bilibili-comment-ip/           # B 站评论 IP 显示
│   ├── bilibili-release-date/         # B 站发布日期显示
│   ├── video-fullscreen/              # 视频全屏增强
│   ├── rewrite-fetch-or-xhr/          # 网络请求重写
│   └── media-peek/                    # React UI 模板
├── templates/                  # 模板目录
│   ├── js/                     # JavaScript 模板
│   ├── react/                  # React 模板
│   └── vue/                    # Vue 模板
└── README.md                   # 项目说明
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
