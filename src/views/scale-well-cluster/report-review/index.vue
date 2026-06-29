<script setup lang="ts">
import { ref } from "vue"
import { ElMessageBox } from "element-plus"
import ReportHeader from "./components/ReportHeader.vue"
import ReportToolbar from "./components/ReportToolbar.vue"
import ReportCardList from "./components/ReportCardList.vue"
import ReportDetailDrawer from "./components/ReportDetailDrawer.vue"
import { useCalibrationReport } from "./composables/use-calibration-report"
import type { CalibrationReport } from "./types"

const {
  loading,
  filter,
  filteredReports,
  pendingCount,
  resetFilter,
  approveReport,
  rejectReport,
  getStatusLabel,
  getStatusType
} = useCalibrationReport()

const drawerVisible = ref(false)
const currentReport = ref<CalibrationReport | null>(null)

const handleSearch = () => {
  loading.value = true
  window.setTimeout(() => {
    loading.value = false
  }, 200)
}

const openReport = (report: CalibrationReport) => {
  currentReport.value = report
  drawerVisible.value = true
}

const handleApprove = async (report: CalibrationReport) => {
  try {
    await ElMessageBox.confirm(`确认通过报告 ${report.id} 吗？`, "审核确认", {
      type: "success",
      confirmButtonText: "通过",
      cancelButtonText: "取消"
    })
    approveReport(report.id)
    drawerVisible.value = false
  } catch {
    // 用户取消
  }
}

const handleReject = async (report: CalibrationReport) => {
  try {
    await ElMessageBox.confirm(`确认驳回报告 ${report.id} 吗？`, "驳回确认", {
      type: "warning",
      confirmButtonText: "驳回",
      cancelButtonText: "取消"
    })
    rejectReport(report.id)
    drawerVisible.value = false
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="app-container report-page">
    <ReportHeader :pending-count="pendingCount" />

    <el-card shadow="never" class="report-panel">
      <ReportToolbar
        v-model:filter="filter"
        :loading="loading"
        @search="handleSearch"
        @reset="resetFilter"
      />

      <ReportCardList
        :reports="filteredReports"
        :get-status-label="getStatusLabel"
        :get-status-type="getStatusType"
        @open="openReport"
        @approve="handleApprove"
        @reject="handleReject"
      />
    </el-card>

    <ReportDetailDrawer
      v-model:visible="drawerVisible"
      :report="currentReport"
      :status-label="currentReport ? getStatusLabel(currentReport.status) : ''"
      :status-type="currentReport ? getStatusType(currentReport.status) : 'warning'"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/report.scss";
</style>
