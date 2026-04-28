import { onBeforeUnmount } from "vue"
import mitt, { type Handler } from "mitt"
import { type RouteLocationNormalized } from "vue-router"

/** 回调函数的类型 */
type Callback = (route: RouteLocationNormalized) => void

const emitter = mitt()
const key = Symbol("ROUTE_CHANGE")
let latestRoute: RouteLocationNormalized

/** 设置最新的路由信息，触发路由变化事件 */
export const setRouteChange = (to: RouteLocationNormalized) => {
  // 先更新缓存，保证事件处理过程中新增的立即订阅拿到当前路由。
  latestRoute = to
  emitter.emit(key, to)
}

/** 单独监听路由会浪费渲染性能，使用发布订阅模式去进行分发管理 */
export function useRouteListener() {
  /** 回调函数集合 */
  const callbackList: Callback[] = []

  /** 监听路由变化（可以选择立即执行） */
  const listenerRouteChange = (callback: Callback, immediate = false) => {
    // 缓存回调函数
    callbackList.push(callback)
    // 监听事件
    emitter.on(key, callback as Handler)
    // 可以选择立即执行一次回调函数
    immediate && latestRoute && callback(latestRoute)
  }

  /** 移除路由变化事件监听器 */
  const removeRouteListener = (callback: Callback) => {
    emitter.off(key, callback as Handler)
  }

  /** 组件销毁前移除监听器 */
  onBeforeUnmount(() => {
    for (let i = 0; i < callbackList.length; i++) {
      removeRouteListener(callbackList[i])
    }
  })

  return { listenerRouteChange, removeRouteListener }
}
