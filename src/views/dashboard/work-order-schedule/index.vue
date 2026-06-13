<template>
  <div class="app-container work-order-schedule-page">
    <el-card shadow="never" class="schedule-card">
      <el-tabs v-model="activeEquipment" @tab-change="handleEquipmentChange">
        <el-tab-pane v-for="item in equipmentTabs" :key="item.key" :label="item.label" :name="item.key">
          <div v-loading="loading" class="schedule-layout">
            <aside class="order-panel">
              <div class="order-panel__header">
                <div>
                  <div class="panel-title">待排程工单</div>
                  <div class="panel-subtitle">未完成工单可在右侧周历中排程</div>
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
                  <button
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="order-card"
                    :class="{ 'is-active': selectedOrderId === order.id, 'is-scheduled': isScheduled(order) }"
                    type="button"
                    @click="selectedOrderId = order.id"
                  >
                    <div class="order-card__top">
                      <span class="order-card__number">{{ order.taskNumber }}</span>
                      <el-tag :type="getOrderTagType(order)" size="small" effect="light">{{ getOrderStatusText(order) }}</el-tag>
                    </div>
                    <div class="order-card__title">{{ order.title }}</div>
                    <div class="order-card__meta">
                      <el-tag size="small" effect="plain">{{ order.targetName }}</el-tag>
                      <el-tag size="small" effect="plain">{{ order.durationHours }}h</el-tag>
                      <el-tag v-if="order.applicant" size="small" effect="plain">{{ order.applicant }}</el-tag>
                    </div>
                    <div class="order-card__actions">
                      <el-button size="small" type="primary" @click.stop="openScheduleDialog(order)">排程</el-button>
                      <el-button size="small" :disabled="!isScheduled(order)" @click.stop="handleClearSchedule(order)">清除</el-button>
                    </div>
                  </button>
                </div>
                <el-empty v-else description="暂无待排程工单" />
              </el-scrollbar>
            </aside>

            <section class="calendar-panel">
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
                  <el-button class="toolbar-refresh" type="success" plain @click="handleRefreshClick">读取本周排程</el-button>
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
                  <div v-for="day in weekDays" :key="day.dateStr" class="day-column" :class="{ 'is-today': day.isToday }">
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

    <el-dialog v-model="scheduleDialogVisible" title="工单排程" width="520px" :close-on-click-modal="false">
      <el-form :model="scheduleForm" label-width="96px">
        <el-form-item label="工单号">
          <el-input :model-value="selectedScheduleOrder?.taskNumber" disabled />
        </el-form-item>
        <el-form-item label="排程对象">
          <el-input :model-value="selectedScheduleOrder?.targetName" disabled />
        </el-form-item>
        <el-form-item label="排程日期">
          <el-date-picker v-model="scheduleForm.date" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-time-picker v-model="scheduleForm.startTime" format="HH:mm" value-format="HH:mm" />
        </el-form-item>
        <el-form-item label="预计时长">
          <el-input-number v-model="scheduleForm.durationHours" :min="0.5" :step="0.5" :max="48" />
          <span class="duration-unit">小时</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveSchedule">确认排程</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { getWaterCycleOrderList } from "@/api/water-cycle"
import { getVibrationTableOrderList } from "@/api/vibration-table"
import { getHighTemperatureOrderList } from "@/api/high-temperature"
import { getHighTempPressureOrderList } from "@/api/high-temp-pressure"
import { getSimulatedWellOrderList } from "@/api/simulated-well"
import {
  clearWorkOrderSchedule,
  saveWorkOrderSchedule,
  type WorkOrderScheduleEquipment,
  type WorkOrderScheduleSegment
} from "@/api/work-order-schedule"
import {
  getWorkOrderScheduleStatusText,
  getWorkOrderScheduleTagType,
  hasRunningScheduleInstrument,
  isWorkOrderScheduled
} from "./schedule-status"

type EquipmentKey = "high-temp-pressure" | "vibration-table" | "water-cycle" | "simulated-well" | "high-temp-box"

