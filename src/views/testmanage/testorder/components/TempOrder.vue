<!-- 临时测试工单 -->

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox, ElTable, ElTree, type FormInstance, TabsPaneContext } from "element-plus"
import TableComponent from "@/components/Table/index.vue"
import ProdBoard from "@/views/testmanage/testorder/components/temp_order/ProdBoard.vue"
import TempBoard from "@/views/testmanage/testorder/components/temp_order/TempBoard.vue"
import { usePagination } from "@/hooks/usePagination"
import { useUserStore } from "@/store/modules/user"
import { checkPermission } from "@/utils/permission"
import {
  getTempTestMangeTable,
  createDevTestUnitApi,
  publishDevTestUnitApi,
  deleteDevTestUnitApi
} from "@/api/testMangelist"
import { getTestTypeDataApi } from "@/api/testtype"
import { checkReportDataApi, getSingleDevReportDataApi, getSingleReportDataApi } from "@/api/report"

const router = useRouter()
const userStore = useUserStore()
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const reportJson = ref<any>([])
const errorList = ref<any>([])
const errorVisible = ref(false)
const errorLoading = ref(false)
const loading = ref(false)
const showFlags = ref<any>(true)
const testFlags = ref<any>(true)
const tempDialogVisible = ref(false)
const postVisible = ref(false)
const testTypeList = ref<any>([])

interface TableDataType {
  dev_testunit_id?: number
  dev_testunit_name?: string
  user_name?: string
  dev_testunit_starttime?: string
  dev_testunit_endtime?: string
  dev_testunit_status?: string
  process_type?: string
  link?: any
}

const headers = checkPermission(["11"])
  ? ref([
      { prop: "dev_testunit_id", label: "工单号", align: "center" },
      { prop: "order_no", label: "委托单号", align: "center" },
      { prop: "board_name_or_board_model", label: "电路板名称 / 电路板型号", align: "center" },
      { prop: "dev_testunit_name", label: "测试名称", align: "center", width: "160" },
      { prop: "user_name", label: "创建人", align: "center" },
      { prop: "dev_testunit_starttime", label: "创建时间", align: "center" },
      { prop: "dev_testunit_endtime", label: "结束时间", align: "center" },
      { prop: "process_type", label: "测试类型", align: "center" },
      { prop: "dev_testunit_status", label: "测试状态", type: "tag", align: "center" },
      { prop: "link", label: "操作", type: "link" }
    ])
  : ref([
      { prop: "dev_testunit_id", label: "工单号", align: "center" },
      { prop: "order_no", label: "委托单号", align: "center" },
      { prop: "board_name_or_board_model", label: "电路板名称 / 电路板型号", align: "center" },
      { prop: "dev_testunit_name", label: "测试名称", align: "center", width: "160" },
      { prop: "user_name", label: "创建人", align: "center" },
      { prop: "dev_testunit_starttime", label: "创建时间", align: "center" },
      { prop: "dev_testunit_endtime", label: "结束时间", align: "center" },
      { prop: "process_type", label: "测试类型", align: "center" },
      { prop: "dev_testunit_status", label: "测试状态", type: "tag", align: "center" }
    ])

const TableData = ref<Array<TableDataType>>([])

const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  number: "", // 工单号
  TestName: "",
  TestType: "",
  TestStatus: "",
  Daterange: "",
  boardName: "",
  boardModel: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}

const defineLink = (status: any) => {
  switch (status) {
    case "0":
      return { 1: "发布", 2: "删除" }
    case "1":
      return { 1: "详情", 2: "导出工单", 3: "导入报告" }
    case "2":
    case "3":
    case "4":
    case "7":
    case "8":
      return { 1: "详情" }
    case "5":
      return { 1: "详情", 2: "查看报告" }
    case "6":
      return { 1: "详情", 2: "查看报告", 3: "查看缺陷" }
  }
}
const getTableLinkData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].dev_testunit_status)
  }
}

