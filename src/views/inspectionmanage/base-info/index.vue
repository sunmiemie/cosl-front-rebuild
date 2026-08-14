<template>
  <div class="app-container">
    <div class="editor-header">
      <div>
        <div class="editor-title">{{ formData.id ? "编辑巡检配置" : "新增巡检配置" }}</div>
        <div class="editor-subtitle">巡检人和巡检内容按设备统一配置</div>
      </div>
      <el-button @click="handleClose">返回列表</el-button>
    </div>

    <el-card shadow="never" class="search-wrapper">
      <el-form label-width="132px" class="inspection-form">
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="巡检设备类型" required>
              <el-select v-model="formData.device_type" placeholder="请选择设备类型" @change="handleDeviceTypeChange">
                <el-option v-for="item in deviceOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检设备名称" required>
              <el-select
                v-model="formData.device_id"
                placeholder="请选择设备名称"
                :loading="deviceLoading"
                clearable
                filterable
                @change="handleDeviceChange"
              >
                <el-option
                  v-for="device in filteredDeviceOptions"
                  :key="device.id"
                  :label="device.hostName"
                  :value="device.id"
                >
                  <span>{{ device.hostName }}</span>
                  <span class="device-option-sn">{{ device.sn }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="巡检设备SN号">
              <el-text class="selected-device-text" truncated>{{ selectedDeviceSn || "-" }}</el-text>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <div class="toolbar-title">巡检内容</div>
          <div class="toolbar-subtitle">
            当前巡检人：{{ currentInspectorLabel }}
            <span v-if="formData.items.length"> · 共 {{ formData.items.length }} 条</span>
          </div>
        </div>
        <div class="toolbar-actions">
          <el-button type="primary" @click="openBatchDialog(undefined, true)">新增巡检内容</el-button>
          <el-button :disabled="!formData.items.length" @click="openBatchDialog()">批量编辑</el-button>
          <el-button @click="handleClose">返回列表</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="formData.items" border stripe class="inspection-table" v-loading="contentLoading">
          <el-table-column prop="sortNo" label="序号" width="70" align="center" />
          <el-table-column prop="content" label="巡检内容" min-width="320" show-overflow-tooltip />
          <el-table-column label="巡检结果填写方式" width="170" align="center">
            <template #default="{ row }">
              {{ row.resultType === 1 ? "文本填写" : "选项选择" }}
            </template>
          </el-table-column>
          <el-table-column label="是否需要拍照" width="140" align="center">
            <template #default="{ row }">
              {{ row.requirePhoto ? "是" : "否" }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="openBatchDialog(row.id)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="巡检内容配置"
      width="min(1000px, 88vw)"
      class="inspection-batch-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="!saving"
      :before-close="handleDialogBeforeClose"
    >
      <div class="dialog-scroll-area">
        <div class="device-summary">
          <div>
            <span class="summary-label">设备类型</span>
            <span>{{ formData.device_type }}</span>
          </div>
          <div>
            <span class="summary-label">设备名称</span>
            <span>{{ selectedDeviceName }}</span>
          </div>
          <div>
            <span class="summary-label">SN号</span>
            <span>{{ selectedDeviceSn }}</span>
          </div>
        </div>

        <el-form label-width="112px" class="owner-form">
          <el-form-item label="巡检人（可多选）" required>
            <el-select
              ref="inspectorSelectRef"
              v-model="draftInspectorUserIds"
              placeholder="请选择当前设备巡检人（可多选）"
              filterable
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="visibleInspectorTagCount"
              :loading="inspectionUsersLoading"
            >
              <el-option
                v-for="user in inspectionUserOptions"
                :key="user.id"
                :label="getInspectionUserLabel(user)"
                :value="user.id"
              />
            </el-select>
            <div class="form-tip">已选巡检人均对当前设备下全部巡检内容生效，不需要按巡检项重复配置</div>
          </el-form-item>
        </el-form>

        <div class="dialog-toolbar">
          <div>
            <div class="dialog-section-title">巡检内容</div>
            <div class="dialog-section-subtitle">逐条展开填写，按住拖拽按钮调整推送顺序</div>
          </div>
          <el-button type="primary" plain @click="addDraftItem">＋ 新增一条</el-button>
        </div>

        <el-collapse
          v-model="activeDraftKey"
          accordion
          class="inspection-collapse"
          :class="{ 'is-dragging': draftDragging }"
        >
          <VueDraggable
            v-model="draftItems"
            tag="div"
            class="inspection-drag-list"
            handle=".drag-sort-handle"
            :animation="180"
            ghost-class="inspection-drag-ghost"
            chosen-class="inspection-drag-chosen"
            @start="handleDraftDragStart"
            @end="handleDraftDragEnd"
          >
            <el-collapse-item v-for="(item, index) in draftItems" :key="item.clientKey" :name="item.clientKey">
              <template #title>
                <div class="collapse-title">
                  <span class="sequence-badge">{{ index + 1 }}</span>
                  <span class="collapse-summary" :class="{ placeholder: !item.content.trim() }">
                    {{ item.content.trim() || "待填写巡检内容" }}
                  </span>
                  <div class="sort-actions">
                    <button
                      type="button"
                      class="drag-sort-handle"
                      :disabled="draftItems.length <= 1"
                      title="按住拖拽调整顺序"
                      aria-label="拖拽排序"
                      @click.stop
                    >
                      <span aria-hidden="true">⠿</span>
                      <span>拖拽</span>
                    </button>
                    <el-button link type="danger" @click.stop="removeDraftItem(index)">删除</el-button>
                  </div>
                </div>
              </template>

              <el-form label-width="132px" class="item-form">
                <el-form-item label="巡检内容" required>
                  <el-input
                    v-model="item.content"
                    type="textarea"
                    :rows="4"
                    maxlength="500"
                    show-word-limit
                    placeholder="请输入巡检内容"
                  />
                </el-form-item>
                <el-form-item label="结果填写方式" required>
                  <el-segmented v-model="item.resultType" :options="resultTypeOptions" />
                </el-form-item>
                <el-form-item label="需要拍照">
                  <el-switch v-model="item.requirePhoto" />
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </VueDraggable>
        </el-collapse>
      </div>

      <template #footer>
        <el-button :disabled="saving" @click="requestCloseDialog">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存全部</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { VueDraggable } from "vue-draggable-plus"
import { useRoute, useRouter } from "vue-router"
import { inspectionDeviceOptions, type InspectionItem, type InspectionResultType } from "../shared"
import { getDeviceInstanceListApi } from "@/api/device-instance"
import type { DeviceInstanceData } from "@/api/device-instance/types"
import { getHostModelDisplayName } from "@/views/devicemanage/device/psi/model-options"
import {
  getInspectionBaseInfoDetailApi,
  getInspectionBaseInfoListApi,
  getInspectionUserOptionsApi,
  saveInspectionBaseInfoApi
} from "@/api/inspection-base"
import type {
  InspectionBaseInfoDetail,
  InspectionBaseInspector,
  InspectionUserOption
} from "@/api/inspection-base/types"

type InspectionDeviceOption = {
  id: string
  sn: string
  hostName: string
  modelName: string
}

const router = useRouter()
const route = useRoute()
const deviceOptions = inspectionDeviceOptions
const resultTypeOptions: Array<{ label: string; value: InspectionResultType }> = [
  { label: "选项选择", value: 0 },
  { label: "文本填写", value: 1 }
]

const allDeviceOptions = ref<InspectionDeviceOption[]>([])
const filteredDeviceOptions = ref<InspectionDeviceOption[]>([])
const deviceLoading = ref(false)
const contentLoading = ref(false)
const saving = ref(false)
const inspectionUserOptions = ref<InspectionUserOption[]>([])
const inspectionUsersLoading = ref(false)
let deviceCacheLoaded = false
let inspectionUsersLoaded = false
let draftSequence = 0

const formData = reactive({
  id: "",
  inspection_no: "",
  device_id: "",
  device_type: "",
  device_name: "",
  device_sn: "",
  inspector: "",
  assistant_inspector_user_id: null as string | null,
  inspector_name: "",
  inspector_department: "",
  inspectors: [] as InspectionBaseInspector[],
  status: "正常" as "正常" | "维保中" | "维修中",
  items: [] as InspectionItem[],
  created_at: "",
  updated_at: ""
})

const selectedDevice = computed(() => allDeviceOptions.value.find((item) => item.id === formData.device_id))
const selectedDeviceName = computed(() => selectedDevice.value?.hostName || formData.device_name || "-")
const selectedDeviceSn = computed(() => selectedDevice.value?.sn || formData.device_sn || "")
const currentInspectorLabel = computed(() => {
  if (formData.inspectors.length) {
    return formData.inspectors
      .map((item) => (item.department ? `${item.name}（${item.department}）` : item.name))
      .join("、")
  }
  const name = formData.inspector_name || formData.inspector
  if (!name) return "未配置"
  return formData.inspector_department ? `${name}（${formData.inspector_department}）` : name
})

function normalizeResultType(value: unknown): InspectionResultType {
  return Number(value) === 1 ? 1 : 0
}

function getDeviceInstanceId(row: DeviceInstanceData) {
  const value = row.id ?? row.psi_id ?? row.device_id ?? row.deviceId
  return value === undefined || value === null ? "" : String(value)
}

function getDeviceInstanceName(row: DeviceInstanceData) {
  return row.deviceName ?? row.device_name ?? row.psi_name ?? ""
}

function getDeviceInstanceSn(row: DeviceInstanceData) {
  return row.serialNumber ?? row.serial_number ?? row.psi_serialnumber ?? ""
}

function getDeviceInstanceModelName(row: DeviceInstanceData) {
  return (
    getHostModelDisplayName(row as unknown as Record<string, unknown>) ||
    row.modelName ||
    row.model_name ||
    row.psimodel_name ||
    row.model ||
    ""
  )
}

function normalizeDeviceInstanceList(data: any): DeviceInstanceData[] {
  const payload = data?.data ?? data ?? {}
  return Array.isArray(payload) ? payload : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []
}

function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, "").replace(/&/g, "").toLowerCase()
}

