export interface CreateEquipmentRequestData {
  name: string
  type: string
  seria: string
}

export interface UpdateEquipmentRequestData {
  id: string
  name: string
  type: string
  seria: string
}

export interface GetEquipmentRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：名称 */
  name?: string
  /** 查询参数：ID */
  id?: string
}

export interface GetEquipmentData {
  id: string
  name: string
  type: string
  des: string
}

export type GetEquipmentResponseData = ApiResponseData<{
  list: GetEquipmentData[]
  total: number
}>
