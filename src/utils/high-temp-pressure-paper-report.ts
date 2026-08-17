export type ReportRecord = Record<string, unknown>

export interface HighTempPressurePaperReportView {
  hasPaperReport: boolean
  paperReport: ReportRecord
  testingItemInformation: ReportRecord
  testingRequirements: ReportRecord
  fittingsProvided: ReportRecord
  testingResult: ReportRecord
  appearanceInspection: ReportRecord
  paperAttachments: ReportRecord
  testingCurveAttachment: ReportRecord
  otherAttachment: ReportRecord
  flowCurveAttachment: ReportRecord | null
  flowCurveAttachments: ReportRecord[]
}

const isRecord = (value: unknown): value is ReportRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export const toReportRecord = (value: unknown): ReportRecord => {
  return isRecord(value) ? value : {}
}

const readRecord = (record: ReportRecord, key: string): ReportRecord => {
  return toReportRecord(record[key])
}

export const displayReportValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "-"
  if (Array.isArray(value)) {
    const values = value.map((item) => displayReportValue(item)).filter((item) => item !== "-")
    return values.length ? values.join(" / ") : "-"
  }
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export const formatReportYesNo = (value: unknown, yesText = "是 Yes", noText = "否 No") => {
  if (value === true) return yesText
  if (value === false) return noText
  return "-"
}

export const formatReportProvider = (value: unknown) => {
  if (value === "applicant") return "委托方提供 Provided by Applicant"
  if (value === "tester") return "检测方提供 Provided by Tester"
  return displayReportValue(value)
}

export const formatReportCurveStatus = (value: unknown) => {
  if (value === "normal") return "测试曲线正常 Testing Curve Normal"
  if (value === "abnormal") return "测试曲线异常 Testing Curve Abnormal"
  return displayReportValue(value)
}

export const booleanReportTagType = (value: unknown): "success" | "danger" | "info" => {
  if (value === true) return "success"
  if (value === false) return "danger"
  return "info"
}

export const curveReportTagType = (value: unknown): "success" | "danger" | "info" => {
  if (value === "normal") return "success"
  if (value === "abnormal") return "danger"
  return "info"
}

export const isTestingCurveAttachment = (attachment: ReportRecord) => {
  return String(attachment.type || attachment.field || "") === "testing_curve"
}

export const getAttachmentTitle = (attachment: ReportRecord) => {
  return displayReportValue(attachment.name || attachment.file_name || attachment.type || "附件")
}

export const getAttachmentPath = (attachment: ReportRecord) => {
  return displayReportValue(attachment.file_url || attachment.local_path || "")
}

export const resolveReportFileUrl = (value: unknown) => {
  const raw = typeof value === "string" ? value.trim() : ""
  if (!raw) return ""
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw
  if (!raw.startsWith("/") && !raw.startsWith("media/")) return ""
  const baseUrl = String(import.meta.env.VITE_BASE_API || window.location.origin).replace(/\/+$/, "")
  return raw.startsWith("/") ? `${baseUrl}${raw}` : `${baseUrl}/${raw}`
}

export const getAttachmentFileUrl = (attachment: ReportRecord | null | undefined) => {
  return resolveReportFileUrl(attachment?.file_url)
}

export const getHighTempPressurePaperReportView = (
  reportJson?: ReportRecord,
  attachments?: ReportRecord[]
): HighTempPressurePaperReportView => {
  const paperReport = readRecord(toReportRecord(reportJson), "paper_report")
  const testingResult = readRecord(paperReport, "testing_result")
  const paperAttachments = readRecord(paperReport, "attachments")
  const attachmentList = Array.isArray(attachments) ? attachments : []
  const flowCurveAttachments = attachmentList.filter(isTestingCurveAttachment)

  return {
    hasPaperReport: Object.keys(paperReport).length > 0,
    paperReport,
    testingItemInformation: readRecord(paperReport, "testing_item_information"),
    testingRequirements: readRecord(paperReport, "testing_requirements"),
    fittingsProvided: readRecord(paperReport, "fittings_provided"),
    testingResult,
    appearanceInspection: readRecord(testingResult, "appearance_inspection"),
    paperAttachments,
    testingCurveAttachment: readRecord(paperAttachments, "testing_curve"),
    otherAttachment: readRecord(paperAttachments, "others"),
    flowCurveAttachment:
      flowCurveAttachments.find((item) => Boolean(item.file_url)) || flowCurveAttachments[0] || null,
    flowCurveAttachments
  }
}

export interface HighTempPressureReportDocSource {
  report_no?: string
  task_number?: string
  test_date?: string
  tester?: string
  status?: number
  status_text?: string
  overall_result?: string
  order_numbers?: unknown[]
  instrument_results?: unknown[]
  report_json?: ReportRecord
  attachments?: unknown[]
  submit_time?: string
  audit_time?: string
  remark?: string
}

