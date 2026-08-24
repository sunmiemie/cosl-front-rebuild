import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(__dirname, "..")
const pagePath = "src/views/datamanage/historymange/components/SimulationWellReport.vue"
const apiPath = "src/api/simulated-well-report/index.ts"
const content = readFileSync(resolve(root, pagePath), "utf8")
const apiContent = readFileSync(resolve(root, apiPath), "utf8")

describe("simulated well report review remarks", () => {
  it("uses the shared report-list layout and supports conditional queries", () => {
    expect(content).toContain('class="simulation-well-audit report-list-shell"')
    expect(content).toContain('class="report-list-toolbar"')
    expect(content).toContain('class="report-filter-form report-filter-form--wide"')
    expect(content).toContain('v-model="searchForm.reportNo"')
    expect(content).toContain('v-model="searchForm.taskNumber"')
    expect(content).toContain('v-model="searchForm.testProduct"')
    expect(content).toContain('v-model="searchForm.tester"')
    expect(content).toContain('v-model="searchForm.status"')
    expect(content).toContain('v-model="searchForm.testDateRange"')
    expect(content).toContain(':data="tableData"')
    expect(content).not.toContain('v-model="activeListTab"')
    expect(content).not.toContain("待审核报告（")
    expect(content).not.toContain("已审核报告（")
    expect(content).toContain('const handleSearch = () =>')
    expect(content).toContain('const handleReset = () =>')
  })

  it("uses report_json as the only structured report source", () => {
    expect(content).toContain("const getMeta = (report: SimulatedWellReportListItem): ReportJson =>")
    expect(content).toContain("report.report_json")
    expect(content).not.toContain("safeParseRemark")
  })

  it("collects an optional approval opinion before approving", () => {
    expect(content).toContain("const approveDialogVisible")
    expect(content).toContain("const approveReason")
    expect(content).toContain("const showApproveDialog")
    expect(content).toContain('v-model="approveDialogVisible"')
    expect(content).toContain('v-model="approveReason"')
    expect(content).toContain("请输入审核意见（可选）")
    expect(content).toContain("reviewPayload(1, approveReason.value)")
  })

  it("sends only the status and review remark for review actions", () => {
    expect(content).toContain("const reviewPayload = (status: number, remark?: string) =>")
    expect(content).toContain('remark: remark?.trim() || ""')
    expect(content).toContain("reviewPayload(2, rejectReason.value)")
    expect(content).not.toContain("row.remark ??")
  })

  it("shows report environment, interval and audit remark without exposing raw JSON", () => {
    expect(content).toContain('label="测试环境"')
    expect(content).toContain("currentReport.meta.env_text")
    expect(content).toContain('label="测试井段"')
    expect(content).toContain("currentReport.meta.interval_text")
    expect(content).toContain('v-if="currentReport.status !== 0"')
    expect(content).toContain('currentReport.remark || "-"')
    expect(content).not.toContain("查看完整结构化报告数据")
    expect(content).not.toContain("compactJson")
  })

  it("shows saved test items and evaluation standards from the frozen template snapshot", () => {
    expect(content).toContain("const currentTemplateSnapshot = computed")
    expect(content).toContain("const currentTestItemRows = computed")
    expect(content).toContain("const currentEvaluationRows = computed")
    expect(content).toContain("const normalizeTemplateField")
    expect(content).toContain("template_snapshot")
    expect(content).toContain("测试项目")
    expect(content).toContain("资料评价标准值")
    expect(content).toContain("暂无可用项目定义")
    expect(content).toContain("当前模板未配置测试项目")
    expect(content).toContain("当前模板未配置评价标准")
    expect(content).toContain('normal: "正常"')
    expect(content).toContain('unqualified: "不符合"')
    expect(content).toContain('"depth-group"')
    expect(content).toContain('"range-radio"')
    expect(content).toContain('"multi-input-row"')
    expect(content).toContain('"sampling-group"')
    expect(content).toContain('"card-group"')
  })

  it("shows the saved operator signature in report basic information", () => {
    expect(apiContent).toContain("operator_user_id?: number | null")
    expect(apiContent).toContain("operator_signature_url?: string | null")
    expect(content).toContain('label="电子签名"')
    expect(content).toContain("operatorSignatureUrl(currentReport)")
    expect(content).toContain("resolveReportFileUrl(report?.operator_signature_url)")
    expect(content).toContain(':preview-src-list="[operatorSignatureUrl(currentReport)]"')
    expect(content).toContain("未记录电子签名")
  })

  it("downloads approved reports as backend-generated PDF files", () => {
    expect(apiContent).toContain("getSimulatedWellReportPdfApi")
    expect(apiContent).toContain("test/simulated-well/report/download/${pk}/")
    expect(apiContent).toContain('responseType: "blob"')
    expect(content).toContain("const downloadingId")
    expect(content).toContain("getSimulatedWellReportPdfApi(row.id)")
    expect(content).toContain('v-if="row.status === 1"')
    expect(content).toContain("下载 PDF")
    expect(content).not.toContain("JSON.stringify(payload, null, 2)")
  })

  it("presents curve attachments as original files without changing the download API", () => {
    expect(content).toContain('if (raw.includes("curve")) return "原始文件"')
    expect(content).toContain("原始文件与上传文件")
    expect(content).toContain("下载原始文件")
    expect(content).toContain("getSimulatedWellReportCurveZipApi(row.id)")
  })

  it("groups original files into one attachment row with the download action", () => {
    expect(content).toContain("const otherAttachments")
    expect(content).toContain('v-if="curveAttachments(currentReport).length" class="attachment-row"')
    expect(content).toContain('v-for="(item, index) in curveAttachments(currentReport)"')
    expect(content).toContain('v-for="(item, index) in otherAttachments(currentReport)"')
    const originalRowStart = content.indexOf('v-if="curveAttachments(currentReport).length" class="attachment-row"')
    const otherRowStart = content.indexOf('v-for="(item, index) in otherAttachments(currentReport)"')
    const originalRow = content.slice(originalRowStart, otherRowStart)
    expect(originalRow).toContain("handleCurveDownload(currentReport)")
    expect(originalRow).not.toContain("openAttachment(item)")
  })
})
