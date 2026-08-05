<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>委托单数据管理</span>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="委托单编号">
          <el-input v-model="searchForm.commissionNo" placeholder="请输入委托单编号" clearable />
        </el-form-item>
        <el-form-item label="委托单位">
          <el-input v-model="searchForm.commissionOrg" placeholder="请输入委托单位" clearable />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="searchForm.contactName" placeholder="请输入联系人" clearable />
        </el-form-item>
        <el-form-item label="服务级别">
          <el-select v-model="searchForm.serviceLevel" placeholder="全部" clearable style="width: 140px">
            <el-option label="正常" value="normal" />
            <el-option label="加急" value="urgent" />
            <el-option label="特急" value="urgent2" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-date-picker
            v-model="searchForm.updatedRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div style="margin-bottom: 12px">
        <el-button type="primary" :loading="exportLoading" @click="handleExport">批量导出</el-button>
        <el-button v-if="selectedOrderIds.length" @click="clearSelection">清空选择</el-button>
        <span class="selection-tip">
          {{
            selectedOrderIds.length ? `已跨页选择 ${selectedOrderIds.length} 个委托单` : "未选择时导出当前全部筛选结果"
          }}
        </span>
        <el-tooltip content="刷新数据">
          <el-button circle icon="RefreshRight" type="primary" @click="getList" />
        </el-tooltip>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        stripe
        border
        row-key="id"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="46" fixed="left" :reserve-selection="true" />
        <el-table-column prop="commission_no" label="委托单编号" min-width="140" />
        <el-table-column prop="commission_org" label="委托单位" min-width="160" show-overflow-tooltip />
        <el-table-column prop="contact_name" label="联系人" width="100" />
        <el-table-column prop="phone" label="电话" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="160" show-overflow-tooltip />
        <el-table-column prop="service_label" label="服务级别" width="100" />
        <el-table-column label="剩余数量" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="Number(row.remaining_quantity || 0) === 0" type="success">已完成</el-tag>
            <span v-else>{{ row.remaining_quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="170" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
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

    <el-dialog v-model="editDialogVisible" title="编辑委托单" width="min(1280px, 96vw)" top="5vh">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="委托单编号" prop="commission_no">
              <el-input v-model="editForm.commission_no" placeholder="请输入委托单编号" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托单位" prop="commission_org">
              <el-input v-model="editForm.commission_org" placeholder="请输入委托单位" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="地址" prop="address">
              <el-input v-model="editForm.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预算编号" prop="budget_no">
              <el-input v-model="editForm.budget_no" placeholder="请输入科研项目预算编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact_name">
              <el-input v-model="editForm.contact_name" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电话" prop="phone">
              <el-input v-model="editForm.phone" placeholder="请输入电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务级别" prop="service_level">
              <el-select v-model="editForm.service_level" style="width: 100%">
                <el-option label="正常" value="normal" />
                <el-option label="加急" value="urgent" />
                <el-option label="特急" value="urgent2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接收方式" prop="receive_method">
              <el-select v-model="editForm.receive_method" placeholder="请选择接收方式" style="width: 100%">
                <el-option label="自送" value="自送" />
                <el-option label="邮寄" value="邮寄" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="处理方式" prop="process_method">
              <el-select v-model="editForm.process_method" placeholder="请选择处理方式" style="width: 100%">
                <el-option label="自取" value="自取" />
                <el-option label="邮寄退回" value="邮寄退回" />
                <el-option label="留存" value="留存" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="输出要求" prop="output_req">
              <el-select v-model="editForm.output_req" placeholder="请选择输出要求" style="width: 100%">
                <el-option label="按样品分开出" value="按样品分开出" />
                <el-option label="合并出具" value="合并出具" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="输出版本" prop="output_version">
              <el-select v-model="editForm.output_version" placeholder="请选择输出版本" style="width: 100%">
                <el-option label="中文" value="中文" />
                <el-option label="英文" value="英文" />
                <el-option label="中英双语" value="中英双语" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="封面标识" prop="cover_mark">
              <el-select v-model="editForm.cover_mark" placeholder="请选择封面标识" style="width: 100%">
                <el-option label="无" value="无" />
                <el-option label="加盖标识" value="加盖标识" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="印章要求" prop="seal_req">
              <el-select v-model="editForm.seal_req" placeholder="请选择印章要求" style="width: 100%">
                <el-option label="油田技术实验中心" value="油田技术实验中心" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交付方式" prop="delivery_method">
              <el-select v-model="editForm.delivery_method" placeholder="请选择交付方式" style="width: 100%">
                <el-option label="电子版" value="电子版" />
                <el-option label="纸质版" value="纸质版" />
                <el-option label="电子+纸质" value="电子+纸质" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报告用途" prop="report_usage">
              <el-select v-model="editForm.report_usage" placeholder="请选择报告用途" style="width: 100%">
                <el-option label="一般委托" value="一般委托" />
                <el-option label="科研项目" value="科研项目" />
                <el-option label="质量仲裁" value="质量仲裁" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="editForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>样品信息</el-divider>
        <div class="sample-toolbar">
          <el-button type="primary" plain @click="addSample">
            <el-icon><Plus /></el-icon>
            添加样品
          </el-button>
        </div>
        <el-table :data="editForm.samples" border stripe style="width: 100%">
          <el-table-column label="样品名称" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.sample_name" placeholder="样品名称" />
            </template>
          </el-table-column>
          <el-table-column label="分类" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.category" placeholder="分类" />
            </template>
          </el-table-column>
          <el-table-column label="规格型号" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.spec_model" placeholder="规格型号" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" style="width: 100%" />
            </template>
          </el-table-column>
          <el-table-column label="生产厂家" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.manufacturer" placeholder="生产厂家" />
            </template>
          </el-table-column>
          <el-table-column label="项目名称" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.project_name" placeholder="项目名称" />
            </template>
          </el-table-column>
          <el-table-column label="批次号" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.batch_no" placeholder="批次号" />
            </template>
          </el-table-column>
          <el-table-column label="SN号" min-width="130">
            <template #default="{ row }">
              <el-input v-model="row.sn" placeholder="SN号" />
            </template>
          </el-table-column>
          <el-table-column label="物料号" min-width="120">
            <template #default="{ row }">
              <el-input v-model="row.material_no" placeholder="物料号" />
            </template>
          </el-table-column>
          <el-table-column label="测试内容" min-width="140">
            <template #default="{ row }">
              <el-input v-model="row.test_content" placeholder="测试内容" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" @click="removeSample($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saveLoading" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailVisible" title="委托单详情" size="min(1280px, 96vw)" class="commission-detail-drawer">
      <div v-if="detailData" class="commission-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item
            v-for="field in detailBasicFields"
            :key="field.key"
            :label="field.label"
            :span="field.span || 1"
          >
            {{ displayDetailValue(field.key === "服务级别" ? detailData.service : detailData.basic?.[field.key]) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>样品明细</el-divider>
        <el-table :data="detailData.samples || []" border stripe class="detail-sample-table">
          <el-table-column prop="样品名称" label="样品名称" min-width="130" :formatter="formatEmptyCell" />
          <el-table-column prop="分类" label="分类" min-width="120" :formatter="formatEmptyCell" />
          <el-table-column prop="规格型号" label="规格型号" min-width="130" :formatter="formatEmptyCell" />
          <el-table-column prop="数量" label="数量" width="72" align="center" :formatter="formatEmptyCell" />
          <el-table-column prop="生产厂家" label="生产厂家" min-width="130" :formatter="formatEmptyCell" />
          <el-table-column prop="项目名称" label="项目名称" min-width="130" :formatter="formatEmptyCell" />
          <el-table-column prop="批次号" label="批次号" min-width="120" :formatter="formatEmptyCell" />
          <el-table-column prop="SN号" label="SN号" min-width="130" :formatter="formatEmptyCell" />
          <el-table-column prop="物料号" label="物料号" min-width="120" :formatter="formatEmptyCell" />
          <el-table-column prop="测试内容" label="测试内容" min-width="130" :formatter="formatEmptyCell" />
        </el-table>

        <el-divider>相关项目</el-divider>
        <el-table :data="relatedProjects" border stripe class="related-project-table" empty-text="暂无关联项目">
          <el-table-column prop="sn" label="SN号" min-width="110" :formatter="formatEmptyCell" />
          <el-table-column prop="sampleName" label="样品名称" min-width="110" :formatter="formatEmptyCell" />
          <el-table-column prop="specModel" label="规格型号" min-width="110" :formatter="formatEmptyCell" />
          <el-table-column prop="quantity" label="数量" width="64" align="center" :formatter="formatEmptyCell" />
          <el-table-column prop="device" label="检测设备" min-width="110" :formatter="formatEmptyCell" />
          <el-table-column prop="hours" label="工时(h)" width="80" align="center" :formatter="formatEmptyCell" />
          <el-table-column prop="inspector" label="检测人" width="82" :formatter="formatEmptyCell" />
          <el-table-column prop="doneAt" label="完成时间" min-width="120" :formatter="formatEmptyCell" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type TableInstance } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { request } from "@/utils/service"

type RelatedProjectRow = {
  id: number
  sn?: string
  sampleName?: string
  specModel?: string
  quantity?: number
  device?: string
  hours?: number
  inspector?: string
  doneAt?: string
}

type Row = {
  id: number
  commission_no: string
  commission_org: string
  address?: string
  budget_no?: string
  contact_name: string
  phone?: string
  email?: string
  service_level: string
  service_label?: string
  sample_total_quantity?: number
  used_quantity?: number
  remaining_quantity?: number
  remaining_label?: string
  remark?: string
  updated_at?: string
}

const loading = ref(false)
const exportLoading = ref(false)
const tableRef = ref<TableInstance>()
const tableData = ref<Row[]>([])
const selectedOrderIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const searchForm = reactive({
  commissionNo: "",
  commissionOrg: "",
  contactName: "",
  serviceLevel: "",
  updatedRange: [] as string[]
})

const sortRowsByCompletion = (rows: Row[]) => {
  return [...rows].sort((a, b) => {
    const aCompleted = Number(a.remaining_quantity || 0) === 0
    const bCompleted = Number(b.remaining_quantity || 0) === 0
    if (aCompleted === bCompleted) return 0
    return aCompleted ? 1 : -1
  })
}

const getList = () => {
  loading.value = true
  request({
    url: "data/commission-order/list",
    method: "get",
    params: {
      currentPage: pagination.page,
      pageSize: pagination.pageSize,
      commissionNo: searchForm.commissionNo,
      commissionOrg: searchForm.commissionOrg,
      contactName: searchForm.contactName,
      serviceLevel: searchForm.serviceLevel,
      updatedStart: searchForm.updatedRange?.[0] || "",
      updatedEnd: searchForm.updatedRange?.[1] || ""
    }
  })
    .then((res: any) => {
      tableData.value = sortRowsByCompletion(res.data.list || [])
      pagination.total = res.data.total || 0
    })
    .catch(() => {
      tableData.value = []
      pagination.total = 0
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  searchForm.commissionNo = ""
  searchForm.commissionOrg = ""
  searchForm.contactName = ""
  searchForm.serviceLevel = ""
  searchForm.updatedRange = []
  pagination.page = 1
  getList()
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

const editDialogVisible = ref(false)
const saveLoading = ref(false)
const editFormRef = ref<FormInstance>()

const getEmptySample = () => ({
  id: null,
  sample_name: "",
  category: "",
  spec_model: "",
  quantity: 1,
  manufacturer: "",
  project_name: "",
  batch_no: "",
  sn: "",
  material_no: "",
  test_content: ""
})

const editForm = reactive({
  id: null as number | null,
  commission_no: "",
  commission_org: "",
  address: "",
  budget_no: "",
  contact_name: "",
  phone: "",
  email: "",
  service_level: "normal",
  receive_method: "",
  process_method: "",
  output_req: "",
  output_version: "",
  cover_mark: "",
  seal_req: "",
  delivery_method: "",
  report_usage: "",
  remark: "",
  samples: [getEmptySample()]
})

const editRules = {
  commission_no: [{ required: true, message: "请输入委托单编号", trigger: "blur" }],
  commission_org: [{ required: true, message: "请输入委托单位", trigger: "blur" }],
  contact_name: [{ required: true, message: "请输入联系人", trigger: "blur" }],
  service_level: [{ required: true, message: "请选择服务级别", trigger: "change" }]
}

const addSample = () => {
  editForm.samples.push(getEmptySample())
}

const removeSample = (idx: number) => {
  editForm.samples.splice(idx, 1)
  if (editForm.samples.length === 0) editForm.samples.push(getEmptySample())
}

const openEditDialog = (row: Row) => {
  editDialogVisible.value = true
  Object.assign(editForm, {
    id: row.id,
    commission_no: row.commission_no,
    commission_org: row.commission_org,
    address: row.address || "",
    budget_no: row.budget_no || "",
    contact_name: row.contact_name,
    phone: row.phone || "",
    email: row.email || "",
    service_level: row.service_level,
    receive_method: "",
    process_method: "",
    output_req: "",
    output_version: "",
    cover_mark: "",
    seal_req: "",
    delivery_method: "",
    report_usage: "",
    remark: row.remark || "",
    samples: [getEmptySample()]
  })
  request({
    url: "data/commission-order/detail",
    method: "get",
    params: { commissionNo: row.commission_no }
  }).then((res: any) => {
    // 补全附加字段
    if (res.data?.basic) {
      editForm.receive_method = res.data.basic["接收方式"] || ""
      editForm.process_method = res.data.basic["处理方式"] || ""
      editForm.output_req = res.data.basic["输出要求"] || ""
      editForm.output_version = res.data.basic["输出版本"] || ""
      editForm.cover_mark = res.data.basic["封面标识"] || ""
      editForm.seal_req = res.data.basic["印章要求"] || ""
      editForm.delivery_method = res.data.basic["交付方式"] || ""
      editForm.report_usage = res.data.basic["报告用途"] || ""
    }
    const samples = (res.data.samples || []).map((s: any) => ({
      id: s.id || null,
      sample_name: s["样品名称"] || "",
      category: s["分类"] || "",
      spec_model: s["规格型号"] || "",
      quantity: Number(s["数量"] || 0),
      manufacturer: s["生产厂家"] || "",
      project_name: s["项目名称"] || "",
      batch_no: s["批次号"] || "",
      sn: s["SN号"] || "",
      material_no: s["物料号"] || "",
      test_content: s["测试内容"] || ""
    }))
    editForm.samples = samples.length ? samples : [getEmptySample()]
  })
}

const handleSelectionChange = (rows: Row[]) => {
  const currentPageIds = new Set(tableData.value.map((row) => row.id))
  const nextIds = new Set(selectedOrderIds.value.filter((id) => !currentPageIds.has(id)))
  rows.forEach((row) => nextIds.add(row.id))
  selectedOrderIds.value = Array.from(nextIds)
}

const clearSelection = () => {
  selectedOrderIds.value = []
  tableRef.value?.clearSelection()
}

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const blob = await request<Blob>({
      url: "data/commission-order/export",
      method: "post",
      data: {
        ids: selectedOrderIds.value,
        filters: {
          commissionNo: searchForm.commissionNo,
          commissionOrg: searchForm.commissionOrg,
          contactName: searchForm.contactName,
          serviceLevel: searchForm.serviceLevel,
          updatedStart: searchForm.updatedRange?.[0] || "",
          updatedEnd: searchForm.updatedRange?.[1] || ""
        }
      },
      responseType: "blob"
    })
    saveBlob(blob, `委托单批量导出_${new Date().toISOString().slice(0, 10)}.pdf`)
  } catch {
    ElMessage.error("导出失败")
  } finally {
    exportLoading.value = false
  }
}

const validateSampleRows = () => {
  if (!editForm.samples.length) {
    ElMessage.warning("委托单至少需要一条样品明细")
    return false
  }
  for (const [index, sample] of editForm.samples.entries()) {
    if (!String(sample.sample_name || "").trim()) {
      ElMessage.warning(`第 ${index + 1} 条样品明细缺少样品名称`)
      return false
    }
    if (!String(sample.category || "").trim()) {
      ElMessage.warning(`第 ${index + 1} 条样品明细缺少分类`)
      return false
    }
    if (!Number.isFinite(Number(sample.quantity)) || Number(sample.quantity) <= 0) {
      ElMessage.warning(`第 ${index + 1} 条样品明细数量必须大于 0`)
      return false
    }
  }
  return true
}

const handleSave = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!validateSampleRows()) return
    saveLoading.value = true
    try {
      const res: any = await request({
        url: "data/commission-order/save",
        method: "post",
        data: {
          id: editForm.id,
          commission_no: editForm.commission_no,
          commission_org: editForm.commission_org,
          address: editForm.address,
          budget_no: editForm.budget_no,
          contact_name: editForm.contact_name,
          phone: editForm.phone,
          email: editForm.email,
          service_level: editForm.service_level,
          receive_method: editForm.receive_method,
          process_method: editForm.process_method,
          output_req: editForm.output_req,
          output_version: editForm.output_version,
          cover_mark: editForm.cover_mark,
          seal_req: editForm.seal_req,
          delivery_method: editForm.delivery_method,
          report_usage: editForm.report_usage,
          remark: editForm.remark,
          samples: editForm.samples
        }
      })
      if (res.data?.assistantSync?.success === false) {
        ElMessage.warning(res.data.assistantSync.message || "委托单已保存，但自动推送小助手失败")
      } else {
        ElMessage.success("委托单已保存，已自动推送小助手")
      }
      editDialogVisible.value = false
      getList()
    } catch {
      ElMessage.error("保存失败")
    } finally {
      saveLoading.value = false
    }
  })
}

const handleDelete = async (row: Row) => {
  await ElMessageBox.confirm(`确定要删除委托单 [${row.commission_no}] 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
  try {
    await request({
      url: `data/commission-order/delete/${row.id}`,
      method: "delete"
    })
    ElMessage.success("删除成功")
    getList()
  } catch {
    ElMessage.error("删除失败")
  }
}

const detailVisible = ref(false)
const detailData = ref<any>(null)
const relatedProjects = ref<RelatedProjectRow[]>([])

const detailBasicFields = [
  { key: "委托单编号", label: "委托单编号" },
  { key: "委托单位", label: "委托单位" },
  { key: "联系人", label: "联系人" },
  { key: "电话", label: "电话" },
  { key: "邮箱", label: "邮箱" },
  { key: "服务级别", label: "服务级别" },
  { key: "地址", label: "地址", span: 2 },
  { key: "科研项目预算编号", label: "科研项目预算编号", span: 2 },
  { key: "接收方式", label: "接收方式" },
  { key: "处理方式", label: "处理方式" },
  { key: "输出要求", label: "输出要求" },
  { key: "输出版本", label: "输出版本" },
  { key: "封面标识", label: "封面标识" },
  { key: "印章要求", label: "印章要求" },
  { key: "交付方式", label: "交付方式" },
  { key: "报告用途", label: "报告用途" },
  { key: "创建时间", label: "创建时间" },
  { key: "更新时间", label: "更新时间" },
  { key: "备注", label: "备注", span: 2 }
]

const displayDetailValue = (value: unknown): string =>
  value === null || value === undefined || value === "" ? "-" : String(value)

const formatEmptyCell = (_row: unknown, _column: unknown, value: unknown): string => displayDetailValue(value)

const openDetail = (row: Row) => {
  relatedProjects.value = []
  request({
    url: "data/commission-order/detail",
    method: "get",
    params: { commissionNo: row.commission_no }
  })
    .then((res: any) => {
      detailData.value = res.data
      relatedProjects.value = res.data?.relatedProjects || []
      detailVisible.value = true
    })
    .catch(() => {
      ElMessage.error("获取详情失败")
    })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 12px;
}
.selection-tip {
  margin: 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
.sample-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}
.commission-detail {
  min-width: 0;
}
.detail-sample-table,
.related-project-table {
  width: 100%;
}

:deep(.commission-detail .el-descriptions__content),
:deep(.detail-sample-table .cell),
:deep(.related-project-table .cell) {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 920px) {
  :deep(.commission-detail-drawer) {
    width: 92vw !important;
  }
}
</style>
