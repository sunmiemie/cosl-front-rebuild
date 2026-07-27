<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import { Download, Refresh, Search, View } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import { exportOperationLogsApi, getOperationLogsApi } from "@/api/system-operations"
import type { OperationLogItem, OperationLogListRequest } from "@/api/system-operations/types"

const loading = ref(false)
const exportLoading = ref(false)
const logRows = ref<OperationLogItem[]>([])
const moduleOptions = ref<string[]>([])
const actionOptions = ref<string[]>([])
const detailVisible = ref(false)
const detailRow = ref<OperationLogItem>()
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination({ pageSize: 20 })

const filters = reactive({
  keyword: "",
  username: "",
  module: "",
  action: "",
  result: "",
  dateRange: null as [string, string] | null
})

function listParams(): OperationLogListRequest {
  return {
    keyword: filters.keyword || undefined,
    username: filters.username || undefined,
    module: filters.module || undefined,
    action: filters.action || undefined,
    result: filters.result || undefined,
    startDate: filters.dateRange?.[0],
    endDate: filters.dateRange?.[1],
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  }
}

function exportParams(): Omit<OperationLogListRequest, "currentPage" | "pageSize"> {
  return {
    keyword: filters.keyword || undefined,
    username: filters.username || undefined,
    module: filters.module || undefined,
    action: filters.action || undefined,
    result: filters.result || undefined,
    startDate: filters.dateRange?.[0],
    endDate: filters.dateRange?.[1]
  }
}

async function loadLogs() {
  loading.value = true
  try {
    const response = await getOperationLogsApi(listParams())
    logRows.value = response.data.list
    paginationData.total = response.data.total
    moduleOptions.value = response.data.module_options
    actionOptions.value = response.data.action_options
  } catch {
    logRows.value = []
    paginationData.total = 0
  } finally {
    loading.value = false
  }
}

function search() {
  paginationData.currentPage = 1
  void loadLogs()
}

function resetFilters() {
  filters.keyword = ""
  filters.username = ""
  filters.module = ""
  filters.action = ""
  filters.result = ""
  filters.dateRange = null
  search()
}

function showDetail(row: OperationLogItem) {
  detailRow.value = row
  detailVisible.value = true
}

function formatDuration(value: number) {
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(2)} s`
}

function formatJson(value: Record<string, unknown>) {
  if (!value || Object.keys(value).length === 0) return "无"
  return JSON.stringify(value, null, 2)
}

async function exportLogs() {
  exportLoading.value = true
  try {
    const blob = await exportOperationLogsApi(exportParams())
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    const date = new Date().toISOString().slice(0, 10)
    link.href = href
    link.download = `系统操作日志_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
    ElMessage.success("操作日志已导出")
  } finally {
    exportLoading.value = false
  }
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], () => void loadLogs())

onMounted(() => void loadLogs())
</script>