let postFormInfo = reactive({
  dev_testunit_id: "",
  dev_testunit_name: "",
  process_type: "",
  user_name: "",
  dev_testunit_starttime: ""
})
const generateErrorList = (obj, path = []) => {
  let paths = []
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
const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => {
    if (acc && acc[key] !== undefined) {
      return acc[key]
    }
    return undefined
  }, obj)
}
const postOrDelete = ref("发布")
const drawerVisible = ref(false)
// link操作逻辑
const handleLink = (data: any, i: string) => {
  if (i === "发布") {
    postVisible.value = true
    postFormInfo = data
    postOrDelete.value = "发布"
  } else if (i === "删除") {
    postVisible.value = true
    postFormInfo = data
    postOrDelete.value = "删除"
  } else if (i === "详情") {
    detailform.unitId = data.dev_testunit_id
    detailform.unitName = data.dev_testunit_name
    detailform.user = data.user_name
    detailform.startTime = data.dev_testunit_starttime
    detailform.tempBoardId = data.temp_board_id
    detailform.prodBoardId = data.prod_board_id
    detailform.boardSerial = data.sn
    detailform.boardModel = data.prod_board_model_name
    detailform.testType = data.process_type
    detailform.processId = data.process_id
    detailform.processVersion = data.testprocess_version
    detailform.testunitType = data.dev_testunit_type
    detailform.testunitDesc = data.dev_testunit_desc
    detailform.testunitConsignor = data.dev_testunit_consignor
    detailform.tempBoardName = data.temp_board_name
    detailform.orderNo = data.order_no
    detailform.instrument = data.instrument
    detailform.product = data.product

    drawerVisible.value = true
  } else if (i === "导出工单") {
    const link = document.createElement("a")
    link.href = `${import.meta.env.VITE_BASE_API}test/dev-testunit/download/${data.dev_testunit_name}.json?id=${data.dev_testunit_id}`
    link.setAttribute("download", data.testunit_name + ".json")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (i === "查看报告") {
    getSingleDevReportDataApi({ unitId: data["dev_testunit_id"] }).then((res) => {
      router.push({ name: "tempReportView", query: res.data })
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

const handleSearch = async () => {
  // 深拷贝
  const params = JSON.parse(JSON.stringify(searchData))
  // 拼接时间参数
  if (params.Daterange !== "") {
    params.Daterange = params.Daterange.join("-")
  }
  params.currentPage = paginationData.currentPage
  params.pageSize = paginationData.pageSize
  // 调用接口
  const tableResult = await getTempTestMangeTable(params)
  // 赋值
  TableData.value = tableResult.TableData
  paginationData.total = tableResult.total
  getTableLinkData()
}
const resetSearch = () => {
  clearSearchData()
  getMangeData()
}

const detailform = reactive({
  unitId: "",
  unitName: "",
  user: "",
  startTime: "",
  boardModel: "",
  tempBoardId: "",
  prodBoardId: "",
  boardSerial: "",
  testType: "",
  processId: "",
  processVersion: "",
  testunitType: "",
  testunitDesc: "",
  testunitConsignor: "",
  tempBoardName: "",
  orderNo: "",
  instrument: "",
  product: ""
})

// 确认新增
const addOrder = (addProdBoard, selectedRows, orderInfo) => {
  createDevTestUnitApi({
    addProdBoard,
    boardList: selectedRows,
    userId: userStore.userid,
    ...orderInfo
  })
    .then((res) => {
      if (res.status === "exists") {
        ElMessageBox.confirm(res.message, "警告", {
          type: "warning",
          confirmButtonText: "是",
          cancelButtonText: "否"
        }).then(() => {
          createDevTestUnitApi({
            force: true,
            addProdBoard,
            boardList: selectedRows,
            userId: userStore.userid,
            ...orderInfo
          })
            .then(() => {
              tempDialogVisible.value = false
              ElMessage.success("添加成功")
              getMangeData()
              if (addProdBoard) {
                prodBoardComponent.value?.clearOrderInfo()
                prodBoardComponent.value?.clearTableSelection()
              } else {
                tempBoardComponent.value?.clearOrderInfo()
                tempBoardComponent.value?.clearTableSelection()
              }
            })
            .catch((err) => {
              ElMessage.error(err.response.data.errorMessage)
            })
        })
      } else {
        tempDialogVisible.value = false
        ElMessage.success("添加成功")
        getMangeData()
        if (addProdBoard) {
          prodBoardComponent.value?.clearOrderInfo()
          prodBoardComponent.value?.clearTableSelection()
        } else {
          tempBoardComponent.value?.clearOrderInfo()
          tempBoardComponent.value?.clearTableSelection()
        }
      }
    })
    .catch((err) => {
      ElMessage.error(err.response.data.errorMessage)
      // console.error("添加失败", err.response.data.errorMessage)
    })
}

// 测试状态
const TestStatus = reactive([
  { status: 0, mes: "已创建" },
  { status: 1, mes: "待领取" },
  { status: 2, mes: "测试中" },
  { status: 3, mes: "待审核" },
  { status: 4, mes: "待重做" },
  { status: 5, mes: "测试正常" },
  { status: 6, mes: "测试异常" },
  { status: 7, mes: "测试暂存" },
  { status: 8, mes: "疑问待处理" }
])

// 确认发布或删除
const confirm = async (value: string) => {
  if (value === "发布") {
    publishDevTestUnitApi({ id: postFormInfo["dev_testunit_id"] }).then(() => {
      getMangeData()
    })
  } else {
    deleteDevTestUnitApi(postFormInfo["dev_testunit_id"]).then(() => {
      getMangeData()
    })
  }
  postVisible.value = false
}

//  电路板ID和序列号
const boardTableData = ref<any>([])

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
}

const filterText = ref("")
const treeRef = ref<InstanceType<typeof ElTree>>()

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

async function getMangeData() {
  loading.value = true
  const params = JSON.parse(JSON.stringify(searchData))
  // 拼接时间参数
  if (params.Daterange !== "") {
    params.Daterange = params.Daterange.join("-")
  }
  params.currentPage = paginationData.currentPage
  params.pageSize = paginationData.pageSize
  // 调用接口
  const tableResult = await getTempTestMangeTable(params)
  TableData.value = tableResult.TableData
  loading.value = false
  paginationData.total = tableResult.total
  getTableLinkData()
}

// 显式暴露方法供父组件调用
defineExpose({ resetSearch })

const activeName = ref<any>("first")
const prodBoardComponent = ref<InstanceType<typeof ProdBoard> | null>(null)
const tempBoardComponent = ref<InstanceType<typeof TempBoard> | null>(null)

const handleTabClick = (tab: TabsPaneContext) => {
  boardTableData.value = []
  showFlags.value = true
  if (tab.props.name === "first" && prodBoardComponent.value) {
    prodBoardComponent.value.getTreeData()
  } else if (tab.props.name === "second" && tempBoardComponent.value) {
    tempBoardComponent.value.getTempTreeData()
  }
}

const selectedRows = ref<any>([])
const selectedRowCount = computed(() => selectedRows.value.length)
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMangeData, { immediate: true })
</script>

<template>
  <el-card class="search-wrapper" shadow="never">
    <el-form ref="searchFormRef" :inline="true" :model="searchData">
      <el-form-item label="工单号">
        <el-input v-model="searchData.number" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="电路板型号">
        <el-input v-model="searchData.boardModel" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="电路板名称">
        <el-input v-model="searchData.boardName" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="测试名称">
        <el-input v-model="searchData.TestName" placeholder="请输入" />
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
      <el-form-item label="创建时间范围">
        <el-date-picker
          v-model="searchData['Daterange'] as any"
          end-placeholder="结束日期"
          range-separator="至"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY/MM/DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card v-loading="loading" shadow="never">
    <div class="toolbar-wrapper">
      <div style="display: flex; align-items: center; gap: 10px">
        <el-button v-permission="['11']" icon="CirclePlus" type="primary" @click="tempDialogVisible = true">
          新增临时测试工单
        </el-button>
        <div v-show="selectedRowCount > 0">
          <el-text class="mx-1">已选择 {{ selectedRowCount }} 项</el-text>
        </div>
      </div>
      <div>
        <el-tooltip content="刷新当前页">
          <el-button circle icon="RefreshRight" type="primary" @click="getMangeData" />
        </el-tooltip>
      </div>
    </div>
    <div class="table-wrapper">
      <TableComponent :column-data="headers" :tableData="TableData" selection @selection-change="handleSelectionChange" max-height="450" stripe>
        <template #dev_testunit_status="{ row }">
          <el-tag v-if="row['dev_testunit_status'] === '0'" type="success"> 已创建</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '1'" type="warning"> 待领取</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '2'"> 测试中</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '3'" type="warning"> 测试待审核</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '4'" type="danger"> 待重做</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '5'" type="success"> 测试正常</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '6'" type="danger"> 测试异常</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '7'" type="warning"> 测试暂存</el-tag>
          <el-tag v-else-if="row['dev_testunit_status'] === '8'" type="warning"> 疑问待处理</el-tag>
        </template>
        <template v-if="checkPermission(['11'])" #link="{ row }">
          <el-link v-for="i in row['link']" class="el-link" type="primary" @click="handleLink(row, i)" :key="i">
            {{ i }}
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

  <!-- 详情 -->
  <el-drawer v-model="drawerVisible" :append-to-body="true" :with-header="false" size="1000">
    <header class="drawer-head">
      <el-page-header @back="drawerVisible = false">
        <template #content>
          <span class="text-large font-600 mr-3">测试工单详情</span>
        </template>
      </el-page-header>
    </header>
    <el-header style="margin: 20px 0">
      <el-text size="large">测试基本信息</el-text>
      <el-form :inline="true" :model="detailform" class="demo-form-inline" label-position="top" style="margin: 10px">
        <el-form-item label="工单号" style="width: 13%">
          <el-input v-model="detailform.unitId" disabled />
        </el-form-item>
        <el-form-item label="测试名称" style="width: 360px">
          <el-input v-model="detailform.unitName" disabled />
        </el-form-item>
        <el-form-item label="创建人" style="width: 14%">
          <el-input v-model="detailform.user" disabled />
        </el-form-item>
        <el-form-item label="创建时间" style="width: 160px">
          <el-input v-model="detailform.startTime" disabled />
        </el-form-item>
      </el-form>
    </el-header>
    <el-main class="drawer-main">
      <el-text size="large" style="margin-top: 20px">被测电路板信息</el-text>
      <el-row>
        <el-col :span="24">
          <el-card class="info-box" shadow="never" style="margin: 20px 0">
            <el-form :model="detailform" label-position="left" label-width="auto">
              <div v-if="detailform.tempBoardId">
                <el-form-item label="临时电路板 ID">
                  <el-input v-model="detailform.tempBoardId" disabled />
                </el-form-item>
                <el-form-item label="电路板名称">
                  <el-input v-model="detailform.tempBoardName" disabled />
                </el-form-item>
              </div>
              <div v-else>
                <el-form-item label="生产电路板 ID">
                  <el-input v-model="detailform.prodBoardId" disabled />
                </el-form-item>
                <el-form-item label="电路板型号">
                  <el-input v-model="detailform.boardModel" disabled />
                </el-form-item>
              </div>

              <el-form-item label="电路板序列号">
                <el-input v-model="detailform.boardSerial" disabled />
              </el-form-item>
              <el-form-item v-if="detailform.instrument" label="仪器名称">
                <el-input v-model="detailform.instrument" disabled />
              </el-form-item>
              <el-form-item label="所属产品">
                <el-input v-model="detailform.product" disabled />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-footer class="drawer-footer">
      <el-text size="large">其它信息</el-text>
      <el-card class="info-box" shadow="never" style="margin: 20px 0">
        <el-form :model="detailform" label-position="left" label-width="auto">
          <el-form-item label="委托人">
            <el-input v-model="detailform.testunitConsignor" disabled />
          </el-form-item>
          <el-form-item label="委托单号">
            <el-input v-model="detailform.orderNo" disabled />
          </el-form-item>
          <el-form-item label="测试类别">
            <el-input v-model="detailform.testunitType" disabled />
          </el-form-item>
          <el-form-item label="测试内容">
            <el-input type="textarea" v-model="detailform.testunitDesc" disabled />
          </el-form-item>
          <el-form-item label="测试类型">
            <el-input v-model="detailform.testType" disabled />
          </el-form-item>
        </el-form>
      </el-card>
    </el-footer>
  </el-drawer>

  <!-- 新增临时测试 -->
  <el-dialog v-model="tempDialogVisible" width="85%" @close="closeDiaLog" align-center :close-on-click-modal="false">
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane label="生产电路板" name="first">
        <ProdBoard @stop-adding-order="tempDialogVisible = false" @add-order="addOrder" ref="prodBoardComponent" />
      </el-tab-pane>
      <el-tab-pane label="临时电路板" name="second">
        <TempBoard @stop-adding-order="tempDialogVisible = false" @add-order="addOrder" ref="tempBoardComponent" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>

  <!-- 发布 / 删除 -->
  <el-dialog v-model="postVisible" :show-close="true" width="44%">
    <template #header>
      <div class="my-header">
        <h2>{{ postOrDelete }}测试工单</h2>
      </div>
    </template>
    <el-form :inline="true" :model="postFormInfo">
      <el-form-item label="工单号">
        <el-input v-model="postFormInfo['dev_testunit_id']" disabled type="text" />
      </el-form-item>
      <el-form-item label="测试名称">
        <el-input v-model="postFormInfo['dev_testunit_name']" disabled type="text" style="width: 450px" />
      </el-form-item>
      <br />
      <el-form-item label="测试类型">
        <el-input v-model="postFormInfo['process_type']" disabled type="text" />
      </el-form-item>
      <el-form-item label="创建人">
        <el-input v-model="postFormInfo['user_name']" disabled style="width: 100px" type="text" />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-input v-model="postFormInfo['dev_testunit_starttime']" disabled style="width: 180px" type="text" />
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
  margin-top: 40px;
  height: auto;
}

.drawer-footer {
  height: 200px;

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
  margin-right: 8px;
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
