<script lang="ts" setup>
import { computed, reactive, ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, View, Check, Close } from "@element-plus/icons-vue"
import {
  getWaterCycleReportDetailApi,
  getWaterCycleReportListApi,
  updateWaterCycleReportApi
} from "@/api/water-cycle-report"
import {
  getHighTempBoxReportDetailApi,
  getHighTempBoxReportListApi,
  updateHighTempBoxReportApi
} from "@/api/high-temp-box-report"
import {
  getVibrationTableReportDetailApi,
  getVibrationTableReportListApi,
  updateVibrationTableReportApi
} from "@/api/vibration-table-report"
import {
  getHighTempPressureReportDetailApi,
  getHighTempPressureReportListApi,
  updateHighTempPressureReportApi
} from "@/api/high-temp-pressure-report"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  booleanReportTagType,
  curveReportTagType,
  displayReportValue,
  formatReportCurveStatus,
  formatReportProvider,
  formatReportYesNo,
  getAttachmentFileUrl,
  getAttachmentPath,
  getAttachmentTitle,
  getHighTempPressurePaperReportView,
  isTestingCurveAttachment
} from "@/utils/high-temp-pressure-paper-report"

type ReportType = "water-cycle" | "high-temp-box" | "vibration-table" | "high-temp-high-pressure"

interface ReportRow {
  id: number
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  status_text: string
  overall_result?: "pass" | "fail" | "pending"
  order_ids?: number[]
  order_numbers?: string[]
  instrument_results?: InstrumentResult[]
  report_json?: Record<string, unknown>
  attachments?: Array<Record<string, unknown>>
  client_submit_id?: string
  reviewer_id?: number | null
  submit_time: string
  audit_time: string
  remark: string
}

interface InstrumentResult {
  order_id?: number
  order_no?: string
  instrument_id?: number | string
  instrument_name?: string
  instrument_sn?: string
  result?: "pass" | "fail" | "pending"
  result_text?: string
  observation?: string
  metrics?: Record<string, unknown>
  attachments?: Array<Record<string, unknown>>
}

const props = defineProps<{
  reportType: ReportType
}>()
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

const configs = {
  "water-cycle": {
    title: "水循环报告审核",
    taskLabel: "水循环任务单号",
    getList: getWaterCycleReportListApi,
    getDetail: getWaterCycleReportDetailApi,
    update: updateWaterCycleReportApi
  },
  "high-temp-box": {
    title: "高温箱报告审核",
    taskLabel: "高温箱任务单号",
    getList: getHighTempBoxReportListApi,
    getDetail: getHighTempBoxReportDetailApi,
    update: updateHighTempBoxReportApi
  },
  "vibration-table": {
    title: "振动台报告审核",
    taskLabel: "振动台任务单号",
    getList: getVibrationTableReportListApi,
    getDetail: getVibrationTableReportDetailApi,
    update: updateVibrationTableReportApi
  },
  "high-temp-high-pressure": {
    title: "高温高压报告审核",
    taskLabel: "高温高压任务单号",
    getList: getHighTempPressureReportListApi,
    getDetail: getHighTempPressureReportDetailApi,
    update: updateHighTempPressureReportApi
  }
}

const config = computed(() => configs[props.reportType])
const loading = ref(false)
const tableData = ref<ReportRow[]>([])
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const searchData = reactive({ taskNumber: "", tester: "" })
const detailVisible = ref(false)
const currentReport = ref<ReportRow | null>(null)
const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingReport = ref<ReportRow | null>(null)
const currentPaperReportView = computed(() =>
  getHighTempPressurePaperReportView(currentReport.value?.report_json, currentReport.value?.attachments)
)
const currentCurveImageUrl = computed(() => getAttachmentFileUrl(currentPaperReportView.value.flowCurveAttachment))

const initSearchFromRoute = () => {
  const { taskNumber, tester } = route.query
  searchData.taskNumber = typeof taskNumber === "string" ? taskNumber : ""
  searchData.tester = typeof tester === "string" ? tester : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === props.reportType
}

