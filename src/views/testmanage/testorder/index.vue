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
      </el-tabs>
      <el-empty v-if="availableTabs.length === 0" description="当前角色没有添加生产或临时测试工单权限" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { TabsPaneContext } from "element-plus"
import { PermissionCode } from "@/constants/permission"
import { checkPermission } from "@/utils/permission"
import ProdOrder from "./components/ProdOrder.vue"
import TempOrder from "./components/TempOrder.vue"

const availableTabs = computed(() =>
  [
    { name: "prod", permission: PermissionCode.TestOrderCreateBasic },
    { name: "temp", permission: PermissionCode.TestOrderCreateBasic }
  ].filter((item) => checkPermission([item.permission]))
)

const canUse = (permission: string) => checkPermission([permission])

const activeName = ref<any>(availableTabs.value[0]?.name || "")
const prodOrderComponent = ref<InstanceType<typeof ProdOrder> | null>(null)
const tempOrderComponent = ref<InstanceType<typeof TempOrder> | null>(null)

const router = useRouter()

const handleTabClick = (tab: TabsPaneContext) => {
  // 记下当前选中的标签页，当点击浏览器返回按钮时，可返回到前面选中的标签页
  router.replace({ query: { tab: String(tab.props.name || "") } })

  if (tab.props.name === "prod" && prodOrderComponent.value) {
    prodOrderComponent.value.getTestunits()
  } else if (tab.props.name === "temp" && tempOrderComponent.value) {
    tempOrderComponent.value.resetSearch()
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

watch(
  () => router.currentRoute.value.query.tab,
  (tab) => {
    if (typeof tab === "string" && availableTabs.value.some((item) => item.name === tab)) {
      activeName.value = tab
    }
  }
)
</script>
