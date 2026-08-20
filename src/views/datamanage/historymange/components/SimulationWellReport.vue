<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Download } from "@element-plus/icons-vue"
import { syncEngineerAssistantReportsApi } from "@/api/engineer-assistant"
import { useUserStoreHook } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  getSimulatedWellReportDetailApi,
  getSimulatedWellReportCurveDownloadTicketApi,
  getSimulatedWellReportListApi,
  getSimulatedWellReportPdfApi,
  updateSimulatedWellReportApi,
  type SimulatedWellReportListItem
} from "@/api/simulated-well-report"
import {
  downloadPdfBlob,
  getAssistantReportSyncStatusText,
  getAssistantReportSyncTagType,
  getAssistantSyncError,
  getAssistantSyncFeedback,
  normalizeAssistantReportPushOutcome
} from "@/utils/assistant-report-sync"
import { displayReportValue, resolveReportFileUrl } from "@/utils/high-temp-pressure-paper-report"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type ReportJson = Record<string, any>
type AttachmentItem = Record<string, any>
type ReadonlyReportRow = { label: string; value: string }

type AuditRow = SimulatedWellReportListItem & {
  meta: ReportJson
  report_name: string
  template_no: string
  job_no: string
  test_product: string
  operator_engineer: string
}

const userStore = useUserStoreHook()
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()
const reviewerName = computed(() => userStore.nickName || userStore.username || "-")

const loading = ref(false)
const assistantPushingId = ref<number | null>(null)
const downloadingId = ref<number | null>(null)
const curveDownloadingId = ref<number | null>(null)
const rows = ref<AuditRow[]>([])
const detailDialogVisible = ref(false)
const currentReport = ref<AuditRow | null>(null)
const approveDialogVisible = ref(false)
const approveReason = ref("")
const approvingRow = ref<AuditRow | null>(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingRow = ref<AuditRow | null>(null)
const previewImage = ref<{ title: string; url: string } | null>(null)
const previewImageVisible = computed({
  get: () => Boolean(previewImage.value),
  set: (value: boolean) => {
    if (!value) previewImage.value = null
  }
})

const pendingPagination = reactive({ page: 1, pageSize: 10 })
const reviewedPagination = reactive({ page: 1, pageSize: 10 })

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "simulation"
}

const taskNumberFilter = computed(() => {
  if (!shouldSyncRouteTask()) return ""
  const value = route.query.taskNumber
  return typeof value === "string" ? value.trim().toLowerCase() : ""
})

const pendingAllRows = computed(() =>
  rows.value.filter(
    (row) =>
      row.status === 0 && (!taskNumberFilter.value || row.task_number.toLowerCase().includes(taskNumberFilter.value))
  )
)
const reviewedAllRows = computed(() => rows.value.filter((row) => row.status !== 0))
const pendingTotal = computed(() => pendingAllRows.value.length)
const reviewedTotal = computed(() => reviewedAllRows.value.length)

const pendingTableData = computed(() => {
  const start = (pendingPagination.page - 1) * pendingPagination.pageSize
  return pendingAllRows.value.slice(start, start + pendingPagination.pageSize)
})
const reviewedTableData = computed(() => {
  const start = (reviewedPagination.page - 1) * reviewedPagination.pageSize
  return reviewedAllRows.value.slice(start, start + reviewedPagination.pageSize)
})

const getMeta = (report: SimulatedWellReportListItem): ReportJson =>
  report.report_json && typeof report.report_json === "object" ? { ...report.report_json } : {}

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    const text = displayReportValue(value)
    if (text !== "-") return text
  }
  return "-"
}

const formatUnitValue = (value: unknown, unit: "m" | "℃" | "MPa") => {
  const text = String(value ?? "").trim()
  if (!text || text === "-") return text || "-"
  const suffixPattern = {
    m: /\s*m$/i,
    "℃": /\s*(?:℃|°\s*C)$/i,
    MPa: /\s*MPa$/i
  }[unit]
  const normalized = text.replace(suffixPattern, "").trim()
  return normalized ? `${normalized}${unit}` : text
}

const namedValues = (text: string, labels: string[]) => {
  const pattern = labels.join("|")
  const expression = new RegExp(
    `(${pattern})\\s*[:：]?\\s*(.*?)(?=\\s*(?:/|\\n)?\\s*(?:${pattern})\\s*[:：]?|\\s*$)`,
    "g"
  )
  const values: Record<string, string> = {}
  for (const match of text.matchAll(expression)) {
    values[match[1]] = match[2].replace(/[\\s/]+$/, "").trim()
  }
  return values
}