type ScheduleSegment = {
  scheduledStartAt: string
  scheduledEndAt: string
}

type ScheduleOrder = {
  id: string
  dbId: number
  targetId: number
  equipment: EquipmentKey
  scheduleEquipment: WorkOrderScheduleEquipment
  taskNumber: string
  title: string
  applicant: string
  targetName: string
  durationHours: number
  status?: number
  statusText?: string
  isRunningTarget?: boolean
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments: ScheduleSegment[]
  raw: any
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
  { key: "vibration-table", label: "振动台工单", scheduleEquipment: "vibration-table" },
  { key: "water-cycle", label: "水循环工单", scheduleEquipment: "water-cycle" },
  { key: "simulated-well", label: "模拟井工单", scheduleEquipment: "simulated-well" },
  { key: "high-temp-box", label: "高温箱工单", scheduleEquipment: "high-temp-box" }
]

const activeEquipment = ref<EquipmentKey>("high-temp-pressure")
const selectedOrderId = ref("")
const loading = ref(false)
const saving = ref(false)
const scheduleDialogVisible = ref(false)
const scheduleRefreshTimer = ref<number | null>(null)
const pickedDate = ref(formatDate(new Date()))
const weekStart = ref(getWeekStart(new Date()))
const searchForm = reactive({ keyword: "" })
const scheduleForm = reactive({
  orderId: "",
  date: formatDate(new Date()),
  startTime: "09:00",
  durationHours: 2
})

const orderMap = reactive<Record<EquipmentKey, ScheduleOrder[]>>({
  "high-temp-pressure": [],
  "vibration-table": [],
  "water-cycle": [],
  "simulated-well": [],
  "high-temp-box": []
})

const timeSlots = Array.from({ length: 17 }, (_, index) => `${String(index + 6).padStart(2, "0")}:00`)
const timeCells = Array.from({ length: 16 }, (_, index) => index)
const slotHeight = 38
const calendarStartMinutes = 6 * 60
const calendarEndMinutes = 22 * 60
const calendarBodyHeight = timeCells.length * slotHeight
const PENDING_CLAIM_STATUS = 1
const SCHEDULE_AUTO_REFRESH_MS = 5000

const activeConfig = computed(() => equipmentTabs.find((item) => item.key === activeEquipment.value) ?? equipmentTabs[0])
const activeOrders = computed(() => orderMap[activeEquipment.value])
const selectedScheduleOrder = computed(() => activeOrders.value.find((item) => item.id === scheduleForm.orderId))

const filteredOrders = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  if (!keyword) return activeOrders.value
  return activeOrders.value.filter((order) =>
    [order.taskNumber, order.title, order.applicant, order.targetName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
})

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
      .filter(Boolean) as CalendarEvent[]
  })
)

watch(activeEquipment, () => {
  selectedOrderId.value = ""
  searchForm.keyword = ""
})

onMounted(() => {
  void loadOrders()
  startScheduleAutoRefresh()
})

onUnmounted(() => {
  stopScheduleAutoRefresh()
})

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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

function addHours(date: Date, hours: number) {
  const next = new Date(date)
  next.setMinutes(next.getMinutes() + Math.round(hours * 60))
  return next
}

function toBackendDateTime(date: Date) {
  return `${formatDate(date)} ${formatHourMinute(date)}:00`
}

function getString(...values: unknown[]) {
  return values.find((value) => typeof value === "string" && value.trim()) as string | undefined
}

function getNumber(value: unknown, fallback = 2) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback
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
  return getWorkOrderScheduleStatusText(order)
}

