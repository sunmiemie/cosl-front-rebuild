<!--测试工艺列表-->

<script lang="ts" setup>
import { reactive, ref, watch, type Ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox, ElTree, type FormInstance, type TabsPaneContext } from "element-plus"
import { ElButton, ElDrawer } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search, View, Delete } from "@element-plus/icons-vue"
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
import { getHaltHassProcessList, deleteHaltHassProcess, submitHaltHassToCheck } from "@/api/halt-hass"
import type { HaltHassProcessListItem } from "@/api/halt-hass/types"

const testStore = useTestStore()

// Tab 切换
const activeTab = ref("normal")

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

// ==================== HALT-HASS 工艺相关 ====================

// HALT-HASS 工艺数据
const haltHassLoading = ref(false)
const haltHassTableData = ref<HaltHassProcessListItem[]>([])
const haltHassPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// HALT-HASS 搜索表单
const haltHassSearchData = reactive({
  name: "",
  status: ""
})

// HALT-HASS 状态选项
const haltHassStatusOptions = [
  { label: "全部", value: "" },
  { label: "草稿", value: "0" },
  { label: "待审核", value: "1" },
  { label: "待修改", value: "2" },
  { label: "已通过", value: "3" }
]

// 获取 HALT-HASS 状态类型
const getHaltHassStatusType = (status: number) => {
  const map: Record<number, string> = { 0: "info", 1: "warning", 2: "danger", 3: "success" }
  return map[status] || "info"
}

// 获取 HALT-HASS 状态文本
const getHaltHassStatusText = (status: number) => {
  const map: Record<number, string> = { 0: "草稿", 1: "待审核", 2: "待修改", 3: "已通过" }
  return map[status] || "未知"
}

// 获取 HALT-HASS 工艺列表
const getHaltHassTableData = () => {
  haltHassLoading.value = true
  getHaltHassProcessList({
    currentPage: haltHassPagination.currentPage,
    pageSize: haltHassPagination.pageSize,
    name: haltHassSearchData.name,
    status: haltHassSearchData.status
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

// HALT-HASS 重置搜索
const resetHaltHassSearch = () => {
  haltHassSearchData.name = ""
  haltHassSearchData.status = ""
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

// 查看 HALT-HASS 详情
const handleHaltHassView = (row: HaltHassProcessListItem) => {
  router.push(`/testmanage/halt-hass/detail/${row.id}`)
}

// 提交 HALT-HASS 审核
const handleHaltHassSubmitCheck = (row: HaltHassProcessListItem) => {
  ElMessageBox.confirm(`确认提交工艺「${row.name}」进行审核？`, "提交审核", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    submitHaltHassToCheck({ id: row.id }).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("提交成功")
        getHaltHassTableData()
      } else {
        ElMessage.error(res.msg || "提交失败")
      }
    })
  })
}

// 删除 HALT-HASS 工艺
const handleHaltHassDelete = (row: HaltHassProcessListItem) => {
  ElMessageBox.confirm(`确认删除工艺「${row.name}」？删除后不可恢复！`, "删除确认", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteHaltHassProcess(row.id).then((res: any) => {
      if (res.code === 0) {
        ElMessage.success("删除成功")
        getHaltHassTableData()
      } else {
        ElMessage.error(res.msg || "删除失败")
      }
    })
  })
}

// 判断是否可删除/提交
const canHaltHassDelete = (status: number) => status === 0 || status === 2
const canHaltHassSubmit = (status: number) => status === 0 || status === 2

// Tab 切换处理
const handleTabClick = (tab: TabsPaneContext) => {
  router.replace({ query: { ...router.currentRoute.value.query, tab: tab.props.name } })
  if (tab.props.name === "halt-hass") {
    getHaltHassTableData()
  }
}

// 初始化
onMounted(() => {
  const { tab } = router.currentRoute.value.query
  if (tab === "halt-hass") {
    activeTab.value = "halt-hass"
    getHaltHassTableData()
  }
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 普通工艺 Tab -->
        <el-tab-pane label="普通测试工艺" name="normal">
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
                    <el-button v-permission="['12']" :icon="CirclePlus" type="primary" @click="addTest"
                      >新增流程</el-button
                    >
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
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>

        <!-- HALT-HASS 工艺 Tab -->
        <el-tab-pane label="HALT-HASS 工艺" name="halt-hass">
          <el-card v-loading="haltHassLoading" shadow="never">
            <!-- 搜索区域 -->
            <div class="search-wrapper">
              <el-form :inline="true" :model="haltHassSearchData">
                <el-form-item label="工艺名称">
                  <el-input
                    v-model="haltHassSearchData.name"
                    placeholder="请输入工艺名称"
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item label="状态">
                  <el-select
                    v-model="haltHassSearchData.status"
                    placeholder="请选择状态"
                    clearable
                    style="width: 120px"
                  >
                    <el-option
                      v-for="item in haltHassStatusOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button :icon="Search" type="primary" @click="handleHaltHassSearch">查询</el-button>
                  <el-button :icon="Refresh" @click="resetHaltHassSearch">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 工具栏 -->
            <div class="toolbar-wrapper">
              <div>
                <el-tooltip content="HALT-HASS 工艺需在客户端创建和编辑">
                  <el-button :icon="CirclePlus" type="primary" disabled>新增工艺</el-button>
                </el-tooltip>
              </div>
              <div>
                <el-tooltip content="刷新当前页">
                  <el-button :icon="RefreshRight" circle type="primary" @click="getHaltHassTableData" />
                </el-tooltip>
              </div>
            </div>

            <!-- 表格 -->
            <div class="table-wrapper">
              <el-table :data="haltHassTableData" stripe border>
                <el-table-column prop="id" label="工艺ID" align="center" width="80" />
                <el-table-column prop="name" label="工艺名称" align="center" min-width="120" />
                <el-table-column prop="version" label="版本" align="center" width="100" />
                <el-table-column label="关联电路板组" align="center" min-width="150">
                  <template #default="{ row }">
                    <el-tag v-for="bg in row.boardGroups" :key="bg.id" type="info" size="small" style="margin: 2px">
                      {{ bg.name }}
                    </el-tag>
                    <span v-if="!row.boardGroups || row.boardGroups.length === 0">-</span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" align="center" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getHaltHassStatusType(row.status)">{{ getHaltHassStatusText(row.status) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="userName" label="创建人" align="center" width="100" />
                <el-table-column prop="createdAt" label="创建时间" align="center" width="160" />
                <el-table-column prop="auditNum" label="审核次数" align="center" width="80" />
                <el-table-column label="操作" align="center" width="200" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link :icon="View" @click="handleHaltHassView(row)">详情</el-button>
                    <el-button
                      v-if="canHaltHassSubmit(row.status)"
                      type="warning"
                      link
                      @click="handleHaltHassSubmitCheck(row)"
                    >
                      提交审核
                    </el-button>
                    <el-button
                      v-if="canHaltHassDelete(row.status)"
                      type="danger"
                      link
                      :icon="Delete"
                      @click="handleHaltHassDelete(row)"
                    >
                      删除
                    </el-button>
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

    <!-- 详情抽屉 (普通工艺) -->
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
            <el-button :icon="Search" style="margin-right: 10px" type="primary" @click="handleSearch">查询 </el-button>
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
              <el-link v-for="i in row.link" class="el-link" type="primary" @click="handleLinkDetail(row, i)" :key="i"
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

    <!-- 提交审核对话框 (普通工艺) -->
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
