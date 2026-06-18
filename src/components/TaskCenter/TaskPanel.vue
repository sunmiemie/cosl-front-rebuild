<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { RefreshRight } from "@element-plus/icons-vue"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import TaskList from "./TaskList.vue"
import type { TaskCenterItem } from "@/api/task-center"
import { formatDateTime } from "@/utils"

const props = withDefaults(
  defineProps<{
    compact?: boolean
    listHeight?: number | string
  }>(),
  {
    compact: false,
    listHeight: undefined
  }
)

const router = useRouter()
const taskStore = useTaskCenterStoreHook()
const activeGroup = ref("all")

const groups = computed(() => taskStore.groupedTasks)
const visibleTasks = computed(() => groups.value.find((item) => item.key === activeGroup.value)?.tasks || [])
const listHeight = computed(() => props.listHeight ?? (props.compact ? 280 : 330))

const handleSelect = (task: TaskCenterItem) => {
  router.push({
    path: task.targetRoute,
    query: {
      ...task.query,
      _taskNav: String(Date.now())
    }
  })
}

const handleRefresh = () => {
  void taskStore.refresh()
}

onMounted(() => {
  taskStore.startPolling()
})

onUnmounted(() => {
  taskStore.stopPolling()
})

watch(
  groups,
  (value) => {
    if (!value.some((item) => item.key === activeGroup.value)) {
      activeGroup.value = value[0]?.key || "all"
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="task-panel" :class="{ 'task-panel--compact': props.compact }">
    <div class="task-panel__header">
      <div>
        <div class="task-panel__eyebrow">PENDING TASK CENTER</div>
        <div class="task-panel__title">待处理任务中心</div>
      </div>
      <div class="task-panel__actions">
        <el-tag effect="plain" type="warning">{{ taskStore.total }} 项</el-tag>
        <el-button link :icon="RefreshRight" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <div class="task-panel__meta" v-if="taskStore.lastUpdatedAt || taskStore.errorMessage">
      <span v-if="taskStore.lastUpdatedAt">最近同步：{{ formatDateTime(taskStore.lastUpdatedAt) }}</span>
      <span v-if="taskStore.errorMessage" class="task-panel__error">{{ taskStore.errorMessage }}</span>
    </div>

    <el-tabs v-model="activeGroup" class="task-panel__tabs" stretch>
      <el-tab-pane v-for="group in groups" :key="group.key" :name="group.key">
        <template #label>
          <span class="task-panel__tab-label">
            <span>{{ group.label }}</span>
            <el-badge :value="group.tasks.length" :max="99" />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <el-scrollbar :height="listHeight">
      <TaskList :tasks="visibleTasks" :loading="taskStore.loading" :compact="props.compact" @select="handleSelect" />
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.task-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.task-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.task-panel__eyebrow {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}

.task-panel__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.task-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.task-panel__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.task-panel__error {
  color: var(--el-color-danger);
}

.task-panel__tabs {
  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
}

.task-panel__tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.task-panel--compact {
  gap: 10px;

  .task-panel__title {
    font-size: 15px;
  }

  .task-panel__meta {
    display: block;
  }
}
</style>
