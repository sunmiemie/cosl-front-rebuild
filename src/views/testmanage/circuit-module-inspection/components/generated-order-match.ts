function normalizeSerial(value: unknown) {
  return String(value ?? "").trim()
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1
}

export function isGeneratedSerialMatch(sourceSerial: unknown, generatedSerial: unknown, quantity: unknown = 1) {
  const source = normalizeSerial(sourceSerial)
  const generated = normalizeSerial(generatedSerial)
  if (!source || !generated) return false
  if (source === generated) return true

  const splitCount = normalizeQuantity(quantity)
  if (splitCount <= 1) return false

  const prefix = `${source}-`
  if (!generated.startsWith(prefix)) return false

  const suffix = generated.slice(prefix.length)
  if (!/^\d+$/.test(suffix)) return false

  const index = Number(suffix)
  return index >= 1 && index <= splitCount
}
