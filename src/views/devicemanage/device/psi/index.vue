<!--主机管理-->

<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createHostModelDataApi, getHostModelDataApi, updateHostModelDataApi } from "@/api/psi"
import { getAnnualinspection } from "@/api/Annualinspection"
import { fileDownoload } from "@/api/file"
import { getPsiModelDataApi } from "@/api/psimodel"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Printer, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { GetPsiData } from "@/api/psi/types/psi"
import QrcodeVue from "qrcode.vue"
import { UploadFilled } from "@element-plus/icons-vue"
import { getQRcodeImgApi } from "@/api/qrcode"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
//#region 增
const dialogVisible = ref<boolean>(false)
const qrcodeVisible = ref<boolean>(false)
const qrcodeValue = ref<string>("")
const checkVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const checkRef = ref<FormInstance | null>(null)
const fileList = reactive<any>({
  file: []
})

const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0") // 月份加 1 并补零
  const day = date.getDate().toString().padStart(2, "0") // 日期补零
  return `${year}-${month}-${day}`
}

const formData = reactive<any>({
  psiName: "", // 主机名称
  psiSeria: "", // 序列号
  psiDate: getCurrentDate(), // 入库时间
  psiModel: "" // 主机型号
})

const checkData = reactive<any>({
  updateDate: ""
})
// 新增
const handleCreate = () => {
  formRef.value?.validate((valid: boolean) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        createHostModelDataApi(formData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        updateHostModelDataApi({
          id: currentUpdateId.value,
          psiModel: formData.psiModel,
          psiSeria: formData.psiSeria,
          psiName: formData.psiName
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
const resetForm = (formEl: any) => {
  dialogVisible.value = false
  currentUpdateId.value = undefined
  if (!formEl) return
  formEl.resetFields()
  formData.psiName = ""
  formData.psiSeria = ""
  formData.psiModel = ""
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
  form.append("type", "2")
  getAnnualinspection(form)
    .then(() => {
      ElMessage.success("更新成功")
    })
    .finally(() => {
      checkVisible.value = false
    })
}
const currentUpdateId = ref<any>(undefined)

const headers = ref([
  { prop: "psi_id", label: "主机ID", align: "center" },
  { prop: "psi_name", label: "主机名称", align: "center" },
  { prop: "psimodel_name", label: "主机型号", align: "center" },
  { prop: "psi_serialnumber", label: "主机序列号", align: "center" },
  { prop: "psi_date", label: "入库时间", align: "center" },
  { prop: "psi_status", label: "主机状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link", fixed: "right" },
  { prop: "download", label: "下载", type: "btn", align: "center" }
])

//表单校验
const formRules: FormRules = reactive<any>({
  psiName: [{ required: true, trigger: "blur", message: "请选择名称" }],
  psiSeria: [{ required: true, trigger: "blur", message: "请输入序列号" }],
  psiModel: [{ required: true, trigger: "blur", message: "请选择型号" }]
})

const TableData = ref<GetPsiData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive<any>({
  number: "",
  name: "",
  type: ""
})
const defineLink = (status: any) => {
  switch (status) {
    case 0:
      return { 1: "编辑", 2: "二维码" }
    case 1:
      return { 1: "编辑", 2: "更新年检", 3: "二维码" }
    case 2:
      return { 1: "编辑", 2: "详情", 3: "查看故障工单" }
  }
}
const ModelTypes = ref<any>([])
const pisModelTypes = ref<any>([])
const getTableData = async () => {
  loading.value = true
  getHostModelDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    number: searchData.number || undefined,
    name: searchData.name || undefined,
    type: searchData.type || undefined
  })
    .then((res: any) => {
      paginationData.total = res.data.total
      TableData.value = res.data.list
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].psi_status)
      }
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
  getPsiModelDataApi({ currentPage: 1, size: 999999 }).then((res) => {
    ModelTypes.value = res.data.list
    pisModelTypes.value = res.data.list
  })
}
const selectedRows = ref<any>([])
const handleSelectionChange = (val: any) => {
  console.log("index", val)
  selectedRows.value = val
}

// 打印二维码
const getSelection = () => {
  getQRcodeImgApi({
    data: selectedRows.value,
    headerKey: "psi_name",
    seriaKey: "psi_serialnumber",
    startTimeKey: "psi_date"
  }).then((res) => {
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

const handleLink = (data: any, i: any) => {
  if (i === "编辑") {
    console.log(data)
    currentUpdateId.value = data.psi_id
    dialogVisible.value = true
    formData.psiName = data.psi_name
    formData.psiSeria = data.psi_serialnumber
    formData.psiModel = data.psimodel_id
    getTableData()
  }
  if (i === "二维码") {
    qrcodeValue.value = data.psi_serialnumber
    qrcodeVisible.value = true
  }
  if (i === "更新年检") {
    currentUpdateId.value = data.psi_id
    checkVisible.value = true
  }
}
// 新增主机
const addhost = () => {
  formData.psiName = ""
  formData.psiSeria = ""
  formData.psiDate = getCurrentDate()
  dialogVisible.value = true
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => (searchData[key] = ""))
  getTableData()
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
          <el-input v-model="searchData.number" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="主机名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="主机型号">
          <el-select v-model="searchData.type" placeholder="请选择" style="width: 150px">
            <el-option
              v-for="item in ModelTypes"
              :label="item.psimodel_name"
              :value="item.psimodel_id"
              :key="item.psimodel_id"
            />
          </el-select>
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
          <el-button type="primary" :icon="CirclePlus" @click="addhost">新增主机</el-button>
          <el-button v-if="selectedRows.length > 0" type="warning" :icon="Printer" @click="getSelection"
            >打印二维码</el-button
          >
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData()" />
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
          <template #psi_status="{ row }">
            <el-tag v-if="row.psi_status === 0" type="success"> 正常 </el-tag>
            <el-tag v-if="row.psi_status === 1" type="warning"> 临检 </el-tag>
            <el-tag v-if="row.psi_status === 2" type="danger"> 故障 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" :key="i" type="primary" class="el-link" @click="handleLink(row, i)">{{
              i
            }}</el-link>
          </template>
          <!-- 文件下载 -->
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
      :title="currentUpdateId === undefined ? '新增主机' : '编辑主机'"
      @close="resetForm(formRef)"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item v-if="currentUpdateId !== undefined" prop="psiId" label="ID">
          <el-input disabled v-model="currentUpdateId" />
        </el-form-item>
        <el-form-item prop="psiName" label="名称">
          <el-input v-model="formData.psiName" />
        </el-form-item>
        <el-form-item prop="psiSeria" label="序列号">
          <el-input v-model="formData.psiSeria" />
        </el-form-item>
        <el-form-item v-if="currentUpdateId === undefined" label="入库时间">
          <el-input disabled v-model="formData.psiDate" />
        </el-form-item>
        <el-form-item prop="psiModel" label="主机型号">
          <el-select v-model="formData.psiModel" placeholder="请选择">
            <el-option
              v-for="item in pisModelTypes"
              :label="item.psimodel_name"
              :value="item.psimodel_id"
              :key="item.psimodel_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetForm(formRef)">取消</el-button>
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