function matchesInspectionDeviceGroup(row: InspectionDeviceOption, deviceType: string) {
  const group = normalizeSearchText(deviceType)
  const text = normalizeSearchText([row.hostName, row.modelName, row.sn].join(" "))
  if (!group || !text) return false
  if (/halt|hass/i.test(deviceType)) return /halt|hass/i.test(text)
  if (deviceType.includes("高温箱")) return text.includes("高温箱")
  if (deviceType.includes("高温高压")) return text.includes("高温高压") || text.includes("高压井")
  if (deviceType.includes("水循环")) return text.includes("水循环")
  if (deviceType.includes("振动")) return text.includes("振动")
  if (deviceType.includes("模拟")) return text.includes("模拟")
  return text.includes(group)
}

async function loadAllDeviceOptions() {
  if (deviceCacheLoaded) return
  deviceLoading.value = true
  try {
    const res = await getDeviceInstanceListApi({ currentPage: 1, size: 2000 })
    const seen = new Set<string>()
    allDeviceOptions.value = normalizeDeviceInstanceList(res)
      .map((row) => {
        const id = getDeviceInstanceId(row)
        const sn = getDeviceInstanceSn(row).trim()
        const modelName = getDeviceInstanceModelName(row).trim()
        const hostName = getDeviceInstanceName(row).trim() || modelName || sn
        return { id, sn, hostName, modelName }
      })
      .filter((item) => {
        if (!item.id || !item.sn || seen.has(item.id)) return false
        seen.add(item.id)
        return true
      })
    deviceCacheLoaded = true
  } finally {
    deviceLoading.value = false
  }
}

