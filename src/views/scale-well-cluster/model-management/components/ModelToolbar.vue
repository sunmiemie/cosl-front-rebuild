<script setup lang="ts">
import { Plus, Refresh, Search, Place } from "@element-plus/icons-vue"
import type { DeviceModelFilter } from "../types"

const filter = defineModel<DeviceModelFilter>("filter", { required: true })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
  openWells: []
}>()

const STATUS_OPTIONS = [
  { label: "启用", value: "1" },
  { label: "停用", value: "0" }
]
</script>

<template>
  <div class="model-management-toolbar">
    <el-form :inline="true" :model="filter" class="model-management-filter" @submit.prevent="emit('search')">
      <el-form-item label="关键词">
        <el-input
          v-model="filter.keyword"
          placeholder="型号名称"
          clearable
          style="width: 220px"
          @keyup.enter="emit('search')"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filter.status" placeholder="全部" clearable style="width: 110px">
          <el-option v-for="item in STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" :loading="loading" @click="emit('search')">查询</el-button>
        <el-button :icon="Refresh" @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="model-management-toolbar__actions">
      <el-button :icon="Place" @click="emit('openWells')">刻度井管理</el-button>
      <el-button type="primary" :icon="Plus" @click="emit('create')">新增型号</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/model-management.scss";

.model-management-filter {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
