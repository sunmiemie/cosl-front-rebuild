<template>
  <div class="affix-container">
    <el-card class="search-wrapper" shadow="never">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="任务单编号">
          <el-input v-model="searchForm.taskNumber" placeholder="请输入任务单编号" clearable />
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
        <el-button type="primary" icon="CirclePlus" @click="showCreateDialog">新增振动台工单</el-button>
        <el-tooltip content="刷新当前页">
          <el-button type="primary" icon="RefreshRight" circle @click="getList" />
        </el-tooltip>
      </div>

      <div class="table-wrapper">
        <el-table :data="tableData" stripe border style="width: 100%">
          <el-table-column prop="tableNo" label="表格编号" width="160" align="center" />
          <el-table-column prop="taskNumber" label="任务单编号" width="180" align="center" />
          <el-table-column prop="applicant" label="申请人" width="120" align="center" />
          <el-table-column prop="testApplicationUnit" label="测试申请单位" min-width="160" align="center" />
          <el-table-column prop="projectName" label="项目名称" min-width="180" align="center" show-overflow-tooltip />
          <el-table-column prop="testType" label="测试类型" min-width="160" align="center" />
          <el-table-column label="仪器数量" width="100" align="center">
            <template #default="{ row }">{{ row.instrumentCount ?? row.instruments?.length ?? 0 }}</template>
          </el-table-column>
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

    <el-dialog
      v-model="createDialogVisible"
      title="创建振动台工单"
      width="1080px"
      :close-on-click-modal="false"
      class="vibration-order-dialog"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="150px">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="表格编号" prop="tableNo">
              <el-input v-model="createForm.tableNo" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务单编号" prop="taskNumber">
              <el-input v-model="createForm.taskNumber" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" placeholder="请输入申请人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人电话" prop="applicantPhone">
              <el-input v-model="createForm.applicantPhone" placeholder="请输入申请人电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试申请单位" prop="testApplicationUnit">
              <el-input v-model="createForm.testApplicationUnit" placeholder="请输入测试申请单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位负责人" prop="testApplicationUnitManager">
              <el-input v-model="createForm.testApplicationUnitManager" placeholder="请输入测试申请单位负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请日期" prop="applicationDate">
              <el-date-picker
                v-model="createForm.applicationDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择申请日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托人" prop="client">
              <el-input v-model="createForm.client" placeholder="请输入委托人" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">项目信息</el-divider>
        <el-row :gutter="18">
          <el-col :span="8">
            <el-form-item label="科研编号" prop="researchNumber">
              <el-input v-model="createForm.researchNumber" placeholder="请输入科研编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目预算编号" prop="projectBudgetNumber">
              <el-input v-model="createForm.projectBudgetNumber" placeholder="请输入项目预算编号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="createForm.projectName" placeholder="请输入项目名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="项目成员" prop="projectMembers">
              <el-input v-model="createForm.projectMembers" placeholder="多个成员可用顿号或逗号分隔" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">待测仪器</el-divider>
        <el-form-item label-width="0" prop="instruments" class="instrument-form-item">
          <el-table :data="createForm.instruments" border stripe class="instrument-table">
            <el-table-column label="待测仪器" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.instrumentName" placeholder="仪器名称" />
              </template>
            </el-table-column>
            <el-table-column label="仪器 SN 号/资产号" min-width="190">
              <template #default="{ row }">
                <el-input v-model="row.snNumbers" placeholder="多个编号用逗号分隔" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  controls-position="right"
                  class="quantity-input"
                />
              </template>
            </el-table-column>
            <el-table-column label="仪器重量" width="120">
              <template #default="{ row }">
                <el-input v-model="row.weight" placeholder="kg" />
              </template>
            </el-table-column>
            <el-table-column label="仪器长度" width="120">
              <template #default="{ row }">
                <el-input v-model="row.length" placeholder="mm" />
              </template>
            </el-table-column>
            <el-table-column label="最大直径" width="130">
              <template #default="{ row }">
                <el-input v-model="row.maxDiameter" placeholder="mm" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button
                  icon="Delete"
                  type="danger"
                  link
                  :disabled="createForm.instruments.length === 1"
                  @click="removeInstrument($index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <el-button class="add-instrument-button" icon="Plus" @click="addInstrument">添加仪器</el-button>
        </el-form-item>

        <el-divider content-position="left">测试参数</el-divider>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="时间" prop="plannedTime">
              <el-date-picker
                v-model="createForm.plannedTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择测试时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试类型" prop="testType">
              <el-select v-model="createForm.testType" placeholder="请选择测试类型" style="width: 100%">
                <el-option v-for="item in testTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试地点" prop="testLocation">
              <el-input v-model="createForm.testLocation" placeholder="请输入测试地点" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="振动方向" prop="vibrationDirection">
              <el-input v-model="createForm.vibrationDirection" placeholder="如 X/Y/Z" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="量级" prop="level">
              <el-input v-model="createForm.level" placeholder="请输入量级" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="加速度" prop="acceleration">
              <el-input v-model="createForm.acceleration" placeholder="如 5g" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="振动时长" prop="duration">
              <el-input v-model="createForm.duration" placeholder="如 30min" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="斜率" prop="slope">
              <el-input v-model="createForm.slope" placeholder="请输入斜率" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="频率" prop="frequency">
              <el-input v-model="createForm.frequency" placeholder="如 10-2000Hz" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="振动次数" prop="vibrationTimes">
              <el-input-number v-model="createForm.vibrationTimes" :min="1" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="仪器串组合" prop="instrumentCombination">
              <el-input v-model="createForm.instrumentCombination" placeholder="请输入仪器串组合" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">测试说明</el-divider>
        <el-form-item label="测试目的" prop="testPurpose">
          <el-input v-model="createForm.testPurpose" type="textarea" :rows="3" placeholder="请输入测试目的" />
        </el-form-item>
        <el-form-item label="设备清单" prop="equipmentList">
          <el-input v-model="createForm.equipmentList" type="textarea" :rows="3" placeholder="请输入设备清单" />
        </el-form-item>
        <el-form-item label="测试步骤" prop="testSteps">
          <el-input v-model="createForm.testSteps" type="textarea" :rows="4" placeholder="请输入测试步骤" />
        </el-form-item>
        <el-form-item label="安全风险及预防措施" prop="safetyRisks">
          <el-input v-model="createForm.safetyRisks" type="textarea" :rows="4" placeholder="请输入安全风险及预防措施" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="detailDialogVisible"
      title="工单详情"
      size="var(--test-order-detail-drawer-size)"
      class="test-order-detail-drawer"
    >
      <div v-if="currentOrder" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="表格编号">{{ currentOrder.tableNo }}</el-descriptions-item>
          <el-descriptions-item label="任务单编号">{{ currentOrder.taskNumber }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentOrder.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请人电话">{{ currentOrder.applicantPhone || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试申请单位">{{
            currentOrder.testApplicationUnit || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="单位负责人">
            {{ currentOrder.testApplicationUnitManager || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="申请日期">{{ currentOrder.applicationDate || "-" }}</el-descriptions-item>
          <el-descriptions-item label="委托人">{{ currentOrder.client || "-" }}</el-descriptions-item>
          <el-descriptions-item label="科研编号">{{ currentOrder.researchNumber || "-" }}</el-descriptions-item>
          <el-descriptions-item label="项目预算编号">{{
            currentOrder.projectBudgetNumber || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="项目名称" :span="2">{{ currentOrder.projectName || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试类型">{{ currentOrder.testType || "-" }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ currentOrder.plannedTime || "-" }}</el-descriptions-item>
          <el-descriptions-item label="测试地点" :span="2">{{ currentOrder.testLocation || "-" }}</el-descriptions-item>
          <el-descriptions-item label="使用设备">{{
            currentOrder.useDevice || currentOrder.deviceName || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="振动方向">{{ currentOrder.vibrationDirection || "-" }}</el-descriptions-item>
          <el-descriptions-item label="量级">{{ currentOrder.level || "-" }}</el-descriptions-item>
          <el-descriptions-item label="加速度">{{ currentOrder.acceleration || "-" }}</el-descriptions-item>
          <el-descriptions-item label="振动时长(min)">{{ currentOrder.duration || "-" }}</el-descriptions-item>
          <el-descriptions-item label="斜率">{{ currentOrder.slope || "-" }}</el-descriptions-item>
          <el-descriptions-item label="频率">{{ currentOrder.frequency || "-" }}</el-descriptions-item>
          <el-descriptions-item label="振动次数">{{ currentOrder.vibrationTimes || "-" }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">{{
              currentOrder.statusText || currentOrder.status
            }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目成员" :span="2">{{
            currentOrder.projectMembers || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="测试目的" :span="2">{{ currentOrder.testPurpose || "-" }}</el-descriptions-item>
          <el-descriptions-item label="设备清单" :span="2">{{
            currentOrder.equipmentList || "-"
          }}</el-descriptions-item>
          <el-descriptions-item label="仪器串组合" :span="2">
            {{ currentOrder.instrumentCombination || "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="测试步骤" :span="2">{{ currentOrder.testSteps || "-" }}</el-descriptions-item>
          <el-descriptions-item label="安全风险及预防措施" :span="2">
            {{ currentOrder.safetyRisks || "-" }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section-title">待测仪器</div>
        <el-table :data="currentOrder.instruments || []" border stripe>
          <el-table-column prop="instrumentName" label="待测仪器" min-width="130" align="center" />
          <el-table-column prop="snNumbers" label="仪器 SN 号/资产号" min-width="150" align="center" />
          <el-table-column prop="quantity" label="数量" width="76" align="center" />
          <el-table-column prop="weight" label="重量(kg)" width="86" align="center" />
          <el-table-column prop="length" label="长度(m)" width="86" align="center" />
          <el-table-column prop="maxDiameter" label="最大直径(mm)" width="96" align="center" />
        </el-table>

        <div class="detail-section-title pre-experiment-title">
          <span>预实验数据</span>
          <el-button
            v-if="currentOrder.preExperiments?.length"
            link
            type="success"
            @click="handleDownloadAllPreExperiments"
          >
            全部打包下载
          </el-button>
        </div>
        <el-empty v-if="!currentOrder.preExperiments?.length" description="暂无预实验数据" :image-size="64" />
        <div v-else class="pre-experiment-list">
          <el-card
            v-for="item in currentOrder.preExperiments"
            :key="item.id"
            class="pre-experiment-card"
            shadow="never"
          >
            <template #header>
              <div class="pre-experiment-card-head">
                <div>
                  <strong>第 {{ item.experimentNo }} 次预实验</strong>
                  <span>{{ formatTime(item.createdAt) }}</span>
                </div>
                <el-button link type="success" @click="handleDownloadPreExperiment(item)">打包下载</el-button>
              </div>
            </template>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="操作员">{{ item.tester || "-" }}</el-descriptions-item>
              <el-descriptions-item label="视频文件">{{
                displaySummaryValue(item.summary, "source_video_name")
              }}</el-descriptions-item>
              <el-descriptions-item label="采样记录">{{
                displaySummaryValue(item.summary, "record_count")
              }}</el-descriptions-item>
              <el-descriptions-item label="有效图像">{{
                displaySummaryValue(item.summary, "screen_detected_count")
              }}</el-descriptions-item>
              <el-descriptions-item label="平均响应">{{
                displaySummaryValue(item.summary, "avg_response")
              }}</el-descriptions-item>
              <el-descriptions-item label="最大驱动">{{
                displaySummaryValue(item.summary, "max_drive")
              }}</el-descriptions-item>
              <el-descriptions-item label="本地目录" :span="3">{{ item.exportDir || "-" }}</el-descriptions-item>
            </el-descriptions>
            <el-table :data="item.attachments || []" border size="small" class="pre-experiment-attachment-table">
              <el-table-column label="文件" min-width="160">
                <template #default="{ row }">{{ attachmentTitle(row) }}</template>
              </el-table-column>
              <el-table-column label="路径" min-width="220">
                <template #default="{ row }">{{ row.fileUrl || row.localPath || "-" }}</template>
              </el-table-column>
              <el-table-column label="大小" width="100" align="center">
                <template #default="{ row }">{{ formatBytes(row.size) }}</template>
              </el-table-column>
              <el-table-column label="预览/打开" width="140" align="center">
                <template #default="{ row }">
                  <el-image
                    v-if="isImageAttachment(row) && attachmentUrl(row)"
                    :src="attachmentUrl(row)"
                    :preview-src-list="[attachmentUrl(row)]"
                    fit="cover"
                    class="pre-experiment-preview"
                    preview-teleported
                  />
                  <el-link v-else-if="attachmentUrl(row)" :href="attachmentUrl(row)" target="_blank" type="primary">
                    打开
                  </el-link>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { defineExpose, onMounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import {
  createVibrationTableOrder,
  deleteVibrationTableOrder,
  downloadVibrationTableOrderPreExperimentsZip,
  downloadVibrationTablePreExperimentZip,
  getVibrationTableOrderDetail,
  getVibrationTableOrderList,
  publishVibrationTableOrder
} from "@/api/vibration-table"
import { useTaskCenterStoreHook } from "@/store/modules/task-center"
import type {
  VibrationInstrument,
  VibrationPreExperiment,
  VibrationPreExperimentAttachment,
  VibrationTableOrderDetail,
  VibrationTableOrderListItem
} from "@/api/vibration-table/types"

type TagType = "success" | "warning" | "info" | "primary" | "danger" | undefined
type CreateForm = Omit<
  VibrationTableOrderDetail,
  "id" | "status" | "statusText" | "createdAt" | "updatedAt" | "instrumentCount"
>

const statusOptions = [
  { value: "0", label: "已创建" },
  { value: "1", label: "待领取" },
  { value: "2", label: "测试中" },
  { value: "3", label: "待审核" },
  { value: "4", label: "待重测" },
  { value: "5", label: "已完成" },
  { value: "6", label: "异常" },
  { value: "7", label: "暂存" },
  { value: "8", label: "疑问" }
]

const testTypeOptions = ["40T振动台测试", "5T振动台测试", "1.5T冲击台测试"]

const searchForm = reactive({ taskNumber: "", status: "" })
const route = useRoute()
const taskCenterStore = useTaskCenterStoreHook()
const pagination = reactive({ page: 1, pageSize: 20, total: 0 })
const loading = ref(false)
const tableData = ref<VibrationTableOrderListItem[]>([])
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const detailDialogVisible = ref(false)
const currentOrder = ref<VibrationTableOrderDetail | null>(null)

const todayText = () => new Date().toISOString().split("T")[0]
const pad = (value: number) => String(value).padStart(3, "0")
const randomSeq = () => pad(Math.floor(Math.random() * 1000))
const generateTableNo = () => `VT-${todayText().replaceAll("-", "")}-${randomSeq()}`
const generateTaskNumber = () => `VT-TASK-${todayText().replaceAll("-", "")}-${randomSeq()}`

const createEmptyInstrument = (): VibrationInstrument => ({
  instrumentName: "",
  snNumbers: "",
  quantity: 1,
  weight: "",
  length: "",
  maxDiameter: ""
})

const createDefaultForm = (): CreateForm => ({
  tableNo: generateTableNo(),
  taskNumber: generateTaskNumber(),
  applicant: "",
  applicantPhone: "",
  testApplicationUnit: "",
  testApplicationUnitManager: "",
  applicationDate: todayText(),
  researchNumber: "",
  projectBudgetNumber: "",
  projectName: "",
  instruments: [createEmptyInstrument()],
  client: "",
  plannedTime: "",
  testLocation: "",
  testPurpose: "",
  testType: testTypeOptions[0],
  vibrationDirection: "",
  level: "",
  acceleration: "",
  duration: "",
  slope: "",
  frequency: "",
  vibrationTimes: 1,
  projectMembers: "",
  equipmentList: "",
  instrumentCombination: "",
  testSteps: "",
  safetyRisks: ""
})

const createForm = reactive<CreateForm>(createDefaultForm())

const validateInstruments = (_rule: unknown, value: VibrationInstrument[], callback: (error?: Error) => void) => {
  const instruments = Array.isArray(value) ? value : []
  if (instruments.length === 0) {
    callback(new Error("请至少添加一种待测仪器"))
    return
  }
  const invalidIndex = instruments.findIndex((item) => !item.instrumentName || !item.snNumbers || !item.quantity)
  if (invalidIndex >= 0) {
    callback(new Error(`请完善第 ${invalidIndex + 1} 行仪器名称、SN号和数量`))
    return
  }
  callback()
}

const createRules: FormRules<CreateForm> = {
  applicant: [{ required: true, message: "请输入申请人", trigger: "blur" }],
  applicantPhone: [{ required: true, message: "请输入申请人电话", trigger: "blur" }],
  testApplicationUnit: [{ required: true, message: "请输入测试申请单位", trigger: "blur" }],
  testApplicationUnitManager: [{ required: true, message: "请输入测试申请单位负责人", trigger: "blur" }],
  applicationDate: [{ required: true, message: "请选择申请日期", trigger: "change" }],
  projectName: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  client: [{ required: true, message: "请输入委托人", trigger: "blur" }],
  plannedTime: [{ required: true, message: "请选择时间", trigger: "change" }],
  testPurpose: [{ required: true, message: "请输入测试目的", trigger: "blur" }],
  testType: [{ required: true, message: "请选择测试类型", trigger: "change" }],
  vibrationDirection: [{ required: true, message: "请输入振动方向", trigger: "blur" }],
  level: [{ required: true, message: "请输入量级", trigger: "blur" }],
  acceleration: [{ required: true, message: "请输入加速度", trigger: "blur" }],
  duration: [{ required: true, message: "请输入振动时长", trigger: "blur" }],
  frequency: [{ required: true, message: "请输入频率", trigger: "blur" }],
  instruments: [{ validator: validateInstruments, trigger: "change" }]
}

const getStatusType = (status: number | string): TagType => {
  const map: Record<string, TagType> = {
    "0": "info",
    "1": "warning",
    "2": "primary",
    "3": "warning",
    "4": "danger",
    "5": "success",
    "6": "danger",
    "7": "info",
    "8": "warning"
  }
  return map[String(status)]
}

const formatTime = (time?: string) => {
  if (!time) return "-"
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return time
  return date.toLocaleString("zh-CN", { hour12: false })
}

const absoluteFileUrl = (url?: string) => {
  const text = String(url || "").trim()
  if (!text) return ""
  if (/^https?:\/\//i.test(text)) return text
  const base = String(import.meta.env.VITE_BASE_API || "").replace(/\/+$/, "")
  return `${base}${text.startsWith("/") ? text : `/${text}`}`
}

const attachmentUrl = (item: VibrationPreExperimentAttachment) => absoluteFileUrl(item.fileUrl)

const attachmentTitle = (item: VibrationPreExperimentAttachment) => item.name || item.fileName || item.type || "附件"

const isImageAttachment = (item: VibrationPreExperimentAttachment) => {
  const text = `${item.contentType || ""} ${item.name || ""} ${item.fileName || ""} ${item.fileUrl || ""}`.toLowerCase()
  return text.includes("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(text)
}

const displaySummaryValue = (summary: Record<string, any> | undefined, key: string) => {
  const value = summary?.[key]
  return value === undefined || value === null || value === "" ? "-" : value
}

const formatBytes = (size?: number) => {
  const value = Number(size || 0)
  if (!value) return "-"
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

const safeFileName = (text: string) => text.replace(/[\\/:*?"<>|]+/g, "_").trim() || "预实验"

const saveBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const handleDownloadPreExperiment = async (item: VibrationPreExperiment) => {
  try {
    const blob = await downloadVibrationTablePreExperimentZip(item.id)
    saveBlob(blob, safeFileName(`第${item.experimentNo}次预实验.zip`))
    ElMessage.success("下载开始")
  } catch (error) {
    console.error(error)
    ElMessage.error("下载失败")
  }
}

const handleDownloadAllPreExperiments = async () => {
  if (!currentOrder.value) return
  try {
    const blob = await downloadVibrationTableOrderPreExperimentsZip(currentOrder.value.id)
    const prefix = currentOrder.value.taskNumber || currentOrder.value.tableNo || "振动台工单"
    saveBlob(blob, safeFileName(`${prefix}-预实验数据.zip`))
    ElMessage.success("下载开始")
  } catch (error) {
    console.error(error)
    ElMessage.error("下载失败")
  }
}

const addInstrument = () => {
  createForm.instruments.push(createEmptyInstrument())
}

const removeInstrument = (index: number) => {
  if (createForm.instruments.length === 1) return
  createForm.instruments.splice(index, 1)
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
  } catch (error) {
    console.error(error)
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

const initSearchFromRoute = () => {
  const { taskNumber, status } = route.query
  searchForm.taskNumber = typeof taskNumber === "string" ? taskNumber : ""
  searchForm.status = typeof status === "string" ? status : ""
}

const shouldSyncRouteTask = () => {
  const { tab } = route.query
  return typeof tab !== "string" || tab === "vibration"
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
  Object.assign(createForm, createDefaultForm())
  createDialogVisible.value = true
}

const handleCreate = async () => {
  if (!createFormRef.value) return
  const valid = await createFormRef.value.validate().catch(() => false)
  if (!valid) return
  createLoading.value = true
  try {
    const res = await createVibrationTableOrder(createForm)
    if (res && res.code === 0) {
      ElMessage.success("创建成功")
      createDialogVisible.value = false
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res?.msg || "创建失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("创建失败")
  } finally {
    createLoading.value = false
  }
}

const handleDetail = async (row: VibrationTableOrderListItem) => {
  try {
    const res = await getVibrationTableOrderDetail(row.id)
    if (res && res.code === 0) {
      currentOrder.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res?.msg || "获取详情失败")
    }
  } catch (error) {
    console.error(error)
    ElMessage.error("获取详情失败")
  }
}

const handleDelete = async (row: VibrationTableOrderListItem) => {
  await ElMessageBox.confirm("确定要删除该工单吗？", "确认删除", { type: "warning" })
  try {
    const res = await deleteVibrationTableOrder(row.id)
    if (res && res.code === 0) {
      ElMessage.success("删除成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res?.msg || "删除失败")
    }
  } catch (error) {
    if (error !== "cancel") console.error(error)
  }
}

const handlePublish = async (row: VibrationTableOrderListItem) => {
  await ElMessageBox.confirm("确定要发布该工单吗？发布后将可被测试人员领取。", "确认发布", { type: "warning" })
  try {
    const res = await publishVibrationTableOrder(row.id)
    if (res && res.code === 0) {
      ElMessage.success("发布成功")
      void taskCenterStore.refresh(true)
      getList()
    } else {
      ElMessage.error(res?.msg || "发布失败")
    }
  } catch (error) {
    if (error !== "cancel") {
      console.error(error)
      ElMessage.error("发布失败")
    }
  }
}

defineExpose({ refresh: getList })

watch(
  () => route.fullPath,
  () => {
    if (!shouldSyncRouteTask()) return
    initSearchFromRoute()
    pagination.page = 1
    getList()
  }
)

onMounted(() => {
  initSearchFromRoute()
  getList()
})
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 20px;
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
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

.instrument-form-item {
  display: block;
}

.instrument-table {
  width: 100%;
}

.add-instrument-button {
  margin-top: 12px;
}

.quantity-input {
  width: 118px;
}

.detail-content {
  padding: 0 20px 24px;
}

.detail-section-title {
  margin: 18px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.pre-experiment-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pre-experiment-list {
  display: grid;
  gap: 12px;
}

.pre-experiment-card {
  border-radius: 8px;
}

.pre-experiment-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pre-experiment-card-head span {
  display: block;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.pre-experiment-attachment-table {
  margin-top: 12px;
}

.pre-experiment-preview {
  width: 56px;
  height: 42px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.vibration-order-dialog .el-dialog__body) {
  max-height: 68vh;
  overflow-y: auto;
}
</style>
