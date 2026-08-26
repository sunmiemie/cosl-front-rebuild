<template>
  <div class="app-container work-order-schedule-page">
    <el-card shadow="never" class="schedule-card">
      <el-tabs v-model="activeEquipment" @tab-change="handleEquipmentChange">
        <el-tab-pane v-for="item in equipmentTabs" :key="item.key" :label="item.label" :name="item.key">
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

          <div v-if="!isCircuitBoardModule" class="state-switcher">
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

          <div v-loading="loading" class="schedule-layout">
            <aside class="order-panel">
              <div class="order-panel__header">
                <div>
                  <div class="panel-title">{{ orderPanelMeta.panelTitle }}</div>
                  <div class="panel-subtitle">{{ orderPanelMeta.panelSubtitle }}</div>
                </div>
                <el-tag type="info" effect="plain">{{ orderPanelOrders.length }} 条</el-tag>
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
                <div v-if="orderPanelOrders.length" class="order-list">
                  <div
                    v-for="order in orderPanelOrders"
                    :key="order.id"
                    class="order-card"
                    :class="{
                      'is-active': selectedOrderId === order.id,
                      'is-scheduled': isScheduled(order),
                      'is-draggable': canDragOrderCard(order),
                      'is-dragging': isOrderCardDragging(order)
                    }"
                    :draggable="canDragOrderCard(order)"
                    role="button"
                    tabindex="0"
                    @click="selectedOrderId = order.id"
                    @dragstart="handleOrderCardDragStart(order, $event)"
                    @dragend="handleOrderCardDragEnd"
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
                      <el-tag size="small" effect="plain">{{ order.durationHours }}h</el-tag>
                      <el-tag v-if="order.applicant" size="small" effect="plain">{{ order.applicant }}</el-tag>
                    </div>
                    <div class="order-card__actions">
                      <template v-if="!isCircuitBoardModule">
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
                          <el-button size="small" type="primary" @click.stop="showDragScheduleHint(order)">
                            拖动调整
                          </el-button>
                          <el-button size="small" @click.stop="openScheduleDialog(order)">编辑多段</el-button>
                          <el-button
                            v-if="isAssistantScheduleEquipment(order.scheduleEquipment)"
                            :icon="Upload"
                            :loading="assistantSchedulePushingId === order.id"
                            size="small"
                            @click.stop="handlePushAssistantSchedule(order)"
                          >
                            推送小助手
                          </el-button>
                          <el-button size="small" @click.stop="handleClearSchedule(order)">清除</el-button>
                        </template>
                        <template v-else-if="activeScheduleState === 'history'">
                          <el-tag type="info" effect="plain">只读历史</el-tag>
                        </template>
                        <template v-else>
                          <el-button size="small" type="primary" @click.stop="showDragScheduleHint(order)">
                            拖入日历
                          </el-button>
                          <el-button size="small" @click.stop="openScheduleDialog(order)">手动排程</el-button>
                        </template>
                      </template>
                      <el-button size="small" @click.stop="openDetailDialog(order)">详情</el-button>
                    </div>
                  </div>
                </div>
                <el-empty v-else :description="orderPanelMeta.emptyText" />
              </el-scrollbar>
            </aside>

            <section v-if="activeEquipment === 'circuit-board-module'" class="priority-panel">
              <div class="priority-header">
                <div>
                  <div class="priority-title">{{ priorityTitle }}</div>
                  <div class="priority-subtitle">拖动六点手柄调整顺序</div>
                </div>
                <el-button size="small" plain @click="handleRefreshClick">刷新</el-button>
              </div>

              <el-scrollbar class="priority-scrollbar">
                <div
                  v-if="priorityOrders.length"
                  class="priority-list"
                  @dragover.prevent="handleCircuitBoardPriorityDragOver(priorityOrders.length)"
                  @drop.prevent="handleCircuitBoardPriorityDrop(priorityOrders.length, $event)"
                >
                  <div
                    v-for="(order, index) in priorityOrders"
                    :key="order.id"
                    class="priority-item"
                    :class="{
                      'is-drop-target': circuitBoardDropIndex === index,
                      'is-dragging': circuitBoardDragging?.orderId === order.id
                    }"
                    @dragover.prevent.stop="handleCircuitBoardPriorityDragOver(index)"
                    @drop.prevent.stop="handleCircuitBoardPriorityDrop(index, $event)"
                  >
                    <span
                      class="drag-handle"
                      draggable="true"
                      title="拖动排序"
                      @dragstart="handleCircuitBoardPriorityDragStart(order, $event)"
                      @dragend="handleCircuitBoardDragEnd"
                    >
                      ⠿
                    </span>
                    <span class="priority-num">{{ index + 1 }}.</span>
                    <div class="priority-main">
                      <div class="priority-name" :title="order.title">{{ order.title }}</div>
                      <div class="priority-meta">
                        <span>{{ order.taskNumber }}</span>
                      </div>
                    </div>
                    <el-tag :type="getOrderTagType(order)" size="small" effect="light">{{
                      getOrderStatusText(order)
                    }}</el-tag>
                  </div>
                </div>
                <div v-else class="priority-list priority-list--empty">
                  <el-empty description="暂无已排程工单" />
                </div>
              </el-scrollbar>
            </section>

            <section
              v-else
              class="calendar-panel"
              :class="{
                'is-calendar-dragging': Boolean(calendarDraggingOrderId),
                'is-history-mode': activeScheduleState === 'history'
              }"
            >
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
                  <el-tag v-if="activeScheduleState === 'history'" type="info" effect="plain">历史排程 · 只读</el-tag>
                  <div class="sync-status">
                    <span class="sync-status__dot" />
                    {{ activeScheduleState === "history" ? "显示已执行排程归档" : "与测试端日历使用同一后端排程数据" }}
                  </div>
                  <el-button class="toolbar-refresh" type="success" plain @click="handleLoadCurrentWeekClick">
                    {{ activeScheduleState === "history" ? "读取本周历史" : "读取本周排程" }}
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
                    <div
                      v-for="slot in timeCells"
                      :key="`${day.dateStr}-${slot}`"
                      class="time-cell"
                      :class="{ 'is-drop-target': isCalendarDropTarget(day.dateStr, slot) }"
                      @dragover.prevent="handleCalendarCellDragOver(day.dateStr, slot)"
                      @dragleave="handleCalendarCellDragLeave(day.dateStr, slot)"
                      @drop.prevent="handleCalendarCellDrop(day.dateStr, slot, $event)"
                    />
                    <el-tooltip
                      v-for="event in getEventsForDay(day.dateStr)"
                      :key="event.id"
                      effect="light"
                      placement="top"
                      popper-class="calendar-event-tooltip"
                    >
                      <template #content>
                        <div class="calendar-event-tooltip__content">
                          <div class="calendar-event-tooltip__title">{{ event.orderTitle }}</div>
                          <div class="calendar-event-tooltip__row">
                            <span>工单号</span>
                            <strong>{{ event.taskNumber }}</strong>
                          </div>
                          <div class="calendar-event-tooltip__row">
                            <span>排程对象</span>
                            <strong>{{ event.targetName || "-" }}</strong>
                          </div>
                          <div class="calendar-event-tooltip__row">
                            <span>时间段</span>
                            <strong>{{ event.timeRange }}</strong>
                          </div>
                          <div class="calendar-event-tooltip__row">
                            <span>状态</span>
                            <strong>{{ getEventStatusText(event) }}</strong>
                          </div>
                          <div class="calendar-event-tooltip__row">
                            <span>申请人</span>
                            <strong>{{ event.applicant || "-" }}</strong>
                          </div>
                        </div>
                      </template>
                      <button
                        class="calendar-event"
                        :class="{
                          'is-resizing': isCalendarEventResizing(event),
                          'is-history': activeScheduleState === 'history'
                        }"
                        :style="getEventStyle(event)"
                        type="button"
                        :aria-label="`工单 ${event.taskNumber}，${event.timeRange}，${getEventStatusText(event)}`"
                        @click="selectEvent(event)"
                      >
                        <span
                          v-if="activeScheduleState !== 'history'"
                          class="calendar-event__resize calendar-event__resize--top"
                          aria-hidden="true"
                          @click.stop
                          @mousedown.stop.prevent="startCalendarEventResize(event, 'top', $event)"
                        />
                        <span class="calendar-event__header">
                          <strong class="calendar-event__number">{{ event.title }}</strong>
                          <span v-if="activeScheduleState === 'history'" class="calendar-event__history-label"
                            >历史</span
                          >
                        </span>
                        <span class="calendar-event__time">{{ event.timeRange }}</span>
                        <span
                          v-if="activeScheduleState !== 'history'"
                          class="calendar-event__resize calendar-event__resize--bottom"
                          aria-hidden="true"
                          @click.stop
                          @mousedown.stop.prevent="startCalendarEventResize(event, 'bottom', $event)"
                        />
                      </button>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="scheduleDialogVisible" title="工单排程" width="920px" :close-on-click-modal="false">
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
              <el-select
                v-if="secondaryDeviceTabs.length"
                v-model="segment.equipmentId"
                filterable
                placeholder="请选择测试台"
                class="schedule-device-select"
                @change="handleScheduleSegmentDeviceChange(segment)"
              >
                <el-option
                  v-for="deviceTab in secondaryDeviceTabs"
                  :key="deviceTab.key"
                  :label="deviceTab.label"
                  :value="deviceTab.key"
                />
              </el-select>
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
        <el-descriptions-item label="设备/对象">{{ detailTargetName }}</el-descriptions-item>
        <el-descriptions-item label="主机设备">{{ detailHostDeviceName }}</el-descriptions-item>
        <el-descriptions-item label="预计时长">{{ detailOrder.durationHours }}h</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ detailOrder.applicant || "-" }}</el-descriptions-item>
        <el-descriptions-item label="排程段">
          <div v-if="detailScheduleSegments.length" class="detail-segments">
            <div v-for="segment in detailScheduleSegments" :key="segment.id" class="detail-segment">
              <span>{{ segment.date }} {{ segment.startTime }} - {{ segment.endTime }}</span>
              <el-tag size="small" effect="plain">{{ segment.useDevice || "-" }}</el-tag>
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
import { Upload } from "@element-plus/icons-vue"
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
import { syncEngineerAssistantLocalScheduleApi } from "@/api/engineer-assistant"
import {
  clearWorkOrderSchedule,
  getWorkOrderScheduleHistory,
  saveCircuitBoardSequenceBatch,
  saveWorkOrderSchedule,
  type CircuitBoardSequenceBatchResponse,
  type WorkOrderScheduleEquipment,
  type WorkOrderSchedulePayload,
  type WorkOrderScheduleSegment,
  type WorkOrderScheduleHistoryItem
} from "@/api/work-order-schedule"
import {
  getCompletedScheduleInstrumentGroupStatusText,
  getCompletedScheduleInstrumentStatusText,
  getWorkOrderScheduleStatusText,
  getWorkOrderScheduleTagType,
  hasRunningScheduleInstrument,
  isWorkOrderScheduled
} from "./schedule-status"
import {
  applySchedulePayloadToTargetOrder,
  buildSecondaryDeviceTabs,
  buildSingleCellSchedulePayload,
  filteredOrdersByScheduleState,
  getScheduleLifecycleStatusText,
  hostMatchesModelKeywords,
  layoutCalendarEvents,
  matchHostDevicesForOrder,
  mergeSchedulePayloadSegments,
  normalizeScheduleListState,
  replaceSchedulePayloadSegment,
  type CalendarLaneEvent,
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
  scheduledStartAt?: string
  scheduledEndAt?: string
  equipmentId?: string
  equipment_id?: string
  useDevice?: string
  use_device?: string
  sequenceOnly?: boolean
  sequenceOrder?: number
}

