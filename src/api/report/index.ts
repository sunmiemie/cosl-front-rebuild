import { request } from "@/utils/service"
import type * as TestType from "./types/report"
import type * as TestMange from "@/api/testMangelist/types"

/** 查 */
export function getReportDataApi(params: {
  size: number
  serial: string | undefined
  batchId?: string | undefined
  id: string | undefined
  currentPage: number
  type: string | undefined
  user: string | undefined
  dateTimeRange: string | undefined
  instrument: string | undefined
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/list",
    method: "get",
    params
  })
}
export function getBugReportDataApi(params: {
  pageSize: number
  serial: string | undefined
  batchId?: string | undefined
  id: string | undefined
  currentPage: number
  user: string | undefined
}) {
  return request<TestType.GetBugReportResponseData>({
    url: "data/report/bug-report-list",
    method: "get",
    params
  })
}
export function getBatchReportDataApi(params: {
  pageSize: number
  currentPage: number
  id: string | undefined
  user: string | undefined
  batchId?: string | undefined
}) {
  return request<TestType.GetBatchReportResponseData>({
    url: "data/report/batch-report-list",
    method: "get",
    params
  })
}
export const getTransactionTree = (): Promise<TestMange.getTestMangePathType> => {
  return request<TestMange.getTestMangePathType>({
    url: "data/temp-transaction-tree",
    method: "get"
  })
}
export const getboardsinfoForBugReport = (params: any) => {
  return request<TestMange.getBordsInfoType>({
    url: "/data/temp-transaction-boardlist",
    method: "get",
    params
  })
}
export const generateBugReport = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/bug-report-generate",
    method: "post",
    data
  })
}

export const generateBatchReport = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/batch-report-generate",
    method: "post",
    data
  })
}

export const setDownloadSuccessApi = (report_id: number, report_type: string) => {
  return request<TestType.ReportActionResponseData>({
    url: `data/report/set-download-success/${report_id}`,
    method: "post",
    data: { report_type }
  })
}

export const generateDevBugReport = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/dev-bug-report-generate",
    method: "post",
    data
  })
}
export const generateDevBatchReport = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/dev-batch-report-generate",
    method: "post",
    data
  })
}

export function getTempReportDataApi(params: {
  size: number
  serial: string | undefined
  batchId?: string | undefined
  id: string | undefined
  currentPage: number
  type: string | undefined
  user: string | undefined
  dateTimeRange: string | undefined
  instrument: string | undefined
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/devreport/list",
    method: "get",
    params
  })
}
export function getSingleReportDataApi(params: any) {
  return request<TestType.GetSingleReportResponseData>({
    url: "data/report/single",
    method: "get",
    params
  })
}
export function getSingleDevReportDataApi(params: any) {
  return request<TestType.GetSingleReportResponseData>({
    url: "data/devreport/single",
    method: "get",
    params
  })
}

export function getReportCheckDataApi(params: {
  size: number
  serial: string | undefined
  currentPage: number
  type: string | undefined
  user: string | undefined
  userId?: number
}) {
  return request<TestType.GetReportResponseData>({
    url: "data/report/check/list",
    method: "get",
    params
  })
}

export const checkReportDataApi = (params: any) => {
  return request<TestType.CheckReportResponseData>({
    url: "data/report/check/operate",
    method: "get",
    params,
    silentError: true
  })
}

export const restoreReportSourceApi = (data: FormData) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/check/source-file",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}
export const checkTempReportDataApi = (params: any) => {
  return request<TestType.CheckReportResponseData>({
    url: "data/devreport/check/operate",
    method: "get",
    params
  })
}

export const checkReportPassApi = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/check/pass",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const retryReportAssistantSyncApi = (data: { id: number | string }) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/assistant-sync/retry",
    method: "post",
    data
  })
}

export const checkTempReportPassApi = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/devreport/check/pass",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const checkReportFeedbackApi = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/report/check/feedback",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const checkTempReportFeedbackApi = (data: any) => {
  return request<TestType.ReportActionResponseData>({
    url: "data/devreport/check/feedback",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const generateQuestionUnitApi = (data: any) => {
  return request({
    url: "test/questionunit/add/",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}
export const generateDevQuestionUnitApi = (data: any) => {
  return request({
    url: "test/devquestionunit/add/",
    headers: { "Content-Type": "multipart/form-data" },
    method: "post",
    data
  })
}

export const generateReportPdfApi = (params: any) => {
  return request({
    url: "data/report/pdf/generate-pdf",
    method: "get",
    params
  })
}

/**
 * 生成功能测试报告 pdf
 */
export const generateFunReportPdfApi = (params: any) => {
  return request({
    url: "data/report/pdf/generate-functional-pdf",
    method: "get",
    params
  })
}

export const generateTempReportPdfApi = (params: any) => {
  return request({
    url: "data/devreport/pdf/generate-dev-pdf",
    method: "get",
    params
  })
}
export const generateTempReportFunPdfApi = (params: any) => {
  return request({
    url: "data/dev-report/pdf/generate-dev-functional-pdf",
    method: "get",
    params
  })
}
