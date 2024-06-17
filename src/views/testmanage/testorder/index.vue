<script lang="ts" setup>
import { reactive, ref, watch, type Ref } from "vue"
import { ElMessage, ElMessageBox, ElScrollbar, ElTree, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search, Check } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import {
  getTestMangePath,
  getbordsinfo,
  getTestMangeTable,
} from "@/api/testMangelist/index"
import type { GetBoardData } from "@/api/board/types/board"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
// 点击隐藏
const showFlags = ref(true)
const testFlags = ref(true)
const dialogVisible = ref<boolean>(false)
const PublicVisible = ref<boolean>(false)
const checkedFixture = ref([])
const checkedPsi = ref([])
const checkedEquipment = ref([])
const fixtures = ref([
  { id: 1, name: "fixture1" },
  { id: 2, name: "fixture2" },
  { id: 3, name: "fixture3" },
  { id: 4, name: "fixture4" },
  { id: 5, name: "fixture5" },
  { id: 6, name: "fixture6" },
  { id: 7, name: "fixture7" }
])
const psis = ref([
  { id: 1, name: "psi1" },
  { id: 2, name: "psi2" },
  { id: 3, name: "psi3" },
  { id: 4, name: "psi4" },
  { id: 5, name: "psi5" },
  { id: 6, name: "psi6" },
  { id: 7, name: "psi7" }
])
const equipments = ref([
  { id: 1, name: "equipment1" },
  { id: 2, name: "equipment2" },
  { id: 3, name: "equipment3" },
  { id: 4, name: "equipment4" },
  { id: 5, name: "equipment5" },
  { id: 6, name: "equipment6" },
  { id: 7, name: "equipment7" }
])
//#region 增
const formRef = ref<FormInstance | null>(null)

// const handleCreate = () => {
//   formRef.value?.validate((valid: boolean, fields) => {
//     if (valid) {
//       if (currentUpdateId.value === undefined) {
//         createTableDataApi(formData)
//           .then(() => {
//             ElMessage.success("新增成功")
//             //getTableData()
//           })
//           .finally(() => {
//             dialogVisible.value = false
//           })
//       } else {
//         updateTableDataApi({
//           id: currentUpdateId.value,
//           username: formData.username
//         })
//           .then(() => {
//             ElMessage.success("修改成功")
//             //getTableData()
//           })
//           .finally(() => {
//             dialogVisible.value = false
//           })
//       }
//     } else {
//       console.error("表单校验不通过", fields)
//     }
//   })
// }
// const resetForm = () => {
//   currentUpdateId.value = undefined
//   formData.username = ""
//   formData.password = ""
// }
//#endregion

//#region 删
// const handleDelete = (row: GetTableData) => {
//   ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning"
//   }).then(() => {
//     deleteTableDataApi(row.id).then(() => {
//       ElMessage.success("删除成功")
//       //getTableData()
//     })
//   })
// }
//#endregion

//#region 改
// const currentUpdateId = ref<undefined | string>(undefined)
// const handleUpdate = (row: GetTableData) => {
//   currentUpdateId.value = row.id
//   formData.username = row.username
//   dialogVisible.value = true
// }
//#endregion

//const tableData = ref<GetTableData[]>([])
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
  { prop: "testunit_status", label: "测试状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

const addHeaders = ref([
  { prop: "id", label: "电路板ID", align: "center" },
  { prop: "serial_num", label: "电路板序列号", align: "center" }
])
const TableData = ref<Array<TableDataType>>([])

const searchFormRef = ref<FormInstance | null>(null)

interface SearchDataType {
  number?: string
  TestName?: string
  TestType?: string
  TestStatus?: string
  Daterange?: string | any
}

const searchData = reactive<SearchDataType>({
  number: "",
  TestName: "",
  TestType: "",
  TestStatus: "",
  Daterange: ""
})

const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "发布", 2: "编辑", 3: "删除" }
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
  // This code will be executed after the next DOM update
  // You can safely access updated DOM elements or properties here
}

