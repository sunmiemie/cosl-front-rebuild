<!-- 生产测试工单 -->

<script lang="ts" setup>
import { reactive, ref, watch, type Ref } from "vue"
import { ElScrollbar, ElTable, ElTree, type FormInstance } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { useRouter } from "vue-router"
import {
  getTestMangePath,
  getbordsinfo,
  getTestMangeTable,
  createTestUnitApi,
  publicTestUnitApi,
  deleteTestUnitApi
} from "@/api/testMangelist"
import { getTestTypeDataApi } from "@/api/testtype"
import { getTestProcessList } from "@/api/addprocess"
import { useUserStore } from "@/store/modules/user"
import { checkReportDataApi, getSingleReportDataApi } from "@/api/report"
import { checkPermission } from "@/utils/permission"

const router = useRouter()
const userStore = useUserStore()
const reportJson = ref<any>([])
const errorList = ref<any>([])
const errorVisible = ref<boolean>(false)
const errorLoading = ref<boolean>(false)
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const currentRow = ref<any>()
const showFlags = ref<any>(true)
const testFlags = ref<any>(true)
const dialogVisible = ref<boolean>(false)
const PublicVisible = ref<boolean>(false)
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
  process_type?: string
  link?: any
}

const headers = checkPermission(['admin']) ?
  ref([
    { prop: "testunit_id", label: "工单号", align: "center" },
    { prop: "testunit_name", label: "测试名称", align: "center" },
    { prop: "user_name", label: "创建人", align: "center" },
    { prop: "testunit_starttime", label: "创建时间", align: "center" },
    { prop: "testunit_endtime", label: "结束时间", align: "center" },
    { prop: "process_type", label: "测试类型", align: "center" },
    { prop: "process_id", label: "使用工艺ID", align: "center" },
    { prop: "testprocess_version", label: "使用工艺版本", align: "center" },
    { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" },
    { prop: "link", label: "操作", type: "link" }
  ]) :
  ref([
    { prop: "testunit_id", label: "工单号", align: "center" },
    { prop: "testunit_name", label: "测试名称", align: "center" },
    { prop: "user_name", label: "创建人", align: "center" },
    { prop: "testunit_starttime", label: "创建时间", align: "center" },
    { prop: "testunit_endtime", label: "结束时间", align: "center" },
    { prop: "process_type", label: "测试类型", align: "center" },
    { prop: "process_id", label: "使用工艺ID", align: "center" },
    { prop: "testprocess_version", label: "使用工艺版本", align: "center" },
    { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" }
  ]);
const selectedRows = ref<any>([])
const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center", width: "150px" },
  { prop: "serial_num", label: "电路板序列号", align: "center", width: "200px" },
  { prop: "available", label: "可选测试", align: "center", type: "btn" }
])
const TableData = ref<Array<TableDataType>>([])

const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  number: "",
  TestName: "",
  TestType: "",
  TestStatus: "",
  Daterange: ""
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
      return { 1: "详情" }
    case "3":
      return { 1: "详情" }
    case "4":
      return { 1: "详情" }
    case "5":
      return { 1: "详情", 2: "查看报告" }
    case "6":
      return { 1: "详情", 2: "查看报告", 3: "查看缺陷" }
    case "7":
      return { 1: "详情" }
    case "8":
      return { 1: "详情" }
  }
}
const getTableData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].testunit_status)
  }
}

