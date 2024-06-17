<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createFixtureModelDataApi, getFixtureModelDataApi, updateFixtureModelDataApi } from "@/api/fixturemodel"
import { type GetFixtureModelData } from "@/api/fixturemodel/types/fixturemodel"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  // 新增夹具型号
  id: "",
  name: "",
  des: "",
  supplier: "",
  type: "",
  number: ""
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入类型名称" }],
  type: [{ required: false, trigger: "blur", message: "请选择绑定电路板" }],
  des: [{ required: true, trigger: "blur", message: "请输入描述" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createFixtureModelDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateFixtureModelDataApi({
          supplier: formData.supplier,
          name: formData.name,
          des: formData.des,
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
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.type = ""
  formData.number = ""
  formData.des = ""
}

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const headers = ref([
  { prop: "id", label: "夹具型号ID", align: "center" },
  { prop: "name", label: "夹具型号名称", align: "center" },
  { prop: "supplier", label: "夹具供应商", type: "center" },
  { prop: "link", label: "操作", type: "link", align: "right" }
])
const TableData = ref<GetFixtureModelData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  id: "",
  name: ""
})
const getTableData = () => {
  loading.value = true
  getFixtureModelDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id || undefined,
    name: searchData.name || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      TableData.value = res.data.list
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const selectedRows = ref([])
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}
const handleLink = async (data: any) => {
  // 编辑
  currentUpdateId.value = data.id
  formData.supplier = data.supplier
  formData.name = data.name
  formData.id = data.id
  formData.des = data.des
  dialogVisible.value = true
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchData.id = ""
  searchData.name = ""
  getTableData()
}
//#endregion
const addfixturetype = async () => {
  formData.supplier = ""
  dialogVisible.value = true
}
/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="number" label="型号ID">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="型号名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="addfixturetype">新增夹具型号</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe @selection-change="handleSelectionChange">
          <template #link="{ row }">
            <el-link type="primary" class="el-link" @click="handleLink(row)">编辑</el-link>
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
      :title="currentUpdateId === undefined ? '新夹具类型' : '修改夹具类型'"
      @close="resetForm"
      width="50%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px" label-position="left">
        <el-form-item prop="name" label="夹具型号名称:">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="夹具供应商">
          <el-input v-model="formData.supplier" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="des" label="夹具描述:">
          <el-input type="textarea" v-model="formData.des" placeholder="请输入" />
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
  margin-right: 0;
}
</style>
