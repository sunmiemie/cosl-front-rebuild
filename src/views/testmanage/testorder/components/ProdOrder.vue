<!-- 生产测试工单 -->

<script lang="ts" setup>
import { reactive, ref, watch, type Ref, computed, h } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox, ElTable, ElTree, type FormInstance } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { useUserStore } from "@/store/modules/user"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import { checkPermission } from "@/utils/permission"
import {
  getTestMangePath,
  getbordsinfo,
  getTestMangeTable,
  createTestUnitApi,
  publicTestUnitApi,
  deleteTestUnitApi,
  postUnits,
  invalidTestUnitApi
} from "@/api/testMangelist"
import { getTestTypeDataApi } from "@/api/testtype"
import { getTestProcessList } from "@/api/addprocess"
import { checkReportDataApi, getSingleReportDataApi } from "@/api/report"
import { Warning } from "@element-plus/icons-vue"

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const taskCenterStore = useTaskCenterStoreHook()
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const reportJson = ref<any>([])
const errorList = ref<any>([])
const errorVisible = ref(false)
const errorLoading = ref(false)
const gettingTestunits = ref(false)
const currentRow = ref<any>()
const showFlags = ref<any>(true)
const testFlags = ref<any>(true)
const dialogVisible = ref(false)
const PublicVisible = ref(false)
const testTypeList = ref<any>([])
const processList = ref<any>([])
const boardInfoLoading = ref(false)

interface TableDataType {
  testunit_id?: number
  testunit_name?: string
  user_name?: string
  testunit_starttime?: string
  testunit_endtime?: string
  testunit_status?: string
  is_scheduled?: boolean
  process_type?: string
  order_no?: string
  link?: any
}

const headers = checkPermission(["11"])
  ? ref([
      { prop: "testunit_id", label: "工单号", align: "center" },
      { prop: "order_no", label: "委托单号", align: "center" },
      { prop: "boardmodel_name", label: "电路板类型", align: "center" },
      { prop: "batch_id", label: "批次号", align: "center" },
      { prop: "board_serial", label: "电路板序列号", align: "center" },
      { prop: "supplier", label: "供应商", align: "center" },
      { prop: "instrument", label: "仪器名称", align: "center" },
      { prop: "product", label: "所属产品", align: "center" },
      { prop: "testunit_name", label: "测试名称", align: "center" },
      { prop: "user_name", label: "创建人", align: "center" },
      { prop: "testunit_starttime", label: "创建时间", align: "center" },
      { prop: "testunit_endtime", label: "结束时间", align: "center" },
      { prop: "process_type", label: "测试类型", align: "center" },
      { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" },
      { prop: "link", label: "操作", type: "link", width: "260", minWidth: 260, align: "center" }
    ])
  : ref([
      { prop: "testunit_id", label: "工单号", align: "center" },
      { prop: "order_no", label: "委托单号", align: "center" },
      { prop: "boardmodel_name", label: "电路板类型", align: "center" },
      { prop: "batch_id", label: "批次号", align: "center" },
      { prop: "board_serial", label: "电路板序列号", align: "center" },
      { prop: "supplier", label: "供应商", align: "center" },
      { prop: "instrument", label: "仪器名称", align: "center" },
      { prop: "product", label: "所属产品", align: "center" },
      { prop: "testunit_name", label: "测试名称", align: "center" },
      { prop: "user_name", label: "创建人", align: "center" },
      { prop: "testunit_starttime", label: "创建时间", align: "center" },
      { prop: "testunit_endtime", label: "结束时间", align: "center" },
      { prop: "process_type", label: "测试类型", align: "center" },
      { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" }
    ])

const addHeaders = ref([
  { prop: "id", label: "电路板 ID", align: "center", width: "150px" },
  { prop: "serial_num", label: "电路板序列号", align: "center", width: "200px" },
  { prop: "available", label: "可选测试", align: "center", type: "btn" }
])

const TableData = ref<Array<TableDataType>>([])

const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  keyword: "",
  TestType: "",
  TestStatus: "",
  Daterange: [] as string[]
})
const clearSearchData = () => {
  searchData.keyword = ""
  searchData.TestType = ""
  searchData.TestStatus = ""
  searchData.Daterange = []
}

