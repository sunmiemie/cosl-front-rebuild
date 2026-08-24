import type {
  AssistantInspectionPhoto,
  AssistantInspectionResult,
  AssistantInspectionResultItem,
  InspectionBaseInfoListItem
} from "@/api/inspection-base/types"

export interface InspectionRecordTableRow {
  id: string
  source: "local" | "assistant"
  deviceName: string
  deviceSn: string
  inspector: string
  itemCount: number
  localRecord?: InspectionBaseInfoListItem
  assistantResult?: AssistantInspectionResult
}

export const ASSISTANT_RESULT_REFRESH_INTERVAL_MS = 30_000

const DEVICE_GROUP_RULES: Record<string, { types: string[]; keywords: string[] }> = {
  halt_hass: { types: ["1"], keywords: ["HALT", "HASS"] },
  high_temperature: { types: ["2"], keywords: ["高温箱"] },
  high_pressure_well: { types: ["3"], keywords: ["高温高压"] },
  water_cycle: { types: ["4"], keywords: ["水循环"] },
  vibration_table: { types: ["5"], keywords: ["振动"] },
  simulation_well: { types: ["7"], keywords: ["模拟"] }
}

function textIncludesKeyword(text: string, keyword: string) {
  return text.toUpperCase().includes(keyword.toUpperCase())
}

function matchesDeviceGroup(type: string | undefined, text: string, deviceGroup: string) {
  const rule = DEVICE_GROUP_RULES[deviceGroup]
  if (!rule) return true
  if (type && rule.types.includes(String(type))) return true
  return rule.keywords.some((keyword) => textIncludesKeyword(text, keyword))
}

export function filterLocalRecordsByDeviceGroup(records: InspectionBaseInfoListItem[], deviceGroup: string) {
  return records.filter((record) => matchesDeviceGroup(undefined, record.device_name || "", deviceGroup))
}

export function filterAssistantResultsByDeviceGroup(results: AssistantInspectionResult[], deviceGroup: string) {
  return results.filter((result) => {
    const searchableText = [result.equipmentTypeName, result.equipmentId, result.sn].filter(Boolean).join(" ")
    return matchesDeviceGroup(result.equipmentType, searchableText, deviceGroup)
  })
}

export function getAssistantPhotoUrl(photo?: AssistantInspectionPhoto) {
  const value = (photo?.itemPhotoBase64 || "").trim()
  if (!value) return ""
  if (value.startsWith("data:")) return value

  const name = (photo?.itemPhotoName || "").toLowerCase()
  const mime =
    name.endsWith(".jpg") || name.endsWith(".jpeg")
      ? "image/jpeg"
      : name.endsWith(".gif")
        ? "image/gif"
        : name.endsWith(".webp")
          ? "image/webp"
          : "image/png"
  return `data:${mime};base64,${value}`
}

export function getInspectionItemContent(item: AssistantInspectionResultItem) {
  return (
    [item.itemContent, item.itemName, item.content].map((value) => String(value || "").trim()).find(Boolean) ||
    "未返回项目内容"
  )
}

export function getParticipantText(row: AssistantInspectionResult) {
  const participants = row.participants || []
  return participants
    .map((item) => item.inspectionPersonName || item.inspectionPersonId)
    .filter(Boolean)
    .join("、")
}

export function getAssistantResultPhotoCount(row: AssistantInspectionResult) {
  return (row.items || []).reduce((total, item) => total + (item.photos || []).length, 0)
}

export function getAssistantResultDate(row: AssistantInspectionResult) {
  return (row.inspectionDate || "").slice(0, 10)
}

export function getAssistantResultsByDate(results: AssistantInspectionResult[]) {
  return results.reduce<Record<string, AssistantInspectionResult[]>>((map, item) => {
    const date = getAssistantResultDate(item)
    if (!date) return map
    if (!map[date]) map[date] = []
    map[date].push(item)
    return map
  }, {})
}

export function getAssistantCalendarCount(
  assistantResultsByDate: Record<string, AssistantInspectionResult[]>,
  day: string
) {
  return assistantResultsByDate[day]?.length || 0
}

export function buildInspectionRecordRows(
  localRecords: InspectionBaseInfoListItem[],
  assistantResults: AssistantInspectionResult[]
): InspectionRecordTableRow[] {
  return [
    ...localRecords.map((record) => ({
      id: `local-${record.id}`,
      source: "local" as const,
      deviceName: record.device_name,
      deviceSn: record.device_sn,
      inspector: record.inspector,
      itemCount: record.item_count || 0,
      localRecord: record
    })),
    ...assistantResults.map((result) => ({
      id: `assistant-${result.id}`,
      source: "assistant" as const,
      deviceName: result.equipmentTypeName || result.equipmentId || result.equipmentType,
      deviceSn: result.sn,
      inspector: getParticipantText(result),
      itemCount: (result.items || []).length,
      assistantResult: result
    }))
  ]
}
