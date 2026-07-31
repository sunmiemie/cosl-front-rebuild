import type { WorkOrderStatus } from "../types"

/** 地点选项 */
export const LOCATION_OPTIONS = [
  { label: "YJ基地", value: "YJ基地" },
  { label: "塘沽基地", value: "塘沽基地" },
  { label: "湛江基地", value: "湛江基地" }
]

/** 刻度设备选项 */
export const CALIBRATION_DEVICE_OPTIONS = [
  { label: "刻度井", value: "刻度井" },
  { label: "Gal Jig 刻度架", value: "Gal Jig" }
]

/** 工单状态选项 */
export const STATUS_OPTIONS: { label: string; value: WorkOrderStatus }[] = [
  { label: "已创建", value: 0 },
  { label: "待领取", value: 1 },
  { label: "测试中", value: 2 },
  { label: "待审核", value: 3 },
  { label: "待重做", value: 4 },
  { label: "正常", value: 5 },
  { label: "异常", value: 6 },
  { label: "暂存", value: 7 },
  { label: "疑问", value: 8 }
]

type StatusTagType = "success" | "warning" | "info" | "danger" | "primary"

const STATUS_TAG_MAP: Record<WorkOrderStatus, StatusTagType> = {
  0: "info",
  1: "info",
  2: "warning",
  3: "primary",
  4: "danger",
  5: "success",
  6: "danger",
  7: "warning",
  8: "warning"
}

/** 当前状态可流转到的目标状态 */
const STATUS_TRANSITIONS: Partial<Record<WorkOrderStatus, WorkOrderStatus[]>> = {
  1: [2],
  2: [1, 3, 7, 8],
  3: [2, 4, 5, 6],
  4: [2],
  7: [2],
  8: [2, 3]
}

export function getStatusLabel(status: number, statusText?: string) {
  if (statusText) return statusText
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? "未知"
}

export function getStatusTagType(status: number): StatusTagType {
  return STATUS_TAG_MAP[status as WorkOrderStatus] ?? "info"
}

export function getAvailableNextStatuses(current: number): WorkOrderStatus[] {
  return STATUS_TRANSITIONS[current as WorkOrderStatus] ?? []
}

export function getStatusActionLabel(from: number, to: number) {
  const label = getStatusLabel(to)
  if (from === 0 && to === 1) return "发布"
  return `设为${label}`
}