type ScheduleFormSegment = {
  id: string
  date: string
  startTime: string
  endTime: string
  equipmentId: string
  useDevice: string
}

type DetailScheduleSegment = ScheduleFormSegment & {
  useDevice: string
}

type ScheduleOrder = {
  id: string
  dbId: number | string
  targetId: number | string | null
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
  useDevice?: string
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments: ScheduleSegment[]
  isSequenceScheduled?: boolean
  sequenceOrder?: number | null
  isHistory?: boolean
  raw: any
  relationRows?: CircuitModuleApplicationRelation[]
}

type ScheduleHostDevice = HostDeviceCandidate & {
  id: number | string
  deviceName: string
  model: string
  serialNumber: string
}

type BaseCalendarEvent = {
  id: string
  orderId: string
  segmentIndex: number
  title: string
  taskNumber: string
  orderTitle: string
  targetName: string
  applicant: string
  hostDeviceName: string | undefined
  status: number | string | undefined
  statusText: string | undefined
  dateStr: string
  startMinutes: number
  endMinutes: number
  timeRange: string
}

type CalendarEvent = CalendarLaneEvent<BaseCalendarEvent>

type CalendarResizeEdge = "top" | "bottom"

type CalendarResizeState = {
  orderId: string
  segmentIndex: number
  edge: CalendarResizeEdge
  dateStr: string
  startY: number
  currentY: number
  originalStartMinutes: number
  originalEndMinutes: number
  originalSegments: ScheduleSegment[]
}

type CircuitBoardDragPayload = {
  source: "pending" | "priority"
  orderId: string
}

type CalendarDragPayload = {
  orderId: string
}

type CalendarDropTarget = {
  dateStr: string
  slotIndex: number
}

type CircuitBoardOrderSnapshot = {
  status: ScheduleOrder["status"]
  statusText: ScheduleOrder["statusText"]
  scheduledStartAt: ScheduleOrder["scheduledStartAt"]
  scheduledEndAt: ScheduleOrder["scheduledEndAt"]
  scheduleSegments: ScheduleSegment[]
  isSequenceScheduled: ScheduleOrder["isSequenceScheduled"]
  sequenceOrder: ScheduleOrder["sequenceOrder"]
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
  },
  {
    key: "history",
    label: "历史排程",
    panelTitle: "历史排程",
    panelSubtitle: "已执行的排程快照，仅支持查看",
    emptyText: "本周暂无历史排程"
  }
]

const activeEquipment = ref<EquipmentKey>("high-temp-pressure")
const activeScheduleState = ref<ScheduleListState>("pending")
const activeDeviceTab = ref("")
const route = useRoute()
const selectedOrderId = ref("")
const loading = ref(false)
const saving = ref(false)
const publishingId = ref("")
const assistantSchedulePushingId = ref("")
const calendarScheduleSavingId = ref("")
const calendarDraggingOrderId = ref("")
const calendarDropTarget = ref<CalendarDropTarget | null>(null)
const calendarResizeState = ref<CalendarResizeState | null>(null)
const circuitBoardSequenceSaving = ref(false)
const circuitBoardDragging = ref<CircuitBoardDragPayload | null>(null)
const circuitBoardDropIndex = ref<number | null>(null)
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
const historyOrders = ref<ScheduleOrder[]>([])
let historyRequestSequence = 0

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
  "circuit-board-module": ["电路板模块", "电路板", "X-Ray", "XRay", "X射线"]
}

const activeConfig = computed(
  () => equipmentTabs.find((item) => item.key === activeEquipment.value) ?? equipmentTabs[0]
)
const isCircuitBoardModule = computed(() => activeEquipment.value === "circuit-board-module")
const activeOrders = computed(() => orderMap[activeEquipment.value])
const selectedScheduleOrder = computed(() => activeOrders.value.find((item) => item.id === scheduleForm.orderId))
const detailScheduleSegments = computed(() => (detailOrder.value ? getDetailScheduleSegments(detailOrder.value) : []))
const detailScheduleDeviceNames = computed(() =>
  detailOrder.value ? getOrderScheduleDeviceNames(detailOrder.value) : []
)
const detailTargetName = computed(() => {
  if (!detailOrder.value) return "-"
  return detailScheduleDeviceNames.value.length ? detailScheduleDeviceNames.value.join("、") : "-"
})
const detailHostDeviceName = computed(() => {
  if (!detailOrder.value) return "-"
  return detailScheduleDeviceNames.value.length ? detailScheduleDeviceNames.value.join("、") : "-"
})
const activeStateMeta = computed(
  () => scheduleStateTabs.find((item) => item.key === activeScheduleState.value) ?? scheduleStateTabs[0]
)

const stateCounts = computed<Record<ScheduleListState, number>>(() => ({
  pending: filteredOrdersByScheduleState(activeOrders.value, "pending").length,
  scheduled: filteredOrdersByScheduleState(activeOrders.value, "scheduled").length,
  unpublished: filteredOrdersByScheduleState(activeOrders.value, "unpublished").length,
  history: historyOrders.value.length,
  other: filteredOrdersByScheduleState(activeOrders.value, "other").length
}))

const stateOrders = computed(() =>
  activeScheduleState.value === "history"
    ? historyOrders.value
    : filteredOrdersByScheduleState(activeOrders.value, activeScheduleState.value)
)

const circuitBoardScheduledOrders = computed(() =>
  activeOrders.value
    .filter(
      (order) =>
        order.equipment === "circuit-board-module" &&
        Number(order.status) === PENDING_CLAIM_STATUS &&
        order.isSequenceScheduled === true &&
        typeof order.sequenceOrder === "number" &&
        order.sequenceOrder > 0
    )
    .slice()
    .sort(
      (left, right) =>
        (left.sequenceOrder ?? Number.MAX_SAFE_INTEGER) - (right.sequenceOrder ?? Number.MAX_SAFE_INTEGER)
    )
)

const highTempPressureHostDevices = computed(() =>
  hostDevices.value.filter((host) => hostMatchesModelKeywords(host, EQUIPMENT_DEVICE_KEYWORDS["high-temp-pressure"]))
)

