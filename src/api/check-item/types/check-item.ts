export interface GetDirectoryRequestData {
  currentPage?: number
  size?: number
  name?: string
  id?: string
  isTree?: boolean
}

export interface GetDirectory {
  id: string
  name: string
}

export type GetDirectoryResponseData = ApiResponseData<{
  list: GetDirectory[]
  total: number
}>

export interface GetCheckItemRequestData {
  currentPage: number
  size: number
  secondLevelDirectoryId: string
}

export interface GetCheckItem {
  id: string
  name: string
  operation_desc: string
}

export type GetCheckItemResponseData = ApiResponseData<{
  list: GetCheckItem[]
  total: number
}>

export interface CreateCheckItemRequestData {
  name: string
  operation_desc: string
  secondLevelDirectoryId: string
}

export interface UpdateCheckItemRequestData {
  id: string
  name: string
  operation_desc: string
}
