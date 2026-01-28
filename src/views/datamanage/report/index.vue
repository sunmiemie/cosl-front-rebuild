<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { type FormInstance, type TabsPaneContext, ElMessage, ElMessageBox } from "element-plus"
import { ElButton } from "element-plus"
import { Refresh, Search, View, Check, Close } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { getReportCheckDataApi } from "@/api/report"
import { getTestTypeDataApi } from "@/api/testtype"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import {
  getHaltHassReportList,
  getHaltHassReportDetail,
  approveHaltHassReport,
  rejectHaltHassReport
} from "@/api/halt-hass"
import type { HaltHassReportListItem, HaltHassReportDetail } from "@/api/halt-hass/types"

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
const DialogCheck = ref(false)

// Tab 切换
const activeTab = ref("normal")

interface TestCheckType {
  ID?: string
  version?: string
  type?: string
}

const TestCheck = ref<TestCheckType>({
  ID: "",
  version: "",
  type: ""
})

// 提交审核
const onSubmit = () => {
  DialogCheck.value = false
}

const headers1 = ref([
  { prop: "report_number", label: "报告编号", align: "center" },
  { prop: "prod_or_temp", label: "报告种类", align: "center" },
  { prop: "product", label: "产品", align: "center" },
  { prop: "instrument", label: "仪器", align: "center" },
  { prop: "model_or_name", label: "电路板型号名称", align: "center" },
  { prop: "boardSerial", label: "序列号", align: "center" },
  { prop: "type", label: "报告类型", align: "center" },
  { prop: "user", label: "测试人", align: "center" },
  { prop: "date", label: "生成时间", align: "center" },
  { prop: "status", label: "报告状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

// Load saved page size from localStorage
const savedPageSize = localStorage.getItem("pageSize")
if (savedPageSize) {
  paginationData.pageSize = parseInt(savedPageSize)
}

// Watch for changes in page size and save to localStorage
watch(
  () => paginationData.pageSize,
  (newSize) => {
    localStorage.setItem("pageSize", newSize.toString())
  }
)

const TableData = ref<any>([])
const testTypeList = ref<any>([])
const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  user: "",
  type: "",
  serial: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "审核" }
  }
}

const userId = useUserStore().userid
const getTableData = () => {
  loading.value = true

  getReportCheckDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    user: searchData.user || undefined,
    type: searchData.type || undefined,
    serial: searchData.serial || undefined,
    userId
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total

    router.replace({ query: { ...router.currentRoute.value.query, page: res.data.currentPage } })

    for (let i = 0; i < TableData.value.length; i++) {
      TableData.value[i].link = defineLink(TableData.value[i].status)
    }
    loading.value = false
  })
}

