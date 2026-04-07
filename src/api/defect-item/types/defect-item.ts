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

export interface CreateFirstLevelDirectoryResponseData {
  code: number
  message: string
  id: string
  name: string
}

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

// DefectItem

export interface GetDefectItemRequestData {
  currentPage: number
  size: number
  secondLevelDirectoryId: string
}

export interface DefectItem {
  id: string
  name: string
  problem_desc: string
}

export type GetDefectItemResponseData = ApiResponseData<{
  list: DefectItem[]
  total: number
}>

export interface CreateDefectItemRequestData {
  name: string
  problem_desc: string
  secondLevelDirectoryId: string
}

export interface UpdateDefectItemRequestData {
  id: string
  name: string
  problem_desc: string
}
