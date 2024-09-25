<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { checkPermission } from "@/utils/permission"
import { createPsiModelDataApi, getPsiModelDataApi, updatePsiModelDataApi } from "@/api/psimodel"

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive<any>({
  id: "",
  name: "",
  supplier: "",
  des: ""
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入类型名称" }],
  supplier: [{ required: true, trigger: "blur", message: "请输入供应商" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createPsiModelDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updatePsiModelDataApi({
          id: formData.id,
          name: formData.name,
          supplier: formData.supplier,
          des: formData.des
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
  formData.id = ""
  formData.name = ""
  formData.supplier = ""
  formData.des = ""
  currentUpdateId.value = undefined
}
const currentUpdateId = ref<undefined | string>(undefined)

const headers = checkPermission(['9']) ? ref([
  { prop: "psimodel_id", label: "主机型号ID", align: "center" },
  { prop: "psimodel_name", label: "主机型号名称", align: "center" },
  { prop: "supplier", label: "供应商", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center" }
]) :
  ref([
    { prop: "psimodel_id", label: "主机型号ID", align: "center" },
    { prop: "psimodel_name", label: "主机型号名称", align: "center" },
    { prop: "supplier", label: "供应商", align: "center" }
  ]);

const TableData = ref([])

// const BoardModelData = ref<GetBoardModelData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  id: "",
  name: ""
})
const getTableData = async () => {
  loading.value = true
  getPsiModelDataApi({
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
  for (let i = 0; i < TableData.value.length; i++) {
    console.log(TableData.value[i])
  }
}
const selectedRows = ref([])
const handleSelectionChange = (val: any) => {
  console.log("index", val)
  selectedRows.value = val
}
const handleLink = (data: any) => {
  currentUpdateId.value = data.psimodel_id
  dialogVisible.value = true
  // 编辑
  formData.id = currentUpdateId.value
  formData.name = data.psimodel_name
  formData.supplier = data.supplier
  formData.des = data.psimodel_des
}
const addHost = () => {
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
          <el-button v-permission="['9']" type="primary" :icon="CirclePlus" @click="addHost">新增主机型号</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe @selection-change="handleSelectionChange">
          <template v-if="checkPermission(['9'])" #link="{ row }">
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
      :title="currentUpdateId === undefined ? '新增主机型号' : '修改主机型号'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item label="型号ID" v-if="currentUpdateId !== undefined">
          <el-input disabled v-model="formData.id" />
        </el-form-item>
        <el-form-item prop="name" label="型号名称:">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="supplier" label="供应商名称:">
          <el-input v-model="formData.supplier" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="des" label="型号描述:">
          <el-input v-model="formData.des" type="textarea" placeholder="请输入" />
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
