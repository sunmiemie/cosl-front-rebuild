<script setup lang="ts">
import { onMounted, ref } from "vue"
import { Plus, Refresh, Search } from "@element-plus/icons-vue"
import { getCalibrationModelOptionsApi } from "@/api/calibration-well/model"
import type { ModelOptionItem } from "@/api/calibration-well/types"
import type { WorkOrderFilter } from "../types"
import { STATUS_OPTIONS } from "../constants/options"

const filter = defineModel<WorkOrderFilter>("filter", { required: true })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
}>()

const modelOptions = ref<ModelOptionItem[]>([])

onMounted(async () => {
  const res = await getCalibrationModelOptionsApi()
  modelOptions.value = res.data?.list ?? []
})
</script>

<template>
  <div class="work-order-toolbar">
    <el-form :inline="true" :model="filter" class="work-order-filter" @submit.prevent="emit('search')">
      <el-form-item label="关键词">
        <el-input
          v-model="filter.keyword"
          placeholder="任务单号 / SN / 人员 / 地点"
          clearable
          style="width: 220px"
          @keyup.enter="emit('search')"
        />
      </el-form-item>
      <el-form-item label="仪器型号">
        <el-select v-model="filter.modelId" placeholder="全部" clearable filterable style="width: 180px">
          <el-option v-for="item in modelOptions" :key="item.id" :label="item.displayName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filter.status" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" :loading="loading" @click="emit('search')">查询</el-button>
        <el-button :icon="Refresh" @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="work-order-toolbar__actions">
      <el-button type="primary" :icon="Plus" @click="emit('create')">新建工单</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/work-order.scss";

.work-order-filter {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
