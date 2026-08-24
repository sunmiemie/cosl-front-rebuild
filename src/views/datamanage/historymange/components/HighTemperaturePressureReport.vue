<template>
  <div class="high-temp-pressure-report report-list-shell">
    <el-card v-loading="loading" class="report-list-card" shadow="never">
      <div class="report-list-toolbar">
        <el-form :inline="true" :model="searchForm" class="report-filter-form">
          <el-form-item label="任务单号">
            <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单号" clearable />
          </el-form-item>
          <el-form-item label="测试人员">
            <el-input v-model="searchForm.tester" placeholder="全部人员" clearable />
          </el-form-item>
          <el-form-item label="审核状态">
            <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="report-toolbar-actions">
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button type="primary" icon="CirclePlus" @click="handleAdd">新增</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border height="100%" style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="180" align="center" />
          <el-table-column prop="task_number" label="任务单号" width="180" align="center" />
          <el-table-column prop="instrument_name" label="待测设备" min-width="140" align="center" />
          <el-table-column prop="instrument_sn" label="设备SN" min-width="140" align="center" />
          <el-table-column prop="attempt_no" label="轮次" width="75" align="center" />
          <el-table-column prop="test_date" label="测试日期" width="170" align="center" />
          <el-table-column prop="tester" label="测试人员" min-width="120" align="center" />
          <el-table-column prop="status_text" label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.is_current === false" type="info">重测历史</el-tag>
              <el-tag v-else :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
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
          <el-table-column label="操作" width="250" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleDetail(row)">详情</el-link>
              <el-link type="warning" @click="handleEdit(row)">编辑</el-link>
              <el-link type="success" @click="handleDownload(row)">下载</el-link>
              <el-button
                v-if="row.status === 1 && row.is_current !== false"
                :icon="Upload"
                :loading="assistantPushingId === row.id"
                link
                type="primary"
                @click="handlePushAssistant(row)"
              >
                推送
              </el-button>
              <el-link type="danger" @click="handleDelete(row)">删除</el-link>
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
          <el-input v-model="formData.task_number" placeholder="请输入任务单号" />
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
    <el-dialog v-model="detailDialogVisible" title="报告详情" width="980px">
      <el-descriptions :column="2" border v-if="currentReport">
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
        <el-descriptions-item label="待测设备">{{ currentReport.instrument_name || "-" }}</el-descriptions-item>
        <el-descriptions-item label="设备SN">{{ currentReport.instrument_sn || "-" }}</el-descriptions-item>
        <el-descriptions-item label="测试台 psi_id">{{ currentReport.equipment_id || "-" }}</el-descriptions-item>
        <el-descriptions-item label="测试轮次">{{ currentReport.attempt_no || 1 }}</el-descriptions-item>
        <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
        <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
        <el-descriptions-item label="总体结论">
          <el-tag :type="getResultTagType(currentReport.overall_result)">
            {{ getResultText(currentReport.overall_result) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="关联工单">{{
          currentReport.order_numbers?.join(" / ") || currentReport.task_number
        }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="getStatusType(currentReport.status)">{{ currentReport.status_text }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="currentReport" class="detail-block">
        <h4>逐台仪器结论</h4>
        <el-table :data="currentReport.instrument_results || []" border size="small">
          <el-table-column prop="order_no" label="工单号" min-width="130" />
          <el-table-column prop="instrument_name" label="仪器名称" min-width="150" />
          <el-table-column prop="instrument_sn" label="SN" min-width="150" />
          <el-table-column label="结论" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="getResultTagType(row.result)">{{ row.result_text || getResultText(row.result) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="observation" label="观察记录" min-width="180">
            <template #default="{ row }">{{ row.observation || "-" }}</template>
          </el-table-column>
          <el-table-column label="关键指标" min-width="220">
            <template #default="{ row }">{{ formatMetricValue(row.metrics) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="currentReport && currentPaperReportView.hasPaperReport" class="detail-block paper-report-block">
        <h4>纸质报告检查项</h4>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="报告格式">{{
            displayReportValue(currentPaperReportView.paperReport.title)
          }}</el-descriptions-item>
          <el-descriptions-item label="Ref No.">{{
            displayReportValue(currentPaperReportView.paperReport.ref_no)
          }}</el-descriptions-item>
          <el-descriptions-item label="名称 Name">{{
            displayReportValue(currentPaperReportView.testingItemInformation.name)
          }}</el-descriptions-item>
          <el-descriptions-item label="数量 Quantity">{{
            displayReportValue(currentPaperReportView.testingItemInformation.quantity)
          }}</el-descriptions-item>
          <el-descriptions-item label="编号 No.">{{
            displayReportValue(currentPaperReportView.testingItemInformation.no)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试压力 Testing Pressure">{{
            displayReportValue(currentPaperReportView.testingRequirements.testing_pressure)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试温度 Testing Temperature">{{
            displayReportValue(currentPaperReportView.testingRequirements.testing_temperature)
          }}</el-descriptions-item>
          <el-descriptions-item label="保温保压 Hold Time">{{
            displayReportValue(currentPaperReportView.testingRequirements.hold_time)
          }}</el-descriptions-item>
          <el-descriptions-item label="在线测试 Online Test">
            <el-tag :type="booleanReportTagType(currentPaperReportView.testingRequirements.online_test)">
              {{ formatReportYesNo(currentPaperReportView.testingRequirements.online_test) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="其他要求 Other Requirements">{{
            displayReportValue(currentPaperReportView.testingRequirements.other_requirements)
          }}</el-descriptions-item>
          <el-descriptions-item label="试压护帽 Testing Protective Cap">{{
            formatReportProvider(currentPaperReportView.fittingsProvided.testing_protective_cap)
          }}</el-descriptions-item>
          <el-descriptions-item label="试压堵头 Testing Plug">{{
            formatReportProvider(currentPaperReportView.fittingsProvided.testing_plug)
          }}</el-descriptions-item>
          <el-descriptions-item label="外观未变形 No Distorted">
            <el-tag :type="booleanReportTagType(currentPaperReportView.appearanceInspection.no_distorted)">
              {{ formatReportYesNo(currentPaperReportView.appearanceInspection.no_distorted, "未变形", "已变形") }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="无明显泄漏 No Obvious Leakage">
            <el-tag :type="booleanReportTagType(currentPaperReportView.appearanceInspection.no_obvious_leakage)">
              {{
                formatReportYesNo(
                  currentPaperReportView.appearanceInspection.no_obvious_leakage,
                  "无明显泄漏",
                  "有明显泄漏"
                )
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="测试曲线 Testing Curve">
            <el-tag :type="curveReportTagType(currentPaperReportView.testingResult.testing_curve)">
              {{ formatReportCurveStatus(currentPaperReportView.testingResult.testing_curve) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="其他描述 Other Descriptions">{{
            displayReportValue(currentPaperReportView.testingResult.other_descriptions)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试曲线份数">{{
            displayReportValue(currentPaperReportView.testingCurveAttachment.copies)
          }}</el-descriptions-item>
          <el-descriptions-item label="其他附件份数">{{
            displayReportValue(currentPaperReportView.otherAttachment.copies)
          }}</el-descriptions-item>
          <el-descriptions-item label="测试曲线路径" :span="2">{{
            displayReportValue(
              currentPaperReportView.flowCurveAttachments.map((item) => item.file_url || item.local_path)
            )
          }}</el-descriptions-item>
        </el-descriptions>
        <div v-for="item in currentCurveImages" :key="item.url" class="curve-preview-card">
          <div class="curve-preview-head">
            <span>图{{ item.index + 1 }} · {{ item.attachment.curve_title || `测试曲线${item.index + 1}` }}</span>
            <el-link :href="item.url" target="_blank" type="primary">下载/打开原图</el-link>
          </div>
          <el-image
            :src="item.url"
            fit="contain"
            :preview-src-list="currentCurveImages.map((image) => image.url)"
            class="curve-preview-image"
          />
        </div>
      </div>
      <div v-if="currentReport" class="detail-block detail-grid">
        <div>
          <el-collapse>
            <el-collapse-item title="采集摘要（调试信息）" name="capture-json">
              <pre>{{ compactJson(currentReport.report_json) }}</pre>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div>
          <h4>附件/文件</h4>
          <el-empty v-if="!currentReport.attachments?.length" description="暂无附件" :image-size="64" />
          <ul v-else class="attachment-list">
            <li
              v-for="(item, index) in currentReport.attachments"
              :key="index"
              :class="{ 'is-curve': isTestingCurveAttachment(item) }"
            >
              <el-tag v-if="isTestingCurveAttachment(item)" size="small" type="success">测试曲线</el-tag>
              {{ getAttachmentTitle(item) }}
              <span>{{ getAttachmentPath(item) }}</span>
              <el-link
                v-if="getAttachmentFileUrl(item)"
                :href="getAttachmentFileUrl(item)"
                target="_blank"
                type="primary"
              >
                下载/打开
              </el-link>
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineExpose, computed } from "vue"
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus"
import { Upload } from "@element-plus/icons-vue"
import { syncEngineerAssistantLocalReportApi } from "@/api/engineer-assistant"
import {
  getHighTempPressureReportListApi,
  createHighTempPressureReportApi,
  getHighTempPressureReportDetailApi,
  getHighTempPressureReportPdfApi,
  updateHighTempPressureReportApi,
  deleteHighTempPressureReportApi,
  type HighTempPressureReportListItem
} from "@/api/high-temp-pressure-report"
import {
  booleanReportTagType,
  curveReportTagType,
  displayReportValue,
  formatReportCurveStatus,
  formatReportProvider,
  formatReportYesNo,
  getAttachmentFileUrl,
  getAttachmentPath,
  getAttachmentTitle,
  getHighTempPressurePaperReportView,
  isTestingCurveAttachment
} from "@/utils/high-temp-pressure-paper-report"

const searchForm = reactive({
  taskNumber: "",
  tester: "",
  status: "" as "" | number
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const loading = ref(false)
const assistantPushingId = ref<number | null>(null)
const tableData = ref<HighTempPressureReportListItem[]>([])

const detailDialogVisible = ref(false)
const currentReport = ref<HighTempPressureReportListItem | null>(null)
const currentPaperReportView = computed(() =>
  getHighTempPressurePaperReportView(currentReport.value?.report_json, currentReport.value?.attachments)
)
const currentCurveImages = computed(() =>
  currentPaperReportView.value.flowCurveAttachments
    .map((attachment, index) => ({ attachment, index, url: getAttachmentFileUrl(attachment) }))
    .filter((item) => Boolean(item.url))
)

// 新增/编辑 相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => (formData.id ? "编辑报告" : "新增报告"))
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formData = reactive({
  id: undefined as number | undefined,
  report_no: "",
  task_number: "",
  test_date: "",
  tester: "",
  status: 0,
  remark: ""
})

const formRules = {
  report_no: [{ required: true, message: "请输入报告编号", trigger: "blur" }],
  task_number: [{ required: true, message: "请输入任务单号", trigger: "blur" }],
  test_date: [{ required: true, message: "请选择测试日期", trigger: "change" }],
  tester: [{ required: true, message: "请输入测试人员", trigger: "blur" }]
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHighTempPressureReportListApi({
      page: pagination.page,
      pageSize: pagination.pageSize,
      taskNumber: searchForm.taskNumber,
      tester: searchForm.tester,
      status: searchForm.status
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

const handleAdd = () => {
  formData.id = undefined
  formData.report_no = ""
  formData.task_number = ""
  formData.test_date = ""
  formData.tester = ""
  formData.status = 0
  formData.remark = ""
  dialogVisible.value = true
}

const handleEdit = (row: HighTempPressureReportListItem) => {
  formData.id = row.id
  formData.report_no = row.report_no
  formData.task_number = row.task_number
  formData.test_date = row.test_date
  formData.tester = row.tester
  formData.status = row.status
  formData.remark = row.remark || ""
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const payload = { ...formData }
      delete payload.id
      if (formData.id !== undefined) {
        await updateHighTempPressureReportApi(formData.id, payload)
        ElMessage.success("修改成功")
      } else {
        await createHighTempPressureReportApi(payload)
        ElMessage.success("新增成功")
      }
      dialogVisible.value = false
      getList()
    } catch (e: unknown) {
      console.error("提交报告失败:", e)
      const errorData = (e as { response?: { data?: { errors?: Record<string, unknown>; msg?: string } } }).response
        ?.data
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

const handleDetail = async (row: HighTempPressureReportListItem) => {
  try {
    const res = await getHighTempPressureReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handleDownload = async (row: HighTempPressureReportListItem) => {
  try {
    const blob = await getHighTempPressureReportPdfApi(row.id)
    const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" })
    const url = URL.createObjectURL(pdfBlob)
    const filename = `${(row.report_no || "高温高压测试报告").replace(/[\\/:*?"<>|]/g, "-")}.pdf`

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
    ElMessage.success("PDF下载开始")
  } catch (e) {
    console.error(e)
    ElMessage.error("PDF下载失败")
  }
}

const handlePushAssistant = async (row: HighTempPressureReportListItem) => {
  await ElMessageBox.confirm("确定重新推送该正式报告到工程师小助手吗？", "推送报告", { type: "warning" })
  assistantPushingId.value = row.id
  try {
    await syncEngineerAssistantLocalReportApi({
      reportType: "high-temp-pressure",
      reportId: row.id
    })
    ElMessage.success("报告已推送到小助手")
  } catch (error) {
    console.error("推送高温高压报告失败", error)
    ElMessage.error("报告推送失败，请检查正式附件和同步日志")
  } finally {
    assistantPushingId.value = null
  }
}

const handleDelete = async (row: HighTempPressureReportListItem) => {
  await ElMessageBox.confirm("确定要删除该报告吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteHighTempPressureReportApi(row.id)
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

const getResultText = (result?: string) => {
  if (result === "pass") return "合格"
  if (result === "fail") return "不合格"
  return "待定"
}

const getResultTagType = (result?: string): "success" | "warning" | "danger" => {
  if (result === "pass") return "success"
  if (result === "fail") return "danger"
  return "warning"
}

const compactJson = (value?: Record<string, unknown>) => {
  if (!value || !Object.keys(value).length) return "-"
  return JSON.stringify(value, null, 2)
}

const formatMetricValue = (metrics?: Record<string, unknown>) => {
  if (!metrics || !Object.keys(metrics).length) return "-"
  return (
    Object.entries(metrics)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}: ${value}`)
      .join("；") || "-"
  )
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
.detail-block {
  margin-top: 16px;
}
.detail-block h4 {
  margin: 0 0 10px;
  color: #24323a;
  font-size: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.paper-report-block {
  padding: 14px;
  border: 1px solid #dce6ee;
  border-radius: 12px;
  background: #fbfcf8;
}
.curve-preview-card {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #b8e3c6;
  border-radius: 12px;
  background: #f0fdf4;
}
.curve-preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
}
.curve-preview-image {
  width: 100%;
  height: 320px;
  border: 1px solid #dcfce7;
  border-radius: 10px;
  background: #fff;
}
.detail-grid pre {
  max-height: 220px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #dce6ee;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  white-space: pre-wrap;
}
.attachment-list {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  font-size: 13px;
}
.attachment-list li {
  margin-bottom: 8px;
}
.attachment-list li.is-curve {
  padding: 8px 10px;
  border: 1px solid #b8e3c6;
  border-radius: 8px;
  background: #f0fdf4;
  list-style: none;
}
.attachment-list span {
  display: block;
  color: #64748b;
  font-size: 12px;
  word-break: break-all;
}
</style>
