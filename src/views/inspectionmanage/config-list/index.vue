<script setup lang="ts">
import { onActivated, onMounted, reactive, ref, watch } from "vue"
import { Edit, Refresh, Search, View } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import { usePagination } from "@/hooks/usePagination"
import { getInspectionBaseInfoDetailApi, getInspectionDeviceConfigOverviewApi } from "@/api/inspection-base"
import type { InspectionBaseInfoDetail, InspectionDeviceConfigOverviewItem } from "@/api/inspection-base/types"
import { inspectionDeviceOptions } from "../shared"

const router = useRouter()
const loading = ref(false)
const detailLoading = ref(false)
const rows = ref<InspectionDeviceConfigOverviewItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<InspectionBaseInfoDetail | null>(null)
const stats = reactive({ total: 0, configured: 0, unconfigured: 0 })
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination({ pageSize: 20 })
let hasLoaded = false

const filters = reactive({
  keyword: "",
  device_type: "",
  inspector: "",
  configured: "" as "" | "true" | "false"
})

async function loadOverview() {
  loading.value = true
  try {
    const response = await getInspectionDeviceConfigOverviewApi({
      keyword: filters.keyword.trim() || undefined,
      device_type: filters.device_type || undefined,
      inspector: filters.inspector.trim() || undefined,
      configured: filters.configured || undefined,
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize
    })
    rows.value = response.data.list || []
    paginationData.total = response.data.total || 0
    stats.total = response.data.stats?.total || 0
    stats.configured = response.data.stats?.configured || 0
    stats.unconfigured = response.data.stats?.unconfigured || 0
  } catch (error: any) {
    rows.value = []
    paginationData.total = 0
    ElMessage.error(error?.response?.data?.message || "加载巡检配置失败")
  } finally {
    loading.value = false
    hasLoaded = true
  }
}

function search() {
  if (paginationData.currentPage === 1) {
    void loadOverview()
  } else {
    paginationData.currentPage = 1
  }
}

function resetFilters() {
  filters.keyword = ""
  filters.device_type = ""
  filters.inspector = ""
  filters.configured = ""
  search()
}

function editConfig(row: InspectionDeviceConfigOverviewItem) {
  const query = row.config_id
    ? { id: String(row.config_id) }
    : {
        deviceId: String(row.device_id),
        deviceType: row.device_type
      }
  router.push({ path: "/inspectionmanage/config/editor", query })
}

function editCurrentDetail() {
  if (!currentDetail.value) return
  router.push({ path: "/inspectionmanage/config/editor", query: { id: String(currentDetail.value.id) } })
}

async function showDetail(row: InspectionDeviceConfigOverviewItem) {
  if (!row.config_id) return
  detailVisible.value = true
  detailLoading.value = true
  currentDetail.value = null
  try {
    const response = await getInspectionBaseInfoDetailApi(row.config_id)
    currentDetail.value = response.data
  } catch (error: any) {
    detailVisible.value = false
    ElMessage.error(error?.response?.data?.message || "加载巡检配置详情失败")
  } finally {
    detailLoading.value = false
  }
}

function formatInspectors(row: InspectionDeviceConfigOverviewItem) {
  return (
    row.inspectors
      ?.map((item) => item.name)
      .filter(Boolean)
      .join("、") ||
    row.inspector ||
    "-"
  )
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], () => void loadOverview())
onMounted(() => {
  if (!hasLoaded) void loadOverview()
})
onActivated(() => {
  if (hasLoaded) void loadOverview()
})
</script>

