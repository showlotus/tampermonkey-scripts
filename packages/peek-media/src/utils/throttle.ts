/**
 * 创建一个节流函数
 * @param callback 需要节流的函数
 * @param fps 每秒执行的次数
 * @returns 节流后的函数
 */
export function createThrottledFunction<T extends (...args: any[]) => void>(
  callback: T,
  fps: number = 30
): T {
  let rafId: number | null = null
  let lastExecuted = 0
  const interval = 1000 / fps

  // 创建一个包装函数，保持原函数的类型
  const throttled = function (this: any, ...args: Parameters<T>) {
    const now = performance.now()

    // 如果距离上次执行的时间小于间隔，使用 requestAnimationFrame 调度
    if (now - lastExecuted < interval) {
      // 如果已经有待处理的更新，不需要再安排新的
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          lastExecuted = performance.now()
          rafId = null
          callback.apply(this, args)
        })
      }
      return
    }

    // 如果有待处理的更新，取消它
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    // 直接执行
    lastExecuted = now
    callback.apply(this, args)
  } as T

  // 添加清理方法
  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  // 将清理方法附加到函数上
  ;(throttled as any).cleanup = cleanup

  return throttled
}
