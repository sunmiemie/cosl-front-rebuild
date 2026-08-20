import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const pagePath = "src/views/datamanage/simulated-well-report-template/index.vue"
const content = readFileSync(resolve(root, pagePath), "utf8")

describe("simulated well report template create dialog", () => {
  it("uses a compact empty state for parsed field sections", () => {
    expect(content).toContain(
      '<div v-if="createParsedFields[section.key].length === 0" class="parsed-section-empty">暂无字段</div>'
    )
    expect(content).not.toContain(
      '<el-empty v-if="createParsedFields[section.key].length === 0" :image-size="40" description="暂无字段" />'
    )
    expect(content).toContain(".parsed-section-empty")
  })

  it("keeps every parsed field section and its add action available", () => {
    expect(content).toContain('v-for="section in sectionTabs"')
    expect(content).toContain('@click="addParsedField(section.key)"')
  })

  it("previews the transfer data section and its dynamic columns", () => {
    expect(content).toContain('{ key: "transfer_data_records" as SectionKey, label: "转样数据" }')
    expect(content).toContain("createParsedFields.transfer_data_records")
    expect(content).toContain('class="parsed-field-columns"')
    expect(content).toContain('v-for="(column, columnIndex) in field.columns"')
  })
})
