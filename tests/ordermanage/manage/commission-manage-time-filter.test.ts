import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const source = () => readFileSync(resolve(process.cwd(), "src/views/ordermanage/manage/index.vue"), "utf-8")

describe("commission order manage time filter", () => {
  it("provides an updated time range filter and sends it to the list api", () => {
    const page = source()

    expect(page).toContain('label="更新时间"')
    expect(page).toContain('type="daterange"')
    expect(page).toContain("updatedRange")
    expect(page).toContain("updatedStart")
    expect(page).toContain("updatedEnd")
  })
})