const formatTime = (time?: string) => time || "-"
const resultText = (result?: string) => {
  if (result === "pass") return "合格"
  if (result === "fail") return "不合格"
  return "待定"
}
const resultTagType = (result?: string) => {
  if (result === "pass") return "success"
  if (result === "fail") return "danger"
  return "warning"
}
const compactJson = (value?: Record<string, unknown>) => {
  if (!value || !Object.keys(value).length) return "-"
  return JSON.stringify(value, null, 2)
}
const formatMetricValue = (metrics?: Record<string, unknown>) => {
  if (!metrics || !Object.keys(metrics).length) return "-"
  return (
    Object.entries(metrics)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join("；") || "-"
  )
}
const nowText = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const getTableData = async () => {
  loading.value = true
  try {
    const res = await config.value.getList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      taskNumber: searchData.taskNumber || undefined,
      tester: searchData.tester || undefined,
      status: 0
    })
    const list = (res.data?.list || []) as ReportRow[]
    tableData.value = list
    pagination.total = res.data?.total || list.length
  } catch {
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

const resetSearch = () => {
  searchData.taskNumber = ""
  searchData.tester = ""
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  getTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  getTableData()
}

const handleDetail = async (row: ReportRow) => {
  try {
    const res = await config.value.getDetail(row.id)
    currentReport.value = res.code === 0 ? (res.data as ReportRow) : row
  } catch {
    currentReport.value = row
  }
  detailVisible.value = true
}

const openRouteReportDetail = async () => {
  if (!shouldSyncRouteTask()) return
  const reportId = Number(route.query.reportId)
  if (!reportId) return
  try {
    const res = await config.value.getDetail(reportId)
    if (res.code === 0) {
      currentReport.value = res.data as ReportRow
      detailVisible.value = true
    }
  } catch {
    return
  }
}

const handleApprove = async (report: ReportRow) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })
  await config.value.update(report.id, {
    status: 1,
    audit_time: nowText(),
    remark: report.remark || ""
  })
  ElMessage.success("审核通过成功")
  detailVisible.value = false
  void taskCenterStore.refresh(true)
  getTableData()
}

const showRejectDialog = (report: ReportRow) => {
  rejectingReport.value = report
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectingReport.value) return
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }
  await config.value.update(rejectingReport.value.id, {
    status: 2,
    audit_time: nowText(),
    remark: rejectReason.value
  })
  ElMessage.success("已打回")
  rejectDialogVisible.value = false
  detailVisible.value = false
  void taskCenterStore.refresh(true)
  getTableData()
}

onMounted(() => {
  initSearchFromRoute()
  getTableData()
  void openRouteReportDetail()
})

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.currentPage = 1
    getTableData()
    void openRouteReportDetail()
  }
)

defineExpose({ resetSearch })
</script>

