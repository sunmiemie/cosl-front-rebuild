<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue"
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type UploadFile,
  type UploadProps,
  type UploadUserFile
} from "element-plus"
import {
  createSimulatedWellReportTemplateApi,
  deleteSimulatedWellReportTemplateApi,
  getSimulatedWellReportTemplateDetailApi,
  getSimulatedWellReportTemplateListApi,
  parseSimulatedWellReportTemplateDocxApi,
  updateSimulatedWellReportTemplateApi
} from "@/api/simulated-well-report-template"
import { VueDraggable } from "vue-draggable-plus"

type SectionKey = "test_products" | "match_instruments" | "test_items" | "evaluation_standards"

type TemplateField = {
  nameCN: string
  nameEN: string
  type?: FieldType
  required?: boolean
  defaultValue?: string
  needsReview?: boolean
  [key: string]: any
}

type TemplateItem = {
  id: number
  report_no: string
  report_name: string
  report_name_en: string
  configured: boolean
  field_count: number
  updated_at: string
}

const loading = ref(false)
const configSaving = ref(false)
const keyword = ref("")
const pageMode = ref<"list" | "config">("list")
const activeSection = ref<SectionKey>("test_products")
const currentTemplateId = ref<number | null>(null)

const templates = ref<TemplateItem[]>([])

const configDraft = reactive<Record<SectionKey, TemplateField[]>>({
  test_products: [],
  match_instruments: [],
  test_items: [],
  evaluation_standards: []
})
const configMetaDraft = reactive({
  report_no: "",
  report_name: "",
  report_name_en: ""
})
const titleEditDialogVisible = ref(false)
const titleEditDraft = reactive({
  report_name: "",
  report_name_en: ""
})
const sectionTabs = [
  { key: "test_products" as SectionKey, label: "测试产品" },
  { key: "match_instruments" as SectionKey, label: "配接仪器" },
  { key: "test_items" as SectionKey, label: "测试项目" },
  { key: "evaluation_standards" as SectionKey, label: "评价标准" }
]

const filteredTemplates = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return templates.value
  return templates.value.filter((t) =>
    `${t.report_no} ${t.report_name} ${t.report_name_en || ""}`.toLowerCase().includes(k)
  )
})

const currentTemplate = computed(() => templates.value.find((t) => t.id === currentTemplateId.value) || null)

const currentFieldList = computed<TemplateField[]>({
  get: () => configDraft[activeSection.value],
  set: (fields) => {
    configDraft[activeSection.value] = fields
  }
})
const currentSectionLabel = computed(() => sectionTabs.find((s) => s.key === activeSection.value)?.label || "字段")

const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  report_no: "",
  report_name: "",
  report_name_en: ""
})
const createDocxFileList = ref<UploadUserFile[]>([])
const createDocxLoading = ref(false)
const createParsedFields = reactive<Record<SectionKey, TemplateField[]>>({
  test_products: [],
  match_instruments: [],
  test_items: [],
  evaluation_standards: []
})
const createRules = {
  report_no: [{ required: true, message: "请输入报告编号", trigger: "blur" }],
  report_name: [{ required: true, message: "请输入报告名称", trigger: "blur" }]
}

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "radio"
  | "date"
  | "select"
  | "checkbox"
  | "depth-group"
  | "range-radio"
  | "multi-input-row"
  | "sampling-group"
  | "card-group"

const fieldTypeOptions = [
  {
    label: "基础类型",
    options: [
      { value: "text", label: "文本输入" },
      { value: "textarea", label: "多行文本" },
      { value: "number", label: "数字" },
      { value: "radio", label: "正常/异常判定" },
      { value: "date", label: "日期" },
      { value: "select", label: "下拉选择" },
      { value: "checkbox", label: "复选框" }
    ]
  },
  {
    label: "复合类型",
    options: [
      { value: "depth-group", label: "深度输入组" },
      { value: "range-radio", label: "区间+判定" },
      { value: "multi-input-row", label: "多列复合行" },
      { value: "sampling-group", label: "取样测试组" },
      { value: "card-group", label: "数据卡片组" }
    ]
  }
] as const

