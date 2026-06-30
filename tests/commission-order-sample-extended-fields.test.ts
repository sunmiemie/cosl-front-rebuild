import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("委托单样品扩展字段", () => {
  it("委托单数据管理详情和编辑表格展示批次号、SN、物料号、测试内容", () => {
    const content = read("src/views/ordermanage/manage/index.vue")

    for (const label of ["批次号", "SN号", "物料号", "测试内容"]) {
      expect(content).toContain(label)
    }
    for (const field of ["batch_no", "sn", "material_no", "test_content"]) {
      expect(content).toContain(field)
    }
  })

  it("委托单汇总详情展示样品扩展字段", () => {
    const content = read("src/views/ordermanage/summary/index.vue")

    expect(content).toContain("sampleDetailFields")
    for (const label of ["批次号", "SN号", "物料号", "测试内容"]) {
      expect(content).toContain(label)
    }
  })

  it("工程师助手委托单样品类型包含扩展字段", () => {
    const content = read("src/api/engineer-assistant/types.ts")

    for (const field of ["batchNo", "sn", "materialNo", "testContent"]) {
      expect(content).toContain(field)
    }
  })
})
