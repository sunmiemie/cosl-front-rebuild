import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("主机使用记录日期筛选", () => {
  const page = read("src/views/devicemanage/device/psi/index.vue")
  const types = read("src/api/host-maintenance/types/index.ts")

  it("把日期范围传给后端并支持查询和清空", () => {
    expect(types).toContain("usage_date_start?: string")
    expect(types).toContain("usage_date_end?: string")
    expect(page).toContain("ref<[string, string] | null>(null)")
    expect(page).toContain("usage_date_start: usageDateRange.value?.[0]")
    expect(page).toContain("usage_date_end: usageDateRange.value?.[1]")
    expect(page).toContain("clearUsageDateRange")
    expect(page).toContain("usageDateRange.value = null")
  })

  it("累计使用时长固定取主机配置总时长，不受筛选结果影响", () => {
    expect(page).toContain("Number(hostConfig.value?.total_hours || 0)")
    expect(page).not.toContain(
      "usageRecords.value.reduce((total, item) => total + Number(item.duration_hours || 0), 0)"
    )
  })
})