// 发布与删除测试工单
interface PublicType {
  number?: string | number
  name?: string
  user?: string
  starttime?: string
  endtime?: string
  type?: string
  link?: string
}

let PublicFormInfo = reactive<PublicType>({})
const PublicOrDelete = ref<string>("发布")
const drawer: Ref<boolean> = ref(false)
// link操作逻辑
const handleLink = (data: any, i: string) => {
  if (i === "编辑") {
    console.log(data)
    dialogVisible.value = true
    showFlags.value = false
  } else if (i === "发布") {
    PublicVisible.value = true
    PublicFormInfo = data
    PublicOrDelete.value = "发布"
  } else if (i == "删除") {
    PublicVisible.value = true
    PublicFormInfo = data
    PublicOrDelete.value = "删除"
  } else if (i === "详情") {
    drawer.value = true
  }
}
// 关闭详情
const goBack = () => {
  drawer.value = false
}

// 时间选择器
// const value1 = ref<[Date, Date]>()
// 查询
/**
 * Query button
 */
const handleSearch = async () => {
  // 查询Table表格数据
  // 深拷贝
  const params = JSON.parse(JSON.stringify(searchData))
  // 拼接时间参数
  params.Daterange = params.Daterange.join("-")
  // 调用接口
  const tableResult = await getTestMangeTable(params)
  // 赋值
  TableData.value = tableResult.TableData
  // 判断是否为第一页，是则重新渲染，否则置一
  // paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

const shortcuts = [
  {
    text: "Last week",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: "Last month",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: "Last 3 months",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]
const resetSearch = () => {
  // searchData.TestName = ''
  // searchData.TestStatus = '',
  // searchData.TestType = '',
  // searchData.number = ''
  // searchData.Daterange = ''
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  getMangeData()
}
//#endregion
// 确认新增传递给后端的参数
const form = reactive({
  region: "",
  number: "",
  data1: "",
  radio1: "",
  radio2: "",
  checkedOptions: ["option2"]
})
// test
const test = reactive({
  name: "电路板名称",
  AllType: ["功能性测试", "X-Ray测试"],
  // 功能性测试类型....
  test1: {
    fixtureMangerList: [
      {
        ID: "123",
        number: "123"
      },
      {
        ID: "123",
        number: "123"
      }
    ],
    hostMangerList: [
      {
        ID: "123",
        number: "123"
      },
      {
        ID: "123",
        number: "123"
      }
    ],
    otherMangerList: [
      {
        ID: "123",
        number: "123"
      }
    ]
  },
  // X-Ray测试
  test2: {
    fixtureMangerList: [
      {
        ID: "123",
        number: "123"
      },
      {
        ID: "123",
        number: "123"
      }
    ],
    otherMangerList: [
      {
        ID: "123",
        number: "123"
      }
    ]
  },
  // .......
  test3: {
    fixtureMangerList: [
      {
        ID: "123",
        number: "123"
      },
      {
        ID: "123",
        number: "123"
      }
    ],
    hostMangerList: [
      {
        ID: "123",
        number: "123"
      },
      {
        ID: "123",
        number: "123"
      }
    ],
    otherMangerList: [
      {
        ID: "123",
        number: "123"
      }
    ]
  }
})

// 当前电路板信息
const CurrentTestInfo = reactive({
  region: "",
  number: ""
})
// 测试工单详情
const formInline = reactive<PublicType>({
  number: "",
  name: "",
  user: "",
  starttime: "",
  endtime: ""
})

//选择测试工艺
const SelectTestType = (type) => {
  console.log(type)
  testFlags.value = false
}

// 确认新增
const submitAdd = () => {
  dialogVisible.value = false
}
// 测试状态
const TestStatus = reactive([
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
  }
])

// 确认发布或删除
const confirm = async (value: string) => {
  if (value === "发布") {
    // let result = await TestMangePublc(PublicFormInfo)
  } else {
  }
  PublicVisible.value = false
}

// 树结构
interface Tree {
  [key: string]: any
}

// 电路板信息 型号和批次ID
const Batch = ref()
const CircuitBatch = ref()
const CircuitBoardModel = ref()
//  电路板ID和序列号
const tableData1 = ref<GetBoardData[]>([])

type NodeData = {
  id: string
}
const clickNode = async (data: NodeData & any, node: any) => {
  // 如果点击的节点有子节点则直接返回
  if (node.data.children) {
    return
  }
  // 点击叶子节点，设置批次ID和型号
  Batch.value = data.id
  CircuitBatch.value = data.label
  CircuitBoardModel.value = node.parent.data.label
  showFlags.value = false
  // 根据id获取电路版信息
  const result = await getbordsinfo(data.id)
  tableData1.value = result.data
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
let data: Tree[] = []

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}
// 新增测试
const addTest = async () => {
  dialogVisible.value = true
}
const multipleTableRef = ref()
const multipleSelection = ref([])
// 选择框
const handleSelectionChange = async (val: any) => {
  if (val.length == 1) {
    // return;
    // console.log(val[0].id);
    // let selectBatch = await getTestMangeInfo(val[0].id)
  } else {
    multipleTableRef.value.clearSelection()
  }
}

// 重置数据
const ResetInfo = () => {
  form["data1"] = ""
  form["region"] = ""
  form["number"] = ""
  testFlags.value = true
}

/**
 * Fetch the path data from the server and store it
 */
async function getMangeData() {
  // Fetch the path data from the server
  const result = await getTestMangePath()
  // Call the API to get the path data
  data = result.Pathdata
  // 获取Table表格数据
  //  分页
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
          <el-select v-model="searchData.TestType" placeholder="请选择">
            <el-option label="功能性测试" value="功能性测试" />
            <el-option label="X-Ray测试" value="X-Ray测试" />
            <el-option label="可靠性测试" value="可靠性测试" />
          </el-select>
        </el-form-item>
        <el-form-item label="测试状态">
          <el-select v-model="searchData.TestStatus" placeholder="请选择">
            <el-option v-for="item in TestStatus" :label="item.mes" :value="item.status" />
          </el-select>
        </el-form-item>
        <!-- 时间选择器 -->
        <el-form-item label="选择时间范围">
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
          <el-button :icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button :icon="CirclePlus" type="primary" @click="addTest">新增测试</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button :icon="RefreshRight" circle type="primary" @click="" />
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
              <el-input v-model="PublicFormInfo['testunit_name']" disabled type="text" />
            </el-form-item>
            <el-form-item label="测试类型">
              <!-- <el-input type="text" disabled="false"> -->
              <el-input v-model="PublicFormInfo['process_type']" disabled type="text" />
            </el-form-item>
            <br />
            <el-form-item label="创建人">
              <!-- <el-input type="text" disabled="false"> -->
              <el-input v-model="PublicFormInfo['user_name']" disabled style="width: 100px" type="text" />
            </el-form-item>
            <el-form-item label="创建日期">
              <!-- <el-input type="text" disabled="false"> -->
              <el-input v-model="PublicFormInfo['testunit_starttime']" disabled style="width: 120px" type="text" />
            </el-form-item>
            <el-form-item label="结束日期 ">
              <!-- <el-input type="text" disabled="false"> -->
              <el-input v-model="PublicFormInfo['testunit_endtime']" disabled style="width: 120px" type="text" />
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
        <!-- 详情 -->
        <el-drawer v-model="drawer" :append-to-body="true" :with-header="false" size="1200">
          <header class="drawer-head">
            <el-page-header @back="goBack">
              <template #content>
                <span class="text-large font-600 mr-3">测试工单详情</span>
              </template>
            </el-page-header>
          </header>
          <el-header style="margin: 20px 0 20px 0">
            <el-text size="large">测试基本信息</el-text>
            <el-form
              :inline="true"
              :model="formInline"
              class="demo-form-inline"
              label-position="top"
              style="margin: 10px"
            >
              <el-form-item label="工单号" style="width: 20%">
                <el-input v-model="formInline.number" disabled />
              </el-form-item>
              <el-form-item label="测试名称" style="width: 20%">
                <el-input v-model="formInline.name" disabled />
              </el-form-item>
              <el-form-item label="创建人" style="width: 14%">
                <el-input v-model="formInline.user" disabled />
              </el-form-item>
              <el-form-item label="创建日期" style="width: 15%">
                <el-input v-model="formInline.starttime" disabled />
              </el-form-item>
              <el-form-item label="结束日期" style="width: 15%">
                <el-input v-model="formInline.endtime" disabled />
              </el-form-item>
            </el-form>
          </el-header>
          <el-main class="drawer-main">
            <el-text size="large" style="margin-top: 20px">被测电路板信息</el-text>
            <el-row>
              <el-col :span="24">
                <el-card class="info-box" shadow="never" style="margin: 20px 0">
                  <el-text class="mx-1" style="margin-right: 20px">A型号电路板</el-text>
                  <span>批次 ID ：xxxxx</span>
                  <span style="margin: 0 20px"
                    >电路板ID
                    <el-input v-model="form.region" disabled style="width: 150px" />
                  </span>
                  <span style="margin: 0 20px">
                    电路板序列号
                    <el-input v-model="form.number" disabled style="width: 150px" />
                  </span>
                </el-card>
              </el-col>
            </el-row>
          </el-main>
          <el-footer class="drawer-footer">
            <el-text size="large">所选测试工艺信息</el-text>
            <el-button style="position: relative; top: 40px; right: 120px" type="primary">功能性测试</el-button>
            <el-row style="margin-top: 60px">
              <el-col :span="24">
                <div class="drawer-jiaju">
                  <el-text size="large">夹具：xxx</el-text>
                  <el-text size="large">ID：xxx</el-text>
                  <el-text size="large">序列号：xxx</el-text>
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <div class="drawer-host">
                  <el-text size="large">主机：xxx</el-text>
                  <el-text size="large">ID：xxx</el-text>
                  <el-text size="large">序列号：xxx</el-text>
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <div v-for="item in 5" class="drawer-other">
                  <el-text size="large">其他设备：xxx</el-text>
                  <el-text size="large">ID：xxx</el-text>
                  <el-text size="large">序列号：xxx</el-text>
                </div>
              </el-col>
            </el-row>
          </el-footer>
        </el-drawer>
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
    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" width="85%" @close="closeDiaLog">
      <template #header>
        <div class="head-test">
          <h2>新增测试工单：</h2>
          <el-input class="head-ipt" placeholder="请填写测试工单名称" />
        </div>
      </template>
      <div>
        <el-row :gutter="20">
          <el-col :span="5">
            <el-card shadow="never" style="height: 100%">
              <template #header>
                <el-input v-model="filterText" placeholder="搜索" />
              </template>
              <el-tree
                ref="treeRef"
                :data="data"
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
                  <el-text size="large">1.确认被测电路板信息</el-text>
                  <el-card shadow="never" style="margin-top: 10px">
                    <el-space :size="size" spacer="|">
                      <el-text size="large">电路板型号:{{ CircuitBoardModel }}</el-text>
                      <el-text>批次ID:{{ Batch }}</el-text>
                      <el-text size="large">{{ CircuitBatch }}</el-text>
                    </el-space>
                  </el-card>
                  <el-card shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                    <el-scrollbar height="220px">
                      <div class="table-wrapper">
                        <TableComponent
                          :column-data="addHeaders"
                          :table-data="tableData1"
                          selection
                          stripe
                          @selection-change="handleSelectionChange"
                        />
                      </div>
                    </el-scrollbar>
                  </el-card>
                </div>
                <div>
                  <el-text size="large">2.确认测试工艺</el-text>
                  <div style="margin-top: 10px">
                    <el-button v-for="item in test.AllType" class="test-type" @click="SelectTestType(item)"
                      >{{ item }}
                    </el-button>
                  </div>
                  <el-card shadow="never" style="margin-top: 10px; margin-bottom: 10px">
                    <div v-if="testFlags" style="display: flex; justify-content: center">请先选择工艺类型</div>
                    <div v-else class="test-type-contentShow">
                      <el-row :gutter="20">
                        <el-col :span="8">
                          <div v-if="test.test1" class="select-fixture">
                            <p>选择夹具（单选）</p>
                            <div>
                              <el-checkbox-group v-model="checkedFixture" :max="1">
                                <el-card shadow="never" style="--el-card-padding: 0px">
                                  <el-scrollbar height="200px">
                                    <el-checkbox
                                      v-for="fixture in fixtures"
                                      :key="fixture.id"
                                      :label="fixture.name"
                                      :value="fixture.id"
                                      style="
                                        margin: 0;
                                        width: 100%;
                                        border: 0.5px solid var(--el-border-color);
                                        padding: 0 9px 0 11px;
                                      "
                                      >夹具ID:{{ fixture.id }} 夹具名称:{{ fixture.name }}
                                    </el-checkbox>
                                  </el-scrollbar>
                                </el-card>
                              </el-checkbox-group>
                            </div>
                          </div>
                        </el-col>
                        <el-col :span="8">
                          <div v-if="test.test2">
                            <p>选择主机（单选）</p>
                            <el-checkbox-group v-model="checkedPsi" :max="1">
                              <el-card shadow="never" style="--el-card-padding: 0px">
                                <el-scrollbar always="always" height="200px">
                                  <el-checkbox
                                    v-for="psi in psis"
                                    :key="psi.id"
                                    :label="psi.name"
                                    :value="psi.id"
                                    style="
                                      margin: 0;
                                      width: 100%;
                                      border: 0.5px solid var(--el-border-color);
                                      padding: 0 9px 0 11px;
                                    "
                                    >主机ID:{{ psi.id }} 主机名称:{{ psi.name }}
                                  </el-checkbox>
                                </el-scrollbar>
                              </el-card>
                            </el-checkbox-group>
                          </div>
                        </el-col>
                        <el-col :span="8">
                          <div v-if="true" class="select-other">
                            <p>选择其他设备（多选）</p>
                            <div>
                              <el-checkbox-group v-model="checkedEquipment">
                                <el-card shadow="never" style="--el-card-padding: 0px">
                                  <el-scrollbar always="always" height="200px">
                                    <el-checkbox
                                      v-for="equipment in equipments"
                                      :key="equipment.id"
                                      :label="equipment.name"
                                      :value="equipment.id"
                                      style="
                                        margin: 0;
                                        width: 100%;
                                        border: 0.5px solid var(--el-border-color);
                                        padding: 0 9px 0 11px;
                                      "
                                      >其他设备ID:{{ equipment.id }} 其他设备名称:{{ equipment.name }}
                                    </el-checkbox>
                                  </el-scrollbar>
                                </el-card>
                              </el-checkbox-group>
                            </div>
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                  </el-card>
                </div>
                <div class="info-footer">
                  <el-text size="large">3.确认结束日期</el-text>
                  <el-date-picker v-model="form.data1" placeholder="请选择" style="margin-left: 20px" type="date" />
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div class="test-footer">
        <div>
          <el-button :icon="Check" type="primary" @click="submitAdd">确认新增</el-button>
          <el-button :icon="RefreshRight" type="info" @click="ResetInfo">信息重置</el-button>
        </div>
      </div>
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

.test-footer {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
