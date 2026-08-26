import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const pageSource = () =>
  readFileSync(resolve(process.cwd(), "src/views/ordermanage/summary/index.vue"), "utf-8")

describe("commission board relation summary page", () => {
  it("keeps operation controls on the summary page without the retired batch export", () => {
    const source = pageSource()

    expect(source).toContain('fixed="right"')
    expect(source).not.toContain('type="selection"')
    expect(source).not.toContain("selectedRows")
    expect(source).not.toContain("handleExport")
    expect(source).not.toContain("data/commission-board-relation/export")
  })

  it("shows work hours and removes the quantity column from the table", () => {
    const source = pageSource()

    expect(source).toContain('prop="hours" label="工时(h)"')
    expect(source).toContain("formatHours(row.hours)")
    expect(source).not.toContain('prop="qty" label="数量"')
  })
})
