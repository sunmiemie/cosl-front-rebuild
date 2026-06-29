<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import WorkOrderCard from "./WorkOrderCard.vue"

defineProps<{
  orders: CalibrationWorkOrder[]
}>()

const emit = defineEmits<{
  select: [order: CalibrationWorkOrder]
}>()
</script>

<template>
  <div v-if="orders.length" class="work-order-card-grid">
    <WorkOrderCard v-for="order in orders" :key="order.id" :order="order" @click="emit('select', order)" />
  </div>
  <el-empty v-else description="暂无工单数据" />
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";
</style>
