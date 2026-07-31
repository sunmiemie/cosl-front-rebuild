import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import {
  getCalibrationReportListApi,
  mapApiToReport,
  mapReviewStatusToApi,
  reviewCalibrationReportApi,
  type ApiCalibrationReport
} from "@/api/calibration-well/report"
import type { CalibrationReport, ReportFilter, ReportReviewStatus } from "../types"

export function useCalibrationReport() {
  const loading = ref(false)
  const reports = ref<CalibrationReport[]>([])
  const apiReports = ref<ApiCalibrationReport[]>([])

  const filter = reactive<ReportFilter>({
    keyword: "",
    status: ""
  })

  const filteredReports = computed(() => {
    const keyword = filter.keyword.trim().toLowerCase()
    return reports.value.filter((report) => {
      if (filter.status && report.status !== filter.status) return false
      if (!keyword) return true
      return [report.id, report.workOrderId, report.serialNumber, report.engineer]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    })
  })

  const pendingCount = computed(() => reports.value.filter((item) => item.status === "pending").length)

  const fetchReports = async () => {
    loading.value = true
    try {
      const status = mapReviewStatusToApi(filter.status)
      const response = await getCalibrationReportListApi({
        page: 1,
        pageSize: 100,
        keyword: filter.keyword.trim() || undefined,
        status: status ?? (filter.status ? undefined : 1)
      })
      if (response.code !== 0) {
        ElMessage.error(response.msg || "加载报告列表失败")
        return
      }
      apiReports.value = response.data.list
      reports.value = response.data.list.map(mapApiToReport)
    } catch {
      ElMessage.error("加载报告列表失败")
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchReports()
  })

  const resetFilter = () => {
    filter.keyword = ""
    filter.status = ""
    fetchReports()
  }

  const findApiReport = (reportId: string) => {
    const mapped = reports.value.find((item) => item.id === reportId)
    if (!mapped) return null
    const index = reports.value.indexOf(mapped)
    return apiReports.value[index] ?? null
  }

  const approveReport = async (id: string) => {
    const apiReport = findApiReport(id)
    if (!apiReport) return false

    const response = await reviewCalibrationReportApi(apiReport.id, { action: "approve" })
    if (response.code !== 0) {
      ElMessage.error(response.msg || "审核通过失败")
      return false
    }
    ElMessage.success(`报告 ${id} 已审核通过`)
    await fetchReports()
    return true
  }

  const rejectReport = async (id: string, remark?: string) => {
    const apiReport = findApiReport(id)
    if (!apiReport) return false

    const response = await reviewCalibrationReportApi(apiReport.id, {
      action: "reject",
      remark: remark || "报告内容不符合要求，请重新刻度并提交"
    })
    if (response.code !== 0) {
      ElMessage.error(response.msg || "驳回失败")
      return false
    }
    ElMessage.warning(`报告 ${id} 已驳回`)
    await fetchReports()
    return true
  }

  const getStatusLabel = (status: ReportReviewStatus) => {
    const map = {
      pending: "待审核",
      approved: "合格",
      rejected: "不合格"
    } as const
    return map[status]
  }

  const getStatusType = (status: ReportReviewStatus) => {
    const map = {
      pending: "warning",
      approved: "success",
      rejected: "danger"
    } as const
    return map[status]
  }

  return {
    loading,
    reports,
    filter,
    filteredReports,
    pendingCount,
    resetFilter,
    fetchReports,
    approveReport,
    rejectReport,
    getStatusLabel,
    getStatusType
  }
}
