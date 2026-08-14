import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const page = readFileSync(resolve(root, "src/views/inspectionmanage/config-list/index.vue"), "utf8")
const api = readFileSync(resolve(root, "src/api/inspection-base/index.ts"), "utf8")
const routes = readFileSync(resolve(root, "src/router/index.ts"), "utf8")

describe("巡检配置列表", () => {
  it("展示所有设备的配置状态并支持筛选和分页", () => {
    expect(api).toContain('url: "data/inspection-base/device-overview"')
    expect(page).toContain("getInspectionDeviceConfigOverviewApi")
    expect(page).toContain('label="配置状态"')
    expect(page).toContain('label="巡检人"')
    expect(page).toContain("paginationData.total")
    expect(page).toContain("已配置 {{ stats.configured }} 台，未配置 {{ stats.unconfigured }} 台")
  })

  it("已配置设备可以查看和编辑，未配置设备可以直接配置", () => {
    expect(page).toContain('title="巡检配置详情"')
    expect(page).toContain("getInspectionBaseInfoDetailApi")
    expect(page).toContain('{{ row.configured ? "编辑" : "配置" }}')
    expect(page).toContain('path: "/inspectionmanage/config/editor"')
    expect(page).toContain("deviceId: String(row.device_id)")
    expect(page).not.toContain("新增配置")
    expect(page).not.toContain("function createConfig")
  })

  it("导航区分巡检配置、巡检记录和隐藏编辑器", () => {
    expect(routes).toContain('redirect: "/inspectionmanage/config"')
    expect(routes).toContain('title: "巡检配置"')
    expect(routes).toContain('title: "巡检记录"')
    expect(routes).toContain('path: "config/editor"')
    expect(routes).toContain('activeMenu: "/inspectionmanage/config"')
  })
})