async function loadDeviceOptions(deviceType: string, keepDeviceId = "") {
  try {
    await loadAllDeviceOptions()
    const matched = allDeviceOptions.value.filter((item) => matchesInspectionDeviceGroup(item, deviceType))
    const keepDevice = keepDeviceId ? allDeviceOptions.value.find((item) => item.id === keepDeviceId) : undefined
    filteredDeviceOptions.value =
      keepDevice && !matched.some((item) => item.id === keepDevice.id) ? [keepDevice, ...matched] : matched
  } catch {
    filteredDeviceOptions.value = []
    ElMessage.error("加载巡检设备失败")
  }
}

function getAssistantEquipmentType(deviceType: string) {
  if (/halt|hass/i.test(deviceType)) return "1"
  if (deviceType.includes("高温箱")) return "2"
  if (deviceType.includes("高温高压")) return "3"
  if (deviceType.includes("水循环")) return "4"
  if (deviceType.includes("振动")) return "5"
  if (deviceType.includes("电路板")) return "6"
  if (deviceType.includes("模拟")) return "7"
  return ""
}

function clearLoadedInspection() {
  formData.id = ""
  formData.inspection_no = ""
  formData.inspector = ""
  formData.assistant_inspector_user_id = null
  formData.inspector_name = ""
  formData.inspector_department = ""
  formData.inspectors = []
  formData.items = []
  formData.created_at = ""
  formData.updated_at = ""
}