const secondaryDeviceTabs = computed(() => {
  const keywords = EQUIPMENT_DEVICE_KEYWORDS[activeEquipment.value]
  return buildSecondaryDeviceTabs(keywords[0], hostDevices.value, keywords)
})

const deviceScopedOrders = computed(() => stateOrders.value)

const filteredOrders = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  if (!keyword) return deviceScopedOrders.value
  return deviceScopedOrders.value.filter((order) =>
    [order.taskNumber, order.title, order.applicant, order.targetName, order.hostDeviceName, order.useDevice]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
})

const filteredCircuitBoardScheduledOrders = computed(() => {
  const keyword = searchForm.keyword.trim().toLowerCase()
  if (!keyword) return circuitBoardScheduledOrders.value
  return circuitBoardScheduledOrders.value.filter((order) =>
    [order.taskNumber, order.title, order.applicant, order.targetName, order.hostDeviceName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  )
})

const circuitBoardPanelMeta = {
  panelTitle: "已排程工单",
  panelSubtitle: "整单发布后自动进入排期顺序",
  emptyText: "暂无已排程工单"
}

const orderPanelOrders = computed(() =>
  isCircuitBoardModule.value ? filteredCircuitBoardScheduledOrders.value : filteredOrders.value
)

const orderPanelMeta = computed(() => (isCircuitBoardModule.value ? circuitBoardPanelMeta : activeStateMeta.value))

const priorityOrders = computed(() => {
  if (isCircuitBoardModule.value) return circuitBoardScheduledOrders.value
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

const calendarEvents = computed<CalendarEvent[]>(() => {
  const sourceOrders = activeScheduleState.value === "history" ? historyOrders.value : activeOrders.value
  const events = sourceOrders
    .filter((order) => {
      if (activeScheduleState.value === "history") return true
      if (![1, 2, 4].includes(Number(order.status))) return false
      const device = order.raw?.device
      return !device?.is_completed && Number(device?.instrument_status || 0) !== 2
    })
    .flatMap<BaseCalendarEvent>((order) => {
      const segments = getOrderScheduleSegments(order)

      return segments
        .map((segment, index) => {
          if (!isScheduleSegmentVisibleInActiveDevice(order, segment)) return null
          const segmentDevice = getSegmentScheduleDevice(order, segment)
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
            segmentIndex: index,
            title: order.taskNumber,
            taskNumber: order.taskNumber,
            orderTitle: order.title,
            targetName: segmentDevice || order.targetName,
            applicant: order.applicant,
            hostDeviceName: segmentDevice || order.hostDeviceName,
            status: order.status,
            statusText: order.statusText,
            dateStr,
            startMinutes,
            endMinutes,
            timeRange: `${formatHourMinute(start)}-${formatHourMinute(end)}`
          }
        })
        .filter((event): event is BaseCalendarEvent => event !== null)
    })

  return layoutCalendarEvents(events)
})

watch(activeScheduleState, () => {
  selectedOrderId.value = ""
  clearCalendarDragState()
  if (activeScheduleState.value === "history") void loadHistoryOrders()
})

watch(activeDeviceTab, () => {
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
  return value === "pending" || value === "scheduled" || value === "unpublished" || value === "history"
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

function formatMinutes(minutes: number) {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function toBackendDateTimeFromMinutes(dateStr: string, minutes: number) {
  return `${dateStr} ${formatMinutes(minutes)}:00`
}

function createScheduleSegment(
  date = pickedDate.value,
  startTime = "09:00",
  endTime = "11:00",
  equipmentId = "",
  useDevice = ""
): ScheduleFormSegment {
  const currentTarget = getCurrentScheduleTarget()
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    startTime,
    endTime,
    equipmentId: equipmentId || currentTarget?.key || "",
    useDevice: useDevice || currentTarget?.label || ""
  }
}

function getOrderScheduleSegments(order: ScheduleOrder): ScheduleSegment[] {
  if (order.scheduleSegments.length) return order.scheduleSegments
  if (order.scheduledStartAt && order.scheduledEndAt) {
    return [{ scheduledStartAt: order.scheduledStartAt, scheduledEndAt: order.scheduledEndAt }]
  }
  return []
}

function getExistingScheduleFormSegments(order: ScheduleOrder): ScheduleFormSegment[] {
  const segments = getOrderScheduleSegments(order)

  if (!segments.length) return []

  return segments.map((segment) => {
    const start = parseDateTime(segment.scheduledStartAt) || new Date()
    const end = parseDateTime(segment.scheduledEndAt) || new Date(start.getTime() + 2 * 60 * 60 * 1000)
    return createScheduleSegment(
      formatDate(start),
      formatHourMinute(start),
      formatHourMinute(end),
      getSegmentScheduleDeviceId(segment),
      getSegmentScheduleDevice(order, segment)
    )
  })
}

function getDetailScheduleSegments(order: ScheduleOrder): DetailScheduleSegment[] {
  return getOrderScheduleSegments(order)
    .map((segment) => {
      const start = parseDateTime(segment.scheduledStartAt)
      const end = parseDateTime(segment.scheduledEndAt)
      if (!start || !end) return null
      return {
        ...createScheduleSegment(formatDate(start), formatHourMinute(start), formatHourMinute(end)),
        useDevice: getSegmentScheduleDevice(order, segment) || "-"
      }
    })
    .filter((segment): segment is DetailScheduleSegment => segment !== null)
}

function getOrderScheduleDeviceNames(order: ScheduleOrder) {
  const names: string[] = []
  getOrderScheduleSegments(order).forEach((segment) => {
    const name = getSegmentScheduleDevice(order, segment)
    if (name && !names.includes(name)) names.push(name)
  })
  return names
}

function addScheduleSegment() {
  const last = scheduleForm.segments[scheduleForm.segments.length - 1]
  scheduleForm.segments.push(
    createScheduleSegment(
      last?.date || pickedDate.value,
      "09:00",
      "11:00",
      last?.equipmentId || "",
      last?.useDevice || ""
    )
  )
}

function removeScheduleSegment(index: number) {
  scheduleForm.segments.splice(index, 1)
  if (!scheduleForm.segments.length) scheduleForm.segments.push(createScheduleSegment())
}

function handleScheduleSegmentDeviceChange(segment: ScheduleFormSegment) {
  segment.useDevice = secondaryDeviceTabs.value.find((item) => item.key === segment.equipmentId)?.label || ""
}

function validateScheduleSegments(segments: ScheduleFormSegment[]) {
  const normalized: Array<{
    start: Date
    end: Date
    key: string
    equipmentId: string
    useDevice: string
  }> = []
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
    if (secondaryDeviceTabs.value.length && !segment.equipmentId) {
      ElMessage.warning("请选择执行该排程的测试台")
      return null
    }
    const deviceTab = secondaryDeviceTabs.value.find((item) => item.key === segment.equipmentId)
    const useDevice = deviceTab?.label || segment.useDevice || ""
    const key = `${segment.date}-${segment.startTime}-${segment.endTime}`
    if (seen.has(key)) {
      ElMessage.warning("存在重复的排程时间段")
      return null
    }
    seen.add(key)
    normalized.push({ start, end, key, equipmentId: segment.equipmentId, useDevice })
  }
  return normalized.sort((a, b) => a.start.getTime() - b.start.getTime())
}

function buildSchedulePayload(): (WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] }) | null {
  const normalized = validateScheduleSegments(scheduleForm.segments)
  if (!normalized?.length) return null

  return buildSchedulePayloadFromSegments(normalized)
}

function buildSchedulePayloadFromSegments(
  normalized: Array<{ start: Date; end: Date; equipmentId?: string; useDevice?: string }>
): WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] } {
  const scheduleSegments = normalized.map(({ start, end, equipmentId, useDevice }) => ({
    scheduled_start_at: toBackendDateTime(start),
    scheduled_end_at: toBackendDateTime(end),
    ...(equipmentId ? { equipment_id: equipmentId, equipmentId } : {}),
    ...(useDevice ? { use_device: useDevice, useDevice } : {})
  }))
  const earliestStart = normalized[0].start
  const latestEnd = normalized.reduce(
    (latest, segment) => (segment.end > latest ? segment.end : latest),
    normalized[0].end
  )

  const firstEquipmentId = scheduleSegments[0]?.equipment_id || ""
  const firstUseDevice = scheduleSegments[0]?.use_device || ""
  return {
    scheduled_start_at: toBackendDateTime(earliestStart),
    scheduled_end_at: toBackendDateTime(latestEnd),
    schedule_segments: scheduleSegments,
    ...(firstEquipmentId ? { equipment_id: firstEquipmentId, equipmentId: firstEquipmentId } : {}),
    ...(firstUseDevice ? { use_device: firstUseDevice, useDevice: firstUseDevice } : {})
  }
}

