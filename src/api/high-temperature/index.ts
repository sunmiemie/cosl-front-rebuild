import { request } from "@/utils/service"
import type { HighTemperatureInstrument, HighTemperatureOrderDetail, HighTemperatureOrderListItem } from "./types"

type SnakeOrder = {
  id: number
  test_platform?: string
  test_date?: string
  run_time?: number
  device_name?: string
  device_number?: string
  task_number?: string
  target_temp?: number
  applicant?: string
  applicant_phone?: string
  test_application_unit?: string
  application_date?: string | null
  research_number?: string
  project_budget_number?: string
  project_name?: string
  specification?: string
  max_temperature?: number | null
  slope?: string | number | null
  hold_time?: number | null
  humidity?: string | number | null
  remark?: string
  feedback_reason?: string
  status?: number
  status_text?: string
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  instruments?: SnakeInstrument[]
  created_at?: string
  updated_at?: string
}

type SnakeInstrument = {
  id?: number
  instrument_name?: string
  sn_numbers?: string
  quantity?: number
  instrument_status?: number
  is_completed?: boolean
  completed_at?: string | null
}

function formatDate(date: unknown) {
  if (date instanceof Date) return date.toISOString().split("T")[0]
  if (typeof date === "string") return date
  return ""
}

function formatDateTimeCode(date = new Date()) {
  const pad = (value: number, size = 2) => String(value).padStart(size, "0")
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${pad(date.getMilliseconds(), 3)}`
}

function toInstrument(instrument: SnakeInstrument): HighTemperatureInstrument {
  return {
    id: instrument.id,
    instrumentName: instrument.instrument_name || "",
    snNumbers: instrument.sn_numbers || "",
    quantity: instrument.quantity ?? 1,
    instrumentStatus: instrument.instrument_status,
    isCompleted: instrument.is_completed,
    completedAt: instrument.completed_at
  }
}

function toSnakeInstrument(instrument: HighTemperatureInstrument): SnakeInstrument {
  return {
    id: instrument.id,
    instrument_name: instrument.instrumentName,
    sn_numbers: instrument.snNumbers,
    quantity: Number(instrument.quantity || 1)
  }
}

function toListItem(order: SnakeOrder): HighTemperatureOrderListItem {
  const instruments = (order.instruments || []).map(toInstrument)
  return {
    id: order.id,
    taskNumber: order.task_number || "",
    applicant: order.applicant || "",
    applicantPhone: order.applicant_phone || "",
    testApplicationUnit: order.test_application_unit || "",
    applicationDate: order.application_date || order.test_date || undefined,
    researchNumber: order.research_number || "",
    projectBudgetNumber: order.project_budget_number || "",
    projectName: order.project_name || "",
    specification: order.specification || "",
    deviceName: order.device_name || "",
    maxTemperature: order.max_temperature ?? order.target_temp ?? "",
    targetTemp: order.target_temp ?? "",
    slope: order.slope ?? "",
    holdTime: order.hold_time ?? order.run_time ?? null,
    humidity: order.humidity ?? "",
    status: order.status ?? 0,
    statusText: order.status_text,
    testDate: order.test_date,
    scheduledStartAt: order.scheduled_start_at || null,
    scheduledEndAt: order.scheduled_end_at || null,
    instruments
  }
}

function toDetail(order: SnakeOrder): HighTemperatureOrderDetail {
  return {
    ...toListItem(order),
    testPlatform: order.test_platform,
    runTime: order.run_time,
    deviceNumber: order.device_number,
    remark: order.remark,
    feedbackReason: order.feedback_reason,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    instruments: (order.instruments || []).map(toInstrument)
  }
}

function toPayload(data: any) {
  const instruments = (data.instruments || []).map(toSnakeInstrument)
  const firstInstrument = instruments[0]
  const instrumentNames = instruments.map((item: SnakeInstrument) => item.instrument_name).filter(Boolean)
  const snValues = instruments.map((item: SnakeInstrument) => item.sn_numbers).filter(Boolean)
  const applicationDate = formatDate(data.applicationDate || data.testDate || new Date())
  const maxTemperature = Number(data.maxTemperature || data.targetTemp || 0)
  const holdTime = Number(data.holdTime || data.runTime || 0)

  return {
    test_platform: data.testPlatform || "高温箱测试台",
    test_date: applicationDate,
    run_time: holdTime,
    device_name: instrumentNames.join("、") || firstInstrument?.instrument_name || "高温箱待测仪器",
    device_number: snValues.join("\n") || firstInstrument?.sn_numbers || "",
    task_number: data.taskNumber || `HTB${formatDateTimeCode()}`,
    target_temp: maxTemperature,
    applicant: data.applicant,
    applicant_phone: data.applicantPhone || "",
    test_application_unit: data.testApplicationUnit || "",
    application_date: applicationDate,
    research_number: data.researchNumber || "",
    project_budget_number: data.projectBudgetNumber || "",
    project_name: data.projectName || "",
    specification: data.specification || "",
    max_temperature: maxTemperature,
    slope: data.slope === "" || data.slope == null ? null : Number(data.slope),
    hold_time: holdTime,
    humidity: data.humidity === "" || data.humidity == null ? null : Number(data.humidity),
    remark: data.remark || "",
    instruments
  }
}

function toUpdatePayload(data: any) {
  const payload: any = {}
  if (data.testPlatform !== undefined) payload.test_platform = data.testPlatform
  if (data.testDate !== undefined || data.applicationDate !== undefined) {
    payload.test_date = formatDate(data.applicationDate || data.testDate)
  }
  if (data.runTime !== undefined || data.holdTime !== undefined) {
    payload.run_time = Number(data.holdTime ?? data.runTime ?? 0)
  }
  if (data.deviceName !== undefined) payload.device_name = data.deviceName
  if (data.deviceNumber !== undefined) payload.device_number = data.deviceNumber
  if (data.taskNumber !== undefined) payload.task_number = data.taskNumber
  if (data.targetTemp !== undefined || data.maxTemperature !== undefined) {
    payload.target_temp = Number(data.maxTemperature ?? data.targetTemp ?? 0)
  }
  if (data.applicant !== undefined) payload.applicant = data.applicant
  if (data.applicantPhone !== undefined) payload.applicant_phone = data.applicantPhone || ""
  if (data.testApplicationUnit !== undefined) payload.test_application_unit = data.testApplicationUnit || ""
  if (data.applicationDate !== undefined) payload.application_date = formatDate(data.applicationDate)
  if (data.researchNumber !== undefined) payload.research_number = data.researchNumber || ""
  if (data.projectBudgetNumber !== undefined) payload.project_budget_number = data.projectBudgetNumber || ""
  if (data.projectName !== undefined) payload.project_name = data.projectName || ""
  if (data.specification !== undefined) payload.specification = data.specification || ""
  if (data.maxTemperature !== undefined) payload.max_temperature = Number(data.maxTemperature || 0)
  if (data.slope !== undefined) payload.slope = data.slope === "" || data.slope == null ? null : Number(data.slope)
  if (data.holdTime !== undefined) payload.hold_time = Number(data.holdTime || 0)
  if (data.humidity !== undefined) payload.humidity = data.humidity === "" || data.humidity == null ? null : Number(data.humidity)
  if (data.instruments !== undefined) payload.instruments = (data.instruments || []).map(toSnakeInstrument)
  return payload
}

export function getHighTemperatureOrderList(params: any) {
  return request<any>({
    url: "test/high-temp-box/order/list/",
    method: "get",
    params
  }).then((res) => {
    if (res?.code !== 0) return res
    const list = (res.data?.list || []) as SnakeOrder[]
    return {
      ...res,
      data: {
        ...res.data,
        list: list.map(toListItem)
      }
    }
  })
}

export function getHighTemperatureOrderDetail(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/detail/${id}/`,
    method: "get"
  }).then((res) => {
    if (res?.code !== 0) return res
    return {
      ...res,
      data: toDetail(res.data as SnakeOrder)
    }
  })
}

export function createHighTemperatureOrder(data: any) {
  return request<any>({
    url: "test/high-temp-box/order/create/",
    method: "post",
    data: toPayload(data)
  })
}

export function updateHighTemperatureOrder(id: number, data: any) {
  const payload: any = toUpdatePayload(data)
  if (data.remark !== undefined) payload.remark = data.remark || ""
  if (data.status !== undefined) payload.status = data.status

  return request<any>({
    url: `test/high-temp-box/order/detail/${id}/`,
    method: "put",
    data: payload
  })
}

export function publishHighTemperatureOrder(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/publish/${id}/`,
    method: "post"
  })
}

export function deleteHighTemperatureOrder(id: number) {
  return request<any>({
    url: `test/high-temp-box/order/delete/${id}/`,
    method: "delete"
  })
}