function handleDeviceTypeChange() {
  formData.device_id = ""
  formData.device_name = ""
  formData.device_sn = ""
  clearLoadedInspection()
  void replaceRouteInspectionId()
  void loadDeviceOptions(formData.device_type)
}

function handleDeviceChange() {
  clearLoadedInspection()
  const device = selectedDevice.value
  formData.device_name = device?.hostName || ""
  formData.device_sn = device?.sn || ""
  void replaceRouteInspectionId()
  void loadExistingContentForSelection()
}

function createClientKey() {
  draftSequence += 1
  return `inspection-draft-${Date.now()}-${draftSequence}`
}

function normalizeItems(items: InspectionBaseInfoDetail["items"]): InspectionItem[] {
  return (items || []).map((item, index) => ({
    id: String(item.id),
    clientKey: `inspection-item-${item.id}`,
    sortNo: Number(item.sort_no) || index + 1,
    content: item.content,
    resultType: normalizeResultType(item.result_type),
    requirePhoto: Boolean(item.require_photo)
  }))
}

async function applyDetail(detail: InspectionBaseInfoDetail) {
  const deviceType = detail.device_type || detail.device_name
  await loadDeviceOptions(deviceType, detail.device_id ? String(detail.device_id) : "")
  formData.id = String(detail.id)
  formData.inspection_no = detail.inspection_no
  formData.device_type = deviceType
  formData.device_id = detail.device_id ? String(detail.device_id) : ""
  if (!formData.device_id && detail.device_sn) {
    formData.device_id = allDeviceOptions.value.find((item) => item.sn === detail.device_sn)?.id || ""
  }
  formData.device_name = detail.device_name
  formData.device_sn = detail.device_sn
  formData.inspector = detail.inspector
  formData.assistant_inspector_user_id = detail.assistant_inspector_user_id || null
  formData.inspector_name = detail.inspector_name || detail.inspector || ""
  formData.inspector_department = detail.inspector_department || ""
  formData.inspectors = detail.inspectors?.length
    ? detail.inspectors.map((item) => ({ ...item }))
    : detail.assistant_inspector_user_id
      ? [
          {
            id: detail.assistant_inspector_user_id,
            name: detail.inspector_name || detail.inspector,
            department: detail.inspector_department || ""
          }
        ]
      : []
  formData.status = detail.status
  formData.items = normalizeItems(detail.items)
  formData.created_at = detail.created_at || ""
  formData.updated_at = detail.updated_at || ""
}

async function loadInspectionDetailById(id: number, syncRoute = false) {
  const res = await getInspectionBaseInfoDetailApi(id)
  await applyDetail(res.data)
  if (syncRoute && String(route.query.id || "") !== String(id)) {
    await replaceRouteInspectionId(id)
  }
}

async function replaceRouteInspectionId(id?: number) {
  const query = { ...route.query }
  if (id) {
    query.id = String(id)
  } else {
    delete query.id
    delete query.base_id
    delete query.baseId
    delete query.baseID
  }
  await router.replace({ path: route.path, query })
}

