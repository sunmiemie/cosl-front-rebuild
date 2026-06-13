import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("测试工单导航拆分", () => {
  it("测试工单列表只保留生产和临时测试工单", () => {
    const content = read("src/views/testmanage/testorder/index.vue")

    expect(content).toContain("ProdOrder")
    expect(content).toContain("TempOrder")
    expect(content).not.toContain("HaltHassOrder")
    expect(content).not.toContain("WaterCycleOrder")
    expect(content).not.toContain("HighTemperatureOrder")
    expect(content).not.toContain("VibrationOrder")
    expect(content).not.toContain("HighTemperaturePressureOrder")
    expect(content).not.toContain("SimulationOrder")
  })

  it("电路模块检验承载被移出的设备工单和电路板模块", () => {
    const file = "src/views/testmanage/circuit-module-inspection/index.vue"

    expect(existsSync(resolve(root, file))).toBe(true)
    const content = read(file)
    expect(content).toContain("HaltHassOrder")
    expect(content).toContain("WaterCycleOrder")
    expect(content).toContain("HighTemperatureOrder")
    expect(content).toContain("VibrationOrder")
    expect(content).toContain("HighTemperaturePressureOrder")
    expect(content).toContain("SimulationOrder")
    expect(content).toContain("电路板模块")
  })

  it("路由包含电路模块检验和首页工单排程入口", () => {
    const router = read("src/router/index.ts")

    expect(router).toContain("CircuitModuleInspection")
    expect(router).toContain("circuit-module-inspection")
    expect(router).toContain("WorkOrderSchedule")
    expect(router).toContain("work-order-schedule")
  })
})
