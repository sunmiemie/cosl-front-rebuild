import { describe, expect, it } from "vitest"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const apiPath = "src/api/host-maintenance/index.ts"
const typesPath = "src/api/host-maintenance/types/index.ts"
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("host maintenance API", () => {
  it("declares a focused API module for host usage and maintenance", () => {
    expect(existsSync(resolve(root, apiPath))).toBe(true)
    expect(existsSync(resolve(root, typesPath))).toBe(true)
  })

  it("uses backend host maintenance endpoints", () => {
    const content = read(apiPath)

    expect(content).toContain("equipment/host-maintenance/usage-records/list")
    expect(content).toContain("equipment/host-maintenance/usage-records/create")
    expect(content).toContain("equipment/host-maintenance/usage-records/update")
    expect(content).toContain("equipment/host-maintenance/usage-records/delete")
    expect(content).toContain("equipment/host-maintenance/maintenance-records/list")
    expect(content).toContain("equipment/host-maintenance/maintenance-records/create")
    expect(content).toContain("equipment/host-maintenance/maintenance-records/update")
    expect(content).toContain("equipment/host-maintenance/maintenance-records/delete")
    expect(content).toContain("equipment/host-maintenance/config/detail")
    expect(content).toContain("equipment/host-maintenance/config/update")
    expect(content).toContain("equipment/host-maintenance/reminders/list")
  })

  it("keeps host-specific field names separate from simulated-well maintenance fields", () => {
    const content = read(typesPath)

    expect(content).toContain("HostUsageRecordItem")
    expect(content).toContain("HostMaintenanceRecordItem")
    expect(content).toContain("HostMaintenanceConfigItem")
    expect(content).toContain("host_sn")
    expect(content).toContain("duration_hours")
    expect(content).toContain("cumulative_hours")
    expect(content).toContain("completed_task")
    expect(content).toContain("operator")
    expect(content).toContain("cycle_hours")
    expect(content).not.toContain("instrument_id")
    expect(content).not.toContain("model_number")
  })
})
