<!-- 仪器管理 -->
<template>
  <div class="app-container">
    <el-card>
      <el-row :gutter="20">
        <!-- 左侧树形结构 -->
        <el-col :span="5">
          <el-card v-loading="treeLoading" shadow="never" style="height: 100%">
            <template #header>
              <el-button
                v-permission="['1']"
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
              :default-expanded-keys="defaultExpandedKeys"
              accordion
              :filter-node-method="filterNode"
              @node-click="handleNodeClick"
            />
          </el-card>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col v-if="!searchData.typeId" :span="19">
          <el-card shadow="never" style="height: 100%; display: flex; align-items: center; justify-content: center">
            <el-empty description="请从左侧选择仪器类型" />
          </el-card>
        </el-col>
        <el-col v-else :span="19">
          <div class="affix-container">
            <el-card shadow="never" class="search-wrapper">
              <el-form ref="searchFormRef" :inline="true" :model="searchData">
                <el-form-item prop="name" label="型号名称">
                  <el-input v-model="searchData.name" placeholder="请输入" />
                </el-form-item>
                <el-form-item prop="id" label="型号编号">
                  <el-input v-model="searchData.id" placeholder="请输入" />
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
                  <el-button type="primary" icon="circle-plus" @click="openModelDialog(false)">新增型号</el-button>
                  <el-button
                    type="danger"
                    icon="delete"
                    @click="handleDeleteManage"
                    v-if="searchData.typeId.startsWith('manage_')"
                    >删除当前大类</el-button
                  >
                </div>
                <div>
                  <el-tooltip content="刷新当前页">
                    <el-button type="primary" icon="refresh-right" circle @click="getTableData" />
                  </el-tooltip>
                </div>
              </div>

              <div class="table-wrapper">
                <TableComponent :tableData="InstrumentData" :column-data="headers" stripe>
                  <template #link="{ row }">
                    <el-button link type="primary" @click="openModelDialog(true, row)">编辑</el-button>
                    <el-button link type="danger" @click="handleDeleteModel(row)">删除</el-button>
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
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新增/编辑仪器型号弹窗 -->
    <el-dialog
      v-model="modelDialogVisible"
      :title="isEdit ? '编辑仪器型号' : '新增仪器型号'"
      width="500px"
      @close="resetModelForm"
    >
      <el-form ref="modelFormRef" :model="modelFormData" :rules="modelRules" label-width="100px">
        <el-form-item label="仪器名称" prop="type">
          <el-select v-model="modelFormData.type" placeholder="请选择仪器名称" style="width: 100%">
            <el-option v-for="item in manageOptions" :key="item.id" :label="item.label" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="modelFormData.name" placeholder="请输入仪器名称编号" />
        </el-form-item>
        <el-form-item label="仪器型号" prop="id">
          <el-input v-model="modelFormData.id" placeholder="请输入型号编号(唯一)" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="modelFormData.remark" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="modelDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleModelSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新增批次上传弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增批次" @close="resetForm" width="30%">
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
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件至此 或 <em>点击选择文件上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            Tip：请上传xlsx后缀的表格文件，包含列：仪器大类, 仪器型号名称, 仪器型号编号, 备注
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="closeDialogs">取消</el-button>
        <el-button type="primary" @click="generatePreview">预览</el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewDialogVisible" top="5vh">
      <el-card shadow="never">
        <el-row>
          <el-col :span="24">
            <h3 class="table-title">批量导入预览数据</h3>
          </el-col>
        </el-row>
        <el-table :data="preview.items" max-height="500">
          <el-table-column property="manage_name" label="仪器大类" />
          <el-table-column property="model_name" label="仪器型号名称" />
          <el-table-column property="model_number" label="仪器型号编号" />
          <el-table-column property="remark" label="备注" />
        </el-table>

        <el-row>
          <el-col :span="24">
            <h3 class="table-title">即将添加 {{ preview.items.length }} 条数据，确认添加吗？</h3>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed } from "vue"
import { ElMessage, ElMessageBox, ElTree, type FormInstance, type UploadProps, type UploadUserFile } from "element-plus"
import { UploadFilled } from "@element-plus/icons-vue"
import TableComponent from "@/components/Table/index.vue"
import { usePagination } from "@/hooks/usePagination"
import { request } from "@/utils/service"

const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: [10, 20, 50, 100],
  layout: "total, sizes, prev, pager, next, jumper"
})

const handleCurrentChange = (val: number) => {
  paginationData.currentPage = val
  getTableData()
}

