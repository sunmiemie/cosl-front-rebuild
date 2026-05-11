export interface SignatureInfo {
  userId: number
  username: string
  nickname?: string | null
  hasSignature: boolean
  signatureId?: number | null
  originalFilename?: string | null
  mimeType?: string | null
  fileSize: number
  sha256?: string | null
  remark?: string | null
  uploadedAt?: string | null
  updatedAt?: string | null
  imageUrl?: string | null
}

export interface SignatureListRequest {
  currentPage: number
  pageSize: number
  userId?: string
  username?: string
  nickname?: string
  hasSignature?: string
}

export type SignatureDetailResponse = ApiResponseData<SignatureInfo>

export type SignatureListResponse = ApiResponseData<{
  list: SignatureInfo[]
  total: number
  currentPage: number
  pageSize: number
}>
