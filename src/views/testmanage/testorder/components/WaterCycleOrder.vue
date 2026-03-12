<!-- 水循环 测试工单 -->

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
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog"> 新增 水循环 工单 </el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="taskNumber" label="任务单号" width="180" align="center" />
          <el-table-column prop="applicant" label="申请人" min-width="120" align="center" />
          <el-table-column prop="deviceName" label="设备名称" min-width="150" align="center" />
          <el-table-column prop="flowProcess" label="流程长度" min-width="120" align="center" />
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

    <el-dialog v-model="createDialogVisible" title="创建 水循环 工单" width="1100px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试台" prop="testPlatform">
              <el-select v-model="createForm.testPlatform" placeholder="请选择测试台" style="width: 100%">
                <el-option label="水循环测试台" value="水循环测试台" />
                <el-option label="高压水循环测试台" value="高压水循环测试台" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试日期" prop="testDate">
              <el-date-picker v-model="createForm.testDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="createForm.startTime" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="createForm.endTime" placeholder="选择时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="createForm.deviceName" />
        </el-form-item>
        <el-form-item label="设备编号" prop="deviceNumber">
          <el-input v-model="createForm.deviceNumber" />
        </el-form-item>
        <el-form-item label="任务单号" prop="taskNumber">
          <el-input v-model="createForm.taskNumber" />
        </el-form-item>

        <el-form-item label="流程长度" prop="flowProcess">
          <el-select v-model="createForm.flowProcess" placeholder="请选择流程长度" style="width: 100%">
            <el-option v-for="p in FLOW_PROCESSES" :key="p.id" :label="p.name" :value="p.value" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否调压" prop="needPressureTest">
              <el-select v-model="createForm.needPressureTest" style="width: 100%">
                <el-option label="否" value="no" />
                <el-option label="是" value="yes" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否指令下传" prop="needCommandTransfer">
              <el-select v-model="createForm.needCommandTransfer" style="width: 100%">
                <el-option label="否" value="no" />
                <el-option label="是" value="yes" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="申请人" prop="applicant">
          <el-input v-model="createForm.applicant" placeholder="请输入申请人姓名" />
        </el-form-item>
        <el-form-item label="备注" style="margin-top: 8px">
          <el-input v-model="createForm.remark" type="textarea" rows="3" placeholder="请输入备注" />
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
          <el-descriptions-item label="工单号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{ currentOrder.statusText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工艺">
            {{ currentOrder.process?.name || "-" }}
            <span v-if="currentOrder.process?.version">(v{{ currentOrder.process.version }})</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ currentOrder.startedAt || "-" }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ currentOrder.completedAt || "-" }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
          <el-descriptions-item label="反馈理由" v-if="currentOrder.feedbackReason">
            <el-text type="danger">{{ currentOrder.feedbackReason }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Cpu } from "@element-plus/icons-vue"
import { useUserStore } from "@/store/modules/user"
import {
  getWaterCycleOrderList,
  getWaterCycleOrderDetail,
  publishWaterCycleOrder,
  deleteWaterCycleOrder
} from "@/api/water-cycle"
//api接口函数名称
import type { WaterCycleOrderListItem, WaterCycleOrderDetail } from "@/api/water-cycle/types"

const userStore = useUserStore()

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
  { id: "small_loop", name: "空循环", value: "空循环" },
  { id: "water_test", name: "小循环", value: "小循环" },
  { id: "440", name: "440米", value: "440" },
  { id: "877", name: "877米", value: "877" },
  { id: "1766", name: "1766米", value: "1766" },
  { id: "2214", name: "2214米", value: "2214" },
  { id: "3122", name: "3122米", value: "3122" },
  { id: "4622", name: "4622米", value: "4622" },
  { id: "6122", name: "6122米", value: "6122" },
  { id: "water_level", name: "水平钻机", value: "水平钻机" },
  { id: "1500", name: "1500米", value: "1500" },
  { id: "3000", name: "3000米", value: "3000" }
]

const searchForm = reactive({ taskNumber: "", status: "" })

const pagination = reactive({ page: 1, pageSize: 20, total: 0 })

const loading = ref(false)
const tableData = ref<WaterCycleOrderListItem[]>([])
const processList = ref<any[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  testPlatform: "水循环测试台",
  testDate: new Date().toISOString().split("T")[0] as any,
  startTime: "" as any,
  endTime: "" as any,
  deviceName: "",
  deviceNumber: "",
  taskNumber: "",
  flowProcess: "",
  needPressureTest: "no",
  needCommandTransfer: "no",
  applicant: "",
  remark: ""
})

