<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form :inline="true" :model="searchData">
        <el-form-item label="关键字">
          <el-input v-model="searchData.keyword" placeholder="型号名称/型号代号" clearable />
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
          <el-button type="primary" @click="openCreate">新增型号</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%" v-loading="loading">
          <el-table-column prop="model_name" label="型号名称" min-width="180" />
          <el-table-column prop="model_number" label="型号代号" min-width="180" />
          <el-table-column prop="temperature" label="温度" min-width="120" show-overflow-tooltip />
          <el-table-column prop="remark" label="描述" min-width="180" show-overflow-tooltip />
          <el-table-column prop="normal_cycle" label="非高温维保周期(次)" min-width="170" align="center" />
          <el-table-column prop="high_cycle" label="高温维保周期(次)" min-width="160" align="center" />
          <el-table-column prop="coefficient" label="换算系数" min-width="120" align="center" />
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @close="closeDialog">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="140px">
        <el-form-item label="型号名称" prop="model_name">
          <el-input v-model="formData.model_name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="型号代号" prop="model_number">
          <el-input v-model="formData.model_number" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="温度" prop="temperature">
          <el-input v-model="formData.temperature" placeholder="请输入，如 150℃" />
        </el-form-item>
        <el-form-item label="描述" prop="remark">
          <el-input v-model="formData.remark" placeholder="请输入" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="非高温维保周期(次)" prop="normal_cycle">
          <el-input-number v-model="formData.normal_cycle" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="高温维保周期(次)" prop="high_cycle">
          <el-input-number v-model="formData.high_cycle" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="换算系数" prop="coefficient">
          <el-input-number v-model="formData.coefficient" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, type Ref } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import {
  getInstrumentModelListApi,
  createInstrumentModelApi,
  updateInstrumentModelApi,
  deleteInstrumentModelApi
} from "@/api/instrument-model"
import type { InstrumentModelItem } from "@/api/instrument-model/types"

const loading = ref(false)
const tableData = ref<InstrumentModelItem[]>([])
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const searchData = reactive({
  keyword: ""
})

const resetSearch = () => {
  searchData.keyword = ""
  paginationData.currentPage = 1
  getTableData()
}

const handleSearch = () => {
  paginationData.currentPage = 1
  getTableData()
}

const getTableData = () => {
  loading.value = true
  getInstrumentModelListApi({
    keyword: searchData.keyword || undefined,
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

const dialogVisible = ref(false)
const dialogTitle = ref("新增型号")
const currentUpdateId: Ref<number | null> = ref(null)

const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  model_name: "",
  model_number: "",
  temperature: "",
  remark: "",
  normal_cycle: 0,
  high_cycle: 0,
  coefficient: 1
})

const formRules: FormRules = reactive({
  model_name: [{ required: true, trigger: "blur", message: "请输入型号名称" }],
  model_number: [{ required: true, trigger: "blur", message: "请输入型号代号" }]
})

const closeDialog = () => {
  dialogVisible.value = false
  currentUpdateId.value = null
  formData.model_name = ""
  formData.model_number = ""
  formData.temperature = ""
  formData.remark = ""
  formData.normal_cycle = 0
  formData.high_cycle = 0
  formData.coefficient = 1
}

const openCreate = () => {
  dialogTitle.value = "新增型号"
  closeDialog()
  dialogVisible.value = true
}

const openEdit = (row: InstrumentModelItem) => {
  dialogTitle.value = "编辑型号"
  currentUpdateId.value = row.id
  dialogVisible.value = true
  formData.model_name = row.model_name
  formData.model_number = row.model_number
  formData.temperature = row.temperature || ""
  formData.remark = (row.remark as string) || ""
  formData.normal_cycle = row.normal_cycle ?? 0
  formData.high_cycle = row.high_cycle ?? 0
  formData.coefficient = row.coefficient ?? 1
}

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    const payload = {
      model_name: formData.model_name,
      model_number: formData.model_number,
      temperature: formData.temperature,
      remark: formData.remark,
      normal_cycle: formData.normal_cycle,
      high_cycle: formData.high_cycle,
      coefficient: formData.coefficient
    }
    const req = currentUpdateId.value
      ? updateInstrumentModelApi(currentUpdateId.value, payload)
      : createInstrumentModelApi(payload)

    req
      .then(() => {
        ElMessage.success("保存成功")
        closeDialog()
        getTableData()
      })
      .catch((err) => {
        const msg = err?.response?.data?.msg || err?.response?.data?.message || "保存失败"
        ElMessage.error(msg)
      })
  })
}

const handleDelete = (row: InstrumentModelItem) => {
  ElMessageBox.confirm("确定删除该型号吗？", "警告", {
    type: "warning",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger"
  }).then(() => {
    deleteInstrumentModelApi(row.id)
      .then(() => {
        ElMessage.success("删除成功")
        getTableData()
      })
      .catch((err) => {
        const msg = err?.response?.data?.msg || err?.response?.data?.message || "删除失败"
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
