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

type SectionKey = "test_products" | "match_instruments" | "test_items" | "evaluation_standards"

type TemplateItem = {
  id: number
  report_no: string
  report_name: string
  configured: boolean
  field_count: number
  updated_at: string
}

const loading = ref(false)
const keyword = ref("")
const pageMode = ref<"list" | "config">("list")
const activeSection = ref<SectionKey>("test_products")
const currentTemplateId = ref<number | null>(null)

const templates = ref<TemplateItem[]>([])

const configDraft = reactive<Record<SectionKey, string[]>>({
  test_products: [],
  match_instruments: [],
  test_items: [],
  evaluation_standards: []
})
const newFieldText = ref("")

const sectionTabs = [
  { key: "test_products" as SectionKey, label: "测试产品" },
  { key: "match_instruments" as SectionKey, label: "配接仪器" },
  { key: "test_items" as SectionKey, label: "测试项目" },
  { key: "evaluation_standards" as SectionKey, label: "评价标准" }
]

const filteredTemplates = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return templates.value
  return templates.value.filter((t) => `${t.report_no} ${t.report_name}`.toLowerCase().includes(k))
})

const currentTemplate = computed(() => templates.value.find((t) => t.id === currentTemplateId.value) || null)

const currentFieldList = computed(() => configDraft[activeSection.value])

const createDialogVisible = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  report_no: "",
  report_name: ""
})
const createDocxFileList = ref<UploadUserFile[]>([])
const createDocxLoading = ref(false)
const createParsedText = reactive<Record<SectionKey, string>>({
  test_products: "",
  match_instruments: "",
  test_items: "",
  evaluation_standards: ""
})
const createRules = {
  report_no: [{ required: true, message: "请输入报告编号", trigger: "blur" }],
  report_name: [{ required: true, message: "请输入报告名称", trigger: "blur" }]
}

const uniqueNonempty = (items: string[]) => {
  const set = new Set<string>()
  const out: string[] = []
  items.forEach((x) => {
    const v = (x || "").trim()
    if (!v) return
    if (set.has(v)) return
    set.add(v)
    out.push(v)
  })
  return out
}

const textToList = (text: string) => {
  const parts = (text || "").split(/[\n\r]+/).flatMap((line) => line.split(/[、,，;；|]+/))
  return uniqueNonempty(parts)
}

const openCreate = () => {
  createForm.report_no = ""
  createForm.report_name = ""
  createDocxFileList.value = []
  createParsedText.test_products = ""
  createParsedText.match_instruments = ""
  createParsedText.test_items = ""
  createParsedText.evaluation_standards = ""
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    const res = await createSimulatedWellReportTemplateApi({
      report_no: createForm.report_no.trim(),
      report_name: createForm.report_name.trim(),
      test_products: textToList(createParsedText.test_products),
      match_instruments: textToList(createParsedText.match_instruments),
      test_items: textToList(createParsedText.test_items),
      evaluation_standards: textToList(createParsedText.evaluation_standards)
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
    createParsedText.test_products = (res.data.test_products || []).join("\n")
    createParsedText.match_instruments = (res.data.match_instruments || []).join("\n")
    createParsedText.test_items = (res.data.test_items || []).join("\n")
    createParsedText.evaluation_standards = (res.data.evaluation_standards || []).join("\n")
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
  newFieldText.value = ""
  pageMode.value = "config"
  fetchDetail(row.id)
}

const saveConfig = () => {
  const t = currentTemplate.value
  if (!t) return
  updateSimulatedWellReportTemplateApi(t.id, {
    test_products: [...configDraft.test_products],
    match_instruments: [...configDraft.match_instruments],
    test_items: [...configDraft.test_items],
    evaluation_standards: [...configDraft.evaluation_standards]
  }).then(async (res) => {
    if (res.code === 0) {
      ElMessage.success("配置已保存")
      await fetchList()
      return
    }
    ElMessage.error(res.msg || "保存失败")
  })
}

const backToList = () => {
  pageMode.value = "list"
}

const addField = () => {
  const text = newFieldText.value.trim()
  if (!text) return
  if (currentFieldList.value.includes(text)) {
    ElMessage.warning("字段已存在")
    return
  }
  currentFieldList.value.push(text)
  newFieldText.value = ""
}

const removeField = (idx: number) => {
  currentFieldList.value.splice(idx, 1)
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
      configDraft.test_products = res.data.test_products || []
      configDraft.match_instruments = res.data.match_instruments || []
      configDraft.test_items = res.data.test_items || []
      configDraft.evaluation_standards = res.data.evaluation_standards || []
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
          {{ pageMode === "list" ? "模板配置" : `配置：${currentTemplate?.report_name || "-"}` }}
        </h1>
      </div>
      <div class="header-actions">
        <template v-if="pageMode === 'list'">
          <el-button type="primary" icon="RefreshRight" :loading="loading" @click="handleSync">同步模板</el-button>
          <el-button type="success" icon="CirclePlus" @click="openCreate">新增模板</el-button>
        </template>
        <template v-else>
          <el-button @click="backToList">返回列表</el-button>
          <el-button type="primary" @click="saveConfig">保存配置</el-button>
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
            <div class="card-title">{{ sectionTabs.find((s) => s.key === activeSection)?.label }}字段</div>
            <div class="field-input-wrap">
              <el-input v-model="newFieldText" placeholder="输入字段内容后添加" @keyup.enter="addField" />
              <el-button type="success" @click="addField">添加字段</el-button>
            </div>
          </div>
        </template>

        <div class="field-list">
          <div v-for="(item, idx) in currentFieldList" :key="`${activeSection}-${idx}`" class="field-item">
            <div class="field-text">{{ item }}</div>
            <el-button link type="danger" @click="removeField(idx)">删除</el-button>
          </div>
          <el-empty v-if="currentFieldList.length === 0" description="暂无字段，请点击上方“添加字段”" />
        </div>
      </el-card>
    </div>

    <el-dialog v-model="createDialogVisible" title="新增报告模板" width="520px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="90px">
        <el-form-item label="报告上传">
          <el-upload
            v-model:file-list="createDocxFileList"
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            accept=".docx"
            :on-change="handleCreateDocxChange"
          >
            <el-button :loading="createDocxLoading">上传 docx 报告</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="模板编号" prop="report_no">
          <el-input v-model="createForm.report_no" placeholder="例如：WT3-TCZZ-02-R35" />
        </el-form-item>
        <el-form-item label="模板名称" prop="report_name">
          <el-input v-model="createForm.report_name" placeholder="例如：CBMT61XA南区水泥胶结测井仪" />
        </el-form-item>
        <el-form-item label="测试产品">
          <el-input
            v-model="createParsedText.test_products"
            type="textarea"
            :rows="3"
            placeholder="每行一条，支持用 、 , ; | 分隔"
          />
        </el-form-item>
        <el-form-item label="配接仪器">
          <el-input
            v-model="createParsedText.match_instruments"
            type="textarea"
            :rows="3"
            placeholder="每行一条，支持用 、 , ; | 分隔"
          />
        </el-form-item>
        <el-form-item label="测试项目">
          <el-input
            v-model="createParsedText.test_items"
            type="textarea"
            :rows="3"
            placeholder="每行一条，支持用 、 , ; | 分隔"
          />
        </el-form-item>
        <el-form-item label="评价标准">
          <el-input
            v-model="createParsedText.evaluation_standards"
            type="textarea"
            :rows="4"
            placeholder="每行一条，支持用 、 , ; | 分隔"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
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
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
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
  gap: 10px;
}

.field-item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
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
