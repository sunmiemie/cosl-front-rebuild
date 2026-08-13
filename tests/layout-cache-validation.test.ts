import { beforeEach, expect, it } from "vitest"
import CacheKey from "@/constants/cache-key"
import { getActiveThemeName, getConfigLayout } from "@/utils/cache/local-storage"
beforeEach(() => localStorage.clear())
it("恢复合法布局字段，忽略类型错误及未注册的布局", () => {
  localStorage.setItem(
    CacheKey.CONFIG_LAYOUT,
    JSON.stringify({ layoutMode: "missing", showLogo: "false", showFooter: false, showWatermark: null })
  )
  expect(getConfigLayout()).toEqual({ showFooter: false })
  localStorage.setItem(CacheKey.CONFIG_LAYOUT, JSON.stringify({ layoutMode: "top", showLogo: true }))
  expect(getConfigLayout()).toEqual({ layoutMode: "top", showLogo: true })
})
it("无效缓存主题不会传给 classList.add", () => {
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, "dark invalid")
  expect(getActiveThemeName()).toBeNull()
  localStorage.setItem(CacheKey.ACTIVE_THEME_NAME, "dark-blue")
  expect(getActiveThemeName()).toBe("dark-blue")
})
