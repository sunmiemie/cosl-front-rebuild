import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const pagePath = "src/views/devicemanage/device/psi/index.vue"
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("host management usage and maintenance page", () => {
  const content = read(pagePath)

  it("opens host detail as a drawer with usage and maintenance tabs", () => {
    expect(content).toContain("<el-drawer")
    expect(content).toContain('name="usage"')
    expect(content).toContain('name="maintenance"')
    expect(content).toContain('name="cycle"')
    expect(content).toContain('name="reminder"')
    expect(content).not.toContain('<el-dialog v-model="detailVisible" title="设备详情"')
  })

  it("loads host maintenance data when opening a host detail", () => {
    expect(content).toContain("getHostUsageRecordListApi")
    expect(content).toContain("getHostMaintenanceRecordListApi")
    expect(content).toContain("getHostMaintenanceConfigApi")
    expect(content).toContain("getHostMaintenanceReminderListApi")
    expect(content).toContain("loadHostMaintenanceData")
    expect(content).toContain("Promise.all")
  })

  it("supports manual usage and maintenance record management", () => {
    expect(content).toContain("openUsageCreate")
    expect(content).toContain("submitUsageRecord")
    expect(content).toContain("deleteUsageRecord")
    expect(content).toContain("openMaintenanceCreate")
    expect(content).toContain("submitMaintenanceRecord")
    expect(content).toContain("deleteMaintenanceRecord")
  })

  it("keeps host fields independent from simulated-well instrument fields", () => {
    expect(content).toContain("host_sn")
    expect(content).toContain("duration_hours")
    expect(content).toContain("cycle_hours")
    expect(content).not.toContain("instrument_id")
    expect(content).not.toContain("model_number")
  })
})
