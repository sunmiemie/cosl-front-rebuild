<script lang="ts" setup>
import { computed } from "vue"
import { formatDateTime } from "@/utils"
import type { TaskCenterItem } from "@/api/task-center"

defineOptions({ name: "TaskList" })

const props = defineProps<{
  tasks: TaskCenterItem[]
  loading?: boolean
  emptyText?: string
  compact?: boolean
}>()

const emit = defineEmits<{
  (event: "select", task: TaskCenterItem): void
}>()

const emptyText = computed(() => props.emptyText || "暂无待处理任务")

const formatTime = (value?: string) => {
  if (!value) return "-"
  return formatDateTime(value)
}
</script>

<template>
  <div class="task-list" :class="{ 'task-list--compact': props.compact }">
    <el-skeleton v-if="props.loading" :rows="4" animated />
    <el-empty v-else-if="props.tasks.length === 0" :description="emptyText" />
    <div v-else class="task-list__body">
      <button v-for="task in props.tasks" :key="task.id" class="task-item" type="button" @click="emit('select', task)">
        <div class="task-item__header">
          <div class="task-item__title">{{ task.title }}</div>
          <el-tag size="small" effect="plain">{{ task.statusText }}</el-tag>
        </div>
        <div class="task-item__summary">
          {{ task.summary }}
        </div>
        <div class="task-item__footer">
          <el-tag size="small" effect="plain" type="info">{{ task.group }}</el-tag>
          <span>{{ formatTime(task.createdAt) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task-list {
  width: 100%;
}

.task-list__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-item {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92)), var(--el-bg-color);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  text-align: left;
  appearance: none;
  font: inherit;
  color: inherit;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
  }
}

.task-item__header,
.task-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.task-item__summary {
  margin: 10px 0 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}

.task-item__footer {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.task-list--compact {
  .task-item {
    padding: 10px 12px;
  }

  .task-item__summary {
    margin: 8px 0 10px;
  }
}
</style>