const compoundTypes: FieldType[] = ["depth-group", "range-radio", "multi-input-row", "sampling-group", "card-group"]
const addFieldDialogVisible = ref(false)
const editFieldDialogVisible = ref(false)
const editFieldForm = reactive({
  nameCN: "",
  nameEN: ""
})
const editingField = ref<{
  section: SectionKey
  index: number
  originalValue: TemplateField
} | null>(null)
const addFieldForm = reactive({
  type: "text" as FieldType,
  nameCN: "",
  nameEN: "",
  defaultValue: "",
  required: false,
  depthPointCount: 4,
  depthUnit: "m",
  depthWithJudgment: false,
  rangeUnit: "m",
  multiRowCount: 2,
  samplingPointCount: 2
})

const isCompoundType = computed(() => compoundTypes.includes(addFieldForm.type))

const normalizeField = (item: any): TemplateField => {
  if (typeof item === "string") {
    return { nameCN: item.trim(), nameEN: "" }
  }
  return {
    ...(item || {}),
    nameCN: String(item?.nameCN ?? item?.zh ?? item?.name ?? item?.label ?? "").trim(),
    nameEN: String(item?.nameEN ?? item?.en ?? item?.english ?? "").trim()
  }
}

const normalizeFields = (items: any[] | undefined) => (Array.isArray(items) ? items.map(normalizeField) : [])

const cleanFields = (items: TemplateField[]) =>
  items
    .map((item) => ({ ...item, nameCN: item.nameCN.trim(), nameEN: item.nameEN.trim() }))
    .filter((item) => item.nameCN || item.nameEN)

const fieldName = (item: TemplateField) => item.nameCN || item.nameEN || "未命名字段"
const fieldTypeName = (item: TemplateField) =>
  fieldTypeOptions.flatMap((group) => [...group.options]).find((option) => option.value === item.type)?.label ||
  "文本输入"

const addParsedField = (section: SectionKey) => {
  createParsedFields[section].push({ nameCN: "", nameEN: "" })
}

const removeParsedField = (section: SectionKey, index: number) => {
  createParsedFields[section].splice(index, 1)
}

const openCreate = () => {
  createForm.report_no = ""
  createForm.report_name = ""
  createForm.report_name_en = ""
  createDocxFileList.value = []
  createParsedFields.test_products = []
  createParsedFields.match_instruments = []
  createParsedFields.test_items = []
  createParsedFields.evaluation_standards = []
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await createSimulatedWellReportTemplateApi({
      report_no: createForm.report_no.trim(),
      report_name: createForm.report_name.trim(),
      report_name_en: createForm.report_name_en.trim(),
      test_products: cleanFields(createParsedFields.test_products),
      match_instruments: cleanFields(createParsedFields.match_instruments),
      test_items: cleanFields(createParsedFields.test_items),
      evaluation_standards: cleanFields(createParsedFields.evaluation_standards)
    })
    if (res.code !== 0) {
      ElMessage.error(res.msg || "创建失败")
      return
    }
    createDialogVisible.value = false
    ElMessage.success("已新增模板")
    await fetchList()
  })
}

const handleCreateDocxChange: UploadProps["onChange"] = async (file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  if (!raw.name.toLowerCase().endsWith(".docx")) {
    ElMessage.error("请上传 .docx 格式文件")
    createDocxFileList.value = []
    return
  }

  const formData = new FormData()
  formData.append("file", raw)
  createDocxLoading.value = true
  try {
    const res = await parseSimulatedWellReportTemplateDocxApi(formData)
    if (res.code !== 0) {
      ElMessage.error(res.msg || "文档解析失败")
      createDocxFileList.value = []
      return
    }
    createForm.report_no = res.data.report_no || createForm.report_no
    createForm.report_name = res.data.report_name || createForm.report_name
    createForm.report_name_en = res.data.report_name_en || createForm.report_name_en
    createParsedFields.test_products = normalizeFields(res.data.test_products)
    createParsedFields.match_instruments = normalizeFields(res.data.match_instruments)
    createParsedFields.test_items = normalizeFields(res.data.test_items)
    createParsedFields.evaluation_standards = normalizeFields(res.data.evaluation_standards)
    createDocxFileList.value = [{ name: raw.name, status: "success" }]
    ElMessage.success("文档解析成功，已自动回填")
  } finally {
    createDocxLoading.value = false
  }
}

