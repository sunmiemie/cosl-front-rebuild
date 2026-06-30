<template>
  <div class="app-container work-order-schedule-page">
    <el-card shadow="never" class="schedule-card">
      <el-tabs v-model="activeEquipment" @tab-change="handleEquipmentChange">
        <el-tab-pane v-for="item in equipmentTabs" :key="item.key" :label="item.label" :name="item.key">
          <div class="state-switcher">
            <button
              v-for="state in scheduleStateTabs"
              :key="state.key"
              class="state-btn"
              :class="{ active: activeScheduleState === state.key }"
              type="button"
              @click="activeScheduleState = state.key"
            >
              <span>{{ state.label }}</span>
              <strong>{{ stateCounts[state.key] }}</strong>
            </button>
          </div>

          <div v-if="secondaryDeviceTabs.length" class="sub-device-tabs">
            <button
              v-for="deviceTab in secondaryDeviceTabs"
              :key="deviceTab.key"
              class="sub-device-tab"
              :class="{ active: activeDeviceTab === deviceTab.key }"
              type="button"
              @click="activeDeviceTab = deviceTab.key"
            >
              {{ deviceTab.label }}
            </button>
          </div>

          <div v-loading="loading" class="schedule-layout">
            <aside class="order-panel">
              <div class="order-panel__header">
                <div>
                  <div class="panel-title">{{ activeStateMeta.panelTitle }}</div>
                  <div class="panel-subtitle">{{ activeStateMeta.panelSubtitle }}</div>
                </div>
                <el-tag type="info" effect="plain">{{ filteredOrders.length }} 条</el-tag>
              </div>

              <el-form :model="searchForm" class="order-filter" label-width="0">
                <el-form-item>
                  <el-input
                    v-model="searchForm.keyword"
                    clearable
                    placeholder="工单号 / 申请人 / 设备"
                    @keyup.enter="handleRefreshClick"
                  />
                </el-form-item>
                <el-button type="primary" @click="handleRefreshClick">查询</el-button>
              </el-form>

              <el-scrollbar class="order-scrollbar">
                <div v-if="filteredOrders.length" class="order-list">
                  <div
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="order-card"
                    :class="{ 'is-active': selectedOrderId === order.id, 'is-scheduled': isScheduled(order) }"
                    role="button"
                    tabindex="0"
                    @click="selectedOrderId = order.id"
                    @keydown.enter.prevent="selectedOrderId = order.id"
                    @keydown.space.prevent="selectedOrderId = order.id"
                  >
                    <div class="order-card__top">
                      <span class="order-card__number">{{ order.taskNumber }}</span>
                      <el-tag :type="getOrderTagType(order)" size="small" effect="light">{{
                        getOrderStatusText(order)
                      }}</el-tag>
                    </div>
                    <div class="order-card__title">{{ order.title }}</div>
                    <div class="order-card__meta">
                      <el-tag size="small" effect="plain">{{ order.targetName }}</el-tag>
                      <el-tag v-if="order.hostDeviceName" size="small" type="primary" effect="plain">
                        {{ order.hostDeviceName }}
                      </el-tag>
                      <el-tag size="small" effect="plain">{{ order.durationHours }}h</el-tag>
                      <el-tag v-if="order.applicant" size="small" effect="plain">{{ order.applicant }}</el-tag>
                    </div>
                    <div class="order-card__actions">
                      <template v-if="activeScheduleState === 'unpublished'">
                        <el-button
                          size="small"
                          type="primary"
                          :loading="publishingId === order.id"
                          @click.stop="handlePublishOrder(order)"
                        >
                          发布
                        </el-button>
                      </template>
                      <template v-else-if="activeScheduleState === 'scheduled'">
                        <el-button size="small" type="primary" @click.stop="openScheduleDialog(order)">调整</el-button>
                        <el-button size="small" @click.stop="handleClearSchedule(order)">清除</el-button>
                      </template>
                      <template v-else>
                        <el-button size="small" type="primary" @click.stop="openScheduleDialog(order)">排程</el-button>
                      </template>
                      <el-button size="small" @click.stop="openDetailDialog(order)">详情</el-button>
                    </div>
                  </div>
                </div>
                <el-empty v-else :description="activeStateMeta.emptyText" />
              </el-scrollbar>
            </aside>

            <section v-if="activeEquipment === 'circuit-board-module'" class="priority-panel">
              <div class="priority-header">
                <div>
                  <div class="priority-title">{{ priorityTitle }}</div>
                  <div class="priority-subtitle">使用上移、下移调整优先级；移除只影响当前顺序视图</div>
                </div>
                <el-button size="small" plain @click="handleRefreshClick">刷新</el-button>
              </div>

              <el-scrollbar class="priority-scrollbar">
                <div v-if="priorityOrders.length" class="priority-list">
                  <div v-for="(order, index) in priorityOrders" :key="order.id" class="priority-item">
                    <span class="drag-handle" title="顺序项">⠿</span>
                    <span class="priority-num">{{ index + 1 }}.</span>
                    <div class="priority-main">
                      <div class="priority-name" :title="order.title">{{ order.title }}</div>
                      <div class="priority-meta">
                        <span>{{ order.taskNumber }}</span>
                        <span>{{ order.targetName }}</span>
                        <span v-if="order.hostDeviceName">{{ order.hostDeviceName }}</span>
                      </div>
                    </div>
                    <el-tag :type="getOrderTagType(order)" size="small" effect="light">{{
                      getOrderStatusText(order)
                    }}</el-tag>
                    <div class="priority-actions">
                      <el-button size="small" :disabled="index === 0" @click="movePriorityOrder(order, -1)"
                        >上移</el-button
                      >
                      <el-button
                        size="small"
                        :disabled="index === priorityOrders.length - 1"
                        @click="movePriorityOrder(order, 1)"
                      >
                        下移
                      </el-button>
                      <el-button size="small" type="danger" plain @click="removePriorityOrder(order)">移除</el-button>
                    </div>
                  </div>
                </div>
                <el-empty v-else description="暂无排期顺序数据" />
              </el-scrollbar>
            </section>

            <section v-else class="calendar-panel">
              <div class="calendar-toolbar">
                <div class="week-switcher">
                  <el-button @click="moveWeek(-1)">上一周</el-button>
                  <el-date-picker
                    v-model="pickedDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="选择日期"
                    @change="handlePickedDateChange"
                  />
                  <strong class="week-label">{{ weekLabel }}</strong>
                  <el-button @click="moveWeek(1)">下一周</el-button>
                </div>
                <div class="calendar-toolbar__right">
                  <div class="sync-status">
                    <span class="sync-status__dot" />
                    与测试端日历使用同一后端排程数据
                  </div>
                  <el-button class="toolbar-refresh" type="success" plain @click="handleRefreshClick">
                    读取本周排程
                  </el-button>
                </div>
              </div>

              <div class="calendar-grid">
                <div class="calendar-head">
                  <div class="calendar-head__time" />
                  <div
                    v-for="day in weekDays"
                    :key="day.dateStr"
                    class="calendar-head__day"
                    :class="{ 'is-today': day.isToday }"
                  >
                    <div>{{ day.weekday }}</div>
                    <strong>{{ day.label }}</strong>
                  </div>
                </div>

                <div class="calendar-body" :style="{ height: `${calendarBodyHeight}px` }">
                  <div class="time-axis">
                    <div
                      v-for="(slot, index) in timeSlots"
                      :key="slot"
                      class="time-axis__slot"
                      :style="{ top: `${index * slotHeight}px` }"
                    >
                      {{ slot }}
                    </div>
                  </div>
                  <div
                    v-for="day in weekDays"
                    :key="day.dateStr"
                    class="day-column"
                    :class="{ 'is-today': day.isToday }"
                  >
                    <div v-for="slot in timeCells" :key="`${day.dateStr}-${slot}`" class="time-cell" />
                    <button
                      v-for="event in getEventsForDay(day.dateStr)"
                      :key="event.id"
                      class="calendar-event"
                      :style="getEventStyle(event)"
                      type="button"
                      @click="selectEvent(event)"
                    >
                      <strong>{{ event.title }}</strong>
                      <span>{{ event.timeRange }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="scheduleDialogVisible" title="工单排程" width="760px" :close-on-click-modal="false">
      <el-form :model="scheduleForm" label-width="96px">
        <el-form-item label="工单号">
          <el-input :model-value="selectedScheduleOrder?.taskNumber" disabled />
        </el-form-item>
        <el-form-item label="排程对象">
          <el-input :model-value="selectedScheduleOrder?.targetName" disabled />
        </el-form-item>
        <el-form-item label="排程时间段">
          <div class="schedule-segment-list">
            <div v-for="(segment, index) in scheduleForm.segments" :key="segment.id" class="schedule-segment-row">
              <el-date-picker v-model="segment.date" type="date" value-format="YYYY-MM-DD" />
              <el-time-picker v-model="segment.startTime" format="HH:mm" value-format="HH:mm" />
              <span class="segment-separator">至</span>
              <el-time-picker v-model="segment.endTime" format="HH:mm" value-format="HH:mm" />
              <el-button
                :disabled="scheduleForm.segments.length === 1"
                text
                type="danger"
                @click="removeScheduleSegment(index)"
              >
                删除
              </el-button>
            </div>
            <el-button type="primary" plain @click="addScheduleSegment">添加时间段</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveSchedule">确认排程</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="工单详情" width="680px">
      <el-descriptions v-if="detailOrder" :column="2" border>
        <el-descriptions-item label="工单号">{{ detailOrder.taskNumber }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ getOrderStatusText(detailOrder) }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailOrder.title }}</el-descriptions-item>
        <el-descriptions-item label="设备/对象">{{ detailOrder.targetName }}</el-descriptions-item>
        <el-descriptions-item label="主机设备">{{ detailOrder.hostDeviceName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="预计时长">{{ detailOrder.durationHours }}h</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailOrder.applicant || "-" }}</el-descriptions-item>
        <el-descriptions-item label="排程段">
          <div v-if="detailScheduleSegments.length" class="detail-segments">
            <div v-for="segment in detailScheduleSegments" :key="segment.id">
              {{ segment.date }} {{ segment.startTime }} - {{ segment.endTime }}
            </div>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { getWaterCycleOrderList, publishWaterCycleOrderApi } from "@/api/water-cycle"
