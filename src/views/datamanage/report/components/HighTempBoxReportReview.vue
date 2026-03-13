<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, View, Check, Close } from "@element-plus/icons-vue"

type HighTempReviewStatus = 0 | 1 | 2

interface HighTempPoint {
  time: string
  setTemp: number
  actualTemp: number
  humidity: number
}

interface HighTempStep {
  stepNo: number
  setTemp: number
  holdMinutes: number
  ok: boolean
  remark?: string
}

interface HighTempReport {
  id: number
  taskNo: string
  deviceName: string
  applicant: string
  result: number
  resultText: string
  reviewStatus: HighTempReviewStatus
  createdAt: string
  reportJson: {
    startTime: string
    endTime: string
    duration: number
    remark?: string
    points: HighTempPoint[]
    steps: HighTempStep[]
    summary: {
      maxTemp: number
      minTemp: number
      avgTemp: number
      avgHumidity: number
    }
  }
  reviewReason?: string
}

const loading = ref(false)
const tableData = ref<HighTempReport[]>([])
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const searchData = reactive({ taskNo: "" })

const detailVisible = ref(false)
const currentReport = ref<HighTempReport | null>(null)
const activeTab = ref("info")

const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingId = ref<number | null>(null)

const allReports = ref<HighTempReport[]>([])

const getResultType = (result: number) => {
  const map: Record<number, string> = { 1: "success", 2: "danger", 3: "warning" }
  return map[result] || ""
}

const formatTime = (time?: string) => {
  if (!time) return "-"
  return time
}

