export interface GetPermissionData {
  id: number
  name: string
}

export type GetPermissionResponseData = ApiResponseData<GetPermissionData[]>
