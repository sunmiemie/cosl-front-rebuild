import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("模拟井工单类型", () => {
  it("前端请求与类型声明包含工单类型", () => {
    const types = read("src/api/simulated-well/types/index.ts")

    expect(types).toContain("order_type: 0 | 1")
    expect(types).toContain('orderType?: "0" | "1"')
  })

  it("列表默认非研究院并按标签重新查询", () => {
    const component = read("src/views/testmanage/testorder/components/SimulationOrder.vue")

    expect(component).toContain('{ name: "0", label: "非研究院" }')
    expect(component).toContain('{ name: "1", label: "研究院" }')
    expect(component).toContain('const activeOrderType = ref<"0" | "1">("0")')
    expect(component).toContain("orderType: activeOrderType.value")
    expect(component).toContain("handleOrderTypeTabChange")
    expect(component).toContain('<el-radio :value="0">非研究院</el-radio>')
    expect(component).toContain('<el-radio :value="1">研究院</el-radio>')
  })

  it("详情抽屉通过待测仪器列表展示仪器名称和 SN 号", () => {
    const component = read("src/views/testmanage/testorder/components/SimulationOrder.vue")
    const drawerStart = component.indexOf("<el-drawer")
    const drawerEnd = component.indexOf("</el-drawer>", drawerStart)
    const drawer = component.slice(drawerStart, drawerEnd)

    expect(drawer).not.toContain('<el-descriptions-item label="待测仪器">')
    expect(drawer).not.toContain('<el-descriptions-item label="仪器SN号（资产号，多个）">')
    expect(drawer).toContain("待测仪器列表")
    expect(drawer).toContain('prop="device_name" label="仪器名称"')
    expect(drawer).toContain('prop="device_number" label="仪器SN号"')
    expect(drawer).toContain('description="暂无待测仪器"')
    expect(component).toContain('<el-table-column label="待测仪器"')
    expect(component).toContain('<el-form-item label="仪器明细" prop="instruments" required>')
  })
})
