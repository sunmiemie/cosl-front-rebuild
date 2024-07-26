// FirstLevelDirectory

export interface GetFirstLevelDirectoryRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
}

export interface FirstLevelDirectory {
  id: string
  name: string
}

export type GetFirstLevelDirectoryResponseData = ApiResponseData<{
  list: FirstLevelDirectory[]
  total: number
}>

export interface CreateFirstLevelDirectoryRequestData {
  name: string
}

// SecondLevelDirectory

export interface CreateSecondLevelDirectoryRequestData {
  name: string
  firstLevelDirectoryId: string
}

// Directory

export interface GetDirectoryRequestData {
  currentPage?: number
  size?: number
  name?: string
  id?: string
  isTree?: boolean
}

interface Directory {
  id: string
  name: string
}

export type GetDirectoryResponseData = ApiResponseData<{
  list: Directory[]
  total: number
}>

// CheckItem

export interface GetCheckItemRequestData {
  currentPage: number
  size: number
  secondLevelDirectoryId: string
}

export interface CheckItem {
  id: string
  name: string
  operation_desc: string
}

export type GetCheckItemResponseData = ApiResponseData<{
  list: CheckItem[]
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
