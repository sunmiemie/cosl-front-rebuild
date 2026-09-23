import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { getPendingTaskCenterApi } from "@/api/task-center"
import { useTaskCenterStore } from "@/store/modules/task-center"
import store from "@/store"

vi.mock("@/api/task-center", () => ({
  getPendingTaskCenterApi: vi.fn()
}))

const apiMock = vi.mocked(getPendingTaskCenterApi)
const root = resolve(__dirname, "..")

const response = (id: string) => ({
  code: 0,
  data: {
    total: 1,
    list: [
      {
        id,
        kind: "order-publish",
        group: "工单发布",
        title: id,
        summary: "",
        statusText: "待发布",
        targetRoute: "/testmanage/circuit-module-inspection",
        query: {},
        permissionCode: "TEST_ORDER_CREATE_HIGH_TEMP_PRESSURE",
        createdAt: "2026-09-23T00:00:00"
      }
    ]
  }
})

describe("任务中心刷新时序", () => {
  beforeEach(() => {
    apiMock.mockReset()
    useTaskCenterStore(store).reset()
  })

  it("请求进行中收到手动刷新时，会在旧请求结束后补跑一次", async () => {
    let finishFirstRequest!: (value: ReturnType<typeof response>) => void
    apiMock
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirstRequest = resolve
          })
      )
      .mockResolvedValueOnce(response("new-order"))

    const taskCenterStore = useTaskCenterStore(store)
    const firstRefresh = taskCenterStore.refresh(true)
    const queuedRefresh = taskCenterStore.refresh()

    expect(apiMock).toHaveBeenCalledTimes(1)
    finishFirstRequest(response("old-order"))
    await Promise.all([firstRefresh, queuedRefresh])

    expect(apiMock).toHaveBeenCalledTimes(2)
    expect(taskCenterStore.tasks[0]?.id).toBe("new-order")
  })

  it("申请单同步成功后主动刷新任务中心", () => {
    const page = readFileSync(resolve(root, "src/views/testmanage/circuit-module-inspection/index.vue"), "utf8")

    expect(page).toContain("if (summary.processed > 0)")
    expect(page).toContain("await taskCenterStore.refresh(true)")
  })
})
