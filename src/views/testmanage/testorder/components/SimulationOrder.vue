<template>
  <div class="affix-container">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="工单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入工单编号" clearable />
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
          <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增 模拟井 工单</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="orderNo" label="工单编号" width="180" align="center" />
          <el-table-column prop="customerUnit" label="客户单位" min-width="160" align="center" />
          <el-table-column prop="taskDesc" label="任务描述" min-width="220" align="center" />
          <el-table-column prop="deviceCount" label="设备数量" width="100" align="center" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.statusText || row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" fixed="right">
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

    <el-dialog v-model="createDialogVisible" title="创建 模拟井 工单" width="700px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="110px">
        <el-form-item label="工单编号" prop="orderNo">
          <el-input v-model="createForm.orderNo" placeholder="例如: SIM-20240312-001" />
        </el-form-item>
        <el-form-item label="客户单位" prop="customerUnit">
          <el-input v-model="createForm.customerUnit" placeholder="例如: 科索" />
        </el-form-item>
        <el-form-item label="任务描述" prop="taskDesc">
          <el-input v-model="createForm.taskDesc" type="textarea" rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="设备数量" prop="deviceCount">
          <el-input-number v-model="createForm.deviceCount" :min="1" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="createForm.remark" type="textarea" rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" :disabled="!canCreate" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detailDrawerVisible" title="工单详情" size="600px">
      <div v-if="currentOrder" style="padding: 0 20px">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="客户单位">{{ currentOrder.customerUnit }}</el-descriptions-item>
          <el-descriptions-item label="任务描述">{{ currentOrder.taskDesc }}</el-descriptions-item>
          <el-descriptions-item label="设备数量">{{ currentOrder.deviceCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{
              currentOrder.statusText || currentOrder.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createdAt || "-" }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || "-" }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"

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

type Row = {
  id: number
  orderNo: string
  customerUnit: string
  taskDesc: string
  deviceCount: number
  status: string | number
  statusText?: string
  createdAt?: string
  remark?: string
}

const searchForm = reactive({ orderNo: "", status: "" })
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)

const tableData = ref<Row[]>([])

const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  orderNo: "",
  customerUnit: "",
  taskDesc: "",
  deviceCount: 1,
  remark: ""
})

const createRules = {
  orderNo: [{ required: true, message: "请输入工单编号", trigger: "blur" }],
  customerUnit: [{ required: true, message: "请输入客户单位", trigger: "blur" }],
  taskDesc: [{ required: true, message: "请输入任务描述", trigger: "blur" }],
  deviceCount: [{ required: true, message: "请输入设备数量", trigger: "change" }]
}

const canCreate = computed(() => {
  return !!(createForm.orderNo && createForm.customerUnit && createForm.taskDesc && createForm.deviceCount)
})

const detailDrawerVisible = ref(false)
const currentOrder = ref<Row | null>(null)

const getStatusType = (status: number | string) => {
  const map: Record<string, string> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": "",
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  const key = typeof status === "number" ? String(status) : status
  return map[key] || ""
}

const getList = async () => {
  loading.value = true
  try {
    /* 注释掉实际接口调用
    const res = await getSimulationOrderList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
    */

    setTimeout(() => {
      const allMockData: Row[] = [
        {
          id: 1,
          orderNo: "SIM-20240312-001",
          customerUnit: "科索",
          taskDesc: "模拟井工况验证（低温段）",
          deviceCount: 12,
          status: 0,
          statusText: "已创建",
          createdAt: "2024-03-12 10:00:00",
          remark: "演示数据"
        },
        {
          id: 2,
          orderNo: "SIM-20240312-002",
          customerUnit: "中海油",
          taskDesc: "模拟井系统联调（压力循环）",
          deviceCount: 8,
          status: 1,
          statusText: "待领取",
          createdAt: "2024-03-12 11:20:00"
        },
        {
          id: 3,
          orderNo: "SIM-20240312-003",
          customerUnit: "科索",
          taskDesc: "模拟井耐久测试（72小时）",
          deviceCount: 5,
          status: 2,
          statusText: "测试中",
          createdAt: "2024-03-12 09:15:00",
          remark: "请关注异常报警"
        }
      ]

      let filtered = allMockData
      if (searchForm.orderNo) {
        filtered = filtered.filter((item) => item.orderNo.includes(searchForm.orderNo))
      }
      if (searchForm.status !== "" && searchForm.status !== undefined) {
        filtered = filtered.filter((item) => String(item.status) === String(searchForm.status))
      }

      tableData.value = filtered
      pagination.total = filtered.length
      loading.value = false
    }, 500)
  } catch (e) {
    console.error(e)
    loading.value = false
    ElMessage.error("获取列表失败")
  }
}

const handleSearch = () => {
  pagination.page = 1
  getList()
}

const handleReset = () => {
  searchForm.orderNo = ""
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
    orderNo: "",
    customerUnit: "",
    taskDesc: "",
    deviceCount: 1,
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
      /* 注释掉实际接口调用
      const res = await createSimulationOrder(createForm)
      if (res.code === 0) {
        ElMessage.success("创建成功")
        createDialogVisible.value = false
        getList()
      } else {
        ElMessage.error(res.msg || "创建失败")
      }
      */

      setTimeout(() => {
        ElMessage.success("创建成功 (演示)")
        createDialogVisible.value = false
        createLoading.value = false
        getList()
      }, 500)
    } catch (e) {
      console.error(e)
      ElMessage.error("创建失败")
      createLoading.value = false
    }
  })
}

const handleDetail = (row: Row) => {
  currentOrder.value = row
  detailDrawerVisible.value = true
}

const handlePublish = async (row: Row) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    /* 注释掉实际接口调用
    const res = await publishSimulationOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("发布成功")
      getList()
    } else {
      ElMessage.error(res.msg || "发布失败")
    }
    */

    ElMessage.success("发布成功 (演示)")
    row.status = 1
    row.statusText = "待领取"
  } catch (e) {
    console.error(e)
    ElMessage.error("发布失败")
  }
}

const handleDelete = async (row: Row) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    /* 注释掉实际接口调用
    const res = await deleteSimulationOrder(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    } else {
      ElMessage.error(res.msg || "删除失败")
    }
    */

    ElMessage.success("删除成功 (演示)")
    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    pagination.total = Math.max(0, pagination.total - 1)
  } catch (e) {
    console.error(e)
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
