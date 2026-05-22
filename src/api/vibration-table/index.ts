import { request } from "@/utils/service"
import type { VibrationInstrument, VibrationTableOrderDetail, VibrationTableOrderListItem } from "./types"

type SnakeInstrument = {
  id?: number
  instrument_name?: string
  sn_numbers?: string
  asset_numbers?: string
  quantity?: number
  weight?: string
  length?: string
  max_diameter?: string
}

type SnakeOrder = {
  id: number
  table_no?: string
  task_number?: string
  order_no?: string
  applicant?: string
  applicant_phone?: string
  test_application_unit?: string
  test_application_unit_manager?: string
  application_date?: string | null
  research_number?: string
  project_budget_number?: string
  project_name?: string
  client?: string
  planned_time?: string | null
  test_purpose?: string
  test_type?: string
  vibration_direction?: string
  level?: string
  acceleration?: string
  duration?: string | number
  slope?: string
  frequency?: string
  vibration_times?: number
  project_members?: string
  equipment_list?: string
  instrument_combination?: string
  test_steps?: string
  safety_risks?: string
  instruments?: SnakeInstrument[]
  instrument_count?: number
  status?: number
  status_text?: string
  created_at?: string
  updated_at?: string
  // 兼容旧接口字段
  order_type?: string
  device_name?: string
  test_date?: string | null
  remark?: string
}

const formatDateTime = (value: unknown) => {
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace("T", " ")
  if (typeof value === "string") return value
  return ""
}

const toInstrument = (instrument: SnakeInstrument): VibrationInstrument => ({
  id: instrument.id,
  instrumentName: instrument.instrument_name || "",
  snNumbers: instrument.sn_numbers || instrument.asset_numbers || "",
  quantity: instrument.quantity ?? 1,
  weight: instrument.weight || "",
  length: instrument.length || "",
  maxDiameter: instrument.max_diameter || ""
})

const toSnakeInstrument = (instrument: VibrationInstrument): SnakeInstrument => ({
  id: instrument.id,
  instrument_name: instrument.instrumentName,
  sn_numbers: instrument.snNumbers,
  quantity: Number(instrument.quantity || 1),
  weight: instrument.weight || "",
  length: instrument.length || "",
  max_diameter: instrument.maxDiameter || ""
})

function toListItem(order: SnakeOrder): VibrationTableOrderListItem {
  const instruments = (order.instruments || []).map(toInstrument)
  return {
    id: order.id,
    tableNo: order.table_no || order.order_no || "",
    taskNumber: order.task_number || order.order_no || "",
    applicant: order.applicant || "",
    applicantPhone: order.applicant_phone || "",
    testApplicationUnit: order.test_application_unit || "",
    testApplicationUnitManager: order.test_application_unit_manager || "",
    applicationDate: order.application_date || undefined,
    researchNumber: order.research_number || "",
    projectBudgetNumber: order.project_budget_number || "",
    projectName: order.project_name || "",
    client: order.client || "",
    plannedTime: order.planned_time || order.test_date || undefined,
    testPurpose: order.test_purpose || order.remark || "",
    testType: order.test_type || order.order_type || "",
    vibrationDirection: order.vibration_direction || "",
    level: order.level || "",
    acceleration: order.acceleration || "",
    duration: order.duration == null ? "" : String(order.duration),
    slope: order.slope || "",
    frequency: order.frequency || "",
    vibrationTimes: order.vibration_times,
    projectMembers: order.project_members || "",
    equipmentList: order.equipment_list || "",
    instrumentCombination: order.instrument_combination || "",
    testSteps: order.test_steps || "",
    safetyRisks: order.safety_risks || "",
    instrumentCount: order.instrument_count ?? instruments.length,
    instruments,
    status: order.status ?? 0,
    statusText: order.status_text
  }
}

function toDetail(order: SnakeOrder): VibrationTableOrderDetail {
  return {
    ...toListItem(order),
    instruments: (order.instruments || []).map(toInstrument),
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }
}

function toPayload(data: Partial<VibrationTableOrderDetail>) {
  return {
    table_no: data.tableNo,
    task_number: data.taskNumber,
    applicant: data.applicant,
    applicant_phone: data.applicantPhone,
    test_application_unit: data.testApplicationUnit,
    test_application_unit_manager: data.testApplicationUnitManager,
    application_date: data.applicationDate || null,
    research_number: data.researchNumber,
    project_budget_number: data.projectBudgetNumber,
    project_name: data.projectName,
    client: data.client,
    planned_time: data.plannedTime ? formatDateTime(data.plannedTime) : null,
    test_purpose: data.testPurpose,
    test_type: data.testType,
    vibration_direction: data.vibrationDirection,
    level: data.level,
    acceleration: data.acceleration,
    duration: data.duration,
    slope: data.slope,
    frequency: data.frequency,
    vibration_times: data.vibrationTimes,
    project_members: data.projectMembers,
    equipment_list: data.equipmentList,
    instrument_combination: data.instrumentCombination,
    test_steps: data.testSteps,
    safety_risks: data.safetyRisks,
    instruments: (data.instruments || []).map(toSnakeInstrument)
  }
}

export function getVibrationTableOrderList(params: any) {
  return request<any>({
    url: "test/vibration-table/order/list/",
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

export function getVibrationTableOrderDetail(id: number) {
  return request<any>({
    url: `test/vibration-table/order/detail/${id}/`,
    method: "get"
  }).then((res) => {
    if (res?.code !== 0) return res
    return {
      ...res,
      data: toDetail(res.data as SnakeOrder)
    }
  })
}

export function createVibrationTableOrder(data: Partial<VibrationTableOrderDetail>) {
  return request<any>({
    url: "test/vibration-table/order/create/",
    method: "post",
    data: toPayload(data)
  })
}

export function updateVibrationTableOrder(id: number, data: Partial<VibrationTableOrderDetail>) {
  return request<any>({
    url: `test/vibration-table/order/detail/${id}/`,
    method: "put",
    data: toPayload(data)
  })
}

export function publishVibrationTableOrder(id: number) {
  return request<any>({
    url: `test/vibration-table/order/publish/${id}/`,
    method: "post"
  })
}

export function deleteVibrationTableOrder(id: number) {
  return request<any>({
    url: `test/vibration-table/order/delete/${id}/`,
    method: "delete"
  })
}
