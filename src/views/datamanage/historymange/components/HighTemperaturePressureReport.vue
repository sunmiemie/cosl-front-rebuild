<template>
  <div class="high-temp-pressure-report">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
        </el-form-item>
        <el-form-item label="测试人员">
          <el-input v-model="searchForm.tester" placeholder="全部人员" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增报告</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="180" align="center" />
          <el-table-column prop="task_number" label="任务单号" width="180" align="center" />
          <el-table-column prop="test_date" label="测试日期" width="170" align="center" />
          <el-table-column prop="tester" label="测试人员" min-width="120" align="center" />
          <el-table-column prop="status_text" label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submit_time" label="提交时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.submit_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="audit_time" label="审核时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.audit_time) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleDetail(row)">详情</el-link>
              <el-link type="warning" @click="handleEdit(row)">编辑</el-link>
              <el-link type="success" @click="handleDownload(row)">下载</el-link>
              <el-link type="danger" @click="handleDelete(row)">删除</el-link>
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

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="报告编号" prop="report_no">
          <el-input v-model="formData.report_no" placeholder="请输入报告编号" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="任务单号" prop="task_number">
          <el-input v-model="formData.task_number" placeholder="请输入任务单号" />
        </el-form-item>
        <el-form-item label="测试日期" prop="test_date">
          <el-date-picker v-model="formData.test_date" type="date" placeholder="请选择测试日期" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="测试人员" prop="tester">
          <el-input v-model="formData.tester" placeholder="请输入测试人员" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status" v-if="formData.id">
          <el-select v-model="formData.status" placeholder="请选择审核状态" style="width: 100%">
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核未通过" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情 对话框 -->
    <el-dialog v-model="detailDialogVisible" title="报告详情" width="700px">
      <el-descriptions :column="2" border v-if="currentReport">
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentReport.status)">{{ currentReport.status_text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Search, Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import {
  getHighTempPressureReportListApi,
  createHighTempPressureReportApi,
  getHighTempPressureReportDetailApi,
  updateHighTempPressureReportApi,
  deleteHighTempPressureReportApi,
  type HighTempPressureReportListItem
} from "@/api/high-temp-pressure-report"

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
const tableData = ref<HighTempPressureReportListItem[]>([])

const detailDialogVisible = ref(false)
const currentReport = ref<HighTempPressureReportListItem | null>(null)

// 新增/编辑 相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? "编辑报告" : "新增报告"))
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
  report_no: [{ required: true, message: "请输入报告编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  test_date: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  tester: [{ required: true, message: "请输入测试人员", trigger: "blur" }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHighTempPressureReportListApi({
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

const handleEdit = (row: HighTempPressureReportListItem) => {
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
        await updateHighTempPressureReportApi(formData.id, payload)
        ElMessage.success("修改成功")
      } else {
        await createHighTempPressureReportApi(payload)
        ElMessage.success("新增成功")
      }
      dialogVisible.value = false
      getList()
    } catch (e: any) {
      console.error("提交报告失败:", e)
      const errorData = e.response?.data
      let errorMsg = "操作失败"
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

const handleDetail = async (row: HighTempPressureReportListItem) => {
  try {
    const res = await getHighTempPressureReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handleDownload = (row: HighTempPressureReportListItem) => {
  const payload = {
    ...row,
    exportedAt: new Date().toISOString()
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${row.report_no}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
  ElMessage.success("下载开始")
}

const handleDelete = async (row: HighTempPressureReportListItem) => {
  await ElMessageBox.confirm("确定要删除该报告吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHighTempPressureReportApi(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return "info"
    case 1:
      return "success"
    case 2:
      return "danger"
    default:
      return ""
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
