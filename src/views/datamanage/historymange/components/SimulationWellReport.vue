<template>
  <div class="simulation-well-audit">
    <el-card class="search-wrapper reviewer-card" shadow="never">
      <div class="toolbar-wrapper reviewer-toolbar">
        <div class="section-title">当前审核人员</div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="reviewer-body">
        <div class="reviewer-info">
          <div class="reviewer-name">{{ reviewerName }}</div>
          <div class="reviewer-role">{{ reviewerRole }}</div>
        </div>
        <div class="reviewer-sign">
          <div class="reviewer-sign-label">签字确认</div>
          <div class="reviewer-sign-box">
            <img v-if="signImageUrl" class="reviewer-sign-image" :src="signImageUrl" alt="签字图片" />
            <div v-else class="reviewer-sign-placeholder">{{ reviewerName }}</div>
          </div>
          <div class="reviewer-sign-actions">
            <el-upload
              v-model:file-list="signFileList"
              :auto-upload="false"
              :show-file-list="false"
              :limit="1"
              accept="image/*"
              :on-change="handleSignChange"
              :on-exceed="handleSignExceed"
            >
              <el-button size="small" type="primary" plain>上传签字图片</el-button>
            </el-upload>
            <el-button v-if="signImageUrl" size="small" type="danger" plain @click="clearSignImage"> 清除 </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="audit-card" shadow="never" v-loading="loading">
      <div class="toolbar-wrapper">
        <div class="section-title">待审核报告列表</div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="pendingTableData" stripe border style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="120" align="center" />
          <el-table-column prop="template_no" label="模板编号" width="160" align="center" />
          <el-table-column prop="job_no" label="作业编号" width="160" align="center" />
          <el-table-column prop="test_product" label="测试产品" min-width="180" align="center" />
          <el-table-column prop="operator_engineer" label="操作工程师" width="120" align="center" />
          <el-table-column prop="submit_time" label="提交时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.submit_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="status_text" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="warning">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">查看</el-link>
              <el-link type="success" class="el-link" @click="handleApprove(row)">通过</el-link>
              <el-link type="danger" class="el-link" @click="handleReject(row)">驳回</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="pendingPagination.page"
          v-model:page-size="pendingPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pendingTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePendingSizeChange"
          @current-change="handlePendingCurrentChange"
        />
      </div>
    </el-card>

    <el-card class="audit-card" shadow="never" v-loading="loading">
      <div class="toolbar-wrapper">
        <div class="section-title">已审核报告</div>
        <div>
          <el-tooltip content="刷新当前页">
            <el-button type="primary" icon="RefreshRight" circle @click="getList" />
          </el-tooltip>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="reviewedTableData" stripe border style="width: 100%">
          <el-table-column prop="report_no" label="报告编号" width="120" align="center" />
          <el-table-column prop="template_no" label="模板编号" width="160" align="center" />
          <el-table-column prop="job_no" label="作业编号" width="160" align="center" />
          <el-table-column prop="test_product" label="测试产品" min-width="180" align="center" />
          <el-table-column prop="operator_engineer" label="操作工程师" width="120" align="center" />
          <el-table-column prop="submit_time" label="提交时间" width="170" align="center">
            <template #default="{ row }">
              {{ formatTime(row.submit_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="status_text" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getReviewedStatusType(row.status)">{{ row.status_text }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" class="el-link" @click="handleDetail(row)">查看</el-link>
              <el-link type="success" class="el-link" @click="handleDownload(row)">下载</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pager-wrapper">
        <el-pagination
          v-model:current-page="reviewedPagination.page"
          v-model:page-size="reviewedPagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="reviewedTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleReviewedSizeChange"
          @current-change="handleReviewedCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="报告详情" width="720px">
      <el-descriptions v-if="currentReport" :column="2" border>
        <el-descriptions-item label="报告编号">{{ currentReport.report_no }}</el-descriptions-item>
        <el-descriptions-item label="模板编号">{{ currentReport.template_no }}</el-descriptions-item>
        <el-descriptions-item label="作业编号">{{ currentReport.job_no }}</el-descriptions-item>
        <el-descriptions-item label="测试产品">{{ currentReport.test_product }}</el-descriptions-item>
        <el-descriptions-item label="操作工程师">{{ currentReport.operator_engineer }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ formatTime(currentReport.submit_time) }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentReport.status === 0 ? 'warning' : getReviewedStatusType(currentReport.status)">
            {{ currentReport.status_text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentReport.remark || "-" }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox, type UploadFile, type UploadProps, type UploadUserFile } from "element-plus"
import { useUserStoreHook } from "@/store/modules/user"
import {
  getSimulatedWellReportListApi,
  getSimulatedWellReportDetailApi,
  updateSimulatedWellReportApi,
  type SimulatedWellReportListItem
} from "@/api/simulated-well-report"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type AuditRow = SimulatedWellReportListItem & {
  template_no: string
  job_no: string
  test_product: string
  operator_engineer: string
}

const userStore = useUserStoreHook()
const reviewerName = computed(() => userStore.nickName || userStore.username || "-")
const reviewerRole = computed(() => (userStore.roles?.length ? `角色：${userStore.roles.join(", ")}` : ""))

const signImageUrl = ref("")
const signFileList = ref<UploadUserFile[]>([])

const clearSignImage = () => {
  signImageUrl.value = ""
  signFileList.value = []
}

const handleSignExceed: UploadProps["onExceed"] = (_files) => {
  clearSignImage()
}

const handleSignChange: UploadProps["onChange"] = (file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  if (!raw.type.startsWith("image/")) {
    ElMessage.error("请上传图片格式文件")
    clearSignImage()
    return
  }
  if (raw.size > 5 * 1024 * 1024) {
    ElMessage.error("图片大小不能超过 5MB")
    clearSignImage()
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    signImageUrl.value = String(reader.result || "")
    signFileList.value = [{ name: raw.name, status: "success" }]
  }
  reader.readAsDataURL(raw)
}

const loading = ref(false)
const rows = ref<AuditRow[]>([])

const pendingAllRows = computed(() => rows.value.filter((r) => r.status === 0))
const reviewedAllRows = computed(() => rows.value.filter((r) => r.status !== 0))

const pendingPagination = reactive({
  page: 1,
  pageSize: 10
})
const reviewedPagination = reactive({
  page: 1,
  pageSize: 10
})

const pendingTotal = computed(() => pendingAllRows.value.length)
const reviewedTotal = computed(() => reviewedAllRows.value.length)

const pendingTableData = computed(() => {
  const start = (pendingPagination.page - 1) * pendingPagination.pageSize
  return pendingAllRows.value.slice(start, start + pendingPagination.pageSize)
})
const reviewedTableData = computed(() => {
  const start = (reviewedPagination.page - 1) * reviewedPagination.pageSize
  return reviewedAllRows.value.slice(start, start + reviewedPagination.pageSize)
})

const detailDialogVisible = ref(false)
const currentReport = ref<AuditRow | null>(null)

const formatTime = (timeStr?: string) => {
  if (!timeStr) return "-"
  const date = new Date(timeStr)
  return date.toLocaleString()
}

const getReviewedStatusType = (status: number): TagType => {
  if (status === 1) return "success"
  if (status === 2) return "danger"
  return "info"
}

const normalizeRow = (r: SimulatedWellReportListItem): AuditRow => ({
  ...r,
  template_no: "-",
  job_no: r.task_number,
  test_product: "-",
  operator_engineer: r.tester
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getSimulatedWellReportListApi({ page: 1, pageSize: 1000 })
    if (res.code === 0) {
      rows.value = res.data.list.map(normalizeRow)
    } else {
      rows.value = []
    }
    if ((pendingPagination.page - 1) * pendingPagination.pageSize >= pendingTotal.value) {
      pendingPagination.page = 1
    }
    if ((reviewedPagination.page - 1) * reviewedPagination.pageSize >= reviewedTotal.value) {
      reviewedPagination.page = 1
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取列表失败")
    rows.value = []
  } finally {
    loading.value = false
  }
}

const handlePendingSizeChange = (size: number) => {
  pendingPagination.pageSize = size
  pendingPagination.page = 1
}

const handlePendingCurrentChange = (page: number) => {
  pendingPagination.page = page
}

const handleReviewedSizeChange = (size: number) => {
  reviewedPagination.pageSize = size
  reviewedPagination.page = 1
}

const handleReviewedCurrentChange = (page: number) => {
  reviewedPagination.page = page
}

const handleDetail = async (row: AuditRow) => {
  try {
    const res = await getSimulatedWellReportDetailApi(row.id)
    if (res.code === 0) {
      currentReport.value = normalizeRow(res.data)
      detailDialogVisible.value = true
    }
  } catch (e) {
    console.error(e)
    ElMessage.error("获取详情失败")
  }
}

const handleApprove = async (row: AuditRow) => {
  await ElMessageBox.confirm("确认通过该报告审核吗？", "审核通过", { type: "warning" })
  try {
    const payload = {
      report_no: row.report_no,
      task_number: row.task_number,
      test_date: row.test_date,
      tester: row.tester,
      status: 1,
      remark: row.remark || ""
    }
    const res = await updateSimulatedWellReportApi(row.id, payload as any)
    if (res.code === 0) {
      ElMessage.success("已通过")
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e: any) {
    const errorData = e.response?.data
    const msg = errorData?.msg || "操作失败"
    ElMessage.error(msg)
  }
}

const handleReject = async (row: AuditRow) => {
  await ElMessageBox.confirm("确认驳回该报告吗？", "审核驳回", { type: "warning" })
  try {
    const payload = {
      report_no: row.report_no,
      task_number: row.task_number,
      test_date: row.test_date,
      tester: row.tester,
      status: 2,
      remark: row.remark || ""
    }
    const res = await updateSimulatedWellReportApi(row.id, payload as any)
    if (res.code === 0) {
      ElMessage.success("已驳回")
      getList()
    } else {
      ElMessage.error(res.msg || "操作失败")
    }
  } catch (e: any) {
    const errorData = e.response?.data
    const msg = errorData?.msg || "操作失败"
    ElMessage.error(msg)
  }
}

const handleDownload = (row: AuditRow) => {
  const payload = { ...row, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${row.report_no}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  getList()
})

defineExpose({
  resetSearch: getList
})
</script>

<style lang="scss" scoped>
.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}
.reviewer-card {
  :deep(.el-card__body) {
    padding-top: 14px;
  }
}
.audit-card {
  margin-bottom: 20px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 32px;
}
.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.reviewer-toolbar {
  margin-bottom: 10px;
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
.el-link:last-child {
  margin-right: 0;
}

.reviewer-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 8px 0 10px;
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}
.reviewer-info {
  padding-left: 12px;
}
.reviewer-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}
.reviewer-role {
  font-size: 12px;
  color: #8a8f98;
}
.reviewer-sign {
  width: 210px;
  padding-right: 10px;
  text-align: right;
}
.reviewer-sign-label {
  font-size: 12px;
  color: #8a8f98;
  margin-bottom: 8px;
}
.reviewer-sign-box {
  height: 50px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
}

.reviewer-sign-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.reviewer-sign-placeholder {
  width: 100%;
  text-align: center;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.reviewer-sign-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 900px) {
  .reviewer-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }
  .reviewer-info {
    padding-left: 0;
  }
  .reviewer-sign {
    width: 100%;
    padding-right: 0;
    text-align: left;
  }

  .reviewer-sign-actions {
    justify-content: flex-start;
  }
}
</style>