export interface BuildHighTempPressureReportDocOptions {
  exportedAt?: Date | string
}

export interface HighTempPressureReportDoc {
  filename: string
  mimeType: string
  html: string
}

const WORD_DOC_MIME_TYPE = "application/msword;charset=utf-8"

const escapeDocHtml = (value: unknown) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

const isEmptyDocValue = (value: unknown) => {
  return value === undefined || value === null || value === ""
}

const formatDocValue = (value: unknown): string => {
  if (isEmptyDocValue(value)) return "-"
  if (value === true) return "是 / Yes"
  if (value === false) return "否 / No"
  if (Array.isArray(value)) {
    const values = value.map((item) => formatDocValue(item)).filter((item) => item !== "-")
    return values.length ? values.join(" / ") : "-"
  }
  if (typeof value === "object") {
    const entries = Object.entries(toReportRecord(value))
      .filter(([, item]) => !isEmptyDocValue(item))
      .map(([key, item]) => `${key}: ${formatDocValue(item)}`)
    return entries.length ? entries.join("; ") : "-"
  }
  return String(value)
}

const formatDocTime = (value: unknown) => {
  const text = formatDocValue(value)
  if (text === "-") return text
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? text : date.toLocaleString()
}

const formatDocResult = (value: unknown) => {
  if (value === "pass") return "合格"
  if (value === "fail") return "不合格"
  if (value === "pending") return "待定"
  return formatDocValue(value)
}

const formatDocStatus = (status: unknown, statusText: unknown) => {
  const text = formatDocValue(statusText)
  if (text !== "-") return text
  if (status === 0) return "待审核"
  if (status === 1) return "审核通过"
  if (status === 2) return "审核未通过"
  return formatDocValue(status)
}

const sanitizeDocFilename = (value: unknown) => {
  const text = formatDocValue(value)
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
  return text && text !== "-" ? text : "高温高压报告"
}

const buildDocKeyValueTable = (rows: Array<{ label: string; value: unknown }>) => {
  const body = rows
    .map(
      (row) => `
        <tr>
          <th>${escapeDocHtml(row.label)}</th>
          <td>${escapeDocHtml(formatDocValue(row.value))}</td>
        </tr>`
    )
    .join("")
  return `<table class="report-table key-value-table">${body}</table>`
}

