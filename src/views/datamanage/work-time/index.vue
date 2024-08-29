<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { GetUserData } from "@/api/user/types/user"
import { usePagination } from "@/hooks/usePagination"
import { getUserDataApi } from "@/api/user"
import { GetWorkTimeData } from "@/api/work-time/types/work-time"
import { getWorkTimeDataApi } from "@/api/work-time"

interface User {
  id: number
  username: string
}

const userTableHeaders = ref([
  { prop: "id", label: "ID", align: "center" },
  { prop: "username", label: "用户名", align: "center" }
])

const userTableData = ref<GetUserData[]>([])
const loading = ref<boolean>(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const currentRow = ref()
const handleCurrentRowChange = (val: User | undefined) => {
  currentRow.value = val
  getWorkTimeTableData()
}

const searchData = reactive({
  userId: "",
  username: ""
})
const getUserTableData = async () => {
  loading.value = true

  const params = {
    ...searchData,
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  }
  getUserDataApi(params)
    .then((res) => {
      paginationData.total = res.data.total
      userTableData.value = res.data.list
    })
    .catch(() => {
      userTableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const resetSearch = () => {
  clearSearchData()
  getUserTableData()
}

const workTimeTableHeaders = ref([
  { prop: "date", label: "日期", align: "center" },
  { prop: "seconds", label: "秒数", align: "center" }
])
const workTimeLoading = ref<boolean>(false)
const workTimeTableData = ref<GetWorkTimeData[]>([])
const getWorkTimeTableData = async () => {
  workTimeLoading.value = true

  getWorkTimeDataApi({ userId: currentRow.value?.id })
    .then((res) => {
      workTimeTableData.value = res.data.list
    })
    .catch(() => {
      workTimeTableData.value = []
    })
    .finally(() => {
      workTimeLoading.value = false
    })
}

onMounted(getUserTableData)
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="search-wrapper" shadow="never">
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <el-form-item label="用户 ID">
              <el-input v-model="searchData.userId" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchData.username" placeholder="请输入" />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="getUserTableData">查询</el-button>
              <el-button icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card v-loading="loading" shadow="never">
          <TableComponent
            highlight-current-row
            class="table-wrapper"
            :column-data="userTableHeaders"
            :tableData="userTableData"
            stripe
            @current-change="handleCurrentRowChange"
          />
          <el-pagination
            class="pager-wrapper"
            background
            :layout="paginationData.layout"
            :page-sizes="paginationData.pageSizes"
            :total="paginationData.total"
            :page-size="paginationData.pageSize"
            :currentPage="paginationData.currentPage"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card v-loading="workTimeLoading" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <el-tooltip content="刷新工时数据">
                <el-button circle icon="RefreshRight" type="primary" @click="getWorkTimeTableData" />
              </el-tooltip>
            </div>
          </div>
          <TableComponent :column-data="workTimeTableHeaders" :tableData="workTimeTableData" stripe />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
  margin-bottom: 20px;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  margin-bottom: 20px;
}
</style>
