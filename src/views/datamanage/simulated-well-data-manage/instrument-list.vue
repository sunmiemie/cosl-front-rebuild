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
            <el-option label="维保中" value="维保中" />
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
        <el-button type="primary" @click="openCreate">新增仪器</el-button>
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
          <el-table-column prop="updated_at" label="更新时间" min-width="180" />
          <el-table-column label="操作" width="210" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openDetail(row)">查看</el-button>
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
          <el-input v-model="formData.sn" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="仪器名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="制造商" prop="manufacturer">
          <el-input v-model="formData.manufacturer" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="型号" prop="model_id">
          <el-select v-model="formData.model_id" placeholder="请选择" style="width: 100%">
            <el-option v-for="m in modelOptions" :key="m.id" :label="m.model_number" :value="m.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="即将到期" value="即将到期" />
            <el-option label="已到期" value="已到期" />
            <el-option label="维保中" value="维保中" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用次数" prop="used_count">
          <el-input-number v-model="formData.used_count" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="剩余可用次数" prop="remain_count">
          <el-input-number v-model="formData.remain_count" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" size="76%" :title="detailTitle" destroy-on-close>
      <div v-loading="detailLoading" class="instrument-detail">
        <template v-if="currentInstrument">
          <div class="detail-summary">
            <div class="summary-main">
              <div class="summary-title">{{ currentInstrument.name }}</div>
              <div class="summary-subtitle">SN：{{ currentInstrument.sn }} / 型号：{{ currentInstrument.model_number || "-" }}</div>
            </div>
            <div class="summary-stats">
              <div class="summary-stat">
                <span>使用次数</span>
                <strong>{{ currentInstrument.used_count ?? 0 }}</strong>
              </div>
              <div class="summary-stat">
                <span>剩余可用次数</span>
                <strong>{{ currentInstrument.remain_count ?? 0 }}</strong>
              </div>
              <div class="summary-stat">
                <span>状态</span>
                <el-tag :type="statusTagType(currentInstrument.status)">{{ currentInstrument.status }}</el-tag>
              </div>
            </div>
          </div>

          <el-descriptions :column="3" border class="detail-descriptions">
            <el-descriptions-item label="制造商">{{ currentInstrument.manufacturer || "-" }}</el-descriptions-item>
            <el-descriptions-item label="型号名称">{{ currentInstrument.model_name || "-" }}</el-descriptions-item>
            <el-descriptions-item label="额定温度">{{ currentInstrument.temperature || "-" }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentInstrument.created_at || "-" }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentInstrument.updated_at || "-" }}</el-descriptions-item>
            <el-descriptions-item label="型号备注">{{ currentInstrument.model_remark || "-" }}</el-descriptions-item>
          </el-descriptions>

          <el-tabs v-model="detailTab" class="detail-tabs">
            <el-tab-pane label="使用记录" name="usage">
              <el-table v-loading="usageLoading" :data="usageRecords" stripe border>
                <el-table-column prop="work_no" label="作业ID" min-width="150" />
                <el-table-column prop="date" label="使用日期" min-width="120" />
                <el-table-column prop="temperature" label="井温" min-width="100" align="center" />
                <el-table-column prop="delta" label="扣减次数" min-width="100" align="center" />
                <el-table-column prop="before_remain_count" label="使用前剩余" min-width="120" align="center" />
                <el-table-column prop="after_remain_count" label="使用后剩余" min-width="120" align="center" />
                <el-table-column prop="status" label="状态" min-width="110" align="center" />
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="维保记录" name="maintenance">
              <div class="tab-toolbar">
                <el-button type="success" plain @click="openMaintenanceCreate">新增维保记录</el-button>
              </div>
              <el-table v-loading="maintenanceLoading" :data="maintenanceRecords" stripe border>
                <el-table-column prop="maintenance_date" label="维保日期" min-width="120" />
                <el-table-column prop="maintenance_type" label="维保类型" min-width="120" />
                <el-table-column prop="maintainer" label="维保人员" min-width="120" />
                <el-table-column prop="content" label="维保内容" min-width="220" show-overflow-tooltip />
                <el-table-column prop="result" label="维保结果" min-width="120" />
                <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
                <el-table-column label="操作" width="140" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="warning" link @click="openMaintenanceEdit(row)">编辑</el-button>
                    <el-button type="danger" link @click="deleteMaintenanceRecord(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="维保周期配置" name="cycle">
              <div class="cycle-grid">
                <div class="cycle-item">
                  <span>非高温维保周期</span>
                  <strong>{{ currentInstrument.normal_cycle ?? "-" }} 次</strong>
                </div>
                <div class="cycle-item">
                  <span>高温维保周期</span>
                  <strong>{{ currentInstrument.high_cycle ?? "-" }} 次</strong>
                </div>
                <div class="cycle-item">
                  <span>高温换算系数</span>
                  <strong>{{ currentInstrument.coefficient ?? "-" }}</strong>
                </div>
              </div>
              <el-alert
                title="维保周期配置来自仪器型号库。如需调整，请到仪器型号页面编辑该型号。"
                type="info"
                :closable="false"
                show-icon
              />
            </el-tab-pane>

            <el-tab-pane label="维保提醒记录" name="reminder">
              <el-alert
                title="维保提醒现在仅作为记录展示，不再强制提醒或阻断用户操作。"
                type="warning"
                :closable="false"
                show-icon
                class="reminder-note"
              />
              <el-table v-loading="reminderLoading" :data="reminderRecords" stripe border>
                <el-table-column prop="date" label="记录日期" min-width="120" />
                <el-table-column prop="work_no" label="来源作业" min-width="150" />
                <el-table-column prop="used_count" label="使用次数" min-width="100" align="center" />
                <el-table-column prop="remain_count" label="剩余次数" min-width="100" align="center" />
                <el-table-column prop="threshold" label="记录阈值" min-width="100" align="center" />
                <el-table-column prop="status" label="记录状态" min-width="110" align="center">
                  <template #default="{ row }">
                    <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>
    </el-drawer>

    <el-dialog v-model="maintenanceDialogVisible" :title="maintenanceDialogTitle" width="560px" @close="resetMaintenanceForm">
      <el-form :model="maintenanceForm" label-width="110px">
        <el-form-item label="维保类型">
          <el-select v-model="maintenanceForm.maintenance_type" style="width: 100%">
            <el-option label="常规维保" value="常规维保" />
            <el-option label="大修" value="大修" />
            <el-option label="校准" value="校准" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="维保日期">
          <el-date-picker v-model="maintenanceForm.maintenance_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="维保人员">
          <el-input v-model="maintenanceForm.maintainer" placeholder="请输入维保人员" />
        </el-form-item>
        <el-form-item label="维保内容">
          <el-input v-model="maintenanceForm.content" type="textarea" :rows="3" placeholder="请输入维保内容" />
        </el-form-item>
        <el-form-item label="维保结果">
          <el-input v-model="maintenanceForm.result" placeholder="请输入维保结果" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="maintenanceForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMaintenanceRecord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, type Ref } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { usePagination } from "@/hooks/usePagination"
