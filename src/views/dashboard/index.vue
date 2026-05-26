<script lang="ts" setup>
import TaskPanel from "@/components/TaskCenter/TaskPanel.vue"
</script>

<template>
  <div class="app-container home-task-page">
    <section class="task-hero">
      <el-card shadow="never" class="task-hero__card">
        <TaskPanel :list-height="620" />
      </el-card>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-task-page {
  min-height: calc(100vh - 84px);
  padding: 24px;
}

.task-hero {
  display: flex;
  flex-direction: column;
}

.task-hero__card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  box-shadow: 0 16px 42px rgba(17, 24, 39, 0.08);

  :deep(.el-card__body) {
    padding: 28px;
  }

  :deep(.task-panel) {
    gap: 18px;
  }

  :deep(.task-panel__title) {
    font-size: 24px;
  }

  :deep(.task-panel__tabs .el-tabs__item) {
    height: 48px;
    font-weight: 700;
  }

  :deep(.task-item) {
    border-radius: 8px;
    padding: 16px 18px;
  }

  :deep(.task-item__title) {
    font-size: 16px;
  }

  :deep(.task-item__summary) {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .home-task-page {
    padding: 14px;
  }

  .task-hero__card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
