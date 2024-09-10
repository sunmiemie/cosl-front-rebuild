<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="生产电路板" name="first">
          <ProdBoard ref="prodBoardComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时电路板" name="second">
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

const activeName = ref<any>("first")
const prodBoardComponent = ref<InstanceType<typeof ProdBoard> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "first" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab.props.name === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.getTreeData()
  }
}
</script>
