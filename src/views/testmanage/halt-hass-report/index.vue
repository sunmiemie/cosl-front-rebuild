<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>HALT-HASS 报告审核</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入工单号" clearable />
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.reviewStatus" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="item in reviewStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="报告ID" width="80" align="center" />
        <el-table-column prop="order" label="工单号" width="180" align="center">
          <template #default="{ row }">
            {{ row.order?.orderNo || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="测试结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)">{{ row.resultText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reviewStatus" label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getReviewStatusType(row.reviewStatus)">{{ row.reviewStatusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="170" align="center" />
        <el-table-column prop="reviewTime" label="审核时间" width="170" align="center">
          <template #default="{ row }">
            {{ row.reviewTime || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="reviewComment" label="审核意见" min-width="200">
          <template #default="{ row }">
            {{ row.reviewComment || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.reviewStatus === 0" link type="success" @click="handleApprove(row)">通过</el-button>
            <el-button v-if="row.reviewStatus === 0" link type="danger" @click="handleReject(row)">打回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="报告详情" width="900px">
      <el-tabs v-model="activeTab" v-if="currentReport">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ currentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ currentReport.order?.orderNo || "-" }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(currentReport.result)">{{ currentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="getReviewStatusType(currentReport.reviewStatus)">{{
                currentReport.reviewStatusText
              }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="电路板组">{{
              currentReport.order?.boardGroup?.name || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="工艺">
              {{ currentReport.order?.process?.name || "-" }}
              <span v-if="currentReport.order?.process?.version">(v{{ currentReport.order.process.version }})</span>
            </el-descriptions-item>
            <el-descriptions-item label="电路板数量">{{ currentReport.order?.boardCount || "-" }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentReport.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ currentReport.reviewTime || "-" }}</el-descriptions-item>
            <el-descriptions-item label="审核意见">{{ currentReport.reviewComment || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 流程图结果 -->
        <el-tab-pane label="流程图结果" name="flowchart">
          <div v-if="currentReport.reportJson?.flowchartResult" class="flowchart-result">
            <el-row :gutter="20" class="summary-row">
              <el-col :span="8">
                <div class="summary-card">
                  <div class="summary-label">总节点数</div>
                  <div class="summary-value">{{ currentReport.reportJson.flowchartResult.totalNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card success">
                  <div class="summary-label">成功节点</div>
                  <div class="summary-value">{{ currentReport.reportJson.flowchartResult.successNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card danger">
                  <div class="summary-label">失败节点</div>
                  <div class="summary-value">{{ currentReport.reportJson.flowchartResult.failedNodes }}</div>
                </div>
              </el-col>
            </el-row>

            <el-table
              :data="currentReport.reportJson.flowchartResult.nodeResults"
              size="small"
              border
              style="margin-top: 20px"
            >
              <el-table-column prop="nodeId" label="节点ID" width="120" />
              <el-table-column prop="nodeName" label="节点名称" min-width="150" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === "success" ? "成功" : "失败" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="error" label="错误信息" min-width="200">
                <template #default="{ row }">
                  <el-text type="danger" v-if="row.error">{{ row.error }}</el-text>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="无流程图结果数据" />
        </el-tab-pane>

        <!-- 电路板信息 -->
        <el-tab-pane label="电路板信息" name="boards">
          <el-table :data="currentReport.reportJson?.boards || []" size="small" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="serial" label="序列号" />
            <el-table-column prop="boardModelName" label="型号">
              <template #default="{ row }">{{ row.boardModelName || "-" }}</template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="测试开始时间">{{
                formatTime(currentReport.reportJson?.startTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="测试结束时间">{{
                formatTime(currentReport.reportJson?.endTime)
              }}</el-descriptions-item>
              <el-descriptions-item label="测试时长">{{
                formatDuration(currentReport.reportJson?.duration)
              }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ currentReport.reportJson?.remark || "-" }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer v-if="currentReport?.reviewStatus === 0">
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject(currentReport!)">打回</el-button>
        <el-button type="success" @click="handleApprove(currentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <!-- 打回对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="打回报告" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="打回理由" required>
          <el-input v-model="rejectForm.reason" type="textarea" rows="4" placeholder="请输入打回理由" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="rejectLoading" @click="confirmReject">确认打回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useUserStore } from "@/store/modules/user"
import {
  getHaltHassReportList,
  getHaltHassReportDetail,
  approveHaltHassReport,
  rejectHaltHassReport
} from "@/api/halt-hass"
import type { HaltHassReportListItem, HaltHassReportDetail } from "@/api/halt-hass/types"

const userStore = useUserStore()

// 审核状态选项
const reviewStatusOptions = [
  { value: "0", label: "待审核" },
  { value: "1", label: "已通过" },
  { value: "2", label: "已打回" }
]

// 搜索表单
const searchForm = reactive({
  orderNo: "",
  reviewStatus: ""
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 数据
const loading = ref(false)
const tableData = ref<HaltHassReportListItem[]>([])

// 详情对话框
const detailDialogVisible = ref(false)
const activeTab = ref("info")
const currentReport = ref<HaltHassReportDetail | null>(null)

// 打回对话框
const rejectDialogVisible = ref(false)
const rejectLoading = ref(false)
const rejectForm = reactive({
  reportId: 0,
  reason: ""
})

// 获取结果类型
const getResultType = (result: number) => {
  const map: Record<number, string> = {
    1: "success",
    2: "danger",
    3: "warning"
  }
  return map[result] || ""
}

// 获取审核状态类型
const getReviewStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: "warning",
    1: "success",
    2: "danger"
  }
  return map[status] || ""
}

// 格式化时间
const formatTime = (time?: string) => {
  if (!time) return "-"
  return time
}

// 格式化时长
const formatDuration = (duration?: number) => {
  if (!duration) return "-"
  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}分${secs}秒`
}

// 获取报告列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getHaltHassReportList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      reviewStatus: searchForm.reviewStatus || undefined
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

// 搜索
const handleSearch = () => {
  pagination.page = 1
  getList()
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ""
  searchForm.reviewStatus = ""
  pagination.page = 1
  getList()
}

// 分页变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getList()
}

// 查看详情
const handleDetail = async (row: HaltHassReportListItem) => {
  try {
    const res = await getHaltHassReportDetail(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      activeTab.value = "info"
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

// 审核通过
const handleApprove = async (row: HaltHassReportListItem | HaltHassReportDetail) => {
  await ElMessageBox.confirm("确定要通过该报告吗？", "确认通过", {
    type: "warning"
  })

  try {
    const res = await approveHaltHassReport(row.id, {
      reviewerId: userStore.userId
    })
    if (res.code === 0) {
      ElMessage.success("审核通过")
      detailDialogVisible.value = false
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  }
}

// 打回
const handleReject = (row: HaltHassReportListItem | HaltHassReportDetail) => {
  rejectForm.reportId = row.id
  rejectForm.reason = ""
  rejectDialogVisible.value = true
}

// 确认打回
const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning("请输入打回理由")
    return
  }

  rejectLoading.value = true
  try {
    const res = await rejectHaltHassReport(rejectForm.reportId, {
      reviewerId: userStore.userId,
      reason: rejectForm.reason
    })
    if (res.code === 0) {
      ElMessage.success("已打回")
      rejectDialogVisible.value = false
      detailDialogVisible.value = false
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  } finally {
    rejectLoading.value = false
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
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.flowchart-result {
  padding: 10px 0;
}

.summary-row {
  margin-bottom: 10px;
}

.summary-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.summary-card.success {
  background: #f0f9eb;
}

.summary-card.danger {
  background: #fef0f0;
}

.summary-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.summary-card.success .summary-value {
  color: #67c23a;
}

.summary-card.danger .summary-value {
  color: #f56c6c;
}
</style>