const handleSizeChange = (val: number) => {
  paginationData.pageSize = val
  getTableData()
}

const loading = ref(false)
const treeLoading = ref(false)
const submitLoading = ref(false)

// 弹窗控制
const modelDialogVisible = ref(false)
const isEdit = ref(false)

const treeRef = ref<InstanceType<typeof ElTree>>()
const filterText = ref("")

watch(filterText, (val) => {
  treeRef.value!.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

const defaultProps = {
  children: "children",
  label: "label"
}

const TreeData = ref<any[]>([])
const InstrumentData = ref<any[]>([])
const defaultExpandedKeys = ref<string[]>([])

// 计算出供下拉框选择的仪器大类选项
const manageOptions = computed(() => {
  return TreeData.value.map((item) => ({
    id: item.id,
    label: item.label
  }))
})

const searchFormRef = ref<FormInstance | null>(null)
const modelFormRef = ref<FormInstance | null>(null)

const searchData = reactive({
  name: "",
  id: "",
  typeId: "" // 左侧树选中的节点ID
})

const modelFormData = reactive({
  db_id: "", // 数据库主键id
  id: "", // 型号编号
  name: "", // 型号名称
  type: "", // 关联的大类ID (manage_xx)
  remark: ""
})

const modelRules = {
  name: [{ required: true, message: "请输入仪器型号", trigger: "blur" }],
  id: [{ required: true, message: "请输入SN号", trigger: "blur" }],
  type: [{ required: true, message: "请选择仪器名称", trigger: "change" }]
}

const headers = ref([
  { prop: "model_number", label: "SN号", align: "center" },
  { prop: "name", label: "仪器型号", align: "center" },
  { prop: "product", label: "仪器名称", align: "center" },
  { prop: "in_time", label: "入库时间", align: "center" },
  { prop: "remark", label: "备注", align: "center" },
  { prop: "link", label: "操作", type: "link", align: "center", width: 150 }
])

// 获取左侧树形数据
const getTreeData = () => {
  treeLoading.value = true
  request({ url: "equipment/instrument-instance/tree/", method: "get" })
    .then((res: any) => {
      TreeData.value = res.data.list
      if (TreeData.value.length > 0 && defaultExpandedKeys.value.length === 0) {
        defaultExpandedKeys.value = [TreeData.value[0].id]
      }
    })
    .catch(() => {
      TreeData.value = []
    })
    .finally(() => {
      treeLoading.value = false
    })
}

// 获取右侧表格数据
const getTableData = () => {
  if (!searchData.typeId) return

  loading.value = true
  request({
    url: "equipment/instrument-instance/list/",
    method: "get",
    params: {
      currentPage: paginationData.currentPage,
      pageSize: paginationData.pageSize,
      name: searchData.name,
      id: searchData.id,
      typeId: searchData.typeId
    }
  })
    .then((res: any) => {
      paginationData.total = res.data.total
      InstrumentData.value = res.data.list
    })
    .catch(() => {
      InstrumentData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

const handleNodeClick = (data: any) => {
  // 一级分类不展示右侧界面
  if (data.id && data.id.startsWith("manage_")) {
    searchData.typeId = ""
    InstrumentData.value = []
    return
  }
  searchData.typeId = data.id
  paginationData.currentPage = 1
  getTableData()
}

const handleSearch = () => {
  paginationData.currentPage = 1
  getTableData()
}

const resetSearch = () => {
  searchData.name = ""
  searchData.id = ""
  paginationData.currentPage = 1
  getTableData()
}

// ---- 仪器型号操作 ----
const openModelDialog = (edit = false, row?: any) => {
  isEdit.value = edit
  if (edit && row) {
    modelFormData.db_id = row.id
    modelFormData.id = row.model_number
    modelFormData.name = row.name
    modelFormData.remark = row.remark || ""

    // 寻找当前所属的大类
    let parentId = ""
    if (searchData.typeId.startsWith("manage_")) {
      parentId = searchData.typeId
    } else {
      // 如果选中的是子节点，找到它的父节点
      const parent = TreeData.value.find((p) => p.children?.some((c: any) => c.id === searchData.typeId))
      if (parent) parentId = parent.id
    }
    modelFormData.type = parentId
  } else {
    // 新增时默认选中当前大类
    let parentId = ""
    if (searchData.typeId.startsWith("manage_")) {
      parentId = searchData.typeId
    } else if (searchData.typeId.startsWith("model_")) {
      const parent = TreeData.value.find((p) => p.children?.some((c: any) => c.id === searchData.typeId))
      if (parent) parentId = parent.id
    }
    modelFormData.type = parentId
  }
  modelDialogVisible.value = true
}

const resetModelForm = () => {
  if (modelFormRef.value) {
    modelFormRef.value.resetFields()
  }
  modelFormData.db_id = ""
  modelFormData.id = ""
  modelFormData.name = ""
  modelFormData.remark = ""
}

const handleModelSubmit = () => {
  if (!modelFormRef.value) return
  modelFormRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      const url = isEdit.value ? "equipment/instrument-instance/update/" : "equipment/instrument-instance/create/"
      request({
        url,
        method: "post",
        data: {
          id: isEdit.value ? modelFormData.db_id : modelFormData.id, // 新增传编号，编辑传主键
          name: modelFormData.name,
          type: modelFormData.type,
          remark: modelFormData.remark
        }
      })
        .then(() => {
          ElMessage.success(isEdit.value ? "编辑成功" : "新增成功")
          modelDialogVisible.value = false
          getTreeData()
          getTableData()
        })
        .finally(() => {
          submitLoading.value = false
        })
    }
  })
}

const handleDeleteModel = (row: any) => {
  ElMessageBox.confirm(`确定要删除型号 [${row.name}] 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    request({
      url: `equipment/instrument-instance/delete/${row.id}/`,
      method: "delete"
    }).then(() => {
      ElMessage.success("删除成功")
      getTreeData()
      getTableData()
    })
  })
}

// ---- 仪器大类操作 ----
const handleDeleteManage = () => {
  if (!searchData.typeId.startsWith("manage_")) return
  const manageId = searchData.typeId.split("_")[1]

  ElMessageBox.confirm("确定要删除当前仪器大类吗？这将删除其下所有型号！", "严重警告", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "error"
  }).then(() => {
    request({
      url: `equipment/instrument-manage/delete/${manageId}/`,
      method: "delete"
    }).then(() => {
      ElMessage.success("删除大类成功")
      searchData.typeId = ""
      InstrumentData.value = []
      getTreeData()
    })
  })
}

// ---- 批量导入相关逻辑 ----
const dialogVisible = ref(false)
const previewDialogVisible = ref(false)
const fileList = reactive<{ file: UploadUserFile[] }>({ file: [] })
const preview = reactive({
  items: [] as any[]
})

const resetForm = () => {
  fileList.file = []
}

const closeDialogs = () => {
  dialogVisible.value = false
  previewDialogVisible.value = false
  resetForm()
}

const exceedFile: UploadProps["onExceed"] = (files, uploadFiles) => {
  ElMessage.warning("只能上传一个文件")
}

const handleError: UploadProps["onError"] = (error, uploadFile, uploadFiles) => {
  ElMessage.error("上传失败")
}

const handleSuccess: UploadProps["onSuccess"] = (response, uploadFile, uploadFiles) => {
  ElMessage.success("上传成功")
}

const beforeUpload: UploadProps["beforeUpload"] = (file) => {
  const isExcel =
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  if (!isExcel) {
    ElMessage.error("只能上传 xlsx/xls 文件!")
  }
  return isExcel
}

const generatePreview = () => {
  if (fileList.file.length === 0) {
    ElMessage.error("请先选择文件")
    return
  }
  const formData = new FormData()
  formData.append("file", fileList.file[0].raw as File)

  request({
    url: "equipment/instrument-instance/preview/",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
    .then((res: any) => {
      if (res.code === 0) {
        preview.items = res.data.list
        previewDialogVisible.value = true
        dialogVisible.value = false
      } else {
        ElMessage.error(res.message || "预览失败")
      }
    })
    .catch((err) => {
      ElMessage.error("文件解析异常")
    })
}

const cancelInsert = () => {
  previewDialogVisible.value = false
  preview.items = []
  resetForm()
}

const bulkImport = () => {
  request({
    url: "equipment/instrument-instance/import/",
    method: "post",
    data: {
      list: preview.items
    }
  })
    .then((res: any) => {
      if (res.code === 0) {
        ElMessage.success(res.message || "导入成功")
        previewDialogVisible.value = false
        getTreeData()
      } else {
        ElMessage.error(res.message || "导入失败")
      }
    })
    .catch(() => {
      ElMessage.error("导入异常")
    })
}

onMounted(() => {
  getTreeData()
  watch([() => paginationData.currentPage, () => paginationData.pageSize], () => {
    if (searchData.typeId) getTableData()
  })
})
</script>

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

.pager-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