const formatDuration = (duration?: number) => {
  if (!duration) return "-"
  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}分${secs}秒`
}

const ensureMockData = () => {
  if (allReports.value.length) return

  const pad2 = (n: number) => String(n).padStart(2, "0")
  const fmt = (d: Date) => {
    const y = d.getFullYear()
    const m = pad2(d.getMonth() + 1)
    const day = pad2(d.getDate())
    const hh = pad2(d.getHours())
    const mm = pad2(d.getMinutes())
    const ss = pad2(d.getSeconds())
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
  }

  const base = new Date()
  const devices = ["高温箱-01", "高温箱-02", "高温箱-03"]
  const applicants = ["张三", "李四", "王五", "赵六"]

  const mkPoints = (start: Date, count: number, baseSet: number): HighTempPoint[] => {
    const points: HighTempPoint[] = []
    for (let i = 0; i < count; i++) {
      const t = new Date(start.getTime() + i * 60_000)
      const setTemp = baseSet + (i < Math.floor(count / 2) ? 0 : 5)
      const actualTemp = Number((setTemp + Math.sin(i / 4) * 1.2 + (i % 6) * 0.12 - 0.3).toFixed(2))
      const humidity = Number((40 + Math.cos(i / 5) * 6 + (i % 7) * 0.4).toFixed(1))
      points.push({ time: fmt(t), setTemp, actualTemp, humidity })
    }
    return points
  }

  const calcAvg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length)

  const list: HighTempReport[] = []
  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() - (i + 1) * 4_200_000)
    const end = new Date(start.getTime() + (60 + (i % 6) * 15) * 60_000)

    const result = i % 8 === 0 ? 2 : i % 13 === 0 ? 3 : 1
    const resultText = result === 1 ? "正常" : result === 2 ? "异常" : "疑问"

    const baseSet = 70 + (i % 3) * 10
    const points = mkPoints(start, 14 + (i % 9), baseSet)
    const temps = points.map((p) => p.actualTemp)
    const hums = points.map((p) => p.humidity)

    const maxTemp = Number(Math.max(...temps).toFixed(2))
    const minTemp = Number(Math.min(...temps).toFixed(2))
    const avgTemp = Number(calcAvg(temps).toFixed(2))
    const avgHumidity = Number(calcAvg(hums).toFixed(1))

    list.push({
      id: 3000 + i,
      taskNo: `HTB-${base.getFullYear()}${pad2(base.getMonth() + 1)}-${pad2(i + 1)}${pad2((i % 30) + 1)}`,
      deviceName: devices[i % devices.length],
      applicant: applicants[i % applicants.length],
      result,
      resultText,
      reviewStatus: 0,
      createdAt: fmt(new Date(start.getTime() + 8 * 60_000)),
      reportJson: {
        startTime: fmt(start),
        endTime: fmt(end),
        duration: Math.floor((end.getTime() - start.getTime()) / 1000),
        remark: i % 5 === 0 ? "升温段温控存在轻微超调" : "-",
        points,
        steps: [
          {
            stepNo: 1,
            setTemp: baseSet,
            holdMinutes: 30,
            ok: result !== 2,
            remark: result === 2 ? "温度偏差超限" : "-"
          },
          { stepNo: 2, setTemp: baseSet + 5, holdMinutes: 30, ok: true, remark: "-" }
        ],
        summary: { maxTemp, minTemp, avgTemp, avgHumidity }
      }
    })
  }

  allReports.value = list
}

const getTableData = () => {
  ensureMockData()
  loading.value = true

  const keyword = searchData.taskNo.trim().toLowerCase()
  const filtered = allReports.value.filter((r) => {
    if (r.reviewStatus !== 0) return false
    if (!keyword) return true
    return r.taskNo.toLowerCase().includes(keyword)
  })

  pagination.total = filtered.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  tableData.value = filtered.slice(start, start + pagination.pageSize)

  loading.value = false
}

const handleSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

const resetSearch = () => {
  searchData.taskNo = ""
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

const handleDetail = (row: HighTempReport) => {
  currentReport.value = allReports.value.find((r) => r.id === row.id) || null
  activeTab.value = "info"
  detailVisible.value = true
}

const handleApprove = async (report: HighTempReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = allReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  detailVisible.value = false
  getTableData()
}

const showRejectDialog = (report: HighTempReport) => {
  rejectingId.value = report.id
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

const handleReject = () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  const target = allReports.value.find((r) => r.id === rejectingId.value)
  if (!target) return

  target.reviewStatus = 2
  target.reviewReason = rejectReason.value

  ElMessage.success("已打回")
  rejectDialogVisible.value = false
  detailVisible.value = false
  getTableData()
}

onMounted(() => {
  getTableData()
})

defineExpose({ resetSearch })
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <div class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="工单号">
          <el-input v-model="searchData.taskNo" placeholder="请输入工单号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar-wrapper">
      <div />
      <div>
        <el-tooltip content="刷新当前页">
          <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
        </el-tooltip>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="报告ID" width="90" align="center" />
        <el-table-column prop="taskNo" label="工单号" width="210" align="center" />
        <el-table-column prop="deviceName" label="设备" min-width="140" align="center" />
        <el-table-column prop="applicant" label="申请人" width="120" align="center" />
        <el-table-column prop="result" label="测试结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)">{{ row.resultText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default><el-tag type="warning">待审核</el-tag></template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleDetail(row)">详情</el-button>
            <el-button type="success" link :icon="Check" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" link :icon="Close" @click="showRejectDialog(row)">打回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

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

    <el-dialog v-model="detailVisible" title="报告审核" width="900px">
      <el-tabs v-model="activeTab" v-if="currentReport">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ currentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ currentReport.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="设备">{{ currentReport.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ currentReport.applicant }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(currentReport.result)">{{ currentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态"><el-tag type="warning">待审核</el-tag></el-descriptions-item>
            <el-descriptions-item label="测试开始时间">{{
              formatTime(currentReport.reportJson.startTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结束时间">{{
              formatTime(currentReport.reportJson.endTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试时长">{{
              formatDuration(currentReport.reportJson.duration)
            }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ currentReport.reportJson.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="温湿度概览" name="summary">
          <el-row :gutter="20" class="summary-row">
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均温度(°C)</div>
                <div class="summary-value">{{ currentReport.reportJson.summary.avgTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card success">
                <div class="summary-label">最高温度(°C)</div>
                <div class="summary-value">{{ currentReport.reportJson.summary.maxTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card danger">
                <div class="summary-label">最低温度(°C)</div>
                <div class="summary-value">{{ currentReport.reportJson.summary.minTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均湿度(%)</div>
                <div class="summary-value">{{ currentReport.reportJson.summary.avgHumidity }}</div>
              </div>
            </el-col>
          </el-row>

          <el-table :data="currentReport.reportJson.points" size="small" border style="margin-top: 10px">
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="setTemp" label="设定温度(°C)" width="130" align="center" />
            <el-table-column prop="actualTemp" label="实际温度(°C)" width="130" align="center" />
            <el-table-column prop="humidity" label="湿度(%)" width="110" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="程序步骤" name="steps">
          <el-table :data="currentReport.reportJson.steps" size="small" border>
            <el-table-column prop="stepNo" label="步骤" width="80" align="center" />
            <el-table-column prop="setTemp" label="设定温度(°C)" width="140" align="center" />
            <el-table-column prop="holdMinutes" label="保持时长(min)" width="140" align="center" />
            <el-table-column label="结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.ok ? 'success' : 'danger'">{{ row.ok ? "通过" : "异常" }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="180" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showRejectDialog(currentReport!)">打回</el-button>
        <el-button type="success" :icon="Check" @click="handleApprove(currentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认打回</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
}
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.table-wrapper {
  margin-bottom: 20px;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
.summary-row {
  margin-bottom: 10px;
}
.summary-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}
.summary-card.success {
  background: #f0f9eb;
}
.summary-card.danger {
  background: #fef0f0;
}
.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.summary-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}
.summary-card.success .summary-value {
  color: #67c23a;
}
.summary-card.danger .summary-value {
  color: #f56c6c;
}
</style>
