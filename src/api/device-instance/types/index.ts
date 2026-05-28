export type DeviceInstanceStatus = "normal" | "fault" | "maintenance" | "repair"

export type DeviceOnlineStatus = "standby" | "testing" | "offline" | "abnormal" | "paused" | "finished" | "unknown"

export interface DeviceInstanceQuery {
  currentPage: number
  size: number
  serialNumber?: string
  deviceName?: string
  testBench?: string
  status?: DeviceInstanceStatus
}

export interface DeviceInstancePayload {
  id?: string | number
  serialNumber: string
  deviceName: string
  testBench: string
  model: string
  status: DeviceInstanceStatus
  onlineStatus: DeviceOnlineStatus
}

export interface DeviceInstanceData {
  id?: string | number
  psi_id?: string | number
  deviceId?: string | number
  device_id?: string | number
  serialNumber?: string
  serial_number?: string
  psi_serialnumber?: string
  deviceName?: string
  device_name?: string
  psi_name?: string
  testBench?: string
  test_bench?: string
  model?: string
  modelName?: string
  model_name?: string
  psimodel_name?: string
  status?: DeviceInstanceStatus | number | string
  deviceStatus?: DeviceInstanceStatus | number | string
  device_status?: DeviceInstanceStatus | number | string
  psi_status?: number
  onlineStatus?: DeviceOnlineStatus | number | string
  online_status?: DeviceOnlineStatus | number | string
  onlineStatusText?: string
  online_status_text?: string
}

export interface DeviceInstanceListData {
  list?: DeviceInstanceData[]
  records?: DeviceInstanceData[]
  results?: DeviceInstanceData[]
  items?: DeviceInstanceData[]
  total?: number
  count?: number
}

export type DeviceInstanceListResponse = ApiResponseData<DeviceInstanceListData | DeviceInstanceData[]>

export interface DeviceInstanceStatsData {
  total?: number
  normal?: number
  maintenance?: number
  repair?: number
  fault?: number
}

export type DeviceInstanceStatsResponse = ApiResponseData<DeviceInstanceStatsData>