const handleLink = (data: any, i: string) => {
  if (i === "审核") {
    if (data.prod_or_temp === "正式") {
      if (data.type === "功能性测试") {
        router.push({ name: "checkFunctionalReport", query: data })
      } else {
        router.push({ name: "checkReport", query: data })
      }
    } else {
      router.push({ name: "checkTempReport", query: data })
    }
  }
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

/**
 * 重置查询条件
 */
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
//#endregion

// ==================== HALT-HASS 报告审核相关 ====================

const userStore = useUserStore()

const haltHassLoading = ref(false)
const haltHassTableData = ref<HaltHassReportListItem[]>([])
const haltHassPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// HALT-HASS 搜索
const haltHassSearchData = reactive({
  orderNo: ""
})

// 详情对话框
const haltHassDetailVisible = ref(false)
const haltHassCurrentReport = ref<HaltHassReportDetail | null>(null)
const haltHassActiveTab = ref("info")

// 打回原因对话框
const rejectDialogVisible = ref(false)
const rejectReason = ref("")
const rejectingReportId = ref<number | null>(null)

// 获取 HALT-HASS 待审核报告列表
const getHaltHassTableData = () => {
  haltHassLoading.value = true
  getHaltHassReportList({
    page: haltHassPagination.currentPage,
    pageSize: haltHassPagination.pageSize,
    orderNo: haltHassSearchData.orderNo || undefined,
    reviewStatus: "0" // 只获取待审核状态
  })
    .then((res) => {
      if (res.code === 0) {
        haltHassTableData.value = res.data.list
        haltHassPagination.total = res.data.total
      } else {
        haltHassTableData.value = []
      }
    })
    .catch(() => {
      haltHassTableData.value = []
    })
    .finally(() => {
      haltHassLoading.value = false
    })
}

// HALT-HASS 搜索
const handleHaltHassSearch = () => {
  haltHassPagination.currentPage = 1
  getHaltHassTableData()
}

// HALT-HASS 重置
const resetHaltHassSearch = () => {
  haltHassSearchData.orderNo = ""
  handleHaltHassSearch()
}

// HALT-HASS 分页
const handleHaltHassSizeChange = (size: number) => {
  haltHassPagination.pageSize = size
  haltHassPagination.currentPage = 1
  getHaltHassTableData()
}

const handleHaltHassCurrentChange = (page: number) => {
  haltHassPagination.currentPage = page
  getHaltHassTableData()
}

// 获取结果类型
const getResultType = (result: number) => {
  const map: Record<number, string> = {
    1: "success",
    2: "danger",
    3: "warning"
  }
  return map[result] || ""
}

// 查看 HALT-HASS 报告详情
const handleHaltHassDetail = async (row: HaltHassReportListItem) => {
  try {
    const res = await getHaltHassReportDetail(row.id)
    if (res.code === 0) {
      haltHassCurrentReport.value = res.data
      haltHassActiveTab.value = "info"
      haltHassDetailVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

// 审核通过
const handleApprove = async (report: HaltHassReportDetail | HaltHassReportListItem) => {
  await ElMessageBox.confirm("确定要通过该报告的审核吗？", "确认通过", {
    type: "success"
  })

  try {
    const res = await approveHaltHassReport(report.id, {
      reviewerId: userStore.userId,
      comment: ""
    })
    if (res.code === 0) {
      ElMessage.success("审核通过成功")
      haltHassDetailVisible.value = false
      getHaltHassTableData()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  }
}

// 显示打回对话框
const showRejectDialog = (report: HaltHassReportDetail | HaltHassReportListItem) => {
  rejectingReportId.value = report.id
  rejectReason.value = ""
  rejectDialogVisible.value = true
}

// 审核打回
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning("请填写打回原因")
    return
  }

  try {
    const res = await rejectHaltHassReport(rejectingReportId.value!, {
      reviewerId: userStore.userId,
      reason: rejectReason.value
    })
    if (res.code === 0) {
      ElMessage.success("已打回")
      rejectDialogVisible.value = false
      haltHassDetailVisible.value = false
      getHaltHassTableData()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("操作失败")
  }
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

// Tab 切换处理
const handleTabClick = (tab: TabsPaneContext) => {
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })
  if (tab.props.name === "halt-hass") {
    getHaltHassTableData()
  }
}

onMounted(() => {
  const { page, tab } = router.currentRoute.value.query
  if (tab === "halt-hass") {
    activeTab.value = "halt-hass"
    getHaltHassTableData()
  } else {
    if (page) {
      paginationData.currentPage = Number(page)
    }
    getTableData()
  }
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 普通报告审核 Tab -->
        <el-tab-pane label="普通报告审核" name="normal">
          <el-card v-loading="loading" class="search-wrapper" shadow="never">
            <el-form ref="searchFormRef" :inline="true" :model="searchData">
              <el-form-item label="测试人">
                <el-input v-model="searchData.user" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="电路板序列号">
                <el-input v-model="searchData.serial" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="报告类型">
                <el-select
                  v-model="searchData.type"
                  placeholder="请选择"
                  style="width: 200px"
                  @visible-change="getTestTypeData"
                >
                  <el-option v-for="item in testTypeList" :key="item.id" :label="item.name" :value="item.number" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button :icon="Search" style="margin-right: 10px" type="primary" @click="handleSearch">查询</el-button>
                <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
          <el-card v-loading="loading" shadow="never">
            <div class="toolbar-wrapper">
              <div />
              <div>
                <el-tooltip content="刷新当前页">
                  <el-button circle icon="RefreshRight" type="primary" @click="getTableData" />
                </el-tooltip>
              </div>
            </div>
            <div class="table-wrapper">
              <TableComponent :column-data="headers1" :tableData="TableData" stripe>
                <template #status="{ row }">
                  <el-tag v-if="row['status'] === '0'" type="warning"> 测试待审核</el-tag>
                  <el-tag v-if="row['status'] === '1'" type="danger"> 测试正常</el-tag>
                  <el-tag v-if="row['status'] === '2'" type="danger"> 测试异常</el-tag>
                </template>

                <template #link="{ row }">
                  <el-link v-for="i in row['link']" :key="i" class="el-link" type="primary" @click="handleLink(row, i)"
                    >{{ i }}
                  </el-link>
                </template>
              </TableComponent>
            </div>

            <div class="pager-wrapper">
              <el-pagination
                :currentPage="paginationData.currentPage"
                :layout="paginationData.layout"
                :page-size="paginationData.pageSize"
                :page-sizes="paginationData.pageSizes"
                :total="paginationData.total"
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-tab-pane>

        <!-- HALT-HASS 报告审核 Tab -->
        <el-tab-pane label="HALT-HASS 报告审核" name="halt-hass">
          <el-card v-loading="haltHassLoading" shadow="never">
            <!-- 搜索区域 -->
            <div class="search-wrapper">
              <el-form :inline="true" :model="haltHassSearchData">
                <el-form-item label="工单号">
                  <el-input v-model="haltHassSearchData.orderNo" placeholder="请输入工单号" clearable style="width: 200px" />
                </el-form-item>
                <el-form-item>
                  <el-button :icon="Search" type="primary" @click="handleHaltHassSearch">查询</el-button>
                  <el-button :icon="Refresh" @click="resetHaltHassSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 工具栏 -->
            <div class="toolbar-wrapper">
              <div />
              <div>
                <el-tooltip content="刷新当前页">
                  <el-button type="primary" icon="RefreshRight" circle @click="getHaltHassTableData" />
                </el-tooltip>
              </div>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper">
              <el-table :data="haltHassTableData" stripe border>
                <el-table-column prop="id" label="报告ID" width="80" align="center" />
                <el-table-column prop="order" label="工单号" width="180" align="center">
                  <template #default="{ row }">
                    {{ row.order?.orderNo || '-' }}
                  </template>
                </el-table-column>
                <el-table-column prop="result" label="测试结果" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getResultType(row.result)">{{ row.resultText }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="审核状态" width="100" align="center">
                  <template #default>
                    <el-tag type="warning">待审核</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="提交时间" width="170" align="center" />
                <el-table-column label="操作" width="200" align="center" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link :icon="View" @click="handleHaltHassDetail(row)">详情</el-button>
                    <el-button type="success" link :icon="Check" @click="handleApprove(row)">通过</el-button>
                    <el-button type="danger" link :icon="Close" @click="showRejectDialog(row)">打回</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 分页 -->
            <div class="pager-wrapper">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :page-sizes="[10, 20, 50, 100]"
                :total="haltHassPagination.total"
                :page-size="haltHassPagination.pageSize"
                :current-page="haltHassPagination.currentPage"
                @size-change="handleHaltHassSizeChange"
                @current-change="handleHaltHassCurrentChange"
              />
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 普通工艺审核对话框 -->
    <el-dialog v-model="DialogCheck" :title="'提交测试工艺审核'" style="height: 45vh; width: 40vw">
      <template #header>
        <h2>提交测试工艺审核</h2>
      </template>
      <el-form
        :inline="true"
        :model="TestCheck"
        class="demo-form-inline"
        label-position="right"
        style="position: relative"
      >
        <el-form-item label="工艺ID" style="width: 15vw">
          <el-input v-model="TestCheck.ID" disabled />
        </el-form-item>
        <el-form-item label="工艺版本" style="width: 15vw">
          <el-input v-model="TestCheck.version" disabled />
        </el-form-item>
        <el-form-item label="测试类型">
          <el-input v-model="TestCheck.type" disabled />
        </el-form-item>

        <el-button icon="Check" style="position: absolute; top: 120px; left: 41%" type="primary" @click="onSubmit"
          >确认提交
        </el-button>
      </el-form>
    </el-dialog>

    <!-- HALT-HASS 报告详情对话框 -->
    <el-dialog v-model="haltHassDetailVisible" title="报告审核" width="900px">
      <el-tabs v-model="haltHassActiveTab" v-if="haltHassCurrentReport">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告ID">{{ haltHassCurrentReport.id }}</el-descriptions-item>
            <el-descriptions-item label="工单号">{{ haltHassCurrentReport.order?.orderNo || '-' }}</el-descriptions-item>
            <el-descriptions-item label="测试结果">
              <el-tag :type="getResultType(haltHassCurrentReport.result)">{{ haltHassCurrentReport.resultText }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="审核状态">
              <el-tag type="warning">待审核</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="电路板组">{{ haltHassCurrentReport.order?.boardGroup?.name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工艺">
              {{ haltHassCurrentReport.order?.process?.name || '-' }}
              <span v-if="haltHassCurrentReport.order?.process?.version">(v{{ haltHassCurrentReport.order.process.version }})</span>
            </el-descriptions-item>
            <el-descriptions-item label="电路板数量">{{ haltHassCurrentReport.order?.boardCount || '-' }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ haltHassCurrentReport.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 流程图结果 -->
        <el-tab-pane label="流程图结果" name="flowchart">
          <div v-if="haltHassCurrentReport.reportJson?.flowchartResult" class="flowchart-result">
            <el-row :gutter="20" class="summary-row">
              <el-col :span="8">
                <div class="summary-card">
                  <div class="summary-label">总节点数</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.totalNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card success">
                  <div class="summary-label">成功节点</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.successNodes }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="summary-card danger">
                  <div class="summary-label">失败节点</div>
                  <div class="summary-value">{{ haltHassCurrentReport.reportJson.flowchartResult.failedNodes }}</div>
                </div>
              </el-col>
            </el-row>

            <el-table :data="haltHassCurrentReport.reportJson.flowchartResult.nodeResults" size="small" border style="margin-top: 20px">
              <el-table-column prop="nodeId" label="节点ID" width="120" />
              <el-table-column prop="nodeName" label="节点名称" min-width="150" />
              <el-table-column prop="status" label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
                    {{ row.status === 'success' ? '成功' : '失败' }}
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
          <el-table :data="haltHassCurrentReport.reportJson?.boards || []" size="small" border>
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="serial" label="序列号" />
            <el-table-column prop="boardModelName" label="型号">
              <template #default="{ row }">{{ row.boardModelName || '-' }}</template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="测试开始时间">{{ formatTime(haltHassCurrentReport.reportJson?.startTime) }}</el-descriptions-item>
              <el-descriptions-item label="测试结束时间">{{ formatTime(haltHassCurrentReport.reportJson?.endTime) }}</el-descriptions-item>
              <el-descriptions-item label="测试时长">{{ formatDuration(haltHassCurrentReport.reportJson?.duration) }}</el-descriptions-item>
              <el-descriptions-item label="备注">{{ haltHassCurrentReport.reportJson?.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="haltHassDetailVisible = false">关闭</el-button>
        <el-button type="danger" :icon="Close" @click="showRejectDialog(haltHassCurrentReport!)">打回</el-button>
        <el-button type="success" :icon="Check" @click="handleApprove(haltHassCurrentReport!)">通过</el-button>
      </template>
    </el-dialog>

    <!-- 打回原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="打回报告" width="500px">
      <el-form>
        <el-form-item label="打回原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入打回原因，该原因将发送给测试人员"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReject">确认打回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.drawer-head {
  height: 60px;
}

:deep(.el-upload-dragger) {
  padding: 5px !important;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.flex-card {
  display: flex !important;
  flex-direction: column;
}

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

header {
  width: 100%;
  height: 50px;
}

// 工艺步骤
.process {
  width: 100%;
  height: 300px;
  background-color: #fafafa;
  margin: 20px;
  border-radius: 20px;

  .process-left {
    width: 15%;
    height: 100%;
    background-color: azure;

    .processRight {
      width: 200px;
      height: 200px;
      border: 1px solid #ccc;
    }
  }

  .processRight {
    width: 200px;
    height: 200px;
    border: 1px solid #ccc;
  }
}

:deep(.el-button + .el-button) {
  margin: 0;
}

/* HALT-HASS 报告审核样式 */
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
