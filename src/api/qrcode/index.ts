import { request } from "@/utils/service"

/**
 * 申请二维码图片
 */
export const getQRcodeImgApi = (data: any) => {
  return request({
    method: "post",
    url: "equipment/qrcode/img/",
    data
  })
}
