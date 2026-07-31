<script setup lang="ts">
import { onMounted } from "vue"
import DashboardHeader from "./components/DashboardHeader.vue"
import StatSummaryGrid from "./components/StatSummaryGrid.vue"
import DailyCalibrationChart from "./components/DailyCalibrationChart.vue"
import RecentWorkOrderTable from "./components/RecentWorkOrderTable.vue"
import InstrumentKcChartRow from "./components/InstrumentKcChartRow.vue"
import { useDataBoard } from "./composables/use-data-board"

const {
  loading,
  statSummary,
  dailyCalibrationCounts,
  recentOrders,
  instrumentKcConfigs,
  fetchDashboard
} = useDataBoard()

onMounted(() => {
  void fetchDashboard()
})
</script>

<template>
  <div v-loading="loading" class="app-container data-board-page">
    <DashboardHeader />

    <StatSummaryGrid :items="statSummary" />

    <section class="chart-grid">
      <DailyCalibrationChart :counts="dailyCalibrationCounts" />
      <RecentWorkOrderTable :orders="recentOrders" />
    </section>

    <InstrumentKcChartRow :configs="instrumentKcConfigs" demo-hint />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/dashboard.scss";

.data-board-page {
  min-height: calc(100vh - var(--v3-header-height));
}
</style>
