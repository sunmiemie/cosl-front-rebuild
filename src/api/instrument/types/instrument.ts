export interface CreateInstrumentRequestData {
  name: string
  type: string
}

export interface UpdateInstrumentRequestData {
  id: string
  name: string
  type: string
}

export interface GetInstrumentRequestData {
  currentPage?: number
  size?: number
  name?: string
  id?: string
  isTree?: boolean
  paging?: boolean
}

export interface GetInstrumentData {
  id: string
  name: string
  boardmodel: string
}

export type GetInstrumentResponseData = ApiResponseData<{
  list: GetInstrumentData[]
  total: number
}>
