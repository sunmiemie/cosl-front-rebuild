import { request } from "@/utils/service"
import type {
  VibrationInstrument,
  VibrationPreExperiment,
  VibrationPreExperimentAttachment,
  VibrationTableOrderDetail,
  VibrationTableOrderListItem
} from "./types"

type SnakeInstrument = {
  id?: number
  instrument_name?: string
  sn_numbers?: string
  asset_numbers?: string
  quantity?: number
  weight?: string
  length?: string
  max_diameter?: string
  instrument_status?: number
  status_text?: string
  is_completed?: boolean
  completed_at?: string | null
}

type SnakePreExperimentAttachment = {
  field?: string
  type?: string
  name?: string
  file_name?: string
  file_url?: string
  media_path?: string
  local_path?: string
  size?: number
  content_type?: string
}

type SnakePreExperiment = {
  id: number
  order?: number
  order_id?: number
  experiment_no?: number
  tester?: string
  summary?: Record<string, any>
  records?: Array<Record<string, any>>
  attachments?: SnakePreExperimentAttachment[]
  export_dir?: string
  client_submit_id?: string
  created_at?: string
  updated_at?: string
}

type SnakeDeviceRow = {
  deviceName?: string
  device_name?: string
  psi_name?: string
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
  test_location?: string | null
  test_purpose?: string
  others?: unknown
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
  pre_experiments?: SnakePreExperiment[]
  instrument_count?: number
  status?: number
  status_text?: string
  scheduled_start_at?: string | null
  scheduled_end_at?: string | null
  schedule_segments?: Array<{
    scheduled_start_at?: string | null
    scheduled_end_at?: string | null
  }>
  created_at?: string
  updated_at?: string
  // 兼容旧接口字段
  order_type?: string
  device_name?: string
  deviceName?: string
  use_device?: string
  highWellTestDeviceList?: SnakeDeviceRow[]
  shakeTestDeviceList?: SnakeDeviceRow[]
  deviceList?: SnakeDeviceRow[]
  device_list?: SnakeDeviceRow[]
  test_date?: string | null
  remark?: string
}

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    const text = String(value ?? "").trim()
    if (text) return text
  }
  return ""
}

function resolveVibrationDeviceName(order: SnakeOrder) {
  const deviceRows = [
    ...(order.highWellTestDeviceList || []),
    ...(order.shakeTestDeviceList || []),
    ...(order.deviceList || []),
    ...(order.device_list || [])
  ]
  const firstDevice = deviceRows[0]
  return firstText(
    order.use_device,
    order.device_name,
    order.deviceName,
    firstDevice?.deviceName,
    firstDevice?.device_name,
    firstDevice?.psi_name
  )
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
  maxDiameter: instrument.max_diameter || "",
  instrumentStatus: instrument.instrument_status,
  statusText: instrument.status_text,
  isCompleted: instrument.is_completed,
  completedAt: instrument.completed_at
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

const toPreExperimentAttachment = (attachment: SnakePreExperimentAttachment): VibrationPreExperimentAttachment => ({
  field: attachment.field,
  type: attachment.type,
  name: attachment.name,
  fileName: attachment.file_name,
  fileUrl: attachment.file_url,
  mediaPath: attachment.media_path,
  localPath: attachment.local_path,
  size: attachment.size,
  contentType: attachment.content_type
})

const toPreExperiment = (item: SnakePreExperiment): VibrationPreExperiment => ({
  id: item.id,
  orderId: item.order_id ?? item.order ?? 0,
  experimentNo: item.experiment_no ?? 0,
  tester: item.tester || "",
  summary: item.summary || {},
  records: Array.isArray(item.records) ? item.records : [],
  attachments: (item.attachments || []).map(toPreExperimentAttachment),
  exportDir: item.export_dir || "",
  clientSubmitId: item.client_submit_id || "",
  createdAt: item.created_at,
  updatedAt: item.updated_at
})

function toListItem(order: SnakeOrder): VibrationTableOrderListItem {
  const instruments = (order.instruments || []).map(toInstrument)
  const deviceName = resolveVibrationDeviceName(order)
  const scheduleSegments = Array.isArray(order.schedule_segments)
    ? order.schedule_segments
        .map((segment) => {
          const scheduledStartAt = segment.scheduled_start_at || ""
          const scheduledEndAt = segment.scheduled_end_at || ""
          if (!scheduledStartAt || !scheduledEndAt) return null
          return { scheduledStartAt, scheduledEndAt }
        })
        .filter(Boolean)
    : []
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
    testLocation: order.test_location || "",
    testPurpose: order.test_purpose || order.remark || "",
    others: order.others,
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
    deviceName: deviceName,
    useDevice: deviceName,
    instrumentCombination: order.instrument_combination || "",
    testSteps: order.test_steps || "",
    safetyRisks: order.safety_risks || "",
    instrumentCount: order.instrument_count ?? instruments.length,
    instruments,
    preExperiments: (order.pre_experiments || []).map(toPreExperiment),
    scheduledStartAt: order.scheduled_start_at || null,
    scheduledEndAt: order.scheduled_end_at || null,
    scheduleSegments: scheduleSegments as VibrationTableOrderListItem["scheduleSegments"],
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
    test_location: data.testLocation,
    test_purpose: data.testPurpose,
    others: data.others,
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
    device_name: data.useDevice || data.deviceName,
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

export function downloadVibrationTablePreExperimentZip(id: number) {
  return request<Blob>({
    url: `test/vibration-table/pre-experiment/download/${id}/`,
    method: "get",
    responseType: "blob"
  })
}

export function downloadVibrationTableOrderPreExperimentsZip(orderId: number) {
  return request<Blob>({
    url: `test/vibration-table/order/pre-experiments/download/${orderId}/`,
    method: "get",
    responseType: "blob"
  })
}
