<!-- 振动台 测试报告 -->

<template>
  <div class="vibration-report">
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
      <el-table-column prop="reportNo" label="报告编号" width="150" align="left" />
      <el-table-column prop="orderNo" label="工单号" width="160" align="left" />
      <el-table-column prop="testDate" label="测试日期" width="160" align="left" />
      <el-table-column prop="result" label="测试结果" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="getResultType(row.result)">{{ row.result || "-" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
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
        <el-descriptions-item label="测试结果"
          ><el-tag :type="getResultType(currentReport.result)">{{
            currentReport.result || "-"
          }}</el-tag></el-descriptions-item
        >
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose } from "vue"
import { ElMessage } from "element-plus"

const searchForm = reactive({ taskNumber: "", tester: "" })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)

type Row = { reportNo: string; orderNo: string; testDate: string; result: string; remark?: string }
const tableData = ref<Row[]>([])
const detailDialogVisible = ref(false)
const currentReport = ref<Row | null>(null)

const getList = async () => {
  loading.value = true
  try {
    tableData.value = []
    pagination.total = 0
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

const getResultType = (val: string | number) => {
  const m: Record<string, string> = { 正常: "success", 异常: "danger", 疑问: "warning" }
  const k = typeof val === "number" ? String(val) : String(val || "")
  return m[k] || "info"
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
</style>
