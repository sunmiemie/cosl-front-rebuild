<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createFixtureDataApi, getFixtureDataApi, updateFixtureDataApi } from "@/api/fixture"
import { getAnnualinspection } from "@/api/Annualinspection"
import { fileDownoload } from "@/api/file"
import { getFixtureModelDataApi } from "@/api/fixturemodel"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search, Printer, UploadFilled } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { type GetFixtureData } from "@/api/fixture/types/fixture"
import QrcodeVue from "qrcode.vue"
import { GetFixtureModelData } from "@/api/fixturemodel/types/fixturemodel"
import { format } from "date-fns"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
//#region 增
const dialogVisible = ref<boolean>(false)
const qrcodeVisible = ref<boolean>(false)
const qrcodeValue = ref<string>("")
const dialogDetail = ref<boolean>(false)
const checkVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const checkRef = ref<FormInstance | null>(null)
const fileList = reactive<any>({
  file: []
})
const formData = reactive({
  name: "",
  model: "", // 型号
  seria: "", // 序列号
  startTime: "",
  modelId: null
})
const checkData = reactive({
  updateDate: ""
})
const formRules: FormRules = reactive({
  model: [{ required: true, trigger: "blur", message: "请选择型号" }],
  seria: [{ required: true, trigger: "blur", message: "请输入序列号" }]
})
const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        formData.startTime = format(new Date(), "yyyy-MM-dd")
        delete formData.name
        delete formData.startTime
        createFixtureDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateFixtureDataApi({
          model: formData.model,
          seria: formData.seria,
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
    } else {
      ElMessage.error("请填写完整")
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.name = ""
  formData.model = ""
  formData.seria = ""
}
//#endregion

//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)

//#endregion

const headers = ref([
  { prop: "id", label: "夹具ID", align: "center" },
  { prop: "model", label: "夹具型号", align: "center" },
  { prop: "supplier", label: "夹具供应商", align: "center" },
  { prop: "seria", label: "夹具序列号", align: "center" },
  { prop: "startTime", label: "入库时间", align: "center" },
  { prop: "status", label: "夹具状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" },
  { prop: "download", label: "下载", type: "btn", align: "center" }
])

// 表格
const TableData = ref<GetFixtureData[]>([])
// 夹具型号
const ModelData = ref<GetFixtureModelData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
// 夹具状态
const ModelStatus = ref([
  {
    name: "正常",
    status: 0
  },
  {
    name: "临检",
    status: 1
  },
  {
    name: "故障",
    status: 2
  }
])
const searchData = reactive({
  seria: "", //序列号
  model: "", //状态
  status: "" //夹具型号
  // name: ""
})
const defineLink = (status: number) => {
  switch (status) {
    case 0:
      return { 1: "编辑", 2: "二维码" }
    case 1:
      return { 1: "编辑", 2: "更新年检", 3: "二维码" }
    case 2:
      return { 1: "编辑", 2: "详情", 3: "查看故障工单" }
  }
}
const getTableData = async () => {
  loading.value = true
  getFixtureDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    seria: searchData.seria || undefined,
    model: searchData.model || undefined,
    status: searchData.status || undefined
  })
    .then((res) => {
      paginationData.total = res.data.total
      TableData.value = res.data.list

      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].status as any)
      }
      console.log(TableData.value)
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
  // 获取夹具型号
  getFixtureModelDataApi({ currentPage: 1, size: 999999 }).then((res) => {
    ModelData.value = res.data.list
  })
}
const selectedRows = ref([])
const handleSelectionChange = (val: any) => {
  selectedRows.value = val
}
const getSelection = () => {
  console.log("print", selectedRows.value)
}
const currentModel = ref()
const handleLink = (data: any, i: string) => {
  if (i == "二维码") {
    qrcodeValue.value = data.seria
    qrcodeVisible.value = true
  }
  if (i == "编辑") {
    console.log(data)
    currentUpdateId.value = data.id
    formData.seria = data.seria
    currentModel.value = data.model
    console.log(data)
    console.log(ModelData)
    formData.model = data.model_id
    dialogVisible.value = true
  }
  if (i == "更新年检") {
    currentUpdateId.value = data.id
    checkVisible.value = true
  }
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  getTableData()
}
const closeDialogs = () => {
  dialogDetail.value = false
  dialogVisible.value = false
}
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
const resetCheck = (formEl: any) => {
  checkVisible.value = false
  currentUpdateId.value = undefined
  if (!formEl) return
  formEl.resetFields()
  checkData.updateDate = ""
  fileList.file = []
}
const handleCheck = () => {
  const form = new FormData()
  form.append("FileName", fileList.file[0].raw)
  form.append("id", currentUpdateId.value)
  form.append("date", checkData.updateDate)
  form.append("type", "1")
  getAnnualinspection(form)
    .then((res) => {
      ElMessage.success("更新成功")
      getTableData()
    })
    .finally(() => {
      checkVisible.value = false
    })
}

