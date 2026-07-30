<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateHaltHass)" label="HALT-HASS 工单" name="halt-hass">
          <HaltHassOrder ref="haltHassOrderComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateWaterCycle)" label="水循环工单" name="water-cycle">
          <WaterCycleOrder ref="waterCycleOrderComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateHighTempBox)" label="高温箱工单" name="high-temp">
          <HighTemperatureOrder ref="highTempOrderComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateVibrationTable)" label="振动台工单" name="vibration">
          <VibrationOrder ref="vibrationOrderComponent" />
        </el-tab-pane>
        <el-tab-pane
          v-if="canUse(PermissionCode.TestOrderCreateHighTempPressure)"
          label="高温高压井工单"
          name="high-temp-pressure"
        >
          <HighTemperaturePressureOrder ref="highTempPressureOrderComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateSimulatedWell)" label="模拟井工单" name="simulation">
          <SimulationOrder ref="simulationOrderComponent" />
        </el-tab-pane>
        <el-tab-pane label="电路板模块" name="circuit-board-module">
          <CircuitBoardModule ref="circuitBoardModuleComponent" />
        </el-tab-pane>
      </el-tabs>
      <el-empty v-if="availableTabs.length === 0" description="当前角色没有申请单管理权限" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, TabsPaneContext } from "element-plus"
import { syncEngineerAssistantApplicationFormsApi } from "@/api/engineer-assistant"
import { PermissionCode } from "@/constants/permission"
import { checkPermission } from "@/utils/permission"
import HaltHassOrder from "../testorder/components/HaltHassOrder.vue"
import WaterCycleOrder from "../testorder/components/WaterCycleOrder.vue"
import HighTemperatureOrder from "../testorder/components/HighTemperatureOrder.vue"
import VibrationOrder from "../testorder/components/VibrationOrder.vue"
import HighTemperaturePressureOrder from "../testorder/components/HighTemperaturePressureOrder.vue"
import SimulationOrder from "../testorder/components/SimulationOrder.vue"
import CircuitBoardModule from "./components/CircuitBoardModule.vue"

const availableTabs = computed(() =>
  [
    { name: "halt-hass", permission: PermissionCode.TestOrderCreateHaltHass },
    { name: "water-cycle", permission: PermissionCode.TestOrderCreateWaterCycle },
    { name: "high-temp", permission: PermissionCode.TestOrderCreateHighTempBox },
    { name: "vibration", permission: PermissionCode.TestOrderCreateVibrationTable },
    { name: "high-temp-pressure", permission: PermissionCode.TestOrderCreateHighTempPressure },
    { name: "simulation", permission: PermissionCode.TestOrderCreateSimulatedWell },
    { name: "circuit-board-module", permission: undefined }
  ].filter((item) => !item.permission || checkPermission([item.permission]))
)

const canUse = (permission: string) => checkPermission([permission])
const activeName = ref<any>(availableTabs.value[0]?.name || "")
const router = useRouter()

const haltHassOrderComponent = ref<InstanceType<typeof HaltHassOrder> | null>(null)
const waterCycleOrderComponent = ref<InstanceType<typeof WaterCycleOrder> | null>(null)
const highTempOrderComponent = ref<InstanceType<typeof HighTemperatureOrder> | null>(null)
const vibrationOrderComponent = ref<InstanceType<typeof VibrationOrder> | null>(null)
const highTempPressureOrderComponent = ref<InstanceType<typeof HighTemperaturePressureOrder> | null>(null)
const simulationOrderComponent = ref<InstanceType<typeof SimulationOrder> | null>(null)
const circuitBoardModuleComponent = ref<InstanceType<typeof CircuitBoardModule> | null>(null)

const refreshActiveTab = (name: string) => {
  if (name === "halt-hass") {
    haltHassOrderComponent.value?.refresh()
  } else if (name === "water-cycle") {
    waterCycleOrderComponent.value?.refresh?.()
  } else if (name === "high-temp") {
    highTempOrderComponent.value?.refresh?.()
  } else if (name === "vibration") {
    vibrationOrderComponent.value?.refresh?.()
  } else if (name === "high-temp-pressure") {
    highTempPressureOrderComponent.value?.refresh?.()
  } else if (name === "simulation") {
    simulationOrderComponent.value?.refresh?.()
  } else if (name === "circuit-board-module") {
    circuitBoardModuleComponent.value?.refresh?.()
  }
}

const syncApplicationFormsOnRefresh = async () => {
  try {
    const res = await syncEngineerAssistantApplicationFormsApi({
      dryRun: false,
      pushStatus: true
    })
    if (res.data.summary.failed > 0) {
      ElMessage.warning(`有 ${res.data.summary.failed} 条小助手申请单同步失败，当前显示已成功同步及本地数据`)
    }
  } catch (error) {
    console.warn("小助手申请单同步失败，继续显示本地工单数据", error)
    ElMessage.warning("小助手申请单同步失败，当前显示本地工单数据")
  } finally {
    refreshActiveTab(String(activeName.value || ""))
  }
}

const handleTabClick = (tab: TabsPaneContext) => {
  const name = String(tab.props.name || "")
  router.replace({ query: { tab: name } })
  refreshActiveTab(name)
}

onMounted(() => {
  const { tab } = router.currentRoute.value.query
  if (typeof tab === "string" && availableTabs.value.some((item) => item.name === tab)) {
    activeName.value = tab
  } else if (!availableTabs.value.some((item) => item.name === activeName.value)) {
    activeName.value = availableTabs.value[0]?.name || ""
  }
  void syncApplicationFormsOnRefresh()
})

watch(
  () => router.currentRoute.value.query.tab,
  (tab) => {
    if (typeof tab === "string" && availableTabs.value.some((item) => item.name === tab)) {
      activeName.value = tab
    }
  }
)
</script>

<style lang="scss" scoped></style>
