<!-- 高温箱 工单 -->

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
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增 高温箱 工单</el-button>
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
          <el-table-column prop="targetTemp" label="目标温度(°C)" min-width="120" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText || row.status }}</el-tag>
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

    <el-dialog v-model="createDialogVisible" title="创建 高温箱 工单" width="700px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试台" prop="testPlatform">
              <el-select v-model="createForm.testPlatform" placeholder="请选择测试台" style="width: 100%">
                <el-option label="高温箱测试台" value="高温箱测试台" />
                <el-option label="高温高压测试台" value="高温高压测试台" />
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
            <el-form-item label="运行时间(min)" prop="runTime">
              <el-input-number v-model="createForm.runTime" placeholder="运行时间" style="width: 100%" />
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

        <el-form-item label="目标温度(°C)" prop="targetTemp">
          <el-input v-model="createForm.targetTemp" />
        </el-form-item>

        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="createForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
          <el-descriptions-item label="任务单号">{{ currentOrder.taskNumber }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentOrder.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="目标温度(°C)">{{ currentOrder.targetTemp }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{
              currentOrder.statusText || currentOrder.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ currentOrder.testDate }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import {
  getHighTemperatureOrderList,
  getHighTemperatureOrderDetail,
  createHighTemperatureOrder,
  publishHighTemperatureOrder,
  deleteHighTemperatureOrder
} from "@/api/high-temperature"
//api接口函数名称
import type { HighTemperatureOrderListItem, HighTemperatureOrderDetail } from "@/api/high-temperature/types"
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

const tableData = ref<HighTemperatureOrderListItem[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  testPlatform: "高温箱测试台",
  testDate: new Date(),
  runTime: 0,
  deviceName: "",
  deviceNumber: "",
  taskNumber: "",
  targetTemp: "",
  applicant: "",
  remark: ""
})

const createRules = {
  testPlatform: [{ required: true, message: "请选择测试台", trigger: "change" }],
  testDate: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  runTime: [{ required: true, message: "请输入运行时间", trigger: "change" }],
  deviceName: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  deviceNumber: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  taskNumber: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  targetTemp: [{ required: true, message: "请输入目标温度", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }]
}

const canCreate = computed(() => {
  return !!(
    createForm.testPlatform &&
    createForm.testDate &&
    createForm.runTime &&
    createForm.deviceName &&
    createForm.deviceNumber &&
    createForm.taskNumber &&
    createForm.targetTemp &&
    createForm.applicant
  )
})

const detailDialogVisible = ref(false)
const currentOrder = ref<HighTemperatureOrderDetail | null>(null)

type StatusTagType = "success" | "warning" | "info" | "primary" | "danger"

const getStatusType = (status: number | string): StatusTagType | undefined => {
  const map: Record<string, StatusTagType | undefined> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": undefined,
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  const key = typeof status === "number" ? String(status) : status
  return map[key]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHighTemperatureOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined
    })
    if (res && res.code === 0 && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res?.msg || "获取列表失败")
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
    testPlatform: "高温箱测试台",
    testDate: new Date(),
    runTime: 0,
    deviceName: "",
    deviceNumber: "",
    taskNumber: "",
    targetTemp: "",
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
      const res = await createHighTemperatureOrder(createForm)
      if (res && res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        getList()
      } else {
        ElMessage.error(res?.msg || "创建失败")
      }
    } catch (e: any) {
      console.error(e)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}
// 查看详情
const handleDetail = async (row: HighTemperatureOrderListItem) => {
  try {
    const res = await getHighTemperatureOrderDetail(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || "获取详情失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handlePublish = async (row: HighTemperatureOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishHighTemperatureOrder(row.id)
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

const handleDelete = async (row: HighTemperatureOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHighTemperatureOrder(row.id)
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

<style scoped>
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
