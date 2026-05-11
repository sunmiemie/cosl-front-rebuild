import { request } from "@/utils/service"

export interface TaskCenterItem {
  id: string
  kind: string
  group: string
  title: string
  summary: string
  statusText: string
  targetRoute: string
  query: Record<string, string>
  permissionCode: string
  createdAt: string
}

export interface TaskCenterResponseData {
  code: number
  msg?: string
  data: {
    list: TaskCenterItem[]
    total: number
  }
}

export function getPendingTaskCenterApi(params?: { limit?: number }) {
  return request<TaskCenterResponseData>({
    url: "data/task-center/pending",
    method: "get",
    params
  })
}
