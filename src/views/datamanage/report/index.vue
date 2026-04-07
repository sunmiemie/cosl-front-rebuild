<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { type FormInstance, type TabsPaneContext, ElMessage, ElMessageBox } from "element-plus"
import { ElButton } from "element-plus"
import { Refresh, Search, View, Check, Close } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { getReportCheckDataApi } from "@/api/report"
import { getTestTypeDataApi } from "@/api/testtype"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import {
  getHaltHassReportList,
  getHaltHassReportDetail,
  approveHaltHassReport,
  rejectHaltHassReport
} from "@/api/halt-hass"
import type { HaltHassReportListItem, HaltHassReportDetail } from "@/api/halt-hass/types"

import HaltHassReportReview from "./components/HaltHassReportReview.vue"
import WaterCycleReportReview from "./components/WaterCycleReportReview.vue"
import HighTempBoxReportReview from "./components/HighTempBoxReportReview.vue"
import VibrationTableReportReview from "./components/VibrationTableReportReview.vue"
import HighTempHighPressureReportReview from "./components/HighTempHighPressureReportReview.vue"

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
const DialogCheck = ref(false)

// Tab 切换
const activeTab = ref("normal")

const haltHassReviewRef = ref<InstanceType<typeof HaltHassReportReview> | null>(null)
const waterCycleReviewRef = ref<InstanceType<typeof WaterCycleReportReview> | null>(null)
const highTempBoxReviewRef = ref<InstanceType<typeof HighTempBoxReportReview> | null>(null)
const vibrationReviewRef = ref<InstanceType<typeof VibrationTableReportReview> | null>(null)
const hthpReviewRef = ref<InstanceType<typeof HighTempHighPressureReportReview> | null>(null)

interface TestCheckType {
  ID?: string
  version?: string
  type?: string
}

const TestCheck = ref<TestCheckType>({
  ID: "",
  version: "",
  type: ""
})

// 提交审核
const onSubmit = () => {
  DialogCheck.value = false
}

const headers1 = ref([
  { prop: "report_number", label: "报告编号", align: "center" },
  { prop: "prod_or_temp", label: "报告种类", align: "center" },
  { prop: "product", label: "产品", align: "center" },
  { prop: "instrument", label: "仪器", align: "center" },
  { prop: "model_or_name", label: "电路板型号名称", align: "center" },
  { prop: "boardSerial", label: "序列号", align: "center" },
  { prop: "type", label: "报告类型", align: "center" },
  { prop: "user", label: "测试人", align: "center" },
  { prop: "date", label: "生成时间", align: "center" },
  { prop: "status", label: "报告状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

// Load saved page size from localStorage
const savedPageSize = localStorage.getItem("pageSize")
if (savedPageSize) {
  paginationData.pageSize = parseInt(savedPageSize)
}

// Watch for changes in page size and save to localStorage
watch(
  () => paginationData.pageSize,
  (newSize) => {
    localStorage.setItem("pageSize", newSize.toString())
  }
)

const TableData = ref<any>([])
const testTypeList = ref<any>([])
const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  user: "",
  type: "",
  serial: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "审核" }
  }
}

const userId = useUserStore().userid
const getTableData = () => {
  loading.value = true

  getReportCheckDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    user: searchData.user || undefined,
    type: searchData.type || undefined,
    serial: searchData.serial || undefined,
    userId
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total

    router.replace({ query: { ...router.currentRoute.value.query, page: res.data.currentPage } })

    for (let i = 0; i < TableData.value.length; i++) {
      TableData.value[i].link = defineLink(TableData.value[i].status)
    }
    loading.value = false
  })
}

