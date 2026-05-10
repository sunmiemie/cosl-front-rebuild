<script lang="ts" setup>
import { computed, reactive, ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, View, Check, Close } from "@element-plus/icons-vue"
import { getWaterCycleReportListApi, updateWaterCycleReportApi } from "@/api/water-cycle-report"
import { getHighTempBoxReportListApi, updateHighTempBoxReportApi } from "@/api/high-temp-box-report"
import { getVibrationTableReportListApi, updateVibrationTableReportApi } from "@/api/vibration-table-report"
import { getHighTempPressureReportListApi, updateHighTempPressureReportApi } from "@/api/high-temp-pressure-report"

type ReportType = "water-cycle" | "high-temp-box" | "vibration-table" | "high-temp-high-pressure"

interface ReportRow {
  id: number
  report_no: string
  task_number: string
  test_date: string
  tester: string
  status: number
  status_text: string
  submit_time: string
  audit_time: string
  remark: string
}

const props = defineProps<{
  reportType: ReportType
}>()

const configs = {
  "water-cycle": {
    title: "水循环报告审核",
    taskLabel: "水循环任务单号",
    getList: getWaterCycleReportListApi,
    update: updateWaterCycleReportApi
  },
  "high-temp-box": {
    title: "高温箱报告审核",
    taskLabel: "高温箱任务单号",
    getList: getHighTempBoxReportListApi,
    update: updateHighTempBoxReportApi
  },
  "vibration-table": {
    title: "振动台报告审核",
    taskLabel: "振动台任务单号",
    getList: getVibrationTableReportListApi,
    update: updateVibrationTableReportApi
  },
  "high-temp-high-pressure": {
    title: "高温高压报告审核",
    taskLabel: "高温高压任务单号",
    getList: getHighTempPressureReportListApi,
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

const formatTime = (time?: string) => time || "-"
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
      tester: searchData.tester || undefined
    })
    const list = ((res.data?.list || []) as ReportRow[]).filter((item) => Number(item.status) === 0)
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

const handleDetail = (row: ReportRow) => {
  currentReport.value = row
  detailVisible.value = true
}

const handleApprove = async (report: ReportRow) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })
  await config.value.update(report.id, {
    status: 1,
    audit_time: nowText(),
    remark: report.remark || ""
  } as any)
  ElMessage.success("审核通过成功")
  detailVisible.value = false
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
  } as any)
  ElMessage.success("已打回")
  rejectDialogVisible.value = false
  detailVisible.value = false
  getTableData()
}

onMounted(getTableData)
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

    <el-dialog v-model="detailVisible" title="报告审核" width="720px">
      <el-descriptions v-if="currentReport" :column="2" border>
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
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
}
</style>
