export interface GetPermissionData {
  id: number
  name: string
  code?: string
  category?: string
  action?: string
  scope?: string
  description?: string
  sort?: number
  isBuiltin?: boolean
  categoryOrder?: number
}

export type GetPermissionResponseData = ApiResponseData<GetPermissionData[]>

export interface SavePermissionRequestData {
  id?: number
  name: string
  code?: string
  category?: string
  action?: string
  scope?: string
  description?: string
  sort?: number
}
