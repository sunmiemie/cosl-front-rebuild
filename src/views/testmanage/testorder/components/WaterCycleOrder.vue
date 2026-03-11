<!-- 水循环 测试工单 -->

<template>
  <div class="affix-container">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
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

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog"> 新增 水循环 工单 </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="taskNumber" label="任务单号" width="180" align="center" />
          <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" align="center" />
          <el-table-column prop="flowProcess" label="流程长度" min-width="120" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">编辑</el-link>
              <el-link type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
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

    <el-dialog v-model="createDialogVisible" title="创建 水循环 工单" width="1100px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试台" prop="testPlatform">
              <el-select v-model="createForm.testPlatform" placeholder="请选择测试台" style="width: 100%">
                <el-option label="水循环测试台" value="水循环测试台" />
                <el-option label="高压水循环测试台" value="高压水循环测试台" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试日期" prop="testDate">
              <el-date-picker v-model="createForm.testDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="createForm.startTime" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="createForm.endTime" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="createForm.deviceName" />
        </el-form-item>
        <el-form-item label="设备编号" prop="deviceNumber">
          <el-input v-model="createForm.deviceNumber" />
        </el-form-item>
        <el-form-item label="任务单号" prop="taskNumber">
          <el-input v-model="createForm.taskNumber" />
        </el-form-item>

        <el-form-item label="流程长度" prop="flowProcess">
          <el-select v-model="createForm.flowProcess" placeholder="请选择流程长度" style="width: 100%">
            <el-option v-for="p in FLOW_PROCESSES" :key="p.id" :label="p.name" :value="p.value" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否调压" prop="needPressureTest">
              <el-select v-model="createForm.needPressureTest" style="width: 100%">
                <el-option label="否" value="no" />
                <el-option label="是" value="yes" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否指令下传" prop="needCommandTransfer">
              <el-select v-model="createForm.needCommandTransfer" style="width: 100%">
                <el-option label="否" value="no" />
                <el-option label="是" value="yes" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="createForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="备注" style="margin-top: 8px">
          <el-input v-model="createForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="电路板组">{{ currentOrder.boardGroup?.name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="工艺">
          {{ currentOrder.process?.name || "-" }}
          <span v-if="currentOrder.process?.version">(v{{ currentOrder.process.version }})</span>
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
import { ElMessage, ElMessageBox, ElTree, type FormInstance } from "element-plus"
import { Cpu } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
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
import type { HaltHassOrderListItem, HaltHassOrderDetail } from "@/api/halt-hass/types"
import type { BoardGroup, BoardModelItem } from "@/api/boardgroup/types/boardgroup"

const userStore = useUserStore()

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

const FLOW_PROCESSES = [
  { id: "small_loop", name: "空循环", value: "空循环" },
  { id: "water_test", name: "小循环", value: "小循环" },
  { id: "440", name: "440米", value: "440" },
  { id: "877", name: "877米", value: "877" },
  { id: "1766", name: "1766米", value: "1766" },
  { id: "2214", name: "2214米", value: "2214" },
  { id: "3122", name: "3122米", value: "3122" },
  { id: "4622", name: "4622米", value: "4622" },
  { id: "6122", name: "6122米", value: "6122" },
  { id: "water_level", name: "水平钻机", value: "水平钻机" },
  { id: "1500", name: "1500米", value: "1500" },
  { id: "3000", name: "3000米", value: "3000" }
]

const searchForm = reactive({ taskNumber: "", status: "" })

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const loading = ref(false)
const tableData = ref<HaltHassOrderListItem[]>([])
const boardGroupList = ref<BoardGroup[]>([])
const processList = ref<any[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  testPlatform: "水循环测试台",
  testDate: new Date().toISOString().split("T")[0] as any,
  startTime: "" as any,
  endTime: "" as any,
  deviceName: "",
  deviceNumber: "",
  taskNumber: "",
  flowProcess: "",
  needPressureTest: "no",
  needCommandTransfer: "no",
  applicant: "",
  remark: ""
})

const createRules = {
  testPlatform: [{ required: true, message: "请选择测试台", trigger: "change" }],
  testDate: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  deviceName: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  deviceNumber: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  taskNumber: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  flowProcess: [{ required: true, message: "请选择流程长度", trigger: "change" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }]
}

const selectedBoardGroup = ref<BoardGroup | null>(null)

const treeRef = ref<InstanceType<typeof ElTree>>()
const treeData = ref<any[]>([])
const originalTreeData = ref<any[]>([])
const treeLoading = ref(false)
const treeFilterText = ref("")
const treeProps = { children: "children", label: "label" }

const currentBatchId = ref<string | null>(null)
const currentBoardModelId = ref<number | null>(null)
const currentBatchInfo = ref<{ name: string; boardModelName: string } | null>(null)

const selectedBoards = reactive<Record<number, { id: number; serial: string }>>({})
const boardSelections = reactive<Record<number, number | null>>({})
const boardOptions = reactive<Record<number, any[]>>({})
const boardOptionsLoading = reactive<Record<number, boolean>>({})

