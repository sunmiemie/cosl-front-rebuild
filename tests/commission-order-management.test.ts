import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("委托单管理导出与详情", () => {
  const manage = read("src/views/ordermanage/manage/index.vue")
  const summary = read("src/views/ordermanage/summary/index.vue")

  it("在委托单管理提供跨页选择，并在未选择时提交完整筛选条件", () => {
    expect(manage).toContain(':reserve-selection="true"')
    expect(manage).toContain('row-key="id"')
    expect(manage).toContain("selectedOrderIds")
    expect(manage).toContain("已跨页选择")
    expect(manage).toContain("未选择时导出当前全部筛选结果")
    expect(manage).toContain('url: "data/commission-order/export"')
    expect(manage).toContain('method: "post"')
    expect(manage).toContain("updatedStart")
    expect(manage).toContain("updatedEnd")
  })

  it("关联汇总页不再保留批量导出和勾选逻辑", () => {
    expect(summary).not.toContain("批量导出")
    expect(summary).not.toContain('type="selection"')
    expect(summary).not.toContain("commission-board-relation/export")
  })

  it("详情直接使用精确 relatedProjects 并允许长文本完整换行", () => {
    expect(manage).toContain("res.data?.relatedProjects || []")
    expect(manage).not.toContain("loadRelatedProjects")
    expect(manage).not.toContain("getRelatedProjectsByCommissionNo")
    expect(manage).toContain("overflow-wrap: anywhere")
    expect(manage).toContain("word-break: break-word")
    expect(manage).toContain("displayDetailValue")
  })
})
