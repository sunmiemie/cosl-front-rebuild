<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="&#x751F;&#x4EA7;&#x6D4B;&#x8BD5;&#x62A5;&#x544A;" name="prod">
          <ProdReport ref="prodReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="&#x4E34;&#x65F6;&#x6D4B;&#x8BD5;&#x62A5;&#x544A;" name="temp">
          <TempReport ref="tempReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="&#x7F3A;&#x9677;&#x62A5;&#x544A;" name="bug">
          <BugReport ref="bugReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="&#x6279;&#x6B21;&#x62A5;&#x544A;" name="batch">
          <BatchReport ref="batchReportComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUseTab('halt-hass')" label="HALT-HASS &#x62A5;&#x544A;" name="halt-hass">
          <HaltHassReport ref="haltHassReportComponent" />
        </el-tab-pane>
        <el-tab-pane
          v-if="canUseTab('water-cycle')"
          label="&#x6C34;&#x5FAA;&#x73AF;&#x62A5;&#x544A;"
          name="water-cycle"
        >
          <WaterCycleReport ref="waterCycleReportComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUseTab('high-temp')" label="&#x9AD8;&#x6E29;&#x7BB1;&#x62A5;&#x544A;" name="high-temp">
          <HighTemperatureReport ref="highTempReportComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUseTab('vibration')" label="&#x632F;&#x52A8;&#x53F0;&#x62A5;&#x544A;" name="vibration">
          <VibrationReport ref="vibrationReportComponent" />
        </el-tab-pane>
        <el-tab-pane
          v-if="canUseTab('high-pressure')"
          label="&#x9AD8;&#x6E29;&#x9AD8;&#x538B;&#x62A5;&#x544A;"
          name="high-pressure"
        >
          <HighTemperaturePressureReport ref="highTemperaturePressureReportComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUseTab('simulation')" label="&#x6A21;&#x62DF;&#x4E95;&#x62A5;&#x544A;" name="simulation">
          <SimulationWellReport ref="simulationWellReportComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import { PermissionCode } from "@/constants/permission"
import { checkPermission } from "@/utils/permission"
import ProdReport from "./components/ProdReport.vue"
import TempReport from "./components/TempReport.vue"
import BugReport from "./components/BugReport.vue"
import BatchReport from "./components/BatchReport.vue"
import HaltHassReport from "./components/HaltHassReport.vue"
import WaterCycleReport from "./components/WaterCycleReport.vue"
import HighTemperatureReport from "./components/HighTemperatureReport.vue"
import VibrationReport from "./components/VibrationReport.vue"
import HighTemperaturePressureReport from "./components/HighTemperaturePressureReport.vue"
import SimulationWellReport from "./components/SimulationWellReport.vue"

const activeName = ref<any>("prod")
const prodReportComponent = ref<InstanceType<typeof ProdReport> | null>(null)
const tempReportComponent = ref<InstanceType<typeof TempReport> | null>(null)
const bugReportComponent = ref<InstanceType<typeof BugReport> | null>(null)
const batchReportComponent = ref<InstanceType<typeof BatchReport> | null>(null)
const haltHassReportComponent = ref<InstanceType<typeof HaltHassReport> | null>(null)
const waterCycleReportComponent = ref<InstanceType<typeof WaterCycleReport> | null>(null)
const highTempReportComponent = ref<InstanceType<typeof HighTemperatureReport> | null>(null)
const vibrationReportComponent = ref<InstanceType<typeof VibrationReport> | null>(null)
const highTemperaturePressureReportComponent = ref<InstanceType<typeof HighTemperaturePressureReport> | null>(null)
const simulationWellReportComponent = ref<InstanceType<typeof SimulationWellReport> | null>(null)

const router = useRouter()
const visibleTabs = computed(() =>
  [
    { name: "prod" },
    { name: "temp" },
    { name: "bug" },
    { name: "batch" },
    { name: "halt-hass", permission: PermissionCode.ReportReviewHaltHass },
    { name: "water-cycle", permission: PermissionCode.ReportReviewWaterCycle },
    { name: "high-temp", permission: PermissionCode.ReportReviewHighTempBox },
    { name: "vibration", permission: PermissionCode.ReportReviewVibrationTable },
    { name: "high-pressure", permission: PermissionCode.ReportReviewHighTempPressure },
    { name: "simulation", permission: PermissionCode.ReportReviewSimulatedWell }
  ].filter((item) => !item.permission || checkPermission([item.permission]))
)

const canUseTab = (tabName: string) => visibleTabs.value.some((item) => item.name === tabName)

function normalizeActiveTab(requestedTab: unknown) {
  const tabName = typeof requestedTab === "string" ? requestedTab : "prod"
  activeName.value = canUseTab(tabName) ? tabName : visibleTabs.value[0]?.name || ""
}

function resetTab(tabName: unknown) {
  switch (tabName) {
    case "prod":
      prodReportComponent.value?.resetSearch()
      break
    case "temp":
      tempReportComponent.value?.getTableData()
      break
    case "halt-hass":
      haltHassReportComponent.value?.resetSearch()
      break
    case "bug":
      bugReportComponent.value?.resetSearch()
      break
    case "batch":
      batchReportComponent.value?.resetSearch()
      break
    case "water-cycle":
      waterCycleReportComponent.value?.resetSearch()
      break
    case "high-temp":
      highTempReportComponent.value?.resetSearch()
      break
    case "vibration":
      vibrationReportComponent.value?.resetSearch()
      break
    case "high-pressure":
      highTemperaturePressureReportComponent.value?.resetSearch()
      break
    case "simulation":
      simulationWellReportComponent.value?.resetSearch()
      break
  }
}

const handleTabClick = (tab: TabsPaneContext) => {
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })
  resetTab(tab.props.name)
}

onMounted(() => {
  const { tab } = router.currentRoute.value.query
  normalizeActiveTab(tab)
  resetTab(activeName.value)
})
</script>
