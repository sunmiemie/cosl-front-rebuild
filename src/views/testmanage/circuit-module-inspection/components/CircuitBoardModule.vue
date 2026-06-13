<template>
  <div class="circuit-board-module">
    <div class="module-filter">
      <el-form :model="searchForm" inline>
        <el-form-item label="模块编号">
          <el-input v-model="searchForm.moduleNo" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="模块名称">
          <el-input v-model="searchForm.moduleName" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="电路板序列号">
          <el-input v-model="searchForm.serial" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="searchForm.supplier" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadModules">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-radio-group v-model="sourceFilter" @change="loadModules">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="production">生产电路板</el-radio-button>
        <el-radio-button label="temporary">临时电路板</el-radio-button>
      </el-radio-group>
    </div>

    <div class="module-layout">
      <section class="module-list-panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">电路板模块列表</div>
            <div class="panel-subtitle">共 {{ moduleList.length }} 个模块</div>
          </div>
          <el-button circle type="primary" :icon="RefreshRight" @click="loadModules" />
        </div>

        <el-scrollbar v-loading="moduleLoading" class="module-scrollbar">
          <el-empty v-if="moduleList.length === 0" description="暂无电路板模块" />
          <div
            v-for="module in moduleList"
            v-else
            :key="module.key"
            class="module-card"
            :class="{ active: selectedModuleKey === module.key }"
            role="button"
            tabindex="0"
            @click="selectModule(module)"
          >
            <div class="module-card__top">
              <div class="module-name">{{ module.name || module.id }}</div>
              <el-tag :type="module.sourceType === 'production' ? 'primary' : 'warning'" effect="plain">
                {{ module.sourceLabel }}
              </el-tag>
            </div>
            <div class="module-meta">
              <span>编号：{{ module.id || "-" }}</span>
              <span>数量：{{ getModuleBoardCount(module) }}</span>
              <span>创建：{{ module.dateTime || "-" }}</span>
            </div>
            <div v-if="module.boardmodel" class="module-model">型号：{{ module.boardmodel }}</div>
            <div class="module-actions">
              <el-button link type="primary" :icon="View" @click.stop="selectModule(module)">详情</el-button>
              <el-button size="small" type="warning" :icon="Printer" @click.stop="handlePrintModuleQrcodes(module)">
                打印二维码
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </section>

      <section class="module-detail-panel">
        <template v-if="selectedModule">
          <div class="detail-header">
            <div>
              <div class="detail-title">{{ selectedModule.name || selectedModule.id }}</div>
              <div class="detail-subtitle">
                {{ selectedModule.sourceLabel }} / {{ selectedModule.dateTime || "无创建时间" }}
              </div>
            </div>
            <el-button
              type="warning"
              :icon="Printer"
              :loading="printingModuleKey === selectedModule.key"
              @click="handlePrintModuleQrcodes(selectedModule)"
            >
              打印全部二维码
            </el-button>
          </div>

          <div class="detail-info">
            <div class="info-item">
              <span>模块编号</span>
              <strong>{{ selectedModule.id || "-" }}</strong>
            </div>
            <div class="info-item">
              <span>模块类型</span>
              <strong>{{ selectedModule.sourceLabel }}</strong>
            </div>
            <div class="info-item">
              <span>电路板数量</span>
              <strong>{{ getModuleBoardCount(selectedModule) }}</strong>
            </div>
            <div class="info-item">
              <span>电路板型号</span>
              <strong>{{ selectedModule.boardmodel || "-" }}</strong>
            </div>
          </div>

          <div class="board-table-header">
            <div class="panel-title">电路板明细</div>
            <el-button :icon="RefreshRight" :loading="detailLoading" @click="loadModuleBoards(selectedModule, true)">
              刷新明细
            </el-button>
          </div>

          <el-table v-loading="detailLoading" :data="selectedModule.boards" border stripe height="420">
            <el-table-column prop="seria" label="电路板序列号" min-width="180" />
            <el-table-column prop="name" label="电路板型号" min-width="180" />
            <el-table-column prop="startTime" label="入库时间" min-width="160" />
            <el-table-column label="来源" min-width="120">
              <template #default>
                <el-tag :type="selectedModule.sourceType === 'production' ? 'primary' : 'warning'" effect="plain">
                  {{ selectedModule.sourceLabel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Printer" @click="handlePrintBoardQrcode(row)">
                  打印二维码
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <el-empty v-else description="请选择电路板模块" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { Printer, Refresh, RefreshRight, Search, View } from "@element-plus/icons-vue"
import { getBatchDataApi } from "@/api/batch"
import { getBoardDataApi } from "@/api/board"
import { getTempBatchDataApi } from "@/api/temp-batch"
import { getBatchTempBoardDataApi } from "@/api/temp-board"
import {
  normalizeBoardForQrcode,
  printBoardQrcodes,
  type QrcodeBoardRow,
  type QrcodeBoardSource
} from "@/utils/printQrcode"

type SourceFilter = QrcodeBoardSource | "all"

interface CircuitBoardRow extends QrcodeBoardRow {
  sourceType: QrcodeBoardSource
}

interface CircuitModule {
  key: string
  id: string
  name: string
  sourceType: QrcodeBoardSource
  sourceLabel: string
  dateTime: string
  boardmodel: string
  total: number
  boards: CircuitBoardRow[]
  boardsLoaded: boolean
}

const MODULE_PAGE_SIZE = 200
const BOARD_PAGE_SIZE = 9999

const sourceFilter = ref<SourceFilter>("all")
const moduleLoading = ref(false)
const detailLoading = ref(false)
const printingModuleKey = ref("")
const selectedModuleKey = ref("")
const moduleList = ref<CircuitModule[]>([])

const searchForm = reactive({
  moduleNo: "",
  moduleName: "",
  serial: "",
  supplier: ""
})

const selectedModule = computed(() => moduleList.value.find((module) => module.key === selectedModuleKey.value) || null)

const getSourceLabel = (sourceType: QrcodeBoardSource) => (sourceType === "production" ? "生产电路板" : "临时电路板")

const mapBatchToModule = (row: any, sourceType: QrcodeBoardSource): CircuitModule => ({
  key: `${sourceType}-${row.id || row.name}`,
  id: String(row.id || ""),
  name: row.name || String(row.id || ""),
  sourceType,
  sourceLabel: getSourceLabel(sourceType),
  dateTime: row.dateTime || row.startTime || "",
  boardmodel: row.boardmodel || row.boardModel || "",
  total: Number(row.total || row.count || row.boardCount || 0),
  boards: [],
  boardsLoaded: false
})

const mapBoardToRow = (row: QrcodeBoardRow, sourceType: QrcodeBoardSource): CircuitBoardRow => {
  const normalized = normalizeBoardForQrcode(row, sourceType)

  return {
    ...row,
    ...normalized,
    sourceType
  }
}

const getModuleBoardCount = (module: CircuitModule) => {
  if (module.boardsLoaded) return module.boards.length
  return module.total || "-"
}

const shouldLoadSource = (sourceType: QrcodeBoardSource) => sourceFilter.value === "all" || sourceFilter.value === sourceType

const loadProductionModules = async () => {
  if (!shouldLoadSource("production")) return []

  const res = await getBatchDataApi({
    currentPage: 1,
    size: MODULE_PAGE_SIZE,
    batchId: searchForm.moduleNo || undefined,
    batchName: searchForm.moduleName || undefined,
    supplier: searchForm.supplier || undefined,
    serial: searchForm.serial || undefined
  })

  return (res.data.list || []).map((row) => mapBatchToModule(row, "production"))
}

const loadTemporaryModules = async () => {
  if (!shouldLoadSource("temporary")) return []

  const res = await getTempBatchDataApi({
    currentPage: 1,
    size: MODULE_PAGE_SIZE,
    batchId: searchForm.moduleNo || undefined,
    batchName: searchForm.moduleName || undefined,
    supplier: searchForm.supplier || undefined,
    serial: searchForm.serial || undefined
  })

  return (res.data.list || []).map((row) => mapBatchToModule(row, "temporary"))
}

const sortModules = (modules: CircuitModule[]) =>
  modules.sort((a, b) => String(b.dateTime || b.id).localeCompare(String(a.dateTime || a.id)))

const loadModules = async () => {
  moduleLoading.value = true
  const previousKey = selectedModuleKey.value

  try {
    const [productionModules, temporaryModules] = await Promise.all([loadProductionModules(), loadTemporaryModules()])
    moduleList.value = sortModules([...productionModules, ...temporaryModules])
    const nextModule = moduleList.value.find((module) => module.key === previousKey) || moduleList.value[0]
    selectedModuleKey.value = nextModule?.key || ""

    if (nextModule) {
      await loadModuleBoards(nextModule)
    }
  } catch (error) {
    moduleList.value = []
    selectedModuleKey.value = ""
    ElMessage.error("电路板模块加载失败")
  } finally {
    moduleLoading.value = false
  }
}

const loadModuleBoards = async (module: CircuitModule, force = false) => {
  if (module.boardsLoaded && !force) return module.boards

  detailLoading.value = true
  try {
    if (module.sourceType === "production") {
      const res = await getBoardDataApi({
        currentPage: 1,
        size: BOARD_PAGE_SIZE,
        batch: module.id,
        boardmodel: "",
        status: undefined,
        seria: undefined
      })
      module.boards = (res.data.list || []).map((row) => mapBoardToRow(row, module.sourceType))
      module.total = Number(res.data.total || module.boards.length)
    } else {
      const res = await getBatchTempBoardDataApi({
        currentPage: 1,
        size: BOARD_PAGE_SIZE,
        batch: module.id,
        seria: undefined
      })
      module.boards = (res.data.list || []).map((row) => mapBoardToRow(row, module.sourceType))
      module.total = Number(res.data.total || module.boards.length)
    }
    module.boardsLoaded = true
    return module.boards
  } catch (error) {
    module.boards = []
    module.total = 0
    module.boardsLoaded = true
    ElMessage.error("电路板明细加载失败")
    return module.boards
  } finally {
    detailLoading.value = false
  }
}

const selectModule = async (module: CircuitModule) => {
  selectedModuleKey.value = module.key
  await loadModuleBoards(module)
}

const handlePrintModuleQrcodes = async (module: CircuitModule) => {
  printingModuleKey.value = module.key
  try {
    if (!module.boardsLoaded) {
      await loadModuleBoards(module)
    }
    if (module.boards.length === 0) {
      ElMessage.warning("当前模块下没有可打印的电路板")
      return
    }
    await printBoardQrcodes(module.boards, {
      sourceType: module.sourceType,
      emptyMessage: "当前模块下没有可打印的电路板"
    })
  } finally {
    printingModuleKey.value = ""
  }
}

const handlePrintBoardQrcode = (row: CircuitBoardRow) => {
  const sourceType = selectedModule.value?.sourceType || row.sourceType
  printBoardQrcodes([row], {
    sourceType,
    emptyMessage: "当前电路板缺少序列号，无法打印二维码"
  })
}

const resetSearch = () => {
  searchForm.moduleNo = ""
  searchForm.moduleName = ""
  searchForm.serial = ""
  searchForm.supplier = ""
  loadModules()
}

defineExpose({ refresh: loadModules })

onMounted(() => {
  loadModules()
})
</script>

<style lang="scss" scoped>
.circuit-board-module {
  min-height: 620px;
}

.module-filter {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 16px 18px 12px;
  background: var(--el-bg-color);

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.module-layout {
  display: grid;
  grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
  gap: 16px;
  margin-top: 16px;
  min-height: 520px;
}

.module-list-panel,
.module-detail-panel {
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.module-list-panel {
  display: flex;
  flex-direction: column;
}

.panel-header,
.detail-header,
.board-table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.panel-title,
.detail-title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.panel-subtitle,
.detail-subtitle {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 20px;
}

.module-scrollbar {
  flex: 1;
  min-height: 0;
  padding: 12px;

  :deep(.el-scrollbar__view) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.module-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;

  &:hover,
  &.active {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}

.module-card__top,
.module-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.module-name {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-meta {
  display: grid;
  gap: 4px;
  margin-top: 10px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 20px;
}

.module-model {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.module-actions {
  margin-top: 12px;
}

.module-detail-panel {
  padding-bottom: 16px;
}

.detail-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item {
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-lighter);

  span {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  strong {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-size: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.board-table-header {
  border-bottom: 0;
  padding-bottom: 12px;
}

.module-detail-panel :deep(.el-table) {
  width: calc(100% - 36px);
  margin: 0 18px;
}

@media (max-width: 1200px) {
  .module-layout {
    grid-template-columns: 1fr;
  }

  .detail-info {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
