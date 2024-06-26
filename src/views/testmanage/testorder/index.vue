<script lang="ts" setup>
import { reactive, ref, watch, type Ref } from "vue"
import { ElScrollbar, ElTable, ElTree, type FormInstance } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
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

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const userStore = useUserStore()
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const currentRow = ref<any>()
const showFlags = ref<any>(true)
const showProcess = ref<any>(true)
const testFlags = ref<any>(true)
const dialogVisible = ref<boolean>(false)
const PublicVisible = ref<boolean>(false)
const testTypeList = ref<any>([])
const processList = ref<any>([])
const showProcessList = ref<any>([])
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

const headers = ref([
  { prop: "testunit_id", label: "工单号", align: "center" },
  { prop: "testunit_name", label: "测试名称", align: "center" },
  { prop: "user_name", label: "创建人", align: "center" },
  { prop: "testunit_starttime", label: "创建时间", align: "center" },
  { prop: "testunit_endtime", label: "结束时间", align: "center" },
  { prop: "process_type", label: "测试类型", align: "center" },
  { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const selectedRows = ref<any>([])
const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center" },
  { prop: "serial_num", label: "电路板序列号", align: "center" }
])
const TableData = ref<Array<TableDataType>>([])

const searchFormRef = ref<FormInstance | null>(null)

const searchData = reactive<any>({
  number: "",
  TestName: "",
  TestType: "",
  TestStatus: "",
  Daterange: ""
})

const defineLink = (status: any) => {
  switch (status) {
    case "0":
      return { 1: "发布", 2: "删除" }
    case "1":
      return { 1: "详情" }
    case "2":
      return { 1: "详情" }
    case "3":
      return { 1: "详情", 2: "查看报告" }
    case "4":
      return { 1: "详情", 2: "查看报告", 3: "查看故障" }
  }
}
const getTableData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    console.log(TableData.value[i])
    TableData.value[i].link = defineLink(TableData.value[i].testunit_status)
  }
}

// 发布与删除测试工单
interface PublicType {
  number: number
  name?: string
  user?: string
  starttime?: string
  endtime?: string
  type?: string
  link?: string
}

let PublicFormInfo = reactive({
  testunit_id: "",
  testunit_name: "",
  process_type: "",
  user_name: "",
  testunit_starttime: ""
})
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
    detailform.processVersion = data.process_version
    drawer.value = true
  }
}
// 关闭详情
const goBack = () => {
  drawer.value = false
}

const handleSearch = async () => {
  console.log(searchData)
  // 查询Table表格数据
  // 深拷贝
  const params = JSON.parse(JSON.stringify(searchData))
  // 拼接时间参数
  if (params.Daterange !== "") {
    params.Daterange = params.Daterange.join("-")
  }
  // 调用接口
  const tableResult = await getTestMangeTable(params)
  // 赋值
  TableData.value = tableResult.TableData
  // 判断是否为第一页，是则重新渲染，否则置一
  // paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  getMangeData()
}
//#endregion
// 确认新增传递给后端的参数
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
  console.log(selectedRows.value)
}
const singleTableRef = ref<InstanceType<typeof ElTable>>()

const setCurrent = (row?: any) => {
  singleTableRef.value!.setCurrentRow(row)
  if (row !== undefined && row !== null) {
    selectedType.processId = row.id
    selectedType.processVersion = row.version
  }
}
const selectedType = reactive<any>({
  id: "",
  name: "",
  processId: "",
  processVersion: ""
})
//选择测试工艺
const SelectTestType = async (type: any) => {
  const result = await getbordsinfo({
    batchId: Batch.value,
    boardModelId: CircuitBoardModelId.value,
    testTypeId: type.number
  })
  await Promise.all((boardTableData.value = result.data))
  showProcessList.value = []
  selectedType.processId = ""
  selectedType.processVersion = ""
  selectedType.id = type.number
  selectedType.name = type.name
  if (showProcess.value === false) {
    await setCurrent()
  }
  showProcess.value = false
  const process = processList.value.find((item: any) => {
    return item.type === type.name
  })
  if (process !== undefined && process !== null) {
    await Promise.all(
      process.versionList.map(async (item: any) => {
        if (item.status === 3) {
          showProcessList.value.push(item)
        }
      })
    )
    await Promise.all(
      showProcessList.value.map(async (item: any) => {
        if (item.activate === 1) {
          await setCurrent(item)
          selectedType.processId = item.id
          selectedType.processVersion = item.version
        }
      })
    )
  }
}

