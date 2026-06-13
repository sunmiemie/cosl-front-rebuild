import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

const pagePath = "src/views/testmanage/circuit-module-inspection/index.vue"
const componentPath = "src/views/testmanage/circuit-module-inspection/components/CircuitBoardModule.vue"
const printUtilPath = "src/utils/printQrcode.ts"

describe("电路板模块管理端", () => {
  it("电路板模块标签页挂载真实组件而不是占位空状态", () => {
    const content = read(pagePath)

    expect(content).toContain("CircuitBoardModule")
    expect(content).toContain("<CircuitBoardModule")
    expect(content).not.toContain("电路板模块检验功能待接入")
  })

  it("组件使用现有生产和临时电路板接口并避免旧二维码弹窗逻辑", () => {
    expect(existsSync(resolve(root, componentPath))).toBe(true)
    const content = read(componentPath)

    expect(content).toContain("getBatchDataApi")
    expect(content).toContain("getTempBatchDataApi")
    expect(content).toContain("getBoardDataApi")
    expect(content).toContain("getBatchTempBoardDataApi")
    expect(content).toContain("printBoardQrcodes")
    expect(content).not.toContain("开始测试")
    expect(content).not.toContain("qrcode.vue")
    expect(content).not.toContain("qrcodeVisible")
  })

  it("模块级打印使用模块下全部电路板，单板打印只使用当前行", () => {
    expect(existsSync(resolve(root, componentPath))).toBe(true)
    const content = read(componentPath)

    expect(content).toContain("handlePrintModuleQrcodes")
    expect(content).toContain("handlePrintBoardQrcode")
    expect(content).toContain("module.boards")
    expect(content).toContain("printBoardQrcodes([row]")
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
