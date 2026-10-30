import { afterEach, describe, expect, it, vi } from "vitest"
import { buildHighTempPressureReportDoc } from "@/utils/high-temp-pressure-paper-report"

const getExportedTime = (html: string) => {
  const document = new DOMParser().parseFromString(html, "text/html")
  const row = Array.from(document.querySelectorAll("tr")).find(
    (row) => row.querySelector("th")?.textContent === "导出时间"
  )
  return row?.querySelector("td")?.textContent
}

const sampleReport = {
  id: 1,
  report_no: "Y-WY-001",
  task_number: "HTP-TASK-001",
  test_date: "2026-06-08",
  tester: "张三",
  status: 0,
  status_text: "待审核",
  overall_result: "pass",
  order_numbers: ["CS20260527003"],
  instrument_results: [
    {
      order_no: "CS20260527003",
      instrument_name: "高温高压测试仪",
      instrument_sn: "SN-001",
      result: "pass",
      observation: "无泄漏",
      metrics: {
        pressure: "35MPa",
        temperature: "150℃"
      }
    }
  ],
  report_json: {
    paper_report: {
      ref_no: "REF-001",
      testing_item_information: {
        name: "测试短节",
        quantity: 1
      },
      testing_requirements: {
        testing_pressure: "35MPa",
        testing_temperature: "150℃"
      },
      testing_result: {
        testing_curve: "normal",
        appearance_inspection: {
          no_obvious_leakage: true
        }
      }
    }
  },
  attachments: [
    {
      type: "testing_curve",
      name: "测试曲线",
      file_url: "/media/curve.png"
    }
  ],
  submit_time: "2026-06-08T09:30:00Z",
  audit_time: "",
  remark: "导出测试"
}

describe("高温高压报告 Word 下载", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("生成 doc 文件并用表格展示报告数据", () => {
    const doc = buildHighTempPressureReportDoc(sampleReport, { exportedAt: "2026-06-08T10:00:00Z" })

    expect(doc.filename).toBe("Y-WY-001.doc")
    expect(doc.mimeType).toBe("application/msword;charset=utf-8")
    expect(doc.html).toContain("<table")
    expect(doc.html).toContain("基础信息")
    expect(doc.html).toContain("仪器测试结论")
    expect(doc.html).toContain("纸质报告检查项")
    expect(doc.html).toContain("HTP-TASK-001")
    expect(doc.html).toContain("35MPa")
    expect(doc.html).toContain("150℃")
    expect(doc.html).not.toContain("<pre")
    expect(doc.html).not.toContain('"report_no"')
    expect(doc.html).not.toContain('{"pressure"')
    expect(getExportedTime(doc.html)).toBe(new Date("2026-06-08T10:00:00Z").toLocaleString())
  })

  it("显式 Date 导出时间与对应的字符串保持一致", () => {
    const exportedAt = new Date("2026-10-30T12:00:00Z")
    const doc = buildHighTempPressureReportDoc(sampleReport, { exportedAt })
    const stringDoc = buildHighTempPressureReportDoc(sampleReport, { exportedAt: exportedAt.toISOString() })

    expect(getExportedTime(doc.html)).toBe(exportedAt.toLocaleString())
    expect(getExportedTime(doc.html)).toBe(getExportedTime(stringDoc.html))
  })

  it("未指定导出时间时显示当前时间", () => {
    const now = new Date("2026-10-30T12:34:56Z")
    vi.useFakeTimers()
    vi.setSystemTime(now)

    const doc = buildHighTempPressureReportDoc(sampleReport)

    expect(getExportedTime(doc.html)).toBe(now.toLocaleString())
  })

  it("无效 Date 保持占位文本", () => {
    const doc = buildHighTempPressureReportDoc(sampleReport, { exportedAt: new Date("invalid") })

    expect(getExportedTime(doc.html)).toBe("-")
  })
})
