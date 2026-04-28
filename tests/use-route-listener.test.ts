import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import { defineComponent } from "vue"
import { type RouteLocationNormalized } from "vue-router"
import { setRouteChange, useRouteListener } from "@/hooks/useRouteListener"

describe("路由变化订阅", () => {
  it("事件处理过程中新增的立即订阅收到当前路由", () => {
    const oldRoute = { path: "/old" } as RouteLocationNormalized
    const newRoute = { path: "/new" } as RouteLocationNormalized
    setRouteChange(oldRoute)
    const paths: string[] = []
    const wrapper = mount(
      defineComponent({
        setup() {
          const { listenerRouteChange } = useRouteListener()
          listenerRouteChange(() => {
            listenerRouteChange((route) => paths.push(route.path), true)
          })
          return () => null
        }
      })
    )
    setRouteChange(newRoute)
    expect(paths).toEqual(["/new"])
    wrapper.unmount()
    setRouteChange(oldRoute)
    expect(paths).toEqual(["/new"])
  })
})
