import { request } from "@/utils/service"

export interface QRCodeImageResponseData {
  code: number
  message: string
  data: Record<string, string>
}

/**
 * 申请二维码图片
 */
export const getQRcodeImgApi = (data: any) => {
  return request<QRCodeImageResponseData>({
    method: "post",
    url: "equipment/qrcode/img/",
    data
  })
}
