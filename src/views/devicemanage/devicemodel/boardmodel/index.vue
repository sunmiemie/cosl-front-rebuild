<!--电路板型号管理-->

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createBoardModelDataApi, getBoardModelDataApi, updateBoardModelDataApi } from "@/api/boardmodel"
import { getAllInstrumentsDataApi } from "@/api/instrument"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { type GetBoardModelData } from "@/api/boardmodel/types/boardmodel"
import { checkPermission } from "@/utils/permission"

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  id: null,
  name: "",
  des: "",
  type: "",
  model: "",
  isCommon: false
})
const formRules: FormRules = reactive({
  id: [{ required: true, trigger: "blur", message: "请输入物料号" }],
  name: [{ required: true, trigger: "blur", message: "请输入型号名称" }],
  type: [{ required: true, trigger: "blur", message: "请选择类型" }],
  model: [{ required: true, trigger: "blur", message: "请输入规格型号" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (formData.type === "general") {
        formData.type = ""
        formData.isCommon = true
      } else {
        formData.isCommon = false
      }
      if (currentUpdateId.value === undefined) {
        createBoardModelDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .catch((err) => {
            ElMessage.error(err.response.data.error)
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateBoardModelDataApi({
          id: formData.id,
          name: formData.name,
          type: formData.type,
          des: formData.des,
          model: formData.model,
          isCommon: formData.isCommon
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
  formData.des = ""
  formData.type = ""
}
const currentUpdateId = ref<undefined | string>(undefined)

// 7 代表“新增、编辑电路板型号”权限
const headers = checkPermission(["7"])
  ? ref([
      { prop: "id", label: "电路板物料号", align: "center" },
      { prop: "name", label: "电路板型号名称", align: "center" },
      { prop: "model", label: "规格型号", align: "center" },
      { prop: "type", label: "关联仪器", align: "center" },
      { prop: "link", label: "操作", type: "link", align: "center" }
    ])
  : ref([
      { prop: "id", label: "电路板物料号", align: "center" },
      { prop: "name", label: "电路板型号名称", align: "center" },
      { prop: "model", label: "规格型号", align: "center" },
      { prop: "type", label: "关联仪器", align: "center" }
    ])

const TableData = ref<GetBoardModelData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  id: "",
  name: ""
})

const getTableData = async () => {
  loading.value = true
  getBoardModelDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    id: searchData.id || undefined,
    name: searchData.name || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      TableData.value = []
      // 检查后端返回的数据状态
      if (res.code === 0) {
        // 遍历list数组
        res.data.list.forEach((item) => {
          // 提取instrument_data中的name字段，并合并成一个字符串
          const type = item.instrument_data.map((data) => data.name).join(",")
          // 创建一个新的对象，包含除了instrument_data之外的所有字段和合并后的name字段
          const newItem = {
            ...item,
            type // 添加合并后的name字段
          }
          // 将处理后的对象推入TableData数组
          TableData.value.push(newItem)
        })
      } else {
        // 处理错误情况
        console.error("Error fetching data from backend:", res.code)
      }
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
  const result = await getAllInstrumentsDataApi({})

  DetailList.value = result.data
}
const selectedRows = ref([])

const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}
// 编辑
const DetailList = ref<any>([])
const handleLink = async (data: any) => {
  formData.type = data.instrument_data[0].id
  formData.model = data.model

  currentUpdateId.value = data.id
  formData.name = data.name
  formData.des = data.des
  formData.id = data.id
  dialogVisible.value = true
}
// 新增电路板型号
const addType = async () => {
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
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
        <el-form-item prop="number" label="物料号">
          <el-input v-model="searchData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="型号名称">
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
          <!-- 7 代表“新增、编辑电路板型号”权限 -->
          <el-button v-permission="['7']" type="primary" icon="CirclePlus" @click="addType">新增电路板型号</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe @selection-change="handleSelectionChange">
          <!-- 7 代表“新增、编辑电路板型号”权限 -->
          <template v-if="checkPermission(['7'])" #link="{ row }">
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

    <!-- 新增/修改电路板类型 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增电路板类型' : '修改电路板类型'"
      @close="resetForm"
      width="50%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="130px" label-position="left">
        <el-form-item prop="id" label="电路板物料号">
          <el-input v-model="formData.id" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="电路板物料名称">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="model" label="电路板规格型号">
          <el-input v-model="formData.model" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="关联仪器">
          <el-select v-model="formData.type" placeholder="请选择">
            <el-option value="general" label="通用" />
            <el-option v-for="item in DetailList" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="des" label="电路板描述:">
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
