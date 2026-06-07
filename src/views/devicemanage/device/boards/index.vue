<!-- 电路板管理 -->

<template>
  <div class="app-container board-manage-page">
    <el-card class="board-manage-card" shadow="never">
      <el-tabs v-model="activeName" class="board-manage-tabs" @tab-click="handleTabClick">
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
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import ProdBoard from "./components/ProdBoard.vue"
import TempBoard from "./components/TempBoard.vue"

// 默认打开“生产电路板”标签页
const activeName = ref<any>("prod")

const prodBoardComponent = ref<InstanceType<typeof ProdBoard> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const router = useRouter()

const handleTabClick = (tab: TabsPaneContext) => {
  // 记下当前选中的标签页，当点击浏览器返回按钮时，可返回到前面选中的标签页
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })

  if (tab.props.name === "prod" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab.props.name === "temp" && tempBoardComponent.value) {
    tempBoardComponent.value.getTreeData()
  }
}

onMounted(() => {
  const { tab } = router.currentRoute.value.query
  // 如果路由参数中指定了标签页，则打开指定的标签页
  if (tab) {
    activeName.value = tab
  }
  if (tab === "prod" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab === "temp" && tempBoardComponent.value) {
    tempBoardComponent.value.getTreeData()
  }
})
</script>

<style lang="scss" scoped>
.board-manage-page {
  height: calc(100vh - var(--v3-header-height) - 40px);
  min-height: 0;
  overflow: hidden;
}

.board-manage-card {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  :deep(> .el-card__body) {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.board-manage-tabs {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;

  :deep(> .el-tabs__header) {
    order: 0;
    flex: 0 0 auto;
    margin-bottom: 12px;
  }

  :deep(> .el-tabs__content) {
    order: 1;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
    min-height: 0;
  }
}
</style>
