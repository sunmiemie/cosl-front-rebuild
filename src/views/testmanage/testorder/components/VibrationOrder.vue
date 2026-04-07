<!-- 振动台 工单 -->

<template>
  <div class="affix-container">
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
        <div>
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增 振动台 工单</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="orderNo" label="工单编号" width="160" align="center" />
          <el-table-column prop="type" label="类型" width="120" align="center" />
          <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" align="center" />
          <el-table-column prop="level" label="振动量级" width="120" align="center" />
          <el-table-column prop="duration" label="时长(分)" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">详情</el-link>
              <el-link v-if="row.status === 0" type="success" class="el-link" @click="handlePublish(row)">发布</el-link>
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

    <el-dialog v-model="createDialogVisible" title="创建 振动台 工单" width="700px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="工单类型" prop="type">
          <el-select v-model="createForm.type" placeholder="请选择工单类型" style="width: 100%">
            <el-option label="预实验" value="预实验" />
            <el-option label="正式测试" value="正式测试" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单编号" prop="orderNo">
          <el-input v-model="createForm.orderNo" placeholder="例如 VB-20240312-001" />
        </el-form-item>
        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="createForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="测试设备" prop="deviceName">
          <el-select v-model="createForm.deviceName" placeholder="请选择测试设备" style="width: 100%">
            <el-option label="卫星姿控仪" value="卫星姿控仪" />
            <el-option label="导航控制器" value="导航控制器" />
            <el-option label="传感器模块" value="传感器模块" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="振动量级" prop="level">
              <el-input v-model="createForm.level" placeholder="例如 5.0g" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="振动时长(分)" prop="duration">
              <el-input-number v-model="createForm.duration" :min="1" :step="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="测试日期" prop="testDate">
          <el-date-picker v-model="createForm.testDate" type="date" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="createForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDialogVisible" title="工单详情" size="600px">
      <div v-if="currentOrder" style="padding: 0 20px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ currentOrder.type }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentOrder.deviceName }}</el-descriptions-item>
          <el-descriptions-item label="振动量级">{{ currentOrder.level }}</el-descriptions-item>
          <el-descriptions-item label="时长(分)">{{ currentOrder.duration }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{
              currentOrder.statusText || currentOrder.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ currentOrder.testDate || "-" }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"

import {
  getVibrationTableOrderList,
  getVibrationTableOrderDetail,
  createVibrationTableOrder,
  publishVibrationTableOrder,
  deleteVibrationTableOrder
} from "@/api/vibration-table"

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

const FLOW_PROCESSES = [
  { id: "pre-check", name: "预检流程", value: "预检流程" },
  { id: "sinus", name: "正弦扫频", value: "正弦扫频" },
  { id: "random", name: "随机振动", value: "随机振动" },
  { id: "durability", name: "耐久测试", value: "耐久测试" }
]

const searchForm = reactive({ taskNumber: "", status: "" })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)

type Row = {
  id?: number
  orderNo: string
  type: string
  applicant: string
  deviceName: string
  level: string
  duration: number
  status: string | number
  statusText?: string
  testDate?: string
  remark?: string
}
const tableData = ref<Row[]>([])

type VibrationOrderDetail = Row

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  type: "预实验",
  orderNo: "",
  applicant: "",
  deviceName: "",
  level: "",
  duration: 30,
  testDate: new Date(),
  remark: ""
})

const createRules = {
  type: [{ required: true, message: "请选择工单类型", trigger: "change" }],
  orderNo: [{ required: true, message: "请输入工单编号", trigger: "blur" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  deviceName: [{ required: true, message: "请选择测试设备", trigger: "change" }],
  level: [{ required: true, message: "请输入振动量级", trigger: "blur" }],
  duration: [{ required: true, message: "请输入时长", trigger: "change" }]
}

const canCreate = computed(() => {
  return !!(
    createForm.type &&
    createForm.orderNo &&
    createForm.applicant &&
    createForm.deviceName &&
    createForm.level &&
    createForm.duration
  )
})

const detailDialogVisible = ref(false)
const currentOrder = ref<VibrationOrderDetail | null>(null)

type TagType = "success" | "warning" | "info" | "primary" | "danger"

const getStatusType = (status: number | string): TagType | undefined => {
  const map: Record<string, TagType | undefined> = {
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
  const key = typeof status === "number" ? String(status) : status
  return map[key]
}

const formatDate = (date: Date) => {
  return date.toISOString().split("T")[0]
}

const generateOrderNo = () => {
  const now = new Date()
  return `VB-${formatDate(now).replaceAll("-", "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getVibrationTableOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined
    })
    if (res && res.code === 0 && res.data) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res?.msg || "获取列表失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取列表失败")
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
    type: "预实验",
    orderNo: generateOrderNo(),
    applicant: "",
    deviceName: "",
    level: "",
    duration: 30,
    testDate: new Date(),
    remark: ""
  })
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    createLoading.value = true
    try {
      const res = await createVibrationTableOrder(createForm)
      if (res && res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        getList()
      } else {
        ElMessage.error(res?.msg || "创建失败")
      }
    } catch {
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}

const handleDetail = async (row: Row) => {
  if (row.id == null) return
  try {
    const res = await getVibrationTableOrderDetail(row.id)
    if (res && res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || "获取详情失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}
const handleDelete = async (row: Row) => {
  if (row.id == null) return
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteVibrationTableOrder(row.id)
    if (res && res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    } else {
      ElMessage.error(res?.msg || "删除失败")
    }
  } catch {
    // 取消删除
  }
}
const handlePublish = async (row: Row) => {
  if (row.id == null) return
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishVibrationTableOrder(row.id)
    if (res && res.code === 0) {
      ElMessage.success("发布成功")
      getList()
    } else {
      ElMessage.error(res?.msg || "发布失败")
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}
defineExpose({ refresh: getList })
onMounted(() => {
  getList()
})
</script>

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
  margin-right: 8px;
}
</style>
