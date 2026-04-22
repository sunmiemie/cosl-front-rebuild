export interface SimulatedWellReportTemplateListItem {
  id: number
  report_no: string
  report_name: string
  configured: boolean
  field_count: number
  updated_at: string
}

export interface SimulatedWellReportTemplateListRequest {
  keyword?: string
  currentPage?: number
  pageSize?: number
}

export interface SimulatedWellReportTemplateListResponse {
  code: number
  msg?: string
  data: {
    list: SimulatedWellReportTemplateListItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export interface SimulatedWellReportTemplateDetail {
  id: number
  report_no: string
  report_name: string
  test_products: string[]
  match_instruments: string[]
  test_items: string[]
  evaluation_standards: string[]
  updated_at: string
}

export interface SimulatedWellReportTemplateDetailResponse {
  code: number
  msg?: string
  data: SimulatedWellReportTemplateDetail
}

export interface CreateSimulatedWellReportTemplateRequest {
  report_no: string
  report_name: string
  test_products?: string[]
  match_instruments?: string[]
  test_items?: string[]
  evaluation_standards?: string[]
}

export interface UpdateSimulatedWellReportTemplateRequest {
  test_products: string[]
  match_instruments: string[]
  test_items: string[]
  evaluation_standards: string[]
}

export interface ParseSimulatedWellReportTemplateDocxResponse {
  code: number
  msg?: string
  data: {
    report_no: string
    report_name: string
    test_products: string[]
    match_instruments: string[]
    test_items: string[]
    evaluation_standards: string[]
    raw_preview: string[]
  }
}
