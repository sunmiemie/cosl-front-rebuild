import { beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn()
}))

vi.mock("@/utils/service", () => ({
  request: requestMock
}))

import { syncEngineerAssistantReportsApi } from "@/api/engineer-assistant"
import type { SyncEngineerAssistantReportsBody } from "@/api/engineer-assistant/types"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("工程师小助手统一报告同步接口", () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({ code: 0, data: {} })
  })

  it("本地报告使用唯一同步路径并原样提交判别字段", async () => {
    const data = {
      source: "local",
      action: "push",
      reportType: "vibration-table",
      reportId: 123
    } satisfies SyncEngineerAssistantReportsBody

    await syncEngineerAssistantReportsApi(data)

    expect(requestMock).toHaveBeenCalledOnce()
    expect(requestMock).toHaveBeenCalledWith({
      url: "external/assistant/sync/reports/",
      method: "post",
      data
    })
  })

  it("完整报文也通过同一接口，并支持明确的预演动作", async () => {
    const data = {
      source: "payload",
      action: "preview",
      verifyStatus: true,
      testReportList: [
        {
          id: "application-43",
          testType: "5",
          status: "9",
          data: [
            {
              filename: "vibration-report.pdf",
              equipmentId: "equipment-1",
              equipmentName: "振动台",
              fileContent: "JVBERi0xLjQK",
              description: "振动台测试报告",
              status: "已完成"
            }
          ]
        }
      ]
    } satisfies SyncEngineerAssistantReportsBody

    await syncEngineerAssistantReportsApi(data)

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "external/assistant/sync/reports/",
        data
      })
    )
  })

  it.each([
    ["VibrationReport.vue", "vibration-table"],
    ["SimulationWellReport.vue", "simulated-well"],
    ["HighTemperaturePressureReport.vue", "high-temp-pressure"]
  ])("%s 显式提交本地来源、正式推送动作和报告类型", (filename, reportType) => {
    const content = read(`src/views/datamanage/historymange/components/${filename}`)

    expect(content).toContain("syncEngineerAssistantReportsApi")
    expect(content).toContain('source: "local"')
    expect(content).toContain('action: "push"')
    expect(content).toContain(`reportType: "${reportType}"`)
    expect(content).toContain("reportId: row.id")
    expect(content).not.toContain("syncEngineerAssistantLocalReportApi")
  })

  it("前端 API 模块不再暴露两个旧报告入口", () => {
    const content = read("src/api/engineer-assistant/index.ts")

    expect(content).not.toContain("sync/local-report")
    expect(content).not.toContain("push-reports")
    expect(content).not.toContain("syncEngineerAssistantLocalReportApi")
    expect(content).not.toContain("pushEngineerAssistantReportsApi")
  })
})
