import { request } from "@/utils/service"
import type * as Instrument from "./types/instrument"


// 仪器管理

export function createProductDataApi(data: Instrument.CreateInstrumentRequestData) {
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
export function updateProductDataApi(data: Instrument.UpdateInstrumentRequestData) {
    return request({
        url: "/equipment/instrumenttype/update",
        method: "post",
        data
    })
}

/** 查 */
export function getProductDataApi(params: Instrument.GetInstrumentRequestData) {
    return request<Instrument.GetInstrumentResponseData>({
        url: "equipment/instrumenttype/list",
        method: "get",
        params
    })
}
