<script setup lang="ts">
import type { CalibrationWorkOrder } from "../types"
import { getToolDisplayName } from "../constants/tool-params"

defineProps<{
  orders: CalibrationWorkOrder[]
  loading?: boolean
}>()

const emit = defineEmits<{
  detail: [order: CalibrationWorkOrder]
  edit: [order: CalibrationWorkOrder]
  delete: [order: CalibrationWorkOrder]
}>()

const statusLabel = (status: CalibrationWorkOrder["status"]) => (status === "completed" ? "已完成" : "待处理")
const statusType = (status: CalibrationWorkOrder["status"]) => (status === "completed" ? "success" : "warning")
</script>

<template>
  <el-table v-loading="loading" :data="orders" stripe class="work-order-table">
    <el-table-column prop="id" label="任务单号" min-width="130" fixed="left" show-overflow-tooltip />
    <el-table-column label="仪器型号" min-width="120" show-overflow-tooltip>
      <template #default="{ row }">{{ getToolDisplayName(row.toolType) }}</template>
    </el-table-column>
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
    <el-table-column label="状态" width="90" align="center">
      <template #default="{ row }">
        <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
    <el-table-column label="操作" width="180" fixed="right" align="center">
      <template #default="{ row }">
        <el-button link type="primary" @click="emit('detail', row)">详情</el-button>
        <el-button link type="primary" @click="emit('edit', row)">编辑</el-button>
        <el-button link type="danger" @click="emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";
</style>
