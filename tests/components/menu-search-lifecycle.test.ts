import { afterEach, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { ref } from "vue"
import SearchModal from "@/components/SearchMenu/SearchModal.vue"
const { push, error } = vi.hoisted(() => ({ push: vi.fn(), error: vi.fn() }))
vi.mock("vue-router", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/hooks/useDevice", () => ({ useDevice: () => ({ isMobile: ref(false) }) }))
vi.mock("@/store/modules/permission", () => ({
  usePermissionStore: () => ({ routes: [{ name: "home", path: "/home", meta: { title: "Home" } }] })
}))
vi.mock("element-plus", () => ({ ElMessage: { error, warning: vi.fn() }, ElScrollbar: {} }))
const create = () =>
  mount(SearchModal, {
    props: { modelValue: true },
    global: { stubs: { ElDialog: { template: "<div><slot /></div>" }, SearchResult: true, SearchFooter: true } }
  })
afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})
it("忽略空白，并在关闭时取消防抖搜索", async () => {
  vi.useFakeTimers()
  const wrapper = create()
  const vm = wrapper.vm as any
  vm.keyword = "   "
  vm.handleSearch()
  await vi.advanceTimersByTimeAsync(500)
  expect(vm.resultList).toEqual([])
  vm.keyword = "home"
  vm.handleSearch()
  vm.handleClose()
  await vi.advanceTimersByTimeAsync(600)
  expect(vm.resultList).toEqual([])
  wrapper.unmount()
})
it("异步导航失败时显示错误，保留搜索上下文", async () => {
  const wrapper = create()
  const vm = wrapper.vm as any
  vm.resultList = [{ name: "home", path: "/home" }]
  vm.activeRouteName = "home"
  push.mockRejectedValueOnce(new Error("missing parameter"))
  await vm.handleEnter()
  expect(error).toHaveBeenCalledOnce()
  expect(wrapper.emitted("update:modelValue")).toBeUndefined()
  vm.activeRouteName = "missing"
  expect(() => vm.handleUp()).not.toThrow()
  wrapper.unmount()
})
