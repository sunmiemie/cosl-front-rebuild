export type InspectionResultType = 0 | 1

export interface InspectionItem {
  id: string
  clientKey: string
  sortNo: number
  content: string
  resultType: InspectionResultType
  requirePhoto: boolean
}

export interface InspectionRecord {
  id: string
  deviceName: string
  deviceSn: string
  inspector: string
  status: "正常" | "维保中" | "维修中"
  items: InspectionItem[]
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "inspection-manage-records"

function buildId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function nowText() {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export const inspectionDeviceOptions = ["HALT&HASS", "振动台", "模拟井", "高温高压井", "水循环", "高温箱"]

export function createDefaultInspectionRecord(): InspectionRecord {
  const time = nowText()
  return {
    id: buildId("inspection"),
    deviceName: "HALT&HASS",
    deviceSn: "SN001",
    inspector: "常宏,马晓涵",
    status: "正常",
    items: [
      {
        id: buildId("item"),
        clientKey: buildId("draft"),
        sortNo: 1,
        content: "巡检内容1",
        resultType: 0,
        requirePhoto: true
      },
      {
        id: buildId("item"),
        clientKey: buildId("draft"),
        sortNo: 2,
        content: "巡检内容2",
        resultType: 0,
        requirePhoto: false
      }
    ],
    createdAt: time,
    updatedAt: time
  }
}

export function loadInspectionRecords(): InspectionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = [createDefaultInspectionRecord()]
      saveInspectionRecords(initial)
      return initial
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        id: item.id || buildId("inspection"),
        deviceName: item.deviceName || "",
        deviceSn: item.deviceSn || "",
        inspector: item.inspector || "",
        status: normalizeStatus(item.status),
        items: Array.isArray(item.items)
          ? item.items.map((subItem: any) => ({
              id: subItem.id || buildId("item"),
              clientKey: subItem.clientKey || buildId("draft"),
              sortNo: Number(subItem.sortNo) || 1,
              content: subItem.content || "",
              resultType: subItem.resultType === 1 ? 1 : 0,
              requirePhoto: Boolean(subItem.requirePhoto)
            }))
          : [],
        createdAt: item.createdAt || nowText(),
        updatedAt: item.updatedAt || item.createdAt || nowText()
      }))
    }
  } catch {
    // 忽略损坏的本地缓存，使用下方默认数据。
  }
  const fallback = [createDefaultInspectionRecord()]
  saveInspectionRecords(fallback)
  return fallback
}

export function saveInspectionRecords(records: InspectionRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function upsertInspectionRecord(record: InspectionRecord) {
  const records = loadInspectionRecords()
  const index = records.findIndex((item) => item.id === record.id)
  if (index >= 0) {
    records[index] = record
  } else {
    records.unshift(record)
  }
  saveInspectionRecords(records)
}

export function getInspectionRecordById(id?: string | null) {
  if (!id) return null
  return loadInspectionRecords().find((item) => item.id === id) || null
}

export function getNowText() {
  return nowText()
}

function normalizeStatus(status: string): "正常" | "维保中" | "维修中" {
  if (status === "维保中" || status === "维修中") return status
  return "正常"
}
