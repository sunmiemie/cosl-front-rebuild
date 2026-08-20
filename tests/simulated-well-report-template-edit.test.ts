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

  it("uses a complete local draft dialog with cancel and confirm actions", () => {
    expect(content).toContain('v-model="editFieldDialogVisible"')
    expect(content).toContain('v-model="editFieldForm.type"')
    expect(content).toContain('v-model="editFieldForm.nameCN"')
    expect(content).toContain('v-model="editFieldForm.defaultValue"')
    expect(content).toContain('v-model="editFieldForm.required"')
    expect(content).toContain('@click="closeEditFieldDialog"')
    expect(content).toContain('@click="confirmEditField"')
  })

  it("provides the same type-specific configuration choices as adding a field", () => {
    expect(content).toContain('v-if="editFieldForm.type === \'single-input\'"')
    expect(content).toContain('v-model="editFieldForm.singleInputUnit"')
    expect(content).toContain('v-if="editFieldForm.type === \'depth-group\'"')
    expect(content).toContain('v-if="editFieldForm.type === \'range-radio\'"')
    expect(content).toContain("editFieldForm.type === 'single-row-multi-column' || editFieldForm.type === 'multi-input-row'")
    expect(content).toContain('v-if="editFieldForm.type === \'sampling-group\'"')
    expect(content).toContain('v-if="editFieldForm.type === \'card-group\'"')
  })

  it("stores the single input unit for both add and edit flows", () => {
    expect(content).toContain('{ value: "single-input", label: "单一输入" }')
    expect(content).toContain('v-if="addFieldForm.type === \'single-input\'"')
    expect(content).toContain('v-model="addFieldForm.singleInputUnit"')
    expect(content).toContain('field.unit = form.singleInputUnit.trim()')
    expect(content).toContain('editFieldForm.singleInputUnit = String(originalValue.unit ?? "")')
  })

  it("stores an optional unit for number fields in both add and edit flows", () => {
    expect(content).toContain("numberUnit: string")
    expect(content).toContain('v-if="addFieldForm.type === \'number\'"')
    expect(content).toContain('v-model="addFieldForm.numberUnit"')
    expect(content).toContain('v-if="editFieldForm.type === \'number\'"')
    expect(content).toContain('v-model="editFieldForm.numberUnit"')
    expect(content).toContain('if (form.type === "number")')
    expect(content).toContain('const unit = form.numberUnit.trim()')
    expect(content).toContain('editFieldForm.numberUnit = String(originalValue.unit ?? "")')
  })

  it("normalizes legacy fields, validates names, and replaces only the selected field", () => {
    expect(content).toContain("const normalizeFieldType")
    expect(content).toContain('editFieldForm.type = normalizeFieldType(originalValue.type)')
    expect(content).toContain('ElMessage.warning("字段名称不能为空")')
    expect(content).toContain('ElMessage.warning("字段已存在")')
    expect(content).toContain("index !== editing.index")
    expect(content).toContain("fields[editing.index] = applyFieldForm(editFieldForm, editing.originalValue)")
    expect(content).toContain("section: SectionKey")
  })

  it("cleans obsolete type configuration while preserving unknown field properties", () => {
    expect(content).toContain("const applyFieldForm")
    expect(content).toContain("const typeConfigurationKeys")
    expect(content).toContain("normalizeFieldType(originalValue.type) !== form.type")
    expect(content).toContain("typeConfigurationKeys.forEach((key) => delete field[key])")
    expect(content).toContain("...originalValue")
    expect(content).toContain("if (!compoundTypes.includes(form.type) && form.defaultValue.trim())")
  })

  it("persists the complete draft only from the page save action", () => {
    expect(content).toContain("const saveConfig = async")
    expect(content).toContain("updateSimulatedWellReportTemplateApi(t.id")
    expect(content).toContain("test_products: cleanFields(configDraft.test_products)")
    expect(content).toContain("match_instruments: cleanFields(configDraft.match_instruments)")
    expect(content).toContain("test_items: cleanFields(configDraft.test_items)")
    expect(content).toContain("evaluation_standards: cleanFields(configDraft.evaluation_standards)")
    expect(content).toContain("transfer_data_records: cleanFields(configDraft.transfer_data_records)")
    expect(content).toContain(':loading="configSaving"')
  })

  it("persists editable columns for both multi-column compound types", () => {
    expect(content).toContain('{ value: "single-row-multi-column", label: "单行多列" }')
    expect(content).toContain("columns: TemplateColumn[]")
    expect(content).toContain("const normalizeColumns")
    expect(content).toContain("const cleanColumns")
    expect(content).toContain("const addColumn")
    expect(content).toContain("const removeColumn")
    expect(content).toContain('field.columns = cleanColumns(form.columns)')
    expect(content).toContain('editFieldForm.columns = normalizeColumns(originalValue.columns)')
    expect(content).toContain('v-model="column.nameCN"')
    expect(content).toContain('v-model="column.nameEN"')
    expect(content).toContain('v-model="column.unit"')
  })

  it("loads and displays the transfer data configuration section", () => {
    expect(content).toContain('| "transfer_data_records"')
    expect(content).toContain('{ key: "transfer_data_records" as SectionKey, label: "转样数据" }')
    expect(content).toContain("configDraft.transfer_data_records = normalizeFields(res.data.transfer_data_records)")
    expect(content).toContain('v-for="(column, columnIndex) in item.columns"')
    expect(content).toContain('type: "single-row-multi-column", columns: []')
  })
})
