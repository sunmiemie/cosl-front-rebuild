<!--测试类型列表-->

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { getTestTypeDataApi, createTestTypeDataApi, updateTestTypeDataApi } from "@/api/testtype"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
// 显示与隐藏
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const dialogVisible = ref<boolean>(false)
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入测试类型名称" }]
})
const formData = reactive<any>({
  id: "",
  name: ""
})
const handleCreate = () => {
  if (currentUpdateId.value === undefined) {
    delete formData.id
    createTestTypeDataApi(formData)
      .then(() => {
        ElMessage.success("新增成功")
        getTableData()
      })
      .finally(() => {
        Object.keys(formData).forEach((key) => (formData[key] = ""))
        dialogVisible.value = false
      })
  } else {
    updateTestTypeDataApi({
      name: formData.name,
      id: currentUpdateId.value
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
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.id = ""
  formData.name = ""
}
const currentUpdateId = ref<undefined | string>(undefined)

const headers = ref([
  { prop: "number", label: "类型ID", align: "center" },
  { prop: "name", label: "测试类型", align: "center" },
  { prop: "processCount", label: "所属流程数量", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])

const TableData = ref<any[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: ""
})

const getTableData = () => {
  loading.value = true
  getTestTypeDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    name: searchData.name || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      TableData.value = res.data.list
    })
    .finally(() => {
      loading.value = false
    })
}
const handleLink = (data: any) => {
  dialogVisible.value = true
  currentUpdateId.value = data.number
  typeof currentUpdateId.value === "string" ? (formData.id = currentUpdateId.value) : (formData.name = data.name)
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchData.name = ""
  getTableData()
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="类型名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button icon="CirclePlus" type="primary" @click="dialogVisible = true">新增测试类型</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe>
          <template #link="{ row }">
            <el-link :disabled="row.number <= 5" type="primary" class="el-link" @click="handleLink(row)">编辑</el-link>
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
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增测试类型' : '修改测试类型'"
      @close="resetForm"
      width="30%"
    >
      <el-form label-width="100px" :model="formData" :rules="formRules">
        <el-form-item prop="name" label="测试类型名称:" label-width="110">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
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