import { getVibrationTableOrderList, publishVibrationTableOrder } from "@/api/vibration-table"
import { getHighTemperatureOrderList, publishHighTemperatureOrder } from "@/api/high-temperature"
import { getHighTempPressureOrderList, publishHighTempPressureOrderApi } from "@/api/high-temp-pressure"
import { getSimulatedWellOrderList, publishSimulatedWellOrderApi } from "@/api/simulated-well"
import { getHaltHassOrderList, publishHaltHassOrder } from "@/api/halt-hass"
import {
  getCircuitModuleApplicationList,
  syncCircuitModuleApplicationList,
  type CircuitModuleApplicationRelation
} from "@/api/circuit-module-application"
import { getDeviceInstanceListApi } from "@/api/device-instance"
import { getHostModelDisplayName } from "@/views/devicemanage/device/psi/model-options"
import {
  clearWorkOrderSchedule,
  saveWorkOrderSchedule,
  type WorkOrderScheduleEquipment,
  type WorkOrderSchedulePayload,
  type WorkOrderScheduleSegment
} from "@/api/work-order-schedule"
import {
  getWorkOrderScheduleStatusText,
  getWorkOrderScheduleTagType,
  hasRunningScheduleInstrument,
  isWorkOrderScheduled
} from "./schedule-status"
import {
  buildSecondaryDeviceTabs,
  filteredOrdersByScheduleState,
  hostMatchesModelKeywords,
  matchHostDevicesForOrder,
  movePriorityItem,
  normalizeScheduleListState,
  type HostDeviceCandidate,
  type ScheduleListState
} from "./schedule-helpers"

type EquipmentKey =
  | "high-temp-pressure"
  | "vibration-table"
  | "water-cycle"
  | "simulated-well"
  | "high-temp-box"
  | "halt-hass"
  | "circuit-board-module"

type ScheduleSegment = {
  scheduledStartAt: string
  scheduledEndAt: string
}

type ScheduleFormSegment = {
  id: string
  date: string
  startTime: string
  endTime: string
}

type ScheduleOrder = {
  id: string
  dbId: number | string
  targetId: number | string
  equipment: EquipmentKey
  scheduleEquipment: WorkOrderScheduleEquipment
  taskNumber: string
  title: string
  applicant: string
  targetName: string
  durationHours: number
  status?: number | string
  statusText?: string
  isRunningTarget?: boolean
  hostDeviceName?: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments: ScheduleSegment[]
  raw: any
  relationRows?: CircuitModuleApplicationRelation[]
}

type ScheduleHostDevice = HostDeviceCandidate & {
  id: number | string
  deviceName: string
  model: string
  serialNumber: string
}

type CalendarEvent = {
  id: string
  orderId: string
  title: string
  dateStr: string
  startMinutes: number
  endMinutes: number
  timeRange: string
}

const equipmentTabs: Array<{ key: EquipmentKey; label: string; scheduleEquipment: WorkOrderScheduleEquipment }> = [
  { key: "high-temp-pressure", label: "高温高压井工单", scheduleEquipment: "high-temp-pressure" },
  { key: "halt-hass", label: "HALT-HASS 工单", scheduleEquipment: "halt-hass" },
  { key: "vibration-table", label: "振动台工单", scheduleEquipment: "vibration-table" },
  { key: "water-cycle", label: "水循环工单", scheduleEquipment: "water-cycle" },
  { key: "simulated-well", label: "模拟井工单", scheduleEquipment: "simulated-well" },
  { key: "high-temp-box", label: "高温箱工单", scheduleEquipment: "high-temp-box" },
  { key: "circuit-board-module", label: "电路板模块", scheduleEquipment: "circuit-board-module" }
]

