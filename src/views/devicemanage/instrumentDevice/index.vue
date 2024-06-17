<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="仪器id">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="仪器名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
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
          <el-button type="primary" :icon="CirclePlus" @click="addTest">新增仪器</el-button>
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
      @close="closedInstrument"
      :title="currentUpdateId === undefined ? '新增仪器' : '编辑仪器'"
    >
      <el-form :model="formData">
        <el-form-item label="仪器名称" label-width="100">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="仪器型号" label-width="100">
          <el-select v-model="formData.type" placeholder="请选择">
            <el-option v-for="item in TypeList" :label="item.name" :value="item.id" :key="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closedInstrument">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, type Ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { Search, Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import { getInstrumentDataApi, createInstrumentDataApi, updateInstrumentDataApi } from "@/api/instrument/index"
import { usePagination } from "@/hooks/usePagination"
import { getProductDataApi } from "@/api/product/index"
import { ElMessage } from "element-plus"
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const dialogVisible = ref<boolean>(false)
const currentUpdateId = ref()
const Loading: Ref<boolean> = ref(false)
type SearchDataType = {
  name: string
  id: string
}
const formData = reactive({
  name: "",
  id: null,
  type: null
})

const handleCreate = () => {
  if (currentUpdateId.value === undefined) {
    createInstrumentDataApi(formData)
      .then(() => {
        ElMessage.success("新增成功")
        getTableData()
      })
      .finally(() => {
        dialogVisible.value = false
        Object.keys(formData).forEach((key) => (formData[key] = ""))
      })
  } else {
    updateInstrumentDataApi({
      name: formData.name,
      type: formData.type,
      id: formData.id
    })
      .then(() => {
        ElMessage.success("编辑成功")
        getTableData()
      })
      .finally(() => {
        dialogVisible.value = false
        Object.keys(formData).forEach((key) => (formData[key] = ""))
      })
  }
}

// 查询参数
const searchData = reactive<SearchDataType>({
  name: "",
  id: ""
})
const TypeList = ref([])

// 查询逻辑 重置
const handleSearch = () => {
  getTableData()
}
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  getTableData()
}

const headers = ref([
  { prop: "id", label: "仪器id", align: "center", fixed: "left" },
  { prop: "label", label: "仪器名称", align: "center" },
  { prop: "product", label: "关联产品", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "right" }
])

const TableData = ref([])

const closedInstrument = () => {
  dialogVisible.value = false
  currentUpdateId.value = undefined
  Object.keys(formData).forEach((key) => (formData[key] = ""))
}

const getTableData = () => {
  Loading.value = true
  getInstrumentDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id,
    name: searchData.name
  })
    .then((res) => {
      TableData.value = res.data.list
      paginationData.total = res.data.total
    })
    .finally(() => {
      Loading.value = false
    })
  getProductDataApi({
    currentPage: 1,
    size: 999999
  }).then((res) => {
    TypeList.value = res.data.list.filter((item) => {
      return item.id !== 1
    })
  })
}

// link操作
const handleLink = (data, i) => {
  if (i == "详情") {
    /* empty */
  } else {
    console.log(data)
    currentUpdateId.value = data.id
    dialogVisible.value = true
    formData.id = data.id
    formData.name = data.label
    formData.type = data.productId
  }
}

// 新增仪器
const addTest = () => {
  dialogVisible.value = true
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
