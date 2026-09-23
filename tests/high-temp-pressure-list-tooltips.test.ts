import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")
const listTable = (source: string) => source.match(/<div class="table-wrapper">([\s\S]*?)<\/el-table>/)?.[1] ?? ""
const column = (table: string, attribute: "label" | "prop", value: string) =>
  table.match(new RegExp(`<el-table-column\\b[^>]*\\b${attribute}="${value}"[^>]*>`))?.[0] ?? ""

describe("高温高压井列表悬浮详情", () => {
  const orderTable = listTable(read("src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue"))
  const reviewTable = listTable(read("src/views/datamanage/report/components/GenericEquipmentReportReview.vue"))
  const reportTable = listTable(read("src/views/datamanage/historymange/components/HighTemperaturePressureReport.vue"))

  it("申请单列表只给易截断的文字列展示完整值", () => {
    for (const label of [
      "表格编号", "任务单编号", "测试单号", "申请人", "测试申请单位",
      "待测仪器", "仪器SN号", "测试类型", "测试容器", "使用设备"
    ]) {
      expect(column(orderTable, "label", label), label).toContain("show-overflow-tooltip")
    }
    for (const label of ["在线测试", "待测数量", "状态", "操作"]) {
      expect(column(orderTable, "label", label), label).not.toContain("show-overflow-tooltip")
    }
  })

  it("审核列表的共享列仅在高温高压井类型启用提示", () => {
    expect(reviewTable).toContain("props.reportType === 'high-temp-high-pressure'")
    for (const prop of ["report_no", "task_number", "tester"]) {
      expect(column(reviewTable, "prop", prop), prop).toContain(
        `:show-overflow-tooltip="props.reportType === 'high-temp-high-pressure'"`
      )
    }
    for (const prop of ["report_number", "instrument_name", "instrument_sn"]) {
      const tag = column(reviewTable, "prop", prop)
      expect(tag, prop).toContain("v-if=\"props.reportType === 'high-temp-high-pressure'\"")
      expect(tag, prop).toContain("show-overflow-tooltip")
    }
  })

  it("测试报告列表包含同步失败原因，并使提示优先显示在表格上方", () => {
    for (const prop of ["report_no", "report_number", "task_number", "instrument_name", "instrument_sn", "tester"]) {
      expect(column(reportTable, "prop", prop), prop).toContain("show-overflow-tooltip")
    }
    expect(column(reportTable, "label", "同步失败原因")).toContain("show-overflow-tooltip")
    for (const table of [orderTable, reviewTable, reportTable]) {
      expect(table).toContain("placement: 'top'")
      expect(table).toContain("appendTo: 'body'")
      expect(table).toContain("high-temp-pressure-cell-tooltip")
    }
    const styles = read("src/styles/management-list.scss")
    expect(styles).toContain(".el-popper.high-temp-pressure-cell-tooltip")
    expect(styles).toContain("overflow-wrap: anywhere")
  })
})
