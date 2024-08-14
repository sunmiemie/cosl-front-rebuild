<template>
  <div class="app-container">
    <el-card style="height: 81vh">
      <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="生产电路板" name="first">
          <Board ref="boardComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时电路板" name="second">
          <TempBoard ref="tempBoardComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import Board from "./Board.vue"
import TempBoard from "./TempBoard.vue"
import { ref } from "vue"
import { TabsPaneContext } from "element-plus"

const activeName = ref<any>("first")

const boardComponent = ref<InstanceType<typeof Board> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "first" && boardComponent.value) {
    boardComponent.value.getTreeData()
  } else if (tab.props.name === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.getTableData()
  }
}
</script>
