import { afterEach, describe, expect, it } from "vitest"
import { effectScope, nextTick } from "vue"
import { useTheme } from "@/hooks/useTheme"

describe("主题根节点样式", () => {
  afterEach(() => {
    document.documentElement.className = ""
  })

  it("切换主题只替换主题类，保留其他功能类", async () => {
    const scope = effectScope()
    const theme = useTheme()
    document.documentElement.className = "accessibility-mode dark-blue"
    scope.run(() => theme.initTheme())
    theme.setTheme("dark")
    await nextTick()
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("dark-blue")).toBe(false)
    expect(document.documentElement.classList.contains("accessibility-mode")).toBe(true)
    scope.stop()
  })
})
