import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("work order schedule API", () => {
  const content = read("src/api/work-order-schedule/index.ts")

  it("uses the same seven schedule endpoints as the test client", () => {
    expect(content).toContain("test/water-cycle/order/schedule/")
    expect(content).toContain("test/vibration-table/order/schedule/")
    expect(content).toContain("test/high-temp-box/order/schedule/")
    expect(content).toContain("test/high-temp-pressure/order/instrument-schedule/")
    expect(content).toContain("test/simulated-well/order/device-schedule/")
    expect(content).toContain("test/halt-hass/order/schedule/")
    expect(content).toContain("test/circuit-board-module/order/schedule/")
  })

  it("keeps backend schedule field names when saving and clearing", () => {
    expect(content).toContain("scheduled_start_at")
    expect(content).toContain("scheduled_end_at")
    expect(content).toContain("schedule_segments")
    expect(content).toContain("saveWorkOrderSchedule")
    expect(content).toContain("clearWorkOrderSchedule")
  })

  it("schedules circuit board modules as independent order records", () => {
    expect(content).toContain('if (equipment === "circuit-board-module") return "order"')
    expect(content).not.toContain('if (equipment === "circuit-board-module") return "relation"')
  })
})