let PublicFormInfo = reactive({
  testunit_id: "",
  testunit_name: "",
  process_type: "",
  user_name: "",
  testunit_starttime: ""
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
const PublicOrDelete = ref<string>("发布")

const drawer: Ref<boolean> = ref(false)
// link操作逻辑
const handleLink = (data: any, i: string) => {
  if (i === "发布") {
    PublicVisible.value = true
    PublicFormInfo = data
    PublicOrDelete.value = "发布"
  } else if (i == "删除") {
    PublicVisible.value = true
    PublicFormInfo = data
    PublicOrDelete.value = "删除"
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
    drawer.value = true
  } else if (i === "导出工单") {
    const link = document.createElement("a")
    link.href = `${import.meta.env.VITE_BASE_API}test/testunit/download/${data.testunit_name}.json?id=${data.testunit_id}`
    link.setAttribute("download", data.testunit_name + ".json")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (i === "查看报告") {
    getSingleReportDataApi({ unitId: data["testunit_id"] }).then((res) => {
      router.push({ name: "reportView", query: res.data })
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
// 关闭详情
const goBack = () => {
  drawer.value = false
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
  const tableResult = await getTestMangeTable(params)
  // 赋值
  TableData.value = tableResult.TableData
  paginationData.total = tableResult.total
  getTableData()
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
  boardId: "",
  boardSerial: "",
  testType: "",
  processId: "",
  processVersion: ""
})
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}

// 确认新增
const submitAdd = () => {
  createTestUnitApi({
    boardList: selectedRows.value,
    userId: userStore.userid
  }).then(() => {
    getMangeData()
    dialogVisible.value = false
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
    publicTestUnitApi({ id: PublicFormInfo["testunit_id"] }).then(() => {
      getMangeData()
    })
  } else {
    deleteTestUnitApi(PublicFormInfo["testunit_id"]).then(() => {
      getMangeData()
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
  const tableResult = await getTestMangeTable(params)
  TableData.value = tableResult.TableData
  loading.value = false
  paginationData.total = tableResult.total // Store the table data
  getTableData()
}

// 显式暴露方法供父组件调用
defineExpose({
  resetSearch
})

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMangeData, { immediate: true })
</script>

<template>
  <el-card class="search-wrapper" shadow="never">
    <el-form ref="searchFormRef" :inline="true" :model="searchData">
      <el-form-item label="工单号">
        <el-input v-model="searchData.number" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="测试名">
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
      <div>
        <!-- 这个按钮只对 admin 角色可见 -->
        <el-button v-permission="['admin']" icon="CirclePlus" type="primary" @click="addTest">新增生产测试工单</el-button>
      </div>
      <div>
        <el-tooltip content="刷新当前页">
          <el-button circle icon="RefreshRight" type="primary" @click="getMangeData" />
        </el-tooltip>
      </div>
    </div>
    <div class="table-wrapper">
      <TableComponent :column-data="headers" :tableData="TableData" stripe>
        <template #testunit_status="{ row }">
          <el-tag v-if="row['testunit_status'] === '0'" type="success"> 已创建</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '1'" type="warning"> 待领取</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '2'"> 测试中</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '3'" type="warning"> 测试待审核</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '4'" type="danger"> 待重做</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '5'" type="success"> 测试正常</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '6'" type="danger"> 测试异常</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '7'" type="warning"> 测试暂存</el-tag>
          <el-tag v-else-if="row['testunit_status'] === '8'" type="warning"> 疑问待处理</el-tag>
        </template>
        <!-- 这一列只对 admin 角色可见 -->
        <template v-if="checkPermission(['admin'])" #link="{ row }">
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
  <el-drawer v-model="drawer" :append-to-body="true" :with-header="false" size="1000">
    <header class="drawer-head">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3">测试工单详情</span>
        </template>
      </el-page-header>
    </header>
    <el-header style="margin: 20px 0 20px 0">
      <el-text size="large">测试基本信息</el-text>
      <el-form :inline="true" :model="detailform" class="demo-form-inline" label-position="top" style="margin: 10px">
        <el-form-item label="工单号" style="width: 13%">
          <el-input v-model="detailform.unitId" disabled />
        </el-form-item>
        <el-form-item label="测试名称" style="width: 380px">
          <el-input v-model="detailform.unitName" disabled />
        </el-form-item>
        <el-form-item label="创建人" style="width: 14%">
          <el-input v-model="detailform.user" disabled />
        </el-form-item>
        <el-form-item label="创建日期" style="width: 16%">
          <el-input v-model="detailform.startTime" disabled />
        </el-form-item>
      </el-form>
    </el-header>
    <el-main class="drawer-main">
      <el-text size="large" style="margin-top: 20px">被测电路板信息</el-text>
      <el-row>
        <el-col :span="24">
          <el-card class="info-box" shadow="never" style="margin: 20px 0">
            <el-text size="large" style="margin-right: 20px">{{ detailform.boardModel }}</el-text>
            <span style="margin: 0 20px"
              >电路板ID:
              <el-input v-model="detailform.boardId" disabled style="width: 150px" />
            </span>
            <span style="margin: 0 20px">
              电路板序列号
              <el-input v-model="detailform.boardSerial" disabled style="width: 300px" />
            </span>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
    <el-footer class="drawer-footer">
      <el-text size="large">所选测试工艺信息</el-text>
      <br />
      <el-button type="primary" style="margin-top: 10px">{{ detailform.testType }}</el-button>
      <el-card class="info-box" shadow="never" style="margin: 20px 0">
        <span style="margin: 0 20px"
          >使用工艺ID:
          <el-input v-model="detailform.processId" disabled style="width: 150px" />
        </span>
        <span style="margin: 0 20px">
          使用工艺版本:
          <el-input v-model="detailform.processVersion" disabled style="width: 150px" />
        </span>
      </el-card>
    </el-footer>
  </el-drawer>

  <!-- 新增生产测试 -->
  <el-dialog
    v-model="dialogVisible"
    width="85%"
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
                  </el-space>
                </el-card>
              </div>
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
                            @change="
                              row['selectedTest'] = row['checkAll'] ? row['available'] : [];
                              row['isInd'] = false
                            "
                            >全选</el-checkbox
                          >
                          <el-divider direction="vertical" />
                          <el-checkbox-group v-model="row['selectedTest']">
                            <el-checkbox
                              v-for="item in row['available']"
                              :value="item"
                              :label="item.name"
                              :key="item.id"
                              @change="
                                row['checkAll'] = row['selectedTest'].length === row['available'].length;
                                row['isInd'] =
                                  row['selectedTest'].length > 0 &&
                                  row['selectedTest'].length < row['available'].length
                              "
                            />
                          </el-checkbox-group>
                        </div>
                      </template>
                    </TableComponent>
                  </div>
                </el-card>
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
        <h2>{{ PublicOrDelete }}测试工单</h2>
      </div>
    </template>
    <el-form :inline="true" :model="PublicFormInfo">
      <el-form-item label="工单号">
        <el-input v-model="PublicFormInfo['testunit_id']" disabled type="text" />
      </el-form-item>
      <el-form-item label="测试名称">
        <el-input v-model="PublicFormInfo['testunit_name']" disabled type="text" style="width: 350px" />
      </el-form-item>
      <br />
      <el-form-item label="测试类型">
        <el-input v-model="PublicFormInfo['process_type']" disabled type="text" />
      </el-form-item>
      <el-form-item label="创建人">
        <el-input v-model="PublicFormInfo['user_name']" disabled style="width: 100px" type="text" />
      </el-form-item>
      <el-form-item label="创建日期">
        <el-input v-model="PublicFormInfo['testunit_starttime']" disabled style="width: 180px" type="text" />
      </el-form-item>
    </el-form>
    <el-button
      :type="PublicOrDelete === '发布' ? 'primary' : 'danger'"
      icon="Check"
      size="large"
      style="position: relative; left: 50%; transform: translateX(-50%); width: 170px"
      @click="confirm(PublicOrDelete)"
      >确认{{ PublicOrDelete }}
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
