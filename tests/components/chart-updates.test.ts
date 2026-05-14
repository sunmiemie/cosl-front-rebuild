import { afterEach, describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Chart from "@/components/Echarts/echarts.vue"
const { init, chart } = vi.hoisted(() => {
  const chart = { on: vi.fn(), setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn(), dispatchAction: vi.fn() }
  return { chart, init: vi.fn(() => chart) }
})
vi.mock("echarts", () => ({ init }))
describe("图表更新和尺寸", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })
  it("option 替换时更新现有图表，数字尺寸使用 px", async () => {
    const wrapper = mount(Chart, { props: { option: {}, width: 400, height: 240 } })
    await wrapper.setProps({ option: { title: { text: "更新" } } })
    expect(init).toHaveBeenCalledOnce()
    expect(chart.setOption).toHaveBeenLastCalledWith({ title: { text: "更新" } }, true)
    expect(wrapper.attributes("style")).toContain("width: 400px")
    wrapper.unmount()
    expect(chart.dispose).toHaveBeenCalledOnce()
  })
})
