<template>
  <div class="app-container">
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="生产测试工单" name="prod">
          <ProdOrder ref="prodOrderComponent" />
        </el-tab-pane>
        <el-tab-pane label="临时测试工单" name="temp">
          <TempOrder ref="tempOrderComponent" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import ProdOrder from "./components/ProdOrder.vue"
import TempOrder from "./components/TempOrder.vue"

const activeName = ref<any>("prod")
const prodOrderComponent = ref<InstanceType<typeof ProdOrder> | null>(null)
const tempOrderComponent = ref<InstanceType<typeof TempOrder> | null>(null)

const router = useRouter()

const handleTabClick = (tab: TabsPaneContext) => {
  // 记下当前选中的标签页，当点击浏览器返回按钮时，可返回到前面选中的标签页
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })

  if (tab.props.name === "prod" && prodOrderComponent.value) {
    prodOrderComponent.value.getTestunits()
  } else if (tab.props.name === "temp" && tempOrderComponent.value) {
    tempOrderComponent.value.resetSearch()
  }
}

onMounted(() => {
  // 如果路由参数中指定了标签页，则打开指定的标签页
  const { tab } = router.currentRoute.value.query
  if (tab) activeName.value = tab
})
</script>