<template>
  <div class="app-container operation-log-page">
    <header class="page-heading">
      <div>
        <h2>操作日志</h2>
        <p>系统审计记录</p>
      </div>
      <div class="record-count">
        <span>当前记录</span>
        <strong>{{ paginationData.total }}</strong>
      </div>
    </header>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            clearable
            placeholder="操作内容 / 对象标识 / 请求路径"
            @keyup.enter="search"
          />
        </el-form-item>
        <el-form-item label="操作用户">
          <el-input v-model="filters.username" clearable placeholder="请输入用户名" @keyup.enter="search" />
        </el-form-item>
        <el-form-item label="功能模块">
          <el-select v-model="filters.module" clearable filterable placeholder="全部" style="width: 150px">
            <el-option v-for="item in moduleOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.action" clearable filterable placeholder="全部" style="width: 140px">
            <el-option v-for="item in actionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行结果">
          <el-select v-model="filters.result" clearable placeholder="全部" style="width: 120px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="data-card">
      <div class="table-toolbar">
        <el-button type="primary" plain :icon="Download" :loading="exportLoading" @click="exportLogs">
          导出日志
        </el-button>
        <el-tooltip content="刷新操作日志">
          <el-button :icon="Refresh" circle @click="loadLogs" />
        </el-tooltip>
      </div>

      <el-table v-loading="loading" :data="logRows" border stripe>
        <el-table-column prop="created_at" label="操作时间" width="168" />
        <el-table-column prop="username" label="操作用户" width="120" show-overflow-tooltip />
        <el-table-column prop="module" label="功能模块" width="130" show-overflow-tooltip />
        <el-table-column prop="action" label="操作类型" width="105" align="center" />
        <el-table-column prop="operation" label="操作内容" min-width="260" show-overflow-tooltip />
        <el-table-column prop="object_id" label="对象标识" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.object_id || "-" }}</template>
        </el-table-column>
        <el-table-column label="执行结果" width="92" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === 'success' ? 'success' : 'danger'" effect="light">
              {{ row.result === "success" ? "成功" : "失败" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="IP 地址" width="132" show-overflow-tooltip />
        <el-table-column label="耗时" width="92" align="right">
          <template #default="{ row }">{{ formatDuration(row.duration_ms) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="88" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="showDetail(row)">详情</el-button>
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

    <el-drawer
      v-model="detailVisible"
      title="操作日志详情"
      size="760px"
      destroy-on-close
      class="operation-detail-drawer"
    >
      <template v-if="detailRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作时间">{{ detailRow.created_at }}</el-descriptions-item>
          <el-descriptions-item label="操作用户">{{ detailRow.username }}</el-descriptions-item>
          <el-descriptions-item label="功能模块">{{ detailRow.module }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ detailRow.action }}</el-descriptions-item>
          <el-descriptions-item label="执行结果">
            <el-tag :type="detailRow.result === 'success' ? 'success' : 'danger'">
              {{ detailRow.result === "success" ? "成功" : "失败" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="响应状态">{{ detailRow.response_status }}</el-descriptions-item>
          <el-descriptions-item label="对象类型">{{ detailRow.object_type || "-" }}</el-descriptions-item>
          <el-descriptions-item label="对象标识">{{ detailRow.object_id || "-" }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ detailRow.method }}</el-descriptions-item>
          <el-descriptions-item label="请求耗时">
            {{ formatDuration(detailRow.duration_ms) }}
          </el-descriptions-item>
          <el-descriptions-item label="IP 地址">{{ detailRow.ip_address || "-" }}</el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ detailRow.user_id || "-" }}</el-descriptions-item>
          <el-descriptions-item label="操作内容" :span="2">
            {{ detailRow.operation }}
          </el-descriptions-item>
          <el-descriptions-item label="请求路径" :span="2">
            {{ detailRow.path }}
          </el-descriptions-item>
          <el-descriptions-item label="响应信息" :span="2">
            {{ detailRow.response_message || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="客户端" :span="2">
            {{ detailRow.user_agent || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <section class="payload-section">
          <h3>查询参数</h3>
          <pre>{{ formatJson(detailRow.query_params) }}</pre>
        </section>
        <section class="payload-section">
          <h3>请求摘要</h3>
          <pre>{{ formatJson(detailRow.request_data) }}</pre>
        </section>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.operation-log-page {
  min-height: calc(100vh - 84px);
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  padding: 14px 20px;
  margin-bottom: 14px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);

  h2 {
    margin: 0;
    font-size: 20px;
    letter-spacing: 0;
  }

  p {
    margin: 5px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.record-count {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--el-text-color-secondary);

  strong {
    color: var(--el-color-primary);
    font-size: 22px;
  }
}

.search-card {
  margin-bottom: 14px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.data-card :deep(.el-card__body) {
  padding: 16px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 16px;
}

.payload-section {
  margin-top: 22px;

  h3 {
    margin: 0 0 10px;
    font-size: 15px;
  }

  pre {
    min-height: 48px;
    padding: 14px;
    margin: 0;
    overflow: auto;
    border: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
    font:
      13px/1.6 Consolas,
      Monaco,
      monospace;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

@media (max-width: 800px) {
  :deep(.operation-detail-drawer) {
    width: 92% !important;
  }
}
</style>
