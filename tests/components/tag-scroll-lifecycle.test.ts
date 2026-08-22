import { expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import ScrollPane from "@/layouts/components/TagsView/ScrollPane.vue"
vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/a" }), RouterLink: {} }))
vi.mock("@/store/modules/settings", () => ({ useSettingsStore: () => ({ showScreenfull: false }) }))
vi.mock("@/hooks/useRouteListener", () => ({ useRouteListener: () => ({ listenerRouteChange: vi.fn() }) }))
it("卸载后的路由回调不访问已经清空的滚动区域", () => {
  const wrapper = mount(ScrollPane, { props: { tagRefs: [{ $props: { to: { path: "/a" } }, $el: {} }] as any } })
  const vm = wrapper.vm as any
  wrapper.unmount()
  expect(() => vm.moveTo()).not.toThrow()
  expect(() => vm.scrollTo("right")).not.toThrow()
})
it("横向触控板滚动尊重方向，零偏移不移动", () => {
  const wrapper = mount(ScrollPane, { props: { tagRefs: [] } })
  const vm = wrapper.vm as any
  const setScrollLeft = vi.fn()
  vm.scrollbarRef = { wrapRef: { clientWidth: 100 }, setScrollLeft }
  vm.scrollbarContentRef = { clientWidth: 1000 }
  vm.scroll({ scrollLeft: 400 })
  vm.wheelScroll({ deltaX: -5, deltaY: 0 })
  expect(setScrollLeft).toHaveBeenLastCalledWith(200)
  vm.wheelScroll({ deltaX: 0, deltaY: 0 })
  expect(setScrollLeft).toHaveBeenCalledOnce()
  wrapper.unmount()
})
