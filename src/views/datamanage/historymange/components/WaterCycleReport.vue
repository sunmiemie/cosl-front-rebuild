<!-- 水循环 测试报告 -->

<template>
  <div class="water-cycle-report">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="任务单号">
        <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
      </el-form-item>
      <el-form-item label="测试人员">
        <el-input v-model="searchForm.tester" placeholder="全部人员" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
      <el-table-column prop="reportNo" label="报告编号" width="180" align="center" />
      <el-table-column prop="taskNumber" label="任务单号" width="180" align="center" />
      <el-table-column prop="testDate" label="测试日期" width="170" align="center" />
      <el-table-column prop="tester" label="测试人员" min-width="120" align="center" />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
          <el-link type="success" class="el-link" @click="handleDownload(row)">下载</el-link>
          <el-link type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
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

    <el-dialog v-model="detailDialogVisible" title="报告详情" width="700px">
      <el-descriptions :column="2" border v-if="currentReport">
        <el-descriptions-item label="报告编号">{{ currentReport.reportNo }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.taskNumber }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.testDate }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"

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
type Row = {
  id: number
  reportNo: string
  taskNumber: string
  testDate: string
  tester: string
  status: number
  statusText?: string
  remark?: string
}
const allReports = ref<Row[]>([])
const tableData = ref<Row[]>([])

const detailDialogVisible = ref(false)
const currentReport = ref<Row | null>(null)

const initMockReports = () => {
  if (allReports.value.length) return
  allReports.value = [
    {
      id: 1,
      reportNo: "WC-RPT-20240312-001",
      taskNumber: "TASK-20240312-001",
      testDate: "2024-03-12",
      tester: "张三",
      status: 0,
      statusText: "未发布",
      remark: "演示报告"
    },
    {
      id: 2,
      reportNo: "WC-RPT-20240312-002",
      taskNumber: "TASK-20240312-002",
      testDate: "2024-03-12",
      tester: "李四",
      status: 1,
      statusText: "已发布"
    },
    {
      id: 3,
      reportNo: "WC-RPT-20240312-003",
      taskNumber: "TASK-20240312-003",
      testDate: "2024-03-13",
      tester: "王五",
      status: 0,
      statusText: "未发布",
      remark: "待复核"
    }
  ]
}

const getList = async () => {
  loading.value = true
  try {
    initMockReports()

    let filtered = allReports.value
    if (searchForm.taskNumber) {
      filtered = filtered.filter((r) => r.taskNumber.includes(searchForm.taskNumber))
    }
    if (searchForm.tester) {
      filtered = filtered.filter((r) => r.tester.includes(searchForm.tester))
    }

    pagination.total = filtered.length

    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filtered.slice(start, end)
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

const handleDetail = (row: Row) => {
  currentReport.value = row
  detailDialogVisible.value = true
}

const handleDownload = (row: Row) => {
  const payload = {
    reportNo: row.reportNo,
    taskNumber: row.taskNumber,
    testDate: row.testDate,
    tester: row.tester,
    remark: row.remark || "",
    exportedAt: new Date().toISOString()
  }
  // 模拟下载
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = `${row.reportNo}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(url)
  ElMessage.success("下载开始")
}

const handleDelete = async (row: Row) => {
  await ElMessageBox.confirm("确定要删除该报告吗？", "确认删除", { type: "warning" })
  allReports.value = allReports.value.filter((r) => r.id !== row.id)
  if (currentReport.value?.id === row.id) {
    detailDialogVisible.value = false
    currentReport.value = null
  }
  ElMessage.success("删除成功")
  if ((pagination.page - 1) * pagination.pageSize >= Math.max(0, allReports.value.length)) {
    pagination.page = Math.max(1, pagination.page - 1)
  }
  getList()
}

defineExpose({ resetSearch: handleReset })

onMounted(() => {
  getList()
})
</script>

<style scoped>
.search-form {
  margin-bottom: 12px;
}
.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.el-link {
  margin-right: 8px;
}
</style>
