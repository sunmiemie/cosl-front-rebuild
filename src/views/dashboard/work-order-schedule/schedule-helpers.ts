export type ScheduleListState = "pending" | "scheduled" | "unpublished" | "other"

export interface ScheduleStateInput {
  status?: number | string | null
  statusText?: string | null
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<unknown> | null
  isSequenceScheduled?: boolean | null
}

export interface DeviceTabFilterInput {
  hostDeviceName?: string | null
  targetName?: string | null
  equipment?: string | null
  useDevice?: string | null
  use_device?: string | null
  raw?: {
    order?: {
      deviceName?: string | null
      device_name?: string | null
      use_device?: string | null
    } | null
    device?: {
      deviceName?: string | null
      device_name?: string | null
      use_device?: string | null
    } | null
    deviceName?: string | null
    device_name?: string | null
    use_device?: string | null
  } | null
}

export interface HostDeviceCandidate {
  id?: number | string
  deviceName?: string
  model?: string
  serialNumber?: string
  modelId?: string
}

export interface MatchHostDevicesOptions {
  includeModel?: boolean
}

export interface SecondaryDeviceTab {
  key: string
  label: string
}

export interface SingleCellScheduleOptions {
  calendarStartMinutes?: number
  calendarEndMinutes?: number
  slotMinutes?: number
  durationHours?: number
}

export interface SchedulePayloadSegment {
  scheduled_start_at: string
  scheduled_end_at: string
  use_device?: string
  useDevice?: string
}

export interface SingleCellSchedulePayload {
  scheduled_start_at: string
  scheduled_end_at: string
  schedule_segments: SchedulePayloadSegment[]
}

export interface SchedulePayloadLike {
  scheduled_start_at?: string
  scheduled_end_at?: string
  schedule_segments: Array<{
    scheduled_start_at?: string
    scheduled_end_at?: string
  }>
}

export interface ScheduleSegmentLike {
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  useDevice?: string | null
  use_device?: string | null
}

export interface CalendarLaneInput {
  id: string
  orderId: string
  dateStr: string
  startMinutes: number
  endMinutes: number
}

export type CalendarLaneEvent<T extends CalendarLaneInput> = T & {
  cellKey: string
  lane: number
  laneCount: number
}

export interface ScheduleTargetOrder {
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<{ scheduledStartAt?: string; scheduledEndAt?: string }>
  status?: number | string
  statusText?: string
}

export interface ApplySchedulePayloadOptions {
  status?: number | string
  statusText?: string
}

const UNPUBLISHED_TEXTS = new Set(["0", "draft", "unpublished", "未发布", "草稿", "待发布"])
const PENDING_TEXTS = new Set([
  "1",
  "pending",
  "pending_claim",
  "待排程",
  "待测试",
  "待领取",
  "待开始",
  "未开始",
  "待处理"
])
const REVIEW_TEXTS = new Set(["待审核", "测试待审核"])
const LIFECYCLE_STATUS_TEXTS: Record<string, string> = {
  "0": "待发布",
  "1": "待领取",
  "2": "测试中",
  "3": "待审核",
  "4": "待重做",
  "5": "正常",
  "6": "异常",
  "7": "暂存",
  "8": "疑问"
}

function formatMinuteTime(minutes: number) {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function formatBackendDateTime(dateStr: string, minutes: number) {
  return `${dateStr} ${formatMinuteTime(minutes)}:00`
}

function formatBackendDateTimeFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day} ${formatMinuteTime(date.getHours() * 60 + date.getMinutes())}:00`
}

function isValidDateStr(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`)
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(date.getTime())
}

