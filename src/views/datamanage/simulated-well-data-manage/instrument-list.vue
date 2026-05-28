<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="SN号">
          <el-input v-model="filterForm.sn" placeholder="请输入SN号" clearable />
        </el-form-item>
        <el-form-item label="仪器名称">
          <el-input v-model="filterForm.name" placeholder="请输入名称" clearable />
        </el-form-item>
        <el-form-item label="型号">
          <el-select v-model="filterForm.model_number" placeholder="全部" clearable style="width: 180px">
            <el-option v-for="m in modelOptions" :key="m.id" :label="m.model_number" :value="m.model_number" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 180px">
            <el-option label="正常" value="正常" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已到期" value="已到期" />
            <el-option label="维修中" value="维修中" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" @click="openCreate">新增仪器</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%" v-loading="loading">
          <el-table-column prop="sn" label="SN号" min-width="170" />
          <el-table-column prop="name" label="仪器名称" min-width="160" />
          <el-table-column prop="status" label="状态" min-width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="manufacturer" label="制造商" min-width="140" />
          <el-table-column prop="model_number" label="型号" min-width="140" />
          <el-table-column prop="used_count" label="使用次数" min-width="110" align="center" />
          <el-table-column prop="remain_count" label="剩余可用次数" min-width="130" align="center" />
          <el-table-column prop="created_at" label="创建时间" min-width="180" />
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openView(row)">查看</el-button>
              <el-button type="warning" link @click="openEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        class="pager-wrapper"
        background
        :layout="paginationData.layout"
        :page-sizes="paginationData.pageSizes"
        :total="paginationData.total"
        :page-size="paginationData.pageSize"
        :current-page="paginationData.currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="SN号" prop="sn">
          <el-input v-model="formData.sn" placeholder="请输入" :disabled="dialogMode === 'view'" />
        </el-form-item>
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入" :disabled="dialogMode === 'view'" />
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="formData.manufacturer" placeholder="请输入" :disabled="dialogMode === 'view'" />
        </el-form-item>
        <el-form-item label="型号" prop="model_id">
          <el-select
            v-model="formData.model_id"
            placeholder="请选择"
            style="width: 100%"
            :disabled="dialogMode === 'view'"
          >
            <el-option v-for="m in modelOptions" :key="m.id" :label="m.model_number" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="formData.status"
            placeholder="请选择"
            style="width: 100%"
            :disabled="dialogMode === 'view'"
          >
            <el-option label="正常" value="正常" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已到期" value="已到期" />
            <el-option label="维修中" value="维修中" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用次数" prop="used_count">
          <el-input-number
            v-model="formData.used_count"
            :min="0"
            controls-position="right"
            style="width: 100%"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
        <el-form-item label="剩余可用次数" prop="remain_count">
          <el-input-number
            v-model="formData.remain_count"
            :min="0"
            controls-position="right"
            style="width: 100%"
            :disabled="dialogMode === 'view'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-if="dialogMode !== 'view'" type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, type Ref } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import { getInstrumentModelListApi } from "@/api/instrument-model"
import type { InstrumentModelItem } from "@/api/instrument-model/types"
import {
  createSimInstrumentApi,
  deleteSimInstrumentApi,
  getSimInstrumentListApi,
  updateSimInstrumentApi
} from "@/api/sim-instrument"
import type { SimInstrumentItem } from "@/api/sim-instrument/types"

const loading = ref(false)
const tableData = ref<SimInstrumentItem[]>([])
const modelOptions = ref<InstrumentModelItem[]>([])
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const filterForm = reactive({
  sn: "",
  name: "",
  model_number: "",
  status: ""
})

const resetSearch = () => {
  filterForm.sn = ""
  filterForm.name = ""
  filterForm.model_number = ""
  filterForm.status = ""
  paginationData.currentPage = 1
  getTableData()
}

const handleSearch = () => {
  paginationData.currentPage = 1
  getTableData()
}

const getModels = () => {
  getInstrumentModelListApi({ currentPage: 1, pageSize: 1000 }).then((res) => {
    modelOptions.value = res.data.list || []
  })
}

