import { type LoadingOptions, ElLoading } from "element-plus"

const defaultOptions = {
  lock: true,
  text: "加载中..."
}

interface LoadingInstance {
  close: () => void
}

/** Element Plus 的全屏服务会返回同一个实例，不同包装函数也需要共享计数。 */
const pendingTasks = new WeakMap<LoadingInstance, number>()

interface UseFullscreenLoading {
  <T extends (...args: any[]) => ReturnType<T>>(
    fn: T,
    options?: LoadingOptions
  ): (...args: Parameters<T>) => Promise<ReturnType<T>>
}

/**
 * 传入一个函数 fn，在它执行周期内，加上「全屏」loading
 * @param fn 要执行的函数
 * @param options LoadingOptions
 * @returns 返回一个新的函数，该函数返回一个 Promise
 */
export const useFullscreenLoading: UseFullscreenLoading = (fn, options = {}) => {
  return async (...args) => {
    const loadingInstance = ElLoading.service({ ...defaultOptions, ...options })
    pendingTasks.set(loadingInstance, (pendingTasks.get(loadingInstance) ?? 0) + 1)
    try {
      return await fn(...args)
    } finally {
      const pendingCount = (pendingTasks.get(loadingInstance) ?? 1) - 1
      if (pendingCount > 0) {
        pendingTasks.set(loadingInstance, pendingCount)
      } else {
        pendingTasks.delete(loadingInstance)
        loadingInstance.close()
      }
    }
  }
}
