<!-- 临时电路板 -->

<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox, ElTree, type FormInstance, type FormRules } from "element-plus"
import { usePagination, useDetailPagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import QrcodeVue from "qrcode.vue"
import { getTempBatchInstrumentDataApi } from "@/api/instrument"
import { CirclePlus, UploadFilled } from "@element-plus/icons-vue"
import { getQRcodeImgApi } from "@/api/qrcode"
import { createTempBatchDataApi, getTempBatchDataApi, previewTempBatchDataApi } from "@/api/temp-batch"
import { createTempBoardApi, getBatchTempBoardDataApi, updateTempBoardDataApi } from "@/api/temp-board"
import { GetTempBoardData } from "@/api/temp-board/types/temp-board"
import { GetTempBatchData } from "@/api/temp-batch/types/temp-batch"
import { useUserStore } from "@/store/modules/user"

const username = useUserStore().username

const loading = ref<boolean>(false)
const detailLoading = ref<boolean>(false)
const treeLoading = ref<boolean>(false)
const insertingData = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const { paginationDetailData, handleDetailCurrentChange, handleDetailSizeChange } = useDetailPagination()
// 手动添加
const manualDialogVisible = ref<boolean>(false)

// 批量导入
const dialogVisible = ref<boolean>(false)

const qrcodeVisible = ref<boolean>(false)
const qrcodeValue = ref<string>("")

const formData = reactive<any>({
  instrument: "",
  boardName: "",
  modelNumber: "",
  model: "",
  supplier: "",
  batchId: "",
  serialNumber: "",
  belong: ""
})
const formRules: FormRules = reactive({
  instrument: [{ required: true, trigger: "blur", message: "请输入所属产品" }],
  boardName: [{ required: true, trigger: "blur", message: "请输入测试品名称" }],
  supplier: [{ required: true, trigger: "blur", message: "请输入供应商名称" }]
})
// 上传的文件
const fileList = reactive<any>({
  file: []
})
const handleCreate = () => {
  if (currentUpdateId.value === undefined) {
    createTempBoardApi({ ...formData })
      .then((data) => {
        ElMessage.success("新增成功")
        getTreeData()
        searchData.id = data.id
        searchData.name = data.name
        getTableData()
      })
      .catch((err) => {
        ElMessage.error(err.response.data.error)
        console.error(err.response.data.error)
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

const currentUpdateId = ref<undefined | string>(undefined)
const headers = ref([
  { prop: "id", label: "电路板ID", align: "center", width: "120", fixed: "left" },
  { prop: "name", label: "测试品名称", align: "center", width: "150" },
  { prop: "seria", label: "电路板序列号", align: "center" },
  { prop: "startTime", label: "入库时间", align: "center", width: "150" },
  { prop: "link", label: "操作", type: "link", align: "center" }
])

// 批次
const batchHeaders = ref([
  { prop: "id", label: "批次号", align: "center" },
  { prop: "name", label: "批次名称", align: "center" },
  { prop: "supplier", label: "供应商", align: "center" },
  { prop: "startTime", label: "入库时间", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])

const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref("")
watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const defaultProps = {
  children: "children",
  label: "label"
}
const BatchData = ref<GetTempBatchData[]>([])
const BoardData = ref<GetTempBoardData[]>([])

const TreeData = ref<any>([])
const Drawer = ref(false)
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: "",
  id: "",
  batchId: "",
  batchName: "",
  supplier: ""
})
const DetailsearchData = reactive({
  batch: "",
  seria: ""
})

const getTreeData = () => {
  treeLoading.value = true
  getTempBatchInstrumentDataApi({
    currentPage: 1,
    size: 999999,
    isTree: true
  })
    .then((res) => {
      TreeData.value = res.data.list
    })
    .catch(() => {
      TreeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}

// 显式暴露方法供父组件调用
defineExpose({
  getTreeData
})

const getDetailTableData = () => {
  detailLoading.value = true
  getBatchTempBoardDataApi({
    batch: DetailsearchData.batch,
    currentPage: paginationDetailData.currentPage,
    size: paginationDetailData.pageSize,
    seria: DetailsearchData.seria || undefined
  })
    .then((res) => {
      paginationDetailData.total = res.data.total
      BoardData.value = res.data.list
    })
    .catch(() => {
      BoardData.value = []
    })
    .finally(() => {
      detailLoading.value = false
    })
}

const getTableData = () => {
  loading.value = true
  getTempBatchDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    name: searchData.name,
    id: searchData.id,
    batchId: searchData.batchId,
    batchName: searchData.batchName,
    supplier: searchData.supplier
  })
    .then((res) => {
      paginationData.total = res.data.total
      BatchData.value = res.data.list
    })
    .catch(() => {
      BatchData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleNodeClick = (data: any) => {
  if (data.children === undefined) {
    searchData.name = data.label
    searchData.id = data.id
    getTableData()
  }
}

const selectedRows = ref([])

const handleSelectionChange = (val: any) => {
  selectedRows.value = val
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
  testUnitData: [],
  batches: []
})

const previewLoading = ref<boolean>(false)

const generatePreview = () => {
  previewLoading.value = true

  const param = new FormData()
  param.append("fileData", fileList.file[0].raw)
  param.append("username", username)

  previewTempBatchDataApi(param)
    .then((data) => {
      preview.tempBoardData = data.preview_temp_boards
      preview.testUnitData = data.preview_dev_testunit
      preview.batches = data.batches_gen
      previewDialogVisible.value = true
    })
    .catch((err) => {
      fileList.file = []
      ElMessage.error(err.data.errormessage)
    })
    .finally(() => {
      previewLoading.value = false
      dialogVisible.value = false
    })
}

// 批量导入
const bulkImport = () => {
  insertingData.value = true
  createTempBatchDataApi({
    username: username,
    tempBoardData: preview.tempBoardData,
    testUnitData: preview.testUnitData,
    batches: preview.batches
  })
    .then(() => {
      ElMessage.success("新增成功")
      fileList.file = []
      getTreeData()
      if (searchData.id !== "") getTableData()
    })
    .catch((err) => {
      fileList.file = []
      ElMessage.error(err.data.errormessage)
    })
    .finally(() => {
      insertingData.value = false
      previewDialogVisible.value = false
    })
}

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

const closedTempBoard = () => {
  manualDialogVisible.value = false
  currentUpdateId.value = undefined
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
}

// 打印二维码
const getSelection = () => {
  getQRcodeImgApi({ data: selectedRows.value, headerKey: "name", seriaKey: "seria", startTimeKey: "startTime" })
    .then((res) => {
      if (res.code === 0) {
        const imageData = res.data
        const printWindow = window.open("", "_blank")
        printWindow.document.write("<html><head><title>Print QR Codes</title></head><body>")

        for (const key in imageData) {
          if (Object.prototype.hasOwnProperty.call(imageData, key)) {
            const img = new Image()
            img.src = imageData[key]
            img.alt = "QR Code"
            printWindow.document.body.appendChild(img)
            printWindow.document.body.appendChild(document.createElement("br"))
          }
        }

        printWindow.document.write("</body></html>")
        printWindow.document.close()
        printWindow.onload = function () {
          printWindow.print()
          printWindow.close()
        }
      } else {
        console.error("Error fetching QR codes", res)
      }
    }
  )
}

const goBack = () => {
  Drawer.value = false
}
const handleLink = (data: any, i: string) => {
  if (i == "二维码") {
    qrcodeValue.value = data.seria
    qrcodeVisible.value = true
  }
  if (i == "批次详情") {
    Drawer.value = true
    DetailsearchData.batch = data.id
    getDetailTableData()
  }
}
const handleSearch = () => {
  getTableData()
}
const resetSearch = () => {
  searchData.supplier = ""
  searchData.batchId = ""
  searchData.batchName = ""
  getTableData()
}

const handleSearchDetail = () => {
  getDetailTableData()
}
const resetSearchDetail = async () => {
  DetailsearchData.seria = ""
  getDetailTableData()
}
const DrawerClose = () => {
  Object.keys(DetailsearchData).forEach((key: any) => (DetailsearchData[key] = ""))
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

const instrumentList = ref<any>([])
const getInstrumentData = () => {
  getTempBatchInstrumentDataApi({}).then((res) => {
    instrumentList.value = res.data.list
  })
}

const cancelUpload = () => {
  dialogVisible.value = false
  fileList.file = []
}

const cancelInsert = () => {
  previewDialogVisible.value = false
  fileList.file = []
}

//#endregion
onMounted(() => {
  /** 监听分页参数的变化 */
  watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: false })
  watch([() => paginationDetailData.currentPage], getDetailTableData, { immediate: false })
})
</script>

<template>
  <!-- 设置列之间的间距 -->
  <el-row :gutter="20">
    <!-- 设置列占据的宽度 -->
    <el-col :span="5">
      <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
        <template #header>
          <div>
            <el-button
              style="width: 100%; margin-bottom: 10px"
              type="primary"
              :icon="CirclePlus"
              @click="dialogVisible = true"
              >批量导入</el-button
            >
          </div>
          <div>
            <el-button
              style="width: 100%; margin-bottom: 10px"
              type="warning"
              :icon="CirclePlus"
              @click="manualDialogVisible = true"
              >手动添加</el-button
            >
          </div>

          <el-input v-model="filterText" placeholder="搜索" />
        </template>

        <el-tree
          ref="treeRef"
          class="filter-tree"
          :data="TreeData"
          :props="defaultProps"
          node-key="id"
          :default-expanded-keys="[1]"
          accordion
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        />
      </el-card>
    </el-col>

    <el-col v-if="searchData.id === '' && searchData.name === ''" :span="19">
      <el-card shadow="never" style="height: 100%">
        <el-empty description="请选择产品" />
      </el-card>
    </el-col>

    <el-col v-else :span="19">
      <el-card shadow="never" class="search-wrapper">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
          <el-form-item prop="batchNumber" label="批次号">
            <el-input v-model="searchData.batchId" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="name" label="批次名称">
            <el-input v-model="searchData.batchName" placeholder="请输入" />
          </el-form-item>
          <el-form-item prop="supplier" label="供应商">
            <el-input v-model="searchData.supplier" placeholder="请输入" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="search" @click="handleSearch">查询</el-button>
            <el-button icon="refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card v-loading="loading" shadow="never">
        <div class="toolbar-wrapper">
          <div>
            <el-tooltip content="刷新当前页">
              <el-button type="primary" icon="refresh-right" circle @click="getTableData" />
            </el-tooltip>
          </div>
        </div>
        <div class="table-wrapper">
          <TableComponent
            :tableData="BatchData"
            :column-data="batchHeaders"
            stripe
            @selection-change="handleSelectionChange"
          >
            <template #link="{ row }">
              <el-link type="primary" class="el-link" @click="handleLink(row, '批次详情')"> 批次详情 </el-link>
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
    </el-col>
  </el-row>

  <el-drawer v-model="Drawer" :with-header="false" size="60%" @closed="DrawerClose">
    <header class="drawer-head">
      <el-page-header @back="goBack">
        <template #content>
          <span class="text-large font-600 mr-3">批次详情</span>
        </template>
      </el-page-header>
    </header>
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="DetailsearchData">
        <el-form-item prop="seria" label="序列号">
          <el-input v-model="DetailsearchData.seria" placeholder="请输入" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleSearchDetail">查询</el-button>
          <el-button icon="refresh" @click="resetSearchDetail">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="detailLoading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button v-if="selectedRows.length > 0" type="warning" icon="printer" @click="getSelection"
            >打印二维码
          </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="refresh-right" circle @click="getDetailTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent
          :tableData="BoardData"
          :column-data="headers"
          selection
          stripe
          @selection-change="handleSelectionChange"
        >
          <template #link="{ row }">
            <el-link type="primary" class="el-link" @click="handleLink(row, '二维码')"> 二维码 </el-link>
          </template>
        </TableComponent>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationDetailData.layout"
          :page-sizes="paginationDetailData.pageSizes"
          :total="paginationDetailData.total"
          :page-size="paginationDetailData.pageSize"
          :currentPage="paginationDetailData.currentPage"
          @size-change="handleDetailSizeChange"
          @current-change="handleDetailCurrentChange"
        />
      </div>
    </el-card>
  </el-drawer>

  <!-- 批量导入对话框 -->
  <el-dialog v-model="dialogVisible" width="30%">
    <el-card v-loading="previewLoading" shadow="never">
      <el-upload
        class="upload-demo"
        drag
        accept=".xls,.xlsx"
        :headers="{ 'Content-Type': 'multipart/form-data' }"
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
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">拖拽文件至此 或 <em>点击选择文件上传</em></div>
        <template #tip>
          <div class="el-upload__tip">Tip：请上传xlsx后缀的表格文件</div>
        </template>
      </el-upload>

      <template #footer>
        <el-button @click="cancelUpload">取消</el-button>
        <el-button type="primary" :disabled="!fileList.file.length" @click="generatePreview">生成预览</el-button>
      </template>
    </el-card>
  </el-dialog>

  <!-- 预览 -->
  <el-dialog v-model="previewDialogVisible" width="960" top="5vh">
    <el-card v-loading="insertingData" shadow="never">
      <el-row>
        <el-col :span="24">
          <h3 class="table-title">临时电路板预览数据</h3>
        </el-col>
      </el-row>
      <el-table :data="preview.tempBoardData" max-height="500">
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
      <el-table :data="preview.testUnitData" max-height="500">
        <el-table-column property="测试品名称" label="测试品名称" width="150" />
        <el-table-column property="测试类型" label="测试类型" width="150" />
        <el-table-column property="测试类别" label="测试类别" width="200" />
        <el-table-column property="测试内容" label="测试内容" width="150" />
        <el-table-column property="创建人" label="创建人" width="120" />
        <el-table-column property="委托人" label="委托人" width="150" />
      </el-table>

      <el-row>
        <el-col :span="24">
          <h3 class="table-title">
            即将添加 {{ preview.tempBoardData.length }} 块电路板、{{ preview.testUnitData.length }} 个工单，确认添加吗？
          </h3>
        </el-col>
      </el-row>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelInsert">取消</el-button>
          <el-button type="primary" @click="bulkImport"> 确认 </el-button>
        </div>
      </template>
    </el-card>
  </el-dialog>

  <!-- 手动添加 -->
  <el-dialog
    v-model="manualDialogVisible"
    width="30%"
    @close="closedTempBoard"
    :title="currentUpdateId === undefined ? '新增临时电路板' : '编辑临时电路板'"
  >
    <el-form :model="formData" :rules="formRules" label-width="100">
      <el-form-item prop="instrument" label="所属产品">
        <el-select v-model="formData.instrument" filterable placeholder="请选择" @visible-change="getInstrumentData">
          <el-option v-for="item in instrumentList" :label="item.name" :value="item.name" :key="item.name" />
        </el-select>
      </el-form-item>
      <el-form-item prop="boardName" label="测试品名称">
        <el-input v-model="formData.boardName" placeholder="请输入" />
      </el-form-item>
      <el-form-item prop="supplier" label="供应商名称">
        <el-input v-model="formData.supplier" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="物料号">
        <el-input v-model="formData.modelNumber" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="规格型号">
        <el-input v-model="formData.model" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="批次号">
        <el-input v-model="formData.batchId" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="SN 号">
        <el-input v-model="formData.serialNumber" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="所属单位">
        <el-input v-model="formData.belong" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="closedTempBoard">取消</el-button>
      <el-button type="primary" @click="handleCreate">确认</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="qrcodeVisible" width="340px">
    <qrcode-vue :value="qrcodeValue" :size="300" />
  </el-dialog>
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

.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.addbutton {
  width: 10vw;
}

.drawer-head {
  height: 5%;
}
</style>
