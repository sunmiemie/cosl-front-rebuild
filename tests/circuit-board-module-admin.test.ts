import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

const pagePath = "src/views/testmanage/circuit-module-inspection/index.vue"
const componentPath = "src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue"
const apiPath = "src/api/circuit-module-application/index.ts"
const printUtilPath = "src/utils/printQrcode.ts"

describe("电路板模块管理端", () => {
  it("电路板模块标签页挂载真实组件而不是占位空状态", () => {
    const content = read(pagePath)

    expect(content).toContain("CircuitBoardModule")
    expect(content).toContain("<CircuitBoardModule")
    expect(content).not.toContain("电路板模块检验功能待接入")
  })

  it("保留申请单列表但移除内部标题和单独二级标签条", () => {
    expect(existsSync(resolve(root, componentPath))).toBe(true)
    const content = read(componentPath)

    expect(content).toContain("全部状态")
    expect(content).toContain("全部性质")
    expect(content).toContain("application-card")
    expect(content).toContain("board-list-section")
    expect(content).toContain("printBoardQrcodes")
    expect(content).not.toContain('<div class="page-title">电路模块任务单</div>')
    expect(content).not.toContain("工单管理</div>")
    expect(content).not.toContain("与排期系统实时联动")
    expect(content).not.toContain("circuit-page-header")
    expect(content).not.toContain("page-title")
    expect(content).not.toContain("page-subtitle")
    expect(content).not.toContain("circuit-module-header")
    expect(content).not.toContain("circuit-sidebar-label")
    expect(content).not.toContain("circuit-type-tabs")
    expect(content).not.toContain("circuit-type-btn")
    expect(content).not.toContain("getBatchDataApi")
    expect(content).not.toContain("getTempBatchDataApi")
    expect(content).not.toContain("getBoardDataApi")
    expect(content).not.toContain("getBatchTempBoardDataApi")
    expect(content).not.toContain("开始测试")
    expect(content).not.toContain("qrcode.vue")
    expect(content).not.toContain("qrcodeVisible")
  })

  it("申请单级打印使用申请单下全部电路板，单板打印只使用当前行", () => {
    expect(existsSync(resolve(root, componentPath))).toBe(true)
    const content = read(componentPath)

    expect(content).toContain("handlePrintOrderQrcodes")
    expect(content).toContain("handlePrintBoardQrcode")
    expect(content).toContain("application.boards")
    expect(content).toContain("getApplicationPrintableBoards")
    expect(content).toContain("printBoardQrcodes(getApplicationPrintableBoards(application)")
    expect(content).not.toContain("printBoardQrcodes(application.boards")
    expect(content).toContain("printBoardQrcodes([row]")
  })

  it("电路板模块页只接入电路板模块数据，不混入其他测试类型", () => {
    const componentContent = read(componentPath)
    const apiContent = read(apiPath)

    expect(componentContent).toContain("电路板模块")
    expect(componentContent).toContain("getCircuitModuleApplicationList")
    expect(apiContent).toContain("data/assistant/circuit-board-module-order/list")
    expect(apiContent).not.toContain("data/assistant/commission-board-relation/list")

    for (const value of ["HALTHASS", "highBox", "vibrationTable", "waterCycle", "HARNESS", "halt&hass", "高温箱", "振动台", "水循环"]) {
      expect(componentContent).not.toContain(value)
      expect(apiContent).not.toContain(value)
    }

    expect(apiContent).not.toContain("data/assistant/order/list")
  })

  it("发布电路板模块申请单会同步到后端供工单排程读取", () => {
    const componentContent = read(componentPath)
    const apiContent = read(apiPath)

    expect(apiContent).toContain("syncCircuitModuleApplicationList")
    expect(apiContent).toContain("data/assistant/circuit-board-module-order/sync")
    expect(apiContent).not.toContain("data/assistant/commission-board-relation/sync")
    expect(componentContent).toContain("persistBoardsStatus")
    expect(componentContent).toContain("status: 1")
    expect(componentContent).toContain("await syncCircuitModuleApplicationList")
  })

  it("电路板模块页不显示顶部状态统计展示卡片", () => {
    const content = read(componentPath)

    expect(content).not.toContain("stats-grid")
    expect(content).not.toContain("stat-card")
    expect(content).not.toContain("statusStats")
    expect(content).not.toContain("filterByStatus")
  })

  it("打印工具复用现有二维码图片接口并打开打印窗口", () => {
    expect(existsSync(resolve(root, printUtilPath))).toBe(true)
    const content = read(printUtilPath)

    expect(content).toContain("getQRcodeImgApi")
    expect(content).toContain('window.open("", "_blank")')
    expect(content).toContain("printWindow.print()")
    expect(content).toContain("normalizeBoardForQrcode")
    expect(content).toContain("headerKey")
    expect(content).toContain("seriaKey")
    expect(content).not.toContain("QrcodeVue")
  })
})
