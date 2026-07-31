<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import { getStatusLabel, getStatusTagType } from "../constants/options"

defineProps<{
  order: CalibrationWorkOrder
}>()

const emit = defineEmits<{
  click: [order: CalibrationWorkOrder]
}>()
</script>

<template>
  <article class="work-order-card" @click="emit('click', order)">
    <div class="work-order-card__id">{{ order.taskNumber }}</div>
    <div class="work-order-card__title">{{ order.modelName }} 伽马刻度</div>

    <div class="work-order-card__meta">
      <div class="work-order-card__meta-item">
        <span>仪器 SN</span>
        <b>{{ order.serialNumber }}</b>
      </div>
      <div class="work-order-card__meta-item">
        <span>测试人员</span>
        <b>{{ order.engineer }}</b>
      </div>
      <div class="work-order-card__meta-item">
        <span>地点</span>
        <b>{{ order.location }}</b>
      </div>
      <div class="work-order-card__meta-item">
        <span>刻度设备</span>
        <b>{{ order.calibrationDevice }}</b>
      </div>
      <div class="work-order-card__meta-item">
        <span>高/低刻井</span>
        <b>{{ order.hiWell }} / {{ order.loWell }}</b>
      </div>
      <div class="work-order-card__meta-item">
        <span>API（高/低）</span>
        <b>{{ order.hiApi }} / {{ order.loApi }}</b>
      </div>
    </div>

    <div class="work-order-card__footer">
      <span class="work-order-card__date">{{ order.planDate }}</span>
      <el-tag :type="getStatusTagType(order.status)" size="small">
        {{ getStatusLabel(order.status, order.statusText) }}
      </el-tag>
    </div>
  </article>
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";
</style>
