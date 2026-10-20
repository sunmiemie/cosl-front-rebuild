import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount, type VueWrapper } from "@vue/test-utils"
import { nextTick } from "vue"
import ElementPlus from "element-plus"
import SimulationOrder from "@/views/testmanage/testorder/components/SimulationOrder.vue"

const { createOrder, getList } = vi.hoisted(() => ({
  createOrder: vi.fn(),
  getList: vi.fn()
}))

vi.mock("@/api/simulated-well", () => ({
  createSimulatedWellOrderApi: createOrder,
  getSimulatedWellOrderListApi: getList,
  getSimulatedWellOrderDetailApi: vi.fn(),
  deleteSimulatedWellOrderApi: vi.fn(),
  publishSimulatedWellOrderApi: vi.fn()
}))
vi.mock("@/api/signature", () => ({ getMySignatureApi: vi.fn(), getSignatureImageApi: vi.fn() }))
vi.mock("@/store/modules/task-center", () => ({ useTaskCenterStoreHook: () => ({ refresh: vi.fn() }) }))
vi.mock("vue-router", () => ({ useRoute: () => ({ query: {}, fullPath: "" }) }))

describe("模拟井新增工单仪器明细", () => {
  let wrapper: VueWrapper
  // 访问表单状态以验证真实 Element Plus 表单校验和最终 API 请求。
  const state = () => (wrapper.vm as any).$.setupState
  const clickButton = async (label: string) => {
    const button = wrapper.findAll("button").find((item) => item.text() === label)
    expect(button).toBeDefined()
    await button!.trigger("click")
    await flushPromises()
  }
  const fillRequiredFields = () => {
    Object.assign(state().createForm, {
      applicant: "申请人",
      test_unit: "测试单位",
      project_name: "项目",
      well_name: "cosl1",
      test_purpose: "测试目的",
      test_steps: "测试步骤",
      safety_risks: "安全措施"
    })
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    getList.mockResolvedValue({ code: 0, data: { list: [], total: 0 } })
    createOrder.mockResolvedValue({ code: 0 })
    wrapper = mount(SimulationOrder, {
      global: {
        plugins: [ElementPlus],
        stubs: {
          ElDialog: { props: ["modelValue"], template: '<div v-if="modelValue"><slot /><slot name="footer" /></div>' },
          ElDrawer: true
        }
      }
    })
    await clickButton("新增")
  })

  afterEach(() => wrapper.unmount())

  it("默认一行，增删行重算数量，文本编辑保留手动数量，最后一行不可删除", async () => {
    expect(state().createForm.instruments).toEqual([{ device_name: "", device_number: "" }])
    expect(state().createForm.quantity).toBe(1)
    expect(wrapper.find(".instrument-editor button").attributes("disabled")).toBeDefined()

    state().createForm.quantity = 8
    await clickButton("添加仪器")
    expect(state().createForm.instruments).toHaveLength(2)
    expect(state().createForm.quantity).toBe(2)

    state().createForm.quantity = 9
    await wrapper.find('.instrument-editor input[placeholder="请输入待测仪器"]').setValue("仪器 A")
    await wrapper.find('.instrument-editor input[placeholder="请输入一个仪器 SN 号"]').setValue("SN-A")
    expect(state().createForm.quantity).toBe(9)
    await clickButton("删除")
    expect(state().createForm.instruments).toHaveLength(1)
    expect(state().createForm.quantity).toBe(1)
    state().removeInstrument(0)
    expect(state().createForm.instruments).toHaveLength(1)
  })

  it("重新打开时清空仪器并恢复数量 1", async () => {
    await clickButton("添加仪器")
    state().createForm.instruments[0].device_name = "旧仪器"
    state().createForm.quantity = 12
    await clickButton("取消")
    await clickButton("新增")
    expect(state().createForm.instruments).toEqual([{ device_name: "", device_number: "" }])
    expect(state().createForm.quantity).toBe(1)
  })

  it.each(["device_name", "device_number"])("第 2 行 %s 仅有空白时阻止提交并提示行号", async (field) => {
    fillRequiredFields()
    await clickButton("添加仪器")
    state().createForm.instruments = [
      { device_name: "仪器 A", device_number: "SN-A" },
      { device_name: "仪器 B", device_number: "SN-B", [field]: "  " }
    ]
    await clickButton("保存")
    expect(createOrder).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(wrapper.text()).toContain("请填写第 2 行的仪器名称和 SN 号"))
  })

  it.each([undefined, 0, -1, 1.5])("数量 %s 被表单校验拒绝", async (quantity) => {
    fillRequiredFields()
    state().createForm.instruments = [{ device_name: "仪器 A", device_number: "SN-A" }]
    await nextTick()
    // 校验原始模型值，避免输入控件的最小值及精度归一化掩盖校验错误。
    state().createForm.quantity = quantity
    await expect(state().createFormRef.validateField("quantity")).rejects.toHaveProperty("quantity")
    expect(createOrder).not.toHaveBeenCalled()
  })

  it("数量清空后保存不能提交", async () => {
    fillRequiredFields()
    state().createForm.instruments = [{ device_name: "仪器 A", device_number: "SN-A" }]
    state().createForm.quantity = undefined
    await clickButton("保存")
    expect(createOrder).not.toHaveBeenCalled()
    await vi.waitFor(() => expect(wrapper.text()).toContain("请输入数量"))
  })

  it("名称与 SN 按行配对、去除首尾空格，提交手动数量和兼容字段", async () => {
    fillRequiredFields()
    await clickButton("添加仪器")
    state().createForm.instruments = [
      { device_name: " 仪器 A ", device_number: " SN-A " },
      { device_name: " 仪器 B ", device_number: " SN-B " }
    ]
    state().createForm.quantity = 5
    await clickButton("保存")
    expect(createOrder).toHaveBeenCalledOnce()
    const payload = createOrder.mock.calls[0][0]
    expect(payload).toMatchObject({
      devices: [
        { device_name: "仪器 A", device_number: "SN-A" },
        { device_name: "仪器 B", device_number: "SN-B" }
      ],
      tested_instrument: "仪器 A\n仪器 B",
      instrument_sn_numbers: "SN-A\nSN-B",
      quantity: 5,
      device_count: 5
    })
    expect(payload).not.toHaveProperty("instruments")
    expect(state().createDialogVisible).toBe(false)
  })
})
