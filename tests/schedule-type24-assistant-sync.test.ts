import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("type2/type4 schedule assistant sync", () => {
  it("allows high-temp-box and water-cycle for manual schedule retry", () => {
    const types = read("src/api/engineer-assistant/types.ts")

    expect(types).toContain('| "high-temp-box"')
    expect(types).toContain('| "water-cycle"')
  })

  it("shows automatic sync success and isolated failure after saving schedule", () => {
    const page = read("src/views/dashboard/work-order-schedule/index.vue")

    expect(page).toContain('equipment === "high-temp-box"')
    expect(page).toContain('equipment === "water-cycle"')
    expect(page).toContain("response?.data?.assistantSync")
    expect(page).toContain("排程已保存，并已推送小助手")
    expect(page).toContain("排程已保存，但推送小助手失败")
    expect(page).toContain("showScheduleSaveFeedback(order, response)")
  })
})
