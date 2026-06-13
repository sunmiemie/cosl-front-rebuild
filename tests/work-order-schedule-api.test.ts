import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("管理端工单排程 API", () => {
  const content = read("src/api/work-order-schedule/index.ts")

  it("使用与测试端一致的五类排程接口", () => {
    expect(content).toContain("test/water-cycle/order/schedule/")
    expect(content).toContain("test/vibration-table/order/schedule/")
    expect(content).toContain("test/high-temp-box/order/schedule/")
    expect(content).toContain("test/high-temp-pressure/order/instrument-schedule/")
    expect(content).toContain("test/simulated-well/order/device-schedule/")
  })

  it("保存和清除接口都保留后端排程字段命名", () => {
    expect(content).toContain("scheduled_start_at")
    expect(content).toContain("scheduled_end_at")
    expect(content).toContain("schedule_segments")
    expect(content).toContain("saveWorkOrderSchedule")
    expect(content).toContain("clearWorkOrderSchedule")
  })
})