async function loadExistingContentForSelection() {
  const deviceId = Number(formData.device_id)
  if (!Number.isFinite(deviceId)) return
  contentLoading.value = true
  try {
    const res = await getInspectionBaseInfoListApi({ currentPage: 1, pageSize: 1, device_id: deviceId })
    const matched = res.data.list?.[0]
    if (!matched) {
      clearLoadedInspection()
      const device = selectedDevice.value
      formData.device_name = device?.hostName || ""
      formData.device_sn = device?.sn || ""
      await replaceRouteInspectionId()
      return
    }
    await loadInspectionDetailById(matched.id, true)
  } catch {
    ElMessage.error("加载已有巡检内容失败")
  } finally {
    contentLoading.value = false
  }
}

async function fetchDetail() {
  const raw =
    (route.query.id as any) ??
    (route.query.base_id as any) ??
    (route.query.baseId as any) ??
    (route.query.baseID as any)
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === undefined || value === null || value === "") {
    const rawDeviceId = route.query.deviceId ?? route.query.device_id
    const routeDeviceId = Array.isArray(rawDeviceId) ? rawDeviceId[0] : rawDeviceId
    if (routeDeviceId === undefined || routeDeviceId === null || routeDeviceId === "") return
    try {
      await loadAllDeviceOptions()
      const deviceId = String(routeDeviceId)
      const device = allDeviceOptions.value.find((item) => item.id === deviceId)
      if (!device) {
        ElMessage.warning("未找到对应的巡检设备")
        return
      }
      const rawDeviceType = route.query.deviceType ?? route.query.device_type
      const routeDeviceType = Array.isArray(rawDeviceType) ? rawDeviceType[0] : rawDeviceType
      clearLoadedInspection()
      formData.device_type = String(routeDeviceType || "")
      await loadDeviceOptions(formData.device_type, deviceId)
      formData.device_id = deviceId
      formData.device_name = device.hostName
      formData.device_sn = device.sn
    } catch {
      ElMessage.error("加载巡检设备失败")
    }
    return
  }
  const id = Number(value)
  if (!Number.isFinite(id)) return
  contentLoading.value = true
  try {
    await loadInspectionDetailById(id)
  } catch {
    ElMessage.error("加载巡检明细失败")
  } finally {
    contentLoading.value = false
  }
}

watch(() => route.fullPath, fetchDetail, { immediate: true })

const dialogVisible = ref(false)
const draftItems = ref<InspectionItem[]>([])
const activeDraftKey = ref("")
const draftInspectorUserIds = ref<string[]>([])
const dialogSnapshot = ref("")
const draftDragging = ref(false)
const inspectorSelectRef = ref<{ $el?: HTMLElement } | null>(null)
const visibleInspectorTagCount = ref(1)
let inspectorResizeObserver: ResizeObserver | null = null
let observedInspectorSelect: HTMLElement | null = null
let inspectorTextMeasureCanvas: HTMLCanvasElement | null = null

function handleDraftDragStart() {
  draftDragging.value = true
}

function handleDraftDragEnd() {
  normalizeDraftOrder()
  draftDragging.value = false
}

function getInspectionUserLabel(user: InspectionUserOption) {
  return user.department_name ? `${user.name}（${user.department_name}）` : user.name
}

function measureInspectorTextWidth(text: string, fontFamily: string) {
  inspectorTextMeasureCanvas ||= document.createElement("canvas")
  const context = inspectorTextMeasureCanvas.getContext("2d")
  if (!context) return text.length * 12
  context.font = `12px ${fontFamily || "sans-serif"}`
  return Math.ceil(context.measureText(text).width)
}

