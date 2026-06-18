import { expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import TaskPanel from "@/components/TaskCenter/TaskPanel.vue"
const { store } = vi.hoisted(() => ({
  store: {
    groupedTasks: [{ key: "all", label: "全部", tasks: [] }],
    lastUpdatedAt: "",
    errorMessage: "连接失败",
    total: 0,
    startPolling: vi.fn(),
    stopPolling: vi.fn()
  }
}))
vi.mock("@/store/modules/task-center", () => ({ useTaskCenterStoreHook: () => store }))
vi.mock("vue-router", () => ({ useRouter: () => ({ push: vi.fn() }) }))
it("首次加载失败时也显示错误，而不要求曾成功同步", () => {
  const wrapper = mount(TaskPanel, { global: { stubs: { TaskList: true } } })
  expect(wrapper.text()).toContain("连接失败")
  expect(wrapper.text()).not.toContain("最近同步")
  wrapper.unmount()
})