const handleDelete = async (row: TemplateItem) => {
  await ElMessageBox.confirm(`确认删除模板「${row.report_name}」吗？`, "确认删除", { type: "warning" })
  const res = await deleteSimulatedWellReportTemplateApi(row.id)
  if (res.code === 0) {
    ElMessage.success("已删除")
    await fetchList()
    return
  }
  ElMessage.error(res.msg || "删除失败")
}

const openConfig = (row: TemplateItem) => {
  currentTemplateId.value = row.id
  activeSection.value = "test_products"
  configMetaDraft.report_no = row.report_no
  configMetaDraft.report_name = row.report_name
  configMetaDraft.report_name_en = row.report_name_en || ""
  pageMode.value = "config"
  fetchDetail(row.id)
}

const saveConfig = async () => {
  const t = currentTemplate.value
  if (!t || configSaving.value) return
  const reportName = configMetaDraft.report_name.trim()
  const reportNameEn = configMetaDraft.report_name_en.trim()
  if (!reportName) {
    ElMessage.warning("模板名称（中文）不能为空")
    return
  }
  configSaving.value = true
  try {
    const res = await updateSimulatedWellReportTemplateApi(t.id, {
      report_name: reportName,
      report_name_en: reportNameEn,
      test_products: cleanFields(configDraft.test_products),
      match_instruments: cleanFields(configDraft.match_instruments),
      test_items: cleanFields(configDraft.test_items),
      evaluation_standards: cleanFields(configDraft.evaluation_standards)
    })
    if (res.code === 0) {
      configMetaDraft.report_name = reportName
      configMetaDraft.report_name_en = reportNameEn
      ElMessage.success("配置已保存")
      await fetchList()
      return
    }
    ElMessage.error(res.msg || "保存失败")
  } finally {
    configSaving.value = false
  }
}

const backToList = () => {
  pageMode.value = "list"
}

const openTitleEditDialog = () => {
  titleEditDraft.report_name = configMetaDraft.report_name
  titleEditDraft.report_name_en = configMetaDraft.report_name_en
  titleEditDialogVisible.value = true
}

const resetTitleEditDialog = () => {
  titleEditDraft.report_name = ""
  titleEditDraft.report_name_en = ""
}

const applyTitleEdit = () => {
  const reportName = titleEditDraft.report_name.trim()
  const reportNameEn = titleEditDraft.report_name_en.trim()
  if (!reportName) {
    ElMessage.warning("模板名称（中文）不能为空")
    return
  }
  configMetaDraft.report_name = reportName
  configMetaDraft.report_name_en = reportNameEn
  titleEditDialogVisible.value = false
}

const addField = () => {
  const nameCN = addFieldForm.nameCN.trim()
  const nameEN = addFieldForm.nameEN.trim()
  if (!nameCN) return
  if (currentFieldList.value.some((item) => item.nameCN === nameCN)) {
    ElMessage.warning("字段已存在")
    return
  }
  const field: TemplateField = {
    nameCN,
    nameEN,
    type: addFieldForm.type,
    required: addFieldForm.required
  }
  if (addFieldForm.defaultValue.trim()) field.defaultValue = addFieldForm.defaultValue.trim()
  if (addFieldForm.type === "depth-group") {
    field.pointCount = addFieldForm.depthPointCount
    field.unit = addFieldForm.depthUnit
    field.withJudgment = addFieldForm.depthWithJudgment
  } else if (addFieldForm.type === "range-radio") {
    field.unit = addFieldForm.rangeUnit
  } else if (addFieldForm.type === "multi-input-row") {
    field.rowCount = addFieldForm.multiRowCount
  } else if (addFieldForm.type === "sampling-group") {
    field.pointCount = addFieldForm.samplingPointCount
  }
  currentFieldList.value.push(field)
  addFieldDialogVisible.value = false
}

