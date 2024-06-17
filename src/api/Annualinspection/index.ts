/**
 * 年检
 */

import { request } from "@/utils/service"

export const getAnnualinspection = (data) => {
  return request({
    url: "/equipment/update/annualinspection/",
    method: "post",
    headers: { "Content-Type": "multipart/form-data" },
    data
  })
}