<template>
  <div class="app-container inspection-config-page">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" class="search-form" @submit.prevent="search">
        <el-form-item label="设备信息">
          <el-input
            v-model="filters.keyword"
            clearable
            placeholder="设备名称、SN号或型号"
            class="keyword-input"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="filters.device_type" clearable placeholder="全部类型" class="filter-select">
            <el-option v-for="item in inspectionDeviceOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检人">
          <el-input v-model="filters.inspector" clearable placeholder="请输入巡检人" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="配置状态">
          <el-select v-model="filters.configured" placeholder="全部状态" class="status-select">
            <el-option label="全部" value="" />
            <el-option label="已配置" value="true" />
            <el-option label="未配置" value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="data-card">
      <div class="table-toolbar">
        <div>
          <div class="page-title">巡检配置</div>
          <div class="page-summary">
            共 {{ stats.total }} 台，已配置 {{ stats.configured }} 台，未配置 {{ stats.unconfigured }} 台
          </div>
        </div>
        <div class="toolbar-actions">
          <el-tooltip content="刷新">
            <el-button :icon="Refresh" circle :loading="loading" @click="loadOverview" />
          </el-tooltip>
        </div>
      </div>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="device_type" label="设备类型" width="126">
          <template #default="{ row }">{{ row.device_type || "未分类" }}</template>
        </el-table-column>
        <el-table-column prop="device_name" label="设备名称" min-width="170" show-overflow-tooltip />
        <el-table-column prop="device_sn" label="SN号" min-width="155" show-overflow-tooltip />
        <el-table-column label="巡检人" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ formatInspectors(row) }}</template>
        </el-table-column>
        <el-table-column prop="item_count" label="巡检内容" width="100" align="center">
          <template #default="{ row }">{{ row.configured ? `${row.item_count} 条` : "-" }}</template>
        </el-table-column>
        <el-table-column label="配置状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.configured ? 'success' : 'info'" effect="light">
              {{ row.configured ? "已配置" : "未配置" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="最近更新" width="168">
          <template #default="{ row }">{{ row.updated_at || "-" }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.configured" link type="primary" :icon="View" @click="showDetail(row)">
              查看
            </el-button>
            <el-button link :type="row.configured ? 'warning' : 'primary'" :icon="Edit" @click="editConfig(row)">
              {{ row.configured ? "编辑" : "配置" }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        background
        :layout="paginationData.layout"
        :page-sizes="paginationData.pageSizes"
        :total="paginationData.total"
        :page-size="paginationData.pageSize"
        :current-page="paginationData.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-drawer v-model="detailVisible" title="巡检配置详情" size="min(820px, 96vw)" destroy-on-close>
      <div v-loading="detailLoading" class="detail-content">
        <template v-if="currentDetail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="配置编号">{{ currentDetail.inspection_no }}</el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ currentDetail.device_type }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ currentDetail.device_name }}</el-descriptions-item>
            <el-descriptions-item label="SN号">{{ currentDetail.device_sn }}</el-descriptions-item>
            <el-descriptions-item label="巡检人" :span="2">{{ currentDetail.inspector }}</el-descriptions-item>
            <el-descriptions-item label="最近更新" :span="2">{{
              currentDetail.updated_at || "-"
            }}</el-descriptions-item>
          </el-descriptions>

          <div class="detail-title">巡检内容</div>
          <el-table :data="currentDetail.items" border stripe>
            <el-table-column prop="sort_no" label="序号" width="64" align="center" />
            <el-table-column prop="content" label="巡检内容" min-width="280" />
            <el-table-column label="填写方式" width="110" align="center">
              <template #default="{ row }">{{ row.result_type === 1 ? "文本填写" : "选项选择" }}</template>
            </el-table-column>
            <el-table-column label="需要拍照" width="96" align="center">
              <template #default="{ row }">{{ row.require_photo ? "是" : "否" }}</template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="currentDetail" type="primary" @click="editCurrentDetail"> 编辑配置 </el-button>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.inspection-config-page {
  min-height: calc(100vh - 84px);
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0 8px;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.keyword-input {
  width: 220px;
}

.filter-select {
  width: 150px;
}

.status-select {
  width: 120px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.page-title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 700;
}

.page-summary {
  margin-top: 5px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.detail-content {
  min-height: 180px;
}

.detail-title {
  margin: 22px 0 12px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}

@media (max-width: 900px) {
  .search-form {
    :deep(.el-form-item) {
      width: 100%;
      margin-bottom: 12px;
    }

    :deep(.el-form-item__content),
    .keyword-input,
    .filter-select,
    .status-select {
      width: 100%;
    }
  }

  .table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
