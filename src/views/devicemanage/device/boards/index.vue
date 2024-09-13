<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="生产电路板" name="prod">
          <ProdBoard ref="prodBoardComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时电路板" name="temp">
          <TempBoard ref="tempBoardComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { TabsPaneContext } from "element-plus"
import ProdBoard from "./components/ProdBoard.vue"
import TempBoard from "./components/TempBoard.vue"

// 默认打开“生产电路板”标签页
const activeName = ref<any>("prod")

const prodBoardComponent = ref<InstanceType<typeof ProdBoard> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "prod" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab.props.name === "temp" && tempBoardComponent.value) {
    tempBoardComponent.value.getTreeData()
  }
}
</script>