function buildDraggedSchedulePayload(order: ScheduleOrder, dateStr: string, slotIndex: number) {
  const singleCellPayload = buildSingleCellSchedulePayload(dateStr, slotIndex, {
    calendarStartMinutes,
    calendarEndMinutes,
    slotMinutes: 60
  })
  if (!singleCellPayload) {
    ElMessage.warning("当前时间格无法排程")
    return null
  }

  const payload = withScheduleTargetDevice(singleCellPayload)
  return mergeSchedulePayloadSegments(getOrderScheduleSegments(order), payload) ?? payload
}

function getString(...values: unknown[]) {
  return values.find((value) => {
    if (typeof value !== "string") return false
    const text = value.trim()
    return text && !/^\?+$/.test(text)
  }) as string | undefined
}

function getCurrentScheduleTarget() {
  if (isCircuitBoardModule.value || !secondaryDeviceTabs.value.length) return undefined
  const targetId = activeDeviceTab.value || secondaryDeviceTabs.value[0]?.key || ""
  return secondaryDeviceTabs.value.find((item) => item.key === targetId)
}

function getSegmentScheduleDeviceId(segment?: ScheduleSegment) {
  const directId = getString(segment?.equipmentId, segment?.equipment_id)
  if (directId) return directId
  const deviceName = getString(segment?.useDevice, segment?.use_device)
  return secondaryDeviceTabs.value.find((item) => item.label === deviceName)?.key || ""
}

function getSegmentScheduleDevice(_order: ScheduleOrder, segment?: ScheduleSegment) {
  const directName = getString(segment?.useDevice, segment?.use_device)
  if (directName) return directName
  const equipmentId = getSegmentScheduleDeviceId(segment)
  return secondaryDeviceTabs.value.find((item) => item.key === equipmentId)?.label || ""
}

function isScheduleSegmentVisibleInActiveDevice(order: ScheduleOrder, segment?: ScheduleSegment) {
  const activeTab = activeDeviceTab.value.trim()
  if (isCircuitBoardModule.value || !secondaryDeviceTabs.value.length || !activeTab) return true
  const segmentDeviceId = getSegmentScheduleDeviceId(segment)
  if (segmentDeviceId) return segmentDeviceId === activeTab
  const segmentDevice = getSegmentScheduleDevice(order, segment)
  if (!segmentDevice) return true
  const activeDeviceName = secondaryDeviceTabs.value.find((item) => item.key === activeTab)?.label || ""
  return segmentDevice.trim().toLowerCase() === activeDeviceName.toLowerCase()
}

function withScheduleTargetDevice<
  T extends WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] }
>(payload: T): T {
  const target = getCurrentScheduleTarget()
  if (!target) return payload
  return {
    ...payload,
    equipment_id: target.key,
    equipmentId: target.key,
    use_device: target.label,
    useDevice: target.label,
    schedule_segments: payload.schedule_segments.map((segment) => ({
      ...segment,
      equipment_id: segment.equipment_id || target.key,
      equipmentId: segment.equipmentId || target.key,
      use_device: segment.use_device || target.label,
      useDevice: segment.useDevice || target.label
    }))
  }
}

function getNumber(value: unknown, fallback = 2) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback
}

function getPositiveNumber(value: unknown) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null
}

function getSplitTargetId(splitTarget: any, order: any) {
  if (splitTarget) return getPositiveNumber(splitTarget.id)
  return getPositiveNumber(order.id)
}

function getSequenceOrder(value: unknown) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null
}

function getScheduleSegmentArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function getCircuitBoardSequenceOrder(item: CircuitModuleApplicationRelation) {
  const directOrder = getSequenceOrder((item as any).sequenceOrder ?? (item as any).sequence_order)
  if (directOrder !== null) return directOrder
  const segments = getScheduleSegmentArray(item.scheduleSegments || (item as any).schedule_segments)
  for (const segment of segments) {
    const sequenceOrder = getSequenceOrder(segment?.sequence_order ?? segment?.sequenceOrder)
    if (sequenceOrder !== null) return sequenceOrder
  }
  return null
}

function isCircuitBoardSequenceScheduled(item: CircuitModuleApplicationRelation) {
  if ((item as any).isSequenceScheduled === true || (item as any).is_sequence_scheduled === true) return true
  if (getCircuitBoardSequenceOrder(item) !== null) return true
  return getScheduleSegmentArray(item.scheduleSegments || (item as any).schedule_segments).some(
    (segment) => segment?.sequence_only === true || segment?.sequenceOnly === true
  )
}

function defaultStatusText(status: unknown, scheduledStartAt?: string | null, scheduledEndAt?: string | null) {
  return getScheduleLifecycleStatusText(status, scheduledStartAt, scheduledEndAt)
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
        .map((item): ScheduleSegment | null => {
          const scheduledStartAt = item?.scheduled_start_at || ""
          const scheduledEndAt = item?.scheduled_end_at || ""
          if (!scheduledStartAt || !scheduledEndAt) return null
          return {
            scheduledStartAt,
            scheduledEndAt,
            equipmentId: getString(item?.equipment_id, item?.equipmentId, item?.psi_id, item?.psiId) || "",
            useDevice: getString(item?.use_device, item?.useDevice) || ""
          }
        })
        .filter((item): item is ScheduleSegment => item !== null)
    : []
}

function normalizeCamelSegments(value: any): ScheduleSegment[] {
  return Array.isArray(value)
    ? value
        .map((item): ScheduleSegment | null => {
          const scheduledStartAt = item?.scheduledStartAt || item?.scheduled_start_at || ""
          const scheduledEndAt = item?.scheduledEndAt || item?.scheduled_end_at || ""
          if (!scheduledStartAt || !scheduledEndAt) return null
          return {
            scheduledStartAt,
            scheduledEndAt,
            equipmentId: getString(item?.equipmentId, item?.equipment_id, item?.psiId, item?.psi_id) || "",
            useDevice: getString(item?.useDevice, item?.use_device) || ""
          }
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
  if (activeScheduleState.value === "history" && !isCircuitBoardModule.value) {
    await loadHistoryOrders(options)
    return
  }
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

function normalizeHistoryOrder(equipment: EquipmentKey, item: WorkOrderScheduleHistoryItem): ScheduleOrder {
  const start = parseDateTime(item.scheduledStartAt)
  const end = parseDateTime(item.scheduledEndAt)
  const durationHours = start && end ? Math.max(0.5, (end.getTime() - start.getTime()) / 3_600_000) : 1
  return {
    id: `history-${item.id}`,
    dbId: item.id,
    targetId: item.targetId,
    equipment,
    scheduleEquipment: activeConfig.value.scheduleEquipment,
    taskNumber: item.taskNumber,
    title: item.orderTitle || item.taskNumber,
    applicant: item.applicant || "",
    targetName: item.targetName || "",
    durationHours,
    status: item.status,
    statusText: item.statusText || "已完成",
    hostDeviceName: item.targetName || "",
    useDevice: item.targetName || "",
    scheduledStartAt: item.scheduledStartAt,
    scheduledEndAt: item.scheduledEndAt,
    scheduleSegments: normalizeSnakeSegments(item.scheduleSegments || []),
    isHistory: true,
    raw: { history: item }
  }
}

async function loadHistoryOrders(options: LoadOrdersOptions = {}) {
  if (isCircuitBoardModule.value) {
    historyOrders.value = []
    return
  }
  const equipment = activeEquipment.value
  if (equipment === "circuit-board-module") {
    historyOrders.value = []
    return
  }
  const requestSequence = ++historyRequestSequence
  const firstDay = weekDays.value[0]?.dateStr
  const lastDay = weekDays.value[6]?.dateStr
  if (!firstDay || !lastDay) return
  if (!options.silent) loading.value = true
  try {
    const res = await getWorkOrderScheduleHistory({
      equipmentType: equipment,
      startDate: firstDay,
      endDate: lastDay
    })
    if (requestSequence !== historyRequestSequence || equipment !== activeEquipment.value) return
    historyOrders.value = (res.data?.list || []).map((item) => normalizeHistoryOrder(equipment, item))
    selectedOrderId.value = historyOrders.value.some((order) => order.id === selectedOrderId.value)
      ? selectedOrderId.value
      : historyOrders.value[0]?.id || ""
  } finally {
    if (!options.silent && requestSequence === historyRequestSequence) loading.value = false
  }
}

async function reloadOrdersAfterScheduleChange() {
  await loadOrders({ silent: true }).catch(() => undefined)
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

function getCompletedScheduleOrderStatusText(item: any) {
  return (
    getCompletedScheduleInstrumentStatusText({
      completed: item?.completed,
      isCompleted: item?.isCompleted,
      is_completed: item?.is_completed,
      instrumentStatus: item?.instrumentStatus,
      instrument_status: item?.instrument_status
    }) || getCompletedScheduleInstrumentGroupStatusText(item?.instruments)
  )
}

function normalizeWaterCycleOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => {
    const useDevice = getString(item.use_device, item.useDevice, item.device_name, item.deviceName, item.test_platform)
    const completedStatusText = getCompletedScheduleOrderStatusText(item)
    return {
      id: `water-cycle-${item.id}`,
      dbId: item.id,
      targetId: item.id,
      equipment: "water-cycle",
      scheduleEquipment: "water-cycle",
      taskNumber: getString(item.task_number, item.table_no) || `水循环-${item.id}`,
      title: getString(item.project_name, item.test_type, item.flow_process) || "水循环工单",
      applicant: getString(item.applicant) || "",
      targetName: useDevice || "水循环设备",
      hostDeviceName: useDevice,
      useDevice,
      durationHours: 2,
      status: item.status,
      statusText:
        completedStatusText ||
        item.status_text ||
        defaultStatusText(item.status, item.scheduled_start_at, item.scheduled_end_at),
      isRunningTarget: hasRunningScheduleInstrument(item.instruments),
      scheduledStartAt: item.scheduled_start_at || null,
      scheduledEndAt: item.scheduled_end_at || null,
      scheduleSegments: normalizeSnakeSegments(item.schedule_segments),
      raw: item
    }
  })
}

function normalizeVibrationOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => {
    const useDevice = getString(item.useDevice, item.deviceName, item.use_device, item.device_name)
    const completedStatusText = getCompletedScheduleOrderStatusText(item)
    return {
      id: `vibration-${item.id}`,
      dbId: item.id,
      targetId: item.id,
      equipment: "vibration-table",
      scheduleEquipment: "vibration-table",
      taskNumber: getString(item.taskNumber, item.tableNo) || `振动台-${item.id}`,
      title: getString(item.projectName, item.testPurpose, item.testType) || "振动台工单",
      applicant: getString(item.applicant) || "",
      targetName: useDevice || "振动台",
      hostDeviceName: useDevice,
      useDevice,
      durationHours: getNumber(item.duration, 2),
      status: item.status,
      statusText:
        completedStatusText ||
        item.statusText ||
        defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
      isRunningTarget: hasRunningScheduleInstrument(item.instruments),
      scheduledStartAt: item.scheduledStartAt || null,
      scheduledEndAt: item.scheduledEndAt || null,
      scheduleSegments: normalizeCamelSegments(item.scheduleSegments),
      raw: item
    }
  })
}

function normalizeHighTempBoxOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => {
    const useDevice = getString(item.useDevice, item.use_device, item.deviceName, item.device_name)
    const completedStatusText = getCompletedScheduleOrderStatusText(item)
    return {
      id: `high-temp-box-${item.id}`,
      dbId: item.id,
      targetId: item.id,
      equipment: "high-temp-box",
      scheduleEquipment: "high-temp-box",
      taskNumber: getString(item.taskNumber) || `高温箱-${item.id}`,
      title: getString(item.projectName, item.specification) || "高温箱工单",
      applicant: getString(item.applicant) || "",
      targetName: useDevice || "高温箱",
      hostDeviceName: useDevice,
      useDevice,
      durationHours: getNumber(item.holdTime, 2),
      status: item.status,
      statusText:
        completedStatusText ||
        item.statusText ||
        defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
      isRunningTarget: hasRunningScheduleInstrument(item.instruments),
      scheduledStartAt: item.scheduledStartAt || null,
      scheduledEndAt: item.scheduledEndAt || null,
      scheduleSegments: normalizeSnakeSegments(item.schedule_segments || item.scheduleSegments),
      raw: item
    }
  })
}

function normalizeHaltHassOrders(list: any[]): ScheduleOrder[] {
  return list.map((item) => {
    const useDevice = getString(
      item.useDevice,
      item.use_device,
      item.deviceName,
      item.device_name,
      item.equipmentName,
      item.equipment_name,
      item.testDeviceName,
      item.test_device_name,
      item.chamberName,
      item.chamber_name
    )
    const completedStatusText = getCompletedScheduleOrderStatusText(item)
    return {
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
        useDevice ||
        getString(item.boardGroup?.name, item.boardGroupName, item.process?.name, item.processName) ||
        "HALT-HASS",
      hostDeviceName: useDevice,
      useDevice,
      durationHours: getNumber(item.duration, 2),
      status: item.status,
      statusText:
        completedStatusText ||
        item.statusText ||
        defaultStatusText(item.status, item.scheduledStartAt, item.scheduledEndAt),
      isRunningTarget: Number(item.status) === 2,
      scheduledStartAt: item.scheduledStartAt || item.scheduled_start_at || null,
      scheduledEndAt: item.scheduledEndAt || item.scheduled_end_at || null,
      scheduleSegments: normalizeCamelSegments(item.scheduleSegments).length
        ? normalizeCamelSegments(item.scheduleSegments)
        : normalizeSnakeSegments(item.schedule_segments),
      raw: item
    }
  })
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
    const sequenceOrder = getCircuitBoardSequenceOrder(item)
    const isSequenceScheduled = isCircuitBoardSequenceScheduled(item)
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
      statusText:
        item.statusText ||
        (isSequenceScheduled ? "已排程" : defaultStatusText(status, scheduledStartAt, scheduledEndAt)),
      scheduledStartAt,
      scheduledEndAt,
      scheduleSegments,
      isSequenceScheduled,
      sequenceOrder,
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

function formatHighTempPressureOrderTitle(order: any, instrument: any) {
  const testName = getString(order.project_name, order.test_type) || "高温高压井工单"
  const instrumentName = getString(instrument?.instrument_name, instrument?.instrument_sn)
  return instrumentName ? `${testName}-${instrumentName}` : testName
}

function buildHighTempPressureOrder(
  order: any,
  instrument: any,
  index: number,
  host?: HostDeviceCandidate
): ScheduleOrder {
  const targetId = getSplitTargetId(instrument, order)
  const targetKey = targetId ?? `missing-${index}`
  const hostDeviceName = getString(host?.deviceName)
  const targetName =
    hostDeviceName ||
    getString(instrument?.instrument_name, instrument?.instrument_sn, order.device_name) ||
    "高温高压井仪器"
  const completedInstrumentStatusText = getCompletedScheduleInstrumentStatusText(instrument)
  return {
    id: `high-temp-pressure-${order.id}-${targetKey}-${host?.id ?? index}`,
    dbId: order.id,
    targetId,
    equipment: "high-temp-pressure" as const,
    scheduleEquipment: "high-temp-pressure" as const,
    taskNumber: getString(order.task_number, order.table_no) || `高温高压井-${order.id}`,
    title: formatHighTempPressureOrderTitle(order, instrument),
    applicant: getString(order.applicant) || "",
    targetName,
    hostDeviceName,
    useDevice: getString(order.use_device) || "",
    durationHours: getNumber(order.hold_time, 2),
    status: order.status,
    statusText:
      completedInstrumentStatusText ||
      defaultStatusText(order.status, instrument?.scheduled_start_at, instrument?.scheduled_end_at),
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
      const targetId = getSplitTargetId(device, order)
      const targetKey = targetId ?? `missing-${index}`
      const useDevice = getString(
        device?.use_device,
        device?.useDevice,
        device?.device_name,
        device?.deviceName,
        order.use_device,
        order.useDevice,
        order.tested_instrument
      )
      const completedDeviceStatusText = getCompletedScheduleInstrumentStatusText(device)
      return {
        id: `simulated-well-${order.id}-${targetKey}-${index}`,
        dbId: order.id,
        targetId,
        equipment: "simulated-well" as const,
        scheduleEquipment: "simulated-well" as const,
        taskNumber: getString(order.task_number, order.table_number) || `模拟井-${order.id}`,
        title: getString(order.project_name, order.test_purpose, order.task_desc) || "模拟井工单",
        applicant: getString(order.applicant) || "",
        targetName: useDevice || "模拟井设备",
        hostDeviceName: useDevice,
        useDevice,
        durationHours: 2,
        status: order.status,
        statusText:
          completedDeviceStatusText ||
          defaultStatusText(order.status, device?.scheduled_start_at, device?.scheduled_end_at),
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
  activeScheduleState.value = "pending"
  clearCalendarDragState()
  handleCircuitBoardDragEnd()
  activeDeviceTab.value = ""
  historyOrders.value = []
  void loadOrders()
}

function handleRefreshClick() {
  void (activeScheduleState.value === "history" ? loadHistoryOrders() : loadOrders())
}

function handleLoadCurrentWeekClick() {
  const today = new Date()
  weekStart.value = getWeekStart(today)
  pickedDate.value = formatDate(today)
  void (activeScheduleState.value === "history" ? loadHistoryOrders() : loadOrders())
}

function startScheduleAutoRefresh() {
  stopScheduleAutoRefresh()
  scheduleRefreshTimer.value = window.setInterval(() => {
    if (
      scheduleDialogVisible.value ||
      saving.value ||
      publishingId.value ||
      circuitBoardSequenceSaving.value ||
      calendarScheduleSavingId.value ||
      calendarResizeState.value
    )
      return
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
  if (activeScheduleState.value === "history") void loadHistoryOrders()
}

function handlePickedDateChange(value: string) {
  if (!value) return
  weekStart.value = getWeekStart(parseDate(value))
  if (activeScheduleState.value === "history") void loadHistoryOrders()
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
  const laneCount = Math.max(1, event.laneCount)
  const lane = Math.min(Math.max(0, event.lane), laneCount - 1)
  const laneGap = 4
  const horizontalPadding = 6
  const reservedWidth = horizontalPadding * 2 + (laneCount - 1) * laneGap
  const widthPercent = 100 / laneCount
  const leftPercent = lane * widthPercent
  const leftOffset = horizontalPadding + lane * laneGap - (lane * reservedWidth) / laneCount
  return {
    top: `${top}px`,
    height: `${height}px`,
    right: "auto",
    left: laneCount === 1 ? `${horizontalPadding}px` : `calc(${leftPercent}% + ${leftOffset}px)`,
    width:
      laneCount === 1
        ? `calc(100% - ${horizontalPadding * 2}px)`
        : `calc(${widthPercent}% - ${reservedWidth / laneCount}px)`
  }
}

function selectEvent(event: CalendarEvent) {
  selectedOrderId.value = event.orderId
}

function getEventStatusText(event: CalendarEvent) {
  return getWorkOrderScheduleStatusText({
    status: event.status,
    statusText: event.statusText,
    scheduledStartAt: `${event.dateStr} ${formatMinutes(event.startMinutes)}:00`,
    scheduledEndAt: `${event.dateStr} ${formatMinutes(event.endMinutes)}:00`,
    scheduleSegments: [
      {
        scheduledStartAt: `${event.dateStr} ${formatMinutes(event.startMinutes)}:00`,
        scheduledEndAt: `${event.dateStr} ${formatMinutes(event.endMinutes)}:00`
      }
    ]
  })
}

function getCalendarResizeDeltaSlots(state: CalendarResizeState) {
  const delta = state.currentY - state.startY
  if (delta === 0) return 0
  return delta > 0 ? Math.floor(delta / slotHeight) : Math.ceil(delta / slotHeight)
}

function buildResizedCalendarEventPayload(
  state: CalendarResizeState
): (WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] }) | null {
  const deltaSlots = getCalendarResizeDeltaSlots(state)
  const deltaMinutes = deltaSlots * 60
  let startMinutes = state.originalStartMinutes
  let endMinutes = state.originalEndMinutes

  if (state.edge === "top") {
    startMinutes = Math.min(
      state.originalEndMinutes - 60,
      Math.max(calendarStartMinutes, state.originalStartMinutes + deltaMinutes)
    )
  } else {
    endMinutes = Math.max(
      state.originalStartMinutes + 60,
      Math.min(calendarEndMinutes, state.originalEndMinutes + deltaMinutes)
    )
  }

  const currentSegment = state.originalSegments[state.segmentIndex]
  const order = activeOrders.value.find((item) => item.id === state.orderId)
  const target = getCurrentScheduleTarget()
  const equipmentId = getSegmentScheduleDeviceId(currentSegment) || target?.key || ""
  const useDevice = (order ? getSegmentScheduleDevice(order, currentSegment) : "") || target?.label || ""
  return replaceSchedulePayloadSegment(state.originalSegments, state.segmentIndex, {
    scheduled_start_at: toBackendDateTimeFromMinutes(state.dateStr, startMinutes),
    scheduled_end_at: toBackendDateTimeFromMinutes(state.dateStr, endMinutes),
    ...(equipmentId ? { equipment_id: equipmentId, equipmentId } : {}),
    ...(useDevice ? { use_device: useDevice, useDevice } : {})
  })
}

function isCalendarEventResizing(event: CalendarEvent) {
  return (
    calendarResizeState.value?.orderId === event.orderId &&
    calendarResizeState.value.segmentIndex === event.segmentIndex
  )
}

function removeCalendarEventResizeListeners() {
  window.removeEventListener("mousemove", handleCalendarEventResizeMove)
  window.removeEventListener("mouseup", finishCalendarEventResize)
}

function startCalendarEventResize(event: CalendarEvent, edge: CalendarResizeEdge, mouseEvent: MouseEvent) {
  if (activeScheduleState.value === "history") return
  if (calendarScheduleSavingId.value) return
  const order = activeOrders.value.find((item) => item.id === event.orderId)
  if (!order || !hasSplitTargetId(order)) return
  selectedOrderId.value = order.id
  calendarResizeState.value = {
    orderId: event.orderId,
    segmentIndex: event.segmentIndex,
    edge,
    dateStr: event.dateStr,
    startY: mouseEvent.clientY,
    currentY: mouseEvent.clientY,
    originalStartMinutes: event.startMinutes,
    originalEndMinutes: event.endMinutes,
    originalSegments: getOrderScheduleSegments(order).map((segment) => ({ ...segment }))
  }
  removeCalendarEventResizeListeners()
  window.addEventListener("mousemove", handleCalendarEventResizeMove)
  window.addEventListener("mouseup", finishCalendarEventResize)
}

function handleCalendarEventResizeMove(mouseEvent: MouseEvent) {
  const state = calendarResizeState.value
  if (!state) return
  state.currentY = mouseEvent.clientY
  const order = activeOrders.value.find((item) => item.id === state.orderId)
  if (!order) return
  const payload = buildResizedCalendarEventPayload(state)
  if (payload) applySchedulePayloadToOrder(order, payload)
}

async function finishCalendarEventResize() {
  const state = calendarResizeState.value
  removeCalendarEventResizeListeners()
  calendarResizeState.value = null
  if (!state) return
  const order = activeOrders.value.find((item) => item.id === state.orderId)
  if (!order) return
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) {
    await reloadOrdersAfterScheduleChange()
    return
  }
  const payload = buildResizedCalendarEventPayload(state)
  if (!payload) {
    await reloadOrdersAfterScheduleChange()
    return
  }

  calendarScheduleSavingId.value = order.id
  try {
    const response = await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
    applySchedulePayloadToOrder(order, payload)
    syncCalendarToSchedule(parseDateTime(payload.scheduled_start_at) || new Date())
    selectedOrderId.value = order.id
    activeScheduleState.value = "scheduled"
    await reloadOrdersAfterScheduleChange()
    showScheduleSaveFeedback(order, response)
  } catch (error) {
    ElMessage.error("排程保存失败")
    await reloadOrdersAfterScheduleChange()
  } finally {
    calendarScheduleSavingId.value = ""
  }
}

function getScheduleTargetId(order: ScheduleOrder) {
  if (order.targetId === null || order.targetId === undefined || order.targetId === "") return null
  const targetId = Number(order.targetId)
  return Number.isFinite(targetId) && targetId > 0 ? targetId : null
}

function hasSplitTargetId(order: ScheduleOrder) {
  return getScheduleTargetId(order) !== null
}

function requireScheduleTargetId(order: ScheduleOrder) {
  const targetId = getScheduleTargetId(order)
  if (targetId === null) {
    ElMessage.warning("当前工单缺少后端排程 ID，请刷新列表后再排程")
  }
  return targetId
}

function isAssistantScheduleEquipment(
  equipment: WorkOrderScheduleEquipment
): equipment is "high-temp-box" | "high-temp-pressure" | "water-cycle" | "vibration-table" | "simulated-well" {
  return (
    equipment === "high-temp-box" ||
    equipment === "high-temp-pressure" ||
    equipment === "water-cycle" ||
    equipment === "vibration-table" ||
    equipment === "simulated-well"
  )
}

function showScheduleSaveFeedback(order: ScheduleOrder, response: any) {
  if (!isAssistantScheduleEquipment(order.scheduleEquipment)) {
    ElMessage.success("排程已保存")
    return
  }

  const assistantSync = response?.data?.assistantSync
  if (assistantSync?.success === true) {
    ElMessage.success("排程已保存，并已推送小助手")
    return
  }
  if (assistantSync?.success === false) {
    ElMessage.warning(`排程已保存，但推送小助手失败：${assistantSync.error || "未知错误"}`)
    return
  }
  ElMessage.warning("排程已保存，但后端未返回小助手同步结果")
}

async function handlePushAssistantSchedule(order: ScheduleOrder) {
  if (!isAssistantScheduleEquipment(order.scheduleEquipment)) return
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) return

  assistantSchedulePushingId.value = order.id
  try {
    await syncEngineerAssistantLocalScheduleApi({
      orderType: order.scheduleEquipment,
      targetId
    })
    ElMessage.success("排期已推送到小助手")
  } catch (error) {
    console.error("推送小助手排期失败", error)
    ElMessage.error("排期推送失败，请检查小助手绑定和同步日志")
  } finally {
    assistantSchedulePushingId.value = ""
  }
}

function openDetailDialog(order: ScheduleOrder) {
  detailOrder.value = order
  detailDialogVisible.value = true
}

function openScheduleDialog(order: ScheduleOrder) {
  if (order.equipment === "circuit-board-module") return
  selectedOrderId.value = order.id
  scheduleForm.orderId = order.id
  const segments = getExistingScheduleFormSegments(order)
  scheduleForm.segments = segments.length ? segments : [createScheduleSegment()]
  scheduleDialogVisible.value = true
}

async function syncCircuitBoardModuleSchedule(order: ScheduleOrder, payload: WorkOrderSchedulePayload) {
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) return false
  await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
  return true
}

