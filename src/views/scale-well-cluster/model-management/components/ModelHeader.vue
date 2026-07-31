<template>
  <header class="board-header">
    <div>
      <div class="board-header__eyebrow">INSTRUMENT</div>
      <h1>仪器管理</h1>
      <p class="board-header__desc">维护仪器配置：SN 与高/低刻井绑定；通信参数请在刻度井管理中配置</p>
    </div>
    <el-tag type="info" effect="plain">共 {{ totalCount }} 条</el-tag>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  totalCount: number
}>()
</script>

<style scoped lang="scss">
@import "../../data-board/styles/dashboard.scss";
@import "../styles/model-management.scss";

.board-header {
  align-items: center;
}
</style>
