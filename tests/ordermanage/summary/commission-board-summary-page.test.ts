import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const pageSource = () =>
  readFileSync(resolve(process.cwd(), "src/views/ordermanage/summary/index.vue"), "utf-8")

describe("commission board relation summary page", () => {
  it("keeps batch export and operation controls on the summary page", () => {
    const source = pageSource()

    expect(source).toContain('type="selection"')
    expect(source).toContain('fixed="right"')
    expect(source).toContain("selectedRows")
    expect(source).toContain("handleExport")
    expect(source).toContain("data/commission-board-relation/export")
  })

  it("shows work hours and removes the quantity column from the table", () => {
    const source = pageSource()

    expect(source).toContain('prop="hours" label="工时(h)"')
    expect(source).toContain("formatHours(row.hours)")
    expect(source).not.toContain('prop="qty" label="数量"')
  })
})
