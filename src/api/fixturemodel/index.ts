import { request } from "@/utils/service"
import type * as FixtureModel from "./types/fixturemodel"

export function createFixtureModelDataApi(data: FixtureModel.CreateFixtureModelRequestData) {
  return request({
    url: "equipment/fixturemodel/add",
    method: "post",
    data
  })
}

/** 删 */
export function deleteFixtureModelDataApi(id: string) {
  return request({
    url: `equipment/fixturemodel/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateFixtureModelDataApi(data: {
  des: string;
  supplier: string;
  name: string;
  count: string;
  id: string;
  type: string
}) {
  return request({
    url: "equipment/fixturemodel/update",
    method: "post",
    data
  })
}

// /** 查 */ 获取夹具型号
export function getFixtureModelDataApi(params: FixtureModel.GetFixtureModelRequestData) {
  return request<FixtureModel.GetFixtureModelResponseData>({
    url: "equipment/fixturemodel/list",
    method: "get",
    params
  })
}
