<script setup lang="ts">
import { Plus, Refresh, Search } from "@element-plus/icons-vue"
import type { WellFilter } from "../types"

const filter = defineModel<WellFilter>("filter", { required: true })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
  create: []
}>()

const WELL_TYPE_OPTIONS = [
  { label: "高刻井", value: "hi" },
  { label: "低刻井", value: "lo" }
]

const STATUS_OPTIONS = [
  { label: "启用", value: "1" },
  { label: "停用", value: "0" }
]
</script>

<template>
  <div class="well-management-toolbar">
    <el-form :inline="true" :model="filter" class="well-management-filter" @submit.prevent="emit('search')">
      <el-form-item label="关键词">
        <el-input
          v-model="filter.keyword"
          placeholder="井号 / 名称"
          clearable
          style="width: 200px"
          @keyup.enter="emit('search')"
        />
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="filter.wellType" placeholder="全部" clearable style="width: 120px">
          <el-option v-for="item in WELL_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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

    <div class="well-management-toolbar__actions">
      <el-button type="primary" :icon="Plus" @click="emit('create')">新增刻度井</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "../styles/well-management.scss";

.well-management-filter {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}
</style>
