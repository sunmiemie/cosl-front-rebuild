import { beforeEach, describe, expect, it } from "vitest"
import CacheKey from "@/constants/cache-key"
import { getCachedViews, getConfigLayout, getVisitedViews, setVisitedViews } from "@/utils/cache/local-storage"
import { type TagView } from "@/store/modules/tags-view"

describe("布局和标签缓存恢复", () => {
  beforeEach(() => localStorage.clear())

  it("损坏的 JSON 不阻止页面启动", () => {
    for (const key of [CacheKey.CONFIG_LAYOUT, CacheKey.VISITED_VIEWS, CacheKey.CACHED_VIEWS]) {
      localStorage.setItem(key, "{broken")
    }
    expect(getConfigLayout()).toBeNull()
    expect(getVisitedViews()).toEqual([])
    expect(getCachedViews()).toEqual([])
  })

  it("忽略类型不符的缓存，同时保留有效标签", () => {
    localStorage.setItem(CacheKey.CONFIG_LAYOUT, "[]")
    localStorage.setItem(CacheKey.VISITED_VIEWS, JSON.stringify([null, 2, { path: "/valid" }]))
    localStorage.setItem(CacheKey.CACHED_VIEWS, JSON.stringify(["Valid", null, 2]))
    expect(getConfigLayout()).toBeNull()
    expect(getVisitedViews()).toEqual([{ path: "/valid" }])
    expect(getCachedViews()).toEqual(["Valid"])
    localStorage.setItem(CacheKey.VISITED_VIEWS, "{}")
    expect(getVisitedViews()).toEqual([])
  })

  it("保存标签时只清理副本，保留内存中的路由匹配信息", () => {
    const view: TagView = { path: "/example", matched: [], redirectedFrom: undefined }
    setVisitedViews([view])
    expect(view).toHaveProperty("matched")
    expect(view).toHaveProperty("redirectedFrom")
    expect(getVisitedViews()).toEqual([{ path: "/example" }])
  })
})
