import { request } from "@/utils/service"
import type * as Fixture from "./types/fixture"

export function createFixtureDataApi(data: Fixture.CreateFixtureRequestData) {
  return request({
    url: "equipment/fixture/add",
    method: "post",
    data
  })
}

/** 改 */
export function updateFixtureDataApi(data: Fixture.UpdateFixtureRequestData) {
  return request({
    url: "equipment/fixture/update",
    method: "post",
    data
  })
}

/** 查 */
export function getFixtureDataApi(params: {
  size: number
  model: string | undefined
  currentPage: number
  seria: string | undefined
  status: string | undefined
}) {
  return request<Fixture.GetFixtureResponseData>({
    url: "equipment/fixture/list",
    method: "get",
    params
  })
}

export function getFixtureModelTypes() {
  return request({
    url: "equipment/fixturemodel/types",
    method: "get"
  })
}
