<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import { getToolDisplayName } from "../constants/tool-params"

const visible = defineModel<boolean>("visible", { default: false })

defineProps<{
  order: CalibrationWorkOrder | null
}>()

const statusLabel = (status: CalibrationWorkOrder["status"]) => (status === "completed" ? "已完成" : "待处理")
const statusType = (status: CalibrationWorkOrder["status"]) => (status === "completed" ? "success" : "warning")
</script>

<template>
  <el-dialog v-model="visible" title="伽马刻度工单详情" width="760px" destroy-on-close>
    <template v-if="order">
      <div class="detail-header">
        <div>
          <div class="detail-header__code">WT3-GR/ZZ-Appendix-A</div>
          <div class="detail-header__title">附录A · 伽马刻度工单</div>
        </div>
        <el-tag :type="statusType(order.status)">{{ statusLabel(order.status) }}</el-tag>
      </div>

      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item__label">任务单号</div>
          <div class="detail-item__value">{{ order.id }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item__label">仪器型号</div>
          <div class="detail-item__value">{{ getToolDisplayName(order.toolType) }}</div>
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
      <el-button type="primary" @click="visible = false">关闭</el-button>
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
