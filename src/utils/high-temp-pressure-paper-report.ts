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
      attachmentList.find((item) => isTestingCurveAttachment(item) && Boolean(item.file_url)) ||
      attachmentList.find(isTestingCurveAttachment) ||
      null
  }
}
