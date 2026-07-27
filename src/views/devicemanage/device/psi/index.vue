<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue"
import { CirclePlus, Delete, Edit, Refresh, Search, View } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import {
  createDeviceInstanceApi,
  deleteDeviceInstanceApi,
  getDeviceInstanceListApi,
  updateDeviceInstanceApi
} from "@/api/device-instance"
import {
  createHostMaintenanceRecordApi,
  createHostUsageRecordApi,
  deleteHostMaintenanceRecordApi,
  deleteHostUsageRecordApi,
  getHostMaintenanceConfigApi,
  getHostMaintenanceRecordListApi,
  getHostMaintenanceReminderListApi,
  getHostUsageRecordListApi,
  updateHostMaintenanceConfigApi,
  updateHostMaintenanceRecordApi,
  updateHostUsageRecordApi
} from "@/api/host-maintenance"
import { getPsiModelDataApi } from "@/api/psimodel"
import type {
  DeviceInstanceData,
  DeviceInstancePayload,
  DeviceInstanceStatus,
  DeviceOnlineStatus
} from "@/api/device-instance/types"
import type {
  HostMaintenanceConfigItem,
  HostMaintenanceRecordItem,
  HostUsageRecordItem
} from "@/api/host-maintenance/types"
import { usePagination } from "@/hooks/usePagination"
import {
  extractHostModelList,
  getHostModelDisplayName,
  getHostModelId,
  normalizeHostModelOptions,
  type HostModelOption
} from "./model-options"
import { getDeviceOnlineStatusOptions, resolveDeviceOnlineStatus } from "./status-options"

interface DeviceInstanceRow {
  id: string | number
  serialNumber: string
  deviceName: string
  modelId: string
  model: string
  status: DeviceInstanceStatus
  onlineStatus: DeviceOnlineStatus
}

type RecordMode = "create" | "edit"

const loading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const detailLoading = ref(false)
const hostModelLoading = ref(false)
const currentUpdateId = ref<string | number>()
const formRef = ref<FormInstance | null>(null)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const statusOptions: Array<{ label: string; value: "" | DeviceInstanceStatus }> = [
  { label: "全部", value: "" },
  { label: "正常", value: "normal" },
  { label: "故障", value: "fault" },
  { label: "维保中", value: "maintenance" },
  { label: "维修中", value: "repair" }
]

const statusMap: Record<DeviceInstanceStatus, { label: string; className: string }> = {
  normal: { label: "正常", className: "status-normal" },
  fault: { label: "故障", className: "status-fault" },
  maintenance: { label: "维保中", className: "status-maintenance" },
  repair: { label: "维修中", className: "status-repair" }
}

const onlineMap: Record<DeviceOnlineStatus, { label: string; className: string }> = {
  standby: { label: "待机", className: "standby" },
  testing: { label: "测试中", className: "testing" },
  offline: { label: "离线", className: "offline" },
  abnormal: { label: "异常", className: "abnormal" },
  paused: { label: "暂停", className: "paused" },
  finished: { label: "完成", className: "finished" },
  unknown: { label: "未知", className: "unknown" }
}

const onlineStatusOptions = computed(() => getDeviceOnlineStatusOptions(formData.status))

const searchData = reactive({
  serialNumber: "",
  status: "" as "" | DeviceInstanceStatus
})

const formData = reactive<DeviceInstancePayload>({
  serialNumber: "",
  deviceName: "",
  model: "",
  status: "normal",
  onlineStatus: "standby"
})

const detailData = ref<DeviceInstanceRow | null>(null)
const tableData = ref<DeviceInstanceRow[]>([])
const hostModelOptions = ref<HostModelOption[]>([])
const detailTab = ref("usage")
const usageRecords = ref<HostUsageRecordItem[]>([])
const usageDateRange = ref<[string, string] | null>(null)
const maintenanceRecords = ref<HostMaintenanceRecordItem[]>([])
const reminderRecords = ref<HostMaintenanceConfigItem[]>([])
const hostConfig = ref<HostMaintenanceConfigItem | null>(null)
const usageLoading = ref(false)
const maintenanceLoading = ref(false)
const configLoading = ref(false)
const reminderLoading = ref(false)
const usageDialogVisible = ref(false)
const maintenanceDialogVisible = ref(false)
const configDialogVisible = ref(false)
const usageMode = ref<RecordMode>("create")
const maintenanceMode = ref<RecordMode>("create")
const editingUsageId = ref<string | number | null>(null)
const editingMaintenanceId = ref<string | number | null>(null)
const usageForm = reactive({
  work_order_no: "",
  usage_date: "",
  duration_hours: 0,
  cumulative_hours: undefined as number | undefined,
  completed_task: "",
  operator: "",
  status: "正常",
  remark: ""
})
const maintenanceForm = reactive({
  maintenance_date: "",
  maintenance_type: "常规维保",
  maintainer: "",
  content: "",
  result: "合格",
  remark: ""
})
const configForm = reactive({
  cycle_hours: 500,
  warning_threshold_hours: 50,
  last_maintenance_date: "",
  next_maintenance_date: ""
})
const stats = reactive({
  total: 0,
  normal: 0,
  maintenance: 0,
  repair: 0,
  fault: 0
})

