import { describe, expect, it } from "vitest"
import { formatDateTime } from "@/utils"

describe("格式化日期时间", () => {
  it("支持零时间戳", () => {
    expect(formatDateTime(0)).toBe(formatDateTime(new Date(0)))
    expect(formatDateTime(0)).not.toBe("N/A")
  })

  it("缺失或无效时间统一显示占位文本", () => {
    expect(formatDateTime("")).toBe("N/A")
    expect(formatDateTime("not a date")).toBe("N/A")
    expect(formatDateTime(Number.NaN)).toBe("N/A")
    expect(formatDateTime(new Date("invalid"))).toBe("N/A")
  })
})