function applySchedulePayloadToOrder(
  order: ScheduleOrder,
  payload: WorkOrderSchedulePayload & { schedule_segments: WorkOrderScheduleSegment[] }
) {
  applySchedulePayloadToTargetOrder(order, payload, {
    status: PENDING_CLAIM_STATUS,
    statusText: "已排程"
  })
}

async function handleSaveSchedule() {
  const order = selectedScheduleOrder.value
  if (!order) return
  const payload = buildSchedulePayload()
  if (!payload) return

  saving.value = true
  try {
    let response: any
    if (order.scheduleEquipment === "circuit-board-module") {
      const saved = await syncCircuitBoardModuleSchedule(order, payload)
      if (!saved) return
    } else {
      const targetId = requireScheduleTargetId(order)
      if (targetId === null) return
      response = await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
    }

    applySchedulePayloadToOrder(order, payload)
    syncCalendarToSchedule(parseDateTime(payload.scheduled_start_at) || new Date())
    scheduleDialogVisible.value = false
    activeScheduleState.value = "scheduled"
    await reloadOrdersAfterScheduleChange()
    showScheduleSaveFeedback(order, response)
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
  await reloadOrdersAfterScheduleChange()
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

function canDragOrderCard(order: ScheduleOrder) {
  if (isCircuitBoardModule.value) return false
  return canDragCalendarOrder(order)
}

function canDragCalendarOrder(order: ScheduleOrder) {
  return (
    !isCircuitBoardModule.value &&
    order.equipment !== "circuit-board-module" &&
    (activeScheduleState.value === "pending" || activeScheduleState.value === "scheduled") &&
    !calendarScheduleSavingId.value &&
    hasSplitTargetId(order)
  )
}

function isOrderCardDragging(order: ScheduleOrder) {
  return circuitBoardDragging.value?.orderId === order.id || calendarDraggingOrderId.value === order.id
}

function setCalendarDragData(event: DragEvent, payload: CalendarDragPayload) {
  calendarDraggingOrderId.value = payload.orderId
  event.dataTransfer?.setData("application/x-calendar-order", JSON.stringify(payload))
  event.dataTransfer?.setData("text/plain", payload.orderId)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"
}

function readCalendarDragData(event?: DragEvent) {
  if (calendarDraggingOrderId.value) return { orderId: calendarDraggingOrderId.value }
  const raw = event?.dataTransfer?.getData("application/x-calendar-order")
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as CalendarDragPayload
    return payload?.orderId ? payload : null
  } catch {
    return null
  }
}

function handleCalendarOrderDragStart(order: ScheduleOrder, event: DragEvent) {
  if (!canDragCalendarOrder(order)) return
  setCalendarDragData(event, { orderId: order.id })
}

function handleOrderCardDragStart(order: ScheduleOrder, event: DragEvent) {
  if (isCircuitBoardModule.value) return
  handleCalendarOrderDragStart(order, event)
}

function handleOrderCardDragEnd() {
  handleCircuitBoardDragEnd()
  clearCalendarDragState()
}

function clearCalendarDragState() {
  calendarDraggingOrderId.value = ""
  calendarDropTarget.value = null
}

function isCalendarDropTarget(dateStr: string, slotIndex: number) {
  return calendarDropTarget.value?.dateStr === dateStr && calendarDropTarget.value.slotIndex === slotIndex
}

function handleCalendarCellDragOver(dateStr: string, slotIndex: number) {
  if (!calendarDraggingOrderId.value || calendarScheduleSavingId.value) return
  calendarDropTarget.value = { dateStr, slotIndex }
}

function handleCalendarCellDragLeave(dateStr: string, slotIndex: number) {
  if (!isCalendarDropTarget(dateStr, slotIndex)) return
  calendarDropTarget.value = null
}

async function handleCalendarCellDrop(dateStr: string, slotIndex: number, event?: DragEvent) {
  const payload = readCalendarDragData(event)
  if (!payload || calendarScheduleSavingId.value) return
  const order = activeOrders.value.find((item) => item.id === payload.orderId)
  if (!order) {
    handleOrderCardDragEnd()
    return
  }
  await scheduleDraggedCalendarOrder(order, dateStr, slotIndex)
}

function showDragScheduleHint(order: ScheduleOrder) {
  if (canDragCalendarOrder(order)) {
    selectedOrderId.value = order.id
    ElMessage.info(
      activeScheduleState.value === "scheduled"
        ? "请拖动工单到新的日历时间格调整排程"
        : "请将工单拖入右侧日历时间格完成排程"
    )
    return
  }
  if (calendarScheduleSavingId.value === order.id) {
    ElMessage.info("正在保存排程，请稍候")
    return
  }
  ElMessage.info("当前工单不能拖拽排程")
}

async function scheduleDraggedCalendarOrder(order: ScheduleOrder, dateStr: string, slotIndex: number) {
  if (!canDragCalendarOrder(order)) {
    handleOrderCardDragEnd()
    return
  }
  const targetId = requireScheduleTargetId(order)
  if (targetId === null) {
    handleOrderCardDragEnd()
    return
  }
  const payload = buildDraggedSchedulePayload(order, dateStr, slotIndex)
  if (!payload) {
    handleOrderCardDragEnd()
    return
  }

  calendarScheduleSavingId.value = order.id
  try {
    const response = await saveWorkOrderSchedule(order.scheduleEquipment, targetId, payload)
    applySchedulePayloadToOrder(order, payload)
    syncCalendarToSchedule(parseDateTime(payload.scheduled_start_at) || new Date())
    selectedOrderId.value = order.id
    activeScheduleState.value = "scheduled"
    await reloadOrdersAfterScheduleChange()
    showScheduleSaveFeedback(order, response)
  } catch (error) {
    ElMessage.error("排程保存失败")
    await reloadOrdersAfterScheduleChange()
  } finally {
    calendarScheduleSavingId.value = ""
    handleOrderCardDragEnd()
  }
}

function setCircuitBoardDragData(event: DragEvent, payload: CircuitBoardDragPayload) {
  circuitBoardDragging.value = payload
  event.dataTransfer?.setData("application/x-circuit-board-order", JSON.stringify(payload))
  event.dataTransfer?.setData("text/plain", payload.orderId)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move"
}

function readCircuitBoardDragData(event?: DragEvent) {
  if (circuitBoardDragging.value) return circuitBoardDragging.value
  const raw = event?.dataTransfer?.getData("application/x-circuit-board-order")
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as CircuitBoardDragPayload
    return payload?.orderId ? payload : null
  } catch {
    return null
  }
}

