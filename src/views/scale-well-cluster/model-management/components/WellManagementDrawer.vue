<script setup lang="ts">
import WellManagementPanel from "../../well-management/components/WellManagementPanel.vue"

const visible = defineModel<boolean>("visible", { default: false })

const emit = defineEmits<{
  updated: []
}>()

const handleUpdated = () => {
  emit("updated")
}
</script>

<template>
  <el-drawer
    v-model="visible"
    title="刻度井管理"
    direction="rtl"
    size="72%"
    class="well-management-drawer"
    destroy-on-close
  >
    <WellManagementPanel :active="visible" @updated="handleUpdated" />
  </el-drawer>
</template>

<style scoped lang="scss">
.well-management-drawer {
  :deep(.el-drawer__body) {
    padding: 0 20px 20px;
  }
}
</style>
