export interface CreateSupplierRequestData {
  name: string
}

interface GetSupplierData {
  number: string
  name: string
}

export type GetSupplierResponseData = ApiResponseData<{
  list: GetSupplierData[]
  total: number
}>

export interface UpdateSupplierRequestData {
  id: string
  name: string
}