const createRules = {
  testPlatform: [{ required: true, message: "请选择测试台", trigger: "change" }],
  testDate: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  deviceName: [{ required: true, message: "请输入设备名称", trigger: "blur" }],
  deviceNumber: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  taskNumber: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  flowProcess: [{ required: true, message: "请选择流程长度", trigger: "change" }],
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }]
}

const canCreate = computed(() => {
  // 只校验表单基础必填项是否填写
  return !!(createForm.taskNumber && createForm.deviceName && createForm.flowProcess && createForm.applicant)
})

const detailDialogVisible = ref(false)
const currentOrder = ref<WaterCycleOrderDetail | null>(null)

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: "info",
    1: "warning",
    2: "primary",
    3: "",
    4: "danger",
    5: "success",
    6: "danger",
    7: "info",
    8: "warning"
  }
  return map[status] || ""
}

const getList = async () => {
  loading.value = true
  try {
    /* 注释掉实际接口调用
    const res = await getWaterCycleOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber || undefined,
      status: searchForm.status || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
    */

    // 使用假数据演示，并添加本地过滤逻辑
    setTimeout(() => {
      const allMockData = [
        {
          id: 1,
          taskNumber: "TASK-20240312-001",
          applicant: "张三",
          deviceName: "水循环测试系统-01",
          flowProcess: "440",
          status: 0,
          statusText: "已创建",
          createdAt: "2024-03-12 10:00:00"
        },
        {
          id: 2,
          taskNumber: "TASK-20240312-002",
          applicant: "李四",
          deviceName: "高压水循环设备-A2",
          flowProcess: "877",
          status: 1,
          statusText: "待领取",
          createdAt: "2024-03-12 11:30:00"
        },
        {
          id: 3,
          taskNumber: "TASK-20240312-003",
          applicant: "王五",
          deviceName: "水循环系统-01",
          flowProcess: "1766",
          status: 2,
          statusText: "测试中",
          createdAt: "2024-03-12 09:15:00"
        }
      ]

      // 执行搜索过滤
      let filteredData = allMockData
      if (searchForm.taskNumber) {
        filteredData = filteredData.filter((item) => item.taskNumber.includes(searchForm.taskNumber))
      }
      if (searchForm.status !== "" && searchForm.status !== undefined) {
        filteredData = filteredData.filter((item) => String(item.status) === String(searchForm.status))
      }

      tableData.value = filteredData as any
      pagination.total = filteredData.length
      loading.value = false
    }, 500)
  } catch (e) {
    console.error(e)
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

const showCreateDialog = async () => {
  Object.assign(createForm, {
    testPlatform: "水循环测试台",
    testDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    deviceName: "",
    deviceNumber: "",
    taskNumber: "",
    flowProcess: "",
    needPressureTest: "no",
    needCommandTransfer: "no",
    applicant: "",
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
      ElMessage.success("创建成功")
      createDialogVisible.value = false
      getList()
    } catch (e) {
      console.error(e)
      ElMessage.error("创建失败")
    } finally {
      createLoading.value = false
    }
  })
}
// 查看详情
const handleDetail = async (row: WaterCycleOrderListItem) => {
  try {
    /* 注释掉实际接口调用
    const res = await getWaterCycleOrderDetail(row.id)
    if (res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }
    */

    // 使用假数据演示
    currentOrder.value = {
      ...row,
      orderNo: row.taskNumber,
      process: { id: 101, name: "标准水循环测试工艺", version: "1.2" },
      boardCount: 4,
      startedAt: row.status >= 2 ? "2024-03-12 14:00:00" : "-",
      completedAt: "-",
      remark: "这是一个演示用的备注信息",
      feedbackReason: ""
    } as any
    detailDialogVisible.value = true
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handlePublish = async (row: WaterCycleOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    /* 注释掉实际接口调用
    const res = await publishWaterCycleOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
    */

    // 模拟发布成功
    ElMessage.success("发布成功 (演示)")
    row.status = 1
    row.statusText = "待领取"
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}

const handleDelete = async (row: WaterCycleOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    /* 注释掉实际接口调用
    const res = await deleteWaterCycleOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
    */

    // 模拟删除成功
    ElMessage.success("删除成功 (演示)")
    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    pagination.total -= 1
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

defineExpose({ refresh: getList })

onMounted(() => {
  getList()
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
</style>
