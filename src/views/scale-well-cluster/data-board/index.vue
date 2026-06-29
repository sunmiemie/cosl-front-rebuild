<script setup lang="ts">
import DashboardHeader from "./components/DashboardHeader.vue"
import StatSummaryGrid from "./components/StatSummaryGrid.vue"
import DailyCalibrationChart from "./components/DailyCalibrationChart.vue"
import RecentWorkOrderTable from "./components/RecentWorkOrderTable.vue"
import InstrumentKcChartRow from "./components/InstrumentKcChartRow.vue"
import {
  CALIBRATION_WORK_ORDERS,
  DAILY_CALIBRATION_COUNTS,
  INSTRUMENT_KC_CONFIGS,
  STAT_SUMMARY
} from "./constants/mock-data"
</script>

<template>
  <div class="app-container data-board-page">
    <DashboardHeader />

    <StatSummaryGrid :items="STAT_SUMMARY" />

    <section class="chart-grid">
      <DailyCalibrationChart :counts="DAILY_CALIBRATION_COUNTS" />
      <RecentWorkOrderTable :orders="CALIBRATION_WORK_ORDERS" />
    </section>

    <InstrumentKcChartRow :configs="INSTRUMENT_KC_CONFIGS" />
  </div>
</template>

<style scoped lang="scss">
@import "./styles/dashboard.scss";

.data-board-page {
  min-height: calc(100vh - var(--v3-header-height));
}
</style>