const initSearchFromRoute = () => {
  const { id, orderNo, status, taskNumber } = route.query
  searchData.keyword =
    typeof id === "string"
      ? id
      : typeof orderNo === "string"
        ? orderNo
        : typeof taskNumber === "string"
          ? taskNumber
          : ""
  searchData.TestStatus = typeof status === "string" ? status : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "prod"
}

const defineLink = (status: any) => {
  switch (status) {
    // 发布/删除工单需要权限
    case "0":
      return { 1: "发布", 2: "删除", 3: "作废" }
    case "1":
      return { 1: "详情", 2: "导出工单", 3: "导入报告", 4: "作废" }
    case "2":
    case "3":
    case "4":
    case "7":
    case "8":
      return { 1: "详情", 2: "作废" }
    case "5":
      return { 1: "详情", 2: "查看报告", 3: "作废" }
    case "6":
      return { 1: "详情", 2: "查看报告", 3: "查看缺陷", 4: "作废" }
  }
}

let postFormInfo = reactive({
  testunit_id: "",
  testunit_name: "",
  process_type: "",
  user_name: "",
  testunit_starttime: ""
})
type ErrorPath = string[]

const generateErrorList = (obj: any, path: ErrorPath = []): ErrorPath[] => {
  let paths: ErrorPath[] = []
  if (obj === null || typeof obj !== "object") {
    return paths
  }
  if (Object.prototype.hasOwnProperty.call(obj, "errorList")) {
    paths.push([...path, "errorList"])
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "object") {
      paths = paths.concat(generateErrorList(obj[key], [...path, key]))
    }
  }
  return paths
}
const getNestedValue = (obj: any, path: ErrorPath) => {
  return path.reduce((acc, key) => {
    if (acc && acc[key] !== undefined) {
      return acc[key]
    }
    return undefined
  }, obj)
}

const buildReportQuery = (data: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(data || {})
      .filter(([, value]) => value == null || ["string", "number", "boolean"].includes(typeof value))
      .map(([key, value]) => [key, value == null ? "" : String(value)])
  )

