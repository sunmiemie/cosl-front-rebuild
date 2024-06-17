import { request } from "@/utils/service"
import type * as DailyInspection from "./types/index.ts"

export const getDailyInspection = (currentMonth?: string) => {
  return request<DailyInspection.DailyInspection>({
    url: "/everytest/Dailyinspections",
    method: "get",
    params: currentMonth
  })
}