<template>
  <el-card v-loading="loading" shadow="never" class="real-report-review">
    <div class="review-head">
      <div>
        <p>REAL REVIEW</p>
        <h3>{{ config.title }}</h3>
      </div>
      <el-tag type="success" effect="plain">后端实时数据</el-tag>
    </div>

    <div class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item :label="config.taskLabel">
          <el-input v-model="searchData.taskNumber" placeholder="请输入任务单号" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="测试人员">
          <el-input v-model="searchData.tester" placeholder="请输入测试人员" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" stripe border>
      <el-table-column prop="id" label="报告ID" width="90" align="center" />
      <el-table-column prop="report_no" label="报告编号" min-width="160" />
      <el-table-column prop="task_number" label="任务单号" min-width="160" />
      <el-table-column prop="tester" label="测试人员" width="120" align="center" />
      <el-table-column prop="test_date" label="测试日期" width="130" align="center" />
      <el-table-column prop="submit_time" label="提交时间" width="180" align="center">
        <template #default="{ row }">{{ formatTime(row.submit_time) }}</template>
      </el-table-column>
      <el-table-column label="审核状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag type="warning">{{ row.status_text || "待审核" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right" align="center">
        <template #default="{ row }">
          <el-button :icon="View" link type="primary" @click="handleDetail(row)">详情</el-button>
          <el-button :icon="Check" link type="success" @click="handleApprove(row)">通过</el-button>
          <el-button :icon="Close" link type="danger" @click="showRejectDialog(row)">打回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager-wrapper">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :current-page="pagination.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="detailVisible" title="报告审核" width="980px">
      <el-descriptions v-if="currentReport" :column="2" border>
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
        <el-descriptions-item label="总体结论">
          <el-tag :type="resultTagType(currentReport.overall_result)">
            {{ resultText(currentReport.overall_result) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联工单">{{
          currentReport.order_numbers?.join(" / ") || currentReport.task_number
        }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentReport" class="detail-block">
        <h4>逐台仪器结论</h4>
        <el-table :data="currentReport.instrument_results || []" border size="small">
          <el-table-column prop="order_no" label="工单号" min-width="130" />
          <el-table-column prop="instrument_name" label="仪器名称" min-width="150" />
          <el-table-column prop="instrument_sn" label="SN" min-width="150" />
          <el-table-column label="结论" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="resultTagType(row.result)">{{ row.result_text || resultText(row.result) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="observation" label="观察记录" min-width="180">
            <template #default="{ row }">{{ row.observation || "-" }}</template>
          </el-table-column>
          <el-table-column label="关键指标" min-width="220">
            <template #default="{ row }">{{ formatMetricValue(row.metrics) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div
        v-if="currentReport && props.reportType === 'high-temp-high-pressure' && currentPaperReportView.hasPaperReport"
        class="detail-block paper-report-block"
      >
        <h4>纸质报告检查项</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="报告格式">{{
            displayReportValue(currentPaperReportView.paperReport.title)
          }}</el-descriptions-item>
          <el-descriptions-item label="Ref No.">{{
            displayReportValue(currentPaperReportView.paperReport.ref_no)
          }}</el-descriptions-item>
          <el-descriptions-item label="名称 Name">{{
            displayReportValue(currentPaperReportView.testingItemInformation.name)
          }}</el-descriptions-item>
          <el-descriptions-item label="数量 Quantity">{{
            displayReportValue(currentPaperReportView.testingItemInformation.quantity)
          }}</el-descriptions-item>
          <el-descriptions-item label="编号 No.">{{
            displayReportValue(currentPaperReportView.testingItemInformation.no)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试压力 Testing Pressure">{{
            displayReportValue(currentPaperReportView.testingRequirements.testing_pressure)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试温度 Testing Temperature">{{
            displayReportValue(currentPaperReportView.testingRequirements.testing_temperature)
          }}</el-descriptions-item>
          <el-descriptions-item label="保温保压 Hold Time">{{
            displayReportValue(currentPaperReportView.testingRequirements.hold_time)
          }}</el-descriptions-item>
          <el-descriptions-item label="在线测试 Online Test">
            <el-tag :type="booleanReportTagType(currentPaperReportView.testingRequirements.online_test)">
              {{ formatReportYesNo(currentPaperReportView.testingRequirements.online_test) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="其他要求 Other Requirements">{{
            displayReportValue(currentPaperReportView.testingRequirements.other_requirements)
          }}</el-descriptions-item>
          <el-descriptions-item label="试压护帽 Testing Protective Cap">{{
            formatReportProvider(currentPaperReportView.fittingsProvided.testing_protective_cap)
          }}</el-descriptions-item>
          <el-descriptions-item label="试压堵头 Testing Plug">{{
            formatReportProvider(currentPaperReportView.fittingsProvided.testing_plug)
          }}</el-descriptions-item>
          <el-descriptions-item label="外观未变形 No Distorted">
            <el-tag :type="booleanReportTagType(currentPaperReportView.appearanceInspection.no_distorted)">
              {{ formatReportYesNo(currentPaperReportView.appearanceInspection.no_distorted, "未变形", "已变形") }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="无明显泄漏 No Obvious Leakage">
            <el-tag :type="booleanReportTagType(currentPaperReportView.appearanceInspection.no_obvious_leakage)">
              {{
                formatReportYesNo(
                  currentPaperReportView.appearanceInspection.no_obvious_leakage,
                  "无明显泄漏",
                  "有明显泄漏"
                )
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试曲线 Testing Curve">
            <el-tag :type="curveReportTagType(currentPaperReportView.testingResult.testing_curve)">
              {{ formatReportCurveStatus(currentPaperReportView.testingResult.testing_curve) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="其他描述 Other Descriptions">{{
            displayReportValue(currentPaperReportView.testingResult.other_descriptions)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试曲线份数">{{
            displayReportValue(currentPaperReportView.testingCurveAttachment.copies)
          }}</el-descriptions-item>
          <el-descriptions-item label="其他附件份数">{{
            displayReportValue(currentPaperReportView.otherAttachment.copies)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试曲线路径" :span="2">{{
            displayReportValue(
              currentPaperReportView.flowCurveAttachment?.file_url ||
                currentPaperReportView.flowCurveAttachment?.local_path ||
                currentPaperReportView.testingCurveAttachment.file_url ||
                currentPaperReportView.testingCurveAttachment.local_path
            )
          }}</el-descriptions-item>
        </el-descriptions>
        <div v-if="currentCurveImageUrl" class="curve-preview-card">
          <div class="curve-preview-head">
            <span>测试曲线预览</span>
            <el-link :href="currentCurveImageUrl" target="_blank" type="primary">下载/打开原图</el-link>
          </div>
          <el-image
            :src="currentCurveImageUrl"
            fit="contain"
            :preview-src-list="[currentCurveImageUrl]"
            class="curve-preview-image"
          />
        </div>
      </div>
      <div v-if="currentReport" class="detail-block detail-grid">
        <div>
          <el-collapse>
            <el-collapse-item title="采集摘要（调试信息）" name="capture-json">
              <pre>{{ compactJson(currentReport.report_json) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div>
          <h4>附件/文件</h4>
          <el-empty v-if="!currentReport.attachments?.length" description="暂无附件" :image-size="64" />
          <ul v-else class="attachment-list">
            <li
              v-for="(item, index) in currentReport.attachments"
              :key="index"
              :class="{ 'is-curve': isTestingCurveAttachment(item) }"
            >
              <el-tag v-if="isTestingCurveAttachment(item)" size="small" type="success">测试曲线</el-tag>
              {{ getAttachmentTitle(item) }}
              <span>{{ getAttachmentPath(item) }}</span>
              <el-link
                v-if="getAttachmentFileUrl(item)"
                :href="getAttachmentFileUrl(item)"
                target="_blank"
                type="primary"
              >
                下载/打开
              </el-link>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentReport" type="success" @click="handleApprove(currentReport)">审核通过</el-button>
        <el-button v-if="currentReport" type="danger" @click="showRejectDialog(currentReport)">审核打回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="审核打回" width="520px">
      <el-input v-model="rejectReason" type="textarea" :rows="5" placeholder="请输入打回原因" />
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认打回</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped lang="scss">
.real-report-review {
  .review-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 18px;
    border: 1px solid #dce6ee;
    border-radius: 14px;
    background: linear-gradient(135deg, #f7fbff, #f5f0e6);
  }

  .review-head p {
    margin: 0 0 4px;
    color: #b7791f;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .review-head h3 {
    margin: 0;
    color: #24323a;
  }

  .search-wrapper {
    margin-bottom: 14px;
  }

  .pager-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .detail-block {
    margin-top: 16px;
  }

  .detail-block h4 {
    margin: 0 0 10px;
    color: #24323a;
    font-size: 14px;
  }

  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .paper-report-block {
    padding: 14px;
    border: 1px solid #dce6ee;
    border-radius: 12px;
    background: #fbfcf8;
  }

  .curve-preview-card {
    margin-top: 14px;
    padding: 12px;
    border: 1px solid #b8e3c6;
    border-radius: 12px;
    background: #f0fdf4;
  }

  .curve-preview-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    color: #166534;
    font-size: 13px;
    font-weight: 700;
  }

  .curve-preview-image {
    width: 100%;
    height: 320px;
    border: 1px solid #dcfce7;
    border-radius: 10px;
    background: #fff;
  }

  .detail-grid pre {
    max-height: 220px;
    overflow: auto;
    padding: 12px;
    border: 1px solid #dce6ee;
    border-radius: 10px;
    background: #f8fafc;
    color: #334155;
    font-size: 12px;
    white-space: pre-wrap;
  }

  .attachment-list {
    margin: 0;
    padding-left: 18px;
    color: #334155;
    font-size: 13px;
  }

  .attachment-list li {
    margin-bottom: 8px;
  }

  .attachment-list li.is-curve {
    padding: 8px 10px;
    border: 1px solid #b8e3c6;
    border-radius: 8px;
    background: #f0fdf4;
    list-style: none;
  }

  .attachment-list span {
    display: block;
    color: #64748b;
    font-size: 12px;
    word-break: break-all;
  }
}
</style>
