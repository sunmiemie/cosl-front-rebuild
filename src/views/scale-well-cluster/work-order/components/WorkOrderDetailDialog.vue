<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import {
  getAvailableNextStatuses,
  getStatusActionLabel,
  getStatusLabel,
  getStatusTagType
} from "../constants/options"

const visible = defineModel<boolean>("visible", { default: false })

defineProps<{
  order: CalibrationWorkOrder | null
}>()

const emit = defineEmits<{
  publish: [order: CalibrationWorkOrder]
  changeStatus: [order: CalibrationWorkOrder, status: number]
}>()
</script>

<template>
  <el-dialog v-model="visible" title="伽马刻度工单详情" width="760px" destroy-on-close>
    <template v-if="order">
      <div class="detail-header">
        <div>
          <div class="detail-header__code">WT3-GR/ZZ-Appendix-A</div>
          <div class="detail-header__title">附录A · 伽马刻度工单</div>
        </div>
        <el-tag :type="getStatusTagType(order.status)">
          {{ getStatusLabel(order.status, order.statusText) }}
        </el-tag>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item__label">任务单号</div>
          <div class="detail-item__value">{{ order.taskNumber }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">仪器型号</div>
          <div class="detail-item__value">{{ order.modelName }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">仪器 SN</div>
          <div class="detail-item__value">{{ order.serialNumber }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">测试人员</div>
          <div class="detail-item__value">{{ order.engineer }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">计划日期</div>
          <div class="detail-item__value">{{ order.planDate }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">地点</div>
          <div class="detail-item__value">{{ order.location }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">刻度设备</div>
          <div class="detail-item__value">{{ order.calibrationDevice }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">高刻井</div>
          <div class="detail-item__value">{{ order.hiWell }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">低刻井</div>
          <div class="detail-item__value">{{ order.loWell }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">高刻 API</div>
          <div class="detail-item__value">{{ order.hiApi }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">低刻 API</div>
          <div class="detail-item__value">{{ order.loApi }}</div>
        </div>
        <div v-if="order.kc != null" class="detail-item">
          <div class="detail-item__label">刻度结果 Kc</div>
          <div class="detail-item__value">{{ order.kc }}</div>
        </div>
      </div>

      <div v-if="order.remark" class="detail-remark">
        <div class="detail-item__label">备注</div>
        {{ order.remark }}
      </div>
    </template>

    <template #footer>
      <el-button v-if="order?.status === 0" type="success" @click="order && emit('publish', order)">发布工单</el-button>
      <el-dropdown
        v-if="order && getAvailableNextStatuses(order.status).length"
        trigger="click"
        @command="(status: number) => order && emit('changeStatus', order, status)"
      >
        <el-button type="primary">变更状态</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="nextStatus in getAvailableNextStatuses(order?.status ?? -1)"
              :key="nextStatus"
              :command="nextStatus"
            >
              {{ getStatusActionLabel(order?.status ?? -1, nextStatus) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--el-color-primary-light-7);

  &__code {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    letter-spacing: 0.04em;
  }

  &__title {
    margin-top: 4px;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 800;
  }
}
</style>