const handleLink = (data: any, i: string) => {
  if (i === "审核") {
    if (data.prod_or_temp === "正式") {
      if (data.type === "功能性测试") {
        router.push({ name: "checkFunctionalReport", query: data })
      } else {
        router.push({ name: "checkReport", query: data })
      }
    } else {
      router.push({ name: "checkTempReport", query: data })
    }
  }
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

/**
 * 重置查询条件
 */
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
//#endregion

// ==================== HALT-HASS 报告审核相关 ====================

const userStore = useUserStore()

const haltHassLoading = ref(false)
const haltHassTableData = ref<HaltHassReportListItem[]>([])
const haltHassPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// HALT-HASS 搜索
const haltHassSearchData = reactive({
  orderNo: ""
})

// 详情对话框
const haltHassDetailVisible = ref(false)
const haltHassCurrentReport = ref<HaltHassReportDetail | null>(null)
const haltHassActiveTab = ref("info")

// 打回原因对话框
const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingReportId = ref<number | null>(null)

// 获取 HALT-HASS 待审核报告列表
const getHaltHassTableData = () => {
  haltHassLoading.value = true
  getHaltHassReportList({
    page: haltHassPagination.currentPage,
    pageSize: haltHassPagination.pageSize,
    orderNo: haltHassSearchData.orderNo || undefined,
    reviewStatus: "0" // 只获取待审核状态
  })
    .then((res) => {
      if (res.code === 0) {
        haltHassTableData.value = res.data.list
        haltHassPagination.total = res.data.total
      } else {
        haltHassTableData.value = []
      }
    })
    .catch(() => {
      haltHassTableData.value = []
    })
    .finally(() => {
      haltHassLoading.value = false
    })
}

// HALT-HASS 搜索
const handleHaltHassSearch = () => {
  haltHassPagination.currentPage = 1
  getHaltHassTableData()
}

// HALT-HASS 重置
const resetHaltHassSearch = () => {
  haltHassSearchData.orderNo = ""
  handleHaltHassSearch()
}

// HALT-HASS 分页
const handleHaltHassSizeChange = (size: number) => {
  haltHassPagination.pageSize = size
  haltHassPagination.currentPage = 1
  getHaltHassTableData()
}

const handleHaltHassCurrentChange = (page: number) => {
  haltHassPagination.currentPage = page
  getHaltHassTableData()
}

// 获取结果类型
const getResultType = (
  result: number
): "success" | "warning" | "info" | "primary" | "danger" | undefined => {
  const map: Record<number, "success" | "warning" | "info" | "primary" | "danger" | undefined> = {
    1: "success",
    2: "danger",
    3: "warning"
  }
  return map[result]
}

// 查看 HALT-HASS 报告详情
const handleHaltHassDetail = async (row: HaltHassReportListItem) => {
  try {
    const res = await getHaltHassReportDetail(row.id)
    if (res.code === 0) {
      haltHassCurrentReport.value = res.data
      haltHassActiveTab.value = "info"
      haltHassDetailVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

// 审核通过
const handleApprove = async (report: HaltHassReportDetail | HaltHassReportListItem) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", {
    type: "success"
  })

  try {
    const res = await approveHaltHassReport(report.id, {
      reviewerId: userStore.userid!,
      comment: ""
    })
    if (res.code === 0) {
      ElMessage.success("审核通过成功")
      haltHassDetailVisible.value = false
      getHaltHassTableData()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  }
}

// 显示打回对话框
const showRejectDialog = (report: HaltHassReportDetail | HaltHassReportListItem) => {
  rejectingReportId.value = report.id
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

// 审核打回
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  try {
    const res = await rejectHaltHassReport(rejectingReportId.value!, {
      reviewerId: userStore.userid!,
      reason: rejectReason.value
    })
    if (res.code === 0) {
      ElMessage.success("已打回")
      rejectDialogVisible.value = false
      haltHassDetailVisible.value = false
      getHaltHassTableData()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  }
}

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

const waterCycleLoading = ref(false)
const waterCycleTableData = ref<WaterCycleReport[]>([])
const waterCyclePagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const waterCycleSearchData = reactive({ taskNo: "" })

const waterCycleDetailVisible = ref(false)
const waterCycleCurrentReport = ref<WaterCycleReport | null>(null)
const waterCycleActiveTab = ref("info")

const waterCycleRejectDialogVisible = ref(false)
const waterCycleRejectReason = ref("")
const waterCycleRejectingReportId = ref<number | null>(null)

const waterCycleAllReports = ref<WaterCycleReport[]>([])

const ensureWaterCycleMockData = () => {
  if (waterCycleAllReports.value.length) return

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

  waterCycleAllReports.value = list
}

const getWaterCycleTableData = () => {
  ensureWaterCycleMockData()
  waterCycleLoading.value = true

  const keyword = waterCycleSearchData.taskNo.trim().toLowerCase()
  const filtered = waterCycleAllReports.value.filter((r) => {
    if (r.reviewStatus !== 0) return false
    if (!keyword) return true
    return r.taskNo.toLowerCase().includes(keyword)
  })

  waterCyclePagination.total = filtered.length
  const start = (waterCyclePagination.currentPage - 1) * waterCyclePagination.pageSize
  waterCycleTableData.value = filtered.slice(start, start + waterCyclePagination.pageSize)

  waterCycleLoading.value = false
}

const handleWaterCycleSearch = () => {
  waterCyclePagination.currentPage = 1
  getWaterCycleTableData()
}

const resetWaterCycleSearch = () => {
  waterCycleSearchData.taskNo = ""
  handleWaterCycleSearch()
}

const handleWaterCycleSizeChange = (size: number) => {
  waterCyclePagination.pageSize = size
  waterCyclePagination.currentPage = 1
  getWaterCycleTableData()
}

const handleWaterCycleCurrentChange = (page: number) => {
  waterCyclePagination.currentPage = page
  getWaterCycleTableData()
}

const handleWaterCycleDetail = (row: WaterCycleReport) => {
  waterCycleCurrentReport.value = waterCycleAllReports.value.find((r) => r.id === row.id) || null
  waterCycleActiveTab.value = "info"
  waterCycleDetailVisible.value = true
}

const handleWaterCycleApprove = async (report: WaterCycleReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = waterCycleAllReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  waterCycleDetailVisible.value = false
  getWaterCycleTableData()
}

const showWaterCycleRejectDialog = (report: WaterCycleReport) => {
  waterCycleRejectingReportId.value = report.id
  waterCycleRejectReason.value = ""
  waterCycleRejectDialogVisible.value = true
}

const handleWaterCycleReject = () => {
  if (!waterCycleRejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  const target = waterCycleAllReports.value.find((r) => r.id === waterCycleRejectingReportId.value)
  if (!target) return

  target.reviewStatus = 2
  target.reviewReason = waterCycleRejectReason.value

  ElMessage.success("已打回")
  waterCycleRejectDialogVisible.value = false
  waterCycleDetailVisible.value = false
  getWaterCycleTableData()
}

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

const highTempLoading = ref(false)
const highTempTableData = ref<HighTempReport[]>([])
const highTempPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const highTempSearchData = reactive({ taskNo: "" })

const highTempDetailVisible = ref(false)
const highTempCurrentReport = ref<HighTempReport | null>(null)
const highTempActiveTab = ref("info")

const highTempRejectDialogVisible = ref(false)
const highTempRejectReason = ref("")
const highTempRejectingReportId = ref<number | null>(null)

const highTempAllReports = ref<HighTempReport[]>([])

const ensureHighTempMockData = () => {
  if (highTempAllReports.value.length) return

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

  highTempAllReports.value = list
}

const getHighTempTableData = () => {
  ensureHighTempMockData()
  highTempLoading.value = true

  const keyword = highTempSearchData.taskNo.trim().toLowerCase()
  const filtered = highTempAllReports.value.filter((r) => {
    if (r.reviewStatus !== 0) return false
    if (!keyword) return true
    return r.taskNo.toLowerCase().includes(keyword)
  })

  highTempPagination.total = filtered.length
  const start = (highTempPagination.currentPage - 1) * highTempPagination.pageSize
  highTempTableData.value = filtered.slice(start, start + highTempPagination.pageSize)

  highTempLoading.value = false
}

const handleHighTempSearch = () => {
  highTempPagination.currentPage = 1
  getHighTempTableData()
}

const resetHighTempSearch = () => {
  highTempSearchData.taskNo = ""
  handleHighTempSearch()
}

const handleHighTempSizeChange = (size: number) => {
  highTempPagination.pageSize = size
  highTempPagination.currentPage = 1
  getHighTempTableData()
}

const handleHighTempCurrentChange = (page: number) => {
  highTempPagination.currentPage = page
  getHighTempTableData()
}

const handleHighTempDetail = (row: HighTempReport) => {
  highTempCurrentReport.value = highTempAllReports.value.find((r) => r.id === row.id) || null
  highTempActiveTab.value = "info"
  highTempDetailVisible.value = true
}

const handleHighTempApprove = async (report: HighTempReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = highTempAllReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  highTempDetailVisible.value = false
  getHighTempTableData()
}

const showHighTempRejectDialog = (report: HighTempReport) => {
  highTempRejectingReportId.value = report.id
  highTempRejectReason.value = ""
  highTempRejectDialogVisible.value = true
}

const handleHighTempReject = () => {
  if (!highTempRejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  const target = highTempAllReports.value.find((r) => r.id === highTempRejectingReportId.value)
  if (!target) return

  target.reviewStatus = 2
  target.reviewReason = highTempRejectReason.value

  ElMessage.success("已打回")
  highTempRejectDialogVisible.value = false
  highTempDetailVisible.value = false
  getHighTempTableData()
}

type VibrationReviewStatus = 0 | 1 | 2

interface VibrationPoint {
  time: string
  setFreq: number
  setAccel: number
  actualAccel: number
  displacement: number
}

interface VibrationStep {
  stepNo: number
  freqRange: string
  holdMinutes: number
  ok: boolean
  remark?: string
}

interface VibrationReport {
  id: number
  taskNo: string
  deviceName: string
  applicant: string
  result: number
  resultText: string
  reviewStatus: VibrationReviewStatus
  createdAt: string
  reportJson: {
    startTime: string
    endTime: string
    duration: number
    remark?: string
    points: VibrationPoint[]
    steps: VibrationStep[]
    summary: {
      maxAccel: number
      rmsAccel: number
      maxDisp: number
    }
  }
  reviewReason?: string
}

const vibrationLoading = ref(false)
const vibrationTableData = ref<VibrationReport[]>([])
const vibrationPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const vibrationSearchData = reactive({ taskNo: "" })

const vibrationDetailVisible = ref(false)
const vibrationCurrentReport = ref<VibrationReport | null>(null)
const vibrationActiveTab = ref("info")

const vibrationRejectDialogVisible = ref(false)
const vibrationRejectReason = ref("")
const vibrationRejectingReportId = ref<number | null>(null)

const vibrationAllReports = ref<VibrationReport[]>([])

const ensureVibrationMockData = () => {
  if (vibrationAllReports.value.length) return

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
  const devices = ["振动台-01", "振动台-02"]
  const applicants = ["张三", "李四", "王五", "赵六"]

  const mkPoints = (start: Date, count: number, baseAccel: number): VibrationPoint[] => {
    const points: VibrationPoint[] = []
    for (let i = 0; i < count; i++) {
      const t = new Date(start.getTime() + i * 60_000)
      const setFreq = 10 + ((i * 7) % 190)
      const setAccel = baseAccel
      const actualAccel = Number((setAccel + Math.sin(i / 3) * 0.25 + (i % 5) * 0.03 - 0.08).toFixed(3))
      const omega = 2 * Math.PI * Math.max(1, setFreq)
      const displacement = Number(((actualAccel / (omega * omega)) * 1000).toFixed(6))
      points.push({ time: fmt(t), setFreq, setAccel, actualAccel, displacement })
    }
    return points
  }

  const rms = (arr: number[]) => {
    const meanSquare = arr.reduce((s, v) => s + v * v, 0) / Math.max(1, arr.length)
    return Math.sqrt(meanSquare)
  }

  const list: VibrationReport[] = []
  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() - (i + 1) * 3_000_000)
    const end = new Date(start.getTime() + (50 + (i % 6) * 12) * 60_000)

    const result = i % 9 === 0 ? 2 : i % 14 === 0 ? 3 : 1
    const resultText = result === 1 ? "正常" : result === 2 ? "异常" : "疑问"

    const baseAccel = Number((2.5 + (i % 3) * 0.3).toFixed(2))
    const points = mkPoints(start, 16 + (i % 8), baseAccel)

    const maxAccel = Number(Math.max(...points.map((p) => p.actualAccel)).toFixed(3))
    const rmsAccel = Number(rms(points.map((p) => p.actualAccel)).toFixed(3))
    const maxDisp = Number(Math.max(...points.map((p) => p.displacement)).toFixed(6))

    list.push({
      id: 4000 + i,
      taskNo: `VT-${base.getFullYear()}${pad2(base.getMonth() + 1)}-${pad2(i + 1)}${pad2((i % 30) + 1)}`,
      deviceName: devices[i % devices.length],
      applicant: applicants[i % applicants.length],
      result,
      resultText,
      reviewStatus: 0,
      createdAt: fmt(new Date(start.getTime() + 6 * 60_000)),
      reportJson: {
        startTime: fmt(start),
        endTime: fmt(end),
        duration: Math.floor((end.getTime() - start.getTime()) / 1000),
        remark: i % 4 === 0 ? "扫频段出现瞬态尖峰" : "-",
        points,
        steps: [
          {
            stepNo: 1,
            freqRange: "10-80Hz",
            holdMinutes: 20,
            ok: result !== 2,
            remark: result === 2 ? "加速度超限" : "-"
          },
          { stepNo: 2, freqRange: "80-200Hz", holdMinutes: 20, ok: true, remark: "-" }
        ],
        summary: { maxAccel, rmsAccel, maxDisp }
      }
    })
  }

  vibrationAllReports.value = list
}

const getVibrationTableData = () => {
  ensureVibrationMockData()
  vibrationLoading.value = true

  const keyword = vibrationSearchData.taskNo.trim().toLowerCase()
  const filtered = vibrationAllReports.value.filter((r) => {
    if (r.reviewStatus !== 0) return false
    if (!keyword) return true
    return r.taskNo.toLowerCase().includes(keyword)
  })

  vibrationPagination.total = filtered.length
  const start = (vibrationPagination.currentPage - 1) * vibrationPagination.pageSize
  vibrationTableData.value = filtered.slice(start, start + vibrationPagination.pageSize)

  vibrationLoading.value = false
}

const handleVibrationSearch = () => {
  vibrationPagination.currentPage = 1
  getVibrationTableData()
}

const resetVibrationSearch = () => {
  vibrationSearchData.taskNo = ""
  handleVibrationSearch()
}

const handleVibrationSizeChange = (size: number) => {
  vibrationPagination.pageSize = size
  vibrationPagination.currentPage = 1
  getVibrationTableData()
}

const handleVibrationCurrentChange = (page: number) => {
  vibrationPagination.currentPage = page
  getVibrationTableData()
}

const handleVibrationDetail = (row: VibrationReport) => {
  vibrationCurrentReport.value = vibrationAllReports.value.find((r) => r.id === row.id) || null
  vibrationActiveTab.value = "info"
  vibrationDetailVisible.value = true
}

const handleVibrationApprove = async (report: VibrationReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = vibrationAllReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  vibrationDetailVisible.value = false
  getVibrationTableData()
}

const showVibrationRejectDialog = (report: VibrationReport) => {
  vibrationRejectingReportId.value = report.id
  vibrationRejectReason.value = ""
  vibrationRejectDialogVisible.value = true
}

const handleVibrationReject = () => {
  if (!vibrationRejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  const target = vibrationAllReports.value.find((r) => r.id === vibrationRejectingReportId.value)
  if (!target) return

  target.reviewStatus = 2
  target.reviewReason = vibrationRejectReason.value

  ElMessage.success("已打回")
  vibrationRejectDialogVisible.value = false
  vibrationDetailVisible.value = false
  getVibrationTableData()
}

type HthpReviewStatus = 0 | 1 | 2

interface HthpPoint {
  time: string
  setTemp: number
  actualTemp: number
  setPressure: number
  actualPressure: number
}

interface HthpStep {
  stepNo: number
  setTemp: number
  setPressure: number
  holdMinutes: number
  ok: boolean
  remark?: string
}

interface HthpReport {
  id: number
  taskNo: string
  deviceName: string
  applicant: string
  result: number
  resultText: string
  reviewStatus: HthpReviewStatus
  createdAt: string
  reportJson: {
    startTime: string
    endTime: string
    duration: number
    remark?: string
    points: HthpPoint[]
    steps: HthpStep[]
    summary: {
      maxTemp: number
      maxPressure: number
      avgTemp: number
      avgPressure: number
    }
  }
  reviewReason?: string
}

const hthpLoading = ref(false)
const hthpTableData = ref<HthpReport[]>([])
const hthpPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const hthpSearchData = reactive({ taskNo: "" })

const hthpDetailVisible = ref(false)
const hthpCurrentReport = ref<HthpReport | null>(null)
const hthpActiveTab = ref("info")

const hthpRejectDialogVisible = ref(false)
const hthpRejectReason = ref("")
const hthpRejectingReportId = ref<number | null>(null)

const hthpAllReports = ref<HthpReport[]>([])

const ensureHthpMockData = () => {
  if (hthpAllReports.value.length) return

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
  const devices = ["高温高压舱-01", "高温高压舱-02"]
  const applicants = ["张三", "李四", "王五", "赵六"]

  const mkPoints = (start: Date, count: number, setTempBase: number, setPressureBase: number): HthpPoint[] => {
    const points: HthpPoint[] = []
    for (let i = 0; i < count; i++) {
      const t = new Date(start.getTime() + i * 60_000)
      const setTemp = setTempBase + (i < Math.floor(count / 2) ? 0 : 10)
      const setPressure = setPressureBase + (i < Math.floor(count / 2) ? 0 : 0.8)
      const actualTemp = Number((setTemp + Math.sin(i / 4) * 1.4 + (i % 5) * 0.12 - 0.4).toFixed(2))
      const actualPressure = Number((setPressure + Math.cos(i / 5) * 0.06 + (i % 6) * 0.004 - 0.01).toFixed(3))
      points.push({ time: fmt(t), setTemp, actualTemp, setPressure, actualPressure })
    }
    return points
  }

  const calcAvg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length)

  const list: HthpReport[] = []
  for (let i = 0; i < 18; i++) {
    const start = new Date(base.getTime() - (i + 1) * 3_600_000)
    const end = new Date(start.getTime() + (70 + (i % 6) * 10) * 60_000)

    const result = i % 9 === 0 ? 2 : i % 15 === 0 ? 3 : 1
    const resultText = result === 1 ? "正常" : result === 2 ? "异常" : "疑问"

    const setTempBase = 120 + (i % 3) * 10
    const setPressureBase = Number((8.0 + (i % 3) * 0.5).toFixed(1))

    const points = mkPoints(start, 14 + (i % 10), setTempBase, setPressureBase)
    const temps = points.map((p) => p.actualTemp)
    const pressures = points.map((p) => p.actualPressure)

    const maxTemp = Number(Math.max(...temps).toFixed(2))
    const maxPressure = Number(Math.max(...pressures).toFixed(3))
    const avgTemp = Number(calcAvg(temps).toFixed(2))
    const avgPressure = Number(calcAvg(pressures).toFixed(3))

    list.push({
      id: 5000 + i,
      taskNo: `HTHP-${base.getFullYear()}${pad2(base.getMonth() + 1)}-${pad2(i + 1)}${pad2((i % 30) + 1)}`,
      deviceName: devices[i % devices.length],
      applicant: applicants[i % applicants.length],
      result,
      resultText,
      reviewStatus: 0,
      createdAt: fmt(new Date(start.getTime() + 7 * 60_000)),
      reportJson: {
        startTime: fmt(start),
        endTime: fmt(end),
        duration: Math.floor((end.getTime() - start.getTime()) / 1000),
        remark: i % 4 === 0 ? "升压阶段存在轻微波动" : "-",
        points,
        steps: [
          {
            stepNo: 1,
            setTemp: setTempBase,
            setPressure: setPressureBase,
            holdMinutes: 30,
            ok: result !== 2,
            remark: result === 2 ? "压力偏差超限" : "-"
          },
          {
            stepNo: 2,
            setTemp: setTempBase + 10,
            setPressure: Number((setPressureBase + 0.8).toFixed(1)),
            holdMinutes: 30,
            ok: true,
            remark: "-"
          }
        ],
        summary: { maxTemp, maxPressure, avgTemp, avgPressure }
      }
    })
  }

  hthpAllReports.value = list
}

const getHthpTableData = () => {
  ensureHthpMockData()
  hthpLoading.value = true

  const keyword = hthpSearchData.taskNo.trim().toLowerCase()
  const filtered = hthpAllReports.value.filter((r) => {
    if (r.reviewStatus !== 0) return false
    if (!keyword) return true
    return r.taskNo.toLowerCase().includes(keyword)
  })

  hthpPagination.total = filtered.length
  const start = (hthpPagination.currentPage - 1) * hthpPagination.pageSize
  hthpTableData.value = filtered.slice(start, start + hthpPagination.pageSize)

  hthpLoading.value = false
}

const handleHthpSearch = () => {
  hthpPagination.currentPage = 1
  getHthpTableData()
}

const resetHthpSearch = () => {
  hthpSearchData.taskNo = ""
  handleHthpSearch()
}

const handleHthpSizeChange = (size: number) => {
  hthpPagination.pageSize = size
  hthpPagination.currentPage = 1
  getHthpTableData()
}

const handleHthpCurrentChange = (page: number) => {
  hthpPagination.currentPage = page
  getHthpTableData()
}

const handleHthpDetail = (row: HthpReport) => {
  hthpCurrentReport.value = hthpAllReports.value.find((r) => r.id === row.id) || null
  hthpActiveTab.value = "info"
  hthpDetailVisible.value = true
}

const handleHthpApprove = async (report: HthpReport) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", { type: "success" })

  const target = hthpAllReports.value.find((r) => r.id === report.id)
  if (!target) return
  target.reviewStatus = 1

  ElMessage.success("审核通过成功")
  hthpDetailVisible.value = false
  getHthpTableData()
}

const showHthpRejectDialog = (report: HthpReport) => {
  hthpRejectingReportId.value = report.id
  hthpRejectReason.value = ""
  hthpRejectDialogVisible.value = true
}

const handleHthpReject = () => {
  if (!hthpRejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  const target = hthpAllReports.value.find((r) => r.id === hthpRejectingReportId.value)
  if (!target) return

  target.reviewStatus = 2
  target.reviewReason = hthpRejectReason.value

  ElMessage.success("已打回")
  hthpRejectDialogVisible.value = false
  hthpDetailVisible.value = false
  getHthpTableData()
}

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return "-"
  return time
}

// 格式化时长
const formatDuration = (duration?: number) => {
  if (!duration) return "-"
  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}分${secs}秒`
}

// Tab 切换处理
const handleTabClick = (tab: TabsPaneContext) => {
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })

  if (tab.props.name === "halt-hass" && haltHassReviewRef.value) {
    haltHassReviewRef.value.resetSearch()
  }
  if (tab.props.name === "water-cycle" && waterCycleReviewRef.value) {
    waterCycleReviewRef.value.resetSearch()
  }
  if (tab.props.name === "high-temp-box" && highTempBoxReviewRef.value) {
    highTempBoxReviewRef.value.resetSearch()
  }
  if (tab.props.name === "vibration-table" && vibrationReviewRef.value) {
    vibrationReviewRef.value.resetSearch()
  }
  if (tab.props.name === "high-temp-high-pressure" && hthpReviewRef.value) {
    hthpReviewRef.value.resetSearch()
  }
}

onMounted(() => {
  const { page, tab } = router.currentRoute.value.query

  if (typeof tab === "string") activeTab.value = tab

  if (tab === "halt-hass" && haltHassReviewRef.value) {
    haltHassReviewRef.value.resetSearch()
    return
  }
  if (tab === "water-cycle" && waterCycleReviewRef.value) {
    waterCycleReviewRef.value.resetSearch()
    return
  }
  if (tab === "high-temp-box" && highTempBoxReviewRef.value) {
    highTempBoxReviewRef.value.resetSearch()
    return
  }
  if (tab === "vibration-table" && vibrationReviewRef.value) {
    vibrationReviewRef.value.resetSearch()
    return
  }
  if (tab === "high-temp-high-pressure" && hthpReviewRef.value) {
    hthpReviewRef.value.resetSearch()
    return
  }

  if (typeof page === "string") {
    paginationData.currentPage = Number(page)
  }
  getTableData()
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 普通报告审核 Tab -->
        <el-tab-pane label="普通报告审核" name="normal">
          <el-card v-loading="loading" class="search-wrapper" shadow="never">
            <el-form ref="searchFormRef" :inline="true" :model="searchData">
              <el-form-item label="测试人">
                <el-input v-model="searchData.user" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="电路板序列号">
                <el-input v-model="searchData.serial" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="报告类型">
                <el-select
                  v-model="searchData.type"
                  placeholder="请选择"
                  style="width: 200px"
                  @visible-change="getTestTypeData"
                >
                  <el-option v-for="item in testTypeList" :key="item.id" :label="item.name" :value="item.number" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button :icon="Search" style="margin-right: 10px" type="primary" @click="handleSearch"
                  >查询</el-button
                >
                <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card v-loading="loading" shadow="never">
            <div class="toolbar-wrapper">
              <div />
              <div>
                <el-tooltip content="刷新当前页">
                  <el-button circle icon="RefreshRight" type="primary" @click="getTableData" />
                </el-tooltip>
              </div>
            </div>
            <div class="table-wrapper">
              <TableComponent :column-data="headers1" :tableData="TableData" stripe>
                <template #status="{ row }">
                  <el-tag v-if="row['status'] === '0'" type="warning"> 测试待审核</el-tag>
                  <el-tag v-if="row['status'] === '1'" type="danger"> 测试正常</el-tag>
                  <el-tag v-if="row['status'] === '2'" type="danger"> 测试异常</el-tag>
                </template>

                <template #link="{ row }">
                  <el-link v-for="i in row['link']" :key="i" class="el-link" type="primary" @click="handleLink(row, i)"
                    >{{ i }}
                  </el-link>
                </template>
              </TableComponent>
            </div>

            <div class="pager-wrapper">
              <el-pagination
                :currentPage="paginationData.currentPage"
                :layout="paginationData.layout"
                :page-size="paginationData.pageSize"
                :page-sizes="paginationData.pageSizes"
                :total="paginationData.total"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <!-- HALT-HASS 报告审核 Tab -->
        <el-tab-pane label="HALT-HASS 报告审核" name="halt-hass">
          <HaltHassReportReview ref="haltHassReviewRef" />
        </el-tab-pane>

        <el-tab-pane label="水循环报告审核" name="water-cycle">
          <WaterCycleReportReview ref="waterCycleReviewRef" />
        </el-tab-pane>

        <el-tab-pane label="高温箱报告审核" name="high-temp-box">
          <HighTempBoxReportReview ref="highTempBoxReviewRef" />
        </el-tab-pane>

        <el-tab-pane label="振动台报告审核" name="vibration-table">
          <VibrationTableReportReview ref="vibrationReviewRef" />
        </el-tab-pane>

        <el-tab-pane label="高温高压报告审核" name="high-temp-high-pressure">
          <HighTempHighPressureReportReview ref="hthpReviewRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 普通工艺审核对话框 -->
    <el-dialog v-model="DialogCheck" :title="'提交测试工艺审核'" style="height: 45vh; width: 40vw">
      <template #header>
        <h2>提交测试工艺审核</h2>
      </template>
      <el-form
        :inline="true"
        :model="TestCheck"
        class="demo-form-inline"
        label-position="right"
        style="position: relative"
      >
        <el-form-item label="工艺ID" style="width: 15vw">
          <el-input v-model="TestCheck.ID" disabled />
        </el-form-item>
        <el-form-item label="工艺版本" style="width: 15vw">
          <el-input v-model="TestCheck.version" disabled />
        </el-form-item>
        <el-form-item label="测试类型">
          <el-input v-model="TestCheck.type" disabled />
        </el-form-item>

        <el-button icon="Check" style="position: absolute; top: 120px; left: 41%" type="primary" @click="onSubmit"
          >确认提交
        </el-button>
      </el-form>
    </el-dialog>

    <!-- HALT-HASS 报告详情对话框 -->
    <el-dialog v-model="haltHassDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="haltHassActiveTab" v-if="haltHassCurrentReport">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ haltHassCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{
              haltHassCurrentReport.order?.orderNo || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(haltHassCurrentReport.result)">{{
                haltHassCurrentReport.resultText
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag type="warning">待审核</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="电路板组">{{
              haltHassCurrentReport.order?.boardGroup?.name || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="工艺">
              {{ haltHassCurrentReport.order?.process?.name || "-" }}
              <span v-if="haltHassCurrentReport.order?.process?.version"
                >(v{{ haltHassCurrentReport.order.process.version }})</span
              >
            </el-descriptions-item>
            <el-descriptions-item label="电路板数量">{{
              haltHassCurrentReport.order?.boardCount || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ haltHassCurrentReport.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 流程图结果 -->
        <el-tab-pane label="流程图结果" name="flowchart">
          <div v-if="haltHassCurrentReport.reportJson?.flowchartResult" class="flowchart-result">
            <el-row :gutter="20" class="summary-row">
              <el-col :span="8">
                <div class="summary-card">
                  <div class="summary-label">总节点数</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.totalNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card success">
                  <div class="summary-label">成功节点</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.successNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card danger">
                  <div class="summary-label">失败节点</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.failedNodes }}</div>
                </div>
              </el-col>
            </el-row>

            <el-table
              :data="haltHassCurrentReport.reportJson.flowchartResult.nodeResults"
              size="small"
              border
              style="margin-top: 20px"
            >
              <el-table-column prop="nodeId" label="节点ID" width="120" />
              <el-table-column prop="nodeName" label="节点名称" min-width="150" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === "success" ? "成功" : "失败" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="error" label="错误信息" min-width="200">
                <template #default="{ row }">
                  <el-text type="danger" v-if="row.error">{{ row.error }}</el-text>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="无流程图结果数据" />
        </el-tab-pane>

        <!-- 电路板信息 -->
        <el-tab-pane label="电路板信息" name="boards">
          <el-table :data="haltHassCurrentReport.reportJson?.boards || []" size="small" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="serial" label="序列号" />
            <el-table-column prop="boardModelName" label="型号">
              <template #default="{ row }">{{ row.boardModelName || "-" }}</template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="测试开始时间">{{
                formatTime(haltHassCurrentReport.reportJson?.startTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="测试结束时间">{{
                formatTime(haltHassCurrentReport.reportJson?.endTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="测试时长">{{
                formatDuration(haltHassCurrentReport.reportJson?.duration)
              }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{
                haltHassCurrentReport.reportJson?.remark || "-"
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="haltHassDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showRejectDialog(haltHassCurrentReport!)">打回</el-button>
        <el-button type="success" :icon="Check" @click="handleApprove(haltHassCurrentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <!-- 打回原因对话框 -->
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

    <el-dialog v-model="waterCycleDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="waterCycleActiveTab" v-if="waterCycleCurrentReport">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ waterCycleCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ waterCycleCurrentReport.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="设备">{{ waterCycleCurrentReport.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ waterCycleCurrentReport.applicant }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(waterCycleCurrentReport.result)">{{
                waterCycleCurrentReport.resultText
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态"><el-tag type="warning">待审核</el-tag></el-descriptions-item>
            <el-descriptions-item label="测试开始时间">{{
              formatTime(waterCycleCurrentReport.reportJson.startTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结束时间">{{
              formatTime(waterCycleCurrentReport.reportJson.endTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试时长">{{
              formatDuration(waterCycleCurrentReport.reportJson.duration)
            }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{
              waterCycleCurrentReport.reportJson.remark || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="采集数据" name="points">
          <el-table :data="waterCycleCurrentReport.reportJson.points" size="small" border>
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="temperature" label="温度(°C)" width="120" align="center" />
            <el-table-column prop="pressure" label="压力(MPa)" width="120" align="center" />
            <el-table-column prop="flow" label="流量(L/min)" width="130" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="循环阶段" name="cycles">
          <el-table :data="waterCycleCurrentReport.reportJson.cycles" size="small" border>
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
        <el-button @click="waterCycleDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showWaterCycleRejectDialog(waterCycleCurrentReport!)"
          >打回</el-button
        >
        <el-button type="success" :icon="Check" @click="handleWaterCycleApprove(waterCycleCurrentReport!)"
          >通过</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="waterCycleRejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="waterCycleRejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="waterCycleRejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleWaterCycleReject">确认打回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="highTempDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="highTempActiveTab" v-if="highTempCurrentReport">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ highTempCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ highTempCurrentReport.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="设备">{{ highTempCurrentReport.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ highTempCurrentReport.applicant }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(highTempCurrentReport.result)">{{
                highTempCurrentReport.resultText
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态"><el-tag type="warning">待审核</el-tag></el-descriptions-item>
            <el-descriptions-item label="测试开始时间">{{
              formatTime(highTempCurrentReport.reportJson.startTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结束时间">{{
              formatTime(highTempCurrentReport.reportJson.endTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试时长">{{
              formatDuration(highTempCurrentReport.reportJson.duration)
            }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{
              highTempCurrentReport.reportJson.remark || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="温湿度概览" name="summary">
          <el-row :gutter="20" class="summary-row">
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均温度(°C)</div>
                <div class="summary-value">{{ highTempCurrentReport.reportJson.summary.avgTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card success">
                <div class="summary-label">最高温度(°C)</div>
                <div class="summary-value">{{ highTempCurrentReport.reportJson.summary.maxTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card danger">
                <div class="summary-label">最低温度(°C)</div>
                <div class="summary-value">{{ highTempCurrentReport.reportJson.summary.minTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均湿度(%)</div>
                <div class="summary-value">{{ highTempCurrentReport.reportJson.summary.avgHumidity }}</div>
              </div>
            </el-col>
          </el-row>

          <el-table :data="highTempCurrentReport.reportJson.points" size="small" border style="margin-top: 10px">
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="setTemp" label="设定温度(°C)" width="130" align="center" />
            <el-table-column prop="actualTemp" label="实际温度(°C)" width="130" align="center" />
            <el-table-column prop="humidity" label="湿度(%)" width="110" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="程序步骤" name="steps">
          <el-table :data="highTempCurrentReport.reportJson.steps" size="small" border>
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
        <el-button @click="highTempDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showHighTempRejectDialog(highTempCurrentReport!)"
          >打回</el-button
        >
        <el-button type="success" :icon="Check" @click="handleHighTempApprove(highTempCurrentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="highTempRejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="highTempRejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="highTempRejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleHighTempReject">确认打回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="vibrationDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="vibrationActiveTab" v-if="vibrationCurrentReport">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ vibrationCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ vibrationCurrentReport.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="设备">{{ vibrationCurrentReport.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ vibrationCurrentReport.applicant }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(vibrationCurrentReport.result)">{{
                vibrationCurrentReport.resultText
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态"><el-tag type="warning">待审核</el-tag></el-descriptions-item>
            <el-descriptions-item label="测试开始时间">{{
              formatTime(vibrationCurrentReport.reportJson.startTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结束时间">{{
              formatTime(vibrationCurrentReport.reportJson.endTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试时长">{{
              formatDuration(vibrationCurrentReport.reportJson.duration)
            }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{
              vibrationCurrentReport.reportJson.remark || "-"
            }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="扫频概览" name="summary">
          <el-row :gutter="20" class="summary-row">
            <el-col :span="8">
              <div class="summary-card">
                <div class="summary-label">最大加速度(g)</div>
                <div class="summary-value">{{ vibrationCurrentReport.reportJson.summary.maxAccel }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-card success">
                <div class="summary-label">RMS加速度(g)</div>
                <div class="summary-value">{{ vibrationCurrentReport.reportJson.summary.rmsAccel }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-card danger">
                <div class="summary-label">最大位移(mm)</div>
                <div class="summary-value">{{ vibrationCurrentReport.reportJson.summary.maxDisp }}</div>
              </div>
            </el-col>
          </el-row>

          <el-table :data="vibrationCurrentReport.reportJson.points" size="small" border style="margin-top: 10px">
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="setFreq" label="设定频率(Hz)" width="130" align="center" />
            <el-table-column prop="setAccel" label="设定加速度(g)" width="140" align="center" />
            <el-table-column prop="actualAccel" label="实际加速度(g)" width="140" align="center" />
            <el-table-column prop="displacement" label="位移(mm)" width="120" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="测试步骤" name="steps">
          <el-table :data="vibrationCurrentReport.reportJson.steps" size="small" border>
            <el-table-column prop="stepNo" label="步骤" width="80" align="center" />
            <el-table-column prop="freqRange" label="频率范围" width="140" align="center" />
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
        <el-button @click="vibrationDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showVibrationRejectDialog(vibrationCurrentReport!)"
          >打回</el-button
        >
        <el-button type="success" :icon="Check" @click="handleVibrationApprove(vibrationCurrentReport!)"
          >通过</el-button
        >
      </template>
    </el-dialog>

    <el-dialog v-model="vibrationRejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="vibrationRejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="vibrationRejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleVibrationReject">确认打回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="hthpDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="hthpActiveTab" v-if="hthpCurrentReport">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ hthpCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ hthpCurrentReport.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="设备">{{ hthpCurrentReport.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ hthpCurrentReport.applicant }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(hthpCurrentReport.result)">{{ hthpCurrentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态"><el-tag type="warning">待审核</el-tag></el-descriptions-item>
            <el-descriptions-item label="测试开始时间">{{
              formatTime(hthpCurrentReport.reportJson.startTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试结束时间">{{
              formatTime(hthpCurrentReport.reportJson.endTime)
            }}</el-descriptions-item>
            <el-descriptions-item label="测试时长">{{
              formatDuration(hthpCurrentReport.reportJson.duration)
            }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ hthpCurrentReport.reportJson.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="温压概览" name="summary">
          <el-row :gutter="20" class="summary-row">
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均温度(°C)</div>
                <div class="summary-value">{{ hthpCurrentReport.reportJson.summary.avgTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card success">
                <div class="summary-label">最高温度(°C)</div>
                <div class="summary-value">{{ hthpCurrentReport.reportJson.summary.maxTemp }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card">
                <div class="summary-label">平均压力(MPa)</div>
                <div class="summary-value">{{ hthpCurrentReport.reportJson.summary.avgPressure }}</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-card danger">
                <div class="summary-label">最高压力(MPa)</div>
                <div class="summary-value">{{ hthpCurrentReport.reportJson.summary.maxPressure }}</div>
              </div>
            </el-col>
          </el-row>

          <el-table :data="hthpCurrentReport.reportJson.points" size="small" border style="margin-top: 10px">
            <el-table-column prop="time" label="时间" min-width="170" />
            <el-table-column prop="setTemp" label="设定温度(°C)" width="130" align="center" />
            <el-table-column prop="actualTemp" label="实际温度(°C)" width="130" align="center" />
            <el-table-column prop="setPressure" label="设定压力(MPa)" width="130" align="center" />
            <el-table-column prop="actualPressure" label="实际压力(MPa)" width="130" align="center" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="程序步骤" name="steps">
          <el-table :data="hthpCurrentReport.reportJson.steps" size="small" border>
            <el-table-column prop="stepNo" label="步骤" width="80" align="center" />
            <el-table-column prop="setTemp" label="设定温度(°C)" width="140" align="center" />
            <el-table-column prop="setPressure" label="设定压力(MPa)" width="140" align="center" />
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
        <el-button @click="hthpDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showHthpRejectDialog(hthpCurrentReport!)">打回</el-button>
        <el-button type="success" :icon="Check" @click="handleHthpApprove(hthpCurrentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="hthpRejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="hthpRejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="hthpRejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleHthpReject">确认打回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.drawer-head {
  height: 60px;
}

:deep(.el-upload-dragger) {
  padding: 5px !important;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.flex-card {
  display: flex !important;
  flex-direction: column;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
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

.el-link {
  margin-right: 8px;
}

header {
  width: 100%;
  height: 50px;
}

// 工艺步骤
.process {
  width: 100%;
  height: 300px;
  background-color: #fafafa;
  margin: 20px;
  border-radius: 20px;

  .process-left {
    width: 15%;
    height: 100%;
    background-color: azure;

    .processRight {
      width: 200px;
      height: 200px;
      border: 1px solid #ccc;
    }
  }

  .processRight {
    width: 200px;
    height: 200px;
    border: 1px solid #ccc;
  }
}

:deep(.el-button + .el-button) {
  margin: 0;
}

/* HALT-HASS 报告审核样式 */
.flowchart-result {
  padding: 10px 0;
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
