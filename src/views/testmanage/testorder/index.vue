<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateBasic)" label="生产测试工单" name="prod">
          <ProdOrder ref="prodOrderComponent" />
        </el-tab-pane>
        <el-tab-pane v-if="canUse(PermissionCode.TestOrderCreateBasic)" label="临时测试工单" name="temp">
          <TempOrder ref="tempOrderComponent" />
        </el-tab-pane>
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
      </el-tabs>
      <el-empty v-if="availableTabs.length === 0" description="当前角色没有添加测试工单权限" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import { PermissionCode } from "@/constants/permission"
import { checkPermission } from "@/utils/permission"
import ProdOrder from "./components/ProdOrder.vue"
import TempOrder from "./components/TempOrder.vue"
import HaltHassOrder from "./components/HaltHassOrder.vue"
import WaterCycleOrder from "./components/WaterCycleOrder.vue"
import HighTemperatureOrder from "./components/HighTemperatureOrder.vue"
import VibrationOrder from "./components/VibrationOrder.vue"
import HighTemperaturePressureOrder from "./components/HighTemperaturePressureOrder.vue"
import SimulationOrder from "./components/SimulationOrder.vue"

const availableTabs = computed(() =>
  [
    { name: "prod", permission: PermissionCode.TestOrderCreateBasic },
    { name: "temp", permission: PermissionCode.TestOrderCreateBasic },
    { name: "halt-hass", permission: PermissionCode.TestOrderCreateHaltHass },
    { name: "water-cycle", permission: PermissionCode.TestOrderCreateWaterCycle },
    { name: "high-temp", permission: PermissionCode.TestOrderCreateHighTempBox },
    { name: "vibration", permission: PermissionCode.TestOrderCreateVibrationTable },
    { name: "high-temp-pressure", permission: PermissionCode.TestOrderCreateHighTempPressure },
    { name: "simulation", permission: PermissionCode.TestOrderCreateSimulatedWell }
  ].filter((item) => checkPermission([item.permission]))
)

const canUse = (permission: string) => checkPermission([permission])

const activeName = ref<any>(availableTabs.value[0]?.name || "")
const prodOrderComponent = ref<InstanceType<typeof ProdOrder> | null>(null)
const tempOrderComponent = ref<InstanceType<typeof TempOrder> | null>(null)
const haltHassOrderComponent = ref<InstanceType<typeof HaltHassOrder> | null>(null)
const waterCycleOrderComponent = ref<InstanceType<typeof WaterCycleOrder> | null>(null)
const highTempOrderComponent = ref<InstanceType<typeof HighTemperatureOrder> | null>(null)
const vibrationOrderComponent = ref<InstanceType<typeof VibrationOrder> | null>(null)
const highTempPressureOrderComponent = ref<InstanceType<typeof HighTemperaturePressureOrder> | null>(null)
const simulationOrderComponent = ref<InstanceType<typeof SimulationOrder> | null>(null)

const router = useRouter()

const handleTabClick = (tab: TabsPaneContext) => {
  // 记下当前选中的标签页，当点击浏览器返回按钮时，可返回到前面选中的标签页
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })

  if (tab.props.name === "prod" && prodOrderComponent.value) {
    prodOrderComponent.value.getTestunits()
  } else if (tab.props.name === "temp" && tempOrderComponent.value) {
    tempOrderComponent.value.resetSearch()
  } else if (tab.props.name === "halt-hass" && haltHassOrderComponent.value) {
    haltHassOrderComponent.value.refresh()
  } else if (tab.props.name === "water-cycle" && waterCycleOrderComponent.value) {
    waterCycleOrderComponent.value.refresh?.()
  } else if (tab.props.name === "high-temp" && highTempOrderComponent.value) {
    highTempOrderComponent.value.refresh?.()
  } else if (tab.props.name === "vibration" && vibrationOrderComponent.value) {
    vibrationOrderComponent.value.refresh?.()
  } else if (tab.props.name === "high-temp-pressure" && highTempPressureOrderComponent.value) {
    highTempPressureOrderComponent.value.refresh?.()
  } else if (tab.props.name === "simulation" && simulationOrderComponent.value) {
    simulationOrderComponent.value.refresh?.()
  }
}

onMounted(() => {
  // 如果路由参数中指定了标签页，则打开指定的标签页
  const { tab } = router.currentRoute.value.query
  if (typeof tab === "string" && availableTabs.value.some((item) => item.name === tab)) {
    activeName.value = tab
  } else if (!availableTabs.value.some((item) => item.name === activeName.value)) {
    activeName.value = availableTabs.value[0]?.name || ""
  }
})
</script>
