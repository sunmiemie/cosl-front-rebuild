<template>
  <div class="app-container usage-maintenance-redirect">
    <el-result
      icon="info"
      title="使用与维保已整合到仪器详情"
      sub-title="使用记录、维保记录、维保周期配置和维保提醒记录现在统一在单个仪器的详情页面中集中展示与管理。维保提醒仅作为记录展示，不再强制提醒或阻断操作。"
    >
      <template #extra>
        <el-button type="primary" @click="goInstrumentList">前往仪器管理</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()

const goInstrumentList = () => {
  router.push({ name: "SimulatedWellInstrumentList" })
}
</script>

<style lang="scss" scoped>
.usage-maintenance-redirect {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
