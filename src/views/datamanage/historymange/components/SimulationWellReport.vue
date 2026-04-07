<template>
  <div class="simulation-well-report">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="&#x4EFB;&#x52A1;&#x5355;&#x53F7;">
          <el-input
            v-model="searchForm.taskNumber"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x4EFB;&#x52A1;&#x5355;&#x53F7;"
            clearable
          />
        </el-form-item>
        <el-form-item label="&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;">
          <el-input
            v-model="searchForm.tester"
            placeholder="&#x5168;&#x90E8;&#x4EBA;&#x5458;"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">&#x641C;&#x7D22;</el-button>
          <el-button icon="Refresh" @click="handleReset">&#x91CD;&#x7F6E;</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" icon="CirclePlus" @click="handleAdd">
            &#x65B0;&#x589E;&#x62A5;&#x544A;
          </el-button>
        </div>
        <div>
          <el-tooltip content="&#x5237;&#x65B0;&#x5F53;&#x524D;&#x9875;">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="report_no" label="&#x62A5;&#x544A;&#x7F16;&#x53F7;" width="180" align="center" />
          <el-table-column prop="task_number" label="&#x4EFB;&#x52A1;&#x5355;&#x53F7;" width="180" align="center" />
          <el-table-column prop="test_date" label="&#x6D4B;&#x8BD5;&#x65E5;&#x671F;" width="170" align="center" />
          <el-table-column prop="tester" label="&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;" min-width="120" align="center" />
          <el-table-column prop="status_text" label="&#x5BA1;&#x6838;&#x72B6;&#x6001;" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submit_time" label="&#x63D0;&#x4EA4;&#x65F6;&#x95F4;" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.submit_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="audit_time" label="&#x5BA1;&#x6838;&#x65F6;&#x95F4;" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.audit_time) }}
            </template>
          </el-table-column>
          <el-table-column label="&#x64CD;&#x4F5C;" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleDetail(row)">&#x8BE6;&#x60C5;</el-link>
              <el-link type="warning" @click="handleEdit(row)">&#x7F16;&#x8F91;</el-link>
              <el-link type="success" @click="handleDownload(row)">&#x4E0B;&#x8F7D;</el-link>
              <el-link type="danger" @click="handleDelete(row)">&#x5220;&#x9664;</el-link>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="&#x62A5;&#x544A;&#x7F16;&#x53F7;" prop="report_no">
          <el-input
            v-model="formData.report_no"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x62A5;&#x544A;&#x7F16;&#x53F7;"
            :disabled="!!formData.id"
          />
        </el-form-item>
        <el-form-item label="&#x4EFB;&#x52A1;&#x5355;&#x53F7;" prop="task_number">
          <el-input
            v-model="formData.task_number"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x4EFB;&#x52A1;&#x5355;&#x53F7;"
          />
        </el-form-item>
        <el-form-item label="&#x6D4B;&#x8BD5;&#x65E5;&#x671F;" prop="test_date">
          <el-date-picker
            v-model="formData.test_date"
            type="date"
            placeholder="&#x8BF7;&#x9009;&#x62E9;&#x6D4B;&#x8BD5;&#x65E5;&#x671F;"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;" prop="tester">
          <el-input
            v-model="formData.tester"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;"
          />
        </el-form-item>
        <el-form-item
          v-if="formData.id"
          label="&#x5BA1;&#x6838;&#x72B6;&#x6001;"
          prop="status"
        >
          <el-select
            v-model="formData.status"
            placeholder="&#x8BF7;&#x9009;&#x62E9;&#x5BA1;&#x6838;&#x72B6;&#x6001;"
            style="width: 100%"
          >
            <el-option label="&#x5F85;&#x5BA1;&#x6838;" :value="0" />
            <el-option label="&#x5BA1;&#x6838;&#x901A;&#x8FC7;" :value="1" />
            <el-option label="&#x5BA1;&#x6838;&#x672A;&#x901A;&#x8FC7;" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="&#x5907;&#x6CE8;" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5907;&#x6CE8;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">&#x53D6;&#x6D88;</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          &#x786E;&#x5B9A;
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="&#x62A5;&#x544A;&#x8BE6;&#x60C5;" width="700px">
      <el-descriptions v-if="currentReport" :column="2" border>
        <el-descriptions-item label="&#x62A5;&#x544A;&#x7F16;&#x53F7;">
          {{ currentReport.report_no }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x4EFB;&#x52A1;&#x5355;&#x53F7;">
          {{ currentReport.task_number }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x65E5;&#x671F;">
          {{ currentReport.test_date }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;">
          {{ currentReport.tester }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x5BA1;&#x6838;&#x72B6;&#x6001;">
          <el-tag :type="getStatusType(currentReport.status)">{{ currentReport.status_text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="&#x63D0;&#x4EA4;&#x65F6;&#x95F4;">
          {{ formatTime(currentReport.submit_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x5BA1;&#x6838;&#x65F6;&#x95F4;">
          {{ formatTime(currentReport.audit_time) }}
        </el-descriptions-item>
        <el-descriptions-item label="&#x5907;&#x6CE8;" :span="2">
          {{ currentReport.remark || "-" }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineExpose, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import {
  createSimulatedWellReportApi,
  deleteSimulatedWellReportApi,
  getSimulatedWellReportDetailApi,
  getSimulatedWellReportListApi,
  updateSimulatedWellReportApi,
  type SimulatedWellReportListItem
} from "@/api/simulated-well-report"

const searchForm = reactive({
  taskNumber: "",
  tester: ""
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const loading = ref(false)
const tableData = ref<SimulatedWellReportListItem[]>([])

const detailDialogVisible = ref(false)
const currentReport = ref<SimulatedWellReportListItem | null>(null)

const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? "\u7F16\u8F91\u62A5\u544A" : "\u65B0\u589E\u62A5\u544A"))
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  report_no: "",
  task_number: "",
  test_date: "",
  tester: "",
  status: 0,
  remark: ""
})

const formRules = {
  report_no: [{ required: true, message: "\u8BF7\u8F93\u5165\u62A5\u544A\u7F16\u53F7", trigger: "blur" }],
  task_number: [{ required: true, message: "\u8BF7\u8F93\u5165\u4EFB\u52A1\u5355\u53F7", trigger: "blur" }],
  test_date: [{ required: true, message: "\u8BF7\u9009\u62E9\u6D4B\u8BD5\u65E5\u671F", trigger: "change" }],
  tester: [{ required: true, message: "\u8BF7\u8F93\u5165\u6D4B\u8BD5\u4EBA\u5458", trigger: "blur" }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellReportListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber,
      tester: searchForm.tester
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("\u83B7\u53D6\u5217\u8868\u5931\u8D25")
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
  searchForm.tester = ""
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

const handleAdd = () => {
  formData.id = undefined
  formData.report_no = ""
  formData.task_number = ""
  formData.test_date = ""
  formData.tester = ""
  formData.status = 0
  formData.remark = ""
  dialogVisible.value = true
}

const handleEdit = (row: SimulatedWellReportListItem) => {
  formData.id = row.id
  formData.report_no = row.report_no
  formData.task_number = row.task_number
  formData.test_date = row.test_date
  formData.tester = row.tester
  formData.status = row.status
  formData.remark = row.remark || ""
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload = { ...formData }
      delete payload.id
      if (formData.id !== undefined) {
        await updateSimulatedWellReportApi(formData.id, payload)
        ElMessage.success("\u4FEE\u6539\u6210\u529F")
      } else {
        await createSimulatedWellReportApi(payload)
        ElMessage.success("\u65B0\u589E\u6210\u529F")
      }
      dialogVisible.value = false
      getList()
    } catch (e: any) {
      console.error("submit simulated well report failed:", e)
      const errorData = e.response?.data
      let errorMsg = "\u64CD\u4F5C\u5931\u8D25"
      if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ")
      } else if (errorData?.msg) {
        errorMsg = errorData.msg
      }
      ElMessage.error(errorMsg)
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDetail = async (row: SimulatedWellReportListItem) => {
  try {
    const res = await getSimulatedWellReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("\u83B7\u53D6\u8BE6\u60C5\u5931\u8D25")
  }
}

const handleDownload = (row: SimulatedWellReportListItem) => {
  const payload = {
    ...row,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8"
  })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${row.report_no}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
  ElMessage.success("\u4E0B\u8F7D\u5F00\u59CB")
}

const handleDelete = async (row: SimulatedWellReportListItem) => {
  await ElMessageBox.confirm(
    "\u786E\u5B9A\u8981\u5220\u9664\u8BE5\u62A5\u544A\u5417\uFF1F",
    "\u786E\u8BA4\u5220\u9664",
    { type: "warning" }
  )
  try {
    const res = await deleteSimulatedWellReportApi(row.id)
    if (res.code === 0) {
      ElMessage.success("\u5220\u9664\u6210\u529F")
      getList()
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("\u5220\u9664\u5931\u8D25")
  }
}

const getStatusType = (status: number): "info" | "success" | "danger" | undefined => {
  switch (status) {
    case 0:
      return "info"
    case 1:
      return "success"
    case 2:
      return "danger"
    default:
      return undefined
  }
}

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-"
  const date = new Date(timeStr)
  return date.toLocaleString()
}

defineExpose({ resetSearch: handleReset })

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
