import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get, merge } from "lodash-es"
import { getToken } from "./cache/cookies"

const httpStatusMessage: Record<number, string> = {
  400: "请求参数错误（400）",
  401: "登录状态已失效，请重新登录",
  403: "拒绝访问，没有操作权限（403）",
  404: "接口不存在或后端地址配置错误（404）",
  408: "请求超时（408）",
  500: "服务器内部错误（500）",
  501: "服务未实现（501）",
  502: "网关错误（502）",
  503: "服务不可用（503）",
  504: "网关超时（504）",
  505: "HTTP 版本不受支持（505）"
}

const isReadableMessage = (value: unknown): value is string => {
  if (typeof value !== "string") return false
  const text = value.trim()
  return text.length > 0 && !text.startsWith("<!DOCTYPE") && !text.includes("<html")
}

const resolveRequestErrorMessage = (error: any) => {
  const data = get(error, "response.data")
  const status = Number(get(error, "response.status"))
  const backendMessage =
    get(data, "message") ||
    get(data, "msg") ||
    get(data, "errormessage") ||
    get(data, "errorMessage") ||
    get(data, "error")

  if (isReadableMessage(data)) return data.trim()
  if (isReadableMessage(backendMessage)) return backendMessage.trim()
  if (status && httpStatusMessage[status]) return httpStatusMessage[status]
  if (status) return `请求失败（${status}）`
  if (error?.code === "ERR_NETWORK") return "无法连接后端服务，请检查接口地址或后端是否启动"
  if (isReadableMessage(error?.message)) return error.message
  return "请求失败"
}

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStoreHook().logout()
  location.reload()
}

/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      // apiData 是 api 返回的数据
      const apiData = response.data
      // 二进制数据则直接返回
      const responseType = response.request?.responseType

      if (responseType === "blob" || responseType === "arraybuffer") return apiData
      // 这个 code 是和后端约定的业务 code
      const code = apiData.code
      // 如果没有 code, 代表这不是项目后端开发的 api
      if (code === undefined) {
        ElMessage.error("非本系统的接口")
        return Promise.reject(new Error("非本系统的接口"))
      }
      switch (code) {
        case 0:
          // 本系统采用 code === 0 来表示没有业务错误
          return apiData
        case 401:
          // Token 过期时
          return logout()
        default:
          // 不是正确的 code
          ElMessage.error(apiData.message || "Error")
          const error = new Error("Error") as Error & {
            data?: unknown
            response?: { data?: unknown }
          }
          error.data = apiData
          error.response = { data: apiData }
          return Promise.reject(error)
      }
    },
    (error) => {
      // status 是 HTTP 状态码
      const status = get(error, "response.status")
      error.message = resolveRequestErrorMessage(error)
      if (status === 401) {
        // Token 过期时
        logout()
      } else {
        ElMessage.error(error.message)
      }
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const token = getToken()
    const defaultConfig = {
      headers: {
        // 携带 Token
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json"
      },
      timeout: 5000000,
      baseURL: import.meta.env.VITE_BASE_API,
      data: {}
    }
    // 将默认配置 defaultConfig 和传入的自定义配置 config 进行合并成为 mergeConfig
    const mergeConfig = merge(defaultConfig, config)
    return service(mergeConfig)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
