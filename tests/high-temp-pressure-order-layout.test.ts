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

  it("列表数据过宽时由表格横向滚动且操作列固定在右侧", () => {
    expect(listTable).toContain('class="high-pressure-order-table"')
    expect(listTable).toContain('label="操作" width="176" align="center" fixed="right"')
    expect(listTable).toContain('height="100%"')
  })

  it("数据列使用最小宽度保持单行，操作列使用固定宽度", () => {
    const columnTags = listTable.match(/<el-table-column[^>]*>/g) ?? []
    const dataColumns = columnTags.filter((tag) => !tag.includes('label="操作"'))
    const operationColumn = columnTags.find((tag) => tag.includes('label="操作"')) ?? ""

    expect(columnTags.length).toBeGreaterThan(0)
    expect(dataColumns.every((tag) => /\smin-width="/.test(tag))).toBe(true)
    expect(operationColumn).toContain('width="176"')
    expect(operationColumn).toContain('fixed="right"')
  })
})
