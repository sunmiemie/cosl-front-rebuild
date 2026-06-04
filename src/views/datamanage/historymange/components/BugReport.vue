<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { ElButton, ElMessage, type FormInstance, TabsPaneContext } from "element-plus"
import { Refresh, Search } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { getBugReportDataApi, setDownloadSuccessApi } from "@/api/report"
import ProdBoard from "@/views/datamanage/historymange/components/bug_report/ProdBoard.vue"
import TempBoard from "@/views/datamanage/historymange/components/bug_report/TempBoard.vue"
import { downloadFile } from "@/views/datamanage/historymange/components/utils"
import { useRouter } from "vue-router"

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const router = useRouter()

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

const loading = ref(false)

const headers = ref([
  { prop: "report_id", label: "报告编号", align: "center" },
  { prop: "report_name", label: "报告名称", align: "center" },
  { prop: "board_info", label: "电路板", align: "center" },
  { prop: "batch_id", label: "批次号", align: "center" },
  { prop: "user_info", label: "测试人", align: "center" },
  { prop: "created_at", label: "生成时间", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([])

const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  id: "",
  user: "",
  type: "",
  batchId: "",
  serial: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}

// 获取表格数据
const getTableData = () => {
  loading.value = true

  getBugReportDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    id: searchData.id || undefined,
    user: searchData.user || undefined,
    batchId: searchData.batchId || undefined,
    serial: searchData.serial || undefined
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total
    router.push({ query: { ...router.currentRoute.value.query, page: res.data.currentPage } })
    paginationData.currentPage = res.data.currentPage
    loading.value = false
  })
}

// 刷新表格数据
const reloadTableData = () => {
  paginationData.currentPage = 1
  loading.value = true

  getBugReportDataApi({
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize,
    id: undefined,
    user: undefined,
    batchId: undefined,
    serial: undefined
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total

    loading.value = false
  })
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

/**
 * 重置查询条件
 */
const resetSearch = () => {
  clearSearchData()
  handleSearch()
}
// 显式暴露方法供父组件调用
defineExpose({ resetSearch, getTableData })

const selectedRows = ref<any>([])
const selectedRowCount = computed(() => selectedRows.value.length)
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

const dialogVisible = ref(false)
const hideDialog = () => {
  dialogVisible.value = false
}

const activeName = ref<any>("first")
const prodBoardComponent = ref<InstanceType<typeof ProdBoard> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  if (tab.props.name === "first" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab.props.name === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.getTempTreeData()
  }
}

// 新增缺陷报告
const newBugReports = () => {
  dialogVisible.value = true

  if (activeName.value === "first" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (activeName.value === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.getTempTreeData()
  }
}

// 下载单个报告
const downloadReport = async (data: any) => {
  const downloadUrl = `${import.meta.env.VITE_BASE_API}data/report/download-bug-report?id=${data.report_id}`
  const downloadSuccessful = await downloadFile(downloadUrl, data.file_name)

  if (downloadSuccessful) {
    setDownloadSuccessApi(data.report_id, "缺陷报告").then(() => {
      getTableData()
    })
  } else {
    ElMessage.error("下载失败")
  }
}

// 批量下载报告
const downloadReports = async () => {
  const downloadPromises: Promise<void>[] = []

  for (const item of selectedRows.value) {
    const downloadUrl = `${import.meta.env.VITE_BASE_API}data/report/download-bug-report?id=${item.report_id}`
    const downloadPromise = downloadFile(downloadUrl, item.file_name).then(async (downloadSuccessful) => {
      if (downloadSuccessful) {
        await setDownloadSuccessApi(item.report_id, "缺陷报告")
      } else {
        ElMessage.error("下载失败")
      }
    })

    downloadPromises.push(downloadPromise)
  }
  await Promise.all(downloadPromises)
  getTableData()
}

const handleCloseDialog = () => {
  if (activeName.value === "first" && prodBoardComponent.value) {
    prodBoardComponent.value.cancelGenerateReport()
  } else if (activeName.value === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.cancelGenerateReport()
  }
}

onMounted(() => {
  const { page } = router.currentRoute.value.query
  if (page) {
    paginationData.currentPage = Number(page)
  }
  getTableData()
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, {
  immediate: false
})
</script>

<template>
  <el-row>
    <el-col class="affix-container" :span="24">
      <el-affix target=".affix-container" :offset="120">
        <el-card shadow="never" class="search-wrapper">
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <el-form-item label="报告编号">
              <el-input v-model="searchData.id" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="测试人">
              <el-input v-model="searchData.user" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="批次号">
              <el-input v-model="searchData.batchId" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="电路板序列号">
              <el-input v-model="searchData.serial" placeholder="请输入" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch" style="margin-right: 10px">查询</el-button>
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-affix>

      <el-card v-loading="loading" shadow="never">
        <div class="toolbar-wrapper">
          <el-button type="primary" icon="CirclePlus" @click="newBugReports">新增缺陷报告</el-button>
          <div v-show="selectedRowCount > 0" style="display: flex; gap: 10px">
            <el-text class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
            <el-button type="primary" @click="downloadReports">批量下载</el-button>
          </div>
          <div>
            <el-tooltip content="刷新当前页">
              <el-button circle icon="RefreshRight" type="primary" @click="getTableData" />
            </el-tooltip>
          </div>
        </div>
        <div class="table-wrapper">
          <TableComponent
            :tableData="TableData"
            :column-data="headers"
            selection
            @selection-change="handleSelectionChange"
            stripe
          >
            <template #link="{ row }">
              <el-link
                :type="row['report_downloaded'] ? 'success' : 'primary'"
                class="el-link"
                @click="downloadReport(row)"
                >下载
              </el-link>
            </template>
          </TableComponent>
        </div>

        <div class="pager-wrapper">
          <el-pagination
            background
            :layout="paginationData.layout"
            :page-sizes="paginationData.pageSizes"
            :total="paginationData.total"
            :page-size="paginationData.pageSize"
            :currentPage="paginationData.currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 新增缺陷报告 -->
  <el-dialog v-model="dialogVisible" width="85%" @close="handleCloseDialog" align-center :close-on-click-modal="false">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="正式报告" name="first">
        <ProdBoard @close-dialog="hideDialog" @fetch-bug-reports="reloadTableData" ref="prodBoardComponent" />
      </el-tab-pane>
      <el-tab-pane label="临时报告" name="second">
        <TempBoard @close-dialog="hideDialog" @fetch-bug-reports="reloadTableData" ref="tempBoardComponent" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
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
</style>
