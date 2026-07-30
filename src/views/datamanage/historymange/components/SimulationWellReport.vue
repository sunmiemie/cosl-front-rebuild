<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Upload } from "@element-plus/icons-vue"
import { syncEngineerAssistantLocalReportApi } from "@/api/engineer-assistant"
import { useUserStoreHook } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  getSimulatedWellReportDetailApi,
  getSimulatedWellReportListApi,
  updateSimulatedWellReportApi,
  type SimulatedWellReportListItem
} from "@/api/simulated-well-report"
import { displayReportValue, resolveReportFileUrl } from "@/utils/high-temp-pressure-paper-report"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type ReportJson = Record<string, any>
type AttachmentItem = Record<string, any>

type AuditRow = SimulatedWellReportListItem & {
  meta: ReportJson
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
const rows = ref<AuditRow[]>([])
const detailDialogVisible = ref(false)
const currentReport = ref<AuditRow | null>(null)
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

const safeParseRemark = (remark?: string): ReportJson => {
  if (!remark) return {}
  try {
    const parsed = JSON.parse(remark)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

const getMeta = (report: SimulatedWellReportListItem): ReportJson => ({
  ...safeParseRemark(report.remark),
  ...(report.report_json && typeof report.report_json === "object" ? report.report_json : {})
})

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    const text = displayReportValue(value)
    if (text !== "-") return text
  }
  return "-"
}

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

const attachmentTitle = (attachment: AttachmentItem) =>
  firstText(attachment.name, attachment.file_name, attachment.type, attachment.field, "附件")

const attachmentType = (attachment: AttachmentItem) => {
  const raw = String(attachment.type || attachment.field || "")
  if (raw.includes("curve")) return "曲线图"
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

const compactJson = (value?: ReportJson) => {
  if (!value || !Object.keys(value).length) return "-"
  return JSON.stringify(value, null, 2)
}

const reviewPayload = (row: AuditRow, status: number, remark?: string) => ({
  status,
  remark: remark ?? row.remark ?? ""
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

const handleApprove = async (row: AuditRow) => {
  await ElMessageBox.confirm("确认通过该模拟井报告审核吗？", "审核通过", { type: "success" })
  const res = await updateSimulatedWellReportApi(row.id, reviewPayload(row, 1))
  if (res.code === 0) {
    ElMessage.success("审核通过成功")
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
  const res = await updateSimulatedWellReportApi(
    rejectingRow.value.id,
    reviewPayload(rejectingRow.value, 2, rejectReason.value)
  )
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

const handleDownload = (row: AuditRow) => {
  const payload = { ...row, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${row.report_no}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
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
          <div class="section-sub">测试端提交的模拟井报告会进入这里，由管理端完成审核。</div>
        </div>
        <el-button type="primary" icon="RefreshRight" circle @click="getList" />
      </div>

      <el-table :data="pendingTableData" stripe border>
        <el-table-column prop="report_no" label="报告编号" min-width="160" />
        <el-table-column prop="job_no" label="作业编号" min-width="150" />
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
        <el-table-column label="操作" width="210" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
            <el-button link type="success" @click="handleApprove(row)">通过</el-button>
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
          <div class="section-sub">已通过或已驳回的报告记录，可继续查看附件和下载归档。</div>
        </div>
        <el-button type="primary" icon="RefreshRight" circle @click="getList" />
      </div>

      <el-table :data="reviewedTableData" stripe border>
        <el-table-column prop="report_no" label="报告编号" min-width="160" />
        <el-table-column prop="job_no" label="作业编号" min-width="150" />
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
        <el-table-column label="操作" width="230" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">查看</el-button>
            <el-button link type="success" @click="handleDownload(row)">下载</el-button>
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
            <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
            <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
            <el-descriptions-item label="模板编号">{{ currentReport.template_no }}</el-descriptions-item>
            <el-descriptions-item label="关联工单">
              {{ currentReport.order_numbers?.join(" / ") || currentReport.task_number }}
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
          <el-collapse class="report-json-collapse">
            <el-collapse-item title="查看完整结构化报告数据" name="json">
              <pre>{{ compactJson(currentReport.meta) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>

        <div v-if="currentReport.remark && currentReport.status !== 0" class="detail-card">
          <div class="detail-card-title">审核意见</div>
          <div class="review-comment">{{ currentReport.remark }}</div>
        </div>

        <div class="detail-card">
          <div class="detail-card-title">曲线图与上传文件</div>
          <el-empty v-if="!reportAttachments(currentReport).length" description="暂无附件" :image-size="72" />
          <div v-else class="attachment-list">
            <div v-for="(item, index) in reportAttachments(currentReport)" :key="index" class="attachment-row">
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
          @click="handleApprove(currentReport)"
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

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
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

.report-json-collapse {
  margin-top: 12px;
}

.report-json-collapse pre {
  max-height: 280px;
  overflow: auto;
  padding: 12px;
  border-radius: 10px;
  background: #0f172a;
  color: #dbeafe;
  font-size: 12px;
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
  align-items: center;
  gap: 12px;
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