const postOrDelete = ref("发布")
const drawerVisible = ref(false)
// link 操作逻辑
const handleLink = (data: any, i: string) => {
  if (i === "发布") {
    PublicVisible.value = true
    postFormInfo = data
    postOrDelete.value = "发布"
  } else if (i === "作废") {
    ElMessageBox.confirm("确定作废这个工单吗？", "警告", {
      type: "warning",
      icon: h(Warning, { style: "color: orange;" }),
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      confirmButtonClass: "el-button--warning",
      cancelButtonClass: "el-button--default"
    }).then(() => {
      invalidTestUnitApi(data["testunit_id"], "prod")
        .then(() => {
          getTestunits()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.error)
        })
    })
  } else if (i === "删除") {
    PublicVisible.value = true
    postFormInfo = data
    postOrDelete.value = "删除"
  } else if (i === "详情") {
    detailform.unitId = data.testunit_id
    detailform.unitName = data.testunit_name
    detailform.user = data.user_name
    detailform.startTime = data.testunit_starttime
    detailform.boardId = data.board_id
    detailform.boardSerial = data.board_serial
    detailform.boardModel = data.boardmodel_name
    detailform.testType = data.process_type
    detailform.processId = data.process_id
    detailform.processVersion = data.testprocess_version
    detailform.instrument = data.instrument
    detailform.product = data.product

    drawerVisible.value = true
  } else if (i === "导出工单") {
    const link = document.createElement("a")
    link.href = `${import.meta.env.VITE_BASE_API}test/testunit/download/${data.testunit_name}.json?id=${data.testunit_id}`
    link.setAttribute("download", data.testunit_name + ".json")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (i === "查看报告") {
    getSingleReportDataApi({ unitId: data["testunit_id"] }).then((res) => {
      router.push({ name: "reportView", query: buildReportQuery(res.data) })
    })
  } else if (i === "查看缺陷") {
    errorVisible.value = true
    errorLoading.value = true
    getSingleReportDataApi({ unitId: data["testunit_id"] }).then((res) => {
      const report_id = res.data["id"]
      checkReportDataApi({ id: report_id }).then((res) => {
        reportJson.value = res.data
        errorList.value = []
        generateErrorList(reportJson.value).forEach((item) => {
          if (item.includes("eyes")) {
            if (item.includes("total")) {
              getNestedValue(reportJson.value, item).forEach((value) => {
                errorList.value.push({ type: "eyes", position: "total", id: value.id, content: value })
              })
            }
            if (item.includes("area")) {
              if (item.includes("general")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "eyes",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "general",
                    id: value.id,
                    content: value
                  })
                })
              }
              if (item.includes("detail")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "eyes",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "detail",
                    detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
                    id: value.id,
                    content: value
                  })
                })
              }
            }
          }
          if (item.includes("eyesBak")) {
            if (item.includes("total")) {
              getNestedValue(reportJson.value, item).forEach((value) => {
                errorList.value.push({ type: "eyesBak", position: "total", id: value.id, content: value })
              })
            }
            if (item.includes("area")) {
              if (item.includes("general")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "eyesBak",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "general",
                    id: value.id,
                    content: value
                  })
                })
              }
              if (item.includes("detail")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "eyesBak",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "detail",
                    detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
                    id: value.id,
                    content: value
                  })
                })
              }
            }
          }
          if (item.includes("xray")) {
            if (item.includes("total")) {
              getNestedValue(reportJson.value, item).forEach((value) => {
                errorList.value.push({ type: "xray", position: "total", id: value.id, content: value })
              })
            }
            if (item.includes("area")) {
              if (item.includes("general")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "xray",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "general",
                    id: value.id,
                    content: value
                  })
                })
              }
              if (item.includes("detail")) {
                getNestedValue(reportJson.value, item).forEach((value) => {
                  errorList.value.push({
                    type: "xray",
                    position: "area",
                    areaId: parseInt(item[item.indexOf("area") + 1]) + 1,
                    areaPosition: "detail",
                    detailId: parseInt(item[item.indexOf("area") + 3]) + 1,
                    id: value.id,
                    content: value
                  })
                })
              }
            }
          }
        })
        errorLoading.value = false
      })
    })
  }
}

const detailform = reactive({
  unitId: "",
  unitName: "",
  user: "",
  startTime: "",
  boardModel: "",
  boardId: "",
  boardSerial: "",
  testType: "",
  processId: "",
  processVersion: "",
  instrument: "",
  product: ""
})

const selectedRows = ref<any>([])
const selectedRowCount = computed(() => selectedRows.value.length)
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

const handleCheckAllChange = (row: any) => {
  row["selectedTest"] = row["checkAll"] ? row["available"] : []
  row["isInd"] = false
}

const handleSelectedTestChange = (row: any) => {
  row["checkAll"] = row["selectedTest"].length === row["available"].length
  row["isInd"] = row["selectedTest"].length > 0 && row["selectedTest"].length < row["available"].length
}

const selectedUnitRows = ref<any>([])
const selectedUnitRowCount = computed(() => selectedUnitRows.value.length)
const handleUnitSelectionChange = (val: any) => {
  selectedUnitRows.value = val
}

// 确认新增
const submitAdd = () => {
  createTestUnitApi({
    boardList: selectedRows.value,
    userId: userStore.userid,
    ...orderInfo
  }).then(() => {
    // getMangeData()
    dialogVisible.value = false
    void taskCenterStore.refresh(true)
    getTestunits()
  })
}
// 测试状态
const TestStatus = [
  { status: 0, mes: "已创建" },
  { status: 1, mes: "待领取" },
  { status: 2, mes: "测试中" },
  { status: 3, mes: "待审核" },
  { status: 4, mes: "待重做" },
  { status: 5, mes: "测试正常" },
  { status: 6, mes: "测试异常" },
  { status: 7, mes: "测试暂存" },
  { status: 8, mes: "疑问待处理" }
]

