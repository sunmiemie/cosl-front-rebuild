import { beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn()
}))

vi.mock("@/utils/service", () => ({
  request: requestMock
}))

import { getHighTemperatureOrderList } from "@/api/high-temperature"
import { getHighTempBoxReportPdfApi } from "@/api/high-temp-box-report"
import { getWaterCycleOrderListApi } from "@/api/water-cycle"
import { getWaterCycleReportPdfApi } from "@/api/water-cycle-report"
import {
  canRetryAssistantReportSync,
  getAssistantSyncFeedback,
  normalizeAssistantReportPushOutcome
} from "@/utils/assistant-report-sync"
import { buildReportInstrumentSnOptions, splitReportInstrumentSns } from "@/utils/report-instrument-sn"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("高温箱和水循环报告同步", () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue({ code: 0, data: {} })
  })

  it.each([
    ["high-temp-box", "test/high-temp-box/report/pdf/11/", getHighTempBoxReportPdfApi],
    ["water-cycle", "test/water-cycle/report/pdf/11/", getWaterCycleReportPdfApi]
  ])("%s 下载后端生成的正式 PDF", async (_reportType, url, downloadApi) => {
    await downloadApi(11)

    expect(requestMock).toHaveBeenCalledWith({
      url,
      method: "get",
      responseType: "blob"
    })
  })

  it("识别审核返回的 assistantSync，并允许已审核报告人工覆盖申请单快照", () => {
    expect(
      getAssistantSyncFeedback({ data: { assistantSync: { success: false, error: "assistant offline" } } })
    ).toEqual({
      success: false,
      error: "assistant offline"
    })
    expect(canRetryAssistantReportSync(1, "failed")).toBe(true)
    expect(canRetryAssistantReportSync(1, "success")).toBe(true)
    expect(canRetryAssistantReportSync(1, "syncing")).toBe(false)
    expect(canRetryAssistantReportSync(0, "failed")).toBe(false)
  })

  it("从工单仪器字段拆分中英文分隔符、斜杠并去重，且保留仪器名称", () => {
    expect(splitReportInstrumentSns("SN-1，SN-2;SN-3；SN-4\nSN-1、SN-5/SN-6")).toEqual([
      "SN-1",
      "SN-2",
      "SN-3",
      "SN-4",
      "SN-5",
      "SN-6"
    ])
    expect(
      buildReportInstrumentSnOptions([
        { instrumentName: "温度计", snNumbers: "SN-1,SN-2" },
        { instrument_name: "压力表", sn_numbers: "SN-2；SN-3" }
      ])
    ).toEqual([
      { value: "SN-1", label: "SN-1（温度计）", instrumentName: "温度计" },
      { value: "SN-2", label: "SN-2（温度计）", instrumentName: "温度计" },
      { value: "SN-3", label: "SN-3（压力表）", instrumentName: "压力表" }
    ])
  })

  it("高温箱和水循环报告表单复用工单列表中的 instruments.sn_numbers", async () => {
    requestMock
      .mockResolvedValueOnce({
        code: 0,
        data: {
          list: [
            {
              id: 1,
              task_number: "HT-001",
              instruments: [{ instrument_name: "仪器A", sn_numbers: "HT-SN-001", quantity: 1 }]
            }
          ]
        }
      })
      .mockResolvedValueOnce({ code: 0, data: { list: [], total: 0 } })

    const highTempResult = await getHighTemperatureOrderList({ page: 1, pageSize: 50, taskNumber: "HT-001" })
    await getWaterCycleOrderListApi({ page: 1, pageSize: 50, taskNumber: "WC-001" })

    expect(highTempResult.data.list[0]).toMatchObject({
      taskNumber: "HT-001",
      instruments: [{ instrumentName: "仪器A", snNumbers: "HT-SN-001" }]
    })
    expect(requestMock).toHaveBeenNthCalledWith(2, {
      url: "test/water-cycle/order/list/",
      method: "get",
      params: { page: 1, pageSize: 50, taskNumber: "WC-001" }
    })
  })

  it("单条接口 code=0 但 data.success=false 时仍判定为推送失败", () => {
    expect(
      normalizeAssistantReportPushOutcome({
        code: 0,
        data: {
          result: {
            success: false,
            failed: 1,
            list: [{ success: false, reason: "小助手申请单状态不允许接收报告" }]
          }
        }
      })
    ).toEqual({
      success: false,
      failed: 1,
      error: "小助手申请单状态不允许接收报告"
    })

    expect(normalizeAssistantReportPushOutcome({ data: { success: true, failed: 0 } }).success).toBe(true)
  })

  it.each([
    ["HighTemperatureReport.vue", "high-temp-box", "getHighTempBoxReportPdfApi"],
    ["WaterCycleReport.vue", "water-cycle", "getWaterCycleReportPdfApi"]
  ])("%s 绑定工单内一个 SN、展示同步状态并只支持本申请单重推", (filename, reportType, downloadApi) => {
    const content = read(`src/views/datamanage/historymange/components/${filename}`)

    expect(content).toContain("assistant_sync_status")
    expect(content).toContain("assistant_synced_at")
    expect(content).toContain("assistant_sync_error")
    expect(content).toContain("assistant_sync_retry_count")
    expect(content).toContain(downloadApi)
    expect(content).toContain('prop="instrument_sn"')
    expect(content).toContain('v-model="formData.instrument_sn"')
    expect(content).toContain("instrumentSnOptions")
    expect(content).toContain("buildReportInstrumentSnOptions")
    expect(content).toContain("所选 SN 不属于当前任务单")
    expect(content).toContain("重新推送本申请单报告")
    expect(content).toContain('v-if="row.status === 0" type="warning"')
    expect(content).toContain('v-if="row.status === 0" type="danger"')
    expect(content).toContain('v-if="row.status === 1"')
    expect(content).toContain("本申请单当前报告快照已推送小助手")
    expect(content).toContain('action: "push"')
    expect(content).toContain(`reportType: "${reportType}"`)
    expect(content).toContain("force: true")
    expect(content).not.toContain("全量同步小助手")
    expect(content).not.toContain('scope: "all"')
    expect(content).not.toContain("requestBulkAssistantSync")
    expect(content).not.toContain("JSON.stringify(payload")
    expect(content).not.toContain(".json`")
  })

  it("统一报告同步 API 的本地来源类型不再暴露跨申请单 scope=all", () => {
    const content = read("src/api/engineer-assistant/types.ts")

    expect(content).toContain("reportId: number")
    expect(content).toContain("force?: boolean")
    expect(content).not.toContain('scope: "all"')
  })

  it("审核页只为高温箱和水循环处理失败后的立即重推，不接入 HALT&HASS", () => {
    const content = read("src/views/datamanage/report/components/GenericEquipmentReportReview.vue")

    expect(content).toContain('props.reportType === "water-cycle"')
    expect(content).toContain('props.reportType === "high-temp-box"')
    expect(content).toContain("getAssistantSyncFeedback")
    expect(content).toContain("立即重试")
    expect(content).toContain("本地审核已经成功，不会回滚")
    expect(content).toContain('prop="instrument_sn" label="被测 SN"')
    expect(content).toContain('label="被测 SN">{{ currentReport.instrument_sn')
    expect(content).not.toContain("halt-hass")
  })
})