const getTableData = () => {
  loading.value = true
  getSimInstrumentListApi({
    sn: filterForm.sn || undefined,
    name: filterForm.name || undefined,
    model_number: filterForm.model_number || undefined,
    status: filterForm.status || undefined,
    currentPage: paginationData.currentPage,
    pageSize: paginationData.pageSize
  })
    .then((res) => {
      tableData.value = res.data.list || []
      paginationData.total = res.data.total || 0
      paginationData.currentPage = res.data.currentPage || paginationData.currentPage
    })
    .catch((err) => {
      const raw = err?.response?.data
      const msg =
        raw?.message ||
        raw?.msg ||
        raw?.errormessage ||
        (typeof raw === "string" ? raw : "") ||
        err?.message ||
        "查询失败"
      ElMessage.error(msg)
      tableData.value = []
      paginationData.total = 0
    })
    .finally(() => {
      loading.value = false
    })
}

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
watch(
  () => modelOptions.value.length,
  () => {
    if (!modelOptions.value.length) getModels()
  },
  { immediate: true }
)

const statusTagType = (status: string): "success" | "warning" | "danger" | "info" => {
  if (status === "正常") return "success"
  if (status === "即将到期") return "warning"
  if (status === "已到期") return "danger"
  return "info"
}

const dialogVisible = ref(false)
const dialogTitle = ref("新增仪器")
const dialogMode: Ref<"create" | "edit" | "view"> = ref("create")
const currentUpdateId: Ref<number | null> = ref(null)

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  sn: "",
  name: "",
  manufacturer: "",
  model_id: null as number | null,
  status: "正常",
  used_count: 0,
  remain_count: 0
})

const formRules: FormRules = reactive({
  sn: [{ required: true, trigger: "blur", message: "请输入SN号" }],
  name: [{ required: true, trigger: "blur", message: "请输入仪器名称" }],
  model_id: [{ required: true, trigger: "change", message: "请选择型号" }],
  status: [{ required: true, trigger: "change", message: "请选择状态" }]
})

const closeDialog = () => {
  dialogVisible.value = false
  currentUpdateId.value = null
  formData.sn = ""
  formData.name = ""
  formData.manufacturer = ""
  formData.model_id = null
  formData.status = "正常"
  formData.used_count = 0
  formData.remain_count = 0
}

const openCreate = () => {
  dialogMode.value = "create"
  dialogTitle.value = "新增仪器"
  closeDialog()
  dialogVisible.value = true
}

const openEdit = (row: SimInstrumentItem) => {
  dialogMode.value = "edit"
  dialogTitle.value = "编辑仪器"
  currentUpdateId.value = row.id
  dialogVisible.value = true
  formData.sn = row.sn
  formData.name = row.name
  formData.manufacturer = (row.manufacturer as string) || ""
  formData.model_id = row.model_id
  formData.status = row.status
  formData.used_count = row.used_count ?? 0
  formData.remain_count = row.remain_count ?? 0
}

const openView = (row: SimInstrumentItem) => {
  dialogMode.value = "view"
  dialogTitle.value = "查看仪器"
  currentUpdateId.value = row.id
  dialogVisible.value = true
  formData.sn = row.sn
  formData.name = row.name
  formData.manufacturer = (row.manufacturer as string) || ""
  formData.model_id = row.model_id
  formData.status = row.status
  formData.used_count = row.used_count ?? 0
  formData.remain_count = row.remain_count ?? 0
}

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    const payload = {
      sn: formData.sn,
      name: formData.name,
      manufacturer: formData.manufacturer,
      model_id: formData.model_id as number,
      status: formData.status,
      used_count: formData.used_count,
      remain_count: formData.remain_count
    }
    const req = currentUpdateId.value
      ? updateSimInstrumentApi(currentUpdateId.value, payload)
      : createSimInstrumentApi(payload)
    req
      .then(() => {
        ElMessage.success("保存成功")
        closeDialog()
        getTableData()
      })
      .catch((err) => {
        const raw = err?.response?.data
        const msg = raw?.message || raw?.msg || err?.message || "保存失败"
        ElMessage.error(msg)
      })
  })
}

const handleDelete = (row: SimInstrumentItem) => {
  ElMessageBox.confirm("确定删除该仪器吗？", "警告", {
    type: "warning",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger"
  }).then(() => {
    deleteSimInstrumentApi(row.id)
      .then(() => {
        ElMessage.success("删除成功")
        getTableData()
      })
      .catch((err) => {
        const raw = err?.response?.data
        const msg = raw?.message || raw?.msg || err?.message || "删除失败"
        ElMessage.error(msg)
      })
  })
}
</script>

<style lang="scss" scoped>
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
</style>
