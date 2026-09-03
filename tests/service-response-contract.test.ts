import { afterEach, expect, it, vi } from "vitest"
import { request } from "@/utils/service"
const { error, logout } = vi.hoisted(() => ({ error: vi.fn(), logout: vi.fn() }))
vi.mock("element-plus", () => ({ ElMessage: { error } }))
vi.mock("@/store/modules/user", () => ({ useUserStoreHook: () => ({ logout }) }))
vi.mock("@/utils/cache/cookies", () => ({ getToken: () => "token" }))
const adapter = (data: any) => async (config: any) => ({ data, config, status: 200, statusText: "OK", headers: {} })
afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})
it("业务错误遵守 silentError，同时仍向调用方拒绝", async () => {
  await expect(request({ adapter: adapter({ code: 400, message: "缺少数据" }), silentError: true })).rejects.toThrow(
    "缺少数据"
  )
  expect(error).not.toHaveBeenCalled()
  await expect(request({ adapter: adapter(null) })).rejects.toThrow("非本系统")
  expect(error).toHaveBeenCalledOnce()
})
it("业务 401 不会让失败请求解析成成功的 undefined", async () => {
  const reload = vi.fn()
  vi.stubGlobal("location", { reload })
  await expect(request({ adapter: adapter({ code: 401 }) })).rejects.toThrow("登录状态")
  expect(logout).toHaveBeenCalledOnce()
  expect(reload).toHaveBeenCalledOnce()
})
it("不依赖 XHR 对象即可返回配置为二进制的响应", async () => {
  const data = new ArrayBuffer(4)
  expect(await request({ adapter: adapter(data), responseType: "arraybuffer" })).toBe(data)
})
