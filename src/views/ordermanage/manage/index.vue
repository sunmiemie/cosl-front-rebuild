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
        <el-tooltip content="刷新数据">
          <el-button circle icon="RefreshRight" type="primary" @click="getList" />
        </el-tooltip>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe border style="width: 100%">
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
              <el-input-number v-model="row.quantity" :min="0" style="width: 100%" />
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
          <el-descriptions-item label="委托单编号">{{ detailData.basic?.["委托单编号"] }}</el-descriptions-item>
          <el-descriptions-item label="委托单位">{{ detailData.basic?.["委托单位"] }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ detailData.basic?.["联系人"] }}</el-descriptions-item>
          <el-descriptions-item label="电话">{{ detailData.basic?.["电话"] }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detailData.basic?.["邮箱"] }}</el-descriptions-item>
          <el-descriptions-item label="服务级别">{{ detailData.service }}</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ detailData.basic?.["地址"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="科研项目预算编号" :span="2">{{
            detailData.basic?.["科研项目预算编号"] || "-"
          }}</el-descriptions-item>

          <el-descriptions-item label="接收方式">{{ detailData.basic?.["接收方式"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="处理方式">{{ detailData.basic?.["处理方式"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="输出要求">{{ detailData.basic?.["输出要求"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="输出版本">{{ detailData.basic?.["输出版本"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="封面标识">{{ detailData.basic?.["封面标识"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="印章要求">{{ detailData.basic?.["印章要求"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="交付方式">{{ detailData.basic?.["交付方式"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="报告用途">{{ detailData.basic?.["报告用途"] || "-" }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.basic?.["备注"] || "-" }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>样品明细</el-divider>
        <el-table :data="detailData.samples || []" border stripe class="detail-sample-table">
          <el-table-column prop="样品名称" label="样品名称" min-width="130" show-overflow-tooltip />
          <el-table-column prop="分类" label="分类" min-width="120" show-overflow-tooltip />
          <el-table-column prop="规格型号" label="规格型号" min-width="130" show-overflow-tooltip />
          <el-table-column prop="数量" label="数量" width="72" align="center" />
          <el-table-column prop="生产厂家" label="生产厂家" min-width="130" show-overflow-tooltip />
          <el-table-column prop="项目名称" label="项目名称" min-width="130" show-overflow-tooltip />
          <el-table-column prop="批次号" label="批次号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="SN号" label="SN号" min-width="130" show-overflow-tooltip />
          <el-table-column prop="物料号" label="物料号" min-width="120" show-overflow-tooltip />
          <el-table-column prop="测试内容" label="测试内容" min-width="130" show-overflow-tooltip />
        </el-table>

        <el-divider>相关项目</el-divider>
        <el-table
          v-loading="relatedProjectLoading"
          :data="relatedProjects"
          border
          stripe
          class="related-project-table"
          empty-text="暂无关联项目"
        >
          <el-table-column prop="sn" label="SN号" min-width="110" show-overflow-tooltip />
          <el-table-column prop="name" label="样品名称" min-width="110" show-overflow-tooltip />
          <el-table-column prop="spec" label="规格型号" min-width="110" show-overflow-tooltip />
          <el-table-column prop="qty" label="数量" width="64" align="center" />
          <el-table-column prop="device" label="检测设备" min-width="110" show-overflow-tooltip />
          <el-table-column prop="hours" label="工时(h)" width="80" align="center" />
          <el-table-column prop="inspector" label="检测人" width="82" show-overflow-tooltip />
          <el-table-column prop="doneAt" label="完成时间" min-width="120" show-overflow-tooltip />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { request } from "@/utils/service"
import { getRelatedProjectsByCommissionNo, type RelatedProjectRow } from "./related-projects"

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
const tableData = ref<Row[]>([])
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
  quantity: 0,
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

const handleSave = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return
    saveLoading.value = true
    try {
      await request({
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
      ElMessage.success("保存成功")
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
const relatedProjectLoading = ref(false)
const relatedProjects = ref<RelatedProjectRow[]>([])

const loadRelatedProjects = (commissionNo: string) => {
  relatedProjectLoading.value = true
  relatedProjects.value = []
  request({
    url: "data/commission-board-relation/list",
    method: "get",
    params: {
      currentPage: 1,
      pageSize: 1000,
      search: commissionNo
    }
  })
    .then((res: any) => {
      relatedProjects.value = getRelatedProjectsByCommissionNo(res.data?.list || [], commissionNo)
    })
    .catch(() => {
      relatedProjects.value = []
      ElMessage.error("获取相关项目失败")
    })
    .finally(() => {
      relatedProjectLoading.value = false
    })
}

const openDetail = (row: Row) => {
  relatedProjects.value = []
  request({
    url: "data/commission-order/detail",
    method: "get",
    params: { commissionNo: row.commission_no }
  })
    .then((res: any) => {
      detailData.value = res.data
      detailVisible.value = true
      loadRelatedProjects(row.commission_no)
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

@media (max-width: 920px) {
  :deep(.commission-detail-drawer) {
    width: 92vw !important;
  }
}
</style>