const detailTitle = computed(() => (detailData.value ? `主机详情：${detailData.value.serialNumber}` : "主机详情"))
const usageDialogTitle = computed(() => (usageMode.value === "create" ? "新增使用记录" : "编辑使用记录"))
const maintenanceDialogTitle = computed(() => (maintenanceMode.value === "create" ? "新增维保记录" : "编辑维保记录"))
const totalUsageHours = computed(() => Number(hostConfig.value?.total_hours || 0))

const formRules: FormRules = {
  serialNumber: [{ required: true, message: "请输入SN号", trigger: "blur" }],
  deviceName: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  model: [{ required: true, message: "请选择型号", trigger: "change" }],
  status: [{ required: true, message: "请选择设备状态", trigger: "change" }],
  onlineStatus: [{ required: true, message: "请选择在线状态", trigger: "change" }]
}

const statCards = computed(() => [
  { title: "设备总数", value: stats.total, desc: "全部设备实例", className: "total" },
  { title: "运行正常", value: stats.normal, desc: "状态为正常的设备", className: "normal" },
  { title: "维保/维修", value: stats.maintenance + stats.repair, desc: "维保中或维修中", className: "service" },
  { title: "故障设备", value: stats.fault, desc: "需要处理的故障设备", className: "fault" }
])

const normalizeStatus = (value: unknown): DeviceInstanceStatus => {
  if (value === 0 || value === "0" || value === "normal" || value === "正常") return "normal"
  if (value === 1 || value === "1" || value === "maintenance" || value === "维保中" || value === "临检") {
    return "maintenance"
  }
  if (value === 3 || value === "3" || value === "repair" || value === "维修中") return "repair"
  if (value === 2 || value === "2" || value === "fault" || value === "故障") return "fault"
  return "normal"
}

const normalizeOnlineStatus = (value: unknown): DeviceOnlineStatus => {
  if (value === true || value === 1 || value === "1" || value === "standby" || value === "待机" || value === "在线") {
    return "standby"
  }
  if (value === "testing" || value === "测试中") return "testing"
  if (value === false || value === 0 || value === "0" || value === "offline" || value === "离线") return "offline"
  if (value === "abnormal" || value === "异常") return "abnormal"
  if (value === "paused" || value === "暂停") return "paused"
  if (value === "finished" || value === "完成") return "finished"
  return "unknown"
}

const normalizeRow = (row: DeviceInstanceData): DeviceInstanceRow => ({
  id: row.id ?? row.psi_id ?? row.device_id ?? row.deviceId ?? "",
  serialNumber: row.serialNumber ?? row.serial_number ?? row.psi_serialnumber ?? "",
  deviceName: row.deviceName ?? row.device_name ?? row.psi_name ?? "",
  modelId: getHostModelId(row),
  model: getHostModelDisplayName(row),
  status: normalizeStatus(row.status ?? row.deviceStatus ?? row.device_status ?? row.psi_status),
  onlineStatus: normalizeOnlineStatus(
    row.onlineStatus ?? row.online_status ?? row.onlineStatusText ?? row.online_status_text
  )
})

const normalizeListData = (data: any) => {
  const payload = data?.data ?? data ?? {}
  const list = Array.isArray(payload)
    ? payload
    : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []
  const total = Number(payload.total ?? payload.count ?? list.length ?? 0)
  const summary = payload.stats ?? payload.summary ?? payload.statistics ?? {}
  return {
    list: list.map(normalizeRow),
    total,
    stats: summary
  }
}

const refreshStats = (summary: any = {}) => {
  const rowStats = {
    total: paginationData.total || tableData.value.length,
    normal: tableData.value.filter((item) => item.status === "normal").length,
    maintenance: tableData.value.filter((item) => item.status === "maintenance").length,
    repair: tableData.value.filter((item) => item.status === "repair").length,
    fault: tableData.value.filter((item) => item.status === "fault").length
  }
  stats.total = Number(summary.total ?? rowStats.total)
  stats.normal = Number(summary.normal ?? rowStats.normal)
  stats.maintenance = Number(summary.maintenance ?? rowStats.maintenance)
  stats.repair = Number(summary.repair ?? rowStats.repair)
  stats.fault = Number(summary.fault ?? rowStats.fault)
}

const loadHostModelOptions = async () => {
  if (hostModelOptions.value.length) return
  hostModelLoading.value = true
  try {
    const res = await getPsiModelDataApi({
      currentPage: 1,
      size: 2000
    })
    hostModelOptions.value = normalizeHostModelOptions(extractHostModelList(res))
  } catch {
    hostModelOptions.value = []
  } finally {
    hostModelLoading.value = false
  }
}

const ensureHostModelOptions = () => {
  if (hostModelOptions.value.length || hostModelLoading.value) return
  void loadHostModelOptions()
}

const handleModelDropdownVisible = (visible: boolean) => {
  if (visible) ensureHostModelOptions()
}

const resolveFormModelValue = (row: DeviceInstanceRow) =>
  row.modelId || hostModelOptions.value.find((item) => item.name === row.model)?.id || row.model