function handleCircuitBoardPriorityDragStart(order: ScheduleOrder, event: DragEvent) {
  if (order.equipment !== "circuit-board-module" || circuitBoardSequenceSaving.value) return
  setCircuitBoardDragData(event, { source: "priority", orderId: order.id })
}

function handleCircuitBoardPriorityDragOver(index: number) {
  if (!isCircuitBoardModule.value || !circuitBoardDragging.value || circuitBoardSequenceSaving.value) return
  circuitBoardDropIndex.value = index
}

function handleCircuitBoardDragEnd() {
  circuitBoardDragging.value = null
  circuitBoardDropIndex.value = null
}

function updateCircuitBoardOrderSequence(nextOrders: ScheduleOrder[], equipmentId = "", useDevice = "") {
  nextOrders.forEach((order, index) => {
    order.isSequenceScheduled = true
    order.sequenceOrder = index + 1
    if (useDevice) {
      order.useDevice = useDevice
      order.hostDeviceName = useDevice
      order.targetName = useDevice
    }
    if (Number(order.status) !== 2) order.status = PENDING_CLAIM_STATUS
    order.statusText = "已排程"
    order.scheduledStartAt = null
    order.scheduledEndAt = null
    order.scheduleSegments = [
      {
        sequenceOnly: true,
        sequenceOrder: index + 1,
        ...(equipmentId ? { equipment_id: equipmentId, equipmentId } : {}),
        ...(useDevice ? { use_device: useDevice, useDevice } : {})
      }
    ]
  })
}

function snapshotCircuitBoardOrders() {
  return new Map<string, CircuitBoardOrderSnapshot>(
    activeOrders.value.map((order) => [
      order.id,
      {
        status: order.status,
        statusText: order.statusText,
        scheduledStartAt: order.scheduledStartAt,
        scheduledEndAt: order.scheduledEndAt,
        scheduleSegments: order.scheduleSegments.map((segment) => ({ ...segment })),
        isSequenceScheduled: order.isSequenceScheduled,
        sequenceOrder: order.sequenceOrder
      }
    ])
  )
}

