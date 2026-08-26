<script setup lang="ts">
import { computed, defineExpose, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type UploadFile,
  type UploadProps,
  type UploadUserFile
} from "element-plus"
import {
  createSimulatedWellOrderApi,
  deleteSimulatedWellOrderApi,
  getSimulatedWellOrderDetailApi,
  getSimulatedWellOrderListApi,
  publishSimulatedWellOrderApi
} from "@/api/simulated-well"
import { getMySignatureApi, getSignatureImageApi } from "@/api/signature"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import type { SimulatedWellOrderListItem } from "@/api/simulated-well/types"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined

const statusOptions = [
  { value: "0", label: "待审核" },
  { value: "1", label: "待领取" },
  { value: "2", label: "测试中" },
  { value: "3", label: "待审核" },
  { value: "4", label: "待重测" },
  { value: "5", label: "正常" },
  { value: "6", label: "异常" },
  { value: "7", label: "暂存" },
  { value: "8", label: "疑问" }
]

const wellNameOptions = [
  { value: "cosl1", label: "科索1井" },
  { value: "yanjiao1", label: "燕郊1井" },
  { value: "yanjiao2", label: "燕郊2井" },
  { value: "ren91", label: "任91井" },
  { value: "gugu8", label: "孤古8井" },
  { value: "other", label: "其他" }
]

const getWellNameLabel = (value?: string | null) =>
  wellNameOptions.find((item) => item.value === value)?.label || "-"

const orderTypeTabs = [
  { name: "0", label: "非研究院" },
  { name: "1", label: "研究院" }
] as const

const getOrderTypeLabel = (value?: number | null) => (value === 1 ? "研究院" : "非研究院")

