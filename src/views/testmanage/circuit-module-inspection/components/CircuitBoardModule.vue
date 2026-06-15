<template>
  <div class="circuit-task-page">
    <section class="application-panel">
      <div class="filter-bar">
        <el-input v-model="searchForm.keyword" clearable placeholder="搜索申请单名称 / 编号" />
        <div class="filter-row">
          <el-select v-model="searchForm.status" class="filter-select" placeholder="全部状态">
            <el-option label="全部状态" value="all" />
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
          <el-select v-model="searchForm.nature" class="filter-select" placeholder="全部性质">
            <el-option label="全部性质" value="all" />
            <el-option label="生产" value="生产" />
            <el-option label="临时" value="临时" />
          </el-select>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </div>
      </div>

      <div class="list-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreateApplication">新建</el-button>
        <el-button :disabled="!canBatchPublish" @click="batchPublishApplications">批量发布</el-button>
        <el-button :disabled="!canBatchSchedule" class="schedule-action" @click="batchScheduleApplications">
          批量排期
        </el-button>
        <span v-if="selectedApplicationIds.length" class="selected-count">已选 {{ selectedApplicationIds.length }} 项</span>
        <el-button class="refresh-action" :icon="RefreshRight" :loading="loading" @click="loadApplications">刷新</el-button>
      </div>

      <el-scrollbar v-loading="loading" class="application-list">
        <el-empty v-if="filteredApplications.length === 0" description="该条件下暂无申请单" />
        <button
          v-for="application in filteredApplications"
          v-else
          :key="application.key"
          class="application-card"
          :class="{ selected: selectedApplication?.key === application.key }"
          type="button"
          @click="openApplicationDetail(application)"
        >
          <el-checkbox
            :model-value="selectedApplicationIds.includes(application.key)"
            @click.stop
            @change="toggleApplicationSelection(application.key)"
          />
          <div class="application-main">
            <div class="application-no">{{ application.orderNo }}</div>
            <div class="application-name">{{ application.name }}</div>
            <div class="application-meta">
              <el-tag effect="light">{{ application.typeLabel }}</el-tag>
              <el-tag :type="application.nature === '生产' ? 'warning' : 'primary'" effect="plain">
                {{ application.nature }}
              </el-tag>
              <span>{{ application.boardCount }} 块板</span>
              <el-tag :type="application.statusTagType" effect="light">{{ application.statusLabel }}</el-tag>
            </div>
          </div>
          <div class="application-actions">
            <el-button size="small" :type="application.primaryType" @click.stop="handlePrimaryAction(application)">
              {{ application.primaryText }}
            </el-button>
            <el-button
              v-if="getApplicationPrintableBoards(application).length"
              size="small"
              :icon="Printer"
              @click.stop="handlePrintOrderQrcodes(application)"
            >
              打印二维码
            </el-button>
          </div>
        </button>
      </el-scrollbar>
    </section>

    <el-dialog v-model="detailVisible" title="申请单详情" width="920px" :close-on-click-modal="false">
      <template v-if="selectedApplication">
        <div class="detail-top">
          <div class="detail-title">
            {{ selectedApplication.name }}
            <el-tag :type="selectedApplication.statusTagType" effect="light">{{ selectedApplication.statusLabel }}</el-tag>
          </div>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="申请单号">{{ selectedApplication.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="测试类型">{{ selectedApplication.typeLabel }}</el-descriptions-item>
            <el-descriptions-item label="工单性质">{{ selectedApplication.nature }}</el-descriptions-item>
            <el-descriptions-item label="电路板数量">{{ selectedApplication.boardCount }} 块</el-descriptions-item>
            <el-descriptions-item label="创建日期">{{ selectedApplication.createDate || "-" }}</el-descriptions-item>
            <el-descriptions-item label="工艺绑定">{{ selectedApplication.craft || "未绑定" }}</el-descriptions-item>
            <el-descriptions-item label="申请人">{{ selectedApplication.applicant || "-" }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ selectedApplication.remark || "-" }}</el-descriptions-item>
          </el-descriptions>
          <div class="detail-actions">
            <el-button
              v-if="selectedApplication.status === 'draft'"
              type="success"
              @click="publishApplication(selectedApplication)"
            >
              发布申请单
            </el-button>
            <el-button
              v-if="selectedApplication.status === 'published'"
              class="schedule-action"
              @click="scheduleApplication(selectedApplication)"
            >
              加入排期顺序
            </el-button>
            <el-button
              v-if="selectedApplication.boards.length"
              :icon="Printer"
              @click="handlePrintOrderQrcodes(selectedApplication)"
            >
              打印二维码
            </el-button>
          </div>
        </div>

        <section v-if="selectedApplication.boards.length" class="board-list-section">
          <div class="board-section-header">
            <div>
              <span class="section-title">电路板列表</span>
              <span class="section-count">共 {{ selectedApplication.boardCount }} 块</span>
            </div>
            <div>
              <el-button :disabled="selectedBoardRows.length === 0" :icon="Printer" @click="handlePrintSelectedBoards">
                打印选中二维码
              </el-button>
              <el-button :disabled="selectedBoardRows.length === 0" @click="batchPublishBoards">批量发布</el-button>
            </div>
          </div>
          <el-table
            :data="selectedApplication.boards"
            border
            height="300"
            row-key="seria"
            @selection-change="selectedBoardRows = $event"
          >
            <el-table-column type="selection" width="42" />
            <el-table-column label="电路板信息" min-width="220">
              <template #default="{ row }">
                <div class="board-sn">{{ row.seria }}</div>
                <div class="board-model">{{ row.name }}</div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getBoardStatus(row.status).tagType" effect="light">
                  {{ getBoardStatus(row.status).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="190" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Printer" @click="handlePrintBoardQrcode(row)">
                  二维码
                </el-button>
                <el-button v-if="row.status === 'draft'" link type="success" @click="publishBoard(row)">发布</el-button>
                <el-button v-if="row.status === 'in_progress'" link @click="completeBoard(row)">完成</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { Plus, Printer, Refresh, RefreshRight } from "@element-plus/icons-vue"
import {
  getCircuitModuleApplicationList,
  syncCircuitModuleApplicationList,
  type CircuitModuleApplicationRelation
} from "@/api/circuit-module-application"
import { printBoardQrcodes, type QrcodeBoardRow } from "@/utils/printQrcode"

type ApplicationTypeKey = "电路板模块"
type ApplicationStatus = "draft" | "published" | "scheduling" | "in_progress" | "done"
type StatusFilter = ApplicationStatus | "all"
type NatureFilter = "生产" | "临时" | "all"

interface CircuitApplicationBoard extends QrcodeBoardRow {
  seria: string
  name: string
  status: ApplicationStatus
}

interface CircuitApplication {
  key: string
  sourceTypeId: "circuitBoardModule"
  dbId: number | string
  orderNo: string
  name: string
  type: ApplicationTypeKey
  typeLabel: string
  nature: "生产" | "临时"
  status: ApplicationStatus
  statusLabel: string
  statusTagType: "primary" | "success" | "warning" | "info" | "danger"
  primaryText: string
  primaryType: "primary" | "success" | "warning" | "info" | "danger" | ""
  boardCount: number
  craft: string
  createDate: string
  applicant: string
  remark: string
  boards: CircuitApplicationBoard[]
  raw: any
}

const statusOptions: Array<{ key: ApplicationStatus; label: string; sub: string; color: string }> = [
  { key: "draft", label: "未发布", sub: "草稿", color: "#6b7280" },
  { key: "published", label: "已发布", sub: "等待排期", color: "#2563eb" },
  { key: "scheduling", label: "排期中", sub: "分配中", color: "#f97316" },
  { key: "in_progress", label: "测试中", sub: "执行中", color: "#10b981" },
  { key: "done", label: "已完成", sub: "本月", color: "#10b981" }
]

const statusMeta: Record<
  ApplicationStatus,
  { label: string; tagType: CircuitApplication["statusTagType"]; primaryText: string; primaryType: CircuitApplication["primaryType"] }
> = {
  draft: { label: "未发布", tagType: "info", primaryText: "发布", primaryType: "primary" },
  published: { label: "已发布", tagType: "success", primaryText: "加入排期", primaryType: "warning" },
  scheduling: { label: "排期中", tagType: "warning", primaryText: "查看", primaryType: "" },
  in_progress: { label: "测试中", tagType: "success", primaryText: "标记完成", primaryType: "" },
  done: { label: "已完成", tagType: "success", primaryText: "查看", primaryType: "" }
}

const circuitPublishedSyncState = { status: 1 } as const

const loading = ref(false)
const detailVisible = ref(false)
const applications = ref<CircuitApplication[]>([])
const selectedApplicationKey = ref("")
const selectedApplicationIds = ref<string[]>([])
const selectedBoardRows = ref<CircuitApplicationBoard[]>([])
const searchForm = reactive<{ keyword: string; status: StatusFilter; nature: NatureFilter }>({
  keyword: "",
  status: "all",
  nature: "all"
})

const selectedApplication = computed(
  () => applications.value.find((application) => application.key === selectedApplicationKey.value) || null
)

const filteredApplications = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  return applications.value.filter((application) => {
    const matchesStatus = searchForm.status === "all" || application.status === searchForm.status
    const matchesNature = searchForm.nature === "all" || application.nature === searchForm.nature
    const matchesKeyword =
      !keyword ||
      [application.orderNo, application.name, application.applicant, application.remark]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesNature && matchesKeyword
  })
})

const canBatchPublish = computed(() =>
  selectedApplicationIds.value.some((key) => applications.value.find((item) => item.key === key)?.status === "draft")
)
const canBatchSchedule = computed(() =>
  selectedApplicationIds.value.some((key) => applications.value.find((item) => item.key === key)?.status === "published")
)

function getString(...values: unknown[]) {
  const value = values.find((item) => typeof item === "string" && item.trim())
  return typeof value === "string" ? value.trim() : ""
}

function normalizeStatus(status: unknown): ApplicationStatus {
  const text = String(status ?? "")
    .trim()
    .toLowerCase()
  if (!text || ["0", "draft", "unlinked", "草稿", "未发布"].includes(text)) return "draft"
  if (["1", "linked", "published", "ready", "已发布", "待排期"].includes(text)) return "published"
  if (["scheduled", "scheduling", "arranged", "已排期", "排期中"].includes(text)) return "scheduling"
  if (["2", "testing", "in_progress", "running", "测试中"].includes(text)) return "in_progress"
  if (["3", "5", "6", "done", "complete", "completed", "finished", "已完成"].includes(text)) return "done"
  return "draft"
}

function inferNature(row: any) {
  const text = [row?.nature, row?.sampleName, row?.specModel, row?.commissionNo]
    .filter(Boolean)
    .join(" ")
  return text.includes("临时") || /temp/i.test(text) ? "临时" : "生产"
}

function applyApplicationStatus(application: CircuitApplication, status: ApplicationStatus) {
  const meta = statusMeta[status]
  application.status = status
  application.statusLabel = meta.label
  application.statusTagType = meta.tagType
  application.primaryText = meta.primaryText
  application.primaryType = meta.primaryType
}

function getGroupStatus(rows: CircuitModuleApplicationRelation[]): ApplicationStatus {
  const statuses = rows.map((row) => normalizeStatus(row.status))
  if (statuses.some((status) => status === "in_progress")) return "in_progress"
  if (statuses.some((status) => status === "scheduling")) return "scheduling"
  if (statuses.length && statuses.every((status) => status === "done")) return "done"
  if (statuses.some((status) => status === "published")) return "published"
  return "draft"
}

function mapRelationToBoard(row: CircuitModuleApplicationRelation, index: number): CircuitApplicationBoard {
  const serial = getString(row.sn) || `PCB-${index + 1}`
  const model = getString(row.specModel, row.sampleName, "电路板模块")
  return {
    id: serial,
    seria: serial,
    sn: serial,
    name: model,
    model,
    startTime: getString(row.updatedAt, row.doneAt),
    status: normalizeStatus(row.status)
  }
}

function mapApiBoardToBoard(row: CircuitModuleApplicationRelation, board: any, index: number): CircuitApplicationBoard {
  const serial =
    getString(board?.seria, board?.sn, board?.serial, board?.id) ||
    `${getString(row.orderNo, row.commissionNo, row.sn) || "PCB"}-${index + 1}`
  const model = getString(board?.model, board?.name, row.specModel, row.sampleName, "电路板模块")
  return {
    id: serial,
    seria: serial,
    sn: serial,
    name: model,
    model,
    startTime: getString(board?.startTime, row.updatedAt, row.doneAt),
    status: normalizeStatus(board?.status ?? row.status)
  }
}

function mapRelationsToApplication(groupKey: string, rows: CircuitModuleApplicationRelation[]): CircuitApplication {
  const first = rows[0] || ({} as CircuitModuleApplicationRelation)
  const rawBoards = Array.isArray(first.boards) && first.boards.length ? first.boards : null
  const boards = rawBoards ? rawBoards.map((board, index) => mapApiBoardToBoard(first, board, index)) : rows.map(mapRelationToBoard)
  const status = getGroupStatus(rows)
  const meta = statusMeta[status]
  const orderNo = getString(first.orderNo, first.commissionNo, first.sn, groupKey)
  const name = getString(first.moduleName, first.sampleName, first.specModel, `${orderNo} 电路板模块申请单`)
  const remark = [
    first.client ? `客户：${first.client}` : "",
    first.phone ? `电话：${first.phone}` : "",
    first.inspector ? `检验员：${first.inspector}` : "",
    first.hours !== null && first.hours !== undefined ? `时长：${first.hours}h` : ""
  ]
    .filter(Boolean)
    .join("；")

  return {
    key: `circuitBoardModule-${orderNo}`,
    sourceTypeId: "circuitBoardModule",
    dbId: orderNo,
    orderNo,
    name,
    type: "电路板模块",
    typeLabel: "电路板模块",
    nature: inferNature(first),
    status,
    statusLabel: meta.label,
    statusTagType: meta.tagType,
    primaryText: meta.primaryText,
    primaryType: meta.primaryType,
    boardCount: boards.length,
    craft: getString(first.device),
    createDate: getString(first.updatedAt, first.doneAt).slice(0, 10),
    applicant: getString(first.applicant),
    remark,
    boards,
    raw: rows
  }
}

function mapRelationsToApplications(rows: CircuitModuleApplicationRelation[]) {
  const groups = new Map<string, CircuitModuleApplicationRelation[]>()
  rows.forEach((row, index) => {
    const groupKey = getString(row.orderNo, row.commissionNo, row.sn) || `PCB-${index + 1}`
    groups.set(groupKey, [...(groups.get(groupKey) || []), row])
  })
  return Array.from(groups.entries()).map(([groupKey, groupRows]) => mapRelationsToApplication(groupKey, groupRows))
}

async function loadApplications() {
  loading.value = true
  try {
    const res = await getCircuitModuleApplicationList()
    applications.value = mapRelationsToApplications(res.data?.list || [])
      .sort((a, b) => String(b.createDate || b.orderNo).localeCompare(String(a.createDate || a.orderNo)))
    selectedApplicationKey.value = applications.value.some((item) => item.key === selectedApplicationKey.value)
      ? selectedApplicationKey.value
      : ""
    selectedApplicationIds.value = selectedApplicationIds.value.filter((key) =>
      applications.value.some((item) => item.key === key)
    )
  } catch (error) {
    applications.value = []
    ElMessage.error("电路模块任务单加载失败")
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  searchForm.keyword = ""
  searchForm.status = "all"
  searchForm.nature = "all"
}

function toggleApplicationSelection(key: string) {
  selectedApplicationIds.value = selectedApplicationIds.value.includes(key)
    ? selectedApplicationIds.value.filter((item) => item !== key)
    : [...selectedApplicationIds.value, key]
}

function openApplicationDetail(application: CircuitApplication) {
  selectedApplicationKey.value = application.key
  selectedBoardRows.value = []
  detailVisible.value = true
}

function refreshSelectedApplication(application: CircuitApplication) {
  selectedApplicationKey.value = application.key
  applications.value = [...applications.value]
}

function getApplicationRelationRows(application: CircuitApplication): CircuitModuleApplicationRelation[] {
  return Array.isArray(application.raw) ? application.raw : []
}

function getApplicationPrintableBoards(application: CircuitApplication): CircuitApplicationBoard[] {
  if (application.boards.length) return application.boards

  const rows = getApplicationRelationRows(application)
  const rawBoards = rows.flatMap((row) => (Array.isArray(row.boards) ? row.boards : []))
  if (rawBoards.length) {
    const first = rows[0] || ({} as CircuitModuleApplicationRelation)
    return rawBoards.map((board, index) => mapApiBoardToBoard(first, board, index))
  }
  return rows.map(mapRelationToBoard)
}

async function persistApplicationStatus(application: CircuitApplication, status: string | number) {
  const rows = getApplicationRelationRows(application)
  if (!rows.length) return

  const nextRows = rows.map((row) => ({
    ...row,
    status
  }))
  await syncCircuitModuleApplicationList(nextRows)
  application.raw = nextRows
}

async function publishApplication(application: CircuitApplication, silent = false) {
  await persistApplicationStatus(application, circuitPublishedSyncState.status)
  applyApplicationStatus(application, "published")
  application.boards.forEach((board) => {
    if (board.status === "draft") board.status = "published"
  })
  refreshSelectedApplication(application)
  if (!silent) ElMessage.success(`${application.orderNo} 已发布，可加入排期`)
}

async function scheduleApplication(application: CircuitApplication, silent = false) {
  await persistApplicationStatus(application, circuitPublishedSyncState.status)
  applyApplicationStatus(application, "published")
  refreshSelectedApplication(application)
  if (!silent) ElMessage.success(`「${application.name}」已加入排期顺序`)
}

async function completeApplication(application: CircuitApplication, silent = false) {
  await persistApplicationStatus(application, 3)
  applyApplicationStatus(application, "done")
  application.boards.forEach((board) => {
    board.status = "done"
  })
  refreshSelectedApplication(application)
  if (!silent) ElMessage.success(`「${application.name}」已完成`)
}

function handlePrimaryAction(application: CircuitApplication) {
  if (application.status === "draft") {
    void publishApplication(application)
    return
  }
  if (application.status === "published") {
    void scheduleApplication(application)
    return
  }
  if (application.status === "in_progress") {
    void completeApplication(application)
    return
  }
  openApplicationDetail(application)
}

async function batchPublishApplications() {
  const targets = applications.value.filter(
    (application) => selectedApplicationIds.value.includes(application.key) && application.status === "draft"
  )
  await Promise.all(targets.map((application) => publishApplication(application, true)))
  ElMessage.success(`已批量发布 ${targets.length} 条申请单`)
}

async function batchScheduleApplications() {
  const targets = applications.value.filter(
    (application) => selectedApplicationIds.value.includes(application.key) && application.status === "published"
  )
  await Promise.all(targets.map((application) => scheduleApplication(application, true)))
  ElMessage.success(`已批量加入排期顺序：${targets.length} 项`)
}

function getBoardStatus(status: ApplicationStatus) {
  return statusMeta[status] || statusMeta.draft
}

function publishBoard(row: CircuitApplicationBoard) {
  row.status = "published"
  selectedBoardRows.value = []
  ElMessage.success(`${row.seria} 已发布`)
}

function completeBoard(row: CircuitApplicationBoard) {
  row.status = "done"
  selectedBoardRows.value = []
  ElMessage.success(`${row.seria} 已完成`)
}

function batchPublishBoards() {
  let count = 0
  selectedBoardRows.value.forEach((row) => {
    if (row.status === "draft") {
      row.status = "published"
      count += 1
    }
  })
  selectedBoardRows.value = []
  ElMessage.success(`已批量发布 ${count} 块电路板`)
}

async function handlePrintOrderQrcodes(application: CircuitApplication) {
  if (!getApplicationPrintableBoards(application).length) {
    ElMessage.warning("当前申请单下没有可打印的电路板")
    return
  }
  await printBoardQrcodes(getApplicationPrintableBoards(application), {
    sourceType: "production",
    emptyMessage: "当前申请单下没有可打印的电路板"
  })
}

function handlePrintBoardQrcode(row: CircuitApplicationBoard) {
  printBoardQrcodes([row], {
    sourceType: "production",
    emptyMessage: "当前电路板缺少序列号，无法打印二维码"
  })
}

async function handlePrintSelectedBoards() {
  if (!selectedBoardRows.value.length) {
    ElMessage.warning("请先勾选需要打印的电路板")
    return
  }
  await printBoardQrcodes(selectedBoardRows.value, {
    sourceType: "production",
    emptyMessage: "当前选中电路板缺少序列号，无法打印二维码"
  })
}

function handleCreateApplication() {
  ElMessage.info("请先同步或导入电路板模块申请数据")
}

defineExpose({ refresh: loadApplications })

onMounted(() => {
  loadApplications()
})
</script>

<style lang="scss" scoped>
.circuit-task-page {
  min-height: 620px;
}

.application-panel {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.filter-bar {
  display: grid;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.filter-row,
.list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  width: 180px;
}

.list-actions {
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}

.schedule-action {
  color: #7c3aed;
  border-color: #c4b5fd;

  &:not(.is-disabled):hover {
    color: #6d28d9;
    background: #f5f3ff;
    border-color: #a78bfa;
  }
}

.refresh-action {
  margin-left: auto;
}

.selected-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.application-list {
  height: calc(100vh - 270px);
  min-height: 360px;
  padding: 8px 10px;

  :deep(.el-scrollbar__view) {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.application-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background-color 0.15s;

  &:hover,
  &.selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 4px rgb(59 130 246 / 10%);
  }
}

.application-main {
  flex: 1;
  min-width: 0;
}

.application-no {
  color: var(--el-text-color-secondary);
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
}

.application-name {
  overflow: hidden;
  margin: 2px 0 5px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.application-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.detail-top {
  padding: 2px 0 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.board-list-section {
  margin-top: 14px;
}

.board-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.section-count {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.board-sn {
  color: var(--el-text-color-regular);
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
}

.board-model {
  margin-top: 2px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

@media (max-width: 1200px) {
  .refresh-action {
    margin-left: 0;
  }
}
</style>