// 确认新增
const submitAdd = () => {
  createTestUnitApi({
    boardList: selectedRows.value,
    testTypeId: selectedType.id,
    processId: selectedType.processId,
    userId: userStore.userid
  }).then(() => {
    getMangeData()
    dialogVisible.value = false
  })
}
// 测试状态
const TestStatus = reactive<any>([
  {
    status: 0,
    mes: "已创建"
  },
  {
    status: 1,
    mes: "待领取"
  },
  {
    status: 2,
    mes: "测试中"
  },
  {
    status: 3,
    mes: "测试正常"
  },
  {
    status: 4,
    mes: "测试异常"
  }
])

// 确认发布或删除
const confirm = async (value: string) => {
  if (value === "发布") {
    publicTestUnitApi({ id: PublicFormInfo["testunit_id"] }).then((res) => {
      console.log(res)
      getMangeData()
    })
  } else {
    console.log(PublicFormInfo.number)
    deleteTestUnitApi(PublicFormInfo["testunit_id"]).then((res) => {
      getMangeData()
      console.log(res)
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
  currentRow.value = undefined
  selectedRows.value = []
  Batch.value = data.id
  CircuitBatch.value = data.label
  CircuitBoardModel.value = node.parent.data.label
  CircuitBoardModelId.value = node.parent.data.id
  showFlags.value = false
  showProcess.value = true
  getTestTypeData()
  getTestProcessList({
    boardModel_id: node.parent.data.id
  }).then((res) => {
    processList.value = res.data
  })
  console.log(currentRow.value, selectedRows.value)
}
const handleSingleSelectChange = (val: any) => {
  currentRow.value = val
  if (val !== undefined && val !== null) {
    selectedType.processId = val.id
    selectedType.processVersion = val.version
  }
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
const addTest = async () => {
  await getTreeData()
  dialogVisible.value = true
}
async function getTreeData() {
  const result = await getTestMangePath()
  treeData.value = result.Pathdata
}
async function getMangeData() {
  const currentpage = paginationData.currentPage
  const size = paginationData.pageSize
  const tableResult = await getTestMangeTable({ currentPage: currentpage, pageSize: size })
  TableData.value = tableResult.TableData
  paginationData.total = tableResult.total // Store the table data
  getTableData()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMangeData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" class="search-wrapper" shadow="never">
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
        <!-- 时间选择器 -->
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
          <el-button icon="CirclePlus" type="primary" @click="addTest">新增测试</el-button>
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
            <el-tag v-if="row.testunit_status === '0'" type="success"> 已创建</el-tag>
            <el-tag v-if="row.testunit_status === '1'" type="warning"> 待领取</el-tag>
            <el-tag v-if="row.testunit_status === '2'"> 测试中</el-tag>
            <el-tag v-if="row.testunit_status === '3'" type="success"> 测试正常</el-tag>
            <el-tag v-if="row.testunit_status === '4'" type="danger"> 测试异常</el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" class="el-link" type="primary" @click="handleLink(row, i)">{{ i }}</el-link>
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
                <el-input v-model="detailform.boardSerial" disabled style="width: 150px" />
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
    <!-- 新增 -->
    <el-dialog v-model="dialogVisible" width="85%" @close="closeDiaLog" title="新增测试工单" align-center>
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
              <div v-if="showFlags">请先在左侧选择被测电路板</div>
              <div v-else>
                <div class="info-header">
                  <el-text size="large">1.确认测试类型</el-text>
                  <el-card shadow="never" style="margin-top: 10px">
                    <el-space :size="10" spacer="|">
                      <el-text size="large">电路板型号:{{ CircuitBoardModel }}</el-text>
                      <el-text>批次ID:{{ Batch }}</el-text>
                      <el-text size="large">{{ CircuitBatch }}</el-text>
                    </el-space>
                  </el-card>
                  <div style="margin-top: 10px">
                    <el-button
                      v-show="item.processCount !== 0"
                      v-for="item in testTypeList"
                      class="test-type"
                      @click="SelectTestType(item)"
                      :key="item"
                      >{{ item.name }}
                    </el-button>
                  </div>
                  <el-card shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                    <div v-if="showProcess" style="display: flex; justify-content: center">请先选择测试类型</div>
                    <div v-else-if="!showProcess" style="display: flex; flex-direction: column">
                      <div style="margin-bottom: 10px">
                        <el-space :size="10" spacer="|">
                          <el-text size="large">所选测试:{{ selectedType.name }}</el-text>
                          <el-text>所选工艺ID:{{ selectedType.processId }}</el-text>
                          <el-text>所选工艺版本:{{ selectedType.processVersion }}</el-text>
                        </el-space>
                      </div>
                      <div>
                        <el-scrollbar height="220px">
                          <el-table
                            ref="singleTableRef"
                            :data="showProcessList"
                            highlight-current-row
                            @current-change="handleSingleSelectChange"
                          >
                            <el-table-column prop="id" label="工艺ID" />
                            <el-table-column prop="version" label="工艺版本" />
                          </el-table>
                        </el-scrollbar>
                      </div>
                    </div>
                  </el-card>
                </div>
                <div>
                  <el-text size="large">2.确认被测电路板</el-text>
                  <el-card v-if="showProcess" shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                    <div style="display: flex; justify-content: center">请先选择测试类型</div>
                  </el-card>
                  <el-card v-if="!showProcess" shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                    <el-scrollbar height="220px">
                      <div class="table-wrapper">
                        <TableComponent
                          :column-data="addHeaders"
                          :table-data="boardTableData"
                          selection
                          stripe
                          @selection-change="handleSelectionChange"
                        />
                      </div>
                    </el-scrollbar>
                  </el-card>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button
          icon="Check"
          type="primary"
          @click="submitAdd"
          :disabled="currentRow === undefined || selectedRows.length === 0"
          >确认新增</el-button
        >
      </template>
    </el-dialog>
    <!-- 发布 删除 -->
    <el-dialog v-model="PublicVisible" :show-close="true" width="44%">
      <template #header="{ close }">
        <div class="my-header">
          <h2>{{ PublicOrDelete }}测试工单</h2>
          <!-- <button @click="close">X</button> -->
        </div>
      </template>
      <el-form :inline="true" :model="PublicFormInfo">
        <el-form-item label="工单号">
          <!-- <el-input type="text" disabled="false"> -->
          <el-input v-model="PublicFormInfo['testunit_id']" disabled type="text" />
        </el-form-item>
        <el-form-item label="测试名称">
          <!-- <el-input type="text" disabled="false"> -->
          <el-input v-model="PublicFormInfo['testunit_name']" disabled type="text" style="width: 350px" />
        </el-form-item>
        <br />
        <el-form-item label="测试类型">
          <!-- <el-input type="text" disabled="false"> -->
          <el-input v-model="PublicFormInfo['process_type']" disabled type="text" />
        </el-form-item>
        <el-form-item label="创建人">
          <!-- <el-input type="text" disabled="false"> -->
          <el-input v-model="PublicFormInfo['user_name']" disabled style="width: 100px" type="text" />
        </el-form-item>
        <el-form-item label="创建日期">
          <!-- <el-input type="text" disabled="false"> -->
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
  </div>
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
  // background-color: aqua;
}

.drawer-footer {
  // margin-top: 20px;
  // width: 200px;
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
    // margin-top: 20px;
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
