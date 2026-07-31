import { request } from "@/utils/service"
import type { DashboardResponse } from "./types"

export function getCalibrationDashboardApi() {
  return request<DashboardResponse>({
    url: "test/calibration-well/dashboard/",
    method: "get"
  })
}
