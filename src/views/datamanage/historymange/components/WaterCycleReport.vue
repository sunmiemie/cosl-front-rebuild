<!-- 水循环 测试报告 -->

<template>
  <div class="water-cycle-report">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务单号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
        </el-form-item>
        <el-form-item label="测试人员">
          <el-input v-model="searchForm.tester" placeholder="全部人员" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增报告</el-button>
        </div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="180" align="center" />
          <el-table-column prop="task_number" label="任务单号" width="180" align="center" />
          <el-table-column prop="instrument_sn" label="被测 SN" width="170" align="center">
            <template #default="{ row }">{{ row.instrument_sn || "-" }}</template>
          </el-table-column>
          <el-table-column prop="test_date" label="测试日期" width="170" align="center" />
          <el-table-column prop="tester" label="测试人员" min-width="120" align="center" />
          <el-table-column prop="status_text" label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submit_time" label="提交时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.submit_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="audit_time" label="审核时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.audit_time) }}
            </template>
          </el-table-column>
          <el-table-column label="小助手同步" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getAssistantReportSyncTagType(row.assistant_sync_status)">
                {{ getAssistantReportSyncStatusText(row.assistant_sync_status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="同步时间" width="170" align="center">
            <template #default="{ row }">{{ formatTime(row.assistant_synced_at) }}</template>
          </el-table-column>
          <el-table-column label="同步尝试次数" width="110" align="center">
            <template #default="{ row }">{{ row.assistant_sync_retry_count || 0 }}</template>
          </el-table-column>
          <el-table-column label="同步失败原因" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">{{ row.assistant_sync_error || "-" }}</template>
          </el-table-column>
          <el-table-column label="操作" width="360" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleDetail(row)">详情</el-link>
              <el-link v-if="row.status === 0" type="warning" @click="handleEdit(row)">编辑</el-link>
              <el-link type="success" @click="handleDownload(row)">下载</el-link>
              <el-link
                v-if="row.status === 1"
                type="primary"
                :disabled="assistantPushingId !== null || row.assistant_sync_status === 'syncing'"
                @click="handlePushAssistant(row)"
              >
                {{ assistantPushingId === row.id ? "推送中" : "重新推送本申请单报告" }}
              </el-link>
              <el-link v-if="row.status === 0" type="danger" @click="handleDelete(row)">删除</el-link>
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

    <!-- 新增/编辑 对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="报告编号" prop="report_no">
          <el-input v-model="formData.report_no" placeholder="请输入报告编号" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="任务单号" prop="task_number">
          <el-select
            v-model="formData.task_number"
            filterable
            remote
            reserve-keyword
            :remote-method="loadOrderOptions"
            :loading="orderOptionsLoading"
            placeholder="搜索并选择水循环任务单"
            style="width: 100%"
            @change="handleOrderChange"
            @visible-change="handleOrderSelectVisible"
          >
            <el-option
              v-for="order in orderOptions"
              :key="order.id"
              :label="order.task_number"
              :value="order.task_number"
              :disabled="!orderHasInstrumentSn(order)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="被测 SN" prop="instrument_sn">
          <el-select
            v-model="formData.instrument_sn"
            filterable
            :disabled="!formData.task_number"
            :placeholder="instrumentSnOptions.length ? '请选择该任务单下的一个被测 SN' : '该任务单暂无可选 SN'"
            style="width: 100%"
          >
            <el-option
              v-for="option in instrumentSnOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="测试日期" prop="test_date">
          <el-date-picker
            v-model="formData.test_date"
            type="date"
            placeholder="请选择测试日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="测试人员" prop="tester">
          <el-input v-model="formData.tester" placeholder="请输入测试人员" />
        </el-form-item>
        <el-form-item label="审核状态" prop="status" v-if="formData.id">
          <el-select v-model="formData.status" placeholder="请选择审核状态" style="width: 100%">
            <el-option label="待审核" :value="0" />
            <el-option label="审核通过" :value="1" />
            <el-option label="审核未通过" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情 对话框 -->
    <el-dialog v-model="detailDialogVisible" title="报告详情" width="700px">
      <el-descriptions :column="2" border v-if="currentReport">
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
        <el-descriptions-item label="被测 SN">{{ currentReport.instrument_sn || "-" }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentReport.status)">{{ currentReport.status_text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
        <el-descriptions-item label="小助手同步状态">
          <el-tag :type="getAssistantReportSyncTagType(currentReport.assistant_sync_status)">
            {{ getAssistantReportSyncStatusText(currentReport.assistant_sync_status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="小助手同步时间">{{
          formatTime(currentReport.assistant_synced_at || undefined)
        }}</el-descriptions-item>
        <el-descriptions-item label="同步尝试次数">{{
          currentReport.assistant_sync_retry_count || 0
        }}</el-descriptions-item>
        <el-descriptions-item label="同步失败原因">{{
          currentReport.assistant_sync_error || "-"
        }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import {
  getWaterCycleReportListApi,
  createWaterCycleReportApi,
  getWaterCycleReportDetailApi,
  updateWaterCycleReportApi,
  deleteWaterCycleReportApi,
  getWaterCycleReportPdfApi,
  type WaterCycleReportListItem
} from "@/api/water-cycle-report"
import { getWaterCycleOrderListApi } from "@/api/water-cycle"
import type { WaterCycleOrderListItem } from "@/api/water-cycle/types"
import { syncEngineerAssistantReportsApi } from "@/api/engineer-assistant"
import {
  downloadPdfBlob,
  getAssistantReportSyncStatusText,
  getAssistantReportSyncTagType,
  getAssistantSyncError,
  getAssistantSyncFeedback,
  normalizeAssistantReportPushOutcome
} from "@/utils/assistant-report-sync"
import { buildReportInstrumentSnOptions } from "@/utils/report-instrument-sn"

const searchForm = reactive({
  taskNumber: "",
  tester: ""
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const loading = ref(false)
const tableData = ref<WaterCycleReportListItem[]>([])
const assistantPushingId = ref<number | null>(null)
const orderOptionsLoading = ref(false)
const orderOptions = ref<WaterCycleOrderListItem[]>([])

const detailDialogVisible = ref(false)
const currentReport = ref<WaterCycleReportListItem | null>(null)

// 新增/编辑 相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? "编辑报告" : "新增报告"))
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  report_no: "",
  task_number: "",
  instrument_sn: "",
  test_date: "",
  tester: "",
  status: 0,
  remark: ""
})

const formRules = {
  report_no: [{ required: true, message: "请输入报告编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请选择任务单号", trigger: "change" }],
  instrument_sn: [
    { required: true, message: "请选择该任务单下的一个被测 SN", trigger: "change" },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (!value || instrumentSnOptions.value.some((option) => option.value === value)) callback()
        else callback(new Error("所选 SN 不属于当前任务单，请重新选择"))
      },
      trigger: "change"
    }
  ],
  test_date: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  tester: [{ required: true, message: "请输入测试人员", trigger: "blur" }]
}

const selectedOrder = computed(() => orderOptions.value.find((order) => order.task_number === formData.task_number))
const instrumentSnOptions = computed(() => buildReportInstrumentSnOptions(selectedOrder.value?.instruments || []))

const orderHasInstrumentSn = (order: WaterCycleOrderListItem) => {
  return buildReportInstrumentSnOptions(order.instruments || []).length > 0
}

const loadOrderOptions = async (keyword = "") => {
  orderOptionsLoading.value = true
  try {
    const res = await getWaterCycleOrderListApi({
      page: 1,
      pageSize: 50,
      taskNumber: keyword.trim() || undefined
    })
    if (res?.code !== 0) throw new Error(res?.msg || "获取水循环任务单失败")
    orderOptions.value = res.data?.list || []
  } catch (error: any) {
    orderOptions.value = []
    ElMessage.error(error?.message || "获取水循环任务单失败")
  } finally {
    orderOptionsLoading.value = false
  }
}

const handleOrderChange = () => {
  formData.instrument_sn = ""
  formRef.value?.clearValidate("instrument_sn")
}

const handleOrderSelectVisible = (visible: boolean) => {
  if (visible && orderOptions.value.length === 0) void loadOrderOptions(formData.task_number)
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getWaterCycleReportListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber,
      tester: searchForm.tester
    })
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
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
  searchForm.tester = ""
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

const handleAdd = () => {
  formData.id = undefined
  formData.report_no = ""
  formData.task_number = ""
  formData.instrument_sn = ""
  formData.test_date = ""
  formData.tester = ""
  formData.status = 0
  formData.remark = ""
  dialogVisible.value = true
  void loadOrderOptions()
}

const handleEdit = async (row: WaterCycleReportListItem) => {
  if (row.status !== 0) {
    ElMessage.warning("已审核报告不可编辑；如需覆盖小助手快照，请使用重新推送")
    return
  }
  formData.id = row.id
  formData.report_no = row.report_no
  formData.task_number = row.task_number
  formData.instrument_sn = row.instrument_sn || ""
  formData.test_date = row.test_date
  formData.tester = row.tester
  formData.status = row.status
  formData.remark = row.remark || ""
  dialogVisible.value = true
  await loadOrderOptions(row.task_number)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (!instrumentSnOptions.value.some((option) => option.value === formData.instrument_sn)) {
      ElMessage.error("请选择当前任务单下的一个有效被测 SN")
      return
    }
    submitLoading.value = true
    try {
      const payload = { ...formData }
      delete payload.id
      let failedAssistantSyncMessage = ""
      let updatedReportId: number | undefined
      if (formData.id !== undefined) {
        updatedReportId = formData.id
        const response = await updateWaterCycleReportApi(formData.id, payload)
        const assistantSync = getAssistantSyncFeedback(response)
        if (assistantSync?.success === true) {
          ElMessage.success("修改成功，报告已同步小助手")
        } else if (assistantSync) {
          failedAssistantSyncMessage = getAssistantSyncError(assistantSync)
          ElMessage.warning(`修改及本地审核已保存，但推送小助手失败：${failedAssistantSyncMessage}`)
        } else {
          ElMessage.success("修改成功")
        }
      } else {
        await createWaterCycleReportApi(payload)
        ElMessage.success("新增成功")
      }
      dialogVisible.value = false
      await getList()
      if (updatedReportId && failedAssistantSyncMessage) {
        try {
          await ElMessageBox.confirm(
            `本地修改及审核已经保存，不会回滚。推送小助手失败：${failedAssistantSyncMessage}。是否立即重新推送？`,
            "本地保存成功，但小助手同步失败",
            {
              type: "warning",
              confirmButtonText: "立即重试",
              cancelButtonText: "稍后处理"
            }
          )
          await retryAssistantReport(updatedReportId)
        } catch (error) {
          if (error !== "cancel" && error !== "close") throw error
        }
      }
    } catch (e: any) {
      console.error("提交报告失败:", e)
      // 提取后端返回的具体错误信息
      const errorData = e.response?.data
      let errorMsg = "操作失败"
      if (errorData?.errors) {
        errorMsg = Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
          .join("; ")
      } else if (errorData?.msg) {
        errorMsg = errorData.msg
      }
      ElMessage.error(errorMsg)
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDetail = async (row: WaterCycleReportListItem) => {
  try {
    const res = await getWaterCycleReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handleDownload = async (row: WaterCycleReportListItem) => {
  try {
    const blob = await getWaterCycleReportPdfApi(row.id)
    await downloadPdfBlob(blob, row.report_no || "水循环测试报告")
    ElMessage.success("正式 PDF 下载开始")
  } catch (error: any) {
    console.error("下载水循环正式报告失败", error)
    ElMessage.error(error?.message || "正式 PDF 下载失败")
  }
}

const retryAssistantReport = async (reportId: number) => {
  assistantPushingId.value = reportId
  try {
    const response = await syncEngineerAssistantReportsApi({
      source: "local",
      action: "push",
      reportType: "water-cycle",
      reportId,
      force: true
    })
    const outcome = normalizeAssistantReportPushOutcome(response)
    if (outcome.success) {
      ElMessage.success("本申请单当前报告快照已推送小助手")
    } else {
      ElMessage.error(`本申请单当前报告快照推送失败：${outcome.error}`)
    }
    await getList()
  } catch (error: any) {
    const message = error?.response?.data?.msg || error?.message || "未知错误"
    ElMessage.error(`本申请单当前报告快照推送失败：${message}`)
    await getList()
  } finally {
    assistantPushingId.value = null
  }
}

const handlePushAssistant = async (row: WaterCycleReportListItem) => {
  await ElMessageBox.confirm("确定重新推送本申请单当前报告到小助手吗？", "重新推送本申请单报告", {
    type: "warning"
  })
  await retryAssistantReport(row.id)
}

const handleDelete = async (row: WaterCycleReportListItem) => {
  if (row.status !== 0) {
    ElMessage.warning("已审核报告不可删除")
    return
  }
  await ElMessageBox.confirm("确定要删除该报告吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteWaterCycleReportApi(row.id)
    if (res.code === 0) {
      ElMessage.success("删除成功")
      getList()
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("删除失败")
  }
}

const getStatusType = (status: number): "info" | "success" | "danger" | undefined => {
  switch (status) {
    case 0:
      return "info"
    case 1:
      return "success"
    case 2:
      return "danger"
    default:
      return undefined
  }
}

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-"
  const date = new Date(timeStr)
  return date.toLocaleString()
}

defineExpose({ resetSearch: handleReset })

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
