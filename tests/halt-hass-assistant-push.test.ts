import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { HaltHassProcessDetail, HaltHassProcessListItem } from "../src/api/halt-hass/types"
import {
  HALT_HASS_ASSISTANT_PROCESS_GROUP,
  buildHaltHassAssistantProcessItem,
  canPushHaltHassProcess
} from "../src/views/testmanage/process/halt-hass-assistant-push"

const listItem: HaltHassProcessListItem = {
  id: 72,
  name: "HALT 筛选工艺",
  version: "1.0.0",
  status: 3,
  boardGroups: [],
  createdAt: "2026-08-11 10:00:00",
  userName: "admin",
  auditNum: 1,
  active: 1
}

const detail: HaltHassProcessDetail = {
  ...listItem,
  processJson: {
    metadata: {
      description: "HALT 高低温振动筛选"
    }
  },
  feedback: []
}

describe("HALT-HASS 工艺推送小助手", () => {
  it("固定使用 HALT&HASS 箱测试类型", () => {
    expect(HALT_HASS_ASSISTANT_PROCESS_GROUP).toEqual({
      testTypeId: "1",
      testTypeName: "HALT&HASS箱"
    })
  })

  it("仅允许已通过审核的工艺被选择", () => {
    const inactiveApprovedItem: HaltHassProcessListItem = { ...listItem, active: 0 }

    expect(canPushHaltHassProcess(listItem)).toBe(true)
    expect(canPushHaltHassProcess(inactiveApprovedItem)).toBe(true)
    expect(canPushHaltHassProcess({ status: 0 })).toBe(false)
    expect(canPushHaltHassProcess({ status: 1 })).toBe(false)
    expect(canPushHaltHassProcess({ status: 2 })).toBe(false)
  })

  it("生成与现有工艺推送接口兼容的完整明细", () => {
    expect(buildHaltHassAssistantProcessItem(listItem, detail)).toEqual({
      processId: "72",
      processName: "HALT 筛选工艺",
      processDescription: "HALT 高低温振动筛选",
      xssj: ""
    })
  })

  it("没有元数据说明时生成可读的说明", () => {
    expect(buildHaltHassAssistantProcessItem(listItem, { ...detail, processJson: null }).processDescription).toBe(
      "HALT-HASS 工艺 HALT 筛选工艺 V1.0.0"
    )
  })

  it("旧工艺元数据说明不是字符串时仍可正常组包", () => {
    const legacyDetail = {
      ...detail,
      processJson: { metadata: { description: 123 } }
    } as unknown as HaltHassProcessDetail

    expect(buildHaltHassAssistantProcessItem(listItem, legacyDetail).processDescription).toBe(
      "HALT-HASS 工艺 HALT 筛选工艺 V1.0.0"
    )
  })

  it("主测试工艺页面已绑定选择列和推送按钮", () => {
    const page = readFileSync(resolve(__dirname, "../src/views/testmanage/process/index.vue"), "utf8")

    expect(page).toContain(':selectable="canPushHaltHassProcess"')
    expect(page).toContain('@selection-change="handleHaltHassSelectionChange"')
    expect(page).toContain('@click="pushSelectedHaltHassProcesses"')
    expect(page).toContain("pushEngineerAssistantProcessesApi")
  })
})