function getOrderTagType(order: ScheduleOrder) {
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
    const orders = filterPendingClaimOrders(normalizeOrders(equipment, list))
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
  const params = { page: 1, pageSize: 200, status: PENDING_CLAIM_STATUS }
  if (equipment === "high-temp-pressure") {
    const res = await getHighTempPressureOrderList({ ...params } as any)
    return res.data?.list || []
  }
  if (equipment === "vibration-table") {
    const res = await getVibrationTableOrderList(params)
    return res.data?.list || []
  }
  if (equipment === "water-cycle") {
    const res = await getWaterCycleOrderList(params)
    return res.data?.list || []
  }
  if (equipment === "simulated-well") {
    const res = await getSimulatedWellOrderList({ ...params, includeDevices: true } as any)
    return res.data?.list || []
  }
  const res = await getHighTemperatureOrderList(params)
  return res.data?.list || []
}

function filterPendingClaimOrders(orders: ScheduleOrder[]) {
  return orders.filter((order) => {
    const rawOrder = order.raw?.order ?? order.raw
    return Number(rawOrder?.status ?? order.status) === PENDING_CLAIM_STATUS
  })
}

function normalizeOrders(equipment: EquipmentKey, list: any[]): ScheduleOrder[] {
  if (equipment === "high-temp-pressure") return normalizeHighTempPressureOrders(list)
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
    statusText: item.status_text,
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
    statusText: item.statusText,
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
    statusText: item.statusText,
    isRunningTarget: hasRunningScheduleInstrument(item.instruments),
    scheduledStartAt: item.scheduledStartAt || null,
    scheduledEndAt: item.scheduledEndAt || null,
    scheduleSegments: [],
    raw: item
  }))
}

function normalizeHighTempPressureOrders(list: any[]): ScheduleOrder[] {
  return list.flatMap((order) => {
    const instruments = Array.isArray(order.instruments) && order.instruments.length ? order.instruments : [null]
    return instruments.map((instrument: any, index: number) => {
      const targetId = Number(instrument?.id ?? order.id)
      return {
        id: `high-temp-pressure-${order.id}-${targetId}-${index}`,
        dbId: order.id,
        targetId,
        equipment: "high-temp-pressure" as const,
        scheduleEquipment: "high-temp-pressure" as const,
        taskNumber: getString(order.task_number, order.table_no) || `高温高压井-${order.id}`,
        title: getString(order.project_name, order.test_type) || "高温高压井工单",
        applicant: getString(order.applicant) || "",
        targetName: getString(instrument?.instrument_name, instrument?.instrument_sn, order.device_name) || "高温高压井仪器",
        durationHours: getNumber(order.hold_time, 2),
        status: instrument?.instrument_status ?? order.status,
        statusText: order.status_text,
        isRunningTarget: hasRunningScheduleInstrument([instrument]),
        scheduledStartAt: instrument?.scheduled_start_at || null,
        scheduledEndAt: instrument?.scheduled_end_at || null,
        scheduleSegments: normalizeSnakeSegments(instrument?.schedule_segments),
        raw: { order, instrument }
      }
    })
  })
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
        statusText: order.status_text,
        isRunningTarget: false,
        scheduledStartAt: device?.scheduled_start_at || null,
        scheduledEndAt: device?.scheduled_end_at || null,
        scheduleSegments: [],
        raw: { order, device }
      }
    })
  })
}

function handleEquipmentChange() {
  void loadOrders()
}

function handleRefreshClick() {
  void loadOrders()
}

