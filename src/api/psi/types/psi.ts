export interface CreatePsiRequestData {
  psiModel: string
  psiSeria: string
  psiDate: string
  psiName: string
}

export interface UpdatePsiRequestData {
  id: string
  psiModel: string
  psiSeria: string
  psiName: string
}

export interface GetPsiRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：name number type */
  // id?: string
  name?: string
  number?: string
  type?: string
}

export interface GetPsiData {
  psi_id: string
  psi_name: string
  psimodel_name: string
  psimodel_id: string
  psi_date: string
  psi_serialnumber: string
  psi_status: number
  link?: any
}

export type GetPsiResponseData = ApiResponseData<{
  list: GetPsiData[]
  total: number
}>
