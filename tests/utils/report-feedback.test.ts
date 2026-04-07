import { describe, expect, it } from "vitest"
import { stripHeavyPayload } from "@/utils/report-feedback"

describe("审核反馈上传载荷", () => {
  it("过滤数组内的 base64 和大字符串，保留普通业务字段且不修改原始数据", () => {
    const source = {
      notes: ["保留说明", "data:image/png;base64,AAA", "x".repeat(2049), { text: "审核意见", image: "large" }]
    }
    expect(stripHeavyPayload(source)).toEqual({ notes: ["保留说明", { text: "审核意见" }] })
    expect(source.notes).toHaveLength(4)
  })

  it("保留嵌套数组中的数字、布尔值和空值", () => {
    expect(stripHeavyPayload([[null, false, 0, "说明"], { values: ["data:application/pdf;base64,AAA", 1] }])).toEqual([
      [null, false, 0, "说明"],
      { values: [1] }
    ])
  })
})
