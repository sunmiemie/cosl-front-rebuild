<script lang="ts" setup>
import TaskPanel from "@/components/TaskCenter/TaskPanel.vue"
</script>

<template>
  <div class="app-container home-task-page">
    <section class="task-hero">
      <div class="task-hero__header">
        <div>
          <div class="task-hero__eyebrow">WORKFLOW CENTER</div>
          <h1>待处理任务中心</h1>
          <p>集中查看待审核、待处理、待推进事项，进入任务后可直接跳转到对应业务页面。</p>
        </div>
      </div>

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
  gap: 18px;
}

.task-hero__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 4px 4px;

  h1 {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 30px;
    font-weight: 800;
    line-height: 1.2;
  }

  p {
    max-width: 620px;
    margin: 10px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    line-height: 1.7;
  }
}

.task-hero__eyebrow {
  margin-bottom: 8px;
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
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

  .task-hero__header {
    padding-top: 8px;

    h1 {
      font-size: 24px;
    }
  }

  .task-hero__card :deep(.el-card__body) {
    padding: 16px;
  }
}
</style>
