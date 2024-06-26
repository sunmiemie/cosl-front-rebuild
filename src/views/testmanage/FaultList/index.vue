<script lang="ts" setup>
import { reactive, ref, watch } from "vue"
// import { createTableDataApi, deleteTableDataApi, getTableDataApi, updateTableDataApi } from "@/api/table"
// import { type GetTableData } from "@/api/table/types/table"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { CirclePlus, Refresh, RefreshRight, Search } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import TableComponent from "@/components/Table/index.vue"
import type { UploadProps } from "element-plus"
import Vue from "vue"

defineOptions({
  // 命名当前组件
  name: "ElementPlus"
})
const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const defaultinfo = reactive({
  ID: "",
  type: "",
  defaultHost: "",
  Troubleshooting: "",
  Troublestreatment: ""
})

// 显示
const aspectDialog = ref<any>(false)
const DefaultSuccess = ref<any>(false)
const dialogVisible2 = ref<any>(false)
const handleCreate = () => {}
const resetForm = () => {
  currentUpdateId.value = undefined
}

//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)

type TableDataType = {
  number: string
  order: string
  name: string
  user: string
  status: string
  link?: any
}

//const tableData = ref<GetTableData[]>([])
const headers = ref([
  { prop: "number", label: "故障工单号", align: "center" },
  { prop: "order", label: "关联测试工单", align: "center" },
  { prop: "name", label: "故障名称", align: "center" },
  { prop: "user", label: "责任人", align: "center" },
  { prop: "status", label: "工单状态", type: "tag", align: "center" },
  { prop: "link", label: "操作", type: "link" }
])
const TableData = ref<Array<TableDataType>>([
  {
    number: "123456781",
    order: "123456781",
    name: "Test",
    user: "",
    status: "0"
  },
  {
    number: "123456782",
    order: "123456782",
    name: "Test",
    user: "editor",
    status: "1"
  },
  {
    number: "123456783",
    order: "123456783",
    name: "Test",
    user: "editor",
    status: "2"
  },
  {
    number: "123456784",
    order: "123456784",
    name: "Test",
    user: "editor",
    status: "3"
  }
])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  username: "",
  phone: ""
})
const defineLink = (status: string) => {
  switch (status) {
    case "0":
      return { 1: "受理" }
    case "1":
      return { 1: "处理" }
    case "2":
      return { 1: "详情" }
    case "3":
      return { 1: "详情" }
  }
}
const getTableData = () => {
  for (let i = 0; i < TableData.value.length; i++) {
    console.log(TableData.value[i])
    TableData.value[i].link = defineLink(TableData.value[i].status)
  }
}
const handleLink = (data: any, i: string) => {
  if (i === "受理") {
//     submitApi(data)
//       .then(() => {
//         ElMessage.success("提交成功")
//       })
    aspectDialog.value = true
  } else if (i === "处理") {
    DefaultSuccess.value = true
    // DefaultSuccess.data = data
    console.log(DefaultSuccess)
  } else if (i === "详情") {
    dialogVisible2.value = true
  }
}
const handleSearch = () => {
  //paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

// 图片上传

const imageUrl = ref("")
import { Delete, Download, Plus, ZoomIn } from "@element-plus/icons-vue"

import type { UploadFile } from "element-plus"
// 排查和处理故障记录的imgUrl
const dialogInvestigation = ref("")
const dialogDispose = ref("")
// 显示
const dialogVisible1 = ref(false)
const dialogDispose2 = ref(false)
const disabled = ref(false)

const handleRemove = (file: UploadFile) => {
  console.log(file)
}
// 排查故障
const handlePictureCardPreviewInvestigation = (file: UploadFile) => {
  dialogInvestigation.value = file.url!
  dialogVisible1.value = true
}
const handlePictureCardPreviewDispose = (file: UploadFile) => {
  dialogDispose.value = file.url!
  dialogDispose2.value = true
}

// 下载
const handleDownloadInvestigation = (file: UploadFile) => {
  console.log(file)
}
const handleDownloadDisponse = (file: UploadFile) => {
  console.log(file)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="number" label="工单号">
          <el-input v-model="searchData.phone" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="username" label="故障名">
          <el-input v-model="searchData.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="username" label="工单状态">
          <el-select v-model="searchData.username" placeholder="请选择" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" :icon="RefreshRight" circle @click="" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <TableComponent :tableData="TableData" :column-data="headers" stripe>
          <template #status="{ row }">
            <el-tag v-if="row.status === '0'" type="danger"> 待受理 </el-tag>
            <el-tag v-if="row.status === '1'" type="warning"> 待处理 </el-tag>
            <el-tag v-if="row.status === '2'"> 处理中 </el-tag>
            <el-tag v-if="row.status === '3'" type="success"> 处理完成 </el-tag>
          </template>
          <template #link="{ row }">
            <el-link v-for="i in row.link" type="primary" class="el-link" @click="handleLink(row, i)">{{ i }}</el-link>
          </template>
        </TableComponent>
        <!-- 受理成功 -->
        <el-dialog
          v-model="aspectDialog"
          :show-close="false"
          width="500"
          style="height: 100px; position: relative"
          :align-center="true"
        >
          <template #header>
            <h2>故障受理成功</h2>
            <!-- <el-icon type="Select" :size="30" color="green" style="position: absolute;right: 10%;top: 40% ">
              <Select />
            </el-icon> -->
            <img src="../../../assets/iconimg/对号.png" alt="" class="fault-img" />
          </template>
        </el-dialog>
        <!-- 处理 -->
        <el-dialog v-model="DefaultSuccess" :title="'故障工单处理'" style="position: relative">
          <template #header>
            <h2>故障工单处理</h2>
          </template>
          <el-row>
            <el-col :span="24">
              <el-text size="large">故障基本信息</el-text>
              <div class="default-success">
                <el-text size="large">工单ID：xxx</el-text>
                <el-text size="large">测试类型：xxx</el-text>
                <el-text size="large">故障设备：xxx</el-text>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" style="margin-top: 20px">
              <el-text>1.故障排查记录</el-text>
              <!-- 自定义缩略图 -->
              <!-- 排查 -->
              <el-upload action="#" list-type="picture-card" :auto-upload="false" style="margin: 20px 0">
                <el-icon>
                  <Plus />
                </el-icon>
                <template #file="{ file }">
                  <div>
                    <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    <span class="el-upload-list__item-actions">
                      <span class="el-upload-list__item-preview" @click="handlePictureCardPreviewInvestigation(file)">
                        <el-icon><zoom-in /></el-icon>
                      </span>
                      <span
                        v-if="!disabled"
                        class="el-upload-list__item-delete"
                        @click="handleDownloadInvestigation(file)"
                      >
                        <el-icon>
                          <Download />
                        </el-icon>
                      </span>
                      <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </span>
                    </span>
                  </div>
                </template>
              </el-upload>

              <el-dialog v-model="dialogVisible1">
                <img w-full :src="dialogInvestigation" alt="Preview Image" />
              </el-dialog>
              <el-input
                v-model="defaultinfo.Troubleshooting"
                style="width: 500px"
                placeholder="请输入故障排查文字说明"
              />
            </el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="24">
              <el-text>2.故障处理记录</el-text>
              <!-- 自定义缩略图 -->
              <el-upload action="#" list-type="picture-card" :auto-upload="false" style="margin: 20px 0">
                <el-icon>
                  <Plus />
                </el-icon>
                <!-- 处理 -->
                <template #file="{ file }">
                  <div>
                    <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    <span class="el-upload-list__item-actions">
                      <span class="el-upload-list__item-preview" @click="handlePictureCardPreviewDispose(file)">
                        <el-icon><zoom-in /></el-icon>
                      </span>
                      <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleDownloadDisponse(file)">
                        <el-icon>
                          <Download />
                        </el-icon>
                      </span>
                      <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </span>
                    </span>
                  </div>
                </template>
                <el-dialog v-model="dialogDispose2">
                  <img w-full :src="dialogDispose" alt="Preview Image" />
                </el-dialog>
              </el-upload>

              <el-input
                v-model="defaultinfo.Troublestreatment"
                style="width: 500px"
                placeholder="请输入故障处理文字说明"
              />
            </el-col>
          </el-row>
          <template #footer>
            <el-button size="large" type="primary" icon="Check" style="position: absolute; left: 20px"
            >确认处理</el-button
            >
            <el-button size="large" type="info" icon="Close">取消修改</el-button>
          </template>
        </el-dialog>
        <!-- 详情 -->
        <el-dialog v-model="dialogVisible2">
          <template #header>
            <h2>故障工单详情</h2>
          </template>
          <el-row>
            <el-col :span="24">
              <el-text size="large">故障基本信息</el-text>
              <div class="default-success">
                <el-text size="large">工单ID：xxx</el-text>
                <el-text size="large">测试类型：xxx</el-text>
                <el-text size="large">故障设备：xxx</el-text>
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" style="margin-top: 20px">
              <el-text size="large">1.故障排查记录</el-text>
              <!-- 自定义缩略图 -->
              <!-- 排查 -->
              <img src="" alt="" style="width: 120px; height: 120px; display: block; margin: 20px 0" />
              <el-input v-model="defaultinfo.Troubleshooting" disabled style="width: 500px" />
            </el-col>
          </el-row>
          <el-row style="margin-top: 20px">
            <el-col :span="24">
              <el-text size="large">2.故障处理记录</el-text>
              <!-- 自定义缩略图 -->
              <img src="" alt="" style="width: 120px; height: 120px; display: block; margin: 20px 0" />
              <el-input v-model="defaultinfo.Troublestreatment" disabled style="width: 500px" />
            </el-col>
          </el-row>
        </el-dialog>
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
      :title="currentUpdateId === undefined ? '新增用户' : '修改用户'"
      @close="resetForm"
      width="30%"
    >
      <el-form ref="formRef" label-width="100px" label-position="left">
        <el-form-item prop="username" label="用户名">
          <el-input placeholder="请输入" />
        </el-form-item>
        <el-form-item prop="password" label="密码" v-if="currentUpdateId === undefined">
          <el-input placeholder="请输入" />
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
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

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

.fault-img {
  width: 50px;
  height: 50px;
  position: absolute;
  right: 10%;
  top: 26%;
}

.default-success {
  margin-top: 20px;
  width: 80%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 10px;
  display: flex;
  justify-content: space-around;
}
</style>
