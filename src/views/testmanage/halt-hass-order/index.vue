<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>HALT-HASS 工单管理</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            创建工单
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入工单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
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
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 0" link type="success" @click="handlePublish(row)">发布</el-button>
            <el-button v-if="row.status === 0" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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
    <el-dialog v-model="createDialogVisible" title="创建工单" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
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
        <el-form-item label="工艺" prop="processId">
          <el-select v-model="createForm.processId" placeholder="请选择工艺" style="width: 100%">
            <el-option
              v-for="item in processList"
              :key="item.id"
              :label="`${item.name} (v${item.version})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="电路板数量" prop="boardCount">
          <el-input-number v-model="createForm.boardCount" :min="1" :max="100" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreate">创建</el-button>
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
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
import {
  getHaltHassOrderList,
  getHaltHassOrderDetail,
  createHaltHassOrder,
  publishHaltHassOrder,
  deleteHaltHassOrder,
  getHaltHassVersionList
} from "@/api/halt-hass"
import { getBoardGroupListApi } from "@/api/boardgroup"
import type { HaltHassOrderListItem, HaltHassOrderDetail } from "@/api/halt-hass/types"

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
const boardGroupList = ref<any[]>([])
const processList = ref<any[]>([])

// 创建对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  boardGroupId: null as number | null,
  processId: null as number | null,
  boardCount: 1,
  remark: ""
})

const createRules = {
  boardGroupId: [{ required: true, message: "请选择电路板组", trigger: "change" }],
  processId: [{ required: true, message: "请选择工艺", trigger: "change" }],
  boardCount: [{ required: true, message: "请输入电路板数量", trigger: "blur" }]
}

// 详情对话框
const detailDialogVisible = ref(false)
const currentOrder = ref<HaltHassOrderDetail | null>(null)

// 获取状态类型
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
    const res = await getBoardGroupListApi({ page: 1, pageSize: 1000 })
    if (res.code === 0) {
      boardGroupList.value = res.data.list || []
    }
  } catch (e) {
    console.error(e)
  }
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
const showCreateDialog = () => {
  createForm.boardGroupId = null
  createForm.processId = null
  createForm.boardCount = 1
  createForm.remark = ""
  processList.value = []
  createDialogVisible.value = true
}

// 电路板组变化时获取对应的工艺列表
const handleBoardGroupChange = async (boardGroupId: number) => {
  createForm.processId = null
  processList.value = []

  if (!boardGroupId) return

  try {
    const res = await getHaltHassVersionList({ boardGroupId: String(boardGroupId) })
    if (res.code === 0) {
      // 只显示激活的工艺
      processList.value = res.data.filter((item) => item.active === 1)
    }
  } catch (e) {
    console.error(e)
  }
}

// 创建工单
const handleCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid) => {
    if (!valid) return

    createLoading.value = true
    try {
      const res = await createHaltHassOrder({
        boardGroupId: createForm.boardGroupId!,
        processId: createForm.processId!,
        boardCount: createForm.boardCount,
        creatorId: userStore.userId,
        remark: createForm.remark
      })
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

onMounted(() => {
  getList()
  getBoardGroups()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
