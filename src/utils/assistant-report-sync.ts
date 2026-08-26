import type { AssistantReportSyncFeedback } from "@/api/engineer-assistant/types"

type UnknownRecord = Record<string, unknown>

export interface AssistantReportBulkSummary {
  total: number
  eligible: number
  wouldPushCount: number
  attempted: number
  synced: number
  failed: number
  skipped: number
}

export interface AssistantReportPushOutcome {
  success: boolean
  failed: number
  error: string
}

const asRecord = (value: unknown): UnknownRecord | undefined => {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as UnknownRecord) : undefined
}

const numberValue = (records: Array<UnknownRecord | undefined>, ...keys: string[]) => {
  for (const record of records) {
    if (!record) continue
    for (const key of keys) {
      const value = Number(record[key])
      if (Number.isFinite(value) && value >= 0) return value
    }
  }
  return undefined
}

const reportSyncRecords = (response: unknown) => {
  const root = asRecord(response)
  const data = asRecord(root?.data) || root
  const result = asRecord(data?.result) || data
  const summary = asRecord(result?.summary) || asRecord(data?.summary)
  return { root, data, result, summary, records: [result, summary, data, root] }
}

export const getAssistantSyncFeedback = (response: unknown): AssistantReportSyncFeedback | undefined => {
  const root = asRecord(response)
  const data = asRecord(root?.data)
  return (asRecord(data?.assistantSync) || asRecord(root?.assistantSync)) as AssistantReportSyncFeedback | undefined
}

export const getAssistantSyncError = (feedback?: AssistantReportSyncFeedback) => {
  if (!feedback) return "后端未返回小助手同步结果"
  const firstFailed = feedback.list?.find((item) => item.success === false || item.error || item.reason)
  return (
    feedback.message || feedback.error || feedback.reason || firstFailed?.error || firstFailed?.reason || "未知错误"
  )
}

export const normalizeAssistantReportBulkSummary = (response: unknown): AssistantReportBulkSummary => {
  const { data, result, records } = reportSyncRecords(response)
  const list = Array.isArray(result?.list) ? result.list : Array.isArray(data?.list) ? data.list : []
  const total = numberValue(records, "total") ?? list.length
  const skipped = numberValue(records, "skipped") ?? 0
  const failed = numberValue(records, "failed") ?? 0
  const synced = numberValue(records, "synced", "successCount") ?? 0
  const eligible = numberValue(records, "eligible") ?? Math.max(0, total - skipped)
  const wouldPushCount =
    numberValue(records, "wouldPushCount") ?? list.map(asRecord).filter((item) => item?.wouldPush === true).length
  const attempted = numberValue(records, "attempted") ?? synced + failed
  return { total, eligible, wouldPushCount, attempted, synced, failed, skipped }
}

export const normalizeAssistantReportPushOutcome = (response: unknown): AssistantReportPushOutcome => {
  const { data, result, records } = reportSyncRecords(response)
  const list = Array.isArray(result?.list) ? result.list : Array.isArray(data?.list) ? data.list : []
  const failed = numberValue(records, "failed") ?? 0
  const explicitSuccess = records.find((record) => typeof record?.success === "boolean")?.success
  const firstFailure = list
    .map(asRecord)
    .find((item) => item?.success === false || item?.error || (explicitSuccess !== true && item?.reason))
  const error = String(
    result?.error ||
      result?.reason ||
      data?.error ||
      data?.reason ||
      firstFailure?.error ||
      firstFailure?.reason ||
      (explicitSuccess === true && failed === 0 ? "" : "小助手未确认报告同步成功")
  )
  return {
    success: explicitSuccess === true && failed === 0 && !firstFailure,
    failed,
    error
  }
}

export const getAssistantReportSyncStatusText = (status?: string) => {
  const labels: Record<string, string> = {
    pending: "待同步",
    syncing: "同步中",
    success: "已同步",
    failed: "同步失败",
    skipped: "已跳过"
  }
  return labels[String(status || "").toLowerCase()] || "未同步"
}

export const getAssistantReportSyncTagType = (status?: string): "success" | "warning" | "danger" | "info" => {
  switch (String(status || "").toLowerCase()) {
    case "success":
      return "success"
    case "failed":
      return "danger"
    case "pending":
    case "syncing":
      return "warning"
    default:
      return "info"
  }
}

export const canRetryAssistantReportSync = (status: number, assistantStatus?: string) => {
  const normalized = String(assistantStatus || "").toLowerCase()
  // 已审核报告允许人工覆盖整个申请单快照；仅同步进行中时禁止重复点击。
  return status === 1 && normalized !== "syncing"
}

export const downloadPdfBlob = async (blob: Blob, filename: string) => {
  if (!(blob instanceof Blob)) throw new Error("后端未返回 PDF 文件")
  const prefix = blob.slice(0, 5)
  const signature =
    typeof prefix.text === "function"
      ? await prefix.text()
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ""))
          reader.onerror = () => reject(reader.error || new Error("读取 PDF 文件失败"))
          reader.readAsText(prefix)
        })
  if (signature !== "%PDF-") throw new Error("后端返回的文件不是有效 PDF")

  const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" })
  const href = URL.createObjectURL(pdfBlob)
  const link = document.createElement("a")
  link.href = href
  link.download = `${filename.replace(/[\\/:*?"<>|]/g, "-") || "测试报告"}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}
