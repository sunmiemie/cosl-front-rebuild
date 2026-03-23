export type HighTemperatureOrderListItem = {
  id: number
  taskNumber: string
  applicant: string
  deviceName: string
  targetTemp: number | string
  status: number
  statusText?: string
  testDate?: string
}

export type HighTemperatureOrderDetail = HighTemperatureOrderListItem & {
  testPlatform?: string
  runTime?: number
  deviceNumber?: string
  remark?: string
  feedbackReason?: string
  createdAt?: string
  updatedAt?: string
}