const download = (file: any, fileType: string, fileName: string) => {
  const blob = new Blob([file], {
    type: fileType
  })
  const a = document.createElement("a")
  const href = URL.createObjectURL(blob)
  a.href = href
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  // 下载完成移除a元素
  document.body.removeChild(a)
  // 释放blob对象
  URL.revokeObjectURL(href)
}
interface infoType {
  fileId: string
  name: string
  fileFormat: string
}
// 下载
const handleDownload = (info: infoType) => {
  const { name } = info
  fileDownoload(name).then((res) => {
    console.log(res)
    download(res, "application/vnd.ms-excel", name)
  })
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="seria" label="序列号">
          <el-input v-model="searchData.seria" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="夹具状态">
          <el-select v-model="searchData.status" style="width: 150px">
            <el-option v-for="item in ModelStatus" :label="item.name" :value="item.status" :key="item.status" />
          </el-select>
        </el-form-item>
        <el-form-item prop="type" label="夹具型号">
          <el-select v-model="searchData.model" placeholder="请选择" style="width: 150px">
            <el-option v-for="item in ModelData" :label="item.name" :value="item.id" :key="item.id" />
          </el-select>
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
          <el-button type="primary" icon="CirclePlus" @click="dialogVisible = true">新增夹具</el-button>
          <el-button v-if="selectedRows.length > 0" type="warning" icon="Printer" @click="getSelection"
            >打印二维码</el-button
          >
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent
          :tableData="TableData"
          :column-data="headers"
          selection
          stripe
          @selection-change="handleSelectionChange"
        >
          <template #status="{ row }">
            <el-tag v-if="row.status === 0" type="success"> 正常 </el-tag>
            <el-tag v-if="row.status === 1" type="warning"> 临检 </el-tag>
            <el-tag v-if="row.status === 2" type="danger"> 故障 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" :key="i" type="primary" class="el-link" @click="handleLink(row, i)">{{
              i
            }}</el-link>
          </template>

          <template #download="{ row }">
            <el-popover placement="right" :width="300" trigger="click">
              <template #reference>
                <el-button style="margin-right: 16px" type="text">查看文件</el-button>
              </template>
              <el-table :data="row.fixture_checkpath">
                <el-table-column width="150" property="name" label="文件名" />
                <el-table-column property="address" label="操作">
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="handleDownload(scope.row)">下载</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-popover>

            <el-popover
              :width="300"
              popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
            />
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
      :title="currentUpdateId === undefined ? '新增夹具' : '编辑夹具'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="model" label="夹具型号">
          <el-select v-model="formData.model" placeholder="请选择">
            <el-option v-for="model in ModelData" :label="model.name" :value="model.id" :key="model.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="seria" label="夹具序列号">
          <el-input v-model="formData.seria" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialogs">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="qrcodeVisible" width="340px">
      <qrcode-vue :value="qrcodeValue" :size="300" />
    </el-dialog>
    <el-dialog title="更新年检" v-model="checkVisible" width="30%">
      <el-form ref="checkRef" label-width="100px" label-position="left">
        <el-form-item prop="checkFile" label="年检文件:">
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
        </el-form-item>
        <el-form-item prop="updateDate" label="下次年检:">
          <el-date-picker
            v-model="checkData.updateDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择一个日期"
            size="default"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetCheck(checkRef)">取消</el-button>
        <el-button type="primary" @click="handleCheck">确认</el-button>
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
</style>