const testProjectOptions = ["PCBA", "部件类", "连接器及线束线缆", "电子器件"]
const testContentOptions = ["焊接质量", "压接质量", "故障排查", "质量排查"]

// 确认发布或删除
const confirm = async (value: string) => {
  if (value === "发布") {
    publicTestUnitApi({ id: postFormInfo["testunit_id"] }).then(() => {
      void taskCenterStore.refresh(true)
      // getMangeData()
      getTestunits()
    })
  } else {
    deleteTestUnitApi(postFormInfo["testunit_id"]).then(() => {
      void taskCenterStore.refresh(true)
      // getMangeData()
      getTestunits()
    })
  }
  PublicVisible.value = false
}

// 树结构
interface Tree {
  [key: string]: any
}

// 电路板信息 型号和批次ID
const Batch = ref<any>()
const CircuitBatch = ref<any>()
const CircuitBoardModel = ref<any>()
const CircuitBoardModelId = ref<any>()
//  电路板ID和序列号
const boardTableData = ref<any>([])

type NodeData = {
  id: string
}
const clickNode = async (data: NodeData & any, node: any) => {
  // 如果点击的节点有子节点则直接返回
  if (node.data.children) {
    return
  }
  // 点击叶子节点，设置批次ID和型号
  boardInfoLoading.value = true
  currentRow.value = undefined
  selectedRows.value = []
  Batch.value = data.id
  CircuitBatch.value = data.label
  CircuitBoardModel.value = node.parent.data.label
  CircuitBoardModelId.value = node.parent.data.id
  showFlags.value = false
  const result = await getbordsinfo({
    batchId: Batch.value,
    boardModelId: CircuitBoardModelId.value
  })
  boardTableData.value = result.data
  syncSelectedTestsByOrderType()
  boardInfoLoading.value = false
  getTestTypeData()
  getTestProcessList({
    boardModel_id: node.parent.data.id
  }).then((res) => {
    processList.value = res.data
  })
}

const getTestTypeData = () => {
  getTestTypeDataApi({
    currentPage: 1,
    size: 9999999
  }).then((res) => {
    testTypeList.value = res.data.list
  })
}
// 关闭DiaLog
const closeDiaLog = () => {
  showFlags.value = true
  testFlags.value = true
  Object.keys(orderInfo).forEach((key) => (orderInfo[key] = ""))
}

const filterText = ref("")
const treeRef = ref<InstanceType<typeof ElTree>>()

const defaultProps = {
  children: "children",
  label: "label"
}

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const treeData: Ref<any[]> = ref([])
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}
// 新增测试
const addTest = async () => {
  await getTreeData()
  dialogVisible.value = true
}

async function getTreeData() {
  const result = await getTestMangePath()
  treeData.value = result.Pathdata
}

const batchData = reactive({
  boardModel: "",
  batchId: "",
  batchName: ""
})

const getTableLinkData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].testunit_status)
  }
}

const resetSearch = () => {
  clearSearchData()
  if (paginationData.currentPage === 1) {
    getTestunits()
  } else {
    paginationData.currentPage = 1
  }
}
const handleSearch = () => {
  searchData.keyword = searchData.keyword.trim()
  if (paginationData.currentPage === 1) {
    getTestunits()
  } else {
    paginationData.currentPage = 1
  }
}
async function getTestunits() {
  gettingTestunits.value = true

  const params = JSON.parse(JSON.stringify(searchData))
  // 拼接时间参数
  if (params.Daterange.length > 0) {
    params.Daterange = params.Daterange.join("-")
  } else {
    params.Daterange = ""
  }

  params.currentPage = paginationData.currentPage
  params.pageSize = paginationData.pageSize

  const tableResult = await getTestMangeTable(params)
  TableData.value = tableResult.TableData
  getTableLinkData()
  paginationData.total = tableResult.total

  gettingTestunits.value = false
}

const postSelectedUnits = () => {
  const selectedUnitIds = selectedUnitRows.value.map((item) => item.testunit_id)
  postUnits(selectedUnitIds).then(() => {
    ElMessage.success("发布成功")
    void taskCenterStore.refresh(true)
    getTestunits()
  })
}

