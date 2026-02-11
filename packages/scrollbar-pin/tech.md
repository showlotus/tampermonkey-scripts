# Scrollbar Pin 技术设计文档

## 项目概述

一个 Tampermonkey 脚本，用于记录和快速定位页面滚动位置。

### 核心价值
在浏览长页面时（如技术文档、文章、论坛帖子），用户常常需要记住某个关键位置以便后续返回。本插件通过在滚动条上显示可视化标记，让用户可以快速定位到之前标记的位置。

---

## 功能分期规划

### 一期功能（MVP）
- [ ] 浮动按钮打标签 - 点击页面浮动按钮为当前位置打标签
- [ ] 可视化标记 - 在滚动条区域显示标记块
- [ ] 快速定位 - 点击标记块，页面自动滚动到对应位置

### 二期功能
- [ ] 页面缩略图 - 鼠标悬浮在标签上时，展示该位置的页面缩略图
- [ ] 自动恢复 - 记住上次浏览位置，重新打开页面时自动恢复
- [ ] 标签管理 - 编辑、重命名、删除标签
- [ ] 数据导出 - 导入/导出标签数据

---

## 一期功能详细设计

### 1.1 浮动按钮打标签

#### 显示逻辑
浮动按钮默认隐藏，仅当鼠标移动到视口右侧热区时才显示，避免遮挡页面内容：

```
┌─────────────────────────────────────┐
│          页面内容区域               │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
                           🔥 ← 右侧热区 (hover 后显示 📌)
```

**热区定义**：视口右侧 80px 区域

#### 浮动按钮样式
```css
.sp-float-button {
  position: fixed;
  bottom: 80px;
  right: 24px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  border: 2px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
  z-index: 999999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;

  /* 默认隐藏：移出视口 */
  transform: translateX(120%);
  opacity: 0;
}

/* 鼠标在右侧热区时显示 */
.sp-float-button.visible {
  transform: translateX(0);
  opacity: 1;
}

.sp-float-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.5);
}

.sp-float-button:active {
  transform: scale(0.95);
}

/* 点击后的动画反馈 */
.sp-float-button.adding {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

#### 热区检测逻辑
```javascript
// 检测鼠标是否在右侧热区（视口右侧 80px）
function isInHotzone(e) {
  return e.clientX > window.innerWidth - 80;
}

// 鼠标进入热区显示按钮
document.addEventListener('mousemove', (e) => {
  if (isInHotzone(e)) {
    FloatButton.show();
  } else {
    FloatButton.hide();
  }
});
```

#### 交互反馈
点击浮动按钮后：
1. 播放 pulse 动画
2. 显示提示：「已添加标记 1」
3. 0.5 秒后自动消失

#### 提示框样式
```css
.sp-toast {
  position: fixed;
  bottom: 140px;
  right: 24px;
  padding: 10px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 6px;
  font-size: 14px;
  z-index: 999999;
  animation: slideIn 0.2s ease, fadeOut 0.2s ease 0.5s forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  to { opacity: 0; }
}
```

#### 标签命名规则
- 自动命名，使用递增数字：`标记 1`、`标记 2`、`标记 3`...
- 命名计数器按页面独立计算

#### 数据结构
```typescript
interface ScrollTag {
  id: string;           // 唯一标识 (UUID)
  name: string;         // 标签名称 "标记 1"
  position: number;     // 滚动位置 (px)
  percentage: number;   // 滚动百分比 (0-100)
  createdAt: number;    // 创建时间戳
}
```

#### 存储方案
```javascript
// localStorage 键名格式
const STORAGE_KEY = `scrollbar_pin_tags_${btoa(window.location.href)}`;

// 存储示例
{
  "scrollbar_pin_tags_aHR0cHM6Ly9leGFtcGxlLmNvbS9wYWdlMQ==": [
    { "id": "uuid-1", "name": "标记 1", "position": 500, "percentage": 25, "createdAt": 1234567890 }
  ]
}
```

---

### 1.2 滚动条标记块显示

#### 显示位置
标记块显示在页面右侧边缘，与滚动条对齐：

```
┌─────────────────────────────────────┐ ▲
│          页面内容区域               │ │
│                                     │ │ 可视窗口
│                                     │ │
│                                     │ │
│                                     │ ▼
└─────────────────────────────────────┘
                                      █ ← 标记块
