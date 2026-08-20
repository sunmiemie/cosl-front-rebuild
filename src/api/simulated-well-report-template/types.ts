export type SimulatedWellReportTemplateFieldObject = {
  nameCN: string
  nameEN: string
  type?: string
  defaultValue?: string
  unit?: string
  required?: boolean
  needsReview?: boolean
  rowCount?: number
  columns?: Array<{
    nameCN: string
    nameEN: string
    unit?: string
    needsReview?: boolean
  }>
  [key: string]: unknown
}

export type SimulatedWellReportTemplateField = string | SimulatedWellReportTemplateFieldObject

export type SimulatedWellReportTemplateFields = {
  test_products: SimulatedWellReportTemplateField[]
  match_instruments: SimulatedWellReportTemplateField[]
  test_items: SimulatedWellReportTemplateField[]
  evaluation_standards: SimulatedWellReportTemplateField[]
  transfer_data_records: SimulatedWellReportTemplateField[]
}

export type SimulatedWellReportTemplateListRequest = {
  keyword?: string
  currentPage?: number
  pageSize?: number
}

export type SimulatedWellReportTemplateListItem = {
  id: number
  report_no: string
  report_name: string
  report_name_en: string
  configured: boolean
  field_count: number
  updated_at: string
}

export type SimulatedWellReportTemplateListResponse = {
  code: number
  msg?: string
  data: {
    list: SimulatedWellReportTemplateListItem[]
    total: number
    currentPage: number
    pageSize: number
  }
}

export type SimulatedWellReportTemplateDetailResponse = {
  code: number
  msg?: string
  data: SimulatedWellReportTemplateFields & {
    id: number
    report_no: string
    report_name: string
    report_name_en: string
    updated_at: string
  }
}

export type ParseSimulatedWellReportTemplateDocxResponse = {
  code: number
  msg?: string
  data: SimulatedWellReportTemplateFields & {
    report_no: string
    report_name: string
    report_name_en: string
    raw_preview?: string[]
  }
}

export type CreateSimulatedWellReportTemplateRequest = SimulatedWellReportTemplateFields & {
  report_no: string
  report_name: string
  report_name_en?: string
}

export type UpdateSimulatedWellReportTemplateRequest = Partial<
  SimulatedWellReportTemplateFields & {
    report_name: string
    report_name_en: string
  }
>
