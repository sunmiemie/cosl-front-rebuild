<!-- 仪器管理 -->

<script setup lang="ts">
import { ref, reactive, watch, type Ref, h, onMounted } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { Search, Refresh, CirclePlus, RefreshRight, Delete } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { checkPermission } from "@/utils/permission"
import {
  getInstrumentDataApi,
  createInstrumentDataApi,
  updateInstrumentDataApi,
  deleteInstrumentDataApi
} from "@/api/instrument"
import { getProductDataApi } from "@/api/product"

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const dialogVisible = ref(false)
const currentUpdateId = ref<any>()
const Loading: Ref<boolean> = ref<any>(false)

const formRef = ref<FormInstance | null>(null)
const formData = reactive<any>({
  name: "",
  id: null,
  type: null
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入仪器名称" }],
  type: [{ required: true, trigger: "blur", message: "请选择关联产品" }]
})

const resetFormData = () => {
  dialogVisible.value = false
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
}

const handleCreate = () => {
  // 表单校验
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createInstrumentDataApi(formData)
          .then((res) => {
            if (res.status === "exists") {
              ElMessageBox.confirm(res.message, "警告", {
                type: "warning",
                confirmButtonText: "是",
                cancelButtonText: "否"
              }).then(() => {
                createInstrumentDataApi({ ...formData, force: true })
                  .then(() => {
                    ElMessage.success("新增成功")
                    getTableData()
                  })
                  .catch((err) => {
                    ElMessage.error(err.response.data.error)
                  })
                  .finally(() => {
                    resetFormData()
                  })
              })
            } else {
              ElMessage.success("新增成功")
              getTableData()
              resetFormData()
            }
          })
          .catch((err) => {
            ElMessage.error(err.response.data.error)
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
            resetFormData()
          })
      }
    }
  })
}

// 查询参数
const searchData = reactive<any>({
  name: "",
  id: ""
})
const TypeList = ref<any>([])

const resetSearch = () => {
  Object.keys(searchData).forEach((key: any) => (searchData[key] = ""))
  getTableData()
}

const headers = checkPermission(["5"])
  ? ref<any>([
      { prop: "id", label: "仪器id", align: "center", fixed: "left" },
      { prop: "label", label: "仪器名称", align: "center" },
      { prop: "product", label: "关联产品", align: "center" },
      { prop: "link", label: "操作", type: "link", align: "center" }
    ])
  : ref<any>([
      { prop: "id", label: "仪器id", align: "center", fixed: "left" },
      { prop: "label", label: "仪器名称", align: "center" },
      { prop: "product", label: "关联产品", align: "center" }
    ])

const TableData = ref<any>([])

const closedInstrument = () => {
  dialogVisible.value = false
  currentUpdateId.value = undefined
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
}

const getTableData = () => {
  Loading.value = true
  getInstrumentDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id,
    name: searchData.name,
    paging: true
  })
    .then((res) => {
      TableData.value = res.data.list
      paginationData.total = res.data.total
    })
    .finally(() => {
      Loading.value = false
    })
}

const getProducts = () => {
  getProductDataApi({ not_paging: true }).then((res) => {
    TypeList.value = res.data
  })
}

// link操作
const handleLink = (data: any, i: any) => {
  if (i == "编辑") {
    currentUpdateId.value = data.id
    dialogVisible.value = true
    formData.id = data.id
    formData.name = data.label
    formData.type = data.productId
  } else if (i == "删除") {
    ElMessageBox.confirm("确定删除这个仪器吗？", "警告", {
      type: "warning",
      icon: h(Delete, { style: "color: red;" }),
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      confirmButtonClass: "el-button--danger",
      cancelButtonClass: "el-button--default"
    }).then(() => {
      deleteInstrumentDataApi(data.id)
        .then(() => {
          ElMessage.success("删除成功")
          getTableData()
        })
        .catch((err) => {
          ElMessage.error(err.response.data.error)
        })
    })
  }
}

onMounted(getProducts)

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="仪器 ID">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="仪器名称">
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
          <el-button v-permission="['5']" type="primary" :icon="CirclePlus" @click="dialogVisible = true"
            >新增仪器</el-button
          >
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :columnData="headers" :tableData="TableData" v-loading="Loading">
          <template v-if="checkPermission(['5'])" #link="{ row }">
            <el-link type="primary" style="margin-right: 10px" class="el-link" @click="handleLink(row, '编辑')"
              >编辑</el-link
            >
            <el-link type="danger" class="el-link" @click="handleLink(row, '删除')">删除</el-link>
          </template>
        </TableComponent>
      </div>
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
      <el-form ref="formRef" :model="formData" :rules="formRules">
        <el-form-item prop="name" label="仪器名称" label-width="100">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="仪器型号" label-width="100">
          <el-select v-model="formData.type" placeholder="请选择" @visible-change="getProducts">
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
