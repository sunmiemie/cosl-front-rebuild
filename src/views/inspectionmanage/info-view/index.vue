<script setup lang="ts">
import { computed, ref, watch } from "vue"
import dayjs from "dayjs"
import type { CalendarDateType, CalendarInstance } from "element-plus"
import { ArrowLeft, ArrowRight } from "@element-plus/icons-vue"
import { getInspectionBaseInfoDetailApi, getInspectionBaseInfoListApi } from "@/api/inspection-base"
import type { InspectionBaseInfoDetail, InspectionBaseInfoListItem } from "@/api/inspection-base/types"
import { useRouter } from "vue-router"

interface InspectionGroup {
  label: string
  value: string
  subtitle: string
}

const inspectionGroups: InspectionGroup[] = [
  { label: "HALT-HASS", value: "halt_hass", subtitle: "HALT/HASS 巡检记录" },
  { label: "水循环", value: "water_cycle", subtitle: "水循环巡检记录" },
  { label: "高温高压井", value: "high_pressure_well", subtitle: "高温高压井巡检记录" },
  { label: "高温箱", value: "high_temperature", subtitle: "高温箱巡检记录" },
  { label: "振动台", value: "vibration_table", subtitle: "振动台巡检记录" },
  { label: "模拟井", value: "simulation_well", subtitle: "模拟井巡检记录" }
]

const router = useRouter()
const calendar = ref<CalendarInstance>()
const loading = ref(false)
const activeGroup = ref(inspectionGroups[0].value)
const currentMonth = ref(dayjs().format("YYYY-MM"))
const selectedDay = ref(dayjs().format("YYYY-MM-DD"))
const monthRecords = ref<InspectionBaseInfoListItem[]>([])
const drawerVisible = ref(false)
const currentRecord = ref<InspectionBaseInfoDetail | null>(null)

const activeGroupInfo = computed(
  () => inspectionGroups.find((item) => item.value === activeGroup.value) || inspectionGroups[0]
)

const recordsByDate = computed(() => {
  return monthRecords.value.reduce<Record<string, InspectionBaseInfoListItem[]>>((map, item) => {
    const date = getRecordDate(item)
    if (!date) return map
    if (!map[date]) map[date] = []
    map[date].push(item)
    return map
  }, {})
})

const selectedRecords = computed(() => recordsByDate.value[selectedDay.value] || [])

function getRecordDate(record: InspectionBaseInfoListItem) {
  return record.inspection_date || record.created_at?.slice(0, 10) || record.updated_at?.slice(0, 10) || ""
}

function getDateCount(day: string) {
  return recordsByDate.value[day]?.length || 0
}

function getDateStatus(day: string): "success" | "warning" | "danger" | undefined {
  const records = recordsByDate.value[day] || []
  if (records.some((item) => item.status === "维修中")) return "danger"
  if (records.some((item) => item.status === "维保中")) return "warning"
  return records.length ? "success" : undefined
}

function getStatusType(status: InspectionBaseInfoListItem["status"]) {
  if (status === "正常") return "success"
  if (status === "维保中") return "warning"
  return "danger"
}

function getPhotoUrl(photo?: string | null) {
  const value = (photo || "").trim()
  if (!value) return ""
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) return value
  const baseUrl = import.meta.env.VITE_BASE_API || window.location.origin
  return new URL(value, baseUrl).toString()
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

function handleEdit(row: InspectionBaseInfoListItem) {
  router.push({ path: "/inspectionmanage/base-info", query: { id: row.id } })
}

async function openDetail(row: InspectionBaseInfoListItem) {
  const res = await getInspectionBaseInfoDetailApi(row.id)
  currentRecord.value = res.data
  drawerVisible.value = true
}

async function getCalendarData() {
  loading.value = true
  try {
    const res = await getInspectionBaseInfoListApi({
      device_group: activeGroup.value,
      currentMonth: currentMonth.value,
      currentPage: 1,
      pageSize: 1000
    })
    monthRecords.value = res.data.list || []
  } catch {
    monthRecords.value = []
  } finally {
    loading.value = false
  }
}

watch([activeGroup, currentMonth], getCalendarData, { immediate: true })
</script>

