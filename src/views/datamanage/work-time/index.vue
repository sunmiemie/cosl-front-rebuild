<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from "vue"
import { usePagination, useDetailPagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { GetUserData } from "@/api/user/types/user"
import { GetWorkTimeData } from "@/api/work-time/types/work-time"
import { getUserDataApi } from "@/api/user"
import { getWorkTimeDataApi } from "@/api/work-time"

const searchData = reactive({
  userId: "",
  username: "",
  nickname: ""
})
const clearSearchData = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
}
const userTableHeaders = ref([
  { prop: "id", label: "用户 ID", align: "center" },
  { prop: "username", label: "用户名", align: "center" },
  { prop: "nickname", label: "昵称", align: "center" }
])
const userTableData = ref<GetUserData[]>([])
const gettingUsers = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const { paginationDetailData, handleDetailCurrentChange, handleDetailSizeChange } = useDetailPagination()
const filterEmptyParams = (params: any) => {
  const newParams: any = {}
  Object.keys(params).forEach((key) => {
    if (params[key] !== "" && params[key] !== null && params[key] !== undefined) {
      newParams[key] = params[key]
    }
  })
  return newParams
}

const getUserTableData = async () => {
  gettingUsers.value = true

  const params = filterEmptyParams({
    ...searchData,
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  })

  getUserDataApi(params)
    .then((res) => {
      if (res && res.data) {
        paginationData.total = res.data.total
        userTableData.value = res.data.list
      } else {
        userTableData.value = []
        paginationData.total = 0
      }
    })
    .catch(() => {
      userTableData.value = []
    })
    .finally(() => {
      gettingUsers.value = false
    })
}
const resetSearch = () => {
  clearSearchData()
  getUserTableData()
}

const currentRow = ref()
const handleCurrentRowChange = (val: GetUserData | undefined) => {
  currentRow.value = val
  getWorkTimeTableData()
}
const username = computed(() => currentRow.value?.username || "")

const workTimeTableHeaders = ref([
  { prop: "date", label: "日期", align: "center" },
  { prop: "work_time", label: "工时", align: "center" }
])
const gettingWorkTime = ref(false)
const workTimeTableData = ref<GetWorkTimeData[]>([])
const getWorkTimeTableData = async () => {
  if (!currentRow.value?.id) {
    workTimeTableData.value = []
    paginationDetailData.total = 0
    return
  }
  gettingWorkTime.value = true

  const params = filterEmptyParams({
    userId: currentRow.value.id,
    currentPage: paginationDetailData.currentPage,
    pageSize: paginationDetailData.pageSize
  })

  getWorkTimeDataApi(params)
    .then((res) => {
      if (res && res.data) {
        workTimeTableData.value = res.data.list
        paginationDetailData.total = res.data.total
      } else {
        workTimeTableData.value = []
        paginationDetailData.total = 0
      }
    })
    .catch(() => {
      workTimeTableData.value = []
    })
    .finally(() => {
      gettingWorkTime.value = false
    })
}

onMounted(() => {
  // getUserTableData() // watch with immediate: true already calls this
})

watch([() => paginationData.currentPage, () => paginationData.pageSize], getUserTableData, { immediate: true })
watch([() => paginationDetailData.currentPage, () => paginationDetailData.pageSize], getWorkTimeTableData)
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="search-wrapper" shadow="never">
          <el-form ref="searchFormRef" :inline="true" :model="searchData" label-width="auto">
            <el-form-item label="用户 ID">
              <el-input v-model="searchData.userId" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="searchData.username" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="searchData.nickname" placeholder="请输入" />
            </el-form-item>
            <el-form-item>
              <el-button icon="Search" type="primary" @click="getUserTableData">查询</el-button>
              <el-button icon="Refresh" @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        <el-card v-loading="gettingUsers" shadow="never">
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
        <el-card v-loading="gettingWorkTime" shadow="never">
          <div class="toolbar-wrapper">
            <div>
              <el-tooltip content="刷新工时数据">
                <el-button circle icon="RefreshRight" type="primary" @click="getWorkTimeTableData" />
              </el-tooltip>
            </div>
          </div>
          <el-text
            v-show="username !== ''"
            class="mx-1"
            size="large"
            style="margin-bottom: 10px; display: inline-block"
          >
            用户名：{{ username }}
          </el-text>
          <TableComponent
            class="table-wrapper"
            :column-data="workTimeTableHeaders"
            :tableData="workTimeTableData"
            stripe
          />
          <el-pagination
            class="pager-wrapper"
            background
            :layout="paginationDetailData.layout"
            :page-sizes="paginationDetailData.pageSizes"
            :total="paginationDetailData.total"
            :page-size="paginationDetailData.pageSize"
            :currentPage="paginationDetailData.currentPage"
            @size-change="handleDetailSizeChange"
            @current-change="handleDetailCurrentChange"
          />
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