const searchForm = reactive({
  taskNumber: "",
  status: ""
})
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const loading = ref(false)
const tableData = ref<SimulatedWellOrderListItem[]>([])
const activeOrderType = ref<"0" | "1">("0")
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const todayText = () => {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}
const createDefaultForm = () => ({
  table_number: "WT3-TC/ZZ-01-R04",
  task_number: `TASK${Date.now()}`,
  applicant: "",
  applicant_phone: "",
  test_unit: "",
  test_unit_manager: "",
  application_date: todayText(),
  research_no: "",
  project_budget_no: "",
  project_name: "",
  order_type: 0 as 0 | 1,
  well_name: "",
  tested_instrument: "",
  instrument_sn_numbers: "",
  quantity: 1,
  client: "",
  entrusted_time: todayText(),
  test_location: "",
  test_purpose: "",
  test_steps: "",
  safety_risks: "",
  sanxin_applicant_item_1: "no" as "yes" | "no",
  sanxin_applicant_item_2: "no" as "yes" | "no",
  sanxin_applicant_item_3: "no" as "yes" | "no",
  sanxin_applicant_item_4: "no" as "yes" | "no",
  sanxin_applicant_item_5: "no" as "yes" | "no",
  sanxin_applicant_signer: ""
})
const createForm = reactive(createDefaultForm())
const createRules = {
  table_number: [{ required: true, message: "请输入表格编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请输入任务单编号", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  test_unit: [{ required: true, message: "请输入测试申请单位", trigger: "blur" }],
  project_name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  well_name: [{ required: true, message: "请选择实验井", trigger: "change" }],
  tested_instrument: [{ required: true, message: "请输入待测仪器", trigger: "blur" }],
  instrument_sn_numbers: [{ required: true, message: "请输入仪器SN号", trigger: "blur" }],
  quantity: [{ required: true, message: "请输入数量", trigger: "change" }],
  test_purpose: [{ required: true, message: "请输入测试目的", trigger: "blur" }],
  test_steps: [{ required: true, message: "请输入测试步骤", trigger: "blur" }],
  safety_risks: [{ required: true, message: "请输入安全风险及预防措施", trigger: "blur" }]
}

const detailDialogVisible = ref(false)
const currentOrder = ref<SimulatedWellOrderListItem | null>(null)

const publishDialogVisible = ref(false)
const publishLoading = ref(false)
const publishOrder = ref<SimulatedWellOrderListItem | null>(null)
const publishSignatureFileList = ref<UploadUserFile[]>([])
const publishSignatureRawFile = ref<File | null>(null)
const publishSignatureSource = ref<"saved" | "local" | "">("")
const publishSignatureObjectUrl = ref("")
const publishSignaturePreviewDataUrl = ref("")
const signaturePreviewVisible = ref(false)
const publishConfirmDate = ref(new Date().toISOString().split("T")[0])

type SanxinAnswer = "yes" | "no" | null
const sanxinApplicantItems = [
  "申请测试仪器是否为新研制仪器首次下井测试。",
  "申请测试仪器是否为全新组合方式下井测试。",
  "申请测试仪器是否为外观及结构进行重大改造后首次下井测试。",
  "申请测试仪器是否为设备改造后首次下井测试。",
  "申请测试仪器是否为作业工艺首次应用测试。"
]
const sanxinApplicantAnswers = computed<("yes" | "no")[]>(() => {
  const o = publishOrder.value
  const raw = [
    o?.sanxin_applicant_item_1,
    o?.sanxin_applicant_item_2,
    o?.sanxin_applicant_item_3,
    o?.sanxin_applicant_item_4,
    o?.sanxin_applicant_item_5
  ]
  return raw.map((v) => (v === "yes" ? "yes" : "no"))
})
const sanxinApplicantHasRisk = computed(() => sanxinApplicantAnswers.value.some((v) => v === "yes"))
const sanxinApplicantSummaryText = computed(() =>
  sanxinApplicantHasRisk.value ? "序号 1-5 包含为「是」的选项" : "序号 1-5 全部为「否」"
)
const sanxinApplicantSigner = computed(() => publishOrder.value?.sanxin_applicant_signer || "--")
const sanxinTesterItems = ["被测产品是否为首次下井测试。", "组合方式是否为首次下井测试。"]
const sanxinTesterAnswers = reactive<Record<number, SanxinAnswer>>({ 0: null, 1: null })
const sanxinDoneCount = computed(() => Object.values(sanxinTesterAnswers).filter((v) => v !== null).length)
const sanxinProgressPercent = computed(() => (sanxinDoneCount.value / 2) * 100)
const sanxinHasRisk = computed(() => Object.values(sanxinTesterAnswers).some((v) => v === "yes"))
const publishSignaturePreviewUrl = computed(
  () =>
    publishSignaturePreviewDataUrl.value || publishSignatureObjectUrl.value || publishSignatureFileList.value[0]?.url
)
const canConfirmPublish = computed(
  () => !!(publishOrder.value && publishSignatureRawFile.value && sanxinDoneCount.value === 2)
)
const publishSignatureStatusText = computed(() =>
  publishSignatureSource.value === "saved" ? "已读取个人签名" : "已选择本地签名"
)

const resetPublishDialog = () => {
  publishSignatureFileList.value = []
  publishSignatureRawFile.value = null
  publishSignatureSource.value = ""
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureObjectUrl.value = ""
  publishSignaturePreviewDataUrl.value = ""
  signaturePreviewVisible.value = false
  publishOrder.value = null
  sanxinTesterAnswers[0] = null
  sanxinTesterAnswers[1] = null
  publishConfirmDate.value = new Date().toISOString().split("T")[0]
}

const getSignatureFileName = (mimeType?: string | null) => {
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return "signature.jpg"
  if (mimeType === "image/webp") return "signature.webp"
  return "signature.png"
}

const loadStoredSignatureForPublish = async () => {
  try {
    const info = await getMySignatureApi()
    if (!info.data?.hasSignature) return
    const blob = await getSignatureImageApi(info.data.userId)
    if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
    publishSignatureObjectUrl.value = URL.createObjectURL(blob)
    publishSignaturePreviewDataUrl.value = ""
    publishSignatureRawFile.value = new File(
      [blob],
      info.data.originalFilename || getSignatureFileName(info.data.mimeType || blob.type),
      { type: blob.type || info.data.mimeType || "image/png" }
    )
    publishSignatureSource.value = "saved"
    publishSignatureFileList.value = [
      {
        name: publishSignatureRawFile.value.name,
        url: publishSignatureObjectUrl.value,
        status: "success"
      }
    ]
  } catch (error) {
    console.warn("读取个人签名失败", error)
  }
}

const getStatusType = (status: number | string): TagType => {
  const map: Record<string, TagType> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": "warning",
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  return map[String(status)]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellOrderListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined,
      orderType: activeOrderType.value
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const resetCreateForm = () => {
  Object.assign(createForm, createDefaultForm())
  createFormRef.value?.clearValidate()
}

const openCreateDialog = () => {
  resetCreateForm()
  createDialogVisible.value = true
}

const splitInstrumentSnNumbers = (value: string) =>
  String(value || "")
    .split(/[\n,，;；]+/)
    .map((item) => item.trim())
    .filter(Boolean)

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      const sns = splitInstrumentSnNumbers(createForm.instrument_sn_numbers)
      const payload = {
        ...createForm,
        customer_unit: createForm.test_unit,
        task_desc: createForm.project_name,
        device_count: createForm.quantity,
        devices: sns.map((sn) => ({
          device_name: createForm.tested_instrument,
          device_number: sn
        }))
      }
      const res = await createSimulatedWellOrderApi(payload)
      if (res.code === 0) {
        ElMessage.success("模拟井工单已创建")
        createDialogVisible.value = false
        activeOrderType.value = String(createForm.order_type) as "0" | "1"
        pagination.page = 1
        void taskCenterStore.refresh(true)
        getList()
        return
      }
      ElMessage.error(res.msg || "创建失败")
    } catch (error) {
      console.error(error)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
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
  return typeof tab !== "string" || tab === "simulation"
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

const handleOrderTypeTabChange = (orderType: string | number) => {
  activeOrderType.value = String(orderType) as "0" | "1"
  pagination.page = 1
  getList()
}

const handleDetail = async (row: SimulatedWellOrderListItem) => {
  try {
    const res = await getSimulatedWellOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取详情失败")
  }
}

const showPublishDialog = async (row: SimulatedWellOrderListItem) => {
  resetPublishDialog()
  try {
    const res = await getSimulatedWellOrderDetailApi(row.id)
    if (res.code === 0) {
      publishOrder.value = res.data
    } else {
      publishOrder.value = row
    }
  } catch (e) {
    publishOrder.value = row
  }

  await loadStoredSignatureForPublish()
  publishDialogVisible.value = true
}

const setSanxinAnswer = (idx: number, answer: SanxinAnswer) => {
  sanxinTesterAnswers[idx] = answer
}

const handlePublishSignatureChange: UploadProps["onChange"] = (file: UploadFile) => {
  const raw = file.raw as File | undefined
  if (!raw) return
  if (!raw.type.startsWith("image/")) {
    ElMessage.error("请上传图片格式的签名文件")
    clearPublishSignature()
    return
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.error("签名图片大小不能超过 5MB")
    clearPublishSignature()
    return
  }
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureRawFile.value = raw
  publishSignatureSource.value = "local"
  publishSignatureObjectUrl.value = URL.createObjectURL(raw)
  publishSignaturePreviewDataUrl.value = ""
}

const clearPublishSignature = () => {
  publishSignatureRawFile.value = null
  publishSignatureSource.value = ""
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureObjectUrl.value = ""
  publishSignaturePreviewDataUrl.value = ""
  publishSignatureFileList.value = []
}

const handlePublishSignatureRemove: UploadProps["onRemove"] = () => {
  clearPublishSignature()
}

const openSignaturePreview = () => {
  if (!publishSignaturePreviewUrl.value) return
  signaturePreviewVisible.value = true
}

const handleReuploadSignature = () => {
  clearPublishSignature()
}

const handleConfirmPublish = async () => {
  if (!publishOrder.value) return
  if (sanxinDoneCount.value !== 2) {
    ElMessage.warning("请完成三新确认项填写")
    return
  }
  if (!publishSignatureRawFile.value) {
    ElMessage.warning("请上传管理员电子签名")
    return
  }

  publishLoading.value = true
  try {
    const formData = new FormData()
    formData.append("confirm_date", publishConfirmDate.value || "")
    formData.append("tester_item_1", sanxinTesterAnswers[0] || "")
    formData.append("tester_item_2", sanxinTesterAnswers[1] || "")
    formData.append("is_sanxin", sanxinHasRisk.value ? "1" : "0")
    formData.append("admin_signature", publishSignatureRawFile.value)

    const res = await publishSimulatedWellOrderApi(publishOrder.value.id, formData)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      publishDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
      return
    }
    ElMessage.error(res.msg || "发布失败")
  } catch (error) {
    console.error(error)
    ElMessage.error("发布失败")
  } finally {
    publishLoading.value = false
  }
}

const handleDelete = async (row: SimulatedWellOrderListItem) => {
  await ElMessageBox.confirm("确认删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteSimulatedWellOrderApi(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      void taskCenterStore.refresh(true)
      getList()
      return
    }
    ElMessage.error(res.msg || "删除失败")
  } catch (error) {
    console.error(error)
    ElMessage.error("删除失败")
  }
}

defineExpose({
  refresh: getList
})

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.page = 1
    getList()
  }
)

