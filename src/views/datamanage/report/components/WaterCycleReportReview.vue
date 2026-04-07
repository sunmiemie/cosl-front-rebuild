<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, View, Check, Close } from "@element-plus/icons-vue"

type WaterCycleReviewStatus = 0 | 1 | 2

interface WaterCyclePoint {
  time: string
  temperature: number
  pressure: number
  flow: number
}

interface WaterCycleCycle {
  cycleNo: number
  targetTemp: string
  holdMinutes: number
  ok: boolean
  remark?: string
}

interface WaterCycleReport {
  id: number
  taskNo: string
  deviceName: string
  applicant: string
  result: number
  resultText: string
  reviewStatus: WaterCycleReviewStatus
  createdAt: string
  reportJson: {
    startTime: string
    endTime: string
    duration: number
    remark?: string
    points: WaterCyclePoint[]
    cycles: WaterCycleCycle[]
  }
  reviewReason?: string
}

const loading = ref(false)
const tableData = ref<WaterCycleReport[]>([])
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const searchData = reactive({ taskNo: "" })

const detailVisible = ref(false)
const currentReport = ref<WaterCycleReport | null>(null)
const activeTab = ref("info")

const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingId = ref<number | null>(null)

const allReports = ref<WaterCycleReport[]>([])

const getResultType = (
  result: number
): "success" | "warning" | "danger" | undefined => {
  const map: Record<number, string> = { 1: "success", 2: "danger", 3: "warning" }
  return (map[result] as "success" | "warning" | "danger" | undefined) ?? undefined
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
  const devices = ["水循环机-01", "水循环机-02", "水循环机-03"]
  const applicants = ["张三", "李四", "王五", "赵六"]

  const mkPoints = (start: Date, count: number): WaterCyclePoint[] => {
    const points: WaterCyclePoint[] = []
    for (let i = 0; i < count; i++) {
      const t = new Date(start.getTime() + i * 60_000)
      points.push({
        time: fmt(t),
        temperature: Number((35 + Math.sin(i / 3) * 4 + (i % 5) * 0.3).toFixed(2)),
        pressure: Number((1.4 + Math.cos(i / 4) * 0.18 + (i % 7) * 0.01).toFixed(3)),
        flow: Number((18 + Math.sin(i / 5) * 1.2 + (i % 6) * 0.2).toFixed(2))
      })
    }
    return points
  }

  const list: WaterCycleReport[] = []
  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() - (i + 1) * 3_600_000)
    const end = new Date(start.getTime() + (45 + (i % 6) * 10) * 60_000)

    const result = i % 7 === 0 ? 2 : i % 11 === 0 ? 3 : 1
    const resultText = result === 1 ? "正常" : result === 2 ? "异常" : "疑问"

    list.push({
      id: 2000 + i,
      taskNo: `WC-${base.getFullYear()}${pad2(base.getMonth() + 1)}-${pad2(i + 1)}${pad2((i % 30) + 1)}`,
      deviceName: devices[i % devices.length],
      applicant: applicants[i % applicants.length],
      result,
      resultText,
      reviewStatus: 0,
      createdAt: fmt(new Date(start.getTime() + 5 * 60_000)),
      reportJson: {
        startTime: fmt(start),
        endTime: fmt(end),
        duration: Math.floor((end.getTime() - start.getTime()) / 1000),
        remark: i % 4 === 0 ? "运行过程中观察到短时波动" : "-",
        points: mkPoints(start, 12 + (i % 8)),
        cycles: [
          {
            cycleNo: 1,
            targetTemp: "35→45",
            holdMinutes: 15,
            ok: result !== 2,
            remark: result === 2 ? "升温阶段波动超限" : "-"
          },
          { cycleNo: 2, targetTemp: "45→35", holdMinutes: 15, ok: true, remark: "-" }
        ]
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

const handleDetail = (row: WaterCycleReport) => {
  currentReport.value = allReports.value.find((r) => r.id === row.id) || null
  activeTab.value = "info"
  detailVisible.value = true
}

const handleApprove = async (report: WaterCycleReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = allReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  detailVisible.value = false
  getTableData()
}

const showRejectDialog = (report: WaterCycleReport) => {
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
        <el-table-column prop="taskNo" label="工单号" width="200" align="center" />
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

        <el-tab-pane label="采集数据" name="points">
          <el-table :data="currentReport.reportJson.points" size="small" border>
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="temperature" label="温度(°C)" width="120" align="center" />
            <el-table-column prop="pressure" label="压力(MPa)" width="120" align="center" />
            <el-table-column prop="flow" label="流量(L/min)" width="130" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="循环阶段" name="cycles">
          <el-table :data="currentReport.reportJson.cycles" size="small" border>
            <el-table-column prop="cycleNo" label="阶段" width="80" align="center" />
            <el-table-column prop="targetTemp" label="目标温度区间" min-width="140" align="center" />
            <el-table-column prop="holdMinutes" label="保持时长(min)" width="130" align="center" />
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
</style>