const scheduleStateTabs: Array<{
  key: ScheduleListState
  label: string
  panelTitle: string
  panelSubtitle: string
  emptyText: string
}> = [
  {
    key: "pending",
    label: "待排程",
    panelTitle: "待排程工单",
    panelSubtitle: "已发布，等待安排测试顺序",
    emptyText: "暂无待排程工单"
  },
  {
    key: "scheduled",
    label: "已排程",
    panelTitle: "已排程工单",
    panelSubtitle: "已安排时间段，可调整或清除",
    emptyText: "暂无已排程工单"
  },
  {
    key: "unpublished",
    label: "待发布",
    panelTitle: "待发布工单",
    panelSubtitle: "发布后进入待排程（待领取）",
    emptyText: "暂无待发布工单"
  }
]

const activeEquipment = ref<EquipmentKey>("high-temp-pressure")
const activeScheduleState = ref<ScheduleListState>("pending")
const activeDeviceTab = ref("高温高压井")
const route = useRoute()
const selectedOrderId = ref("")
const loading = ref(false)
const saving = ref(false)
const publishingId = ref("")
const scheduleDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const detailOrder = ref<ScheduleOrder | null>(null)
const scheduleRefreshTimer = ref<number | null>(null)
const applyingRouteQuery = ref(false)
const pickedDate = ref(formatDate(new Date()))
const weekStart = ref(getWeekStart(new Date()))
const searchForm = reactive({ keyword: "" })
const scheduleForm = reactive<{
  orderId: string
  segments: ScheduleFormSegment[]
}>({
  orderId: "",
  segments: []
})

const orderMap = reactive<Record<EquipmentKey, ScheduleOrder[]>>({
  "high-temp-pressure": [],
  "halt-hass": [],
  "vibration-table": [],
  "water-cycle": [],
  "simulated-well": [],
  "high-temp-box": [],
  "circuit-board-module": []
})

const removedPriorityOrderIds = reactive<Record<EquipmentKey, string[]>>({
  "high-temp-pressure": [],
  "halt-hass": [],
  "vibration-table": [],
  "water-cycle": [],
  "simulated-well": [],
  "high-temp-box": [],
  "circuit-board-module": []
})

const hostDevices = ref<ScheduleHostDevice[]>([])
const hostDeviceLoading = ref(false)
let hostDeviceLoadPromise: Promise<void> | null = null
const timeSlots = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`)
const timeCells = Array.from({ length: 16 }, (_, index) => index)
const slotHeight = 38
const calendarStartMinutes = 6 * 60
const calendarEndMinutes = 22 * 60
const calendarBodyHeight = timeCells.length * slotHeight
const PENDING_CLAIM_STATUS = 1
const SCHEDULE_AUTO_REFRESH_MS = 5000
const EQUIPMENT_DEVICE_KEYWORDS: Record<EquipmentKey, string[]> = {
  "high-temp-pressure": ["高温高压井", "高温高压", "高压井"],
  "halt-hass": ["HALT-HASS", "HALT", "HASS"],
  "vibration-table": ["振动台", "冲击台"],
  "water-cycle": ["水循环"],
  "simulated-well": ["模拟井"],
  "high-temp-box": ["高温箱"],
  "circuit-board-module": ["电路板模块", "电路板"]
}

const activeConfig = computed(
  () => equipmentTabs.find((item) => item.key === activeEquipment.value) ?? equipmentTabs[0]
)
const activeOrders = computed(() => orderMap[activeEquipment.value])
const selectedScheduleOrder = computed(() => activeOrders.value.find((item) => item.id === scheduleForm.orderId))
const detailScheduleSegments = computed(() =>
  detailOrder.value ? getExistingScheduleFormSegments(detailOrder.value) : []
)
const activeStateMeta = computed(
  () => scheduleStateTabs.find((item) => item.key === activeScheduleState.value) ?? scheduleStateTabs[0]
)

const stateCounts = computed<Record<ScheduleListState, number>>(() => ({
  pending: filteredOrdersByScheduleState(activeOrders.value, "pending").length,
  scheduled: filteredOrdersByScheduleState(activeOrders.value, "scheduled").length,
  unpublished: filteredOrdersByScheduleState(activeOrders.value, "unpublished").length,
  other: filteredOrdersByScheduleState(activeOrders.value, "other").length
}))

const stateOrders = computed(() => filteredOrdersByScheduleState(activeOrders.value, activeScheduleState.value))

const highTempPressureHostDevices = computed(() =>
  hostDevices.value.filter((host) => hostMatchesModelKeywords(host, EQUIPMENT_DEVICE_KEYWORDS["high-temp-pressure"]))
)

const secondaryDeviceTabs = computed(() => {
  const keywords = EQUIPMENT_DEVICE_KEYWORDS[activeEquipment.value]
  return buildSecondaryDeviceTabs(keywords[0], hostDevices.value, keywords)
})

const filteredOrders = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  if (!keyword) return stateOrders.value
  return stateOrders.value.filter((order) =>
    [order.taskNumber, order.title, order.applicant, order.targetName, order.hostDeviceName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
})

const priorityOrders = computed(() => {
  const removedIds = removedPriorityOrderIds[activeEquipment.value]
  return filteredOrders.value.filter((order) => !removedIds.includes(order.id))
})

const priorityTitle = computed(() =>
  activeEquipment.value === "circuit-board-module" ? "电路板测试排期顺序" : `${activeConfig.value.label}排期顺序`
)

const weekDays = computed(() => {
  const start = parseDate(weekStart.value)
  const today = formatDate(new Date())
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const dateStr = formatDate(date)
    return {
      dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()],
      isToday: dateStr === today
    }
  })
})

const weekLabel = computed(() => {
  const first = weekDays.value[0]
  const last = weekDays.value[6]
  return first && last ? `${first.label.replace("/", "月")}日 ～ ${last.label.replace("/", "月")}日` : ""
})

const calendarEvents = computed<CalendarEvent[]>(() =>
  activeOrders.value.flatMap((order) => {
    const segments = order.scheduleSegments.length
      ? order.scheduleSegments
      : order.scheduledStartAt && order.scheduledEndAt
        ? [{ scheduledStartAt: order.scheduledStartAt, scheduledEndAt: order.scheduledEndAt }]
        : []

    return segments
      .map((segment, index) => {
        const start = parseDateTime(segment.scheduledStartAt)
        const end = parseDateTime(segment.scheduledEndAt)
        if (!start || !end) return null
        const dateStr = formatDate(start)
        if (!weekDays.value.some((day) => day.dateStr === dateStr)) return null
        const startMinutes = start.getHours() * 60 + start.getMinutes()
        const endMinutes = end.getHours() * 60 + end.getMinutes()
        return {
          id: `${order.id}-${index}`,
          orderId: order.id,
          title: order.taskNumber,
          dateStr,
          startMinutes,
          endMinutes,
          timeRange: `${formatHourMinute(start)}-${formatHourMinute(end)}`
        }
      })
      .filter((event): event is CalendarEvent => event !== null)
  })
)

watch(activeScheduleState, () => {
  selectedOrderId.value = ""
})

watch(secondaryDeviceTabs, (tabs) => {
  if (!tabs.some((tab) => tab.key === activeDeviceTab.value)) {
    activeDeviceTab.value = tabs[0]?.key || ""
  }
})

watch(
  () => route.query,
  (query) => {
    if (applyingRouteQuery.value) return
    if (applyRouteQuery(query)) void loadOrders()
  }
)

function isEquipmentKey(value: unknown): value is EquipmentKey {
  return typeof value === "string" && equipmentTabs.some((item) => item.key === value)
}

function isScheduleState(value: unknown): value is ScheduleListState {
  return value === "pending" || value === "scheduled" || value === "unpublished"
}

function applyRouteQuery(query: typeof route.query) {
  let changed = false
  const tab = Array.isArray(query.tab) ? query.tab[0] : query.tab
  const keyword = Array.isArray(query.keyword) ? query.keyword[0] : query.keyword
  const state = Array.isArray(query.state) ? query.state[0] : query.state
  if (isEquipmentKey(tab) && activeEquipment.value !== tab) {
    activeEquipment.value = tab
    changed = true
  }
  if (isScheduleState(state)) activeScheduleState.value = state
  if (typeof keyword === "string") searchForm.keyword = keyword
  return changed
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

function getWeekStart(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  const day = next.getDay()
  next.setDate(next.getDate() + (day === 0 ? -6 : 1 - day))
  return formatDate(next)
}

function parseDateTime(value?: string | null) {
  if (!value) return null
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatHourMinute(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

function toBackendDateTime(date: Date) {
  return `${formatDate(date)} ${formatHourMinute(date)}:00`
}

function createScheduleSegment(date = pickedDate.value, startTime = "09:00", endTime = "11:00"): ScheduleFormSegment {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    startTime,
    endTime
  }
}

function getExistingScheduleFormSegments(order: ScheduleOrder): ScheduleFormSegment[] {
  const segments = order.scheduleSegments.length
    ? order.scheduleSegments
    : order.scheduledStartAt && order.scheduledEndAt
      ? [{ scheduledStartAt: order.scheduledStartAt, scheduledEndAt: order.scheduledEndAt }]
      : []

  if (!segments.length) return []

  return segments.map((segment) => {
    const start = parseDateTime(segment.scheduledStartAt) || new Date()
    const end = parseDateTime(segment.scheduledEndAt) || new Date(start.getTime() + 2 * 60 * 60 * 1000)
    return createScheduleSegment(formatDate(start), formatHourMinute(start), formatHourMinute(end))
  })
}

function buildScheduleFormSegments(order: ScheduleOrder): ScheduleFormSegment[] {
  const segments = getExistingScheduleFormSegments(order)
  return segments.length ? segments : [createScheduleSegment()]
}

function addScheduleSegment() {
  const last = scheduleForm.segments[scheduleForm.segments.length - 1]
  scheduleForm.segments.push(createScheduleSegment(last?.date || pickedDate.value, "09:00", "11:00"))
}

function removeScheduleSegment(index: number) {
  scheduleForm.segments.splice(index, 1)
  if (!scheduleForm.segments.length) scheduleForm.segments.push(createScheduleSegment())
}

function validateScheduleSegments(segments: ScheduleFormSegment[]) {
  const normalized: Array<{ start: Date; end: Date; key: string }> = []
  const seen = new Set<string>()
  for (const segment of segments) {
    if (!segment.date || !segment.startTime || !segment.endTime) {
      ElMessage.warning("请完整填写排程日期和时间")
      return null
    }
    const start = new Date(`${segment.date}T${segment.startTime}:00`)
    const end = new Date(`${segment.date}T${segment.endTime}:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      ElMessage.warning("结束时间必须晚于开始时间")
      return null
    }
    const key = `${segment.date}-${segment.startTime}-${segment.endTime}`
    if (seen.has(key)) {
      ElMessage.warning("存在重复的排程时间段")
      return null
    }
    seen.add(key)
    normalized.push({ start, end, key })
  }
  return normalized.sort((a, b) => a.start.getTime() - b.start.getTime())
}