onMounted(() => {
  initSearchFromRoute()
  getList()
})
</script>

<template>
  <div class="affix-container management-list-shell">
    <el-card v-loading="loading" class="management-list-card" shadow="never">
      <div class="management-list-toolbar">
        <el-form :inline="true" :model="searchForm" class="management-filter-form">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        </el-form>
        <div class="management-toolbar-actions">
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="primary" icon="Plus" @click="openCreateDialog">新增</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-tabs v-model="activeOrderType" @tab-change="handleOrderTypeTabChange">
          <el-tab-pane v-for="tab in orderTypeTabs" :key="tab.name" :label="tab.label" :name="tab.name">
            <el-table :data="tableData" stripe border height="100%" style="width: 100%">
              <el-table-column prop="table_number" label="表格编号" width="150" align="center" />
              <el-table-column prop="task_number" label="任务单编号" width="180" align="center" />
              <el-table-column label="申请人" min-width="110" align="center">
                <template #default="{ row }">
                  <span>{{ row.applicant || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="测试申请单位" min-width="160" align="center">
                <template #default="{ row }">
                  <span>{{ row.test_unit || row.customer_unit || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="项目名称" min-width="170" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  <span>{{ row.project_name || row.task_desc || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="待测仪器" min-width="180" align="center" show-overflow-tooltip>
                <template #default="{ row }">
                  <span>{{ row.tested_instrument || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="数量" width="90" align="center">
                <template #default="{ row }">
                  <span>{{ row.quantity ?? row.device_count ?? 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">{{ row.status_text || row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center" fixed="right">
                <template #default="{ row }">
                  <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
                  <el-link v-if="row.status === 0" type="success" class="el-link" @click="showPublishDialog(row)"
                    >发布</el-link
                  >
                  <el-link v-if="row.status === 0" type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
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

    <el-dialog v-model="createDialogVisible" title="新增模拟井工单" width="980px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="150px" class="create-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="表格编号" prop="table_number">
              <el-input v-model="createForm.table_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务单编号" prop="task_number">
              <el-input v-model="createForm.task_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人电话" prop="applicant_phone">
              <el-input v-model="createForm.applicant_phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试申请单位" prop="test_unit">
              <el-input v-model="createForm.test_unit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位负责人" prop="test_unit_manager">
              <el-input v-model="createForm.test_unit_manager" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="申请日期" prop="application_date">
              <el-date-picker
                v-model="createForm.application_date"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="科研编号" prop="research_no">
              <el-input v-model="createForm.research_no" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目预算编号" prop="project_budget_no">
              <el-input v-model="createForm.project_budget_no" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目名称" prop="project_name">
              <el-input v-model="createForm.project_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工单类型" prop="order_type">
              <el-radio-group v-model="createForm.order_type">
                <el-radio :value="0">非研究院</el-radio>
                <el-radio :value="1">研究院</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实验井" prop="well_name">
              <el-select v-model="createForm.well_name" placeholder="请选择实验井" style="width: 100%">
                <el-option v-for="item in wellNameOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="待测仪器" prop="tested_instrument">
              <el-input v-model="createForm.tested_instrument" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="仪器SN号（资产号，多个）" prop="instrument_sn_numbers">
              <el-input
                v-model="createForm.instrument_sn_numbers"
                type="textarea"
                :rows="2"
                placeholder="多个 SN 可用逗号、分号或换行分隔"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="createForm.quantity" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托人" prop="client">
              <el-input v-model="createForm.client" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间" prop="entrusted_time">
              <el-input v-model="createForm.entrusted_time" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试地点" prop="test_location">
              <el-input v-model="createForm.test_location" placeholder="请输入测试地点" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="测试目的" prop="test_purpose">
              <el-input v-model="createForm.test_purpose" type="textarea" :rows="3" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="测试步骤" prop="test_steps">
              <el-input v-model="createForm.test_steps" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="安全风险及预防措施" prop="safety_risks">
              <el-input v-model="createForm.safety_risks" type="textarea" :rows="4" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreate">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDialogVisible"
      title="工单详情"
      size="var(--test-order-detail-drawer-size)"
      class="test-order-detail-drawer"
    >
      <div v-if="currentOrder" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="表格编号">{{ currentOrder.table_number || "-" }}</el-descriptions-item>
          <el-descriptions-item label="任务单编号">{{ currentOrder.task_number }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant || "-" }}</el-descriptions-item>
          <el-descriptions-item label="申请人电话">{{ currentOrder.applicant_phone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试申请单位">{{
            currentOrder.test_unit || currentOrder.customer_unit || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="测试申请单位负责人">{{
            currentOrder.test_unit_manager || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentOrder.application_date || "-" }}</el-descriptions-item>
          <el-descriptions-item label="科研编号">{{ currentOrder.research_no || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目预算编号">{{ currentOrder.project_budget_no || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{
            currentOrder.project_name || currentOrder.task_desc || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="工单类型">{{ getOrderTypeLabel(currentOrder.order_type) }}</el-descriptions-item>
          <el-descriptions-item label="实验井">{{ getWellNameLabel(currentOrder.well_name) }}</el-descriptions-item>
          <el-descriptions-item label="待测仪器">{{ currentOrder.tested_instrument || "-" }}</el-descriptions-item>
          <el-descriptions-item label="仪器SN号（资产号，多个）">{{
            currentOrder.instrument_sn_numbers || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{
            currentOrder.quantity ?? currentOrder.device_count ?? 1
          }}</el-descriptions-item>
          <el-descriptions-item label="委托人">{{ currentOrder.client || "-" }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentOrder.entrusted_time || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试地点">{{ currentOrder.test_location || "-" }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status_text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.created_at || "-" }}</el-descriptions-item>
          <el-descriptions-item label="计划时间">{{ currentOrder.plan_date || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试目的">{{ currentOrder.test_purpose || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试步骤">{{ currentOrder.test_steps || "-" }}</el-descriptions-item>
          <el-descriptions-item label="安全风险及预防措施">{{ currentOrder.safety_risks || "-" }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 16px">
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 10px">测试设备列表</div>
          <el-table :data="currentOrder.devices || []" stripe border style="width: 100%">
            <el-table-column prop="device_name" label="设备名称" min-width="130" align="center" />
            <el-table-column prop="device_number" label="设备编号" min-width="130" align="center" />
          </el-table>
          <el-empty v-if="(currentOrder.devices || []).length === 0" description="暂无测试设备" />
        </div>
      </div>
    </el-drawer>

    <el-dialog
      v-model="publishDialogVisible"
      width="920px"
      :close-on-click-modal="false"
      class="publish-dialog"
      @closed="resetPublishDialog"
    >
      <template #header>
        <div class="publish-dialog-header">
          <div>
            <div class="publish-dialog-title">工单分配 · "三新"测试确认单填写</div>
            <div class="publish-dialog-subtitle">WT3-TC/ZZ-01-R04 · 模拟井 | 测试方确认项由管理员填写</div>
          </div>
        </div>
      </template>
      <div class="publish-wrap">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-card v-if="publishOrder" shadow="never" class="publish-card">
              <template #header>
                <div class="publish-card-title">工单信息</div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="工单编号">{{ publishOrder.task_number }}</el-descriptions-item>
                <el-descriptions-item label="客户单位">{{ publishOrder.customer_unit || "-" }}</el-descriptions-item>
                <el-descriptions-item label="设备数量">{{ publishOrder.device_count ?? 1 }}</el-descriptions-item>
                <el-descriptions-item label="计划时间">{{ publishOrder.plan_date || "-" }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
            <el-card shadow="never" class="publish-card">
              <template #header>
                <div class="publish-card-title">申请方确认项（序号 1-5）</div>
              </template>
              <div v-for="(text, idx) in sanxinApplicantItems" :key="idx" class="publish-readonly-row">
                <div class="publish-readonly-index">{{ idx + 1 }}</div>
                <div class="publish-readonly-content">{{ text }}</div>
                <el-tag :type="sanxinApplicantAnswers[idx] === 'yes' ? 'danger' : 'success'" effect="light">
                  {{ sanxinApplicantAnswers[idx] === "yes" ? "是" : "否" }}
                </el-tag>
              </div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card shadow="never" class="publish-card">
              <div class="publish-section">
                <div class="publish-section-head">
                  <span>测试方填写进度</span>
                  <span>{{ sanxinDoneCount }}/2 已填写</span>
                </div>
                <el-progress :percentage="sanxinProgressPercent" :stroke-width="8" :show-text="false" />
              </div>
              <div class="publish-section">
                <el-alert type="info" :closable="false" show-icon>
                  <template #title>
                    <div class="publish-alert-content">
                      <div><strong>申请方汇总：</strong>{{ sanxinApplicantSummaryText }}</div>
                      <div>申请方签字：{{ sanxinApplicantSigner }}</div>
                    </div>
                  </template>
                </el-alert>
              </div>
              <div v-for="(title, idx) in sanxinTesterItems" :key="idx" class="publish-question">
                <div class="publish-question-title">
                  <span class="publish-question-index">{{ idx + 1 }}</span>
                  <span>{{ title }}</span>
                </div>
                <div class="publish-question-actions">
                  <el-button
                    :type="sanxinTesterAnswers[idx] === 'yes' ? 'danger' : undefined"
                    :plain="sanxinTesterAnswers[idx] !== 'yes'"
                    @click="setSanxinAnswer(idx, 'yes')"
                  >
                    是
                  </el-button>
                  <el-button
                    :type="sanxinTesterAnswers[idx] === 'no' ? 'success' : undefined"
                    :plain="sanxinTesterAnswers[idx] !== 'no'"
                    @click="setSanxinAnswer(idx, 'no')"
                  >
                    否
                  </el-button>
                </div>
              </div>
              <el-alert v-if="sanxinHasRisk" type="warning" :closable="false" show-icon class="publish-section">
                存在“是”选项，本次将被标记为“三新”测试，请遵守相关安全规程。
              </el-alert>
              <div class="publish-section">
                <div class="publish-field-label">管理员电子签名 <span class="publish-required">*</span></div>
                <el-upload
                  v-model:file-list="publishSignatureFileList"
                  :show-file-list="false"
                  :auto-upload="false"
                  :limit="1"
                  accept="image/*"
                  :disabled="!!publishSignatureRawFile"
                  :on-change="handlePublishSignatureChange"
                  :on-remove="handlePublishSignatureRemove"
                >
                  <div
                    class="publish-signature-box"
                    :class="{ 'is-filled': !!publishSignatureRawFile }"
                    @click="publishSignatureRawFile ? openSignaturePreview() : undefined"
                  >
                    <div v-if="!publishSignatureRawFile" class="publish-signature-placeholder">
                      <div class="publish-signature-hint">点击上传签名图片</div>
                      <div class="publish-signature-tip">支持 PNG / JPG，上传后自动保存</div>
                    </div>
                    <img v-else class="publish-signature-image" :src="publishSignaturePreviewUrl" alt="签名预览" />
                  </div>
                </el-upload>
                <div v-if="publishSignatureRawFile" class="publish-signature-actions">
                  <span class="publish-signature-saved">{{ publishSignatureStatusText }}</span>
                  <el-link type="primary" @click="handleReuploadSignature">重新上传</el-link>
                </div>
              </div>
              <div class="publish-section">
                <div class="publish-field-label">确认日期（自动填充）</div>
                <el-date-picker
                  v-model="publishConfirmDate"
                  type="date"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="publishLoading"
          :disabled="!canConfirmPublish"
          @click="handleConfirmPublish"
        >
          确认并下发工单
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="signaturePreviewVisible"
      title="管理员电子签名"
      width="640px"
      :close-on-click-modal="true"
      append-to-body
    >
      <div v-if="publishSignaturePreviewUrl" class="signature-preview">
        <img :src="publishSignaturePreviewUrl" alt="管理员电子签名" class="signature-preview-img" />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
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
  margin: 0 4px;
}

.publish-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.publish-dialog-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.publish-dialog-subtitle {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.publish-wrap {
  font-size: 12px;
}

.publish-card {
  margin-bottom: 16px;
}

.publish-card:last-child {
  margin-bottom: 0;
}

.publish-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.publish-readonly-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.publish-readonly-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.publish-readonly-index {
  width: 20px;
  color: #606266;
  font-weight: 600;
  flex-shrink: 0;
  line-height: 24px;
}

.publish-readonly-content {
  flex: 1;
  line-height: 1.6;
  color: #303133;
}

.publish-section {
  margin-bottom: 16px;
}

.publish-section:last-child {
  margin-bottom: 0;
}

.publish-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #606266;
  font-size: 13px;
}

.publish-alert-content {
  line-height: 1.7;
}

.publish-question {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  padding: 14px;
  margin-bottom: 12px;
  background-color: #fafafa;
}

.publish-question-title {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  line-height: 1.6;
  color: #303133;
}

.publish-question-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ecf5ff;
  color: #409eff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 1px;
}

.publish-question-actions {
  display: flex;
  gap: 10px;
}

.publish-question-actions :deep(.el-button) {
  flex: 1;
  margin-left: 0;
}

.publish-field-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.publish-required {
  color: #f56c6c;
}

.publish-signature-box {
  border: 1px dashed #c0c4cc;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.publish-signature-box:hover:not(.is-filled) {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.publish-signature-box.is-filled {
  border-style: solid;
  border-color: #dcdfe6;
  background-color: #fff;
  cursor: pointer;
}

.publish-signature-placeholder {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.publish-signature-hint {
  font-size: 13px;
  color: #606266;
}

.publish-signature-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

.publish-signature-image {
  max-height: 72px;
  max-width: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
  border-radius: 4px;
}

.publish-signature-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.publish-signature-saved {
  font-size: 11px;
  color: #67c23a;
}

.signature-preview {
  display: flex;
  justify-content: center;
}

.signature-preview-img {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
