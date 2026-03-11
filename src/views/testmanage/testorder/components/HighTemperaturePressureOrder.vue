<!-- 高温高压井 工单 -->

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
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增 高温高压井 工单</el-button>
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
          <el-table-column prop="targetTemp" label="目标温度(°C)" min-width="150" align="center" />
          <el-table-column prop="targetPressure" label="目标压力(MPa)" min-width="150" align="center" />
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

    <el-dialog v-model="createDialogVisible" title="创建 高温高压井 工单" width="700px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="140px">
        <el-form-item label="工单编号（自动生成）" prop="orderNo">
          <el-input v-model="createForm.orderNo" placeholder="WO-2024-005" readonly />
        </el-form-item>
        <el-form-item label="容器类型" prop="containerType">
          <el-select v-model="createForm.containerType" placeholder="请选择容器类型" style="width: 100%">
            <el-option label="250L 容器" value="250L容器" />
            <el-option label="480L 容器" value="480L容器" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标温度" prop="targetTemp">
              <el-input v-model="createForm.targetTemp" placeholder="例如: 180°C" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标压力" prop="targetPressure">
              <el-input v-model="createForm.targetPressure" placeholder="例如: 15MPa" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="保温保压时间" prop="holdTime">
          <el-input v-model="createForm.holdTime" placeholder="例如: 120min" />
        </el-form-item>
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="createForm.applicant" placeholder="申请人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="700px">
      <el-descriptions :column="2" border v-if="currentOrder">
        <el-descriptions-item label="任务单号">{{ currentOrder.taskNumber }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentOrder.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="目标温度(°C)">{{ currentOrder.targetTemp }}</el-descriptions-item>
        <el-descriptions-item label="目标压力(MPa)">{{ currentOrder.targetPressure }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentOrder.status)">{{
            currentOrder.statusText || currentOrder.status
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentOrder.testDate }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentOrder.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"

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

const searchForm = reactive({ taskNumber: "", status: "" })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)

type Row = {
  taskNumber: string
  applicant: string
  deviceName: string
  targetTemp: string
  targetPressure: string
  status: string | number
  statusText?: string
  testDate?: string
  remark?: string
}
const tableData = ref<Row[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  orderNo: '',
  containerType: '250L容器',
  targetTemp: '',
  targetPressure: '',
  holdTime: '',
  applicant: ''
})

const createRules = {
  orderNo: [{ required: true, message: '请确认工单编号', trigger: 'blur' }],
  containerType: [{ required: true, message: '请选择容器类型', trigger: 'change' }],
  targetTemp: [{ required: true, message: '请输入目标温度', trigger: 'blur' }],
  targetPressure: [{ required: true, message: '请输入目标压力', trigger: 'blur' }],
  holdTime: [{ required: true, message: '请输入保温保压时间', trigger: 'blur' }],
  applicant: [{ required: true, message: '请输入申请人', trigger: 'blur' }]
}

const canCreate = computed(() => {
  return !!(
    createForm.containerType &&
    createForm.targetTemp &&
    createForm.targetPressure &&
    createForm.holdTime &&
    createForm.applicant
  )
})

const detailDialogVisible = ref(false)
const currentOrder = ref<Row | null>(null)

const getStatusType = (status: number | string) => {
  const map: Record<string, string> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": "",
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  const key = typeof status === "number" ? String(status) : status
  return map[key] || ""
}

const getList = async () => {
  loading.value = true
  try {
    tableData.value = []
    pagination.total = 0
  } catch (e) {
    ElMessage.error("获取列表失败")
  } finally {
    loading.value = false
  }
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

const showCreateDialog = () => {
  Object.assign(createForm, {
    orderNo: `WO-${new Date().getFullYear()}-005`,
    containerType: '250L容器',
    targetTemp: '',
    targetPressure: '',
    holdTime: '',
    applicant: ''
  })
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      ElMessage.success("创建成功")
      createDialogVisible.value = false
      getList()
    } catch {
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

const handleDetail = (row: Row) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}
const handleDelete = async (row: Row) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    ElMessage.success("删除成功")
    getList()
  } catch {
    ElMessage.error("删除失败")
  }
}

defineExpose({ refresh: getList })
onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
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
</style>