function startScheduleAutoRefresh() {
  stopScheduleAutoRefresh()
  scheduleRefreshTimer.value = window.setInterval(() => {
    if (scheduleDialogVisible.value || saving.value) return
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

function openScheduleDialog(order: ScheduleOrder) {
  scheduleForm.orderId = order.id
  const start = parseDateTime(order.scheduledStartAt || order.scheduleSegments[0]?.scheduledStartAt || "")
  scheduleForm.date = start ? formatDate(start) : pickedDate.value
  scheduleForm.startTime = start ? formatHourMinute(start) : "09:00"
  scheduleForm.durationHours = order.durationHours || 2
  scheduleDialogVisible.value = true
}

async function handleSaveSchedule() {
  const order = selectedScheduleOrder.value
  if (!order) return
  saving.value = true
  try {
    const start = new Date(`${scheduleForm.date}T${scheduleForm.startTime}:00`)
    const end = addHours(start, scheduleForm.durationHours)
    const scheduledStartAt = toBackendDateTime(start)
    const scheduledEndAt = toBackendDateTime(end)
    const payload: {
      scheduled_start_at: string
      scheduled_end_at: string
      schedule_segments?: WorkOrderScheduleSegment[]
    } = {
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt
    }

    if (["water-cycle", "vibration-table", "high-temp-pressure"].includes(order.scheduleEquipment)) {
      payload.schedule_segments = [
        {
          scheduled_start_at: scheduledStartAt,
          scheduled_end_at: scheduledEndAt
        }
      ]
    }

    await saveWorkOrderSchedule(order.scheduleEquipment, order.targetId, payload)
    order.scheduledStartAt = scheduledStartAt
    order.scheduledEndAt = scheduledEndAt
    order.scheduleSegments = payload.schedule_segments
      ? [{ scheduledStartAt, scheduledEndAt }]
      : []
    syncCalendarToSchedule(start)
    scheduleDialogVisible.value = false
    ElMessage.success("排程已保存，测试端日历将显示已排程")
  } finally {
    saving.value = false
  }
}

async function handleClearSchedule(order: ScheduleOrder) {
  await ElMessageBox.confirm("确定要清除该工单排程吗？测试端日历中的对应排程也会移除。", "清除排程", {
    type: "warning"
  })
  await clearWorkOrderSchedule(order.scheduleEquipment, order.targetId)
  order.scheduledStartAt = null
  order.scheduledEndAt = null
  order.scheduleSegments = []
  ElMessage.success("排程已清除")
}
</script>

<style lang="scss" scoped>
.work-order-schedule-page {
  height: calc(100vh - 84px);
  overflow: hidden;
}

.schedule-card {
  height: 100%;
  border-radius: 8px;

  :deep(.el-card__body) {
    box-sizing: border-box;
    height: 100%;
    padding: 20px;
  }

  :deep(.el-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-tabs__header) {
    flex: none;
    order: 0;
    margin: 0 0 16px;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    order: 1;
    min-height: 0;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
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
  border-radius: 50%;
  background: var(--el-color-success);
}

.schedule-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
  height: 100%;
  min-height: 0;
  padding: 0;
  background: var(--el-fill-color-lighter);
}

.order-panel,
.calendar-panel {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.order-panel {
  display: flex;
  flex-direction: column;
}

.order-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-blank);
}

.panel-title {
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}

.panel-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.order-filter {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.order-scrollbar {
  flex: 1;
  min-height: 0;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

.order-card {
  width: 100%;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-warning);
  border-radius: 6px;
  background: var(--el-bg-color);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover,
  &.is-active {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.12);
  }

  &.is-scheduled {
    border-left-color: var(--el-color-primary);
  }
}

.order-card__top,
.order-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.order-card__number {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-family: Consolas, "Courier New", monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-card__title {
  margin-top: 6px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.45;
}

.order-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.order-card__actions {
  justify-content: flex-start;
  margin-top: 10px;
}

.calendar-panel {
  display: flex;
  flex-direction: column;
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
  align-items: center;
  gap: 8px;
  min-width: 0;
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

.calendar-toolbar__right {
  flex: none;
  justify-content: flex-end;
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
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: center;

  strong {
    display: block;
    margin-top: 4px;
    color: var(--el-text-color-primary);
  }

  &.is-today {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.calendar-body {
  position: relative;
}

.time-axis {
  position: relative;
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
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
  border-right: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);

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
  cursor: pointer;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--el-color-primary), #67b5ff);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  text-align: left;

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

.duration-unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 1200px) {
  .schedule-layout {
    grid-template-columns: 1fr;
  }

  .order-panel {
    min-height: 360px;
  }
}

@media (max-width: 768px) {
  .work-order-schedule-page {
    padding: 12px;
  }

  .schedule-layout {
    padding: 12px;
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