```

#### 标记块样式
```css
.sp-marker {
  position: fixed;
  right: 0;
  width: 14px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  border: 2px solid #fff;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  opacity: 0.85;
  transition: all 0.2s ease;
  z-index: 999999;
}

.sp-marker:hover {
  opacity: 1;
  transform: scale(1.15) translateX(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

#### 位置计算公式
```javascript
// 计算标记块在可视窗口中的 top 值
function calculateMarkerTop(percentage) {
  const viewportHeight = window.innerHeight;
  const markerHeight = 24; // 标记块高度
  const maxTop = viewportHeight - markerHeight;
  return (percentage / 100) * maxTop;
}

// 计算滚动百分比
function calculateScrollPercentage() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight;
  const winHeight = window.innerHeight;
  const scrollableHeight = docHeight - winHeight;
  return (scrollTop / scrollableHeight) * 100;
}
```

#### 动态更新
- 监听 `window.resize` 事件，重新计算所有标记块位置
- 监听页面内容变化（MutationObserver），处理动态加载内容

---

### 1.3 点击标记块跳转

#### 交互逻辑
1. 用户点击标记块
2. 页面平滑滚动到对应位置
3. 使用 `window.scrollTo({ behavior: 'smooth' })`

---

## 二期功能设计

### 2.1 页面缩略图预览

#### 功能描述
当鼠标悬停在标记块上时，在标记块左侧显示一个悬浮窗口，展示该标记位置处的页面内容缩略图。

#### 交互效果
```
悬浮前：
                    █ ← 标记块

悬浮后：
┌──────────────────┐  █ ← 标记块
│                  │
│  页面缩略图      │
│  (该位置截图)    │
│                  │
└──────────────────┘
```

#### 实现方案

**方案 A：实时截图（推荐）**
```javascript
// 悬停时截图当前页面在标记位置的内容
async function captureThumbnail(tag) {
  // 1. 临时滚动到标记位置
  const originalScroll = window.scrollY;
  window.scrollTo({ top: tag.position, behavior: 'instant' });

  // 2. 使用 html2canvas 库截图
  const canvas = await html2canvas(document.body, {
    y: tag.position,
    height: window.innerHeight,
    width: window.innerWidth * 0.3, // 缩略图宽度
  });

  // 3. 恢复原滚动位置
  window.scrollTo({ top: originalScroll, behavior: 'instant' });

  return canvas.toDataURL();
}
```
- 优点：展示真实内容
- 缺点：需要引入第三方库 html2canvas

**方案 B：存储时截图**
```javascript
// 打标签时同时保存缩略图
async function addTagWithThumbnail() {
  const tag = { /* ... */ };

  // 立即截图当前视图
  tag.thumbnail = await captureCurrentView();

  Storage.saveTag(tag);
}
```
- 优点：悬浮时无需等待，响应快
- 缺点：存储占用较大，需限制缩略图尺寸和数量

**方案 C：DOM 快照（轻量级）**
```javascript
// 只存储文本内容和结构，不截图
function createDOMSnapshot() {
  const elements = getVisibleElements();
  return {
    title: document.title,
    heading: findNearestHeading(),
    textSnippet: getTextSnippet(),
  };
}
```
- 优点：存储小，性能好
- 缺点：不是视觉缩略图

#### 推荐实现：方案 A + 缓存
```javascript
const thumbnailCache = new Map();

markerElement.addEventListener('mouseenter', async () => {
  if (thumbnailCache.has(tag.id)) {
    showThumbnail(thumbnailCache.get(tag.id));
  } else {
    const thumbnail = await captureThumbnail(tag);
    thumbnailCache.set(tag.id, thumbnail);
    showThumbnail(thumbnail);
  }
});
```

#### 缩略图样式
```css
.sp-thumbnail-tooltip {
  position: fixed;
  right: 20px;
  width: 300px;
  max-height: 200px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  overflow: hidden;
  pointer-events: none;
  z-index: 999999;
}

.sp-thumbnail-tooltip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sp-thumbnail-info {
  padding: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
```

---

### 2.2 自动恢复上次浏览位置

#### 保存时机
- 滚动停止后延迟保存（防抖 500ms）
- 页面卸载前 (`window.beforeunload`)

#### 恢复时机
- 页面加载完成后，延迟 500ms 执行
- 等待动态内容加载完成

#### 存储结构
```typescript
interface LastPosition {
  position: number;
  timestamp: number;
}
```

---

### 2.3 标签管理功能

- 右键点击标记块显示菜单：删除 / 重命名
- 标记列表面板（快捷键唤起）

---

## 技术实现

### 核心代码结构

```javascript
// ==UserScript==
// @name         Scrollbar Pin
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  在滚动条上显示位置标记，快速定位页面内容
// @author       YourName
// @match        *://*/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// ==/UserScript==

(function() {
    'use strict';

    // ========== 数据存储层 ==========
    const Storage = {
        KEY_PREFIX: 'scrollbar_pin_tags_',

        getTags() { /* ... */ },
        saveTags(tags) { /* ... */ },
        getNextTagName() { /* ... */ },
    };

    // ========== 浮动按钮 ==========
    const FloatButton = {
        element: null,
        hideTimer: null,
        HOTZONE_WIDTH: 80, // 热区宽度

        init() {
            this.element = this.createButton();
            this.element.addEventListener('click', () => App.addTag());
            document.body.appendChild(this.element);

            // 监听鼠标移动，检测是否在热区
            document.addEventListener('mousemove', (e) => {
                if (e.clientX > window.innerWidth - this.HOTZONE_WIDTH) {
                    this.show();
                } else {
                    this.hide();
                }
            });
        },

        createButton() { /* 创建浮动按钮 */ },

        show() {
            clearTimeout(this.hideTimer);
            this.element.classList.add('visible');
        },

        hide() {
            // 延迟隐藏，避免闪烁
            this.hideTimer = setTimeout(() => {
                this.element.classList.remove('visible');
            }, 100);
        },

        showToast(message) { /* 显示提示消息 */ },
    };

    // ========== 标记渲染器 ==========
    const MarkerRenderer = {
        container: null,

        init() { /* 创建标记容器 */ },
        renderMarkers(tags) { /* 渲染所有标记块 */ },
        createMarkerElement(tag) { /* 创建单个标记块 */ },
        updatePositions() { /* 更新所有标记位置 */ },
    };

    // ========== 缩略图管理器 (二期) ==========
    const ThumbnailManager = {
        cache: new Map(),

        async capture(tag) { /* 截取页面缩略图 */ },
        show(tag, markerElement) { /* 显示缩略图提示 */ },
        hide() { /* 隐藏缩略图提示 */ },
    };

    // ========== 主控制器 ==========
    const App = {
        init() {
            Storage.init();
            FloatButton.init();
            MarkerRenderer.init();
        },

        addTag() {
            const tag = {
                id: generateUUID(),
                name: Storage.getNextTagName(),
                position: window.scrollY,
                percentage: calculateScrollPercentage(),
                createdAt: Date.now(),
            };
            Storage.saveTag(tag);
            MarkerRenderer.renderMarkers(Storage.getTags());
            FloatButton.showToast(`已添加 ${tag.name}`);
        },

        jumpToTag(tagId) {
            const tag = Storage.getTag(tagId);
            window.scrollTo({ top: tag.position, behavior: 'smooth' });
        },
    };

    // 初始化
    App.init();
})();
```

---

## 待确认事项

- [ ] 标记块颜色样式偏好
- [ ] 缩略图尺寸和样式偏好
- [ ] 标签数据的清理策略（过期时间 / 最大数量限制）

---

## 版本历史

- **v1.0.0** (一期) - 浮动按钮打标签、可视化标记、快速定位
- **v1.1.0** (二期) - 页面缩略图预览、自动恢复上次浏览位置、标签管理
