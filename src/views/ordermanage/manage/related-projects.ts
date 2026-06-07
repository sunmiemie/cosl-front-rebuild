export interface RelatedProjectRow {
  sn: string
  name: string
  spec: string
  qty: number
  device: string
  hours: number
  inspector: string
  doneAt: string
  commissionSampleName: string
  commissionSampleSpec: string
}

const text = (...values: unknown[]) => {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== "")
  return value === undefined ? "" : String(value).trim()
}

const numberValue = (...values: unknown[]) => {
  const value = values.find((item) => item !== undefined && item !== null && String(item).trim() !== "")
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const getCommissionNo = (row: any) => {
  return text(row?.commNo, row?.commissionNo, row?.commission_no, row?.["委托单编号"])
}

const normalizeRelatedProject = (row: any): RelatedProjectRow => ({
  sn: text(row?.sn, row?.snNumber, row?.sn_number, row?.serialNumber, row?.["SN号"]),
  name: text(row?.name, row?.sampleName, row?.sample_name, row?.["样品名称"]),
  spec: text(row?.spec, row?.specModel, row?.spec_model, row?.["规格型号"]),
  qty: numberValue(row?.qty, row?.quantity, row?.sample_quantity, row?.["数量"]),
  device: text(row?.device, row?.deviceName, row?.device_name, row?.["检测设备"]),
  hours: numberValue(row?.hours, row?.workHours, row?.work_hours, row?.["工时"]),
  inspector: text(row?.inspector, row?.tester, row?.test_person, row?.["检测人"]),
  doneAt: text(row?.doneAt, row?.completedAt, row?.completed_at, row?.finish_time, row?.["检测完成时间"]),
  commissionSampleName: text(row?.commissionSampleName, row?.commission_sample_name, row?.["委托样品名称"]),
  commissionSampleSpec: text(row?.commissionSampleSpec, row?.commission_sample_spec, row?.["委托样品规格"])
})

export const getRelatedProjectsByCommissionNo = (rows: any[], commissionNo: string) => {
  const targetNo = commissionNo.trim()
  if (!targetNo) return []
  return (rows || []).filter((row) => getCommissionNo(row) === targetNo).map(normalizeRelatedProject)
}
