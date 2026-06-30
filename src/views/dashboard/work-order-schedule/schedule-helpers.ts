export type ScheduleListState = "pending" | "scheduled" | "unpublished" | "other"

export interface ScheduleStateInput {
  status?: number | string | null
  statusText?: string | null
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<unknown> | null
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

const UNPUBLISHED_TEXTS = new Set(["0", "draft", "unpublished", "未发布", "草稿", "待发布"])
const SCHEDULED_TEXTS = new Set(["scheduled", "scheduling", "arranged", "已排程", "已排期", "排期中"])
const REVIEW_TEXTS = new Set(["待审核", "测试待审核"])

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export function isScheduleAssigned(order: ScheduleStateInput) {
  return Boolean(order.scheduleSegments?.length || (order.scheduledStartAt && order.scheduledEndAt))
}

export function normalizeScheduleListState(order: ScheduleStateInput): ScheduleListState {
  const status = normalizeText(order.status)
  const statusText = normalizeText(order.statusText)
  if (UNPUBLISHED_TEXTS.has(status) || UNPUBLISHED_TEXTS.has(statusText)) return "unpublished"
  if (SCHEDULED_TEXTS.has(status) || SCHEDULED_TEXTS.has(statusText)) return "scheduled"
  if (REVIEW_TEXTS.has(statusText)) return "other"
  if (isScheduleAssigned(order)) return "scheduled"
  return "pending"
}

export function filteredOrdersByScheduleState<T extends ScheduleStateInput>(orders: T[], state: ScheduleListState) {
  return orders.filter((order) => normalizeScheduleListState(order) === state)
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
  const normalizedBaseLabel = baseLabel.trim()
  const tabMap = new Map<string, SecondaryDeviceTab>()
  if (normalizedBaseLabel) tabMap.set(normalizedBaseLabel, { key: normalizedBaseLabel, label: normalizedBaseLabel })

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
