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
        <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增高温箱工单</el-button>
        <el-tooltip content="刷新当前页">
          <el-button type="primary" icon="RefreshRight" circle @click="getList" />
        </el-tooltip>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="taskNumber" label="任务单号" width="180" align="center" />
          <el-table-column prop="testApplicationUnit" label="委托单位" min-width="150" align="center" show-overflow-tooltip />
          <el-table-column prop="projectName" label="项目名称" min-width="160" align="center" show-overflow-tooltip />
          <el-table-column prop="applicant" label="申请人" min-width="110" align="center" />
          <el-table-column prop="specification" label="规格" width="90" align="center" />
          <el-table-column prop="maxTemperature" label="最高温度(°C)" min-width="120" align="center" />
          <el-table-column prop="holdTime" label="保温时间(分)" min-width="120" align="center" />
          <el-table-column prop="humidity" label="湿度(%)" min-width="100" align="center" />
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

    <el-dialog v-model="createDialogVisible" title="创建高温箱工单" width="960px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-divider content-position="left">申请信息</el-divider>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="委托单位" prop="testApplicationUnit">
              <el-input v-model="createForm.testApplicationUnit" placeholder="请输入委托单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请日期" prop="applicationDate">
              <el-date-picker
                v-model="createForm.applicationDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择申请日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人电话" prop="applicantPhone">
              <el-input v-model="createForm.applicantPhone" placeholder="请输入申请人电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">项目信息</el-divider>
        <el-row :gutter="18">
          <el-col :span="8">
            <el-form-item label="科研编号" prop="researchNumber">
              <el-input v-model="createForm.researchNumber" placeholder="请输入科研编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目预算编号" prop="projectBudgetNumber">
              <el-input v-model="createForm.projectBudgetNumber" placeholder="请输入项目预算编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="createForm.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">仪器信息</el-divider>
        <el-row :gutter="18">
          <el-col :span="8">
            <el-form-item label="规格" prop="specification">
              <el-select v-model="createForm.specification" placeholder="请选择规格" style="width: 100%">
                <el-option v-for="item in specificationOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仪器名称" prop="instrumentName">
              <el-input v-model="createForm.instrumentName" placeholder="请输入仪器名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="SN号（多个）" prop="snNumbers">
              <el-input v-model="createForm.snNumbers" placeholder="多个 SN 可用逗号或换行分隔" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">测试参数</el-divider>
        <el-row :gutter="18">
          <el-col :span="6">
            <el-form-item label="最高温度" prop="maxTemperature">
              <el-input-number v-model="createForm.maxTemperature" :min="0" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="斜率" prop="slope">
              <el-input-number v-model="createForm.slope" :precision="2" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="保温时间" prop="holdTime">
              <el-input-number v-model="createForm.holdTime" :min="0" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="湿度" prop="humidity">
              <el-input-number v-model="createForm.humidity" :min="0" :max="100" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDialogVisible" title="工单详情" size="var(--test-order-detail-drawer-size)" class="test-order-detail-drawer">
      <div v-if="currentOrder" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务单号">{{ currentOrder.taskNumber }}</el-descriptions-item>
          <el-descriptions-item label="委托单位">{{ currentOrder.testApplicationUnit || "-" }}</el-descriptions-item>
          <el-descriptions-item label="科研编号">{{ currentOrder.researchNumber || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目预算编号">{{ currentOrder.projectBudgetNumber || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ currentOrder.projectName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请人电话">{{ currentOrder.applicantPhone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentOrder.applicationDate || currentOrder.testDate || "-" }}</el-descriptions-item>
          <el-descriptions-item label="规格">{{ currentOrder.specification || "-" }}</el-descriptions-item>
          <el-descriptions-item label="最高温度">{{ displayWithUnit(currentOrder.maxTemperature, "°C") }}</el-descriptions-item>
          <el-descriptions-item label="斜率">{{ currentOrder.slope ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="保温时间">{{ displayWithUnit(currentOrder.holdTime, "分") }}</el-descriptions-item>
          <el-descriptions-item label="湿度">{{ displayWithUnit(currentOrder.humidity, "%") }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText || currentOrder.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>

        <el-table :data="currentOrder.instruments || []" border stripe class="detail-instrument-table">
          <el-table-column prop="instrumentName" label="仪器名称" min-width="130" />
          <el-table-column prop="snNumbers" label="SN号（多个）" min-width="160" />
          <el-table-column prop="quantity" label="数量" width="76" align="center" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import {
  getHighTemperatureOrderList,
  getHighTemperatureOrderDetail,
  createHighTemperatureOrder,
  publishHighTemperatureOrder,
  deleteHighTemperatureOrder
} from "@/api/high-temperature"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
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

const specificationOptions = ["475", "675", "800", "950"]
const searchForm = reactive({ taskNumber: "", status: "" })
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)
const tableData = ref<HighTemperatureOrderListItem[]>([])
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  testApplicationUnit: "",
  researchNumber: "",
  projectBudgetNumber: "",
  projectName: "",
  applicant: "",
  applicantPhone: "",
  applicationDate: "",
  specification: "",
  instrumentName: "",
  snNumbers: "",
  maxTemperature: undefined as number | undefined,
  slope: undefined as number | undefined,
  holdTime: undefined as number | undefined,
  humidity: undefined as number | undefined,
  remark: ""
})

const createRules = {
  testApplicationUnit: [{ required: true, message: "请输入委托单位", trigger: "blur" }],
  researchNumber: [{ required: true, message: "请输入科研编号", trigger: "blur" }],
  projectBudgetNumber: [{ required: true, message: "请输入项目预算编号", trigger: "blur" }],
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  applicantPhone: [{ required: true, message: "请输入申请人电话", trigger: "blur" }],
  applicationDate: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  specification: [{ required: true, message: "请选择规格", trigger: "change" }],
  instrumentName: [{ required: true, message: "请输入仪器名称", trigger: "blur" }],
  snNumbers: [{ required: true, message: "请输入SN号", trigger: "blur" }],
  maxTemperature: [{ required: true, message: "请输入最高温度", trigger: "change" }],
  slope: [{ required: true, message: "请输入斜率", trigger: "change" }],
  holdTime: [{ required: true, message: "请输入保温时间", trigger: "change" }],
  humidity: [{ required: true, message: "请输入湿度", trigger: "change" }]
}

const canCreate = computed(() => {
  return !!(
    createForm.testApplicationUnit &&
    createForm.researchNumber &&
    createForm.projectBudgetNumber &&
    createForm.projectName &&
    createForm.applicant &&
    createForm.applicantPhone &&
    createForm.applicationDate &&
    createForm.specification &&
    createForm.instrumentName &&
    createForm.snNumbers &&
    createForm.maxTemperature !== undefined &&
    createForm.slope !== undefined &&
    createForm.holdTime !== undefined &&
    createForm.humidity !== undefined
  )
})

const detailDialogVisible = ref(false)
const currentOrder = ref<HighTemperatureOrderDetail | null>(null)
type StatusTagType = "success" | "warning" | "info" | "primary" | "danger"

const displayWithUnit = (value: unknown, unit: string) => {
  if (value === undefined || value === null || value === "") return "-"
  return `${value}${unit}`
}

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

const initSearchFromRoute = () => {
  const { taskNumber, status } = route.query
  searchForm.taskNumber = typeof taskNumber === "string" ? taskNumber : ""
  searchForm.status = typeof status === "string" ? status : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "high-temp"
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
    testApplicationUnit: "",
    researchNumber: "",
    projectBudgetNumber: "",
    projectName: "",
    applicant: "",
    applicantPhone: "",
    applicationDate: new Date().toISOString().split("T")[0],
    specification: "",
    instrumentName: "",
    snNumbers: "",
    maxTemperature: undefined,
    slope: undefined,
    holdTime: undefined,
    humidity: undefined,
    remark: ""
  })
  createDialogVisible.value = true
}

const buildCreatePayload = () => ({
  ...createForm,
  instruments: [
    {
      instrumentName: createForm.instrumentName.trim(),
      snNumbers: createForm.snNumbers.trim(),
      quantity: 1
    }
  ]
})

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      const res = await createHighTemperatureOrder(buildCreatePayload())
      if (res && res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        void taskCenterStore.refresh(true)
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

const handleDelete = async (row: HighTemperatureOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHighTemperatureOrder(row.id)
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
defineExpose({ refresh: getList })

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.page = 1
    getList()
  }
)

onMounted(() => {
  initSearchFromRoute()
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
.detail-instrument-table {
  margin-top: 16px;
}
</style>
