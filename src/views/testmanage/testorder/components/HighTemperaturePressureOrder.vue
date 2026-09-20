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
  createHighTempPressureOrderApi,
  deleteHighTempPressureOrderApi,
  getHighTempPressureOrderDetailApi,
  getHighTempPressureOrderListApi,
  publishHighTempPressureOrderApi
} from "@/api/high-temp-pressure"
import { getDeviceInstanceListApi } from "@/api/device-instance"
import { getMySignatureApi, getSignatureImageApi } from "@/api/signature"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import type { HighTempPressureOrderInstrumentItem, HighTempPressureOrderListItem } from "@/api/high-temp-pressure/types"
import type { DeviceInstanceData } from "@/api/device-instance/types"
import { getHostModelDisplayName } from "@/views/devicemanage/device/psi/model-options"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type HighTempPressureDeviceOption = {
  label: string
  value: string
}

const statusOptions = [
  { value: "0", label: "已创建" },
  { value: "1", label: "待领取" },
  { value: "2", label: "测试中" },
  { value: "3", label: "待审核" },
  { value: "4", label: "待重测" },
  { value: "5", label: "正常" },
  { value: "6", label: "异常" },
  { value: "7", label: "暂存" },
  { value: "8", label: "疑问" }
]

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
const tableData = ref<HighTempPressureOrderListItem[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const highTempPressureDeviceOptions = ref<HighTempPressureDeviceOption[]>([])
const highTempPressureDeviceLoading = ref(false)
const testTypeOptions = ["高压测试", "高温高压测试"]
const testContainerOptions = ["250容器", "480容器"]
const onlineTestText = (value: boolean | null | undefined) =>
  value === true ? "是" : value === false ? "否" : "未填写"
const normalizeTargetTemperature = (value: unknown) => String(value ?? "").trim()
const formatTargetTemperature = (value: unknown) => {
  const text = normalizeTargetTemperature(value)
  if (!text) return "-"
  if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text)) return `${text}°C`
  return text
}
const validateTargetTemperature = (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
  const text = normalizeTargetTemperature(value)
  if (!text) return callback(new Error("请输入目标温度"))
  if (text.length > 100) return callback(new Error("目标温度不能超过100个字符"))
  callback()
}

const todayText = () => new Date().toISOString().split("T")[0]
const pad = (value: number) => String(value).padStart(3, "0")
const randomSeq = () => pad(Math.floor(Math.random() * 1000))
const generateTableNo = () => `HTP-${todayText().replaceAll("-", "")}-${randomSeq()}`
const generateTaskNumber = () => `HTP-TASK-${todayText().replaceAll("-", "")}-${randomSeq()}`
const highTempPressureModelKeywords = ["高温高压井", "高温高压", "高压井"]

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue
    const text = String(value).trim()
    if (text) return text
  }
  return ""
}

const normalizeDeviceInstanceList = (response: any): DeviceInstanceData[] => {
  const payload = response?.data ?? response ?? {}
  const list = Array.isArray(payload)
    ? payload
    : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []

  return Array.isArray(list) ? list : []
}

const getDeviceInstanceName = (row: DeviceInstanceData) => firstText(row.deviceName, row.device_name, row.psi_name)

const isHighTempPressureDevice = (row: DeviceInstanceData) => {
  const texts = [
    getHostModelDisplayName(row),
    firstText(row.model, row.model_name, row.modelName),
    firstText(row.psimodel_name),
    getDeviceInstanceName(row)
  ].filter(Boolean)

  return highTempPressureModelKeywords.some((keyword) => texts.some((text) => text.includes(keyword)))
}

const createForm = reactive({
  table_no: "",
  test_platform: "高温高压井测试台",
  test_date: todayText(),
  application_date: todayText(),
  use_device: "",
  device_name: "",
  device_number: "N/A",
  task_number: "",
  applicant_phone: "",
  test_application_unit: "",
  test_application_unit_manager: "",
  research_number: "",
  project_budget_number: "",
  project_name: "",
  client: "",
  planned_time: "",
  test_location: "",
  test_purpose: "",
  test_type: "",
  test_container: "",
  online_test: null as boolean | null,
  target_temp: "",
  target_pressure: 0,
  max_diameter: null as number | null,
  hold_time: null as number | null,
  applicant: "",
  project_members: "",
  equipment_list: "",
  instrument_combination: "",
  test_steps: "",
  safety_risks: "",
  remark: ""
})

