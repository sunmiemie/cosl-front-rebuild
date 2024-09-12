<!--测试工艺列表-->

<script lang="ts" setup>
import { reactive, ref, watch, type Ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox, ElTree, type FormInstance } from "element-plus"
import { ElButton, ElDrawer } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { useDetailPagination, usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { getInstrumentDataApi } from "@/api/instrument"
import { useTestStore } from "@/store/modules/test"
import {
  getTestProcessDetail,
  getTestProcessList,
  changeVersion,
  submitCheck,
  deleteTestProcessApi
} from "@/api/addprocess"
import { checkPermission } from "@/utils/permission";

const testStore = useTestStore()

const loading = ref<boolean>(false)
const { paginationData } = usePagination()
const { paginationDetailData, handleDetailCurrentChange, handleDetailSizeChange } = useDetailPagination()
const router = useRouter()
const treeLoading = ref<boolean>(false)
const DialogCheck = ref<boolean>(false)
const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref<any>("")
const testType = ref<number>()

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
const drawer: Ref<boolean> = ref(false)
const addTest = () => {
  testStore.test_process_id = ""
  router.push("/testmanage/addprocess")
}

// 提交审核
const onSubmit = () => {
  // console.log(TestCheck.value)
  submitCheck({ id: TestCheck.value.ID }).then((res: any) => {
    if (res.code === 0) {
      ElMessage.success("提交成功")
      getDetailTableData()
    }
  })
  DialogCheck.value = false
}
//#region 改

interface ProcessDataDetailType {
  ID: string
  version: string
  status: number
  user: string
  type?: string
  link?: any
}

const headers1 = ref([
  { prop: "type", label: "测试工艺", align: "center" },
  { prop: "activateId", label: "当前激活工艺ID", align: "center" },
  { prop: "version", label: "当前激活工艺版本 ", type: "select", align: "center" },
  { prop: "link", label: "操作 ", type: "link" }
])
const TableData = ref<any>([])
const headers2 = ref([
  { prop: "type", label: "测试工艺 ", align: "center" },
  { prop: "ID", label: "工艺ID", align: "center" },
  { prop: "version", label: "工艺版本 ", align: "center" },
  { prop: "status", label: "工艺状态", type: "tag", align: "center" },
  { prop: "user", label: "审核人 ", align: "center" },
  { prop: "count", label: "审核次数 ", align: "center" },
  { prop: "link", label: "操作 ", type: "link" }
])
const ProcessDataDetail = ref<Array<ProcessDataDetailType>>([])

const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  ID: "",
  version: "",
  type: "",
  boardModel: "",
  testType: null
})
const defineLink = (status: any) => {
  switch (status) {
    case 0:
      return { 1: "提交审核", 2: "编辑", 3: "删除" }
    case 1:
      return { 1: "详情" }
    case 2:
      return { 1: "提交审核", 2: "编辑" }
    case 3:
      return { 1: "详情" }
  }
}
const TreeData = ref<any>([])
const getTreeData = () => {
  treeLoading.value = true
  // 仪器
  getInstrumentDataApi({
    currentPage: 1,
    size: 999999,
    isTree: true
  })
    .then((res) => {
      TreeData.value = res.data.list
    })
    .catch(() => {
      TreeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}
const getTableData = () => {
  getTestProcessList({
    boardModel_id: searchData.boardModel
  }).then((res) => {
    TableData.value = res.data
    testStore.versionArr = res.data
  })
  for (let i = 0; i < TableData.value.length; i++) {
    TableData.value[i].link = defineLink(TableData.value[i].status)
  }
}

const handleLink = (data: any, i: string) => {
  switch (data.type) {
    case "功能性测试":
      testType.value = 1
      break
    case "目检测试":
      testType.value = 2
      break
    case "X-Ray测试":
      testType.value = 5
      break
    case "可靠性测试":
      testType.value = 6
      break
    default:
      console.warn("添加其他测试类型")
  }
  if (i == "详情") {
    getDetailTableData()
    searchData.testType = testType.value
    drawer.value = true
  }
}
const getDetailTableData = () => {
  loading.value = true
  getTestProcessDetail({
    currentPage: paginationDetailData.currentPage,
    size: paginationDetailData.pageSize,
    boardModel_id: searchData.boardModel,
    testtype: testType.value
  })
    .then((res: any) => {
      ProcessDataDetail.value = res.data
      paginationDetailData.total = res.total
      for (let i = 0; i < ProcessDataDetail.value.length; i++) {
        ProcessDataDetail.value[i].link = defineLink(ProcessDataDetail.value[i].status)
      }
    })
    .finally(() => {
      loading.value = false
    })
}
//当前选中
const CurrentVersion = (val: any, row: any) => {
  // console.log(val)
  // console.log(row)
  changeVersion({
    ID: row.activateId,
    version: val
  }).then(() => {
    getTestProcessList({
      boardModel_id: searchData.boardModel
    }).then((res) => {
      TableData.value = res.data
    })
  })
}

const handleLinkDetail = (data: any, i: string) => {
  if (i === "提交审核") {
    DialogCheck.value = true
    TestCheck.value = data
  } else if (i === "编辑") {
    testStore.test_process_id = data.ID
    testStore.board_model_id = ""
    router.push("/testmanage/addprocess")
  } else if (i === "删除") {
    ElMessageBox.confirm("确认删除工艺吗？", "删除确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      deleteTestProcessApi(data.ID).then((res) => {
        getDetailTableData()
        getTableData()
        ElMessage.success("删除成功")
        // console.log(res)
      })
    })
  } else if (i === "详情") {
    console.log(data)
  }
}
// 返回
const goBack = () => {
  drawer.value = false
}

