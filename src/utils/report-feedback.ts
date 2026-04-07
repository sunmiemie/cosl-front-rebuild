/** 审核打回/疑问工单上传时剔除图片等大字段，避免 413 Request Entity Too Large */

const IMAGE_FIELD_KEYS = new Set(["save", "url", "img", "image", "images", "preview", "src", "pic", "pics"])

const isHeavyString = (value: unknown): boolean => {
  return typeof value === "string" && (value.startsWith("data:") || value.length > 2048)
}

/** 递归剔除图片/base64 等大字段，保留业务文本与结构 */
export const stripHeavyPayload = <T>(data: T): T => {
  if (Array.isArray(data)) {
    return data.filter((item) => !isHeavyString(item)).map((item) => stripHeavyPayload(item)) as T
  }
  if (data !== null && typeof data === "object") {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (IMAGE_FIELD_KEYS.has(key)) continue
      if (isHeavyString(value)) continue
      result[key] = stripHeavyPayload(value)
    }
    return result as T
  }
  return data
}

export const jsonToFile = (data: unknown) => {
  const jsonString = JSON.stringify(data)
  return new Blob([jsonString], { type: "application/json" })
}

/** 打回时上传的 feedback 列表（剔除图片） */
export const buildFeedbackFile = (feedbackList: unknown[]) => {
  return jsonToFile(stripHeavyPayload(feedbackList))
}

/** 疑问工单上传的 question 列表（剔除图片） */
export const buildQuestionFile = (questionList: unknown[]) => {
  return jsonToFile(stripHeavyPayload(questionList))
}

/** 仅在有文件时 append，避免 append(undefined) 变成字符串 "undefined" */
export const appendJsonFile = (formData: FormData, field: string, blob: Blob | null | undefined, filename: string) => {
  if (blob) {
    formData.append(field, blob, filename)
  }
}
