export type VibrationInstrument = {
  id?: number
  instrumentName: string
  snNumbers: string
  quantity: number
  weight?: string
  length?: string
  maxDiameter?: string
  instrumentStatus?: number
  statusText?: string
  isCompleted?: boolean
  completedAt?: string | null
}

export type VibrationPreExperimentAttachment = {
  field?: string
  type?: string
  name?: string
  fileName?: string
  fileUrl?: string
  mediaPath?: string
  localPath?: string
  size?: number
  contentType?: string
}

export type VibrationPreExperiment = {
  id: number
  orderId: number
  experimentNo: number
  tester?: string
  summary: Record<string, any>
  records: Array<Record<string, any>>
  attachments: VibrationPreExperimentAttachment[]
  exportDir?: string
  clientSubmitId?: string
  createdAt?: string
  updatedAt?: string
}

export type VibrationTableOrderListItem = {
  id: number
  tableNo: string
  taskNumber: string
  applicant: string
  applicantPhone?: string
  testApplicationUnit?: string
  testApplicationUnitManager?: string
  applicationDate?: string
  researchNumber?: string
  projectBudgetNumber?: string
  projectName?: string
  client?: string
  plannedTime?: string
  testPurpose?: string
  testType?: string
  vibrationDirection?: string
  level?: string
  acceleration?: string
  duration?: string
  slope?: string
  frequency?: string
  vibrationTimes?: number
  projectMembers?: string
  equipmentList?: string
  instrumentCombination?: string
  testSteps?: string
  safetyRisks?: string
  instrumentCount?: number
  instruments?: VibrationInstrument[]
  preExperiments?: VibrationPreExperiment[]
  scheduledStartAt?: string | null
  scheduledEndAt?: string | null
  scheduleSegments?: Array<{
    scheduledStartAt: string
    scheduledEndAt: string
  }>
  status: number
  statusText?: string
}

export type VibrationTableOrderDetail = VibrationTableOrderListItem & {
  instruments: VibrationInstrument[]
  createdAt?: string
  updatedAt?: string
}
