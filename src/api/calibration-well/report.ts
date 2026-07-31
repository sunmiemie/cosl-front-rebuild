import { request } from "@/utils/service"
import type { CalibrationReport, ReportReviewStatus } from "@/views/scale-well-cluster/report-review/types"

export interface ApiCalibrationReport {
  id: number
  report_no: string
  order_id: number
  task_number: string
  serial_number: string
  tester_name: string
  test_date: string | null
  status: number
  status_text?: string
  report_json: {
    appendixA?: CalibrationReport["appendixA"]
    appendixB?: CalibrationReport["appendixB"]
    appendixC?: CalibrationReport["appendixC"]
    calibrationSummary?: string
  }
  kc: string | number | null
  submit_time?: string | null
  audit_time?: string | null
  reviewer_id?: number | null
  review_remark?: string
  created_at?: string
  updated_at?: string
}

export interface CalibrationReportListResponse {
  code: number
  msg?: string
  data: {
    list: ApiCalibrationReport[]
    total: number
    page: number
    pageSize: number
  }
}

const STATUS_MAP: Record<number, ReportReviewStatus> = {
  1: "pending",
  2: "approved",
  3: "rejected"
}

export function mapApiStatusToReview(status: number): ReportReviewStatus {
  return STATUS_MAP[status] ?? "pending"
}

export function mapReviewStatusToApi(status: ReportReviewStatus | ""): number | undefined {
  if (status === "pending") return 1
  if (status === "approved") return 2
  if (status === "rejected") return 3
  return undefined
}

export function mapApiToReport(dto: ApiCalibrationReport): CalibrationReport {
  const json = dto.report_json || {}
  const appendixA = json.appendixA
  const appendixB = json.appendixB
  const appendixC = json.appendixC

  return {
    id: dto.report_no || String(dto.id),
    workOrderId: dto.task_number,
    toolType: appendixB?.toolTypeName || appendixA?.serialNumber || "",
    serialNumber: dto.serial_number || appendixA?.serialNumber || "",
    engineer: dto.tester_name || appendixA?.engineer || "",
    testDate: dto.test_date || appendixA?.testDate || "",
    location: appendixA?.location || "",
    kc: dto.kc != null && dto.kc !== "" ? Number(dto.kc) : appendixB?.kc ?? null,
    hiWell: appendixB?.hiWell || appendixC?.hiWell || "",
    loWell: appendixB?.loWell || appendixC?.loWell || "",
    hiApi: appendixB?.hiApi ?? appendixC?.hiApi ?? 0,
    loApi: appendixB?.loApi ?? appendixC?.loApi ?? 0,
    softVer: appendixA?.softVer || "",
    status: mapApiStatusToReview(dto.status),
    submittedAt: dto.submit_time || dto.created_at || "",
    appendixA: appendixA || {
      serialNumber: dto.serial_number,
      testDate: dto.test_date || "",
      engineer: dto.tester_name,
      softVer: "",
      cycleHours: "",
      location: "",
      useWell: false,
      useJig: false,
      beforeData: { ka: null, kb: null, kc: null, ba: null, bb: null, bc: null },
      currentData: { ka: null, kb: null, kc: null, ba: null, bb: null, bc: null },
      remark: ""
    },
    appendixB: appendixB || {
      toolTypeName: "",
      serialNumber: dto.serial_number,
      engineer: dto.tester_name,
      testDate: dto.test_date || "",
      qcEngineer: "",
      qcDate: "",
      loWell: "",
      hiWell: "",
      loApi: 0,
      hiApi: 0,
      ka: null,
      kb: null,
      kc: dto.kc != null ? Number(dto.kc) : null,
      ba: null,
      bb: null,
      bc: null
    },
    appendixC: appendixC || {
      recordNo: "",
      serialNumber: dto.serial_number,
      engineer: dto.tester_name,
      testDate: dto.test_date || "",
      hiWell: "",
      loWell: "",
      hiApi: 0,
      loApi: 0,
      remark: dto.review_remark || ""
    }
  }
}

export function getCalibrationReportListApi(params: {
  page?: number
  pageSize?: number
  keyword?: string
  status?: number
  taskNumber?: string
}) {
  return request<CalibrationReportListResponse>({
    url: "test/calibration-well/report/list/",
    method: "get",
    params
  })
}

export function getCalibrationReportDetailApi(id: number) {
  return request<{ code: number; data: ApiCalibrationReport; msg?: string }>({
    url: `test/calibration-well/report/detail/${id}/`,
    method: "get"
  })
}

export function reviewCalibrationReportApi(
  id: number,
  data: { action: "approve" | "reject"; remark?: string; abnormal?: boolean }
) {
  return request<{ code: number; data: ApiCalibrationReport; msg?: string }>({
    url: `test/calibration-well/report/review/${id}/`,
    method: "post",
    data
  })
}
