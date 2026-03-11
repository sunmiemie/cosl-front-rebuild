<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>水循环 工单管理</span>
          <el-button type="primary" @click="showCreateDialog">
            <el-icon><Plus /></el-icon>
            创建工单
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
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

      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
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
            <el-button link type="primary" @click="handleDetail(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

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

    <el-dialog v-model="createDialogVisible" title="创建工单" width="700px">
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
          <el-input v-model="createForm.deviceName" placeholder="如：导向短节" />
        </el-form-item>
        <el-form-item label="设备编号" prop="deviceNumber">
          <el-input v-model="createForm.deviceNumber" placeholder="如：01" />
        </el-form-item>
        <el-form-item label="任务单号" prop="taskNumber">
          <el-input v-model="createForm.taskNumber" placeholder="如：2025521" />
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
        <el-form-item label="备注">
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
        <el-descriptions-item label="任务单号">{{ currentOrder.taskNumber }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentOrder.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="流程长度">{{ currentOrder.flowProcess }}</el-descriptions-item>
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
import { ref, reactive, onMounted, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Plus } from "@element-plus/icons-vue"

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

type OrderRow = {
  id?: number
  taskNumber: string
  applicant: string
  deviceName: string
  flowProcess: string
  status: string | number
  statusText?: string
  testDate?: string
  remark?: string
}
const tableData = ref<OrderRow[]>([])

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

const canCreate = computed(() => {
  return !!(
    createForm.testPlatform &&
    createForm.testDate &&
    createForm.startTime &&
    createForm.endTime &&
    createForm.deviceName &&
    createForm.deviceNumber &&
    createForm.taskNumber &&
    createForm.flowProcess &&
    createForm.applicant
  )
})

const detailDialogVisible = ref(false)
const currentOrder = ref<OrderRow | null>(null)

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

const handleDetail = async (row: OrderRow) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleDelete = async (row: OrderRow) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    ElMessage.success("删除成功")
    getList()
  } catch {
    ElMessage.error("删除失败")
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 12px;
}
.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
