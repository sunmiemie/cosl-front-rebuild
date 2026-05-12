import { shallowMount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import Notify from "@/components/Notify/index.vue"
import NotifyList from "@/components/Notify/NotifyList.vue"

const taskStore = {
  total: 0,
  loading: false,
  groupedTasks: [{ key: "all", label: "全部", tasks: [] }],
  lastUpdatedAt: "",
  errorMessage: "",
  startPolling: vi.fn(),
  stopPolling: vi.fn(),
  refresh: vi.fn()
}

vi.mock("@/store/modules/task-center", () => ({
  useTaskCenterStoreHook: () => taskStore
}))

describe("Notify", () => {
  it("正常渲染", () => {
    const wrapper = shallowMount(Notify)
    expect(wrapper.classes("notify")).toBe(true)
  })
})

describe("NotifyList", () => {
  it("List 长度为 0", () => {
    const wrapper = shallowMount(NotifyList, {
      props: {
        list: []
      }
    })
    expect(wrapper.findComponent({ name: "TaskList" }).exists()).toBe(true)
  })
  it("List 长度不为 0", () => {
    const wrapper = shallowMount(NotifyList, {
      props: {
        list: [
          {
            id: "task-1",
            kind: "report-review",
            group: "报告审核",
            title: "测试任务",
            summary: "摘要",
            statusText: "待审核",
            targetRoute: "/datamanage/report/checkReport",
            query: {},
            permissionCode: "REPORT_REVIEW_BASIC",
            createdAt: "2026-05-11T00:00:00"
          }
        ]
      }
    })
    expect(wrapper.findComponent({ name: "TaskList" }).props("tasks")).toHaveLength(1)
  })
})