// 显式暴露方法供父组件调用
defineExpose({ getTestunits })

const orderFormRef = ref<FormInstance | null>(null)
const orderInfo = reactive<any>({
  testType: "",
  testUnitType: "",
  testUnitDesc: "",
  consignor: "",
  orderNo: ""
})

function syncSelectedTestsByOrderType() {
  const selectedType = orderInfo.testType
  boardTableData.value.forEach((row: any) => {
    const available = Array.isArray(row.available) ? row.available : []
    row.selectedTest = selectedType
      ? available.filter((item: any) => String(item.id) === String(selectedType))
      : [...available]
    row.checkAll = available.length > 0 && row.selectedTest.length === available.length
    row.isInd = row.selectedTest.length > 0 && row.selectedTest.length < available.length
  })
}

/** 监听分页参数的变化 */
watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    if (paginationData.currentPage !== 1) {
      paginationData.currentPage = 1
      return
    }
    getTestunits()
  }
)

initSearchFromRoute()
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTestunits, { immediate: true })
</script>

<template>
  <div class="affix-container management-list-shell">
    <el-card v-loading="gettingTestunits" class="management-list-card" shadow="never">
      <div class="management-list-toolbar">
        <el-form ref="searchFormRef" :inline="true" :model="searchData" class="management-filter-form">
          <el-form-item class="management-filter-keyword" label="关键字">
            <el-input
              v-model="searchData.keyword"
              clearable
              placeholder="工单号 / 申请单号 / 批次号 / 序列号 / 供应商 / 测试名称"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="测试类型">
            <el-select
              v-model="searchData.TestType"
              placeholder="请选择"
              style="width: 150px"
              @visible-change="getTestTypeData"
            >
              <el-option v-for="item in testTypeList" :label="item.name" :value="item.number" :key="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="测试状态">
            <el-select v-model="searchData.TestStatus" placeholder="请选择" style="width: 150px">
              <el-option v-for="item in TestStatus" :label="item.mes" :value="item.status" :key="item.status" />
            </el-select>
          </el-form-item>
          <el-form-item class="management-filter-date" label="创建时间范围">
            <el-date-picker
              v-model="searchData.Daterange"
              end-placeholder="结束日期"
              range-separator="至"
              start-placeholder="开始日期"
              type="daterange"
              value-format="YYYY/MM/DD"
            />
          </el-form-item>
        </el-form>
        <div class="management-toolbar-actions">
          <el-button icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <!-- 11 代表“添加测试工单”权限 -->
          <el-button v-permission="['11']" icon="CirclePlus" type="primary" @click="addTest">新增</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
          <el-text class="mx-1">{{ batchData.batchName }}</el-text>
          <div v-show="selectedUnitRowCount > 0" class="management-selection-actions">
            <el-text style="display: inline-block; margin-right: 10px">已选择 {{ selectedUnitRowCount }} 项</el-text>
            <el-button type="warning" @click="postSelectedUnits">批量发布</el-button>
          </div>
          <el-tooltip content="刷新当前页">
            <el-button circle icon="RefreshRight" type="primary" @click="getTestunits" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent
          :column-data="headers"
          :tableData="TableData"
          border
          height="100%"
          selection
          @selection-change="handleUnitSelectionChange"
          stripe
        >
          <template #testunit_status="{ row }">
            <el-tag v-if="row['testunit_status'] === '0'" type="success"> 已创建</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '1' && row['is_scheduled']" type="primary"> 已排程</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '1'" type="warning"> 待领取</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '2'"> 测试中</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '3'" type="warning"> 测试待审核</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '4'" type="danger"> 待重做</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '5'" type="success"> 测试正常</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '6'" type="danger"> 测试异常</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '7'" type="warning"> 测试暂存</el-tag>
            <el-tag v-else-if="row['testunit_status'] === '8'" type="warning"> 疑问待处理</el-tag>
          </template>
          <template #link="{ row }" v-if="checkPermission(['11'])">
            <div class="operation-links">
              <el-link v-for="i in row['link']" class="el-link" type="primary" :key="i" @click="handleLink(row, i)">
                {{ i }}
              </el-link>
            </div>
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
  </div>

  <!-- 详情 -->
  <el-drawer
    v-model="drawerVisible"
    :append-to-body="true"
    :with-header="false"
    size="var(--test-order-detail-drawer-size)"
    class="test-order-detail-drawer"
  >
    <header class="drawer-head">
      <el-page-header @back="drawerVisible = false">
        <template #content>
          <span class="text-large font-600">测试工单详情</span>
        </template>
      </el-page-header>
    </header>
    <el-header class="detail-section detail-header" style="margin: 20px 0 20px 0">
      <el-text size="large">测试基本信息</el-text>
      <el-form
        :inline="true"
        :model="detailform"
        class="demo-form-inline detail-basic-form"
        label-position="top"
        style="margin: 10px 0"
      >
        <el-form-item label="工单号" style="width: 13%">
          <el-input v-model="detailform.unitId" readonly />
        </el-form-item>
        <el-form-item label="测试名称" style="width: 380px">
          <el-input v-model="detailform.unitName" readonly />
        </el-form-item>
        <el-form-item label="创建人" style="width: 14%">
          <el-input v-model="detailform.user" readonly />
        </el-form-item>
        <el-form-item label="创建日期" style="width: 167px">
          <el-input v-model="detailform.startTime" readonly />
        </el-form-item>
      </el-form>
    </el-header>
    <el-main class="drawer-main detail-section">
      <el-text size="large" style="margin-top: 20px">被测电路板信息</el-text>
      <el-row>
        <el-col :span="24">
          <el-card class="info-box" shadow="never" style="margin: 20px 0">
            <el-form :model="detailform" class="detail-info-form" label-position="left" label-width="auto">
              <el-form-item label="电路板 ID">
                <el-input v-model="detailform.boardId" readonly />
              </el-form-item>
              <el-form-item label="电路板序列号">
                <el-input v-model="detailform.boardSerial" readonly />
              </el-form-item>
              <el-form-item label="电路板类型">
                <el-input v-model="detailform.boardModel" readonly />
              </el-form-item>
              <el-form-item v-if="detailform.instrument" label="仪器名称">
                <el-input v-model="detailform.instrument" readonly />
              </el-form-item>
              <el-form-item label="所属产品">
                <el-input v-model="detailform.product" readonly />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-footer class="drawer-footer detail-section">
      <el-text size="large">所选测试工艺信息</el-text>
      <br />
      <!--      <el-button type="primary" style="margin-top: 10px">{{ detailform.testType }}</el-button>-->
      <el-text style="display: inline-block; margin-top: 20px; margin-left: 10px"
        >测试类型：{{ detailform.testType }}</el-text
      >
      <el-card class="info-box" shadow="never" style="margin: 20px 0">
        <span style="margin: 0 20px"
          >使用工艺ID:
          <el-input v-model="detailform.processId" readonly style="width: 150px" />
        </span>
        <span style="margin: 0 20px">
          使用工艺版本:
          <el-input v-model="detailform.processVersion" readonly style="width: 150px" />
        </span>
      </el-card>
    </el-footer>
  </el-drawer>

  <!-- 新增生产测试工单 -->
  <el-dialog
    v-model="dialogVisible"
    width="95%"
    @close="closeDiaLog"
    title="新增生产测试工单"
    align-center
    :close-on-click-modal="false"
  >
    <div>
      <el-row :gutter="20">
        <el-col :span="5">
          <el-card shadow="never" style="height: 100%">
            <template #header>
              <el-input v-model="filterText" placeholder="搜索" />
            </template>
            <el-tree
              ref="treeRef"
              :data="treeData"
              :filter-node-method="filterNode"
              :props="defaultProps"
              default-expand-all
              @node-click="clickNode"
            />
          </el-card>
        </el-col>
        <el-col :span="19">
          <el-card shadow="never">
            <div v-if="showFlags">请先在左侧选择批次</div>
            <div v-else>
              <div class="info-header">
                <el-card shadow="never" style="margin-top: 10px">
                  <el-space :size="10" spacer="|">
                    <el-text>电路板型号：{{ CircuitBoardModel }}</el-text>
                    <el-text>批次号：{{ Batch }}</el-text>
                    <el-text>批次名称：{{ CircuitBatch }}</el-text>
                    <el-text v-if="selectedRowCount > 0" class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
                  </el-space>
                </el-card>
              </div>
              <div>
                <el-row :gutter="20">
                  <el-col :span="15">
                    <div style="margin-top: 10px" v-show="boardInfoLoading">
                      <el-card
                        shadow="never"
                        style="margin-top: 10px; margin-bottom: 10px; height: 200px"
                        v-loading="boardInfoLoading"
                      />
                    </div>
                    <div style="margin-top: 10px" v-show="!boardInfoLoading">
                      <el-card shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                        <div class="table-wrapper">
                          <TableComponent
                            :column-data="addHeaders"
                            :table-data="boardTableData"
                            selection
                            stripe
                            @selection-change="handleSelectionChange"
                          >
                            <template #available="{ row }">
                              <div style="display: flex; align-items: center; justify-content: center">
                                <el-checkbox
                                  :indeterminate="row['isInd']"
                                  v-model="row['checkAll']"
                                  @change="handleCheckAllChange(row)"
                                  >全选</el-checkbox
                                >
                                <el-divider direction="vertical" />
                                <el-checkbox-group v-model="row['selectedTest']">
                                  <el-checkbox
                                    v-for="item in row['available']"
                                    :value="item"
                                    :label="item.name"
                                    :key="item.id"
                                    @change="handleSelectedTestChange(row)"
                                  />
                                </el-checkbox-group>
                              </div>
                            </template>
                          </TableComponent>
                        </div>
                      </el-card>
                    </div>
                  </el-col>
                  <el-col :span="9">
                    <el-card shadow="never" style="margin-top: 10px">
                      <el-form ref="orderFormRef" :model="orderInfo" label-position="left" label-width="auto">
                        <el-form-item label="测试类型">
                          <el-select
                            v-model="orderInfo.testType"
                            placeholder="请选择"
                            clearable
                            filterable
                            @visible-change="getTestTypeData"
                            @change="syncSelectedTestsByOrderType"
                          >
                            <el-option
                              v-for="item in testTypeList"
                              :label="item.name"
                              :value="item.number"
                              :key="item.id"
                            />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="测试项目">
                          <el-select v-model="orderInfo.testUnitType" placeholder="请选择">
                            <el-option v-for="item in testProjectOptions" :key="item" :label="item" :value="item" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="测试内容">
                          <el-select v-model="orderInfo.testUnitDesc" placeholder="请选择">
                            <el-option v-for="item in testContentOptions" :key="item" :label="item" :value="item" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="委托人">
                          <el-input v-model="orderInfo.consignor" placeholder="请输入" />
                        </el-form-item>
                        <el-form-item label="委托单号">
                          <el-input v-model="orderInfo.orderNo" placeholder="请输入" />
                        </el-form-item>
                      </el-form>
                    </el-card>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <template #footer>
      <el-button icon="Check" type="primary" @click="submitAdd" :disabled="selectedRows.length === 0">
        确认新增
      </el-button>
    </template>
  </el-dialog>

  <!-- 发布 删除 -->
  <el-dialog v-model="PublicVisible" :show-close="true" width="44%">
    <template #header>
      <div class="my-header">
        <h2>{{ postOrDelete }}测试工单</h2>
      </div>
    </template>
    <el-form :inline="true" :model="postFormInfo">
      <el-form-item label="工单号">
        <el-input v-model="postFormInfo['testunit_id']" disabled type="text" />
      </el-form-item>
      <el-form-item label="测试名称">
        <el-input v-model="postFormInfo['testunit_name']" disabled type="text" style="width: 350px" />
      </el-form-item>
      <br />
      <el-form-item label="测试类型">
        <el-input v-model="postFormInfo['process_type']" disabled type="text" />
      </el-form-item>
      <el-form-item label="创建人">
        <el-input v-model="postFormInfo['user_name']" disabled style="width: 100px" type="text" />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-input v-model="postFormInfo['testunit_starttime']" disabled style="width: 180px" type="text" />
      </el-form-item>
    </el-form>
    <el-button
      :type="postOrDelete === '发布' ? 'primary' : 'danger'"
      icon="Check"
      size="large"
      style="position: relative; left: 50%; transform: translateX(-50%); width: 170px"
      @click="confirm(postOrDelete)"
      >确认{{ postOrDelete }}
    </el-button>
  </el-dialog>
  <el-dialog v-model="errorVisible" title="查看缺陷" align-center width="80%">
    <el-table :data="errorList" height="700" v-loading="errorLoading">
      <el-table-column label="测试类型">
        <template #default="scope">
          <el-text>
            {{ scope.row.type === "eyes" ? "3D正面测试" : scope.row.type === "eyesBak" ? "3D背面测试" : "X-Ray检测" }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="缺陷位置">
        <template #default="scope">
          <el-text> {{ scope.row.position === "total" ? "整体检测" : "区域检测" }}</el-text>
          <el-text v-if="scope.row.areaId !== undefined"> -第{{ scope.row.areaId }}区域</el-text>
          <el-text v-if="scope.row.areaPosition !== undefined">
            -{{ scope.row.areaPosition === "general" ? "通用检测" : "具体检测" }}
          </el-text>
          <el-text v-if="scope.row.detailId !== undefined"> -第{{ scope.row.detailId }}点位</el-text>
        </template>
      </el-table-column>
      <el-table-column label="检测项">
        <template #default="scope">
          <el-text> {{ scope.row.content.name }}</el-text>
        </template>
      </el-table-column>
      <el-table-column label="缺陷描述">
        <template #default="scope">
          <el-text> {{ scope.row.content.error.desc }}</el-text>
        </template>
      </el-table-column>
      <el-table-column align="center" label="留存图片">
        <template #default="scope">
          <div style="display: flex">
            <el-text style="margin-right: 5px">共{{ scope.row.content.error.url.length }}张</el-text>
            <el-image
              :preview-teleported="true"
              :preview-src-list="scope.row.content.error.url"
              :src="scope.row.content.error.url[0]"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.drawer-main {
  margin-top: 16px;
  height: auto;
}

.detail-section {
  box-sizing: border-box;
  width: 100%;
  height: auto !important;
  min-height: 0;
  padding: 0 20px;
}

.detail-header {
  display: block;
  overflow: visible;
}

.drawer-footer {
  height: auto;
  min-height: 200px;

  .drawer-jiaju {
    border-radius: 10px;
    width: 50vw;
    height: 7vh;
    background-color: #fafafa;
    display: flex;
    justify-content: space-around;
  }

  .drawer-host {
    border-radius: 10px;

    width: 50vw;
    height: 7vh;
    margin-top: 20px;
    background-color: #fafafa;
    display: flex;
    justify-content: space-around;
  }

  .drawer-other {
    border-radius: 10px;

    width: 50vw;
    height: 7vh;
    background-color: #fafafa;
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
  }
}

:deep(.detail-basic-form) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 16px;
}

:deep(.detail-basic-form .el-form-item) {
  width: auto !important;
  min-width: 0;
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.detail-info-form) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px 20px;
}

:deep(.detail-info-form .el-form-item) {
  min-width: 0;
  margin-bottom: 0;
}

:deep(.detail-info-form .el-form-item__content),
:deep(.detail-basic-form .el-form-item__content) {
  min-width: 0;
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-link {
  margin-right: 0;
}

.operation-links {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 4px 8px;
  line-height: 1.4;
}

.head-test {
  display: flex;
  width: 100%;
  margin-bottom: -30px;

  .head-ipt {
    margin: 15px;
    width: 350px;
    height: 40px;
  }
}

.table-wrapper {
  margin-bottom: 20px;
}
</style>
