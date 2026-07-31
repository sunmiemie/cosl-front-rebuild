<script setup lang="ts">
import { computed } from "vue"
import { List } from "@element-plus/icons-vue"
import type { DashboardRecentOrder } from "../types"
import {
  getStatusLabel,
  getStatusTagType
} from "../../work-order/constants/options"
import DashboardPanel from "./DashboardPanel.vue"

const props = defineProps<{
  orders: DashboardRecentOrder[]
  limit?: number
}>()

const displayOrders = computed(() => props.orders.slice(0, props.limit ?? 5))
</script>

<template>
  <DashboardPanel title="近期工单状态" :icon="List">
    <el-table :data="displayOrders" stripe>
      <el-table-column prop="taskNumber" label="工单编号" min-width="130" show-overflow-tooltip />
      <el-table-column prop="modelName" label="仪器型号" min-width="120" show-overflow-tooltip />
      <el-table-column prop="engineer" label="测试人员" width="100" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status, row.statusText) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </DashboardPanel>
</template>
