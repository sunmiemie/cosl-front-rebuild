<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ElButton, ElMessage, type FormInstance } from "element-plus"
import { Refresh, Search } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { generateReportPdfApi, generateFunReportPdfApi, getReportDataApi, setDownloadSuccessApi } from "@/api/report"
import { getTestTypeDataApi } from "@/api/testtype"
import { getAllInstrumentsDataApi } from "@/api/instrument"
import { downloadFile } from "@/views/datamanage/historymange/components/utils"

interface TestCheckType {
  ID?: string
  version?: string
  type?: string
}

const loading = ref(false)

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

const DialogCheck = ref(false)

const TestCheck = ref<TestCheckType>({
  ID: "",
  version: "",
  type: ""
})

const headers = ref([
  { prop: "id", label: "报告编号", align: "center" },
  { prop: "product", label: "产品", align: "center" },
  { prop: "instrument", label: "仪器", align: "center" },
  { prop: "board_model", label: "电路板型号名称", align: "center" },
  { prop: "boardSerial", label: "序列号", align: "center" },
  { prop: "type", label: "报告类型", align: "center" },
  { prop: "user", label: "测试人", align: "center" },
  { prop: "date", label: "生成时间", align: "center" },
  { prop: "status", label: "报告状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

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
const getInstrumentsData = () => {
  getAllInstrumentsDataApi().then((res) => {
    instrumentList.value = res.data
  })
}
const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  id: "",
  user: "",
  type: "",
  serial: "",
  dateTimeRange: "",
  instrument: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const defineLink = (status: string, reportGenerated: number) => {
  switch (status) {
    case "0":
    case "1":
    case "4":
      return { 1: "查看" }
    case "2":
    case "3":
      if (reportGenerated == 0) return { 1: "查看", 2: "生成" }
      else return { 1: "查看", 2: "下载" }
  }
}

const getTableData = () => {
  loading.value = true
  let dateTimeRange
  if (searchData.dateTimeRange !== "") {
    dateTimeRange = searchData.dateTimeRange.join("-")
  }
  getReportDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id || undefined,
    user: searchData.user || undefined,
    type: searchData.type || undefined,
    serial: searchData.serial || undefined,
    dateTimeRange: dateTimeRange || undefined,
    instrument: searchData.instrument || undefined
  }).then((res) => {
    TableData.value = res.data.list
    paginationData.total = res.data.total
    router.replace({ query: { ...router.currentRoute.value.query, page: res.data.currentPage } })
    for (let i = 0; i < TableData.value.length; i++) {
      TableData.value[i].link = defineLink(TableData.value[i].status, TableData.value[i].report_generated)
    }
    loading.value = false
  })
}

const generatingReports = ref({})

const handleLink = async (data: any, i: string) => {
  if (i === "下载") {
    let downloadUrl
    if (data.type !== "功能性测试") {
      downloadUrl = `${import.meta.env.VITE_BASE_API}data/report/pdf/download?id=${data.id}`
    } else {
      downloadUrl = `${import.meta.env.VITE_BASE_API}data/func-report/pdf/download?id=${data.id}`
    }
    const downloadSuccessful = await downloadFile(downloadUrl, data.report_pdf_filepath)

    if (downloadSuccessful) {
      setDownloadSuccessApi(data.id, "正式报告").then(() => {
        getTableData()
      })
    } else {
      ElMessage.error("下载失败")
    }
  } else if (i === "查看") {
    router.push({ name: "reportView", query: data })
  } else if (i === "生成") {
    if (generatingReports.value[data.id]) {
      return
    }

    generatingReports.value[data.id] = true
    if (data.type !== "功能性测试") {
      generateReportPdfApi({ id: data.id })
        .then(() => {
          ElMessage.success("报告生成成功")
          getTableData()
        })
        .catch(() => {
          ElMessage.error("报告生成失败")
        })
        .finally(() => {
          generatingReports.value[data.id] = false
        })
    } else {
      generateFunReportPdfApi({ id: data.id })
        .then(() => {
          ElMessage.success("报告生成成功")
          getTableData()
        })
        .catch(() => {
          ElMessage.error("报告生成失败")
        })
        .finally(() => {
          generatingReports.value[data.id] = false
        })
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
  clearSearchData()
  handleSearch()
}
// 显式暴露方法供父组件调用
defineExpose({ resetSearch })

const selectedRows = ref<any>([])
const selectedRowCount = computed(() => selectedRows.value.length)
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

const generateReports = async () => {
  let generateExists = false
  const generatePromises = []

  selectedRows.value.forEach((item) => {
    // console.log(item)
    for (let key in item.link) {
      if (item.link[key] === "生成") {
        generateExists = true

        let generatePromise
        if (item.type !== "功能性测试") {
          generatePromise = generateReportPdfApi({ id: item.id })
            .then(() => {
              ElMessage.success("报告生成成功")
            })
            .catch(() => {
              ElMessage.error("报告生成失败")
            })
        } else {
          generatePromise = generateFunReportPdfApi({ id: item.id })
            .then(() => {
              ElMessage.success("报告生成成功")
            })
            .catch(() => {
              ElMessage.error("报告生成失败")
            })
        }

        generatePromises.push(generatePromise)
        break
      }
    }
  })

  if (!generateExists) {
    ElMessage.warning("没有需要生成的报告")
  } else {
    await Promise.all(generatePromises)
    getTableData()
  }
}

const downloadReports = async () => {
  let downloadExists = false
  const downloadPromises = []

  for (const item of selectedRows.value) {
    // console.log(item)
    for (const key in item.link) {
      if (item.link[key] === "下载") {
        downloadExists = true

        let downloadUrl
        if (item.type !== "功能性测试") {
          downloadUrl = `${import.meta.env.VITE_BASE_API}data/report/pdf/download?id=${item.id}`
        } else {
          downloadUrl = `${import.meta.env.VITE_BASE_API}data/func-report/pdf/download?id=${item.id}`
        }
        const downloadPromise = await downloadFile(downloadUrl, item.report_pdf_filepath).then(
          async (downloadSuccessful) => {
            if (downloadSuccessful) {
              await setDownloadSuccessApi(item.id, "正式报告")
            } else {
              ElMessage.error("下载失败")
            }
          }
        )

        downloadPromises.push(downloadPromise)
        break
      }
    }
  }

  if (!downloadExists) {
    ElMessage.warning("没有需要下载的报告")
  } else {
    await Promise.all(downloadPromises)
    getTableData()
  }
}

const shortcuts = [
  {
    text: "上周",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: "上个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [start, end]
    }
  },
  {
    text: "过去三个月",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [start, end]
    }
  }
]

const instrumentList = ref<any>([])

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
                <el-option v-for="item in testTypeList" :label="item.name" :value="item.number" :key="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="仪器名称">
              <el-select
                v-model="searchData.instrument"
                filterable
                clearable
                placeholder="请选择"
                style="width: 200px"
                @visible-change="getInstrumentsData"
              >
                <el-option value="general" label="通用" />
                <el-option v-for="item in instrumentList" :key="item.id" :label="item.label" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="生成时间">
              <el-date-picker
                v-model="searchData['dateTimeRange'] as any"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="到"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY/MM/DD HH:mm:ss"
              />
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
          <div v-show="selectedRowCount > 0" style="display: flex; gap: 10px">
            <el-text class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
            <el-button type="warning" @click="generateReports">批量生成</el-button>
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
            <template #status="{ row }">
              <el-tag v-if="row['status'] === '0'" type="warning"> 测试待审核 </el-tag>
              <el-tag v-if="row['status'] === '1'" type="danger"> 已打回 </el-tag>
              <el-tag v-if="row['status'] === '2'" type="success"> 测试正常 </el-tag>
              <el-tag v-if="row['status'] === '3'" type="danger"> 测试异常 </el-tag>
              <el-tag v-if="row['status'] === '4'" type="warning"> 疑问待处理 </el-tag>
            </template>

            <template #link="{ row }">
              <el-link
                v-for="i in row['link']"
                :type="i === '下载' && row['report_downloaded'] ? 'success' : 'primary'"
                class="el-link"
                @click="handleLink(row, i)"
                :key="i"
              >
                {{ i }}
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

            <el-button
              type="primary"
              @click="DialogCheck = false"
              icon="Check"
              style="position: absolute; top: 120px; left: 41%"
              >确认提交</el-button
            >
          </el-form>
        </el-dialog>
      </el-card>
    </el-col>
  </el-row>
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
