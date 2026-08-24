<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Download, Refresh, Search, Upload } from "@element-plus/icons-vue"
import { syncEngineerAssistantLocalReportApi } from "@/api/engineer-assistant"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  getSimulatedWellReportDetailApi,
  getSimulatedWellReportCurveZipApi,
  getSimulatedWellReportListApi,
  getSimulatedWellReportPdfApi,
  updateSimulatedWellReportApi,
  type SimulatedWellReportListItem
} from "@/api/simulated-well-report"
import { displayReportValue, resolveReportFileUrl } from "@/utils/high-temp-pressure-paper-report"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type ReportJson = Record<string, any>
type AttachmentItem = Record<string, any>
type ReadonlyReportRow = { label: string; value: string }
type ReportSearchState = {
  reportNo: string
  taskNumber: string
  testProduct: string
  tester: string
  status: "" | number
  testDateRange: string[]
}

type AuditRow = SimulatedWellReportListItem & {
  meta: ReportJson
  template_no: string
  job_no: string
  test_product: string
  operator_engineer: string
}

const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

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

const pagination = reactive({ page: 1, pageSize: 10 })

const createSearchState = (): ReportSearchState => ({
  reportNo: "",
  taskNumber: "",
  testProduct: "",
  tester: "",
  status: "",
  testDateRange: []
})

const searchForm = reactive<ReportSearchState>(createSearchState())
const appliedSearch = reactive<ReportSearchState>(createSearchState())

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "simulation"
}

const taskNumberFilter = computed(() => {
  if (!shouldSyncRouteTask()) return ""
  const value = route.query.taskNumber
  return typeof value === "string" ? value.trim().toLowerCase() : ""
})

const includesKeyword = (value: unknown, keyword: string) =>
  !keyword || String(value ?? "").trim().toLowerCase().includes(keyword.trim().toLowerCase())

const filteredRows = computed(() =>
  rows.value.filter((row) => {
    const routeTaskNumber = taskNumberFilter.value
    const taskText = `${row.task_number || ""} ${row.job_no || ""}`
    const testerText = `${row.tester || ""} ${row.operator_engineer || ""}`
    const testDate = String(row.test_date || "").slice(0, 10)
    const [startDate, endDate] = appliedSearch.testDateRange

    return (
      (!routeTaskNumber || taskText.toLowerCase().includes(routeTaskNumber)) &&
      includesKeyword(row.report_no, appliedSearch.reportNo) &&
      includesKeyword(taskText, appliedSearch.taskNumber) &&
      includesKeyword(row.test_product, appliedSearch.testProduct) &&
      includesKeyword(testerText, appliedSearch.tester) &&
      (appliedSearch.status === "" || row.status === appliedSearch.status) &&
      (!startDate || testDate >= startDate) &&
      (!endDate || testDate <= endDate)
    )
  })
)

const total = computed(() => filteredRows.value.length)
const tableData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredRows.value.slice(start, start + pagination.pageSize)
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