const openAddFieldDialog = () => {
  addFieldForm.type = "text"
  addFieldForm.nameCN = ""
  addFieldForm.nameEN = ""
  addFieldForm.defaultValue = ""
  addFieldForm.required = false
  addFieldForm.depthPointCount = 4
  addFieldForm.depthUnit = "m"
  addFieldForm.depthWithJudgment = false
  addFieldForm.rangeUnit = "m"
  addFieldForm.multiRowCount = 2
  addFieldForm.samplingPointCount = 2
  addFieldDialogVisible.value = true
}

const removeField = (idx: number) => {
  currentFieldList.value.splice(idx, 1)
}

const openEditFieldDialog = (idx: number) => {
  const section = activeSection.value
  const originalValue = configDraft[section][idx]
  if (originalValue === undefined) return
  editingField.value = { section, index: idx, originalValue: { ...originalValue } }
  editFieldForm.nameCN = originalValue.nameCN
  editFieldForm.nameEN = originalValue.nameEN
  editFieldDialogVisible.value = true
}

const closeEditFieldDialog = () => {
  editFieldDialogVisible.value = false
  editingField.value = null
  editFieldForm.nameCN = ""
  editFieldForm.nameEN = ""
}

const confirmEditField = () => {
  const editing = editingField.value
  if (!editing) return

  const nameCN = editFieldForm.nameCN.trim()
  const nameEN = editFieldForm.nameEN.trim()
  if (!nameCN) {
    ElMessage.warning("字段名称不能为空")
    return
  }
  if (nameCN === editing.originalValue.nameCN && nameEN === editing.originalValue.nameEN) {
    closeEditFieldDialog()
    return
  }

  const fields = configDraft[editing.section]
  if (fields.some((item, index) => index !== editing.index && item.nameCN === nameCN)) {
    ElMessage.warning("字段已存在")
    return
  }

  fields[editing.index] = { ...editing.originalValue, nameCN, nameEN }
  closeEditFieldDialog()
}

const handleSync = async () => {
  await fetchList()
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellReportTemplateListApi({
      keyword: keyword.value.trim(),
      currentPage: 1,
      pageSize: 2000
    })
    if (res.code === 0) {
      templates.value = res.data.list
      return
    }
    ElMessage.error(res.msg || "获取列表失败")
  } finally {
    loading.value = false
  }
}

