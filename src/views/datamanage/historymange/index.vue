<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="生产测试报告" name="prod">
          <ProdReport ref="prodReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时测试报告" name="temp">
          <TempReport ref="tempReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="HALT-HASS 报告" name="halt-hass">
          <HaltHassReport ref="haltHassReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="缺陷报告" name="bug">
          <BugReport ref="bugReportComponent" />
        </el-tab-pane>
        <el-tab-pane label="批次报告" name="batch">
          <BatchReport ref="batchReportComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import ProdReport from "./components/ProdReport.vue"
import TempReport from "./components/TempReport.vue"
import BugReport from "./components/BugReport.vue"
import BatchReport from "./components/BatchReport.vue"
import HaltHassReport from "./components/HaltHassReport.vue"

// 默认打开"生产测试报告"标签页
const activeName = ref<any>("prod")
const prodReportComponent = ref<InstanceType<typeof ProdReport> | null>(null)
const tempReportComponent = ref<InstanceType<typeof TempReport> | null>(null)
const bugReportComponent = ref<InstanceType<typeof BugReport> | null>(null)
const batchReportComponent = ref<InstanceType<typeof BatchReport> | null>(null)
const haltHassReportComponent = ref<InstanceType<typeof HaltHassReport> | null>(null)

const router = useRouter()

const handleTabClick = (tab: TabsPaneContext) => {
  // 记下当前选中的标签页，当点击浏览器返回按钮时，可返回到前面选中的标签页
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })

  if (tab.props.name === "prod" && prodReportComponent.value) {
    prodReportComponent.value.resetSearch()
  } else if (tab.props.name === "temp" && tempReportComponent.value) {
    tempReportComponent.value.resetSearch()
  } else if (tab.props.name === "halt-hass" && haltHassReportComponent.value) {
    haltHassReportComponent.value.resetSearch()
  } else if (tab.props.name === "bug" && bugReportComponent.value) {
    bugReportComponent.value.resetSearch()
  } else if (tab.props.name === "batch" && batchReportComponent.value) {
    batchReportComponent.value.resetSearch()
  }
}

onMounted(() => {
  // 如果路由参数中指定了标签页，则打开指定的标签页
  const { tab } = router.currentRoute.value.query
  if (tab) activeName.value = tab

  if (tab === "prod" && prodReportComponent.value) {
    prodReportComponent.value.resetSearch()
  } else if (tab === "temp" && tempReportComponent.value) {
    tempReportComponent.value.getTableData()
  } else if (tab === "halt-hass" && haltHassReportComponent.value) {
    haltHassReportComponent.value.resetSearch()
  } else if (tab === "bug" && bugReportComponent.value) {
    bugReportComponent.value.resetSearch()
  } else if (tab === "batch" && batchReportComponent.value) {
    batchReportComponent.value.resetSearch()
  }
})
</script>
