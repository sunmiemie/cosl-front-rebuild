import { request } from "@/utils/service"
import type * as FixtureModel from "./types/fixturemodel"

export function createPsiModelDataApi(data: FixtureModel.CreateFixtureModelRequestData) {
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
export function updatePsiModelDataApi(data: FixtureModel.UpdateFixtureModelRequestData) {
    return request({
        url: "equipment/psimodel/update",
        method: "post",
        data
    })
}

/** 查 */
export function getPsiModelDataApi(params: FixtureModel.GetFixtureModelRequestData) {
    return request<FixtureModel.GetFixtureModelResponseData>({
        url: "equipment/psimodel/list",
        method: "get",
        params
    })
}