const fetchDetail = async (id: number) => {
  loading.value = true
  try {
    const res = await getSimulatedWellReportTemplateDetailApi(id)
    if (res.code === 0) {
      configMetaDraft.report_no = res.data.report_no
      configMetaDraft.report_name = res.data.report_name
      configMetaDraft.report_name_en = res.data.report_name_en || ""
      configDraft.test_products = normalizeFields(res.data.test_products)
      configDraft.match_instruments = normalizeFields(res.data.match_instruments)
      configDraft.test_items = normalizeFields(res.data.test_items)
      configDraft.evaluation_standards = normalizeFields(res.data.evaluation_standards)
      return
    }
    ElMessage.error(res.msg || "获取详情失败")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <div class="simwell-template-page">
    <div class="header">
      <div>
        <h1 class="header-title">
          <template v-if="pageMode === 'list'">模板配置</template>
          <template v-else>
            <span>配置：{{ configMetaDraft.report_name || "-" }}</span>
            <el-button
              class="title-edit-button"
              link
              type="primary"
              circle
              icon="EditPen"
              title="编辑模板标题"
              aria-label="编辑模板标题"
              @click="openTitleEditDialog"
            />
          </template>
        </h1>
        <div v-if="pageMode === 'config' && configMetaDraft.report_name_en" class="header-subtitle">
          {{ configMetaDraft.report_name_en }}
        </div>
      </div>
      <div class="header-actions">
        <template v-if="pageMode === 'list'">
          <el-button type="primary" icon="RefreshRight" :loading="loading" @click="handleSync">同步模板</el-button>
          <el-button type="success" icon="CirclePlus" @click="openCreate">新增模板</el-button>
        </template>
        <template v-else>
          <el-button @click="backToList">返回列表</el-button>
          <el-button type="primary" :loading="configSaving" @click="saveConfig">保存配置</el-button>
        </template>
      </div>
    </div>

    <div class="content-wrapper" v-if="pageMode === 'list'">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">选择要配置的模板</div>
            <el-input v-model="keyword" placeholder="搜索模板编号、模板名称..." clearable style="width: 360px" />
          </div>
        </template>

        <div class="template-grid">
          <div v-for="item in filteredTemplates" :key="item.id" class="template-card">
            <div class="template-card-top">
              <div class="template-code">{{ item.report_no }}</div>
              <el-tag :type="item.configured ? 'success' : 'warning'" effect="light">
                {{ item.configured ? "已配置" : "待配置" }}
              </el-tag>
            </div>
            <div class="template-card-title">{{ item.report_name }}</div>
            <div v-if="item.report_name_en" class="template-card-name-en">{{ item.report_name_en }}</div>
            <div class="muted">配置字段：{{ item.field_count }} 个</div>
            <div class="template-card-footer">
              <div class="muted">更新：{{ item.updated_at }}</div>
              <div class="actions">
                <el-button size="small" @click="openConfig(item)">编辑配置</el-button>
                <el-button link type="danger" @click="handleDelete(item)">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="content-wrapper" v-else>
      <el-card shadow="never">
        <template #header>
          <div class="card-title">配置分类</div>
        </template>
        <div class="tabs-wrap">
          <el-button
            v-for="tab in sectionTabs"
            :key="tab.key"
            :type="activeSection === tab.key ? 'primary' : undefined"
            @click="activeSection = tab.key"
          >
            {{ tab.label }}（{{ configDraft[tab.key].length }}）
          </el-button>
        </div>
      </el-card>

      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <div class="card-title">{{ currentSectionLabel }}字段</div>
            <el-button type="success" icon="CirclePlus" @click="openAddFieldDialog">添加字段</el-button>
          </div>
        </template>

        <VueDraggable
          v-model="currentFieldList"
          tag="div"
          class="field-list"
          handle=".field-drag-handle"
          :animation="150"
          ghost-class="field-drag-ghost"
          chosen-class="field-drag-chosen"
        >
          <div
            v-for="(item, idx) in currentFieldList"
            :key="[activeSection, idx, item.nameCN].join('-')"
            class="field-item"
          >
            <button type="button" class="field-drag-handle" title="拖动排序" aria-label="拖动排序">⠿</button>
            <div class="field-card-main">
              <div class="field-card-title">
                {{ fieldName(item) }}
              </div>
              <div v-if="item.nameEN" class="field-card-english">{{ item.nameEN }}</div>
              <div class="field-card-meta">
                类型：<span class="field-type-badge">{{ fieldTypeName(item) }}</span>
                <span class="field-card-separator">|</span>
                来源：{{ currentSectionLabel }}
              </div>
            </div>
            <div class="field-actions">
              <el-button link type="primary" @click="openEditFieldDialog(idx)">编辑</el-button>
              <el-button link type="danger" @click="removeField(idx)">删除</el-button>
            </div>
          </div>
        </VueDraggable>
        <el-empty v-if="currentFieldList.length === 0" description="暂无字段，请点击上方“添加字段”" />
      </el-card>
    </div>

    <el-dialog
      v-model="titleEditDialogVisible"
      title="编辑模板标题"
      width="480px"
      class="simwell-admin-dialog"
      :close-on-click-modal="false"
      @closed="resetTitleEditDialog"
    >
      <el-form label-position="top" @submit.prevent="applyTitleEdit">
        <el-form-item label="模板名称（中文）">
          <el-input v-model="titleEditDraft.report_name" autofocus @keyup.enter="applyTitleEdit" />
        </el-form-item>
        <el-form-item label="模板名称（英文，可选）">
          <el-input v-model="titleEditDraft.report_name_en" @keyup.enter="applyTitleEdit" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="titleEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applyTitleEdit">应用修改</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editFieldDialogVisible"
      title="编辑字段"
      width="480px"
      class="simwell-admin-dialog"
      @closed="closeEditFieldDialog"
    >
      <el-form label-position="top" @submit.prevent="confirmEditField">
        <el-form-item label="字段名称（中文）">
          <el-input v-model="editFieldForm.nameCN" autofocus @keyup.enter="confirmEditField" />
        </el-form-item>
        <el-form-item label="字段名称（英文，可选）">
          <el-input v-model="editFieldForm.nameEN" @keyup.enter="confirmEditField" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEditFieldDialog">取消</el-button>
        <el-button type="primary" @click="confirmEditField">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="createDialogVisible"
      title="新增配置模板"
      width="820px"
      class="simwell-admin-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-position="top">
        <el-form-item label="报告上传">
          <el-upload
            v-model:file-list="createDocxFileList"
            class="docx-upload"
            drag
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".docx"
            :on-change="handleCreateDocxChange"
          >
            <div class="upload-area-icon">📄</div>
            <div class="upload-area-text">
              {{ createDocxLoading ? "正在解析文档..." : "点击或拖拽 docx 报告到此处上传" }}
            </div>
            <div class="upload-area-hint">保留现有 docx 读取解析功能，解析后自动回填下方字段</div>
          </el-upload>
        </el-form-item>

        <div class="dialog-form-grid two-col">
          <el-form-item label="模板编号 *" prop="report_no">
            <el-input v-model="createForm.report_no" placeholder="例如：WT3-TCZZ-02-R35" />
          </el-form-item>
          <el-form-item label="模板名称（中文）*" prop="report_name">
            <el-input v-model="createForm.report_name" placeholder="例如：CBMT61XA南区水泥胶结测井仪" />
          </el-form-item>
        </div>
        <el-form-item label="模板名称（英文）">
          <el-input v-model="createForm.report_name_en" placeholder="例如：RIH Test Report of CBMT61XA" />
        </el-form-item>

        <div class="parsed-field-panel">
          <div class="compound-panel-title">解析字段预览与调整</div>
          <div v-for="section in sectionTabs" :key="section.key" class="parsed-section">
            <div class="parsed-section-header">
              <span>{{ section.label }}</span>
              <el-button link type="primary" @click="addParsedField(section.key)">添加</el-button>
            </div>
            <div
              v-for="(field, index) in createParsedFields[section.key]"
              :key="[section.key, index].join('-')"
              class="parsed-field-row"
            >
              <el-input v-model="field.nameCN" placeholder="中文名称" />
              <el-input v-model="field.nameEN" placeholder="English name" />
              <div class="parsed-field-actions">
                <el-tag v-if="field.needsReview" type="warning" size="small">需确认</el-tag>
                <el-button link type="danger" @click="removeParsedField(section.key, index)">删除</el-button>
              </div>
            </div>
            <div v-if="createParsedFields[section.key].length === 0" class="parsed-section-empty">暂无字段</div>
          </div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="addFieldDialogVisible"
      title="添加新字段"
      width="640px"
      class="simwell-admin-dialog"
      :close-on-click-modal="false"
    >
      <el-form label-position="top">
        <el-form-item label="字段类型">
          <el-select v-model="addFieldForm.type" style="width: 100%">
            <el-option-group v-for="group in fieldTypeOptions" :key="group.label" :label="group.label">
              <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="字段名称（中文）">
          <el-input v-model="addFieldForm.nameCN" placeholder="例如：测试产品名称" @keyup.enter="addField" />
        </el-form-item>
        <el-form-item label="字段名称（英文，可选）">
          <el-input v-model="addFieldForm.nameEN" placeholder="例如：Product Name" />
        </el-form-item>

        <div v-if="!isCompoundType" class="simple-field-config">
          <el-form-item label="默认值（可选）">
            <el-input v-model="addFieldForm.defaultValue" />
          </el-form-item>
        </div>

        <div v-else class="compound-config-container">
          <div v-if="addFieldForm.type === 'depth-group'" class="compound-panel">
            <div class="compound-panel-title">深度输入组配置</div>
            <div class="dialog-form-grid two-col">
              <el-form-item label="测试点数量">
                <el-input-number v-model="addFieldForm.depthPointCount" :min="1" :max="20" style="width: 100%" />
              </el-form-item>
              <el-form-item label="单位">
                <el-input v-model="addFieldForm.depthUnit" placeholder="m" />
              </el-form-item>
            </div>
            <el-checkbox v-model="addFieldForm.depthWithJudgment">每个测试点包含正常/不正常判定</el-checkbox>
          </div>

          <div v-if="addFieldForm.type === 'range-radio'" class="compound-panel">
            <div class="compound-panel-title">区间+判定配置</div>
            <el-form-item label="单位">
              <el-input v-model="addFieldForm.rangeUnit" placeholder="m" />
            </el-form-item>
          </div>

          <div v-if="addFieldForm.type === 'multi-input-row'" class="compound-panel">
            <div class="compound-panel-title">多列复合行配置</div>
            <el-form-item label="行数">
              <el-input-number v-model="addFieldForm.multiRowCount" :min="1" :max="50" style="width: 100%" />
            </el-form-item>
            <div class="dynamic-list-item">
              <span class="item-label">中文</span>
              <el-input placeholder="标签" />
              <span class="item-label">EN</span>
              <el-input placeholder="Label" />
              <span class="item-label">单位</span>
              <el-input placeholder="m" style="max-width: 80px" />
            </div>
            <button type="button" class="add-item-btn">+ 添加列</button>
          </div>

          <div v-if="addFieldForm.type === 'sampling-group'" class="compound-panel">
            <div class="compound-panel-title">取样测试组配置</div>
            <el-form-item label="取样点数">
              <el-input-number v-model="addFieldForm.samplingPointCount" :min="1" :max="20" style="width: 100%" />
            </el-form-item>
            <div class="dynamic-list-item">
              <span class="item-label">中文</span>
              <el-input placeholder="子项名称" />
              <span class="item-label">EN</span>
              <el-input placeholder="Item Name" />
            </div>
            <button type="button" class="add-item-btn">+ 添加子项</button>
          </div>

          <div v-if="addFieldForm.type === 'card-group'" class="compound-panel">
            <div class="compound-panel-title">数据卡片组配置</div>
            <div class="card-config-block">
              <div class="card-config-header">
                <span class="item-label">标题</span>
                <el-input placeholder="卡片标题" />
                <span class="item-label">EN</span>
                <el-input placeholder="Card Title" />
              </div>
              <div class="card-fields-label">卡片字段</div>
              <div class="dynamic-list-item">
                <span class="item-label">中文</span>
                <el-input placeholder="字段名" />
                <span class="item-label">EN</span>
                <el-input placeholder="Field" />
                <span class="item-label">单位</span>
                <el-input placeholder="单位" style="max-width: 80px" />
              </div>
              <button type="button" class="add-item-btn">+ 添加字段</button>
            </div>
            <button type="button" class="add-item-btn">+ 添加卡片</button>
          </div>
        </div>

        <el-checkbox v-model="addFieldForm.required">必填字段</el-checkbox>
      </el-form>
      <template #footer>
        <el-button @click="addFieldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addField">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.simwell-template-page {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.title-edit-button {
  margin-left: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.template-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  padding: 14px 14px 12px;
}

.template-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.template-code {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  padding: 4px 8px;
  border-radius: 6px;
}

.template-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  margin: 10px 0 8px;
}

.template-card-name-en,
.header-subtitle {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.template-card-name-en {
  margin: -4px 0 8px;
}

.template-card-footer {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.tabs-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 420px;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--el-bg-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #4a9eff;
    box-shadow: 0 4px 16px rgba(26, 84, 144, 0.1);
    transform: translateY(-1px);
  }
}

.field-drag-handle {
  flex-shrink: 0;
  width: 28px;
  height: 32px;
  margin-right: 10px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: grab;
  font-size: 20px;
  line-height: 1;

  &:hover {
    background: var(--el-fill-color-light);
    color: #1a5490;
  }

  &:active {
    cursor: grabbing;
  }
}

.field-drag-ghost {
  opacity: 0.45;
  border-style: dashed;
}

.field-drag-chosen {
  border-color: #4a9eff;
  cursor: grabbing;
}

.field-card-main {
  min-width: 0;
  flex: 1;
}

.field-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.5;
  margin-bottom: 8px;
}

.field-card-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.field-card-separator {
  margin: 0 8px;
  color: var(--el-border-color);
}

.field-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(74, 158, 255, 0.1);
  color: #1a5490;
}

