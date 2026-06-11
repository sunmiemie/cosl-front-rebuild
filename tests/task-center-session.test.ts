import { beforeEach, expect, it, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useTaskCenterStore } from "@/store/modules/task-center"
const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock("@/api/task-center", () => ({ getPendingTaskCenterApi: request }))
beforeEach(() => {
  request.mockReset()
  setActivePinia(createPinia())
})
it("重置后忽略之前发出的任务响应", async () => {
  let finish!: (value: any) => void
  request.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  const store = useTaskCenterStore()
  const pending = store.refresh()
  store.reset()
  finish({ code: 0, data: { list: [{ id: "old" }], total: 1 } })
  await pending
  expect(store.tasks).toEqual([])
  expect(store.loaded).toBe(false)
})
it("不同 Pinia 实例分别刷新并维护各自数据", async () => {
  const first = useTaskCenterStore(createPinia())
  const second = useTaskCenterStore(createPinia())
  request.mockResolvedValueOnce({ code: 0, data: { list: [], total: 1 } })
  request.mockResolvedValueOnce({ code: 0, data: { list: [], total: 2 } })
  await Promise.all([first.refresh(), second.refresh()])
  expect(first.total).toBe(1)
  expect(second.total).toBe(2)
})
it.each(["resolve", "reject"] as const)("重置立即启动新会话，旧请求 %s 不影响新队列", async (outcome) => {
  const pending: { resolve: (value: any) => void; reject: (reason: Error) => void }[] = []
  request.mockImplementation(() => new Promise((resolve, reject) => pending.push({ resolve, reject })))
  const store = useTaskCenterStore()
  const oldRefresh = store.refresh()
  const oldQueuedRefresh = store.refresh()
  store.reset()
  const currentRefresh = store.refresh()
  expect(request).toHaveBeenCalledTimes(2)

  if (outcome === "resolve") pending[0].resolve({ code: 0, data: { list: [{ id: "old" }], total: 99 } })
  else pending[0].reject(new Error("旧会话失败"))
  await Promise.all([oldRefresh, oldQueuedRefresh])
  expect(request).toHaveBeenCalledTimes(2)
  expect(store.loading).toBe(true)
  expect(store.loaded).toBe(false)
  expect(store.errorMessage).toBe("")
  expect(store.total).toBe(0)

  // 旧 finally 不能清空新 Promise；新请求期间的刷新应排队，而不是并发执行。
  const currentQueuedRefresh = store.refresh()
  expect(request).toHaveBeenCalledTimes(2)
  pending[1].resolve({ code: 0, data: { list: [], total: 2 } })
  await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(3))
  pending[2].resolve({ code: 0, data: { list: [], total: 3 } })
  await Promise.all([currentRefresh, currentQueuedRefresh])
  expect(store.total).toBe(3)
  expect(store.loading).toBe(false)
})
