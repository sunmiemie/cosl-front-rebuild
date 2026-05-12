<script lang="ts" setup>
import type { TaskCenterItem } from "@/api/task-center"
import TaskList from "@/components/TaskCenter/TaskList.vue"

defineProps<{
  list: TaskCenterItem[]
}>()

const emit = defineEmits<{
  (event: "select", task: TaskCenterItem): void
}>()
</script>

<template>
  <TaskList :tasks="list" @select="(task) => emit('select', task)" />
</template>
