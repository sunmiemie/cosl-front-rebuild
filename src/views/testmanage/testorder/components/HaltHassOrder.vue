<!-- HALT-HASS 测试工单 -->

<template>
  <div class="affix-container">
    <!-- 搜索区域 -->
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="工单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入工单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog"> 新增 HALT-HASS 工单 </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table class="halt-hass-table" :data="tableData" stripe border style="width: 100%" table-layout="fixed">
          <el-table-column prop="orderNo" label="工单号" min-width="118" align="center" show-overflow-tooltip />
          <el-table-column label="委托单位" min-width="112" align="center">
            <template #default="{ row }">
              {{ getOrderField(row, "testApplicationUnit", "test_application_unit") }}
            </template>
          </el-table-column>
          <el-table-column label="项目名称" min-width="124" align="center">
            <template #default="{ row }">
              {{ getOrderField(row, "projectName", "project_name") }}
            </template>
          </el-table-column>
          <el-table-column label="实验类型" min-width="136" align="center">
            <template #default="{ row }">
              {{ getOrderExperimentTypeText(row) }}
            </template>
          </el-table-column>
          <el-table-column prop="boardGroup" label="电路板组" min-width="108" align="center">
            <template #default="{ row }">
              {{ row.boardGroup?.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="process" label="工艺" min-width="112" align="center">
            <template #default="{ row }">
              <span class="process-name">{{ getOrderProcessName(row) }}</span>
              <el-tag v-if="row.process?.version" class="process-version-tag" size="small" type="info">
                v{{ row.process.version }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="循环次数" width="82" align="center">
            <template #default="{ row }">{{ getOrderCycleCount(row) }} 次</template>
          </el-table-column>
          <el-table-column label="循环总时长" width="104" align="center">
            <template #default="{ row }">{{ formatHours(getOrderTotalDuration(row)) }}</template>
          </el-table-column>
          <el-table-column prop="boardCount" label="电路板数" width="78" align="center" />
          <el-table-column prop="status" label="状态" width="82" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="136" align="center" />
          <el-table-column prop="startedAt" label="开始时间" width="96" align="center">
            <template #default="{ row }">
              {{ row.startedAt || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="completedAt" label="完成时间" width="96" align="center">
            <template #default="{ row }">
              {{ row.completedAt || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="128" align="center">
            <template #default="{ row }">
              <div class="table-actions">
                <el-link type="primary" @click="handleDetail(row)">详情</el-link>
                <el-link v-if="row.status === 0" type="success" @click="handlePublish(row)">发布</el-link>
                <el-link v-if="row.status === 0" type="danger" @click="handleDelete(row)">删除</el-link>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建工单对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建 HALT-HASS 工单" width="1100px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="130px">
        <el-divider content-position="left">委托与项目信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="委托单位" prop="testApplicationUnit">
              <el-input v-model="createForm.testApplicationUnit" placeholder="请输入委托单位" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="科研编号" prop="researchNumber">
              <el-input v-model="createForm.researchNumber" placeholder="请输入科研编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目预算编号" prop="projectBudgetNumber">
              <el-input v-model="createForm.projectBudgetNumber" placeholder="请输入项目预算编号" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="createForm.projectName" placeholder="请输入项目名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="委托单位地址" prop="address">
              <el-input v-model="createForm.address" placeholder="请输入委托单位地址" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" placeholder="请输入申请人" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="createForm.phone" placeholder="请输入电话" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="createForm.mobile" placeholder="请输入手机" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">实验配置</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实验类型" prop="experimentType">
              <el-select
                v-model="createForm.experimentType"
                placeholder="请选择实验类型"
                style="width: 100%"
                @change="handleExperimentTypeChange"
              >
                <el-option
                  v-for="item in experimentTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="试验电路板状态" prop="circuitBoardStatus">
              <el-select v-model="createForm.circuitBoardStatus" placeholder="请选择状态" style="width: 100%">
                <el-option
                  v-for="item in circuitBoardStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电路板组" prop="boardGroupId">
              <el-select
                v-model="createForm.boardGroupId"
                placeholder="请选择电路板组"
                style="width: 100%"
                @change="handleBoardGroupChange"
              >
                <el-option v-for="item in boardGroupList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选择测试工艺" prop="processSelection">
              <el-select
                v-model="createForm.processSelection"
                placeholder="请选择对应实验类型下的工艺流程或其他"
                style="width: 100%"
                :disabled="!createForm.boardGroupId || !createForm.experimentType"
                @change="handleProcessSelectionChange"
              >
                <el-option
                  v-for="item in filteredProcessList"
                  :key="item.id"
                  :label="`${item.name} (v${item.version})${item.active === 1 ? ' [当前激活]' : ''}`"
                  :value="item.id"
                />
                <el-option label="其他" :value="OTHER_PROCESS_VALUE" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="isOtherProcessSelected" :span="12">
            <el-form-item label="其他工艺" prop="otherProcessName">
              <el-input v-model="createForm.otherProcessName" placeholder="请输入其他工艺名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="循环次数" prop="cycleCount">
              <el-input-number
                v-model="createForm.cycleCount"
                :min="1"
                :step="1"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单循环时长" prop="singleCycleDurationHours">
              <div class="duration-input">
                <el-input-number
                  v-model="createForm.singleCycleDurationHours"
                  :disabled="isSingleDurationReadonly"
                  :min="0.01"
                  :step="0.01"
                  :precision="2"
                  controls-position="right"
                />
                <span>小时</span>
              </div>
              <el-text
                v-if="createForm.processSelection && !isOtherProcessSelected && !createForm.singleCycleDurationHours"
                type="danger"
                size="small"
              >
                所选工艺未配置时长，请填写
              </el-text>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="循环总时长">
              <el-input :model-value="totalCycleDurationText" readonly>
                <template #append>小时</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 电路板选择区域 -->
        <el-divider v-if="selectedBoardGroup">选择电路板</el-divider>
        <div v-if="selectedBoardGroup" class="board-selection-area">
          <el-row :gutter="20">
            <!-- 左侧：批次树 -->
            <el-col :span="8">
              <el-card shadow="never" class="tree-card">
                <template #header>
                  <el-input v-model="treeFilterText" placeholder="搜索批次..." clearable />
                </template>
                <el-tree
                  ref="treeRef"
                  :data="treeData"
                  :props="treeProps"
                  :filter-node-method="filterTreeNode"
                  default-expand-all
                  highlight-current
                  @node-click="handleTreeNodeClick"
                  v-loading="treeLoading"
                />
              </el-card>
            </el-col>

            <!-- 右侧：电路板型号及选择 -->
            <el-col :span="16">
              <el-card shadow="never">
                <template #header>
                  <div class="board-header">
                    <span>需选择电路板（共 {{ selectedBoardGroup.boards.length }} 种型号）</span>
                    <el-tag type="success" v-if="allBoardsSelected">已完成</el-tag>
                    <el-tag type="warning" v-else
                      >{{ selectedBoardsCount }}/{{ selectedBoardGroup.boards.length }}</el-tag
                    >
                  </div>
                </template>

                <div class="board-models-list">
                  <div
                    v-for="boardModel in selectedBoardGroup.boards"
                    :key="boardModel.id"
                    class="board-model-item"
                    :class="{ 'is-selected': selectedBoards[boardModel.id] }"
                  >
                    <div class="model-info">
                      <el-icon class="model-icon"><Cpu /></el-icon>
                      <span class="model-name">{{ boardModel.name }}</span>
                      <span v-if="boardModel.code" class="model-code">{{ boardModel.code }}</span>
                    </div>
                    <div class="model-selection">
                      <template v-if="selectedBoards[boardModel.id]">
                        <el-tag type="success" closable @close="clearBoardSelection(boardModel.id)">
                          {{ selectedBoards[boardModel.id].serial }}
                        </el-tag>
                      </template>
                      <template v-else>
                        <el-select
                          v-model="boardSelections[boardModel.id]"
                          placeholder="选择电路板"
                          filterable
                          style="width: 200px"
                          :loading="boardOptionsLoading[boardModel.id]"
                          @change="(val) => handleBoardSelect(boardModel.id, val)"
                        >
                          <el-option
                            v-for="board in boardOptions[boardModel.id] || []"
                            :key="board.id"
                            :label="board.serial_num"
                            :value="board.id"
                          >
                            <span>{{ board.serial_num }}</span>
                          </el-option>
                        </el-select>
                        <el-button
                          v-if="currentBatchId && currentBoardModelId === boardModel.id"
                          type="primary"
                          link
                          @click="loadBoardsForModel(boardModel.id)"
                        >
                          加载
                        </el-button>
                      </template>
                    </div>
                  </div>
                </div>

                <div v-if="currentBatchInfo" class="batch-info">
                  <el-text type="info">
                    当前批次: {{ currentBatchInfo.name }} ({{ currentBatchInfo.boardModelName }})
                  </el-text>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <el-form-item label="备注" style="margin-top: 20px">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="任务单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="委托单位">
          {{ getOrderField(currentOrder, "testApplicationUnit", "test_application_unit") }}
        </el-descriptions-item>
        <el-descriptions-item label="科研编号">
          {{ getOrderField(currentOrder, "researchNumber", "research_number") }}
        </el-descriptions-item>
        <el-descriptions-item label="项目预算编号">
          {{ getOrderField(currentOrder, "projectBudgetNumber", "project_budget_number") }}
        </el-descriptions-item>
        <el-descriptions-item label="项目名称">
          {{ getOrderField(currentOrder, "projectName", "project_name") }}
        </el-descriptions-item>
        <el-descriptions-item label="委托单位地址" :span="2">
          {{ getOrderField(currentOrder, "address", "address") }}
        </el-descriptions-item>
        <el-descriptions-item label="申请人">
          {{ getOrderField(currentOrder, "applicant", "applicant") }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          {{ getOrderField(currentOrder, "phone", "phone") }}
        </el-descriptions-item>
        <el-descriptions-item label="手机">
          {{ getOrderField(currentOrder, "mobile", "mobile") }}
        </el-descriptions-item>
        <el-descriptions-item label="实验类型">{{ getOrderExperimentTypeText(currentOrder) }}</el-descriptions-item>
        <el-descriptions-item label="试验电路板状态">
          {{ getOrderCircuitBoardStatusText(currentOrder) }}
        </el-descriptions-item>
        <el-descriptions-item label="电路板组">{{ currentOrder.boardGroup?.name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="选择测试工艺">
          {{ getOrderProcessName(currentOrder) }}
          <span v-if="currentOrder.process?.version">(v{{ currentOrder.process.version }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="循环次数">{{ getOrderCycleCount(currentOrder) }} 次</el-descriptions-item>
        <el-descriptions-item label="单循环时长">
          {{ formatHours(getOrderSingleDuration(currentOrder)) }}
        </el-descriptions-item>
        <el-descriptions-item label="循环总时长">
          {{ formatHours(getOrderTotalDuration(currentOrder)) }}
        </el-descriptions-item>
        <el-descriptions-item label="累计运行时长">
          {{ formatRuntimeSeconds(getOrderElapsedSeconds(currentOrder)) }}
        </el-descriptions-item>
        <el-descriptions-item label="电路板数量">{{ currentOrder.boardCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ currentOrder.startedAt || "-" }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentOrder.completedAt || "-" }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        <el-descriptions-item label="反馈理由" :span="2" v-if="currentOrder.feedbackReason">
          <el-text type="danger">{{ currentOrder.feedbackReason }}</el-text>
        </el-descriptions-item>
      </el-descriptions>

      <div v-if="currentOrder?.scannedBoards?.length" style="margin-top: 20px">
        <h4>已扫描电路板</h4>
        <el-table :data="currentOrder.scannedBoards" size="small" border>
          <el-table-column prop="scanOrder" label="序号" width="60" align="center">
            <template #default="{ row }">{{ row.scanOrder + 1 }}</template>
          </el-table-column>
          <el-table-column prop="serial" label="序列号" />
          <el-table-column prop="boardModel" label="型号">
            <template #default="{ row }">{{ row.boardModel?.name || "-" }}</template>
          </el-table-column>
          <el-table-column prop="scannedAt" label="扫描时间" width="170" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox, ElTree, type FormInstance } from "element-plus"
import { Cpu } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  getHaltHassOrderList,
  getHaltHassOrderDetail,
  createHaltHassOrder,
  publishHaltHassOrder,
  deleteHaltHassOrder,
  getHaltHassVersionList,
  getHaltHassBoardsInfo
} from "@/api/halt-hass"
import { getBoardGroupListApi, getBoardGroupDetailApi } from "@/api/boardgroup"
import { getTestMangePath } from "@/api/testMangelist"
import {
  OTHER_PROCESS_VALUE,
  buildHaltHassCreatePayload,
  filterHaltHassProcesses,
  getHaltHassCircuitBoardStatusText,
  getHaltHassExperimentTypeText,
  getHaltHassOrderField,
  isHaltHassCreateFormReady,
  type HaltHassProcessSelection
} from "./halt-hass-order-helpers"
import type {
  HaltHassCircuitBoardStatus,
  HaltHassExperimentType,
  HaltHassOrderDetail,
  HaltHassOrderListItem,
  HaltHassVersionItem
} from "@/api/halt-hass/types"
import type { BoardGroup } from "@/api/boardgroup/types/boardgroup"

const userStore = useUserStore()
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

// 状态选项
const statusOptions = [
  { value: "0", label: "已创建" },
  { value: "1", label: "待领取" },
  { value: "2", label: "测试中" },
  { value: "3", label: "待审核" },
  { value: "4", label: "待重做" },
  { value: "5", label: "正常" },
  { value: "6", label: "异常" },
  { value: "7", label: "暂存" },
  { value: "8", label: "疑问" }
]

const experimentTypeOptions: Array<{ value: HaltHassExperimentType; label: string }> = [
  { value: "halt", label: "HALT（高温-低温-振动三项）" },
  { value: "hass", label: "HASS" }
]

const circuitBoardStatusOptions: Array<{ value: HaltHassCircuitBoardStatus; label: string }> = [
  { value: "development", label: "研发" },
  { value: "fault_excitation", label: "故障激发" },
  { value: "manufacturing", label: "制造" }
]

// 搜索表单
const searchForm = reactive({
  orderNo: "",
  status: ""
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 数据
const loading = ref(false)
const tableData = ref<HaltHassOrderListItem[]>([])
const boardGroupList = ref<BoardGroup[]>([])
const processList = ref<HaltHassVersionItem[]>([])

// 创建对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  boardGroupId: null as number | null,
  processId: null as number | null,
  processSelection: "" as HaltHassProcessSelection,
  testApplicationUnit: "",
  researchNumber: "",
  projectBudgetNumber: "",
  projectName: "",
  address: "",
  applicant: "",
  phone: "",
  mobile: "",
  experimentType: "" as HaltHassExperimentType | "",
  circuitBoardStatus: "" as HaltHassCircuitBoardStatus | "",
  otherProcessName: "",
  cycleCount: 1,
  singleCycleDurationHours: null as number | null,
  remark: ""
})

const createRules = {
  testApplicationUnit: [{ required: true, message: "请输入委托单位", trigger: "blur" }],
  researchNumber: [{ required: true, message: "请输入科研编号", trigger: "blur" }],
  projectBudgetNumber: [{ required: true, message: "请输入项目预算编号", trigger: "blur" }],
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  address: [{ required: true, message: "请输入委托单位地址", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  phone: [{ required: true, message: "请输入电话", trigger: "blur" }],
  mobile: [{ required: true, message: "请输入手机", trigger: "blur" }],
  experimentType: [{ required: true, message: "请选择实验类型", trigger: "change" }],
  circuitBoardStatus: [{ required: true, message: "请选择试验电路板状态", trigger: "change" }],
  boardGroupId: [{ required: true, message: "请选择电路板组", trigger: "change" }],
  processSelection: [{ required: true, message: "请选择测试工艺", trigger: "change" }],
  cycleCount: [
    {
      validator: (_rule: unknown, value: number, callback: (error?: Error) => void) => {
        if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          callback(new Error("循环次数必须为正整数"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  singleCycleDurationHours: [
    {
      validator: (_rule: unknown, value: number | null, callback: (error?: Error) => void) => {
        const duration = Number(value)
        if (!Number.isFinite(duration) || duration <= 0) {
          callback(new Error(isOtherProcessSelected.value ? "请输入单循环时长" : "所选工艺未配置单循环时长"))
          return
        }
        if (Math.abs(duration * 100 - Math.round(duration * 100)) >= 1e-8) {
          callback(new Error("单循环时长最多保留两位小数"))
          return
        }
        callback()
      },
      trigger: "change"
    }
  ],
  otherProcessName: [
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (createForm.processSelection === OTHER_PROCESS_VALUE && !String(value || "").trim()) {
          callback(new Error("请输入其他工艺名称"))
          return
        }
        callback()
      },
      trigger: "blur"
    }
  ]
}

// 选中的电路板组详情
const selectedBoardGroup = ref<BoardGroup | null>(null)

// 批次树相关
const treeRef = ref<InstanceType<typeof ElTree>>()
const treeData = ref<any[]>([])
const originalTreeData = ref<any[]>([]) // 原始树数据
const treeLoading = ref(false)
const treeFilterText = ref("")
const treeProps = {
  children: "children",
  label: "label"
}

// 当前选中的批次信息
const currentBatchId = ref<string | null>(null)
const currentBoardModelId = ref<number | null>(null)
const currentBatchInfo = ref<{ name: string; boardModelName: string } | null>(null)

// 电路板选择相关
const selectedBoards = reactive<Record<number, { id: number; serial: string }>>({})
const boardSelections = reactive<Record<number, number | null>>({})
const boardOptions = reactive<Record<number, any[]>>({})
const boardOptionsLoading = reactive<Record<number, boolean>>({})

// 计算属性
const selectedBoardsCount = computed(() => Object.keys(selectedBoards).length)
const allBoardsSelected = computed(() => {
  if (!selectedBoardGroup.value) return false
  return selectedBoardGroup.value.boards.every((board) => selectedBoards[board.id])
})
const filteredProcessList = computed(() => filterHaltHassProcesses(processList.value, createForm.experimentType))
const isOtherProcessSelected = computed(() => createForm.processSelection === OTHER_PROCESS_VALUE)
const selectedProcess = computed(() => {
  if (isOtherProcessSelected.value || !createForm.processSelection) return null
  return processList.value.find((item) => item.id === Number(createForm.processSelection)) || null
})
const selectedProcessDuration = computed(() => {
  const duration = Number(selectedProcess.value?.durationHours ?? selectedProcess.value?.duration_hours)
  return Number.isFinite(duration) && duration > 0 ? duration : null
})
const isSingleDurationReadonly = computed(() => !isOtherProcessSelected.value && selectedProcessDuration.value !== null)
const totalCycleDuration = computed(() => {
  const singleDuration = Number(createForm.singleCycleDurationHours)
  const cycleCount = Number(createForm.cycleCount)
  if (!Number.isFinite(singleDuration) || singleDuration <= 0 || !Number.isInteger(cycleCount) || cycleCount <= 0) {
    return 0
  }
  return Number((singleDuration * cycleCount).toFixed(2))
})
const totalCycleDurationText = computed(() =>
  totalCycleDuration.value > 0 ? totalCycleDuration.value.toFixed(2) : "-"
)
const canCreate = computed(() => {
  return isHaltHassCreateFormReady(createForm, allBoardsSelected.value)
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentOrder = ref<HaltHassOrderDetail | null>(null)

// 获取状态类型
type StatusTagType = "success" | "warning" | "info" | "primary" | "danger"

const getStatusType = (status: number): StatusTagType | undefined => {
  const map: Record<number, StatusTagType | undefined> = {
    0: "info",
    1: "warning",
    2: "primary",
    3: undefined,
    4: "danger",
    5: "success",
    6: "danger",
    7: "info",
    8: "warning"
  }
  return map[status]
}

const getOrderRawField = (order: HaltHassOrderListItem | HaltHassOrderDetail, camelKey: string, snakeKey: string) => {
  const target = order as unknown as Record<string, unknown>
  return target[camelKey] ?? target[snakeKey] ?? ""
}

const getOrderField = (order: HaltHassOrderListItem | HaltHassOrderDetail, camelKey: string, snakeKey: string) => {
  return getHaltHassOrderField(order as unknown as Record<string, unknown>, camelKey, snakeKey)
}

const getOrderExperimentTypeText = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getHaltHassExperimentTypeText(String(getOrderRawField(order, "experimentType", "experiment_type")))
}

const getOrderCircuitBoardStatusText = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getHaltHassCircuitBoardStatusText(
    String(getOrderRawField(order, "circuitBoardStatus", "circuit_board_status"))
  )
}

const getOrderOtherProcessName = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  const value = getOrderRawField(order, "otherProcessName", "other_process_name")
  return String(value || "").trim()
}

const getOrderProcessName = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return order.process?.name || getOrderOtherProcessName(order) || "-"
}

const getNumericOrderField = (
  order: HaltHassOrderListItem | HaltHassOrderDetail,
  camelKey: string,
  snakeKey: string,
  fallback = 0
) => {
  const value = Number(getOrderRawField(order, camelKey, snakeKey))
  return Number.isFinite(value) ? value : fallback
}

const getOrderCycleCount = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getNumericOrderField(order, "cycleCount", "cycle_count", 1) || 1
}
const getOrderSingleDuration = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getNumericOrderField(order, "singleCycleDurationHours", "single_cycle_duration_hours")
}
const getOrderTotalDuration = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getNumericOrderField(order, "totalCycleDurationHours", "total_cycle_duration_hours")
}
const getOrderElapsedSeconds = (order: HaltHassOrderListItem | HaltHassOrderDetail) => {
  return getNumericOrderField(order, "elapsedRuntimeSeconds", "elapsed_runtime_seconds")
}
const formatHours = (hours: number) => (hours > 0 ? `${hours.toFixed(2)} 小时` : "-")
const formatRuntimeSeconds = (seconds: number) => {
  if (seconds <= 0) return "0 秒"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return [hours ? `${hours} 小时` : "", minutes ? `${minutes} 分钟` : "", `${remainingSeconds} 秒`]
    .filter(Boolean)
    .join(" ")
}

// 获取工单列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getHaltHassOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 获取电路板组列表
const getBoardGroups = async () => {
  try {
    const res = await getBoardGroupListApi({ currentPage: 1, pageSize: 1000 })
    if (res.code === 0) {
      boardGroupList.value = res.data.list || []
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取批次树数据
const getTreeData = async () => {
  treeLoading.value = true
  try {
    const result = await getTestMangePath()
    originalTreeData.value = result.Pathdata || []
    treeData.value = originalTreeData.value
  } catch (e) {
    console.error(e)
  } finally {
    treeLoading.value = false
  }
}

// 根据电路板组过滤树数据
const filterTreeByBoardGroup = (boardGroup: BoardGroup) => {
  if (!originalTreeData.value.length) return

  // 获取电路板组中的所有型号ID（转为字符串以匹配树节点 id）
  const boardModelIds = new Set(boardGroup.boards.map((b) => String(b.id)))

  // 递归过滤树，只保留匹配的型号节点及其子节点（批次）
  const filterTree = (nodes: any[]): any[] => {
    return nodes
      .map((node) => {
        // 检查是否是型号节点（有 id 且在 boardModelIds 中）
        if (node.id && boardModelIds.has(String(node.id))) {
          // 保留整个节点及其所有子节点
          return { ...node }
        }

        // 检查子节点
        if (node.children && node.children.length > 0) {
          const filteredChildren = filterTree(node.children)
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren }
          }
        }

        return null
      })
      .filter((node) => node !== null)
  }

  treeData.value = filterTree(originalTreeData.value)
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getList()
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ""
  searchForm.status = ""
  pagination.page = 1
  getList()
}

const initSearchFromRoute = () => {
  const { orderNo, status } = route.query
  searchForm.orderNo = typeof orderNo === "string" ? orderNo : ""
  searchForm.status = typeof status === "string" ? status : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "halt-hass"
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getList()
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    boardGroupId: null,
    processId: null,
    processSelection: "",
    testApplicationUnit: "",
    researchNumber: "",
    projectBudgetNumber: "",
    projectName: "",
    address: "",
    applicant: "",
    phone: "",
    mobile: "",
    experimentType: "",
    circuitBoardStatus: "",
    otherProcessName: "",
    cycleCount: 1,
    singleCycleDurationHours: null,
    remark: ""
  })
}

const handleProcessSelectionChange = (value: HaltHassProcessSelection) => {
  if (value === OTHER_PROCESS_VALUE || value === "") {
    createForm.processId = null
    createForm.singleCycleDurationHours = null
  } else {
    createForm.processId = Number(value)
    createForm.otherProcessName = ""
    const selectedProcessItem = processList.value.find((item) => item.id === Number(value))
    const duration = Number(selectedProcessItem?.durationHours ?? selectedProcessItem?.duration_hours)
    createForm.singleCycleDurationHours = Number.isFinite(duration) && duration > 0 ? duration : null
  }
  createFormRef.value?.clearValidate(["processSelection", "otherProcessName", "singleCycleDurationHours"])
}

const selectDefaultProcess = () => {
  const activeProcess = filteredProcessList.value.find((item) => item.active === 1)
  const defaultProcess = activeProcess || filteredProcessList.value[0]
  createForm.processSelection = defaultProcess?.id || ""
  handleProcessSelectionChange(createForm.processSelection)
}

const loadHaltHassProcessList = async (boardGroupId: number) => {
  const versionParams: Parameters<typeof getHaltHassVersionList>[0] = { boardGroupId: String(boardGroupId) }
  if (createForm.experimentType) {
    versionParams.experimentType = createForm.experimentType
    versionParams.experiment_type = createForm.experimentType
  }

  const res = await getHaltHassVersionList(versionParams)
  if (res.code === 0) {
    processList.value = res.data || []
    selectDefaultProcess()
  }
}

const handleExperimentTypeChange = async () => {
  createForm.processSelection = ""
  handleProcessSelectionChange("")
  if (createForm.boardGroupId) {
    await loadHaltHassProcessList(createForm.boardGroupId)
  }
}

// 显示创建对话框
const showCreateDialog = async () => {
  resetCreateForm()
  processList.value = []
  selectedBoardGroup.value = null

  // 清空电路板选择
  Object.keys(selectedBoards).forEach((key) => delete selectedBoards[Number(key)])
  Object.keys(boardSelections).forEach((key) => delete boardSelections[Number(key)])
  Object.keys(boardOptions).forEach((key) => delete boardOptions[Number(key)])

  currentBatchId.value = null
  currentBoardModelId.value = null
  currentBatchInfo.value = null

  // 获取批次树
  await getTreeData()

  createDialogVisible.value = true
}

// 电路板组变化时获取对应的工艺列表和组详情
const handleBoardGroupChange = async (boardGroupId: number) => {
  createForm.processId = null
  createForm.processSelection = ""
  createForm.otherProcessName = ""
  createForm.singleCycleDurationHours = null
  processList.value = []
  selectedBoardGroup.value = null
  treeData.value = originalTreeData.value // 重置树数据

  // 清空电路板选择
  Object.keys(selectedBoards).forEach((key) => delete selectedBoards[Number(key)])
  Object.keys(boardSelections).forEach((key) => delete boardSelections[Number(key)])
  Object.keys(boardOptions).forEach((key) => delete boardOptions[Number(key)])

  if (!boardGroupId) return

  try {
    // 获取工艺列表（所有审核通过的工艺都可选，status === 3 表示已通过）
    await loadHaltHassProcessList(boardGroupId)

    // 获取电路板组详情
    const detailRes = await getBoardGroupDetailApi(boardGroupId)
    if (detailRes.code === 0) {
      selectedBoardGroup.value = detailRes.data
      // 过滤树数据，只显示电路板组中的型号
      filterTreeByBoardGroup(detailRes.data)
    }
  } catch (e) {
    console.error(e)
  }
}

// 过滤树节点
const filterTreeNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

// 树节点点击
const handleTreeNodeClick = async (data: any, node: any) => {
  // 只处理叶子节点（批次）
  if (data.children && data.children.length > 0) return

  currentBatchId.value = data.id
  const parentBoardModelId = node.parent?.data?.id
  currentBoardModelId.value = parentBoardModelId ? Number(parentBoardModelId) : null
  currentBatchInfo.value = {
    name: data.label,
    boardModelName: node.parent?.data?.label || ""
  }

  // 检查当前批次对应的型号是否在选中的电路板组中
  if (selectedBoardGroup.value && currentBoardModelId.value) {
    const matchingModel = selectedBoardGroup.value.boards.find((board) => board.id === currentBoardModelId.value)
    if (matchingModel && !selectedBoards[matchingModel.id]) {
      // 自动加载该型号的电路板
      await loadBoardsForModel(matchingModel.id)
    }
  }
}

// 加载指定型号的电路板列表
const loadBoardsForModel = async (boardModelId: number) => {
  if (!currentBatchId.value) {
    ElMessage.warning("请先在左侧选择批次")
    return
  }

  boardOptionsLoading[boardModelId] = true
  try {
    const result = await getHaltHassBoardsInfo({
      batchId: currentBatchId.value,
      boardModelId: boardModelId
    })
    boardOptions[boardModelId] = result.data || []

    if (result.data?.length === 0) {
      ElMessage.info("该批次下没有此型号的电路板")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取电路板列表失败")
  } finally {
    boardOptionsLoading[boardModelId] = false
  }
}

// 选择电路板
const handleBoardSelect = (boardModelId: number, boardId: number) => {
  if (!boardId) return

  const board = boardOptions[boardModelId]?.find((b) => b.id === boardId)
  if (board) {
    selectedBoards[boardModelId] = {
      id: board.id,
      serial: board.serial_num
    }
  }
}

// 清除电路板选择
const clearBoardSelection = (boardModelId: number) => {
  delete selectedBoards[boardModelId]
  boardSelections[boardModelId] = null
}

// 监听树搜索
watch(treeFilterText, (val) => {
  treeRef.value?.filter(val)
})

// 创建工单
const handleCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (!allBoardsSelected.value) {
      ElMessage.warning("请为每个电路板型号选择一块电路板")
      return
    }

    createLoading.value = true
    try {
      const creatorId = userStore.userid
      if (creatorId == null) {
        ElMessage.error("未获取到当前用户信息")
        return
      }

      const payload = buildHaltHassCreatePayload({
        form: createForm,
        creatorId,
        boardCount: selectedBoardGroup.value!.boards.length,
        selectedBoards
      })

      const res = await createHaltHassOrder(payload)
      if (res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        void taskCenterStore.refresh(true)
        getList()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    } catch (e) {
      console.error(e)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

// 查看详情
const handleDetail = async (row: HaltHassOrderListItem) => {
  try {
    const res = await getHaltHassOrderDetail(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

// 发布工单
const handlePublish = async (row: HaltHassOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", {
    type: "warning"
  })

  try {
    const res = await publishHaltHassOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}

// 删除工单
const handleDelete = async (row: HaltHassOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", {
    type: "warning"
  })

  try {
    const res = await deleteHaltHassOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

// 对外暴露刷新方法
defineExpose({
  refresh: getList
})

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.page = 1
    getList()
  }
)

initSearchFromRoute()
onMounted(() => {
  getList()
  getBoardGroups()
})
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px 18px 2px;
  }
}

:deep(.el-card__body) {
  padding: 18px;
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.table-wrapper {
  width: 100%;
  margin-bottom: 14px;
  overflow-x: hidden;
}

.halt-hass-table {
  :deep(.el-table__inner-wrapper),
  :deep(.el-table__body-wrapper),
  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden !important;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
  }

  :deep(.el-table__cell) {
    padding: 7px 0;
  }

  :deep(.cell) {
    padding: 0 6px;
    line-height: 1.35;
    white-space: normal;
    word-break: break-word;
  }

  :deep(.el-table__header .cell) {
    font-weight: 600;
  }
}

.process-name {
  display: inline-block;
  max-width: 100%;
  vertical-align: middle;
}

.process-version-tag {
  margin-left: 4px;
  vertical-align: middle;
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px 8px;
  line-height: 1.35;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: flex-end;
    row-gap: 8px;
  }
}

.board-selection-area {
  margin-top: 16px;
}

.duration-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.tree-card {
  height: 450px;
  overflow: hidden;
}

.tree-card :deep(.el-card__body) {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.board-models-list {
  max-height: 350px;
  overflow-y: auto;
}

.board-model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 10px;
  transition: all 0.2s;
}

.board-model-item:hover {
  border-color: #409eff;
}

.board-model-item.is-selected {
  background-color: #f0f9eb;
  border-color: #67c23a;
}

.model-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-icon {
  font-size: 18px;
  color: #409eff;
}

.model-name {
  font-weight: 500;
}

.model-code {
  color: #909399;
  font-size: 12px;
}

.model-selection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f4f4f5;
  border-radius: 4px;
}
</style>