import { getInstrumentModelListApi } from "@/api/instrument-model"
import type { InstrumentModelItem } from "@/api/instrument-model/types"
import {
  createSimInstrumentApi,
  deleteSimInstrumentApi,
  getSimInstrumentDetailApi,
  getSimInstrumentListApi,
  updateSimInstrumentApi
} from "@/api/sim-instrument"
import type { SimInstrumentItem } from "@/api/sim-instrument/types"
import {
  createSimInstrumentMaintenanceRecordApi,
  deleteSimInstrumentMaintenanceRecordApi,
  getSimInstrumentMaintenanceRecordListApi,
  getSimInstrumentMaintenanceReminderListApi,
  getSimInstrumentUsageRecordListApi,
  updateSimInstrumentMaintenanceRecordApi
} from "@/api/sim-maintenance"
import type {
  SimInstrumentMaintenanceRecordItem,
  SimInstrumentMaintenanceReminderItem,
  SimInstrumentUsageRecordItem
} from "@/api/sim-maintenance/types"

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
      ElMessage.error(getErrorMessage(err, "查询失败"))
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

const getErrorMessage = (err: any, fallback: string) => {
  const raw = err?.response?.data
  return raw?.message || raw?.msg || (typeof raw === "string" ? raw : "") || err?.message || fallback
}

