<script setup lang="ts">
import { formatModelCoeffSummary, type CalibrationDeviceModel } from "../types"

defineProps<{
  models: CalibrationDeviceModel[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [model: CalibrationDeviceModel]
  delete: [model: CalibrationDeviceModel]
}>()

const formatSnSummary = (row: CalibrationDeviceModel) => {
  if (!row.serialNumbers.length) return "—"
  if (row.serialNumbers.length === 1) return row.serialNumbers[0]
  return `${row.serialNumbers[0]} 等 ${row.serialCount} 个`
}

const formatApi = (value: number | null) => (value != null ? value.toFixed(2) : "—")

const formatWellCell = (wellNo: string, api: number | null) => {
  if (!wellNo) return "—"
  return `${wellNo} · ${formatApi(api)}`
}
</script>

<template>
  <el-table v-loading="loading" :data="models" stripe class="model-management-table" table-layout="fixed">
    <el-table-column prop="displayName" label="型号名称" min-width="120" show-overflow-tooltip />
    <el-table-column label="仪器 SN" min-width="120" show-overflow-tooltip>
      <template #default="{ row }">{{ formatSnSummary(row) }}</template>
    </el-table-column>
    <el-table-column label="高刻井" min-width="120" align="center" show-overflow-tooltip>
      <template #default="{ row }">{{ formatWellCell(row.hiWellNo, row.hiWellApi) }}</template>
    </el-table-column>
    <el-table-column label="低刻井" min-width="120" align="center" show-overflow-tooltip>
      <template #default="{ row }">{{ formatWellCell(row.loWellNo, row.loWellApi) }}</template>
    </el-table-column>
    <el-table-column label="系数区间" min-width="200" show-overflow-tooltip>
      <template #default="{ row }">
        <span class="model-coeff-cell">{{ formatModelCoeffSummary(row) }}</span>
      </template>
    </el-table-column>
    <el-table-column label="状态" min-width="88" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? "启用" : "停用" }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
    <el-table-column label="操作" min-width="120" align="center">
      <template #default="{ row }">
        <el-button link type="primary" @click="emit('edit', row)">编辑</el-button>
        <el-button link type="danger" @click="emit('delete', row)">停用</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
@import "../styles/model-management.scss";

.model-coeff-cell {
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--el-text-color-secondary);
}
</style>
