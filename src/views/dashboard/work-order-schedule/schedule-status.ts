import type { TagProps } from "element-plus"

export type WorkOrderScheduleStatusInput = {
  status?: number | string
  statusText?: string
  isRunningTarget?: boolean
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<unknown>
}

export type WorkOrderScheduleInstrumentInput = {
  status?: number | string | null
  instrumentStatus?: number | string | null
  instrument_status?: number | string | null
  completed?: boolean
  isCompleted?: boolean
  is_completed?: boolean
}

const PENDING_STATUS_TEXTS = new Set(["待排程", "待测试", "待领取", "待开始", "未开始", "待处理"])

function isPendingStatusText(value?: string | null) {
  return Boolean(value && PENDING_STATUS_TEXTS.has(value.trim()))
}

export function isWorkOrderScheduled(order: WorkOrderScheduleStatusInput) {
  return Boolean(order.scheduleSegments?.length || (order.scheduledStartAt && order.scheduledEndAt))
}

function toNumber(value: unknown) {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

export function hasRunningScheduleInstrument(
  instruments?: Array<WorkOrderScheduleInstrumentInput | null | undefined> | null
) {
  return Boolean(
    instruments?.some((instrument) => {
      if (!instrument) return false
      if (instrument.completed === true || instrument.isCompleted === true || instrument.is_completed === true)
        return false
      const status = toNumber(instrument.instrumentStatus ?? instrument.instrument_status ?? instrument.status)
      return status === 1
    })
  )
}

function getLifecycleStatusText(order: WorkOrderScheduleStatusInput) {
  if (order.isRunningTarget) return "测试中"
  const statusText = order.statusText?.trim()
  if (statusText && !isPendingStatusText(statusText)) return statusText
  return ""
}

export function getWorkOrderScheduleStatusText(order: WorkOrderScheduleStatusInput) {
  const lifecycleStatusText = getLifecycleStatusText(order)
  if (lifecycleStatusText) return lifecycleStatusText
  if (isWorkOrderScheduled(order)) return "已排程"
  if (order.statusText) return order.statusText
  return "待排程"
}

export function getWorkOrderScheduleTagType(order: WorkOrderScheduleStatusInput): TagProps["type"] {
  const statusText = getWorkOrderScheduleStatusText(order)
  if (statusText === "已完成") return "success"
  if (statusText === "测试中") return "success"
  if (statusText === "已排程") return "primary"
  if (statusText === "暂停") return "warning"
  return "warning"
}
