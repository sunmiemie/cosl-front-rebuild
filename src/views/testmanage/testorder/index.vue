<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="生产测试工单" name="first">
          <ProdOrder ref="prodOrderComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时测试工单" name="second">
          <TempOrder ref="tempOrderComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import ProdOrder from "./components/ProdOrder.vue"
import TempOrder from "./components/TempOrder.vue"
import { ref } from "vue"
import { TabsPaneContext } from "element-plus"

const activeName = ref<any>("first")

const prodOrderComponent = ref<InstanceType<typeof ProdOrder> | null>(null)
const tempOrderComponent = ref<InstanceType<typeof TempOrder> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "first" && prodOrderComponent.value) {
    prodOrderComponent.value.resetSearch()
  } else if (tab.props.name === "second" && tempOrderComponent.value) {
    tempOrderComponent.value.resetSearch()
  }
}
</script>
