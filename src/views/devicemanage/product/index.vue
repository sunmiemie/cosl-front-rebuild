<!--产品管理-->

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="产品 ID">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="getTableData">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button v-permission="['6']" type="primary" :icon="CirclePlus" @click="addTest">新增产品</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <el-dialog
        v-model="dialogVisible"
        width="40%"
        :title="currentUpdateId === undefined ? '新增产品' : '编辑产品'"
        @close="closeProduct"
      >
        <el-form :model="formData" :rules="formRules">
          <el-form-item prop="name" label="产品名称" label-width="100">
            <el-input v-model="formData.name" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="resect">取消</el-button>
          <el-button type="primary" @click="handleCreate">确认</el-button>
        </template>
      </el-dialog>
      <div class="table-wrapper">
        <TableComponent :columnData="headers" :tableData="TableData" v-loading="Loading">
          <template #link="{ row }">
            <el-link v-if="checkPermission(['6'])" :disabled="row.id === 1" type="primary" class="el-link" @click="handleLink(row, '编辑')"
              >编辑
            </el-link>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, type Ref } from "vue"
import TableComponent from "@/components/Table/index.vue"
import { Search, Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"
import { createProductDataApi, updateProductDataApi, getProductDataApi } from "@/api/product"
import { ElMessage, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import { checkPermission } from "@/utils/permission"

const loading = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const currentUpdateId = ref<any>()
const Loading: Ref<boolean> = ref(false)
// 查询参数
const searchData = reactive<any>({
  name: "",
  id: ""
})
const formData = reactive<any>({
  id: "",
  name: ""
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入产品名称" }]
})
const closeProduct = () => {
  currentUpdateId.value = undefined
  formData.id = ""
  formData.name = ""
}
const handleCreate = () => {
  if (currentUpdateId.value === undefined) {
    delete formData.id
    createProductDataApi(formData)
      .then(() => {
        ElMessage.success("新增成功")
        getTableData()
      })
      .finally(() => {
        Object.keys(formData).forEach((key: any) => (formData[key] = ""))
        dialogVisible.value = false
      })
  } else {
    updateProductDataApi({
      name: formData.name,
      id: formData.id
    })
      .then(() => {
        ElMessage.success("修改成功")
        getTableData()
      })
      .finally(() => {
        dialogVisible.value = false
      })
  }
}

const resect = () => {
  dialogVisible.value = false
}

const resetSearch = () => {
  Object.keys(searchData).forEach((key: any) => (searchData[key] = ""))
  getTableData()
}

// 6 代表添加、编辑产品权限
const headers = checkPermission(["6"]) ?
  ref<any>([
    { prop: "id", label: "产品 ID", align: "center" },
    { prop: "name", label: "产品名称", align: "center" },
    { prop: "link", label: "操作", type: "link", align: "center" }
  ]) :
  ref<any>([
    { prop: "id", label: "产品 ID", align: "center" },
    { prop: "name", label: "产品名称", align: "center" },
  ]);

const TableData = ref<any>([])
/**
 * Get table data info
 * @description get table data from api
 * @author frank
 * @date 2021-12-07
 * @returns {Promise<void>}
 */
const getTableData = () => {
  Loading.value = true
  // get table data from api with current page and page size as params
  getProductDataApi({
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
}

// link操作
const handleLink = (data: any, i: any) => {
  if (i == "详情") {
    /* empty */
  } else {
    currentUpdateId.value = i
    formData.id = data.id
    formData.name = data.name
    dialogVisible.value = true
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
