export interface HostModelOption {
  id: string
  name: string
}

type AnyRecord = Record<string, any>

const firstText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue
    const text = String(value).trim()
    if (text) return text
  }
  return ""
}

const removeInstanceSuffix = (value: string) => value.replace(/[-_#]\d+$/u, "").trim()

const isModelCode = (value: string) => /^[A-Za-z]+[-_][A-Za-z0-9]+$/u.test(value.trim())

const hasChineseText = (value: string) => /[\u3400-\u9fff]/u.test(value)

const isLegacyModelValue = (value: string, inferredName: string) => {
  const text = value.trim()
  if (!text || hasChineseText(text)) return false
  if (inferredName && hasChineseText(inferredName)) return true

  return (
    /^\d+$/u.test(text) ||
    isModelCode(text) ||
    /^[a-z]+[A-Z][A-Za-z0-9]*$/u.test(text) ||
    /^[A-Z0-9_&-]{3,}$/u.test(text)
  )
}

export const normalizeHostModelOptions = (rows: AnyRecord[] = []): HostModelOption[] => {
  const optionMap = new Map<string, HostModelOption>()

  rows.forEach((row) => {
    const name = firstText(row.psimodel_name, row.name, row.model_name, row.modelName)
    if (!name || optionMap.has(name)) return

    optionMap.set(name, {
      id: firstText(row.psimodel_id, row.id, name),
      name
    })
  })

  return Array.from(optionMap.values())
}

export const extractHostModelList = (response: any): AnyRecord[] => {
  const payload = response?.data ?? response ?? {}
  const list = Array.isArray(payload)
    ? payload
    : payload.list ?? payload.records ?? payload.results ?? payload.items ?? []

  return Array.isArray(list) ? list : []
}

export const getHostModelDisplayName = (row: AnyRecord) => {
  const deviceName = firstText(row.deviceName, row.device_name, row.psi_name)
  const deviceModelName = removeInstanceSuffix(deviceName)
  const explicitModelName = firstText(row.psimodel_name, row.host_model_name, row.hostModelName)

  if (deviceModelName && explicitModelName && isLegacyModelValue(explicitModelName, deviceModelName)) {
    return deviceModelName
  }
  if (explicitModelName) return removeInstanceSuffix(explicitModelName)

  const model = firstText(row.model, row.model_name, row.modelName)

  if (deviceModelName && (!model || isLegacyModelValue(model, deviceModelName))) return deviceModelName

  return removeInstanceSuffix(model)
}

export const getHostModelId = (row: AnyRecord) => firstText(row.psimodel_id, row.model_id, row.modelId, row.psimodelId)
