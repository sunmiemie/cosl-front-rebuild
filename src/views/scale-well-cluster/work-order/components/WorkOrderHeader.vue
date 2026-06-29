<template>
  <header class="board-header">
    <div>
      <div class="board-header__eyebrow">WORK ORDER</div>
      <h1>工单管理</h1>
      <p class="board-header__desc">创建、分配、追踪伽马刻度工单</p>
    </div>
    <el-tag type="warning" effect="plain">待处理 {{ pendingCount }} 件</el-tag>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  pendingCount: number
}>()
</script>

<style scoped lang="scss">
@import "../../data-board/styles/dashboard.scss";
@import "../styles/work-order.scss";

.board-header {
  align-items: center;
}
</style>
