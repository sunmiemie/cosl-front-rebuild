<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { type FormInstance } from "element-plus"
import { useRouter } from "vue-router"
import { usePagination } from "@/hooks/usePagination"
import { checkListDataApi } from "@/api/check"
import { getTestTypeDataApi } from "@/api/testtype"
import TableComponent from "@/components/Table/index.vue"


const testTypeList = ref<any>([])
const CheckDialog = ref<boolean>(false)
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const router = useRouter()
//#region 增


const headers = ref<any>([
  { prop: "report_id", label: "报告ID", align: "center" },
  { prop: "report_name", label: "测试名称", align: "center" },
  { prop: "process_type", label: "测试类型", align: "center" },
  { prop: "status", label: "流程状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<any>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  number: "",
  name: "",
  type: ""
})
const defineLink = (status: any) => {
  switch (status) {
    case "1":
      return { 1: "审核" }
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
const getTableData = () => {
  loading.value = true
  checkListDataApi({
    id: searchData.number,
    name: searchData.name,
    type: searchData.type
  })
    .then((res: any) => {
      TableData.value = res.list
    })
    .finally(() => {
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].status)
      }
      loading.value = false
    })
}
const handleLink = (data: any, i: any) => {
  if (i === "审核") {
    router.push({ name: "checktestlist", query: data })
  }
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchData.name = ""
  searchData.type = ""
  searchData.number = ""
  getTableData()
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="报告ID">
          <el-input v-model="searchData.number" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="测试名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="测试类型">
          <el-select
            @visible-change="getTestTypeData"
            style="width: 150px"
            v-model="searchData.type"
            placeholder="请选择"
          >
            <el-option v-for="item in testTypeList" :value="item.number" :label="item.name" :key="item.number" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe>
          <template #status="{ row }">
            <el-tag v-if="row['status'] === '1'" type="warning"> 待审核 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row['link']" type="primary" @click="handleLink(row, i)" :key="i">{{ i }}</el-link>
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
  </div>
</template>

<style lang="scss" scoped>
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

.test-check {
  position: relative;
}

.check-file {
  margin-top: 20px;
  width: 15vw;
  height: 200px;
  border: 1px dashed #ccc;
}
</style>
