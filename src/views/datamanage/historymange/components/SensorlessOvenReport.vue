<!-- 无感烘箱 测试报告 -->

<template>
  <div class="sensorless-oven-report report-list-shell">
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
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border height="100%" style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="200" align="center" />
          <el-table-column prop="task_number" label="任务单号" width="180" align="center" />
          <el-table-column prop="test_date" label="测试日期" width="140" align="center" />
          <el-table-column prop="tester" label="测试人员" min-width="120" align="center" />
          <el-table-column prop="status_text" label="审核状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submit_time" label="提交时间" width="180" align="center">
            <template #default="{ row }">{{ formatTime(row.submit_time) }}</template>
          </el-table-column>
          <el-table-column prop="audit_time" label="审核时间" width="180" align="center">
            <template #default="{ row }">{{ formatTime(row.audit_time) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleDetail(row)">详情</el-link>
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

    <!-- 详情 对话框 -->
    <el-dialog v-model="detailDialogVisible" title="无感烘箱报告详情" width="760px">
      <template v-if="currentReport">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
          <el-descriptions-item label="任务单号">{{ currentReport.task_number }}</el-descriptions-item>
          <el-descriptions-item label="测试日期">{{ currentReport.test_date }}</el-descriptions-item>
          <el-descriptions-item label="测试人员">{{ currentReport.tester }}</el-descriptions-item>
          <el-descriptions-item label="审核状态">
            <el-tag :type="getStatusType(currentReport.status)">{{ currentReport.status_text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="整体结论">
            <el-tag :type="reportInfo.overallResult === 'fail' ? 'danger' : 'success'">{{ reportInfo.overallText }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标温度">{{ reportInfo.basic.target_temp ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="采集条数">{{ reportInfo.summary.point_count ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="温度最高值">{{ reportInfo.summary.max_temp ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="温度最低值">{{ reportInfo.summary.min_temp ?? "-" }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
          <el-descriptions-item label="审核时间">{{ formatTime(currentReport.audit_time) }}</el-descriptions-item>
          <el-descriptions-item label="结论说明" :span="2">{{ reportInfo.conclusion || "-" }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
        </el-descriptions>

        <el-table
          v-if="reportInfo.instruments.length"
          :data="reportInfo.instruments"
          size="small"
          border
          style="margin-top: 12px"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="instrument_name" label="仪器名称" />
          <el-table-column prop="instrument_sn" label="编号(SN)" />
          <el-table-column label="结论" width="100">
            <template #default="{ row }">
              <el-tag :type="row.result === 'fail' ? 'danger' : 'success'">
                {{ row.result === "fail" ? "不合格" : "合格" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="curveImages.length" class="report-curve-list">
          <div v-for="(url, idx) in curveImages" :key="url" class="report-curve-card">
            <div class="report-curve-head">
              <span>测试曲线{{ idx + 1 }}</span>
              <el-link :href="url" target="_blank" type="primary">下载/打开原图</el-link>
            </div>
            <el-image :src="url" fit="contain" :preview-src-list="curveImages" class="report-curve-image" />
          </div>
        </div>

        <div v-if="signatureUrl" class="report-signature-block">
          <span>测试人签名：</span>
          <el-image :src="signatureUrl" fit="contain" class="report-signature-image" />
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteSensorlessOvenReportApi,
  getSensorlessOvenReportDetailApi,
  getSensorlessOvenReportListApi,
  type SensorlessOvenReportListItem
} from "@/api/sensorless-oven-report"
import { getAttachmentFileUrl } from "@/utils/high-temp-pressure-paper-report"

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
const tableData = ref<SensorlessOvenReportListItem[]>([])
const detailDialogVisible = ref(false)
const currentReport = ref<SensorlessOvenReportListItem | null>(null)

const reportInfo = computed(() => {
  const rj = (currentReport.value?.report_json || {}) as Record<string, any>
  const overallResult = String(rj.overall_result || "")
  return {
    basic: (rj.basic_info || {}) as Record<string, any>,
    summary: (rj.summary || {}) as Record<string, any>,
    instruments: Array.isArray(rj.instruments) ? (rj.instruments as Array<Record<string, any>>) : [],
    overallResult,
    overallText:
      rj.overall_result_text || (overallResult === "fail" ? "不合格" : overallResult === "pass" ? "合格" : "-"),
    conclusion: String(rj.conclusion || "")
  }
})

const curveImages = computed(() =>
  ((currentReport.value?.attachments || []) as Array<Record<string, any>>)
    .filter((item) => ["testing_curve"].includes(String(item?.field || item?.type || "")))
    .map((item) => getAttachmentFileUrl(item))
    .filter((url): url is string => Boolean(url))
)

const signatureUrl = computed(() => {
  const sig = ((currentReport.value?.attachments || []) as Array<Record<string, any>>).find(
    (item) => String(item?.field || item?.type || "") === "tester_signature"
  )
  return sig ? getAttachmentFileUrl(sig) : ""
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getSensorlessOvenReportListApi({
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

const handleDetail = async (row: SensorlessOvenReportListItem) => {
  try {
    const res = await getSensorlessOvenReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = res.data
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handleDelete = async (row: SensorlessOvenReportListItem) => {
  if (row.status !== 0) {
    ElMessage.warning("已审核报告不可删除")
    return
  }
  await ElMessageBox.confirm("确定要删除该报告吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteSensorlessOvenReportApi(row.id)
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

const formatTime = (timeStr?: string | null) => {
  if (!timeStr) return "-"
  const date = new Date(timeStr)
  return date.toLocaleString()
}

defineExpose({ resetSearch: handleReset, getTableData: getList })

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
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
.report-curve-list {
  margin-top: 14px;
}
.report-curve-card {
  margin-bottom: 12px;
}
.report-curve-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.report-curve-image {
  width: 100%;
  height: 320px;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  background: #fff;
}
.report-signature-block {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.report-signature-image {
  width: 200px;
  height: 72px;
  border: 1px solid #eef1f6;
  border-radius: 8px;
  background: #fff;
}
</style>
