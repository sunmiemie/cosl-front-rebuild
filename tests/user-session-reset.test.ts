import { beforeEach, expect, it, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useUserStore } from "@/store/modules/user"
const { getInfo, resetTasks } = vi.hoisted(() => ({ getInfo: vi.fn(), resetTasks: vi.fn() }))
vi.mock("@/api/login", () => ({ loginApi: vi.fn(), getUserInfoApi: getInfo }))
vi.mock("@/router", () => ({ resetRouter: vi.fn() }))
vi.mock("@/utils/cache/cookies", () => ({ getToken: () => "token", setToken: vi.fn(), removeToken: vi.fn() }))
vi.mock("@/store/modules/tags-view", () => ({
  useTagsViewStore: () => ({ delAllVisitedViews: vi.fn(), delAllCachedViews: vi.fn() })
}))
vi.mock("@/store/modules/settings", () => ({ useSettingsStore: () => ({ cacheTagsView: false }) }))
vi.mock("@/store/modules/task-center", () => ({ useTaskCenterStore: () => ({ reset: resetTasks }) }))
beforeEach(() => {
  setActivePinia(createPinia())
  getInfo.mockReset()
  resetTasks.mockClear()
})
it("退出时清理显示身份及任务，旧详情请求不能恢复身份", async () => {
  const store = useUserStore()
  store.username = "previous"
  store.nickName = "旧用户"
  store.userid = 10
  let finish!: (value: any) => void
  getInfo.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  const pending = store.getInfo()
  store.logout()
  finish({ data: { id: 10, username: "previous", nickName: "旧用户", roles: ["admin"] } })
  await pending
  expect(store.username).toBe("")
  expect(store.userid).toBeUndefined()
  expect(store.roles).toEqual([])
  expect(resetTasks).toHaveBeenCalledOnce()
})