const formatEnvironmentWithUnits = (value: unknown) => {
  const text = firstText(value)
  if (text === "-") return text
  const values = namedValues(text, ["井深", "井温", "井压"])
  const parts = [
    values["井深"] ? `井深: ${formatUnitValue(values["井深"], "m")}` : "",
    values["井温"] ? `井温: ${formatUnitValue(values["井温"], "℃")}` : "",
    values["井压"] ? `井压: ${formatUnitValue(values["井压"], "MPa")}` : ""
  ].filter(Boolean)
  return parts.length ? parts.join(" / ") : text
}

const formatIntervalRange = (value: unknown) => {
  const [from, to] = String(value ?? "")
    .trim()
    .split("~")
  return to === undefined ? formatUnitValue(from, "m") : `${formatUnitValue(from, "m")}~${formatUnitValue(to, "m")}`
}

const formatIntervalWithUnits = (value: unknown) => {
  const text = firstText(value)
  if (text === "-") return text
  const values = namedValues(text, ["主测井段", "复测井段", "主段", "重复段"])
  const main = values["主测井段"] ?? values["主段"]
  const repeat = values["复测井段"] ?? values["重复段"]
  const parts = [
    main ? `主测井段: ${formatIntervalRange(main)}` : "",
    repeat ? `复测井段: ${formatIntervalRange(repeat)}` : ""
  ].filter(Boolean)
  return parts.length ? parts.join(" / ") : text
}