const buildDocDataTable = (
  rows: ReportRecord[],
  columns: Array<{ label: string; value: (row: ReportRecord, index: number) => unknown }>,
  emptyText: string
) => {
  const head = columns.map((column) => `<th>${escapeDocHtml(column.label)}</th>`).join("")
  const body = rows.length
    ? rows
        .map((row, index) => {
          const cells = columns
            .map((column) => `<td>${escapeDocHtml(formatDocValue(column.value(row, index)))}</td>`)
            .join("")
          return `<tr>${cells}</tr>`
        })
        .join("")
    : `<tr><td colspan="${columns.length}">${escapeDocHtml(emptyText)}</td></tr>`
  return `<table class="report-table data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

const buildDocSection = (title: string, content: string) => {
  return `<section class="report-section"><h2>${escapeDocHtml(title)}</h2>${content}</section>`
}

const normalizeDocRows = (value: unknown) => {
  return Array.isArray(value) ? value.map((item) => toReportRecord(item)) : []
}

export const buildHighTempPressureReportDoc = (
  report: HighTempPressureReportDocSource,
  options: BuildHighTempPressureReportDocOptions = {}
): HighTempPressureReportDoc => {
  const attachments = normalizeDocRows(report.attachments)
  const paperReportView = getHighTempPressurePaperReportView(report.report_json, attachments)
  const instrumentResults = normalizeDocRows(report.instrument_results)
  const exportedAt = options.exportedAt ?? new Date()
  const filename = `${sanitizeDocFilename(report.report_no)}.doc`

  const sections = [
    buildDocSection(
      "基础信息",
      buildDocKeyValueTable([
        { label: "报告编号", value: report.report_no },
        { label: "任务单号", value: report.task_number },
        { label: "测试日期", value: report.test_date },
        { label: "测试人员", value: report.tester },
        { label: "总体结论", value: formatDocResult(report.overall_result) },
        { label: "关联工单", value: report.order_numbers?.length ? report.order_numbers : report.task_number },
        { label: "审核状态", value: formatDocStatus(report.status, report.status_text) },
        { label: "提交时间", value: formatDocTime(report.submit_time) },
        { label: "审核时间", value: formatDocTime(report.audit_time) },
        { label: "备注", value: report.remark },
        { label: "导出时间", value: formatDocTime(exportedAt) }
      ])
    ),
    buildDocSection(
      "仪器测试结论",
      buildDocDataTable(
        instrumentResults,
        [
          { label: "序号", value: (_row, index) => index + 1 },
          { label: "工单号", value: (row) => row.order_no },
          { label: "仪器名称", value: (row) => row.instrument_name },
          { label: "SN", value: (row) => row.instrument_sn },
          { label: "结论", value: (row) => row.result_text || formatDocResult(row.result) },
          { label: "观察记录", value: (row) => row.observation },
          { label: "关键指标", value: (row) => row.metrics }
        ],
        "暂无仪器测试结论"
      )
    )
  ]

  if (paperReportView.hasPaperReport) {
    sections.push(
      buildDocSection(
        "纸质报告检查项",
        buildDocKeyValueTable([
          { label: "报告格式", value: paperReportView.paperReport.title },
          { label: "Ref No.", value: paperReportView.paperReport.ref_no },
          { label: "名称 Name", value: paperReportView.testingItemInformation.name },
          { label: "数量 Quantity", value: paperReportView.testingItemInformation.quantity },
          { label: "编号 No.", value: paperReportView.testingItemInformation.no },
          { label: "测试压力 Testing Pressure", value: paperReportView.testingRequirements.testing_pressure },
          { label: "测试温度 Testing Temperature", value: paperReportView.testingRequirements.testing_temperature },
          { label: "保温保压 Hold Time", value: paperReportView.testingRequirements.hold_time },
          { label: "在线测试 Online Test", value: formatReportYesNo(paperReportView.testingRequirements.online_test) },
          { label: "其他要求 Other Requirements", value: paperReportView.testingRequirements.other_requirements },
          {
            label: "试压护帽 Testing Protective Cap",
            value: formatReportProvider(paperReportView.fittingsProvided.testing_protective_cap)
          },
          {
            label: "试压堵头 Testing Plug",
            value: formatReportProvider(paperReportView.fittingsProvided.testing_plug)
          },
          {
            label: "外观未变形 No Distorted",
            value: formatReportYesNo(paperReportView.appearanceInspection.no_distorted, "未变形", "已变形")
          },
          {
            label: "无明显泄漏 No Obvious Leakage",
            value: formatReportYesNo(
              paperReportView.appearanceInspection.no_obvious_leakage,
              "无明显泄漏",
              "有明显泄漏"
            )
          },
          {
            label: "测试曲线 Testing Curve",
            value: formatReportCurveStatus(paperReportView.testingResult.testing_curve)
          },
          { label: "其他描述 Other Descriptions", value: paperReportView.testingResult.other_descriptions },
          { label: "测试曲线份数", value: paperReportView.testingCurveAttachment.copies },
          { label: "其他附件份数", value: paperReportView.otherAttachment.copies },
          {
            label: "测试曲线路径",
            value: paperReportView.flowCurveAttachments.length
              ? paperReportView.flowCurveAttachments.map(
                  (item) => item.file_url || item.local_path
                )
              : paperReportView.testingCurveAttachment.file_url ||
                paperReportView.testingCurveAttachment.local_path
          }
        ])
      )
    )
  }

  sections.push(
    buildDocSection(
      "附件/文件",
      buildDocDataTable(
        attachments,
        [
          { label: "序号", value: (_row, index) => index + 1 },
          { label: "名称", value: (row) => row.name || row.file_name || row.type || "附件" },
          { label: "类型", value: (row) => row.type || row.field },
          { label: "路径", value: (row) => row.file_url || row.local_path }
        ],
        "暂无附件"
      )
    )
  )

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeDocHtml(formatDocValue(report.report_no))}</title>
    <style>
      body {
        font-family: "Microsoft YaHei", Arial, sans-serif;
        color: #1f2937;
        line-height: 1.5;
        padding: 24px;
      }
      h1 {
        text-align: center;
        font-size: 22px;
        margin: 0 0 18px;
      }
      .report-section {
        margin-top: 18px;
      }
      .report-section h2 {
        font-size: 16px;
        margin: 0 0 8px;
      }
      .report-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        margin-bottom: 12px;
      }
      .report-table th,
      .report-table td {
        border: 1px solid #9ca3af;
        padding: 8px 10px;
        vertical-align: top;
        word-break: break-word;
        white-space: pre-wrap;
        font-size: 12px;
      }
      .report-table th {
        background: #edf2f7;
        font-weight: 700;
      }
      .key-value-table th {
        width: 28%;
      }
      .data-table thead th {
        text-align: center;
      }
    </style>
  </head>
  <body>
    <h1>高温高压测试报告</h1>
    ${sections.join("\n")}
  </body>
</html>`

  return {
    filename,
    mimeType: WORD_DOC_MIME_TYPE,
    html
  }
}
