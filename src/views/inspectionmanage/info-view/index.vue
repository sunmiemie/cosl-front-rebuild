<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import dayjs from "dayjs"
import { ElMessage, type CalendarDateType, type CalendarInstance } from "element-plus"
import { ArrowLeft, ArrowRight, Download, Refresh } from "@element-plus/icons-vue"
import { getAssistantInspectionResultsApi } from "@/api/inspection-base"
import type { AssistantInspectionResult, AssistantInspectionResultItem } from "@/api/inspection-base/types"
import {
  ASSISTANT_RESULT_REFRESH_INTERVAL_MS,
  buildInspectionRecordRows,
  filterAssistantResultsByDeviceGroup,
  getAssistantCalendarCount,
  getAssistantPhotoUrl,
  getAssistantResultsByDate,
  getInspectionItemContent,
  getParticipantText
} from "./assistant-results"
import { buildInspectionRecordExportRows, downloadInspectionRecordExcel } from "./inspection-record-export"

interface InspectionGroup {
  label: string
  value: string
  subtitle: string
  equipmentType: string
}

const inspectionGroups: InspectionGroup[] = [
  { label: "HALT-HASS", value: "halt_hass", subtitle: "HALT/HASS 巡检记录", equipmentType: "1" },
  { label: "水循环", value: "water_cycle", subtitle: "水循环巡检记录", equipmentType: "4" },
  { label: "高温高压井", value: "high_pressure_well", subtitle: "高温高压井巡检记录", equipmentType: "3" },
  { label: "高温箱", value: "high_temperature", subtitle: "高温箱巡检记录", equipmentType: "2" },
  { label: "振动台", value: "vibration_table", subtitle: "振动台巡检记录", equipmentType: "5" },
  { label: "模拟井", value: "simulation_well", subtitle: "模拟井巡检记录", equipmentType: "7" }
]

const calendar = ref<CalendarInstance>()
const activeGroup = ref(inspectionGroups[0].value)
const currentMonth = ref(dayjs().format("YYYY-MM"))
const selectedDay = ref(dayjs().format("YYYY-MM-DD"))
const drawerVisible = ref(false)
const currentAssistantRecord = ref<AssistantInspectionResult | null>(null)
const assistantResultLoading = ref(false)
const exportLoading = ref(false)
const assistantResults = ref<AssistantInspectionResult[]>([])
let assistantRefreshTimer: ReturnType<typeof setInterval> | undefined
let assistantRequestSequence = 0

const activeGroupInfo = computed(
  () => inspectionGroups.find((item) => item.value === activeGroup.value) || inspectionGroups[0]
)

const filteredAssistantResults = computed(() =>
  filterAssistantResultsByDeviceGroup(assistantResults.value, activeGroup.value)
)

const assistantResultsByDate = computed(() => getAssistantResultsByDate(filteredAssistantResults.value))
const selectedAssistantResults = computed(() => assistantResultsByDate.value[selectedDay.value] || [])
const selectedRecordRows = computed(() => buildInspectionRecordRows([], selectedAssistantResults.value))
const currentMonthAssistantResults = computed(() => {
  return filteredAssistantResults.value.filter((item) => (item.inspectionDate || "").slice(0, 7) === currentMonth.value)
})
const currentMonthRecordCount = computed(() => currentMonthAssistantResults.value.length)
const selectedDayRecordCount = computed(() => selectedRecordRows.value.length)

function getDateCount(day: string) {
  return getAssistantCalendarCount(assistantResultsByDate.value, day)
}

