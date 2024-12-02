import { request } from "@/utils/service"

export function getWorkTimeDataApi(params) {
  return request({
    url: "data/work-time/list",
    method: "get",
    params
  })
}
