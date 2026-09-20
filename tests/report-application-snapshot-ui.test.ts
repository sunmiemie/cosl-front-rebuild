import { beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn()
}))

vi.mock("@/utils/service", () => ({
  request: requestMock
}))

import { getVibrationTableReportPdfApi } from "@/api/vibration-table-report"
import { downloadPdfBlob } from "@/utils/assistant-report-sync"
import { buildReportInstrumentSnOptions } from "@/utils/report-instrument-sn"

const root = resolve(__dirname, "..")
const read = (path: string) => readFileSync(resolve(root, path), "utf8")

describe("type3/type5/type7 申请单报告快照前端", () => {
  beforeEach(() => {
    requestMock.mockReset()
    requestMock.mockResolvedValue(new Blob(["%PDF-1.7"], { type: "application/pdf" }))
  })

  it("振动台下载后端正式 PDF，而不是导出本地 JSON", async () => {
    await getVibrationTableReportPdfApi(37)

    expect(requestMock).toHaveBeenCalledWith({
      url: "test/vibration-table/report/pdf/37/",
      method: "get",
      responseType: "blob"
    })

    const page = read("src/views/datamanage/historymange/components/VibrationReport.vue")
    expect(page).toContain("getVibrationTableReportPdfApi")
    expect(page).toContain("downloadPdfBlob")
    expect(page).not.toContain("JSON.stringify(payload")
    expect(page).not.toContain(".json`")
  })

  it("PDF 下载工具拒绝非 PDF 响应", async () => {
    await expect(downloadPdfBlob(new Blob(['{"code":-1}'], { type: "application/json" }), "报告")).rejects.toThrow(
      "不是有效 PDF"
    )
  })

  it("高温高压和振动台报告显式绑定唯一工单内一个 SN", () => {
    const pages = [
      read("src/views/datamanage/historymange/components/HighTemperaturePressureReport.vue"),
      read("src/views/datamanage/historymange/components/VibrationReport.vue")
    ]

    for (const page of pages) {
      expect(page).toContain('v-model="formData.instrument_sn"')
      expect(page).toContain("instrumentSnOptions")
      expect(page).toContain("buildReportInstrumentSnOptions")
      expect(page).toContain("instrument_sn: formData.instrument_sn")
      expect(page).toContain("order_ids: [order.id]")
      expect(page).toContain("所选 SN 不属于当前任务单")
      expect(page).not.toContain('multiple\n            v-model="formData.task_number"')
    }
  })

  it("高温高压报告将业务编号作为只读快照展示在报告ID之后", () => {
    const api = read("src/api/high-temp-pressure-report/index.ts")
    const review = read("src/views/datamanage/report/components/GenericEquipmentReportReview.vue")
    const history = read("src/views/datamanage/historymange/components/HighTemperaturePressureReport.vue")
    const payloadBlock = history.slice(
      history.indexOf("const payload = {"),
      history.indexOf("if (formData.id !== undefined)")
    )

    expect(api).toContain("report_number?: string")
    expect(review).toContain('prop="report_number"')
    expect(review).toContain('row.report_number || "-"')
    expect(review).toContain("props.reportType !== 'high-temp-high-pressure'")
    expect(history.indexOf('prop="report_no" label="报告ID"')).toBeLessThan(
      history.indexOf('prop="report_number" label="报告编号"')
    )
    expect(history).toContain(":model-value=\"formReportNumber || '-'\"")
    expect(history).toContain("formData.id ? formData.report_number : selectedOrder.value?.test_number")
    expect(payloadBlock).not.toContain("report_number:")
  })

  it("工单 SN 选项同时支持 type3 的 instrument_sn 和 type5 的 snNumbers", () => {
    expect(
      buildReportInstrumentSnOptions([
        { instrument_name: "压力计", instrument_sn: "HTP-SN-1" },
        { instrumentName: "振动仪", snNumbers: "VIB-SN-1,VIB-SN-2" }
      ])
    ).toEqual([
      { value: "HTP-SN-1", label: "HTP-SN-1（压力计）", instrumentName: "压力计" },
      { value: "VIB-SN-1", label: "VIB-SN-1（振动仪）", instrumentName: "振动仪" },
      { value: "VIB-SN-2", label: "VIB-SN-2（振动仪）", instrumentName: "振动仪" }
    ])
  })

  it.each([
    ["HighTemperaturePressureReport.vue", "high-temp-pressure"],
    ["VibrationReport.vue", "vibration-table"],
    ["SimulationWellReport.vue", "simulated-well"]
  ])("%s 展示同步台账并强制重推当前申请单快照", (filename, reportType) => {
    const page = read(`src/views/datamanage/historymange/components/${filename}`)

    expect(page).toContain("assistant_sync_status")
    expect(page).toContain("assistant_synced_at")
    expect(page).toContain("assistant_sync_error")
    expect(page).toContain("assistant_sync_retry_count")
    expect(page).toContain("重新推送本申请单报告")
    expect(page).toContain("本申请单当前报告快照已推送小助手")
    expect(page).toContain('source: "local"')
    expect(page).toContain('action: "push"')
    expect(page).toContain(`reportType: "${reportType}"`)
    expect(page).toContain("force: true")
  })

  it("type3/type5 审核页及 type7 审核页区分本地审核和外部同步结果", () => {
    const genericReview = read("src/views/datamanage/report/components/GenericEquipmentReportReview.vue")
    const simulatedWell = read("src/views/datamanage/historymange/components/SimulationWellReport.vue")

    expect(genericReview).toContain('props.reportType === "vibration-table"')
    expect(genericReview).toContain('props.reportType === "high-temp-high-pressure"')
    expect(genericReview).toContain("getAssistantSyncFeedback")
    expect(genericReview).toContain("本地审核已经成功，不会回滚")
    expect(genericReview).toContain("立即重试")
    expect(genericReview).toContain("force: true")

    expect(simulatedWell).toContain("getAssistantSyncFeedback")
    expect(simulatedWell).toContain("本地报告已审核通过，但推送小助手失败")
    expect(simulatedWell).toContain("本地审核已经成功，不会回滚")
    expect(simulatedWell).toContain("立即重试")
  })
})