const dialogVisible = ref(false)
const dialogTitle = ref("新增仪器")
const dialogMode: Ref<"create" | "edit"> = ref("create")
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
    const req = currentUpdateId.value ? updateSimInstrumentApi(currentUpdateId.value, payload) : createSimInstrumentApi(payload)
    const updatingId = currentUpdateId.value
    req
      .then(() => {
        ElMessage.success("保存成功")
        closeDialog()
        getTableData()
        if (updatingId && currentInstrument.value?.id === updatingId) loadInstrumentDetail(updatingId)
      })
      .catch((err) => {
        ElMessage.error(getErrorMessage(err, "保存失败"))
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
        if (currentInstrument.value?.id === row.id) detailVisible.value = false
        getTableData()
      })
      .catch((err) => {
        ElMessage.error(getErrorMessage(err, "删除失败"))
      })
  })
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailTab = ref("usage")
const currentInstrument = ref<SimInstrumentItem | null>(null)
const usageRecords = ref<SimInstrumentUsageRecordItem[]>([])
const maintenanceRecords = ref<SimInstrumentMaintenanceRecordItem[]>([])
const reminderRecords = ref<SimInstrumentMaintenanceReminderItem[]>([])
const usageLoading = ref(false)
const maintenanceLoading = ref(false)
const reminderLoading = ref(false)

const detailTitle = computed(() => (currentInstrument.value ? `仪器详情：${currentInstrument.value.sn}` : "仪器详情"))

const openDetail = async (row: SimInstrumentItem) => {
  detailVisible.value = true
  detailTab.value = "usage"
  currentInstrument.value = row
  await loadInstrumentDetail(row.id)
  await Promise.all([loadUsageRecords(), loadMaintenanceRecords(), loadReminderRecords()])
}

async function loadInstrumentDetail(id: number) {
  detailLoading.value = true
  try {
    const res = await getSimInstrumentDetailApi(id)
    currentInstrument.value = res.data
  } catch (err) {
    ElMessage.error(getErrorMessage(err, "仪器详情加载失败"))
  } finally {
    detailLoading.value = false
  }
}

async function loadUsageRecords() {
  if (!currentInstrument.value) return
  usageLoading.value = true
  try {
    const res = await getSimInstrumentUsageRecordListApi({
      instrument_id: currentInstrument.value.id,
      currentPage: 1,
      pageSize: 2000
    })
    usageRecords.value = res.data?.list || []
  } catch (err) {
    usageRecords.value = []
    ElMessage.error(getErrorMessage(err, "使用记录加载失败"))
  } finally {
    usageLoading.value = false
  }
}

async function loadMaintenanceRecords() {
  if (!currentInstrument.value) return
  maintenanceLoading.value = true
  try {
    const res = await getSimInstrumentMaintenanceRecordListApi({
      instrument_id: currentInstrument.value.id,
      currentPage: 1,
      pageSize: 2000
    })
    maintenanceRecords.value = res.data?.list || []
  } catch (err) {
    maintenanceRecords.value = []
    ElMessage.error(getErrorMessage(err, "维保记录加载失败"))
  } finally {
    maintenanceLoading.value = false
  }
}

async function loadReminderRecords() {
  if (!currentInstrument.value) return
  reminderLoading.value = true
  try {
    const res = await getSimInstrumentMaintenanceReminderListApi({
      instrument_id: currentInstrument.value.id,
      currentPage: 1,
      pageSize: 2000
    })
    reminderRecords.value = res.data?.list || []
  } catch (err) {
    reminderRecords.value = []
    ElMessage.error(getErrorMessage(err, "维保提醒记录加载失败"))
  } finally {
    reminderLoading.value = false
  }
}