const getTableData = async () => {
  loading.value = true
  try {
    const res = await getDeviceInstanceListApi({
      currentPage: paginationData.currentPage,
      size: paginationData.pageSize,
      serialNumber: searchData.serialNumber || undefined,
      status: searchData.status || undefined
    })
    const data = normalizeListData(res)
    tableData.value = data.list
    paginationData.total = data.total
    refreshStats(data.stats)
  } catch {
    tableData.value = []
    paginationData.total = 0
    refreshStats()
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}

const resetSearch = () => {
  searchData.serialNumber = ""
  searchData.status = ""
  handleSearch()
}

const resetForm = () => {
  currentUpdateId.value = undefined
  formData.id = undefined
  formData.serialNumber = ""
  formData.deviceName = ""
  formData.model = ""
  formData.status = "normal"
  formData.onlineStatus = "standby"
  formRef.value?.clearValidate()
}

const openCreateDialog = () => {
  resetForm()
  ensureHostModelOptions()
  dialogVisible.value = true
}

const openEditDialog = async (row: DeviceInstanceRow) => {
  await loadHostModelOptions()
  currentUpdateId.value = row.id
  formData.id = row.id
  formData.serialNumber = row.serialNumber
  formData.deviceName = row.deviceName
  formData.model = resolveFormModelValue(row)
  formData.status = row.status
  formData.onlineStatus = row.onlineStatus
  dialogVisible.value = true
}

const currentHostId = () => detailData.value?.id

const todayString = () => new Date().toISOString().slice(0, 10)

const extractList = <T,>(response: any): T[] => {
  const payload = response?.data ?? response ?? {}
  const list = Array.isArray(payload)
    ? payload
    : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []
  return Array.isArray(list) ? list : []
}

const extractItem = <T,>(response: any): T | null => {
  const payload = response?.data ?? response ?? null
  if (!payload) return null
  return (payload.data ?? payload) as T
}

const resetUsageForm = () => {
  editingUsageId.value = null
  usageForm.work_order_no = ""
  usageForm.usage_date = todayString()
  usageForm.duration_hours = 0
  usageForm.cumulative_hours = undefined
  usageForm.completed_task = ""
  usageForm.operator = ""
  usageForm.status = "正常"
  usageForm.remark = ""
}

const resetMaintenanceForm = () => {
  editingMaintenanceId.value = null
  maintenanceForm.maintenance_date = todayString()
  maintenanceForm.maintenance_type = "常规维保"
  maintenanceForm.maintainer = ""
  maintenanceForm.content = ""
  maintenanceForm.result = "合格"
  maintenanceForm.remark = ""
}

const loadUsageRecords = async () => {
  const hostId = currentHostId()
  if (!hostId) {
    usageRecords.value = []
    return
  }
  usageLoading.value = true
  try {
    const res = await getHostUsageRecordListApi({
      host_id: hostId,
      usage_date_start: usageDateRange.value?.[0] || undefined,
      usage_date_end: usageDateRange.value?.[1] || undefined,
      currentPage: 1,
      pageSize: 2000
    })
    usageRecords.value = extractList<HostUsageRecordItem>(res)
  } finally {
    usageLoading.value = false
  }
}

const clearUsageDateRange = () => {
  usageDateRange.value = null
  void loadUsageRecords()
}

const loadMaintenanceRecords = async () => {
  const hostId = currentHostId()
  if (!hostId) {
    maintenanceRecords.value = []
    return
  }
  maintenanceLoading.value = true
  try {
    const res = await getHostMaintenanceRecordListApi({ host_id: hostId, currentPage: 1, pageSize: 2000 })
    maintenanceRecords.value = extractList<HostMaintenanceRecordItem>(res)
  } finally {
    maintenanceLoading.value = false
  }
}

const loadHostConfig = async () => {
  const hostId = currentHostId()
  if (!hostId) {
    hostConfig.value = null
    return
  }
  configLoading.value = true
  try {
    const res = await getHostMaintenanceConfigApi({ host_id: hostId })
    hostConfig.value = extractItem<HostMaintenanceConfigItem>(res)
  } finally {
    configLoading.value = false
  }
}

const loadReminderRecords = async () => {
  const hostId = currentHostId()
  if (!hostId) {
    reminderRecords.value = []
    return
  }
  reminderLoading.value = true
  try {
    const res = await getHostMaintenanceReminderListApi({ host_id: hostId, currentPage: 1, pageSize: 20 })
    reminderRecords.value = extractList<HostMaintenanceConfigItem>(res)
  } finally {
    reminderLoading.value = false
  }
}

const loadHostMaintenanceData = async () => {
  detailLoading.value = true
  try {
    await Promise.all([loadUsageRecords(), loadMaintenanceRecords(), loadHostConfig(), loadReminderRecords()])
  } catch {
    // 请求拦截器会展示后端错误信息
  } finally {
    detailLoading.value = false
  }
}

const openDetailDialog = async (row: DeviceInstanceRow) => {
  detailData.value = row
  detailTab.value = "usage"
  usageDateRange.value = null
  detailVisible.value = true
  await loadHostMaintenanceData()
}

const openUsageCreate = () => {
  usageMode.value = "create"
  resetUsageForm()
  usageDialogVisible.value = true
}

const openUsageEdit = (row: HostUsageRecordItem) => {
  usageMode.value = "edit"
  editingUsageId.value = row.id
  usageForm.work_order_no = row.work_order_no || ""
  usageForm.usage_date = row.usage_date || row.date || todayString()
  usageForm.duration_hours = Number(row.duration_hours || 0)
  usageForm.cumulative_hours = row.cumulative_hours == null ? undefined : Number(row.cumulative_hours)
  usageForm.completed_task = row.completed_task || ""
  usageForm.operator = row.operator || ""
  usageForm.status = row.status || "正常"
  usageForm.remark = row.remark || ""
  usageDialogVisible.value = true
}

const submitUsageRecord = async () => {
  const hostId = currentHostId()
  if (!hostId) return
  if (!usageForm.usage_date) {
    ElMessage.warning("请选择使用日期")
    return
  }
  if (Number(usageForm.duration_hours) <= 0) {
    ElMessage.warning("使用时长必须大于0")
    return
  }
  const payload = {
    host_id: hostId,
    work_order_no: usageForm.work_order_no,
    usage_date: usageForm.usage_date,
    duration_hours: Number(usageForm.duration_hours),
    cumulative_hours: usageForm.cumulative_hours ?? null,
    completed_task: usageForm.completed_task,
    operator: usageForm.operator,
    status: usageForm.status,
    remark: usageForm.remark
  }
  if (usageMode.value === "edit" && editingUsageId.value !== null) {
    await updateHostUsageRecordApi(editingUsageId.value, payload)
  } else {
    await createHostUsageRecordApi(payload)
  }
  ElMessage.success("使用记录已保存")
  usageDialogVisible.value = false
  await loadHostMaintenanceData()
}

const deleteUsageRecord = async (row: HostUsageRecordItem) => {
  try {
    await ElMessageBox.confirm(`确认删除使用记录“${row.work_order_no || row.usage_date || row.id}”？`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    })
    await deleteHostUsageRecordApi(row.id)
    ElMessage.success("使用记录已删除")
    await loadHostMaintenanceData()
  } catch {
    // 用户取消或接口报错时无需额外处理
  }
}

