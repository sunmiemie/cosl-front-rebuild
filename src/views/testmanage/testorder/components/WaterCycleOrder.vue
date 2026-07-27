<!-- 水循环测试工单 -->

<template>
  <div class="affix-container water-cycle-order">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增水循环工单</el-button>
        <el-tooltip content="刷新当前页">
          <el-button type="primary" icon="RefreshRight" circle @click="getList" />
        </el-tooltip>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="table_no" label="表格编号" min-width="170" align="center" show-overflow-tooltip />
          <el-table-column prop="task_number" label="任务单号" min-width="170" align="center" show-overflow-tooltip />
          <el-table-column prop="applicant" label="申请人" min-width="110" align="center" />
          <el-table-column prop="project_name" label="项目名称" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="test_type" label="测试类型" min-width="160" align="center" show-overflow-tooltip />
          <el-table-column prop="flow_process" label="管线长度" min-width="120" align="center" />
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
              <el-link v-if="Number(row.status) === 0" type="success" class="el-link" @click="handlePublish(row)">
                发布
              </el-link>
              <el-link v-if="Number(row.status) === 0" type="danger" class="el-link" @click="handleDelete(row)">
                删除
              </el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="createDialogVisible" title="创建水循环工单" width="1180px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="150px">
        <div class="form-section-title">基础编号</div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="表格编号" prop="table_no">
              <el-input v-model="createForm.table_no" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务单编号" prop="task_number">
              <el-input v-model="createForm.task_number" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-section-title">申请与项目信息</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请人电话" prop="applicant_phone">
              <el-input v-model="createForm.applicant_phone" placeholder="请输入申请人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请日期" prop="application_date">
              <el-date-picker
                v-model="createForm.application_date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择申请日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试申请单位" prop="test_application_unit">
              <el-input v-model="createForm.test_application_unit" placeholder="请输入测试申请单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位负责人" prop="test_application_unit_manager">
              <el-input v-model="createForm.test_application_unit_manager" placeholder="请输入测试申请单位负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="科研编号" prop="research_number">
              <el-input v-model="createForm.research_number" placeholder="请输入科研编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目预算编号" prop="project_budget_number">
              <el-input v-model="createForm.project_budget_number" placeholder="请输入项目预算编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称" prop="project_name">
              <el-input v-model="createForm.project_name" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-section-title">待测仪器</div>
        <el-form-item label="仪器明细" required>
          <div class="instrument-editor">
            <el-table :data="createForm.instruments" border>
              <el-table-column label="待测仪器" min-width="180">
                <template #default="{ row }">
                  <el-input v-model="row.instrument_name" placeholder="请输入待测仪器" />
                </template>
              </el-table-column>
              <el-table-column label="仪器SN号（资产号，多个）" min-width="260">
                <template #default="{ row }">
                  <el-input v-model="row.sn_numbers" placeholder="多个可用逗号或换行分隔" type="textarea" :rows="2" />
                </template>
              </el-table-column>
              <el-table-column label="数量" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.quantity" :min="1" :precision="0" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="{ $index }">
                  <el-button
                    link
                    type="danger"
                    :disabled="createForm.instruments.length === 1"
                    @click="removeInstrument($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button class="add-instrument-btn" icon="Plus" @click="addInstrument">添加仪器</el-button>
          </div>
        </el-form-item>

        <div class="form-section-title">测试配置</div>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="委托人" prop="client">
              <el-input v-model="createForm.client" placeholder="请输入委托人" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="时间" prop="planned_time">
              <el-date-picker
                v-model="createForm.planned_time"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="测试地点" prop="test_location">
              <el-input v-model="createForm.test_location" placeholder="请输入测试地点" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="测试类型" prop="test_type">
              <el-select v-model="createForm.test_type" placeholder="请选择测试类型" style="width: 100%">
                <el-option v-for="item in TEST_TYPES" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="管线长度" prop="flow_process">
              <el-select v-model="createForm.flow_process" placeholder="请选择管线长度" style="width: 100%">
                <el-option v-for="item in FLOW_PROCESSES" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否需要下发指令" prop="need_command_transfer">
              <el-radio-group v-model="createForm.need_command_transfer">
                <el-radio label="yes">是</el-radio>
                <el-radio label="no">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否需要调压" prop="need_pressure_test">
              <el-radio-group v-model="createForm.need_pressure_test">
                <el-radio label="yes">是</el-radio>
                <el-radio label="no">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-section-title">测试说明</div>
        <el-form-item label="测试目的" prop="test_purpose">
          <el-input v-model="createForm.test_purpose" type="textarea" :rows="3" placeholder="请输入测试目的" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目成员" prop="project_members">
              <el-input v-model="createForm.project_members" type="textarea" :rows="3" placeholder="请输入项目成员" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备清单" prop="equipment_list">
              <el-input v-model="createForm.equipment_list" type="textarea" :rows="3" placeholder="请输入设备清单" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仪器串组合" prop="instrument_combination">
              <el-input
                v-model="createForm.instrument_combination"
                type="textarea"
                :rows="3"
                placeholder="请输入仪器串组合"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试步骤" prop="test_steps">
              <el-input v-model="createForm.test_steps" type="textarea" :rows="3" placeholder="请输入测试步骤" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安全风险及预防措施" prop="safety_risks">
          <el-input
            v-model="createForm.safety_risks"
            type="textarea"
            :rows="3"
            placeholder="请输入安全风险及预防措施"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDialogVisible"
      title="工单详情"
      size="var(--test-order-detail-drawer-size)"
      class="test-order-detail-drawer"
    >
      <div v-if="currentOrder" class="detail-content">
        <div class="detail-section-title">基础编号</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="表格编号">{{ currentOrder.table_no || "-" }}</el-descriptions-item>
          <el-descriptions-item label="任务单编号">{{ currentOrder.task_number }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{
              currentOrder.status_text || currentOrder.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.created_at || "-" }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">申请与项目信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant || "-" }}</el-descriptions-item>
          <el-descriptions-item label="申请人电话">{{ currentOrder.applicant_phone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试申请单位">{{
            currentOrder.test_application_unit || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="单位负责人">
            {{ currentOrder.test_application_unit_manager || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="科研编号">{{ currentOrder.research_number || "-" }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentOrder.application_date || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目预算编号">{{
            currentOrder.project_budget_number || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ currentOrder.project_name || "-" }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">待测仪器</div>
        <el-table :data="getInstrumentRows(currentOrder)" border>
          <el-table-column prop="instrument_name" label="待测仪器" min-width="130" />
          <el-table-column prop="sn_numbers" label="仪器SN号（资产号，多个）" min-width="160" />
          <el-table-column prop="quantity" label="数量" width="76" align="center" />
        </el-table>

        <div class="detail-section-title">测试配置</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="委托人">{{ currentOrder.client || "-" }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentOrder.planned_time || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试地点">{{ currentOrder.test_location || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试类型">{{ currentOrder.test_type || "-" }}</el-descriptions-item>
          <el-descriptions-item label="管线长度">{{ currentOrder.flow_process || "-" }}</el-descriptions-item>
          <el-descriptions-item label="是否需要下发指令">
            {{ yesNoText(currentOrder.need_command_transfer) }}
          </el-descriptions-item>
          <el-descriptions-item label="是否需要调压">{{
            yesNoText(currentOrder.need_pressure_test)
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">测试说明</div>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="测试目的">{{ currentOrder.test_purpose || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目成员">{{ currentOrder.project_members || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备清单">{{ currentOrder.equipment_list || "-" }}</el-descriptions-item>
          <el-descriptions-item label="仪器串组合">{{
            currentOrder.instrument_combination || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="测试步骤">{{ currentOrder.test_steps || "-" }}</el-descriptions-item>
          <el-descriptions-item label="安全风险及预防措施">{{ currentOrder.safety_risks || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, defineExpose, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import {
  createWaterCycleOrderApi,
  deleteWaterCycleOrderApi,
  getWaterCycleOrderDetailApi,
  getWaterCycleOrderListApi,
  publishWaterCycleOrderApi
} from "@/api/water-cycle"
import type { WaterCycleInstrumentItem, WaterCycleOrderDetail, WaterCycleOrderListItem } from "@/api/water-cycle/types"

type StatusTagType = "success" | "warning" | "info" | "primary" | "danger"

const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

const statusOptions = [
  { value: "0", label: "已创建" },
  { value: "1", label: "待领取" },
  { value: "2", label: "测试中" },
  { value: "3", label: "待审核" },
  { value: "4", label: "待重做" },
  { value: "5", label: "正常" },
  { value: "6", label: "异常" },
  { value: "7", label: "暂存" },
  { value: "8", label: "疑问" }
]

const TEST_TYPES = ["水循环测试", "螺杆钻具测试", "螺杆马达整机测试", "水平钻机测试"]

const FLOW_PROCESSES = [
  "空循环",
  "小循环",
  "440米",
  "877米",
  "1766米",
  "2214米",
  "3122米",
  "4622米",
  "6122米",
  "水平钻机",
  "1500米",
  "3000米"
]

const searchForm = reactive({ taskNumber: "", status: "" })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)
const tableData = ref<WaterCycleOrderListItem[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  table_no: "",
  task_number: "",
  applicant: "",
  applicant_phone: "",
  test_application_unit: "",
  test_application_unit_manager: "",
  research_number: "",
  application_date: "",
  project_budget_number: "",
  project_name: "",
  instruments: [{ instrument_name: "", sn_numbers: "", quantity: 1 }] as WaterCycleInstrumentItem[],
  client: "",
  planned_time: "",
  test_location: "",
  test_purpose: "",
  test_type: "水循环测试",
  flow_process: "",
  need_command_transfer: "no",
  need_pressure_test: "no",
  project_members: "",
  equipment_list: "",
  instrument_combination: "",
  test_steps: "",
  safety_risks: ""
})

const createRules = {
  table_no: [{ required: true, message: "请生成表格编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请生成任务单编号", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  applicant_phone: [{ required: true, message: "请输入申请人电话", trigger: "blur" }],
  test_application_unit: [{ required: true, message: "请输入测试申请单位", trigger: "blur" }],
  test_application_unit_manager: [{ required: true, message: "请输入测试申请单位负责人", trigger: "blur" }],
  application_date: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  project_name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  client: [{ required: true, message: "请输入委托人", trigger: "blur" }],
  planned_time: [{ required: true, message: "请选择时间", trigger: "change" }],
  test_type: [{ required: true, message: "请选择测试类型", trigger: "change" }],
  flow_process: [{ required: true, message: "请选择管线长度", trigger: "change" }]
}

const detailDialogVisible = ref(false)
const currentOrder = ref<WaterCycleOrderDetail | null>(null)

const canCreate = computed(() => {
  const hasInstrument = createForm.instruments.some(
    (item) => item.instrument_name && item.sn_numbers && item.quantity > 0
  )
  return !!(
    createForm.table_no &&
    createForm.task_number &&
    createForm.applicant &&
    createForm.applicant_phone &&
    createForm.test_application_unit &&
    createForm.test_application_unit_manager &&
    createForm.application_date &&
    createForm.project_name &&
    createForm.client &&
    createForm.planned_time &&
    createForm.test_type &&
    createForm.flow_process &&
    hasInstrument
  )
})

const pad = (value: number) => String(value).padStart(2, "0")

const generateOrderNumbers = () => {
  const now = new Date()
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  createForm.table_no = `WC-FORM-${date}-${time}`
  createForm.task_number = `WC-TASK-${date}-${time}`
}

const newInstrument = (): WaterCycleInstrumentItem => ({
  instrument_name: "",
  sn_numbers: "",
  quantity: 1
})

const addInstrument = () => {
  createForm.instruments.push(newInstrument())
}

const removeInstrument = (index: number) => {
  if (createForm.instruments.length === 1) return
  createForm.instruments.splice(index, 1)
}

const validateInstruments = () => {
  const invalidIndex = createForm.instruments.findIndex(
    (item) => !item.instrument_name.trim() || !item.sn_numbers.trim() || !item.quantity || item.quantity < 1
  )
  if (invalidIndex >= 0) {
    ElMessage.warning(`请完整填写第 ${invalidIndex + 1} 条待测仪器信息`)
    return false
  }
  return true
}

const getStatusType = (status: number | string): StatusTagType | undefined => {
  const map: Record<string, StatusTagType | undefined> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": undefined,
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  return map[String(status)]
}

const yesNoText = (value?: string) => {
  return value === "yes" || value === "是" || value === "true" ? "是" : "否"
}

const getInstrumentRows = (order: WaterCycleOrderDetail): WaterCycleInstrumentItem[] => {
  if (Array.isArray(order.instruments) && order.instruments.length > 0) return order.instruments
  return [
    {
      instrument_name: order.device_name || "-",
      sn_numbers: order.device_number || "-",
      quantity: order.quantity || 1
    }
  ]
}

const buildPayload = () => {
  const instruments = createForm.instruments.map((item) => ({
    instrument_name: item.instrument_name.trim(),
    sn_numbers: item.sn_numbers.trim(),
    quantity: Number(item.quantity) || 1
  }))
  const firstInstrument = instruments[0]
  const totalQuantity = instruments.reduce((sum, item) => sum + item.quantity, 0)
  const plannedTime = createForm.planned_time ? createForm.planned_time.slice(11) : "00:00:00"

  return {
    ...createForm,
    instruments,
    quantity: totalQuantity,
    device_name: firstInstrument?.instrument_name || "",
    device_number: instruments.map((item) => item.sn_numbers).join("\n"),
    test_date: createForm.application_date,
    start_time: plannedTime,
    end_time: plannedTime,
    test_platform: "水循环测试台"
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getWaterCycleOrderListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  searchForm.taskNumber = ""
  searchForm.status = ""
  pagination.page = 1
  getList()
}

const initSearchFromRoute = () => {
  const { taskNumber, status } = route.query
  searchForm.taskNumber = typeof taskNumber === "string" ? taskNumber : ""
  searchForm.status = typeof status === "string" ? status : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "water-cycle"
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  getList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  getList()
}

const showCreateDialog = () => {
  Object.assign(createForm, {
    table_no: "",
    task_number: "",
    applicant: "",
    applicant_phone: "",
    test_application_unit: "",
    test_application_unit_manager: "",
    research_number: "",
    application_date: new Date().toISOString().split("T")[0],
    project_budget_number: "",
    project_name: "",
    instruments: [newInstrument()],
    client: "",
    planned_time: "",
    test_location: "",
    test_purpose: "",
    test_type: "水循环测试",
    flow_process: "",
    need_command_transfer: "no",
    need_pressure_test: "no",
    project_members: "",
    equipment_list: "",
    instrument_combination: "",
    test_steps: "",
    safety_risks: ""
  })
  generateOrderNumbers()
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid || !validateInstruments()) return
    createLoading.value = true
    try {
      await createWaterCycleOrderApi(buildPayload())
      ElMessage.success("创建成功")
      createDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
    } catch (e) {
      console.error(e)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

const handleDetail = async (row: WaterCycleOrderListItem) => {
  try {
    const res = await getWaterCycleOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handlePublish = async (row: WaterCycleOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishWaterCycleOrderApi(row.id)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}

const handleDelete = async (row: WaterCycleOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteWaterCycleOrderApi(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

const handleWindowFocus = () => {
  if (!loading.value) getList()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible" && !loading.value) getList()
}

defineExpose({ refresh: getList })

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.page = 1
    getList()
  }
)

initSearchFromRoute()
onMounted(() => {
  getList()
  window.addEventListener("focus", handleWindowFocus)
  document.addEventListener("visibilitychange", handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener("focus", handleWindowFocus)
  document.removeEventListener("visibilitychange", handleVisibilityChange)
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

.form-section-title {
  margin: 8px 0 16px;
  padding-left: 10px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  border-left: 3px solid var(--el-color-primary);
}

.instrument-editor {
  width: 100%;
}

.add-instrument-btn {
  width: 100%;
  margin-top: 18px;
}

.detail-content {
  padding: 0 20px 24px;
}

.detail-section-title {
  margin: 18px 0 10px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}
</style>
