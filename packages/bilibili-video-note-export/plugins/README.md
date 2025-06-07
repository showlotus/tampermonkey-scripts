# Vite 插件集合 🚀

这个目录包含了项目中使用的自定义 Vite 插件。

## vite-plugin-main-hmr

### 功能描述 📋

专门处理 `main.ts` 等入口文件的热模块替换（HMR），避免整页刷新，提供更流畅的开发体验。采用类似 React Hook 的设计模式，`mount` 函数返回清理函数，实现更优雅的生命周期管理。

### 核心特性 ✨

- **智能模块替换** - 精确控制模块的挂载和卸载，避免页面刷新
- **依赖文件追踪** - 自动检测并处理依赖文件（如 utils.ts）的更新
- **副作用清理** - 自动管理事件监听器和定时器等副作用
- **错误处理** - HMR 失败时优雅回退到页面刷新
- **调试支持** - 可选的调试日志，方便开发时排查问题
- **类型安全** - 完整的 TypeScript 类型支持

### 使用方法 🛠️

在 `vite.config.ts` 中配置：

```typescript
import { vitePluginMainHmr } from './plugins/vite-plugin-main-hmr'

export default defineConfig({
  plugins: [
    vitePluginMainHmr({
      entry: 'src/main.ts', // 入口文件路径
      debug: true // 开发时启用调试日志
    })
    // ... 其他插件
  ]
})
```

### 配置选项 ⚙️

| 选项    | 类型      | 默认值          | 描述             |
| ------- | --------- | --------------- | ---------------- |
| `entry` | `string`  | `'src/main.ts'` | 入口文件路径     |
| `debug` | `boolean` | `false`         | 是否启用调试日志 |

### 工作原理 🔧

1. **代码分析** - 插件会检测入口文件中是否导出了 `mount` 函数
2. **HMR 注入** - 自动注入增强的 HMR 代码，替换 Vite 默认的页面刷新行为
3. **依赖追踪** - 监听入口文件及其依赖文件的变化，确保任何相关更新都触发自定义 HMR
4. **生命周期管理** - 在模块更新时先调用之前保存的清理函数，然后执行新的 `mount` 函数
5. **清理函数管理** - 通过 `import.meta.hot.data` 保存 `mount` 函数返回的清理函数
6. **状态保持** - 维护模块挂载状态，确保正确的生命周期执行

### 适用场景 🎯

- **Tampermonkey 脚本开发** - 需要频繁调试但不能丢失页面状态
- **浏览器扩展开发** - 需要保持扩展的运行状态
- **单页应用开发** - 需要精确控制组件生命周期的场景

### 触发条件 🔄

插件会在以下情况触发自定义 HMR：

- ✅ **直接修改入口文件**（如 `main.ts`）
- ✅ **修改依赖文件**（如 `utils.ts`、`style.css` 等被 `main.ts` 导入的文件）
- ❌ **修改无关文件**（不被入口文件直接或间接导入的文件）

### 注意事项 ⚠️

1. 确保你的入口文件导出了名为 `mount` 的函数
2. `mount` 函数应该返回一个清理函数，用于清理所有副作用（事件监听器、定时器等）
3. 清理函数中应该包含完整的清理逻辑，确保没有内存泄漏
4. 建议在开发环境启用 `debug` 选项，方便排查问题
5. 如果 HMR 失败，插件会自动回退到页面刷新

### 示例代码 💡

```typescript
// src/main.ts
export const mount = () => {
  // 挂载逻辑
  const observer = new MutationObserver(callback)
  document.addEventListener('click', handleClick)

  console.log('模块已挂载')

  // 返回清理函数
  return () => {
    // 清理逻辑
    observer.disconnect()
    document.removeEventListener('click', handleClick)
    console.log('模块已清理')
  }
}

// 初始挂载
mount()
```

通过这个插件，你可以享受到更流畅的开发体验，无需每次都重新加载整个页面！🎉
