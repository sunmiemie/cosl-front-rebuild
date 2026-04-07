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
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="orderNo" label="工单号" width="180" align="center" />
          <el-table-column prop="boardGroup" label="电路板组" min-width="150" align="center">
            <template #default="{ row }">
              {{ row.boardGroup?.name || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="process" label="工艺" min-width="150" align="center">
            <template #default="{ row }">
              {{ row.process?.name || "-" }}
              <el-tag v-if="row.process?.version" size="small" type="info" style="margin-left: 4px">
                v{{ row.process.version }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="boardCount" label="电路板数" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />
          <el-table-column prop="startedAt" label="开始时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.startedAt || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="completedAt" label="完成时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.completedAt || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
              <el-link v-if="row.status === 0" type="success" class="el-link" @click="handlePublish(row)">发布</el-link>
              <el-link v-if="row.status === 0" type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
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
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-row :gutter="20">
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
            <el-form-item label="工艺" prop="processId">
              <el-select
                v-model="createForm.processId"
                placeholder="请选择工艺"
                style="width: 100%"
                :disabled="!createForm.boardGroupId"
              >
                <el-option
                  v-for="item in processList"
                  :key="item.id"
                  :label="`${item.name} (v${item.version})${item.active === 1 ? ' [当前激活]' : ''}`"
                  :value="item.id"
                />
              </el-select>
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
const processList = ref<any[]>([])

// 创建对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  boardGroupId: null as number | null,
  processId: null as number | null,
  remark: ""
})

const createRules = {
  boardGroupId: [{ required: true, message: "请选择电路板组", trigger: "change" }],
  processId: [{ required: true, message: "请选择工艺", trigger: "change" }]
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
const canCreate = computed(() => {
  return createForm.boardGroupId && createForm.processId && allBoardsSelected.value
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

// 显示创建对话框
const showCreateDialog = async () => {
  createForm.boardGroupId = null
  createForm.processId = null
  createForm.remark = ""
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
    const res = await getHaltHassVersionList({ boardGroupId: String(boardGroupId) })
    if (res.code === 0) {
      // 筛选审核通过的工艺（status === 3）
      processList.value = res.data.filter((item) => item.status === 3)

      // 默认选择当前激活的工艺
      const activeProcess = processList.value.find((item) => item.active === 1)
      if (activeProcess) {
        createForm.processId = activeProcess.id
      }
    }

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

      // 收集选中的电路板信息（包含序列号和型号ID）
      const boardSerials = Object.entries(selectedBoards).map(([boardModelId, board]) => ({
        serial: board.serial,
        boardModelId: Number(boardModelId)
      }))

      const res = await createHaltHassOrder({
        boardGroupId: createForm.boardGroupId!,
        processId: createForm.processId!,
        boardCount: selectedBoardGroup.value!.boards.length,
        creatorId,
        remark: createForm.remark,
        boardSerials // 包含选中的电路板信息
      } as any)
      if (res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
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
