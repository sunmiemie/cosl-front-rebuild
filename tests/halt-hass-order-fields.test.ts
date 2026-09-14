import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  buildHaltHassCreatePayload,
  getHaltHassCircuitBoardStatusText,
  getHaltHassExperimentTypeText,
  getHaltHassOrderField,
  isHaltHassCreateFormReady,
  type HaltHassCreateFormModel
} from "../src/views/testmanage/testorder/components/halt-hass-order-helpers"

const completeForm = (overrides: Partial<HaltHassCreateFormModel> = {}): HaltHassCreateFormModel => ({
  productModelId: 18,
  clientTestType: 1,
  boardGroupId: 5,
  testApplicationUnit: "中海油委托单位",
  researchNumber: "KY-001",
  projectBudgetNumber: "YS-2026-001",
  projectName: "电路板可靠性试验",
  address: "天津市滨海新区",
  applicant: "张三",
  phone: "022-12345678",
  mobile: "13800138000",
  experimentType: "halt",
  circuitBoardStatus: "development",
  taskExecutionDescription: "按要求完成高低温、振动循环并记录逐板结果",
  cycleCount: 3,
  workbenchTestName: "常规HASS测试",
  remark: "保留原备注",
  ...overrides
})

const selectedBoards = [
  { id: 101, serial: "PCB-A", boardModelId: 11, boardModelName: "接口板", boardModelCode: "IF" },
  { id: 102, serial: "PCB-B", boardModelId: 12, boardModelName: "控制板", boardModelCode: "CTRL" }
]

describe("HALT-HASS 新增工单字段", () => {
  it("主工单组件保留原创建属性并展示新增字段", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/views/testmanage/testorder/components/HaltHassOrder.vue"),
      "utf-8"
    )

    for (const text of [
      "电路板组",
      "产品型号",
      "客户端测试类型",
      "选择电路板",
      "备注",
      "委托单位",
      "科研编号",
      "项目预算编号",
      "项目名称",
      "地址",
      "联系人（申请人）",
      "电话",
      "手机",
      "实验类型",
      "试验电路板状态",
      "详细任务执行流程",
      "循环次数",
      "默认温振曲线",
      "HALT（高温-低温-振动三项）",
      "HASS",
      "研发",
      "故障激发",
      "制造"
    ]) {
      expect(content).toContain(text)
    }

    expect(content).toContain("buildHaltHassCreatePayload")
    expect(content).toContain("isHaltHassCreateFormReady")
    expect(content).toContain("loadProductRouting")
  })

  it("构建工单 payload 时只固化产品路由和任务要求", () => {
    const payload = buildHaltHassCreatePayload({
      form: completeForm(),
      creatorId: 99,
      boardCount: 2,
      selectedBoards
    })

    expect(payload).toMatchObject({
      productModelId: 18,
      product_model_id: 18,
      boardGroupId: 5,
      boardCount: 2,
      creatorId: 99,
      board_group_id: 5,
      board_count: 2,
      creator_id: 99,
      cycleCount: 3,
      cycle_count: 3,
      taskExecutionDescription: "按要求完成高低温、振动循环并记录逐板结果",
      task_execution_description: "按要求完成高低温、振动循环并记录逐板结果",
      workbenchTestName: "常规HASS测试",
      workbench_test_name: "常规HASS测试",
      testApplicationUnit: "中海油委托单位",
      test_application_unit: "中海油委托单位",
      researchNumber: "KY-001",
      research_number: "KY-001",
      projectBudgetNumber: "YS-2026-001",
      project_budget_number: "YS-2026-001",
      projectName: "电路板可靠性试验",
      project_name: "电路板可靠性试验",
      address: "天津市滨海新区",
      applicant: "张三",
      phone: "022-12345678",
      mobile: "13800138000",
      experimentType: "halt",
      experiment_type: "halt",
      circuitBoardStatus: "development",
      circuit_board_status: "development",
      remark: "保留原备注"
    })
    expect(payload.boardSerials).toEqual([
      { serial: "PCB-A", boardModelId: 11, boardModelName: "接口板", boardModelCode: "IF" },
      { serial: "PCB-B", boardModelId: 12, boardModelName: "控制板", boardModelCode: "CTRL" }
    ])
    expect(payload.board_serials).toEqual([
      { serial: "PCB-A", board_model_id: 11, board_model_name: "接口板", board_model_code: "IF" },
      { serial: "PCB-B", board_model_id: 12, board_model_name: "控制板", board_model_code: "CTRL" }
    ])
  })

  it("表单完整性要求任务说明和电路板选择都满足", () => {
    expect(isHaltHassCreateFormReady(completeForm(), true)).toBe(true)
    expect(isHaltHassCreateFormReady(completeForm({ phone: "" }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ mobile: "" }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ cycleCount: 0 }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ cycleCount: 1.5 }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ workbenchTestName: "" }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm(), false)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ taskExecutionDescription: "" }), true)).toBe(false)
  })

  it("兼容列表和详情中的 camelCase / snake_case 字段显示", () => {
    const order = {
      test_application_unit: "委托单位A",
      projectName: "项目B",
      experiment_type: "hass",
      circuit_board_status: "fault_excitation"
    }

    expect(getHaltHassOrderField(order, "testApplicationUnit", "test_application_unit")).toBe("委托单位A")
    expect(getHaltHassOrderField(order, "projectName", "project_name")).toBe("项目B")
    expect(getHaltHassExperimentTypeText("halt")).toBe("HALT（高温-低温-振动三项）")
    expect(getHaltHassExperimentTypeText(order.experiment_type)).toBe("HASS")
    expect(getHaltHassCircuitBoardStatusText(order.circuit_board_status)).toBe("故障激发")
  })

  it("旧隐藏 HALT-HASS 工单页复用主工单组件", () => {
    const content = readFileSync(resolve(process.cwd(), "src/views/testmanage/halt-hass-order/index.vue"), "utf-8")

    expect(content).toContain("testorder/components/HaltHassOrder.vue")
    expect(content).not.toContain("createHaltHassOrder")
  })
})