function buildSchedulePayload(): (WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] }) | null {
  const normalized = validateScheduleSegments(scheduleForm.segments)
  if (!normalized?.length) return null

  const scheduleSegments = normalized.map(({ start, end }) => ({
    scheduled_start_at: toBackendDateTime(start),
    scheduled_end_at: toBackendDateTime(end)
  }))
  const earliestStart = normalized[0].start
  const latestEnd = normalized.reduce(
    (latest, segment) => (segment.end > latest ? segment.end : latest),
    normalized[0].end
  )

  return {
    scheduled_start_at: toBackendDateTime(earliestStart),
    scheduled_end_at: toBackendDateTime(latestEnd),
    schedule_segments: scheduleSegments
  }
}

function getString(...values: unknown[]) {
  return values.find((value) => typeof value === "string" && value.trim()) as string | undefined
}

function getNumber(value: unknown, fallback = 2) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback
}

function defaultStatusText(status: unknown, scheduledStartAt?: string | null, scheduledEndAt?: string | null) {
  if (String(status ?? "") === "0") return "待发布"
  if (scheduledStartAt && scheduledEndAt) return "已排程"
  return "待领取"
}

function isCircuitModuleScheduleStatus(status: unknown) {
  const text = String(status ?? "")
    .trim()
    .toLowerCase()
  return [
    "1",
    "linked",
    "published",
    "ready",
    "scheduled",
    "scheduling",
    "arranged",
    "已发布",
    "待排期",
    "已排程",
    "排期中"
  ].includes(text)
}

function normalizeSnakeSegments(value: any): ScheduleSegment[] {
  return Array.isArray(value)
    ? value
        .map((item) => {
          const scheduledStartAt = item?.scheduled_start_at || ""
          const scheduledEndAt = item?.scheduled_end_at || ""
          if (!scheduledStartAt || !scheduledEndAt) return null
          return { scheduledStartAt, scheduledEndAt }
        })
        .filter((item): item is ScheduleSegment => item !== null)
    : []
}

function normalizeCamelSegments(value: any): ScheduleSegment[] {
  return Array.isArray(value)
    ? value
        .map((item) => {
          const scheduledStartAt = item?.scheduledStartAt || ""
          const scheduledEndAt = item?.scheduledEndAt || ""
          if (!scheduledStartAt || !scheduledEndAt) return null
          return { scheduledStartAt, scheduledEndAt }
        })
        .filter((item): item is ScheduleSegment => item !== null)
    : []
}

function getOrderStatusText(order: ScheduleOrder) {
  const state = normalizeScheduleListState(order)
  if (state === "unpublished") return "待发布"
  return getWorkOrderScheduleStatusText(order)
}

function getOrderTagType(order: ScheduleOrder) {
  const state = normalizeScheduleListState(order)
  if (state === "unpublished") return "info"
  return getWorkOrderScheduleTagType(order)
}