function restoreCircuitBoardOrders(snapshot: Map<string, CircuitBoardOrderSnapshot>) {
  activeOrders.value.forEach((order) => {
    const previous = snapshot.get(order.id)
    if (!previous) return
    order.status = previous.status
    order.statusText = previous.statusText
    order.scheduledStartAt = previous.scheduledStartAt
    order.scheduledEndAt = previous.scheduledEndAt
    order.scheduleSegments = previous.scheduleSegments.map((segment) => ({ ...segment }))
    order.isSequenceScheduled = previous.isSequenceScheduled
    order.sequenceOrder = previous.sequenceOrder
  })
}

async function persistCircuitBoardPriorityOrders(nextOrders: ScheduleOrder[]) {
  const snapshot = snapshotCircuitBoardOrders()
  circuitBoardSequenceSaving.value = true
  const equipmentId = activeDeviceTab.value || secondaryDeviceTabs.value[0]?.key || ""
  const targetDevice = secondaryDeviceTabs.value.find((item) => item.key === equipmentId)
  if (!targetDevice) {
    circuitBoardSequenceSaving.value = false
    throw new Error("missing circuit-board test bench")
  }
  const useDevice = targetDevice.label
  try {
    const orderIds = nextOrders.map((order) => {
      const targetId = requireScheduleTargetId(order)
      if (targetId === null) throw new Error("missing target id")
      return targetId
    })
    updateCircuitBoardOrderSequence(nextOrders, equipmentId, useDevice)
    return await saveCircuitBoardSequenceBatch({
      order_ids: orderIds,
      equipment_id: equipmentId,
      equipmentId,
      ...(useDevice ? { use_device: useDevice, useDevice } : {})
    })
  } catch (error) {
    restoreCircuitBoardOrders(snapshot)
    throw error
  } finally {
    circuitBoardSequenceSaving.value = false
  }
}

function showCircuitBoardAssistantPushResult(response: CircuitBoardSequenceBatchResponse) {
  const rows = Array.isArray(response?.data?.list) ? response.data.list : []
  const pushes = rows.map((row) => row.assistantPush).filter((item) => item !== null && item !== undefined)
  const successCount = pushes.filter((item) => item?.success && !item.skipped).length
  const skippedCount = pushes.filter((item) => item?.skipped).length
  const failedCount = pushes.filter((item) => !item?.success && !item?.skipped).length

  if (!pushes.length) {
    ElMessage.warning("电路板排期顺序已保存，但后端未返回小助手推送结果")
    return
  }
  if (failedCount || skippedCount) {
    ElMessage.warning(
      `电路板排期顺序已保存；小助手推送成功 ${successCount} 条，失败 ${failedCount} 条，跳过 ${skippedCount} 条`
    )
    return
  }
  ElMessage.success(`电路板排期顺序已保存，已推送小助手 ${successCount} 条`)
}

function normalizeCircuitBoardInsertIndex(order: ScheduleOrder, targetIndex: number) {
  const currentIndex = priorityOrders.value.findIndex((item) => item.id === order.id)
  const adjustedIndex = currentIndex >= 0 && currentIndex < targetIndex ? targetIndex - 1 : targetIndex
  return Math.max(0, Math.min(adjustedIndex, priorityOrders.value.length))
}

async function reorderCircuitBoardOrderAt(order: ScheduleOrder, targetIndex: number) {
  if (order.equipment !== "circuit-board-module") return
  const nextOrders = priorityOrders.value.filter((item) => item.id !== order.id)
  const insertIndex = Math.max(0, Math.min(normalizeCircuitBoardInsertIndex(order, targetIndex), nextOrders.length))
  nextOrders.splice(insertIndex, 0, order)
  try {
    const response = await persistCircuitBoardPriorityOrders(nextOrders)
    showCircuitBoardAssistantPushResult(response)
    await loadOrders({ silent: true })
  } catch (error) {
    ElMessage.error("电路板排期顺序保存失败")
    await loadOrders({ silent: true }).catch(() => undefined)
  } finally {
    handleCircuitBoardDragEnd()
  }
}

async function handleCircuitBoardPriorityDrop(index: number, event?: DragEvent) {
  const payload = readCircuitBoardDragData(event)
  if (!payload || circuitBoardSequenceSaving.value) return
  const order = activeOrders.value.find((item) => item.id === payload.orderId)
  if (!order) {
    handleCircuitBoardDragEnd()
    return
  }
  await reorderCircuitBoardOrderAt(order, index)
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
  removeCalendarEventResizeListeners()
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
  gap: 10px;
  padding-top: 10px;
}

.sub-device-tab {
  min-height: 38px;
  padding: 8px 18px;
  font-size: 14px;
  font-weight: 600;
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

  &.is-draggable {
    cursor: grab;
  }

  &.is-dragging {
    opacity: 0.55;
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

  &.is-drop-target {
    background: rgb(64 158 255 / 12%);
    outline: 1px dashed var(--el-color-primary);
    outline-offset: -2px;
  }
}

.calendar-panel.is-calendar-dragging {
  .calendar-event {
    pointer-events: none;
  }
}

.calendar-panel.is-history-mode {
  .sync-status {
    color: var(--el-text-color-secondary);
  }

  .sync-status__dot {
    background: var(--el-color-info);
  }

  .time-cell {
    cursor: default;
  }
}

.calendar-event {
  position: absolute;
  right: 6px;
  left: 6px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-height: 28px;
  padding: 3px 7px;
  overflow: hidden;
  color: #fff;
  text-align: left;
  cursor: pointer;
  background: linear-gradient(135deg, var(--el-color-primary), #67b5ff);
  border: 1px solid transparent;
  border-left: 3px solid rgb(255 255 255 / 72%);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(64 158 255 / 20%);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  .calendar-event__number,
  .calendar-event__time {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .calendar-event__header {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .calendar-event__number {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    line-height: 14px;
  }

  .calendar-event__time {
    display: block;
    font-variant-numeric: tabular-nums;
    font-size: 11px;
    line-height: 11px;
    opacity: 0.92;
  }

  &:hover,
  &:focus-visible {
    box-shadow: 0 5px 14px rgb(64 158 255 / 28%);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-3);
    outline-offset: 2px;
  }

  &.is-resizing {
    box-shadow:
      0 0 0 2px rgb(255 255 255 / 70%),
      0 4px 12px rgb(64 158 255 / 24%);
  }

  &.is-history {
    cursor: default;
    color: var(--el-color-success-dark-2);
    background: linear-gradient(135deg, var(--el-color-success-light-8), var(--el-color-success-light-9));
    border-color: var(--el-color-success-light-5);
    border-left-color: var(--el-color-success);
    box-shadow: 0 2px 8px rgb(103 194 58 / 14%);

    .calendar-event__time {
      color: var(--el-color-success-dark-2);
      opacity: 1;
    }

    &:hover,
    &:focus-visible {
      border-color: var(--el-color-success-light-3);
      box-shadow: 0 3px 10px rgb(103 194 58 / 22%);
    }
  }
}

.calendar-event__history-label {
  flex: none;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  line-height: 14px;
  color: var(--el-color-success-dark-2);
  background: var(--el-color-success-light-7);
  border: 1px solid var(--el-color-success-light-5);
  border-radius: 999px;
}

.calendar-event__resize {
  position: absolute;
  right: 0;
  left: 0;
  height: 8px;
  cursor: ns-resize;
}

.calendar-event__resize--top {
  top: 0;
}

.calendar-event__resize--bottom {
  bottom: 0;
}

:global(.calendar-event-tooltip) {
  max-width: 320px;
}

:global(.calendar-event-tooltip__content) {
  display: grid;
  gap: 7px;
  min-width: 240px;
  color: var(--el-text-color-primary);
}

:global(.calendar-event-tooltip__title) {
  padding-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:global(.calendar-event-tooltip__row) {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  font-size: 12px;
}

:global(.calendar-event-tooltip__row span) {
  color: var(--el-text-color-secondary);
}

:global(.calendar-event-tooltip__row strong) {
  min-width: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.priority-header {
  background: var(--el-fill-color-lighter);
}

.priority-list--empty {
  min-height: 220px;
  justify-content: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
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

  &.is-drop-target {
    border-color: var(--el-color-primary);
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }

  &.is-dragging {
    opacity: 0.55;
  }
}

.drag-handle {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  cursor: grab;
  font-size: 16px;

  &:active {
    cursor: grabbing;
  }
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
  gap: 6px;
}

.detail-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
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
  grid-template-columns:
    minmax(150px, 1.2fr)
    minmax(130px, 1fr)
    minmax(110px, 1fr)
    24px
    minmax(110px, 1fr)
    auto;
  align-items: center;
  gap: 8px;
  min-width: 0;

  :deep(.el-date-editor.el-input) {
    width: 100%;
    min-width: 0;
  }

  .schedule-device-select {
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
