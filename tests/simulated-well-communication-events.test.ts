import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const page = readFileSync(
  resolve(root, "src/views/datamanage/historymange/components/SimulationWellReport.vue"),
  "utf8"
)
const api = readFileSync(resolve(root, "src/api/simulated-well-report/index.ts"), "utf8")

describe("simulated well communication events", () => {
  it("types the communication events returned with the depth curve", () => {
    expect(api).toContain("export interface SimulatedWellCommunicationEvent")
    expect(api).toContain("communication_events: SimulatedWellCommunicationEvent[]")
    expect(api).toContain("depth_carried: boolean")
    expect(api).toContain("device_states?: Array")
  })

  it("renders red, green and gray event points with item tooltips", () => {
    expect(page).toContain('name: "通信异常"')
    expect(page).toContain('name: "通信恢复"')
    expect(page).toContain('name: "无法识别"')
    expect(page).toContain('type: "scatter"')
    expect(page).not.toContain('params.data?.devices?.join("、")')
    expect(page).toMatch(/tooltip:\s*\{[\s\S]*?trigger: "item",[\s\S]*?formatter: communicationPointTooltip/)
    expect(page).toMatch(/trigger: "axis",[\s\S]*?axisPointer: \{ type: "cross" \},[\s\S]*?formatter: depthAxisTooltip/)
    expect(page).toContain("event.deviceStates")
    expect(page).toContain('return "正常"')
    expect(page).toContain('return "异常"')
    expect(page).toContain('return "未知"')
    expect(page).toContain("深度沿用最近值")
  })
})
