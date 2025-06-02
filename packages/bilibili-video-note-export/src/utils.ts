export const $ = (selector: string) => {
  return document.querySelector(selector) as HTMLElement | null
}

export const $$ = (selector: string) => {
  return document.querySelectorAll(selector)
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
  options: { immediate?: boolean } = {}
) => {
  // 创建 IntersectionObserver 实例
  let intersectionObserver: IntersectionObserver | null = null

  let visible = false

  const intersectionObserverCallback = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry.isIntersecting) {
      visible = true
      callback(true)
    } else if (!entry.isIntersecting) {
      visible = false
      callback(false)
    }
  }
  const mutationObserverCallback = () => {
    // 如果已存在 observer，先断开连接
    if (intersectionObserver) {
      intersectionObserver.disconnect()
    }

    // 查找目标元素
    const noteContainer = $(selector)
    if (!noteContainer) {
      return
    }

    // 创建新的 IntersectionObserver 实例
    intersectionObserver = new IntersectionObserver(
      options.immediate ? intersectionObserverCallback : debounce(intersectionObserverCallback),
      {
        // 当元素进入视口时触发
        threshold: 0.01
      }
    )

    // 开始观察元素可见性
    intersectionObserver.observe(noteContainer)
  }
  // 创建 MutationObserver 实例
  const observer = new MutationObserver(
    options.immediate ? mutationObserverCallback : debounce(mutationObserverCallback)
  )

  // 开始观察文档变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  return () => {
    observer.disconnect()
    intersectionObserver?.disconnect()
  }
}

export const watchElementVisibility2 = (
  selector: string | HTMLElement,
  callback: (isShow: boolean) => void
) => {
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
    console.log('mutationObserver 12 00 1')
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector
    if (el) {
      intersectionObserver.observe(el)
    }
  })
  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  })

  return () => {
    intersectionObserver.disconnect()
    mutationObserver.disconnect()
  }
}