const displayReadonlyValue = (value: unknown, empty = "未填写") => {
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
    if (!["depth-group", "range-radio", "multi-input-row", "sampling-group", "card-group"].includes(type)) {
      return { label, value: displayReadonlyValue(valueMap[key]) }
    }
    if (type === "depth-group") {
      const unit = displayReadonlyValue(definition.unit, "m")
      const points = Array.from({ length: positiveFieldCount(definition.pointCount, 4) }, (_, pointIndex) => {
        const point = pointIndex + 1
        const depth = displayReadonlyValue(valueMap[fieldKey(prefix, index, `p${point}`)])
        const result = valueMap[fieldKey(prefix, index, `p${point}_result`)]
        return `第${point}点：${depth}${unit}${result === undefined || result === null || result === "" ? "" : `，${displayReadonlyValue(result)}`}`
      })
      return { label, value: points.join("；") }
    }
    if (type === "range-radio") {
      return {
        label,
        value: `${displayReadonlyValue(valueMap[fieldKey(prefix, index, "from")])} ~ ${displayReadonlyValue(valueMap[fieldKey(prefix, index, "to")])}；${displayReadonlyValue(valueMap[fieldKey(prefix, index, "result")])}`
      }
    }
    if (type === "multi-input-row") {
      const columns = Array.isArray(definition.columns) ? definition.columns : []
      const rows = Array.from({ length: positiveFieldCount(definition.rowCount, 2) }, (_, rowIndex) => {
        const row = columns.map(
          (column: unknown, columnIndex: number) =>
            `${fieldLabel(column, `输入${columnIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `r${rowIndex + 1}c${columnIndex}`)])}`
        )
        return `第${rowIndex + 1}点：${row.join("，") || "未填写"}`
      })
      return { label, value: rows.join("；") }
    }
    if (type === "sampling-group") {
      const items = Array.isArray(definition.items) ? definition.items : []
      const points = Array.from({ length: positiveFieldCount(definition.pointCount, 2) }, (_, pointIndex) => {
        const point = pointIndex + 1
        const values = items.map(
          (item: unknown, itemIndex: number) =>
            `${fieldLabel(item, `项目${itemIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `p${point}i${itemIndex}`)])}`
        )
        return `第${point}点：${values.join("，") || "未填写"}`
      })
      return { label, value: points.join("；") }
    }
    const cards = Array.isArray(definition.cards) ? definition.cards : []
    const cardValues = cards.map((card: unknown, cardIndex: number) => {
      const cardDefinition = card && typeof card === "object" ? (card as Record<string, any>) : {}
      const fields = Array.isArray(cardDefinition.fields) ? cardDefinition.fields : []
      const values = fields.map(
        (item: unknown, itemIndex: number) =>
          `${fieldLabel(item, `字段${itemIndex + 1}`)}：${displayReadonlyValue(valueMap[fieldKey(prefix, index, `c${cardIndex}f${itemIndex}`)])}`
      )
      return `${displayReadonlyValue(cardDefinition.title, `卡片${cardIndex + 1}`)}：${values.join("，") || "未填写"}`
    })
    return { label, value: cardValues.join("；") || "未填写" }
  })
}

const currentTemplateSnapshot = computed<ReportJson | null>(() => {
  const snapshot = currentReport.value?.meta.template_snapshot
  return snapshot && typeof snapshot === "object" ? (snapshot as ReportJson) : null
})
const currentTestItemRows = computed(() =>
  buildReadonlyReportRows(
    currentTemplateSnapshot.value?.test_items,
    currentReport.value?.meta.test_items,
    "test",
    "测试项目"
  )
)
const currentEvaluationRows = computed(() =>
  buildReadonlyReportRows(
    currentTemplateSnapshot.value?.evaluation_standards,
    currentReport.value?.meta.evaluation_standards,
    "eval",
    "评价标准"
  )
)

const getDeviceText = (meta: ReportJson) => {
  const device = meta.selected_device || meta.device || {}
  return firstText(device.deviceName, device.name, meta.device_name, meta.test_product)
}

const normalizeRow = (report: SimulatedWellReportListItem): AuditRow => {
  const meta = getMeta(report)
  return {
    ...report,
    meta,
    template_no: firstText(meta.template_code, meta.selected_template?.report_no),
    job_no: firstText(meta.operation_no, report.task_number),
    test_product: getDeviceText(meta),
    operator_engineer: firstText(meta.operator_engineer, report.tester)
  }
}

const formatTime = (time?: string) => (time ? String(time).replace("T", " ").slice(0, 19) : "-")

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
    if ((pagination.page - 1) * pagination.pageSize >= total.value) pagination.page = 1
  } catch (error) {
    console.error(error)
    rows.value = []
    ElMessage.error("获取模拟井报告列表失败")
  } finally {
    loading.value = false
  }
}

const resetPagination = () => {
  pagination.page = 1
}

const handleSearch = () => {
  Object.assign(appliedSearch, {
    ...searchForm,
    testDateRange: [...searchForm.testDateRange]
  })
  resetPagination()
}

const handleReset = () => {
  Object.assign(searchForm, createSearchState())
  Object.assign(appliedSearch, createSearchState())
  resetPagination()
  void getList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
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
  const res = await updateSimulatedWellReportApi(approvingRow.value.id, reviewPayload(1, approveReason.value))
  if (res.code === 0) {
    ElMessage.success("审核通过成功")
    approveDialogVisible.value = false
    detailDialogVisible.value = false
    void taskCenterStore.refresh(true)
    await getList()
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
    const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" })
    const url = URL.createObjectURL(pdfBlob)
    const filename = `${(row.report_no || "模拟井测试报告").replace(/[\\/:*?"<>|]/g, "-")}.pdf`
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    ElMessage.success("PDF 下载开始")
  } catch (error) {
    console.error("下载模拟井报告 PDF 失败", error)
    ElMessage.error("PDF 下载失败")
  } finally {
    downloadingId.value = null
  }
}

