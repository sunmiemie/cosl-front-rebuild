<!-- 水循环 测试报告 -->

<template>
  <div class="vibration-report">
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="工单号">
        <el-input v-model="searchForm.orderNo" placeholder="请输入工单号" clearable />
      </el-form-item>
      <el-form-item label="测试结果">
        <el-input v-model="searchForm.testResult" placeholder="全部结果" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
      <el-table-column prop="reportNo" label="报告编号" width="180" align="center" />
      <el-table-column prop="orderNo" label="工单号" width="180" align="center" />
      <el-table-column prop="testDate" label="测试日期" width="170" align="center" />
      <el-table-column prop="testResult" label="测试结果" min-width="140" align="center">
        <template #default="{ row }">
          <span class="result-badge" :class="getResultBadgeClass(row.testResult)">{{ row.testResult }}</span>
        </template>
      </el-table-column>
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
        <el-descriptions-item label="工单号">{{ currentReport.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.testDate }}</el-descriptions-item>
        <el-descriptions-item label="测试结果">
          <span class="result-badge" :class="getResultBadgeClass(currentReport.testResult)">{{
            currentReport.testResult
          }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"

const searchForm = reactive({
  orderNo: "",
  testResult: ""
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
  orderNo: string
  testDate: string
  testResult: string
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
      reportNo: "VB-RPT-20240312-001",
      orderNo: "VB-20240312-001",
      testDate: "2024-03-12",
      testResult: "通过",
      remark: "演示数据"
    },
    {
      id: 2,
      reportNo: "VB-RPT-20240312-002",
      orderNo: "VB-20240312-002",
      testDate: "2024-03-12",
      testResult: "不通过",
      remark: "频段 80–90Hz 出现超限"
    },
    {
      id: 3,
      reportNo: "VB-RPT-20240313-001",
      orderNo: "VB-20240313-001",
      testDate: "2024-03-13",
      testResult: "通过",
      remark: "复测通过"
    }
  ]
}

const getList = async () => {
  loading.value = true
  try {
    initMockReports()

    let filtered = allReports.value
    if (searchForm.orderNo) {
      filtered = filtered.filter((r) => r.orderNo.includes(searchForm.orderNo))
    }
    if (searchForm.testResult) {
      const keyword = String(searchForm.testResult).trim()
      const exactKeywords = new Set(["通过", "不通过"])
      if (exactKeywords.has(keyword)) {
        filtered = filtered.filter((r) => r.testResult === keyword)
      } else {
        filtered = filtered.filter((r) => r.testResult.includes(keyword))
      }
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

const getResultBadgeClass = (result: string) => {
  if (result === "通过") return "is-pass"
  if (result === "不通过") return "is-fail"
  return ""
}

const handleSearch = () => {
  pagination.page = 1
  getList()
}
const handleReset = () => {
  searchForm.orderNo = ""
  searchForm.testResult = ""
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
    orderNo: row.orderNo,
    testDate: row.testDate,
    testResult: row.testResult,
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
.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  line-height: 18px;
  user-select: none;
}
.result-badge::before {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
}
.result-badge.is-pass {
  color: #2e7d32;
  background: #f0f9eb;
  border-color: #c2e7b0;
}
.result-badge.is-pass::before {
  background: #67c23a;
}
.result-badge.is-fail {
  color: #c62828;
  background: #fef0f0;
  border-color: #fbc4c4;
}
.result-badge.is-fail::before {
  background: #f56c6c;
}
</style>