.field-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  margin-left: 16px;
}

.simwell-admin-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    padding: 24px 28px 12px;
  }

  :deep(.el-dialog__title) {
    font-size: 20px;
    font-weight: 700;
    color: #1a5490;
  }

  :deep(.el-dialog__body) {
    padding: 12px 28px 8px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 28px 24px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 8px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #e1e8ed inset;
    transition: all 0.2s ease;
  }

  :deep(.el-input__wrapper.is-focus),
  :deep(.el-textarea__inner:focus),
  :deep(.el-select__wrapper.is-focused) {
    box-shadow:
      0 0 0 1px #4a9eff inset,
      0 0 0 3px rgba(74, 158, 255, 0.1);
  }
}

.docx-upload {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    border: 2px dashed #e1e8ed;
    border-radius: 8px;
    padding: 30px 20px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #1a5490;
      background: rgba(26, 84, 144, 0.04);
    }
  }
}

.upload-area-icon {
  font-size: 42px;
  line-height: 1;
  margin-bottom: 12px;
}

.upload-area-text {
  color: #5a6c7d;
  margin-bottom: 8px;
}

.upload-area-hint {
  font-size: 12px;
  color: rgba(90, 108, 125, 0.75);
}

.dialog-form-grid {
  display: grid;
  gap: 16px;

  &.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.parsed-field-panel,
.compound-panel {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
  background: #f5f7fa;
}

.parsed-field-panel {
  margin-top: 4px;
}

.parsed-section + .parsed-section {
  margin-top: 14px;
}

.parsed-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.parsed-field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.parsed-section-empty {
  padding: 2px 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  line-height: 20px;
}

.parsed-field-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-card-english {
  margin-top: 2px;
  color: #5a6c7d;
  font-size: 13px;
}

.compound-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e1e8ed;
}

.simple-field-config {
  margin-top: 4px;
}

.dynamic-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 8px;
  background: #ffffff;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
}

.item-label {
  flex-shrink: 0;
  min-width: 32px;
  font-size: 11px;
  color: #5a6c7d;
  white-space: nowrap;
}

.add-item-btn {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 6px;
  border: 2px dashed #e1e8ed;
  border-radius: 6px;
  background: transparent;
  color: #4a9eff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #4a9eff;
    background: rgba(74, 158, 255, 0.05);
  }
}

.card-config-block {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  background: #ffffff;
}

.card-config-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e1e8ed;
}

.card-fields-label {
  font-size: 12px;
  color: #5a6c7d;
  margin-bottom: 6px;
  font-weight: 500;
}

@media (max-width: 1800px) {
  .template-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 1400px) {
  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 900px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