const openMaintenanceCreate = () => {
  maintenanceMode.value = "create"
  resetMaintenanceForm()
  maintenanceDialogVisible.value = true
}

const openMaintenanceEdit = (row: HostMaintenanceRecordItem) => {
  maintenanceMode.value = "edit"
  editingMaintenanceId.value = row.id
  maintenanceForm.maintenance_date = row.maintenance_date || row.date || todayString()
  maintenanceForm.maintenance_type = row.maintenance_type || row.type || "常规维保"
  maintenanceForm.maintainer = row.maintainer || row.person || ""
  maintenanceForm.content = row.content || ""
  maintenanceForm.result = row.result || "合格"
  maintenanceForm.remark = row.remark || ""
  maintenanceDialogVisible.value = true
}

const submitMaintenanceRecord = async () => {
  const hostId = currentHostId()
  if (!hostId) return
  if (!maintenanceForm.maintenance_date) {
    ElMessage.warning("请选择维保日期")
    return
  }
  const payload = {
    host_id: hostId,
    maintenance_date: maintenanceForm.maintenance_date,
    maintenance_type: maintenanceForm.maintenance_type,
    maintainer: maintenanceForm.maintainer,
    content: maintenanceForm.content,
    result: maintenanceForm.result,
    remark: maintenanceForm.remark
  }
  if (maintenanceMode.value === "edit" && editingMaintenanceId.value !== null) {
    await updateHostMaintenanceRecordApi(editingMaintenanceId.value, payload)
  } else {
    await createHostMaintenanceRecordApi(payload)
  }
  ElMessage.success("维保记录已保存")
  maintenanceDialogVisible.value = false
  await loadHostMaintenanceData()
}

const deleteMaintenanceRecord = async (row: HostMaintenanceRecordItem) => {
  try {
    await ElMessageBox.confirm(`确认删除维保记录“${row.maintenance_date || row.date || row.id}”？`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    })
    await deleteHostMaintenanceRecordApi(row.id)
    ElMessage.success("维保记录已删除")
    await loadHostMaintenanceData()
  } catch {
    // 用户取消或接口报错时无需额外处理
  }
}

const openConfigEdit = () => {
  configForm.cycle_hours = Number(hostConfig.value?.cycle_hours || 500)
  configForm.warning_threshold_hours = Number(hostConfig.value?.warning_threshold_hours || 50)
  configForm.last_maintenance_date = hostConfig.value?.last_maintenance_date || ""
  configForm.next_maintenance_date = hostConfig.value?.next_maintenance_date || ""
  configDialogVisible.value = true
}