async function loadAssistantResults(showEmptyMessage = false, forceRefresh = false) {
  const requestSequence = ++assistantRequestSequence
  assistantResultLoading.value = true
  try {
    const month = dayjs(`${currentMonth.value}-01`)
    const params: Record<string, string> = {
      equipmentType: activeGroupInfo.value.equipmentType,
      startDate: month.startOf("month").format("YYYY-MM-DD"),
      endDate: month.endOf("month").format("YYYY-MM-DD")
    }
    if (forceRefresh) {
      params.refresh = "1"
    }
    const res = await getAssistantInspectionResultsApi(params)
    if (requestSequence !== assistantRequestSequence) return
    const nextResults = Array.isArray(res.data) ? res.data : []
    const shouldReplaceResults = forceRefresh || nextResults.length > 0 || assistantResults.value.length === 0
    if (shouldReplaceResults) {
      assistantResults.value = nextResults
      if (currentAssistantRecord.value) {
        const refreshedRecord = nextResults.find((item) => String(item.id) === String(currentAssistantRecord.value?.id))
        currentAssistantRecord.value = refreshedRecord || null
        if (!refreshedRecord) {
          drawerVisible.value = false
        }
      }
    }
    if (showEmptyMessage && !nextResults.length && !assistantResults.value.length) {
      ElMessage.info("小助手暂无巡检结果")
    }
  } catch (error: any) {
    if (requestSequence !== assistantRequestSequence) return
    if (!assistantResults.value.length) {
      assistantResults.value = []
    }
    ElMessage.error(error?.message || "获取小助手巡检结果失败")
  } finally {
    if (requestSequence === assistantRequestSequence) {
      assistantResultLoading.value = false
    }
  }
}

function selectDate(val: CalendarDateType) {
  if (!calendar.value) return
  calendar.value.selectDate(val)
  const target = calendar.value.selectedDay?.toDate() ?? new Date()
  currentMonth.value = dayjs(target).format("YYYY-MM")
  selectedDay.value = dayjs(target).format("YYYY-MM-DD")
}

function handleDayClick(day: string) {
  selectedDay.value = day
  const nextMonth = day.slice(0, 7)
  if (nextMonth !== currentMonth.value) {
    currentMonth.value = nextMonth
  }
}

function openInspectionRecord(row: ReturnType<typeof buildInspectionRecordRows>[number]) {
  currentAssistantRecord.value = row.assistantResult || null
  drawerVisible.value = Boolean(currentAssistantRecord.value)
}

async function refreshInspectionRecords() {
  await loadAssistantResults(true, true)
}

function exportInspectionRecords() {
  const rows = buildInspectionRecordExportRows([], currentMonthAssistantResults.value)
  if (!rows.length) {
    ElMessage.warning("当前月份暂无可导出的巡检记录")
    return
  }

  exportLoading.value = true
  try {
    downloadInspectionRecordExcel(rows, `${activeGroupInfo.value.label}巡检记录_${currentMonth.value}.xls`)
    ElMessage.success("巡检记录导出成功")
  } catch {
    ElMessage.error("巡检记录导出失败")
  } finally {
    exportLoading.value = false
  }
}

function getAssistantPreviewPhotos(row: AssistantInspectionResult) {
  return (row.items || [])
    .flatMap((item) => item.photos || [])
    .map(getAssistantPhotoUrl)
    .filter(Boolean)
}

function getRenderableItemPhotos(row: AssistantInspectionResultItem) {
  return (row.photos || []).filter((photo) => Boolean(getAssistantPhotoUrl(photo)))
}

onMounted(() => {
  void loadAssistantResults(false, true)
  assistantRefreshTimer = setInterval(loadAssistantResults, ASSISTANT_RESULT_REFRESH_INTERVAL_MS)
})
onBeforeUnmount(() => {
  if (assistantRefreshTimer) {
    clearInterval(assistantRefreshTimer)
  }
})

watch([activeGroup, currentMonth], () => {
  void loadAssistantResults(false, true)
})
</script>

