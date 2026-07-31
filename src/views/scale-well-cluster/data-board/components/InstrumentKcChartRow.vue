<script setup lang="ts">
import type { InstrumentKcConfig } from "../types"
import InstrumentKcChart from "./InstrumentKcChart.vue"

defineProps<{
  configs: InstrumentKcConfig[]
  demoHint?: boolean
}>()
</script>

<template>
  <section>
    <div class="section-heading-row">
      <h3 class="section-heading">仪器 Kc 趋势</h3>
      <span v-if="demoHint" class="section-heading__hint">演示数据（待仪器数据接入）</span>
    </div>
    <div class="kc-grid">
      <InstrumentKcChart v-for="config in configs" :key="config.model" :config="config" />
    </div>
  </section>
</template>

<style scoped lang="scss">
@import "../styles/dashboard.scss";

.section-heading-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.section-heading__hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
