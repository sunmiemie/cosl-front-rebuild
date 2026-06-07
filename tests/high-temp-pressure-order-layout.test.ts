import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("高温高压井工单列表布局", () => {
  const content = read("src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue")
  const tableMatch = content.match(/<div class="table-wrapper">([\s\S]*?)<div class="pager-wrapper">/)
  const listTable = tableMatch?.[1] ?? ""

  it("列表表格不展示项目名称列", () => {
    expect(listTable).not.toContain('prop="project_name"')
    expect(listTable).not.toContain('label="项目名称"')
  })

  it("列表表格不产生横向拖动条", () => {
    expect(listTable).toContain('class="high-pressure-order-table"')
    expect(listTable).not.toContain('fixed="right"')
    expect(content).toContain("overflow-x: hidden")
  })

  it("列表列宽使用弹性最小宽度铺满表格", () => {
    const columnTags = listTable.match(/<el-table-column[^>]*>/g) ?? []

    expect(columnTags.length).toBeGreaterThan(0)
    expect(columnTags.every((tag) => !/\swidth="/.test(tag))).toBe(true)
    expect(columnTags.every((tag) => /\smin-width="/.test(tag))).toBe(true)
  })
})
