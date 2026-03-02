/** 统一处理 localStorage */

import CacheKey from "@/constants/cache-key"
import { type SidebarOpened, type SidebarClosed } from "@/constants/app-key"
import { type ThemeName } from "@/hooks/useTheme"
import { type TagView } from "@/store/modules/tags-view"
import { type LayoutSettings } from "@/config/layouts"

/** 旧版本或手工修改留下的无效缓存不应阻止页面初始化。 */
const readJsonCache = (key: string): unknown => {
  try {
    const json = localStorage.getItem(key)
    return json ? JSON.parse(json) : null
  } catch {
    return null
  }
}

//#region 系统布局配置
export const getConfigLayout = () => {
  const value = readJsonCache(CacheKey.CONFIG_LAYOUT)
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as LayoutSettings) : null
}
export const setConfigLayout = (settings: LayoutSettings) => {
  localStorage.setItem(CacheKey.CONFIG_LAYOUT, JSON.stringify(settings))
}
export const removeConfigLayout = () => {
  localStorage.removeItem(CacheKey.CONFIG_LAYOUT)
}
//#endregion

//#region 侧边栏状态
export const getSidebarStatus = () => {
  return localStorage.getItem(CacheKey.SIDEBAR_STATUS)
}
export const setSidebarStatus = (sidebarStatus: SidebarOpened | SidebarClosed) => {
  localStorage.setItem(CacheKey.SIDEBAR_STATUS, sidebarStatus)
}
//#endregion

//#region 正在应用的主题名称
export const getActiveThemeName = () => {
  return localStorage.getItem(CacheKey.ACTIVE_THEME_NAME) as ThemeName | null
}
export const setActiveThemeName = (themeName: ThemeName) => {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, themeName)
}
//#endregion

//#region 标签栏
export const getVisitedViews = () => {
  const value = readJsonCache(CacheKey.VISITED_VIEWS)
  return Array.isArray(value)
    ? value.filter(
        (view): view is TagView => view !== null && typeof view === "object" && typeof view.path === "string"
      )
    : []
}
export const setVisitedViews = (views: TagView[]) => {
  const cacheViews = views.map((view) => {
    // 删除不必要的属性，防止 JSON.stringify 处理到循环引用
    const copy = { ...view }
    delete copy.matched
    delete copy.redirectedFrom
    return copy
  })
  localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify(cacheViews))
}
export const getCachedViews = () => {
  const value = readJsonCache(CacheKey.CACHED_VIEWS)
  return Array.isArray(value) ? value.filter((view): view is string => typeof view === "string") : []
}
export const setCachedViews = (views: string[]) => {
  localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(views))
}
//#endregion
