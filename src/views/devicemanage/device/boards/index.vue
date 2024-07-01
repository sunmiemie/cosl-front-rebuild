<script lang="ts" setup>
import { onMounted, reactive, ref, watch } from "vue"
import { getBoardDataApi } from "@/api/board"
import { createBatchDataApi, getBatchDataApi } from "@/api/batch"
import { type GetBatchData } from "@/api/batch/types/batch"
import { ElMessage, ElMessageBox, ElTree, type FormInstance } from "element-plus"
import { usePagination, useDetailPagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import QrcodeVue from "qrcode.vue"
import { type GetBoardData } from "@/api/board/types/board"
import { getInstrumentDataApi } from "@/api/instrument"
import { UploadFilled } from "@element-plus/icons-vue"
import { getQRcodeImgApi } from "@/api/qrcode"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})

const loading = ref<boolean>(false)
const detailLoading = ref<boolean>(false)
const treeLoading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const { paginationDetailData, handleDetailCurrentChange, handleDetailSizeChange } = useDetailPagination()
const modelId = ref<string>("")
const dialogVisible = ref<boolean>(false)
const qrcodeVisible = ref<boolean>(false)
const qrcodeValue = ref<string>("")
const dialogDetail = ref<boolean>(false)
const SearchStatusData = ref([
  { id: "0", name: "待测试" },
  { id: "1", name: "测试正常" },
  { id: "2", name: "测试异常" }
])
const formData = reactive<any>({
  file: []
})
const fileList = reactive<any>({
  file: []
})
const handleCreate = () => {
  const param = new FormData()
  param.append("fileData", fileList.file[0].raw)
  createBatchDataApi(param)
    .then(() => {
      ElMessage.success("新增成功")
      getTableData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.model = ""
  formData.seria = ""
}
const currentUpdateId = ref<undefined | string>(undefined)
const headers = ref([
  { prop: "id", label: "电路板ID", align: "center", width: "120", fixed: "left" },
  { prop: "name", label: "电路板型号", align: "center", width: "150" },
  { prop: "seria", label: "电路板序列号", align: "center", width: "250" },
  { prop: "startTime", label: "入库时间", align: "center", width: "150" },
  { prop: "statusFunc", label: "功能性测试", type: "tag", align: "center", width: "120" },
  { prop: "statusEyes", label: "目检测试", type: "tag", align: "center", width: "120" },
  { prop: "statusXray", label: "X-Ray测试", type: "tag", align: "center", width: "120" },
  { prop: "statusHalt", label: "可靠性测试", type: "tag", align: "center", width: "120" },
  { prop: "link", label: "操作", type: "link", align: "right" }
])

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
const BatchData = ref<GetBatchData[]>([])
const BoardData = ref<GetBoardData[]>([])

const TreeData = ref<any>([])
const Drawer = ref(false)
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: "",
  id: "",
  supplier: "",
  boardModel: ""
})
const DetailsearchData = reactive({
  batch: "",
  seria: "",
  status: ""
})
const getTreeData = () => {
  treeLoading.value = true
  getInstrumentDataApi({
    currentPage: 1,
    size: 999999,
    isTree: true
  })
    .then((res) => {
      console.log(res.data.list)
      TreeData.value = res.data.list
    })
    .catch(() => {
      TreeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}
const getDetailTableData = () => {
  detailLoading.value = true
  getBoardDataApi({
    batch: DetailsearchData.batch,
    currentPage: paginationDetailData.currentPage,
    size: paginationDetailData.pageSize,
    boardmodel: searchData.boardModel,
    status: DetailsearchData.status || undefined,
    seria: DetailsearchData.seria || undefined
  })
    .then((res) => {
      console.log(res)
      paginationDetailData.total = res.data.total
      BoardData.value = res.data.list
    })
    .catch(() => {
      BoardData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const getTableData = () => {
  loading.value = true
  getBatchDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    boardmodel: searchData.boardModel,
    batchId: searchData.id,
    batchName: searchData.name,
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
  searchData.boardModel = data.id
  if (data.children === undefined) {
    getTableData()
  }
}
const selectedRows = ref([])
const handleSelectionChange = (val: any) => {
  console.log("index", val)
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
const closeDialogs = () => {
  dialogDetail.value = false
  dialogVisible.value = false
}
const getSelection = () => {
  getQRcodeImgApi({ data: selectedRows.value }).then((res) => {
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
  })
}
const goBack = () => {
  Drawer.value = false
}
const handleLink = (data: any, i: string) => {
  if (i == "二维码") {
    qrcodeValue.value = data.seria
    console.log(data.seria)
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
  searchData.name = ""
  searchData.id = ""
  searchData.supplier = ""
  getTableData()
}

const handleSearchDetail = () => {
  getDetailTableData()
}
const resetSearchDetail = async () => {
  DetailsearchData.seria = ""
  DetailsearchData.status = ""
  getDetailTableData()
}
const DrawerClose = () => {
  Object.keys(DetailsearchData).forEach((key: any) => (DetailsearchData[key] = ""))
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}
//#endregion
onMounted(() => {
  watch([() => paginationData.currentPage, () => paginationData.pageSize], getTreeData, { immediate: true })
  /** 监听分页参数的变化 */
  watch([() => paginationData.currentPage, () => paginationData.pageSize, () => modelId], getTableData, {
    immediate: false
  })
  watch(
    [() => paginationDetailData.currentPage, () => paginationDetailData.pageSize, () => modelId],
    getDetailTableData,
    {
      immediate: false
    }
  )
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="5">
        <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
          <template #header>
            <el-button
              style="width: 100%; margin-bottom: 10px"
              type="primary"
              icon="circle-plus"
              @click="dialogVisible = true"
              >新增批次
            </el-button>
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
      <el-col v-if="searchData.boardModel === ''" :span="19">
        <el-card shadow="never" style="height: 100%">
          <el-empty description="请选择电路板型号" />
        </el-card>
      </el-col>
      <el-col v-else :span="19">
        <el-card shadow="never" class="search-wrapper">
          <el-form ref="searchFormRef" :inline="true" :model="searchData">
            <el-form-item prop="seria" label="批次号">
              <el-input v-model="searchData.id" placeholder="请输入" />
            </el-form-item>
            <el-form-item prop="name" label="批次名称">
              <el-input v-model="searchData.name" placeholder="请输入" />
            </el-form-item>
            <el-form-item prop="status" label="供应商">
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
    <el-drawer v-model="Drawer" title="I am the title" :with-header="false" size="60%" @closed="DrawerClose">
      <header class="drawer-head">
        <el-page-header @back="goBack">
          <template #content>
            <span class="text-large font-600 mr-3">批次详情</span>
          </template>
        </el-page-header>
      </header>
      <el-card v-loading="loading" shadow="never" class="search-wrapper">
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
      <el-card v-loading="loading" shadow="never">
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
            <template #statusFunc="{ row }">
              <el-tag v-if="row['status'][0] === 0"> 待测试 </el-tag>
              <el-tag v-if="row['status'][0] === 1" type="success"> 检测正常 </el-tag>
              <el-tag v-if="row['status'][0] === 2" type="danger"> 检测异常 </el-tag>
            </template>
            <template #statusEyes="{ row }">
              <el-tag v-if="row['status'][0] === 0"> 待测试 </el-tag>
              <el-tag v-if="row['status'][0] === 1" type="success"> 检测正常 </el-tag>
              <el-tag v-if="row['status'][0] === 2" type="danger"> 检测异常 </el-tag>
            </template>
            <template #statusXray="{ row }">
              <el-tag v-if="row['status'][0] === 0"> 待测试 </el-tag>
              <el-tag v-if="row['status'][0] === 1" type="success"> 检测正常 </el-tag>
              <el-tag v-if="row['status'][0] === 2" type="danger"> 检测异常 </el-tag>
            </template>
            <template #statusHalt="{ row }">
              <el-tag v-if="row['status'][0] === 0"> 待测试 </el-tag>
              <el-tag v-if="row['status'][0] === 1" type="success"> 检测正常 </el-tag>
              <el-tag v-if="row['status'][0] === 2" type="danger"> 检测异常 </el-tag>
            </template>
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
    <!-- 新增/编辑 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增批次' : '编辑批次'"
      @close="resetForm"
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
        <el-button @click="closeDialogs">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="qrcodeVisible" width="340px">
      <qrcode-vue :value="qrcodeValue" :size="300" />
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
