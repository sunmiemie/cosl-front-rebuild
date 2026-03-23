export type VibrationTableOrderListItem = {
  id: number
  orderNo: string
  type: string
  applicant: string
  deviceName: string
  level: string
  duration: number
  status: number
  statusText?: string
  testDate?: string
  remark?: string
}

export type VibrationTableOrderDetail = VibrationTableOrderListItem & {
  createdAt?: string
  updatedAt?: string
}
