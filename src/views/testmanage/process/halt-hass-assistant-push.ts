import type { PushEngineerAssistantProcessesBody } from "@/api/engineer-assistant/types"
import type { HaltHassProcessDetail, HaltHassProcessListItem } from "@/api/halt-hass/types"

type AssistantProcessItem = PushEngineerAssistantProcessesBody["processDtoList"][number]["list"][number]

export const HALT_HASS_ASSISTANT_PROCESS_GROUP = {
  testTypeId: "1",
  testTypeName: "HALT&HASS箱"
} as const

export const canPushHaltHassProcess = (row: Pick<HaltHassProcessListItem, "status">) => row.status === 3

export const buildHaltHassAssistantProcessItem = (
  row: HaltHassProcessListItem,
  detail: HaltHassProcessDetail
): AssistantProcessItem => {
  const processName = String(detail.name || row.name || `HALT-HASS工艺-${row.id}`).trim()
  const version = String(detail.version || row.version || "")
  const rawMetadataDescription = detail.processJson?.metadata?.description
  const metadataDescription = typeof rawMetadataDescription === "string" ? rawMetadataDescription.trim() : ""

  return {
    processId: String(row.id),
    processName,
    processDescription: metadataDescription || `HALT-HASS 工艺 ${processName}${version ? ` V${version}` : ""}`,
    xssj: ""
  }
}
