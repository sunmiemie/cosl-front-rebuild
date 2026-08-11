<template>
  <el-dialog
    :model-value="modelValue"
    :title="mode === 'publish' ? '确认电路板与委托单关联' : '编辑电路板与委托单关联'"
    width="min(1180px, 96vw)"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="mode !== 'publish'"
    @close="cancel"
  >
    <div class="dialog-summary">
      <div>
        <span class="summary-label">申请单号</span>
        <strong>{{ applicationNo || "-" }}</strong>
      </div>
      <el-tag v-if="snapshot" :type="syncTagType" effect="plain">{{ syncText }}</el-tag>
    </div>

    <el-alert
      v-if="mode === 'publish'"
      title="可按电路板选择委托单和样品明细；暂不关联的电路板保持为空即可。确认后会按当前申请单整单保存。"
      type="info"
      :closable="false"
      show-icon
      class="binding-tip"
    />
    <el-alert
      v-if="snapshot?.syncError"
      :title="snapshot.syncError"
      type="warning"
      :closable="false"
      show-icon
      class="binding-tip"
    />

    <el-table v-loading="loading" :data="rows" border max-height="520" table-layout="fixed">
      <el-table-column label="电路板明细" min-width="210">
        <template #default="{ row }">
          <div class="board-info">
            <strong>{{ row.sampleName || "未命名电路板" }}</strong>
            <span>板 ID：{{ row.boardId }}</span>
            <span>型号：{{ row.specModel || "-" }}</span>
            <span>批次：{{ row.batchNo || "-" }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="SN" min-width="180">
        <template #default="{ row }">
          <div class="sn-list">
            <el-tag v-for="sn in row.snList" :key="sn" effect="plain" size="small">{{ sn }}</el-tag>
            <span v-if="!row.snList.length">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="委托单" min-width="250">
        <template #default="{ row }">
          <el-select
            v-model="row.commissionNo"
            clearable
            filterable
            placeholder="不关联"
            style="width: 100%"
            :loading="orderLoading"
            @change="handleCommissionChange(row)"
          >
            <el-option
              v-for="order in orderList"
              :key="String(order.id)"
              :label="getOrderLabel(order)"
              :value="String(order.commission_no)"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="样品明细" min-width="240">
        <template #default="{ row }">
          <el-select
            v-model="row.sampleId"
            clearable
            filterable
            placeholder="请选择样品明细"
            style="width: 100%"
            :disabled="!row.commissionNo"
            :loading="sampleLoadingOrders.has(row.commissionNo || '')"
            @change="handleSampleChange(row)"
          >
            <el-option
              v-for="sample in getSampleOptions(row.commissionNo)"
              :key="sample.value"
              :label="sample.label"
              :value="sample.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="关联数量" width="130" align="center">
        <template #default="{ row }">
          <el-input-number
            v-model="row.fpNumber"
            :min="row.commissionNo ? 1 : 0"
            :max="Math.max(1, row.quantity)"
            :disabled="!row.commissionNo"
            controls-position="right"
            style="width: 100px"
          />
          <div class="quantity-hint">共 {{ row.quantity }} 块</div>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button
        v-if="snapshot?.syncStatus === 'failed' && mode === 'edit'"
        type="warning"
        plain
        :loading="retrying"
        :disabled="confirming"
        @click="retrySync"
      >
        重试同步
      </el-button>
      <el-button :disabled="confirming || loading" @click="cancel">取消</el-button>
      <el-button type="primary" :loading="confirming" :disabled="loading" @click="confirm">
        {{ mode === "publish" ? "确认并继续发布" : "保存关联" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { ElMessage } from "element-plus"
import {
  getCircuitModuleBindingSnapshot,
  retryCircuitModuleBindingSnapshot,
  type CircuitModuleBindingBoard,
  type CircuitModuleBindingSnapshot
} from "@/api/circuit-module-application"
import { request } from "@/utils/service"

type DialogMode = "publish" | "edit"

interface CommissionOrderOption {
  id: string | number
  commission_no: string
  commission_org?: string
  contact_name?: string
}

interface CommissionSampleOption {
  value: string
  label: string
  name: string
  spec: string
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    applicationNo: string
    mode?: DialogMode
    confirming?: boolean
  }>(),
  {
    mode: "edit",
    confirming: false
  }
)

const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  confirm: [rows: CircuitModuleBindingBoard[]]
  cancel: []
}>()

const loading = ref(false)
const orderLoading = ref(false)
const retrying = ref(false)
const snapshot = ref<CircuitModuleBindingSnapshot | null>(null)
const rows = ref<CircuitModuleBindingBoard[]>([])
const orderList = ref<CommissionOrderOption[]>([])
const sampleOptions = reactive<Record<string, CommissionSampleOption[]>>({})
const sampleLoadingOrders = reactive(new Set<string>())
let loadRequestSequence = 0

const modelValue = computed(() => props.modelValue)
const mode = computed(() => props.mode)
const applicationNo = computed(() => props.applicationNo)
const confirming = computed(() => props.confirming)

const syncText = computed(() => {
  const status = snapshot.value?.syncStatus
  if (status === "success") return "已同步小助手"
  if (status === "failed") return "同步失败"
  if (status === "skipped") return "本地申请单，无需同步"
  return "待同步"
})

const syncTagType = computed<"success" | "warning" | "info">(() => {
  if (snapshot.value?.syncStatus === "success") return "success"
  if (snapshot.value?.syncStatus === "failed") return "warning"
  return "info"
})

function cloneRows(items: CircuitModuleBindingBoard[]) {
  return items.map((item) => ({
    ...item,
    boardId: String(item.boardId || ""),
    orderId: item.orderId === null || item.orderId === undefined ? null : String(item.orderId),
    commissionNo: item.commissionNo || null,
    sampleId: item.sampleId === null || item.sampleId === undefined ? null : String(item.sampleId),
    fpNumber: Math.max(0, Number(item.fpNumber) || 0),
    quantity: Math.max(1, Number(item.quantity) || 1),
    snList: Array.isArray(item.snList) ? item.snList.map(String) : []
  }))
}

function getOrderLabel(order: CommissionOrderOption) {
  const suffix = [order.commission_org, order.contact_name].filter(Boolean).join(" / ")
  return suffix ? `${order.commission_no} - ${suffix}` : order.commission_no
}

function getSampleName(sample: any) {
  return String(sample?.sample_name || sample?.["样品名称"] || "未命名样品")
}

function getSampleSpec(sample: any) {
  return String(sample?.spec_model || sample?.["规格型号"] || "")
}

function getSampleOptions(commissionNo: string | null) {
  return commissionNo ? sampleOptions[commissionNo] || [] : []
}

async function loadOrders() {
  orderLoading.value = true
  try {
    const response: any = await request({
      url: "data/commission-order/list",
      method: "get",
      params: { currentPage: 1, pageSize: 1000 }
    })
    orderList.value = Array.isArray(response?.data?.list) ? response.data.list : []
  } catch {
    orderList.value = []
    ElMessage.warning("委托单列表加载失败，可暂不关联并继续发布")
  } finally {
    orderLoading.value = false
  }
}

async function loadSamples(commissionNo: string) {
  if (!commissionNo || sampleOptions[commissionNo] || sampleLoadingOrders.has(commissionNo)) return
  sampleLoadingOrders.add(commissionNo)
  try {
    const response: any = await request({
      url: "data/commission-order/detail",
      method: "get",
      params: { commissionNo }
    })
    const samples = Array.isArray(response?.data?.samples) ? response.data.samples : []
    sampleOptions[commissionNo] = samples.map((sample: any) => {
      const name = getSampleName(sample)
      const spec = getSampleSpec(sample)
      return {
        value: String(sample.id),
        label: spec ? `${name} / ${spec}` : name,
        name,
        spec
      }
    })
  } catch {
    sampleOptions[commissionNo] = []
    ElMessage.warning(`委托单 ${commissionNo} 的样品明细加载失败`)
  } finally {
    sampleLoadingOrders.delete(commissionNo)
  }
}

async function loadDialogData() {
  if (!props.applicationNo) return
  const requestSequence = ++loadRequestSequence
  const requestedApplicationNo = props.applicationNo
  snapshot.value = null
  rows.value = []
  loading.value = true
  try {
    const [response] = await Promise.all([getCircuitModuleBindingSnapshot(props.applicationNo), loadOrders()])
    if (
      requestSequence !== loadRequestSequence ||
      !props.modelValue ||
      props.applicationNo !== requestedApplicationNo
    ) {
      return
    }
    snapshot.value = response.data
    rows.value = cloneRows(response.data?.boardList || [])
    await Promise.all(
      [...new Set(rows.value.map((row) => row.commissionNo).filter((value): value is string => Boolean(value)))].map(
        loadSamples
      )
    )
  } catch (error: any) {
    if (requestSequence !== loadRequestSequence || props.applicationNo !== requestedApplicationNo) return
    rows.value = []
    snapshot.value = null
    ElMessage.error(error?.response?.data?.message || error?.response?.data?.msg || "加载关联信息失败")
  } finally {
    if (requestSequence === loadRequestSequence) loading.value = false
  }
}

async function handleCommissionChange(row: CircuitModuleBindingBoard) {
  row.sampleId = null
  row.commissionSampleName = null
  row.commissionSampleSpec = null
  if (!row.commissionNo) {
    row.orderId = null
    row.fpNumber = 0
    return
  }
  const order = orderList.value.find((item) => String(item.commission_no) === row.commissionNo)
  row.orderId = order ? String(order.id) : null
  row.fpNumber = Math.max(1, Math.min(row.quantity, row.fpNumber || 1))
  await loadSamples(row.commissionNo)
}

function handleSampleChange(row: CircuitModuleBindingBoard) {
  const sample = getSampleOptions(row.commissionNo).find((item) => item.value === row.sampleId)
  row.commissionSampleName = sample?.name || null
  row.commissionSampleSpec = sample?.spec || null
}

function validateRows() {
  for (const row of rows.value) {
    if (!row.boardId) return "存在缺少电路板 ID 的明细，无法保存关联"
    if (!row.commissionNo) continue
    if (!row.orderId || !row.sampleId) return `${row.sampleName || row.boardId} 请选择委托单样品明细`
    if (!Number.isInteger(row.fpNumber) || row.fpNumber < 1 || row.fpNumber > row.quantity) {
      return `${row.sampleName || row.boardId} 的关联数量应为 1 至 ${row.quantity}`
    }
  }
  return ""
}

function confirm() {
  const message = validateRows()
  if (message) {
    ElMessage.warning(message)
    return
  }
  emit("confirm", cloneRows(rows.value))
}

async function retrySync() {
  retrying.value = true
  try {
    const response = await retryCircuitModuleBindingSnapshot(props.applicationNo)
    snapshot.value = response.data
    if (response.data?.syncStatus === "success") {
      ElMessage.success("整单关联已重新同步小助手")
    } else if (response.data?.syncStatus === "skipped") {
      ElMessage.info("当前为本地申请单，无需同步小助手")
    } else {
      ElMessage.warning(response.data?.syncError || response.data?.assistantSync?.message || "同步仍未成功")
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.response?.data?.msg || "重试同步失败")
  } finally {
    retrying.value = false
  }
}

function cancel() {
  loadRequestSequence += 1
  loading.value = false
  emit("update:modelValue", false)
  emit("cancel")
}

watch(
  () => [props.modelValue, props.applicationNo] as const,
  ([visible]) => {
    if (visible) void loadDialogData()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.dialog-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.summary-label {
  margin-right: 8px;
  color: var(--el-text-color-secondary);
}

.binding-tip {
  margin-bottom: 12px;
}

.board-info {
  display: grid;
  gap: 3px;
  line-height: 1.35;

  span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.sn-list {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.quantity-hint {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
