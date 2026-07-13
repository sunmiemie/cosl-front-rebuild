import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  OTHER_PROCESS_VALUE,
  buildHaltHassCreatePayload,
  filterHaltHassProcesses,
  getHaltHassCircuitBoardStatusText,
  getHaltHassExperimentTypeText,
  getHaltHassOrderField,
  isHaltHassCreateFormReady,
  type HaltHassCreateFormModel
} from "../src/views/testmanage/testorder/components/halt-hass-order-helpers"
import type { HaltHassVersionItem } from "../src/api/halt-hass/types"

const completeForm = (overrides: Partial<HaltHassCreateFormModel> = {}): HaltHassCreateFormModel => ({
  boardGroupId: 5,
  processSelection: 36,
  processId: 36,
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
  otherProcessName: "",
  cycleCount: 3,
  singleCycleDurationHours: 1.25,
  remark: "保留原备注",
  ...overrides
})

const selectedBoards = {
  11: { id: 101, serial: "PCB-A" },
  12: { id: 102, serial: "PCB-B" }
}

describe("HALT-HASS 新增工单字段", () => {
  it("主工单组件保留原创建属性并展示新增字段", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/views/testmanage/testorder/components/HaltHassOrder.vue"),
      "utf-8"
    )

    for (const text of [
      "电路板组",
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
      "选择测试工艺",
      "循环次数",
      "单循环时长",
      "循环总时长",
      "HALT（高温-低温-振动三项）",
      "HASS",
      "研发",
      "故障激发",
      "制造",
      "其他"
    ]) {
      expect(content).toContain(text)
    }

    expect(content).toContain("buildHaltHassCreatePayload")
    expect(content).toContain("filterHaltHassProcesses")
    expect(content).toContain("isHaltHassCreateFormReady")
    expect(content).toContain("loadHaltHassProcessList")
    expect(content).toContain("await loadHaltHassProcessList(createForm.boardGroupId)")
  })

  it("构建已有工艺 payload 时保留原字段并写入新增数据库字段", () => {
    const payload = buildHaltHassCreatePayload({
      form: completeForm(),
      creatorId: 99,
      boardCount: 2,
      selectedBoards
    })

    expect(payload).toMatchObject({
      boardGroupId: 5,
      processId: 36,
      boardCount: 2,
      creatorId: 99,
      board_group_id: 5,
      process_id: 36,
      board_count: 2,
      creator_id: 99,
      cycleCount: 3,
      cycle_count: 3,
      singleCycleDurationHours: 1.25,
      single_cycle_duration_hours: 1.25,
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
      processSelection: "existing",
      process_selection: "existing",
      remark: "保留原备注"
    })
    expect(payload.boardSerials).toEqual([
      { serial: "PCB-A", boardModelId: 11 },
      { serial: "PCB-B", boardModelId: 12 }
    ])
    expect(payload.board_serials).toEqual([
      { serial: "PCB-A", board_model_id: 11 },
      { serial: "PCB-B", board_model_id: 12 }
    ])
  })

  it("构建其他工艺 payload 时不发送假 processId 并写入其他工艺名称", () => {
    const payload = buildHaltHassCreatePayload({
      form: completeForm({
        processSelection: OTHER_PROCESS_VALUE,
        processId: null,
        otherProcessName: "其他环境筛选流程"
      }),
      creatorId: 99,
      boardCount: 2,
      selectedBoards
    })

    expect(payload).not.toHaveProperty("processId")
    expect(payload).not.toHaveProperty("process_id")
    expect(payload).toMatchObject({
      processSelection: "other",
      process_selection: "other",
      otherProcessName: "其他环境筛选流程",
      other_process_name: "其他环境筛选流程",
      cycleCount: 3,
      cycle_count: 3,
      singleCycleDurationHours: 1.25,
      single_cycle_duration_hours: 1.25
    })
  })

  it("根据实验类型过滤工艺，未分类工艺作为兜底同时显示", () => {
    const processes = [
      {
        id: 1,
        name: "HALT 高低温振动",
        version: "v1",
        status: 3,
        active: 1,
        createdAt: "",
        experiment_type: "halt"
      },
      {
        id: 2,
        name: "HASS 筛选",
        version: "v1",
        status: 3,
        active: 0,
        createdAt: "",
        experimentType: "hass"
      },
      {
        id: 3,
        name: "通用流程",
        version: "v1",
        status: 3,
        active: 0,
        createdAt: ""
      },
      {
        id: 4,
        name: "草稿 HALT",
        version: "v1",
        status: 0,
        active: 0,
        createdAt: "",
        experiment_type: "halt"
      }
    ] as HaltHassVersionItem[]

    expect(filterHaltHassProcesses(processes, "halt").map((item) => item.id)).toEqual([1, 3])
    expect(filterHaltHassProcesses(processes, "hass").map((item) => item.id)).toEqual([2, 3])
  })

  it("表单完整性要求新增字段、工艺选择和电路板选择都满足", () => {
    expect(isHaltHassCreateFormReady(completeForm(), true)).toBe(true)
    expect(isHaltHassCreateFormReady(completeForm({ phone: "" }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ mobile: "" }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ cycleCount: 0 }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ cycleCount: 1.5 }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ singleCycleDurationHours: null }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm({ singleCycleDurationHours: 1.234 }), true)).toBe(false)
    expect(isHaltHassCreateFormReady(completeForm(), false)).toBe(false)
    expect(
      isHaltHassCreateFormReady(
        completeForm({
          processSelection: OTHER_PROCESS_VALUE,
          processId: null,
          otherProcessName: ""
        }),
        true
      )
    ).toBe(false)
    expect(
      isHaltHassCreateFormReady(
        completeForm({
          processSelection: OTHER_PROCESS_VALUE,
          processId: null,
          otherProcessName: "其他环境筛选流程"
        }),
        true
      )
    ).toBe(true)
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