function updateVisibleInspectorTagCount() {
  void nextTick(() => {
    const selectedCount = draftInspectorUserIds.value.length
    if (selectedCount <= 1) {
      visibleInspectorTagCount.value = 1
      return
    }

    const selectElement = inspectorSelectRef.value?.$el
    const selectionElement = selectElement?.querySelector<HTMLElement>(".el-select__selection")
    if (!selectElement || !selectionElement || selectionElement.clientWidth <= 0) return

    const usersById = new Map(inspectionUserOptions.value.map((user) => [user.id, user]))
    const labels = draftInspectorUserIds.value.map((userId) => {
      const user = usersById.get(userId)
      return user ? getInspectionUserLabel(user) : userId
    })
    const selectionStyle = window.getComputedStyle(selectionElement)
    const selectStyle = window.getComputedStyle(selectElement)
    const gap = Number.parseFloat(selectionStyle.columnGap || selectionStyle.gap) || 6
    const availableWidth = selectionElement.clientWidth
    const inputWidth = 11
    const closableTagExtraWidth = 36
    const collapsedTagExtraWidth = 20
    const tagWidths = labels.map(
      (label) => measureInspectorTextWidth(label, selectStyle.fontFamily) + closableTagExtraWidth
    )
    const allTagsWidth = tagWidths.reduce((total, width) => total + width, 0) + gap * selectedCount + inputWidth

    if (allTagsWidth <= availableWidth) {
      visibleInspectorTagCount.value = selectedCount
      return
    }

    let visibleCount = 1
    let visibleTagsWidth = 0
    for (let index = 0; index < selectedCount - 1; index += 1) {
      visibleTagsWidth += tagWidths[index]
      const hiddenCount = selectedCount - index - 1
      const collapsedTagWidth =
        measureInspectorTextWidth(`+ ${hiddenCount}`, selectStyle.fontFamily) + collapsedTagExtraWidth
      const occupiedWidth = visibleTagsWidth + collapsedTagWidth + inputWidth + gap * (index + 2)
      if (occupiedWidth > availableWidth) break
      visibleCount = index + 1
    }
    visibleInspectorTagCount.value = visibleCount
  })
}

function observeInspectorSelectSize() {
  void nextTick(() => {
    const selectElement = inspectorSelectRef.value?.$el
    if (!selectElement) return
    if (selectElement !== observedInspectorSelect) {
      inspectorResizeObserver?.disconnect()
      inspectorResizeObserver = new ResizeObserver(updateVisibleInspectorTagCount)
      inspectorResizeObserver.observe(selectElement)
      observedInspectorSelect = selectElement
    }
    updateVisibleInspectorTagCount()
  })
}

watch([draftInspectorUserIds, inspectionUserOptions], updateVisibleInspectorTagCount, { deep: true })
watch(dialogVisible, (visible) => {
  if (visible) {
    observeInspectorSelectSize()
  } else {
    inspectorResizeObserver?.disconnect()
    observedInspectorSelect = null
  }
})

onBeforeUnmount(() => inspectorResizeObserver?.disconnect())

async function loadInspectionUserOptions() {
  if (inspectionUsersLoaded) return
  inspectionUsersLoading.value = true
  try {
    const res = await getInspectionUserOptionsApi()
    inspectionUserOptions.value = Array.isArray(res.data) ? res.data : []
    inspectionUsersLoaded = true
  } catch {
    ElMessage.error("加载小助手巡检人员名单失败")
    throw new Error("load inspection users failed")
  } finally {
    inspectionUsersLoading.value = false
  }
}

function cloneCurrentItems() {
  return formData.items.map((item, index) => ({
    ...item,
    clientKey: item.id ? `inspection-item-${item.id}` : createClientKey(),
    sortNo: index + 1
  }))
}

function createEmptyDraft(): InspectionItem {
  return {
    id: "",
    clientKey: createClientKey(),
    sortNo: draftItems.value.length + 1,
    content: "",
    resultType: 0,
    requirePhoto: false
  }
}

function normalizeDraftOrder() {
  draftItems.value.forEach((item, index) => {
    item.sortNo = index + 1
  })
}

function serializeDraftState() {
  return JSON.stringify({
    inspectors: draftInspectorUserIds.value,
    items: draftItems.value.map((item) => ({
      id: item.id,
      content: item.content,
      resultType: item.resultType,
      requirePhoto: item.requirePhoto
    }))
  })
}

function isDialogDirty() {
  return serializeDraftState() !== dialogSnapshot.value
}

