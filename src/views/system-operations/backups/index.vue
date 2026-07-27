<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { Coin, Delete, Download, Plus, Refresh, RefreshLeft, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import {
  createDatabaseBackupApi,
  deleteDatabaseBackupApi,
  downloadDatabaseBackupApi,
  getDatabaseBackupsApi,
  getDatabaseOverviewApi,
  getDatabaseTablesApi,
  restoreDatabaseBackupApi
} from "@/api/system-operations"
import type {
  BackupScope,
  BackupStatus,
  DatabaseBackupRecord,
  DatabaseOverview,
  DatabaseTableInfo
} from "@/api/system-operations/types"

const loading = ref(false)
const overviewLoading = ref(false)
const createLoading = ref(false)
const restoreLoading = ref(false)
const downloadId = ref<number>()
const backupRows = ref<DatabaseBackupRecord[]>([])
const overview = ref<DatabaseOverview>()
const tableOptions = ref<DatabaseTableInfo[]>([])
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination({ pageSize: 20 })

const filters = reactive({
  keyword: "",
  status: "",
  scope: "",
  dateRange: null as [string, string] | null
})

const statusOptions: Array<{ label: string; value: BackupStatus }> = [
  { label: "备份中", value: "running" },
  { label: "备份成功", value: "success" },
  { label: "备份失败", value: "failed" },
  { label: "还原中", value: "restoring" },
  { label: "还原失败", value: "restore_failed" }
]

const statusMeta: Record<BackupStatus, { label: string; type: "success" | "warning" | "danger" | "info" }> = {
  running: { label: "备份中", type: "warning" },
  success: { label: "备份成功", type: "success" },
  failed: { label: "备份失败", type: "danger" },
  restoring: { label: "还原中", type: "warning" },
  restore_failed: { label: "还原失败", type: "danger" }
}

function listParams() {
  return {
    keyword: filters.keyword || undefined,
    status: filters.status || undefined,
    scope: filters.scope || undefined,
    startDate: filters.dateRange?.[0],
    endDate: filters.dateRange?.[1],
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  }
}

async function loadOverview() {
  overviewLoading.value = true
  try {
    const response = await getDatabaseOverviewApi()
    overview.value = response.data
  } finally {
    overviewLoading.value = false
  }
}

async function loadBackups() {
  loading.value = true
  try {
    const response = await getDatabaseBackupsApi(listParams())
    backupRows.value = response.data.list
    paginationData.total = response.data.total
  } catch {
    backupRows.value = []
  } finally {
    loading.value = false
  }
}

async function loadTableOptions() {
  const response = await getDatabaseTablesApi()
  tableOptions.value = response.data
}

function search() {
  paginationData.currentPage = 1
  void loadBackups()
}

function resetFilters() {
  filters.keyword = ""
  filters.status = ""
  filters.scope = ""
  filters.dateRange = null
  search()
}

function refreshAll() {
  void Promise.all([loadOverview(), loadBackups()])
}

function formatBytes(value?: number | null) {
  const bytes = Number(value || 0)
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let result = bytes / 1024
  let index = 0
  while (result >= 1024 && index < units.length - 1) {
    result /= 1024
    index += 1
  }
  return `${result.toFixed(result >= 100 ? 0 : 2)} ${units[index]}`
}

function statusLabel(status: BackupStatus) {
  return statusMeta[status]?.label || status
}

function statusType(status: BackupStatus) {
  return statusMeta[status]?.type || "info"
}

function scopeLabel(row: DatabaseBackupRecord) {
  return row.scope === "full" ? "整库备份" : `指定表（${row.tables.length}）`
}

const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  backupName: "",
  scope: "full" as BackupScope,
  tables: [] as string[],
  remark: ""
})
const createRules: FormRules = {
  backupName: [
    { required: true, message: "请输入备份名称", trigger: "blur" },
    { max: 120, message: "备份名称不能超过120个字符", trigger: "blur" }
  ],
  tables: [
    {
      validator: (_rule, value, callback) => {
        if (createForm.scope === "tables" && (!Array.isArray(value) || !value.length)) {
          callback(new Error("请至少选择一张数据表"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ]
}

function defaultBackupName() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `手动备份-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`
}

async function openCreateDialog() {
  createForm.backupName = defaultBackupName()
  createForm.scope = "full"
  createForm.tables = []
  createForm.remark = ""
  createDialogVisible.value = true
  if (!tableOptions.value.length) {
    await loadTableOptions()
  }
}

async function submitBackup() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return
  createLoading.value = true
  try {
    await createDatabaseBackupApi({
      backupName: createForm.backupName.trim(),
      scope: createForm.scope,
      tables: createForm.scope === "tables" ? createForm.tables : [],
      remark: createForm.remark.trim()
    })
    ElMessage.success("数据库备份成功")
    createDialogVisible.value = false
    await Promise.all([loadOverview(), loadBackups()])
  } finally {
    createLoading.value = false
  }
}

const restoreDialogVisible = ref(false)
const restoreTarget = ref<DatabaseBackupRecord>()
const restoreConfirmation = ref("")
const restoreConfirmed = computed(
  () => !!restoreTarget.value && restoreConfirmation.value.trim() === restoreTarget.value.backup_name
)

function openRestoreDialog(row: DatabaseBackupRecord) {
  restoreTarget.value = row
  restoreConfirmation.value = ""
  restoreDialogVisible.value = true
}

async function submitRestore() {
  if (!restoreTarget.value || !restoreConfirmed.value) return
  restoreLoading.value = true
  try {
    const response = await restoreDatabaseBackupApi(restoreTarget.value.id, restoreConfirmation.value.trim())
    ElMessage.success(`数据库还原成功，安全备份：${response.data.safety_backup.backup_name}`)
    restoreDialogVisible.value = false
    await Promise.all([loadOverview(), loadBackups()])
  } finally {
    restoreLoading.value = false
  }
}

async function downloadBackup(row: DatabaseBackupRecord) {
  downloadId.value = row.id
  try {
    const blob = await downloadDatabaseBackupApi(row.id)
    const href = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = href
    link.download = row.file_name || `${row.backup_name}.sql`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
    ElMessage.success("备份文件已下载")
  } finally {
    downloadId.value = undefined
  }
}

async function deleteBackup(row: DatabaseBackupRecord) {
  await ElMessageBox.confirm(`删除后将同时移除备份文件“${row.backup_name}”，且无法恢复。`, "确认删除备份", {
    type: "warning",
    confirmButtonText: "删除",
    cancelButtonText: "取消"
  })
  await deleteDatabaseBackupApi(row.id)
  ElMessage.success("备份已删除")
  await Promise.all([loadOverview(), loadBackups()])
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], () => void loadBackups())

onMounted(() => {
  void Promise.all([loadOverview(), loadBackups()])
})
</script>

<template>
  <div class="app-container system-operation-page">
    <section v-loading="overviewLoading" class="database-overview">
      <div class="overview-identity">
        <div class="overview-icon">
          <el-icon><Coin /></el-icon>
        </div>
        <div>
          <h2>数据库热备份</h2>
          <p>{{ overview?.database_name || "-" }} · {{ overview?.host || "-" }}</p>
        </div>
      </div>
      <div class="overview-metrics">
        <div class="metric">
          <span>数据库容量</span>
          <strong>{{ formatBytes(overview?.database_size) }}</strong>
        </div>
        <div class="metric">
          <span>业务数据表</span>
          <strong>{{ overview?.table_count || 0 }} 张</strong>
        </div>
        <div class="metric">
          <span>有效备份</span>
          <strong>{{ overview?.backup_count || 0 }} 份</strong>
        </div>
        <div class="metric is-wide">
          <span>最近备份</span>
          <strong>{{ overview?.latest_backup_at || "暂无" }}</strong>
          <small>{{ overview?.latest_backup_name || "" }}</small>
        </div>
      </div>
    </section>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" clearable placeholder="备份名称 / 创建人 / 备注" />
        </el-form-item>
        <el-form-item label="备份范围">
          <el-select v-model="filters.scope" clearable placeholder="全部" style="width: 140px">
            <el-option label="整库备份" value="full" />
            <el-option label="指定表备份" value="tables" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
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
        <div>
          <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建备份</el-button>
          <span class="toolbar-hint">使用一致性快照，备份期间业务可正常使用</span>
        </div>
        <el-tooltip content="刷新备份列表">
          <el-button :icon="Refresh" circle @click="refreshAll" />
        </el-tooltip>
      </div>

      <el-table v-loading="loading" :data="backupRows" border stripe>
        <el-table-column prop="backup_name" label="备份名称" min-width="190" show-overflow-tooltip />
        <el-table-column label="范围" width="118">
          <template #default="{ row }">
            <el-tooltip :disabled="row.scope === 'full'" :content="row.tables.join('、')" placement="top">
              <span>{{ scopeLabel(row) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="110" align="right">
          <template #default="{ row }">{{ formatBytes(row.file_size) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tooltip :disabled="!row.failure_message" :content="row.failure_message" placement="top">
              <el-tag :type="statusType(row.status)" effect="light">{{ statusLabel(row.status) }}</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="created_by_name" label="创建人" width="110" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="168" />
        <el-table-column prop="completed_at" label="完成时间" width="168">
          <template #default="{ row }">{{ row.completed_at || "-" }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="210" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="Download"
              :disabled="!row.file_exists"
              :loading="downloadId === row.id"
              @click="downloadBackup(row)"
            >
              下载
            </el-button>
            <el-button
              link
              type="warning"
              :icon="RefreshLeft"
              :disabled="!row.can_restore"
              @click="openRestoreDialog(row)"
            >
              还原
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="deleteBackup(row)">删除</el-button>
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

    <el-dialog v-model="createDialogVisible" title="新建数据库备份" width="620px" destroy-on-close>
      <el-alert type="info" :closable="false" show-icon title="热备份采用事务一致性快照，不会停止当前业务。" />
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="96px" class="dialog-form">
        <el-form-item label="备份名称" prop="backupName">
          <el-input v-model="createForm.backupName" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item label="备份范围" prop="scope">
          <el-segmented
            v-model="createForm.scope"
            :options="[
              { label: '整库备份', value: 'full' },
              { label: '指定数据表', value: 'tables' }
            ]"
          />
        </el-form-item>
        <el-form-item v-if="createForm.scope === 'tables'" label="选择数据表" prop="tables">
          <el-select
            v-model="createForm.tables"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择需要备份的数据表"
            style="width: 100%"
          >
            <el-option
              v-for="item in tableOptions"
              :key="item.name"
              :label="`${item.name} · ${formatBytes(item.size)}`"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="填写备份原因或数据范围说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitBackup">开始备份</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="restoreDialogVisible" title="还原数据库" width="620px" destroy-on-close>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="还原会覆盖当前业务数据，系统将先自动创建一份“还原前安全备份”。"
      />
      <el-descriptions v-if="restoreTarget" :column="1" border class="restore-summary">
        <el-descriptions-item label="目标备份">{{ restoreTarget.backup_name }}</el-descriptions-item>
        <el-descriptions-item label="备份时间">{{ restoreTarget.completed_at || "-" }}</el-descriptions-item>
        <el-descriptions-item label="备份范围">{{ scopeLabel(restoreTarget) }}</el-descriptions-item>
        <el-descriptions-item label="文件校验">
          {{ restoreTarget.checksum ? `${restoreTarget.checksum.slice(0, 16)}...` : "-" }}
        </el-descriptions-item>
      </el-descriptions>
      <div class="confirmation-field">
        <label>请输入完整备份名称确认还原</label>
        <el-input v-model="restoreConfirmation" :placeholder="restoreTarget?.backup_name" autocomplete="off" />
      </div>
      <template #footer>
        <el-button @click="restoreDialogVisible = false">取消</el-button>
        <el-button type="danger" :disabled="!restoreConfirmed" :loading="restoreLoading" @click="submitRestore">
          创建安全备份并还原
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.system-operation-page {
  min-height: calc(100vh - 84px);
}

.database-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 104px;
  padding: 18px 22px;
  margin-bottom: 14px;
  border: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
}

.overview-identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 260px;

  h2 {
    margin: 0;
    font-size: 20px;
    letter-spacing: 0;
  }

  p {
    margin: 6px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.overview-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  color: var(--el-color-primary);
  font-size: 26px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}

.overview-metrics {
  display: grid;
  grid-template-columns: 130px 110px 110px minmax(200px, 1fr);
  min-width: 650px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 56px;
  padding: 2px 18px;
  border-left: 1px solid var(--el-border-color-lighter);

  span,
  small {
    color: var(--el-text-color-secondary);
  }

  strong {
    font-size: 18px;
    font-weight: 700;
  }

  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  gap: 12px;
  margin-bottom: 14px;
}

.toolbar-hint {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.pagination {
  justify-content: flex-end;
  margin-top: 16px;
}

.dialog-form {
  margin-top: 18px;
}

.restore-summary {
  margin: 18px 0;
}

.confirmation-field {
  label {
    display: block;
    margin-bottom: 8px;
    color: var(--el-text-color-regular);
    font-weight: 600;
  }
}

@media (max-width: 1200px) {
  .database-overview {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .overview-metrics {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .overview-metrics {
    grid-template-columns: 1fr 1fr;
  }

  .metric {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .table-toolbar,
  .table-toolbar > div {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-hint {
    display: block;
    margin: 8px 0 0;
  }
}
</style>