const instrumentFormList = ref<HighTempPressureOrderInstrumentItem[]>([
  {
    instrument_name: "",
    instrument_sn: "",
    quantity: 1,
    instrument_length: "",
    max_diameter: null
  }
])

const createRules = {
  test_platform: [{ required: true, message: "请选择测试台", trigger: "change" }],
  test_date: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  table_no: [{ required: true, message: "请填写表格编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  target_temp: [{ validator: validateTargetTemperature, trigger: "blur" }],
  target_pressure: [{ required: true, message: "请输入目标压力", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  applicant_phone: [{ required: true, message: "请输入申请人电话", trigger: "blur" }],
  test_application_unit: [{ required: true, message: "请输入测试申请单位", trigger: "blur" }],
  test_application_unit_manager: [{ required: true, message: "请输入测试申请单位负责人", trigger: "blur" }],
  application_date: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  project_name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  client: [{ required: true, message: "请输入委托人", trigger: "blur" }],
  planned_time: [{ required: true, message: "请选择时间", trigger: "change" }],
  test_type: [{ required: true, message: "请选择测试类型", trigger: "change" }],
  test_container: [{ required: true, message: "请选择测试容器", trigger: "change" }],
  online_test: [{ required: true, message: "请选择是否在线测试", trigger: "change" }],
  use_device: [{ required: true, message: "请选择使用设备", trigger: "change" }],
  equipment_list: [{ required: true, message: "请输入设备清单", trigger: "blur" }]
}

const canCreate = computed(() => {
  if (
    !(
      createForm.table_no &&
      createForm.task_number &&
      createForm.applicant &&
      createForm.applicant_phone &&
      createForm.test_application_unit &&
      createForm.test_application_unit_manager &&
      createForm.project_name &&
      createForm.client &&
      createForm.planned_time &&
      createForm.test_type &&
      createForm.test_container &&
      normalizeTargetTemperature(createForm.target_temp) &&
      typeof createForm.online_test === "boolean" &&
      createForm.use_device
    )
  ) {
    return false
  }
  if (!instrumentFormList.value.length) return false
  return instrumentFormList.value.every((i) => !!(i.instrument_name && i.instrument_sn))
})

const detailDialogVisible = ref(false)
const currentOrder = ref<HighTempPressureOrderListItem | null>(null)

const publishDialogVisible = ref(false)
const publishStep = ref<"number" | "confirmation">("number")
const publishTestNumber = ref("")
const validatePublishTestNumber = () => {
  publishTestNumber.value = publishTestNumber.value.trim()
  if (!publishTestNumber.value) {
    ElMessage.warning("请输入测试单号")
    return false
  }
  if (publishTestNumber.value.length > 100) {
    ElMessage.warning("测试单号不能超过100个字符")
    return false
  }
  return true
}
const nextPublishStep = () => {
  if (validatePublishTestNumber()) publishStep.value = "confirmation"
}
const publishLoading = ref(false)
const publishOrder = ref<HighTempPressureOrderListItem | null>(null)
const publishSignatureFileList = ref<UploadUserFile[]>([])
const publishSignatureRawFile = ref<File | null>(null)
const publishSignatureSource = ref<"saved" | "local" | "">("")
const publishSignatureObjectUrl = ref("")
const publishSignaturePreviewDataUrl = ref("")
const signaturePreviewVisible = ref(false)
const publishConfirmDate = ref(new Date().toISOString().split("T")[0])
const sanxinApplicantItems = [
  "被测产品外形尺寸：①250容器：直径>240mm、长度>9m、总重量>4吨；②480容器：直径>420mm、长度>15m、总重量>4吨",
  "①定型被测产品，试压条件是否超出设计指标范围内；②未定型被测产品，经过安全系数计算，理论上会发生变形、泄露甚至是爆裂",
  "被测产品原材料是否未经过检验、不合格",
  "被测产品密封面、壁厚等关键尺寸是否未经过检测、未合格",
  "被测产品是否含有毒有害、腐蚀性、爆炸性或电离辐射等危险品，或强磁性物质"
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

type SanxinAnswer = "yes" | "no" | null

const sanxinTesterItems = ["被测产品其他附件如上下接头、O型圈等是否不合格", "密封件未装配、有损伤且未润滑充分"]

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
  publishStep.value = "number"
  publishTestNumber.value = ""
  publishSignatureFileList.value = []
  publishSignatureRawFile.value = null
  publishSignatureSource.value = ""
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureObjectUrl.value = ""
  publishSignaturePreviewDataUrl.value = ""
  signaturePreviewVisible.value = false
  publishOrder.value = null
  publishConfirmDate.value = new Date().toISOString().split("T")[0]
  sanxinTesterAnswers[0] = null
  sanxinTesterAnswers[1] = null
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
    const res = await getHighTempPressureOrderListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined
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
  return typeof tab !== "string" || tab === "high-temp-pressure"
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

const loadHighTempPressureDeviceOptions = async () => {
  if (highTempPressureDeviceOptions.value.length) {
    if (!createForm.use_device && highTempPressureDeviceOptions.value.length === 1) {
      createForm.use_device = highTempPressureDeviceOptions.value[0].value
    }
    return
  }

  highTempPressureDeviceLoading.value = true
  try {
    const res = await getDeviceInstanceListApi({ currentPage: 1, size: 2000 })
    const optionMap = new Map<string, HighTempPressureDeviceOption>()

    normalizeDeviceInstanceList(res)
      .filter(isHighTempPressureDevice)
      .forEach((row) => {
        const deviceName = getDeviceInstanceName(row)
        if (!deviceName || optionMap.has(deviceName)) return
        optionMap.set(deviceName, { label: deviceName, value: deviceName })
      })

    highTempPressureDeviceOptions.value = Array.from(optionMap.values())
    if (!createForm.use_device && highTempPressureDeviceOptions.value.length === 1) {
      createForm.use_device = highTempPressureDeviceOptions.value[0].value
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("加载高温高压井使用设备失败")
  } finally {
    highTempPressureDeviceLoading.value = false
  }
}

const showCreateDialog = () => {
  Object.assign(createForm, {
    table_no: generateTableNo(),
    test_platform: "高温高压井测试台",
    test_date: todayText(),
    application_date: todayText(),
    use_device: "",
    device_name: "",
    device_number: "N/A",
    task_number: generateTaskNumber(),
    applicant_phone: "",
    test_application_unit: "",
    test_application_unit_manager: "",
    research_number: "",
    project_budget_number: "",
    project_name: "",
    client: "",
    planned_time: "",
    test_location: "",
    test_purpose: "",
    test_type: "",
    test_container: "",
    online_test: null,
    target_temp: "",
    target_pressure: 0,
    max_diameter: null,
    hold_time: null,
    applicant: "",
    project_members: "",
    equipment_list: "",
    instrument_combination: "",
    test_steps: "",
    safety_risks: "",
    remark: ""
  })
  instrumentFormList.value = [
    {
      instrument_name: "",
      instrument_sn: "",
      quantity: 1,
      instrument_length: "",
      max_diameter: null
    }
  ]
  createDialogVisible.value = true
  void loadHighTempPressureDeviceOptions()
}

const addInstrumentRow = () => {
  instrumentFormList.value.push({
    instrument_name: "",
    instrument_sn: "",
    quantity: 1,
    instrument_length: "",
    max_diameter: null
  })
}

const removeInstrumentRow = (index: number) => {
  if (instrumentFormList.value.length <= 1) return
  instrumentFormList.value.splice(index, 1)
}

const handleCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!canCreate.value) return
    createLoading.value = true
    try {
      const firstInstrument = instrumentFormList.value[0]
      createForm.target_temp = normalizeTargetTemperature(createForm.target_temp)
      createForm.device_name = firstInstrument.instrument_name
      createForm.device_number = firstInstrument.instrument_sn
      createForm.test_date = createForm.application_date
      const res = await createHighTempPressureOrderApi({
        ...createForm,
        instruments: instrumentFormList.value.map((i) => ({
          instrument_name: i.instrument_name,
          instrument_sn: i.instrument_sn,
          quantity: i.quantity,
          instrument_length: i.instrument_length || "",
          max_diameter: i.max_diameter ?? null
        }))
      })
      if (res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        void taskCenterStore.refresh(true)
        getList()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
    } catch (error) {
      console.error(error)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

const handleDetail = async (row: HighTempPressureOrderListItem) => {
  try {
    const res = await getHighTempPressureOrderDetailApi(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取详情失败")
  }
}

const showPublishDialog = async (row: HighTempPressureOrderListItem) => {
  resetPublishDialog()
  try {
    const res = await getHighTempPressureOrderDetailApi(row.id)
    if (res.code === 0) {
      publishOrder.value = res.data
      await loadStoredSignatureForPublish()
      publishDialogVisible.value = true
    } else {
      ElMessage.error(res.msg || "获取工单信息失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取工单信息失败")
  }
}

const handlePublishSignatureChange: UploadProps["onChange"] = (file: UploadFile) => {
  const raw = file.raw
  if (!raw) {
    publishSignatureFileList.value = []
    publishSignatureRawFile.value = null
    publishSignatureSource.value = ""
    if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
    publishSignatureObjectUrl.value = ""
    publishSignaturePreviewDataUrl.value = ""
    return
  }
  if (!raw.type.startsWith("image/")) {
    ElMessage.error("请上传图片格式的签名文件")
    publishSignatureFileList.value = []
    publishSignatureRawFile.value = null
    publishSignatureSource.value = ""
    if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
    publishSignatureObjectUrl.value = ""
    publishSignaturePreviewDataUrl.value = ""
    return
  }
  if (raw.size / 1024 / 1024 > 5) {
    ElMessage.error("签名图片大小不能超过 5MB")
    publishSignatureFileList.value = []
    publishSignatureRawFile.value = null
    publishSignatureSource.value = ""
    if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
    publishSignatureObjectUrl.value = ""
    publishSignaturePreviewDataUrl.value = ""
    return
  }

  publishSignatureRawFile.value = raw
  publishSignatureSource.value = "local"
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureObjectUrl.value = URL.createObjectURL(raw)
  publishSignaturePreviewDataUrl.value = ""
  const reader = new FileReader()
  reader.onload = () => {
    publishSignaturePreviewDataUrl.value = String(reader.result || "")
  }
  reader.readAsDataURL(raw)
  publishSignatureFileList.value = [
    {
      name: raw.name,
      url: publishSignatureObjectUrl.value,
      status: "success"
    }
  ]
}

const handlePublishSignatureRemove: UploadProps["onRemove"] = () => {
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureFileList.value = []
  publishSignatureRawFile.value = null
  publishSignatureSource.value = ""
  publishSignatureObjectUrl.value = ""
  publishSignaturePreviewDataUrl.value = ""
  signaturePreviewVisible.value = false
}

const handleReuploadSignature = () => {
  if (publishSignatureObjectUrl.value) URL.revokeObjectURL(publishSignatureObjectUrl.value)
  publishSignatureFileList.value = []
  publishSignatureRawFile.value = null
  publishSignatureSource.value = ""
  publishSignatureObjectUrl.value = ""
  publishSignaturePreviewDataUrl.value = ""
  signaturePreviewVisible.value = false
}

const setSanxinAnswer = (idx: number, answer: Exclude<SanxinAnswer, null>) => {
  sanxinTesterAnswers[idx] = answer
}

const openSignaturePreview = () => {
  if (!publishSignaturePreviewUrl.value) return
  signaturePreviewVisible.value = true
}

const handleConfirmPublish = async () => {
  if (!publishOrder.value || publishLoading.value || !validatePublishTestNumber()) return
  if (sanxinDoneCount.value !== 2) {
    ElMessage.warning("请完成测试方确认项（序号1-2）填写")
    return
  }
  if (!publishSignatureRawFile.value) {
    ElMessage.warning("请上传管理员电子签名")
    return
  }
  publishLoading.value = true
  try {
    const formData = new FormData()
    formData.append("test_number", publishTestNumber.value)
    formData.append("admin_signature", publishSignatureRawFile.value)
    formData.append("confirm_date", publishConfirmDate.value)
    formData.append("tester_item_1", sanxinTesterAnswers[0] || "")
    formData.append("tester_item_2", sanxinTesterAnswers[1] || "")
    formData.append("is_sanxin", sanxinHasRisk.value ? "1" : "0")
    const res = await publishHighTempPressureOrderApi(publishOrder.value.id, formData)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      publishDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("发布失败")
  } finally {
    publishLoading.value = false
  }
}

const handleDelete = async (row: HighTempPressureOrderListItem) => {
  await ElMessageBox.confirm("确认删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHighTempPressureOrderApi(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
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
          <el-form-item label="单号">
            <el-input v-model="searchForm.taskNumber" placeholder="测试单号/任务单号/表格编号" clearable />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
              <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="management-toolbar-actions">
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          :data="tableData"
          stripe
          border
          height="100%"
          class="high-pressure-order-table"
          table-layout="fixed"
          style="width: 100%"
        >
          <el-table-column prop="table_no" label="表格编号" min-width="110" align="center" />
          <el-table-column prop="task_number" label="任务单编号" min-width="130" align="center" />
          <el-table-column prop="test_number" label="测试单号" min-width="130" align="center" />
          <el-table-column prop="applicant" label="申请人" min-width="80" align="center" />
          <el-table-column prop="test_application_unit" label="测试申请单位" min-width="110" align="center" />
          <el-table-column label="待测仪器" min-width="130" align="center">
            <template #default="{ row }">
              <span>{{ row.instrument_names || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="仪器SN号" min-width="130" align="center">
            <template #default="{ row }">
              <span>{{ row.instrument_sns || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="测试类型" min-width="105" align="center">
            <template #default="{ row }">
              <span>{{ row.test_type || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="test_container" label="测试容器" min-width="100" align="center" />
          <el-table-column label="在线测试" min-width="90" align="center">
            <template #default="{ row }">{{ onlineTestText(row.online_test) }}</template>
          </el-table-column>
          <el-table-column label="待测数量" min-width="70" align="center">
            <template #default="{ row }">
              <span>{{ row.instrument_count ?? 0 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="使用设备" min-width="100" align="center">
            <template #default="{ row }">
              <span>{{ row.use_device || row.device_name || "-" }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" min-width="75" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="176" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
              <el-link v-if="row.status === 0" type="success" class="el-link" @click="showPublishDialog(row)"
                >发布</el-link
              >
              <el-link v-if="row.status === 0" type="danger" class="el-link" @click="handleDelete(row)">删除</el-link>
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

    <el-dialog
      v-model="createDialogVisible"
      title="创建高温高压井工单"
      width="1080px"
      :close-on-click-modal="false"
      class="high-pressure-order-dialog"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="150px">
        <el-divider content-position="left">基础信息</el-divider>
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
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" placeholder="请输入申请人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人电话" prop="applicant_phone">
              <el-input v-model="createForm.applicant_phone" placeholder="请输入申请人电话" />
            </el-form-item>
          </el-col>
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
          <el-col :span="12">
            <el-form-item label="申请日期" prop="application_date">
              <el-date-picker
                v-model="createForm.application_date"
                type="date"
                placeholder="选择申请日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托人" prop="client">
              <el-input v-model="createForm.client" placeholder="请输入委托人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">项目信息</el-divider>
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
          <el-col :span="24">
            <el-form-item label="项目成员" prop="project_members">
              <el-input v-model="createForm.project_members" placeholder="多个成员可用顿号或逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">待测仪器</el-divider>
        <el-form-item label="待测仪器">
          <div style="width: 100%">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px">
              <el-button type="primary" icon="CirclePlus" @click="addInstrumentRow">新增仪器</el-button>
            </div>
            <el-table :data="instrumentFormList" border style="width: 100%">
              <el-table-column label="待测仪器" min-width="160" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.instrument_name" placeholder="请输入待测仪器" />
                </template>
              </el-table-column>
              <el-table-column label="仪器SN号" min-width="160" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.instrument_sn" placeholder="多个编号用逗号分隔" />
                </template>
              </el-table-column>
              <el-table-column label="数量" width="140" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.quantity"
                    :min="1"
                    :step="1"
                    step-strictly
                    controls-position="right"
                    size="small"
                    class="quantity-input"
                  />
                </template>
              </el-table-column>
              <el-table-column label="仪器长度" width="130" align="center">
                <template #default="{ row }">
                  <el-input v-model="row.instrument_length" placeholder="mm" />
                </template>
              </el-table-column>
              <el-table-column label="最大直径(mm)" width="130" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.max_diameter"
                    :min="0"
                    :step="1"
                    step-strictly
                    :controls="false"
                    size="small"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ $index }">
                  <el-button
                    type="danger"
                    :disabled="instrumentFormList.length <= 1"
                    @click="removeInstrumentRow($index)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-divider content-position="left">测试参数</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时间" prop="planned_time">
              <el-date-picker
                v-model="createForm.planned_time"
                type="datetime"
                placeholder="请选择时间"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用设备" prop="use_device">
              <el-select
                v-model="createForm.use_device"
                placeholder="请选择高温高压井设备"
                filterable
                :loading="highTempPressureDeviceLoading"
                style="width: 100%"
              >
                <el-option
                  v-for="item in highTempPressureDeviceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试类型" prop="test_type">
              <el-select v-model="createForm.test_type" placeholder="请选择测试类型" style="width: 100%">
                <el-option v-for="item in testTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试容器" prop="test_container">
              <el-select v-model="createForm.test_container" placeholder="请选择测试容器" style="width: 100%">
                <el-option v-for="item in testContainerOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否在线测试" prop="online_test">
              <el-select v-model="createForm.online_test" placeholder="请选择是否在线测试" style="width: 100%">
                <el-option label="是" :value="true" />
                <el-option label="否" :value="false" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试地点" prop="test_location">
              <el-input v-model="createForm.test_location" placeholder="请输入测试地点" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标温度" prop="target_temp">
              <el-input
                v-model="createForm.target_temp"
                maxlength="100"
                show-word-limit
                placeholder="请输入温度，如 120、常温、120~150"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="压力(MPa)" prop="target_pressure">
              <el-input-number v-model="createForm.target_pressure" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="保温保压时间(分)" prop="hold_time">
              <el-input-number v-model="createForm.hold_time" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">测试说明</el-divider>
        <el-form-item label="测试目的" prop="test_purpose">
          <el-input v-model="createForm.test_purpose" type="textarea" :rows="3" placeholder="请输入测试目的" />
        </el-form-item>
        <el-form-item label="设备清单" prop="equipment_list">
          <el-input v-model="createForm.equipment_list" type="textarea" :rows="3" placeholder="请输入设备清单" />
        </el-form-item>
        <el-form-item label="仪器串组合" prop="instrument_combination">
          <el-input v-model="createForm.instrument_combination" placeholder="请输入仪器串组合" />
        </el-form-item>
        <el-form-item label="测试步骤" prop="test_steps">
          <el-input v-model="createForm.test_steps" type="textarea" :rows="4" placeholder="请输入测试步骤" />
        </el-form-item>
        <el-form-item label="安全风险及预防措施" prop="safety_risks">
          <el-input
            v-model="createForm.safety_risks"
            type="textarea"
            :rows="4"
            placeholder="请输入安全风险及预防措施"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="publishDialogVisible"
      :width="publishStep === 'number' ? '460px' : '920px'"
      :show-close="!publishLoading"
      :close-on-press-escape="!publishLoading"
      :close-on-click-modal="false"
      class="publish-dialog"
      @closed="resetPublishDialog"
    >
      <template #header>
        <div class="publish-dialog-header">
          <div>
            <div class="publish-dialog-title">
              {{ publishStep === "number" ? "填写测试单号" : '工单分配 · "三新"测试确认单填写' }}
            </div>
            <div v-if="publishStep === 'confirmation'" class="publish-dialog-subtitle">
              WT3-TC/ZZ-01-R04 · v1.0 | 测试方确认项由管理员填写
            </div>
          </div>
        </div>
      </template>
      <el-form v-if="publishStep === 'number'" label-width="100px" @submit.prevent="nextPublishStep">
        <el-form-item label="测试单号" required>
          <el-input v-model="publishTestNumber" maxlength="100" show-word-limit placeholder="请输入唯一的测试单号" />
        </el-form-item>
      </el-form>
      <div v-show="publishStep === 'confirmation'" class="publish-wrap">
        <el-row :gutter="20">
          <el-col :span="14">
            <el-card v-if="publishOrder" shadow="never" class="publish-card">
              <template #header>
                <div class="publish-card-title">工单信息</div>
              </template>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="工单编号">{{ publishOrder.task_number }}</el-descriptions-item>
                <el-descriptions-item label="测试单号">{{ publishTestNumber }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusType(publishOrder.status)">{{
                    publishOrder.status_text || publishOrder.status
                  }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="设备名称">{{ publishOrder.device_name || "-" }}</el-descriptions-item>
                <el-descriptions-item label="设备编号">{{ publishOrder.device_number || "-" }}</el-descriptions-item>
                <el-descriptions-item label="目标温度">{{
                  formatTargetTemperature(publishOrder.target_temp)
                }}</el-descriptions-item>
                <el-descriptions-item label="目标压力">{{ publishOrder.target_pressure }}MPa</el-descriptions-item>
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
                    是（不合格）
                  </el-button>
                  <el-button
                    :type="sanxinTesterAnswers[idx] === 'no' ? 'success' : undefined"
                    :plain="sanxinTesterAnswers[idx] !== 'no'"
                    @click="setSanxinAnswer(idx, 'no')"
                  >
                    否（合格）
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
        <el-button :disabled="publishLoading" @click="publishDialogVisible = false">取消</el-button>
        <el-button v-if="publishStep === 'number'" type="primary" @click="nextPublishStep">下一步</el-button>
        <el-button v-else :disabled="publishLoading" @click="publishStep = 'number'">返回修改单号</el-button>
        <el-button
          v-if="publishStep === 'confirmation'"
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

    <el-drawer
      v-model="detailDialogVisible"
      title="工单详情"
      size="var(--test-order-detail-drawer-size)"
      class="test-order-detail-drawer"
    >
      <div v-if="currentOrder" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="表格编号">{{ currentOrder.table_no || "-" }}</el-descriptions-item>
          <el-descriptions-item label="任务单号">{{ currentOrder.task_number }}</el-descriptions-item>
          <el-descriptions-item label="测试单号">{{ currentOrder.test_number }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.status_text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试台">{{ currentOrder.test_platform }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请人电话">{{ currentOrder.applicant_phone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试申请单位">{{
            currentOrder.test_application_unit || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="单位负责人">
            {{ currentOrder.test_application_unit_manager || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentOrder.application_date || "-" }}</el-descriptions-item>
          <el-descriptions-item label="委托人">{{ currentOrder.client || "-" }}</el-descriptions-item>
          <el-descriptions-item label="科研编号">{{ currentOrder.research_number || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目预算编号">
            {{ currentOrder.project_budget_number || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="项目名称" :span="2">{{ currentOrder.project_name || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentOrder.device_name }}</el-descriptions-item>
          <el-descriptions-item label="设备编号">{{ currentOrder.device_number }}</el-descriptions-item>
          <el-descriptions-item label="测试类型">{{ currentOrder.test_type || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试容器">{{ currentOrder.test_container || "未填写" }}</el-descriptions-item>
          <el-descriptions-item label="是否在线测试">{{
            onlineTestText(currentOrder.online_test)
          }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentOrder.planned_time || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试地点" :span="2">{{
            currentOrder.test_location || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="目标温度">{{
            formatTargetTemperature(currentOrder.target_temp)
          }}</el-descriptions-item>
          <el-descriptions-item label="目标压力(MPa)">{{ currentOrder.target_pressure }}</el-descriptions-item>
          <el-descriptions-item label="保温保压时间(分)">{{ currentOrder.hold_time ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ currentOrder.test_date }}</el-descriptions-item>
          <el-descriptions-item label="项目成员" :span="2">{{
            currentOrder.project_members || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="测试目的" :span="2">{{ currentOrder.test_purpose || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备清单" :span="2">{{
            currentOrder.equipment_list || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="仪器串组合" :span="2">
            {{ currentOrder.instrument_combination || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="测试步骤" :span="2">{{ currentOrder.test_steps || "-" }}</el-descriptions-item>
          <el-descriptions-item label="安全风险及预防措施" :span="2">
            {{ currentOrder.safety_risks || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.created_at }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">待测仪器</div>
        <el-table :data="currentOrder.instruments || []" border stripe>
          <el-table-column prop="instrument_name" label="待测仪器" min-width="130" align="center" />
          <el-table-column prop="instrument_sn" label="仪器SN号/资产号" min-width="150" align="center" />
          <el-table-column prop="quantity" label="数量" width="76" align="center" />
          <el-table-column prop="instrument_length" label="仪器长度" width="96" align="center" />
          <el-table-column prop="max_diameter" label="最大直径" width="96" align="center" />
        </el-table>
      </div>
    </el-drawer>
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
  width: 100%;
  margin-bottom: 20px;
  overflow-x: hidden;
}

.table-wrapper :deep(.high-pressure-order-table) {
  width: 100%;
}

.table-wrapper :deep(.el-table__inner-wrapper),
.table-wrapper :deep(.el-table__header-wrapper),
.table-wrapper :deep(.el-table__body-wrapper) {
  width: 100%;
}

.table-wrapper :deep(.el-table__body-wrapper) {
  overflow-x: hidden;
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.el-link {
  margin: 0 4px;
}

.quantity-input {
  width: 108px;
}

.detail-section-title {
  margin: 18px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

:deep(.high-pressure-order-dialog .el-dialog__body) {
  max-height: 68vh;
  overflow-y: auto;
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
