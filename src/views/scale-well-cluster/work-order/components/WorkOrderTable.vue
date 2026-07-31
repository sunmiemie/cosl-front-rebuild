<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import {
  getAvailableNextStatuses,
  getStatusActionLabel,
  getStatusLabel,
  getStatusTagType
} from "../constants/options"

defineProps<{
  orders: CalibrationWorkOrder[]
  loading?: boolean
}>()

const emit = defineEmits<{
  detail: [order: CalibrationWorkOrder]
  edit: [order: CalibrationWorkOrder]
  delete: [order: CalibrationWorkOrder]
  publish: [order: CalibrationWorkOrder]
  changeStatus: [order: CalibrationWorkOrder, status: number]
}>()
</script>

<template>
  <el-table v-loading="loading" :data="orders" stripe class="work-order-table">
    <el-table-column prop="taskNumber" label="任务单号" min-width="130" fixed="left" show-overflow-tooltip />
    <el-table-column prop="modelName" label="仪器型号" min-width="120" show-overflow-tooltip />
    <el-table-column prop="serialNumber" label="仪器 SN" min-width="140" show-overflow-tooltip />
    <el-table-column prop="engineer" label="测试人员" width="100" />
    <el-table-column prop="location" label="地点" width="100" show-overflow-tooltip />
    <el-table-column prop="calibrationDevice" label="刻度设备" width="110" />
    <el-table-column prop="hiWell" label="高刻井" width="80" align="center" />
    <el-table-column prop="loWell" label="低刻井" width="80" align="center" />
    <el-table-column label="API（高/低）" min-width="130" align="center">
      <template #default="{ row }">{{ row.hiApi }} / {{ row.loApi }}</template>
    </el-table-column>
    <el-table-column prop="planDate" label="计划日期" width="110" />
    <el-table-column label="状态" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="getStatusTagType(row.status)" size="small">
          {{ getStatusLabel(row.status, row.statusText) }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
    <el-table-column label="操作" width="260" fixed="right" align="center">
      <template #default="{ row }">
        <div class="work-order-table__actions">
          <el-button link type="primary" @click="emit('detail', row)">详情</el-button>
          <el-button v-if="row.status === 0" link type="primary" @click="emit('edit', row)">编辑</el-button>
          <el-button v-if="row.status === 0" link type="success" @click="emit('publish', row)">发布</el-button>
          <el-dropdown
            v-if="getAvailableNextStatuses(row.status).length"
            trigger="click"
            @command="(status: number) => emit('changeStatus', row, status)"
          >
            <el-button link type="primary">变更状态</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="nextStatus in getAvailableNextStatuses(row.status)"
                  :key="nextStatus"
                  :command="nextStatus"
                >
                  {{ getStatusActionLabel(row.status, nextStatus) }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button v-if="row.status === 0" link type="danger" @click="emit('delete', row)">删除</el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";

.work-order-table__actions {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0 4px;
  vertical-align: middle;

  :deep(.el-dropdown) {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
  }

  :deep(.el-button.is-link) {
    vertical-align: middle;
  }
}
</style>
