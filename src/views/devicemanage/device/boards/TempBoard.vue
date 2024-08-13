<!--临时电路板-->

<template>
  <el-card v-loading="loading" shadow="never" class="search-wrapper">
    <el-form ref="searchFormRef" :inline="true" :model="searchData">
      <el-form-item label="电路板 ID">
        <el-input v-model="searchData.id" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="序列号">
        <el-input v-model="searchData.serialNumber" placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card shadow="never">
    <div class="toolbar-wrapper">
      <div>
        <el-button
          type="primary"
          :icon="CirclePlus"
          style="width: 100%; margin-bottom: 10px"
          @click="dialogVisible = true"
          >新增临时电路板
        </el-button>
      </div>
      <div>
        <el-tooltip content="刷新当前页">
          <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
        </el-tooltip>
      </div>
    </div>
    <div class="table-wrapper">
      <TableComponent :columnData="headers" :tableData="TableData" v-loading="Loading">
        <template #link="{ row }">
          <el-link type="primary" class="el-link" @click="handleLink(row, '编辑')">编辑</el-link>
        </template>
      </TableComponent>
    </div>
    <!-- 分页 -->
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
  <el-dialog
    v-model="dialogVisible"
    width="30%"
    @close="closedTempBoard"
    :title="currentUpdateId === undefined ? '新增临时电路板' : '编辑临时电路板'"
  >
    <el-form :model="formData">
      <el-form-item label="序列号" label-width="100">
        <el-input v-model="formData.serialNumber" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="描述" label-width="100">
        <el-input v-model="formData.description" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closedTempBoard">取消</el-button>
      <el-button type="primary" @click="handleCreate">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, type Ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { Search, Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { ElMessage } from "element-plus"
import { createTempBoardApi, getTempBoardDataApi, updateTempBoardDataApi } from "@/api/temp-board"
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const dialogVisible = ref<boolean>(false)
const currentUpdateId = ref<any>()
const Loading: Ref<boolean> = ref<any>(false)

const formData = reactive<any>({
  serialNumber: "",
  description: ""
})

const handleCreate = () => {
  if (currentUpdateId.value === undefined) {
    createTempBoardApi({ ...formData })
      .then(() => {
        ElMessage.success("新增成功")
        getTableData()
      })
      .finally(() => {
        dialogVisible.value = false
        Object.keys(formData).forEach((key: any) => (formData[key] = ""))
      })
  } else {
    updateTempBoardDataApi({
      serialNumber: formData.serialNumber,
      description: formData.description,
      id: formData.id
    })
      .then(() => {
        ElMessage.success("编辑成功")
        getTableData()
      })
      .finally(() => {
        dialogVisible.value = false
        Object.keys(formData).forEach((key: any) => (formData[key] = ""))
      })
  }
}

// 查询参数
const searchData = reactive<any>({
  id: "",
  serialNumber: ""
})

// 查询逻辑 重置
const handleSearch = () => {
  getTableData()
}
const resetSearch = () => {
  Object.keys(searchData).forEach((key: any) => (searchData[key] = ""))
  getTableData()
}

const headers = ref<any>([
  { prop: "id", label: "ID", align: "center", fixed: "left" },
  { prop: "serialNumber", label: "序列号", align: "center" },
  { prop: "description", label: "描述", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])

const TableData = ref<any>([])

const closedTempBoard = () => {
  dialogVisible.value = false
  currentUpdateId.value = undefined
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
}

const getTableData = () => {
  Loading.value = true
  getTempBoardDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id,
    serialNumber: searchData.serialNumber
  })
    .then((res) => {
      TableData.value = res.data.list
      paginationData.total = res.data.total
    })
    .finally(() => {
      Loading.value = false
    })
}

// link操作
const handleLink = (data: any, i: any) => {
  if (i == "详情") {
    /* empty */
  } else {
    currentUpdateId.value = data.id
    dialogVisible.value = true
    formData.id = data.id
    formData.name = data.label
    formData.type = data.productId
  }
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<style scoped lang="scss">
.el-link {
  margin-right: 0;
}
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.table-wrapper {
  margin-bottom: 20px;
}
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
