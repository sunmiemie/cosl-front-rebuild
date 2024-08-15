import type * as Supplier from "@/api/supplier/types/supplier"
import { request } from "@/utils/service"

export function createSupplierDataApi(data: Supplier.CreateSupplierRequestData) {
  return request({
    url: "data/supplier/add",
    method: "post",
    data
  })
}

export function getSupplierDataApi(params: { size: number; currentPage: number; name?: string }) {
  return request<Supplier.GetSupplierResponseData>({
    url: "data/supplier/list",
    method: "get",
    params
  })
}

export function updateSupplierDataApi(data: Supplier.UpdateSupplierRequestData) {
  return request({
    url: "data/supplier/update",
    method: "post",
    data
  })
}