async function openBatchDialog(focusItemId?: string, appendNew = false) {
  if (!formData.device_type || !formData.device_id) {
    ElMessage.warning("请先选择巡检设备类型和设备名称")
    return
  }
  draftItems.value = cloneCurrentItems()
  draftInspectorUserIds.value = formData.inspectors.map((item) => item.id)
  dialogSnapshot.value = serializeDraftState()
  dialogVisible.value = true
  try {
    await loadInspectionUserOptions()
    const validUserIds = new Set(inspectionUserOptions.value.map((user) => user.id))
    const validSelectedIds = draftInspectorUserIds.value.filter((userId) => validUserIds.has(userId))
    if (validSelectedIds.length !== draftInspectorUserIds.value.length) {
      draftInspectorUserIds.value = validSelectedIds
      ElMessage.warning("部分原巡检人已不在小助手用户列表中，请重新选择")
    }
  } catch {
    // 错误消息已在加载方法中提示，保留弹窗便于重试。
  }
  if (appendNew || draftItems.value.length === 0) {
    addDraftItem()
  } else {
    activeDraftKey.value =
      draftItems.value.find((item) => item.id === focusItemId)?.clientKey || draftItems.value[0].clientKey
  }
}

function addDraftItem() {
  const item = createEmptyDraft()
  draftItems.value.push(item)
  normalizeDraftOrder()
  activeDraftKey.value = item.clientKey
}

function removeDraftItem(index: number) {
  if (draftItems.value.length <= 1) {
    ElMessage.warning("至少保留一条巡检内容")
    return
  }
  const [removed] = draftItems.value.splice(index, 1)
  normalizeDraftOrder()
  if (activeDraftKey.value === removed.clientKey) {
    activeDraftKey.value = draftItems.value[Math.min(index, draftItems.value.length - 1)]?.clientKey || ""
  }
}

function validateDraft() {
  if (!draftInspectorUserIds.value.length) {
    ElMessage.warning("请至少选择一名当前设备巡检人")
    return false
  }
  const validUserIds = new Set(inspectionUserOptions.value.map((user) => user.id))
  if (draftInspectorUserIds.value.some((userId) => !validUserIds.has(userId))) {
    ElMessage.warning("部分所选巡检人已不在小助手用户列表中，请重新选择")
    return false
  }
  for (const [index, item] of draftItems.value.entries()) {
    if (!item.content.trim()) {
      activeDraftKey.value = item.clientKey
      ElMessage.warning(`请填写第 ${index + 1} 条巡检内容`)
      return false
    }
  }
  return true
}

async function handleSave() {
  if (saving.value || !validateDraft()) return
  const deviceId = Number(formData.device_id)
  const device = selectedDevice.value
  const usersById = new Map(inspectionUserOptions.value.map((user) => [user.id, user]))
  const selectedInspectors = draftInspectorUserIds.value
    .map((userId) => usersById.get(userId))
    .filter((user): user is InspectionUserOption => Boolean(user))
  if (!Number.isFinite(deviceId) || !device || selectedInspectors.length !== draftInspectorUserIds.value.length) {
    ElMessage.warning("设备或巡检人信息无效，请重新选择")
    return
  }

  saving.value = true
  try {
    const res = await saveInspectionBaseInfoApi({
      id: formData.id ? Number(formData.id) : undefined,
      device_id: deviceId,
      device_type: formData.device_type,
      device_name: device.hostName,
      device_sn: device.sn,
      inspector: selectedInspectors.map((item) => item.name).join("、"),
      inspectors: selectedInspectors.map((item) => ({
        id: item.id,
        name: item.name,
        department: item.department_name
      })),
      status: formData.status,
      assistant_equipment_type: getAssistantEquipmentType(formData.device_type),
      items: draftItems.value.map((item, index) => {
        const itemId = Number(item.id)
        return {
          item_id: item.id && Number.isFinite(itemId) ? itemId : undefined,
          sort_no: index + 1,
          content: item.content.trim(),
          result_type: item.resultType,
          require_photo: Boolean(item.requirePhoto)
        }
      })
    })

    const savedId = Number(res.data.id)
    formData.id = String(savedId)
    formData.inspection_no = res.data.inspection_no
    formData.device_id = String(res.data.device_id)
    formData.device_type = res.data.device_type
    formData.device_name = res.data.device_name
    formData.device_sn = res.data.device_sn
    formData.inspector = res.data.inspector
    formData.assistant_inspector_user_id = res.data.assistant_inspector_user_id
    formData.inspector_name = res.data.inspector_name
    formData.inspector_department = res.data.inspector_department
    formData.inspectors = res.data.inspectors.map((item) => ({ ...item }))
    formData.items = res.data.items.map((item) => ({
      id: String(item.id),
      clientKey: `inspection-item-${item.id}`,
      sortNo: item.sort_no,
      content: item.content,
      resultType: normalizeResultType(item.result_type),
      requirePhoto: Boolean(item.require_photo)
    }))
    await router.replace({ path: route.path, query: { ...route.query, id: String(savedId) } })
    dialogSnapshot.value = serializeDraftState()
    dialogVisible.value = false

    if (res.data.assistantSync?.success === true) {
      ElMessage.success(`保存成功，已推送 ${res.data.assistantSync.synced} 条巡检内容`)
    } else {
      const synced = res.data.assistantSync?.synced || 0
      const failed = res.data.assistantSync?.failed || 0
      ElMessage.warning(res.data.assistantSync?.message || `保存成功；推送成功 ${synced} 条，失败 ${failed} 条`)
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.response?.data?.msg || "保存巡检内容失败")
  } finally {
    saving.value = false
  }
}

