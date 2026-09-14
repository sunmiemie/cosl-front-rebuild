<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  approveHaltHassReport,
  getHaltHassReportDetail,
  getHaltHassReportList,
  rejectHaltHassReport
} from "@/api/halt-hass"
import type { HaltHassReportDetail, HaltHassReportListItem } from "@/api/halt-hass/types"
import HaltHassReportEvidence from "@/components/halt-hass/HaltHassReportEvidence.vue"
import HaltHassReportDownloadButton from "@/components/halt-hass/HaltHassReportDownloadButton.vue"
import { useUserStore } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined

const userStore = useUserStore()
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

const reviewStatusOptions = [
  { value: "0", label: "待审核" },
  { value: "1", label: "已通过" },
  { value: "2", label: "已驳回" }
]

const searchForm = reactive({
  keyword: "",
  reviewStatus: "",
  reportType: "" as "" | "drive_control" | "rectifier_regulator"
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const loading = ref(false)
const tableData = ref<HaltHassReportListItem[]>([])

const detailDialogVisible = ref(false)
const activeTab = ref("info")
const currentReport = ref<HaltHassReportDetail | null>(null)

const rejectDialogVisible = ref(false)
const rejectLoading = ref(false)
const rejectForm = reactive({
  reportId: 0,
  reason: ""
})

const initSearchFromRoute = () => {
  const { orderNo, reviewStatus } = route.query
  searchForm.keyword = typeof orderNo === "string" ? orderNo : ""
  searchForm.reviewStatus = typeof reviewStatus === "string" ? reviewStatus : ""
}

const getResultType = (result: number): TagType => {
  const map: Record<number, TagType> = {
    1: "success",
    2: "danger",
    3: "warning"
  }
  return map[result]
}

const getReviewStatusType = (status: number): TagType => {
  const map: Record<number, TagType> = {
    0: "warning",
    1: "success",
    2: "danger"
  }
  return map[status]
}

const formatTime = (time?: string) => time || "-"

const formatDuration = (duration?: number) => {
  if (!duration) return "-"
  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}分${secs}秒`
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHaltHassReportList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      reportType: searchForm.reportType || undefined,
      reviewStatus: searchForm.reviewStatus || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  searchForm.keyword = ""
  searchForm.reviewStatus = ""
  searchForm.reportType = ""
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

const handleDetail = async (row: HaltHassReportListItem) => {
  try {
    const res = await getHaltHassReportDetail(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      activeTab.value = "info"
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取报告详情失败")
  }
}

const openRouteReportDetail = async () => {
  const reportId = Number(route.query.reportId)
  if (!reportId) return
  try {
    const res = await getHaltHassReportDetail(reportId)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
  }
}

const handleApprove = async (row: HaltHassReportListItem | HaltHassReportDetail) => {
  if (!userStore.userid) return

  await ElMessageBox.confirm("确认通过该报告吗？", "审核通过", {
    type: "warning"
  })

  try {
    const res = await approveHaltHassReport(row.id, {
      reviewerId: userStore.userid
    })
    if (res.code === 0) {
      ElMessage.success("审核通过")
      detailDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("操作失败")
  }
}

const handleReject = (row: HaltHassReportListItem | HaltHassReportDetail) => {
  rejectForm.reportId = row.id
  rejectForm.reason = ""
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!userStore.userid) return
  if (!rejectForm.reason.trim()) {
    ElMessage.warning("请输入驳回原因")
    return
  }

  rejectLoading.value = true
  try {
    const res = await rejectHaltHassReport(rejectForm.reportId, {
      reviewerId: userStore.userid,
      reason: rejectForm.reason
    })
    if (res.code === 0) {
      ElMessage.success("已驳回")
      rejectDialogVisible.value = false
      detailDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("操作失败")
  } finally {
    rejectLoading.value = false
  }
}

onMounted(() => {
  initSearchFromRoute()
  getList()
  void openRouteReportDetail()
})

watch(
  () => route.fullPath,
  () => {
    initSearchFromRoute()
    pagination.page = 1
    getList()
    void openRouteReportDetail()
  }
)
</script>

<template>
  <div class="app-container management-list-page">
    <el-card class="report-list-card" shadow="never">
      <div class="report-list-toolbar">
        <el-form :inline="true" :model="searchForm" class="report-filter-form">
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="报告号/工单号/SN/型号" clearable />
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.reviewStatus" placeholder="全部状态" clearable style="width: 150px">
              <el-option
                v-for="item in reviewStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="报告类型">
            <el-select v-model="searchForm.reportType" placeholder="全部类型" clearable style="width: 150px">
              <el-option label="驱动控制" value="drive_control" />
              <el-option label="整流稳压" value="rectifier_regulator" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="report-toolbar-actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" v-loading="loading" stripe border height="100%" style="width: 100%">
          <el-table-column prop="reportNo" label="报告编号" min-width="154" show-overflow-tooltip />
          <el-table-column label="报告类型" width="104" align="center">
            <template #default="{ row }">{{ row.reportType === "rectifier_regulator" ? "整流稳压" : "驱动控制" }}</template>
          </el-table-column>
          <el-table-column label="工单号" width="180" align="center">
            <template #default="{ row }">
              {{ row.order?.orderNo || "-" }}
            </template>
          </el-table-column>
          <el-table-column prop="serial" label="目标板 SN" min-width="146" show-overflow-tooltip />
          <el-table-column prop="boardModelName" label="板型号" min-width="112" show-overflow-tooltip />
          <el-table-column prop="attemptNo" label="轮次" width="72" align="center" />
          <el-table-column label="测试结果" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getResultType(row.result)">{{ row.resultText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getReviewStatusType(row.reviewStatus)">{{ row.reviewStatusText }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="提交时间" width="170" align="center" />
          <el-table-column label="审核时间" width="170" align="center">
            <template #default="{ row }">
              {{ row.reviewTime || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="审核意见" min-width="200">
            <template #default="{ row }">
              {{ row.reviewComment || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
              <HaltHassReportDownloadButton :report-id="row.id" :report-no="row.reportNo" :report-type="row.reportType" />
              <el-button v-if="row.reviewStatus === 0" link type="success" @click="handleApprove(row)">通过</el-button>
              <el-button v-if="row.reviewStatus === 0" link type="danger" @click="handleReject(row)">驳回</el-button>
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

    <el-dialog v-model="detailDialogVisible" title="报告详情" width="900px">
      <el-tabs v-if="currentReport" v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">{{ currentReport.reportNo || currentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ currentReport.order?.orderNo || "-" }}</el-descriptions-item>
            <el-descriptions-item label="目标板 SN">{{ currentReport.serial || "-" }}</el-descriptions-item>
            <el-descriptions-item label="板型号">{{ currentReport.boardModelName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="测试轮次">第 {{ currentReport.attemptNo }} 轮</el-descriptions-item>
            <el-descriptions-item label="测试场次">{{ currentReport.sessionNo || "-" }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(currentReport.result)">{{ currentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag :type="getReviewStatusType(currentReport.reviewStatus)">
                {{ currentReport.reviewStatusText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="板组">{{ currentReport.order?.boardGroup?.name || "-" }}</el-descriptions-item>
            <el-descriptions-item label="工艺">
              {{ currentReport.order?.process?.name || "-" }}
              <span v-if="currentReport.order?.process?.version">(v{{ currentReport.order.process.version }})</span>
            </el-descriptions-item>
            <el-descriptions-item label="板数量">{{ currentReport.order?.boardCount || "-" }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentReport.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="审核时间">{{ currentReport.reviewTime || "-" }}</el-descriptions-item>
            <el-descriptions-item label="审核意见">{{ currentReport.reviewComment || "-" }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

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
              <el-table-column prop="nodeId" label="节点 ID" width="120" />
              <el-table-column prop="nodeName" label="节点名称" min-width="150" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === "success" ? "成功" : "失败" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="error" label="错误信息" min-width="200">
                <template #default="{ row }">
                  <el-text v-if="row.error" type="danger">{{ row.error }}</el-text>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="无流程图结果数据" />
        </el-tab-pane>

        <el-tab-pane label="板卡信息" name="boards">
          <el-table :data="currentReport.reportJson?.boards || []" size="small" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="serial" label="序列号" />
            <el-table-column prop="boardModelName" label="型号">
              <template #default="{ row }">{{ row.boardModelName || "-" }}</template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="开始时间">
                {{ formatTime(currentReport.reportJson?.startTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="结束时间">
                {{ formatTime(currentReport.reportJson?.endTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="测试时长">
                {{ formatDuration(currentReport.reportJson?.duration) }}
              </el-descriptions-item>
              <el-descriptions-item label="备注">{{ currentReport.reportJson?.remark || "-" }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
        <el-tab-pane label="测试记录与曲线" name="evidence">
          <HaltHassReportEvidence :report-json="currentReport.reportJson" />
        </el-tab-pane>
      </el-tabs>

      <template #footer v-if="currentReport">
        <HaltHassReportDownloadButton :report-id="currentReport.id" :report-no="currentReport.reportNo" :report-type="currentReport.reportType" :link="false" />
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button v-if="currentReport.reviewStatus === 0" type="danger" @click="handleReject(currentReport)">驳回</el-button>
        <el-button v-if="currentReport.reviewStatus === 0" type="success" @click="handleApprove(currentReport)">通过</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="驳回报告" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="驳回原因" required>
          <el-input v-model="rejectForm.reason" type="textarea" :rows="4" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="rejectLoading" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.search-form {
  margin-bottom: 20px;
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
