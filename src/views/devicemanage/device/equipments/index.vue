<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
import { createOtherDataApi, getOtherModelDataApi, updateOtherModelDataApi } from "@/api/othermodel"
import { getAnnualinspection } from "@/api/Annualinspection/index"
import { getEquipmentTypeDataApi } from "@/api/otherModelType"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search, Printer, UploadFilled } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import { fileDownoload } from "@/api/file/index"
import QrcodeVue from "qrcode.vue"
defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const qrcodeVisible = ref<boolean>(false)
const qrcodeValue = ref<string>("")
const checkVisible = ref<boolean>(false)
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const checkRef = ref<FormInstance | null>(null)
const fileList = reactive<any>({
  file: []
})
const checkData = reactive({
  updateDate: ""
})
const formData = reactive({
  name: "",
  type: "",
  seria: ""
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "请输入设备名" }],
  model: [{ required: true, trigger: "blur", message: "请选择型号" }],
  seria: [{ required: true, trigger: "blur", message: "请输入序列号" }]
})
const addData = reactive<any>({
  seria: "",
  name: "",
  type: "",
  id: null
})

const handleCreate = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        delete addData.id
        createOtherDataApi(addData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            Object.keys(formData).forEach((key: any) => (formData[key] = ""))
            dialogVisible.value = false
          })
      } else {
        updateOtherModelDataApi({
          seria: addData.seria,
          name: addData.name,
          type: addData.type,
          id: addData.id
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
  Object.keys(formData).forEach((key: any) => (formData[key] = ""))
  Object.keys(addData).forEach((key: any) => (addData[key] = ""))
}

const currentUpdateId = ref<any>(undefined)
const headers = ref([
  { prop: "equipment_id", label: "设备ID", align: "center", fixed: "left" },
  { prop: "equipment_name", label: "设备名称", align: "center" },
  { prop: "equipmenttype_name", label: "设备型号", align: "center" },
  { prop: "equipment_serialnumber", label: "设备序列号", align: "center" },
  { prop: "equipment_date", label: "入库时间", align: "center" },
  { prop: "equipment_status", label: "设备状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "right" }
])
const TableData = ref<any>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive<any>({
  seria: "",
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
const TypeList = ref<any>([])
const getTableData = () => {
  loading.value = true
  getOtherModelDataApi({
    currentPage: paginationData.currentPage,
    size: paginationData.pageSize,
    seria: searchData.seria || undefined,
    name: searchData.name || undefined,
    type: searchData.type || undefined
  })
    .then((res: any) => {
      paginationData.total = res.data.total
      TableData.value = res.data.list
      for (let i = 0; i < TableData.value.length; i++) {
        TableData.value[i].link = defineLink(TableData.value[i].equipment_status)
      }
    })
    .catch(() => {
      TableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
  getEquipmentTypeDataApi({ currentPage: 1, size: 999999 }).then((res) => {
    TypeList.value = res.data.list
  })
}
// 新增其他设备
const addOtherEquiment = () => {
  dialogVisible.value = true
}

const selectedRows = ref([])
const handleSelectionChange = (val: any) => {
  console.log("index", val)
  selectedRows.value = val
}
const getSelection = () => {
  console.log("print", selectedRows.value)
}
const handleLink = (data: any, i: string) => {
  if (i === "编辑") {
    console.log(data)
    dialogVisible.value = true
    currentUpdateId.value = data.equipment_id
    addData.type = data.equipmenttype_id
    addData.seria = data.equipment_serialnumber
    addData.name = data.equipment_name
    addData.id = currentUpdateId.value
  }
  if (i === "二维码") {
    qrcodeValue.value = data.equipment_serialnumber
    qrcodeVisible.value = true
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
  Object.keys(searchData).forEach((key: any) => (searchData[key] = ""))
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
  form.append("type", "3")
  getAnnualinspection(form)
    .then(() => {
      ElMessage.success("更新成功")
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
        <el-form-item prop="name" label="设备名称">
          <el-input v-model="searchData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="type" label="设备型号">
          <el-select v-model="searchData.type" placeholder="请选择" style="width: 150px">
            <el-option v-for="item in TypeList" :label="item.name" :value="item.id" :key="item.id" />
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
          <el-button type="primary" :icon="CirclePlus" @click="addOtherEquiment">新增设备</el-button>
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
          <template #equipment_status="{ row }">
            <el-tag v-if="row.equipment_status === 0" type="success"> 正常 </el-tag>
            <el-tag v-if="row.equipment_status === 1" type="warning"> 临检 </el-tag>
            <el-tag v-if="row.equipment_status === 2" type="danger"> 故障 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" type="primary" class="el-link" :key="i" @click="handleLink(row, i)">{{
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
      :title="currentUpdateId === undefined ? '新增设备' : '编辑设备'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item v-if="currentUpdateId !== undefined" prop="id" label="设备ID">
          <el-input disabled v-model="currentUpdateId" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="name" label="设备名称">
          <el-input v-model="addData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="model" label="设备型号">
          <el-select v-model="addData.type" placeholder="请选择">
            <el-option v-for="item in TypeList" :label="item.name" :value="item.id" :key="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="seria" label="设备序列号">
          <el-input v-model="addData.seria" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
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
  margin-left: 8px;
}
</style>