const selectedBoardsCount = computed(() => Object.keys(selectedBoards).length)
const allBoardsSelected = computed(() => {
  if (!selectedBoardGroup.value) return false
  return selectedBoardGroup.value.boards.every((board) => selectedBoards[board.id])
})
const canCreate = computed(() => {
  return createForm.boardGroupId && createForm.processId && allBoardsSelected.value
})

const detailDialogVisible = ref(false)
const currentOrder = ref<HaltHassOrderDetail | null>(null)

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: "info",
    1: "warning",
    2: "primary",
    3: "",
    4: "danger",
    5: "success",
    6: "danger",
    7: "info",
    8: "warning"
  }
  return map[status] || ""
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHaltHassOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
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

const getBoardGroups = async () => {
  try {
    const res = await getBoardGroupListApi({ page: 1, pageSize: 1000 })
    if (res.code === 0) {
      boardGroupList.value = res.data.list || []
    }
  } catch (e) {
    console.error(e)
  }
}

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

const filterTreeByBoardGroup = (boardGroup: BoardGroup) => {
  if (!originalTreeData.value.length) return

  const boardModelIds = new Set(boardGroup.boards.map((b) => String(b.id)))

  const filterTree = (nodes: any[]): any[] => {
    return nodes
      .map((node) => {
        if (node.id && boardModelIds.has(String(node.id))) {
          return { ...node }
        }
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

const handleSearch = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  searchForm.taskNumber = ""
  searchForm.status = ""
  pagination.page = 1
  getList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getList()
}

const showCreateDialog = async () => {
  Object.assign(createForm, {
    testPlatform: "水循环测试台",
    testDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    deviceName: "",
    deviceNumber: "",
    taskNumber: "",
    flowProcess: "",
    needPressureTest: "no",
    needCommandTransfer: "no",
    applicant: "",
    remark: ""
  })
  createDialogVisible.value = true
}

const handleBoardGroupChange = async (boardGroupId: number) => {
  createForm.processId = null
  processList.value = []
  selectedBoardGroup.value = null
  treeData.value = originalTreeData.value

  Object.keys(selectedBoards).forEach((key) => delete selectedBoards[Number(key)])
  Object.keys(boardSelections).forEach((key) => delete boardSelections[Number(key)])
  Object.keys(boardOptions).forEach((key) => delete boardOptions[Number(key)])

  if (!boardGroupId) return

  try {
    const res = await getHaltHassVersionList({ boardGroupId: String(boardGroupId) })
    if (res.code === 0) {
      processList.value = res.data.filter((item) => item.status === 3)

      const activeProcess = processList.value.find((item) => item.active === 1)
      if (activeProcess) {
        createForm.processId = activeProcess.id
      }
    }

    const detailRes = await getBoardGroupDetailApi(boardGroupId)
    if (detailRes.code === 0) {
      selectedBoardGroup.value = detailRes.data
      filterTreeByBoardGroup(detailRes.data)
    }
  } catch (e) {
    console.error(e)
  }
}

const filterTreeNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

const handleTreeNodeClick = async (data: any, node: any) => {
  if (data.children && data.children.length > 0) return

  currentBatchId.value = data.id
  const parentBoardModelId = node.parent?.data?.id
  currentBoardModelId.value = parentBoardModelId ? Number(parentBoardModelId) : null
  currentBatchInfo.value = { name: data.label, boardModelName: node.parent?.data?.label || "" }

  if (selectedBoardGroup.value && currentBoardModelId.value) {
    const matchingModel = selectedBoardGroup.value.boards.find((board) => board.id === currentBoardModelId.value)
    if (matchingModel && !selectedBoards[matchingModel.id]) {
      await loadBoardsForModel(matchingModel.id)
    }
  }
}

const loadBoardsForModel = async (boardModelId: number) => {
  if (!currentBatchId.value) {
    ElMessage.warning("请先在左侧选择批次")
    return
  }

  boardOptionsLoading[boardModelId] = true
  try {
    const result = await getHaltHassBoardsInfo({ batchId: currentBatchId.value, boardModelId })
    boardOptions[boardModelId] = result.data || []
    if (result.data?.length === 0) {
      ElMessage.info("该批次下没有此工单的水循环任务")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取水循环工单列表失败")
  } finally {
    boardOptionsLoading[boardModelId] = false
  }
}

const handleBoardSelect = (boardModelId: number, boardId: number) => {
  if (!boardId) return
  const board = boardOptions[boardModelId]?.find((b) => b.id === boardId)
  if (board) {
    selectedBoards[boardModelId] = { id: board.id, serial: board.serial_num }
  }
}

const clearBoardSelection = (boardModelId: number) => {
  delete selectedBoards[boardModelId]
  boardSelections[boardModelId] = null
}

watch(treeFilterText, (val) => {
  treeRef.value?.filter(val)
})

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      ElMessage.success("创建成功")
      createDialogVisible.value = false
      getList()
    } catch (e) {
      console.error(e)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

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

const handlePublish = async (row: HaltHassOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishHaltHassOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}

const handleDelete = async (row: HaltHassOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHaltHassOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

defineExpose({ refresh: getList })

onMounted(() => {
  getList()
  getBoardGroups()
})
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.table-wrapper {
  margin-bottom: 20px;
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
.el-link {
  margin-right: 8px;
}
.board-selection-area {
  margin-top: 16px;
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
