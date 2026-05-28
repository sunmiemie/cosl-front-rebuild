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
import type {
  DeviceInstanceData,
  DeviceInstancePayload,
  DeviceInstanceStatus,
  DeviceOnlineStatus
} from "@/api/device-instance/types"
import { usePagination } from "@/hooks/usePagination"

interface DeviceInstanceRow {
  id: string | number
  serialNumber: string
  deviceName: string
  testBench: string
  model: string
  status: DeviceInstanceStatus
  onlineStatus: DeviceOnlineStatus
}

const loading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
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

const searchData = reactive({
  serialNumber: "",
  testBench: "",
  status: "" as "" | DeviceInstanceStatus
})

const formData = reactive<DeviceInstancePayload>({
  serialNumber: "",
  deviceName: "",
  testBench: "",
  model: "",
  status: "normal",
  onlineStatus: "standby"
})

const detailData = ref<DeviceInstanceRow | null>(null)
const tableData = ref<DeviceInstanceRow[]>([])
const stats = reactive({
  total: 0,
  normal: 0,
  maintenance: 0,
  repair: 0,
  fault: 0
})

const formRules: FormRules = {
  serialNumber: [{ required: true, message: "请输入SN号", trigger: "blur" }],
  deviceName: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  testBench: [{ required: true, message: "请输入所属测试台", trigger: "blur" }],
  model: [{ required: true, message: "请输入型号", trigger: "blur" }],
  status: [{ required: true, message: "请选择设备状态", trigger: "change" }],
  onlineStatus: [{ required: true, message: "请选择在线状态", trigger: "change" }]
}

const statCards = computed(() => [
  { title: "设备总数", value: stats.total, desc: "全部设备实例", className: "total" },
  { title: "运行正常", value: stats.normal, desc: "状态为正常的设备", className: "normal" },
  { title: "维保/维修", value: stats.maintenance + stats.repair, desc: "维保中或维修中", className: "service" },
  { title: "故障设备", value: stats.fault, desc: "需要处理的故障设备", className: "fault" }
])

const testBenchOptions = computed(() => Array.from(new Set(tableData.value.map((item) => item.testBench).filter(Boolean))))

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
  id: row.deviceId ?? row.device_id ?? row.id ?? row.psi_id ?? "",
  serialNumber: row.serialNumber ?? row.serial_number ?? row.psi_serialnumber ?? "",
  deviceName: row.deviceName ?? row.device_name ?? row.psi_name ?? "",
  testBench: row.testBench ?? row.test_bench ?? "",
  model: row.model ?? row.modelName ?? row.model_name ?? row.psimodel_name ?? "",
  status: normalizeStatus(row.status ?? row.deviceStatus ?? row.device_status ?? row.psi_status),
  onlineStatus: normalizeOnlineStatus(row.onlineStatus ?? row.online_status ?? row.onlineStatusText ?? row.online_status_text)
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

const getTableData = async () => {
  loading.value = true
  try {
    const res = await getDeviceInstanceListApi({
      currentPage: paginationData.currentPage,
      size: paginationData.pageSize,
      serialNumber: searchData.serialNumber || undefined,
      testBench: searchData.testBench || undefined,
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
  searchData.testBench = ""
  searchData.status = ""
  handleSearch()
}

const resetForm = () => {
  currentUpdateId.value = undefined
  formData.id = undefined
  formData.serialNumber = ""
  formData.deviceName = ""
  formData.testBench = ""
  formData.model = ""
  formData.status = "normal"
  formData.onlineStatus = "standby"
  formRef.value?.clearValidate()
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: DeviceInstanceRow) => {
  currentUpdateId.value = row.id
  formData.id = row.id
  formData.serialNumber = row.serialNumber
  formData.deviceName = row.deviceName
  formData.testBench = row.testBench
  formData.model = row.model
  formData.status = row.status
  formData.onlineStatus = row.onlineStatus
  dialogVisible.value = true
}

const openDetailDialog = (row: DeviceInstanceRow) => {
  detailData.value = row
  detailVisible.value = true
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
        <el-form-item label="测试台">
          <el-select
            v-model="searchData.testBench"
            allow-create
            clearable
            filterable
            default-first-option
            placeholder="请输入或选择测试台"
          >
            <el-option v-for="item in testBenchOptions" :key="item" :label="item" :value="item" />
          </el-select>
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
        <el-table-column prop="testBench" label="所属测试台" min-width="132" show-overflow-tooltip />
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
        <el-form-item label="所属测试台" prop="testBench">
          <el-select
            v-model="formData.testBench"
            allow-create
            filterable
            default-first-option
            placeholder="请输入或选择测试台"
            style="width: 100%"
          >
            <el-option v-for="item in testBenchOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model.trim="formData.model" placeholder="请输入型号" />
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
            <el-radio-button label="standby">待机</el-radio-button>
            <el-radio-button label="testing">测试中</el-radio-button>
            <el-radio-button label="offline">离线</el-radio-button>
            <el-radio-button label="abnormal">异常</el-radio-button>
            <el-radio-button label="paused">暂停</el-radio-button>
            <el-radio-button label="finished">完成</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="设备详情" width="520px">
      <el-descriptions v-if="detailData" :column="1" border>
        <el-descriptions-item label="SN号">{{ detailData.serialNumber }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ detailData.deviceName }}</el-descriptions-item>
        <el-descriptions-item label="所属测试台">{{ detailData.testBench }}</el-descriptions-item>
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
}
</style>