const defaultProps = {
  children: "children",
  label: "label"
}
const handleNodeClick = (data: any) => {
  if (data.children === undefined) {
    searchData.boardModel = data.id
    testStore.board_model_id = data.id
    testStore.board_model_name = data.label
    getTableData()
  }
}
// 详情查询
const handleSearch = () => {
  getTestProcessDetail({
    boardModel_id: searchData.boardModel,
    testtype: searchData.testType,
    ID: searchData.ID,
    version: searchData.version
  }).then((res) => {
    ProcessDataDetail.value = res.data
    for (let i = 0; i < ProcessDataDetail.value.length; i++) {
      ProcessDataDetail.value[i].link = defineLink(ProcessDataDetail.value[i].status)
    }
  })
}

const resetSearch = () => {
  // 重置工艺ID
  searchData.ID = ""
  // 重置测试类型
  searchData.type = ""
  // 重置工艺版本
  searchData.version = ""
  getDetailTableData()
}
const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}
watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTreeData, { immediate: true })
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
watch([() => paginationDetailData.currentPage, () => paginationDetailData.pageSize], getDetailTableData, {
  immediate: false
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
          <template #header>
            <el-input v-model="filterText" placeholder="搜索" />
          </template>
          <el-tree
            ref="treeRef"
            :data="TreeData"
            :default-expanded-keys="[1]"
            :filter-node-method="filterNode"
            :props="defaultProps"
            accordion
            class="filter-tree"
            node-key="id"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-col>
      <el-col :span="19">
        <el-card v-if="searchData.boardModel === ''">
          <el-empty description="请选择电路板型号" />
        </el-card>
        <el-card v-else v-loading="loading" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <el-button v-permission="['12']" :icon="CirclePlus" type="primary" @click="addTest">新增流程</el-button>
            </div>
            <div>
              <el-tooltip content="刷新当前页">
                <el-button :icon="RefreshRight" circle type="primary" @click="getTableData" />
              </el-tooltip>
            </div>
          </div>
          <div class="table-wrapper">
            <TableComponent v-if="TableData.length > 0" :column-data="headers1" :tableData="TableData" stripe>
              <template #version="{ row }">
                <el-select
                  v-model="row.activateVersion"
                  size="default"
                  style="width: 40%"
                  @change="CurrentVersion($event, row)"
                >
                  <el-option
                    v-for="item in row.versionList"
                    v-show="item.status === 3"
                    :key="item.id"
                    :label="item.version"
                    :value="item.id"
                  />
                </el-select>
              </template>
              <template #link="{ row }">
                <el-link class="el-link" type="primary" @click="handleLink(row, '详情')">详情</el-link>
              </template>
            </TableComponent>
          </div>
          <!-- 详情 -->
          <el-drawer v-model="drawer" :append-to-body="true" :with-header="false" size="65%">
            <header class="drawer-head">
              <el-page-header @back="goBack">
                <template #content>
                  <span class="text-large font-600 mr-3">测试工艺详情</span>
                </template>
              </el-page-header>
            </header>
            <el-card v-loading="loading" class="search-wrapper" shadow="never">
              <el-form ref="searchFormRef" :inline="true" :model="searchData">
                <el-form-item label="工艺ID">
                  <el-input v-model="searchData.ID" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="工艺版本">
                  <el-input v-model="searchData.version" placeholder="请输入" />
                </el-form-item>
                <el-form-item>
                  <el-button :icon="Search" style="margin-right: 10px" type="primary" @click="handleSearch"
                    >查询
                  </el-button>
                  <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </el-card>
            <el-card v-loading="loading" shadow="never">
              <div class="detailbar-wrapper">
                <el-tooltip content="刷新当前页">
                  <el-button :icon="RefreshRight" circle type="primary" @click="getDetailTableData(testType)" />
                </el-tooltip>
              </div>
              <div class="table-wrapper">
                <TableComponent :column-data="headers2" :tableData="ProcessDataDetail" stripe>
                  <template #status="{ row }">
                    <el-tag v-if="row.status === 0"> 已创建</el-tag>
                    <el-tag v-if="row.status === 1" type="warning"> 待审核</el-tag>
                    <el-tag v-if="row.status === 2" type="danger"> 待修改</el-tag>
                    <el-tag v-if="row.status === 3" type="success"> 可使用</el-tag>
                  </template>
                  <template #link="{ row }">
                    <el-link
                      v-for="i in row.link"
                      class="el-link"
                      type="primary"
                      @click="handleLinkDetail(row, i)"
                      :key="i"
                      >{{ i }}
                    </el-link>
                  </template>
                </TableComponent>
              </div>
              <div class="pager-wrapper">
                <el-pagination
                  background
                  :layout="paginationDetailData.layout"
                  :page-sizes="paginationDetailData.pageSizes"
                  :total="paginationDetailData.total"
                  :page-size="paginationDetailData.pageSize"
                  :currentPage="paginationDetailData.currentPage"
                  @size-change="handleDetailSizeChange"
                  @current-change="handleDetailCurrentChange"
                />
              </div>
            </el-card>
          </el-drawer>
          <el-dialog v-model="DialogCheck" :title="'提交测试工艺审核'" width="30%">
            <el-form :inline="true" :model="TestCheck" label-position="left" label-width="100px">
              <el-form-item label="工艺ID">
                <el-input v-model="TestCheck.ID" disabled />
              </el-form-item>
              <el-form-item label="工艺版本">
                <el-input v-model="TestCheck.version" disabled />
              </el-form-item>
              <el-form-item label="测试类型">
                <el-input v-model="TestCheck.type" disabled />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="DialogCheck = false">取消 </el-button>
              <el-button icon="Check" style="margin-left: 10px" type="primary" @click="onSubmit">确认提交 </el-button>
            </template>
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.drawer-head {
  height: 5%;
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

.detailbar-wrapper {
  display: flex;
  justify-content: flex-end;
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

.vxp-captcha__slider {
  max-width: 300px;
}

:deep(.el-button + .el-button) {
  margin: 0;
}
</style>
