import { request } from "@/utils/service"

// 仪器管理

export function createProductDataApi(data: any) {
  return request({
    url: "equipment/instrumenttype/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteProductDataApi(id: string) {
  return request({
    url: `equipment/instrument/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateProductDataApi(data: any) {
  return request({
    url: "/equipment/instrumenttype/update",
    method: "post",
    data
  })
}

/** 查 */
export function getProductDataApi(params: any) {
  return request<any>({
    url: "equipment/instrumenttype/list",
    method: "get",
    params
  })
}