async function confirmDiscardDraft() {
  if (!isDialogDirty()) return true
  try {
    await ElMessageBox.confirm("当前巡检内容尚未保存，确定关闭吗？", "提示", {
      type: "warning",
      confirmButtonText: "确定关闭",
      cancelButtonText: "继续编辑"
    })
    return true
  } catch {
    return false
  }
}

async function requestCloseDialog() {
  if (saving.value) return
  if (await confirmDiscardDraft()) dialogVisible.value = false
}

async function handleDialogBeforeClose(done: () => void) {
  if (saving.value) return
  if (await confirmDiscardDraft()) done()
}

function handleClose() {
  router.push("/inspectionmanage/config")
}
</script>

<style scoped lang="scss">
.search-wrapper {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.editor-title {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 700;
}

.editor-subtitle {
  margin-top: 5px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.inspection-form {
  margin-bottom: 4px;

  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

.device-option-sn {
  float: right;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.selected-device-text {
  display: inline-flex;
  max-width: 100%;
  min-height: 32px;
  align-items: center;
  color: var(--el-text-color-regular);
}

.toolbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-title,
.dialog-section-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 600;
}

.toolbar-subtitle,
.dialog-section-subtitle {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.table-wrapper {
  margin-bottom: 8px;
}

:deep(.inspection-batch-dialog .el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}

.dialog-scroll-area {
  max-height: calc(80vh - 170px);
  overflow-y: auto;
  padding: 0 4px 8px;
}

.device-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.summary-label {
  margin-right: 10px;
  color: var(--el-text-color-secondary);
}

.owner-form {
  margin-top: 20px;

  :deep(.el-select) {
    width: min(440px, 100%);
  }
}

.form-tip {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 14px;
}

.inspection-collapse {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;

  :deep(.el-collapse-item__header) {
    height: auto;
    min-height: 52px;
    padding: 0 16px;
    background: var(--el-fill-color-blank);
  }

  :deep(.el-collapse-item__wrap) {
    background: var(--el-fill-color-lighter);
  }

  :deep(.el-collapse-item__content) {
    padding: 18px 22px 8px;
  }

  &.is-dragging {
    user-select: none;
  }

  :deep(.inspection-drag-ghost) {
    opacity: 0.45;
    background: var(--el-color-primary-light-9);
  }

  :deep(.inspection-drag-chosen .el-collapse-item__header) {
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}

.collapse-title {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding-right: 10px;
}

.sequence-badge {
  display: inline-flex;
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 600;
}

.collapse-summary {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;

  &.placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.sort-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
}

.drag-sort-handle {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 4px;
  padding: 0 7px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--el-color-primary);
  cursor: grab;
  font: inherit;
  font-size: 13px;

  &:hover:not(:disabled) {
    background: var(--el-color-primary-light-9);
  }

  &:active:not(:disabled) {
    cursor: grabbing;
  }

  &:disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
  }
}

.item-form {
  max-width: 820px;
}

@media (max-width: 900px) {
  .device-summary {
    grid-template-columns: 1fr;
  }

  .collapse-title {
    flex-wrap: wrap;
    padding: 8px 10px 8px 0;
  }

  .sort-actions {
    width: 100%;
    padding-left: 38px;
  }
}
</style>
