import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("shared list layout density", () => {
  it("keeps pagination visible while tables use the remaining height and their own scrollbars", () => {
    const styles = read("src/styles/management-list.scss")
    const reportPage = read("src/views/datamanage/historymange/index.vue")
    const footer = read("src/layouts/components/Footer/index.vue")

    expect(styles).toContain("min-height: 620px;")
    expect(styles).toContain("height: 100% !important;")
    expect(styles).toContain("flex: 1 1 0;")
    expect(styles).toContain("overflow: hidden;")
    expect(styles).toContain("padding: 12px 16px 0;")
    expect(reportPage).toContain("management-list-page")
    expect(reportPage).toContain("management-tabs")
    expect(footer).toContain("min-height: 36px;")
  })

  it("keeps list actions on the right and gives date ranges a bounded width", () => {
    const styles = read("src/styles/management-list.scss")
    expect(styles).toMatch(/\.management-toolbar-actions[\s\S]*margin-left:\s*auto;/)
    expect(styles).toContain("width: clamp(260px, 18vw, 300px) !important;")
  })

  it("keeps the simulated-well table scrollable inside its order-type tabs", () => {
    const styles = read("src/styles/management-list.scss")
    const simulationOrder = read("src/views/testmanage/testorder/components/SimulationOrder.vue")

    expect(simulationOrder).toContain('class="management-list-inner-tabs"')
    expect(styles).toMatch(
      /\.management-list-card \.table-wrapper > \.management-list-inner-tabs[\s\S]*height:\s*100%;[\s\S]*min-height:\s*0;/
    )
    expect(styles).toMatch(
      /\.management-list-card \.management-list-inner-tabs > \.el-tabs__header[\s\S]*order:\s*0;[\s\S]*flex:\s*none;/
    )
    expect(styles).toMatch(
      /\.management-list-card \.management-list-inner-tabs > \.el-tabs__content[\s\S]*order:\s*1;[\s\S]*flex:\s*1 1 0;[\s\S]*min-width:\s*0;[\s\S]*min-height:\s*0;/
    )
    expect(styles).toMatch(
      /\.management-list-card \.management-list-inner-tabs > \.el-tabs__content > \.el-tab-pane[\s\S]*height:\s*100%;[\s\S]*min-height:\s*0;/
    )
    expect(styles).toMatch(
      /\.management-list-card \.management-list-inner-tabs \.el-table[\s\S]*width:\s*100%;[\s\S]*height:\s*100% !important;/
    )
  })

  it("keeps data and operation cells on one line with a fixed right operation column", () => {
    const styles = read("src/styles/management-list.scss")
    const table = read("src/components/Table/index.vue")
    const highPressureOrder = read("src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue")

    expect(styles).toMatch(/\.management-list-card \.el-table \.cell,[\s\S]*white-space:\s*nowrap;/)
    expect(table).toContain('class-name="table-operation-column"')
    expect(table).toContain("item.fixed === false ? false : 'right'")
    expect(table).toContain("getColumnMinWidth(item, 140)")
    expect(highPressureOrder).toContain('label="操作" width="176" align="center" fixed="right"')
  })

  it("places compact add actions after query and before reset", () => {
    const files = [
      "src/views/datamanage/historymange/components/BugReport.vue",
      "src/views/datamanage/historymange/components/BatchReport.vue",
      "src/views/datamanage/historymange/components/WaterCycleReport.vue",
      "src/views/datamanage/historymange/components/HighTemperatureReport.vue",
      "src/views/datamanage/historymange/components/VibrationReport.vue",
      "src/views/datamanage/historymange/components/HighTemperaturePressureReport.vue",
      "src/views/testmanage/testorder/components/ProdOrder.vue",
      "src/views/testmanage/testorder/components/TempOrder.vue",
      "src/views/testmanage/testorder/components/HaltHassOrder.vue",
      "src/views/testmanage/testorder/components/WaterCycleOrder.vue",
      "src/views/testmanage/testorder/components/HighTemperatureOrder.vue",
      "src/views/testmanage/testorder/components/VibrationOrder.vue",
      "src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue",
      "src/views/testmanage/testorder/components/SimulationOrder.vue",
      "src/views/testmanage/testType/index.vue",
      "src/views/testmanage/process/index.vue"
    ]

    for (const file of files) {
      const content = read(file)
      const actionAt = (label: string, from = 0) => {
        const match = new RegExp(`>\\s*${label}\\s*</el-button`, "g")
        match.lastIndex = from
        return match.exec(content)?.index ?? -1
      }
      const queryAt = actionAt("查询")
      const addAt = actionAt("新增", queryAt)
      const resetAt = actionAt("重置", addAt)

      expect(queryAt, `${file} should have a query action`).toBeGreaterThanOrEqual(0)
      expect(addAt, `${file} should use the compact add label`).toBeGreaterThan(queryAt)
      expect(resetAt, `${file} should place reset after add`).toBeGreaterThan(addAt)
    }
  })

  it("uses the compact add label on the circuit-board application list", () => {
    const content = read("src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue")
    expect(content).toContain('@click="handleCreateApplication">新增</el-button>')
    expect(content).not.toContain('@click="handleCreateApplication">新建</el-button>')
  })
})
