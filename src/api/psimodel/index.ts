import { request } from "@/utils/service"

export function createPsiModelDataApi(data: any) {
  return request({
    url: "equipment/psimodel/add",
    method: "post",
    data
  })
}

/** 删 */
export function deletePsiModelDataApi(id: string) {
  return request({
    url: `equipment/psimodel/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updatePsiModelDataApi(data: any) {
  return request({
    url: "equipment/psimodel/update",
    method: "post",
    data
  })
}

/** 查 */
export function getPsiModelDataApi(params: any) {
  return request<any>({
    url: "equipment/psimodel/list",
    method: "get",
    params
  })
}
