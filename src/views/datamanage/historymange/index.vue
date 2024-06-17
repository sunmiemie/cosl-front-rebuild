<script lang="ts" setup>
import { reactive, ref, watch, type Ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { ElButton, ElDrawer } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { fileDownoload } from '@/api/file/index'
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
const route = useRoute()
//#region 增
const dialogVisibleEdit = ref<boolean>(false)
// 测试审核工艺
const DialogCheck = ref<boolean>(false)

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
//#region 改
const currentUpdateId = ref<undefined | string>(undefined)

//const tableData = ref<GetTableData[]>([])
interface TableDataType {
  reportNumber: string
  reportType: string
  reportTime: string
  reportAuthor: string
  status: any
  link?: any
}

const headers1 = ref([
  { prop: "reportNumber", label: "报告编号", align: "center" },
  { prop: "reportType", label: "报告类型", align: "center" },
  { prop: "reportAuthor", label: "测试人 ", align: "center" },
  { prop: "reportTime", label: "生成时间", align: "center" },
  { prop: "status", label: "报告状态", type: "tag", align: "center" },
  { prop: "link", label: "操作 ", type: "link" }
])
const TableData = ref<Array<TableDataType>>([
  {
    reportNumber: "123456781",
    reportType: "功能性测试",
    reportAuthor: "editor",
    reportTime: "2025年5月3日",
    status: "0"
  },
  {
    reportNumber: "123456781",
    reportType: "功能性测试",
    reportAuthor: "editor",
    reportTime: "2025年5月3日",
    status: "0"
  },
  {
    reportNumber: "123456781",
    reportType: "功能性测试",
    reportAuthor: "editor",
    reportTime: "2025年5月3日",
    status: "1"
  }
])

const searchFormRef = ref<FormInstance | null>(null)
// 查询
const searchData = reactive({
  reportNumber: "",
  reportAuthor: "",
  reportType: "",
  reportTime: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "查看", 2: "导出" }
    case "1":
      return { 1: "查看", 2: "导出" }
  }
}
const getTableData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    console.log(TableData.value[i])
    TableData.value[i].link = defineLink(TableData.value[i].status)
  }
}

const handleLink = (data: any, i: string) => {
   if(i=="导出"){
    fileDownoload(data.reportNumber).then((res:any) => {
    console.log(res)
    download(res, 'application/pdf', data.reportNumber)
  })
    
   }else{
  return
   }
}
const download = (file: any, fileType: string, fileName: string) => {
  const blob = new Blob([file], {
    type: fileType
  })
  const a = document.createElement('a')
  const href = URL.createObjectURL(blob)
  a.href = href
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  // 下载完成移除a元素
  document.body.removeChild(a)
  // 释放blob对象
  URL.revokeObjectURL(href)
}

const handleSearch = () => {
  //paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

/**
 * 重置查询条件
 */
const resetSearch = () => {
  // 重置工艺ID
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <el-card v-loading="loading" shadow="never" class="search-wrapper">
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <el-form-item label="报告编号">
              <el-input v-model="searchData.reportNumber" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="测试人">
              <el-input v-model="searchData.reportAuthor" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="报告类型">
              <el-select v-model="searchData.reportType" placeholder="请选择">
                <el-option label="功能性测试" value="功能性测试" />
              </el-select>
            </el-form-item>
            <el-form-item label="生成时间">
              <el-select v-model="searchData.reportTime" placeholder="请选择">
                <el-option label="2025年1月3日" value="2025年1月3日" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleSearch" style="margin-right: 10px">查询</el-button>
              <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card v-loading="loading" shadow="never">
          <div class="table-wrapper">
            <TableComponent :tableData="TableData" :column-data="headers1" stripe>
              <template #status="{ row }">
                <el-tag v-if="row.status === '0'" type="success"> 测试正常 </el-tag>
                <el-tag v-if="row.status === '1'" type="danger"> 测试异常 </el-tag>
              </template>

              <template #link="{ row }">
                <el-link v-for="i in row.link" type="primary" class="el-link" @click="handleLink(row, i)">{{
                  i
                }}</el-link>
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

              <el-button type="primary" @click="onSubmit" icon="Check" style="position: absolute; top: 120px; left: 41%"
                >确认提交</el-button
              >
            </el-form>
          </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.drawer-head {
  height: 60px;
}

:deep .el-upload-dragger {
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

:deep .el-button + .el-button {
  margin: 0;
}
</style>
