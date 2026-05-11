<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from "vue"
import { Bell } from "@element-plus/icons-vue"
import TaskPanel from "@/components/TaskCenter/TaskPanel.vue"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"

const taskStore = useTaskCenterStoreHook()
const badgeValue = computed(() => taskStore.total)
const badgeMax = 99
const popoverWidth = 440

onMounted(() => {
  taskStore.startPolling()
})

onUnmounted(() => {
  taskStore.stopPolling()
})
</script>

<template>
  <div class="notify">
    <el-popover placement="bottom-end" :width="popoverWidth" trigger="click">
      <template #reference>
        <el-badge :value="badgeValue" :max="badgeMax" :hidden="badgeValue === 0">
          <el-tooltip effect="dark" content="待处理任务" placement="bottom">
            <el-icon :size="20" class="notify__icon">
              <Bell />
            </el-icon>
          </el-tooltip>
        </el-badge>
      </template>
      <template #default>
        <TaskPanel compact />
      </template>
    </el-popover>
  </div>
</template>

<style lang="scss" scoped>
.notify {
  margin-right: 8px;
}

.notify__icon {
  color: var(--el-text-color-primary);
}
</style>