function isScheduled(order: ScheduleOrder) {
  return isWorkOrderScheduled(order)
}

type LoadOrdersOptions = {
  silent?: boolean
}

async function loadOrders(options: LoadOrdersOptions = {}) {
  const equipment = activeEquipment.value
  if (!options.silent) loading.value = true
  try {
    const list = await fetchOrders(equipment)
    const orders = normalizeOrders(equipment, list)
    orderMap[equipment] = orders
    if (equipment === activeEquipment.value) {
      selectedOrderId.value = orders.some((order) => order.id === selectedOrderId.value)
        ? selectedOrderId.value
        : orders[0]?.id || ""
    }
  } finally {
    if (!options.silent) loading.value = false
  }
}

async function fetchOrders(equipment: EquipmentKey) {
  const params = { page: 1, pageSize: 200 }
  const hostDevicesPromise = loadHostDevices().catch(() => undefined)
  if (equipment === "high-temp-pressure") {
    const [res] = await Promise.all([getHighTempPressureOrderList({ ...params } as any), hostDevicesPromise])
    return res.data?.list || []
  }
  if (equipment === "vibration-table") {
    const [res] = await Promise.all([getVibrationTableOrderList(params), hostDevicesPromise])
    return res.data?.list || []
  }
  if (equipment === "water-cycle") {
    const [res] = await Promise.all([getWaterCycleOrderList(params), hostDevicesPromise])
    return res.data?.list || []
  }
  if (equipment === "simulated-well") {
    const [res] = await Promise.all([
      getSimulatedWellOrderList({ ...params, includeDevices: true } as any),
      hostDevicesPromise
    ])
    return res.data?.list || []
  }
  if (equipment === "halt-hass") {
    const [res] = await Promise.all([getHaltHassOrderList({ ...params }), hostDevicesPromise])
    return res.data?.list || []
  }
  if (equipment === "circuit-board-module") {
    const [res] = await Promise.all([getCircuitModuleApplicationList(), hostDevicesPromise])
    return res.data?.list || []
  }
  const [res] = await Promise.all([getHighTemperatureOrderList(params), hostDevicesPromise])
  return res.data?.list || []
}

async function loadHostDevices() {
  if (hostDevices.value.length) return
  if (hostDeviceLoadPromise) return hostDeviceLoadPromise
  hostDeviceLoading.value = true
  hostDeviceLoadPromise = (async () => {
    try {
      const res = await getDeviceInstanceListApi({ currentPage: 1, size: 2000 })
      hostDevices.value = extractDeviceList(res)
        .map(normalizeHostDevice)
        .filter((item) => item.deviceName || item.model)
    } finally {
      hostDeviceLoading.value = false
      hostDeviceLoadPromise = null
    }
  })()
  return hostDeviceLoadPromise
}

function extractDeviceList(response: any) {
  const payload = response?.data ?? response ?? {}
  const list = Array.isArray(payload)
    ? payload
    : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []
  return Array.isArray(list) ? list : []
}

function normalizeHostDevice(row: any): ScheduleHostDevice {
  return {
    id: row.id ?? row.psi_id ?? row.device_id ?? row.deviceId ?? row.serialNumber ?? row.psi_serialnumber ?? "",
    deviceName: getString(row.deviceName, row.device_name, row.psi_name) || "",
    model: getHostModelDisplayName(row) || "",
    modelId: getString(row.modelId, row.model_id, row.psimodelId, row.psimodel_id) || "",
    serialNumber: getString(row.serialNumber, row.serial_number, row.psi_serialnumber) || ""
  }
}

function normalizeOrders(equipment: EquipmentKey, list: any[]): ScheduleOrder[] {
  if (equipment === "high-temp-pressure") return normalizeHighTempPressureOrders(list)
  if (equipment === "halt-hass") return normalizeHaltHassOrders(list)
  if (equipment === "circuit-board-module") return normalizeCircuitBoardModuleOrders(list)
  if (equipment === "simulated-well") return normalizeSimulatedWellOrders(list)
  if (equipment === "vibration-table") return normalizeVibrationOrders(list)
  if (equipment === "water-cycle") return normalizeWaterCycleOrders(list)
  return normalizeHighTempBoxOrders(list)
}

function normalizeWaterCycleOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => ({
    id: `water-cycle-${item.id}`,
    dbId: item.id,
    targetId: item.id,
    equipment: "water-cycle",
    scheduleEquipment: "water-cycle",
    taskNumber: getString(item.task_number, item.table_no) || `水循环-${item.id}`,
    title: getString(item.project_name, item.test_type, item.flow_process) || "水循环工单",
    applicant: getString(item.applicant) || "",
    targetName: getString(item.device_name, item.test_platform) || "水循环设备",
    durationHours: 2,
    status: item.status,
    statusText: item.status_text || defaultStatusText(item.status, item.scheduled_start_at, item.scheduled_end_at),
    isRunningTarget: hasRunningScheduleInstrument(item.instruments),
    scheduledStartAt: item.scheduled_start_at || null,
    scheduledEndAt: item.scheduled_end_at || null,
    scheduleSegments: normalizeSnakeSegments(item.schedule_segments),
    raw: item
  }))
}

function normalizeVibrationOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => ({
    id: `vibration-${item.id}`,
    dbId: item.id,
    targetId: item.id,
    equipment: "vibration-table",
    scheduleEquipment: "vibration-table",
    taskNumber: getString(item.taskNumber, item.tableNo) || `振动台-${item.id}`,
    title: getString(item.projectName, item.testPurpose, item.testType) || "振动台工单",
    applicant: getString(item.applicant) || "",
    targetName: getString(item.tableNo, item.deviceName) || "振动台",
    durationHours: getNumber(item.duration, 2),
    status: item.status,
    statusText: item.statusText || defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
    isRunningTarget: hasRunningScheduleInstrument(item.instruments),
    scheduledStartAt: item.scheduledStartAt || null,
    scheduledEndAt: item.scheduledEndAt || null,
    scheduleSegments: normalizeCamelSegments(item.scheduleSegments),
    raw: item
  }))
}

function normalizeHighTempBoxOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => ({
    id: `high-temp-box-${item.id}`,
    dbId: item.id,
    targetId: item.id,
    equipment: "high-temp-box",
    scheduleEquipment: "high-temp-box",
    taskNumber: getString(item.taskNumber) || `高温箱-${item.id}`,
    title: getString(item.projectName, item.specification) || "高温箱工单",
    applicant: getString(item.applicant) || "",
    targetName: getString(item.deviceName) || "高温箱",
    durationHours: getNumber(item.holdTime, 2),
    status: item.status,
    statusText: item.statusText || defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
    isRunningTarget: hasRunningScheduleInstrument(item.instruments),
    scheduledStartAt: item.scheduledStartAt || null,
    scheduledEndAt: item.scheduledEndAt || null,
    scheduleSegments: normalizeSnakeSegments(item.schedule_segments || item.scheduleSegments),
    raw: item
  }))
}

function normalizeHaltHassOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => ({
    id: `halt-hass-${item.id}`,
    dbId: item.id,
    targetId: item.id,
    equipment: "halt-hass",
    scheduleEquipment: "halt-hass",
    taskNumber: getString(item.orderNo, item.order_no) || `HALT-HASS-${item.id}`,
    title:
      getString(item.process?.name, item.processName, item.boardGroup?.name, item.boardGroupName) || "HALT-HASS 工单",
    applicant: getString(item.creatorName, item.operatorName) || "",
    targetName:
      getString(item.boardGroup?.name, item.boardGroupName, item.process?.name, item.processName) || "HALT-HASS",
    durationHours: getNumber(item.duration, 2),
    status: item.status,
    statusText: item.statusText || defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
    isRunningTarget: Number(item.status) === 2,
    scheduledStartAt: item.scheduledStartAt || item.scheduled_start_at || null,
    scheduledEndAt: item.scheduledEndAt || item.scheduled_end_at || null,
    scheduleSegments: normalizeCamelSegments(item.scheduleSegments).length
      ? normalizeCamelSegments(item.scheduleSegments)
      : normalizeSnakeSegments(item.schedule_segments),
    raw: item
  }))
}

function normalizeCircuitStatusValue(status: unknown) {
  if (isCircuitModuleScheduleStatus(status)) return PENDING_CLAIM_STATUS
  const numberValue = Number(status)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function normalizeCircuitBoardModuleOrders(list: CircuitModuleApplicationRelation[]): ScheduleOrder[] {
  return normalizeCircuitBoardModuleOrderRows(list)
}

function normalizeCircuitBoardModuleOrderRows(list: CircuitModuleApplicationRelation[]): ScheduleOrder[] {
  return normalizeCircuitBoardModuleOrdersForRows(list)
}

function normalizeCircuitBoardModuleOrdersForRows(list: CircuitModuleApplicationRelation[]): ScheduleOrder[] {
  return list.map((item, index) => {
    const snakeSegments = normalizeSnakeSegments(item.scheduleSegments || (item as any).schedule_segments)
    const scheduleSegments = snakeSegments.length
      ? snakeSegments
      : normalizeCamelSegments((item as any).scheduleSegments)
    const scheduledStartAt =
      getString(item.scheduledStartAt, (item as any).scheduled_start_at, scheduleSegments[0]?.scheduledStartAt) || null
    const scheduledEndAt =
      getString(item.scheduledEndAt, (item as any).scheduled_end_at, scheduleSegments[0]?.scheduledEndAt) || null
    const orderNo = getString(item.orderNo, item.commissionNo, item.sn) || `CBM-${item.id || index + 1}`
    const boards = Array.isArray(item.boards) ? item.boards : []
    const title =
      getString(item.moduleName, item.sampleName, item.specModel, `${orderNo} 电路板模块`) || `${orderNo} 电路板模块`
    const deviceName = getString(item.device, item.specModel, "电路板模块") || "电路板模块"
    const status = normalizeCircuitStatusValue(item.status)
    return {
      id: `circuit-board-module-${orderNo}`,
      dbId: item.id ?? orderNo,
      targetId: item.id ?? orderNo,
      equipment: "circuit-board-module" as const,
      scheduleEquipment: "circuit-board-module" as const,
      taskNumber: orderNo,
      title,
      applicant: getString(item.applicant, item.inspector) || "",
      targetName: `${deviceName} / ${boards.length || item.quantity || 1}块`,
      durationHours: getNumber(item.hours, 2),
      status,
      statusText: item.statusText || defaultStatusText(status, scheduledStartAt, scheduledEndAt),
      scheduledStartAt,
      scheduledEndAt,
      scheduleSegments,
      raw: item,
      relationRows: [item]
    }
  })
}

function normalizeHighTempPressureOrders(list: any[]): ScheduleOrder[] {
  return list.flatMap((order) => {
    const instruments = Array.isArray(order.instruments) && order.instruments.length ? order.instruments : [null]
    const fallbackHost = findHighTempPressureOrderHost(order)

    return instruments.map((instrument: any, index: number) =>
      buildHighTempPressureOrder(order, instrument, index, findInstrumentHost(instrument) || fallbackHost)
    )
  })
}

function findInstrumentHost(instrument: any) {
  const matchedHosts = matchHostDevicesForOrder(
    {
      instrument_name: instrument?.instrument_name,
      instrument_sn: instrument?.instrument_sn
    },
    highTempPressureHostDevices.value,
    { includeModel: false }
  )
  return matchedHosts.length === 1 ? matchedHosts[0] : undefined
}

function findHighTempPressureOrderHost(order: any) {
  const matchedHosts = matchHostDevicesForOrder(
    {
      device_name: order.device_name,
      device_number: order.device_number,
      use_device: order.use_device,
      equipment_list: order.equipment_list,
      instrument_combination: order.instrument_combination,
      instrument_names: order.instrument_names,
      instrument_sns: order.instrument_sns
    },
    highTempPressureHostDevices.value,
    { includeModel: false }
  )
  return matchedHosts.length === 1 ? matchedHosts[0] : undefined
}

function buildHighTempPressureOrder(
  order: any,
  instrument: any,
  index: number,
  host?: HostDeviceCandidate
): ScheduleOrder {
  const targetId = Number(instrument?.id ?? order.id)
  const hostDeviceName = getString(host?.deviceName)
  const targetName =
    hostDeviceName ||
    getString(instrument?.instrument_name, instrument?.instrument_sn, order.device_name) ||
    "高温高压井仪器"
  return {
    id: `high-temp-pressure-${order.id}-${targetId}-${host?.id ?? index}`,
    dbId: order.id,
    targetId,
    equipment: "high-temp-pressure" as const,
    scheduleEquipment: "high-temp-pressure" as const,
    taskNumber: getString(order.task_number, order.table_no) || `高温高压井-${order.id}`,
    title: getString(order.project_name, order.test_type) || "高温高压井工单",
    applicant: getString(order.applicant) || "",
    targetName,
    hostDeviceName,
    durationHours: getNumber(order.hold_time, 2),
    status: order.status,
    statusText:
      order.status_text ||
      defaultStatusText(
        order.status,
        instrument?.scheduled_start_at,
        instrument?.scheduled_end_at
      ),
    isRunningTarget: hasRunningScheduleInstrument([instrument]),
    scheduledStartAt: instrument?.scheduled_start_at || null,
    scheduledEndAt: instrument?.scheduled_end_at || null,
    scheduleSegments: normalizeSnakeSegments(instrument?.schedule_segments),
    raw: { order, instrument, host }
  }
}

function normalizeSimulatedWellOrders(list: any[]): ScheduleOrder[] {
  return list.flatMap((order) => {
    const devices = Array.isArray(order.devices) && order.devices.length ? order.devices : [null]
    return devices.map((device: any, index: number) => {
      const targetId = Number(device?.id ?? order.id)
      return {
        id: `simulated-well-${order.id}-${targetId}-${index}`,
        dbId: order.id,
        targetId,
        equipment: "simulated-well" as const,
        scheduleEquipment: "simulated-well" as const,
        taskNumber: getString(order.task_number, order.table_number) || `模拟井-${order.id}`,
        title: getString(order.project_name, order.test_purpose, order.task_desc) || "模拟井工单",
        applicant: getString(order.applicant) || "",
        targetName: getString(device?.device_name, device?.device_number, order.tested_instrument) || "模拟井设备",
        durationHours: 2,
        status: order.status,
        statusText:
          order.status_text || defaultStatusText(order.status, device?.scheduled_start_at, device?.scheduled_end_at),
        isRunningTarget: false,
        scheduledStartAt: device?.scheduled_start_at || null,
        scheduledEndAt: device?.scheduled_end_at || null,
        scheduleSegments: normalizeSnakeSegments(device?.schedule_segments || device?.scheduleSegments),
        raw: { order, device }
      }
    })
  })
}

function handleEquipmentChange() {
  selectedOrderId.value = ""
  activeDeviceTab.value = EQUIPMENT_DEVICE_KEYWORDS[activeEquipment.value][0]
  void loadOrders()
}

function handleRefreshClick() {
  void loadOrders()
}

function startScheduleAutoRefresh() {
  stopScheduleAutoRefresh()
  scheduleRefreshTimer.value = window.setInterval(() => {
    if (scheduleDialogVisible.value || saving.value || publishingId.value) return
    void loadOrders({ silent: true }).catch(() => undefined)
  }, SCHEDULE_AUTO_REFRESH_MS)
}

function stopScheduleAutoRefresh() {
  if (!scheduleRefreshTimer.value) return
  window.clearInterval(scheduleRefreshTimer.value)
  scheduleRefreshTimer.value = null
}

function moveWeek(offset: number) {
  const date = parseDate(weekStart.value)
  date.setDate(date.getDate() + offset * 7)
  weekStart.value = formatDate(date)
  pickedDate.value = weekStart.value
}

function handlePickedDateChange(value: string) {
  if (!value) return
  weekStart.value = getWeekStart(parseDate(value))
}

function syncCalendarToSchedule(date: Date) {
  weekStart.value = getWeekStart(date)
  pickedDate.value = formatDate(date)
}

function getEventsForDay(dateStr: string) {
  return calendarEvents.value.filter((event) => event.dateStr === dateStr)
}

function getEventStyle(event: CalendarEvent) {
  const start = Math.max(calendarStartMinutes, event.startMinutes)
  const end = Math.min(calendarEndMinutes, event.endMinutes)
  const top = ((start - calendarStartMinutes) / 60) * slotHeight
  const height = Math.max(32, ((end - start) / 60) * slotHeight)
  return {
    top: `${top}px`,
    height: `${height}px`
  }
}

function selectEvent(event: CalendarEvent) {
  selectedOrderId.value = event.orderId
}

function getScheduleTargetId(order: ScheduleOrder) {
  const targetId = Number(order.targetId)
  return Number.isFinite(targetId) ? targetId : null
}

function requireScheduleTargetId(order: ScheduleOrder) {
  const targetId = getScheduleTargetId(order)
  if (targetId === null) {
    ElMessage.warning("当前工单缺少后端排程 ID，请刷新列表后再排程")
  }
  return targetId
}

function openScheduleDialog(order: ScheduleOrder) {
  if (requireScheduleTargetId(order) === null) return
  scheduleForm.orderId = order.id
  scheduleForm.segments = buildScheduleFormSegments(order)
  scheduleDialogVisible.value = true
}

function openDetailDialog(order: ScheduleOrder) {
  detailOrder.value = order
  detailDialogVisible.value = true
}

async function syncCircuitBoardModuleSchedule(order: ScheduleOrder, payload: WorkOrderSchedulePayload) {
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) return false
  await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
  return true
}

