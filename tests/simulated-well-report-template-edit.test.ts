import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const pagePath = "src/views/datamanage/simulated-well-report-template/index.vue"
const content = readFileSync(resolve(root, pagePath), "utf8")

describe("simulated well report template field editing", () => {
  it("renders an edit action for every configured field", () => {
    expect(content).toContain('class="field-actions"')
    expect(content).toContain('@click="openEditFieldDialog(idx)"')
    expect(content).toContain(">编辑</el-button>")
  })

  it("uses a local draft dialog with cancel and confirm actions", () => {
    expect(content).toContain('v-model="editFieldDialogVisible"')
    expect(content).toContain('v-model="editFieldForm.value"')
    expect(content).toContain('@click="closeEditFieldDialog"')
    expect(content).toContain('@click="confirmEditField"')
    expect(content).toContain("const openEditFieldDialog")
    expect(content).toContain("const closeEditFieldDialog")
  })

  it("validates and updates only the selected local field", () => {
    expect(content).toContain('ElMessage.warning("字段名称不能为空")')
    expect(content).toContain('ElMessage.warning("字段已存在")')
    expect(content).toContain("index !== editing.index")
    expect(content).toContain("fields[editing.index] = value")
    expect(content).toContain("section: SectionKey")
  })

  it("persists the complete draft only from the page save action", () => {
    expect(content).toContain("const saveConfig = async")
    expect(content).toContain("updateSimulatedWellReportTemplateApi(t.id")
    expect(content).toContain("test_products: [...configDraft.test_products]")
    expect(content).toContain("match_instruments: [...configDraft.match_instruments]")
    expect(content).toContain("test_items: [...configDraft.test_items]")
    expect(content).toContain("evaluation_standards: [...configDraft.evaluation_standards]")
    expect(content).toContain(':loading="configSaving"')
  })

  it("supports local drag sorting within the active category", () => {
    expect(content).toContain('import { VueDraggable } from "vue-draggable-plus"')
    expect(content).toContain('<VueDraggable')
    expect(content).toContain('v-model="currentFieldList"')
    expect(content).toContain('handle=".field-drag-handle"')
    expect(content).toContain('class="field-drag-handle"')
    expect(content).toContain('ghost-class="field-drag-ghost"')
    expect(content).toContain("const currentFieldList = computed<string[]>")
    expect(content).toContain("configDraft[activeSection.value] = fields")
    expect(content).not.toContain('group="simulated-well-template-fields"')
  })
})
