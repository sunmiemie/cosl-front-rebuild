import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const content = readFileSync(resolve(root, "src/views/inspectionmanage/base-info/index.vue"), "utf8")

describe("inspection base info page", () => {
  const saveBlock = content.slice(content.indexOf("async function handleSave"), content.indexOf("function handleClose"))

  it("stays on the current page after saving and keeps the inspection content visible", () => {
    expect(saveBlock).toContain("formData.id = String(savedId)")
    expect(saveBlock).toContain("router.replace")
    expect(saveBlock).toContain("path: route.path")
    expect(saveBlock).not.toContain('router.push("/inspectionmanage/view")')
  })

  it("prevents duplicate save clicks while saving", () => {
    expect(content).toContain(':loading="saving"')
    expect(saveBlock).toContain("if (saving.value) return")
  })

  it("loads existing database content into the main inspection table by device and SN", () => {
    expect(content).toContain("getInspectionBaseInfoListApi")
    expect(content).toContain("handleDeviceSnChange")
    expect(content).toContain("loadExistingContentForSelection")
    expect(content).not.toContain("existingRecords")
    expect(content).not.toContain("database-wrapper")
    expect(content).not.toContain("数据库已有巡检信息")
  })

  it("uses host management SN options and shows the selected host name", () => {
    expect(content).toContain("hostDeviceOptions")
    expect(content).toContain("selectedHostDeviceName")
    expect(content).toContain("getInspectionDeviceGroupHosts")
    expect(content).toContain("matchesInspectionDeviceGroup")
    expect(content).toContain('<el-form-item label="主机名称">')
    expect(content).toContain("{{ selectedHostDeviceName || \"-\" }}")
    expect(content).not.toContain("getDeviceInstanceName(item) === deviceName")
  })
})