async function handleSaveSchedule() {
  const order = selectedScheduleOrder.value
  if (!order) return
  const payload = buildSchedulePayload()
  if (!payload) return

  saving.value = true
  try {
    if (order.scheduleEquipment === "circuit-board-module") {
      const saved = await syncCircuitBoardModuleSchedule(order, payload)
      if (!saved) return
    } else {
      const targetId = requireScheduleTargetId(order)
      if (targetId === null) return
      await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
    }

    order.scheduledStartAt = payload.scheduled_start_at
    order.scheduledEndAt = payload.scheduled_end_at
    order.scheduleSegments = payload.schedule_segments.map((segment) => ({
      scheduledStartAt: segment.scheduled_start_at,
      scheduledEndAt: segment.scheduled_end_at
    }))
    order.status = PENDING_CLAIM_STATUS
    order.statusText = "已排程"
    syncCalendarToSchedule(parseDateTime(payload.scheduled_start_at) || new Date())
    scheduleDialogVisible.value = false
    activeScheduleState.value = "scheduled"
    ElMessage.success("排程已保存")
  } catch (error) {
    ElMessage.error("排程保存失败")
  } finally {
    saving.value = false
  }
}

async function handleClearSchedule(order: ScheduleOrder) {
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) return
  await ElMessageBox.confirm("确定要清除该工单排程吗？", "清除排程", {
    type: "warning"
  })
  await clearWorkOrderSchedule(order.scheduleEquipment, targetId)
  order.scheduledStartAt = null
  order.scheduledEndAt = null
  order.scheduleSegments = []
  order.status = PENDING_CLAIM_STATUS
  order.statusText = "待领取"
  activeScheduleState.value = "pending"
  ElMessage.success("排程已清除")
}

async function handlePublishOrder(order: ScheduleOrder) {
  publishingId.value = order.id
  try {
    await publishScheduleOrder(order)
    order.status = PENDING_CLAIM_STATUS
    order.statusText = "待领取"
    activeScheduleState.value = "pending"
    ElMessage.success("发布成功，工单已进入待排程")
  } catch (error) {
    ElMessage.error("发布失败")
  } finally {
    publishingId.value = ""
  }
}

async function publishScheduleOrder(order: ScheduleOrder) {
  if (order.equipment === "water-cycle") return publishWaterCycleOrderApi(Number(order.dbId))
  if (order.equipment === "high-temp-box") return publishHighTemperatureOrder(Number(order.dbId))
  if (order.equipment === "vibration-table") return publishVibrationTableOrder(Number(order.dbId))
  if (order.equipment === "high-temp-pressure") return publishHighTempPressureOrderApi(Number(order.dbId))
  if (order.equipment === "simulated-well") return publishSimulatedWellOrderApi(Number(order.dbId))
  if (order.equipment === "halt-hass") return publishHaltHassOrder(Number(order.dbId))
  if (order.equipment === "circuit-board-module") {
    const rows = order.relationRows?.length ? order.relationRows : [order.raw as CircuitModuleApplicationRelation]
    await syncCircuitModuleApplicationList(rows.map((row) => ({ ...row, status: PENDING_CLAIM_STATUS })))
  }
}

