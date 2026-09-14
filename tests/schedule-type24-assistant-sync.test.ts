import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it, vi } from "vitest"
import { transpileModule } from "typescript"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("type2/type4 schedule assistant sync", () => {
  // 运行页面中的反馈函数，验证异步入队不会被误报为已经同步成功。
  const page = read("src/views/dashboard/work-order-schedule/index.vue")
  const feedbackSource = page.slice(
    page.indexOf("function showScheduleSaveFeedback("),
    page.indexOf("async function handlePushAssistantSchedule(")
  )
  const createFeedback = new Function(
    "ElMessage", "isAssistantScheduleEquipment",
    transpileModule(feedbackSource, {}).outputText + "\nreturn showScheduleSaveFeedback"
  )

  it.each([
    [{ success: true, queued: true }, "info", "排程已保存，小助手同步处理中"],
    [{ success: true }, "success", "排程已保存，并已推送小助手"],
    [{ success: true, skipped: true, reason: "not_assistant_order" }, "success", "排程已保存"],
    [{ success: false, list: [{ reason: "external_status_not_allowed" }] }, "warning", "排程已保存，但推送小助手失败：external_status_not_allowed"]
  ])("shows the actual synchronization outcome: %j", (assistantSync, level, text) => {
    const messages = { info: vi.fn(), success: vi.fn(), warning: vi.fn() }
    createFeedback(messages, () => true)({ scheduleEquipment: "high-temp-box" }, { data: { assistantSync } })
    expect(messages[level as keyof typeof messages]).toHaveBeenCalledWith(text)
    expect(Object.values(messages).reduce((count, fn) => count + fn.mock.calls.length, 0)).toBe(1)
  })

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
