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
          @click="dialogVisible = true"
        >批量导入
        </el-button>
        <el-button type="warning" :icon="CirclePlus" @click="manualDialogVisible = true">手动添加</el-button>
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

  <!-- 批量导入 -->
  <el-dialog
    v-model="dialogVisible"
    width="30%"
  >
    <el-upload
      class="upload-demo"
      drag
      accept=".xls,.xlsx"
      headers="Content-Type':'multipart/form-data"
      action=""
      v-model:file-list="fileList.file"
      multiple
      style="width: 100%"
      :on-exceed="exceedFile"
      :on-error="handleError"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      :show-file-list="true"
      :auto-upload="false"
      :limit="1"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽文件至此 或 <em>点击选择文件上传</em></div>
      <template #tip>
        <div class="el-upload__tip">Tip：请上传xlsx后缀的表格文件</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button @click="dialogVisible = false; fileList.file = []">取消</el-button>
      <el-button type="primary" @click="generatePreview">确认</el-button>
    </template>
  </el-dialog>

  <!-- 预览 -->
  <el-dialog v-model="previewDialogVisible" width="1100" top="10vh">
    <el-row>
      <el-col :span="24">
        <h3 class="table-title">临时电路板预览数据</h3>
      </el-col>
    </el-row>
    <el-table class="preview-table" :data="preview.tempBoardData" max-height="250">
      <el-table-column property="序号" label="序号" width="100" />
      <el-table-column property="所属产品" label="所属产品" width="150" />
      <el-table-column property="测试品名称" label="测试品名称" width="150" />
      <el-table-column property="物料号" label="物料号" width="150" />
      <el-table-column property="规格型号" label="规格型号" width="150" />
      <el-table-column property="SN号" label="SN 号" width="150" />
      <el-table-column property="所属单位" label="所属单位" width="150" />
    </el-table>

    <el-row>
      <el-col :span="24">
        <h3 class="table-title">临时工单预览数据</h3>
      </el-col>
    </el-row>
    <el-table class="preview-table" :data="preview.testUnitData" max-height="250">
      <el-table-column property="序号" label="序号" width="100" />
      <el-table-column property="创建人" label="创建人" width="150" />
      <el-table-column property="测试品名称" label="测试品名称" width="150" />
      <el-table-column property="测试类型" label="测试类型" width="150" />
      <el-table-column property="测试内容" label="测试内容" width="150" />
      <el-table-column property="测试类别" label="测试类别" width="200" />
      <el-table-column property="委托人" label="委托人" width="150" />
    </el-table>

    <el-row>
      <el-col :span="24">
        <h3 class="table-title">确认导入吗？</h3>
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer dialog-footer-center">
        <el-button @click="previewDialogVisible = false; fileList.file = []">取消</el-button>
        <el-button type="primary" @click="bulkImport"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 手动添加 -->
  <el-dialog
    v-model="manualDialogVisible"
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
import {Search, Refresh, CirclePlus, RefreshRight, UploadFilled} from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import {ElMessage, ElMessageBox} from "element-plus"
import { createTempBoardApi, getTempBoardDataApi, updateTempBoardDataApi } from "@/api/temp-board"
import {createTempBatchDataApi, previewTempBatchDataApi} from "@/api/temp-batch";
import {useUserStore} from "@/store/modules/user";

const username = useUserStore().username

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
// 手动添加
const manualDialogVisible = ref<boolean>(false)

// 批量导入
const dialogVisible = ref<boolean>(false)
// 上传的文件
const fileList = reactive<any>({
  file: []
})
// 文件数超出提示
const exceedFile = () => {
  ElMessage.warning("最多只能上传一个文件！")
}
// 上传错误提示
const handleError = () => {
  ElMessage.error("导入数据失败，请您重新上传！")
}
//上传成功提示
const handleSuccess = () => {
  ElMessage.success("导入数据成功！")
}
const beforeUpload = (file: any) => {
  const isExcel =
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  const isLt2M = file.size / 1024 / 1024 < 20

  if (!isExcel)
    ElMessageBox({
      title: "温馨提示",
      message: "上传文件只能是 xls / xlsx 格式！",
      type: "warning"
    })
  if (!isLt2M)
    ElMessageBox({
      title: "温馨提示",
      message: "上传文件大小不能超过 20MB!",
      type: "warning"
    })
  return isExcel && isLt2M
}

const previewDialogVisible = ref<boolean>(false)
const preview = reactive<any>({
  tempBoardData: [],
  testUnitData: []
})

let snList;

const generatePreview = () => {
  const param = new FormData()
  param.append("fileData", fileList.file[0].raw)
  param.append("username", username)

  previewTempBatchDataApi(param)
    .then((data) => {
      // fileList.file = []
      // console.log(data.preview_temp_boards)
      preview.tempBoardData = data.preview_temp_boards
      preview.testUnitData = data.preview_dev_testunit
      snList = data.sn_list
    })
    .catch((err) => {
      ElMessage.error(err.data.errormessage)
    })
    .finally(() => {
      dialogVisible.value = false
      previewDialogVisible.value = true
    })
}
// 批量导入
const bulkImport = () => {
  const param = new FormData()
  param.append("fileData", fileList.file[0].raw)
  param.append("username", username)
  param.append("snList", snList)
  createTempBatchDataApi(param)
    .then(() => {
      ElMessage.success("新增成功")
      fileList.file = []
      getTableData()
    })
    .catch((err) => {
      ElMessage.error(err.data.errormessage)
      // console.log(err)
    })
    .finally(() => {
      previewDialogVisible.value = false
    })
}

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
        manualDialogVisible.value = false
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
        manualDialogVisible.value = false
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
  manualDialogVisible.value = false
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

// 显式暴露方法供父组件调用
defineExpose({
  getTableData
})

// link操作
const handleLink = (data: any, i: any) => {
  if (i == "详情") {
    /* empty */
  } else {
    currentUpdateId.value = data.id
    manualDialogVisible.value = true
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

.dialog-footer-center {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.preview-table {
  margin-bottom: 10px;
}
</style>