function movePriorityOrder(order: ScheduleOrder, direction: -1 | 1) {
  const visibleIds = priorityOrders.value.map((item) => item.id)
  const visibleIndex = visibleIds.indexOf(order.id)
  const movedVisibleIds = movePriorityItem(visibleIds, visibleIndex, direction)
  const allOrders = orderMap[activeEquipment.value]
  const byId = new Map(allOrders.map((item) => [item.id, item]))
  const movedVisibleOrders = movedVisibleIds.map((id) => byId.get(id)).filter(Boolean) as ScheduleOrder[]
  const visibleSet = new Set(visibleIds)
  const nextOrders: ScheduleOrder[] = []
  let movedIndex = 0
  allOrders.forEach((item) => {
    if (visibleSet.has(item.id)) {
      nextOrders.push(movedVisibleOrders[movedIndex++])
    } else {
      nextOrders.push(item)
    }
  })
  orderMap[activeEquipment.value] = nextOrders
}

function removePriorityOrder(order: ScheduleOrder) {
  const ids = removedPriorityOrderIds[activeEquipment.value]
  if (!ids.includes(order.id)) removedPriorityOrderIds[activeEquipment.value] = [...ids, order.id]
  ElMessage.success("已从当前排期顺序移除")
}

onMounted(() => {
  applyingRouteQuery.value = true
  applyRouteQuery(route.query)
  applyingRouteQuery.value = false
  void loadOrders()
  void loadHostDevices()
  startScheduleAutoRefresh()
})

onUnmounted(() => {
  stopScheduleAutoRefresh()
})
</script>

<style lang="scss" scoped>
.work-order-schedule-page {
  height: calc(100vh - 84px);
  overflow: hidden;
}

.schedule-card {
  height: 100%;
  overflow: hidden;

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-tabs) {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
  }

  :deep(.el-tabs__header) {
    order: 0;
    padding: 0 18px;
    margin: 0;
    background: var(--el-bg-color);
  }

  :deep(.el-tabs__content) {
    order: 1;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    display: flex;
    height: 100%;
    min-height: 0;
    flex-direction: column;
  }
}

.state-switcher,
.sub-device-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 18px 0;
}

.state-btn,
.sub-device-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 14px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    background-color 0.15s,
    color 0.15s;

  strong {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 600;
  }

  &:hover,
  &.active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.sub-device-tabs {
  padding-top: 8px;
}

.sub-device-tab {
  min-height: 28px;
  padding: 4px 12px;
  font-size: 12px;
}

.schedule-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 14px;
  flex: 1;
  min-height: 0;
  padding: 14px 18px 18px;
  overflow: hidden;
}

.order-panel,
.priority-panel,
.calendar-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  flex-direction: column;
}

.order-panel__header,
.priority-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.panel-title,
.priority-title {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.panel-subtitle,
.priority-subtitle {
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.order-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.order-scrollbar,
.priority-scrollbar {
  flex: 1;
  min-height: 0;
}

.order-list,
.priority-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.order-card {
  display: block;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s,
    background-color 0.15s;

  &:hover,
  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 6px rgb(37 99 235 / 10%);
  }

  &.is-scheduled {
    border-left: 3px solid var(--el-color-primary);
  }
}

.order-card__top,
.order-card__meta,
.order-card__actions,
.priority-meta,
.priority-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.order-card__top {
  justify-content: space-between;
}

.order-card__number {
  color: var(--el-text-color-secondary);
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
}

.order-card__title {
  margin: 6px 0;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-card__meta {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.order-card__actions {
  margin-top: 10px;
}

.calendar-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 10px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.calendar-toolbar__right {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.sync-status {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 8px;
  color: var(--el-color-success);
  font-size: 13px;
  white-space: nowrap;
}

.sync-status__dot {
  width: 8px;
  height: 8px;
  background: var(--el-color-success);
  border-radius: 50%;
}

.week-switcher {
  display: grid;
  grid-template-columns: 116px minmax(220px, 300px) minmax(180px, 1fr) 116px;
  align-items: center;
  gap: 14px;
  min-width: 0;

  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  :deep(.el-button) {
    width: 100%;
  }
}

.week-label {
  justify-self: center;
  color: var(--el-text-color-primary);
  font-size: 15px;
  text-align: center;
  white-space: nowrap;
}

.toolbar-refresh {
  flex: none;
}

.calendar-grid {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.calendar-head,
.calendar-body {
  display: grid;
  grid-template-columns: 64px repeat(7, minmax(96px, 1fr));
  min-width: 760px;
}

.calendar-head {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.calendar-head__time,
.calendar-head__day {
  min-height: 48px;
  padding: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color-lighter);

  strong {
    display: block;
    margin-top: 4px;
    color: var(--el-text-color-primary);
  }

  &.is-today {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.calendar-body {
  position: relative;
}

.time-axis {
  position: relative;
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color-lighter);
}

.time-axis__slot {
  position: absolute;
  right: 0;
  left: 0;
  height: 18px;
  padding: 0 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  transform: translateY(-50%);
}

.time-axis__slot:first-child {
  transform: none;
}

.time-axis__slot:last-child {
  transform: translateY(-100%);
}

.day-column {
  position: relative;
  min-width: 0;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);

  &.is-today {
    background: #f7fbff;
  }
}

.time-cell {
  height: 38px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.calendar-event {
  position: absolute;
  right: 6px;
  left: 6px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 28px;
  padding: 6px 8px;
  overflow: hidden;
  color: #fff;
  text-align: left;
  cursor: pointer;
  background: linear-gradient(135deg, var(--el-color-primary), #67b5ff);
  border: 0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(64 158 255 / 20%);

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-size: 11px;
    opacity: 0.92;
  }
}

.priority-header {
  background: var(--el-fill-color-lighter);
}

.priority-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 58px;
  padding: 9px 10px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 4px rgb(59 130 246 / 10%);
  }
}

.drag-handle {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  font-size: 16px;
}

.priority-num {
  min-width: 24px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  font-weight: 700;
}

.priority-main {
  flex: 1;
  min-width: 0;
}

.priority-name {
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-meta {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.detail-segments {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.schedule-segment-list {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.schedule-segment-row {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(110px, 1fr) 24px minmax(110px, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;

  :deep(.el-date-editor.el-input) {
    width: 100%;
    min-width: 0;
  }
}

.segment-separator {
  color: var(--el-text-color-secondary);
  text-align: center;
}

@media (max-width: 1100px) {
  .schedule-layout {
    grid-template-columns: 1fr;
  }

  .order-panel {
    min-height: 360px;
  }
}

@media (max-width: 900px) {
  .schedule-segment-row {
    grid-template-columns: 1fr 1fr;

    .segment-separator {
      display: none;
    }
  }
}

@media (max-width: 768px) {
  .work-order-schedule-page {
    height: auto;
    overflow: visible;
  }

  .schedule-layout {
    min-height: 760px;
  }

  .calendar-toolbar {
    align-items: flex-start;
    grid-template-columns: 1fr;
  }

  .week-switcher {
    grid-template-columns: 1fr;
  }

  .calendar-toolbar__right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}
</style>
