<script setup lang="ts">
import { formatCommSummary, type CalibrationWell } from "../types"

defineProps<{
  wells: CalibrationWell[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [well: CalibrationWell]
  delete: [well: CalibrationWell]
}>()

const formatApi = (value: number | null) => (value != null ? value.toFixed(2) : "—")
</script>

<template>
  <el-table v-loading="loading" :data="wells" stripe class="well-management-table">
    <el-table-column prop="wellNo" label="井号" width="100" fixed="left" />
    <el-table-column prop="wellName" label="名称" min-width="120" show-overflow-tooltip />
    <el-table-column label="类型" width="100" align="center">
      <template #default="{ row }">
        <el-tag :type="row.wellType === 'hi' ? 'danger' : 'primary'" size="small">
          {{ row.wellTypeText || (row.wellType === "hi" ? "高刻井" : "低刻井") }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="API" width="90" align="center">
      <template #default="{ row }">{{ formatApi(row.apiValue) }}</template>
    </el-table-column>
    <el-table-column label="多传感器" width="90" align="center">
      <template #default="{ row }">
        <el-tag :type="row.dualSensor ? 'warning' : 'info'" size="small">
          {{ row.dualSensor ? "是" : "否" }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="井径" width="80" align="center">
      <template #default="{ row }">{{ row.holeDiameter ?? "—" }}</template>
    </el-table-column>
    <el-table-column label="通信配置" min-width="150" show-overflow-tooltip>
      <template #default="{ row }">{{ formatCommSummary(row) }}</template>
    </el-table-column>
    <el-table-column label="状态" width="80" align="center">
      <template #default="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? "启用" : "停用" }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
    <el-table-column label="操作" width="140" fixed="right" align="center">
      <template #default="{ row }">
        <el-button link type="primary" @click="emit('edit', row)">编辑</el-button>
        <el-button link type="danger" @click="emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss">
@import "../styles/well-management.scss";
</style>
