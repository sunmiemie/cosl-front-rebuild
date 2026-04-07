<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, View, Check, Close } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
import {
  getHaltHassReportList,
  getHaltHassReportDetail,
  approveHaltHassReport,
  rejectHaltHassReport
} from "@/api/halt-hass"
import type { HaltHassReportDetail, HaltHassReportListItem } from "@/api/halt-hass/types"

const userStore = useUserStore()

const loading = ref(false)
const tableData = ref<HaltHassReportListItem[]>([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})
const searchData = reactive({
  orderNo: ""
})

const detailVisible = ref(false)
const currentReport = ref<HaltHassReportDetail | null>(null)
const activeTab = ref("info")

const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingReportId = ref<number | null>(null)

const getResultType = (
  result: number
): "success" | "warning" | "danger" | undefined => {
  const map: Record<number, "success" | "warning" | "danger"> = {
    1: "success",
    2: "danger",
    3: "warning"
  }
  return map[result]
}

const getNodeStatusType = (
  status?: string
): "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "success":
      return "success"
    case "pending":
    case "running":
      return "info"
    case "skipped":
      return "warning"
    default:
      return "danger"
  }
}

const formatTime = (time?: string) => {
  if (!time) return "-"
  return time
}

const formatDuration = (duration?: number) => {
  if (!duration) return "-"
  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}\u5206${secs}\u79D2`
}

const getTableData = () => {
  loading.value = true
  getHaltHassReportList({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
    orderNo: searchData.orderNo || undefined,
    reviewStatus: "0"
  })
    .then((res) => {
      if (res.code === 0) {
        tableData.value = res.data.list
        pagination.total = res.data.total
      } else {
        tableData.value = []
        pagination.total = 0
      }
    })
    .catch(() => {
      tableData.value = []
      pagination.total = 0
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

const resetSearch = () => {
  searchData.orderNo = ""
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  getTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  getTableData()
}

const handleDetail = async (row: HaltHassReportListItem) => {
  try {
    const res = await getHaltHassReportDetail(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      activeTab.value = "info"
      detailVisible.value = true
    } else {
      ElMessage.error(res.msg || "\u83B7\u53D6\u8BE6\u60C5\u5931\u8D25")
    }
  } catch {
    ElMessage.error("\u83B7\u53D6\u8BE6\u60C5\u5931\u8D25")
  }
}

const handleApprove = async (report: HaltHassReportDetail | HaltHassReportListItem) => {
  await ElMessageBox.confirm(
    "\u786E\u5B9A\u8981\u901A\u8FC7\u8BE5\u62A5\u544A\u7684\u5BA1\u6838\u5417\uFF1F",
    "\u786E\u8BA4\u901A\u8FC7",
    { type: "success" }
  )

  const reviewerId = userStore.userid
  if (reviewerId === undefined) {
    ElMessage.error("\u5BA1\u6838\u4EBA\u4FE1\u606F\u7F3A\u5931")
    return
  }

  try {
    const res = await approveHaltHassReport(report.id, {
      reviewerId,
      comment: ""
    })
    if (res.code === 0) {
      ElMessage.success("\u5BA1\u6838\u901A\u8FC7\u6210\u529F")
      detailVisible.value = false
      getTableData()
    } else {
      ElMessage.error(res.msg || "\u64CD\u4F5C\u5931\u8D25")
    }
  } catch {
    ElMessage.error("\u64CD\u4F5C\u5931\u8D25")
  }
}

const showRejectDialog = (report: HaltHassReportDetail | HaltHassReportListItem) => {
  rejectingReportId.value = report.id
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning("\u8BF7\u586B\u5199\u6253\u56DE\u539F\u56E0")
    return
  }

  const reviewerId = userStore.userid
  if (reviewerId === undefined) {
    ElMessage.error("\u5BA1\u6838\u4EBA\u4FE1\u606F\u7F3A\u5931")
    return
  }

  try {
    const res = await rejectHaltHassReport(rejectingReportId.value!, {
      reviewerId,
      reason: rejectReason.value
    })
    if (res.code === 0) {
      ElMessage.success("\u5DF2\u6253\u56DE")
      rejectDialogVisible.value = false
      detailVisible.value = false
      getTableData()
    } else {
      ElMessage.error(res.msg || "\u64CD\u4F5C\u5931\u8D25")
    }
  } catch {
    ElMessage.error("\u64CD\u4F5C\u5931\u8D25")
  }
}

onMounted(() => {
  getTableData()
})

defineExpose({ resetSearch })
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <div class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="&#x5DE5;&#x5355;&#x53F7;">
          <el-input
            v-model="searchData.orderNo"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x5DE5;&#x5355;&#x53F7;"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Search" type="primary" @click="handleSearch">&#x67E5;&#x8BE2;</el-button>
          <el-button :icon="Refresh" @click="resetSearch">&#x91CD;&#x7F6E;</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="toolbar-wrapper">
      <div />
      <div>
        <el-tooltip content="&#x5237;&#x65B0;&#x5F53;&#x524D;&#x9875;">
          <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
        </el-tooltip>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table :data="tableData" stripe border>
        <el-table-column prop="id" label="&#x62A5;&#x544A;ID" width="80" align="center" />
        <el-table-column label="&#x5DE5;&#x5355;&#x53F7;" width="180" align="center">
          <template #default="{ row }">
            {{ row.order?.orderNo || "-" }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="&#x6D4B;&#x8BD5;&#x7ED3;&#x679C;" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)">{{ row.resultText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="&#x5BA1;&#x6838;&#x72B6;&#x6001;" width="100" align="center">
          <template #default>
            <el-tag type="warning">&#x5F85;&#x5BA1;&#x6838;</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="&#x63D0;&#x4EA4;&#x65F6;&#x95F4;" width="170" align="center" />
        <el-table-column label="&#x64CD;&#x4F5C;" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="handleDetail(row)">&#x8BE6;&#x60C5;</el-button>
            <el-button type="success" link :icon="Check" @click="handleApprove(row)">&#x901A;&#x8FC7;</el-button>
            <el-button type="danger" link :icon="Close" @click="showRejectDialog(row)">&#x6253;&#x56DE;</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pager-wrapper">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :current-page="pagination.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog v-model="detailVisible" title="&#x62A5;&#x544A;&#x5BA1;&#x6838;" width="900px">
      <el-tabs v-model="activeTab" v-if="currentReport">
        <el-tab-pane label="&#x57FA;&#x672C;&#x4FE1;&#x606F;" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="&#x62A5;&#x544A;ID">{{ currentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="&#x5DE5;&#x5355;&#x53F7;">
              {{ currentReport.order?.orderNo || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x7ED3;&#x679C;">
              <el-tag :type="getResultType(currentReport.result)">{{ currentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="&#x5BA1;&#x6838;&#x72B6;&#x6001;">
              <el-tag type="warning">&#x5F85;&#x5BA1;&#x6838;</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="&#x7535;&#x8DEF;&#x677F;&#x7EC4;">
              {{ currentReport.order?.boardGroup?.name || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="&#x5DE5;&#x827A;">
              {{ currentReport.order?.process?.name || "-" }}
              <span v-if="currentReport.order?.process?.version">
                (v{{ currentReport.order.process.version }})
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="&#x7535;&#x8DEF;&#x677F;&#x6570;&#x91CF;">
              {{ currentReport.order?.boardCount || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="&#x63D0;&#x4EA4;&#x65F6;&#x95F4;">
              {{ currentReport.createdAt }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="&#x6D41;&#x7A0B;&#x56FE;&#x7ED3;&#x679C;" name="flowchart">
          <div v-if="currentReport.reportJson?.flowchartResult" class="flowchart-result">
            <el-row :gutter="20" class="summary-row">
              <el-col :span="8">
                <div class="summary-card">
                  <div class="summary-label">&#x603B;&#x8282;&#x70B9;&#x6570;</div>
                  <div class="summary-value">{{ currentReport.reportJson.flowchartResult.totalNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card success">
                  <div class="summary-label">&#x6210;&#x529F;&#x8282;&#x70B9;</div>
                  <div class="summary-value">{{ currentReport.reportJson.flowchartResult.successNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card danger">
                  <div class="summary-label">&#x5931;&#x8D25;&#x8282;&#x70B9;</div>
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
              <el-table-column prop="nodeId" label="&#x8282;&#x70B9;ID" width="120" />
              <el-table-column prop="nodeName" label="&#x8282;&#x70B9;&#x540D;&#x79F0;" min-width="150" />
              <el-table-column prop="status" label="&#x72B6;&#x6001;" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getNodeStatusType(row.status)">
                    {{
                      row.status === "success"
                        ? "成功"
                        : row.status === "skipped"
                          ? "跳过"
                          : row.status === "pending" || row.status === "running"
                            ? "进行中"
                            : "失败"
                    }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="error" label="&#x9519;&#x8BEF;&#x4FE1;&#x606F;" min-width="200">
                <template #default="{ row }">
                  <el-text type="danger" v-if="row.error">{{ row.error }}</el-text>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="&#x65E0;&#x6D41;&#x7A0B;&#x56FE;&#x7ED3;&#x679C;&#x6570;&#x636E;" />
        </el-tab-pane>

        <el-tab-pane label="&#x7535;&#x8DEF;&#x677F;&#x4FE1;&#x606F;" name="boards">
          <el-table :data="currentReport.reportJson?.boards || []" size="small" border>
            <el-table-column type="index" label="&#x5E8F;&#x53F7;" width="60" align="center" />
            <el-table-column prop="serial" label="&#x5E8F;&#x5217;&#x53F7;" />
            <el-table-column prop="boardModelName" label="&#x578B;&#x53F7;">
              <template #default="{ row }">{{ row.boardModelName || "-" }}</template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x5F00;&#x59CB;&#x65F6;&#x95F4;">
                {{ formatTime(currentReport.reportJson?.startTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x7ED3;&#x675F;&#x65F6;&#x95F4;">
                {{ formatTime(currentReport.reportJson?.endTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="&#x6D4B;&#x8BD5;&#x65F6;&#x957F;">
                {{ formatDuration(currentReport.reportJson?.duration) }}
              </el-descriptions-item>
              <el-descriptions-item label="&#x5907;&#x6CE8;">
                {{ currentReport.reportJson?.remark || "-" }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="detailVisible = false">&#x5173;&#x95ED;</el-button>
        <el-button type="danger" :icon="Close" @click="showRejectDialog(currentReport!)">
          &#x6253;&#x56DE;
        </el-button>
        <el-button type="success" :icon="Check" @click="handleApprove(currentReport!)">
          &#x901A;&#x8FC7;
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectDialogVisible" title="&#x6253;&#x56DE;&#x62A5;&#x544A;" width="500px">
      <el-form>
        <el-form-item label="&#x6253;&#x56DE;&#x539F;&#x56E0;" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="&#x8BF7;&#x8F93;&#x5165;&#x6253;&#x56DE;&#x539F;&#x56E0;&#xFF0C;&#x8BE5;&#x539F;&#x56E0;&#x5C06;&#x53D1;&#x9001;&#x7ED9;&#x6D4B;&#x8BD5;&#x4EBA;&#x5458;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">&#x53D6;&#x6D88;</el-button>
        <el-button type="danger" @click="handleReject">&#x786E;&#x8BA4;&#x6253;&#x56DE;</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
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
