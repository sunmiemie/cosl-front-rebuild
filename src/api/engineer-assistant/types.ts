export type EngineerAssistantBaseResponse<T> = {
  code: number
  msg?: string
  data: T
}

export type EngineerAssistantListData<T> = {
  list: T[]
  total: number
  source?: string
}

export type EngineerAssistantUser = {
  id: string
  userId: string
  name: string
  userName: string
  departmentId?: string
  departmentName?: string
  raw?: unknown
}

export type EngineerAssistantTestType = {
  id: string
  number?: string
  typeId: string
  name: string
  typeName: string
  raw?: unknown
}

export type EngineerAssistantTestStatus = {
  value: string
  label: string
  lable?: string
  raw?: unknown
}

export type EngineerAssistantApplicationForm = {
  testId: string
  testType: string
  testTypeName?: string
  status?: string
  zt?: string
  baseInfo?: unknown
  instruments?: unknown[]
  devices?: unknown[]
  users?: unknown[]
  raw?: unknown
}

export type GetEngineerAssistantUsersResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantUser>
>
export type GetEngineerAssistantTestTypesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestType>
>
export type GetEngineerAssistantTestStatusesResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantTestStatus>
>
export type GetEngineerAssistantApplicationFormsResponse = EngineerAssistantBaseResponse<
  EngineerAssistantListData<EngineerAssistantApplicationForm>
>
export type GetEngineerAssistantApplicationFormDetailResponse =
  EngineerAssistantBaseResponse<EngineerAssistantApplicationForm>

export type PushEngineerAssistantProcessesBody = {
  processDtoList: Array<{
    testTypeId: string
    testTypeName: string
    list: Array<{
      processId: string
      processName: string
      processDescription: string
    }>
  }>
}

export type PushEngineerAssistantEquipmentBody = {
  testEquipmentDtoList: Array<{
    testTypeId: string
    equipmentId: string
    equipmentName: string
    sn?: string
  }>
}

export type EngineerAssistantScheduleInfo = {
  testId: string
  testType: string
  equipmentId: string
  startTime: string
  endTime: string
}

export type PushEngineerAssistantSchedulesBody = {
  schedulesInfo: EngineerAssistantScheduleInfo[]
}

export type ChangeEngineerAssistantStatusBody = {
  testType: string
  id: string
  status: string
  description: string
}

export type PushEngineerAssistantReportsBody = {
  testReportList: Array<{
    id: string
    testType: string
    status: string
    data: Array<{
      filename: string
      equipmentId: string
      fileContent: string
      description: string
      status: string
    }>
  }>
}

export type EngineerAssistantCommissionOrderSample = {
  id: string
  commissionOrderId: string
  sampleName: string
  category: string
  specModel?: string
  manufacturer?: string
  batchNo?: string
  sn?: string
  materialNo?: string
  testContent?: string
  number: number
}

export type EngineerAssistantCommissionOrder = {
  id: string
  commissionId: string
  budgetId?: string
  commissionOrg: string
  userName: string
  userId: string
  departmentId?: string
  departmentName?: string
  phone?: string
  samples: EngineerAssistantCommissionOrderSample[]
}

export type PushEngineerAssistantCommissionOrdersBody = {
  orderList: EngineerAssistantCommissionOrder[]
}

export type EngineerAssistantCommissionBinding = {
  applicationNum?: string
  orderId?: string
  sampleId?: string
  boardId?: string
  applicationId?: string
  fpNumber?: string
  raw?: unknown
}

export type GetEngineerAssistantCommissionBindingsParams = {
  applicationNum?: string
}

export type PushEngineerAssistantCommissionOrdersResponse = EngineerAssistantBaseResponse<unknown>
export type GetEngineerAssistantCommissionBindingsResponse = EngineerAssistantBaseResponse<
  EngineerAssistantCommissionBinding[]
>