const maintenanceDialogVisible = ref(false)
const maintenanceMode: Ref<"create" | "edit"> = ref("create")
const editingMaintenanceId = ref<number | string | null>(null)
const maintenanceDialogTitle = computed(() => (maintenanceMode.value === "create" ? "新增维保记录" : "编辑维保记录"))
const maintenanceForm = reactive({
  maintenance_type: "常规维保",
  maintenance_date: "",
  maintainer: "",
  content: "",
  result: "",
  remark: ""
})

function resetMaintenanceForm() {
  editingMaintenanceId.value = null
  maintenanceForm.maintenance_type = "常规维保"
  maintenanceForm.maintenance_date = ""
  maintenanceForm.maintainer = ""
  maintenanceForm.content = ""
  maintenanceForm.result = ""
  maintenanceForm.remark = ""
}

function openMaintenanceCreate() {
  if (!currentInstrument.value) return
  maintenanceMode.value = "create"
  resetMaintenanceForm()
  maintenanceForm.maintenance_date = new Date().toISOString().slice(0, 10)
  maintenanceDialogVisible.value = true
}

function openMaintenanceEdit(row: SimInstrumentMaintenanceRecordItem) {
  maintenanceMode.value = "edit"
  editingMaintenanceId.value = row.id
  maintenanceForm.maintenance_type = row.maintenance_type || row.type || "常规维保"
  maintenanceForm.maintenance_date = row.maintenance_date || row.date || ""
  maintenanceForm.maintainer = row.maintainer || row.person || ""
  maintenanceForm.content = row.content || ""
  maintenanceForm.result = row.result || ""
  maintenanceForm.remark = row.remark || ""
  maintenanceDialogVisible.value = true
}

function submitMaintenanceRecord() {
  if (!currentInstrument.value) return
  if (!maintenanceForm.maintenance_date) {
    ElMessage.warning("请选择维保日期")
    return
  }
  const payload = {
    instrument_id: currentInstrument.value.id,
    maintenance_type: maintenanceForm.maintenance_type,
    maintenance_date: maintenanceForm.maintenance_date,
    maintainer: maintenanceForm.maintainer,
    content: maintenanceForm.content,
    result: maintenanceForm.result,
    remark: maintenanceForm.remark
  }
  const req =
    maintenanceMode.value === "edit" && editingMaintenanceId.value
      ? updateSimInstrumentMaintenanceRecordApi(editingMaintenanceId.value, payload)
      : createSimInstrumentMaintenanceRecordApi(payload)
  req
    .then(() => {
      ElMessage.success("维保记录已保存")
      maintenanceDialogVisible.value = false
      resetMaintenanceForm()
      loadMaintenanceRecords()
    })
    .catch((err) => {
      ElMessage.error(getErrorMessage(err, "维保记录保存失败"))
    })
}

function deleteMaintenanceRecord(row: SimInstrumentMaintenanceRecordItem) {
  ElMessageBox.confirm("确定删除这条维保记录吗？", "警告", {
    type: "warning",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger"
  }).then(() => {
    deleteSimInstrumentMaintenanceRecordApi(row.id)
      .then(() => {
        ElMessage.success("维保记录已删除")
        loadMaintenanceRecords()
      })
      .catch((err) => {
        ElMessage.error(getErrorMessage(err, "维保记录删除失败"))
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

.instrument-detail {
  min-height: 360px;
}

.detail-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0 18px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.summary-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.summary-subtitle {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
}

.summary-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-stat {
  min-width: 118px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.summary-stat span {
  display: block;
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.summary-stat strong {
  font-size: 18px;
}

.detail-descriptions {
  margin-top: 16px;
}

.detail-tabs {
  margin-top: 18px;
}

.tab-toolbar {
  margin-bottom: 12px;
}

.cycle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.cycle-item {
  padding: 14px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.cycle-item span {
  display: block;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.cycle-item strong {
  font-size: 18px;
}

.reminder-note {
  margin-bottom: 12px;
}

@media (max-width: 960px) {
  .detail-summary {
    display: block;
  }

  .summary-stats {
    margin-top: 14px;
  }

  .cycle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
