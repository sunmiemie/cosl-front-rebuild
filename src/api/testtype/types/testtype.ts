export interface CreateTestTypeRequestData {
  name: string
}

export interface UpdateTestTypeRequestData {
  id: string
  name: string
}

interface GetTestTypeData {
  number: string
  name: string
  processCount: string
}

export type GetTestTypeResponseData = ApiResponseData<{
  list: GetTestTypeData[]
  total: number
}>