function parseBackendDateTime(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null
  const normalized = value.includes("T") ? value.trim() : value.trim().replace(" ", "T")
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function normalizeSchedulePayloadSegment(segment: ScheduleSegmentLike): SchedulePayloadSegment | null {
  const start = parseBackendDateTime(segment.scheduled_start_at ?? segment.scheduledStartAt)
  const end = parseBackendDateTime(segment.scheduled_end_at ?? segment.scheduledEndAt)
  if (!start || !end || end <= start) return null
  const useDevice = hasText(segment.use_device)
    ? segment.use_device.trim()
    : hasText(segment.useDevice)
      ? segment.useDevice.trim()
      : ""
  return {
    scheduled_start_at: formatBackendDateTimeFromDate(start),
    scheduled_end_at: formatBackendDateTimeFromDate(end),
    ...(useDevice ? { use_device: useDevice, useDevice } : {})
  }
}

function normalizeSchedulePayloadSegments(segments: ScheduleSegmentLike[]) {
  const seen = new Set<string>()
  return segments
    .map(normalizeSchedulePayloadSegment)
    .filter((segment): segment is SchedulePayloadSegment => {
      if (!segment) return false
      const key = `${segment.scheduled_start_at}_${segment.scheduled_end_at}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => {
      if (left.scheduled_start_at !== right.scheduled_start_at) {
        return left.scheduled_start_at.localeCompare(right.scheduled_start_at)
      }
      return left.scheduled_end_at.localeCompare(right.scheduled_end_at)
    })
}

function buildSchedulePayloadFromPayloadSegments(segments: SchedulePayloadSegment[]) {
  if (!segments.length) return null
  const latestEnd = segments.reduce(
    (latest, segment) => (segment.scheduled_end_at > latest.scheduled_end_at ? segment : latest),
    segments[0]
  )
  return {
    scheduled_start_at: segments[0].scheduled_start_at,
    scheduled_end_at: latestEnd.scheduled_end_at,
    schedule_segments: segments
  }
}

export function buildSingleCellSchedulePayload(
  dateStr: string,
  slotIndex: number,
  options: SingleCellScheduleOptions = {}
): SingleCellSchedulePayload | null {
  const calendarStartMinutes = options.calendarStartMinutes ?? 6 * 60
  const calendarEndMinutes = options.calendarEndMinutes ?? 22 * 60
  const slotMinutes = options.slotMinutes ?? 60
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotMinutes <= 0 || !isValidDateStr(dateStr)) return null

  const startMinutes = calendarStartMinutes + slotIndex * slotMinutes
  const endMinutes = startMinutes + slotMinutes
  if (startMinutes < calendarStartMinutes || endMinutes > calendarEndMinutes) return null

  const scheduledStartAt = formatBackendDateTime(dateStr, startMinutes)
  const scheduledEndAt = formatBackendDateTime(dateStr, endMinutes)
  return {
    scheduled_start_at: scheduledStartAt,
    scheduled_end_at: scheduledEndAt,
    schedule_segments: [
      {
        scheduled_start_at: scheduledStartAt,
        scheduled_end_at: scheduledEndAt
      }
    ]
  }
}

export function mergeSchedulePayloadSegments(
  existingSegments: ScheduleSegmentLike[],
  payload: SchedulePayloadLike
): SingleCellSchedulePayload | null {
  return buildSchedulePayloadFromPayloadSegments(
    normalizeSchedulePayloadSegments([...existingSegments, ...payload.schedule_segments])
  )
}

export function replaceSchedulePayloadSegment(
  existingSegments: ScheduleSegmentLike[],
  segmentIndex: number,
  nextSegment: ScheduleSegmentLike
): SingleCellSchedulePayload | null {
  const normalizedSegment = normalizeSchedulePayloadSegment(nextSegment)
  if (!normalizedSegment || segmentIndex < 0 || segmentIndex >= existingSegments.length) return null
  const segments = [...existingSegments]
  segments[segmentIndex] = normalizedSegment
  return buildSchedulePayloadFromPayloadSegments(normalizeSchedulePayloadSegments(segments))
}

export function getCalendarEventCellKey(event: Pick<CalendarLaneInput, "dateStr" | "startMinutes">) {
  return `${event.dateStr}_${formatMinuteTime(event.startMinutes)}`
}

function eventsOverlap(left: CalendarLaneInput, right: CalendarLaneInput) {
  return left.dateStr === right.dateStr && left.startMinutes < right.endMinutes && right.startMinutes < left.endMinutes
}

function assignClusterLanes<T extends CalendarLaneInput>(
  cluster: Array<T & { originalIndex: number }>,
  output: Array<CalendarLaneEvent<T>>
) {
  const laneEnds: number[] = []
  const assigned = cluster.map((event) => {
    const lane = laneEnds.findIndex((endMinutes) => endMinutes <= event.startMinutes)
    const nextLane = lane === -1 ? laneEnds.length : lane
    laneEnds[nextLane] = event.endMinutes
    return { event, lane: nextLane }
  })
  const laneCount = Math.max(1, laneEnds.length)
  assigned.forEach(({ event, lane }) => {
    const { originalIndex, ...rest } = event
    output[originalIndex] = {
      ...(rest as unknown as T),
      cellKey: getCalendarEventCellKey(event),
      lane,
      laneCount
    }
  })
}

export function layoutCalendarEvents<T extends CalendarLaneInput>(events: T[]): Array<CalendarLaneEvent<T>> {
  const output: Array<CalendarLaneEvent<T>> = []
  const sorted = events
    .map((event, originalIndex) => ({ ...event, originalIndex }))
    .sort((a, b) => {
      if (a.dateStr !== b.dateStr) return a.dateStr.localeCompare(b.dateStr)
      if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes
      if (a.endMinutes !== b.endMinutes) return a.endMinutes - b.endMinutes
      return a.originalIndex - b.originalIndex
    })

  let cluster: Array<T & { originalIndex: number }> = []
  let clusterEnd = 0
  for (const event of sorted) {
    const sameDate = cluster.length > 0 && cluster[0].dateStr === event.dateStr
    if (!cluster.length || (sameDate && (eventsOverlap(cluster[0], event) || event.startMinutes < clusterEnd))) {
      cluster.push(event)
      clusterEnd = Math.max(clusterEnd, event.endMinutes)
      continue
    }
    assignClusterLanes(cluster, output)
    cluster = [event]
    clusterEnd = event.endMinutes
  }
  if (cluster.length) assignClusterLanes(cluster, output)

  return output
}

export function applySchedulePayloadToTargetOrder<T extends ScheduleTargetOrder>(
  order: T,
  payload: SchedulePayloadLike,
  options: ApplySchedulePayloadOptions = {}
) {
  order.scheduledStartAt = payload.scheduled_start_at
  order.scheduledEndAt = payload.scheduled_end_at
  order.scheduleSegments = payload.schedule_segments.map((segment) => ({
    scheduledStartAt: segment.scheduled_start_at,
    scheduledEndAt: segment.scheduled_end_at
  }))
  if (options.status !== undefined) order.status = options.status
  if (options.statusText !== undefined) order.statusText = options.statusText
}

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function isScheduleAssigned(order: ScheduleStateInput) {
  return Boolean(
    order.isSequenceScheduled || order.scheduleSegments?.length || (order.scheduledStartAt && order.scheduledEndAt)
  )
}

export function normalizeScheduleListState(order: ScheduleStateInput): ScheduleListState {
  const status = normalizeText(order.status)
  const statusText = normalizeText(order.statusText)
  if (isScheduleAssigned(order)) return "scheduled"
  if (UNPUBLISHED_TEXTS.has(status) || UNPUBLISHED_TEXTS.has(statusText)) return "unpublished"
  if (REVIEW_TEXTS.has(statusText)) return "other"
  if (PENDING_TEXTS.has(status) || PENDING_TEXTS.has(statusText)) return "pending"
  return "other"
}

export function filteredOrdersByScheduleState<T extends ScheduleStateInput>(orders: T[], state: ScheduleListState) {
  return orders.filter((order) => normalizeScheduleListState(order) === state)
}

const DEVICE_TAB_FILTER_EQUIPMENT = new Set([
  "high-temp-pressure",
  "halt-hass",
  "vibration-table",
  "water-cycle",
  "simulated-well",
  "high-temp-box"
])

export function filterOrdersByActiveDeviceTab<T extends DeviceTabFilterInput>(
  orders: T[],
  equipment: string,
  activeDeviceTab: string,
  baseDeviceTab: string
) {
  const activeTab = normalizeText(activeDeviceTab) || normalizeText(baseDeviceTab)
  if (!DEVICE_TAB_FILTER_EQUIPMENT.has(equipment) || !activeTab) return orders

  return orders.filter((order) => {
    const useDeviceCandidates = [
      order.useDevice,
      order.use_device,
      order.hostDeviceName,
      order.targetName,
      order.raw?.order?.use_device,
      order.raw?.order?.device_name,
      order.raw?.order?.deviceName,
      order.raw?.device?.use_device,
      order.raw?.device?.device_name,
      order.raw?.device?.deviceName,
      order.raw?.use_device,
      order.raw?.device_name,
      order.raw?.deviceName
    ]
    return useDeviceCandidates.map(normalizeText).some((useDevice) => useDevice === activeTab)
  })
}

export function getScheduleLifecycleStatusText(
  status: unknown,
  scheduledStartAt?: string | null,
  scheduledEndAt?: string | null
) {
  const statusText = LIFECYCLE_STATUS_TEXTS[String(status ?? "").trim()]
  if (statusText) return statusText
  if (scheduledStartAt && scheduledEndAt) return "已排程"
  return "待领取"
}

export function movePriorityItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction
  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) return [...items]
  const next = [...items]
  ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
  return next
}

export function removePriorityItem<T>(items: T[], index: number) {
  if (index < 0 || index >= items.length) return [...items]
  return items.filter((_, itemIndex) => itemIndex !== index)
}

function collectStringFields(value: any, output: string[] = []) {
  if (!value || output.length > 80) return output
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim()
    if (text) output.push(text)
    return output
  }
  if (Array.isArray(value)) {
    value.slice(0, 12).forEach((item) => collectStringFields(item, output))
    return output
  }
  if (typeof value === "object") {
    ;[
      "device_name",
      "deviceName",
      "test_platform",
      "tested_instrument",
      "use_device",
      "equipment_list",
      "instrument_combination",
      "device_number",
      "test_type",
      "project_name",
      "title",
      "targetName",
      "instrument_name",
      "instrument_sn",
      "instrument_names",
      "instrument_sns"
    ].forEach((key) => collectStringFields(value[key], output))
  }
  return output
}

function candidateTextsForHost(host: HostDeviceCandidate, includeModel = true) {
  const modelTexts = includeModel ? [host.model, host.modelId] : []
  return [host.deviceName, host.serialNumber, ...modelTexts].filter(hasText).map((value) => value.trim())
}

function textMatches(left: string, right: string) {
  const a = normalizeText(left)
  const b = normalizeText(right)
  if (!a || !b) return false
  return a.includes(b) || b.includes(a)
}

function getHostTextMatchScore(orderText: string, hostText: string, includeModel: boolean) {
  const source = normalizeText(orderText)
  const candidate = normalizeText(hostText)
  if (!source || !candidate) return null
  if (source === candidate) return { score: 3, length: candidate.length }
  if (includeModel ? textMatches(orderText, hostText) : source.includes(candidate)) {
    return { score: 1, length: candidate.length }
  }
  return null
}

export function hostMatchesModelKeywords(host: HostDeviceCandidate, keywords: string[]) {
  const hostTexts = candidateTextsForHost(host)
  return keywords.some((keyword) => hostTexts.some((hostText) => textMatches(hostText, keyword)))
}

export function buildSecondaryDeviceTabs(
  baseLabel: string,
  hosts: HostDeviceCandidate[],
  keywords: string[] = [baseLabel]
): SecondaryDeviceTab[] {
  const tabMap = new Map<string, SecondaryDeviceTab>()

  hosts
    .filter((host) => hostMatchesModelKeywords(host, keywords))
    .forEach((host) => {
      const label = host.deviceName?.trim()
      if (!label || tabMap.has(label)) return
      tabMap.set(label, { key: label, label })
    })

  return Array.from(tabMap.values())
}

export function matchHostDevicesForOrder(
  order: any,
  hosts: HostDeviceCandidate[],
  options: MatchHostDevicesOptions = {}
) {
  const includeModel = options.includeModel ?? true
  const orderTexts = collectStringFields(order).filter((value, index, list) => list.indexOf(value) === index)
  if (!orderTexts.length) return []

  const matchedHosts = hosts
    .map((host) => {
      const hostTexts = candidateTextsForHost(host, includeModel)
      const bestMatch = hostTexts.reduce<{ score: number; length: number } | null>((best, hostText) => {
        const current = orderTexts.reduce<{ score: number; length: number } | null>((orderBest, orderText) => {
          const match = getHostTextMatchScore(orderText, hostText, includeModel)
          if (!match) return orderBest
          if (
            !orderBest ||
            match.score > orderBest.score ||
            (match.score === orderBest.score && match.length > orderBest.length)
          ) {
            return match
          }
          return orderBest
        }, null)
        if (!current) return best
        if (!best || current.score > best.score || (current.score === best.score && current.length > best.length)) {
          return current
        }
        return best
      }, null)
      return bestMatch ? { host, ...bestMatch } : null
    })
    .filter((item): item is { host: HostDeviceCandidate; score: number; length: number } => item !== null)

  if (!matchedHosts.length) return []
  const bestScore = Math.max(...matchedHosts.map((item) => item.score))
  const bestLength = Math.max(...matchedHosts.filter((item) => item.score === bestScore).map((item) => item.length))
  return matchedHosts.filter((item) => item.score === bestScore && item.length === bestLength).map((item) => item.host)
}
