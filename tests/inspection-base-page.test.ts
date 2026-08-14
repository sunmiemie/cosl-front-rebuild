import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const content = readFileSync(resolve(root, "src/views/inspectionmanage/base-info/index.vue"), "utf8")
const saveBlock = content.slice(
  content.indexOf("async function handleSave"),
  content.indexOf("async function confirmDiscardDraft")
)

describe("inspection base info batch editor", () => {
  it("selects inspection devices by real device id", () => {
    expect(content).toContain('<el-form-item label="巡检设备类型" required>')
    expect(content).toContain('<el-form-item label="巡检设备名称" required>')
    expect(content).toContain(':value="device.id"')
    expect(content).toContain("device_id: deviceId")
    expect(content).toContain("getInspectionBaseInfoListApi({ currentPage: 1, pageSize: 1, device_id: deviceId })")
  })

  it("uses a wide modal that cannot be dismissed by clicking outside", () => {
    expect(content).toContain('width="min(1000px, 88vw)"')
    expect(content).toContain(':close-on-click-modal="false"')
    expect(content).toContain(':close-on-press-escape="false"')
    expect(content).toContain("handleDialogBeforeClose")
  })

  it("edits multiple inspection items in an accordion and can append another item", () => {
    expect(content).toContain("<el-collapse")
    expect(content).toContain("accordion")
    expect(content).toContain('v-for="(item, index) in draftItems"')
    expect(content).toContain("＋ 新增一条")
    expect(content).toContain("addDraftItem")
  })

  it("supports multiple inspectors at device level instead of each item", () => {
    expect(content.match(/<el-form-item label="巡检人（可多选）"/g)).toHaveLength(1)
    expect(content).toContain("draftInspectorUserIds")
    expect(content).toContain("multiple")
    expect(content).toContain("collapse-tags")
    expect(content).toContain(':max-collapse-tags="visibleInspectorTagCount"')
    expect(content).toContain("updateVisibleInspectorTagCount")
    expect(content).toContain("new ResizeObserver(updateVisibleInspectorTagCount)")
    expect(saveBlock).toContain("inspectors: selectedInspectors.map")
    expect(saveBlock).not.toContain("inspectors: item")
  })

  it("supports ordered batch saving while preserving saved item ids", () => {
    expect(content).toContain("<VueDraggable")
    expect(content).toContain('v-model="draftItems"')
    expect(content).toContain('class="drag-sort-handle"')
    expect(content).toContain('aria-label="拖拽排序"')
    expect(content).toContain('handle=".drag-sort-handle"')
    expect(content).toContain("handleDraftDragEnd")
    expect(content).not.toContain("function moveDraftItem")
    expect(content).not.toContain(">上移</el-button>")
    expect(content).not.toContain("下移")
    expect(content).toContain("normalizeDraftOrder")
    expect(saveBlock).toContain("item_id: item.id && Number.isFinite(itemId) ? itemId : undefined")
    expect(saveBlock).toContain("sort_no: index + 1")
    expect(saveBlock).toContain("saveInspectionBaseInfoApi")
  })

  it("prevents duplicate save clicks and stays on the current page", () => {
    expect(content).toContain(':loading="saving"')
    expect(saveBlock).toContain("if (saving.value || !validateDraft()) return")
    expect(saveBlock).toContain("router.replace")
    expect(saveBlock).not.toContain('router.push("/inspectionmanage/view")')
  })
})