<template>
  <div class="app-container inspection-page">
    <div class="inspection-header">
      <el-tabs v-model="activeGroup" class="inspection-tabs">
        <el-tab-pane v-for="item in inspectionGroups" :key="item.value" :label="item.label" :name="item.value" />
      </el-tabs>
    </div>

    <div class="calendar-layout">
      <el-card shadow="never" class="calendar-card">
        <template #header>
          <div class="panel-header">
            <div>
              <div class="panel-title">{{ activeGroupInfo.label }}</div>
              <div class="panel-subtitle">{{ activeGroupInfo.subtitle }}</div>
            </div>
            <div class="month-total">本月 {{ monthRecords.length }} 条</div>
          </div>
        </template>

        <el-calendar ref="calendar" v-loading="loading">
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
              <el-tag v-if="getDateStatus(data.day)" class="status-tag" size="small" :type="getDateStatus(data.day)">
                有记录
              </el-tag>
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
            <el-tag effect="plain">{{ selectedRecords.length }} 条</el-tag>
          </div>
        </template>

        <el-empty v-if="!selectedRecords.length" description="当天暂无巡检记录" />
        <el-table v-else :data="selectedRecords" border stripe class="record-table" @row-click="openDetail">
          <el-table-column prop="device_name" label="巡检设备名称" min-width="118" />
          <el-table-column prop="device_sn" label="设备SN号" min-width="94" />
          <el-table-column prop="inspector" label="巡检人员" width="84" />
          <el-table-column label="状态" width="74" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="巡检内容数" width="80" align="center">
            <template #default="{ row }">{{ row.item_count || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="98" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="openDetail(row)">查看</el-button>
              <el-button link type="warning" @click.stop="handleEdit(row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <el-drawer v-model="drawerVisible" title="巡检基础信息查看" size="560px">
      <template v-if="currentRecord">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="巡检配置编号">{{ currentRecord.inspection_no }}</el-descriptions-item>
          <el-descriptions-item label="巡检日期">{{ currentRecord.inspection_date }}</el-descriptions-item>
          <el-descriptions-item label="巡检设备名称">{{ currentRecord.device_name }}</el-descriptions-item>
          <el-descriptions-item label="设备SN号">{{ currentRecord.device_sn }}</el-descriptions-item>
          <el-descriptions-item label="巡检人员">{{ currentRecord.inspector }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ currentRecord.status }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentRecord.updated_at }}</el-descriptions-item>
        </el-descriptions>

        <div class="drawer-title">巡检内容</div>
        <el-table :data="currentRecord.items" border stripe class="detail-table">
          <el-table-column type="index" label="序号" width="56" align="center" />
          <el-table-column prop="content" label="巡检内容" min-width="170" />
          <el-table-column label="是否需要拍照" width="100" align="center">
            <template #default="{ row }">{{ row.require_photo ? "是" : "否" }}</template>
          </el-table-column>
          <el-table-column label="巡检图片" width="108" align="center">
            <template #default="{ row }">
              <el-image
                v-if="getPhotoUrl(row.photo)"
                class="inspection-photo"
                :src="getPhotoUrl(row.photo)"
                :preview-src-list="[getPhotoUrl(row.photo)]"
                preview-teleported
                fit="cover"
              />
              <span v-else class="empty-photo">暂无图片</span>
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

.calendar-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(620px, 0.58fr);
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
    padding: 16px 0 0;
  }

  :deep(.el-calendar__header) {
    padding: 0 0 16px;
    border-bottom: 0;
  }

  :deep(.el-calendar-table) {
    border-collapse: separate;
    border-spacing: 6px;
  }

  :deep(.el-calendar-table thead th) {
    padding: 0 0 8px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
    font-weight: 700;
  }

  :deep(.el-calendar-table td) {
    border: 0;
    border-radius: 8px;
    overflow: hidden;
    background: #f6f8fb;
  }

  :deep(.el-calendar-table td.is-selected) {
    background: transparent;
  }

  :deep(.el-calendar-table .el-calendar-day) {
    height: 88px;
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
  font-size: 20px;
  font-weight: 800;
  line-height: 1.2;
}

.calendar-hint {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.calendar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 22px rgb(30 64 175 / 8%);
}

.month-button {
  --el-button-size: 32px;
  --el-button-bg-color: #f5f7fb;
  --el-button-border-color: transparent;
  --el-button-hover-bg-color: var(--el-color-primary-light-9);
  --el-button-hover-border-color: transparent;
  --el-button-hover-text-color: var(--el-color-primary);
}

.today-button {
  height: 32px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 700;
}

.date-cell {
  width: 100%;
  height: 100%;
  padding: 10px;
  cursor: pointer;
  background: #fff;
  border: 0;
  border-radius: 8px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 16px;
  font-weight: 700;
}

.record-count {
  width: fit-content;
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 700;
}

.status-tag {
  width: fit-content;
  margin-top: auto;
  border-radius: 999px;
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
  width: 72px;
  height: 54px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-light);
}

.empty-photo {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
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

  .inspection-tabs :deep(.el-tabs__item) {
    min-width: auto;
  }
}
</style>