const submitConfig = async () => {
  const hostId = currentHostId()
  if (!hostId) return
  if (Number(configForm.cycle_hours) <= 0) {
    ElMessage.warning("维保周期必须大于0")
    return
  }
  await updateHostMaintenanceConfigApi({
    host_id: hostId,
    cycle_hours: Number(configForm.cycle_hours),
    warning_threshold_hours: Number(configForm.warning_threshold_hours || 0),
    last_maintenance_date: configForm.last_maintenance_date || null,
    next_maintenance_date: configForm.next_maintenance_date || null
  })
  ElMessage.success("维保周期已保存")
  configDialogVisible.value = false
  await Promise.all([loadHostConfig(), loadReminderRecords()])
}

const reminderTagType = (status: string) => {
  if (["已过期", "超期", "逾期"].includes(status)) return "danger"
  if (["即将维保", "预警"].includes(status)) return "warning"
  return "success"
}

const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      if (currentUpdateId.value === undefined) {
        await createDeviceInstanceApi(formData)
        ElMessage.success("新增成功")
      } else {
        await updateDeviceInstanceApi({ ...formData, id: currentUpdateId.value })
        ElMessage.success("编辑成功")
      }
      dialogVisible.value = false
      resetForm()
      getTableData()
    } catch {
      // 请求拦截器会展示后端错误信息
    }
  })
}

const handleDelete = async (row: DeviceInstanceRow) => {
  try {
    await ElMessageBox.confirm(`确认删除设备“${row.deviceName || row.serialNumber}”？`, "删除确认", {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    })
    await deleteDeviceInstanceApi(row.id)
    ElMessage.success("删除成功")
    getTableData()
  } catch {
    // 用户取消或接口报错时无需额外处理
  }
}

watch(
  () => formData.status,
  () => {
    formData.onlineStatus = resolveDeviceOnlineStatus(formData.status, formData.onlineStatus)
  }
)

watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container device-instance-page">
    <div class="stat-grid">
      <div v-for="item in statCards" :key="item.title" class="stat-card">
        <div class="stat-title">{{ item.title }}</div>
        <div class="stat-value" :class="item.className">{{ item.value }}</div>
        <div class="stat-desc">{{ item.desc }}</div>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form class="filter-form" :model="searchData" @submit.prevent>
        <el-form-item label="SN号">
          <el-input
            v-model.trim="searchData.serialNumber"
            :prefix-icon="Search"
            clearable
            placeholder="请输入SN号"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="设备状态" class="status-filter">
          <el-segmented v-model="searchData.status" :options="statusOptions" @change="handleSearch" />
        </el-form-item>
        <div class="filter-actions">
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          <el-button v-permission="['3']" type="primary" :icon="CirclePlus" @click="openCreateDialog">
            新增设备
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never" class="table-card">
      <div class="table-header">
        <div class="table-title">主机管理</div>
        <div class="table-total">共 {{ paginationData.total }} 条</div>
      </div>
      <el-table :data="tableData" row-key="id" class="device-table" height="calc(100vh - 390px)">
        <el-table-column prop="serialNumber" label="SN号" min-width="132" show-overflow-tooltip />
        <el-table-column prop="deviceName" label="设备名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="model" label="型号" min-width="118" show-overflow-tooltip />
        <el-table-column label="设备状态" min-width="104">
          <template #default="{ row }">
            <span class="pill-tag" :class="statusMap[row.status].className">{{ statusMap[row.status].label }}</span>
          </template>
        </el-table-column>
        <el-table-column label="在线状态" min-width="96">
          <template #default="{ row }">
            <span class="online-tag" :class="onlineMap[row.onlineStatus].className">
              {{ onlineMap[row.onlineStatus].label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="170" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="openDetailDialog(row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :current-page="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增设备' : '编辑设备'"
      width="520px"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="96px">
        <el-form-item label="SN号" prop="serialNumber">
          <el-input v-model.trim="formData.serialNumber" placeholder="请输入SN号" />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model.trim="formData.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-select
            v-model="formData.model"
            clearable
            filterable
            :loading="hostModelLoading"
            placeholder="请选择型号"
            style="width: 100%"
            @visible-change="handleModelDropdownVisible"
          >
            <el-option v-for="item in hostModelOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择设备状态" style="width: 100%">
            <el-option
              v-for="item in statusOptions.slice(1)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="在线状态" prop="onlineStatus">
          <el-radio-group v-model="formData.onlineStatus">
            <el-radio-button v-for="item in onlineStatusOptions" :key="item" :label="item">
              {{ onlineMap[item].label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" :title="detailTitle" size="76%" destroy-on-close>
      <div v-loading="detailLoading" class="host-detail">
        <template v-if="detailData">
          <div class="detail-summary">
            <div class="summary-main">
              <div class="summary-title">{{ detailData.deviceName || detailData.serialNumber }}</div>
              <div class="summary-subtitle">
                <span>{{ detailData.serialNumber }}</span>
                <span>{{ detailData.model || "未填写型号" }}</span>
              </div>
            </div>
            <div class="summary-stats">
              <div class="summary-stat">
                <span class="stat-label">累计使用</span>
                <strong>{{ totalUsageHours }}</strong>
                <span>h</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">维保周期</span>
                <strong>{{ hostConfig ? hostConfig.cycle_hours : "-" }}</strong>
                <span>h</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">剩余时长</span>
                <strong>{{ hostConfig ? hostConfig.remaining_hours : "-" }}</strong>
                <span>h</span>
              </div>
            </div>
          </div>

          <el-descriptions :column="3" border class="detail-descriptions">
            <el-descriptions-item label="SN号">{{ detailData.serialNumber }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ detailData.deviceName }}</el-descriptions-item>
            <el-descriptions-item label="型号">{{ detailData.model }}</el-descriptions-item>
            <el-descriptions-item label="设备状态">
              <span class="pill-tag" :class="statusMap[detailData.status].className">
                {{ statusMap[detailData.status].label }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="在线状态">
              <span class="online-tag" :class="onlineMap[detailData.onlineStatus].className">
                {{ onlineMap[detailData.onlineStatus].label }}
              </span>
            </el-descriptions-item>
          </el-descriptions>

          <el-tabs v-model="detailTab" class="detail-tabs">
            <el-tab-pane label="使用记录" name="usage">
              <div class="tab-toolbar">
                <div>
                  <div class="tab-title">主机使用记录</div>
                  <div class="tab-subtitle">记录主机关联工单、运转小时、完成任务和操作者</div>
                </div>
                <div class="usage-toolbar-actions">
                  <el-date-picker
                    v-model="usageDateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="YYYY-MM-DD"
                    unlink-panels
                    class="usage-date-range"
                  />
                  <el-button :loading="usageLoading" @click="loadUsageRecords">查询</el-button>
                  <el-button :disabled="!usageDateRange?.length" @click="clearUsageDateRange">清空</el-button>
                  <el-button type="primary" :icon="CirclePlus" @click="openUsageCreate">新增使用记录</el-button>
                </div>
              </div>
              <el-table v-loading="usageLoading" :data="usageRecords" height="360" border>
                <el-table-column prop="host_sn" label="主机SN" min-width="140" show-overflow-tooltip />
                <el-table-column prop="work_order_no" label="工单号" min-width="150" show-overflow-tooltip />
                <el-table-column prop="usage_date" label="使用日期" width="120" />
                <el-table-column prop="duration_hours" label="使用时长(h)" width="120" />
                <el-table-column prop="cumulative_hours" label="累计运转小时(h)" width="140" />
                <el-table-column prop="completed_task" label="主要完成任务" min-width="180" show-overflow-tooltip />
                <el-table-column prop="operator" label="操作者" width="110" show-overflow-tooltip />
                <el-table-column prop="status" label="状态" width="110" />
                <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
                <el-table-column label="操作" width="136" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" :icon="Edit" @click="openUsageEdit(row)">编辑</el-button>
                    <el-button link type="danger" :icon="Delete" @click="deleteUsageRecord(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="维保记录" name="maintenance">
              <div class="tab-toolbar">
                <div>
                  <div class="tab-title">主机维保记录</div>
                  <div class="tab-subtitle">记录维保日期、类型、人员、内容和结果</div>
                </div>
                <el-button type="primary" :icon="CirclePlus" @click="openMaintenanceCreate">新增维保记录</el-button>
              </div>
              <el-table v-loading="maintenanceLoading" :data="maintenanceRecords" height="360" border>
                <el-table-column prop="host_sn" label="主机SN" min-width="140" show-overflow-tooltip />
                <el-table-column prop="maintenance_date" label="维保日期" width="120" />
                <el-table-column prop="maintenance_type" label="维保类型" width="120" />
                <el-table-column prop="maintainer" label="维保人" width="120" />
                <el-table-column prop="content" label="维保内容" min-width="180" show-overflow-tooltip />
                <el-table-column prop="result" label="结果" width="100" />
                <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
                <el-table-column label="操作" width="136" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" :icon="Edit" @click="openMaintenanceEdit(row)">编辑</el-button>
                    <el-button link type="danger" :icon="Delete" @click="deleteMaintenanceRecord(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="维保周期配置" name="cycle">
              <div class="tab-toolbar">
                <div>
                  <div class="tab-title">维保周期配置</div>
                  <div class="tab-subtitle">按主机累计使用时长计算维保提醒</div>
                </div>
                <el-button type="primary" plain :icon="Edit" @click="openConfigEdit">编辑周期</el-button>
              </div>
              <div v-loading="configLoading" class="cycle-grid">
                <div class="cycle-item">
                  <span>主机SN</span>
                  <strong>{{ hostConfig ? hostConfig.host_sn : detailData.serialNumber }}</strong>
                </div>
                <div class="cycle-item">
                  <span>维保周期</span>
                  <strong>{{ hostConfig ? hostConfig.cycle_hours : "-" }} h</strong>
                </div>
                <div class="cycle-item">
                  <span>预警阈值</span>
                  <strong>{{ hostConfig ? hostConfig.warning_threshold_hours : "-" }} h</strong>
                </div>
                <div class="cycle-item">
                  <span>累计使用</span>
                  <strong>{{ hostConfig ? hostConfig.total_hours : totalUsageHours }} h</strong>
                </div>
                <div class="cycle-item">
                  <span>剩余时长</span>
                  <strong>{{ hostConfig ? hostConfig.remaining_hours : "-" }} h</strong>
                </div>
                <div class="cycle-item">
                  <span>提醒状态</span>
                  <el-tag :type="reminderTagType(hostConfig ? hostConfig.status : '')">
                    {{ hostConfig ? hostConfig.status : "未配置" }}
                  </el-tag>
                </div>
                <div class="cycle-item">
                  <span>上次维保日期</span>
                  <strong>{{ hostConfig ? hostConfig.last_maintenance_date || "-" : "-" }}</strong>
                </div>
                <div class="cycle-item">
                  <span>下次维保日期</span>
                  <strong>{{ hostConfig ? hostConfig.next_maintenance_date || "-" : "-" }}</strong>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="维保提醒" name="reminder">
              <div class="tab-toolbar">
                <div>
                  <div class="tab-title">维保提醒</div>
                  <div class="tab-subtitle">展示当前主机的周期状态和提醒结果</div>
                </div>
                <el-button :icon="Refresh" @click="loadReminderRecords">刷新提醒</el-button>
              </div>
              <el-table v-loading="reminderLoading" :data="reminderRecords" height="360" border>
                <el-table-column prop="host_sn" label="主机SN" min-width="150" show-overflow-tooltip />
                <el-table-column prop="host_name" label="主机名称" min-width="150" show-overflow-tooltip />
                <el-table-column prop="total_hours" label="累计使用(h)" width="120" />
                <el-table-column prop="cycle_hours" label="周期(h)" width="100" />
                <el-table-column prop="remaining_hours" label="剩余(h)" width="100" />
                <el-table-column label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="reminderTagType(row.status)">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="next_maintenance_date" label="下次维保日期" width="130" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>
    </el-drawer>

    <el-dialog v-model="usageDialogVisible" :title="usageDialogTitle" width="560px" @closed="resetUsageForm">
      <el-form :model="usageForm" label-width="106px">
        <el-form-item label="工单号">
          <el-input v-model.trim="usageForm.work_order_no" placeholder="请输入关联工单号" />
        </el-form-item>
        <el-form-item label="使用日期" required>
          <el-date-picker v-model="usageForm.usage_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="使用时长(h)" required>
          <el-input-number v-model="usageForm.duration_hours" :min="0" :precision="1" :step="0.5" style="width: 100%" />
        </el-form-item>
        <el-form-item label="累计小时(h)">
          <el-input-number
            v-model="usageForm.cumulative_hours"
            :min="0"
            :precision="1"
            :step="0.5"
            style="width: 100%"
            placeholder="请输入累计运转小时"
          />
        </el-form-item>
        <el-form-item label="完成任务">
          <el-input
            v-model.trim="usageForm.completed_task"
            type="textarea"
            :rows="3"
            placeholder="请输入主要完成任务"
          />
        </el-form-item>
        <el-form-item label="操作者">
          <el-input v-model.trim="usageForm.operator" placeholder="请输入操作者" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="usageForm.status" style="width: 100%">
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="usageForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="usageDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUsageRecord">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="maintenanceDialogVisible"
      :title="maintenanceDialogTitle"
      width="620px"
      @closed="resetMaintenanceForm"
    >
      <el-form :model="maintenanceForm" label-width="106px">
        <el-form-item label="维保日期" required>
          <el-date-picker
            v-model="maintenanceForm.maintenance_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="维保类型">
          <el-select v-model="maintenanceForm.maintenance_type" allow-create filterable style="width: 100%">
            <el-option label="常规维保" value="常规维保" />
            <el-option label="故障检修" value="故障检修" />
            <el-option label="周期保养" value="周期保养" />
          </el-select>
        </el-form-item>
        <el-form-item label="维保人">
          <el-input v-model.trim="maintenanceForm.maintainer" placeholder="请输入维保人" />
        </el-form-item>
        <el-form-item label="维保内容">
          <el-input v-model.trim="maintenanceForm.content" type="textarea" :rows="3" placeholder="请输入维保内容" />
        </el-form-item>
        <el-form-item label="维保结果">
          <el-select v-model="maintenanceForm.result" style="width: 100%">
            <el-option label="合格" value="合格" />
            <el-option label="需复检" value="需复检" />
            <el-option label="不合格" value="不合格" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model.trim="maintenanceForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="maintenanceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitMaintenanceRecord">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="configDialogVisible" title="编辑维保周期" width="560px">
      <el-form :model="configForm" label-width="120px">
        <el-form-item label="维保周期(h)" required>
          <el-input-number v-model="configForm.cycle_hours" :min="1" :step="50" style="width: 100%" />
        </el-form-item>
        <el-form-item label="预警阈值(h)">
          <el-input-number v-model="configForm.warning_threshold_hours" :min="0" :step="10" style="width: 100%" />
        </el-form-item>
        <el-form-item label="上次维保日期">
          <el-date-picker
            v-model="configForm.last_maintenance_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="下次维保日期">
          <el-date-picker
            v-model="configForm.next_maintenance_date"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitConfig">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.device-instance-page {
  --page-gap: 14px;
  --border-color: #e8edf3;
  background: #f6f8fb;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--page-gap);
  margin-bottom: var(--page-gap);
}

.stat-card {
  min-height: 108px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.stat-title {
  color: #5d6675;
  font-size: 14px;
  line-height: 20px;
}

.stat-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  line-height: 34px;
}

.stat-value.total {
  color: #2563eb;
}

.stat-value.normal {
  color: #16a34a;
}

.stat-value.service {
  color: #d97706;
}

.stat-value.fault {
  color: #dc2626;
}

.stat-desc {
  margin-top: 8px;
  color: #8b95a5;
  font-size: 12px;
  line-height: 18px;
}

.filter-card,
.table-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.filter-card {
  margin-bottom: var(--page-gap);
}

.filter-card :deep(.el-card__body) {
  padding: 14px 16px;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.filter-form :deep(.el-form-item) {
  margin: 0;
}

.filter-form :deep(.el-form-item__label) {
  color: #4b5563;
  font-weight: 500;
}

.filter-form :deep(.el-input),
.filter-form :deep(.el-select) {
  width: 190px;
}

.status-filter {
  flex: 1;
  min-width: 360px;
}

.status-filter :deep(.el-segmented) {
  --el-segmented-item-selected-color: #1d4ed8;
  --el-segmented-item-selected-bg-color: #fff;
  padding: 3px;
  background: #f1f5f9;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 18px;
  border-bottom: 1px solid var(--border-color);
}

.table-title {
  color: #111827;
  font-size: 16px;
  font-weight: 700;
}

.table-total {
  color: #6b7280;
  font-size: 13px;
}

.device-table {
  width: 100%;
}

.device-table :deep(.el-table__header th) {
  height: 42px;
  background: #f8fafc;
  color: #4b5563;
  font-weight: 600;
}

.device-table :deep(.el-table__row) {
  height: 48px;
}

.device-table :deep(.el-table__cell) {
  padding: 7px 0;
}

.pill-tag,
.online-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 58px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 24px;
}

.status-normal {
  color: #15803d;
  background: #dcfce7;
}

.status-fault {
  color: #b91c1c;
  background: #fee2e2;
}

.status-maintenance {
  color: #b45309;
  background: #fef3c7;
}

.status-repair {
  color: #7c3aed;
  background: #ede9fe;
}

.online-tag.standby {
  color: #1d4ed8;
  background: #dbeafe;
}

.online-tag.testing {
  color: #047857;
  background: #d1fae5;
}

.online-tag.offline {
  color: #64748b;
  background: #e2e8f0;
}

.online-tag.abnormal {
  color: #b91c1c;
  background: #fee2e2;
}

.online-tag.paused {
  color: #b45309;
  background: #fef3c7;
}

.online-tag.finished {
  color: #0f766e;
  background: #ccfbf1;
}

.online-tag.unknown {
  color: #6b7280;
  background: #f3f4f6;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 14px 18px 16px;
  border-top: 1px solid var(--border-color);
}

.host-detail {
  min-height: 100%;
  color: #1f2937;
}

.host-detail :deep(.el-drawer__body) {
  padding: 0;
}

.detail-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.summary-main {
  min-width: 0;
}

.summary-title {
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
}

.summary-subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 6px;
  color: #6b7280;
  font-size: 13px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(96px, 1fr));
  gap: 10px;
  min-width: 330px;
}

.summary-stat {
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-align: center;
}

.summary-stat .stat-label {
  display: block;
  margin-bottom: 5px;
  color: #6b7280;
  font-size: 12px;
}

.summary-stat strong {
  margin-right: 3px;
  color: #2563eb;
  font-size: 20px;
  line-height: 24px;
}

.detail-descriptions {
  margin-top: 14px;
}

.detail-tabs {
  margin-top: 14px;
  padding: 0 2px;
}

.detail-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}

.detail-tabs :deep(.el-tabs__item) {
  height: 42px;
  font-size: 15px;
  font-weight: 600;
}

.tab-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.tab-title {
  color: #111827;
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
}

.tab-subtitle {
  margin-top: 2px;
  color: #8b95a5;
  font-size: 12px;
  line-height: 18px;
}

.usage-toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.usage-date-range {
  width: 270px;
}

.cycle-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.cycle-item {
  min-height: 86px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.cycle-item span {
  display: block;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 13px;
}

.cycle-item strong {
  color: #111827;
  font-size: 18px;
  line-height: 24px;
}

@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-form {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .status-filter {
    min-width: 320px;
  }

  .detail-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-stats {
    width: 100%;
    min-width: 0;
  }

  .cycle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .filter-form,
  .filter-actions {
    width: 100%;
  }

  .filter-form :deep(.el-input),
  .filter-form :deep(.el-select),
  .status-filter {
    width: 100%;
    min-width: 0;
  }

  .filter-actions {
    justify-content: flex-end;
  }

  .summary-stats,
  .cycle-grid {
    grid-template-columns: 1fr;
  }

  .tab-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .usage-toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .usage-date-range {
    width: min(100%, 320px);
  }
}
</style>