const handleCurveDownload = async (row: AuditRow) => {
  curveDownloadingId.value = row.id
  try {
    const blob = await getSimulatedWellReportCurveZipApi(row.id)
    const zipBlob = blob.type === "application/zip" ? blob : new Blob([blob], { type: "application/zip" })
    const url = URL.createObjectURL(zipBlob)
    const filename = `${(row.report_no || "模拟井测试报告").replace(/[\\/:*?"<>|]/g, "-")}-曲线图.zip`
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    ElMessage.success("原始文件下载已开始")
  } catch (error) {
    console.error("下载模拟井报告曲线图失败", error)
    ElMessage.error("原始文件下载失败")
  } finally {
    curveDownloadingId.value = null
  }
}

const handlePushAssistant = async (row: AuditRow) => {
  await ElMessageBox.confirm("确定重新推送该正式报告到工程师小助手吗？", "推送报告", { type: "warning" })
  assistantPushingId.value = row.id
  try {
    await syncEngineerAssistantLocalReportApi({
      reportType: "simulated-well",
      reportId: row.id
    })
    ElMessage.success("报告已推送到小助手")
  } catch (error) {
    console.error("推送模拟井报告失败", error)
    ElMessage.error("报告推送失败，请检查正式附件和同步日志")
  } finally {
    assistantPushingId.value = null
  }
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
    pagination.page = 1
    void openRouteReportDetail()
  }
)

defineExpose({ resetSearch: handleReset })
</script>

<template>
  <div class="simulation-well-audit report-list-shell">
    <el-card class="report-list-card" shadow="never" v-loading="loading">
      <div class="report-list-toolbar">
        <el-form :inline="true" :model="searchForm" class="report-filter-form report-filter-form--wide">
          <el-form-item label="报告编号">
            <el-input v-model="searchForm.reportNo" placeholder="请输入报告编号" clearable />
          </el-form-item>
          <el-form-item label="任务/作业编号">
            <el-input v-model="searchForm.taskNumber" placeholder="请输入任务或作业编号" clearable />
          </el-form-item>
          <el-form-item label="测试产品">
            <el-input v-model="searchForm.testProduct" placeholder="请输入测试产品" clearable />
          </el-form-item>
          <el-form-item label="测试人员">
            <el-input v-model="searchForm.tester" placeholder="请输入测试人员" clearable />
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
              <el-option label="待审核" :value="0" />
              <el-option label="审核通过" :value="1" />
              <el-option label="审核未通过" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="测试日期">
            <el-date-picker
              v-model="searchForm.testDateRange"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="至"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
        <div class="report-toolbar-actions">
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border height="100%">
          <el-table-column prop="report_no" label="报告编号" min-width="160" />
          <el-table-column prop="job_no" label="作业编号" min-width="150" />
          <el-table-column prop="test_product" label="测试产品" min-width="180" show-overflow-tooltip />
          <el-table-column prop="operator_engineer" label="测试人员" width="120" />
          <el-table-column prop="test_date" label="测试日期" width="130" />
          <el-table-column prop="submit_time" label="提交时间" width="170">
            <template #default="{ row }">{{ formatTime(row.submit_time) }}</template>
          </el-table-column>
          <el-table-column prop="audit_time" label="审核时间" width="170">
            <template #default="{ row }">{{ formatTime(row.audit_time) }}</template>
          </el-table-column>
          <el-table-column label="审核状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="270" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
              <el-button v-if="row.status === 0" link type="success" @click="showApproveDialog(row)">通过</el-button>
              <el-button v-if="row.status === 0" link type="danger" @click="showRejectDialog(row)">驳回</el-button>
              <el-button
                v-if="row.status === 1"
                :loading="downloadingId === row.id"
                link
                type="success"
                @click="handleDownload(row)"
              >
                下载 PDF
              </el-button>
              <el-button
                v-if="row.status === 1"
                :icon="Upload"
                :loading="assistantPushingId === row.id"
                link
                type="primary"
                @click="handlePushAssistant(row)"
              >
                推送
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
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
          </el-descriptions>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">报告内容</div>
          <div class="report-grid">
            <div class="info-tile">
              <span>报告名称</span>
              <strong>{{ firstText(currentReport.meta.report_name, currentReport.report_no) }}</strong>
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

        <div class="detail-card">
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

        <div class="detail-card">
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
  height: 100%;
  min-height: 0;
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
  .attachment-row {
    align-items: stretch;
    flex-direction: column;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
