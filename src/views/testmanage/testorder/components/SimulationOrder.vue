<!-- 模拟井 测试工单 -->

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
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog"> 新增 模拟井 工单 </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="task_number" label="任务单号" width="180" align="center" />
          <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
          <el-table-column prop="device_name" label="设备名称" min-width="150" align="center" />
          <el-table-column prop="well_depth" label="井深(m)" width="120" align="center" />
          <el-table-column prop="well_temp" label="井温(°C)" width="120" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
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

    <el-dialog v-model="createDialogVisible" title="创建 模拟井 工单" width="800px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试台" prop="test_platform">
              <el-select v-model="createForm.test_platform" placeholder="请选择测试台" style="width: 100%">
                <el-option label="模拟井测试台" value="模拟井测试台" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试日期" prop="test_date">
              <el-date-picker
                v-model="createForm.test_date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备名称" prop="device_name">
          <el-input v-model="createForm.device_name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备编号" prop="device_number">
          <el-input v-model="createForm.device_number" placeholder="请输入设备编号" />
        </el-form-item>
        <el-form-item label="任务单号" prop="task_number">
          <el-input v-model="createForm.task_number" placeholder="请输入任务单号" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="井深(m)" prop="well_depth">
              <el-input-number
                v-model="createForm.well_depth"
                :precision="2"
                :step="0.1"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="井温(°C)" prop="well_temp">
              <el-input-number v-model="createForm.well_temp" :precision="2" :step="0.1" :min="0" style="width: 100%" />
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

    <el-drawer v-model="detailDialogVisible" title="工单详情" size="600px">
      <div v-if="currentOrder" style="padding: 0 20px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务单号">{{ currentOrder.task_number }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status_text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试台">{{ currentOrder.test_platform }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentOrder.device_name }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentOrder.device_number }}</el-descriptions-item>
          <el-descriptions-item label="井深(m)">{{ currentOrder.well_depth }}</el-descriptions-item>
          <el-descriptions-item label="井温(°C)">{{ currentOrder.well_temp }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ currentOrder.test_date }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.created_at }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import {
  getSimulatedWellOrderListApi,
  createSimulatedWellOrderApi,
  getSimulatedWellOrderDetailApi,
  deleteSimulatedWellOrderApi,
  publishSimulatedWellOrderApi
} from "@/api/simulated-well"
import type { SimulatedWellOrderListItem } from "@/api/simulated-well/types"

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
const tableData = ref<SimulatedWellOrderListItem[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  test_platform: "模拟井测试台",
  test_date: new Date().toISOString().split("T")[0],
  device_name: "",
  device_number: "",
  task_number: "",
  well_depth: 0,
  well_temp: 0,
  applicant: "",
  remark: ""
})

const createRules = {
  test_platform: [{ required: true, message: "请选择测试台", trigger: "change" }],
  test_date: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  device_name: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  device_number: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }]
}

const canCreate = computed(() => {
  return !!(createForm.task_number && createForm.device_name && createForm.applicant)
})

const detailDialogVisible = ref(false)
const currentOrder = ref<SimulatedWellOrderListItem | null>(null)

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
  const key = String(status)
  return map[key] || ""
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellOrderListApi({
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
    test_platform: "模拟井测试台",
    test_date: new Date().toISOString().split("T")[0],
    device_name: "",
    device_number: "",
    task_number: "",
    well_depth: 0,
    well_temp: 0,
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
      await createSimulatedWellOrderApi(createForm)
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

const handleDetail = async (row: SimulatedWellOrderListItem) => {
  try {
    const res = await getSimulatedWellOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handlePublish = async (row: SimulatedWellOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishSimulatedWellOrderApi(row.id)
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

const handleDelete = async (row: SimulatedWellOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteSimulatedWellOrderApi(row.id)
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
</style>
