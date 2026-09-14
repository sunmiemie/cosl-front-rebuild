import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import ts from "typescript"

const page = readFileSync(resolve(__dirname, "../src/views/testmanage/testorder/components/HighTemperaturePressureOrder.vue"), "utf8")
const script = page.split('<script setup lang="ts">')[1].split("</script>")[0]
const ast = ts.createSourceFile("order.ts", script, ts.ScriptTarget.Latest, true)
const names = new Set(["testTypeOptions", "testContainerOptions", "onlineTestText", "createForm", "instrumentFormList", "canCreate", "addInstrumentRow"])
const source = ast.statements.filter((node) => ts.isVariableStatement(node) && node.declarationList.declarations.some((declaration) => names.has(declaration.name.getText(ast)))).map((node) => node.getText(ast)).join("\n")
const createState = () => new Function("reactive", "ref", "computed", "todayText", ts.transpileModule(source, {}).outputText + "\nreturn {createForm,instrumentFormList,canCreate,addInstrumentRow,testTypeOptions,testContainerOptions,onlineTestText}")(
  (value: unknown) => value,
  (value: unknown) => ({ value }),
  (get: () => unknown) => ({ get value() { return get() } }),
  () => "2026-09-09"
)

describe("高温高压工单三项要求", () => {
  it("不预选，容器和测试方式使用独立选项", () => {
    const state = createState()
    expect(state.testTypeOptions).toEqual(["高压测试", "高温高压测试"])
    expect(state.testContainerOptions).toEqual(["250容器", "480容器"])
    expect(state.createForm.test_type).toBe("")
    expect(state.createForm.test_container).toBe("")
    expect(state.createForm.online_test).toBeNull()
  })

  it("明确选择否可以创建，未选择则不能创建", () => {
    const state = createState()
    for (const key of ["table_no", "task_number", "applicant", "applicant_phone", "test_application_unit", "test_application_unit_manager", "project_name", "client", "planned_time", "use_device"]) state.createForm[key] = "filled"
    state.createForm.test_type = "高压测试"
    state.createForm.test_container = "480容器"
    state.instrumentFormList.value[0].instrument_name = "仪器"
    state.instrumentFormList.value[0].instrument_sn = "SN-1"
    expect(state.canCreate.value).toBe(false)
    state.createForm.online_test = false
    expect(state.canCreate.value).toBe(true)
    expect(state.onlineTestText(false)).toBe("否")
    expect(state.onlineTestText(null)).toBe("未填写")
  })

  it("仪器行不再携带可能过期的测试类型，列表使用主工单", () => {
    const state = createState()
    state.createForm.test_type = "高压测试"
    state.addInstrumentRow()
    expect(state.instrumentFormList.value.every((row: object) => !("test_type" in row))).toBe(true)
    expect(page).not.toContain("i.test_type || createForm.test_type")
    expect(page).toContain('row.test_type || "-"')
    expect(page).toContain('v-model="createForm.online_test"')
  })
})
