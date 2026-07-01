<template>
  <div class="circuit-task-page">
    <section class="application-panel">
      <div class="filter-bar">
        <el-input v-model="searchForm.keyword" clearable placeholder="搜索申请单名称 / 编号" />
        <div class="filter-row">
          <el-select v-model="searchForm.status" class="filter-select" placeholder="全部状态">
            <el-option label="全部状态" value="all" />
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.label" :value="item.key" />
          </el-select>
          <el-select v-model="searchForm.orderType" class="filter-select" placeholder="全部性质">
            <el-option label="全部性质" value="all" />
            <el-option label="生产测试工单" value="production" />
            <el-option label="临时测试工单" value="temporary" />
          </el-select>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </div>
      </div>

      <div class="list-actions">
        <el-button type="primary" :icon="Plus" @click="handleCreateApplication">新建</el-button>
        <el-button :disabled="!canBatchPublish" @click="batchPublishApplications">批量发布</el-button>
        <span v-if="selectedApplicationIds.length" class="selected-count"
          >已选 {{ selectedApplicationIds.length }} 项</span
        >
        <el-button class="refresh-action" :icon="RefreshRight" :loading="loading" @click="loadApplications"
          >刷新</el-button
        >
      </div>

      <el-scrollbar v-loading="loading" class="application-list">
        <el-empty v-if="filteredApplications.length === 0" description="该条件下暂无申请单" />
        <div
          v-for="application in filteredApplications"
          v-else
          :key="application.key"
          class="application-card"
          :class="{ selected: selectedApplication?.key === application.key }"
          role="button"
          tabindex="0"
          @click="openApplicationDetail(application)"
          @keydown.enter.prevent="openApplicationDetail(application)"
          @keydown.space.prevent="openApplicationDetail(application)"
        >
          <el-checkbox
            :model-value="selectedApplicationIds.includes(application.key)"
            @click.stop
            @change="toggleApplicationSelection(application.key)"
          />
          <div class="application-main">
            <div class="application-no">{{ application.orderNo }}</div>
            <div class="application-name">{{ application.name }}</div>
            <div class="application-meta">
              <el-tag effect="light">{{ application.typeLabel }}</el-tag>
              <el-tag :type="application.generatedOrderType === 'production' ? 'warning' : 'primary'" effect="plain">
                {{ application.generatedOrderTypeText }}
              </el-tag>
              <span>{{ application.boardCount }} 块板</span>
              <el-tag :type="application.statusTagType" effect="light">{{ application.statusLabel }}</el-tag>
            </div>
          </div>
          <div class="application-actions">
            <el-button
              size="small"
              :type="application.primaryType"
              :loading="isPublishing(application) || isAnyBoardPublishing(application)"
              :disabled="isApplicationPublishable(application) && !application.boards.length"
              @click.stop="handlePrimaryAction(application)"
            >
              {{ getApplicationPrimaryText(application) }}
            </el-button>
            <el-button
              v-if="getApplicationPrintableBoards(application).length"
              size="small"
              :icon="Printer"
              @click.stop="handlePrintOrderQrcodes(application)"
            >
              打印二维码
            </el-button>
          </div>
        </div>
      </el-scrollbar>
    </section>

    <el-dialog v-model="createDialogVisible" title="新建电路板模块申请单" width="760px" :close-on-click-modal="false">
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="申请单号" prop="orderNo">
              <el-input v-model="createForm.orderNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电路板编号" prop="sn">
              <el-input v-model="createForm.sn" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块名称" prop="moduleName">
              <el-input v-model="createForm.moduleName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号" prop="specModel">
              <el-input v-model="createForm.specModel" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测试工艺" prop="device">
              <el-select v-model="createForm.device" style="width: 100%">
                <el-option v-for="option in CIRCUIT_PROCESS_OPTIONS" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="createForm.quantity" :min="1" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长" prop="hours">
              <el-input-number v-model="createForm.hours" :min="1" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="委托编号" prop="commissionNo">
              <el-input v-model="createForm.commissionNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否需要检测工艺" prop="sfxyjcgy">
              <el-select v-model="createForm.sfxyjcgy" style="width: 100%">
                <el-option label="是" value="是" />
                <el-option label="否" value="否" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请人" prop="applicant">
              <el-input v-model="createForm.applicant" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户" prop="client">
              <el-input v-model="createForm.client" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="createForm.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="createForm.remark" :rows="2" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createSaving" @click="handleSaveApplication">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      class="circuit-detail-dialog"
      title="申请单详情"
      width="min(1280px, 98vw)"
      :close-on-click-modal="false"
    >
      <template v-if="selectedApplication">
        <div class="detail-top">
          <div class="detail-title">
            {{ selectedApplication.name }}
            <el-tag :type="selectedApplication.statusTagType" effect="light">{{
              selectedApplication.statusLabel
            }}</el-tag>
          </div>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="单据编号">{{ selectedApplication.orderNo || "-" }}</el-descriptions-item>
            <el-descriptions-item label="委托单位">{{ selectedApplication.client || "-" }}</el-descriptions-item>
            <el-descriptions-item label="项目编码">{{ selectedApplication.projectCode || "-" }}</el-descriptions-item>
            <el-descriptions-item label="项目预算编码">{{
              selectedApplication.projectBudgetCode || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ selectedApplication.name || "-" }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ selectedApplication.address || "-" }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ selectedApplication.mobilePhone || "-" }}</el-descriptions-item>
            <el-descriptions-item label="座机">{{ selectedApplication.landline || "-" }}</el-descriptions-item>
            <el-descriptions-item label="实验类型">{{
              selectedApplication.experimentType || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="试验电路板状态">{{
              selectedApplication.boardState || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="测试工艺">{{ selectedApplication.craft || "-" }}</el-descriptions-item>
            <el-descriptions-item label="是否需要检测工艺">{{
              selectedApplication.sfxyjcgy || "-"
            }}</el-descriptions-item>
            <el-descriptions-item label="申请人名称">{{ selectedApplication.applicant || "-" }}</el-descriptions-item>
            <el-descriptions-item label="申请日期">{{ selectedApplication.applyDate || "-" }}</el-descriptions-item>
            <el-descriptions-item label="文件名">{{ selectedApplication.filename || "-" }}</el-descriptions-item>
            <el-descriptions-item label="创建人">{{ selectedApplication.createBy || "-" }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedApplication.createTime || "-" }}</el-descriptions-item>
            <el-descriptions-item label="更新人">{{ selectedApplication.updateBy || "-" }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ selectedApplication.updateTime || "-" }}</el-descriptions-item>
          </el-descriptions>
          <div class="detail-actions">
            <el-button
              v-if="isApplicationPublishable(selectedApplication)"
              type="success"
              :loading="
                selectedApplication
                  ? isPublishing(selectedApplication) || isAnyBoardPublishing(selectedApplication)
                  : false
              "
              :disabled="!getPublishableBoards(selectedApplication).length || isAnyBoardPublishing(selectedApplication)"
              @click="publishApplication(selectedApplication)"
            >
              {{ getApplicationPublishText(selectedApplication) }}
            </el-button>
            <el-button v-if="selectedApplication.orderNo" @click="openBindingDialog(selectedApplication)">
              查看关联
            </el-button>
            <el-button
              v-if="selectedApplication.boards.length"
              :icon="Printer"
              @click="handlePrintOrderQrcodes(selectedApplication)"
            >
              打印二维码
            </el-button>
          </div>
        </div>

        <section v-if="selectedApplication.boards.length" class="board-list-section">
          <div class="board-section-header">
            <div>
              <span class="section-title">电路板列表</span>
              <span class="section-count">共 {{ selectedApplication.boardCount }} 块</span>
            </div>
            <div>
              <el-button :disabled="selectedBoardRows.length === 0" :icon="Printer" @click="handlePrintSelectedBoards">
                打印选中二维码
              </el-button>
            </div>
          </div>
          <el-table
            :data="selectedApplication.boards"
            class="board-list-table"
            border
            height="340"
            row-key="seria"
            table-layout="fixed"
            @selection-change="selectedBoardRows = $event"
          >
            <el-table-column type="selection" width="42" />
            <el-table-column label="样品信息">
              <template #default="{ row }">
                <div class="board-cell">
                  <div class="board-cell__primary">{{ row.sampleName || "-" }}</div>
                  <div class="board-cell__meta">SN：{{ row.sn || row.serial || "-" }}</div>
                  <div class="board-cell__meta">物料号：{{ row.materialNo || "-" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="批次/型号">
              <template #default="{ row }">
                <div class="board-cell">
                  <div class="board-cell__primary">批次：{{ row.batchNo || "-" }}</div>
                  <div class="board-cell__meta">型号：{{ row.model || "-" }}</div>
                  <div class="board-cell__meta">数量：{{ row.quantity || "-" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="委托/供应商">
              <template #default="{ row }">
                <div class="board-cell">
                  <div class="board-cell__primary">委托人：{{ row.consignor || "-" }}</div>
                  <div class="board-cell__meta">供应商：{{ row.supplier || "-" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="时间">
              <template #default="{ row }">
                <div class="board-cell">
                  <div class="board-cell__primary">{{ row.createTime || "-" }}</div>
                  <div class="board-cell__meta">创建人：{{ row.createBy || "-" }}</div>
                  <div class="board-cell__meta">更新：{{ row.updateTime || "-" }}</div>
                  <div class="board-cell__meta">更新人：{{ row.updateBy || "-" }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="92">
              <template #default="{ row }">
                <el-tag :type="getBoardStatus(row.status).tagType" effect="light">
                  {{ getBoardStatus(row.status).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="158" fixed="right">
              <template #default="{ row }">
                <div class="board-actions">
                  <el-button link type="primary" :icon="Printer" @click="handlePrintBoardQrcode(row)">二维码</el-button>
                  <el-button link type="primary" @click="openBoardDetail(row)">详情</el-button>
                  <el-button
                    v-if="isBoardPublishable(selectedApplication, row)"
                    link
                    type="success"
                    :loading="isBoardPublishing(selectedApplication, row)"
                    :disabled="isPublishing(selectedApplication)"
                    @click="publishBoard(selectedApplication, row)"
                  >
                    {{ getBoardPublishText(selectedApplication, row) }}
                  </el-button>
                  <el-button v-if="row.status === 'in_progress'" link @click="completeBoard(row)">完成</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="boardDetailVisible" title="电路板详情" width="min(920px, 96vw)" :close-on-click-modal="false">
      <el-descriptions v-if="selectedBoardDetail" :column="3" border class="board-detail-descriptions">
        <el-descriptions-item label="所属产品">{{ getBoardDetailValue("product", "sscp") }}</el-descriptions-item>
        <el-descriptions-item label="测试品名称">{{
          getBoardDetailValue("sampleName", "ypmc", "name")
        }}</el-descriptions-item>
        <el-descriptions-item label="物料号">{{ getBoardDetailValue("materialNo", "wlh") }}</el-descriptions-item>
        <el-descriptions-item label="规格型号">{{ getBoardDetailValue("model", "ggxh") }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ getBoardDetailValue("supplier", "gysmc") }}</el-descriptions-item>
        <el-descriptions-item label="批次号">{{ getBoardDetailValue("batchNo", "pch") }}</el-descriptions-item>
        <el-descriptions-item label="数量">{{ getBoardDetailValue("quantity", "sl") }}</el-descriptions-item>
        <el-descriptions-item label="SN号">{{ getBoardSnDetailValue() }}</el-descriptions-item>
        <el-descriptions-item label="所属单位">{{ getBoardDetailValue("unit", "ssdw") }}</el-descriptions-item>
        <el-descriptions-item label="测试类别">{{ getBoardDetailValue("testCategory", "cslb") }}</el-descriptions-item>
        <el-descriptions-item label="测试内容">{{ getBoardDetailValue("testContent", "csnr") }}</el-descriptions-item>
        <el-descriptions-item label="初检/复检">{{
          getBoardDetailValue("initialInspection", "cjfj")
        }}</el-descriptions-item>
        <el-descriptions-item label="委托人">{{ getBoardDetailValue("consignor", "wtr") }}</el-descriptions-item>
        <el-descriptions-item label="合同号">{{ getBoardDetailValue("contractNo", "hth") }}</el-descriptions-item>
        <el-descriptions-item label="到货日期">{{ getBoardDetailValue("arrivalDate", "dhrq") }}</el-descriptions-item>
        <el-descriptions-item label="X-Ray检测">{{ getBoardDetailValue("xray", "ray") }}</el-descriptions-item>
        <el-descriptions-item label="弓曲度检测">{{ getBoardDetailValue("bow", "gqd") }}</el-descriptions-item>
        <el-descriptions-item label="2D留存检测">{{ getBoardDetailValue("twoD", "towtest") }}</el-descriptions-item>
        <el-descriptions-item label="3D检测">{{ getBoardDetailValue("threeD", "threetest") }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="boardDetailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="bindingDialogVisible"
      title="申请单关联结果"
      width="min(980px, 96vw)"
      :close-on-click-modal="false"
    >
      <div class="binding-dialog__header">申请单号：{{ bindingApplicationNo || "-" }}</div>
      <el-table v-loading="bindingLoading" :data="bindingRows" border max-height="420" table-layout="fixed">
        <el-table-column prop="applicationNum" label="申请单号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="applicationId" label="申请 ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="orderId" label="委托单 ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="sampleId" label="样品 ID" min-width="120" show-overflow-tooltip />
        <el-table-column prop="boardId" label="电路板 ID" min-width="140" show-overflow-tooltip />
        <el-table-column prop="fpNumber" label="分批号" min-width="140" show-overflow-tooltip />
      </el-table>
      <template #footer>
        <el-button @click="bindingDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus"
import { Plus, Printer, Refresh, RefreshRight } from "@element-plus/icons-vue"
import {
  getEngineerAssistantCommissionBindingsApi,
  getEngineerAssistantUsersApi,
  pushEngineerAssistantCommissionOrdersApi
} from "@/api/engineer-assistant"
import {
  getCircuitModuleApplicationList,
  getCircuitModulePublishMissingBoards,
  syncCircuitModuleApplicationList,
  type CircuitModuleApplicationRelation
} from "@/api/circuit-module-application"
import type {
  EngineerAssistantCommissionBinding,
  EngineerAssistantUser,
  PushEngineerAssistantCommissionOrdersBody
} from "@/api/engineer-assistant/types"
import { getProdBoardDataBySn } from "@/api/board"
import { getTempBoardDataApi } from "@/api/temp-board"
import {
  createDevTestUnitApi,
  createTestUnitApi,
  getTempTestMangeTable,
  getTestMangeTable,
  getboardsinfoForTempOrder,
  getbordsinfo,
  postDevUnits,
  postUnits
} from "@/api/testMangelist"
import { getTempTestTypeDataApi, getTempTestTypeForProdBoard, getTestTypeDataApi } from "@/api/testtype"
import { getAvailableFunctionalTestingProcess } from "@/api/addprocess"
import { useUserStore } from "@/store/modules/user"
import { printBoardQrcodes, type QrcodeBoardRow } from "@/utils/printQrcode"
import {
  CIRCUIT_PROCESS_OPTIONS,
  getCraftFlagText,
  getDisplayString,
  getGeneratedOrderType,
  getGeneratedOrderTypeText,
  getString,
  formatMissingBoards,
  mapDlbBoardToUiBoard,
  normalizeDlbBoardState,
  normalizeCircuitProcessName,
  resolveCircuitProcessName,
  type CircuitApplicationUiBoard
} from "./circuit-application-helpers"

type ApplicationTypeKey = "电路板模块"
type ApplicationStatus = "draft" | "partial" | "published" | "scheduling" | "in_progress" | "done"
type StatusFilter = ApplicationStatus | "all"
type GeneratedOrderFilter = "production" | "temporary" | "all"

interface CircuitApplicationBoard
  extends Omit<QrcodeBoardRow, "id" | "model" | "name" | "seria" | "sn" | "startTime">,
    CircuitApplicationUiBoard {
  seria: string
  name: string
  serial: string
  status: ApplicationStatus
}

interface ResolvedGeneratedTestType {
  id: string | number
  name: string
  raw?: any
}

interface ResolvedGeneratedBoardList {
  boardList: any[]
  addProdBoard: boolean
  processList: Array<string | number>
}

interface ResolvedGeneratedTempBoardRow {
  row: any
  addProdBoard: boolean
  boardModelId: string | number
}

interface CommissionBindingRow {
  key: string
  applicationNum: string
  applicationId: string
  orderId: string
  sampleId: string
  boardId: string
  fpNumber: string
  raw: EngineerAssistantCommissionBinding
}

interface AssistantCommissionUser {
  userName: string
  userId: string
  departmentId: string
  departmentName: string
}

interface CircuitApplication {
  key: string
  sourceTypeId: "circuitBoardModule"
  dbId: number | string
  orderNo: string
  name: string
  type: ApplicationTypeKey
  typeLabel: string
  client: string
  projectCode: string
  projectBudgetCode: string
  address: string
  mobilePhone: string
  landline: string
  experimentType: string
  boardState: string
  sfxyjcgy: string
  generatedOrderType: "production" | "temporary"
  generatedOrderTypeText: string
  status: ApplicationStatus
  statusLabel: string
  statusTagType: "primary" | "success" | "warning" | "info" | "danger"
  primaryText: string
  primaryType: "primary" | "success" | "warning" | "info" | "danger" | ""
  boardCount: number
  craft: string
  applyDate: string
  createDate: string
  filename: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  applicant: string
  remark: string
  boards: CircuitApplicationBoard[]
  raw: any
}

interface CreateApplicationForm {
  sn: string
  orderNo: string
  moduleName: string
  specModel: string
  quantity: number
  device: string
  hours: number | null
  applicant: string
  client: string
  phone: string
  commissionNo: string
  sfxyjcgy: "是" | "否"
  remark: string
}

const statusOptions: Array<{ key: ApplicationStatus; label: string; sub: string; color: string }> = [
  { key: "draft", label: "未发布", sub: "草稿", color: "#6b7280" },
  { key: "partial", label: "部分发布", sub: "还有未发布样品", color: "#f97316" },
  { key: "published", label: "已发布", sub: "等待排期", color: "#2563eb" },
  { key: "scheduling", label: "排期中", sub: "分配中", color: "#f97316" },
  { key: "in_progress", label: "测试中", sub: "执行中", color: "#10b981" },
  { key: "done", label: "已完成", sub: "本月", color: "#10b981" }
]

const statusMeta: Record<
  ApplicationStatus,
  {
    label: string
    tagType: CircuitApplication["statusTagType"]
    primaryText: string
    primaryType: CircuitApplication["primaryType"]
  }
> = {
  draft: { label: "未发布", tagType: "info", primaryText: "发布全部未发布", primaryType: "primary" },
  partial: { label: "部分发布", tagType: "warning", primaryText: "发布全部未发布", primaryType: "primary" },
  published: { label: "已发布", tagType: "success", primaryText: "查看", primaryType: "" },
  scheduling: { label: "排期中", tagType: "warning", primaryText: "查看", primaryType: "" },
  in_progress: { label: "测试中", tagType: "success", primaryText: "查看", primaryType: "" },
  done: { label: "已完成", tagType: "success", primaryText: "查看", primaryType: "" }
}

const circuitPublishedSyncState = { status: 1 } as const
const defaultModuleName = "电路板模块"
const ASSISTANT_FALLBACK_USER: Pick<EngineerAssistantUser, "userId" | "userName" | "departmentId" | "departmentName"> =
  {
    userId: "1",
    userName: "超级管理员",
    departmentId: "101",
    departmentName: "中海油服"
  }

const loading = ref(false)
const detailVisible = ref(false)
const createDialogVisible = ref(false)
const createSaving = ref(false)
const createFormRef = ref<FormInstance>()
const applications = ref<CircuitApplication[]>([])
const publishingKeys = ref<string[]>([])
const publishingBoardKeys = ref<string[]>([])
const generatedOrderKeys = ref<string[]>([])
const generatedBoardKeys = ref<string[]>([])
const missingGeneratedBoardKeys = ref<string[]>([])
const selectedApplicationKey = ref("")
const selectedApplicationIds = ref<string[]>([])
const selectedBoardRows = ref<CircuitApplicationBoard[]>([])
const boardDetailVisible = ref(false)
const selectedBoardDetail = ref<CircuitApplicationBoard | null>(null)
const bindingDialogVisible = ref(false)
const bindingLoading = ref(false)
const bindingRows = ref<CommissionBindingRow[]>([])
const bindingApplicationNo = ref("")
const userStore = useUserStore()
let testTypeListCache: any[] | null = null
let tempTestTypeListCache: any[] | null = null
let tempProdBoardTestTypeListCache: any[] | null = null
const searchForm = reactive<{ keyword: string; status: StatusFilter; orderType: GeneratedOrderFilter }>({
  keyword: "",
  status: "all",
  orderType: "all"
})

const todayKey = () => new Date().toISOString().slice(0, 10).replaceAll("-", "")
const randomSuffix = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0")
const createOrderNo = () => `CBM-${todayKey()}-${randomSuffix()}`

function createDefaultForm(): CreateApplicationForm {
  const orderNo = createOrderNo()
  return {
    sn: orderNo,
    orderNo,
    moduleName: defaultModuleName,
    specModel: defaultModuleName,
    quantity: 1,
    device: CIRCUIT_PROCESS_OPTIONS[0],
    hours: 2,
    applicant: "",
    client: "",
    phone: "",
    commissionNo: "",
    sfxyjcgy: "是",
    remark: ""
  }
}

const createForm = reactive<CreateApplicationForm>(createDefaultForm())
const createRules: FormRules<CreateApplicationForm> = {
  orderNo: [{ required: true, message: "请输入申请单号", trigger: "blur" }],
  sn: [{ required: true, message: "请输入电路板编号", trigger: "blur" }],
  moduleName: [{ required: true, message: "请输入模块名称", trigger: "blur" }],
  specModel: [{ required: true, message: "请输入规格型号", trigger: "blur" }],
  quantity: [{ required: true, type: "number", message: "请输入数量", trigger: "change" }]
}

const selectedApplication = computed(
  () => applications.value.find((application) => application.key === selectedApplicationKey.value) || null
)

const filteredApplications = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  return applications.value.filter((application) => {
    const matchesStatus = searchForm.status === "all" || application.status === searchForm.status
    const matchesOrderType = searchForm.orderType === "all" || application.generatedOrderType === searchForm.orderType
    const matchesKeyword =
      !keyword ||
      [application.orderNo, application.name, application.applicant, application.remark]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    return matchesStatus && matchesOrderType && matchesKeyword
  })
})

const canBatchPublish = computed(() =>
  selectedApplicationIds.value.some((key) => {
    const application = applications.value.find((item) => item.key === key)
    return application ? isApplicationPublishable(application) : false
  })
)

function normalizeStatus(status: unknown): ApplicationStatus {
  const text = String(status ?? "")
    .trim()
    .toLowerCase()
  if (!text || ["0", "draft", "unlinked", "草稿", "未发布"].includes(text)) return "draft"
  if (["partial", "partially_published", "部分发布"].includes(text)) return "partial"
  if (["1", "linked", "published", "ready", "已发布", "待排期"].includes(text)) return "published"
  if (["scheduled", "scheduling", "arranged", "已排期", "排期中"].includes(text)) return "scheduling"
  if (["2", "testing", "in_progress", "running", "测试中"].includes(text)) return "in_progress"
  if (["3", "5", "6", "done", "complete", "completed", "finished", "已完成"].includes(text)) return "done"
  return "draft"
}

function hasStatusValue(status: unknown) {
  return status !== undefined && status !== null && String(status).trim() !== ""
}

function resolveBoardStatusValue(board: any, fallback: unknown = 0) {
  const publishStatus = hasStatusValue(board?.publishStatus) ? board.publishStatus : board?.publish_status
  if (hasStatusValue(board?.status)) {
    if (
      normalizeStatus(board.status) === "draft" &&
      hasStatusValue(publishStatus) &&
      normalizeStatus(publishStatus) !== "draft"
    ) {
      return publishStatus
    }
    return board.status
  }
  if (hasStatusValue(publishStatus)) return publishStatus
  return fallback
}

function resolveBoardPublishValue(board: any, fallback: unknown = 0) {
  if (hasStatusValue(board?.publishStatus)) return board.publishStatus
  if (hasStatusValue(board?.publish_status)) return board.publish_status
  if (hasStatusValue(board?.status)) return normalizeStatus(board.status) === "draft" ? 0 : 1
  return fallback
}

function applyApplicationStatus(application: CircuitApplication, status: ApplicationStatus) {
  const meta = statusMeta[status]
  application.status = status
  application.statusLabel = meta.label
  application.statusTagType = meta.tagType
  application.primaryText = meta.primaryText
  application.primaryType = meta.primaryType
}

function resolvePublishStatusFromBoards(boards: CircuitApplicationBoard[]) {
  const statuses = boards.map((board) => normalizeStatus(board.status))
  if (!statuses.length) return "draft"
  if (statuses.some((status) => status === "in_progress")) return "in_progress"
  if (statuses.some((status) => status === "scheduling")) return "scheduling"
  if (statuses.length && statuses.every((status) => status === "done")) return "done"
  if (statuses.some((status) => status === "published")) {
    return statuses.some((status) => status === "draft" || status === "partial") ? "partial" : "published"
  }
  return "draft"
}

function getGroupStatus(
  rows: CircuitModuleApplicationRelation[],
  boards: CircuitApplicationBoard[]
): ApplicationStatus {
  const boardStatus = resolvePublishStatusFromBoards(boards)
  if (boardStatus !== "draft") return boardStatus

  const statuses = rows.map((row) => normalizeStatus(row.status))
  if (statuses.some((status) => status === "in_progress")) return "in_progress"
  if (statuses.some((status) => status === "scheduling")) return "scheduling"
  if (statuses.length && statuses.every((status) => status === "done")) return "done"
  if (statuses.some((status) => status === "partial")) return "partial"
  if (statuses.some((status) => status === "published")) {
    return statuses.some((status) => status === "draft") ? "partial" : "published"
  }
  return "draft"
}

function mapRelationToBoard(row: CircuitModuleApplicationRelation, index: number): CircuitApplicationBoard {
  const serial = getString(row.sn) || `PCB-${index + 1}`
  const model = getString(row.specModel, row.sampleName, row.ggxh, "电路板模块")
  const orderNo = getString(row.djbh, row.orderNo, row.commissionNo, row.sn, "CBM")
  const fallbackBatchNo = `${orderNo}-${String(index + 1).padStart(2, "0")}`
  return {
    id: serial,
    seria: serial,
    sn: serial,
    serial,
    name: model,
    sampleName: getString(row.sampleName, row.moduleName, model),
    model,
    batchNo: getString(row.commissionNo, row.djbh, row.orderNo) || fallbackBatchNo,
    supplier: getString(row.client, row.wtdw) || "未提供",
    materialNo: getString((row as { wlh?: string }).wlh),
    quantity: getDisplayString(row.quantity, row.sl) || "1",
    consignor: getString(row.sqrmc, row.applicant),
    createBy: getString(row.createBy),
    createTime: getString(row.createTime),
    updateBy: getString(row.updateBy),
    updateTime: getString(row.updateTime, row.updatedAt),
    startTime: getString(row.updatedAt, row.doneAt),
    status: normalizeStatus(row.status),
    raw: row
  }
}

function isPlaceholderText(value: string) {
  return /^\?+$/.test(value.trim())
}

function getReadableString(...values: unknown[]) {
  const value = getString(...values)
  return value && !isPlaceholderText(value) ? value : ""
}

function getReadableActor(...values: unknown[]) {
  const value = getReadableString(...values)
  return /^\d+$/.test(value) ? "" : value
}

function mapApiBoardToBoard(row: CircuitModuleApplicationRelation, board: any, index: number): CircuitApplicationBoard {
  const applicationNo = getString(row.djbh, row.orderNo, row.commissionNo, row.sn)
  if (board?.pch || board?.gysmc || board?.wlh || board?.ypmc) {
    const mappedBoard = mapDlbBoardToUiBoard(board, index, applicationNo)
    return {
      ...mappedBoard,
      createBy: getReadableActor(mappedBoard.createBy, row.createBy, row.sqrmc, row.applicant),
      createTime: getReadableString(mappedBoard.createTime, row.createTime, row.updatedAt),
      updateBy: getReadableActor(mappedBoard.updateBy, row.updateBy, row.sqrmc, row.applicant),
      updateTime: getReadableString(mappedBoard.updateTime, row.updateTime, row.updatedAt),
      status: normalizeStatus(resolveBoardStatusValue(board, 0)),
      publishStatus: resolveBoardPublishValue(board, 0),
      raw: board
    }
  }

  const serial =
    getString(
      board?.seria,
      board?.sn,
      board?.serial,
      board?.serial_num,
      board?.serialNumber,
      board?.board_serial,
      board?.id
    ) || `${applicationNo || "PCB"}-${index + 1}`
  const model = getString(board?.model, board?.name, row.specModel, row.sampleName, row.ggxh, "电路板模块")
  const fallbackBatchNo = `${applicationNo || "DLB"}-${String(index + 1).padStart(2, "0")}`
  return {
    id: serial,
    boardId: getDisplayString(board?.boardId, board?.board_id),
    prodBoardId: getDisplayString(board?.prodBoardId, board?.prod_board_id, board?.board_id),
    tempBoardId: getDisplayString(board?.tempBoardId, board?.temp_board_id),
    seria: serial,
    sn: serial,
    serial,
    serialNum: getString(board?.serial_num, board?.serialNumber, board?.board_serial, serial),
    name: model,
    sampleName: getString(board?.sampleName, board?.name, row.sampleName, row.moduleName, model),
    model,
    assistantSn: getString(board?.assistantSn, board?.assistant_sn, board?.sourceSn, board?.source_sn, board?.originalSn, board?.original_sn, board?.sn),
    sourceSn: getString(board?.sourceSn, board?.source_sn, board?.assistantSn, board?.assistant_sn, board?.originalSn, board?.original_sn, board?.sn),
    originalSn: getString(board?.originalSn, board?.original_sn, board?.assistantSn, board?.assistant_sn, board?.sourceSn, board?.source_sn, board?.sn),
    batchNo: getString(board?.batchNo, board?.pch) || fallbackBatchNo,
    supplier: getString(board?.supplier, board?.gysmc) || "未提供",
    materialNo: getString(board?.materialNo, board?.wlh),
    quantity: getDisplayString(board?.quantity, board?.sl) || "1",
    consignor: getString(board?.consignor, board?.wtr, row.sqrmc, row.applicant),
    product: getString(board?.product, board?.sscp),
    unit: getString(board?.unit, board?.ssdw),
    testCategory: getString(board?.testCategory, board?.cslb),
    testContent: getString(board?.testContent, board?.csnr),
    initialInspection: getString(board?.initialInspection, board?.cjfj),
    contractNo: getString(board?.contractNo, board?.hth),
    arrivalDate: getString(board?.arrivalDate, board?.dhrq),
    xray: getString(board?.xray, board?.ray),
    bow: getString(board?.bow, board?.gqd),
    twoD: getString(board?.twoD, board?.towtest),
    threeD: getString(board?.threeD, board?.threetest),
    createBy: getReadableActor(board?.createBy, row.createBy, row.sqrmc, row.applicant),
    createTime: getReadableString(board?.createTime, row.createTime, row.updatedAt),
    updateBy: getReadableActor(board?.updateBy, row.updateBy, row.sqrmc, row.applicant),
    updateTime: getReadableString(board?.updateTime, row.updateTime, row.updatedAt),
    startTime: getString(board?.startTime, row.updatedAt, row.doneAt),
    status: normalizeStatus(resolveBoardStatusValue(board, 0)),
    publishStatus: resolveBoardPublishValue(board, 0),
    raw: board
  }
}

function resolveCraftFlag(row: CircuitModuleApplicationRelation) {
  const explicitCraft = getString(row.sfxyjcgy)
  if (explicitCraft) return getCraftFlagText(explicitCraft)

  const legacyNature = getString(row.nature)
  if (legacyNature) return getCraftFlagText(legacyNature)

  const legacyText = [row.sampleName, row.specModel, row.commissionNo].filter(Boolean).join(" ")
  return legacyText.includes("临时") || /temp/i.test(legacyText) ? "否" : "是"
}

function mapRelationsToApplication(groupKey: string, rows: CircuitModuleApplicationRelation[]): CircuitApplication {
  const first = rows[0] || ({} as CircuitModuleApplicationRelation)
  const rawBoards =
    Array.isArray(first.dlbTestBoardList) && first.dlbTestBoardList.length
      ? first.dlbTestBoardList
      : Array.isArray(first.boards) && first.boards.length
        ? first.boards
        : null
  const boards = rawBoards
    ? rawBoards.map((board, index) => mapApiBoardToBoard(first, board, index))
    : rows.map(mapRelationToBoard)
  const status = getGroupStatus(rows, boards)
  const meta = statusMeta[status]
  const orderNo = getString(first.djbh, first.orderNo, first.commissionNo, first.sn, groupKey)
  const name = getString(first.xmmc, first.moduleName, first.sampleName, first.specModel, `${orderNo} 电路板模块申请单`)
  const sfxyjcgy = resolveCraftFlag(first)
  const firstRecord = first as unknown as Record<string, unknown>
  const craft =
    resolveCircuitProcessName(
      first.csgy,
      firstRecord.testType,
      firstRecord.testTypeName,
      firstRecord.processName,
      firstRecord.cslx,
      first.sylx,
      first.device,
      first.sccj,
      first.ggxh
    ) || CIRCUIT_PROCESS_OPTIONS[0]
  const applyDate = getString(first.sqrq, first.createTime, first.updatedAt, first.doneAt).slice(0, 10)
  const remark = [
    first.client ? `客户：${first.client}` : "",
    first.phone ? `电话：${first.phone}` : "",
    first.inspector ? `检验员：${first.inspector}` : "",
    first.hours !== null && first.hours !== undefined ? `时长：${first.hours}h` : ""
  ]
    .filter(Boolean)
    .join("；")

  return {
    key: `circuitBoardModule-${orderNo}`,
    sourceTypeId: "circuitBoardModule",
    dbId: first.id ?? orderNo,
    orderNo,
    name,
    type: "电路板模块",
    typeLabel: "电路板模块",
    client: getString(first.wtdw, first.client),
    projectCode: getString(first.kybh),
    projectBudgetCode: getString(first.xmysbh, firstRecord.projectBudgetCode, firstRecord.project_budget_code),
    address: getString(first.address),
    mobilePhone: getString(first.telphone, first.sqrdh, first.phone),
    landline: getString(first.zj),
    experimentType: getReadableString(first.sylx, first.nature) || "电路板测试",
    boardState: normalizeDlbBoardState(first.dlbzt, first.zt, first.status),
    sfxyjcgy,
    generatedOrderType: getGeneratedOrderType(sfxyjcgy),
    generatedOrderTypeText: getGeneratedOrderTypeText(sfxyjcgy),
    status,
    statusLabel: meta.label,
    statusTagType: meta.tagType,
    primaryText: meta.primaryText,
    primaryType: meta.primaryType,
    boardCount: boards.length,
    craft,
    applyDate,
    createDate: applyDate,
    filename: getString(first.filename),
    createBy: getReadableActor(first.createBy, first.sqrmc, first.applicant),
    createTime: getReadableString(first.createTime, first.updatedAt),
    updateBy: getReadableActor(first.updateBy, first.sqrmc, first.applicant),
    updateTime: getReadableString(first.updateTime, first.updatedAt),
    applicant: getString(first.sqrmc, first.applicant),
    remark,
    boards,
    raw: rows
  }
}

function mapRelationsToApplications(rows: CircuitModuleApplicationRelation[]) {
  const groups = new Map<string, CircuitModuleApplicationRelation[]>()
  rows.forEach((row, index) => {
    const groupKey = getString(row.djbh, row.orderNo, row.commissionNo, row.sn) || `PCB-${index + 1}`
    groups.set(groupKey, [...(groups.get(groupKey) || []), row])
  })
  return Array.from(groups.entries()).map(([groupKey, groupRows]) => mapRelationsToApplication(groupKey, groupRows))
}

async function loadApplications() {
  loading.value = true
  try {
    const res = await getCircuitModuleApplicationList()
    applications.value = mapRelationsToApplications(res.data?.list || []).sort((a, b) =>
      String(b.createDate || b.orderNo).localeCompare(String(a.createDate || a.orderNo))
    )
    selectedApplicationKey.value = applications.value.some((item) => item.key === selectedApplicationKey.value)
      ? selectedApplicationKey.value
      : ""
    selectedApplicationIds.value = selectedApplicationIds.value.filter((key) =>
      applications.value.some((item) => item.key === key)
    )
    void refreshGeneratedStatusForApplications(applications.value)
  } catch (error) {
    applications.value = []
    ElMessage.error("电路模块任务单加载失败")
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  searchForm.keyword = ""
  searchForm.status = "all"
  searchForm.orderType = "all"
}

function toggleApplicationSelection(key: string) {
  selectedApplicationIds.value = selectedApplicationIds.value.includes(key)
    ? selectedApplicationIds.value.filter((item) => item !== key)
    : [...selectedApplicationIds.value, key]
}

function openApplicationDetail(application: CircuitApplication) {
  selectedApplicationKey.value = application.key
  selectedBoardRows.value = []
  selectedBoardDetail.value = null
  boardDetailVisible.value = false
  detailVisible.value = true
}

function openBoardDetail(board: CircuitApplicationBoard) {
  selectedBoardDetail.value = board
  boardDetailVisible.value = true
}

function getBoardDetailValue(...keys: string[]) {
  const board = selectedBoardDetail.value
  if (!board) return "-"
  const raw = (board.raw || {}) as Record<string, unknown>
  const values = keys.flatMap((key) => [(board as unknown as Record<string, unknown>)[key], raw[key]])
  return getDisplayString(...values) || "-"
}

function getBoardSnDetailValue() {
  const board = selectedBoardDetail.value
  if (!board) return "-"
  const raw = (board.raw || {}) as Record<string, unknown>
  const sourceKeys = ["assistantSn", "assistant_sn", "sourceSn", "source_sn", "originalSn", "original_sn"]
  const explicitSource = getDisplayString(
    ...sourceKeys.flatMap((key) => [(board as unknown as Record<string, unknown>)[key], raw[key]])
  )
  if (explicitSource) return explicitSource

  const hasSourceMarker = sourceKeys.some((key) => key in raw || key in (board as unknown as Record<string, unknown>))
  if (hasSourceMarker) return "-"

  return getBoardDetailValue("sn", "serial", "seria")
}

function refreshSelectedApplication(application: CircuitApplication) {
  selectedApplicationKey.value = application.key
  applications.value = [...applications.value]
}

function isPublishing(application: CircuitApplication) {
  return publishingKeys.value.includes(application.key)
}

function isApplicationPublishable(application: CircuitApplication) {
  return (
    application.status === "draft" ||
    application.status === "partial" ||
    application.boards.some((board) => hasMissingGeneratedBoard(application, board))
  )
}

function getApplicationPrimaryText(application: CircuitApplication) {
  if (application.boards.some((board) => hasMissingGeneratedBoard(application, board))) return "补发工单"
  return application.primaryText
}

function getApplicationPublishText(application: CircuitApplication) {
  if (application.boards.some((board) => hasMissingGeneratedBoard(application, board))) return "补发缺失工单"
  return "发布全部未发布样品"
}

function getBoardPublishText(application: CircuitApplication, board: CircuitApplicationBoard) {
  return hasMissingGeneratedBoard(application, board) ? "补发" : "发布"
}

function getBoardPublishKey(application: CircuitApplication, board: CircuitApplicationBoard) {
  return `${application.key}:${getDisplayString(board.id, board.boardId, board.prodBoardId, board.tempBoardId, board.serial, board.sn, board.seria)}`
}

function isBoardPublishing(application: CircuitApplication, board: CircuitApplicationBoard) {
  return publishingBoardKeys.value.includes(getBoardPublishKey(application, board))
}

function isAnyBoardPublishing(application: CircuitApplication) {
  const prefix = `${application.key}:`
  return publishingBoardKeys.value.some((key) => key.startsWith(prefix))
}

function markGeneratedBoardCreated(application: CircuitApplication, board: CircuitApplicationBoard) {
  const key = getBoardPublishKey(application, board)
  if (!generatedBoardKeys.value.includes(key)) {
    generatedBoardKeys.value = [...generatedBoardKeys.value, key]
  }
  missingGeneratedBoardKeys.value = missingGeneratedBoardKeys.value.filter((item) => item !== key)
}

function hasGeneratedBoardCreated(application: CircuitApplication, board: CircuitApplicationBoard) {
  return generatedBoardKeys.value.includes(getBoardPublishKey(application, board))
}

function markGeneratedBoardMissing(application: CircuitApplication, board: CircuitApplicationBoard) {
  const key = getBoardPublishKey(application, board)
  if (!missingGeneratedBoardKeys.value.includes(key)) {
    missingGeneratedBoardKeys.value = [...missingGeneratedBoardKeys.value, key]
  }
}

function hasMissingGeneratedBoard(application: CircuitApplication, board: CircuitApplicationBoard) {
  return missingGeneratedBoardKeys.value.includes(getBoardPublishKey(application, board))
}

function shouldHaveGeneratedBoard(board: CircuitApplicationBoard) {
  return ["published", "scheduling", "in_progress", "done"].includes(normalizeStatus(board.status))
}

function isBoardPublishable(application: CircuitApplication, board: CircuitApplicationBoard) {
  return board.status === "draft" || hasMissingGeneratedBoard(application, board)
}

function getPublishableBoards(application: CircuitApplication) {
  return application.boards.filter((board) => isBoardPublishable(application, board))
}

function getExpectedGeneratedCount(boardList: any[]) {
  return boardList.reduce((total, item) => {
    const selectedTests = Array.isArray(item?.selectedTest) ? item.selectedTest : []
    return total + Math.max(selectedTests.length, 1)
  }, 0)
}

function assertGeneratedCount(response: any, expectedCount: number) {
  const generatedCount = response?.data?.generatedCount
  if (typeof generatedCount === "number" && generatedCount < expectedCount) {
    throw new Error(`测试工单生成数量异常：应生成 ${expectedCount} 条，实际生成 ${generatedCount} 条`)
  }
}

async function publishGeneratedTestOrders(response: any, orderType: "production" | "temporary") {
  const ids = (response?.data?.generatedOrders || [])
    .map((item: any) => Number(item?.id))
    .filter((id: number) => Number.isFinite(id) && id > 0)
  if (!ids.length) return

  if (orderType === "production") {
    await postUnits(ids)
  } else {
    await postDevUnits(ids)
  }
}

function rowMatchesGeneratedBoard(application: CircuitApplication, board: CircuitApplicationBoard, row: any) {
  const serial = getBoardSerial(board)
  const orderNo = application.orderNo
  if (!serial || !orderNo) return false
  const rowOrderNo = getString(row?.order_no, row?.orderNo)
  const rowName = getString(row?.testunit_name, row?.dev_testunit_name)
  const raw = (board.raw || {}) as Record<string, unknown>
  const boardIdentityValues = new Set(
    [board.boardId, board.prodBoardId, board.tempBoardId, board.id, serial, ...getRawBoardIdentityValues(raw)]
      .map((value) => getDisplayString(value))
      .filter(Boolean)
  )
  const rowIdentityValues = [
    row?.board_id,
    row?.boardId,
    row?.prod_board_id,
    row?.prodBoardId,
    row?.temp_board_id,
    row?.tempBoardId,
    row?.serial_num,
    row?.serialNumber,
    row?.board_serial,
    row?.boardSerial,
    row?.sn,
    row?.serial
  ]
    .map((value) => getDisplayString(value))
    .filter(Boolean)
  const rowSerial = getString(
    row?.board_serial,
    row?.boardSerial,
    row?.serial_num,
    row?.serialNumber,
    row?.sn,
    row?.serial
  )
  const matchesOrder = rowOrderNo ? rowOrderNo === orderNo : rowName.includes(orderNo)
  const matchesBoard =
    rowIdentityValues.some((value) => boardIdentityValues.has(value)) ||
    (rowSerial ? rowSerial === serial : rowName.includes(serial))
  return matchesOrder && matchesBoard
}

async function getGeneratedRowsForApplication(application: CircuitApplication) {
  const params = {
    orderNo: application.orderNo,
    currentPage: 1,
    pageSize: 9999
  }
  const result =
    application.generatedOrderType === "production"
      ? await getTestMangeTable(params)
      : await getTempTestMangeTable(params)
  return result?.TableData || []
}

async function refreshGeneratedStatusForApplication(application: CircuitApplication) {
  if (!application.orderNo || !application.boards.length) return
  const rows = await getGeneratedRowsForApplication(application)
  application.boards.forEach((board) => {
    if (rows.some((row) => rowMatchesGeneratedBoard(application, board, row))) {
      markGeneratedBoardCreated(application, board)
      return
    }
    if (shouldHaveGeneratedBoard(board)) {
      markGeneratedBoardMissing(application, board)
    }
  })
}

async function refreshGeneratedStatusForApplications(items: CircuitApplication[]) {
  await Promise.all(
    items
      .filter((application) => application.boards.some((board) => shouldHaveGeneratedBoard(board)))
      .map((application) => refreshGeneratedStatusForApplication(application).catch(() => undefined))
  )
  applications.value = [...applications.value]
}

function getApplicationRelationRows(application: CircuitApplication): CircuitModuleApplicationRelation[] {
  return Array.isArray(application.raw) ? application.raw : []
}

function normalizeCommissionBindingRow(item: EngineerAssistantCommissionBinding, index: number): CommissionBindingRow {
  const applicationNum = getString(item.applicationNum)
  const orderId = getString(item.orderId)
  const sampleId = getString(item.sampleId)
  const boardId = getString(item.boardId)
  const applicationId = getString(item.applicationId)
  const fpNumber = getString(item.fpNumber)
  return {
    key: `${applicationNum || "binding"}-${orderId || index}-${sampleId || boardId || index}`,
    applicationNum,
    applicationId,
    orderId,
    sampleId,
    boardId,
    fpNumber,
    raw: item
  }
}

function getCommissionBoardKey(application: CircuitApplication, board: CircuitApplicationBoard, index: number) {
  return (
    getDisplayString(
      board.id,
      board.boardId,
      board.prodBoardId,
      board.tempBoardId,
      getBoardSerial(board),
      board.sampleName
    ) || `${application.orderNo}-${index + 1}`
  )
}

function getBoardsForCommissionPush(application: CircuitApplication, boards: CircuitApplicationBoard[]) {
  const mergedBoards = [...application.boards.filter((board) => normalizeStatus(board.status) !== "draft"), ...boards]
  const boardMap = new Map<string, CircuitApplicationBoard>()

  mergedBoards.forEach((board, index) => {
    boardMap.set(getCommissionBoardKey(application, board, index), board)
  })
  return Array.from(boardMap.values())
}

function buildAssistantId(prefix: string, ...values: unknown[]) {
  const rawValue = values.map((value) => getDisplayString(value)).find(Boolean) || `${Date.now()}`
  const safeValue = rawValue
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return `${prefix}-${safeValue || Date.now()}`
}

function getBoardRawValue(board: CircuitApplicationBoard, ...keys: string[]) {
  const raw = (board.raw || {}) as Record<string, unknown>
  return getString(...keys.map((key) => raw[key]))
}

function normalizeAssistantCommissionUser(user: Partial<EngineerAssistantUser>): AssistantCommissionUser {
  return {
    userName: getString(user.userName, user.name, ASSISTANT_FALLBACK_USER.userName),
    userId: getDisplayString(user.userId, user.id, ASSISTANT_FALLBACK_USER.userId),
    departmentId: getDisplayString(user.departmentId, ASSISTANT_FALLBACK_USER.departmentId),
    departmentName: getString(user.departmentName, ASSISTANT_FALLBACK_USER.departmentName)
  }
}

async function resolveAssistantCommissionUser(application: CircuitApplication): Promise<AssistantCommissionUser> {
  try {
    const result = await getEngineerAssistantUsersApi()
    const rows = Array.isArray(result?.data?.list) ? result.data.list : []
    const currentUserId = userStore.userid ? String(userStore.userid) : ""
    const candidateNames = [userStore.nickName, userStore.username, application.applicant]
      .map((value) => getDisplayString(value))
      .filter(Boolean)

    const matched =
      rows.find((row) => currentUserId && getDisplayString(row.userId, row.id) === currentUserId) ||
      rows.find((row) => candidateNames.includes(getDisplayString(row.userName, row.name))) ||
      rows.find((row) => getDisplayString(row.userId, row.id) === ASSISTANT_FALLBACK_USER.userId) ||
      rows.find((row) => getDisplayString(row.departmentId) && getString(row.departmentName))

    return normalizeAssistantCommissionUser(matched || ASSISTANT_FALLBACK_USER)
  } catch (error) {
    return normalizeAssistantCommissionUser(ASSISTANT_FALLBACK_USER)
  }
}

function buildCommissionOrderPayload(
  application: CircuitApplication,
  boards: CircuitApplicationBoard[],
  assistantUser: AssistantCommissionUser
): PushEngineerAssistantCommissionOrdersBody {
  const commissionId = application.orderNo || application.key
  const commissionOrderId = buildAssistantId("CO", commissionId)
  const sampleBoards = getBoardsForCommissionPush(application, boards)

  return {
    orderList: [
      {
        id: commissionOrderId,
        commissionId,
        budgetId: getString(application.projectBudgetCode, application.projectCode, commissionId),
        commissionOrg: getString(application.client) || "未提供",
        userName: assistantUser.userName,
        userId: assistantUser.userId,
        departmentId: assistantUser.departmentId,
        departmentName: assistantUser.departmentName,
        phone: getString(application.mobilePhone, application.landline),
        samples: sampleBoards.map((board, index) => {
          const boardKey = getCommissionBoardKey(application, board, index)
          return {
            id: buildAssistantId("S", commissionOrderId, boardKey || index + 1),
            commissionOrderId,
            sampleName: getString(board.sampleName, board.name) || `电路板样品${index + 1}`,
            category:
              getString(board.testCategory, getBoardRawValue(board, "cslb", "testCategory", "category")) || "电路板",
            specModel: getString(board.model, getBoardRawValue(board, "ggxh", "model", "specModel")),
            manufacturer:
              getString(
                board.supplier,
                getBoardRawValue(board, "gysmc", "supplier", "manufacturer"),
                application.client
              ) || "未提供",
            batchNo: getString(board.batchNo, getBoardRawValue(board, "pch", "batchNo", "batch_id", "batchId")),
            sn: getString(board.sn, board.serial, board.seria, getBoardRawValue(board, "sn", "serial", "seria")),
            materialNo: getString(board.materialNo, getBoardRawValue(board, "wlh", "materialNo", "material_no")),
            testContent: getString(board.testContent, getBoardRawValue(board, "csnr", "testContent", "test_content")),
            number: Math.max(
              1,
              Number(board.quantity) || Number(getBoardRawValue(board, "sl", "number", "quantity")) || 1
            )
          }
        })
      }
    ]
  }
}

async function pushCommissionOrderForBoards(application: CircuitApplication, boards: CircuitApplicationBoard[]) {
  const assistantUser = await resolveAssistantCommissionUser(application)
  const payload = buildCommissionOrderPayload(application, boards, assistantUser)
  await pushEngineerAssistantCommissionOrdersApi(payload)
}

async function loadCommissionBindings(application: CircuitApplication, options: { silent?: boolean } = {}) {
  if (!application.orderNo) {
    bindingRows.value = []
    bindingApplicationNo.value = ""
    return
  }

  bindingLoading.value = true
  bindingApplicationNo.value = application.orderNo
  try {
    const result = await getEngineerAssistantCommissionBindingsApi({ applicationNum: application.orderNo })
    const rows = Array.isArray(result?.data) ? result.data : []
    bindingRows.value = rows.map((item, index) => normalizeCommissionBindingRow(item, index))
    if (!bindingRows.value.length && !options.silent) {
      ElMessage.info("当前申请单暂无关联结果")
    }
  } catch (error) {
    if (!options.silent) {
      ElMessage.error("获取申请单关联结果失败")
    }
  } finally {
    bindingLoading.value = false
  }
}

function openBindingDialog(application: CircuitApplication) {
  bindingDialogVisible.value = true
  bindingRows.value = []
  void loadCommissionBindings(application)
}

function refreshBindingRowsIfOpen(application: CircuitApplication) {
  if (!bindingDialogVisible.value || bindingApplicationNo.value !== application.orderNo) return
  void loadCommissionBindings(application, { silent: true })
}

function getApplicationPrintableBoards(application: CircuitApplication): CircuitApplicationBoard[] {
  if (application.boards.length) return application.boards

  const rows = getApplicationRelationRows(application)
  const rawBoards = rows.flatMap((row) =>
    Array.isArray(row.dlbTestBoardList) && row.dlbTestBoardList.length
      ? row.dlbTestBoardList
      : Array.isArray(row.boards)
        ? row.boards
        : []
  )
  if (rawBoards.length) {
    const first = rows[0] || ({} as CircuitModuleApplicationRelation)
    return rawBoards.map((board, index) => mapApiBoardToBoard(first, board, index))
  }
  return rows.map(mapRelationToBoard)
}

function buildGeneratedTestOption(testType: ResolvedGeneratedTestType, craft: string, processId?: string | number) {
  const name = testType.name || normalizeCircuitProcessName(craft) || CIRCUIT_PROCESS_OPTIONS[0]
  const resolvedProcessId = processId ?? getStringOrNumber(testType.raw?.processId, testType.raw?.process_id)
  return {
    id: testType.id,
    number: testType.id,
    name,
    label: name,
    processId: resolvedProcessId === "" ? null : resolvedProcessId
  }
}

function isNumericBoardId(value: unknown) {
  return /^\d+$/.test(String(value ?? "").trim())
}

function getBoardSerial(board: CircuitApplicationBoard) {
  const raw = (board.raw || {}) as Record<string, unknown>
  return getString(
    board.serial,
    board.sn,
    board.seria,
    board.serialNum,
    raw.sn,
    raw.serial,
    raw.seria,
    raw.serial_num,
    raw.serialNumber,
    raw.board_serial,
    raw.boardSerial
  )
}

function getBoardDisplayName(board: CircuitApplicationBoard) {
  return getString(getBoardSerial(board), board.batchNo, board.sampleName, board.id, "未知样品")
}

function getBoardMissingPayload(board: CircuitApplicationBoard) {
  const raw = (board.raw || {}) as Record<string, unknown>
  return {
    sn: getString(
      board.sn,
      board.serial,
      board.serialNum,
      raw.sn,
      raw.serial,
      raw.serial_num,
      raw.board_serial,
      board.id
    ),
    pch: getDisplayString(board.batchNo, raw.pch, raw.batchNo, raw.batch_id, raw.batchId),
    gysmc: getString(board.supplier, raw.gysmc, raw.supplier),
    ggxh: getString(board.model, raw.ggxh, raw.model)
  }
}

function createMissingBoardsError(boards: CircuitApplicationBoard[], message: string) {
  return {
    message,
    data: {
      reason: "missing_board_match",
      missingBoards: boards.map(getBoardMissingPayload)
    }
  }
}

function buildGeneratedBoardRow(
  application: CircuitApplication,
  board: CircuitApplicationBoard,
  index: number,
  boardId: string | number,
  selectedTest: any[]
) {
  const raw = (board.raw || {}) as Record<string, unknown>
  const serial =
    getString(
      board.serial,
      board.sn,
      board.seria,
      board.serialNum,
      raw.sn,
      raw.serial,
      raw.seria,
      raw.serial_num,
      raw.serialNumber,
      raw.board_serial,
      raw.id
    ) || `${application.orderNo}-${index + 1}`
  const prodBoardId = getDisplayString(board.prodBoardId, raw.prodBoardId, raw.prod_board_id, raw.board_id)
  const tempBoardId = getDisplayString(board.tempBoardId, raw.tempBoardId, raw.temp_board_id)
  const rawBoardId = getDisplayString(board.boardId, raw.boardId, raw.board_id, prodBoardId, tempBoardId)
  const batchNo = getDisplayString(board.batchNo, raw.pch, raw.batchNo, raw.batch_id, raw.batchId)
  const supplier = getString(board.supplier, raw.gysmc, raw.supplier)
  const model = getString(board.model, board.name, raw.ggxh, raw.model, raw.name)
  const sampleName = getString(board.sampleName, raw.ypmc, raw.sampleName, raw.board_name, model)
  const materialNo = getString(board.materialNo, raw.wlh, raw.materialNo, raw.material_no)

  return {
    id: String(boardId),
    board_id: boardId,
    raw_board_id: rawBoardId,
    prodBoardId,
    prod_board_id: prodBoardId,
    tempBoardId,
    temp_board_id: tempBoardId,
    serial_num: serial,
    board_serial: serial,
    serial,
    sn: serial,
    batch_id: batchNo,
    batchId: batchNo,
    batch: batchNo,
    batch_name: batchNo,
    supplier,
    boardmodel_name: model,
    board_model: model,
    boardName: sampleName,
    board_name_or_board_model: getString(sampleName, model),
    material_no: materialNo,
    materialNo,
    available: selectedTest,
    selectedTest: [...selectedTest],
    checkAll: true,
    isInd: false,
    dlbTestId: getString(raw.dlbTestId),
    orderNo: application.orderNo,
    testUnitDesc: application.name,
    consignor: application.applicant,
    quantity: getDisplayString(board.quantity, raw.sl) || "1",
    raw: board.raw || board,
    pch: batchNo,
    gysmc: supplier,
    ggxh: model,
    ypmc: sampleName,
    wlh: materialNo
  }
}

function findMatchingBoardInfoRow(rows: any[], board: CircuitApplicationBoard) {
  const serial = getBoardSerial(board)
  const raw = (board.raw || {}) as Record<string, unknown>
  const boardValues = new Set(
    [board.id, board.boardId, board.prodBoardId, board.tempBoardId, serial, ...getRawBoardIdentityValues(raw)]
      .map((value) => getDisplayString(value))
      .filter(Boolean)
  )
  return rows.find((row) => {
    const rowValues = [
      row.id,
      row.board_id,
      row.boardId,
      row.prod_board_id,
      row.prodBoardId,
      row.temp_board_id,
      row.tempBoardId,
      row.serial_num,
      row.serialNumber,
      row.board_serial,
      row.boardSerial,
      row.sn,
      row.serial,
      row.seria
    ]
      .map((value) => getDisplayString(value))
      .filter(Boolean)
    return rowValues.some((value) => boardValues.has(value))
  })
}

function filterSelectedTests(selectedTests: any[], testType: ResolvedGeneratedTestType) {
  return selectedTests.filter((item) => String(item?.id) === String(testType.id))
}

function ensureSelectedTestHasProcess(
  selectedTests: any[],
  testType: ResolvedGeneratedTestType,
  application: CircuitApplication
) {
  const fallbackProcessId = getStringOrNumber(testType.raw?.processId, testType.raw?.process_id)
  return selectedTests.map((item) => ({
    ...buildGeneratedTestOption(testType, application.craft, item?.processId || fallbackProcessId),
    ...item,
    processId: item?.processId || fallbackProcessId || null
  }))
}

function buildFallbackProductionBoardRow(
  application: CircuitApplication,
  board: CircuitApplicationBoard,
  index: number,
  testType: ResolvedGeneratedTestType
) {
  const fallbackBoardId = getBoardSerial(board) || getDisplayString(board.id) || `${application.orderNo}-${index + 1}`
  return buildGeneratedBoardRow(application, board, index, fallbackBoardId, [
    buildGeneratedTestOption(testType, application.craft)
  ])
}

async function resolveProductionBoardRow(
  application: CircuitApplication,
  board: CircuitApplicationBoard,
  index: number,
  testType: ResolvedGeneratedTestType
) {
  const serial = getBoardSerial(board)
  if (!serial) throw createMissingBoardsError([board], "样品缺少 SN，无法匹配生产电路板")

  try {
    const prodBoardInfo = await getProdBoardDataBySn(serial)
    const batchId = prodBoardInfo?.data?.batch_id
    const boardModelId = prodBoardInfo?.data?.boardmodel_id
    if (!batchId || !boardModelId) throw new Error("生产电路板缺少批次或型号")

    const result = await getbordsinfo({ batchId, boardModelId })
    const matched = findMatchingBoardInfoRow(result?.data || [], board)
    if (!matched) throw new Error("生产电路板没有可用测试工艺")

    const availableTests =
      Array.isArray(matched.selectedTest) && matched.selectedTest.length
        ? matched.selectedTest
        : matched.available || []
    const selectedTests = ensureSelectedTestHasProcess(
      filterSelectedTests(availableTests, testType),
      testType,
      application
    )
    if (!selectedTests.length || selectedTests.some((item) => !item.processId)) {
      throw new Error("生产电路板未绑定可用检测工艺")
    }

    return buildGeneratedBoardRow(application, board, index, matched.id, selectedTests)
  } catch (error) {
    return buildFallbackProductionBoardRow(application, board, index, testType)
  }
}

async function resolveTempOrderBoardRow(
  application: CircuitApplication,
  board: CircuitApplicationBoard,
  index: number,
  testType: ResolvedGeneratedTestType
): Promise<ResolvedGeneratedTempBoardRow> {
  const serial = getBoardSerial(board)
  if (!serial) throw createMissingBoardsError([board], "样品缺少 SN，无法匹配电路板")

  try {
    const prodBoardInfo = await getProdBoardDataBySn(serial)
    const batchId = prodBoardInfo?.data?.batch_id
    const boardModelId = prodBoardInfo?.data?.boardmodel_id
    if (batchId && boardModelId) {
      const result = await getboardsinfoForTempOrder({ batchId, boardModelId, tempBatch: false })
      const matched = findMatchingBoardInfoRow(result?.data || [], board)
      if (matched) {
        return {
          row: buildGeneratedBoardRow(application, board, index, matched.id, [
            buildGeneratedTestOption(testType, application.craft)
          ]),
          addProdBoard: true,
          boardModelId
        }
      }
    }
  } catch (error) {
    // 继续尝试按临时电路板匹配。
  }

  let tempBoardRows: Array<{ id: string; seria: string; serialNumber?: string }> = []
  let matched: { id: string; seria: string; serialNumber?: string } | undefined
  try {
    const result = await getTempBoardDataApi({ currentPage: 1, size: 999999, serialNumber: serial })
    tempBoardRows = result?.data?.list || []
    matched = tempBoardRows.find((item) => getString(item.serialNumber, item.seria) === serial)
  } catch (error) {
    tempBoardRows = []
  }

  if (!matched) {
    const fallbackResult = await getTempBoardDataApi({ currentPage: 1, size: 999999 })
    tempBoardRows = fallbackResult?.data?.list || []
    matched = tempBoardRows.find((item) => getString(item.serialNumber, item.seria) === serial)
  }

  if (!matched || !isNumericBoardId(matched.id)) {
    throw createMissingBoardsError([board], `未匹配到临时电路板：${getBoardDisplayName(board)}`)
  }

  return {
    row: buildGeneratedBoardRow(application, board, index, matched.id, [
      buildGeneratedTestOption(testType, application.craft)
    ]),
    addProdBoard: false,
    boardModelId: ""
  }
}

async function buildGeneratedOrderBoardList(
  application: CircuitApplication,
  boards: CircuitApplicationBoard[],
  testType: ResolvedGeneratedTestType
): Promise<ResolvedGeneratedBoardList> {
  if (application.generatedOrderType === "production") {
    const boardList = await Promise.all(
      boards.map((board, index) => resolveProductionBoardRow(application, board, index, testType))
    )
    return { boardList, addProdBoard: true, processList: [] }
  }

  const resolved = await Promise.all(
    boards.map((board, index) => resolveTempOrderBoardRow(application, board, index, testType))
  )
  if (new Set(resolved.map((item) => item.addProdBoard)).size > 1) {
    throw createMissingBoardsError(boards, "同一申请单不能混合发布生产电路板和临时电路板")
  }
  const addProdBoard = resolved.some((item) => item.addProdBoard)
  const processList =
    String(testType.id) === "1"
      ? Array.from(
          new Set(
            (
              await Promise.all(
                resolved
                  .filter((item) => item.addProdBoard && item.boardModelId)
                  .map((item) => getAvailableFunctionalTestingProcess({ boardModelId: item.boardModelId }))
              )
            ).flatMap((response) => (response?.data || []).map((process: any) => process.id))
          )
        )
      : []

  return {
    boardList: resolved.map((item) => item.row),
    addProdBoard,
    processList
  }
}

function applyGeneratedTestTypeToBoardRow(
  row: any,
  application: CircuitApplication,
  testType: ResolvedGeneratedTestType
) {
  const selectedTest = [buildGeneratedTestOption(testType, application.craft)]
  return {
    ...row,
    available: selectedTest,
    selectedTest: [...selectedTest]
  }
}

async function resolveFunctionalProcessList(resolvedRows: ResolvedGeneratedTempBoardRow[]) {
  const boardModelIds = Array.from(
    new Set(resolvedRows.filter((item) => item.addProdBoard && item.boardModelId).map((item) => item.boardModelId))
  )

  if (!boardModelIds.length) return []

  const responses = await Promise.all(
    boardModelIds.map((boardModelId) => getAvailableFunctionalTestingProcess({ boardModelId }))
  )
  return Array.from(new Set(responses.flatMap((response) => (response?.data || []).map((process: any) => process.id))))
}

async function buildGeneratedTempOrderBoardList(
  application: CircuitApplication,
  boards: CircuitApplicationBoard[]
): Promise<ResolvedGeneratedBoardList & { testType: ResolvedGeneratedTestType }> {
  const placeholderTestType = {
    id: "",
    name: application.craft || CIRCUIT_PROCESS_OPTIONS[0]
  }
  const resolvedRows = await Promise.all(
    boards.map((board, index) => resolveTempOrderBoardRow(application, board, index, placeholderTestType))
  )

  if (new Set(resolvedRows.map((item) => item.addProdBoard)).size > 1) {
    throw createMissingBoardsError(boards, "同一申请单不能混合发布生产电路板和临时电路板")
  }

  const addProdBoard = resolvedRows.some((item) => item.addProdBoard)
  const testType = await resolveGeneratedOrderTestType(application, { addProdBoard })
  const processList =
    String(testType.id) === "1" && addProdBoard ? await resolveFunctionalProcessList(resolvedRows) : []

  return {
    boardList: resolvedRows.map((item) => applyGeneratedTestTypeToBoardRow(item.row, application, testType)),
    addProdBoard,
    processList,
    testType
  }
}

function getStringOrNumber(...values: unknown[]) {
  const value = values.find((item) => (typeof item === "string" && item.trim()) || typeof item === "number")
  return value === undefined || value === null ? "" : String(value).trim()
}

function normalizeTestTypeKey(value: unknown) {
  return normalizeCircuitProcessName(value)
    .trim()
    .toLowerCase()
    .replace(/[＿_－—–]/g, "-")
    .replace(/\s+/g, "")
}

async function resolveGeneratedOrderTestType(
  application: CircuitApplication,
  options: { addProdBoard?: boolean } = {}
): Promise<ResolvedGeneratedTestType> {
  const fallbackName = application.craft || CIRCUIT_PROCESS_OPTIONS[0]
  try {
    if (application.generatedOrderType === "temporary") {
      if (options.addProdBoard) {
        if (!tempProdBoardTestTypeListCache) {
          const result = await getTempTestTypeForProdBoard({ currentPage: 1, size: 9999999 })
          tempProdBoardTestTypeListCache = Array.isArray(result?.data?.list) ? result.data.list : []
        }
      } else if (!tempTestTypeListCache) {
        const result = await getTempTestTypeDataApi({ currentPage: 1, size: 9999999 })
        tempTestTypeListCache = Array.isArray(result?.data?.list) ? result.data.list : []
      }
    } else if (!testTypeListCache) {
      const result = await getTestTypeDataApi({ currentPage: 1, size: 9999999 })
      testTypeListCache = Array.isArray(result?.data?.list) ? result.data.list : []
    }

    const targetKey = normalizeTestTypeKey(fallbackName)
    const testTypes =
      application.generatedOrderType === "temporary"
        ? options.addProdBoard
          ? tempProdBoardTestTypeListCache || []
          : tempTestTypeListCache || []
        : testTypeListCache || []
    const matched = testTypes.find(
      (item) =>
        normalizeTestTypeKey(item.name) === targetKey ||
        normalizeTestTypeKey(item.number) === targetKey ||
        normalizeTestTypeKey(item.id) === targetKey
    )
    const id = getStringOrNumber(matched?.number, matched?.id)
    if (!id) {
      throw new Error(`未匹配到测试类型：${fallbackName}`)
    }
    return {
      id,
      name: getString(matched?.name) || fallbackName,
      raw: matched
    }
  } catch (error) {
    throw error instanceof Error ? error : new Error("测试类型加载失败")
  }
}

function markGeneratedOrderCreated(application: CircuitApplication) {
  if (!generatedOrderKeys.value.includes(application.key)) {
    generatedOrderKeys.value = [...generatedOrderKeys.value, application.key]
  }
}

async function createGeneratedTestOrder(
  application: CircuitApplication,
  silent = false,
  boards: CircuitApplicationBoard[] = getPublishableBoards(application)
) {
  if (!boards.length) return

  if (application.generatedOrderType === "production") {
    const testType = await resolveGeneratedOrderTestType(application)
    const { boardList } = await buildGeneratedOrderBoardList(application, boards, testType)
    const response = await createTestUnitApi({
      boardList,
      userId: userStore.userid,
      testType: testType.id,
      testUnitType: "PCBA",
      testUnitDesc: application.name,
      consignor: application.applicant,
      orderNo: application.orderNo
    })
    assertGeneratedCount(response, getExpectedGeneratedCount(boardList))
    await publishGeneratedTestOrders(response, "production")
    return
  }

  const { boardList, addProdBoard, processList, testType } = await buildGeneratedTempOrderBoardList(application, boards)
  const payload = {
    addProdBoard,
    processList,
    boardList,
    userId: userStore.userid,
    testType: testType.id,
    testUnitType: "PCBA",
    testUnitDesc: application.name,
    consignor: application.applicant,
    testCount: 1,
    testunitType: "PCBA",
    testunitDesc: application.name,
    testunitConsignor: application.applicant,
    orderNo: application.orderNo
  }
  const response = await createDevTestUnitApi(payload)
  if (response?.status === "exists") {
    if (silent) {
      throw new Error(response.message || "测试工单已存在，未自动覆盖")
    }
    await ElMessageBox.confirm(response.message || "测试工单已存在，是否继续生成？", "确认生成", {
      type: "warning",
      confirmButtonText: "继续",
      cancelButtonText: "取消"
    })
    const retryResponse = await createDevTestUnitApi({
      ...payload,
      force: true
    })
    assertGeneratedCount(retryResponse, getExpectedGeneratedCount(boardList))
    await publishGeneratedTestOrders(retryResponse, "temporary")
  } else {
    assertGeneratedCount(response, getExpectedGeneratedCount(boardList))
    await publishGeneratedTestOrders(response, "temporary")
  }
}

function getRawBoardIdentityValues(raw: Record<string, unknown>) {
  return [
    raw.id,
    raw.dlbTestId,
    raw.board_id,
    raw.boardId,
    raw.prodBoardId,
    raw.prod_board_id,
    raw.tempBoardId,
    raw.temp_board_id,
    raw.sn,
    raw.serial,
    raw.seria,
    raw.serial_num,
    raw.serialNumber,
    raw.board_serial,
    raw.boardSerial
  ]
    .map((value) => getDisplayString(value))
    .filter(Boolean)
}

function isMatchingBoardRecord(board: CircuitApplicationBoard, rawBoard: unknown) {
  if (board.raw === rawBoard) return true
  if (!rawBoard || typeof rawBoard !== "object") return false

  const rawValues = getRawBoardIdentityValues(rawBoard as Record<string, unknown>)
  const boardValues = new Set(
    [
      board.id,
      board.boardId,
      board.prodBoardId,
      board.tempBoardId,
      board.serial,
      board.sn,
      board.seria,
      (board.raw as Record<string, unknown> | undefined)?.id,
      (board.raw as Record<string, unknown> | undefined)?.dlbTestId,
      (board.raw as Record<string, unknown> | undefined)?.board_id,
      (board.raw as Record<string, unknown> | undefined)?.boardId,
      (board.raw as Record<string, unknown> | undefined)?.prodBoardId,
      (board.raw as Record<string, unknown> | undefined)?.prod_board_id,
      (board.raw as Record<string, unknown> | undefined)?.tempBoardId,
      (board.raw as Record<string, unknown> | undefined)?.temp_board_id,
      (board.raw as Record<string, unknown> | undefined)?.sn,
      (board.raw as Record<string, unknown> | undefined)?.seria,
      (board.raw as Record<string, unknown> | undefined)?.serial,
      (board.raw as Record<string, unknown> | undefined)?.serial_num,
      (board.raw as Record<string, unknown> | undefined)?.serialNumber,
      (board.raw as Record<string, unknown> | undefined)?.board_serial,
      (board.raw as Record<string, unknown> | undefined)?.boardSerial
    ]
      .map((value) => getDisplayString(value))
      .filter(Boolean)
  )
  return rawValues.some((value) => boardValues.has(value))
}

function buildBoardStatusPatch(status: string | number) {
  const normalizedStatus = normalizeStatus(status)
  return {
    status,
    publishStatus: normalizedStatus === "draft" ? 0 : 1
  }
}

function updateBoardListStatus(
  boards: unknown[] | undefined,
  targetBoards: CircuitApplicationBoard | CircuitApplicationBoard[],
  status: string | number
) {
  if (!Array.isArray(boards)) return { boards, matched: false }

  const targets = Array.isArray(targetBoards) ? targetBoards : [targetBoards]
  const patch = buildBoardStatusPatch(status)
  let matched = false
  const nextBoards = boards.map((rawBoard) => {
    if (!targets.some((targetBoard) => isMatchingBoardRecord(targetBoard, rawBoard))) return rawBoard
    matched = true
    return {
      ...(rawBoard as Record<string, unknown>),
      ...patch
    }
  })

  return { boards: nextBoards, matched }
}

async function persistBoardStatus(
  application: CircuitApplication,
  targetBoard: CircuitApplicationBoard,
  status: string | number
) {
  await persistBoardsStatus(application, [targetBoard], status)
}

async function persistBoardsStatus(
  application: CircuitApplication,
  targetBoards: CircuitApplicationBoard[],
  status: string | number
) {
  const rows = getApplicationRelationRows(application)
  if (!rows.length || !targetBoards.length) return

  let matched = false
  const targetSet = new Set(targetBoards)
  const allBoardsPublished = application.boards.every((board) =>
    targetSet.has(board) ? true : board.status !== "draft"
  )

  const nextRows = rows.map((row) => {
    const dlbResult = updateBoardListStatus(row.dlbTestBoardList, targetBoards, status)
    const boardResult = updateBoardListStatus(row.boards, targetBoards, status)
    const relationMatched =
      !dlbResult.matched &&
      !boardResult.matched &&
      targetBoards.some((targetBoard) => isMatchingBoardRecord(targetBoard, row))

    matched = matched || dlbResult.matched || boardResult.matched || relationMatched

    return {
      ...row,
      ...(dlbResult.boards ? { dlbTestBoardList: dlbResult.boards as any } : {}),
      ...(boardResult.boards ? { boards: boardResult.boards as any } : {}),
      status: allBoardsPublished || relationMatched ? status : row.status
    }
  })

  if (!matched) {
    throw new Error("未找到要同步状态的样品")
  }

  await syncCircuitModuleApplicationList(nextRows)
  application.raw = nextRows
}

function markBoardsPublished(application: CircuitApplication, boards: CircuitApplicationBoard[]) {
  boards.forEach((board) => {
    board.publishStatus = 1
    if (board.status === "draft") board.status = "published"
  })

  if (application.boards.every((board) => board.status !== "draft")) {
    applyApplicationStatus(application, "published")
    selectedApplicationIds.value = selectedApplicationIds.value.filter((key) => key !== application.key)
  } else {
    applyApplicationStatus(application, "partial")
  }
}

async function generateOrdersForBoards(
  application: CircuitApplication,
  boards: CircuitApplicationBoard[],
  silent: boolean
) {
  const boardsToCreate = boards.filter((board) => !hasGeneratedBoardCreated(application, board))

  if (!boardsToCreate.length) {
    if (!silent) ElMessage.warning("这些样品的测试工单已生成，本次仅同步发布状态")
    return
  }

  await createGeneratedTestOrder(application, silent, boardsToCreate)
  boardsToCreate.forEach((board) => markGeneratedBoardCreated(application, board))
  if (application.boards.every((board) => hasGeneratedBoardCreated(application, board) || board.status !== "draft")) {
    markGeneratedOrderCreated(application)
  }
}

async function publishApplication(application: CircuitApplication, silent = false) {
  if (isPublishing(application) || isAnyBoardPublishing(application)) return "skipped"
  if (!application.boards.length) {
    if (!silent) ElMessage.warning("当前申请单没有电路板列表，不能发布生成测试工单")
    return "skipped"
  }
  const boardsToPublish = getPublishableBoards(application)
  if (!boardsToPublish.length) {
    if (!silent) ElMessage.warning("当前申请单没有未发布的样品")
    return "skipped"
  }

  publishingKeys.value = [...publishingKeys.value, application.key]
  try {
    try {
      await generateOrdersForBoards(application, boardsToPublish, silent)
    } catch (createError) {
      const missingBoards = getCircuitModulePublishMissingBoards(createError)
      if (missingBoards.length) {
        if (!silent) {
          await ElMessageBox.alert(formatMissingBoards(missingBoards), "以下电路板未匹配，未生成工单", {
            confirmButtonText: "知道了",
            type: "warning"
          })
        }
        return "missing_boards"
      }

      if (!silent) ElMessage.error(createError instanceof Error ? createError.message : "发布失败，未生成测试工单")
      return "failed"
    }

    try {
      await pushCommissionOrderForBoards(application, boardsToPublish)
    } catch (syncError) {
      if (!silent) ElMessage.warning("测试工单已生成，但委托单未成功推送到工程师助手，请稍后重试发布")
      return "failed"
    }

    try {
      await persistBoardsStatus(application, boardsToPublish, circuitPublishedSyncState.status)
    } catch (statusError) {
      if (!silent) ElMessage.warning("测试工单已生成，但申请单状态同步失败，未标记已发布")
      return "failed"
    }

    markBoardsPublished(application, boardsToPublish)
    refreshSelectedApplication(application)
    await loadApplications()
    refreshBindingRowsIfOpen(application)
    selectedBoardRows.value = []
    if (!silent) {
      const generatedMessage =
        application.generatedOrderType === "production" ? "已生成生产测试工单" : "已生成临时测试工单"
      ElMessage.success(`${application.orderNo} 已发布，${generatedMessage}`)
    }
    return "success"
  } finally {
    publishingKeys.value = publishingKeys.value.filter((key) => key !== application.key)
  }
}

async function publishBoard(application: CircuitApplication, board: CircuitApplicationBoard) {
  if (!isBoardPublishable(application, board)) {
    ElMessage.warning("当前样品没有可发布的测试工单")
    return
  }
  if (isPublishing(application) || isBoardPublishing(application, board)) return

  const key = getBoardPublishKey(application, board)
  publishingBoardKeys.value = [...publishingBoardKeys.value, key]
  try {
    try {
      await generateOrdersForBoards(application, [board], false)
    } catch (createError) {
      const missingBoards = getCircuitModulePublishMissingBoards(createError)
      if (missingBoards.length) {
        await ElMessageBox.alert(formatMissingBoards(missingBoards), "以下电路板未匹配，未生成工单", {
          confirmButtonText: "知道了",
          type: "warning"
        })
        return
      }

      ElMessage.error(createError instanceof Error ? createError.message : "发布失败，未生成测试工单")
      return
    }

    try {
      await pushCommissionOrderForBoards(application, [board])
    } catch (syncError) {
      ElMessage.warning("测试工单已生成，但委托单未成功推送到工程师助手，请稍后重试发布")
      return
    }

    try {
      await persistBoardStatus(application, board, circuitPublishedSyncState.status)
    } catch (statusError) {
      ElMessage.warning("测试工单已生成，但样品状态同步失败，未标记已发布")
      return
    }

    markBoardsPublished(application, [board])
    refreshSelectedApplication(application)
    refreshBindingRowsIfOpen(application)
    selectedBoardRows.value = selectedBoardRows.value.filter((item) => item !== board)
    const generatedMessage =
      application.generatedOrderType === "production" ? "已生成生产测试工单" : "已生成临时测试工单"
    ElMessage.success(`${board.sn || board.seria} 已发布，${generatedMessage}`)
  } finally {
    publishingBoardKeys.value = publishingBoardKeys.value.filter((item) => item !== key)
  }
}

function handlePrimaryAction(application: CircuitApplication) {
  if (isApplicationPublishable(application)) {
    void publishApplication(application)
    return
  }
  openApplicationDetail(application)
}

async function batchPublishApplications() {
  const targets = applications.value.filter(
    (application) => selectedApplicationIds.value.includes(application.key) && isApplicationPublishable(application)
  )
  const results = await Promise.all(targets.map((application) => publishApplication(application, true)))
  const successCount = results.filter((result) => result === "success").length
  const missingCount = results.filter((result) => result === "missing_boards").length
  const failedCount = results.filter((result) => result === "failed").length
  const skippedCount = results.filter((result) => result === "skipped").length

  const succeededKeys = targets
    .filter((application, index) => results[index] === "success")
    .map((application) => application.key)
  selectedApplicationIds.value = selectedApplicationIds.value.filter((key) => !succeededKeys.includes(key))

  if (successCount === targets.length) {
    ElMessage.success(`已批量发布 ${successCount} 条申请单`)
    return
  }

  ElMessage.warning(
    `批量发布完成：成功 ${successCount} 条，未匹配 ${missingCount} 条，失败 ${failedCount} 条，跳过 ${skippedCount} 条`
  )
}

function getBoardStatus(status: ApplicationStatus) {
  return statusMeta[status] || statusMeta.draft
}

function completeBoard(row: CircuitApplicationBoard) {
  row.status = "done"
  selectedBoardRows.value = []
  ElMessage.success(`${row.seria} 已完成`)
}

async function handlePrintOrderQrcodes(application: CircuitApplication) {
  if (!getApplicationPrintableBoards(application).length) {
    ElMessage.warning("当前申请单下没有可打印的电路板")
    return
  }
  await printBoardQrcodes(getApplicationPrintableBoards(application), {
    sourceType: "production",
    emptyMessage: "当前申请单下没有可打印的电路板"
  })
}

function handlePrintBoardQrcode(row: CircuitApplicationBoard) {
  printBoardQrcodes([row], {
    sourceType: "production",
    emptyMessage: "当前电路板缺少序列号，无法打印二维码"
  })
}

async function handlePrintSelectedBoards() {
  if (!selectedBoardRows.value.length) {
    ElMessage.warning("请先勾选需要打印的电路板")
    return
  }
  await printBoardQrcodes(selectedBoardRows.value, {
    sourceType: "production",
    emptyMessage: "当前选中电路板缺少序列号，无法打印二维码"
  })
}

function resetCreateForm() {
  Object.assign(createForm, createDefaultForm())
  createFormRef.value?.clearValidate()
}

function handleCreateApplication() {
  resetCreateForm()
  createDialogVisible.value = true
}

function buildCreateBoards() {
  const quantity = Math.max(1, Number(createForm.quantity) || 1)
  const baseSerial = getString(createForm.sn, createForm.orderNo) || createOrderNo()
  const model = getString(createForm.specModel, createForm.moduleName, defaultModuleName) || defaultModuleName
  const now = new Date().toISOString()
  return Array.from({ length: quantity }, (_, index) => {
    const serial = quantity === 1 ? baseSerial : `${baseSerial}-${String(index + 1).padStart(2, "0")}`
    return {
      id: serial,
      ypmc: createForm.moduleName.trim() || model,
      wlh: "",
      ggxh: model,
      gysmc: createForm.client.trim(),
      pch: createForm.commissionNo.trim() || createForm.orderNo.trim(),
      sl: 1,
      wtr: createForm.applicant.trim(),
      createBy: createForm.applicant.trim(),
      createTime: now,
      updateBy: createForm.applicant.trim(),
      updateTime: now,
      seria: serial,
      sn: serial,
      serial: serial,
      sampleName: createForm.moduleName.trim() || model,
      materialNo: "",
      batchNo: createForm.commissionNo.trim() || createForm.orderNo.trim(),
      supplier: createForm.client.trim(),
      quantity: "1",
      consignor: createForm.applicant.trim(),
      model,
      name: model,
      status: 0,
      raw: null
    }
  })
}

async function handleSaveApplication() {
  const valid = await createFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const boards = buildCreateBoards()
  const now = new Date().toISOString()
  const payload: CircuitModuleApplicationRelation = {
    sn: boards[0]?.sn || createForm.sn.trim(),
    djbh: createForm.orderNo.trim(),
    wtdw: createForm.client.trim(),
    kybh: createForm.commissionNo.trim(),
    xmysbh: createForm.commissionNo.trim(),
    xmmc: createForm.moduleName.trim(),
    address: createForm.remark.trim(),
    telphone: createForm.phone.trim(),
    sqrmc: createForm.applicant.trim(),
    sqrq: now.slice(0, 10),
    zj: createForm.phone.trim(),
    sylx: createForm.device.trim(),
    dlbzt: 0,
    csgy: normalizeCircuitProcessName(createForm.device) || CIRCUIT_PROCESS_OPTIONS[0],
    filename: `${createForm.orderNo.trim()}.pdf`,
    orderNo: createForm.orderNo.trim(),
    moduleName: createForm.moduleName.trim(),
    specModel: createForm.specModel.trim(),
    quantity: Number(createForm.quantity) || boards.length,
    device: createForm.device.trim(),
    hours: createForm.hours ? Number(createForm.hours) : null,
    applicant: createForm.applicant.trim(),
    client: createForm.client.trim(),
    phone: createForm.phone.trim(),
    commissionNo: createForm.commissionNo.trim(),
    sfxyjcgy: createForm.sfxyjcgy,
    remark: createForm.remark.trim(),
    status: 0,
    createBy: createForm.applicant.trim(),
    createTime: now,
    updateBy: createForm.applicant.trim(),
    updateTime: now,
    dlbTestBoardList: boards,
    boards,
    updatedAt: now
  }

  createSaving.value = true
  try {
    await syncCircuitModuleApplicationList([payload])
    createDialogVisible.value = false
    await loadApplications()
    selectedApplicationKey.value = `circuitBoardModule-${payload.orderNo || payload.sn}`
    ElMessage.success("新增成功")
  } catch (error) {
    ElMessage.error("新增失败")
  } finally {
    createSaving.value = false
  }
}

defineExpose({ refresh: loadApplications })

onMounted(() => {
  loadApplications()
})
</script>

<style lang="scss" scoped>
.circuit-task-page {
  min-height: 620px;
}

.application-panel {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-bg-color);
}

.filter-bar {
  display: grid;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.filter-row,
.list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-select {
  width: 180px;
}

.list-actions {
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}

.refresh-action {
  margin-left: auto;
}

.selected-count {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.application-list {
  height: calc(100vh - 270px);
  min-height: 360px;
  padding: 8px 10px;

  :deep(.el-scrollbar__view) {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
}

.application-card {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background-color 0.15s;

  &:hover,
  &.selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 4px rgb(59 130 246 / 10%);
  }
}

.application-main {
  flex: 1;
  min-width: 0;
}

.application-no {
  color: var(--el-text-color-secondary);
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
}

.application-name {
  overflow: hidden;
  margin: 2px 0 5px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.application-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.detail-top {
  padding: 2px 0 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.binding-dialog__header {
  margin-bottom: 10px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.board-list-section {
  margin-top: 14px;
}

.board-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.section-count {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.board-sn {
  color: var(--el-text-color-regular);
  font-family: Consolas, "Courier New", monospace;
  font-size: 13px;
}

.board-model {
  margin-top: 2px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.board-list-table {
  width: 100%;

  :deep(.el-table__cell) {
    vertical-align: top;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
  }
}

.board-cell {
  display: grid;
  gap: 3px;
  min-width: 0;
  line-height: 1.35;
  white-space: normal;
  word-break: break-all;
}

.board-cell__primary {
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
}

.board-cell__meta {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.board-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  :deep(.el-button) {
    margin-left: 0;
  }
}

@media (max-width: 1200px) {
  .refresh-action {
    margin-left: 0;
  }
}
</style>
