export interface CreateEquipmentTypeRequestData {
  name: string
  des: string
}

export interface UpdateEquipmentTypeRequestData {
  id: string
  name: string
  des: string
}

export interface GetEquipmentTypeRequestData {
  currentPage: number
  size: number
  name?: string
  id?: string
}

export interface GetEquipmentTypeData {
  id: string
  name: string
  des: string
}

export type GetEquipmentTypeResponseData = ApiResponseData<{
  list: GetEquipmentTypeData[]
  total: number
}>
