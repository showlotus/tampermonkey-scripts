export const $ = (selector: string) => {
  return document.querySelector(selector) as HTMLElement | null
}

export const $$ = (selector: string) => {
  return document.querySelectorAll(selector)
}

export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.PROD) return
    console.debug('%c[bilibili-video-note-export]', 'color: #666', ...args)
  },
  info: (...args: any[]) => {
    console.info('%c[bilibili-video-note-export]', 'color: #2196F3', ...args)
  },
  warn: (...args: any[]) => {
    console.warn('%c[bilibili-video-note-export]', 'color: #FF9800', ...args)
  },
  error: (...args: any[]) => {
    console.error('%c[bilibili-video-note-export]', 'color: #F44336', ...args)
  }
}

/**
 * 防抖
 * @param fn 函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay = 500) => {
  let timer: number | null = null
  return ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => fn(...args), delay) as unknown as number
  }) as T
}

/**
 * 监听元素可见性状态
 * @param selector DOM 元素选择器
 * @param callback 回调函数
 * @param callback.isShow 元素是否显示
 * @param options 配置项
 * @param options.immediate 是否立即执行回调函数
 * @returns 停止监听函数
 */
export const watchElementVisibility = (
  selector: string,
  callback: (isShow: boolean) => void,
  options: { immediate?: boolean } = { immediate: true }
) => {
  const getEl = () => {
    return typeof selector === 'string' ? document.querySelector(selector) : selector
  }

  const intersectionObserver = new IntersectionObserver(
    entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        callback(true)
      } else {
        callback(false)
      }
    },
    {
      // 当元素进入视口时触发
      threshold: 0.01
    }
  )

  const mutationObserver = new MutationObserver(() => {
    const el = getEl()
    if (el) {
      intersectionObserver.unobserve(el)
      intersectionObserver.observe(el)
    }
  })

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  // 检查元素是否已经在视口中
  const el = getEl()
  if (el && options.immediate) {
    const rect = el.getBoundingClientRect()
    const isVisible =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)

    if (isVisible) {
      callback(true)
    }
  }

  return () => {
    intersectionObserver.disconnect()
    mutationObserver.disconnect()
  }
}
