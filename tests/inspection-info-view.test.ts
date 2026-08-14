import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const content = readFileSync(resolve(root, "src/views/inspectionmanage/info-view/index.vue"), "utf8")

describe("巡检记录查看页面", () => {
  it("手动刷新小助手巡检记录时强制刷新并触发后端落库", () => {
    expect(content).toContain("loadAssistantResults(true, true)")
    expect(content).toContain('forceRefresh ? { refresh: "1" } : undefined')
  })

  it("小助手刷新返回空时不清空页面已有巡检记录", () => {
    expect(content).toContain(
      "const shouldReplaceResults = nextResults.length > 0 || assistantResults.value.length === 0"
    )
    expect(content).toContain("if (shouldReplaceResults) {")
    expect(content).toContain("if (!assistantResults.value.length) {")
  })

  it("支持导出当前设备类型和月份的巡检记录表格", () => {
    expect(content).toContain("导出表格")
    expect(content).toContain("buildInspectionRecordExportRows(")
    expect(content).toContain("buildInspectionRecordExportRows([], currentMonthAssistantResults.value)")
    expect(content).toContain("currentMonthAssistantResults.value")
    expect(content).toContain("downloadInspectionRecordExcel(")
    expect(content).toContain(':disabled="assistantResultLoading || currentMonthRecordCount === 0"')
  })

  it("只展示实际巡检结果，不再把巡检配置当作巡检记录", () => {
    expect(content).toContain("buildInspectionRecordRows([], selectedAssistantResults.value)")
    expect(content).not.toContain("getInspectionBaseInfoListApi")
    expect(content).not.toContain("currentRecord")
  })
})
