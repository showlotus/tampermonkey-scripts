import type { Plugin } from 'vite'
import { normalizePath } from 'vite'
import { relative } from 'path'

export interface MainHmrOptions {
  /**
   * 入口文件路径
   */
  entry?: string
}

/**
 * 主模块热更新插件
 *
 * 该插件用于处理 main.ts 等入口文件的热更新，避免整页刷新
 * 通过监听 mount 函数返回的清理函数来实现无缝热更新
 * 在开发环境下自动注入 HMR 相关代码
 */
export function vitePluginMainHmr(options: MainHmrOptions = {}): Plugin {
  const { entry = 'src/main.ts' } = options

  return {
    name: 'vite-plugin-main-hmr',

    /**
     * 转换代码，注入 HMR 逻辑
     */
    transform(code, id) {
      // 只处理入口文件
      if (normalizePath(relative(process.cwd(), id)) !== normalizePath(entry)) return

      // 在生产环境直接执行 mount 函数
      if (process.env.NODE_ENV === 'production') {
        return {
          code: code + '\n' + `mount()`,
          map: null
        }
      }

      // 检查是否已经有 HMR 代码
      if (code.includes('import.meta.hot.accept')) {
        return
      }

      const hmrCode = `
if (import.meta.hot) {
  // 存储模块状态和清理函数
  import.meta.hot.data.moduleState = import.meta.hot.data.moduleState || {
    mounted: false,
    cleanupFunction: null
  }

  // 处理模块更新
  import.meta.hot.accept((newModule) => {
    try {
      // 先执行清理逻辑
      if (import.meta.hot.data.moduleState && 
          import.meta.hot.data.moduleState.mounted && 
          typeof import.meta.hot.data.moduleState.cleanupFunction === 'function') {
        import.meta.hot.data.moduleState.cleanupFunction()
        import.meta.hot.data.moduleState.cleanupFunction = null
      }

      // 执行新模块的挂载逻辑
      if (newModule && typeof newModule.mount === 'function') {
        const cleanup = newModule.mount()
        
        // 保存清理函数
        if (typeof cleanup === 'function') {
          import.meta.hot.data.moduleState.cleanupFunction = cleanup
        }
        
        import.meta.hot.data.moduleState.mounted = true
      }
    } catch (error) {
      console.error('[HMR] 模块更新失败:', error)
      window.location.reload()
    }
  })

  // 处理模块卸载
  import.meta.hot.dispose((data) => {
    if (data.moduleState.mounted && typeof data.moduleState.cleanupFunction === 'function') {
      try {
        data.moduleState.cleanupFunction()
      } catch (error) {
        console.warn('[HMR] 清理函数执行失败:', error)
      }
    }
  })

  // 初始挂载
  if (typeof mount === 'function' && 
      import.meta.hot.data.moduleState && 
      !import.meta.hot.data.moduleState.mounted) {
    const cleanup = mount()
    if (typeof cleanup === 'function') {
      import.meta.hot.data.moduleState.cleanupFunction = cleanup
    }
    import.meta.hot.data.moduleState.mounted = true
  }
}
`

      // 将 HMR 代码添加到处理后的代码末尾
      code = code + '\n' + hmrCode

      return {
        code: code,
        map: null
      }
    }
  }
}

export default vitePluginMainHmr
