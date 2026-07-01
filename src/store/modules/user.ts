import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import { useTaskCenterStore } from "./task-center"
import { getToken, removeToken, setToken } from "@/utils/cache/cookies"
import { resetRouter } from "@/router"
import { loginApi, getUserInfoApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
import routeSettings from "@/config/route"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const permissionCodes = ref<string[]>([])
  const username = ref<string>("")
  const nickName = ref<string>("")
  const userid = ref<number>()
  let sessionGeneration = 0
  const taskCenterStore = useTaskCenterStore()

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ username, password }: LoginRequestData) => {
    const { data } = await loginApi({ username, password })
    setToken(data.token)
    token.value = data.token
  }
  /** 获取用户详情 */
  const getInfo = async () => {
    const generation = sessionGeneration
    const { data } = await getUserInfoApi()
    if (generation !== sessionGeneration) return
    username.value = data.username
    userid.value = data.id
    // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
    roles.value = data.roles?.length > 0 ? data.roles : routeSettings.defaultRoles
    permissionCodes.value = data.permissionCodes || []
    nickName.value = data.nickName
  }
  /** 清理当前会话，防止退出后的旧用户请求回写状态。 */
  const clearIdentity = () => {
    sessionGeneration += 1
    username.value = ""
    nickName.value = ""
    userid.value = undefined
    taskCenterStore.reset()
  }
  /** 登出 */
  const logout = () => {
    clearIdentity()
    removeToken()
    token.value = ""
    roles.value = []
    permissionCodes.value = []
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    clearIdentity()
    removeToken()
    token.value = ""
    roles.value = []
    permissionCodes.value = []
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { userid, token, roles, permissionCodes, nickName, username, login, getInfo, logout, resetToken }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
