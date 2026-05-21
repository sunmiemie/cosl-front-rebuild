import { afterEach, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Screenfull from "@/components/Screenfull/index.vue"
const { screenfull } = vi.hoisted(() => ({
  screenfull: { isEnabled: true, isFullscreen: false, toggle: vi.fn(), on: vi.fn(), off: vi.fn() }
}))
vi.mock("screenfull", () => ({ default: screenfull }))
vi.mock("element-plus", () => ({ ElMessage: { warning: vi.fn() } }))
afterEach(() => {
  document.body.className = ""
  vi.clearAllMocks()
})
it("内容区切换和卸载保留其他 body 样式", () => {
  document.body.className = "accessibility"
  const wrapper = mount(Screenfull, { props: { content: true } })
  ;(wrapper.vm as any).handleContentLargeClick()
  expect(document.body.classList.contains("accessibility")).toBe(true)
  expect(document.body.classList.contains("content-large")).toBe(true)
  wrapper.unmount()
  expect(document.body.className).toBe("accessibility")
})
it("浏览器拒绝全屏后撤回内容区隐藏样式", async () => {
  screenfull.toggle.mockRejectedValueOnce(new Error("denied"))
  const wrapper = mount(Screenfull)
  await (wrapper.vm as any).handleContentFullClick()
  expect(document.body.classList.contains("content-full")).toBe(false)
  wrapper.unmount()
})