<template>
  <div class="app-container inspection-page">
    <div class="inspection-header">
      <el-tabs v-model="activeGroup" class="inspection-tabs">
        <el-tab-pane v-for="item in inspectionGroups" :key="item.value" :label="item.label" :name="item.value" />
      </el-tabs>
      <div class="inspection-actions">
        <el-button
          type="primary"
          plain
          :icon="Download"
          :disabled="assistantResultLoading || currentMonthRecordCount === 0"
          :loading="exportLoading"
          @click="exportInspectionRecords"
        >
          导出表格
        </el-button>
        <el-button
          type="primary"
          plain
          :icon="Refresh"
          :loading="assistantResultLoading"
          @click="refreshInspectionRecords"
        >
          刷新巡检记录
        </el-button>
      </div>
    </div>

    <div class="calendar-layout">
      <el-card shadow="never" class="calendar-card">
        <template #header>
          <div class="panel-header">
            <div>
              <div class="panel-title">{{ activeGroupInfo.label }}</div>
              <div class="panel-subtitle">{{ activeGroupInfo.subtitle }}</div>
            </div>
            <div class="month-total">本月 {{ currentMonthRecordCount }} 条</div>
          </div>
        </template>

        <el-calendar ref="calendar" v-loading="assistantResultLoading">
          <template #header="{ date }">
            <div class="calendar-header">
              <div class="calendar-title">
                <span class="calendar-month">{{ date }}</span>
                <span class="calendar-hint">按巡检日期查看记录</span>
              </div>
              <div class="calendar-actions">
                <el-tooltip content="上个月" placement="top">
                  <el-button class="month-button" :icon="ArrowLeft" circle @click="selectDate('prev-month')" />
                </el-tooltip>
                <el-button class="today-button" type="primary" plain @click="selectDate('today')">今天</el-button>
                <el-tooltip content="下个月" placement="top">
                  <el-button class="month-button" :icon="ArrowRight" circle @click="selectDate('next-month')" />
                </el-tooltip>
              </div>
            </div>
          </template>

          <template #date-cell="{ data }">
            <button
              class="date-cell"
              :class="{
                'is-selected': data.day === selectedDay,
                'has-record': getDateCount(data.day) > 0
              }"
              type="button"
              @click="handleDayClick(data.day)"
            >
              <span class="day-number">{{ Number(data.day.slice(8, 10)) }}</span>
              <span v-if="getDateCount(data.day)" class="record-count">{{ getDateCount(data.day) }} 条</span>
            </button>
          </template>
        </el-calendar>
      </el-card>

      <el-card shadow="never" class="record-card">
        <template #header>
          <div class="panel-header">
            <div>
              <div class="panel-title">{{ selectedDay }} 巡检记录</div>
              <div class="panel-subtitle">点击表格行可查看巡检内容</div>
            </div>
            <el-tag effect="plain">{{ selectedDayRecordCount }} 条</el-tag>
          </div>
        </template>

        <el-empty v-if="!selectedRecordRows.length" description="当天暂无巡检记录" />
        <el-table
          v-else
          :data="selectedRecordRows"
          border
          stripe
          class="record-table"
          @row-click="openInspectionRecord"
        >
          <el-table-column prop="deviceName" label="巡检设备名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="deviceSn" label="设备SN号" min-width="150" show-overflow-tooltip />
          <el-table-column prop="inspector" label="巡检人员" min-width="120" show-overflow-tooltip />
          <el-table-column label="巡检内容数" min-width="106" align="center">
            <template #default="{ row }">{{ row.itemCount || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="82" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="openInspectionRecord(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-drawer v-model="drawerVisible" title="巡检记录详情" size="min(900px, 96vw)">
      <template v-if="currentAssistantRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="巡检单号">{{ currentAssistantRecord.id }}</el-descriptions-item>
          <el-descriptions-item label="巡检日期">{{ currentAssistantRecord.inspectionDate }}</el-descriptions-item>
          <el-descriptions-item label="测试类型">{{ currentAssistantRecord.equipmentTypeName }}</el-descriptions-item>
          <el-descriptions-item label="设备ID">{{ currentAssistantRecord.equipmentId }}</el-descriptions-item>
          <el-descriptions-item label="设备SN号">{{ currentAssistantRecord.sn }}</el-descriptions-item>
          <el-descriptions-item label="巡检人员">{{
            getParticipantText(currentAssistantRecord) || "-"
          }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-title">巡检内容</div>
        <el-table :data="currentAssistantRecord.items || []" border stripe class="detail-table">
          <el-table-column label="项目内容" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">{{ getInspectionItemContent(row) }}</template>
          </el-table-column>
          <el-table-column prop="explains" label="说明" min-width="104" show-overflow-tooltip />
          <el-table-column prop="bz" label="备注" min-width="126" show-overflow-tooltip />
          <el-table-column label="照片" width="124" align="center">
            <template #default="{ row }">
              <div class="assistant-photo-list is-compact">
                <el-image
                  v-for="photo in getRenderableItemPhotos(row)"
                  :key="photo.itemPhotoName"
                  class="assistant-photo"
                  :src="getAssistantPhotoUrl(photo)"
                  :preview-src-list="getAssistantPreviewPhotos(currentAssistantRecord)"
                  preview-teleported
                  fit="cover"
                />
                <span v-if="!getRenderableItemPhotos(row).length" class="empty-photo">暂无图片数据</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped lang="scss">
.inspection-page {
  min-height: calc(100vh - 84px);
}

.inspection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.inspection-tabs {
  flex: 1;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  :deep(.el-tabs__item) {
    min-width: 140px;
    height: 42px;
    font-weight: 600;
  }
}

.inspection-actions {
  display: flex;
  align-items: center;
  flex: none;
}

.calendar-layout {
  display: grid;
  grid-template-columns: minmax(560px, 700px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.calendar-card,
.record-card {
  border-radius: 6px;
}

.panel-header,
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.panel-title {
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 700;
}

.panel-subtitle {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.month-total {
  color: var(--el-color-primary);
  font-size: 14px;
  font-weight: 700;
}

.calendar-card {
  :deep(.el-calendar__body) {
    padding: 10px 0 0;
  }

  :deep(.el-calendar__header) {
    padding: 0 0 10px;
    border-bottom: 0;
  }

  :deep(.el-calendar-table) {
    border-collapse: separate;
    border-spacing: 4px;
  }

  :deep(.el-calendar-table thead th) {
    padding: 0 0 4px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  :deep(.el-calendar-table td) {
    border: 0;
    border-radius: 6px;
    overflow: hidden;
    background: #f6f8fb;
  }

  :deep(.el-calendar-table td.is-selected) {
    background: transparent;
  }

  :deep(.el-calendar-table .el-calendar-day) {
    height: 64px;
    padding: 0;
  }
}

.calendar-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-month {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
}

.calendar-hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 22px rgb(30 64 175 / 8%);
}

.month-button {
  --el-button-size: 28px;
  --el-button-bg-color: #f5f7fb;
  --el-button-border-color: transparent;
  --el-button-hover-bg-color: var(--el-color-primary-light-9);
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: var(--el-color-primary);
}

.today-button {
  height: 28px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 700;
}

.date-cell {
  width: 100%;
  height: 100%;
  padding: 6px 8px;
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 6px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: #f9fbff;
    box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
  }

  &.is-selected {
    background: var(--el-color-primary-light-9);
    box-shadow:
      inset 0 0 0 2px var(--el-color-primary),
      0 8px 20px rgb(64 158 255 / 14%);
  }

  &.has-record {
    background: linear-gradient(180deg, #ffffff 0%, #f5f9ff 100%);
  }
}

.day-number {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 700;
}

.record-count {
  width: fit-content;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 700;
}

.record-table,
.detail-table {
  cursor: pointer;

  :deep(.cell) {
    padding: 0 8px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
  }
}

.record-table {
  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    overflow-x: hidden;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
  }
}

.detail-table {
  width: 100%;

  :deep(.el-table__header-wrapper),
  :deep(.el-table__body-wrapper) {
    overflow-x: hidden;
  }

  :deep(.el-scrollbar__bar.is-horizontal) {
    display: none;
  }
}

.drawer-title {
  margin: 24px 0 12px;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-weight: 700;
}

.inspection-photo {
  width: 96px;
  height: 64px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-light);
}

.empty-photo {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.assistant-photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  &.is-compact {
    justify-content: center;
  }
}

.assistant-photo {
  width: 96px;
  height: 64px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-light);
}

@media (max-width: 1200px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .inspection-header,
  .panel-header,
  .calendar-header {
    align-items: stretch;
    flex-direction: column;
  }

  .inspection-actions {
    justify-content: flex-end;
  }

  .inspection-tabs :deep(.el-tabs__item) {
    min-width: auto;
  }
}
</style>