const normalizeTemplateField = (field: unknown) => {
  if (typeof field !== "string") return field
  const text = field.trim()
  if (!text.startsWith("{")) return text
  try {
    return JSON.parse(text)
  } catch {
    try {
      return JSON.parse(
        text
          .replace(/\bNone\b/g, "null")
          .replace(/\bTrue\b/g, "true")
          .replace(/\bFalse\b/g, "false")
          .replace(/'/g, '"')
      )
    } catch {
      return text
    }
  }
}

const fieldLabel = (field: unknown, fallback: string) => {
  const normalized = normalizeTemplateField(field)
  const value =
    typeof normalized === "string"
      ? normalized
      : normalized && typeof normalized === "object"
        ? (normalized as Record<string, any>)
        : {}
  return typeof value === "string"
    ? value || fallback
    : value.nameCN || value.name || value.label || value.zh || value.title || value.code || fallback
}

const fieldType = (field: unknown) => {
  const normalized = normalizeTemplateField(field)
  if (!normalized || typeof normalized !== "object") return "radio"
  return String((normalized as Record<string, any>).type || "radio")
}

const fieldKey = (prefix: string, index: number, suffix = "") => `${prefix}_${index}${suffix ? `_${suffix}` : ""}`

const displayReadonlyValue = (value: unknown, empty = "") => {
  if (value === undefined || value === null || value === "") return empty
  const statusText: Record<string, string> = {
    normal: "正常",
    abnormal: "异常",
    qualified: "符合",
    unqualified: "不符合"
  }
  if (typeof value === "string") return statusText[value] || value
  if (typeof value === "boolean") return value ? "是" : "否"
  return String(value)
}

const displayRangeRadioResult = (value: unknown) => {
  if (value === "abnormal" || value === "异常" || value === "不正常") return "不正常"
  return displayReadonlyValue(value)
}

const displayNumberWithUnit = (value: unknown, unit: unknown) => {
  const numberValue = displayReadonlyValue(value)
  if (value === undefined || value === null || value === "") return numberValue
  return `${numberValue}${String(unit || "").trim()}`
}

const displayValueWithUnit = (value: unknown, unit: unknown) => {
  const text = displayReadonlyValue(value)
  if (text === "") return ""
  return `${text}${String(unit || "").trim()}`
}

const transferColumns = (field: unknown): Record<string, any>[] => {
  const normalized = normalizeTemplateField(field)
  if (!normalized || typeof normalized !== "object") return []
  const columns = (normalized as Record<string, any>).columns
  return Array.isArray(columns) ? columns as Record<string, any>[] : []
}

const buildReadonlyTransferDataRows = (fields: unknown, values: unknown): ReadonlyReportRow[] => {
  if (!Array.isArray(fields)) return []
  const valueMap = values && typeof values === "object" ? values as Record<string, unknown> : {}
  return fields.flatMap((field, fieldIndex) => {
    if (fieldType(field) !== "single-row-multi-column") return []
    return transferColumns(field).map((column, columnIndex) => {
      const label = `${fieldLabel(field, "")}${fieldLabel(column, "")}` || `转样数据${fieldIndex + 1}子字段${columnIndex + 1}`
      return {
        label,
        value: displayValueWithUnit(valueMap[fieldKey("transfer", fieldIndex, `c${columnIndex}`)], column.unit)
      }
    })
  })
}

const positiveFieldCount = (value: unknown, fallback: number) => {
  const count = Number(value)
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : fallback
}

const buildReadonlyReportRows = (
  fields: unknown,
  values: unknown,
  prefix: string,
  sectionName: string
): ReadonlyReportRow[] => {
  if (!Array.isArray(fields)) return []
  const valueMap = values && typeof values === "object" ? (values as Record<string, unknown>) : {}
  return fields.map((rawField, index) => {
    const normalizedField = normalizeTemplateField(rawField)
    const definition =
      normalizedField && typeof normalizedField === "object" ? (normalizedField as Record<string, any>) : {}
    const key = fieldKey(prefix, index)
    const label = fieldLabel(rawField, `${sectionName}${index + 1}`)
    const type = fieldType(rawField)
    if (!["depth-group", "range-radio", "multi-input-row", "sampling-group", "card-group", "single-input"].includes(type)) {
      if (type === "number") return { label, value: displayNumberWithUnit(valueMap[key], definition.unit) }
      return { label, value: displayReadonlyValue(valueMap[key]) }
    }
    if (type === "single-input") {
      const inputValue = displayReadonlyValue(valueMap[key])
      const unit = String(definition.unit || "").trim()
      const valueWithUnit = inputValue ? `${inputValue}${unit}` : ""
      return {
        label: `${label}：${valueWithUnit}`,
        value: displayReadonlyValue(valueMap[fieldKey(prefix, index, "result")]),
      }
    }
    if (type === "depth-group") {
      const unit = displayReadonlyValue(definition.unit, "m")
      const points = Array.from({ length: positiveFieldCount(definition.pointCount, 4) }, (_, pointIndex) => {
        const point = pointIndex + 1
        const depth = displayValueWithUnit(valueMap[fieldKey(prefix, index, `p${point}`)], unit)
        const result = valueMap[fieldKey(prefix, index, `p${point}_result`)]
        return `第${point}点：${depth}${result === undefined || result === null || result === "" ? "" : `，${displayReadonlyValue(result)}`}`
      })
      return { label, value: points.join("；") }
    }
    if (type === "range-radio") {
      return {
        label,
        value: `${displayReadonlyValue(valueMap[fieldKey(prefix, index, "from")])} ~ ${displayReadonlyValue(valueMap[fieldKey(prefix, index, "to")])}；${displayReadonlyValue(valueMap[fieldKey(prefix, index, "result")])}`
      }
      const start = displayReadonlyValue(valueMap[fieldKey(prefix, index, "from")])
      const end = displayReadonlyValue(valueMap[fieldKey(prefix, index, "to")])
      const unit = String(definition.unit || "").trim()
      return {
        label: `${label}：${start || end ? `${start} ~ ${end}${unit}` : ""}`,
        value: displayRangeRadioResult(valueMap[fieldKey(prefix, index, "result")]),
      }
    }
    if (type === "multi-input-row") {
      const columns = Array.isArray(definition.columns) ? definition.columns : []
      const rows = Array.from({ length: positiveFieldCount(definition.rowCount, 2) }, (_, rowIndex) => {
        const row = columns.map((column: unknown, columnIndex: number) => `${fieldLabel(column, `输入${columnIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `r${rowIndex + 1}c${columnIndex}`)])}`)
        return `第${rowIndex + 1}点：${row.join("，")}`
      })
      return { label, value: rows.join("；") }
    }
    if (type === "sampling-group") {
      const items = Array.isArray(definition.items) ? definition.items : []
      const points = Array.from({ length: positiveFieldCount(definition.pointCount, 2) }, (_, pointIndex) => {
        const point = pointIndex + 1
        const values = items.map((item: unknown, itemIndex: number) => `${fieldLabel(item, `项目${itemIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `p${point}i${itemIndex}`)])}`)
        return `第${point}点：${values.join("，")}`
      })
      return { label, value: points.join("；") }
    }
    const cards = Array.isArray(definition.cards) ? definition.cards : []
    const cardValues = cards.map((card: unknown, cardIndex: number) => {
      const cardDefinition = card && typeof card === "object" ? (card as Record<string, any>) : {}
      const fields = Array.isArray(cardDefinition.fields) ? cardDefinition.fields : []
      const values = fields.map((item: unknown, itemIndex: number) => `${fieldLabel(item, `字段${itemIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `c${cardIndex}f${itemIndex}`)])}`)
      return `${displayReadonlyValue(cardDefinition.title, `卡片${cardIndex + 1}`)}：${values.join("，")}`
    })
    return { label, value: cardValues.join("；") }
  })
}

const currentTemplateSnapshot = computed<ReportJson | null>(() => {
  const snapshot = currentReport.value?.meta.template_snapshot
  return snapshot && typeof snapshot === "object" ? (snapshot as ReportJson) : null
})

const currentTestItemRows = computed(() => buildReadonlyReportRows(currentTemplateSnapshot.value?.test_items, currentReport.value?.meta.test_items, "test", "测试项目"))
const currentEvaluationRows = computed(() => buildReadonlyReportRows(currentTemplateSnapshot.value?.evaluation_standards, currentReport.value?.meta.evaluation_standards, "eval", "评价标准"))
const currentTransferDataRows = computed(() => buildReadonlyTransferDataRows(currentTemplateSnapshot.value?.transfer_data_records, currentReport.value?.meta.transfer_data_records))

const isResearchReport = (report?: AuditRow | null) => Number(report?.meta?.order_type) === 1
const usesTemplateReport = (report?: AuditRow | null) =>
  !isResearchReport(report) || Boolean(report?.meta?.template_snapshot?.report_no)

const getDeviceText = (meta: ReportJson) => {
  const device = meta.selected_device || meta.device || {}
  return firstText(device.deviceName, device.name, meta.device_name, meta.test_product)
}

const normalizeRow = (report: SimulatedWellReportListItem): AuditRow => {
  const meta = getMeta(report)
  return {
    ...report,
    meta,
    report_name: String(meta.report_name || ""),
    template_no: firstText(meta.template_code, meta.selected_template?.report_no),
    job_no: firstText(meta.operation_no, report.task_number),
    test_product: getDeviceText(meta),
    operator_engineer: firstText(meta.operator_engineer, report.tester)
  }
}

const formatTime = (time?: string | null) => (time ? String(time).replace("T", " ").slice(0, 19) : "-")

const statusText = (status: number) => {
  if (status === 1) return "审核通过"
  if (status === 2) return "审核未通过"
  return "待审核"
}

const statusType = (status: number): TagType => {
  if (status === 1) return "success"
  if (status === 2) return "danger"
  return "warning"
}

const reportAttachments = (report?: AuditRow | null): AttachmentItem[] =>
  Array.isArray(report?.attachments) ? (report!.attachments as AttachmentItem[]) : []

const isCurveAttachment = (attachment: AttachmentItem) => {
  const type = String(attachment.type || "").toLowerCase()
  const field = String(attachment.field || "").toLowerCase()
  return type.startsWith("curve") || field.startsWith("curve")
}

const curveAttachments = (report?: AuditRow | null) => reportAttachments(report).filter(isCurveAttachment)

const otherAttachments = (report?: AuditRow | null) =>
  reportAttachments(report).filter((attachment) => !isCurveAttachment(attachment))

const operatorSignatureUrl = (report?: AuditRow | null) => resolveReportFileUrl(report?.operator_signature_url)

const attachmentTitle = (attachment: AttachmentItem) =>
  firstText(attachment.name, attachment.file_name, attachment.type, attachment.field, "附件")

const attachmentType = (attachment: AttachmentItem) => {
  const raw = String(attachment.type || attachment.field || "")
  if (raw.includes("curve")) return "原始文件"
  if (raw.includes("report")) return "报告文件"
  return "附件"
}

const attachmentUrl = (attachment: AttachmentItem) => resolveReportFileUrl(attachment.file_url)

const isImageAttachment = (attachment: AttachmentItem) => {
  const name = String(attachment.name || attachment.file_name || attachment.file_url || "").toLowerCase()
  const contentType = String(attachment.content_type || "").toLowerCase()
  return contentType.startsWith("image/") || /\.(png|jpe?g|gif|bmp|webp|tiff?)$/i.test(name)
}

const openAttachment = (attachment: AttachmentItem) => {
  const url = attachmentUrl(attachment)
  if (!url) {
    ElMessage.warning("附件暂无可访问地址")
    return
  }
  if (isImageAttachment(attachment)) {
    previewImage.value = { title: attachmentTitle(attachment), url }
    return
  }
  window.open(url, "_blank", "noopener,noreferrer")
}

const reviewPayload = (status: number, remark?: string) => ({
  status,
  remark: remark?.trim() || ""
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellReportListApi({ page: 1, pageSize: 1000 })
    rows.value = res.code === 0 ? res.data.list.map(normalizeRow) : []
    if ((pendingPagination.page - 1) * pendingPagination.pageSize >= pendingTotal.value) pendingPagination.page = 1
    if ((reviewedPagination.page - 1) * reviewedPagination.pageSize >= reviewedTotal.value) reviewedPagination.page = 1
  } catch (error) {
    console.error(error)
    rows.value = []
    ElMessage.error("获取模拟井报告列表失败")
  } finally {
    loading.value = false
  }
}

const handlePendingSizeChange = (size: number) => {
  pendingPagination.pageSize = size
  pendingPagination.page = 1
}

const handlePendingCurrentChange = (page: number) => {
  pendingPagination.page = page
}

const handleReviewedSizeChange = (size: number) => {
  reviewedPagination.pageSize = size
  reviewedPagination.page = 1
}

const handleReviewedCurrentChange = (page: number) => {
  reviewedPagination.page = page
}

const handleDetail = async (row: AuditRow) => {
  try {
    const res = await getSimulatedWellReportDetailApi(row.id)
    currentReport.value = res.code === 0 ? normalizeRow(res.data) : row
  } catch (error) {
    console.error(error)
    currentReport.value = row
    ElMessage.warning("详情接口异常，已展示列表缓存数据")
  }
  detailDialogVisible.value = true
}

const showApproveDialog = (row: AuditRow) => {
  approvingRow.value = row
  approveReason.value = ""
  approveDialogVisible.value = true
}

const handleApprove = async () => {
  if (!approvingRow.value) return
  const report = approvingRow.value
  const res = await updateSimulatedWellReportApi(report.id, reviewPayload(1, approveReason.value))
  if (res.code === 0) {
    approveDialogVisible.value = false
    detailDialogVisible.value = false
    void taskCenterStore.refresh(true)
    await getList()
    await showApprovalSyncResult(res, report)
  } else {
    ElMessage.error(res.msg || "审核失败")
  }
}

const showRejectDialog = (row: AuditRow) => {
  rejectingRow.value = row
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectingRow.value) return
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写驳回原因")
    return
  }
  const res = await updateSimulatedWellReportApi(rejectingRow.value.id, reviewPayload(2, rejectReason.value))
  if (res.code === 0) {
    ElMessage.success("已驳回")
    rejectDialogVisible.value = false
    detailDialogVisible.value = false
    void taskCenterStore.refresh(true)
    await getList()
  } else {
    ElMessage.error(res.msg || "驳回失败")
  }
}

const handleDownload = async (row: AuditRow) => {
  downloadingId.value = row.id
  try {
    const blob = await getSimulatedWellReportPdfApi(row.id)
    await downloadPdfBlob(blob, row.report_no || "模拟井测试报告")
    ElMessage.success("正式 PDF 下载开始")
  } catch (error: any) {
    console.error("下载模拟井报告 PDF 失败", error)
    ElMessage.error(error?.message || "正式 PDF 下载失败")
  } finally {
    downloadingId.value = null
  }
}

const handleCurveDownload = async (row: AuditRow) => {
  curveDownloadingId.value = row.id
  try {
    const ticket = await getSimulatedWellReportCurveDownloadTicketApi(row.id)
    const base = String(import.meta.env.VITE_BASE_API || "/").replace(/\/+$/, "")
    const path = ticket.data.url.replace(/^\/+/, "")
    const url = /^https?:\/\//i.test(ticket.data.url) ? ticket.data.url : `${base}/${path}`
    const a = document.createElement("a")
    a.href = url
    a.click()
    ElMessage.success("原始文件下载已开始")
  } catch (error) {
    console.error("下载模拟井报告曲线图失败", error)
    ElMessage.error("原始文件下载失败")
  } finally {
    curveDownloadingId.value = null
  }
}

const retryAssistantReport = async (row: AuditRow) => {
  assistantPushingId.value = row.id
  try {
    const response = await syncEngineerAssistantReportsApi({
      source: "local",
      action: "push",
      reportType: "simulated-well",
      reportId: row.id,
      force: true
    })
    const outcome = normalizeAssistantReportPushOutcome(response)
    if (outcome.success) {
      ElMessage.success("本申请单当前报告快照已推送小助手")
    } else {
      ElMessage.error(`本申请单当前报告快照推送失败：${outcome.error}`)
    }
    await getList()
  } catch (error: any) {
    const message = error?.response?.data?.msg || error?.message || "未知错误"
    ElMessage.error(`本申请单当前报告快照推送失败：${message}`)
    await getList()
  } finally {
    assistantPushingId.value = null
  }
}

const showApprovalSyncResult = async (response: unknown, report: AuditRow) => {
  const assistantSync = getAssistantSyncFeedback(response)
  if (assistantSync?.success === true) {
    ElMessage.success("报告审核通过，并已推送小助手")
    return
  }

  const error = getAssistantSyncError(assistantSync)
  ElMessage.warning(`本地报告已审核通过，但推送小助手失败：${error}`)
  try {
    await ElMessageBox.confirm(
      `本地审核已经成功，不会回滚。推送小助手失败：${error}。是否立即重新推送？`,
      "审核成功，但小助手同步失败",
      {
        type: "warning",
        confirmButtonText: "立即重试",
        cancelButtonText: "稍后处理"
      }
    )
  } catch {
    return
  }
  await retryAssistantReport(report)
}

const handlePushAssistant = async (row: AuditRow) => {
  await ElMessageBox.confirm("确定重新推送本申请单当前已审核报告快照到小助手吗？", "重新推送本申请单报告", {
    type: "warning"
  })
  await retryAssistantReport(row)
}

const openRouteReportDetail = async () => {
  if (!shouldSyncRouteTask()) return
  const reportId = Number(route.query.reportId)
  if (!reportId) return
  try {
    const res = await getSimulatedWellReportDetailApi(reportId)
    if (res.code === 0) {
      currentReport.value = normalizeRow(res.data)
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  void getList()
  void openRouteReportDetail()
})

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    pendingPagination.page = 1
    void openRouteReportDetail()
  }
)

defineExpose({ resetSearch: getList })
</script>

<template>
  <div class="simulation-well-audit">
    <el-card class="reviewer-card" shadow="never">
      <div class="reviewer-strip">
        <div>
          <div class="eyebrow">SIMULATION WELL REPORT</div>
          <div class="reviewer-title">模拟井测试报告审核</div>
        </div>
        <div class="reviewer-pill">当前审核人：{{ reviewerName }}</div>
      </div>
    </el-card>

    <el-card class="audit-card" shadow="never" v-loading="loading">
      <div class="toolbar-wrapper">
        <div>
          <div class="section-title">待审核报告</div>
        </div>
        <el-button type="primary" icon="RefreshRight" circle @click="getList" />
      </div>

      <el-table :data="pendingTableData" stripe border>
        <el-table-column prop="report_no" label="报告编号" min-width="160" />
        <el-table-column prop="report_name" label="报告名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="job_no" label="作业编号" min-width="150" />
        <el-table-column prop="instrument_sn" label="被测 SN" min-width="150">
          <template #default="{ row }">{{ row.instrument_sn || row.equipmentId || "-" }}</template>
        </el-table-column>
        <el-table-column prop="test_product" label="测试产品" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operator_engineer" label="操作工程师" width="120" />
        <el-table-column prop="submit_time" label="提交时间" width="170">
          <template #default="{ row }">{{ formatTime(row.submit_time) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="小助手同步" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getAssistantReportSyncTagType(row.assistant_sync_status)">
              {{ getAssistantReportSyncStatusText(row.assistant_sync_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
            <el-button link type="success" @click="showApproveDialog(row)">通过</el-button>
            <el-button link type="danger" @click="showRejectDialog(row)">驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="pendingPagination.page"
          v-model:page-size="pendingPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pendingTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePendingSizeChange"
          @current-change="handlePendingCurrentChange"
        />
      </div>
    </el-card>

    <el-card class="audit-card" shadow="never" v-loading="loading">
      <div class="toolbar-wrapper">
        <div>
          <div class="section-title">已审核报告</div>
        </div>
        <el-button type="primary" icon="RefreshRight" circle @click="getList" />
      </div>

      <el-table :data="reviewedTableData" stripe border>
        <el-table-column prop="report_no" label="报告编号" min-width="160" />
        <el-table-column prop="report_name" label="报告名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="job_no" label="作业编号" min-width="150" />
        <el-table-column prop="instrument_sn" label="被测 SN" min-width="150">
          <template #default="{ row }">{{ row.instrument_sn || row.equipmentId || "-" }}</template>
        </el-table-column>
        <el-table-column prop="test_product" label="测试产品" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operator_engineer" label="操作工程师" width="120" />
        <el-table-column prop="audit_time" label="审核时间" width="170">
          <template #default="{ row }">{{ formatTime(row.audit_time) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="小助手同步" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getAssistantReportSyncTagType(row.assistant_sync_status)">
              {{ getAssistantReportSyncStatusText(row.assistant_sync_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="同步时间" width="170">
          <template #default="{ row }">{{ formatTime(row.assistant_synced_at) }}</template>
        </el-table-column>
        <el-table-column label="同步尝试次数" width="110" align="center">
          <template #default="{ row }">{{ row.assistant_sync_retry_count || 0 }}</template>
        </el-table-column>
        <el-table-column label="同步失败原因" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">{{ row.assistant_sync_error || "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="390" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
            <el-button
              v-if="row.status === 1 && usesTemplateReport(row)"
              :loading="downloadingId === row.id"
              link
              type="success"
              @click="handleDownload(row)"
            >
              下载
            </el-button>
            <el-button
              v-if="row.status === 1"
              link
              type="primary"
              :disabled="assistantPushingId !== null || row.assistant_sync_status === 'syncing'"
              @click="handlePushAssistant(row)"
            >
              {{ assistantPushingId === row.id ? "推送中" : "重新推送本申请单报告" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="reviewedPagination.page"
          v-model:page-size="reviewedPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="reviewedTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleReviewedSizeChange"
          @current-change="handleReviewedCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="模拟井报告详情" width="980px" append-to-body>
      <div v-if="currentReport" class="detail-shell">
        <div class="detail-card">
          <div class="detail-card-title">基础信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
            <el-descriptions-item label="任务编号">{{ currentReport.task_number }}</el-descriptions-item>
            <el-descriptions-item label="被测 SN">{{
              currentReport.instrument_sn || currentReport.equipmentId || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
            <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
            <el-descriptions-item label="电子签名" :span="2">
              <el-image
                v-if="operatorSignatureUrl(currentReport)"
                class="operator-signature-image"
                :src="operatorSignatureUrl(currentReport)"
                :preview-src-list="[operatorSignatureUrl(currentReport)]"
                fit="contain"
              />
              <span v-else class="signature-empty">未记录电子签名</span>
            </el-descriptions-item>
            <el-descriptions-item label="模板编号">{{ currentReport.template_no }}</el-descriptions-item>
            <el-descriptions-item label="关联工单">
              {{ currentReport.order_numbers?.join(" / ") || currentReport.task_number }}
            </el-descriptions-item>
            <el-descriptions-item label="测试环境">
              {{ formatEnvironmentWithUnits(currentReport.meta.env_text) }}
            </el-descriptions-item>
            <el-descriptions-item label="测试井段">
              {{ formatIntervalWithUnits(currentReport.meta.interval_text) }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="statusType(currentReport.status)">{{ statusText(currentReport.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="小助手同步状态">
              <el-tag :type="getAssistantReportSyncTagType(currentReport.assistant_sync_status)">
                {{ getAssistantReportSyncStatusText(currentReport.assistant_sync_status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="小助手同步时间">{{
              formatTime(currentReport.assistant_synced_at)
            }}</el-descriptions-item>
            <el-descriptions-item label="同步尝试次数">{{
              currentReport.assistant_sync_retry_count || 0
            }}</el-descriptions-item>
            <el-descriptions-item label="同步失败原因">{{
              currentReport.assistant_sync_error || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">报告内容</div>
          <div class="report-grid">
            <div class="info-tile">
              <span>报告名称</span>
              <strong>{{ currentReport.report_name }}</strong>
            </div>
            <div class="info-tile">
              <span>测试产品</span>
              <strong>{{ currentReport.test_product }}</strong>
            </div>
            <div class="info-tile">
              <span>曲线图编号</span>
              <strong>{{ firstText(currentReport.meta.curve_chart_no, currentReport.meta.curve_no) }}</strong>
            </div>
            <div class="info-tile">
              <span>总体结论</span>
              <strong>{{ currentReport.meta.conclusion === "unqualified" ? "不合格" : "合格" }}</strong>
            </div>
          </div>
        </div>

        <div v-if="usesTemplateReport(currentReport)" class="detail-card">
          <div class="detail-card-title">测试项目</div>
          <el-empty v-if="!currentTemplateSnapshot" description="暂无可用项目定义" :image-size="56" />
          <el-empty v-else-if="!currentTestItemRows.length" description="当前模板未配置测试项目" :image-size="56" />
          <div v-else class="readonly-report-list">
            <div v-for="row in currentTestItemRows" :key="row.label" class="readonly-report-row">
              <div class="readonly-report-label">{{ row.label }}</div>
              <div class="readonly-report-value">{{ row.value }}</div>
            </div>
          </div>
        </div>

        <div v-if="usesTemplateReport(currentReport)" class="detail-card">
          <div class="detail-card-title">资料评价标准值</div>
          <el-empty v-if="!currentTemplateSnapshot" description="暂无可用项目定义" :image-size="56" />
          <el-empty v-else-if="!currentEvaluationRows.length" description="当前模板未配置评价标准" :image-size="56" />
          <div v-else class="readonly-report-list">
            <div v-for="row in currentEvaluationRows" :key="row.label" class="readonly-report-row">
              <div class="readonly-report-label">{{ row.label }}</div>
              <div class="readonly-report-value">{{ row.value }}</div>
            </div>
          </div>
        </div>

        <div v-if="usesTemplateReport(currentReport) && currentTransferDataRows.length" class="detail-card">
          <div class="detail-card-title">测试完成转样数据记录</div>
          <div class="readonly-report-list">
            <div v-for="row in currentTransferDataRows" :key="row.label" class="readonly-report-row">
              <div class="readonly-report-label">{{ row.label }}</div>
              <div class="readonly-report-value">{{ row.value }}</div>
            </div>
          </div>
        </div>

        <div v-if="currentReport.status !== 0" class="detail-card">
          <div class="detail-card-title">审核意见</div>
          <div class="review-comment">{{ currentReport.remark || "-" }}</div>
        </div>

        <div class="detail-card">
          <div class="detail-card-heading">
            <div class="detail-card-title">原始文件与上传文件</div>
          </div>
          <el-empty v-if="!reportAttachments(currentReport).length" description="暂无附件" :image-size="72" />
          <div v-else class="attachment-list">
            <div v-if="curveAttachments(currentReport).length" class="attachment-row">
              <div class="attachment-main">
                <el-tag type="info" effect="plain">原始文件</el-tag>
                <div class="attachment-file-list">
                  <div
                    v-for="(item, index) in curveAttachments(currentReport)"
                    :key="index"
                    class="attachment-file-item"
                  >
                    <div class="attachment-title">{{ attachmentTitle(item) }}</div>
                    <div class="attachment-path">{{ displayReportValue(item.file_url || item.local_path) }}</div>
                  </div>
                </div>
              </div>
              <el-button
                type="primary"
                :icon="Download"
                :loading="curveDownloadingId === currentReport.id"
                @click="handleCurveDownload(currentReport)"
              >
                下载原始文件
              </el-button>
            </div>
            <div v-for="(item, index) in otherAttachments(currentReport)" :key="index" class="attachment-row">
              <div class="attachment-main">
                <el-tag :type="isImageAttachment(item) ? 'success' : 'info'" effect="plain">
                  {{ attachmentType(item) }}
                </el-tag>
                <div>
                  <div class="attachment-title">{{ attachmentTitle(item) }}</div>
                  <div class="attachment-path">{{ displayReportValue(item.file_url || item.local_path) }}</div>
                </div>
              </div>
              <el-button type="primary" plain @click="openAttachment(item)">
                {{ isImageAttachment(item) ? "预览图片" : "打开文件" }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          v-if="currentReport && currentReport.status === 0"
          type="success"
          @click="showApproveDialog(currentReport)"
        >
          审核通过
        </el-button>
        <el-button
          v-if="currentReport && currentReport.status === 0"
          type="danger"
          @click="showRejectDialog(currentReport)"
        >
          审核驳回
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="approveDialogVisible" title="审核通过" width="520px" append-to-body>
      <el-input v-model="approveReason" type="textarea" :rows="5" placeholder="请输入审核意见（可选）" />
      <template #footer>
        <el-button @click="approveDialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleApprove">确认通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="审核驳回" width="520px" append-to-body>
      <el-input v-model="rejectReason" type="textarea" :rows="5" placeholder="请输入驳回原因" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认驳回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewImageVisible" :title="previewImage?.title || '图片预览'" width="860px" append-to-body>
      <el-image
        v-if="previewImage"
        class="preview-image"
        :src="previewImage.url"
        fit="contain"
        :preview-src-list="[previewImage.url]"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.simulation-well-audit {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.reviewer-card,
.audit-card {
  border-radius: 14px;
}

.reviewer-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 2px;
}

.eyebrow {
  color: #0b78d0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.reviewer-title,
.section-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 800;
}

.reviewer-pill {
  padding: 8px 14px;
  border-radius: 999px;
  background: #edf5ff;
  color: #0b78d0;
  font-weight: 700;
}

.section-sub {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-card {
  padding: 16px;
  border: 1px solid #dce6ee;
  border-radius: 14px;
  background: #f8fafc;
}

.detail-card-title {
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 4px solid #0b78d0;
  color: #111827;
  font-size: 16px;
  font-weight: 800;
}

.detail-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.detail-card-heading .detail-card-title {
  margin-bottom: 0;
}

.operator-signature-image {
  width: min(280px, 100%);
  height: 96px;
  border: 1px solid #dce6ee;
  border-radius: 8px;
  background: #fff;
}

.signature-empty {
  color: #909399;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.readonly-report-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.readonly-report-row {
  display: grid;
  grid-template-columns: minmax(180px, 32%) 1fr;
  overflow: hidden;
  border: 1px solid #e1eaf2;
  border-radius: 10px;
  background: #fff;
}

.readonly-report-label,
.readonly-report-value {
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.readonly-report-label {
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
}

.readonly-report-value {
  color: #475569;
}

.info-tile {
  padding: 14px;
  border: 1px solid #e1eaf2;
  border-radius: 12px;
  background: #fff;
}

.info-tile span {
  display: block;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 13px;
}

.info-tile strong {
  color: #111827;
  font-size: 16px;
}

.review-comment {
  padding: 12px 14px;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: #fff7ed;
  color: #9a3412;
  font-weight: 700;
  line-height: 1.7;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e1eaf2;
  border-radius: 12px;
  background: #fff;
}

.attachment-main {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.attachment-file-list {
  min-width: 0;
}

.attachment-file-item + .attachment-file-item {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e1eaf2;
}

.attachment-title {
  color: #111827;
  font-weight: 700;
}

.attachment-path {
  max-width: 620px;
  margin-top: 3px;
  overflow: hidden;
  color: #64748b;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-image {
  width: 100%;
  height: 68vh;
  border-radius: 12px;
  background: #f8fafc;
}

@media (max-width: 900px) {
  .reviewer-strip,
  .toolbar-wrapper,
  .attachment-row {
    align-items: stretch;
    flex-direction: column;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
